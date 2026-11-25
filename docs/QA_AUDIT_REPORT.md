# QA AUDIT REPORT — BQ

> **Status:** v1.2.1 (2026-11-25). Audit base: `origin/prerelease` @ `7abdd29`. Auditor: Claude Code (Opus 5.5). Ye report audit ki single source of truth hai; fixes alag se, ek-ek karke.

## 0. Audit state (har session ke aakhir me update)

- **Gate 1:** approved (2026-11-25). Owner ke jawab:
  - **Docker:** integration tests primary ke local Docker (Docker Desktop) pe; Claude `infra:use -- primary` karke sirf int tests chalata hai, phir containers band; development data ko haath nahi.
  - **Live requests:** kuch nahi. Na asli npm registry, na koi live host; saare PKG tests fake registry pe.
  - **Security detail:** har finding ka poora repro report me hi.
  - **E2E browser aur mutation:** laagu nahi (UI nahi; mutation CLAUDE.md ki teen jagah me ye modules nahi).
  - **Kram:** §3.2 ka kram, isi tarah.
- **Ho chuke modules:** `28-packages` + CI (charter 1 se 3), `01-foundation` + TOOL + DOC (charter 4 se 8) | **Chalu:** kuch nahi | **Agla:** fixes, §10 ke kram se, alag sessions me.
- **Base SHA:** `origin/prerelease` @ `7abdd29` (PR #106 ka merge, 2026-11-25). Local branch `docs/secondary-dual-boot` @ `9541a11` ka tree isi jaisa hai (`git diff HEAD origin/prerelease` khaali), to audit isi tree pe. Agle session me: `git log 7abdd29..origin/prerelease --oneline`; jo commits `scripts/`, `configs/`, `infra/`, `.github/` ya `.claude/` chhoote hain, unke modules dobara dekhne hain.
- **Khule blockers:** koi nahi. Docker context audit ke baad wapas `bq-infra` (jaisa pehle tha); Docker Desktop owner ne chalu kiya tha, chalu hi chhoda.

## 1. Project Overview

- **Naam:** Beautinique (BQ). India ka beauty marketplace; R1 me 26 modules ([PROJECT_PLAN.md](PROJECT_PLAN.md) §3).
- **Abhi kya bana hai:** sirf charan 0 ke do modules ([PROJECT_PLAN.md](PROJECT_PLAN.md) §5):
  - `01-foundation` ([TASK](tasks/01-foundation/TASK.md)): npm workspaces + Turborepo ka root, `configs/` (TypeScript, ESLint, Vitest), `infra/` (laptop ke containers), env files aur `npm run setup`, CI (`ci.yml`) aur repo ke pehre, Dependabot, docs ke links ka check, aur do laptop (ST-8, D-462).
  - `28-packages` ([TASK](tasks/28-packages/TASK.md)): packages ka CLI (`scripts/packages`: `create`, `build`, `verify`, `status`, `republish`, `publish`, `update-deps`) aur `publish.yml` workflow.
- **Koi app, service ya package abhi nahi:** `packages/`, `frontend/`, `backend/` folders hain hi nahi. Na koi HTTP API, na UI, na database ka schema. Isliye HTTP probing, browser, a11y aur responsive checks laagu nahi.
- **Stack (pinned):** Node 24.22.3, npm 12.2.3 (D-458), TypeScript 6.0.3, ESLint 10.15.0, typescript-eslint 8.73.0, Vitest 5.1.1, Turborepo 2.11.13, Prettier 3.10.1, tsdown 0.23.7, yaml 2.9.1. Containers: `mongo:8.0.38` (replica set `rs0`), `valkey/valkey:8.1.12`.
- **Code ka size:** `scripts/foundation` (src 12 files, tests 14), `scripts/packages` (src 22 files, tests 9 + utils), `.github/` (`ci.yml`, `publish.yml`, `wake.yml`, `dependabot.yml`, 2 guard scripts aur unke tests), `configs/` (6 files), `infra/` (2 compose files). Kul lagbhag 9,400 lines (docs ke bina).
- **Audit scope:**
  - **Andar:** `01-foundation` (ST-1 se ST-8), `28-packages` (ST-1 se ST-8), `.github/` ke workflows aur guard scripts, `.claude/settings.json` ke pehre (static), aur in modules ke docs (README, CLAUDE.md commands, OPERATIONS §1, §2, §11).
  - **Bahar:** baaki 26 modules (planned, §7); `wake.yml` ka live call (`27-operations`, production); `linkedin-posts/` (content); `.claude/skills/` ka bartaav; asli npm registry pe kuch bhi; secondary laptop (audit ke waqt pahunch me nahi).
- **Environment:** Windows 11 Home 10.0.26300, Git Bash; Node 24.22.3, npm 12.2.3; gitleaks local; Docker Desktop 29.8.2 (context `desktop-linux`) sirf int tests ke liye; koi browser nahi.

## 2. Overall Testing Summary

| Metric                             | Count                                  |
| ---------------------------------- | -------------------------------------- |
| Modules                            | 2 (+ CI, TOOL, DOC areas)              |
| Features                           | 16                                     |
| Planned test cases                 | 52                                     |
| Executed                           | 45                                     |
| Static-only                        | 7                                      |
| PASS                               | 42                                     |
| FAIL                               | 10                                     |
| BLOCKED                            | 0                                      |
| NOT TESTED                         | 0                                      |
| NEEDS CLARIFICATION                | 0                                      |
| NOT IMPLEMENTED (modules)          | 26                                     |
| KNOWN                              | 6                                      |
| Bugs P0 / P1 / P2 / P3 / P4        | 0 / 0 / 2 / 4 / 5                      |
| Confirmed (E1–E3) / Suspected (E4) | 11 / 0 (E4 wale 2 shaq §9 me, QA-Q-5, 6) |

## 2a. Baseline: checks aur known issues

**Baseline commands** (2026-11-25, local, tree `7abdd29`; logs scratchpad me):

| Command                                                            | Result                                    | Duration | Note                                                                         |
| ------------------------------------------------------------------ | ----------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `npm ci --ignore-scripts`                                          | PASS                                      | 24 s     | Lockfile se; 0 vulnerabilities                                               |
| `npm run format:check`                                             | PASS                                      | 3 s      |                                                                              |
| `npx turbo run lint lint:root --force`                             | PASS                                      | 10 s     | Bina cache ke                                                                |
| `npx turbo run typecheck typecheck:root --force`                   | PASS                                      | 5 s      | Bina cache ke; `.github/scripts` isme nahi (QA-FND-001)                      |
| `npm run build`                                                    | PASS                                      | 0 s      | 0 tasks: abhi kisi workspace me `build` script nahi                          |
| `npm run docs:check`                                               | PASS                                      | 1 s      | 66 files ki links aur README/CLAUDE.md ki commands                           |
| `npm run secrets:scan`                                             | PASS                                      | 5 s      | 521 commits, koi leak nahi                                                   |
| `npm audit` (saare levels)                                         | PASS                                      | 2 s      | 0 vulnerabilities                                                            |
| `npx vitest run --project unit --coverage` (`scripts/foundation`)  | PASS, 12 files, 83 tests                  | 14 s     | Coverage: statements 82.9%, branches 78.7%, functions 85.0%, lines 84.0%     |
| `npx vitest run --project unit --coverage` (`scripts/packages`)    | PASS, 9 files, 94 tests                   | 45 s     | Coverage: statements 94.1%, branches 82.6%, functions 95.9%, lines 95.8%     |
| `node --test .github/scripts/branch-flow.test.mjs`                 | PASS, 11 tests                            | <1 s     |                                                                              |
| `node --test .github/scripts/secret-scan.test.mjs`                 | PASS, 2 tests                             | 2 s      | Local gitleaks ke saath                                                      |
| `npx vitest run --project integration` (`scripts/foundation`)      | PASS, 2 files, 2 tests                    | 34 s     | Primary ka Docker Desktop (`infra:use -- primary`); har run 1 volume chhodta hai (QA-FND-003) |
| `npm run packages:verify`                                          | PASS                                      | <5 s     | "No packages to verify yet."                                                 |
| GitHub CI, push run `45585514607` @ `7abdd29`                      | PASS (`guard`, `static`, `test`, `check`) | —        | PR #106 ka CI bhi green                                                      |

`git status` har command ke baad saaf raha (sirf ye report untracked).

**KNOWN issues:**

| #   | Issue                                                                                          | Source                          | Abhi bhi sach?                                                                                   |
| --- | ---------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| K-1 | Har `infra:down` mongo ke `/data/configdb` ka ek khaali anonymous volume chhodta hai          | [HANDOFF.md](HANDOFF.md) §2     | Haan, aur naya: int test bhi chhodta hai, primary pe 113 jama (QA-FND-003)                        |
| K-2 | Docker Desktop chalu hone pe current context `desktop-linux` ho jaata hai; OPERATIONS me baaki | [HANDOFF.md](HANDOFF.md) §2     | Haan                                                                                              |
| K-3 | Publish workflow asli GitHub pe aur asli npm pe koi publish abhi nahi chala                   | [HANDOFF.md](HANDOFF.md) §2, §3 | Haan (QA-PKG-001 isi raaste me hai, pehle run se pehle fix)                                       |
| K-4 | Dependabot ka pehla run `release` pe pahunchne ke baad                                         | [HANDOFF.md](HANDOFF.md) §3     | Haan                                                                                              |
| K-5 | Laptop se publish pe provenance nahi lagta (OIDC nahi), workflow me lagta hai                 | [OPERATIONS.md](OPERATIONS.md) §11 | Haan (by design; TASK 28 ki line ulta kehti hai, QA-DOC-001)                                  |
| K-6 | ST-8 ke asli secondary runs (tunnel, snapshot, `dev-data:*`) owner ne 2026-11-25 ko kiye      | [HANDOFF.md](HANDOFF.md) §2     | Haan; is audit me secondary pahunch me nahi tha, to ye raaste unit tests + static se             |

**Note:** PR #106 merge ho chuka (`7abdd29`, 2026-11-25 09:27 UTC, CI green), par [HANDOFF.md](HANDOFF.md) §3 aur [TASK 01](tasks/01-foundation/TASK.md) ST-8 abhi "PR ka CI aur merge baaki" kehte hain. ST-8 ko "ho gaya" likhna aur progress ([PROJECT_PLAN.md](PROJECT_PLAN.md) §4) owner ka kaam; audit task files aur PROJECT_PLAN nahi chhoota.

## 3. Module-wise Testing Status

### 3.1 Inventory

Area codes: `FND` (`01-foundation` ke scripts aur configs), `PKG` (`28-packages` ka CLI), `CI` (`.github/` ke workflows aur guard scripts), `TOOL` (`.claude/` ke pehre), `DOC` (docs aur code ka milan), `BASE` (baseline).

| Module        | Feature                                                                       | Task | Contract / AC           | Existing tests                                                                                                    |
| ------------- | ----------------------------------------------------------------------------- | ---- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 01-foundation | F1 Root, workspaces, pins, Turborepo                                          | ST-1 | AC-FOUNDATION-9, 11     | `turbo-pipeline.test.ts`, `root-checks.test.ts`                                                                   |
| 01-foundation | F2 Saajhe config (TS, ESLint, Prettier, Vitest + coverage)                    | ST-2 | AC-FOUNDATION-6, RT-23  | `shared-configs.test.ts`                                                                                          |
| 01-foundation | F3 Laptop infra (`compose.yaml`, `infra:up/down`)                             | ST-3 | AC-FOUNDATION-2         | `infra.test.ts`, `infra.int.test.ts`                                                                              |
| 01-foundation | F4 Env files aur `npm run setup`                                              | ST-4 | AC-FOUNDATION-1, 3      | `env-files.test.ts`, `setup.test.ts`, `setup.int.test.ts`                                                         |
| 01-foundation | F5 CI jobs aur repo ke pehre                                                  | ST-5 | AC-FOUNDATION-4 se 8    | `workflows.test.ts`, `root-checks.test.ts`, `docs-paths.test.ts`, `secret-scan.test.mjs`, `branch-flow.test.mjs` |
| 01-foundation | F6 Dependabot                                                                 | ST-6 | AC-FOUNDATION-10        | `dependabot.test.ts`                                                                                              |
| 01-foundation | F7 README, commands, `docs:check`                                             | ST-7 | AC-FOUNDATION-6         | `docs-paths.test.ts`                                                                                              |
| 01-foundation | F8 Do laptop (`infra:use/status`, tunnel, snapshot, `dev-data:*`, ephemeral) | ST-8 | AC-FOUNDATION-12 se 15  | `machine.test.ts`, `remote-infra.test.ts`, `dev-data.test.ts`, `infra.test.ts`                                    |
| 28-packages   | P1 CLI ka dhaancha (args, errors, confirm, logs) aur `build`                  | ST-1 | AC-PACKAGES-4           | `cli.test.ts`, `workspace.test.ts`                                                                                |
| 28-packages   | P2 Fake registry aur network ka pehra                                         | ST-2 | AC-PACKAGES-12          | `registry.test.ts`, `test/utils/*`                                                                                |
| 28-packages   | P3 `create` aur template                                                      | ST-3 | AC-PACKAGES-1           | `create.test.ts`                                                                                                  |
| 28-packages   | P4 `verify` (CI me har PR pe)                                                 | ST-4 | AC-PACKAGES-2, 3        | `verify.test.ts`                                                                                                  |
| 28-packages   | P5 `status` aur laptop se `publish`                                           | ST-5 | AC-PACKAGES-5, 7, 8, 10 | `publish.test.ts`                                                                                                 |
| 28-packages   | P6 `republish`                                                                | ST-6 | AC-PACKAGES-6           | `republish.test.ts`                                                                                               |
| 28-packages   | P7 Publish workflow aur OPERATIONS ka manual                                  | ST-7 | AC-PACKAGES-9           | `workflow.test.ts`                                                                                                |
| 28-packages   | P8 `update-deps`                                                              | ST-8 | AC-PACKAGES-11          | `update-deps.test.ts`                                                                                             |

Har acceptance criterion (`AC-FOUNDATION-1` se `15`, `AC-PACKAGES-1` se `12`) ka kam se kam ek test hai jiske naam me uska id hai (DD-1, grep se jaancha).

### 3.2 Module charters (jo kram chala)

1. **CI + PKG publish ka raasta (P5, P7, F5):** `release` ki shart aur haq, artifact, beech me fail ke baad tags, `publish --ci`, laptop `publish` ki shartein, untrusted input. Nateeja: QA-PKG-001, QA-PKG-003.
2. **PKG `republish` (P6):** branch, identity, ranges, lockfile, CHANGELOG escape, beech me fail. Nateeja: QA-PKG-004.
3. **PKG `verify` + `create` (P3, P4):** tarball allowlist, secret patterns, CR-33 se CR-36, naam ki jaanch. Nateeja: QA-PKG-002.
4. **FND do laptop (F8):** data ki disha, project allowlist, snapshot rotation, pid ko maarna. Nateeja: koi bug nahi; do shaq §9 me (QA-Q-5, QA-Q-6).
5. **FND env files + setup (F4):** `.env.production`, sandesh me value, `wx`, `.gitignore`. Nateeja: QA-FND-004.
6. **CI pehre (F5, F6):** workflow guard, gitleaks, branch flow, `check`, audit. Nateeja: koi bug nahi; hardening §9 (QA-Q-7).
7. **FND infra + configs + root (F1, F2, F3):** pins, ports, coverage gate, lint/typecheck ka daayra. Nateeja: QA-FND-001, QA-FND-002, QA-FND-003.
8. **TOOL + DOC:** `.claude/settings.json`, docs aur code ka milan, DD-1. Nateeja: QA-TOOL-001, QA-DOC-001.

### 3.3 Test cases aur nateeje

`Exec` = chala ke (existing tests, scratchpad ke probe, fake registry, temp git repo, local Docker); `Static` = code padh ke.

| TC          | Feature | Kya jaancha                                                                                                            | Status | Kaise          | Bug / Note                                   |
| ----------- | ------- | ---------------------------------------------------------------------------------------------------------------------- | ------ | -------------- | -------------------------------------------- |
| TC-CI-001   | P7      | `publish.yml`: har job pe `refs/heads/release`; haq: pack `contents: read`, publish sirf `id-token: write`, tag `contents: write` | PASS   | Exec + Static  | `workflow.test.ts`                           |
| TC-CI-002   | P7      | Pack se publish tak artifact; publish job me checkout nahi                                                             | PASS   | Static         |                                              |
| TC-CI-003   | P7      | Beech me fail: pehle run me chhape versions ke tags                                                                     | FAIL   | Exec           | QA-PKG-001                                   |
| TC-CI-004   | P7      | Naya package workflow me mana (AC-PACKAGES-9)                                                                           | PASS   | Exec           | `publish.test.ts`                            |
| TC-CI-005   | F5      | `permissions: {}`, SHA pins, `timeout-minutes`, `pull_request_target` nahi                                              | PASS   | Exec           | `workflows.test.ts`; hardening QA-Q-7        |
| TC-CI-006   | F5      | Untrusted input (`head_ref` waghaira) seedha `run:` me nahi                                                             | PASS   | Static         | Sab `env:` se                                |
| TC-CI-007   | F5      | `check`: koi job fail/skipped ho to laal                                                                                | PASS   | Exec + Static  | `if: !cancelled()` + `jq all success`        |
| TC-CI-008   | F5      | gitleaks: binary SHA-256, poori history, allowlist aur `.gitleaksignore` ki har entry ki wajah                          | PASS   | Exec + Static  | 5 entries, sabki wajah                       |
| TC-CI-009   | F5      | `branch-flow.mjs` aur CLAUDE.md ka git flow                                                                             | PASS   | Exec           | 11 tests                                     |
| TC-CI-010   | F5      | `npm audit` level aur `--package-lock-only`                                                                              | PASS   | Exec + Static  |                                              |
| TC-CI-011   | F6      | `dependabot.yml` aur OPERATIONS §11 niyam 1                                                                             | PASS   | Exec           | `dependabot.test.ts`                         |
| TC-CI-012   | F5      | `wake.yml` pehron ke andar; chalaya nahi                                                                                | PASS   | Static         |                                              |
| TC-PKG-001  | P1      | Anjaan command/flag: non-zero exit, code aur hint                                                                        | PASS   | Exec           | `cli.test.ts`                                |
| TC-PKG-002  | P1      | Confirm: sirf saaf haan; bina TTY kabhi apne aap haan nahi                                                              | PASS   | Exec + Static  | `haan`/`yes`/`y` maanta hai                  |
| TC-PKG-003  | P1      | `build`: dependency kram, cycle pe naamon ke saath error                                                                 | PASS   | Exec           |                                              |
| TC-PKG-004  | P2      | Network ka pehra                                                                                                         | FAIL   | Exec           | QA-PKG-005 (https wala raasta theek)         |
| TC-PKG-005  | P3      | `create`: galat category/naam/folder/npm naam pe kuch na likhe                                                           | PASS   | Exec + Static  | `NAME_FORMAT` me traversal nahi ho sakta     |
| TC-PKG-006  | P3      | `create` ka output aur agla major                                                                                        | PASS   | Exec           |                                              |
| TC-PKG-007  | P4      | CR-33 se CR-36 ka har niyam                                                                                              | PASS   | Exec           |                                              |
| TC-PKG-008  | P4      | Tarball: allowlist aur secret patterns                                                                                   | FAIL   | Exec           | QA-PKG-002                                   |
| TC-PKG-009  | P5      | `status`: registry na mile ya 5xx to error, chupke se "naya" nahi                                                        | PASS   | Exec + Static  |                                              |
| TC-PKG-010  | P5      | Laptop `publish` ki shartein (AC-PACKAGES-8)                                                                             | PASS   | Exec           |                                              |
| TC-PKG-011  | P5      | Sirf registry pe na hone wale versions, dependency kram me (AC-PACKAGES-7)                                                | FAIL   | Exec           | QA-PKG-003 (bina naam wala raasta theek)     |
| TC-PKG-012  | P5      | Laptop pe beech me fail ke baad resume, tags (AC-PACKAGES-10)                                                             | PASS   | Exec           | Workflow wala raasta: TC-CI-003              |
| TC-PKG-013  | P5      | `publish --ci` laptop pe                                                                                                 | PASS   | Static         | Env jhootha ho to bhi sirf pack karta hai    |
| TC-PKG-014  | P6      | `republish`: `release`/`prerelease`, gandi tree, upstream                                                                 | PASS   | Exec           |                                              |
| TC-PKG-015  | P6      | Versions, range ka roop, lockfile, ek commit, identity, AI trailer nahi                                                   | PASS   | Exec           | Probe me bhi dekha                           |
| TC-PKG-016  | P6      | CHANGELOG me subject ka escape                                                                                           | PASS   | Exec           | HTML aur link neutral; bare URL GitHub pe link |
| TC-PKG-017  | P6      | Beech me fail pe aadhi likhi files                                                                                       | FAIL   | Exec           | QA-PKG-004                                   |
| TC-PKG-018  | P8      | `update-deps`: seema, peer aur dev saath                                                                                 | PASS   | Exec           |                                              |
| TC-PKG-019  | P8      | Install fail aur beech me roka jaaye to sab pehle jaisa (AC-PACKAGES-11)                                                 | PASS   | Exec           |                                              |
| TC-PKG-020  | P1–P8   | CLI kabhi `.env*` ka content nahi padhta                                                                                 | PASS   | Static         | Naam se pakadta hai, content se pehle        |
| TC-FND-001  | F1      | Root `package.json`, deployables pe `private`                                                                            | PASS   | Exec           |                                              |
| TC-FND-002  | F1      | Node aur npm ka ek pin; publish job ka hardcoded Node pin se mile                                                        | PASS   | Exec           |                                              |
| TC-FND-003  | F1      | Turborepo: dependency pehle, local cache, remote cache band                                                              | PASS   | Exec           |                                              |
| TC-FND-004  | F2      | Har root file lint aur typecheck me                                                                                      | FAIL   | Exec           | QA-FND-001                                   |
| TC-FND-005  | F2      | ESLint type-aware; ignores sahi                                                                                          | PASS   | Exec + Static  |                                              |
| TC-FND-006  | F2      | Coverage gate fail-closed (RT-23)                                                                                        | FAIL   | Exec           | QA-FND-002                                   |
| TC-FND-007  | F3      | Pins, ports `127.0.0.1` (`BQ_*_PORT` ke ajeeb values samet), profiles                                                    | PASS   | Exec + Static  | Compose galat value pe mana karta hai        |
| TC-FND-008  | F3      | `infra:up`/`down` local                                                                                                   | PASS   | Exec           | Int test ke andar asli Docker pe             |
| TC-FND-009  | F3, F4  | `infra.int.test.ts` aur `setup.int.test.ts`                                                                               | PASS   | Exec           | Volume chhoot-ta hai: QA-FND-003             |
| TC-FND-010  | F4      | `.env.example` ki jaanch, sandesh me value nahi                                                                          | PASS   | Exec + Static  |                                              |
| TC-FND-011  | F4      | `wx`; `.env.production` na bane, na khule                                                                                 | PASS   | Exec + Static  |                                              |
| TC-FND-012  | F4      | `.gitignore` aur tracked env ka pehra, naam ke variants                                                                   | FAIL   | Exec           | QA-FND-004                                   |
| TC-FND-013  | F4      | `setup`: version ki jaanch install se pehle                                                                               | PASS   | Exec           |                                              |
| TC-FND-014  | F8      | Tunnel: pehchaan, ports, pid file, pid ko maarna                                                                          | PASS   | Exec + Static  | Shaq QA-Q-6                                  |
| TC-FND-015  | F8      | `infra:use`/`status`                                                                                                      | PASS   | Exec           | Asli: secondary band pe chetavni ke saath badla |
| TC-FND-016  | F8      | `dev-data:*`: disha, project allowlist, rotation                                                                          | PASS   | Exec + Static  | Shaq QA-Q-5; asli runs K-6                   |
| TC-FND-017  | F8      | `compose.ephemeral.yaml` (AC-FOUNDATION-14)                                                                               | PASS   | Exec           | `infra.test.ts`                              |
| TC-FND-018  | F1–F8   | Windows: paths, shell quoting, `spawn`                                                                                    | PASS   | Static         | Note QA-Q-9                                  |
| TC-TOOL-001 | —       | `.claude/settings.json` deny rules                                                                                        | FAIL   | Static         | QA-TOOL-001                                  |
| TC-DOC-001  | F7, P7  | README commands, OPERATIONS §11, TASK ke status, DD-1                                                                     | FAIL   | Exec + Static  | QA-DOC-001 (DD-1 aur commands theek)         |

## 4. Bug Report

### [QA-PKG-001] Workflow publish that fails midway leaves the published versions untagged for good

**Module:** 28-packages | **Feature:** P7 publish workflow, P5 publish | **Task/Doc:** ST-5, ST-7; TASK 28 §3.8 niyam 4, AC-PACKAGES-10
**Severity:** P2 (built flow ka contract toota: "har chhape version ka tag" aur `republish` ka "pichhle tag ke baad" galat ho jaata hai) | **Priority:** High | **Status:** Open
**Testing Type:** Reliability, integration | **Evidence level:** E2 | **Reproducibility:** Always (2/2) | **Environment:** local, fake registry, real npm + git
**Description:** Workflow ka `publish` job tarballs ek-ek karke chhapta hai. Beech me koi fail ho to job fail, aur `tag` job (`needs: [pack, publish]`) skip ho jaata hai, to jo versions chhap chuke unka tag nahi banta. Agle run me `pack` sirf npm pe na hone wale versions ka plan banata hai, to chhap chuke versions kabhi plan me nahi aate, aur unka tag kabhi nahi banta. Laptop `publish` bhi unhe "already on npm" maan ke chhod deta hai.
**Steps to Reproduce:**
1. Temp repo (`release` branch, git identity): `packages/shared/ids` aur `packages/shared/money` (money ids pe `^1.0.0`), dono `1.0.0`; fake registry pe dono ke `0.9.0`.
2. `publish({ ci: true, env: { GITHUB_ACTIONS: 'true', GITHUB_REF_NAME: 'release' } })`: plan = `ids@1.0.0`, `money@1.0.0`.
3. Workflow ka loop haath se: har tarball pe `npm publish <tarball> --access public --provenance=false --registry <fake>`; fake registry ko `failPublishes(1, 500, 1)` (pehla chale, doosra 500). `ids@1.0.0` chhapa, `money` 500; loop ruka (`tag` job skip).
4. Phir `publish({ ci: true, ... })` dobara: plan = sirf `money@1.0.0`.
5. Phir laptop `publish({ ci: false })`: sirf `money` chhapa aur tag hua.
**Expected Result:** Har chhape version ka git tag (TASK 28 §3.8 niyam 4; AC-PACKAGES-10 "tag sirf chhape versions ke", yaani har chhape ka).
**Actual Result:** `ids@1.0.0` npm pe hai par tag kabhi nahi bana. Probe output (dono run same): `run 2 plan tags: ['@beautinique/shared-money@1.0.0']`, aakhir me `git tags in repo: "@beautinique/shared-money@1.0.0"`.
**Evidence:** Probe `p1-tag-gap.ts` (scratchpad), upar ke kadam.
**Root Cause:** Plan sirf `state !== 'published'` versions se bante hain (`scripts/packages/src/publish.ts:39`, `publish.ts:111`), aur tag job tabhi chalta hai jab poora publish job safal ho (`.github/workflows/publish.yml:83`). Chhapa par bina tag wala version kisi raaste me nahi pakda jaata. Asar: `republish` ka `lastTag` (`scripts/packages/src/republish.ts:50`) purane tag (`0.9.0`) se commits ginta hai, to agla CHANGELOG `1.0.0` ke commits dobara likhta hai aur package "badla hua" dikhta hai.
**Affected Files:** `scripts/packages/src/publish.ts:38-45`, `scripts/packages/src/publish.ts:107-130`, `scripts/packages/src/publish.ts:191-198`, `.github/workflows/publish.yml:81-106`
**Recommended Fix:** Plan me "npm pe hai par tag nahi" wale versions ke tags bhi rakho (jaise `tagOnly` entries), aur tag job sirf unka tag banaye jo registry pe sach me hain; ya tag job `if: always() && needs.pack.result == 'success'` ke saath registry se jaanch ke tag kare. Laptop `publish` bhi bina tag wale chhape versions ka tag banaye.
**Fix route:** Branch + PR (`28-packages`), QA-PKG-003 ke saath ek PR. Mutation zaroori nahi.
**Regression Risk:** Madhyam: tag job ka bartaav badlega; galti se bina chhape version ka tag na bane.
**Regression test to add:** `publish.test.ts`: workflow ke do run (pehle me beech me 500), doosre run ke plan me pehle chhape version ka tag ho; laptop path pe bhi.
**Owner decision needed:** Nahi

### [QA-PKG-002] verify's secret check misses this project's own secret shapes in packed files

**Module:** 28-packages | **Feature:** P4 verify | **Task/Doc:** ST-4; TASK 28 §3.3 niyam 2, AC-PACKAGES-3, DD-7
**Severity:** P2 (security wala validation gap: npm pe chhapa secret wapas nahi hota) | **Priority:** Medium | **Status:** Open
**Testing Type:** Security | **Evidence level:** E1 | **Reproducibility:** Always (2/2) | **Environment:** local
**Description:** Tarball ki jaanch sirf char content patterns dekhti hai: private key, AWS key, `npm_` token, GitHub token. Is project ke apne services ke secrets (MongoDB/Valkey/Postgres/Cloudinary URL password ke saath, jinke liye `.gitleaks.toml` me alag rule `url-with-password` hai) aur Razorpay key dist me hon to `verify` pass ho jaata hai. `dist/` git me nahi jaata, to gitleaks use kabhi nahi dekhta; `verify` hi aakhri pehra hai.
**Steps to Reproduce:**
1. Template package banao (`addPackage`), `dist/index.mjs` me ek-ek karke `export const v = "<value>";`, jahan `<value>` ye roop hain: `mongodb+srv://<user>:<password>@<host>/app`, `rediss://default:<password>@<host>:6379`, `cloudinary://<api_key>:<api_secret>@<cloud>`, aur `rzp_live_` ke baad 14 akshar. Har `<...>` ki jagah koi nakli value probe me run time pe banao (repo me literal kabhi nahi: gitleaks ka `url-with-password` use pakdega).
2. `packedPathProblems(pkg, ['package.json', 'dist/index.mjs'])`.
**Expected Result:** Har ek pe DD-7 problem "contains a secret" (AC-PACKAGES-3: "secret jaisa pattern ho to fail").
**Actual Result:** Char me se char `MISSED`; private key aur npm token `CAUGHT`. `dist/.npmrc` bhi bina problem ke guzar jaata hai.
**Evidence:** Probe `p4-verify-secrets.ts`: `MISSED MongoDB URL with password`, `MISSED Valkey URL with password`, `MISSED Cloudinary URL`, `MISSED Razorpay live key id`.
**Root Cause:** `SECRET_CONTENT` me project ke patterns nahi (`scripts/packages/src/pack.ts:17-22`), aur `SECRET_NAMES` me `.npmrc` nahi (`pack.ts:11-15`).
**Affected Files:** `scripts/packages/src/pack.ts:11-22`
**Recommended Fix:** `.gitleaks.toml` ka `url-with-password` regex aur Razorpay key (`rzp_(live|test)_`) `SECRET_CONTENT` me; `.npmrc` `SECRET_NAMES` me. Behtar: tarball ki files pe `gitleaks dir` chalana (wahi config, ek jagah niyam).
**Fix route:** Branch + PR (`28-packages`). Mutation zaroori nahi.
**Regression Risk:** Kam; galat positive se bachne ke liye placeholder allowlist (`<...>`, `${...}`) wahi rakho jo gitleaks me hai.
**Regression test to add:** `verify.test.ts`: har naye pattern ka ek galat misaal (dist me) jo fail ho, aur ek placeholder jo pass ho.
**Owner decision needed:** Nahi

### [QA-PKG-003] Laptop publish of a named package goes out while the internal version it needs is not on npm

**Module:** 28-packages | **Feature:** P5 publish | **Task/Doc:** ST-5; AC-PACKAGES-7 ("dependency ke kram me")
**Severity:** P3 (chhapa package tab tak install nahi hota jab tak dependency na chhape; khud theek ho jaata hai) | **Priority:** Medium | **Status:** Open
**Testing Type:** Functional, negative | **Evidence level:** E2 | **Reproducibility:** Always (2/2) | **Environment:** local, fake registry
**Description:** `npm run packages:publish -- <name>` me queue sirf chune packages ki banti hai. Chuna package jis andar ke package ke naye version pe tika hai, wo npm pe na ho to bhi chuna package chhap jaata hai. Naya package pehli baar laptop se hi chhapta hai (workflow mana karta hai), to ye raasta asli hai.
**Steps to Reproduce:**
1. Temp repo `release` pe: `shared/ids` `1.1.0`, `shared/money` `1.0.0` (naya) jiski dependency `@beautinique/shared-ids: ^1.1.0`; fake registry pe `ids` sirf `1.0.0`.
2. `publish({ names: ['@beautinique/shared-money'], ci: false })`, jawab `haan`.
**Expected Result:** Ya to `ids@1.1.0` pehle chhape (dependency kram), ya publish ruke aur bataye ki `ids@1.1.0` npm pe nahi.
**Actual Result:** `exit: 0`, `Published 1 version(s): @beautinique/shared-money@1.0.0`; registry: `ids: ['1.0.0']`, `money: ['1.0.0']`. `npm install @beautinique/shared-money` tab `ETARGET` dega.
**Evidence:** Probe `p2-subset-publish.ts`, dono run same.
**Root Cause:** `toPublish` dependency kram ke liye `buildOrder` me dependencies jodta hai, par phir sirf chune packages (`pending`) rakhta hai (`scripts/packages/src/publish.ts:38-45`); statuses sirf `selected` ke (`publish.ts:155-157`). Chhapne se pehle andar ki ranges ka npm se milan nahi.
**Affected Files:** `scripts/packages/src/publish.ts:38-45`, `scripts/packages/src/publish.ts:154-157`
**Recommended Fix:** Chune packages ki andar ki dependencies ke statuses bhi lo; jinka zaroori version npm pe nahi, unhe queue me pehle jodo (plan me dikhao) ya saaf error ke saath ruko.
**Fix route:** Branch + PR, QA-PKG-001 ke saath. Mutation zaroori nahi.
**Regression Risk:** Kam.
**Regression test to add:** `publish.test.ts`: naam ke saath publish, dependency ka naya version npm pe nahi: ya pehle chhape ya ruke.
**Owner decision needed:** Haan: dependency apne aap saath chhape (salah), ya sirf ruk ke bataye?

### [QA-FND-001] The root typecheck does not cover .github/scripts, though the task says it does

**Module:** 01-foundation | **Feature:** F1/F2 root tasks | **Task/Doc:** ST-1; TASK 01 §3.1 niyam 4
**Severity:** P3 (docs aur code ka farak; CI ke guard scripts ki type galti chhoot sakti hai) | **Priority:** Low | **Status:** Open
**Testing Type:** Static analysis tooling | **Evidence level:** E1 | **Reproducibility:** Always | **Environment:** local
**Description:** TASK 01 §3.1 niyam 4 kehta hai root ki apni files (`configs/`, `eslint.config.js`, `.github/scripts`) ka lint aur typecheck root tasks se. Lint (`lint:root`) `.github/scripts` leta hai, par `typecheck:root` (`tsc -p tsconfig.json`) nahi. ESLint ka type-aware hissa sirf `*.ts` pe laagu hai, to `.mjs` guard scripts (branch flow, secret scan test) ka koi type check nahi.
**Steps to Reproduce:** `npx tsc -p tsconfig.json --listFilesOnly | grep -v node_modules`
**Expected Result:** `.github/scripts/*.mjs` list me.
**Actual Result:** Sirf `configs/vitest/coverage.ts`, `configs/vitest/workspace.ts`, `configs/eslint/base.js`, `eslint.config.js`.
**Evidence:** Upar ka command (2026-11-25).
**Root Cause:** `tsconfig.json:8` ke `include` me `.github/scripts` nahi.
**Affected Files:** `tsconfig.json:8`
**Recommended Fix:** `include` me `.github/scripts/**/*.mjs` (aur `turbo.json` ke `globalDependencies` me `.github/scripts/**` agar cache sahi rakhna ho). Pehli baar chalne pe JSDoc type galtiyaan nikal sakti hain.
**Fix route:** Chhota fix (1–2 files) seedha `prerelease` pe ya foundation ke PR me.
**Regression Risk:** Kam.
**Regression test to add:** `shared-configs.test.ts` ya `root-checks.test.ts`: root typecheck ki file list me `.github/scripts` ho.
**Owner decision needed:** Nahi

### [QA-TOOL-001] Claude's deny rules miss .env.\* variants that CLAUDE.md says are blocked

**Module:** Tooling | **Feature:** `.claude/settings.json` | **Task/Doc:** CLAUDE.md "Public repo" niyam
**Severity:** P3 (pehra kamzor; asal rok CLAUDE.md ka niyam hai, settings sirf backup) | **Priority:** Medium (fix ek line ka) | **Status:** Open
**Testing Type:** Security | **Evidence level:** E3 | **Reproducibility:** Always | **Environment:** static (Claude ko `.env*` kholne ki ijaazat nahi, isliye chala ke nahi dekha)
**Description:** CLAUDE.md kehta hai Claude `.env`/`.env.*` files kabhi nahi kholta aur `.claude/settings.json` ke deny rules ise tool ke level pe rokte hain. Deny list sirf kuch naam ginati hai: `.env`, `.env.local`, `.env.*.local`, `.env.development`, `.env.production`, `.env.test`, `.env.e2e`, `.env.live`. `.env.staging`, `.env.prod`, `.env.production.bak`, `.env.backup` jaise naam deny me nahi.
**Steps to Reproduce:** `.claude/settings.json:23-43` padho; upar ke naam kisi rule se match nahi hote.
**Expected Result:** Har `.env.*` (siwaye `.env.example`) Read aur Edit me deny.
**Actual Result:** Sirf ginaye hue naam deny.
**Evidence:** `.claude/settings.json:23-43`.
**Root Cause:** Naamon ki list; `Read(//**/.env.*)` jaisa chauda rule nahi (deny allow se upar hota hai, isliye `.env.example` ko bachane ke liye list chuni gayi hogi).
**Affected Files:** `.claude/settings.json:23-43`
**Recommended Fix:** `Read(//**/.env.*)` aur `Edit(//**/.env.*)` deny me, aur `.env.example` padhne ke liye alag raasta (misaal: `env.example` ki copy `docs/` me nahi; ya Claude ko `.env.example` sirf `git show HEAD:.env.example` se). Ya kam se kam `.env.*.bak`, `.env.staging`, `.env.prod`, `.env.backup` jodo.
**Fix route:** Chhota fix (1 file) seedha `prerelease` pe.
**Regression Risk:** Kam; `.env.example` padhna band ho sakta hai, iska raasta tay karna.
**Regression test to add:** `root-checks.test.ts`: settings ke deny rules har `.env.*` naam ke liye (`.env.example` chhod ke).
**Owner decision needed:** Haan: `.env.example` padhne ka raasta (chauda deny rule ke saath).

### [QA-PKG-004] republish leaves a new CHANGELOG.md behind after a lockfile failure, while saying the files are back

**Module:** 28-packages | **Feature:** P6 republish | **Task/Doc:** ST-6; TASK 28 §3.5
**Severity:** P3 (galat sandesh; agla `republish` "working tree is not clean" pe rukega) | **Priority:** Low | **Status:** Open
**Testing Type:** Reliability | **Evidence level:** E2 | **Reproducibility:** Always (2/2) | **Environment:** local, temp git repo
**Description:** `npm install --package-lock-only` fail ho to `republish` files wapas likhta hai aur kehta hai "The files are back as they were". Jo `CHANGELOG.md` pehle tha hi nahi (republish ne naya banaya), wo hat-ta nahi.
**Steps to Reproduce:**
1. Temp repo branch `work`, package `shared/ids` `1.0.0` bina `CHANGELOG.md`, tag `@beautinique/shared-ids@1.0.0`, phir ek `feat:` commit; `refs/remotes/origin/prerelease` = pehla commit.
2. `republish({ bump: 'patch' })` aisi `exec` ke saath jo `npm` pe exit 1 de.
**Expected Result:** Saari files pehle jaisi (naya bana `CHANGELOG.md` bhi hate).
**Actual Result:** `REPUBLISH_LOCK_FAILED`, version `1.0.0` wapas, par `git status`: `?? packages/shared/ids/CHANGELOG.md`.
**Evidence:** Probe `p3-republish.ts` (a), dono run same.
**Root Cause:** `restore` sirf un files ko likhta hai jinka original tha (`scripts/packages/src/republish.ts:243-246`); naye bane ko mitata nahi.
**Affected Files:** `scripts/packages/src/republish.ts:236-256`
**Recommended Fix:** `originals` me `undefined` wali files ko restore me `rmSync` karo.
**Fix route:** Branch + PR (`28-packages` ke fixes ke saath).
**Regression Risk:** Kam.
**Regression test to add:** `republish.test.ts` "puts the files back when the lockfile cannot be updated" me bina CHANGELOG wala package.
**Owner decision needed:** Nahi

### [QA-FND-002] A critical coverage glob that matches no file passes silently (fail-open)

**Module:** 01-foundation | **Feature:** F2 Vitest coverage | **Task/Doc:** ST-2; RULES RT-23, TASK 01 §3.2 niyam 4
**Severity:** P4 (abhi koi critical code nahi; aage paisa, stock aur permissions ka gate chupke se band ho sakta hai) | **Priority:** Medium (pehle `critical` glob se pehle) | **Status:** Open
**Testing Type:** Test infrastructure | **Evidence level:** E2 | **Reproducibility:** Always (2/2) | **Environment:** local
**Description:** `workspaceTestConfig({ critical: [...] })` har glob ko Vitest threshold banata hai. Glob me typo ho aur wo kisi file se na mile to Vitest use chhod deta hai aur run pass.
**Steps to Reproduce:** Scratch workspace: `src/money/sign.ts` (3 branch), test sirf 1 branch; config `workspaceTestConfig({ critical: ['src/mony/**'] })` + `globals: true`; `vitest run --coverage`.
**Expected Result:** Ya to 85% se neeche fail, ya "glob kisi file se nahi milta" pe fail.
**Actual Result:** `critical glob 'src/money/**' -> exit 1` (sahi), `critical glob 'src/mony/**' -> exit 0` with `Branches: 25%`.
**Evidence:** Probe `probes/cov`, dono run.
**Root Cause:** `configs/vitest/coverage.ts:22` glob ko bina jaanch threshold me daalta hai.
**Affected Files:** `configs/vitest/coverage.ts:20-24`, `configs/vitest/workspace.ts:15-23`
**Recommended Fix:** Config banate waqt har `critical` glob ko workspace ke `src/` pe match karo (misaal `fs.globSync`), koi file na mile to error.
**Fix route:** Chhota fix ya `02-platform` ke pehle PR me.
**Regression Risk:** Kam.
**Regression test to add:** `shared-configs.test.ts`: na milne wala glob error de.
**Owner decision needed:** Nahi

### [QA-FND-003] infra.int test and infra:down leave an anonymous /data/configdb volume each run

**Module:** 01-foundation | **Feature:** F3 infra | **Task/Doc:** ST-3; TASK 01 §7 ("aakhir me volumes bhi saaf"); KNOWN K-1
**Severity:** P4 (nuksan nahi, bheed; `docker volume prune` ka khatra) | **Priority:** Low | **Status:** Open
**Testing Type:** Reliability | **Evidence level:** E1 | **Reproducibility:** Always (2/2) | **Environment:** local Docker Desktop
**Description:** K-1 (har `infra:down`) ke alawa naya: `infra.int.test.ts` har run pe ek anonymous volume chhodta hai, jabki TASK 01 §7 kehta hai test ke ant me volumes saaf. Primary pe aise 113 anonymous volumes jama hain.
**Steps to Reproduce:** `docker volume ls -q | grep -cE '^[0-9a-f]{64}$'`; `npx vitest run --project integration test/infra.int.test.ts` (`scripts/foundation`); phir se ginti.
**Expected Result:** Ginti waisi hi.
**Actual Result:** 111 → 112 (pehla poora run), 112 → 113 (sirf `infra.int`); `setup.int` ke baad 113 → 113.
**Evidence:** Upar ke commands; naye volume ka `CreatedAt` test ke start time pe, bina compose label ke.
**Root Cause:** `mongo` image `/data/configdb` ko VOLUME banati hai aur `infra/compose.yaml:30` sirf `/data/db` ko naam wala volume deta hai. Test pehle asli `infra:down` chalata hai (`scripts/foundation/test/infra.int.test.ts:122`, bina `--volumes`), jisse container hat jaata hai aur anonymous volume anaath; baad ka `down --volumes` (`infra.int.test.ts:66`) use nahi dhoondh pata.
**Affected Files:** `infra/compose.yaml:29-31`, `infra/compose.yaml:75-76`, `scripts/foundation/test/infra.int.test.ts:66`, `scripts/foundation/test/infra.int.test.ts:122`
**Recommended Fix:** HANDOFF §2 ki salah: `/data/configdb` ke liye bhi naam wala volume (ya ephemeral me tmpfs). Purane anaath volumes hatane ke liye sirf bina label wale 64-hex naam, haath se; `docker volume prune` kabhi nahi (data volume `beautinique_mongo-data` ko khatra).
**Fix route:** Branch + PR (foundation), owner ki haan ke baad.
**Regression Risk:** Kam.
**Regression test to add:** `infra.int.test.ts`: test ke pehle aur baad anonymous volumes ki ginti same.
**Owner decision needed:** Haan: naam wala volume (HANDOFF §2 me pehle se khula).

### [QA-FND-004] The tracked-env-file guard is case sensitive (.ENV, .Env.Production pass)

**Module:** 01-foundation | **Feature:** F4/F5 repo ke pehre | **Task/Doc:** ST-4; AC-FOUNDATION-3
**Severity:** P4 (hardening; Windows pe `.ENV` aur `.env` ek hi file) | **Priority:** Low | **Status:** Open
**Testing Type:** Security | **Evidence level:** E1 | **Reproducibility:** Always | **Environment:** local
**Description:** Git me tracked env file ka pehra naam ko case ke saath milata hai. Linux (CI, secondary Ubuntu) pe `.gitignore` ka `.env` `.ENV` ko ignore nahi karta, aur pehra bhi nahi pakadta.
**Steps to Reproduce:** `trackedEnvFileProblems(['.ENV', 'backend/x/.Env.Production', '.env.local', '.env.example'])` (`scripts/foundation/src/env-files.ts`).
**Expected Result:** `.ENV` aur `.Env.Production` bhi problem.
**Actual Result:** Sirf `.env.local`.
**Evidence:** `[".env.local: env files never go into git; only .env.example does"]`.
**Root Cause:** `scripts/foundation/src/env-files.ts:154` me case-sensitive match.
**Affected Files:** `scripts/foundation/src/env-files.ts:150-157`, `.gitignore:12-14`
**Recommended Fix:** `name.toLowerCase()` pe match; `.gitignore` me `[Ee][Nn][Vv]` jaisa pattern ya CI ke pehre pe bharosa.
**Fix route:** Chhota fix.
**Regression Risk:** Kam.
**Regression test to add:** `env-files.test.ts`: bade akshar wale naam pakde jaayein.
**Owner decision needed:** Nahi

### [QA-PKG-005] The tests' network guard stops TLS but not plain TCP or HTTP connections

**Module:** 28-packages | **Feature:** P2 network guard | **Task/Doc:** ST-2; AC-PACKAGES-12, OPERATIONS §11 niyam 8
**Severity:** P4 (asli npm registry `https` hai aur wo raasta ruka hai; guard ka daawa usse chauda hai) | **Priority:** Low | **Status:** Open
**Testing Type:** Test infrastructure | **Evidence level:** E1 | **Reproducibility:** Always (2/2) | **Environment:** local, sirf `127.0.0.2` (loopback, bahar kuch nahi gaya)
**Description:** Guard ka comment kehta hai test process "cannot open a connection to anything but this machine". Asal me ye sirf `socket.connect({ host })` aur TLS (`tls.connect`, `fetch https`) rokta hai; `net.connect()`, `net.createConnection()`, `http.get` aur `fetch http` nahi.
**Steps to Reproduce:** `installNetworkGuard()` ke baad har raaste se `127.0.0.2` pe connect.
**Expected Result:** Sab `Network guard: ...` se ruke.
**Actual Result:** `BLOCKED socket.connect`, `BLOCKED tls.connect`, `BLOCKED fetch https`; `NOT BLOCKED net.connect`, `net.createConnection`, `http.get`, `fetch http` (`ECONNREFUSED 127.0.0.2:65530`, yaani socket asli khula).
**Evidence:** Probe `p5-guard.ts`, dono run same.
**Root Cause:** `net.connect()` `socket.connect(normalizedArgs)` bulata hai, jiska pehla argument array hai; guard sirf `args[0].host` dekhta hai (`scripts/packages/test/utils/network-guard.ts:14-22`).
**Affected Files:** `scripts/packages/test/utils/network-guard.ts:11-24`
**Recommended Fix:** Array (normalized args) ke `[0].host` ko bhi dekho, aur `(port, host)` wala roop; ya `dns.lookup` ko loopback tak seemit karo.
**Fix route:** `28-packages` ke fixes ke PR me.
**Regression Risk:** Kam.
**Regression test to add:** `registry.test.ts`: `net.connect`, `http.get` aur `fetch http` bhi ruke.
**Owner decision needed:** Nahi

### [QA-DOC-001] Task docs contradict the code and each other on provenance and on the ST-8 real runs

**Module:** Docs | **Feature:** P7, F8 | **Task/Doc:** TASK 28 §4 niyam 5; TASK 01 §7
**Severity:** P4 (developer ko galat tasveer) | **Priority:** Low | **Status:** Open
**Testing Type:** Docs | **Evidence level:** E3 | **Reproducibility:** Always | **Environment:** static
**Description:** (1) TASK 28 §4 niyam 5 kehta hai "Har publish provenance ke saath", par laptop publish `--provenance=false` se chhapta hai (`scripts/packages/src/publish.ts:178-179`) aur OPERATIONS §11 yahi likhta hai. (2) TASK 01 §7 ST-8 ke tests kehte hain "Asli secondary pe kuch nahi chala", jabki usi file ka §10 aur HANDOFF §2 asli runs (2026-11-25) batate hain.
**Steps to Reproduce:** `docs/tasks/28-packages/TASK.md:102`, `docs/tasks/01-foundation/TASK.md:141` padho.
**Expected Result:** Ek hi sach: laptop pe provenance nahi (OPERATIONS §11); ST-8 ke asli runs ho gaye.
**Actual Result:** Ulti lines.
**Evidence:** Upar ki lines.
**Root Cause:** Badlav ke baad purani lines nahi badli.
**Affected Files:** `docs/tasks/28-packages/TASK.md:102`, `docs/tasks/01-foundation/TASK.md:141`
**Recommended Fix:** TASK 28 §4 niyam 5: "Workflow ka har publish provenance ke saath; laptop ka pehla publish bina (OIDC nahi, OPERATIONS §11)". TASK 01 §7: asli run ki line HANDOFF ke hisaab se.
**Fix route:** Docs, kisi bhi aane wale PR ke saath.
**Regression Risk:** Nahi.
**Regression test to add:** Nahi.
**Owner decision needed:** Nahi

## 5. Security Findings

| ID          | OWASP / ASVS                                                         | Severity | Live pe exposed?                     |
| ----------- | -------------------------------------------------------------------- | -------- | ------------------------------------ |
| QA-PKG-002  | A08 Software and Data Integrity; ASVS V14.1 (build), V8.3 (secrets)  | P2       | Nahi (abhi koi package nahi chhapa)  |
| QA-TOOL-001 | A05 Security Misconfiguration; ASVS V14.2                            | P3       | Nahi (laptop ka pehra)               |
| QA-FND-004  | A05 Security Misconfiguration; ASVS V8.3                             | P4       | Nahi                                 |
| QA-PKG-005  | A05 (test isolation)                                                 | P4       | Nahi                                 |
| QA-PKG-001  | A08 (release integrity, tags)                                        | P2       | Nahi (workflow abhi chala nahi, K-3) |

**Jo controls PASS hue:** har action commit SHA pe; har workflow `permissions: {}` se, har job ke kam haq; publish job me sirf `id-token: write` aur checkout nahi; npm token kahin nahi (OIDC); `pull_request_target` nahi; untrusted PR naam `env:` se, `branch-flow.mjs` workflow commands escape karta hai; gitleaks pinned binary SHA-256 ke saath, poori history, project ka `url-with-password` rule, koi path allowlist nahi; `npm audit` high/critical; env files `wx` se, sandesh me value kabhi nahi, `.env.production` kabhi nahi; ports sirf `127.0.0.1` (compose galat value pe mana karta hai); data sirf primary ki taraf aur sirf `beautinique` project; snapshot rotation sirf apne naam ke pattern wali files; CLI ke shell wale commands me koi user text nahi; `create` ka naam format traversal nahi hone deta; CHANGELOG me HTML aur link escape; confirm bina TTY ke kabhi haan nahi.

## 6. Performance Findings

Koi nahi. Scope me server nahi; CLI aur CI ke samay theek (packages ke unit tests 45 s, sabse lambe, kyunki asli npm aur git chalte hain).

## 7. Integration Issues

| Raasta                                      | Halat                                                                                       | Dependency band ho to                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Primary → local Docker (`infra:*`, tests)   | PASS (Exec, int tests)                                                                      | Docker band: saaf sandesh (unit tests)                                                                    |
| Primary → secondary Docker (ssh context)    | K-6 (owner ka asli run); audit me secondary band                                            | `infra:use`/`status` saaf chetavni (Exec: "does not answer"); `dev-data:copy` start fail pe saaf sandesh (Static) |
| Primary ↔ secondary ports (SSH tunnel)      | Unit + Static PASS                                                                          | Tunnel band: `waitForPorts` 15 s me fail aur band (Static); shaq QA-Q-6                                   |
| `dev-data:copy` (dump → restore pipe)       | Unit + Static PASS                                                                          | Beech me network gaya: shaq QA-Q-5                                                                        |
| `pack` job → `publish` job → `tag` job      | QA-PKG-001                                                                                  | Publish beech me fail: tags chhoot-te hain                                                                |
| CLI → npm registry (`status`, `publish`)    | PASS (fake registry)                                                                        | Registry band/5xx: error, "naya" nahi (Exec)                                                              |
| CI → GitHub, Dependabot                     | CI PASS; Dependabot K-4                                                                     | —                                                                                                         |

**NOT IMPLEMENTED** (planned, bug nahi): `02-platform` se `27-operations` tak saare 26 modules ([PROJECT_PLAN.md](PROJECT_PLAN.md) §3, §4: 0 points). `wake.yml` live server ko bulata hai, par wo `27-operations` ka hissa hai aur audit me chalaya nahi gaya.

## 8. Missing Test Coverage

| Module        | Scenario                                                                         | Kyun zaroori                                            | Test type          |
| ------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------ |
| 28-packages   | Workflow ke do run, pehle me beech me fail: tags (QA-PKG-001)                   | Chhapa version bina tag; `republish` galat              | Unit (fake registry) |
| 28-packages   | Naam ke saath publish, andar ki dependency npm pe nahi (QA-PKG-003)             | Install na hone wala package                            | Unit               |
| 28-packages   | Project ke secret shapes dist me (QA-PKG-002)                                    | DD-7 ka aakhri pehra                                    | Unit               |
| 28-packages   | Lockfile fail, bina CHANGELOG wala package (QA-PKG-004)                         | Restore ka daawa                                        | Unit               |
| 28-packages   | Network guard ke `net.connect`, `http`, `fetch http` raaste (QA-PKG-005)        | AC-PACKAGES-12 ka pehra                                 | Unit               |
| 01-foundation | `critical` glob jo kisi file se na mile (QA-FND-002)                             | Paisa/stock/permissions ka gate                         | Unit               |
| 01-foundation | Int test ke pehle-baad anonymous volumes (QA-FND-003)                            | TASK 01 §7 ka daawa                                     | Integration        |
| 01-foundation | Bade akshar wale env file naam (QA-FND-004)                                      | AC-FOUNDATION-3                                         | Unit               |
| 01-foundation | Root typecheck ki file list (QA-FND-001)                                         | TASK 01 §3.1 niyam 4                                    | Unit               |
| 01-foundation | `closeTunnel` jab ports kisi aur program ke hon (QA-Q-6)                         | Galat process na mare                                   | Unit               |
| 01-foundation | `copyFromSecondary` me dump beech me toote (QA-Q-5)                              | Local dev data                                          | Unit (fake spawn)  |

Mutation: laagu nahi (CLAUDE.md).

## 9. Questions and Unverified Assumptions

| Q-ID   | Sawal                                                                                                                                 | Kyun zaroori                                                       | Evidence                                                                                                                                                          | Claude ki recommendation                                                                                   | Owner ka jawab |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| QA-Q-1 | Integration tests ke liye kaunsa Docker?                                                                                              | Context `bq-infra` pahunch me nahi tha                             | §0                                                                                                                                                                | Primary local                                                                                              | Primary local Docker, sirf int tests ke waqt (2026-11-25) |
| QA-Q-2 | Live ya asli npm registry pe koi request?                                                                                             | Production pe kuch nahi                                            | §1                                                                                                                                                                | Kuch nahi                                                                                                  | Kuch nahi (2026-11-25) |
| QA-Q-3 | Public report me security detail kitni?                                                                                               | Report commit hote hi public                                       | Repo public                                                                                                                                                       | Class + `file:line`, repro chat me                                                                         | Poora repro report me (2026-11-25) |
| QA-Q-4 | Ye report [README.md](README.md) ki files ki list me jode?                                                                            | Index me na ho to doc dhoondhna mushkil                            | Skill sirf ye report aur HANDOFF badalne deti hai                                                                                                                | Haan, ek line, owner ki haan se                                                                            | Baaki          |
| QA-Q-5 | `dev-data:copy` ka pipe beech me toote (hotspot gaya) to local dev MongoDB aadha `--drop` ho sakta hai; kya pehle local snapshot lein? | Local development data; network phone ka hotspot hai              | E4: `mongorestore --drop` har collection restore se pehle girata hai (`scripts/foundation/src/dev-data.ts:63-68`, `:264-276`); copy se pehle local snapshot nahi (`scripts/foundation/bin/dev-data.ts:43-73`). Faisla D-462 "pipe, beech me file nahi" | Copy se pehle local `snapshotMongo` (pehle se bana function), ya dump pehle temp file me, phir restore      | Baaki          |
| QA-Q-6 | `closeTunnel` pid ko tab maarta hai jab ports jawab dein; ports kisi aur program ke ho sakte hain (ssh mar gaya, `tunnel.json` bacha, pid dobara mila) | Galat process maarna                                               | E4: `scripts/foundation/src/remote-infra.ts:160-172`; asli raasta tabhi jab `infra:use` ki jagah `docker context use` seedha chale                                   | Maarne se pehle pid ka image naam `ssh` hai ye jaancho (Windows: `tasklist /FI "PID eq <pid>"`)            | Baaki          |
| QA-Q-7 | Workflow guard ko aur kada karein?                                                                                                    | Aage ke workflows                                                  | `scripts/foundation/src/workflows.ts:56-80`: job-level `permissions: write-all`, `workflow_run` trigger aur local composite actions (`./`) ke andar ke `uses` nahi jaanche jaate | Teeno jodo (hardening, spec ke bahar)                                                                       | Baaki          |
| QA-Q-8 | Laptop publish me `git tag` fail ho to bhi "Published ..." list me tag aata hai                                                         | Tags ka sach                                                       | `scripts/packages/src/publish.ts:193-198` (tag ka exit code nahi dekha jaata)                                                                                    | Exit code dekho, fail pe chetavni                                                                          | Baaki          |
| QA-Q-9 | Windows pe `exec` ka shell quoting `\"` cmd.exe me kaam nahi karta                                                                     | Aaj safe (koi user text args me nahi), aage khatra                 | `scripts/packages/src/exec.ts:24-28`; saare npm/turbo args constants ya check hue naam                                                                         | Comment me shart saaf, ya args me `"` aaye to error                                                         | Baaki          |
| QA-Q-10 | `.envrc` (direnv) `.gitignore` me nahi                                                                                                | Isme bhi secrets hote hain                                         | `git check-ignore .envrc` → tracked ho sakta hai                                                                                                                  | `.envrc` jodo                                                                                              | Baaki          |

## 10. Recommended Fixing Order

1. **QA-PKG-001**: pehle workflow publish (`02-platform` ke packages) se pehle; asar sabse bada aur wapas nahi hota.
2. **QA-PKG-003**: usi PR me (dono `publish.ts`, ek hi test file).
3. **QA-PKG-002**: pehle package publish se pehle.
4. **QA-TOOL-001**: ek line, turant; owner ka `.env.example` wala faisla pehle.
5. **QA-FND-002**: pehle `critical` glob (charan 1 ki services) se pehle.
6. **QA-FND-001**: chhota; pehli baar type galtiyaan nikal sakti hain.
7. **QA-PKG-004**, **QA-PKG-005**: `28-packages` ke fixes ke PR me.
8. **QA-FND-004**: foundation ke chhote fix ke saath (6 ke saath).
9. **QA-FND-003**: owner ki haan (naam wala volume) ke baad.
10. **QA-DOC-001**: kisi bhi PR ke saath jo un docs ko chhoota hai.

**PRs ka group:** PR A `28-packages` (QA-PKG-001, 003, 002, 004, 005); PR B foundation ke pehre (QA-FND-001, 002, 004, aur `.claude/settings.json` ka QA-TOOL-001, 1–10 files hone pe seedha `prerelease` bhi chalega); QA-FND-003 alag; QA-DOC-001 A ya B ke saath. Mutation kisi me zaroori nahi.

## Change log

| Version          | Date       | Badlav                                                                                                                                                                                                                              |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.2.1 | 2026-11-25 | Dhaancha aur baseline (base `7abdd29`), Gate 1 ke jawab; `28-packages` + CI aur `01-foundation` + TOOL + DOC ka audit: 52 test cases (42 PASS, 10 FAIL), 11 findings (P2 2, P3 4, P4 5), §9 ke shaq aur sawal, aur fix ka kram. |
