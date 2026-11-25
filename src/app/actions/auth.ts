'use server';

import { eq } from 'drizzle-orm';

import type { AuthActionResult, AuthUser } from './authTypes';

import { db } from '@/db';
import { users } from '@/db/schema';
import { sendActivationLink } from '@/lib/auth/activation';
import { hashPassword, verifyPassword } from '@/lib/auth/crypto';
import { resetPassword, sendPasswordResetLink } from '@/lib/auth/passwordReset';
import { registerAttempt } from '@/lib/auth/rateLimit';
import { createSession, destroySession, getCurrentUser } from '@/lib/auth/session';
import { getNumberSetting } from '@/lib/settings';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOO_MANY_ATTEMPTS = 'Zbyt wiele prób. Spróbuj ponownie za kilka minut.';
const INVALID_CREDENTIALS = 'Nieprawidłowy adres e-mail lub hasło.';
const REGISTERED_MESSAGE =
  'Jeśli adres może zostać zarejestrowany, wysłaliśmy na niego link aktywacyjny.';

const MAIL_FAILED = 'Nie udało się wysłać wiadomości e-mail. Spróbuj ponownie później.';

// Returns false (and logs the cause on the server) when the e-mail could not be sent.
const trySendActivationLink = async (userId: string, email: string): Promise<boolean> => {
  try {
    await sendActivationLink(userId, email);

    return true;
  } catch (error) {
    console.error('Sending the activation e-mail failed:', error);

    return false;
  }
};

const readEmail = (formData: FormData): string =>
  String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();

const readPassword = (formData: FormData): string => String(formData.get('password') ?? '');

export async function registerAction(formData: FormData): Promise<AuthActionResult> {
  const email = readEmail(formData);
  const password = readPassword(formData);

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { ok: false, error: 'Podaj prawidłowy adres e-mail.' };
  }

  const minLength = await getNumberSetting('passwordMinLength');

  if (password.length < minLength || password.length > 200) {
    return { ok: false, error: `Hasło musi mieć co najmniej ${minLength} znaków.` };
  }

  if (!(await registerAttempt(email, 'register'))) {
    return { ok: false, error: TOO_MANY_ATTEMPTS };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // The response is identical for existing addresses so registration cannot be used to probe accounts.
  if (!existing) {
    const passwordHash = await hashPassword(password);
    const [created] = await db
      .insert(users)
      .values({ email, passwordHash })
      .onConflictDoNothing()
      .returning({ id: users.id });

    if (created && !(await trySendActivationLink(created.id, email))) {
      return { ok: false, error: MAIL_FAILED };
    }
  }

  return { ok: true, message: REGISTERED_MESSAGE };
}

export async function resendActivationAction(formData: FormData): Promise<AuthActionResult> {
  const email = readEmail(formData);

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: 'Podaj prawidłowy adres e-mail.' };
  }

  if (!(await registerAttempt(email, 'resend'))) {
    return { ok: false, error: TOO_MANY_ATTEMPTS };
  }

  const [user] = await db
    .select({ id: users.id, emailVerifiedAt: users.emailVerifiedAt })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user && !user.emailVerifiedAt && !(await trySendActivationLink(user.id, email))) {
    return { ok: false, error: MAIL_FAILED };
  }

  return { ok: true, message: 'Jeśli konto czeka na aktywację, wysłaliśmy nowy link.' };
}

export async function requestPasswordResetAction(formData: FormData): Promise<AuthActionResult> {
  const email = readEmail(formData);

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: 'Podaj prawidłowy adres e-mail.' };
  }

  if (!(await registerAttempt(email, 'reset'))) {
    return { ok: false, error: TOO_MANY_ATTEMPTS };
  }

  const [user] = await db
    .select({ id: users.id, emailVerifiedAt: users.emailVerifiedAt, blockedAt: users.blockedAt })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Only for active accounts (an unverified one needs the activation link instead). The reply is
  // the same either way, so the form cannot be used to probe which addresses are registered.
  if (user?.emailVerifiedAt && !user.blockedAt) {
    try {
      await sendPasswordResetLink(user.id, email);
    } catch (error) {
      console.error('Sending the password reset e-mail failed:', error);

      return { ok: false, error: MAIL_FAILED };
    }
  }

  return {
    ok: true,
    message: 'Jeśli konto istnieje, wysłaliśmy na adres link do ustawienia nowego hasła.',
  };
}

export async function resetPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const token = String(formData.get('token') ?? '');
  const password = readPassword(formData);
  const confirmation = String(formData.get('passwordConfirmation') ?? '');

  const minLength = await getNumberSetting('passwordMinLength');

  if (password.length < minLength || password.length > 200) {
    return { ok: false, error: `Hasło musi mieć co najmniej ${minLength} znaków.` };
  }

  if (password !== confirmation) {
    return { ok: false, error: 'Hasła nie są takie same.' };
  }

  const status = token ? await resetPassword(token, password) : 'invalid';

  if (status === 'expired') {
    return { ok: false, error: 'Link wygasł. Poproś o wysłanie nowego linku.' };
  }

  if (status === 'invalid') {
    return { ok: false, error: 'Link jest nieprawidłowy lub został już wykorzystany.' };
  }

  return { ok: true, message: 'Hasło zostało zmienione. Możesz się teraz zalogować.' };
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = readEmail(formData);
  const password = readPassword(formData);

  if (!email || !password) {
    return { ok: false, error: INVALID_CREDENTIALS };
  }

  if (!(await registerAttempt(email, 'login'))) {
    return { ok: false, error: TOO_MANY_ATTEMPTS };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  let passwordOk = false;

  if (user) {
    passwordOk = await verifyPassword(password, user.passwordHash);
  } else {
    // Hash a dummy value for unknown users to keep response time similar.
    await hashPassword(password);
  }

  if (!user || !passwordOk) {
    return { ok: false, error: INVALID_CREDENTIALS };
  }

  if (!user.emailVerifiedAt) {
    return {
      ok: false,
      error:
        'Konto nie zostało jeszcze aktywowane. Kliknij link z wiadomości e-mail lub wyślij go ponownie.',
    };
  }

  if (user.blockedAt) {
    return { ok: false, error: 'Konto zostało zablokowane. Skontaktuj się z administratorem.' };
  }

  await createSession(user.id);

  return { ok: true, user: { id: user.id, email: user.email, role: user.role } };
}

export async function logoutAction(): Promise<AuthActionResult> {
  await destroySession();

  return { ok: true };
}

export async function getCurrentUserAction(): Promise<AuthUser | null> {
  return getCurrentUser();
}
