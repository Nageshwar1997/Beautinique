# REPOSITORY ANALYSIS: Beautinique (BQ)

> **Status:** v0.3 (2026-11-17), discovery phase; §6 ke 13 sawalon pe owner ke jawab aur charcha har sawal ke neeche ([DECISION_LOG.md](DECISION_LOG.md) D-008 se D-027). Principal Architect ka pehla, evidence-based repository analysis. Ye implementation plan nahi hai: sirf samajh, critique aur sawal.
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

**Owner ke jawab (2026-11-17):** har sawal ke neeche "Owner ka jawab aur charcha" me owner ka jawab, Claude ki jaanch aur saath ki baatcheet (sirf aakhri faisla). Faislon ka record [DECISION_LOG.md](DECISION_LOG.md) D-008 se D-027 me.

### Q1. "Sab kuch launch pe": scope aur capacity ka mel nahi

- **Problem:** 11 apps, 79 roles, ~23 Core modules, sab pehle din (PRD §2, RULES §1.2). 30 din aur 527 commits ke baad koi product list, cart ya order nahi ho sakta; saare 44 routes auth aur platform ke hain [V].
- **Kyun kaafi nahi:** ARCHITECTURE §16 khud 33 se 42 hafte (solo + AI) maanta hai aur "har phase ek internal milestone" kehta hai. Neev ki gehrai badh rahi hai: sirf location + network ke liye 2,173-line plan aur 14 PR, ek bhi product se pehle. Is raaste pe pehla end-to-end order mahino door hai, aur tab tak koi business assumption parkha nahi jaata.
- **Vikalp:** (a) vertical slice pehle (catalog → cart → order → payment → dispatch, 3 se 4 apps); (b) release tiers (MVP, R2, R3) jahan roles data hone se baad me judte hain; (c) jaisa hai.
- **Salah:** "saare roles aur apps launch pe" **reopen** ho. MVP ki paribhasha discovery ka pehla output ho.
- **Trade-off:** owner ka dar ("baad me bhool sakte hain") backlog se sambhalta hai, scope se nahi. Tiering me kuch rework ka jokhim rehta hai.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-008, D-009:**

- **Owner ka jawab (2026-11-17):** salah maani: **(b)**. Design aur task files poore ecosystem ki pehle din; banana releases me, R1 = ek patla par poora order flow. Koi feature kata nahi. R1 me exactly kya aayega, ye alag se tay hoga.
- **Asar:** purane PRD §2 ke "Apps" aur "Roles ka timing" aur root `CLAUDE.md` ka "kuch bhi baad me nahi" niyam isse badalte hain; badlav ki list DECISION_LOG §7 me (owner ki haan ke baad).
- **Capacity (owner, 2026-11-17):** kaam karne wala **ek hi insaan** hai (owner). Docs ka "2 developers" asal me usi insaan ke 2 Claude accounts hain, jo usage limit ki wajah se baari-baari use hote hain. Yaani handoff ek account se doosre account ko hota hai, insaan se insaan ko nahi.
- **Samay (owner, 2026-11-17):** din me **5 ghante**, hafte me **6 din** (30 ghante/hafta), shuruaat aaj (2026-11-17) se. **Koi deadline nahi** (owner ne saaf kaha).

### Q2. 11 alag frontend apps

- **Problem:** 8 apps ek jaise khaali shells hain [V]. Har app = alag Vercel project, `vercel.json`, manifest, icons, cookies, audience, E2E setup, Ola Maps key (ek account me 3 domains, isliye 4 accounts [D]).
- **Kyun kaafi nahi:** Hobby ki 100 deploys/din limit ki wajah se previews pehle hi band karne pade (ARCHITECTURE §11.4). RBAC already permission-filtered nav aur `<Can>` deta hai (`packages/frontend/authz/src/react.tsx:45`), yaani internal roles ko alag app ki technical zaroorat kamzor hai. Ek insaan jo shuru me kai roles sambhalega use 5 se 6 apps me alag-alag sign-in karna padega.
- **Vikalp:** (a) 4 apps: customer (SSR), partner (seller + creator), ops console (admin, superadmin, support, finance, logistics, growth permission-wise sections me, lazy routes), delivery PWA; Master alag rakhna ho to 5. (b) 11 hi, par sirf zaroorat ke hisaab se bante jaayein.
- **Salah:** **reopen**. Identity me "app" data hi rahe; internal apps consolidate karna default mana jaye.
- **Trade-off:** alag app = chhota bundle, alag session policy, kam blast radius, role ke hisaab se saaf URL. Consolidation = kam ops, ek deploy, par console bada aur route guards pe zyada bharosa.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-010:**

- **Owner ka jawab (2026-11-17):** salah nahi maani: **har role ka alag app chahiye** (11 apps rahenge).
- **Wajah (owner):** (1) saare 11 apps pehle se bane hue hain; (2) alag rakhne se multiple projects ban jayenge.
- **Banne ka order (owner, 2026-11-17):** jaise jaise modules pe kaam chalega, us module ki screens apps me judti jayengi. Shells tab tak jaise hain rahenge.
- **Aage bheja:** ek insaan ke kai roles ho to kai jagah sign-in ka bojh (single sign-on ya alag sign-in) security wale batch (B15) me tay hoga.

### Q3. "Microservices" jo production me ek hi process hain

- **Problem:** Identity, Payments, Notify ko alag karne ki wajah "security keys, paisa, secrets" di gayi (ARCHITECTURE §2.1). Par production = bundle mode: ek process, ek heap, ek cluster, ek Redis (`backend/bundle/src/bundle.ts:24`) [V]. Asli isolation sirf alag DB user aur env keys hatana hai.
- **Kyun kaafi nahi:** distribution ki poori keemat abhi di ja rahi hai, faayda nahi mil raha: har request pe localhost HTTP hop + ES256 passport sign / verify (0.1 CPU pe), roles / grants ki copy events se aur uska `authzVersion` retry → 503 raasta (`authz.ts:62-90`), ek account pe max 50 grants sirf isliye ki snapshot 16 KB event me aaye (`server-queue/src/outbox.ts:21`, `identity/src/rbac/grants.ts:224`), deploy overlap ke bugs (LIVE-006), catch-up sweeps. Split mode (Docker) bana hi nahi [V].
- **Vikalp:** (a) modular monolith: identity, notify, payments module ki tarah, wahi facade + outbox + alag DB discipline, physical split tab jab paid infra ho; (b) jo bana hai rakho, par naya process (payments) tab tak nahi jab tak asli isolation na mile; (c) asli split paid tier pe.
- **Salah:** bani hui identity aur notify **rakho** (kaam karta code hai). Payments ko alag process banane ka faisla **reopen**. Agar wajah "microservices seekhna" hai (MEMORY 2026-10-19) to wahi likho, security nahi.
- **Trade-off:** monolith me secrets ka blast radius ek rehta hai (jo aaj bhi hai); split ka raasta contracts ki wajah se khula rehta hai.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-011, D-012:**

- **Owner ka jawab (2026-11-17):** salah nahi maani: **sabki alag services**. Har service ka **apna database aur apna alag cluster**.
- **Wajah (owner):** (1) MongoDB Atlas ka M0 cluster 512 MB deta hai, jo poore project ke liye kaafi nahi hoga; har service ka alag cluster hone se storage milta hai. (2) **Security bhi zaroori wajah hai** (owner ne salah ki "security nahi" wali baat nahi maani).
- **Security ka sach (Claude ka note):** alag cluster + alag DB user se data ki security abhi se milti hai (ek service ka DB password leak ho to doosri ka data nahi khulta). Process ki security (ek service me chhed ho to doosri ke secrets bachein) tab milegi jab services alag servers pe chalengi; design aisa rahe ki wo kadam baad me bina rewrite ke ho. Security Architect (B15) ise jaanchega.
- **Seema (owner, 2026-11-17):** kuch modules ek service me rah sakte hain (jahan storage kam lagta ho). Seema Claude tay kare; di gayi salah (transaction se seema, 7 se 9 services) maani.
- **Owner ke andaze:** audit log aur pincodes / locations ka data ~100 MB; launch pe ~500 products.
- **Seema ka pehla draft (Claude ka, module design ke waqt pakka hoga):**
  1. identity (bana hua): login, accounts, roles
  2. notify (bana hua): email, in-app, push
  3. payments: paisa lena, refunds
  4. catalog: products, search, reviews
  5. commerce: cart, orders, stock, warehouse, promotions (order + stock reservation ek transaction me)
  6. logistics: location master, pincodes, hubs, delivery
  7. finance: ledger, settlement
  8. support: tickets, disputes
  9. audit: audit log (sabse tez badhne wala data)
