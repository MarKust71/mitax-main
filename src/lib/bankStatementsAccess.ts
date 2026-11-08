import type { SessionUser } from '@/lib/auth/session';

// What a user may do with bank statements in a context. For now everybody who can open the
// module may do everything; permission levels will be added here, in one place.
//   scope 'all'    -> sees every payment
//   scope 'oswiata' -> sees only payments flagged "oświata"
export type BankStatementsAccess = {
  canImport: boolean;
  canMark: boolean;
  canManageAccounts: boolean;
  scope: 'all' | 'oswiata';
};

export const getBankStatementsAccess = (user: SessionUser): BankStatementsAccess => {
  void user;

  return { canImport: true, canMark: true, canManageAccounts: true, scope: 'all' };
};
