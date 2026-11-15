const LATIN_TO_PERSIAN: Readonly<Record<string, string>> = {
  q: 'ض',
  w: 'ص',
  e: 'ث',
  r: 'ق',
  t: 'ف',
  y: 'غ',
  u: 'ع',
  i: 'ه',
  o: 'خ',
  p: 'ح',
  '[': 'ج',
  ']': 'چ',
  a: 'ش',
  s: 'س',
  d: 'ی',
  f: 'ب',
  g: 'ل',
  h: 'ا',
  j: 'ت',
  k: 'ن',
  l: 'م',
  ';': 'ک',
  "'": 'گ',
  z: 'ظ',
  x: 'ط',
  c: 'ز',
  v: 'ر',
  b: 'ذ',
  n: 'د',
  m: 'پ',
  ',': 'و',
  '\\': 'پ',
  '`': 'پ',
  C: 'ژ',
  H: 'آ',
};

const PERSIAN_TO_LATIN: Readonly<Record<string, string>> = (() => {
  const map: Record<string, string> = {};
  for (const [latin, persian] of Object.entries(LATIN_TO_PERSIAN)) {
    if (!(persian in map)) map[persian] = latin.toLowerCase();
  }
  map['ي'] = 'd';
  map['ك'] = ';';
  map['ئ'] = 'm';
  return map;
})();

const HAS_LATIN_LETTER = /[a-z]/i;
const HAS_PERSIAN_LETTER = /[؀-ۿ]/;

export type KeyboardTarget = 'fa' | 'en';

export function convertKeyboardLayout(text: string, to: KeyboardTarget): string {
  const input = typeof text === 'string' ? text : '';
  let out = '';
  for (const ch of input) {
    if (to === 'fa') {
      out += LATIN_TO_PERSIAN[ch] ?? LATIN_TO_PERSIAN[ch.toLowerCase()] ?? ch;
    } else {
      out += PERSIAN_TO_LATIN[ch] ?? ch;
    }
  }
  return out;
}

export function guessKeyboardTarget(text: string): KeyboardTarget | undefined {
  if (typeof text !== 'string') return undefined;
  const latin = HAS_LATIN_LETTER.test(text);
  const persian = HAS_PERSIAN_LETTER.test(text);
  if (latin && !persian) return 'fa';
  if (persian && !latin) return 'en';
  return undefined;
}
