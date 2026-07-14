[English](./README.md) | فارسی

# @code-plate/iran-cities

لیست کامل و آماده‌ی **استان‌ها و شهرهای ایران** (فارسی + انگلیسی)، بسته‌بندی‌شده به شکل یک کتابخانه‌ی سبک، بدون هیچ وابستگی اجباری، که در **هر پروژه‌ی جاوااسکریپتی/تایپ‌اسکریپتی** قابل استفاده است:

- ✅ React / Next.js (App Router و Pages Router)
- ✅ Vue 2 / Vue 3
- ✅ Angular
- ✅ Svelte
- ✅ Node.js / Express (بک‌اند خالص)
- ✅ Vanilla JS (مرورگر یا هر باندلر دیگر)

هسته‌ی اصلی پکیج **هیچ وابستگی‌ای** ندارد (zero-dependency) و هم به‌صورت **CJS** و هم **ESM** ارائه می‌شود. یک ساب‌پس اختیاری (`@code-plate/iran-cities/react`) هم برای کسانی که در React کار می‌کنند وجود دارد که چند هوک آماده می‌دهد؛ اگر پروژه‌تان React نیست، هرگز این فایل import نمی‌شود و React اصلاً لازم نیست نصب شود.

## نصب

```bash
npm install @code-plate/iran-cities
# یا
yarn add @code-plate/iran-cities
# یا
pnpm add @code-plate/iran-cities
```

## داده‌ها

- `۳۱` استان
- `۱۲۵۳` شهر
- هر رکورد شامل `en` (شناسه لاتین kebab-case، مثل `tehran`) و `fa` (نام فارسی، مثل `تهران`) است.

---

## استفاده در جاوااسکریپت / تایپ‌اسکریپت خالص (و Node.js/Express)

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

// همه‌ی استان‌ها به همراه شهرهایشان
getProvinces();
// [{ en: 'alborz', fa: 'البرز', cities: [{ en: 'karaj', fa: 'کرج' }, ...] }, ...]

// فقط لیست استان‌ها (بدون شهر) - برای Select/Dropdown
getProvincesList();
// [{ en: 'alborz', fa: 'البرز' }, { en: 'ardabil', fa: 'اردبیل' }, ...]

// گرفتن یک استان با نام انگلیسی یا فارسی
getProvince('tehran');
getProvince('تهران'); // همین نتیجه را می‌دهد

// شهرهای یک استان خاص
getCities('fars');       // بر اساس شناسه انگلیسی
getCities('فارس');       // یا بر اساس نام فارسی، هر دو یکسان کار می‌کنند

// پیدا کردن یک شهر مشخص (در کل کشور یا محدود به یک استان)
getCity('shiraz');
getCity('شیراز', 'fars'); // محدود به استان فارس

// لیست مسطح (flat) همه‌ی شهرهای کشور همراه با استان مربوطه
getAllCities();
// [{ en: 'karaj', fa: 'کرج', provinceEn: 'alborz', provinceFa: 'البرز' }, ...]

// پیدا کردن استانِ یک شهر
getProvinceOfCity('اصفهان'); // => { en: 'isfahan', fa: 'اصفهان', cities: [...] }

// جستجوی زنده (autocomplete) در استان‌ها یا شهرها
searchProvinces('خراسان');            // هر سه استان خراسان را برمی‌گرداند
searchCities('شهر', { limit: 10 });   // ۱۰ نتیجه‌ی اول شامل «شهر»
searchCities('mashhad', { locale: 'en' }); // جستجو فقط در نام انگلیسی

// آمار کلی
getStats(); // { provinceCount: 31, cityCount: 1253 }
```

### نکته‌ی مهم درباره‌ی جستجو
تابع‌های `getProvince`, `getCities`, `getCity` و `getProvinceOfCity` به‌صورت **نرمال‌شده** مقایسه می‌کنند؛ یعنی تفاوت «ی» فارسی/«ي» عربی، «ک»/«ك»، نیم‌فاصله، فاصله و خط‌تیره را نادیده می‌گیرند. پس `getCity('كرج')` و `getCity('کرج')` هر دو کار می‌کنند.

---

## استفاده در Node.js / Express (بک‌اند)

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

## استفاده در React / Next.js

برای React یک ساب‌پس اختیاری وجود دارد که چند هوک آماده ارائه می‌دهد:

```tsx
import { useProvinces, useCities, useProvinceCitySelect, useCitySearch } from '@code-plate/iran-cities/react';

