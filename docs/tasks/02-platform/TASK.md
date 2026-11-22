# TASK 02: platform (shared aur backend ke saajhe packages)

> **Status:** v1.0.2 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `02-platform`, charan 0 (D-446). Progress: 0 / 31 points.

## 1. Lakshya

Shared aur backend ke saajhe packages, jin pe har backend service tiki hai: contracts, India ke validators, paisa, ghadi, server kit, config, logger, MongoDB, events aur samay wale kaam, encryption, media ke ports aur PostgreSQL. Saath me mutation testing ka tooling, kyunki zyadatar kernel packages yahin hain ([RULES.md](../../RULES.md) RT-21).

## 2. Scope

**Andar:** §3 ke 12 packages, aur mutation testing ka tooling (§3.13).

**Bahar:**

- Frontend ke saajhe packages: `03-frontend-kit`.
- Har service ke apne routes, events, permissions aur collections: apni service ke module me. Yahan sirf unka dhaancha.
- Audit ki hash chain: `05-audit`. Rate limit ki seemaayein aur session ki jaanch: `09-gateway` (counter ka kaam yahan).
- Packages banana aur publish karna: `28-packages` ke CLI se.

## 3. Packages

Har package `packages/<category>/<name>`, naam `@beautinique/<category>-<name>` (D-002), `28-packages` ke `create` se. Har README me "Visibility" ka hissa (D-445): neeche ki table ka "Asal me" column uska saar hai. Publish saare hote hain.

| Package              | Kaam (saar)                                                                   | Asal me | Kyun                                                                      |
| -------------------- | ----------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| `shared-contracts`   | Routes, events, permissions, error codes aur settings ki keys ki definition   | Private | Poora API, permissions aur andar ke events ka naksha                      |
| `shared-validators`  | India ke format aur email, phone                                              | Public  | Aam kaam; kuch Beautinique ka nahi                                        |
| `shared-money`       | Paise, basis points, GST, bantwara aur `en-IN` format                         | Public  | Aam kaam                                                                  |
| `shared-clock`       | Injected ghadi aur IST ki tareekh ka format                                   | Public  | Aam kaam                                                                  |
| `backend-config`     | Har service ka config schema aur env ki jaanch                                | Public  | Aam kaam; keys ke naam services ke apne packages me                       |
| `backend-logger`     | Structured logs aur redaction                                                 | Public  | Aam kaam                                                                  |
| `backend-server-kit` | Route chalana, actor, `authorize`, errors, idempotency, rate limit ka counter | Private | Authorization aur rate limit ka tareeka hamle ka naksha deta hai          |
| `backend-mongo`      | Transaction helper, repositories, release step, retention ki registry         | Public  | Aam kaam                                                                  |
| `backend-events`     | Outbox, inbox, dispatcher, timers, leases aur job queues                      | Public  | Aam kaam                                                                  |
| `backend-crypto`     | Field encryption, blind index, hash aur rok ki band copy                      | Public  | Algorithm khule hain; suraksha keys pe tiki hai, jo kabhi package me nahi |
| `backend-media`      | Media provider aur object storage ke ports aur fakes                          | Public  | Aam kaam                                                                  |
| `backend-postgres`   | Finance ke liye pool, migrations aur transactions                             | Public  | Aam kaam                                                                  |

[ARCHITECTURE.md](../../ARCHITECTURE.md) §12 ki sujhaav wali list me `backend-crypto` naya hai: encryption MongoDB aur PostgreSQL (finance ka tax archive) dono me lagta hai, isliye alag package.

### 3.1 `shared-contracts`

1. Ek route ki definition: method, path (`/api/v1/<service>/<resource>`), input aur output ka zod schema, allowed apps, permission, rate limit ki class, idempotency, step-up, public cache aur maalik service ([ARCHITECTURE.md](../../ARCHITECTURE.md) §5 niyam 1).
2. Event ka envelope aur har event ki definition ([ARCHITECTURE.md](../../ARCHITECTURE.md) §3 niyam 7 se 9), permission ka naam `<service>.<resource>.<action>` (§11 niyam 1), error codes aur settings ki keys.
3. Inhi definitions se route manifest (gateway ke liye), typed client (`03-frontend-kit` ka `frontend-api-client`) aur `openapi.json` bante hain. Bina contract ka route nahi (CR-12).
4. Yahan sirf dhaancha aur saajhe hisse (common error codes, envelope). Har service apni definitions apne module me jodti hai.

