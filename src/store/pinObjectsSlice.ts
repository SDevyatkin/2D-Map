import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface PinObjectsState {
  data: {
    [key: number]: string
  },
  selected: number | null,
}

const initialState: PinObjectsState = {
  data: {},
  selected: null,
};

export const pinObjectsSlice = createSlice({
  name: 'pinObjects',
  initialState,
  reducers: {
    changePinObjects: (state, action: PayloadAction<[number, string]>) => {

      const key = action.payload[0];
      const value = action.payload[1];

      return {
        selected: state.selected,
        data: {
          ...state.data,
          key: value,
        }
      };
    },

    selectPinObject: (state, action: PayloadAction<number>) => {
      state.selected = action.payload;
    },
  },
});

export const { changePinObjects, selectPinObject } = pinObjectsSlice.actions;

export default pinObjectsSlice.reducer;