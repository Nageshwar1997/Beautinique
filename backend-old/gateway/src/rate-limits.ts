import { createHash } from 'node:crypto';

import {
  ipKey,
  type RateLimitResult,
  type RateLimitRule,
} from '@beautinique/backend-server-ratelimit';
import { type RateLimitClass, refreshTokenParts } from '@beautinique/shared-contracts';

/** Rate-limit keys of the gateway in Redis (ARCHITECTURE §6.6). */
export const RATE_LIMIT_PREFIX = 'bq:gw:rl:';

/**
 * Budget of each class per client IP, an IPv6 one as its /64 (ARCHITECTURE §6.6, contracts
 * RATE_LIMIT_CLASSES). Indian mobile networks put many people behind one IPv4 (carrier NAT), so
 * reads are generous, and refresh and sign-out (`session`) have a roomy budget of their own: an app
 * refreshes about every 10 minutes, so 600 in 5 minutes is some 1,000 people on one IP (QA DR-005).
 * Signing in (`auth`) stays tight. GATEWAY__RATE_LIMITS changes single classes.
 */
export const DEFAULT_RATE_LIMITS: Readonly<Record<RateLimitClass, RateLimitRule>> = {
  public: { limit: 600, windowMs: 60_000 },
  read: { limit: 600, windowMs: 60_000 },
  write: { limit: 20, windowMs: 60_000 },
  search: { limit: 120, windowMs: 60_000 },
  auth: { limit: 30, windowMs: 5 * 60_000 },
  session: { limit: 600, windowMs: 5 * 60_000 },
  otp: { limit: 10, windowMs: 10 * 60_000 },
  'partner-api': { limit: 600, windowMs: 60_000 },
  webhook: { limit: 600, windowMs: 60_000 },
};

/**
 * The budget of one session (its refresh-token family) in the `session` class, on top of the IP's:
 * what a whole IP had before, so one looping tab or copied cookie cannot use up its neighbours'.
 */
export const SESSION_TOKEN_RULE: Readonly<RateLimitRule> = { limit: 30, windowMs: 5 * 60_000 };

/** When Redis is down these classes refuse (503) instead of letting requests through (§6.6). */
export const FAIL_CLOSED: ReadonlySet<RateLimitClass> = new Set(['auth', 'session', 'otp']);

/** One bucket a request takes from: its name in the answer headers, its key, its budget. */
export interface RateLimitBucket {
  name: string;
  key: string;
  rule: RateLimitRule;
}

/**
 * Sign-in and codes (`auth`, `otp`) for a whole IPv6 network (/48, one home or company's 65,536
 * /64s) get this many times one /64's budget (owner, 2026-11-12, QA DR-004): stepping through the
 * /64s of one network no longer multiplies the budget.
 */
export const NETWORK_FACTOR = 4;
const NETWORK_CLASSES: ReadonlySet<RateLimitClass> = new Set(['auth', 'otp']);

/** An IPv6 client's /48 from its /64 bucket (`2401:4900:1c2a:7f00::/64`); null for IPv4. */
function network48(client: string): string | null {
  if (!client.endsWith('::/64')) return null;
  return `${client.slice(0, -'::/64'.length).split(':').slice(0, 3).join(':')}::/48`;
}

/**
 * The buckets of a request, taken in this order: the class's budget for the client IP; for `auth`
 * and `otp` from IPv6, also its /48 network's (NETWORK_FACTOR times as much); for `session`, also
 * its refresh-token family's (the session id of a token from before families). A family is part of
 * the refresh token, so the key holds only its hash. A made-up token still takes from the IP's
 * budget first.
 */
export function rateLimitBuckets(
  name: RateLimitClass,
  ip: string,
  rules: Readonly<Record<RateLimitClass, RateLimitRule>>,
  refreshToken: string | undefined,
): RateLimitBucket[] {
  const client = ipKey(ip);
  if (name !== 'session') {
    const buckets: RateLimitBucket[] = [{ name, key: `${name}:${client}`, rule: rules[name] }];
    const network = NETWORK_CLASSES.has(name) ? network48(client) : null;
    if (network !== null) {
      buckets.push({
        name: `${name}-network`,
        key: `${name}:net:${network}`,
        rule: { limit: rules[name].limit * NETWORK_FACTOR, windowMs: rules[name].windowMs },
      });
    }
    return buckets;
  }
  const buckets: RateLimitBucket[] = [{ name, key: `session:ip:${client}`, rule: rules.session }];
  const parts = refreshTokenParts(refreshToken);
  if (parts) {
    const hash = createHash('sha256')
      .update(parts.family ?? parts.sessionId)
      .digest('base64url');
    buckets.push({ name: 'session-token', key: `session:token:${hash}`, rule: SESSION_TOKEN_RULE });
  }
  return buckets;
}

/**
 * The rate-limit answer headers (IETF draft-ietf-httpapi-ratelimit-headers, as express-rate-limit's
 * "draft-8"): the policy and what is left, in seconds; Retry-After when refused.
 */
export function rateLimitHeaders(
  name: string,
  rule: RateLimitRule,
  result: RateLimitResult,
): Record<string, string> {
  const seconds = (ms: number) => String(Math.ceil(ms / 1000));
  return {
    'RateLimit-Policy': `"${name}";q=${String(rule.limit)};w=${seconds(rule.windowMs)}`,
    RateLimit: `"${name}";r=${String(result.remaining)};t=${seconds(result.resetMs)}`,
    ...(result.allowed ? {} : { 'Retry-After': seconds(result.retryAfterMs) }),
  };
}
