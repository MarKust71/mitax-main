import { configureStore } from '@reduxjs/toolkit';

import membersReducer from '../reducers/membersReducer/membersReducer';

export const store = configureStore({
  reducer: {
    members: membersReducer,
    // units: unitsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
