import { parseCommonFlags, SELECTION_HELP } from '../lib/args.ts';
import { publishCommand } from '../lib/commands.ts';
import { createContext } from '../lib/context.ts';
import { isTerminal, main } from './_main.ts';

const HELP = `npm run publish -- [options]

Publishes packages whose package.json version is not on npm yet: new packages, and versions that a
republish prepared. Checks every package first (build, typecheck, lint, test, package contents),
publishes dependencies first, makes a release commit and tags (not pushed).

${SELECTION_HELP}

Other options:
  --dry-run     run every check and \`npm publish --dry-run\`; change nothing
  --yes, -y     do not ask; selection flags are then required
  --ci          GitHub Release workflow only: check and pack every waiting version (each must be
                tagged on the commit being built) for the publish job
  --pack-dir    with --ci: where the tarballs and release.json go (default release-tarballs)
  --help, -h    this help

Releases are made from the release branch, with a clean working tree and an npm login (npm run login).`;

await main(async () => {
  const flags = parseCommonFlags(process.argv.slice(2));
  if (flags.help) {
    console.log(HELP);
    return;
  }
  const ctx = createContext({
    interactive: !flags.yes && !flags.ci && isTerminal(),
    assumeYes: flags.yes || flags.ci,
    flagHint: 'Pass --all, --category or --packages (see --help).',
  });
  await publishCommand(ctx, flags);
});
