# MEMORY — BQ

> **Status:** v1.21 (2026-10-22). Project ki yaaddasht: **kya tay hua aur kyun**, **pichhle kaam se kya seekha**, aur **kaunse jaal (traps) se bachna hai**. Poori detail baaki docs me hai; yahan short version aur pointers. Naya sabak ya decision aaye to yahan ek line jodo.

## 1. Decision log

| Date       | Decision                                                                                                                              | Kyun                                                                       | Detail                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| 2026-10-18 | Sirf beauty aur personal care                                                                                                         | Focus, aur try-on pehle se bana hai                                        | PRD §2                                            |
| 2026-10-18 | Beautinique (house brand) + doosre brand sellers                                                                                      | Hybrid marketplace                                                         | PRD §2                                            |
| 2026-10-18 | Sirf brand owners aur authorised distributors bechenge                                                                                | Nakli products se bachaav                                                  | PRD §2                                            |
| 2026-10-18 | Saara stock Beautinique warehouse me                                                                                                  | Batch aur expiry ek jagah check                                            | PRD §2                                            |
| 2026-10-18 | Delivery sirf apne gig partners (apni gaadi); cash nahi, UPI on delivery                                                              | Control aur safety                                                         | PRD §2                                            |
| 2026-10-18 | 11 apps, har main role ka ek (Super Admin alag); 79 roles, sab launch pe                                                              | Owner ka faisla; "baad me bhool sakte hain"                                | PRD §3–4                                          |
| 2026-10-18 | Launch Pune district (poora), phir district-by-district; naya area sirf config se, team ready hone pe                                 | Chhote se shuru, aasaan expansion                                          | PRD §2, §7.2                                      |
| 2026-10-18 | Education + portfolio project, par production-grade; legal cheezein dummy                                                             | Bechna nahi, seekhna aur dikhana hai                                       | PRD §1, §7.1                                      |
| 2026-10-18 | Docs Hinglish me                                                                                                                      | Owner ke liye padhne me aasaan                                             | RULES §8                                          |
| 2026-10-19 | Gateway + Identity, Payments, Notify microservices + Core modular monolith                                                            | Security, paisa aur providers alag; transactions wale kaam ek jagah        | ARCH §2                                           |
| 2026-10-19 | ₹0 budget: Render free (bundle mode), Vercel Hobby, Atlas M0, Render Key Value; domain nahi                                           | Education project                                                          | ARCH §11                                          |
| 2026-10-19 | Laptop pe Docker split mode; dev me local Redis                                                                                       | Microservices seekhna                                                      | ARCH §12                                          |
| 2026-10-19 | Branches: `prerelease` (laptop) → `release` (Render + Vercel)                                                                         | Live pe sirf tested code                                                   | ARCH §13                                          |
| 2026-10-19 | Files StoragePort ke peeche (Cloudinary aaj, S3 kal), unused cleanup                                                                  | Provider badalna aasaan                                                    | ARCH §6.7                                         |
| 2026-10-19 | Base price sabke liye ek; farak sirf label se                                                                                         | Bharosa, dark pattern se bachaav                                           | ARCH §6.8                                         |
| 2026-10-19 | Ola Maps: 4 accounts × 3 domains, har app ka key                                                                                      | Ek account me 3 hi domains                                                 | ARCH §10                                          |
| 2026-10-19 | `Beautinique` monorepo public                                                                                                         | Free unlimited CI, portfolio                                               | ARCH §13                                          |
| 2026-10-19 | Master ke doosre roles alag staff account pe                                                                                          | Master pe koi approval bypass nahi                                         | ARCH §2                                           |
| 2026-10-19 | Packages naye bante hain `packages/<shared\|frontend\|backend>/<name>` me; `BQ-Packages` sirf reference                               | Saaf shuruaat, har package ka side (shared/frontend/backend) naam se dikhe | TASKS T0.1                                        |
| 2026-10-20 | Apps sirf English me                                                                                                                  | Owner ka faisla                                                            | PRD §2                                            |
| 2026-10-20 | Packages ka apna CLI: create, publish, republish, login, logout (Changesets nahi)                                                     | Category ke hisaab se selection, sabka ek bump ya alag-alag                | [packages/README.md](packages/README.md)          |
| 2026-10-20 | Publish laptop se (2FA) aur GitHub Actions se (provenance); release ke baad commit + tags, push khud                                  | Owner ka faisla                                                            | [packages/README.md](packages/README.md)          |
| 2026-10-20 | Naye TypeScript packages sirf ESM, tsdown se build; TypeScript 6.0 (typescript-eslint abhi 7 support nahi karta)                      | Node 24 aur Vite ke liye kaafi, kam files                                  | [packages/README.md](packages/README.md)          |
| 2026-10-20 | `main` default branch: feature → PR → `main` → `prerelease` → `release`; release ke baad `release` → `main` back-merge                | Owner ka faisla; roz ka kaam default branch pe                             | ARCH §13, RULES §2                                |
| 2026-10-20 | Saare packages npm pe public                                                                                                          | Owner ka faisla; monorepo me apne aap jude rehte hain                      | TASKS T0.1                                        |
| 2026-10-20 | Neev ke baad packages app ki zaroorat ke saath bante hain, pehle se nahi; do apps ki cheez turant package me                          | Asli zaroorat se API banta hai, andaaze se nahi                            | TASKS T0.1                                        |
| 2026-10-21 | Packages public rahenge, par abhi publish/republish nahi; sirf zaroorat pe (repo ke bahar koi user). `private` nahi karne | Saare apps monorepo se package lete hain (workspaces), live pe bhi; publish ka kharcha (versions, 2FA, release branch) abhi bekaar | TASKS T0.1, HANDOFF §4 |
| 2026-10-21 | Dark me subtle text muted section pe 3.66:1: rang nahi badla, niyam bana (muted section pe subtle text nahi) | Owner ka faisla | DESIGN §3, styles README |
| 2026-10-21 | Ulti patti ke liye `focus-ring-inverse` token + `surface-inverse` utility | Purana ring dark me 2.37:1 tha (chahiye 3) | DESIGN §3, styles README |
| 2026-10-21 | High contrast me har tone ek step gehri/halki, gradient bhi: saara text 7:1, script check karti hai | Docs ka 7:1 vaada sach ho; Delivery app dhoop me | DESIGN §3.4, palette.mjs |
| 2026-10-21 | MongoDB: native `mongodb` driver (Mongoose nahi); services sirf `@beautinique/backend-server-mongo` se import karti hain (ESLint rokta hai) | Owner ka faisla; session aur transaction pe seedha control, ek driver version | TASKS T1.2, server-mongo README |
| 2026-10-21 | Transaction me queries ek ke baad ek: ESLint `withTransaction` ke andar `Promise.all/allSettled/any/race` rokta hai, runtime check saath me wire pe aayi queries pe `ParallelTransactionError` | MongoDB transaction me parallel queries support nahi karta; purana random 500. Runtime check akela pakka nahi (busy pool me queries ek ke baad ek jaati hain) | MEMORY §2 sabak 1 aur 20, ARCH §6.2 |
| 2026-10-21 | Transaction ke andar query ka error pakad ke aage nahi; dedupe `$setOnInsert` upsert se | MongoDB transaction pehle hi cancel kar deta hai; `TransactionAbortedError` turant batata hai | server-mongo README |
| 2026-10-21 | Mongo wale tests asli replica set pe (mock nahi); local, CI aur release Mongo `enableTestCommands=1` (fail points) | Commit retry jaise raaste sirf asli server pe sach me parakhte hain | infra README, ci.yml, release.yml |
| 2026-10-21 | Redis: development, tests aur CI me local Docker Valkey (Render free jaisi limits); production me **Render Key Value free**, sirf internal URL (bahar se band). Production Redis laptop se kabhi nahi; staging chahiye to alag instance | Owner ka faisla. Render KV: 50 connections (deploy overlap me ~40 chahiye; Redis Cloud free ke ~30 me nahi aate), same private network (<1 ms), endpoint public nahi. Laptop se production Redis: tests uska data mita dete, limits bant jaatin, latency | ARCH decision 6, §6.6; server-queue README |
| 2026-10-21 | bullmq aur ioredis ke latest versions (6.4.0, 6.0.0) | Owner: "latest wale hi lelo" | server-queue package.json |
| 2026-10-21 | Relay ka `jobId = <eventId>@<subscriber>` (ARCH me `:` tha) | BullMQ custom job id me `:` mana karta hai | ARCH §5.2 |
| 2026-10-21 | Relayed outbox events 72 ghante rakhe (TTL index), lease ka waqt MongoDB ki ghadi (`$$NOW`) se | Redis wipe redrive 48 ghante peeche jaata hai; instances ki ghadiyon ka farak na pade | server-queue README |
| 2026-10-22 | Relay job me poora event envelope (max 16 KB, `writeEvent` bade event pe error); consumer outbox nahi padhta | Owner ka faisla: har deployable sirf apna DB padhta hai (ARCH §6.1), aur §6.6 ka "job me sirf {eventId, type}" usse takrata tha | ARCH §6.6, server-queue README |
| 2026-10-22 | Consumer: handler + handled nishaan ek transaction me; retry bekaar ho (anjaan event, toota contract, handler bug) to turant dead letter | At-least-once delivery pe effectively-once asar; bug ko 6 baar retry karna bekaar | server-queue README |
| 2026-10-22 | Redis wipe: har deployable apna aakhri recovered `bq:epoch` apne DB (`platform_state`) me yaad rakhta hai; anjaan epoch (pehla start bhi) pe lease ke peeche `recover` | `bq:epoch` key sab deployables ki ek hai: ek ke nayi key likhne se doosre ko wipe na dikhta aur unke schedulers/outbox wapas na aate | ARCH §6.6, server-queue README |
| 2026-10-22 | Scheduled task ka fail run dead letter nahi; cron pattern default India time (`Asia/Kolkata`) | Agla run aata hi hai, dead letters insaan ke liye hain; business din India ka | server-queue README |
| 2026-10-22 | Mutation testing 3 hisse: kernel packages pehli baar poora run (background) aur baad me badli lines; nazuk logic (paisa, stock, permissions) badli lines; baaki modules aur apps me nahi | Owner: har badlav pe poora run (server-queue: 95 mutations ~45 min) se project saalon me khatam hota | RULES §6 |
| 2026-10-22 | PII encryption: versioned keys (`k2,k1`: pehli seal kare, baaki rotation), sealed value me key id aur format version, context (`<collection>.<field>:<id>`) AES-GCM ke AAD me, blind index HMAC(field + value), `{ enc, idx, masked }` | Bina downtime key rotation; ek record ka sealed value doosre me chipka ke chalaya na ja sake; ek hi value do fields me alag index | server-crypto README, ARCH §6.5 |
| 2026-10-22 | Imports/exports ka order sirf ESLint (`simple-import-sort`) tay karta hai, aur CI (`npm run lint`) wahi check karta hai; VS Code ka Organize Imports (`source.organizeImports`) is repo me save pe band (`.vscode/settings.json`, tab lagti hai jab `Beautinique` folder window ka root ho) | Dono order alag hain (VS Code `type` names aakhir me, case-sensitive; ESLint alphabet me, `type` beech me) aur Ctrl+S pe ek doosre ka kiya ulta karte the. Owner ne dono options dekh ke ESLint wala chuna (2026-10-22); CI usi ko maanta hai, aur uska order har machine/editor pe ek jaisa hai | HANDOFF §2 aur §6 (trap) |
| 2026-10-22 | Storage: package `backend-server-storage` (`server-` naam, baaki backend packages jaisa; TASKS me `backend-storage` likha tha). `StoragePort` me docs ke 4 methods ke saath `stat` aur `list`. Key ek hi format `<visibility>/<purpose>/<assetId>` (`assetKey`), visibility key me. Har adapter `storageContract` (package ka `/testing` subpath) pass kare | `stat` ke bina `USED` karte waqt pata nahi chalta ki file sach me upload hui; `list` ke bina weekly reconcile provider ki list nahi padh sakta. Ek key format se provider badalne par key wahi rehti hai aur key se hi public/private pata chalta hai, to galat visibility ka URL nahi ban sakta. Ek contract suite se Cloudinary aur S3 adapter ek jaisa behave karte hain | packages/backend/server-storage, ARCHITECTURE §6.7 |
| 2026-10-22 | Authz me teen pure functions aur: `scopeWithin` (scope ke andar scope), `grantProblems` (grant save se pehle jaanch), `checkSeparation` (maker ≠ checker waghera, ids exact compare; bina id ka step bug hai, error). `authorize()` / `scopeFilter()` T4.1 me | Appoint karne wala apne scope se bada scope na de sake; galat grant save hi na ho; RULES §4.6 ka "separation of duties code me aur tests me" ek hi jagah, frontend bhi use kare | packages/shared/authz, TASKS T1.6 |
| 2026-10-22 | MongoDB 8.0 ke liye compose me `GLIBC_TUNABLES=glibc.pthread.rseq=1`; image 8.0 hi, runners `ubuntu-latest` | MongoDB 8.0 Linux 6.19+ pe shuru nahi hota (SERVER-121912) aur GitHub ke saare Ubuntu runners kernel 7.0 pe hain (`ubuntu-24.04` pin bhi kaam nahi aaya). Version badalna Atlas M0 (8.0) se farak laata | infra/docker-compose.yml, infra README |
| 2026-10-20 | Packages sirf `release` branch se publish                                                                                             | Wahi branch jo apps live karti hai: npm pe sirf tested code                | ARCH §13                                          |
| 2026-10-20 | Apps aur services npm packages nahi: `frontend/<app>`, `backend/<name>`, simple naam, `private`                                       | Owner ka faisla; ye deploy hote hain, publish nahi                         | [packages/README.md](packages/README.md) §3.1–3.2 |
| 2026-10-20 | Ek `npm run create` (Package / Frontend app / Backend app); sirf contracts ke `APPS` aur `DEPLOYABLES`                                | Owner ka faisla; naya feature Core module, naya deployable nahi            | ARCH §3, §4                                       |
| 2026-10-20 | Service ka common code `backend-server-kit` me, har service me copy nahi                                                              | Ek jagah fix, sab services me                                              | TASKS T1.1                                        |
| 2026-10-20 | Backend Node 24 type stripping se (tsx nahi), production `tsdown` `dist/`; bundle internal deployables `127.0.0.1` ke khaali ports pe | Kam tools; bahar se sirf gateway                                           | ARCH §12                                          |
| 2026-10-20 | Ordered product archive hota hai, delete nahi; sirf bina order wala product delete (images bhi) | Order history, returns, invoices aur disputes ko details aur images chahiye | ARCH §6.7, PRD §5 |
| 2026-10-20 | Har file ka ek owner; doosri jagah wahi image chahiye to copy | Ek record ka delete doosre ki image nahi todta | ARCH §6.7 |
| 2026-10-20 | **Frozen:** OTP sirf email se; mobile pe OTP nahi (login aur delivery), phone sirf contact | SMS ke liye DLT (registered business) chahiye; baaki raaste paid ya card wale | ARCH §7.1, PRD §2 |
| 2026-10-20 | **Frozen:** SMS aur WhatsApp channel bilkul nahi (poore hate); notifications sirf in-app, email, browser push | Mobile pe asli message ke liye DLT ya paid raasta chahiye; sandbox ka koi fayda nahi | ARCH §3, §10; PRD §5 |

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
19. **Test ne kuch parakha hi nahi:** gateway ka `..` test `http.request(urlString)` se tha, jo `..` pehle hi hata deta hai, aur method/`..` tests status 404 dekhte the jo upstream bhi deta. Mutation check ne pakda. **Sabak:** har security test ke liye ek mutation chalao; fake upstream me "leak" route rakho taaki galat forward 200 de.
20. **Ek session, kai attempts:** `withTransaction` ka pehla version har retry me wahi session leta tha. Fail hue attempt ki late `Promise.all` branch transaction ke bahar save ho jaati thi (201 ke saath extra outbox rows). Mere 25 tests aur 37/41 mutations ye nahi pakad paaye; independent review (asli Mongo pe probe ke saath) ne pakda. Fix ke baad doosre review ne fix ki 5 kamiyan aur pakdi (aakhri line ka bhula `await`, network error ke baad bacha transaction). **Sabak:** har attempt ka naya session; naye infra code pe independent review + probe, aur fix ke baad dobara review.

