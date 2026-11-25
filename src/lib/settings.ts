import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { appSettings } from '@/db/schema';
import { SETTING_DB_KEYS, SETTING_DEFAULTS } from '@/lib/settingsMeta';
import type { SettingKey } from '@/lib/settingsMeta';

export { SETTING_DEFAULTS };
export type { SettingKey };

export const getNumberSetting = async (key: SettingKey): Promise<number> => {
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, SETTING_DB_KEYS[key]))
    .limit(1);

  const parsed = Number(row?.value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : SETTING_DEFAULTS[key];
};

// Current value of every known setting (the fallback when its row is missing or invalid).
export const getAllNumberSettings = async (): Promise<Record<SettingKey, number>> => {
  const rows = await db
    .select({ key: appSettings.key, value: appSettings.value })
    .from(appSettings);
  const byKey = new Map(rows.map(({ key, value }) => [key, Number(value)]));

  return Object.fromEntries(
    (Object.keys(SETTING_DEFAULTS) as SettingKey[]).map((key) => {
      const parsed = byKey.get(SETTING_DB_KEYS[key]);

      return [
        key,
        parsed !== undefined && Number.isFinite(parsed) && parsed > 0
          ? parsed
          : SETTING_DEFAULTS[key],
      ];
    }),
  ) as Record<SettingKey, number>;
};

export const setNumberSetting = async (
  executor: Pick<typeof db, 'insert'>,
  key: SettingKey,
  value: number,
): Promise<void> => {
  await executor
    .insert(appSettings)
    .values({ key: SETTING_DB_KEYS[key], value: String(value) })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: String(value), updatedAt: new Date() },
    });
};
