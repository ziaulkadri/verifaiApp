import { takeLatest, put, call, delay } from 'redux-saga/effects';
import {ACTION_POST_INFERENCE_REQUEST } from '../../constants';
import {PostInferenceRequest } from '../../actions';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const postInferenceAPI = async (payload:any) => {
  const baseUrl = await AsyncStorage.getItem('baseUrl')
  //console.log("baseUrl",baseUrl)
  //console.log("",payload)
  try {
    const response = await axios.post(`${baseUrl}/assessment/create`, payload);
    return response.data;
  } catch (error) {
    console.log("Failed to post inference",error);
  }
};

const getInferenceResponse = async (assessment_id:string) => {
  const baseUrl = await AsyncStorage.getItem('baseUrl')
  try {
    const response = await axios.get(`${baseUrl}/assessment/getAssessmentById?assessment_id=${assessment_id}`);
    return response.data;
  } catch (error) {
    console.log("Failed to fetch inferecnce response",error);
  }
};

function* pollForAssessmentResponse(assessmentId: string, maxAttempts = 10, delayDuration = 120000): Generator<any, void, any> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const assessmentResponse = yield call(getInferenceResponse, assessmentId);

    // Check if the assessmentResponse is valid (you may need to adjust this based on your response structure)
    if (assessmentResponse && assessmentResponse.vehicle_angles[0].assessmentPanels.length > 0) {
      return assessmentResponse;
    }

    // Wait for a while before the next attempt
    yield delay(delayDuration);
    attempts += 1;
  }

  throw new Error('Timed out waiting for assessment response');
}


function* postInference(action: PostInferenceRequest): Generator<any, void, any> {
  //console.log("action",action)
    try {
    const inferenceResponse = yield call(postInferenceAPI, action.payload.data);
    console.log("inferenceResponse", inferenceResponse)
    if (inferenceResponse.assessmentId) {
      const assessmentResponse = yield call(pollForAssessmentResponse,inferenceResponse.assessmentId) //"16197b0f-44f9-4f7e-8a38-d3c0f2d01e1f");
      console.log("assessmentResponse", assessmentResponse.vehicle_id)

        if (action.payload && action.payload.callback) {
          action.payload.callback(assessmentResponse);
        }
      } 
  } catch (error) {
    console.error('Error in inference:', error);
  }
}

export function* inferenceWatcherSaga() {
  yield takeLatest(ACTION_POST_INFERENCE_REQUEST, postInference);
}
