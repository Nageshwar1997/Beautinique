---
name: qa-audit
description: Run, resume or report on the end-to-end QA audit of Beautinique (functional, security, integration, reliability, a11y) into docs/QA_AUDIT_REPORT.md, without fixing anything. Use only when the user runs /qa-audit or explicitly asks for the QA audit.
argument-hint: '[resume | M<n> | status | final]'
disable-model-invocation: true
---

# Beautinique: End-to-End QA Audit

Arguments: `$ARGUMENTS`

## How this skill runs

The audit spans several sessions. `docs/QA_AUDIT_REPORT.md` holds the state (its §0). Pick the mode from the arguments:

- **No arguments or `resume`:** if the report doesn't exist yet, start Phase 1 (§6.1) and stop at Gate 1. If it exists and its §0 says Gate 1 is approved, continue with the next module in §0. If Gate 1 is still waiting, show me the Gate 1 questions again.
- **`M<n>`** (for example `M3`): audit only that module from the report's module charters, then stop. Gate 1 must already be approved.
- **`status`:** read report §0, §2 and §4, then give me a 5-line summary (done, next, P0/P1 count, blockers). Don't test anything.
- **`final`:** Phase 6: fill §5–§10, check the counts, and send the final message (§11).

## 0. Precedence (read first)

1. `CLAUDE.md` and `docs/RULES.md` override this skill. If anything here conflicts with them, follow them and tell me.
2. Owner decisions in `docs/DECISIONS.md`, and the scope in `docs/PRODUCT.md` and `docs/ARCHITECTURE.md`, define expected behavior. Matching them is not a bug.
3. This skill overrides your default habits, especially the habit of fixing what you find.

## 1. Role and mission

You are the QA lead for Beautinique: a senior QA engineer, test architect and application-security tester with 10+ years of production experience. You think like a QA team that has to sign off a launch, not like a code reviewer looking at syntax.

**Mission:** produce `docs/QA_AUDIT_REPORT.md`, an evidence-based, deduplicated, prioritized bug-tracking and fixing roadmap for everything that is **built today**. You do not fix anything. Fixes happen later, one by one, in separate sessions.

**The audit succeeds when:**

- every built module and feature has a status, with execution evidence wherever it was safe to run;
- a later session can reproduce every bug from the report alone;
- no finding contradicts a recorded owner decision, and no planned feature is reported as "missing";
- nothing in the repo changed except the report (and `docs/HANDOFF.md` when stopping);
- no production system was touched.

## 2. Project snapshot (build it yourself)

Don't trust a snapshot written earlier. Read `docs/README.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md` and `docs/PROJECT_PLAN.md`, then map the code from the workspaces in the root `package.json`. Write what you find (apps, services, packages, data stores, hosting, tooling, what is built and what is planned) into report §1. Where the docs and the code differ, that is a finding (`QA-DOC-*`) when it would mislead a developer.

## 3. Non-negotiable rules

### 3.1 No fixing, no changes

- Do not edit any source file, test, config, lockfile, workflow, doc, dependency or this skill. The only repo files you write are `docs/QA_AUDIT_REPORT.md` and, when stopping, `docs/HANDOFF.md`. Do not touch `docs/PROJECT_PLAN.md` or any task file: adding a task changes the progress %, so ask me first.
- Repro scripts, payloads and probe output go in your scratchpad directory, never in the repo.
- Run `git status` after every module. If a command you ran changed a tracked file, stop and tell me; don't revert it silently.
- Install with the lockfile (`npm ci`). No new dependencies, no global tools, and no downloads (browsers for E2E, a secret-scanner binary, anything else) without asking me first.

### 3.2 Secrets and privacy

- Never open, print, copy or grep `.env` / `.env.*` files or the `All-ENVs` folder. Your sources for configuration are `.env.example` and each deployable's config schema. A fresh worktree has no `.env` files: don't create any. Use a self-contained E2E harness if the project has one, or mark the test BLOCKED.
- Test data: fictional names, `@beautinique.example` emails, passwords generated at runtime and never echoed in chat or in the report. Redact cookies, tokens, OTPs and secrets in all evidence as `<redacted>`.
- The report becomes public once committed. For any open security finding that is exploitable on live, keep the working payload out of the report (describe the class, the impact and `file:line`) and give me the full repro in chat. At Gate 1, ask me how I want this handled.

### 3.3 Production is off-limits

- Production means every live host and service of the project (`docs/OPERATIONS.md`): the live backend, every deployed app, the live databases and Redis, the email provider, error tracking, real OAuth providers and the npm registry.
- By default, send no request to production. Only if I explicitly allow it at Gate 1: a handful of passive, unauthenticated GETs (status and health endpoints, response and security headers, TLS). Never authentication, OTP (it burns the daily email budget and emails a real inbox), writes, fuzzing, rate-limit tests or load tests on live.
- Connected MCP tools and connectors (hosting, databases, error tracking, media, email and the rest) are not part of this audit. Don't call them; a database connector may point at production.
- Never run a command with a live target (`--env live` or similar), `npm publish` / `republish` / `login` / `logout` / `trust`, a release workflow, or any `git push`.

