import { renderHook } from '@testing-library/react';

import { useMembers } from './useMembers';

describe('useMembers', () => {
  test('returns a value', async () => {
    const { result } = renderHook(() => useMembers());

    expect(result.current).toEqual('1');
  });
});
