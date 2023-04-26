import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Member } from '../../hooks/useMembers/useMembers.types';

interface MembersState {
  value: Member[];
}

const initialState: MembersState = {
  value: [],
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<Member[]>) => {
      state.value = action.payload;
    },
    /*
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
*/
  },
});

export const { setMembers } = membersSlice.actions;

export default membersSlice.reducer;
