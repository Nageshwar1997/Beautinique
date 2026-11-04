import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'browser',
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
});
