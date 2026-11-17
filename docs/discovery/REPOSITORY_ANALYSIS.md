# REPOSITORY ANALYSIS: Beautinique (BQ)

> **Status:** v0.1 (2026-11-17), **draft**, discovery phase. Principal Architect ka pehla, evidence-based repository analysis. Ye implementation plan nahi hai: sirf samajh, critique aur sawal.
>
> **Existing project sirf reference hai.** Is repo ka code aur docs (approved [PRD.md](../PRD.md) aur [ARCHITECTURE.md](../ARCHITECTURE.md) bhi) yahan apne aap sahi ya final nahi maane gaye. Tech stack, repo structure, tooling aur conventions waise hi rehte hain; stack badalne ki salah sirf wahan hai jahan saaf technical wajah ho.

## 0. Kaise padhein

- **Base:** branch `prerelease` @ `e12ac11` (2026-11-17). Sirf padha aur search kiya; koi test, build, server ya Docker nahi chalaya.
- **Saboot ke nishaan:** **[V]** = code me khud dekha. **[D]** = sirf docs ka daawa, code me jaancha nahi ya code me hai hi nahi. **[NV]** = jaancha nahi.
- **Evaluation ke bahar:** PRD §2 ki 2 frozen rows is document me jaan-boojh ke shamil nahi hain.
- **Jo nahi padha ya adhoora padha [NV]:**
  - Live deployment (Vercel, Render, Atlas) khud nahi dekha; "live hai" docs ka daawa hai.
  - Purane repos (`BQ-Client`, `BQ-Packages`, `BQ-Microservices` ...) repo ke bahar hain, nahi padhe.
  - Docs ki bahut lambi lines kaat ke padhi (TASKS ki ek line 23,511 characters ki hai), isliye kuch detail chhooti ho sakti hai. `QA_AUDIT_REPORT.md` sirf §1, §2, §5, §6; `DESIGN.md` sirf headings; `T4-LOCATION-PLAN.md` sirf headings aur §7.
  - Identity ka andar ka logic line-by-line nahi (structure, exports aur tests ki ginti dekhi). Frontend packages file list aur dependencies se; `scripts/` sirf layout.
  - Koi `.env` file nahi kholi. Security ki gehri jaanch alag Security Architect karega.

## 1. Tech stack (jo sach me use ho raha hai)

| Layer | Kya | Version / saboot |
| --- | --- | --- |
| Runtime | Node.js, ESM only; backend Node ki type stripping se (tsx nahi), production me `tsdown` ka `dist/` | Node `>=24`, npm `12.2.0` (`package.json:53-68`) [V] |
| Language | TypeScript strict | `~6.0.3` pinned (typescript-eslint ki wajah se hold) (`package.json:106`) [V] |
| Backend framework | Express | `^5.3.0`; helmet `^8.3.0`, pino `^10.4.0` [V] |
| Database | MongoDB, native driver (Mongoose nahi), sirf `@beautinique/backend-server-mongo` ke raaste | driver `^7.8.0`; local `mongo:8.0.34` replica set (`infra/docker-compose.yml:20`); live Atlas M0 [D] |
| Cache / queue | Redis-compatible Valkey + BullMQ + ioredis | bullmq `^6.4.0`, ioredis `^6.0.0`; local `valkey/valkey:8.1.10` 25 MB `noeviction` (`infra/docker-compose.yml:73-85`) [V]; live Render Key Value free [D] |
| Validation | zod, sirf `@beautinique/shared-zod` se, named imports | zod `^4.6.7` [V] |
| HTTP client | axios (frontend + backend); `fetch` ESLint se band | `^1.21.0` (`configs/eslint-config.js:163`) [V] |
| Auth primitives | Node `crypto` hi: argon2id, ES256 JWT, AES-256-GCM, TOTP | `backend/identity/src/password.ts:1-27`, `packages/backend/server-crypto/src/jwt.ts:91` [V] |
| Frontend | React 19, React Router 8 (customer: framework mode SSR + prerender; baaki: SPA data router), TanStack Query 5, react-hook-form 7, react-aria-components | react `^19.3.1`, react-router `^8.5.0` (`frontend/customer/react-router.config.ts:5-7`) [V] |
| Build / styling | Vite 8, Tailwind CSS 4, tsdown (packages), vite-plugin-pwa (delivery) | vite `^8.3.5`, tailwindcss `^4.3.3` [V] |
| State | Server state TanStack Query; alag client store package nahi (docs ka `stores` package repo me nahi) | [V] |
| Testing | Vitest 5, Testing Library, Playwright + axe (customer, admin, master), apna mutation runner | `scripts/mutation/`, har kernel package me `test/mutations.ts` [V] |
| Lint / format | ESLint 10 flat config factory + 2 custom rules + dependency-cruiser, Prettier 3 | `configs/eslint-config.js`, `configs/eslint-rules/`, `backend/core/.dependency-cruiser.json` [V] |
| Monorepo | npm workspaces (`packages/*/*`, `frontend/*`, `backend/*`); Turborepo sirf CI ka build cache | `package.json:16-20`, `turbo.json` (sirf `build` task) [V] |
| CI/CD | GitHub Actions: `ci.yml` (parallel jobs, aakhri `check`), `release.yml` (npm publish, haath se), `wake.yml` (hourly wake) | `.github/workflows/` [V] |
| Hosting | Vercel Hobby (11 projects), Render free web service (1, Singapore), Atlas M0, Render Key Value free, Brevo free, Sentry free; koi domain nahi | ARCHITECTURE §11 [D]; `frontend/customer/vercel.json`, `scripts/render/start.sh` [V] |
| Observability | Sentry (`@sentry/node` 11, `@sentry/browser` 11), pino JSON stdout | `packages/backend/server-kit/package.json:59` [V] |

**Stack me jo docs me hai par repo me nahi [V]:** Razorpay, Cloudinary, web-push, pdfkit, Bull Board, Ola Maps SDK, koi Dockerfile, `render.yaml`. Kisi `package.json` me inki dependency nahi mili.

## 2. Repo structure aur conventions

