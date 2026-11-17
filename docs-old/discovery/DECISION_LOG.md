# DECISION LOG: discovery

> **Status:** v0.6 (2026-11-17), discovery phase. **Naye docs me jo aa gaya, uspe "[Naye docs me: ...]" ka nishaan hai.** Sirf wahi "Tay" hai jo owner ne khud kaha ho. Recommendation tab tak faisla nahi jab tak owner haan na kahe. Koi faisla badle to purani line mitti nahi: nayi line "badla" ke saath judti hai (D-020). Sawal-jawab ki poori baatcheet [REPOSITORY_ANALYSIS.md](REPOSITORY_ANALYSIS.md) §6 me (har sawal ke neeche "Owner ka jawab aur charcha"); yahan sirf faisla aur uska record.

## 0. Kaise padhein

- §1 ek nazar me: har faisla ek line me.
- §2 me D-008 se aage har bade faisle ka record (D-020 ka format): **Faisla**, **Wajah** (owner ke shabd), **Chhode vikalp**, **Kab dobara khulega**, **Kisne, kab**, aur **Nishaan**.
- **Nishaan:** `Owner` = owner ka apna faisla; `Salah maani` = Claude ki salah, owner ne haan kahi; `Salah nahi maani` = owner ne Claude ki salah se alag chuna.
- "Kab dobara khulega" me jo owner ne nahi kaha, wahan "owner khud khole" likha hai; Claude ki koi sharat ho to `(Claude)` ke saath.

## 1. Tay (owner ne kaha)

