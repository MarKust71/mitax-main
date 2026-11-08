'use client';

import React, { useState } from 'react';

import { ActivityLogPanel } from './ActivityLogPanel';
import { ContextsPanel } from './ContextsPanel';
import { UsersPanel } from './UsersPanel';
import { AdminPanelProps } from './AdminPanel.types';
import { ADMIN_AREAS } from './AdminPanel.constants';
import type { AdminArea } from './AdminPanel.constants';

import type { AdminContext } from '@/app/actions/adminTypes';
import { cn } from '@/lib/utils';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUserId,
  initialUsers,
  initialContexts,
  initialAuditLog,
}) => {
  const [area, setArea] = useState<AdminArea>('users');
  const [contexts, setContexts] = useState<AdminContext[]>(initialContexts);

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Administracja</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[14rem_1fr]">
        <nav aria-label="Obszary administracji">
          <ul className="flex gap-1 md:flex-col">
            {ADMIN_AREAS.map(({ id, label }) => (
              <li key={id} className="md:w-full">
                <button
                  type="button"
                  onClick={() => setArea(id)}
                  aria-current={area === id ? 'page' : undefined}
                  className={cn(
                    'w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted',
                    area === id && 'bg-muted font-medium',
                  )}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-label={ADMIN_AREAS.find(({ id }) => id === area)?.label}>
          {area === 'users' && (
            <UsersPanel
              currentUserId={currentUserId}
              initialUsers={initialUsers}
              contexts={contexts}
            />
          )}
          {area === 'contexts' && (
            <ContextsPanel
              contexts={contexts}
              onCreated={(context) => setContexts((current) => [...current, context])}
              onModulesChanged={(contextId, modules) =>
                setContexts((current) =>
                  current.map((context) =>
                    context.id === contextId ? { ...context, modules } : context,
                  ),
                )
              }
            />
          )}
          {area === 'activity' && (
            <ActivityLogPanel contexts={contexts} initialPage={initialAuditLog} />
          )}
        </section>
      </div>
    </main>
  );
};
