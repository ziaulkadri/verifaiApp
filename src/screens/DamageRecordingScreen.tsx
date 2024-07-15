import React, {useState, useRef, useEffect, useCallback} from 'react';
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
  convertImageToBase64,
  rotateAndConvertImageToBase64,
  sortByDesiredOrder,
  truncateText,
} from '../utils/utils';
import Toast from 'react-native-toast-message';
import NavigationConstants from '../constants/NavigationConstants';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {
  downloadModelFile,
  getModelUrl,
  performInference,
} from '../utils/carDetectionInference';
import RNFS from 'react-native-fs';
import {ACTION_POST_INFERENCE_REQUEST} from '../store/constants';
import {useDispatch} from 'react-redux';
import {useTensorflowModel} from 'react-native-fast-tflite';
import {Options, useResizePlugin} from 'vision-camera-resize-plugin';
import Orientation from 'react-native-orientation-locker';
import {Worklets, useRunOnJS} from 'react-native-worklets-core';
import {Canvas, Image, SkData, SkImage, Skia} from '@shopify/react-native-skia';
import {createSkiaImageFromData} from '../utils/SkiaUtils';
import {useSharedValue} from 'react-native-reanimated';
// import { frameToBase64 } from 'vision-camera-base64';
type PixelFormat = Options<'uint8'>['pixelFormat'];

