import type { BankPayment, OwnAccount } from '@/app/actions/bankStatementsTypes';

export type BankStatementsProps = {
  userId: string;
  contextId: string;
  contextName: string;
  initialPayments: BankPayment[];
  canImport: boolean;
  canMark: boolean;
  // The user lacks "Wszystkie operacje": sees only payments flagged "oświata".
  restrictedView: boolean;
  ownAccounts: OwnAccount[];
  canManageAccounts: boolean;
};

export type OwnAccountsProps = {
  contextId: string;
  initialAccounts: OwnAccount[];
  canManage: boolean;
};

export type TriFilter = 'all' | 'only' | 'hide';
