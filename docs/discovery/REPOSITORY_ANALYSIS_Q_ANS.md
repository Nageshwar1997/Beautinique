# REPOSITORY ANALYSIS: sawal aur owner ke jawab

> **Status:** v0.2 (2026-11-17), **saare 13 sawalon ke jawab mile**, discovery phase. [REPOSITORY_ANALYSIS.md](REPOSITORY_ANALYSIS.md) §6 ke 13 sawal (Q1 se Q13) aur un pe owner ke jawab. Ye kaam-chalau file hai: jab saare jawab aa jayenge tab main files ([DECISION_LOG.md](DECISION_LOG.md), [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md), REPOSITORY_ANALYSIS.md) update hongi.

## 0. Kaise chalti hai

- Har sawal me: **Sawal**, **Vikalp**, **Salah** (sirf recommendation), **Owner ka jawab**, **Status**.
- Status: `Khula` (jawab baaki), `Charcha` (baat chal rahi), `Jawab mila`.
- Poori wajah aur saboot REPOSITORY_ANALYSIS.md §6 me usi number pe hai.
- [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) ke Batch 1 se jod: Q1 = Q-004, Q4 = Q-006, Q6 ka ek hissa Q-005 se juda hai. Yahan ka jawab wahan bhi gina jayega.

## Q1. "Sab kuch launch pe": scope aur capacity

- **Sawal:** 11 apps, ~80 roles aur ~23 modules sab pehle din chahiye, ya design poora ho aur banana releases me? Saath me: asal me kitne log kaam kar rahe hain, hafte me kitne ghante, koi target date?
- **Vikalp:** (a) pehle ek patla par poora order flow (catalog → cart → order → payment → dispatch, 3 se 4 apps); (b) release tiers (R1, R2, R3), roles aur apps module ke saath judte jayein; (c) jaisa hai, sab launch pe.
- **Salah:** (b), jisme R1 = (a) wala flow. Har module ki task file pehle din banegi, sirf banne ka order alag.
- **Owner ka jawab (2026-11-17):** salah maani: **(b)**. Design aur task files poore ecosystem ki pehle din; banana releases me, R1 = ek patla par poora order flow. Koi feature kata nahi. R1 me exactly kya aayega, ye alag se tay hoga.
- **Asar:** purane PRD §2 ke "Apps" aur "Roles ka timing" aur root `CLAUDE.md` ka "kuch bhi baad me nahi" niyam isse badalte hain; ye main files tab update hongi jab saare jawab aa jayenge.
- **Capacity (owner, 2026-11-17):** kaam karne wala **ek hi insaan** hai (owner). Docs ka "2 developers" asal me usi insaan ke 2 Claude accounts hain, jo usage limit ki wajah se baari-baari use hote hain. Yaani handoff ek account se doosre account ko hota hai, insaan se insaan ko nahi.
- **Samay (owner, 2026-11-17):** din me **5 ghante**, hafte me **6 din** (30 ghante/hafta), shuruaat aaj (2026-11-17) se. **Koi deadline nahi** (owner ne saaf kaha).
- **Status:** Jawab mila

## Q2. 11 alag frontend apps

- **Sawal:** 11 alag apps rakhne hain ya internal apps ko milana hai?
- **Vikalp:** (a) 4 apps: customer, partner (seller + creator), ops console (admin, superadmin, support, finance, logistics, growth permission ke hisaab se sections), delivery PWA; Master alag chahiye to 5. (b) 11 hi, par har app tabhi bane jab uska module bane.
- **Salah:** (a). Identity me "app" data hi rahe, to baad me alag karna mumkin rehta hai.
- **Owner ka jawab (2026-11-17):** salah nahi maani: **har role ka alag app chahiye** (11 apps rahenge).
- **Wajah (owner):** (1) saare 11 apps pehle se bane hue hain; (2) alag rakhne se multiple projects ban jayenge.
- **Banne ka order (owner, 2026-11-17):** jaise jaise modules pe kaam chalega, us module ki screens apps me judti jayengi. Shells tab tak jaise hain rahenge.
- **Aage bheja:** ek insaan ke kai roles ho to kai jagah sign-in ka bojh (single sign-on ya alag sign-in) security wale batch (B15) me tay hoga.
- **Status:** Jawab mila

## Q3. "Microservices" jo production me ek hi process hain

- **Sawal:** identity aur notify alag deployables bane hue hain; payments ko bhi alag process banana hai ya core ke andar module?
- **Vikalp:** (a) modular monolith: sab module, physical split tab jab paid infra ho; (b) jo bana hai rakho, par payments tab tak alag process nahi jab tak asli isolation na mile; (c) asli split, paid tier pe.
- **Salah:** (b). Agar alag services ki wajah "microservices seekhna" hai to wahi wajah likhi jaye, security nahi.
- **Owner ka jawab (2026-11-17):** salah nahi maani: **sabki alag services**. Har service ka **apna database aur apna alag cluster**.
- **Wajah (owner):** (1) MongoDB Atlas ka M0 cluster 512 MB deta hai, jo poore project ke liye kaafi nahi hoga; har service ka alag cluster hone se storage milta hai. (2) **Security bhi zaroori wajah hai** (owner ne salah ki "security nahi" wali baat nahi maani).
- **Security ka sach (Claude ka note):** alag cluster + alag DB user se data ki security abhi se milti hai (ek service ka DB password leak ho to doosri ka data nahi khulta). Process ki security (ek service me chhed ho to doosri ke secrets bachein) tab milegi jab services alag servers pe chalengi; design aisa rahe ki wo kadam baad me bina rewrite ke ho. Security Architect (B15) ise jaanchega.
- **Seema (owner, 2026-11-17):** kuch modules ek service me rah sakte hain (jahan storage kam lagta ho). Seema Claude tay kare; di gayi salah (transaction se seema, 7 se 9 services) maani.
- **Owner ke andaze:** audit log aur pincodes / locations ka data ~100 MB; launch pe ~500 products.
- **Seema ka pehla draft (Claude ka, module design ke waqt pakka hoga):**
  1. identity (bana hua): login, accounts, roles
  2. notify (bana hua): email, in-app, push
  3. payments: paisa lena, refunds
  4. catalog: products, search, reviews
  5. commerce: cart, orders, stock, warehouse, promotions (order + stock reservation ek transaction me)
  6. logistics: location master, pincodes, hubs, delivery
  7. finance: ledger, settlement
  8. support: tickets, disputes
  9. audit: audit log (sabse tez badhne wala data)
