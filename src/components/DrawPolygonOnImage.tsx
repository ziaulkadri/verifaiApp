import ImageEditor from '@react-native-community/image-editor';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-animatable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Svg, { Circle, Polygon } from 'react-native-svg';



interface DrawPolygonOnImageProps {
    imageSource: any;
    cropCordinate: any;
    panelPolygon: any;
    damagePolygon: any;
    showDamagePolygon: any;
    showPanelPolygon: any;
}

const DrawPolygonOnImage: React.FC<DrawPolygonOnImageProps> = ({ imageSource , cropCordinate, panelPolygon,damagePolygon,showDamagePolygon,showPanelPolygon }) => {
    const [croppedImageUri, setCroppedImageUri] = useState("");

    const ymin = cropCordinate[1], xmin = cropCordinate[0], ymax = cropCordinate[3], xmax = cropCordinate[2];

    const width = xmax - xmin
    const height = ymax - ymin 

    useEffect(() => {
      const ymin = cropCordinate[1], xmin = cropCordinate[0], ymax = cropCordinate[3], xmax = cropCordinate[2];
  
      const cropData = {
        offset: { x: xmin, y: ymin },
        size: { width: xmax - xmin, height: ymax - ymin },
        displaySize: { width: xmax - xmin, height: ymax - ymin },
        //resizeMode: 'contain',
      };
  
      ImageEditor.cropImage(imageSource, cropData)
        .then((url) => {
          const imageurl = "file://" + url.path;
          setCroppedImageUri(imageurl);
        })
        .catch((error) => {
          console.error('Error cropping image:', error);
        });
    }, [imageSource, cropCordinate]);

    const renderPolygons = (polygons: { polygon: any[]; }[],fillColor:any,lineColor:any) => {
      return polygons.map((polygon: { polygon: any[]; }, index: React.Key | null | undefined) => {
        const points = polygon.polygon.map(point => `${point[0]},${point[1]}`).join(' ');
        return (
          <Polygon
            key={index}
            points={points}
            fill={fillColor}
            stroke={lineColor}
            strokeWidth="2"
          />
        );
      });
    };
  return (
    <>

    {croppedImageUri && 
    <View style={[styles.imageContainer,{aspectRatio: width / height}]}>
      <Image source={{ uri: croppedImageUri }} style={styles.image} resizeMode="contain" />
      <Svg
            height="100%"
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            style={StyleSheet.absoluteFill}
          >
            {showPanelPolygon &&renderPolygons(panelPolygon,"none","white")}
           {showDamagePolygon && renderPolygons(damagePolygon,"red","orange")} 
          </Svg>
    </View>
  }
  </>
    
  );
};

const styles = StyleSheet.create({

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: undefined,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: 'red',
  },
damageButton:{
  backgroundColor: '#1631C2',
  width: 20,
  height: 10,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  borderColor: 'blue',
  borderWidth: 2,
  marginTop: 10,
},
  
});

export default DrawPolygonOnImage;