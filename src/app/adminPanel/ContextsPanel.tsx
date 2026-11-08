'use client';

import React, { useState, useTransition } from 'react';

import { ContextsPanelProps } from './AdminPanel.types';

import { createContextAction, setContextModulesAction } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MODULES } from '@/lib/modules';

export const ContextsPanel: React.FC<ContextsPanelProps> = ({
  contexts,
  onCreated,
  onModulesChanged,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createContextAction(name);

      if (result.ok) {
        onCreated(result.data);
        setName('');
        setError(null);
      } else {
        setError(result.error);
      }
    });
  };

  const toggleModule = (contextId: string, current: string[], key: string, enabled: boolean) => {
    const next = enabled ? [...current, key] : current.filter((item) => item !== key);

    startTransition(async () => {
      const result = await setContextModulesAction(contextId, next);

      if (result.ok) {
        onModulesChanged(contextId, result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konteksty</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nazwa nowego kontekstu"
            aria-label="Nazwa nowego kontekstu"
            maxLength={60}
            className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 text-sm"
          />
          <Button type="submit" disabled={pending || !name.trim()}>
            Dodaj
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Nowy kontekst tworzy osobny schemat w bazie danych.
        </p>
        <ul aria-label="Konteksty" className="flex flex-col gap-1">
          {contexts.map((context) => (
            <li
              key={context.id}
              className="flex flex-col gap-1 border-b border-border py-2 last:border-0"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span>{context.name}</span>
                <code className="text-xs text-muted-foreground">{context.schemaName}</code>
              </div>
              <fieldset className="flex flex-wrap gap-x-4 gap-y-1" disabled={pending}>
                <legend className="sr-only">Moduły kontekstu {context.name}</legend>
                {MODULES.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={context.modules.includes(key)}
                      onChange={(event) =>
                        toggleModule(context.id, context.modules, key, event.target.checked)
                      }
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
            </li>
          ))}
          {contexts.length === 0 && <li className="text-muted-foreground">Brak kontekstów.</li>}
        </ul>
      </CardContent>
    </Card>
  );
};