- **Niyam:** jo cheezein ek saath pakki honi chahiye wo ek hi service aur cluster me; services ke beech data sirf events se; MongoDB wali har service ka cluster alag Atlas project aur alag DB user ke saath; finance PostgreSQL pe (Q5).
- **Jaanchna baaki:** Atlas ke free-tier niyam (ek project me ek free cluster), ek process me 9 services ki memory (512 MB), aur repo me har deployable ka alag cluster URI lena kitna chhota badlav hai.
  - **Jaancha (Claude, 2026-11-17):** alag cluster URI ka intezaam pehle se hai: har deployable apna `<NAME>__MONGO_URI` padhta hai (`backend/identity/src/config.ts:16`, `backend/bundle/.env.example`). Par `create:backend` ka template naye service me Mongo URI nahi jodta; abhi identity, notify, core me haath se juda hai.

### Q4. ₹0 hosting vs "production-grade"

- **Problem:** dono ek saath sach nahi ho sakte. Docs ke hi numbers [D]: service 15 min me soti hai, cold start 42 se 57 s, raat me timers ~13 ghante late, Redis 25 MB bina persistence, Atlas me backup nahi (hafte ka manual dump), 300 emails/din, domain nahi (email spam me), staging nahi.
- **Kyun kaafi nahi:** ek order kam se kam 3 se 5 emails banata hai, to 300/din ≈ 60 se 100 orders/din ki chhat, sign-up codes ke saath saajhi. Reservation 15 min me expire honi hai par soya server sweep nahi chalata. Payment webhook sote server pe aaye to provider ke retry pe nirbhar [NV: provider ke timeouts nahi jaanche]. Aur sabse badi baat: code ka bada hissa free tier ko sambhalne ke liye hai (wipe watchdog, wake screens, poll relay, ek queue per deployable, connection budget). Ye achhi engineering hai, par accidental complexity hai jo business value nahi deti.
- **Vikalp:** (a) ₹0 rakho aur saaf likho ki "production-grade" ka matlab code quality hai, operations nahi; (b) chhota budget (ARCHITECTURE §11.6 ka andaza ~$72 se 79/mahina) + domain; (c) beech ka: sirf domain + paid Redis ya DB.
- **Salah:** **reopen**, owner ka budget faisla. Kam se kam domain (sasta, email deliverability, canonical URL, cookies saaf).
- **Trade-off:** paisa vs complexity aur asli demo ki quality.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-014, D-015:**

- **Owner ka jawab (2026-11-17):** salah nahi maani: **(a) ₹0 hi, domain nahi chahiye**.
  - Soye server pe pehle customer ka ~1 minute intezaar: chalega.
  - Server ko din me baar-baar jagaya jayega: GitHub Actions, cron-job aur UptimeRobot se; aur jab frontend apps khule hon tab har kuch minute me wake.
  - Din ke 300 emails kaafi hain (owner: ye hobby project hai).
  - Free tier ki seemaon ke liye limit handling waise hi banti rahegi jaise ab tak bani hai.
  - "Production-grade" ka matlab: **code ki quality bhi, aur chalne ki quality bhi (₹0 me jitni ho sake)**.
- **Jaanchna baaki (Claude):** Render free plan ke mahine ke ghante ek hamesha-jaage server ke liye kaafi hain ya nahi, aur baar-baar jagana uske niyamon me theek hai ya nahi. Ye purane faisle "jagana, jaagta rakhna nahi" ko badalta hai.
- **Jokhim (owner ne maana):** domain ke bina emails spam me ja sakte hain, aur har OTP email se hi jaata hai.
- **Backup (owner, 2026-11-17):** **ek command, jo production me jaane se pehle owner chalayega, aur jo saare clusters ka data JSON me download kar de.**
  - **Format (Claude ki salah, owner ne maani):** MongoDB clusters ke liye Extended JSON, har collection ki ek file, ek line me ek document, taaki ObjectId aur dates wapas wahi banein.
  - **Finance ka PostgreSQL (Q5 ka asar):** isi command me; uska format technical batch (B16) me tay.
  - **Restore (Claude ki salah, owner ne maani):** saath me restore ki command, ek baar local database pe chala ke jaanchi jaye; restore ke bina backup adhoora.
  - **Files ki jagah (owner):** downloaded files **isi repo ke folder me**, bas GitHub pe nahi (git se bahar).
  - **Suraksha ke 4 pehre (owner ne haan kahi):** folder `.gitignore` me; CI ka pehra jo us folder ki koi file git me dikhe to fail kare; folder prettier, ESLint aur tests ki nazar se bahar; Claude us folder ko `.env` ki tarah kabhi na khole.
  - **Achhi aadat, zaroori nahi (Claude):** jo data dobara ban jaata hai (sessions, idempotency ke jawab, nipte hue events) chhodna, audit log zaroor lena; backup ke liye sirf padhne wala DB user.
- **Kaun chalayega (owner, 2026-11-17):** live system sirf owner chalayega, koi doosra asli user nahi; isliye backup ke waqt "ek pal ka snapshot" ki chinta nahi. Par design aur code asli users maan ke hi honge (Q5).
- **Jaanchna baaki (Claude):** Atlas free cluster ki hafte ki data-transfer seema, taaki pata ho hafte me kitni baar poora backup liya ja sakta hai.

### Q5. MongoDB pe orders, inventory, payments aur ledger

- **Problem:** double-entry journal, gapless GST invoice counter, stock reservation aur coupon budget sab multi-document transactions pe (ARCHITECTURE §6.2 se §6.4) [D]. Kuch bana nahi, isliye ye design abhi tak parkha nahi gaya.
- **Kyun kaafi nahi:** (1) hot documents: har GSTIN ka gapless counter, sale me hot SKU ka balance, coupon budget; write conflict pe poora transaction abort hoke retry hota hai, yaani packing aur checkout serialise ho sakte hain. (2) Foreign key aur constraints nahi: ledger ki integrity code + raat ki verify pe. (3) Finance reports (GST registers, TCS / TDS, settlement, reconciliation) relational aggregation hain; M0 pe `allowDiskUse` nahi aur sort 32 MB tak. (4) 100 ops/s ki chhat: ek checkout ~10 se 20 ops le to kuch hi checkouts/second.
- **Vikalp:** (a) MongoDB hi (stack frozen), par invariants ki list saaf: kaunsa unique index se, kaunsa conditional update se, kaunsa sirf code se; hot counters ke contention tests; reports pre-aggregated read models se. (b) Sirf finance / ledger ke liye relational store. (c) Finance ka scope chhota karna.
- **Salah:** stack badalne ki salah **nahi**. Par ye discovery ka khula design sawal rahe: agar finance ka poora scope (settlement, TCS / TDS, GST registers) rehta hai, to ledger ke liye relational store ka case mazboot hai aur ise Data / Finance expert jaanche. Existing `withTransaction` aur audit ka "DB role se immutability" pattern ledger pe reuse ho.
- **Trade-off:** ek DB = kam ops aur ek transaction; relational = mazboot integrity aur reporting, par do stores aur cross-store consistency.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-012, D-001, D-013:**

