import { describe, expect, it } from 'vitest';
import { getDistance, getNearestCities } from '../src/index';

describe('getDistance', () => {
  it('computes great-circle distance in km', () => {
    const d = getDistance('tehran', 'karaj');
    expect(d).toBeGreaterThan(30);
    expect(d).toBeLessThan(45);
    expect(getDistance({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })).toBe(0);
  });

  it('accepts coordinates and city queries together', () => {
    const tehran = getDistance('tehran', { lat: 29.61, lng: 52.53 });
    expect(tehran).toBeGreaterThan(650);
    expect(tehran).toBeLessThan(750);
  });

  it('returns undefined when a city has no coordinates or does not exist', () => {
    expect(getDistance('nowhere', 'tehran')).toBeUndefined();
    expect(getDistance('mahdasht', 'tehran')).toBeUndefined();
  });
});

describe('getNearestCities', () => {
  it('returns sorted results and excludes the origin city', () => {
    const results = getNearestCities('tehran', { limit: 5 });
    expect(results).toHaveLength(5);
    expect(results.some((r) => r.city.en === 'tehran')).toBe(false);
    for (let i = 1; i < results.length; i++) expect(results[i]!.distanceKm).toBeGreaterThanOrEqual(results[i - 1]!.distanceKm);
  });

  it('finds the closest city to a point', () => {
    expect(getNearestCities({ lat: 29.6, lng: 52.5 }, { limit: 1 })[0]!.city.en).toBe('shiraz');
  });

  it('filters by confidence and radius', () => {
    const high = getNearestCities('tehran', { limit: 0, minConfidence: 'high' });
    expect(high.every((r) => r.city.coordinates?.confidence === 'high')).toBe(true);
    const near = getNearestCities('tehran', { limit: 0, maxDistanceKm: 20 });
    expect(near.every((r) => r.distanceKm <= 20)).toBe(true);
  });

  it('returns an empty list for unknown points', () => {
    expect(getNearestCities('nowhere')).toEqual([]);
  });
});