### 3.2 `shared-validators`

GSTIN (check digit ke saath), PAN, IFSC, pincode, UPI id, email aur phone (sirf format; phone pe koi message nahi). Zod schemas ke roop me, taaki contracts seedha use karein.

### 3.3 `shared-money`

1. Rakam integer paise, rates basis points; float ya decimal kabhi nahi ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.1 niyam 5).
2. Taxable value, CGST, SGST aur IGST, rounding [ARCHITECTURE.md](../../ARCHITECTURE.md) §1.8 se, aur chhoot ka bantwara bina paisa khoye (§10.1 niyam 6).
3. MongoDB ke BSON `long` ka codec yahan ke type ke saath `backend-mongo` me.
4. Kernel package: property tests, mutation aur 90% branch coverage (RT-21, RT-23).
5. Rakam ka `en-IN` format (₹1,299, ₹1,29,999; invoice, refund aur finance ki screens pe hamesha do decimal), taaki apps, emails aur PDF ek hi helper se chalein (DS-4.5, CR-30).

### 3.4 `shared-clock`

Injected ghadi; business code "abhi" sirf isi se (RULES RT-13). Tests ke liye fake ghadi, aur IST ka din (`istDay`) nikaalna ([ARCHITECTURE.md](../../ARCHITECTURE.md) §4 niyam 5, §10.1 niyam 7). Tareekh aur samay ka `en-IN` format IST me ("21 Nov 2026", "2:30 pm"; DS-4.5), apps, emails aur PDF ke liye.

### 3.5 `backend-config`

1. Har service ka config zod schema se, apne namespace me; har key required, code me koi default nahi (D-441).
2. Environment ke hisaab se apni file (`.env.development` ya `.env.test`); live pe platform ka env.
3. Boot pe kam ya anjaan key ho to process key ke naam ke saath ruke, value ke bina.
4. Payments test mode me hon aur key live wali ho to process na uthe ([OPERATIONS.md](../../OPERATIONS.md) §4 niyam 4).
5. Har config key `.env.example` me ho aur `.env.example` me koi anjaan key na ho: iski jaanch (RT-57) ka helper yahan.

### 3.6 `backend-logger`

pino (D-001, D-339); har log me request id. OTP, password, token, cookie, PAN, bank number aur poora address kabhi nahi: redaction aur uska test (CR-22, SR-077, SR-098).

### 3.7 `backend-server-kit`

1. Contract se Express ka route chalana: input ki jaanch, output ki jaanch, aur bina contract ka route register na hona.
2. Actor ka context aur `authorize(actor, permission, resource)`; scope ke bahar 404, permission na ho to 403 ([ARCHITECTURE.md](../../ARCHITECTURE.md) §11 niyam 4 aur 7).
3. Errors ka ek roop ([ARCHITECTURE.md](../../ARCHITECTURE.md) §5 niyam 8 aur 9).
4. Idempotency: key + route + caller, wahi body pe pehla jawab, alag body pe 422, chal raha ho to 409, 5xx yaad nahi, record 48 ghante (§5 niyam 10, SR-045).
5. Rate limit ka counter Valkey pe; seemaayein aur fail-closed ka faisla gateway me (SR-008).
6. Bundle mode me process ke andar facade call, split mode me signed HTTP; dono me ek hi facade (§2.4 niyam 10, SR-071).

### 3.8 `backend-mongo`