| Cheez | Kaise | Saboot |
| --- | --- | --- |
| Workspaces | `packages/<shared\|frontend\|backend>/<name>` → `@beautinique/<category>-<name>` (21 packages); `frontend/<app>` (11) aur `backend/<name>` (5) private workspaces | `package.json:16-20` [V] |
| Generators | `npm run create` package, frontend app (SPA / SSR / PWA) ya backend deployable banata hai; bundle ki list generator likhta hai | `scripts/packages/bin/create.ts`, `backend/bundle/src/deployables.ts:1` [V] |
| Contracts-first | Route, event aur permission pehle `shared-contracts` me; usse `generated/openapi.json`, `gateway-manifest.json`, `events.json`, `permissions.json` (commit hoti hain) | `packages/shared/contracts/src/routes.ts:122`, `events.ts:66`, `permissions.ts:24` [V] |
| Module boundaries | Core ka module doosre module ka sirf `index.ts`; Core doosre deployable ka code import nahi karta | `backend/core/.dependency-cruiser.json`, fixture test `backend/core/test/boundaries.test.ts` [V] |
| Import ki rok | Seedha `zod`, `mongodb`, `fetch`, `process.env` (config ke bahar), `.watch(` (relay ke bahar) band | `configs/eslint-config.js:61-62,115-127,152,163` [V] |
| Custom lint | Geo literals aur role-name comparison band | `configs/eslint-rules/no-hardcoded-geo.js`, `no-role-comparison.js` [V] |
| Ids | Har `_id` aur reference ObjectId; naam alag unique field me; API me 24-hex | `packages/backend/server-mongo/src/ids.ts`, pehra `scripts/e2e/object-ids.ts` [V] |
| Paisa | Integer paise, GST basis points | `packages/shared/utils/src/money.ts:87,133` [V] |
| Env | Har deployable ka zod config (`<NAME>__*`) aur `.env.example`; test dono ko milata hai | `backend/*/src/config.ts` [V] |
| Git flow | `prerelease` (dev) → `release` (production) → `main` (final); back-merge `release` → `prerelease`; CI branch flow jaanchta hai | RULES §2 [D], `scripts/ci/bin/branch-flow.ts` [V] |
| CI ka dhaancha | `guard`, `static`, `test-scripts`, `test-backend`, `test-frontend`, `e2e` (matrix), `verify`, `check`; same-tree skip aur affected-only | `.github/workflows/ci.yml:38-485`, `scripts/ci/bin/plan.ts` [V] |
| Docs | Hinglish, top pe status, neeche change log; har faisla doc + change log | RULES §8 [V] |
| Packages publish | Apna CLI (`publish`, `republish`, `verify`, fake registry wale tests); packages public par abhi publish nahi | `scripts/packages/`, MEMORY 2026-10-21 [D] |

## 3. Kya sach me bana hai, kya sirf plan hai

**Ek line me:** neev (tooling, kernel packages, gateway, identity, RBAC engine, audit) gehri aur achhi bani hai; **commerce ka ek bhi feature nahi bana**. Contracts me 44 routes hain: 38 identity ke, 6 core ke (ping, wake, audit); 10 permissions; 11 events (`packages/shared/contracts/generated/*.json`) [V]. TASKS §P ka 24% hafton ke wazan se hai; Phase 7 se 10 (commerce, WMS, logistics, finance, support, UGC, growth, creators, governance) 0% pe hain [D].

| Area | Halat | Saboot / note |
| --- | --- | --- |
| Monorepo tooling, generators, package CLI, mutation runner | **built** | `scripts/packages/`, `scripts/mutation/`, `scripts/ci/` [V] |
| CI/CD, secret scan, branch flow check | **built** | `.github/workflows/ci.yml` [V] |
| Local infra (Mongo rs, Valkey, Mailpit) | **built** | `infra/docker-compose.yml:20,73,106` [V] |
| Split mode (har service ka container), Dockerfiles, `render.yaml` | **planned-only** | Repo me koi Dockerfile nahi [V]; TASKS T5.4, T6.7, T11.6 [D] |
| Gateway | **built** (T2.3 `[~]`) | Origin secret `backend/gateway/src/trust.ts:15`, app registry `apps.ts:26`, manifest se routing + passport `proxy.ts:283-431`, rate limits `rate-limits.ts:20`, session gate `sessions.ts:77`, `/status` `status.ts:61` [V] |
| Identity / auth | **built** | 8,589 src lines, 14 test files. Password (argon2id), email code (sign-up, forgot), TOTP + recovery, Google / LinkedIn / GitHub OAuth, sessions + refresh rotation, JWKS, lockout, HIBP, My Devices (`backend/identity/src/sessions.ts:331`, `oauth.ts`, `lockout.ts`) [V] |
| Identity ke bache hisse | **planned-only** | API clients (T3.4), delivery ka device binding, DPDP export / erasure [D] |
| RBAC engine | **built** | `packages/shared/authz/src/matcher.ts:112`, `delegation.ts:41`, `separation.ts:22`; grants, invitations, Master ke sub-roles `backend/identity/src/rbac/` [V] |
| RBAC catalogue | **partial (khokhla)** | ~80 roles seed hain par lagbhag sabke paas sirf `iam.app.sign_in`; poore system me 10 permission keys (`backend/identity/src/rbac/roles.ts:16-80`) [V] |
| Notify | **partial** | Sirf email: Brevo / Mailpit, lanes, din ka budget (`backend/notify/src/config.ts:47-49`, `deliveries.ts`) [V]. Web push, in-app inbox, preferences, consent, order templates nahi |
| Payments (`bq-payments`) | **planned-only** | `backend/payments` hai hi nahi; naam sirf `DEPLOYABLES` me (`packages/shared/contracts/src/platform.ts:18`) [V] |
| Core: platform kernel | **partial** | `authorize` / `scopeFilter` (`backend/core/src/modules/platform/authz.ts:99,124`), idempotency (`idempotency.ts:99`), CSV download, identity ki read model (`access.ts:93`) [V]. Area-settings resolver baaki (T4.1 PR E) |
| Core: audit | **built** | Hash chain `backend/core/src/modules/audit/store.ts:238`, verify task `verify.ts:63`, routes + CSV `routes.ts:232` [V] |
| Core: baaki ~21 business modules | **planned-only** | `backend/core/src/modules/` me sirf `audit` aur `platform` [V]. Location + network ka 2,173-line plan doc hai, code nahi |
| Events / outbox | **built** | `writeEvent` `packages/backend/server-queue/src/outbox.ts:72`, relay `relay.ts:128`, consumer + inbox dedupe `consumer.ts:168`, wipe recovery `recovery.ts:79,194` [V] |
| Transactions | **built** | `withTransaction` `packages/backend/server-mongo/src/transaction.ts:165` [V] |
| Storage / media | **partial** | `StoragePort`, lifecycle aur in-memory adapter (`packages/backend/server-storage/src/`) [V]. Cloudinary adapter, asset registry, media module nahi |
| Rate limiting | **built** | GCRA, ek Lua call (`packages/backend/server-ratelimit/src/index.ts:108`) [V] |
| Crypto, release steps | **built** | `server-crypto` (fields, jwt, totp), `server-release` (migrations, lease, fingerprint) [V] |
| Search, catalog, cart, orders, inventory, finance, support | **planned-only** | Koi code nahi [V] |
| Frontend packages | **built:** styles, icons, components (20 files), hooks, forms, api-client, app-shell, auth-ui, authz, data-table. **Repo me nahi:** review-screens, maps, pwa-kit, stores, quill, tryon, tryon-assets, test-utils, config-vite | `packages/frontend/` [V]; ARCHITECTURE §9.2 inhe list karta hai [D] |
| App: customer | **partial** | Landing "Launching soon" (`frontend/customer/app/routes/home.tsx:76`), auth, account (security, devices), dummy `/terms` `/privacy`. Catalog, cart, checkout kuch nahi [V] |
| App: admin | **partial** | Sign-in, 23-line dashboard, account (`frontend/admin/src/pages/dashboard.tsx`) [V] |
| App: master | **partial** | Staff (people, roles, invitations) aur audit log (`frontend/master/src/nav.ts:9-12`) [V] |
| Apps: seller, superadmin, support, finance, logistics, delivery, growth, creator | **shell** | Dependencies sirf styles + react + react-router; home "Coming soon" (`frontend/seller/src/pages/home.tsx:8`). Delivery me sirf PWA plugin config (`frontend/delivery/vite.config.ts:14-20`) [V] |
| Observability | **partial** | Sentry, `/health`, `/ready`, `/status` [V]. `ops.snapshot`, log archive, alerts, System health page code me nahi mile [NV: sirf grep se dhoondha] |
| Virtual try-on | **planned-only** | PRD §1 ka mukhya feature; is repo me koi code ya design nahi [V] |

