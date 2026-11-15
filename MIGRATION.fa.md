[English](./MIGRATION.md) | فارسی

# مهاجرت از نسخه‌ی 1.x به 2.0

نسخه‌ی 2.0 در بیشتر پروژه‌ها بدون هیچ تغییری جایگزین نسخه‌ی قبل می‌شود. کد جاوااسکریپت معمولی، بک‌اندهای Node.js/Express و فرم‌های رایج React/Next.js بدون تغییر کار می‌کنند. این راهنما **همه‌ی** تفاوت‌هایی را که ممکن است روی کد موجود اثر بگذارند فهرست می‌کند، توضیح می‌دهد چطور بفهمید پروژه‌تان درگیر است یا نه، و راه‌حل دقیق هر مورد را می‌گوید.

همه‌ی موارد با اجرای فراخوانی‌های یکسان روی build نسخه‌ی 1.2.0 و build نسخه‌ی 2.0.0 راستی‌آزمایی شده‌اند.

## فهرست

- [چک‌لیست سریع](#چکلیست-سریع)
- [چه چیزهایی تغییر نکرده](#چه-چیزهایی-تغییر-نکرده)
- [تغییرات ناسازگار](#تغییرات-ناسازگار)
  - [۱. داده‌های خروجی freeze شده‌اند و تایپ آرایه‌ها `readonly` است](#۱-دادههای-خروجی-freeze-شدهاند-و-تایپ-آرایهها-readonly-است)
  - [۲. `getCity(name)` برای ۷ نام تکراری شهر دیگری برمی‌گرداند](#۲-getcityname-برای-۷-نام-تکراری-شهر-دیگری-برمیگرداند)
  - [۳. فیلدهای اجباری جدید در تایپ‌های داده](#۳-فیلدهای-اجباری-جدید-در-تایپهای-داده)
  - [۴. ۲۵ نام فارسی حالا با حروف فارسی نوشته می‌شوند](#۴-۲۵-نام-فارسی-حالا-با-حروف-فارسی-نوشته-میشوند)
- [تغییرات رفتاری غیرناسازگار](#تغییرات-رفتاری-غیرناسازگار)
- [قابلیت‌های جدید](#قابلیتهای-جدید)
- [Next.js](#nextjs)
- [پیدا کردن کدهای درگیر](#پیدا-کردن-کدهای-درگیر)
- [پرسش‌های رایج](#پرسشهای-رایج)

## چک‌لیست سریع

۱. `npm install @code-plate/iran-cities@^2`

۲. کامپایلر TypeScript را اجرا کنید. خطاهایی به شکل `TS4104: The type 'readonly City[]' is 'readonly' and cannot be assigned to the mutable type 'City[]'` مربوط به [مورد ۱](#۱-دادههای-خروجی-freeze-شدهاند-و-تایپ-آرایهها-readonly-است) هستند و خطای `Property 'aliases' is missing` (یا `nameEn`، `neighborIds`، `provinceNameEn`) مربوط به [مورد ۳](#۳-فیلدهای-اجباری-جدید-در-تایپهای-داده).

۳. در کدتان دنبال جاهایی بگردید که داده‌ی برگشتی از پکیج را **تغییر** می‌دهند (`.sort(`، `.push(`، `.splice(`، `.reverse(` یا مقداردهی مثل `city.xxx =`). بخش [پیدا کردن کدهای درگیر](#پیدا-کردن-کدهای-درگیر) را ببینید.

۴. اگر `getCity()` یا `getProvinceOfCity()` را با نام شهر و بدون استان صدا می‌زنید، [۷ نام](#۲-getcityname-برای-۷-نام-تکراری-شهر-دیگری-برمیگرداند) را بررسی کنید.

۵. اگر `city.fa` را با نام‌های فارسی ذخیره‌شده در دیتابیس مقایسه می‌کنید، [مورد ۴](#۴-۲۵-نام-فارسی-حالا-با-حروف-فارسی-نوشته-میشوند) را ببینید.

۶. اختیاری: کامپوننت‌های کلاینت را به `@code-plate/iran-cities/lite/react` ببرید تا حجم bundle کلاینت حدود یک‌سوم کم شود.

## چه چیزهایی تغییر نکرده

- **نسخه‌های پشتیبانی‌شده‌ی Node.js:** `engines.node` همچنان `>=14` است. فایل‌های منتشرشده روی Node.js نسخه‌های ۱۴، ۱۶، ۱۸، ۲۰، ۲۲ و ۲۴، هم به‌صورت CommonJS و هم ES module تست شده‌اند.
- **نسخه‌های پشتیبانی‌شده‌ی TypeScript:** تایپ‌ها از TypeScript 3.9 تا 7.x کار می‌کنند، با `moduleResolution` برابر `node`/`node10`، `node16`/`nodenext` یا `bundler`.
- **وابستگی React:** همچنان `>=16.8.0` و همچنان اختیاری است.
- **مسیرهای import:** `@code-plate/iran-cities` و `@code-plate/iran-cities/react` تغییری نکرده‌اند. دو ساب‌پس اضافه شده و هیچ‌کدام حذف نشده.
- **همه‌ی توابع و تایپ‌های نسخه‌ی 1.x** با همان نام و همان پارامترها وجود دارند.
- **idها، slugها و داده‌ها:** id شهرها و استان‌ها، شناسه‌های انگلیسی، slugها، کدهای تلفن و مختصات دقیقاً مثل 1.2.0 هستند. نام‌های فارسی هم همان‌اند، به‌جز ۲۵ نام که حالا با حروف فارسی نوشته می‌شوند ([مورد ۴](#۴-۲۵-نام-فارسی-حالا-با-حروف-فارسی-نوشته-میشوند)). slugها و نام‌های قدیمی‌ای که 1.2.0 قبول می‌کرد (`gilan/sowme'eh-sara`، `kermanshah/هلشی`، `حلاشی`) همچنان کار می‌کنند.
- **ساختار اشیا:** `Province`، `City`، `FlatCity`، `ProvinceListItem` و `Coordinates` همه‌ی فیلدهای قبلی را دارند و چند فیلد هم به آن‌ها اضافه شده ([مورد ۳](#۳-فیلدهای-اجباری-جدید-در-تایپهای-داده)).
- **آرایه‌هایی که در 1.x هر بار تازه ساخته می‌شدند، هنوز تازه و قابل‌تغییرند:** `getProvincesList()`، `getCapitals()`، `searchCities()` و `searchProvinces()` در هر فراخوانی آرایه‌ی جدیدی برمی‌گردانند که مثل 1.x می‌توانید sort یا تغییرش دهید.
- **آرایه‌هایی که در 1.x مشترک بودند، همان identity را دارند:** `getProvinces()`، `getAllCities()`، `getCities(...)` و `getCitiesByName(...)` مثل 1.x در هر فراخوانی همان آرایه را برمی‌گردانند و استفاده از آن‌ها در dependency arrayهای React همچنان امن است.
- **هوک‌های React:** همان نام‌ها و همان فیلدهای خروجی (`province`، `city`، `setProvince`، `setCity`، `provinceId`، `cityId`، `selectedProvince`، `selectedCity`، `reset`، `query`، `setQuery`، `results`). `setQuery` همچنان تابع updater هم قبول می‌کند.

## تغییرات ناسازگار

### ۱. داده‌های خروجی freeze شده‌اند و تایپ آرایه‌ها `readonly` است

**چه چیزی تغییر کرده.** در 1.x پکیج آرایه‌ها و اشیای داخلی خودش را مستقیم برمی‌گرداند. تغییر دادن آن‌ها (مثلاً `getCities('fars').sort(...)`) بی‌صدا داده‌ها را برای کل برنامه خراب می‌کرد، حتی برای درخواست‌های دیگر روی همان سرور. در 2.0 همه‌ی استان‌ها، شهرها و مختصات با `Object.freeze` قفل شده‌اند و آرایه‌های مشترک تایپ `readonly` دارند.

مقادیر درگیر:

| مقدار | تایپ در 1.x | تایپ در 2.0 |
|---|---|---|
| `getProvinces()` | `Province[]` | `readonly Province[]` |
| `getCities(province)` | `City[]` | `readonly City[]` |
| `getAllCities()` | `FlatCity[]` | `readonly FlatCity[]` |
| `getCitiesByName(name)` | `FlatCity[]` | `readonly FlatCity[]` |
| `Province.cities` | `City[]` | `readonly City[]` |
| `useCities(province)` | `City[]` | `readonly City[]` |
| هر شیء `Province`، `City`، `FlatCity` و `Coordinates` | قابل‌تغییر | freeze شده، فیلدها با تایپ `readonly` |

درگیر نیستند: `getProvincesList()`، `getCapitals()`، `searchCities()`، `searchProvinces()`، `useProvinces()` و هوک‌های جستجو همچنان آرایه‌ی تازه و قابل‌تغییر برمی‌گردانند. اشیای برگشتی از `getProvincesList()` و `useProvinces()` هم تازه‌اند و قابل تغییر.

**چطور خودش را نشان می‌دهد.**

- در TypeScript: خطای `error TS4104: The type 'readonly City[]' is 'readonly' and cannot be assigned to the mutable type 'City[]'` یا `Cannot assign to 'fa' because it is a read-only property`.
- در زمان اجرا، در ES moduleها، خروجی TypeScript و هر کد `'use strict'` (که شامل buildهای Next.js، Vite و webpack هم می‌شود): خطای `TypeError: Cannot assign to read only property ...` یا `Cannot add property ..., object is not extensible`.
- در زمان اجرا، در CommonJS غیر strict: تغییر بی‌صدا نادیده گرفته می‌شود.

**راه‌حل.**

اگر فقط مقدار را می‌خوانید، تایپ را عوض کنید:

```ts
// 1.x
const cities: City[] = getCities('fars');
// 2.0
const cities: readonly City[] = getCities('fars');
```

قبل از sort یا تغییر، از آرایه کپی بگیرید:

```ts
// 1.x (داده‌ی مشترک را برای همه تغییر می‌داد)
const sorted = getCities('fars').sort((a, b) => a.fa.localeCompare(b.fa, 'fa'));
// 2.0
const sorted = [...getCities('fars')].sort((a, b) => a.fa.localeCompare(b.fa, 'fa'));
```

قبل از تغییر فیلدها، از اشیا کپی بگیرید:

```ts
// 1.x
const cities = getCities('fars');
cities.forEach((c) => { (c as any).label = c.fa; });
// 2.0
const cities = getCities('fars').map((c) => ({ ...c, label: c.fa }));
```

اگر مقدار را به APIای می‌دهید که آرایه‌ی قابل‌تغییر می‌خواهد، همان‌جا کپی کنید: `someFn([...getAllCities()])`.

اگر یک کتابخانه‌ی دیگر اشیایی را که به آن می‌دهید تغییر می‌دهد (بعضی کامپوننت‌های جدول و select این کار را می‌کنند)، کپی عمیق بدهید: `structuredClone(getProvinces())` (Node.js 17 به بالا و همه‌ی مرورگرهای فعلی) یا `JSON.parse(JSON.stringify(getProvinces()))`.

### ۲. `getCity(name)` برای ۷ نام تکراری شهر دیگری برمی‌گرداند

**چه چیزی تغییر کرده.** ۲۵ نام شهر در بیش از یک استان وجود دارد. وقتی چنین نامی را **بدون** استان جستجو می‌کردید، 1.x شهری را برمی‌گرداند که کوچک‌ترین id را داشت و اغلب یک شهر کوچک بود. 2.0 به این ترتیب انتخاب می‌کند:

۱. اگر یکی از آن‌ها مرکز استان باشد، همان؛ وگرنه
۲. شهری که در داده‌ها به‌عنوان شهر شناخته‌شده‌تر علامت خورده؛ وگرنه
۳. شهری که کوچک‌ترین id را دارد (مثل 1.x).

این تغییر فقط روی `getCity(name)` و `getProvinceOfCity(name)` اثر دارد. جستجو با id، با slug یا همراه با استان (`getCity(name, province)`) تغییری نکرده است. `getCitiesByName(name)` هم تغییری نکرده و همچنان همه‌ی شهرهای هم‌نام را به ترتیب id برمی‌گرداند.

فهرست کامل جستجوهایی که نتیجه‌شان عوض شده (نام فارسی و انگلیسی رفتار یکسانی دارند):

| نام | نتیجه در 1.x | نتیجه در 2.0 |
|---|---|---|
| `سردشت` / `sardasht` | چهارمحال و بختیاری (id 104) | آذربایجان غربی (id 1179) |
| `شهریار` / `shahriar` | آذربایجان شرقی (id 184) | تهران (id 1132) |
| `مهاباد` / `mahabad` | اصفهان (id 270) | آذربایجان غربی (id 1171) |
| `رضوانشهر` / `rezvanshahr` | اصفهان (id 279) | گیلان (id 408) |
| `حاجی آباد` / `hajjiabad` | فارس (id 312) | هرمزگان (id 512) |
| `اردکان` / `ardakan` | فارس (id 322) | یزد (id 1212) |
| `چناران` / `chenaran` | خراسان شمالی (id 928) | خراسان رضوی (id 975) |

**چه کسی درگیر است.** فقط کدی که `getCity()` یا `getProvinceOfCity()` را با یکی از این نام‌ها و **بدون** استان صدا می‌زند و به اینکه کدام شهر برمی‌گردد وابسته است؛ مثلاً کدی که ورودی متنی کاربر را به id تبدیل و ذخیره می‌کند.

**راه‌حل.** به ترتیب اولویت:

```ts
// بهترین: هر وقت استان را دارید، آن را هم بدهید (نتیجه یکتاست و در 1.x و 2.0 یکسان است)
getCity('مهاباد', 'isfahan');

// یا به‌جای نام، id ذخیره و جستجو کنید
getCityById(270);

// یا نام‌های مبهم را تشخیص دهید و انتخاب را به کاربر بسپارید
if (isAmbiguousCityName(input)) {
  const options = getCitiesByName(input);
}

// دقیقاً رفتار 1.x (کوچک‌ترین id)
const city = getCitiesByName(name)[0] ?? getCity(name);
```

اگر idهایی را که از جستجوی همین ۷ نام بدون استان در 1.x به دست آمده ذخیره کرده‌اید، همچنان به همان شهرهای قبلی اشاره می‌کنند و داده‌های ذخیره‌شده تغییری نمی‌کنند. فقط جستجوهای جدید شهر دیگری برمی‌گردانند.

### ۳. فیلدهای اجباری جدید در تایپ‌های داده

**چه چیزی تغییر کرده.** این فیلدها اضافه شده‌اند و همیشه مقدار دارند:

| تایپ | فیلدهای جدید |
|---|---|
| `City` | `nameEn` (نام نمایشی انگلیسی، مثلاً `'Bandar-e Gaz'`)، `aliases` (املاهای دیگر و نام‌های قدیمی) |
| `FlatCity` | دو فیلد بالا به‌علاوه‌ی `provinceNameEn` |
| `Province` | `nameEn`، `neighborIds` |
| `ProvinceListItem` | `nameEn` |

**چه کسی درگیر است.** فقط کد TypeScriptای که این اشیا را **دستی می‌سازد**؛ معمولاً fixtureها و mockهای تست:

```
error TS2741: Property 'nameEn' is missing in type '{ ... }' but required in type 'City'.
```

**راه‌حل.** فیلدها را اضافه کنید:

```ts
const mockCity: City = { id: 1, isCapital: true, slug: 'alborz/karaj', en: 'karaj', fa: 'کرج', nameEn: 'Karaj', aliases: [] };
```

یا fixture را از داده‌ی واقعی بسازید تا همیشه با تایپ‌ها هماهنگ بماند: `const mockCity = getCityById(1)!;`

### ۴. ۲۵ نام فارسی حالا با حروف فارسی نوشته می‌شوند

**چه چیزی تغییر کرده.** در 1.x، نام ۲۵ شهر با حروف عربی «ي» و «ك» به‌جای «ی» و «ک» فارسی نوشته شده بود، مثل `كدكن` و `اسفرورين`. این نام‌ها در فهرست‌ها درست نمایش داده نمی‌شدند و جای اشتباهی مرتب می‌شدند. در 2.0 با حروف فارسی نوشته می‌شوند: `کدکن`، `اسفرورین`. idها، شناسه‌های انگلیسی و slugها تغییری نکرده‌اند.

**چه کسی درگیر است.** فقط کدی که `city.fa` را **به‌صورت رشته‌ی خام** با مقداری که از 1.x ذخیره شده مقایسه می‌کند؛ مثلاً ستونی از نام‌های فارسی در دیتابیس. جستجوها درگیر نیستند: `getCity('كدكن')` همچنان شهر را پیدا می‌کند، چون همه‌ی lookupها هر دو حرف را نرمال می‌کنند.

**راه‌حل.** به‌جای نام، id را مقایسه کنید، یا متن نرمال‌شده را:

```ts
import { normalize, getDataChanges } from '@code-plate/iran-cities';

normalize(savedName) === normalize(city.fa);

for (const change of getDataChanges('1.2.0')) {
  if (change.type === 'spelling') {
    await db.query('UPDATE addresses SET city_fa = $1 WHERE city_id = $2', [change.after?.fa, change.cityId]);
  }
}
```

`getDataChanges('1.2.0')` هر ۲۵ تغییر را همراه با املای قبلی و جدید برمی‌گرداند.

## تغییرات رفتاری غیرناسازگار

این تغییرات ممکن است نتیجه‌ی جستجو را عوض کنند؛ بیشتر به این شکل که جایی که 1.x چیزی پیدا نمی‌کرد حالا شهر پیدا می‌شود، ترتیب نتایج هم‌رتبه عوض می‌شود، یا نتیجه‌های فازی ضعیف حذف می‌شوند.

| بخش | 1.x | 2.0 |
|---|---|---|
| نرمال‌سازی | `ي→ی`، `ك→ک`؛ فاصله، نیم‌فاصله و `-` نادیده گرفته می‌شد | علاوه بر آن `ى/ئ→ی`، `آ/أ/إ/ٱ→ا`، `ة/ۀ→ه`، `ؤ→و`؛ اعراب، کشیده‌ی `ـ`، `_` و آپاستروف نادیده گرفته می‌شوند؛ ارقام فارسی و عربی خوانده می‌شوند. حالا `getCity('ابادان')` و `getProvince('۲۸')` کار می‌کنند. |
| نام‌های جایگزین | پشتیبانی نمی‌شد | `getCity('طهران')`، `getCity('esfahan')`، `getCity('mashad')`، `getCity('orumiyeh')`، `getCity('teheran')` و `getCity('urumieh')` به‌جای `undefined` شهر برمی‌گردانند. |
| کد تلفن | `'021'`، `'21'`، `21` | همچنین `'۰۲۱'`، `'+9821'`، `'+98 21'` و `'0098 21'`. |
| ترتیب جستجو | در امتیاز برابر، ترتیب داده‌ها حفظ می‌شد | در امتیاز برابر، اول مراکز استان و بعد ترتیب الفبای فارسی. به خاطر نرمال‌سازی گسترده‌تر و نام‌های جایگزین، یک جستجو ممکن است چند شهر بیشتر از قبل هم پیدا کند. |
| جستجوی فازی (`fuzzy: true`) | برای هر جستجویی ۲ غلط تایپی مجاز بود و جستجوهای کوتاه نام‌های بی‌ربط را هم برمی‌گرداندند (`تهرن` به `اهر` و `بهمن` هم می‌رسید) | تعداد غلط مجاز حداکثر یک‌سوم طول عبارت است (`تهرن` فقط `تهران` را برمی‌گرداند) و غلط در ابتدای نام‌های بلندتر هم پیدا می‌شود. |
| کیبورد اشتباه | `searchCities('jivhk')` چیزی برنمی‌گرداند | `تهران` را برمی‌گرداند: اگر نتیجه‌ای نباشد، عبارت طوری دوباره جستجو می‌شود که انگار با چیدمان دیگر تایپ شده. با `{ keyboardFix: false }` خاموش می‌شود. |
| ورودی نامعتبر | `getCity(undefined)`، `searchCities(null)` و موارد مشابه خطای `TypeError` می‌دادند | مثل رشته‌ی خالی رفتار می‌کنند: `undefined`، آرایه‌ی خالی یا همه‌ی موارد. |
| گزینه‌ی `limit` | `limit` منفی چند مورد از آخر را حذف می‌کرد | `limit` منفی یا صفر یعنی بدون محدودیت. |
| `useProvinceCitySelect` | نام انگلیسی انتخاب‌ها را در state نگه می‌داشت | id را در state نگه می‌دارد. خروجی‌ها همان قبلی‌اند. شهری که متعلق به استان انتخاب‌شده نباشد حالا نادیده گرفته می‌شود. |
| `@code-plate/iran-cities/react` | یک نسخه‌ی کامل جداگانه از داده‌ها داشت (حدود ۲۳۸ کیلوبایت بدون minify) | از ورودی اصلی استفاده می‌کند. برنامه‌ای که هر دو را import کند دیگر داده را دو بار ship نمی‌کند و هر دو یک نمونه‌ی مشترک دارند. |
| `react` و `lite/react` | directive نداشتند | با `"use client"` شروع می‌شوند تا App Router در Next.js آن‌ها را ماژول کلاینت حساب کند. |

## قابلیت‌های جدید

- `@code-plate/iran-cities/lite` و `@code-plate/iran-cities/lite/react`: همان API بدون مختصات، حدود یک‌سوم سبک‌تر. مناسب برای انتخاب‌گر استان و شهر.
- کامپوننت‌های دسترس‌پذیر با تم CSS خام: `CityCombobox` و `ProvinceCitySelect` از `@code-plate/iran-cities/lite/react/components` با استایل `@code-plate/iran-cities/components.css`.
- اسکیمای اعتبارسنجی برای Zod (`/zod`) و Valibot (`/valibot`)، از جمله بررسی اینکه شهر متعلق به استان باشد.
- استان‌های همسایه: `getNeighborProvinces(query)`، `areNeighborProvinces(a, b)` و `Province.neighborIds`.
- مرز استان‌ها به‌صورت GeoJSON و `getProvinceAt({ lat, lng })` از `@code-plate/iran-cities/boundaries`.
- نام نمایشی انگلیسی: `nameEn` برای استان‌ها و شهرها و `provinceNameEn` برای شهرهای مسطح.
- `convertKeyboardLayout(text, 'fa' | 'en')`، `DATA_VERSION`، `DATA_CHANGES` و `getDataChanges(sinceVersion)`.
- نسخه‌های CSV، SQL، JSON و GeoJSON داده‌ها در `@code-plate/iran-cities/data/*`.
- `getDistance(from, to)` و `getNearestCities(point, { limit, minConfidence, maxDistanceKm })`.
- `isAmbiguousCityName(name)` و `normalize(text)`.
- `searchCities(query, { emptyQuery: 'none' })` برای query خالی به‌جای هر ۱۲۵۲ شهر، `[]` برمی‌گرداند.
- `useProvinceCitySelect({ initialProvince, initialCity })` برای فرم‌های ویرایش، و `useProvinceCitySelect({ value, onChange })` برای حالت controlled با react-hook-form، Formik و کتابخانه‌های مشابه.
- تایپ‌های جدید: `IranCities`، `IranCitiesGeo`، `IranCitiesHooks`، `LatLng`، `CoordinateConfidence`، `NearestCity`، `NearestCitiesOptions`، `Stats`، `ProvinceCityValue`، `ProvinceCitySelectOptions`، `ProvinceCitySelect`، `SearchState`، `CityComboboxProps`، `ProvinceCitySelectProps`، `DataChange`، `DataChangeType`، `KeyboardTarget`.

## Next.js

در پروژه‌ی Next.js لازم نیست چیزی را تغییر دهید. بهبودهای پیشنهادی:

```tsx
// app/page.tsx (Server Component): مستقیم از ورودی اصلی استفاده کنید
import { getCity, getProvincesList } from '@code-plate/iran-cities';

// app/address-form.tsx (Client Component): از هوک‌های lite استفاده کنید
'use client';
import { useProvinceCitySelect } from '@code-plate/iran-cities/lite/react';
```

- ورودی‌های هوک خودشان `"use client"` دارند. مثل هر هوک دیگری، فایل کامپوننتی که هوک را صدا می‌زند هم باید `'use client'` داشته باشد.
- در کامپوننت‌های کلاینت از `lite/react` استفاده کنید، مگر اینکه مرورگر مختصات لازم داشته باشد. این کار حدود ۸ کیلوبایت (brotli) از bundle کلاینت کم می‌کند.
- داده‌هایی که روی سرور می‌گیرید را می‌توانید به‌عنوان props به Client Componentها بدهید؛ اشیای freeze شده بدون مشکل serialize می‌شوند.
- با Next.js 14 (webpack و React 18)، Next.js 15 (webpack) و Next.js 16 (Turbopack و webpack و React 19)، App Router، رندر استاتیک و `next start` راستی‌آزمایی شده است.

## پیدا کردن کدهای درگیر

```bash
# مقادیری که ممکن است تغییر داده شوند (هر مورد را بررسی کنید)
grep -rnE "get(Provinces|AllCities|Cities|CitiesByName)\([^)]*\)\.(sort|push|pop|shift|unshift|splice|reverse|fill|copyWithin)\(" src

# جستجوی ۷ نامِ تغییرکرده بدون استان
grep -rnE "get(City|ProvinceOfCity)\(['\"](سردشت|sardasht|شهریار|shahriar|مهاباد|mahabad|رضوانشهر|rezvanshahr|حاجی ?آباد|hajjiabad|اردکان|ardakan|چناران|chenaran)['\"]\)" src

# اشیای City که دستی ساخته شده‌اند
grep -rnE ":\s*(Flat)?City\s*=\s*\{" src
```

اجرای تست‌ها در حالت strict (هر test runner با ESM یا TypeScript) تغییرات ناخواسته را به `TypeError` تبدیل می‌کند و پیدا کردنشان را ساده می‌کند.

## پرسش‌های رایج

**می‌توانم همچنان از 1.x استفاده کنم؟** بله. 1.x همچنان کار می‌کند، ولی اصلاحات داده و قابلیت‌های جدید را نمی‌گیرد.

**چرا داده‌ها freeze شده‌اند و به‌جایش همه‌جا کپی برنگردانده‌اید؟** توابعی که آرایه‌ی مشترک برمی‌گردانند در 1.x هم همین کار را می‌کردند و خیلی از برنامه‌ها به ثابت بودن identity آن‌ها وابسته‌اند (مثلاً در dependencyهای `useMemo` یا `useEffect`). کپی گرفتن در هر فراخوانی این رفتار را عوض می‌کرد و رندرهای اضافه ایجاد می‌کرد. freeze کردن identity را حفظ می‌کند و تغییر ناخواسته را به‌جای خراب کردن بی‌صدای داده‌ها، آشکار می‌کند. توابعی که در 1.x آرایه‌ی تازه برمی‌گرداندند، همچنان همین کار را می‌کنند.

**idها یا slugها عوض شده‌اند؟** نه. idها و slugهای ذخیره‌شده از 1.x همچنان معتبرند.

**نسخه‌ی 2.0 به Node.js، React یا TypeScript جدیدتری نیاز دارد؟** نه. حداقل‌ها همان 1.x است: Node.js 14، React 16.8 و TypeScript 3.9 برای تایپ‌ها.
