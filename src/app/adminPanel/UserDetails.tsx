'use client';

import React, { useState, useTransition } from 'react';

import { UserDetailsProps } from './AdminPanel.types';

import { setUserBlockedAction, updateUserAction } from '@/app/actions/admin';
import { PERMISSIONS } from '@/lib/permissions';
import type { PermissionKey } from '@/lib/permissions';
import { USER_ROLES } from '@/lib/roles';
import type { UserRole } from '@/lib/roles';
import { Button } from '@/components/ui/button';

export const UserDetails: React.FC<UserDetailsProps> = ({ user, contexts, isSelf, onSaved }) => {
  const [role, setRole] = useState<UserRole>(user.role);
  // contextId -> permissions in it; a context is assigned when it has an entry.
  const [assignments, setAssignments] = useState<Record<string, PermissionKey[]>>(() =>
    Object.fromEntries(
      user.assignments.map(({ contextId, permissions }) => [contextId, permissions]),
    ),
  );
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [blockedAt, setBlockedAt] = useState<string | null>(user.blockedAt);
  const [pending, startTransition] = useTransition();

  const toggleContext = (id: string) =>
    setAssignments((current) => {
      if (id in current) {
        const { [id]: _removed, ...rest } = current;

        void _removed;

        return rest;
      }

      return { ...current, [id]: [] };
    });

  const togglePermission = (contextId: string, permission: PermissionKey) =>
    setAssignments((current) => {
      const granted = current[contextId] ?? [];

      return {
        ...current,
        [contextId]: granted.includes(permission)
          ? granted.filter((item) => item !== permission)
          : [...granted, permission],
      };
    });

  // Assigned contexts that have a module with permissions to grant.
  const grantable = contexts
    .filter((context) => context.id in assignments)
    .map((context) => ({
      context,
      available: PERMISSIONS.filter(({ module }) => context.modules.includes(module)),
    }))
    .filter(({ available }) => available.length > 0);

  const handleSave = () =>
    startTransition(async () => {
      const result = await updateUserAction({
        userId: user.id,
        role,
        assignments: Object.entries(assignments).map(([contextId, permissions]) => ({
          contextId,
          permissions,
        })),
      });

      if (result.ok) {
        onSaved({
          id: user.id,
          email: user.email,
          role,
          active: user.active,
          blocked: Boolean(blockedAt),
        });
        setMessage({ text: 'Zapisano.', isError: false });
      } else {
        setMessage({ text: result.error, isError: true });
      }
    });

  const handleToggleBlocked = () =>
    startTransition(async () => {
      const result = await setUserBlockedAction(user.id, !blockedAt);

      if (result.ok) {
        setBlockedAt(result.data.blockedAt);
        onSaved({
          id: user.id,
          email: user.email,
          role: user.role,
          active: user.active,
          blocked: Boolean(result.data.blockedAt),
        });
        setMessage({
          text: result.data.blockedAt ? 'Konto zablokowane.' : 'Konto odblokowane.',
          isError: false,
        });
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
        <dt className="text-muted-foreground">Blokada</dt>
        <dd>
          {blockedAt ? `Zablokowane (${new Date(blockedAt).toLocaleString('pl-PL')})` : 'Brak'}
        </dd>
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
                checked={context.id in assignments}
                onChange={() => toggleContext(context.id)}
              />
              {context.name}
            </label>
          ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2" disabled={role === 'ADMIN'}>
        <legend className="mb-1 text-muted-foreground">Uprawnienia</legend>
        {role === 'ADMIN' && <p>ADMIN ma wszystkie uprawnienia.</p>}
        {role !== 'ADMIN' && grantable.length === 0 && (
          <p className="text-muted-foreground">
            Brak uprawnień do nadania. Przypisz kontekst z włączonym modułem.
          </p>
        )}
        {role !== 'ADMIN' &&
          grantable.map(({ context, available }) => (
            <fieldset key={context.id} className="flex flex-col gap-1">
              <legend className="font-medium">{context.name}</legend>
              {available.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={assignments[context.id].includes(key)}
                    onChange={() => togglePermission(context.id, key)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={pending}>
          Zapisz
        </Button>
        {!isSelf && (
          <Button
            variant={blockedAt ? 'outline' : 'destructive'}
            onClick={handleToggleBlocked}
            disabled={pending}
          >
            {blockedAt ? 'Odblokuj' : 'Zablokuj'}
          </Button>
        )}
        {message && (
          <span role="status" className={message.isError ? 'text-destructive' : undefined}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
};
