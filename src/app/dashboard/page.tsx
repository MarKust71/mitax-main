import { redirect } from 'next/navigation';

import { Dashboard } from './Dashboard';

import { getCurrentUser } from '@/lib/auth/session';
import { getAccessibleContexts } from '@/lib/contexts';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  // ADMIN: the general dashboard. USER: the dashboard of their (first) context.
  if (user.role === 'ADMIN') {
    return <Dashboard isAdmin />;
  }

  const [first] = await getAccessibleContexts(user);

  if (first) {
    redirect(`/dashboard/${first.id}`);
  }

  return (
    <p className="text-sm text-muted-foreground">
      Brak przypisanych kontekstów. Skontaktuj się z administratorem.
    </p>
  );
}
