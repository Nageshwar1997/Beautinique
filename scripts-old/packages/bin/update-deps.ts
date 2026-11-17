import { parseUpdateDepsFlags } from '../lib/args.ts';
import { createContext } from '../lib/context.ts';
import { HELD } from '../lib/dependencies.ts';
import { updateDepsCommand } from '../lib/update-deps.ts';
import { isTerminal, main } from './_main.ts';

const HELP = `npm run update-deps -- [options]
(shortcuts: npm run update-deps:minor, npm run update-deps:patch)

Moves the outside dependencies of every package.json (root, packages, frontend and backend apps) to
newer versions from npm, shows the plan, asks, then runs npm install. Each range keeps its style
(^, ~ or exact). Our own @beautinique packages are left to the release CLI. Held, never touched:
${[...HELD].map(([name, why]) => `  ${name}: ${why}`).join('\n')}

  --level <level>   how far to go (default major):
                      patch   bug fixes only        1.2.3 -> 1.2.9
                      minor   nothing breaking      1.2.3 -> 1.9.0  (0.3.1 -> 0.3.9)
                      major   the newest release    1.2.3 -> 3.0.0
  --dry-run         show the plan; change nothing
  --yes, -y         do not ask before writing
  --help, -h        this help

Never picks a version above npm's "latest" tag, a deprecated one, a prerelease or one that needs another
Node.js. When a dependency's peer range does not accept a new version yet, one of the two is held back.
If npm install fails or the run is stopped, every package.json and package-lock.json goes back as it was.`;

await main(async () => {
  const flags = parseUpdateDepsFlags(process.argv.slice(2));
  if (flags.help) {
    console.log(HELP);
    return;
  }
  const ctx = createContext({
    interactive: !flags.yes && isTerminal(),
    assumeYes: flags.yes,
    flagHint: 'Run it in a terminal, or pass --yes (see --help).',
  });
  await updateDepsCommand(ctx, { level: flags.level, dryRun: flags.dryRun });
});