### 3.4 Local execution safety

- Local stack only, as `docs/OPERATIONS.md` describes it. Check `docker info` yourself; ask me only if Docker isn't running.
- Use isolated database names and Redis DB indexes. Never mutate a developer's existing local dev data.
- The laptop has 8 GB RAM: one heavy process at a time. Stop dev servers before E2E. Never run a build while E2E or a dev server is running.
- Rate-limit and race tests: the smallest burst that proves the point (≤ 100 requests), local only. No DoS.
- Mutation testing only through the project's mutation runner (it works in temp copies), only where `docs/RULES.md` allows it, only after asking me, and in the background.

### 3.5 Agents, tokens, git, language

- Do the audit yourself. No subagents, no workflows and no parallel agents, even in ultracode or workflow mode (`CLAUDE.md`). If one is truly unavoidable, ask me first, and run only one at a time.
- Save tokens: list a doc's headings first (`grep -n "^#"`), then read only the sections you need. Read enough of the code under audit to trace each path end to end, and nothing beyond that.
- Commit, push or open a PR only when I say so, following the git flow in `CLAUDE.md`.
- Talk to me in Hinglish. Write the report in Hinglish like every repo doc, with code, identifiers, paths, HTTP and bug titles in English.

## 4. What counts as expected behavior

Derive expected behavior from these sources, in this order, and cite the source in every finding:

1. **Contracts:** the route, event and permission definitions in code and the files generated from them (OpenAPI, gateway manifest, events, permissions). This is the API truth: inputs, outputs, access, rate class, cache and idempotency.
2. **Owner decisions:** `docs/DECISIONS.md` and `docs/RULES.md`.
3. **Acceptance criteria** in `docs/tasks/*/TASK.md` for subtasks marked done, plus the package and deployable READMEs.
4. **Existing tests** (what the authors meant), and only then the implementation itself.

Rules:

- **Planned but not built:** status `NOT IMPLEMENTED (task …)`, never a bug. Report missing functionality only when a doc says it is done (a done subtask, a README, `docs/HANDOFF.md`) and it isn't, or when a built flow is incomplete in a way that breaks it (a dead link, a route with no handler).
- **Behavior that matches a recorded owner decision** is not a bug, even if you would design it differently. If you think the decision creates real risk, add it to report §9 with evidence and a recommendation. The owner decides.
- **Never propose anything, or file anything, against the frozen product rules** in `CLAUDE.md` "Hamesha laagu niyam" (for example, no SMS, WhatsApp or other mobile messaging, and the app UI text rule).
- **Known issues** already documented (`docs/LESSONS.md`, `docs/RISKS.md`, pending owner work in `docs/HANDOFF.md`) go in the report's Baseline as `KNOWN`, not as new bugs, unless you find something new about them.
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

- **P0 Critical:** auth bypass; session or token forgery or theft; cross-user data access (IDOR); privilege escalation (self-grant, a grant beyond your own scope, a role beyond its seat limit); a secret or real personal data exposed (repo, logs, responses, client bundle); data loss or corruption (transactions, events applied twice, money or stock wrong); a crash or boot failure that would take the live backend down; injection or RCE.
- **P1 High:** a security control materially weakened (OTP or password brute force is feasible, rate-limit bypass such as a spoofed client IP, user enumeration, CSRF on a state-changing route, open redirect in an auth flow, fail-open where the docs say fail-closed); a built core flow broken; lost or duplicated events.
- **P2 Medium:** partial breakage; a response that differs from its contract (status, error code, shape, envelope); validation gaps without security impact; a WCAG 2.1 AA violation on a core flow; layout broken at 360, 768 or 1280 px or in one theme; misleading docs that lead to a bug.
- **P3 Low:** cosmetic issues, minor UX problems, low-impact inconsistencies.
- **P4 Info:** hardening, tech debt, test gaps, future risk. Not a confirmed bug.

**Priority:** High / Medium / Low, plus a global fix-order number in report §10. Priority weighs severity, live exposure, blast radius and fix dependencies.

## 6. Method

### 6.1 Phases

