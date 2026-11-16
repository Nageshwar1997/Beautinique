---
name: sync
description: Rebase the current branch onto the latest remote base branch, stopping on an unsafe working tree or on conflicts; never resets, never force-pushes, never pushes. Runs only when the user types /sync.
argument-hint: '[base-branch]'
disable-model-invocation: true
---

# /sync [base-branch]

Arguments: `$ARGUMENTS` = the base branch. Empty → take it from shared §3 for the current branch (work branch →
`prerelease`, `hotfix/*` → `release`) and say so.

First read `.claude/skills/_shared/git-rules.md`; §2 and §3 apply here.

1. **State.** `git branch --show-current` (detached → stop). An operation in progress → stop.
   `git status --porcelain`: staged or unstaged changes → stop and ask the user to `/commit` or stash them
   themselves. Untracked files may stay (Git refuses if one would be overwritten; then stop). Never `--autostash`.
2. **Long-lived branch** (`prerelease`, `release`, `main`) → never rebase it onto another branch. Base is its own
   upstream (`/sync prerelease` on `prerelease`) and the local commits are unpushed →
   `git pull --rebase origin <branch>` is allowed. Anything else (such as `release` into `prerelease`) → stop: that
   is a back-merge PR (`/pr prerelease release`).
3. **Fetch.** `git fetch origin`. `origin/<base>` must exist.
4. **Needed?** `git merge-base --is-ancestor origin/<base> HEAD` → already up to date; report and stop. Otherwise show
   `git rev-list --left-right --count origin/<base>...HEAD` (behind, ahead) and `git log --oneline HEAD..origin/<base>`
   (what comes in).
5. **Already pushed?** `origin/<branch>` exists → the rebase rewrites published commits, and the next push needs
   `--force-with-lease` with the user's explicit yes (see `/push`). Say so and ask before rebasing; offer
   `git merge --no-edit origin/<base>` (no rewrite) as the other way.
6. **Rebase.** Record `git rev-parse HEAD` (the way back), then `git rebase origin/<base>`.
   Conflicts → stop: list them (`git diff --name-only --diff-filter=U`) with what each side changed, and ask:
   `git rebase --abort` (back to the recorded SHA), or resolve together, one file at a time, with the user reviewing
   each resolution before `git add <file>` and `git rebase --continue`. Never `-X ours/theirs`, never `--skip`
   without a yes.
7. **Verify.** `git status` (no rebase in progress, clean), `git merge-base --is-ancestor origin/<base> HEAD`,
   `git log --oneline origin/<base>..HEAD` (only the branch's own commits on top), and behind/ahead against
   `origin/<branch>` if it exists.
8. **Report:** branch, base, old SHA → new SHA, commits replayed, conflicts (none, or how they were resolved), and
   whether the next push needs `--force-with-lease`. Never push.
