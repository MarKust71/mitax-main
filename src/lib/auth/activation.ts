import 'server-only';

import { and, eq, isNull } from 'drizzle-orm';

import { generateToken, hashToken } from './crypto';

import { db } from '@/db';
import { emailVerificationTokens, users } from '@/db/schema';
import { sendMail } from '@/lib/mail';
import { getNumberSetting } from '@/lib/settings';

const appUrl = (): string => (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');

// Replaces any earlier activation tokens of the user and e-mails a fresh link.
export const sendActivationLink = async (userId: string, email: string): Promise<void> => {
  const ttlHours = await getNumberSetting('activationLinkTtlHours');
  const token = generateToken();
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  await db.transaction(async (tx) => {
    await tx.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));
    await tx
      .insert(emailVerificationTokens)
      .values({ userId, tokenHash: hashToken(token), expiresAt });
  });

  const link = `${appUrl()}/aktywacja?token=${token}`;

  await sendMail(
    email,
    'Aktywacja konta - MITAX Consulting',
    [
      'Aby aktywować konto, otwórz poniższy link:',
      '',
      link,
      '',
      `Link jest ważny przez ${ttlHours} godz.`,
      'Jeśli to nie Ty zakładałeś(-aś) konto, zignoruj tę wiadomość.',
    ].join('\n'),
  );
};

export type ActivationResult = 'activated' | 'invalid' | 'expired';

export const activateAccount = async (token: string): Promise<ActivationResult> => {
  const tokenHash = hashToken(token);

  const [row] = await db
    .select({
      id: emailVerificationTokens.id,
      userId: emailVerificationTokens.userId,
      expiresAt: emailVerificationTokens.expiresAt,
    })
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.tokenHash, tokenHash))
    .limit(1);

  if (!row) {
    return 'invalid';
  }

  if (row.expiresAt <= new Date()) {
    return 'expired';
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ emailVerifiedAt: new Date() })
      .where(and(eq(users.id, row.userId), isNull(users.emailVerifiedAt)));
    await tx.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, row.userId));
  });

  return 'activated';
};
