# DECISIONS: Beautinique

> **Status:** v1.4.15 (2026-11-18). Har faisla ek jagah. Sirf wahi "Tay" jo owner ne khud kaha; Claude ki salah faisla nahi. Cheezein ek-ek karke judti hain.

## 0. Kaise likhein

- **§1 Ek nazar me:** har faisla ek line me (Id, faisla, tag, kab).
- **§2 Record:** har faisle ke liye: **Faisla**, **Wajah**, **Chhode vikalp**, **Kab dobara khulega**, **Kisne, kab**, **Nishaan** (`Owner` / `Salah maani` / `Salah nahi maani`), aur zaroorat ho to **Asar (Claude)**.
- **Tag:** `Business`, `Architecture`, `Security` ya `Process`.
- Faisla badle to purani line mitti nahi: nayi line "badla" ke saath judti hai.
- **Number:** D-001, D-002 ... kram se. Ek baar diya number kabhi badalta nahi aur dobara use nahi hota.

## 1. Ek nazar me

| Id    | Faisla                                                                                                                                                               | Tag          | Kab        |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- |
| D-001 | Tech stack tay; finance service ka database PostgreSQL, baaki saari services MongoDB pe.                                                                             | Architecture | 2026-11-17 |
| D-002 | Ek monorepo, tay folder dhaancha; tools aur conventions RULES me.                                                                                                    | Architecture | 2026-11-17 |
| D-003 | Docs aur code naye sire se; pehle ka kaam sirf seekhne ka reference, naye me uska zikr ya link nahi.                                                                 | Process      | 2026-11-17 |
| D-004 | Abhi sirf discovery; plan, task files aur code owner ke agla stage kholne pe.                                                                                        | Process      | 2026-11-17 |
| D-005 | Agents ek ke baad ek; 5-hour limit ~80% pe naya agent nahi.                                                                                                          | Process      | 2026-11-17 |
| D-006 | Docs kai files me: PROJECT_PLAN, har module ka folder `tasks/NN-<module>/`, FLOWS; dhaancha docs index me.                                                           | Process      | 2026-11-17 |
| D-007 | Security Architect zaroori, alag role; security ki do files, faisle aur risks tag ke saath.                                                                          | Security     | 2026-11-17 |
| D-008 | Design aur task files poore ecosystem ki pehle din; banana releases me (R1 = patla par poora order flow); koi feature kata nahi.                                     | Process      | 2026-11-17 |
| D-009 | Capacity: ek insaan, 2 Claude accounts, 30 ghante/hafta, koi deadline nahi.                                                                                          | Process      | 2026-11-17 |
| D-010 | 11 alag apps, har role parivaar ka ek; screens module ke saath judti hain.                                                                                           | Architecture | 2026-11-17 |
| D-011 | Sabki alag services, har service ka apna database aur apna cluster; seema transaction se.                                                                            | Architecture | 2026-11-17 |
| D-012 | Design aur code asli users maan ke (production-grade), halaanki live system sirf owner chalata hai.                                                                  | Architecture | 2026-11-17 |
| D-013 | Backup: ek command se saare databases ka data download aur restore command; files repo ke folder me par git se bahar (4 pehre).                                      | Architecture | 2026-11-17 |
| D-014 | Fulfilment: maal sirf apne warehouse me, delivery sirf apne partners; carrier port; seller khud nahi bhejta; pehle din 1 warehouse + 1 hub.                          | Business     | 2026-11-17 |
| D-015 | Location: India > State > District > Sub-District; har level ka switch; switch aur live alag; sharten sirf live karte waqt.                                          | Business     | 2026-11-17 |
| D-016 | Pincode → theek ek hub (primary sub-district se), 10 cases ke niyam ke saath.                                                                                        | Business     | 2026-11-17 |
| D-017 | Roles ki poori list design me, har role apne module ke saath chalu; ginti fix nahi; owner ke har role ka alag account.                                               | Business     | 2026-11-17 |
| D-018 | Faislon ka record is file ke format me; badalne pe "badla" line; sawal-jawab files me sirf aakhri faisla.                                                            | Process      | 2026-11-17 |
| D-019 | Docs chhote, har baat ek jagah, "bana hai" sirf code ya test ki link se; CI me docs ke paths ka check.                                                               | Process      | 2026-11-17 |
| D-020 | Guest cart aur guest wishlist nahi; bina sign-in sirf dekhna, search, reviews padhna, pincode check.                                                                 | Business     | 2026-11-17 |
| D-021 | Customer ke sign-in ke teen raaste: password, social (Google, LinkedIn, GitHub), email code.                                                                         | Security     | 2026-11-17 |
| D-022 | Location ka kaam sirf utna jitna D-015 ko chahiye; pehle location, phir products; staff ki list data me (sirf Master badle).                                         | Business     | 2026-11-17 |
| D-023 | Package CLI ka kaam wahi (create, publish, republish, verify, update-deps); naya kaam publish ke plan pe; teen chhote niyam.                                         | Process      | 2026-11-17 |
| D-024 | `main` branch hategi; flow `prerelease` → `release`; GitHub default branch `release`.                                                                                | Process      | 2026-11-17 |
| D-025 | Skin & Hair Expert aur Beauty Advisor asli staff roles; video ke liye Google Meet ka dummy link; Beauty Advisor ka message thread (live chat nahi).                  | Business     | 2026-11-17 |
| D-026 | Lakshya: portfolio project, par aisa bane ki kal asli business ban sake; design asli jaisa, registrations aur kanooni details dummy.                                 | Business     | 2026-11-17 |
| D-027 | Warehouse aur hub ke beech maal kiraye ke transporter se; har trip ka record aur transporter ka bill finance me.                                                     | Business     | 2026-11-17 |
| D-028 | Kharcha ₹0, domain nahi; server baar-baar jagaya jayega; production-grade = code + chalne ki quality, ₹0 me jitni ho sake.                                           | Business     | 2026-11-17 |
| D-029 | Sirf beauty aur personal care; koi aur category nahi.                                                                                                                | Business     | 2026-11-17 |
| D-030 | Business model: apna brand + doosre beauty brands seller ban ke, sab ek hi storefront pe.                                                                            | Business     | 2026-11-17 |
| D-031 | Apna brand ek alag (dummy) company ke naam se, seller app ke "house brand" seller account se; koi shortcut nahi.                                                     | Business     | 2026-11-17 |
| D-032 | Sirf brand owners aur authorised distributors bech sakte hain; baaki Beauty Pro Buyer ban ke kharidte hain.                                                          | Business     | 2026-11-17 |
| D-033 | Delivery partners gig partners, apni gaadi ke saath.                                                                                                                 | Business     | 2026-11-17 |
| D-034 | Payments: prepaid online (Razorpay) ya delivery pe UPI QR; cash bilkul nahi.                                                                                         | Business     | 2026-11-17 |
| D-035 | Launch phases me: Pune district → Maharashtra ke baaki districts → baaki states; poora India dekh sake, order sirf served pincodes se.                               | Business     | 2026-11-17 |
| D-036 | Sellers poore India se; jis state ke warehouse me maal, us state ka GSTIN zaroori; onboarding me guide aur checklist.                                                | Business     | 2026-11-17 |
| D-037 | Naya district ya state kholna sirf setting aur operations ka kaam: na code change, na deploy.                                                                        | Architecture | 2026-11-17 |
| D-038 | Customers sirf 18+; sign-up pe age declaration.                                                                                                                      | Business     | 2026-11-17 |
| D-039 | Ratings aur reviews R1 me.                                                                                                                                           | Business     | 2026-11-17 |
| D-040 | Foreign investment ka koi plan nahi.                                                                                                                                 | Business     | 2026-11-17 |
| D-041 | Sirf India, prices INR me; har order ka GST-compliant invoice.                                                                                                       | Business     | 2026-11-17 |
| D-042 | Saare apps fully responsive web; Delivery mobile-first PWA (offline); baaki apps phone pe install ho sakein; native apps nahi.                                       | Architecture | 2026-11-17 |
| D-043 | Drug-classified items kabhi nahi; isliye drug licence ya pharmacist ki zaroorat nahi.                                                                                | Business     | 2026-11-17 |
| D-044 | Head of Operations: Support, Logistics aur Seller Ops ke upar.                                                                                                       | Business     | 2026-11-17 |
| D-045 | Plastic EPR laagu (Beautinique micro ya small enterprise nahi maana; registration dummy).                                                                            | Business     | 2026-11-17 |
| D-046 | Notify-me waitlist rahega; usse agla area kholne ka suggestion, par kholne ka koi fixed order nahi.                                                                  | Business     | 2026-11-17 |
| D-047 | Master ke doosre roles (Trust & Safety Lead, Marketing Head) usi insaan ke alag staff account pe.                                                                    | Security     | 2026-11-17 |
| D-048 | Hosting ₹0: backend Render free, apps Vercel Hobby, MongoDB Atlas M0 (har service ka apna), Redis Render Key Value free.                                             | Architecture | 2026-11-17 |
| D-049 | Render pe bundle mode (saari backend services ek web service me); laptop pe Docker split mode.                                                                       | Architecture | 2026-11-17 |
| D-050 | Har service ka apna database aur DB user; service ke andar modules ki collections module ke prefix ke saath.                                                         | Architecture | 2026-11-17 |
| D-051 | Redis: laptop pe local Valkey, production me Render Key Value sirf internal URL se; laptop, tests aur CI kabhi production Redis se nahi.                             | Architecture | 2026-11-17 |
| D-052 | Har Vercel app `/api/*` ko gateway pe rewrite karti hai (same-origin).                                                                                               | Architecture | 2026-11-17 |
| D-053 | Performance targets sirf tab laagu jab server jaaga ho.                                                                                                              | Architecture | 2026-11-17 |
| D-054 | Roles ka timing: design me saare roles, poore launch tak sab system me; banate waqt har role apne module ke saath chalu.                                             | Business     | 2026-11-17 |
| D-055 | R1 ka scope: ek patla par poora order flow (2 sellers, 1 warehouse + 1 hub, test mode payments, simple return, review, seller ka hisaab); detail PROJECT_PLAN §1 me. | Business     | 2026-11-17 |
| D-056 | Render pe sirf ek free web service (saara backend) aur ek free Key Value; koi doosri web service nahi, preview bhi nahi.                                             | Architecture | 2026-11-18 |
| D-057 | Finance ka PostgreSQL Neon ke free plan pe (expire nahi hota, pause nahi hota).                                                                                      | Architecture | 2026-11-18 |
| D-058 | Saari hosting Singapore region me: Render ki web service, finance ka Neon project aur saare Atlas clusters (AWS Singapore).                                          | Architecture | 2026-11-18 |
| D-059 | Pehle ke system me diye gaye roles ki jaanch nahi; naya system naye sire se (D-003).                                                                                 | Process      | 2026-11-18 |
| D-060 | Warehouse me rakhe maal ka maalik bikne tak brand (seller); hum rakhte, pack karte aur pahunchate hain, aur fees lete hain.                                          | Business     | 2026-11-18 |
| D-061 | Selling price brand (seller) tay karta hai, platform ke 4 niyam ke saath (MRP ki seema, itihaas, bade badlav pe confirm, platform daam nahi badalta).                | Business     | 2026-11-18 |
| D-062 | Expire hone wala, expire hua ya na bika maal: nuksaan brand ka; platform ke 6 niyam (receiving ki seema, bikri band, alert, brand ka chunaav, wapsi, record).        | Business     | 2026-11-18 |
| D-063 | Hamare haath se hue nuksaan ki bharpai: jitna brand ko bikne pe milta (selling price, 30 din ka sabse kam, commission aur fees ghata ke), 5 niyam ke saath.          | Business     | 2026-11-18 |
| D-064 | Alag batches ka alag MRP: site pe agle bhejne wale batch ka MRP, order usi batch se reserve; seller ka ek daam har bikne layak batch ke MRP ke andar (5 niyam).      | Business     | 2026-11-18 |

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
- **Asar (Claude):** finance service ke liye transaction, events, release steps aur idempotency ka PostgreSQL wala roop banana hoga; laptop ka Docker infra, CI aur backup me PostgreSQL judega; provider Neon ka free plan (D-057).

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
- **Asar (Claude):** naya service banane wala generator har service me uska apna MongoDB URI jode, aur finance ke liye PostgreSQL ka option de (D-001).

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
  - Seller khud nahi bhejta. Brand maal warehouse bhejta hai; batch aur expiry ki jaanch ek hi jagah: warehouse me receiving pe.
  - Return pickup bhi apne delivery partners karte hain.
  - Pehle din 1 warehouse + **sirf 1 hub** (warehouse wale sub-district me, warehouse ke paas); delivery usi sub-district ke saare pincodes tak; baaki hubs baad me ek click se.
