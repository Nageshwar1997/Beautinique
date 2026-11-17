# DECISIONS: Beautinique

> **Status:** v1.3.2 (2026-11-17). Har faisla ek jagah. Sirf wahi "Tay" jo owner ne khud kaha; Claude ki salah faisla nahi. Cheezein ek-ek karke judti hain.

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
| D-012 | Design aur code asli users maan ke (production-grade), halaanki live system sirf owner chalata hai. | Architecture | 2026-11-17 |
| D-013 | Backup: ek command se saare databases ka data download aur restore command; files repo ke folder me par git se bahar (4 pehre). | Architecture | 2026-11-17 |
| D-014 | Fulfilment: maal sirf apne warehouse me, delivery sirf apne partners; carrier port; seller khud nahi bhejta; pehle din 1 warehouse + 1 hub. | Business | 2026-11-17 |
| D-015 | Location: India > State > District > Sub-District; har level ka switch; switch aur live alag; sharten sirf live karte waqt. | Business | 2026-11-17 |
| D-016 | Pincode → theek ek hub (primary sub-district se), 10 cases ke niyam ke saath. | Business | 2026-11-17 |
| D-017 | Roles ki poori list design me, har role apne module ke saath chalu; ginti fix nahi; owner ke har role ka alag account. | Business | 2026-11-17 |
| D-018 | Faislon ka record is file ke format me; badalne pe "badla" line; sawal-jawab files me sirf aakhri faisla. | Process | 2026-11-17 |
| D-019 | Docs chhote, har baat ek jagah, "bana hai" sirf code ya test ki link se; CI me docs ke paths ka check. | Process | 2026-11-17 |
| D-020 | Guest cart aur guest wishlist nahi; bina sign-in sirf dekhna, search, reviews padhna, pincode check. | Business | 2026-11-17 |
| D-021 | Customer ke sign-in ke teen raaste: password, social (Google, LinkedIn, GitHub), email code. | Security | 2026-11-17 |
| D-022 | Location ka kaam sirf utna jitna D-015 ko chahiye; pehle location, phir products; staff ki list data me (sirf Master badle). | Business | 2026-11-17 |
| D-023 | Package CLI ka kaam wahi (create, publish, republish, verify, update-deps); naya kaam publish ke plan pe; teen chhote niyam. | Process | 2026-11-17 |
| D-024 | `main` branch hategi; flow `prerelease` → `release`; GitHub default branch `release`. | Process | 2026-11-17 |
| D-025 | Skin & Hair Expert aur Beauty Advisor asli staff roles; video ke liye Google Meet ka dummy link; Beauty Advisor ka message thread (live chat nahi). | Business | 2026-11-17 |
| D-026 | Lakshya: portfolio project, par aisa bane ki kal asli business ban sake; design asli jaisa, registrations aur kanooni details dummy. | Business | 2026-11-17 |
| D-027 | Warehouse aur hub ke beech maal kiraye ke transporter se; har trip ka record aur transporter ka bill finance me. | Business | 2026-11-17 |
| D-028 | Kharcha ₹0, domain nahi; server baar-baar jagaya jayega; production-grade = code + chalne ki quality, ₹0 me jitni ho sake. | Business | 2026-11-17 |

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

### D-012. Asli users maan ke design

- **Faisla:** live system sirf owner chalayega, par design aur code ye maan ke ki asli users use kar rahe hain: concurrency, abuse aur scale ki soch, aur unke tests.
- **Wajah:** owner: code sirf owner ke liye nahi likhna, ekdum production-grade banana hai.
- **Chhode vikalp:** "sirf ek user hai" maan ke load aur abuse ki chinta chhodna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.
- **Kahan laagu nahi:** sirf chhote operations ke faisle (jaise backup ke waqt system khaali hai, emails ki ginti).

### D-013. Backup command

