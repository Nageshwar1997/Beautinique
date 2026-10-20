# Packages — banana, publish aur republish

> **Status:** v1.5 (2026-10-21). **Abhi publish/republish nahi (owner ka faisla, 2026-10-21):** apps isi monorepo se package lete hain (npm workspaces), live deploy pe bhi. Publish sirf zaroorat pe; packages public hi rahenge. `packages/` ke saare npm packages ka kaam, aur naye frontend apps aur backend apps banana, is repo ke apne CLI (`scripts/packages/`) se hota hai. Ye guide batati hai ki kaunsa command kab chalana hai aur andar kya hota hai.

## 1. Packages kahan aur kis naam se

- Folder: `packages/<category>/<name>`, category = `shared`, `frontend` ya `backend`.
- Naam: `@beautinique/<category>-<name>` (jaise `packages/shared/date-format` → `@beautinique/shared-date-format`). CLI ye niyam har run pe check karta hai.
- **shared**: har jagah chalta hai (na DOM, na Node APIs). **frontend**: browser/React. **backend**: Node services. Frontend aur backend packages kisi shared package pe bana sakte hain (use re-export karte hain).
- **public** package npm pe jata hai (`publishConfig.access: "public"`, LICENSE ke saath). **private** (`"private": true`) sirf monorepo ke andar.
- Internal packages normal semver range se lete hain (`"@beautinique/shared-x": "^2.0.0"`). npm workspaces local version link kar deta hai. `workspace:*` npm me nahi chalta.
- Naye TypeScript packages **sirf ESM** hain, tsdown se build hote hain (`dist/index.js` + `dist/index.d.ts`). TypeScript 6.0 (typescript-eslint abhi TS 7 support nahi karta).
- **Bahar ki library pe peer dependency** (zod, react, tailwindcss, vite ...) devDependencies me bhi **bilkul same range** ke saath hoti hai: package wahi vaada karta hai jis version pe test hota hai. CLI har run pe ye check karta hai. Apne workspace packages is niyam se bahar hain (unki ranges CLI sambhalta hai).
- Jis library ke types package ki public types me aate hain (jaise contracts me zod), wo `peerDependencies` me honi chahiye; warna tsdown uske types `dist` me copy kar deta hai. `npm run verify` aisi copy pe fail hota hai.

## 2. Commands

| Command | Kya karta hai |
|---|---|
| `npm run login` | npm login (browser me). Session 2 ghante chalta hai; publish pe 2FA har baar. Pehle se logged in ho to kuch nahi karta. |
| `npm run logout` | Logout; npm server pe bhi session khatam. |
| `npm run status` | Har package: category, local version, npm version, status (published / waiting / new / behind / private), aur login ki halat. |
| `npm run create` | Pehla sawal: Package, Frontend app ya Backend app (`npm run create:app` / `create:backend` seedhe). Phir use banata hai, `npm install` se jodta hai aur uske saare checks chalata hai. |
| `npm run publish` | Jinka package.json version npm pe nahi hai (naye packages, ya republish ke baad bache hue) unhe publish karta hai. |
| `npm run republish` | Published packages ka naya version: bump, dependents, ranges, checks, phir publish (laptop) ya GitHub ke liye taiyari. |
| `npm run verify` | Publish wale saare checks, bina publish ke. Chune packages ki internal dependencies pehle build hoti hain, isliye fresh clone pe bhi chalta hai. CI isse `--all` ke saath chalata hai. |
| `npm run build` | Saare packages build, dependencies pehle (devDependencies bhi). Fresh clone ke baad `npm install` ke turant baad chalao. |

Har command `-- --help` se apne flags batata hai (`npm run publish -- --help`); galat flag pe command ruk jata hai. Flags `--` ke baad do; `npm run publish --dry-run` (bina `--`) bhi samjha jata hai.

## 3. Create

Sawal: category → kind (TypeScript library / React library / CSS package; React aur CSS sirf frontend) → naam → description → keywords → public ya private → (frontend/backend) kaunse shared package pe banana hai → summary → "Create it?".

- Naam turant check hota hai: format, `shared-`/`frontend-`/`backend-` dobara nahi, folder aur workspace me pehle se to nahi.
- Agar naam npm pe pehle se hai (purane BQ-Packages wale), version agle major se shuru hota hai (jaise npm 1.1.2 → 2.0.0).
- Files pehle temporary folder me bante hain, phir ek saath move: aadha bana package kabhi nahi. `npm install` fail ho to sab wapas.
- Har TypeScript package ke saath ek pehla test (`test/index.test.ts`) aata hai; `npm test` bina test ke pass nahi hota.
- Bana package turant build, typecheck, lint, test aur publish checks pass karta hai (CLI ke tests ye har kind ke liye sach me chala ke dekhte hain).
- Bina sawal: `npm run create -- --yes --category shared --kind ts --name date-format --description "..." --keywords dates --visibility public --extends none`.

