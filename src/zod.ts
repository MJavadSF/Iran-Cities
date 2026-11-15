import { z } from 'zod';
import * as lite from './lite';
import type { FlatCity, IranCities, Province, Query } from './types';
import { DEFAULT_MESSAGES, cityBelongsToProvince, isCityId, isProvinceId, toId } from './validation-shared';
import type { ValidationMessages } from './validation-shared';

export interface ProvinceCityIds {
  provinceId: number;
  cityId: number;
}

export interface IranCitiesZodSchemas {
  provinceId: z.ZodType<number>;
  cityId: z.ZodType<number>;
  province: z.ZodType<Province>;
  city: z.ZodType<FlatCity>;
  provinceCity: z.ZodType<ProvinceCityIds>;
}

const api: IranCities = lite;

export function createZodSchemas(messages: Partial<ValidationMessages> = {}): IranCitiesZodSchemas {
  const m: ValidationMessages = { ...DEFAULT_MESSAGES, ...messages };
  const query = z.union([z.string(), z.number()]);

  const provinceId = z.preprocess(
    (value) => toId(value) ?? value,
    z.number({ message: m.province }).refine((id) => isProvinceId(api, id), { message: m.province }),
  ) as unknown as z.ZodType<number>;

  const cityId = z.preprocess(
    (value) => toId(value) ?? value,
    z.number({ message: m.city }).refine((id) => isCityId(api, id), { message: m.city }),
  ) as unknown as z.ZodType<number>;

  const province = query
    .refine((value) => api.getProvince(value as Query) !== undefined, { message: m.province })
    .transform((value) => api.getProvince(value as Query) as Province) as unknown as z.ZodType<Province>;

  const city = query
    .refine((value) => api.getCity(value as Query) !== undefined, { message: m.city })
    .transform((value) => api.getCity(value as Query) as FlatCity) as unknown as z.ZodType<FlatCity>;

  const provinceCity = z
    .object({ provinceId, cityId })
    .refine((value) => cityBelongsToProvince(api, value.cityId, value.provinceId), {
      message: m.cityNotInProvince,
      path: ['cityId'],
    }) as unknown as z.ZodType<ProvinceCityIds>;

  return { provinceId, cityId, province, city, provinceCity };
}

const schemas: IranCitiesZodSchemas = createZodSchemas();

export const provinceIdSchema: z.ZodType<number> = schemas.provinceId;
export const cityIdSchema: z.ZodType<number> = schemas.cityId;
export const provinceSchema: z.ZodType<Province> = schemas.province;
export const citySchema: z.ZodType<FlatCity> = schemas.city;
export const provinceCitySchema: z.ZodType<ProvinceCityIds> = schemas.provinceCity;

export { toId };
export type { ValidationMessages };
