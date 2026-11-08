'use client';

import React, { useState, useTransition } from 'react';

import { ContextsPanelProps } from './AdminPanel.types';

import { createContextAction } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ContextsPanel: React.FC<ContextsPanelProps> = ({ contexts, onCreated }) => {
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
            <li key={context.id} className="flex items-baseline justify-between gap-2">
              <span>{context.name}</span>
              <code className="text-xs text-muted-foreground">{context.schemaName}</code>
            </li>
          ))}
          {contexts.length === 0 && <li className="text-muted-foreground">Brak kontekstów.</li>}
        </ul>
      </CardContent>
    </Card>
  );
};
