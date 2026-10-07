English | [فارسی](./README.fa.md)

# @code-plate/iran-cities

A complete, ready-to-use list of **Iran's provinces and cities** (Persian + English), packaged as a lightweight library with no forced dependencies, usable in **any JavaScript/TypeScript project**:

- ✅ React / Next.js (App Router and Pages Router)
- ✅ Vue 2 / Vue 3
- ✅ Angular
- ✅ Svelte
- ✅ Node.js / Express (pure backend)
- ✅ Vanilla JS (browser or any other bundler)

The core of the package has **zero dependencies** and ships as both **CJS** and **ESM**. There's also an optional subpath (`@code-plate/iran-cities/react`) for React users with a few ready-made hooks; if your project isn't React, that file is never imported and React doesn't need to be installed at all.

## Installation

```bash
npm install @code-plate/iran-cities
# or
yarn add @code-plate/iran-cities
# or
pnpm add @code-plate/iran-cities
```

## Data

- `31` provinces
- `1252` cities
- Every record has an `id` (stable numeric identifier), an `en` field (latin, kebab-case identifier, e.g. `tehran`) and an `fa` field (Persian name, e.g. `تهران`).
- Every province has a `phoneCode` (area code) and a `capitalId`; every city has `isCapital`, and province capitals also carry `coordinates: { lat, lng }`.
- City `id`s are **globally unique** (same-named cities such as «Mahabad» in two provinces get different ids) and never change between versions; new cities always get the next id.

---

## Usage in plain JavaScript / TypeScript (and Node.js/Express)

```ts
import {
  getProvinces,
  getProvincesList,
  getProvince,
  getCities,
  getCity,
  getCityById,
  getProvinceById,
  getCitiesByName,
  getAllCities,
  getProvinceOfCity,
  searchProvinces,
  searchCities,
  getStats,
} from '@code-plate/iran-cities';

// All provinces along with their cities
getProvinces();
// [{ id: 1, en: 'alborz', fa: 'البرز', cities: [{ id: 1, en: 'karaj', fa: 'کرج', slug: 'alborz/karaj' }, ...] }, ...]

// Just the list of provinces (no cities) - for a Select/Dropdown
getProvincesList();
// [{ id: 1, en: 'alborz', fa: 'البرز' }, { id: 2, en: 'ardabil', fa: 'اردبیل' }, ...]

// Get a single province by English id or Persian name
getProvince('tehran');
getProvince('تهران'); // same result
getProvince(28);      // numeric id works too (so does the string '28')

// Cities of a specific province
getCities('fars');       // by English id
getCities('فارس');       // or by Persian name, both work the same way

// Find a specific city (across the whole country, or scoped to a province)
getCity('shiraz');
getCity('شیراز', 'fars'); // scoped to Fars province

// Flat list of every city in the country, along with its province
getAllCities();
// [{ id: 1, en: 'karaj', fa: 'کرج', slug: 'alborz/karaj', provinceId: 1, provinceEn: 'alborz', provinceFa: 'البرز' }, ...]

// Look up by id
getCityById(292);     // => Shiraz (provinceId: 7)
getProvinceById(7);   // => Fars

// Duplicate names: every city with that name
getCitiesByName('مهاباد'); // => [Isfahan/Mahabad (id 270), West Azerbaijan/Mahabad (id 1171)]

// Find which province a city belongs to
getProvinceOfCity('اصفهان'); // => { id: 6, en: 'isfahan', fa: 'اصفهان', cities: [...] }
getProvinceOfCity(292);      // city id works too

// Live search (autocomplete) over provinces or cities
searchProvinces('خراسان');             // returns all three "Khorasan" provinces
searchCities('شهر', { limit: 10 });    // first 10 results containing "شهر"
searchCities('mashhad', { locale: 'en' }); // search English names only

// Capital, area code and coordinates
getCapital('khuzestan');        // => { id: 674, en: 'ahvaz', isCapital: true, coordinates: { lat: 31.31901, lng: 48.6842 }, phoneCode: '061', ... }
getCapitals();                  // the 31 provincial capitals
getProvinceByPhoneCode('021');  // => Tehran ('21' and 21 work too)
getCity('نجف‌آباد').phoneCode;  // => '031' (area code of the city's province)
getCity('اهواز').coordinates;   // => { lat, lng, confidence } | undefined for non-capital cities

// Overall stats
getStats(); // { provinceCount: 31, cityCount: 1252 }
```

