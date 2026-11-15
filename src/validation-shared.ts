import { normalize } from './normalize';
import type { IranCities } from './types';

export interface ValidationMessages {
  province: string;
  city: string;
  cityNotInProvince: string;
}

export const DEFAULT_MESSAGES: ValidationMessages = {
  province: 'استان انتخاب‌شده معتبر نیست.',
  city: 'شهر انتخاب‌شده معتبر نیست.',
  cityNotInProvince: 'این شهر در استان انتخاب‌شده نیست.',
};

export function toId(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isInteger(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const text = normalize(value);
  return /^\d+$/.test(text) ? Number(text) : undefined;
}

export function isProvinceId(api: IranCities, value: unknown): boolean {
  const id = toId(value);
  return id !== undefined && api.getProvinceById(id) !== undefined;
}

export function isCityId(api: IranCities, value: unknown): boolean {
  const id = toId(value);
  return id !== undefined && api.getCityById(id) !== undefined;
}

export function cityBelongsToProvince(api: IranCities, cityId: unknown, provinceId: unknown): boolean {
  const city = api.getCityById(toId(cityId) ?? -1);
  return !!city && city.provinceId === toId(provinceId);
}
