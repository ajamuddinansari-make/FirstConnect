import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import MainNavigator from './src/navigation/MainNavigator'

const App = () => {


  console.log("React Test-----")
  return (
    // <View>
    //   <Text>Appzzzzz</Text>
    // </View>
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>

  )
}

export default App