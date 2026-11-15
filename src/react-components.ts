'use client';

import * as api from './index';
import * as hooks from './react';
import { createComponents } from './components';
import type { IranCitiesComponents } from './components';

const components: IranCitiesComponents = createComponents(api, hooks);

export const CityCombobox: IranCitiesComponents['CityCombobox'] = components.CityCombobox;
export const ProvinceCitySelect: IranCitiesComponents['ProvinceCitySelect'] = components.ProvinceCitySelect;

export type { CityComboboxProps, IranCitiesComponents, ProvinceCitySelectProps } from './components';
export type { CityId, FlatCity, ProvinceCityValue, ProvinceId, Query } from './types';
