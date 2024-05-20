import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet,Image } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../utils/Responsiveness';
import { useRoute } from '@react-navigation/native';
import { damageDetection, generateUUID } from '../utils/utils';
import NavigationConstants from '../constants/NavigationConstants';

const ProcesssingScreen = ({navigation}) => {


    const route = useRoute();
    const data = route.params
//console.log("data",data.data)
// const id = generateUUID(5);
//   console.log(id)

//   data.data = {
//     ...data.data,
//     assessment_id: id
//   }
// const data ={
//   data:{
//     "Back Driver Side Tyre": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182058783/processed/images/BackDriverSideTyre.jpg"
//   , "Back Opposite Side Tyre": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182110264/processed/images/BackOppositeSideTyre.jpg"
//   , "Bonnet": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716181970822/processed/images/Bonnet.jpg"
//   , "Driver Fender Panel First Door": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182024884/processed/images/DriverFenderPanelFirstDoor.jpg"
//   , "Driver Head Light": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182016701/processed/images/DriverHeadLight.jpg"
//   , "Driver Second Door Quarter Panel": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182041391/processed/images/DriverSecondDoorQuarterPanel.jpg"
//   , "Driver Tail Light": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182072085/processed/images/DriverTailLight.jpg"
//   , "Front Driver Side Tyre": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182032991/processed/images/FrontDriverSideTyre.jpg"
//   , "Front Opposite Side Tyre": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182150660/processed/images/FrontOppositeSideTyre.jpg"
//   , "Opposite Fender Panel First Door": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182139588/processed/images/OppositeFenderPanelFirstDoor.jpg"
//   , "Opposite Head Light": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182161782/processed/images/OppositeHeadLight.jpg"
//   , "Opposite Second Door Quarter Panel": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182124744/processed/images/OppositeSecondDoorQuarterPanel.jpg"
//   , "Opposite Tail Light": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182098445/processed/images/OppositeTailLight.jpg"
//   , "Trunk": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716182085779/processed/images/Trunk.jpg"
//   , "assessment_id": `${id}`, "licence_plate": "TS09SE9994"
// }
// }


    useEffect(() => {
        if (data.data.licence_plate) {
          console.log("API call", data.data.assessment_id, data.data.licence_plate);
          
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
