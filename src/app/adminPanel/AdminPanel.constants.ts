export const ADMIN_AREAS = [
  { id: 'users', label: 'Użytkownicy' },
  { id: 'contexts', label: 'Konteksty' },
  { id: 'activity', label: 'Log aktywności' },
  { id: 'settings', label: 'Ustawienia' },
] as const;

export type AdminArea = (typeof ADMIN_AREAS)[number]['id'];