- **Wajah:** owner: pehle din poora district nahi, ek-ek hub se shuru.
- **Chhode vikalp:** pehle din poora district (21 hubs); pehle din 2 hub (warehouse wala aur ek alag sub-district ka); seller khud bheje.
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

### D-029. Product category

- **Faisla:** sirf beauty aur personal care. Koi aur category nahi aayegi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** doosri categories.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-030. Business model

- **Faisla:** Beautinique apne brand ke products bechega, aur doosre beauty brands seller ban ke bechenge. Sab kuch ek hi storefront pe. Har product ka ek seller, aur customer invoice us seller ke GSTIN se.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** sirf apna maal (1P inventory); sirf doosre brands (pure marketplace).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-031. Apna brand

- **Faisla:** apna brand ek **alag (dummy) company ke naam se** seller banega. Wo seller app me ek "house brand" seller account se chalega, jise Own-Brand Manager sambhalega. Iske products bhi baaki brands ki tarah hi check honge. Koi shortcut nahi, Master ke liye bhi nahi.
- **Wajah:** owner ne alag company chuni (2026-11-17). Claude ki daleel: platform company khud seller ho to har jagah special case banta (khud pe TCS nahi, settlement ki jagah andar ka transfer, apne brand ko aage dikhane ke sawal); alag company ke saath apna brand bhi baaki sellers jaisa ek hi raasta.
- **Chhode vikalp:** platform company khud apne brand ki seller.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (house brand account, koi shortcut nahi); Salah maani (alag company).

