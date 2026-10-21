// @ts-check
import { packageConfig } from '../../../configs/eslint-config.js';

export default packageConfig({
  platform: 'node',
  tsconfigRootDir: import.meta.dirname,
  // the outbox relay: the one place that opens MongoDB change streams
  changeStreamPackage: true,
});
