'use server';

import { and, eq } from 'drizzle-orm';

import type {
  BankActionResult,
  BankPayment,
  ImportSummary,
  OwnAccount,
} from './bankStatementsTypes';

import { db } from '@/db';
import { bankTransactions, importBatches, ownAccounts } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import type { SessionUser } from '@/lib/auth/session';
import { writeAudit } from '@/lib/audit';
import { AUDIT_ACTIONS } from '@/lib/auditActions';
import { isValidAccount, normalizeAccount } from '@/lib/bankStatements/account';
import { dedupKeys, parseStatement, sha256, StatementParseError } from '@/lib/bankStatements';
import { getBankStatementsAccess } from '@/lib/bankStatementsAccess';
import type { BankStatementsAccess } from '@/lib/bankStatementsAccess';
import { paymentColumns, toBankPayment } from '@/lib/bankPayments';
import { getContextPermissions, getModuleContext, UUID_PATTERN } from '@/lib/contexts';

const FORBIDDEN = 'Brak uprawnień.';
const UNEXPECTED = 'Nie udało się wykonać operacji. Spróbuj ponownie.';
const NOT_FOUND = 'Nie znaleziono wpłaty.';
const INSERT_CHUNK = 200;

type Resolved = {
  user: SessionUser;
  contextId: string;
  access: BankStatementsAccess;
};

// Every action starts here: logged-in user, context they may use, module enabled in it.
const resolve = async (contextId: string): Promise<Resolved | null> => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const context = await getModuleContext(user, String(contextId ?? ''), 'bank_statements');

  if (!context) {
    return null;
  }

  const permissions = await getContextPermissions(user, context.id);

  return { user, contextId: context.id, access: getBankStatementsAccess(permissions) };
};

export async function importStatementAction(
  contextId: string,
  formData: FormData,
): Promise<BankActionResult<ImportSummary>> {
  const resolved = await resolve(contextId);

  if (!resolved?.access.canImport) {
    return { ok: false, error: FORBIDDEN };
  }

  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Wybierz plik z wyciągiem.' };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let parsed: ReturnType<typeof parseStatement>;

  try {
    parsed = parseStatement(bytes);
  } catch (error) {
    if (error instanceof StatementParseError) {
      return { ok: false, error: error.message };
    }

    console.error('Parsing the statement failed:', error);

    return { ok: false, error: UNEXPECTED };
  }

  const { user } = resolved;
  const { bank } = parsed;

  // Transfers between the organization's own accounts are not payments to record.
  const own = new Set(
    (
      await db
        .select({ accountNumber: ownAccounts.accountNumber })
        .from(ownAccounts)
        .where(eq(ownAccounts.contextId, resolved.contextId))
    ).map(({ accountNumber }) => accountNumber),
  );
  const payments = parsed.payments.filter(
    ({ counterpartyAccount }) =>
      !counterpartyAccount || !own.has(normalizeAccount(counterpartyAccount)),
  );
  const internal = parsed.payments.length - payments.length;
  const keys = dedupKeys(payments);
  const fileName = file.name.slice(0, 200);

  try {
    const summary = await db.transaction(async (tx) => {
      let inserted = 0;

      const [batch] = await tx
        .insert(importBatches)
        .values({
          contextId: resolved.contextId,
          bank,
          fileName,
          fileSha256: sha256(bytes),
          importedBy: user.id,
          totalRows: payments.length,
          insertedRows: 0,
          skippedRows: 0,
        })
        .returning({ id: importBatches.id });

      for (let from = 0; from < payments.length; from += INSERT_CHUNK) {
        const created = await tx
          .insert(bankTransactions)
          .values(
            payments.slice(from, from + INSERT_CHUNK).map((payment, offset) => ({
              ...payment,
              contextId: resolved.contextId,
              importBatchId: batch.id,
              bank,
              dedupKey: keys[from + offset],
            })),
          )
          .onConflictDoNothing()
          .returning({ id: bankTransactions.id });

        inserted += created.length;
      }

      const skipped = payments.length - inserted;

      await tx
        .update(importBatches)
        .set({ insertedRows: inserted, skippedRows: skipped })
        .where(eq(importBatches.id, batch.id));

      await writeAudit(tx, user, {
        contextId: resolved.contextId,
        action: AUDIT_ACTIONS.statementImported,
        entityType: 'import_batch',
        entityId: batch.id,
        details: { bank, fileName, total: payments.length, inserted, skipped, internal },
      });

      return { bank, total: payments.length, inserted, skipped, internal };
    });

    return { ok: true, data: summary };
  } catch (error) {
    console.error('Importing the statement failed:', error);

    return { ok: false, error: UNEXPECTED };
  }
}

type Flag = 'oswiata' | 'processed';

