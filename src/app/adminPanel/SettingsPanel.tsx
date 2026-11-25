'use client';

import React, { useState, useTransition } from 'react';

import type { SettingsPanelProps } from './AdminPanel.types';

import { updateSettingAction } from '@/app/actions/settings';
import type { AppSettingsValues } from '@/app/actions/settingsTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SETTINGS_META } from '@/lib/settingsMeta';
import type { SettingKey } from '@/lib/settingsMeta';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ initialSettings }) => {
  const [saved, setSaved] = useState<AppSettingsValues>(initialSettings);
  const [drafts, setDrafts] = useState<Record<SettingKey, string>>(
    () =>
      Object.fromEntries(
        Object.entries(initialSettings).map(([key, value]) => [key, String(value)]),
      ) as Record<SettingKey, string>,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = (key: SettingKey) => {
    startTransition(async () => {
      const result = await updateSettingAction(key, Number(drafts[key]));

      if (result.ok) {
        setSaved(result.data);
        setDrafts((current) => ({ ...current, [key]: String(result.data[key]) }));
        setError(null);
        setMessage('Zapisano.');
      } else {
        setError(result.error);
        setMessage(null);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ustawienia</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
        <ul aria-label="Ustawienia aplikacji" className="flex flex-col divide-y divide-border">
          {SETTINGS_META.map(({ key, label, description, unit, min, max }) => (
            <li key={key} className="flex flex-col gap-1 py-3">
              <label htmlFor={`setting-${key}`} className="font-medium">
                {label}
              </label>
              <p className="text-xs text-muted-foreground">{description}</p>
              <div className="flex items-center gap-2">
                <input
                  id={`setting-${key}`}
                  type="number"
                  inputMode="numeric"
                  min={min}
                  max={max}
                  step={1}
                  value={drafts[key]}
                  onChange={(event) =>
                    setDrafts((current) => ({ ...current, [key]: event.target.value }))
                  }
                  className="h-8 w-28 rounded-lg border border-border bg-background px-2.5 text-sm"
                />
                <span className="text-xs text-muted-foreground">
                  {unit} (zakres {min}–{max})
                </span>
                <Button
                  type="button"
                  disabled={
                    pending || drafts[key].trim() === '' || Number(drafts[key]) === saved[key]
                  }
                  onClick={() => save(key)}
                  aria-label={`Zapisz: ${label}`}
                >
                  Zapisz
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
