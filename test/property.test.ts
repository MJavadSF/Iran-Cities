import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { convertKeyboardLayout, getAllCities, getCity, normalize, searchCities, searchProvinces } from '../src/index';

const persianish = fc.string({ unit: fc.constantFrom(...'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیيكآأإةۀؤئ ‌-ـَ۰۱۲0123abc'.split('')) });

describe('properties', () => {
  it('normalize is idempotent', () => {
    fc.assert(fc.property(fc.string(), (s) => normalize(normalize(s)) === normalize(s)));
    fc.assert(fc.property(persianish, (s) => normalize(normalize(s)) === normalize(s)));
  });

  it('normalize ignores spacing, ZWNJ, hyphens and diacritics', () => {
    fc.assert(
      fc.property(persianish, fc.constantFrom(' ', '‌', '-', 'ـ', 'َ'), (s, noise) => {
        const chars = [...s];
        return normalize(chars.join(noise)) === normalize(s);
      }),
    );
  });

  it('search never throws and respects limit', () => {
    fc.assert(
      fc.property(fc.oneof(fc.string(), persianish), fc.integer({ min: 1, max: 20 }), fc.boolean(), (q, limit, fuzzy) => {
        const results = searchCities(q, { limit, fuzzy });
        return results.length <= limit && searchProvinces(q, { limit }).length <= limit;
      }),
      { numRuns: 300 },
    );
  });

  it('every city is found by its own Persian and English names', () => {
    for (const city of getAllCities()) {
      expect(getCity(city.fa, city.provinceId)?.id).toBe(city.id);
      expect(getCity(city.en, city.provinceId)?.id).toBe(city.id);
      expect(getCity(city.nameEn, city.provinceId)?.id).toBe(city.id);
      expect(searchCities(city.fa, { limit: 50 }).some((c) => c.id === city.id)).toBe(true);
    }
  });

  it('keyboard conversion round-trips Persian letters', () => {
    const letters = 'ضصثقفغعهخحجچشسیبلاتنمکگظطزرذدپو';
    fc.assert(
      fc.property(fc.string({ unit: fc.constantFrom(...letters.split('')) }), (s) =>
        convertKeyboardLayout(convertKeyboardLayout(s, 'en'), 'fa') === s,
      ),
    );
  });
});
