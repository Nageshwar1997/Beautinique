import { parseArguments } from './args.ts';
import { build, type RunTurbo } from './build.ts';
import { CliError } from './cli-error.ts';
import type { Ask } from './confirm.ts';
import type { Logger } from './logger.ts';

export interface CliContext {
  root: string;
  log: Logger;
  /** Used by the commands that write or publish; `build` does not ask. */
  ask: Ask;
  runTurbo?: RunTurbo | undefined;
}

const COMMANDS = {
  build: 'Build all packages, or the named ones, each after the packages it needs.',
} as const;

function usage(): string {
  const lines = Object.entries(COMMANDS).map(([name, summary]) => `  ${name.padEnd(8)} ${summary}`);
  return [
    'Usage: npm run packages:<command> -- [package...] [--dry-run]',
    '',
    'Commands:',
    ...lines,
    '',
    'Flags: --dry-run (show the plan, change nothing), --help.',
  ].join('\n');
}

// Runs one command and returns the exit code. A CliError is reported with its code and hint and
// gives exit code 1; any other error is a bug and is reported with its stack.
export function main(argv: string[], context: CliContext): number {
  const { log } = context;
  try {
    const args = parseArguments(argv);
    if (args.help || args.command === undefined) {
      log.info(usage());
      return args.help ? 0 : 1;
    }
    if (args.command === 'build') {
      return build({
        root: context.root,
        names: args.names,
        dryRun: args.dryRun,
        log,
        run: context.runTurbo,
      });
    }
    throw new CliError(
      'COMMAND_UNKNOWN',
      `Unknown command: ${args.command}.`,
      `Commands: ${Object.keys(COMMANDS).join(', ')}.`,
    );
  } catch (error) {
    log.error(error);
    return 1;
  }
}
