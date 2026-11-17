# DECISIONS: Beautinique

> **Status:** v1.1.1 (2026-11-17). Har faisla ek jagah. Sirf wahi "Tay" jo owner ne khud kaha; Claude ki salah faisla nahi. Cheezein ek-ek karke judti hain.

## 0. Kaise likhein

- **§1 Ek nazar me:** har faisla ek line me (Id, faisla, tag, kab).
- **§2 Record:** har faisle ke liye: **Faisla**, **Wajah**, **Chhode vikalp**, **Kab dobara khulega**, **Kisne, kab**, **Nishaan** (`Owner` / `Salah maani` / `Salah nahi maani`), aur zaroorat ho to **Asar (Claude)**.
- **Tag:** `Business`, `Architecture`, `Security` ya `Process`.
- Faisla badle to purani line mitti nahi: nayi line "badla" ke saath judti hai.
- **Number:** D-001, D-002 ... kram se. Ek baar diya number kabhi badalta nahi aur dobara use nahi hota.

## 1. Ek nazar me

| Id | Faisla | Tag | Kab |
| --- | --- | --- | --- |
| D-001 | Tech stack tay; finance service ka database PostgreSQL, baaki saari services MongoDB pe. | Architecture | 2026-11-17 |

## 2. Record

### D-001. Tech stack

- **Faisla:**
  - **Backend:** Node.js 24, TypeScript (strict, sirf ESM), Express; validation zod se; HTTP calls axios se.
  - **Data:** MongoDB (native driver) saari services ke liye, **siwaye finance service ke, jiska database PostgreSQL hoga**. Redis-compatible store (Valkey) aur BullMQ background kaam aur queues ke liye.
  - **Frontend:** React, React Router, TanStack Query, react-hook-form, react-aria-components; build Vite se, styling Tailwind CSS se.
  - **Tooling:** npm workspaces ka monorepo, Turborepo, tsdown (packages ka build), Vitest aur Testing Library, Playwright (E2E), ESLint, Prettier, GitHub Actions (CI).
  - **Finance ke niyam:** har niyam ki saaf list (unique index, conditional update, ya code + raat ki jaanch se pakka), aur har niyam ka test, ek saath chalne wale requests ke tests samet.
- **Wajah:** stack owner ne shuru me hi tay kiya. Finance ke liye owner ne PostgreSQL chuna, jab charcha hui ki ledger, settlement aur finance reports ke niyam relational database me zyada mazboot rehte hain.
- **Chhode vikalp:** naya stack; finance bhi MongoDB pe (Claude ki salah); finance ka scope chhota karna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (stack); Salah nahi maani (finance ke liye PostgreSQL).
- **Asar (Claude):** finance service ke liye transaction, events, release steps aur idempotency ka PostgreSQL wala roop banana hoga; laptop ka Docker infra, CI aur backup me PostgreSQL judega; free PostgreSQL provider chunna abhi baaki hai.

## Change log

| Version | Date | Badlav |
| --- | --- | --- |
| v1.0.0 | 2026-11-17 | Khaali file bani. |
| v1.1.1 | 2026-11-17 | §0 likhne ka tareeka, §1 aur §2 bane; pehla faisla D-001 (tech stack, finance ke liye PostgreSQL). |