- **Owner ka jawab (2026-11-17):** **finance ke liye PostgreSQL** (vikalp (b)); baaki services MongoDB pe. Har niyam ki saaf list (kaunsa unique index se, kaunsa conditional update se, kaunsa code + raat ki jaanch se) aur har ek ka test.
- **Owner ka niyam (isi jawab ke saath, poore project pe laagu):** system sirf owner chalayega, par **code sirf owner ke liye nahi likhna**. Ekdum production-grade: ye maan ke design aur code karna hai ki asli users use kar rahe hain, halaaki karenge nahi.
- **Is niyam ka asar yahan (Claude):** load wali chintaayein (ek saath kai checkout, hot counters, 100 ops/s) khatam nahi hoti. Isliye tests me ek saath chalne wale requests ke tests bhi honge (invoice counter, stock, coupon budget).
- **Asar (Claude):**
  1. "Tech stack wahi rahega" (DECISION_LOG D-001) me ye ek jod hai; D-001 me likh diya.
  2. Stock, coupon budget jaise niyam commerce service (MongoDB) me hain: unki list aur tests waise hi rahenge.
  3. Finance pehle se alag service hai aur data events se leti hai (Q3), isliye SQL saaf alag baithta hai; do databases ke beech koi transaction nahi chahiye.
  4. Kernel packages (transaction, outbox, release steps, idempotency) aaj sirf MongoDB ke liye hain; finance ke liye inka SQL roop chahiye hoga. Ye is faisle ka asli kharcha hai.
  5. Local Docker infra, CI aur backup script me SQL database bhi judega.
- **Jaanchna baaki (Claude):** kaunsa free PostgreSQL provider (storage, sone / pause hone ke niyam, connections ki seema).
- **Aage bheja:** finance ke andar kya-kya PostgreSQL me jayega, aur kernel packages ka SQL roop kaisa hoga: finance aur technical batches me.

### Q6. Sirf apna warehouse + sirf apni delivery fleet + pehle din poora Pune district (21 hubs)

- **Problem:** ye sabse bhaari operating model hai: WMS, line-haul, hub ops, rider onboarding, gig-worker compliance, 2 apps aur roadmap ke sabse bade phases (Phase 8: 5.5 hafte, Phase 9 ka bada hissa).
- **Kyun kaafi nahi:** third-party courier out of scope hai (PRD §8), to rider kam pade to koi fallback nahi, aur served district ke bahar order nahi (PRD §11 khud maanta hai ki demand wapas jayegi). Har seller ko warehouse wale state ka GST registration chahiye, jo onboarding ki badi rukawat hai (PRD §11).
- **Vikalp:** (a) `CarrierPort`: apni fleet ek adapter, 3PL courier doosra; (b) seller-fulfilled bhi; (c) launch ek shehar aur kuch hubs se, district baad me (hubs data hain).
- **Salah:** **reopen**. Logistics ko port ke peeche design karo taaki model baad me bina rewrite badle.
- **Trade-off:** apna stock aur fleet = batch, expiry aur asli maal pe control (bataayi gayi wajah); badle me scope aur asli duniya me capex.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-016, D-017, D-018:**

- **Owner ka jawab (2026-11-17):**
  - **Stock:** har brand ka saara maal sirf Beautinique ke apne warehouse me (Chakan). Brand maal bhejta hai; hum rakhte aur pack karte hain.
  - **Delivery:** customer tak sirf Beautinique ke apne delivery partners. Bahar ki koi courier company nahi.
  - **Maal ka raasta:** brand → warehouse → hub → delivery partner → customer.
  - **Ilaake ke bahar:** delivery unavailable.
  - **Carrier port:** salah maani (is file ka vikalp (a); chat me ise (b) kaha gaya tha). Delivery ka code ek port ke peeche; aaj uske peeche sirf apni fleet.
  - **Seller khud bheje** (is file ka vikalp (b)): nahi; stock aur delivery sirf apni.
  - **Pehle din:** 1 warehouse + **1 hub** (21 nahi). Baaki hubs baad me ek click se judte jayein.
  - **Hub ki shart:** hub tabhi live hoga jab uska poora staff ready ho; staff ke bina hub start nahi hoga.
  - **Location ki seedhi:** India > State > District > Sub-District.
  - **Service on / off ka haq:** Master = State; Super Admin = District; Admin = Sub-District.
- **Pehle din ka ilaaka (owner ne saaf kiya, 2026-11-17):** district me **ek main warehouse**; sub-district me **ek hub**. Pehle din delivery **us sub-district ke saare pincodes** tak hogi, poore district me nahi.
- **Aur saaf kiya (owner, 2026-11-17):**
  - Sub-district ki jagah **sirf hub** hai: parcel aage badhana, stock nahi.
  - **Ek sub-district me sirf ek hub.**
  - **Warehouse se seedha customer ko kuch nahi jayega.** Main city ka alag sub-district nahi hota; wahan bhi warehouse ke paas ek hub banega, aur har parcel hub se hi jayega. Warehouse hub ka kaam nahi karta.
  - **Poora staff:** jo-jo zaroori ho. Staff ki list kaafi had tak pehle se hai (purane docs ke roles); jo missing ho wo jodna hai.
  - **Hub ko live Admin karta hai.**
  - **Upar ka level OFF to neeche sab OFF** (State OFF = uske saare districts, sub-districts aur hubs OFF).
  - **Live hone ki sharten:** State tab tak live nahi jab tak uska kam se kam ek district live na ho. District tab tak live nahi jab tak uske paas warehouse aur hub na ho.
- **Claude ke notes:** (1) [owner ne ye salah maani, 2026-11-17] "ek sub-district me ek hub" niyam ki tarah laagu ho, par data me hub alag record rahe jo sub-district se juda ho, taaki niyam kabhi badle to data na todna pade. (2) Sarkari data me main city bhi ek sub-district ki tarah darj ho to bhi ye model theek baithta hai, kyunki ab har sub-district me hub hi hai; phir bhi data dekh ke pakka karna hai.
- **OFF aur warehouse ke niyam (owner, 2026-11-17):**
  - **OFF karna:** OFF karte hi naya order banna band. Par jagah poori OFF tab tak nahi hogi jab tak uske orders raaste me hain.
  - **Aakhri live district OFF hua:** state bhi OFF hoga, agar uska koi order pending nahi hai.
  - **Order ka warehouse:** user jis district me hai, usi district ke warehouse se.
  - **Upar wala role neeche ka switch chala sakta hai:** haan (salah maani); kisne kya kiya, audit log me.
- **Pincode ke cases (owner ne poochha; Claude ki salah, owner ne maani, 2026-11-17: "jo theek lage"):**
  1. **Buniyadi niyam:** delivery ka faisla naam ya seedhi se nahi, **pincode → theek ek hub** ki mapping se. Har pincode ka ek "primary sub-district" (data se aaye, Admin badal sake).
  2. **Pincode number poore India me ek hi ilaake ka hota hai;** do states alag-alag jagah ke liye wahi number use nahi karte. Asli case: ek hi pincode ka ilaaka do sub-districts, do districts ya (kabhi-kabhi) do states me phaila ho.
  3. **Do sub-districts ya do districts me phaila pincode:** primary sub-district ka hub aur us district ka warehouse serve kare; address me likha district alag ho to bhi order na ruke.
  4. **Do states me phaila pincode:** data me nishaan; customer state chune; chuna hua state live ho tabhi order; GST usi state ke hisaab se.
  5. **Ek jaise naam** (district ya sub-district ke naam alag states me dohraate hain): hamesha id aur sarkari code se, naam se kabhi nahi; screen pe "Sub-District, District, State" saath dikhe.
  6. **Source data me ek pincode ki kai lines** (kai post offices, spelling ke farak): import pe ek pincode = ek record, unique.
  7. **Naam ya seema badle** (district ka naya naam, naya district): code wahi, naam ka itihaas rahe; purane orders me address waisa hi jaisa order ke waqt tha.
  8. **Jis pincode ki mapping nahi:** unavailable, aur Admin ko "bina mapping wale pincodes" ki list.
  9. **Jaanch kab:** serviceability ki jaanch order banate waqt usi transaction me, sirf cart dikhate waqt nahi.
  10. **"Pending order" me returns bhi:** return pickup aur refund poore hone tak jagah poori OFF na ho.
