import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { appSettings } from '@/db/schema';

// Known keys of the `app_settings` table with fallbacks used when a row is missing.
export const SETTING_DEFAULTS = {
  activationLinkTtlHours: 24,
  sessionTtlDays: 30,
  authMaxAttempts: 5,
  authAttemptsWindowMinutes: 15,
  passwordMinLength: 10,
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

// Row keys in the `app_settings` table.
const SETTING_DB_KEYS: Record<SettingKey, string> = {
  activationLinkTtlHours: 'activation_link_ttl_hours',
  sessionTtlDays: 'session_ttl_days',
  authMaxAttempts: 'auth_max_attempts',
  authAttemptsWindowMinutes: 'auth_attempts_window_minutes',
  passwordMinLength: 'password_min_length',
};

export const getNumberSetting = async (key: SettingKey): Promise<number> => {
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, SETTING_DB_KEYS[key]))
    .limit(1);

  const parsed = Number(row?.value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : SETTING_DEFAULTS[key];
};
