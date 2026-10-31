# notify

Email, web push and the in-app inbox. (ARCHITECTURE §3)

Abhi (TASKS T3.1, PR 1) sirf email ka hissa hai: identity ke `identity.otp.requested` event pe sign-in code ka email (OTP fast lane). Web push, in-app inbox, templates aur preferences T5.1 me.

## Commands

| Command                            | Kaam                                                               |
| ---------------------------------- | ------------------------------------------------------------------ |
| `npm run dev --workspace notify`   | Akela (split mode), http://localhost:8083, file badalte hi restart |
| `npm run build --workspace notify` | `dist/` (compiled JS, production isi ko chalata hai)               |
| `npm run start --workspace notify` | `dist/server.js` chalao                                            |
| `npm run test --workspace notify`  | Tests (`npm run infra:up` chahiye: Mongo, Valkey aur Mailpit)      |

Sab deployables ek process me: `npm run dev:backend` (`backend/bundle`).

## Email kaise jaata hai

1. identity code banata hai, uska hash Redis me rakhta hai, aur event `identity.otp.requested` (outbox) me code **sealed** bhejta hai (AES-256-GCM, `OTP_EVENT_KEYS`, context `identity.otp:<challengeId>`). Outbox, Redis ya logs me code kabhi khula nahi (ARCHITECTURE §7.1).
2. identity ka relay event ko queue `q.notify` me subscriber `notify.otpEmail` ke naam se daalta hai.
3. Subscriber (transaction ke andar, sirf DB ka kaam) `notify_deliveries` me email ki row likhta hai (lane `otp`, code ab bhi sealed) aur task `email.sendDue` turant chalwata hai (`startTaskTrigger`).
4. `email.sendDue` (transaction ke bahar) jo due hai wo bhejta hai: pehle OTP, phir transactional, phir baaki. Har row lease ke saath claim hoti hai, code wahin khulta hai, provider ko jaata hai, aur `sent` hone pe (ya `failed`/`expired`) sealed code row se hat jaata hai.
5. Har minute bhi `email.sendDue` chalta hai: retries aur chhoota hua trigger.

**Doosre emails (transactional lane):** `identity.session.reuseDetected` → `notify.securityEmail` ("We signed you out"); `identity.authenticator.reset` → `notify.authenticatorEmail` ("Your Beautinique authenticator was reset": kab, sab jagah sign out, na maanga ho to kya karein); `identity.authenticator.changed` → `notify.authenticatorChangedEmail` (insaan ne khud authenticator lagaya, badla, naye recovery codes liye ya band kiya: kya, kis app/device se, kab IST; na kiya ho to "Forgot password" + support; koi secret nahi); `identity.invitation.created` → `notify.invitationEmail` ("You are invited to <app>": role, accept kaise karein, kab tak; koi secret nahi, invitation ke khatam hone ke baad nahi jaata). App ka link `NOTIFY__APP_URLS` se; us app ka URL na ho to email me sirf app ka naam. Invitation accept karne ka code purpose `invite` ke saath OTP lane me ("Accept your <app> invitation").

**Niyam:**

- **Din ka budget** (Brevo free 300/din): `notify_email_days` me UTC din ki ginti. `NOTIFY__EMAIL_OTHER_LIMIT` (250) ke baad sirf OTP aur transactional; baaki agle UTC din. `NOTIFY__EMAIL_DAILY_LIMIT` (300) pe OTP bhi `failed` (`DAILY_LIMIT`, error log). Brevo ka din kab reset hota hai, docs me nahi mila, isliye UTC.
- **Retry:** network, 5xx, 429, 402, aur 401/403 (galat key, dashboard me theek ho sakti hai) pe 10 s, 30 s, 90 s, 270 s ke baad, max 5 try. 400/422 (message hi galat) pe turant `failed`. Fail hua try din ki ginti se wapas.
- **OTP expire:** code ka waqt khatam (`expiresAt`) to email nahi jaata (`expired`), aur retry tabhi jab wo expiry se pehle ho sake.
- **Logs:** delivery id, lane, attempt, error code aur provider ka message id. Email address, code ya email ka text kabhi nahi (tests isse jaanchte hain).
- Deliveries 400 din rehti hain (delivery log, ARCHITECTURE §6.5), din ki ginti 35 din.

## Settings

`.env.example` ka LOCAL hissa `.env` me copy karo (commit kabhi nahi); OPTIONAL me defaults, PRODUCTION me live ki keys dummy values ke saath. Har key `NOTIFY__` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah `process.env` rokta hai). Nayi setting = `configZod` me key + `.env.example` me line.

| Key                                                       | Laptop                                                       | Live (Render)                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| `NOTIFY__MONGO_URI`, `NOTIFY__REDIS_URL`                  | local Mongo, Valkey                                          | Atlas user `bq-notify`, Render Key Value internal             |
| `NOTIFY__EMAIL_TRANSPORT`                                 | `mailpit`                                                    | `brevo` (koi default nahi)                                    |
| `NOTIFY__BREVO_API_KEY`                                   | khaali                                                       | Brevo API key (secret)                                        |
| `NOTIFY__EMAIL_FROM` / `NOTIFY__EMAIL_FROM_NAME`          | `no-reply@beautinique.example`                               | Brevo me verified sender                                      |
| `NOTIFY__OTP_EVENT_KEYS`                                  | public laptop key (32 zero bytes)                            | nayi random key, `IDENTITY__OTP_EVENT_KEYS` jaisi             |
| `NOTIFY__EMAIL_DAILY_LIMIT` / `NOTIFY__EMAIL_OTHER_LIMIT` | 300 / 250                                                    | 300 / 250                                                     |
| `NOTIFY__APP_URLS` (optional)                             | `customer=http://localhost:3001,admin=http://localhost:3003` | `customer=https://<customer host>`, har app live hone pe jodo |

Laptop pe emails http://localhost:8025 (Mailpit) me dikhti hain, kisi asli inbox me nahi.

## Code kahan hai

- `src/service.ts`: `readConfig` + `start` (split mode me `src/server.ts`, bundle mode me `backend/bundle` isse chalata hai).
- `src/runtime.ts`: Mongo, release steps, Redis, queue worker (`q.notify`), schedules, Redis wipe watchdog; provider settings se (`senderOf`).
- `src/deliveries.ts`: `notify_deliveries`, OTP subscription, `sendDue` (lanes, budget, retry, expiry), indexes.
- `src/email/`: `EmailSender` port, `brevoSender` (HTTPS `POST /v3/smtp/email`), `mailpitSender` (`POST /api/v1/send`), OTP email template.
- `src/release.ts`: release steps (consumer + delivery indexes).
- `src/routes/index.ts`: notify ke routes (abhi koi nahi). Har route contracts me declare hota hai (owner `notify`), yahan sirf handler.

Node 24 TypeScript seedha chalata hai: imports me `.ts` likho, enum ya parameter properties nahi.
