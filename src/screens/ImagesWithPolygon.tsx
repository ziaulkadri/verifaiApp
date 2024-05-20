import React from 'react';
import { Image, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

const ImageWithPolygon = ({ imagePath, polygon }) => {
  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: "imagePath" }} style={{ width: '50%', height: '50%' }} resizeMode="contain" />
      <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Polygon
          points={polygon.map((point: any[]) => point.join(',')).join(' ')}
          fill="none"
          stroke="red"
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
};

export default ImageWithPolygon;
