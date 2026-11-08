import { createAuthStore } from './authStore';

describe('authStore', () => {
  test('starts with the initial user and a closed dialog', () => {
    const store = createAuthStore({ id: '1', email: 'a@b.pl' });

    expect(store.getState().user).toEqual({ id: '1', email: 'a@b.pl' });
    expect(store.getState().dialogOpen).toBe(false);
  });

  test('opens the dialog in the requested mode and closes it', () => {
    const store = createAuthStore();

    store.getState().openDialog('register');
    expect(store.getState()).toMatchObject({ dialogOpen: true, mode: 'register' });

    store.getState().closeDialog();
    expect(store.getState().dialogOpen).toBe(false);
  });

  test('stores are independent of each other', () => {
    const first = createAuthStore();
    const second = createAuthStore();

    first.getState().setUser({ id: '1', email: 'a@b.pl' });

    expect(second.getState().user).toBeNull();
  });
});
