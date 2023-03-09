import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveSessionSidebarSettings } from '../api';

export type ObjectType = number | 'None';

export type DrawingMode = 'LineString' | 'Polygon' | 'Circle' | 'Point' | 'None';

export type InfoModalPlacement = 'binded' | 'fixed';

export interface IViewSettings {
  object: ObjectType;
  zoom: number;
  locked: boolean;
  rotation: number;
  gridStep: number;
};

export interface IDistanceSettings {
  object1: ObjectType,
  object2: ObjectType,
  color: string;
}

export interface IRouteSettings {
  object: ObjectType,
  color: string,
}

export interface IInfoModalSettings {
  object: ObjectType;
  placement: InfoModalPlacement
}

export interface SidebarState {
  [key: number]: {
    drawingMode: DrawingMode,
    viewSettings: IViewSettings,
    distanceSettings: IDistanceSettings,
    routeSettings: IRouteSettings,
    featureInfoID: number,
    infoModalSettings: IInfoModalSettings,
  }
}

export const initialState: SidebarState = {
  1: {
    drawingMode: 'None',
    viewSettings: {
      object: 'None',
      zoom: 3,
      locked: false,
      rotation: 0,
      gridStep: 10000,
    },
    distanceSettings: {
      object1: 'None',
      object2: 'None',
      color: '#000',
    },
    routeSettings: {
      object: 'None',
      color: '#000',
    },
    infoModalSettings: {
      object: 'None',
      placement: 'fixed',
    },
    featureInfoID: -1,
  },
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    addNewMap: (state, action: PayloadAction<number>) => {
      state[action.payload] = {
        drawingMode: 'None',
        viewSettings: {
          object: 'None',
          zoom: 3,
          locked: false,
          rotation: 0,
          gridStep: 1000,
        },
        distanceSettings: {
          object1: 'None',
          object2: 'None',
          color: '#000',
        },
        routeSettings: {
          object: 'None',
          color: '#000',
        },
        infoModalSettings: {
          object: 'None',
          placement: 'fixed',
        },
        featureInfoID: -1,
      };
      // saveSessionSidebarSettings(state);
    },

    setDrawingMode: (state, action: PayloadAction<{map: number, mode: DrawingMode}>) => {
      state[action.payload.map].drawingMode = action.payload.mode;
      saveSessionSidebarSettings(state);
    },

    setViewSettings: (state, action: PayloadAction<{map: number, settings: IViewSettings}>) => {
      state[action.payload.map].viewSettings = action.payload.settings;
      saveSessionSidebarSettings(state);
    },

    setDistanceSettings: (state, action: PayloadAction<{map: number, settings: IDistanceSettings}>) => {
      state[action.payload.map].distanceSettings = action.payload.settings;
      saveSessionSidebarSettings(state);
    },

    setRouteSettings: (state, action: PayloadAction<{map: number, settings: IRouteSettings}>) => {
      state[action.payload.map].routeSettings = action.payload.settings;
      saveSessionSidebarSettings(state);
    },

    setInfoModalSettings: (state, action: PayloadAction<{map: number, settings: IInfoModalSettings}>) => {
      state[action.payload.map].infoModalSettings = action.payload.settings;
      saveSessionSidebarSettings(state);
    },

    setFeatureInfoID: (state, action: PayloadAction<{map: number, id: number}>) => {
      state[action.payload.map].featureInfoID = action.payload.id;
      saveSessionSidebarSettings(state);
    },

    setSidebarSettings: (state, action: PayloadAction<SidebarState>) => {
      for (let id in action.payload) {
        state[Number(id)] = action.payload[id];
      }
    },
  },
});

export const { addNewMap, setDrawingMode, setViewSettings, setDistanceSettings, 
  setRouteSettings, setFeatureInfoID, setInfoModalSettings, setSidebarSettings } = sidebarSlice.actions;

export default sidebarSlice.reducer;