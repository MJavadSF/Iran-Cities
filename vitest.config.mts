import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/generated/**'],
      reporter: ['text-summary', 'lcov'],
      thresholds: { statements: 95, branches: 85, functions: 95, lines: 97 },
    },
  },
});
