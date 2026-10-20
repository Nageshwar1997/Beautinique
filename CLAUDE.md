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
6. [docs/packages/README.md](docs/packages/README.md): packages ka CLI (create, publish, republish).

## Hamesha laagu niyam (detail RULES.md me)

- **Apps sirf English me** (paise aur dates `en-IN` format me). Is ek line ke alawa app ki language ke
  baare me repo me kuch mat likho (na code, na comments, na docs, na "ye nahi hai" jaise notes), aur
  koi language feature propose mat karo. Owner ka sakht niyam hai.
- **Docs Hinglish me** (jaise ye file). Code, identifiers, comments aur app UI
  English me. Har doc ke top pe status (version + date), neeche change log; har badlav ki ek line.
- **Production-grade, kuch bhi "baad me" nahi.** Koi role ya feature "growth/later" mat banao; rokna ho
  to insaan se poochho.
- **Business decision owner ka hai** (doosra developer bhi owner se poochhe). Docs chup hon to
  recommendation ke saath poochho, phir jawab sahi doc + change log me likho.
- **Imaandari:** jo asli user action karke check nahi kiya, use "verified" mat kaho. Test fail ho to
  output ke saath batao.
- **Public repo:** koi secret, `.env`, token, password, DB dump ya asli personal data commit nahi; sirf
  `.env.example`. Claude `.env`/`.env.*` files aur repo ke bahar ka `All-ENVs` folder kabhi nahi kholta.
- **Git flow:** feature branch → PR → `main` (default) → `prerelease` → `release`; teeno pe seedha
  push nahi. Package release ke baad `release` → `main` back-merge (RULES §2).
- **Commit/push sirf jo insaan kaam kar raha hai uske kehne pe.** Destructive kaam se pehle poochho.
- **npm pe kuch bhi publish, `npm login/logout` ya `npm trust` sirf insaan ke kehne pe**; tests kabhi
  asli registry ko nahi chhoote (fake registry hai).
- **Mutation testing copy me karo**, asli files me nahi (dev server file badalte hi reload hota hai).
- **Kam tokens:** targeted edits, file ka zaroori hissa hi padho, bade multi-agent workflows sirf
  zaroorat pe aur pehle bata ke.

## Setup aur commands

Node 24 aur **npm 12.2+** (Node 24 ke saath npm 11 aata hai: `npm install --global npm@12.2.0`).

```bash
npm install
npm run build
```

| Command                                                       | Kaam                                                        |
| ------------------------------------------------------------- | ----------------------------------------------------------- |
| `npm run lint` / `typecheck` / `test` / `format:check`        | Saare checks (CI yahi chalata hai, `npm run build` ke baad) |
| `npm run test:scripts`                                        | Sirf package CLI ke tests (e2e ~4 min, create ~1 min)       |
| `npm run status`                                              | Har package: local vs npm version, login                    |
| `npm run verify -- --all --yes`                               | Publish wale saare checks, bina publish ke                  |
| `npm run create` / `publish` / `republish`                    | Packages ka CLI; har command `-- --help` deta hai           |
| `npm run playground --workspace @beautinique/frontend-styles` | Styles ka Vite playground (port 5180)                       |

## Repo ka naksha

- `packages/<shared|frontend|backend>/<name>` → `@beautinique/<category>-<name>` (npm workspaces).
  Packages naye bante hain; purana `BQ-Packages` repo sirf reference hai.
- `frontend/`, `backend/`: abhi khaali (TASKS T0.2, T0.3).
- `scripts/packages/`: package CLI (Node 24 TypeScript seedha chalata hai, build nahi). Tests:
  `scripts/packages/test/`.
- `configs/`: shared ESLint factory (`eslint-config.js`, naam `eslint.config.js` nahi ho sakta) aur
  tsconfig presets.
- `.github/workflows/`: `ci.yml` (har PR, aur `main`/`prerelease`/`release` pe push), `release.yml`
  (packages publish, sirf `release` branch, haath se).

## Kaam rokte waqt

[docs/HANDOFF.md](docs/HANDOFF.md) ke "Abhi ki halat" aur "Agla kaam" update karo: kya kiya, kya
adhoora hai, kya uncommitted hai, kaunsa sawal kiske liye khula hai. Change log me ek line jodo.