1. Client aur transaction helper: snapshot read, majority write, transient error pe poora kaam dobara, commit anjaana ho to sirf commit dobara, kul misaal 10 second phir 503 ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2 niyam 1 se 3).
2. Repository ka aadhar: `version` ke saath update aur 409, halat ki shart wale update, cursor pagination, `maxTimeMS` (§10.2 niyam 5 aur 6, §10.4 niyam 8).
3. Money codec (BSON `long`).
4. Release step: collections, validators, indexes aur fingerprint, lease ke peeche; schema wala hissa listen se pehle, lambi data migration baad me (§10.4 niyam 1 se 5).
5. Har collection ki retention class ki registry; bina class ya bina delete handler ke collection pe CI fail (§10.3 niyam 1).
6. Har repository query ke `explain` aur collection scan ke pehre ka helper ([OPERATIONS.md](../../OPERATIONS.md) §2 niyam 6).

### 3.9 `backend-events`

1. Outbox usi transaction me; dispatcher nudge aur misaal 5 second ke poll se; bundle mode me handler call, split mode me signed HTTP ([ARCHITECTURE.md](../../ARCHITECTURE.md) §3 niyam 1 se 3).
2. Inbox: `processed_events` usi transaction me, asar theek ek baar (§3 niyam 4).
3. Ek aggregate ke events kram se; ek fail ho to sirf usi aggregate ke agle events rukein (§3 niyam 5, §10.2 niyam 10).
4. Retry backoff ke saath, misaal 8 koshish; phir dead letter aur ops alert; subscriber ka database band ho to ginti nahi badhti (§3 niyam 6, §10.2 niyam 11).
5. Timers, ticker aur leases: har due timer ek hi baar, boot pe sweep, chhoote din kram se (§4 niyam 1, 4 aur 6).
6. BullMQ ki queues: har service ki halki queue aur ek `heavy` queue; job id = record id; Valkey khaali ho to pending kaam dobara queue me (§4 niyam 2 aur 3).
7. Platform collections (`outbox`, `processed_events`, `dead_letters`, `timers`, `leases`) aur unke TTL (§10.2 ki table).

### 3.10 `backend-crypto`

1. Field encryption AES-256-GCM, roop `v1.<keyId>.<iv>.<ciphertext>.<tag>`, associated data `<service>.<collection>.<field>:<recordId>`; key ke id ke saath, aur purane records ka re-encrypt (SR-063, [ARCHITECTURE.md](../../ARCHITECTURE.md) §10.3 niyam 5).
2. Blind index HMAC-SHA256, alag key se (§10.3 niyam 6).
3. Codes, recovery codes aur invite tokens ke hash (§10.3 niyam 7).
4. Rok ki copy ko public key se band karna; live server ke paas sirf public key (§10.3 niyam 4, SR-097).
5. Keys kabhi package me nahi; har service apne config namespace se deti hai.

### 3.11 `backend-media`

Media provider aur object storage ke ports, aur tests ke fakes ([RULES.md](../../RULES.md) §4.2). Provider ka asli adapter media service (`06-media`) me (D-284).

### 3.12 `backend-postgres`

Finance ke liye: pooler se pool (SQL `PREPARE`, `SET` aur session ke locks nahi), numbered SQL migrations (sirf aage, checksum, advisory lock, seedha connection), aur transaction helper (`READ COMMITTED`, `40001` aur `40P01` pe misaal 3 baar dobara, timeouts) ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2 niyam 13, §10.4 niyam 6, §10.6).

### 3.13 Mutation testing ka tooling

1. Tool prastaav ke hisaab se StrykerJS, Vitest runner ke saath ([RULES.md](../../RULES.md) RT-21); pakka karne se pehle review ([OPERATIONS.md](../../OPERATIONS.md) §11 niyam 2).
2. Hamesha asli files ki copy me aur alag containers pe, jahan dev server aur watchers nahi dekhte (CLAUDE.md, [OPERATIONS.md](../../OPERATIONS.md) §1 niyam 5).
3. Badli lines ek chhoti script `git diff` se deti hai; PR pe CI ka alag job (D-372).
4. Kernel packages ka pehla poora run laptop pe background me (RG-4).

## 4. Niyam