- **Niyam:** jo cheezein ek saath pakki honi chahiye wo ek hi service aur cluster me; services ke beech data sirf events se; har cluster alag Atlas project aur alag DB user ke saath.
- **Jaanchna baaki:** Atlas ke free-tier niyam (ek project me ek free cluster), ek process me 9 services ki memory (512 MB), aur repo me har deployable ka alag cluster URI lena kitna chhota badlav hai.
  - **Jaancha (Claude, 2026-11-17):** alag cluster URI ka intezaam pehle se hai: har deployable apna `<NAME>__MONGO_URI` padhta hai (`backend/identity/src/config.ts:16`, `backend/bundle/.env.example`). Par `create:backend` ka template naye service me Mongo URI nahi jodta; abhi identity, notify, core me haath se juda hai.
- **Status:** Jawab mila

## Q4. ₹0 hosting vs "production-grade"

- **Sawal:** infra ka budget kya hai, aur "production-grade" ka matlab kya maana jaye?
- **Vikalp:** (a) ₹0 hi, aur saaf likho ki production-grade ka matlab code quality hai, operations nahi; (b) chhota mahine ka budget (purane docs ka andaza ~$72 se 79) + domain; (c) beech ka: sirf domain, ya domain + paid Redis / DB.
- **Salah:** abhi kam se kam domain; mahine ke budget ka faisla tab jab pehla order flow chalne lage.
- **Owner ka jawab (2026-11-17):** salah nahi maani: **(a) ₹0 hi, domain nahi chahiye**.
  - Soye server pe pehle customer ka ~1 minute intezaar: chalega.
  - Server ko din me baar-baar jagaya jayega: GitHub Actions, cron-job aur UptimeRobot se; aur jab frontend apps khule hon tab har kuch minute me wake.
  - Din ke 300 emails kaafi hain (owner: ye hobby project hai).
  - Free tier ki seemaon ke liye limit handling waise hi banti rahegi jaise ab tak bani hai.
  - "Production-grade" ka matlab: **code ki quality bhi, aur chalne ki quality bhi (₹0 me jitni ho sake)**.
- **Jaanchna baaki (Claude):** Render free plan ke mahine ke ghante ek hamesha-jaage server ke liye kaafi hain ya nahi, aur baar-baar jagana uske niyamon me theek hai ya nahi. Ye purane faisle "jagana, jaagta rakhna nahi" ko badalta hai.
- **Jokhim (owner ne maana):** domain ke bina emails spam me ja sakte hain, aur har OTP email se hi jaata hai.
- **Backup (owner, 2026-11-17):** **ek command, jo production me jaane se pehle owner chalayega, aur jo saare clusters ka data JSON me download kar de.**
  - **Format (Claude ki salah, owner ne maani):** Extended JSON, har collection ki ek file, ek line me ek document, taaki ObjectId aur dates wapas wahi banein.
  - **Restore (Claude ki salah, owner ne maani):** saath me restore ki command, ek baar local database pe chala ke jaanchi jaye; restore ke bina backup adhoora.
  - **Files ki jagah (owner):** downloaded files **isi repo ke folder me**, bas GitHub pe nahi (git se bahar).
  - **Suraksha ke 4 pehre (owner ne haan kahi):** folder `.gitignore` me; CI ka pehra jo us folder ki koi file git me dikhe to fail kare; folder prettier, ESLint aur tests ki nazar se bahar; Claude us folder ko `.env` ki tarah kabhi na khole.
  - **Achhi aadat, zaroori nahi (Claude):** jo data dobara ban jaata hai (sessions, idempotency ke jawab, nipte hue events) chhodna, audit log zaroor lena; backup ke liye sirf padhne wala DB user.
- **Kaun chalayega (owner, 2026-11-17):** live system sirf owner chalayega, koi doosra asli user nahi; isliye backup ke waqt "ek pal ka snapshot" ki chinta nahi. Par design aur code asli users maan ke hi honge (Q5).
- **Jaanchna baaki (Claude):** Atlas free cluster ki hafte ki data-transfer seema, taaki pata ho hafte me kitni baar poora backup liya ja sakta hai.
- **Status:** Jawab mila

## Q5. MongoDB pe orders, inventory, payments aur ledger

