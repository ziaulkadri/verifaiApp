import React, { useEffect } from 'react';
import {StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NavigationConstants from '../constants/NavigationConstants';
import SplashScreen from './SplashScreen';
import SearchVehicleScren from './SearchVehicleScreen';
// import LoginScreen from './LoginScreen';

const Stack = createStackNavigator();

const MainScreen: React.FC = ({
}) => {
  const getNavigationContainer = () => {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={NavigationConstants.searchVehicleScreen}
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
            detachPreviousScreen: false,
          }}
        >
          <Stack.Screen
            name={NavigationConstants.splashScreen}
            component={SplashScreen}
          />
            {/* <Stack.Screen
            name={NavigationConstants.loginScreen}
            component={LoginScreen}
          /> */}
                    <Stack.Screen
            name={NavigationConstants.searchVehicleScreen}
            component={SearchVehicleScren}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };
  return (
    <>
      {/* {isInternetAvailable ? undefined : getInternetStatusBar()} */}
      {getNavigationContainer()}
      {/* <FleetableSpinner show={isSpinnerActive} /> */}
    </>
  );
};

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF',
  },
  networkSafeAreaViewStyle: {
    backgroundColor: "red",
  },
  networkViewStyle: {
    alignContent: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  networkTextStyle: {
    color: "Red",
    fontSize: 14,
  },
});





export default MainScreen
