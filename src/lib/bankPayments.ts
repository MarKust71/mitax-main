import 'server-only';

import { and, asc, desc, eq } from 'drizzle-orm';

import type { BankPayment, OwnAccount } from '@/app/actions/bankStatementsTypes';
import { db } from '@/db';
import { bankTransactions, ownAccounts } from '@/db/schema';
import type { BankStatementsAccess } from '@/lib/bankStatementsAccess';

export const PAYMENTS_LIMIT = 500;

export const paymentColumns = {
  id: bankTransactions.id,
  bank: bankTransactions.bank,
  bookingDate: bankTransactions.bookingDate,
  amount: bankTransactions.amount,
  currency: bankTransactions.currency,
  counterpartyName: bankTransactions.counterpartyName,
  counterpartyAccount: bankTransactions.counterpartyAccount,
  title: bankTransactions.title,
  bankReference: bankTransactions.bankReference,
  isOswiata: bankTransactions.isOswiata,
  processedAt: bankTransactions.processedAt,
};

type PaymentRow = Omit<BankPayment, 'processedAt'> & { processedAt: Date | null };

export const toBankPayment = ({ processedAt, ...row }: PaymentRow): BankPayment => ({
  ...row,
  processedAt: processedAt ? processedAt.toISOString() : null,
});

// The newest payments of a context, restricted to what the user's scope allows.
export const listBankPayments = async (
  contextId: string,
  access: BankStatementsAccess,
): Promise<BankPayment[]> => {
  const rows = await db
    .select(paymentColumns)
    .from(bankTransactions)
    .where(
      and(
        eq(bankTransactions.contextId, contextId),
        access.scope === 'oswiataOnly' ? eq(bankTransactions.isOswiata, true) : undefined,
      ),
    )
    .orderBy(desc(bankTransactions.bookingDate), desc(bankTransactions.createdAt))
    .limit(PAYMENTS_LIMIT);

  return rows.map(toBankPayment);
};

export const listOwnAccounts = async (contextId: string): Promise<OwnAccount[]> =>
  db
    .select({
      id: ownAccounts.id,
      accountNumber: ownAccounts.accountNumber,
      label: ownAccounts.label,
    })
    .from(ownAccounts)
    .where(eq(ownAccounts.contextId, contextId))
    .orderBy(asc(ownAccounts.createdAt));