### 3.1 Frontend app (`--type app`)

- Sirf 11 apps me se (contracts `APPS`); naya app pehle `packages/shared/contracts/src/platform.ts` me judta hai. Bana hua app list me disabled dikhta hai.
- Folder `frontend/<app>`, naam simple (`seller`), `private: true`: apps npm package nahi hain.
- Teen tarah (ARCHITECTURE §9.1): customer = React Router framework mode (SSR), delivery = PWA, baaki = Vite + React SPA (Vite ke react-ts jaisa layout: `tsconfig.app.json` + `tsconfig.node.json`).
- Dev ports 3001 (customer) se 3011 (creator), `APPS` ke order me. `/api` local gateway (8080) pe jata hai, jaise Vercel rewrite.
- Bina sawal: `npm run create -- --yes --type app --app seller`.

### 3.2 Backend app (`--type backend`)

- Sirf 5 deployables (contracts `DEPLOYABLES`): `gateway`, `identity`, `payments`, `notify`, `core`, aur `bundle`. Naya business feature naya deployable nahi, Core ka module hai (ARCHITECTURE §4).
- Folder `backend/<name>`, naam simple, `private: true`. Express 5 + `@beautinique/backend-server-kit` (errors, health, logs, config, shutdown har service me copy nahi hote).
- Har deployable: `src/config.ts` (`<NAME>__*` env vars, zod; ESLint `process.env` sirf yahan allow karta hai), `src/service.ts` (`readConfig` + `start`), `src/server.ts` (split mode), `.env.example`, tests. Gateway me `X-BQ-App` check, contracts manifest se route aur owner tak stream; Core me `src/modules/`.
- Ports: gateway 8080, identity 8081, payments 8082, notify 8083, core 8084.
- `bundle` gateway ke baad hi banta hai. Wo saare deployables ek process me chalata hai: internal wale `127.0.0.1` ke khaali ports pe, gateway `PORT` pe. Baad me naya deployable banao to CLI use bundle me khud jod deta hai (`src/deployables.ts` + dependency).
- Node 24 TypeScript seedha chalata hai (`node --watch src/server.ts`, tsx nahi); production `tsdown` ka `dist/`. Bundle dev aur tests deployables ko source se chalate hain (export condition `beautinique-source`).
- Dockerfile abhi nahi: Docker Lesson 3 me.
- Bina sawal: `npm run create -- --yes --type backend --deployable identity`.

## 4. Publish aur republish

### Selection (dono me same)

**All** / **By category** (shared, frontend, backend me se ek ya zyada) / **Pick packages** (category ke hisaab se grouped list; jo nahi chun sakte wo dikhte hain par disabled, wajah ke saath). Flags: `--all`, `--category shared,frontend`, `--packages shared-utils,frontend-styles`.

### Version bump (republish)

**Same bump for all** (patch / minor / major) ya **Choose for each package** (patch / minor / major / custom, jaise `2.0.0-beta.0`; prerelease apne tag, jaise `beta`, pe jata hai). Flag: `--bump minor`.

### Dependents

Kisi package ka naya version agar kisi published dependent ki range tod de, to CLI use saath lene ka sujhav deta hai (default Yes): normal dependency → patch, peer dependency → major (consumers ke liye breaking), aur jo package dependency ko re-export karta hai (`export * from`) wo dependency ke major pe khud major. Agar chuna hua bump chhota pade to CLI bada karta hai (poochh ke). Prerelease (jaise `2.0.0-beta.0`) ke dependents bhi usi tag pe prerelease bante hain. Private apps aur devDependencies ki ranges bina bump ke update hoti hain. Flag: `--cascade ask|yes|no`.

### Har release me kya hota hai

