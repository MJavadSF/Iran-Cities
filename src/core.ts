import { convertKeyboardLayout, guessKeyboardTarget } from './keyboard';
import { normalize } from './normalize';
import type {
  City,
  CityId,
  CityKey,
  FlatCity,
  IranCities,
  Province,
  ProvinceId,
  ProvinceListItem,
  Query,
  SearchOptions,
  Stats,
} from './types';

export interface RawCity {
  'city-id': number;
  'city-en': string;
  'city-fa': string;
  'name-en'?: string;
  lat?: number;
  lng?: number;
  'coord-confidence'?: 'medium' | 'low';
  aliases?: string[];
  'legacy-slugs'?: string[];
  primary?: boolean;
}

export interface RawProvince {
  'province-id': number;
  'province-en': string;
  'province-fa': string;
  'phone-code': string;
  'capital-city-id': number;
  'name-en': string;
  neighbors: number[];
  cities: RawCity[];
}

interface SearchKey {
  value: string;
  locale: 'en' | 'fa';
}

interface SearchEntry<T> {
  item: T;
  keys: SearchKey[];
  isCapital: boolean;
  rank: number;
}

const LATIN = /[a-z]/;

const LOWERCASE_WORDS = new Set(['va', 'and', 'o']);

export function displayNameFromSlug(slug: string): string {
  const parts = slug.split('-').filter(Boolean);
  let out = '';
  for (const part of parts) {
    if ((part === 'e' || part === 'ye') && out) {
      out += `-${part}`;
      continue;
    }
    const word = LOWERCASE_WORDS.has(part) && out ? part : part.charAt(0).toUpperCase() + part.slice(1);
    out += out ? ` ${word}` : word;
  }
  return out;
}

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function isPresent(value: Query | null | undefined): value is Query {
  return value !== undefined && value !== null && toText(value).trim() !== '';
}

function boundedLevenshtein(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev: number[] = [];
  for (let j = 0; j <= b.length; j++) prev.push(j);

  for (let i = 1; i <= a.length; i++) {
    const curr: number[] = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      const value = Math.min((prev[j] as number) + 1, (curr[j - 1] as number) + 1, (prev[j - 1] as number) + cost);
      curr.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length] as number;
}

function matchScore(query: string, target: string, fuzzy: boolean, maxDistance: number): number {
  if (!target) return Infinity;
  if (target === query) return 0;
  if (target.startsWith(query)) return 1;
  if (target.includes(query)) return 2;
  if (!fuzzy) return Infinity;

  let best = Infinity;
  const full = boundedLevenshtein(query, target, maxDistance);
  if (full <= maxDistance) best = 3 + full;

  if (query.length >= 3 && target.length > query.length) {
    for (const len of [query.length - 1, query.length, query.length + 1]) {
      if (len < 1 || len >= target.length) continue;
      const prefix = boundedLevenshtein(query, target.slice(0, len), maxDistance);
      if (prefix <= maxDistance) best = Math.min(best, 3.5 + prefix);
    }
  }
  return best;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as object)) deepFreeze((value as Record<string, unknown>)[key]);
  }
  return value;
}

function createCollator(): (a: string, b: string) => number {
  try {
    return new Intl.Collator('fa').compare;
  } catch {
    return (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  }
}

function pickPreferred(list: FlatCity[], primaryIds: Set<CityId>): FlatCity {
  return (
    list.find((c) => c.isCapital) ??
    list.find((c) => primaryIds.has(c.id)) ??
    list.reduce((a, b) => (b.id < a.id ? b : a))
  );
}

function pushTo<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key);
  if (!list) map.set(key, [value]);
  else if (!list.includes(value)) list.push(value);
}

function cityKeys(city: City): SearchKey[] {
  const keys: SearchKey[] = [
    { value: normalize(city.en), locale: 'en' },
    { value: normalize(city.fa), locale: 'fa' },
  ];
  for (const alias of city.aliases) {
    keys.push({ value: normalize(alias), locale: LATIN.test(alias.toLowerCase()) ? 'en' : 'fa' });
  }
  return keys;
}

