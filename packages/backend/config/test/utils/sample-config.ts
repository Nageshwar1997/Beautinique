import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { coerce, enum as enumOf, string } from 'zod';

import { ConfigError, defineConfig, keyModeRule, type ConfigProblem } from '../../src/index.ts';

// A config shaped like the real ones will be (a payments service, with a mode and a key that
// carries it), and the fake values that every test starts from. None of these is a real key.
export const paymentsConfig = defineConfig({
  service: 'payments',
  keys: {
    PAYMENTS_MONGODB_URI: string('PAYMENTS_MONGODB_URI is required.').startsWith(
      'mongodb://',
      'PAYMENTS_MONGODB_URI must start with mongodb://.',
    ),
    PAYMENTS_PORT: coerce
      .number('PAYMENTS_PORT must be a number.')
      .int('PAYMENTS_PORT must be a whole number.')
      .min(1, 'PAYMENTS_PORT must be at least 1.')
      .max(65535, 'PAYMENTS_PORT must be at most 65535.'),
    PAYMENTS_MODE: enumOf(['test', 'live'], 'PAYMENTS_MODE must be test or live.'),
    PAYMENTS_KEY_ID: string('PAYMENTS_KEY_ID is required.').min(
      8,
      'PAYMENTS_KEY_ID must be at least 8 characters.',
    ),
    PAYMENTS_TOKEN_SECRET: string('PAYMENTS_TOKEN_SECRET is required.').min(
      16,
      'PAYMENTS_TOKEN_SECRET must be at least 16 characters.',
    ),
    PAYMENTS_STRICT: enumOf(['true', 'false'], 'PAYMENTS_STRICT must be true or false.').transform(
      (value) => value === 'true',
    ),
  },
  rules: [
    keyModeRule({
      mode: 'PAYMENTS_MODE',
      key: 'PAYMENTS_KEY_ID',
      prefixes: { test: 'key_test_', live: 'key_live_' },
    }),
  ],
});

export const GOOD_VALUES: Readonly<Record<string, string>> = {
  PAYMENTS_MONGODB_URI: 'mongodb://127.0.0.1:27017/payments',
  PAYMENTS_PORT: '4010',
  PAYMENTS_MODE: 'test',
  PAYMENTS_KEY_ID: 'key_test_abcdef',
  PAYMENTS_TOKEN_SECRET: 'a-long-fake-secret-0123456789',
  PAYMENTS_STRICT: 'true',
};

/** The text of an env file with these values. */
export function envText(values: Readonly<Record<string, string>>): string {
  return `${Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`;
}

/** `GOOD_VALUES` with some keys changed, and the keys given as `undefined` left out. */
export function valuesWith(
  changes: Readonly<Record<string, string | undefined>>,
): Record<string, string> {
  const values: Record<string, string | undefined> = { ...GOOD_VALUES, ...changes };
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

/** What a call that must fail with a `ConfigError` says is wrong. */
export function problemsOf(call: () => unknown): readonly ConfigProblem[] {
  try {
    call();
  } catch (error) {
    if (error instanceof ConfigError) return error.problems;
    throw error;
  }
  throw new Error('The call did not throw a ConfigError.');
}

const folders: string[] = [];

/** A new empty folder for a test, and the env file of an environment in it, if values are given. */
export function folderWith(files: Readonly<Record<string, string>> = {}): string {
  const folder = mkdtempSync(join(tmpdir(), 'backend-config-'));
  folders.push(folder);
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, name)), { recursive: true });
    writeFileSync(join(folder, name), text);
  }
  return folder;
}

export function removeFolders(): void {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
}

/** The name of the env file of an environment, built here so that no test spells it out. */
export function envFileName(environment: string): string {
  return `.env.${environment}`;
}
