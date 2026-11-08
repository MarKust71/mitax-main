// "PL 68 1090 2398 ..." / "68109023980000000167810977" -> the same value, so accounts written
// differently by the banks compare equal. Polish NRB numbers lose the "PL" prefix.
export const normalizeAccount = (raw: string): string =>
  raw
    .replace(/\s+/g, '')
    .toUpperCase()
    .replace(/^PL(?=\d{26}$)/, '');

export const isValidAccount = (normalized: string): boolean => /^[A-Z0-9]{15,34}$/.test(normalized);
