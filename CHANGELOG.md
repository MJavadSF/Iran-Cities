# Changelog

## 1.2.0
- **Added:** numeric `id` for provinces and cities (globally unique, stable); `isCapital`, `capitalId`, province `phoneCode`.
- **Added:** `coordinates: { lat, lng, confidence }` for 1152 cities (GeoNames, CC BY 4.0); `confidence` is `'high' | 'medium' | 'low'`.
- **Added:** `getCityById`, `getProvinceById`, `getCitiesByName`, `getCapital`, `getCapitals`, `getProvinceByPhoneCode`; lookups accept numeric ids.
- **Added:** `npm run validate` data-integrity checks.
- **Fixed:** duplicate «گلوگاه» entry in Mazandaran removed (1253 -> 1252 cities); `useCitySearch` / `useProvinceSearch` no longer re-run on inline `options`.
- **Corrected data (old names/slugs still resolve):** city 402 `sowme'eh-sara` -> `sowmeeh-sara` (fa: صومعه سرا); city 672 `هلشی` -> `halashi` (fa: هلشی). Ids unchanged.
- **Corrected coordinates:** Ahvaz and Kermanshah capital coordinates fixed (source table was ~110 km / ~60 km off).
