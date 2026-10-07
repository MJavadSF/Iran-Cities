import rawData from './data.json';
import type {
  City,
  CityId,
  CityKey,
  Coordinates,
  FlatCity,
  Province,
  ProvinceId,
  ProvinceListItem,
  Query,
  SearchOptions,
} from './types';

interface RawCity {
  'city-id': number;
  'city-en': string;
  'city-fa': string;
  lat?: number;
  lng?: number;
  'coord-confidence'?: 'medium' | 'low';
}
interface RawProvince {
  'province-id': number;
  'province-en': string;
  'province-fa': string;
  'phone-code': string;
  'capital-city-id': number;
  cities: RawCity[];
}

function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\s-]+/g, '');
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

const provinces: Province[] = (rawData as unknown as RawProvince[]).map((p) => {
  const provinceEn = p['province-en'];
  const provinceFa = p['province-fa'];
  return {
    id: p['province-id'],
    en: provinceEn,
    fa: provinceFa,
    phoneCode: p['phone-code'],
    capitalId: p['capital-city-id'],
    cities: p.cities.map((c) => {
      const city: City = {
        id: c['city-id'],
        isCapital: c['city-id'] === p['capital-city-id'],
        en: c['city-en'],
        fa: c['city-fa'],
        slug: `${provinceEn}/${c['city-en']}`,
      };
      if (typeof c.lat === 'number' && typeof c.lng === 'number') {
        city.coordinates = { lat: c.lat, lng: c.lng, confidence: c['coord-confidence'] ?? 'high' };
      }
      return city;
    }),
  };
});

interface SearchEntry<T> {
  item: T;
  normEn: string;
  normFa: string;
}

const flatCities: FlatCity[] = [];

const LEGACY_ALIASES: ReadonlyArray<{ id: CityId; slugs: string[]; names: string[] }> = [
  { id: 402, slugs: ["gilan/sowme'eh-sara"], names: ["sowme'eh-sara", 'صومعه سارا'] },
  { id: 672, slugs: ['kermanshah/هلشی'], names: ['حلاشی'] },
];

const cityBySlug = new Map<CityKey, FlatCity>();
const cityById = new Map<CityId, FlatCity>();
const provinceById = new Map<ProvinceId, Province>();
const provinceByPhoneCode = new Map<string, Province>();
const cityByNormKey = new Map<string, FlatCity>();
const provinceByNormKey = new Map<string, Province>();
const cityToProvinceByNormKey = new Map<string, Province>();
const cityAllByNormKey = new Map<string, FlatCity[]>();
const searchableCities: SearchEntry<FlatCity>[] = [];
const searchableProvinces: SearchEntry<Province>[] = [];

for (const p of provinces) {
  provinceById.set(p.id, p);
  provinceByPhoneCode.set(p.phoneCode, p);
  const pNormEn = normalize(p.en);
  const pNormFa = normalize(p.fa);
  if (!provinceByNormKey.has(pNormEn)) provinceByNormKey.set(pNormEn, p);
  if (!provinceByNormKey.has(pNormFa)) provinceByNormKey.set(pNormFa, p);
  searchableProvinces.push({ item: p, normEn: pNormEn, normFa: pNormFa });

  for (const c of p.cities) {
    const flat: FlatCity = {
      ...c,
      provinceId: p.id,
      provinceEn: p.en,
      provinceFa: p.fa,
      phoneCode: p.phoneCode,
    };
    flatCities.push(flat);
    cityBySlug.set(flat.slug, flat);
    cityById.set(flat.id, flat);

    const cNormEn = normalize(c.en);
    const cNormFa = normalize(c.fa);

    if (!cityByNormKey.has(cNormEn)) cityByNormKey.set(cNormEn, flat);
    if (!cityByNormKey.has(cNormFa)) cityByNormKey.set(cNormFa, flat);
    for (const key of cNormEn === cNormFa ? [cNormEn] : [cNormEn, cNormFa]) {
      const list = cityAllByNormKey.get(key);
      if (list) list.push(flat);
      else cityAllByNormKey.set(key, [flat]);
    }
    if (!cityToProvinceByNormKey.has(cNormEn)) cityToProvinceByNormKey.set(cNormEn, p);
    if (!cityToProvinceByNormKey.has(cNormFa)) cityToProvinceByNormKey.set(cNormFa, p);

    searchableCities.push({ item: flat, normEn: cNormEn, normFa: cNormFa });
  }
}

