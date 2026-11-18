# OPEN QUESTIONS: Cosmetics E-Commerce Ecosystem (discovery)

> **Status:** v0.5 (2026-11-17), discovery phase. **Naye docs me jo aa gaya, uspe "[Naye docs me: ...]" ka nishaan hai.** REPOSITORY_ANALYSIS ke Q1 se Q13 ke jawab ([REPOSITORY_ANALYSIS.md](REPOSITORY_ANALYSIS.md) §6) yahan gine gaye: Batch 1 ki halat §1 me, aage ki queue §2 me, jaanchna baaki §3 me. Owner ke saath sawal-jawab ki file. Yahan likhi "Salah" sirf recommendation hai: jab tak owner haan na kahe, kuch tay nahi. Tay hui baatein [DECISION_LOG.md](DECISION_LOG.md) me jaati hain.

## 0. Ye file kaise chalti hai

- Ek waqt me ek sawal; agla tabhi jab owner "next" kahe (owner, 2026-11-17). Batch sirf topic ki grouping hai.
- Owner ka jawab usi sawal ke neeche likha jaata hai; jawab badle to purani line hata ke nayi (itihaas sirf DECISION_LOG me).
- Har sawal me: **Sawal**, **Kyun zaroori**, **Vikalp**, **Salah**, **Trade-off**.
- Status: `Khula` (jawab baaki), `Charcha` (baat chal rahi), `Tay` (DECISION_LOG me gaya), `Roka` (baad me).
- Saboot aur purane project ki critique: [REPOSITORY_ANALYSIS.md](REPOSITORY_ANALYSIS.md) (§6 critique, §9 purane decisions, §10 unknowns).
- Kanooni baatein kisi lawyer se verify nahi hain; jahan kanoon ka zikr hai wahan ye maan ke chalo.

## 1. Batch 1: neev ke sawal

Ye 6 jawab baaki har cheez ki disha tay karte hain. Agle agents (domain expert, Security Architect) ka brief bhi inhi se banega. Agent 2 (Business Analyst + cosmetics domain expert) Batch 1 ke bache jawabon ke baad chalega (owner, 2026-11-17: "Jawab ke baad").

| Sawal                       | Status  | Ab tak                                                                                                                                                                                                                                                                                 |
| --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-001 Lakshya               | Tay     | **[Naye docs me: DECISIONS D-026]** D-028: (b)                                                                                                                                                                                                                                         |
| Q-002 Purane decisions      | Tay     | **[Naye docs me: DECISIONS D-027, D-029 se D-053]** Jo 9 dobara khulne the, unme se 8 tay: 11 apps (D-010), ₹0 aur domain (D-014), stock, delivery aur 21 hubs (D-016), roles (D-019), guest cart (D-022). Business model (Q-005) baaki. Tay: D-029 (har purane faisle pe alag jawab). |
| Q-003 Bana hua code         | Khula   | **[Naye docs me: DECISIONS D-003]** Owner ne 11 apps rakhe (D-010) aur CLI rakha (D-025), par code ke baare me seedha jawab nahi.                                                                                                                                                      |
| Q-004 Releases aur capacity | Tay     | **[Naye docs me: DECISIONS D-008, D-009]** D-008, D-009                                                                                                                                                                                                                                |
| Q-005 Business model        | Charcha | **[Naye docs me: DECISIONS D-014, D-030, D-031]** Stock aur delivery tay (D-016). (c) hybrid (D-029). Bacha: apna brand ki company.                                                                                                                                                    |
| Q-006 Budget                | Tay     | **[Naye docs me: DECISIONS D-028]** D-014 (₹0, domain nahi)                                                                                                                                                                                                                            |

### Saaf karna baaki (D-029 se nikle)

