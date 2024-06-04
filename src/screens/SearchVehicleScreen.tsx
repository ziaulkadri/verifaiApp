import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';
import { useDispatch } from 'react-redux';
import { ACTION_GET_VEHICLE_REQUEST } from '../store/constants';
import { useIsFocused } from '@react-navigation/native'; // Import for navigation
import NavigationConstants from '../constants/NavigationConstants';
import Toast from 'react-native-toast-message';
import { generateUUID } from '../utils/utils';
import Orientation, { OrientationType } from 'react-native-orientation-locker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils/Responsiveness';

const CustomTextInput = ({ value, onChangeText, placeholder, iconName, ...rest }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (text) => {
    const uppercaseText = text.toUpperCase();
    onChangeText(uppercaseText);
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.textInput, isFocused && styles.focusedTextInput]}
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />
      {iconName && (
        <Icon name={iconName} size={30} style={[styles.icon, isFocused && styles.focusedIcon]} />
      )}
    </View>
  );
};

const SearchVehicleScreen = ({ navigation }) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [isValidPlate, setIsValidPlate] = useState(false);
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [urlsSaved, setUrlsSaved] = useState(false);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [orientation, setOrientation] = useState(Orientation.getInitialOrientation());

  const handleVehicleInfo = (vehicleInfo) => {
    if (vehicleInfo?.error) {
      Toast.show({
        type: 'error',
        text1: 'Vehicle Not Found',
      });
    } else if (vehicleInfo.plateNumber) {
      const assessment_id = generateUUID(10);
      vehicleInfo.assessment_id = assessment_id;
      navigation.navigate(NavigationConstants.damageRecordingScreen, { vehicleInfo });
    }
  };

  const handleSearchPress = () => {
    if (plateNumber.trim() !== '') {
      const payload = {
        plateNumber: plateNumber,
        callback: handleVehicleInfo,
      };
      dispatch({ type: ACTION_GET_VEHICLE_REQUEST, payload });
    } else {
      console.log('Please enter a valid plate number');
    }
  };

  const handleSaveUrls = async () => {
    try {
      await AsyncStorage.setItem('baseUrl', url1);
      await AsyncStorage.setItem('modelUrl', url2);
      setUrlsSaved(true);
      
    } catch (error) {
      console.error('Error saving URLs to AsyncStorage', error);
    }
  };

  useEffect(() => {
    const handleOrientationChange = (newOrientation) => {
      setOrientation(newOrientation);
    };

    if (isFocused) {
      Orientation.lockToPortrait();
      Orientation.addOrientationListener(handleOrientationChange);
    } else {
      Orientation.unlockAllOrientations();
      Orientation.removeOrientationListener(handleOrientationChange);
    }

    // const getUrlsFromStorage = async () => {
    //   try {
    //     const storedUrl1 = await AsyncStorage.getItem('url1');
    //     const storedUrl2 = await AsyncStorage.getItem('url2');
    //     console.log(storedUrl1, storedUrl2);
    //     if (storedUrl1 && storedUrl2) {
    //       setUrl1(storedUrl1);
    //       setUrl2(storedUrl2);
    //       setUrlsSaved(true);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching URLs from AsyncStorage', error);
    //   }
    // };

    // getUrlsFromStorage();

    return () => {
      Orientation.unlockAllOrientations();
      Orientation.removeOrientationListener(handleOrientationChange);
    };
  }, [isFocused]);

  const handlePlateChange = (text) => {
    setPlateNumber(text);
    setIsValidPlate(text.trim().length >= 3 && text.trim().length <= 10);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          {!urlsSaved ? (
            <View style={styles.card}>
              <Text style={styles.text}>Enter BASE URL</Text>
              <TextInput
                style={styles.textInput}
                value={url1}
                onChangeText={setUrl1}
                placeholder="URL 1"
              />
              <Text style={styles.text}>Enter MODEL URL</Text>
              <TextInput
                style={styles.textInput}
                value={url2}
                onChangeText={setUrl2}
                placeholder="URL 2"
              />
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={handleSaveUrls}
              >
                <Text style={styles.buttonText}>Save URLs</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.text}>Plate Number</Text>
              <CustomTextInput
                value={plateNumber}
                onChangeText={handlePlateChange}
                placeholder="Plate Number"
                iconName="search"
              />
              <TouchableOpacity
                style={[styles.buttonContainer, !isValidPlate && styles.disabledButton]}
                onPress={handleSearchPress}
                disabled={!isValidPlate}
              >
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <Toast
        position='top'
        bottomOffset={20}
        visibilityTime={2000}
        autoHide={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'),
    backgroundColor: '#1631C2',
  },
  upperContainer: {
    flex: 1,
    padding: wp('2.5%'),
    backgroundColor: '#fff',
    borderRadius: wp('5%'),
    marginTop: hp('2.5%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('5%'), // Adjust for desired roundness
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For shadows on Android (optional)
    marginTop: hp('2.5%'),
  },
  textInput: {
    height: hp('5%'),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: wp('1.25%'),
    marginBottom: hp('2.5%'),
    padding: wp('2.5%'),
    marginTop: hp('2.5%'),
    paddingRight: wp('10%'), // Adjust to accommodate the icon
    color: '#000',
  },
  focusedTextInput: {
    borderColor: '#00f', // Adjust for focused state
    fontSize: wp('4.5%'),
  },
  buttonContainer: {
    backgroundColor: '#00f',
    padding: wp('3.75%'),
    borderRadius: wp('1.25%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc', // Adjust for disabled state
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  text: {
    marginTop: hp('0.5%'),
    textAlign: 'left',
    color: '#000',
    fontSize: wp('4.5%'),
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  icon: {
    position: 'absolute',
    top: '50%',
    right: wp('2.5%'),
    transform: [{ translateY: -15 }], // Adjust for vertical centering
  },
  focusedIcon: {
    color: '#00f', // Adjust for focused state
  },
});

export default SearchVehicleScreen;
