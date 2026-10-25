import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/start.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node24',
  fixedExtension: false,
  dts: false,
  sourcemap: true,
  clean: true,
});
