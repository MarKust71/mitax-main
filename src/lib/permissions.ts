import type { ModuleKey } from '@/lib/modules';

// Permissions a USER can be granted per context (`user_contexts.permissions`). ADMIN has them all.
// Each belongs to a module and only makes sense in contexts where the module is enabled.
// Free of DB imports so client components and the schema can use it.
export const PERMISSIONS = [
  { key: 'bank_statements.import', label: 'Import wyciągów', module: 'bank_statements' },
  { key: 'bank_statements.own_accounts', label: 'Rachunki własne', module: 'bank_statements' },
  { key: 'bank_statements.all_operations', label: 'Wszystkie operacje', module: 'bank_statements' },
] as const satisfies readonly { key: string; label: string; module: ModuleKey }[];

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

export const PERMISSION_KEYS: readonly PermissionKey[] = PERMISSIONS.map(({ key }) => key);

export const isPermissionKey = (value: unknown): value is PermissionKey =>
  typeof value === 'string' && (PERMISSION_KEYS as readonly string[]).includes(value);