- **Sawal:** paisa aur stock ka poora hisaab (double-entry ledger, gapless invoice number, reservation) MongoDB pe hi rahe?
- **Vikalp:** (a) MongoDB hi, par har invariant ki saaf list (unique index, conditional update ya sirf code) aur contention tests; (b) sirf finance / ledger ke liye relational store; (c) finance ka scope chhota karna.
- **Salah:** (a) abhi, stack nahi badalna. Finance ka poora scope (settlement, TCS / TDS, GST registers) rehta hai to (b) ko finance wale batch me dobara parkha jaye.
- **Owner ka jawab (2026-11-17):** **finance ke liye PostgreSQL** (vikalp (b)); baaki services MongoDB pe. Har niyam ki saaf list (kaunsa unique index se, kaunsa conditional update se, kaunsa code + raat ki jaanch se) aur har ek ka test.
- **Owner ka niyam (isi jawab ke saath, poore project pe laagu):** system sirf owner chalayega, par **code sirf owner ke liye nahi likhna**. Ekdum production-grade: ye maan ke design aur code karna hai ki asli users use kar rahe hain, halaaki karenge nahi.
- **Is niyam ka asar yahan (Claude):** load wali chintaayein (ek saath kai checkout, hot counters, 100 ops/s) khatam nahi hoti. Isliye tests me ek saath chalne wale requests ke tests bhi honge (invoice counter, stock, coupon budget).
- **Asar (Claude):**
  1. "Tech stack wahi rahega" (DECISION_LOG D-001) me ye ek jod hai; main files update karte waqt wahan exception likha jayega.
  2. Stock, coupon budget jaise niyam commerce service (MongoDB) me hain: unki list aur tests waise hi rahenge.
  3. Finance pehle se alag service hai aur data events se leti hai (Q3), isliye SQL saaf alag baithta hai; do databases ke beech koi transaction nahi chahiye.
  4. Kernel packages (transaction, outbox, release steps, idempotency) aaj sirf MongoDB ke liye hain; finance ke liye inka SQL roop chahiye hoga. Ye is faisle ka asli kharcha hai.
  5. Local Docker infra, CI aur backup script me SQL database bhi judega.
- **Jaanchna baaki (Claude):** kaunsa free PostgreSQL provider (storage, sone / pause hone ke niyam, connections ki seema).
- **Aage bheja:** finance ke andar kya-kya PostgreSQL me jayega, aur kernel packages ka SQL roop kaisa hoga: finance aur technical batches me.
- **Status:** Jawab mila

## Q6. Sirf apna warehouse + sirf apni delivery + pehle din poora Pune district (21 hubs)

- **Sawal:** fulfilment ka model kya rahe?
- **Vikalp:** (a) apni fleet rahe, par logistics ek "carrier port" ke peeche bane taaki courier baad me jud sake; (b) seller khud bhi bhej sake; (c) launch ek shehar aur kuch hubs se, poora district baad me; (d) jaisa hai.
- **Salah:** (a) + (c). Apna warehouse aur fleet rahe (batch, expiry aur asli maal pe control), par design courier ke liye khula ho aur pehla area chhota ho.
- **Owner ka jawab (2026-11-17):**
  - **Stock:** har brand ka saara maal sirf Beautinique ke apne warehouse me (Chakan). Brand maal bhejta hai; hum rakhte aur pack karte hain.
  - **Delivery:** customer tak sirf Beautinique ke apne delivery partners. Bahar ki koi courier company nahi.
  - **Maal ka raasta:** brand → warehouse → hub → delivery partner → customer.
  - **Ilaake ke bahar:** delivery unavailable.
  - **Carrier port:** salah maani (is file ka vikalp (a); chat me ise (b) kaha gaya tha). Delivery ka code ek port ke peeche; aaj uske peeche sirf apni fleet.
  - **Seller khud bheje** (is file ka vikalp (b)): nahi; stock aur delivery sirf apni.
  - **Pehle din:** 1 warehouse + **1 hub** (21 nahi). Baaki hubs baad me ek click se judte jayein.
  - **Hub ki shart:** hub tabhi live hoga jab uska poora staff ready ho; staff ke bina hub start nahi hoga.
  - **Location ki seedhi:** India > State > District > Sub-District.
  - **Service on / off ka haq:** Master = State; Super Admin = District; Admin = Sub-District.
- **Pehle din ka ilaaka (owner ne saaf kiya, 2026-11-17):** district me **ek main warehouse**; sub-district me **ek hub**. Pehle din delivery **us sub-district ke saare pincodes** tak hogi, poore district me nahi.
- **Aur saaf kiya (owner, 2026-11-17):**
  - Sub-district ki jagah **sirf hub** hai: parcel aage badhana, stock nahi.
  - **Ek sub-district me sirf ek hub.**
  - **Warehouse se seedha customer ko kuch nahi jayega.** Main city ka alag sub-district nahi hota; wahan bhi warehouse ke paas ek hub banega, aur har parcel hub se hi jayega. Warehouse hub ka kaam nahi karta.
  - **Poora staff:** jo-jo zaroori ho. Staff ki list kaafi had tak pehle se hai (purane docs ke roles); jo missing ho wo jodna hai.
  - **Hub ko live Admin karta hai.**
  - **Upar ka level OFF to neeche sab OFF** (State OFF = uske saare districts, sub-districts aur hubs OFF).
  - **Live hone ki sharten:** State tab tak live nahi jab tak uska kam se kam ek district live na ho. District tab tak live nahi jab tak uske paas warehouse aur hub na ho.
- **Claude ke notes:** (1) [owner ne ye salah maani, 2026-11-17] "ek sub-district me ek hub" niyam ki tarah laagu ho, par data me hub alag record rahe jo sub-district se juda ho, taaki niyam kabhi badle to data na todna pade. (2) Sarkari data me main city bhi ek sub-district ki tarah darj ho to bhi ye model theek baithta hai, kyunki ab har sub-district me hub hi hai; phir bhi data dekh ke pakka karna hai.
- **OFF aur warehouse ke niyam (owner, 2026-11-17):**
  - **OFF karna:** OFF karte hi naya order banna band. Par jagah poori OFF tab tak nahi hogi jab tak uske orders raaste me hain.
  - **Aakhri live district OFF hua:** state bhi OFF hoga, agar uska koi order pending nahi hai.
  - **Order ka warehouse:** user jis district me hai, usi district ke warehouse se.
  - **Upar wala role neeche ka switch chala sakta hai:** haan (salah maani); kisne kya kiya, audit log me.
