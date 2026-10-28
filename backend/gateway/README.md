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

`.env.example` ka LOCAL hissa `.env` me copy karo (commit kabhi nahi); OPTIONAL me defaults, PRODUCTION me live ki keys dummy values ke saath. Har key `GATEWAY__` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah `process.env` rokta hai). Nayi setting = `configZod` me key + `.env.example` me line.

Zaroori (bina inke start nahi hota): `GATEWAY__REDIS_URL` aur `GATEWAY__ORIGIN_SECRETS`. Laptop ki value `.env.example` me hai (public, sirf laptop; dev servers yahi bhejte hain). Live pe apni nayi value, Render aur har Vercel project (`ORIGIN_SECRET`, Sensitive) me ek jaisi.

## Har `/api/v1` request pe kya hota hai (is order me)

1. **Origin secret** (`x-origin-secret`, ARCHITECTURE §7.2): Vercel route lagata hai; bina iske 403 `FORBIDDEN`. Rotation me do values chalti hain. `/health`, `/ready`, `/status` is check se bahar (Render aur monitors seedhe bulate hain).
2. **App:** `X-BQ-App` 11 apps me se ho, aur request usi app ke host se aaye: `x-forwarded-host` (Vercel), ya bina proxy ke `Host`. Browser ka `Origin` bilkul wahi host ho (API same-origin hai; preview pattern akela kisi aur Vercel account ka scope alag nahi kar pata). Allow-list = `GATEWAY__APP_HOSTS` + Vercel previews (`<project>-git-<branch>-<scope>.vercel.app`, `GATEWAY__VERCEL_PROJECTS` + `GATEWAY__VERCEL_SCOPE`); `*.vercel.app` kabhi nahi. Galat = 403 `APP_NOT_ALLOWED`.
3. **Route:** contracts ka route table ([src/manifest.ts](src/manifest.ts)), `..` nahi chalta; app ko route ki ijazat. GET/DELETE pe body (`Transfer-Encoding` ya `Content-Length`) = 400, aur owner ko kabhi body nahi jaati (warna bina framing ke body owner ko doosri request lagti: request smuggling).
4. **Rate limit:** route ki class, client IP pe (IPv6 ka /64), Redis pe (`@beautinique/backend-server-ratelimit`). Budgets [src/rate-limits.ts](src/rate-limits.ts), badalne ho to `GATEWAY__RATE_LIMITS`. Jawab me `RateLimit-Policy` aur `RateLimit`, mana hone pe 429 `RATE_LIMITED` + `Retry-After`. Redis band: `auth` aur `otp` 503, baaki chalte hain.
5. **Access** ([src/sessions.ts](src/sessions.ts)): `public` seedha aage. Baaki route pe app ki apni cookie `__Host-bq_<app>_at`: identity ka ES256 token, uske JWKS se check (`aud = bq:<app>`, 10 min cache, anjaan `kid` pe dobara), aur Redis me session ya poora account band to nahi (`bq:id:session-revoked:*`, `bq:id:user-revoked:*`). Na ho / galat = 401 `UNAUTHENTICATED` (app tab `/auth/refresh` karti hai); Redis ya JWKS na mile = 503. `permission` routes T3.3 (grants) tak 403 `FORBIDDEN`. Sahi ho to owner ko 60 s ka **passport** (`X-BQ-Passport`, `aud = bq:<owner>`); client ka bheja passport kabhi aage nahi jaata. Passport ki public key `GET /.well-known/passport-jwks.json` (bundle har start pe nayi key banata hai).
6. **Idempotency-Key** jis route ko chahiye: 1–255 visible characters, warna 400.
7. **Owner tak stream:** route ka path dobara encode; owner ko `X-BQ-Client-Ip` (client IP, sirf gateway likhta hai) aur request id. Client ke `x-forwarded-for`, `x-real-ip`, origin secret aage nahi jaate. Owner ka jawab beech me ruk jaye ya toote to client ka jawab bhi kat jaata hai (latka nahi rehta).
8. **Cache:** contract me `cache` wale public GET route ka 200/304 = `public, max-age=0, s-maxage, stale-while-revalidate` (Vercel CDN), cookies/authorization owner ko nahi, `Set-Cookie` wapas nahi. Baaki sab `private, no-store` (owner ka apna `private` policy, jaise ETag ke saath `no-cache`, rehta hai); gateway ke errors `no-store`.

**Client IP:** sirf sahi origin secret wali request pe Vercel ka `x-real-ip`, warna socket address ([src/trust.ts](src/trust.ts) `clientIp()`). Express ka `trust proxy` nahi.

## Health

- `/health`: process zinda (Render health check).
- `/wake`: soye free Render service ko jagane ke liye (apps ki wake-up screen browser se seedha bulati hai, kyunki Vercel ke raaste ki request soye service ko nahi jagati). Khaali 204, `no-store`, `Cross-Origin-Resource-Policy: cross-origin`; origin secret ke bina, kuch nahi chhoota.
- `/ready`: Redis + har chalte deployable ka `/health` (monitors).
- `/status`: har deployable ka gehra `/ready` ek jawab me (`ok` = 200, warna `degraded` 503). Public, owner ka faisla 2026-10-25: sirf naam aur ok/failing; versions, memory, queue depth baad me sign-in ke peeche. Ek jawab 5 s tak sab requests ko (databases pe bojh nahi).

## Code kahan hai

- `src/service.ts`: `readConfig` + `start` (Redis connect, limiter, app registry; split mode me `src/server.ts`, bundle mode me `backend/bundle`).
- `src/app.ts`: server-kit ka `createApp` (security headers, request id, logs, `/health`), `/ready`, `/status`, `/wake`, proxy.
- `src/proxy.ts`: upar ke 1–8.
- `src/apps.ts`: host → app (exact + Vercel previews). `src/trust.ts`: origin secret, `clientIp()`. `src/rate-limits.ts`: budgets, headers. `src/status.ts`: `/status`.
- Abhi baaki: webhooks ka raasta (payments ke saath); grants ka check (T3.3).

Node 24 TypeScript seedha chalata hai: imports me `.ts` likho, enum ya parameter properties nahi.
