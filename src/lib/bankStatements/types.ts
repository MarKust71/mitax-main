export const BANKS = ['ERSTE', 'BPS'] as const;
export type Bank = (typeof BANKS)[number];

export const BANK_LABELS: Record<Bank, string> = { ERSTE: 'Erste', BPS: 'BPS' };

// An incoming payment in the common shape, whatever the source format.
export type ParsedPayment = {
  accountNumber: string | null;
  bookingDate: string; // YYYY-MM-DD
  amount: string; // decimal string with 2 places, e.g. "1234.50" (never a float)
  currency: string;
  counterpartyName: string | null;
  counterpartyAccount: string | null;
  title: string | null;
  bankReference: string | null;
};

export type ParsedStatement = {
  bank: Bank;
  payments: ParsedPayment[];
};

// Thrown for files we cannot read; the message is safe to show to the user.
export class StatementParseError extends Error {}
