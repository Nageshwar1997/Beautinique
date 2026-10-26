import { defineConfig } from 'tsdown';

export default defineConfig({
  // instrument: preloaded with node --import (Sentry before Express and the drivers)
  entry: ['src/start.ts', 'src/instrument.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node24',
  fixedExtension: false,
  dts: false,
  sourcemap: true,
  clean: true,
});
