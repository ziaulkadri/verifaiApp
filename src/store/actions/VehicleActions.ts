import {
  ACTION_GET_VEHICLE_REQUEST,
  } from '../constants';
    
  export interface GetVehicleRequestModal {
   // accessToken: string;
    plateNumber: string;
    callback?: Function;
  }
  
  export interface GetVehicleRequest {
    type: typeof ACTION_GET_VEHICLE_REQUEST;
    payload: GetVehicleRequestModal;
  }
  // action creators
  export const actionGetVehicleRequest = (
    request: GetVehicleRequestModal
  ): GetVehicleRequest => {
    return { type: ACTION_GET_VEHICLE_REQUEST, payload: request };
  };
  
  export type VehicleActions =
    | GetVehicleRequest
    
  