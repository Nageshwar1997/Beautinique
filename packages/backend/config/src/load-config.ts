import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ConfigError, type ConfigProblem } from './config-error.ts';
import type { Config, ConfigDefinition, ConfigShape } from './define-config.ts';
import { parseConfig, type RawValues } from './parse-config.ts';
import { parseEnvFile } from './parse-env-file.ts';

export const ENVIRONMENTS = ['development', 'test', 'production'] as const;

export type Environment = (typeof ENVIRONMENTS)[number];

/**
 * The environment the process runs in, from `NODE_ENV`: no default, so a process that does not say
 * where it runs does not start. `undefined` when it is missing or is not one of the three.
 */
export function environmentOf(env: RawValues): Environment | undefined {
  return ENVIRONMENTS.find((environment) => environment === env.NODE_ENV);
}

export interface LoadConfigOptions {
  /** The env of the process. The service's config module is the only place that passes `process.env` (CR-3). */
  env: RawValues;
  /** The folder of the service, where `.env.development` and `.env.test` are. */
  directory: string;
}

function readEnvFile(directory: string, file: string): string | ConfigProblem {
  try {
    return readFileSync(join(directory, file), 'utf8');
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    const message =
      code === 'ENOENT'
        ? `${file} is missing in ${directory}: \`npm run setup\` makes it from .env.example`
        : `${file} cannot be read in ${directory} (${String(code)})`;
    return { key: file, kind: 'file', message };
  }
}

/**
 * The config of a service, for the environment of the process (docs/OPERATIONS.md §1 rule 9):
 * - `development` and `test` read their own file, `.env.development` or `.env.test`, and nothing
 *   else: not the env of the process, and a test run without `.env.test` does not start;
 * - `production` reads the env of the platform, and never opens a file (`.env.production` is outside
 *   the repository).
 *
 * Anything wrong stops the process with a `ConfigError` that names the keys, never the values.
 */
export function loadConfig<S extends ConfigShape>(
  definition: ConfigDefinition<S>,
  { env, directory }: LoadConfigOptions,
): Config<S> {
  const environment = environmentOf(env);
  if (environment === undefined) {
    throw new ConfigError(definition.service, [
      {
        key: 'NODE_ENV',
        kind: 'environment',
        message: 'NODE_ENV is missing, or is not development, test or production',
      },
    ]);
  }
  if (environment === 'production') return parseConfig(definition, env, 'platform');

  const file = `.env.${environment}`;
  const text = readEnvFile(directory, file);
  if (typeof text !== 'string') throw new ConfigError(definition.service, [text]);
  const { values, problems } = parseEnvFile(text);
  if (problems.length > 0) {
    throw new ConfigError(
      definition.service,
      problems.map((message) => ({ key: file, kind: 'file', message: `${file} ${message}` })),
    );
  }
  return parseConfig(definition, values, 'file');
}
