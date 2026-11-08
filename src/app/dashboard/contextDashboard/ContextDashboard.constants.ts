import type { ModuleKey } from '@/lib/modules';

// Shortcuts shown on the dashboard of a context that has the module enabled.
export const MODULE_SHORTCUTS: Record<
  ModuleKey,
  { label: string; description: string; path: string }
> = {
  ['bank_statements']: {
    label: 'Wyciągi bankowe',
    description: 'Import wyciągów Erste i BPS, oznaczanie wpłat',
    path: 'wyciagi',
  },
};
