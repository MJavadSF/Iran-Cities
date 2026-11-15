import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/data.json', import.meta.url), 'utf8'));
const errors = [];
const err = (msg) => errors.push(msg);

const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BBOX = { latMin: 24, latMax: 40, lngMin: 44, lngMax: 64 };

const coordOwners = new Map();
const legacySlugs = [];
const primaryByFa = new Map();
const faOwners = new Map();
const provinceIds = new Set();
const provinceEns = new Set();
const phoneCodes = new Set();
const cityIds = new Set();
const slugs = new Set();
let cityCount = 0;
let maxCityId = 0;
let coordCount = 0;
let mediumCount = 0;
let lowCount = 0;

data.forEach((p, i) => {
  const where = `province[${i}] ${p['province-en']}`;
  if (!Number.isInteger(p['province-id'])) err(`${where}: province-id باید عدد صحیح باشد`);
  if (provinceIds.has(p['province-id'])) err(`${where}: province-id تکراری ${p['province-id']}`);
  provinceIds.add(p['province-id']);

  if (!kebab.test(p['province-en'])) err(`${where}: province-en باید kebab-case باشد`);
  if (provinceEns.has(p['province-en'])) err(`${where}: province-en تکراری`);
  provinceEns.add(p['province-en']);
  if (typeof p['name-en'] !== 'string' || !/^[A-Z][A-Za-z' -]+$/.test(p['name-en'])) err(`${where}: name-en نامعتبر است`);
  if (!Array.isArray(p.neighbors) || p.neighbors.length === 0) err(`${where}: neighbors باید آرایه‌ی غیرخالی باشد`);
  if (!p['province-fa']?.trim()) err(`${where}: province-fa خالی است`);

  if (!/^0\d{2}$/.test(p['phone-code'] ?? '')) err(`${where}: phone-code باید رشته‌ی سه‌رقمی با صفر ابتدایی باشد (مثل "021")`);
  if (phoneCodes.has(p['phone-code'])) err(`${where}: phone-code تکراری ${p['phone-code']}`);
  phoneCodes.add(p['phone-code']);

  const localEn = new Set();
  const localFa = new Set();
  let capitalHits = 0;

  for (const c of p.cities) {
    cityCount++;
    const cw = `${where} / city ${c['city-en']} (#${c['city-id']})`;
    if (!Number.isInteger(c['city-id']) || c['city-id'] < 1) err(`${cw}: city-id نامعتبر`);
    if (cityIds.has(c['city-id'])) err(`${cw}: city-id تکراری`);
    cityIds.add(c['city-id']);
    maxCityId = Math.max(maxCityId, c['city-id']);

    if (!kebab.test(c['city-en'])) err(`${cw}: city-en با الگوی kebab-case نمی‌خواند ("${c['city-en']}")`);
    if (!c['city-fa']?.trim()) err(`${cw}: city-fa خالی است`);

    const slug = `${p['province-en']}/${c['city-en']}`;
    if (slugs.has(slug)) err(`${cw}: slug تکراری ${slug}`);
    slugs.add(slug);
    if (localEn.has(c['city-en'])) err(`${cw}: city-en تکراری داخل همین استان`);
    localEn.add(c['city-en']);
    if (localFa.has(c['city-fa'])) err(`${cw}: city-fa تکراری داخل همین استان`);
    localFa.add(c['city-fa']);

    if (c['city-id'] === p['capital-city-id']) capitalHits++;
    if (/[يكى]/.test(c['city-fa'])) err(`${cw}: city-fa باید با «ی» و «ک» فارسی نوشته شود`);
    if (c['name-en'] !== undefined && (typeof c['name-en'] !== 'string' || !c['name-en'].trim())) err(`${cw}: name-en نامعتبر است`);

    if (c.aliases !== undefined) {
      if (!Array.isArray(c.aliases) || c.aliases.length === 0) err(`${cw}: aliases باید آرایه‌ی غیرخالی باشد`);
      else {
        const seen = new Set();
        for (const a of c.aliases) {
          if (typeof a !== 'string' || !a.trim()) err(`${cw}: alias خالی یا نامعتبر`);
          else if (a === c['city-en'] || a === c['city-fa']) err(`${cw}: alias "${a}" با نام اصلی یکی است`);
          else if (seen.has(a)) err(`${cw}: alias تکراری "${a}"`);
          seen.add(a);
        }
      }
    }
    if (c['legacy-slugs'] !== undefined) {
      if (!Array.isArray(c['legacy-slugs']) || c['legacy-slugs'].length === 0) err(`${cw}: legacy-slugs باید آرایه‌ی غیرخالی باشد`);
      else for (const s of c['legacy-slugs']) legacySlugs.push([s, cw]);
    }
    if (c.primary !== undefined) {
      if (c.primary !== true) err(`${cw}: primary فقط می‌تواند true باشد`);
      else primaryByFa.set(c['city-fa'], [...(primaryByFa.get(c['city-fa']) ?? []), cw]);
    }
    faOwners.set(c['city-fa'], (faOwners.get(c['city-fa']) ?? 0) + 1);

    const hasLat = c.lat !== undefined;
    const hasLng = c.lng !== undefined;
    if (!hasLat && c['coord-confidence'] !== undefined) err(`${cw}: coord-confidence بدون lat/lng`);
    if (hasLat !== hasLng) err(`${cw}: lat و lng باید با هم وجود داشته باشند`);
    if (hasLat && hasLng) {
      coordCount++;
      { const ck = `${c.lat},${c.lng}`; if (coordOwners.has(ck)) err(`${cw}: مختصات ${ck} عیناً مثل ${coordOwners.get(ck)} است (احتمالاً placeholder)`); else coordOwners.set(ck, cw); }
      if (c['coord-confidence'] !== undefined) {
        if (!['medium', 'low'].includes(c['coord-confidence'])) err(`${cw}: coord-confidence فقط می‌تواند "medium" یا "low" باشد (نبودنش یعنی high)`);
        else if (c['coord-confidence'] === 'medium') mediumCount++;
        else lowCount++;
      }
      if (typeof c.lat !== 'number' || typeof c.lng !== 'number') err(`${cw}: lat/lng باید عدد باشند`);
      else if (c.lat < BBOX.latMin || c.lat > BBOX.latMax || c.lng < BBOX.lngMin || c.lng > BBOX.lngMax) {
        err(`${cw}: مختصات (${c.lat}, ${c.lng}) خارج از محدوده‌ی ایران است`);
      }
    }
  }

  if (capitalHits !== 1) err(`${where}: capital-city-id (${p['capital-city-id']}) باید دقیقاً به یک شهر همین استان اشاره کند (پیدا شد: ${capitalHits})`);
});

const expectedProvinceIds = data.map((_, i) => i + 1);
if (JSON.stringify([...provinceIds].sort((a, b) => a - b)) !== JSON.stringify(expectedProvinceIds)) {
  err('province-id ها باید دقیقاً ۱..N باشند');
}
if (maxCityId !== cityCount) err(`city-id ها باید ۱..${cityCount} پیوسته باشند (بیشینه: ${maxCityId})`);

const knownProvinceIds = new Set(data.map((p) => p['province-id']));
for (const p of data) {
  for (const n of p.neighbors ?? []) {
    if (!knownProvinceIds.has(n)) err(`${p['province-en']}: همسایه‌ی ناموجود ${n}`);
    else if (n === p['province-id']) err(`${p['province-en']}: استان نمی‌تواند همسایه‌ی خودش باشد`);
    else if (!data.find((q) => q['province-id'] === n).neighbors?.includes(p['province-id'])) err(`${p['province-en']}: همسایگی با ${n} متقارن نیست`);
  }
  if (new Set(p.neighbors ?? []).size !== (p.neighbors ?? []).length) err(`${p['province-en']}: همسایه‌ی تکراری`);
}
for (const p of data) {
  const cap = p.cities.find((c) => c['city-id'] === p['capital-city-id']);
  if (cap && (cap.lat === undefined || cap.lng === undefined)) err(`${p['province-en']}: مرکز استان (${cap['city-en']}) مختصات ندارد`);
}

for (const [slug, cw] of legacySlugs) {
  if (typeof slug !== 'string' || !slug.includes('/')) err(`${cw}: legacy-slug نامعتبر "${slug}"`);
  else if (slugs.has(slug)) err(`${cw}: legacy-slug "${slug}" با slug یک شهر فعلی تداخل دارد`);
}
for (const [fa, owners] of primaryByFa) {
  if (owners.length > 1) err(`primary بیش از یک بار برای «${fa}»: ${owners.join(' , ')}`);
  if ((faOwners.get(fa) ?? 0) < 2) err(`${owners[0]}: primary فقط برای نام‌های تکراری معنا دارد`);
}

if (errors.length) {
  console.error(`✖ ${errors.length} خطا در data.json:\n` + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✔ data.json معتبر است: ${data.length} استان، ${cityCount} شهر، ${coordCount} مختصات (${mediumCount} متوسط، ${lowCount} پایین)، ${phoneCodes.size} کد تلفن یکتا`);
