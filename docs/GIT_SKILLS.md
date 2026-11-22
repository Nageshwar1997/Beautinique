# GIT SKILLS: Beautinique

> **Status:** v1.1.4 (2026-11-22). Git skills (`/commit`, `/push`, `/pr`, `/sync`, `/git-status`, `/undo-commit`) ka manual, owner ke liye. Skills ka asli kaam `.claude/skills/` me; dono saath badlein.

## Is file me kya aayega

Har skill: kab chalao, kya karta hai, kya kabhi nahi karta.

## 1. Ek nazar me (D-432)

| Command                   | Kab                            | Kya karta hai                                                                     | Kabhi nahi                                   |
| ------------------------- | ------------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------- |
| `/git-status [fetch]`     | Kahin bhi, halat dekhni ho     | Branch, staged, badli aur nayi files, ahead aur behind, khula PR; agla command    | Kuch badalna                                 |
| `/commit [hint ya paths]` | Kaam ka ek hissa poora ho      | Badlav padh ke ek saaf Conventional Commit                                        | Push, `--amend`, `git add .`, AI attribution |
| `/push`                   | Commit ke baad, apni branch pe | Upstream ke saath push, bahar jaane wale commits ki jaanch                        | Force push, `release` pe push                |
| `/pr <base> [branch]`     | Branch ka kaam poora           | Base se sync, poora diff padh ke PR ka title aur description, checks              | Merge, approve, auto-merge, doosra PR        |
| `/sync [base]`            | Base aage badh gaya ho         | Branch ko naye base pe rebase; conflict pe ruk ke saath me hal                    | Reset, force push, push                      |
| `/undo-commit`            | Aakhri commit galat ho         | Pushed: revert commit; bina push: soft ya mixed reset; badlav hamesha bachte hain | `reset --hard`, push                         |

`/sync` aur `/undo-commit` sirf aapke type karne pe chalte hain, Claude khud nahi chalata. Commit aur push sirf aapke kehne pe ([CLAUDE.md](../CLAUDE.md)).

## 2. Hamesha laagu niyam

1. **Pehchaan:** sirf aapki apni git identity; git config kabhi nahi badalta. Kisi commit, PR, tag ya release note me AI attribution nahi; har commit aur PR ke baad iski jaanch.
2. **Suraksha:** force push nahi (sirf apni branch pe, aapki saaf haan pe, `--force-with-lease`); `reset --hard`, branch delete, hooks chhodna (`--no-verify`) aur bina kahe history badalna kabhi nahi. Itihaas badalne wale kadam se pehle pichhla SHA bataya jaata hai, taaki wapsi ho sake. Inme se zyadatar `.claude/settings.json` ke deny rules se tool ke level pe bhi band, aur har `git push` aur PR banane se pehle Claude Code aapse poochhta hai.
3. **Public repo:** `.env` ya `.env.*` (sirf `.env.example`), keys, tokens, passwords, DB dumps aur asli personal data kabhi stage nahi.
4. **Ruk ke poochhna:** working tree saaf na ho, koi rebase ya merge beech me ho, HEAD detached ho, ya kuch saaf na ho.

## 3. Branch ka flow

Flow root [CLAUDE.md](../CLAUDE.md) ka hai: `prerelease` se feature branch → PR → `prerelease` (development) → PR → `release` (production). `main` branch nahi hai (D-024).

| Head                                         | Base                                      | PR ka title                                          |
| -------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| Kaam ki branch (`feat/*`, `fix/*`, `docs/*`) | `prerelease`                              | `type(scope): summary`                               |
| `prerelease`                                 | `release`                                 | `release: <summary>`                                 |
| `hotfix/*` (`release` se)                    | `release`                                 | `fix(scope): summary`                                |
| `release`                                    | `prerelease` (release ke commits ke baad) | `chore(release): back-merge release into prerelease` |

