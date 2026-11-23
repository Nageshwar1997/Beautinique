import { parseArgs } from 'node:util';

import { CliError } from './cli-error.ts';

export interface ParsedArgs {
  command: string | undefined;
  /** Package names after the command; none means every package. */
  names: string[];
  dryRun: boolean;
  help: boolean;
}

// `<command> [package...] [--dry-run] [--help]`. A flag nobody knows is an error, not ignored.
export function parseArguments(argv: string[]): ParsedArgs {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        'dry-run': { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
    const [command, ...names] = positionals;
    return { command, names, dryRun: values['dry-run'], help: values.help };
  } catch (error) {
    throw new CliError(
      'USAGE',
      (error as Error).message,
      'Run the command with --help to see the commands and flags.',
    );
  }
}
