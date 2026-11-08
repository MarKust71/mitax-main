// Database schema entry point.
//
// One file per PostgreSQL schema:
//   - public.ts     -> shared tables (users, login, ...), schema `public`
//   - <name>.ts     -> feature tables in their own schema `<name>`, e.g. wspolnota.ts:
//
//       import { pgSchema, serial, text } from 'drizzle-orm/pg-core';
//
//       export const wspolnota = pgSchema('wspolnota');
//       export const units = wspolnota.table('units', {
//         id: serial('id').primaryKey(),
//         name: text('name').notNull(),
//       });
//
// The file name must match the schema name: drizzle.config.ts derives the list of
// managed schemas from the files in this directory. Re-export every file below.

export * from './public';
