import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { ActivityLogPanel } from './ActivityLogPanel';

import type { AuditLogEntry } from '@/app/actions/auditLogTypes';

const listAuditLog = vi.fn();

vi.mock('@/app/actions/auditLog', () => ({
  listAuditLogAction: (...args: unknown[]) => listAuditLog(...args),
}));

const entry = (overrides: Partial<AuditLogEntry>): AuditLogEntry => ({
  id: 'e1',
  createdAt: '2026-11-08T19:04:19.230Z',
  userEmail: 'jan@example.com',
  contextId: 'c1',
  contextName: 'DIR',
  action: 'transaction.marked_oswiata',
  entityType: 'bank_transaction',
  entityId: 'p1',
  details: { amount: '150.00' },
  ...overrides,
});

const logList = () => within(screen.getByRole('list', { name: 'Wpisy logu' }));

const contexts = [{ id: 'c1', name: 'DIR', schemaName: 'ctx_dir', modules: [] }];

describe('ActivityLogPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  test('describes entries in words, with user, context and details', () => {
    render(
      <ActivityLogPanel
        contexts={contexts}
        initialPage={{ entries: [entry({})], nextCursor: null }}
      />,
    );

    expect(logList().getByText('Oznaczono wpłatę jako „oświata”')).toBeInTheDocument();
    expect(logList().getByText(/jan@example.com/)).toHaveTextContent('DIR');
    expect(logList().getByText('amount: 150.00')).toBeInTheDocument();
  });

  test('reloads from the start when a filter changes', async () => {
    listAuditLog.mockResolvedValue({
      ok: true,
      data: {
        entries: [entry({ id: 'e2', action: 'statement.imported', details: null })],
        nextCursor: null,
      },
    });
    render(
      <ActivityLogPanel
        contexts={contexts}
        initialPage={{ entries: [entry({})], nextCursor: null }}
      />,
    );

    fireEvent.change(screen.getByLabelText('Kontekst'), { target: { value: 'c1' } });

    await waitFor(() => expect(logList().getByText('Zaimportowano wyciąg')).toBeInTheDocument());
    expect(listAuditLog).toHaveBeenCalledWith({ contextId: 'c1' }, null);
    expect(logList().queryByText('Oznaczono wpłatę jako „oświata”')).not.toBeInTheDocument();
  });

  test('appends older entries after "Pokaż starsze"', async () => {
    const cursor = { createdAt: '2026-11-08 19:04:19.230123+00', id: 'e1' };

    listAuditLog.mockResolvedValue({
      ok: true,
      data: {
        entries: [entry({ id: 'e0', action: 'statement.imported', details: null })],
        nextCursor: null,
      },
    });
    render(
      <ActivityLogPanel
        contexts={contexts}
        initialPage={{ entries: [entry({})], nextCursor: cursor }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Pokaż starsze' }));

    await waitFor(() => expect(logList().getAllByRole('listitem')).toHaveLength(2));
    expect(listAuditLog).toHaveBeenCalledWith({}, cursor);
    expect(screen.queryByRole('button', { name: 'Pokaż starsze' })).not.toBeInTheDocument();
  });
});
