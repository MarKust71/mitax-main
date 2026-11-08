import { createHash } from 'node:crypto';

import { looksLikeBpsXml, parseBpsXml } from './bps';
import { decodeStatement } from './decode';
import { looksLikeMt940, parseMt940 } from './mt940';
import { StatementParseError } from './types';
import type { ParsedPayment, ParsedStatement } from './types';

export * from './types';

// Recognizes the format from the content (not the file name): MT940 -> Erste, BPS XML (<WYCIAGI>) -> BPS.
export const parseStatement = (bytes: Uint8Array): ParsedStatement => {
  const text = decodeStatement(bytes);

  if (looksLikeMt940(text)) {
    return { bank: 'ERSTE', payments: parseMt940(text) };
  }

  if (looksLikeBpsXml(text)) {
    return { bank: 'BPS', payments: parseBpsXml(text) };
  }

  throw new StatementParseError(
    'Nie rozpoznano formatu pliku. Obsługiwane: MT940 (Erste) oraz XML BPS.',
  );
};

// Stable key of a payment. Identical payments within one file (same data, e.g. two equal fees
// from the same payer) get consecutive numbers, so re-importing the file yields the same keys.
export const dedupKeys = (payments: ParsedPayment[]): string[] => {
  const seen = new Map<string, number>();

  return payments.map((payment) => {
    const base = createHash('sha256')
      .update(
        [
          payment.accountNumber,
          payment.bookingDate,
          payment.amount,
          payment.currency,
          payment.counterpartyAccount,
          payment.counterpartyName,
          payment.title,
          payment.bankReference,
        ].join('\u0001'),
      )
      .digest('hex');
    const occurrence = (seen.get(base) ?? 0) + 1;

    seen.set(base, occurrence);

    return `${base}:${occurrence}`;
  });
};

export const sha256 = (bytes: Uint8Array): string =>
  createHash('sha256').update(bytes).digest('hex');
