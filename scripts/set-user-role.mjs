// Sets a user's role (bootstrap for the first ADMIN): `yarn db:set-role <email> ADMIN|USER`.
// Runs as the admin DB user. Targets the database from .env (DB_NAME) - check it first.
import { existsSync } from 'node:fs';

import pg from 'pg';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const [emailArg, roleArg] = process.argv.slice(2);
const role = roleArg?.toUpperCase();

if (!emailArg || !['ADMIN', 'USER'].includes(role)) {
  console.error('Usage: yarn db:set-role <email> <ADMIN|USER>');
  process.exit(1);
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

await client.connect();
try {
  const { rowCount } = await client.query(
    'UPDATE public.users SET role = $1 WHERE email = $2',
    [role, emailArg.trim().toLowerCase()],
  );
  console.log(rowCount ? `✓ ${emailArg} -> ${role} (${env('DB_NAME')})` : `No such user: ${emailArg}`);
  process.exitCode = rowCount ? 0 : 1;
} finally {
  await client.end();
}