### D-032. Kaun bech sakta hai

- **Faisla:** sirf brand owners aur authorised distributors. Clinic, salon, spa, freelancer, home-based aur individual bech nahi sakte; wo Beauty Pro Buyer ban ke kharid sakte hain.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** koi bhi seller ban sake.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-033. Delivery partners

- **Faisla:** delivery partners gig partners honge (payroll employee nahi), aur apni gaadi chalayenge.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** payroll employees; company ki gaadiyan.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-034. Payments

- **Faisla:** prepaid online (Razorpay), ya delivery ke waqt UPI QR. Cash bilkul nahi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** cash on delivery.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-035. Launch coverage

- **Faisla:** launch phases me:
  1. Pune district, Maharashtra.
  2. Maharashtra ke baaki districts, ek-ek karke.
  3. Phir baaki states isi tarah: pehle sabse bada district, phir baaki.
  - Poore India ke customers products dekh sakte hain, par order sirf served pincodes se hoga.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** pehle din poora India.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-036. Sellers ki location

- **Faisla:** poore India ke brands jud sakte hain, kyunki unka stock hamare warehouse me aata hai. Shart: jis state ke warehouse me unka stock rahega, us state ka GST registration unke paas hona chahiye; Pune launch ke liye Maharashtra GSTIN. Jinke paas nahi, wo registration lenge, aur seller onboarding me iski step-by-step guide aur checklist milegi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** sirf usi state ke sellers jahan warehouse hai.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.
- **Asar (Claude):** naya state khulne pe (D-015) us state ke warehouse me sirf unhi brands ka maal jaa sakta hai jinke paas us state ka GSTIN ho; yaani ek product kisi state me mile aur kisi me nahi. Ye data aur jaanch ka niyam hai; registrations dummy.

