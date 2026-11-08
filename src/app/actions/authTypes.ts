export type AuthUser = { id: string; email: string };

export type AuthActionResult =
  { ok: true; message?: string; user?: AuthUser } | { ok: false; error: string };