## 4. Existing architecture, short me

- **Deployables:** gateway (akela public darwaza, koi DB nahi), identity, notify, core. Payments sirf design me. Production me sab **ek hi Node process** me: `backend/bundle` internal deployables ko `127.0.0.1` ke khaali ports pe chalata hai aur gateway unhe HTTP se route karta hai (`backend/bundle/src/bundle.ts:24-45`, `deployables.ts:10`) [V].
- **Sync:** browser → Vercel `routes` rewrite (`x-origin-secret` ke saath, `frontend/customer/vercel.json:6-20`) → gateway → owner deployable. Gateway user ka access token jaanchta hai aur upstream ko 60 s ka **passport** JWT deta hai; key har boot pe nayi banti hai, env me nahi (`backend/gateway/src/proxy.ts:415`, `packages/backend/server-kit/src/tokens.ts:165,199`) [V].
- **Async:** transactional outbox (MongoDB) → relay (live pe 1 s poll, lease ke peeche; `relay.ts:137`) → BullMQ → consumer jo effect aur `processed_events` ek transaction me likhta hai. Dead letters MongoDB me. Redis kabhi source of truth nahi; wipe pe `bq:epoch` watchdog outbox dobara chalata hai [V].
- **Database ownership:** ek Atlas cluster; har deployable ka apna database aur DB user (`bq_identity`, `bq_notify`, `bq_core`, `bq_audit`); Core ke andar module-prefixed collections [D for Atlas users; V for alag config].
- **Auth aur session:** email + password; access JWT ES256 10 min; refresh token rotate hota hai, family reuse = chori (session band); har app ki apni HttpOnly cookies, same-origin (Vercel rewrite); logout / freeze Redis mark se turant (`backend/gateway/src/sessions.ts:77`) [V].
- **RBAC:** permission keys code me (`<module>.<resource>.<action>`), roles data, grants `{user, role, scope{type, ids}, validity}`; 11 scope types, containment global ⊇ state ⊇ district ⊇ city ⊇ hub. Core apni identity ki copy (events se) se faisla leta hai; copy purani ho to 3 baar dobara, phir 503 (`backend/core/src/modules/platform/authz.ts:62-90`) [V].
- **Multi-app model:** 11 apps data hain (`platform.ts:2`); har request `X-BQ-App` deti hai; sign-in sirf us app me jahan active grant ho; har app alag Vercel project [V / D].
- **Deployment topology [D]:** Vercel Hobby `*.vercel.app` × 11 → Render free `bq-live` (Singapore, 512 MB, 0.1 CPU, 15 min me so jaata hai, cold start 42 se 57 s) → Atlas M0 (512 MB, 100 ops/s) + Render Key Value (25 MB, persistence nahi). Staging nahi; previews band; "prerelease" environment = developer ka laptop.
- **Release steps:** migrations aur indexes boot pe, lease aur fingerprint ke saath (`packages/backend/server-release/src/release.ts:211`) [V].
- **Observability:** Sentry + pino stdout; alerts, log archive aur dashboards plan me [D].

## 5. Reference ke laayak (reuse-worthy patterns)

| # | Pattern | Kyun achha hai | Kahan |
| --- | --- | --- | --- |
| 1 | Contracts-first routes | Ek declaration se validation, OpenAPI, gateway manifest, typed client aur query keys; drift test pakadta hai | `shared-contracts/src/routes.ts:122`, `server-kit/src/route.ts:35` |
| 2 | `withTransaction` + sequential-only lint | Commit ke baad hi reply; `Promise.all` transaction me band; asli replica set pe tests | `server-mongo/src/transaction.ts:165` |
| 3 | Outbox + inbox dedupe + Mongo DLQ + wipe recovery | At-least-once delivery, effectively-once effect; Redis ka data mitne pe bhi event nahi khota | `server-queue/src/outbox.ts:72`, `recovery.ts:194` |
| 4 | Authz pure functions | `decide`, `scopeSpec`, `scopeWithin`, `checkSeparation` bina I/O ke, mutation-tested; scope ke bahar 404, permission na ho to 403 | `shared-authz/src/`, `core/.../authz.ts:99` |
| 5 | Session model | Chhota access token, refresh family reuse detection, host-only HttpOnly cookies, browser storage me user nahi | `identity/src/sessions.ts`, `frontend/api-client/src/client.ts:120` |
| 6 | Hash-chained audit | Append-only, roz chain verify, refusals bhi audit me; DB role se update / delete band (role wala hissa [D]) | `core/src/modules/audit/store.ts:238`, `verify.ts:63` |
| 7 | Idempotency middleware | Key + route + caller, wahi body pe replay, alag body pe 422, chalte hue pe 409 | `core/.../idempotency.ts:99` |
| 8 | Architecture ke pehre lint me | Module facade, geo literal, role comparison, import ki rok: boundary insaan ki yaad pe nahi | `configs/eslint-config.js`, `.dependency-cruiser.json` |
| 9 | Ports + fake adapters | Email port (Brevo / Mailpit), `StoragePort` (memory), fake OAuth: real keys ke bina tests | `notify/src/email/port.ts`, `server-storage/src/memory.ts` |
| 10 | Boot-time release steps | Lease, fingerprint, expand / contract; pre-deploy command ke bina bhi surakshit | `server-release/src/release.ts:211` |
| 11 | India helpers | GSTIN check digit, PAN, IFSC, PIN, UPI zod; paise / basis-point math, `allocate` | `shared-zod/src/india.ts:38-80`, `shared-utils/src/money.ts` |
| 12 | Test discipline | Mutation lists, collection-scan profiler pehra, ObjectId pehra, axe ke saath E2E 3 widths pe | `scripts/e2e/collection-scans.ts`, `object-ids.ts` |
| 13 | Fail-closed defaults | Route `public` na ho to 401; auth routes pe rate limiter fail-closed | `gateway/src/rate-limits.ts:39` |
| 14 | Design system ki neev | Tokens contrast checks ke saath, react-aria-components pe components, apne icons | `packages/frontend/styles`, `components` |
| 15 | PRD §7.1 ka legal matrix | India ke e-commerce + cosmetics kanoon ki checklist ek jagah (lawyer se verify zaroori) | [PRD.md](../PRD.md) §7.1 [D] |

