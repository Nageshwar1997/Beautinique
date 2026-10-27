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

Identity ko MongoDB (apna DB `bq_identity`) aur Redis chahiye (start pe connect hota hai, `/ready` mongo, redis aur outbox check karta hai, tests bhi asli pe chalte hain): pehle `npm run infra:up`. Outbox relay chalta hai (email code notify tak); queue worker pehli subscription ke saath (T3.5).

## Sign-up aur sign-in (TASKS T3.1 PR 2 + 3, ARCHITECTURE §7.1)

Owner ke faisle (2026-10-27): **sabhi 11 apps email + password se sign-in** karte hain, sign-in me email code nahi. Email code sirf sign-up (email pakka karne ke liye) aur password set/reset me. Ek account, ek password, sabhi apps me. Authenticator (TOTP) 7 internal apps me har sign-in pe zaroori (pehli baar wahin lagta hai), baaki me optional; ek baar laga to har app maangta hai. Routes (contracts, sab `public`, gateway ki `otp`/`auth` rate limits):

| Route                                    | Apps                      | Kaam                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/sign-up/code`                | customer, seller, creator | Sign-up ka code. Har email ko code jaata hai (account pehle se ho to wo code ke baad hi pata chalta hai). Consent har baar (`consentProblems`): terms + privacy, customer me 18+ bhi.                                                                                                                             |
| `POST /auth/password/code`               | sab                       | Password set/reset ka code (pehla password: Google wala account, rider, staff; ya bhool gaya). Anjaan email pe kuch nahi jaata, jawab wahi aur utne hi samay me.                                                                                                                                                  |
| `POST /auth/otp/:challengeId/resend`     | sab                       | Naya code (purana band): max 3, ek minute ke gap se.                                                                                                                                                                                                                                                              |
| `POST /auth/otp/:challengeId/verify`     | sab                       | `{ code, password }`. 5 try; sahi code ek hi baar. Leaked password (HIBP) code khatam hone se pehle mana. `outcome`: `account-made` (naya account, signed in), `password-set` (password code, ya bina password wala account), `password-kept` (account me password pehle se: nahi badla, us app ka consent juda). |
| `POST /auth/login`                       | sab                       | `{ email, password }` → `next`: `signed-in`, `totp` (authenticator hai) ya `totp-enroll` (internal app, abhi nahi laga) + `loginId` (5 min; lagane ke liye 10).                                                                                                                                                   |
| `POST /auth/login/:loginId/totp`         | sab                       | Authenticator code; har code ek baar (pichhla time step DB me).                                                                                                                                                                                                                                                   |
| `POST /auth/login/:loginId/recovery`     | sab                       | 10 recovery codes me se ek (`ABCDE-FGH23`), har code ek baar; bache hue ginti me.                                                                                                                                                                                                                                 |
| `POST /auth/login/:loginId/totp/enroll`  | sab                       | Naya secret + `otpauth://` link (QR browser me banta hai). Dobara maangne pe naya secret.                                                                                                                                                                                                                         |
| `POST /auth/login/:loginId/totp/confirm` | sab                       | Pehla sahi code authenticator save karta hai: 10 recovery codes (sirf ek baar dikhte hain), signed in.                                                                                                                                                                                                            |

- **Collections:** `identity_users` (account, har role ka ek hi), `identity_credentials` (`_id` = userId: password ka argon2id hash, TOTP secret `IDENTITY__FIELD_KEYS` se sealed + `lastStep`, recovery codes ke HMAC), `identity_auth_providers` (login ke tareeke: `password`, `google`, `linkedin`, `github`; `subject` = provider ka user id; unique `(userId, provider)` aur `(provider, subject)`), `identity_legal_acceptances` (consent: naya account, us app me pehli baar, naya legal version, pehli 18+ declaration).
- **Password** ([src/password.ts](src/password.ts)): `passwordZod` (trim, 12–128). argon2id Node ke `crypto.argon2` se, OWASP minimum (19 MiB, t=2, p=1), **ek waqt me ek hash** (32 se zyada intezaar = 503); purani settings wala hash agle sahi sign-in pe naya. HIBP range API (sirf SHA-1 ke pehle 5 hex bahar, padding ke saath), 2 s timeout, na mile to password chalta hai + warning log (fail-open). `IDENTITY__HIBP_URL` optional (tests nakli server pe).
- **Ek jaisa jawab:** galat email, galat password, bina password ka account (sirf Google) aur locked account: sab `INVALID_CREDENTIALS` 401, aur password hamesha check hota hai (anjaan email pe ek nakli hash se), isliye samay bhi ek jaisa. Code maangna/resend min 400 ms (`OTP_MIN_ANSWER_MS`).
- **Rok** ([src/lockout.ts](src/lockout.ts)): 15 min me 10 galat (password, authenticator, recovery code sab gine jaate hain) → us account pe 1 ghanta rok, jawab wahi. Ginti sirf poore sign-in ke baad reset (sirf sahi password se nahi, warna authenticator ko naye try milte). Email code se naya password rok hatata hai. Keys me email nahi, uska HMAC.
- **Session:** har sign-in ka aakhri step `SessionPort.issue` ([src/sessions.ts](src/sessions.ts)). Abhi sirf naam lautata hai, koi cookie nahi; asli session T3.2 me, "us app ka grant hai?" check T3.3 me.
- Code Redis me sirf hash (`bq:id:otp:<challengeId>`, 10 min TTL); notify tak event `identity.otp.requested` me **sealed** (`IDENTITY__OTP_EVENT_KEYS`), purpose `sign-up` ya `password`. Ek email ke ek ghante me max `IDENTITY__OTP_EMAIL_LIMIT_PER_HOUR` (5) codes. Redis band = 503.
- Errors (`IDENTITY_ERROR_CODES`): `OTP_*`, `INVALID_CREDENTIALS`, `PASSWORD_BREACHED`, `LOGIN_EXPIRED`, `TOTP_INVALID`, `RECOVERY_CODE_INVALID`; text ek jagah [src/errors.ts](src/errors.ts).
- Mutations (RULES §6, login): `npm run mutate -- --package identity` ([test/mutations.ts](test/mutations.ts)). Tests asli Mongo + Valkey pe, HIBP ka nakli server ([test/helpers.ts](test/helpers.ts)); internet kabhi nahi.

