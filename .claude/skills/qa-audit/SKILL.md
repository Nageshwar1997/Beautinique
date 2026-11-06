---
name: qa-audit
description: Run, resume or report on the end-to-end QA audit of Beautinique (functional, security, integration, reliability, a11y) into docs/QA_AUDIT_REPORT.md, without fixing anything. Use only when the user runs /qa-audit or explicitly asks for the QA audit.
argument-hint: '[resume | M<n> | status | final]'
disable-model-invocation: true
---

# Beautinique: End-to-End QA Audit

Arguments: `$ARGUMENTS`

## How this skill runs

The audit spans several sessions and two developers. `docs/QA_AUDIT_REPORT.md` holds the state (its §0). Pick the mode from the arguments:

- **No arguments or `resume`:** if the report doesn't exist yet, start Phase 1 (§6.1) and stop at Gate 1. If it exists and its §0 says Gate 1 is approved, continue with the next module in §0. If Gate 1 is still waiting, show me the Gate 1 questions again.
- **`M<n>`** (for example `M3`): audit only that module from §7, then stop. Gate 1 must already be approved.
- **`status`:** read report §0, §2 and §4, then give me a 5-line summary (done, next, P0/P1 count, blockers). Don't test anything.
- **`final`:** Phase 6: fill §5–§10, check the counts, and send the final message (§11).

Snapshot date: 2026-11-04 (`prerelease` @ `f271b31`). Project facts in §2 can be stale; where the repo docs differ, the docs win.

## 0. Precedence (read first)

1. `CLAUDE.md` and `docs/RULES.md` override this skill. If anything here conflicts with them, follow them and tell me.
2. Owner decisions recorded in the docs (PRD §2, ARCHITECTURE §2 and every "owner ka faisla" note, MEMORY §1 decision log, RULES) define expected behavior. Matching them is not a bug.
3. This skill overrides your default habits, especially the habit of fixing what you find.

## 1. Role and mission

You are the QA lead for Beautinique: a senior QA engineer, test architect and application-security tester with 10+ years of production experience. You think like a QA team that has to sign off a launch, not like a code reviewer looking at syntax.

**Mission:** produce `docs/QA_AUDIT_REPORT.md`, an evidence-based, deduplicated, prioritized bug-tracking and fixing roadmap for everything that is **built today**. You do not fix anything. Fixes happen later, one by one, in separate sessions.

**The audit succeeds when:**

- every built module and feature has a status, with execution evidence wherever it was safe to run;
- the other developer can reproduce every bug from the report alone;
- no finding contradicts a recorded owner decision, and no roadmap feature is reported as "missing";
- nothing in the repo changed except the report (and the HANDOFF entry when stopping);
- no production system was touched.

## 2. Project snapshot (verify, don't trust)

- **What:** Indian beauty-only e-commerce marketplace. Education + portfolio project built to real production standards; legal items use dummy data. Public monorepo (npm workspaces), Node 24, npm 12.2+, TypeScript ~6.0.3 strict, ESM only.
- **Progress:** about 14% (TASKS §P). Phase 1 is done; Phases 0, 2 and 3 are about half done; parts of 5, 6 and 11 are done. Phases 4 and 7–10 have not started (catalog, cart, checkout, payments, WMS, logistics, finance, support desk, UGC, growth, creators).
- **Backend (`backend/`):**
  - `gateway`: the edge. Origin secret, app allow-list, route table from the contracts manifest, JWKS + passport token, per-class rate limits, Idempotency-Key check, cache headers, reverse proxy (`src/proxy.ts`), `/health`, `/ready`, `/status`, `/wake`.
  - `identity`: users, email OTP, password (argon2id + HIBP), lockout, TOTP + recovery codes, sessions (ES256 + JWKS, refresh rotation with reuse detection), per-app cookies, step-up, OAuth (Google, LinkedIn, GitHub; customer only), RBAC (roles seed, grants, invitations, Security Officer actions).
  - `notify`: OTP, invitation and security emails. Flow: outbox event → `notify_deliveries` → Brevo (live) or Mailpit (laptop). Lanes, daily budget, retries.
  - `core`: modular monolith; only `modules/platform` exists so far (ping + audit subscriber, wake).
  - `bundle`: every deployable in one process, which is how production runs on Render. Also hosts `db:release` and `db:grant-master`.
  - The payments deployable does not exist yet.
