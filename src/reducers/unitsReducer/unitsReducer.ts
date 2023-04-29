import { createSlice } from '@reduxjs/toolkit';

import { Unit } from '../../hooks/useUnits/useUnits.types';

interface UnitsState {
  units: Unit[];
  isFetching: boolean;
  isFetched: boolean;
}

const initialState: UnitsState = {
  units: [],
  isFetching: false,
  isFetched: false,
};

const unitsSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    setUnits: (state, action) => {
      state.units = action.payload;
    },
    setUnitsFetching: (state, action) => {
      state.isFetching = action.payload;
    },
    setUnitsFetched: (state, action) => {
      state.isFetched = action.payload;
    },
  },
});

export const { setUnits, setUnitsFetching, setUnitsFetched } = unitsSlice.actions;

export default unitsSlice.reducer;
