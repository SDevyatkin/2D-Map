import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import MapCanvas from '../components/Map/MapCanvas';
import { WidgetsLayout } from './widgetSettingsSlice';

export type MapExtent = {
  [key: string]: {
    extent: Coordinate[],
    rotation: number,
    zoom: number,
  };
};

export interface MapState {
  maps: {
    [key: string]: MapCanvas
  };
  selectedMap: string;
  sidebarOpened: boolean;
  mapsExtents: MapExtent;
}

const initialState: MapState = {
  maps: {},
  selectedMap: '1',
  sidebarOpened: false,
  mapsExtents: {},
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

      document.querySelectorAll('.mapID').forEach(el => el.classList.remove('active-mapID'));
      document.getElementById(`map${state.selectedMap}`)?.querySelector('.mapID')?.classList.add('active-mapID');
    },
    toggleSidebarOpened: (state) => {
      state.sidebarOpened = !state.sidebarOpened;

      if (state.sidebarOpened) {
        document.getElementById(`map${state.selectedMap}`)?.querySelector('.mapID')?.classList.add('active-mapID');
      } else {
        document.querySelectorAll('.mapID').forEach(el => el.classList.remove('active-mapID'));
      }
    },
    updateExtens: (state) => {
      Object.entries(state.maps).forEach(item => {
        // const newExtent = item[1].getCurrentExtent();
        // console.log(item[0], newExtent)
        // state.mapsExtents[item[0]].extent = newExtent;
      });
    },
    setExtents: (state, action: PayloadAction<MapExtent>) => {
      const newState = {
        ...state.mapsExtents,
      };

      // console.log(action.payload);

      for (let id in action.payload) {
        newState[id] = action.payload[id];
        // if (newState.hasOwnProperty(id)) {
        //   newState[id].zoom = action.payload[id]
        //   newState[id].rotation = action.payload[id].rotation;
        //   newState[id].extent = action.payload[id].extent;
        // } else {
        //   newState[id] = action.payload[id];
        // }
      }

      state.mapsExtents = newState;

      for (let mapID in state.maps) {
        // console.log(mapID, newState);
        // console.log(mapID);
        state.maps[mapID].drawExtents(newState);
      }
    },
  },
});

export const { appendMap, selectMap, toggleSidebarOpened, updateExtens, setExtents } = MapSlice.actions;

export default MapSlice.reducer;