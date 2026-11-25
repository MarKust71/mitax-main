// Known keys of the `app_settings` table: fallbacks, limits and labels. Free of DB imports so
// client code (the admin settings panel) can use it too.
export const SETTING_DEFAULTS = {
  activationLinkTtlHours: 24,
  passwordResetLinkTtlMinutes: 60,
  sessionTtlDays: 30,
  authMaxAttempts: 5,
  authAttemptsWindowMinutes: 15,
  passwordMinLength: 10,
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

// Row keys in the `app_settings` table.
export const SETTING_DB_KEYS: Record<SettingKey, string> = {
  activationLinkTtlHours: 'activation_link_ttl_hours',
  passwordResetLinkTtlMinutes: 'password_reset_link_ttl_minutes',
  sessionTtlDays: 'session_ttl_days',
  authMaxAttempts: 'auth_max_attempts',
  authAttemptsWindowMinutes: 'auth_attempts_window_minutes',
  passwordMinLength: 'password_min_length',
};

export type SettingMeta = {
  key: SettingKey;
  label: string;
  description: string;
  unit: string;
  min: number;
  max: number;
};

export const SETTINGS_META: SettingMeta[] = [
  {
    key: 'passwordMinLength',
    label: 'Minimalna długość hasła',
    description: 'Dotyczy nowych rejestracji; istniejące hasła nie są sprawdzane ponownie.',
    unit: 'znaków',
    min: 8,
    max: 100,
  },
  {
    key: 'activationLinkTtlHours',
    label: 'Ważność linku aktywacyjnego',
    description: 'Dotyczy linków wysłanych po zmianie.',
    unit: 'godz.',
    min: 1,
    max: 168,
  },
  {
    key: 'passwordResetLinkTtlMinutes',
    label: 'Ważność linku do resetu hasła',
    description: 'Dotyczy linków wysłanych po zmianie.',
    unit: 'min',
    min: 5,
    max: 1440,
  },
  {
    key: 'sessionTtlDays',
    label: 'Ważność sesji logowania',
    description:
      'Dotyczy sesji utworzonych po zmianie; wydane sesje zachowują dotychczasową ważność.',
    unit: 'dni',
    min: 1,
    max: 365,
  },
  {
    key: 'authMaxAttempts',
    label: 'Limit prób logowania',
    description:
      'Maksymalna liczba prób (logowanie, rejestracja, ponowna wysyłka, reset hasła) na adres e-mail w oknie czasowym.',
    unit: 'prób',
    min: 1,
    max: 50,
  },
  {
    key: 'authAttemptsWindowMinutes',
    label: 'Okno limitu prób',
    description: 'Długość okna, w którym liczone są próby.',
    unit: 'min',
    min: 1,
    max: 1440,
  },
];

export const isSettingKey = (value: unknown): value is SettingKey =>
  typeof value === 'string' && SETTINGS_META.some(({ key }) => key === value);
