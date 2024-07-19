import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  Image as Image1,
  ActivityIndicator,
  Dimensions,
  PixelRatio,
  StyleSheet,
} from 'react-native';
import * as Progress from 'react-native-progress';
import {
  Camera,
  runAtTargetFps,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {
  rotateAndConvertImageToBase64,
  sortByDesiredOrder,
  truncateText,
} from '../utils/utils';
import Toast from 'react-native-toast-message';
import NavigationConstants from '../constants/NavigationConstants';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {ACTION_POST_INFERENCE_REQUEST} from '../store/constants';
import {useDispatch} from 'react-redux';
import {useTensorflowModel} from 'react-native-fast-tflite';
import {Options, useResizePlugin} from 'vision-camera-resize-plugin';
import Orientation from 'react-native-orientation-locker';
import {Worklets} from 'react-native-worklets-core';
type PixelFormat = Options<'uint8'>['pixelFormat'];

const WIDTH = 224;
const HEIGHT = 224;
const TARGET_TYPE = 'uint8' as const;
const TARGET_FORMAT: PixelFormat = 'bgra';
let extractCurrentFrame: boolean = false;
let curentAngleName: string='';
const fps : number = 1;
const DamageRecordingScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const {hasPermission, requestPermission} = useCameraPermission();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const cameraRef = useRef(null);
  const [previewImage, setPreviewImage] = useState('');
  const route = useRoute();
  const data = route.params;
  const [scannedImageData, SetScannedImageData] = useState([]);
  const [scannedImageDataLocal, SetScannedImageDataLocal] = useState({});
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [isPortrait, setIsPortrait] = useState(
    dimensions.height > dimensions.width,
  );
  const dispatch = useDispatch();
  const [accuracy, setAccuracy] = useState(10);
  const [angleName, setAngleName] = useState(' ');
  //const objectDetection = useTensorflowModel(require('../../assets/model/model.tflite'))
  //const model = objectDetection.state === "loaded" ? objectDetection.model : undefined
  const objectDetection = useTensorflowModel(
    require('../../assets/model/11_last_test_background_7_with_splited_modified_model_1_without_cast_fp32.tflite'),
  );
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;
  const {resize} = useResizePlugin();
  const counterRef = useRef(0);
  const [angleColor, setAngleColor] = useState('red'); // Use state for angleColor



  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [{photoResolution: 'max'}]);
  const steps = sortByDesiredOrder(data.vehicleInfo.angleTypes);
  const currentStep = steps[currentStepIndex];
  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const nextStep =
    currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;
  const progress = scannedImageData.length / steps.length;


  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);
  useEffect(() => {
    // Lock the screen to landscape mode
    Orientation.lockToPortrait();

    // Unlock orientation when the component is unmounted
    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);
  useEffect(() => {
    curentAngleName = currentStep.name
  extractCurrentFrame =false
  counterRef.current = 0;
  }, [currentStepIndex]);



  function setAccuracyAndAnglePrediction(maxValue: number, ang: any) {
    const acc = Math.floor(maxValue * 100); 
    setAccuracy(acc);
    setAngleName(ang);

    const alloyAngles = [
        "Right Front Tyre",
        "Right Rear Tyre",
        "Left Rear Tyre",
        "Left Front Tyre"
    ];

    const fenderAndDoorAngles = {
        front: ["Right Front Fender and Door", "Left Front Fender and Door"],
        rear: ["Left Rear Fender and Door", "Right Rear Fender and Door"]
    };

    const normalizeString = (str: string) => str.replace(/\s+/g, '').toLowerCase();
    const isAlloyConditionMet = ang === 'Alloy' && alloyAngles.includes(curentAngleName);

    let isFenderAndDoorConditionMet = false;
    if (ang.includes("Fender and Door")) {
        if (fenderAndDoorAngles.front.includes(curentAngleName) && ang === "Front Fender and Door") {
            isFenderAndDoorConditionMet = true;
        } else if (fenderAndDoorAngles.rear.includes(curentAngleName) && ang === "Rear Fender and Door") {
            isFenderAndDoorConditionMet = true;
        }
    }

    if (normalizeString(curentAngleName) === normalizeString(ang) || isAlloyConditionMet || isFenderAndDoorConditionMet) {
      if (acc < 40) {
        setAngleColor('red'); // Update state
      } else if (acc < 60) {
        setAngleColor('orange'); // Update state
      } else if (acc < 100) {
        setAngleColor('green'); // Update state
      }
      if (acc > 95 && !extractCurrentFrame) {
        counterRef.current += 1;
        if (counterRef.current >= 2) {
          handleImageCapture();
          //angleColor = 'red';
        }
      } else {
        counterRef.current = 0;
      }
    } else {
      counterRef.current = 0;
      setAngleColor('red'); // Update state
          }
  }

  const myFunctionJS = Worklets.createRunOnJS(setAccuracyAndAnglePrediction);

  const softmax = (values: any) => {
    'worklet';
    const expValues = new Float32Array(values.length);
    let sumExpValues = 0;
    for (let i = 0; i < values.length; i++) {
      expValues[i] = Math.exp(values[i]);
      sumExpValues += expValues[i];
    }
    const softmaxValues = new Float32Array(values.length);
    for (let i = 0; i < values.length; i++) {
      softmaxValues[i] = expValues[i] / sumExpValues;
    }
    return softmaxValues;
  };
  function findMaxValueAndIndex(values: any) {
    'worklet';
    let maxValue = values[0];
    let maxIndex = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > maxValue) {
        maxValue = values[i];
        maxIndex = i;
      }
    }

    return {maxValue, maxIndex};
  }
  const postProcessing = useCallback((values: any) => {
    'worklet';
    const softmaxData = softmax(values);
    console.log("softmaxData",softmaxData)
    const {maxValue, maxIndex} = findMaxValueAndIndex(softmaxData);
    // const keys ={0: 'Left Tail Light', 1: 'Right Tail Light', 2: 'Trunk', 3: 'Front', 4: 'Left Head Light', 5: 'Right Side', 6: 'Right Head Light', 7: 'Left Side', 8: 'Alloy'}
    const keys ={0: 'Alloy', 1: 'Front', 2: 'Right Head Light', 3: 'Right Tail Light', 4: 'Front Fender and Door', 5: 'Left Head Light', 6: 'Left Tail Light', 7: 'Rear Fender and Door', 8: 'Trunk'}
    //@ts-ignore
    const maxKey = keys[maxIndex];
    myFunctionJS(maxValue, maxKey);
    console.log('Maximum Value:', maxValue > 0.95 ? true : false, maxValue);
    console.log('Index of Maximum Value:', maxIndex);
    console.log('Key of Maximum Value:', maxKey);
  }, []);


  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      runAtTargetFps(fps, () => {
        'worklet';
        // 1. Resize 4k Frame to 224x224x3 using vision-camera-resize-plugin
        const result = resize(frame, {
          scale: {
            width: WIDTH,
            height: HEIGHT,
          },
          pixelFormat: 'rgb',
          dataType: 'float32',
          //rotation: '90deg',
          //mirror: true,
        });


        if (model != undefined) {
          //@ts-ignore\
          const output = model.runSync([result]);
          const numDetections = output[0];
          console.log(`Detected ${numDetections} objects!`);
          postProcessing(numDetections);
          //et endtime = new Date().getTime();

          //console.log(`Time taken: ${(endtime - startTime) / 1000} seconds`);

        } else {
          console.log('model not loaded');
        }
      });
    },
    [model],
  );

  const checkAndNavigateToProcessingScreen = () => {
    if (scannedImageData.length === steps.length) {
      // const payloadForNextScreen = {
      //   vehicle_id: data.vehicleInfo.id,
      //   client_id: data.vehicleInfo.client_id,
      //   assessment_id: data.vehicleInfo.assessment_id,
      //   scanned_images: scannedImageData,
      //   scannedImageUrlsLocal: scannedImageDataLocal,
      // };
      const timestamp = Date.now();
      const startTime = new Date().toISOString();
      const randomNumber = Math.floor(1000 + Math.random() * 9000);

      const latitude = 37.7749;
      const longitude = -122.4194;
      const referenceNumber = `REF-${timestamp}-${randomNumber}`;

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

      const payloadForApiCallAndNextScreen = {
        //vehicle_id: data.vehicleInfo.id,
        //client_id: data.vehicleInfo.client_id,
        scanned_images: scannedImageData,
        scannedImageUrlsLocal: scannedImageDataLocal,
        //reference_number: referenceNumber,
        //startTime: startTime,
        //latitude: latitude,
        //longitude: longitude,
        //status: 'Initialize',
        //createdBy_id: '3b2d3e5d-4c70-4d4e-9ea7-3d3d29f609b9',
      };

      //dispatch({ type: ACTION_POST_INFERENCE_REQUEST, payload });
      navigation.navigate(NavigationConstants.processingScreen, {
        data: payloadForApiCallAndNextScreen,
        steps: steps,
      });
    }
  };

  useEffect(() => {
    checkAndNavigateToProcessingScreen();
  }, [
    capturedImages,
    data.vehicleInfo.plateNumber,
    data.vehicleInfo.assessment_id,
    navigation,
    scannedImageData,
    scannedImageDataLocal,
  ]);

  const vehicleInfoData = {
    client_id: data.vehicleInfo.client_id,
    vehicle_id: data.vehicleInfo.id,
  };

  const handleImageCapture = async () => {
    if (cameraRef.current && isFocused) {
      try {
        const image = await cameraRef.current.takeSnapshot({quality: 100});


        console.log("image orientation",image.height,image.width)


      const base64Image = await rotateAndConvertImageToBase64('file://' + image.path,image.width,image.height);

      console.log("base64came",base64Image?.slice(0, 10))
        setPreviewImage('file://' + image.path);
        //setPreview(true);
        //const base64Image = await convertImageToBase64(image.path);
        // const [base64Image] = await Promise.all([
        //  // performInference(currentStep.name, image.path),
        //   convertImageToBase64(image.path),
        // ]);
        if (base64Image) {
          //@ts-ignore
          SetScannedImageData(prevData => [
            ...prevData,
            {[curentAngleName]: base64Image},
          ]);
          SetScannedImageDataLocal(prevImageData => ({
            ...prevImageData,
            [curentAngleName]: 'file://' + image.path,
          }));
         // setPreview(false);
          setCapturedImages([...capturedImages, previewImage]);
          extractCurrentFrame=true
          //moveToNextStep();
         setCurrentStepIndex(prevIndex => Math.min(prevIndex + 1, steps.length - 1));
          Toast.show({
            type: 'success',
            text1: 'Vehicle angle is correct',
          });
          //angleColor = 'red'
          //checkAndNavigateToProcessingScreen();
          setAngleColor('red'); // Update state

        } //else {
          //setPreview(false);
          // Toast.show({
          //   type: 'error',
          //   text1: 'Vehicle angle is not correct',
          // });
        //}
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
      <Camera
        ref={cameraRef}
        style={{flex: 1, width: '100%', height: '100%'}}
        isActive={isFocused && true}
        photo={true}
        device={device}
        photoQualityBalance="speed"
        format={format}
       frameProcessor={frameProcessor}
      />
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          left: hp('19%'),
          transform: [{rotate: '90deg'}],
          // borderWidth: 2,
          // borderColor: 'rgba(255, 255, 255, 0.4)',
           height: hp('10%'), 
          width: wp('100%'), //'100%',
          padding:hp('1%'),
         // backgroundColor: 'rgba(0, 0, 0, 0.1)',
        }}>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            //position: 'absolute',
            //top: hp('10%'),
            //marginTop: hp('2%'),
          }}>
          <Text
            style={
              prevStep
                ? {
                    fontSize: wp('3.5%'),
                    fontWeight: 'normal',
                    //borderBottomLeftRadius: hp('4.5%'),
                    borderTopLeftRadius: hp('4.5%'),
                    paddingVertical: hp('1%'),
                    backgroundColor: '#E9ECEF',
                    //margin: 1,
                    width: wp('24%'),
                    color: '#6C757D',
                    borderColor: '#000',
                    borderWidth: 1,
                    height:hp('6%'),
                    textAlign: 'center',
                    

                  }
                : {
                  fontSize: wp('3.5%'),
                    fontWeight: 'normal',
                    //borderBottomLeftRadius: hp('4.5%'),
                    borderTopLeftRadius: hp('4.5%'),
                    paddingVertical: hp('1%'),
                    backgroundColor: '#E9ECEF',
                    //margin: 1,
                    width: wp('24%'),
                    textAlign: 'center',
                    color: '#6C757D',
                    borderColor: '#000',
                    borderWidth: 1,
                    height:hp('6%'),

                  }
            }>
            {prevStep ? truncateText(prevStep.name) : '-'}
          </Text>
          <Text
          //numberOfLines={1}
            style={[
              {
                fontSize: wp('3.5%'),
                fontWeight: 'bold',
                paddingVertical: hp('1%'),
                paddingHorizontal: wp('2%'),
                backgroundColor: '#007BFF',
                //margin: 1,
                width: wp('32%'),
                textAlign: 'center',
                color: '#FFFFFF',
                borderColor: '#000',
                borderWidth: 1,
                height:hp('6%'),
                
              },
            ]}>
            {currentStep.name}
          </Text>
          <Text
            style={
              nextStep
                ? {
                    fontSize: wp('3.5%'),
                    fontWeight: 'normal',
                    //borderBottomRightRadius: hp('4.5%'),
                    borderTopRightRadius: hp('4.5%'),
                    paddingVertical: hp('1%'),
                    backgroundColor: '#F8F9FA',
                    //margin: 1,
                    width: wp('24%'),
                    textAlign: 'center',
                    color: '#6C757D',
                    borderColor: '#000',
                    borderWidth: 1,
                    height:hp('6%'),

                  }
                : {
                  fontSize: wp('3.5%'),
                  fontWeight: 'normal',
                 // borderBottomRightRadius: hp('4.5%'),
                  borderTopRightRadius: hp('4.5%'),
                  paddingVertical: hp('1%'),
                  backgroundColor: '#F8F9FA',
                  //margin: 1,
                  width: wp('24%'),
                  textAlign: 'center',
                  color: '#6C757D',
                  borderColor: '#000',
                  borderWidth: 1,
                  height:hp('6%'),

                  }
            }>
            {nextStep ? truncateText(nextStep.name) : '-'}
          </Text>
        </View>
        <Progress.Bar
          progress={progress}
          style={{borderBottomRightRadius: hp('4.5%'),borderBottomLeftRadius: hp('4.5%'),marginTop: hp('-0.2%'),borderColor: '#000',borderWidth: 1}}
          width={wp('79.9%')}
          height={hp('1.8%')}
          //borderRadius={hp('5%')}
          color="#63C85A"
        />
      </View>
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center',
          alignItems: 'center',
          //top: hp('10%'),
          transform: [{rotate: '90deg'}],
          right: hp('11%'),
        }}>
        <Image1
          source={{uri: currentStep.overlay_image_path}}
          style={{
            width: wp('135%'),
            height: hp('50%'),
            resizeMode: 'contain',
            tintColor: angleColor
          }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          top: hp('7%'),
          right: hp('25%'),
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: hp('1%'),
          padding: hp('1%'),
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.4)',
          transform: [{rotate: '90deg'}],
          height: hp('15%'),
          width: wp('52%'),
        }}>
        {/* <Progress.Bar
          progress={accuracy / 100}
          style={{position: 'absolute', top: hp('2%')}}
          width={wp('60%')}
          height={hp('3%')}
          borderRadius={hp('5%')}
          color={getAccuracyColor()}
        /> */}
        <View
          style={{
            alignItems: 'flex-start',
            justifyContent: 'center',
            marginTop: hp('1%'),
          }}>
          <Text
            style={{fontSize: hp('1.5%'), color: 'white', marginBottom: hp('1%')}}>
            Accuracy: {accuracy}%
          </Text>
          <Text
            style={{fontSize: hp('1.5%'), color: 'white', marginBottom: hp('1%')}}>
            Angle Name: {angleName}
          </Text>
          <Text style={{fontSize: hp('1.5%'), color: 'white',marginBottom: hp('1%')}}>
            Accepted Accurary: 95%
          </Text>
          <Text style={{fontSize: hp('1.5%'), color: 'white'}}>
            Frame Rate: {fps}
            
          </Text>
        </View>
      </View>

      {/* <TouchableOpacity
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
              /> */}
      <Toast
        position="top"
        bottomOffset={20}
        visibilityTime={2000}
        autoHide={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  canvasWrapper: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
});

export default DamageRecordingScreen;
