import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import MapCanvas from '../components/Map/MapCanvas';

export interface MapState {
  map: MapCanvas;
}

const initialState: MapState = {
  map: new MapCanvas(),
};

export const MapSlice = createSlice({
  name: 'mapSlice',
  initialState,
  reducers: {
    setMap: (state, action: PayloadAction<MapCanvas>) => {
      state.map = action.payload;
    },
  },
});

export const { setMap } = MapSlice.actions;

export default MapSlice.reducer;