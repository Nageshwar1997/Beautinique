import { loadConfig, type LoadConfigOptions } from '@beautinique/backend-server-kit';
import { SOCIAL_PROVIDERS } from '@beautinique/shared-contracts';
import { coerce, enum as zodEnum, object, type output, string } from '@beautinique/shared-zod';

/** https anywhere, plain http only on the laptop. No path: the callback path is identity's. */
const ORIGIN = /^(?:https:\/\/[^/\s]+|http:\/\/(?:localhost|127\.0\.0\.1)(?::\d{1,5})?)$/;

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
   * Password hashes for sign-ins a minute, every IP together (owner, 2026-11-12, QA DR-004): past
   * it a sign-in is 503 for a moment, and the rest of the free server's 0.1 CPU stays free.
   */
  loginHashesPerMinute: coerce.number().int().min(1).default(30),
  /**
   * Code emails an hour, every IP together, resends too, and the sign-up codes of a UTC day (owner,
   * 2026-11-12, QA DR-009): past either the app says so, and the day's 300 emails keep room for
   * password, invitation and security emails.
   */
  codesPerHour: coerce.number().int().min(1).default(60),
  signUpCodesPerDay: coerce.number().int().min(1).default(100),
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
  /**
   * Social login in the customer app (T3.1 PR 4): each provider's OAuth client, the ID and the
   * secret together. A provider with neither is off (no button). The laptop and live have their own
   * clients, since the redirect URLs differ.
   */
  googleClientId: string().trim().min(1).optional(),
  googleClientSecret: string().min(1).optional(),
  linkedinClientId: string().trim().min(1).optional(),
  linkedinClientSecret: string().min(1).optional(),
  githubClientId: string().trim().min(1).optional(),
  githubClientSecret: string().min(1).optional(),
  /**
   * The customer app's origin. Providers send the browser back to
   * <origin>/api/v1/auth/oauth/<provider>/callback, the URL registered with each of them.
   */
  oauthRedirectOrigin: string()
    .regex(
      ORIGIN,
      'Use an origin like https://beautinique-customer.vercel.app (http only for localhost)',
    )
    .optional(),
  /**
   * Tests and E2E only: every provider's pages and API at one stand-in on this machine,
   * `<url>/<provider>/authorize` ... (scripts/e2e/fake-oauth.ts). Never set live.
   */
  oauthProvidersUrl: string()
    .regex(
      /^http:\/\/(?:localhost|127\.0\.0\.1):\d{1,5}$/,
      'Use a stand-in on this machine, like http://127.0.0.1:8095',
    )
    .optional(),
}).superRefine((config, context) => {
  let anyProvider = false;
  for (const provider of SOCIAL_PROVIDERS) {
    const id = config[`${provider}ClientId`];
    const secret = config[`${provider}ClientSecret`];
    const name = `IDENTITY__${provider.toUpperCase()}_CLIENT`;
    if (id === undefined && secret !== undefined) {
      context.addIssue({
        code: 'custom',
        path: [`${provider}ClientId`],
        message: `Required with ${name}_SECRET`,
      });
    } else if (id !== undefined && secret === undefined) {
      context.addIssue({
        code: 'custom',
        path: [`${provider}ClientSecret`],
        message: `Required with ${name}_ID`,
      });
    } else if (id !== undefined) {
      anyProvider = true;
    }
  }
  if (anyProvider && config.oauthRedirectOrigin === undefined) {
    context.addIssue({
      code: 'custom',
      path: ['oauthRedirectOrigin'],
      message: 'Required when a social login provider is set',
    });
  }
});
export type Config = output<typeof configZod>;

/** Reads and checks the settings. `strip` removes the IDENTITY__* keys from env afterwards (bundle mode). */
export function readConfig(options: Omit<LoadConfigOptions, 'prefix'> = {}): Config {
  return loadConfig(configZod, { prefix: 'IDENTITY', ...options });
}
