import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' };
  },
  // داده‌ی JSON مستقیم داخل باندل drop می‌شود تا نصب‌کننده به فایل جدا نیازی نداشته باشد
  loader: { '.json': 'json' },
});
