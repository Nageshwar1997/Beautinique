# DECISIONS: Beautinique

> **Status:** v1.2.2 (2026-11-17). Har faisla ek jagah. Sirf wahi "Tay" jo owner ne khud kaha; Claude ki salah faisla nahi. Cheezein ek-ek karke judti hain.

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
| D-002 | Ek monorepo, tay folder dhaancha; tools aur conventions RULES me. | Architecture | 2026-11-17 |
| D-003 | Docs aur code naye sire se; pehle ka kaam sirf seekhne ka reference, naye me uska zikr ya link nahi. | Process | 2026-11-17 |
| D-004 | Abhi sirf discovery; plan, task files aur code owner ke agla stage kholne pe. | Process | 2026-11-17 |
| D-005 | Agents ek ke baad ek; 5-hour limit ~80% pe naya agent nahi. | Process | 2026-11-17 |
| D-006 | Docs kai files me: PROJECT_PLAN, har module ka folder `tasks/NN-<module>/`, FLOWS; dhaancha docs index me. | Process | 2026-11-17 |
| D-007 | Security Architect zaroori, alag role; security ki do files, faisle aur risks tag ke saath. | Security | 2026-11-17 |
| D-008 | Design aur task files poore ecosystem ki pehle din; banana releases me (R1 = patla par poora order flow); koi feature kata nahi. | Process | 2026-11-17 |
| D-009 | Capacity: ek insaan, 2 Claude accounts, 30 ghante/hafta, koi deadline nahi. | Process | 2026-11-17 |
| D-010 | 11 alag apps, har role parivaar ka ek; screens module ke saath judti hain. | Architecture | 2026-11-17 |
| D-011 | Sabki alag services, har service ka apna database aur apna cluster; seema transaction se. | Architecture | 2026-11-17 |

## 2. Record

### D-001. Tech stack

- **Faisla:**
  - **Backend:** Node.js 24, TypeScript (strict, sirf ESM), Express; validation zod se; HTTP calls axios se.
  - **Data:** MongoDB (native driver) saari services ke liye, **siwaye finance service ke, jiska database PostgreSQL hoga**. Redis-compatible store (Valkey) aur BullMQ background kaam aur queues ke liye.
  - **Frontend:** React, React Router, TanStack Query, react-hook-form, react-aria-components; build Vite se, styling Tailwind CSS se.
  - **Tooling:** npm workspaces ka monorepo, Turborepo, tsdown (packages ka build), Vitest aur Testing Library, Playwright (E2E), ESLint, Prettier, GitHub Actions (CI).
  - **Finance ke niyam:** har niyam ki saaf list (unique index, conditional update, ya code + raat ki jaanch se pakka), aur har niyam ka test, ek saath chalne wale requests ke tests samet.
- **Wajah:** stack owner ne shuru me hi tay kiya. Finance ke liye PostgreSQL Claude ki daleel se aaya: finance ka poora scope (ledger, settlement, TCS / TDS, GST registers) rahe to uske niyam aur reports relational database me zyada mazboot rehte hain. Owner ne yahi chuna.
- **Chhode vikalp:** naya stack; finance bhi MongoDB pe; finance ka scope chhota karna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (stack); Salah maani (finance ke liye PostgreSQL).
- **Asar (Claude):** finance service ke liye transaction, events, release steps aur idempotency ka PostgreSQL wala roop banana hoga; laptop ka Docker infra, CI aur backup me PostgreSQL judega; free PostgreSQL provider chunna abhi baaki hai.

### D-002. Repo aur folders ka dhaancha

- **Faisla:** ek monorepo (npm workspaces). Folders:
  - `packages/<shared|frontend|backend>/<name>`: saajhe packages, naam `@beautinique/<category>-<name>`.
  - `frontend/<app>`: har app ka apna folder.
  - `backend/<service>`: har service ka apna folder.
  - `infra/` (laptop ka Docker infra), `scripts/` (repo ke tools), `configs/` (lint aur TypeScript ke saajhe config), `docs/`.
  - Tools aur kaam ke conventions tay hain; unki poori list [RULES.md](RULES.md) me ek-ek karke aayegi.
