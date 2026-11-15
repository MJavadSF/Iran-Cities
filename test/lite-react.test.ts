import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as full from '../src/react';
import * as lite from '../src/lite-react';

describe('lite/react entry', () => {
  it('exposes the same hooks', () => {
    expect(Object.keys(lite).sort()).toEqual(Object.keys(full).sort());
  });

  it('works without coordinates', () => {
    const { result } = renderHook(() => lite.useProvinceCitySelect({ initialProvince: 'fars' }));
    act(() => result.current.setCity('شیراز'));
    expect(result.current.cityId).toBe(292);
    expect(result.current.selectedCity?.coordinates).toBeUndefined();
  });
});
