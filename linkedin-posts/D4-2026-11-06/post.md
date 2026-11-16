---
date: 2026-11-06
day: 4
status: posted # draft | ready | scheduled | posted (README §2)
posted_at: '2026-11-14 13:21 IST'
link: 'https://lnkd.in/p/dDseKzcQ'
covers: 'PR #21, #22, #25, #26, #27' # T3.1 (email codes, password, authenticator), T3.2 (sessions, gateway passport, My Devices)
---

# Day 4 — Phase 3: sign-in, sessions, My Devices

```text
Day 4 of building Beautinique in public: sign-in.
A wrong email, a wrong password and a locked account all get the same answer, at the same time. On purpose.

𝗔𝗯𝗼𝘂𝘁 𝘁𝗵𝗲 𝗽𝗿𝗼𝗷𝗲𝗰𝘁: Beautinique is a beauty-only e-commerce platform for India: brands sell on one storefront, all stock sits in one warehouse, in-house partners deliver, and every role has its own app. A portfolio project, built to production standards.

𝗪𝗵𝗮𝘁 𝗜 𝘀𝗵𝗶𝗽𝗽𝗲𝗱:
• Sign up with an email code, then use one password in every app: 12–128 characters, checked against known breaches, hashed with argon2id.
• An authenticator app with 10 recovery codes: required on the 7 internal apps, optional elsewhere.
• Short-lived ES256 tokens in per-app cookies, never in the page. Refresh tokens rotate, and a reused one ends the session.
• My Devices shows sessions across all apps; end one or all the others. A new password signs out every device.

𝗟𝗲𝘀𝘀𝗼𝗻 𝗼𝗳 𝘁𝗵𝗲 𝗱𝗮𝘆: every "no" must look the same. If a wrong email answered faster than a wrong password, the sign-in form would tell anyone who has an account. So both take the same time, and 10 wrong tries in 15 minutes lock the account for an hour with that same answer.

Carousel: codes, passwords, the authenticator, sessions and My Devices.

Code: https://github.com/Nageshwar1997/Beautinique

#buildinpublic #security #authentication #nodejs #webdev
```
