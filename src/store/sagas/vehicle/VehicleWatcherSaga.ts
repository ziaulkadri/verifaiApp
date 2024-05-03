import { takeLatest, put, call } from 'redux-saga/effects';
import { ACTION_GET_VEHICLE_REQUEST } from '../../constants';
import { GetVehicleRequest } from '../../actions';
import axios from 'axios';

// Function to call the API to get vehicle information
const getVehicleAPI = async (plateNumber:any) => {
  try {
    // const response = await axios.get(`https://ziauls-macbook-pro.local/vehicle/find?plateNumber=${plateNumber}`);
    // return response.data; // Assuming the response contains the data you need

    const response = await axios.get(`https://ziauls-macbook-pro.local/api/vehicle/welcome?name=eh`);
    console.log("RESPONSE",response)
    return response.data; // Assuming the response contains the data you need
    
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch vehicle information');
  }
};

// Saga function to handle the GET_VEHICLE_REQUEST action
function* getVehicle(action: GetVehicleRequest): Generator<any, void, any> {
  console.log('came here watcher saga')
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