- GitHub ki default branch `release` hai, isliye clone `release` pe khulta hai aur GitHub ka "Compare & pull request" base `release` sujhaata hai. Nayi branch hamesha `origin/prerelease` se, aur PR ka base hamesha saaf (`/pr prerelease`); galat base pe CI ki branch flow jaanch laal hoti hai.
- `release` pe seedha push nahi, sirf PR.
- `prerelease` pe seedha push sirf chhote fix (1 se 10 files: typo, doc ki line, galat sandesh ya config ki value, flaky test, ek-do line ka bug) aur `linkedin-posts/` ke liye; pehle `git pull --rebase` aur local checks. Naya feature, paisa, stock, permissions, schema, dependencies aur CI kabhi seedhe nahi.
- **Merge ho chuka PR:** jis branch ka PR merge ya band ho chuka, uspe dobara push nahi; nayi branch aur naye commits ka cherry-pick (pehle poochh ke).

## 4. Roz ka kaam (ek kaam)

1. `prerelease` se nayi branch: `git fetch origin`, phir `git switch -c feat/<kaam> origin/prerelease`.
2. Kaam aur local checks.
3. `/commit` (zaroorat ho to kai baar, har baar ek baat).
4. `/push`.
5. `/pr prerelease`. PR pe CI green hone ke baad merge aap karte hain.
6. Base aage badh jaaye to `/sync`.

## 5. Release

1. `/pr release prerelease`: `prerelease` → `release`. `release` me aise commits hon jo `prerelease` me nahi (release ya hotfix), to pehle back-merge.
2. `release` pe bane commits ke baad back-merge: `/pr prerelease release`.

## 6. Commit message

- `type(scope): description`. Types: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `build`, `ci`, `chore`, `revert`. Chhote aksharon me, aagya ke roop me, aakhir me full stop nahi, header 72 akshar tak.
- Scope = area: package, app, service, `ci`, ya docs ka hissa. Body sirf jab kaam aaye: kyun, kaise nahi.
- "update", "changes", "fix bugs", "wip" jaise saadharan sandesh nahi. Ek commit me ek baat ([RULES.md](RULES.md) CR-11).

## 7. Checks

- **Abhi:** naya root setup banne tak sirf `npx prettier --check <badli files>` ([CLAUDE.md](../CLAUDE.md)). PR pe CI abhi sirf `guard` (secrets ka scan, branch flow, `npm audit`), Prettier aur `check` chalata hai; baaki jobs naye setup ke saath.
- **Naye setup ke baad:** format, lint aur typecheck hamesha; tests sirf badle workspaces ke; har command ka asli nateeja bataya jaata hai.

## 8. Jab skill ruk jaaye

| Halat                               | Kya karein                                                              |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Working tree saaf nahi              | Pehle `/commit`, ya badlav khud stash karein                            |
| Rebase me conflict                  | `git rebase --abort` se wapas, ya ek-ek file saath me hal               |
| Push reject (rebase ke baad)        | Sirf apni branch pe, aapki haan se `--force-with-lease`                 |
| Hook fail                           | Hook ka output dekh ke wajah theek karein; hook kabhi chhoda nahi jaata |
| Identity set nahi                   | `git config user.name` aur `user.email` aap khud set karein             |
| Commit ya PR me AI attribution mila | Aapki haan pe sudhaar; pushed ho to pehle batana                        |

## Change log

| Version | Date       | Badlav                                                                                                                |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                     |
| v1.1.1  | 2026-11-22 | Poora manual (D-432): ek nazar me, niyam, branch ka flow, roz ka kaam, release, commit message, checks, rukne pe kya. |
| v1.1.2  | 2026-11-22 | §2: suraksha ke niyam ab `.claude/settings.json` ke deny aur ask rules se bhi laagu.                                  |
| v1.1.3  | 2026-11-22 | §7: PR pe abhi ka CI (guard, Prettier, check); fail hone wali baat hati.                                              |
| v1.1.4  | 2026-11-22 | §1, §3 se §5: `main` hata; default branch `release`, nayi branch `origin/prerelease` se (D-024).                      |
