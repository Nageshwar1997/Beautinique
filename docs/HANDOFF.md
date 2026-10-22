# HANDOFF — BQ

> **Status:** v1.20 (2026-10-22). Is project pe 2 log kaam karte hain. Ye file batati hai ki **abhi kya halat hai, kisne kya chhoda, agla kaam kya hai** aur kaunse sawal khule hain, taaki doosra insaan (aur uska Claude) bina poora itihaas padhe kaam utha sake. Jo bhi kaam roke, wo ye file update kare (neeche §8).

## 0. Pehle ye (handoff ke din)

- **Owner (ho gaya, 2026-10-20):** `Beautinique` repo ka bacha hua kaam commit karke `main` push karna (`git status` saaf, `main...origin/main` me "ahead" na ho; detail §3 me). Iske bina doosre insaan ke clone me ye kaam nahi hoga.
- **Doosra insaan:** `git pull` (branch `main`), phir setup (§2). Push ke baad `git status` saaf hona chahiye aur `git log` me ye kaam dikhna chahiye.
- Baaki saare purane repos (§7) pehle se clean aur GitHub ke saath sync hain.

## 1. Project ek nazar me

- **Kya:** Beautinique, Indian beauty-only e-commerce marketplace. Har main role ka alag app (11 apps, 79 roles, sab launch pe), backend = Gateway + Identity, Payments, Notify microservices + Core modular monolith. Hosting ₹0: Vercel (apps), Render free (backend, "bundle mode"), Atlas M0, Redis.
- **Kyun:** education + portfolio. Brand dummy hai, par sab kuch asli production jaisa banta hai; legal cheezein dummy data ke saath.
- **Docs ka order:** [RULES.md](RULES.md) → [TASKS.md](TASKS.md) → [MEMORY.md](MEMORY.md) → zaroorat pe [ARCHITECTURE.md](ARCHITECTURE.md), [PRD.md](PRD.md), [DESIGN.md](DESIGN.md), [packages/README.md](packages/README.md). Root ka `CLAUDE.md` Claude ke liye short niyam rakhta hai.

## 2. Setup (naya laptop)

