import { createSlice } from '@reduxjs/toolkit';
import { IFeatures } from '../wsTypes';

export interface FeaturesDataState {
  data: IFeatures;
}

const initialState: FeaturesDataState = { data: {} };

export const FeaturesDataSlice = createSlice({
  name: 'featuresData',
  initialState,
  reducers: {
    setFeaturesData: (state, { payload }) => {
      state.data = payload
    },
  },
});

export const { setFeaturesData } = FeaturesDataSlice.actions;

export default FeaturesDataSlice.reducer;