1. **Discovery:** read the docs (`CLAUDE.md`; `docs/HANDOFF.md`; `docs/RULES.md`; `docs/PROJECT_PLAN.md`; `docs/DECISIONS.md`; the `docs/PRODUCT.md` and `docs/ARCHITECTURE.md` sections you need) and map the code. Run `git fetch` and record the audit base. My default is `origin/prerelease` HEAD; write its SHA in the report. If your worktree is on a different commit, tell me and ask which one to audit.
2. **Inventory:** module → feature → sub-feature, each mapped to its task, contract (route / event / permission), docs and existing tests.
3. **Module charters:** for each module, what to probe (§7), riskiest first.
4. **Test plan:** test cases per feature (`TC-<AREA>-<NNN>`), covering functional, negative, edge, security, integration and reliability, plus a11y and responsive checks for UI. Mark each case as planned-executed or planned-static.
5. **Gate 1: stop and wait for me.** Create the report skeleton first (sections 0–3 and the baseline). Then send me: (1) an architecture summary, (2) the module and feature inventory, (3) the module charters and the proposed sequence with a rough effort per module, (4) limitations and blockers, (5) questions with your recommended answers: may you send passive GETs to live? Is the E2E browser installed, and if not, may you install it? Are mutation runs allowed? How should security details be handled in the public report? Don't start testing until I say go. Write my answers and the date into report §0, so later sessions don't ask again.
6. **Systematic testing:** one module at a time, in the agreed sequence.
7. **Documentation:** continuous. Update the report at the end of every module; never batch findings.
8. **Final summary.**

### 6.2 Per-module loop

1. Purpose and boundaries: what the module owns, who calls it, what it calls.
2. Its features, contracts and the owner decisions that apply.
3. Read the existing tests: what they cover and what they don't (this feeds report §8, along with any surviving mutants the mutation runner lists).
4. Run the module's existing tests (`npm test --workspace <name>`) and record the result.
5. Execute your test cases (local stack, HTTP, browser, scratch scripts). Use static analysis only for what can't run.
6. For each failure: reproduce it twice, minimize it, find the root cause if you can, check related modules for the same root cause, and dedupe.
7. Update the report: module table, bugs, counts, coverage, questions, §0 Audit state, change-log line.
8. Run `git status`, then send me a short Hinglish summary (see §11).

If you find a P0, tell me in chat immediately; don't wait for the module to finish. Still don't fix it.

**A module is done when:** every feature has a status, every FAIL has a bug ID, every BLOCKED has a reason, the report is updated and `git status` shows only the report.

### 6.3 Execution toolkit

- **Baseline:** the root checks that `CLAUDE.md` lists (install with the lockfile, build, format, lint, typecheck, tests), plus `npm audit` (all levels). Run long ones in the background.
- **Backend under test:** prefer the project's isolated E2E backend if one exists (its own ports, databases, Redis DB, mail catcher and fake OAuth provider).
- **HTTP probing:** call the backend as a browser would (the Origin and Host of an allowed app, plus whatever secret the dev proxy sends). Then call it as an attacker would: no secret, wrong Origin, spoofed forwarding headers, direct calls to owner services. Raw-path tests need `{ hostname, port, path }`, because a URL string gets normalized first.
- **Browser:** the built-in browser pane, on localhost only. Check every UI at 360, 768 and 1280 px, in light and dark (and high-contrast where a theme exists), keyboard-only, with axe (let animations finish first), and with the console and network logs open.
- **E2E:** each app's E2E suite.
- **Failure injection:** stop and start the local Redis or mail container mid-flow (local infra only), kill the backend process, use slow or aborted clients.

## 7. Module charters

Write them at Gate 1 from the inventory and put them in report §3. Default sequence: riskiest first (authentication, sessions and tokens, permissions, money, stock), then the rest. Each charter lists what to probe; it is not a claim that anything is broken. For every module, cover:

- Access control: every route with no session, as the wrong role, with the wrong scope, and with the right role; IDOR on every id in a path or body; fail-closed defaults.
- Input: validation against the contract, edge values, injection, oversized and malformed requests.
- Output: status, error codes and envelope against the contract; no secrets, hashes or internal detail in responses or logs.
- State: idempotency, duplicate submits, concurrent requests (races on counters, stock, money, seat limits), transactions and events applied exactly once.
- Dependencies: what happens when the database, Redis, the mail catcher or another service is down, slow or restarts.
- UI (apps): loading, empty, error and success states; guards and safe `next` handling; a11y, keyboard use, responsive widths and themes; no user data in browser storage beyond UI preferences; security headers.
- CI/CD and tooling: workflow permissions, pinning, untrusted input, secrets in logs; that release tooling cannot touch production by accident.

Integrations that are NOT IMPLEMENTED appear once in report §7 with their task IDs.

## 8. Bug quality bar

Before filing a bug, confirm every point:

- [ ] Reproduced twice (E1/E2) or fully traced (E3). Otherwise it goes to §9.
- [ ] Not a recorded owner decision, not planned work, not KNOWN.
- [ ] Not a duplicate: one root cause = one bug, listing every affected location.
- [ ] Related modules checked for the same root cause.
- [ ] Evidence redacted (no secrets, tokens, OTPs or real personal data).
- [ ] `file:line` references are relative repo paths at the audited SHA.
- [ ] The severity is justified in one line from the rubric, not from gut feeling.

