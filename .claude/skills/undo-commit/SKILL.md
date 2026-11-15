---
name: undo-commit
description: Safely undo the most recent commit while keeping every file change; a revert commit if it was pushed, a soft or mixed reset if not, always after the user's confirmation; never reset --hard, never pushes. Runs only when the user types /undo-commit.
disable-model-invocation: true
---

# /undo-commit

First read `.claude/skills/_shared/git-rules.md`; §1 and §2 apply here. Never `git reset --hard`; never push.

1. **Inspect.** `git branch --show-current` (detached → stop); an operation in progress → stop.
   `git log -1 --stat --format='%H%n%an <%ae>%n%ad%n%n%B'`. Merge commit (`git rev-list --parents -n 1 HEAD` shows
   three or more SHAs) → say so; a revert then needs `-m 1`, ask. Root commit (no parent) → stop and explain.
2. **Pushed?** `git fetch origin`, then `git branch -r --contains HEAD`. Any remote branch listed → pushed.
3. **Working tree.** `git status --porcelain`. Every option below keeps the user's uncommitted changes. For a revert,
   staged changes would go into the revert commit → stop and ask the user to commit or unstage them first.
4. **Propose, then wait for an explicit yes** (show the commit and the exact commands):
   - **Pushed → revert** (a new commit; history untouched). `git revert --no-commit HEAD`, then:

     ```bash
     git commit -F - <<'EOF'
     revert: <original subject>

     This reverts commit <full sha>.
     EOF
     ```

     On `main` or `release` the revert still reaches the remote only through a branch and a PR; say so. Conflicts →
     stop and offer `git revert --abort`. Rewriting a pushed commit (reset plus force push) only if the user asks for
     it in so many words, and never on a long-lived branch.

   - **Not pushed → reset, keeping the changes.** `git reset --soft HEAD~1` (commit gone, its changes stay staged;
     recommended) or `git reset --mixed HEAD~1` (changes stay, unstaged). Give the recorded SHA as the way back:
     `git reset --soft <sha>` (also in `git reflog`).

   No yes, or no choice made → do nothing.

5. **Run** the chosen option.
6. **Verify.** `git log -3 --oneline` and `git status --short`: after a reset the undone commit's changes are still
   there (staged for soft, unstaged for mixed); after a revert there is one new revert commit, and the attribution
   check (shared §6) on its message is clean.
7. **Report:** what was undone (SHA and subject), the method, where the changes are now, the way back, and that
   nothing was pushed (a revert of a pushed commit still needs `/push` or a PR).
