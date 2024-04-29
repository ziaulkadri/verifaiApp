import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';

const CustomTextInput = ({ value, onChangeText, placeholder, iconName, ...rest }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (text: string) => {
    // Convert text to uppercase
    const uppercaseText = text.toUpperCase();
    onChangeText(uppercaseText);
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.textInput, isFocused && styles.focusedTextInput]}
        value={value}
        onChangeText={handleTextChange} // Handle text change with uppercase conversion
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

const SearchVehicleScreen = () => {
  const [plateNumber, setPlateNumber] = useState('');

  const handleSearchPress = () => {
    // Handle search logic here, e.g., call an API to search for the vehicle
    console.log('Searching for vehicle with plate number:', plateNumber);
  };

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <View style={styles.card}>
          <Text style={styles.text}>Plate Number</Text>
          <CustomTextInput
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder="Plate Number"
            iconName="search"
          />
          <TouchableOpacity style={styles.buttonContainer} onPress={handleSearchPress}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>
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
  upperContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20, // Adjust for desired roundness
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For shadows on Android (optional)
    marginTop: 20,
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    padding: 10,
    marginTop: 20,
    paddingRight: 40, // Adjust to accommodate the icon
    textTransform: 'uppercase', // Convert text to uppercase
  },
  focusedTextInput: {
    borderColor: '#00f', // Adjust for focused state
    fontSize: 18,
  },
  buttonContainer: {
    backgroundColor: '#00f',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    marginTop: 5,
    textAlign: 'left',
    color: '#000',
    fontSize: 18,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  icon: {
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: [{ translateY: -15 }], // Adjust for vertical centering
  },
  focusedIcon: {
    color: '#00f', // Adjust for focused state
  },
});

export default SearchVehicleScreen;
