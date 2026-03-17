import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  ToastAndroid,
  Animated,
  Easing,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { WebView } from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [isTokenSent, setIsTokenSent] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  
  useEffect(() => {
    async function initNotifications() {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }

      await createNotificationChannel();
      await getFCMToken();
    }

    initNotifications();
  }, []);

  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      setFcmToken(token);
    } catch (error) {
      console.log('FCM token error:', error);
    }
  };

  const createNotificationChannel = async () => {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  };


  useEffect(() => {
    if (userId && fcmToken && !isTokenSent) {
      sendFcmTokenToBackend(userId, fcmToken);
    }
  }, [userId, fcmToken, isTokenSent]);

  const sendFcmTokenToBackend = async (userId, token) => {
    try {
      const response = await fetch(
        'https://firstconnectbackend.cognigix.com/api/addFcmToken',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appData: { USER_ID: userId, FCM_TOKEN: token },
          }),
        }
      );
      const data = await response.json();
      console.log('FCM token sent to backend:', data);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      setIsTokenSent(true);
    } catch (error) {
      console.log('Error sending FCM token:', error);
    }
  };


  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      try {
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || '',
          android: { channelId: 'default', smallIcon: 'ic_launcher' },
        });
      } catch (error) {
        console.log('Foreground notification error:', error);
      }
    });
    return unsubscribe;
  }, []);


  useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      const url = remoteMessage.data?.url;
      if (url) webViewRef.current?.injectJavaScript(`window.location.href = "${url}";`);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      const url = remoteMessage?.data?.url;
      if (url) webViewRef.current?.injectJavaScript(`window.location.href = "${url}";`);
    });
  }, []);

 
  const handleBackPress = useCallback(() => {
    if (canGoBack) {
      webViewRef.current.goBack();
      return true;
    }
    if (backPressCount === 0) {
      setBackPressCount(1);
      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      setTimeout(() => setBackPressCount(0), 2000);
      return true;
    }
    BackHandler.exitApp();
    return true;
  }, [canGoBack, backPressCount]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => sub.remove();
  }, [handleBackPress]);


  const onLoadProgress = ({ nativeEvent }) => {
    const progressValue = nativeEvent.progress;
    setIsLoading(progressValue < 1);
    Animated.timing(progress, {
      toValue: progressValue,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const disableLongPressJS = `
    document.addEventListener('contextmenu', e => e.preventDefault());
    const style = document.createElement('style');
    style.innerHTML = '* { -webkit-user-select: none !important; -webkit-touch-callout: none !important; user-select: none !important; }';
    document.head.appendChild(style);
    true;
  `;

  const handleNavigationChange = navState => {
    setCanGoBack(navState.canGoBack);
    if (navState.url.includes('/user/home')) {
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(`
          (function() {
            try {
              var appState = localStorage.getItem('app-state');
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'APP_STATE', value: appState }));
            } catch (e) {}
          })();
          true;
        `);
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: 'https://firstconnectuser.cognigixdemo.com' }}
        style={{ flex: 1 }}
        injectedJavaScriptBeforeContentLoaded={disableLongPressJS}
        javaScriptEnabled
        onLoadProgress={onLoadProgress}
        onNavigationStateChange={handleNavigationChange}
        onMessage={event => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'APP_STATE') {
              const parsed = JSON.parse(data.value);
              setUserId(parsed?.auth?.UDID);
            }
          } catch (error) {
            console.log('WebView message error:', error);
          }
        }}
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressBar: { height: 3, backgroundColor: '#2196F3' },
});