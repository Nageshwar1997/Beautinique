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

`.env.example` ka LOCAL hissa `.env` me copy karo (commit kabhi nahi); OPTIONAL me defaults, PRODUCTION me live ki keys dummy values ke saath. Har key `CORE__` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah `process.env` rokta hai). Nayi setting = `configZod` me key + `.env.example` me line.

## Code kahan hai

- `src/service.ts`: `readConfig` + `start` (split mode me `src/server.ts`, bundle mode me `backend/bundle` isse chalata hai).
- `src/app.ts`: `@beautinique/backend-server-kit` ka `createApp` (health, errors, logs, request id) aur `/ready` ke checks (mongo, redis, outbox, events).
- `src/release.ts`: core ke release steps (migrations aur saare indexes: outbox, consumer, modules), har start pe listen se pehle (`@beautinique/backend-server-release`, ARCHITECTURE §11.1). Nayi migration list ke aakhir me; module ke indexes `src/modules/index.ts` me. `npm run db:release` inhe bina server chalaye chalata hai.
- `src/runtime.ts`: MongoDB se judta hai, release steps chalata hai, phir Redis aur peeche ke kaam: outbox relay, queue worker (`q.core`) schedules ke saath, aur Redis wipe watchdog. Beech me kuch fail ho to pehle khola hua sab band hota hai.
- `src/modules/<module>/`: har business module ka folder (ARCHITECTURE §4): `index.ts` facade, `http`, `application`, `domain`, `infra`, `events`, `jobs`, `permissions.ts`, `settings.ts`.
- `src/modules/index.ts`: har module apna router, apne event subscribers aur subscriptions yahan jodta hai. Ek module doosre ke models import nahi karta, sirf facade se baat karta hai.

## Milestone 1: sample `platform` module

`src/modules/platform/` ek chhota poora namuna hai, naya module isi jaisa bane:

- `POST /platform/pings` (contract `platform.ping.record`): `mountRoute` input check karta hai, ping aur `platform.ping.recorded` event ek hi transaction me likhta hai, jawab commit ke baad (201, `{ data }`).
- `GET /platform/pings/:pingId`: ek ping padhta hai (nahi mila to `NOT_FOUND`).
- Ping ka `_id` ObjectId (route aur event me 24-hex), audit row ka `_id` = event ka ObjectId aur `pingId` ObjectId (owner, 2026-11-12; RULES §4.17).
- Event outbox se relay ke raaste Redis queue me jaata hai, worker `core.pingAudit` subscriber chalata hai jo `platform_ping_audit` me ek row likhta hai; wahi event dobara aaye to inbox ka nishaan use skip kar deta hai.
- **Identity ki copy** (T3.5, ARCHITECTURE §5.2, `src/modules/platform/access.ts`): subscribers `core.roleCopy`, `core.accessCopy`, `core.userCopy` identity ke snapshot events `platform_roles`, `platform_access` (ek account ke grants + `authzVersion`) aur `platform_users` me rakhte hain. Ek hi update me sirf naya snapshot jagah leta hai (role aur account `changedAt` se, grants `authzVersion` se), values `$literal` ke saath (koi `$...` string expression na bane). Scope me document ki id ObjectId, state ka code text (contracts `CODE_SCOPE_TYPES`). T4.1 ka `authorize()` isi copy se padhega. Test `test/access.test.ts`; core ki pehli mutation list `test/mutations.ts` (RULES §6).
- **Platform kernel** (T4.1 PR B, ARCHITECTURE §5.3, §7.3; `src/modules/platform/`, facade `index.ts` se): har route `mountCoreRoute(router, route, handler, deps)` se (server-kit `mountRoute` seedha nahi; `test/kernel.test.ts` ka pehra; `deps` = `{ mongo, passport, logger }`, logger zaroori). Sign-in wale route pe `deps.passport(req)` (gateway ka 60 s passport, bundle keys memory me deta hai; split mode `CORE__PASSPORT_JWKS_URL`). `accessOf(mongo, passport)` core ki copy se caller ke us app ke grants; copy passport ke `authzVersion` se purani ho to 3 baar 500 ms pe dobara, phir 503. `authorize(access, permission, resource)`: permission na ho 403, scope ke bahar 404 (owner, 2026-11-14). `scopeFilter(access, permission, { state: 'stateId', self: 'userId' ... })`: list/queue/export ke liye Mongo filter (global `{}`, state ka code text, baaki ObjectId; permission chal hi na sake to `authorize` wala 403). Permission wala route handler me `authorize` chalata hai, jaise `getPing` (`platform.ping.read`). Idempotent route (`idempotency: true`) pe `platform_idempotency`: Idempotency-Key + route + caller (user, ya public pe client IP, sirf hash), wahi request dobara pe pehla jawab (header `Idempotent-Replayed`), alag request 422, chalte pe 409 (60 s lease ke baad agli koshish le leti hai), 2xx/4xx 48 ghante yaad, 5xx nahi; jawab JSON text ki tarah rakha jaata hai; replay me status aur body hi (route ke apne headers nahi); jawab na bach paaye to error log.
- **Audit log** (T4.1 PR C, ARCHITECTURE §6.5; `src/modules/audit/`, facade `index.ts`): entries apne database `bq_audit` me (`CORE__AUDIT_DB_NAME`; live pe `bq-core` ka sirf insert/find role, TASKS A.4), har UTC din ek hash chain (`seq`, `prevHash`, `hash` = sha256(pichhla hash + entry)); din ka head (`audit_chain_heads`: lambai, aakhri hash) `bq_core` me, do likhne wale usi head pe takrate hain aur transaction dobara chalta hai. Doosra module `writeAudit(audit, session, entry)` apne transaction me; identity ke `identity.audit.recorded` subscriber `core.identityAudit` se (inbox ke transaction me). before/after masked JSON text (contracts `maskForAudit`), 8000 akshar se bada sirf size. TTL 400 din (`at`). Roz ka task `audit.verifyChains` (00:15 UTC) pichhle 7 poore din dobara ginta hai, `audit_chain_checks` me likhta hai, tooti chain pe error log. Routes (Master app, `audit.entry.read`, `authorize`): `GET /audit/entries` (naye pehle, `_id` cursor; filters `from`, `to`, `actorId`, `action`, `resourceType`/`resourceId`, `result`; actor ka email aadha chhupa) aur `GET /audit/days` (max 92 din). Entries ko badalne ya hatane wala koi code nahi (`test/audit.test.ts` ka pehra). Release step `audit-indexes` entries ke indexes audit database me banata hai (sirf banata, kabhi hatata nahi).
- Kaun call kar sakta hai (`access`, `apps`) gateway mote taur pe dekhta hai (Phase 2); idempotency aur `authorize()` platform kernel me (T4.1). Abhi event ka actor `system` hai, kyunki core tak signed-in user nahi pahunchta.

`test/platform.test.ts` poora raasta chalata hai (typed client se POST, event outbox se queue se inbox tak) aur **Redis wipe drill**: worker band, do events queue me, Redis ki queue keys aur `bq:epoch` mita do; watchdog schedulers wapas rakhta hai aur events dobara bhejta hai; worker chalu hone par dono apply hote hain, ek-ek baar. Doosra drill: handled event wipe ke baad dobara aaye to skip hota hai.

Node 24 TypeScript seedha chalata hai: imports me `.ts` likho, enum ya parameter properties nahi.
