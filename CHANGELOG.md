# Changelog

## 2.0.0

See [MIGRATION.md](./MIGRATION.md) ([فارسی](./MIGRATION.fa.md)) for upgrade steps. Supported Node.js (14+), React (16.8+) and TypeScript (3.9+) versions are unchanged.

### Breaking
- Provinces, cities, coordinates and the shared arrays returned by `getProvinces()`, `getAllCities()`, `getCities()` and `getCitiesByName()` are frozen and typed as `readonly`. Functions that returned fresh arrays in 1.x still do, and identities that were stable in 1.x are still stable.
- `getCity(name)` / `getProvinceOfCity(name)` without a province prefer the provincial capital, then the better-known city, for names shared by several provinces. The result changed for 7 names: سردشت, شهریار, مهاباد, رضوانشهر, حاجی آباد, اردکان, چناران.
- New required fields: `City.nameEn`, `City.aliases`, `FlatCity.provinceNameEn`, `Province.nameEn`, `Province.neighborIds`, `ProvinceListItem.nameEn` (affects hand-written objects in TypeScript only).
- 25 Persian city names written with Arabic «ي»/«ك» now use Persian «ی»/«ک» (e.g. `كدكن` → `کدکن`). Lookups with either spelling still work; the changes are listed in `getDataChanges('1.2.0')`.

### Added
- Neighboring provinces: `getNeighborProvinces()`, `areNeighborProvinces()`, `Province.neighborIds`.
- `@code-plate/iran-cities/boundaries`: province boundaries as GeoJSON, `getProvinceAt({ lat, lng })` and `getProvinceBoundary(id)`.
- Components: `CityCombobox` (WAI-ARIA combobox) and `ProvinceCitySelect` in `/react/components` and `/lite/react/components`, styled by the plain-CSS `@code-plate/iran-cities/components.css` (CSS variables, dark mode, RTL, `:where()` selectors).
- Validation: `@code-plate/iran-cities/zod` and `@code-plate/iran-cities/valibot` with `provinceIdSchema`, `cityIdSchema`, `provinceSchema`, `citySchema`, `provinceCitySchema` and custom messages.
- Search fixes text typed with the wrong keyboard layout (`jivhk` → تهران) and exports `convertKeyboardLayout()`; opt out with `keyboardFix: false`.
- English display names: `nameEn` (e.g. `Kohgiluyeh and Boyer-Ahmad`, `Bandar-e Gaz`) and `provinceNameEn`.
- `DATA_VERSION`, `DATA_CHANGES` and `getDataChanges(sinceVersion)`.
- `@code-plate/iran-cities/data/*`: CSV, JSON, SQL (PostgreSQL, MySQL, MariaDB, SQLite) and GeoJSON copies of the data.
- `@code-plate/iran-cities/lite` and `/lite/react`: same API without coordinates.
- `getDistance()`, `getNearestCities()`, `isAmbiguousCityName()`, `normalize()`, `SearchOptions.emptyQuery`.
- `useProvinceCitySelect({ initialProvince, initialCity, value, onChange })`.
- Documentation site with a live playground and an interactive map.

### Changed
- Data is stored in a packed columnar format: the data inside the bundle is about 20% smaller (brotli) and parses faster.
- Normalization unifies «آ/أ/إ/ٱ», «ة/ۀ», «ؤ», «ى/ئ», strips diacritics, tatweel and apostrophes, and reads Persian/Arabic digits.
- Fuzzy search caps allowed typos at a third of the query length and also matches typos at the start of longer names.
- Search ties are broken by capital first, then Persian alphabetical order.
- Invalid input (`undefined`, `null`, `NaN`, negative `limit`) no longer throws.
- React entries share the core instead of bundling their own copy of the data, and start with `"use client"`.
- Build moved from tsup (esbuild) to tsdown (Rolldown + Oxc), TypeScript 7 and `isolatedDeclarations`; `exports` serves `.d.mts` / `.d.cts`, and a plain `.d.ts` set keeps TypeScript 3.9 to 4.6 working.
- Package license field is `MIT AND CC-BY-4.0 AND ODbL-1.0` to reflect the data sources.

### Fixed
- 25 city names used Arabic letters (see Breaking).
- geoBoundaries labels Bandar-e Gaz county as Mazandaran; it is assigned to Golestan.
- README said only provincial capitals have coordinates; 1152 cities do.
- `allowScripts` in `package.json` is kept (it is npm's install-script allowlist); its stale `esbuild` entry was dropped because esbuild is no longer a dependency.

### Tooling
- Vitest unit, component, accessibility (axe-core) and property-based (fast-check) tests with coverage thresholds.
- CI on Node.js 14–24, Deno, Bun, TypeScript 3.9–7 and Next.js 14–16; Oxlint, publint, Are The Types Wrong and size-limit budgets.
- OpenSSF Scorecard and Dependabot.

## 1.2.0
- **Added:** numeric `id` for provinces and cities (globally unique, stable); `isCapital`, `capitalId`, province `phoneCode`.
- **Added:** `coordinates: { lat, lng, confidence }` for 1152 cities (GeoNames, CC BY 4.0); `confidence` is `'high' | 'medium' | 'low'`.
- **Added:** `getCityById`, `getProvinceById`, `getCitiesByName`, `getCapital`, `getCapitals`, `getProvinceByPhoneCode`; lookups accept numeric ids.
- **Added:** `npm run validate` data-integrity checks.
- **Fixed:** duplicate «گلوگاه» entry in Mazandaran removed (1253 -> 1252 cities); `useCitySearch` / `useProvinceSearch` no longer re-run on inline `options`.
- **Corrected data (old names/slugs still resolve):** city 402 `sowme'eh-sara` -> `sowmeeh-sara` (fa: صومعه سرا); city 672 `هلشی` -> `halashi` (fa: هلشی). Ids unchanged.
- **Corrected coordinates:** Ahvaz and Kermanshah capital coordinates fixed (source table was ~110 km / ~60 km off).
