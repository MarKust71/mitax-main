import type { PermissionKey } from '@/lib/permissions';

// What a user may do with bank statements in a context, derived from their permissions there.
// Without "bank_statements.all_operations" (the default) the list shows only payments flagged
// "oświata" - flagged earlier by someone with wider access. Such a user processes them, or turns
// the flag off, which hands the payment back to the people who see everything. With
// "bank_statements.all_operations" the user sees every payment.
// Importing statements needs "bank_statements.import", maintaining the own accounts list
// "bank_statements.own_accounts".
export type BankStatementsAccess = {
  canImport: boolean;
  canMark: boolean;
  canManageAccounts: boolean;
  scope: 'all' | 'oswiataOnly';
};

export const getBankStatementsAccess = (
  permissions: readonly PermissionKey[],
): BankStatementsAccess => ({
  canImport: permissions.includes('bank_statements.import'),
  canMark: true,
  canManageAccounts: permissions.includes('bank_statements.own_accounts'),
  scope: permissions.includes('bank_statements.all_operations') ? 'all' : 'oswiataOnly',
});
