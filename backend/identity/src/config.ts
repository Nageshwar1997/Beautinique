import { loadConfig, type LoadConfigOptions } from '@beautinique/backend-server-kit';
import { coerce, enum as zodEnum, object, type output, string } from '@beautinique/shared-zod';

/**
 * identity settings from IDENTITY__* env vars, namespaced so backend/bundle can run every deployable
 * in one process (ARCHITECTURE §3). Every key is in .env.example. Only this file may read env.
 */
export const configZod = object({
  port: coerce.number().int().min(0).max(65_535).default(8081),
  logLevel: zodEnum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  /** MongoDB connection string (Atlas, or the laptop's replica set from `npm run infra:up`). */
  mongoUri: string().regex(/^mongodb(?:\+srv)?:\/\//, 'Use a MongoDB connection string'),
  /** identity's own database: no other deployable reads or writes it. */
  mongoDbName: string().min(1).max(63).default('bq_identity'),
  /** Redis: Render Key Value (internal URL) live, Docker Valkey on the laptop. */
  redisUrl: string().regex(/^rediss?:\/\//, 'Use a Redis URL'),
  /** How the outbox relay finds new events: `poll` on Atlas free, `changestream` on a replica set you run. */
  outboxRelay: zodEnum(['poll', 'changestream']).default('poll'),
  /**
   * identity's field keys, `k1:<base64>,...` (@beautinique/backend-server-crypto): the first seals
   * (TOTP secrets, T3.1 PR 3), the rest open older values while a key rotates.
   */
  fieldKeys: string().min(1),
  /** `b1:<base64>`: hashes of sign-in codes and the per-email code counters (never the email itself). */
  blindIndexKey: string().min(1),
  /**
   * Seals the code in identity.otp.requested for notify: `id:base64,...`, the same value as
   * NOTIFY__OTP_EVENT_KEYS (ARCHITECTURE §7.1). The first key seals.
   */
  otpEventKeys: string().min(1),
  /** Codes one email may get in an hour, resends included (ARCHITECTURE §7.1: email limits). */
  otpEmailLimitPerHour: coerce.number().int().min(1).default(5),
  /**
   * The version of the terms and privacy notice a sign-up accepts (dummy legal pages until the
   * legal module, RULES §7.4); a new version is accepted again at the next sign-in.
   */
  legalVersion: string().trim().min(1).max(40).default('dummy-1'),
  /**
   * Have I Been Pwned's Pwned Passwords range API (ARCHITECTURE §7.1): new passwords are checked
   * against known breaches. Tests point it at a stand-in; nothing to set live.
   */
  hibpUrl: string()
    .regex(/^https?:\/\/[^/]+$/, 'Use a base URL like https://api.pwnedpasswords.com')
    .default('https://api.pwnedpasswords.com'),
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

/** Reads and checks the settings. `strip` removes the IDENTITY__* keys from env afterwards (bundle mode). */
export function readConfig(options: Omit<LoadConfigOptions, 'prefix'> = {}): Config {
  return loadConfig(configZod, { prefix: 'IDENTITY', ...options });
}