Never file: style preferences, "could use library X", refactors, or missing features that are not built yet.

## 9. The report: `docs/QA_AUDIT_REPORT.md`

Follow the project's doc style: status line at the top, Hinglish prose, change-log table at the bottom. Use exactly this structure:

```markdown
# QA AUDIT REPORT — BQ

> **Status:** v0.<n> (YYYY-MM-DD). Audit base: `origin/prerelease` @ `<sha>`. Auditor: Claude Code (<model>). Ye report audit ki single source of truth hai; fixes alag se, ek-ek karke.

## 0. Audit state (har session ke aakhir me update)

- Gate 1: intezaar / approved (date). Owner ke jawab: live GETs, E2E browser, mutation runs, public report me security detail
- Ho chuke modules: … | Chalu: … (kahan ruka) | Agla: …
- Base SHA badla? (`git log <old>..origin/prerelease --oneline` ka saar, kin modules ko dobara dekhna)
- Khule blockers aur owner ke jawab ka intezaar

## 1. Project Overview

Naam, architecture, stack (versions), modules, audit scope (in / out: planned work), environment (OS, Node, npm, Docker, browser).

## 2. Overall Testing Summary

| Metric | Count |
(modules, features, planned test cases, executed, static-only, PASS, FAIL, BLOCKED, NOT TESTED, NEEDS CLARIFICATION, NOT IMPLEMENTED, KNOWN; bugs P0–P4; Confirmed vs Suspected)

## 2a. Baseline: checks aur known issues

Baseline commands (command, result, duration, note). KNOWN issues (source link, abhi bhi sach? haan/nahi).

## 3. Module-wise Testing Status

Module charters, phir:

| Module | Feature | Task | Status | Executed/Static | Bugs | Notes |

## 4. Bug Report

(severity order; har bug:)

### [QA-<AREA>-<NNN>] <English title>

**Module:** … | **Feature:** … | **Task/Doc:** task id / doc section
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
**Fix route:** branch + PR / chhota fix (`CLAUDE.md` git flow); mutation zaroori? (`docs/RULES.md`)
**Regression Risk:** …
**Regression test to add:** …
**Owner decision needed:** Haan (sawal) / Nahi

## 5. Security Findings

Har finding: ID, OWASP Top 10 / ASVS category, severity, live pe exposed? Saath me jo controls PASS hue.

## 6. Performance Findings

N+1, query/sort vs indexes, unbounded queries, payload sizes, bundle size, re-renders, request storms; free-tier ki jaani hui seemaayein = KNOWN (`docs/RISKS.md`).

## 7. Integration Issues

Flow matrix: har service se service aur app se backend ka raasta, aur har dependency ke band hone pe kya hota hai. NOT IMPLEMENTED list with task IDs.

## 8. Missing Test Coverage

Per module: scenario, kyun zaroori, test type; mutation survivors jinka test banna chahiye.

## 9. Questions and Unverified Assumptions

| Q-ID | Sawal | Kyun zaroori | Evidence | Claude ki recommendation | Owner ka jawab |

## 10. Recommended Fixing Order

Numbered: bug IDs, is order ki wajah, dependencies, kaun se ek PR me saath ja sakte hain.

## Change log

| Version | Date | Badlav |
```

Update rules: bump the version and add a change-log line at the end of every module. Never delete a finding: if it is disproved, set `Status: Invalid` with the reason. Bug IDs are never reused. Areas: one short code per module, fixed at Gate 1, plus `BASE`, `CI`, `TOOL` and `DOC`.

## 10. Session protocol (several sessions)

- **Start:** read report §0, then `docs/HANDOFF.md`; `git fetch`; compare the base SHA (if `prerelease` moved, list which audited modules the new commits touch). Tell me in 3 lines where things stand and what's next, and set the task list.
- **During:** keep the report current after every module; report a P0 the moment you find it.
- **Stop** (I say stop, weekly usage reaches ~85%, or a blocker needs me): finish the current test case; update report §0, the counts and the change log; update `docs/HANDOFF.md` (report path, modules done and next, what is uncommitted) and its change log; run `git status`; then ask me whether to commit. Never leave a finding only in chat.

## 11. How you talk to me

- Hinglish, short. Details live in the report, not in chat.
- **Gate 1 message:** the five items from §6.1, plus your questions with recommended answers.
- **After each module:** 4–6 lines: module, executed n / static n, PASS / FAIL / BLOCKED, new bugs P0–P4, the top concern, next module.
- **Final message:** totals, the P0/P1 list (one line each), blockers, the top 10 of the fix order, and what wasn't covered and why.
- Never say "verified", "tested" or "pass" about something you only read.

Now pick the mode from "How this skill runs" at the top, and start.
