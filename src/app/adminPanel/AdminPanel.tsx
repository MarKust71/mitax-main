'use client';

import React, { useRef, useState } from 'react';

import { ContextsPanel } from './ContextsPanel';
import { UserDetails } from './UserDetails';
import { AdminPanelProps } from './AdminPanel.types';

import { getUserAction, listUsersAction } from '@/app/actions/admin';
import type {
  AdminContext,
  AdminUserDetails,
  AdminUserListItem,
} from '@/app/actions/adminTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SEARCH_DEBOUNCE_MS = 250;

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUserId,
  initialUsers,
  initialContexts,
}) => {
  const [users, setUsers] = useState<AdminUserListItem[]>(initialUsers);
  const [contexts, setContexts] = useState<AdminContext[]>(initialContexts);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminUserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searchSeq = useRef(0);

  const runSearch = async (term: string) => {
    const seq = ++searchSeq.current;
    const result = await listUsersAction(term);

    // Ignore responses of outdated searches.
    if (seq !== searchSeq.current) {
      return;
    }

    if (result.ok) {
      setUsers(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void runSearch(value), SEARCH_DEBOUNCE_MS);
  };

  const handleSelect = async (id: string) => {
    const result = await getUserAction(id);

    if (result.ok) {
      setSelected(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  const handleSaved = (saved: AdminUserListItem) =>
    setUsers((current) => current.map((user) => (user.id === saved.id ? saved : user)));

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Administracja</h1>

      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Użytkownicy</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <input
              type="search"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Szukaj"
              aria-label="Szukaj użytkownika"
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
            />
            <ul className="flex max-h-96 flex-col overflow-y-auto" aria-label="Użytkownicy">
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => void handleSelect(user.id)}
                    aria-current={selected?.id === user.id}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5',
                      'text-left text-sm hover:bg-muted',
                      selected?.id === user.id && 'bg-muted font-medium',
                    )}
                  >
                    <span className="truncate">{user.email}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{user.role}</span>
                  </button>
                </li>
              ))}
              {users.length === 0 && (
                <li className="px-2 py-1.5 text-sm text-muted-foreground">Brak wyników.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konto</CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <UserDetails
                key={selected.id}
                user={selected}
                contexts={contexts}
                isSelf={selected.id === currentUserId}
                onSaved={handleSaved}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Wybierz użytkownika z listy.</p>
            )}
          </CardContent>
        </Card>

        <ContextsPanel
          contexts={contexts}
          onCreated={(context) => setContexts((current) => [...current, context])}
        />
      </div>
    </main>
  );
};
