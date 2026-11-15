import { describe, expect, it } from 'vitest';
import { getProvinceAt, getProvinceBoundary, provinceBoundaries } from '../src/boundaries';
import { displayNameFromSlug } from '../src/core';
import {
  DATA_CHANGES,
  DATA_VERSION,
  areNeighborProvinces,
  convertKeyboardLayout,
  getAllCities,
  getCity,
  getCityBySlug,
  getDataChanges,
  getNeighborProvinces,
  getProvince,
  getProvinces,
  getProvincesList,
  searchCities,
  searchProvinces,
} from '../src/index';
import { unpack, type PackedData } from '../src/packed';
import source from '../src/data.json' with { type: 'json' };
import packedFull from '../src/generated/data-full.json' with { type: 'json' };
import packedLite from '../src/generated/data-lite.json' with { type: 'json' };

describe('packed data', () => {
  it('round-trips the source data exactly', () => {
    expect(unpack(packedFull as unknown as PackedData)).toEqual(source);
  });

  it('drops only coordinates in the lite data', () => {
    const withoutCoordinates = source.map((p: { cities: Record<string, unknown>[] }) => ({
      ...p,
      cities: p.cities.map(({ lat: _lat, lng: _lng, 'coord-confidence': _c, ...city }) => city),
    }));
    expect(unpack(packedLite as unknown as PackedData)).toEqual(withoutCoordinates);
  });

  it('rejects unknown formats', () => {
    expect(() => unpack({ ...(packedFull as unknown as PackedData), format: 99 })).toThrow(/format/);
  });
});

describe('neighbors', () => {
  it('lists the neighbors of Qom', () => {
    expect(getNeighborProvinces('قم').map((p) => p.en).sort()).toEqual(['isfahan', 'markazi', 'semnan', 'tehran']);
  });

  it('reflects the move of Tabas to South Khorasan', () => {
    expect(areNeighborProvinces('yazd', 'south-khorasan')).toBe(true);
    expect(areNeighborProvinces('yazd', 'razavi-khorasan')).toBe(false);
    expect(areNeighborProvinces('isfahan', 'south-khorasan')).toBe(true);
  });

  it('is symmetric and never includes the province itself', () => {
    for (const p of getProvinces()) {
      expect(p.neighborIds).not.toContain(p.id);
      for (const n of getNeighborProvinces(p.id)) expect(areNeighborProvinces(n.id, p.id)).toBe(true);
    }
  });

  it('handles unknown provinces', () => {
    expect(getNeighborProvinces('nowhere')).toEqual([]);
    expect(areNeighborProvinces('nowhere', 'tehran')).toBe(false);
  });

  it('returns fresh arrays', () => {
    const list = getNeighborProvinces('qom');
    expect(list).not.toBe(getNeighborProvinces('qom'));
    expect(() => list.reverse()).not.toThrow();
  });
});

describe('English display names', () => {
  it('derives names from slugs', () => {
    expect(displayNameFromSlug('shahr-e-kord')).toBe('Shahr-e Kord');
    expect(displayNameFromSlug('astaneh-ye-ashrafiyeh')).toBe('Astaneh-ye Ashrafiyeh');
    expect(displayNameFromSlug('aran-va-bidgol')).toBe('Aran va Bidgol');
    expect(displayNameFromSlug('shahr-e-jadid-e-hashtgerd')).toBe('Shahr-e Jadid-e Hashtgerd');
    expect(displayNameFromSlug('tehran')).toBe('Tehran');
  });

  it('exposes nameEn everywhere', () => {
    expect(getProvince('kohgiluyeh-and-boyer-ahmad')?.nameEn).toBe('Kohgiluyeh and Boyer-Ahmad');
    expect(getProvincesList()[3]?.nameEn).toBe('Chaharmahal and Bakhtiari');
    expect(getCity('bandar-e-gaz')?.nameEn).toBe('Bandar-e Gaz');
    expect(getCity('shiraz')?.provinceNameEn).toBe('Fars');
    expect(getAllCities().every((c) => /^[A-Z]/.test(c.nameEn))).toBe(true);
  });

  it('finds provinces and cities by display name', () => {
    expect(getProvince('Kohgiluyeh and Boyer-Ahmad')?.id).toBe(16);
    expect(getCity('Bandar-e Gaz')?.id).toBe(458);
  });
});

