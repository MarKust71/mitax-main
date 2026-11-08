'use server';

import { asc, eq, ilike, inArray, sql } from 'drizzle-orm';

import type {
  AdminActionResult,
  AdminContext,
  AdminUserDetails,
  AdminUserListItem,
} from './adminTypes';

import { db } from '@/db';
import { contexts, sessions, userContexts, users } from '@/db/schema';
import { getCurrentAdmin } from '@/lib/auth/session';
import { USER_ROLES } from '@/lib/roles';
import type { UserRole } from '@/lib/roles';

const FORBIDDEN = 'Brak uprawnień.';
const UNEXPECTED = 'Nie udało się wykonać operacji. Spróbuj ponownie.';
const USER_LIST_LIMIT = 200;
const CONTEXT_NAME_MAX = 60;
const SCHEMA_PREFIX = 'ctx_';
const SCHEMA_SLUG_MAX = 50;

// Escapes LIKE wildcards so the search text is matched literally.
const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

// "Wspólnota Różana 1" -> "ctx_wspolnota_rozana_1"
const toSchemaName = (name: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, SCHEMA_SLUG_MAX)
    .replace(/_+$/g, '');

  return slug ? `${SCHEMA_PREFIX}${slug}` : '';
};

// 23505 = unique_violation, 42P06 = duplicate_schema (drizzle wraps pg errors in `cause`).
const isAlreadyExists = (error: unknown): boolean => {
  const { code, cause } = (error ?? {}) as { code?: string; cause?: { code?: string } };

  return [code, cause?.code].some((value) => value === '23505' || value === '42P06');
};

export async function listUsersAction(
  search: string,
): Promise<AdminActionResult<AdminUserListItem[]>> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: FORBIDDEN };
  }

  const term = String(search ?? '')
    .trim()
    .slice(0, 100);
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
      blockedAt: users.blockedAt,
    })
    .from(users)
    .where(term ? ilike(users.email, `%${escapeLike(term)}%`) : undefined)
    .orderBy(asc(users.email))
    .limit(USER_LIST_LIMIT);

  return {
    ok: true,
    data: rows.map(({ emailVerifiedAt, blockedAt, ...row }) => ({
      ...row,
      active: Boolean(emailVerifiedAt),
      blocked: Boolean(blockedAt),
    })),
  };
}

export async function getUserAction(userId: string): Promise<AdminActionResult<AdminUserDetails>> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: FORBIDDEN };
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      emailVerifiedAt: users.emailVerifiedAt,
      blockedAt: users.blockedAt,
    })
    .from(users)
    .where(eq(users.id, String(userId)))
    .limit(1);

  if (!user) {
    return { ok: false, error: 'Nie znaleziono użytkownika.' };
  }

  const assigned = await db
    .select({ contextId: userContexts.contextId })
    .from(userContexts)
    .where(eq(userContexts.userId, user.id));

  return {
    ok: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      active: Boolean(user.emailVerifiedAt),
      blocked: Boolean(user.blockedAt),
      blockedAt: user.blockedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      contextIds: assigned.map(({ contextId }) => contextId),
    },
  };
}

export async function updateUserAction(input: {
  userId: string;
  role: UserRole;
  contextIds: string[];
}): Promise<AdminActionResult> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return { ok: false, error: FORBIDDEN };
  }

  const { userId, role } = input;
  const contextIds = [...new Set(input.contextIds ?? [])];

  if (!USER_ROLES.includes(role)) {
    return { ok: false, error: 'Nieprawidłowa rola.' };
  }

  // Keeps at least one admin: nobody can take their own admin rights away.
  if (userId === admin.id && role !== 'ADMIN') {
    return { ok: false, error: 'Nie możesz odebrać sobie roli ADMIN.' };
  }

  try {
    return await db.transaction(async (tx) => {
      const [target] = await tx.select({ id: users.id }).from(users).where(eq(users.id, userId));

      if (!target) {
        return { ok: false, error: 'Nie znaleziono użytkownika.' } as const;
      }

      if (contextIds.length > 0) {
        const found = await tx
          .select({ id: contexts.id })
          .from(contexts)
          .where(inArray(contexts.id, contextIds));

        if (found.length !== contextIds.length) {
          return { ok: false, error: 'Wybrany kontekst nie istnieje.' } as const;
        }
      }

      await tx.update(users).set({ role }).where(eq(users.id, userId));
      await tx.delete(userContexts).where(eq(userContexts.userId, userId));

      if (contextIds.length > 0) {
        await tx
          .insert(userContexts)
          .values(contextIds.map((contextId) => ({ userId, contextId })));
      }

      return { ok: true, data: undefined } as const;
    });
  } catch (error) {
    console.error('Updating the user failed:', error);

    return { ok: false, error: UNEXPECTED };
  }
}

// Blocking also ends all of the user's sessions; unblocking just allows logging in again.
export async function setUserBlockedAction(
  userId: string,
  blocked: boolean,
): Promise<AdminActionResult<{ blockedAt: string | null }>> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return { ok: false, error: FORBIDDEN };
  }

  if (userId === admin.id) {
    return { ok: false, error: 'Nie możesz zablokować własnego konta.' };
  }

  try {
    const blockedAt = blocked ? new Date() : null;
    const updated = await db.transaction(async (tx) => {
      const rows = await tx
        .update(users)
        .set({ blockedAt })
        .where(eq(users.id, String(userId)))
        .returning({ id: users.id });

      if (rows.length > 0 && blocked) {
        await tx.delete(sessions).where(eq(sessions.userId, String(userId)));
      }

      return rows.length > 0;
    });

    return updated
      ? { ok: true, data: { blockedAt: blockedAt?.toISOString() ?? null } }
      : { ok: false, error: 'Nie znaleziono użytkownika.' };
  } catch (error) {
    console.error('Blocking the user failed:', error);

    return { ok: false, error: UNEXPECTED };
  }
}

export async function listContextsAction(): Promise<AdminActionResult<AdminContext[]>> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: FORBIDDEN };
  }

  const rows = await db
    .select({ id: contexts.id, name: contexts.name, schemaName: contexts.schemaName })
    .from(contexts)
    .orderBy(asc(contexts.name));

  return { ok: true, data: rows };
}

// Creates the context row and its PostgreSQL schema in one transaction (DDL is transactional).
export async function createContextAction(name: string): Promise<AdminActionResult<AdminContext>> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: FORBIDDEN };
  }

  const trimmed = String(name ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  const schemaName = toSchemaName(trimmed);

  if (!trimmed || trimmed.length > CONTEXT_NAME_MAX || !schemaName) {
    return {
      ok: false,
      error: `Podaj nazwę kontekstu (litery lub cyfry, do ${CONTEXT_NAME_MAX} znaków).`,
    };
  }

  try {
    const created = await db.transaction(async (tx) => {
      await tx.execute(sql`select public.create_context_schema(${schemaName})`);

      const [row] = await tx
        .insert(contexts)
        .values({ name: trimmed, schemaName })
        .returning({ id: contexts.id, name: contexts.name, schemaName: contexts.schemaName });

      return row;
    });

    return { ok: true, data: created };
  } catch (error) {
    console.error('Creating the context failed:', error);

    return {
      ok: false,
      error: isAlreadyExists(error)
        ? 'Kontekst o takiej nazwie (lub nazwie schematu) już istnieje.'
        : UNEXPECTED,
    };
  }
}
