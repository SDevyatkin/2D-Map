import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WidgetsLayout = '1' | '2v' | '2h' | '3t' | '3b' | '3l' | '3r' | '4';

export interface WidgetSettingsState {
  widgetsLayout: WidgetsLayout;
}

const initialState: WidgetSettingsState = {
  widgetsLayout: '1',
};

export const WidgetSettingsSlice = createSlice({
  name: 'widgetSettings',
  initialState,
  reducers: {
    setLayout: (state, action: PayloadAction<WidgetsLayout>) => {
      // console.log(action.payload);
      state.widgetsLayout = action.payload;
    },
  },
});

export const { setLayout } = WidgetSettingsSlice.actions;

export default WidgetSettingsSlice.reducer;