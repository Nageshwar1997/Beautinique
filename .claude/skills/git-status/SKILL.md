---
name: git-status
description: Read-only Git status report for the current branch (upstream, staged, modified and untracked files, ahead/behind, latest and unpushed commits, sync state); changes nothing. Use when the user runs /git-status or asks for the repository's git status.
argument-hint: '[fetch]'
---

# /git-status [fetch]

Read-only: no add, commit, stash, switch, reset, pull, push or config change.

Arguments: `$ARGUMENTS`. `fetch` → run `git fetch origin` first (it only refreshes remote-tracking refs). Otherwise no
Git network call: say the remote numbers are as of the last fetch (modified time of the file at
`git rev-parse --git-path FETCH_HEAD`).

## Gather

- `git --no-optional-locks status --porcelain=v2 --branch --untracked-files=all` (no index write).
- `git log -1 --format='%h %s (%an, %ar)'`.
- With an upstream: `git log --oneline @{upstream}..HEAD` (unpushed) and `git log --oneline HEAD..@{upstream}`
  (incoming). Without one: does `origin/<branch>` exist (`git rev-parse --verify --quiet origin/<branch>`)?
- Work branch: `git rev-list --left-right --count origin/<base>...HEAD`, base from shared §3
  (`.claude/skills/_shared/git-rules.md`).
- `git stash list`; an operation in progress (`git rev-parse --git-path rebase-merge`, `rebase-apply`, `MERGE_HEAD`,
  `CHERRY_PICK_HEAD`, `REVERT_HEAD`); detached HEAD.
- If `gh` is logged in: `gh pr view --json number,url,state,baseRefName` for this branch (no PR is fine).

## Report

- Current branch; tracking branch (or "none: `git push --set-upstream origin <branch>` needed").
- Staged, modified (unstaged), untracked and conflicted files: counts and names (cap each list at about 20 and say
  how many more).
- Ahead / behind the upstream; unpushed commits; incoming commits.
- Latest commit.
- In sync with the remote: yes (0/0), ahead, behind, diverged or no upstream. For a work branch, also how far it is
  behind its base.
- Stashes, operation in progress, detached HEAD, open PR: only when present.

End with one line naming the sensible next command (`/commit`, `/push`, `/sync`, `/pr`). Take no action.
