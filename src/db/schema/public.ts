// Shared, application-wide tables (users, sessions, ...) live in the `public` schema.
//
// import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
//
// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   email: text('email').notNull().unique(),
//   createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
// });

export {};
