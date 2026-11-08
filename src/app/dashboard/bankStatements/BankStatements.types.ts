import type { BankPayment, OwnAccount } from '@/app/actions/bankStatementsTypes';

export type BankStatementsProps = {
  contextId: string;
  contextName: string;
  initialPayments: BankPayment[];
  canImport: boolean;
  canMark: boolean;
  ownAccounts: OwnAccount[];
  canManageAccounts: boolean;
};

export type OwnAccountsProps = {
  contextId: string;
  initialAccounts: OwnAccount[];
  canManage: boolean;
};

export type PaymentFilter = 'all' | 'oswiata' | 'toProcess';
