<div align="center" dir="rtl">

[English](./README.md) · فارسی

# 🇮🇷 شهرهای ایران

**همه‌ی استان‌ها و شهرهای ایران، به فارسی و انگلیسی، با جستجوی سریع و هوشمند، مختصات، مرز استان‌ها و کامپوننت‌های آماده.**

بدون وابستگی · tree-shakeable · تایپ کامل · ساخته‌شده برای Next.js

[![npm version](https://img.shields.io/npm/v/@code-plate/iran-cities?color=0a7f5a&label=npm)](https://www.npmjs.com/package/@code-plate/iran-cities)
[![npm downloads](https://img.shields.io/npm/dm/@code-plate/iran-cities?color=0a7f5a)](https://www.npmjs.com/package/@code-plate/iran-cities)
[![CI](https://github.com/MJavadSF/Iran-Cities/actions/workflows/ci.yml/badge.svg)](https://github.com/MJavadSF/Iran-Cities/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/MJavadSF/Iran-Cities/badge)](https://scorecard.dev/viewer/?uri=github.com/MJavadSF/Iran-Cities)
[![types](https://img.shields.io/badge/types-included-3178c6)](#typescript)

**[مستندات](https://mjavadsf.github.io/Iran-Cities/fa/)** · **[زمین بازی زنده](https://mjavadsf.github.io/Iran-Cities/fa/playground/)** · **[نقشه](https://mjavadsf.github.io/Iran-Cities/fa/guides/geography/)**

</div>

<div dir="rtl">

```ts
import { getCity, searchCities, getNeighborProvinces } from '@code-plate/iran-cities';

getCity('شيراز');              // { id: 292, fa: 'شیراز', nameEn: 'Shiraz', provinceFa: 'فارس', phoneCode: '071', ... }
searchCities('jivhk');          // [تهران]  با کیبورد انگلیسی تایپ شده
getNeighborProvinces('قم');     // [اصفهان، مرکزی، سمنان، تهران]
```

<table dir="rtl">
<tr>
<td width="33%" valign="top">

### 📍 کامل
**۳۱** استان و **۱۲۵۲** شهر با id ثابت، نام فارسی و انگلیسی، کد تلفن، مرکز استان، استان‌های همسایه و مختصات **۱۱۵۲** شهر که همگی با مرز استان‌ها بررسی شده‌اند.

</td>
<td width="33%" valign="top">

### 🔎 فارسی‌فهم
«ي/ی»، «ك/ک»، «آ/ا»، نیم‌فاصله، اعراب و ارقام فارسی را می‌شناسد، غلط تایپی را تحمل می‌کند و متنی را که با کیبورد اشتباه تایپ شده خودش درست می‌کند.

</td>
<td width="33%" valign="top">

### ⚡ آماده‌ی production
کامپوننت‌های دسترس‌پذیر با CSS خام، اسکیمای Zod و Valibot، هوک‌های `"use client"`، نسخه‌ی `lite`، داده‌ی freeze شده و تایپ‌هایی از TypeScript 3.9 تا 7.

</td>
</tr>
</table>

> [!TIP]
> از نسخه‌ی 1.x ارتقا می‌دهید؟ بیشتر پروژه‌ها به هیچ تغییری نیاز ندارند. [راهنمای مهاجرت](./MIGRATION.fa.md) را ببینید.

## فهرست

- [نصب](#نصب)
- [ورودی‌ها](#ورودیها)
- [شروع سریع](#شروع-سریع)
- [Next.js](#nextjs)
- [کامپوننت‌ها](#کامپوننتها)
- [اعتبارسنجی فرم](#اعتبارسنجی-فرم)
- [هوک‌های React](#هوکهای-react)
- [نقشه و جغرافیا](#نقشه-و-جغرافیا)
- [Vue، Svelte، Angular و Express](#vue-svelte-angular-و-express)
- [زبان‌های دیگر: CSV، SQL، JSON](#زبانهای-دیگر-csv-sql-json)
- [مرجع API](#مرجع-api)
- [تطبیق متن چطور کار می‌کند](#تطبیق-متن-چطور-کار-میکند)
- [داده‌ها و منابع](#دادهها-و-منابع)
- [سازگاری](#سازگاری)
- [مشارکت](#مشارکت)
- [مجوز و منابع](#مجوز-و-منابع)

## نصب

```bash
npm install @code-plate/iran-cities
```

<details>
<summary>pnpm، yarn، bun، Deno</summary>

```bash
pnpm add @code-plate/iran-cities
yarn add @code-plate/iran-cities
bun add @code-plate/iran-cities
deno add npm:@code-plate/iran-cities
```

</details>

## ورودی‌ها

کوچک‌ترین ورودی‌ای را انتخاب کنید که نیازتان را پوشش می‌دهد. حجم‌ها بعد از minify و فشرده‌سازی brotli و همراه با داده‌ها هستند.

| import | محتوا | حجم |
|---|---|---:|
| `@code-plate/iran-cities` | همه‌ی توابع، از جمله مختصات و فاصله | ۲۴ کیلوبایت |
| `@code-plate/iran-cities/lite` | همان جستجو و lookup، بدون مختصات | ۱۶ کیلوبایت |
| `@code-plate/iran-cities/react` | هوک‌های React | ۲۵ کیلوبایت |
| `@code-plate/iran-cities/lite/react` | هوک‌های React بدون مختصات | ۱۷ کیلوبایت |
| `@code-plate/iran-cities/lite/react/components` | `CityCombobox` و `ProvinceCitySelect` | ۱۸ کیلوبایت |
| `@code-plate/iran-cities/react/components` | همان کامپوننت‌ها همراه با مختصات | ۲۶ کیلوبایت |
| `@code-plate/iran-cities/components.css` | استایل کامپوننت‌ها | ۱٫۵ کیلوبایت |
| `@code-plate/iran-cities/zod` · `/valibot` | اسکیمای اعتبارسنجی | ۱۶ کیلوبایت |
| `@code-plate/iran-cities/boundaries` | مرز استان‌ها (GeoJSON) و `getProvinceAt` | ۵۳ کیلوبایت |
| `@code-plate/iran-cities/data/*` | فایل‌های CSV، SQL، JSON و GeoJSON | |

ورودی‌ها کد مشترک دارند، پس import کردن چند ورودی هیچ‌وقت داده را دو بار ship نمی‌کند. React، Zod و Valibot وابستگی peer اختیاری هستند.

## شروع سریع

### پیدا کردن

```ts
import { getProvince, getCities, getCity, getCityById, getProvinceOfCity } from '@code-plate/iran-cities';

getProvince('tehran');          // با شناسه‌ی انگلیسی
getProvince('تهران');           // با نام فارسی
getProvince(28);                // با id (رشته‌ی '28' و '۲۸' هم کار می‌کند)

getCities('fars');              // همه‌ی شهرهای فارس
getCity('شیراز');               // یک شهر در کل ایران
getCity('شیراز', 'fars');       // یک شهر داخل یک استان
getCityById(292);               // با id سراسری
getProvinceOfCity('اصفهان');    // استانی که شهر در آن است
```

### جستجو و autocomplete

```ts
import { searchCities, searchProvinces } from '@code-plate/iran-cities';

searchProvinces('خراسان');                   // [خراسان جنوبی، خراسان رضوی، خراسان شمالی]
searchCities('شهر', { limit: 10 });          // ۱۰ نتیجه‌ی اول
searchCities('تهرن', { fuzzy: true });       // تحمل غلط تایپی: [تهران]
searchCities('jivhk');                       // کیبورد اشتباه: [تهران]
searchCities('', { emptyQuery: 'none' });    // [] به‌جای هر ۱۲۵۲ شهر
```

### همسایه‌ها، مرکز استان و کد تلفن

```ts
import { getNeighborProvinces, areNeighborProvinces, getCapital, getProvinceByPhoneCode } from '@code-plate/iran-cities';

getNeighborProvinces('قم');                     // [اصفهان، مرکزی، سمنان، تهران]
areNeighborProvinces('yazd', 'south-khorasan'); // true
getCapital('khuzestan');                        // اهواز
getProvinceByPhoneCode('021');                  // تهران ('21'، 21، '۰۲۱' و '+98 21' هم قبول است)
```

### نام نمایشی انگلیسی

```ts
getProvince(16)?.nameEn;          // 'Kohgiluyeh and Boyer-Ahmad'  (شناسه‌ی en برابر 'kohgiluyeh-and-boyer-ahmad' است)
getCity('bandar-e-gaz')?.nameEn;  // 'Bandar-e Gaz'
```

## Next.js

در **Server Componentها** از ورودی اصلی و در **Client Componentها** از هوک‌ها یا کامپوننت‌ها استفاده کنید. همه‌ی ورودی‌های React خودشان `"use client"` دارند.

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
> در Client Componentها از ورودی‌های `lite` استفاده کنید، مگر اینکه مرورگر واقعاً مختصات لازم داشته باشد. این کار حدود ۸ کیلوبایت از bundle کلاینت کم می‌کند.

با Next.js 14، 15 و 16 و با Turbopack و webpack تست شده است.

## کامپوننت‌ها

دو کامپوننت دسترس‌پذیر که با یک فایل کوچک CSS خام استایل شده‌اند (بدون Tailwind و بدون CSS-in-JS). [نسخه‌ی زنده را ببینید](https://mjavadsf.github.io/Iran-Cities/fa/guides/components/).

```tsx
'use client';

import '@code-plate/iran-cities/components.css';
import { CityCombobox, ProvinceCitySelect } from '@code-plate/iran-cities/lite/react/components';

<ProvinceCitySelect provinceName="provinceId" cityName="cityId" onChange={({ provinceId, cityId }) => {}} />
<CityCombobox label="شهر مقصد" name="destinationId" province="fars" onChange={(city) => {}} />
```

- **`CityCombobox`** از [الگوی combobox در WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) پیروی می‌کند: `↑` و `↓`، `Home` و `End`، `Enter` برای انتخاب، `Escape` برای بستن و `Escape` دوم برای پاک کردن. غلط تایپی را تحمل می‌کند و کیبورد اشتباه را درست می‌کند.
- **`ProvinceCitySelect`** دو `<select>` بومی با label است و با تغییر استان، شهر خالی می‌شود.
- هر دو **id** را از طریق فیلدهای معمولی فرم (`name`) ارسال می‌کنند، پس با فرم معمولی و Server Action کار می‌کنند. هر دو هم controlled (`value` و `onChange`) و هم uncontrolled (`defaultValue`) کار می‌کنند و بدون تغییر داخل `Controller` در react-hook-form قرار می‌گیرند.
- پیش‌فرض راست‌به‌چپ (`dir="rtl"`)، نام انگلیسی با `locale="en"`، و حالت تاریک خودکار.

تم را با متغیرهای CSS روی هر والدی تغییر دهید. همه‌ی selectorها با `:where()` نوشته شده‌اند، پس کلاس‌های خودتان بدون `!important` اولویت دارند:

```css
.checkout {
  --ic-accent: #2563eb;
  --ic-radius: 0.375rem;
  --ic-height: 2.5rem;
  --ic-font: 'Vazirmatn', sans-serif;
}
```

<details>
<summary>همه‌ی متغیرهای CSS</summary>

| متغیر | |
|---|---|
| `--ic-font`، `--ic-font-size`، `--ic-line-height` | تایپوگرافی |
| `--ic-height`، `--ic-radius`، `--ic-gap`، `--ic-padding-inline` | اندازه و فاصله |
| `--ic-bg`، `--ic-fg`، `--ic-muted`، `--ic-border`، `--ic-border-hover` | رنگ‌ها |
| `--ic-accent`، `--ic-accent-soft`، `--ic-ring` | رنگ اصلی و حلقه‌ی focus |
| `--ic-danger`، `--ic-danger-ring` | حالت نامعتبر |
| `--ic-popover-bg`، `--ic-shadow`، `--ic-listbox-max-height` | فهرست پیشنهادها |
| `--ic-disabled-bg`، `--ic-transition` | سایر |

حالت تاریک از `prefers-color-scheme` پیروی می‌کند؛ برای اجبار، `data-theme="dark"` یا `"light"` را روی یک والد بگذارید.

</details>

## اعتبارسنجی فرم

```ts
import { provinceCitySchema, cityIdSchema, citySchema } from '@code-plate/iran-cities/zod';

provinceCitySchema.parse({ provinceId: '7', cityId: '292' });   // { provinceId: 7, cityId: 292 }
provinceCitySchema.safeParse({ provinceId: 28, cityId: 292 });   // خطا روی cityId: «این شهر در استان انتخاب‌شده نیست.»
cityIdSchema.parse('۲۹۲');                                       // 292
citySchema.parse('شیراز');                                        // شیء کامل شهر
```

همین اسکیماها برای Valibot در `@code-plate/iran-cities/valibot` هم هست. پیام‌ها به‌طور پیش‌فرض فارسی‌اند؛ با `createZodSchemas({ ... })` یا `createValibotSchemas({ ... })` پیام خودتان را بدهید.

## هوک‌های React

از `@code-plate/iran-cities/react` یا بدون مختصات از `@code-plate/iran-cities/lite/react` import کنید.

| هوک | خروجی |
|---|---|
| `useProvinces()` | فهرست استان‌ها |
| `useCities(province)` | شهرهای یک استان |
| `useProvinceCitySelect(options?)` | همه‌ی چیزهایی که یک فیلد استان ← شهر لازم دارد؛ گزینه‌ها: `initialProvince`، `initialCity`، `value`، `onChange` |
| `useCitySearch(initialQuery?, options?)` | `{ query, setQuery, results }` |
| `useProvinceSearch(initialQuery?, options?)` | `{ query, setQuery, results }` |

```tsx
const { provinces, cities, province, city, setProvince, setCity, provinceId, cityId } = useProvinceCitySelect({ initialCity: 292 });
const [value, setValue] = useState<ProvinceCityValue>({ provinceId: 7, cityId: 292 });
useProvinceCitySelect({ value, onChange: setValue });   // controlled
```

## نقشه و جغرافیا

```ts
import { getDistance, getNearestCities } from '@code-plate/iran-cities';
import { getProvinceAt, provinceBoundaries } from '@code-plate/iran-cities/boundaries';

getDistance('tehran', 'karaj');                              // 36.5 (کیلومتر)
getNearestCities({ lat: 29.6, lng: 52.5 }, { limit: 1 });    // [{ city: شیراز, distanceKm: 5.6 }]
getProvinceAt({ lat: 34.64, lng: 50.88 });                   // قم
getProvinceAt({ lat: 48.85, lng: 2.35 });                    // undefined (خارج از ایران)
```

`provinceBoundaries` یک `FeatureCollection` استاندارد GeoJSON است که مستقیم با Leaflet، MapLibre و deck.gl کار می‌کند. هر شهری که مختصات دارد به استان خودش برمی‌گردد. [نقشه را امتحان کنید](https://mjavadsf.github.io/Iran-Cities/fa/guides/geography/).

## Vue، Svelte، Angular و Express

توابع اصلی توابع ساده و همگام هستند و در هر فریم‌ورکی کار می‌کنند.

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

مسیر جستجو قبل از `/:province` تعریف شده؛ وگرنه Express کلمه‌ی `search` را نام استان حساب می‌کند.

</details>

## زبان‌های دیگر: CSV، SQL، JSON

پکیج همین داده‌ها را به‌صورت فایل معمولی هم دارد، برای Laravel، Django، Go یا هر دیتابیسی:

| فایل | |
|---|---|
| `data/provinces.csv`، `data/cities.csv` | CSV با کدگذاری UTF-8 و سطر عنوان |
| `data/provinces.json`، `data/cities.json` | آرایه‌ی مسطح JSON |
| `data/iran-cities.sql` | جدول‌ها، کلیدهای خارجی و insertها برای PostgreSQL، MySQL، MariaDB و SQLite |
| `data/iran-provinces.geojson` | مرز استان‌ها |

```bash
curl -O https://unpkg.com/@code-plate/iran-cities/dist/data/iran-cities.sql
psql mydb < iran-cities.sql
```

## مرجع API

هر جا query خواسته شده، می‌توانید نام فارسی، شناسه‌ی انگلیسی، نام نمایشی انگلیسی یا id عددی (عدد یا رشته، حتی با ارقام فارسی) بدهید.

<details open>
<summary><b>استان‌ها</b></summary>

| تابع | خروجی |
|---|---|
| `getProvinces()` | `readonly Province[]` همراه با شهرها |
| `getProvincesList()` | `ProvinceListItem[]` بدون شهرها (هر بار آرایه‌ی جدید) |
| `getProvince(query)` | `Province \| undefined` |
| `getProvinceById(id)` | `Province \| undefined` |
| `getProvinceByPhoneCode(code)` | `Province \| undefined` |
| `getProvinceOfCity(cityQuery)` | `Province \| undefined` |
| `getNeighborProvinces(query)` | `Province[]` هم‌مرز |
| `areNeighborProvinces(a, b)` | `boolean` |

</details>

<details open>
<summary><b>شهرها</b></summary>

| تابع | خروجی |
|---|---|
| `getCities(provinceQuery)` | `readonly City[]` |
| `getAllCities()` | `readonly FlatCity[]` |
| `getCity(cityQuery, provinceQuery?)` | `FlatCity \| undefined` |
| `getCityById(id)` | `FlatCity \| undefined` |
| `getCityBySlug(slug)` | `FlatCity \| undefined`، مثلاً `'fars/shiraz'`؛ slugهای قدیمی هم کار می‌کنند |
| `getCitiesByName(name)` | `readonly FlatCity[]`، همه‌ی شهرهای هم‌نام یا با همان نام جایگزین |
| `isAmbiguousCityName(name)` | `boolean` |
| `getCapital(provinceQuery)` | `FlatCity \| undefined` |
| `getCapitals()` | `FlatCity[]`، مراکز ۳۱ استان |

</details>

<details open>
<summary><b>جستجو</b></summary>

| تابع | خروجی |
|---|---|
| `searchCities(query, options?)` | `FlatCity[]` |
| `searchProvinces(query, options?)` | `Province[]` |
| `normalize(text)` | `string`، همان نرمال‌سازی‌ای که همه‌ی lookupها استفاده می‌کنند |
| `convertKeyboardLayout(text, 'fa' \| 'en')` | `string` |

| `SearchOptions` | پیش‌فرض | |
|---|---|---|
| `limit` | بدون محدودیت | حداکثر تعداد نتایج |
| `locale` | `'both'` | `'fa'`، `'en'` یا `'both'` |
| `fuzzy` | `false` | تحمل غلط تایپی |
| `maxDistance` | `2` | حداکثر فاصله‌ی ویرایشی در حالت `fuzzy`؛ حداکثر یک‌سوم طول query |
| `emptyQuery` | `'all'` | خروجی query خالی: `'all'` یا `'none'` |
| `keyboardFix` | `true` | اگر نتیجه‌ای نبود، با چیدمان کیبورد دیگر دوباره جستجو می‌کند |

</details>

<details open>
<summary><b>جغرافیا</b></summary>

| تابع | خروجی |
|---|---|
| `getDistance(from, to)` | کیلومتر، یا `undefined` اگر یکی مختصات نداشته باشد |
| `getNearestCities(point, options?)` | `{ city, distanceKm }[]` به ترتیب فاصله؛ گزینه‌ها `limit` (۵، و `0` یعنی همه)، `minConfidence` (`'low'`)، `maxDistanceKm` |
| `getProvinceAt(point, options?)` | `Province \| undefined`؛ نقطه‌هایی که تا `maxDistanceKm` (۵) بیرون از مرز باشند به نزدیک‌ترین استان نسبت داده می‌شوند *(ورودی boundaries)* |
| `getProvinceBoundary(id)` | یک feature از GeoJSON *(ورودی boundaries)* |
| `provinceBoundaries` | `FeatureCollection` از GeoJSON *(ورودی boundaries)* |

`from`، `to` و `point` می‌توانند query شهر یا `{ lat, lng }` باشند.

</details>

<details open>
<summary><b>نسخه‌ی داده</b></summary>

| export | |
|---|---|
| `DATA_VERSION` | نسخه‌ی داده، مثلاً `'2.0.0'` |
| `DATA_CHANGES` | همه‌ی تغییر نام‌ها، اصلاح‌های املایی و حذف‌ها از نسخه‌ی 1.0 |
| `getDataChanges(sinceVersion?)` | تغییرات بعد از یک نسخه، برای به‌روز کردن مقادیری که ذخیره کرده‌اید |

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
  id: number;                       // در کل ایران یکتا و هرگز دوباره استفاده نمی‌شود
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

همه‌ی تایپ‌ها export شده‌اند، از جمله `ProvinceListItem`، `SearchOptions`، `NearestCity`، `LatLng`، `ProvinceCityValue`، `CityComboboxProps`، `ProvinceCitySelectProps`، `DataChange` و اینترفیس‌های `IranCities`، `IranCitiesGeo` و `IranCitiesHooks`.

> [!NOTE]
> استان‌ها، شهرها و آرایه‌های مشترک با `Object.freeze` قفل شده‌اند تا یک بخش برنامه نتواند تصادفاً داده‌ها را برای بخش دیگر خراب کند. برای تغییر، اول کپی بگیرید: `[...getCities('fars')].sort(...)`. `getProvincesList()`، `getCapitals()`، `getNeighborProvinces()` و توابع جستجو خودشان آرایه‌ی جدید برمی‌گردانند.

## تطبیق متن چطور کار می‌کند

**نرمال‌سازی.** همه‌ی lookupها و جستجوها متن نرمال‌شده را مقایسه می‌کنند، پس این‌ها یکی حساب می‌شوند:

| یکسان | |
|---|---|
| `ی` `ي` `ى` `ئ` | `ک` `ك` |
| `ا` `آ` `أ` `إ` `ٱ` | `ه` `ة` `ۀ` |
| `و` `ؤ` | `۰۱۲` `٠١٢` `012` |

اعراب، کشیده (`ـ`)، نیم‌فاصله، فاصله، `-`، `_` و آپاستروف نادیده گرفته می‌شوند و بزرگی و کوچکی حروف مهم نیست.

**چیدمان کیبورد.** اگر جستجو نتیجه‌ای نداشته باشد، دوباره طوری جستجو می‌شود که انگار با چیدمان دیگر تایپ شده: `jivhk` ← `تهران` و `ساهقشظ` ← `shiraz`. با `{ keyboardFix: false }` خاموش می‌شود.

**ترتیب نتایج.** اول تطابق کامل، بعد شروع نام، بعد شامل‌بودن، و بعد (با `fuzzy`) فاصله‌ی ویرایشی. در امتیاز برابر، مراکز استان اول می‌آیند و بعد ترتیب الفبای فارسی.

**نام‌های تکراری.** ۲۵ نام شهر در بیش از یک استان وجود دارد. بدون استان، `getCity(name)` مرکز استان را برمی‌گرداند، وگرنه شهر شناخته‌شده‌تر را، وگرنه کوچک‌ترین id را. اگر انتخاب مهم است، با `isAmbiguousCityName(name)` چک کنید و استان را هم بدهید یا انتخاب را از `getCitiesByName(name)` به کاربر بسپارید.

**نام‌های جایگزین.** املاهای دیگر و نام‌های قدیمی به شهر درست می‌رسند: `طهران`، `teheran`، `esfahan`، `mashad`، `orumiyeh`، `صومعه سارا`، `حلاشی`.

## داده‌ها و منابع

| | |
|---|---:|
| استان | ۳۱ |
| شهر | ۱۲۵۲ |
| شهر دارای مختصات | ۱۱۵۲ |
| ↳ اطمینان `high` | ۹۷۷ |
| ↳ اطمینان `medium` | ۹۸ |
| ↳ اطمینان `low` | ۷۷ |
| مرز مشترک بین استان‌ها | ۷۴ |

- **`high`**: یک منبع مستقل همان نقطه را تأیید می‌کند.
- **`medium`**: نام در GeoNames یکتاست و مکان شبیه شهر است، ولی تأیید مستقل ندارد.
- **`low`**: فقط تطابق نام در GeoNames. برای نمایش تقریبی مناسب است و خطای چند کیلومتری ممکن است.

همه‌ی مختصات در CI با مرز استان‌ها بررسی می‌شوند و هر ۱۱۵۲ نقطه داخل استان خودشان هستند. برای ۱۰۰ شهر باقی‌مانده `coordinates` برابر `undefined` است و هیچ مقدار حدسی گذاشته نشده ([فهرست و دلیل‌ها](./reports/coordinates-not-imported.csv)).

همسایه‌ها از روی مرز استان‌ها محاسبه شده‌اند (حداقل ۳ کیلومتر مرز مشترک) و مرزهای فعلی را نشان می‌دهند، از جمله انتقال شهرستان طبس از یزد به خراسان جنوبی در سال ۱۳۹۲.

idها هرگز تغییر نمی‌کنند و دوباره استفاده نمی‌شوند. slugهای تغییرکرده همچنان کار می‌کنند و همه‌ی تغییرات در `DATA_CHANGES` ثبت شده‌اند.

## سازگاری

هر نسخه در CI روی این ترکیب‌ها تست می‌شود:

| | پشتیبانی |
|---|---|
| Node.js | 14، 16، 18، 20، 22، 24 (CommonJS و ES module) |
| Deno، Bun | نسخه‌های فعلی |
| TypeScript | 3.9 تا 7، با `moduleResolution` برابر `node`، `node16` یا `bundler` |
| React | 16.8 به بالا (تست‌شده با 17، 18 و 19) |
| Next.js | 14، 15، 16 (App Router؛ Turbopack و webpack) |
| Zod، Valibot | Zod 3.25 به بالا و 4، Valibot 1 |

هر bundler که فیلد `exports` را بشناسد (Vite، webpack، Rollup، Rolldown، esbuild، Turbopack و ...) می‌تواند از پکیج استفاده کند.

## مشارکت

ارزشمندترین مشارکت، اصلاح داده است؛ لطفاً منبع را هم بنویسید. [CONTRIBUTING.fa.md](./CONTRIBUTING.fa.md) را ببینید.

```bash
npm install
npm test              # اعتبارسنجی داده، TypeScript 7، Oxlint، Vitest
npm run build         # tsdown (Rolldown + Oxc)
npm run test:dist     # smoke test فایل‌های build شده
```

برای انتشار نسخه‌ی جدید، `version` را در `package.json` و `CHANGELOG.md` به‌روز کنید و بعد:

```bash
npm publish --access public
```

`npm publish` قبل از انتشار همه‌ی بررسی‌ها را اجرا می‌کند (تست‌ها، build، smoke test، lint پکیج و بودجه‌ی حجم) و اگر یکی خطا بدهد، انتشار متوقف می‌شود.

## مجوز و منابع

| | منبع | مجوز |
|---|---|---|
| کد | همین پروژه | [MIT](./LICENSE) |
| مختصات | [GeoNames](https://www.geonames.org) | CC BY 4.0 |
| مرزها و همسایه‌ها | [geoBoundaries](https://www.geoboundaries.org) / © OpenStreetMap contributors | ODbL 1.0 |

فیلد license پکیج `MIT AND CC-BY-4.0 AND ODbL-1.0` است. ODbL فقط وقتی اعمال می‌شود که خود داده‌ی مرزها را بازنشر کنید؛ [`NOTICE.md`](./NOTICE.md) را ببینید.

<div align="center">
<sub>ساخته‌شده با ❤️ برای توسعه‌دهنده‌های فارسی‌زبان · <a href="./CHANGELOG.md">Changelog</a> · <a href="./MIGRATION.fa.md">راهنمای مهاجرت</a> · <a href="https://mjavadsf.github.io/Iran-Cities/fa/">مستندات</a> · <a href="https://github.com/MJavadSF/Iran-Cities/issues">Issues</a></sub>
</div>

</div>
