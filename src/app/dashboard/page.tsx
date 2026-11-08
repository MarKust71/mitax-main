import { redirect } from 'next/navigation';

import { Dashboard } from './Dashboard';

import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  return <Dashboard />;
}