- **Faisla:** ek command, jo production me jaane se pehle owner chalayega, aur saare databases ka data download kare.
  - MongoDB clusters: Extended JSON (har collection ki ek file, ek line me ek document).
  - Finance ka PostgreSQL (D-001) bhi isi command me; uska format technical charcha me tay hoga.
  - Restore command bhi, jo ek baar local pe jaanchi jaye.
  - Files isi repo ke ek folder me, git se bahar. 4 pehre: `.gitignore`; CI ka pehra jo us folder ki koi file git me dikhe to fail kare; Prettier, ESLint aur tests se bahar; Claude us folder ko `.env` ki tarah kabhi na khole.
- **Wajah:** owner: production me jaane se pehle ek command chala ke saare clusters ka data JSON me mil jaye; files repo me rahein par GitHub pe na jayein.
- **Chhode vikalp:** repo ke bahar ka folder (Claude ki salah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (command, jagah); Salah maani (format, restore, pehre).

### D-014. Fulfilment model

- **Faisla:** har brand ka saara maal sirf apne warehouse (Chakan) me; customer tak sirf apne delivery partners, koi courier nahi.
  - Raasta: brand → warehouse → hub → delivery partner → customer.
  - Ilaake ke bahar delivery unavailable.
  - Delivery ka code ek carrier port ke peeche; aaj uske peeche sirf apni fleet.
  - Seller khud nahi bhejta.
  - Pehle din 1 warehouse + 1 hub, us sub-district ke saare pincodes; baaki hubs baad me ek click se.
- **Wajah:** owner: pehle din poora district nahi, ek-ek hub se shuru.
- **Chhode vikalp:** pehle din poora district (21 hubs); seller khud bheje.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner; Salah maani (carrier port).

### D-015. Location, switches aur live

- **Faisla:**
  - **Seedhi:** India > State > District > Sub-District. District me ek main warehouse; har sub-district me theek ek hub (alag record, sub-district se juda). Hub sirf parcel aage badhata hai, stock nahi. Warehouse se seedha customer ko kuch nahi; main city me bhi warehouse ke paas hub.
  - **Switch ka haq:** Master = State, Super Admin = District, Admin = Sub-District; Admin hub live karta hai. Upar wala role neeche ka switch chala sakta hai, audit ke saath.
  - **Switch aur live alag:** switch = kisi ne ON dabaya; live = apna switch ON + upar wala level live. Live kahin save nahi hota. Upar OFF to neeche sab OFF.
  - **Sharten sirf live karte waqt:** hub = staff ki list poori; district = warehouse + hub tayyar; state = kam se kam ek district. Live ke baad kami pe sirf chetavni (D-022), apne aap band nahi.
  - **OFF:** naye order turant band; jab tak orders ya returns raaste me hain, wo poore hote hain. Aakhri district OFF ho aur kuch pending na ho to state bhi OFF. Order user ke district ke warehouse se.
- **Wajah:** owner: hub tabhi live jab uska poora staff ready ho; state tab tak live nahi jab tak uska koi district live na ho.
- **Chhode vikalp:** live ki haalat store karna; sharat tootte hi apne aap band (D-022).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (seedhi, haq, sharten); Salah maani (switch aur live alag, sharten sirf live karte waqt, hub alag record).

### D-016. Pincode ke niyam

- **Faisla:**
  1. **Buniyadi niyam:** delivery ka faisla naam ya seedhi se nahi, **pincode → theek ek hub** ki mapping se. Har pincode ka ek primary sub-district (data se aaye, Admin badal sake).
  2. Pincode number poore India me ek hi ilaake ka hota hai; asli case ye hai ki ek pincode ka ilaaka do sub-districts, do districts ya kabhi do states me phaila ho.
  3. **Do sub-districts ya districts me phaila:** primary sub-district ka hub aur us district ka warehouse serve kare; address me likha district alag ho to bhi order na ruke.
  4. **Do states me phaila:** data me nishaan; customer state chune; chuna hua state live ho tabhi order; GST usi state ke hisaab se.
  5. **Ek jaise naam:** hamesha id aur sarkari code se, naam se kabhi nahi; screen pe "Sub-District, District, State" saath dikhe.
  6. **Source data me ek pincode ki kai lines:** import pe ek pincode = ek record, unique.
  7. **Naam ya seema badle:** code wahi, naam ka itihaas rahe; purane orders me address waisa hi jaisa order ke waqt tha.
  8. **Bina mapping wala pincode:** unavailable, aur Admin ko "bina mapping wale pincodes" ki list.
  9. **Jaanch kab:** serviceability ki jaanch order banate waqt usi transaction me, sirf cart dikhate waqt nahi.
  10. **Pending me returns bhi:** return pickup aur refund poore hone tak jagah poori OFF na ho.
- **Wajah:** owner ne cases poochhe aur niyam Claude pe chhode.
- **Chhode vikalp:** naam se mapping; ek pincode ke kai hub.
- **Kab dobara khulega:** asli location data dekh ke (kitne pincodes phaile hain), ya owner khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-017. Roles

- **Faisla:** roles ki poori list design me; system me har role tab chalu jab uska module bane, usi badlav me uski permissions. Ginti fix nahi (abhi ki soch ~80), zaroorat pe badh sakti hai; Master bina deploy ke sub-role jod sakta hai.
  - **Owner ke accounts:** har role ka alag account, 2 base emails ke `+` alias se: ek authenticator wale 7 apps ke roles ke liye, ek baaki (Customer, Seller, Delivery, Creator) ke liye. Bantwara sirf suvidha, niyam nahi: jahan zaroori ho authenticator lagega (jaise Seller Account Owner, Seller Finance).
  - **`+` alias:** normalise nahi hoga; email validation pe code comment ki kyun, aur ki owner ke accounts isi pe tike hain.
- **Wajah:** owner: jinko authenticator ki zaroorat nahi, unhe har login pe authenticator na chalana pade; roles 80 hi honge, ye fix nahi.
- **Chhode vikalp:** saare roles abhi system me; roles kam karna (12 se 15).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani (roles); Owner (accounts, alias).

### D-018. Faislon ki process

- **Faisla:** har bada faisla is file ke format me (§0). Is file me purana faisla mitta nahi, "badla" line judti hai. Sawal-jawab ki files (jaise [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md)) me sirf aakhri faisla.
- **Wajah:** owner ne Claude ki salah maani: faisle soch-samajh ke, saboot aur vikalpon ke saath.
- **Chhode vikalp:** faisle bina wajah aur vikalp ke likhna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-019. Docs ka tareeka

- **Faisla:** docs chhote aur faislon ke record ke saath; har baat sirf ek jagah, baaki jagah link; "bana hai" sirf code ya test ki link se; ek index file ([README.md](README.md)). CI me ek check jo docs me likhe file paths repo me hon ye dekhe.
- **Wajah:** owner ne Claude ki salah maani: bade docs code se alag ho jaate hain aur ek baat kai jagah likhi hoti hai.
- **Chhode vikalp:** bade docs hi update karte rehna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-020. Guest cart nahi

- **Faisla:** cart aur wishlist ke liye sign-in zaroori.
  - Bina sign-in: products aur product page, search aur filter, reviews padhna, pincode pe delivery check.
  - Sign-in zaroori: cart, wishlist, checkout aur payment, review likhna, orders aur account.
- **Wajah:** owner: storage aur kaam kam karne ke liye.
- **Chhode vikalp:** server pe anonymous cart (Claude ki salah).
- **Kab dobara khulega:** sirf owner khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah nahi maani (guest cart); Salah maani (bina sign-in ki list).

### D-021. Customer sign-in

- **Faisla:** customer app me teen raaste, customer khud chune: password, social (Google, LinkedIn, GitHub), aur email code. Email code se sign-in sirf customer app me; authenticator laga ho to email code ke baad bhi maanga jaye (security review me pakka).
- **Wajah:** owner ne Claude ki salah maani: consumer storefront pe lamba password rukawat hai.
- **Chhode vikalp:** sirf password + social; sirf email code + social.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-022. Location ka kaam kitna aur kis order me

- **Faisla:**
  - Poore India ka location data import; shak wale pincodes ki jaanch sirf live hone wale district ki.
  - D-015 ke switches aur live; teen sharten code ke niyam (generic checklist engine baad me).
  - Area settings sirf checkout aur delivery promise ki keys (sub-district level samet).
  - Network: 1 warehouse, hub, pincode → hub, delivery promise.
  - **Order:** pehle location, phir products. Expand karna (naya hub, warehouse, district, switch, staff, live, sarkari data) app ya import se, code se nahi.
  - **Staff ki list:** kaunse roles kitne, data me, app ke ek page pe, sab hubs ke liye ek; sirf Master badle, audit ke saath.
  - **Staff kam ho jaye to:** Master ko save se pehle dikhe kitne live hubs pe asar; hub chalta rahe, "Delivery Partner 1/2" jaisa nishaan, Admin aur Super Admin ko in-app + email; faisla Admin ka (staff bhare ya hub OFF); OFF hua hub dobara tabhi live jab list poori. District aur state pe bhi yahi.
- **Wajah:** owner ne Claude ki salah maani: ek warehouse aur kuch hubs ke liye poore engine se pehle utna hi jitna zaroori.
- **Chhode vikalp:** sirf pincode → hub table; location ka bada poora engine pehle; staff kam hote hi turant band; purane hubs pe naya niyam na lagana.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-023. Package CLI

- **Faisla:** packages ka CLI wahi kaam karega: create, publish, republish, verify, update-deps. Is pe naya kaam tabhi jab packages publish karne ka plan bane. Teen niyam:
  1. Release ke baad ka sandesh `release` branch ka naam bataye.
  2. Packages ke docs me back-merge `release` → `prerelease` likha ho.
  3. Docs me likha ho ki CLI ke tests (`test:scripts`) ke liye local infra chalu chahiye.
- **Wajah:** owner ne Claude ki salah maani: publish ka plan na ho to CLI pe aur nivesh nahi.
- **Chhode vikalp:** CLI hatana; CLI ko aage badhana.
- **Kab dobara khulega:** jab packages publish karne ka plan bane.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-024. Branches

- **Faisla:** `main` branch hategi. Flow: feature branch → `prerelease` (development) → `release` (production); back-merge `release` → `prerelease` waise hi. GitHub default branch `release`.
- **Kram:** pehle saari jagah `main` ka zikr badle (CI, git skills, `CLAUDE.md`), phir default branch, aakhir me delete; sirf implementation me, owner ke kehne pe. Tab tak `CLAUDE.md` ka git flow hi laagu.
- **Wajah:** owner: `main` branch delete karni hai; ek insaan ke liye teen lambi branches bhaari.
- **Chhode vikalp:** teeno branches rakhna; sirf `main` + feature branches.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-025. Consultation aur Beauty Advisor

- **Faisla:**
  - Skin & Hair Expert aur Beauty Advisor asli staff roles (Support Desk, Support Lead ke neeche).
  - Apna video system nahi: customer ko Google Meet ka dummy link. Link staff daale (sirf `https://meet.google.com/...`); system nakli link nahi banata; demo me DUMMY nishaan. Link email aur in-app se.
  - Flow: request → time tay aur link bheja → consult hua → resolve (cancel aur no-show bhi); har badlav audit me; customer ko haalat dikhe. Dono roles ka ek hi flow.
  - Skin & Hair Expert ke notes health data hain: sirf expert aur zaroori support roles dekhein, pehle customer ki consent (security review me pakka).
  - [COMPLIANCE.md](COMPLIANCE.md) me telemedicine ki ek dummy row.
  - Beauty Advisor ka chat live nahi, message thread: customer sawal bheje, advisor shade aur product links ke saath jawab de.
- **Wajah:** owner: ye ek poora plan hoga; telecommunication ki jhanjhat nahi chahiye.
- **Chhode vikalp:** apna video system; live chat; roles hatana.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (roles, Meet link); Salah maani (flow ke niyam, message thread).

### D-026. Project ka lakshya

- **Faisla:** portfolio aur practice project, par aisa bane ki kal asli business ban sake. Design asli jaisa (data model, compliance ke fields, security); registrations aur kanooni details dummy; scope ka paimana "poora order flow chalta dikhe".
- **Wajah:** owner ne vikalp (b) chuna. Owner pehle hi project ko practice hobby project keh chuke the; (b) usme ye jodta hai ki design asli business jaisa rahe, taaki aage jaana pade to code dobara na likhna pade.
- **Chhode vikalp:** sirf seekhna aur portfolio; asli business launch.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.
- **Asar (Claude):** D-012 (asli users maan ke code) isi ke saath chalta hai. Asli business pe jaana = operations, kanooni registration aur paid plans ka kaam, code rewrite nahi. Iske liye dummy kanooni details (GSTIN, licence numbers, contacts) data ya config me rahen, code me nahi.

### D-027. Stock transport (warehouse aur hub ke beech)

- **Faisla:** warehouse aur hub ke beech maal (dono taraf, returns samet) **kiraye ke transporter** se. Driver ka system me account ya role nahi. Har trip ka record: transporter, gaadi number, driver ka naam aur phone (sirf contact ke liye), seal number, manifest (kaunse bags aur parcels), warehouse pe dispatch scan aur hub pe receive scan (kis staff ne kiya). Transporter ka bill finance me kharche ki entry, trip records se mila ke. Brands apna maal bhejne aur wapas le jaane ke liye apna transport ya courier le sakte hain.
- **Wajah:** owner ne do vikalp diye (apna local staff jiska system me record nahi, ya kiraye ka), saath me kaha ki kharche ka bill banega, aur chunna Claude pe chhoda. Claude ne kiraye ka chuna: (1) bina record ke maal gum ya toot jaaye to zimmedari kisi pe nahi banti, jo D-012 ke khilaaf hai; (2) bill kiraye wale ke saath seedha baithta hai, apne staff ka kharcha salary hota hai; (3) naya role ya app nahi chahiye.
- **Chhode vikalp:** apna local staff, bina record ke.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17 (chunna Claude pe chhoda). **Nishaan:** Salah maani.
- **Aage (Claude):** e-way bill ki zaroorat aur seema jaanchi nahi (compliance ki charcha me).

### D-028. ₹0 aur domain nahi

- **Faisla:** kharcha ₹0, domain nahi.
  - Soye server pe pehle customer ka ~1 minute intezaar chalega.
  - Server GitHub Actions, cron-job aur UptimeRobot se din me baar-baar jagaya jayega, aur apps khule hon tab har kuch minute me.
  - Din ke 300 emails kaafi.
  - Free tier ki seemaon ki handling banti rahegi.
  - Production-grade = code ki quality + chalne ki quality, ₹0 me jitni ho sake (D-012).
- **Wajah:** owner: hobby project hai, to din ke 300 emails kaafi hain; domain nahi chahiye.
- **Chhode vikalp:** kam se kam ek domain (Claude ki salah); mahine ka budget.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah nahi maani.
- **Jokhim (owner ne maana):** domain ke bina emails spam me ja sakte hain, aur har OTP email se hi jaata hai.

## Change log

| Version | Date | Badlav |
| --- | --- | --- |
| v1.0.0 | 2026-11-17 | Khaali file bani. |
| v1.1.1 | 2026-11-17 | §0 likhne ka tareeka, §1 aur §2 bane; pehla faisla D-001 (tech stack, finance ke liye PostgreSQL). |
| v1.1.2 | 2026-11-17 | Sudhaar (owner ne pakda): D-001 me PostgreSQL ka nishaan "Salah maani"; ye Claude ki hi daleel thi. Faisla nahi badla. |
| v1.2.1 | 2026-11-17 | D-002 se D-011 aaye (repo, sab naye sire se, discovery, agents, docs ka dhaancha, Security Architect, releases, capacity, 11 apps, services). |
| v1.2.2 | 2026-11-17 | D-011: owner ne pakka kiya ki har service ka apna cluster; "ek environment ka ek cluster" chhoda. |
| v1.3.1 | 2026-11-17 | D-012 se D-027 aaye (asli users, backup, fulfilment, location, pincode, roles, faislon aur docs ka tareeka, guest cart, customer sign-in, location ka kaam, package CLI, branches, consultation, lakshya, stock transport). |
| v1.3.2 | 2026-11-17 | D-028 aaya (₹0 aur domain nahi). |