### D-037. Expansion sirf configuration se

- **Faisla:** naya district ya state jodna ekdum simple: sirf admin setting aur operations ka kaam (warehouse ya hub, delivery partners, GST registration). Na code change, na deploy.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** har naye area ke liye code ya deploy.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-038. Customers ki umar

- **Faisla:** launch pe sirf 18+ customers. Sign-up pe age declaration lenge.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** umar ki koi shart nahi.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-039. Reviews

- **Faisla:** ratings aur reviews pehli release (R1, D-008) me honge.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** reviews baad ki release me.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-040. Foreign investment

- **Faisla:** foreign investment ka koi plan nahi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** foreign investment lena.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-041. Market aur tax

- **Faisla:** sirf India, prices INR me. Har order ka GST-compliant invoice.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** India ke bahar bechna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-042. Platform type

- **Faisla:** fully responsive web apps (mobile, tablet, desktop). Delivery app mobile-first PWA: phone pe install ho sake aur kamzor network me bhi chale. Baaki saare apps bhi phone pe app ki tarah install ho sakein (home screen icon, browser bar ke bina); offline sirf Delivery. Native mobile apps scope me nahi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** native mobile apps.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-043. Drug items

- **Faisla:** drug-classified items kabhi nahi bechenge (jaise minoxidil, medicated creams). Isliye drug licence ya pharmacist ki zaroorat nahi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** drug licence ke saath aise items bechna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-044. Head of Operations

- **Faisla:** Support, Logistics aur Seller Ops ke upar ek Head of Operations hoga (Master app me).
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** teeno seedhe Master ko report karein.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-045. Plastic EPR

- **Faisla:** maan ke chalenge ki Beautinique micro ya small enterprise nahi hai, isliye plastic EPR laagu (dummy registration).
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** micro ya small enterprise maan ke EPR chhodna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-046. Notify-me waitlist

- **Faisla:** jis pincode pe delivery nahi, wahan ka customer notify-me waitlist me jud sakta hai. Waitlist se agla district ya state kholne ka suggestion milta hai, par kholne ka koi fixed order nahi: D-015 ke haq wala level use kabhi bhi khol sakta hai (Master kisi bhi district ya state ko seedha bhi). Kholne ki sharten D-015 wali hi.
- **Wajah:** owner ne rakha (2026-11-17).
- **Chhode vikalp:** waitlist nahi.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-047. Master ke doosre roles

- **Faisla:** Master ke doosre launch roles (Trust & Safety Lead, Marketing Head) ek alag staff account pe, usi insaan ke liye.
- **Wajah:** Master ke paas kisi kaam ka faisla lene ka haq nahi (seller, listing, appeal, ban appeal, risk rules), wo sirf doosra signature deta hai. Trust & Safety Lead ban appeals tay karta aur risk rules approve karta hai, isliye ye kaam alag account pe. Audit me owner aur operator alag dikhte hain.
- **Chhode vikalp:** Master ke account pe hi ye roles.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-048. Hosting (₹0)

- **Faisla:** kharcha ₹0 (D-028):
  - Backend: Render ki free web service.
  - Apps: Vercel Hobby.
  - MongoDB: Atlas M0, har MongoDB service ka apna cluster (D-011).
  - Redis: Render Key Value free (D-051).
  - Finance ka PostgreSQL (D-001): Neon ka free plan (D-057, 2026-11-18).
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** paid plans.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-049. Render pe bundle mode

- **Faisla:** Render pe bundle mode: saari backend services ek free web service me chalti hain. Laptop pe Docker split mode (har service alag).
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** har service ki alag web service (₹0 me nahi hota).
- **Kab dobara khulega:** owner khud khole, ya ek 512 MB process saari services na sambhal sake (D-011).
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-050. Database aur collections