1. Node 24, aur npm 12.2+: `npm install --global npm@12.2.0` (Node 24 ke saath npm 11 aata hai; repo `devEngines` se npm 12 maangta hai).
2. `npm install`, phir `npm run build` (packages ek doosre ka `dist` import karte hain).
3. Checks: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (backend packages ke tests asli Mongo pe chalte hain: pehle Docker Desktop kholo aur `npm run infra:up`; `verify` aur `publish` ke liye bhi). Package CLI ke tests me e2e ~4 minute aur create ~1 minute lete hain.
4. Styles ka playground: `npm run playground --workspace @beautinique/frontend-styles` (http://localhost:5180).
5. **Roz ka git flow** (ARCHITECTURE §13, RULES §2): `git switch main` → `git pull` → `git switch -c feat/<kaam>` → commits (Conventional Commits) → PR **`main`** pe. Batch ready ho to PR `main` → `prerelease` (laptop Docker pe integration/E2E), phir PR `prerelease` → `release` (live + npm). Package release ke baad PR `release` → `main` (back-merge).
6. Docker sirf local dev ke liye hai (owner Docker seekh raha hai; TASKS me "Docker Lesson" wale tasks owner ke saath karne hain).

## 3. Abhi ki halat (2026-10-20)

**Bana hua (sab `Beautinique` repo me):**

- **Monorepo root (T0.5, T0.6 ka pehla hissa):** npm workspaces `packages/*/*`, root scripts, `configs/` (ESLint factory + tsconfig presets), Prettier, `.gitattributes` (LF), `LICENSE` (MIT).
- **Local infra (T0.8, Docker Lesson 2):** `infra/docker-compose.yml`: Mongo 8.0 replica set, Valkey (Render free jaisi limits) aur Mailpit, sab sirf `127.0.0.1` pe. Pehle Docker Desktop kholo, phir `npm run infra:up`. Guide: [infra/README.md](../infra/README.md).
- **CI:** `.github/workflows/ci.yml`: `npm ci` → `npm run build` → format, lint, typecheck, test, `verify --all`, `npm audit`. Har PR pe, aur `main`, `prerelease`, `release` pe push.
- **Secret scan (T0.6 ka gitleaks hissa, 2026-10-21):** `check` job ka pehla step pinned gitleaks 8.30.1 (SHA-256 check) se tested commit ki poori history scan karta hai, `.gitleaks.toml` (default rules + password wale Mongo/Valkey/Cloudinary URL ka rule, koi path allow-list nahi); finding pe CI fail, log me secret `--redact`. Local poori history: 0 findings; container me fail/pass dono dekhe, GitHub pe pehla run push ke baad dekhna. Config owner ke commit `4e0f1fa` me hai (push nahi hua). GitHub ka pehla run (2026-10-21) `server-mongo` test ke nakli password wale Mongo URL (host `127.0.0.1:1`, jahan kuch nahi chalta) pe fail hua (commit `e533ace`, push ho chuka, history badal nahi sakte). Wo test sirf ye dekhta hai ki password error me na chhape, isliye ye ek finding fingerprint se `.gitleaksignore` me hai, wajah ke saath (poora path allow-list nahi). Local gitleaks 8.30.1 se poori history: no leaks; asli jaisa password URL ab bhi pakda jaata hai.
- **Release:** `.github/workflows/release.yml`, sirf `release` branch pe, haath se. Do jobs: build (check + pack, har version ka tag isi commit pe zaroori) aur publish (OIDC trusted publishing, kuch install nahi karta, `.github/scripts/publish-tarballs.mjs`). Ye abhi tak GitHub pe chala nahi hai.
- **`@beautinique/frontend-styles` 2.0.0** (`packages/frontend/styles`), poora: Tailwind v4 tokens (Rose + Plum, tones, order status, 8 chart colours, layout/touch/media sizes), light/dark/high-contrast/print themes (310 colour checks: WCAG contrast aur colour-blind chart check), fonts (Plus Jakarta Sans + Fraunces, `/vite` preload plugin), `base.css`, `animations.css`, `utilities.css` (focus-ring, touch-target, skip-link, container-page, gradients, skeleton, progress, marquee, safe areas), `content.css` (`rich-text`, Quill 2 output bhi), `print.css`. 26 tests (real Vite + Tailwind builds; mutation-checked), Vite playground. Guide: package README. npm pe publish nahi kiya (npm pe purana 1.1.2 hai), aur abhi karna bhi nahi (§4).
- **Neev ke 4 packages** (`packages/shared/`): `shared-zod` 2.0.0 (public; Indian mobile, PIN, GSTIN check digit, PAN, IFSC, UPI, paise ...), `shared-utils` 2.0.0 (public; INR/GST/discount/allocate BigInt me, IST dates, masking, slug, UUIDv7), `shared-contracts` 1.0.0 (public; `defineRoute`, `defineEvent`, `definePermission`, `defineAreaSetting`, error codes, envelope, pagination, OpenAPI 3.1, gateway manifest), `shared-authz` 1.0.0 (public; grants, containment, validity, decision reasons, scope spec, step-up). 66 tests, 33/33 mutations pakde, `npm run verify -- --category shared` pass. npm pe publish nahi kiya (§4).
- **`@beautinique/backend-server-kit` 1.0.0** (`packages/backend/server-kit`, public, publish nahi): har deployable ki neev (AppError + contracts error body, request id, access log, secrets chhupane wala pino logger, `createApp`, `/health` + `/ready`, namespaced `loadConfig`, graceful `startServer`). 15 tests, 25/25 mutations. Uncommitted.
- **`@beautinique/backend-server-mongo` 1.0.0** (`packages/backend/server-mongo`, public, publish nahi; T1.2): native `mongodb` driver ka ek hi raasta (ESLint seedha `mongodb` aur transaction ke andar `Promise.all` rokta hai). `connectMongo` (pool 5, majority, primary, `ignoreUndefined`, replica set check, saaf error bina URI ke), `ready` (2 s ping), `withTransaction` (snapshot + majority, value commit ke baad, har attempt ka naya session, transient pe 10–200 ms backoff ke saath dobara, unknown commit result pe sirf commit dobara, `timeoutMs` 10 s ke baad 503 `TransactionTimeoutError`, network error se phenka gaya session server pe kill), `ParallelTransactionError` (queries saath me wire pe, ya bhula `await` jo commit tak dikhe; ESLint `withTransaction` ke andar `Promise.all/allSettled/any/race` rokta hai), `TransactionAbortedError` (work ne aisi query ka error pakad ke aage kaam kiya jise retry nahi badalta: turant 500, 10 s retry nahi). 36 tests asli replica set pe; 55 mutations me 50 pakde (bache 5: 3 equivalent, 1 sirf timing ≤200 ms, aur lone server pe client band hona haath se check kiya); do independent reviews ki 12 kamiyan theek. Local Mongo ab `enableTestCommands=1` ke saath (fail points). CI aur `release.yml` tests se pehle compose ka mongo chalate hain. Code aur docs owner ke commits `e533ace`, `c9be2d0`, `62c2dc3` me (`main`; `62c2dc3` abhi push nahi hua).
- **`@beautinique/backend-server-queue` 1.0.0, part 1** (`packages/backend/server-queue`, public, publish nahi; T1.3): 2026-10-21 part 1: `@beautinique/backend-server-queue` 1.0.0 (public, publish nahi; bullmq 6.4.0 + ioredis 6.0.0, owner: latest). `connectRedis` (shared client, `noeviction` check, memory/connections log bina URL, `connectionLimit` ke 80% pe warning, jaldi fail + khud reconnect), `writeEvent` (sirf `withTransaction` ke andar, envelope contract se check, `platform_outbox`), `ensureOutboxIndexes` (relayed 72 ghante), `tryLease` (`platform_locks`, MongoDB ki ghadi `$$NOW`), `startRelay` (`poll`/`changestream` + sweep, lease ke peeche, order me, batches, `jobId = <eventId>@<subscriber>`, `/ready` lag 30 s). 28 tests asli Mongo + Valkey pe (Redis outage TCP proxy se); 41 mutations me 36 pakde (bache 5: 4 equivalent, 1 timer unref jo process ke andar test nahi hota). Baaki: part 2 consumer/inbox dedupe, retries, DLQ; part 3 schedulers, `bq:epoch` watchdog, Redis wipe recovery. Uncommitted.
  Part 2: 2026-10-22 part 2: consumer: `subscribe` (handler event contract se typed), `startConsumer` (BullMQ worker, apne 2 connection; envelope contract se check; handler + `platform_processed_events` nishaan ek transaction me, dobara aaya event skip; retry job ki backoff se, har fail try rollback; aakhri try ke baad ya turant jab retry bekaar ho (anjaan type/version, toota contract, `ParallelTransactionError`, `TransactionAbortedError`) `platform_dead_letters` me, 14 din), `ensureConsumerIndexes` (nishaan 7 din). Owner ka faisla: job me poora envelope (max 16 KB, `writeEvent` bade event pe error), kyunki consumer sirf apna DB padh sakta hai. 37 tests asli Mongo + Valkey pe (consumer ka alag DB); 62 mutations me 55 pakde (bache 7: 4 equivalent, timer unref process ke andar test nahi hota, worker ka reconnect option sirf reconnect pe dikhta, concurrency 1 ek policy). Baaki: part 3 job schedulers, `bq:epoch` watchdog, Redis wipe recovery, dead letters redrive. Uncommitted.
- **App aur backend generators** (`npm run create`, pehla sawal Package / Frontend app / Backend app): 11 apps (SPA, customer SSR, delivery PWA) aur 5 deployables + bundle. Bane hue apps/services npm packages nahi, `private` workspaces hain (owner ka faisla). Smoke tests har kind ko throwaway repo me bana ke uske typecheck, lint, test, build chalate hain, aur compiled bundle ko asli chala ke `/ready` dekhte hain; generated gateway + bundle ke tests 22/22 mutations pakadte hain. Abhi `frontend/` aur `backend/` me kuch bana nahi. Guide: [packages/README.md](packages/README.md) §3.1–3.2. Uncommitted.
- **Package CLI** (`scripts/packages/`): `login`, `logout`, `status`, `create`, `publish`, `republish`, `verify`, `build`. 75 tests (fast 55, e2e 9 fake npm registry ke saath, create 11), sab green; 23 mutation checks, sab pakde gaye. Guide: [packages/README.md](packages/README.md).
- **Docs:** PRD v1.0, ARCHITECTURE v1.4 draft, RULES, DESIGN, TASKS v1.3, MEMORY, packages/README v1.1, ye HANDOFF.

**Git (2026-10-20):** saara kaam `main` pe 3 commits me hai: "build: initialize monorepo structure and package management tooling", "feat(packages)!: release packages only from the release branch" aur "docs: add teammate handoff guide and record package decisions". Ye push ho chuke hain, aur `main`, `prerelease`, `release` teeno isi point se shuru hui hain; `git log` me ye teeno dikhne chahiye.

**2026-10-20 ke faisle (docs me likhe hue):**

- Apps sirf English me.
- Packages naye bante hain; `BQ-Packages` sirf reference (TASKS T0.1).
- Packages sirf `release` branch se publish (ARCH §13, TASKS T0.7).
- **Frozen:** mobile pe koi message nahi: na SMS, na WhatsApp (na login OTP, na delivery OTP, na order updates). OTP sirf email se; notifications in-app, email aur browser push. Phone sirf contact (PRD §2, ARCH §7.1).
- Jis product ka order hua wo archive hota hai, delete nahi; har image ka ek owner, reuse = copy (ARCH §6.7).
- Package CLI ke owner decisions: publish laptop (2FA) + GitHub Actions; release ke baad commit + tags (push insaan karta hai); dependents default "Yes"; naye packages sirf ESM, TypeScript ~6.0.3.

## 4. Agla kaam (is order me)

1. **T0.7 ho gaya.** 2026-10-20: branches ban gayi, CI teeno pe green; ruleset `protected-branches` (`main`, `prerelease`, `release`: delete aur force push band, PR + 1 approval, `check` required aur up to date, bypass sirf Repository admin); tag ruleset `release-tags` (`@beautinique/*` tags sirf owner bana, badal ya mita sakta hai); environment `npm` sirf `release` branch se, owner ki approval ke saath. Iska matlab: har PR pe CI `check` green + 1 approval chahiye (owner bypass kar sakta hai); `release` pe seedha push sirf owner (package release); npm publish job owner ke approve karne pe hi chalta hai. Owner ne Actions permissions aur Advanced Security bhi set ki (ye public API se check nahi hote).
2. **Main code shuru (owner ka faisla, 2026-10-20):** neev ke packages ke baad ab apps aur backend ka asli kaam; baaki packages tabhi bante hain jab app ko chahiye. Niyam: jo cheez do apps ko chahiye ya saaf taur pe sabki hai (login, API client, layout), wo turant `npm run create` se package me, app me copy nahi. Saare packages public. Andaazan package order TASKS T0.1 me.
3. **Packages ka publish abhi nahi (owner ka faisla, 2026-10-21):** saare apps isi monorepo se package lete hain (npm workspaces), live deploy pe bhi, isliye `npm run publish` / `republish` mat chalao. Packages `private` bhi mat karo: wo public hi rahenge, taaki zaroorat pe (jaise repo ke bahar koi package chahiye) seedha publish ho sake. Tab owner ka npm account chahiye (`npm run login`, phir `release` branch pe `npm run publish`); doosre insaan ko publish karna ho to owner pehle use npm org `@beautinique` me jode.
4. **Package CLI follow-up:** `update-deps` command (purane repo me tha; naya republish external dependencies upgrade nahi karta). Scope: outdated deps ki list, select (all / category / packages), ranges update, install, build + checks, fail pe sab wapas.
5. **Apps aur deployables:** gateway, identity, core, bundle (`backend/`) aur customer, admin (`frontend/`) owner ne generator se bana liye (2026-10-21). Baaki apps aur payments/notify tab, jab unka kaam shuru ho.
6. **Phase 0 ke baaki tasks:** T0.2 (4 apps → `frontend/`), T0.3 (gateway + services → `backend/`), T0.4, T0.5 Turborepo, T0.6 (affected build; gitleaks ho gaya), T0.8 ho gaya, T0.9 (`.env.example` + zod env schema). Milestone 0 ke bina Phase 1 nahi.
7. **Phase 1 (backend neev):** T1.2 `server-mongo` ho gaya; **T1.3 `server-queue` ke part 1 aur 2 ho gaye** (Redis connection, outbox writer, relay; consumer, inbox dedupe, retries, dead letters; part 2 uncommitted). Agla **T1.3 part 3**: job schedulers, `bq:epoch` watchdog aur Redis wipe recovery (ARCHITECTURE §5.2, §5.3, §6.6). Part 3 me dead letters ko dekh ke dobara bhejne (redrive) ka tool bhi. Tests ke liye `npm run infra:up` (Mongo + Valkey). Production Redis = Render Key Value free, internal URL (owner ka faisla 2026-10-21); laptop aur tests hamesha local Valkey pe, production Redis pe kabhi nahi.

## 5. Khule sawal aur owner ke kaam

- **Owner ke kaam:** [TASKS.md](TASKS.md) section A (A.1–A.9): `gh auth login`, Ola Maps, Render, Atlas, Cloudinary/Sentry/Razorpay/Google OAuth, Brevo, R2, UptimeRobot, Vercel. Ye doosra insaan nahi kar sakta.
- **Doosre insaan ke access:** GitHub repo pe collaborator, aur publish karna ho to npm org `@beautinique` me member (owner dega).
- **Trusted publishing:** GitHub se publish karne se pehle har package pe `npm trust github` (republish `--target github` ye khud karta hai, owner ke npm 2FA ke saath).
- Docs me jahan koi business sawal khula ho, wahan khud faisla mat lo: owner se poochho aur jawab doc + change log me likho.

## 6. Traps (pehle hi pata ho)

- **MongoDB 8.0 aur Linux kernel 6.19+:** naye kernel pe `mongo:8.0.x` shuru hi nahi hota ("MongoDB cannot start: Linux kernel versions 6.19 and newer ...", SERVER-121912), kyunki uska tcmalloc kernel ke ek badlav se toot jaata hai. Ubuntu/Azure ke `7.0.0-xx` kernel bhi block hote hain (SERVER-136848). GitHub ke `ubuntu-latest` aur `ubuntu-24.04` dono runners kernel `7.0.0-azure` pe hain (2026-10-22), isliye runner pin karna kaam nahi aaya. **Hal:** compose ke `mongo` service me `GLIBC_TUNABLES=glibc.pthread.rseq=1` (JIRA pe bataya gaya workaround; tcmalloc safe raaste pe chalta hai). Laptop (WSL2 kernel 6.18) pe bhi yahi chalta hai. MongoDB ka asli fix aane pe ye setting hata do. CI ka start step kernel version print karta hai.
- **Naya backend package jo kisi service pe test kare** (Mongo, Valkey, aage Mailpit): `ci.yml` aur `release.yml` ke "Start MongoDB and Valkey" step me wo service jodo, warna CI pe uske tests "These tests need ..." se fail hote hain (server-queue ke pehle push pe Valkey chhoot gaya tha). Service shuru na ho to ye step `docker compose ps` aur uske aakhri 200 log lines print karta hai: wahi wajah batate hain.
- **Test me password wala nakli URL bhi gitleaks pakadta hai** (koi bhi Mongo ya Redis URL jisme scheme ke baad user, colon, password aur `@` ho; docs ki example bhi): CI fail. Aisa test ya doc likho to password ko URL me literal mat likho (docs me `<password>` jaisa placeholder chalta hai), ya push se pehle local scan (`gitleaks git --config .gitleaks.toml --redact .`) chala ke finding ko `.gitleaksignore` me fingerprint + wajah ke saath daalo. Push hui history badli nahi ja sakti.
- **npm 12 chahiye:** root `package.json` ka `devEngines` Node >=24 aur npm >=12.2.0 maangta hai (`onFail: error`), isliye purane npm pe `npm install` ruk jata hai. CI me bhi isi wajah se `setup-node` ka npm cache band hai (wo npm 11 se `npm config get cache` chalata hai aur `EBADDEVENGINES` aata hai); npm 12 install hone ke baad `actions/cache` `~/.npm` cache karta hai.
- **TypeScript ~6.0.3 pinned hai:** TS 7 aa gaya hai, par typescript-eslint sirf <6.1 support karta hai. Upgrade mat karna jab tak typescript-eslint support na de.
- **ESLint factory ka naam `configs/eslint-config.js` hi rahe:** `eslint.config.js` naam dene pe ESLint use config samajh leta hai.
- **tsdown:** `fixedExtension: false` zaroori (warna platform node pe `.mjs` banta hai). CSS wale entry points arethetypeswrong ko nahi diye jate.
- **Windows:** tests ki temp folders kabhi-kabhi EPERM deti hain (retry hota hai). CLI npm ko bina shell chalata hai.
- **Fake registry wale tests:** in-process server ke saath `spawnSync` deadlock karta hai, async `spawn` use karo.
- **`npm run x --flag` (bina `--`):** npm flag ko `npm_config_*` bana deta hai; CLI `--dry-run` ko maanta hai aur baaki ko child npm se hata deta hai.
- **Docker Desktop (owner ka laptop):** install se pehle khula terminal `docker` nahi dhoondh pata; naya terminal kholo.
- **Claude ke liye:** Bash heredoc/`node -e` me backslashes aur quotes toot jaate hain; regex aur source files Write/Edit tool se likho.
- **Backend apps ki export condition:** TypeScript me `customConditions: ["development"]` mat lagao: TS phir libraries (jaise arethetypeswrong) ka `.ts` source padhne lagta hai. Deployables ke `exports` me `types` source pe hai, aur Node/Vitest apni condition `beautinique-source` se source lete hain.
- **`http.request(urlString)`** URL ko pehle saaf karta hai (`..`, `%2e%2e` hat jaate hain); raw path test karna ho to `{ hostname, port, path }` do.
- **Band server ka handle** (`process.getActiveResourcesInfo()`) Windows pe ~50 ms baad hatta hai; ginti se pehle settle hone do.

## 7. Purane repos (sab clean, GitHub ke saath sync, 2026-10-20)

| Repo                                              | Kya hai                                      | Ab kya role                                                                                 |
| ------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `BQ-Client`, `BQ-Admin`, `BQ-Seller`, `BQ-Master` | Purane apps (React + Vite)                   | T0.2 me `frontend/` me aayenge; tab tak reference                                           |
| `BQ-Packages` (branch `feat/components-package`)  | Purane `@beautinique/*` packages             | Sirf reference; naye packages monorepo me                                                   |
| `BQ-Microservices`, `Beautinique-Gateway`         | Purana backend (Express + Mongoose + BullMQ) | T0.3 me `backend/` me port; naya design ARCHITECTURE ke hisaab se                           |
| `Beautinique-Docs`                                | Purani docs repo                             | Istemal nahi hota; docs ab `Beautinique/docs` me (owner ke laptop se folder hata diya gaya) |

## 8. Kaam rokte waqt (dono ke liye)

1. §3 "Abhi ki halat" aur §4 "Agla kaam" update karo: kya hua, kya adhoora hai (file + task ID), kya uncommitted hai.
2. Naya faisla → sahi doc + change log, aur [MEMORY.md](MEMORY.md) ke decision log me ek line.
3. Commit + push (Conventional Commits), taaki doosre ke paas sab pahunche.
4. Neeche change log me ek line: date, kaun, kya.

## Change log

| Version | Date       | Badlav                                                                                                        |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-10-20 | Pehla handoff (owner → doosra developer): setup, halat, agla kaam, khule sawal, traps, purane repos.          |
| v1.1    | 2026-10-20 | Branches `prerelease` aur `release` ban gayi; T0.7 me sirf protection baaki.                                  |
| v1.2    | 2026-10-20 | CI fix ke baad teeno branches green; `main` default branch wala git flow (§2) aur T0.7 ki settings list (§4). |
| v1.3    | 2026-10-20 | T0.7 done (rulesets, tag ruleset, `npm` environment).                                                         |
| v1.4    | 2026-10-20 | Styles package poora (§3, §4).                                                                                |
| v1.5    | 2026-10-20 | Neev ke 4 shared packages bane (§3, §4).                                                                      |
| v1.6    | 2026-10-20 | Saare packages public; ab main code, packages zaroorat ke saath.                                              |
| v1.7    | 2026-10-20 | `backend-server-kit` aur app/backend generators bane (§3, §4); 3 naye traps (§6).                             |
| v1.8 | 2026-10-20 | Faisle: OTP sirf email se (frozen), product archive, ek image ek owner. |
| v1.9 | 2026-10-20 | Faisla: SMS aur WhatsApp channel poore hate (frozen). |
| v1.10 | 2026-10-21 | Faisla: packages public, par abhi publish/republish nahi, zaroorat pe hi (§3, §4). |
| v1.11 | 2026-10-21 | T0.8 local infra bana (§3); bane hue apps aur deployables (§4). |
| v1.12 | 2026-10-21 | T0.6 ka gitleaks hissa: CI secret scan (§3, §4). |
| v1.13 | 2026-10-21 | T1.2 `backend-server-mongo` bana (§3); tests, verify, publish ke liye `infra:up` (§2). |
| v1.14 | 2026-10-21 | T1.3 part 1 `backend-server-queue` (§3, §4); production Redis provider ka sawal (§4). |
| v1.15 | 2026-10-21 | Faisla: production Redis = Render Key Value free; khula sawal band (§4). |
| v1.16 | 2026-10-21 | Pehle GitHub gitleaks run ki finding (nakli test URL) `.gitleaksignore` se; naya trap (§6). |
| v1.17 | 2026-10-21 | v1.16 ke trap ki example URLs ne khud gitleaks fail karaya: shabdon me likha; `3fdfb49` ki 3 findings ignore. |
| v1.18 | 2026-10-21 | CI aur release Valkey bhi chalate hain; naya trap (§6). |
| v1.19 | 2026-10-22 | CI `ubuntu-24.04` pe pin (MongoDB 8.0 kernel 6.19+ pe nahi chalta); trap (§6). |
| v1.20 | 2026-10-22 | T1.3 part 2 `server-queue` consumer (§3, §4); job me poora envelope. |
