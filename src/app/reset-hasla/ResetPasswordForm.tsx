'use client';

import React, { useState, useTransition } from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';

import { resetPasswordAction } from '@/app/actions/auth';
import type { AuthActionResult } from '@/app/actions/authTypes';
import { useAuthStore } from '@/providers/AuthStoreProvider';

export const ResetPasswordForm: React.FC<{ token: string }> = ({ token }) => {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const openDialog = useAuthStore((state) => state.openDialog);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => setResult(await resetPasswordAction(formData)));
  };

  if (result?.ok) {
    return (
      <Stack spacing={2}>
        <Alert severity="success">{result.message}</Alert>
        <Button variant="contained" onClick={() => openDialog('login')}>
          {'Zaloguj się'}
        </Button>
      </Stack>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {result && <Alert severity="error">{result.error}</Alert>}
        <input type="hidden" name="token" value={token} />
        <TextField
          name="password"
          type="password"
          label="Nowe hasło"
          autoComplete="new-password"
          required
          autoFocus
        />
        <TextField
          name="passwordConfirmation"
          type="password"
          label="Powtórz nowe hasło"
          autoComplete="new-password"
          required
        />
        <Button type="submit" variant="contained" disabled={pending}>
          {'Zmień hasło'}
        </Button>
      </Stack>
    </form>
  );
};
