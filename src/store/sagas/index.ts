import { all } from "redux-saga/effects";
import { vehicleWatcherSaga } from "./vehicle/VehicleWatcherSaga";
import { inferenceWatcherSaga } from "./inference/InferenceWatcherSaga";

export function* verifaiAppRootSaga() {

    console.log("Verifai")

    yield all([vehicleWatcherSaga(),inferenceWatcherSaga()]);

}
