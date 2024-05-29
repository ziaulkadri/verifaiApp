
  import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Text } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { cropImage } from '../utils/utils';

const MarkedImage = ({ coordinates, croppedWidth, croppedHeight }) => {
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  //const [loading, setLoading] = useState(true);

  const imageSource = require("../../assets/images/carImage.jpeg");


  cropImage(imageSource).then((path) => {
    console.log("Cropped Image Path:", path);
  }).catch((error) => {
    console.error("Error cropping image:", error);
  });

//   useEffect(() => {
//     Image.getSize(imageSource, (width, height) => {
//       setOriginalWidth(width);
//       setOriginalHeight(height);
//       setLoading(false);
//     }, (error) => {
//       console.error(`Couldn't get the image size: ${error.message}`);
//       setLoading(false);
//     });
//   }, [imageSource]);

//   if (loading) {
//     return <ActivityIndicator size="large" color="#0000ff" />;
//   }

  // Calculate the scale factors
  const scaleX = 1500 / 837;
  const scaleY = 2000 / 693;

  // Map the coordinates from the cropped image to the original image
//   const scaledCoordinates = coordinates.map(([x, y]) => [
//     x * scaleX,
//     y * scaleY
//   ]);

  const scaledCoordinates = coordinates.map((coord: [any, any]) => {
    const [x, y] = coord;
    return [x * scaleX, y * scaleY];
  });

  // Convert the scaled coordinates to a string of points
  const points = scaledCoordinates.map((coord: any[]) => coord.join(',')).join(' ');

//   console.log("Original Width:", originalWidth);
//   console.log("Original Height:", originalHeight);
//   console.log("ScaleX:", scaleX);
//   console.log("ScaleY:", scaleY);
//   console.log("Scaled Coordinates:", scaledCoordinates);
  console.log("Points:", points);

  return (
    <View style={styles.imageContainer}>
      <Image source={imageSource} style={styles.image} />
      {scaledCoordinates.length > 0 && (
        <Svg
          height="100%"
          width="100%"
          viewBox={`0 0 ${originalWidth} ${originalHeight}`}
          style={StyleSheet.absoluteFill}
        >
          <Polygon points={points} fill="rgba(255, 0, 0, 0.5)" stroke="red" strokeWidth="2" />
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: undefined,
    aspectRatio: 1500 / 2000, // Adjust aspect ratio according to your original image
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: 'red',
  },
});

export default MarkedImage;
