// @ts-check
import { packageConfig } from '../../../configs/eslint-config.js';

export default packageConfig({
  platform: 'neutral',
  tsconfigRootDir: import.meta.dirname,
  // the one package that imports zod directly (and re-exports it as `z`)
  zodPackage: true,
});
