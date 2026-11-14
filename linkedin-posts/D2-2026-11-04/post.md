---
date: 2026-11-04
day: 2
status: posted # draft | ready | scheduled | posted (README §2)
posted_at: 2026-11-05
link: https://lnkd.in/p/e2WGHtvV
covers: 'PR #3 (Phase 1 part), #4, #7' # Phase 1 commits e533ace..ad98303 (mongo, queue, crypto, contracts, authz, core sample)
---

# Day 2 — Phase 1: server kit, outbox, encryption, mutation testing

```text
Day 2 of building Beautinique in public: the server kit under every backend service.
All my tests were green. Mutation testing still found a bug in the money code.

𝗔𝗯𝗼𝘂𝘁 𝘁𝗵𝗲 𝗽𝗿𝗼𝗷𝗲𝗰𝘁: Beautinique is a beauty-only e-commerce platform for India: brands sell on one storefront, all stock sits in one warehouse, in-house partners deliver, and every role has its own app. A portfolio project, built to production standards.

𝗪𝗵𝗮𝘁 𝗜 𝘀𝗵𝗶𝗽𝗽𝗲𝗱:
• Every route starts as a contract: input and output are checked, so a wrong body gets VALIDATION_FAILED and extra fields never leave the server.
• A data change and its event are saved in one MongoDB transaction (outbox). A relay moves events to BullMQ, and the inbox skips duplicates.
• Sensitive fields are encrypted with AES-256-GCM, with key rotation and a blind index for lookups.
• If Redis is wiped, a watchdog restores the schedules and re-sends events from the outbox. Each event is still applied once; a drill test checks it.

𝗟𝗲𝘀𝘀𝗼𝗻 𝗼𝗳 𝘁𝗵𝗲 𝗱𝗮𝘆: green tests only prove the code passes them. Mutation testing changes the code on purpose and checks that some test fails. In my money helper, one negative-price case returned 0 instead of an error, and no test noticed. Now a negative price always errors.

Carousel: contracts, outbox, encryption, the Redis drill and the lesson.

Code: https://github.com/Nageshwar1997/Beautinique

#buildinpublic #backend #nodejs #mongodb #testing
```
