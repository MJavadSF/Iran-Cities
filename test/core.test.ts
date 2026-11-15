import { describe, expect, it } from 'vitest';
import {
  getAllCities,
  getCapital,
  getCapitals,
  getCities,
  getCitiesByName,
  getCity,
  getCityById,
  getCityBySlug,
  getProvince,
  getProvinceByPhoneCode,
  getProvinceOfCity,
  getProvinces,
  getProvincesList,
  getStats,
  isAmbiguousCityName,
  normalize,
  searchCities,
  searchProvinces,
} from '../src/index';

describe('normalize', () => {
  it('unifies Arabic and Persian letter variants', () => {
    expect(normalize('علي')).toBe(normalize('علی'));
    expect(normalize('كرج')).toBe(normalize('کرج'));
    expect(normalize('آبادان')).toBe(normalize('ابادان'));
    expect(normalize('أراك')).toBe(normalize('اراک'));
    expect(normalize('خانۀ')).toBe(normalize('خانه'));
    expect(normalize('مؤمن')).toBe(normalize('مومن'));
  });

  it('removes diacritics, tatweel, spaces and ZWNJ', () => {
    expect(normalize('تـهـران')).toBe('تهران');
    expect(normalize('تَهران')).toBe('تهران');
    expect(normalize('خرم‌آباد')).toBe(normalize('خرم آباد'));
    expect(normalize(' Bandar-Abbas ')).toBe('bandarabbas');
  });

  it('converts Persian and Arabic digits', () => {
    expect(normalize('۰۲۱')).toBe('021');
    expect(normalize('٠٢١')).toBe('021');
  });
});

describe('lookups', () => {
  it('has the expected counts', () => {
    expect(getStats()).toEqual({ provinceCount: 31, cityCount: 1252 });
    expect(getAllCities()).toHaveLength(1252);
    expect(getProvincesList()).toHaveLength(31);
  });

  it('finds provinces by id, English, Persian and Persian digits', () => {
    expect(getProvince('tehran')?.id).toBe(28);
    expect(getProvince('تهران')?.id).toBe(28);
    expect(getProvince(28)?.en).toBe('tehran');
    expect(getProvince('28')?.en).toBe('tehran');
    expect(getProvince('۲۸')?.en).toBe('tehran');
    expect(getProvince('nowhere')).toBeUndefined();
  });

  it('finds cities with letter variants', () => {
    expect(getCity('ابادان')?.en).toBe('abadan');
    expect(getCity('شيراز')?.en).toBe('shiraz');
    expect(getCity('شیراز', 'fars')?.id).toBe(292);
    expect(getCity('شیراز', 'tehran')).toBeUndefined();
    expect(getCity(292)?.en).toBe('shiraz');
  });

  it('resolves aliases and legacy slugs', () => {
    expect(getCity('esfahan')?.id).toBe(185);
    expect(getCity('طهران')?.id).toBe(1126);
    expect(getCity('حلاشی')?.id).toBe(672);
    expect(getCity("sowme'eh-sara", 'gilan')?.id).toBe(402);
    expect(getCityBySlug("gilan/sowme'eh-sara")?.id).toBe(402);
    expect(getCityBySlug('kermanshah/هلشی')?.id).toBe(672);
    expect(getCityById(402)?.aliases).toContain('صومعه سارا');
  });

  it('prefers capitals, then primary cities, for ambiguous names', () => {
    expect(isAmbiguousCityName('مهاباد')).toBe(true);
    expect(isAmbiguousCityName('شیراز')).toBe(false);
    expect(getCitiesByName('mahabad')).toHaveLength(2);
    expect(getCity('mahabad')?.provinceEn).toBe('west-azerbaijan');
    expect(getCity('خرم آباد')?.provinceEn).toBe('lorestan');
    expect(getCity('شهریار')?.provinceEn).toBe('tehran');
    expect(getProvinceOfCity('مهاباد')?.en).toBe('west-azerbaijan');
  });

  it('finds provinces by phone code in several formats', () => {
    expect(getProvinceByPhoneCode('021')?.en).toBe('tehran');
    expect(getProvinceByPhoneCode(21)?.en).toBe('tehran');
    expect(getProvinceByPhoneCode('۰۲۱')?.en).toBe('tehran');
    expect(getProvinceByPhoneCode('+9821')?.en).toBe('tehran');
    expect(getProvinceByPhoneCode('0098 21')?.en).toBe('tehran');
    expect(getProvinceByPhoneCode('+98021')?.en).toBe('tehran');
    expect(getProvinceByPhoneCode('98')).toBeUndefined();
    expect(getProvinceByPhoneCode('abc')).toBeUndefined();
  });

  it('returns capitals', () => {
    expect(getCapital('khuzestan')?.en).toBe('ahvaz');
    expect(getCapitals()).toHaveLength(31);
    expect(getCapitals().every((c) => c.isCapital && c.coordinates)).toBe(true);
  });
});

