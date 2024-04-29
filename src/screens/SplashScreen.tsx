import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import VerifaiSafeAreaView from '../components/VerifaiSafeAreaView';




function SplashScreen(): React.JSX.Element {
    return (
        <VerifaiSafeAreaView bgColor={"white"}>
          <View style={styles.container}>
            <Image source={require('../../assets/images/logo.png')} />
            {/* <ActivityIndicator
              size="large"
              color={"red"}
            /> */}
            <Text style={styles.text}>VerifAI</Text>
          </View>
        </VerifaiSafeAreaView>
      );
}

const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    text:{
        color:'black',
        fontSize:20
    }
  });

export default SplashScreen;
