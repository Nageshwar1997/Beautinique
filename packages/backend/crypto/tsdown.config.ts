import { defineConfig } from 'tsdown';

// Three entries: the main one for every service, `break-glass` only for the owner's laptop (it
// opens held copies), and `mongo` for the `sealed_records` of a MongoDB service.
export default defineConfig({
  entry: ['src/index.ts', 'src/break-glass.ts', 'src/mongo.ts'],
  format: 'esm',
  dts: true,
  clean: true,
});
