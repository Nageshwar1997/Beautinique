# TASK 01: foundation (root setup)

> **Status:** v1.0.14 (2026-11-23). Halat: ST-1 se ST-7 **ho gaye** (2026-11-23): PR [#102](https://github.com/Nageshwar1997/Beautinique/pull/102) se `prerelease` me (`ad42467`), PR aur merge ke baad dono pe CI ka `check` green. **ST-8 (do laptop, D-462) branch pe**: code aur tests likhe, secondary abhi bani nahi to uski asli machine pe jaancha nahi gaya. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `01-foundation`, charan 0 ka pehla module (D-446). Progress: 14 / 16 points.

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
- Do laptop (D-462, ST-8): secondary ke Docker se jodna, SSH tunnel, development data ka snapshot aur copy, tests ke containers ka data tmpfs me ([OPERATIONS.md](../../OPERATIONS.md) §1 niyam 11 se 14).

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
5. Bana: `.env.example` ke hisse marker lines se shuru hote hain: `# [DEVELOPMENT]`, `# [TEST]`, `# [PRODUCTION]`. Jaanch (`scripts/foundation/src/env-files.ts`): teeno hisse ek-ek baar, har hisse me wahi keys (ek config schema, har key required), keys `UPPER_SNAKE_CASE`, aur PRODUCTION me har value `<...>`; galti ke sandesh me kabhi value nahi. Deployable = `frontend/*` ya `backend/*` ka folder jisme `.env.example` ho. Files sirf `wx` (sirf naya banana) se likhi jaati hain, to pehle se bani file kabhi khulti bhi nahi; nayi file me jo `<...>` bache, unke naam setup batata hai.
6. Bana: `npm run setup` (`scripts/foundation/bin/setup.ts`, sirf Node ke apne modules, kyunki ye `npm ci` se pehle chalta hai): version ki jaanch, `npm ci --ignore-scripts` (CI jaisa), env files, phir Docker ki jaanch aur `infra:up backend`. Galat Node ya npm pe `npm run` ko npm khud `EBADDEVENGINES` se rokta hai; setup ki apni jaanch tab, jab tool seedha `node` se chale, aur wo theek karne ka tareeka bhi batati hai.

### 3.5 CI ([OPERATIONS.md](../../OPERATIONS.md) §2)

1. **Jobs ek saath, sirf `check` baaki sabka nateeja jodta hai** (niyam 1 aur 2). `check` ka naam nahi badalta.
2. **`guard`** (abhi bhi hai): poori history ka secret scan, branch flow ki jaanch, aur `npm audit` (high aur critical pe laal) (niyam 3).
3. **`static`:** Prettier (abhi bhi hai), ESLint, typecheck, build, aur docs ke paths ka check (niyam 5, D-019).
4. **`test`:** unit aur integration tests, `mongo` aur `valkey` containers pe (niyam 6). Baaki containers apne modules ke saath.
5. **Repo ke pehre** (niyam 6 aur 7): koi `.env` file git me nahi; backup folder ki koi file git me nahi (D-013); har action commit SHA pe pinned; workflow ka default `permissions: {}`; `pull_request_target` nahi.
6. `prerelease` aur `release` pe `push` trigger, aur PR pe bhi (niyam 11).
7. Abhi ka `wake` workflow waisa hi rehta hai (`27-operations` ka kaam).
8. Bana ([ci.yml](../../../.github/workflows/ci.yml)): `guard` pehle secret scan ka apna test ([secret-scan.test.mjs](../../../.github/scripts/secret-scan.test.mjs): nakli password wala commit laal, password log me nahi), phir poori history ka scan, branch flow ke tests aur jaanch, aur `npm audit`. `static`: Prettier (galti pe uska fix diff ke roop me, jisse lines dikhein), ESLint, typecheck, build aur `npm run docs:check`. `test` (20 minute): `.env.test` `.env.example` ke [TEST] se (`scripts/foundation/bin/env-files.ts test`, koi secret nahi), `infra:up backend`, phir `npm test` (unit aur integration, coverage ki seemaayein ke saath). `check` teeno ka nateeja jodta hai.
9. Bana: pehre `scripts/foundation` me, `npm test` se CI ke `test` job me: workflows (`src/workflows.ts`: default `permissions: {}`, `pull_request_target` nahi, har action SHA pe, har job ka `timeout-minutes`, aur `check` ka niyam), env files aur backup folder git me nahi (`src/env-files.ts`, `src/root-checks.ts`). Workflow padhne ke liye `yaml` 2.9.1 (devDependency; OPERATIONS §11 niyam 2 ki jaanch: ISC, koi dependency ya install script nahi, haal me update; Node me YAML parser nahi).
10. Docs ke paths (D-019, `src/docs-paths.ts`): `docs/`, `README.md` aur `CLAUDE.md` ki har relative link ka target repo me ho (`#heading` aur `:line` chhod ke, code blocks ke bahar); galti `file:line` ke saath. Backtick wale naam nahi jaanche jaate: unme aage banne wali files, branches aur ids bhi hain (2026-11-23 ko 118 me se 64 asli file nahi the).
11. Backup folder `backups/` (D-460): `.gitignore`, Prettier, ESLint aur Vitest se bahar, aur `.claude/settings.json` me Claude ke liye Read aur Edit ka deny.

### 3.6 Dependency ke PRs

Mahine me ek baar apne aap PRs, `prerelease` pe: npm aur GitHub Actions ke minor aur patch ek group me, major alag PR me; `infra/` ki images ke sirf patch; har naya version 7 din baad (cooldown). Security alert (high ya critical) pe turant: GitHub ki alert email se, fix branch `prerelease` se; GitHub ke apne security PR band, kyunki wo sirf `release` pe khulte hain ([OPERATIONS.md](../../OPERATIONS.md) §11 niyam 1, D-461). Merge owner karta hai (niyam 5). Config [dependabot.yml](../../../.github/dependabot.yml); GitHub ise default branch se padhta hai, to ye `release` pe pahunchne ke baad chalta hai.

### 3.7 Purana code hatana (D-073)

1. `*-old/` folders aur purani root files (purana `package.json`, lockfile, `turbo.json`, `eslint.config.js`, `vitest.config.mjs`, `.vscode/`) naye root setup ke PR me hi hat-te hain, taaki repo kabhi do setup ke saath na rahe.
2. Hatana destructive hai; owner ki haan is shart ke saath ki purana code tabhi hate jab wo kahin use nahi ho raha (D-073 niyam 4, D-455). Isliye pehle jaanch: naye root, CI, `.github/` aur docs me kuch bhi `*-old/` ya purani root files pe tika nahi. Abhi CI ka `static` job purane root `package.json` aur lockfile se Prettier laata hai, to naya root usi PR me.
3. Purana kaam git tag `discovery-old-docs` se milta hai: us tag ke baad purane code me koi badlav nahi hua (2026-11-22 ko jaancha), isliye naya tag nahi chahiye.
4. Repo ke root ki `external.command` file hati (owner, D-457). Uski secret scan wali command ab root ka `npm run secrets:scan` hai (laptop pe gitleaks chahiye).
5. Purane folders ki git ke bahar ki files (build output, `node_modules`, development ki `.env`) bhi hatin, siwaye do `.env.production` ke, jo owner ne khud hatayin ([OWNER_TASKS.md](../../OWNER_TASKS.md) OT-7, D-457).

### 3.8 Docs

1. Root ka [README](../../../README.md): project kya hai, repo ka naksha, laptop pe kaise chalayein, aur commands ki poori list (har ek ka kaam). List sirf yahin; baaki jagah link (D-019).
2. [CLAUDE.md](../../../CLAUDE.md) ka "Commands aur repo ka naksha": naksha aur commands ke naam, README ki link ke saath.
3. [OPERATIONS.md](../../OPERATIONS.md) §1 niyam 10 me setup ka asli kaam aur commands ki list ki link; niyam 9 me `.env.example` ke marker.
4. README aur CLAUDE.md ki har `npm run` command root `package.json` ki script ho; `npm run docs:check` ise bhi jaanchta hai (D-019).

### 3.9 Do laptop (ST-8, D-462)

1. **Remote Docker context pehchaanna:** current context (ya `DOCKER_HOST`) ka endpoint `ssh://` se shuru ho to remote. Local context pe `infra:up` aur `infra:down` waise hi chalte hain, kuch nahi badalta.
2. **Tunnel:** remote context pe `infra:up` containers uthane ke baad, jin profiles ko uthaya unke har published port (`docker compose config` se, `BQ_*_PORT` samet) ke liye ek hi SSH tunnel kholta hai, ssh host alias `bq-infra-tunnel` se (Docker context ka alias `bq-infra` alag), har port `127.0.0.1` se `127.0.0.1` tak. Process id repo ke bahar (`~/.bq-infra/tunnel.json`) yaad rehta hai, aur `infra:down` use band karta hai (process tabhi maara jaata hai jab uske ports abhi bhi jawab dein, taaki reboot ke baad dobara mila pid kabhi na chhua jaye). Primary ka koi port pehle se liya ho (purana tunnel ya local Docker) to `infra:up` kuch uthane se pehle saaf sandesh ke saath ruk jata hai.
3. **Snapshot:** remote context pe har `infra:down` pehle chalte MongoDB ka `mongodump` (gzip archive) primary pe `%USERPROFILE%\bq-dev-data\` me rakhta hai (repo ke bahar), aakhri 3 rakhta hai. Snapshot na ban paye to chetavni, par `down` phir bhi chalta hai (data volume rehta hai).
4. **`npm run dev-data:copy`:** secondary ke development MongoDB se `mongodump` seedha primary ke `mongorestore` me (pipe, beech me file nahi), sirf compose project `beautinique`. **`npm run dev-data:restore`:** latest snapshot primary ke local containers me. Dono sirf primary ki taraf: secondary ki taraf, ya kisi aur compose project (restore ke abhyaas ke containers samet) pe mana. Primary ka local context `docker context ls` se chunta hai (`desktop-linux` pehle), aur `DOCKER_HOST` set ho to rukta hai.
5. **Compose:** `infra/compose.ephemeral.yaml` (`BQ_DATA_IN_MEMORY=true`) MongoDB ka data tmpfs me rakhta hai, volume nahi; sirf alag `COMPOSE_PROJECT_NAME` ke saath, development project pe mana. Tests ke int tests ye chalu rakhte hain. MongoDB `--wiredTigerCacheSizeGB 0.25` ke saath.
6. **Kaunsa laptop:** `npm run infra:use -- secondary|primary` Docker ka context saaf naam se badalta hai: containers ya tunnel chalu ho to rukta hai, `DOCKER_HOST` ya `DOCKER_CONTEXT` laga ho to rukta hai, aur purana laptop pahunch me na ho to chetavni ke saath badalta hai. `npm run infra:status` abhi ka laptop, Docker, containers aur tunnel batata hai, aur `infra:up` shuru me laptop ka naam. Har command pe alag option nahi: tests aur `dev-data:*` bhi Docker ka context hi dekhte hain.
7. Bana: [machine.ts](../../../scripts/foundation/src/machine.ts), [remote-infra.ts](../../../scripts/foundation/src/remote-infra.ts), [dev-data.ts](../../../scripts/foundation/src/dev-data.ts), [infra.ts](../../../scripts/foundation/bin/infra.ts), [dev-data.ts](../../../scripts/foundation/bin/dev-data.ts) aur [compose.ephemeral.yaml](../../../infra/compose.ephemeral.yaml).

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
- **ST-5 ke tests:** [workflows.test.ts](../../../scripts/foundation/test/workflows.test.ts): `AC-FOUNDATION-7` (har workflow, aur galat misaalein), `AC-FOUNDATION-4` (`check` ka niyam, aur galat misaalein), `AC-FOUNDATION-5` (`guard` ke steps aur unka kram; secret wala hissa `guard` me [secret-scan.test.mjs](../../../.github/scripts/secret-scan.test.mjs) se), `AC-FOUNDATION-6` (`static` ke steps, aur repo ka Prettier config galat formatting pe fail). [docs-paths.test.ts](../../../scripts/foundation/test/docs-paths.test.ts): `AC-FOUNDATION-6` docs ki links (asli docs, aur tooti link `file:line` ke saath). [root-checks.test.ts](../../../scripts/foundation/test/root-checks.test.ts): `AC-FOUNDATION-8` (`backups/` git ignore kare, koi backup file git me nahi; kamzor `.gitignore` aur git me backup file pakdi jaye). Process chalane wale tests ki seema 60 second, kyunki poora suite ek saath chalne pe 5 second kam padte the (RT-25).
- **ST-6 ke tests:** [dependabot.test.ts](../../../scripts/foundation/test/dependabot.test.ts): `AC-FOUNDATION-10` (repo ka config: teeno ecosystem, mahine me, `prerelease` pe, 7 din ka cooldown, npm aur Actions ke minor aur patch ek group me aur major akele, images ke sirf patch); galat misaalein: hafte ka schedule, `release` target, cooldown nahi, group me major, major ignore, security ka group, images pe minor, ecosystem gayab aur galat directory.
- **ST-7 ke tests:** [docs-paths.test.ts](../../../scripts/foundation/test/docs-paths.test.ts): `AC-FOUNDATION-6` (README aur CLAUDE.md ki har `npm run` command root script hai; galat misaal: anjaan command file aur line ke saath pakdi jaye).
- **ST-4 ke tests:** [env-files.test.ts](../../../scripts/foundation/test/env-files.test.ts): `.env.example` ki jaanch (galat misaalein, value kabhi sandesh me nahi), `AC-FOUNDATION-1` (missing file bani, bani hui file chhodi), `AC-FOUNDATION-3` (`.env.production` na bani na chhui; git har env file ignore kare par `.env.example` nahi, kamzor `.gitignore` pakda jaye; koi env file git me nahi, aur ho to pakdi jaye). [setup.test.ts](../../../scripts/foundation/test/setup.test.ts): `AC-FOUNDATION-1` galat version ka sandesh, aur galat Node pe setup kuch install ya banane se pehle ruke. [setup.int.test.ts](../../../scripts/foundation/test/setup.int.test.ts): `AC-FOUNDATION-1` saaf clone (git ki files, ek nakli service ki `.env.example`, koi asli secret nahi) pe asli setup: `npm ci`, `.env.development` bani, `.env.test` chhodi, `.env.production` na chhui na sandesh me, aur alag project aur ports pe dono containers healthy.
- **ST-8 ke tests:** [machine.test.ts](../../../scripts/foundation/test/machine.test.ts): `AC-FOUNDATION-15` (laptop ke naam, badalna kab ruke, emergency me badalna, `DOCKER_HOST`/`DOCKER_CONTEXT`). [remote-infra.test.ts](../../../scripts/foundation/test/remote-infra.test.ts): `AC-FOUNDATION-12` (remote ka pehchaan, published ports, tunnel ke arguments, liya hua port asli listener se, tooti pid ko na maarna aur zinda tunnel ko band karna). [dev-data.test.ts](../../../scripts/foundation/test/dev-data.test.ts): `AC-FOUNDATION-13` (aakhri 3 snapshots, secondary ki taraf copy aur restore ke abhyaas ke project pe mana, local context ka chunav, `DOCKER_HOST`). [infra.test.ts](../../../scripts/foundation/test/infra.test.ts): `AC-FOUNDATION-14` (cache 0.25 GB, tmpfs aur bina volume, development project pe tmpfs mana). Asli secondary pe kuch nahi chala: `infra:up` ka tunnel aur snapshot ka asli `docker compose exec` ka raasta bina asli machine ke jaancha nahi gaya.
- **ST-3 ke tests:** [infra.test.ts](../../../scripts/foundation/test/infra.test.ts) (bina Docker chale, sirf CLI se config padh ke): `AC-FOUNDATION-2` ka pehra (har image exact version, har container profile ke peeche, har port `127.0.0.1` pe; galat misaal ke saath), versions live jaise, aur `backend` profile me sirf `mongo` aur `valkey`. [infra.int.test.ts](../../../scripts/foundation/test/infra.int.test.ts): `AC-FOUNDATION-2` asli containers pe, alag project `bq-infra-test` aur alag ports (37017, 36379) pe: `infra:up backend` ke baad sirf do containers, healthy, har ek ka sirf apna port aur wo bhi `127.0.0.1` pe (image ke bina publish wale `EXPOSE` ports chhod ke, jinhe CI ka Docker Compose bhi dikhata hai); transaction commit; Valkey me 25 MB aur `noeviction`; `infra:down` ke baad koi container nahi, aur aakhir me volumes bhi saaf.

## 8. Dependencies

- **Tika hai:** kuch nahi.
- **Is pe tike:** `28-packages`, `02-platform`, `03-frontend-kit`, aur baaki saare modules.
- **Owner ke kaam:** GitHub ki security settings aur rulesets ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3, "Naye root setup aur CI se pehle"); purana code hatane ki haan (§3.7).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.15 `FOUNDATION` (`AC-FOUNDATION-1` se `AC-FOUNDATION-15`, D-447, D-462). Har criterion ka kam se kam ek test, naam me criterion ka id ([RULES.md](../../RULES.md) DD-1).
- **Manuals aur testing ki files:** kisi app ke role ka feature nahi, isliye laagu nahi. Laptop ka setup [OPERATIONS.md](../../OPERATIONS.md) §1 aur root [README](../../../README.md) me.

## 10. Subtasks

Har subtask lagbhag ek PR jitna, aur saare charan 0 me ([PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5, D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                                 | Size   | Halat     |
| ---- | --------------------------------------------------------------------------------------- | ------ | --------- |
| ST-1 | Purana code hatana (owner ki haan), naya root `package.json`, lockfile aur Turborepo    | M (2)  | Ho gaya   |
| ST-2 | `configs/`: TypeScript, ESLint, Prettier aur Vitest ke saajhe config                    | M (2)  | Ho gaya   |
| ST-3 | `infra/` ki compose file (`mongo` replica set, `valkey`), `infra:up` aur `infra:down`   | M (2)  | Ho gaya   |
| ST-4 | Env files ka dhaancha aur `npm run setup`                                               | M (2)  | Ho gaya   |
| ST-5 | CI: `static` aur `test` jobs, repo ke pehre, aur `check` me sab                         | L (4)  | Ho gaya   |
| ST-6 | Mahine ke dependency PRs                                                                | S (1)  | Ho gaya   |
| ST-7 | Root README, CLAUDE.md ke commands aur OPERATIONS §1 ki commands ki list                | S (1)  | Ho gaya   |
| ST-8 | Do laptop (D-462): remote Docker context, SSH tunnel, snapshot aur copy, tests ka tmpfs | M (2)  | Branch pe |
|      | **Kul**                                                                                 | **16** |           |

## Change log

| Version           | Date       | Badlav                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.2  | 2026-11-22 | Module 01 ka pehla spec, 7 subtasks (D-446) acceptance criteria ki link (D-447) aur deployables pe `private: true`; code abhi nahi.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| v1.0.3 se v1.0.14 | 2026-11-23 | Purane code ki shart aur `external.command` (D-455); ST-1 ka code: naya root aur Turborepo, purana code hata (D-457, D-458); ST-2 ka code: `configs/` ke TypeScript, ESLint aur Vitest config. ST-3 ka code: `infra/compose.yaml`, `infra:up` aur `infra:down`. ST-4 ka code: env files ka dhaancha aur `npm run setup`. ST-5 ka code: CI ki jobs aur repo ke pehre. ST-6 ka code: mahine ke dependency PRs (D-461). ST-7 ka code: root README, CLAUDE.md aur OPERATIONS §1 ki commands, aur commands ka pehra. PR #102 ke CI me infra ke test ka fix. PR #102 merge, saare subtasks ho gaye (14 / 14). ST-8 juda (do laptop, D-462): 14 / 16. ST-8 me `infra:use` aur `infra:status` (`AC-FOUNDATION-15`). |
