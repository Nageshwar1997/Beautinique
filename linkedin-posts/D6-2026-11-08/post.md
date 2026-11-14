---
date: 2026-11-08
day: 6
status: scheduled # draft | ready | scheduled | posted (README §2)
posted_at: '2026-11-16 09:00 IST'
link:
covers: 'PR #33, #34, #35, #36, #37' # T6.1: frontend-hooks, components (base, pickers), api-client (axios only), forms
---

# Day 6 — Phase 6: frontend toolkit (hooks, components, pickers, API client)

```text
Day 6 of building Beautinique in public: the frontend toolkit.
Two tabs refreshing a session at once can look just like a stolen token.

𝗔𝗯𝗼𝘂𝘁 𝘁𝗵𝗲 𝗽𝗿𝗼𝗷𝗲𝗰𝘁: Beautinique is a beauty-only e-commerce platform for India: brands sell on one storefront, all stock sits in one warehouse, in-house partners deliver, and every role has its own app. A portfolio project, built to production standards.

𝗪𝗵𝗮𝘁 𝗜 𝘀𝗵𝗶𝗽𝗽𝗲𝗱:
• Shared React hooks (debounce, media query, countdown, copy, online status) with 498 tests. The online check calls only its own site.
• Accessible components on React Aria: buttons with a 44 px touch area, code inputs with one-time-code autofill, dialogs that become bottom sheets on phones, and toasts.
• Pickers: select, a searchable combo box, date pickers in dd/mm/yyyy with India time, and a colour picker.
• One API client for every app: HttpOnly cookies only, one refresh at a time, and a step-up dialog that resends the same request. axios is the repo's only HTTP client.

𝗟𝗲𝘀𝘀𝗼𝗻 𝗼𝗳 𝘁𝗵𝗲 𝗱𝗮𝘆: the backend treats a reused refresh token as theft, but two tabs can refresh at once. When the server says another tab is refreshing, the client waits 300 ms and retries, instead of refreshing with the old token.

Carousel: hooks, components, pickers, the API client and the lesson.

Code: https://github.com/Nageshwar1997/Beautinique

#buildinpublic #react #frontend #accessibility #typescript
```
