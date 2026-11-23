# TASK 01: foundation (root setup)

> **Status:** v1.0.6 (2026-11-23). Halat: ST-1 se ST-3 ka code branch `feat/foundation-root` pe (PR ST-7 ke baad, owner); baaki subtasks baaki. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `01-foundation`, charan 0 ka pehla module (D-446). Progress: 0 / 14 points.

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

1. Root `package.json`: `private: true` (root kabhi publish nahi hota), `type: module`, workspaces `packages/*/*`, `frontend/*`, `backend/*` aur `scripts/*`. `frontend/*` aur `backend/*` ke deployables aur `scripts/*` npm packages nahi, isliye unpe bhi `private: true`; "saare packages public" (CR-36, D-445) sirf `packages/` ke packages pe.
2. Node ka version ek jagah pinned: `engines` aur `devEngines` ([OPERATIONS.md](../../OPERATIONS.md) §11 niyam 3). npm ka version bhi pinned (`devEngines` aur `packageManager`). Dono sabse naye security release pe exact: abhi Node 24.22.3 aur npm 12.2.3 (D-458). CI ka setup-node bhi `devEngines` se padhta hai.
3. Turborepo ke tasks: `build`, `typecheck`, `lint`, `test`, `dev`. Dependency pehle, aur jo nahi badla uska kaam local cache se. Remote cache nahi.
4. Root ke scripts sirf Turborepo ya `scripts/` ke tools bulate hain; root me koi business code nahi. Root ki apni files (`configs/`, `eslint.config.js`, `.github/scripts`) ka lint aur typecheck Turborepo ke root tasks `lint:root` aur `typecheck:root` se; `format`, `format:check` aur `secrets:scan` seedha Prettier aur gitleaks bulate hain.

### 3.2 Saajhe config (`configs/`)

1. **TypeScript:** strict, sirf ESM; Node (backend aur packages) aur React (frontend) ke do base config ([RULES.md](../../RULES.md) §3). Bana: `configs/typescript/base.json` (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, imports `.ts` extension ke saath, `noEmit`), `node.json` (`nodenext`, `@types/node` 24) aur `react.json` (`bundler`, `react-jsx`, DOM). TypeScript 6.0.3: typescript-eslint abhi `<6.1` hi maanta hai, isliye TypeScript 7 nahi.
2. **ESLint:** flat config ka dhaancha jis pe baad ke modules apne niyam jodte hain. Bana: `configs/eslint/base.js` (ESLint 10, `@eslint/js` recommended, typescript-eslint `strictTypeChecked` type-aware, type imports, aur aakhir me `eslint-config-prettier`); root ka `eslint.config.js` yahi hai, aur workspace apne niyam apne `eslint.config.js` me `defineConfig(base, ...)` se jodta hai.
3. **Prettier:** abhi wala config (`printWidth` 100, `endOfLine: lf`) waisa hi, root ki `.prettierrc.json` me.
4. **Vitest:** projects ka dhaancha, aur coverage ki seemaayein area ke hisaab se ([RULES.md](../../RULES.md) RT-23), jo apne area ka code aane pe laagu hoti hain. Bana: `configs/vitest/workspace.ts`, workspace ke `vitest.config.ts` me `workspaceTestConfig({ area, critical })`; seemaayein aur unka hisaab `configs/vitest/coverage.ts` me. Projects: `unit` (`src/` ya `test/` me `*.test.ts`) aur `integration` (`*.int.test.ts`, containers pe, lambi timeout); `fixtures/` ki files kabhi apne aap nahi chalti. Coverage V8 se: `area: kernel` pe poore package pe 90% branch, `critical` globs (paisa, stock, permissions) pe 85% branch, aur in dono ke neeche run fail; baaki sirf report (70% lines release se pehle). Workspace ka `test` script `vitest run --coverage`.

### 3.3 Laptop ka infra (`infra/`)

1. Ek compose file, compose profiles ke saath: sirf us kaam ke containers chalu jo abhi chahiye.
2. Har image exact version pe pinned, ports sirf `127.0.0.1` pe.
3. Is module me `mongo` (replica set, transactions ke liye; version [OPERATIONS.md](../../OPERATIONS.md) §1 niyam 3 se) aur `valkey` (25 MB, `noeviction`). Baaki containers (`atlas-local`, `postgres`, `pgbouncer`, `mail`) apne pehle module ke saath judte hain.
4. Commands: `infra:up` (profile ke saath, tab tak rukta hai jab tak containers taiyaar na hon) aur `infra:down`.
5. Bana: [infra/compose.yaml](../../../infra/compose.yaml), project `beautinique`. `mongo:8.0.38` (single-member replica set `rs0`; healthcheck pehli baar replica set banata hai aur tab healthy jab member writable primary ho) aur `valkey/valkey:8.1.12` (Render Key Value ka 8.1; 25 MB, `noeviction`, disk pe kuch nahi), dono profile `backend` me. Ports `127.0.0.1:27017` aur `127.0.0.1:6379`, `BQ_MONGO_PORT` aur `BQ_VALKEY_PORT` se badal sakte hain (container ke andar bhi wahi port, taaki replica set ka pata bahar aur andar ek ho); isi se doosra set (tests, aage mutation ke containers) saath chal sakta hai. Tool `scripts/foundation/bin/infra.ts`: `npm run infra:up -- backend` (Docker band ho ya profile anjaan ho to saaf sandesh, phir `docker compose up --wait`, 180 second tak) aur `npm run infra:down` (saare profiles; MongoDB ka data volume rehta hai).

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
2. Hatana destructive hai; owner ki haan is shart ke saath ki purana code tabhi hate jab wo kahin use nahi ho raha (D-073 niyam 4, D-455). Isliye pehle jaanch: naye root, CI, `.github/` aur docs me kuch bhi `*-old/` ya purani root files pe tika nahi. Abhi CI ka `static` job purane root `package.json` aur lockfile se Prettier laata hai, to naya root usi PR me.
3. Purana kaam git tag `discovery-old-docs` se milta hai: us tag ke baad purane code me koi badlav nahi hua (2026-11-22 ko jaancha), isliye naya tag nahi chahiye.
4. Repo ke root ki `external.command` file hati (owner, D-457). Uski secret scan wali command ab root ka `npm run secrets:scan` hai (laptop pe gitleaks chahiye).
5. Purane folders ki git ke bahar ki files (build output, `node_modules`, development ki `.env`) bhi hatin, siwaye do `.env.production` ke, jo owner dekhega ([OWNER_TASKS.md](../../OWNER_TASKS.md) OT-7, D-457).

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
- **ST-1 ke tests** (`scripts/foundation`, `npm test` se, CI ke `test` job me):
  - [turbo-pipeline.test.ts](../../../scripts/foundation/test/turbo-pipeline.test.ts): `AC-FOUNDATION-9`, repo ke `turbo.json` ke saath do workspaces ka monorepo; dependency pehle, kuch na badle to sab local cache se, aur sirf badle package ka kaam dobara.
  - [root-checks.test.ts](../../../scripts/foundation/test/root-checks.test.ts): `AC-FOUNDATION-11` (git me koi `*-old/` folder nahi), Node aur npm ka ek hi exact pin, workspaces ka `private` (§3.1 niyam 1), aur remote cache band; har pehre ke saath galat misaal.
