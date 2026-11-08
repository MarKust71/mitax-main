'use client';

import React, { useRef, useState } from 'react';

import { UserDetails } from './UserDetails';
import { UsersPanelProps } from './AdminPanel.types';

import { getUserAction, listUsersAction } from '@/app/actions/admin';
import type { AdminUserDetails, AdminUserListItem } from '@/app/actions/adminTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SEARCH_DEBOUNCE_MS = 250;

export const UsersPanel: React.FC<UsersPanelProps> = ({
  currentUserId,
  initialUsers,
  contexts,
}) => {
  const [users, setUsers] = useState<AdminUserListItem[]>(initialUsers);
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
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {user.blocked ? `${user.role} · zablokowany` : user.role}
                    </span>
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
      </div>
    </div>
  );
};
