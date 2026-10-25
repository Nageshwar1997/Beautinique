# gateway

The one public entry: checks the app, finds the route and streams it to the deployable that owns it. (ARCHITECTURE §3)

## Commands

| Command                               | Kaam                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `npm run dev --workspace gateway`     | Akela (split mode), http://localhost:8080, file badalte hi restart         |
| `npm run build --workspace gateway`   | `dist/` (compiled JS, production isi ko chalata hai)                       |
| `npm run start --workspace gateway`   | `dist/server.js` chalao                                                    |
| `npm run test --workspace gateway`    | Tests (local Valkey chahiye: `npm run infra:up`)                           |
| `npm run mutate -- --package gateway` | Security checks ke mutations (RULES §6; pehle `npm run infra:mutation:up`) |

Sab deployables ek process me: `npm run dev:backend` (`backend/bundle`).

## Settings

`.env.example` ko `.env` me copy karo (commit kabhi nahi). Har key `GATEWAY__` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah `process.env` rokta hai). Nayi setting = `configZod` me key + `.env.example` me line.

Zaroori (bina inke start nahi hota): `GATEWAY__REDIS_URL` aur `GATEWAY__ORIGIN_SECRETS`. Laptop ki value `.env.example` me hai (public, sirf laptop; dev servers yahi bhejte hain). Live pe apni nayi value, Render aur har Vercel project (`ORIGIN_SECRET`, Sensitive) me ek jaisi.

## Har `/api/v1` request pe kya hota hai (is order me)

1. **Origin secret** (`x-origin-secret`, ARCHITECTURE §7.2): Vercel route lagata hai; bina iske 403 `FORBIDDEN`. Rotation me do values chalti hain. `/health`, `/ready`, `/status` is check se bahar (Render aur monitors seedhe bulate hain).
2. **App:** `X-BQ-App` 11 apps me se ho, aur request usi app ke host se aaye: `x-forwarded-host` (Vercel), ya bina proxy ke `Host`. Browser ka `Origin` bilkul wahi host ho (API same-origin hai; preview pattern akela kisi aur Vercel account ka scope alag nahi kar pata). Allow-list = `GATEWAY__APP_HOSTS` + Vercel previews (`<project>-git-<branch>-<scope>.vercel.app`, `GATEWAY__VERCEL_PROJECTS` + `GATEWAY__VERCEL_SCOPE`); `*.vercel.app` kabhi nahi. Galat = 403 `APP_NOT_ALLOWED`.
3. **Route:** contracts ka route table ([src/manifest.ts](src/manifest.ts)), `..` nahi chalta; app ko route ki ijazat. GET/DELETE pe body (`Transfer-Encoding` ya `Content-Length`) = 400, aur owner ko kabhi body nahi jaati (warna bina framing ke body owner ko doosri request lagti: request smuggling).
4. **Rate limit:** route ki class, client IP pe (IPv6 ka /64), Redis pe (`@beautinique/backend-server-ratelimit`). Budgets [src/rate-limits.ts](src/rate-limits.ts), badalne ho to `GATEWAY__RATE_LIMITS`. Jawab me `RateLimit-Policy` aur `RateLimit`, mana hone pe 429 `RATE_LIMITED` + `Retry-After`. Redis band: `auth` aur `otp` 503, baaki chalte hain.
5. **Access:** jab tak sign-in (T2.2, identity M3) nahi, sirf `public` routes aage jaate hain; baaki 401 `UNAUTHENTICATED`.
6. **Idempotency-Key** jis route ko chahiye: 1–255 visible characters, warna 400.
7. **Owner tak stream:** route ka path dobara encode; owner ko `X-BQ-Client-Ip` (client IP, sirf gateway likhta hai) aur request id. Client ke `x-forwarded-for`, `x-real-ip`, origin secret aage nahi jaate. Owner ka jawab beech me ruk jaye ya toote to client ka jawab bhi kat jaata hai (latka nahi rehta).
8. **Cache:** contract me `cache` wale public GET route ka 200/304 = `public, max-age=0, s-maxage, stale-while-revalidate` (Vercel CDN), cookies/authorization owner ko nahi, `Set-Cookie` wapas nahi. Baaki sab `private, no-store` (owner ka apna `private` policy, jaise ETag ke saath `no-cache`, rehta hai); gateway ke errors `no-store`.

**Client IP:** sirf sahi origin secret wali request pe Vercel ka `x-real-ip`, warna socket address ([src/trust.ts](src/trust.ts) `clientIp()`). Express ka `trust proxy` nahi.

## Health

- `/health`: process zinda (Render health check).
- `/ready`: Redis + har chalte deployable ka `/health` (monitors).
- `/status`: har deployable ka gehra `/ready` ek jawab me (`ok` = 200, warna `degraded` 503). Public, owner ka faisla 2026-10-25: sirf naam aur ok/failing; versions, memory, queue depth baad me sign-in ke peeche. Ek jawab 5 s tak sab requests ko (databases pe bojh nahi).

## Code kahan hai

- `src/service.ts`: `readConfig` + `start` (Redis connect, limiter, app registry; split mode me `src/server.ts`, bundle mode me `backend/bundle`).
- `src/app.ts`: server-kit ka `createApp` (security headers, request id, logs, `/health`), `/ready`, `/status`, proxy.
- `src/proxy.ts`: upar ke 1–8.
- `src/apps.ts`: host → app (exact + Vercel previews). `src/trust.ts`: origin secret, `clientIp()`. `src/rate-limits.ts`: budgets, headers. `src/status.ts`: `/status`.
- Abhi baaki: JWKS, per-app cookies aur passport (T2.2, identity ke saath M3); Sentry (M2 deploy ke saath); webhooks ka raasta (payments ke saath).

Node 24 TypeScript seedha chalata hai: imports me `.ts` likho, enum ya parameter properties nahi.
