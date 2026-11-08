import 'server-only';

import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

const deriveKey = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)));
  });

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);

  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [scheme, saltHex, keyHex] = stored.split('$');

  if (scheme !== 'scrypt' || !saltHex || !keyHex) {
    return false;
  }

  const expected = Buffer.from(keyHex, 'hex');
  const actual = await deriveKey(password, Buffer.from(saltHex, 'hex'));

  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

// Random URL-safe token (sent to the user) and its SHA-256 hash (stored in the DB).
export const generateToken = (): string => randomBytes(32).toString('base64url');

export const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
