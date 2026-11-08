'use server';

import { eq } from 'drizzle-orm';

import type { AuthActionResult, AuthUser } from './authTypes';

import { db } from '@/db';
import { users } from '@/db/schema';
import { sendActivationLink } from '@/lib/auth/activation';
import { hashPassword, verifyPassword } from '@/lib/auth/crypto';
import { registerAttempt } from '@/lib/auth/rateLimit';
import { createSession, destroySession, getCurrentUser } from '@/lib/auth/session';
import { getNumberSetting } from '@/lib/settings';


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOO_MANY_ATTEMPTS = 'Zbyt wiele prób. Spróbuj ponownie za kilka minut.';
const INVALID_CREDENTIALS = 'Nieprawidłowy adres e-mail lub hasło.';
const REGISTERED_MESSAGE =
  'Jeśli adres może zostać zarejestrowany, wysłaliśmy na niego link aktywacyjny.';

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

    if (created) {
      await sendActivationLink(created.id, email);
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

  if (user && !user.emailVerifiedAt) {
    await sendActivationLink(user.id, email);
  }

  return { ok: true, message: 'Jeśli konto czeka na aktywację, wysłaliśmy nowy link.' };
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

  // Hash a dummy value for unknown users to keep response time similar.
  const passwordOk = user
    ? await verifyPassword(password, user.passwordHash)
    : (await hashPassword(password), false);

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

  await createSession(user.id);

  return { ok: true, user: { id: user.id, email: user.email } };
}

export async function logoutAction(): Promise<AuthActionResult> {
  await destroySession();

  return { ok: true };
}

export async function getCurrentUserAction(): Promise<AuthUser | null> {
  return getCurrentUser();
}
