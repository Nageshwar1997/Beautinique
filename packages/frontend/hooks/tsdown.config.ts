import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { index: 'src/index.ts', router: 'src/router/index.ts' },
  format: 'esm',
  platform: 'browser',
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
});
