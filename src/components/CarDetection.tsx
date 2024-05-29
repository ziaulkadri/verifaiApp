import React, { useEffect, useState } from 'react';
import { View, Button, Image, Text, StyleSheet, Platform, Alert, NativeModules } from 'react-native';
import { launchImageLibrary as _launchImageLibrary, launchCamera as _launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import * as ort from "onnxruntime-react-native";
import { Base64Binary } from '../utils/processingUtils';
import { decode } from 'jpeg-js';


// const imageSource = Image.resolveAssetSource(require('../../assets/images/carImage.jpeg')).uri;
// console.log(imageSource);
const imageSource = Image.resolveAssetSource(require('../../assets/images/carImage.jpeg')).uri;
const CarDetection = () => {
  const [selectedImage, setSelectedImage] = useState();
  const [output, setOutput] = useState<string | undefined>();


  // const carDetectionModel = useTensorflowModel(require('../assets/model/mobilenet_v1_1.0_224_quant.tflite'));
  // const model = carDetectionModel.state === "loaded" ? carDetectionModel.model : undefined;

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
        undefined, 
    undefined, 
    undefined, 
    {
          mode:"stretch"
        }
      );
  
      // Read the resized image file as base64 string
      const base64Image = await RNFS.readFile(resizedImage.uri, 'base64');
      const uIntArray = Base64Binary.decode(base64Image);

    // Decode JPEG to raw pixel data
    const decodedImage = decode(uIntArray, { useTArray: true });

    // Check if the decoded image has the expected format
    if (!decodedImage || !decodedImage.data) {
      throw new Error('Failed to decode image');
    }

    // Convert the flat array to a 3D array (height x width x channels)
    const height = decodedImage.height;
    const width = decodedImage.width;
    const channels = 3; // RGB

    // Initialize the tensor array
    const tensor: number[][][][] = [[[[], [], []]]];
   for (let c = 0; c < channels; c++) {
      const channelData: number[][] = [];
      for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
          const pixelIndex = (y * width + x) * channels;
          const pixelValue = decodedImage.data[pixelIndex + c] / 255.0; // Normalize
          const mean = [0.485, 0.456, 0.406][c];
          const std = [0.229, 0.224, 0.225][c];
          const standardizedValue = (pixelValue - mean) / std; // Standardize
          row.push(standardizedValue);
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
      ? `${RNFS.DocumentDirectoryPath}/carDetection.onnx`
      : Platform.OS === 'android'
        ? 'file:///android_asset/models/carDetection.onnx'
        : `${RNFS.MainBundlePath}/models/carDetection.onnx`;

      // Load your model using the appropriate library/method for your use case
      console.log('Loading model from:', 'file://' + modelPath);
      try {
      const session: ort.InferenceSession = await ort.InferenceSession.create("file://"+modelPath);

      console.log('Loading model', session.inputNames,session.outputNames)

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
    } else {
        console.error("Error: Invalid result from inference session.");
    }
    } catch (e) {
      console.log('Error:', e);
      throw e;
    }
  };

  


// async function loadModel() {
//     try {
//       //const modelUri = '../model/carDetection.onnx';
//       const dest = RNFS.TemporaryDirectoryPath+"/carDetection.onnx";

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
      const modelUrl = getModelUrl('src/model/carDetection.onnx');
      const localModelPath = `${RNFS.DocumentDirectoryPath}/carDetection.onnx`;
      await downloadModelFile(modelUrl, localModelPath);
      await loadModel();
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
