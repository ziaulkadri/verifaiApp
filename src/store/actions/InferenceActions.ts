import {
    ACTION_POST_INFERENCE_REQUEST,
    } from '../constants';
      
    interface payloadData {
      client_id: string;
      vehicle_id: string;
      scanned_images: any[];
      reference_number:string;
      latitude:number;
      longitude:number;
      startTime:string;
      status:string;
      createdBy_id:string;
    }
    export interface PostInferenceRequestModal {
     // accessToken: string;
      data: payloadData;
      callback?: Function;
    }
    
    export interface PostInferenceRequest {
      type: typeof ACTION_POST_INFERENCE_REQUEST;
      payload: PostInferenceRequestModal;
    }
    // action creators
    export const actionPostInferenceRequest = (
      request: PostInferenceRequestModal
    ): PostInferenceRequest => {
      return { type: ACTION_POST_INFERENCE_REQUEST, payload: request };
    };
    
    export type InferenceActions =
      | PostInferenceRequest
      
    