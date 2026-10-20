import { parseCommonFlags, SELECTION_HELP } from '../lib/args.ts';
import { verifyCommand } from '../lib/commands.ts';
import { createContext } from '../lib/context.ts';
import { isTerminal, main } from './_main.ts';

const HELP = `npm run verify -- [options]

Runs every check a publish runs (build, typecheck, lint, test, check, npm pack contents, publint,
arethetypeswrong) without publishing anything. CI runs it with --all.

${SELECTION_HELP}

  --yes, -y     do not ask
  --help, -h    this help`;

await main(async () => {
  const flags = parseCommonFlags(process.argv.slice(2));
  if (flags.help) {
    console.log(HELP);
    return;
  }
  const ctx = createContext({
    interactive: !flags.yes && !flags.ci && isTerminal(),
    assumeYes: flags.yes || flags.ci,
  });
  await verifyCommand(ctx, flags);
});
