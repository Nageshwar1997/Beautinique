// @ts-check
import { packageConfig } from '../../../configs/eslint-config.js';

export default packageConfig({
  platform: 'neutral',
  tsconfigRootDir: import.meta.dirname,
  // the one list of India's states and union territories (RULES §3.4)
  geoDataFiles: ['src/states.ts'],
});
