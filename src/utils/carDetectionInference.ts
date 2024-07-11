import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import * as ort from "onnxruntime-react-native";
import { decode } from 'jpeg-js';
import { NativeModules, Platform } from 'react-native';
import { Base64Binary } from './processingUtils';

export const softmax = (values: any) => {
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

// export const resizeAndNormalizeImage = async (imageUri: string) => {
//   try {
//     const resizedImage = await ImageResizer.createResizedImage(
//       imageUri,
//       224,
//       224,
//       'JPEG',
//       100,
//       0,
//       undefined,
//       false,
//       { mode: "stretch" }
//     );

//     const imageData = await RNFS.readFile(resizedImage.uri, 'base64');
//      const uIntArray = Base64Binary.decode(imageData);
//      const decodedImage = decode(uIntArray, { useTArray: true, colorTransform: true, formatAsRGBA: false });
//     if (!decodedImage || !decodedImage.data) {
//       throw new Error('Failed to decode image.');
//     }

//     const { data, width, height } = decodedImage;
//     const channels = 3;

//     const tensor = new Float32Array(3 * width * height);
//     const mean = [0.485, 0.456, 0.406];
//     const std = [0.229, 0.224, 0.225];

//     for (let c = 0; c < channels; c++) {
//       for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//           const pixelIndex = (y * width + x) * channels;
//           const pixelValue = data[pixelIndex + c] / 255.0;
//           const standardizedValue = (pixelValue - mean[c]) / std[c];
//           tensor[pixelIndex + c] = standardizedValue;
//         }
//       }
//     }
//     return tensor;
//   } catch (error) {
//     console.error('Error processing image:', error);
//     throw error;
//   }
// };
  const resizeAndNormalizeImage = async (imageUri:any) => {
    try {
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
  
      const base64Image = await RNFS.readFile(resizedImage.uri, 'base64');
      const uIntArray = Base64Binary.decode(base64Image);

    const decodedImage = decode(uIntArray, { useTArray: true ,colorTransform: true,formatAsRGBA: false});

    if (!decodedImage || !decodedImage.data) {
      throw new Error('Failed to decode image.');
    }

    // Convert the flat array to a 3D array (height x ewdidth x channels)
    const height = decodedImage.height;
    const width = decodedImage.width;
    const channels = 3; // RGB

    const tensor: number[][][][] = [[[[], [], []]]];
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
        }
        channelData.push(row);
      }
      tensor[0][c] = channelData;
    }
    return tensor.flat().flat().flat();
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };
export let session: ort.InferenceSession | null = null;
export let modelLoaded = false;

export const loadModel =  async () => {
  try {
    let modelPath;

    if (__DEV__) {
      if (Platform.OS === 'android') {
        modelPath = `${RNFS.DocumentDirectoryPath}/11_last.onnx`;
      } else if (Platform.OS === 'ios') {
        modelPath = `${RNFS.DocumentDirectoryPath}/11_last.onnx`;
      }
    } else {
      if (Platform.OS === 'android') {
        modelPath = `${RNFS.DocumentDirectoryPath}/11_last.onnx`;
      } else if (Platform.OS === 'ios') {
        modelPath = `${RNFS.MainBundlePath}/models/11_last.onnx`;
      }
    }
    session = await ort.InferenceSession.create("file://" + modelPath);
    modelLoaded = true;
    console.log('Model loaded successfully.',session,modelLoaded);
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
};

export const performInference = (angleName:any,imageUri: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
      console.log('Inference', imageUri);


      const skip = [
        "Right Front Fender and Door", "Right Front Tyre", "Right Rear Fender and Door",
        "Right Rear Tyre", "Left Rear Tyre", "Left Rear Fender and Door",
        "Left Front Fender and Door", "Left Front Tyre"
      ];
      
      if (skip.includes(angleName)) {
        console.log("Angle name is in the skip array. Resolving with true.");
        resolve(true);
        return;
      }

      if (!modelLoaded) {
          console.log("model loaded again")
          await loadModel();
      }


      try {
          let start = Date.now();
          const normalizedImage = await resizeAndNormalizeImage(imageUri);
          let timeTaken = Date.now() - start;

          console.log("Total time taken for preprocessing : " + timeTaken + " milliseconds");
          let start1 = Date.now();
          const inputTensor = new ort.Tensor("float32", normalizedImage, [1, 3, 224, 224]);
          const result = await session!.run({ "input.1": inputTensor }, ["465"]);

          if (result) {
              //@ts-ignore
              const cpuData = result["465"].cpuData;
              const softmaxData = softmax(cpuData);
              const maxValue = Math.max(...softmaxData);
              const maxIndex = softmaxData.indexOf(maxValue);
              const keys = { 0: 'driver_side', 1: 'Left Headlight', 2: 'Right Head Light', 3: 'Left Tail Light', 4: 'Right Tail Light', 5: 'Trunk', 6: 'Front', 7: 'opposite_side' };
              //@ts-ignore
              const maxKey = keys[maxIndex];
              console.log("Maximum Value:", maxValue > 0.95 ? true : false, maxValue);
              console.log("Index of Maximum Value:", maxIndex);
              console.log("Key of Maximum Value:", maxKey);

              if (maxValue > 0.95 && maxKey === angleName) {
                resolve(true);
                let timeTaken = Date.now() - start1;
                console.log("Total time taken for preprocessing : " + timeTaken + " milliseconds");

              } else {
                resolve(false);
              }
          } else {
              console.error("Error: Invalid result from inference session.");
              reject("Error: Invalid result from inference session.");
          }
      } catch (error) {
          console.error('Error performing inference:', error);
          reject(error);
      }
  });
};


