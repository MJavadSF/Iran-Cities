import * as v from 'valibot';
import * as lite from './lite';
import type { FlatCity, IranCities, Province, Query } from './types';
import { DEFAULT_MESSAGES, cityBelongsToProvince, isCityId, isProvinceId, toId } from './validation-shared';
import type { ValidationMessages } from './validation-shared';

export interface ProvinceCityIds {
  provinceId: number;
  cityId: number;
}

export interface IranCitiesValibotSchemas {
  provinceId: v.GenericSchema<unknown, number>;
  cityId: v.GenericSchema<unknown, number>;
  province: v.GenericSchema<unknown, Province>;
  city: v.GenericSchema<unknown, FlatCity>;
  provinceCity: v.GenericSchema<unknown, ProvinceCityIds>;
}

const api: IranCities = lite;

export function createValibotSchemas(messages: Partial<ValidationMessages> = {}): IranCitiesValibotSchemas {
  const m: ValidationMessages = { ...DEFAULT_MESSAGES, ...messages };

  const provinceId = v.pipe(
    v.unknown(),
    v.transform((value) => toId(value) ?? NaN),
    v.check((id) => isProvinceId(api, id), m.province),
  ) as unknown as v.GenericSchema<unknown, number>;

  const cityId = v.pipe(
    v.unknown(),
    v.transform((value) => toId(value) ?? NaN),
    v.check((id) => isCityId(api, id), m.city),
  ) as unknown as v.GenericSchema<unknown, number>;

  const province = v.pipe(
    v.union([v.string(), v.number()], m.province),
    v.check((value) => api.getProvince(value as Query) !== undefined, m.province),
    v.transform((value) => api.getProvince(value as Query) as Province),
  ) as unknown as v.GenericSchema<unknown, Province>;

  const city = v.pipe(
    v.union([v.string(), v.number()], m.city),
    v.check((value) => api.getCity(value as Query) !== undefined, m.city),
    v.transform((value) => api.getCity(value as Query) as FlatCity),
  ) as unknown as v.GenericSchema<unknown, FlatCity>;

  const provinceCity = v.pipe(
    v.object({ provinceId, cityId }),
    v.forward(
      v.check((value) => cityBelongsToProvince(api, value.cityId, value.provinceId), m.cityNotInProvince),
      ['cityId'],
    ),
  ) as unknown as v.GenericSchema<unknown, ProvinceCityIds>;

  return { provinceId, cityId, province, city, provinceCity };
}

const schemas: IranCitiesValibotSchemas = createValibotSchemas();

export const provinceIdSchema: v.GenericSchema<unknown, number> = schemas.provinceId;
export const cityIdSchema: v.GenericSchema<unknown, number> = schemas.cityId;
export const provinceSchema: v.GenericSchema<unknown, Province> = schemas.province;
export const citySchema: v.GenericSchema<unknown, FlatCity> = schemas.city;
export const provinceCitySchema: v.GenericSchema<unknown, ProvinceCityIds> = schemas.provinceCity;

export { toId };
export type { ValidationMessages };
