# @beautinique/backend-server-ratelimit

Beautinique services ke rate limits Redis pe (ARCHITECTURE §6.6): har key ek **GCRA** bucket (token bucket, par Redis me sirf ek timestamp, hamesha TTL ke saath), ek Lua call me, Redis ki apni ghadi se. Ek **timeout** ke saath, taaki dheema ya band Redis kabhi request ko na roke: tab caller khud chunta hai, fail open ya fail closed. Gateway iske classes chalata hai; identity ke OTP limits (email, IP, device) bhi isi se.

## Install

```bash
npm install @beautinique/backend-server-ratelimit
```

`ioredis` client deployable ka apna shared client hai (`connectRedis`, `@beautinique/backend-server-queue`); ye package naya connection nahi kholta.

## Ek limit

```ts
import {
  createRateLimiter,
  ipKey,
  RateLimitUnavailableError,
} from '@beautinique/backend-server-ratelimit';

const limiter = createRateLimiter({ redis: redis.client, prefix: 'bq:gw:rl:' });

try {
  const result = await limiter.take(`otp:${ipKey(ip)}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!result.allowed) {
    // 429, Retry-After = result.retryAfterMs
  }
} catch (error) {
  if (!(error instanceof RateLimitUnavailableError)) throw error;
  // Redis band ya dheema: login/OTP pe 503 (fail closed), baaki routes ko jaane do (fail open)
}
```

## API

| Export                                             | Kaam                                                                                                                                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createRateLimiter({ redis, prefix, timeoutMs })`  | Limiter. `prefix` deployable ka (§6.6, jaise `bq:gw:rl:`), khaali nahi. `timeoutMs` (default 500) se dheema jawab = Redis band                                                                  |
| `limiter.take(key, { limit, windowMs }, cost = 1)` | `limit` requests per `windowMs`: saare ek saath aa sakte hain, phir har `windowMs / limit` pe ek. Mana hui request kuch nahi leti. Jawab `{ allowed, limit, remaining, resetMs, retryAfterMs }` |
| `limiter.reset(key)`                               | Bucket phir bhara (jaise sahi login ke baad)                                                                                                                                                    |
| `RateLimitUnavailableError`                        | Redis fail hua ya `timeoutMs` se dheema. Command baad me poora ho jaye to bhi koi nuksaan nahi                                                                                                  |
| `ipKey(ip)`                                        | IP ka bucket hissa: IPv4 waisa hi, IPv6 uska /64 (ek ghar ya phone ko poora /64 milta hai, warna wo address badal-badal ke limit todta). `::ffff:1.2.3.4` = `1.2.3.4`. IP na ho to `RangeError` |

**Redis me:** har bucket ek chhoti string key `<prefix><key>`, TTL = bucket phir bhare tak (zyada se zyada `windowMs`). Script `EVALSHA` se; Redis restart/wipe ke baad `NOSCRIPT` pe khud `EVAL`. Redis ki `TIME` ghadi, isliye alag instances (deploy overlap) ek hi hisaab rakhte hain. Samay microseconds me, isliye tez rule (jaise 900 per second) bhi apni sahi raftaar se bharta hai. Purana record (ghadi peeche gayi) bhara hua bucket ginta hai, kabhi usse zyada nahi.

## Niyam

- Key me sirf woh jo zaroori ho: class + subject (`write:<ipKey>`, aage `write:user:<id>`). Raw email key me na daalo; OTP limits me identity pehle normalize kare.
- Budget har deployable ke config me; is package me koi default nahi.
- Login aur OTP jaise raaste fail closed; baaki fail open (§6.6). Ye faisla caller ka hai, isliye error alag class hai.

## Tests

Asli Valkey pe (`npm run infra:up`, ya `REDIS_TEST_URL`): `npm test --workspace @beautinique/backend-server-ratelimit`. Mutations: `npm run mutate -- --package backend-server-ratelimit` (pehle `npm run infra:mutation:up`).

## License

MIT © Nageshwar Pawar
