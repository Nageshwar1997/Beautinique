---
date: 2026-11-07
day: 5
status: draft # draft | ready | scheduled | posted (README §2)
posted_at:
link:
covers: 'PR #30, #31, #32, #38' # T3.3 (roles, grants, invitations, gateway permissions, step-up), signed-in authenticator
---

# Day 5 — Phase 3: roles, grants, invitations, step-up

```text
Day 5 of building Beautinique in public: who can do what.
79 roles across 11 apps, and removing one takes effect right away, not at the next sign-in.

𝗔𝗯𝗼𝘂𝘁 𝘁𝗵𝗲 𝗽𝗿𝗼𝗷𝗲𝗰𝘁: Beautinique is a beauty-only e-commerce platform for India: brands sell on one storefront, all stock sits in one warehouse, in-house partners deliver, and every role has its own app. A portfolio project, built to production standards.

𝗪𝗵𝗮𝘁 𝗜 𝘀𝗵𝗶𝗽𝗽𝗲𝗱:
• Every role from the product spec is in the system. You can sign in only where you hold a grant; elsewhere you get the wrong-password answer.
• Grants can be scoped and are given through email invitations. A Master can also create custom roles.
• The gateway checks permissions on every route. Risky actions need a step-up: a fresh authenticator or recovery code.
• Users manage their own authenticator (set up, new phone, new recovery codes); it can't be turned off while a role needs it, and each change sends a security email.

𝗟𝗲𝘀𝘀𝗼𝗻 𝗼𝗳 𝘁𝗵𝗲 𝗱𝗮𝘆: a permission change must work now. Every grant change bumps a version inside the token; when the gateway sees an old version, it refreshes the session first, so a removed role stops working right away.

Carousel: roles, sign-in by grant, invitations, step-up and the lesson.

Code: https://github.com/Nageshwar1997/Beautinique
```

Post ke end me `hashtags.md` wali line paste karo.
