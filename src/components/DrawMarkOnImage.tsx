import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Coordinate {
  x: number;
  y: number;
}

interface MarkedImageProps {
  coordinates: Coordinate[];
}

const MarkedImage: React.FC<MarkedImageProps> = ({ coordinates }) => {
  const originalWidth = 893;
  const originalHeight = 429;

  return (
    <View style={styles.imageContainer}>
      <Image source={require("../../assets/images/BluePrint.jpg")} style={styles.image} />
      {coordinates.length > 0 && (
        <Svg
          height="100%"
          width="100%"
          viewBox={`0 0 ${originalWidth} ${originalHeight}`}
          style={StyleSheet.absoluteFill}
        >
          {coordinates.map((coordinate, index) => (
            <Circle key={index} cx={coordinate.x} cy={coordinate.y} r={10} fill="red" />
          ))}
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
    aspectRatio: 893 / 429,
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
