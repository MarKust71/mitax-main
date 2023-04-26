import { renderHook } from '@testing-library/react-hooks';

import { useUnits } from './useUnits';

describe('useUnits', () => {
  test('returns a value', async () => {
    const { result } = renderHook(() => useUnits());

    expect(result.current).toEqual('1');
  });
});