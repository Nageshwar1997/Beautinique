import { parseArgs } from 'node:util';

import { CliError } from './cli-error.ts';

export interface ParsedArgs {
  command: string | undefined;
  /** Package names after the command; none means every package. */
  names: string[];
  dryRun: boolean;
  help: boolean;
  /** `publish --ci`: the workflow's mode, only inside GitHub Actions. */
  ci: boolean;
  category: string | undefined;
  name: string | undefined;
  description: string | undefined;
  /** `republish`: patch, minor or major for every chosen package. */
  bump: string | undefined;
  /** `update-deps`: the biggest step to take (patch, minor or major). */
  level: string | undefined;
}

// `<command> [package...] [flags]`. A flag nobody knows is an error, not ignored.
export function parseArguments(argv: string[]): ParsedArgs {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        'dry-run': { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
        ci: { type: 'boolean', default: false },
        category: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        bump: { type: 'string' },
        level: { type: 'string' },
      },
    });
    const [command, ...names] = positionals;
    return {
      command,
      names,
      dryRun: values['dry-run'],
      help: values.help,
      ci: values.ci,
      category: values.category,
      name: values.name,
      description: values.description,
      bump: values.bump,
      level: values.level,
    };
  } catch (error) {
    throw new CliError(
      'USAGE',
      (error as Error).message,
      'Run the command with --help to see the commands and flags.',
    );
  }
}
