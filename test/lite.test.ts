import { describe, expect, it } from 'vitest';
import * as full from '../src/index';
import * as lite from '../src/lite';

describe('lite entry', () => {
  it('has the same cities without coordinates', () => {
    expect(lite.getStats()).toEqual(full.getStats());
    expect(lite.getAllCities().every((c) => c.coordinates === undefined)).toBe(true);
    expect(lite.getAllCities().map((c) => c.slug)).toEqual(full.getAllCities().map((c) => c.slug));
  });

  it('exposes the same lookup behaviour', () => {
    expect(lite.getCity('mahabad')?.provinceEn).toBe('west-azerbaijan');
    expect(lite.getCity('ابادان')?.en).toBe('abadan');
    expect(lite.searchCities('شیر', { limit: 3 }).map((c) => c.id)).toEqual(
      full.searchCities('شیر', { limit: 3 }).map((c) => c.id),
    );
  });

  it('does not expose geo helpers', () => {
    expect('getDistance' in lite).toBe(false);
    expect('getNearestCities' in lite).toBe(false);
  });
});