| Sawal                | Kya saaf karna hai                                                                                                                                                    | Status                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Q-005 (bacha hissa)  | **[Naye docs me: DECISIONS D-031]** Apna brand alag (dummy) company ke naam se seller ho, ya platform company khud                                                    | Tay: alag (dummy) company        |
| Q-007                | **[Naye docs me: DECISIONS D-011]** ARCHITECTURE #5 (ek cluster) aur D-011 (har service ka cluster) me kaunsa                                                         | Tay: har service ka apna cluster |
| Q-008                | **[Naye docs me: DECISIONS D-054]** PRD "Roles ka timing" (saare roles launch se system me) aur D-019 (role apne module ke saath chalu) ka mel                        | Tay: dono                        |
| Q-009                | **[Naye docs me: DECISIONS D-014]** Pune pehle din: live sub-district wahi jahan warehouse hai (kul 1 hub), ya alag (kul 2 hubs)                                      | Tay: sirf 1 hub                  |
| Q-010                | **[Naye docs me: DECISIONS D-046]** Purani "Agla district" row ka notify-me waitlist (unserved pincode ke customer ko khabar) rahega ya nahi; D-017 me iska zikr nahi | Tay: waitlist rahega             |
| ARCHITECTURE #9, #10 | **[Naye docs me: DECISIONS D-047, D-053]** Master ke doosre roles alag staff account pe; performance targets sirf jaage server pe                                     | Tay: dono haan                   |

### Q-001. Project ka asli lakshya kya hai?

- **[Naye docs me: DECISIONS D-026]**

- **Sawal:** ye (a) sirf seekhne aur portfolio ka project hai, (b) portfolio hai par aise bane ki kal asli business ban sake, ya (c) asli business launch karna hai?
- **Kyun zaroori:** budget, kanooni kaam (dummy ya asli registration), scope aur "done" ki paribhasha isi se nikalti hai. Purana PRD (a) kehta hai aur saath me "production-grade" bhi, jo aapas me takrata hai (analysis §6 Q4).
- **Vikalp:** (a), (b), (c) jaise upar.
- **Salah:** **(b)**. Design asli jaisa (data model, compliance ke fields, security), registrations aur kanooni details dummy, aur scope ka faisla "poora order flow chalta dikhe" se.
- **Trade-off:** (b) me compliance ke design ka kharcha aata hai jo demo me kabhi "use" nahi hota. Badle me (c) pe jaana rewrite nahi maangta. (a) me shortcuts portfolio ki keemat ghata dete hain; (c) ke liye lawyer, paisa aur asli operations chahiye, jo architecture tay nahi kar sakta.
- **Owner ka jawab (2026-11-17):** **(b)**. Record: [DECISION_LOG.md](DECISION_LOG.md) D-028.

### Q-002. Purane decisions ka darja kya hai?

- **[Naye docs me: DECISIONS D-027, D-029 se D-053]**

- **Sawal:** purane PRD §2 (27 decisions) aur ARCHITECTURE §2 (10 decisions) ko kaise maana jaye?
- **Kyun zaroori:** "existing sirf reference hai" ka matlab saaf hona chahiye, warna ya to 30 sawal dobara poochhne padenge ya kamzor faisle chupchaap saath aa jayenge.
- **Vikalp:** (a) sab mita ke khaali panne se; (b) purane decisions "default" rahen, par jin pe critique hai wo khul ke dobara discuss hon; (c) sab pakke.
- **Salah:** **(b)**. Dobara khulne wale 9: business model; saara stock sirf apne warehouse me; delivery sirf apni; 11 alag apps; saare roles launch pe; pehle din poora Pune district (21 hubs); kharcha ₹0; domain nahi; guest cart nahi. "Dobara confirm" wali list analysis §9 me hai. Baaki default.
- **Trade-off:** (a) saaf hai par pehle se ki hui soch barbaad hoti hai; (c) me jaani hui kamzoriyan reh jaati hain; (b) me har purane faisle pe ek nazar ka kaam hai.
- **Owner ka jawab (2026-11-17):** **(b)**, har purane faisle pe alag jawab ke saath. Record: [DECISION_LOG.md](DECISION_LOG.md) D-029, D-030.

### Q-003. Jo code ban chuka hai uska kya?

- **[Naye docs me: DECISIONS D-003]**