describe('immutability', () => {
  it('freezes returned data', () => {
    const provinces = getProvinces();
    expect(Object.isFrozen(provinces)).toBe(true);
    expect(Object.isFrozen(provinces[0]!.cities)).toBe(true);
    expect(Object.isFrozen(provinces[0]!.cities[0])).toBe(true);
    expect(Object.isFrozen(getAllCities()[0]!.coordinates)).toBe(true);
    expect(() => {
      (provinces[0]!.cities as unknown as unknown[]).length = 0;
    }).toThrow(TypeError);
    expect(getCities(1).length).toBeGreaterThan(0);
  });
});

describe('search', () => {
  it('handles empty queries according to emptyQuery', () => {
    expect(searchCities('')).toHaveLength(1252);
    expect(searchCities('', { emptyQuery: 'none' })).toEqual([]);
    expect(searchCities('  ', { emptyQuery: 'none', limit: 5 })).toEqual([]);
    expect(searchCities('', { limit: 5 })).toHaveLength(5);
  });

  it('ranks exact, then prefix, then substring matches', () => {
    const results = searchCities('کرمان');
    expect(results[0]!.en).toBe('kerman');
    expect(results[1]!.en).toBe('kermanshah');
  });

  it('puts capitals first among equal scores', () => {
    const results = searchCities('آباد');
    const firstSubstring = results.findIndex((c) => normalize(c.fa) !== 'اباد' && !normalize(c.fa).startsWith('اباد'));
    expect(results[firstSubstring]!.isCapital).toBe(true);
  });

  it('respects locale', () => {
    expect(searchCities('shiraz', { locale: 'fa' })).toEqual([]);
    expect(searchCities('shiraz', { locale: 'en' })[0]!.en).toBe('shiraz');
  });

  it('supports fuzzy search on full names and prefixes', () => {
    expect(searchCities('تهرن', { fuzzy: true })[0]!.en).toBe('tehran');
    expect(searchCities('shiraaz', { fuzzy: true })[0]!.en).toBe('shiraz');
    expect(searchCities('کرمانشا', { fuzzy: false })[0]!.en).toBe('kermanshah');
    expect(searchCities('کرمنشاه', { fuzzy: true }).map((c) => c.en)).toContain('kermanshah');
    expect(searchCities('xqzw', { fuzzy: true, maxDistance: 1 })).toEqual([]);
  });

  it('searches provinces', () => {
    expect(searchProvinces('آذربایجان').map((p) => p.en)).toEqual(['east-azerbaijan', 'west-azerbaijan']);
    expect(searchProvinces('khorasan', { limit: 2 })).toHaveLength(2);
  });
});

describe('v1 compatibility', () => {
  it('keeps stable identities where v1 had them', () => {
    expect(getProvinces()).toBe(getProvinces());
    expect(getAllCities()).toBe(getAllCities());
    expect(getCities('fars')).toBe(getCities('fars'));
  });

  it('returns fresh mutable arrays where v1 did', () => {
    const list = getProvincesList();
    expect(list).not.toBe(getProvincesList());
    expect(() => list.sort((a, b) => b.id - a.id)).not.toThrow();
    expect(() => {
      list[0]!.fa = 'x';
    }).not.toThrow();
    expect(getProvincesList()[0]!.fa).toBe('البرز');
    const capitals = getCapitals();
    expect(() => capitals.reverse()).not.toThrow();
    expect(getCapitals()[0]!.en).toBe('karaj');
    const results = searchCities('شهر');
    expect(() => results.splice(0, 1)).not.toThrow();
  });

  it('tolerates invalid input from JavaScript callers', () => {
    const anyGetCity = getCity as unknown as (...args: unknown[]) => unknown;
    const anySearch = searchCities as unknown as (...args: unknown[]) => unknown[];
    expect(anyGetCity(undefined)).toBeUndefined();
    expect(anyGetCity(null)).toBeUndefined();
    expect(anyGetCity('shiraz', null)?.constructor).toBe(Object);
    expect(anySearch(undefined, { emptyQuery: 'none' })).toEqual([]);
    expect(anySearch(null)).toHaveLength(1252);
    expect(getCity(Number.NaN)).toBeUndefined();
    expect(getProvince('')).toBeUndefined();
    expect(getCitiesByName('')).toEqual([]);
    expect(searchCities('شیراز', { limit: -3 })[0]!.en).toBe('shiraz');
  });
});
