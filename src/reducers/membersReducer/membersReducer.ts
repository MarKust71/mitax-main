import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Member } from '../../hooks/useMembers/useMembers.types';

interface MembersState {
  members: Member[];
  isFetching: boolean;
  isFetched: boolean;
}

const initialState: MembersState = {
  members: [],
  isFetching: false,
  isFetched: false,
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<Member[]>) => {
      state.members = action.payload;
    },
    setMembersFetching: (state, action: PayloadAction<boolean>) => {
      state.isFetching = action.payload;
    },
    setMembersFetched: (state, action: PayloadAction<boolean>) => {
      state.isFetched = action.payload;
    },
  },
});

export const { setMembers, setMembersFetching, setMembersFetched } = membersSlice.actions;

export default membersSlice.reducer;
