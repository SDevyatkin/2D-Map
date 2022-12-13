import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import MapCanvas from '../components/Map/MapCanvas';

export interface MapState {
  maps: MapCanvas[];
}

const initialState: MapState = {
  maps: [new MapCanvas('map1'), new MapCanvas('map2'), new MapCanvas('map3'), new MapCanvas('map4')],
};

export const MapSlice = createSlice({
  name: 'mapSlice',
  initialState,
  reducers: {
    // setMap: (state, action: PayloadAction<MapCanvas>) => {
    //   state.map = action.payload;
    // },
  },
});

// export const { setMap } = MapSlice.actions;

export default MapSlice.reducer;