import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Progress from 'react-native-progress';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import {
  convertImageToBase64,
  isValidImage,
  sortByDesiredOrder,
  truncateText,
  uploadFile,
} from '../utils/utils';
import Toast from 'react-native-toast-message';
import NavigationConstants from '../constants/NavigationConstants';

const DamageRecordingScreen = ({navigation}) => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused();
  const [preview, setPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [isCar, SetIsCar] = useState(false);
  const route = useRoute();
  const data = route.params;
  const [scannedImageData, SetScannedImageData] = useState({});

  // console.log("vehicleinfo",data.vehicleInfo.angleTypes);

  const steps = sortByDesiredOrder(data.vehicleInfo.angleTypes);

  //console.log('vehicleinfor',data.vehicleInfo.id,data.vehicleInfo.client_id)

  const vehicleInfoData = {
    client_id: data.vehicleInfo.client_id,
    vehicle_id: data.vehicleInfo.id,
  };

  // console.log("steps",steps.map(step => step.name))

  const currentStep = steps[currentStepIndex];
  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const nextStep =
    currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

  // const handleImageCapture = async () => {
  //   if (cameraRef.current && isFocused) {
  //     try {
  //       const image = await cameraRef.current.takePhoto();

  //       setPreviewImage('file://' + image.path);
  //       setPreview(true);
  //       convertImageToBase64(image.path)
  //         .then(base64 => {
  //           // Update the state by adding the new object to the array
  //           //   //setBase64Data(prevImageData => [...prevImageData, newImageData]);
  //           isValidImage(currentStep.name, base64).then(response => {
  //             console.log(response[currentStep.name])
  //             if (response[currentStep.name].is_car) {
  //               uploadFile(image.path, currentStep.name, vehicleInfoData)
  //                 .then(responseData => {
  //                   //console.log('response', responseData);

  //                   SetIsCar(true);
  //                   Toast.show({
  //                     type: 'success',
  //                     text1: 'Car Detected',
  //                   });
  //                   //SetScannedImageData(prevImageData => ({ ...prevImageData, [currentStep.name]: base64 }));
  //                   SetScannedImageData(prevImageData => ({ ...prevImageData, [currentStep.name]: responseData.url }));

  //                 })
  //                 .catch(error => {
  //                   console.error('Error:', error);
  //                   // Handle error
  //                 });
  //             } else {
  //               setPreview(false);
  //               Toast.show({
  //                 type: 'error',
  //                 text1: 'Car is not present in the image',
  //               });
  //             }
  //           });
  //         })
  //         .catch(error => {
  //           console.error('Error converting image to base64:', error);
  //         });
  //     } catch (error) {
  //       console.error('Error capturing image:', error);
  //     }
  //   } else {
  //     console.warn('Camera is not focused or not available.');
  //   }
  // };

  const handleImageCapture = async () => {
    if (cameraRef.current && isFocused) {
      try {
         //const image = await cameraRef.current.takePhoto();
        const image = await cameraRef.current.takeSnapshot({
          quality: 100
        })

        setPreviewImage('file://' + image.path);
        setPreview(true);

        // Compress and convert image to base64
        const base64 = await convertImageToBase64(image.path);

        // Call isValidImage and uploadFile in parallel
        const [validationResponse, uploadResponse] = await Promise.all([
          isValidImage(currentStep.name, base64,data.vehicleInfo.assessment_id,),
          uploadFile(image.path, currentStep.name, vehicleInfoData)
        ]);

        if (validationResponse[currentStep.name].is_car) {
          SetScannedImageData(prevImageData => ({ ...prevImageData, [currentStep.name]: uploadResponse.url }));
          console.log("uploadResponse",uploadResponse.url)
          SetIsCar(true);
          Toast.show({
            type: 'success',
            text1: 'Car Detected',
          });
        } else {
          setPreview(false);
          Toast.show({
            type: 'error',
            text1: 'Car is not present in the image',
          });
        }
      } catch (error) {
        console.error('Error capturing image:', error);
      }
    } else {
      console.warn('Camera is not focused or not available.');
    }
  };

  const handleOkay = () => {
    setPreview(false);
    setCapturedImages([...capturedImages, previewImage]);
    moveToNextStep();
    SetIsCar(false);
    // console.log("preview iamge",previewImage)
  };

  const handleCancel = () => {
    SetIsCar(false);
    setPreview(false);
  };

  const moveToNextStep = () => {
    setCurrentStepIndex(prevIndex => Math.min(prevIndex + 1, steps.length - 1));
  };
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [{ photoResolution: 'max' }]);

  if (device == null) return <ActivityIndicator />;

  if (!hasPermission) return <ActivityIndicator />;

  const progress = capturedImages.length / steps.length;

  if (capturedImages.length === steps.length) {

    //console.log("captured images: " + capturedImages)
    const payload = {
      licence_plate: data.vehicleInfo.plateNumber,
      assessment_id:data.vehicleInfo.assessment_id, // Example licence plate
      ...scannedImageData, // Spread the imageData object to include all angle names and base64 images
    };
    navigation.navigate(NavigationConstants.processingScreen, {
      data: payload,
      steps: steps,
    });
  }
  return (
    <>
      {preview ? (
        <>
          <View style={styles.fullImageContainer}>
            <Image source={{uri: previewImage}} style={styles.fullImage} />
            <View style={styles.buttonContainer}>
              {isCar ? (
                <>
                  <TouchableOpacity style={styles.button} onPress={handleOkay}>
                    <Text style={styles.buttonText}>Okay</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.CancelButton}
                    onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                ''
              )}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.container}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            isActive={isFocused && true}
            photo={true}
            device={device}
            photoQualityBalance="speed" 
            format={format}
          />
          <Progress.Bar
            progress={progress}
            style={styles.progressBar}
            width={380}
            height={20}
            borderRadius={50}
            color="#63C85A"
          />
          <View style={styles.stepNameContainer}>
            <Text
              style={prevStep ? styles.PrevStepName : styles.notAvilableStep}>
              {prevStep ? truncateText(prevStep.name) : ''}
            </Text>
            <Text style={[styles.stepName, styles.highlightedStep]}>
              {currentStep.name}
            </Text>
            <Text
              style={nextStep ? styles.NextStepName : styles.notAvilableStep}>
              {nextStep ? truncateText(nextStep.name) : ''}
            </Text>
          </View>
          <View style={styles.overlayContainer}>
            <Image
              source={{uri: currentStep.overlay_image_path}}
              style={styles.overlayImage}
            />
          </View>
          <TouchableOpacity
            style={styles.captureButton}
            disabled={capturedImages.length === steps.length}
            onPress={handleImageCapture}></TouchableOpacity>
        </View>
      )}
      <Toast
        position="top"
        bottomOffset={20}
        visibilityTime={2000}
        autoHide={true}
      />
    </>
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
    paddingVertical: 20,
    paddingHorizontal: 7,
    backgroundColor: '#CED5DB',
    margin: 1,
    width: '50%',
    textAlign: 'center',
    color: '#000',
  },
  NextStepName: {
    fontSize: 10,
    fontWeight: 'normal',
    borderBottomRightRadius: 90,
    borderTopRightRadius: 90,
    paddingVertical: 20,
    backgroundColor: '#CED5DB',
    margin: 1,
    width: '25%',
    textAlign: 'center',
    color: '#000',
  },

  PrevStepName: {
    fontSize: 10,
    fontWeight: 'normal',
    borderBottomLeftRadius: 90,
    borderTopLeftRadius: 90,
    paddingVertical: 20,
    backgroundColor: '#CED5DB',
    margin: 1,
    width: '25%',
    textAlign: 'center',
    color: '#000',
  },
  highlightedStep: {
    backgroundColor: '#5E9FE4',
  },
  notAvilableStep: {
    backgroundColor: 'transparent',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 50,
    margin: 0.2,
    width: 100,
    textAlign: 'center',
    color: '#000',
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
    //transform: [{rotate: '90deg'}],
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
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
  previewImage: {
    width: '100%',
    height: '100%',
    marginHorizontal: 5,
  },
  progressBar: {
    position: 'absolute',
    top: 20,
  },
  fullImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '80%',
    position: 'absolute',
    bottom: 20,
  },
  button: {
    backgroundColor: '#1631C2',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  CancelButton: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#F30000',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default DamageRecordingScreen;
