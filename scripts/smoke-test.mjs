import { createRequire } from 'module';
import assert from 'assert';

const require = createRequire(import.meta.url);
const name = '@code-plate/iran-cities';

function check(api, label, hasGeo) {
  assert.strictEqual(api.getStats().cityCount, 1252, label + ': city count');
  assert.strictEqual(api.getCity('ابادان').en, 'abadan', label + ': normalize');
  assert.strictEqual(api.getCity('mahabad').provinceEn, 'west-azerbaijan', label + ': primary');
  assert.strictEqual(api.getProvinceByPhoneCode('۰۲۱').en, 'tehran', label + ': phone code');
  assert.strictEqual(api.searchCities('تهرن', { fuzzy: true })[0].en, 'tehran', label + ': fuzzy');
  assert.ok(Object.isFrozen(api.getAllCities()), label + ': frozen');
  if (hasGeo) {
    assert.ok(api.getDistance('tehran', 'karaj') > 30, label + ': distance');
    assert.strictEqual(api.getNearestCities({ lat: 29.6, lng: 52.5 }, { limit: 1 })[0].city.en, 'shiraz', label + ': nearest');
  } else {
    assert.strictEqual(api.getCity('tehran').coordinates, undefined, label + ': lite has no coordinates');
  }
}

const cjs = require(name);
const cjsLite = require(name + '/lite');
check(cjs, 'cjs', true);
check(cjsLite, 'cjs lite', false);

const esm = await import(name);
const esmLite = await import(name + '/lite');
check(esm, 'esm', true);
check(esmLite, 'esm lite', false);

let hasReact = true;
try {
  require.resolve('react');
} catch {
  hasReact = false;
}
if (hasReact) {
  const hooksNames = ['useCities', 'useCitySearch', 'useProvinceCitySelect', 'useProvinceSearch', 'useProvinces'];
  for (const entry of ['/react', '/lite/react']) {
    assert.deepStrictEqual(Object.keys(require(name + entry)).sort(), hooksNames, 'cjs' + entry);
    assert.deepStrictEqual(Object.keys(await import(name + entry)).filter((k) => k !== 'default').sort(), hooksNames, 'esm' + entry);
  }
}

const boundaries = require(name + '/boundaries');
assert.strictEqual(boundaries.getProvinceAt({ lat: 34.64, lng: 50.88 }).en, 'qom', 'boundaries');
assert.strictEqual((await import(name + '/boundaries')).provinceBoundaries.features.length, 31, 'esm boundaries');
assert.deepStrictEqual(cjs.getNeighborProvinces('قم').map((p) => p.en).sort(), ['isfahan', 'markazi', 'semnan', 'tehran'], 'neighbors');
assert.strictEqual(cjs.searchCities('jivhk')[0].en, 'tehran', 'keyboard fix');
assert.strictEqual(cjs.getCity('bandar-e-gaz').nameEn, 'Bandar-e Gaz', 'nameEn');

if (hasReact) {
  const componentNames = ['CityCombobox', 'ProvinceCitySelect'];
  for (const entry of ['/react/components', '/lite/react/components']) {
    assert.deepStrictEqual(Object.keys(require(name + entry)).sort(), componentNames, 'cjs' + entry);
    assert.deepStrictEqual(Object.keys(await import(name + entry)).filter((k) => k !== 'default').sort(), componentNames, 'esm' + entry);
  }
}

const runtime =
  typeof globalThis.Bun !== 'undefined'
    ? 'Bun ' + globalThis.Bun.version
    : typeof globalThis.Deno !== 'undefined'
      ? 'Deno ' + globalThis.Deno.version.deno
      : 'Node.js ' + process.versions.node;

const optional = [];
for (const [entry, lib] of [['/zod', 'zod'], ['/valibot', 'valibot']]) {
  try {
    require.resolve(lib);
  } catch {
    continue;
  }
  const schemas = require(name + entry);
  const ok = lib === 'zod'
    ? schemas.provinceCitySchema.safeParse({ provinceId: 7, cityId: 292 }).success
    : require('valibot').safeParse(schemas.provinceCitySchema, { provinceId: 7, cityId: 292 }).success;
  assert.ok(ok, entry);
  optional.push(lib);
}

console.log(
  'smoke test passed on ' + runtime + (hasReact ? ' (with react)' : '') + (optional.length ? ' (with ' + optional.join(', ') + ')' : ''),
);
