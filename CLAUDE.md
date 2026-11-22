# CLAUDE.md: Beautinique

> **Status:** v1.0.2 (2026-11-22). Docs aur code naye sire se ban rahe hain.

Ye file Claude Code har session ki shuruaat me padhta hai. Project pe ek hi insaan (owner) kaam karta hai,
2 Claude accounts se baari-baari. **Kaam shuru karne se pehle [docs/HANDOFF.md](docs/HANDOFF.md) padho.**

## Abhi kya chal raha hai

- **Discovery phase (2026-11-17 se):** Cosmetics e-commerce ecosystem sawal-jawab se tay ho raha hai.
  Plan, task files aur code tab tak nahi jab tak owner agla stage na khole.
- **Naye docs khaali shuru hue hain.** Unme cheezein ek-ek karke judti hain, owner ki haan ke baad. Index:
  [docs/README.md](docs/README.md).
- **Sach sirf naye docs (`docs/`) aur ye file.** Code bhi naye sire se banega (owner, 2026-11-17): naya root
  setup aur naya code implementation stage me, folder structure `packages/`, `frontend/`, `backend/` ...
- **Naye docs aur naye code me purane code ya purane docs ka koi zikr ya link nahi** (owner, 2026-11-17): wo
  aage hat jayenge.

## Discovery ke niyam

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
  pe status (version + date), neeche change log; har badlav ki ek line.
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
  `.env.example`. Claude `.env`/`.env.*` files aur repo ke bahar ka `All-ENVs` folder kabhi nahi kholta.
- **Git flow (owner, 2026-10-25):** `prerelease` se feature branch → PR → **`prerelease`** (development)
  → PR → **`release`** (production) → release safal hone ke baad PR `release` → **`main`** (sirf final code).
  `main` pe kabhi seedha kaam ya feature PR nahi; `main` aur `release` pe seedha push nahi. `prerelease` pe
  sirf chhota fix (1–10 files, local checks ke baad, force push nahi) aur `linkedin-posts/` ki files aur
  `/linkedin-post` skill seedha push ho sakti hain. Release pe bane commits (package release, hotfix) ke baad
  `release` → `prerelease` back-merge bhi. CI ye flow check karta hai. `main` hatana tay ho chuka hai, par
  jab tak owner na kahe ye flow hi laagu hai.
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

Abhi koi npm command nahi chalta: naya root setup implementation stage me banega. Docs ke liye sirf
`npx prettier --check <files>`. Commands aur repo ka naksha naye code ke saath yahan ek-ek karke aayenge.

## Kaam rokte waqt

[docs/HANDOFF.md](docs/HANDOFF.md) update karo: kya kiya, kya adhoora hai, kya uncommitted hai, kaunsa sawal
khula hai. Jis doc me badlav kiya, uske change log me ek line. Progress % ka niyam
[docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) §2 me (D-433).

## Change log

| Version | Date       | Badlav                                                                           |
| ------- | ---------- | -------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Pehla version: abhi ki halat, discovery ke niyam aur hamesha laagu niyam.        |
| v1.0.1  | 2026-11-18 | Discovery: bina dependency wale sawal ek saath; agle sawal ka zikr nahi (owner). |
| v1.0.2  | 2026-11-22 | Progress % ka niyam ab PROJECT_PLAN §2 me (D-433).                               |
