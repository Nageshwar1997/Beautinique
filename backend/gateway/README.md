# gateway

The one public entry: checks the app, finds the route and streams it to the deployable that owns it. (ARCHITECTURE §3)

## Commands

| Command                             | Kaam                                                               |
| ----------------------------------- | ------------------------------------------------------------------ |
| `npm run dev --workspace gateway`   | Akela (split mode), http://localhost:8080, file badalte hi restart |
| `npm run build --workspace gateway` | `dist/` (compiled JS, production isi ko chalata hai)               |
| `npm run start --workspace gateway` | `dist/server.js` chalao                                            |
| `npm run test --workspace gateway`  | Tests                                                              |

Sab deployables ek process me: `npm run dev:backend` (`backend/bundle`).

## Settings

`.env.example` ko `.env` me copy karo (commit kabhi nahi). Har key `GATEWAY__` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah `process.env` rokta hai). Nayi setting = `configZod` me key + `.env.example` me line.

## Code kahan hai

- `src/service.ts`: `readConfig` + `start` (split mode me `src/server.ts`, bundle mode me `backend/bundle` isse chalata hai).
- `src/app.ts`: `@beautinique/backend-server-kit` ka `createApp` (health, errors, logs, request id).
- `src/proxy.ts`: `X-BQ-App` check, manifest se route, owner tak stream (path dobara encode hota hai, `..` nahi chalta).
- `src/manifest.ts`: platform ke routes (contracts `gatewayManifest`). Route table contracts me aate hi (T1.5) yahan import hogi.
- Abhi baaki: JWKS aur passport, origin secret, `clientIp()` (T2.2), Redis rate limits aur Sentry (T2.3).

Node 24 TypeScript seedha chalata hai: imports me `.ts` likho, enum ya parameter properties nahi.