- **Faisla:** har service ka apna database aur apna DB user (D-011). Ek service ke andar kai modules hon to unki collections module ke prefix ke saath.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** saari services ka ek database.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-051. Redis

- **Faisla:** development me local Redis (Docker Valkey, Render jaisi limits ke saath). Production me Render Key Value (Redis-compatible; free: 25 MB, 50 connections, disk pe save nahi). Sab `REDIS_URL` setting se. Production Redis sirf internal URL se (bahar se band); laptop, tests aur CI kabhi production Redis se nahi judte.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** paid Redis.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-052. Apps se backend tak

- **Faisla:** har Vercel app `/api/*` ko Render pe chal rahe gateway pe rewrite karti hai, taaki app aur API ek hi origin pe dikhein (domain nahi, D-028).
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** browser seedha backend ko bulaye (alag origin).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-053. Performance targets

- **Faisla:** performance targets sirf tab laagu jab server jaaga ho.
- **Wajah:** free tier me CPU aur RAM kam hai, aur soya server pehli request pe der se uthta hai (D-028).
- **Chhode vikalp:** har haal me targets.
- **Kab dobara khulega:** jab paid hosting aaye, ya owner khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-054. Roles ka timing

- **Faisla:** design me saare roles. Poore launch tak saare roles system me honge; koi role "baad me" ke liye nahi chhoda. Banate waqt har role apne module ke saath chalu hota hai, usi badlav me uski permissions (D-017). Shuru me ek insaan kai roles sambhal sakta hai (har role ka alag account, D-017).
- **Wajah:** owner ne 2026-11-17 ko pakka kiya ki "saare roles launch tak" aur "har role apne module ke saath" dono ek saath sahi hain.
- **Chhode vikalp:** saare roles abhi, module ke bina, system me; kuch roles launch ke baad.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (saare roles launch tak); Salah maani (dono ka mel).

### D-055. R1 ka scope

- **Faisla:** R1 = pehla poora order: area khulna → seller → product → maal warehouse me → order → payment → delivery → return aur refund → review → seller ka hisaab. Andar aur bahar ki poori list [PROJECT_PLAN.md](PROJECT_PLAN.md) §1 me (ek hi jagah). Saar: 2 sellers (apna brand aur ek dummy brand), 1 warehouse + 1 hub, Razorpay test mode aur UPI QR, simple return, verified review, finance me seller ka hisaab aur haath se payout. Promotions, loyalty, try-on, support desk aur baaki R2 aur aage.
- **Wajah:** owner ne R1 ka scope Claude pe chhoda. Claude ki daleel: R1 me marketplace ka har zaroori hissa ek baar shuru se aakhir tak chalna chahiye, khaas kar do sellers se ek order ke do invoice aur seller ka hisaab; warna business model (D-030, D-031) parkha hi nahi jaata. Baaki features bina iske bhi baad me jud sakte hain.
- **Chhode vikalp:** sirf apna brand (ek seller); seller ka hisaab R2 me; promotions R1 me.
- **Kab dobara khulega:** domain charcha (agent 2) ke baad (Claude), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-17 (chunna Claude pe chhoda; owner ne list dekh ke pakki ki). **Nishaan:** Salah maani.

### D-056. Render pe sirf ek web service

- **Faisla:** Render pe sirf do cheezein: ek free web service, jisme saara backend bundle mode me chalta hai (D-049), aur ek free Key Value (D-051). Koi doosri web service nahi, preview ya test ke liye bhi nahi.
- **Wajah:** owner (2026-11-18): koi doosri service nahi aayegi. Isse 750 free ghante sirf ek service me jaate hain, aur wo 24 ghante jaagi rahe to bhi mahine me fit (R-008).
- **Chhode vikalp:** har service ya preview ki alag free web service.
- **Kab dobara khulega:** owner khud khole, ya paid hosting aaye.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Owner.

### D-057. Finance ka PostgreSQL: Neon

- **Faisla:** finance service ka PostgreSQL (D-001) Neon ke free plan pe, ek Neon project me.
- **Wajah:** Neon ka free plan expire nahi hota, aur kaam na ho to bhi project na pause hota na delete; soya compute agli query pe khud jaagta hai. Owner (2026-11-18): use kam hoga (project banate waqt, aur baad me kabhi-kabhi interviews me dikhane ke liye), isliye mahine ke 100 CU-ghante kaafi.
- **Chhode vikalp:** Render ka free PostgreSQL (30 din me expire); Supabase (7 din bina kaam ke pause, haath se kholna); Aiven (idle pe band); finance bhi MongoDB pe.
- **Kab dobara khulega:** Neon ke free niyam badlein, use badhe, ya owner khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** code asli users maan ke banega (D-012), isliye design me finance database se sirf kaam aane pe baat ho; server jagane ke ping aur health check finance database tak na pahunchein; compute ka size 0.25 CU pe roka jaye. Ye niyam finance ki technical charcha me pakke honge. Neon ka Singapore region (`aws-ap-southeast-1`) hai (jaancha 2026-11-18); project usi me banana, kyunki region baad me nahi badalta, aur backend bhi Render ke Singapore region me (R-012).

