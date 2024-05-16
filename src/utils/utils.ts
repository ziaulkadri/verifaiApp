import axios from 'axios';
import RNFS from 'react-native-fs';

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


  const isValidImage =async (angleName:any,base64Image:any)=>{

    //console.log("base64", angleName,base64Image);

    try {
        if (base64Image) {
          //console.log("base64", "base64Image");
            // Make API call with base64 image data
            const response = await axios.post('https://38d8-125-17-251-66.ngrok-free.app/is_valid_image', { [angleName]: base64Image });
            return(response.data);
          } else {
            console.log('Failed to convert image to base64.');
          }
        
    } catch (error) {
        console.error("Error capturing image:", error);
    }
  }

  const damageDetection =async (data:any)=>{
    try {
        
            // Make API call with base64 image data
            const response = await axios.post('https://f120-125-17-251-66.ngrok-free.app/inference', data);

            return(response.data);
          
        
    } catch (error) {
        console.error("Error in damage detection", error);
    }
  }
  const truncateText = (text: string) => {
    const maxLength = 12; // Maximum length of the text to display
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...'; // Truncate text and add ellipsis
    }
    return text; // Return the original text if it doesn't exceed the maximum length
  };

  function sortByDesiredOrder(tables: { name: string }[]) {
    const importOrder: string[] = [
        'Bonnet',
        'Driver Head Light',
        'Driver Fender Panel First Door',
        'Front Driver Side Tyre',
        'Driver Second Door Quarter Panel',
        'Back Driver Side Tyre',
        'Driver Tail Light',
        'Trunk',
        'Opposite Tail Light',
        'Back Opposite Side Tyre',
        'Opposite Second Door Quarter Panel',
        'Opposite Fender Panel First Door',
        'Front Opposite Side Tyre',
        'Opposite Head Light'
    ];

    const sanitizedTables = tables.map(item => ({
        ...item,
        name: item.name.trim().replace(/\n/g, '') // Remove leading/trailing whitespace and newline characters
    }));

    const sortByObject: { [name: string]: number } = importOrder.reduce((obj, item, index) => {
        return {
            ...obj,
            [item]: index,
        };
    }, {});

    const customSort = sanitizedTables.sort((a, b) => sortByObject[a.name] - sortByObject[b.name]);

    return customSort;
}




  export {
    convertImageToBase64,
    isValidImage,
    truncateText,
    damageDetection,
    sortByDesiredOrder
  }