- **Live hone ki sharton ki gaanth:** state OFF ho to district live nahi ho sakta (upar OFF to neeche OFF), aur state tab tak live nahi jab tak ek district live na ho; is tarah pehli baar koi nahi khul sakta.
- **Gaanth ka hal (Claude ki salah, owner ne maani, 2026-11-17):** har level (State, District, Sub-District, Hub) pe do cheezein alag:
  - **Switch:** kisi ne ON dabaya ya nahi (haq upar wali table jaisa).
  - **Asli haal (live):** apna switch ON + upar wala level live. Ye hamesha isi niyam se nikalta hai, kahin alag se save nahi hota.
  - **Sharten sirf live karte waqt rokti hain (owner, 2026-11-17, Q12 me):** live hone ke baad sharat me kami (jaise staff kam) se jagah apne aap band nahi hoti, sirf chetavni aati hai (detail Q12 "Staff kam ho jaye to"). Switch OFF (insaan ka faisla) ka asar turant.
  - **Sharten:** Hub = poora staff ready. District = warehouse + hub tayyar. State = kam se kam ek district ka switch ON aur wo tayyar.
  - **Kholne ka kram:** Admin hub tayyar kare aur sub-district ka switch ON; Super Admin district ka switch ON; Master state ka switch ON; tab sab live.
  - **Band hona:** koi switch apne aap nahi palatta. Aakhri district band hua to state customers ke liye apne aap band dikhega; district wapas khula to state bina dobara dabaye chal padega. Owner ka "pending order" wala niyam laagu: jab tak raaste me orders ya returns hain, us jagah ke purane orders poore hote rahenge, sirf naye band.
- **Aage bheja (Q12 aur logistics batch):** staff ki list me kya missing hai; asli location data dekh ke ginti ki kitne pincodes do sub-districts, districts ya states me phaile hain.

### Q7. 79 roles ka seed, permissions ke bina

- **Problem:** roles ship ho chuke par lagbhag khaali hain (10 permission keys) [V]. Modules aane pe har role dobara banega.
- **Kyun kaafi nahi:** role catalogue PRD ke org chart se bana hai, asli permissions se nahi; ye speculative design hai. "Roles data hain" kaha gaya par seed code me hai aur har start pe sync hota hai (`backend/identity/src/rbac/roles.ts`).
- **Vikalp:** MVP ke liye ~12 se 15 roles; baaki module ke saath.
- **Salah:** RBAC engine **rakho** (mazboot); catalogue ka size aur timing **reopen**. 50-grant cap ko business niyam nahi, technical seema ki tarah dobara dekho.
- **Trade-off:** kam roles se shuru me scope mote honge.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-019:**

- **Chat me vikalp aise rakhe gaye the (2026-11-17):** (a) roles ki poori list design me rahe, par system me role tab chalu ho jab uska module bane; (b) jaisa hai, saare 79 abhi system me; (c) roles hi kam karo (12 se 15).
- **Owner ka jawab (2026-11-17):** salah maani: **chat wala (a)**. Roles ki poori list design me (Q6: staff ki list kaafi had tak hai, missing jodna hai); system me har role tab chalu jab uska module bane, aur usi badlav me uski permissions. RBAC engine waisa hi.
- **Roles ki ginti (owner, 2026-11-17):** ~80 fix nahi hai; zaroorat ke hisaab se roles badh bhi sakte hain. (Code me pehle se: Master naye sub-roles bina deploy ke jod sakta hai, `backend/identity/src/rbac/roles.ts:17-19`.)
- **Owner (2026-11-17):** **har role ke liye owner ka alag email** (alag staff account) rahega.
- **Asar (Claude):** ek account pe 50 roles ki seema owner ke liye ab rukawat nahi; "kaunse roles ek insaan ke paas saath nahi ho sakte" wale niyam bhi apne aap poore. Code me email sirf trim aur lowercase hota hai (`packages/shared/zod/src/identity.ts:4`), `+` wala hissa nahi hatta, to `naam+role@...` jaise alias alag accounts ban sakte hain.
- **Emails ka bantwara (owner, 2026-11-17):** jin roles pe authenticator lagta hai unke liye alag email, baaki roles ke liye alag.
  - **Authenticator kahan lagta hai (code, Claude ne dekha):** 7 apps me har sign-in pe: admin, superadmin, master, support, finance, logistics, growth (`packages/shared/contracts/src/catalogue/identity.ts:34`). Baaki apps me sirf in roles pe: Seller Account Owner, Seller Finance (`backend/identity/src/rbac/roles.ts:119-133`). Customer, delivery, creator aur baaki seller roles pe nahi (khud chaahe to laga sakta hai; ek baar lagaya to har app me maangega).
  - **Saaf kiya (owner, 2026-11-17):** **2 email ids, dono `+` alias ke saath.** Ek email authenticator wale 7 apps ke saare roles ke liye, doosra bina authenticator wale apps (customer, seller, delivery, creator) ke roles ke liye. Har role ka apna alias, yaani har role ka alag account; inbox sirf do.
  - **Dhyan (Claude):** seller app doosre email me aata hai, par uske 2 roles (Seller Account Owner, Seller Finance) pe bhi authenticator lagega.
  - **Bantware ki wajah (owner, 2026-11-17):** jin accounts ko authenticator ki zaroorat nahi, unhe har login pe authenticator na chalana pade; bojh kam karne ke liye.
  - **Code ka sach (Claude ne dekha, `backend/identity/src/login.ts:167-172`):** authenticator **account pe** lagta hai, email ke base pe nahi. Jis account pe authenticator laga hai, wo har app me har sign-in pe maangta hai; jis pe nahi laga, wo sirf authenticator wale apps ya roles me laga ne ko kehta hai. Owner ka maqsad isliye poora ho raha hai ki har role ka **alag account** (alag `+` alias) hai. Do base emails ka bantwara iske liye zaroori nahi, par inbox alag rakhne ke liye kaam ka hai; kuch badalna nahi.
  - **Owner ne saaf kiya (2026-11-17):** ye bantwara sirf suvidha hai, niyam nahi. Doosre email wale kisi account ko authenticator na dene ki koi majboori nahi: jahan zaroori ho wahan de denge (jaise in 2 seller roles pe).
- **`+` alias (owner, 2026-11-17):** abhi ignore (hobby project). Jahan email ka validation hai wahan code comment me likha jayega ki ye `+` alias ko alag nahi pehchanta, aur jaan-boojh ke kyun aisa rakha. Comment me ye bhi ho ki owner ke role accounts isi `+` alias pe tike hain, to alias ko ek maan lene wala badlav (normalisation) unhe tod dega. Ye code ka kaam hai: discovery ke baad, implementation me (abhi code nahi chhua).
- **Aage bheja (security batch B15):** ~80 staff accounts aur internal apps pe har sign-in pe authenticator code: owner ke liye roz ka bojh.
- **Jaanchna baaki (Claude):** live system me jo roles kisi ko diye ja chuke hain, unhe "chalu nahi" karne se pehle dekhna.

### Q8. Faislon ki process: bahut tez "approved", koi khula sawal nahi

