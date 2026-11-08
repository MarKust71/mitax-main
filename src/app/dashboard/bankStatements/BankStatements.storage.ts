import type { TriFilter } from './BankStatements.types';

export type StoredFilters = { oswiata: TriFilter; processed: TriFilter };

const VALUES: readonly string[] = ['all', 'only', 'hide'];

// Per user and context, so people sharing a browser do not inherit each other's choice.
const storageKey = (userId: string, contextId: string): string =>
  `bankStatements.filters.${userId}.${contextId}`;

const isFilter = (value: unknown): value is TriFilter =>
  typeof value === 'string' && VALUES.includes(value);

// Storage can be missing, blocked or hold garbage: every failure just means "no saved filters".
export const loadFilters = (userId: string, contextId: string): StoredFilters | null => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(userId, contextId)) ?? 'null');

    return isFilter(parsed?.oswiata) && isFilter(parsed?.processed)
      ? { oswiata: parsed.oswiata, processed: parsed.processed }
      : null;
  } catch {
    return null;
  }
};

export const saveFilters = (userId: string, contextId: string, filters: StoredFilters): void => {
  try {
    window.localStorage.setItem(storageKey(userId, contextId), JSON.stringify(filters));
  } catch {
    // Not persisted - the filters still work for this visit.
  }
};
