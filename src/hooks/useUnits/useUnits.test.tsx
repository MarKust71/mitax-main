import { renderHook } from '@testing-library/react';

import { useUnits } from './useUnits';

describe('useUnits', () => {
  test('returns a value', async () => {
    const { result } = renderHook(() => useUnits());

    expect(result.current).toEqual('1');
  });
});
