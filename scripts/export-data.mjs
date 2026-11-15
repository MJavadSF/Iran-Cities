import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url);
const out = new URL('data/', dist);
const api = await import(new URL('index.mjs', dist).href);

mkdirSync(out, { recursive: true });

const provinces = api.getProvinces();
const cities = api.getAllCities();

function csvCell(value) {
  if (value === undefined || value === null) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csv(header, rows) {
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
}

function sqlValue(value) {
  if (value === undefined || value === null) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlInsert(table, columns, rows) {
  const chunks = [];
  for (let i = 0; i < rows.length; i += 500) {
    const values = rows.slice(i, i + 500).map((row) => `  (${row.map(sqlValue).join(', ')})`);
    chunks.push(`INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${values.join(',\n')};`);
  }
  return chunks.join('\n\n');
}

const provinceRows = provinces.map((p) => [p.id, p.en, p.nameEn, p.fa, p.phoneCode, p.capitalId]);
const cityRows = cities.map((c) => [
  c.id,
  c.provinceId,
  c.en,
  c.nameEn,
  c.fa,
  c.slug,
  c.isCapital ? 1 : 0,
  c.coordinates?.lat,
  c.coordinates?.lng,
  c.coordinates?.confidence,
]);
const neighborRows = provinces.flatMap((p) => p.neighborIds.map((n) => [p.id, n]));
const aliasRows = cities.flatMap((c) => c.aliases.map((a) => [c.id, a]));

writeFileSync(
  new URL('provinces.csv', out),
  csv(
    ['id', 'en', 'name_en', 'fa', 'phone_code', 'capital_city_id', 'neighbor_ids'],
    provinces.map((p) => [p.id, p.en, p.nameEn, p.fa, p.phoneCode, p.capitalId, p.neighborIds.join(' ')]),
  ),
);
writeFileSync(
  new URL('cities.csv', out),
  csv(
    ['id', 'province_id', 'en', 'name_en', 'fa', 'slug', 'is_capital', 'lat', 'lng', 'coord_confidence', 'aliases'],
    cities.map((c, i) => [...cityRows[i], c.aliases.join(" | ")]),
  ),
);

writeFileSync(
  new URL('provinces.json', out),
  JSON.stringify(
    provinces.map(({ cities: _cities, ...p }) => p),
    null,
    2,
  ) + '\n',
);
writeFileSync(new URL('cities.json', out), JSON.stringify(cities, null, 2) + '\n');

const sql = [
  'CREATE TABLE provinces (',
  '  id INTEGER PRIMARY KEY,',
  '  en VARCHAR(64) NOT NULL UNIQUE,',
  '  name_en VARCHAR(64) NOT NULL,',
  '  fa VARCHAR(64) NOT NULL,',
  '  phone_code VARCHAR(4) NOT NULL,',
  '  capital_city_id INTEGER NOT NULL',
  ');',
  '',
  'CREATE TABLE cities (',
  '  id INTEGER PRIMARY KEY,',
  '  province_id INTEGER NOT NULL REFERENCES provinces (id),',
  '  en VARCHAR(64) NOT NULL,',
  '  name_en VARCHAR(96) NOT NULL,',
  '  fa VARCHAR(64) NOT NULL,',
  '  slug VARCHAR(128) NOT NULL UNIQUE,',
  '  is_capital SMALLINT NOT NULL,',
  '  lat DECIMAL(10, 7),',
  '  lng DECIMAL(10, 7),',
  '  coord_confidence VARCHAR(6)',
  ');',
  '',
  'CREATE TABLE province_neighbors (',
  '  province_id INTEGER NOT NULL REFERENCES provinces (id),',
  '  neighbor_id INTEGER NOT NULL REFERENCES provinces (id),',
  '  PRIMARY KEY (province_id, neighbor_id)',
  ');',
  '',
  'CREATE TABLE city_aliases (',
  '  city_id INTEGER NOT NULL REFERENCES cities (id),',
  '  alias VARCHAR(96) NOT NULL,',
  '  PRIMARY KEY (city_id, alias)',
  ');',
  '',
  'CREATE INDEX cities_province_id ON cities (province_id);',
  '',
  sqlInsert('provinces', ['id', 'en', 'name_en', 'fa', 'phone_code', 'capital_city_id'], provinceRows),
  '',
  sqlInsert(
    'cities',
    ['id', 'province_id', 'en', 'name_en', 'fa', 'slug', 'is_capital', 'lat', 'lng', 'coord_confidence'],
    cityRows,
  ),
  '',
  sqlInsert('province_neighbors', ['province_id', 'neighbor_id'], neighborRows),
  '',
  sqlInsert('city_aliases', ['city_id', 'alias'], aliasRows),
  '',
].join('\n');
writeFileSync(new URL('iran-cities.sql', out), sql);

copyFileSync(new URL('../src/boundaries.json', import.meta.url), new URL('iran-provinces.geojson', out));
copyFileSync(new URL('../src/components.css', import.meta.url), new URL('components.css', dist));
