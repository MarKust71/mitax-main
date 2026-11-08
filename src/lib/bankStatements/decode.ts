import { StatementParseError } from './types';

const MAX_BYTES = 1024 * 1024;

// XML files declare their encoding in the prolog (BPS uses ISO-8859-2, which differs from
// Windows-1250 in letters like ą, ś, ź), so honour it instead of guessing.
const declaredEncoding = (bytes: Uint8Array): string | null => {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 200));

  return /^\s*<\?xml[^>]*\bencoding\s*=\s*["']([\w.:-]+)["']/i.exec(head)?.[1] ?? null;
};

const decodeAs = (label: string, bytes: Uint8Array): string | null => {
  try {
    return new TextDecoder(label).decode(bytes);
  } catch {
    return null; // unknown encoding label
  }
};

// Other files (MT940) are UTF-8 or, in older exports, Windows-1250: try strict UTF-8 first.
export const decodeStatement = (bytes: Uint8Array): string => {
  if (bytes.length === 0) {
    throw new StatementParseError('Plik jest pusty.');
  }

  if (bytes.length > MAX_BYTES) {
    throw new StatementParseError('Plik jest zbyt duży (limit 1 MB).');
  }

  const declared = declaredEncoding(bytes);
  const fromDeclaration =
    declared && !/^utf-?8$/i.test(declared) ? decodeAs(declared, bytes) : null;

  if (fromDeclaration !== null) {
    return fromDeclaration.replace(/^﻿/, '');
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^﻿/, '');
  } catch {
    return new TextDecoder('windows-1250').decode(bytes);
  }
};