- **Wajah:** owner ne shuru me hi tay kiya.
- **Chhode vikalp:** koi charcha nahi hui.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-003. Sab naye sire se

- **Faisla:** docs aur code dono naye sire se banenge. Pehle bana kaam sirf seekhne ka reference hai: usme jo theek tha wo owner ki haan se naye me aata hai, aur jo sawal uthane layak tha wo discovery me uthaya jaata hai. Naye docs aur naye code me pehle ke kaam ka koi zikr ya link nahi, kyunki wo aage hat jayega.
- **Wajah:** owner: pehle ka kaam apne asli naam se pada rahe to owner aur Claude dono ke liye confusion hota; aur har cheez firse banani hai.
- **Chhode vikalp:** bana hua code rakh ke uske upar banana (Claude ki salah); naya code shuru hone tak pehle ka code apne naam se rehne dena (Claude ki salah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (reference); Salah nahi maani (code naye sire se, aur abhi se naam badalna).
- **Asar (Claude):** naya root setup (`package.json`, lint, CI) aur naya code implementation stage me banenge. Tab tak koi npm command nahi chalta, aur pull request pe CI fail hoga.

### D-004. Abhi sirf discovery

- **Faisla:** abhi sirf discovery: sawal-jawab. Plan, task files aur code tab tak nahi jab tak owner agla stage na khole.
- **Wajah:** owner: jaldbaazi nahi; khoob sawal-jawab karke har cheez achhe se tay karni hai.
- **Chhode vikalp:** pehle repo dekh ke seedha poora plan banana.
- **Kab dobara khulega:** jab owner agla stage khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-005. Agents ek ke baad ek

- **Faisla:** agents ek ke baad ek, kabhi saath nahi; agla tabhi jab pichhla poora ho jaye. 5-hour limit ~80% pe ho to naya agent nahi; jo chal raha ho use poora hone do.
- **Wajah:** owner ki 5 ghante ki usage seema; jaldi ke liye kaam ki quality nahi girni chahiye.
- **Chhode vikalp:** kai agents saath (parallel) chalana.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-006. Docs aur tasks ka dhaancha

- **Faisla:** tasks ek file me nahi.
  - Ek main plan file: [PROJECT_PLAN.md](PROJECT_PLAN.md).
  - Har bade module ka apna folder `tasks/NN-<module>/` (jaise auth, product management, audit log, order management): usme `TASK.md` (module ka spec aur subtasks ki list), aur bade kaam ke liye `subtasks/` ([tasks/README.md](tasks/README.md)).
  - Jo flows kai modules me chalte hain, wo [FLOWS.md](FLOWS.md) me.
  - Faisle ek file me tag ke saath (ye file), risks ek file me ([RISKS.md](RISKS.md)). Docs ki poori list [README.md](README.md) me.
- **Wajah:** owner: ek badi file ki jagah alag files, taaki har flow ki baat alag aur saaf rahe.
- **Chhode vikalp:** sab tasks ek file me; business aur architecture faislon ki alag files.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (kai files); Salah maani (exact dhaancha).

### D-007. Security Architect

- **Faisla:** Security Architect ek zaroori, alag role hai, jo baaki roles ke kamzor faislon ko challenge karta hai. Har bade module aur har bade architecture faisle se pehle security review (STRIDE, OWASP ASVS, OWASP Top 10, OWASP API Security Top 10). Security ki do files: [security/THREAT_MODEL.md](security/THREAT_MODEL.md) aur [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md); security ke faisle is file me (tag `Security`), security ke risks [RISKS.md](RISKS.md) me (tag `Security`).
- **Wajah:** owner: security baad ki soch nahi, shuru se har faisle me.
- **Chhode vikalp:** security ki chaar alag files.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (role); Salah maani (do files aur tags).

### D-008. Releases me banana

- **Faisla:** design aur task files poore ecosystem ki pehle din. Banana releases me: R1 = ek patla par poora order flow. Koi feature kata nahi. R1 me exactly kya aayega, ye alag se tay hoga.
- **Wajah:** owner ne Claude ki salah maani.
- **Chhode vikalp:** sirf patla flow aur baaki kaatna (scope chhota hota); sab ek saath launch pe (bahut der tak kuch chalta nahi dikhta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.
- **Asar:** root `CLAUDE.md` ka production-grade niyam isi ke saath likha hai.

### D-009. Capacity

- **Faisla:** kaam karne wala ek hi insaan (owner), 2 Claude accounts se baari-baari (usage limit ki wajah se). Din me 5 ghante, hafte me 6 din (30 ghante), 2026-11-17 se. Koi deadline nahi.
- **Wajah:** owner ki batayi haalat.
- **Chhode vikalp:** koi nahi (ye haalat hai, chunaav nahi).
- **Kab dobara khulega:** jab haalat badle.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-010. 11 alag apps

- **Faisla:** har role parivaar ka alag app; 11 apps: Customer, Seller, Admin, Super Admin, Master, Support Desk, Finance, Logistics Ops, Delivery, Growth Studio, Creator. Jaise-jaise module bane, uski screens apne app me judti jayengi.
- **Wajah:** owner: alag rakhne se kai projects bante hain.
- **Chhode vikalp:** internal apps ko 4 se 5 apps me milana (Claude ki salah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah nahi maani.
- **Aage:** ek insaan ke kai roles hon to kai jagah sign-in ka bojh: security review me.

### D-011. Alag services, alag clusters

- **Faisla:** sabki alag services, har service ka apna database aur apna cluster. MongoDB wali har service ka alag Atlas cluster (alag Atlas project, alag DB user); finance PostgreSQL pe (D-001), alag DB user ke saath. Kam storage wale modules ek service me reh sakte hain. Seema: jo ek saath pakka hona chahiye wo ek service me; services ke beech data sirf events se. Pehla draft (module design me pakka hoga): identity, notify, payments, catalog, commerce, logistics, finance, support, audit.
- **Wajah:** owner: Atlas ka free (M0) cluster 512 MB deta hai, jo poore project ke liye kaafi nahi hoga; aur security bhi zaroori wajah hai.
- **Chhode vikalp:** ek service me modules (modular monolith); kuch hi services alag (Claude ki salah); ek environment ka ek hi cluster, har service ka sirf alag database (owner ne 2026-11-17 ko saaf chhoda: har service ka apna cluster).
- **Kab dobara khulega:** Atlas free tier ka niyam (ek project me ek free cluster) ya ek 512 MB process 9 services na sambhal sake (Claude; dono ki jaanch baaki).
- **Kisne, kab:** owner, 2026-11-17; seema Claude ki salah, owner ne maani. **Nishaan:** Salah nahi maani (services), Salah maani (seema).
- **Note (Claude):** alag cluster aur alag DB user se data ki security abhi se milti hai; process ki security tab milegi jab services alag servers pe chalein. Design aisa rahe ki wo kadam baad me bina rewrite ke ho.

## Change log

| Version | Date | Badlav |
| --- | --- | --- |
| v1.0.0 | 2026-11-17 | Khaali file bani. |
| v1.1.1 | 2026-11-17 | §0 likhne ka tareeka, §1 aur §2 bane; pehla faisla D-001 (tech stack, finance ke liye PostgreSQL). |
| v1.1.2 | 2026-11-17 | Sudhaar (owner ne pakda): D-001 me PostgreSQL ka nishaan "Salah maani"; ye Claude ki hi daleel thi. Faisla nahi badla. |
| v1.2.1 | 2026-11-17 | D-002 se D-011 aaye (repo, sab naye sire se, discovery, agents, docs ka dhaancha, Security Architect, releases, capacity, 11 apps, services). |
| v1.2.2 | 2026-11-17 | D-011: owner ne pakka kiya ki har service ka apna cluster; "ek environment ka ek cluster" chhoda. |
