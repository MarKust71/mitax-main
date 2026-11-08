import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { UserDetails } from './UserDetails';

import type { AdminContext, AdminUserDetails } from '@/app/actions/adminTypes';

const updateUser = vi.fn();

vi.mock('@/app/actions/admin', () => ({
  updateUserAction: (...args: unknown[]) => updateUser(...args),
  setUserBlockedAction: vi.fn(),
}));

const contexts: AdminContext[] = [
  { id: 'c1', name: 'DIR', schemaName: 'ctx_dir', modules: ['bank_statements'] },
  { id: 'c2', name: 'Inny', schemaName: 'ctx_inny', modules: [] },
];

const user = (assignments: AdminUserDetails['assignments']): AdminUserDetails => ({
  id: 'u1',
  email: 'jan@example.com',
  role: 'USER',
  active: true,
  blocked: false,
  createdAt: '2026-11-01T10:00:00Z',
  emailVerifiedAt: '2026-11-01T10:05:00Z',
  blockedAt: null,
  assignments,
});

const renderDetails = (assignments: AdminUserDetails['assignments']) =>
  render(
    <UserDetails user={user(assignments)} contexts={contexts} isSelf={false} onSaved={vi.fn()} />,
  );

describe('UserDetails permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateUser.mockResolvedValue({ ok: true, data: undefined });
  });

  test('lists permissions in their own section, only for assigned contexts with the module', () => {
    renderDetails([{ contextId: 'c1', permissions: [] }]);

    const section = within(screen.getByRole('group', { name: 'Uprawnienia' }));

    expect(section.getByRole('group', { name: 'DIR' })).toBeInTheDocument();
    expect(section.getByLabelText('Import wyciągów')).not.toBeChecked();
    expect(section.getByLabelText('Rachunki własne')).not.toBeChecked();

    // A context without the module has nothing to grant, so it adds no group.
    fireEvent.click(screen.getByLabelText('Inny'));
    expect(section.getAllByRole('group')).toHaveLength(1);
  });

  test('asks to assign a context first when there is nothing to grant', () => {
    renderDetails([]);

    expect(screen.getByText(/Brak uprawnień do nadania/)).toBeInTheDocument();
  });

  test('saves the granted permissions together with the context assignment', async () => {
    renderDetails([{ contextId: 'c1', permissions: [] }]);

    fireEvent.click(screen.getByLabelText('Import wyciągów'));
    fireEvent.click(screen.getByLabelText('Rachunki własne'));
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));

    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({
        userId: 'u1',
        role: 'USER',
        assignments: [
          {
            contextId: 'c1',
            permissions: ['bank_statements.import', 'bank_statements.own_accounts'],
          },
        ],
      }),
    );
  });

  test('unassigning a context drops its permissions', async () => {
    renderDetails([{ contextId: 'c1', permissions: ['bank_statements.import'] }]);

    fireEvent.click(screen.getByLabelText('DIR'));
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));

    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({ userId: 'u1', role: 'USER', assignments: [] }),
    );
  });
});
