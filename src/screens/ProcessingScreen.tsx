import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet,Image, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../utils/Responsiveness';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { damageDetection, generateUUID } from '../utils/utils';
import NavigationConstants from '../constants/NavigationConstants';
import { ActivityIndicator } from 'react-native-paper';
import Orientation, { OrientationType } from 'react-native-orientation-locker';
import { useDispatch } from 'react-redux';
import { ACTION_POST_INFERENCE_REQUEST } from '../store/constants';

const ProcesssingScreen = ({navigation}) => {


    const route = useRoute();
    const data = route.params
    const isFocused = useIsFocused();
    const [processingText, setProcessingText] = useState('Processing');
   const [error, setError] = useState(false)
   const [errorMessage, setErrorMessage] = useState('')
   const dispatch = useDispatch();
   const [assessmentId, setAssessmentId] = useState(null);

   const hasRequestedRef = useRef(true); // Ref to track if the request has been made

   

// const id = generateUUID(5);
//   console.log(id)



useEffect(() => {
  if (isFocused) {
    Orientation.lockToPortrait();
  } 
  console.log(data.data.licence_plate)
}, [isFocused]);

useEffect(() => {
  const interval = setInterval(() => {
    setProcessingText((prev) =>
      prev.endsWith('.....') ? 'Processing' : `${prev}.`
    );
  }, 500);

  return () => clearInterval(interval);
}, []);

// const ApiPayloadData ={
//     vehicle_id: data.data.vehicleInfo.id,
//     client_id: data.data.vehicleInfo.client_id,
//     scanned_images: data.data.scannedImageData,
//     reference_number:data.data.referenceNumber,
//     startTime: data.data.startTime,
//     latitude: data.data.latitude,
//     longitude: data.data.longitude,
//     status:"Initialize",
//     createdBy_id: '3b2d3e5d-4c70-4d4e-9ea7-3d3d29f609b9', 
// }
useEffect(() => {

  if(hasRequestedRef.current){

  
  const handleInferenceRequest = (response:any) => {

    console.log("dispatch api response", response,Object.keys(data.data.scannedImageUrlsLocal).length);
    

    navigation.navigate(NavigationConstants.damageResponseViewScreen, {scannedImageLocal:data.data.scannedImageUrlsLocal,response:response })






    // if (response && response.assessmentId) {
    //   setAssessmentId(response.assessmentId);
    // } else {
    //   setError(true);
    //   setErrorMessage('Failed to get assessment ID');
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Error fetching assessment ID',
    //    // text2: 'Failed to get assessment ID',
    //   });
    // }
  };

  const payloadData ={
    vehicle_id: data.data.vehicle_id,
    client_id: data.data.client_id,
    scanned_images: data.data.scanned_images,
    reference_number:data.data.reference_number,
    startTime: data.data.startTime,
    latitude: data.data.latitude,
    longitude: data.data.longitude,
    status:"Initialize",
    createdBy_id: '3b2d3e5d-4c70-4d4e-9ea7-3d3d29f609b9', 
}

  const payload = {
    data: payloadData,
    callback: handleInferenceRequest,
  };

  dispatch({ type: ACTION_POST_INFERENCE_REQUEST, payload });

  hasRequestedRef.current = false;
}

}, [dispatch, data]);
      const handleRetry = () => {
        navigation.navigate(NavigationConstants.searchVehicleScreen);
      };

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        {error ?(
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{`Failed to do the inference:${errorMessage}`}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) :<><ActivityIndicator size={100} color="#1631C2" />
      <Text style={styles.processingText}>{processingText}</Text>
      {/* <Text style={styles.assessmenText}>{`Assessment ID: ${"data.data.assessment_id"}`}</Text> */}
      </>}
       
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
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1631C2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProcesssingScreen;
