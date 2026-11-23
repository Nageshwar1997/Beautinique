// `node scripts/foundation/bin/env-files.ts test`: every deployable's `.env.test` from the [TEST]
// section of its `.env.example`. CI runs it before the tests (docs/OPERATIONS.md §1 rule 9); it needs
// no secret, since the TEST values are fake. Setup makes both files with the same code.
import { join } from 'node:path';

import { ROOT } from '../src/constants/paths.ts';
import { deployablesWithEnvExample, writeEnvFiles } from '../src/env-files.ts';

if (process.argv[2] !== 'test') {
  console.error('Usage: node scripts/foundation/bin/env-files.ts test');
  process.exit(1);
}

const deployables = deployablesWithEnvExample(ROOT);
for (const deployable of deployables) {
  for (const result of writeEnvFiles(join(ROOT, deployable), ['TEST'])) {
    console.log(`${result.status.padEnd(8)} ${deployable}/${result.file}`);
  }
}
if (deployables.length === 0) console.log('No deployable has a .env.example yet.');