## 6. Sawal uthane laayak (critical review)

Har item: **Problem**, **kyun kaafi nahi**, **vikalp**, **salah**, **trade-off**.

### Q1. "Sab kuch launch pe": scope aur capacity ka mel nahi

- **Problem:** 11 apps, 79 roles, ~23 Core modules, sab pehle din (PRD §2, RULES §1.2). 30 din aur 527 commits ke baad koi product list, cart ya order nahi ho sakta; saare 44 routes auth aur platform ke hain [V].
- **Kyun kaafi nahi:** ARCHITECTURE §16 khud 33 se 42 hafte (solo + AI) maanta hai aur "har phase ek internal milestone" kehta hai. Neev ki gehrai badh rahi hai: sirf location + network ke liye 2,173-line plan aur 14 PR, ek bhi product se pehle. Is raaste pe pehla end-to-end order mahino door hai, aur tab tak koi business assumption parkha nahi jaata.
- **Vikalp:** (a) vertical slice pehle (catalog → cart → order → payment → dispatch, 3 se 4 apps); (b) release tiers (MVP, R2, R3) jahan roles data hone se baad me judte hain; (c) jaisa hai.
- **Salah:** "saare roles aur apps launch pe" **reopen** ho. MVP ki paribhasha discovery ka pehla output ho.
- **Trade-off:** owner ka dar ("baad me bhool sakte hain") backlog se sambhalta hai, scope se nahi. Tiering me kuch rework ka jokhim rehta hai.

### Q2. 11 alag frontend apps

- **Problem:** 8 apps ek jaise khaali shells hain [V]. Har app = alag Vercel project, `vercel.json`, manifest, icons, cookies, audience, E2E setup, Ola Maps key (ek account me 3 domains, isliye 4 accounts [D]).
- **Kyun kaafi nahi:** Hobby ki 100 deploys/din limit ki wajah se previews pehle hi band karne pade (ARCHITECTURE §11.4). RBAC already permission-filtered nav aur `<Can>` deta hai (`packages/frontend/authz/src/react.tsx:45`), yaani internal roles ko alag app ki technical zaroorat kamzor hai. Ek insaan jo shuru me kai roles sambhalega use 5 se 6 apps me alag-alag sign-in karna padega.
- **Vikalp:** (a) 4 apps: customer (SSR), partner (seller + creator), ops console (admin, superadmin, support, finance, logistics, growth permission-wise sections me, lazy routes), delivery PWA; Master alag rakhna ho to 5. (b) 11 hi, par sirf zaroorat ke hisaab se bante jaayein.
- **Salah:** **reopen**. Identity me "app" data hi rahe; internal apps consolidate karna default mana jaye.
- **Trade-off:** alag app = chhota bundle, alag session policy, kam blast radius, role ke hisaab se saaf URL. Consolidation = kam ops, ek deploy, par console bada aur route guards pe zyada bharosa.

### Q3. "Microservices" jo production me ek hi process hain

- **Problem:** Identity, Payments, Notify ko alag karne ki wajah "security keys, paisa, secrets" di gayi (ARCHITECTURE §2.1). Par production = bundle mode: ek process, ek heap, ek cluster, ek Redis (`backend/bundle/src/bundle.ts:24`) [V]. Asli isolation sirf alag DB user aur env keys hatana hai.
- **Kyun kaafi nahi:** distribution ki poori keemat abhi di ja rahi hai, faayda nahi mil raha: har request pe localhost HTTP hop + ES256 passport sign / verify (0.1 CPU pe), roles / grants ki copy events se aur uska `authzVersion` retry → 503 raasta (`authz.ts:62-90`), ek account pe max 50 grants sirf isliye ki snapshot 16 KB event me aaye (`server-queue/src/outbox.ts:21`, `identity/src/rbac/grants.ts:224`), deploy overlap ke bugs (LIVE-006), catch-up sweeps. Split mode (Docker) bana hi nahi [V].
- **Vikalp:** (a) modular monolith: identity, notify, payments module ki tarah, wahi facade + outbox + alag DB discipline, physical split tab jab paid infra ho; (b) jo bana hai rakho, par naya process (payments) tab tak nahi jab tak asli isolation na mile; (c) asli split paid tier pe.
- **Salah:** bani hui identity aur notify **rakho** (kaam karta code hai). Payments ko alag process banane ka faisla **reopen**. Agar wajah "microservices seekhna" hai (MEMORY 2026-10-19) to wahi likho, security nahi.
- **Trade-off:** monolith me secrets ka blast radius ek rehta hai (jo aaj bhi hai); split ka raasta contracts ki wajah se khula rehta hai.

### Q4. ₹0 hosting vs "production-grade"

