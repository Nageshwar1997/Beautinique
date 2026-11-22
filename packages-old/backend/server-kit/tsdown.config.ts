import { defineConfig } from 'tsdown';

export default defineConfig({
  // monitoring alone too: a process preloads it (node --import) before Express and the drivers load
  entry: ['src/index.ts', 'src/monitoring.ts'],
  format: 'esm',
  platform: 'node',
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
});