- **Sawal:** identity, gateway, notify (email), RBAC engine, audit, outbox, kernel packages aur design system (project ka ~24%) rakhna hai ya dobara likhna hai?
- **Kyun zaroori:** "stack aur structure wahi" tay hai, par ye tay nahi ki bana hua code neev rahega ya sirf namuna.
- **Vikalp:** (a) code rakho, uske upar commerce banao; sirf requirements aur plan naye; (b) kernel packages rakho, par deployables ki banawat dobara dekho; (c) sab dobara likho.
- **Salah:** **(a)**. Neev code me jaanch ke mazboot mili (contracts-first routes, transactions, outbox, authz, sessions, audit). (b) ke do sawal baad ke technical batch me: payments alag process ho ya module, aur role catalogue ka size.
- **Trade-off:** purani neev ke kuch faisle saath aate hain (ek process me chalte "microservices", grants ki copy). (c) se koi business value nahi milti.

### Q-004. "Sab kuch launch pe", ya releases me? Aur capacity kitni hai?

- **[Naye docs me: DECISIONS D-008, D-009]**

- **Sawal:** (i) 11 apps, ~80 roles aur ~23 modules sab ek saath chahiye, ya design poora ho aur banana releases me? (ii) Asal me kitne log kaam kar rahe hain, hafte me kitne ghante, aur koi target date hai?
- **Kyun zaroori:** 30 din aur 527 commits ke baad ek bhi product, cart ya order nahi hai; saare 44 routes auth aur platform ke hain. Capacity ke bina koi roadmap sach nahi hota.
- **Vikalp:** (a) sab launch pe (jaisa hai); (b) design poore ecosystem ka, banana releases me: R1 = catalog → cart → checkout → payment → fulfilment → delivery → return ka patla par poora flow, phir R2, R3; (c) scope hi chhota (features kaat do).
- **Salah:** **(b)**. "Baad me bhool jayenge" ka dar task files se sambhalta hai: har module ki file pehle din banegi, sirf banne ka order alag hoga. Ye CLAUDE.md ke "kuch bhi baad me nahi" niyam ko chhuta hai, isliye owner ka saaf faisla chahiye.
- **Trade-off:** releases me thoda rework (R1 ka model R2 me badal sakta hai). (a) me rework nahi, par bahut der tak kuch chalta nahi dikhta aur koi business assumption parkha nahi jaata.

### Q-005. Business model: maal ka maalik kaun, aur customer ke invoice pe seller kaun?

- **[Naye docs me: DECISIONS D-014, D-030, D-031]**

- **Sawal:** D-016 se itna tay hai ki har brand ka maal hamare warehouse me rahega aur delivery hum karenge. Baaki ye hai:
  - **(a) 1P (inventory):** Beautinique brands se maal khareedta hai; maalik Beautinique, customer ka invoice Beautinique ka.
  - **(b) Marketplace + hamari fulfilment:** maal brand ka hi rehta hai, sirf hamare warehouse me rakha; invoice brand (seller) ka; hum commission aur fees lete hain, paisa collect karke brand ko settle karte hain.
  - **(c) Hybrid:** (b) + apna brand bhi ek seller (purana faisla).
- **Kyun zaroori:** isi se tay hota hai seller app ka kaam, finance service (D-012) me kya hai, invoice aur GST, brand onboarding, price kaun tay kare, aur expire ya na bika maal kiska nuksaan.

|                       | (a) 1P                                        | (b) Marketplace                                               | (c) Hybrid                        |
| --------------------- | --------------------------------------------- | ------------------------------------------------------------- | --------------------------------- |
| Maal ka maalik        | Beautinique                                   | Brand                                                         | Brand; apna brand: apni company   |
| Customer ka invoice   | Beautinique                                   | Brand ke GSTIN se                                             | Har product ke seller ke GSTIN se |
| Price kaun tay kare   | Beautinique                                   | Brand                                                         | Brand (apna brand: apni team)     |
| Seller app            | Vendor portal: PO, maal bhejna, payment       | Poora: listing, price, stock, settlement, reports             | (b) jaisa                         |
| Finance               | Khareed, vendor payment, margin               | Commission, fees, GST TCS, income-tax TDS, settlement, payout | (b) + apne brand ka hisaab        |
| Brand ki GST shart    | Naya registration nahi (wo hamein bechta hai) | Jis state ke warehouse me maal, us state ka GSTIN             | (b) jaisa                         |
| Expire / na bika maal | Hamara nuksaan                                | Brand ka (wapas le jaaye ya disposal fee)                     | (b) jaisa                         |