- **Pincode ke cases (owner ne poochha; Claude ki salah, owner ne maani, 2026-11-17: "jo theek lage"):**
  1. **Buniyadi niyam:** delivery ka faisla naam ya seedhi se nahi, **pincode → theek ek hub** ki mapping se. Har pincode ka ek "primary sub-district" (data se aaye, Admin badal sake).
  2. **Pincode number poore India me ek hi ilaake ka hota hai;** do states alag-alag jagah ke liye wahi number use nahi karte. Asli case: ek hi pincode ka ilaaka do sub-districts, do districts ya (kabhi-kabhi) do states me phaila ho.
  3. **Do sub-districts ya do districts me phaila pincode:** primary sub-district ka hub aur us district ka warehouse serve kare; address me likha district alag ho to bhi order na ruke.
  4. **Do states me phaila pincode:** data me nishaan; customer state chune; chuna hua state live ho tabhi order; GST usi state ke hisaab se.
  5. **Ek jaise naam** (district ya sub-district ke naam alag states me dohraate hain): hamesha id aur sarkari code se, naam se kabhi nahi; screen pe "Sub-District, District, State" saath dikhe.
  6. **Source data me ek pincode ki kai lines** (kai post offices, spelling ke farak): import pe ek pincode = ek record, unique.
  7. **Naam ya seema badle** (district ka naya naam, naya district): code wahi, naam ka itihaas rahe; purane orders me address waisa hi jaisa order ke waqt tha.
  8. **Jis pincode ki mapping nahi:** unavailable, aur Admin ko "bina mapping wale pincodes" ki list.
  9. **Jaanch kab:** serviceability ki jaanch order banate waqt usi transaction me, sirf cart dikhate waqt nahi.
  10. **"Pending order" me returns bhi:** return pickup aur refund poore hone tak jagah poori OFF na ho.
- **Live hone ki sharton ki gaanth:** state OFF ho to district live nahi ho sakta (upar OFF to neeche OFF), aur state tab tak live nahi jab tak ek district live na ho; is tarah pehli baar koi nahi khul sakta.
- **Gaanth ka hal (Claude ki salah, owner ne maani, 2026-11-17):** har level (State, District, Sub-District, Hub) pe do cheezein alag:
  - **Switch:** kisi ne ON dabaya ya nahi (haq upar wali table jaisa).
  - **Asli haal (live):** apna switch ON + upar wala level live. Ye hamesha isi niyam se nikalta hai, kahin alag se save nahi hota.
  - **Sharten sirf live karte waqt rokti hain (owner, 2026-11-17, Q12 me):** live hone ke baad sharat me kami (jaise staff kam) se jagah apne aap band nahi hoti, sirf chetavni aati hai (detail Q12 "Staff kam ho jaye to"). Switch OFF (insaan ka faisla) ka asar turant.
  - **Sharten:** Hub = poora staff ready. District = warehouse + hub tayyar. State = kam se kam ek district ka switch ON aur wo tayyar.
  - **Kholne ka kram:** Admin hub tayyar kare aur sub-district ka switch ON; Super Admin district ka switch ON; Master state ka switch ON; tab sab live.
  - **Band hona:** koi switch apne aap nahi palatta. Aakhri district band hua to state customers ke liye apne aap band dikhega; district wapas khula to state bina dobara dabaye chal padega. Owner ka "pending order" wala niyam laagu: jab tak raaste me orders ya returns hain, us jagah ke purane orders poore hote rahenge, sirf naye band.
- **Aage bheja (Q12 aur logistics batch):** staff ki list me kya missing hai; asli location data dekh ke ginti ki kitne pincodes do sub-districts, districts ya states me phaile hain.
- **Status:** Jawab mila

## Q7. ~80 roles ka seed, permissions ke bina

- **Sawal:** saare roles abhi seed rahen, ya role module ke saath bane?
- **Vikalp:** (a) R1 ke liye ~12 se 15 roles, baaki module ke saath; (b) jaisa hai, saare roles pehle se.
- **Salah:** (a). RBAC engine rakho. Ek account pe 50 grants ki seema ko business niyam nahi, technical seema maana jaye.
- **Chat me vikalp aise rakhe gaye the (2026-11-17):** (a) roles ki poori list design me rahe, par system me role tab chalu ho jab uska module bane; (b) jaisa hai, saare 79 abhi system me; (c) roles hi kam karo (12 se 15).
- **Owner ka jawab (2026-11-17):** salah maani: **chat wala (a)**. Roles ki poori list design me (Q6: staff ki list kaafi had tak hai, missing jodna hai); system me har role tab chalu jab uska module bane, aur usi badlav me uski permissions. RBAC engine waisa hi.
- **Roles ki ginti (owner, 2026-11-17):** ~80 fix nahi hai; zaroorat ke hisaab se roles badh bhi sakte hain. (Code me pehle se: Master naye sub-roles bina deploy ke jod sakta hai, `backend/identity/src/rbac/roles.ts:17-19`.)
- **Owner (2026-11-17):** **har role ke liye owner ka alag email** (alag staff account) rahega.
- **Asar (Claude):** ek account pe 50 roles ki seema owner ke liye ab rukawat nahi; "kaunse roles ek insaan ke paas saath nahi ho sakte" wale niyam bhi apne aap poore. Code me email sirf trim aur lowercase hota hai (`packages/shared/zod/src/identity.ts:4`), `+` wala hissa nahi hatta, to `naam+role@...` jaise alias alag accounts ban sakte hain.
- **Emails ka bantwara (owner, 2026-11-17):** jin roles pe authenticator lagta hai unke liye alag email, baaki roles ke liye alag.
  - **Authenticator kahan lagta hai (code, Claude ne dekha):** 7 apps me har sign-in pe: admin, superadmin, master, support, finance, logistics, growth (`packages/shared/contracts/src/catalogue/identity.ts:34`). Baaki apps me sirf in roles pe: Seller Account Owner, Seller Finance (`backend/identity/src/rbac/roles.ts:119-133`). Customer, delivery, creator aur baaki seller roles pe nahi (khud chaahe to laga sakta hai; ek baar lagaya to har app me maangega).
  - **Saaf kiya (owner, 2026-11-17):** **2 email ids, dono `+` alias ke saath.** Ek email authenticator wale 7 apps ke saare roles ke liye, doosra bina authenticator wale apps (customer, seller, delivery, creator) ke roles ke liye. Har role ka apna alias, yaani har role ka alag account; inbox sirf do.
  - **Dhyan (Claude):** seller app doosre email me aata hai, par uske 2 roles (Seller Account Owner, Seller Finance) pe bhi authenticator lagega.
  - **Bantware ki wajah (owner, 2026-11-17):** jin accounts ko authenticator ki zaroorat nahi, unhe har login pe authenticator na chalana pade; bojh kam karne ke liye.
  - **Code ka sach (Claude ne dekha, `backend/identity/src/login.ts:167-172`):** authenticator **account pe** lagta hai, email ke base pe nahi. Jis account pe authenticator laga hai, wo har app me har sign-in pe maangta hai; jis pe nahi laga, wo sirf authenticator wale apps ya roles me laga ne ko kehta hai. Owner ka maqsad isliye poora ho raha hai ki har role ka **alag account** (alag `+` alias) hai. Do base emails ka bantwara iske liye zaroori nahi, par inbox alag rakhne ke liye kaam ka hai; kuch badalna nahi.
  - **Owner ne saaf kiya (2026-11-17):** ye bantwara sirf suvidha hai, niyam nahi. Doosre email wale kisi account ko authenticator na dene ki koi majboori nahi: jahan zaroori ho wahan de denge (jaise in 2 seller roles pe).
