import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useCities,
  useCitySearch,
  useProvinceCitySelect,
  useProvinceSearch,
  useProvinces,
  type ProvinceCityValue,
} from '../src/react';

describe('useProvinces / useCities', () => {
  it('returns provinces and cities', () => {
    expect(renderHook(() => useProvinces()).result.current).toHaveLength(31);
    expect(renderHook(() => useCities('fars')).result.current.length).toBeGreaterThan(0);
    expect(renderHook(() => useCities('')).result.current).toEqual([]);
    expect(renderHook(() => useCities(null)).result.current).toEqual([]);
  });
});

describe('useProvinceCitySelect', () => {
  it('works uncontrolled', () => {
    const { result } = renderHook(() => useProvinceCitySelect());
    expect(result.current.provinceId).toBeUndefined();
    act(() => result.current.setProvince('فارس'));
    expect(result.current.province).toBe('fars');
    expect(result.current.cities.length).toBeGreaterThan(0);
    act(() => result.current.setCity('شیراز'));
    expect(result.current.cityId).toBe(292);
    expect(result.current.selectedCity?.en).toBe('shiraz');
    act(() => result.current.setProvince('tehran'));
    expect(result.current.cityId).toBeUndefined();
    act(() => result.current.reset());
    expect(result.current.value).toEqual({ provinceId: undefined, cityId: undefined });
  });

  it('accepts initial values', () => {
    const { result } = renderHook(() => useProvinceCitySelect({ initialProvince: 'fars', initialCity: 'shiraz' }));
    expect(result.current.provinceId).toBe(7);
    expect(result.current.cityId).toBe(292);
  });

  it('derives the province from an initial city alone', () => {
    const { result } = renderHook(() => useProvinceCitySelect({ initialCity: 292 }));
    expect(result.current.province).toBe('fars');
    expect(result.current.city).toBe('shiraz');
  });

  it('ignores a city that does not belong to the province', () => {
    const { result } = renderHook(() => useProvinceCitySelect({ initialProvince: 'tehran', initialCity: 'shiraz' }));
    expect(result.current.provinceId).toBe(28);
    expect(result.current.cityId).toBeUndefined();
  });

  it('works controlled and calls onChange', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: ProvinceCityValue }) => useProvinceCitySelect({ value, onChange }),
      { initialProps: { value: { provinceId: 7, cityId: 292 } as ProvinceCityValue } },
    );
    expect(result.current.city).toBe('shiraz');
    act(() => result.current.setProvince('tehran'));
    expect(onChange).toHaveBeenLastCalledWith({ provinceId: 28, cityId: undefined });
    expect(result.current.province).toBe('fars');
    rerender({ value: { provinceId: 28 } });
    expect(result.current.province).toBe('tehran');
    act(() => result.current.setCity('تهران'));
    expect(onChange).toHaveBeenLastCalledWith({ provinceId: 28, cityId: 1126 });
  });

  it('keeps setter identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useProvinceCitySelect());
    const first = result.current.setProvince;
    rerender();
    expect(result.current.setProvince).toBe(first);
  });
});

describe('search hooks', () => {
  it('searches cities and provinces', () => {
    const { result } = renderHook(() => useCitySearch('', { emptyQuery: 'none', limit: 5 }));
    expect(result.current.results).toEqual([]);
    act(() => result.current.setQuery('شیراز'));
    expect(result.current.results[0]!.en).toBe('shiraz');
    const provinces = renderHook(() => useProvinceSearch('tehran'));
    expect(provinces.result.current.results[0]!.en).toBe('tehran');
  });

  it('does not recompute for inline options objects', () => {
    const { result, rerender } = renderHook(() => useCitySearch('ش', { limit: 3 }));
    const first = result.current.results;
    rerender();
    expect(result.current.results).toBe(first);
  });
});