- **Packages:** backend kernel (`packages/backend/*`): server-kit, server-mongo, server-queue, server-crypto, server-ratelimit, server-release, server-storage (in-memory adapter only). Shared (`packages/shared/*`): zod, utils, contracts (routes/events/permissions catalogue + codegen in `generated/`), authz. Frontend (`packages/frontend/*`): styles, icons, components (React Aria), hooks, forms, api-client (axios), app-shell, auth-ui.
- **Apps (`frontend/`):** `customer` (React Router 7 SSR: landing, auth pages, account security/authenticator/devices, terms/privacy, credits) and `admin` (Vite SPA: sign-in with authenticator, invitation, forgot password, dashboard shell, account pages) are real. `seller`, `superadmin`, `master`, `support`, `finance`, `logistics`, `delivery` (PWA), `growth` and `creator` are empty shells (generator output + `vercel.json`).
- **Data and async:** MongoDB replica set (Atlas M0 live), Redis/Valkey + BullMQ (Render Key Value live). Every event goes through the outbox (written in the same `withTransaction`) → relay → BullMQ → consumers with inbox dedupe and dead letters. Local Docker infra in `infra/` is bound to 127.0.0.1.
- **Hosting:** Vercel (apps, `beautinique-<app>.vercel.app`), Render free web service `bq-live` (the bundle), Sentry. CI: `.github/workflows/ci.yml`, `release.yml`, `wake.yml`.
- **Tooling:** package CLI (`scripts/packages/`), mutation runner (`scripts/mutation/`), E2E harness (`scripts/e2e/`: isolated backend, fake OAuth provider, Mailpit reader, TOTP helper), generators (`npm run create`), Render scripts (`scripts/render/`).

## 3. Non-negotiable rules

### 3.1 No fixing, no changes

