import React from 'react';
import { redirect } from 'next/navigation';

import { DashboardNav } from './dashboardNav/DashboardNav';
import { DASHBOARD_GENERAL_LABEL } from './Dashboard.constants';

import { getCurrentUser } from '@/lib/auth/session';
import { getAccessibleContexts } from '@/lib/contexts';

export const dynamic = 'force-dynamic';

// The left panel only lists contexts; access to a context is checked in its page
// (layouts are not re-run on client-side navigation between child routes).
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const isAdmin = user.role === 'ADMIN';
  const contexts = await getAccessibleContexts(user);
  const items = [
    ...(isAdmin ? [{ href: '/dashboard', label: DASHBOARD_GENERAL_LABEL }] : []),
    ...contexts.map(({ id, name }) => ({ href: `/dashboard/${id}`, label: name })),
  ];
  // A USER with a single context goes straight to its dashboard, without the panel.
  const showNav = items.length > 1;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-[14rem_1fr]">
      {showNav && <DashboardNav items={items} />}
      <main className={showNav ? undefined : 'md:col-span-2'}>{children}</main>
    </div>
  );
}
