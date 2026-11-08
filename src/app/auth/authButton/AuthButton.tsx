'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';


import { AuthDialog } from '../authDialog/AuthDialog';

import { AuthButtonProps } from './AuthButton.types';
import { styles } from './AuthButton.styles';

import { useAuthStore } from '@/providers/AuthStoreProvider';
import { logoutAction } from '@/app/actions/auth';

export const AuthButton: React.FC<AuthButtonProps> = ({}) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const openDialog = useAuthStore((state) => state.openDialog);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setUser(null);
      router.refresh();
    });
  };

  return (
    <Box sx={styles.wrapper}>
      {user ? (
        <>
          <Typography variant="body2">{user.email}</Typography>
          <Button size="small" onClick={handleLogout} disabled={pending}>
            {'Wyloguj'}
          </Button>
        </>
      ) : (
        <Button size="small" onClick={() => openDialog('login')}>
          {'Zaloguj'}
        </Button>
      )}
      <AuthDialog />
    </Box>
  );
};
