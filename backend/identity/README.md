# identity

Sign-in, sessions, tokens, apps, roles and scoped grants. (ARCHITECTURE §3)

## Commands

| Command                              | Kaam                                                               |
| ------------------------------------ | ------------------------------------------------------------------ |
| `npm run dev --workspace identity`   | Akela (split mode), http://localhost:8081, file badalte hi restart |
| `npm run build --workspace identity` | `dist/` (compiled JS, production isi ko chalata hai)               |
| `npm run start --workspace identity` | `dist/server.js` chalao                                            |
| `npm run test --workspace identity`  | Tests                                                              |

Sab deployables ek process me: `npm run dev:backend` (`backend/bundle`).

Identity ko MongoDB (apna DB `bq_identity`) aur Redis chahiye (start pe connect hota hai, `/ready` dono check karta hai, tests bhi asli pe chalte hain): pehle `npm run infra:up`. Outbox relay aur queue worker pehle event ke saath aate hain (TASKS T3.1).

## Settings

`.env.example` ko `.env` me copy karo (commit kabhi nahi). Har key `IDENTITY__` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah `process.env` rokta hai). Nayi setting = `configZod` me key + `.env.example` me line.

## Code kahan hai

- `src/service.ts`: `readConfig` + `start` (split mode me `src/server.ts`, bundle mode me `backend/bundle` isse chalata hai).
- `src/app.ts`: `@beautinique/backend-server-kit` ka `createApp` (health, errors, logs, request id).
- `src/routes/index.ts`: identity ke routes. Har route contracts me declare hota hai (owner `identity`), yahan sirf handler.

Node 24 TypeScript seedha chalata hai: imports me `.ts` likho, enum ya parameter properties nahi.
