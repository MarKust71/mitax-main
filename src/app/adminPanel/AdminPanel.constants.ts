export const ADMIN_AREAS = [
  { id: 'users', label: 'Użytkownicy' },
  { id: 'contexts', label: 'Konteksty' },
] as const;

export type AdminArea = (typeof ADMIN_AREAS)[number]['id'];
