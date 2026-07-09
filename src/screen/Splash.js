import { 
  StyleSheet, 
  ImageBackground, 
  Alert, 
  Linking 
} from 'react-native'

import React, { useEffect } from 'react'
import { moderateScale } from '../components/Responsive'
import { SafeAreaView } from 'react-native-safe-area-context'
import VersionCheck from 'react-native-version-check'


const Splash = ({ navigation }) => {

  console.log("splash...")


  useEffect(() => {
    checkForUpdate()
  }, [])


  const checkForUpdate = async () => {

    try {

      const currentVersion = VersionCheck.getCurrentVersion()

      const latestVersion = await VersionCheck.getLatestVersion({
        provider: 'playStore'
      })


      console.log("Current Version:", currentVersion)
      console.log("Play Store Version:", latestVersion)


      if (latestVersion > currentVersion) {

        Alert.alert(
          "Update Available",
          "A new version of FirstConnect is available. Please update now.",
          [
            {
              text: "Update Now",
              onPress: () => openPlayStore()
            }
          ],
          {
            cancelable: false
          }
        )

      } else {

        goToHome()

      }


    } catch (error) {

      console.log("Update check error:", error)

      // if check fails continue app
      goToHome()

    }

  }


  const openPlayStore = () => {

    Linking.openURL(
      "https://play.google.com/store/apps/details?id=com.firstconnect"
    )

  }


  const goToHome = () => {

    setTimeout(() => {
      navigation.replace('Home')
    }, 2000)

  }



  return (

    <SafeAreaView style={{flex:1}}>

      <ImageBackground

        source={require('../assets/images/Splash.png')}

        style={styles.container}

        resizeMode="cover"

      />

    </SafeAreaView>

  )

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center'

  }

})


export default Splash