// Grants the application user (DB_USER) read/write access to data only:
// SELECT/INSERT/UPDATE/DELETE on tables and USAGE/SELECT on sequences in the
// public schema, both for existing objects and (via default privileges) for
// every object the admin user (DB_ADMIN_USER) creates in future migrations.
//
// Idempotent. Run once per environment: `yarn db:grants`.
import { existsSync } from 'node:fs';

import pg from 'pg';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const env = (name) => {
  if (!process.env[name]) throw new Error(`Missing environment variable: ${name}`);
  return process.env[name];
};

const client = new pg.Client({
  host: env('DB_HOST'),
  port: Number(process.env.DB_PORT ?? 5432),
  database: env('DB_NAME'),
  user: env('DB_ADMIN_USER'),
  password: env('DB_ADMIN_PASSWORD'),
  ssl: process.env.DB_SSL === 'require',
});

const appUser = client.escapeIdentifier(env('DB_USER'));

const statements = [
  `GRANT USAGE ON SCHEMA public TO ${appUser}`,
  `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${appUser}`,
  `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${appUser}`,
  `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${appUser}`,
  `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${appUser}`,
];

await client.connect();
try {
  await client.query('BEGIN');
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