for (const legacy of LEGACY_ALIASES) {
  const flat = cityById.get(legacy.id);
  if (!flat) continue;
  for (const slug of legacy.slugs) if (!cityBySlug.has(slug)) cityBySlug.set(slug, flat);
  for (const name of legacy.names) {
    const key = normalize(name);
    if (!cityByNormKey.has(key)) cityByNormKey.set(key, flat);
    if (!cityToProvinceByNormKey.has(key)) cityToProvinceByNormKey.set(key, provinceById.get(flat.provinceId) as Province);
    const list = cityAllByNormKey.get(key);
    if (!list) cityAllByNormKey.set(key, [flat]);
    else if (!list.includes(flat)) list.push(flat);
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

function asId(query: Query): number | undefined {
  if (typeof query === 'number') return Number.isInteger(query) ? query : undefined;
  const t = query.trim();
  return /^\d+$/.test(t) ? Number(t) : undefined;
}

export function getProvinces(): Province[] {
  return provinces;
}

export function getProvincesList(): ProvinceListItem[] {
  return provinces.map((p) => ({ id: p.id, en: p.en, fa: p.fa, phoneCode: p.phoneCode, capitalId: p.capitalId }));
}

export function getProvinceById(id: ProvinceId): Province | undefined {
  return provinceById.get(id);
}

export function getProvince(query: Query): Province | undefined {
  const id = asId(query);
  if (id !== undefined) return provinceById.get(id);
  return provinceByNormKey.get(normalize(String(query)));
}

export function getCities(provinceQuery: Query): City[] {
  return getProvince(provinceQuery)?.cities ?? [];
}

export function getAllCities(): FlatCity[] {
  return flatCities;
}

export function getCityById(id: CityId): FlatCity | undefined {
  return cityById.get(id);
}

export function getCityBySlug(slug: CityKey): FlatCity | undefined {
  return cityBySlug.get(slug);
}

export function getCity(cityQuery: Query, provinceQuery?: Query): FlatCity | undefined {
  const cityIdQuery = asId(cityQuery);

  if (provinceQuery !== undefined && provinceQuery !== '') {
    const province = getProvince(provinceQuery);
    if (!province) return undefined;
    const q = cityIdQuery === undefined ? normalize(String(cityQuery)) : '';
    const city = province.cities.find((c) =>
      cityIdQuery !== undefined ? c.id === cityIdQuery : normalize(c.en) === q || normalize(c.fa) === q,
    );
    return city ? cityById.get(city.id) : undefined;
  }

  if (cityIdQuery !== undefined) return cityById.get(cityIdQuery);
  return cityByNormKey.get(normalize(String(cityQuery)));
}

export function getCitiesByName(cityQuery: string): FlatCity[] {
  return cityAllByNormKey.get(normalize(cityQuery)) ?? [];
}

export function getProvinceOfCity(cityQuery: Query): Province | undefined {
  const id = asId(cityQuery);
  if (id !== undefined) {
    const c = cityById.get(id);
    return c ? provinceById.get(c.provinceId) : undefined;
  }
  return cityToProvinceByNormKey.get(normalize(String(cityQuery)));
}

export function getCapital(provinceQuery: Query): FlatCity | undefined {
  const p = getProvince(provinceQuery);
  return p ? cityById.get(p.capitalId) : undefined;
}

export function getCapitals(): FlatCity[] {
  return provinces.map((p) => cityById.get(p.capitalId) as FlatCity);
}

export function getProvinceByPhoneCode(code: string | number): Province | undefined {
  const digits = String(code).trim().replace(/^0+/, '');
  return provinceByPhoneCode.get(`0${digits}`);
}

export function searchProvinces(query: string, options: SearchOptions = {}): Province[] {
  return rankedSearch(searchableProvinces, query, options);
}

export function searchCities(query: string, options: SearchOptions = {}): FlatCity[] {
  return rankedSearch(searchableCities, query, options);
}

export function getStats(): { provinceCount: number; cityCount: number } {
  return {
    provinceCount: provinces.length,
    cityCount: flatCities.length,
  };
}

export type {
  City,
  CityId,
  CityKey,
  Coordinates,
  FlatCity,
  Locale,
  Province,
  ProvinceId,
  ProvinceListItem,
  Query,
  SearchOptions,
} from './types';