- **Problem:** dono ek saath sach nahi ho sakte. Docs ke hi numbers [D]: service 15 min me soti hai, cold start 42 se 57 s, raat me timers ~13 ghante late, Redis 25 MB bina persistence, Atlas me backup nahi (hafte ka manual dump), 300 emails/din, domain nahi (email spam me), staging nahi.
- **Kyun kaafi nahi:** ek order kam se kam 3 se 5 emails banata hai, to 300/din ≈ 60 se 100 orders/din ki chhat, sign-up codes ke saath saajhi. Reservation 15 min me expire honi hai par soya server sweep nahi chalata. Payment webhook sote server pe aaye to provider ke retry pe nirbhar [NV: provider ke timeouts nahi jaanche]. Aur sabse badi baat: code ka bada hissa free tier ko sambhalne ke liye hai (wipe watchdog, wake screens, poll relay, ek queue per deployable, connection budget). Ye achhi engineering hai, par accidental complexity hai jo business value nahi deti.
- **Vikalp:** (a) ₹0 rakho aur saaf likho ki "production-grade" ka matlab code quality hai, operations nahi; (b) chhota budget (ARCHITECTURE §11.6 ka andaza ~$72 se 79/mahina) + domain; (c) beech ka: sirf domain + paid Redis ya DB.
- **Salah:** **reopen**, owner ka budget faisla. Kam se kam domain (sasta, email deliverability, canonical URL, cookies saaf).
- **Trade-off:** paisa vs complexity aur asli demo ki quality.

### Q5. MongoDB pe orders, inventory, payments aur ledger

- **Problem:** double-entry journal, gapless GST invoice counter, stock reservation aur coupon budget sab multi-document transactions pe (ARCHITECTURE §6.2 se §6.4) [D]. Kuch bana nahi, isliye ye design abhi tak parkha nahi gaya.
- **Kyun kaafi nahi:** (1) hot documents: har GSTIN ka gapless counter, sale me hot SKU ka balance, coupon budget; write conflict pe poora transaction abort hoke retry hota hai, yaani packing aur checkout serialise ho sakte hain. (2) Foreign key aur constraints nahi: ledger ki integrity code + raat ki verify pe. (3) Finance reports (GST registers, TCS / TDS, settlement, reconciliation) relational aggregation hain; M0 pe `allowDiskUse` nahi aur sort 32 MB tak. (4) 100 ops/s ki chhat: ek checkout ~10 se 20 ops le to kuch hi checkouts/second.
- **Vikalp:** (a) MongoDB hi (stack frozen), par invariants ki list saaf: kaunsa unique index se, kaunsa conditional update se, kaunsa sirf code se; hot counters ke contention tests; reports pre-aggregated read models se. (b) Sirf finance / ledger ke liye relational store. (c) Finance ka scope chhota karna.
- **Salah:** stack badalne ki salah **nahi**. Par ye discovery ka khula design sawal rahe: agar finance ka poora scope (settlement, TCS / TDS, GST registers) rehta hai, to ledger ke liye relational store ka case mazboot hai aur ise Data / Finance expert jaanche. Existing `withTransaction` aur audit ka "DB role se immutability" pattern ledger pe reuse ho.
- **Trade-off:** ek DB = kam ops aur ek transaction; relational = mazboot integrity aur reporting, par do stores aur cross-store consistency.

### Q6. Sirf apna warehouse + sirf apni delivery fleet + pehle din poora Pune district (21 hubs)

- **Problem:** ye sabse bhaari operating model hai: WMS, line-haul, hub ops, rider onboarding, gig-worker compliance, 2 apps aur roadmap ke sabse bade phases (Phase 8: 5.5 hafte, Phase 9 ka bada hissa).
- **Kyun kaafi nahi:** third-party courier out of scope hai (PRD §8), to rider kam pade to koi fallback nahi, aur served district ke bahar order nahi (PRD §11 khud maanta hai ki demand wapas jayegi). Har seller ko warehouse wale state ka GST registration chahiye, jo onboarding ki badi rukawat hai (PRD §11).
- **Vikalp:** (a) `CarrierPort`: apni fleet ek adapter, 3PL courier doosra; (b) seller-fulfilled bhi; (c) launch ek shehar aur kuch hubs se, district baad me (hubs data hain).
- **Salah:** **reopen**. Logistics ko port ke peeche design karo taaki model baad me bina rewrite badle.
- **Trade-off:** apna stock aur fleet = batch, expiry aur asli maal pe control (bataayi gayi wajah); badle me scope aur asli duniya me capex.

### Q7. 79 roles ka seed, permissions ke bina

- **Problem:** roles ship ho chuke par lagbhag khaali hain (10 permission keys) [V]. Modules aane pe har role dobara banega.
- **Kyun kaafi nahi:** role catalogue PRD ke org chart se bana hai, asli permissions se nahi; ye speculative design hai. "Roles data hain" kaha gaya par seed code me hai aur har start pe sync hota hai (`backend/identity/src/rbac/roles.ts`).
- **Vikalp:** MVP ke liye ~12 se 15 roles; baaki module ke saath.
- **Salah:** RBAC engine **rakho** (mazboot); catalogue ka size aur timing **reopen**. 50-grant cap ko business niyam nahi, technical seema ki tarah dobara dekho.
- **Trade-off:** kam roles se shuru me scope mote honge.

### Q8. Faislon ki process: bahut tez "approved", koi khula sawal nahi

- **Problem:** PRD v0.1 se v1.0 "approved" ek hi din me (2026-10-18). PRD §10: "Abhi koi open question nahi hai". ARCHITECTURE 30 din me v1.104 pe hai aur ab bhi "draft". Decision log me baar-baar "owner ne Claude ki salah maani"; location plan ki saari 49 salah maani gayi [D].
- **Kyun kaafi nahi:** PRD me personas, competitor / market, unit economics, success metrics aur MVP nahi hain. Is size ke product me zero open question asambhav hai; matlab sawal poochhe hi nahi gaye. Ek hi awaaz (AI) ke sujhav bina doosri raay ke maane gaye.
- **Salah:** discovery me har bada faisla assumption ki tarah likha jaye, uske vikalp aur "kis saboot se badlega" ke saath.

### Q9. Docs ka bojh aur docs vs code ka farak

- **Problem:** `docs/` ≈ 1.85 MB; commits me sabse zyada type `docs` (527 me 144) [V]. HANDOFF §3 ka heading ab bhi "(2026-10-20)" hai. QA audit ne pakda ki docs aise CI checks ka daawa karte the jo the hi nahi (QA-DOC-001, QA-GW-002) [D].
- **Aaj ke farak [V]:**
  - PRD §3.2 / §5.0 / §5.9: customer aur delivery partner email code se login. ARCHITECTURE §7.1 (2026-10-27): saare 11 apps email + password, email code se sign-in hata. PRD update nahi hua.
  - PRD §4: 4 apps "Hai". Is repo me seller khaali shell hai; purana code import nahi hua.
  - ARCHITECTURE §0: repo me `data/` folder; hai nahi. §2.8: Turborepo "sirf badle hue hisson ka build"; asal me sirf CI cache.
  - ARCHITECTURE §6.1: CI me `collections-budget` check; code me nahi mila.
  - ARCHITECTURE §0, §12: laptop pe Docker split mode; koi Dockerfile nahi.
  - Decision log aur CLAUDE.md "2 developers" kehte hain; git authorship me ek hi insaan ke do naam dikhte hain, doosre developer ka alag authorship nahi mila.
