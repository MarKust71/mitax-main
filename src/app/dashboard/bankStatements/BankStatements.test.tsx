import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { BankStatements } from './BankStatements';

import type { BankPayment } from '@/app/actions/bankStatementsTypes';

const setOswiata = vi.fn();
const setProcessed = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/app/actions/bankStatements', () => ({
  importStatementAction: vi.fn(),
  addOwnAccountAction: vi.fn(),
  removeOwnAccountAction: vi.fn(),
  setOswiataAction: (...args: unknown[]) => setOswiata(...args),
  setProcessedAction: (...args: unknown[]) => setProcessed(...args),
}));

const payment = (overrides: Partial<BankPayment>): BankPayment => ({
  id: 'p1',
  bank: 'ERSTE',
  bookingDate: '2024-11-15',
  amount: '150.00',
  currency: 'PLN',
  counterpartyName: 'Jan Kowalski',
  counterpartyAccount: null,
  title: 'Opłata za egzamin',
  bankReference: null,
  isOswiata: false,
  processedAt: null,
  ...overrides,
});

const renderList = (payments: BankPayment[], canMark = true, restrictedView = false) =>
  render(
    <BankStatements
      contextId="c1"
      contextName="DIR"
      initialPayments={payments}
      canImport
      canMark={canMark}
      restrictedView={restrictedView}
      ownAccounts={[]}
      canManageAccounts
    />,
  );

describe('BankStatements', () => {
  beforeEach(() => vi.clearAllMocks());

  test('filters payments flagged as oświata that are not processed yet', () => {
    renderList([
      payment({ id: 'a', title: 'Zwykła' }),
      payment({ id: 'b', title: 'Oświata nowa', isOswiata: true }),
      payment({
        id: 'c',
        title: 'Oświata gotowa',
        isOswiata: true,
        processedAt: '2024-11-16T10:00:00Z',
      }),
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Oświata do przetworzenia' }));

    expect(screen.getByText('Oświata nowa')).toBeInTheDocument();
    expect(screen.queryByText('Zwykła')).not.toBeInTheDocument();
    expect(screen.queryByText('Oświata gotowa')).not.toBeInTheDocument();
  });

  test('marking a payment as oświata calls the action and shows the result', async () => {
    setOswiata.mockResolvedValue({ ok: true, data: payment({ isOswiata: true }) });
    renderList([payment({})]);

    const checkbox = screen.getByRole('checkbox', { name: /^Oświata:/ });

    fireEvent.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
    expect(setOswiata).toHaveBeenCalledWith('c1', 'p1', true);
  });

  test('shows the error when the action fails', async () => {
    setProcessed.mockResolvedValue({ ok: false, error: 'Brak uprawnień.' });
    renderList([payment({})]);

    fireEvent.click(screen.getByRole('checkbox', { name: /^Przetworzony:/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Brak uprawnień.');
  });

  test('disables the checkboxes without permission to mark', () => {
    renderList([payment({})], false);

    const row = screen.getByRole('row', { name: /Jan Kowalski/ });

    within(row)
      .getAllByRole('checkbox')
      .forEach((checkbox) => expect(checkbox).toBeDisabled());
  });

  test('restricted view shows a note and drops the redundant "Oświata" filter', () => {
    renderList([payment({ isOswiata: true })], true, true);

    expect(screen.getByText(/Widzisz tylko wpłaty oznaczone jako „oświata”/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wszystkie' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Oświata do przetworzenia' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Oświata' })).not.toBeInTheDocument();
  });

  test('in the restricted view turning the oświata flag off removes the payment from the list', async () => {
    setOswiata.mockResolvedValue({ ok: true, data: payment({ isOswiata: false }) });
    renderList(
      [payment({ isOswiata: true }), payment({ id: 'p2', title: 'Inna wpłata', isOswiata: true })],
      true,
      true,
    );

    fireEvent.click(screen.getAllByRole('checkbox', { name: /^Oświata:/ })[0]);

    await waitFor(() => expect(screen.queryByText('Opłata za egzamin')).not.toBeInTheDocument());
    expect(screen.getByText('Inna wpłata')).toBeInTheDocument();
    expect(setOswiata).toHaveBeenCalledWith('c1', 'p1', false);
  });

  test('the full view keeps the payment in the list when the flag changes', async () => {
    setOswiata.mockResolvedValue({ ok: true, data: payment({ isOswiata: true }) });
    renderList([payment({})]);

    fireEvent.click(screen.getByRole('checkbox', { name: /^Oświata:/ }));

    await waitFor(() => expect(screen.getByRole('checkbox', { name: /^Oświata:/ })).toBeChecked());
    expect(screen.getByText('Opłata za egzamin')).toBeInTheDocument();
  });
});
