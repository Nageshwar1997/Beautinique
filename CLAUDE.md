# CLAUDE.md — Beautinique

Ye file Claude Code har session ki shuruaat me padhta hai. Is project pe 2 log kaam karte hain, isliye
**kaam shuru karne se pehle [docs/HANDOFF.md](docs/HANDOFF.md) padho**: usme abhi ki halat, kisne kya
chhoda aur agla kaam likha hai. Kaam rokte waqt HANDOFF.md update karo (neeche "Kaam rokte waqt").

## Project ek line me

Beautinique: Indian beauty-only e-commerce marketplace (har role ka alag app, backend services, shared
npm packages), ek public monorepo me. Education + portfolio project hai, par har cheez asli production
launch jaisi banti hai. Legal cheezein dummy data ke saath implement hoti hain.

## Docs (sach yahi hai, isi order me padho)

1. [docs/HANDOFF.md](docs/HANDOFF.md): abhi kya chal raha hai, agla kaam.
2. [docs/RULES.md](docs/RULES.md): kaam ke niyam (Definition of Done, git, code, testing, security, AI).
3. [docs/TASKS.md](docs/TASKS.md): phases aur tasks (`T<phase>.<n>`), owner ke kaam (section A).
4. [docs/MEMORY.md](docs/MEMORY.md): decision log, purane sabak, traps.
5. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/PRD.md](docs/PRD.md), [docs/DESIGN.md](docs/DESIGN.md): zaroorat ke hisaab se, poore nahi.
6. [docs/packages/README.md](docs/packages/README.md): packages ka CLI (create, publish, republish, update-deps).

## Hamesha laagu niyam (detail RULES.md me)

- **Apps sirf English me** (paise aur dates `en-IN` format me). Is ek line ke alawa app ki language ke
  baare me repo me kuch mat likho (na code, na comments, na docs, na "ye nahi hai" jaise notes), aur
  koi language feature propose mat karo. Owner ka sakht niyam hai.
- **Docs Hinglish me** (jaise ye file). Code, identifiers, comments aur app UI
  English me. Har doc ke top pe status (version + date), neeche change log; har badlav ki ek line.
- **Mobile pe koi message nahi (owner ka frozen faisla, 2026-10-20).** Na SMS, na WhatsApp: na OTP, na
  notification. Har OTP sirf email se; notifications in-app, email aur browser push. Inka flow mat banao aur
  propose mat karo. Phone number sirf contact ke liye hai.
- **Production-grade, kuch bhi "baad me" nahi.** Koi role ya feature "growth/later" mat banao; rokna ho
  to insaan se poochho.
- **Business decision owner ka hai** (doosra developer bhi owner se poochhe). Docs chup hon to
  recommendation ke saath poochho, phir jawab sahi doc + change log me likho.
- **Imaandari:** jo asli user action karke check nahi kiya, use "verified" mat kaho. Test fail ho to
  output ke saath batao.
- **Public repo:** koi secret, `.env`, token, password, DB dump ya asli personal data commit nahi; sirf
  `.env.example`. Claude `.env`/`.env.*` files aur repo ke bahar ka `All-ENVs` folder kabhi nahi kholta.
- **Git flow (owner, 2026-10-25):** `prerelease` se feature branch → PR → **`prerelease`** (development)
  → PR → **`release`** (production) → release safal hone ke baad PR `release` → **`main`** (sirf final code).
  `main` pe kabhi seedha kaam ya feature PR nahi; `main` aur `release` pe seedha push nahi. `prerelease` pe sirf
  chhota fix seedha push ho sakta hai (1–10 files, local checks ke baad, force push nahi; RULES §2). Release pe bane commits
  (package release, hotfix) ke baad `release` → `prerelease` back-merge bhi. CI ye flow check karta hai (RULES §2).
- **Commit/push sirf jo insaan kaam kar raha hai uske kehne pe.** Destructive kaam se pehle poochho.
- **npm pe kuch bhi publish, `npm login/logout` ya `npm trust` sirf insaan ke kehne pe**; tests kabhi
  asli registry ko nahi chhoote (fake registry hai).
- **Mutation testing copy me karo**, asli files me nahi (dev server file badalte hi reload hota hai). Sirf 3 jagah (RULES §6):
  kernel packages pehli baar poora run (background) aur baad me badli lines; paisa/stock/permissions me badli lines; baaki apps
  aur modules me mutation nahi.
- **Kam tokens:** targeted edits, file ka zaroori hissa hi padho. Review, checks aur research Claude khud
  kare. Agent sirf extreme zaroorat pe, pehle bata ke, aur **ek waqt me ek hi**: kabhi parallel nahi,
  agla tabhi jab pichhla poora ho jaye (owner, 2026-10-25; RULES §9).

## Setup aur commands

Node 24 aur **npm 12.2+** (Node 24 ke saath npm 11 aata hai: `npm install --global npm@12.2.0`).

```bash
npm install
npm run build
```

