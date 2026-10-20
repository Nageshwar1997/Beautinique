import { parseArgs } from 'node:util';

import { CATEGORIES, type Category } from './context.ts';
import { CliError } from './errors.ts';
import { BUMP_TYPES, type BumpType } from './versions.ts';

export interface CommonFlags {
  help: boolean;
  yes: boolean;
  ci: boolean;
  dryRun: boolean;
  all: boolean;
  categories: Category[];
  packages: string[];
  bump: BumpType | null;
  target: 'laptop' | 'github' | null;
  cascade: 'ask' | 'yes' | 'no';
  /** --ci only: where the tarballs and release.json for the publish job go. */
  packDir: string;
}

const list = (values: string[] | undefined) =>
  (values ?? [])
    .flatMap((v) => v.split(','))
    .map((v) => v.trim())
    .filter(Boolean);

/**
 * Flags shared by publish, republish and verify. `npm run publish --dry-run` (without `--`) is taken by
 * npm itself and only reaches us as npm_config_dry_run, so that is honoured too.
 */
export function parseCommonFlags(argv: string[]): CommonFlags {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      strict: true,
      options: {
        help: { type: 'boolean', short: 'h', default: false },
        yes: { type: 'boolean', short: 'y', default: false },
        ci: { type: 'boolean', default: false },
        'dry-run': { type: 'boolean', default: false },
        all: { type: 'boolean', default: false },
        category: { type: 'string', multiple: true },
        packages: { type: 'string', multiple: true },
        bump: { type: 'string' },
        target: { type: 'string' },
        cascade: { type: 'string', default: 'ask' },
        'pack-dir': { type: 'string', default: 'release-tarballs' },
      },
    }));
  } catch (error) {
    throw new CliError((error as Error).message, { code: 'BAD_FLAGS', hint: 'See --help.' });
  }

  const categories = list(values.category);
  for (const c of categories) {
    if (!(CATEGORIES as readonly string[]).includes(c)) {
      throw new CliError(`Unknown category "${c}". Use ${CATEGORIES.join(', ')}.`, {
        code: 'BAD_FLAGS',
      });
    }
  }
  if (values.bump !== undefined && !(BUMP_TYPES as readonly string[]).includes(values.bump)) {
    throw new CliError(`--bump must be ${BUMP_TYPES.join(', ')}.`, { code: 'BAD_FLAGS' });
  }
  if (values.target !== undefined && values.target !== 'laptop' && values.target !== 'github') {
    throw new CliError('--target must be laptop or github.', { code: 'BAD_FLAGS' });
  }
  if (!['ask', 'yes', 'no'].includes(values.cascade)) {
    throw new CliError('--cascade must be ask, yes or no.', { code: 'BAD_FLAGS' });
  }
  if (values['pack-dir'].trim() === '') {
    throw new CliError('--pack-dir needs a folder.', { code: 'BAD_FLAGS' });
  }
  const selections = [values.all, categories.length > 0, list(values.packages).length > 0].filter(
    Boolean,
  ).length;
  if (selections > 1) {
    throw new CliError('Use only one of --all, --category or --packages.', { code: 'BAD_FLAGS' });
  }
  return {
    help: values.help,
    yes: values.yes,
    ci: values.ci,
    dryRun: values['dry-run'] || process.env.npm_config_dry_run === 'true',
    all: values.all,
    categories: categories as Category[],
    packages: list(values.packages),
    bump: (values.bump as BumpType | undefined) ?? null,
    target: values.target ?? null,
    cascade: values.cascade as 'ask' | 'yes' | 'no',
    packDir: values['pack-dir'],
  };
}

/** For commands without options (login, logout, status, build): true when help was asked for. */
export function parseHelpOnly(argv: string[]): boolean {
  try {
    const { values } = parseArgs({
      args: argv,
      strict: true,
      options: { help: { type: 'boolean', short: 'h', default: false } },
    });
    return values.help;
  } catch (error) {
    throw new CliError((error as Error).message, { code: 'BAD_FLAGS', hint: 'See --help.' });
  }
}

export const SELECTION_HELP = `Which packages (pick one; without them you are asked):
  --all                         every eligible package
  --category <names>            shared, frontend, backend (comma separated or repeated)
  --packages <names>            e.g. shared-utils,@beautinique/frontend-styles`;
