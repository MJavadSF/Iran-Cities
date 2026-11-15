import type { RawCity, RawProvince } from './core';

type PackedProvince = [number, string, string, string, number, string, number[], number];
type PackedExtra = [number, string | 0, string[] | 0, 0 | 1, string[] | 0];

export interface PackedData {
  format: number;
  provinces: PackedProvince[];
  ids: number[];
  en: string;
  fa: string;
  extras: PackedExtra[];
  confidence?: string;
  lat?: number[];
  lng?: number[];
}

const SCALE = 1e7;
const CONFIDENCE: Readonly<Record<string, RawCity['coord-confidence'] | 'high'>> = {
  '1': 'high',
  '2': 'medium',
  '3': 'low',
};

export function unpack(packed: PackedData): RawProvince[] {
  if (packed.format !== 1) throw new Error(`Unsupported data format ${packed.format}`);
  const en = packed.en.split('|');
  const fa = packed.fa.split('|');
  const extras = new Map<number, PackedExtra>();
  for (const extra of packed.extras) extras.set(extra[0], extra);

  let id = 0;
  let lat = 0;
  let lng = 0;
  let coordIndex = 0;
  let cityIndex = 0;

  return packed.provinces.map(([provinceId, provinceEn, provinceFa, phoneCode, capitalId, nameEn, neighbors, count]) => {
    const cities: RawCity[] = [];
    for (let n = 0; n < count; n++, cityIndex++) {
      id += packed.ids[cityIndex] as number;
      const city: RawCity = { 'city-id': id, 'city-en': en[cityIndex] as string, 'city-fa': fa[cityIndex] as string };
      const code = packed.confidence?.charAt(cityIndex);
      if (code && code !== '0' && packed.lat && packed.lng) {
        lat += packed.lat[coordIndex] as number;
        lng += packed.lng[coordIndex] as number;
        coordIndex++;
        city.lat = lat / SCALE;
        city.lng = lng / SCALE;
        const confidence = CONFIDENCE[code];
        if (confidence && confidence !== 'high') city['coord-confidence'] = confidence;
      }
      const extra = extras.get(cityIndex);
      if (extra) {
        if (extra[1]) city['name-en'] = extra[1];
        if (extra[2]) city.aliases = extra[2];
        if (extra[3]) city.primary = true;
        if (extra[4]) city['legacy-slugs'] = extra[4];
      }
      cities.push(city);
    }
    return {
      'province-id': provinceId,
      'province-en': provinceEn,
      'province-fa': provinceFa,
      'phone-code': phoneCode,
      'capital-city-id': capitalId,
      'name-en': nameEn,
      neighbors,
      cities,
    };
  });
}
