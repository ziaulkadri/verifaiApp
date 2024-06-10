import { takeLatest, put, call } from 'redux-saga/effects';
import { ACTION_GET_VEHICLE_REQUEST } from '../../constants';
import { GetVehicleRequest } from '../../actions';
import axios from 'axios';
import config from '../../../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to call the API to get vehicle information
const getVehicleAPI = async (plateNumber:any) => {
  const baseUrl = await AsyncStorage.getItem('baseUrl')
  console.log("baseUrl",baseUrl)
console.log(plateNumber)
let plate = "TS09SE9994" 
  try {
    //console.log(config.BASE_URL,plateNumber);
    const response = await axios.get(`${baseUrl}/vehicle/find?plateNumber=${plate}`);
    return response.data;
  } catch (error) {
    console.log("Failed to fetch vehicle information",error);
    //console.log('Failed to fetch vehicle information');
  }
};

// Saga function to handle the GET_VEHICLE_REQUEST action
function* getVehicle(action: GetVehicleRequest): Generator<any, void, any> {
    try {
    // Call the API to get vehicle information
    const vehicleInfo = yield call(getVehicleAPI, action.payload.plateNumber);

    if (vehicleInfo) {
        if (action.payload && action.payload.callback) {
          action.payload.callback(vehicleInfo);
        }
      }
    // Dispatch an action with the received vehicle information
    // Example: put({ type: 'SET_VEHICLE_INFO', payload: vehicleInfo });
  } catch (error) {
    // Handle errors
    console.error('Error fetching vehicle information:', error);
    // Dispatch an action to notify the failure
    // Example: put({ type: 'GET_VEHICLE_REQUEST_FAILED', error: error.message });
  }
}

// Watcher saga to listen for GET_VEHICLE_REQUEST actions
export function* vehicleWatcherSaga() {
  yield takeLatest(ACTION_GET_VEHICLE_REQUEST, getVehicle);
}
