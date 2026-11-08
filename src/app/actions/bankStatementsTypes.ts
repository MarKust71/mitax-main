import type { Bank } from '@/lib/bankStatements/types';

export type BankPayment = {
  id: string;
  bank: Bank;
  bookingDate: string;
  amount: string;
  currency: string;
  counterpartyName: string | null;
  counterpartyAccount: string | null;
  title: string | null;
  bankReference: string | null;
  isOswiata: boolean;
  processedAt: string | null;
};

// total = payments considered (own-account transfers excluded), skipped = already imported.
export type ImportSummary = {
  bank: Bank;
  total: number;
  inserted: number;
  skipped: number;
  internal: number;
};

export type OwnAccount = { id: string; accountNumber: string; label: string | null };

export type BankActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
