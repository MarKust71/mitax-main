import { existsSync, readdirSync } from 'node:fs';
import { basename } from 'node:path';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit does not load .env by itself. In CI / production the variables
// come from the environment, so the file is optional.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const requireEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

const SCHEMA_DIR = './src/db/schema';

// Every src/db/schema/<name>.ts (except index.ts) is a PostgreSQL schema managed by drizzle-kit.
const managedSchemas = readdirSync(SCHEMA_DIR)
  .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
  .map((file) => basename(file, '.ts'));

// Migrations run as the admin (schema owner) user, never as the application user.
export default defineConfig({
  dialect: 'postgresql',
  schema: SCHEMA_DIR,
  schemaFilter: managedSchemas,
  out: './drizzle',
  dbCredentials: {
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 5432),
    database: requireEnv('DB_NAME'),
    user: requireEnv('DB_ADMIN_USER'),
    password: requireEnv('DB_ADMIN_PASSWORD'),
    ssl: process.env.DB_SSL === 'require',
  },
  strict: true,
  verbose: true,
});
