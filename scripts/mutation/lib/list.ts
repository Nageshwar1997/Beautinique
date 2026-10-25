/** A mistake in a mutation list or its use; the message says what to fix. */
export class MutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MutationError';
  }
}

/**
 * One deliberate bug: in `src/<file>.ts`, each `[from, to]` pair is replaced in turn (each `from`
 * must occur exactly once at that point). A good test suite fails ("kills" it).
 */
export interface Mutation {
  file: string;
  name: string;
  change: readonly (readonly [string, string])[];
  /** Run only the tests whose name matches this pattern (vitest `-t`): much faster. */
  tests?: string;
  /** Known to survive, and why (an equivalent change, a race guard, a policy). */
  survives?: string;
}

const isString = (value: unknown): value is string => typeof value === 'string';

/** Checks the shape of a package's `test/mutations.ts` default export. */
export function validateList(list: unknown, where: string): Mutation[] {
  if (!Array.isArray(list))
    throw new MutationError(`${where}: the default export must be an array`);
  return list.map((entry: unknown, index): Mutation => {
    const at = `${where} #${String(index)}`;
    const value = entry as Partial<Record<keyof Mutation, unknown>> | null;
    if (typeof value !== 'object' || value === null)
      throw new MutationError(`${at}: not an object`);
    const { file, name, change, tests, survives } = value;
    if (!isString(file) || !/^[\w./-]+$/.test(file) || file.includes('..')) {
      throw new MutationError(`${at}: file must be a path under src without .ts, e.g. "relay"`);
    }
    if (!isString(name) || name.trim() === '') throw new MutationError(`${at}: name is required`);
    const pairs = Array.isArray(change) ? (change as unknown[]) : [];
    const valid = pairs.every(
      (pair) =>
        Array.isArray(pair) &&
        pair.length === 2 &&
        isString(pair[0]) &&
        pair[0] !== '' &&
        isString(pair[1]) &&
        pair[0] !== pair[1],
    );
    if (pairs.length === 0 || !valid) {
      throw new MutationError(
        `${at} (${name}): change must be [from, to] pairs, from non-empty and different from to`,
      );
    }
    if (tests !== undefined && (!isString(tests) || tests === '')) {
      throw new MutationError(`${at} (${name}): tests must be a non-empty test name pattern`);
    }
    if (survives !== undefined && (!isString(survives) || survives.trim() === '')) {
      throw new MutationError(`${at} (${name}): survives must say why it survives`);
    }
    return {
      file,
      name,
      change: pairs as [string, string][],
      ...(tests === undefined ? {} : { tests }),
      ...(survives === undefined ? {} : { survives }),
    };
  });
}

const count = (text: string, part: string): number => text.split(part).length - 1;

/** The source with every pair of `change` applied in turn; each `from` must occur exactly once. */
export function applyChange(source: string, change: Mutation['change'], where: string): string {
  let text = source;
  for (const [from, to] of change) {
    const found = count(text, from);
    if (found !== 1) {
      throw new MutationError(
        `${where}: ${JSON.stringify(from.slice(0, 60))} is found ${String(found)} times, it must be exactly once (did the code change?)`,
      );
    }
    text = text.replace(from, () => to);
  }
  return text;
}

/** The 1-based first and last line of the single occurrence of `from` in `source`. */
export function anchorLines(source: string, from: string): [number, number] {
  const at = source.indexOf(from);
  if (at === -1)
    throw new MutationError(`${JSON.stringify(from.slice(0, 60))} is not in the source`);
  const start = count(source.slice(0, at), '\n') + 1;
  return [start, start + count(from, '\n')];
}
