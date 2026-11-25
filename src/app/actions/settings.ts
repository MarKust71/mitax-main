'use server';

import type { AdminActionResult } from './adminTypes';
import type { AppSettingsValues } from './settingsTypes';

import { db } from '@/db';
import { getCurrentAdmin } from '@/lib/auth/session';
import { writeAudit } from '@/lib/audit';
import { AUDIT_ACTIONS } from '@/lib/auditActions';
import { getAllNumberSettings, setNumberSetting } from '@/lib/settings';
import { SETTING_DB_KEYS, SETTINGS_META, isSettingKey } from '@/lib/settingsMeta';

const FORBIDDEN = 'Brak uprawnień.';
const UNEXPECTED = 'Nie udało się wykonać operacji. Spróbuj ponownie.';

// Current application settings. ADMIN only.
export async function getSettingsAction(): Promise<AdminActionResult<AppSettingsValues>> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: FORBIDDEN };
  }

  try {
    return { ok: true, data: await getAllNumberSettings() };
  } catch (error) {
    console.error('Reading the settings failed:', error);

    return { ok: false, error: UNEXPECTED };
  }
}

// Changes one setting (whole number within its limits); written to the activity log.
export async function updateSettingAction(
  key: string,
  value: number,
): Promise<AdminActionResult<AppSettingsValues>> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return { ok: false, error: FORBIDDEN };
  }

  if (!isSettingKey(key)) {
    return { ok: false, error: 'Nieznane ustawienie.' };
  }

  const meta = SETTINGS_META.find((item) => item.key === key)!;
  const next = Number(value);

  if (!Number.isInteger(next) || next < meta.min || next > meta.max) {
    return {
      ok: false,
      error: `${meta.label}: podaj liczbę całkowitą od ${meta.min} do ${meta.max}.`,
    };
  }

  try {
    await db.transaction(async (tx) => {
      const before = (await getAllNumberSettings())[key];

      await setNumberSetting(tx, key, next);
      await writeAudit(tx, admin, {
        contextId: null,
        action: AUDIT_ACTIONS.settingChanged,
        entityType: 'setting',
        entityId: SETTING_DB_KEYS[key],
        details: { before, after: next },
      });
    });

    return { ok: true, data: await getAllNumberSettings() };
  } catch (error) {
    console.error('Changing the setting failed:', error);

    return { ok: false, error: UNEXPECTED };
  }
}
