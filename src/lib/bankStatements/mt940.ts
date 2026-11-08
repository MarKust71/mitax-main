import { normalizeAmount } from './amount';
import { StatementParseError } from './types';
import type { ParsedPayment } from './types';

type Field = { tag: string; value: string };

const clean = (value: string | undefined): string | null => {
  const trimmed = value?.replace(/\s+/g, ' ').trim();

  return trimmed ? trimmed : null;
};

// Splits the text into ":TAG:value" fields; lines without a tag continue the previous field.
const readFields = (text: string): Field[] => {
  const fields: Field[] = [];

  for (const line of text.split(/\r?\n/)) {
    const tagged = /^:(\d{2}[A-Z]?):(.*)$/.exec(line);

    if (tagged) {
      fields.push({ tag: tagged[1], value: tagged[2] });
    } else if (fields.length > 0 && !/^(-\}|\}|\{)/.test(line)) {
      fields[fields.length - 1].value += `\n${line}`;
    }
  }

  return fields;
};

// ":60F:" -> currency, e.g. "C241114PLN1000,00" -> "PLN".
const readCurrency = (value: string): string | null =>
  /^[CD]\d{6}([A-Z]{3})/.exec(value)?.[1] ?? null;

const toIsoDate = (yymmdd: string, entryMmdd?: string): string => {
  const yy = Number(yymmdd.slice(0, 2));
  const valueMonth = Number(yymmdd.slice(2, 4));
  let year = 2000 + yy;

  if (!entryMmdd) {
    return `${year}-${yymmdd.slice(2, 4)}-${yymmdd.slice(4, 6)}`;
  }

  // The entry date has no year: take the value date's year, adjusting around New Year.
  const entryMonth = Number(entryMmdd.slice(0, 2));

  if (valueMonth - entryMonth > 6) {
    year += 1;
  } else if (entryMonth - valueMonth > 6) {
    year -= 1;
  }

  return `${year}-${entryMmdd.slice(0, 2)}-${entryMmdd.slice(2, 4)}`;
};

// Polish banks put structured data in :86: as "020~00TYPE~20TITLE~21...~32NAME~38IBAN"
// (some use "?" instead of "~"). Anything else is kept as the title.
type Details = {
  title: string | null;
  counterpartyName: string | null;
  counterpartyAccount: string | null;
};

const parseDetails = (raw: string): Details => {
  const flat = raw.replace(/\r?\n/g, '');
  const separator = /[~?]\d{2}/.test(flat) ? /[~?](?=\d{2})/ : null;

  if (!separator) {
    return { title: clean(raw), counterpartyName: null, counterpartyAccount: null };
  }

  const subfields = new Map<number, string>();

  for (const part of flat.split(separator).slice(1)) {
    const code = Number(part.slice(0, 2));

    subfields.set(code, (subfields.get(code) ?? '') + part.slice(2));
  }

  const join = (from: number, to: number): string | null =>
    clean(
      Array.from({ length: to - from + 1 }, (_, index) => subfields.get(from + index) ?? '').join(
        '',
      ),
    );

  const bankAndAccount = [subfields.get(30), subfields.get(31)].filter(Boolean).join('');

  return {
    title: join(20, 29) ?? clean(subfields.get(0)),
    counterpartyName: join(32, 33),
    counterpartyAccount: clean(subfields.get(38)) ?? clean(bankAndAccount),
  };
};

const STATEMENT_LINE =
  /^(\d{6})(\d{4})?(R?[DC])([A-Z])?(\d+,\d*)[NFS]([A-Z0-9]{3})([^\n]*?)(?:\/\/([^\n]*))?(?:\n(.*))?$/s;

// Returns the incoming payments (credits) from an MT940 file; debits and reversals are skipped.
export const parseMt940 = (text: string): ParsedPayment[] => {
  const fields = readFields(text);
  const payments: ParsedPayment[] = [];
  let account: string | null = null;
  let currency: string | null = null;

  fields.forEach(({ tag, value }, index) => {
    if (tag === '25') {
      account = clean(value);
    } else if (tag === '60F' || tag === '60M') {
      currency = readCurrency(value);
    } else if (tag === '61') {
      const match = STATEMENT_LINE.exec(value.trim());

      if (!match) {
        throw new StatementParseError(`Nie można odczytać linii :61: "${value.slice(0, 40)}".`);
      }

      const [, valueDate, entryDate, mark, , rawAmount, , reference, bankReference, supplementary] =
        match;

      if (mark !== 'C') {
        return;
      }

      if (!currency) {
        throw new StatementParseError('Brak waluty w polu :60F: wyciągu.');
      }

      const next = fields[index + 1];
      const details = next?.tag === '86' ? parseDetails(next.value) : null;

      payments.push({
        accountNumber: account,
        bookingDate: toIsoDate(valueDate, entryDate),
        amount: normalizeAmount(rawAmount),
        currency,
        counterpartyName: details?.counterpartyName ?? null,
        counterpartyAccount: details?.counterpartyAccount ?? null,
        title: details?.title ?? clean(supplementary),
        bankReference: clean(bankReference) ?? (reference === 'NONREF' ? null : clean(reference)),
      });
    }
  });

  return payments;
};

export const looksLikeMt940 = (text: string): boolean => /^:20:/m.test(text) && /^:61:/m.test(text);
