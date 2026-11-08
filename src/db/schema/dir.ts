// Tables of the bank statements feature (context module `bank_statements`, used by DIR).
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgSchema,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { contexts } from './public';

export const dir = pgSchema('dir');

export const bank = dir.enum('bank', ['ERSTE', 'BPS']);

// One uploaded statement file.
export const importBatches = dir.table(
  'import_batches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Rows are bound to a context so enabling the module elsewhere never exposes this data.
    contextId: uuid('context_id')
      .notNull()
      .references(() => contexts.id),
    bank: bank('bank').notNull(),
    fileName: text('file_name').notNull(),
    fileSha256: text('file_sha256').notNull(),
    importedBy: uuid('imported_by').notNull(),
    importedAt: timestamp('imported_at', { withTimezone: true }).defaultNow().notNull(),
    // Incoming payments found in the file / saved as new / skipped as already imported.
    totalRows: integer('total_rows').notNull(),
    insertedRows: integer('inserted_rows').notNull(),
    skippedRows: integer('skipped_rows').notNull(),
  },
  (table) => [index('import_batches_context_idx').on(table.contextId, table.importedAt)],
);

// Incoming payments (credits) from bank statements in one common shape.
export const bankTransactions = dir.table(
  'bank_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    contextId: uuid('context_id')
      .notNull()
      .references(() => contexts.id),
    importBatchId: uuid('import_batch_id')
      .notNull()
      .references(() => importBatches.id),
    bank: bank('bank').notNull(),
    // Identifies the payment so importing the same statement twice adds nothing (see dedupKey()).
    dedupKey: text('dedup_key').notNull(),
    accountNumber: text('account_number'),
    bookingDate: date('booking_date', { mode: 'string' }).notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    currency: text('currency').notNull(),
    counterpartyName: text('counterparty_name'),
    counterpartyAccount: text('counterparty_account'),
    title: text('title'),
    bankReference: text('bank_reference'),
    isOswiata: boolean('is_oswiata').notNull().default(false),
    // Set when the user processed the payment; cleared when `is_oswiata` is turned off.
    processedAt: timestamp('processed_at', { withTimezone: true }),
    processedBy: uuid('processed_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('bank_transactions_dedup_unique').on(table.contextId, table.bank, table.dedupKey),
    index('bank_transactions_context_date_idx').on(table.contextId, table.bookingDate),
  ],
);

// The organization's own accounts: incoming payments from them (transfers between own accounts)
// are skipped on import. Numbers are stored normalized (see normalizeAccount()).
export const ownAccounts = dir.table(
  'own_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    contextId: uuid('context_id')
      .notNull()
      .references(() => contexts.id),
    accountNumber: text('account_number').notNull(),
    label: text('label'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique('own_accounts_unique').on(table.contextId, table.accountNumber)],
);
