export interface City {
  /** شناسه انگلیسی/لاتین شهر (kebab-case) - یکتا در سطح کل کشور نیست، در سطح استان یکتاست */
  en: string;
  /** نام فارسی شهر */
  fa: string;
}

export interface Province {
  /** شناسه انگلیسی/لاتین استان (kebab-case) - یکتا در سطح کشور */
  en: string;
  /** نام فارسی استان */
  fa: string;
  cities: City[];
}

/** خروجی مسطح‌شده؛ برای جستجو و لیست‌های ساده مفید است */
export interface FlatCity extends City {
  provinceEn: string;
  provinceFa: string;
}

export type Locale = 'en' | 'fa';

export interface SearchOptions {
  /** تعداد بیشینه نتایج (پیش‌فرض: بدون محدودیت) */
  limit?: number;
  /** جستجو فقط در فارسی، فقط در انگلیسی یا هر دو (پیش‌فرض: both) */
  locale?: Locale | 'both';
}