- **`+` alias (owner, 2026-11-17):** abhi ignore (hobby project). Jahan email ka validation hai wahan code comment me likha jayega ki ye `+` alias ko alag nahi pehchanta, aur jaan-boojh ke kyun aisa rakha. Comment me ye bhi ho ki owner ke role accounts isi `+` alias pe tike hain, to alias ko ek maan lene wala badlav (normalisation) unhe tod dega. Ye code ka kaam hai: discovery ke baad, implementation me (abhi code nahi chhua).
- **Aage bheja (security batch B15):** ~80 staff accounts aur internal apps pe har sign-in pe authenticator code: owner ke liye roz ka bojh.
- **Jaanchna baaki (Claude):** live system me jo roles kisi ko diye ja chuke hain, unhe "chalu nahi" karne se pehle dekhna.
- **Status:** Jawab mila

## Q8. Faislon ki process

- **Sawal:** aage se faisle kaise darj hon?
- **Vikalp:** (a) har bada faisla assumption ki tarah: uske vikalp aur "kis saboot se badlega" ke saath; (b) jaisa pehle tha (recommendation maani, approved).
- **Salah:** (a). Ye discovery isi tarah chal rahi hai.
- **Owner ka jawab (2026-11-17):** salah maani: **(a)**.
- **Har bade faisle ke saath kya likha jayega:** (1) faisla; (2) wajah (owner ke shabdon me); (3) kaunse vikalp chhode aur kyun; (4) kis saboot ya haalat me faisla dobara khulega; (5) kisne aur kab; (6) Claude ki salah aur owner ka faisla alag-alag nishaan ke saath.
- **Badalne ka niyam:** purana faisla mitaya nahi jaata; nayi line "badla" ke saath judti hai.
  - **Kahan laagu (owner, 2026-11-17):** faislon ke record (DECISION_LOG) me. Kaam-chalau sawal-jawab files (jaise ye) me sirf aakhri faisla; purani lines hata di jaati hain.
- **Status:** Jawab mila

## Q9. Docs ka bojh aur docs vs code ka farak

- **Sawal:** naye docs kaise hon, aur purane docs (PRD, ARCHITECTURE, TASKS, HANDOFF) ka kya?
- **Vikalp:** (a) chhote docs + decision records, ek fact ek jagah, "bana hai" ka daawa sirf code link ke saath; purane docs archive; (b) purane docs hi update hote rahen.
- **Salah:** (a). Purane docs ka faisla docs ke dhaanche wale batch (B17) me.
- **Saath ka sawal:** docs "2 developers" kehte hain, git me ek hi insaan ke do naam dikhte hain. Asal me kitne log hain? (Q1 se juda.)
  - **Jawab (Q1 me mila, owner, 2026-11-17):** ek hi insaan; "2 developers" = owner ke 2 Claude accounts. Docs ki ye wording baad me badalni hai.
- **Farak kyun hota hai (Claude):** ek hi baat kai docs me likhi (badlav ek me, baaki bhool jaate hain); "bana hai" ka daawa bina saboot; bade docs (ARCHITECTURE 772 lines, PRD 584, HANDOFF 439, TASKS 433; `docs/` ~2 MB) har session poore nahi padhta.
- **Owner ka jawab (2026-11-17):** salah maani: **(a)**.
  - **Naye docs:** chhote docs aur decision records (format Q8 wala). Har baat sirf ek jagah, baaki jagah sirf link. "Bana hai" sirf code ya test ke link ke saath. Files zyada hongi, isliye ek index file.
  - **Mel (Claude):** owner ka apna docs plan (main PROJECT_PLAN, `decisions/`, `tasks/<flow>/TASK.md`) isi tarah ka hai.
- **Purane docs (Claude ki salah, owner ne maani, 2026-11-17):**
  - **Product aur design docs (PRD, ARCHITECTURE, TASKS, DESIGN):** naye docs ban jaane ke baad `docs/archive/` me, top pe note ke saath ki ye sirf reference hain, sach nahi. Git me history rahegi.
  - **Kaam ke tareeke ke docs (RULES, HANDOFF, GIT_SKILLS, MEMORY):** yahi rahen aur update hon. HANDOFF chhota ho (owner ke 2 accounts ke beech pul).
  - **Kab:** abhi kuch nahi hilega. Ye tab hoga jab B17 (docs ka dhaancha) tay ho aur naya PROJECT_PLAN ban jaye; tab tak CLAUDE.md, skills aur HANDOFF purane paths se jude hain.
