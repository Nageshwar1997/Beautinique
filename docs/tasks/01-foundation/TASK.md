# TASK 01: foundation (root setup)

> **Status:** v1.0.1 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `01-foundation`, charan 0 ka pehla module (D-446). Progress: 0 / 14 points.

## 1. Lakshya

Naya root setup, jis pe saara naya code chalta hai: npm workspaces ka monorepo, saajhe config, laptop ka infra, env files, CI ke saare pehre aur dependencies ke PRs. Isi ke saath purana code hat-ta hai (D-073). Iske baad `28-packages` aur saajhe packages ban sakte hain.

## 2. Scope

**Andar:**

- Root `package.json`, lockfile aur Turborepo (D-001, D-002).
- `configs/`: TypeScript, ESLint aur Vitest ke saajhe config; Prettier.
- `infra/`: laptop ke containers ki compose file ([OPERATIONS.md](../../OPERATIONS.md) §1 niyam 2 se 4).
- Env files ka dhaancha aur naye laptop ka setup ek command se ([OPERATIONS.md](../../OPERATIONS.md) §1 niyam 9 aur 10, D-441).
- CI ki saari jobs aur repo ke pehre ([OPERATIONS.md](../../OPERATIONS.md) §2).
- Mahine ke dependency PRs ([OPERATIONS.md](../../OPERATIONS.md) §11 niyam 1).
- `*-old/` folders aur purani root files ka hatna (D-073), owner ki haan se.
- Root ka README, aur [CLAUDE.md](../../../CLAUDE.md) ka "Commands aur repo ka naksha".

**Bahar:**

- Packages ka CLI aur publish ka workflow: `28-packages`.
- Saajhe packages ka code: `02-platform` aur `03-frontend-kit`.
- Mutation testing ka tooling: `02-platform` ke kernel packages ke saath ([RULES.md](../../RULES.md) RT-21).
- E2E (Playwright) ka dhaancha: charan 1 ke pehle app ke saath.
- Service ki deewar aur config namespace ke lint ke apne niyam (SR-071): charan 1 ki pehli services ke saath. Yahan sirf ESLint ka dhaancha.
- Deploy, jagane ke pings aur backup: `27-operations`.

## 3. Functional requirements

### 3.1 Root aur workspaces

1. Root `package.json`: `private: true` (root kabhi publish nahi hota), `type: module`, workspaces `packages/*/*`, `frontend/*`, `backend/*` aur `scripts/*`.
2. Node ka version ek jagah pinned: `engines` aur `devEngines` ([OPERATIONS.md](../../OPERATIONS.md) §11 niyam 3). npm ka version bhi pinned.
3. Turborepo ke tasks: `build`, `typecheck`, `lint`, `test`, `dev`. Dependency pehle, aur jo nahi badla uska kaam local cache se. Remote cache nahi.
4. Root ke scripts sirf Turborepo ya `scripts/` ke tools bulate hain; root me koi business code nahi.

### 3.2 Saajhe config (`configs/`)

1. **TypeScript:** strict, sirf ESM; Node (backend aur packages) aur React (frontend) ke do base config ([RULES.md](../../RULES.md) §3).
2. **ESLint:** flat config ka dhaancha jis pe baad ke modules apne niyam jodte hain.
3. **Prettier:** abhi wala config (`printWidth` 100, `endOfLine: lf`) waisa hi.
4. **Vitest:** projects ka dhaancha, aur coverage ki seemaayein area ke hisaab se ([RULES.md](../../RULES.md) RT-23), jo apne area ka code aane pe laagu hoti hain.

### 3.3 Laptop ka infra (`infra/`)