const WIDTH = 224;
const HEIGHT = 224;
const TARGET_TYPE = 'uint8' as const;
const TARGET_FORMAT: PixelFormat = 'bgra';
let extractCurrentFrame: boolean = false;
let curentAngleName: string='';

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
  const [accuracy, setAccuracy] = useState(10);
  const [angleName, setAngleName] = useState(' ');
  //const objectDetection = useTensorflowModel(require('../../assets/model/model.tflite'))
  //const model = objectDetection.state === "loaded" ? objectDetection.model : undefined
  const objectDetection = useTensorflowModel(
    require('../../assets/model/11_last_modified_model_1_without_cast_fp32.tflite'),
  );
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;
  //console.log("model",model)
  const {resize} = useResizePlugin();
  const previewImage1 = useSharedValue<SkImage | null>(null);
  const counterRef = useRef(0);



  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [{photoResolution: 'max'}]);
  const steps = sortByDesiredOrder(data.vehicleInfo.angleTypes);
  const currentStep = steps[currentStepIndex];
  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const nextStep =
    currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;
  const progress = capturedImages.length / steps.length;



  //console.log("modelNrew",model)
  const modelDownload = async () => {
    let modelUrl;
    let localModelPath;
    try {
      let start = Date.now();

      modelUrl = getModelUrl('model/11_last.onnx');
      localModelPath = `${RNFS.DocumentDirectoryPath}/11_last.onnx`;
      //@ts-ignore
      await downloadModelFile(modelUrl, localModelPath);
      let timeTaken = Date.now() - start;
      console.log('Total time taken : ' + timeTaken + ' milliseconds');
    } catch (error) {
      const err = `${error}+error`;
      Toast.show({
        type: 'error',
        text1: err,
      });
    }
  };
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
    console.log("------------------------", currentStepIndex, currentStep.name, "------------------------");

    curentAngleName = currentStep.name
  extractCurrentFrame =false
  counterRef.current = 0;

  }, [currentStepIndex]);



  function setAccuracyAndAnglePrediction(maxValue: number, ang: any) {
    const acc = Math.floor(maxValue * 100); // This will give you 34 for 34.23521512353%
    setAccuracy(acc);
    setAngleName(ang);

     //console.log("------------------------",currentStepIndex,currentStep.name, "------------------------",[])

   
    if(curentAngleName === ang && acc > 95 && !extractCurrentFrame){
      counterRef.current += 1;
      console.log("----------Came Here--------------")
      if (counterRef.current >= 5) {
      console.log("------------------------",ang,currentStep.name)
      handleImageCapture()
      //setCurrentStepIndex(prevIndex => Math.min(prevIndex + 1, steps.length - 1));
     // console.log("------------------------",currentStepIndex, "------------------------",[])
    }}else {
      counterRef.current = 0; // reset the counter if condition is not met
  }
    //else if()

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
    //const normalizedValues = normalize(values);
    const softmaxData = softmax(values);
    console.log("softmaxData",softmaxData)
    const {maxValue, maxIndex} = findMaxValueAndIndex(softmaxData);
    const keys ={0: 'Left Tail Light', 1: 'Right Tail Light', 2: 'Trunk', 3: 'Front', 4: 'Left Head Light', 5: 'Right Side', 6: 'Right Head Light', 7: 'Left Side', 8: 'Alloy'}
    //@ts-ignore
    const maxKey = keys[maxIndex];
    
    myFunctionJS(maxValue, maxKey);
    console.log('Maximum Value:', maxValue > 0.95 ? true : false, maxValue);
    console.log('Index of Maximum Value:', maxIndex);
    console.log('Key of Maximum Value:', maxKey);
  }, []);

  // let base64Image;
  // const updatePreviewImageFromData = useRunOnJS(
  //   (data: SkData, pixelFormat: PixelFormat) => {
  //     const image = createSkiaImageFromData(data, WIDTH, HEIGHT, pixelFormat);
  //     previewImage1.value?.dispose();
  //     previewImage1.value = image;
  //     base64Image = image?.encodeToBase64();
  //     console.log("base64Image",base64Image);
  //   },
  //   []
  // );

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      runAtTargetFps(1, () => {
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

        // const data = Skia.Data.fromBytes(result);
        // updatePreviewImageFromData(data, TARGET_FORMAT);
        //data.dispose();
        // const end = performance.now();

        if (model != undefined) {
          //@ts-ignore
          const output = model.runSync([result]);
          const numDetections = output[0];
          console.log(`Detected ${numDetections} objects!`);
          postProcessing(numDetections);
        } else {
          console.log('model not loaded');
        }
      });
    },
    [model],
  );

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
        vehicle_id: data.vehicleInfo.id,
        client_id: data.vehicleInfo.client_id,
        scanned_images: scannedImageData,
        scannedImageUrlsLocal: scannedImageDataLocal,
        reference_number: referenceNumber,
        startTime: startTime,
        latitude: latitude,
        longitude: longitude,
        status: 'Initialize',
        createdBy_id: '3b2d3e5d-4c70-4d4e-9ea7-3d3d29f609b9',
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


        //console.log("image orientation",image.height,image.width)


      // const base64Image = rotateAndConvertImageToBase64('file://' + image.path,image.width,image.height);
        setPreviewImage('file://' + image.path);
        //setPreview(true);
        //const base64 = await convertImageToBase64(image.path);
        const [base64Image] = await Promise.all([
         // performInference(currentStep.name, image.path),
          convertImageToBase64(image.path),
        ]);
        if (base64Image) {
          //@ts-ignore
          SetScannedImageData(prevData => [
            ...prevData,
            {[currentStep.name]: base64Image},
          ]);
          SetScannedImageDataLocal(prevImageData => ({
            ...prevImageData,
            [currentStep.name]: 'file://' + image.path,
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
          //checkAndNavigateToProcessingScreen();
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

  const getAccuracyColor = () => {
    if (accuracy < 40) {
      return 'red';
    } else if (accuracy < 60) {
      return 'orange';
    } else if (accuracy < 100) {
      return 'green';
    } else {
      return 'red'; // Replace 'defaultColor' with the color you want for accuracy >= 99
    }
  };


  // console.log("currentStepName",currentStep.name)
  // console.log('scannedImage',scannedImageData)

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
        //outputOrientation='device'
      />
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          right: hp('1%'),
          transform: [{rotate: '90deg'}],
        }}>
        <Progress.Bar
          progress={progress}
          style={{position: 'absolute', top: hp('2%')}}
          width={wp('70%')}
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
            top: hp('10%'),
          }}>
          <Text
            style={
              prevStep
                ? {
                    fontSize: wp('3%'),
                    fontWeight: 'normal',
                    borderBottomLeftRadius: hp('4.5%'),
                    borderTopLeftRadius: hp('4.5%'),
                    paddingVertical: hp('2.5%'),
                    backgroundColor: '#CED5DB',
                    margin: 1,
                    width: wp('22%'),
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
                    width: wp('22%'),
                    textAlign: 'center',
                    color: '#000',
                  }
            }>
            {prevStep ? truncateText(prevStep.name) : ''}
          </Text>
          <Text
            style={[
              {
                fontSize: wp('3%'),
                fontWeight: 'bold',
                paddingVertical: hp('2.5%'),
                paddingHorizontal: wp('2%'),
                backgroundColor: '#5E9FE4',
                margin: 1,
                width: wp('28%'),
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
                    fontSize: wp('3%'),
                    fontWeight: 'normal',
                    borderBottomRightRadius: hp('4.5%'),
                    borderTopRightRadius: hp('4.5%'),
                    paddingVertical: hp('2.5%'),
                    backgroundColor: '#CED5DB',
                    margin: 1,
                    width: wp('22%'),
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
                    width: wp('22%'),
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
          //top: hp('10%'),
          transform: [{rotate: '90deg'}],
          right: hp('19%'),
        }}>
        <Image1
          source={{uri: currentStep.overlay_image_path}}
          style={{
            width: wp('80%'),
            height: hp('50%'),
            resizeMode: 'contain',
            tintColor: 'white',
          }}
        />
      </View>
      {/* <View style={styles.canvasWrapper}>
        <Canvas style={{ width: WIDTH, height: HEIGHT }}>
        {previewImage1 != null && 
          <Image
            image={previewImage1}
            x={0}
            y={0}
            width={WIDTH}
            height={HEIGHT}
            fit="cover"
          />}
        </Canvas>
      </View> */}
      {/* <TranslucentBox Accuracy={predictedAccuracy} angleName={predictedAngleName}/> */}
      <View
        style={{
          position: 'absolute',
          top: hp('8%'),
          left: hp('0.1%'),
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: hp('1%'),
          padding: hp('1%'),
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.4)',
          transform: [{rotate: '90deg'}],
          height: hp('21%'),
          width: wp('62%'),
        }}>
        <Progress.Bar
          progress={accuracy / 100}
          style={{position: 'absolute', top: hp('2%')}}
          width={wp('60%')}
          height={hp('3%')}
          borderRadius={hp('5%')}
          color={getAccuracyColor()}
        />
        <View
          style={{
            alignItems: 'flex-start',
            justifyContent: 'center',
            marginTop: hp('5%'),
          }}>
          {/* <Progress.Bar
                progress={accuracy/100}
                style={{position: 'absolute', top: hp('2%')}}
                width={wp('60%')}
                height={hp('3%')}
                borderRadius={hp('5%')}
                color="red"
              /> */}
          <Text
            style={{fontSize: wp('4%'), color: 'red', marginBottom: hp('1%')}}>
            Accuracy: {accuracy}%
          </Text>
          <Text
            style={{fontSize: wp('4%'), color: 'red', marginBottom: hp('1%')}}>
            Angle Name: {angleName}
          </Text>
          <Text style={{fontSize: wp('4%'), color: 'red'}}>
            Accepted Accurary: 95%
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
