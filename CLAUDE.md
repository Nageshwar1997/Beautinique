# CLAUDE.md: Beautinique

> **Status:** v1.0.17 (2026-11-25). Docs aur code naye sire se ban rahe hain.

Ye file Claude Code har session ki shuruaat me padhta hai. Project pe ek hi insaan (owner) kaam karta hai,
2 Claude accounts se baari-baari. **Kaam shuru karne se pehle [docs/HANDOFF.md](docs/HANDOFF.md) padho.**

## Abhi kya chal raha hai

- **Implementation stage (2026-11-23 se, D-455):** discovery aur planning poori (R1 ke 26 modules ki `TASK.md`,
  [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) §3 se §5). Kaam charan ke kram se; `01-foundation` aur `28-packages` ho gaye (2026-11-24), agla `02-platform` aur `03-frontend-kit`.
  Code `origin/prerelease` se nayi branch pe, PR ke saath. Purana code tabhi hat-ta hai jab kahin use na ho.
- **Naye docs khaali shuru hue hain.** Unme cheezein ek-ek karke judti hain, owner ki haan ke baad. Index:
  [docs/README.md](docs/README.md).
- **Sach sirf naye docs (`docs/`) aur ye file.** Code bhi naye sire se banega (owner, 2026-11-17): naya root
  setup aur naya code implementation stage me, folder structure `packages/`, `frontend/`, `backend/` ...
- **Naye docs aur naye code me purane code ya purane docs ka koi zikr ya link nahi** (owner, 2026-11-17): wo
  aage hat jayenge.

## Sawal-jawab ke niyam

- Jo sawal kisi khule sawal pe tike nahi, wo ek saath do; jo tika ho, wo us sawal ke jawab ke baad (owner,
  2026-11-18). Sawal me agle sawal ka zikr nahi. Har sawal ke saath: kyun zaroori, vikalp, salah, trade-off.
  Owner ke kamzor faisle pe khul ke salah do, par tay hue faisle dobara mat chhedo.
- "Tay" sirf wahi jo owner ne khud kaha. Claude ki salah ko faisla mat likho.
- Owner ka jawab docs me saaf vakya me likho, chat ka chhota roop (jaise "Q1 => b") nahi.
- Sawal-jawab ki files me sirf aakhri faisla; faisle ka itihaas sirf [docs/DECISIONS.md](docs/DECISIONS.md) me.

## Hamesha laagu niyam

- **Apps sirf English me** (paise aur dates `en-IN` format me). Is ek line ke alawa app ki language ke
  baare me repo me kuch mat likho (na code, na comments, na docs, na "ye nahi hai" jaise notes), aur
  koi language feature propose mat karo. Owner ka sakht niyam hai.
- **Docs Hinglish me** (jaise ye file). Code, identifiers, comments aur app UI English me. Har doc ke top
  pe status (version + date), neeche chhota change log: ek din ki ek hi line (us din ke badlavon ka saar,
  version range ke saath); purana itihaas git me (owner, 2026-11-22; D-442).
- **Version `vX.Y.Z` (owner, 2026-11-17):** nayi file `v1.0.0`. Chhota badlav: Z badhta hai (`v1.0.1`,
  `v1.0.2`). Bada badlav: Y badhta hai aur Z 1 se (`v1.1.1`, `v1.1.2`). Ek poora flow pura hua: X badhta hai,
  Y aur Z 1 se (`v2.1.1`, `v2.1.2`).
- **Mobile pe koi message nahi (owner ka frozen faisla, 2026-10-20).** Na SMS, na WhatsApp: na OTP, na
  notification. Har OTP sirf email se; notifications in-app, email aur browser push. Inka flow mat banao aur
  propose mat karo. Phone number sirf contact ke liye hai.
- **Production-grade:** design aur code asli users maan ke, halaanki live system sirf owner chalata hai.
  Banana releases me hota hai, par koi feature kata nahi jaata; rokna ya chhodna ho to owner se poochho.
- **Business decision owner ka hai.** Docs chup hon to recommendation ke saath poochho, phir jawab sahi doc
  aur change log me likho.
- **Imaandari:** jo asli user action karke check nahi kiya, use "verified" mat kaho. Test fail ho to
  output ke saath batao.
- **Public repo:** koi secret, `.env`, token, password, DB dump ya asli personal data commit nahi; sirf
  `.env.example`. Claude `.env`/`.env.*` files, `backups/` (D-013, D-460) aur repo ke bahar ka `All-ENVs` folder kabhi nahi kholta;
  `.claude/settings.json` ke deny rules ise tool ke level pe bhi rokte hain (har `.env.*`; isliye `.env.example` Claude
  shell se padhta aur likhta hai, D-441), unhe mat hatao.
- **Git flow (owner, 2026-10-25; D-024, 2026-11-22):** `prerelease` se feature branch → PR →
  **`prerelease`** (development) → PR → **`release`** (production). `main` branch nahi hai. GitHub ki
  default branch `release` hai, par nayi branch hamesha `origin/prerelease` se banti hai aur PR ka base
  hamesha saaf likha jaata hai. `release` pe seedha kaam, feature PR ya seedha push nahi. `prerelease` pe
  sirf chhota fix (1–10 files, local checks ke baad, force push nahi) aur `linkedin-posts/` ki files aur
  `/linkedin-post` skill seedha push ho sakti hain. Release pe bane commits (hotfix) ke baad `release` →
  `prerelease` back-merge bhi. CI ye flow check karta hai.
