import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { MODULE_SHORTCUTS } from './ContextDashboard.constants';
import { ContextDashboardProps } from './ContextDashboard.types';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const ContextDashboard: React.FC<ContextDashboardProps> = ({
  name,
  schemaName,
  contextId,
  modules = [],
}) => (
  <section>
    <h1 className="mb-1 text-2xl font-semibold tracking-tight">{name}</h1>
    <p className="mb-6 font-mono text-xs text-muted-foreground">{schemaName}</p>

    {contextId && modules.length > 0 ? (
      <ul aria-label="Moduły" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modules.map((module) => {
          const { label, description, path } = MODULE_SHORTCUTS[module];

          return (
            <li key={module}>
              <Link
                href={`/dashboard/${contextId}/${path}`}
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
                      <ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="text-sm text-muted-foreground">Ten kontekst nie ma jeszcze żadnych modułów.</p>
    )}
  </section>
);
