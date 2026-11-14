---
name: push
description: Safely push the current branch to its remote, setting the upstream when missing, with no force push, no auto-commit, and protected-branch and merged-PR checks. Use when the user runs /push or explicitly asks to push; never on your own initiative.
---

# /push

First read `.claude/skills/_shared/git-rules.md`; §1 to §3 apply here.

1. **State.** `git branch --show-current`, `git status --porcelain=v1 --branch`. Detached HEAD or an operation in
   progress (shared §2) → stop.
2. **Uncommitted changes** → list them, say they will not be pushed, and ask whether to push the committed work anyway.
   Never commit them yourself (suggest `/commit`).
3. **Branch rules** (shared §3):
   - `main`, `master`, `release`, `production` or any other protected branch → do not push; PR only. Stop and explain.
   - `prerelease` → only a small fix or `linkedin-posts/` work: show the file list and count
     (`git diff --stat origin/prerelease...HEAD`), check the size and area rules, run
     `git pull --rebase origin prerelease` and the required checks, then ask the user to confirm the direct push.
     Otherwise stop and offer a `feat/<task>` branch.
   - A branch that had a PR → `gh pr view <branch> --json state,url,baseRefName`. `MERGED` or `CLOSED` → stop and
     propose a new branch plus cherry-pick (shared §3).
4. **Remote and upstream.** `git remote -v`: one remote → use it; several → the branch's upstream remote, else ask.
   `git rev-parse --abbrev-ref --symbolic-full-name @{upstream}` (none → set it on push). `git fetch <remote>`.
5. **Local vs remote.** If `<remote>/<branch>` exists: `git rev-list --left-right --count <remote>/<branch>...HEAD`
   (behind, ahead).
   - Ahead 0 → nothing to push; report and stop.
   - Behind and ahead (diverged) → a normal push is rejected. After a rebase of your own branch, the only way is
     `git push --force-with-lease=<branch>:<remote sha> <remote> <branch>`, and only with the user's explicit yes for
     this push (never on a long-lived branch). Someone else pushed → stop and suggest `/sync`; never force.
6. **What goes out.** `git log --oneline <remote>/<branch>..HEAD` (new branch: `git log --oneline origin/<base>..HEAD`,
   base from shared §3). Run the attribution check (shared §6) on every outgoing message
   (`git log --format=%B <range>`). A hit → stop and tell the user: pushing publishes it.
7. **Push.** Upstream set → `git push <remote> <branch>`. No upstream → `git push --set-upstream <remote> <branch>`.
   Never `--force`, `--no-verify`, `--mirror`, `--all` or `--tags` (unless asked). Rejected → show the error; never
   retry with force.
8. **Report:** branch → remote branch, commits pushed (count and range), whether the upstream was set, the PR link if
   one exists (else suggest `/pr`).
