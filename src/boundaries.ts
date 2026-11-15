import data from './boundaries.json' with { type: 'json' };
import { getProvinceById } from './index';
import type { LatLng, Province, ProvinceId } from './types';

export type Position = readonly [number, number];

export interface PolygonGeometry {
  readonly type: 'Polygon';
  readonly coordinates: readonly (readonly Position[])[];
}

export interface MultiPolygonGeometry {
  readonly type: 'MultiPolygon';
  readonly coordinates: readonly (readonly (readonly Position[])[])[];
}

export interface ProvinceFeature {
  readonly type: 'Feature';
  readonly id: ProvinceId;
  readonly properties: { readonly id: ProvinceId; readonly en: string; readonly fa: string };
  readonly geometry: PolygonGeometry | MultiPolygonGeometry;
}

export interface ProvinceBoundaries {
  readonly type: 'FeatureCollection';
  readonly features: readonly ProvinceFeature[];
}

export interface ProvinceAtOptions {
  maxDistanceKm?: number;
}

type Ring = readonly Position[];

interface IndexedFeature {
  id: ProvinceId;
  polygons: (readonly Ring[])[];
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as object)) deepFreeze((value as Record<string, unknown>)[key]);
  }
  return value;
}

export const provinceBoundaries: ProvinceBoundaries = deepFreeze(data as unknown as ProvinceBoundaries);

const KM_PER_DEGREE = 111.195;

const indexed: IndexedFeature[] = provinceBoundaries.features.map((feature) => {
  const polygons: (readonly Ring[])[] =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates.map((polygon) => polygon);
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const polygon of polygons) {
    for (const [lng, lat] of polygon[0] ?? []) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return { id: feature.id, polygons, minLng, minLat, maxLng, maxLat };
});

function insideRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as Position;
    const [xj, yj] = ring[j] as Position;
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function insidePolygon(lng: number, lat: number, polygon: readonly Ring[]): boolean {
  const outer = polygon[0];
  if (!outer || !insideRing(lng, lat, outer)) return false;
  for (let h = 1; h < polygon.length; h++) {
    if (insideRing(lng, lat, polygon[h] as Ring)) return false;
  }
  return true;
}

function distanceToSegmentKm(lng: number, lat: number, a: Position, b: Position): number {
  const kx = KM_PER_DEGREE * Math.cos((lat * Math.PI) / 180);
  const ky = KM_PER_DEGREE;
  const ax = (a[0] - lng) * kx;
  const ay = (a[1] - lat) * ky;
  const bx = (b[0] - lng) * kx;
  const by = (b[1] - lat) * ky;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  const px = ax + t * dx;
  const py = ay + t * dy;
  return Math.sqrt(px * px + py * py);
}

function distanceToFeatureKm(lng: number, lat: number, feature: IndexedFeature, limitKm: number): number {
  const marginLng = limitKm / (KM_PER_DEGREE * Math.max(0.1, Math.cos((lat * Math.PI) / 180)));
  const marginLat = limitKm / KM_PER_DEGREE;
  if (
    lng < feature.minLng - marginLng ||
    lng > feature.maxLng + marginLng ||
    lat < feature.minLat - marginLat ||
    lat > feature.maxLat + marginLat
  ) {
    return Infinity;
  }
  let best = Infinity;
  for (const polygon of feature.polygons) {
    for (const ring of polygon) {
      for (let i = 1; i < ring.length; i++) {
        const d = distanceToSegmentKm(lng, lat, ring[i - 1] as Position, ring[i] as Position);
        if (d < best) best = d;
      }
    }
  }
  return best;
}

function isLatLng(value: unknown): value is LatLng {
  return (
    typeof value === 'object' &&
    value !== null &&
    Number.isFinite((value as LatLng).lat) &&
    Number.isFinite((value as LatLng).lng)
  );
}

export function getProvinceAt(point: LatLng, options: ProvinceAtOptions = {}): Province | undefined {
  if (!isLatLng(point)) return undefined;
  const { lat, lng } = point;
  for (const feature of indexed) {
    if (lng < feature.minLng || lng > feature.maxLng || lat < feature.minLat || lat > feature.maxLat) continue;
    if (feature.polygons.some((polygon) => insidePolygon(lng, lat, polygon))) return getProvinceById(feature.id);
  }
  const limitKm = typeof options.maxDistanceKm === 'number' && options.maxDistanceKm >= 0 ? options.maxDistanceKm : 5;
  if (limitKm === 0) return undefined;
  let bestId: ProvinceId | undefined;
  let bestDistance = limitKm;
  for (const feature of indexed) {
    const d = distanceToFeatureKm(lng, lat, feature, limitKm);
    if (d <= bestDistance) {
      bestDistance = d;
      bestId = feature.id;
    }
  }
  return bestId === undefined ? undefined : getProvinceById(bestId);
}

export function getProvinceBoundary(provinceId: ProvinceId): ProvinceFeature | undefined {
  return provinceBoundaries.features.find((feature) => feature.id === provinceId);
}
