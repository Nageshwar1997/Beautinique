import type { CommonFlags } from './args.ts';
import { CATEGORIES, type Category, type Context } from './context.ts';
import { CancelledError, CliError } from './errors.ts';
import type { ChoiceItem } from './prompts.ts';
import type { WorkspacePackage } from './workspace.ts';

export interface Candidate {
  pkg: WorkspacePackage;
  /** null when the package can be picked, otherwise why not */
  blocked: string | null;
  /** short status shown next to the name, e.g. "1.1.0 -> npm 1.1.0" */
  note: string;
}

/** Accepts "shared-utils", "shared/utils" or the full "@beautinique/shared-utils". */
export function matchPackage(query: string, candidates: Candidate[]): Candidate | undefined {
  const q = query.trim().toLowerCase();
  return candidates.find(({ pkg }) => {
    const short = pkg.name.split('/').pop() ?? pkg.name;
    return pkg.name === q || short === q || `${pkg.category ?? ''}/${pkg.folder}` === q;
  });
}

const byCategory = (candidates: Candidate[], category: Category) =>
  candidates.filter((c) => c.pkg.category === category);

/**
 * The publish / republish / verify selection: all eligible, by category, or picked one by one
 * (grouped by category). Flags answer it without a prompt.
 */
export async function selectPackages(
  ctx: Context,
  candidates: Candidate[],
  flags: CommonFlags,
  verb: string,
): Promise<WorkspacePackage[]> {
  const eligible = candidates.filter((c) => c.blocked === null);
  if (eligible.length === 0) {
    const reasons = candidates.map((c) => `  ${c.pkg.name}: ${c.blocked ?? ''}`).join('\n');
    throw new CliError(`Nothing to ${verb}.${reasons ? `\n${reasons}` : ''}`, {
      code: 'NOTHING_TO_DO',
      exitCode: 0,
    });
  }

  if (flags.packages.length > 0) {
    return flags.packages.map((query) => {
      const found = matchPackage(query, candidates);
      if (!found) {
        throw new CliError(`No package matches "${query}".`, { code: 'BAD_FLAGS' });
      }
      if (found.blocked !== null) {
        throw new CliError(`${found.pkg.name} cannot be ${verb}ed: ${found.blocked}`, {
          code: 'NOT_ELIGIBLE',
        });
      }
      return found.pkg;
    });
  }
  if (flags.all) {
    return eligible.map((c) => c.pkg);
  }
  if (flags.categories.length > 0) {
    const picked = eligible.filter(
      (c) => c.pkg.category !== null && flags.categories.includes(c.pkg.category),
    );
    if (picked.length === 0) {
      throw new CliError(`No package in ${flags.categories.join(', ')} can be ${verb}ed.`, {
        code: 'NOTHING_TO_DO',
        exitCode: 0,
      });
    }
    return picked.map((c) => c.pkg);
  }

  const mode = await ctx.prompt.select<'all' | 'category' | 'pick'>(
    `Which packages do you want to ${verb}?`,
    [
      {
        name: `All (${String(eligible.length)})`,
        value: 'all',
        description: eligible.map((c) => c.pkg.name).join(', '),
      },
      { name: 'By category (shared / frontend / backend)', value: 'category' },
      { name: 'Pick packages', value: 'pick' },
    ],
  );

  if (mode === 'all') {
    return eligible.map((c) => c.pkg);
  }

  if (mode === 'category') {
    const categories = await ctx.prompt.checkbox<Category>(
      'Which categories?',
      CATEGORIES.map((category) => {
        const count = byCategory(eligible, category).length;
        return {
          name: `${category} (${String(count)})`,
          value: category,
          disabled: count === 0 ? 'nothing to ' + verb : false,
        };
      }),
    );
    return eligible
      .filter((c) => c.pkg.category !== null && categories.includes(c.pkg.category))
      .map((c) => c.pkg);
  }

  const choices: ChoiceItem<string>[] = [];
  for (const category of CATEGORIES) {
    const group = byCategory(candidates, category);
    if (group.length === 0) {
      continue;
    }
    choices.push({ separator: `── ${category} ──` });
    for (const c of group) {
      choices.push({
        name: `${c.pkg.name}  ${c.note}`,
        value: c.pkg.name,
        disabled: c.blocked ?? false,
      });
    }
  }
  const names = await ctx.prompt.checkbox<string>(
    'Pick packages (space to select, enter to confirm)',
    choices,
  );
  if (names.length === 0) {
    throw new CancelledError('Nothing was selected.');
  }
  return names.map((name) => {
    const found = candidates.find((c) => c.pkg.name === name);
    if (!found) {
      throw new Error(`Picked unknown package ${name}`);
    }
    return found.pkg;
  });
}