- **Salah:** **(c)**, ek sharat ke saath: apna brand ek **alag (dummy) company** ke naam se seller ho, platform wali company khud nahi, aur baaki sellers ki tarah hi onboard ho (purana "koi shortcut nahi" niyam).
  - D-010 ke seller aur finance apps aur D-012 ka ledger marketplace me hi poora kaam aate hain; 1P me seller app sirf vendor portal reh jaata hai.
  - Ek hi raasta: har product ka ek seller, har customer invoice ek seller ke GSTIN se; platform sirf apne commission / fee ke invoice sellers ko deta hai. Apna brand koi special case nahi.
  - Cosmetics me expiry asli jokhim hai. (b) / (c) me wo brand ka hai, aur uska flow (removal, disposal) design me aata hai.
  - Alag company kyun: platform company khud seller ho to har jagah special case banta hai (khud pe TCS nahi, settlement ki jagah andar ka transfer, apne brand ko aage dikhane ke sawal).
  - Kanooni detail (TCS / TDS ke niyam aur dar, related-party seller) jaanchi nahi.
- **Trade-off:** (c) me finance sabse bada (settlement, TCS / TDS, commission invoices, seller ledger, payouts). Naya state kholne pe (D-017) har brand ko us state ka GSTIN chahiye; tab tak uska maal us state ke warehouse me nahi jaa sakta, yaani ek product kisi state me mile aur kisi me nahi (design me data + jaanch; registrations dummy). (a) me finance aur onboarding lagbhag aadha, par seller side ka ecosystem chala jaata hai aur expiry ka nuksaan hamara.
- **Owner ka jawab (2026-11-17):** **(c)**, PRD §2 ke "Business model" aur "Apna brand" rows waise hi rakh ke. Record: [DECISION_LOG.md](DECISION_LOG.md) D-029. Bacha: apna brand alag company ke naam se ya platform company khud.
- **Iske baad (alag sawal):** R1 me kaunse sellers: sirf apna brand, ya ek dummy brand bhi, taaki ek order ke do seller invoice parkhe jaayein.

### Q-006. Infra ka budget kitna hai?

- **[Naye docs me: DECISIONS D-028]**

- **Sawal:** (a) ₹0 hi; (b) sirf domain (andaza ~₹1,000 saal); (c) chhota mahine ka budget (purane docs ka andaza ~$72 se 79 mahina) jisme server jaagta rahe, backup aur staging ho?
- **Kyun zaroori:** purane docs ke apne numbers: server 15 min me so jaata hai, cold start 42 se 57 s, Redis 25 MB bina persistence, DB ka backup nahi, 300 emails/din, staging nahi. Code ka bada hissa sirf free tier ko sambhalne ke liye hai. Reservation expiry aur payment webhook sote server pe bharose layak nahi.
- **Vikalp:** (a), (b), (c) jaise upar.
- **Salah:** **abhi kam se kam (b)** (email deliverability, canonical URL, saaf cookies). (c) ka faisla tab jab pehla order flow chalne lage. "Production-grade" do hisson me likha jaye: code quality (abhi se) aur operations (budget ke saath).
- **Trade-off:** ₹0 me accidental complexity aur demo me cold start. Budget me ek non-commercial project pe har mahine ka kharcha.

### Q-007. Database: ek cluster, ya har service ka apna cluster?

- **[Naye docs me: DECISIONS D-011]** Owner ka jawab (2026-11-17): **(a)**, har service ka apna cluster.

- **Sawal:** ARCHITECTURE §2 #5 ("har environment ka 1 Atlas cluster") aapne waise hi rakha, par D-011 me tay hua tha ki har service ka apna cluster hoga. Dono ek saath nahi chal sakte. Kaunsa rahe?
- **Kyun zaroori:** isi se storage (har cluster 512 MB), connection settings, backup command (D-015) aur Atlas free tier ka hisaab tay hota hai.
- **Vikalp:**
  - **(a) D-011 rahe:** har MongoDB service ka apna Atlas cluster (alag Atlas project, alag DB user). #5 ka baaki hissa (apna database, apna DB user, module-prefixed collections) har cluster ke andar waise hi.
  - **(b) #5 rahe:** ek environment ka ek cluster, har service ka alag database aur DB user. D-011 ka "apna cluster" hissa badlega.
