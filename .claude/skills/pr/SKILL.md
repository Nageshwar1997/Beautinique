---
name: pr
description: Open a GitHub Pull Request from a branch into a base branch after syncing it with the latest base (rebase for work branches), reviewing the whole diff and running checks; no AI attribution, no duplicate PR, never merges. Use when the user runs /pr or explicitly asks to open a PR.
argument-hint: '<base-branch> [current-branch]'
---

# /pr <base-branch> [current-branch]

Arguments: `$ARGUMENTS`. First word = base branch; second = the branch to open the PR from (default: the current
branch). No base given → take it from shared §3 for the head branch and say so.

First read `.claude/skills/_shared/git-rules.md`. Do the steps in this order. Any step fails → stop, say which step
and why, with the command output.

## Step 1: Validate

1. `gh --version` and `gh auth status`. Missing or logged out → stop and say so; never pretend a PR was made.
2. Remote: `git remote -v` (the head's upstream remote, else `origin`); `gh repo view --json nameWithOwner`.
3. `git fetch origin`. The base must exist on the remote (`git ls-remote --heads origin <base>`); the head must exist
   locally or on the remote (a new branch is pushed in Step 4).
4. The current branch (`git branch --show-current`) must be the head. If not → ask: switch (only with a clean tree,
   and tell the user first: a running dev server reloads) or stop. A long-lived head (`prerelease`, `release`) is
   read from `origin/<head>`, so offer to go on without switching.
5. Working tree: `git status --porcelain`. Uncommitted changes → list them, say they are not in the PR, and ask:
   `/commit` first, or go on with committed work only (then no rebase can run). Detached HEAD or an operation in
   progress → stop.
6. Branch pair (shared §3). Not allowed → stop and name the allowed base.
7. Duplicates: `gh pr list --head <head> --state all --json number,url,state,baseRefName,title`. An `OPEN` PR →
   report it and do not create another; ask before changing its title or description (`gh pr edit`). A `MERGED` PR
   and new commits on the head → merged PR trap (shared §3).

## Step 2: Sync with the latest base

Record `git rev-parse HEAD` (the way back).

**Work branch** (`feat/*`, `fix/*`, `hotfix/*` ...):

1. Local base: `git rev-list --left-right --count <base>...origin/<base>`. Behind only → fast-forward it with
   `git fetch origin <base>:<base>` (refuses anything but a fast-forward); diverged → report, leave it.
2. `git merge-base --is-ancestor origin/<base> HEAD` → already up to date; go to Step 3.
3. Already pushed (`origin/<head>` exists)? Then a rebase rewrites published commits and the push needs
   `--force-with-lease`. Ask before rebasing: (a) rebase, then force-with-lease push with the user's yes
   (recommended when only one person works on the branch); (b) `git merge --no-edit origin/<base>` (no rewrite,
   normal push); (c) no sync (GitHub's "up to date" rule will ask later).
4. Rebase: `git rebase origin/<base>`. Conflicts → stop: show `git diff --name-only --diff-filter=U` and what each
   side changed, then ask: `git rebase --abort` (back to the recorded SHA), or resolve together, one file at a time,
   with the user reviewing each resolution before `git add <file>` and `git rebase --continue`. Never
   `-X ours/theirs`, never `--skip` without a yes.
5. Verify: no rebase in progress, clean tree, `git merge-base --is-ancestor origin/<base> HEAD`,
   `git log --oneline origin/<base>..HEAD` shows only the branch's own commits.

**Long-lived head:** never rebase or merge it here.

- `prerelease` → `release`: `git rev-list --count origin/prerelease..origin/release` above 0 means `release` has
  commits `prerelease` lacks (release commit, hotfix) → a back-merge comes first (`/pr prerelease release`); ask.
- `release` → `main`: `git rev-list --count origin/release..origin/main` must be 0; otherwise stop and report.
- `release` → `prerelease`: the PR itself is the sync.
- Unpushed local commits on the head: `release` or `main` → stop (no direct push); `prerelease` → the small-fix rule
  (shared §3) or stop.

## Step 3: Analyse the changes

1. Range: `origin/<base>...HEAD` (long-lived head: `origin/<base>...origin/<head>`).
2. `git log --oneline <range>` and `git diff --stat <range>`; then read the full diff (`git diff <range>`, file by
   file when large; lockfiles and generated files by stat only). The PR is every commit, not the last one.
3. Note features, fixes, refactors; API and contract changes (`defineRoute` contracts, package exports and versions);
   config and env keys (`.env.example`); DB migrations and indexes; CI or workflow changes; breaking changes; missing
   docs; task ids (`T<n>`, `QA-...`, `LIVE-...`).
4. Checks for what changed (shared §5). Keep each command and its real result. A failure → show it and ask: fix
   first, or open the PR with the failure written under Testing.

## Step 4: Push

- Work branch: the merged PR trap (shared §3), the attribution check (shared §6) on every outgoing commit, then
  `git push --set-upstream origin <head>` (new) or `git push origin <head>`. Rejected after a rebase → only
  `git push --force-with-lease=<head>:<old remote sha> origin <head>` with the user's explicit yes for this push;
  otherwise stop.
- Long-lived head: nothing to push.

## Step 5: Create the PR

1. **Title** (shared §3 table): the PR's main purpose, at most 72 characters.
2. **Body**, in English, only what the diff shows:

   ```markdown
   ## Summary

   What this PR does and why, in 1–3 sentences.

   ## Changes

   - The important changes, grouped by area.

   ## Technical Details

   Decisions, architecture, contracts/API, DB or migrations, config and env keys. "None" if nothing.

   ## Testing

   - `<command>`: passed / failed (exact commands that ran). Not run: ... (and why). Manual checks only if done.

   ## Breaking Changes

   None.

   ## Related Issues

   Task ids, related PRs, `Closes #<n>` only for real issues. "None" if nothing.
   ```

   No attribution, no AI footer, no "Generated with" line (shared §1).

3. **Create** (not a draft unless asked):

   ```bash
   gh pr create --base <base> --head <head> --title "<title>" --body-file - <<'EOF'
   <body>
   EOF
   ```

4. **Verify:** `gh pr view <head> --json url,number,title,baseRefName,headRefName,body`: base and head are right and
   the attribution check (shared §6) on title and body is clean. Never merge, approve or turn on auto-merge.

## Step 6: Report

PR URL; title; source → target branch; sync method (rebased onto `origin/<base>` / merged `origin/<base>` / already
up to date / not synced, and why); checks run with results, and what did not run; remaining concerns (CI pending,
base moved, docs missing, back-merge needed).
