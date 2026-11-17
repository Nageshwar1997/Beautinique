// @ts-check
import { packageConfig } from '../../../configs/eslint-config.js';

export default packageConfig({
  platform: 'neutral',
  tsconfigRootDir: import.meta.dirname,
});
