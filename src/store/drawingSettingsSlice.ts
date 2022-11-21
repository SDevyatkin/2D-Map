import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DrawingSettingsState {
  options: {
    [key: string]: string,
  },
  selected: string,
}

export const initialState: DrawingSettingsState = {
  options: {
    'LineString': 'Непрерывная линия',
    'Polygon': 'Зона',
    'Circle': 'Окружность',
    'Point': 'Точка',
  },
  selected: 'None',
};

export const drawingSettingsSlice = createSlice({
  name: 'drawingSettings',
  initialState,
  reducers: {
    selectDrawingMode: (state, action: PayloadAction<string>) => {
      state.selected = action.payload;
    },
  },
});

export const { selectDrawingMode } = drawingSettingsSlice.actions;

export default drawingSettingsSlice.reducer;