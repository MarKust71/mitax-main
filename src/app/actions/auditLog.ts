'use server';

import { and, desc, eq, ilike, sql } from 'drizzle-orm';

import type { AdminActionResult } from './adminTypes';
import type { AuditLogCursor, AuditLogFilters, AuditLogPage } from './auditLogTypes';

import { db } from '@/db';
import { auditLog, contexts } from '@/db/schema';
import { getCurrentAdmin } from '@/lib/auth/session';
import { AUDIT_ACTIONS } from '@/lib/auditActions';
import { UUID_PATTERN } from '@/lib/contexts';

const FORBIDDEN = 'Brak uprawnień.';
const UNEXPECTED = 'Nie udało się wczytać logu. Spróbuj ponownie.';
const PAGE_SIZE = 50;
// "2026-11-08 19:04:19.230123+00" - the text form of a timestamptz, passed back unchanged.
const TIMESTAMP_TEXT = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?[+-]\d{2}(:\d{2})?$/;
const KNOWN_ACTIONS: string[] = Object.values(AUDIT_ACTIONS);

const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

// The activity log, newest first, `PAGE_SIZE` entries per call. ADMIN only.
export async function listAuditLogAction(
  filters: AuditLogFilters,
  cursor: AuditLogCursor | null,
): Promise<AdminActionResult<AuditLogPage>> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: FORBIDDEN };
  }

  const contextId = String(filters?.contextId ?? '');
  const action = String(filters?.action ?? '');
  const user = String(filters?.user ?? '')
    .trim()
    .slice(0, 100);

  if (
    (contextId && !UUID_PATTERN.test(contextId)) ||
    (action && !KNOWN_ACTIONS.includes(action)) ||
    (cursor && (!TIMESTAMP_TEXT.test(cursor.createdAt) || !UUID_PATTERN.test(cursor.id)))
  ) {
    return { ok: false, error: UNEXPECTED };
  }

  try {
    const rows = await db
      .select({
        id: auditLog.id,
        createdAt: auditLog.createdAt,
        cursorAt: sql<string>`${auditLog.createdAt}::text`,
        userEmail: auditLog.userEmail,
        contextId: auditLog.contextId,
        contextName: contexts.name,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        details: auditLog.details,
      })
      .from(auditLog)
      .leftJoin(contexts, eq(contexts.id, auditLog.contextId))
      .where(
        and(
          contextId ? eq(auditLog.contextId, contextId) : undefined,
          action ? eq(auditLog.action, action) : undefined,
          user ? ilike(auditLog.userEmail, `%${escapeLike(user)}%`) : undefined,
          cursor
            ? sql`(${auditLog.createdAt}, ${auditLog.id}) < (${cursor.createdAt}::timestamptz, ${cursor.id}::uuid)`
            : undefined,
        ),
      )
      .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
      .limit(PAGE_SIZE + 1);

    const page = rows.slice(0, PAGE_SIZE);
    const last = page.at(-1);

    return {
      ok: true,
      data: {
        entries: page.map(({ createdAt, cursorAt, ...row }) => {
          void cursorAt;

          return { ...row, createdAt: createdAt.toISOString() };
        }),
        nextCursor:
          rows.length > PAGE_SIZE && last ? { createdAt: last.cursorAt, id: last.id } : null,
      },
    };
  } catch (error) {
    console.error('Reading the activity log failed:', error);

    return { ok: false, error: UNEXPECTED };
  }
}
