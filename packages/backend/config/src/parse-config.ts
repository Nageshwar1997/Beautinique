import { ConfigError, type ConfigProblem } from './config-error.ts';
import type { Config, ConfigDefinition, ConfigShape } from './define-config.ts';
import { maskValues } from './utils/mask-values.ts';

/**
 * Where the values come from, and so which keys can be "unknown":
 * - `file`: an env file of this service, so every key in it must be one of its keys;
 * - `platform`: the env of the platform (Render), which also holds the keys of the other services
 *   and of the platform itself, so only the keys in this service's namespace are looked at.
 */
export type ConfigScope = 'file' | 'platform';

export type RawValues = Readonly<Record<string, string | undefined>>;

// A schema's messages say the key themselves, like `PAYMENTS_PORT must be a whole number.`, and
// then they are the problem as they are. A message that does not (zod's own) gets the key put in
// front, so a problem always names its key.
function invalidMessage(key: string, issues: readonly { message: string }[]): string {
  const reasons = issues.map((issue) => issue.message);
  if (reasons.every((reason) => reason.includes(key))) return reasons.join(' ');
  return `${key} is not valid: ${reasons.join('; ')}`;
}

/**
 * Checks the values against the config of a service and gives the typed config, or throws a
 * `ConfigError` that names every key that is wrong, by name and never by value (AC-PLATFORM-12).
 *
 * A key that is missing, or empty, is refused before its schema is asked, so a schema's `.default()`
 * or `.optional()` never fills one in (D-441). A key of the namespace that the config does not know
 * is refused too, which catches a typo (`IDENTITY_MONGODB_UR`). The rules run only when every key is
 * fine, because a rule works on a whole config.
 */
export function parseConfig<S extends ConfigShape>(
  definition: ConfigDefinition<S>,
  values: RawValues,
  scope: ConfigScope,
): Config<S> {
  const problems: ConfigProblem[] = [];
  const own = definition.keys;
  const ownValues = Object.keys(own).flatMap((key) => values[key] ?? []);
  const mask = (message: string) => maskValues(message, ownValues);
  const parsed: Record<string, unknown> = {};

  for (const [key, schema] of Object.entries(own)) {
    const value = values[key];
    if (value === undefined) {
      problems.push({ key, kind: 'missing', message: `${key} is missing` });
    } else if (value.trim() === '') {
      problems.push({ key, kind: 'empty', message: `${key} is empty` });
    } else {
      const result = schema.safeParse(value);
      if (result.success) {
        parsed[key] = result.data;
      } else {
        problems.push({
          key,
          kind: 'invalid',
          message: mask(invalidMessage(key, result.error.issues)),
        });
      }
    }
  }

  const unknown = Object.keys(values)
    .filter((key) => values[key] !== undefined && !Object.hasOwn(own, key))
    .filter((key) => scope === 'file' || key.startsWith(definition.prefix))
    .sort();
  for (const key of unknown) {
    problems.push({
      key,
      kind: 'unknown',
      message: `${key} is not a key of the ${definition.service} config`,
    });
  }

  if (problems.every((problem) => problem.kind === 'unknown')) {
    const config = Object.freeze(parsed) as Config<S>;
    for (const rule of definition.rules) {
      for (const found of rule(config)) {
        problems.push({ key: found.key, kind: 'rule', message: mask(found.message) });
      }
    }
  }

  if (problems.length > 0) throw new ConfigError(definition.service, problems);
  return Object.freeze(parsed) as Config<S>;
}