- **Salah:** redesign me chhote docs + ADRs; ek fact ek jagah; "built" ka daawa sirf code link ke saath.

### Q10. Guest cart nahi (cart / wishlist ke liye sign-in zaroori)

- **Problem:** ARCHITECTURE §9.2: "Add to cart" seedha `/sign-in` pe bhejta hai, kyunki user data browser storage me nahi (RULES §5.9).
- **Kyun kaafi nahi:** e-commerce me ye conversion ka seedha nuksaan hai. Niyam ka maqsad (browser storage me data nahi) server-side anonymous cart (HttpOnly cookie) se bhi poora hota hai.
- **Salah:** **reopen**.

### Q11. Customer login: sirf password (min 12) + social

- **Problem:** email code se sign-in hata diya gaya (2026-10-27) jabki PRD ab bhi wahi kehta hai. Consumer storefront ke liye lamba password friction hai.
- **Salah:** **re-confirm**: customer ke liye email code se sign-in wapas chahiye ya nahi; PRD aur ARCHITECTURE ek hon.

### Q12. Expansion engine aur poore India ka location master, pehle product se pehle

- **Problem:** "no hard-coded geo" niyam sasta aur sahi hai (lint ban chuka). Par uske upar: poore India ka LGD + India Post import, area-settings ki 4-level resolver, go-live checklist engine (predicates, templates, "force live kisi ke paas nahi").
- **Kyun kaafi nahi:** ek dummy network (1 warehouse, 21 hubs) ke liye ye sab pehle banana opportunity cost hai; serviceability ka MVP ek pincode → hub table hai.
- **Salah:** principle **rakho**, gehrai aur order **re-confirm**.

### Q13. Chhote par thos points

- Customer ke `Permissions-Policy` me `camera=()` aur `geolocation=()` (`frontend/customer/vercel.json`); try-on ko camera chahiye, address pin ko location. Aaj theek, par feature ke saath badalna hoga [V].
- Teleconsultation (Skin & Hair Expert), gift cards aur store credit PRD me hain, par §7.1 ke legal matrix me inki koi row nahi [D]; kaunsa kanoon lagta hai [NV].
- Package publish CLI (fake registry, 75 tests [D]) un packages ke liye hai jo publish hi nahi hote: nivesh vs upyog **re-confirm**.
- Teen long-lived branches + back-merge, 1 se 2 logon ki team ke liye bhaari; har release pe ~12 cancelled Render deploys (HANDOFF §6) [D].

## 7. Gaps: cosmetics e-commerce ecosystem ke liye jo kam hai

Coverage: **nahi** = docs me bhi nahi; **ek line** = sirf module list me naam; **flow** = steps likhe hain par data model nahi. Code har row me **nahi hai**.

| Area | Docs coverage | Jo kam hai (domain expert ke liye) |
| --- | --- | --- |
| Catalog model | ek line (ARCH §4 catalog) | Product / variant / shade / size ka model, bundles aur kits, GTIN, HSN + GST rate per product, category-wise attributes, skin type / concern taxonomy, claims, hazmat flags (aerosol, perfume, nail polish) |
| Ingredients (INCI) | ek line | Ingredient master, allergens, "free-from" filters ka data source, kaun bharta hai (brand ya platform) |
| Batch / expiry | flow (FEFO, near-expiry) | Batch-wise MRP (ek SKU ke alag batches ka alag MRP), customer ko kaunsi expiry dikhe, inbound pe minimum shelf life, PAO, batch se customer tak recall trace |
| Pricing | flow (§6.8) | Tax-inclusive price aur HSN rate ka itihaas, price scheduling, bundle pricing, MRP badalne ka flow |
| Promotions | ek line | Rule engine (BOGO, tiered, cart rules), stacking, funding split ka hisaab, abuse limits |
| Cart / checkout | flow (§15.1) | Guest cart, multi-seller cart ka split, split tender (store credit + gift card + online), delivery slots |
| Orders | flow (ek state machine) | Item-level states, partial cancel / shipment / return, sub-orders per supplier, exchange, order edit |
| Payments / refunds | flow, service bani nahi | Refund source vs store credit, split-tender refund, retry UX, disputes, seller linked-account onboarding |
| Settlement / ledger | flow (§6.3) | Chart of accounts, settlement cycle, reserve / hold, reconciliation ke rules, period close |
| Returns | ek line + reasons | Cosmetics ka hygiene / opened-product matrix, category-wise window, QC grade → disposition, cost kaun uthata hai |
| Inventory / WMS | ek line (lambi list) | Multi-warehouse allocation, reservation model, cycle count variance, ownership (seller ka stock hamare paas) |
| Reviews / UGC | ek line + flow | Verified purchase, rating aggregation, incentive disclosure, photo moderation pipeline |
| Search | ek line | Ranking, facets, synonyms ka management, zero-result handling; M0 pe sirf 3 search indexes [D] |
| Recommendations | nahi (sirf consent ka zikr) | Shade matching, routine builder, similar / complementary, personalisation |
| Virtual try-on | nahi (sirf naam) | Technology, shade calibration, device support, camera consent aur face data ki privacy |
| Loyalty / gift cards / store credit | ek line | Liability accounting, expiry, fraud, kanooni darja [NV] |
| Subscriptions / replenishment | nahi (sirf ek CRM journey) | Subscribe-and-save, recurring payment mandate |
| Support | ek line + flow | Ticket model, channels, SLA engine, knowledge base |
| Notifications | sirf email bana | Template catalogue, preferences, consent, in-app inbox, push |
| Analytics | ek line (insights rollups) | Event tracking, funnel, attribution, cohort; BI ka raasta |
| Media | flow (§6.7, achha) | Swatch / shade images, video, zoom, try-on assets; Cloudinary free limits unverified (ARCH §18) |
| Seller onboarding / KYC | flow (PRD detail) | Data model, document verification ke asli providers, re-KYC |
| Fraud / risk | ek line | Rules, signals, review queue |
| B2B / Pro | ek line | MOQ, credit terms, quote flow |
| Compliance | **mazboot** (PRD §7.1) | Sab dummy; † wale 2025-26 ke kanoon law-firm summaries se, lawyer ne verify nahi kiya [D] |
| SEO / content | planned (T4.12) | Canonical ke liye domain nahi |

