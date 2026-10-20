# MEMORY — BQ

> **Status:** v1.1 (2026-10-20). Project ki yaaddasht: **kya tay hua aur kyun**, **pichhle kaam se kya seekha**, aur **kaunse jaal (traps) se bachna hai**. Poori detail baaki docs me hai; yahan short version aur pointers. Naya sabak ya decision aaye to yahan ek line jodo.

## 1. Decision log

| Date | Decision | Kyun | Detail |
|---|---|---|---|
| 2026-10-18 | Sirf beauty aur personal care | Focus, aur try-on pehle se bana hai | PRD §2 |
| 2026-10-18 | Beautinique (house brand) + doosre brand sellers | Hybrid marketplace | PRD §2 |
| 2026-10-18 | Sirf brand owners aur authorised distributors bechenge | Nakli products se bachaav | PRD §2 |
| 2026-10-18 | Saara stock Beautinique warehouse me | Batch aur expiry ek jagah check | PRD §2 |
| 2026-10-18 | Delivery sirf apne gig partners (apni gaadi); cash nahi, UPI on delivery | Control aur safety | PRD §2 |
| 2026-10-18 | 11 apps, har main role ka ek (Super Admin alag); 79 roles, sab launch pe | Owner ka faisla; "baad me bhool sakte hain" | PRD §3–4 |
| 2026-10-18 | Launch Pune district (poora), phir district-by-district; naya area sirf config se, team ready hone pe | Chhote se shuru, aasaan expansion | PRD §2, §7.2 |
| 2026-10-18 | Education + portfolio project, par production-grade; legal cheezein dummy | Bechna nahi, seekhna aur dikhana hai | PRD §1, §7.1 |
| 2026-10-18 | Docs Hinglish me | Owner ke liye padhne me aasaan | RULES §8 |
| 2026-10-19 | Gateway + Identity, Payments, Notify microservices + Core modular monolith | Security, paisa aur providers alag; transactions wale kaam ek jagah | ARCH §2 |
| 2026-10-19 | ₹0 budget: Render free (bundle mode), Vercel Hobby, Atlas M0, Render Key Value; domain nahi | Education project | ARCH §11 |
| 2026-10-19 | Laptop pe Docker split mode; dev me local Redis | Microservices seekhna | ARCH §12 |
| 2026-10-19 | Branches: `prerelease` (laptop) → `release` (Render + Vercel) | Live pe sirf tested code | ARCH §13 |
| 2026-10-19 | Files StoragePort ke peeche (Cloudinary aaj, S3 kal), unused cleanup | Provider badalna aasaan | ARCH §6.7 |
| 2026-10-19 | Base price sabke liye ek; farak sirf label se | Bharosa, dark pattern se bachaav | ARCH §6.8 |
| 2026-10-19 | Ola Maps: 4 accounts × 3 domains, har app ka key | Ek account me 3 hi domains | ARCH §10 |
| 2026-10-19 | `Beautinique` monorepo public | Free unlimited CI, portfolio | ARCH §13 |
| 2026-10-19 | Master ke doosre roles alag staff account pe | Master pe koi approval bypass nahi | ARCH §2 |
| 2026-10-20 | Apps sirf English me | Owner ka faisla | PRD §2 |
| 2026-10-20 | Packages ka apna CLI: create, publish, republish, login, logout (Changesets nahi) | Category ke hisaab se selection, sabka ek bump ya alag-alag | [packages/README.md](packages/README.md) |
| 2026-10-20 | Publish laptop se (2FA) aur GitHub Actions se (provenance); release ke baad commit + tags, push khud | Owner ka faisla | [packages/README.md](packages/README.md) |
| 2026-10-20 | Naye TypeScript packages sirf ESM, tsdown se build; TypeScript 6.0 (typescript-eslint abhi 7 support nahi karta) | Node 24 aur Vite ke liye kaafi, kam files | [packages/README.md](packages/README.md) |

## 2. Pichhle kaam se seekhe sabak