- **CI me path check (Claude ki salah, marzi owner ki):** CI check jo dekhe ki docs me likhe file paths repo me sach me hain.
  - **Owner ka jawab (2026-11-17):** **haan, chahiye.** Ye code ka kaam hai: discovery ke baad, implementation me (abhi code nahi chhua).
- **Status:** Jawab mila

## Q10. Guest cart nahi

- **Sawal:** bina sign-in ke cart me daalna chalega?
- **Vikalp:** (a) haan: server pe anonymous cart (HttpOnly cookie), sign-in pe account ke cart me mil jaye; (b) nahi, cart ke liye sign-in zaroori (jaisa hai).
- **Salah:** (a). "Browser storage me user data nahi" wala niyam isse nahi tootta.
- **Owner ka jawab (2026-11-17):** salah nahi maani: **(b) guest cart nahi**. Cart me daalne ke liye sign-in zaroori (jaisa purane design me hai).
- **Wajah (owner, 2026-11-17):** storage aur kaam kam karne ke liye.
- **Wishlist (owner, 2026-11-17):** **wishlist ke liye bhi sign-in zaroori.** Wajah wahi: storage aur kaam kam.
- **Bina sign-in kya chalega (Claude ki salah, owner ne maani, 2026-11-17):**
  - **Bina sign-in (koi bhi):** products dekhna aur product page; search aur filter (shade, skin type ...); reviews padhna; pincode daal ke delivery hai ya nahi dekhna.
  - **Sign-in zaroori:** cart; wishlist; checkout aur payment; review likhna; orders aur account.
  - **Wajah:** dekhne wale hisse me kuch save nahi hota, to storage wali wajah laagu nahi; visitor ko khareedne se pehle delivery ka pata chal jaata hai.
- **Status:** Jawab mila

## Q11. Customer login: sirf password (min 12) + social

- **Sawal:** customer ke liye email code se sign-in wapas chahiye?
- **Vikalp:** (a) password + social (jaisa code me hai); (b) email code se sign-in bhi; (c) sirf email code + social, password nahi.
- **Salah:** (b). Jo bhi tay ho, PRD aur ARCHITECTURE ek baat kahen.
- **Aaj ka haal (code, Claude ne dekha):**
  - Customer: email + password (min 12, max 128, koi composition rule nahi, leaked password roka jaata hai), aur Google, LinkedIn, GitHub (sirf customer app).
  - Email code sirf sign-up, "password set karo / bhool gaya" aur invite me (`backend/identity/src/otp.ts:72`), login me nahi.
  - Customer session 30 din (har use pe aage badhta hai), zyada se zyada 90 din (`packages/shared/contracts/src/catalogue/identity.ts:405`).
  - PRD (§3.2, §5.0) ab bhi "email OTP se login" kehta hai; ARCHITECTURE §7.1 (2026-10-27) ne email code se login hataya. Hatane ki wajah docs me nahi mili.
- **Kyun zaroori (Claude):** guest cart nahi (Q10), to har naya visitor "Add to cart" pe login pe atakta hai; lamba session matlab login kabhi-kabhi, aur tabhi password bhool jaata hai; bina domain email spam me ja sakta hai aur din ke 300 hi (Q4).
- **Owner ka jawab (2026-11-17):** salah maani: **(b)**. Customer app me teen raaste: password, social (Google, LinkedIn, GitHub), aur email code se sign-in; customer khud chune.
- **Wajah (Claude ki, owner ne maani):** email code ka poora system pehle se bana hai, login me sirf naya purpose judega; session lamba hai to email budget nahi khata; email spam me jaaye to password ka raasta khula rehta hai.
- **Security niyam (Claude ki salah; Security Architect batch B15 me pakke honge):**
  - Jis account pe authenticator laga hai, uspe email code ke baad bhi authenticator maanga jayega; email code authenticator ko bypass nahi karega.
  - Email code se sign-in sirf customer app me; staff apps me nahi.
  - Account utna hi surakshit jitna email inbox; ye seema user ko batani hai.
- **Docs (Q9 ka niyam):** customer login ki baat sirf ek jagah likhi jayegi; PRD aur ARCHITECTURE ka farak naye docs me khatam.
- **Saath ka farak (jaankari, faisla nahi hua):** delivery partner ke liye bhi PRD "email OTP" aur ARCHITECTURE "password + device binding" kehta hai. Owner chahe to alag sawal banega.
- **Status:** Jawab mila

## Q12. Expansion engine aur poore India ka location master, product se pehle

- **Sawal:** poore India ka location data, 4-level area settings aur go-live checklist engine abhi banne chahiye, ya pehle sirf pincode → hub table?
- **Vikalp:** (a) R1 me sirf pincode → hub, engine baad ki release me; (b) jaisa purana plan hai (14 PR ka location + network plan pehle); (c) sirf utna jitna Q6 ko chahiye (detail neeche).
- **Salah:** (c). Q6 me owner ne hierarchy, har level ke switches, live ki sharten aur pincode → hub maange hain, to location master, switches aur sharten R1 me chahiye hi; (a) inke liye kaafi nahi. Sawal "kitna gehra aur kis order me" hai.
- **Purana plan (reference, `docs/backend/T4-LOCATION-PLAN.md` v1.2, 14 PR):** location master (poora India, LGD + India Post, 6 PR); area settings (global → state → district → pincode, 1 PR); network (warehouse, hubs, lanes, delivery promise, 7 PR); go-live checklist engine (templates data me, alag task).
- **Vikalp (c) ki detail (Claude):**
  - **Data:** poore India ka data import (script wahi, data sasta); shak wale pincodes ki jaanch sirf us district ki jo live hona hai. Baaki districts ki jaanch unke live hone se pehle.
  - **Switches aur live:** Q6 wale saare (har level ka switch, live ki haalat hisaab se, store nahi; pending orders tak area poora OFF nahi).
  - **Live ki sharten:** Q6 ki teen sharten code ke niyam ki tarah (hub = staff poora; district = warehouse + hub; state = ek district). Generic template engine baad me, jab sharten badhne lagein.
  - **Area settings:** sirf checkout aur delivery promise ki keys (cut-off, holidays, UPI ki seema). Baaki keys baad me.
  - **Network:** 1 warehouse, hub, pincode → hub, delivery promise. Lanes ki poori detail doosra district aane pe.
