# GIT_SKILLS — BQ

> **Status:** v1.0 (2026-11-14). Git aur GitHub ke kaam Claude Code ke 6 slash commands se: `/commit`, `/push`, `/pr`, `/sync`, `/git-status`, `/undo-commit`. Ye file insaan ke liye manual hai: kab kaunsa command, wo kya karta hai, kab rukta hai. Claude ke liye niyam skills me hain (`.claude/skills/<naam>/SKILL.md`) aur sabke saajhe niyam `.claude/skills/_shared/git-rules.md` me. Branch flow ka sach [RULES.md](RULES.md) §2 hai.

## 1. Ek nazar me

| Command                  | Kab                                      | Badalta kya hai                     |
| ------------------------ | ---------------------------------------- | ----------------------------------- |
| `/git-status [fetch]`    | Kuch bhi karne se pehle halat dekhni ho  | Kuch nahi (sirf padhta hai)         |
| `/commit [hint/paths]`   | Kaam ka ek hissa poora hua               | Ek commit (push nahi)               |
| `/push`                  | Commits GitHub pe bhejne hain            | Remote branch                       |
| `/sync [base]`           | Branch ko naye `prerelease` pe laana hai | Apni branch ki history (rebase)     |
| `/pr <base> [branch]`    | Kaam review/merge ke liye taiyaar        | Sync + push + naya PR (merge nahi)  |
| `/undo-commit`           | Aakhri commit galat tha                  | Aakhri commit hatata/revert karta   |

Sabme pakka:

- **Koi AI attribution nahi:** commit, PR, tag me na `Co-Authored-By: Claude`, na "Generated with Claude Code", na 🤖. Sirf aapki apni git identity (`git config user.name/email`); git config kabhi nahi badalta. `.claude/settings.json` me Claude Code ki attribution band hai; use mat hatao.
- **Kabhi nahi:** force push (sirf aapki saaf haan pe `--force-with-lease`, wo bhi long-lived branch pe kabhi nahi), `reset --hard`, hooks skip (`--no-verify`), uncommitted kaam phenkna, PR merge, branch delete, `main`/`release` pe seedha push.
- **Rukta hai aur poochhta hai** jab: tree saaf nahi, conflict aaya, branch pehle se push hai aur rebase history badlega, PR pehle se khula/merged hai, ya baat saaf nahi.
- `/sync` aur `/undo-commit` sirf aapke type karne pe chalte hain. Baaki chaar shabdon me kehne pe bhi chalte hain ("commit karo", "PR bana do").

## 2. Shuru karne se pehle (ek baar)

1. `gh` (GitHub CLI) install aur login: `gh auth status` me "Logged in" dikhe. `/pr` aur PR wali jaanch ke liye zaroori.
2. Git identity set: `git config user.name` aur `git config user.email` me aapka naam/email.
3. Claude Code isi repo me khulo; message box me `/` likho to ye commands list me dikhte hain. Naam lowercase hain: `/pr` (na ki `/PR`).

## 3. Roz ka flow (ek task)

```text
prerelease se branch  →  kaam  →  /commit  →  /push  →  /pr prerelease feat/<task>  →  CI green  →  GitHub pe merge (aap)
```

1. **Branch:** `git switch prerelease`, `git pull`, `git switch -c feat/<task>` (jaise `feat/t4.1-catalog`; fix ho to `fix/<kaam>`). Skills khud branch nahi banate; `/commit` galat branch pe ho to bas sujhaata hai.
2. **Kaam karo**, beech me `/git-status` se halat dekho.
3. **`/commit`:** badlav padh ke ek kaam ka set chunta hai, Conventional Commit message banata hai, phir commit. Alag-alag kaam mile to poochhta hai kaunsa pehle.
4. **`/push`:** pehli baar upstream khud set (`--set-upstream`).
5. **`/pr prerelease feat/<task>`:** naye `prerelease` pe rebase, poora diff padhna, checks, push, PR. Link milta hai.
6. **CI `check` green** hone pe aap GitHub pe merge karte ho. Skill kabhi merge nahi karta.
7. Task khatam → HANDOFF/TASKS update (CLAUDE.md "Kaam rokte waqt").

## 4. Release flow (RULES §2)

| Kaam                                     | Command                    | Note                                                       |
| ---------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| Development → production                 | `/pr release prerelease`   | `release` me aisa commit ho jo `prerelease` me nahi, to pehle back-merge |
| Release live aur theek → final code      | `/pr main release`         | Sirf release safal hone ke baad                            |
| Release ke commits wapas development me  | `/pr prerelease release`   | Back-merge (package release commit, hotfix ke baad)        |
| Production me turant fix                 | `release` se `hotfix/<naam>`, phir `/pr release hotfix/<naam>` | Baad me back-merge bhi                 |

Long-lived branches (`prerelease`, `release`, `main`) pe kabhi rebase ya force push nahi hota; in PRs me skill sirf jaanchta hai ki kaunsi branch aage hai. PR titles repo ki aadat se: `release: ...`, `main: ... (#PRs)`, `chore(release): back-merge release into prerelease`.

## 5. Har command detail me

### `/git-status [fetch]`

- Branch, tracking branch, staged/modified/untracked files, ahead/behind, aakhri commit, unpushed commits, stash, chalu rebase/merge, khula PR.
- Bina `fetch` ke network nahi: remote ke numbers aakhri fetch ke hisaab se (waqt bhi batata hai). `/git-status fetch` pehle `git fetch origin` karta hai.
- Aakhir me agla sahi command sujhaata hai. Kuch nahi badalta.

### `/commit [hint ya paths]`

