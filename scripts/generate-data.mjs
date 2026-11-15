import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SCALE = 1e7;
const CONFIDENCE_CODE = { high: '1', medium: '2', low: '3' };

const source = new URL('../src/data.json', import.meta.url);
const targetDir = new URL('../src/generated/', import.meta.url);
const data = JSON.parse(readFileSync(source, 'utf8'));

function pack(withCoordinates) {
  const cities = data.flatMap((p) => p.cities);
  const ids = cities.map((c) => c['city-id']);
  const packed = {
    format: 1,
    provinces: data.map((p) => [
      p['province-id'],
      p['province-en'],
      p['province-fa'],
      p['phone-code'],
      p['capital-city-id'],
      p['name-en'],
      p.neighbors,
      p.cities.length,
    ]),
    ids: ids.map((id, i) => (i === 0 ? id : id - ids[i - 1])),
    en: cities.map((c) => c['city-en']).join('|'),
    fa: cities.map((c) => c['city-fa']).join('|'),
    extras: [],
  };
  cities.forEach((c, index) => {
    if (c['name-en'] || c.aliases || c.primary || c['legacy-slugs']) {
      packed.extras.push([index, c['name-en'] ?? 0, c.aliases ?? 0, c.primary ? 1 : 0, c['legacy-slugs'] ?? 0]);
    }
  });
  if (withCoordinates) {
    let lastLat = 0;
    let lastLng = 0;
    packed.confidence = cities
      .map((c) => (typeof c.lat === 'number' ? CONFIDENCE_CODE[c['coord-confidence'] ?? 'high'] : '0'))
      .join('');
    packed.lat = [];
    packed.lng = [];
    for (const c of cities) {
      if (typeof c.lat !== 'number') continue;
      const lat = Math.round(c.lat * SCALE);
      const lng = Math.round(c.lng * SCALE);
      packed.lat.push(lat - lastLat);
      packed.lng.push(lng - lastLng);
      lastLat = lat;
      lastLng = lng;
    }
  }
  if (cities.some((c) => c['city-en'].includes('|') || c['city-fa'].includes('|'))) {
    throw new Error('City names must not contain "|"');
  }
  return packed;
}

mkdirSync(targetDir, { recursive: true });
writeFileSync(new URL('data-full.json', targetDir), JSON.stringify(pack(true)) + '\n');
writeFileSync(new URL('data-lite.json', targetDir), JSON.stringify(pack(false)) + '\n');
