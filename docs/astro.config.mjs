import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mjavadsf.github.io',
  base: '/Iran-Cities',
  integrations: [
    react(),
    starlight({
      title: { en: 'Iran Cities', fa: 'شهرهای ایران' },
      description: 'Every province and city of Iran, in Persian and English, with search, coordinates and boundaries.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/MJavadSF/Iran-Cities' }],
      editLink: { baseUrl: 'https://github.com/MJavadSF/Iran-Cities/edit/main/docs/' },
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        fa: { label: 'فارسی', lang: 'fa', dir: 'rtl' },
      },
      customCss: ['@fontsource-variable/vazirmatn', './src/styles/custom.css'],
      sidebar: [
        {
          label: 'Guides',
          translations: { fa: 'راهنماها' },
          items: [
            { slug: 'guides/getting-started', translations: { fa: 'شروع' } },
            { slug: 'guides/nextjs', translations: { fa: 'Next.js و React' } },
            { slug: 'guides/components', translations: { fa: 'کامپوننت‌ها' } },
            { slug: 'guides/validation', translations: { fa: 'اعتبارسنجی فرم' } },
            { slug: 'guides/geography', translations: { fa: 'جغرافیا و نقشه' } },
          ],
        },
        {
          label: 'Reference',
          translations: { fa: 'مرجع' },
          items: [
            { slug: 'reference/api', translations: { fa: 'API' } },
            { slug: 'reference/data', translations: { fa: 'داده‌ها' } },
          ],
        },
        { slug: 'playground', translations: { fa: 'زمین بازی' } },
      ],
    }),
  ],
});