// import RNFS from 'react-native-fs';
// import ImageResizer from 'react-native-image-resizer';
// import * as ort from "onnxruntime-react-native";
// import { Base64Binary } from '../utils/processingUtils';
// import { decode } from 'jpeg-js';
// import { Platform } from 'react-native';

// const softmax = (values: number[]) => {
//   const expValues = values.map(value => Math.exp(value));
//   const sumExpValues = expValues.reduce((sum, value) => sum + value, 0);
//   return expValues.map(value => value / sumExpValues);
// };

// export const resizeAndNormalizeImage = async (imageUri: string) => {
//   try {
//     const resizedImage = await ImageResizer.createResizedImage(
//       imageUri,
//       224,
//       224,
//       'JPEG',
//       100,
//       0, 
//       undefined, 
//       false,
//       { mode: "stretch" }
//     );

//     const base64Image = await RNFS.readFile(resizedImage.uri, 'base64');
//     const uIntArray = Base64Binary.decode(base64Image);
//     const decodedImage = decode(uIntArray, { useTArray: true, colorTransform: true, formatAsRGBA: false });

//     if (!decodedImage || !decodedImage.data) {
//       throw new Error('Failed to decode image.');
//     }

//     const height = decodedImage.height;
//     const width = decodedImage.width;
//     const channels = 3;

//     const tensor: number[][][][] = [[[[], [], []]]];
//     const mean = [0.485, 0.456, 0.406];
//     const std = [0.229, 0.224, 0.225];

//     for (let c = 0; c < channels; c++) {
//       const channelData: number[][] = [];
//       for (let y = 0; y < height; y++) {
//         const row: number[] = [];
//         for (let x = 0; x < width; x++) {
//           const pixelIndex = (y * width + x) * channels;
//           const pixelValue = decodedImage.data[pixelIndex + c] / 255.0;
//           const standardizedValue = (pixelValue - mean[c]) / std[c];
//           row.push(standardizedValue);
//         }
//         channelData.push(row);
//       }
//       tensor[0][c] = channelData;
//     }
//     return tensor.flat(3);
//   } catch (error) {
//     console.error('Error processing image:', error);
//     throw error;
//   }
// };

// export const performInference = async (imageUri: string) => {
//   const modelPath = Platform.OS === 'android' && __DEV__
//     ? `${RNFS.DocumentDirectoryPath}/11_last.onnx`
//     : Platform.OS === 'android'
//       ? 'file:///android_asset/models/11_last.onnx'
//       : `${RNFS.MainBundlePath}/models/11_last.onnx`;

//   try {
//     const session = await ort.InferenceSession.create("file://" + modelPath);
//     const normalizedImage = await resizeAndNormalizeImage(imageUri);
//     const inputTensor = new ort.Tensor("float32", normalizedImage, [1, 3, 224, 224]);

//     const result = await session.run({ "input.1": inputTensor }, ["465"]);
//     if (result) {
//         //@ts-ignore
//       const cpuData = result["465"].cpuData;
//       const softmaxData = softmax(cpuData);
//       const maxValue = Math.max(...softmaxData);
//       const maxIndex = softmaxData.indexOf(maxValue);
//       const keys = { 0: 'driver_side', 1: 'opposite_head_light', 2: 'driver_head_light', 3: 'opposite_tail_light', 4: 'driver_tail_light', 5: 'trunk', 6: 'bonnet', 7: 'opposite_side' };
//         //@ts-ignore
//       const maxKey = keys[maxIndex];

//       console.log("Maximum Value:", maxValue > 0.95 ? true : false, maxValue);
//       console.log("Index of Maximum Value:", maxIndex);
//       console.log("Key of Maximum Value:", maxKey);
//       return maxKey;
//     } else {
//       console.error("Error: Invalid result from inference session.");
//     }
//   } catch (e) {
//     console.log('Error:', e);
//     throw e;
//   }
// };


export const getModelUrl = (relativePath:any) => {
  console.log("RelativePath", relativePath);
  if (__DEV__) {
    const { scriptURL } = NativeModules.SourceCode;
    const devServerHost = scriptURL.split('://')[1].split('/')[0];
    const url = `http://${devServerHost}/assets/${relativePath}`;
    console.log('Model URL (DEV):', url);
    return url;
  } else {
    let url;
    if (Platform.OS === 'ios') {
      url = `${RNFS.MainBundlePath}/${relativePath}`;
    } else if (Platform.OS === 'android') {
      url = `asset:///${relativePath}`;
    }
    console.log('Model URL (PROD):', url);
    return url;
  }
};

export const downloadModelFile = async (modelUrl:any, localPath:any) => {
  try {
    console.log("1", modelUrl, localPath);

    if (__DEV__) {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: modelUrl,
        toFile: localPath,
      }).promise;
      if (downloadResult.statusCode === 200) {
        console.log('Model file downloaded successfully');
      } else {
        console.error('Failed to download model file');
      }
    } else {
      console.log("In production, copying file from assets");
      await RNFS.copyFileAssets(modelUrl.replace('asset:///', ''), localPath);
      console.log('Model file copied successfully');
    }
  } catch (error) {
    console.error('Error handling model file:', error);
    throw error;
  }
};




export const inferenceOnFrame = (angle:string,resizedFrame:any) => {
  'worklet';
console.log('Inference on frame',resizedFrame[0].length)




  console.log("Inference on frame");
}