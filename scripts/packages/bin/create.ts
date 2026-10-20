import { parseArgs } from 'node:util';

import { createContext } from '../lib/context.ts';
import { createPackage } from '../lib/create/create.ts';
import { CliError } from '../lib/errors.ts';
import { isTerminal, main } from './_main.ts';

const HELP = `npm run create -- [options]

Creates a package in packages/<category>/<name> named @beautinique/<category>-<name>, links it into the
workspace (npm install) and runs its checks. Without options it asks.

  --category <c>      shared, frontend or backend
  --kind <k>          ts, react or css (react and css: frontend only)
  --name <n>          folder name, e.g. date-format
  --description <d>   one sentence
  --keywords <k>      comma separated
  --visibility <v>    public (published to npm) or private (monorepo only)
  --extends <s>       a shared package to build on (its folder name), or none
  --yes, -y           do not ask (every option above is then required)
  --help, -h          this help`;

await main(async () => {
  let values;
  try {
    ({ values } = parseArgs({
      args: process.argv.slice(2),
      strict: true,
      options: {
        category: { type: 'string' },
        kind: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        keywords: { type: 'string' },
        visibility: { type: 'string' },
        extends: { type: 'string' },
        'skip-install': { type: 'boolean', default: false },
        yes: { type: 'boolean', short: 'y', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }));
  } catch (error) {
    throw new CliError((error as Error).message, { code: 'BAD_FLAGS', hint: 'See --help.' });
  }
  if (values.help) {
    console.log(HELP);
    return;
  }
  const ctx = createContext({
    interactive: !values.yes && isTerminal(),
    assumeYes: values.yes,
    flagHint: 'Pass every option (see --help).',
  });
  await createPackage(ctx, { ...values, skipInstall: values['skip-install'] });
});
