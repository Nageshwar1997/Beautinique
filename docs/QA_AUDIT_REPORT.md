# QA AUDIT REPORT — BQ

> **Status:** v0.3 (2026-11-04). Audit base: `origin/prerelease` @ `ee7f46a` (`ee7f46ae7b2605d99f6b4497d26303aa109fb371`). Auditor: Claude Code (Opus 5.5, `claude-opus-5-5`). Ye report audit ki single source of truth hai; fixes alag se, ek-ek karke.

## 0. Audit state (har session ke aakhir me update)

- **Gate 1: approved (2026-11-04).** Owner ke jawab (saari recommendations maani):
  - Live pe passive GETs: **haan, kul ≤ 15**, bina auth: `bq-live` `/health`, `/status`, ek anjaan path; customer + admin ka home aur ek 404 (headers, TLS). OTP/auth/write/fuzz/rate-limit/load kabhi nahi.
  - Playwright: Chromium 1248 pehle se installed (Playwright 1.64.1 ki zaroorat yahi); koi download nahi chahiye
  - Mutation runs: **naye runs nahi**; `test/mutations.ts` ke likhe survivors static §8 me. Auth/permission gap mile to sirf us package ka `--only` run, har baar poochh ke.
  - Public report me security detail: **live pe exploitable khule findings redact** (class, impact, severity, `file:line`); poora repro sirf chat me, fix release ke baad report me. Baaki poori detail.
  - Failure injection: **alag throwaway containers** (pehle se downloaded images, `127.0.0.1`, doosre ports, `--rm`); saanjhe Mongo/Valkey/Mailpit kabhi band nahi.
  - **Owner ki do aur hidayatein (2026-11-04):** (1) har feature ko jitna ho sake todne ki koshish (adversarial; phir bhi sirf local, burst ≤ 100, production off-limits). (2) Owner ke "acceptable" faislon pe bhi sawal uthao: rakhne se kya hoga, fix karna chahiye ya nahi. Ye §9 me `DR-<NNN>` (decision review) rows: bug count me nahi, faisla owner ka. CLAUDE.md ke frozen niyam (mobile messaging, app ki bhasha) is se bahar (CLAUDE.md ki precedence).
