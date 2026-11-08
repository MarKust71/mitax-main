'use client';

import React, { useState, useTransition } from 'react';

import { UserDetailsProps } from './AdminPanel.types';

import { updateUserAction } from '@/app/actions/admin';
import { USER_ROLES } from '@/lib/roles';
import type { UserRole } from '@/lib/roles';
import { Button } from '@/components/ui/button';

export const UserDetails: React.FC<UserDetailsProps> = ({ user, contexts, isSelf, onSaved }) => {
  const [role, setRole] = useState<UserRole>(user.role);
  const [contextIds, setContextIds] = useState<string[]>(user.contextIds);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const toggleContext = (id: string) =>
    setContextIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const handleSave = () =>
    startTransition(async () => {
      const result = await updateUserAction({ userId: user.id, role, contextIds });

      if (result.ok) {
        onSaved({ id: user.id, email: user.email, role, active: user.active });
        setMessage({ text: 'Zapisano.', isError: false });
      } else {
        setMessage({ text: result.error, isError: true });
      }
    });

  return (
    <div className="flex flex-col gap-4 text-sm">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-muted-foreground">Nazwa użytkownika</dt>
        <dd className="break-all">{user.email}</dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd>{user.active ? 'Aktywne' : 'Oczekuje na aktywację'}</dd>
        <dt className="text-muted-foreground">Utworzone</dt>
        <dd>{new Date(user.createdAt).toLocaleString('pl-PL')}</dd>
        {user.emailVerifiedAt && (
          <>
            <dt className="text-muted-foreground">Aktywowane</dt>
            <dd>{new Date(user.emailVerifiedAt).toLocaleString('pl-PL')}</dd>
          </>
        )}
      </dl>

      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Rola</span>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          disabled={isSelf}
          className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
        >
          {USER_ROLES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-1" disabled={role === 'ADMIN'}>
        <legend className="mb-1 text-muted-foreground">Konteksty</legend>
        {role === 'ADMIN' && <p>ADMIN działa we wszystkich kontekstach.</p>}
        {role !== 'ADMIN' && contexts.length === 0 && (
          <p className="text-muted-foreground">Brak zdefiniowanych kontekstów.</p>
        )}
        {role !== 'ADMIN' &&
          contexts.map((context) => (
            <label key={context.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={contextIds.includes(context.id)}
                onChange={() => toggleContext(context.id)}
              />
              {context.name}
            </label>
          ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={pending}>
          Zapisz
        </Button>
        {message && (
          <span role="status" className={message.isError ? 'text-destructive' : undefined}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
};
