import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SettingsPanel } from './SettingsPanel';

import { SETTING_DEFAULTS } from '@/lib/settingsMeta';

const updateSetting = vi.fn();

vi.mock('@/app/actions/settings', () => ({
  updateSettingAction: (...args: unknown[]) => updateSetting(...args),
}));

const lengthInput = () => screen.getByLabelText('Minimalna długość hasła') as HTMLInputElement;
const saveLength = () => screen.getByRole('button', { name: 'Zapisz: Minimalna długość hasła' });

describe('SettingsPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  test('shows the current values and keeps Save disabled until something changes', () => {
    render(<SettingsPanel initialSettings={SETTING_DEFAULTS} />);

    expect(lengthInput().value).toBe('10');
    expect(saveLength()).toBeDisabled();
  });

  test('saves a changed value and confirms it', async () => {
    updateSetting.mockResolvedValue({
      ok: true,
      data: { ...SETTING_DEFAULTS, passwordMinLength: 12 },
    });
    render(<SettingsPanel initialSettings={SETTING_DEFAULTS} />);

    fireEvent.change(lengthInput(), { target: { value: '12' } });
    fireEvent.click(saveLength());

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Zapisano.'));
    expect(updateSetting).toHaveBeenCalledWith('passwordMinLength', 12);
    expect(saveLength()).toBeDisabled();
  });

  test('shows the server error and keeps the typed value', async () => {
    updateSetting.mockResolvedValue({ ok: false, error: 'Poza zakresem.' });
    render(<SettingsPanel initialSettings={SETTING_DEFAULTS} />);

    fireEvent.change(lengthInput(), { target: { value: '3' } });
    fireEvent.click(saveLength());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Poza zakresem.'));
    expect(lengthInput().value).toBe('3');
  });
});
