import { loadConfig, type LoadConfigOptions } from '@beautinique/backend-server-kit';
import type { RateLimitRule } from '@beautinique/backend-server-ratelimit';
import {
  type AppId,
  APPS,
  RATE_LIMIT_CLASSES,
  type RateLimitClass,
} from '@beautinique/shared-contracts';
import {
  coerce,
  enum as zodEnum,
  NEVER,
  object,
  type output,
  type RefinementCtx,
  string,
  url,
} from '@beautinique/shared-zod';

/** Vercel project names and scope slugs: lower case letters, digits and dashes (safe in a pattern). */
const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$/;
/** A host as browsers send it in Origin and Vercel in x-forwarded-host: name or IPv4, optional port. */
const HOST = /^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?(?::\d{1,5})?$/;
const UNITS = { s: 1000, m: 60_000, h: 3_600_000 } as const;

const isApp = (value: string): value is AppId => (APPS as readonly string[]).includes(value);

/** `customer=a,admin=b` → [['customer', 'a'], ['admin', 'b']]; wrong pairs become config issues. */
function appPairs(value: string, ctx: RefinementCtx, check: RegExp, what: string) {
  const pairs: [AppId, string][] = [];
  for (const entry of value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)) {
    const [app = '', item = '', ...rest] = entry.split('=').map((part) => part.trim());
    if (!isApp(app) || rest.length > 0 || !check.test(item)) {
      ctx.addIssue({
        code: 'custom',
        message: `"${entry}" is not <app>=<${what}> (apps: ${APPS.join(', ')})`,
      });
      continue;
    }
    pairs.push([app, item]);
  }
  return pairs;
}

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
  /** Redis for the rate limits: Render Key Value (internal URL) live, Docker Valkey on the laptop. */
  redisUrl: string().regex(/^rediss?:\/\//, 'Use a Redis URL'),
  /**
   * The x-origin-secret values the apps' Vercel routes send (ARCHITECTURE §7.2), comma-separated:
   * the current one, and during a rotation the old one too. At least 32 characters each.
   */
  originSecrets: string().transform((value, ctx) => {
    const secrets = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (
      secrets.length === 0 ||
      secrets.length > 2 ||
      secrets.some((secret) => secret.length < 32)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Use 1 or 2 secrets of at least 32 characters, comma-separated',
      });
      return NEVER;
    }
    return secrets;
  }),
  /** Exact hosts of each app: `customer=bq-customer.vercel.app,customer=localhost:3001` (§7.2, §11.4). */
  appHosts: string()
    .default('')
    .transform((value, ctx) => {
      const hosts = new Map<string, AppId>();
      for (const [app, host] of appPairs(value.toLowerCase(), ctx, HOST, 'host')) {
        const other = hosts.get(host);
        if (other !== undefined && other !== app) {
          ctx.addIssue({
            code: 'custom',
            message: `host ${host} belongs to both ${other} and ${app}`,
          });
        }
        hosts.set(host, app);
      }
      return hosts;
    }),
  /** Vercel project of each app, for its preview hosts (§11.4): `customer=bq-customer` */
  vercelProjects: string()
    .default('')
    .transform((value, ctx) => appPairs(value, ctx, SLUG, 'vercel project')),
  /** The Vercel scope slug that ends every preview host of the account, e.g. `nageshwar1997s-projects` */
  vercelScope: string()
    .regex(SLUG, 'Use the Vercel scope slug (lower case, digits, dashes)')
    .optional(),
  /** Rate-limit budgets that differ from the defaults: `write=20/1m,otp=5/15m` (units s, m, h). */
  rateLimits: string()
    .default('')
    .transform((value, ctx) => {
      const rules: Partial<Record<RateLimitClass, RateLimitRule>> = {};
      for (const entry of value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)) {
        const match = /^([a-z-]+)=(\d{1,6})\/(\d{1,4})([smh])$/.exec(entry);
        const name = match?.[1] ?? '';
        const limit = Number(match?.[2]);
        const windowMs = Number(match?.[3]) * UNITS[(match?.[4] ?? 's') as keyof typeof UNITS];
        if (
          !(RATE_LIMIT_CLASSES as readonly string[]).includes(name) ||
          limit < 1 ||
          windowMs < 1000
        ) {
          ctx.addIssue({
            code: 'custom',
            message: `"${entry}" is not <class>=<limit>/<window> like write=20/1m (classes: ${RATE_LIMIT_CLASSES.join(', ')})`,
          });
          continue;
        }
        rules[name as RateLimitClass] = { limit, windowMs };
      }
      return rules;
    }),
}).superRefine((config, ctx) => {
  if (config.vercelProjects.length > 0 && config.vercelScope === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['vercelScope'],
      message: 'Needed for GATEWAY__VERCEL_PROJECTS',
    });
  }
});
export type Config = output<typeof configZod>;

/** Reads and checks the settings. `strip` removes the GATEWAY__* keys from env afterwards (bundle mode). */
export function readConfig(options: Omit<LoadConfigOptions, 'prefix'> = {}): Config {
  return loadConfig(configZod, { prefix: 'GATEWAY', ...options });
}