- **Salah:** **(a)**. D-011 ki wajah (512 MB kaafi nahi) isi se poori hoti hai, aur ek service ka bojh doosri ko nahi rokta. Laptop pe ek hi Docker Mongo rahe, har service ka alag database: sirf `<NAME>__MONGO_URI` badalta hai, code nahi.
- **Trade-off:** (a) me 8 clusters sambhalne (8 Atlas projects, 8 connection strings), backup 8 jagah se, aur Atlas ka "ek project me ek free cluster" niyam abhi jaancha nahi (R-006). (b) me sab ek jagah aur saral, par 512 MB aur 100 ops/s saari services me saajha.

## 2. Aage ki queue (abhi sirf topics; sawal agents ke baad likhe jayenge)

| Batch | Topic                                                                                                                                       | Kaun gehrai me jayega                | Ab tak (2026-11-17)                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B2    | **[Naye docs me: OPEN_QUESTIONS B1]** Fulfilment aur logistics: apna warehouse / fleet, courier, launch ka area                             | Domain expert                        | Zyadatar tay: D-016, D-017, D-018, D-024. Baaki: hub staff ki list me kya missing; asli data se ginti ki kitne pincodes do sub-districts / districts / states me phaile; main city ke pincode kis hub pe.                                               |
| B3    | **[Naye docs me: OPEN_QUESTIONS B2]** Apps aur roles: 11 apps ya kam, launch pe kaunse roles asli                                           | Architect                            | Tay: D-010, D-019. Baaki: live system me jo roles diye ja chuke, unhe dekhna.                                                                                                                                                                           |
| B4    | **[Naye docs me: OPEN_QUESTIONS B3]** Catalog: variant / shade / size, ingredients, batch aur expiry, content ka maalik                     | Domain expert                        | —                                                                                                                                                                                                                                                       |
| B5    | **[Naye docs me: OPEN_QUESTIONS B4]** Pricing, promotions, bundles aur kits                                                                 | Domain expert                        | —                                                                                                                                                                                                                                                       |
| B6    | **[Naye docs me: OPEN_QUESTIONS B5]** Cart, checkout, order model (split, partial cancel / return, exchange)                                | Domain expert + Architect            | Guest cart nahi (D-022).                                                                                                                                                                                                                                |
| B7    | **[Naye docs me: OPEN_QUESTIONS B6]** Payments, refunds, settlement, ledger (database ka sawal bhi)                                         | Domain expert + Architect + Security | Finance PostgreSQL pe (D-012). Baaki: finance me kya-kya PostgreSQL me; kernel packages ka SQL roop.                                                                                                                                                    |
| B8    | **[Naye docs me: OPEN_QUESTIONS B7]** Returns aur replacement: cosmetics ke hygiene niyam                                                   | Domain expert                        | —                                                                                                                                                                                                                                                       |
| B9    | **[Naye docs me: OPEN_QUESTIONS B8]** Reviews, ratings, UGC, moderation                                                                     | Domain expert                        | Reviews padhna bina sign-in, likhna sign-in se (D-022).                                                                                                                                                                                                 |
| B10   | **[Naye docs me: OPEN_QUESTIONS B9]** Search, recommendations, virtual try-on                                                               | Domain expert + Architect            | Try-on ke saath camera permission (DECISION_LOG §8).                                                                                                                                                                                                    |
| B11   | **[Naye docs me: OPEN_QUESTIONS B10]** Loyalty, gift cards, store credit, subscriptions                                                     | Domain expert                        | Gift cards aur store credit ka faisla yahin (owner, 2026-11-17): RBI ke prepaid (PPI) niyam lag sakte hain, jaancha nahi.                                                                                                                               |
| B12   | **[Naye docs me: OPEN_QUESTIONS B11]** Support, disputes, notifications                                                                     | Domain expert                        | Consultation flow aur Beauty Advisor ka message thread tay (D-027).                                                                                                                                                                                     |
| B13   | **[Naye docs me: OPEN_QUESTIONS B12]** Analytics aur reporting                                                                              | Architect                            | —                                                                                                                                                                                                                                                       |
| B14   | **[Naye docs me: OPEN_QUESTIONS B13]** Compliance ki gehrai: kya dummy, kya asli                                                            | Domain expert                        | Telemedicine ki dummy row (D-027).                                                                                                                                                                                                                      |
| B15   | **[Naye docs me: OPEN_QUESTIONS B14]** Security: auth, authorization, payments, uploads, abuse, privacy                                     | Security Architect                   | Aage bheje: kai apps me sign-in ka bojh (D-010); owner ke ~80 accounts pe authenticator ka bojh (D-019); customer ke email code sign-in ke niyam (D-023); consultation notes ki pahunch aur consent (D-027); alag services ki process security (D-011). |
| B16   | **[Naye docs me: OPEN_QUESTIONS B15]** Technical: service boundaries, hosting, observability, backup, scale targets                         | Architect                            | Services aur clusters (D-011), backup (D-015) tay. Baaki: §3 ki jaanch.                                                                                                                                                                                 |
| B17   | **[Naye docs me: OPEN_QUESTIONS B16]** Docs aur task files ka dhaancha (PROJECT_PLAN, `tasks/<flow>/TASK.md`, subtasks), purane docs ka kya | Owner ke saath                       | Tareeka tay (D-021): purane product docs B17 ke baad archive; CI me paths check.                                                                                                                                                                        |