1. Ek compose file, compose profiles ke saath: sirf us kaam ke containers chalu jo abhi chahiye.
2. Har image exact version pe pinned, ports sirf `127.0.0.1` pe.
3. Is module me `mongo` (replica set, transactions ke liye; version [OPERATIONS.md](../../OPERATIONS.md) §1 niyam 3 se) aur `valkey` (25 MB, `noeviction`). Baaki containers (`atlas-local`, `postgres`, `pgbouncer`, `mail`) apne pehle module ke saath judte hain.
4. Commands: `infra:up` (profile ke saath, tab tak rukta hai jab tak containers taiyaar na hon) aur `infra:down`.

### 3.4 Env files aur setup

1. `.gitignore` me `.env` aur `.env.*`, siwaye `.env.example` (D-441).
2. `.env.example` ka dhaancha: DEVELOPMENT, TEST aur PRODUCTION ke teen hisse. Keys apni services ke saath judti hain.
3. `npm run setup`: Node aur npm ke version ki jaanch, `npm ci`, `.env.development` aur `.env.test` `.env.example` se (pehle se hon to nahi chhedta), aur `infra:up`. Seed apni services ke saath judta hai.
4. Setup ya koi tool `.env.production` kabhi nahi banata, padhta ya chhoota (D-441, CLAUDE.md).

### 3.5 CI ([OPERATIONS.md](../../OPERATIONS.md) §2)

1. **Jobs ek saath, sirf `check` baaki sabka nateeja jodta hai** (niyam 1 aur 2). `check` ka naam nahi badalta.
2. **`guard`** (abhi bhi hai): poori history ka secret scan, branch flow ki jaanch, aur `npm audit` (high aur critical pe laal) (niyam 3).
3. **`static`:** Prettier (abhi bhi hai), ESLint, typecheck, build, aur docs ke paths ka check (niyam 5, D-019).
4. **`test`:** unit aur integration tests, `mongo` aur `valkey` containers pe (niyam 6). Baaki containers apne modules ke saath.
5. **Repo ke pehre** (niyam 6 aur 7): koi `.env` file git me nahi; backup folder ki koi file git me nahi (D-013); har action commit SHA pe pinned; workflow ka default `permissions: {}`; `pull_request_target` nahi.
6. `prerelease` aur `release` pe `push` trigger, aur PR pe bhi (niyam 11).
7. Abhi ka `wake` workflow waisa hi rehta hai (`27-operations` ka kaam).

### 3.6 Dependency ke PRs

Mahine me ek baar apne aap PRs, `prerelease` pe: minor aur patch ek group me, major alag PR me; security alert (high ya critical) pe turant ([OPERATIONS.md](../../OPERATIONS.md) §11 niyam 1). Merge owner karta hai (niyam 5).

### 3.7 Purana code hatana (D-073)

1. `*-old/` folders aur purani root files (purana `package.json`, lockfile, `turbo.json`, `eslint.config.js`, `vitest.config.mjs`, `.vscode/`) naye root setup ke PR me hi hat-te hain, taaki repo kabhi do setup ke saath na rahe.
2. Hatana destructive hai, isliye us PR se pehle owner ki haan (D-073 niyam 4).
3. Purana kaam git tag `discovery-old-docs` se milta hai: us tag ke baad purane code me koi badlav nahi hua (2026-11-22 ko jaancha), isliye naya tag nahi chahiye.
4. Repo ke root ki `external.command` file owner ki hai; use hatane ya rakhne ka faisla owner ka.

### 3.8 Docs

1. Root ka README: project kya hai, repo ka naksha, laptop pe kaise chalayein.
2. [CLAUDE.md](../../../CLAUDE.md) ka "Commands aur repo ka naksha": asli commands, aur "abhi koi npm command nahi chalta" wali line ki jagah.
3. [OPERATIONS.md](../../OPERATIONS.md) §1 niyam 10 me commands ki asli list.

## 4. Niyam

