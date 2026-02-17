import { Text, StyleSheet, ImageBackground } from 'react-native'
import React, { useEffect } from 'react'
import { moderateScale } from '../components/Responsive'
import { SafeAreaView } from 'react-native-safe-area-context'

const Splash = ({ navigation }) => {

  console.log("splash...")


  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home')
    }, 3000) // 3 seconds

    return () => clearTimeout(timer)
  }, [navigation])

  return (
    <SafeAreaView>
      <ImageBackground
        source={require('../assets/images/Splash.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* Optional Text or Logo */}
        {/* <Text style={styles.text}>FirstConnect</Text> */}
      </ImageBackground>
    </SafeAreaView>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  text: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#fff'
  }
})

export default Splash
