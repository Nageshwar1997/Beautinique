import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { index: 'src/index.ts', monitoring: 'src/monitoring.ts' },
  format: 'esm',
  platform: 'browser',
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
});
