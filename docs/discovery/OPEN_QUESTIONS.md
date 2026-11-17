# OPEN QUESTIONS: Cosmetics E-Commerce Ecosystem (discovery)

> **Status:** v0.1 (2026-11-17), **draft**, discovery phase. Owner ke saath sawal-jawab ki file. Yahan likhi "Salah" sirf recommendation hai: jab tak owner haan na kahe, kuch tay nahi. Tay hui baatein [DECISION_LOG.md](DECISION_LOG.md) me jaati hain.

## 0. Ye file kaise chalti hai

- Sawal chhote batch me (3 se 7), ek topic ek batch. Agla batch pichhle ke jawab ke baad.
- Har sawal me: **Sawal**, **Kyun zaroori**, **Vikalp**, **Salah**, **Trade-off**.
- Status: `Khula` (jawab baaki), `Charcha` (baat chal rahi), `Tay` (DECISION_LOG me gaya), `Roka` (baad me).
- Saboot aur purane project ki critique: [REPOSITORY_ANALYSIS.md](REPOSITORY_ANALYSIS.md) (§6 critique, §9 purane decisions, §10 unknowns).
- Kanooni baatein kisi lawyer se verify nahi hain; jahan kanoon ka zikr hai wahan ye maan ke chalo.

## 1. Batch 1: neev ke sawal (Status: Khula)

Ye 6 jawab baaki har cheez ki disha tay karte hain. Agle agents (domain expert, Security Architect) ka brief bhi inhi se banega.

### Q-001. Project ka asli lakshya kya hai?

- **Sawal:** ye (a) sirf seekhne aur portfolio ka project hai, (b) portfolio hai par aise bane ki kal asli business ban sake, ya (c) asli business launch karna hai?
- **Kyun zaroori:** budget, kanooni kaam (dummy ya asli registration), scope aur "done" ki paribhasha isi se nikalti hai. Purana PRD (a) kehta hai aur saath me "production-grade" bhi, jo aapas me takrata hai (analysis §6 Q4).
- **Vikalp:** (a), (b), (c) jaise upar.
- **Salah:** **(b)**. Design asli jaisa (data model, compliance ke fields, security), registrations aur kanooni details dummy, aur scope ka faisla "poora order flow chalta dikhe" se.
- **Trade-off:** (b) me compliance ke design ka kharcha aata hai jo demo me kabhi "use" nahi hota. Badle me (c) pe jaana rewrite nahi maangta. (a) me shortcuts portfolio ki keemat ghata dete hain; (c) ke liye lawyer, paisa aur asli operations chahiye, jo architecture tay nahi kar sakta.

### Q-002. Purane decisions ka darja kya hai?

- **Sawal:** purane PRD §2 (27 decisions) aur ARCHITECTURE §2 (10 decisions) ko kaise maana jaye?
- **Kyun zaroori:** "existing sirf reference hai" ka matlab saaf hona chahiye, warna ya to 30 sawal dobara poochhne padenge ya kamzor faisle chupchaap saath aa jayenge.
- **Vikalp:** (a) sab mita ke khaali panne se; (b) purane decisions "default" rahen, par jin pe critique hai wo khul ke dobara discuss hon; (c) sab pakke.
- **Salah:** **(b)**. Dobara khulne wale 9: business model; saara stock sirf apne warehouse me; delivery sirf apni; 11 alag apps; saare roles launch pe; pehle din poora Pune district (21 hubs); kharcha ₹0; domain nahi; guest cart nahi. "Dobara confirm" wali list analysis §9 me hai. Baaki default.
- **Trade-off:** (a) saaf hai par pehle se ki hui soch barbaad hoti hai; (c) me jaani hui kamzoriyan reh jaati hain; (b) me har purane faisle pe ek nazar ka kaam hai.

### Q-003. Jo code ban chuka hai uska kya?

- **Sawal:** identity, gateway, notify (email), RBAC engine, audit, outbox, kernel packages aur design system (project ka ~24%) rakhna hai ya dobara likhna hai?
- **Kyun zaroori:** "stack aur structure wahi" tay hai, par ye tay nahi ki bana hua code neev rahega ya sirf namuna.
- **Vikalp:** (a) code rakho, uske upar commerce banao; sirf requirements aur plan naye; (b) kernel packages rakho, par deployables ki banawat dobara dekho; (c) sab dobara likho.
- **Salah:** **(a)**. Neev code me jaanch ke mazboot mili (contracts-first routes, transactions, outbox, authz, sessions, audit). (b) ke do sawal baad ke technical batch me: payments alag process ho ya module, aur role catalogue ka size.
- **Trade-off:** purani neev ke kuch faisle saath aate hain (ek process me chalte "microservices", grants ki copy). (c) se koi business value nahi milti.

### Q-004. "Sab kuch launch pe", ya releases me? Aur capacity kitni hai?

