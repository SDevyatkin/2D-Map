import { createSlice } from '@reduxjs/toolkit';
import { IFeatures } from '../wsTypes';

export interface FeaturesDataState {
  data: any;
  fields: Record<string, Record<string, boolean>>;
}

const DEFAULT_FIELDS = ["id", "type", "X", "Y", "Z", "lat", "lon", "altitude", "yaw", "parentID"];

const initialState: FeaturesDataState = { 
  data: {},
  fields: {},
};

export const FeaturesDataSlice = createSlice({
  name: 'featuresData',
  initialState,
  reducers: {
    setFeaturesData: (state, { payload }) => {
      for (let feature of payload) {
        if (!feature.id) continue;

        state.data[feature.id] = feature;
      }

      for (let feature of payload) {
        if (
          !("id" in feature) ||
          feature.id in state.fields
        ) continue

        state.fields[feature.id] = {};
        for (let field of Object.keys(feature)) {
          state.fields[feature.id][field] = DEFAULT_FIELDS.some(f => f === field);
        }
      }
    },

    setField: (state, { payload }) => {
      state.fields[payload.object][payload.field] = payload.checked;
    }
  },
});

export const { setFeaturesData, setField } = FeaturesDataSlice.actions;

export default FeaturesDataSlice.reducer;