// Sets one of the two flags on a payment, with the change and its log entries in one transaction.
// Turning "oświata" off also clears "przetworzony".
const setFlag = async (
  contextId: string,
  paymentId: string,
  flag: Flag,
  value: boolean,
): Promise<BankActionResult<BankPayment>> => {
  const resolved = await resolve(contextId);

  if (!resolved?.access.canMark) {
    return { ok: false, error: FORBIDDEN };
  }

  if (!UUID_PATTERN.test(String(paymentId ?? ''))) {
    return { ok: false, error: NOT_FOUND };
  }

  const { user, access } = resolved;

  try {
    return await db.transaction(async (tx) => {
      const [current] = await tx
        .select(paymentColumns)
        .from(bankTransactions)
        .where(
          and(
            eq(bankTransactions.id, paymentId),
            eq(bankTransactions.contextId, resolved.contextId),
          ),
        )
        .for('update');

      if (!current || (access.scope === 'oswiataOnly' && !current.isOswiata)) {
        return { ok: false, error: NOT_FOUND } as const;
      }

      const wasProcessed = current.processedAt !== null;
      const unchanged = flag === 'oswiata' ? current.isOswiata === value : wasProcessed === value;

      if (unchanged) {
        return { ok: true, data: toBankPayment(current) } as const;
      }

      const clearsProcessed = flag === 'oswiata' && !value && wasProcessed;
      const changes =
        flag === 'oswiata'
          ? {
              isOswiata: value,
              ...(clearsProcessed ? { processedAt: null, processedBy: null } : {}),
            }
          : { processedAt: value ? new Date() : null, processedBy: value ? user.id : null };

      const [updated] = await tx
        .update(bankTransactions)
        .set(changes)
        .where(eq(bankTransactions.id, paymentId))
        .returning(paymentColumns);

      const details = {
        bank: current.bank,
        bookingDate: current.bookingDate,
        amount: current.amount,
        currency: current.currency,
      };
      const log = (action: (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS], extra = {}) =>
        writeAudit(tx, user, {
          contextId: resolved.contextId,
          action,
          entityType: 'bank_transaction',
          entityId: paymentId,
          details: { ...details, ...extra },
        });

      if (flag === 'oswiata') {
        await log(
          value ? AUDIT_ACTIONS.transactionMarkedOswiata : AUDIT_ACTIONS.transactionUnmarkedOswiata,
        );

        if (clearsProcessed) {
          await log(AUDIT_ACTIONS.transactionUnmarkedProcessed, { reason: 'oswiata_unmarked' });
        }
      } else {
        await log(
          value
            ? AUDIT_ACTIONS.transactionMarkedProcessed
            : AUDIT_ACTIONS.transactionUnmarkedProcessed,
        );
      }

      return { ok: true, data: toBankPayment(updated) } as const;
    });
  } catch (error) {
    console.error('Changing the payment flag failed:', error);

    return { ok: false, error: UNEXPECTED };
  }
};

export async function setOswiataAction(
  contextId: string,
  paymentId: string,
  value: boolean,
): Promise<BankActionResult<BankPayment>> {
  return setFlag(contextId, paymentId, 'oswiata', Boolean(value));
}

export async function setProcessedAction(
  contextId: string,
  paymentId: string,
  value: boolean,
): Promise<BankActionResult<BankPayment>> {
  return setFlag(contextId, paymentId, 'processed', Boolean(value));
}

export async function addOwnAccountAction(
  contextId: string,
  accountNumber: string,
  label: string,
): Promise<BankActionResult<OwnAccount>> {
  const resolved = await resolve(contextId);

  if (!resolved?.access.canManageAccounts) {
    return { ok: false, error: FORBIDDEN };
  }

  const normalized = normalizeAccount(String(accountNumber ?? ''));

  if (!isValidAccount(normalized)) {
    return { ok: false, error: 'Podaj prawidłowy numer rachunku (np. 26 cyfr).' };
  }

  const cleanLabel =
    String(label ?? '')
      .trim()
      .slice(0, 80) || null;

  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(ownAccounts)
        .values({ contextId: resolved.contextId, accountNumber: normalized, label: cleanLabel })
        .onConflictDoNothing()
        .returning({
          id: ownAccounts.id,
          accountNumber: ownAccounts.accountNumber,
          label: ownAccounts.label,
        });

      if (!created) {
        return { ok: false, error: 'Ten rachunek jest już na liście.' } as const;
      }

      await writeAudit(tx, resolved.user, {
        contextId: resolved.contextId,
        action: AUDIT_ACTIONS.ownAccountAdded,
        entityType: 'own_account',
        entityId: created.id,
        details: { accountNumber: normalized, label: cleanLabel },
      });

      return { ok: true, data: created } as const;
    });
  } catch (error) {
    console.error('Adding the own account failed:', error);

    return { ok: false, error: UNEXPECTED };
  }
}

export async function removeOwnAccountAction(
  contextId: string,
  accountId: string,
): Promise<BankActionResult<{ id: string }>> {
  const resolved = await resolve(contextId);

  if (!resolved?.access.canManageAccounts) {
    return { ok: false, error: FORBIDDEN };
  }

  if (!UUID_PATTERN.test(String(accountId ?? ''))) {
    return { ok: false, error: 'Nie znaleziono rachunku.' };
  }

  try {
    return await db.transaction(async (tx) => {
      const [removed] = await tx
        .delete(ownAccounts)
        .where(and(eq(ownAccounts.id, accountId), eq(ownAccounts.contextId, resolved.contextId)))
        .returning({ id: ownAccounts.id, accountNumber: ownAccounts.accountNumber });

      if (!removed) {
        return { ok: false, error: 'Nie znaleziono rachunku.' } as const;
      }

      await writeAudit(tx, resolved.user, {
        contextId: resolved.contextId,
        action: AUDIT_ACTIONS.ownAccountRemoved,
        entityType: 'own_account',
        entityId: removed.id,
        details: { accountNumber: removed.accountNumber },
      });

      return { ok: true, data: { id: removed.id } } as const;
    });
  } catch (error) {
    console.error('Removing the own account failed:', error);

    return { ok: false, error: UNEXPECTED };
  }
}