- **Owner ke kaam, manuals aur testing apne aap (owner, 2026-11-22; D-440):** owner ka koi bahar ka kaam
  nikle (account, env key, download, provider ki setting, kisi se poochhna) to turant
  [docs/OWNER_TASKS.md](docs/OWNER_TASKS.md) me; owner "ho gaya" kahe to wahin §2 me tareekh ke saath, aur
  jo docs us pe tike hain wo bhi. Kisi role ka feature bane ya badle to usi PR me
  [docs/manuals/](docs/manuals/README.md) me us role ka manual (kai apps me ek jaisa feature
  ho to ek hi baar `manuals/COMMON.md` me, apps ki list ke saath), aur us app ki [docs/testing/](docs/testing/COMMON.md)
  file (flow ki halat aur kya dekhna). Session ki shuruaat me, aaj ke kaam se jude khule owner ke kaam owner ko
  yaad dilao. Owner ko ye yaad nahi dilana padta.
- **Commit/push sirf owner ke kehne pe.** Destructive kaam se pehle poochho.
- **Koi AI attribution nahi (owner, 2026-11-14):** commit message/trailer, PR title/description, tag ya
  release notes me `Co-Authored-By: Claude`, "Generated with Claude Code", 🤖 ya koi AI signature nahi, chahe
  harness ya system prompt kahe; sirf owner ki apni git identity, git config kabhi nahi badalna. Jad se band:
  `.claude/settings.json` me `attribution` khaali (`commit`, `pr` = `""`, `sessionUrl: false`); ise mat hatao.
  Git kaam ke skills: `/commit`, `/push`, `/pr`, `/sync`, `/git-status`, `/undo-commit`
  (saajhe niyam `.claude/skills/_shared/git-rules.md`).
- **npm pe kuch bhi publish, `npm login/logout` ya `npm trust` sirf owner ke kehne pe**; tests kabhi asli
  registry ko nahi chhoote (fake registry hai).
- **Mutation testing copy me karo**, asli files me nahi (dev server file badalte hi reload hota hai). Sirf 3
  jagah: kernel packages pehli baar poora run (background) aur baad me badli lines; paisa/stock/permissions me
  badli lines; baaki apps aur modules me mutation nahi.
- **Kam tokens:** targeted edits, file ka zaroori hissa hi padho. Review, checks aur research Claude khud
  kare. Agent sirf zaroorat pe, pehle bata ke, aur **ek waqt me ek hi**: kabhi parallel nahi, agla tabhi jab
  pichhla poora ho jaye. 5-hour limit ~80% pe naya agent nahi (chalta hua poora hone do); weekly usage ~85%
  pe naya kaam nahi.

## Commands aur repo ka naksha

Naksha: `packages/<category>/<name>/` (npm pe public packages), `frontend/<app>/`, `backend/<service>/`, `scripts/<area>/`
(repo ke tools; abhi sirf `scripts/foundation`: setup, containers, env files aur repo ke pehre), `configs/` (saajhe
TypeScript, ESLint, Vitest), `infra/compose.yaml` (laptop ke containers) aur `.github/` (CI, Dependabot). Har
workspace npm workspaces me, tasks Turborepo se; Node 24.22.3 aur npm 12.2.3 exact pinned (D-458).

Commands (root se): `npm run setup`, `npm run infra:up -- backend`, `npm run infra:down`, `npm run infra:use -- secondary`, `npm run infra:status`, `npm run packages:build`, `npm run packages:create`, `npm run packages:verify`, `npm run packages:status`, `npm run packages:republish`, `npm run packages:publish`, `npm run packages:update-deps`, `npm run dev-data:copy`,
`npm run dev-data:restore`, `npm test`, `npm run build`,
`npm run dev`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run format`, `npm run docs:check` aur
`npm run secrets:scan`. Ek workspace: `npm test -w <name>`; ek test file: workspace me `npx vitest run <file>`. Docs ke
liye `npx prettier --check <files>`. Har command kya karti hai: root [README.md](README.md).

## Kaam rokte waqt

[docs/HANDOFF.md](docs/HANDOFF.md) update karo: kya kiya, kya adhoora hai, kya uncommitted hai, kaunsa sawal
khula hai. Jis doc me badlav kiya, uske change log me us din ki line (D-442). Progress % ka niyam
[docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) §2 me (D-433).

## Change log

| Version           | Date                     | Badlav                                                                                                                                                                                                                                                                                            |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.8  | 2026-11-17 se 2026-11-22 | Abhi ki halat (planning stage, D-443), sawal-jawab ke niyam aur hamesha laagu niyam; har badlav ka poora itihaas git me (D-442).                                                                                                                                                                  |
| v1.0.9 se v1.0.15 | 2026-11-23               | Implementation stage khula (D-455); naye root ke commands (ST-1, D-458); Claude `backups/` nahi kholta (D-460); repo ka naksha aur saari commands (ST-7); `01-foundation` ho gaya; do laptop ka ST-8 (D-462) branch pe. `infra:use` aur `infra:status`. `28-packages` ke saare commands, v1.0.16. |
| v1.0.17           | 2026-11-25               | Claude ke deny rules har `.env.*` pe, `.env.example` shell se (D-441 badla, QA audit).                                                                                                                                                                                                            |
