'use client';

import React, { useRef, useState } from 'react';

import type { ActivityLogPanelProps } from './AdminPanel.types';

import { listAuditLogAction } from '@/app/actions/auditLog';
import type { AuditLogCursor, AuditLogEntry, AuditLogFilters } from '@/app/actions/auditLogTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AUDIT_ACTION_LABELS } from '@/lib/auditActions';
import type { AuditAction } from '@/lib/auditActions';

const SEARCH_DEBOUNCE_MS = 250;
const selectClass = 'h-8 rounded-lg border border-border bg-background px-2 text-sm';

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'medium' });

const formatValue = (value: unknown): string =>
  Array.isArray(value) ? value.join(', ') || '—' : String(value ?? '—');

export const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({ contexts, initialPage }) => {
  const [entries, setEntries] = useState<AuditLogEntry[]>(initialPage.entries);
  const [nextCursor, setNextCursor] = useState<AuditLogCursor | null>(initialPage.nextCursor);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const requestSeq = useRef(0);

  const load = async (next: AuditLogFilters, cursor: AuditLogCursor | null) => {
    const seq = ++requestSeq.current;

    setLoading(true);

    const result = await listAuditLogAction(next, cursor);

    // Ignore responses of outdated requests (the filters changed meanwhile).
    if (seq !== requestSeq.current) {
      return;
    }

    setLoading(false);

    if (result.ok) {
      setEntries((current) =>
        cursor ? [...current, ...result.data.entries] : result.data.entries,
      );
      setNextCursor(result.data.nextCursor);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  const changeFilters = (patch: Partial<AuditLogFilters>, debounce = false) => {
    const next = { ...filters, ...patch };

    setFilters(next);
    clearTimeout(timer.current);

    if (debounce) {
      timer.current = setTimeout(() => void load(next, null), SEARCH_DEBOUNCE_MS);
    } else {
      void load(next, null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log aktywności</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Kontekst"
            value={filters.contextId ?? ''}
            onChange={(event) => changeFilters({ contextId: event.target.value })}
            className={selectClass}
          >
            <option value="">Wszystkie konteksty</option>
            {contexts.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label="Akcja"
            value={filters.action ?? ''}
            onChange={(event) => changeFilters({ action: event.target.value })}
            className={selectClass}
          >
            <option value="">Wszystkie akcje</option>
            {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="search"
            aria-label="Użytkownik"
            placeholder="Użytkownik (e-mail)"
            value={filters.user ?? ''}
            onChange={(event) => changeFilters({ user: event.target.value }, true)}
            className={`${selectClass} min-w-0 flex-1`}
          />
        </div>

        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}

        <ul aria-label="Wpisy logu" className="flex flex-col divide-y divide-border">
          {entries.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-0.5 py-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-medium">
                  {AUDIT_ACTION_LABELS[entry.action as AuditAction] ?? entry.action}
                </span>
                <time dateTime={entry.createdAt} className="text-xs text-muted-foreground">
                  {formatDate(entry.createdAt)}
                </time>
              </div>
              <div className="text-xs text-muted-foreground">
                {entry.userEmail}
                {' · '}
                {entry.contextName ?? 'bez kontekstu'}
                {entry.entityId && (
                  <>
                    {' · '}
                    <code>
                      {entry.entityType} {entry.entityId}
                    </code>
                  </>
                )}
              </div>
              {entry.details && Object.keys(entry.details).length > 0 && (
                <div className="break-words text-xs text-muted-foreground">
                  {Object.entries(entry.details)
                    .map(([key, value]) => `${key}: ${formatValue(value)}`)
                    .join(' · ')}
                </div>
              )}
            </li>
          ))}
          {entries.length === 0 && (
            <li className="py-4 text-center text-muted-foreground">Brak wpisów.</li>
          )}
        </ul>

        {nextCursor && (
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => void load(filters, nextCursor)}
          >
            {loading ? 'Wczytywanie…' : 'Pokaż starsze'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
