import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  ToastAndroid,
  Animated,
  Easing,
  Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
// import { SafeAreaView } from 'react-native';
import { PermissionsAndroid } from 'react-native';


import messaging from '@react-native-firebase/messaging';
import { SafeAreaView } from 'react-native-safe-area-context';




const Home = () => {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(false);



  // useEffect(() => {
  //   requestPermissionAndroid()
  // }, []);

  console.log("first...")



  const requestPermissionAndroid = useCallback(async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // Alert.alert("Permission Granted");
      // getToken();
    } else {
      // Alert.alert("Permission Denied");
    }
  }, []);




  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
  //   });

  //   return unsubscribe;
  // }, []);


  // const getToken = async () => {
  //   const token = await messaging().getToken();
  //   console.log("Token----------", token)
  // }

  const handleBackPress = useCallback(() => {
    if (canGoBack) {
      webViewRef.current.goBack();
      return true;
    }

    if (backPressCount === 0) {
      setBackPressCount(1);
      ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);

      setTimeout(() => setBackPressCount(0), 2000);
      return true;
    }

    BackHandler.exitApp();
    return true;
  }, [canGoBack, backPressCount]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => subscription.remove();
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
    // Disable long press menu
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });

    // Disable text selection
    const style = document.createElement('style');
    style.innerHTML = \`
      * {
        -webkit-user-select: none !important;
        -webkit-touch-callout: none !important;
        user-select: none !important;
      }
    \`;
    document.head.appendChild(style);

    true;
  `;

  return (
    <SafeAreaView style={styles.container}>

      {isLoading && (
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      )}

      <WebView
        ref={webViewRef}
        // mixedContentMode="always"
        source={{ uri: 'https://firstconnectuser.cognigixdemo.com' }}

        // source={{ uri: 'https://firstconnectuser.cognigixdemo.com/user/home' }}

        // source={{ uri: 'https://testlearner.viliyo.com' }}
        style={{ flex: 1 }}
        injectedJavaScriptBeforeContentLoaded={disableLongPressJS}

        javaScriptEnabled={true}
        onLoadProgress={onLoadProgress}
        onNavigationStateChange={(navState) =>
          setCanGoBack(navState.canGoBack)
        }

      // allowingReadAccessToURL={true}
      // allowsInlineMediaPlayback={true}
      // mediaPlaybackRequiresUserAction={false}
      // originWhitelist={['*']}
      // startInLoadingState={true}
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 1,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#2196F3',
  },
});








