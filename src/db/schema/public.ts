// Shared, application-wide tables (users, sessions, settings, ...) live in the `public` schema.
import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { USER_ROLES } from '@/lib/roles';

// Application parameters (key/value), e.g. the activation link validity period.
// Defaults are inserted by the migration; see src/lib/settings.ts for the known keys.
export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userRole = pgEnum('user_role', USER_ROLES);

// The e-mail address (stored lower-cased) is the user name.
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  // NULL until the user opens the activation link.
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  role: userRole('role').notNull().default('USER'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Only a SHA-256 hash of the token is stored; the raw token exists only in the e-mailed link.
export const emailVerificationTokens = pgTable(
  'email_verification_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('email_verification_tokens_user_id_idx').on(table.userId)],
);

// Server-side sessions; the cookie holds a random token, the table its SHA-256 hash.
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)],
);

// Failed/attempted logins and registrations, used for simple rate limiting.
export const authAttempts = pgTable(
  'auth_attempts',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    email: text('email').notNull(),
    kind: text('kind').notNull(), // 'login' | 'register' | 'resend'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('auth_attempts_email_kind_created_idx').on(table.email, table.kind, table.createdAt),
  ],
);

// A context = a separate data area (tenant). Creating one also creates the PostgreSQL schema
// `schema_name` (see public.create_context_schema, the only way the app can create schemas).
export const contexts = pgTable('contexts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  schemaName: text('schema_name').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Contexts assigned to USER accounts. ADMINs ignore this table (all contexts implicitly).
export const userContexts = pgTable(
  'user_contexts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contextId: uuid('context_id')
      .notNull()
      .references(() => contexts.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.contextId] }),
    index('user_contexts_context_id_idx').on(table.contextId),
  ],
);
