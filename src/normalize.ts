const CHAR_MAP: Readonly<Record<string, string>> = {
  'ي': 'ی',
  'ى': 'ی',
  'ئ': 'ی',
  'ك': 'ک',
  'ة': 'ه',
  'ۀ': 'ه',
  'ؤ': 'و',
  'أ': 'ا',
  'إ': 'ا',
  'آ': 'ا',
  'ٱ': 'ا',
};

export function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[يىئكةۀؤأإآٱ]/g, (ch) => CHAR_MAP[ch] ?? ch)
    .replace(/[‌‍\s\-_'’`]+/g, '');
}
