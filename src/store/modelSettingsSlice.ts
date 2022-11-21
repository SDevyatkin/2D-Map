import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { polygonModelsType } from '../components/Map/Map.interface';
import { saveMarkerSettings } from '../api';

export interface IMarkerSettings {
  [key: number]: {
    image: string,
    size: number,
    alpha: number,
    polygonModel: string,
  },
}

export interface IMarkerSetting {
  type: number;
  image: string;
  size: number;
  opacity: number;
  model: string;
}

export interface ModelSettingsState {
  type: number;
  image: string;
  size: number;
  opacity: number;
  model: string;
  imageNames: string[];
  polygonModels: polygonModelsType;
  markerSettings: IMarkerSettings;
};

export const initialState: ModelSettingsState = {
  type: 200,
  image: 'question.png',
  size: 0.25,
  opacity: 1,
  model: '',
  imageNames: [],
  polygonModels: {},
  markerSettings: {},
};

export const modelSettingsSlice = createSlice({
  name: 'modelSettings',
  initialState,
  reducers: {
    changeType: (state, action: PayloadAction<number>) => {
      state.type = action.payload;
    },

    changeImage: (state, action: PayloadAction<string>) => {
      state.image = action.payload;
    },

    changeSize: (state, action: PayloadAction<number>) => {
      state.size = action.payload;
    },

    changeOpacity: (state, action: PayloadAction<number>) => {
      state.opacity = action.payload;
    },

    changeModel: (state, action: PayloadAction<string>) => {
      state.model = action.payload;
    },

    changeImageNames: (state, action: PayloadAction<string[]>) => {
      state.imageNames = action.payload;
    },

    changePolygonModels: (state, action: PayloadAction<polygonModelsType>) => {
      state.polygonModels = action.payload;
    },

    setMarkerSettings: (state, action: PayloadAction<IMarkerSettings>) => {
      state.markerSettings = action.payload;
    },

    changeMarkerSettings: (state, action: PayloadAction<IMarkerSetting>) => {
      state.markerSettings[action.payload.type] = {
        image: action.payload.image,
        size: action.payload.size,
        alpha: action.payload.opacity,
        polygonModel: action.payload.model ? action.payload.model : '-',
      };

      saveMarkerSettings(state.markerSettings);
    },
  },
});

export const { changeType, changeImage, changeSize, changeOpacity, changeModel, 
  changeImageNames, changePolygonModels, setMarkerSettings, changeMarkerSettings } = modelSettingsSlice.actions;

export default modelSettingsSlice.reducer;