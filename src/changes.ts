import type { DataChange } from './types';

export const DATA_VERSION: string = '2.0.0';

export const DATA_CHANGES: readonly DataChange[] = Object.freeze([
  Object.freeze({
    version: '1.2.0',
    type: 'removed',
    provinceId: 20,
    before: Object.freeze({ fa: 'گلوگاه' }),
    note: 'Duplicate entry of Galugah in Mazandaran removed; the remaining entry keeps the city.',
  }),
  Object.freeze({
    version: '1.2.0',
    type: 'renamed',
    cityId: 402,
    before: Object.freeze({ en: "sowme'eh-sara", slug: "gilan/sowme'eh-sara" }),
    after: Object.freeze({ en: 'sowmeeh-sara', fa: 'صومعه سرا', slug: 'gilan/sowmeeh-sara' }),
    note: 'English id normalized to kebab-case; the old id still resolves.',
  }),
  Object.freeze({
    version: '1.2.0',
    type: 'renamed',
    cityId: 672,
    before: Object.freeze({ en: 'هلشی', slug: 'kermanshah/هلشی' }),
    after: Object.freeze({ en: 'halashi', fa: 'هلشی', slug: 'kermanshah/halashi' }),
    note: 'English id was a Persian string; the old id still resolves.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 145,
    before: Object.freeze({ fa: 'كليبر' }),
    after: Object.freeze({ fa: 'کلیبر' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 147,
    before: Object.freeze({ fa: 'صوفيان' }),
    after: Object.freeze({ fa: 'صوفیان' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 152,
    before: Object.freeze({ fa: 'كلوانق' }),
    after: Object.freeze({ fa: 'کلوانق' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 418,
    before: Object.freeze({ fa: 'لوندويل' }),
    after: Object.freeze({ fa: 'لوندویل' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 438,
    before: Object.freeze({ fa: 'ليسار' }),
    after: Object.freeze({ fa: 'لیسار' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 487,
    before: Object.freeze({ fa: 'مريانج' }),
    after: Object.freeze({ fa: 'مریانج' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 529,
    before: Object.freeze({ fa: 'تازيان پايين' }),
    after: Object.freeze({ fa: 'تازیان پایین' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 545,
    before: Object.freeze({ fa: 'كوخرد' }),
    after: Object.freeze({ fa: 'کوخرد' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 551,
    before: Object.freeze({ fa: 'اركواز' }),
    after: Object.freeze({ fa: 'ارکواز' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 564,
    before: Object.freeze({ fa: 'موسيان' }),
    after: Object.freeze({ fa: 'موسیان' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 714,
    before: Object.freeze({ fa: 'چويبده' }),
    after: Object.freeze({ fa: 'چویبده' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 716,
    before: Object.freeze({ fa: 'صيدون' }),
    after: Object.freeze({ fa: 'صیدون' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 749,
    before: Object.freeze({ fa: 'گلگير' }),
    after: Object.freeze({ fa: 'گلگیر' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 910,
    before: Object.freeze({ fa: 'پايين هولار' }),
    after: Object.freeze({ fa: 'پایین هولار' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 947,
    before: Object.freeze({ fa: 'اسفرورين' }),
    after: Object.freeze({ fa: 'اسفرورین' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 1025,
    before: Object.freeze({ fa: 'كدكن' }),
    after: Object.freeze({ fa: 'کدکن' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 1077,
    before: Object.freeze({ fa: 'گلمورتي' }),
    after: Object.freeze({ fa: 'گلمورتی' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 1107,
    before: Object.freeze({ fa: 'آيسک' }),
    after: Object.freeze({ fa: 'آیسک' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 1114,
    before: Object.freeze({ fa: 'طبس مسينا' }),
    after: Object.freeze({ fa: 'طبس مسینا' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 1199,
    before: Object.freeze({ fa: 'ايواوغلی' }),
    after: Object.freeze({ fa: 'ایواوغلی' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 1209,
    before: Object.freeze({ fa: 'خليفان' }),
    after: Object.freeze({ fa: 'خلیفان' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 1225,
    before: Object.freeze({ fa: 'بفروييه' }),
    after: Object.freeze({ fa: 'بفروییه' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 1235,
    before: Object.freeze({ fa: 'قيدار' }),
    after: Object.freeze({ fa: 'قیدار' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 1236,
    before: Object.freeze({ fa: 'هيدج' }),
    after: Object.freeze({ fa: 'هیدج' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
  Object.freeze({
    version: '2.0.0',
    type: 'spelling',
    cityId: 1237,
    before: Object.freeze({ fa: 'صائين قلعه' }),
    after: Object.freeze({ fa: 'صائین قلعه' }),
    note: 'Arabic letters replaced with Persian ی/ک.',
  }),
] as DataChange[]);

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function getDataChanges(sinceVersion?: string): DataChange[] {
  if (!sinceVersion) return DATA_CHANGES.slice();
  return DATA_CHANGES.filter((change) => compareVersions(change.version, sinceVersion) > 0);
}
