import { StatementParseError } from './types';

// "1 234,5" / "1234.50" / "1.234,50" -> "1234.50". Works on strings only, so no float rounding.
// The decimal separator is whichever of "," and "." comes last.
export const normalizeAmount = (raw: string): string => {
  const cleaned = raw.replace(/[\s\u00a0]/g, '');
  const separatorIndex = Math.max(cleaned.lastIndexOf(','), cleaned.lastIndexOf('.'));
  const integerPart = (separatorIndex > -1 ? cleaned.slice(0, separatorIndex) : cleaned).replace(
    /[.,]/g,
    '',
  );
  const fraction = separatorIndex > -1 ? cleaned.slice(separatorIndex + 1) : '';

  if (!/^\d+$/.test(integerPart || '0') || !/^\d{0,2}$/.test(fraction)) {
    throw new StatementParseError(`Nieprawidłowa kwota w pliku: "${raw}".`);
  }

  return `${integerPart || '0'}.${fraction.padEnd(2, '0')}`;
};