- **Problem:** PRD v0.1 se v1.0 "approved" ek hi din me (2026-10-18). PRD §10: "Abhi koi open question nahi hai". ARCHITECTURE 30 din me v1.104 pe hai aur ab bhi "draft". Decision log me baar-baar "owner ne Claude ki salah maani"; location plan ki saari 49 salah maani gayi [D].
- **Kyun kaafi nahi:** PRD me personas, competitor / market, unit economics, success metrics aur MVP nahi hain. Is size ke product me zero open question asambhav hai; matlab sawal poochhe hi nahi gaye. Ek hi awaaz (AI) ke sujhav bina doosri raay ke maane gaye.
- **Salah:** discovery me har bada faisla assumption ki tarah likha jaye, uske vikalp aur "kis saboot se badlega" ke saath.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-020:**

- **Owner ka jawab (2026-11-17):** salah maani: **(a)**.
- **Har bade faisle ke saath kya likha jayega:** (1) faisla; (2) wajah (owner ke shabdon me); (3) kaunse vikalp chhode aur kyun; (4) kis saboot ya haalat me faisla dobara khulega; (5) kisne aur kab; (6) Claude ki salah aur owner ka faisla alag-alag nishaan ke saath.
- **Badalne ka niyam:** purana faisla mitaya nahi jaata; nayi line "badla" ke saath judti hai.
  - **Kahan laagu (owner, 2026-11-17):** faislon ke record (DECISION_LOG) me. Baaki discovery files (jaise is file ka "Owner ka jawab aur charcha") me sirf aakhri faisla; purani lines hata di jaati hain.

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

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-021, D-009:**

- **Saath ka sawal:** docs "2 developers" kehte hain, git me ek hi insaan ke do naam dikhte hain. Asal me kitne log hain? (Q1 se juda.)
  - **Jawab (Q1 me mila, owner, 2026-11-17):** ek hi insaan; "2 developers" = owner ke 2 Claude accounts. Docs ki ye wording baad me badalni hai.
- **Farak kyun hota hai (Claude):** ek hi baat kai docs me likhi (badlav ek me, baaki bhool jaate hain); "bana hai" ka daawa bina saboot; bade docs (ARCHITECTURE 772 lines, PRD 584, HANDOFF 439, TASKS 433; `docs/` ~2 MB) har session poore nahi padhta.
- **Owner ka jawab (2026-11-17):** salah maani: **(a)**.
  - **Naye docs:** chhote docs aur decision records (format Q8 wala). Har baat sirf ek jagah, baaki jagah sirf link. "Bana hai" sirf code ya test ke link ke saath. Files zyada hongi, isliye ek index file.
  - **Mel (Claude):** owner ka apna docs plan (main PROJECT_PLAN, `decisions/`, `tasks/<flow>/TASK.md`) isi tarah ka hai.
- **Purane docs (Claude ki salah, owner ne maani, 2026-11-17):**
  - **Product aur design docs (PRD, ARCHITECTURE, TASKS, DESIGN):** naye docs ban jaane ke baad `docs/archive/` me, top pe note ke saath ki ye sirf reference hain, sach nahi. Git me history rahegi.
  - **Kaam ke tareeke ke docs (RULES, HANDOFF, GIT_SKILLS, MEMORY):** yahi rahen aur update hon. HANDOFF chhota ho (owner ke 2 accounts ke beech pul).
  - **Kab:** abhi kuch nahi hilega. Ye tab hoga jab B17 (docs ka dhaancha) tay ho aur naya PROJECT_PLAN ban jaye; tab tak CLAUDE.md, skills aur HANDOFF purane paths se jude hain.
- **CI me path check (Claude ki salah, marzi owner ki):** CI check jo dekhe ki docs me likhe file paths repo me sach me hain.
  - **Owner ka jawab (2026-11-17):** **haan, chahiye.** Ye code ka kaam hai: discovery ke baad, implementation me (abhi code nahi chhua).

### Q10. Guest cart nahi (cart / wishlist ke liye sign-in zaroori)

- **Problem:** ARCHITECTURE §9.2: "Add to cart" seedha `/sign-in` pe bhejta hai, kyunki user data browser storage me nahi (RULES §5.9).
- **Kyun kaafi nahi:** e-commerce me ye conversion ka seedha nuksaan hai. Niyam ka maqsad (browser storage me data nahi) server-side anonymous cart (HttpOnly cookie) se bhi poora hota hai.
- **Salah:** **reopen**.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-022:**

- **Owner ka jawab (2026-11-17):** salah nahi maani: **(b) guest cart nahi**. Cart me daalne ke liye sign-in zaroori (jaisa purane design me hai).
- **Wajah (owner, 2026-11-17):** storage aur kaam kam karne ke liye.
- **Wishlist (owner, 2026-11-17):** **wishlist ke liye bhi sign-in zaroori.** Wajah wahi: storage aur kaam kam.
- **Bina sign-in kya chalega (Claude ki salah, owner ne maani, 2026-11-17):**
  - **Bina sign-in (koi bhi):** products dekhna aur product page; search aur filter (shade, skin type ...); reviews padhna; pincode daal ke delivery hai ya nahi dekhna.
  - **Sign-in zaroori:** cart; wishlist; checkout aur payment; review likhna; orders aur account.
  - **Wajah:** dekhne wale hisse me kuch save nahi hota, to storage wali wajah laagu nahi; visitor ko khareedne se pehle delivery ka pata chal jaata hai.

### Q11. Customer login: sirf password (min 12) + social

- **Problem:** email code se sign-in hata diya gaya (2026-10-27) jabki PRD ab bhi wahi kehta hai. Consumer storefront ke liye lamba password friction hai.
- **Salah:** **re-confirm**: customer ke liye email code se sign-in wapas chahiye ya nahi; PRD aur ARCHITECTURE ek hon.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-023:**

- **Aaj ka haal (code, Claude ne dekha):**
  - Customer: email + password (min 12, max 128, koi composition rule nahi, leaked password roka jaata hai), aur Google, LinkedIn, GitHub (sirf customer app).
  - Email code sirf sign-up, "password set karo / bhool gaya" aur invite me (`backend/identity/src/otp.ts:72`), login me nahi.
  - Customer session 30 din (har use pe aage badhta hai), zyada se zyada 90 din (`packages/shared/contracts/src/catalogue/identity.ts:405`).
  - PRD (§3.2, §5.0) ab bhi "email OTP se login" kehta hai; ARCHITECTURE §7.1 (2026-10-27) ne email code se login hataya. Hatane ki wajah docs me nahi mili.
- **Kyun zaroori (Claude):** guest cart nahi (Q10), to har naya visitor "Add to cart" pe login pe atakta hai; lamba session matlab login kabhi-kabhi, aur tabhi password bhool jaata hai; bina domain email spam me ja sakta hai aur din ke 300 hi (Q4).
- **Owner ka jawab (2026-11-17):** salah maani: **(b)**. Customer app me teen raaste: password, social (Google, LinkedIn, GitHub), aur email code se sign-in; customer khud chune.
- **Wajah (Claude ki, owner ne maani):** email code ka poora system pehle se bana hai, login me sirf naya purpose judega; session lamba hai to email budget nahi khata; email spam me jaaye to password ka raasta khula rehta hai.
- **Security niyam (Claude ki salah; Security Architect batch B15 me pakke honge):**
  - Jis account pe authenticator laga hai, uspe email code ke baad bhi authenticator maanga jayega; email code authenticator ko bypass nahi karega.
  - Email code se sign-in sirf customer app me; staff apps me nahi.
  - Account utna hi surakshit jitna email inbox; ye seema user ko batani hai.
- **Docs (Q9 ka niyam):** customer login ki baat sirf ek jagah likhi jayegi; PRD aur ARCHITECTURE ka farak naye docs me khatam.
- **Saath ka farak (jaankari, faisla nahi hua):** delivery partner ke liye bhi PRD "email OTP" aur ARCHITECTURE "password + device binding" kehta hai. Owner chahe to alag sawal banega.

### Q12. Expansion engine aur poore India ka location master, pehle product se pehle

