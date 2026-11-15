---
name: commit
description: Create one clean Conventional Commit from the current changes, with only the user's own Git identity and no AI attribution, and never push. Use when the user runs /commit or explicitly asks to commit; never on your own initiative.
argument-hint: '[hint about the change, or paths to commit]'
---

# /commit

Arguments: `$ARGUMENTS` (optional: a hint for the message, or the paths to commit).

First read `.claude/skills/_shared/git-rules.md`; §1, §2 and §4 apply here.

1. **State.** `git branch --show-current`, `git status --porcelain=v1 --branch`. Detached HEAD or an operation in
   progress (shared §2) → stop.
2. **Branch.** `main` or `release` → commits there cannot be pushed (PR only): stop and offer a `feat/<task>` branch
   (`hotfix/<name>` from `release`); `git switch -c <name>` keeps the changes. `prerelease` → fine only for a small
   fix or `linkedin-posts/` work (shared §3); otherwise offer a `feat/<task>` branch. Ask; never switch silently.
3. **Nothing changed** (no staged, unstaged or untracked files) → say no commit is needed and stop.
4. **Understand the changes.** `git diff --cached --stat`, `git diff --stat`, the untracked list; then read the real
   diffs (`git diff --cached`, `git diff -- <file>`, untracked files themselves). Work out what each change is for,
   not just which files moved.
5. **Choose the commit set.**
   - Something is staged → that is the set (the user chose it). If it mixes unrelated concerns, say so and ask.
   - Nothing staged → group the changed files by purpose. One clear group, or the paths/hint in the arguments →
     stage those paths by name (`git add -- <paths>`). Several unrelated groups → list them and ask which to commit
     (offer one commit per group, in order).
   - Never stage `.env`/`.env.*` (only `.env.example`), secrets, dumps, build output or files outside the set.
6. **Preflight.** Attribution preflight (shared §1); `git config user.name` and `git config user.email` are set.
7. **Review the staged diff.** `git diff --cached --stat`, `git diff --cached`, `git diff --cached --check` (whitespace,
   conflict markers). Look for debug leftovers and secrets. `npx prettier --check <staged files>` for files Prettier
   formats; report failures and fix only on the user's yes.
8. **Message** (shared §4), written from the staged diff only. Purpose unclear → ask, with a proposed message.
9. **Commit** through stdin, nothing added after the message:

   ```bash
   git commit -F - <<'EOF'
   type(scope): description

   Optional body: why.
   EOF
   ```

   A hook fails → show the output and stop. Never `--no-verify`, never `--amend`.

10. **Verify.** `git log -1 --format='%H%n%an <%ae>%n%n%B'`: the author is the configured identity and the attribution
    check (shared §6) is clean. `git status --short` for what is left.
11. **Report:** branch, short SHA, message, files committed, changed files left out. Do not push; suggest `/push`.
