// @ts-check
import { packageConfig } from '../../configs/eslint-config.js';

export default packageConfig({
  platform: 'node',
  tsconfigRootDir: import.meta.dirname,
  envFiles: ['src/config.ts'],
});
