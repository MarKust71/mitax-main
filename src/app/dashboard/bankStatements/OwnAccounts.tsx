'use client';

import React, { useState, useTransition } from 'react';

import type { OwnAccountsProps } from './BankStatements.types';

import { addOwnAccountAction, removeOwnAccountAction } from '@/app/actions/bankStatements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const inputClass = 'h-8 min-w-0 rounded-lg border border-border bg-background px-2.5 text-sm';

export const OwnAccounts: React.FC<OwnAccountsProps> = ({
  contextId,
  initialAccounts,
  canManage,
}) => {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [accountNumber, setAccountNumber] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await addOwnAccountAction(contextId, accountNumber, label);

      if (result.ok) {
        setAccounts((current) => [...current, result.data]);
        setAccountNumber('');
        setLabel('');
        setError(null);
      } else {
        setError(result.error);
      }
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      const result = await removeOwnAccountAction(contextId, id);

      if (result.ok) {
        setAccounts((current) => current.filter((account) => account.id !== id));
        setError(null);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rachunki własne</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <p className="text-xs text-muted-foreground">
          Wpłaty z tych rachunków (przelewy między własnymi kontami) są pomijane przy imporcie.
          Dotyczy to wyciągów wczytanych po dodaniu rachunku.
        </p>
        {canManage && (
          <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
            <input
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              placeholder="Numer rachunku"
              aria-label="Numer rachunku"
              className={`${inputClass} flex-1 font-mono`}
            />
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Opis (opcjonalnie)"
              aria-label="Opis rachunku"
              maxLength={80}
              className={`${inputClass} w-48`}
            />
            <Button type="submit" disabled={pending || !accountNumber.trim()}>
              Dodaj
            </Button>
          </form>
        )}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <ul aria-label="Rachunki własne" className="flex flex-col gap-1">
          {accounts.map((account) => (
            <li key={account.id} className="flex items-center justify-between gap-2">
              <span>
                <code className="text-xs">{account.accountNumber}</code>
                {account.label && (
                  <span className="ml-2 text-muted-foreground">{account.label}</span>
                )}
              </span>
              {canManage && (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => handleRemove(account.id)}
                  aria-label={`Usuń rachunek ${account.accountNumber}`}
                >
                  Usuń
                </Button>
              )}
            </li>
          ))}
          {accounts.length === 0 && <li className="text-muted-foreground">Brak rachunków.</li>}
        </ul>
      </CardContent>
    </Card>
  );
};
