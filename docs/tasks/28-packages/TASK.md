# TASK 28: packages ka flow

> **Status:** v1.0.7 (2026-11-25). Halat: implementation; ST-1 **ho gaya** (PR [#104](https://github.com/Nageshwar1997/Beautinique/pull/104)), ST-2 se ST-8 ek PR me, `scripts/packages` aur `.github/workflows/publish.yml`. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `28-packages` (D-445). Progress: 18 / 18 points.

## 1. Lakshya

Har saajha package ek hi tareeke se bane, jaanche, naye version pe jaaye aur npm pe chhape. Iske liye packages ka ek CLI aur GitHub ka publish workflow (D-445). Code shuru hone pe pehla kaam yahi hai, kyunki `02-platform` aur `03-frontend-kit` ke saare packages isi ke `create` se bante hain.

## 2. Scope

**Andar:**

- CLI ke 7 commands: `create`, `build`, `verify`, `status`, `republish`, `publish`, `update-deps` (§3).
- GitHub ka publish workflow (§3.8).
- Package ka template, README ke "Visibility" hisse samet (§4 niyam 7).
- CI ke pehre: har PR pe `verify`, aur README ke "Visibility" hisse ki jaanch.
- CLI ke tests fake npm registry pe (§8).
- [OPERATIONS.md](../../OPERATIONS.md) me publish ka manual: kab kya chalana hai.

**Bahar:**

- Packages ka apna code: `02-platform` aur `03-frontend-kit`.
- Apps aur services ka dhaancha: `create` sirf packages banata hai.
- Root setup (npm workspaces, Turborepo, `configs/`, CI ka dhaancha) aur mahine ke dependency PRs ([OPERATIONS.md](../../OPERATIONS.md) §11 niyam 1): `01-foundation`.
- Prerelease versions (misaal `2.0.0-beta.1`): zaroorat pade to owner se poochh ke.

## 3. Functional requirements

Saare commands repo ke root se `npm run <command>` se chalte hain, `scripts/packages/` me (D-002). Har command galti pe non-zero exit, galti ka code aur aage kya karein ka hint deta hai. Jo command kuch likhta ya chhapta hai, wo pehle plan dikhata hai, `--dry-run` maanta hai, aur "haan" ke bina kuch nahi karta.

### 3.1 `create`

1. **Input:** category (`shared`, `frontend` ya `backend`), naam (chhote akshar, ank aur `-`) aur ek line ka kaam. Flags se, ya na hon to poochh ke.
2. **Jaanch:** naam ka format; folder pehle se na ho; npm pe naam kisi aur ke paas na ho. Naam hamare scope me pehle se ho (purane versions), to pehla version agla major; warna `1.0.0`.
3. **Banata hai** `packages/<category>/<name>/` me:
   - `package.json`: naam `@beautinique/<category>-<name>`, `type: module`, `exports` (types aur import), `files` ki allowlist (sirf build, README, CHANGELOG, LICENSE), `engines` (pinned Node, [OPERATIONS.md](../../OPERATIONS.md) §11 niyam 3), `repository` (folder ke saath, provenance ke liye), `publishConfig` (`access: public`, provenance), aur build, test, typecheck aur lint ke scripts.
   - tsdown ka config, `configs/` se TypeScript ka config, `src/index.ts` aur ek test (Vitest).
   - README (§4 niyam 7 ke hisse) aur khaali CHANGELOG.
   - **Frontend me:** playground (Vite) aur package ki `tailwind.css` (CR-33).
4. **Ant me:** workspace jodne ke liye install, phir us package pe `verify`.

### 3.2 `build`

Saare packages (ya chune hue) unki andar ki dependencies ke kram me build karta hai, devDependencies samet, Turborepo ke saath (D-001). Andar ki dependencies me chakkar (cycle) ho to saaf error.

### 3.3 `verify`

Publish wali saari jaanch, bina publish ke. Fresh clone pe bhi chalta hai, kyunki andar ki dependencies pehle build hoti hain. Har PR pe CI me bhi chalta hai.

1. Build, typecheck, lint aur tests.
2. **Package me kya jaata hai:** `npm pack --dry-run` ki list me sirf `files` ki allowlist. `.env`, `.npmrc`, test files ya secret jaisa koi pattern ho to fail (DD-7): private key, AWS, npm aur GitHub tokens, Razorpay key, npm ka `_authToken`, aur `.gitleaks.toml` ke `url-with-password` jaise connection URL password ke saath (MongoDB, Valkey, Postgres, AMQP, Cloudinary); `<...>` jaisa placeholder secret nahi. Ye `dist/` pe bhi, jo git me nahi jaata aur gitleaks use kabhi nahi dekhta.
3. Exports aur types sahi resolve hote hain. Iske liye koi naya tool chahiye ho, to pehle review ([OPERATIONS.md](../../OPERATIONS.md) §11 niyam 2).
4. Package ke niyam: CR-33 (Tailwind import), CR-34 (naam, ESM, README, playground), CR-35 (peer aur dev ki range), CR-36 (`private: true` nahi, README ka "Visibility" hissa).
5. `publishConfig` aur `repository` sahi.

### 3.4 `status`

Har package ke liye ek table: repo wala version, npm wala aakhri version, aur halat (chhapa, publish baaki, ya naya). Registry tak na pahunche to saaf error; chupke se "naya" nahi maanta.

### 3.5 `republish`

Chhape packages ka naya version taiyaar karta hai; chhapta nahi.

1. **Kahan:** `origin/prerelease` se bani kaam ki branch pe, saaf working tree ke saath. `release` aur `prerelease` pe mana.
2. **Chunna:** pichhle tag ke baad badle packages, ya jo naam diye gaye; har package ke liye patch, minor ya major.
3. **Tike packages:** jo andar ka package badle package pe tika hai aur jiski range naya version nahi maanti, uska patch version badhta hai aur range naye version pe jaati hai. Range ka roop (`^`, `~`, exact) waisa hi rehta hai.
4. **CHANGELOG:** har package ke folder ke pichhle tag ke baad ke commits se (Conventional Commits, type ke hisaab se group). Commit ke subject ka markdown escape hota hai.
5. **Likhta hai:** versions, tike packages ki ranges, `package-lock.json` aur CHANGELOG, ek commit me, owner ki git identity se aur bina AI attribution ke (CLAUDE.md).
6. **Aage:** PR se `prerelease`, phir `release`. Chhapna `publish` ka kaam.

### 3.6 `publish` (laptop se)

Sirf naye package ki pehli baar ke liye, ya jab workflow na chal sake. Owner chalata hai.

1. **Shartein:** `release` branch, saaf working tree, git identity, aur `npm whoami` se npm login (login owner khud karta hai).
2. Jo version npm pe nahi, sirf wahi chunta hai, dependency ke kram me. Naam diye hon to chune package ki andar ki dependency (`dependencies`, `peerDependencies`, `optionalDependencies`) ka zaroori version npm pe na ho, wo bhi usi plan me pehle ("needed by a chosen package"); na npm pe na repo me ho to kuch chhapne se pehle ruke (D-445 badla). Plan dikhata hai aur "haan" maangta hai; npm ka MFA code owner khud daalta hai.
3. Har chhape version ka git tag `@beautinique/<category>-<name>@<version>`, us commit pe. `git tag` fail ho to chetavni, tag khud banane ki command ke saath. Jo version npm pe hai par yahan uska tag nahi, uski chetavni (`git fetch --tags`; phir bhi na mile to tag us commit pe jahan se wo chhapa tha, owner khud).
4. **Ant me sandesh:** `release` branch ka naam, tags ka push owner ke kehne pe, back-merge `release` → `prerelease` (D-023), aur naye package pe trusted publisher jodne ki yaad (`npm trust`, owner).
5. Beech me fail ho to dobara chalane pe jo chhap gaye wo chhoot jaate hain, aur baaki chhapte hain.

### 3.7 `update-deps`

Bahar ki dependencies ke naye versions dhoondhta hai (patch, minor ya major ki seema ke saath), plan dikhata hai, poochh ke likhta hai aur install karta hai. Pehle exact version, phir range ka apna roop, taaki npm wahi version le. Peer aur dev ki range saath badalti hai (CR-35). Install fail ho ya beech me roka jaaye, to har `package.json` aur `package-lock.json` pehle jaisa. Mahine ke apne aap PRs ([OPERATIONS.md](../../OPERATIONS.md) §11 niyam 1) bhi rehte hain; `update-deps` sirf haath ke turant update ke liye.

### 3.8 GitHub ka publish workflow

[OPERATIONS.md](../../OPERATIONS.md) §11 niyam 7 ke hisaab se.

1. Sirf haath se (`workflow_dispatch`), aur sirf `release` branch se; baaki branch pe job chalta hi nahi.
2. **Job 1, bina haq ke** (`contents: read`): `npm ci`, `verify`, chhapne wale packages ke tarballs, aur unka artifact.
3. **Job 2, publish:** sirf artifact ke tarballs, trusted publishing (OIDC, `id-token: write`) aur provenance ke saath. Repo ya CI me npm ka koi token nahi. Code ka checkout nahi.
4. **Job 3, tags** (`contents: write`): pack safal ho to chalta hai, publish beech me fail ho tab bhi (cancel pe nahi). Pack ki `tags.json` me plan ke versions (`thisRun`) aur npm pe pehle se maujood versions. Isi run ka har wo version `release` commit pe tag hota hai jo npm pe pahunch gaya (npm ko teen baar poochh ke) aur jiska tag remote pe nahi, to beech me fail hua run bhi apne chhape versions ka tag usi run me paata hai. Npm pe pehle se maujood bina tag wale version ka tag nahi banta, sirf chetavni: wo laptop se chhapa ho sakta hai, aur uska tag us commit pe chahiye jahan se wo chhapa (code review, 2026-11-25). Summary me bane tags, `release` branch ka naam aur back-merge ki yaad.
5. Naya package (npm pe kabhi chhapa nahi) ho to workflow mana karta hai: pehli baar laptop se (§3.6).
6. Actions SHA pe pinned (SR-082).

## 4. Niyam

1. **Naam aur jagah:** D-002. Pehle publish ke baad naam nahi badalta.
2. **Version:** semver. Ek version number dobara kabhi nahi, aur chhape version ka code kabhi nahi badalta.
3. **Andar ki dependencies** asli version ranges se, kyunki npm `workspace:` nahi samajhta.
4. **Kaun kahan:** `republish` kaam ki branch pe, aur PR se aage. `publish` sirf `release` se. Naya package pehli baar owner ke laptop se, uske baad workflow.
5. **Workflow ka har publish provenance ke saath;** laptop ka publish (naye package ki pehli baar) bina provenance, kyunki laptop pe OIDC nahi ([OPERATIONS.md](../../OPERATIONS.md) §11). npm ka token kahin save nahi hota.
6. **Saare packages public** (D-445): kisi pe `private: true` nahi.
7. **README ke hisse:** kya karta hai, install, use, API ka saar, aur **Visibility**. Visibility me likha hota hai ki security ke hisaab se ye package asal me private hona chahiye ya public, aur kyun (misaal: Beautinique ke routes aur permissions batane wala package asal me private; India ke formats jaanchne wala public). Ye sirf samajh ke liye hai; publish saare hote hain.
8. **Tests kabhi asli npm ko nahi chhoote** (§8).
9. **Commit, tag aur release ke sandesh me koi AI attribution nahi** (CLAUDE.md).

## 5. Data model

Koi database nahi. Jo files aur naam ye module tay karta hai:

| Kya                              | Roop                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Package ka naam                  | `@beautinique/<category>-<name>`                                                   |
| Git tag                          | `@beautinique/<category>-<name>@<version>`                                         |
| CHANGELOG ki entry               | Version, tareekh, aur type ke hisaab se commits (Features, Fixes, Performance ...) |
| `package.json` ke zaroori fields | §3.1 niyam 3                                                                       |

## 6. API

HTTP API nahi. CLI ke commands §3 me. Saajhe flags: `--dry-run` (sirf plan aur `npm publish --dry-run`), aur package ke naam (sirf wahi packages). Workflow ke liye `publish --ci`, jo sirf GitHub Actions ke andar chalta hai.

## 7. Security

- **Supply chain** (R-026, SR-082): lockfile aur `npm ci`, actions SHA pe pinned, naye dependency ka review, provenance.
- **Secret ka publish na ho** (DD-7): `files` ki allowlist aur `verify` ki secret wali jaanch. CLI `.env` ya `.env.*` kabhi nahi padhta.
- **Haq:** `npm login`, `npm logout` aur `npm trust` sirf owner chalata hai; CLI inhe khud kabhi nahi chalata, sirf batata hai. Owner ke npm account pe MFA (SR-081).
- **Workflow:** sirf `release`, haath se; publish wala job sirf tarballs dekhta hai, code nahi.
- **Repo pehle se public hai**, to npm pe daalne se code ka koi naya hissa bahar nahi jaata (D-445). Har package ka "asal me private ya public" README me (§4 niyam 7).

## 8. Tests

- CLI ke saare tests fake npm registry pe ([RULES.md](../../RULES.md) §4.2): asli npm CLI usi pe publish karta hai, `whoami` aur package ke documents wahin se aate hain, aur publish fail aur session khatam jaise haalat bhi.
- Network ka pehra: tests me asli npm registry tak koi request nahi ([OPERATIONS.md](../../OPERATIONS.md) §11 niyam 8). Pehra har raasta rokta hai: TLS, `net.connect`, `http` aur `fetch`; sirf is machine ke `127.0.0.1`, `::1` aur `localhost`.
- Tests ke liye koi local infra chahiye ho to uski baat docs me (D-023).
- Mutation testing is module me nahi (CLAUDE.md ki teen jagah me ye nahi aata).

## 9. Dependencies

- **Tika hai:** `01-foundation` (npm workspaces, Turborepo, `configs/`, CI).
- **Is pe tike:** `02-platform`, `03-frontend-kit`.
- **Owner ke kaam:** [OWNER_TASKS.md](../../OWNER_TASKS.md) OT-5 (npm account, MFA aur `@beautinique` scope); har naye package ke pehle publish ke baad `npm trust`.

## 10. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.14 `PACKAGES` (`AC-PACKAGES-1` se `AC-PACKAGES-12`). Har criterion ka kam se kam ek test, naam me criterion ka id ([RULES.md](../../RULES.md) DD-1).
- **Manuals aur testing ki files:** kisi app ke role ka feature nahi, isliye [manuals/](../../manuals/README.md) aur [testing/](../../testing/COMMON.md) laagu nahi. Owner ke liye publish ka manual [OPERATIONS.md](../../OPERATIONS.md) me (ST-7).

## 11. Subtasks

ST-2 se ST-8 ek hi PR me (ST-1 ka PR #104 pehle merge hua), aur saare charan 0 me ([PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5, D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                               | Size   | Halat   |
| ---- | --------------------------------------------------------------------- | ------ | ------- |
| ST-1 | CLI ka dhaancha (commands, flags, errors, poochhna, logs) aur `build` | M (2)  | Ho gaya |
| ST-2 | Fake npm registry aur CLI ke tests ka dhaancha                        | M (2)  | Ho gaya |
| ST-3 | `create` aur package ka template (README ke "Visibility" samet)       | M (2)  | Ho gaya |
| ST-4 | `verify`, aur CI me har PR pe                                         | M (2)  | Ho gaya |
| ST-5 | `status` aur laptop se `publish`                                      | M (2)  | Ho gaya |
| ST-6 | `republish`: versions, tike packages aur CHANGELOG                    | L (4)  | Ho gaya |
| ST-7 | GitHub ka publish workflow aur OPERATIONS me publish ka manual        | M (2)  | Ho gaya |
| ST-8 | `update-deps`                                                         | M (2)  | Ho gaya |
|      | **Kul**                                                               | **18** |         |

## Change log

| Version          | Date       | Badlav                                                                                                                                                                                                                   |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.0.0 se v1.0.2 | 2026-11-22 | Module 28 ka pehla spec, 8 subtasks acceptance criteria ki link (D-445) aur charan 0 (D-446); code abhi nahi.                                                                                                            |
| v1.0.3 se v1.0.4 | 2026-11-23 | ST-1 ka code (`scripts/packages`: CLI ka dhaancha, `build`, `npm run packages:build`; tests `scripts/packages/test/`, AC-PACKAGES-4) aur PR #104 merge: ST-1 ho gaya, 2 / 18.                                            |
| v1.0.5           | 2026-11-24 | ST-2 se ST-8 ek PR me: fake registry aur network guard, `create`, `verify` (CI me har PR pe), `status`, `publish`, `republish`, publish workflow, `update-deps`; AC-PACKAGES-1 se 12 ke tests `scripts/packages/test/`.  |
| v1.0.6 se v1.0.7 | 2026-11-25 | QA audit ke fixes: naam ke saath publish me zaroori dependency saath (D-445 badla), tag job beech me fail ke baad bhi, `verify` ke project wale secret patterns, network guard ke saare raaste, provenance ki line saaf. Code review ke baad: tag job sirf isi run ke versions tag karta hai, purane bina tag wale ki chetavni. |
