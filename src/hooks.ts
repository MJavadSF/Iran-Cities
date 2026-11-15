import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  City,
  FlatCity,
  IranCities,
  IranCitiesHooks,
  Province,
  ProvinceCitySelect,
  ProvinceCitySelectOptions,
  ProvinceCityValue,
  ProvinceListItem,
  Query,
  SearchOptions,
  SearchState,
} from './types';

function isEmptyQuery(value: Query | undefined | null): value is undefined | null | '' {
  return value === undefined || value === null || value === '';
}

const EMPTY_CITIES: readonly City[] = Object.freeze([]);

export function createHooks(api: IranCities): IranCitiesHooks {
  function resolveInitial(initialProvince?: Query, initialCity?: Query): ProvinceCityValue {
    const province = isEmptyQuery(initialProvince) ? undefined : api.getProvince(initialProvince);
    if (isEmptyQuery(initialCity)) return { provinceId: province?.id };
    const city = province ? api.getCity(initialCity, province.id) : api.getCity(initialCity);
    if (!city) return { provinceId: province?.id };
    return { provinceId: city.provinceId, cityId: city.id };
  }

  function useProvinces(): ProvinceListItem[] {
    return useMemo(() => api.getProvincesList(), []);
  }

  function useCities(provinceQuery: Query | undefined | null): readonly City[] {
    return useMemo(
      () => (isEmptyQuery(provinceQuery) ? EMPTY_CITIES : api.getCities(provinceQuery)),
      [provinceQuery],
    );
  }

  function useProvinceCitySelect(options: ProvinceCitySelectOptions = {}): ProvinceCitySelect {
    const { value, onChange, initialProvince, initialCity } = options;
    const [inner, setInner] = useState<ProvinceCityValue>(() => resolveInitial(initialProvince, initialCity));
    const controlled = value !== undefined;
    const current = controlled ? value : inner;

    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const selectedProvince = useMemo(
      () => (current.provinceId === undefined ? undefined : api.getProvinceById(current.provinceId)),
      [current.provinceId],
    );
    const selectedCity = useMemo(() => {
      if (current.cityId === undefined || !selectedProvince) return undefined;
      const city = api.getCityById(current.cityId);
      return city && city.provinceId === selectedProvince.id ? city : undefined;
    }, [current.cityId, selectedProvince]);

    const provinces = useProvinces();
    const cities = useCities(selectedProvince?.id);

    const provinceId = selectedProvince?.id;
    const cityId = selectedCity?.id;

    const commit = useCallback(
      (next: ProvinceCityValue) => {
        if (!controlled) setInner(next);
        onChangeRef.current?.(next);
      },
      [controlled],
    );

    const setProvince = useCallback(
      (query: Query) => {
        const province = isEmptyQuery(query) ? undefined : api.getProvince(query);
        commit({ provinceId: province?.id, cityId: undefined });
      },
      [commit],
    );

    const setCity = useCallback(
      (query: Query) => {
        if (provinceId === undefined || isEmptyQuery(query)) {
          commit({ provinceId, cityId: undefined });
          return;
        }
        commit({ provinceId, cityId: api.getCity(query, provinceId)?.id });
      },
      [commit, provinceId],
    );

    const reset = useCallback(() => commit({}), [commit]);

    const normalizedValue = useMemo<ProvinceCityValue>(() => ({ provinceId, cityId }), [provinceId, cityId]);

    return {
      provinces,
      cities,
      province: selectedProvince?.en ?? '',
      city: selectedCity?.en ?? '',
      provinceId,
      cityId,
      value: normalizedValue,
      selectedProvince,
      selectedCity,
      setProvince,
      setCity,
      reset,
    };
  }

  function useStableOptions(options: SearchOptions | undefined): SearchOptions {
    const { limit, locale, fuzzy, maxDistance, emptyQuery } = options ?? {};
    return useMemo(
      () => ({ limit, locale, fuzzy, maxDistance, emptyQuery }),
      [limit, locale, fuzzy, maxDistance, emptyQuery],
    );
  }

  function useCitySearch(initialQuery = '', options?: SearchOptions): SearchState<FlatCity> {
    const [query, setQuery] = useState(initialQuery);
    const stable = useStableOptions(options);
    const results = useMemo(() => api.searchCities(query, stable), [query, stable]);
    return { query, setQuery, results };
  }

  function useProvinceSearch(initialQuery = '', options?: SearchOptions): SearchState<Province> {
    const [query, setQuery] = useState(initialQuery);
    const stable = useStableOptions(options);
    const results = useMemo(() => api.searchProvinces(query, stable), [query, stable]);
    return { query, setQuery, results };
  }

  return { useProvinces, useCities, useProvinceCitySelect, useCitySearch, useProvinceSearch };
}
