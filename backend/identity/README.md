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

Identity ko MongoDB (apna DB `bq_identity`) aur Redis chahiye (start pe connect hota hai, `/ready` mongo, redis aur outbox check karta hai, tests bhi asli pe chalte hain): pehle `npm run infra:up`. Outbox relay chalta hai (sign-in code notify tak); queue worker pehli subscription ke saath (T3.5).

## Email code se sign-in (TASKS T3.1 PR 2, ARCHITECTURE §7.1)

Apps: customer, seller, creator, delivery (`OTP_APPS`); internal apps password + TOTP (PR 3). Routes (contracts, sab `public`, gateway ki `otp`/`auth` rate limits):

| Route                                | Kaam                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /auth/otp`                     | Email pe code. Har email ka **ek jaisa jawab**: account hai to sign-in code, sign-up app (customer, seller, creator) me naya email ho to account banane ka code, baaki anjaan email pe kuch nahi jaata (aur koi code fit nahi hota). Sign-up apps har request pe consent maangte hain (`consentProblems`): terms + privacy, customer me 18+ bhi. |
| `POST /auth/otp/:challengeId/resend` | Naya code (purana band): max 3, ek minute ke gap se.                                                                                                                                                                                                                                                                                             |
| `POST /auth/otp/:challengeId/verify` | 5 try; sahi code ek hi baar chalta hai; sign-in, ya sign-up app me account (`identity_users`) + consent ka record (`identity_legal_acceptances`). Session (cookies) T3.2 me.                                                                                                                                                                     |

- Code Redis me sirf hash (`bq:id:otp:<challengeId>`, 10 min TTL, `IDENTITY__BLIND_INDEX_KEY` ka HMAC); notify tak event `identity.otp.requested` me **sealed** (`IDENTITY__OTP_EVENT_KEYS`, notify ke paas wahi key). Outbox, Redis ya logs me code khula nahi.
- Ek email ke ek ghante me max `IDENTITY__OTP_EMAIL_LIMIT_PER_HOUR` (5) codes, resend bhi gine jaate hain; counter key me email nahi, uska HMAC. IP ki limit gateway (`otp` class).
- Redis band = 503, koi code nahi jaata (ARCHITECTURE §6.6). Try aur resend Lua scripts se atomic (do request ek code se ek hi account; ek code do baar nahi).
- Consent: naye account pe, pehli baar 18+ declaration pe, ya naye `IDENTITY__LEGAL_VERSION` pe ek row; har sign-in pe nahi. 18+ sirf customer app ka.
- Errors (`IDENTITY_ERROR_CODES`): `OTP_INVALID`, `OTP_EXPIRED`, `OTP_RESEND_TOO_SOON`, `OTP_RESEND_LIMIT`, `OTP_EMAIL_LIMIT`; text ek jagah [src/errors.ts](src/errors.ts). Koi error nahi batata ki email ka account hai ya nahi.
- Mutations (RULES §6, login): `npm run mutate -- --package identity` ([test/mutations.ts](test/mutations.ts)).

## Settings

`.env.example` ka LOCAL hissa `.env` me copy karo (commit kabhi nahi); OPTIONAL me defaults, PRODUCTION me live ki keys dummy values ke saath. Har key `IDENTITY__` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah `process.env` rokta hai). Nayi setting = `configZod` me key + `.env.example` me line.

## Code kahan hai

- `src/service.ts`: `readConfig` + `start` (split mode me `src/server.ts`, bundle mode me `backend/bundle` isse chalata hai).
- `src/release.ts` + `src/runtime.ts`: start pe Mongo se judte hi release steps (migrations, indexes; `@beautinique/backend-server-release`, ARCHITECTURE §11.1), phir Redis. Nayi migration list ke aakhir me, naye collection ke indexes `indexes` me; permission sync step T3.3 me.
- `src/app.ts`: `@beautinique/backend-server-kit` ka `createApp` (health, errors, logs, request id).
- `src/routes/index.ts`: identity ke routes (app `X-BQ-App` se, IP `X-BQ-Client-Ip` se, dono gateway ke). Har route contracts me declare hota hai (owner `identity`), yahan sirf handler.
- `src/otp.ts`: code maangna, naya code, check (Redis + outbox). `src/users.ts`: accounts aur consent. `src/errors.ts`: error text.

Node 24 TypeScript seedha chalata hai: imports me `.ts` likho, enum ya parameter properties nahi.
