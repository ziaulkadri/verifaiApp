import { all } from "redux-saga/effects";
import { vehicleWatcherSaga } from "./vehicle/VehicleWatcherSaga";

export function* verifaiAppRootSaga() {

    console.log("Verifai")

    yield all([vehicleWatcherSaga()])

}
