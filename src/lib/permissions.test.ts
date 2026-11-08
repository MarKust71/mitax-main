// @vitest-environment node
import { getBankStatementsAccess } from './bankStatementsAccess';
import { isPermissionKey, PERMISSION_KEYS } from './permissions';

describe('getBankStatementsAccess', () => {
  test('without the import permission the user can only work on imported payments', () => {
    expect(getBankStatementsAccess([])).toEqual({
      canImport: false,
      canMark: true,
      canManageAccounts: false,
      scope: 'oswiataOnly',
    });
  });

  test('import and own accounts are separate permissions', () => {
    expect(getBankStatementsAccess(['bank_statements.import'])).toMatchObject({
      canImport: true,
      canManageAccounts: false,
    });
    expect(getBankStatementsAccess(['bank_statements.own_accounts'])).toMatchObject({
      canImport: false,
      canManageAccounts: true,
    });
  });

  test('without "all operations" the user sees only oświata payments', () => {
    expect(getBankStatementsAccess([]).scope).toBe('oswiataOnly');
    expect(getBankStatementsAccess(['bank_statements.import']).scope).toBe('oswiataOnly');
  });

  test('"all operations" shows every payment', () => {
    expect(getBankStatementsAccess(['bank_statements.all_operations']).scope).toBe('all');
  });

  test('ADMIN (every permission) has full access', () => {
    expect(getBankStatementsAccess(PERMISSION_KEYS)).toEqual({
      canImport: true,
      canMark: true,
      canManageAccounts: true,
      scope: 'all',
    });
  });
});

describe('isPermissionKey', () => {
  test('accepts known keys only', () => {
    expect(isPermissionKey('bank_statements.import')).toBe(true);
    expect(isPermissionKey('bank_statements.own_accounts')).toBe(true);
    expect(isPermissionKey('bank_statements.all_operations')).toBe(true);
    expect(isPermissionKey('bank_statements.delete')).toBe(false);
    expect(isPermissionKey(undefined)).toBe(false);
  });
});
