English | [فارسی](./MIGRATION.fa.md)

# Migrating from 1.x to 2.0

Version 2.0 is mostly a drop-in upgrade. Plain JavaScript code, Node.js/Express backends and typical React/Next.js forms keep working without any change. This guide lists **every** difference that can affect existing code, how to find out whether your project is affected, and the exact fix.

Each item was verified by running the same calls against the 1.2.0 build and the 2.0.0 build.

## Contents

- [Quick checklist](#quick-checklist)
- [What did not change](#what-did-not-change)
- [Breaking changes](#breaking-changes)
  - [1. Returned data is frozen and array types are `readonly`](#1-returned-data-is-frozen-and-array-types-are-readonly)
  - [2. `getCity(name)` picks a different city for 7 shared names](#2-getcityname-picks-a-different-city-for-7-shared-names)
  - [3. New required fields on the data types](#3-new-required-fields-on-the-data-types)
  - [4. 25 Persian names now use Persian letters](#4-25-persian-names-now-use-persian-letters)
- [Behaviour changes that are not breaking](#behaviour-changes-that-are-not-breaking)
- [New features you can adopt](#new-features-you-can-adopt)
- [Next.js](#nextjs)
- [Finding affected code](#finding-affected-code)
- [FAQ](#faq)

## Quick checklist

1. `npm install @code-plate/iran-cities@^2`
2. Run your TypeScript compiler. Errors of the form `TS4104: The type 'readonly City[]' is 'readonly' and cannot be assigned to the mutable type 'City[]'` are [item 1](#1-returned-data-is-frozen-and-array-types-are-readonly); `Property 'aliases' is missing` (or `nameEn`, `neighborIds`, `provinceNameEn`) is [item 3](#3-new-required-fields-on-the-data-types).
3. Search your code for code that **modifies** data returned by the package (`.sort(`, `.push(`, `.splice(`, `.reverse(`, assignments to `city.xxx =`). See [Finding affected code](#finding-affected-code).
4. If you call `getCity()` or `getProvinceOfCity()` with a name but without a province, check the [7 names](#2-getcityname-picks-a-different-city-for-7-shared-names).
5. If you compare `city.fa` with Persian names stored in your database, check [item 4](#4-25-persian-names-now-use-persian-letters).
6. Optional: switch client components to `@code-plate/iran-cities/lite/react` to cut the client bundle by about a third.

## What did not change

- **Supported Node.js versions:** `engines.node` is still `>=14`. The published files are tested on Node.js 14, 16, 18, 20, 22 and 24, as CommonJS and as ES modules.
- **Supported TypeScript versions:** the type declarations work from TypeScript 3.9 up to 7.x, with `moduleResolution` set to `node`/`node10`, `node16`/`nodenext` or `bundler`.
- **React peer dependency:** still `>=16.8.0`, still optional.
- **Import paths:** `@code-plate/iran-cities` and `@code-plate/iran-cities/react` are unchanged. Two subpaths were added; none were removed.
- **Every 1.x function and every exported type still exists** with the same name and the same parameters.
- **Ids, slugs and data:** city and province ids, English ids, slugs, area codes and coordinates are identical to 1.2.0. Persian names are identical too, except 25 that now use Persian letters ([item 4](#4-25-persian-names-now-use-persian-letters)). Old slugs and names that 1.2.0 already accepted (`gilan/sowme'eh-sara`, `kermanshah/هلشی`, `حلاشی`) still resolve.
- **Object shapes:** `Province`, `City`, `FlatCity`, `ProvinceListItem` and `Coordinates` keep every field they had. A few fields were added ([item 3](#3-new-required-fields-on-the-data-types)).
- **Arrays that were fresh in 1.x are still fresh and mutable:** `getProvincesList()`, `getCapitals()`, `searchCities()` and `searchProvinces()` return a new array on every call, which you can sort or change freely, exactly as in 1.x.
- **Arrays that were shared in 1.x keep the same identity:** `getProvinces()`, `getAllCities()`, `getCities(...)` and `getCitiesByName(...)` return the same array on every call, as in 1.x, so they stay safe to use in React dependency arrays.
- **React hooks:** same names, same return fields (`province`, `city`, `setProvince`, `setCity`, `provinceId`, `cityId`, `selectedProvince`, `selectedCity`, `reset`, `query`, `setQuery`, `results`). `setQuery` still accepts an updater function.

## Breaking changes

### 1. Returned data is frozen and array types are `readonly`

**What changed.** In 1.x the package handed out its internal arrays and objects. Changing them (for example `getCities('fars').sort(...)`) silently corrupted the data for every other part of your application, including other requests on the same server. In 2.0 all provinces, cities and coordinates are frozen with `Object.freeze`, and the shared arrays are typed as `readonly`.

Affected values:

| Value | 1.x type | 2.0 type |
|---|---|---|
| `getProvinces()` | `Province[]` | `readonly Province[]` |
| `getCities(province)` | `City[]` | `readonly City[]` |
| `getAllCities()` | `FlatCity[]` | `readonly FlatCity[]` |
| `getCitiesByName(name)` | `FlatCity[]` | `readonly FlatCity[]` |
| `Province.cities` | `City[]` | `readonly City[]` |
| `useCities(province)` | `City[]` | `readonly City[]` |
| Each `Province`, `City`, `FlatCity`, `Coordinates` object | mutable | frozen, properties typed `readonly` |

Not affected: `getProvincesList()`, `getCapitals()`, `searchCities()`, `searchProvinces()`, `useProvinces()` and the search hooks still return fresh, mutable arrays. The objects returned by `getProvincesList()` and `useProvinces()` are fresh as well and can be modified.

**How it shows up.**

- TypeScript: `error TS4104: The type 'readonly City[]' is 'readonly' and cannot be assigned to the mutable type 'City[]'`, or `Cannot assign to 'fa' because it is a read-only property`.
- At runtime, in ES modules, TypeScript output and any `'use strict'` code (this includes Next.js, Vite and webpack builds): `TypeError: Cannot assign to read only property ...` or `Cannot add property ..., object is not extensible`.
- At runtime, in non-strict CommonJS: the change is silently ignored.

**How to fix.**

Change the type annotation if you only read the value:

```ts
// 1.x
const cities: City[] = getCities('fars');
// 2.0
const cities: readonly City[] = getCities('fars');
```

Copy the array before sorting or changing it:

```ts
// 1.x (also changed the shared data for everyone)
const sorted = getCities('fars').sort((a, b) => a.fa.localeCompare(b.fa, 'fa'));
// 2.0
const sorted = [...getCities('fars')].sort((a, b) => a.fa.localeCompare(b.fa, 'fa'));
```

Copy the objects before changing their fields:

```ts
// 1.x
const cities = getCities('fars');
cities.forEach((c) => { (c as any).label = c.fa; });
// 2.0
const cities = getCities('fars').map((c) => ({ ...c, label: c.fa }));
```

If you pass the value to an API that expects a mutable array, copy it at the call site: `someFn([...getAllCities()])`.

If a third-party library mutates the objects you give it (some table and select components do), pass a deep copy: `structuredClone(getProvinces())` (Node.js 17+ and all current browsers) or `JSON.parse(JSON.stringify(getProvinces()))`.

### 2. `getCity(name)` picks a different city for 7 shared names

**What changed.** 25 city names exist in more than one province. When you look up such a name **without** a province, 1.x returned the one with the lowest id, which was often a small town. 2.0 returns:

1. the provincial capital, if one of them is a capital; otherwise
2. the city marked as the well-known one in the data; otherwise
3. the one with the lowest id (same as 1.x).

This affects `getCity(name)` and `getProvinceOfCity(name)` only. Lookups by id, by slug, or with a province (`getCity(name, province)`) are unchanged. `getCitiesByName(name)` is unchanged and still returns every match, ordered by id.

The complete list of lookups whose result changed (Persian and English names behave the same):

| Name | 1.x result | 2.0 result |
|---|---|---|
| `سردشت` / `sardasht` | Chaharmahal and Bakhtiari (id 104) | West Azerbaijan (id 1179) |
| `شهریار` / `shahriar` | East Azerbaijan (id 184) | Tehran (id 1132) |
| `مهاباد` / `mahabad` | Isfahan (id 270) | West Azerbaijan (id 1171) |
| `رضوانشهر` / `rezvanshahr` | Isfahan (id 279) | Gilan (id 408) |
| `حاجی آباد` / `hajjiabad` | Fars (id 312) | Hormozgan (id 512) |
| `اردکان` / `ardakan` | Fars (id 322) | Yazd (id 1212) |
| `چناران` / `chenaran` | North Khorasan (id 928) | Razavi Khorasan (id 975) |

**Who is affected.** Only code that calls `getCity()` or `getProvinceOfCity()` with one of these names and **without** a province, and depends on which city comes back, for example code that converts free-text input to an id and stores it.

**How to fix.** In order of preference:

```ts
// Best: pass the province whenever you have it (result is unambiguous, same in 1.x and 2.0)
getCity('مهاباد', 'isfahan');

// Or store and look up ids instead of names
getCityById(270);

// Or detect ambiguous names and let the user choose
if (isAmbiguousCityName(input)) {
  const options = getCitiesByName(input);
}

// Exact 1.x behaviour (lowest id wins)
const city = getCitiesByName(name)[0] ?? getCity(name);
```

If you stored ids that were produced by name-only lookups of these 7 names with 1.x, they still point to the same cities as before; nothing changes for stored data. Only new lookups return the other city.

### 3. New required fields on the data types

**What changed.** These fields were added and are always present:

| Type | New fields |
|---|---|
| `City` | `nameEn` (English display name, e.g. `'Bandar-e Gaz'`), `aliases` (other spellings and old names) |
| `FlatCity` | the two above, plus `provinceNameEn` |
| `Province` | `nameEn`, `neighborIds` |
| `ProvinceListItem` | `nameEn` |

**Who is affected.** Only TypeScript code that **creates** these objects by hand, typically test fixtures and mocks:

```
error TS2741: Property 'nameEn' is missing in type '{ ... }' but required in type 'City'.
```

**How to fix.** Add the fields:

```ts
const mockCity: City = { id: 1, isCapital: true, slug: 'alborz/karaj', en: 'karaj', fa: 'کرج', nameEn: 'Karaj', aliases: [] };
```

Or build fixtures from real data, which always stays in sync with the types: `const mockCity = getCityById(1)!;`

### 4. 25 Persian names now use Persian letters

**What changed.** In 1.x, 25 city names were written with the Arabic letters «ي» and «ك» instead of the Persian «ی» and «ک», for example `كدكن` and `اسفرورين`. They looked wrong in lists and sorted in the wrong place. In 2.0 they use Persian letters: `کدکن`, `اسفرورین`. Ids, English ids and slugs did not change.

**Who is affected.** Only code that compares `city.fa` **as a plain string** with a value saved from 1.x, for example a database column of Persian names. Lookups are not affected: `getCity('كدكن')` still finds the city, because every lookup normalizes both letters.

**How to fix.** Compare ids instead of names, or compare normalized text:

```ts
import { normalize, getDataChanges } from '@code-plate/iran-cities';

normalize(savedName) === normalize(city.fa);

for (const change of getDataChanges('1.2.0')) {
  if (change.type === 'spelling') {
    await db.query('UPDATE addresses SET city_fa = $1 WHERE city_id = $2', [change.after?.fa, change.cityId]);
  }
}
```

`getDataChanges('1.2.0')` lists all 25 changes with the old and new spelling.

## Behaviour changes that are not breaking

These changes can alter search results, mostly by finding a city where 1.x found nothing, by reordering equally ranked results, or by dropping weak fuzzy matches.

| Area | 1.x | 2.0 |
|---|---|---|
| Normalization | `ي→ی`, `ك→ک`, ignores spaces, ZWNJ and `-` | Also `ى/ئ→ی`, `آ/أ/إ/ٱ→ا`, `ة/ۀ→ه`, `ؤ→و`; ignores diacritics, tatweel `ـ`, `_` and apostrophes; reads Persian and Arabic digits. `getCity('ابادان')` and `getProvince('۲۸')` now work. |
| Aliases | Not supported | `getCity('طهران')`, `getCity('esfahan')`, `getCity('mashad')`, `getCity('orumiyeh')`, `getCity('teheran')`, `getCity('urumieh')` now return a city instead of `undefined`. |
| Area codes | `'021'`, `'21'`, `21` | Also `'۰۲۱'`, `'+9821'`, `'+98 21'` and `'0098 21'`. |
| Search ranking | Equal scores kept data order | Equal scores: provincial capitals first, then Persian alphabetical order. Because of the wider normalization and the new aliases, a query can also match a few more cities than before. |
| Fuzzy search (`fuzzy: true`) | Allowed 2 typos for any query, so short queries matched unrelated names (`تهرن` also returned `اهر`, `بهمن`) | Allowed typos are capped at a third of the query length (`تهرن` returns only `تهران`), and typos at the start of longer names are matched too. |
| Wrong keyboard layout | `searchCities('jivhk')` returned nothing | Returns `تهران`: when nothing matches, the query is retried as if typed on the other layout. Turn off with `{ keyboardFix: false }`. |
| Invalid input | `getCity(undefined)`, `searchCities(null)` and similar threw `TypeError` | Return `undefined`, an empty array or all items, as for an empty string. |
| `limit` option | A negative `limit` dropped items from the end | A negative or zero `limit` means no limit. |
| `useProvinceCitySelect` | Kept the selected English names in state | Keeps ids in state. Returned values are the same. A city that does not belong to the selected province is now ignored. |
| `@code-plate/iran-cities/react` | Contained its own copy of all data (about 238 KB unminified) | Reuses the main entry. Apps that import both no longer ship the data twice, and both share one instance. |
| `react` and `lite/react` | No directive | Start with `"use client"`, so Next.js App Router treats them as client modules. |

## New features you can adopt

- `@code-plate/iran-cities/lite` and `@code-plate/iran-cities/lite/react`: the same API without coordinates, about a third smaller. Ideal for province/city pickers.
- Accessible components with a plain-CSS theme: `CityCombobox` and `ProvinceCitySelect` from `@code-plate/iran-cities/lite/react/components`, styled by `@code-plate/iran-cities/components.css`.
- Validation schemas for Zod (`/zod`) and Valibot (`/valibot`), including a check that the city belongs to the province.
- Neighboring provinces: `getNeighborProvinces(query)`, `areNeighborProvinces(a, b)` and `Province.neighborIds`.
- Province boundaries as GeoJSON and `getProvinceAt({ lat, lng })` from `@code-plate/iran-cities/boundaries`.
- English display names: `nameEn` on provinces and cities, `provinceNameEn` on flat cities.
- `convertKeyboardLayout(text, 'fa' | 'en')`, `DATA_VERSION`, `DATA_CHANGES` and `getDataChanges(sinceVersion)`.
- CSV, SQL, JSON and GeoJSON copies of the data in `@code-plate/iran-cities/data/*`.
- `getDistance(from, to)` and `getNearestCities(point, { limit, minConfidence, maxDistanceKm })`.
- `isAmbiguousCityName(name)` and `normalize(text)`.
- `searchCities(query, { emptyQuery: 'none' })` returns `[]` for an empty query instead of all 1252 cities.
- `useProvinceCitySelect({ initialProvince, initialCity })` for edit forms, and `useProvinceCitySelect({ value, onChange })` for controlled use with react-hook-form, Formik and similar libraries.
- New exported types: `IranCities`, `IranCitiesGeo`, `IranCitiesHooks`, `LatLng`, `CoordinateConfidence`, `NearestCity`, `NearestCitiesOptions`, `Stats`, `ProvinceCityValue`, `ProvinceCitySelectOptions`, `ProvinceCitySelect`, `SearchState`, `CityComboboxProps`, `ProvinceCitySelectProps`, `DataChange`, `DataChangeType`, `KeyboardTarget`.

## Next.js

Nothing has to change in a Next.js project. Recommended improvements:

```tsx
// app/page.tsx (Server Component): use the core entry directly
import { getCity, getProvincesList } from '@code-plate/iran-cities';

// app/address-form.tsx (Client Component): use the lite hooks
'use client';
import { useProvinceCitySelect } from '@code-plate/iran-cities/lite/react';
```

- The hook entries already contain `"use client"`. You still need `'use client'` in your own component file that calls the hooks, as with any hook.
- Use `lite/react` in client components unless the browser needs coordinates. This keeps about 8 KB (brotli) out of the client bundle.
- Data returned on the server can be passed to Client Components as props; frozen objects serialize normally.
- Verified with Next.js 14 (webpack, React 18), Next.js 15 (webpack) and Next.js 16 (Turbopack and webpack, React 19), App Router, static rendering and `next start`.

## Finding affected code

```bash
# Values that may be mutated (check each hit)
grep -rnE "get(Provinces|AllCities|Cities|CitiesByName)\([^)]*\)\.(sort|push|pop|shift|unshift|splice|reverse|fill|copyWithin)\(" src

# Name-only lookups of the 7 changed names
grep -rnE "get(City|ProvinceOfCity)\(['\"](سردشت|sardasht|شهریار|shahriar|مهاباد|mahabad|رضوانشهر|rezvanshahr|حاجی ?آباد|hajjiabad|اردکان|ardakan|چناران|chenaran)['\"]\)" src

# Hand-written City objects
grep -rnE ":\s*(Flat)?City\s*=\s*\{" src
```

Running your test suite in strict mode (any ESM or TypeScript test runner) turns accidental mutations into `TypeError`s, which makes them easy to find.

## FAQ

**Can I keep using 1.x?** Yes. 1.x keeps working, but it will not get data fixes or new features.

**Why freeze the data instead of returning copies everywhere?** The functions that return shared arrays did so in 1.x too, and many apps rely on their identity being stable (for example in `useMemo` or `useEffect` dependencies). Copying on every call would have changed that and caused extra renders. Freezing keeps identity and makes accidental mutation visible instead of silently corrupting data. Functions that returned fresh arrays in 1.x still do.

**Did ids or slugs change?** No. Stored ids and slugs from 1.x stay valid.

**Does 2.0 need a newer Node.js, React or TypeScript?** No. The minimums are the same as in 1.x: Node.js 14, React 16.8, and TypeScript 3.9 for the type declarations.
