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

## Settings

`.env.example` ko `.env` me copy karo (commit kabhi nahi). Har key `CORE__` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah `process.env` rokta hai). Nayi setting = `configZod` me key + `.env.example` me line.

## Code kahan hai

- `src/service.ts`: `readConfig` + `start` (split mode me `src/server.ts`, bundle mode me `backend/bundle` isse chalata hai).
- `src/app.ts`: `@beautinique/backend-server-kit` ka `createApp` (health, errors, logs, request id).
- `src/modules/<module>/`: har business module ka folder (ARCHITECTURE §4): `index.ts` facade, `http`, `application`, `domain`, `infra`, `events`, `jobs`, `permissions.ts`, `settings.ts`.
- `src/modules/index.ts`: har module apna router yahan mount karta hai. Ek module doosre ke models import nahi karta, sirf facade se baat karta hai.

Node 24 TypeScript seedha chalata hai: imports me `.ts` likho, enum ya parameter properties nahi.
