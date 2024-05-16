import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet,Image } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../utils/Responsiveness';
import { useRoute } from '@react-navigation/native';
import { damageDetection } from '../utils/utils';
import NavigationConstants from '../constants/NavigationConstants';

const ProcesssingScreen = ({navigation}) => {


    const route = useRoute();
    const data = route.params





  
    useEffect(() => {
        if (data.data.licence_plate) {
          console.log("API call", data.data);
          
          damageDetection(data?.data)
            .then((response) => {
                navigation.navigate(NavigationConstants.damageResponseViewScreen, { data:data.data,response:response })
            })
            .catch((error) => {
              console.error("Error in detecting damages", error);
            });
        }
      }, [data.data?.licence_plate]);


  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
       <Image style={styles.fleetableImage} source={require('../../assets/images/Loader.png')}/>
      <Text style={styles.processingText}>Processing...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1631C2',
  },
  upperContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  processingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1631C2',
  },
  fleetableImage: {
    width: wp('30%'),
    height: wp('30%'),
    marginBottom: hp('3%'),
  },
});

export default ProcesssingScreen;