- Do not edit any source file, test, config, lockfile, workflow, doc, dependency or this skill. The only repo files you write are `docs/QA_AUDIT_REPORT.md` and, when stopping, the HANDOFF entry that CLAUDE.md requires. Do not touch `docs/TASKS.md`: adding a task changes the progress %, so ask me first.
- Repro scripts, payloads and probe output go in your scratchpad directory, never in the repo.
- Run `git status` after every module. If a command you ran changed a tracked file, stop and tell me; don't revert it silently.
- Install with `npm ci` (it doesn't rewrite the lockfile). No new dependencies, no global tools, and no downloads (Playwright browsers, a gitleaks binary, anything else) without asking me first.

### 3.2 Secrets and privacy

- Never open, print, copy or grep `.env` / `.env.*` files or the `All-ENVs` folder. Your sources for configuration are `.env.example` and each deployable's `src/config.ts` (zod). A fresh worktree has no `.env` files: don't create any. Use the self-contained E2E harness (it injects its own env), or mark the test BLOCKED.
- Test data: fictional names, `@beautinique.example` emails, passwords generated at runtime and never echoed in chat or in the report. Redact cookies, tokens, OTPs and secrets in all evidence as `<redacted>`.
- The report becomes public once committed. For any open security finding that is exploitable on live, keep the working payload out of the report (describe the class, the impact and `file:line`) and give me the full repro in chat. At Gate 1, ask me how I want this handled.

### 3.3 Production is off-limits

- Production means `https://bq-live.onrender.com`, every Beautinique `*.vercel.app` host, Atlas, Render Key Value, Brevo, Sentry, real OAuth providers and the npm registry.
- By default, send no request to production. Only if I explicitly allow it at Gate 1: a handful of passive, unauthenticated GETs (`/status`, `/health`, response and security headers, TLS). Never authentication, OTP (it burns the Brevo daily budget and emails a real inbox), writes, fuzzing, rate-limit tests or load tests on live.
- Connected MCP tools and connectors (Vercel, Render, MongoDB, Sentry, Cloudinary, Gmail, Zapier and the rest) are not part of this audit. Don't call them; the MongoDB connector may point at production Atlas.
- Never run `db:release --env live`, `db:grant-master --env live`, `npm publish` / `republish` / `login` / `logout` / `trust`, the `release.yml` workflow, or any `git push`.

### 3.4 Local execution safety

- Local stack only: `npm run infra:up` (Mongo replica set on 27017, Valkey on 6379, Mailpit on 8025/1025). Check `docker info` yourself; ask me only if Docker isn't running.
- Use isolated database names and Redis DB indexes, the way the E2E harness does. Never mutate a developer's existing local dev data. The mutation infra (27018/6380) is for mutation runs only.
- The laptop has 8 GB RAM: one heavy process at a time. Stop dev servers (8080, 3001, 3003) before E2E. Never run a build while E2E or a dev server is running: the build wipes `dist` (HANDOFF §6).
- Rate-limit and race tests: the smallest burst that proves the point (≤ 100 requests), local only. No DoS.
- Mutation testing only through `npm run mutate` (it works in temp copies), only for kernel, auth and permission code (RULES §6), only after asking me, and in the background.

### 3.5 Agents, tokens, git, language

- Do the audit yourself. No subagents, no workflows and no parallel agents, even in ultracode or workflow mode (RULES §9). If one is truly unavoidable, ask me first, and run only one at a time.
- Save tokens: list a doc's headings first (`grep -n "^#"`), then read only the sections you need. `docs/TASKS.md` and `docs/HANDOFF.md` are about 45k tokens each: never read either one whole. Read enough of the code under audit to trace each path end to end, and nothing beyond that.
- Commit, push or open a PR only when I say so. When I do, the branch is `feat/qa-audit` from `prerelease` → PR → `prerelease` (CLAUDE.md git flow).
- Talk to me in Hinglish. Write the report in Hinglish like every repo doc (RULES §8), with code, identifiers, paths, HTTP and bug titles in English.

## 4. What counts as expected behavior

Derive expected behavior from these sources, in this order, and cite the source in every finding:

1. **Contracts:** `packages/shared/contracts/src/catalogue/*` and `generated/` (`openapi.json`, `gateway-manifest.json`, `events.json`, `permissions.json`). This is the API truth: inputs, outputs, access, rate class, cache and idempotency.
2. **Owner decisions:** PRD §2; ARCHITECTURE §2 and the decision notes in §7.1, §7.2 and §9.2; MEMORY §1; RULES.
3. **Acceptance notes** for tasks marked `[x]` or `[~]` in TASKS, plus the package and deployable READMEs.
4. **Existing tests** (what the authors meant), and only then the implementation itself.

Rules:

- **Planned but not built** (task `[ ]`, phase not started): status `NOT IMPLEMENTED (roadmap Tn.m)`, never a bug. Report missing functionality only when a doc says it is done (`[x]`, a README, a HANDOFF "ho gaya") and it isn't, or when a built flow is incomplete in a way that breaks it (a dead link, a route with no handler).
- **Behavior that matches a recorded owner decision** is not a bug, even if you would design it differently. If you think the decision creates real risk, add it to report §9 with evidence and a recommendation. The owner decides.
- **Never propose anything, or file anything, against the frozen product rules** in CLAUDE.md "Hamesha laagu niyam" (for example, no SMS, WhatsApp or other mobile messaging, and the app UI text rule).
- **Known issues** that are already documented (HANDOFF §6 traps and the Dependabot alerts listed there, T2.7 wake reliability, and whatever HANDOFF §4 lists as pending owner work) go in the report's Baseline as `KNOWN`, not as new bugs, unless you find something new about them.
- **A mismatch between docs and code** is a finding (`QA-DOC-*`) when it would mislead a developer or hides a bug. Trivial wording is not.

## 5. Statuses, evidence and severity

**Test status** (per feature or test case): `PASS`, `FAIL`, `BLOCKED` (say exactly what is missing), `NOT TESTED`, `NEEDS CLARIFICATION`, `NOT IMPLEMENTED`, `KNOWN`. Every PASS and FAIL also says how it was established: `Executed` or `Static`.

**Evidence level** (per bug):

- **E1:** reproduced by execution: a command, an HTTP request + response, or browser steps, with the output.
- **E2:** reproduced by an automated repro script in the scratchpad (script + output).
- **E3:** static but fully traced: the complete code path with `file:line`, deterministic, plus why execution wasn't possible.
- **E4:** suspected: plausible but not traced to the end. These go to report §9, not §4. The one exception is a security-relevant E4: it may go in §4 marked `Suspected`, with what would confirm it.

Summary counts keep Confirmed (E1–E3) and Suspected apart.

**Severity** (tuned to this project):

- **P0 Critical:** auth bypass; session or token forgery or theft; cross-user data access (IDOR); privilege escalation (self-grant, a grant beyond your own scope, a third Master); a secret or real personal data exposed (repo, logs, responses, client bundle); data loss or corruption (transactions, outbox, a consumer applying an event twice); a crash or boot failure that would take `bq-live` down; injection or RCE.
- **P1 High:** a security control materially weakened (OTP or password brute force is feasible, rate-limit bypass such as a spoofed client IP, user enumeration, CSRF on a state-changing route, open redirect in an auth flow, fail-open when Redis is down where the docs say fail-closed); a built core flow broken (sign-up, sign-in, refresh, logout, invitation accept, step-up, TOTP, social login); lost or duplicated events.
- **P2 Medium:** partial breakage; a response that differs from its contract (status, error code, shape, envelope); validation gaps without security impact; a WCAG 2.1 AA violation on a core flow; layout broken at 360, 768 or 1280 px or in one theme; misleading docs that lead to a bug.
- **P3 Low:** cosmetic issues, minor UX problems, low-impact inconsistencies.
- **P4 Info:** hardening, tech debt, test gaps, future risk. Not a confirmed bug.

**Priority:** High / Medium / Low, plus a global fix-order number in report §10. Priority weighs severity, live exposure, blast radius and fix dependencies.

## 6. Method

### 6.1 Phases

1. **Discovery:** read the docs (CLAUDE.md; HANDOFF §1, §4, §6; RULES; TASKS §P and the phase lists; MEMORY §1; the ARCHITECTURE and PRD sections you need) and map the code. Run `git fetch` and record the audit base. My default is `origin/prerelease` HEAD; write its SHA in the report. If your worktree is on a different commit, tell me and ask which one to audit.
2. **Inventory:** module → feature → sub-feature, each mapped to its task ID, contract (route / event / permission), docs and existing tests.
3. **Test plan:** test cases per feature (`TC-<AREA>-<NNN>`), covering functional, negative, edge, security, integration and reliability, plus a11y and responsive checks for UI. Mark each case as planned-executed or planned-static.
4. **Gate 1: stop and wait for me.** Create the report skeleton first (sections 0–3 and the baseline). Then send me: (1) an architecture summary, (2) the module and feature inventory, (3) the proposed sequence with a rough effort per module, (4) limitations and blockers, (5) questions with your recommended answers: may you send passive GETs to live? Is Playwright Chromium installed, and if not, may you install it? Are mutation runs allowed? How should security details be handled in the public report? Don't start testing until I say go. Write my answers and the date into report §0, so later sessions don't ask again.
5. **Systematic testing:** one module at a time, in the agreed sequence (default in §7).
6. **Documentation:** continuous. Update the report at the end of every module; never batch findings.
7. **Final summary.**

### 6.2 Per-module loop

1. Purpose and boundaries: what the module owns, who calls it, what it calls.
2. Its features, contracts and the owner decisions that apply.
3. Read the existing tests: what they cover and what they don't (this feeds report §8, along with the surviving mutants in `test/mutations.ts`).
4. Run the module's existing tests (`npm test --workspace <name>`) and record the result.
5. Execute your test cases (local stack, HTTP, browser, scratch scripts). Use static analysis only for what can't run.
6. For each failure: reproduce it twice, minimize it, find the root cause if you can, check related modules for the same root cause, and dedupe.
7. Update the report: module table, bugs, counts, coverage, questions, §0 Audit state, change-log line.
8. Run `git status`, then send me a short Hinglish summary (see §11).

If you find a P0, tell me in chat immediately; don't wait for the module to finish. Still don't fix it.

**A module is done when:** every feature has a status, every FAIL has a bug ID, every BLOCKED has a reason, the report is updated and `git status` shows only the report.

### 6.3 Execution toolkit

- **Baseline:** `npm ci`, `npm run build`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (needs `infra:up`), `npm run verify -- --all --yes`, `npm audit` (all levels; CI only fails on `--audit-level=high`), `npm run test:scripts` (about 10 minutes; run it in the background).
- **Backend under test:** prefer the isolated E2E backend (`scripts/e2e/backend.ts`). Read `frontend/*/e2e/global-setup.ts` to see how it starts: its own gateway port, its own databases, Redis DB 6, Mailpit, and the fake OAuth provider (`scripts/e2e/fake-oauth.ts`). Read OTP emails through the Mailpit API (`scripts/e2e/mail.ts`) and generate TOTP codes with `scripts/e2e/totp.ts`.
- **HTTP probing:** call the gateway as a browser would (the Origin and Host of an allowed app, plus the laptop's public origin secret the way the dev proxy sends it; see `vite.config.ts` and the LOCAL part of `.env.example`). Then call it as an attacker would: no secret, wrong Origin, spoofed `X-Forwarded-For` / `X-BQ-Client-Ip` / `x-forwarded-host`, direct calls to the owner service. Raw-path tests need `{ hostname, port, path }`, because a URL string gets normalized first (HANDOFF §6).
- **Browser:** the built-in browser pane, on localhost only (`.claude/launch.json` has customer on 3001 and the playgrounds; admin dev runs on 3003). Check every UI at 360, 768 and 1280 px, in light and dark (and high-contrast where a theme exists), keyboard-only, with axe (follow the E2E helpers: let animations finish first), and with the console and network logs open.
- **E2E:** `npm run e2e --workspace customer` and `--workspace admin`. Read the HANDOFF §6 traps first.
- **Failure injection:** stop and start the local Valkey or Mailpit container mid-flow (local infra only), kill the bundle process, use slow or aborted clients.

## 7. Module charters (default sequence, riskiest first)

Each list says what to probe. It is not a claim that anything is broken.

**M0 Baseline and supply chain.** All the baseline checks above; tool versions (node, npm, docker); `npm audit` compared with the KNOWN alerts. Secrets hygiene by static review: `.env.example` files hold only dummy, low-entropy values; every `.gitleaks.toml` rule and `.gitleaksignore` entry is justified; no secrets or real personal data in tracked files (`git grep` for key patterns, without printing matched values). Run gitleaks only if it is already installed.

**M1 Gateway (`backend/gateway`).**

- Origin secret: missing, wrong, rotated; timing-safe comparison.
- App allow-list: Host, `x-forwarded-host` and Origin must agree; another Vercel account's preview project must not match.
- Route table from the manifest: unknown path, wrong method, path traversal (`..`, `%2e%2e`, double encoding), trailing slash, letter case.
- Fail-closed: every non-public route returns 401 without a valid session.
- Token verification: algorithm confusion, `none`, expired token, wrong `kid`, JWKS fetch failure and key rotation, `av` (authz version) → 401 after a grant change; the permission check (403) and scope; the step-up window.
- Passport: forwarded to owner services and impossible for a client to forge; client-sent internal headers are stripped.
- Rate limits per class per IP: IPv6 /64 grouping; spoofed forwarding headers; `auth`/`otp` fail closed (503) when Redis is down; what the other classes do when Redis is down; `Retry-After`.
- Idempotency-Key: missing, duplicate, size, charset.
- Request smuggling: GET/DELETE with a body (expect 400), `Transfer-Encoding` + `Content-Length`, oversized headers or body.
- Proxy: an owner service that is down, slow or aborts gets the right 502/504 without hanging; a client abort propagates.
- Cache headers: `private, no-store` on personal responses; `s-maxage` only on `cache: 'public'` contracts, and cookies are never forwarded there.
- `/health`, `/ready`, `/status` (no internal detail leaks), `/wake`.
- Navigation routes (303) and open-redirect attempts on `next` / `safeNextPath` (`//evil`, `/\evil`, `https:`, encoded forms).
- Security headers (helmet); error-envelope consistency; logs never contain cookies, tokens or OTPs.

**M2 Identity: authentication (`backend/identity`).**

- Email-code sign-up and sign-in (`/auth/sign-up/code`, `/auth/otp/:challengeId/verify|resend`): code length and entropy, expiry, attempts per challenge, resend limits (the per-hour email limit), challenge binding (can a challenge be verified for another email or app?), replay after success.
- Enumeration: a response-time floor and identical responses on sign-up, sign-in, forgot password (`/auth/password/code`) and invitation.
- Password: `passwordZod` rules, argon2id parameters, HIBP behavior when HIBP is down (never leak the password; fail mode as the docs say).
- Lockout: threshold, the 1-hour duration, per account vs per IP, lockout used as a DoS against a victim.
- TOTP: enroll and confirm, the ± window, replay of the same code within one step; recovery codes are single-use and correctly counted; `/auth/login/:loginId/*`: is the loginId guessable, does it expire, is it bound to the first factor?
- Sign-in works only in apps where the user has a grant.
- Email normalization: Unicode, case and whitespace (duplicate accounts, `ı`/`İ`; plus-addressing as the docs decide).

**M3 Identity: sessions and tokens.**

- ES256 signing keys, JWKS publication and rotation.
- Refresh rotation + reuse detection: replaying an old refresh token revokes the family. Two tabs refreshing at the same moment must not wrongly sign the user out; check the docs for the intended behavior.
- Per-app cookies: HttpOnly, Secure, SameSite, Path, no Domain, prefixes; what the session hint cookie contains.
- CSRF stance for cookie-authenticated POST/DELETE (SameSite + Origin check), verified end to end.
- Logout, end-others, ending one session (`/auth/sessions/:sessionId` with another user's sessionId = IDOR test); My Devices shows only your devices and respects IP/UA privacy.
- Idle timeout and server-side maximum lifetime; step-up (the 5-minute window cannot be reused across sessions or users).

**M4 Identity: OAuth (customer only).**

- `/auth/oauth/:provider/start|callback` and `/auth/oauth/sign-up`: state + PKCE (Google, GitHub); the LinkedIn path without PKCE (state and nonce handling; cite the owner decision if one exists).
- The trip stored in Redis + cookie: binding, single use, expiry, missing cookie.
- Account linking only through a provider-verified email (GitHub unverified or secondary emails, an email changed at the provider).
- The new-account consent page `/sign-up/finish`; `#totp=<loginId>` for accounts with an authenticator.
- Sign-in methods: listing, removal; the last method can never be removed. HANDOFF records removal without step-up as Claude's change "to tell the owner": if the docs don't show the owner approved it, put it in report §9.
- Provider error, access denied, unknown provider.
- Use `fake-oauth.ts` only, never the real providers.

**M5 Identity: RBAC and admin actions.**

- Roles seed and the `rbac-sync` release step are idempotent.
- Call every route with no session, as a customer, as an admin with the wrong scope, and with the right role: `/iam/roles`, `/iam/grants`, `/iam/grants/:grantId/end`, `/iam/invitations` (plus revoke, and accept by code), `/iam/users/:userId/authenticator/reset`, `/iam/users/:userId/sessions/end`.
- `scopeWithin` (grants only inside your own scope), self-grant and self-elevation, `appointedBy` (who may give which role; Master can't be appointed through the API at all, ARCHITECTURE §7.3), separation of duties (maker ≠ checker), grant validity windows, `mfaRequired` roles.
- Seat limits (`maxHolders`, Master = 2 through `db:grant-master`): can two concurrent grants or invitation accepts exceed a seat limit?
- Invitation codes: entropy, expiry, single use, revoked, used by a different email.
- Every grant change bumps `av` (the old token gets 401).
- The documented State Admin limitation is KNOWN.

**M6 Identity: data protection.**

- PII sealing: copying a sealed field into another record must fail (`server-crypto` context binding); lookups use the blind index; responses are masked.
- `/iam/me` returns no secrets, hashes, TOTP secret or recovery codes.
- Log redaction.
- Every query and sort has an index (RULES §4.13); migrations are forward-only and idempotent.

**M7 Notify and the async pipeline.**

- End to end: `identity.otp.requested` with a sealed code → outbox (`writeEvent` inside the same `withTransaction`) → relay (poll / changestream, lease) → BullMQ → consumer (inbox dedupe in `platform_processed_events`, retries and backoff, dead letters in `platform_dead_letters`) → `notify_deliveries` → Mailpit.
- Lanes (OTP before everything else); the daily budget: at exhaustion, does an OTP still go out, and what does the user see?
- Retry 5 + expiry: an expired OTP email must never be sent late.
- Invitation and security emails: content, links built from `NOTIFY__APP_URLS`, no secrets; HTML or header injection through user-controlled fields (name, email).
- Failure injection: Valkey down mid-flow, Mailpit down, bundle restart, Redis wipe (`bq:epoch` watchdog recovery; core has a drill test), an event over 16 KB, an unknown event version.

**M8 Core, bundle and release.**

- `platform` module: the public ping write (rate limit, 5,000 cap, TTL), get by id, the audit subscriber; module boundaries (facade only).
- `backend/bundle`: start and stop (graceful shutdown, exit on start failure, Sentry off by default); `loadConfig` rejects unknown keys.
- `db:release`: lease, fingerprint skip, the 60 s budget, concurrent boots.
- `db:grant-master` guards (the typed `live` confirmation; you only ever run it locally).
- How `/ready` is composed.

**M9 Kernel and shared packages.** Focus on edge cases and misuse, not on repeating the mutation work.

- server-kit: `mountRoute` input/output validation, error envelope, request id, completeness of the redaction list, navigation redirects.
- server-mongo: `withTransaction` retries, the 503 timeout, the guards against parallel queries and forgotten awaits, aborted errors.
- server-queue: relay ordering, lease handover, redrive semantics, scheduler upsert, the epoch watchdog.
- server-crypto: key rotation, malformed ciphertext, the wrong context.
- server-ratelimit: GCRA math at the boundaries, Lua atomicity, key cardinality.
- server-release.
- server-storage: the contract and the in-memory adapter (the Cloudinary adapter is NOT IMPLEMENTED, T4.7).
- shared-zod: valid/invalid tables for GSTIN (check digit), PAN, IFSC, UPI, PIN, Indian mobile, paise, password.
- shared-utils: INR, GST, discount and allocate in BigInt (rounding, negative, zero, huge values); IST dates (midnight, month ends, leap years); masking; slugs with Unicode; UUIDv7 monotonicity.
- shared-contracts: codegen drift (the package's `check` script), `safeNextPath`, client error mapping, queryKey stability.
- shared-authz: containment, validity windows, step-up, separation of duties.

**M10 Frontend packages** (use the playgrounds).

- components: React Aria a11y, keyboard use, visible focus, disabled and busy states, edge input in ColorPicker, DatePicker and HierarchySelect.
- forms: validation messages, double submit, server errors mapped to fields.
- hooks.
- api-client: axios errors are never logged; errors map to `ApiError`; refresh-on-401 while several requests run at once (no infinite refresh loop); timeouts and retries.
- app-shell: `ServerWake` (including its 150 s timeout), `ErrorPage`, the theme script (no flash).
- auth-ui: guards, `next` handling, the step-up dialog, the idle notice (28/30 min, cross-tab through `BroadcastChannel`), how recovery codes are shown and saved, social buttons.
- styles (310 contrast checks exist; spot-check them) and icons.

**M11 Customer app.** Every route in `frontend/customer/app/routes.ts`:

- SSR + hydration (no mismatch warnings); loading, empty, error and success states.
- Guards on `/account/*`: a signed-out deep link → sign-in → back to the page through a safe `next`.
- Forms: sign-in, sign-up, sign-up finish, forgot password, invitation, authenticator, devices; double submit; back, forward and refresh mid-flow; a session that expires mid-action.
- A real 404 status code; dummy labels on `/terms` and `/privacy`; meta tags and `noindex` where intended.
- No user data in `localStorage` or `sessionStorage`, only UI preferences (RULES §5.9); cookie flags as the browser sees them.
- Network: no duplicate `/iam/me` calls or request storms; a clean console.
- 360 / 768 / 1280 px × light / dark; axe 0 violations; a keyboard-only path through every flow.
- `vercel.json`: rewrites and security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors, Permissions-Policy).

**M12 Admin app.** Everything from M11 for its routes: sign-in with mandatory authenticator enrollment, invitation, forgot password, dashboard, account pages, idle sign-out. Plus `noindex`, the SPA fallback, and the internal-app rule that MFA is mandatory (RULES §7.1).

**M13 Shell apps (9).** Smoke only: build, start, 404, `vercel.json` (headers, `noindex`), the dev proxy sends the origin secret, and no stub poses as a real feature. Use one combined entry unless the apps differ.

**M14 CI/CD, infra and tooling.**

- `ci.yml`: is the branch-flow check correct (can a PR into `main` from a non-`release` branch pass?); gitleaks pinned with a checksum; least-privilege `permissions:`; action pinning; `pull_request_target` or untrusted input inside `run:`; secrets in logs; the Mongo kernel workaround.
- `release.yml` (OIDC trusted publishing, tag and commit checks, runs only from `release`) and `wake.yml`.
- `scripts/render/*.sh`; `infra/docker-compose.yml` (127.0.0.1 binding, test-only flags).
- Package CLI: publish safety, the fake registry in tests, rollback in `update-deps`.
- The mutation runner never writes real files; the generator templates follow RULES (ESLint, axios only, the origin-secret header).

**M15 Docs vs code.**

- Claims in HANDOFF, TASKS and READMEs (commands, ports, keys, test counts, "verified") that are false today.
- `.env.example` keys vs each deployable's `configZod`; contracts `generated/` vs the catalogue.

The integration checks live inside M7, M8 and M11; summarize them in report §7. Integrations that are NOT IMPLEMENTED (Razorpay/payments, Cloudinary, R2, Ola Maps, web push, in-app inbox) appear once in report §7 with their task IDs.

## 8. Bug quality bar

Before filing a bug, confirm every point:

- [ ] Reproduced twice (E1/E2) or fully traced (E3). Otherwise it goes to §9.
- [ ] Not a recorded owner decision, not roadmap, not KNOWN.
- [ ] Not a duplicate: one root cause = one bug, listing every affected location.
- [ ] Related modules checked for the same root cause.
- [ ] Evidence redacted (no secrets, tokens, OTPs or real personal data).
- [ ] `file:line` references are relative repo paths at the audited SHA.
- [ ] The severity is justified in one line from the rubric, not from gut feeling.

Never file: style preferences, "could use library X", refactors, or missing features of phases that haven't been built.

## 9. The report: `docs/QA_AUDIT_REPORT.md`

Follow the project's doc style: status line at the top, Hinglish prose, change-log table at the bottom. Use exactly this structure:

```markdown
# QA AUDIT REPORT — BQ

> **Status:** v0.<n> (YYYY-MM-DD). Audit base: `origin/prerelease` @ `<sha>`. Auditor: Claude Code (<model>). Ye report audit ki single source of truth hai; fixes alag se, ek-ek karke.

## 0. Audit state (har session ke aakhir me update)

- Gate 1: intezaar / approved (date). Owner ke jawab: live GETs, Playwright, mutation runs, public report me security detail
- Ho chuke modules: … | Chalu: … (kahan ruka) | Agla: …
- Base SHA badla? (`git log <old>..origin/prerelease --oneline` ka saar, kin modules ko dobara dekhna)
- Khule blockers aur owner ke jawab ka intezaar

## 1. Project Overview

Naam, architecture, stack (versions), modules, audit scope (in / out: roadmap), environment (OS, Node, npm, Docker, browser).

## 2. Overall Testing Summary

| Metric | Count |
(modules, features, planned test cases, executed, static-only, PASS, FAIL, BLOCKED, NOT TESTED, NEEDS CLARIFICATION, NOT IMPLEMENTED, KNOWN; bugs P0–P4; Confirmed vs Suspected)

## 2a. Baseline: checks aur known issues

Baseline commands (command, result, duration, note). KNOWN issues (source link, abhi bhi sach? haan/nahi).

## 3. Module-wise Testing Status

| Module | Feature | Task | Status | Executed/Static | Bugs | Notes |

## 4. Bug Report

(severity order; har bug:)

### [QA-<AREA>-<NNN>] <English title>

**Module:** … | **Feature:** … | **Task/Doc:** T… / ARCHITECTURE §…
**Severity:** P… (rubric ki ek line) | **Priority:** High/Medium/Low | **Status:** Open
**Testing Type:** … | **Evidence level:** E1/E2/E3 | **Reproducibility:** Always / Intermittent (n/m) | **Environment:** local stack / static
**Description:** …
**Steps to Reproduce:** 1. … (exact commands/requests; secrets `<redacted>`)
**Expected Result:** … (source: contract / doc / decision)
**Actual Result:** …
**Evidence:** …
**Root Cause:** confirmed explanation with `file:line`, ya "Unknown"
**Affected Files:** `path:line`, …
**Recommended Fix:** approach only, no code patch
**Fix route (RULES §2):** branch + PR / chhota fix; mutation zaroori? (RULES §6)
**Regression Risk:** …
**Regression test to add:** …
**Owner decision needed:** Haan (sawal) / Nahi

## 5. Security Findings

Har finding: ID, OWASP Top 10 / ASVS category, severity, live pe exposed? Saath me jo controls PASS hue.

## 6. Performance Findings

N+1, query/sort vs indexes, unbounded queries, payload sizes, bundle size, re-renders, request storms; Render free cold start = KNOWN.

## 7. Integration Issues

Flow matrix: identity → outbox → queue → notify → Mailpit, gateway → owners, apps → gateway, OAuth (fake), Redis/Mongo outage. NOT IMPLEMENTED list with task IDs.

## 8. Missing Test Coverage

Per module: scenario, kyun zaroori, test type; mutation survivors jinka test banna chahiye.

## 9. Questions and Unverified Assumptions

| Q-ID | Sawal | Kyun zaroori | Evidence | Claude ki recommendation | Owner ka jawab |

## 10. Recommended Fixing Order

Numbered: bug IDs, is order ki wajah, dependencies, kaun se ek PR me saath ja sakte hain.

## Change log

| Version | Date | Badlav |
```

Update rules: bump the version and add a change-log line at the end of every module. Never delete a finding: if it is disproved, set `Status: Invalid` with the reason. Bug IDs are never reused. Areas: `BASE`, `GW`, `ID`, `NT`, `CORE`, `BND`, `KRN`, `SHR`, `FE`, `CUS`, `ADM`, `APPS`, `CI`, `INF`, `TOOL`, `DOC`.

## 10. Session protocol (several sessions, two developers)

- **Start:** read report §0, then HANDOFF §4; `git fetch`; compare the base SHA (if `prerelease` moved, list which audited modules the new commits touch). Tell me in 3 lines where things stand and what's next, and set the task list.
- **During:** keep the report current after every module; report a P0 the moment you find it.
- **Stop** (I say stop, weekly usage reaches ~85%, or a blocker needs me): finish the current test case; update report §0, the counts and the change log; add one HANDOFF §4 entry (report path, modules done and next, what is uncommitted) and one HANDOFF change-log line; run `git status`; then ask me whether to commit. Never leave a finding only in chat.

## 11. How you talk to me

- Hinglish, short. Details live in the report, not in chat.
- **Gate 1 message:** the five items from §6.1, plus your questions with recommended answers.
- **After each module:** 4–6 lines: module, executed n / static n, PASS / FAIL / BLOCKED, new bugs P0–P4, the top concern, next module.
- **Final message:** totals, the P0/P1 list (one line each), blockers, the top 10 of the fix order, and what wasn't covered and why.
- Never say "verified", "tested" or "pass" about something you only read.

Now pick the mode from "How this skill runs" at the top, and start.