### D-058. Hosting ka region: Singapore

- **Faisla:** Render ki web service (D-056), finance ka Neon project (D-057) aur MongoDB ke saare Atlas clusters (D-011) AWS Singapore region me banenge.
- **Wajah:** Render me India ka region nahi; Singapore sabse paas hai. Database server ke paas hona chahiye, user ke paas nahi, kyunki database se sirf server baat karta hai; teeno ek region me to har query tez. Render, Neon aur Atlas teeno me Singapore jaancha (RISKS §2.4). Owner ne Singapore chuna (2026-11-18).
- **Chhode vikalp:** Atlas Mumbai me (server se door, har query Singapore se Mumbai aur wapas); Render ka koi aur region.
- **Kab dobara khulega:** Render ya kisi provider me India ka region aaye, ya owner khole. Teeno ka region banne ke baad nahi badalta, isliye badalna = naya banana aur data le jaana.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** apps Vercel pe hain (D-048); customer app ke server-side hisse ka Vercel region (backend ke paas Singapore, ya users ke paas) technical charcha me tay hoga.

### D-059. Pehle diye gaye roles ki jaanch nahi

- **Faisla:** pehle ke system me jo roles diye ja chuke the, unki jaanch nahi hogi.
- **Wajah:** Claude ki salah: naya system naye sire se banega (D-003), isliye pehle diye gaye roles ka uspe koi asar nahi; naye system me har role apne module ke saath chalu hoga (D-017, D-054). Owner ne maani.
- **Chhode vikalp:** roles chalu karne se pehle, pehle ke system me diye gaye roles dekhna.
- **Kab dobara khulega:** pehle ke system se koi data naye system me laana tay ho, ya owner khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.

### D-060. Warehouse me rakhe maal ka maalik

- **Faisla:** brands ka jo maal hamare warehouse me rakha hai (D-014), bikne tak uska maalik wahi brand (seller) hai. Beautinique maal nahi khareedta: hum sirf rakhte, pack karte aur customer tak pahunchate hain, aur iske liye fees lete hain. Apna brand bhi isi tarah, kyunki wo alag company ka seller hai (D-031).
- **Wajah:** Claude ki salah, owner ne maani: customer ka invoice seller ke GSTIN se banta hai (D-030), aur jo maal ka maalik nahi wo uska invoice nahi kaat sakta; warehouse wale state ka GSTIN brand ke paas hone ki shart (D-036) bhi isi pe tiki hai. Har cheez ka ek hi raasta: har batch pe uske seller ka record, har bikri ka invoice usi seller ka.
- **Chhode vikalp:** Beautinique maal khareed le (customer invoice Beautinique ka, D-030 se takrav); dono tarah (kuch brands ka maal hamara, kuch ka unka).
- **Kab dobara khulega:** Beautinique khud maal khareed ke bechna chahe, ya owner khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** stock ke har batch pe uske seller ka record; seller ko apne maal ki ginti dikhe; warehouse me hamare haath se hua nuksaan (toot-foot, chori, galat dispatch) hamari zimmedari, jiski bharpai ka daam alag sawal hai. Kanooni detail jaanchi nahi (R-004).

### D-061. Selling price kaun tay kare

- **Faisla:** customer ko dikhne wala selling price brand (seller) tay karta hai. Platform ye 4 niyam laagu karta hai:
  1. Daam 0 se zyada, aur pack pe chhape MRP (saare tax samet) se zyada nahi.
  2. Har badlav ka itihaas: kisne, kab, purana daam, naya daam.
  3. Ek baar me bada badlav (jaise 50% se zyada upar ya neeche) pe seller se dobara confirm, taaki ₹1,999 ki jagah ₹199 jaisi galti pakdi jaye.
  4. Platform seller ka daam kabhi nahi badalta; platform ka diya discount (R2, D-055) alag dikhta hai.
- **Wajah:** Claude ki salah, owner ne maani: maal aur invoice dono brand ke (D-060, D-030), isliye daam bhi bechne wale ka; niyam 1 se 3 customer aur seller dono ko galti se bachate hain.
- **Chhode vikalp:** brand poori tarah azaad (sirf MRP ki seema, koi itihaas ya confirm nahi); Beautinique daam tay kare (invoice brand ka par daam hamara).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** bade badlav ka asli number pricing ki charcha (B4) me tay hoga. Do alag sawal baaki: ek product ke alag batches ka MRP alag ho to customer ko kaunsa MRP aur daam dikhe; aur Beauty Pro buyers (D-032) ke liye alag daam ho ya nahi. Kanooni detail jaanchi nahi (R-004).

### D-062. Expire hone wala ya na bika maal