function AddressForm() {
  const { provinces, cities, province, setProvince, city, setCity } = useProvinceCitySelect();

  return (
    <>
      <select value={province} onChange={(e) => setProvince(e.target.value)}>
        <option value="">انتخاب استان</option>
        {provinces.map((p) => (
          <option key={p.en} value={p.en}>{p.fa}</option>
        ))}
      </select>

      <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!province}>
        <option value="">انتخاب شهر</option>
        {cities.map((c) => (
          <option key={c.en} value={c.en}>{c.fa}</option>
        ))}
      </select>
    </>
  );
}
```

جستجوی زنده‌ی شهر (autocomplete):

```tsx
import { useCitySearch } from '@code-plate/iran-cities/react';

function CityAutocomplete() {
  const { query, setQuery, results } = useCitySearch('', { limit: 8 });

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="نام شهر..." />
      <ul>
        {results.map((c) => (
          <li key={`${c.provinceEn}-${c.en}`}>{c.fa} ({c.provinceFa})</li>
        ))}
      </ul>
    </div>
  );
}
```

هوک‌های در دسترس در ساب‌پس `react`:

| هوک | کاربرد |
|---|---|
| `useProvinces()` | لیست استان‌ها |
| `useCities(provinceQuery)` | شهرهای یک استان، وابسته به تغییر پارامتر |
| `useProvinceCitySelect()` | state کامل یک فرم استان→شهر (با ریست خودکار شهر هنگام تغییر استان) |
| `useCitySearch(initialQuery?, options?)` | state جستجوی زنده‌ی شهر |
| `useProvinceSearch(initialQuery?, options?)` | state جستجوی زنده‌ی استان |

> اگر پروژه‌تان Vue، Angular یا هر چیز دیگری است، فقط از مسیر اصلی (`@code-plate/iran-cities`) استفاده کنید و توابع خام (`getProvinces`, `getCities`, ...) را داخل computed/signal/observable خودتان قرار دهید — نیازی به هیچ ابزار اضافه‌ای نیست.

---

## استفاده در Vue 3 (نمونه)

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

## استفاده در Angular (نمونه سرویس)

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

## API کامل

### توابع اصلی (import از `'@code-plate/iran-cities'`)

| تابع | ورودی | خروجی | توضیح |
|---|---|---|---|
| `getProvinces()` | - | `Province[]` | همه‌ی استان‌ها به همراه شهرها |
| `getProvincesList()` | - | `{en, fa}[]` | فقط لیست استان‌ها |
| `getProvince(query)` | `string` | `Province \| undefined` | یک استان با en یا fa |
| `getCities(provinceQuery)` | `string` | `City[]` | شهرهای یک استان |
| `getCity(cityQuery, provinceQuery?)` | `string, string?` | `FlatCity \| undefined` | یک شهر مشخص |
| `getAllCities()` | - | `FlatCity[]` | همه‌ی شهرها به‌صورت مسطح |
| `getProvinceOfCity(cityQuery)` | `string` | `Province \| undefined` | استانِ یک شهر |
| `searchProvinces(query, options?)` | `string, SearchOptions?` | `Province[]` | جستجوی fuzzy استان |
| `searchCities(query, options?)` | `string, SearchOptions?` | `FlatCity[]` | جستجوی fuzzy شهر |
| `getStats()` | - | `{provinceCount, cityCount}` | آمار کلی |

`SearchOptions`: `{ limit?: number; locale?: 'en' | 'fa' | 'both' }`

### تایپ‌ها

```ts
interface City { en: string; fa: string; }
interface Province { en: string; fa: string; cities: City[]; }
interface FlatCity extends City { provinceEn: string; provinceFa: string; }
```

---

## توسعه

```bash
npm install
npm run build     # خروجی dist/ (cjs + esm + d.ts)
npm run typecheck
```

## لایسنس

MIT
