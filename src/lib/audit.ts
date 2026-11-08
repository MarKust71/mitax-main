import 'server-only';

import type { db } from '@/db';
import { auditLog } from '@/db/schema';
import type { SessionUser } from '@/lib/auth/session';
import type { AuditAction } from '@/lib/auditActions';

// A database or a transaction: call it with the transaction so the log entry commits (or rolls
// back) together with the change it describes.
type Executor = Pick<typeof db, 'insert'>;

export type AuditEntry = {
  // Always pass it for actions performed inside a context; null only for global actions.
  contextId: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
};

export const writeAudit = async (
  executor: Executor,
  user: Pick<SessionUser, 'id' | 'email'>,
  entry: AuditEntry,
): Promise<void> => {
  await executor.insert(auditLog).values({
    userId: user.id,
    userEmail: user.email,
    contextId: entry.contextId,
    action: entry.action,
    entityType: entry.entityType ?? null,
    entityId: entry.entityId ?? null,
    details: entry.details ?? null,
  });
};
