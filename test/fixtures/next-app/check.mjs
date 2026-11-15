const url = process.argv[2] ?? 'http://localhost:3000';
const expected = [
  'server:<!-- -->1252<!-- -->:<!-- -->فارس<!-- -->:<!-- -->31',
  'form:<!-- -->شیراز',
  'search:<!-- -->مشهد',
  'neighbors:<!-- -->اصفهان،مرکزی،سمنان،تهران',
  'zod:<!-- -->ok',
  'role="combobox"',
  'value="تهران"',
  'class="ic-group"',
];

let html = '';
for (let attempt = 0; attempt < 30 && !html; attempt++) {
  try {
    const response = await fetch(url);
    if (response.ok) html = await response.text();
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

const missing = expected.filter((part) => !html.includes(part));
if (missing.length) {
  console.error('Next.js page is missing:', missing);
  process.exit(1);
}
console.log('Next.js page rendered correctly');
