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
    modelStroke?: string;
    modelColor?: string;
  },
}

export interface IMarkerSetting {
  type: number;
  image: string;
  size: number;
  opacity: number;
  model: string;
  modelStroke?: string;
  modelColor?: string;
}

export interface ModelSettingsState {
  type: number;
  image: string;
  size: number;
  opacity: number;
  model: string;
  modelStroke: StrokeType;
  modelColor: string;
  imageNames: string[];
  polygonModels: polygonModelsType;
  markerSettings: IMarkerSettings;
};

export type StrokeType = 'Solid' | 'Dashed';

export const initialState: ModelSettingsState = {
  type: 200,
  image: 'question.png',
  size: 0.25,
  opacity: 1,
  model: '',
  modelStroke: 'Solid',
  modelColor: '#000',
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

    changeModelStroke: (state, action: PayloadAction<StrokeType>) => {
      state.modelStroke = action.payload;
    },

    changeModelColor: (state, action: PayloadAction<string>) => {
      state.modelColor = action.payload;
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
      const isModel = !!action.payload.model;

       const newSettings: any = {
        image: action.payload.image,
        size: action.payload.size,
        alpha: action.payload.opacity,
        polygonModel: isModel ? action.payload.model : '-',
      };

      if (isModel) {
        newSettings.modelStroke = action.payload.modelStroke;
        newSettings.modelColor = action.payload.modelColor;
      } 

      state.markerSettings[action.payload.type] = newSettings;

      saveMarkerSettings(state.markerSettings);
    },
  },
});

export const { changeType, changeImage, changeSize, changeOpacity, changeModel, 
  changeImageNames, changePolygonModels, setMarkerSettings, changeMarkerSettings,
  changeModelStroke, changeModelColor } = modelSettingsSlice.actions;

export default modelSettingsSlice.reducer;