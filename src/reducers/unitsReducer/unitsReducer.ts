import { createSlice } from '@reduxjs/toolkit';

import { Unit } from '../../hooks/useUnits/useUnits.types';

interface UnitsState {
  value: Unit[];
}

const initialState: UnitsState = {
  value: [],
};

const unitsSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    setUnits: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setUnits } = unitsSlice.actions;

export default unitsSlice.reducer;
