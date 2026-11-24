import { parseArguments } from './args.ts';
import { build } from './build.ts';
import { CliError } from './cli-error.ts';
import type { Ask } from './confirm.ts';
import { create } from './create.ts';
import type { Exec } from './exec.ts';
import type { Logger } from './logger.ts';
import { publish } from './publish.ts';
import { republish } from './republish.ts';
import { status } from './status.ts';
import { updateDeps } from './update-deps.ts';
import { verify } from './verify.ts';

export interface CliContext {
  root: string;
  log: Logger;
  /** Used by the commands that write or publish. */
  ask: Ask;
  exec: Exec;
  /** The npm registry the commands read; npm's own default unless the environment says otherwise. */
  registry: string;
  /** The environment variables the commands may read (GitHub Actions mode). */
  env: Record<string, string | undefined>;
  now: () => Date;
}

const COMMANDS = {
  create: 'Create a package from the template (--category, --name, --description).',
  build: 'Build all packages, or the named ones, each after the packages it needs.',
  verify: 'Everything publish checks, without publishing.',
  republish: 'New versions, CHANGELOGs and one commit for packages already published (--bump).',
  'update-deps': 'Newer versions of the outside dependencies, with a plan first (--level).',
  status: 'A table of each package: repo version, npm version and state.',
  publish: 'Publish the versions npm does not have yet (the owner, from the release branch).',
} as const;

function usage(): string {
  const lines = Object.entries(COMMANDS).map(
    ([name, summary]) => `  ${name.padEnd(11)} ${summary}`,
  );
  return [
    'Usage: npm run packages:<command> -- [package...] [flags]',
    '',
    'Commands:',
    ...lines,
    '',
    'Flags: --dry-run (show the plan, change nothing), --help.',
  ].join('\n');
}

// Runs one command and returns the exit code. A CliError is reported with its code and hint and
// gives exit code 1; any other error is a bug and is reported with its stack.
export async function main(argv: string[], context: CliContext): Promise<number> {
  const { log, root, exec, ask, registry, env, now } = context;
  try {
    const args = parseArguments(argv);
    if (args.help || args.command === undefined) {
      log.info(usage());
      return args.help ? 0 : 1;
    }
    switch (args.command) {
      case 'build':
        return build({ root, names: args.names, dryRun: args.dryRun, log, exec });
      case 'verify':
        return verify({ root, names: args.names, log, exec });
      case 'update-deps':
        return await updateDeps({
          root,
          registry,
          names: args.names,
          level: args.level,
          dryRun: args.dryRun,
          ask,
          log,
          exec,
        });
      case 'republish':
        return await republish({
          root,
          names: args.names,
          bump: args.bump,
          dryRun: args.dryRun,
          ask,
          log,
          exec,
          now,
        });
      case 'status':
        return await status({ root, registry, names: args.names, log });
      case 'publish':
        return await publish({
          root,
          registry,
          names: args.names,
          dryRun: args.dryRun,
          ci: args.ci,
          env,
          ask,
          log,
          exec,
        });
      case 'create':
        return await create({
          root,
          registry,
          category: args.category,
          name: args.name,
          description: args.description,
          dryRun: args.dryRun,
          ask,
          log,
          exec,
        });
      default:
        throw new CliError(
          'COMMAND_UNKNOWN',
          `Unknown command: ${args.command}.`,
          `Commands: ${Object.keys(COMMANDS).join(', ')}.`,
        );
    }
  } catch (error) {
    log.error(error);
    return 1;
  }
}
