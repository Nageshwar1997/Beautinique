import { parseHelpOnly } from '../lib/args.ts';
import { buildCommand } from '../lib/commands.ts';
import { createContext } from '../lib/context.ts';
import { main } from './_main.ts';

const HELP = `npm run build

Builds every workspace that has a build script, dependencies first (devDependencies too). Run it after
a fresh clone, before anything that imports a package's dist.

  --help, -h    this help`;

await main(async () => {
  if (parseHelpOnly(process.argv.slice(2))) {
    console.log(HELP);
    return;
  }
  await buildCommand(createContext({ interactive: false }));
});