1. Har package apne aap me chhota; ek package doosre ke andar ka code import nahi karta, sirf public exports.
2. Business ka "abhi" sirf `shared-clock` se; rakam sirf `shared-money` ke types se.
3. Kernel packages ([RULES.md](../../RULES.md) RT-21): `shared-money`, `backend-server-kit` ka `authorize` aur idempotency, `backend-mongo` ka transaction helper aur release step, `backend-events`, `backend-crypto`, `shared-contracts` ka route manifest, `backend-config` ka schema, aur rate limit ka counter. In pe mutation aur 90% branch coverage (RT-23).
4. Paise, idempotency aur events ke tests pe retry ya quarantine nahi (RT-25).
5. Koi secret ya key kisi package me nahi.

## 5. Data model

Packages khud database nahi banate. Har service ke database me ye platform collections in packages se bante hain: `outbox`, `processed_events`, `dead_letters`, `timers`, `leases`, `idempotency_keys`, `migrations`, `settings`, `counters`, `sealed_records` ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2 ki table). Finance me inke PostgreSQL wale roop `14-finance` me.

## 6. API

HTTP API nahi; har package ki public TypeScript API uske README me. Contracts se bana `openapi.json` services ke routes ka asli spec hai ([tasks/README.md](../README.md)).

## 7. Security

SR-008 (rate limit ka counter), SR-032 aur SR-035 (`authorize` aur scope), SR-045 (idempotency), SR-047 (paisa), SR-063 (field encryption), SR-071 (service ki deewar, facade, signed calls), SR-077 aur SR-098 (logs), SR-097 (rok ki band copy). Keys aur secrets sirf config se, kabhi package ya log me nahi.

## 8. Dependencies

- **Tika hai:** `01-foundation`, `28-packages`.
- **Is pe tike:** `03-frontend-kit` (`shared-contracts`, `shared-validators`, `shared-money`, `shared-clock`), aur saari backend services.
- **Owner ke kaam:** koi nahi.

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.1 `PLATFORM` (`AC-PLATFORM-1` se `AC-PLATFORM-16`; 13 se 16 D-448 se). Har criterion ka kam se kam ek test, naam me criterion ka id ([RULES.md](../../RULES.md) DD-1); `AC-PLATFORM-16` charan 8 me.
- **Manuals aur testing ki files:** kisi app ke role ka feature nahi, isliye laagu nahi.

## 10. Subtasks

Har subtask lagbhag ek PR jitna. Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446): `backend-postgres` charan 8 me, jab finance pehli baar aata hai; baaki charan 0 me. Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                                                   | Charan | Size   | Halat |
| ----- | ----------------------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1  | `shared-clock` aur `shared-validators`                                                    | 0      | M (2)  | Baaki |
| ST-2  | `shared-money`, property tests ke saath                                                   | 0      | L (4)  | Baaki |
| ST-3  | `shared-contracts` ka dhaancha, route manifest, typed client ka aadhar aur `openapi.json` | 0      | L (4)  | Baaki |
| ST-4  | `backend-config` aur `backend-logger`                                                     | 0      | M (2)  | Baaki |
| ST-5  | `backend-server-kit`                                                                      | 0      | L (4)  | Baaki |
| ST-6  | `backend-mongo`                                                                           | 0      | L (4)  | Baaki |
| ST-7  | `backend-events`                                                                          | 0      | L (4)  | Baaki |
| ST-8  | `backend-crypto`                                                                          | 0      | M (2)  | Baaki |
| ST-9  | `backend-media` (ports aur fakes)                                                         | 0      | S (1)  | Baaki |
| ST-10 | Mutation testing ka tooling aur kernel packages ka pehla poora run                        | 0      | M (2)  | Baaki |
| ST-11 | `backend-postgres`                                                                        | 8      | M (2)  | Baaki |
|       | **Kul**                                                                                   |        | **31** |       |

## Change log

| Version          | Date       | Badlav                                                                                                                    |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.2 | 2026-11-22 | Module 02 ka pehla spec, 12 packages, 11 subtasks (D-446) 16 criteria ki link (D-448) aur `en-IN` format; code abhi nahi. |
