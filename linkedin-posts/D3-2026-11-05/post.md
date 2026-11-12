---
date: 2026-11-05
day: 3
status: posted # draft | ready | scheduled | posted (README §2)
posted_at: '2026-11-10 04:23 IST'
link: https://lnkd.in/p/eyKV-FmS
covers: 'PR #11, #12, #15' # M2: gateway, customer landing, deploy code (wake, Vercel, Sentry); live fixes afb3502
---

# Day 3 — Phase 2: gateway and first live deploy

```text
Day 3 of building Beautinique in public: the gateway and first live deploy.
Live, the wake-up screen waited 150 seconds for a server that would never wake.

𝗔𝗯𝗼𝘂𝘁 𝘁𝗵𝗲 𝗽𝗿𝗼𝗷𝗲𝗰𝘁: Beautinique is a beauty-only e-commerce platform for India: brands sell on one storefront, all stock sits in one warehouse, in-house partners deliver, and every role has its own app. A portfolio project, built to production standards.

𝗪𝗵𝗮𝘁 𝗜 𝘀𝗵𝗶𝗽𝗽𝗲𝗱:
• One gateway in front of every service: routes from the shared contracts, requests only from known apps, and rate limits and request IDs in one place.
• The backend runs as one bundle on Render's free tier with MongoDB Atlas; the customer landing page is on Vercel.
• Free servers sleep, so a slow server gets a wake-up screen instead of a broken page, and an hourly job wakes it from 10:00 to 21:00 IST.
• Sentry reports server errors with a request ID, but no headers, cookies or bodies leave the server.

𝗟𝗲𝘀𝘀𝗼𝗻 𝗼𝗳 𝘁𝗵𝗲 𝗱𝗮𝘆: Test the real deploy early. Locally it all worked. Live, a sleeping Render service answered requests through Vercel with an instant 502; only a direct call woke it (about 52 seconds). A small /wake endpoint, called directly by the app, fixed it.

Carousel: gateway, deploy, wake-up screen, Sentry and the lesson.

Code: https://github.com/Nageshwar1997/Beautinique
```

Post ke end me `hashtags.md` wali line paste karo.