- **(c) ka nuksan (Claude):** nayi sharat ya setting jodne pe har baar code + test + deploy (engine me ye Master app se, bina deploy hota). Buniyaad (dhaancha, switches, live ki haalat, pincode → hub) poori banti hai, to baad me engine aaye to sirf "sharten" wala hissa badlega.
- **Owner ka jawab (2026-11-17):** salah maani: **(c)**.
- **Saaf kiya (Claude, 2026-11-17):** (c) me expand karna code ka kaam nahi: naya hub, warehouse ya district jodna, switch ON/OFF, staff ko hub pe role dena, hub live karna aur naye area ka sarkari data laana, sab app ya import command se. Code sirf checklist me bilkul nayi kism ki sharat ke liye.
- **Sudhaar (Claude ki salah, owner ne maani, 2026-11-17):** hub ke staff ki list (kaunse roles, kitne) data me, app ke ek page pe; code me sirf niyam "hub tabhi live jab list ka har role poora bhara ho". List sab hubs ke liye ek common, use sirf **Master** badle, har badlav audit me.
- **Staff kam ho jaye to (owner ka sawal; Claude ki salah (3), owner ne maani, 2026-11-17):** live hub me list se kam staff ho jaye (Master ne list badhayi, ya koi chala gaya).
  - **Chhode vikalp:** (1) turant band: ek resignation se poora area achanak band, aur "kuch apne aap nahi palatta" niyam tootta. (2) purane hubs pe naya niyam nahi: niyam bekaar.
  - **Badlav se pehle:** Master list badle to save se pehle dikhe "is badlav se N live hubs me staff kam ho jayega"; confirm ke baad hi save; audit me.
  - **Kami hone pe:** hub chalta rahe, us pe nishaan (jaise "Delivery Partner 1/2"); us hub ke Admin aur upar Super Admin ko in-app aur email khabar; Admin dashboard me "staff kam wale hubs" ki list.
  - **Faisla insaan ka:** Admin staff bhare, ya switch se hub OFF kare (naye order band, raste wale orders poore).
  - **Dobara live:** OFF hua hub tabhi live jab nayi list poori ho.
  - **Baaki levels:** district aur state ki sharten bhi sirf live karte waqt rokti hain; baad me kami pe chetavni, apne aap band nahi.
  - **Asar:** Q6 ka "asli haal (live)" niyam isi ke hisaab se likha hai.
- **Order (Claude ki salah, owner ne maana, 2026-11-17):** **pehle location, phir products.** Wajah: staff ke grants ka scope (hub, district) aur "hub tabhi live jab staff poora" location aur hub ke records pe tike hain; products dekhne ko location nahi chahiye, par checkout ko chahiye.
- **Naye design me dhyan (Claude):**
  - Purane plan ki area settings me sub-district level nahi tha; Q6 me hai, to naye design me judega.
  - Purane plan me shehar ke beech wale pincodes ka sub-district aksar khaali (LGD me wahan gaon nahi). Yahi Q6 ka "main city ka alag sub-district nahi hota" hai; aise pincode kis hub pe jayein, ye data dekh ke pakka karna baaki (Q6 ke Claude ke note (2)).
- **Status:** Jawab mila

## Q13. Chhote par thos points

- **Q13a. Package publish CLI:** packages npm pe publish hone hain? Nahi to is CLI pe aur kaam nahi. **Salah:** aur nivesh nahi jab tak publish ka plan na ho.
  - **Owner ka sawal (2026-11-17):** abhi ke package flow (publish, create ...) me koi issue hai kya?
  - **Jaanch (Claude, 2026-11-17):** `npm run test:scripts`: 391 me 386 pass. 2 test files Mongo maangti hain (`scripts/e2e`, Docker band tha), 1 test (seller app create) poore run me 120 s se upar gaya, akele 16 s me pass (laptop pe load). QA audit (2026-11-05) me bhi CLI PASS.
  - **Chhoti kamiyan (Claude ne dekhi):**
    1. `scripts/packages/lib/release.ts:469` kehta hai Release workflow "(main)" pe chalao, par workflow sirf `release` pe chalta hai (`.github/workflows/release.yml:24,78`). `main` chuna to kuch publish nahi, aur 48 ghante ka trust nikal sakta hai.
    2. `docs/packages/README.md` §4 step 10 back-merge `release` → `main` kehta hai; RULES §2 (2026-10-25) `release` → `prerelease`. CLI back-merge yaad nahi dilata.
    3. Docs `test:scripts` ko "sirf CLI ke tests" kehte hain, par isme `scripts/e2e` ke tests bhi hain jinhe `infra:up` chahiye.
    4. Laptop pe poore run me ek test 120 s ki seema paar kar sakta hai.
  - **Owner ka jawab (2026-11-17):** **(a) + sudhaar.** CLI jaisa hai waisa rahe, naya kaam tabhi jab publish ka plan bane; upar ki kamiyan 1, 2, 3 theek hongi (chhote sudhaar, naya nivesh nahi). Ye code aur docs ka kaam hai: discovery ke baad, implementation me (abhi code nahi chhua).
  - **Naye design ke saath badlega (galti nahi):** `create:backend` sirf 5 deployables jaanta hai (`packages/shared/contracts/src/platform.ts:18`) aur baaki sab "core ka module" maanta hai (`scripts/packages/lib/create/backend-templates.ts:26`); Q3 ki 9 services ke liye ye badlega. Template me Mongo URI nahi, aur PostgreSQL (Q5) ka option nahi. 20 package files ke links `tree/main/...` pe (`scripts/packages/lib/create/templates.ts:62`); 13b me `main` band hua to ye badlenge.
