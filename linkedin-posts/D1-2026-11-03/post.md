---
date: 2026-11-03
day: 1
status: posted # draft | ready | scheduled | posted (README §2)
posted_at: '2026-11-03 14:59 IST'
link: https://lnkd.in/p/dZdHFY7N
covers: 'PR #1, #2, #3 (Phase 0 part), #8' # Phase 0 commits 3879a7b..c3affa8, plus 215c324 (git flow)
---

# Day 1 — Phase 0: monorepo, CI, local infra

```text
Day 1 of building Beautinique in public: a beauty-only marketplace for India, built like a production launch.
Before the first feature, I built the ground that every feature stands on.

Beautinique is an education and portfolio project: one app per role, backend services and shared npm packages, in one public monorepo.

Phase 0, what a developer can do now:
• Create a new package, frontend app or backend service with one command (npm workspaces + a custom CLI).
• Open a PR and get format, lint, typecheck, tests, npm audit and a Gitleaks secret scan. Merging requires that check to be green.
• Run npm run infra:up for MongoDB (replica set), Valkey and Mailpit in Docker. CI tests against the same setup.
• Publish packages to npm only from the release branch, so only tested code goes out.

Lesson of the day: "latest" moves under you. One day CI failed with no code change: GitHub's ubuntu-latest runner moved to a newer Linux kernel, and MongoDB 8.0 would not start on it. I pinned the runner to unblock, then fixed the root cause with one environment setting and went back to latest.

Carousel: monorepo, CI checks, local infra, branch flow and the kernel bug.

Code: https://github.com/Nageshwar1997/Beautinique

#buildinpublic #webdev #typescript #monorepo #mongodb
```
