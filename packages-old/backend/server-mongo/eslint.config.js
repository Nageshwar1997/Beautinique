// @ts-check
import { packageConfig } from '../../../configs/eslint-config.js';

export default packageConfig({
  platform: 'node',
  tsconfigRootDir: import.meta.dirname,
  // the one package that imports the mongodb driver directly (and re-exports it)
  mongoPackage: true,
});
