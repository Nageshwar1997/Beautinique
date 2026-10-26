import type { RateLimitResult, RateLimitRule } from '@beautinique/backend-server-ratelimit';
import type { RateLimitClass } from '@beautinique/shared-contracts';

/** Rate-limit keys of the gateway in Redis (ARCHITECTURE §6.6). */
export const RATE_LIMIT_PREFIX = 'bq:gw:rl:';

/**
 * Budget of each class per client (ARCHITECTURE §6.6, contracts RATE_LIMIT_CLASSES). Until sign-in
 * exists (T2.2) the client is its IP, an IPv6 one as its /64. Indian mobile networks put many people
 * behind one IPv4 (carrier NAT), so reads are generous; writes are tight while the only public write
 * is the live demo ping. GATEWAY__RATE_LIMITS changes single classes.
 */
export const DEFAULT_RATE_LIMITS: Readonly<Record<RateLimitClass, RateLimitRule>> = {
  public: { limit: 600, windowMs: 60_000 },
  read: { limit: 600, windowMs: 60_000 },
  write: { limit: 20, windowMs: 60_000 },
  search: { limit: 120, windowMs: 60_000 },
  auth: { limit: 30, windowMs: 5 * 60_000 },
  otp: { limit: 10, windowMs: 10 * 60_000 },
  'partner-api': { limit: 600, windowMs: 60_000 },
  webhook: { limit: 600, windowMs: 60_000 },
};

/** When Redis is down these classes refuse (503) instead of letting requests through (§6.6). */
export const FAIL_CLOSED: ReadonlySet<RateLimitClass> = new Set(['auth', 'otp']);

/**
 * The rate-limit answer headers (IETF draft-ietf-httpapi-ratelimit-headers, as express-rate-limit's
 * "draft-8"): the policy and what is left, in seconds; Retry-After when refused.
 */
export function rateLimitHeaders(
  name: RateLimitClass,
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
