import { existsSync } from 'node:fs';
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

// Migrations run as the admin (schema owner) user, never as the application user.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
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