- Misaal: `/commit`, `/commit OTP rate limit`, `/commit backend/identity/src/otp.ts`.
- Staged files hon to wahi set; na hon to badlav ko kaam ke hisaab se group karta hai. `git add -A`/`git add .` kabhi nahi, sirf naam se.
- `.env`, secrets, dumps kabhi stage nahi. `git diff --cached --check` aur Prettier check chalata hai.
- Message: `type(scope): description` (types: feat, fix, refactor, perf, style, docs, test, build, ci, chore, revert), 72 characters tak, "update"/"changes" jaise khaali shabd nahi.
- `main`/`release` pe ho to rukta hai; `prerelease` pe chhota fix na ho to `feat/` branch sujhaata hai aur poochhta hai.
- Commit ke baad author aur attribution jaanchta hai. **Push nahi karta.**

### `/push`

- Uncommitted badlav ho to batata hai aur poochhta hai (khud commit nahi karta).
- `main`, `release` pe push nahi. `prerelease` pe sirf RULES §2 ka chhota fix: files gin ke, `git pull --rebase` aur checks ke baad, aapki haan pe.
- Branch ka PR pehle hi merge/close ho chuka ho to rukta hai: nayi branch + cherry-pick sujhaata hai.
- Bahar jaane wale har commit message me attribution jaanchta hai.
- Branch diverge (rebase ke baad) ho to sirf aapki saaf haan pe `--force-with-lease`; kisi aur ne push kiya ho to kabhi force nahi.

### `/pr <base> [branch]`

- Argument order: **pehle base (jahan merge hoga), phir apni branch.** Branch na do to abhi wali; base na do to flow se (`feat/*` → `prerelease`).
- Step: branches aur `gh` jaanch → duplicate PR jaanch → base se sync → poora diff aur commits padhna → checks → push → PR → aakhri report.
- **Sync:** `feat/*`/`fix/*` branch `origin/<base>` pe rebase. Branch pehle se push ho to rebase se pehle poochhta hai: (a) rebase + force-with-lease, (b) `merge origin/<base>` (history nahi badalti), (c) sync nahi.
- **Checks:** `format:check`, `lint`, `typecheck` hamesha (`packages/` badla to pehle `build`); badle workspaces ke tests; Docker sirf zaroorat ke containers. Fail ho to poochhta hai: pehle theek karein ya PR me fail likh ke kholein.
- **PR body:** Summary, Changes, Technical Details, Testing (sirf jo sach me chala), Breaking Changes, Related Issues.
- Khula PR pehle se ho to naya nahi banata; description badalne se pehle poochhta hai. Merge, approve, auto-merge kabhi nahi.

### `/sync [base]`

- Misaal: `/sync` (flow se base), `/sync prerelease`.
- Tree me staged/unstaged badlav ho to rukta hai (pehle `/commit` ya khud stash). Autostash nahi.
- Rebase se pehle purana SHA likhta hai (wapas jaane ka raasta). Branch pehle se push ho to poochhta hai (merge bhi option).
- Long-lived branch pe doosri branch ka rebase nahi: `release` → `prerelease` back-merge PR se hota hai (`/pr prerelease release`).
- Push nahi karta; batata hai ki agla push force-with-lease maangega ya nahi.

### `/undo-commit`

- Aakhri commit dikha ke poochhta hai; aapki haan ke bina kuch nahi.
- **Push nahi hua:** `git reset --soft HEAD~1` (badlav staged rehte hain, recommended) ya `--mixed` (unstaged). Purana SHA deta hai.
- **Push ho chuka:** `git revert` (naya `revert: ...` commit, history nahi badalti). `main`/`release` pe wo bhi branch + PR se.
- `reset --hard` kabhi nahi; aapka koi badlav nahi jaata. Push nahi karta.

## 6. Jab skill ruk jaye

| Halat                          | Kya karein                                                                 |
| ------------------------------ | -------------------------------------------------------------------------- |
| Rebase me conflict             | Skill files aur dono taraf ka badlav dikhata hai. `git rebase --abort` (wapas pehle jaisa) chuno, ya saath me file-by-file theek karo (har file aap dekhte ho). |
| Branch pehle se push, rebase chahiye | Haan bolo to rebase + `--force-with-lease`; ya merge chuno.          |
| PR pehle hi merge ho chuka     | Nayi branch `origin/prerelease` se + naye commits ka cherry-pick (skill sujhaata hai). |
| Hook fail                      | Output dikhata hai, hook skip nahi karta. Galti theek karke phir chalao.   |
| `gh` login nahi                | `gh auth login`, phir dobara.                                              |
| Commit/PR me attribution dikhe | Skill batata hai; aapki haan pe hi theek karta hai. `.claude/settings.json` dekho. |

## 7. Sawal-jawab

- **`/PR` kyun nahi chala?** Skill ke naam lowercase hote hain: `/pr`.
- **Purane commits me `Co-Authored-By: Claude` hai?** Haan, 2026-11-14 se pehle wale. Published history rewrite nahi karte; naye commits me nahi aayega.
- **Doosra developer bhi yahi use kare?** Haan, skills aur `.claude/settings.json` repo me hain; `git pull` ke baad dono ke Claude Code pe chalte hain.
- **Flow badla to?** Pehle RULES §2, phir `.claude/skills/_shared/git-rules.md` (§3) aur ye file.

## Change log

| Version | Date       | Badlav                                                                                   |
| ------- | ---------- | ---------------------------------------------------------------------------------------- |
| v1.0    | 2026-11-14 | Pehla version: 6 git skills ka manual, roz ka aur release flow, rukne pe kya karein (owner). |
