import { loadConfig, type LoadConfigOptions } from '@beautinique/backend-server-kit';
import { coerce, enum as zodEnum, object, type output, string } from '@beautinique/shared-zod';

/**
 * core settings from CORE__* env vars, namespaced so backend/bundle can run every deployable
 * in one process (ARCHITECTURE §3). Every key is in .env.example. Only this file may read env.
 */
export const configZod = object({
  port: coerce.number().int().min(0).max(65_535).default(8084),
  logLevel: zodEnum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  /** MongoDB connection string (Atlas, or the laptop's replica set from `npm run infra:up`). */
  mongoUri: string().regex(/^mongodb(?:\+srv)?:\/\//, 'Use a MongoDB connection string'),
  /** core's own database: no other deployable reads or writes it. */
  mongoDbName: string().min(1).max(63).default('bq_core'),
  /**
   * The audit log's own database (ARCHITECTURE §3): core's user may only insert and read there (an
   * Atlas custom role; owner, 2026-11-15).
   */
  auditDbName: string().min(1).max(63).default('bq_audit'),
  /** Redis for the queues: Render Key Value (internal URL) live, Docker Valkey on the laptop. */
  redisUrl: string().regex(/^rediss?:\/\//, 'Use a Redis URL'),
  /** How the outbox relay finds new events: `poll` on Atlas free, `changestream` on a replica set you run. */
  outboxRelay: zodEnum(['poll', 'changestream']).default('poll'),
  /**
   * The gateway's passport keys (ARCHITECTURE §7.2), for split mode only: backend/bundle hands the
   * key over in memory, so nothing to set live.
   */
  passportJwksUrl: string()
    .regex(
      /^https?:\/\/\S+$/,
      'Use a URL like http://localhost:8080/.well-known/passport-jwks.json',
    )
    .default('http://localhost:8080/.well-known/passport-jwks.json'),
});
export type Config = output<typeof configZod>;

/** Reads and checks the settings. `strip` removes the CORE__* keys from env afterwards (bundle mode). */
export function readConfig(options: Omit<LoadConfigOptions, 'prefix'> = {}): Config {
  return loadConfig(configZod, { prefix: 'CORE', ...options });
}
