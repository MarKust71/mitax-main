'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { FileText, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { OSWIATA_FILTER_OPTIONS, PROCESSED_FILTER_OPTIONS } from './BankStatements.constants';
import { loadFilters, saveFilters } from './BankStatements.storage';
import { OwnAccounts } from './OwnAccounts';
import type { BankStatementsProps, TriFilter } from './BankStatements.types';

import {
  importStatementAction,
  setOswiataAction,
  setProcessedAction,
} from '@/app/actions/bankStatements';
import type { BankPayment } from '@/app/actions/bankStatementsTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BANK_LABELS } from '@/lib/bankStatements/types';
import { cn } from '@/lib/utils';

const formatAmount = (amount: string, currency: string): string => {
  try {
    // Polish rules skip the thousands separator below 10 000; "always" keeps all amounts alike.
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency,
      useGrouping: 'always',
    }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
};

const passes = (value: boolean, filter: TriFilter): boolean =>
  filter === 'all' || (filter === 'only' ? value : !value);

const selectClass = 'h-8 rounded-lg border border-border bg-background px-2 text-sm';

export const BankStatements: React.FC<BankStatementsProps> = ({
  userId,
  contextId,
  contextName,
  initialPayments,
  canImport,
  canMark,
  restrictedView,
  ownAccounts,
  canManageAccounts,
}) => {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [payments, setPayments] = useState(initialPayments);
  const [oswiataFilter, setOswiataFilter] = useState<TriFilter>('all');
  const [processedFilter, setProcessedFilter] = useState<TriFilter>('all');
  // Saved filters are read after mount: the server render has no localStorage.
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [importing, startImport] = useTransition();
  const [, startMark] = useTransition();

  useEffect(() => {
    const saved = loadFilters(userId, contextId);

    if (saved) {
      setOswiataFilter(saved.oswiata);
      setProcessedFilter(saved.processed);
    }
    setFiltersLoaded(true);
  }, [userId, contextId]);

  useEffect(() => {
    if (filtersLoaded) {
      saveFilters(userId, contextId, { oswiata: oswiataFilter, processed: processedFilter });
    }
  }, [filtersLoaded, userId, contextId, oswiataFilter, processedFilter]);

  // router.refresh() after an import delivers new server data.
  useEffect(() => setPayments(initialPayments), [initialPayments]);

  const handleImport = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startImport(async () => {
      const result = await importStatementAction(contextId, formData);

      if (result.ok) {
        const { bank, total, inserted, skipped, internal } = result.data;

        setMessage({
          error: false,
          text:
            `${BANK_LABELS[bank]}: ${total} wpłat w pliku, dodano ${inserted}, pominięto ${skipped} (już były)` +
            (internal > 0 ? `; pominięto ${internal} przelewów między własnymi rachunkami.` : '.'),
        });
        if (fileInput.current) {
          fileInput.current.value = '';
        }
        setFileName(null);
        router.refresh();
      } else {
        setMessage({ error: true, text: result.error });
      }
    });
  };

  const mark = (
    payment: BankPayment,
    action: typeof setOswiataAction | typeof setProcessedAction,
    value: boolean,
  ) => {
    setBusyId(payment.id);
    startMark(async () => {
      const result = await action(contextId, payment.id, value);

      if (result.ok) {
        // In the restricted view a payment whose "oświata" flag was turned off goes back to the
        // people who see everything, so it leaves this list.
        setPayments((current) =>
          current.flatMap((item) => {
            if (item.id !== result.data.id) {
              return [item];
            }

            return restrictedView && !result.data.isOswiata ? [] : [result.data];
          }),
        );
        setMessage(null);
      } else {
        setMessage({ error: true, text: result.error });
      }
      setBusyId(null);
    });
  };

  // In the restricted view the "oświata" filter is hidden and every payment is "oświata" already,
  // so a saved value must not apply there (it could hide the whole list with no way to undo).
  const effectiveOswiata: TriFilter = restrictedView ? 'all' : oswiataFilter;
  const filtersActive = effectiveOswiata !== 'all' || processedFilter !== 'all';
  const visible = payments.filter(
    (payment) =>
      passes(payment.isOswiata, effectiveOswiata) &&
      passes(payment.processedAt !== null, processedFilter),
  );

  const clearFilters = () => {
    setOswiataFilter('all');
    setProcessedFilter('all');
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wyciągi bankowe</h1>
        <p className="text-sm text-muted-foreground">{contextName}</p>
        {restrictedView && (
          <p className="mt-1 text-sm text-muted-foreground">
            Widzisz tylko wpłaty oznaczone jako „oświata”. Odznaczenie „oświata” zwraca wpłatę
            osobom z wyższymi uprawnieniami, a zapis znika z tej listy.
          </p>
        )}
      </div>

      {canImport && (
        <Card>
          <CardHeader>
            <CardTitle>Wczytaj wyciąg</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <form
              onSubmit={handleImport}
              className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
            >
              <label
                className={cn(
                  'flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed',
                  'px-4 py-3 transition-colors',
                  'focus-within:ring-2 focus-within:ring-ring hover:border-foreground/40 hover:bg-muted/50',
                  fileName ? 'border-foreground/30 bg-muted/40' : 'border-border',
                )}
              >
                <input
                  ref={fileInput}
                  type="file"
                  name="file"
                  accept=".sta,.mt940,.mt940x,.940,.940x,.txt,.xml,text/xml,text/plain"
                  aria-label="Plik wyciągu"
                  required
                  onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
                  className="sr-only"
                />
                {fileName ? (
                  <FileText aria-hidden className="size-5 shrink-0" />
                ) : (
                  <Upload aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                )}
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {fileName ?? 'Kliknij, aby wybrać plik wyciągu'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {fileName ? 'Kliknij, aby wybrać inny plik' : 'Erste (MT940x) lub BPS (XML)'}
                  </span>
                </span>
              </label>
              <Button type="submit" size="lg" disabled={importing || !fileName} className="sm:px-6">
                {importing ? 'Wczytywanie…' : 'Wczytaj wyciąg'}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              Format jest rozpoznawany po zawartości pliku. Zapisywane są tylko wpłaty, a wcześniej
              wczytane są pomijane.
            </p>
          </CardContent>
        </Card>
      )}

      {message && (
        <p
          role={message.error ? 'alert' : 'status'}
          className={cn('text-sm', message.error && 'text-destructive')}
        >
          {message.text}
        </p>
      )}

      <div
        role="group"
        aria-label="Filtry wpłat"
        className="flex flex-wrap items-center gap-3 text-sm"
      >
        {!restrictedView && (
          <label className="flex items-center gap-1.5">
            Oświata:
            <select
              value={oswiataFilter}
              onChange={(event) => setOswiataFilter(event.target.value as TriFilter)}
              className={selectClass}
            >
              {OSWIATA_FILTER_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center gap-1.5">
          Przetworzone:
          <select
            value={processedFilter}
            onChange={(event) => setProcessedFilter(event.target.value as TriFilter)}
            className={selectClass}
          >
            {PROCESSED_FILTER_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {filtersActive && (
          <Button type="button" size="sm" variant="ghost" onClick={clearFilters}>
            Wyczyść filtry
          </Button>
        )}
        <span role="status" className="ml-auto text-xs text-muted-foreground">
          Wyświetlono {visible.length} z {payments.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Data</th>
              <th className="px-3 py-2 font-medium">Bank</th>
              <th className="px-3 py-2 text-right font-medium">Kwota</th>
              <th className="px-3 py-2 font-medium">Wpłacający</th>
              <th className="px-3 py-2 font-medium">Tytuł</th>
              <th className="px-3 py-2 font-medium">Oświata</th>
              <th className="px-3 py-2 font-medium">Przetworzony</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((payment) => (
              <tr key={payment.id} className="border-t border-foreground/10 align-top">
                <td className="whitespace-nowrap px-3 py-2">{payment.bookingDate}</td>
                <td className="px-3 py-2">{BANK_LABELS[payment.bank]}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                  {formatAmount(payment.amount, payment.currency)}
                </td>
                <td className="px-3 py-2">
                  <div>{payment.counterpartyName ?? '—'}</div>
                  {payment.counterpartyAccount && (
                    <div className="font-mono text-xs text-muted-foreground">
                      {payment.counterpartyAccount}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">{payment.title ?? '—'}</td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={payment.isOswiata}
                    disabled={!canMark || busyId === payment.id}
                    onChange={(event) => mark(payment, setOswiataAction, event.target.checked)}
                    aria-label={`Oświata: wpłata ${payment.bookingDate} ${payment.amount}`}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={payment.processedAt !== null}
                    disabled={!canMark || busyId === payment.id}
                    onChange={(event) => mark(payment, setProcessedAction, event.target.checked)}
                    aria-label={`Przetworzony: wpłata ${payment.bookingDate} ${payment.amount}`}
                  />
                  {payment.processedAt && (
                    <div className="text-xs text-muted-foreground">
                      {payment.processedAt.slice(0, 10)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  Brak wpłat do wyświetlenia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Wyświetlane jest do 500 najnowszych wpłat.</p>

      {canManageAccounts && (
        <OwnAccounts contextId={contextId} initialAccounts={ownAccounts} canManage />
      )}
    </section>
  );
};
