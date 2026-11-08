// Grants the application user (DB_USER) read/write access to data only.
//
// For every schema owned by the admin user (DB_ADMIN_USER), plus `public`:
//   - USAGE on the schema,
//   - SELECT/INSERT/UPDATE/DELETE on existing tables,
//   - USAGE/SELECT on existing sequences.
// Plus database-wide default privileges, so every table/sequence the admin creates
// later (in any schema) is readable/writable by the app user right away.
//
// The `drizzle` schema (migration history) is intentionally excluded: without USAGE
// on it, the app user cannot read or modify the migration journal.
//
// Idempotent. Runs automatically after `yarn db:migrate`; can be run alone: `yarn db:grants`.
import { existsSync } from 'node:fs';

import pg from 'pg';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const env = (name) => {
  if (!process.env[name]) throw new Error(`Missing environment variable: ${name}`);
  return process.env[name];
};

const EXCLUDED_SCHEMAS = ['drizzle'];

const client = new pg.Client({
  host: env('DB_HOST'),
  port: Number(process.env.DB_PORT ?? 5432),
  database: env('DB_NAME'),
  user: env('DB_ADMIN_USER'),
  password: env('DB_ADMIN_PASSWORD'),
  ssl: process.env.DB_SSL === 'require',
});

const appUser = client.escapeIdentifier(env('DB_USER'));

await client.connect();
try {
  await client.query('BEGIN');

  const { rows } = await client.query(
    `SELECT nspname FROM pg_namespace
     WHERE (nspowner = (SELECT oid FROM pg_roles WHERE rolname = current_user) OR nspname = 'public')
       AND nspname <> ALL($1::text[])
     ORDER BY nspname`,
    [EXCLUDED_SCHEMAS],
  );
  const schemas = rows.map(({ nspname }) => client.escapeIdentifier(nspname));

  const statements = [
    ...schemas.flatMap((schema) => [
      `GRANT USAGE ON SCHEMA ${schema} TO ${appUser}`,
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ${schema} TO ${appUser}`,
      `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ${schema} TO ${appUser}`,
    ]),
    // The only way the app can create schemas (contexts): a SECURITY DEFINER function.
    `GRANT EXECUTE ON FUNCTION public.create_context_schema(text) TO ${appUser}`,
    // Database-wide (no IN SCHEMA): applies to objects the admin creates in any schema.
    `ALTER DEFAULT PRIVILEGES GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${appUser}`,
    `ALTER DEFAULT PRIVILEGES GRANT USAGE, SELECT ON SEQUENCES TO ${appUser}`,
  ];

  for (const sql of statements) {
    await client.query(sql);
    console.log('✓', sql);
  }

  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
