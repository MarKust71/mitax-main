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
      userId="u1"
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
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  const combo = (name: string) => screen.getByRole('combobox', { name });

  test('combines the filters: only oświata that is not processed yet', () => {
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

    fireEvent.change(combo('Oświata:'), { target: { value: 'only' } });
    fireEvent.change(combo('Przetworzone:'), { target: { value: 'hide' } });

    expect(screen.getByText('Oświata nowa')).toBeInTheDocument();
    expect(screen.queryByText('Zwykła')).not.toBeInTheDocument();
    expect(screen.queryByText('Oświata gotowa')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Wyświetlono 1 z 3');
  });

  test('"Ukryj oświatę" and "Tylko przetworzone" work on their own', () => {
    renderList([
      payment({ id: 'a', title: 'Zwykła' }),
      payment({ id: 'b', title: 'Oświata nowa', isOswiata: true }),
      payment({ id: 'c', title: 'Zwykła gotowa', processedAt: '2024-11-16T10:00:00Z' }),
    ]);

    fireEvent.change(combo('Oświata:'), { target: { value: 'hide' } });
    expect(screen.queryByText('Oświata nowa')).not.toBeInTheDocument();
    expect(screen.getByText('Zwykła')).toBeInTheDocument();

    fireEvent.change(combo('Przetworzone:'), { target: { value: 'only' } });
    expect(screen.getByText('Zwykła gotowa')).toBeInTheDocument();
    expect(screen.queryByText('Zwykła')).not.toBeInTheDocument();
  });

  test('"Wyczyść filtry" appears only with an active filter and restores the list', () => {
    renderList([payment({ id: 'a', title: 'Zwykła' }), payment({ id: 'b', isOswiata: true })]);

    expect(screen.queryByRole('button', { name: 'Wyczyść filtry' })).not.toBeInTheDocument();

    fireEvent.change(combo('Oświata:'), { target: { value: 'only' } });
    expect(screen.queryByText('Zwykła')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Wyczyść filtry' }));
    expect(screen.getByText('Zwykła')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Wyczyść filtry' })).not.toBeInTheDocument();
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

  test('restricted view shows a note and offers no oświata filter', () => {
    renderList([payment({ isOswiata: true })], true, true);

    expect(screen.getByText(/Widzisz tylko wpłaty oznaczone jako „oświata”/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Oświata:' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Przetworzone:' })).toBeInTheDocument();
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

  test('separates thousands in every amount, also below 10 000', () => {
    renderList([
      payment({ id: 'a', amount: '1483.39' }),
      payment({ id: 'b', amount: '523868.03' }),
      payment({ id: 'c', amount: '260.13' }),
    ]);

    const normalized = (text: string) => text.replace(/\s/g, ' ');

    expect(screen.getAllByText((text) => normalized(text) === '1 483,39 zł')).toHaveLength(1);
    expect(screen.getAllByText((text) => normalized(text) === '523 868,03 zł')).toHaveLength(1);
    expect(screen.getAllByText((text) => normalized(text) === '260,13 zł')).toHaveLength(1);
  });

  test('remembers the filters per user and context', () => {
    const { unmount } = renderList([payment({ id: 'a', title: 'Zwykła' })]);

    fireEvent.change(combo('Przetworzone:'), { target: { value: 'hide' } });
    expect(JSON.parse(window.localStorage.getItem('bankStatements.filters.u1.c1') ?? '{}')).toEqual(
      {
        oswiata: 'all',
        processed: 'hide',
      },
    );
    unmount();

    renderList([payment({ id: 'a', title: 'Zwykła' })]);
    expect(combo('Przetworzone:')).toHaveValue('hide');
  });

  test('ignores garbage in the storage', () => {
    window.localStorage.setItem(
      'bankStatements.filters.u1.c1',
      '{"oswiata":"bogus","processed":1}',
    );
    renderList([payment({})]);

    expect(combo('Oświata:')).toHaveValue('all');
    expect(combo('Przetworzone:')).toHaveValue('all');
  });

  test('a saved "Ukryj oświatę" does not hide the list in the restricted view', () => {
    window.localStorage.setItem(
      'bankStatements.filters.u1.c1',
      JSON.stringify({ oswiata: 'hide', processed: 'all' }),
    );
    renderList([payment({ isOswiata: true })], true, true);

    expect(screen.getByText('Opłata za egzamin')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Wyświetlono 1 z 1');
    expect(screen.queryByRole('button', { name: 'Wyczyść filtry' })).not.toBeInTheDocument();
  });
});
