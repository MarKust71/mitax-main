import { createStore } from 'zustand/vanilla';

import type { AuthUser } from '@/app/actions/authTypes';

export type AuthMode = 'login' | 'register';

export type AuthState = {
  user: AuthUser | null;
  dialogOpen: boolean;
  mode: AuthMode;
};

export type AuthActions = {
  setUser: (user: AuthUser | null) => void;
  openDialog: (mode?: AuthMode) => void;
  closeDialog: () => void;
  setMode: (mode: AuthMode) => void;
};

export type AuthStore = AuthState & AuthActions;

// A store per provider instance (not a module-level singleton): client components are also
// rendered on the server, where a global store would be shared between users' requests.
export const createAuthStore = (user: AuthUser | null = null) =>
  createStore<AuthStore>()((set) => ({
    user,
    dialogOpen: false,
    mode: 'login',
    setUser: (nextUser) => set({ user: nextUser }),
    openDialog: (mode = 'login') => set({ dialogOpen: true, mode }),
    closeDialog: () => set({ dialogOpen: false }),
    setMode: (mode) => set({ mode }),
  }));
