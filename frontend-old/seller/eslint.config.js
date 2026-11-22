// @ts-check
import { packageConfig } from '../../configs/eslint-config.js';

export default packageConfig({
  platform: 'browser',
  react: true,
  tsconfigRootDir: import.meta.dirname,
});
