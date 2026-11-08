import type { TriFilter } from './BankStatements.types';

// Each filter is independent: show everything, show only matching rows, or hide matching rows.
export const OSWIATA_FILTER_OPTIONS: { value: TriFilter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'only', label: 'Tylko oświata' },
  { value: 'hide', label: 'Ukryj oświatę' },
];

export const PROCESSED_FILTER_OPTIONS: { value: TriFilter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'only', label: 'Tylko przetworzone' },
  { value: 'hide', label: 'Ukryj przetworzone' },
];
