import { useMemo, useState } from 'react';
import {
  getCities,
  getProvincesList,
  searchCities,
  searchProvinces,
} from './index';
import type { City, FlatCity, Province, SearchOptions } from './types';

/** لیست استان‌ها (بدون شهرها) - برای Select/Dropdown استان */
export function useProvinces(): { en: string; fa: string }[] {
  return useMemo(() => getProvincesList(), []);
}

/** لیست شهرهای یک استان؛ با تغییر استان به‌صورت خودکار به‌روز می‌شود */
export function useCities(provinceQuery: string | undefined | null): City[] {
  return useMemo(() => (provinceQuery ? getCities(provinceQuery) : []), [provinceQuery]);
}

/**
 * ست کامل state + logic برای یک فرم استان/شهر:
 * const { provinces, cities, province, setProvince, city, setCity } = useProvinceCitySelect();
 */
export function useProvinceCitySelect() {
  const [province, setProvinceState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const provinces = useProvinces();
  const cities = useCities(province);

  const setProvince = (value: string) => {
    setProvinceState(value);
    setCity(''); // با تغییر استان، شهر انتخابی ریست می‌شود
  };

  return { provinces, cities, province, setProvince, city, setCity };
}

/** جستجوی زنده‌ی شهر با نگه‌داشتن state عبارت جستجو */
export function useCitySearch(initialQuery = '', options?: SearchOptions) {
  const [query, setQuery] = useState(initialQuery);
  const results: FlatCity[] = useMemo(() => searchCities(query, options), [query, options]);
  return { query, setQuery, results };
}

/** جستجوی زنده‌ی استان با نگه‌داشتن state عبارت جستجو */
export function useProvinceSearch(initialQuery = '', options?: SearchOptions) {
  const [query, setQuery] = useState(initialQuery);
  const results: Province[] = useMemo(() => searchProvinces(query, options), [query, options]);
  return { query, setQuery, results };
}
