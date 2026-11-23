# LESSONS: Beautinique

> **Status:** v1.1.1 (2026-11-23). Sabak aur traps: kya hua, kyun hua, ab kya karte hain. Faisle yahan nahi, [DECISIONS.md](DECISIONS.md) me. Cheezein ek-ek karke judengi.

## Is file me kya aayega

Har sabak: **Kya hua**, **Kyun**, **Ab kya karte hain**, **Kab** (date).

## 1. Git

### Nayi branch ka upstream `prerelease` (2026-11-23)

- **Kya hua:** `01-foundation` ST-8 ka commit (`19be6c2`, lagbhag 30 files) PR ke bina seedha `prerelease` pe push ho gaya. CI green raha, par PR aur uska "kaise jaancha" nahi bana.
- **Kyun:** branch `git switch -c <branch> origin/prerelease` se bani thi. Remote branch se bani nayi branch use apna upstream maan leti hai, to saada `git push` (ya VS Code ka Sync) kaam ko seedha `origin/prerelease` pe bhej deta hai.
- **Ab kya karte hain:** nayi branch hamesha `git switch -c <branch> --no-track origin/prerelease` se (hotfix: `--no-track origin/release`), aur push `/push` se, jo upstream na ho ya kisi aur branch ke naam ka ho to usi naam ki remote branch banata hai ([GIT_SKILLS.md](GIT_SKILLS.md) §4, `.claude/skills/_shared/git-rules.md` §3).

## Change log

| Version | Date | Badlav |
| --- | --- | --- |
| v1.0.0 | 2026-11-17 | Khaali file bani. |
| v1.1.1 | 2026-11-23 | Pehla sabak: nayi branch ka upstream `prerelease` (`--no-track`). |
