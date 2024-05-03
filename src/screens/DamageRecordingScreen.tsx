import { useIsFocused } from '@react-navigation/native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import { Camera, useCameraDevice, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';
import { heightPercentageToDP } from '../utils/Responsiveness';
const steps = [
  { name: 'Bumper', overlay: require('../../assets/images/suv/back-driver-side-tyre.png') },
  { name: 'Front', overlay: require('../../assets/images/suv/back-opposite-side-tyre.png') },
  { name: 'Back', overlay: require('../../assets/images/suv/bonnet.png') },
  { name: 'Fender', overlay: require('../../assets/images/suv/driver-fender-panel-first-door.png') },
  { name: 'Driver', overlay: require('../../assets/images/suv/driver-head-light.png') },
  { name: 'door', overlay: require('../../assets/images/suv/driver-second-door-quarter-panel.png') },
  { name: 'tail', overlay: require('../../assets/images/suv/driver-tail-light.png') },
  { name: 'frontDriver', overlay: require('../../assets/images/suv/front-driver-side-tyre.png') },
  { name: 'tyre', overlay: require('../../assets/images/suv/front-opposite-side-tyre.png') },
  { name: 'panel', overlay: require('../../assets/images/suv/opposite-fender-panel-first-door.png') },
  { name: 'light', overlay: require('../../assets/images/suv/opposite-head-light.png') },
  { name: 'second', overlay: require('../../assets/images/suv/opposite-second-door-quarter-panel.png') },
  { name: 'opposite', overlay: require('../../assets/images/suv/opposite-tail-light.png') },
  { name: 'trunk', overlay: require('../../assets/images/suv/trunk.png') },
];

const DamageRecordingScreen = () => {
  const {hasPermission,requestPermission} =useCameraPermission()
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused()
  const handleImageCapture = async () => {
    if (cameraRef.current) {
      const image = await cameraRef.current.takePhoto();
     setCapturedImages([...capturedImages, 'file://' + image.path]);
     console.log(image.path)
      moveToNextStep();
    }
  };

  const moveToNextStep = () => {
    setCurrentStepIndex((prevIndex) => Math.min(prevIndex + 1, steps.length - 1));
  };
  useEffect(() => {
    if(!hasPermission){
      requestPermission()
    }
  },[hasPermission])
  
  
  const currentStep = steps[currentStepIndex];
  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

  const device = useCameraDevice('back')

  if (device == null) return <ActivityIndicator />

  if (!hasPermission) return <ActivityIndicator />

   const progress = (capturedImages.length / steps.length) ;

  return (
    <View style={styles.container}>
    

      <Camera
        ref={cameraRef}
        style={styles.camera}
        isActive={isFocused &&true}
        photo={true}
        device={device}
      />
     <Progress.Bar progress={progress} style={styles.progressBar} width={320} height={20} borderRadius={50} color='#63C85A'  />
      <View style={styles.stepNameContainer}>
        <Text style={prevStep ? styles.stepName : styles.notAvilableStep}>{prevStep ? prevStep.name : ''}</Text>
        <Text style={[styles.stepName, styles.highlightedStep]}>{currentStep.name}</Text>
        <Text style={nextStep ? styles.stepName : styles.notAvilableStep}>{nextStep ? nextStep.name : ''}</Text>
      </View>
      {/* Overlay Image */}
      <View style={styles.overlayContainer}>
        <Image source={currentStep.overlay} style={styles.overlayImage} />
      </View>
      {/* Capture Button */}
      <TouchableOpacity style={styles.captureButton} onPress={handleImageCapture}>
      </TouchableOpacity>
      {/* Captured Image Preview */}
      {capturedImages.length === steps.length && (
        <ScrollView style={styles.capturedImagesContainer} horizontal={true}>
          {capturedImages.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.capturedImage} />
          ))}
        </ScrollView>
      )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  stepName: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#CED5DB',
    margin:0.2,
    width: 100,
    textAlign: 'center',
    color:'#000'
  },
  highlightedStep: {
    backgroundColor: '#5E9FE4',
  },
  notAvilableStep:{
    backgroundColor:'transparent',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 50,
    margin:0.2,
    width: 100,
    textAlign: 'center',
    color:'#000'
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    width: '80%',
  },
  button: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    position: "absolute",
    bottom:50,
    alignSelf: "center",
  },
  capturedImagesContainer: {
    marginTop: 20,
    maxHeight: 120, // Set a max height to enable scrolling
  },
  capturedImage: {
    width: 100,
    height: 100,
    marginHorizontal: 5,
  },
  progressBar:{
    position: 'absolute',
    top: 20,
  }
});

export default DamageRecordingScreen;
