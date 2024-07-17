import React, { useEffect, useState } from 'react';
import { View, Button, Image, Text, StyleSheet, Platform, Alert, NativeModules, ImageResolvedAssetSource } from 'react-native';
import { launchImageLibrary as _launchImageLibrary, launchCamera as _launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import * as ort from "onnxruntime-react-native";
import { Base64Binary } from '../utils/processingUtils';
import { decode, encode } from 'jpeg-js';
import { downloadModelFile, performInference } from '../utils/carDetectionInference';

const imageSource = Image.resolveAssetSource(require('../../assets/carImages/trunl.jpg')).uri;
const CarDetection = () => {
  const [selectedImage, setSelectedImage] = useState();
  const [output, setOutput] = useState<string | undefined>();
  
  const resizeAndNormalizeImage = async (imageUri:any) => {
    try {
     

      // Resize the image to 224x224
      const resizedImage = await ImageResizer.createResizedImage(
        imageUri,
        224,
        224,
        'JPEG',
        100,
        0, 
    undefined, 
    false,
    { mode: "stretch" } // Adjust resizing options as needed
      );
  
      // Read the resized image file as base64 string.s
      const base64Image = await RNFS.readFile(resizedImage.uri, 'base64');
      const uIntArray = Base64Binary.decode(base64Image);

    // Decode JPEG to raw pixel data
    const decodedImage = decode(uIntArray, { useTArray: true ,colorTransform: true,formatAsRGBA: false});

    // Check if the decoded image has the expected format
    if (!decodedImage || !decodedImage.data) {
      throw new Error('Failed to decode image.');
    }

    // Convert the flat array to a 3D array (height x ewdidth x channels)
    const height = decodedImage.height;
    const width = decodedImage.width;
    const channels = 3; // RGB


    // Initialize the tensor array
    const tensor: number[][][][] = [[[[], [], []]]];
    //let loggedValues = 0;
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
   for (let c = 0; c < channels; c++) {
      const channelData: number[][] = [];
      for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
          const pixelIndex = (y * width + x) * channels;
          const pixelValue = decodedImage.data[pixelIndex + c] / 255.0; // Normalize
          const standardizedValue = (pixelValue - mean[c]) / std[c]; // Standardize
          row.push(standardizedValue);
          // loggedValues++;
          // if (loggedValues >= 2) {
          //   break;
          // }
        }
        channelData.push(row);
      }
      tensor[0][c] = channelData;
    }

    // Log the shape of the tensor
    //const tensorShape = [1, channels, height, width];
    return tensor.flat().flat().flat();
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  const getModelUrl = (relativePath:any) => {
    if (__DEV__) {
      const { scriptURL } = NativeModules.SourceCode;
      const devServerHost = scriptURL.split('://')[1].split('/')[0];
      const url = `http://${devServerHost}/assets/${relativePath}`;
      console.log('Model URL:', url);
      return url;
    }
    return '';
  };
  
  // const downloadModelFile = async (modelUrl:any, localPath:any) => {
  //   if (Platform.OS === 'android' && __DEV__) {
  //     try {
  //       const downloadResult = await RNFS.downloadFile({
  //         fromUrl: modelUrl,
  //         toFile: localPath,
  //       }).promise;
  //       console.log('Download result:', downloadResult);

  //       if (downloadResult.statusCode === 200) {
  //         console.log('Model file downloaded successfully');
  //       } else {
  //         console.error('Failed to download model file');
  //       }
  //     } catch (error) {
  //       console.error('Error downloading model file:', error);
  //     }
  //   }
  // };

  const softmax = (values:any) => {
    // Calculate the exponentials of the values
    const expValues = values.map((value: number) => Math.exp(value));
  
    // Calculate the sum of the exponentials
    const sumExpValues = expValues.reduce((sum: any, value: any) => sum + value, 0);
  
    // Calculate the softmax values
    const softmaxValues = expValues.map((value: number) => value / sumExpValues);
  
    return softmaxValues;
  };
//   const loadModel = async () => {
//     const modelPath = Platform.OS === 'android' && __DEV__
//       ? `${RNFS.DocumentDirectoryPath}/11_last.onnx`
//       : Platform.OS === 'android'
//         ? 'file:///android_asset/models/11_last.onnx'
//         : `${RNFS.MainBundlePath}/models/11_last.onnx`;

//       // Load your model using the appropriate library/method for your use case
//       //console.log('Loading model from:', 'file://' + modelPath);
//       try {
//       const session: ort.InferenceSession = await ort.InferenceSession.create("file://"+modelPath);

//       //console.log('Loading model', session.inputNames,session.outputNames)

//       let start = Date.now();
//       const normalizedImage = await resizeAndNormalizeImage(imageSource);
//       const inputTensor = new ort.Tensor("float32", normalizedImage, [1, 3, 224, 224]); // Adjust shape and type as needed

//       type OnnxValueMapType = {
//         [key: string]: any; // or specify the specific type for the values
//       };
//       const onnxValueMap: OnnxValueMapType= {
//         "input.1": inputTensor, // Assuming 'input' is the key for the input tenso
//       };
//       const result = await session.run(onnxValueMap,["465"]);
//       if (result) {
//         console.log("Inference Result:", result);
//         const keys = {0: 'driver_side', 1: 'opposite_head_light', 2: 'driver_head_light', 3: 'opposite_tail_light', 4: 'driver_tail_light', 5: 'trunk', 6: 'bonnet', 7: 'opposite_side'}
//         //@ts-ignore
// const cpuData = result["465"].cpuData;
// console.log("CPU Data:", cpuData);
// const softmaxData = softmax(cpuData);
// console.log("Softmax Data:", softmaxData)
//         const maxValue = Math.max(...softmaxData);
// const maxIndex = softmaxData.indexOf(maxValue);

// // Map the max value to its index in keys
// //@ts-ignore
// const maxKey = keys[maxIndex];

// console.log("Maximum Value:", maxValue>0.95?true:false,maxValue);
// console.log("Index of Maximum Value:", maxIndex);
// console.log("Key of Maximum Value:", maxKey);
// let timeTaken = Date.now() - start;
// console.log("Total time taken : " + timeTaken + " milliseconds");
//     } else {
//         console.error("Error: Invalid result from inference session.....");
//     }
//     } catch (e) {
//       console.log('Error:', e);
//       throw e;
//     }
//   };

  
  useEffect(() => {
    const init = async () => {
      let start = Date.now();

      const modelUrl = getModelUrl('src/model/11_last.onnx');
      const localModelPath = `${RNFS.DocumentDirectoryPath}/11_last.onnx`;
      await downloadModelFile(modelUrl, localModelPath);
      //await downloadModelFile(modelUrl, localModelPath);
      //await loadModel();
      let timeTaken = Date.now() - start;
      console.log("Total time taken : " + timeTaken + " milliseconds");
    };

    init();
  }, []);

const handleImageInference = async () => {
  let start = Date.now();

  const result = await performInference(imageSource);
  let timeTaken = Date.now() - start;
  console.log("Total time taken : " + timeTaken + " milliseconds",result);
}
  return (
    <View style={styles.container}>
      <Text>Hey</Text>
      <Button title="inference" onPress={handleImageInference} />
      {/* <Button title="Select Image" onPress={openImagePicker} />
      {selectedImage && <Image source={{uri: selectedImage}} style={styles.image} />}
      {output && <Text style={styles.output}>{output}</Text>} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  output: {
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
});

export default CarDetection;
