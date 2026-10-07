export type CityId = number;

export type ProvinceId = number;

export interface Coordinates {
  lat: number;
  lng: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface City {
  id: CityId;
  isCapital: boolean;
  coordinates?: Coordinates;
  slug: CityKey;
  en: string;
  fa: string;
}

export interface Province {
  id: ProvinceId;
  en: string;
  fa: string;
  phoneCode: string;
  capitalId: CityId;
  cities: City[];
}

export interface ProvinceListItem {
  id: ProvinceId;
  en: string;
  fa: string;
  phoneCode: string;
  capitalId: CityId;
}

export interface FlatCity extends City {
  provinceId: ProvinceId;
  provinceEn: string;
  provinceFa: string;
  phoneCode: string;
}

export type Locale = 'en' | 'fa';

/** کلید پایدار برای ارجاع به یک شهر (همان City.slug) - برای استفاده در پکیج‌های وابسته */
export type CityKey = string;

/** ورودی توابع lookup: id عددی، یا نام انگلیسی/فارسی */
export type Query = string | number;

export interface SearchOptions {
  /** تعداد بیشینه نتایج (پیش‌فرض: بدون محدودیت) */
  limit?: number;
  /** جستجو فقط در فارسی، فقط در انگلیسی یا هر دو (پیش‌فرض: both) */
  locale?: Locale | 'both';
  /** فعال‌سازی جستجوی فازی (تحمل غلط تایپی) بر پایه‌ی فاصله‌ی ادیت - پیش‌فرض: false */
  fuzzy?: boolean;
  /** بیشینه فاصله‌ی ادیت مجاز در حالت fuzzy (پیش‌فرض: 2) */
  maxDistance?: number;
}