- **Ho chuke modules:** M0 (2026-11-04) | **Chalu:** koi nahi | **Agla:** M1 Gateway
- **Base SHA:** skill ka snapshot `f271b31` tha; `origin/prerelease` ab `ee7f46a` hai. Beech me sirf `ca61487` (`/qa-audit` skill) + merge `ee7f46a` (PR #53): koi code nahi badla, kisi module ko dobara nahi dekhna. Worktree `prerelease` @ `ee7f46a`, `git status` saaf (report ke alawa).
- **Khule blockers:** koi nahi.
- **Note (local):** `.claude/worktrees/comprehensive-qa-audit-b02e4c` (git ke `info/exclude` me) aur kai `kilo` worktrees laptop pe hain; audit inhe nahi chhoota, aur repo-wide search me `.claude/worktrees` ko bahar rakhta hai (is folder ka asar: QA-TOOL-001).
- **Note (M0, 2026-11-04 14:57:22):** `npm test` ke aakhri hisse me `docs/QA_AUDIT_REPORT.md` git index me **staged** ho gayi (`??` → `A`). Repo ka koi test asli repo me `git` nahi chalata (saare git calls temp fixture repos me: `scripts/mutation/test/mutation.test.ts:141`, `scripts/packages/test/e2e.test.ts:38`, `scripts/packages/test/helpers.ts:61`), aur us waqt sirf identity ke tests chal rahe the (git nahi chhoote). Isliye ye bahar ka kaam lagta hai (IDE/app/doosra tool). Revert nahi kiya; staging se koi tracked file nahi badli.
- **Gitleaks `dir` scan (M0):** working folder ke scan ne laptop ki gitignored `.env`/`.env.production` files bhi padhi (gitleaks ne, Claude ne nahi). Report me sirf path + rule dekhe, values kabhi nahi; JSON report turant mitayi. Aage sirf `gitleaks git` (tracked history) chalega.

## 1. Project Overview

**Naam:** Beautinique (BQ): Indian beauty-only e-commerce marketplace. Education + portfolio project, production standard pe; legal cheezein dummy data ke saath. Public monorepo (npm workspaces), ESM only.

**Architecture (aaj jo bana hai):**

- **Edge:** `backend/gateway`: origin secret (`x-origin-secret`, rotation, timing-safe) → app allow-list (`X-BQ-App` + `x-forwarded-host`/`Host` + `Origin`, Vercel preview pattern) → contracts manifest se route table (41 routes) → rate limit (GCRA, Redis, IP ya IPv6 /64; classes `public` 600/min, `read` 600/min, `write` 20/min, `auth` 30/5 min, `otp` 10/10 min; `auth`/`otp` fail closed) → access (`public` / `signed-in` / `permission`; per-app cookie `__Host-bq_<app>_at`, ES256 + identity ka JWKS, Redis revocation, `av`) → 60 s passport (`X-BQ-Passport`) owner ko → Idempotency-Key → reverse proxy (`src/proxy.ts`, `node:http` stream) → cache headers. `/health`, `/ready`, `/status`, `/wake`, `/.well-known/passport-jwks.json`.
- **Owner services:** `identity` (users, email OTP, password argon2id + HIBP, lockout, TOTP + recovery codes, sessions ES256 + JWKS + refresh rotation + reuse detection, per-app cookies, step-up, OAuth Google/LinkedIn/GitHub sirf customer, RBAC: roles seed, grants, invitations, Security Officer actions), `notify` (outbox event → `notify_deliveries` → Brevo/Mailpit; lanes, daily budget, retries), `core` (modular monolith; sirf `modules/platform`: ping + audit subscriber + wake). Payments deployable abhi nahi (T5.3).
- **Process model:** `backend/bundle` saare deployables ek process me (production Render `bq-live` isi tarah), boot pe release steps (`server-release`: lease, migrations, `syncIndexes`, fingerprint); `db:release`, `db:grant-master`.
- **Async:** har event outbox me (usi `withTransaction` me) → relay (`poll`/`changestream`, lease) → BullMQ → consumer (inbox dedupe `platform_processed_events`, retries, dead letters `platform_dead_letters`); `bq:epoch` watchdog (Redis wipe recovery).
- **Contracts:** `packages/shared/contracts` (catalogue: `platform`, `identity`, `iam`, `social`) → `generated/` (`openapi.json`, `gateway-manifest.json` 41 routes, `events.json` 7 events, `permissions.json` 7 permissions).
- **Apps:** `frontend/customer` (React Router SSR) aur `frontend/admin` (Vite SPA) asli; 9 shell apps (seller, superadmin, master, support, finance, logistics, delivery, growth, creator) generator output + `vercel.json`.
- **Hosting:** Vercel (11 apps, `beautinique-<app>.vercel.app`), Render free `bq-live` (bundle), Atlas M0, Render Key Value, Brevo, Sentry. CI: `ci.yml`, `release.yml`, `wake.yml`.

**Stack (installed versions, `ee7f46a`):** Node 24 (laptop 24.21.0), npm 12.2.0, TypeScript 6.0.3, Express 5.3.0, mongodb driver 7.7.0, bullmq 6.4.0, ioredis 6.0.0, zod 4.6.7, axios 1.21.0, React 19.3.1, react-router 8.5.0 (docs "React Router 7" kehte hain: M15 me dekhna), Vite 8.3.5, react-aria-components 1.22.1, TanStack Query 5.105, Vitest 5.0.5, Playwright 1.64.1, helmet 8.3.0, `@sentry/node` 11.9.0, tsdown 0.23.1, ESLint 10.13.0. Infra images: `mongo:8.0.34` (replica set `rs0`), `valkey/valkey:8.1.10`, `axllent/mailpit:v1.31.6`.

**Code ka size (src lines / test files):** identity 6402 / 10 (+ `mutations.ts`), notify 1593 / 2, gateway 1154 / 1 (+ M), bundle 477 / 4, core 465 / 2; kernel: server-queue 1573, server-kit 895, server-storage 860, server-mongo 639, server-crypto 629, server-release 434, server-ratelimit 185 (sab ke `mutations.ts`); shared: contracts 3015, utils 384, authz 372, zod 205; frontend packages: auth-ui 3366, components 2972, hooks 1655, app-shell 1079, icons 589, forms 459, api-client 388; apps: customer 934 / 7 (+ 3 E2E specs), admin 488 / 3 (+ 2 E2E specs).

**Audit scope:**

- **In:** jo aaj bana hai (upar ka sab), CI/CD, infra, tooling, docs vs code.
- **Out (roadmap, NOT IMPLEMENTED, bug nahi):** Phase 4 (catalog, location, network, expansion, sellers, media/Cloudinary T4.7, support), Phase 7–10 (cart, checkout, payments/Razorpay, WMS, logistics, finance, support desk, UGC, growth, creators, governance, DPDP flows), payments deployable (T5.3), web push + in-app inbox (T5.1), Ola Maps, R2, T3.4–T3.6, T2.6, T2.8, Turborepo (T0.5), affected build (T0.6).
- **Production:** off-limits (skill §3.3); sirf Gate 1 me owner ki ijazat ho to passive GETs.

**Environment:** Windows 11 Home 10.0.26300, 8 GB RAM; Node 24.21.0, npm 12.2.0, git 2.56.0; Docker Desktop 29.8.2 (VM ~2.8 GB), local infra `127.0.0.1` pe (Mongo 27017, Valkey 6379, Mailpit 8025/1025) chalu aur healthy; Playwright 1.64.1 + Chromium 1248 installed; gitleaks 8.30.1 installed; browser: Claude ka built-in browser pane (localhost) + Playwright Chromium. Isolated test data: Mongo DB naam `bq_qa_<run>_*`, Redis DB index 7, emails `@beautinique.example`.

## 2. Overall Testing Summary

| Metric                                 | Count                                      |
| -------------------------------------- | ------------------------------------------ |
| Modules                                | 16 (M0–M15); ho chuke: 1 (M0)              |
| Features (inventory, §3)               | 97                                         |
| Planned test cases                     | 248 (planned-executed 223, planned-static 25) |
| Executed                               | 13                                         |
| Static-only                            | 3                                          |
| PASS                                   | 15                                         |
| FAIL                                   | 1                                          |
| BLOCKED                                | 0                                          |
| NOT TESTED                             | 232                                        |
| NEEDS CLARIFICATION                    | 0                                          |
| NOT IMPLEMENTED (roadmap)              | 10 (§7 list)                               |
| KNOWN                                  | 10 (§2a)                                   |
| Bugs P0 / P1 / P2 / P3 / P4            | 0 / 0 / 0 / 1 / 0                          |
| Confirmed (E1–E3) / Suspected (E4)     | 1 / 0                                      |
| Decision reviews (DR, §9)              | 0                                          |

## 2a. Baseline: checks aur known issues

**Baseline commands (M0, 2026-11-04, Windows laptop, `ee7f46a`):**

| Command                                  | Result      | Duration | Note                                                   |
| ---------------------------------------- | ----------- | -------- | ------------------------------------------------------ |
| `npm ci`                                 | PASS        | 468 s    | lockfile nahi badla; 846 packages; npm 12 ne `msgpackr-extract` ka install script roka (§6) |
| `npm run build`                          | PASS (1/3 FAIL) | 148 s / 105 s | pehla run (`npm ci` ke turant baad): `customer` ka prerender `/terms` 10 s timeout pe fail; customer akela (8 s) aur poora build dobara (105 s, 34 packages) pass. Q-005 |
| `npm run format:check`                   | FAIL        | 36 s     | sirf laptop ki untracked `.claude/worktrees/` ki 6 files; usse bahar sab pass (QA-TOOL-001) |
| `npm run lint`                           | PASS        | 245 s    |                                                        |
| `npm run typecheck`                      | PASS        | 100 s    |                                                        |
| `npm test`                               | PASS        | 827 s    | 1720 tests, 0 fail, 0 skip: scripts 123, kernel 285, shared 151, frontend packages 807, apps 119 (customer 38, admin 18, 9 shells × 7), backend 235 (identity 125, gateway 38, notify 32, bundle 27, core 13) |
| `npm run verify -- --all --yes`          | PASS        | 574 s    | 19 packages "ready to publish", koi warning nahi; publish nahi kiya |
| `npm audit` (saare levels)               | 24 (2 low, 22 moderate, 0 high/critical) | ~5 s | sirf 3 advisories: KNOWN-01, -02, -03; koi naya nahi |
| `npm run test:scripts`                   | PASS        | (`npm test` ke andar) | root `npm test` pehle yahi config chalata hai (9 files, 123 tests); alag nahi chalaya |
| `gitleaks git --config .gitleaks.toml --redact` | PASS (no leaks) | 7 s | 8.30.1 (CI wala version), poori history (208 commits with changes) |

**KNOWN issues (naye bug nahi, jab tak kuch naya na mile):**

| ID        | Issue                                                                                                   | Source                                  | Abhi bhi sach? |
| --------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------- |
| KNOWN-01  | Dependabot `deepmerge` GHSA-gcqx-w48m-w2h4 (low), sirf build tool chain (`vite-plugin-pwa` → `workbox-build`) | HANDOFF §6                              | haan (`npm audit`, M0) |
| KNOWN-02  | Dependabot `glob` GHSA-3g3m-2fjr-6pw4 (moderate), lockfile; fix sirf naye major me (branch `feat/deps-glob-minimatch` origin pe hai) | HANDOFF §6                              | haan (`npm audit`, M0) |
| KNOWN-03  | Dependabot `minimatch` GHSA-g3hv-75wg-m249 (moderate), lockfile                                          | HANDOFF §6                              | haan (`npm audit`, M0) |
| KNOWN-04  | T2.7 wake: GitHub scheduled `wake.yml` bharosemand nahi (2 din me ~18 me se 2 slots); owner ka faisla khula | HANDOFF §4 item 1, TASKS T2.7           | M14 me         |
| KNOWN-05  | Render free cold start (~50–57 s), wake-up screen ke saath                                               | ARCHITECTURE §11.2, HANDOFF §4          | haan (design)  |
| KNOWN-06  | State Admin abhi Seller Account Owner / Pro Buyer nahi de sakta (alag scope type, seller/pro module ke saath) | HANDOFF §4 (T3.3 PR B "Seema")          | M5 me          |
| KNOWN-07  | CI job summary me mutation fixtures ki nakli "Vitest Test Report" ❌ (child env me `GITHUB_STEP_SUMMARY`) | HANDOFF §4 item 8                       | M14 me         |
| KNOWN-08  | MongoDB 8.0 + Linux kernel 6.19+/7.0: compose me `GLIBC_TUNABLES=glibc.pthread.rseq=1` workaround        | HANDOFF §6                              | M14 me         |
| KNOWN-09  | Frontend Sentry abhi kisi app me nahi (owner ka khula kaam)                                              | HANDOFF §4 item 4                       | haan           |
| KNOWN-10  | TypeScript ~6.0.3 hold (typescript-eslint <6.1); `server-queue` "skips an event delivered again" CI flake ka fix GitHub pe dobara dekhna baaki | HANDOFF §6                              | TS hold haan (installed 6.0.3); laptop pe server-queue 55/55 pass, CI wala hissa M14 me |

## 3. Module-wise Testing Status

Abhi sab `NOT TESTED` (Gate 1). Status ke saath `Executed`/`Static` module ke baad bharega.

| Module | Feature | Task | Status | Executed/Static | Bugs | Notes |
| ------ | ------- | ---- | ------ | --------------- | ---- | ----- |
| M0 Baseline | Build, format, lint, typecheck, tests, verify | T0.6, T1.7 | FAIL | Executed | QA-TOOL-001 | build 1/3 flaky (Q-005); format:check sirf `.claude/worktrees` pe fail; baaki PASS, 1720 tests green |
| M0 Baseline | `npm audit` vs KNOWN alerts | T0.6 | PASS | Executed | | sirf KNOWN-01..03, koi high/critical nahi |
| M0 Baseline | Secrets hygiene (`.env.example`, gitleaks rules/ignore, `git grep`) | T0.6, RULES §2.4 | PASS | Executed + Static | | history me koi leak nahi; `.env.example` sirf dummy; live config me laptop ki dummy values ka koi guard hai ya nahi: M1/M6 me |
| M0 Baseline | Package CLI tests (`test:scripts`) | T0.1 | PASS | Executed | | `npm test` ke andar, 123 tests |
| M1 Gateway | Origin secret (missing, wrong, rotation, timing-safe) | T2.2 | NOT TESTED | | | |
| M1 Gateway | App allow-list (`X-BQ-App`, Host, `x-forwarded-host`, Origin, Vercel previews) | T2.1 | NOT TESTED | | | |
| M1 Gateway | Route table (unknown path/method, traversal, encoding, case, slash) | T2.1 | NOT TESTED | | | |
| M1 Gateway | Access fail-closed (401 on every non-public route) | T2.2 | NOT TESTED | | | |
| M1 Gateway | Token verification (alg, kid, exp, aud, JWKS failure/rotation, revocation, `av`) | T2.2, T3.2, T3.3 | NOT TESTED | | | |
| M1 Gateway | Passport + internal header stripping, `clientIp()` | T2.2 | NOT TESTED | | | |
| M1 Gateway | Rate limits per class, IPv6 /64, Redis down (fail closed/open) | T2.3 | NOT TESTED | | | |
| M1 Gateway | Idempotency-Key validation | T2.3 | NOT TESTED | | | |
| M1 Gateway | Request smuggling, body on GET/DELETE, oversized headers/body | T2.1 | NOT TESTED | | | |
| M1 Gateway | Proxy: owner down/slow/abort, client abort | T2.1 | NOT TESTED | | | |
| M1 Gateway | Cache headers | T2.3 | NOT TESTED | | | |
| M1 Gateway | `/health`, `/ready`, `/status`, `/wake`, passport JWKS | T2.4, T2.7 | NOT TESTED | | | |
| M1 Gateway | Navigation routes (303) + open redirect | T3.1 PR 4 | NOT TESTED | | | |
| M1 Gateway | Security headers, error envelope, log hygiene | T2.3 | NOT TESTED | | | |
| M2 Identity auth | Email-code sign-up / OTP verify / resend | T3.1 | NOT TESTED | | | |
| M2 Identity auth | Enumeration (time floor, same responses) | T3.1 | NOT TESTED | | | |
| M2 Identity auth | Password rules, argon2id, HIBP down | T3.1 | NOT TESTED | | | |
| M2 Identity auth | Forgot password (`/auth/password/code`) | T3.1 | NOT TESTED | | | |
| M2 Identity auth | Lockout (threshold, 1 h, DoS) | T3.1 | NOT TESTED | | | |
| M2 Identity auth | Login second factor (`/auth/login/:loginId/*`: TOTP, recovery, enroll) | T3.1 | NOT TESTED | | | |
| M2 Identity auth | Sign-in sirf grant wale app me | T3.3 | NOT TESTED | | | |
| M2 Identity auth | Email normalization | T3.1 | NOT TESTED | | | |
| M2 Identity auth | Input validation + error envelope | T3.1 | NOT TESTED | | | |
| M3 Sessions | ES256 keys, JWKS, rotation | T3.2 | NOT TESTED | | | |
| M3 Sessions | Refresh rotation + reuse detection + concurrent tabs | T3.2 | NOT TESTED | | | |
| M3 Sessions | Per-app cookies (flags, prefix, hint cookie) | T3.2, TASKS C.1 | NOT TESTED | | | |
| M3 Sessions | CSRF stance (SameSite + Origin) | T3.2 | NOT TESTED | | | |
| M3 Sessions | Logout, end-others, end one session (IDOR) | T3.2 | NOT TESTED | | | |
| M3 Sessions | My Devices (privacy) | T3.2 | NOT TESTED | | | |
| M3 Sessions | Idle timeout, max lifetime | T3.2 | NOT TESTED | | | |
| M3 Sessions | Step-up (5 min window, binding) | T3.3 PR C | NOT TESTED | | | |
| M3 Sessions | Signed-in authenticator (enroll, confirm, new codes, disable) | T3.1 (PR #38) | NOT TESTED | | | |
| M4 OAuth | Providers list, start (state, PKCE, LinkedIn no-PKCE) | T3.1 PR 4 | NOT TESTED | | | |
| M4 OAuth | Callback (trip binding, single use, expiry, missing cookie) | T3.1 PR 4 | NOT TESTED | | | |
| M4 OAuth | Account linking (verified email only) | T3.1 PR 4 | NOT TESTED | | | |
| M4 OAuth | New-account consent (`/auth/oauth/sign-up`, `/sign-up/finish`) | T3.1 PR 4 | NOT TESTED | | | |
| M4 OAuth | `#totp=<loginId>` for authenticator accounts | T3.1 PR 4 | NOT TESTED | | | |
| M4 OAuth | Sign-in methods remove (last method, step-up decision) | T3.1 PR 4 | NOT TESTED | | | |
| M4 OAuth | Provider errors, unknown provider, non-customer app | T3.1 PR 4 | NOT TESTED | | | |
| M5 RBAC | Roles seed + `rbac-sync` idempotent | T3.3 | NOT TESTED | | | |
| M5 RBAC | Route × actor matrix (13 `iam`/permission routes) | T3.3 | NOT TESTED | | | |
| M5 RBAC | `scopeWithin`, self-grant, `appointedBy`, Master via API | T3.3 | NOT TESTED | | | |
| M5 RBAC | Separation of duties, validity windows, `mfaRequired` | T3.3 | NOT TESTED | | | |
| M5 RBAC | Seat limits (`maxHolders`, race) + `db:grant-master` max 2 | T3.3 | NOT TESTED | | | |
| M5 RBAC | Invitations (create, list, revoke, accept by code) | T3.3 PR B | NOT TESTED | | | |
| M5 RBAC | `av` bump on every grant change | T3.3 PR B | NOT TESTED | | | |
| M5 RBAC | Security Officer: authenticator reset, end user sessions | T3.3 PR C | NOT TESTED | | | |
| M5 RBAC | Roles create/patch (`iam.role.manage`) | T3.3 | NOT TESTED | | | |
| M5 RBAC | State Admin limitation | T3.3 | KNOWN | Static | | KNOWN-06 |
| M6 Data protection | PII sealing (context binding), blind index, masking | T1.4, T3.1 | NOT TESTED | | | |
| M6 Data protection | `/iam/me` me secrets nahi | T3.1 | NOT TESTED | | | |
| M6 Data protection | Log redaction (identity flows) | T1.1, RULES §7.2 | NOT TESTED | | | |
| M6 Data protection | Indexes for every query/sort; migrations | T2.5, RULES §4.13–4.14 | NOT TESTED | | | |
| M7 Notify/async | OTP email end-to-end (outbox → relay → queue → consumer → Mailpit) | T3.1 PR 1, T1.3 | NOT TESTED | | | |
| M7 Notify/async | Inbox dedupe, retries, dead letters | T1.3 | NOT TESTED | | | |
| M7 Notify/async | Lanes, daily budget, retry 5 + expiry | T5.2 | NOT TESTED | | | |
| M7 Notify/async | Invitation + security emails (content, links, injection) | T3.3 PR B, T3.1 | NOT TESTED | | | |
| M7 Notify/async | Failure injection (Valkey, Mailpit, restart, Redis wipe, big/unknown event) | T1.3 | NOT TESTED | | | |
| M8 Core | `platform` ping write (rate, cap, TTL), get by id, audit subscriber | M1 milestone | NOT TESTED | | | |
| M8 Core | Module boundaries (facade) | RULES §4.2 | NOT TESTED | | | |
| M8 Bundle | Start/stop, exit on start failure, Sentry off, `loadConfig` unknown keys | T2.5, T2.3 | NOT TESTED | | | |
| M8 Bundle | `db:release` (lease, fingerprint, 60 s, concurrent boots) | T2.5 | NOT TESTED | | | |
| M8 Bundle | `db:grant-master` guards (local only) | T3.3 | NOT TESTED | | | |
| M8 Bundle | `/ready` composition | T2.4 | NOT TESTED | | | |
| M9 Kernel | server-kit (`mountRoute`, envelope, request id, redaction, navigation) | T1.1 | NOT TESTED | | | |
| M9 Kernel | server-mongo (`withTransaction` retries, timeout, guards) | T1.2 | NOT TESTED | | | |
| M9 Kernel | server-queue (relay, lease, redrive, scheduler, epoch) | T1.3 | NOT TESTED | | | |
| M9 Kernel | server-crypto (rotation, malformed, context) | T1.4 | NOT TESTED | | | |
| M9 Kernel | server-ratelimit (GCRA, Lua, cardinality) | T2.3 | NOT TESTED | | | |
| M9 Kernel | server-release, server-storage (in-memory adapter) | T2.5, T1.6 | NOT TESTED | | | Cloudinary adapter NOT IMPLEMENTED (T4.7) |
| M9 Shared | shared-zod validators (GSTIN, PAN, IFSC, UPI, PIN, mobile, paise, password) | T1.5 | NOT TESTED | | | |
| M9 Shared | shared-utils (money BigInt, IST dates, masking, slugs, UUIDv7) | T1.5 | NOT TESTED | | | |
| M9 Shared | shared-contracts (codegen drift, `safeNextPath`, error mapping, queryKey) | T1.5 | NOT TESTED | | | |
| M9 Shared | shared-authz (containment, windows, step-up, SoD) | T1.6 | NOT TESTED | | | |
| M10 Frontend pkgs | components (a11y, keyboard, pickers edge input) | T6.1 | NOT TESTED | | | |
| M10 Frontend pkgs | forms, hooks | T6.1 | NOT TESTED | | | |
| M10 Frontend pkgs | api-client (errors, refresh-on-401 concurrency, timeouts) | T6.1 | NOT TESTED | | | |
| M10 Frontend pkgs | app-shell (`ServerWake`, `ErrorPage`, theme script) | T6.1, T2.7 | NOT TESTED | | | |
| M10 Frontend pkgs | auth-ui (guards, `next`, step-up dialog, idle notice, recovery codes, social buttons) | T6.1 | NOT TESTED | | | |
| M10 Frontend pkgs | styles contrast, icons | T6.1a | NOT TESTED | | | |
| M11 Customer | Har route: SSR/hydration, states, 404, meta/noindex | T6.1, T6.3 | NOT TESTED | | | |
| M11 Customer | Auth forms + account pages (flows, double submit, mid-flow nav, expiry) | T3.1, T3.2, T6.1 | NOT TESTED | | | |
| M11 Customer | Storage, cookies, network, console | RULES §5.9 | NOT TESTED | | | |
| M11 Customer | Responsive × theme, axe, keyboard | RULES §1.5, §5.5–5.6 | NOT TESTED | | | |
| M11 Customer | `vercel.json` rewrites + security headers; E2E suite | T6.6 | NOT TESTED | | | |
| M12 Admin | Sign-in + mandatory authenticator, invitation, forgot password, dashboard, account, idle sign-out | T6.1, RULES §7.1 | NOT TESTED | | | |
| M12 Admin | `noindex`, SPA fallback, responsive/theme/axe/keyboard, E2E suite | T6.6 | NOT TESTED | | | |
| M13 Shell apps (9) | Build, start, 404, `vercel.json`, dev proxy secret, no fake features | T0.2 | NOT TESTED | | | |
| M14 CI/CD | `ci.yml` (branch flow, gitleaks pin, permissions, pinning, untrusted input) | T0.6, T0.7 | NOT TESTED | | | |
| M14 CI/CD | `release.yml`, `wake.yml` | T0.6, T2.7 | NOT TESTED | | | |
| M14 Infra | `scripts/render/*.sh`, `infra/docker-compose.yml` | T0.8, T11.4 | NOT TESTED | | | |
| M14 Tooling | Package CLI, `update-deps`, mutation runner, generator templates | T0.1 | NOT TESTED | | | |
| M15 Docs | HANDOFF/TASKS/README claims, `.env.example` vs `configZod`, generated vs catalogue | B, RULES §8 | NOT TESTED | | | |

### 3.1 Test plan (Gate 1)

Plan: **E** = planned-executed (local stack, HTTP, browser, scratch script), **S** = planned-static (code/doc trace). Har case ki type: F functional, N negative, Ed edge, Sec security, I integration, R reliability, A11y/Resp UI.

**M0 Baseline (`BASE`, 16)**

| TC | Case | Type | Plan | Result |
| -- | ---- | ---- | ---- | ------ |
| TC-BASE-001 | `npm ci` lockfile ke saath, `git status` saaf rahe | R | E | PASS (Executed): 468 s, lockfile nahi badla |
| TC-BASE-002 | `npm run build` | F | E | PASS (Executed), 1/3 run me customer prerender timeout (Q-005) |
| TC-BASE-003 | `npm run format:check` | F | E | FAIL (Executed): QA-TOOL-001 |
| TC-BASE-004 | `npm run lint` | F | E | PASS (Executed) |
| TC-BASE-005 | `npm run typecheck` | F | E | PASS (Executed) |
| TC-BASE-006 | `npm test` (Mongo + Valkey + Mailpit) | F | E | PASS (Executed): 1720/1720 |
| TC-BASE-007 | `npm run verify -- --all --yes` | F | E | PASS (Executed): 19 packages |
| TC-BASE-008 | `npm audit` saare levels, KNOWN-01..03 se milan | Sec | E | PASS (Executed): sirf KNOWN-01..03 |
| TC-BASE-009 | `npm run test:scripts` (background) | F | E | PASS (Executed, `npm test` ke andar): 123 |
| TC-BASE-010 | Tool versions vs `devEngines` | Ed | E | PASS (Executed): Node 24.21.0 ≥ 24, npm 12.2.0 ≥ 12.2.0; CI bhi Node 24 + npm 12.2.0 |
| TC-BASE-011 | Har `.env.example`: sirf dummy / low-entropy values, `<...>` placeholders | Sec | S | PASS (Static): 7 files; LOCAL me `not-a-secret-…`, `AQEB…`/`AgIC…`/`AAAA…` keys, PRODUCTION me sirf `<...>` |
| TC-BASE-012 | `.gitleaks.toml` ke rules aur `.gitleaksignore` ki har entry ki wajah | Sec | S | PASS (Static): default rules + `url-with-password`; 5 fingerprints, har ek ki wajah aur commit-specific (path allow-list nahi) |
| TC-BASE-013 | gitleaks poori history pe (`--redact`, repo config) | Sec | E | PASS (Executed): no leaks |
| TC-BASE-014 | `git grep` key patterns (private key, AWS, Mongo/Redis URI with password, JWT, Brevo `xkeysib-`, Sentry DSN, Google client secret), values print kiye bina | Sec | E | PASS (Executed): sirf `server-mongo` test ka nakli `127.0.0.1:1` URI (`.gitleaksignore` me); Atlas host sirf `<cluster>` placeholder |
| TC-BASE-015 | Tracked files me asli personal data (emails/phones jo example domain ke nahi) | Sec | E | PASS (Executed): emails `@beautinique.example`, `@example.com`, test fixtures (`k@o1.ingest.sentry.io`, `m1@smtp-relay.mailin.fr`, `a@b.in`); phone sirf `9876543210` |
| TC-BASE-016 | `.gitignore` `.env`/`.env.*` rokta hai, `.env.example` chhodta hai | Sec | S | PASS (Static + `git check-ignore`): laptop ki 4 env files ignored, tracked sirf 7 `.env.example` |

**M1 Gateway (`GW`, 38)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-GW-001 | Origin secret missing → 403 envelope | Sec/N | E |
| TC-GW-002 | Galat secret, khaali, bahut lamba, whitespace → 403 | Sec/N | E |
| TC-GW-003 | Rotation: dono secrets chalte, hataya hua nahi | Sec | E |
| TC-GW-004 | Secret compare timing-safe (length leak bhi) | Sec | S |
| TC-GW-005 | `/health`, `/ready`, `/status`, `/wake` bina secret; baaki sab secret maange | Sec | E |
| TC-GW-006 | `X-BQ-App` anjaan / missing → 403 `APP_NOT_ALLOWED` | Sec/N | E |
| TC-GW-007 | Host, `x-forwarded-host`, Origin me farak → 403 | Sec | E |
| TC-GW-008 | Vercel preview pattern: doosra scope/account, lookalike host, `*.vercel.app` | Sec | E |
| TC-GW-009 | Navigation route pe app sirf host se; app host nahi → 403 | Sec | E |
| TC-GW-010 | Anjaan path → 404, galat method → contract ke hisaab se | N | E |
| TC-GW-011 | Traversal raw path: `..`, `%2e%2e`, `%252e%252e`, `\`, `//`, `;` | Sec | E |
| TC-GW-012 | Trailing slash, letter case, double slash, query edge | Ed | E |
| TC-GW-013 | Har non-public route (manifest loop) bina cookie → 401 | Sec | E |
| TC-GW-014 | Token forgery: `alg: none`, HS256 with public key, galat `kid`, expired, galat `aud` (doosre app ki cookie), tampered payload | Sec | E |
| TC-GW-015 | JWKS fetch fail → 503; anjaan `kid` pe refetch; key rotation | R | E |
| TC-GW-016 | Session/user revoked (Redis) → 401 | Sec | E |
| TC-GW-017 | `av` badla → purana token 401 | Sec | E |
| TC-GW-018 | Permission route: galat permission/scope → 403; step-up wale route bina step-up | Sec | E |
| TC-GW-019 | Client ka `X-BQ-Passport` strip; owner bina/galat passport pe mana; passport `aud`/expiry | Sec | E |
| TC-GW-020 | `x-forwarded-for`, `x-real-ip`, `X-BQ-Client-Ip`, `x-origin-secret` owner tak nahi jaate | Sec | E |
| TC-GW-021 | `clientIp()`: `x-real-ip` sirf sahi secret ke saath; spoofed headers se rate-limit bypass nahi | Sec | E |
| TC-GW-022 | Har class: limit ke baad 429 + `Retry-After` + `RateLimit-*` (chhota burst ≤ 100) | Sec | E |
| TC-GW-023 | IPv6 /64 grouping, IPv4-mapped IPv6 | Sec/Ed | E |
| TC-GW-024 | Redis band: `auth`/`otp` 503, `read`/`write`/`public` docs ke hisaab se | R/Sec | E |
| TC-GW-025 | Idempotency-Key: missing, khaali, 256 chars, non-visible chars | N | E |
| TC-GW-026 | GET/DELETE body ke saath (CL aur TE) → 400 | Sec | E |
| TC-GW-027 | Smuggling: CL + TE dono, `Transfer-Encoding: chunked, identity`, obs-fold | Sec | E |
| TC-GW-028 | Oversized headers / body → 413/431, process zinda | Sec/R | E |
| TC-GW-029 | Owner band → 502; slow → 504 (timeout); client abort owner tak | R | E |
| TC-GW-030 | Cache headers: personal `private, no-store`; `cache: 'public'` contracts pe `s-maxage`, cookies nahi | Sec | E |
| TC-GW-031 | `/health`, `/ready`, `/status`: koi internal detail leak nahi; `/status` 5 s memo | Sec | E |
| TC-GW-032 | `/wake`: 204, `no-store`, CORP cross-origin, kuch nahi chhoota | F | E |
| TC-GW-033 | `/.well-known/passport-jwks.json`: bahar se pahunch, kya leak karta hai | Sec | E |
| TC-GW-034 | Security headers (helmet) har gateway jawab pe | Sec | E |
| TC-GW-035 | Error envelope har gateway error pe ek jaisa | F | E |
| TC-GW-036 | Gateway logs me cookie/token/OTP/secret nahi | Sec | E |
| TC-GW-037 | Navigation 303 + `next` open redirect (`//evil`, `/\evil`, `https:`, encoded) | Sec | E |
| TC-GW-038 | Live passive (sirf ijazat pe): `/health`, `/status`, headers, TLS | Sec | E |

**M2 Identity: authentication (`ID`, 25)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-ID-001 | Sign-up code happy path: Mailpit me email, verify, account bana | F | E |
| TC-ID-002 | Code length/charset/entropy (CSPRNG) | Sec | E |
| TC-ID-003 | Code expiry | Sec | E |
| TC-ID-004 | Ek challenge pe attempts ki seema | Sec | E |
| TC-ID-005 | Resend limits + per-hour email limit | Sec | E |
| TC-ID-006 | Challenge binding: doosre email/app se verify | Sec | E |
| TC-ID-007 | Success ke baad replay | Sec | E |
| TC-ID-008 | Enumeration: sign-up (naya vs maujood email) jawab + samay | Sec | E |
| TC-ID-009 | Enumeration: forgot password | Sec | E |
| TC-ID-010 | Enumeration: login (galat password vs user nahi) jawab + samay | Sec | E |
| TC-ID-011 | Enumeration: invitation code | Sec | E |
| TC-ID-012 | `passwordZod` rules (min 12, max, Unicode) | N | E |
| TC-ID-013 | argon2id parameters | Sec | S |
| TC-ID-014 | HIBP band/slow: password kabhi bahar nahi (k-anonymity), fail mode docs jaisa | Sec/R | E |
| TC-ID-015 | Lockout: threshold, 1 ghanta | Sec | E |
| TC-ID-016 | Lockout per account vs IP; victim pe DoS | Sec | E |
| TC-ID-017 | `loginId`: guessable?, expiry, pehle factor se binding, attempts | Sec | E |
| TC-ID-018 | TOTP login: ± window, ek step me wahi code dobara | Sec | E |
| TC-ID-019 | Recovery code login: single use, ginti | Sec | E |
| TC-ID-020 | Login pe TOTP enroll/confirm (MFA wale apps) | F/Sec | E |
| TC-ID-021 | Sign-in sirf grant wale app me | Sec | E |
| TC-ID-022 | Email normalization: case, whitespace, Unicode (`ı`/`İ`, fullwidth), plus-addressing docs ke hisaab se | Sec/Ed | E |
| TC-ID-023 | Password reset: code → naya password → purane sessions | F/Sec | E |
| TC-ID-024 | Input validation: bade/galat type inputs → 400 envelope | N | E |
| TC-ID-025 | OTP code sealed (outbox/logs me plaintext nahi) | Sec | E |

**M3 Identity: sessions (`ID`, 15)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-ID-026 | ES256 key, JWKS, `kid`, rotation | Sec | E |
| TC-ID-027 | Access token claims (`aud`, `exp`, `sid`, `av`) | Sec | E |
| TC-ID-028 | Refresh rotation; purana refresh dobara → family band + `identity.session.reuseDetected` | Sec | E |
| TC-ID-029 | Do tabs ek saath refresh: docs ka irada | R | E |
| TC-ID-030 | Cookie flags: HttpOnly, Secure, SameSite, Path, Domain nahi, `__Host-` | Sec | E |
| TC-ID-031 | Session hint cookie me kya hai | Sec | E |
| TC-ID-032 | CSRF: cross-site POST/DELETE cookies ke saath | Sec | E |
| TC-ID-033 | Logout: cookies saaf, refresh bekaar, access token Redis me band | Sec | E |
| TC-ID-034 | `end-others` | F | E |
| TC-ID-035 | `DELETE /auth/sessions/:sessionId` doosre user ka id (IDOR) | Sec | E |
| TC-ID-036 | My Devices: sirf apne devices, IP/UA privacy | Sec | E |
| TC-ID-037 | Idle timeout, server-side max lifetime | Sec | E |
| TC-ID-038 | Step-up: 5 min, doosre session/user me nahi chalta; recovery code se step-up | Sec | E |
| TC-ID-039 | Ek app ki cookie doosre app me | Sec | E |
| TC-ID-040 | Password badla / authenticator badla → doosre sessions + security email | Sec | E |

**M4 Identity: OAuth (`ID`, 11)** (sirf `scripts/e2e/fake-oauth.ts`)

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-ID-041 | Providers list (customer), doosre app se | F | E |
| TC-ID-042 | Start: state + PKCE (Google, GitHub); LinkedIn bina PKCE (state/nonce) | Sec | E |
| TC-ID-043 | Callback: state galat, cookie missing, replay, expired trip | Sec | E |
| TC-ID-044 | Trip browser cookie se bandha (doosre browser me callback) | Sec | E |
| TC-ID-045 | Linking sirf verified email; GitHub unverified/secondary; provider pe badla email | Sec | E |
| TC-ID-046 | `/sign-up/finish` consent; sign-up token single use + expiry | Sec | E |
| TC-ID-047 | Authenticator wale account pe `#totp=<loginId>` | F/Sec | E |
| TC-ID-048 | Sign-in method hatana: aakhri nahi hatta; step-up ka faisla (§9) | Sec | E |
| TC-ID-049 | Provider error, `access_denied`, anjaan provider | N | E |
| TC-ID-050 | OAuth ke raaste `next` open redirect | Sec | E |
| TC-ID-051 | Non-customer app se OAuth start | Sec | E |

**M5 Identity: RBAC (`ID`, 15)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-ID-052 | Roles seed + `rbac-sync` do baar → same data | R | E |
| TC-ID-053 | 13 permission/iam routes × (no session, customer, galat scope admin, sahi role) | Sec | E |
| TC-ID-054 | `scopeWithin`: apne scope ke bahar grant mana | Sec | E |
| TC-ID-055 | Self-grant / self-elevation mana | Sec | E |
| TC-ID-056 | `appointedBy`; Master API se kabhi nahi (ARCHITECTURE §7.3) | Sec | E |
| TC-ID-057 | Separation of duties (maker ≠ checker) jahan laagu | Sec | E |
| TC-ID-058 | Grant validity window (shuru se pehle, khatam ke baad) | Sec | E |
| TC-ID-059 | `mfaRequired` roles: bina TOTP ke grant/sign-in | Sec | E |
| TC-ID-060 | Seat limits: parallel grants/accepts (2–20) se `maxHolders` paar? | Sec/R | E |
| TC-ID-061 | `db:grant-master` max 2 (sirf local) | Sec | E |
| TC-ID-062 | Invitation code: entropy, expiry, single use, revoked, doosra email | Sec | E |
| TC-ID-063 | Har grant badlav pe `av` bump → purana token 401 | Sec | E |
| TC-ID-064 | Security Officer: authenticator reset + sessions end (permission, step-up, target) | Sec | E |
| TC-ID-065 | Role create/patch: validation, apne se zyada power wala role? | Sec | E |
| TC-ID-066 | State Admin limitation (KNOWN-06) | — | S |

**M6 Identity: data protection (`ID`, 7)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-ID-067 | Sealed field doosre record me copy → decrypt fail (context binding) | Sec | E |
| TC-ID-068 | Lookups blind index se | Sec | E |
| TC-ID-069 | Jawab me masked values | Sec | E |
| TC-ID-070 | `/iam/me`: hash, TOTP secret, recovery codes, sealed data nahi | Sec | E |
| TC-ID-071 | Identity logs ki redaction (saare flows ke baad log grep) | Sec | E |
| TC-ID-072 | Har query/sort ka index (code + `explain` local) | Perf | E |
| TC-ID-073 | Migrations forward-only + idempotent (do baar chalao) | R | E |

**M7 Notify + async (`NT`, 17)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-NT-001 | OTP: outbox (usi txn me) → relay → BullMQ → consumer → `notify_deliveries` → Mailpit | I | E |
| TC-NT-002 | Relay `poll` aur `changestream`, lease | I/R | E |
| TC-NT-003 | Wahi event do baar → ek hi email (inbox dedupe) | R | E |
| TC-NT-004 | Retries/backoff, dead letter | R | E |
| TC-NT-005 | Lanes: OTP pehle | F | E |
| TC-NT-006 | Daily budget khatam: OTP jaata hai?, user ko kya dikhta hai | R | E |
| TC-NT-007 | Retry 5 + expiry: expired OTP der se nahi jaata | Sec/R | E |
| TC-NT-008 | Invitation email: content, `NOTIFY__APP_URLS` se link | F | E |
| TC-NT-009 | Security emails: content, koi secret nahi | Sec | E |
| TC-NT-010 | Name/email se HTML ya header injection | Sec | E |
| TC-NT-011 | Valkey beech me band | R | E |
| TC-NT-012 | Mailpit band | R | E |
| TC-NT-013 | Bundle restart beech me | R | E |
| TC-NT-014 | Redis wipe (apna prefix + epoch key) → watchdog recovery | R | E |
| TC-NT-015 | Event > 16 KB → `writeEvent` error | Ed | E |
| TC-NT-016 | Anjaan event version → dead letter | R | E |
| TC-NT-017 | Notify logs me OTP/email nahi | Sec | E |

**M8 Core + bundle (`CORE` 6, `BND` 7)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-CORE-001 | `POST /platform/pings` public, `write` limit 20/min | Sec | E |
| TC-CORE-002 | 5,000 cap → 503 `PING_LIMIT_REACHED` | R | E |
| TC-CORE-003 | Pings/audit copies ka TTL index 7 din | R | E |
| TC-CORE-004 | `GET /platform/pings/:pingId`: `platform.ping.read` permission | Sec | E |
| TC-CORE-005 | Audit subscriber copy (event se) | I | E |
| TC-CORE-006 | Module boundaries (sirf facade) | Arch | S |
| TC-BND-001 | Start/stop, graceful shutdown | R | E |
| TC-BND-002 | Start fail → exit (Sentry ke saath bhi) | R | E |
| TC-BND-003 | Sentry DSN na ho to band | F | E |
| TC-BND-004 | `loadConfig` anjaan `<NAME>__` key pe ruk jaata | F | E |
| TC-BND-005 | `db:release`: lease, fingerprint skip, 60 s budget, do boot ek saath | R | E |
| TC-BND-006 | `db:grant-master` guards (`live` likhna; sirf local chalaya) | Sec | E |
| TC-BND-007 | `/ready` ki banawat | F | E |

**M9 Kernel + shared (`KRN` 8, `SHR` 8)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-KRN-001 | server-kit `mountRoute` input/output validation | F/N | E |
| TC-KRN-002 | Error envelope, request id, redaction list kitni poori, navigation redirects | Sec | E |
| TC-KRN-003 | server-mongo `withTransaction`: retries, 503 timeout, parallel/forgotten-await guards, abort | R | E |
| TC-KRN-004 | server-queue: relay order, lease handover, redrive, scheduler upsert, epoch watchdog | R | E |
| TC-KRN-005 | server-crypto: key rotation, malformed ciphertext, galat context | Sec | E |
| TC-KRN-006 | server-ratelimit: GCRA boundaries, Lua atomicity, key cardinality | Sec | E |
| TC-KRN-007 | server-release | R | E |
| TC-KRN-008 | server-storage contract + in-memory adapter | F | E |
| TC-SHR-001 | shared-zod tables: GSTIN (check digit), PAN, IFSC, UPI, PIN, mobile, paise, password | N/Ed | E |
| TC-SHR-002 | shared-utils money BigInt: INR, GST, discount, allocate (rounding, negative, 0, huge) | Ed | E |
| TC-SHR-003 | IST dates: midnight, month end, leap year | Ed | E |
| TC-SHR-004 | Masking, Unicode slugs, UUIDv7 monotonic | Ed | E |
| TC-SHR-005 | Contracts codegen drift (`check` script) | F | E |
| TC-SHR-006 | `safeNextPath` fuzz table | Sec | E |
| TC-SHR-007 | Client error mapping, queryKey stability | F | E |
| TC-SHR-008 | shared-authz: containment, windows, step-up, SoD | Sec | E |

**M10 Frontend packages (`FE`, 16)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-FE-001 | components: keyboard, visible focus, disabled/busy, axe (playground) | A11y | E |
| TC-FE-002 | ColorPicker, DatePicker, HierarchySelect edge input | Ed | E |
| TC-FE-003 | forms: messages, double submit, server error → field | F | E |
| TC-FE-004 | hooks (existing tests + spot) | F | E |
| TC-FE-005 | api-client: axios error log nahi, `ApiError` mapping | Sec | E |
| TC-FE-006 | api-client: kai requests ek saath 401 → ek refresh, loop nahi | R | E |
| TC-FE-007 | api-client: timeouts/retries | R | E |
| TC-FE-008 | app-shell `ServerWake` (150 s timeout samet) | F | E |
| TC-FE-009 | `ErrorPage`, theme script (flash nahi) | F | E |
| TC-FE-010 | auth-ui guards + `next` | Sec | E |
| TC-FE-011 | Step-up dialog | F | E |
| TC-FE-012 | Idle notice 28/30 min, `BroadcastChannel` se cross-tab | F/Sec | E |
| TC-FE-013 | Recovery codes dikhana/save | F | E |
| TC-FE-014 | Social buttons | F | E |
| TC-FE-015 | styles contrast spot-check | A11y | E |
| TC-FE-016 | icons | F | E |

**M11 Customer app (`CUS`, 23)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-CUS-001 | Har route SSR + hydration, mismatch warning nahi | F | E |
| TC-CUS-002 | Loading / empty / error / success states | F | E |
| TC-CUS-003 | `/account/*` guard: signed-out deep link → sign-in → safe `next` se wapas | Sec | E |
| TC-CUS-004 | Sign-in (password, code, TOTP) | F | E |
| TC-CUS-005 | Sign-up | F | E |
| TC-CUS-006 | Sign-up finish (social) | F | E |
| TC-CUS-007 | Forgot password | F | E |
| TC-CUS-008 | Invitation | F | E |
| TC-CUS-009 | Account authenticator page | F | E |
| TC-CUS-010 | Account devices page | F | E |
| TC-CUS-011 | Double submit; back/forward/refresh beech me | Ed | E |
| TC-CUS-012 | Action ke beech session khatam | Ed | E |
| TC-CUS-013 | Asli 404 status | F | E |
| TC-CUS-014 | `/terms`, `/privacy` pe DUMMY label | F | E |
| TC-CUS-015 | Meta tags, `noindex` jahan irada | F | E |
| TC-CUS-016 | `localStorage`/`sessionStorage` me user data nahi | Sec | E |
| TC-CUS-017 | Browser me cookie flags | Sec | E |
| TC-CUS-018 | `/iam/me` duplicate nahi, request storm nahi, console saaf | Perf | E |
| TC-CUS-019 | 360 / 768 / 1280 × light / dark (+ high contrast) | Resp | E |
| TC-CUS-020 | axe 0 violations | A11y | E |
| TC-CUS-021 | Keyboard-only har flow | A11y | E |
| TC-CUS-022 | `vercel.json` rewrites + security headers (CSP, HSTS, nosniff, Referrer-Policy, frame-ancestors, Permissions-Policy) | Sec | S |
| TC-CUS-023 | `npm run e2e --workspace customer` | F | E |

**M12 Admin app (`ADM`, 12)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-ADM-001 | Sign-in + mandatory authenticator enrollment | F/Sec | E |
| TC-ADM-002 | Invitation accept | F | E |
| TC-ADM-003 | Forgot password | F | E |
| TC-ADM-004 | Dashboard shell, nav permission se filter | Sec | E |
| TC-ADM-005 | Account pages | F | E |
| TC-ADM-006 | Idle sign-out | Sec | E |
| TC-ADM-007 | `noindex` | F | E |
| TC-ADM-008 | SPA fallback (`vercel.json`) | F | S |
| TC-ADM-009 | MFA mandatory (RULES §7.1) | Sec | E |
| TC-ADM-010 | Responsive × theme, axe, keyboard | A11y/Resp | E |
| TC-ADM-011 | `npm run e2e --workspace admin` | F | E |
| TC-ADM-012 | `vercel.json` security headers | Sec | S |

**M13 Shell apps (`APPS`, 5)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-APPS-001 | 9 apps ka build | F | E |
| TC-APPS-002 | Start + 404 smoke | F | E |
| TC-APPS-003 | `vercel.json` headers + `noindex` | Sec | S |
| TC-APPS-004 | Dev proxy origin secret bhejta hai | F | S |
| TC-APPS-005 | Koi stub asli feature jaisa nahi dikhta | F | E |

**M14 CI/CD, infra, tooling (`CI` 9, `INF` 2, `TOOL` 4)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-CI-001 | Branch-flow check: non-`release` branch se `main` PR pass ho sakta hai? | Sec | S |
| TC-CI-002 | gitleaks pinned + checksum | Sec | S |
| TC-CI-003 | Least-privilege `permissions:` | Sec | S |
| TC-CI-004 | Action pinning (SHA vs tag) | Sec | S |
| TC-CI-005 | `pull_request_target`, `run:` me untrusted input | Sec | S |
| TC-CI-006 | Logs me secrets | Sec | S |
| TC-CI-007 | Mongo kernel workaround (KNOWN-08) | R | S |
| TC-CI-008 | `release.yml`: OIDC, tag/commit checks, sirf `release` | Sec | S |
| TC-CI-009 | `wake.yml` (KNOWN-04) | R | S |
| TC-INF-001 | `scripts/render/*.sh` | Sec/R | S |
| TC-INF-002 | `docker-compose.yml`: `127.0.0.1` binding, test-only flags | Sec | E |
| TC-TOOL-001 | Package CLI publish safety, tests me fake registry | Sec | S |
| TC-TOOL-002 | `update-deps` rollback | R | S |
| TC-TOOL-003 | Mutation runner asli files nahi likhta | R | S |
| TC-TOOL-004 | Generator templates RULES maante (ESLint, axios, origin secret header) | F | E |

**M15 Docs vs code (`DOC`, 4)**

| TC | Case | Type | Plan |
| -- | ---- | ---- | ---- |
| TC-DOC-001 | HANDOFF, TASKS, READMEs ke claims (commands, ports, keys, test counts, "verified") | Doc | E |
| TC-DOC-002 | `.env.example` keys vs har deployable ka `configZod` | Doc | E |
| TC-DOC-003 | `generated/` vs catalogue | Doc | E |
| TC-DOC-004 | CLAUDE.md/README commands aur ports chalte hain; stack versions (jaise React Router 7 vs installed 8.5.0) | Doc | E |

## 4. Bug Report

### [QA-TOOL-001] format:check fails on a laptop that has a Claude Code worktree under .claude/worktrees

**Module:** M0 Baseline | **Feature:** `npm run format:check` | **Task/Doc:** T0.6, RULES §2.1 (chhota fix se pehle local `format:check`)
**Severity:** P3 (tooling ki low-impact galti: repo ka code theek hai, par local check jhootha fail deta hai) | **Priority:** Low | **Status:** Open
**Testing Type:** Tooling / baseline | **Evidence level:** E1 | **Reproducibility:** Always (jab tak worktree folder hai), 2/2 | **Environment:** Windows laptop, `ee7f46a`
**Description:** Claude Code (desktop) apni worktrees repo ke andar `.claude/worktrees/<name>/` me banata hai; ye folder git se `.git/info/exclude` ke zariye chhupa hai, par `.prettierignore` ke patterns root se bandhe hain (`packages/shared/contracts/generated`, `packages/frontend/styles/src/variables.css` ...). Isliye Prettier worktree ke andar ke generated files (`generated/*.json`, `styles/src/*.css`) bhi jaanchta hai aur `npm run format:check` fail hota hai, jabki repo ki apni har file sahi hai.
**Steps to Reproduce:** 1. Repo ke andar ek Claude Code worktree ho (yahan `.claude/worktrees/comprehensive-qa-audit-b02e4c`, `git worktree list` me dikhta hai). 2. `npm run format:check` → exit 1, "Code style issues found in 6 files" (sab `.claude/worktrees/...` ke). 3. `npx prettier . --check '!.claude/worktrees/**'` → "All matched files use Prettier code style!".
**Expected Result:** `format:check` sirf repo ki tracked files jaanche; local tool folders (git-ignored worktrees) se fail na ho (RULES §2.1: chhote fix se pehle local check bharosemand ho).
**Actual Result:** Exit 1, 6 warnings: `.claude/worktrees/comprehensive-qa-audit-b02e4c/packages/frontend/styles/src/{fonts,variables}.css` aur `.../packages/shared/contracts/generated/{events,gateway-manifest,openapi,permissions}.json`.
**Evidence:** M0 log: `format:check exit=1 s=36`; dobara targeted run me wahi 6 files; worktree ke bina poora repo pass.
**Root Cause:** `.prettierignore:1-16` me `.claude/` (ya `.claude/worktrees/`) nahi hai, aur generated files ke patterns sirf root path pe lagte hain; `.claude/worktrees/` sirf `.git/info/exclude:49` me hai (local, commit nahi).
**Affected Files:** `.prettierignore:1` (aur shayad `.gitignore`: worktree folder sirf local exclude me hai, doosre developer ke clone me nahi)
**Recommended Fix:** `.prettierignore` me `.claude/worktrees/` jodo; chaho to `.gitignore` me bhi, taaki dono developers ke laptops pe ek jaisa rahe. ESLint aur doosre repo-wide tools (jo root se globs lete hain) ke liye bhi wahi check.
**Fix route (RULES §2):** chhota fix (1–2 config files), `prerelease` pe seedha push ho sakta hai; mutation zaroori nahi.
**Regression Risk:** Bahut kam (sirf ignore list).
**Regression test to add:** Koi unit test nahi chahiye; `format:check` ek worktree ke saath laptop pe dobara chalao.
**Owner decision needed:** Nahi

## 5. Security Findings

Abhi koi finding nahi.

## 6. Performance Findings

Render free cold start = KNOWN-05.

- **PERF-OBS-01 (info, bug nahi, M0):** npm 12 `allowScripts` ki wajah se `msgpackr-extract@3.0.4` (bullmq → msgpackr ka native accelerator) ka install script nahi chalta ("install scripts blocked", `npm ci` log). msgpackr tab pure JS pe chalta hai: functionally theek, BullMQ job (de)serialization thoda dheema. Aaj ke load pe asar nagnya; agar queue throughput kabhi maapa jaaye to `allowScripts` me ise jodne ka faisla (supply-chain trade-off).

## 7. Integration Issues

Flow matrix (identity → outbox → queue → notify → Mailpit; gateway → owners; apps → gateway; OAuth (fake); Redis/Mongo outage) M7, M8, M11 ke baad bharega.

**NOT IMPLEMENTED (roadmap, bug nahi):**

| Integration / feature                        | Task         |
| -------------------------------------------- | ------------ |
| Payments deployable, Razorpay (fake driver, webhooks) | T5.3, T7.4 |
| Cloudinary adapter (StoragePort)             | T4.7         |
| R2 log archive                               | T11.4        |
| Ola Maps                                     | T4.3, T8.4   |
| Web push                                     | T5.1         |
| In-app inbox                                 | T5.1         |
| Notify templates, preferences aur consent    | T5.2         |
| API clients (Seller API, Affiliate Partner)  | T3.4         |
| `identity.user.*` / `identity.grant.changed` events + inbox | T3.5 |
| Core kernel (`authorize`, `scopeFilter`, area settings, idempotency store, audit log) | T4.1 |

## 8. Missing Test Coverage

Har module ke baad (existing tests + `test/mutations.ts` ke survivors).

## 9. Questions and Unverified Assumptions

| Q-ID  | Sawal | Kyun zaroori | Evidence | Claude ki recommendation | Owner ka jawab |
| ----- | ----- | ------------ | -------- | ------------------------ | -------------- |
| Q-001 | Live pe passive GETs ki ijazat? | Vercel ke security headers, `vercel.json` rewrite aur Render TLS sirf live pe dikhte hain | skill §3.3 | Haan, kul ≤ 15 GETs, bina auth: `bq-live` `/health`, `/status`, ek anjaan path; customer + admin ka home aur ek 404 (headers, TLS). Soya Render jaag jaayega (free hours ka thoda kharch). Koi OTP/auth/write/fuzz nahi | Recommendation maani (2026-11-04) |
| Q-002 | Mutation runs? | Kernel/auth/permission tests ki taaqat | RULES §6.2 | Naye runs nahi; har package ki `test/mutations.ts` ke likhe survivors §8 me static. Koi auth/permission test gap mile to sirf us package ka `--only` run (`infra:mutation:up`, background), har baar poochh ke | Recommendation maani (2026-11-04) |
| Q-003 | Public report me security detail kaise? | Report commit hote hi public | skill §3.2 | Live pe exploitable khule findings: report me sirf class, impact, severity, `file:line`; poora payload/repro chat me, fix release ke baad report me. Local-only ya fixed findings poore detail ke saath | Recommendation maani (2026-11-04) |
| Q-004 | Failure injection kaise? | Valkey/Mailpit band karna saanjhe local containers pe dev ka kaam rokta hai | skill §3.4, §6.3 | Pehle se downloaded images se alag throwaway containers (`127.0.0.1`, doosre ports, `--rm`) pe audit ka bundle; saanjhe containers kabhi band nahi. Koi download nahi | Recommendation maani (2026-11-04) |
| Q-005 | `npm run build` ka pehla run (taaze `npm ci` ke baad) `customer` pe fail: `Prerender: Request failed for /terms/: The operation was aborted due to timeout`; customer akela aur poora build dobara pass (1/3) | Vercel/CI build bhi har baar thande cache se chalta hai; aisa hua to deploy fail | `@react-router/dev` prerender: 10 s timeout, `retryCount = 0` (`node_modules/@react-router/dev/dist/vite.js:804`), aur user config (`prerender: { paths, concurrency }`) se badla nahi ja sakta; `frontend/customer/react-router.config.ts:7` | Abhi bug nahi (E4, sirf ek baar). Agar CI/Vercel pe dikhe to build CLI me app build ka ek retry, ya upstream issue. Laptop pe lagta hai Windows ka taaza `node_modules` scan wajah thi | — |

## 10. Recommended Fixing Order

1. **QA-TOOL-001** (P3): akela, chhota fix; kisi aur pe nirbhar nahi. Baaki bugs aane pe order dobara banega.

## Change log

| Version | Date       | Badlav                                                                                               |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| v0.1    | 2026-11-04 | Phase 1: report skeleton, overview, 97 features ki inventory, 248 test cases ka plan, baseline aur 10 KNOWN; Gate 1 pe ruka. |
| v0.2    | 2026-11-04 | Gate 1 approved: Q-001…Q-004 pe recommendations maani; owner ki hidayat: adversarial testing + owner faislon ka review (`DR-*`, §9). M0 shuru. |
| v0.3    | 2026-11-04 | M0 Baseline: 13 executed + 3 static, 15 PASS / 1 FAIL; npm test 1720/1720, verify 19 packages, gitleaks history saaf, npm audit sirf KNOWN-01..03. Naya bug QA-TOOL-001 (P3); Q-005 (build flake), PERF-OBS-01. |