- **Problem:** "no hard-coded geo" niyam sasta aur sahi hai (lint ban chuka). Par uske upar: poore India ka LGD + India Post import, area-settings ki 4-level resolver, go-live checklist engine (predicates, templates, "force live kisi ke paas nahi").
- **Kyun kaafi nahi:** ek dummy network (1 warehouse, 21 hubs) ke liye ye sab pehle banana opportunity cost hai; serviceability ka MVP ek pincode → hub table hai.
- **Salah:** principle **rakho**, gehrai aur order **re-confirm**.

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-017, D-024:**

- **Charcha me vikalp:** (a) R1 me sirf pincode → hub, engine baad ki release me; (b) jaisa purana plan hai (14 PR ka location + network plan pehle); (c) sirf utna jitna Q6 ko chahiye (detail neeche).
- **Charcha me salah:** (c). Q6 me owner ne hierarchy, har level ke switches, live ki sharten aur pincode → hub maange hain, to location master, switches aur sharten R1 me chahiye hi; (a) inke liye kaafi nahi. Sawal "kitna gehra aur kis order me" hai.
- **Purana plan (reference, `docs/backend/T4-LOCATION-PLAN.md` v1.2, 14 PR):** location master (poora India, LGD + India Post, 6 PR); area settings (global → state → district → pincode, 1 PR); network (warehouse, hubs, lanes, delivery promise, 7 PR); go-live checklist engine (templates data me, alag task).
- **Vikalp (c) ki detail (Claude):**
  - **Data:** poore India ka data import (script wahi, data sasta); shak wale pincodes ki jaanch sirf us district ki jo live hona hai. Baaki districts ki jaanch unke live hone se pehle.
  - **Switches aur live:** Q6 wale saare (har level ka switch, live ki haalat hisaab se, store nahi; pending orders tak area poora OFF nahi).
  - **Live ki sharten:** Q6 ki teen sharten code ke niyam ki tarah (hub = staff poora; district = warehouse + hub; state = ek district). Generic template engine baad me, jab sharten badhne lagein.
  - **Area settings:** sirf checkout aur delivery promise ki keys (cut-off, holidays, UPI ki seema). Baaki keys baad me.
  - **Network:** 1 warehouse, hub, pincode → hub, delivery promise. Lanes ki poori detail doosra district aane pe.
- **(c) ka nuksan (Claude):** nayi sharat ya setting jodne pe har baar code + test + deploy (engine me ye Master app se, bina deploy hota). Buniyaad (dhaancha, switches, live ki haalat, pincode → hub) poori banti hai, to baad me engine aaye to sirf "sharten" wala hissa badlega.
- **Owner ka jawab (2026-11-17):** salah maani: **(c)**.
- **Saaf kiya (Claude, 2026-11-17):** (c) me expand karna code ka kaam nahi: naya hub, warehouse ya district jodna, switch ON/OFF, staff ko hub pe role dena, hub live karna aur naye area ka sarkari data laana, sab app ya import command se. Code sirf checklist me bilkul nayi kism ki sharat ke liye.
- **Sudhaar (Claude ki salah, owner ne maani, 2026-11-17):** hub ke staff ki list (kaunse roles, kitne) data me, app ke ek page pe; code me sirf niyam "hub tabhi live jab list ka har role poora bhara ho". List sab hubs ke liye ek common, use sirf **Master** badle, har badlav audit me.
- **Staff kam ho jaye to (owner ka sawal; Claude ki salah (3), owner ne maani, 2026-11-17):** live hub me list se kam staff ho jaye (Master ne list badhayi, ya koi chala gaya).
  - **Chhode vikalp:** (1) turant band: ek resignation se poora area achanak band, aur "kuch apne aap nahi palatta" niyam tootta. (2) purane hubs pe naya niyam nahi: niyam bekaar.
  - **Badlav se pehle:** Master list badle to save se pehle dikhe "is badlav se N live hubs me staff kam ho jayega"; confirm ke baad hi save; audit me.
  - **Kami hone pe:** hub chalta rahe, us pe nishaan (jaise "Delivery Partner 1/2"); us hub ke Admin aur upar Super Admin ko in-app aur email khabar; Admin dashboard me "staff kam wale hubs" ki list.
  - **Faisla insaan ka:** Admin staff bhare, ya switch se hub OFF kare (naye order band, raste wale orders poore).
  - **Dobara live:** OFF hua hub tabhi live jab nayi list poori ho.
  - **Baaki levels:** district aur state ki sharten bhi sirf live karte waqt rokti hain; baad me kami pe chetavni, apne aap band nahi.
  - **Asar:** Q6 ka "asli haal (live)" niyam isi ke hisaab se likha hai.
- **Order (Claude ki salah, owner ne maana, 2026-11-17):** **pehle location, phir products.** Wajah: staff ke grants ka scope (hub, district) aur "hub tabhi live jab staff poora" location aur hub ke records pe tike hain; products dekhne ko location nahi chahiye, par checkout ko chahiye.
- **Naye design me dhyan (Claude):**
  - Purane plan ki area settings me sub-district level nahi tha; Q6 me hai, to naye design me judega.
  - Purane plan me shehar ke beech wale pincodes ka sub-district aksar khaali (LGD me wahan gaon nahi). Yahi Q6 ka "main city ka alag sub-district nahi hota" hai; aise pincode kis hub pe jayein, ye data dekh ke pakka karna baaki (Q6 ke Claude ke note (2)).

### Q13. Chhote par thos points

- Customer ke `Permissions-Policy` me `camera=()` aur `geolocation=()` (`frontend/customer/vercel.json`); try-on ko camera chahiye, address pin ko location. Aaj theek, par feature ke saath badalna hoga [V].
- Teleconsultation (Skin & Hair Expert), gift cards aur store credit PRD me hain, par §7.1 ke legal matrix me inki koi row nahi [D]; kaunsa kanoon lagta hai [NV].
- Package publish CLI (fake registry, 75 tests [D]) un packages ke liye hai jo publish hi nahi hote: nivesh vs upyog **re-confirm**.
- Teen long-lived branches + back-merge, 1 se 2 logon ki team ke liye bhaari; har release pe ~12 cancelled Render deploys (HANDOFF §6) [D].

**Owner ka jawab aur charcha (2026-11-17), faisle [DECISION_LOG.md](DECISION_LOG.md) D-027, D-025, D-026:**

- **Q13a. Package publish CLI:** packages npm pe publish hone hain? Nahi to is CLI pe aur kaam nahi. **Salah:** aur nivesh nahi jab tak publish ka plan na ho.
  - **Owner ka sawal (2026-11-17):** abhi ke package flow (publish, create ...) me koi issue hai kya?
  - **Jaanch (Claude, 2026-11-17):** `npm run test:scripts`: 391 me 386 pass. 2 test files Mongo maangti hain (`scripts/e2e`, Docker band tha), 1 test (seller app create) poore run me 120 s se upar gaya, akele 16 s me pass (laptop pe load). QA audit (2026-11-05) me bhi CLI PASS.
  - **Chhoti kamiyan (Claude ne dekhi):**
    1. `scripts/packages/lib/release.ts:469` kehta hai Release workflow "(main)" pe chalao, par workflow sirf `release` pe chalta hai (`.github/workflows/release.yml:24,78`). `main` chuna to kuch publish nahi, aur 48 ghante ka trust nikal sakta hai.
    2. `docs/packages/README.md` §4 step 10 back-merge `release` → `main` kehta hai; RULES §2 (2026-10-25) `release` → `prerelease`. CLI back-merge yaad nahi dilata.
    3. Docs `test:scripts` ko "sirf CLI ke tests" kehte hain, par isme `scripts/e2e` ke tests bhi hain jinhe `infra:up` chahiye.
    4. Laptop pe poore run me ek test 120 s ki seema paar kar sakta hai.
  - **Owner ka jawab (2026-11-17):** **(a) + sudhaar.** CLI jaisa hai waisa rahe, naya kaam tabhi jab publish ka plan bane; upar ki kamiyan 1, 2, 3 theek hongi (chhote sudhaar, naya nivesh nahi). Ye code aur docs ka kaam hai: discovery ke baad, implementation me (abhi code nahi chhua).
  - **Naye design ke saath badlega (galti nahi):** `create:backend` sirf 5 deployables jaanta hai (`packages/shared/contracts/src/platform.ts:18`) aur baaki sab "core ka module" maanta hai (`scripts/packages/lib/create/backend-templates.ts:26`); Q3 ki 9 services ke liye ye badlega. Template me Mongo URI nahi, aur PostgreSQL (Q5) ka option nahi. 20 package files ke links `tree/main/...` pe (`scripts/packages/lib/create/templates.ts:62`); 13b me `main` band hua to ye badlenge.
