<div align="center">

English · [فارسی](./README.fa.md)

# 🇮🇷 Iran Cities

**Every province and city of Iran, in Persian and English, with fast lookup, smart search, coordinates, boundaries and ready-made components.**

Zero dependencies · Tree-shakeable · Fully typed · Built for Next.js

[![npm version](https://img.shields.io/npm/v/@code-plate/iran-cities?color=0a7f5a&label=npm)](https://www.npmjs.com/package/@code-plate/iran-cities)
[![npm downloads](https://img.shields.io/npm/dm/@code-plate/iran-cities?color=0a7f5a)](https://www.npmjs.com/package/@code-plate/iran-cities)
[![CI](https://github.com/MJavadSF/Iran-Cities/actions/workflows/ci.yml/badge.svg)](https://github.com/MJavadSF/Iran-Cities/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/MJavadSF/Iran-Cities/badge)](https://scorecard.dev/viewer/?uri=github.com/MJavadSF/Iran-Cities)
[![types](https://img.shields.io/badge/types-included-3178c6)](#typescript)

**[Documentation](https://mjavadsf.github.io/Iran-Cities/)** · **[Live playground](https://mjavadsf.github.io/Iran-Cities/playground/)** · **[Map](https://mjavadsf.github.io/Iran-Cities/guides/geography/)**

</div>

```ts
import { getCity, searchCities, getNeighborProvinces } from '@code-plate/iran-cities';

getCity('شيراز');              // { id: 292, fa: 'شیراز', nameEn: 'Shiraz', provinceFa: 'فارس', phoneCode: '071', ... }
searchCities('jivhk');          // [تهران]  typed on an English keyboard
getNeighborProvinces('قم');     // [اصفهان, مرکزی, سمنان, تهران]
```

<table>
<tr>
<td width="33%" valign="top">

### 📍 Complete
**31** provinces and **1,252** cities with stable ids, Persian and English names, area codes, capitals, neighboring provinces and **1,152** coordinates, all checked against province boundaries.

</td>
<td width="33%" valign="top">

### 🔎 Persian-aware
Understands `ي`/`ی`, `ك`/`ک`, `آ`/`ا`, ZWNJ, diacritics and Persian digits, tolerates typos, and fixes text typed with the wrong keyboard layout.

</td>
<td width="33%" valign="top">

### ⚡ Ready for production
Accessible components in plain CSS, Zod and Valibot schemas, `"use client"` hooks, a `lite` build, frozen data, and types from TypeScript 3.9 to 7.

</td>
</tr>
</table>

> [!TIP]
> Upgrading from 1.x? Most projects need no changes. See the [migration guide](./MIGRATION.md).

## Contents

- [Installation](#installation)
- [Entry points](#entry-points)
- [Quick start](#quick-start)
- [Next.js](#nextjs)
- [Components](#components)
- [Form validation](#form-validation)
- [React hooks](#react-hooks)
- [Maps and geography](#maps-and-geography)
- [Vue, Svelte, Angular, Express](#vue-svelte-angular-express)
- [Other languages: CSV, SQL, JSON](#other-languages-csv-sql-json)
- [API reference](#api-reference)
- [How matching works](#how-matching-works)
- [Data and sources](#data-and-sources)
- [Compatibility](#compatibility)
- [Contributing](#contributing)
- [License and credits](#license-and-credits)

## Installation

```bash
npm install @code-plate/iran-cities
```

<details>
<summary>pnpm, yarn, bun, Deno</summary>

```bash
pnpm add @code-plate/iran-cities
yarn add @code-plate/iran-cities
bun add @code-plate/iran-cities
deno add npm:@code-plate/iran-cities
```

</details>

## Entry points

Pick the smallest entry that has what you need. Sizes are minified and brotli-compressed, data included.

| Import | What you get | Size |
|---|---|---:|
| `@code-plate/iran-cities` | Every function, including coordinates and distances | 24 KB |
| `@code-plate/iran-cities/lite` | The same lookups and search, without coordinates | 16 KB |
| `@code-plate/iran-cities/react` | React hooks | 25 KB |
| `@code-plate/iran-cities/lite/react` | React hooks without coordinates | 17 KB |
| `@code-plate/iran-cities/lite/react/components` | `CityCombobox` and `ProvinceCitySelect` | 18 KB |
| `@code-plate/iran-cities/react/components` | The same components with coordinates | 26 KB |
| `@code-plate/iran-cities/components.css` | The components' stylesheet | 1.5 KB |
| `@code-plate/iran-cities/zod` · `/valibot` | Validation schemas | 16 KB |
| `@code-plate/iran-cities/boundaries` | Province boundaries (GeoJSON) and `getProvinceAt` | 53 KB |
| `@code-plate/iran-cities/data/*` | CSV, SQL, JSON and GeoJSON files | |

Entries share code, so importing several never ships the data twice. React, Zod and Valibot are optional peer dependencies.

## Quick start

### Look things up

```ts
import { getProvince, getCities, getCity, getCityById, getProvinceOfCity } from '@code-plate/iran-cities';

getProvince('tehran');          // by English id
getProvince('تهران');           // by Persian name
getProvince(28);                // by id ('28' and '۲۸' work too)

getCities('fars');              // all cities of Fars
getCity('شیراز');               // a city anywhere in Iran
getCity('شیراز', 'fars');       // a city within a province
getCityById(292);               // by its global id
getProvinceOfCity('اصفهان');    // the province a city belongs to
```

### Search and autocomplete

```ts
import { searchCities, searchProvinces } from '@code-plate/iran-cities';

searchProvinces('خراسان');                   // [خراسان جنوبی, خراسان رضوی, خراسان شمالی]
searchCities('شهر', { limit: 10 });          // first 10 matches
searchCities('تهرن', { fuzzy: true });       // typo tolerant: [تهران]
searchCities('jivhk');                       // wrong keyboard layout: [تهران]
searchCities('', { emptyQuery: 'none' });    // [] instead of all 1,252 cities
```

### Neighbors, capitals and area codes

```ts
import { getNeighborProvinces, areNeighborProvinces, getCapital, getProvinceByPhoneCode } from '@code-plate/iran-cities';

getNeighborProvinces('قم');                   // [اصفهان, مرکزی, سمنان, تهران]
areNeighborProvinces('yazd', 'south-khorasan'); // true
getCapital('khuzestan');                      // اهواز
getProvinceByPhoneCode('021');                // تهران ('21', 21, '۰۲۱', '+98 21' work too)
```

### English display names

```ts
getProvince(16)?.nameEn;          // 'Kohgiluyeh and Boyer-Ahmad'  (the id `en` is 'kohgiluyeh-and-boyer-ahmad')
getCity('bandar-e-gaz')?.nameEn;  // 'Bandar-e Gaz'
```

## Next.js

Use the core entry in **Server Components** and the hooks or components in **Client Components**. Every React entry already declares `"use client"`.

```tsx
// app/address/page.tsx (Server Component)
import { getCity } from '@code-plate/iran-cities';
import AddressForm from './address-form';
import { save } from './actions';

export default function Page() {
  const city = getCity('شیراز', 'fars');
  return <AddressForm action={save} defaultCityId={city?.id} />;
}
```

```tsx
// app/address/address-form.tsx (Client Component)
'use client';

import '@code-plate/iran-cities/components.css';
import { ProvinceCitySelect } from '@code-plate/iran-cities/lite/react/components';

export default function AddressForm({ action, defaultCityId }: { action: (data: FormData) => void; defaultCityId?: number }) {
  return (
    <form action={action}>
      <ProvinceCitySelect provinceName="provinceId" cityName="cityId" defaultValue={{ cityId: defaultCityId }} required />
      <button type="submit">ثبت</button>
    </form>
  );
}
```

```ts
// app/address/actions.ts
'use server';

import { provinceCitySchema } from '@code-plate/iran-cities/zod';

export async function save(formData: FormData) {
  const result = provinceCitySchema.safeParse({ provinceId: formData.get('provinceId'), cityId: formData.get('cityId') });
  if (!result.success) return;
}
```

> [!TIP]
> Use the `lite` entries in Client Components unless the browser really needs coordinates. That keeps about 8 KB out of the client bundle.

Tested with Next.js 14, 15 and 16, with Turbopack and webpack.

## Components

Two accessible components, styled with one small plain-CSS file (no Tailwind, no CSS-in-JS). [See them live](https://mjavadsf.github.io/Iran-Cities/guides/components/).

```tsx
'use client';

import '@code-plate/iran-cities/components.css';
import { CityCombobox, ProvinceCitySelect } from '@code-plate/iran-cities/lite/react/components';

<ProvinceCitySelect provinceName="provinceId" cityName="cityId" onChange={({ provinceId, cityId }) => {}} />
<CityCombobox label="شهر مقصد" name="destinationId" province="fars" onChange={(city) => {}} />
```

- **`CityCombobox`** follows the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/): `↑` `↓`, `Home` `End`, `Enter` to select, `Escape` to close and again to clear. Typo tolerant and fixes the keyboard layout.
- **`ProvinceCitySelect`** is two labelled native `<select>`s; the city resets when the province changes.
- Both submit **ids** through normal form fields (`name`), so they work with plain forms and Server Actions. Both can be controlled (`value` + `onChange`) or uncontrolled (`defaultValue`), so they plug into react-hook-form's `Controller` as-is.
- Right-to-left by default (`dir="rtl"`), English names with `locale="en"`, automatic dark mode.

Theme with CSS variables on any parent. All selectors use `:where()`, so your own classes win without `!important`:

```css
.checkout {
  --ic-accent: #2563eb;
  --ic-radius: 0.375rem;
  --ic-height: 2.5rem;
  --ic-font: 'Vazirmatn', sans-serif;
}
```

<details>
<summary>All CSS variables</summary>

| Variable | |
|---|---|
| `--ic-font`, `--ic-font-size`, `--ic-line-height` | Typography |
| `--ic-height`, `--ic-radius`, `--ic-gap`, `--ic-padding-inline` | Size and spacing |
| `--ic-bg`, `--ic-fg`, `--ic-muted`, `--ic-border`, `--ic-border-hover` | Colors |
| `--ic-accent`, `--ic-accent-soft`, `--ic-ring` | Accent and focus ring |
| `--ic-danger`, `--ic-danger-ring` | Invalid state |
| `--ic-popover-bg`, `--ic-shadow`, `--ic-listbox-max-height` | Suggestion list |
| `--ic-disabled-bg`, `--ic-transition` | Other |

Dark mode follows `prefers-color-scheme`; force it with `data-theme="dark"` or `"light"` on any parent.

</details>

## Form validation

```ts
import { provinceCitySchema, cityIdSchema, citySchema } from '@code-plate/iran-cities/zod';

provinceCitySchema.parse({ provinceId: '7', cityId: '292' });   // { provinceId: 7, cityId: 292 }
provinceCitySchema.safeParse({ provinceId: 28, cityId: 292 });   // error on cityId: «این شهر در استان انتخاب‌شده نیست.»
cityIdSchema.parse('۲۹۲');                                       // 292
citySchema.parse('شیراز');                                        // the full city object
```

The same schemas exist for Valibot in `@code-plate/iran-cities/valibot`. Messages are Persian by default; pass your own with `createZodSchemas({ ... })` or `createValibotSchemas({ ... })`.

## React hooks

Import from `@code-plate/iran-cities/react`, or `@code-plate/iran-cities/lite/react` without coordinates.

| Hook | Returns |
|---|---|
| `useProvinces()` | The list of provinces |
| `useCities(province)` | Cities of a province |
| `useProvinceCitySelect(options?)` | Everything a province → city field needs; options `initialProvince`, `initialCity`, `value`, `onChange` |
| `useCitySearch(initialQuery?, options?)` | `{ query, setQuery, results }` |
| `useProvinceSearch(initialQuery?, options?)` | `{ query, setQuery, results }` |

```tsx
const { provinces, cities, province, city, setProvince, setCity, provinceId, cityId } = useProvinceCitySelect({ initialCity: 292 });
const [value, setValue] = useState<ProvinceCityValue>({ provinceId: 7, cityId: 292 });
useProvinceCitySelect({ value, onChange: setValue });   // controlled
```

## Maps and geography

```ts
import { getDistance, getNearestCities } from '@code-plate/iran-cities';
import { getProvinceAt, provinceBoundaries } from '@code-plate/iran-cities/boundaries';

getDistance('tehran', 'karaj');                              // 36.5 (km)
getNearestCities({ lat: 29.6, lng: 52.5 }, { limit: 1 });    // [{ city: شیراز, distanceKm: 5.6 }]
getProvinceAt({ lat: 34.64, lng: 50.88 });                   // قم
getProvinceAt({ lat: 48.85, lng: 2.35 });                    // undefined (outside Iran)
```

`provinceBoundaries` is a standard GeoJSON `FeatureCollection` that works directly with Leaflet, MapLibre and deck.gl. Every city with coordinates resolves to its own province. [Try the map](https://mjavadsf.github.io/Iran-Cities/guides/geography/).

## Vue, Svelte, Angular, Express

The core functions are plain synchronous functions, so they work in any framework.

<details>
<summary><b>Vue 3</b></summary>

```vue
<script setup>
import { ref, computed } from 'vue';
import { getProvincesList, getCities } from '@code-plate/iran-cities/lite';

const provinces = getProvincesList();
const province = ref('');
const cities = computed(() => getCities(province.value));
</script>

<template>
  <select v-model="province">
    <option v-for="p in provinces" :key="p.id" :value="p.en">{{ p.fa }}</option>
  </select>
  <select :disabled="!province">
    <option v-for="c in cities" :key="c.id" :value="c.en">{{ c.fa }}</option>
  </select>
</template>
```

</details>

<details>
<summary><b>Svelte</b></summary>

```svelte
<script>
  import { getProvincesList, getCities } from '@code-plate/iran-cities/lite';

  const provinces = getProvincesList();
  let province = '';
  $: cities = getCities(province);
</script>

<select bind:value={province}>
  {#each provinces as p (p.id)}<option value={p.en}>{p.fa}</option>{/each}
</select>
<select disabled={!province}>
  {#each cities as c (c.id)}<option value={c.en}>{c.fa}</option>{/each}
</select>
```

</details>

<details>
<summary><b>Angular</b></summary>

```ts
import { Injectable } from '@angular/core';
import { getProvincesList, getCities, type City, type ProvinceListItem } from '@code-plate/iran-cities/lite';

@Injectable({ providedIn: 'root' })
export class IranLocationsService {
  provinces(): ProvinceListItem[] {
    return getProvincesList();
  }

  citiesOf(province: string): readonly City[] {
    return getCities(province);
  }
}
```

</details>

<details>
<summary><b>Node.js / Express</b></summary>

```js
const express = require('express');
const { getProvincesList, getCities, searchCities } = require('@code-plate/iran-cities');

const app = express();

app.get('/api/provinces', (req, res) => res.json(getProvincesList()));
app.get('/api/cities/search', (req, res) => res.json(searchCities(String(req.query.q ?? ''), { limit: 20 })));
app.get('/api/cities/:province', (req, res) => res.json(getCities(req.params.province)));
```

The search route is registered before `/:province`, otherwise Express would treat `search` as a province name.

</details>

## Other languages: CSV, SQL, JSON

The package also ships the data as plain files for Laravel, Django, Go or any database:

| File | |
|---|---|
| `data/provinces.csv`, `data/cities.csv` | UTF-8 CSV with a header row |
| `data/provinces.json`, `data/cities.json` | Flat JSON arrays |
| `data/iran-cities.sql` | Tables, foreign keys and inserts for PostgreSQL, MySQL, MariaDB and SQLite |
| `data/iran-provinces.geojson` | Province boundaries |

```bash
curl -O https://unpkg.com/@code-plate/iran-cities/dist/data/iran-cities.sql
psql mydb < iran-cities.sql
```

## API reference

Wherever a query is expected, you can pass a Persian name, an English id, an English display name or a numeric id (number or string, Persian digits included).

<details open>
<summary><b>Provinces</b></summary>

| Function | Returns |
|---|---|
| `getProvinces()` | `readonly Province[]` with their cities |
| `getProvincesList()` | `ProvinceListItem[]` without cities (a new array every call) |
| `getProvince(query)` | `Province \| undefined` |
| `getProvinceById(id)` | `Province \| undefined` |
| `getProvinceByPhoneCode(code)` | `Province \| undefined` |
| `getProvinceOfCity(cityQuery)` | `Province \| undefined` |
| `getNeighborProvinces(query)` | `Province[]` that share a border |
| `areNeighborProvinces(a, b)` | `boolean` |

</details>

<details open>
<summary><b>Cities</b></summary>

| Function | Returns |
|---|---|
| `getCities(provinceQuery)` | `readonly City[]` |
| `getAllCities()` | `readonly FlatCity[]` |
| `getCity(cityQuery, provinceQuery?)` | `FlatCity \| undefined` |
| `getCityById(id)` | `FlatCity \| undefined` |
| `getCityBySlug(slug)` | `FlatCity \| undefined`, e.g. `'fars/shiraz'`; old slugs still resolve |
| `getCitiesByName(name)` | `readonly FlatCity[]`, every city with that name or alias |
| `isAmbiguousCityName(name)` | `boolean` |
| `getCapital(provinceQuery)` | `FlatCity \| undefined` |
| `getCapitals()` | `FlatCity[]`, the 31 provincial capitals |

</details>

<details open>
<summary><b>Search</b></summary>

| Function | Returns |
|---|---|
| `searchCities(query, options?)` | `FlatCity[]` |
| `searchProvinces(query, options?)` | `Province[]` |
| `normalize(text)` | `string`, the normalization every lookup uses |
| `convertKeyboardLayout(text, 'fa' \| 'en')` | `string` |

| `SearchOptions` | Default | |
|---|---|---|
| `limit` | no limit | Maximum number of results |
| `locale` | `'both'` | `'fa'`, `'en'` or `'both'` |
| `fuzzy` | `false` | Tolerate typos |
| `maxDistance` | `2` | Maximum edit distance with `fuzzy`; capped at a third of the query length |
| `emptyQuery` | `'all'` | What an empty query returns: `'all'` or `'none'` |
| `keyboardFix` | `true` | When nothing matches, retry with the other keyboard layout |

</details>

<details open>
<summary><b>Geography</b></summary>

| Function | Returns |
|---|---|
| `getDistance(from, to)` | km, or `undefined` if either side has no coordinates |
| `getNearestCities(point, options?)` | `{ city, distanceKm }[]`, closest first; options `limit` (5, `0` for all), `minConfidence` (`'low'`), `maxDistanceKm` |
| `getProvinceAt(point, options?)` | `Province \| undefined`; points within `maxDistanceKm` (5) of a border are matched to the nearest province *(boundaries entry)* |
| `getProvinceBoundary(id)` | One GeoJSON feature *(boundaries entry)* |
| `provinceBoundaries` | GeoJSON `FeatureCollection` *(boundaries entry)* |

`from`, `to` and `point` can be a city query or `{ lat, lng }`.

</details>

<details open>
<summary><b>Data versioning</b></summary>

| Export | |
|---|---|
| `DATA_VERSION` | The data version, e.g. `'2.0.0'` |
| `DATA_CHANGES` | Every rename, spelling fix or removal since 1.0 |
| `getDataChanges(sinceVersion?)` | Changes after a version, to update values you stored |

</details>

### TypeScript

```ts
interface Province {
  id: number;                       // 1 – 31
  en: string;                       // 'fars'
  fa: string;                       // 'فارس'
  nameEn: string;                   // 'Fars'
  phoneCode: string;                // '071'
  capitalId: number;
  neighborIds: readonly number[];
  cities: readonly City[];
}

interface City {
  id: number;                       // unique across Iran, never reused
  en: string;                       // 'shiraz'
  fa: string;                       // 'شیراز'
  nameEn: string;                   // 'Shiraz'
  slug: string;                     // 'fars/shiraz'
  isCapital: boolean;
  aliases: readonly string[];
  coordinates?: { lat: number; lng: number; confidence: 'high' | 'medium' | 'low' };
}

interface FlatCity extends City {
  provinceId: number;
  provinceEn: string;
  provinceFa: string;
  provinceNameEn: string;
  phoneCode: string;
}
```

Every type is exported, including `ProvinceListItem`, `SearchOptions`, `NearestCity`, `LatLng`, `ProvinceCityValue`, `CityComboboxProps`, `ProvinceCitySelectProps`, `DataChange` and the API interfaces `IranCities`, `IranCitiesGeo` and `IranCitiesHooks`.

> [!NOTE]
> Provinces, cities and the shared arrays are frozen with `Object.freeze`, so one part of your app can't accidentally change the data for another. Copy before changing: `[...getCities('fars')].sort(...)`. `getProvincesList()`, `getCapitals()`, `getNeighborProvinces()` and the search functions already return new arrays.

## How matching works

**Normalization.** Every lookup and search compares normalized text, so these are treated as equal:

| Treated as the same | |
|---|---|
| `ی` `ي` `ى` `ئ` | `ک` `ك` |
| `ا` `آ` `أ` `إ` `ٱ` | `ه` `ة` `ۀ` |
| `و` `ؤ` | `۰۱۲` `٠١٢` `012` |

Diacritics, tatweel (`ـ`), zero-width non-joiners, spaces, `-`, `_` and apostrophes are ignored, and case doesn't matter.

**Keyboard layout.** When a query finds nothing, it's retried as if it had been typed on the other keyboard layout: `jivhk` → `تهران`, `ساهقشظ` → `shiraz`. Turn this off with `{ keyboardFix: false }`.

**Ranking.** Exact match first, then prefix, then substring, then (with `fuzzy`) edit distance. Equal scores put provincial capitals first, then Persian alphabetical order.

**Shared names.** 25 city names exist in more than one province. Without a province, `getCity(name)` returns the provincial capital, otherwise the better-known city, otherwise the lowest id. When it matters, check `isAmbiguousCityName(name)`, then pass the province or let the user choose from `getCitiesByName(name)`.

**Aliases.** Alternative spellings and old names resolve to the right city: `طهران`, `teheran`, `esfahan`, `mashad`, `orumiyeh`, `صومعه سارا`, `حلاشی`.

## Data and sources

| | |
|---|---:|
| Provinces | 31 |
| Cities | 1,252 |
| Cities with coordinates | 1,152 |
| ↳ `high` confidence | 977 |
| ↳ `medium` confidence | 98 |
| ↳ `low` confidence | 77 |
| Province borders | 74 |

- **`high`**: an independent source confirms the same point.
- **`medium`**: the name is unique in GeoNames and the place is city-like, without independent confirmation.
- **`low`**: only a name match in GeoNames. Good for rough display; errors of several kilometres are possible.

Every coordinate is checked in CI against the province boundaries, and all 1,152 lie inside their own province. For the other 100 cities `coordinates` is `undefined`; no guessed values are filled in ([list and reasons](./reports/coordinates-not-imported.csv)).

Neighbors are computed from the boundaries (a shared border of at least 3 km) and reflect current borders, including the 2013 move of Tabas county from Yazd to South Khorasan.

Ids never change and are never reused. Renamed slugs keep working, and every change is listed in `DATA_CHANGES`.

## Compatibility

Every release is tested in CI against this matrix:

| | Supported |
|---|---|
| Node.js | 14, 16, 18, 20, 22, 24 (CommonJS and ES modules) |
| Deno, Bun | Current versions |
| TypeScript | 3.9 to 7, with `moduleResolution` `node`, `node16` or `bundler` |
| React | 16.8+ (tested with 17, 18 and 19) |
| Next.js | 14, 15, 16 (App Router; Turbopack and webpack) |
| Zod, Valibot | Zod 3.25+ and 4, Valibot 1 |

Any bundler that understands the `exports` field (Vite, webpack, Rollup, Rolldown, esbuild, Turbopack and others) can use the package.

## Contributing

Data corrections are the most valuable contribution; please include a source. See [CONTRIBUTING.md](./CONTRIBUTING.md).

```bash
npm install
npm test              # data validation, TypeScript 7, Oxlint, Vitest
npm run build         # tsdown (Rolldown + Oxc)
npm run test:dist     # smoke test of the built files
```

To publish a new version, update `version` in `package.json` and `CHANGELOG.md`, then run:

```bash
npm publish --access public
```

`npm publish` runs every check first (tests, build, smoke test, package lint and size budget) and stops if any of them fails.

## License and credits

| | Source | License |
|---|---|---|
| Code | This project | [MIT](./LICENSE) |
| Coordinates | [GeoNames](https://www.geonames.org) | CC BY 4.0 |
| Boundaries and neighbors | [geoBoundaries](https://www.geoboundaries.org) / © OpenStreetMap contributors | ODbL 1.0 |

The package's license field is `MIT AND CC-BY-4.0 AND ODbL-1.0`. The ODbL only applies if you redistribute the boundary data itself; see [`NOTICE.md`](./NOTICE.md).

<div align="center">
<sub>Made with ❤️ for Persian developers · <a href="./CHANGELOG.md">Changelog</a> · <a href="./MIGRATION.md">Migration guide</a> · <a href="https://mjavadsf.github.io/Iran-Cities/">Docs</a> · <a href="https://github.com/MJavadSF/Iran-Cities/issues">Issues</a></sub>
</div>
