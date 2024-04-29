import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'

import { verifaiAppRootReducer } from './reducers'
import {verifaiAppRootSaga} from './sagas'

// create the saga middleware
const sagaMiddleware = createSagaMiddleware()
// mount it on the Store
const verifaiStore = configureStore({
  reducer:verifaiAppRootReducer, 
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
})

// then run the saga
sagaMiddleware.run(verifaiAppRootSaga)

export default verifaiStore