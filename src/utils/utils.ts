import axios from 'axios';
import RNFS from 'react-native-fs';
import RNFetchBlob, { FetchBlobResponse } from 'rn-fetch-blob';
import config from '../config/config';
import ImagePicker from 'react-native-image-crop-picker';
import ImageEditor from '@react-native-community/image-editor';
import AsyncStorage from '@react-native-async-storage/async-storage';

const convertImageToBase64 = async (imagePath:any) => {
    try {
      const base64Image = await RNFS.readFile(imagePath, 'base64');
      //console.log('Image converted to base64:', base64Image);
      return base64Image;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };


  const isValidImage =async (angleName:any,base64Image:any,assessment_id:any)=>{

    //console.log("base64", angleName,base64Image);
   // const id = generateUUID(7);
  //console.log(assessment_id)

  const modelUrl = await AsyncStorage.getItem('modelUrl')
  console.log("modelUrl",modelUrl)

    try {
        if (base64Image) {
          //console.log("base64", "base64Image");
            // Make API call with base64 image data
            //console.log("API call with base64 image")
            const response = await axios.post(`${modelUrl}/is_valid_image`, {assessment_id: assessment_id, [angleName]: base64Image });
            //console.log(response.data)
            return(response.data);
          } else {
            console.log('Failed to convert image to base64.');
          }
        
    } catch (error) {
        console.error("Error capturing image:", error);
    }
  }

  const damageDetection =async (data:any)=>{
    const modelUrl = await AsyncStorage.getItem('modelUrl')

    try {
          const response = await axios.post(`${modelUrl}/inference`, data);
          console.log("rsponseData",response.data);
          return(response.data);
    } catch (error) {
        console.error("Error in damage detection", error);
        throw error;
    }
  }
  const truncateText = (text: string) => {
    const maxLength = 5; // Maximum length of the text to display
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...'; // Truncate text and add ellipsis
    }
    return text; // Return the original text if it doesn't exceed the maximum length
  };
  

  function sortByDesiredOrder(tables: { name: string }[]) {
    const importOrder: string[] = 
    [
      "Front",
      "Right Head Light",
      "Right Front Fender and Door",
      "Right Front Tyre",
      "Right Rear Fender and Door",
      "Right Rear Tyre",
      "Right Tail Light",
      "Trunk",
      "Left Tail Light",
      "Left Rear Tyre",
      "Left Rear Fender and Door",
      "Left Front Fender and Door",
      "Left Front Tyre",
      "Left Headlight"
  ]
    // [
    //     'Bonnet',
    //     'Driver Head Light',
    //     'Driver Fender Panel First Door',
    //     'Front Driver Side Tyre',
    //     'Driver Second Door Quarter Panel',
    //     'Back Driver Side Tyre',
    //     'Driver Tail Light',
    //     'Trunk',
    //     'Opposite Tail Light',
    //     'Back Opposite Side Tyre',
    //     'Opposite Second Door Quarter Panel',
    //     'Opposite Fender Panel First Door',
    //     'Front Opposite Side Tyre',
    //     'Opposite Head Light'
    // ];

    const sanitizedTables = tables.map(item => ({
        ...item,
        name: item.name.trim().replace(/\n/g, '') // Remove leading/trailing whitespace and newline characters
    }));

    //console.log(sanitizedTables.map(t =>t.name))

    const sortByObject: { [name: string]: number } = importOrder.reduce((obj, item, index) => {
        return {
            ...obj,
            [item]: index,
        };
    }, {});

    const customSort = sanitizedTables.sort((a, b) => sortByObject[a.name] - sortByObject[b.name]);

    return customSort;
}

interface ResponseData {
  url: string;
}

const uploadFile = async (path: string, angleName: string, data: any):Promise<{url: string}> => {
  const sanitizedAngleName = angleName.replace(/\s+/g, '');
  const baseUrl = await AsyncStorage.getItem('baseUrl')
  console.log("baseUrl",baseUrl)
  return new Promise((resolve, reject) => {
    RNFetchBlob.fetch('POST', `${baseUrl}/angleImages/upload`, {
      otherHeader: "foo",
      'Content-Type': 'multipart/form-data',
    }, [
      { name: 'vehicle_id', data: data.vehicle_id },
      { name: 'client_id', data: data.client_id },
      { name: 'file', filename: `${sanitizedAngleName}.jpg`, type: 'image/foo', data: RNFetchBlob.wrap(path) },
    ]).then((resp) => {
      const responseData: ResponseData = resp.json()
      resolve(responseData);
    }).catch((err) => {
      console.log("error here",err);
      reject(err);
    });
  });
}

 function generateUUID(digits:number) {
  let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ';
  let uuid = [];
  for (let i = 0; i < digits; i++) {
      uuid.push(str[Math.floor(Math.random() * str.length)]);
  }
  return uuid.join('');
}

interface Coordinate {
  x: number;
  y: number;
}

const getDamageMidPoints = (angleName: string, data: any): { coordinates: Coordinate[] } => {
  const angleData = data[angleName];
  if (!angleData || !angleData.damage_polygon || angleData.damage_polygon.length === 0) {
    return { coordinates: [] };
  }

  const coordinates = angleData.damage_polygon
    .filter((damage: { denormalize_pt?: [number, number]; }) => damage.denormalize_pt)
    .map((damage: { denormalize_pt: [number, number]; }) => {
      const [x, y] = damage.denormalize_pt;
      return { x, y };
    });

  return { coordinates };
};


const cropImage = async (imageUrl: string) => {
  try {
    const cropData = {
      offset: { x: 454, y: 319 },
      size: { width: 1147 - 454, height: 1156 - 319 },
      displaySize: { width: 1147 - 454, height: 1156 - 319 },
      //resizeMode: 'contain',
    };
    ImageEditor.cropImage(imageUrl, cropData)
    .then((url) => {
      console.log('Cropped image URI:', url);
      return(url);
    })
  } catch (err) {
    console.error('Error cropping image:', err);
    return null; // Or handle the error gracefully
  }
};


  
  export {
    convertImageToBase64,
    isValidImage,
    truncateText,
    damageDetection,
    sortByDesiredOrder,
    uploadFile,
    generateUUID,
    getDamageMidPoints,
    cropImage
  }