### A note on search
`getProvince`, `getCities`, `getCity` and `getProvinceOfCity` compare strings in a **normalized** way — differences between Persian «ی» and Arabic «ي», «ک» vs. «ك», zero-width non-joiners, spaces and hyphens are all ignored. So `getCity('كرج')` and `getCity('کرج')` both work.

---

## Usage in Node.js / Express (backend)

```js
const express = require('express');
const { getProvincesList, getCities, searchCities } = require('@code-plate/iran-cities');

const app = express();

app.get('/api/provinces', (req, res) => {
  res.json(getProvincesList());
});

app.get('/api/cities/:province', (req, res) => {
  res.json(getCities(req.params.province));
});

app.get('/api/cities/search', (req, res) => {
  res.json(searchCities(req.query.q ?? '', { limit: 20 }));
});
```

---

## Usage in React / Next.js

An optional subpath is available for React with a few ready-made hooks:

```tsx
import { useProvinces, useCities, useProvinceCitySelect, useCitySearch } from '@code-plate/iran-cities/react';

function AddressForm() {
  const { provinces, cities, province, setProvince, city, setCity, provinceId, cityId, selectedCity } =
    useProvinceCitySelect();

  // On submit, send { provinceId, cityId } to your backend.
  // selectedCity => { id, en, fa, slug, provinceId, provinceEn, provinceFa }

  return (
    <>
      <select value={province} onChange={(e) => setProvince(e.target.value)}>
        <option value="">Select a province</option>
        {provinces.map((p) => (
          <option key={p.id} value={p.en}>{p.fa}</option>
        ))}
      </select>

      <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!province}>
        <option value="">Select a city</option>
        {cities.map((c) => (
          <option key={c.id} value={c.en}>{c.fa}</option>
        ))}
      </select>
    </>
  );
}
```

Live city search (autocomplete):

```tsx
import { useCitySearch } from '@code-plate/iran-cities/react';

function CityAutocomplete() {
  const { query, setQuery, results } = useCitySearch('', { limit: 8 });

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="City name..." />
      <ul>
        {results.map((c) => (
          <li key={c.id}>{c.fa} ({c.provinceFa})</li>
        ))}
      </ul>
    </div>
  );
}
```

Hooks available in the `react` subpath:

| Hook | Purpose |
|---|---|
| `useProvinces()` | List of provinces |
| `useCities(provinceQuery)` | Cities of a province, reacts to changes in the parameter |
| `useProvinceCitySelect()` | Full state + logic for a province→city form field (auto-resets the city when the province changes); also returns `provinceId`, `cityId`, `selectedProvince`, `selectedCity` and `reset()` |
| `useCitySearch(initialQuery?, options?)` | Live city search state |
| `useProvinceSearch(initialQuery?, options?)` | Live province search state |

> If your project is Vue, Angular, or anything else, just use the main entry point (`@code-plate/iran-cities`) and plug the raw functions (`getProvinces`, `getCities`, ...) into your own computed/signal/observable — no extra tooling required.

---

## Usage in Vue 3 (example)

```vue
<script setup>
import { ref, computed } from 'vue';
import { getProvincesList, getCities } from '@code-plate/iran-cities';

const provinces = getProvincesList();
const selectedProvince = ref('');
const cities = computed(() => getCities(selectedProvince.value));
</script>

<template>
  <select v-model="selectedProvince">
    <option v-for="p in provinces" :key="p.en" :value="p.en">{{ p.fa }}</option>
  </select>
  <select :disabled="!selectedProvince">
    <option v-for="c in cities" :key="c.en" :value="c.en">{{ c.fa }}</option>
  </select>
</template>
```

