# Docs: Beautinique

> **Status:** v1.0.8 (2026-11-25). Docs ka index. Files khaali shuru hui hain; cheezein ek-ek karke, owner ki haan ke baad judti hain.

## Niyam

- Har file ka ek hi kaam. Har baat sirf ek jagah; baaki jagah uski link.
- "Bana hai" sirf code ya test ki link ke saath.
- Sirf naye docs aur naye code ki baat: kisi purane doc ya purane code ka zikr ya link nahi.
- Har file ke top pe status (version + date), neeche chhota change log: ek din ki ek hi line, version range ke saath; purana itihaas git me (D-442).

## Files

| File                                                                   | Kya hai                                                                     |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [PROJECT_PLAN.md](PROJECT_PLAN.md)                                     | Kendra: modules ki list, unki dependencies, releases, progress %            |
| [PRODUCT.md](PRODUCT.md)                                               | Kya bana rahe aur kyun: business model, users aur roles, apps, scope        |
| [ARCHITECTURE.md](ARCHITECTURE.md)                                     | Kaise: services, data ka maalik, events, auth, deployment                   |
| [FLOWS.md](FLOWS.md)                                                   | Poore flows jo kai modules me chalte hain                                   |
| [DECISIONS.md](DECISIONS.md)                                           | Har faisla (D-xxx), tag ke saath                                            |
| [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md)                                 | Khule sawal (Q-xxx), aage ke topics (B1 ...) aur jaanchna baaki             |
| [RISKS.md](RISKS.md)                                                   | Risks (R-xxx), security wale bhi                                            |
| [GLOSSARY.md](GLOSSARY.md)                                             | Shabdon ka ek matlab                                                        |
| [COMPLIANCE.md](COMPLIANCE.md)                                         | Kanooni matrix (sab dummy)                                                  |
| [ACCEPTANCE.md](ACCEPTANCE.md)                                         | Har service aur app ke acceptance criteria (AC-xxx)                         |
| [DESIGN.md](DESIGN.md)                                                 | UI design system                                                            |
| [OPERATIONS.md](OPERATIONS.md)                                         | Chalane ka manual                                                           |
| [RULES.md](RULES.md)                                                   | Kaam ke niyam                                                               |
| [HANDOFF.md](HANDOFF.md)                                               | Abhi ki halat aur agla kaam                                                 |
| [OWNER_TASKS.md](OWNER_TASKS.md)                                       | Owner ke bahar ke kaam (account, env key, download)                         |
| [LESSONS.md](LESSONS.md)                                               | Sabak aur traps                                                             |
| [GIT_SKILLS.md](GIT_SKILLS.md)                                         | Git skills ka manual                                                        |
| [QA_AUDIT_REPORT.md](QA_AUDIT_REPORT.md)                               | QA audit: bane hisson ke test, bugs, unke fix aur fix ka kram               |
| [security/THREAT_MODEL.md](security/THREAT_MODEL.md)                   | Har module ka threat model                                                  |
| [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) | Security ke niyam, module-wise                                              |
| [tasks/](tasks/README.md)                                              | Har module ka folder: `TASK.md` aur subtasks                                |
| [manuals/](manuals/README.md)                                          | Har role ka manual, aur [roz ke laptop ka manual](manuals/DAILY_LAPTOPS.md) |
| [testing/](testing/COMMON.md)                                          | Owner ki haath ki testing: har app ki file aur saajhe niyam                 |

## Padhne ka order

1. [HANDOFF.md](HANDOFF.md)
2. [OWNER_TASKS.md](OWNER_TASKS.md) (owner ke khule kaam)
3. [RULES.md](RULES.md)
4. [PROJECT_PLAN.md](PROJECT_PLAN.md)
5. Baaki files zaroorat ke hisaab se.

## Change log

| Version          | Date                     | Badlav                                                                                                                                                                                                                               |
| ---------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.0.0 se v1.0.4 | 2026-11-17 se 2026-11-22 | Docs ka index; nayi files judti gayi; har badlav ka poora itihaas git me (D-442).                                                                                                                                                    |
| v1.0.5           | 2026-11-24               | Temp doc juda: do laptop ke setup ke kadam.                                                                                                                                                                                          |
| v1.0.6 se v1.0.8 | 2026-11-25               | [QA_AUDIT_REPORT.md](QA_AUDIT_REPORT.md) juda: QA audit ki report. [manuals/DAILY_LAPTOPS.md](manuals/DAILY_LAPTOPS.md) juda: roz ke laptop ka manual. Temp doc hata (setup poora, install ke sabak [LESSONS.md](LESSONS.md) §2 me). |
