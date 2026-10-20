# HANDOFF — BQ

> **Status:** v1.2 (2026-10-20). Is project pe 2 log kaam karte hain. Ye file batati hai ki **abhi kya halat hai, kisne kya chhoda, agla kaam kya hai** aur kaunse sawal khule hain, taaki doosra insaan (aur uska Claude) bina poora itihaas padhe kaam utha sake. Jo bhi kaam roke, wo ye file update kare (neeche §8).

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
3. Checks: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`. Package CLI ke tests me e2e ~4 minute aur create ~1 minute lete hain.
4. Styles ka playground: `npm run playground --workspace @beautinique/frontend-styles` (http://localhost:5180).
5. **Roz ka git flow** (ARCHITECTURE §13, RULES §2): `git switch main` → `git pull` → `git switch -c feat/<kaam>` → commits (Conventional Commits) → PR **`main`** pe. Batch ready ho to PR `main` → `prerelease` (laptop Docker pe integration/E2E), phir PR `prerelease` → `release` (live + npm). Package release ke baad PR `release` → `main` (back-merge).
6. Docker sirf local dev ke liye hai (owner Docker seekh raha hai; TASKS me "Docker Lesson" wale tasks owner ke saath karne hain).

## 3. Abhi ki halat (2026-10-20)

**Bana hua (sab `Beautinique` repo me):**

- **Monorepo root (T0.5, T0.6 ka pehla hissa):** npm workspaces `packages/*/*`, root scripts, `configs/` (ESLint factory + tsconfig presets), Prettier, `.gitattributes` (LF), `LICENSE` (MIT).
- **CI:** `.github/workflows/ci.yml`: `npm ci` → `npm run build` → format, lint, typecheck, test, `verify --all`, `npm audit`. Har PR pe, aur `main`, `prerelease`, `release` pe push.
- **Release:** `.github/workflows/release.yml`, sirf `release` branch pe, haath se. Do jobs: build (check + pack, har version ka tag isi commit pe zaroori) aur publish (OIDC trusted publishing, kuch install nahi karta, `.github/scripts/publish-tarballs.mjs`). Ye abhi tak GitHub pe chala nahi hai.
- **`@beautinique/frontend-styles` 2.0.0** (`packages/frontend/styles`): Tailwind v4, Rose + Plum palette (RGB channel vars, OKLCH + WCAG check), fonts Plus Jakarta Sans + Fraunces (`scripts/fonts.mjs`, `/vite` preload plugin), `base.css`, Vite playground. **npm pe abhi publish nahi hua** (npm pe purana 1.1.2 hai).
- **Package CLI** (`scripts/packages/`): `login`, `logout`, `status`, `create`, `publish`, `republish`, `verify`, `build`. 75 tests (fast 55, e2e 9 fake npm registry ke saath, create 11), sab green; 23 mutation checks, sab pakde gaye. Guide: [packages/README.md](packages/README.md).
- **Docs:** PRD v1.0, ARCHITECTURE v1.4 draft, RULES, DESIGN, TASKS v1.3, MEMORY, packages/README v1.1, ye HANDOFF.

**Git (2026-10-20):** saara kaam `main` pe 3 commits me hai: "build: initialize monorepo structure and package management tooling", "feat(packages)!: release packages only from the release branch" aur "docs: add teammate handoff guide and record package decisions". Ye push ho chuke hain, aur `main`, `prerelease`, `release` teeno isi point se shuru hui hain; `git log` me ye teeno dikhne chahiye.

**2026-10-20 ke faisle (docs me likhe hue):**

- Apps sirf English me.
- Packages naye bante hain; `BQ-Packages` sirf reference (TASKS T0.1).
- Packages sirf `release` branch se publish (ARCH §13, TASKS T0.7).
- Package CLI ke owner decisions: publish laptop (2FA) + GitHub Actions; release ke baad commit + tags (push insaan karta hai); dependents default "Yes"; naye packages sirf ESM, TypeScript ~6.0.3.

## 4. Agla kaam (is order me)

1. **T0.7 baaki hissa (owner):** `prerelease` aur `release` branches ban gayi hain aur CI teeno branches pe green hai (2026-10-20), par abhi kisi branch pe ruleset nahi hai. Baaki: Settings → Rules → Rulesets → branch ruleset jo `main`, `prerelease`, `release` teeno pe ho: PR zaroori (1 approval), required status check `check`, force push aur delete band; bypass list me Repository admin "Always" (sirf package CLI ka release commit + tags push karne ke liye). Saath me: Environment `npm` (sirf `release` branch, required reviewer owner), Actions ki workflow permissions "Read", Dependabot alerts + secret scanning + push protection on. `main` hi default branch rahega.
2. **T0.1 styles package ke baaki hisse:** utilities, animations (`animations.css`, DESIGN.md "Motion"), component CSS (quill wagairah). Phir doosre packages naye banana (`npm run create`), purane `BQ-Packages` ko sirf dekh ke. ARCHITECTURE §9.2 ke flat naam (contracts, server-kit, ...) ko `shared/frontend/backend` layout me map karna.
3. **Styles 2.0.0 ka pehla publish:** owner ka npm account chahiye (`npm run login`, phir `release` branch pe `npm run publish`). Doosre insaan ko publish karna ho to owner pehle use npm org `@beautinique` me jode.
4. **Package CLI follow-up:** `update-deps` command (purane repo me tha; naya republish external dependencies upgrade nahi karta). Scope: outdated deps ki list, select (all / category / packages), ranges update, install, build + checks, fail pe sab wapas.
5. **Phase 0 ke baaki tasks:** T0.2 (4 apps → `frontend/`), T0.3 (gateway + services → `backend/`), T0.4, T0.5 Turborepo, T0.6 (affected build + gitleaks), T0.8 (Docker infra, owner ke saath), T0.9 (`.env.example` + zod env schema). Milestone 0 ke bina Phase 1 nahi.

## 5. Khule sawal aur owner ke kaam

- **Owner ke kaam:** [TASKS.md](TASKS.md) section A (A.1–A.9): `gh auth login`, Ola Maps, Render, Atlas, Cloudinary/Sentry/Razorpay/Google OAuth, Brevo, R2, UptimeRobot, Vercel. Ye doosra insaan nahi kar sakta.
- **Doosre insaan ke access:** GitHub repo pe collaborator, aur publish karna ho to npm org `@beautinique` me member (owner dega).
- **Trusted publishing:** GitHub se publish karne se pehle har package pe `npm trust github` (republish `--target github` ye khud karta hai, owner ke npm 2FA ke saath).
- Docs me jahan koi business sawal khula ho, wahan khud faisla mat lo: owner se poochho aur jawab doc + change log me likho.

## 6. Traps (pehle hi pata ho)

- **npm 12 chahiye:** root `package.json` ka `devEngines` Node >=24 aur npm >=12.2.0 maangta hai (`onFail: error`), isliye purane npm pe `npm install` ruk jata hai. CI me bhi isi wajah se `setup-node` ka npm cache band hai (wo npm 11 se `npm config get cache` chalata hai aur `EBADDEVENGINES` aata hai); npm 12 install hone ke baad `actions/cache` `~/.npm` cache karta hai.
- **TypeScript ~6.0.3 pinned hai:** TS 7 aa gaya hai, par typescript-eslint sirf <6.1 support karta hai. Upgrade mat karna jab tak typescript-eslint support na de.
- **ESLint factory ka naam `configs/eslint-config.js` hi rahe:** `eslint.config.js` naam dene pe ESLint use config samajh leta hai.
- **tsdown:** `fixedExtension: false` zaroori (warna platform node pe `.mjs` banta hai). CSS wale entry points arethetypeswrong ko nahi diye jate.
- **Windows:** tests ki temp folders kabhi-kabhi EPERM deti hain (retry hota hai). CLI npm ko bina shell chalata hai.
- **Fake registry wale tests:** in-process server ke saath `spawnSync` deadlock karta hai, async `spawn` use karo.
- **`npm run x --flag` (bina `--`):** npm flag ko `npm_config_*` bana deta hai; CLI `--dry-run` ko maanta hai aur baaki ko child npm se hata deta hai.
- **Docker Desktop (owner ka laptop):** install se pehle khula terminal `docker` nahi dhoondh pata; naya terminal kholo.
- **Claude ke liye:** Bash heredoc/`node -e` me backslashes aur quotes toot jaate hain; regex aur source files Write/Edit tool se likho.

## 7. Purane repos (sab clean, GitHub ke saath sync, 2026-10-20)

| Repo | Kya hai | Ab kya role |
|---|---|---|
| `BQ-Client`, `BQ-Admin`, `BQ-Seller`, `BQ-Master` | Purane apps (React + Vite) | T0.2 me `frontend/` me aayenge; tab tak reference |
| `BQ-Packages` (branch `feat/components-package`) | Purane `@beautinique/*` packages | Sirf reference; naye packages monorepo me |
| `BQ-Microservices`, `Beautinique-Gateway` | Purana backend (Express + Mongoose + BullMQ) | T0.3 me `backend/` me port; naya design ARCHITECTURE ke hisaab se |
| `Beautinique-Docs` | Purani docs repo | Istemal nahi hota; docs ab `Beautinique/docs` me (owner ke laptop se folder hata diya gaya) |

## 8. Kaam rokte waqt (dono ke liye)

1. §3 "Abhi ki halat" aur §4 "Agla kaam" update karo: kya hua, kya adhoora hai (file + task ID), kya uncommitted hai.
2. Naya faisla → sahi doc + change log, aur [MEMORY.md](MEMORY.md) ke decision log me ek line.
3. Commit + push (Conventional Commits), taaki doosre ke paas sab pahunche.
4. Neeche change log me ek line: date, kaun, kya.

## Change log

| Version | Date | Badlav |
|---|---|---|
| v1.0 | 2026-10-20 | Pehla handoff (owner → doosra developer): setup, halat, agla kaam, khule sawal, traps, purane repos. |
| v1.1 | 2026-10-20 | Branches `prerelease` aur `release` ban gayi; T0.7 me sirf protection baaki. |
| v1.2 | 2026-10-20 | CI fix ke baad teeno branches green; `main` default branch wala git flow (§2) aur T0.7 ki settings list (§4). |
