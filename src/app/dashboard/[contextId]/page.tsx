import { notFound, redirect } from 'next/navigation';

import { ContextDashboard } from '../contextDashboard/ContextDashboard';

import { getCurrentUser } from '@/lib/auth/session';
import { getAccessibleContext } from '@/lib/contexts';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ contextId: string }> }) {
  const [{ contextId }, user] = await Promise.all([params, getCurrentUser()]);

  if (!user) {
    redirect('/');
  }

  // 404 both for unknown contexts and for ones the user has no access to.
  const context = await getAccessibleContext(user, contextId);

  if (!context) {
    notFound();
  }

  return (
    <ContextDashboard
      name={context.name}
      schemaName={context.schemaName}
      contextId={context.id}
      modules={context.modules}
    />
  );
}
