import type { ConfigRuleProblem } from './define-config.ts';

export interface KeyModeRuleOptions<M extends string, K extends string> {
  /** The key that says the mode: `PAYMENTS_MODE`, with a value like `test` or `live`. */
  mode: M;
  /** The key whose value must belong to that mode: `PAYMENTS_KEY_ID`. */
  key: K;
  /** For each value of the mode, what the value of the key starts with: `{ test: 'abc_test_', live: 'abc_live_' }`. */
  prefixes: Readonly<Record<string, string>>;
}

/**
 * A rule for a key that carries its mode in its value, like a payment key that is a test key or a
 * live key (docs/OPERATIONS.md §4 rule 4): while the mode is `test`, a live key stops the process,
 * and the other way round. It names the keys and the mode, and never the key's value.
 */
export function keyModeRule<M extends string, K extends string>(
  options: KeyModeRuleOptions<M, K>,
): (config: Readonly<Record<M | K, unknown>>) => ConfigRuleProblem[] {
  const { mode, key, prefixes } = options;
  const entries = Object.entries(prefixes);
  if (entries.length === 0 || entries.some(([, prefix]) => prefix === '')) {
    throw new RangeError(`The rule of ${key} needs a prefix, not an empty one, for each mode.`);
  }
  return (config) => {
    const modeValue = config[mode];
    const prefix =
      typeof modeValue === 'string' && Object.hasOwn(prefixes, modeValue)
        ? prefixes[modeValue]
        : undefined;
    if (prefix === undefined) {
      return [{ key: mode, message: `${mode} is not one of ${Object.keys(prefixes).join(', ')}` }];
    }
    const keyValue = config[key];
    if (typeof keyValue === 'string' && keyValue.startsWith(prefix)) return [];
    return [
      {
        key,
        message: `${key} is not a ${String(modeValue)} key, while ${mode} is ${String(modeValue)}`,
      },
    ];
  };
}
