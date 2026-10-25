import { parseArgs } from 'node:util';

import { createContext } from '../lib/context.ts';
import { createFrontendApp } from '../lib/create/apps.ts';
import { createBackendApp } from '../lib/create/backend.ts';
import { createPackage } from '../lib/create/create.ts';
import { CliError } from '../lib/errors.ts';
import { isTerminal, main } from './_main.ts';

const HELP = `npm run create -- [options]

Creates a package, a frontend app or a backend app, links it into the workspace (npm install) and runs
its checks. Without options it asks. Shortcuts: npm run create:app, npm run create:backend.

  --type <t>          package, app (frontend) or backend

Package (packages/<category>/<name>, named @beautinique/<category>-<name>):
  --category <c>      shared, frontend or backend
  --kind <k>          ts, react or css (react and css: frontend only)
  --name <n>          folder name, e.g. date-format
  --description <d>   one sentence
  --keywords <k>      comma separated
  --visibility <v>    public (published to npm) or private (monorepo only)
  --extends <s>       a shared package to build on (its folder name), or none

Frontend app (frontend/<app>; one of the 11 apps in shared-contracts):
  --app <a>           customer, seller, admin, superadmin, master, support, finance, logistics,
                      delivery, growth or creator

Backend app (backend/<name>; one of the 5 deployables, or the bundle that runs them all):
  --deployable <d>    gateway, identity, payments, notify, core or bundle

  --yes, -y           do not ask (the options of the chosen type are then required)
  --help, -h          this help`;

type CreateType = 'package' | 'app' | 'backend';
const TYPES: readonly CreateType[] = ['package', 'app', 'backend'];

await main(async () => {
  let values;
  try {
    ({ values } = parseArgs({
      args: process.argv.slice(2),
      strict: true,
      options: {
        type: { type: 'string' },
        category: { type: 'string' },
        kind: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        keywords: { type: 'string' },
        visibility: { type: 'string' },
        extends: { type: 'string' },
        app: { type: 'string' },
        deployable: { type: 'string' },
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
    flagHint: 'Pass every option of the chosen type (see --help).',
  });
  if (values.type !== undefined && !(TYPES as readonly string[]).includes(values.type)) {
    throw new CliError(`--type must be one of: ${TYPES.join(', ')}.`, { code: 'BAD_FLAGS' });
  }
  const type =
    (values.type as CreateType | undefined) ??
    (values.app !== undefined
      ? 'app'
      : values.deployable !== undefined
        ? 'backend'
        : values.category !== undefined
          ? 'package'
          : await ctx.prompt.select<CreateType>('What do you want to create?', [
              {
                name: 'Package       (packages/<shared|frontend|backend>/<name>)',
                value: 'package',
              },
              { name: 'Frontend app  (frontend/<app>: Vite / React Router)', value: 'app' },
              { name: 'Backend app   (backend/<name>: Node + Express)', value: 'backend' },
            ]));
  const skipInstall = values['skip-install'];
  if (type === 'app') {
    await createFrontendApp(ctx, { app: values.app, skipInstall });
  } else if (type === 'backend') {
    await createBackendApp(ctx, { deployable: values.deployable, skipInstall });
  } else {
    await createPackage(ctx, { ...values, skipInstall });
  }
});
