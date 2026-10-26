// Deliberate bugs for `npm run mutate -- --package backend-server-ratelimit` (RULES §6): each one must
// make a test fail, unless `survives` says why it cannot. Rate limits guard login and OTP, so the
// whole package is listed. The runner refuses a list whose `from` text no longer occurs exactly once.

import type { Mutation } from '../../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  {
    file: 'index',
    name: 'an old arrival time is not moved up to now',
    change: [['if tat < now then tat = now end', '']],
    tests: 'fills up again',
  },
  {
    file: 'index',
    name: 'the bucket holds one request less',
    change: [
      [
        'local allow_at = new_tat - interval * capacity',
        'local allow_at = new_tat - interval * (capacity - 1)',
      ],
    ],
    tests: 'rate limiter',
  },
  {
    file: 'index',
    name: 'the request at the exact limit is refused',
    change: [['if allow_at > now then', 'if allow_at >= now then']],
    tests: 'rate limiter',
  },
  {
    file: 'index',
    name: 'refused requests are counted too',
    change: [
      [
        '  return {0, math.floor((now + interval * capacity - tat) / interval), ms(allow_at - now), ms(tat - now)}',
        "  redis.call('SET', KEYS[1], new_tat, 'PX', ms(new_tat - now))\n  return {0, 0, ms(allow_at - now), ms(tat - now)}",
      ],
    ],
    tests: 'fills up again',
  },
  {
    file: 'index',
    name: 'the key has no TTL',
    change: [
      [
        "redis.call('SET', KEYS[1], new_tat, 'PX', ms(new_tat - now))",
        "redis.call('SET', KEYS[1], new_tat)",
      ],
    ],
    tests: 'TTL',
  },
  {
    file: 'index',
    name: 'cost is ignored',
    change: [['local new_tat = tat + interval * cost', 'local new_tat = tat + interval']],
    tests: 'cost',
  },
  {
    file: 'index',
    name: 'remaining is off by one',
    change: [
      [
        'return {1, math.floor((now + interval * capacity - new_tat) / interval), 0, ms(new_tat - now)}',
        'return {1, math.floor((now + interval * capacity - new_tat) / interval) + 1, 0, ms(new_tat - now)}',
      ],
    ],
    tests: 'full bucket',
  },
  {
    file: 'index',
    name: 'retry-after is not reported',
    change: [['ms(allow_at - now), ms(tat - now)}', '0, ms(tat - now)}']],
    tests: 'full bucket',
  },
  {
    file: 'index',
    name: 'the interval rounds down (lets more through)',
    change: [
      [
        'Math.ceil((rule.windowMs * 1000) / rule.limit)',
        'Math.floor((rule.windowMs * 1000) / rule.limit)',
      ],
    ],
    tests: 'full bucket',
    survives:
      'rounding happens in microseconds: under 1 µs per request, which no test can see through a Redis round trip',
  },
  {
    file: 'index',
    name: 'the interval is whole milliseconds again (fast rules refill too slowly)',
    change: [
      [
        'Math.ceil((rule.windowMs * 1000) / rule.limit)',
        'Math.ceil(rule.windowMs / rule.limit) * 1000',
      ],
    ],
    tests: 'fast rule',
  },
  {
    file: 'index',
    name: 'no NOSCRIPT fallback',
    change: [
      ["if (error instanceof Error && error.message.startsWith('NOSCRIPT')) {", 'if (false) {'],
    ],
    tests: 'forgot',
  },
  {
    file: 'index',
    name: 'no timeout on a hung Redis',
    change: [['return await Promise.race([work, timeout]);', 'return await work;']],
    tests: 'timeout',
  },
  {
    file: 'index',
    name: 'Redis errors are not wrapped',
    change: [
      ["throw new RateLimitUnavailableError('Redis failed', { cause: error });", 'throw error;'],
    ],
    tests: 'refuses',
  },
  {
    file: 'index',
    name: 'cost above the limit is accepted',
    change: [['cost > rule.limit', 'cost > rule.limit + 1']],
    tests: 'wrong rules',
  },
  {
    file: 'index',
    name: 'fractional limits are accepted',
    change: [['if (!Number.isInteger(limit) || limit < 1) {', 'if (limit < 1) {']],
    tests: 'wrong rules',
  },
  {
    file: 'index',
    name: 'over-long keys are accepted',
    change: [["if (key === '' || key.length > MAX_KEY_LENGTH) {", "if (key === '') {"]],
    tests: 'wrong rules',
  },
  {
    file: 'index',
    name: 'reset does not delete',
    change: [['await within(timeoutMs, redis.del(fullKey(key)));', 'fullKey(key);']],
    tests: 'reset',
  },
  {
    file: 'index',
    name: 'IPv4-mapped IPv6 is not unmapped',
    change: [['if (mapped !== undefined && isIPv4(mapped)) return mapped;', '']],
    tests: 'ipKey',
  },
  {
    file: 'index',
    name: 'IPv6 keeps the whole address',
    change: [['    .slice(0, 4)\n', '']],
    tests: 'ipKey',
  },
  {
    file: 'index',
    name: 'embedded IPv4 counts as one group',
    change: [["count + (group.includes('.') ? 2 : 1)", 'count + 1']],
    tests: 'ipKey',
  },
  {
    file: 'index',
    name: 'non-addresses get a key',
    change: [["if (!isIPv6(ip)) throw new RangeError('Not an IP address');", '']],
    tests: 'ipKey',
  },
];

export default mutations;
