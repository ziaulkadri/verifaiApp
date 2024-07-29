import React, { useState } from 'react';
import { View, Text, StyleSheet, PixelRatio, Dimensions } from 'react-native';

const TranslucentBox = ( {Accuracy, angleName}) => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
console.log("data-----------",Accuracy, angleName)
    const wp = widthPercent =>
        PixelRatio.roundToNearestPixel(
          (dimensions.width * parseFloat(widthPercent)) / 100,
        );
      const hp = heightPercent =>
        PixelRatio.roundToNearestPixel(
          (dimensions.height * parseFloat(heightPercent)) / 100,
        );
  return (
    <View
    style={{
      position: 'absolute',
      top: hp('8%'),
      left: hp('0.1%'),
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: hp('1%'),
      padding: hp('1%'),
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
      transform: [{ rotate: '90deg' }],
    }}
  >
    <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
      <Text style={{ fontSize: wp('4%'), color: 'red', marginBottom: hp('1%') }}>
        Accuracy: {Accuracy}%
      </Text>
      <Text style={{ fontSize: wp('4%'), color: 'red', marginBottom: hp('1%') }}>
        Angle Name: {angleName}
      </Text>
      <Text style={{ fontSize: wp('4%'), color: 'red' }}>Accepted Accurary: 95%</Text>
    </View>
  </View>
  );
};



export default TranslucentBox;