## Usage in Angular (example service)

```ts
import { Injectable } from '@angular/core';
import { getProvincesList, getCities, type City } from '@code-plate/iran-cities';

@Injectable({ providedIn: 'root' })
export class IranLocationsService {
  getProvinces() {
    return getProvincesList();
  }
  getCitiesOf(provinceEn: string): City[] {
    return getCities(provinceEn);
  }
}
```

---

## Full API

### Core functions (import from `'@code-plate/iran-cities'`)

| Function | Input | Output | Description |
|---|---|---|---|
| `getProvinces()` | - | `Province[]` | All provinces with their cities |
| `getProvincesList()` | - | `{id, en, fa}[]` | Provinces only |
| `getCapital(provinceQuery)` | `string \| number` | `FlatCity \| undefined` | Capital of a province |
| `getCapitals()` | - | `FlatCity[]` | The 31 provincial capitals |
| `getProvinceByPhoneCode(code)` | `string \| number` | `Province \| undefined` | Province by area code |
| `getProvinceById(id)` | `number` | `Province \| undefined` | Province by id |
| `getCityById(id)` | `number` | `FlatCity \| undefined` | City by global id |
| `getCitiesByName(name)` | `string` | `FlatCity[]` | Every city with that name (for duplicate names) |
| `getProvince(query)` | `string \| number` | `Province \| undefined` | A province by en or fa |
| `getCities(provinceQuery)` | `string \| number` | `City[]` | Cities of a province |
| `getCity(cityQuery, provinceQuery?)` | `string \| number, (string \| number)?` | `FlatCity \| undefined` | A specific city |
| `getAllCities()` | - | `FlatCity[]` | All cities, flattened |
| `getProvinceOfCity(cityQuery)` | `string \| number` | `Province \| undefined` | The province a city belongs to |
| `searchProvinces(query, options?)` | `string, SearchOptions?` | `Province[]` | Fuzzy province search |
| `searchCities(query, options?)` | `string, SearchOptions?` | `FlatCity[]` | Fuzzy city search |
| `getStats()` | - | `{provinceCount, cityCount}` | Overall stats |

`SearchOptions`: `{ limit?: number; locale?: 'en' | 'fa' | 'both' }`

### Types

```ts
interface Coordinates { lat: number; lng: number; confidence: 'high' | 'medium' | 'low'; }
interface City { id: number; isCapital: boolean; coordinates?: Coordinates; slug: string; en: string; fa: string; }
interface Province { id: number; en: string; fa: string; phoneCode: string; capitalId: number; cities: City[]; }
interface FlatCity extends City { provinceId: number; provinceEn: string; provinceFa: string; phoneCode: string; }
```

---

## Development

```bash
npm install
npm run build     # outputs dist/ (cjs + esm + d.ts)
npm run typecheck
npm run validate  # data integrity checks for data.json (ids, slugs, capitals, area codes, coordinates)
npm test          # validate + typecheck
```

> **Coordinates:** available for 1152 of 1252 cities (`coordinates: { lat, lng, confidence }`). `confidence` has three levels: `'high'` (977 cities) – an independent source confirms the same point; `'medium'` (98) – the name is unique in GeoNames and the place is city-like, but no independent confirmation; `'low'` (77) – only a name match in GeoNames, where the matched place is small/unpopulated or the name match was approximate (approximate display only; errors of several to tens of km are possible). For the remaining 100 cities `coordinates` is `undefined`; no approximate values are filled in (list and reasons: `reports/coordinates-not-imported.csv`). Data source: GeoNames (CC BY 4.0), see `NOTICE.md`.

## License

MIT
