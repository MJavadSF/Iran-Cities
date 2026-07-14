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
- `1253` cities
- Every record has an `en` field (latin, kebab-case identifier, e.g. `tehran`) and an `fa` field (Persian name, e.g. `تهران`).

---

## Usage in plain JavaScript / TypeScript (and Node.js/Express)

```ts
import {
  getProvinces,
  getProvincesList,
  getProvince,
  getCities,
  getCity,
  getAllCities,
  getProvinceOfCity,
  searchProvinces,
  searchCities,
  getStats,
} from '@code-plate/iran-cities';

// All provinces along with their cities
getProvinces();
// [{ en: 'alborz', fa: 'البرز', cities: [{ en: 'karaj', fa: 'کرج' }, ...] }, ...]

// Just the list of provinces (no cities) - for a Select/Dropdown
getProvincesList();
// [{ en: 'alborz', fa: 'البرز' }, { en: 'ardabil', fa: 'اردبیل' }, ...]

// Get a single province by English id or Persian name
getProvince('tehran');
getProvince('تهران'); // same result

// Cities of a specific province
getCities('fars');       // by English id
getCities('فارس');       // or by Persian name, both work the same way

// Find a specific city (across the whole country, or scoped to a province)
getCity('shiraz');
getCity('شیراز', 'fars'); // scoped to Fars province

// Flat list of every city in the country, along with its province
getAllCities();
// [{ en: 'karaj', fa: 'کرج', provinceEn: 'alborz', provinceFa: 'البرز' }, ...]

// Find which province a city belongs to
getProvinceOfCity('اصفهان'); // => { en: 'isfahan', fa: 'اصفهان', cities: [...] }

// Live search (autocomplete) over provinces or cities
searchProvinces('خراسان');             // returns all three "Khorasan" provinces
searchCities('شهر', { limit: 10 });    // first 10 results containing "شهر"
searchCities('mashhad', { locale: 'en' }); // search English names only

// Overall stats
getStats(); // { provinceCount: 31, cityCount: 1253 }
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
  const { provinces, cities, province, setProvince, city, setCity } = useProvinceCitySelect();

  return (
    <>
      <select value={province} onChange={(e) => setProvince(e.target.value)}>
        <option value="">Select a province</option>
        {provinces.map((p) => (
          <option key={p.en} value={p.en}>{p.fa}</option>
        ))}
      </select>

      <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!province}>
        <option value="">Select a city</option>
        {cities.map((c) => (
          <option key={c.en} value={c.en}>{c.fa}</option>
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
          <li key={`${c.provinceEn}-${c.en}`}>{c.fa} ({c.provinceFa})</li>
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
| `useProvinceCitySelect()` | Full state + logic for a province→city form field (auto-resets the city when the province changes) |
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
| `getProvincesList()` | - | `{en, fa}[]` | Provinces only |
| `getProvince(query)` | `string` | `Province \| undefined` | A province by en or fa |
| `getCities(provinceQuery)` | `string` | `City[]` | Cities of a province |
| `getCity(cityQuery, provinceQuery?)` | `string, string?` | `FlatCity \| undefined` | A specific city |
| `getAllCities()` | - | `FlatCity[]` | All cities, flattened |
| `getProvinceOfCity(cityQuery)` | `string` | `Province \| undefined` | The province a city belongs to |
| `searchProvinces(query, options?)` | `string, SearchOptions?` | `Province[]` | Fuzzy province search |
| `searchCities(query, options?)` | `string, SearchOptions?` | `FlatCity[]` | Fuzzy city search |
| `getStats()` | - | `{provinceCount, cityCount}` | Overall stats |

`SearchOptions`: `{ limit?: number; locale?: 'en' | 'fa' | 'both' }`

### Types

```ts
interface City { en: string; fa: string; }
interface Province { en: string; fa: string; cities: City[]; }
interface FlatCity extends City { provinceEn: string; provinceFa: string; }
```

---

## Development

```bash
npm install
npm run build     # outputs dist/ (cjs + esm + d.ts)
npm run typecheck
```

## License

MIT