- **Faisla:** warehouse me brand ka jo maal expire hone wala hai, expire ho gaya, ya nahi bik raha, uska nuksaan brand ka hai. Platform ye 6 niyam laagu karta hai:
  1. **Receiving pe:** batch ki bachi expiry ek kam se kam seema se kam ho to maal wapas.
  2. **Bikri band:** bachi expiry ek seema se kam hote hi wo batch bikna band, taaki customer ko kam se kam itni expiry mile. Pick me sabse pehle expire hone wala batch pehle jaata hai.
  3. **Khabar:** brand ko bikri band hone se pehle alert, aur band hone pe dobara.
  4. **Brand ka chunaav:** bikri band hone ke baad brand tay din me chune: maal apne kharche pe wapas le jaaye, ya hum nasht karein aur disposal fee lein. Tay din me jawab na aaye to hum nasht karte hain aur fee lagti hai.
  5. **Na bika maal (expire nahi):** brand kabhi bhi apne kharche pe wapas maang sakta hai.
  6. **Record:** har wapsi aur har disposal ka record (batch, ginti, tareekh, kisne kiya); disposal kanoon ke hisaab se (dummy, D-026).
- **Wajah:** Claude ki salah, owner ne maani: maal brand ka (D-060), isliye nuksaan bhi; niyam warehouse ko saaf aur customer ko surakshit rakhte hain. Brand chahe to bikri band hone se pehle khud daam ghata sakta hai (D-061 ke niyam ke andar).
- **Chhode vikalp:** brand khud sambhale, platform ke koi niyam nahi (sirf report); nuksaan baant lena (platform kuch hissa uthaye ya khareed le).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** teeno numbers (receiving ki seema, bikri band ki seema, brand ke jawab ke din; misaal 6 mahine, 3 mahine, 15 din) B3 ki charcha me tay honge, category ke hisaab se alag ho sakte hain. Disposal fee aur wapsi ka kharcha seller ke hisaab (B6) me. Do alag sawal baaki: lambe samay se pade na bike maal pe storage fee ho ya nahi; customer ko product page pe expiry dikhe ya nahi. Kanooni detail jaanchi nahi (R-004): label pe expiry ke niyam aur cosmetics nasht karne ke niyam.

### D-063. Hamare haath se hue nuksaan ki bharpai

- **Faisla:** brand ka maal hamari zimmedari me toot jaaye, kho jaaye ya chori ho, to brand ko utni bharpai milti hai jitna use bikne pe milta. Zimmedari receiving pe maal accept hone se customer ko delivery (ya brand ko wapsi) tak: warehouse, warehouse aur hub ke beech ka safar, hub aur delivery partner. Receiving se pehle ka nuksaan aur expiry ka nuksaan (D-062) brand ka. Niyam:
  1. **Daam:** nuksaan ke din ka selling price aur pichhle 30 din ka sabse kam selling price (D-061 ke itihaas se), dono me jo kam ho; usme se hamara commission aur fees ghata ke.
  2. **Record:** har nuksaan ka record: kab, kahan (warehouse, safar, hub, delivery), kisne pakda, batch, ginti; seller ko apne panel me dikhe.
  3. **Bharpai:** seller ke hisaab me credit, record banne ke baad agle payout me. Toota maal nasht, D-062 ke record ke saath.
  4. **Baad me mil gaya:** gum hua maal baad me mile aur bikne layak ho, to bharpai wapas kat-ti hai aur maal phir stock me.
  5. **Seller ka daawa:** seller ki ginti hamari ginti se na mile to wo support se daawa kar sakta hai (B11).
- **Wajah:** Claude ki salah, owner ne maani: brand ki haalat waisi hi jaisi bikne pe hoti; zaroori data pehle se hai (D-061); 30 din ke sabse kam daam se nuksaan se theek pehle daam badha ke zyada bharpai lena kaam nahi karta.
- **Chhode vikalp:** MRP pe (brand ko bikne se bhi zyada, hamara nuksaan bada); brand ka bataya cost (jaanchna mushkil, har batch pe ek aur field).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** 30 din ki khidki aur payout ka cycle settlement ki charcha (B6) me pakke honge. Alag sawal baaki: nuksaan transporter (D-027) ya delivery partner ke haath se hua ho to hum unse vasooli karein ya nahi, aur kaise. Kanooni detail jaanchi nahi (R-004): bharpai pe GST, aur kho gaye maal ka brand ke tax me hisaab.

### D-064. Alag batches ka alag MRP

- **Faisla:** ek product ke alag batches ke pack pe alag MRP ho, to site pe usi batch ka MRP dikhta hai jo agla bhejna hai (D-062 ka kram: sabse pehle expire hone wala pehle), aur order usi batch se reserve hota hai. Niyam:
  1. Seller ka ek hi daam (D-061), jo kisi bhi bikne layak batch ke MRP se zyada nahi ho sakta.
  2. Naya batch aaye aur uska MRP seller ke daam se kam ho, to wo batch tab tak nahi bikta jab tak seller daam na ghataye; seller ko alert. Platform daam khud nahi badalta (D-061 niyam 4).
  3. Customer ne jo MRP dekha, wahi batch jaata hai.
  4. Ek line ki quantity do batches me bate aur MRP alag ho, to checkout pe line do hisson me dikhti hai, har hissa apne MRP ke saath (daam wahi).
  5. Invoice me har line ka batch aur MRP.
