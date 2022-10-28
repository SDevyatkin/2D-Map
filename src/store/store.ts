import { configureStore, combineReducers } from '@reduxjs/toolkit';
import pinObjectsReducer from './pinObjectsSlice';
import zoomLevelReducer from './zoomLevelSlice';
import modelSettingsReducer from './modelSettingsSlice';
import thunk from 'redux-thunk';

export const reducer = combineReducers({
  pinObjects: pinObjectsReducer,
  zoomLevel: zoomLevelReducer,
  modelSettings: modelSettingsReducer,
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;