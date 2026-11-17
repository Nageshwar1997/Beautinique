import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/server.ts', 'src/service.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node24',
  fixedExtension: false,
  dts: false,
  sourcemap: true,
  clean: true,
});
