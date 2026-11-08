import 'server-only';

import { and, count, eq, gt } from 'drizzle-orm';

import { db } from '@/db';
import { authAttempts } from '@/db/schema';
import { getNumberSetting } from '@/lib/settings';

export type AttemptKind = 'login' | 'register' | 'resend';

// Records an attempt and returns false when the limit for this e-mail + kind is exceeded.
export const registerAttempt = async (email: string, kind: AttemptKind): Promise<boolean> => {
  const [maxAttempts, windowMinutes] = await Promise.all([
    getNumberSetting('authMaxAttempts'),
    getNumberSetting('authAttemptsWindowMinutes'),
  ]);
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  const [{ total }] = await db
    .select({ total: count() })
    .from(authAttempts)
    .where(
      and(
        eq(authAttempts.email, email),
        eq(authAttempts.kind, kind),
        gt(authAttempts.createdAt, since),
      ),
    );

  if (total >= maxAttempts) {
    return false;
  }

  await db.insert(authAttempts).values({ email, kind });

  return true;
};
