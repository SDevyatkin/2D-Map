import { configureStore, combineReducers } from '@reduxjs/toolkit';
import pinObjectsReducer from './pinObjectsSlice';
import zoomLevelReducer from './zoomLevelSlice';
import modelSettingsReducer from './modelSettingsSlice';
import thunk from 'redux-thunk';
import drawingSettingsSlice from './drawingSettingsSlice';
import mapReducer from './mapSlice';

export const reducer = combineReducers({
  Map: mapReducer,
  pinObjects: pinObjectsReducer,
  zoomLevel: zoomLevelReducer,
  modelSettings: modelSettingsReducer,
  drawingSettings: drawingSettingsSlice,
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(thunk),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;