'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  TextField,
} from '@mui/material';

import { AuthDialogProps } from './AuthDialog.types';

import { loginAction, registerAction, resendActivationAction } from '@/app/actions/auth';
import type { AuthActionResult } from '@/app/actions/authTypes';
import { useAuthStore } from '@/providers/AuthStoreProvider';


export const AuthDialog: React.FC<AuthDialogProps> = ({}) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const open = useAuthStore((state) => state.dialogOpen);
  const mode = useAuthStore((state) => state.mode);
  const setMode = useAuthStore((state) => state.setMode);
  const setUser = useAuthStore((state) => state.setUser);
  const closeDialog = useAuthStore((state) => state.closeDialog);

  const isLogin = mode === 'login';

  const handleClose = () => {
    setResult(null);
    closeDialog();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await (isLogin ? loginAction(formData) : registerAction(formData));

      if (response.ok && response.user) {
        setUser(response.user);
        handleClose();
        router.refresh();

        return;
      }

      setResult(response);
    });
  };

  const handleResend = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const form = event.currentTarget.closest('form');
    const formData = new FormData();
    formData.set('email', String(new FormData(form!).get('email') ?? ''));

    startTransition(async () => setResult(await resendActivationAction(formData)));
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isLogin ? 'Logowanie' : 'Rejestracja'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {result && (
              <Alert severity={result.ok ? 'success' : 'error'}>
                {result.ok ? result.message : result.error}
              </Alert>
            )}
            <TextField
              name="email"
              type="email"
              label="Adres e-mail"
              autoComplete="email"
              required
              autoFocus
            />
            <TextField
              name="password"
              type="password"
              label="Hasło"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
            {isLogin && (
              <Link component="button" type="button" variant="body2" onClick={handleResend}>
                {'Wyślij ponownie link aktywacyjny'}
              </Link>
            )}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => {
                setResult(null);
                setMode(isLogin ? 'register' : 'login');
              }}
            >
              {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
            </Link>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{'Anuluj'}</Button>
          <Button type="submit" variant="contained" disabled={pending}>
            {isLogin ? 'Zaloguj' : 'Zarejestruj'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
