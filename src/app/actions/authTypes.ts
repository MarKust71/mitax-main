import type { UserRole } from '@/lib/roles';

export type AuthUser = { id: string; email: string; role: UserRole };

export type AuthActionResult =
  { ok: true; message?: string; user?: AuthUser } | { ok: false; error: string };