1. **Pehle jaanch, koi sawal se pehle:** working tree clean, branch `release` (packages sirf `release` branch se jate hain, wahi branch jo apps live karti hai), git user.name/email, npm login (offline aur session expire alag bataye jate hain).
2. **Plan:** dependency order, versions, range changes. Local version npm se peeche ho (`behind`) ya naya version npm pe pehle se ho to yahin ruk jata hai (pehle latest code pull karo). Har published package npm jaisa resolve karke install ho sakega (private ya missing dependency ho to yahin ruk jata hai, kuch likha nahi jata).
3. **Confirm**, default **No** (Enter dabane se publish nahi hota).
4. package.json likhna + `npm install`.
5. **Sabse pehle saare packages ke checks** (internal dependencies pehle build, phir build order me): build, typecheck, lint, test, check; `npm pack` me kya jayega (package.json, README, LICENSE, har `exports` target; .env, tests, build cache nahi); publint; types (arethetypeswrong). Ek bhi fail → saari files wapas, kuch publish nahi.
6. CHANGELOG.md: har package ke commits (Conventional Commits) uske pichhle tag se.
7. **Publish**, dependencies pehle, ek-ek karke; npm ka apna 2FA (browser link) dikhta hai. Publish se theek pehle login dobara check hota hai (checks me 2 ghante ka session khatam ho sakta hai); fail ho to saari files wapas. Jo version npm pe pehle se hai wo skip, isliye dobara chalana safe hai. Ctrl+C: kuch publish nahi hua to saari files wapas.
8. Fail ho (2FA, network): "Try again" ya "Stop". Stop pe jo publish ho chuke wo rehte hain, baaki package.json me "waiting" rehte hain; `npm run publish` baad me unhe pura karta hai.
9. **Commit** `chore(release): publish packages` + har package ka tag `@beautinique/<name>@<version>`. **Push aap karte ho**: `git push --follow-tags` (`release` pe ye ek hi seedha push allowed hai, owner ke ruleset bypass se).
10. **Back-merge:** PR `release` → `main`, taaki naye versions aur changelogs `main` (default branch) pe bhi aa jayein.

`--dry-run`: naye versions ke saath saare checks aur `npm publish --dry-run`, phir saari files wapas; koi git ya npm badlav nahi. Dry run me login/branch ki jaanch nahi hoti.

### Laptop ya GitHub Actions

- **Laptop** (`--target laptop`): abhi publish, har package pe 2FA.
- **GitHub Actions** (`--target github`): laptop pe versions, changelog, commit aur tags banta hai, aur har package ke liye npm trusted publishing set hota hai (`npm trust github`, 2FA). Phir `git push --follow-tags` aur GitHub pe **Actions → Release → Run workflow** (48 ghante ke andar, warna npm naya trust config hata deta hai). Workflow sirf `release` branch pe chalta hai aur do jobs me bata hai: **build** job (`npm ci`, `npm run publish -- --ci`: har waiting version ka tag isi commit pe hona chahiye, saare checks, phir tarballs + `release.json` artifact) aur **publish** job (environment `npm`, OIDC `id-token`; kuch install nahi karta, koi package code nahi chalata; `.github/scripts/publish-tarballs.mjs` tarballs ko dependency order me publish karta hai, npm pe pehle se wale skip). Provenance (npm pe verified badge) npm khud lagata hai, kisi npm token ke bina. Fail ho to workflow dobara chalao.
- Bilkul naya package pehli baar **laptop se** hi publish hota hai (npm kisi package pe trust tabhi lagata hai jab wo exist kare).

## 5. CI

`.github/workflows/ci.yml` `main`, `prerelease` aur `release` pe push aur har PR pe: `npm ci`, `npm run build`, format check, lint, typecheck, tests (CLI ke 70+ tests, fake npm registry ke saath asli publish aur GitHub release flows bhi), `npm run verify -- --all`, `npm audit`. npm 12.2.0 pin hai (Node 24 ke saath npm 11 aata hai).

## 6. CLI ka code

- `scripts/packages/bin/*`: commands. `scripts/packages/lib/*`: logic (workspace, graph, versions, plan, verify, release, npm, git, prompts). `scripts/packages/test/*`: Vitest tests.
- Node 24 TypeScript seedha chalata hai, build step nahi. `npm run test:scripts` sirf CLI ke tests.
- npm bina shell ke chalta hai (Windows quoting ki dikkat nahi); npm ki 2FA prompt terminal me dikhti hai.

## Change log

| Version | Date | Badlav |
|---|---|---|
| v1.0 | 2026-10-20 | Pehla version: create, publish, republish, login, logout, status, verify, build; GitHub release workflow. |
| v1.1 | 2026-10-20 | Review ke baad: release sirf `release` branch se, jaanch sawalon se pehle, behind/taken versions pe rok, peer/re-export/prerelease cascade, npm jaisa install check, Ctrl+C aur login-expire pe files wapas, dry run naye versions ke saath, release workflow build + publish jobs me (tag check), CI me build step, sab commands pe `--help`, changelog me markdown escape. |
| v1.2 | 2026-10-20 | Release ke baad `release` → `main` back-merge; release commit ka push ruleset bypass se. |
| v1.3 | 2026-10-20 | Peer aur dev range same (CLI check), aur dist me copy hue dependency types pe verify fail. |
| v1.4 | 2026-10-20 | `npm run create` ab frontend apps (§3.1) aur backend apps (§3.2) bhi banata hai. |
| v1.5 | 2026-10-21 | Abhi publish/republish nahi, zaroorat pe; packages public hi. |
