import type { PaymentFilter } from './BankStatements.types';

export const FILTERS: { id: PaymentFilter; label: string }[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'oswiata', label: 'Oświata' },
  { id: 'toProcess', label: 'Oświata do przetworzenia' },
];
