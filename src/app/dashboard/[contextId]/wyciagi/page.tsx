import { notFound, redirect } from 'next/navigation';

import { BankStatements } from '../../bankStatements/BankStatements';

import { getCurrentUser } from '@/lib/auth/session';
import { listBankPayments, listOwnAccounts } from '@/lib/bankPayments';
import { getBankStatementsAccess } from '@/lib/bankStatementsAccess';
import { getContextPermissions, getModuleContext } from '@/lib/contexts';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ contextId: string }> }) {
  const [{ contextId }, user] = await Promise.all([params, getCurrentUser()]);

  if (!user) {
    redirect('/');
  }

  // 404 for unknown contexts, ones without access and ones without the module.
  const context = await getModuleContext(user, contextId, 'bank_statements');

  if (!context) {
    notFound();
  }

  const access = getBankStatementsAccess(await getContextPermissions(user, context.id));
  const [payments, ownAccounts] = await Promise.all([
    listBankPayments(context.id, access),
    // The own accounts list is visible only to users who may manage it.
    access.canManageAccounts ? listOwnAccounts(context.id) : Promise.resolve([]),
  ]);

  return (
    <BankStatements
      userId={user.id}
      contextId={context.id}
      contextName={context.name}
      initialPayments={payments}
      canImport={access.canImport}
      canMark={access.canMark}
      restrictedView={access.scope === 'oswiataOnly'}
      ownAccounts={ownAccounts}
      canManageAccounts={access.canManageAccounts}
    />
  );
}
