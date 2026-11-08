'use client';

import React, { createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import type { AuthUser } from '@/app/actions/authTypes';
import { createAuthStore } from '@/store/authStore';
import type { AuthStore } from '@/store/authStore';

type AuthStoreApi = ReturnType<typeof createAuthStore>;

const AuthStoreContext = createContext<AuthStoreApi | null>(null);

export const AuthStoreProvider: React.FC<{
  initialUser?: AuthUser | null;
  children: React.ReactNode;
}> = ({ initialUser = null, children }) => {
  const storeRef = useRef<AuthStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createAuthStore(initialUser);
  }

  return <AuthStoreContext.Provider value={storeRef.current}>{children}</AuthStoreContext.Provider>;
};

export const useAuthStore = <T,>(selector: (state: AuthStore) => T): T => {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error('useAuthStore must be used within AuthStoreProvider');
  }

  return useStore(store, selector);
};
