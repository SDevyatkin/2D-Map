import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import MapCanvas from '../components/Map/MapCanvas';

export interface MapState {
  maps: {
    [key: string]: MapCanvas
  };
  selectedMap: string;
}

const initialState: MapState = {
  maps: {},
  selectedMap: '1',
};

export const MapSlice = createSlice({
  name: 'mapSlice',
  initialState,
  reducers: {
    appendMap: (state, action: PayloadAction<{id: string, Map: MapCanvas}>) => {
      state.maps[action.payload.id] = action.payload.Map;
    },
    selectMap: (state, action: PayloadAction<string>) => {
      state.selectedMap = action.payload;
    },
  },
});

export const { appendMap, selectMap } = MapSlice.actions;

export default MapSlice.reducer;