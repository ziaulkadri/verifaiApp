import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet,Image } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../utils/Responsiveness';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { damageDetection, generateUUID } from '../utils/utils';
import NavigationConstants from '../constants/NavigationConstants';
import { ActivityIndicator } from 'react-native-paper';
import Orientation, { OrientationType } from 'react-native-orientation-locker';
import CarDetection from '../components/CarDetection';

const ProcesssingScreen = ({navigation}) => {


    const route = useRoute();
    const data = route.params
    const isFocused = useIsFocused();
    const [processingText, setProcessingText] = useState('Processing');


// const id = generateUUID(5);
//   console.log(id)



// useEffect(() => {
//   if (isFocused) {
//     Orientation.lockToPortrait();
//   } 
// }, [isFocused]);

// useEffect(() => {
//   const interval = setInterval(() => {
//     setProcessingText((prev) =>
//       prev.endsWith('.....') ? 'Processing' : `${prev}.`
//     );
//   }, 500);

//   return () => clearInterval(interval);
// }, []);

// const payload ={
//   "Back Driver Side Tyre": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540610303/processed/images/BackDriverSideTyre.jpg", 
//   "Back Opposite Side Tyre": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540622288/processed/images/BackOppositeSideTyre.jpg",
//    "Bonnet": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540591704/processed/images/Bonnet.jpg", 
//    "Driver Fender Panel First Door": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540601542/processed/images/DriverFenderPanelFirstDoor.jpg", 
//    "Driver Head Light": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540598435/processed/images/DriverHeadLight.jpg", 
//    "Driver Second Door Quarter Panel": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540607406/processed/images/DriverSecondDoorQuarterPanel.jpg",
//     "Driver Tail Light": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540613488/processed/images/DriverTailLight.jpg",
//      "Front Driver Side Tyre": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540604350/processed/images/FrontDriverSideTyre.jpg",
//       "Front Opposite Side Tyre": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540631136/processed/images/FrontOppositeSideTyre.jpg", 
//       "Opposite Fender Panel First Door": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540628087/processed/images/OppositeFenderPanelFirstDoor.jpg",
//        "Opposite Head Light": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540634310/processed/images/OppositeHeadLight.jpg", 
//        "Opposite Second Door Quarter Panel": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540625126/processed/images/OppositeSecondDoorQuarterPanel.jpg",
//         "Opposite Tail Light": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540619479/processed/images/OppositeTailLight.jpg", 
//         "Trunk": "https://verifaistor.blob.core.windows.net/verifai/data/b3638d91-b352-41c1-956d-72845341e30e/311402c5-bb16-4eac-af9d-ac5cbad127c6/1716540616520/processed/images/Trunk.jpg",
//          "assessment_id": "JERBElcN4R", 
//          "licence_plate": "TS09SE9994"
        
// }


// const payload={
//   licence_plate: data.data.licence_plate,
//   assessment_id: data.data.assessment_id,
//   ...data.data.scannedImageUrls
// }

    // useEffect(() => {
    //     if (data.data.licence_plate) {
    //       console.log("API call", data.data.assessment_id, data.data.licence_plate);
          
    //       damageDetection(payload)
    //         .then((response) => {
    //             navigation.navigate(NavigationConstants.damageResponseViewScreen, { payload:payload,scannedImageLocal:data.data.scannedImageLocal,response:response })
    //        })
    //         .catch((error) => {
    //           console.error("Error in detecting damages", error);
    //         });
    //     }
    //   }, [data.data?.licence_plate]);

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <CarDetection/>
       {/* <ActivityIndicator size={100} color="#1631C2" />
      <Text style={styles.processingText}>{processingText}</Text>
      <Text style={styles.assessmenText}>{`Assessment ID: ${data.data.assessment_id}`}</Text> */}
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
    marginTop:wp('10%')
  },
  assessmenText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1631C2',
    marginTop:wp('10%')
  },
});

export default ProcesssingScreen;
