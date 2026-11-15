import type {
  CoordinateConfidence,
  FlatCity,
  IranCities,
  IranCitiesGeo,
  LatLng,
  NearestCitiesOptions,
  NearestCity,
  Query,
} from './types';

const EARTH_RADIUS_KM = 6371.0088;

const CONFIDENCE_LEVEL: Readonly<Record<CoordinateConfidence, number>> = { low: 0, medium: 1, high: 2 };

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function isLatLng(value: unknown): value is LatLng {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as LatLng).lat === 'number' &&
    typeof (value as LatLng).lng === 'number' &&
    Number.isFinite((value as LatLng).lat) &&
    Number.isFinite((value as LatLng).lng)
  );
}

export function createGeo(api: IranCities): IranCitiesGeo {
  function resolve(point: LatLng | Query): { coords?: LatLng; city?: FlatCity } {
    if (isLatLng(point)) return { coords: { lat: point.lat, lng: point.lng } };
    if (typeof point !== 'string' && typeof point !== 'number') return {};
    const city = api.getCity(point);
    return { coords: city?.coordinates, city };
  }

  function getDistance(from: LatLng | Query, to: LatLng | Query): number | undefined {
    const a = resolve(from).coords;
    const b = resolve(to).coords;
    return a && b ? haversine(a, b) : undefined;
  }

  function getNearestCities(point: LatLng | Query, options: NearestCitiesOptions = {}): NearestCity[] {
    const { coords, city: origin } = resolve(point);
    if (!coords) return [];
    const limit = typeof options.limit === 'number' && options.limit >= 0 ? Math.floor(options.limit) : 5;
    const minLevel = CONFIDENCE_LEVEL[options.minConfidence ?? 'low'] ?? 0;
    const maxDistanceKm =
      typeof options.maxDistanceKm === 'number' && options.maxDistanceKm >= 0 ? options.maxDistanceKm : Infinity;

    const results: NearestCity[] = [];
    for (const city of api.getAllCities()) {
      if (!city.coordinates || city === origin) continue;
      if (CONFIDENCE_LEVEL[city.coordinates.confidence] < minLevel) continue;
      const distanceKm = haversine(coords, city.coordinates);
      if (distanceKm <= maxDistanceKm) results.push({ city, distanceKm });
    }
    results.sort((a, b) => a.distanceKm - b.distanceKm || a.city.id - b.city.id);
    return limit > 0 ? results.slice(0, limit) : results;
  }

  return { getDistance, getNearestCities };
}