## 3. Jaanchna baaki (Claude; owner ka faisla nahi chahiye, sirf saboot)

| Kya                                                                                                                      | Kis faisle se | Kyun                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------ | ------------- | --------------------------------------------------------------------------------------- |
| **[Naye docs me: RISKS R-006, §2.1]** Atlas free tier: ek project me ek free cluster, hafte ki data-transfer seema       | D-011, D-015  | 8 alag MongoDB clusters (finance PostgreSQL pe, D-012) aur poore backup ki ginti isi pe |
| **[Naye docs me: RISKS R-007; OPEN_QUESTIONS B15]** Ek 512 MB Render process me 9 services ki memory                     | D-011         | Bundle mode me sab ek process me chalte hain                                            |
| **[Naye docs me: RISKS R-008, §2.2]** Render free ke mahine ke ghante, aur baar-baar jagana niyamon me theek hai ya nahi | D-014         | Server ko jagaye rakhne ka plan                                                         |
| **[Naye docs me: DECISIONS D-057; RISKS §2.3]** Free PostgreSQL provider (storage, sona / pause, connections)            | D-012         | Finance service ka database                                                             |
| **[Naye docs me: OPEN_QUESTIONS §2]** Asli location data me main city aur phaile hue pincodes                            | D-017, D-018  | Pincode → hub mapping                                                                   |
| **[Naye docs me: DECISIONS D-059]** Live system me pehle se diye gaye roles                                              | D-019         | Role "chalu nahi" karne se pehle                                                        |

## Change log

| Version | Date       | Badlav                                                                                                                    |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| v0.1    | 2026-11-17 | Pehla draft: Batch 1 (Q-001 se Q-006) aur aage ki queue.                                                                  |
| v0.2    | 2026-11-17 | REPOSITORY_ANALYSIS Q1 se Q13 ke jawab gine: Batch 1 ki halat (Q-004, Q-006 tay), queue me "ab tak", §3 jaanchna baaki.   |
| v0.3    | 2026-11-17 | §0: ek waqt me ek sawal, jawab sawal ke neeche. Agent 2 Batch 1 ke baad. Q-005 D-016 ke hisaab se dobara likha (Charcha). |
| v0.4    | 2026-11-17 | Q-001 tay: (b) (D-028).                                                                                                   |
| v0.5    | 2026-11-17 | Q-002 tay (D-029, D-030); Q-005 me (c); saaf karna baaki Q-007 se Q-010; Q-007 likha (Charcha).                           |
