// Actions written to `public.audit_log`. Free of DB imports so client code can show them.
export const AUDIT_ACTIONS = {
  statementImported: 'statement.imported',
  transactionMarkedOswiata: 'transaction.marked_oswiata',
  transactionUnmarkedOswiata: 'transaction.unmarked_oswiata',
  transactionMarkedProcessed: 'transaction.marked_processed',
  transactionUnmarkedProcessed: 'transaction.unmarked_processed',
  ownAccountAdded: 'own_account.added',
  ownAccountRemoved: 'own_account.removed',
  contextModulesChanged: 'context.modules_changed',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