export function createApi(rawData: readonly RawProvince[]): IranCities {
  const compare = createCollator();
  const primaryIds = new Set<CityId>();
  const legacySlugs: Array<[CityKey, CityId]> = [];

  const provinces: Province[] = rawData.map((p) => {
    const provinceEn = p['province-en'];
    return {
      id: p['province-id'],
      en: provinceEn,
      fa: p['province-fa'],
      nameEn: p['name-en'],
      phoneCode: p['phone-code'],
      capitalId: p['capital-city-id'],
      neighborIds: [...p.neighbors],
      cities: p.cities.map((c) => {
        if (c.primary) primaryIds.add(c['city-id']);
        for (const slug of c['legacy-slugs'] ?? []) legacySlugs.push([slug, c['city-id']]);
        const city: { -readonly [K in keyof City]: City[K] } = {
          id: c['city-id'],
          isCapital: c['city-id'] === p['capital-city-id'],
          en: c['city-en'],
          fa: c['city-fa'],
          nameEn: c['name-en'] ?? displayNameFromSlug(c['city-en']),
          slug: `${provinceEn}/${c['city-en']}`,
          aliases: c.aliases ? [...c.aliases] : [],
        };
        if (typeof c.lat === 'number' && typeof c.lng === 'number') {
          city.coordinates = { lat: c.lat, lng: c.lng, confidence: c['coord-confidence'] ?? 'high' };
        }
        return city;
      }),
    };
  });

  const flatCities: FlatCity[] = [];
  const cityBySlug = new Map<CityKey, FlatCity>();
  const cityById = new Map<CityId, FlatCity>();
  const provinceById = new Map<ProvinceId, Province>();
  const provinceByPhoneCode = new Map<string, Province>();
  const provinceByNormKey = new Map<string, Province>();
  const citiesByNormKey = new Map<string, FlatCity[]>();
  const searchableCities: SearchEntry<FlatCity>[] = [];
  const searchableProvinces: SearchEntry<Province>[] = [];

  for (const p of provinces) {
    provinceById.set(p.id, p);
    provinceByPhoneCode.set(p.phoneCode, p);
    const pKeys: SearchKey[] = [
      { value: normalize(p.en), locale: 'en' },
      { value: normalize(p.fa), locale: 'fa' },
    ];
    for (const k of pKeys) if (!provinceByNormKey.has(k.value)) provinceByNormKey.set(k.value, p);
    searchableProvinces.push({ item: p, keys: pKeys, isCapital: false, rank: 0 });

    for (const c of p.cities) {
      const flat: FlatCity = {
        ...c,
        provinceId: p.id,
        provinceEn: p.en,
        provinceFa: p.fa,
        provinceNameEn: p.nameEn,
        phoneCode: p.phoneCode,
      };
      flatCities.push(flat);
      cityBySlug.set(flat.slug, flat);
      cityById.set(flat.id, flat);
      const keys = cityKeys(flat);
      for (const k of keys) pushTo(citiesByNormKey, k.value, flat);
      searchableCities.push({ item: flat, keys, isCapital: flat.isCapital, rank: 0 });
    }
  }

  for (const [slug, id] of legacySlugs) {
    const flat = cityById.get(id);
    if (flat && !cityBySlug.has(slug)) cityBySlug.set(slug, flat);
  }

  const cityByNormKey = new Map<string, FlatCity>();
  for (const [key, list] of citiesByNormKey) {
    list.sort((a, b) => a.id - b.id);
    cityByNormKey.set(key, pickPreferred(list, primaryIds));
  }

  [...searchableCities]
    .sort((a, b) => compare(a.item.fa, b.item.fa) || a.item.id - b.item.id)
    .forEach((entry, index) => {
      entry.rank = index;
    });
  [...searchableProvinces]
    .sort((a, b) => compare(a.item.fa, b.item.fa) || a.item.id - b.item.id)
    .forEach((entry, index) => {
      entry.rank = index;
    });

  const capitals: FlatCity[] = provinces.map((p) => cityById.get(p.capitalId) as FlatCity);
  const stats: Stats = { provinceCount: provinces.length, cityCount: flatCities.length };

  deepFreeze(provinces);
  deepFreeze(flatCities);
  deepFreeze(capitals);
  deepFreeze(stats);
  for (const list of citiesByNormKey.values()) Object.freeze(list);

  const emptyCities: readonly FlatCity[] = Object.freeze([]);
  const emptyCityList: readonly City[] = Object.freeze([]);

  function rankedSearch<T>(pool: SearchEntry<T>[], query: unknown, options: SearchOptions | undefined): T[] {
    const opts = options ?? {};
    const text = toText(query);
    const q = normalize(text);
    const target = opts.keyboardFix === false || !q ? undefined : guessKeyboardTarget(text);
    const converted = target ? normalize(convertKeyboardLayout(text, target)) : '';
    if (!converted || converted === q) return rankedSearchOnce(pool, q, opts);

    const convertedOptions: SearchOptions = { ...opts, locale: target, emptyQuery: 'none' };
    const strictOptions: SearchOptions = { ...opts, fuzzy: false, limit: 1 };
    if (rankedSearchOnce(pool, q, strictOptions).length > 0) return rankedSearchOnce(pool, q, opts);
    if (rankedSearchOnce(pool, converted, { ...convertedOptions, fuzzy: false, limit: 1 }).length > 0) {
      return rankedSearchOnce(pool, converted, convertedOptions);
    }
    const fuzzyResults = rankedSearchOnce(pool, q, opts);
    return fuzzyResults.length > 0 ? fuzzyResults : rankedSearchOnce(pool, converted, convertedOptions);
  }

  function rankedSearchOnce<T>(pool: SearchEntry<T>[], q: string, opts: SearchOptions): T[] {
    const limit = typeof opts.limit === 'number' && opts.limit > 0 ? Math.floor(opts.limit) : undefined;
    if (!q) {
      if (opts.emptyQuery === 'none') return [];
      const all = pool.map((e) => e.item);
      return limit ? all.slice(0, limit) : all;
    }

    const locale = opts.locale ?? 'both';
    const fuzzy = opts.fuzzy ?? false;
    const requested =
      typeof opts.maxDistance === 'number' && opts.maxDistance >= 0 ? Math.floor(opts.maxDistance) : 2;
    const maxDistance = Math.min(requested, Math.floor(q.length / 3));

    const scored: { entry: SearchEntry<T>; score: number }[] = [];
    for (const entry of pool) {
      let score = Infinity;
      for (const key of entry.keys) {
        if (locale !== 'both' && key.locale !== locale) continue;
        score = Math.min(score, matchScore(q, key.value, fuzzy, maxDistance));
        if (score === 0) break;
      }
      if (score !== Infinity) scored.push({ entry, score });
    }

    scored.sort(
      (a, b) =>
        a.score - b.score ||
        Number(b.entry.isCapital) - Number(a.entry.isCapital) ||
        a.entry.rank - b.entry.rank,
    );
    const results = scored.map((s) => s.entry.item);
    return limit ? results.slice(0, limit) : results;
  }

  function asId(query: Query): number | undefined {
    if (typeof query === 'number') return Number.isInteger(query) ? query : undefined;
    const t = normalize(toText(query));
    return /^\d+$/.test(t) ? Number(t) : undefined;
  }

  function cityMatches(city: City, key: string): boolean {
    return normalize(city.en) === key || normalize(city.fa) === key || city.aliases.some((a) => normalize(a) === key);
  }

  function getProvinces(): readonly Province[] {
    return provinces;
  }

  function getProvincesList(): ProvinceListItem[] {
    return provinces.map((p) => ({
      id: p.id,
      en: p.en,
      fa: p.fa,
      nameEn: p.nameEn,
      phoneCode: p.phoneCode,
      capitalId: p.capitalId,
    }));
  }

  function getProvinceById(id: ProvinceId): Province | undefined {
    return provinceById.get(Number(id));
  }

  function getProvince(query: Query): Province | undefined {
    if (!isPresent(query)) return undefined;
    const id = asId(query);
    if (id !== undefined) return provinceById.get(id);
    return provinceByNormKey.get(normalize(toText(query)));
  }

  function getCities(provinceQuery: Query): readonly City[] {
    return getProvince(provinceQuery)?.cities ?? emptyCityList;
  }

  function getAllCities(): readonly FlatCity[] {
    return flatCities;
  }

  function getCityById(id: CityId): FlatCity | undefined {
    return cityById.get(Number(id));
  }

  function getCityBySlug(slug: CityKey): FlatCity | undefined {
    return cityBySlug.get(toText(slug).trim());
  }

  function getCity(cityQuery: Query, provinceQuery?: Query): FlatCity | undefined {
    if (!isPresent(cityQuery)) return undefined;
    const cityId = asId(cityQuery);

    if (isPresent(provinceQuery)) {
      const province = getProvince(provinceQuery);
      if (!province) return undefined;
      const key = cityId === undefined ? normalize(toText(cityQuery)) : '';
      const city = province.cities.find((c) => (cityId !== undefined ? c.id === cityId : cityMatches(c, key)));
      return city ? cityById.get(city.id) : undefined;
    }

    if (cityId !== undefined) return cityById.get(cityId);
    return cityByNormKey.get(normalize(toText(cityQuery)));
  }

  function getCitiesByName(cityQuery: string): readonly FlatCity[] {
    const key = normalize(toText(cityQuery));
    return (key && citiesByNormKey.get(key)) || emptyCities;
  }

  function isAmbiguousCityName(cityQuery: string): boolean {
    return getCitiesByName(cityQuery).length > 1;
  }

  function getProvinceOfCity(cityQuery: Query): Province | undefined {
    const city = getCity(cityQuery);
    return city ? provinceById.get(city.provinceId) : undefined;
  }

  function getCapital(provinceQuery: Query): FlatCity | undefined {
    const p = getProvince(provinceQuery);
    return p ? cityById.get(p.capitalId) : undefined;
  }

  function getCapitals(): FlatCity[] {
    return capitals.slice();
  }

  function getProvinceByPhoneCode(code: string | number): Province | undefined {
    let digits = normalize(toText(code)).replace(/^\+/, '').replace(/^0+/, '');
    if (digits.length > 2 && digits.startsWith('98')) digits = digits.slice(2).replace(/^0+/, '');
    if (!/^\d+$/.test(digits)) return undefined;
    return provinceByPhoneCode.get(`0${digits}`);
  }

  function searchProvinces(query: string, options?: SearchOptions): Province[] {
    return rankedSearch(searchableProvinces, query, options);
  }

  function searchCities(query: string, options?: SearchOptions): FlatCity[] {
    return rankedSearch(searchableCities, query, options);
  }

  function getNeighborProvinces(provinceQuery: Query): Province[] {
    const province = getProvince(provinceQuery);
    if (!province) return [];
    return province.neighborIds.map((id) => provinceById.get(id) as Province);
  }

  function areNeighborProvinces(a: Query, b: Query): boolean {
    const first = getProvince(a);
    const second = getProvince(b);
    return !!first && !!second && first.neighborIds.includes(second.id);
  }

  function getStats(): Stats {
    return stats;
  }

  return {
    getProvinces,
    getProvincesList,
    getProvinceById,
    getProvince,
    getCities,
    getAllCities,
    getCityById,
    getCityBySlug,
    getCity,
    getCitiesByName,
    isAmbiguousCityName,
    getProvinceOfCity,
    getCapital,
    getCapitals,
    getProvinceByPhoneCode,
    searchProvinces,
    searchCities,
    getNeighborProvinces,
    areNeighborProvinces,
    getStats,
  };
}