## 3. Environment

- **Laptop:** Windows 11 Home, 7.9 GB RAM, i5 (8 threads), Node 24, npm 12, mongosh 2.8.
- **Docker:** Docker Desktop 4.95 (per-user install), WSL2. `C:\Users\nages\.wslconfig`: 3 GB RAM, 4 CPU, 2 GB swap. Docker install se pehle khula terminal `docker` nahi dhoondh paata; naya terminal kholo.
- **Free tier ki limits** (2026-10-19 ko verified): Render free 512 MB / 0.1 CPU / 750 ghante; Key Value 25 MB / 50 connections; Atlas M0 512 MB / 100 ops/s / 5 change streams. Detail ARCH §11.2, §6.1, §6.6.

## 4. Repos aur folders (`C:\Users\nages\Desktop\BQ`)

| Folder                                            | Kya hai                                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Beautinique`                                     | Naya monorepo (public): `backend/`, `frontend/`, `packages/`, `docs/`              |
| `Beautinique/docs`                                | Ye planning docs (monorepo ke andar; purana `Beautinique-Docs` repo ab khaali hai) |
| `BQ-Client`, `BQ-Seller`, `BQ-Admin`, `BQ-Master` | Purane frontend repos (migration ke baad archive)                                  |
| `BQ-Packages`                                     | Purane shared npm packages (`@beautinique/*`)                                      |
| `BQ-Microservices`, `Beautinique-Gateway`         | Purana backend (migration ke baad archive)                                         |
| `All-ENVs`                                        | Env files. **Private; kabhi public repo me nahi.**                                 |

## 5. Shabdkosh (glossary)

| Shabd             | Matlab                                                                     |
| ----------------- | -------------------------------------------------------------------------- |
| Bundle mode       | Paancho backend deployables ek Render free service me                      |
| Split mode        | Har microservice alag process ya container me (laptop)                     |
| House brand       | Beautinique ka apna brand, Seller app me ek seller account                 |
| Grant             | User ko kisi scope me ek role dena (jaise State Admin, scope: Maharashtra) |
| Scope             | Permission kahan lagu: self, brand, state, district, city, hub, global...  |
| Area              | State, district ya pincode; status CLOSED → READYING → LIVE                |
| Go-live checklist | Area live karne se pehle ki list; team ready pehli shart                   |
| Outbox            | Events pehle MongoDB me, phir queue me; koi event nahi khota               |
| Passport          | Gateway ka 60 second ka token jo services ko bhejta hai                    |
| DUMMY             | Education project ke liye nakli legal data ya registration ka label        |

## Change log

| Version | Date       | Badlav                                                                                                |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-10-19 | Pehla version: decision log, pichhle kaam ke 18 sabak, environment, repos aur glossary.               |
| v1.1    | 2026-10-20 | Decision: apps sirf English me.                                                                       |
| v1.2    | 2026-10-20 | Decisions: package CLI, publish ka tarika, ESM-only.                                                  |
| v1.3    | 2026-10-20 | Decisions: packages naye bante hain, `release` branch se publish, `main` default branch wala flow.    |
| v1.4    | 2026-10-20 | Decision: packages public ya private.                                                                 |
| v1.5    | 2026-10-20 | Decisions: saare packages public; packages zaroorat ke saath.                                         |
| v1.6    | 2026-10-20 | Decisions: apps/services packages nahi, ek create command, server-kit, Node type stripping. Sabak 19. |
| v1.7    | 2026-10-20 | Decisions: ordered product archive, ek file ek owner. |
| v1.8    | 2026-10-20 | Decision (frozen): OTP sirf email se. |
| v1.9    | 2026-10-20 | Decision (frozen): SMS aur WhatsApp channel hate. |
| v1.10   | 2026-10-21 | Decision: abhi publish nahi, zaroorat pe; packages public hi. |
| v1.11   | 2026-10-21 | Decisions: muted section niyam, focus-ring-inverse, high contrast tones 7:1. |
| v1.12   | 2026-10-21 | Decisions: native mongodb driver ek import path, transaction me Promise.all nahi (ESLint), caught query error nahi, Mongo tests asli server pe; sabak 20. |
| v1.13   | 2026-10-21 | Decisions: Redis local Valkey + production free tier, bullmq/ioredis latest, jobId `@`, outbox 72 ghante, lease `$$NOW`. |
| v1.14   | 2026-10-21 | Decision: production Redis = Render Key Value free (internal URL); laptop se kabhi nahi. |
| v1.15   | 2026-10-22 | Decision: CI runner `ubuntu-24.04` pin (MongoDB 8.0 aur kernel 6.19+). |
| v1.16 | 2026-10-22 | Decisions: job me poora envelope (16 KB), consumer ke dead letter niyam. |
| v1.17 | 2026-10-22 | Decision: mutation testing 3 hisse (kernel, nazuk logic, baaki nahi). |
| v1.18 | 2026-10-22 | Decisions: deployable apna epoch yaad rakhe, task fail dead letter nahi, cron India time. |
| v1.19 | 2026-10-22 | Decision: PII encryption ka format (versioned keys, context AAD, field wala blind index). |
| v1.20 | 2026-10-22 | Decision: imports/exports ka order ESLint tay karta hai (CI), VS Code Organize Imports band. |
| v1.21 | 2026-10-22 | Decisions: `backend-server-storage` ka naam, `StoragePort` me `stat` aur `list`, ek key format, adapter contract tests; authz me scope-in-scope, grant checks, separation of duties. |
