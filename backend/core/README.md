# core

Every other business module, as a modular monolith. (ARCHITECTURE §3, §4)

## Commands

| Command                          | Kaam                                                               |
| -------------------------------- | ------------------------------------------------------------------ |
| `npm run dev --workspace core`   | Akela (split mode), http://localhost:8084, file badalte hi restart |
| `npm run build --workspace core` | `dist/` (compiled JS, production isi ko chalata hai)               |
| `npm run start --workspace core` | `dist/server.js` chalao                                            |
| `npm run test --workspace core`  | Tests                                                              |

Sab deployables ek process me: `npm run dev:backend` (`backend/bundle`).

Core ko MongoDB aur Redis chahiye (start pe connect hota hai, tests bhi asli pe chalte hain): pehle `npm run infra:up`.

## Settings

`.env.example` ko `.env` me copy karo (commit kabhi nahi). Har key `CORE__` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah `process.env` rokta hai). Nayi setting = `configZod` me key + `.env.example` me line.

## Code kahan hai

- `src/service.ts`: `readConfig` + `start` (split mode me `src/server.ts`, bundle mode me `backend/bundle` isse chalata hai).
- `src/app.ts`: `@beautinique/backend-server-kit` ka `createApp` (health, errors, logs, request id) aur `/ready` ke checks (mongo, redis, outbox, events).
- `src/runtime.ts`: MongoDB + Redis connect karta hai aur peeche ke kaam chalata hai: outbox relay, queue worker (`q.core`) schedules ke saath, aur Redis wipe watchdog. Beech me kuch fail ho to pehle khola hua sab band hota hai.
- `src/modules/<module>/`: har business module ka folder (ARCHITECTURE §4): `index.ts` facade, `http`, `application`, `domain`, `infra`, `events`, `jobs`, `permissions.ts`, `settings.ts`.
- `src/modules/index.ts`: har module apna router, apne event subscribers aur subscriptions yahan jodta hai. Ek module doosre ke models import nahi karta, sirf facade se baat karta hai.

## Milestone 1: sample `platform` module

`src/modules/platform/` ek chhota poora namuna hai, naya module isi jaisa bane:

- `POST /platform/pings` (contract `platform.ping.record`): `mountRoute` input check karta hai, ping aur `platform.ping.recorded` event ek hi transaction me likhta hai, jawab commit ke baad (201, `{ data }`).
- `GET /platform/pings/:pingId`: ek ping padhta hai (nahi mila to `NOT_FOUND`).
- Event outbox se relay ke raaste Redis queue me jaata hai, worker `core.pingAudit` subscriber chalata hai jo `platform_ping_audit` me ek row likhta hai; wahi event dobara aaye to inbox ka nishaan use skip kar deta hai.
- Kaun call kar sakta hai (`access`, `apps`) gateway dekhta hai (Phase 2); idempotency aur `authorize()` platform kernel me (T4.1). Abhi event ka actor `system` hai, kyunki core tak signed-in user nahi pahunchta.

`test/platform.test.ts` poora raasta chalata hai (typed client se POST, event outbox se queue se inbox tak) aur **Redis wipe drill**: worker band, do events queue me, Redis ki queue keys aur `bq:epoch` mita do; watchdog schedulers wapas rakhta hai aur events dobara bhejta hai; worker chalu hone par dono apply hote hain, ek-ek baar. Doosra drill: handled event wipe ke baad dobara aaye to skip hota hai.

Node 24 TypeScript seedha chalata hai: imports me `.ts` likho, enum ya parameter properties nahi.