- **Wajah:** Claude ki salah, owner ne maani: site pe dikha MRP aur customer ke haath me aaya pack hamesha same, jo online pe pack ki jaankari dikhane ke kanoon ki maang hai; batch ka record (D-062) pehle se ban raha hai, to reservation ko batch tak le jaana chhota kaam hai.
- **Chhode vikalp:** ek MRP, saare batches me sabse kam wala (site aur pack ka MRP kabhi alag); har MRP ki alag listing (customer ke liye confusing, search aur reviews do jagah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** stock aur reservation batch ke level pe; batch badalte hi site ka MRP badalta hai; cart aur checkout me line ka batch-wise hissa (B5). Kanooni detail jaanchi nahi (R-004): online pe pack ki jaankari dikhane ke niyam.

## Change log

| Version | Date       | Badlav                                                                                                                                                                                                                                                                                  |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                                                                                                                                                                                       |
| v1.1.1  | 2026-11-17 | §0 likhne ka tareeka, §1 aur §2 bane; pehla faisla D-001 (tech stack, finance ke liye PostgreSQL).                                                                                                                                                                                      |
| v1.1.2  | 2026-11-17 | Sudhaar (owner ne pakda): D-001 me PostgreSQL ka nishaan "Salah maani"; ye Claude ki hi daleel thi. Faisla nahi badla.                                                                                                                                                                  |
| v1.2.1  | 2026-11-17 | D-002 se D-011 aaye (repo, sab naye sire se, discovery, agents, docs ka dhaancha, Security Architect, releases, capacity, 11 apps, services).                                                                                                                                           |
| v1.2.2  | 2026-11-17 | D-011: owner ne pakka kiya ki har service ka apna cluster; "ek environment ka ek cluster" chhoda.                                                                                                                                                                                       |
| v1.3.1  | 2026-11-17 | D-012 se D-027 aaye (asli users, backup, fulfilment, location, pincode, roles, faislon aur docs ka tareeka, guest cart, customer sign-in, location ka kaam, package CLI, branches, consultation, lakshya, stock transport).                                                             |
| v1.3.2  | 2026-11-17 | D-028 aaya (₹0 aur domain nahi).                                                                                                                                                                                                                                                        |
| v1.4.1  | 2026-11-17 | D-029 se D-053 aaye: product, business model, apna brand (alag company), sellers, payments, launch, customers, reviews, platform, compliance, waitlist, Master ke roles, hosting, Redis, performance. D-014 me jod: receiving pe batch aur expiry, return pickup, pehle din sirf 1 hub. |
| v1.4.2  | 2026-11-17 | D-054 aaya (roles ka timing: dono baatein ek saath).                                                                                                                                                                                                                                    |
| v1.4.3  | 2026-11-17 | D-011 me asar: generator har service ka apna MongoDB URI aur finance ke liye PostgreSQL option de.                                                                                                                                                                                      |
| v1.4.4  | 2026-11-17 | D-055 aaya (R1 ka scope; detail PROJECT_PLAN §1).                                                                                                                                                                                                                                       |
| v1.4.5  | 2026-11-17 | D-055: owner ne R1 ki list dekh ke pakki ki.                                                                                                                                                                                                                                            |
| v1.4.6  | 2026-11-18 | D-056 aaya (Render pe sirf ek web service aur ek Key Value).                                                                                                                                                                                                                            |
| v1.4.7  | 2026-11-18 | D-057 aaya (finance ka PostgreSQL Neon pe); D-001 aur D-048 me provider likha.                                                                                                                                                                                                          |
| v1.4.8  | 2026-11-18 | D-057: Neon ka Singapore region jaancha; project usi me.                                                                                                                                                                                                                                |
| v1.4.9  | 2026-11-18 | D-058 aaya (saari hosting Singapore region me).                                                                                                                                                                                                                                         |
| v1.4.10 | 2026-11-18 | D-059 aaya (pehle diye gaye roles ki jaanch nahi).                                                                                                                                                                                                                                      |
| v1.4.11 | 2026-11-18 | D-060 aaya (warehouse me rakhe maal ka maalik brand; Q-001).                                                                                                                                                                                                                            |
| v1.4.12 | 2026-11-18 | D-061 aaya (selling price brand tay kare, platform ke 4 niyam; Q-002).                                                                                                                                                                                                                  |
| v1.4.13 | 2026-11-18 | D-062 aaya (expire hone wala ya na bika maal: nuksaan brand ka, platform ke 6 niyam; Q-003).                                                                                                                                                                                            |
| v1.4.14 | 2026-11-18 | D-063 aaya (hamare haath se hue nuksaan ki bharpai: bikne wala daam; Q-004).                                                                                                                                                                                                            |
| v1.4.15 | 2026-11-18 | D-064 aaya (alag batches ka alag MRP: batch ke hisaab se; Q-005).                                                                                                                                                                                                                       |