1. Folders aur naam D-002 se; tools D-001 se.
2. Har image, action aur tool ka version pinned.
3. CI me koi production secret ya deploy key nahi ([OPERATIONS.md](../../OPERATIONS.md) §2 niyam 8).
4. Laptop, tests aur CI kabhi live databases ya live Redis se nahi judte ([OPERATIONS.md](../../OPERATIONS.md) §1 niyam 7).
5. Containers sirf zaroorat ke: kaam khatam to `infra:down`.
6. Commit, PR aur release ke sandesh me koi AI attribution nahi (CLAUDE.md).

## 5. Data model aur API

Koi database ya HTTP API nahi. Is module ki "API" root ke commands hain: `setup`, `infra:up`, `infra:down`, `build`, `typecheck`, `lint`, `test`, `dev`.

## 6. Security

- **Supply chain** (SR-082): lockfile aur `npm ci`, actions SHA pe pinned, default `permissions: {}`, fork PRs ko secret nahi, `pull_request_target` nahi, dependency alerts.
- **Secrets:** poori history ka secret scan (`guard`); koi `.env` git me nahi; Claude `.env` aur `.env.*` kabhi nahi kholta (CLAUDE.md).
- **Repo ki settings** (SR-080): GitHub ki push protection, private security advisory aur branch ke rulesets ([OPERATIONS.md](../../OPERATIONS.md) §2 niyam 10) owner ka kaam ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).
- **Ports** sirf `127.0.0.1` pe.

## 7. Tests

- Har criterion ka kam se kam ek test ([RULES.md](../../RULES.md) DD-1). CI ke pehron ke liye "galat" misaal wala test, jo pehre ke bina fail ho ([RULES.md](../../RULES.md) §3).
- `setup` ka test ek saaf clone jaisi jagah pe, bina asli secrets ke.
- Mutation testing is module me nahi.

## 8. Dependencies

- **Tika hai:** kuch nahi.
- **Is pe tike:** `28-packages`, `02-platform`, `03-frontend-kit`, aur baaki saare modules.
- **Owner ke kaam:** GitHub ki security settings aur rulesets ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3, "Naye root setup aur CI se pehle"); purana code hatane ki haan (§3.7).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.15 `FOUNDATION` (`AC-FOUNDATION-1` se `AC-FOUNDATION-11`, D-447). Har criterion ka kam se kam ek test, naam me criterion ka id ([RULES.md](../../RULES.md) DD-1).
- **Manuals aur testing ki files:** kisi app ke role ka feature nahi, isliye laagu nahi. Laptop ka setup [OPERATIONS.md](../../OPERATIONS.md) §1 aur root README me (ST-7).

## 10. Subtasks

Har subtask lagbhag ek PR jitna, aur saare charan 0 me ([PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5, D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                               | Size   | Halat |
| ---- | ------------------------------------------------------------------------------------- | ------ | ----- |
| ST-1 | Purana code hatana (owner ki haan), naya root `package.json`, lockfile aur Turborepo  | M (2)  | Baaki |
| ST-2 | `configs/`: TypeScript, ESLint, Prettier aur Vitest ke saajhe config                  | M (2)  | Baaki |
| ST-3 | `infra/` ki compose file (`mongo` replica set, `valkey`), `infra:up` aur `infra:down` | M (2)  | Baaki |
| ST-4 | Env files ka dhaancha aur `npm run setup`                                             | M (2)  | Baaki |
| ST-5 | CI: `static` aur `test` jobs, repo ke pehre, aur `check` me sab                       | L (4)  | Baaki |
| ST-6 | Mahine ke dependency PRs                                                              | S (1)  | Baaki |
| ST-7 | Root README, CLAUDE.md ke commands aur OPERATIONS §1 ki commands ki list              | S (1)  | Baaki |
|      | **Kul**                                                                               | **14** |       |

## Change log

| Version          | Date       | Badlav                                                                                               |
| ---------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.1 | 2026-11-22 | Module 01 ka pehla spec, 7 subtasks (D-446) aur acceptance criteria ki link (D-447); code abhi nahi. |