- **Q13b. Teen long-lived branches + back-merge:** `prerelease` → `release` → `main` rahe, ya do branches? **Salah:** dobara dekho; 1 se 2 logon ke liye bhaari hai.
  - **Vikalp (Claude):** (a) teeno rahen; (b) do branches `prerelease` + `release`, `main` band, GitHub default branch `release`; (c) sirf `main` + feature branches (har merge pe 11 Vercel deploys, Hobby ki 100/din seema). Salah (b).
  - **Owner ka jawab (2026-11-17):** **`main` branch delete karni hai.** Flow: feature branch → `prerelease` (development) → `release` (production); back-merge `release` → `prerelease` waise hi.
  - **Jaancha (Claude, 2026-11-17, local refs, aakhri fetch tak):** `origin/main` aur `origin/release` ki files bilkul same; `main` me sirf `release` → `main` ke merge commits hain. `main` hatane se koi code nahi khoyega.
  - **Kram (Claude ki salah):** pehle saari jagah `main` ka zikr badle (CI flow check, git skills `.claude/skills/_shared/git-rules.md`, RULES §2, CLAUDE.md, AGENTS.md, GitHub ruleset, 20 package files ke `tree/main` links, CLI ka release sandesh aur `docs/packages/README.md` §4), phir GitHub default branch badle, aakhir me `main` delete. GitHub default branch delete nahi karne deta, isliye ye kram zaroori. Delete sirf implementation me, owner ke kehne pe (abhi kuch nahi chhua).
  - **Default branch:** salah `release` (repo dekhne wale ko wahi code dikhe jo live hai).
    - **Owner ka jawab (2026-11-17):** **`release`** default branch.
- **Q13c. Teleconsultation, gift cards, store credit:** scope me rahen? Inka kanooni hissa legal matrix me nahi hai. **Salah:** domain expert ke batch tak roko.
  - **Owner ka jawab, teleconsultation (2026-11-17):** **Skin & Hair Expert aur Beauty Advisor dono roles rahenge** (dono Support Desk ka staff, Support Lead ke neeche; code me `backend/identity/src/rbac/roles.ts:181-182`).
    - **Video call:** apna video system nahi. Customer ko **Google Meet ka dummy link** bheja jayega. Koi asli connect nahi karega, par flow poora banega.
    - **Data me nishaan:** consultation hua aur resolve hua, ye data me mark hoga, jo bhi flow bane.
    - **Wajah (owner):** "ye ek complete plan hoga", par asli video ka jhanjhat nahi.
    - **Roles asli hain (owner, 2026-11-17):** dono dummy nahi, hamare apne staff roles: asli accounts, permissions aur flow. Dummy sirf Meet link aur legal wala data (jaise doctor ka registration number, CLAUDE.md ka "legal cheezein dummy data ke saath" niyam).
  - **Flow ke niyam (Claude ki salah, owner ne maani, 2026-11-17):**
    - **Link:** system khud nakli link nahi banata; staff link daale (sirf `https://meet.google.com/...` maana jaye). Demo me dummy link, DUMMY nishaan ke saath. Asli link daalo to wahi flow asli me chal jaye.
    - **Link kaise pahunche:** email aur in-app (SMS/WhatsApp nahi).
    - **Haalat:** request → time tay aur link bheja → consult hua → resolve; saath me cancel aur customer nahi aaya (no-show). Har badlav audit me, customer ko apni request ki haalat dikhe.
    - **Ek hi flow dono ke liye:** Beauty Advisor aur Skin & Hair Expert ka booking flow ek, farak sirf kaun lega aur notes kaun dekhe.
    - **Skin & Hair Expert ke notes:** health data, to sirf expert aur zaroori support roles dekhein, consultation se pehle customer ki consent. Pakka Security Architect batch B15 me.
    - **Legal:** telemedicine ke niyam ki ek dummy row legal matrix me (doctor ka registration number dummy).
  - **Beauty Advisor ka chat (Claude ki salah, owner ne maani, 2026-11-17):** **live chat nahi, message thread.** Customer "Ask a Beauty Advisor" se sawal bheje, advisor jawab me shade aur product ke links bheje. Support desk ke tickets ke upar chhota jod; server so bhi jaye to message nahi khota. Nuksan: jawab turant nahi, thodi der me.
  - **Gift cards aur store credit (Claude ki salah, owner ne maani, 2026-11-17):** **(c) abhi faisla nahi.** Business Analyst + cosmetics domain expert agent pehle inka kanoon (RBI ke prepaid niyam lag sakte hain, jaancha nahi) aur kaam dekhe, phir owner tay kare.
- **Q13d. Camera aur location permission:** try-on aur address pin ke saath badlegi. Ye sirf note hai, faisla nahi chahiye.
  - **Owner (2026-11-17):** note sahi hai. Aaj customer app me camera, microphone aur location band (`frontend/customer/vercel.json:30`); virtual try-on aur address pin bante waqt sirf apni site ke liye kholna (jaise `camera=(self)`).

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

**K** = default ki tarah rakho. **R** = dobara confirm karo. **O** = reopen karo. **→ D-xxx** = owner ka faisla aa gaya (2026-11-17), detail [DECISION_LOG.md](DECISION_LOG.md) me.

**PRD §2** (27 rows; 2 frozen rows evaluation ke bahar):

| Decision | Raay | Ek line wajah |
| --- | --- | --- |
| Sirf beauty aur personal care | K | Focus; catalog model gehra ban sakta hai |
| Business model: house brand + doosre brand sellers | **O** → D-029 ((c) rakha; apna brand ki company baaki) | Sabse bada scope driver: marketplace compliance, settlement, fairness; 1P ya pure marketplace se aadha finance hat'ta hai |
| House brand ek seller account se, koi shortcut nahi | K | Saaf separation of duties (agar hybrid rahe) |
| Sirf brand owners aur authorised distributors | K | Nakli maal ka jokhim kam; trust model saral |
| Saara stock Beautinique warehouse me | **O** → D-016 (rakha) | WMS aur warehouse-state GST ki shart yahin se aati hai (Q6) |
| Delivery sirf Beautinique | **O** → D-016 (rakha, carrier port ke saath) | Fallback nahi, pan-India nahi (Q6) |
| Gig partners, apni gaadi | R → D-029 (rakha) | Upar wale pe nirbhar; state-wise gig compliance |
| Prepaid (Razorpay) ya delivery pe UPI QR; cash nahi | K | Cash handling hat'ta hai; UPI-on-delivery MVP me ho ya nahi, R |
| Launch phases me, Pune se | K | Chhote se shuru karna sahi |
| Sellers poore India se, warehouse-state GSTIN ke saath | R → D-029 (rakha) | Stock wale faisle ka nateeja; onboarding ki rukawat |
| Expansion sirf config se | K (principle), R (gehrai) → D-024 | Lint sasta hai; go-live engine mehenga (Q12) |
| Customers sirf 18+ | R → D-029 (rakha) | Wajah likhi nahi; sign-up me ek step badhta hai |
| Reviews pehli release me | R → D-029 (rakha; R1 me) | MVP tiering ka sawal |
| Foreign investment nahi | K | Isi se hybrid (inventory + marketplace) model mumkin rehta hai [NV: kanooni detail] |
| 11 apps | **O** → D-010 (rakha) | Q2 |
| Saare roles launch se | **O** → D-019 (module ke saath chalu) | Q1, Q7 |
| Docs Hinglish me | K | Owner ke liye |
| Education + portfolio, par production-grade; legal dummy | R → D-013, D-014, D-028 | "Production-grade" ki paribhasha ₹0 infra se takrati hai (Q4) |
| Sirf India, INR, GST invoice | K | Saaf |
| Fully responsive web; delivery PWA; native nahi | K | Rider PWA ki seemaayein (background location, scan) R |
| Pune pehle din poora district | **O** → D-016 (1 hub se) | 21 hubs pehle din (Q6) |
| Agla district kisi bhi order me, team-ready checklist | K → D-017, D-029 | Expansion principle ka hissa |
| Pune network: Chakan + 21 hubs | R → D-016 (pehle din 1 hub) | Dummy data; upar wale pe nirbhar |
| Stock transport: kiraye ke trucks | K → D-030 (kiraye ka transporter, trip record + bill) | Chhota faisla |
| Drug items kabhi nahi | K | Compliance saral; borderline products ke niyam chahiye |
| Head of Operations role | R → D-029 (rakha) | Role catalogue ke saath |
| Plastic EPR lagu (dummy) | K | Kam priority |

