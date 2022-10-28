import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { polygonModelsType } from '../components/Map/Map.interface';

export interface ModelSettingsState {
  type: number;
  image: string;
  size: number;
  opacity: number;
  model: string;
  imageNames: string[];
  polygonModels: polygonModelsType;
};

export const initialState: ModelSettingsState = {
  type: 200,
  image: 'question.png',
  size: 0.25,
  opacity: 1,
  model: '',
  imageNames: [],
  polygonModels: {},
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
  },
});

export const { changeType, changeImage, changeSize, changeOpacity,
  changeModel, changeImageNames, changePolygonModels } = modelSettingsSlice.actions;

export default modelSettingsSlice.reducer;