| Id | Faisla | Kab | Kahan se |
| --- | --- | --- | --- |
| D-001 | **[Naye docs me: DECISIONS D-001]** Tech stack wahi rahega jo abhi hai. **Jod (2026-11-17):** finance service ke liye PostgreSQL (D-012). | 2026-11-17 | Shuru |
| D-002 | **[Naye docs me: DECISIONS D-002]** Repo aur folders ka structure, tools aur conventions wahi rahenge. | 2026-11-17 | Shuru |
| D-003 | **[Naye docs me: DECISIONS D-003]** Existing project (code aur docs) sirf reference hai; usme jo sawal uthane layak ho, uthaya jaye. | 2026-11-17 | Shuru |
| D-004 | **[Naye docs me: DECISIONS D-004]** Abhi sirf discovery: sawal-jawab. Plan, task files aur code tab tak nahi jab tak owner agla stage na khole. | 2026-11-17 | Shuru |
| D-005 | **[Naye docs me: DECISIONS D-005]** Agents ek ke baad ek, kabhi saath nahi. 5-hour limit ~80% pe ho to naya agent nahi; chalta hua agent poora hone do. | 2026-11-17 | Shuru |
| D-006 | **[Naye docs me: DECISIONS D-006]** Tasks ek file me nahi: ek main plan file, har poore flow ki alag task file, uske andar subtasks. Exact dhaancha baad me tay hoga (B17). | 2026-11-17 | Shuru |
| D-007 | **[Naye docs me: DECISIONS D-007]** Security Architect ek zaroori, alag role hai; security docs zaroorat ke saath bante jayenge. | 2026-11-17 | Shuru |
| D-008 | **[Naye docs me: DECISIONS D-008]** Design aur task files poore ecosystem ki pehle din; banana releases me, R1 = patla par poora order flow; koi feature kata nahi. | 2026-11-17 | Q1 |
| D-009 | **[Naye docs me: DECISIONS D-009]** Capacity: ek hi insaan (2 Claude accounts), 5 ghante/din, 6 din/hafta, koi deadline nahi. | 2026-11-17 | Q1 |
| D-010 | **[Naye docs me: DECISIONS D-010]** 11 alag apps rahenge; screens module ke saath judti jayengi. | 2026-11-17 | Q2 |
| D-011 | **[Naye docs me: DECISIONS D-011]** Sabki alag services, har service ka apna database aur apna cluster (MongoDB services ke Atlas clusters; finance PostgreSQL pe, D-012); seema transaction se (draft 9 services). | 2026-11-17 | Q3 |
| D-012 | **[Naye docs me: DECISIONS D-001, D-001 ke saath]** Finance PostgreSQL pe, baaki services MongoDB pe; har niyam ki list aur test. | 2026-11-17 | Q5 |
| D-013 | **[Naye docs me: DECISIONS D-012]** Design aur code asli users maan ke (production-grade), halaanki live system sirf owner chalayega. | 2026-11-17 | Q5 |
| D-014 | **[Naye docs me: DECISIONS D-028]** Kharcha ₹0, domain nahi; server baar-baar jagaya jayega; production-grade = code + chalne ki quality (₹0 me jitni ho sake). | 2026-11-17 | Q4 |
| D-015 | **[Naye docs me: DECISIONS D-013]** Backup: ek command se saare databases ka data download (MongoDB: Extended JSON; finance ka PostgreSQL bhi), restore command ke saath, files repo ke folder me par git se bahar (4 pehre). | 2026-11-17 | Q4 |
| D-016 | **[Naye docs me: DECISIONS D-014]** Fulfilment: stock sirf apne warehouse (Chakan), delivery sirf apne partners; carrier port; seller khud nahi bhejta; pehle din 1 warehouse + 1 hub. | 2026-11-17 | Q6 |
| D-017 | **[Naye docs me: DECISIONS D-015]** Location: India > State > District > Sub-District; har level ka switch (Master / Super Admin / Admin); switch aur live alag; sharten sirf live karte waqt. | 2026-11-17 | Q6, Q12 |
| D-018 | **[Naye docs me: DECISIONS D-016]** Pincode → theek ek hub (primary sub-district se), 10 cases ke niyam ke saath. | 2026-11-17 | Q6 |
| D-019 | **[Naye docs me: DECISIONS D-017]** Roles ki poori list design me, har role apne module ke saath chalu (permissions samet); ginti fix nahi; owner ke har role ka alag account. | 2026-11-17 | Q7 |
| D-020 | **[Naye docs me: DECISIONS D-018]** Faislon ka record is file ke §2 wale format me; badalne pe "badla" line. Sawal-jawab files me sirf aakhri faisla. | 2026-11-17 | Q8 |
| D-021 | **[Naye docs me: DECISIONS D-019]** Naye docs chhote, har baat ek jagah, "bana hai" sirf code link se; CI me docs ke paths ka check; purane product docs B17 ke baad archive. | 2026-11-17 | Q9 |
| D-022 | **[Naye docs me: DECISIONS D-020]** Guest cart aur guest wishlist nahi; bina sign-in sirf dekhna, search, reviews padhna, pincode check. | 2026-11-17 | Q10 |
| D-023 | **[Naye docs me: DECISIONS D-021]** Customer ke sign-in ke teen raaste: password, social (Google, LinkedIn, GitHub), email code. | 2026-11-17 | Q11 |
| D-024 | **[Naye docs me: DECISIONS D-022]** Location ka kaam sirf utna jitna D-017 ko chahiye; pehle location, phir products; staff ki list data me (sirf Master badle). | 2026-11-17 | Q12 |
| D-025 | **[Naye docs me: DECISIONS D-023]** Package CLI jaisa hai rahe (naya kaam publish ke plan pe), teen chhote sudhaar ke saath. | 2026-11-17 | Q13a |
| D-026 | **[Naye docs me: DECISIONS D-024]** `main` branch hategi; flow `prerelease` → `release`; GitHub default branch `release`. | 2026-11-17 | Q13b |
| D-027 | **[Naye docs me: DECISIONS D-025]** Skin & Hair Expert aur Beauty Advisor asli staff roles rahenge; video ke liye Google Meet ka dummy link; Beauty Advisor ka message thread (live chat nahi). | 2026-11-17 | Q13c |
| D-028 | **[Naye docs me: DECISIONS D-026]** Lakshya: portfolio project, par aisa bane ki kal asli business ban sake; design asli jaisa, registrations aur kanooni details dummy. | 2026-11-17 | Q-001 |
| D-029 | Purane PRD §2 aur ARCHITECTURE §2 (#3 se #8) waise hi naye docs me; 4 PRD rows naye roop me; #5 ka cluster wala hissa Q-007 me. | 2026-11-17 | Q-002 |
| D-030 | **[Naye docs me: DECISIONS D-027]** Warehouse aur hub ke beech maal kiraye ke transporter se; har trip ka record aur transporter ka bill finance me. | 2026-11-17 | Q-002 |

## 2. Faislon ka record (D-008 se)

### D-008. Releases me banana

- **[Naye docs me: DECISIONS D-008]** (2026-11-17).

- **Faisla:** design aur task files poore ecosystem ki pehle din. Banana releases me: R1 = ek patla par poora order flow. Koi feature kata nahi. R1 me exactly kya aayega, ye alag se tay hoga.
- **Wajah:** owner ne salah maani ("Tumhari salah").
- **Chhode vikalp:** sirf patla flow aur baaki kaatna (scope chhota hota); sab launch pe (bahut der tak kuch chalta nahi dikhta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.
- **Asar:** root `CLAUDE.md` ka "kuch bhi baad me nahi" niyam aur purane PRD §2 ke "Apps" / "Roles ka timing" badalne honge (§7).

### D-009. Capacity

- **[Naye docs me: DECISIONS D-009]** (2026-11-17).

- **Faisla:** kaam karne wala ek hi insaan (owner). Docs ka "2 developers" = owner ke 2 Claude accounts, usage limit ki wajah se. Din me 5 ghante, hafte me 6 din (30 ghante), 2026-11-17 se. Koi deadline nahi.
- **Wajah:** owner ki batayi haalat.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-010. 11 alag apps

- **[Naye docs me: DECISIONS D-010]** (2026-11-17).

- **Faisla:** har role parivaar ka alag app; 11 apps rahenge. Jaise-jaise module bane, uski screens apps me judengi; shells tab tak jaise hain.
- **Wajah (owner):** "apps already bane huye he"; "alag rakhne ka ek ye bhi reason he ki multiple projects ban jayenge".
- **Chhode vikalp:** 4 se 5 apps me milana (Claude ki salah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah nahi maani.
- **Aage:** ek insaan ke kai roles pe kai jagah sign-in ka bojh B15 me.

### D-011. Alag services, alag clusters

- **[Naye docs me: DECISIONS D-011]** (2026-11-17).

- **Faisla:** sabki alag services, har service ka apna database aur apna cluster. MongoDB wali 8 services ka har ek alag Atlas cluster (alag Atlas project, alag DB user); finance PostgreSQL pe (D-012), alag DB user ke saath. Kam storage wale modules ek service me reh sakte hain; seema Claude tay kare: jo ek saath pakka hona chahiye wo ek service me, services ke beech data sirf events se. Draft (module design me pakka): identity, notify, payments, catalog, commerce, logistics, finance, support, audit.
- **Wajah (owner):** M0 cluster 512 MB deta hai, "wo apne project ke liye kafi nhi hogi"; "Security bhi important he".
- **Chhode vikalp:** modular monolith; jo bana hai wahi rakhna aur payments alag na karna (Claude ki salah).
- **Kab dobara khulega:** Atlas free tier ka niyam (ek project me ek free cluster) ya 512 MB process memory 9 services na sambhale (Claude).
- **Kisne, kab:** owner, 2026-11-17; seema Claude ki salah, owner ne maani. **Nishaan:** Salah nahi maani (services), Salah maani (seema).
- **Note (Claude):** alag cluster + alag DB user se data ki security abhi milti hai; process ki security tab jab services alag servers pe chalein. Har deployable apna `<NAME>__MONGO_URI` pehle se padhta hai.

### D-012. Finance ke liye PostgreSQL

- **[Naye docs me: DECISIONS D-001]** (2026-11-17): D-001 ke saath ek faisla bana.

- **Faisla:** finance service PostgreSQL pe; baaki services MongoDB pe. Har niyam ki saaf list (unique index, conditional update, ya code + raat ki jaanch) aur har ek ka test, ek saath chalne wale requests ke tests samet.
- **Wajah (owner):** "Thik he Finance ke liye Hum SQL use karenge"; "PostgreSQL thik he".
- **Chhode vikalp:** sab MongoDB pe (Claude ki salah); finance ka scope chhota karna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah nahi maani.
- **Asar (Claude):** D-001 me jod; kernel packages (transaction, outbox, release steps, idempotency) ka SQL roop chahiye; Docker infra, CI aur backup me PostgreSQL judega; free PostgreSQL provider chunna baaki.

### D-013. Asli users maan ke design

- **[Naye docs me: DECISIONS D-012]** (2026-11-17).

- **Faisla:** live system sirf owner chalayega, par design aur code ye maan ke ki asli users use kar rahe hain: concurrency, abuse aur scale ki soch, aur unke tests.
- **Wajah (owner):** "hume code sirf mere liye nhi likhna he ekdum production grade banana he".
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.
- **Kahan laagu nahi:** sirf chhote operations ke faisle (jaise backup ke waqt system khaali, emails ki ginti).

### D-014. ₹0 aur domain nahi

- **[Naye docs me: DECISIONS D-028]** (2026-11-17).

- **Faisla:** kharcha ₹0, domain nahi. Soye server pe pehle customer ka ~1 minute intezaar chalega. Server GitHub Actions, cron-job aur UptimeRobot se din me baar-baar jagaya jayega, aur apps khule hon tab har kuch minute me. 300 emails/din kaafi. Free tier ki seemaon ki handling banti rahegi. Production-grade = code ki quality + chalne ki quality, ₹0 me jitni ho sake.
- **Wajah (owner):** "Mera Hobby Project he to din ke 300 mails kafi honge"; "Domain nhi chahiye".
- **Chhode vikalp:** kam se kam domain (Claude ki salah); mahine ka budget.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah nahi maani.
- **Jokhim (owner ne maana):** domain ke bina emails spam me ja sakte hain, aur har OTP email se jaata hai (R-005).
- **Badla (purana faisla):** purane docs ka "jagana, jaagta rakhna nahi" isse badalta hai.

### D-015. Backup command

- **[Naye docs me: DECISIONS D-013]** (2026-11-17).

- **Faisla:** ek command, jo production me jaane se pehle owner chalayega, aur saare databases ka data download kare. MongoDB clusters: Extended JSON (har collection ki ek file, ek line me ek document). Finance ka PostgreSQL bhi isi command me (D-012 ka asar); uska format technical batch (B16) me tay. Restore command ek baar local pe jaanchi hui. Files isi repo ke folder me, git se bahar. 4 pehre: `.gitignore`; CI pehra jo us folder ki file git me dikhe to fail kare; prettier, ESLint aur tests se bahar; Claude us folder ko `.env` ki tarah kabhi na khole.
- **Wajah (owner):** "Main ek command chalaunga production me jane se pehle aur wo sabhi clusters ka data json me download kar degi"; "downloaded files isi repo me rahenge bus github pe nhi jayegi".
- **Chhode vikalp:** repo ke bahar ka folder (Claude ki salah).
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (command, jagah); Salah maani (format, restore, pehre).

### D-016. Fulfilment model

- **[Naye docs me: DECISIONS D-014]** (2026-11-17).

- **Faisla:** har brand ka saara maal sirf apne warehouse (Chakan) me; customer tak sirf apne delivery partners, koi courier nahi. Raasta: brand → warehouse → hub → delivery partner → customer. Ilaake ke bahar delivery unavailable. Delivery ka code ek carrier port ke peeche (aaj sirf apni fleet). Seller khud nahi bhejta. Pehle din 1 warehouse + 1 hub, us sub-district ke saare pincodes; baaki hubs baad me ek click se.
- **Wajah (owner):** "Pehle din pura district nhi ek ek hub se suru karenge".
- **Chhode vikalp:** pehle din poora Pune district (21 hubs); seller khud bheje.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner; carrier port Salah maani.

### D-017. Location, switches aur live

- **[Naye docs me: DECISIONS D-015]** (2026-11-17).

- **Faisla:**
  - Seedhi: India > State > District > Sub-District. District me ek main warehouse; har sub-district me theek ek hub (alag record, sub-district se juda). Hub sirf parcel aage badhata hai, stock nahi. Warehouse se seedha customer ko kuch nahi; main city me bhi warehouse ke paas hub.
  - Switch ka haq: Master = State, Super Admin = District, Admin = Sub-District; Admin hub live karta hai. Upar wala role neeche ka switch chala sakta hai, audit ke saath.
  - Switch (kisi ne ON dabaya) aur live (apna switch ON + upar wala level live) alag; live kahin save nahi hota. Upar OFF to neeche sab OFF.
  - Sharten sirf live karte waqt: hub = staff ki list poori; district = warehouse + hub tayyar; state = kam se kam ek district. Live ke baad kami pe sirf chetavni (D-024), apne aap band nahi.
  - OFF se naye order turant band; jab tak orders ya returns raaste me hain, wo poore hote hain. Aakhri district OFF ho aur kuch pending na ho to state bhi OFF. Order user ke district ke warehouse se.
- **Wajah (owner):** "hub tabhi live jayega jab uske paas pura staff ready hoga"; "State tab tak live nhi jayega jab tak kisi koi district live nhi ho jaye".
- **Chhode vikalp:** live ki haalat store karna; sharat tootte hi apne aap band (D-024).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (seedhi, haq, sharten); Salah maani (switch aur live alag, sharten sirf live karte waqt, hub alag record).

### D-018. Pincode ke niyam

- **[Naye docs me: DECISIONS D-016]** (2026-11-17).

- **Faisla:** delivery ka faisla pincode → theek ek hub se, har pincode ka ek primary sub-district (data se, Admin badal sake). Do sub-districts / districts me phaila pincode primary se serve; do states me phaila pincode pe customer state chune (state live ho, GST usi state ka); naam se kabhi nahi, id aur sarkari code se; import pe ek pincode ek record; naam badle to itihaas rahe; bina mapping wala pincode unavailable + Admin ki list; jaanch order banate waqt usi transaction me; returns bhi "pending" me ginte hain. Poori list: [REPOSITORY_ANALYSIS.md](REPOSITORY_ANALYSIS.md) §6 Q6.
- **Wajah (owner):** "in cases ko tum tumhari salah se update karo. tumhe jo thik lage".
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-019. Roles

- **[Naye docs me: DECISIONS D-017]** (2026-11-17).

- **Faisla:** roles ki poori list design me; system me har role tab chalu jab uska module bane, usi badlav me uski permissions. Ginti (~80) fix nahi, zaroorat pe badh sakti hai (Master bina deploy ke sub-role jod sakta hai). RBAC engine waisa hi.
- **Owner ke accounts:** har role ka alag account, 2 base emails ke `+` alias se: ek authenticator wale 7 apps ke roles ke liye, ek baaki (customer, seller, delivery, creator) ke liye. Bantwara sirf suvidha, niyam nahi: jahan zaroori ho authenticator lagega (jaise Seller Account Owner, Seller Finance).
- **`+` alias:** normalise nahi hoga; email validation pe code comment ki kyun, aur ki owner ke accounts isi pe tike hain.
- **Wajah (owner):** "Ye batwara is liye kiya gaya he ki jisko authenticator ki jarurat hi nhi he unko har login pe authenticator na chalana pade"; "ye fix nhi he ki roles 80 hi honge".
- **Chhode vikalp:** saare 79 roles abhi system me; roles kam karna (12 se 15).
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani (roles); Owner (accounts, alias).

### D-020. Faislon ki process

- **[Naye docs me: DECISIONS D-018]** (2026-11-17).

- **Faisla:** har bada faisla §2 ke format me (faisla, owner ke shabdon me wajah, chhode vikalp, kab dobara khulega, kisne-kab, Claude ki salah aur owner ka faisla alag nishaan). Is file me purana faisla mitta nahi, "badla" line judti hai. Sawal-jawab ki kaam-chalau files me sirf aakhri faisla.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-021. Docs ka tareeka

- **[Naye docs me: DECISIONS D-019]** (2026-11-17).

- **Faisla:** naye docs chhote aur decision records ke saath; har baat sirf ek jagah, baaki jagah link; "bana hai" sirf code ya test ke link se; ek index file. CI me ek check jo docs me likhe file paths repo me hon ye dekhe. Purane PRD, ARCHITECTURE, TASKS, DESIGN naye docs banne (B17) ke baad `docs/archive/` me, "sirf reference" note ke saath; RULES, HANDOFF, GIT_SKILLS, MEMORY rahen aur update hon (HANDOFF chhota).
- **Chhode vikalp:** purane bade docs hi update karte rehna.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-022. Guest cart nahi

- **[Naye docs me: DECISIONS D-020]** (2026-11-17).

- **Faisla:** cart aur wishlist ke liye sign-in zaroori. Bina sign-in: products aur product page, search aur filter, reviews padhna, pincode pe delivery check. Sign-in zaroori: cart, wishlist, checkout aur payment, review likhna, orders aur account.
- **Wajah (owner):** "Storage aur kaam kam karne ke liye"; "Bina login ke nhi matlab nhi".
- **Chhode vikalp:** server pe anonymous cart (Claude ki salah).
- **Kab dobara khulega:** sirf owner khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah nahi maani (guest cart); Salah maani (bina sign-in ki list).

### D-023. Customer sign-in

- **[Naye docs me: DECISIONS D-021]** (2026-11-17).

- **Faisla:** customer app me teen raaste, customer khud chune: password, social (Google, LinkedIn, GitHub), aur email code. Email code se sign-in sirf customer app me; authenticator laga ho to email code ke baad bhi maanga jaye (B15 me pakka). Ye baat naye docs me ek hi jagah.
- **Chhode vikalp:** sirf password + social (aaj ka code); sirf email code + social.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.
- **Badla (purana faisla):** purane ARCHITECTURE §7.1 (2026-10-27) ka "email code se login hata" isse badalta hai.

### D-024. Location ka kaam kitna aur kis order me

- **[Naye docs me: DECISIONS D-022]** (2026-11-17).

- **Faisla:** vikalp (c): poore India ka data import, shak wale pincodes ki jaanch sirf live hone wale district ki; D-017 ke switches aur live; teen sharten code ke niyam (generic checklist engine baad me); area settings sirf checkout aur delivery promise ki keys (sub-district level samet); network me 1 warehouse, hub, pincode → hub, delivery promise. **Order:** pehle location, phir products. Expand karna (naya hub, warehouse, district, switch, staff, live, sarkari data) app ya import se, code se nahi.
- **Staff ki list:** kaunse roles kitne, data me, app ke ek page pe, sab hubs ke liye ek; sirf Master badle, audit ke saath.
- **Staff kam ho jaye to:** Master ko save se pehle dikhe kitne live hubs pe asar; hub chalta rahe, "Delivery Partner 1/2" jaisa nishaan, Admin aur Super Admin ko in-app + email; faisla Admin ka (staff bhare ya hub OFF); OFF hua hub dobara tabhi live jab list poori. District aur state pe bhi yahi.
- **Chhode vikalp:** sirf pincode → hub table; purana 14 PR ka poora plan; staff kam hote hi turant band; purane hubs pe naya niyam na lagana.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-025. Package CLI

- **[Naye docs me: DECISIONS D-023]** (2026-11-17).

- **Faisla:** CLI jaisa hai waisa; naya kaam tabhi jab publish ka plan bane. Teen sudhaar: release ke baad ka sandesh "(main)" ki jagah `release` branch; `docs/packages/README.md` ka back-merge `release` → `prerelease`; docs me `test:scripts` ke liye `infra:up` ki baat.
- **Chhode vikalp:** CLI hatana; aage badhana.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-026. Branches

- **[Naye docs me: DECISIONS D-024]** (2026-11-17).

- **Faisla:** `main` branch hategi. Flow: feature branch → `prerelease` (development) → `release` (production); back-merge `release` → `prerelease` waise hi. GitHub default branch `release`.
- **Wajah (owner):** "main branch delete karni he".
- **Kram:** pehle saari jagah `main` ka zikr badle, phir default branch, aakhir me delete; sirf implementation me, owner ke kehne pe. `main` aur `release` ki files aaj same hain (Claude ne local refs se dekha).
- **Chhode vikalp:** teeno branches rakhna; sirf `main` + feature branches.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (Claude ki salah (b) jaisa).
- **Badla (purana faisla):** CLAUDE.md aur RULES §2 ka 2026-10-25 wala git flow isse badalta hai.

### D-027. Consultation aur Beauty Advisor

- **[Naye docs me: DECISIONS D-025]** (2026-11-17).

- **Faisla:** Skin & Hair Expert aur Beauty Advisor asli staff roles (Support Desk, Support Lead ke neeche). Apna video system nahi: customer ko Google Meet ka dummy link. Flow: request → time tay aur link bheja → consult hua → resolve (cancel aur no-show bhi), har badlav audit me, customer ko haalat dikhe. Link staff daale (sirf `https://meet.google.com/...`), system nakli link nahi banata; demo me DUMMY nishaan. Link email aur in-app se. Dono roles ka ek hi flow. Skin & Hair Expert ke notes health data: sirf expert aur zaroori support roles, pehle customer ki consent (B15 me pakka). Telemedicine ki ek dummy row legal matrix me. Beauty Advisor ka chat live nahi, message thread: customer sawal bheje, advisor shade aur product links ke saath jawab de.
- **Wajah (owner):** "ye ek complete plan hoga"; "Telecommunication ki jhanjhat nhi chahiye".
- **Chhode vikalp:** apna video system; live chat; roles hatana.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (roles, Meet link); Salah maani (flow ke niyam, message thread).

### D-028. Project ka lakshya

- **[Naye docs me: DECISIONS D-026]** (2026-11-17).

- **Faisla:** vikalp (b): portfolio / practice project, par aisa bane ki kal asli business ban sake. Design asli jaisa (data model, compliance ke fields, security); registrations aur kanooni details dummy; scope ka paimana "poora order flow chalta dikhe".
- **Wajah:** owner ne vikalp (b) chuna. Owner pehle hi project ko "practice hobby project" keh chuke the; (b) usme ye jodta hai ki design asli business jaisa rahe, taaki aage jaana pade to code dobara na likhna pade.
- **Chhode vikalp:** (a) sirf seekhna aur portfolio; (c) asli business launch.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.
- **Asar (Claude):** D-013 (asli users maan ke code) aur D-014 (₹0) isi ke saath chalte hain. Asli business pe jaana = operations, kanooni registration aur paid plans ka kaam (jaise Vercel Hobby sirf non-commercial), code rewrite nahi. Iske liye dummy kanooni details (GSTIN, licence numbers, contacts) data ya config me rahen, code me nahi.

### D-029. Purane PRD §2 aur ARCHITECTURE §2 ki samiksha

- **Faisla:** owner ne purane PRD §2 ki har row aur ARCHITECTURE §2 ke #3 se #8 pe alag-alag jawab diya. Jo rows waise hi rahin, wo naye docs (B17) me niyam ki tarah jayengi.
  - **PRD §2, waise hi (25 rows):** Product category, Business model, Apna brand, Kaun bech sakta hai, Stock, Delivery, Delivery partners, Payments, Launch coverage, Sellers ki location, Expansion design, Customers, Reviews, Foreign investment, Apps, Roles ka timing, Docs ki language, Project ka type, Market aur tax, Platform type, Drug items, Head of Operations, Plastic EPR, aur root `CLAUDE.md` ke dono frozen niyam.
  - **PRD §2, naye roop me (4 rows):**
    - Pune pehle din: 1 state, 1 district (1 warehouse), 1 sub-district (1 hub); jis sub-district me warehouse ho, wahan ka hub warehouse ke saath (D-016). Hub ki ginti saaf karna baaki (Q-009).
    - Agla district ya state: D-017 ke haq se; jis level ka switch jiske paas, wahi us level ko kholega.
    - Pune network: D-016 (Chakan warehouse; pehle din ek hub, baaki hubs baad me).
    - Stock transport: D-030.
  - **ARCHITECTURE §2, waise hi:** #3 kharcha ₹0 (Render free, Vercel Hobby, Atlas M0, free Redis); #4 Render pe bundle mode, laptop pe Docker split mode; #6 Redis (laptop pe local Valkey; production me Render Key Value sirf internal URL se; laptop, tests aur CI kabhi production Redis se nahi); #7 domain nahi, har Vercel app ka `/api/*` gateway pe rewrite; #8 monorepo (npm workspaces + Turborepo).
  - **ARCHITECTURE §2 #5:** owner ne waise hi rakha aur "Core ke andar" ko "Core ya aage bani har service ke andar" kiya (module-prefixed collections). Iska "har environment ka 1 Atlas cluster" hissa D-011 (har service ka apna cluster) se takrata hai: Q-007.
  - **ARCHITECTURE §2 #1, #2:** pehle hi D-011 se badle (sabki alag services; seema transaction se). #9 aur #10 pe charcha baaki.
- **Wajah:** owner ne har purane faisle ko khud dekha; jahan purani soch theek thi, wahan rakhi.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.
- **Asar (Claude):**
  - Q-005: "Business model" aur "Apna brand" waise hi, yaani vikalp (c) hybrid. Apna brand alag company ke naam se ho ya platform company khud, ye baaki.
  - "Reviews pehli release me" ab D-008 ke saath padha: reviews R1 me.
  - REPOSITORY_ANALYSIS §9 ke "ek baar confirm" wale (customers 18+, gig partners apni gaadi, sellers ka warehouse-state GSTIN, Head of Operations) ab tay.
  - #4 ke "5 deployables" D-011 ke baad zyada services honge; bundle mode wahi.
  - "Roles ka timing" (saare roles launch se system me) aur D-019 (role apne module ke saath chalu) ka mel: Q-008.

### D-030. Stock transport (warehouse aur hub ke beech)

- **[Naye docs me: DECISIONS D-027]** (2026-11-17).

- **Faisla:** warehouse aur hub ke beech maal (dono taraf, returns samet) **kiraye ke transporter** se. Driver ka system me account ya role nahi. Har trip ka record: transporter, gaadi number, driver ka naam aur phone (sirf contact ke liye), seal number, manifest (kaunse bags aur parcels), warehouse pe dispatch scan aur hub pe receive scan (kis staff ne kiya). Transporter ka bill finance me kharche ki entry, trip records se mila ke. Brands apna maal bhejne aur wapas le jaane ke liye apna transport ya courier le sakte hain (purani row ka ye hissa waise hi).
- **Wajah:** owner ne do vikalp diye (apna local staff jiska system me record nahi, ya kiraye ka), saath me kaha ki kharche ka bill banega, aur chunna Claude pe chhoda. Claude ne kiraye ka chuna: (1) bina record ke maal gum ya toot jaaye to zimmedari kisi pe nahi banti, jo D-013 ke khilaaf hai; (2) bill kiraye wale ke saath seedha baithta hai, apne staff ka kharcha salary hota hai; (3) naya role ya app nahi chahiye.
- **Chhode vikalp:** apna local staff, bina record ke.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17 (chunna Claude pe chhoda). **Nishaan:** Salah maani.
- **Aage (Claude):** e-way bill ki zaroorat aur seema jaanchi nahi (B14).

## 3. Pending (jawab baaki)

[OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §1 (Batch 1 ki halat aur saaf karna baaki: Q-007 se Q-010) aur §3 (jaanchna baaki).

## 4. Rejected approaches

| Approach | Kisne chhoda | Faisla |
| --- | --- | --- |
| Internal apps ko 4 se 5 apps me milana | Owner | D-010 |
| Modular monolith / payments core me | Owner | D-011 |
| Sab MongoDB pe, finance bhi | Owner | D-012 |
| Domain ya mahine ka budget | Owner | D-014 |
| Pehle din poora Pune district (21 hubs) | Owner | D-016 |
| Guest cart / guest wishlist | Owner | D-022 |
| Sharat tootte hi area apne aap band | Owner | D-024 |
| Apna video system, live chat | Owner | D-027 |

## 5. Assumptions (jab tak owner kuch aur na kahe)

| Id | Assumption |
| --- | --- |
| A-001 | Root `CLAUDE.md` ke "Hamesha laagu niyam" waise hi laagu hain, siwaye §7 ki list ke jo is discovery ke faislon se badalti hai. |
| A-002 | Purane PRD aur ARCHITECTURE ke decisions sirf reference hain jab tak Q-002 ka jawab na aaye. |
| A-003 | Discovery ki files `docs/discovery/` me rehti hain; final dhaancha B17 me tay hoga. |

## 6. Risks

| Id | Risk |
| --- | --- |
| R-001 | Scope aur capacity ka mel nahi: neev gehri hai par commerce ka ek bhi feature nahi bana. D-008 (releases) aur D-009 (30 ghante/hafta, deadline nahi) isse kam karte hain, par R1 ka scope abhi tay nahi. |
| R-002 | ₹0 hosting aur "production-grade" ek saath: owner ne D-014 me maana; chalne ki quality ₹0 tak hi. |
| R-003 | Ek hi agent ne 5-hour limit ka ~59% liya: discovery kai sessions me chalegi. |
| R-004 | Kanooni baatein lawyer se verify nahi hain. |
| R-005 | Domain nahi, isliye OTP aur baaki emails spam me ja sakte hain (D-014). |
| R-006 | Atlas free tier: ek project me ek free cluster ka niyam (8 MongoDB clusters) aur hafte ki data-transfer seema D-011 aur D-015 ko seemit kar sakti hai (jaanch baaki). |
| R-007 | Ek 512 MB Render process me 9 services ki memory (jaanch baaki). |
| R-008 | Render free ke mahine ke ghante aur baar-baar jagana (D-014) uske niyamon me theek hai ya nahi (jaanch baaki). |
| R-009 | Finance ke liye kernel packages ka SQL roop naya kaam hai; free PostgreSQL provider abhi chuna nahi (D-012). |

## 7. Purane docs me kya badlega (sirf list; badlav owner ki haan ke baad)

| Doc | Kya badlega | Faisla |
| --- | --- | --- |
| Root `CLAUDE.md` | "Production-grade, kuch bhi baad me nahi" → releases me banana; git flow (`main` hatna, default `release`); "2 developers" ki wording; stack me finance ka PostgreSQL | D-008, D-026, D-009, D-012 |
| `AGENTS.md` | CLAUDE.md ke niyam badlein to ye pointer bhi dekhna | D-026 |
| `docs/RULES.md` §2 | Git flow aur back-merge | D-026 |
| `.claude/skills/_shared/git-rules.md`, `docs/GIT_SKILLS.md` | Branch flow, `main` ka zikr | D-026 |
| `docs/HANDOFF.md` | "2 developers" → ek insaan, 2 accounts; chhota karna | D-009, D-021 |
| `docs/PRD.md` | §2 "Apps" / "Roles ka timing"; customer login; teleconsultation flow; delivery ka model (1 hub se) | D-008, D-023, D-027, D-016 |
| `docs/ARCHITECTURE.md` | §2 #1 / #5 services aur clusters; §2 #3 aur #7 (₹0, domain: pehle jaise); §7.1 customer login; jagane ka niyam; PostgreSQL | D-011, D-023, D-014, D-012 |
| `docs/packages/README.md` | Back-merge, `test:scripts` ke liye `infra:up`, naye services ke liye `create:backend` | D-025, D-011 |
| `docs/backend/T4-LOCATION-PLAN.md` | Reference rahe; naya location design D-017, D-018, D-024 se | D-024 |

## 8. Implementation ke kaam (discovery ke baad; abhi code nahi chhua)

- Email validation pe `+` alias ka code comment (D-019).
- Backup aur restore command, 4 pehron ke saath (D-015).
- Package CLI ke teen sudhaar (D-025).
- `main` hatane ka kram (D-026).
- CI me docs ke paths ka check (D-021).
- Customer app ka `Permissions-Policy` (camera, location) try-on aur address pin ke saath sirf apni site ke liye kholna (Q13d).
- `create:backend`: naye services, Mongo URI template me, PostgreSQL option (D-011, D-012).

## Change log

| Version | Date | Badlav |
| --- | --- | --- |
| v0.1 | 2026-11-17 | Pehla draft: D-001 se D-007, assumptions, risks. |
| v0.2 | 2026-11-17 | REPOSITORY_ANALYSIS ke Q1 se Q13 ke faisle: D-008 se D-027, D-001 me PostgreSQL ka jod, rejected approaches, risks R-005 se R-009, purane docs ki list aur implementation ke kaam. |
| v0.3 | 2026-11-17 | Sudhaar (owner ne pakda): D-011, D-015, R-006 me "saare Atlas clusters" ki jagah saaf kiya ki finance PostgreSQL pe hai (D-012); Claude ki likhne ki galti, faisla nahi badla. |
| v0.5 | 2026-11-17 | D-028: lakshya (b) (Q-001). |
| v0.6 | 2026-11-17 | D-029 (purane PRD §2 aur ARCHITECTURE §2 ki samiksha, Q-002), D-030 (stock transport). |
