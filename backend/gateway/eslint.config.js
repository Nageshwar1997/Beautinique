// @ts-check
import { packageConfig } from '../../configs/eslint-config.js';

export default packageConfig({
  platform: 'node',
  tsconfigRootDir: import.meta.dirname,
  envFiles: ['src/config.ts', 'test/env.ts'],
  // the reverse proxy streams bodies both ways and cuts them off itself (RULES §3)
  httpProxyFiles: ['src/proxy.ts'],
});
