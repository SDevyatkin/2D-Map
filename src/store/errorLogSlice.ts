import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ErrorType = {
  error: Error;
  date: Date;
};

export type MergedErrorType = {
  error: Error;
  dateFrom: Date;
  dateTo: Date;
  count: number;
};

interface ErrorLogState {
  opened: boolean;
  signaling: boolean;
  errors: ErrorType[];
  mergedErrors: MergedErrorType[];
}

const initialState: ErrorLogState = {
  opened: false,
  signaling: false,
  errors: [],
  mergedErrors: [],
};

export const errorLogSlice = createSlice({
  name: 'errorLogSlice',
  initialState,
  reducers: {
    setOpened: (state, action: PayloadAction<boolean>) => {
      state.opened = action.payload;

      if (state.signaling && action.payload) {
        state.signaling = false;
      }
    },
    pushError: (state, action: PayloadAction<Error>) => {
      const currentDate = new Date();

      state.errors.push({
        error: action.payload,
        date: currentDate,
      });

      const lastError = state.mergedErrors.at(-1) ? state.mergedErrors.at(-1)?.error : null;
      if (lastError && lastError.name === action.payload.name && lastError.message === action.payload.message) {  
        // @ts-ignore
        state.mergedErrors.at(-1).count += 1;
        // @ts-ignore
        state.mergedErrors.at(-1).dateTo = currentDate;
      } else {
        state.mergedErrors.push({
          error: action.payload,
          dateFrom: currentDate,
          dateTo: currentDate,
          count: 1,
        });
      }

      if (!state.opened) {
        state.signaling = true;
      } 
    },
  },
});

export const { setOpened, pushError } = errorLogSlice.actions;

export default errorLogSlice.reducer;