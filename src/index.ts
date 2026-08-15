import rawData from './data.json';
import type { City, CityKey, FlatCity, Province, SearchOptions } from './types';

// شکل خام JSON از کلیدهای kebab-case (province-en/city-fa و ...) استفاده می‌کند؛
// اینجا آن را به ساختار تمیز {en, fa, slug} تبدیل می‌کنیم.
interface RawCity {
  'city-en': string;
  'city-fa': string;
}
interface RawProvince {
  'province-en': string;
  'province-fa': string;
  cities: RawCity[];
}

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

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  let prev = new Array<number>(bl + 1);
  for (let j = 0; j <= bl; j++) prev[j] = j;

  for (let i = 1; i <= al; i++) {
    const curr = new Array<number>(bl + 1);
    curr[0] = i;
    for (let j = 1; j <= bl; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[bl];
}

/** امتیاز تطابق: هرچه کمتر بهتر. Infinity یعنی بدون تطابق. */
function matchScore(query: string, target: string, fuzzy: boolean, maxDistance: number): number {
  if (!target) return Infinity;
  if (target === query) return 0;
  if (target.startsWith(query)) return 1;
  if (target.includes(query)) return 2;
  if (fuzzy) {
    const dist = levenshtein(query, target);
    if (dist <= maxDistance) return 3 + dist;
  }
  return Infinity;
}

// ---- ساخت داده و ایندکس‌ها (یک‌بار، در زمان import) ----

const provinces: Province[] = (rawData as unknown as RawProvince[]).map((p) => {
  const provinceEn = p['province-en'];
  const provinceFa = p['province-fa'];
  return {
    en: provinceEn,
    fa: provinceFa,
    cities: p.cities.map((c) => ({
      en: c['city-en'],
      fa: c['city-fa'],
      slug: `${provinceEn}/${c['city-en']}`,
    })),
  };
});

interface SearchEntry<T> {
  item: T;
  normEn: string;
  normFa: string;
}

const flatCities: FlatCity[] = [];
const cityBySlug = new Map<CityKey, FlatCity>();
const cityByNormKey = new Map<string, FlatCity>();
const provinceByNormKey = new Map<string, Province>();
const cityToProvinceByNormKey = new Map<string, Province>();
const searchableCities: SearchEntry<FlatCity>[] = [];
const searchableProvinces: SearchEntry<Province>[] = [];

for (const p of provinces) {
  const pNormEn = normalize(p.en);
  const pNormFa = normalize(p.fa);
  if (!provinceByNormKey.has(pNormEn)) provinceByNormKey.set(pNormEn, p);
  if (!provinceByNormKey.has(pNormFa)) provinceByNormKey.set(pNormFa, p);
  searchableProvinces.push({ item: p, normEn: pNormEn, normFa: pNormFa });

  for (const c of p.cities) {
    const flat: FlatCity = { en: c.en, fa: c.fa, slug: c.slug, provinceEn: p.en, provinceFa: p.fa };
    flatCities.push(flat);
    cityBySlug.set(flat.slug, flat);

    const cNormEn = normalize(c.en);
    const cNormFa = normalize(c.fa);
    // در صورت هم‌نامی بین استان‌های مختلف، اولین مورد (طبق ترتیب داده) برنده می‌شود
    // تا رفتار مشابه نسخه‌ی قبلی (Array.find) حفظ شود.
    if (!cityByNormKey.has(cNormEn)) cityByNormKey.set(cNormEn, flat);
    if (!cityByNormKey.has(cNormFa)) cityByNormKey.set(cNormFa, flat);
    if (!cityToProvinceByNormKey.has(cNormEn)) cityToProvinceByNormKey.set(cNormEn, p);
    if (!cityToProvinceByNormKey.has(cNormFa)) cityToProvinceByNormKey.set(cNormFa, p);

    searchableCities.push({ item: flat, normEn: cNormEn, normFa: cNormFa });
  }
}

function rankedSearch<T>(
  pool: SearchEntry<T>[],
  query: string,
  options: SearchOptions,
): T[] {
  const q = normalize(query);
  if (!q) {
    const all = pool.map((e) => e.item);
    return options.limit ? all.slice(0, options.limit) : all;
  }

  const locale = options.locale ?? 'both';
  const fuzzy = options.fuzzy ?? false;
  const maxDistance = options.maxDistance ?? 2;

  const scored: { item: T; score: number }[] = [];
  for (const entry of pool) {
    let score = Infinity;
    if (locale !== 'fa') score = Math.min(score, matchScore(q, entry.normEn, fuzzy, maxDistance));
    if (locale !== 'en') score = Math.min(score, matchScore(q, entry.normFa, fuzzy, maxDistance));
    if (score !== Infinity) scored.push({ item: entry.item, score });
  }

  scored.sort((a, b) => a.score - b.score);
  const results = scored.map((s) => s.item);
  return options.limit ? results.slice(0, options.limit) : results;
}

// ---- API عمومی ----

/** لیست کامل استان‌ها به همراه شهرهای هرکدام */
export function getProvinces(): Province[] {
  return provinces;
}

/** لیست استان‌ها بدون آرایه‌ی شهرها (سبک‌تر، برای Select/Dropdown) */
export function getProvincesList(): { en: string; fa: string }[] {
  return provinces.map((p) => ({ en: p.en, fa: p.fa }));
}

/** پیدا کردن یک استان با شناسه انگلیسی یا نام فارسی (دقیق، نرمال‌شده) - O(1) */
export function getProvince(query: string): Province | undefined {
  return provinceByNormKey.get(normalize(query));
}

/** لیست شهرهای یک استان بر اساس شناسه انگلیسی یا نام فارسی استان */
export function getCities(provinceQuery: string): City[] {
  return getProvince(provinceQuery)?.cities ?? [];
}

/** لیست تمام شهرهای کشور به صورت مسطح، همراه با اطلاعات استان مربوطه */
export function getAllCities(): FlatCity[] {
  return flatCities;
}

/**
 * پیدا کردن یک شهر با شناسه‌ی یکتای سراسری آن (City.slug، به‌فرم `provinceEn/cityEn`) - O(1)
 * برای پکیج‌های وابسته که داده‌ی اضافه (کد تلفن، پلاک، پیش‌شماره کد ملی و ...) را بر اساس
 * این کلید نگه می‌دارند، مسیر پیشنهادی همین تابع است چون بدون ابهامِ هم‌نامی کار می‌کند.
 */
export function getCityBySlug(slug: CityKey): FlatCity | undefined {
  return cityBySlug.get(slug);
}

/** پیدا کردن یک شهر با شناسه انگلیسی یا نام فارسی (اختیاری: محدود به یک استان خاص) - O(1) / O(اندازه استان) */
export function getCity(cityQuery: string, provinceQuery?: string): FlatCity | undefined {
  const q = normalize(cityQuery);

  if (provinceQuery) {
    const province = getProvince(provinceQuery);
    if (!province) return undefined;
    const city = province.cities.find((c) => normalize(c.en) === q || normalize(c.fa) === q);
    return city
      ? { en: city.en, fa: city.fa, slug: city.slug, provinceEn: province.en, provinceFa: province.fa }
      : undefined;
  }

  return cityByNormKey.get(q);
}

/** استانی که یک شهر مشخص در آن قرار دارد را برمی‌گرداند - O(1) */
export function getProvinceOfCity(cityQuery: string): Province | undefined {
  return cityToProvinceByNormKey.get(normalize(cityQuery));
}

/**
 * جستجوی رتبه‌بندی‌شده در بین استان‌ها بر اساس بخشی از نام.
 * ترتیب نتایج: تطابق دقیق > شروع‌شونده‌با > شامل‌شونده > (در حالت fuzzy) نزدیک از نظر فاصله‌ی ادیت.
 */
export function searchProvinces(query: string, options: SearchOptions = {}): Province[] {
  return rankedSearch(searchableProvinces, query, options);
}

/**
 * جستجوی رتبه‌بندی‌شده در بین تمام شهرهای کشور بر اساس بخشی از نام.
 * ترتیب نتایج: تطابق دقیق > شروع‌شونده‌با > شامل‌شونده > (در حالت fuzzy) نزدیک از نظر فاصله‌ی ادیت.
 * برای تحمل غلط تایپی، `{ fuzzy: true }` را در options پاس بده.
 */
export function searchCities(query: string, options: SearchOptions = {}): FlatCity[] {
  return rankedSearch(searchableCities, query, options);
}

/** آمار کلی: تعداد استان‌ها و تعداد کل شهرها */
export function getStats(): { provinceCount: number; cityCount: number } {
  return {
    provinceCount: provinces.length,
    cityCount: flatCities.length,
  };
}

export type { City, CityKey, FlatCity, Locale, Province, SearchOptions } from './types';
