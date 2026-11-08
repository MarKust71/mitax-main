import { load } from 'cheerio';
import type { Cheerio } from 'cheerio';
import type { Element } from 'domhandler';

import { normalizeAmount } from './amount';
import { StatementParseError } from './types';
import type { ParsedPayment } from './types';

export const looksLikeBpsXml = (xml: string): boolean =>
  /<WYCIAGI[\s>]/.test(xml) && /<OPERACJA[\s>]/.test(xml);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Name and title are split into fixed-width fragments (NAZWA1..4, TRESC1..4) that continue
// each other mid-word, so they are joined without a separator.
const joinFragments = (operation: Cheerio<Element>, prefix: string): string | null => {
  const joined = [1, 2, 3, 4]
    .map((index) => operation.children(`${prefix}${index}`).first().text())
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  return joined ? joined : null;
};

const child = (operation: Cheerio<Element>, name: string): string | null => {
  const value = operation.children(name).first().text().trim();

  return value ? value : null;
};

// BPS XML: <WYCIAGI><WYCIAG rachunek=".." waluta=".."><OPERACJA>..</OPERACJA>..</WYCIAG></WYCIAGI>.
// Incoming payments are operations with STRONA = C; the counterparty is NAZWA/RACHUNEK.
export const parseBpsXml = (xml: string): ParsedPayment[] => {
  const $ = load(xml, { xml: true });
  const payments: ParsedPayment[] = [];

  $('WYCIAG').each((_, statementNode) => {
    const statement = $(statementNode);
    const account = statement.attr('rachunek')?.trim() || null;
    const statementCurrency = statement.attr('waluta')?.trim() || null;

    statement.children('OPERACJA').each((__, operationNode) => {
      const operation = $(operationNode);

      if (child(operation, 'STRONA') !== 'C') {
        return;
      }

      const bookingDate = [
        child(operation, 'DATA_TRANSAKCJI'),
        child(operation, 'DATA_WALUTY'),
      ].find((date) => date && ISO_DATE.test(date));
      const amount = child(operation, 'KWOTA');
      const currency = child(operation, 'WALUTA') ?? statementCurrency;

      if (!bookingDate || !amount || !currency) {
        throw new StatementParseError(
          `Operacja ${child(operation, 'POZYCJA') ?? '?'} nie ma daty, kwoty lub waluty.`,
        );
      }

      payments.push({
        accountNumber: account,
        bookingDate,
        amount: normalizeAmount(amount),
        currency,
        counterpartyName: joinFragments(operation, 'NAZWA'),
        counterpartyAccount: child(operation, 'RACHUNEK'),
        title: joinFragments(operation, 'TRESC') ?? child(operation, 'OPIS'),
        bankReference: null,
      });
    });
  });

  return payments;
};