## 8. Scalability aur operational concerns

| # | Concern | Detail | Saboot |
| --- | --- | --- | --- |
| 1 | Ek process, 0.1 CPU, 512 MB | 4 HTTP servers + workers + schedulers ek event loop pe; heap cap 300 MB | `scripts/render/start.sh` [V], ARCH §11.1 [D] |
| 2 | Sign-in ki chhat | Ek waqt me ek argon2 hash; poore platform pe 30 sign-in hashes/min | `backend/identity/src/config.ts:41` [V] |
| 3 | Har request pe do hop + JWT sign | Vercel → gateway → localhost HTTP → owner; ES256 sign / verify har baar | `gateway/src/proxy.ts:415` [V] |
| 4 | Redis hard dependency | Signed-in har request pe Redis check (500 ms); wipe ke baad marks lautne tak 503 | `gateway/src/sessions.ts:54,77` [V] |
| 5 | Queue throughput | Har deployable ki ek queue, consumer concurrency 1: dheema job peeche walon ko rokta hai | `server-queue/src/consumer.ts:176` [V] |
| 6 | Atlas M0 | 100 ops/s chaaron DBs me saajha; 512 MB me audit (400 din), outbox, idempotency ke jawab, location (~20 MB), catalog, orders; 500 collections ki seema | ARCH §6.1 [D] |
| 7 | Backup / DR | PITR nahi; hafte ka manual `mongodump` laptop se (chal raha hai ya nahi [NV]); ledger ke liye RPO ~1 hafta | ARCH §6.5 [D] |
| 8 | Neend | Timers late, reservation expiry aur webhooks jaagne pe; SLO sirf "jaaga ho tab" | ARCH §11.1, §14.6 [D] |
| 9 | Rate limit sirf IP pe | `write` 20/min per IP; warehouse / hub / office ka saajha NAT IP (pick-pack scans writes hain) jaldi rukega | `gateway/src/rate-limits.ts:20-30,69-80` [V] |
| 10 | Email budget | 300/din sab milake | `notify/src/config.ts:47` [V] |
| 11 | Staging nahi | Previews band; release ka test = laptop (8 GB RAM) E2E, phir seedha production | ARCH §11.4, MEMORY §3 [D] |
| 12 | Vercel Hobby | 11 projects, 100 deploys/din, sirf non-commercial: asli business is plan pe chal hi nahi sakta | ARCH §9.3 [D] |
| 13 | Region | Vercel functions `bom1` → Render Singapore → Atlas Singapore: har API call pe India ↔ Singapore | `frontend/customer/vercel.json` [V] |
| 14 | Live updates polling se | Tracking, chat, control tower 5 se 30 s polling, 5 GB/mahina bandwidth aur 0.1 CPU pe | ARCH §15.6 [D] |
| 15 | Logs | Render se log shipping nahi; 180 din ka archive "zaroori" likha hai par bana nahi | ARCH §14.3 [D], code me nahi mila [NV] |
| 16 | Deploy overlap | Purana + naya instance saath; isi se LIVE-006 jaise bugs; boot pe release steps cold start badhate hain | ARCH §5.2 [D] |
| 17 | Monorepo ka bojh | 37 workspaces; laptop pe parallel build me customer prerender timeout | HANDOFF §6 [D] |
| 18 | Bus factor | Gyaan bahut bade docs me; unhe code ke saath sach rakhna khud ek kaam | §6 Q9 |

## 9. Recorded decisions aur meri raay

**K** = default ki tarah rakho. **R** = dobara confirm karo. **O** = reopen karo.

**PRD §2** (27 rows; 2 frozen rows evaluation ke bahar):

| Decision | Raay | Ek line wajah |
| --- | --- | --- |
| Sirf beauty aur personal care | K | Focus; catalog model gehra ban sakta hai |
| Business model: house brand + doosre brand sellers | **O** | Sabse bada scope driver: marketplace compliance, settlement, fairness; 1P ya pure marketplace se aadha finance hat'ta hai |
| House brand ek seller account se, koi shortcut nahi | K | Saaf separation of duties (agar hybrid rahe) |
| Sirf brand owners aur authorised distributors | K | Nakli maal ka jokhim kam; trust model saral |
| Saara stock Beautinique warehouse me | **O** | WMS aur warehouse-state GST ki shart yahin se aati hai (Q6) |
| Delivery sirf Beautinique | **O** | Fallback nahi, pan-India nahi (Q6) |
| Gig partners, apni gaadi | R | Upar wale pe nirbhar; state-wise gig compliance |
| Prepaid (Razorpay) ya delivery pe UPI QR; cash nahi | K | Cash handling hat'ta hai; UPI-on-delivery MVP me ho ya nahi, R |
| Launch phases me, Pune se | K | Chhote se shuru karna sahi |
| Sellers poore India se, warehouse-state GSTIN ke saath | R | Stock wale faisle ka nateeja; onboarding ki rukawat |
| Expansion sirf config se | K (principle), R (gehrai) | Lint sasta hai; go-live engine mehenga (Q12) |
| Customers sirf 18+ | R | Wajah likhi nahi; sign-up me ek step badhta hai |
| Reviews pehli release me | R | MVP tiering ka sawal |
| Foreign investment nahi | K | Isi se hybrid (inventory + marketplace) model mumkin rehta hai [NV: kanooni detail] |
| 11 apps | **O** | Q2 |
| Saare roles launch se | **O** | Q1, Q7 |
| Docs Hinglish me | K | Owner ke liye |
| Education + portfolio, par production-grade; legal dummy | R | "Production-grade" ki paribhasha ₹0 infra se takrati hai (Q4) |
| Sirf India, INR, GST invoice | K | Saaf |
| Fully responsive web; delivery PWA; native nahi | K | Rider PWA ki seemaayein (background location, scan) R |
| Pune pehle din poora district | **O** | 21 hubs pehle din (Q6) |
| Agla district kisi bhi order me, team-ready checklist | K | Expansion principle ka hissa |
| Pune network: Chakan + 21 hubs | R | Dummy data; upar wale pe nirbhar |
| Stock transport: kiraye ke trucks | K | Chhota faisla |
| Drug items kabhi nahi | K | Compliance saral; borderline products ke niyam chahiye |
| Head of Operations role | R | Role catalogue ke saath |
| Plastic EPR lagu (dummy) | K | Kam priority |