- **Sawal:** (i) 11 apps, ~80 roles aur ~23 modules sab ek saath chahiye, ya design poora ho aur banana releases me? (ii) Asal me kitne log kaam kar rahe hain, hafte me kitne ghante, aur koi target date hai?
- **Kyun zaroori:** 30 din aur 527 commits ke baad ek bhi product, cart ya order nahi hai; saare 44 routes auth aur platform ke hain. Capacity ke bina koi roadmap sach nahi hota.
- **Vikalp:** (a) sab launch pe (jaisa hai); (b) design poore ecosystem ka, banana releases me: R1 = catalog → cart → checkout → payment → fulfilment → delivery → return ka patla par poora flow, phir R2, R3; (c) scope hi chhota (features kaat do).
- **Salah:** **(b)**. "Baad me bhool jayenge" ka dar task files se sambhalta hai: har module ki file pehle din banegi, sirf banne ka order alag hoga. Ye CLAUDE.md ke "kuch bhi baad me nahi" niyam ko chhuta hai, isliye owner ka saaf faisla chahiye.
- **Trade-off:** releases me thoda rework (R1 ka model R2 me badal sakta hai). (a) me rework nahi, par bahut der tak kuch chalta nahi dikhta aur koi business assumption parkha nahi jaata.

### Q-005. Business model kya hai?

- **Sawal:** platform (a) 1P retailer hai (Beautinique maal khareed ke khud bechta hai, invoice pe Beautinique), (b) pure marketplace (sellers apna maal bechte hain, invoice pe seller, hamara commission), ya (c) hybrid: apna brand + doosre brand sellers, ek hi storefront (purana faisla)?
- **Kyun zaroori:** sabse bada scope driver. (b) aur (c) me seller onboarding / KYC, seller app, commission, settlement, TCS / TDS aur seller-wise invoice aate hain. (a) me purchase orders aur vendor payable aate hain, par seller app aur settlement nahi.
- **Vikalp:** (a), (b), (c) jaise upar.
- **Salah:** **(c) end-state rahe**, kyunki "ecosystem" wahi hai aur identity / RBAC pehle se kai organisations ke liye bana hai. Par R1 me sirf house brand usi seller pipeline se beche (seller entity, seller ka stock, invoice pe seller), doosre sellers R2 me. Isse model pehle din se marketplace ki shakal ka rehta hai aur pehla order settlement ke bina chal jaata hai.
- **Trade-off:** R1 me marketplace ka finance hissa parkha nahi jaata. (a) chunne se finance lagbhag aadha ho jaata hai, par seller side ka poora ecosystem chala jaata hai.

### Q-006. Infra ka budget kitna hai?

- **Sawal:** (a) ₹0 hi; (b) sirf domain (andaza ~₹1,000 saal); (c) chhota mahine ka budget (purane docs ka andaza ~$72 se 79 mahina) jisme server jaagta rahe, backup aur staging ho?
- **Kyun zaroori:** purane docs ke apne numbers: server 15 min me so jaata hai, cold start 42 se 57 s, Redis 25 MB bina persistence, DB ka backup nahi, 300 emails/din, staging nahi. Code ka bada hissa sirf free tier ko sambhalne ke liye hai. Reservation expiry aur payment webhook sote server pe bharose layak nahi.
- **Vikalp:** (a), (b), (c) jaise upar.
- **Salah:** **abhi kam se kam (b)** (email deliverability, canonical URL, saaf cookies). (c) ka faisla tab jab pehla order flow chalne lage. "Production-grade" do hisson me likha jaye: code quality (abhi se) aur operations (budget ke saath).
- **Trade-off:** ₹0 me accidental complexity aur demo me cold start. Budget me ek non-commercial project pe har mahine ka kharcha.

## 2. Aage ki queue (abhi sirf topics; sawal agents ke baad likhe jayenge)

| Batch | Topic | Kaun gehrai me jayega |
| ----- | ----- | --------------------- |
| B2 | Fulfilment aur logistics: apna warehouse / fleet, courier, launch ka area | Domain expert |
| B3 | Apps aur roles: 11 apps ya kam, launch pe kaunse roles asli | Architect |
| B4 | Catalog: variant / shade / size, ingredients, batch aur expiry, content ka maalik | Domain expert |
| B5 | Pricing, promotions, bundles aur kits | Domain expert |
| B6 | Cart, checkout, order model (split, partial cancel / return, exchange) | Domain expert + Architect |
| B7 | Payments, refunds, settlement, ledger (database ka sawal bhi) | Domain expert + Architect + Security |
| B8 | Returns aur replacement: cosmetics ke hygiene niyam | Domain expert |
| B9 | Reviews, ratings, UGC, moderation | Domain expert |
| B10 | Search, recommendations, virtual try-on | Domain expert + Architect |
| B11 | Loyalty, gift cards, store credit, subscriptions | Domain expert |
| B12 | Support, disputes, notifications | Domain expert |
| B13 | Analytics aur reporting | Architect |
| B14 | Compliance ki gehrai: kya dummy, kya asli | Domain expert |
| B15 | Security: auth, authorization, payments, uploads, abuse, privacy | Security Architect |
| B16 | Technical: service boundaries, hosting, observability, backup, scale targets | Architect |
| B17 | Docs aur task files ka dhaancha (PROJECT_PLAN, `tasks/<flow>/TASK.md`, subtasks), purane docs ka kya | Owner ke saath |

## Change log

| Version | Date | Badlav |
| ------- | ---------- | ------ |
| v0.1 | 2026-11-17 | Pehla draft: Batch 1 (Q-001 se Q-006) aur aage ki queue. |
