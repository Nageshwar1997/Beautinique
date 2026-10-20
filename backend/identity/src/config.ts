import { loadConfig, type LoadConfigOptions } from '@beautinique/backend-server-kit';
import { coerce, enum as zodEnum, object, type output } from '@beautinique/shared-zod';

/**
 * identity settings from IDENTITY__* env vars, namespaced so backend/bundle can run every deployable
 * in one process (ARCHITECTURE §3). Every key is in .env.example. Only this file may read env.
 */
export const configZod = object({
  port: coerce.number().int().min(0).max(65_535).default(8081),
  logLevel: zodEnum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});
export type Config = output<typeof configZod>;

/** Reads and checks the settings. `strip` removes the IDENTITY__* keys from env afterwards (bundle mode). */
export function readConfig(options: Omit<LoadConfigOptions, 'prefix'> = {}): Config {
  return loadConfig(configZod, { prefix: 'IDENTITY', ...options });
}
