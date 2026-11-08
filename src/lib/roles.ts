// ADMIN manages users/contexts and always works in every context; USER only in assigned ones.
// Kept outside src/db/schema (every file there is treated as a PostgreSQL schema) and free of
// DB imports so client components can use it.
export const USER_ROLES = ['ADMIN', 'USER'] as const;
export type UserRole = (typeof USER_ROLES)[number];
