// Optional features that can be switched on per context (`contexts.modules`).
// Free of DB imports so client components and the schema can use it.
export const MODULES = [{ key: 'bank_statements', label: 'Wyciągi bankowe' }] as const;

export type ModuleKey = (typeof MODULES)[number]['key'];

export const MODULE_KEYS: readonly ModuleKey[] = MODULES.map(({ key }) => key);

export const isModuleKey = (value: unknown): value is ModuleKey =>
  typeof value === 'string' && (MODULE_KEYS as readonly string[]).includes(value);
