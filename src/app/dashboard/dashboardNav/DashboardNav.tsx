'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DashboardNavProps } from './DashboardNav.types';

import { cn } from '@/lib/utils';

export const DashboardNav: React.FC<DashboardNavProps> = ({ items }) => {
  const pathname = usePathname();

  return (
    <nav aria-label="Konteksty">
      <ul className="flex gap-1 md:flex-col">
        {items.map(({ href, label }) => (
          <li key={href} className="md:w-full">
            <Link
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={cn(
                'block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted',
                pathname === href && 'bg-muted font-medium',
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
