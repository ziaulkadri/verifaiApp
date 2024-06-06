import React, { useEffect, useState } from 'react';
import { View, Button, Image, Text, StyleSheet, Platform, Alert, NativeModules, ImageResolvedAssetSource } from 'react-native';
import { launchImageLibrary as _launchImageLibrary, launchCamera as _launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import * as ort from "onnxruntime-react-native";
import { Base64Binary } from '../utils/processingUtils';
import { decode, encode } from 'jpeg-js';


// const imageSource = Image.resolveAssetSource(require('../../assets/images/carImage.jpeg')).uri;
// console.log(imageSource);
const imageSource = Image.resolveAssetSource(require('../../assets/carImages/Opposite_Tail_Light.jpg')).uri;
const CarDetection = () => {
  const [selectedImage, setSelectedImage] = useState();
  const [output, setOutput] = useState<string | undefined>();


  // const carDetectionModel = useTensorflowModel(require('../assets/model/mobilenet_v1_1.0_224_quant.tflite'));
  // const model = carDetectionModel.state === "loaded" ? carDetedctionModel.model : undefined;

  // Load the model using the absolute file path as URI
  
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

      console.log("height,width",resizedImage.height, resizedImage.width,resizedImage.size);
  
      // Read the resized image file as base64 string.s
      const base64Image = await RNFS.readFile(resizedImage.uri, 'base64');
      //console.log(base64Image);
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
          //console.log("value------", standardizedValue,pixelValue,mean,std)
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
    //console.log(tensor)
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
  
  const downloadModelFile = async (modelUrl:any, localPath:any) => {
    if (Platform.OS === 'android' && __DEV__) {
      try {
        const downloadResult = await RNFS.downloadFile({
          fromUrl: modelUrl,
          toFile: localPath,
        }).promise;
        console.log('Download result:', downloadResult);

        if (downloadResult.statusCode === 200) {
          console.log('Model file downloaded successfully');
        } else {
          console.error('Failed to download model file');
        }
      } catch (error) {
        console.error('Error downloading model file:', error);
      }
    }
  };

  // const convertBase64ToTensor = async (base64:any) => {
  //   try {
  //     const uIntArray = Base64Binary.decode(base64);
  //     // decode a JPEG-encoded image to a 3D Tensor of dtype
  //     const decodedImage = decodeJpeg(uIntArray, 3);
  //     // reshape Tensor into a 4D array
  //     return decodedImage.reshape([
  //       1,
  //       TENSORFLOW_CHANNEL,
  //       BITMAP_DIMENSION,
  //       BITMAP_DIMENSION,
  //     ]);
  //   } catch (error) {
  //     console.log('Could not convert base64 string to tesor', error);
  //   }
  // };
  
  const loadModel = async () => {
    const modelPath = Platform.OS === 'android' && __DEV__
      ? `${RNFS.DocumentDirectoryPath}/11_last.onnx`
      : Platform.OS === 'android'
        ? 'file:///android_asset/models/11_last.onnx'
        : `${RNFS.MainBundlePath}/models/11_last.onnx`;

      // Load your model using the appropriate library/method for your use case
      //console.log('Loading model from:', 'file://' + modelPath);
      try {
      const session: ort.InferenceSession = await ort.InferenceSession.create("file://"+modelPath);

      //console.log('Loading model', session.inputNames,session.outputNames)

      let start = Date.now();
      const normalizedImage = await resizeAndNormalizeImage(imageSource);
      const inputTensor = new ort.Tensor("float32", normalizedImage, [1, 3, 224, 224]); // Adjust shape and type as needed

      type OnnxValueMapType = {
        [key: string]: any; // or specify the specific type for the values
      };
      const onnxValueMap: OnnxValueMapType= {
        "input.1": inputTensor, // Assuming 'input' is the key for the input tenso
      };
      const result = await session.run(onnxValueMap,["465"]);
      if (result) {
        console.log("Inference Result:", result);
        const keys = {0: 'driver_side', 1: 'opposite_head_light', 2: 'driver_head_light', 3: 'opposite_tail_light', 4: 'driver_tail_light', 5: 'trunk', 6: 'bonnet', 7: 'opposite_side'}
        //@ts-ignore
const cpuData = result["465"].cpuData;
        const maxValue = Math.max(...cpuData);
const maxIndex = cpuData.indexOf(maxValue);

// Map the max value to its index in keys
//@ts-ignore
const maxKey = keys[maxIndex];

console.log("Maximum Value:", maxValue);
console.log("Index of Maximum Value:", maxIndex);
console.log("Key of Maximum Value:", maxKey);
let timeTaken = Date.now() - start;
console.log("Total time taken : " + timeTaken + " milliseconds");
    } else {
        console.error("Error: Invalid result from inference session.....");
    }
    } catch (e) {
      console.log('Error:', e);
      throw e;
    }
  };

  


// async function loadModel() {
//     try {
//       //const modelUri = '../model/11_last.onnx';
//       const dest = RNFS.TemporaryDirectoryPath+"/11_last.onnx";

//       console.log('Loading model', dest);

//       const session: ort.InferenceSession = await ort.InferenceSession.create("file://"+dest);



//       console.log('Loading model', session.inputNames,session.outputNames)
       
//       console.log('Inference session created', session);
//       const normalizedImage = await resizeAndNormalizeImage(imageSource);
//       //console.log('Normalized image', normalizedImage);
//       type OnnxValueMapType = {
//         [key: string]: any; // or specify the specific type for the values
//       };
//       const onnxValueMap: OnnxValueMapType= {
//         "input.1": normalizedImage, // Assuming 'input' is the key for the input tenso
//       };

//       //console.log("onnxValueMap:", onnxValueMap);

//       // @ts-ignore
//       const result = await session.run(normalizedImage,["465"]);
//       if (result) {
//         console.log("Inference Result:", result);
//     } else {
//         console.error("Error: Invalid result from inference session.");
//     }
//     } catch (e) {
//       console.log('Error:', e);
//       throw e;
//     }
//   }
  
  // Call loadModel function
  // useEffect(() => {
  //   loadModel();
  // }, []);

//   const openImagePicker = () => {
//     const options = {
//       mediaType: 'photo' as MediaType,
//       includeBase64: false,
//       maxHeight: 2000,
//       maxWidth: 2000,
//     };

//     launchImageLibrary(options, handleResponse);
//   };


//   const handleResponse = async (response:any) => {
//     if (response.didCancel) {
//       console.log('User cancelled image picker');
//     } else if (response.error) {
//       console.log('Image picker error: ', response.error);
//     } else {
//       let imageUri = response.uri || response.assets?.[0]?.uri;
//       console.log('Image', imageUri);
//       setSelectedImage(imageUri);
//       try {
//         const imageTensor = await preprocessImage(imageUri);
//         console.log('Image', imageTensor)
//         const result = await model?.run(imageTensor);
//         if(result){
//             console.log(JSON.stringify(result));
//         }
//       } catch (error) {
//         console.error('Error processing image:2312321321', error);
//       }
//     }
//   };

// //   const openImagePicker = () => {
// //     ImagePicker.showImagePicker({}, async (response) => {
// //       if (response.didCancel) {
// //         console.log('User cancelled image picker');
// //       } else if (response.error) {
// //         console.error('ImagePicker Error: ', response.error);
// //       } else {
// //         try {
// //           const imageTensor = await preprocessImage(response);
// //           const result = await model?.run(imageTensor);
// //           setOutput(result);
// //         } catch (error) {
// //           console.error('Error processing image:', error);
// //         }

// //         setSelectedImage({ uri: response.uri });
// //       }
// //     });
// //   };

// const preprocessImage = async (imageUri: any) => {
//     try {
//       // Resize the image to match the model input size (224x224)
//       const resizedImage = await ImageResizer.createResizedImage(imageUri, 224, 224, 'JPEG', 100);
  
//       // Read the resized image file as binary data
//       const binaryData = await RNFS.readFile(resizedImage.uri, 'base64');
  
//       // Convert the base64 data to a Uint8Array
//       const pixelValues = new Uint8Array(binaryData.length);
//       for (let i = 0; i < binaryData.length; i++) {
//         pixelValues[i] = binaryData.charCodeAt(i);
//       }
  
//       // Create input tensor with the correct shape (1, 224, 224, 3)
//       const inputTensor = new Uint8Array(1 * 224 * 224 * 3);
//       for (let i = 0; i < 224 * 224 * 3; i++) {
//         inputTensor[i] = pixelValues[i];
//       }
  
//       return [inputTensor]; // Wrap input tensor in an array
//     } catch (error) {
//       console.error('Error preprocessing image:', error);
//       throw error;
//     }
//   };
  
  useEffect(() => {
    const init = async () => {
      let start = Date.now();

      const modelUrl = getModelUrl('src/model/11_last.onnx');
      const localModelPath = `${RNFS.DocumentDirectoryPath}/11_last.onnx`;
      await downloadModelFile(modelUrl, localModelPath);
      await loadModel();
      let timeTaken = Date.now() - start;
      console.log("Total time taken : " + timeTaken + " milliseconds");
    };

    init();
  }, []);


  return (
    <View style={styles.container}>
      <Text>Hey</Text>
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
