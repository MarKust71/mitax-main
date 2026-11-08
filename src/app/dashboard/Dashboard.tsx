'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { DashboardProps } from './Dashboard.types';
import { dashboardLinks } from './Dashboard.constants';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const Dashboard: React.FC<DashboardProps> = ({}) => {
  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Dashboard</h1>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardLinks.map(({ label, route }) => (
          <li key={route}>
            <Link
              href={route}
              className={cn(
                'group block h-full rounded-xl outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              <Card
                className={cn(
                  'h-full transition-all',
                  'group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-foreground/20',
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    {label}
                    <ArrowUpRight
                      aria-hidden
                      className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform',
                        'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground',
                      )}
                    />
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">{route}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};
