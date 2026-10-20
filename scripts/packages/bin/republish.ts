import { parseCommonFlags, SELECTION_HELP } from '../lib/args.ts';
import { republishCommand } from '../lib/commands.ts';
import { createContext } from '../lib/context.ts';
import { isTerminal, main } from './_main.ts';

const HELP = `npm run republish -- [options]

Releases a new version of published packages: bump (one type for all, or per package), add dependents
that need a new version (their range breaks, a peer dependency moved, or a re-exported dependency
changed major), rewrite internal ranges, check everything, then publish from this laptop or prepare the
release for the GitHub workflow. Ends with a release commit and tags (not pushed).

${SELECTION_HELP}

Other options:
  --bump <type>        patch, minor or major for every selected package
  --cascade <policy>   dependents that need a new version: ask (default), yes, no
  --target <where>     laptop (publish now) or github (prepare for the Release workflow);
                       without a terminal it is laptop
  --dry-run            run every check and \`npm publish --dry-run\`; change nothing
  --yes, -y            do not ask; selection and --bump flags are then required
  --help, -h           this help

Releases are made from the main branch, with a clean working tree and an npm login (npm run login).`;

await main(async () => {
  const flags = parseCommonFlags(process.argv.slice(2));
  if (flags.help) {
    console.log(HELP);
    return;
  }
  const ctx = createContext({
    interactive: !flags.yes && isTerminal(),
    assumeYes: flags.yes,
    flagHint: 'Pass the selection, --bump and --target flags (see --help).',
  });
  if (!ctx.interactive && flags.target === null) {
    flags.target = 'laptop';
  }
  await republishCommand(ctx, flags);
});
