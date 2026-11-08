import type { ModuleKey } from '@/lib/modules';
import type { UserRole } from '@/lib/roles';

export type AdminUserListItem = {
  id: string;
  email: string;
  role: UserRole;
  active: boolean;
  blocked: boolean;
};

export type AdminUserDetails = AdminUserListItem & {
  createdAt: string;
  emailVerifiedAt: string | null;
  blockedAt: string | null;
  contextIds: string[];
};

export type AdminContext = {
  id: string;
  name: string;
  schemaName: string;
  modules: ModuleKey[];
};

export type AdminActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
