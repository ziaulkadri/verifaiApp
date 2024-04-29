import React from 'react';
import {Provider} from 'react-redux';
import verifaiStore from './src/store/store';
import { StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import MainScreen from './src/screens/MainScreen';




function App(): React.JSX.Element {
  return (
  <Provider store={verifaiStore}>
    <MainScreen/>
  </Provider>
  );
}

const styles = StyleSheet.create({

});

export default App;
