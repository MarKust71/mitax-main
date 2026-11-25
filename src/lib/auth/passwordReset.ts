import 'server-only';

import { eq } from 'drizzle-orm';

import { generateToken, hashPassword, hashToken } from './crypto';

import { db } from '@/db';
import { passwordResetTokens, sessions, users } from '@/db/schema';
import { sendMail } from '@/lib/mail';
import { getNumberSetting } from '@/lib/settings';

const appUrl = (): string => (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');

// Replaces any earlier reset tokens of the user and e-mails a fresh link.
export const sendPasswordResetLink = async (userId: string, email: string): Promise<void> => {
  const ttlMinutes = await getNumberSetting('passwordResetLinkTtlMinutes');
  const token = generateToken();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await db.transaction(async (tx) => {
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    await tx.insert(passwordResetTokens).values({ userId, tokenHash: hashToken(token), expiresAt });
  });

  await sendMail(
    email,
    'Reset hasła - MITAX Consulting',
    [
      'Aby ustawić nowe hasło, otwórz poniższy link:',
      '',
      `${appUrl()}/reset-hasla?token=${token}`,
      '',
      `Link jest ważny przez ${ttlMinutes} min i można go użyć tylko raz.`,
      'Jeśli to nie Ty prosiłeś(-aś) o zmianę hasła, zignoruj tę wiadomość - Twoje hasło pozostanie bez zmian.',
    ].join('\n'),
  );
};

export type ResetTokenStatus = 'valid' | 'invalid' | 'expired';

const findToken = async (token: string) => {
  const [row] = await db
    .select({
      userId: passwordResetTokens.userId,
      expiresAt: passwordResetTokens.expiresAt,
    })
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, hashToken(token)))
    .limit(1);

  return row;
};

// Read-only check, used to show the form (or an error) before the user types a password.
export const checkResetToken = async (token: string): Promise<ResetTokenStatus> => {
  const row = await findToken(token);

  if (!row) {
    return 'invalid';
  }

  return row.expiresAt <= new Date() ? 'expired' : 'valid';
};

// Sets the new password, consumes the token and signs the user out everywhere
// (whoever knew the old password must not keep a session).
export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<ResetTokenStatus> => {
  const row = await findToken(token);

  if (!row) {
    return 'invalid';
  }

  if (row.expiresAt <= new Date()) {
    return 'expired';
  }

  const passwordHash = await hashPassword(newPassword);

  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, row.userId));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, row.userId));
    await tx.delete(sessions).where(eq(sessions.userId, row.userId));
  });

  return 'valid';
};
