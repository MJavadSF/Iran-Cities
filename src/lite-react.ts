'use client';

import * as api from './lite';
import { createHooks } from './hooks';
import type { IranCitiesHooks } from './types';

const hooks: IranCitiesHooks = createHooks(api);

export const useProvinces: IranCitiesHooks['useProvinces'] = hooks.useProvinces;
export const useCities: IranCitiesHooks['useCities'] = hooks.useCities;
export const useProvinceCitySelect: IranCitiesHooks['useProvinceCitySelect'] = hooks.useProvinceCitySelect;
export const useCitySearch: IranCitiesHooks['useCitySearch'] = hooks.useCitySearch;
export const useProvinceSearch: IranCitiesHooks['useProvinceSearch'] = hooks.useProvinceSearch;

export type {
  City,
  CityId,
  FlatCity,
  IranCitiesHooks,
  Province,
  ProvinceCitySelect,
  ProvinceCitySelectOptions,
  ProvinceCityValue,
  ProvinceId,
  ProvinceListItem,
  Query,
  SearchOptions,
  SearchState,
} from './types';
