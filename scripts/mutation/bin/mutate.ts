import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { packageDirOf, parseOnly } from '../lib/cli.ts';
import { MutationError } from '../lib/list.ts';
import { runMutations } from '../lib/runner.ts';

const HELP = `npm run mutate -- --package <category>-<name> [options]

Mutation testing (RULES §6): puts the deliberate bugs of the package's test/mutations.ts into a
throwaway copy one by one and checks that the tests catch each. The real files are never changed.
Backend packages run against the mutation MongoDB and Valkey: start them with
\`npm run infra:mutation:up\` (or set MONGO_TEST_URI / REDIS_TEST_URL).

  --package <p>     e.g. backend-server-queue (packages/backend/server-queue)
  --changed         only mutations on code changed since --base (RULES §6: changed lines)
  --base <ref>      git ref for --changed (default HEAD: the uncommitted changes)
  --only <list>     only these mutation numbers, e.g. 3,5,12
  --show-fails      print which tests caught each mutation
  --help, -h        this help

Exit code 1 when a mutation survives without a "survives" note in the list.`;

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      package: { type: 'string' },
      changed: { type: 'boolean', default: false },
      base: { type: 'string' },
      only: { type: 'string' },
      'show-fails': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  if (values.help) {
    console.log(HELP);
    return;
  }
  if (values.package === undefined) throw new MutationError('--package is required (see --help)');
  if (values.base !== undefined && !values.changed) {
    throw new MutationError('--base only goes with --changed');
  }
  const root = resolve(import.meta.dirname, '..', '..', '..');
  const packageDir = packageDirOf(values.package);
  if (!existsSync(join(root, packageDir, 'package.json'))) {
    throw new MutationError(`${packageDir} is not a package of this repo`);
  }
  const summary = await runMutations({
    root,
    packageDir,
    ...(values.only === undefined ? {} : { only: parseOnly(values.only) }),
    ...(values.changed ? { changedSince: values.base ?? 'HEAD' } : {}),
    showFails: values['show-fails'],
    log: (line) => {
      console.log(line);
    },
  });
  if (summary.unexpected.length > 0) process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  if (error instanceof MutationError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
