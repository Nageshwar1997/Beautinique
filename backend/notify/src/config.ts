import { loadConfig, type LoadConfigOptions } from '@beautinique/backend-server-kit';
import {
  coerce,
  emailZod,
  enum as zodEnum,
  object,
  type output,
  string,
  url,
} from '@beautinique/shared-zod';

/**
 * notify settings from NOTIFY__* env vars, namespaced so backend/bundle can run every deployable
 * in one process (ARCHITECTURE §3). Every key is in .env.example. Only this file may read env.
 */
export const configZod = object({
  port: coerce.number().int().min(0).max(65_535).default(8083),
  logLevel: zodEnum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  /** MongoDB connection string (Atlas, or the laptop's replica set from `npm run infra:up`). */
  mongoUri: string().regex(/^mongodb(?:\+srv)?:\/\//, 'Use a MongoDB connection string'),
  /** notify's own database: no other deployable reads or writes it. */
  mongoDbName: string().min(1).max(63).default('bq_notify'),
  /** Redis for the queue: Render Key Value (internal URL) live, Docker Valkey on the laptop. */
  redisUrl: string().regex(/^rediss?:\/\//, 'Use a Redis URL'),
  /**
   * Who delivers email: `brevo` (its HTTPS API, live: Render blocks SMTP ports) or `mailpit` (the
   * laptop's fake inbox, http://localhost:8025). No default, so live never falls back to Mailpit.
   */
  emailTransport: zodEnum(['brevo', 'mailpit']),
  /** Brevo API key (Brevo → SMTP & API → API keys); only with emailTransport brevo. */
  brevoApiKey: string().min(1).optional(),
  /** The Mailpit HTTP API (infra/docker-compose.yml). */
  mailpitUrl: url({ protocol: /^https?$/ }).default('http://localhost:8025'),
  /** The sender address. Live: a sender verified in Brevo (there is no own domain). */
  emailFrom: emailZod,
  emailFromName: string().trim().min(1).max(70).default('Beautinique'),
  /**
   * Keys that open the code in identity.otp.requested: `id:base64,...`, the same value as
   * IDENTITY__OTP_EVENT_KEYS (ARCHITECTURE §7.1). The first one is identity's current key.
   */
  otpEventKeys: string().min(1),
  /** Brevo free sends 300 emails a day in all (ARCHITECTURE §7.1). */
  emailDailyLimit: coerce.number().int().min(1).default(300),
  /** After this many in a day, only sign-in codes and transactional emails go; the rest wait a day. */
  emailOtherLimit: coerce.number().int().min(0).default(250),
}).superRefine((config, context) => {
  if (config.emailTransport === 'brevo' && config.brevoApiKey === undefined) {
    context.addIssue({
      code: 'custom',
      path: ['brevoApiKey'],
      message: 'Required when NOTIFY__EMAIL_TRANSPORT is brevo',
    });
  }
  if (config.emailOtherLimit > config.emailDailyLimit) {
    context.addIssue({
      code: 'custom',
      path: ['emailOtherLimit'],
      message: 'Must not be above NOTIFY__EMAIL_DAILY_LIMIT',
    });
  }
});
export type Config = output<typeof configZod>;

/** Reads and checks the settings. `strip` removes the NOTIFY__* keys from env afterwards (bundle mode). */
export function readConfig(options: Omit<LoadConfigOptions, 'prefix'> = {}): Config {
  return loadConfig(configZod, { prefix: 'NOTIFY', ...options });
}
