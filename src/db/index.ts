import 'server-only';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { PoolConfig } from 'pg';

import * as schema from './schema';

const requireEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

// DB_SSL=require -> TLS with certificate verification (optionally against DB_SSL_CA, PEM).
// DB_SSL=disable -> plain connection (use only on trusted networks).
const getSslConfig = (): PoolConfig['ssl'] => {
  if (process.env.DB_SSL !== 'require') {
    return false;
  }

  return process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : true;
};

const createPool = () =>
  new Pool({
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 5432),
    database: requireEnv('DB_NAME'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    ssl: getSslConfig(),
    max: 10,
  });

// Reuse a single pool across hot reloads in development.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const pool = globalForDb.pgPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgPool = pool;
}

export const db = drizzle(pool, { schema });
