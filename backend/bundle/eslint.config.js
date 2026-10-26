// @ts-check
import { packageConfig } from '../../configs/eslint-config.js';

export default packageConfig({
  platform: 'node',
  tsconfigRootDir: import.meta.dirname,
  // instrument.ts reads the process-wide Sentry settings before anything else loads
  envFiles: ['src/config.ts', 'src/instrument.ts'],
});