- **ST-2 ke tests:** [shared-configs.test.ts](../../../scripts/foundation/test/shared-configs.test.ts), galat misaalein `test/fixtures/` me: `AC-FOUNDATION-6` ka ESLint aur typecheck wala hissa (`any`, type-aware floating promise, aur type error, file aur line ke saath), React aur Node base ka farak (DOM), aur `RT-23` (kernel 90% aur critical 85% se neeche run fail, baaki sirf report). Prettier aur docs ke paths wala hissa ST-5 me.
- **ST-3 ke tests:** [infra.test.ts](../../../scripts/foundation/test/infra.test.ts) (bina Docker chale, sirf CLI se config padh ke): `AC-FOUNDATION-2` ka pehra (har image exact version, har container profile ke peeche, har port `127.0.0.1` pe; galat misaal ke saath), versions live jaise, aur `backend` profile me sirf `mongo` aur `valkey`. [infra.int.test.ts](../../../scripts/foundation/test/infra.int.test.ts): `AC-FOUNDATION-2` asli containers pe, alag project `bq-infra-test` aur alag ports (37017, 36379) pe: `infra:up backend` ke baad sirf do containers, healthy, `127.0.0.1` pe; transaction commit; Valkey me 25 MB aur `noeviction`; `infra:down` ke baad koi container nahi, aur aakhir me volumes bhi saaf.

## 8. Dependencies

- **Tika hai:** kuch nahi.
- **Is pe tike:** `28-packages`, `02-platform`, `03-frontend-kit`, aur baaki saare modules.
- **Owner ke kaam:** GitHub ki security settings aur rulesets ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3, "Naye root setup aur CI se pehle"); purana code hatane ki haan (§3.7).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.15 `FOUNDATION` (`AC-FOUNDATION-1` se `AC-FOUNDATION-11`, D-447). Har criterion ka kam se kam ek test, naam me criterion ka id ([RULES.md](../../RULES.md) DD-1).
- **Manuals aur testing ki files:** kisi app ke role ka feature nahi, isliye laagu nahi. Laptop ka setup [OPERATIONS.md](../../OPERATIONS.md) §1 aur root README me (ST-7).

## 10. Subtasks

Har subtask lagbhag ek PR jitna, aur saare charan 0 me ([PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5, D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                               | Size   | Halat     |
| ---- | ------------------------------------------------------------------------------------- | ------ | --------- |
| ST-1 | Purana code hatana (owner ki haan), naya root `package.json`, lockfile aur Turborepo  | M (2)  | Branch pe |
| ST-2 | `configs/`: TypeScript, ESLint, Prettier aur Vitest ke saajhe config                  | M (2)  | Branch pe |
| ST-3 | `infra/` ki compose file (`mongo` replica set, `valkey`), `infra:up` aur `infra:down` | M (2)  | Branch pe |
| ST-4 | Env files ka dhaancha aur `npm run setup`                                             | M (2)  | Baaki     |
| ST-5 | CI: `static` aur `test` jobs, repo ke pehre, aur `check` me sab                       | L (4)  | Baaki     |
| ST-6 | Mahine ke dependency PRs                                                              | S (1)  | Baaki     |
| ST-7 | Root README, CLAUDE.md ke commands aur OPERATIONS §1 ki commands ki list              | S (1)  | Baaki     |
|      | **Kul**                                                                               | **14** |           |

## Change log

| Version          | Date       | Badlav                                                                                                                                                                                                                                                          |
| ---------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.2 | 2026-11-22 | Module 01 ka pehla spec, 7 subtasks (D-446) acceptance criteria ki link (D-447) aur deployables pe `private: true`; code abhi nahi.                                                                                                                             |
| v1.0.3 se v1.0.6 | 2026-11-23 | Purane code ki shart aur `external.command` (D-455); ST-1 ka code: naya root aur Turborepo, purana code hata (D-457, D-458); ST-2 ka code: `configs/` ke TypeScript, ESLint aur Vitest config. ST-3 ka code: `infra/compose.yaml`, `infra:up` aur `infra:down`. |
