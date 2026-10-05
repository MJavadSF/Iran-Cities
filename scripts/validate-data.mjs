import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/data.json', import.meta.url), 'utf8'));
const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BBOX = { latMin: 24, latMax: 40, lngMin: 44, lngMax: 64 };

const provinceIds = new Set();
const provinceEns = new Set();
const phoneCodes = new Set();
const cityIds = new Set();
const slugs = new Set();
let cityCount = 0;
let maxCityId = 0;
let coordCount = 0;

data.forEach((p, i) => {
  const where = `province[${i}] ${p['province-en']}`;
  if (!Number.isInteger(p['province-id'])) err(`${where}: province-id باید عدد صحیح باشد`);
  if (provinceIds.has(p['province-id'])) err(`${where}: province-id تکراری ${p['province-id']}`);
  provinceIds.add(p['province-id']);

  if (!kebab.test(p['province-en'])) err(`${where}: province-en باید kebab-case باشد`);
  if (provinceEns.has(p['province-en'])) err(`${where}: province-en تکراری`);
  provinceEns.add(p['province-en']);
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

    if (!kebab.test(c['city-en'])) warn(`${cw}: city-en با الگوی kebab-case نمی‌خواند ("${c['city-en']}")`);
    if (!c['city-fa']?.trim()) err(`${cw}: city-fa خالی است`);

    const slug = `${p['province-en']}/${c['city-en']}`;
    if (slugs.has(slug)) err(`${cw}: slug تکراری ${slug}`);
    slugs.add(slug);
    if (localEn.has(c['city-en'])) err(`${cw}: city-en تکراری داخل همین استان`);
    localEn.add(c['city-en']);
    if (localFa.has(c['city-fa'])) err(`${cw}: city-fa تکراری داخل همین استان`);
    localFa.add(c['city-fa']);

    if (c['city-id'] === p['capital-city-id']) capitalHits++;

    const hasLat = c.lat !== undefined;
    const hasLng = c.lng !== undefined;
    if (hasLat !== hasLng) err(`${cw}: lat و lng باید با هم وجود داشته باشند`);
    if (hasLat && hasLng) {
      coordCount++;
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

for (const p of data) {
  const cap = p.cities.find((c) => c['city-id'] === p['capital-city-id']);
  if (cap && (cap.lat === undefined || cap.lng === undefined)) err(`${p['province-en']}: مرکز استان (${cap['city-en']}) مختصات ندارد`);
}

if (warnings.length) {
  console.warn(`⚠ ${warnings.length} هشدار:\n` + warnings.map((w) => ' - ' + w).join('\n'));
}

if (errors.length) {
  console.error(`✖ ${errors.length} خطا در data.json:\n` + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✔ data.json معتبر است: ${data.length} استان، ${cityCount} شهر، ${coordCount} مختصات، ${phoneCodes.size} کد تلفن یکتا`);
