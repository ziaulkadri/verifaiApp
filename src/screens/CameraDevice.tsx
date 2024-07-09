import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  Camera,
  runAtTargetFps,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import Orientation from 'react-native-orientation-locker';
import { useIsFocused } from '@react-navigation/native';
import base64 from 'base64-js';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import {toByteArray, fromByteArray} from 'react-native-quick-base64';

const SimpleCamera = () => {
  const cameraRef = useRef(null);
  //const [hasPermission, setHasPermission] = useState(false);
  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [{photoResolution: 'max'}]);
  const [orientation, setOrientation] = useState('portrait');
  const isFocused = useIsFocused();
  const { resize } = useResizePlugin()

  // const frameProcessor = useFrameProcessor((frame) => {
  //   'worklet';
  //   console.log(`Processing frame: ${frame.timestamp}`);
  // }, []);

  const processFrame = (frame:any) => {
    'worklet';
    console.log(`Processing frame: ${frame}`);
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'

    runAtTargetFps(1, () => {
      'worklet'
      console.log(`${frame.timestamp}: ${frame.width}x${frame.height} ${frame.pixelFormat} Frame (${frame.orientation})`)
      //examplePlugin(frame)
      //exampleKotlinSwiftPlugin(frame)


      const resized = resize(frame, {
        scale: {
          width: 192,
          height: 192
        },
        pixelFormat: 'rgb',
        dataType: 'uint8'
      });
        
      processFrame(resized)
    })
  }, [])


  // useEffect(() => {
  //   const handleOrientationChange = (newOrientation: string) => {
  //     if (newOrientation === 'LANDSCAPE-LEFT') {
  //       setOrientation('landscapeLeft');
  //     } else if (newOrientation === 'LANDSCAPE-RIGHT') {
  //       setOrientation('landscapeRight');
  //     } else if (newOrientation === 'PORTRAIT') {
  //       setOrientation('portrait');
  //     } else if (newOrientation === 'PORTRAIT-UPSIDEDOWN') {
  //       setOrientation('portraitUpsideDown');
  //     }
  //   };

  //   Orientation.addOrientationListener(handleOrientationChange);

  //   return () => {
  //     Orientation.removeOrientationListener(handleOrientationChange);
  //   };
  // }, []);



//   useEffect(() => {
//     const requestCameraPermission = async () => {
//       const status = await Camera.requestCameraPermission();
//       setHasPermission(status === 'authorized');
//       if (status !== 'authorized') {
//         console.warn('Camera permission not granted!');
//       }
//     };

//     requestCameraPermission();
//   }, []);

  if (device == null) {
    return <ActivityIndicator style={styles.loading} />;
  }

  return (
    <View  style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Camera
        style={{flex: 1, width: '100%', height: '100%'}}
        ref={cameraRef}
        //style={styles.camera}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        onError={(error) => console.log('error', error)}
        format={format}
        orientation="portrait"

        
        //fps={30}
        //frameProcessorFps={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SimpleCamera;