**ARCHITECTURE §2:**

| # | Decision | Raay | Ek line wajah |
| --- | --- | --- | --- |
| 1 | Identity, Payments, Notify microservices + Core monolith | R → D-011 (sab alag services) | Identity / notify bane hain, rakho; payments alag process **O** (Q3) |
| 2 | Microservice banne ka rule | K → D-011 (badla) | Rule sahi hai; bundle mode me uska security wala hissa lagu nahi |
| 3 | Kharcha ₹0 | **O** → D-014 (rakha) | Q4; owner ka budget faisla |
| 4 | Render pe bundle mode | K (jab tak ₹0) | #3 ka nateeja |
| 5 | Ek cluster, har deployable ka DB + user, module-prefixed collections | K → D-011 (badla: har service ka alag cluster); owner ka Ok aur D-011 ka takrav Q-007 me | Sasta isolation, cross-module transaction mumkin |
| 6 | Redis source of truth nahi; local Valkey, live Key Value | K | Sabse mazboot principle |
| 7 | Domain nahi; Vercel rewrite se same-origin | **O** → D-014 (domain nahi, rakha) | Domain sasta hai; same-origin rewrite pattern rakho |
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
| Git flow `prerelease` → `release` → `main` + back-merge | R → D-026 (`main` hategi) | 1 se 2 logon ke liye bhaari (Q13) |
| Apna package CLI; packages public par publish nahi | R → D-025 (rakha) | Nivesh vs upyog |
| Saare apps email + password; email code se sign-in nahi | R → D-023 (customer me email code bhi) | PRD se takrav (Q11) |
| Social login sirf customer me (3 providers) | K | Customer ki suvidha |
| Cart / wishlist ke liye sign-in; guest cart nahi | **O** → D-022 (rakha) | Q10 |
| Ek account pe max 50 grants | R → D-019 (owner ke alag accounts) | Technical seema business niyam ban gayi (Q3) |
| Service jagana, jaagta rakhna nahi; previews band | K (jab tak ₹0) → D-014 (badla: baar-baar jagana) | ₹0 ka nateeja |
| Purane data ka import nahi; khaali data se shuru | K | Saaf shuruaat |
| Poore India ka location master pehle din | R → D-024 (data poora, jaanch sirf live district ki) | Q12 |
| `StoragePort`; ordered product archive; ek file ek owner | K | Provider badalna aasaan; order history surakshit |
| Base price sabke liye ek; farak sirf label se | K | Bharosa; dark-pattern ka jokhim kam |
| Internal apps pe har login TOTP; 12 ghante session, 30 min idle | K | Sahi default |

## 10. Sabse bade unknowns (impact ke order me)

| # | Unknown | Kyun zaroori | Kya rukta hai |
| --- | --- | --- | --- |
| 1 | **Project ka asli lakshya:** portfolio demo, ya kabhi asli business launch? | Budget, legal (dummy vs asli), scope aur "done" ki paribhasha isi se tay hoti hai | Lagbhag har doosra faisla |
| 2 | **Business model:** hybrid marketplace, 1P inventory-led, ya pure marketplace? Invoice pe supplier kaun? | Finance (TCS / TDS, settlement), seller app, catalog ki ownership, compliance | Finance, sellers, catalog, order model |
| 3 | **Fulfilment model (tay: D-016):** sirf apna warehouse + fleet, ya 3PL / courier / seller-fulfilled bhi? | 2 apps aur roadmap ke sabse bade phases isi se | WMS, logistics, delivery app, serviceability |
| 4 | **MVP ki paribhasha aur phasing (releases tay: D-008; R1 ka scope baaki):** release 1 me kya? "Sab launch pe" rehta hai? | Bina iske koi roadmap ya estimate sach nahi | App ginti, role catalogue, module order |
| 5 | **Budget, hosting tier, uptime ki ummeed, domain (tay: D-014)** | ₹0 ke liye bani complexity rehni hai ya hatni hai | Deployment topology, SLOs, email, backup, staging |
| 6 | **Team capacity aur timeline (tay: D-009):** kitne log, hafte me kitne ghante, koi target date? | Scope ko capacity se milana | MVP ka size |
| 7 | **App topology (tay: D-010, D-019):** 11 apps ya consolidated; launch pe kaunse roles sach me insaan ke paas honge? | Frontend ka kaam aur ops ka bojh | Frontend architecture, RBAC catalogue |
| 8 | **Cosmetics catalog model:** variant axes, batch-wise MRP / expiry, ingredient data, content ka maalik | Search, pricing, inventory, try-on aur product page ke kanooni declarations sab isi pe | Catalog, discovery, inventory, pricing |
| 9 | **Order model:** multi-seller cart ka split (supplier / shipment / invoice), partial cancel / return, exchange | Invoice, reservation aur refund ki neev | Commerce, finance, logistics |
| 10 | **Paise ka flow:** kaun collect karta hai, seller ko kab aur kaise, refunds, store credit / gift card / loyalty ki liability; asli PSP onboarding hoga? | Ledger design aur database ka sawal (Q5) | Payments, finance, compliance |
| 11 | **Virtual try-on:** MVP me hai? Kaunsi technology, kaunsi categories? | PRD ka mukhya differentiator par design zero | Catalog shade data, media, privacy consent |
| 12 | **Returns policy:** cosmetics me opened / hygiene items, window, kharcha kiska | Reverse logistics, refund aur fraud | Logistics, finance, support |
| 13 | **Scale targets:** SKUs, sellers, orders/din, concurrent users (launch aur 12 mahine) | Capacity design; aaj koi number nahi | DB sizing, search, queue design |
| 14 | **Compliance ki gehrai (teleconsult: D-027; gift cards B11 me):** kaunsi cheezein dummy rahengi, kaunsi asli; teleconsult aur gift cards ka kanooni darja | Scope aur jokhim | Governance, finance, support modules |
| 15 | **Purane repos ke assets** (try-on packages, purane apps): reuse ya chhodna? | PRD unhe "Hai" ginta hai; is repo me nahi hain | Try-on, seller app, estimates |

## Change log

| Version | Date | Badlav |
| ------- | ---------- | ------ |
| v0.1 | 2026-11-17 | Pehla draft: stack, structure, built vs planned, architecture, reference patterns, critical review (Q1 se Q13), gaps, scalability, decisions pe raay, 15 unknowns. |
| v0.2 | 2026-11-17 | Owner ke jawab: §6 me har sawal ki "Jawab" line, §9 ki raay pe faisle ke pointer (D-008 se D-027), §10 me tay hue unknowns. |
