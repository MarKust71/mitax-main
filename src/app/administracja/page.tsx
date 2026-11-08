import { redirect } from 'next/navigation';

import { listContextsAction, listUsersAction } from '../actions/admin';
import { listAuditLogAction } from '../actions/auditLog';
import { AdminPanel } from '../adminPanel/AdminPanel';

import { getCurrentAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/');
  }

  const [users, contexts, auditLog] = await Promise.all([
    listUsersAction(''),
    listContextsAction(),
    listAuditLogAction({}, null),
  ]);

  return (
    <AdminPanel
      currentUserId={admin.id}
      initialUsers={users.ok ? users.data : []}
      initialContexts={contexts.ok ? contexts.data : []}
      initialAuditLog={auditLog.ok ? auditLog.data : { entries: [], nextCursor: null }}
    />
  );
}