**ARCHITECTURE §2:**

| # | Decision | Raay | Ek line wajah |
| --- | --- | --- | --- |
| 1 | Identity, Payments, Notify microservices + Core monolith | R | Identity / notify bane hain, rakho; payments alag process **O** (Q3) |
| 2 | Microservice banne ka rule | K | Rule sahi hai; bundle mode me uska security wala hissa lagu nahi |
| 3 | Kharcha ₹0 | **O** | Q4; owner ka budget faisla |
| 4 | Render pe bundle mode | K (jab tak ₹0) | #3 ka nateeja |
| 5 | Ek cluster, har deployable ka DB + user, module-prefixed collections | K | Sasta isolation, cross-module transaction mumkin |
| 6 | Redis source of truth nahi; local Valkey, live Key Value | K | Sabse mazboot principle |
| 7 | Domain nahi; Vercel rewrite se same-origin | **O** | Domain sasta hai; same-origin rewrite pattern rakho |
| 8 | Monorepo: npm workspaces + Turborepo | K | Owner ke framing me frozen |
| 9 | Master ke doosre roles alag staff account pe | K | Audit me owner aur operator alag |
| 10 | Performance targets sirf jaage hue pe | R | #3 ka nateeja |

**MEMORY decision log (chune hue):**

| Decision | Raay | Ek line wajah |
| --- | --- | --- |
| Native `mongodb` driver, Mongoose nahi | K | Session aur transaction pe poora control |
| Har id ObjectId | K | Ek niyam, pehra test ke saath |
| Contracts-first; zod sirf `shared-zod` se; HTTP sirf axios | K | Convention, lint se laagu |
| Mutation testing 3 hisson me | K | Keemat aur faayde ka sahi santulan |
| Git flow `prerelease` → `release` → `main` + back-merge | R | 1 se 2 logon ke liye bhaari (Q13) |
| Apna package CLI; packages public par publish nahi | R | Nivesh vs upyog |
| Saare apps email + password; email code se sign-in nahi | R | PRD se takrav (Q11) |
| Social login sirf customer me (3 providers) | K | Customer ki suvidha |
| Cart / wishlist ke liye sign-in; guest cart nahi | **O** | Q10 |
| Ek account pe max 50 grants | R | Technical seema business niyam ban gayi (Q3) |
| Service jagana, jaagta rakhna nahi; previews band | K (jab tak ₹0) | ₹0 ka nateeja |
| Purane data ka import nahi; khaali data se shuru | K | Saaf shuruaat |
| Poore India ka location master pehle din | R | Q12 |
| `StoragePort`; ordered product archive; ek file ek owner | K | Provider badalna aasaan; order history surakshit |
| Base price sabke liye ek; farak sirf label se | K | Bharosa; dark-pattern ka jokhim kam |
| Internal apps pe har login TOTP; 12 ghante session, 30 min idle | K | Sahi default |

## 10. Sabse bade unknowns (impact ke order me)

| # | Unknown | Kyun zaroori | Kya rukta hai |
| --- | --- | --- | --- |
| 1 | **Project ka asli lakshya:** portfolio demo, ya kabhi asli business launch? | Budget, legal (dummy vs asli), scope aur "done" ki paribhasha isi se tay hoti hai | Lagbhag har doosra faisla |
| 2 | **Business model:** hybrid marketplace, 1P inventory-led, ya pure marketplace? Invoice pe supplier kaun? | Finance (TCS / TDS, settlement), seller app, catalog ki ownership, compliance | Finance, sellers, catalog, order model |
| 3 | **Fulfilment model:** sirf apna warehouse + fleet, ya 3PL / courier / seller-fulfilled bhi? | 2 apps aur roadmap ke sabse bade phases isi se | WMS, logistics, delivery app, serviceability |
| 4 | **MVP ki paribhasha aur phasing:** release 1 me kya? "Sab launch pe" rehta hai? | Bina iske koi roadmap ya estimate sach nahi | App ginti, role catalogue, module order |
| 5 | **Budget, hosting tier, uptime ki ummeed, domain** | ₹0 ke liye bani complexity rehni hai ya hatni hai | Deployment topology, SLOs, email, backup, staging |
| 6 | **Team capacity aur timeline:** kitne log, hafte me kitne ghante, koi target date? | Scope ko capacity se milana | MVP ka size |
| 7 | **App topology:** 11 apps ya consolidated; launch pe kaunse roles sach me insaan ke paas honge? | Frontend ka kaam aur ops ka bojh | Frontend architecture, RBAC catalogue |
| 8 | **Cosmetics catalog model:** variant axes, batch-wise MRP / expiry, ingredient data, content ka maalik | Search, pricing, inventory, try-on aur product page ke kanooni declarations sab isi pe | Catalog, discovery, inventory, pricing |
| 9 | **Order model:** multi-seller cart ka split (supplier / shipment / invoice), partial cancel / return, exchange | Invoice, reservation aur refund ki neev | Commerce, finance, logistics |
| 10 | **Paise ka flow:** kaun collect karta hai, seller ko kab aur kaise, refunds, store credit / gift card / loyalty ki liability; asli PSP onboarding hoga? | Ledger design aur database ka sawal (Q5) | Payments, finance, compliance |
| 11 | **Virtual try-on:** MVP me hai? Kaunsi technology, kaunsi categories? | PRD ka mukhya differentiator par design zero | Catalog shade data, media, privacy consent |
| 12 | **Returns policy:** cosmetics me opened / hygiene items, window, kharcha kiska | Reverse logistics, refund aur fraud | Logistics, finance, support |
| 13 | **Scale targets:** SKUs, sellers, orders/din, concurrent users (launch aur 12 mahine) | Capacity design; aaj koi number nahi | DB sizing, search, queue design |
| 14 | **Compliance ki gehrai:** kaunsi cheezein dummy rahengi, kaunsi asli; teleconsult aur gift cards ka kanooni darja | Scope aur jokhim | Governance, finance, support modules |
| 15 | **Purane repos ke assets** (try-on packages, purane apps): reuse ya chhodna? | PRD unhe "Hai" ginta hai; is repo me nahi hain | Try-on, seller app, estimates |

## Change log

| Version | Date | Badlav |
| ------- | ---------- | ------ |
| v0.1 | 2026-11-17 | Pehla draft: stack, structure, built vs planned, architecture, reference patterns, critical review (Q1 se Q13), gaps, scalability, decisions pe raay, 15 unknowns. |