- **Q13b. Teen long-lived branches + back-merge:** `prerelease` → `release` → `main` rahe, ya do branches? **Salah:** dobara dekho; 1 se 2 logon ke liye bhaari hai.
  - **Vikalp (Claude):** (a) teeno rahen; (b) do branches `prerelease` + `release`, `main` band, GitHub default branch `release`; (c) sirf `main` + feature branches (har merge pe 11 Vercel deploys, Hobby ki 100/din seema). Salah (b).
  - **Owner ka jawab (2026-11-17):** **`main` branch delete karni hai.** Flow: feature branch → `prerelease` (development) → `release` (production); back-merge `release` → `prerelease` waise hi.
  - **Jaancha (Claude, 2026-11-17, local refs, aakhri fetch tak):** `origin/main` aur `origin/release` ki files bilkul same; `main` me sirf `release` → `main` ke merge commits hain. `main` hatane se koi code nahi khoyega.
  - **Kram (Claude ki salah):** pehle saari jagah `main` ka zikr badle (CI flow check, git skills `.claude/skills/_shared/git-rules.md`, RULES §2, CLAUDE.md, AGENTS.md, GitHub ruleset, 20 package files ke `tree/main` links, CLI ka release sandesh aur `docs/packages/README.md` §4), phir GitHub default branch badle, aakhir me `main` delete. GitHub default branch delete nahi karne deta, isliye ye kram zaroori. Delete sirf implementation me, owner ke kehne pe (abhi kuch nahi chhua).
  - **Default branch:** salah `release` (repo dekhne wale ko wahi code dikhe jo live hai).
    - **Owner ka jawab (2026-11-17):** **`release`** default branch.
- **Q13c. Teleconsultation, gift cards, store credit:** scope me rahen? Inka kanooni hissa legal matrix me nahi hai. **Salah:** domain expert ke batch tak roko.
  - **Owner ka jawab, teleconsultation (2026-11-17):** **Skin & Hair Expert aur Beauty Advisor dono roles rahenge** (dono Support Desk ka staff, Support Lead ke neeche; code me `backend/identity/src/rbac/roles.ts:181-182`).
    - **Video call:** apna video system nahi. Customer ko **Google Meet ka dummy link** bheja jayega. Koi asli connect nahi karega, par flow poora banega.
    - **Data me nishaan:** consultation hua aur resolve hua, ye data me mark hoga, jo bhi flow bane.
    - **Wajah (owner):** "ye ek complete plan hoga", par asli video ka jhanjhat nahi.
    - **Roles asli hain (owner, 2026-11-17):** dono dummy nahi, hamare apne staff roles: asli accounts, permissions aur flow. Dummy sirf Meet link aur legal wala data (jaise doctor ka registration number, CLAUDE.md ka "legal cheezein dummy data ke saath" niyam).
  - **Flow ke niyam (Claude ki salah, owner ne maani, 2026-11-17):**
    - **Link:** system khud nakli link nahi banata; staff link daale (sirf `https://meet.google.com/...` maana jaye). Demo me dummy link, DUMMY nishaan ke saath. Asli link daalo to wahi flow asli me chal jaye.
    - **Link kaise pahunche:** email aur in-app (SMS/WhatsApp nahi).
    - **Haalat:** request → time tay aur link bheja → consult hua → resolve; saath me cancel aur customer nahi aaya (no-show). Har badlav audit me, customer ko apni request ki haalat dikhe.
    - **Ek hi flow dono ke liye:** Beauty Advisor aur Skin & Hair Expert ka booking flow ek, farak sirf kaun lega aur notes kaun dekhe.
    - **Skin & Hair Expert ke notes:** health data, to sirf expert aur zaroori support roles dekhein, consultation se pehle customer ki consent. Pakka Security Architect batch B15 me.
    - **Legal:** telemedicine ke niyam ki ek dummy row legal matrix me (doctor ka registration number dummy).
  - **Beauty Advisor ka chat (Claude ki salah, owner ne maani, 2026-11-17):** **live chat nahi, message thread.** Customer "Ask a Beauty Advisor" se sawal bheje, advisor jawab me shade aur product ke links bheje. Support desk ke tickets ke upar chhota jod; server so bhi jaye to message nahi khota. Nuksan: jawab turant nahi, thodi der me.
  - **Gift cards aur store credit (Claude ki salah, owner ne maani, 2026-11-17):** **(c) abhi faisla nahi.** Business Analyst + cosmetics domain expert agent pehle inka kanoon (RBI ke prepaid niyam lag sakte hain, jaancha nahi) aur kaam dekhe, phir owner tay kare.
- **Q13d. Camera aur location permission:** try-on aur address pin ke saath badlegi. Ye sirf note hai, faisla nahi chahiye.
  - **Owner (2026-11-17):** note sahi hai. Aaj customer app me camera, microphone aur location band (`frontend/customer/vercel.json:30`); virtual try-on aur address pin bante waqt sirf apni site ke liye kholna (jaise `camera=(self)`).
- **Owner ka jawab:** upar har hisse (13a–13d) me.
- **Status:** Jawab mila (gift cards aur store credit domain expert batch me)

## Change log

| Version | Date       | Badlav                                                                           |
| ------- | ---------- | -------------------------------------------------------------------------------- |
| v0.1    | 2026-11-17 | Pehla draft: REPOSITORY_ANALYSIS §6 ke Q1 se Q13, jawab ki jagah ke saath (baaki). |
| v0.2    | 2026-11-17 | Q1 se Q13 ke owner ke jawab aur Claude ki jaanch; sirf aakhri faisle (Q4, Q5, Q6, Q10, Q12, Q13c ki purani lines owner ke kehne pe hatayi). |
