import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    lite: 'src/lite.ts',
    react: 'src/react.ts',
    'lite-react': 'src/lite-react.ts',
    'react-components': 'src/react-components.ts',
    'lite-react-components': 'src/lite-react-components.ts',
    boundaries: 'src/boundaries.ts',
    zod: 'src/zod.ts',
    valibot: 'src/valibot.ts',
  },
  format: ['esm', 'cjs'],
  platform: 'neutral',
  target: 'es2019',
  fixedExtension: true,
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  inputOptions: {
    onLog(level, log, handler) {
      if (log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes('use client')) return;
      handler(level, log);
    },
  },
});
