import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
// import { store } from './store';

export interface ZoomLevelState {
  level: number;
}

export const initialState = {
  level: 1
};

export const zoomLevelSlice = createSlice({
  name: 'zoomLevel',
  initialState,
  reducers: {
    changeZoomLevel: (state, action: PayloadAction<number>) => {
      state.level = action.payload;
      // store.getState().mapSlice.map.setZoomLevel(action.payload);
    },
  },
});

export const { changeZoomLevel } = zoomLevelSlice.actions;

export default zoomLevelSlice.reducer;