## Sessions (TASKS T3.2, ARCHITECTURE §7.2)

- Har sign-in (password, authenticator, recovery code, authenticator lagana, naya account) ke aakhir me `identity_sessions` me ek session aur app ki do cookies: `__Host-bq_<app>_at` (ES256 access token, 10 min, Path /, Lax) aur `__Secure-bq_<app>_rt` (refresh, Path `/api/v1/auth`, Strict). Dono HttpOnly + Secure, Domain nahi. Jawab ke body me koi token nahi.
- Session ki lambai `SESSION_POLICIES` (contracts): customer/creator 30 din, har refresh pe aage, max 90; seller 7; delivery 14; internal 12 ghante aur 30 min idle.
- `POST /auth/refresh`: naya token pair, purana band. Purana token 10 s ke andar = parallel tab (409 `REFRESH_IN_PROGRESS`); baad me = chori: session band, Redis `bq:id:session-revoked:<sid>`, event `identity.session.reuseDetected` → notify ka "We signed you out" email. Session khatam (idle/expire) ho chuka ho to chupchaap `SESSION_EXPIRED`, alarm nahi.
- `POST /auth/logout`: session band + Redis key + cookies saaf. Email code se naya password = account ke **saare** sessions band + `bq:id:user-revoked:<userId>`.
- Token keys: `identity_signing_keys`, private key `IDENTITY__FIELD_KEYS` se sealed, har 30 din nayi; `GET /.well-known/jwks.json` (sirf gateway ke liye, `/api` route nahi).
- Gateway ka token check, passport, `/iam/me` aur My Devices: T3.2 PR B.

## Settings

`.env.example` ka LOCAL hissa `.env` me copy karo (commit kabhi nahi); OPTIONAL me defaults, PRODUCTION me live ki keys dummy values ke saath. Har key `IDENTITY__` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah `process.env` rokta hai). Nayi setting = `configZod` me key + `.env.example` me line.

## Code kahan hai

- `src/service.ts`: `readConfig` + `start` (split mode me `src/server.ts`, bundle mode me `backend/bundle` isse chalata hai).
- `src/release.ts` + `src/runtime.ts`: start pe Mongo se judte hi release steps (migrations, indexes; `@beautinique/backend-server-release`, ARCHITECTURE §11.1), phir Redis. Nayi migration list ke aakhir me, naye collection ke indexes `indexes` me; permission sync step T3.3 me.
- `src/app.ts`: `@beautinique/backend-server-kit` ka `createApp` (health, errors, logs, request id).
- `src/routes/index.ts`: identity ke routes (app `X-BQ-App` se, IP `X-BQ-Client-Ip` se, dono gateway ke). Har route contracts me declare hota hai (owner `identity`), yahan sirf handler.
- `src/otp.ts`: email code maangna, naya code, check + password (Redis + outbox). `src/login.ts`: password sign-in, authenticator, recovery codes. `src/password.ts`: argon2id + HIBP. `src/lockout.ts`: galat koshishein aur rok. `src/credentials.ts`: secrets aur login ke tareeke. `src/users.ts`: accounts aur consent. `src/sessions.ts`: sessions, refresh rotation, logout. `src/signing-keys.ts`: token keys + JWKS. `src/cookies.ts`: cookies. `src/errors.ts`: error text.

Node 24 TypeScript seedha chalata hai: imports me `.ts` likho, enum ya parameter properties nahi.
