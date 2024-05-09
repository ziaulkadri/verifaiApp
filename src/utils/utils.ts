import axios from 'axios';
import RNFS from 'react-native-fs';

const convertImageToBase64 = async (imagePath:any) => {
    try {
      const base64Image = await RNFS.readFile(imagePath, 'base64');
      console.log('Image converted to base64:', base64Image);
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
            // Make API call with base64 image data
            const response = await axios.post('https://3336-125-17-251-66.ngrok-free.app/is_valid_image', { [angleName]: base64Image });
            return(response.data);
          } else {
            console.log('Failed to convert image to base64.');
          }
        
    } catch (error) {
        console.error("Error capturing image:", error);
    }
  }
  const truncateText = (text: string) => {
    const maxLength = 12; // Maximum length of the text to display
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...'; // Truncate text and add ellipsis
    }
    return text; // Return the original text if it doesn't exceed the maximum length
  };
  export {
    convertImageToBase64,
    isValidImage,
    truncateText
  }