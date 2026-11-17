# CLAUDE.md: Beautinique

> **Status:** v2.0 (2026-11-17). Naya CLAUDE.md: docs naye sire se ban rahe hain. Purana CLAUDE.md
> ab [CLAUDE-old.md](CLAUDE-old.md) hai aur purane docs [docs-old/](docs-old) me: dono sirf reference.

Ye file Claude Code har session ki shuruaat me padhta hai. Project pe ek hi insaan (owner) kaam karta hai,
2 Claude accounts se baari-baari. **Kaam shuru karne se pehle [docs/HANDOFF.md](docs/HANDOFF.md) padho.**

## Abhi kya chal raha hai

- **Discovery phase (2026-11-17 se):** Cosmetics e-commerce ecosystem sawal-jawab se tay ho raha hai.
  Plan, task files aur code tab tak nahi jab tak owner agla stage na khole.
- **Naye docs khaali shuru hue hain.** Unme cheezein ek-ek karke judti hain, owner ki haan ke baad. Index:
  [docs/README.md](docs/README.md).
- **Purana sab reference hai:** [docs-old/](docs-old) (PRD, ARCHITECTURE, TASKS, RULES, MEMORY, DESIGN aur
  discovery ki files) aur [CLAUDE-old.md](CLAUDE-old.md) (commands, repo ka naksha). Wahan naya kuch nahi
  likha jaata; jo naye docs me aa jaye, wahi sach.

## Discovery ke niyam

- Ek waqt me ek sawal; agla tabhi jab owner "next" kahe. Har sawal ke saath: kyun zaroori, vikalp, salah,
  trade-off. Owner ke kamzor faisle pe khul ke salah do, par tay hue faisle dobara mat chhedo.
- "Tay" sirf wahi jo owner ne khud kaha. Claude ki salah ko faisla mat likho.
- Owner ka jawab docs me saaf vakya me likho, chat ka chhota roop (jaise "Q1 => b") nahi.
- Sawal-jawab ki files me sirf aakhri faisla; faisle ka itihaas sirf [docs/DECISIONS.md](docs/DECISIONS.md) me.

## Hamesha laagu niyam

- **Apps sirf English me** (paise aur dates `en-IN` format me). Is ek line ke alawa app ki language ke
  baare me repo me kuch mat likho (na code, na comments, na docs, na "ye nahi hai" jaise notes), aur
  koi language feature propose mat karo. Owner ka sakht niyam hai.
- **Docs Hinglish me** (jaise ye file). Code, identifiers, comments aur app UI English me. Har doc ke top
  pe status (version + date), neeche change log; har badlav ki ek line.
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

Abhi [CLAUDE-old.md](CLAUDE-old.md) ke "Setup aur commands" aur "Repo ka naksha" me hain (code ke tathya,
waise hi sahi). Yahan ek-ek karke aayenge.

## Kaam rokte waqt

[docs/HANDOFF.md](docs/HANDOFF.md) update karo: kya kiya, kya adhoora hai, kya uncommitted hai, kaunsa sawal
khula hai. Jis doc me badlav kiya, uske change log me ek line. Progress % ka niyam naye
[docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) ke saath tay hoga; purana TASKS §P ab nahi chalta.

## Change log

| Version | Date       | Badlav                                                                                                       |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| v2.0    | 2026-11-17 | Naya CLAUDE.md: purana `CLAUDE-old.md`, purane docs `docs-old/`; hamesha laagu niyam aur discovery ke niyam. |
