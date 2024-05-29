import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
const RotatePhoneScreen = () => {
  const portraitImage = require('../../assets/images/rotate_phone.png');
  const landscapeImage = require('../../assets/images/rotate_phone_landscape.png');
  const [currentImage, setCurrentImage] = useState(portraitImage);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => prevImage === portraitImage ? landscapeImage : portraitImage);
    }, 1000); // Change image every 1000 milliseconds (1 second)
    
    return () => clearInterval(interval);
  }, []);

  return (
      <Animatable.Image
        animation="fadeIn"
        duration={500}
        source={currentImage}
        style={styles.image}
      />
    
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '55%',
    position: 'absolute',
    tintColor: 'white'
  },
});

export default RotatePhoneScreen;
