import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  PixelRatio,
  StyleSheet,
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
import RotatePhoneScreen from '../components/RotatePhoneScreen';
import NavigationConstants from '../constants/NavigationConstants';
import {useIsFocused, useRoute} from '@react-navigation/native';
import { downloadModelFile, getModelUrl, performInference } from '../utils/carDetectionInference';
import RNFS from 'react-native-fs';
import { ACTION_POST_INFERENCE_REQUEST } from '../store/constants';
import { useDispatch } from 'react-redux';

const DamageRecordingScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const {hasPermission, requestPermission} = useCameraPermission();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const cameraRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const route = useRoute();
  const data = route.params;
  const [scannedImageData, SetScannedImageData] = useState([]);
  const [scannedImageDataLocal, SetScannedImageDataLocal] = useState({});
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [isPortrait, setIsPortrait] = useState(
    dimensions.height > dimensions.width,
  );
  const [processingText, setProcessingText] = useState('Processing Image');
  const dispatch = useDispatch();

  const modelDownload = async () => {
let modelUrl
let localModelPath
    try {
      let start = Date.now();

      modelUrl = getModelUrl('model/11_last.onnx');
     localModelPath = `${RNFS.DocumentDirectoryPath}/11_last.onnx`;
     //@ts-ignore
    await downloadModelFile(modelUrl, localModelPath);
    let timeTaken = Date.now() - start;
    console.log("Total time taken : " + timeTaken + " milliseconds");
      
    } catch (error) {
      const err= `${error}+error`
      Toast.show({
        type: 'error',
        text1:err
      });
    }
    };
  useEffect(() => {
    const handleOrientationChange = ({window}) => {
      setDimensions(window);
      setIsPortrait(window.height > window.width);
    };

    const orientationChangeListener = Dimensions.addEventListener(
      'change',
      handleOrientationChange,
    );

    if (!hasPermission) {
      requestPermission();
    }

    modelDownload()

    return () => {
      orientationChangeListener?.remove();
    };
  }, [hasPermission]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingText((prev) =>
        prev.endsWith('.....') ? 'Processing Image' : `${prev}.`
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  //console.log("vehicle infor",data.vehicleInfo.id)


  // const handleInferenceRequest = (data: any) => {
  //   console.log(data)
  // }
  const checkAndNavigateToProcessingScreen = () => {
    if (capturedImages.length === steps.length) {
      // const payloadForNextScreen = {
      //   vehicle_id: data.vehicleInfo.id,
      //   client_id: data.vehicleInfo.client_id,
      //   assessment_id: data.vehicleInfo.assessment_id,
      //   scanned_images: scannedImageData,
      //   scannedImageUrlsLocal: scannedImageDataLocal,
      // };
      const timestamp = Date.now();
      const startTime = new Date().toISOString()
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  const latitude=37.7749
  const longitude=-122.4194
  const referenceNumber = `REF-${timestamp}-${randomNumber}`

  // const payloadData ={
  //   vehicle_id: data.vehicleInfo.id,
  //   client_id: data.vehicleInfo.client_id,
  //   scanned_images: scannedImageData,
  //   reference_number:referenceNumber,
  //   startTime: startTime,
  //   latitude: latitude,
  //   longitude: longitude,
  //   status:"Initialize",
  //   createdBy_id: '3b2d3e5d-4c70-4d4e-9ea7-3d3d29f609b9',
  // }
  //     const payload = {
  //       data: payloadData,
  //       callback: handleInferenceRequest,
  //     };
     
      const payloadForApiCallAndNextScreen ={
        vehicle_id:data.vehicleInfo.id,
        client_id: data.vehicleInfo.client_id,
        scanned_images: scannedImageData,
        scannedImageUrlsLocal: scannedImageDataLocal,
        reference_number:referenceNumber,
        startTime: startTime,
        latitude: latitude,
        longitude: longitude,
        status:"Initialize",
        createdBy_id: '3b2d3e5d-4c70-4d4e-9ea7-3d3d29f609b9',


      }


      //dispatch({ type: ACTION_POST_INFERENCE_REQUEST, payload });
      navigation.navigate(NavigationConstants.processingScreen, {
        data: payloadForApiCallAndNextScreen,
        steps: steps,
      });
    }
  };

  useEffect(() => {
    checkAndNavigateToProcessingScreen()
  }, [capturedImages, data.vehicleInfo.plateNumber, data.vehicleInfo.assessment_id, navigation, scannedImageData, scannedImageDataLocal]);


  const vehicleInfoData = {
    client_id: data.vehicleInfo.client_id,
    vehicle_id: data.vehicleInfo.id,
  };

  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [{photoResolution: 'max'}]);
  const steps = sortByDesiredOrder(data.vehicleInfo.angleTypes);
  const currentStep = steps[currentStepIndex];
  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const nextStep =
    currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;
  const progress = capturedImages.length / steps.length;

  const handleImageCapture = async () => {
    if (cameraRef.current && isFocused) {
      try {
        const image = await cameraRef.current.takeSnapshot({quality: 100});
        setPreviewImage('file://' + image.path);
        setPreview(true);
        //const base64 = await convertImageToBase64(image.path);
        const [validationResponse, base64Image] = await Promise.all([
          performInference(currentStep.name,image.path),
          convertImageToBase64(image.path),
        ]);
        if (validationResponse) {
          //@ts-ignore
          SetScannedImageData(prevData => [
            ...prevData,
            { [currentStep.name]: base64Image}
          ]);
          SetScannedImageDataLocal(prevImageData => ({
            ...prevImageData,
            [currentStep.name]: 'file://' + image.path,
          }));
          setPreview(false);
          setCapturedImages([...capturedImages, previewImage]);
          moveToNextStep();
          Toast.show({
            type: 'success',
            text1: 'Vehicle angle is correct',
          });
          //checkAndNavigateToProcessingScreen();

        } else {
          setPreview(false);
          Toast.show({
            type: 'error',
            text1: 'Vehicle angle is not correct',
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: `${error}`,
        });
        console.log('Error capturing image:', error);
      }
    } else {
      console.log('Camera is not focused or not available');
    }
  };

  const moveToNextStep = () => {
    setCurrentStepIndex(prevIndex => Math.min(prevIndex + 1, steps.length - 1));
  };

  if (device == null || !hasPermission) {
    return <ActivityIndicator />;
  }





  const wp = widthPercent =>
    PixelRatio.roundToNearestPixel(
      (dimensions.width * parseFloat(widthPercent)) / 100,
    );
  const hp = heightPercent =>
    PixelRatio.roundToNearestPixel(
      (dimensions.height * parseFloat(heightPercent)) / 100,
    );

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      {!preview ? (
        <>
          <Camera
            ref={cameraRef}
            style={{flex: 1, width: '100%', height: '100%'}}
            isActive={isFocused && true}
            photo={true}
            device={device}
            photoQualityBalance="speed"
            format={format}
          />
          {!isPortrait && (
            <>
            <View style={{position: 'absolute', alignItems: 'center',left: hp('2%'),transform: [{rotate: '-90deg'}]}}>
              <Progress.Bar
                progress={progress}
                style={{position: 'absolute', top: hp('4%')}}
                width={wp('40%')}
                height={hp('6%')}
                borderRadius={hp('5%')}
                color="#63C85A"
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  top: hp('12%'),
                }}>
                <Text
                  style={
                    prevStep
                      ? {
                          fontSize: wp('1.8%'),
                          fontWeight: 'normal',
                          borderBottomLeftRadius: hp('4.5%'),
                          borderTopLeftRadius: hp('4.5%'),
                          paddingVertical: hp('2.5%'),
                          backgroundColor: '#CED5DB',
                          margin: 1,
                          width: wp('11%'),
                          textAlign: 'center',
                          color: '#000',
                        }
                      : {
                          backgroundColor: 'transparent',
                          fontSize: wp('3%'),
                          fontWeight: 'bold',
                          padding: wp('2%'),
                          borderRadius: wp('10%'),
                          margin: 0.2,
                          width: wp('11%'),
                          textAlign: 'center',
                          color: '#000',
                        }
                  }>
                  {prevStep ? truncateText(prevStep.name) : ''}
                </Text>
                <Text
                  style={[
                    {
                      fontSize: wp('1.8%'),
                      fontWeight: 'bold',
                      paddingVertical: hp('2.5%'),
                      paddingHorizontal: wp('2%'),
                      backgroundColor: '#5E9FE4',
                      margin: 1,
                      width: wp('18%'),
                      textAlign: 'center',
                      color: '#000',
                    },
                  ]}>
                  {currentStep.name}
                </Text>
                <Text
                  style={
                    nextStep
                      ? {
                          fontSize: wp('1.8%'),
                          fontWeight: 'normal',
                          borderBottomRightRadius: hp('4.5%'),
                          borderTopRightRadius: hp('4.5%'),
                          paddingVertical: hp('2.5%'),
                          backgroundColor: '#CED5DB',
                          margin: 1,
                          width: wp('11%'),
                          textAlign: 'center',
                          color: '#000',
                        }
                      : {
                          backgroundColor: 'transparent',
                          fontSize: wp('3%'),
                          fontWeight: 'bold',
                          padding: wp('2%'),
                          borderRadius: wp('10%'),
                          margin: 0.2,
                          width: wp('11%'),
                          textAlign: 'center',
                          color: '#000',
                        }
                  }>
                  {nextStep ? truncateText(nextStep.name) : ''}
                </Text>
              </View>
              </View>
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  justifyContent: 'center',
                  alignItems: 'center',
                  top: hp('22%'),
                }}>
                <Image
                  source={{uri: currentStep.overlay_image_path}}
                  style={{
                    width: wp('100%'),
                    height: hp('55%'),
                    resizeMode: 'contain',
                    tintColor: 'white',
                  }}
                />
              </View>
              <TouchableOpacity
                style={{
                  width: wp('10%'),
                  height: wp('10%'),
                  borderRadius: wp('20%'),
                  backgroundColor: '#fff',
                  position: 'absolute',
                  right: hp('6%'),
                }}
                disabled={capturedImages.length === steps.length || isPortrait}
                onPress={handleImageCapture}
              />
            </>
          )}
          {isPortrait && <RotatePhoneScreen />}
        </>
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image
            source={{uri: previewImage}}
            style={{
              width: wp('100%'),
              height: hp('100%'),
              resizeMode: 'contain',
            }}
          />
          <View
        style={{
          position: 'absolute',
          bottom: hp('10%'),
          //right: '35%',
          //transform: [{ translateX: -wp('25%') }, { translateY: -hp('2.5%') }],
          //backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: wp('2%'),
          borderRadius: wp('1%'),
        }}
      >
        <Text
          style={{
            color: '#5E9FE4',
            fontSize: wp('3%'),
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {processingText}
        </Text>
      </View>
        </View>
      )}
      <Toast
        position="top"
        bottomOffset={20}
        visibilityTime={2000}
        autoHide={true}
      />
    </View>
  );
};

export default DamageRecordingScreen;
