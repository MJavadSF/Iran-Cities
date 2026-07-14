import rawData from './data.json';
import type { City, FlatCity, Locale, Province, SearchOptions } from './types';

// شکل خام JSON از کلیدهای kebab-case (province-en/city-fa و ...) استفاده می‌کند؛
// اینجا آن را به ساختار تمیز {en, fa} تبدیل می‌کنیم.
interface RawCity {
  'city-en': string;
  'city-fa': string;
}
interface RawProvince {
  'province-en': string;
  'province-fa': string;
  cities: RawCity[];
}

const provinces: Province[] = (rawData as unknown as RawProvince[]).map((p) => ({
  en: p['province-en'],
  fa: p['province-fa'],
  cities: p.cities.map((c) => ({ en: c['city-en'], fa: c['city-fa'] })),
}));

/**
 * نرمال‌سازی متن فارسی/انگلیسی برای جستجوی مقاوم در برابر:
 * - تفاوت «ی»/«ي» عربی و «ک»/«ك» عربی
 * - نیم‌فاصله و فاصله‌های اضافه
 * - خط‌تیره در شناسه‌های انگلیسی (kebab-case)
 * - بزرگی/کوچکی حروف انگلیسی
 */
function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\s-]+/g, ''); // نیم‌فاصله، فاصله، خط‌تیره
}

let _flatCache: FlatCity[] | null = null;

function getFlatCitiesInternal(): FlatCity[] {
  if (_flatCache) return _flatCache;
  const flat: FlatCity[] = [];
  for (const p of provinces) {
    for (const c of p.cities) {
      flat.push({ en: c.en, fa: c.fa, provinceEn: p.en, provinceFa: p.fa });
    }
  }
  _flatCache = flat;
  return flat;
}

/** لیست کامل استان‌ها به همراه شهرهای هرکدام */
export function getProvinces(): Province[] {
  return provinces;
}

/** لیست استان‌ها بدون آرایه‌ی شهرها (سبک‌تر، برای Select/Dropdown) */
export function getProvincesList(): { en: string; fa: string }[] {
  return provinces.map((p) => ({ en: p.en, fa: p.fa }));
}

/** پیدا کردن یک استان با شناسه انگلیسی یا نام فارسی (دقیق، نرمال‌شده) */
export function getProvince(query: string): Province | undefined {
  const q = normalize(query);
  return provinces.find((p) => normalize(p.en) === q || normalize(p.fa) === q);
}

/** لیست شهرهای یک استان بر اساس شناسه انگلیسی یا نام فارسی استان */
export function getCities(provinceQuery: string): City[] {
  const province = getProvince(provinceQuery);
  return province ? province.cities : [];
}

/** لیست تمام شهرهای کشور به صورت مسطح، همراه با اطلاعات استان مربوطه */
export function getAllCities(): FlatCity[] {
  return getFlatCitiesInternal();
}

/** پیدا کردن یک شهر با شناسه انگلیسی یا نام فارسی (اختیاری: محدود به یک استان خاص) */
export function getCity(cityQuery: string, provinceQuery?: string): FlatCity | undefined {
  const q = normalize(cityQuery);
  const pool = provinceQuery ? getCities(provinceQuery).map((c) => ({
    ...c,
    provinceEn: getProvince(provinceQuery)?.en ?? '',
    provinceFa: getProvince(provinceQuery)?.fa ?? '',
  })) : getFlatCitiesInternal();

  return pool.find((c) => normalize(c.en) === q || normalize(c.fa) === q);
}

/** استانی که یک شهر مشخص در آن قرار دارد را برمی‌گرداند */
export function getProvinceOfCity(cityQuery: string): Province | undefined {
  const q = normalize(cityQuery);
  return provinces.find((p) => p.cities.some((c) => normalize(c.en) === q || normalize(c.fa) === q));
}

/** جستجوی fuzzy (شامل‌شونده) در بین استان‌ها بر اساس بخشی از نام */
export function searchProvinces(query: string, options: SearchOptions = {}): Province[] {
  const q = normalize(query);
  if (!q) return options.limit ? provinces.slice(0, options.limit) : provinces;

  const locale = options.locale ?? 'both';
  const results = provinces.filter((p) => {
    const matchEn = locale !== 'fa' && normalize(p.en).includes(q);
    const matchFa = locale !== 'en' && normalize(p.fa).includes(q);
    return matchEn || matchFa;
  });

  return options.limit ? results.slice(0, options.limit) : results;
}

/** جستجوی fuzzy (شامل‌شونده) در بین تمام شهرهای کشور بر اساس بخشی از نام */
export function searchCities(query: string, options: SearchOptions = {}): FlatCity[] {
  const q = normalize(query);
  const all = getFlatCitiesInternal();
  if (!q) return options.limit ? all.slice(0, options.limit) : all;

  const locale = options.locale ?? 'both';
  const results = all.filter((c) => {
    const matchEn = locale !== 'fa' && normalize(c.en).includes(q);
    const matchFa = locale !== 'en' && normalize(c.fa).includes(q);
    return matchEn || matchFa;
  });

  return options.limit ? results.slice(0, options.limit) : results;
}

/** آمار کلی: تعداد استان‌ها و تعداد کل شهرها */
export function getStats(): { provinceCount: number; cityCount: number } {
  return {
    provinceCount: provinces.length,
    cityCount: getFlatCitiesInternal().length,
  };
}

export type { City, FlatCity, Locale, Province, SearchOptions } from './types';
