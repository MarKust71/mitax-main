import 'server-only';

import { cookies } from 'next/headers';
import { and, eq, gt } from 'drizzle-orm';

import { generateToken, hashToken } from './crypto';

import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import type { UserRole } from '@/lib/roles';
import { getNumberSetting } from '@/lib/settings';


export const SESSION_COOKIE = 'session';

export type SessionUser = { id: string; email: string; role: UserRole };

export const createSession = async (userId: string): Promise<void> => {
  const ttlDays = await getNumberSetting('sessionTtlDays');
  const token = generateToken();
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({ userId, tokenHash: hashToken(token), expiresAt });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
};

export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const [row] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return row ?? null;
};

export const destroySession = async (): Promise<void> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }

  cookieStore.delete(SESSION_COOKIE);
};

// Server-side authorization guard for admin-only actions and pages.
export const getCurrentAdmin = async (): Promise<SessionUser | null> => {
  const user = await getCurrentUser();

  return user?.role === 'ADMIN' ? user : null;
};
