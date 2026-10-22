import { ConfigError } from '@beautinique/backend-server-kit';
import { coerce, object } from '@beautinique/shared-zod';

import type { Env } from './prepare.ts';

const bundleZod = object({ port: coerce.number().int().min(0).max(65_535).default(8080) });

/**
 * The bundle's own setting is the public port, which Render passes as PORT (ARCHITECTURE §11.1).
 * Each deployable reads its own <NAME>__* keys from the same env. Only this file may read env.
 */
export function readBundleConfig(env: Env = process.env): { port: number; env: Env } {
  const parsed = bundleZod.safeParse({ port: env.PORT === '' ? undefined : env.PORT });
  if (!parsed.success) {
    throw new ConfigError('Invalid bundle configuration:\n  PORT: not a port number');
  }
  return { port: parsed.data.port, env };
}
