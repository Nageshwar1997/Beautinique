import { loadConfig, type LoadConfigOptions } from '@beautinique/backend-server-kit';
import { coerce, enum as zodEnum, object, type output, url } from '@beautinique/shared-zod';

/**
 * gateway settings from GATEWAY__* env vars, namespaced so backend/bundle can run every deployable
 * in one process (ARCHITECTURE §3). Every key is in .env.example. Only this file may read env.
 */
export const configZod = object({
  port: coerce.number().int().min(0).max(65_535).default(8080),
  logLevel: zodEnum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  // origin of each deployable behind the gateway; one that is left out answers 503
  identityUrl: url({ protocol: /^https?$/ }).optional(),
  paymentsUrl: url({ protocol: /^https?$/ }).optional(),
  notifyUrl: url({ protocol: /^https?$/ }).optional(),
  coreUrl: url({ protocol: /^https?$/ }).optional(),
  // an upstream that sends nothing back for this long gets a 504
  upstreamTimeoutMs: coerce.number().int().min(1000).max(120_000).default(30_000),
});
export type Config = output<typeof configZod>;

/** Reads and checks the settings. `strip` removes the GATEWAY__* keys from env afterwards (bundle mode). */
export function readConfig(options: Omit<LoadConfigOptions, 'prefix'> = {}): Config {
  return loadConfig(configZod, { prefix: 'GATEWAY', ...options });
}