| Command                                                                               | Kaam                                                                                                                                                             |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint` / `typecheck` / `test` / `format:check`                                | Saare checks (CI yahi chalata hai, `npm run build` ke baad; test ko Mongo chahiye: `infra:up`)                                                                   |
| `npm run test:scripts`                                                                | Sirf CLI ke tests (~10 min; e2e aur app/backend sabse lambe)                                                                                                     |
| `npm run status`                                                                      | Har package: local vs npm version, login                                                                                                                         |
| `npm run verify -- --all --yes`                                                       | Publish wale saare checks, bina publish ke                                                                                                                       |
| `npm run create` (`create:app`, `create:backend`)                                     | Naya package, frontend app ya backend app                                                                                                                        |
| `npm run publish` / `republish`                                                       | Packages ka CLI; har command `-- --help` deta hai                                                                                                                |
| `npm run update-deps` (`update-deps:minor`, `update-deps:patch`, `-- --dry-run`)      | Saare package.json ki dependencies naye versions pe (default major), phir `npm install`; `typescript` hold pe ([packages/README.md](docs/packages/README.md) §7) |
| `npm run dev:backend`                                                                 | `backend/bundle`: saare deployables ek process me                                                                                                                |
| `npm run db:release` (`-- --force`, `-- --env live`)                                  | Deployables ke release steps (migrations, indexes) bina server chalaye; live pe `live` type karke ([backend/bundle/README.md](backend/bundle/README.md))         |
| `npm run infra:up` / `infra:down` / `infra:reset`                                     | Local Mongo, Valkey, Mailpit (Docker; [infra/README.md](infra/README.md))                                                                                        |
| `npm run infra:mutation:up` / `infra:mutation:down`                                   | Mutation runs ke liye alag Mongo (27018) aur Valkey (6380): normal kaam saath chalta rahe (RULES §6)                                                             |
| `npm run mutate -- --package backend-server-queue` (`--changed`, `--base prerelease`) | Mutation testing (RULES §6): package ki `test/mutations.ts`, temp copy me                                                                                        |
| `npm run playground --workspace @beautinique/frontend-styles`                         | Styles ka Vite playground (port 5180)                                                                                                                            |

## Repo ka naksha

- `packages/<shared|frontend|backend>/<name>` → `@beautinique/<category>-<name>` (npm workspaces).
  Packages naye bante hain; purana `BQ-Packages` repo sirf reference hai.
- `frontend/<app>`, `backend/<name>`: `npm run create` se bante hain, npm packages nahi (abhi: customer, admin;
  gateway, identity, notify, core, bundle).
- `infra/`: laptop ka Docker infra (Mongo replica set, Valkey, Mailpit); live pe Docker nahi.
- `scripts/mutation/`: mutation runner (`npm run mutate`); lists har package ke `test/mutations.ts` me.
- `scripts/packages/`: package CLI (Node 24 TypeScript seedha chalata hai, build nahi). Tests:
  `scripts/packages/test/`.
- **MongoDB:** `import { ObjectId, withTransaction } from '@beautinique/backend-server-mongo'`; seedha `mongodb` sirf
  `packages/backend/server-mongo` me (ESLint rokta hai). Transaction me queries ek ke baad ek (`Promise.all` ESLint rokta hai),
  aur query ka error pakad ke aage nahi (dedupe `$setOnInsert` upsert se).
- **Events:** `writeEvent` (`@beautinique/backend-server-queue`) usi `withTransaction` me jisme data badla; relay BullMQ tak le jaata hai.
  Change stream (`.watch(`) sirf us relay me (ESLint rokta hai). Redis: laptop/CI pe Docker Valkey, production me Render Key Value free (internal URL), `REDIS_URL` se;
  production Redis laptop ya tests se kabhi nahi.
- **Zod:** `import { object, string, gstinZod } from '@beautinique/shared-zod'` (named, `z.` nahi); seedha `zod` sirf
  `packages/shared/zod` me (ESLint rokta hai). Hamare schemas `...Zod`, `enum as zodEnum`.
- **Routes:** contract pehle (`defineRoute`), handler `mountRoute(router, route, handler)` (`@beautinique/backend-server-kit`) se: input/output contract se check hota hai. Namuna: `backend/core/src/modules/platform/` (endpoint + event + subscriber); core ke tests ko `infra:up` chahiye.
- `configs/`: shared ESLint factory (`eslint-config.js`, naam `eslint.config.js` nahi ho sakta) aur
  tsconfig presets.
- `AGENTS.md`: doosre AI tools (Codex, Cursor, Copilot, Gemini ...) ke liye chhota pointer; niyam yahin (`CLAUDE.md`) rehte hain. Niyam badlo to dono dekho.
- `.github/workflows/`: `ci.yml` (har PR, aur `main`/`prerelease`/`release` pe push), `release.yml`
  (packages publish, sirf `release` branch, haath se).

## Kaam rokte waqt

[docs/HANDOFF.md](docs/HANDOFF.md) ke "Abhi ki halat" aur "Agla kaam" update karo: kya kiya, kya
adhoora hai, kya uncommitted hai, kaunsa sawal kiske liye khula hai. Change log me ek line jodo.

**Baari-baari (owner, 2026-10-25):** 2 developers, dono Claude Code ke saath. Weekly usage ~85% pe Claude
naya kaam nahi uthata: kaam commit-ready, branch push, HANDOFF §4 me adhoora aur agla kaam saaf; doosra
developer wahin se aage. Har task apni branch `feat/<task>` (`prerelease` se) → PR → `prerelease`; approval zaroori nahi, CI `check` green zaroori.
Poora flow [docs/HANDOFF.md](docs/HANDOFF.md) §8.
