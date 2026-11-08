import { redirect } from 'next/navigation';

import { listContextsAction, listUsersAction } from '../actions/admin';
import { AdminPanel } from '../adminPanel/AdminPanel';

import { getCurrentAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/');
  }

  const [users, contexts] = await Promise.all([listUsersAction(''), listContextsAction()]);

  return (
    <AdminPanel
      currentUserId={admin.id}
      initialUsers={users.ok ? users.data : []}
      initialContexts={contexts.ok ? contexts.data : []}
    />
  );
}
