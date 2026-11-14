---
date: 2026-11-09
day: 7
status: scheduled # draft | ready | scheduled | posted (README §2)
posted_at: '2026-11-17 09:00 IST'
link:
covers: 'PR #39, #40' # T6.1: auth-ui package, customer sign-in/sign-up/password pages, account screens (step-up, Security, My Devices); last 2bf071f
---

# Day 7 — Phase 6 + M3: customer sign-in and account screens

```text
Day 7 of building Beautinique in public: the customer's first screens.
A sign-in right after a password change was turned away. The cause was a single second.

𝗔𝗯𝗼𝘂𝘁 𝘁𝗵𝗲 𝗽𝗿𝗼𝗷𝗲𝗰𝘁: Beautinique is a beauty-only e-commerce platform for India: brands sell on one storefront, all stock sits in one warehouse, in-house partners deliver, and every role has its own app. A portfolio project, built to production standards.

𝗪𝗵𝗮𝘁 𝗜 𝘀𝗵𝗶𝗽𝗽𝗲𝗱:
• A shared auth-ui package, so every app gets the same sign-in, sign-up, forgot-password, and invitation forms. The customer app uses them, with dummy Terms and Privacy pages.
• Account pages: Security (password, authenticator set-up with a QR code drawn in the browser, recovery codes shown once with copy and download) and My Devices.
• One step-up dialog for risky actions; the right code sends the same request again. An anonymous visit makes no session calls.
• Playwright tests in CI at 360, 768, and 1280 px, light and dark, with axe accessibility checks.

𝗟𝗲𝘀𝘀𝗼𝗻 𝗼𝗳 𝘁𝗵𝗲 𝗱𝗮𝘆: time has edges. A new password ends every session, and the gateway counts that whole second as "before the end". A token issued in the same second was already dead. Now identity never issues a token in that second.

Carousel: shared forms, Security, My Devices, tests and the lesson.

Code: https://github.com/Nageshwar1997/Beautinique

#buildinpublic #react #playwright #accessibility #webdev
```
