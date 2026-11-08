import React from 'react';

import { ContextDashboardProps } from './ContextDashboard.types';

// Skeleton: modules specific to a context will be listed here once the first feature that keeps
// its data in a context schema exists.
export const ContextDashboard: React.FC<ContextDashboardProps> = ({ name, schemaName }) => (
  <section>
    <h1 className="mb-1 text-2xl font-semibold tracking-tight">{name}</h1>
    <p className="mb-6 font-mono text-xs text-muted-foreground">{schemaName}</p>
    <p className="text-sm text-muted-foreground">Ten kontekst nie ma jeszcze żadnych modułów.</p>
  </section>
);
