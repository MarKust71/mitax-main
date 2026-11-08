import 'server-only';

import { and, asc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { contexts, userContexts } from '@/db/schema';
import type { SessionUser } from '@/lib/auth/session';
import type { ModuleKey } from '@/lib/modules';

export type ContextSummary = {
  id: string;
  name: string;
  schemaName: string;
  modules: ModuleKey[];
};

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const columns = {
  id: contexts.id,
  name: contexts.name,
  schemaName: contexts.schemaName,
  modules: contexts.modules,
};

// ADMIN works in every context; USER only in the ones assigned to them.
export const getAccessibleContexts = async (user: SessionUser): Promise<ContextSummary[]> => {
  if (user.role === 'ADMIN') {
    return db.select(columns).from(contexts).orderBy(asc(contexts.name));
  }

  return db
    .select(columns)
    .from(userContexts)
    .innerJoin(contexts, eq(contexts.id, userContexts.contextId))
    .where(eq(userContexts.userId, user.id))
    .orderBy(asc(contexts.name));
};

// Server-side access check: null when the context does not exist or the user may not use it.
export const getAccessibleContext = async (
  user: SessionUser,
  contextId: string,
): Promise<ContextSummary | null> => {
  if (!UUID_PATTERN.test(contextId)) {
    return null;
  }

  if (user.role === 'ADMIN') {
    const [row] = await db.select(columns).from(contexts).where(eq(contexts.id, contextId));

    return row ?? null;
  }

  const [row] = await db
    .select(columns)
    .from(userContexts)
    .innerJoin(contexts, eq(contexts.id, userContexts.contextId))
    .where(and(eq(userContexts.userId, user.id), eq(userContexts.contextId, contextId)))
    .limit(1);

  return row ?? null;
};

// Like getAccessibleContext, but also requires the module to be enabled for the context.
export const getModuleContext = async (
  user: SessionUser,
  contextId: string,
  module: ModuleKey,
): Promise<ContextSummary | null> => {
  const context = await getAccessibleContext(user, contextId);

  return context?.modules.includes(module) ? context : null;
};
