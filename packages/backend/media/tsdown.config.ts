import { defineConfig } from 'tsdown';

// Two entries: the main one with the ports, and `testing` with the fakes, which a service imports
// only in its tests (docs/RULES.md RT-11).
export default defineConfig({
  entry: ['src/index.ts', 'src/testing.ts'],
  format: 'esm',
  dts: true,
  clean: true,
});
