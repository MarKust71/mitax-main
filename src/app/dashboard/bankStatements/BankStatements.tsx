'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { FILTERS } from './BankStatements.constants';
import { OwnAccounts } from './OwnAccounts';
import type { BankStatementsProps, PaymentFilter } from './BankStatements.types';

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
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
};

const matches = (payment: BankPayment, filter: PaymentFilter): boolean => {
  if (filter === 'oswiata') {
    return payment.isOswiata;
  }

  return filter === 'toProcess' ? payment.isOswiata && !payment.processedAt : true;
};

export const BankStatements: React.FC<BankStatementsProps> = ({
  contextId,
  contextName,
  initialPayments,
  canImport,
  canMark,
  ownAccounts,
  canManageAccounts,
}) => {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [payments, setPayments] = useState(initialPayments);
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [importing, startImport] = useTransition();
  const [, startMark] = useTransition();

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
        setPayments((current) =>
          current.map((item) => (item.id === result.data.id ? result.data : item)),
        );
        setMessage(null);
      } else {
        setMessage({ error: true, text: result.error });
      }
      setBusyId(null);
    });
  };

  const visible = payments.filter((payment) => matches(payment, filter));

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wyciągi bankowe</h1>
        <p className="text-sm text-muted-foreground">{contextName}</p>
      </div>

      {canImport && (
        <Card>
          <CardHeader>
            <CardTitle>Wczytaj wyciąg</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <form onSubmit={handleImport} className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInput}
                type="file"
                name="file"
                accept=".sta,.mt940,.940,.txt,.xml,text/xml,text/plain"
                aria-label="Plik wyciągu"
                required
                className="min-w-0 flex-1 text-sm"
              />
              <Button type="submit" disabled={importing}>
                {importing ? 'Wczytywanie…' : 'Wczytaj'}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              Erste: MT940. BPS: XML. Format jest rozpoznawany po zawartości pliku; zapisywane są
              tylko wpłaty, a wcześniej wczytane są pomijane.
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

      <div role="group" aria-label="Filtr wpłat" className="flex flex-wrap gap-1">
        {FILTERS.map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={filter === id ? 'default' : 'outline'}
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {label}
          </Button>
        ))}
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

      <OwnAccounts
        contextId={contextId}
        initialAccounts={ownAccounts}
        canManage={canManageAccounts}
      />
    </section>
  );
};
