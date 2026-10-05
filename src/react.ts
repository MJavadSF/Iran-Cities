import { useCallback, useMemo, useState } from 'react';
import {
  getCities,
  getCity,
  getProvince,
  getProvincesList,
  searchCities,
  searchProvinces,
} from './index';
import type {
  City,
  CityId,
  FlatCity,
  Province,
  ProvinceId,
  ProvinceListItem,
  Query,
  SearchOptions,
} from './types';

export function useProvinces(): ProvinceListItem[] {
  return useMemo(() => getProvincesList(), []);
}

export function useCities(provinceQuery: Query | undefined | null): City[] {
  return useMemo(
    () => (provinceQuery !== undefined && provinceQuery !== null && provinceQuery !== '' ? getCities(provinceQuery) : []),
    [provinceQuery],
  );
}

export function useProvinceCitySelect() {
  const [province, setProvinceState] = useState<string>('');
  const [city, setCityState] = useState<string>('');
  const provinces = useProvinces();
  const cities = useCities(province);

  const selectedProvince: Province | undefined = useMemo(
    () => (province ? getProvince(province) : undefined),
    [province],
  );
  const selectedCity: FlatCity | undefined = useMemo(
    () => (city && province ? getCity(city, province) : undefined),
    [city, province],
  );

  const setProvince = useCallback((value: Query) => {
    setProvinceState(value === '' ? '' : getProvince(value)?.en ?? '');
    setCityState('');
  }, []);

  const setCity = useCallback(
    (value: Query) => {
      setCityState(value === '' ? '' : (province ? getCity(value, province)?.en : undefined) ?? '');
    },
    [province],
  );

  const reset = useCallback(() => {
    setProvinceState('');
    setCityState('');
  }, []);

  return {
    provinces,
    cities,
    province,
    setProvince,
    city,
    setCity,
    provinceId: selectedProvince?.id as ProvinceId | undefined,
    cityId: selectedCity?.id as CityId | undefined,
    selectedProvince,
    selectedCity,
    reset,
  };
}

function useStableOptions(options: SearchOptions | undefined): SearchOptions {
  const { limit, locale, fuzzy, maxDistance } = options ?? {};
  return useMemo(() => ({ limit, locale, fuzzy, maxDistance }), [limit, locale, fuzzy, maxDistance]);
}

export function useCitySearch(initialQuery = '', options?: SearchOptions) {
  const [query, setQuery] = useState(initialQuery);
  const stable = useStableOptions(options);
  const results: FlatCity[] = useMemo(() => searchCities(query, stable), [query, stable]);
  return { query, setQuery, results };
}

export function useProvinceSearch(initialQuery = '', options?: SearchOptions) {
  const [query, setQuery] = useState(initialQuery);
  const stable = useStableOptions(options);
  const results: Province[] = useMemo(() => searchProvinces(query, stable), [query, stable]);
  return { query, setQuery, results };
}