describe('keyboard layout', () => {
  it('converts in both directions', () => {
    expect(convertKeyboardLayout('jivhk', 'fa')).toBe('تهران');
    expect(convertKeyboardLayout('advhc', 'fa')).toBe('شیراز');
    expect(convertKeyboardLayout('ساهقشظ', 'en')).toBe('shiraz');
    expect(convertKeyboardLayout('Hfhnhk', 'fa')).toBe('آبادان');
  });

  it('fixes searches typed with the wrong layout', () => {
    expect(searchCities('jivhk')[0]?.en).toBe('tehran');
    expect(searchCities('advhc')[0]?.en).toBe('shiraz');
    expect(searchCities('ساهقشظ')[0]?.en).toBe('shiraz');
    expect(searchProvinces('thvs')[0]?.en).toBe('fars');
  });

  it('only applies when the original query finds nothing', () => {
    expect(searchCities('tehran')[0]?.en).toBe('tehran');
    expect(searchCities('jivhk', { keyboardFix: false })).toEqual([]);
  });
});

describe('data changes', () => {
  it('exposes the version and history', () => {
    expect(DATA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(Object.isFrozen(DATA_CHANGES)).toBe(true);
    expect(getDataChanges().length).toBe(DATA_CHANGES.length);
    expect(getDataChanges('2.0.0')).toEqual([]);
    expect(getDataChanges('1.2.0').every((c) => c.version === '2.0.0' && c.type === 'spelling')).toBe(true);
    expect(getDataChanges('1.2.0')).toHaveLength(25);
    expect(getDataChanges('1.1.9').length).toBe(28);
  });

  it('keeps every renamed slug resolvable', () => {
    for (const change of getDataChanges()) {
      if (change.type !== 'renamed' || !change.before?.slug) continue;
      expect(getCityBySlug(change.before.slug)?.id).toBe(change.cityId);
      expect(getCityBySlug(change.after?.slug ?? '')?.id).toBe(change.cityId);
    }
  });
});

describe('boundaries', () => {
  it('has one feature per province', () => {
    expect(provinceBoundaries.features).toHaveLength(31);
    expect(Object.isFrozen(provinceBoundaries.features[0])).toBe(true);
    expect(getProvinceBoundary(23)?.properties.fa).toBe('قم');
    expect(getProvinceBoundary(99)).toBeUndefined();
  });

  it('puts every city with coordinates in its own province', () => {
    const wrong = getAllCities().filter(
      (c) => c.coordinates && getProvinceAt(c.coordinates)?.id !== c.provinceId,
    );
    expect(wrong.map((c) => c.slug)).toEqual([]);
  });

  it('handles islands, coasts and points outside Iran', () => {
    expect(getProvinceAt({ lat: 29.2614, lng: 50.3306 })?.en).toBe('bushehr');
    expect(getProvinceAt({ lat: 29.2614, lng: 50.3306 }, { maxDistanceKm: 0 })).toBeUndefined();
    expect(getProvinceAt({ lat: 48.85, lng: 2.35 })).toBeUndefined();
    expect(getProvinceAt({ lat: Number.NaN, lng: 1 })).toBeUndefined();
  });
});

describe('keyboard layout with fuzzy search', () => {
  it('prefers a corrected exact match over a fuzzy match of the raw text', () => {
    expect(searchCities('jivhk', { fuzzy: true })[0]?.en).toBe('tehran');
    expect(searchCities('tehrn', { fuzzy: true })[0]?.en).toBe('tehran');
  });
});

describe('spelling', () => {
  it('uses Persian letters in every display name', () => {
    expect(getAllCities().filter((c) => /[يك]/.test(c.fa))).toEqual([]);
    expect(getProvinces().filter((p) => /[يك]/.test(p.fa))).toEqual([]);
  });

  it('still finds cities typed with Arabic letters', () => {
    expect(getCity('اسفرورين')?.fa).toBe('اسفرورین');
    expect(getCity('كدكن')?.fa).toBe('کدکن');
  });
});

describe('fuzzy distance', () => {
  it('scales the allowed typos with the query length', () => {
    expect(searchCities('تهرن', { fuzzy: true }).map((c) => c.en)).toEqual(['tehran']);
    expect(searchCities('کرمنشاه', { fuzzy: true })[0]?.en).toBe('kermanshah');
    expect(searchCities('shiraaz', { fuzzy: true })[0]?.en).toBe('shiraz');
    expect(searchCities('xy', { fuzzy: true, keyboardFix: false })).toEqual([]);
  });
});
