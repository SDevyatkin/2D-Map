import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface PinObjectsState {
  objects: number[],
  selected: number | 'None',
}

const initialState: PinObjectsState = {
  objects: [],
  selected: 'None',
};

export const pinObjectsSlice = createSlice({
  name: 'pinObjects',
  initialState,
  reducers: {
    changePinObjects: (state, action: PayloadAction<number[]>) => {
      if (
        action.payload.length !== state.objects.length ||
        action.payload.some((pin) => state.objects.findIndex((obj) => obj === pin) === -1)
      ) {
        state.objects = action.payload;
      }
    },

    selectPinObject: (state, action: PayloadAction<number>) => {
      state.selected = action.payload;
    },
  },
});

export const { changePinObjects, selectPinObject } = pinObjectsSlice.actions;

export default pinObjectsSlice.reducer;