1. **"Done" likha tha par verify nahi hua tha.** Ye 3 baar hua: (a) ek Mongo session me `Promise.all` se 2 queries chalayi, jisse transaction error aur generic 500 aaya; sirf asli HTTP flow chalane pe pakda gaya. (b) "Sirf SELLER publish kare" wala kaam tracker me done tha, par code me admin shortcut abhi bhi tha. (c) Ek "live browser verified" claim asal me chalaya hi nahi gaya tha. **Sabak:** done tabhi jab disk ka code aur asli user flow dono check hon (RULES §6.4).
2. **Producer check kiya, consumer nahi.** Mail-service ke 2 notification workers sirf `console.log` the; queue me job jaata tha par email kabhi nahi. **Sabak:** async kaam me dono taraf check karo.
3. **Ek Mongo session me queries parallel nahi.** Transaction ke andar sequential `await`.
4. **Ola Maps ke labels gayab:** hosted tiles me `name:latin` missing tha. Fix: style JSON me `name:latin` → `name`. Phir patched style **object** dena SDK me `.includes` tod deta tha (map click chupchaap fail). Fix: patched JSON ka `blob:` URL **string** dena. **Sabak:** "map dikh raha hai" ka matlab "map chal raha hai" nahi.
5. **`VITE_` env vars browser bundle me jaate hain.** Kabhi secret mat rakho (Ola OAuth secret server pe shift kiya). Ola ka browser key domain-restricted hai; server ko OAuth client credentials chahiye.
6. **Google Maps billing kabhi enable nahi hui** (`REQUEST_DENIED`), isliye Ola Maps (Krutrim) pe shift kiya.
7. **Brevo authorised IPs** naye IP se email rok dete hain (live test isi wajah se ruka tha).
8. **OTP logs me leak** ho raha tha (mail-service failure logs). Har jagah redaction (RULES §7.2).
9. **Redis cache helper me asymmetry:** plain string set hoti thi par get pe `JSON.parse` fail. Fix ho gaya; naye cache helpers me string aur object dono test karo.
10. **Dead fields:** `Admin.currentPendingLoad` kabhi update nahi hota tha, isliye dashboard pe hamesha 0. Load asal me doosri jagah compute hota tha. Purane fields pe bharosa karne se pehle check karo.
11. **Orphan records:** ek `Admin` doc ka `user` null tha, jisse poora page crash hua. Dangling references filter karo.
12. **Keep-alive:** `/wake-up` ab sirf gateway jagata tha, services nahi. Naye design me ye sab hatega.
13. **Interactive CLI** (jaise `npm run republish`) AI assistant ka tool nahi chala sakta; owner khud chalata hai.
14. **File overwrite:** naya file banane se pehle check karo ki us path pe kuch hai to nahi (ek baar hooks wali file mit gayi thi; git se wapas aayi).
15. **Package types:** republish sync base zod types ko `shared/types` me le jaata hai; naya type jodne se pehle wahan dekho.
16. **`outline-hidden`** focus ring hata deta hai; apna focus style do.
17. **React concurrent transition** me query-param input ka trap (`useQueryParamInput`): hook ko pehle app me browser pe prove karo.
18. **`npx tsc -p`** scratch folder se chalaya to output package me likh deta hai; dhyan rakho.

## 3. Environment

- **Laptop:** Windows 11 Home, 7.9 GB RAM, i5 (8 threads), Node 24, npm 12, mongosh 2.8.
- **Docker:** Docker Desktop 4.95 (per-user install), WSL2. `C:\Users\nages\.wslconfig`: 3 GB RAM, 4 CPU, 2 GB swap. Docker install se pehle khula terminal `docker` nahi dhoondh paata; naya terminal kholo.
- **Free tier ki limits** (2026-10-19 ko verified): Render free 512 MB / 0.1 CPU / 750 ghante; Key Value 25 MB / 50 connections; Atlas M0 512 MB / 100 ops/s / 5 change streams. Detail ARCH §11.2, §6.1, §6.6.

## 4. Repos aur folders (`C:\Users\nages\Desktop\BQ`)

| Folder | Kya hai |
|---|---|
| `Beautinique` | Naya monorepo (public): `backend/`, `frontend/`, `packages/`, `docs/` |
| `Beautinique/docs` | Ye planning docs (monorepo ke andar; purana `Beautinique-Docs` repo ab khaali hai) |
| `BQ-Client`, `BQ-Seller`, `BQ-Admin`, `BQ-Master` | Purane frontend repos (migration ke baad archive) |
| `BQ-Packages` | Purane shared npm packages (`@beautinique/*`) |
| `BQ-Microservices`, `Beautinique-Gateway` | Purana backend (migration ke baad archive) |
| `All-ENVs` | Env files. **Private; kabhi public repo me nahi.** |

## 5. Shabdkosh (glossary)

| Shabd | Matlab |
|---|---|
| Bundle mode | Paancho backend deployables ek Render free service me |
| Split mode | Har microservice alag process ya container me (laptop) |
| House brand | Beautinique ka apna brand, Seller app me ek seller account |
| Grant | User ko kisi scope me ek role dena (jaise State Admin, scope: Maharashtra) |
| Scope | Permission kahan lagu: self, brand, state, district, city, hub, global... |
| Area | State, district ya pincode; status CLOSED → READYING → LIVE |
| Go-live checklist | Area live karne se pehle ki list; team ready pehli shart |
| Outbox | Events pehle MongoDB me, phir queue me; koi event nahi khota |
| Passport | Gateway ka 60 second ka token jo services ko bhejta hai |
| DUMMY | Education project ke liye nakli legal data ya registration ka label |

## Change log

| Version | Date | Badlav |
|---|---|---|
| v1.0 | 2026-10-19 | Pehla version: decision log, pichhle kaam ke 18 sabak, environment, repos aur glossary. |
| v1.1 | 2026-10-20 | Decision: apps sirf English me. |
| v1.2 | 2026-10-20 | Decisions: package CLI, publish ka tarika, ESM-only. |
