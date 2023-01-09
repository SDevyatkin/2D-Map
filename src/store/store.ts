import { configureStore, combineReducers } from '@reduxjs/toolkit';
import pinObjectsReducer from './pinObjectsSlice';
import zoomLevelReducer from './zoomLevelSlice';
import modelSettingsReducer from './modelSettingsSlice';
import thunk from 'redux-thunk';
import drawingSettingsSlice from './drawingSettingsSlice';
import mapReducer from './mapSlice';
import featuresDataSlice from './featuresDataSlice';
import sidebarReducer from './sidebarSlice';
import widgetSettingsReducer from './widgetSettingsSlice';

export const reducer = combineReducers({
  Map: mapReducer,
  pinObjects: pinObjectsReducer,
  zoomLevel: zoomLevelReducer,
  modelSettings: modelSettingsReducer,
  drawingSettings: drawingSettingsSlice,
  featuresData: featuresDataSlice,
  sidebar: sidebarReducer,
  widgetSettings: widgetSettingsReducer,
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(thunk),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;