import { useIsFocused, useRoute } from '@react-navigation/native';
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import NavigationConstants from '../constants/NavigationConstants';
import DrawMarkOnImage from '../components/DrawMarkOnImage';
import { getDamageMidPoints } from '../utils/utils';
import Orientation from 'react-native-orientation-locker';
import DrawPolygonOnImage from '../components/DrawPolygonOnImage';
import CustomSwitch from '../components/CustomSwitch';

const DamageResponseViewScreen = ({ navigation }) => {
  const route = useRoute();
  const data = route.params;
  // const sanitizedImageData = { ...data.data };
  // delete sanitizedImageData['licence_plate'];
  // delete sanitizedImageData['assessment_id'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageKeys = Object.keys(data.scannedImageLocal);
  const isFocused = useIsFocused();
  const [damageSwitch, setDamageSwitch] = useState(true);
  const [polygonSwitch, setPolygonSwitch] = useState(true);



  useEffect(() => {
    if (isFocused) {
      Orientation.lockToPortrait();
    } 
  }, [isFocused]);

  const handleNext = () => {
    if (currentIndex < imageKeys.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentImageKey = imageKeys[currentIndex];

  console.log("localimage",data.scannedImageLocal)

  // console.log("response",data.response[currentImageKey]?.ploted_damage)

  //const imageData = data.response[currentImageKey]?.ploted_damage.replace(/^b'/, '')

  const imageData = data.scannedImageLocal[currentImageKey]

  //console.log("substring",data.response[currentImageKey]?.ploted_damage.substring(0, 40).replace(/^b'\/9j\//, ''))

  const result = getDamageMidPoints(currentImageKey, data.response);
  const cropCordinate = data.response[currentImageKey].car_crop
  const panelPolygon = data.response[currentImageKey].panel_polygon
  const damagePolygon = data.response[currentImageKey].damage_polygon
  console.log("cordinates11",result);

  const handleDamageToggle = (isOn) => {
    setDamageSwitch(isOn);
  };

  const handlePolygonToggle = (isOn) => {
   setPolygonSwitch(isOn);
  };



  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Damages</Text>
      <View style={styles.upperContainer}>
      <View >
          <DrawMarkOnImage coordinates={result.coordinates}/>
        </View>
       <View style={styles.carouselContainer}>
       {/* <TouchableOpacity style={styles.damageEnalble} onPress={() => navigation.navigate(NavigationConstants.searchVehicleScreen)}>
        <Text style={styles.damageText}>Damage</Text>
      </TouchableOpacity> */}
      <View style={styles.switchRow}>
      <CustomSwitch label={'Damage'} onToggle={handleDamageToggle}/>
      <CustomSwitch label={'Panel'} onToggle={handlePolygonToggle}/>
      </View>
        <View style={styles.imageContainer}>
      <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
        <Text style={[styles.navigationText, { color: currentIndex === 0 ? 'grey' : 'black',paddingRight:16}]}>{'<'}</Text>
      </TouchableOpacity>
      <DrawPolygonOnImage imageSource={imageData} cropCordinate={cropCordinate} panelPolygon={panelPolygon} damagePolygon={damagePolygon} showDamagePolygon={damageSwitch}
              showPanelPolygon={polygonSwitch} />
      <TouchableOpacity onPress={handleNext} disabled={currentIndex === imageKeys.length - 1}>
        <Text style={[styles.navigationText, { color: currentIndex === imageKeys.length - 1? 'grey' : 'black',paddingLeft:16}]}>{'>'}</Text>
      </TouchableOpacity>
      </View>
      <Text style={styles.angleName}>{currentImageKey}</Text>
      
      </View>
      <TouchableOpacity style={styles.finalizeBtn} onPress={() => navigation.navigate(NavigationConstants.searchVehicleScreen)}>
        <Text style={styles.finalizeText}>Finalize</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1631C2',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  upperContainer: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 20,
    justifyContent:'space-evenly',
    alignItems: 'center',
  },
  carouselContainer:{
    height: '50%',
    //justifyContent: 'center',
    //alignItems: 'center',
    borderBlockColor: '#000',
    borderRadius: 20,
    shadowColor: '#000',
    borderColor: '#000',
    borderWidth:1,
  },
  imageContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal:50
  },
  image: {
    width: 280,
    height: 300,
    resizeMode: 'contain',
    //transform: [{ rotate: '-90deg' }],
  },
  navigationText: {
    fontSize: 41,
    fontWeight: 'bold',
    color: 'blue',
  },
  angleName:{
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    padding: 5,
    textAlign: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  finalizeText:{
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing:5
  },
  finalizeBtn:{
    backgroundColor: '#1631C2',
    width: 340,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'blue',
    borderWidth: 2,
    marginTop: 10,
  },
  bluePrintImage:{
    width: 350, 
    height: 180, 
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: 'black',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
});

export default DamageResponseViewScreen;
