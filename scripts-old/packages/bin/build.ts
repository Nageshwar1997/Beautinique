import { parseBuildArgs } from '../lib/args.ts';
import { buildCommand } from '../lib/commands.ts';
import { createContext } from '../lib/context.ts';
import { main } from './_main.ts';

const HELP = `npm run build [-- --for <workspace>]

Builds every workspace that has a build script, dependencies first (devDependencies too). Run it after
a fresh clone, before anything that imports a package's dist.

  --for <names>   only these workspaces (package.json names, comma separated or repeated) and the
                  internal packages they need, e.g. --for customer on Vercel, --for bundle on Render
  --help, -h      this help`;

await main(async () => {
  const args = parseBuildArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  await buildCommand(createContext({ interactive: false }), args.for);
});
