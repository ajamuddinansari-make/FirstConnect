import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { moderateScale } from '../components/Responsive';


const Splash = ({ navigation }) => {


  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Home")
    }, 2000);

    return () => clearTimeout(timer)
  }, [navigation])



  return (
    <View style={styles.container}>
      <Text style={styles.text}>FirstConnect</Text>
    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50'
  },
  text: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#fff'
  }


})


export default Splash

