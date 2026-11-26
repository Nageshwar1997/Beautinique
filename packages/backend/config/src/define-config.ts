import type { output, ZodType } from 'zod';

/** The keys of a config and the schema of each one. A value is read as text, so a schema takes text. */
export type ConfigShape = Readonly<Record<string, ZodType>>;

/** What a loaded config is: each key with the output of its schema. */
export type Config<S extends ConfigShape> = { readonly [K in keyof S]: output<S[K]> };

/** A thing a rule found wrong, named by the key it is about. The message holds no value. */
export interface ConfigRuleProblem {
  key: string;
  message: string;
}

/** A check across keys, run on a config in which every key is already fine, like a key and its mode. */
export type ConfigRule<S extends ConfigShape> = (config: Config<S>) => readonly ConfigRuleProblem[];

export interface ConfigInput<S extends ConfigShape> {
  /** The service, in small letters: `identity`. Its keys all start with `IDENTITY_`. */
  service: string;
  keys: S;
  rules?: readonly ConfigRule<S>[];
}

export interface ConfigDefinition<S extends ConfigShape> {
  readonly service: string;
  /** `IDENTITY_`: the namespace. A service reads its own keys and no others (SR-071). */
  readonly prefix: string;
  readonly keys: S;
  readonly rules: readonly ConfigRule<S>[];
}

const SERVICE_FORMAT = /^[a-z][a-z0-9]*$/;
const KEY_FORMAT = /^[A-Z][A-Z0-9_]*$/;

/**
 * The config of one service (docs/OPERATIONS.md §4 rule 5): its keys, each with a zod schema, all in
 * the namespace of the service. Every key is required: there is no default in the code and no
 * optional key (D-441), so a schema's own `.default()` or `.optional()` is never used.
 */
export function defineConfig<const S extends ConfigShape>(
  input: ConfigInput<S>,
): ConfigDefinition<S> {
  const { service, keys, rules = [] } = input;
  if (!SERVICE_FORMAT.test(service)) {
    throw new RangeError(`The service ${service} is in small letters and digits, like identity.`);
  }
  const prefix = `${service.toUpperCase()}_`;
  const names = Object.keys(keys);
  if (names.length === 0) throw new RangeError(`The config of ${service} has no keys.`);
  for (const name of names) {
    if (!KEY_FORMAT.test(name)) {
      throw new RangeError(
        `The key ${name} is in capitals, digits and _, and starts with a letter.`,
      );
    }
    if (!name.startsWith(prefix) || name.length === prefix.length) {
      throw new RangeError(
        `The key ${name} is not in the namespace of ${service}: it starts with ${prefix} and goes on.`,
      );
    }
  }
  return Object.freeze({ service, prefix, keys, rules });
}
