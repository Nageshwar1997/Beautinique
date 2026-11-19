# OPEN QUESTIONS: Beautinique

> **Status:** v1.3.28 (2026-11-19). Khule sawal, aage ke topics aur jaanchna baaki. Cheezein ek-ek karke judengi.

## Is file me kya aayega

- Har sawal: **Sawal**, **Kyun zaroori**, **Vikalp**, **Salah**, **Trade-off**.
- **Status:** `Khula` (jawab baaki), `Charcha` (baat chal rahi), `Tay` ([DECISIONS.md](DECISIONS.md) me gaya), `Roka` (baad me).
- Owner ka jawab sawal ke neeche: sirf chuna hua vikalp aur DECISIONS ki link. Jawab badle to purani line hata ke nayi.
- Jo sawal kisi khule sawal pe tike nahi, wo ek saath aate hain; jo kisi khule sawal pe tika ho, wo us sawal ke jawab ke baad (owner, 2026-11-18).
- Sawal me agle sawal ka zikr nahi hota.
- Jo sawal aapas me ek doosre pe tike hain, wo ek group (G1, G2 ...) me saath aate hain; group Status ki line me likha hota hai, aur group ke sawalon ka jawab saath diya jaata hai.

## Numbering

Q-001, Q-002 ... kram se. Topics B1, B2 ... kram se. Ek baar diya number kabhi badalta nahi aur dobara use nahi hota.

## 1. Aage ke topics

Topic sirf sawalon ki grouping hai. Har topic ke sawal us topic ki charcha (aur agent, jahan likha hai) ke baad likhe jayenge.

| Topic | Kya                                                                                     | Kaun gehrai me jayega                | Ab tak (2026-11-19)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1    | Fulfilment aur logistics: apna warehouse aur delivery partners, courier, launch ka area | Domain expert                        | Zyadatar tay: D-014, D-015, D-016, D-022, D-027, D-033; maal aana (D-096, D-097), RTO (D-108), partner ki kamaai (D-104), delivery ka vaada (D-117), staff list (D-123). Baaki: pincodes ki jaanch (§2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| B2    | Apps aur roles: kitne apps, launch pe kaunse roles asli                                 | Architect                            | Tay: D-010, D-017, D-044, D-047, D-054.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| B3    | Catalog: variant, shade, size, ingredients, batch aur expiry, content ka maalik         | Domain expert                        | Tay: sirf beauty aur personal care (D-029), drug items kabhi nahi (D-043); batch aur expiry (D-062, D-064, D-067, D-082, D-083); catalog (D-075, D-076, D-084, D-085, D-086, D-098 se D-100, D-127, D-128); agla batch (D-124), recall (D-129); skin type aur concern ke fields (D-137), allergen chetavni (D-159).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| B4    | Pricing, promotions, bundles aur kits                                                   | Domain expert                        | Promotions, coupons aur bundles R2 se (D-055). Tay: daam (D-061, D-065, D-087), kits (D-088), kam expiry ka label (D-089), offers (D-101, D-102), delivery fee (D-107), discount dikhana (D-120), samples (D-121).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| B5    | Cart, checkout, order model (split, partial cancel aur return, exchange)                | Domain expert + Architect            | Guest cart nahi (D-020); payment ke raaste (D-034); ek order me kai sellers, invoice har seller ke GSTIN se (D-030, D-041); parcel (D-077), pick pe kami (D-090), quantity seema (D-091), GSTIN invoice (D-092), delivery pe UPI (D-109), cancel (D-110), stock aur payment ka samay (D-118), order ke baad badlav (D-119).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| B6    | Payments, refunds, settlement, ledger                                                   | Domain expert + Architect + Security | Finance ka database PostgreSQL (D-001), Neon pe (D-057). Tay: fees (D-078, D-094), payable aur payout (D-081), gateway khaata (D-093), chargeback (D-095), udhaar aur kaat (D-103), refund (D-111), bharpai ka daam (D-125). Baaki: finance ke design ke sawal: library, kaunsa data PostgreSQL me, events, backup ka format (R-009).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| B7    | Returns aur replacement: cosmetics ke hygiene niyam                                     | Domain expert                        | Tay: wajahein (D-079), samay-seema (D-080), saboot (D-106), lauta maal (D-112), pickup pe jaanch (D-113), kharcha (D-114), refund kab (D-115), baar-baar return (D-116), refund ya replacement (D-122), skin reaction (D-130).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| B8    | Reviews, ratings, UGC, moderation                                                       | Domain expert                        | Reviews R1 me (D-039); padhna bina sign-in, likhna sign-in se (D-020). Tay: review ka haq (D-135), moderation (D-136, D-146), photo (D-155), nakli review (D-156), inaam nahi (D-158); brand ka jawab (D-160), reviewer ki skin jaankari (D-167), Q&A (D-170), formula badla (D-171).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| B9    | Search, recommendations, virtual try-on                                                 | Domain expert + Architect            | Try-on aur recommendations R2 se (D-055); try-on ke saath camera permission (SR-001). Tay: R1 ke filters aur sort (D-138), kram (D-139), zero result (D-152), stock khatam (D-153), sach aankde (D-154); beauty profile (D-165), sujhaav (D-166), shade finder (D-168), try-on (D-169).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| B10   | Loyalty, gift cards, store credit, subscriptions                                        | Domain expert                        | R2 se (D-055). Tay: loyalty points (D-173, D-174, D-175), referral (D-176), store credit nahi (D-177), dobara kharid (D-178), gift cards ka design abhi aur banana kanooni jaanch ke baad (D-179). RBI ke prepaid (PPI) niyam lag sakte hain, jaancha nahi (R-004).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| B11   | Support, disputes, notifications                                                        | Domain expert                        | Consultation flow aur Beauty Advisor ka message thread tay (D-025); support desk R2 se (D-055), R1 me patla hissa (D-105); order ke emails (D-126); sellers aur staff ke emails (D-140), baaki khabrein (D-141), emails ki chhat (D-142), appeal (D-147), "parcel nahi mila" ka samay (D-148); tickets (D-161), SLA (D-162), grievance (D-163), seller aur partner ke dispute (D-164), consultation (D-172).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| B12   | Analytics aur reporting                                                                 | Architect                            | Finance ki poori reports R2 se (D-055). Tay: seller ki reports (D-143), export (D-144), R1 ke aankde (D-149), behaviour ka data (D-157).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| B13   | Compliance ki gehrai: kya dummy, kya asli                                               | Domain expert                        | Registrations aur kanooni details dummy (D-026); telemedicine ki dummy row (D-025); kanooni jaanch baad me ek agent se (R-004). Tay: live site pe allowlist (D-133), har area ki gehrai (D-134), demo ka nishaan (D-145), legal pages (D-150), data ke haq (D-151).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| B14   | Security: auth, authorization, payments, uploads, abuse, privacy                        | Security Architect                   | Security Architect ka pehla run ho gaya. Tay: sessions (D-180, D-181), rok (D-182), sign-in aur authenticator (D-183 se D-186, D-199, D-200), codes ki seema (D-187), paise ke kaam (D-188 se D-190), data ka samay aur pahunch (D-191 se D-195, D-201, D-202), backup aur secrets (D-196, D-197), data leak (D-198), kai accounts (D-203, D-204); R2 me goodwill coupon (D-205), forms pe bots (D-206), sehat ka data (D-207, D-208). Report docs me area ke batches me (D-209). Batch 1 edge aur hosting (D-210), batch 2 sign-in (D-211), batch 3 sessions (D-212), batch 4 authorization (D-213), batch 5 checkout aur paisa (D-214), batch 6 delivery, daawe aur reviews (D-215), batch 7 files aur personal data (D-216), batch 8 data stores aur services (D-217), batch 9 export, audit, logs aur DevOps (D-218), batch 10 R2 ke hisse (D-219); saari batches poori: niyam SR-001 se SR-088. Baaki: tathya ki jaanch (§2), kanooni jaanch (R-004), aur doosra security run architecture ke faislon ke baad. Pehla niyam SR-001. |
| B15   | Technical: service boundaries, hosting, observability, backup, scale targets            | Architect                            | Tay: services aur databases (D-011, D-050), backup (D-013), hosting (D-028, D-048, D-049, D-051, D-052, D-056 se D-058), performance targets (D-053). Baaki: observability, scale targets, 512 MB me memory (R-007).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| B16   | Docs aur task files ka dhaancha (PROJECT_PLAN, `tasks/NN-<module>/TASK.md`, subtasks)   | Owner ke saath                       | Tay: dhaancha (D-006), tareeka aur CI me docs ke paths ka check (D-019). Baaki: progress % ka niyam ([PROJECT_PLAN.md](PROJECT_PLAN.md) ke saath).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

## 2. Jaanchna baaki

Claude ka kaam: owner ka faisla nahi chahiye, sirf saboot. Nateeja saboot ke saath sahi file me jaata hai (jaise [RISKS.md](RISKS.md) §2).

| Kya                                                                                                                                                                                             | Kis faisle se                  | Kyun                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| Asli location data me main city ke pincodes kis hub pe, aur kitne pincodes do sub-districts, districts ya states me phaile hain                                                                 | D-015, D-016                   | Pincode → hub mapping; D-016 asli data dekh ke dobara khul sakta hai |
| EU ke CosIng jaise public ingredient database ka license aur download ka format                                                                                                                 | D-132                          | Ingredient master list ka import (products badhne pe)                |
| Vercel ke rewrite se backend tak secret header kaise jude, aur Vercel aur Render asli client IP kis header me dete hain                                                                         | D-052, Q-151                   | Backend ka seedha raasta band karna aur rate limit ke liye asli IP   |
| Atlas ke free cluster, Neon ke free plan aur Render Key Value me network allowlist ya IP access list milti hai ya nahi, aur Render ki free web service ke bahar jaane wale IPs tay hain ya nahi | D-011, D-050, Q-158            | Databases ka network band karna (R-022)                              |
| Render ki free web service ke logs kitne din rehte hain, aur public repo pe GitHub secret scanning aur push protection muft chalu hote hain ya nahi                                             | Q-159                          | Incident me logs ki copy (R-024) aur repo ke pehre                   |
| `vercel.app` aur `onrender.com` Public Suffix List me hain ya nahi                                                                                                                              | D-048, SR-027                  | Ek app ki cookie doosre app tak na jaaye                             |
| Vercel ka CDN bahar ke rewrite pe backend ke cache headers kaise maanta hai, aur `Set-Cookie` aur `Cookie` wale jawab pe cache kaisa                                                            | D-052, SR-004                  | Personal jawab cache na ho                                           |
| Neon ke free plan me roles, `sslmode` aur point-in-time restore ki khidki                                                                                                                       | D-057, SR-068, SR-053          | Finance database ke haq aur restore                                  |
| Render Key Value ke free plan me password aur TLS, aur memory bharne pe kya mitta hai                                                                                                           | D-051, SR-070, SR-008          | Rate limits aur cache ka vyavhaar                                    |
| Razorpay: webhook signature ka header aur algorithm, event id aur retry, payment signature ki jaanch, test mode me exact rakam ka UPI QR, refund ki idempotency, chargeback ki samay-seema      | D-034, SR-048 se SR-050, D-191 | Payment aur webhooks ke niyam, delivery saboot ka samay              |
| Email provider: bheje emails ki copy dashboard me kitne din (OTP dikhta hai ya nahi), link tracking default, API key ke haq, shared domain pe SPF aur DKIM                                      | D-028, SR-012, SR-073          | Emails me codes aur links ki suraksha                                |
| Web Push: push services ke hosts ki list aur payload ki seema                                                                                                                                   | SR-072, SR-074                 | Push ki allowlist aur payload                                        |
| LinkedIn aur GitHub sign-in se email "verified" hone ki jaankari milti hai ya nahi                                                                                                              | D-021, SR-017                  | Social sign-in se account jodna                                      |
| Browser me file input ke `capture` se gallery kitni rukti hai                                                                                                                                   | SR-055                         | Delivery saboot ki photo                                             |
| Leak hue passwords ki free range API ki uplabdhi aur seema                                                                                                                                      | SR-013                         | Password ki jaanch                                                   |
| Owner ka laptop: Desktop folder kisi cloud sync me hai ya nahi (repo aur backups isi folder me), aur disk encryption chalu hai ya nahi (owner ke saath)                                         | D-013, D-196, R-023            | Backups ki suraksha                                                  |

## 3. Sawal

### Q-001. Warehouse me rakhe maal ka maalik kaun?

- **Status:** `Tay`. Topic: B3 (batch aur expiry), B6 (settlement).
- **Sawal:** brands ka jo maal hamare warehouse me rakha hai (D-014), bikne tak uska maalik kaun: brand khud, ya Beautinique?
- **Kyun zaroori:**
  - Isi se tay hota hai ki stock ke record me har batch ka maalik kaun hai, warehouse me toot-foot ya chori ka nuksaan kiska hai, seller ko apne stock ki kaunsi report milti hai, maal wapas maangne ka haq kiska hai, aur finance me stock kiski kitaab me hai.
  - D-030 kehta hai customer ka invoice seller ke GSTIN se banega. Jo maal ka maalik nahi, wo uska invoice nahi kaat sakta. D-036 (warehouse wale state ka GSTIN brand ke paas) bhi isi liye zaroori hai ki brand ka apna maal hamare warehouse me rehta hai.
- **Vikalp:**
  - **(a) Brand maalik:** maal bikne tak brand ka. Hum sirf rakhte, pack karte aur pahunchate hain, aur iske liye fees lete hain.
  - **(b) Beautinique khareed leta hai:** maal warehouse me aate hi hamara. Tab customer ka invoice Beautinique ka banega, jo D-030 se takrata hai.
  - **(c) Dono:** kuch brands ka maal (a) jaisa, kuch ka khareeda hua (Beautinique ke ek alag retail seller ke naam se).
- **Salah:** **(a)**. D-030 aur D-036 isi pe tike hain, aur har cheez ka ek hi raasta rehta hai: har batch pe uske seller ka record, har bikri ka invoice usi seller ka. Apna brand bhi isi tarah chalega, kyunki wo bhi alag company ka seller hai (D-031).
- **Trade-off:**
  - (a) me warehouse me hamare haath se hua nuksaan (toot-foot, chori, galat dispatch) hamari zimmedari hai, to uski bharpai ka niyam chahiye; aur seller ko apne maal ki ginti dikhani padti hai.
  - (b) me ye sab saral hai, par marketplace ka model hi badal jaata hai, aur expire ya na bika maal hamara nuksaan ban jaata hai.
  - (c) me dono ke niyam aur dono ka hisaab: R1 ke liye bhaari.
- **Kanooni detail jaanchi nahi** (R-004).
- **Owner ka jawab (2026-11-18):** **(a)**, bikne tak maal ka maalik brand. Record: [DECISIONS.md](DECISIONS.md) D-060.

### Q-002. Customer ko dikhne wala price kaun tay kare?

- **Status:** `Tay`. Topic: B4 (pricing).
- **Sawal:** product ka selling price (jo customer deta hai) kaun tay kare: brand (seller), ya Beautinique?
- **Kyun zaroori:**
  - Maal brand ka hai (D-060) aur customer ka invoice bhi brand ke GSTIN se banta hai (D-030). Invoice pe likha daam jo tay kare, wahi bechne wala hai: isliye ye marketplace model ki seedhi baat hai.
  - Isi se tay hota hai ki seller app me price ka form kaisa ho, price badalne ka itihaas aur jaanch kaun rakhe, hamara commission kis daam pe lage, aur aage ke discounts (R2, D-055) seller ka price badlenge ya alag se dikhenge.
  - Kanoon ki ek pakki seema: pack pe chhapa MRP (saare tax samet) se zyada daam pe bechna mana hai.
- **Vikalp:**
  - **(a) Brand poori tarah azaad:** brand jo chahe daam rakhe, bas MRP se zyada nahi. Hum koi aur jaanch nahi karte.
  - **(b) Beautinique tay kare:** hum daam rakhte hain, brand ko apna hissa milta hai.
  - **(c) Brand tay kare, platform ke niyam ke saath:** brand daam rakhe, par platform ye niyam laagu kare:
    1. Daam MRP se zyada nahi, aur 0 se zyada.
    2. Har badlav ka itihaas: kisne, kab, purana daam, naya daam.
    3. Ek baar me bada badlav (jaise 50% se zyada upar ya neeche; number pricing ki charcha me) pe seller se dobara confirm, taaki ₹1,999 ki jagah ₹199 jaisi galti pakdi jaye.
    4. Platform seller ka daam kabhi nahi badalta. Platform ka diya discount (R2) alag dikhta hai.
- **Salah:** **(c)**. Daam bechne wale ka hi rehta hai (D-030, D-060 ke saath seedha mel), aur niyam 1 se 3 customer aur seller dono ko galti se bachate hain. Ye kaam chhota hai: ek check, ek itihaas ki table, ek confirm step.
- **Trade-off:**
  - (a) sabse saral, par galat daam (typo) seedha live ho jata hai aur koi itihaas nahi rehta.
  - (b) me marketplace ka model toot-ta hai: invoice brand ka, par daam hamara. Brand ke liye judna mushkil, aur platform ke daam tay karne pe kanoon ke sawal uth sakte hain (jaancha nahi).
  - (c) me seller ko bade badlav pe ek extra click.
- **Kanooni detail jaanchi nahi** (R-004).
- **Owner ka jawab (2026-11-18):** **(c)**, brand tay kare, platform ke 4 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-061.

### Q-003. Expire hone wala ya na bika maal: nuksaan kiska, aur kya hota hai?

- **Status:** `Tay`. Topic: B3 (batch aur expiry), B6 (settlement).
- **Sawal:** hamare warehouse me brand ka jo maal expire hone wala hai, expire ho gaya, ya bahut der se nahi bik raha, uska nuksaan kiska hai, aur us maal ka kya hota hai?
- **Kyun zaroori:**
  - Cosmetics me expiry asli jokhim hai: har batch ki expiry date hoti hai, aur expire ya expire hone ke kareeb maal customer ko nahi jaana chahiye.
  - Maal brand ka hai (D-060), isliye nuksaan bhi seedha brand ka banta hai. Par asli sawal ye hai ki warehouse me pada aisa maal kaun, kab aur kaise hataye. Koi niyam na ho to expired maal warehouse ki jagah gherta hai, galti se pack ho sakta hai, aur kisi ki zimmedari nahi rehti.
  - Isi se tay hota hai: receiving pe kitni bachi expiry chahiye (D-014 me jaanch tay hai, seema nahi), bikri kab band ho, brand ko kab khabar mile, maal wapas ya nasht kaise ho, aur iski fee seller ke hisaab (B6) me kaise kate.
- **Vikalp:**
  - **(a) Brand ka nuksaan, brand khud sambhale:** platform sirf report dikhata hai; brand jab chahe maal wapas maange. Platform ke apne koi niyam nahi.
  - **(b) Brand ka nuksaan, platform ke niyam ke saath:**
    1. **Receiving pe:** batch ki bachi expiry ek kam se kam seema se kam ho to maal wapas (jaise 6 mahine; number B3 ki charcha me, category ke hisaab se alag ho sakta hai).
    2. **Bikri band:** bachi expiry ek seema se kam hote hi wo batch bikna band (jaise 3 mahine), taaki customer ko kam se kam itni expiry mile. Pick karte waqt sabse pehle expire hone wala batch pehle jaata hai.
    3. **Khabar:** brand ko bikri band hone se pehle alert, aur band hone pe dobara.
    4. **Brand ka chunaav:** bikri band hone ke baad brand tay din me chune (jaise 15 din): maal apne kharche pe wapas le jaaye, ya hum nasht karein aur disposal fee lein. Tay din me jawab na aaye to hum nasht karte hain aur fee lagti hai.
    5. **Na bika maal (expire nahi):** brand kabhi bhi apne kharche pe wapas maang sakta hai.
    6. **Record:** har wapsi aur har disposal ka record (batch, ginti, tareekh, kisne kiya); disposal kanoon ke hisaab se (dummy).
  - **(c) Nuksaan baant lo:** platform expire hone ke kareeb maal ka kuch hissa khud uthaye ya khareed le. Ye D-060 (maal brand ka) se takrata hai aur hamara kharcha badhata hai.
- **Salah:** **(b)**. Nuksaan brand ka rehta hai (D-060 ke saath seedha), aur niyam warehouse ko saaf aur customer ko surakshit rakhte hain. Brand chahe to bikri band hone se pehle khud daam ghata sakta hai (D-061 ke niyam ke andar).
- **Trade-off:**
  - (a) sabse kam kaam, par expired maal warehouse me padha reh sakta hai aur galti se customer tak jaane ka khatra rehta hai.
  - (b) me kaam zyada: expiry ke alert, brand ka chunaav aur uski samay-seema, disposal ka record aur fee. Saare numbers (6 mahine, 3 mahine, 15 din) abhi sirf misaal hain.
  - (c) brands ke liye achha, par hamara nuksaan aur model se takrav.
- **Kanooni detail jaanchi nahi** (R-004): cosmetics ke label pe expiry ke niyam, aur cosmetics nasht karne ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, nuksaan brand ka, platform ke 6 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-062.

### Q-004. Hamare haath se hue nuksaan ki bharpai kis daam pe?

- **Status:** `Tay`. Topic: B6 (settlement), B1 (warehouse).
- **Sawal:** brand ka maal hamari zimmedari me (warehouse, warehouse se hub ka safar, hub, delivery partner) toot jaaye, kho jaaye ya chori ho, to brand ko kis daam pe bharpai milegi?
- **Kyun zaroori:**
  - D-060 ke baad ye hamari zimmedari hai, par daam tay nahi. Isi se tay hota hai ki seller ke hisaab (B6) me kitna credit jaaye, aur hamara kitna nuksaan ho.
  - Zimmedari kab shuru aur kab khatam: receiving pe maal accept hone se, customer ko delivery (ya brand ko wapsi) tak. Receiving se pehle ka nuksaan (brand ki apni gaadi me) brand ka; expiry ka nuksaan brand ka (D-062).
- **Vikalp:**
  - **(a) MRP pe:** pack pe chhapa daam.
  - **(b) Jo brand ko bikne pe milta:** nuksaan ke din ka selling price (D-061 ke itihaas se), usme se hamara commission aur fees ghata ke.
  - **(c) Brand ka bataya cost:** receiving pe brand har batch ka cost bataye, bharpai usi pe.
- **Salah:** **(b)**, in niyam ke saath:
  1. **Daam:** nuksaan ke din ka selling price aur pichhle 30 din ka sabse kam selling price, dono me jo kam ho; usme se commission aur fees ghata ke. Isse brand ki haalat waisi hi rehti hai jaisi bikne pe hoti, aur nuksaan se theek pehle daam badha ke zyada bharpai lena kaam nahi karta.
  2. **Record:** har nuksaan ka record: kab, kahan (warehouse, safar, hub, delivery), kisne pakda, batch, ginti. Seller ko apne panel me dikhe.
  3. **Bharpai:** seller ke hisaab me credit, record banne ke baad agle payout me. Toota maal nasht (D-062 ke record ke saath).
  4. **Baad me mil gaya:** gum hua maal baad me mile aur bikne layak ho, to bharpai wapas kat-ti hai aur maal phir stock me.
  5. **Seller ka daawa:** seller ki ginti hamari ginti se na mile to wo daawa kar sake (support se, B11).
- **Trade-off:**
  - (a) me brand ko bikne se bhi zyada milta hai (uska margin aur tax samet): hamara nuksaan bada.
  - (b) me brand ke liye barabar, aur zaroori data pehle se hai (D-061). Par niyam 1 ka hisaab thoda zyada kaam.
  - (c) asli nuksaan ke sabse kareeb, par brand ka bataya cost jaanchna mushkil, aur har batch pe ek aur field.
- **Kanooni detail jaanchi nahi** (R-004): bharpai pe GST kaise lagta hai, aur brand ke liye kho gaye maal ka tax ka hisaab.
- **Owner ka jawab (2026-11-18):** **(b)**, jitna brand ko bikne pe milta, 5 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-063.

### Q-005. Ek product ke alag batches ka MRP alag ho to customer ko kaunsa MRP dikhe?

- **Status:** `Tay`. Topic: B3 (batch), B5 (cart aur checkout).
- **Sawal:** ek hi product (jaise ek lipstick ka ek shade) ke warehouse me do batch hain, aur dono ke pack pe alag MRP chhapa hai (jaise purana ₹499, naya ₹549). Customer ko site pe kaunsa MRP dikhe, aur daam ki seema kis MRP se tay ho?
- **Kyun zaroori:**
  - Cosmetics me aisa aksar hota hai: brand naye batch pe MRP badhata ya ghatata hai, aur purana batch abhi bik raha hota hai.
  - Kanoon do baatein maangta hai: pack ke MRP se zyada daam nahi (D-061 niyam 1), aur online bechne wala site pe pack ki jaankari (MRP samet) dikhaye. Site ka MRP aur customer ko aaya pack ka MRP alag hon to ye jaankari galat ho jaati hai.
  - D-061 kehta hai platform seller ka daam kabhi nahi badalta, aur D-062 kehta hai sabse pehle expire hone wala batch pehle jaata hai. Ye jawab dono ke saath milna chahiye.
- **Vikalp:**
  - **(a) Ek MRP, sabse kam wala:** saare bikne layak batches me sabse kam MRP site pe dikhe, aur daam usse zyada nahi. Batch koi bhi jaaye.
  - **(b) Batch ke hisaab se:** site pe wahi MRP dikhe jo agle bhejne wale batch ka hai (D-062 ka kram), aur order usi batch se reserve ho. Niyam:
    1. Seller ka ek hi daam (D-061), jo kisi bhi bikne layak batch ke MRP se zyada nahi ho sakta.
    2. Naya batch aaye aur uska MRP seller ke daam se kam ho, to wo batch tab tak nahi bikta jab tak seller daam na ghataye; seller ko alert. Platform daam khud nahi badalta.
    3. Customer ne jo MRP dekha, wahi batch jaata hai.
    4. Ek line ki quantity do batches me bate aur MRP alag ho, to checkout pe line do hisson me dikhe, har hissa apne MRP ke saath (daam wahi).
    5. Invoice me har line ka batch aur MRP.
  - **(c) Har MRP ki alag listing:** ek hi product do baar dikhe, alag MRP ke saath, aur customer khud chune.
- **Salah:** **(b)**. Site pe dikha MRP aur customer ke haath me aaya pack hamesha same, jo kanoon ki maang hai; aur batch ka record (D-062) pehle se ban raha hai, to reservation ko batch tak le jaana chhota kaam hai.
- **Trade-off:**
  - (a) sabse saral, aur customer kabhi pack ke MRP se zyada nahi deta. Par kabhi pack pe site se zyada MRP chhapa aata hai: site ki jaankari aur pack alag.
  - (b) me batch badalte hi site ka MRP badalta hai, checkout me line kabhi do hisson me bat-ti hai, aur niyam 2 ki wajah se naya batch seller ke daam ghatane tak ruk sakta hai.
  - (c) customer ke liye confusing (ek hi cheez do baar), aur search aur reviews do jagah bat jaate hain.
- **Kanooni detail jaanchi nahi** (R-004): online pe pack ki jaankari dikhane ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, batch ke hisaab se, 5 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-064.

### Q-006. Beauty Pro buyers ke liye alag daam ho ya nahi?

- **Status:** `Tay`. Topic: B4 (pricing).
- **Sawal:** Beauty Pro buyers (salon, clinic, spa, freelancer jaise professional, D-032) ko normal customer wala hi daam mile, ya unke liye alag (kam) daam ho sake?
- **Kyun zaroori:**
  - Professional kharidaar zyada maal aur baar-baar lete hain, aur aksar brand ka "trade price" hota hai. Agar platform pe wahi daam mile jo har customer ko, to unke liye Beauty Pro banne ki wajah sirf GST wala invoice reh jaati hai.
  - Isi se tay hota hai: ek product pe ek daam ya do (D-061 ke niyam dono pe), cart me daam kharidaar ke hisaab se badle ya nahi, aur kam daam pe khareed ke aage bechne ka khatra kaise roka jaye.
  - Beauty Pro ke kaam R2 se hain (D-055), par daam ka dhaancha abhi tay ho to catalog aur cart ka design ek baar me sahi banta hai.
- **Vikalp:**
  - **(a) Sabke liye ek daam:** Beauty Pro ko alag daam nahi; farak sirf unke GSTIN wala invoice (taaki wo tax credit le sakein).
  - **(b) Seller chahe to Pro daam rakhe:** seller kisi product pe ek alag Pro daam rakh sakta hai, jo sirf jaanche hue (verified) Beauty Pro buyers ko dikhe. Niyam:
    1. Pro daam normal daam se zyada nahi, aur D-061 ke saare niyam (MRP ki seema, itihaas, bade badlav pe confirm) is pe bhi.
    2. D-064 ka batch wala MRP niyam is pe bhi.
    3. Seller Pro daam na rakhe to Pro buyer ko normal daam.
    4. Pro buyer ko GSTIN wala invoice.
  - **(c) Platform ka Pro discount:** sab products pe Beauty Pro ko ek tay % chhoot, jiska paisa platform deta hai.
- **Salah:** **(b)**. Daam bechne wale ka hi rehta hai (D-061), platform pe koi kharcha nahi, aur seller apne trade price ke hisaab se khud tay karta hai.
- **Trade-off:**
  - (a) sabse saral, par Pro buyers ke liye platform pe aane ki wajah kam.
  - (b) me ek product ke do daam: cart aur product page pe daam kharidaar ke hisaab se, aur kam daam pe khareed ke aage bechne ka khatra (iske liye Pro ki jaanch aur quantity ki seema chahiye).
  - (c) me platform ka seedha kharcha, aur saare sellers ke liye ek jaisi chhoot jo har brand ke hisaab se sahi nahi.
- **Kanooni detail jaanchi nahi** (R-004): kharidaar ke hisaab se alag daam ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, seller chahe to Pro daam rakhe, 4 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-065.

### Q-007. Lambe samay se pade na bike maal pe storage fee ho ya nahi?

- **Status:** `Tay`. Topic: B6 (settlement), B1 (warehouse).
- **Sawal:** brand ka jo maal (expire nahi hua) warehouse me bahut der se pada hai aur nahi bik raha, us pe hum storage fee lein ya nahi, aur kab se?
- **Kyun zaroori:**
  - Warehouse ki jagah ka kharcha hai. D-062 kehta hai na bika maal brand kabhi bhi wapas maang sakta hai, par koi wajah na ho to brand zaroorat se zyada maal bhej ke chhod deta hai, aur warehouse bharta jaata hai.
  - Isi se tay hota hai: har batch kitne din se pada hai uska hisaab, brand ko alert, aur fee seller ke hisaab (B6) me kaise kate.
- **Vikalp:**
  - **(a) Koi storage fee nahi:** fees sirf bikne pe (commission aur fulfilment fee).
  - **(b) Har maal pe har mahine fee:** jitna maal pada hai, utni fee, pehle din se.
  - **(c) Kuch din muft, phir fee:** har batch receiving ke baad tay din tak muft (jaise 90 din). Uske baad har mahine fee, jo jitna purana utni zyada ho sakti hai. Niyam:
    1. Fee shuru hone se pehle brand ko alert, taaki wo chahe to maal wapas le jaaye (D-062 niyam 5).
    2. D-062 me bikri band hua batch (expiry ki wajah se) pe ye fee nahi; us pe D-062 ke niyam.
    3. Fee seller ke hisaab me kat-ti hai (B6), har batch ke hisaab ke saath.
    4. Din aur fee ki rakam settlement ki charcha (B6) me.
- **Salah:** **(c)**. Theek se bikne wale maal pe koi kharcha nahi, aur dead stock pe wajah banti hai ki brand utna hi bheje jitna bikta hai.
- **Trade-off:**
  - (a) sabse saral, par warehouse dead stock se bhar sakta hai, aur iska kharcha hamara.
  - (b) har brand pe kharcha, theek se bikne wale maal pe bhi: chhote brands ke liye bhaari.
  - (c) me har batch ki umar ka hisaab, mahine ki fee ka calculation aur alerts.
- **Owner ka jawab (2026-11-18):** **(c)**, kuch din muft, phir fee, 4 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-066.

### Q-008. Customer ko product page pe expiry dikhe ya nahi?

- **Status:** `Tay`. Topic: B3 (batch aur expiry).
- **Sawal:** customer ko kharidne se pehle pata chale ya nahi ki use jo pack milega uski expiry kab hai, aur kaise?
- **Kyun zaroori:**
  - Cosmetics kharidne wale expiry ke baare me poochhte hain; na dikhe to bharosa kam aur support ke sawal zyada.
  - D-064 ke baad order usi batch se reserve hota hai jiska MRP site pe dikha. Isliye us batch ki expiry bhi pakki pata hai, aur dikhana mumkin hai.
  - D-062 me bikri band ki seema hai (misaal 3 mahine), yaani customer ko kam se kam itni expiry milti hi hai.
- **Vikalp:**
  - **(a) Exact expiry nahi:** sirf ek pakka vaada dikhe: "kam se kam X mahine ki expiry" (D-062 ki seema).
  - **(b) Agle bhejne wale batch ki expiry:** product page, cart aur checkout pe us batch ki expiry (mahina aur saal, jaise pack pe hota hai). Niyam:
    1. D-064 ki tarah: batch badle to dikhi expiry bhi badle.
    2. Ek line do batches me bate to har hissa apni expiry ke saath (D-064 niyam 4 jaisa).
    3. Order ki detail aur invoice me har line ka batch aur expiry.
  - **(c) Dono:** product page pe "kam se kam X mahine" ka vaada, aur cart, checkout aur order me exact expiry.
- **Salah:** **(b)**. Customer ko wahi dikhe jo use milega, aur ye D-064 (MRP batch ke hisaab se) ke saath seedha milta hai: data wahi, sirf ek aur field.
- **Trade-off:**
  - (a) saral, par customer ko asli expiry tab pata chalti hai jab pack haath me aata hai.
  - (b) me jis batch ki expiry kareeb hai (seema ke upar par kam), use customer chhod sakte hain, to wo dheere bikta hai aur brand ke liye D-062 ka wapsi ya disposal badh sakta hai. Brand chahe to aise batch pe daam ghata sakta hai (D-061).
  - (c) me screen pe do tarah ki jaankari: thoda zyada UI aur text.
- **Kanooni detail jaanchi nahi** (R-004): online pe expiry dikhane ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, agle bhejne wale batch ki exact expiry. Record: [DECISIONS.md](DECISIONS.md) D-067.

### Q-009. Transporter ya delivery partner ke haath se hua nuksaan: vasooli ho ya nahi?

- **Status:** `Tay`. Topic: B1 (logistics), B6 (settlement).
- **Sawal:** maal warehouse aur hub ke beech transporter (D-027) ke paas, ya customer tak jaate waqt delivery partner (D-033) ke paas toota, kho gaya ya chori hua. Brand ko bharpai hum dete hain (D-063). Kya hum ye paisa transporter ya delivery partner se vasool karein, aur kaise?
- **Kyun zaroori:**
  - Vasooli na ho to har nuksaan seedha hamara kharcha, aur laaparwahi ya dhokhe (parcel "gum" bata dena) ko rokne ki koi wajah nahi.
  - Par delivery partner gig partner hain (D-033), apni gaadi ke saath. Unki kamaai se kaat-na bharose aur unke bane rehne pe asar daalta hai, aur galat kaat galat insaan pe padti hai.
  - D-027 me har trip ka record (seal number, manifest, dispatch aur receive scan) pehle se hai, yaani transporter ke maamle me saboot hota hai.
- **Vikalp:**
  - **(a) Koi vasooli nahi:** saara nuksaan platform ka kharcha.
  - **(b) Saboot ke saath, alag-alag niyam:**
    1. **Transporter:** seal toota ho, ya hub pe manifest se kam maal mile, to nuksaan transporter ke bill se kat-ta hai (contract ka niyam).
    2. **Delivery partner:** kaat sirf jaanch ke baad, jab saboot ho ki galti unki hai (jaise parcel unhe scan karke diya gaya, aur na delivery ka saboot, na wapsi). Ek baar me aur mahine me kaat ki seema. Partner ko apna paksh rakhne ka mauka, aur faisla staff ka, apne aap nahi.
    3. Baar-baar aisa ho to kaat badhane ki jagah partner ka account rokna (staff ke faisle se).
    4. Har maamle ka record: kya hua, saboot, faisla, kisne kiya.
  - **(c) Hamesha poori vasooli:** jiske paas maal tha, usse poora paisa.
- **Salah:** **(b)**. Transporter ek business hai aur saboot pehle se hai; delivery partner ke saath sakhti sirf saboot pe, seema ke andar, aur unki baat sun ke.
- **Trade-off:**
  - (a) sabse saral aur partners ke liye achha, par nuksaan aur dhokha dono hamare sir.
  - (b) me jaanch ka kaam: staff ka samay, saboot dekhna, partner ki baat sunna, aur seema ka hisaab.
  - (c) seedha, par galat kaat ka khatra, aur partners chhod ke ja sakte hain.
- **Kanooni detail jaanchi nahi** (R-004): gig partners ki kamaai se kaat ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, vasooli sirf saboot ke saath, 4 niyam. Record: [DECISIONS.md](DECISIONS.md) D-068.

### Q-010. Beauty Pro buyer ki jaanch kaise ho?

- **Status:** `Tay`. Topic: B2 (roles), B4 (pricing).
- **Sawal:** koi customer kahe ki wo professional hai (salon, clinic, spa, freelancer, home-based, D-032), to use Beauty Pro (jise Pro daam dikhta hai, D-065) kaise aur kis saboot pe banaya jaye?
- **Kyun zaroori:**
  - Pro daam sirf jaanche hue Pro buyers ko dikhta hai (D-065). Jaanch kamzor ho to koi bhi Pro ban ke kam daam pe khareede aur aage beche: sellers ka nuksaan.
  - D-032 me freelancer aur home-based bhi Beauty Pro ban sakte hain, aur aksar unke paas GSTIN nahi hota. Isliye "sirf GSTIN" wala raasta unhe bahar kar deta hai.
  - Dastavez (documents) personal data hain: unhe kahan aur kaise rakhein, kaun dekhe, ye security ka sawal bhi hai (B14).
- **Vikalp:**
  - **(a) Sirf GSTIN:** sahi GSTIN do, Pro ban jao (GSTIN ki jaanch dummy, D-026).
  - **(b) Saboot + staff ki jaanch:** customer ek saboot de, staff jaanch ke Pro banaye. Niyam:
    1. **Saboot (koi ek):** GSTIN, ya business ka registration (jaise Udyam, dukaan ka licence), ya freelancer ke liye beauty course ka certificate. Sab dummy (D-026).
    2. **GSTIN alag:** GSTIN ho to GSTIN wala invoice (D-065 niyam 4); na ho to Pro daam milta hai par normal invoice.
    3. **Muddat:** Pro darja ek tay muddat (jaise 1 saal) ke liye; phir dobara saboot.
    4. **Staff hata sake:** galat istemaal (jaise bahut zyada maal le ke aage bechna) pe staff Pro darja hata sake, wajah ke record ke saath.
    5. **Dastavez private:** saboot sirf jaanch karne wale staff ko dikhe, public link se nahi.
  - **(c) Koi jaanch nahi:** customer khud bata de ki wo Pro hai.
- **Salah:** **(b)**. D-032 ke saare professional (GSTIN ke bina wale bhi) aa sakte hain, aur jaanch staff ke haath me rehti hai, to Pro daam ka galat istemaal kam hota hai.
- **Trade-off:**
  - (a) apne aap aur saral, par freelancer aur home-based bahar, aur kisi bhi business ka GSTIN chal jaata hai (beauty business ho ya na ho).
  - (b) me staff ka samay, dastavez rakhne ka surakshit intezaam, aur har saal dobara jaanch ka flow.
  - (c) me koi kaam nahi, par Pro daam sabke liye khul jaata hai, aur D-065 ka matlab hi khatam.
- **Kanooni detail jaanchi nahi** (R-004): dastavez rakhne aur personal data ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, ek saboot + staff ki jaanch, 5 niyam. Record: [DECISIONS.md](DECISIONS.md) D-069.

### Q-011. Beauty Pro buyer pe Pro daam ki quantity ki seema ho ya nahi?

- **Status:** `Tay`. Topic: B4 (pricing), B5 (cart).
- **Sawal:** ek jaancha hua Beauty Pro buyer Pro daam (D-065) pe ek product kitna bhi khareed sake, ya ek seema ho?
- **Kyun zaroori:**
  - Pro daam kam hota hai. Seema na ho to koi Pro buyer bahut saara maal le ke aage normal customers ko beche, aur seller ki normal bikri ko nuksaan ho.
  - D-069 me staff galat istemaal pe Pro darja hata sakta hai, par ye tab hota hai jab nuksaan ho chuka. Seema pehle se roke.
  - Har product ki zaroorat alag: salon ek shampoo ke kai bade pack leta hai, par ek lipstick shade ke itne nahi.
- **Vikalp:**
  - **(a) Koi seema nahi:** sirf staff ki nazar aur D-069 niyam 4.
  - **(b) Seller tay kare:** seller kisi product pe Pro daam ki seema rakh sakta hai (ek order me, aur mahine me, har Pro buyer ke liye). Niyam:
    1. Seema seller ki marzi: na rakhe to koi seema nahi.
    2. Seema se upar ki quantity normal daam pe milti hai (rokte nahi). Cart me line do hisson me dikhti hai: Pro daam wala hissa aur normal daam wala (D-064 ke batch wale hisson jaisa).
    3. Staff ko report: har Pro buyer ka mahine ka total, product ke hisaab se, taaki D-069 niyam 4 ke liye saboot rahe.
  - **(c) Platform ki ek seema:** saare products pe ek hi seema (jaise ek order me 10).
- **Salah:** **(b)**. Seller apne product aur trade ki zaroorat jaanta hai, aur seema se upar rok ki jagah normal daam se kharidaar ka kaam bhi nahi rukta.
- **Trade-off:**
  - (a) sabse saral, par aage bechna tab pakda jaata hai jab nuksaan ho chuka.
  - (b) me cart me daam ka hisaab do tarah (Pro aur normal), batch wale hisson (D-064) ke saath milke thoda pecheeda; aur seller ko seema ka form.
  - (c) saare products pe ek number: kahin bahut kam, kahin bahut zyada.
- **Owner ka jawab (2026-11-18):** **(b)**, seller tay kare, 3 niyam. Record: [DECISIONS.md](DECISIONS.md) D-070.

### Q-012. Seller ka payout fees se kam pade to bachi fee ka kya ho?

- **Status:** `Tay`. Topic: B6 (settlement).
- **Sawal:** kisi seller ki fees (commission, storage fee D-066, disposal fee D-062, wapsi ka kharcha) uski bikri se zyada ho jaayein, jaise bikri hi na ho, to jo fee bachi (seller pe udhaar) uska kya ho?
- **Kyun zaroori:**
  - D-066 ki storage fee bikri na hone pe bhi lagti hai, to kam bikne wale seller pe udhaar banna aam baat hai.
  - Koi niyam na ho to udhaar badhta rehta hai aur aakhir me hamara nuksaan. Bahut sakht niyam ho to chhote brands judte hi nahi.
  - Isi se tay hota hai ki seller ke hisaab me "minus" balance kaise chale, aur seller ko kab kya notice jaaye.
- **Vikalp:**
  - **(a) Udhaar aage chale:** agle payouts se kat-ta rahe, aur kuch nahi.
  - **(b) Udhaar aage chale, seema ke baad kadam:**
    1. Udhaar agle payout se pehle kat-ta hai.
    2. Udhaar tay rakam ya tay din (misaal ₹5,000 ya 60 din; number B6 ki charcha me) se zyada ho to seller ko alert, aur payment link se chukane ka mauka (test mode, D-026).
    3. Phir bhi na chukaye to notice ke baad naya maal bhejna band aur seller ki listings ruk jaati hain.
    4. Lambe samay tak na chukaye to account band, aur maal brand ke kharche pe wapas (D-062 jaisa); wapsi ka kharcha bhi udhaar me.
    5. Har kadam ka record aur seller ko notice.
  - **(c) Security deposit:** seller judte waqt deposit de, udhaar usse kate.
- **Salah:** **(b)**. Chhote brand pe pehle din se bojh nahi (deposit nahi), aur udhaar ek seema se aage nahi badhta.
- **Trade-off:**
  - (a) sabse saral, par udhaar badhta reh sakta hai, aur hamara nuksaan.
  - (b) me kadam ka flow: alert, payment link, listings rokna, account band.
  - (c) brands ke liye judne me rukawat, aur deposit ka paisa sambhalna aur wapas karna.
- **Kanooni detail jaanchi nahi** (R-004): seller pe udhaar ki vasooli ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, udhaar aage chale, seema ke baad kadam (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-071.

### Q-013. Customer kahe parcel nahi mila, par delivery partner ne "delivered" kiya: kaun sahi?

- **Status:** `Tay`. Topic: B11 (support aur disputes), B1 (delivery).
- **Sawal:** order app me "delivered" dikhta hai, par customer kehta hai use parcel mila hi nahi. Kaun sahi hai, aur ye kaise tay ho?
- **Kyun zaroori:**
  - Dono taraf dhokha ho sakta hai: customer jhooth bol ke dobara maal ya refund le, ya delivery partner parcel rakh le aur "delivered" kar de. D-068 me partner se vasooli sirf saboot pe hai, to saboot delivery ke waqt hi ikattha hona chahiye.
  - R1 me Delivery app se delivery ka saboot pehle se tay hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1); ye sawal tay karta hai ki saboot kya ho aur jhagde me uska kya istemaal.
- **Vikalp:**
  - **(a) Partner ka "delivered" hi sach:** customer support se shikayat kare, staff apne hisaab se dekhe; koi pakka saboot nahi.
  - **(b) Delivery pe saboot, phir saboot se faisla:**
    1. **Delivery code:** har order ka ek code customer ke app aur email me. Delivery pe partner wo code Delivery app me daalta hai; sahi code = delivery pakki.
    2. **Code na mile** (customer ghar pe nahi, koi aur le raha): parcel ki photo aur delivery ke waqt partner ki location ka record.
    3. **Daawa:** customer tay samay me (misaal 48 ghante) daawa kare. Code se delivered: daawa nahi maana jaata. Sirf photo aur location: staff jaanch karta hai. Koi saboot nahi: customer ko refund ya dobara maal, aur D-068 ke hisaab se partner ki jaanch.
    4. **Record:** baar-baar daawa karne wale customer aur baar-baar aise maamle wale partner, dono ka record aur staff ko report.
  - **(c) Customer hamesha sahi:** daawa aate hi refund.
- **Salah:** **(b)**. Saboot delivery ke waqt hi ban jaata hai, to jhagde me faisla andaaze se nahi, saboot se hota hai, aur D-068 ki vasooli bhi saboot pe tik paati hai.
- **Trade-off:**
  - (a) saral, par faisla andaaze pe: kabhi customer ke saath, kabhi partner ke saath na-insaafi.
  - (b) me delivery pe ek kadam (code), photo aur location ka record (personal data, Security Architect ke saath, B14), aur daawe ki jaanch ka flow.
  - (c) customer ke liye achha, par jhooth bol ke refund lena aasaan.
- **Kanooni detail jaanchi nahi** (R-004): photo aur location jaise personal data rakhne ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, delivery pe saboot, phir saboot se faisla (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-072.

### Q-014. Pehle ka kaam (purana code aur purane docs) kab aur kaise hatega?

- **Status:** `Tay`. Topic: B16 (docs aur dhaancha), B15 (technical).
- **Sawal:** D-003 kehta hai pehle ka kaam sirf reference hai aur aage hat jayega. Wo repo se kab hate, aur kaise?
- **Kyun zaroori:**
  - Jab tak pada hai, repo bhaari hai aur galti se purane ko sach maan lene ka khatra rehta hai (D-003 ki wajah yahi thi).
  - Abhi koi npm command nahi chalta aur pull request pe CI fail hota hai (D-003 ka asar), kyunki root setup purane hisse pe tika hai. Ye naye root setup se hi theek hoga.
  - Par abhi iski zaroorat bhi hai: Agent 2 (domain expert) aur Security Architect purane analysis aur audit se gaps dekh sakte hain.
  - Hatana working tree se hota hai; git history me sab rehta hai, to zaroorat pe wapas dekha ja sakta hai.
- **Vikalp:**
  - **(a) Abhi hatao:** ek commit me sab purana hatao; reference chahiye to git history se.
  - **(b) Do kadam me, zaroorat khatam hone pe:**
    1. Hatane se pehle ek git tag, taaki pura purana kaam ek command se mil sake.
    2. Purane docs: discovery khatam hone pe (Agent 2 aur Security Architect ke baad, planning stage shuru hone se pehle).
    3. Purana code: naya root setup (`package.json`, lint, CI) banne ke saath, implementation stage ka pehla kaam.
    4. Dono baar hatana owner ki haan se (destructive kaam), aur naye docs me iska koi zikr nahi (D-003).
  - **(c) Kabhi na hatao:** reference ke liye hamesha repo me rahe.
- **Salah:** **(b)**. Har hissa tab hatta hai jab uski zaroorat khatam hoti hai: purane docs discovery tak kaam aate hain, aur purana code naye root setup tak hi rukawat hai. Tag se kuch khota nahi.
- **Trade-off:**
  - (a) repo turant saaf, par agents ko purana analysis git history se nikaalna padega; aur npm aur CI tab bhi naye root setup tak nahi chalenge.
  - (b) me do baar ka kaam, aur tab tak repo me purana aur naya dono.
  - (c) me hamesha confusion ka khatra aur bhaari repo: D-003 ke khilaaf.
- **Owner ka jawab (2026-11-18):** **(b)**, do kadam me (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-073.

### Q-015. Pehle ke kaam se kya naye me aaye, aur uski list kab aur kaise bane?

- **Status:** `Tay`. Topic: B16 (docs aur dhaancha), B15 (technical).
- **Sawal:** pehle ke kaam ki kaunsi cheezein (jaise achhe patterns, design ke tokens) naye me laani hain, aur uski list kab aur kaise bane?
- **Kyun zaroori:**
  - D-003 kehta hai pehle ke kaam me jo theek tha wo owner ki haan se naye me aata hai, par ye tay nahi ki kaunsi cheez kis kasauti pe, kab aur kaise.
  - D-073 ke hisaab se purane docs discovery ke aakhir me aur purana code naye root setup ke saath hatenge. Jo lena hai wo usse pehle naye docs me aa jana chahiye, warna git tag se khodna padega.
  - Repo analysis (pehla agent) me lagbhag 15 cheezon ki shuruaati list pehle se hai: jaise route contracts, transactions, idempotency, session model, audit, India ke helpers (GSTIN, PAN, paise ka hisaab), design system ki neev, test ke niyam. Bina tareeke ke ya to cheezein bina parkhe aa jayengi (D-003 ke khilaaf) ya achhi cheezein chhoot jayengi.
  - Naye docs me purane kaam ka zikr nahi hota (D-003), to lene ka tareeka aisa ho ki har naya doc khud me poora rahe.
- **Vikalp:**
  - **(a) Koi list nahi:** agents aur Claude pehla kaam padh ke jo achha lage wo seedha apne sawal ya salah me laayen; kya dekha aur kya chhoda, iska koi record nahi.
  - **(b) Chalti list, discovery ke saath:**
    1. **Shuruaat:** repo analysis ki shuruaati list.
    2. **Har agent (2 se 10):** apni report me ek hissa: apne area me pehle ke kaam se kya lene layak, kyun, aur naye docs me kahan jayega.
    3. **Kasauti:** cheez kisi pakki zaroorat ko hal kare, kisi tay faisle (D-xxx) se na takraye, aur naye doc me naye vakya me likhi ja sake.
    4. **Owner ki haan:** har cheez apne area ke sawalon ke saath, ek-ek karke. Haan ho to sahi naye doc me naye vakya me (zaroorat ho to D-xxx), bina purane kaam ke zikr ke; design tokens jaise values bhi poori naye doc me. Naya code naye doc se banta hai, purane code se copy nahi.
    5. **Aakhri jaanch:** discovery ke aakhir me, purane docs hatne se pehle (D-073 niyam 2), Claude dekhe ki list ki har cheez ya to naye doc me hai ya chhodi gayi; kuch bacha ho to owner se.
  - **(c) Alag agent, abhi:** Agent 2 se pehle ek agent poore pehle ke kaam ko dekh ke poori list ek baar me de; owner ek baar me faisla kare.
  - **(d) Planning stage me:** owner ke saath planning me ek baar list.
- **Salah:** **(b)**. Har cheez tab parkhi jaati hai jab uska area tay ho raha ho (jaise transactions Database Architect ke saath, tokens UX ke saath), alag agent ka kharcha nahi, aur discovery ke aakhir ki jaanch se kuch chhootta nahi.
- **Trade-off:**
  - (a) saral, par koi record nahi: achhi cheez chhoot sakti hai, ya bina kasauti ke aa sakti hai.
  - (b) me har agent ki report thodi lambi, aur discovery ke aakhir me ek jaanch ka kaam.
  - (c) poori list jaldi aur ek jagah, par ek aur agent run (lagbhag ek 5-hour window, R-003), aur kai cheezein (jaise events aur transactions) architecture aur database ke faislon se pehle parkhi jayengi, to dobara dekhni padengi.
  - (d) me abhi koi kaam nahi, par tab tak purane docs hat chuke honge (D-073) aur architecture aur design ke docs ban chuke honge: cheezein der se aur git tag se aayengi.
- **Kanooni detail jaanchi nahi** (R-004): pehle ke kaam ka koi bahar ka asset (font, icon, image) naye me aaye to uska license.
- **Owner ka jawab (2026-11-18):** **(b)**, chalti list discovery ke saath (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-074.

### Q-016. Ek brand ka maal ek se zyada sellers bechna chahein to kaun beche?

- **Status:** `Tay`. Topic: B3 (catalog), B2 (seller ki jaanch).
- **Sawal:** D-030 me har product ka ek hi seller hai, aur D-032 me brand owner aur authorised distributor dono seller ban sakte hain. Agar ek brand ka maal brand khud bhi bechna chahe aur uska distributor bhi, ya do distributors, to kaun bechega?
- **Kyun zaroori:**
  - Ye seller onboarding aur catalog ki neev hai: staff ki jaanch me "ye seller is brand ka maal bech sakta hai ya nahi" ka niyam isi se banta hai.
  - Ek product ki do listings hon to search, reviews aur stock bat jaate hain, aur customer confuse hota hai. D-030 product ke star pe ek seller kehta hai, par brand ke star pe koi niyam nahi.
  - R1 me sirf 2 sellers hain, alag brands ke ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), to takrav nahi hoga; par niyam aur jaanch ka design pehle din se chahiye (production-grade).
- **Vikalp:**
  - **(a) Ek brand, ek seller (brand ko pehla haq):**
    1. Poore platform pe ek brand ka ek hi seller: brand khud, ya brand ka ek authorised distributor.
    2. Distributor ke liye brand ka authorisation letter (dummy, D-026) aur staff ki jaanch.
    3. Brand khud aana chahe aur distributor pehle se ho: distributor ko notice, aur tay din (misaal 30 din) baad brand seller ban jaata hai. Product page aur reviews wahi rehte hain, sirf seller badalta hai. Distributor ka bacha maal uske kharche pe wapas (D-062 niyam 5 jaisa).
    4. Jaanch pe barcode se duplicate check: wahi barcode kisi aur seller ke paas ho to nayi listing rukti hai.
    5. Apna brand (D-031) bhi isi niyam me.
  - **(b) Ek product, ek seller, pehle aane wala:** har product (barcode) ka ek seller, jo pehle manzoor hua. Ek brand ke alag products alag sellers ke paas ho sakte hain.
  - **(c) Ek product, ek seller, brand tay kare:** brand tay kare ki uske kaunse products kis authorised seller ke paas hon; har product ka phir bhi ek hi seller.
- **Salah:** **(a)**. Brand ki authorisation ek hi baar jaanchni padti hai, brand ka saara maal aur reviews ek seller ke paas rehte hain, aur "kis seller ka kaunsa maal" ka jhagda nahi hota. Pehla haq brand ko, kyunki maal aur naam brand ka hai.
- **Trade-off:**
  - (a) me distributor chhod de to brand ke products naya seller aane tak band rehte hain. Naya state khulne pe (D-037) brand ka wahan ka distributor alag ho to wo nahi aa sakta; tab ye niyam D-030 ke saath dobara dekhna padega.
  - (b) me ek brand ke products alag sellers me bat sakte hain: brand ka control kam, aur "pehle aaya" se galat seller ko haq mil sakta hai.
  - (c) me har product pe brand ki marzi ki jaanch se staff ka kaam zyada; aur brand khud platform pe na ho to ye kaun tay kare, ye saaf nahi.
- **Kanooni detail jaanchi nahi** (R-004): brand authorisation aur trademark ke niyam.
- **Owner ka jawab (2026-11-18):** **(a)**, ek brand ka ek seller, brand ko pehla haq (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-075.

### Q-017. Ek product ke variants kin cheezon se banen, aur ye kaun tay kare?

- **Status:** `Tay`. Topic: B3 (catalog).
- **Sawal:** ek product ke variants kin cheezon se banen (shade, size, scent ...), aur ye kaun tay kare: platform ya seller?
- **Kyun zaroori:**
  - R1 ke catalog me shade aur size jaise variants hain ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Har variant ka apna MRP, batch, stock aur expiry hota hai (D-064, D-067); search, filters aur reviews bhi isi pe tikte hain.
  - Galat dhaancha baad me badalna mehenga hai: stock, orders aur reviews ka data bhi badalna padta hai.
  - Cosmetics me ek naam ke product me do tarah ka farak hota hai: sirf rang ya maatra (variant), ya formula hi alag (jaise SPF 30 aur SPF 50), jiske ingredients aur claims alag hote hain.
- **Vikalp:**
  - **(a) Do tay cheezein, sab products pe:** shade aur size.
  - **(b) Category ke hisaab se, platform tay kare:**
    1. Har category ki variant wali cheezein platform tay kare (misaal: makeup me shade aur size; skincare me size; fragrance me size; hair colour me shade; bath & body me scent aur size).
    2. Seller sirf us category ki di hui cheezein chune; ek product pe zyada se zyada 2.
    3. Nayi cheez staff setting se jode, bina code change ya deploy.
    4. Jo farak formula badalta hai (jaise matte ya dewy finish, SPF 30 ya SPF 50, EDT ya EDP) wo alag product hai, variant nahi.
    5. Rating aur reviews product pe (saare variants ke saath), par har review pe uska variant (jaise shade) dikhe.
    6. "Pack of 2" jaisa variant nahi: wo bundle (promotions ki charcha, B4) ya brand ka alag product.
  - **(c) Seller apni marzi ki cheezein banaye.**
- **Salah:** **(b)**. Har category ke products sahi dhang se fit hote hain, filters aur search ek jaise naam se chalte hain, aur formula ka farak alag product banne se ingredients aur claims sahi product pe rehte hain.
- **Trade-off:**
  - (a) saral, par bath & body (scent) aur tools jaise products fit nahi hote.
  - (b) me har category ki list sambhalna staff ka kaam hai, aur kabhi seller ki zaroorat list me na ho to staff ko jodna padta hai.
  - (c) seller ke liye aasaan, par ek hi cheez ke alag naam se filters aur search bigadte hain, aur staff ki jaanch mushkil hoti hai.
- **Owner ka jawab (2026-11-18):** **(b)**, category ke hisaab se platform tay kare (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-076.

### Q-018. Ek order me kai sellers ka maal: ek parcel ya alag-alag, aur order ka dhaancha kya ho?

- **Status:** `Tay`. Topic: B5 (order model), B1 (delivery).
- **Sawal:** ek order me do ya zyada sellers ke items hon (D-030), to customer ko ek parcel mile ya har seller ka alag? Aur order ke andar invoice aur parcel kaise judein?
- **Kyun zaroori:**
  - Invoice har seller ke GSTIN se banta hai (D-030), to ek order ke andar "seller ka hissa" pehle se hai. Parcel kitne hon, isse delivery ka kharcha, delivery code (D-072), wapsi aur return tay hote hain.
  - Saara maal ek hi warehouse me hai (D-014), to alag sellers ka maal ek saath pack ho sakta hai; parcel seller ke hisaab se baantna zaroori nahi.
  - R1 me ek order me dono sellers ke items ho sakte hain ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), to ye R1 ka sawal hai.
- **Vikalp:**
  - **(a) Ek order, hamesha ek parcel:** andar har seller ka alag invoice; ek delivery code (D-072 jaisa).
  - **(b) Har seller ka alag parcel:** har parcel ka alag delivery code aur alag tracking.
  - **(c) Normal ek parcel, majboori me alag:**
    1. Customer ko ek order number. Order ke andar do alag cheezein: seller ke hisse (invoice ke liye) aur parcel (delivery ke liye); dono ek doosre se bandhe nahi.
    2. Normal: poora order ek parcel me, andar har seller ka invoice.
    3. Alag parcel sirf majboori me: size ya wazan ki seema (misaal 5 kg) paar ho, ya koi item baaki ke saath tayyar na ho, taaki baaki maal na ruke.
    4. Har parcel ka apna delivery code (D-072 niyam 1 me jod: alag parcel ho to code parcel ka).
    5. Customer ko order page pe dikhe: kitne parcel, aur kaunsa item kis parcel me.
- **Salah:** **(c)**. Customer ko aam taur pe ek hi delivery milti hai, delivery ka kharcha kam rehta hai, aur bhaari ya adhoora order bhi sambhal jaata hai. Invoice aur parcel alag rakhne se ek ki wajah se doosra nahi badalna padta.
- **Trade-off:**
  - (a) sabse saral aur sasta, par bada ya bhaari order ek parcel me nahi samata, aur ek item ruke to poora order rukta hai.
  - (b) me delivery ka kharcha aur partners ka kaam sellers ki ginti se badhta hai, aur customer ko kai baar ghar pe rehna padta hai.
  - (c) me order ka dhaancha thoda zyada (hisse aur parcel alag), aur D-072 ke code me ek line ka jod.
- **Kanooni detail jaanchi nahi** (R-004): ek parcel me kai sellers ke invoices bhejne ke niyam.
- **Owner ka jawab (2026-11-18):** **(c)**, normal ek parcel, majboori me alag (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-077.

### Q-019. Seller se kaunsi fees li jaayen, aur commission kis rakam pe lage?

- **Status:** `Tay`. Topic: B6 (payments aur settlement).
- **Sawal:** platform seller se kaunsi fees le, aur commission item ke daam (GST samet) pe lage ya taxable value (GST ke bina) pe? Yahan sirf fees ki kisme aur aadhaar, rakam nahi.
- **Kyun zaroori:**
  - Hum maal nahi khareedte; rakhne, pack karne aur pahunchane ke liye fees lete hain (D-060). R1 me har seller ka hisaab hai: order value, commission, GST TCS aur income-tax TDS ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
  - Pehle ke faisle fees ki list pe tike hain: storage fee (D-066), disposal fee (D-062), bharpai me commission aur fees ghatana (D-063), aur bachi fee ka udhaar (D-071).
  - Commission ka aadhaar seller ki kamaai aur platform ka GST hisaab, dono badalta hai.
- **Vikalp:**
  - **(a) Sirf commission:** category ke hisaab se %; rakhna, pack aur delivery usi me. Storage (D-066) aur disposal (D-062) alag.
  - **(b) Commission + fulfilment fee:**
    1. Category ke hisaab se % commission.
    2. Har unit pe tay fulfilment fee (misaal ₹25): rakhne, pack aur delivery ka kharcha.
    3. Saath me storage fee (D-066), disposal fee (D-062) aur wapsi ka kharcha, jaise pehle tay.
    4. Aage ki fees (jaise labelling ya return handling) ka dhaancha bane, par shuru me ₹0.
  - **(c) (b) + shuru se aur fees:** labelling fee, return handling fee, aur maal bhejne ki suchna se farak pe penalty.
  - **Commission ka aadhaar** (har vikalp ke saath): **(i)** item ka daam GST samet, ya **(ii)** taxable value (GST ke bina).
- **Salah:** **(b)** aur aadhaar **(ii)**. Fulfilment fee asli kaam ka kharcha dikhati hai (sasta product bhi utna hi pack hota hai), aur GST ke bina aadhaar seller ke liye seedha hai: GST rate badle to commission nahi badalta. Platform ki fees pe platform ka GST alag line me.
- **Trade-off:**
  - (a) sabse saral, par sasta product platform ke liye nuksaan ka, kyunki pack aur delivery ka kharcha utna hi hai.
  - (b) me do tarah ki fees samjhani padti hain, aur seller ka hisaab thoda lamba.
  - (c) chhote brand ke liye shuru me ulajhan aur bojh.
  - Aadhaar (i) seller ko saral dikhta hai, par GST pe bhi commission lagta hai (seller ke liye mehenga), aur GST rate badle to commission bhi badal jaata hai.
- **Kanooni detail jaanchi nahi** (R-004): commission aur fees pe GST, aur platform ka seller ko fees ka invoice.
- **Owner ka jawab (2026-11-18):** **(b)** aur aadhaar **(ii)**: commission + fulfilment fee, commission GST ke bina wali rakam pe (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-078.

### Q-020. Customer kin wajahon se return kar sake, aur "band" maal ka matlab kya ho?

- **Status:** `Tay`. Topic: B7 (returns).
- **Sawal:** kin wajahon pe return maana jaaye? Kya "man badla" bhi chale, aur chale to kis shart pe? R1 ka niyam "sirf band ya kharab maal" hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), par "band" ka matlab tay nahi.
- **Kyun zaroori:**
  - Khula cosmetic dobara nahi bik sakta (hygiene), to galat niyam se ya to customer ke saath na-insaafi hoti hai, ya khula maal nasht hota hai.
  - R1 ka return flow isi list pe chalta hai; return ki samay-seema, return ka kharcha aur lauta maal kahan jaaye, ye bhi isi pe tikte hain.
  - Kuch products pe factory seal aata hi nahi (jaise kai compacts aur lip balms); unke liye niyam alag chahiye.
- **Vikalp:**
  - **(a) Sirf hamari ya brand ki galti:** transit me toota ya leak, pighla, galat item ya galat shade ya size, item kam, dikhayi gayi se pehle ki expiry (D-067), kharab (jaise pump nahi chalta), ya nakli hone ka shak (staff jaanch). "Man badla" bilkul nahi.
  - **(b) (a) + man badla, sirf band maal pe:**
    1. (a) ki saari wajahein.
    2. "Band" = factory seal ya shrink wrap salamat, aur maal istemaal nahi hua.
    3. Listing pe seller batata hai ki product pe aisa seal aata hai ya nahi; staff listing ki jaanch me ise dekhta hai.
    4. Jis product pe seal aata hi nahi, us pe "man badla" return nahi (hygiene); galti wali wajahein phir bhi chalti hain.
    5. Khula maal jisme koi galti nahi: return nahi. Skin reaction ki shikayat ka raasta alag sawal hai.
  - **(c) (b) + kuch khula maal bhi:** jaise foundation ka shade galat laga to thoda istemaal kiya maal bhi wapas ("shade guarantee").
- **Salah:** **(b)**. R1 ka "band ya kharab" isi ka saaf roop hai, aur listing ka seal wala field ek hi baar me hygiene ka sawal hal karta hai.
- **Trade-off:**
  - (a) customer ke liye kadi: jo maal khola hi nahi, wo bhi wapas nahi hota.
  - (b) me pickup aur warehouse pe seal ki jaanch, aur listing me ek naya field.
  - (c) customer ke liye sabse achha, par khula maal nasht hota hai: nuksaan bada, aur galat istemaal aasaan.
- **Kanooni detail jaanchi nahi** (R-004): return policy dikhane ke niyam, aur khule cosmetics pe "no return" ki shartein.
- **Owner ka jawab (2026-11-18):** **(b)**, galti wali saari wajahein, aur "man badla" sirf band maal pe (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-079.

### Q-021. Return kitne din tak maanga ja sake?

- **Status:** `Tay`. Topic: B7 (returns), B6 (settlement).
- **Sawal:** delivery ke kitne din tak customer return maang sake? Sab wajahon pe ek hi samay, ya wajah ke hisaab se alag (D-079 ki wajahein)?
- **Kyun zaroori:**
  - Transit me toota ya item kam ka daawa jitna jaldi aaye, saboot utna sach hota hai; der se aaye daawe me ye pata karna mushkil hai ki nuksaan kahan hua.
  - Return ki samay-seema seller ke payable pe asar daalti hai: jitni lambi seema, utni der seller ka paisa ruk sakta hai.
  - "Parcel nahi mila" ke daawe ka samay pehle se misaal 48 ghante hai (D-072); baaki wajahon ka samay tay nahi.
- **Vikalp:**
  - **(a) Sab wajahon pe ek hi samay:** 7 din.
  - **(b) Wajah ke hisaab se:**
    1. Dikhne wali galti (toota, leak, pighla, item kam, galat item ya shade ya size): delivery ke 48 ghante tak (misaal), D-072 ke daawe jaisa.
    2. Kharab maal (jaise pump nahi chalta) aur dikhayi gayi se pehle ki expiry: 7 din tak (misaal).
    3. Man badla (sirf band maal, D-079): 7 din tak (misaal).
    4. Nakli hone ka shak: 7 din tak (misaal), staff ki jaanch ke saath.
    5. Samay-seema ke baad kisi batch me dikkat nikle to recall ka raasta (alag sawal).
  - **(c) Sab wajahon pe 15 din.**
- **Salah:** **(b)**. Dikhne wali galti jaldi pakdi jaati hai, to saboot sach rehta hai; baaki wajahon me customer ko poora mauka milta hai, aur seller ka paisa bahut der nahi rukta.
- **Trade-off:**
  - (a) saral, par transit ki galti ka daawa 7 din baad tak aa sakta hai, jab saboot kamzor hota hai.
  - (b) me alag-alag samay customer ko samjhane padte hain; product page aur order page pe saaf dikhna chahiye.
  - (c) customer ke liye achha, par seller ka paisa der tak rukta hai aur daawe ka saboot kamzor hota hai.
- **Kanooni detail jaanchi nahi** (R-004): return ki kam se kam samay-seema ke niyam (agar koi ho), aur kharab maal pe customer ke haq.
- **Owner ka jawab (2026-11-18):** **(b)**, wajah ke hisaab se alag samay (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-080.

### Q-022. Seller ka paisa kab payable ho, aur payout kitni baar ho?

- **Status:** `Tay`. Topic: B6 (settlement).
- **Sawal:** bikri ka paisa seller ke liye kab "payable" (dene layak) ho, aur payout kitni baar ho? R1 me payout haath se "paid" mark hota hai, asli bank transfer nahi ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
- **Kyun zaroori:**
  - Delivery ke baad return aa sakte hain (D-080). Paisa pehle de diya aur return aaya, to wo rakam seller pe udhaar banti hai (D-071).
  - Bharpai (D-063 niyam 3) aur bachi fee ka kaatna (D-071 niyam 1) "agle payout" pe tike hain, aur D-063 ne payout ka cycle settlement ki charcha pe chhoda tha.
  - Chhote brand ke liye paisa kitni jaldi aata hai, ye judne ki ek badi wajah hai.
- **Vikalp:**
  - **(a) Delivery ke din se payable, har hafte payout:** baad ke returns agle payouts se kat-te hain.
  - **(b) Return ki samay-seema ke baad payable, har hafte payout:**
    1. Ek line tab payable hoti hai jab uski sabse lambi return samay-seema (D-080, misaal 7 din) khatam ho aur us pe koi return khula na ho.
    2. Payout hafte me ek baar (misaal har Monday), pichhle hafte tak jo payable hua.
    3. Payout me se pehle udhaar (D-071) aur fees (D-078) kat-ti hain, aur bharpai (D-063) judti hai.
    4. Kam se kam payout rakam (misaal ₹100); usse kam ho to agle hafte me judti hai.
    5. Seller ko har line ki halat dikhe: kab payable hogi, aur kis payout me gayi.
  - **(c) (b) jaisa, par mahine me do baar payout.**
- **Salah:** **(b)**. Return ka khatra khatam hone ke baad hi paisa jaata hai, to returns se udhaar kam banta hai, aur hafte ka payout chhote brand ke liye bahut lamba intezaar nahi.
- **Trade-off:**
  - (a) seller ko paisa sabse jaldi, par har return pe udhaar ka khatra, aur D-071 ke kadam zyada baar.
  - (b) me paisa delivery ke lagbhag 1 se 2 hafte baad aata hai.
  - (c) me payout ka kaam kam, par chhote brand ke liye lamba intezaar.
- **Kanooni detail jaanchi nahi** (R-004): marketplace pe seller ko payment ki samay-seema ke niyam (agar koi ho), aur payout pe GST TCS aur income-tax TDS kaatne ka samay.
- **Owner ka jawab (2026-11-18):** **(b)**, return ki samay-seema ke baad payable, hafte me ek payout (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-081.

### Q-023. Expiry ki seemaon ke number kya hon, aur sab products pe ek jaise ya category ke hisaab se?

- **Status:** `Tay`. Topic: B3 (catalog: batch aur expiry).
- **Sawal:** D-062 ki seemaon ke number kya hon: (1) receiving pe batch ki kam se kam bachi expiry, (2) bikri band hone ki seema, aur (3) bikri band ke baad brand ke jawab ke din? Aur ye sab products pe ek jaise hon ya category ke hisaab se?
- **Kyun zaroori:**
  - D-062 ne niyam tay kiye, par number nahi. R1 me receiving pe batch aur expiry ki jaanch (D-014) aur product page ki expiry (D-067) inhi numbers pe chalti hai.
  - Customer ke paas product khatam karne ka samay hona chahiye: serum aksar 2 se 3 mahine me, aur foundation 6 se 12 mahine me khatam hota hai.
  - Kuch products ki kul shelf life hi chhoti hoti hai (jaise kuch natural products, misaal 12 mahine); sab pe ek kadi seema unhe platform se bahar kar sakti hai.
- **Vikalp:**
  - **(a) Sab pe ek:** receiving pe kam se kam 6 mahine bachi (misaal), bikri band jab 3 mahine se kam (misaal), aur brand ka jawab 15 din (misaal).
  - **(b) Ek default + category ka override:**
    1. Default: receiving pe kam se kam 6 mahine bachi, aur bikri band jab 3 mahine se kam (misaal).
    2. Category ka override setting se, bina code change ya deploy (misaal: sunscreen aur actives jaise vitamin C serum 9 / 4 mahine; chhoti shelf life wale natural products 4 / 2 mahine).
    3. Brand ke jawab ke din sab pe ek (misaal 15 din).
    4. R1 me sirf default bhi chal sakta hai, par override ki setting pehle din se.
  - **(c) Shelf life ke % se:** receiving pe kul shelf life ka kam se kam 50% bacha (misaal), bikri band jab 15% se kam (misaal), saath me kam se kam 3 mahine.
- **Salah:** **(b)**. Samajhna aasaan hai, aur categories ka farak sambhal jaata hai.
- **Trade-off:**
  - (a) saral, par chhoti shelf life wale products ke liye kadi seema.
  - (b) me category ki values staff ko sambhalni padti hain.
  - (c) har product pe sahi baithta hai, par har batch pe kul shelf life (bani hone ki tareekh se expiry tak) chahiye, jo pack pe hamesha saaf nahi hoti.
- **Kanooni detail jaanchi nahi** (R-004): expiry ke kareeb ya expired cosmetics bechne ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, ek default + category ka override (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-082.

### Q-024. Pack pe expiry date na ho to us maal ka kya ho?

- **Status:** `Tay`. Topic: B3 (catalog: batch aur expiry).
- **Sawal:** kuch packs pe expiry date nahi hoti: sirf bani hone ki tareekh (mfg date) aur "itne mahine me istemaal karein" likha hota hai, ya sirf PAO nishaan (khulne ke baad kitne mahine chale, jaise "12M"). Aise maal ka kya ho?
- **Kyun zaroori:**
  - Expiry pe kai faisle tike hain: bikri band ki seema (D-062, D-082), sabse pehle expire hone wala pehle (D-062 niyam 2), batch ka MRP (D-064), aur product page pe expiry (D-067). Expiry na ho to ye sab toot-te hain.
  - Receiving pe staff ko pata hona chahiye ki aisa maal le ya lautaye (D-014).
- **Vikalp:**
  - **(a) Sirf chhapi expiry:** jis pack pe expiry (ya "use before") date nahi, wo receiving pe wapas.
  - **(b) Expiry, ya mfg date + shelf life:**
    1. Pack pe expiry ho to wahi.
    2. Expiry na ho par mfg date aur shelf life (mahine) chhapi ho, to system expiry nikale (mfg date + shelf life); staff receiving pe pack se jaanche.
    3. Sirf PAO wala (na expiry, na shelf life): receiving pe wapas.
    4. PAO ek alag field: product page pe customer ki jaankari ke liye, par expiry ka badal nahi.
  - **(c) Sirf PAO bhi chale:** expiry = mfg date + tay mahine (misaal 30 mahine) maan ke.
- **Salah:** **(b)**. Expiry hamesha pack ki chhapi jaankari se aati hai, andaaze se nahi; aur sahi products (mfg date + shelf life wale) bahar nahi hote.
- **Trade-off:**
  - (a) saral, par kuch sahi products bhi bahar ho jaate hain.
  - (b) me staff ko pack dhyaan se padhna padta hai, aur nikali hui expiry ki jaanch karni padti hai.
  - (c) me andaaze ki expiry customer ko "exact" dikhegi, jo D-067 ke khilaaf hai.
- **Kanooni detail jaanchi nahi** (R-004): label pe expiry ya "use before" date ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, expiry ya mfg date + shelf life; sirf PAO wala maal wapas (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-083.

### Q-025. Seller aur listing ki jaanch kis daayre ka staff kare?

- **Status:** `Tay`. Topic: B2 (roles), B3 (catalog).
- **Sawal:** seller ki manzoori (dummy KYC aur warehouse wale state ka GSTIN, D-036) aur product listing ki jaanch kaun kare: poore desh ki ek team, ya state ke hisaab se alag staff?
- **Kyun zaroori:**
  - Products poore India me dikhte hain (D-035), aur seller ka state uske warehouse wale GSTIN se tay hota hai (D-036). Isi se staff ki permissions ka daayra, kaam ki queue aur appeal ka niyam banta hai.
  - R1 me seller aur catalog dono ki staff approval hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
- **Vikalp:**
  - **(a) Dono poore desh ke:**
    1. Seller Ops (D-044) ki ek team saare sellers manzoor kare; har naye warehouse state ke GSTIN ki jaanch usi queue me alag kaam.
    2. Listing ki jaanch bhi ek team, kaam category ke hisaab se bata hua.
    3. Appeal: jisne reject kiya, wo us appeal ka faisla nahi karta.
  - **(b) Seller state ke hisaab se, listing poore desh ki:** seller ki manzoori warehouse wale state ka staff kare, listing ki jaanch ek team.
  - **(c) Dono state ke hisaab se.**
- **Salah:** **(a)**. Abhi ek hi warehouse state hai, aur ek product ek hi baar jaanchna chahiye, chahe wo kitne bhi states me bike.
- **Trade-off:**
  - (a) me states badhne pe ek team pe bojh badhta hai.
  - (b) me seller ko ek state ka staff aur doosre state ka GSTIN alag log jaanchte hain.
  - (c) me ek product kai baar jaanchna padta hai.
- **Owner ka jawab (2026-11-18):** **(a)**, dono jaanch poore desh ki team kare (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-084.

### Q-026. Shade wale variant pe seller kitni jaankari de?

- **Status:** `Tay`. Topic: B3 (catalog: shade).
- **Sawal:** shade wale variant (D-076) ke saath seller ko kya dena zaroori ho: sirf naam aur swatch photo, ya hex colour, undertone aur depth bhi?
- **Kyun zaroori:**
  - Online cosmetics me galat shade return ki sabse badi wajahon me se hai (D-079 me galat shade ek wajah hai).
  - R1 ka basic filter (shade family), aur aage shade finder aur try-on (R2, D-055) isi data pe tikte hain. Hazaron shades pe ye data baad me bharna mushkil hai.
- **Vikalp:**
  - **(a) Kam:** shade ka naam + swatch photo.
  - **(b) Beech ka:**
    1. Har shade pe naam + swatch photo + hex colour.
    2. Complexion products (foundation, concealer, compact, tinted moisturiser) pe undertone (warm, cool, neutral, olive) aur depth (misaal 6 star: fair, light, medium, tan, deep, very deep) bhi zaroori.
    3. Lip aur eye products pe shade family (jaise nude, pink, red, berry, brown).
    4. Finish, coverage aur alag skin tones pe photo optional.
    5. Staff jaanch me swatch aur hex ka mel moota-moota dekhe.
  - **(c) Poora:** (b) + finish, coverage aur har shade ki alag skin tones pe photo zaroori.
- **Salah:** **(b)**. Filter aur aage ka shade finder sahi data pe chalte hain, aur chhote brand pe bojh bahut zyada nahi.
- **Trade-off:**
  - (a) me filter aur shade finder kamzor rehte hain.
  - (b) me seller ka thoda zyada kaam.
  - (c) chhote brands ke liye rukawat.
- **Owner ka jawab (2026-11-18):** **(b)**, beech ka: naam, swatch aur hex; complexion pe undertone aur depth (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-085.

### Q-027. Product ka HSN code aur GST rate kaun tay kare?

- **Status:** `Tay`. Topic: B3 (catalog), B6 (tax).
- **Sawal:** har product ka HSN code aur GST rate seller bhare, ya platform tay kare?
- **Kyun zaroori:**
  - R1 catalog me HSN aur GST rate hain ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Invoice seller ke GSTIN se banta hai (D-030), yaani supplier seller hai.
  - MRP aur daam tax samet hain (D-061), to rate se hi GST ke bina wali rakam nikalti hai, jis pe commission lagta hai (D-078).
  - Sarkar rate kabhi bhi badal sakti hai (kisi tareekh se).
- **Vikalp:**
  - **(a) Seller dono bhare,** staff jaanche.
  - **(b) Platform ki HSN → rate table:**
    1. Table me har HSN ka rate tareekh ke saath (kis din se kaunsa rate).
    2. Seller category ke allowed HSN me se chune; rate table se aaye; staff jaanche.
    3. Rate badle to table me nayi line nayi tareekh se; us din se naye invoices naye rate pe.
    4. Rate badalne pe sellers ko alert ki apna daam dekh lein (daam platform nahi badalta, D-061).
    5. Sahi HSN ki zimmedari seller ki, kyunki supplier wahi hai.
  - **(c) Platform category se HSN khud lagaye;** seller na badal sake.
- **Salah:** **(b)**. Typo se galat tax nahi lagta, rate badalne ka ek hi jagah hisaab rehta hai, aur zimmedari sahi jagah (seller) rehti hai.
- **Trade-off:**
  - (a) me typo se galat tax aur galat invoice.
  - (b) me ek table sambhalni padti hai.
  - (c) me jis product ka HSN category se alag ho, wo atak jaata hai.
- **Kanooni detail jaanchi nahi** (R-004): cosmetics ke HSN aur rates, aur rate badalne pe MRP aur purane stock ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, platform ki HSN → rate table tareekh ke saath (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-086.

### Q-028. Daam ka kitna bada badlav ho to seller se dobara confirm maanga jaaye?

- **Status:** `Tay`. Topic: B4 (pricing).
- **Sawal:** D-061 niyam 3 me bade badlav pe seller se dobara confirm hai (misaal 50%). Asli seema kya ho?
- **Kyun zaroori:**
  - Daam neeche ki galti (₹1,999 ki jagah ₹199) me stock minton me bik jaata hai, aur nuksaan seller ka hota hai.
  - D-061 ne ye number pricing ki charcha pe chhoda tha.
- **Vikalp:**
  - **(a) 50% dono taraf.**
  - **(b) Alag-alag:** neeche 30% se zyada, ya upar 50% se zyada (misaal).
  - **(c) (b) + MRP ka check:**
    1. (b) ki dono seemaayein.
    2. Naya daam MRP ke 20% (misaal) se kam ho to hamesha confirm, chahe pichhla daam kuch bhi ho.
    3. Pro daam (D-065) pe bhi yahi niyam.
- **Salah:** **(c)**. Neeche ki galti zyada nuksaan wali hai, aur MRP wala check tab bhi pakadta hai jab pichhla daam bhi galat tha.
- **Trade-off:**
  - (a) sabse saral.
  - (b) me neeche ki galti jaldi pakdi jaati hai.
  - (c) me ek aur check; sach me bahut saste product pe seller ko har baar confirm karna padta hai.
- **Owner ka jawab (2026-11-18):** **(c)**, alag-alag seema + MRP ka check (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-087.

### Q-029. Kits aur combos kis roop me bikein?

- **Status:** `Tay`. Topic: B4 (bundles aur kits).
- **Sawal:** gift sets aur routine kits (jaise cleanser + toner + moisturiser) kis roop me bikein?
- **Kyun zaroori:**
  - Cosmetics me kits aur combos aam hain. Har cheez ka apna batch aur expiry hota hai (D-064, D-067), aur GST rate alag ho sakta hai.
  - D-076 me "pack of 2" variant nahi hai: wo bundle ya brand ka alag product hai.
- **Vikalp:**
  - **(a) Sirf brand ka pack kiya kit:** ek barcode, ek MRP, normal product jaisa. Kit ki expiry = sabse pehle expire hone wali cheez ki; kit ki cheezon ki list product page pe.
  - **(b) (a) + usi seller ka combo:**
    1. (a) wala kit R1 se hi, normal product ki tarah.
    2. Combo: "A + B saath me ₹X", sirf ek hi seller ke products ka.
    3. Stock har cheez se ghatta hai; combo ka daam cheezon me baanta jaata hai, aur invoice me har cheez ki line apne batch aur expiry ke saath.
    4. Combo poora lautta hai; ek cheez kharab nikle to sirf usi ka badla ya refund.
    5. Combo R2 se (promotions ke saath, D-055).
  - **(c) (b) + alag sellers ke products ka combo.**
- **Salah:** **(b)**. Brand ka kit R1 me bina naye kaam ke chal jaata hai, aur combo ek hi seller tak rehne se ek daam do invoices me nahi baantna padta.
- **Trade-off:**
  - (a) me combo ke liye seller ko naya barcode banana padta hai.
  - (b) me daam baantne aur stock ka hisaab.
  - (c) bahut bhaari: ek daam do invoices pe, aur return pe jhagda.
- **Kanooni detail jaanchi nahi** (R-004): kai cheezon ke set pe GST (mixed ya composite supply).
- **Owner ka jawab (2026-11-18):** **(b)**, brand ka kit + usi seller ka combo (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-088.

### Q-030. Kam expiry wale batch ke liye "short expiry" label ya alag section ho?

- **Status:** `Tay`. Topic: B4 (pricing), B3 (expiry).
- **Sawal:** jis batch ki expiry kareeb hai (bikri band se pehle, misaal 3 se 6 mahine bachi), uske liye "short expiry" label ya alag section ho?
- **Kyun zaroori:**
  - Product page pe exact expiry dikhti hai (D-067), to customer kareeb expiry wala batch chhod deta hai, aur brand ka nuksaan (D-062 ki wapsi ya nasht) badhta hai.
  - Platform daam nahi badalta (D-061 niyam 4), to koi bhi kadam brand ki marzi se hi ho sakta hai.
- **Vikalp:**
  - **(a) Kuch nahi:** brand chahe to khud daam ghataye.
  - **(b) Label + section:**
    1. Bachi expiry ek seema (misaal 6 mahine) se kam ho to apne aap "short expiry" label.
    2. Brand chahe to apne ghataye daam ke saath use "clearance" section me daale.
    3. Ek waqt me ek hi batch dikhta hai (D-064), to label tabhi aata hai jab wahi batch agla bhejne wala ho.
    4. R2 se (promotions ke saath, D-055).
  - **(c) Platform apne aap discount de:** D-061 niyam 4 se takrata hai.
- **Salah:** **(b)**. Customer ko saaf pata rehta hai, brand ko maal nikaalne ka raasta milta hai, aur daam phir bhi brand ka hi rehta hai.
- **Trade-off:**
  - (a) me nuksaan brand ka, aur disposal zyada.
  - (b) me label ka niyam aur ek naya section.
  - (c) tay faisle (D-061) se takrav.
- **Owner ka jawab (2026-11-18):** **(b)**, "short expiry" label + clearance section (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-089.

### Q-031. Pick pe reserved maal toota ya kam nikle to customer ka kya ho?

- **Status:** `Tay`. Topic: B5 (order), B1 (warehouse).
- **Sawal:** order ke baad warehouse me reserved batch ka unit toota nikle ya ginti kam ho, to customer ke order ka kya ho?
- **Kyun zaroori:**
  - Customer ko jo MRP (D-064 niyam 3) aur expiry (D-067) dikhi, wahi milni chahiye.
  - Warehouse me hua nuksaan hamara hai, aur uski bharpai seller ko D-063 se hoti hai.
- **Vikalp:**
  - **(a) Line cancel:** refund aur customer ko khabar.
  - **(b) Barabar ho to badal do, warna poochho:**
    1. Usi variant ka doosra batch ho jiska MRP wahi ho aur expiry dikhayi gayi se barabar ya baad ki, to bina pooche badal do.
    2. Warna customer se poochho (in-app, email aur browser push), jawab ke liye tay samay (misaal 12 ghante).
    3. Jawab na aaye to wo line cancel aur refund.
    4. Toote maal ki bharpai seller ko D-063 se apne aap.
  - **(c) Hamesha poochho.**
- **Salah:** **(b)**. Customer ka order bina zaroorat nahi toot-ta, aur jo use dikha tha usse kam kabhi nahi milta.
- **Trade-off:**
  - (a) me customer ka order bina zaroorat toot-ta hai.
  - (b) me ek "poochho" ka kadam aur uska samay.
  - (c) me har baar der.
- **Owner ka jawab (2026-11-18):** **(b)**, barabar ho to badal do, warna poochho (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-090.

### Q-032. Normal customer ek order me ek variant ki kitni quantity le sake?

- **Status:** `Tay`. Topic: B5 (cart aur checkout).
- **Sawal:** normal customer (Beauty Pro nahi) ek order me ek variant ki kitni quantity le sake?
- **Kyun zaroori:**
  - Sasta khareed ke aage bechna, aur ek customer ka poora stock le jaana, dono rokne hain. Pro buyer ke liye seema D-070 me hai, normal customer ke liye nahi.
- **Vikalp:**
  - **(a) Koi seema nahi.**
  - **(b) Platform ki default seema:** misaal 10 per variant per order; seller chahe to usse kam rakhe.
  - **(c) Seller tay kare,** platform ki koi default nahi.
- **Salah:** **(b)**. Har product pe ek seema rehti hai, aur seller apne product ke hisaab se use kam kar sakta hai.
- **Trade-off:**
  - (a) me ek order se stock khatam ho sakta hai.
  - (b) me bada kharidaar Beauty Pro (D-069) ki taraf jaata hai.
  - (c) me zyada products pe koi seema nahi rehti.
- **Owner ka jawab (2026-11-18):** **(b)**, platform ki default seema, seller usse kam rakh sake. Record: [DECISIONS.md](DECISIONS.md) D-091.

### Q-033. Normal customer bina Beauty Pro bane GSTIN wala invoice le sake?

- **Status:** `Tay`. Topic: B5 (checkout), B6 (invoice).
- **Sawal:** koi normal customer (Pro nahi) checkout pe apna GSTIN daal ke business invoice le sake?
- **Kyun zaroori:**
  - Pro buyer ko GSTIN wala invoice milta hai (D-065, D-069). Companies gifting ke liye bhi kharidti hain, aur unhe Pro daam nahi, sirf sahi invoice chahiye.
- **Vikalp:**
  - **(a) Nahi,** sirf Pro buyer ko.
  - **(b) Haan:** GSTIN ka format check aur naam; Pro daam nahi; har seller ka invoice customer ke GSTIN ke saath. R2 se (Beauty Pro ke kaam bhi R2, D-055).
  - **(c) Haan, staff ki jaanch ke baad.**
- **Salah:** **(b)**. Business customer bina Pro bane sahi invoice le paata hai, aur format check se galat GSTIN ka jokhim kam rehta hai.
- **Trade-off:**
  - (a) me business customers bahar.
  - (b) me galat GSTIN ka thoda jokhim.
  - (c) me staff ka kaam aur der.
- **Kanooni detail jaanchi nahi** (R-004): B2B invoice aur us pe tax credit ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, haan, format check ke saath, R2 se. Record: [DECISIONS.md](DECISIONS.md) D-092.

### Q-034. Customer ka paisa kis khaate me aaye, aur sellers tak kaise pahunche?

- **Status:** `Tay`. Topic: B6 (payments aur settlement).
- **Sawal:** customer ka payment (prepaid aur delivery pe UPI, D-034) kis khaate me aaye, aur sellers tak kaise pahunche?
- **Kyun zaroori:**
  - Isse ledger ka dhaancha, hisaab ka milaan aur payout ka tareeka tay hota hai. Payout ka samay D-081 me tay hai; ye sawal raasta tay karta hai.
- **Vikalp:**
  - **(a) Platform ka ek payment gateway account:** sab paisa platform ke Razorpay account me; finance me har seller ka hisaab; payout platform kare (R1 me haath se "paid", D-055). Design aisa ki baad me (b) pe jaane me sirf payout ka tareeka badle, hisaab nahi.
  - **(b) Payment pe hi baantna:** payment pakka hote hi har seller ke linked account me transfer, return ki samay-seema tak rok ke.
  - **(c) Har seller ka apna gateway:** ek checkout me sambhav nahi.
- **Salah:** **(a)**. R1 ke liye saral, aur baad me raasta badalna pade to hisaab wahi rehta hai.
- **Trade-off:**
  - (a) me platform ke paas sellers ka paisa rehta hai (zimmedari).
  - (b) me gateway ke linked accounts ka setup aur har seller ke bank ki jaanch.
  - (c) me customer ko ek order ke liye kai payment.
- **Kanooni detail jaanchi nahi** (R-004): marketplace ke liye payment aggregator aur sellers ka paisa rakhne ke niyam.
- **Owner ka jawab (2026-11-18):** **(a)**, platform ka ek payment gateway account. Record: [DECISIONS.md](DECISIONS.md) D-093.

### Q-035. Seller ki fees ki shuruaati rakam (dummy) kya ho?

- **Status:** `Tay`. Topic: B6 (settlement).
- **Sawal:** D-078 ki fees (commission, fulfilment fee) aur D-066, D-062 ki fees ki shuruaati rakam kya ho? Business dummy hai, aur rakam baad me setting se badal sakti hai.
- **Kyun zaroori:**
  - R1 ke seller hisaab me asli jaise numbers chahiye. Storage fee ki rakam aur muft din (D-066) aur disposal fee (D-062) ab tak tay nahi.
- **Vikalp:**
  - **(a) Shuru se category ke hisaab se alag:** commission makeup 15%, skincare 12%, hair 10%, fragrance 8% (misaal); fulfilment fee ₹25 per unit; storage: receiving ke 90 din muft, phir ₹2 per unit per mahina, 180 din ke baad ₹4; disposal fee ₹10 per unit; wapsi ka kharcha asli.
  - **(b) Shuru me sab categories pe ek commission:** commission ka dhaancha category ka hi (D-078), par shuru me sab pe ek rakam (misaal 10%); baaki (a) jaisa. Category ki alag rakam baad me setting se.
  - **(c) Owner apni rakam de.**
- **Salah:** **(b)**. R1 me setup saral, aur category ki alag rakam baad me bina code change ke. Storage fee per unit (cosmetics chhote hote hain); volume ke hisaab se baad me.
- **Trade-off:**
  - (a) asli jaisa, par R1 me zyada setup.
  - (b) saral, par shuru me har category ka asli farak nahi dikhta.
  - (c) me owner ka samay lagta hai.
- **Owner ka jawab (2026-11-18):** **(b)**, shuru me sab categories pe ek commission (misaal rakam). Record: [DECISIONS.md](DECISIONS.md) D-094.

### Q-036. Customer ka chargeback jeete to nuksaan kiska?

- **Status:** `Tay`. Topic: B6 (payments).
- **Sawal:** customer bank se payment ka dispute (chargeback) jeete, to nuksaan kiska: platform ka ya seller ka?
- **Kyun zaroori:**
  - Asli payments me chargebacks aate hain; bina niyam ke har maamla jhagda banta hai. Test mode me chargebacks nahi aate, to ye R2 se (D-055).
- **Vikalp:**
  - **(a) Hamesha platform.**
  - **(b) Hamesha seller.**
  - **(c) Wajah ke hisaab se:**
    1. Product ki shikayat (galat ya kharab maal, brand ki galti): seller.
    2. Delivery ya fraud ka maamla: platform.
    3. Delivery ka saboot mazboot ho (D-072 ka code), to platform dispute lade.
- **Salah:** **(c)**. Nuksaan usi pe jiski galti, aur delivery ke saboot se jhoothe dispute ka mukabla ho sakta hai.
- **Trade-off:**
  - (a) me platform ka nuksaan, chahe galti brand ki ho.
  - (b) me seller ke saath anyay, jab galti delivery ki ho.
  - (c) me har maamle ki jaanch.
- **Owner ka jawab (2026-11-18):** **(c)**, wajah ke hisaab se (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-095.

### Q-037. Brand maal bheje to pehle se suchna zaroori ho, aur receiving pe farak nikle to kya?

- **Status:** `Tay`. Topic: B1 (warehouse), B3 (batch). Group G1.
- **Sawal:** brand maal bheje to kya pehle seller app me shipment ki suchna zaroori ho (variant, batch, expiry ya mfg date + shelf life, har batch ka MRP, ginti)? Aur receiving pe ginti ya batch me farak nikle to kya ho?
- **Kyun zaroori:**
  - Receiving pe kai faisle tike hain: batch aur expiry ki jaanch (D-014, D-083), receiving ki expiry seema (D-062, D-082), batch ka MRP (D-064), hamari zimmedari "accept" se (D-063), aur storage fee ki ghadi (D-066, D-094). In sabke liye "accept" ka matlab saaf chahiye.
  - R1 me maal warehouse me aata hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
- **Vikalp:**
  - **(a) Bina suchna:** maal aaye, staff jo gine wahi record, seller ko report.
  - **(b) Suchna zaroori:**
    1. Receiving pe suchna se milan. Farak (kam, zyada, galat batch, toota aaya) seller ko photo ke saath report; seller tay din (misaal 7) me aitraaz kar sake.
    2. Jo maal accept nahi hua (toota aaya, expiry seema se kam) wo brand ke kharche pe wapas, ya brand kahe to nasht aur fee (D-062 jaisa).
    3. Bina suchna aaya maal alag rakha jaata hai (hold), seller ko alert; tay din me suchna na bane to wapas.
    4. "Accept" = ginti aur jaanch poori hokar staff ka accept scan; zimmedari (D-063) aur storage fee ki ghadi (D-066) isi pal se.
    5. Suchna me har batch ka MRP pehle se ho, to D-064 ka alert maal pahunchne se pehle hi seller ko mil jaata hai.
  - **(c) (b) + aane ka slot:** warehouse ki capacity ke hisaab se brand slot book kare.
- **Salah:** **(b)**; slot tab jab sellers badhein. Farak pe jhagda nahi hota, aur har zimmedari ka shuruaati pal ek hi hai.
- **Trade-off:**
  - (a) me farak pe jhagda (kiski ginti sahi).
  - (b) me seller ka ek extra form.
  - (c) me scheduling ka kaam.
- **Owner ka jawab (2026-11-18):** **(b)**, suchna zaroori (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-096.

### Q-038. Har variant pe brand ka barcode zaroori ho, ya platform apna label lagaye?

- **Status:** `Tay`. Topic: B3 (catalog), B1 (warehouse). Group G1.
- **Sawal:** har variant pe brand ka barcode (EAN) zaroori ho, ya na ho to platform apna label lagaye?
- **Kyun zaroori:**
  - Warehouse me scan karke pick karne se galat shade ya size nahi jaata. Duplicate listing ki jaanch barcode se hoti hai (D-075 niyam 4).
  - Chhote brands ke paas aksar barcode nahi hota.
  - Barcode batch nahi batata, jabki customer ko wahi batch jaana chahiye jiska MRP aur expiry usne dekhi (D-064, D-067).
- **Vikalp:**
  - **(a) Barcode zaroori:** bina barcode product list nahi.
  - **(b) Barcode ho to wahi, na ho to platform ka label:**
    1. Barcode na ho to receiving pe har unit pe platform ka barcode label (labelling fee, D-078 niyam 4: shuru me ₹0).
    2. Warehouse me ek bin me ek variant ka ek hi batch, taaki pick pe sahi batch jaaye.
  - **(c) Har unit pe platform ka label** (barcode ho ya na ho), jisme variant aur batch dono; batch scan se pakka.
- **Salah:** **(b)**. Ek warehouse aur kam sellers ke saath "ek bin, ek batch" sasta hai, aur chhote brands bhi aa paate hain.
- **Trade-off:**
  - (a) chhote brands ke liye rukawat.
  - (b) me labelling ka kaam aur bin ka anushaasan.
  - (c) sabse pakka, par har unit pe mehnat.
- **Owner ka jawab (2026-11-18):** **(b)**, barcode ho to wahi, na ho to platform ka label (2 niyam). Record: [DECISIONS.md](DECISIONS.md) D-097.

### Q-039. Listing ka content kaun likhe, aur badlav pe dobara jaanch kab ho?

- **Status:** `Tay`. Topic: B3 (catalog). Group G2.
- **Sawal:** listing ka content (naam, description, images, ingredients, claims, declarations, net quantity) kaun likhe, staff kya kar sake, aur seller ke har badlav pe dobara jaanch ho ya nahi?
- **Kyun zaroori:**
  - R1 me listing staff ki jaanch ke baad live hoti hai (D-084). Daam ki tarah (D-061 niyam 4) content pe bhi saaf niyam chahiye.
  - Galat ingredients ya claim allergy wale customer ke liye jokhim hai.
- **Vikalp:**
  - **(a) Har badlav pe jaanch:** seller likhe, staff sirf manzoor ya reject kare (tay wajah ke saath). Har badlav naya version; jaanch tak purana version live.
  - **(b) Sirf jokhim wale fields pe jaanch:**
    1. Ingredients, claims, declarations, net quantity, category, images aur shade swatch pe dobara jaanch; tab tak purana version live.
    2. Baaki (description ke shabd, istemaal ka tareeka) turant live, baad me staff ka spot check.
    3. Staff khud koi field nahi badalta, sirf "ye badlo" wajah ke saath bhejta hai.
    4. Har version ka record: kisne, kab, kya badla.
  - **(c) Platform ki content team:** seller sirf data de, platform content likhe aur sudhaare.
- **Salah:** **(b)**. Jokhim wale fields hamesha jaanch se guzarte hain, aur chhote badlav pe staff ka bojh nahi banta.
- **Trade-off:**
  - (a) sabse surakshit, par staff pe bojh aur seller ka intezaar.
  - (b) me fields ki do list sambhalni padti hain.
  - (c) me content hamara ho jaata hai, aur galti ki zimmedari bhi.
- **Kanooni detail jaanchi nahi** (R-004): listing ke galat claim ya jaankari ki zimmedari (seller ya platform).
- **Owner ka jawab (2026-11-18):** **(b)**, sirf jokhim wale fields pe dobara jaanch (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-098.

### Q-040. Ingredients aur allergens kis roop me lein aur dikhayein?

- **Status:** `Tay`. Topic: B3 (catalog). Group G2.
- **Sawal:** product ke ingredients (INCI list) aur allergens seller se kis roop me lein, aur customer ko kaise dikhayein?
- **Kyun zaroori:**
  - Allergy wale customer ke liye ye sabse zaroori jaankari hai.
  - "Free-from" filters (jaise paraben-free, fragrance-free) aur allergen ki chetavni isi data se banti hai.
- **Vikalp:**
  - **(a) Text + label photo:** seller pack jaisi poori ingredients list text me de, aur pack ke label ki photo zaroori; staff photo se milaye.
  - **(b) Structured list:** platform ki ingredient master list (INCI naam) se seller har ingredient chune.
  - **(c) Dono, kram se:**
    1. R1 me (a): text + label photo; product page pe poori list, chhupi hui nahi.
    2. R2 me text se structured list semi-auto bane, staff jaanche.
    3. Uske baad free-from filters aur allergen ki chetavni.
- **Salah:** **(c)**. Label ki photo se ek saath ingredients, declarations aur batch ka format jaanch hota hai, aur R1 pe bhaari master data ka kaam nahi aata.
- **Trade-off:**
  - (a) akela filters nahi deta.
  - (b) R1 me bhaari: master data ek insaan ke liye bada kaam.
  - (c) me R2 me ek baar data badalna padta hai.
- **Kanooni detail jaanchi nahi** (R-004): label aur online page pe ingredients aur allergens dikhane ke niyam.
- **Owner ka jawab (2026-11-18):** **(c)**, par teeno kadam (text + label photo, structured list, free-from filters aur allergen ki chetavni) R1 me. Record: [DECISIONS.md](DECISIONS.md) D-099.

### Q-041. Product claims (vegan, SPF jaise) seller kaise kare, aur platform kya jaanche?

- **Status:** `Tay`. Topic: B3 (catalog). Group G2.
- **Sawal:** "vegan", "cruelty-free", "paraben-free", "dermatologically tested", "organic", "non-comedogenic", "SPF 50 PA++++" jaise claims seller kaise kare, aur platform kya jaanche?
- **Kyun zaroori:**
  - Customer claims dekh ke kharidta aur filter karta hai.
  - Galat claim se customer ko nuksaan ho sakta hai (sunscreen ka SPF galat ho to sehat), aur platform pe bharosa kam hota hai.
- **Vikalp:**
  - **(a) Free text,** koi jaanch nahi.
  - **(b) Platform ki tay claim list:** seller tick kare (khud ki ghoshna), koi saboot nahi.
  - **(c) Tay list + kuch pe saboot:**
    1. Claims sirf platform ki tay list se; filters bhi sirf isi list se.
    2. SPF aur PA pe test report, organic pe certificate, cruelty-free pe certification, dermatologically tested pe test report (sab dummy, D-026); baaki claims khud ki ghoshna.
    3. Staff saboot jaanche; saboot ki expiry ho to reminder.
    4. Description ke free text me claim jaise shabd staff ki jaanch me.
    5. R1 me tay list + ghoshna, aur saboot sirf SPF ke liye; baaki saboot R2 se.
- **Salah:** **(c)**. Filters sach pe chalte hain, aur sehat se jude claim (SPF) pe R1 se hi saboot.
- **Trade-off:**
  - (a) me galat claims.
  - (b) me list hai, par sach ki jaanch nahi.
  - (c) me seller aur staff ka kaam, aur dastavez rakhne ki zimmedari (Security Architect ke saath, B14).
- **Kanooni detail jaanchi nahi** (R-004): cosmetics claims aur galat vigyapan ke niyam.
- **Owner ka jawab (2026-11-18):** **(c)**, tay list + kuch pe saboot (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-100.

### Q-042. Offers aur coupons ka paisa kaun de: brand, platform ya dono?

- **Status:** `Tay`. Topic: B4 (promotions). Group G3.
- **Sawal:** R2 ke offers aur coupons (D-055) ka paisa kaun deta hai: brand, platform, ya dono?
- **Kyun zaroori:**
  - Invoice ka daam, commission ki rakam (D-078), D-063 ki bharpai ka daam, aur D-061 niyam 4 (platform ka discount alag dikhe) isi pe tike hain.
  - Offers R2 se hain, par R1 ki order line me iske khane pehle se chahiye, chahe khaali rahein.
- **Vikalp:**
  - **(a) Sirf brand:** seller ka coupon ya ghataya daam; invoice discount ke baad ke daam pe; commission usi pe.
  - **(b) Brand ya platform:** platform ke coupon me seller ko poora daam milta hai, farak platform deta hai.
  - **(c) (b) + baanta hua:**
    1. Har offer pe brand aur platform ka hissa (%) tay.
    2. Offer ka budget; budget khatam hote hi offer apne aap band.
    3. R2 ki shuruaat (a) aur (b) se; baanta hua offer uske baad.
    4. R1 ki order line me "discount, kisne diya" ke khane.
- **Salah:** **(c)** ka design. Brand aur platform dono apne offer chala sakte hain, aur hisaab har line pe saaf rehta hai.
- **Trade-off:**
  - (a) saral, par platform apni marzi ka offer nahi chala sakta.
  - (b) me platform ka kharcha aur hisaab.
  - (c) me har offer ka hissa aur budget sambhalna.
- **Kanooni detail jaanchi nahi** (R-004): discount pe GST (bikri se pehle ya baad ka), aur platform ke diye discount ka invoice pe asar.
- **Owner ka jawab (2026-11-18):** **(c)**, brand, platform ya baanta hua offer (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-101.

### Q-043. Ek item pe kai offers ek saath lag sakein?

- **Status:** `Tay`. Topic: B4 (promotions). Group G3.
- **Sawal:** ek item pe kai fayde ek saath lag sakte hain? Jaise sale daam + coupon, do coupons, ya Pro daam + coupon. (R2 se, D-055.)
- **Kyun zaroori:**
  - Bina niyam ke offers ka kharcha behisaab badh sakta hai.
  - Pro daam (D-065) ke saath coupon aage bechne ka lalach badhata hai.
- **Vikalp:**
  - **(a) Saaf default:** ek order pe ek coupon; sale daam + coupon chale; Pro daam pe coupon nahi.
  - **(b) Koi mel nahi:** sirf sabse achha ek fayda.
  - **(c) Har offer pe setting:** "kis ke saath chale".
- **Salah:** **(a)** default, aur (c) ka raasta baad me.
- **Trade-off:**
  - (a) me kuch customers ko kam fayda.
  - (b) me sale ke dino me coupon bekaar.
  - (c) me staff ko har offer pe sochna padta hai.
- **Owner ka jawab (2026-11-18):** **(a)**, saaf default. Record: [DECISIONS.md](DECISIONS.md) D-102.

### Q-044. Seller ke udhaar aur delivery partner se kaat ki seemaon ke number kya hon?

- **Status:** `Tay`. Topic: B6 (settlement). Group G4.
- **Sawal:** D-071 ke udhaar ki seema (rakam, din, aur "lambe samay") aur D-068 me delivery partner se kaat ki seema kya ho?
- **Kyun zaroori:**
  - Dono faislon ne numbers settlement ki charcha pe chhode the. Seller ka udhaar R1 ke seller hisaab me hai; partner ki kaat partner ki kamaai pe tiki hai.
- **Vikalp:**
  - **(a) Beech ka:**
    1. Udhaar ₹5,000 ya 60 din paar: alert + payment link.
    2. Uske 30 din baad (notice ke saath): naya maal aur listings band.
    3. Uske 90 din baad: account band.
    4. Delivery partner: ek maamle me zyada se zyada ₹500, mahine me ₹1,500, ya mahine ki kamaai ka 10%, jo kam ho.
    5. Saare number misaal; setting se badal sakein.
  - **(b) Kadi:** ₹2,000 ya 30 din; phir 15 din; phir 45 din.
  - **(c) Narm:** ₹10,000 ya 90 din; phir 60 din; phir 180 din.
- **Salah:** **(a)**. Chhote brand pe shuru me bojh nahi, aur udhaar ek seema se aage nahi badhta.
- **Trade-off:**
  - (a) beech ka raasta.
  - (b) chhote brand ke liye bhaari.
  - (c) me udhaar bada hota jaata hai.
- **Kanooni detail jaanchi nahi** (R-004): gig partner ki kamaai se kaat ke niyam.
- **Owner ka jawab (2026-11-18):** **(a)**, beech ka (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-103.

### Q-045. Delivery partner ki kamaai kaise bane?

- **Status:** `Tay`. Topic: B6 (settlement), B1 (delivery). Group G4.
- **Sawal:** gig delivery partner (D-033) ki kamaai kaise bane?
- **Kyun zaroori:**
  - D-068 ki kaat isi kamaai se hoti hai, aur partners ka payout finance me hai.
- **Vikalp:**
  - **(a) Har kaam pe:**
    1. Har delivered parcel pe tay rakam (misaal ₹30), har return pickup pe (misaal ₹25), fail koshish pe kam (misaal ₹10).
    2. Hafte me ek payout.
    3. R2 se; R1 me sirf record: kaunsa parcel kis partner ne, taaki baad me hisaab ban sake.
  - **(b) (a) + doori:** km ke hisaab se extra.
  - **(c) Ghante (shift) ke hisaab se.**
- **Salah:** **(a)**; doori wala hissa baad me, jab hubs ka ilaaka bada ho.
- **Trade-off:**
  - (a) saral, par door ke pincode pe partner ka nuksaan.
  - (b) me doori ka hisaab.
  - (c) payroll jaisa, jo D-033 (gig partners) ke khilaaf jaata hai.
- **Kanooni detail jaanchi nahi** (R-004): gig partners ke niyam, unke payout pe TDS, aur aggregator ka contribution.
- **Owner ka jawab (2026-11-18):** **(a)**, har kaam pe (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-104.

### Q-046. R1 me return, daawe aur refund ki manzoori kaun sa staff kare?

- **Status:** `Tay`. Topic: B2 (roles), B11 (support). Group G5.
- **Sawal:** R1 me return ki manzoori, "parcel nahi mila" ka daawa (D-072) aur refund ki manzoori kaunsa staff role kare, aur kis app me, jabki support desk R2 se hai (D-055)?
- **Kyun zaroori:**
  - R1 me return aur refund hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), aur D-072 me staff ki jaanch hai. Bina role ke R1 ka order flow adhoora hai.
- **Vikalp:**
  - **(a) Support Desk app ka patla hissa R1 me:**
    1. Ek role (misaal "Support Agent") sirf order dekhe, return manzoor ya reject kare, daawe ka faisla kare, aur refund shuru kare.
    2. Return request apne aap manzoor, jab wajah aur saboot poore hon; aakhri faisla warehouse ki jaanch pe.
    3. Tickets, SLA aur baaki support desk R2 me.
    4. R1 ke scope me ye chhota jod owner ki haan se (D-055).
  - **(b) Logistics Ops app me:** returns ki jaanch aur hub manager hi ye kaam karein.
  - **(c) Kam se kam staff:** return apne aap manzoor (jaise (a) niyam 2); daawe me sirf "bina code" wale maamle hub manager dekhe.
- **Salah:** **(a)**. Kaam shuru se sahi app me hota hai (D-010), aur R2 me usi app me tickets judte hain; apne aap manzoori se staff ka kaam kam.
- **Trade-off:**
  - (a) me R1 me ek app ka chhota hissa badhta hai.
  - (b) me kaam galat app me, jo baad me hatana padta hai.
  - (c) akela ho to galat daawe pe rok kam.
- **Owner ka jawab (2026-11-18):** **(a)**, Support Desk app ka patla hissa R1 me (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-105.

### Q-047. Toote, galat ya kam item ke daawe me customer se kya saboot lein?

- **Status:** `Tay`. Topic: B7 (returns). Group G5.
- **Sawal:** toota, galat ya kam item ke daawe (D-079) me customer se kya saboot lein?
- **Kyun zaroori:**
  - Cosmetics me "galat shade aaya" ya "khaali box aaya" jaise daawe aam hain. D-072 ki tarah faisla saboot se hona chahiye, andaaze se nahi.
- **Vikalp:**
  - **(a) Koi saboot nahi.**
  - **(b) Photo zaroori:**
    1. Item ki, label pe batch number ki, aur damage ki photo.
    2. "Item kam" pe parcel aur packing ki photo.
    3. Unboxing video optional; staff maang sake.
    4. Hamari taraf ka saboot: warehouse pe pack ki photo.
  - **(c) (b) + unboxing video zaroori:** ek rakam (misaal ₹1,500) se upar.
- **Salah:** **(b)**. Saboot ka ek aasaan kadam, aur hamari pack ki photo se dono taraf ka saboot rehta hai.
- **Trade-off:**
  - (a) me jhooth aasaan.
  - (b) me customer ka ek kadam.
  - (c) me video banana sabko nahi aata, aur video me privacy ka sawal.
- **Kanooni detail jaanchi nahi** (R-004): customer ki photo aur video (ghar ya chehra aa sakta hai) rakhne ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, photo zaroori (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-106.

### Q-048. Customer se delivery fee lein ya nahi?

- **Status:** `Tay`. Topic: B4 (pricing), B5 (checkout). Group G6.
- **Sawal:** customer se delivery fee lein ya nahi; lein to kitni, aur kaise dikhe?
- **Kyun zaroori:**
  - Checkout ka total, invoice (delivery platform ki seva hai, to shayad platform ka alag invoice), aur cancel, RTO aur return ke niyam isi pe tike hain.
- **Vikalp:**
  - **(a) Hamesha muft.**
  - **(b) Seema ke neeche fee:**
    1. Order ki rakam ek seema se kam ho to tay fee (misaal ₹499 se kam pe ₹49), area setting se; 0 bhi rakhi ja sake.
    2. Kai sellers ya kai parcel wale order (D-077) pe bhi ek hi fee, order pe.
    3. Product page aur cart pe pehle se "₹X se upar muft delivery" dikhe.
    4. Koi "platform fee" ya "packing fee" nahi.
  - **(c) Doori ya wazan ke hisaab se.**
- **Salah:** **(b)**. Asli jaisa (D-026), aur cancel, RTO aur return ke niyam isi pe saaf bante hain; seema 0 rakh ke muft bhi chala sakte hain.
- **Trade-off:**
  - (a) saral, par kharcha poora hamara, aur niyam baad me jodne padte hain.
  - (b) me platform ka invoice aur fee ke niyam.
  - (c) customer ke liye samajhna mushkil.
- **Kanooni detail jaanchi nahi** (R-004): delivery fee pe GST aur kiska invoice.
- **Owner ka jawab (2026-11-18):** **(b)**, seema ke neeche fee (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-107.

### Q-049. Delivery na ho paaye to kitni koshish, aur phir kya (RTO)?

- **Status:** `Tay`. Topic: B1 (delivery). Group G6.
- **Sawal:** customer na mile, address na mile, ya customer parcel lene se mana kare, to kitni baar koshish ho, aur phir kya? (Parcel wapas warehouse jaana = RTO.)
- **Kyun zaroori:**
  - Prepaid order pe refund ka samay, delivery pe UPI wale order (D-034) pe stock wapas, aur har koshish ka kharcha isi se tay hota hai.
  - D-072 ka niyam "delivered" ke liye hai, "delivery nahi hui" ke liye nahi.
- **Vikalp:**
  - **(a) Ek koshish:** fail hote hi RTO; prepaid ka refund.
  - **(b) Do koshish (misaal):**
    1. Har fail pe wajah (ghar band, address galat, customer ne mana kiya), aur customer ko in-app, email aur browser push se khabar, agla din chunne ka option.
    2. Parcel hub pe zyada se zyada 3 din (misaal), phir RTO.
    3. Customer ne saaf mana kiya to doosri koshish nahi, seedha RTO.
    4. Prepaid ka poora refund RTO ka hub pe scan hote hi shuru (parcel tab bhi hamari zimmedari me, D-063).
    5. RTO maal warehouse me receiving jaisi jaanch ke baad stock me.
    6. Delivery fee (agar Q-048 me lage) customer ki galti wale RTO pe wapas nahi.
  - **(c) Teen koshish,** aur customer kabhi bhi agla din badal sake.
- **Salah:** **(b)**. Customer ko doosra mauka milta hai, aur refund warehouse pahunchne tak nahi rukta, kyunki parcel hamari zimmedari me hai.
- **Trade-off:**
  - (a) me chhoti galti pe order khatam.
  - (b) me hub pe parcel rakhne ki jagah aur din ki ginti.
  - (c) me kharcha aur hub ka bojh zyada.
- **Owner ka jawab (2026-11-18):** **(b)**, do koshish (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-108.

### Q-050. Delivery pe UPI kise mile, kitni rakam tak, aur mana karne pe kya?

- **Status:** `Tay`. Topic: B5 (checkout), B6 (payments). Group G6.
- **Sawal:** delivery pe UPI QR (D-034) kise mile, kitni rakam tak ke order pe, aur customer payment se mana kare to kya ho?
- **Kyun zaroori:**
  - Bina advance paise ke order me customer mana kare to delivery aur wapsi ka kharcha hamara, aur stock itne din ruka rehta hai. R1 me ye raasta hai.
- **Vikalp:**
  - **(a) Sab customers,** koi seema nahi.
  - **(b) Seema ke saath:**
    1. Order ki zyada se zyada rakam (misaal ₹3,000); naye customer ke pehle order pe kam (misaal ₹1,500); area setting se on ya off.
    2. Jo customer aise order pe 2 baar (misaal) mana kare ya payment na kare, uske liye delivery pe UPI band; staff wajah ke saath khol sake.
    3. Door pe payment fail ho (network) to partner 10 minute (misaal) tak QR dobara dikhaye, phir "koshish fail" (Q-049).
    4. Delivery code (D-072) payment ke baad hi.
  - **(c) Sirf purane customers:** kam se kam ek prepaid order delivered ho chuka ho.
- **Salah:** **(b)**. Naye customer ko bhi raasta milta hai, aur mana karne ka nuksaan ek seema me rehta hai.
- **Trade-off:**
  - (a) me mana karne ka nuksaan.
  - (b) me kuch customers ko prepaid karna padta hai.
  - (c) naye customer ke liye rukawat.
- **Owner ka jawab (2026-11-18):** **(b)**, seema ke saath (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-109.

### Q-051. Customer order kab tak cancel kar sake, aur poora ya ek-ek item?

- **Status:** `Tay`. Topic: B5 (order). Group G6.
- **Sawal:** customer order kab tak cancel kar sake, aur poora hi ya ek-ek item bhi?
- **Kyun zaroori:**
  - Refund, stock wapas, aur delivery fee ke niyam isi pe tike hain. Ek item cancel hone ke baad order muft delivery ki seema se neeche aaye, to bhi niyam chahiye.
- **Vikalp:**
  - **(a) Sirf poora order,** pack hone se pehle.
  - **(b) Ek-ek item ya quantity, pack hone se pehle:**
    1. Pack ke baad cancel nahi, sirf door pe mana (RTO, Q-049).
    2. Koi cancel fee nahi.
    3. Cancel ke baad order seema se neeche aaye to bhi baad me delivery fee nahi lagti.
    4. Prepaid ka refund turant; delivery pe UPI wale order me paisa liya hi nahi.
  - **(c) Ek-ek item, warehouse se nikalne tak.**
- **Salah:** **(b)**. Customer ko poora order nahi todna padta, aur niyam saral aur saaf rehte hain.
- **Trade-off:**
  - (a) me customer ko poora order todna padta hai.
  - (b) me line ke hisaab se refund aur stock.
  - (c) me pack hua parcel kholna (galti ka mauka).
- **Owner ka jawab (2026-11-18):** **(b)**, ek-ek item ya quantity, pack hone se pehle (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-110.

### Q-052. Refund kis raaste jaaye, aur kab shuru ho?

- **Status:** `Tay`. Topic: B6 (payments). Group G6.
- **Sawal:** refund kis raaste jaaye, aur kab shuru ho?
- **Kyun zaroori:**
  - R1 me Razorpay test mode me refund hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), aur saara paisa platform ke ek gateway account me aata hai (D-093). Delivery pe UPI wale order ka refund bhi chahiye (return pe).
- **Vikalp:**
  - **(a) Hamesha original raaste:**
    1. Razorpay refund; delivery pe UPI QR wala payment bhi usi raaste.
    2. Shuru hone ka samay: cancel pe turant (Q-051), RTO pe hub scan pe (Q-049), return pe warehouse jaanch ke baad (Q-056).
    3. Refund fail ho (jaise account band) to staff ka haath ka raasta, aur customer ko khabar.
    4. Customer ko refund ki halat in-app aur email me dikhe.
  - **(b) Original ya bank account:** customer chahe to bank account me (bank details lena padta, jo sensitive data hai).
  - **(c) Default store credit:** gift card aur store credit ke sawal (B10, D-055 me R2) ka hissa; prepaid instruments ke niyam ka jokhim.
- **Salah:** **(a)**. Customer ka paisa usi raaste wapas jaata hai jisse aaya, aur bank details rakhne ka jokhim nahi.
- **Trade-off:**
  - (a) me kuch maamle haath se.
  - (b) me bank details ki suraksha.
  - (c) me customer ka paisa platform pe atka rehta hai.
- **Kanooni detail jaanchi nahi** (R-004): refund ka samay (RBI ke niyam) aur store credit ke niyam.
- **Owner ka jawab (2026-11-18):** **(a)**, hamesha original raaste (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-111.

### Q-053. Lauta maal kahan jaaye, aur nuksaan kiska?

- **Status:** `Tay`. Topic: B7 (returns). Group G6.
- **Sawal:** warehouse ki jaanch ke baad lauta maal kahan jaaye (dobara stock, brand ko, ya nasht), aur kharcha ya nuksaan kiska?
- **Kyun zaroori:**
  - Maal brand ka hai (D-060); hamari galti ka nuksaan hamara (D-063); band maal dobara bike to brand ka fayda. R1 ki warehouse jaanch ka nateeja isi se banta hai.
  - D-063 me zimmedari "receiving se customer tak" hai; return pickup ke baad, warehouse pahunchne se pehle maal kho jaaye ya toote, to kiska, ye saaf nahi.
- **Vikalp:**
  - **(a) Kabhi dobara stock nahi:** har lauta maal brand ko wapas ya nasht.
  - **(b) Wajah ke hisaab se:**
    1. Band, seal salamat (D-079), batch wahi jo bheja tha, aur expiry bikri band ki seema (D-082) se upar: wapas bikne layak stock, usi batch me.
    2. Transit me toota ya leak (hamari zimmedari): nasht (D-062 ka record), brand ko D-063 se bharpai, customer ko refund.
    3. Galat item bheja (hamari pick ki galti): hamari zimmedari; lauta item jaanch ke baad stock me.
    4. Brand ki galti (defect, galat batch label, nakli ka shak sahi nikla): refund ka paisa seller ke hisaab se, saath me wapsi ka kharcha; maal brand ko wapas, ya brand ke kharche pe nasht (D-062 jaisa).
    5. Customer ki baat jaanch me galat (khula maal "band" bata ke, ya batch alag): refund nahi; maal customer ko wapas (misaal ek baar hamare kharche pe).
    6. Return pickup ke scan se warehouse receiving tak maal hamari zimmedari (D-063 me jod).
    7. Seller ke panel me har return ka nateeja aur wajah; seller ko aitraaz ka raasta.
  - **(c) (b) jaisa, par dobara stock sirf brand ki haan se.**
- **Salah:** **(b)**. Har maamle me nuksaan usi ka jiski galti, band maal bekaar nasht nahi hota, aur return ke raaste me bhi zimmedari saaf rehti hai.
- **Trade-off:**
  - (a) me brand ka nuksaan bada, aur galti hamari ho to jhagda.
  - (b) me jaanch ka anushaasan.
  - (c) me brand ke jawab tak maal ruka rehta hai.
- **Kanooni detail jaanchi nahi** (R-004): lautaye band cosmetics ko dobara bechne ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, wajah ke hisaab se (7 niyam). Record: [DECISIONS.md](DECISIONS.md) D-112.

### Q-054. Return pickup ke waqt delivery partner kya jaanche?

- **Status:** `Tay`. Topic: B7 (returns), B1 (delivery). Group G6.
- **Sawal:** return pickup ke waqt delivery partner kya jaanche?
- **Kyun zaroori:**
  - Fraud ki sabse sasti rok yahi hai: hamare paas har line ka batch hai (D-064), to galat ya purana maal lautane wala door pe hi pakda jaata hai.
- **Vikalp:**
  - **(a) Kuch nahi,** sab warehouse me.
  - **(b) Photo + batch + seal:**
    1. Partner item ki photo le, aur label pe batch number ko order wale batch se milaye.
    2. "Man badla" wale return me seal dekhe (D-079).
    3. Mel na khaye to pickup na le (wajah + photo), aur customer ko in-app, email aur browser push se khabar.
  - **(c) (b) + partner hi refund manzoor kare.**
- **Salah:** **(b)**. Galat maal warehouse tak nahi aata, aur Delivery app me photo ka kadam pehle se hai (D-072).
- **Trade-off:**
  - (a) me galat maal warehouse tak aata hai, aur ek aur trip ka kharcha.
  - (b) me partner ka ek-do minute aur.
  - (c) me partner pe paise ka faisla (jokhim).
- **Owner ka jawab (2026-11-18):** **(b)**, photo + batch + seal (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-113.

### Q-055. Return pickup ka kharcha customer se kate ya nahi?

- **Status:** `Tay`. Topic: B7 (returns). Group G6.
- **Sawal:** return pickup ka kharcha customer se kate ya nahi?
- **Kyun zaroori:**
  - "Man badla" wale return (D-079) me galti kisi ki nahi; muft ho to galat istemaal, mehenga ho to customer naraz.
- **Vikalp:**
  - **(a) Hamesha muft.**
  - **(b) Galti ke hisaab se:**
    1. Hamari ya brand ki galti: return muft, aur delivery fee (agar Q-048 me lage) bhi wapas.
    2. Man badla: refund me se return fee kat-ti hai (misaal ₹49), aur delivery fee wapas nahi.
  - **(c) Man badla ka kharcha seller pe.**
- **Salah:** **(b)**. Galti wale customer ka koi kharcha nahi, aur man badla wale return ka galat istemaal kam hota hai.
- **Trade-off:**
  - (a) me kharcha hamara, aur galat istemaal.
  - (b) me ek fee ka niyam.
  - (c) seller ke saath anyay, kyunki galti uski nahi.
- **Owner ka jawab (2026-11-18):** **(b)**, galti ke hisaab se (2 niyam). Record: [DECISIONS.md](DECISIONS.md) D-114.

### Q-056. Return ka refund kab ho: warehouse jaanch ke baad, ya kuch maamlon me pickup pe hi?

- **Status:** `Tay`. Topic: B7 (returns), B6 (payments). Group G6.
- **Sawal:** R1 me return ka refund warehouse jaanch ke baad hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Aage (R2 se) bhi aisa hi rahe, ya kuch maamlon me pickup pe hi?
- **Kyun zaroori:**
  - Warehouse jaanch me 3 se 5 din (misaal) lagte hain; customer ka paisa itne din atka rehta hai.
- **Vikalp:**
  - **(a) Hamesha warehouse jaanch ke baad.**
  - **(b) Chhoti rakam pe pickup pe:**
    1. Misaal ₹1,000 tak, aur pickup ki jaanch (Q-054) paas ho, to pickup scan pe refund; baaki warehouse ke baad.
    2. Baar-baar galat return karne wale customer (Q-057) ko ye suvidha nahi.
    3. R2 se; R1 me (a).
  - **(c) Request pe turant.**
- **Salah:** **(b)**. Zyadatar customers ka paisa jaldi wapas aata hai, aur jokhim chhoti rakam tak simit rehta hai.
- **Trade-off:**
  - (a) me customer ka intezaar.
  - (b) me thoda jokhim (pickup ke baad maal galat nikle).
  - (c) me fraud aasaan.
- **Owner ka jawab (2026-11-18):** **(b)**, chhoti rakam pe pickup pe (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-115.

### Q-057. Baar-baar return ya daawa karne wale customer pe kya ho?

- **Status:** `Tay`. Topic: B7 (returns), B11 (disputes). Group G6.
- **Sawal:** jo customer bahut return ya daawe kare, us pe kya ho?
- **Kyun zaroori:**
  - D-072 niyam 4 me sirf record aur report hai; return ke liye bhi niyam chahiye, warna pickup ka kharcha aur nuksaan badhta hai.
- **Vikalp:**
  - **(a) Sirf record** aur staff ko report.
  - **(b) Seema ke baad suvidhayein band:**
    1. Seema misaal: 90 din me 5 returns, ya delivered orders ka 40% se zyada.
    2. Seema paar: man badla wala return band, delivery pe UPI band (Q-050), aur pickup pe refund (Q-056) band.
    3. Staff wajah ke saath khol sake; customer ko wajah dikhe.
    4. R2 se; record R1 se.
  - **(c) Account band.**
- **Salah:** **(b)**. Nuksaan rukta hai, aur galti se pakde gaye sahi customer ke liye staff ka raasta khula rehta hai.
- **Trade-off:**
  - (a) me nuksaan chalta rehta hai.
  - (b) me ek seema, aur kuch sahi customer bhi pakde ja sakte hain (isliye staff khol sake).
  - (c) bahut kada, galat faisle ka jokhim.
- **Owner ka jawab (2026-11-18):** **(b)**, seema ke baad suvidhayein band (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-116.

### Q-058. Customer ko delivery ka vaada kaise dikhe, aur warehouse ka cut-off kya ho?

- **Status:** `Tay`. Topic: B1 (delivery), B5 (checkout).
- **Sawal:** customer ko delivery ka vaada kis roop me dikhe (product page ke pincode check, cart aur checkout pe), aur warehouse ka roz ka cut-off kya ho?
- **Kyun zaroori:**
  - Pincode check bina sign-in bhi hota hai (D-020), aur wahan delivery ka vaada dikhta hai. Warehouse se hub ke trips (D-027) ka samay isi vaade se banta hai.
  - Galat vaada sabse aam shikayat hai.
- **Vikalp:**
  - **(a) Din ki range:** "2 se 4 din me", har sub-district ki ek setting.
  - **(b) Tareekh, cut-off ke saath:**
    1. "Aaj 2 baje (misaal) tak order to kal delivery."
    2. Warehouse se hub ka roz ek trip (misaal shaam 4 baje).
    3. Sunday aur chhuttiyan area setting me.
    4. Vaada toote to order pe "der" ki haalat aur customer ko khabar; R1 me koi muavza nahi.
  - **(c) Time slot:** customer delivery ka slot chune; har hub ki capacity ka hisaab chahiye.
- **Salah:** **(b)**, slot nahi. Ek warehouse aur ek hub ke saath tareekh ka vaada sach rakha ja sakta hai, aur customer ko range se zyada bharosa milta hai.
- **Trade-off:**
  - (a) saral, par kam bharosa.
  - (b) me cut-off, chhuttiyon aur trip ke samay ki settings.
  - (c) me capacity ka hisaab, ek insaan ke liye bhaari.
- **Owner ka jawab (2026-11-18):** **(b)**, tareekh, cut-off ke saath (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-117.

### Q-059. Stock kab ruke, aur online payment ke liye kitna samay mile?

- **Status:** `Tay`. Topic: B5 (checkout), B6 (payments).
- **Sawal:** stock kab roka jaaye, aur online payment ke liye customer ko kitna samay mile?
- **Kyun zaroori:**
  - Order batch se reserve hota hai (D-064), aur R1 me stock reservation hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
  - Bina samay-seema ke adhure payments stock ko rok ke rakhte hain, aur der se aaye payment pe customer ka paisa atak sakta hai.
- **Vikalp:**
  - **(a) Cart me daalte hi rokna.**
  - **(b) "Place order" pe rokna, 15 minute (misaal):**
    1. Prepaid me itne samay me payment.
    2. Der se payment aaye aur stock ho to order pakka; warna apne aap poora refund (original raaste, D-111) aur customer ko khabar.
    3. Cart me stock nahi rukta; cart sirf "kam stock" dikhata hai, aur checkout pe dobara jaanch.
    4. Delivery pe UPI wale order (D-034) me stock order pe ruka rehta hai, kyunki payment delivery pe hai.
  - **(c) (b), par 30 minute.**
- **Salah:** **(b)**. Stock sirf asli kharidari pe rukta hai, aur der se aaye payment ka paisa apne aap wapas jaata hai.
- **Trade-off:**
  - (a) me stock bina kharidari ke ruka rehta hai.
  - (b) me UPI app me der karne wale ko kabhi refund ka intezaar.
  - (c) me stock zyada der ruka.
- **Owner ka jawab (2026-11-18):** **(b)**, "place order" pe rokna, 15 minute (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-118.

### Q-060. Order ke baad customer address ya item badal sake?

- **Status:** `Tay`. Topic: B5 (order).
- **Sawal:** order ke baad customer address ya quantity badal sake, ya item jod sake?
- **Kyun zaroori:**
  - Pincode → hub (D-016), GST ka state aur invoice order pe tike hain; badlav se ye sab dobara banta hai.
  - Ek-ek item cancel (D-110) pehle se hai.
- **Vikalp:**
  - **(a) Koi badlav nahi:** quantity ghatani ho to item cancel (D-110), aur kuch jodna ho to naya order.
  - **(b) (a) + address badle:** pack se pehle, agar naya pincode usi hub aur usi state ka ho. R1 me (a), ye badlav R2 se.
  - **(c) (b) + item jodna.**
- **Salah:** **(b)**; item jodna nahi. Address badalna aam zaroorat hai, aur shart se hub aur invoice nahi badalte.
- **Trade-off:**
  - (a) me customer ke liye kam suvidha.
  - (b) me hub aur state ki jaanch.
  - (c) me invoice aur reservation dobara.
- **Owner ka jawab (2026-11-18):** **(b)**, R1 me koi badlav nahi, R2 se usi hub aur state me address badle; item jodna nahi. Record: [DECISIONS.md](DECISIONS.md) D-119.

### Q-061. MRP aur daam ka farak (discount) kaise dikhe?

- **Status:** `Tay`. Topic: B4 (pricing).
- **Sawal:** product page, cart aur checkout pe MRP aur daam ka farak kaise dikhe?
- **Kyun zaroori:**
  - R1 me product page pe batch ka MRP (D-064) aur daam dono hain.
  - Galat ya badha-chadha discount customer ko gumraah karta hai.
- **Vikalp:**
  - **(a) Kata hua MRP + daam + "% off"** (MRP se), hamesha.
  - **(b) (a) + niyam:**
    1. % hamesha neeche round ho, kabhi badha ke nahi.
    2. Batch badle aur MRP badle to % bhi badle.
    3. "Sale" ya "deal" jaisa label lage tab "pichhle 30 din ka sabse kam daam" bhi dikhe (D-061 ka itihaas pehle se hai); ye hissa sale labels ke saath R2 se.
  - **(c) Sirf MRP aur daam,** koi % nahi.
- **Salah:** **(b)**. Customer ko sach dikhta hai, aur "sale" ka daawa itihaas se jaancha ja sakta hai.
- **Trade-off:**
  - (a) aam tareeka, par "sale" ka sach nahi dikhata.
  - (b) me ek aur hisaab.
  - (c) me customer ko farak khud nikalna padta hai.
- **Kanooni detail jaanchi nahi** (R-004): discount aur "pehle ka daam" dikhane ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, kata MRP, daam aur % off, saath me 3 niyam. Record: [DECISIONS.md](DECISIONS.md) D-120.

### Q-062. Free samples aur gifts kaise chalein?

- **Status:** `Tay`. Topic: B4 (promotions).
- **Sawal:** free samples (sachet, mini) aur "₹X ki kharidari pe gift" kaise chalein? (R2 se, D-055.)
- **Kyun zaroori:**
  - Beauty me samples se bikri badhti hai, par maal brand ka hai (D-060). Stock, invoice aur return sab pe asar.
- **Vikalp:**
  - **(a) Nahi.**
  - **(b) Sirf brand ke:**
    1. Brand apne products ke saath apne samples de; stock brand ka.
    2. Invoice pe ₹0 ki line, "not for sale" nishaan.
    3. Samples pe bhi batch aur expiry (D-062).
    4. Return pe gift lautana zaroori nahi; jis offer se gift mila uski shart return ke baad toote, to bhi gift ka paisa nahi kat-ta.
  - **(c) (b) + platform ke gifts:** platform ka diya gift, aur customer har order pe samples chune (misaal 2).
- **Salah:** **(b)**. Beauty ka aam tareeka milta hai, kharcha brand ka rehta hai, aur return ke niyam saral rehte hain.
- **Trade-off:**
  - (a) me beauty ka aam tareeka chhoot-ta hai.
  - (b) me ₹0 lines aur samples ka stock.
  - (c) me platform ka kharcha aur gifts ka stock.
- **Kanooni detail jaanchi nahi** (R-004): free maal pe GST aur sample ke label ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, sirf brand ke (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-121.

### Q-063. Return pe customer ko kya mile: refund, wahi item, ya doosra shade?

- **Status:** `Tay`. Topic: B7 (returns).
- **Sawal:** return pe customer ko kya mile: sirf refund, wahi item dobara (replacement), ya doosra shade ya size (exchange)?
- **Kyun zaroori:**
  - Toote ya galat item pe customer aksar wahi item chahta hai.
  - Exchange cosmetics me shade ke liye maanga jaata hai, par batch ka MRP (D-064) aur daam ka farak ise ulajhata hai.
- **Vikalp:**
  - **(a) Sirf refund** (D-111).
  - **(b) Refund ya wahi variant dobara:**
    1. Replacement sirf hamari ya brand ki galti wale maamlon me, stock ho to.
    2. Naya parcel aur purana pickup ek hi trip me.
    3. R1 me (a); replacement R2 se.
  - **(c) (b) + exchange:** band maal pe usi product ka doosra shade ya size, daam ka farak le ya de.
- **Salah:** **(b)**. Galti wale customer ko do kadam nahi lene padte. Exchange ki jagah customer refund le ke naya order kare: wahi kaam, saaf hisaab.
- **Trade-off:**
  - (a) me customer ke do kadam.
  - (b) me replacement ka stock, aur ek trip me do kaam.
  - (c) me invoice, credit note aur daam ka farak.
- **Kanooni detail jaanchi nahi** (R-004): replacement pe invoice aur credit note ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, refund ya wahi variant dobara (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-122.

### Q-064. Hub aur warehouse live karne ke liye shuruaati staff list kya ho?

- **Status:** `Tay`. Topic: B1 (warehouse, delivery), B2 (roles).
- **Sawal:** D-015 ki shart "staff ki list poori" ke liye shuru me kaunse roles kitne hon?
- **Kyun zaroori:**
  - List data me hai aur sirf Master badalta hai (D-022), par shuruaati list chahiye; R1 me hub live karna isi pe tika hai.
- **Vikalp:**
  - **(a) Kam se kam:**
    1. Hub: 1 Hub Manager, 1 Hub Operations (scan aur sort), 2 Delivery Partners.
    2. Warehouse: 1 Warehouse Manager, 1 Receiving, 1 Pick-Pack, 1 Returns QC.
  - **(b) Backup ke saath:** har kaam ke 2, hub me 5 Delivery Partners.
  - **(c) Bahut kam:** 1 Hub Manager + 1 Delivery Partner.
- **Salah:** **(a)**. Owner ke alag accounts (D-017) se poori ho jaati hai, aur ek insaan kai roles rakh sakta hai (D-054). Asli launch pe (b) sirf setting badal ke.
- **Trade-off:**
  - (a) me ek role ka account band ho to list adhoori ho jaati hai.
  - (b) me R1 ke liye zyada accounts.
  - (c) me "list poori" ka matlab kamzor.
- **Owner ka jawab (2026-11-18):** **(a)**, kam se kam. Record: [DECISIONS.md](DECISIONS.md) D-123.

### Q-065. "Agla bhejne wala batch" sirf bikne layak batches me se ho?

- **Status:** `Tay`. Topic: B3 (batch), B1 (warehouse).
- **Sawal:** D-064 me "agla bhejne wala batch" (sabse pehle expire hone wala pehle, D-062) ka matlab: sirf **bikne layak** batches me sabse pehle expire hone wala, ya koi bhi batch?
- **Kyun zaroori:**
  - D-064 niyam 2 me naya batch tab tak nahi bikta jab tak seller daam na ghataye. Wo ruka batch sabse pehle expire hone wala ho, to "pehle expire wala pehle" toot-ta hai.
  - Tab saaf nahi ki site pe kaunsa MRP aur expiry dikhe, aur ruka batch bikri band ki seema (D-082) ki taraf jaata hai, jo brand ka nuksaan hai (D-062).
- **Vikalp:**
  - **(a) Bikne layak batches me sabse pehle expire hone wala:**
    1. Ruka batch (D-064 niyam 2, ya kisi aur wajah se hold) ginti me nahi; site pe agle bikne layak batch ka MRP aur expiry.
    2. Ruka batch bikri band ki seema ke paas aaye to seller ko alert (D-062 niyam 3 jaisa), saath me "daam ghatao to ye batch bikega".
    3. Ye spashtikaran D-064 me ek jod ke roop me.
  - **(b) Hamesha sabse pehle expire hone wala, chahe ruka ho:** tab tak product hi nahi bikta jab tak seller daam na ghataye.
  - **(c) Koi jod nahi,** jaisa likha hai.
- **Salah:** **(a)**. Product bikta rehta hai, customer ko wahi dikhta hai jo jaayega, aur ruke batch ka jokhim seller ko pehle se pata hota hai.
- **Trade-off:**
  - (a) me ruka batch expiry ki taraf ja sakta hai (seller ke alert se rok).
  - (b) me poora product ruk jaata hai.
  - (c) me code me dono matlab ban sakte hain.
- **Owner ka jawab (2026-11-18):** **(a)**, bikne layak batches me sabse pehle expire hone wala (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-124.

### Q-066. Bharpai ka daam normal daam se ho, Pro daam se nahi?

- **Status:** `Tay`. Topic: B6 (settlement).
- **Sawal:** D-063 niyam 1 ki bharpai me "selling price" ka matlab kya ho, jabki Pro daam (D-065) bhi ek selling price hai?
- **Kyun zaroori:**
  - "Pichhle 30 din ka sabse kam daam" me Pro daam gina gaya, to bharpai bina wajah kam hogi.
  - Nuksaan hua unit kis daam pe bikta, ye aksar pehle se pata nahi hota.
- **Vikalp:**
  - **(a) Sirf normal daam ka itihaas:** Pro daam ginti me nahi. Ye ek line D-063 me jod.
  - **(b) Unit kisi order ke liye reserved tha to usi order ka daam** (Pro order ho to Pro daam); baaki maamlon me normal daam.
  - **(c) Pro aur normal dono itihaas me.**
- **Salah:** **(a)**. Hisaab saral rehta hai, aur brand ko utna milta hai jitna normal bikri pe milta.
- **Trade-off:**
  - (a) me Pro order ke reserved unit pe brand ko thoda zyada.
  - (b) sabse sahi, par do raaste.
  - (c) me bharpai bina wajah kam.
- **Owner ka jawab (2026-11-18):** **(a)**, sirf normal daam ka itihaas. Record: [DECISIONS.md](DECISIONS.md) D-125.

### Q-067. Din ke 300 emails ki seema me har order pe kaunse emails jaayein?

- **Status:** `Tay`. Topic: B11 (notifications).
- **Sawal:** din ke 300 emails ki seema (D-028, R-013) me har order pe kaunse emails jaayein?
- **Kyun zaroori:**
  - Tay faislon se har order pe kai emails ban sakte hain: confirmation, delivery code (D-072), dispatch, delivery fail (D-108), delivered, invoice, refund (D-111).
  - Har order pe 5 emails hon to din ke ~60 orders me seema khatam, aur OTP (jo sirf email se jaata hai) bhi ruk sakta hai. R-013 me OTP line me sabse pehle hai.
- **Vikalp:**
  - **(a) Har haalat pe email** (jaise abhi), OTP line me sabse pehle.
  - **(b) Sirf zaroori emails:**
    1. Order confirmation, aur usi me delivery code (D-072).
    2. Invoice aur refund ka email (paise ka record).
    3. Baaki haalat (dispatch, der, delivery fail, delivered) in-app aur browser push se. Customer ne browser push band rakha ho to inme se sirf delivery fail ka email.
    4. Din ki seema ke paas emails ki line: pehle OTP, phir paise ke emails, phir baaki.
    5. D-108 aur doosre faislon me "email se khabar" isi niyam ke andar.
  - **(c) Customer khud chune** kaunse emails chahiye (OTP aur paise ke emails hamesha).
- **Salah:** **(b)**. OTP kabhi nahi rukta, paise ka record email me rehta hai, aur baaki khabar muft raaston se jaati hai.
- **Trade-off:**
  - (a) me bhaari din pe emails ruk sakte hain.
  - (b) me browser push band rakhne wale customer ko kam khabar.
  - (c) me settings ka kaam, aur zyada emails ka jokhim.
- **Owner ka jawab (2026-11-18):** **(b)**, sirf zaroori emails (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-126.

### Q-068. Imported cosmetics bik sakein?

- **Status:** `Tay`. Topic: B3 (catalog). Group G7.
- **Sawal:** videshi brands ke products (India me importer ya distributor ke through) platform pe bik sakein?
- **Kyun zaroori:**
  - D-032 authorised distributors ko bechne deta hai, aur bahut se beauty brands imported hain.
  - Listing pe importer ki details, country of origin aur import registration ke fields isi pe tike hain.
- **Vikalp:**
  - **(a) Sirf India me bane products.**
  - **(b) Imported bhi:**
    1. Listing pe importer ka naam-pata, country of origin aur import registration number (dummy, D-026) zaroori; staff jaanche.
    2. Fields R1 se; bikri jab aisa seller aaye. R1 ke dono sellers India ke.
  - **(c) Imported sirf brand ki apni Indian company se.**
- **Salah:** **(b)**. Market ka bada hissa andar aata hai, aur fields pehle din se hone se baad me data nahi badalna padta.
- **Trade-off:**
  - (a) me market ka bada hissa bahar.
  - (b) me kuch fields aur jaanch zyada.
  - (c) me distributors (D-032) ke saath mel kam.
- **Kanooni detail jaanchi nahi** (R-004): imported cosmetics ka registration aur label ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, imported bhi (2 niyam). Record: [DECISIONS.md](DECISIONS.md) D-127.

### Q-069. Drug ya Ayurvedic drug licence wale products listing pe kaise rokein?

- **Status:** `Tay`. Topic: B3 (catalog), B13 (compliance). Group G7.
- **Sawal:** drug items kabhi nahi (D-043); listing pe ise kaise pakka karein, aur herbal ya Ayurvedic beauty products ka kya?
- **Kyun zaroori:**
  - Bahut se herbal ya Ayurvedic beauty products cosmetic nahi, Ayurvedic (AYUSH) drug licence pe bante hain.
  - Kuch aam dikhne wale skin care bhi drug hain (jaise ketoconazole wala anti-dandruff shampoo, benzoyl peroxide ya adapalene wali acne cream, hydroquinone, minoxidil).
  - Bina rok ke D-043 sirf kaagaz pe rehta hai.
- **Vikalp:**
  - **(a) Sirf seller ki ghoshna** ("ye drug nahi"), aur staff ka andaaza.
  - **(b) Licence ka type + rok:**
    1. Listing pe licence ka type zaroori: cosmetic manufacturing, cosmetic import registration (Q-068 ke hisaab se), drug, ya AYUSH drug; number dummy (D-026).
    2. Drug aur AYUSH drug type wale product list hi nahi hote.
    3. Ingredients ki blocklist (jaise upar ke drug ingredients): D-099 ki structured list me aisa ingredient mile to listing ruk ke staff ke paas.
    4. Herbal ya Ayurvedic naam wale products jo cosmetic licence pe bane hain, bik sakte hain.
  - **(c) Herbal ya Ayurvedic naam wale saare products bahar.**
- **Salah:** **(b)**. D-043 listing pe hi pakka hota hai, aur cosmetic licence wale herbal products bahar nahi hote.
- **Trade-off:**
  - (a) me galti se drug bik sakta hai.
  - (b) me ek field aur blocklist sambhalni padti hai.
  - (c) me bada hissa bahar, jabki wo cosmetic hain.
- **Kanooni detail jaanchi nahi** (R-004): cosmetic aur drug (AYUSH samet) ki seema, aur kaunse ingredients cosmetic me mana hain.
- **Owner ka jawab (2026-11-18):** **(b)**, licence ka type + rok (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-128.

### Q-070. Batch recall pe platform kya kare?

- **Status:** `Tay`. Topic: B3 (batch), B7 (returns). Group G8.
- **Sawal:** brand ya regulator kisi batch ko wapas bulaye (recall), to platform kya kare, aur customer ko kya mile?
- **Kyun zaroori:**
  - Cosmetics ka batch kharab nikal sakta hai (contamination, galat formula).
  - Har order line ka batch hamare paas hai (D-064, D-067), to kis customer ko kaunsa batch gaya, pata hai. Return ki samay-seema ke baad batch ki dikkat recall ke raaste (D-080).
- **Vikalp:**
  - **(a) Sirf bikri band;** customers ko kuch nahi.
  - **(b) Poora recall:**
    1. Bikri band, aur warehouse me batch alag (quarantine).
    2. Us batch ke customers ko khabar; customer chahe to refund (pickup se wapsi, ya bina wapsi).
    3. Saara kharcha (refund, pickup, nasht) brand ka, seller ke hisaab se; kam pade to D-071 ka udhaar.
    4. Recall brand (seller app se) ya staff shuru kare; har recall ka record (batch, kitne customers, kitne lautaye).
  - **(c) (b) + platform ka rok:** platform khud bhi batch rok sake (jaise Q-071 ki shikayatein) jab tak jaanch ho; rokne ki wajah ka record.
- **Salah:** **(c)**. Customer ki sehat pehle, aur platform jaanch tak batch rok sakta hai. Data R1 me pehle se (har line ka batch); recall ka flow R2 se.
- **Trade-off:**
  - (a) me customer ki sehat ka jokhim.
  - (b) me ek poora flow.
  - (c) me platform ke rokne pe brand se jhagda ho sakta hai, isliye wajah ka record.
- **Kanooni detail jaanchi nahi** (R-004): cosmetics recall ki zimmedari aur regulator ko suchna.
- **Owner ka jawab (2026-11-18):** **(c)**, poora recall + platform ka rok. Record: [DECISIONS.md](DECISIONS.md) D-129.

### Q-071. Skin reaction (allergy) ki shikayat pe kya ho?

- **Status:** `Tay`. Topic: B7 (returns), B11 (support). Group G8.
- **Sawal:** customer kahe product lagane se reaction (allergy) hua (khula maal), to platform kya kare?
- **Kyun zaroori:**
  - Ye cosmetics ka khaas jokhim hai. Khula maal pe reaction D-079 ki kisi return wajah me nahi aata, par customer ki sehat ka maamla hai.
  - Ek batch pe kai shikayatein batch me dikkat ka ishaara hain.
- **Vikalp:**
  - **(a) Normal shikayat:** koi refund nahi; brand ko khabar.
  - **(b) Case record:**
    1. Product, batch, kya hua, aur photo (customer ki consent ke saath).
    2. Brand ko khabar.
    3. Staff ke faisle se bina wapsi refund (goodwill, ek seema tak).
    4. Skin & Hair Expert (D-025) se salah ka offer.
  - **(c) (b) + batch pe nazar:** ek batch pe tay ginti (misaal 3) shikayatein hon to batch ki bikri ruke aur staff jaanch kare (Q-070).
- **Salah:** **(c)**. Batch me dikkat sabit ho to refund ka kharcha brand ka; warna platform ka goodwill, seema ke saath. R2 se, support desk ke saath (D-055); R1 ke Support Desk hisse (D-105) me nahi.
- **Trade-off:**
  - (a) me customer ka bharosa toot-ta hai, aur batch ki dikkat chhup jaati hai.
  - (b) me sehat ka data (Security Architect ke saath, B14).
  - (c) me ek galat shikayat se bhi batch ruk sakta hai, isliye staff ki jaanch.
- **Kanooni detail jaanchi nahi** (R-004): cosmetics ke side-effect (adverse event) ki report ke niyam, aur sehat ke data ki consent.
- **Owner ka jawab (2026-11-18):** **(c)**, case record + batch pe nazar. Record: [DECISIONS.md](DECISIONS.md) D-130.

### Q-072. Browser push band ho to kin khabaron ka email jaaye?

- **Status:** `Tay`. Topic: B11 (notifications).
- **Sawal:** D-126 me browser push band rakhne wale customer ko sirf delivery fail ka email jaata hai. D-090 ke sawal (pick pe kami, tay samay me jawab) aur recall ki khabar (D-129) ka email jaaye ya nahi?
- **Kyun zaroori:**
  - D-090 me jawab na aaye to wo line cancel ho jaati hai. Push band customer tak sawal hi na pahunche, to uska item bina jaane kat jaata hai.
  - Recall (D-129) sehat ka maamla hai; khabar na pahunche to customer kharab batch istemaal karta rehta hai.
  - Dono maamle kam hote hain, to 300 emails ki seema (D-126) pe bojh kam padta hai.
- **Vikalp:**
  - **(a) Jawab aur sehat wali khabar ka email:**
    1. Jis khabar pe customer ka jawab chahiye, aur jawab na aane pe order badalta hai (abhi D-090), push band ho to uska email.
    2. Recall ki khabar (D-129) har customer ko email se bhi, push ho ya na ho.
    3. Ye D-126 niyam 3 me jod; emails ki line me inki jagah OTP ke baad, paise ke emails ke saath.
  - **(b) Sirf D-090 ka sawal:** push band ho to email; recall ki khabar D-126 ke niyam se hi.
  - **(c) Koi jod nahi:** D-126 jaisa; push band customer ko sirf in-app.
- **Salah:** **(a)**. Customer ka item bina jaane cancel nahi hota, sehat ki khabar har customer tak pahunchti hai, aur emails bahut kam badhte hain.
- **Trade-off:**
  - (a) me email ke do aur niyam.
  - (b) me recall ki khabar push band customer tak nahi pahunchti.
  - (c) me push band customer ka item chupchaap cancel ho sakta hai.
- **Kanooni detail jaanchi nahi** (R-004): recall pe customer ko suchna dene ke niyam.
- **Owner ka jawab (2026-11-18):** **(a)**, jawab aur sehat wali khabar ka email (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-131.

### Q-073. Ingredient master list aur blocklist ka data kahan se aaye, aur kaun sambhale?

- **Status:** `Tay`. Topic: B3 (catalog), B2 (roles).
- **Sawal:** D-099 ki INCI master list aur D-128 ki blocklist ka shuruaati data kahan se aaye, aur unme badlav kaunsa staff role kare?
- **Kyun zaroori:**
  - Dono R1 me hain. Master list ke bina seller ke text se structured list semi-auto nahi banti (D-099); blocklist ke bina drug ingredient wala product pakda nahi jaata (D-128).
  - Blocklist ki galti ka asar bada hai: galat naam hata to drug bik sakta hai, galat naam juda to sahi products ruk jaate hain.
  - Kharcha ₹0 hai (D-028), to paid data provider nahi.
- **Vikalp:**
  - **(a) Badhti list, ek hi team:**
    1. Master list R1 ke products ke ingredients se shuru. Seller ke text me anjaana naam staff ki jaanch me "naya ingredient" ban ke aaye, aur staff use jode.
    2. Blocklist ek chhoti tay list se shuru (D-128 ke naam, misaal).
    3. Dono me badlav catalog ki jaanch wali team (D-084) kare.
  - **(b) Public database se import:** EU ke CosIng jaise public ingredient database se shuru se hazaron INCI naam; license aur format pehle jaanchna; ek alag data role sambhale.
  - **(c) (a) se shuru, (b) baad me, do level ki pahunch:**
    1. R1 me (a) jaisi badhti list.
    2. Public database ka import tab, jab Claude uska license aur format jaanch le aur products badhein.
    3. Master list me naya naam jaanch team (D-084) jode.
    4. Blocklist sirf ek senior catalog role badle, wajah ke saath; har badlav audit log me.
- **Salah:** **(c)**. R1 ke 2 sellers ke kam products ke liye badhti list kaafi hai, aur blocklist pe jokhim zyada hai, isliye uska badlav senior role ke haath me rehta hai.
- **Trade-off:**
  - (a) me blocklist ka badlav bhi aam jaanch team ke haath me.
  - (b) me R1 me import, data ki safai aur license ka kaam.
  - (c) me shuru me staff ko naye naam haath se jodne padte hain.
- **Kanooni detail jaanchi nahi** (R-004): kaunse ingredients cosmetic me mana hain, aur public database ke data ka license.
- **Owner ka jawab (2026-11-18):** **(c)**, badhti list se shuru, public database baad me, do level ki pahunch (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-132.

### Q-074. Live site pe anjaan log sign-up aur order kar sakein ya nahi?

- **Status:** `Tay`. Topic: B13 (compliance), B5 (checkout).
- **Sawal:** live site pe koi bhi anjaan insaan sign-up karke order de sake, ya sign-up aur order sirf chune hue emails (allowlist) tak hon?
- **Kyun zaroori:**
  - Payments test mode me hain (D-026) aur delivery asli nahi hoti. Anjaan insaan order de to use lagega ye asli dukaan hai.
  - Uska personal data (naam, address, phone) hamare paas aata hai, aur uske sign-up ke codes din ke 300 emails (D-028) khaate hain.
  - Owner ke apne accounts `+` alias se bante hain (D-017), to allowlist se owner ka kaam nahi rukta.
- **Vikalp:**
  - **(a) Sab ke liye khula,** site pe demo ki patti ke saath.
  - **(b) Dekhna sab ke liye, account sirf allowlist se:**
    1. Dekhna, search, reviews padhna aur pincode check (D-020) sab ke liye.
    2. Sign-up aur sign-in (teeno raaste, D-021) sirf allowlist ke emails se: owner ke base emails aur unke `+` alias, aur jinhe owner jode (testers).
    3. Allowlist ek setting me, bina deploy.
    4. Baaki ko saaf sandesh: "Ye demo store hai."
    5. Seller, delivery partner aur Creator ke sign-up bhi isi niyam se; waitlist (D-046) me judna bhi account se, to wo bhi allowlist tak.
    6. Asli business pe jaane pe (D-026) allowlist ek setting se band.
  - **(c) Sign-up khula, checkout sirf allowlist ke liye.**
- **Salah:** **(b)**, R1 se. Code waisa hi production-grade rehta hai (D-012), par anjaan logon ka data aur emails ka bojh nahi aata, aur koi dhokha nahi khaata.
- **Trade-off:**
  - (a) me anjaan ka data, emails ka bojh aur dhokhe ka jokhim.
  - (b) me portfolio dekhne wala sign-up nahi kar sakta (owner chahe to use allowlist me jode).
  - (c) me anjaan ka data aur sign-up ke codes phir bhi.
- **Kanooni detail jaanchi nahi** (R-004): test mode me bikri dikhane wali site, aur anjaan logon ka personal data.
- **Owner ka jawab (2026-11-19):** **(b)**, dekhna sab ke liye, account sirf allowlist se (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-133.

### Q-075. Har kanooni area me system kitna banaye?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** D-026 me design asli aur registrations dummy hain. Har kanooni area me system kitna banaye: sirf field, workflow me rok, ya poora register aur report?
- **Kyun zaroori:**
  - Ek insaan (D-009) har area me poora register nahi bana sakta, aur har area ki zaroorat alag hai.
  - [COMPLIANCE.md](COMPLIANCE.md) ka "System me kya chahiye" khana isi se bharega.
- **Teen level:** **L1** = field, dummy value aur dikhana. **L2** = L1 + workflow me rok ya jaanch (iske bina aage nahi). **L3** = L2 + register, report, export aur yaad (filing jaisa nateeja; asli filing nahi).
- **Vikalp:**
  - **(a) Sab L1.**
  - **(b) Area ke hisaab se:**

    | Area                                                                                                                  | Level                                           | Kab                               |
    | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------- |
    | GST invoice, credit note, bina gap ka invoice number (D-041)                                                          | L3                                              | R1 invoice; registers R2          |
    | Seller pe GST TCS aur income-tax TDS                                                                                  | L3                                              | R1 hisaab; register aur export R2 |
    | HSN aur GST rate ki table (D-086)                                                                                     | L2                                              | R1                                |
    | Seller KYC aur warehouse state ka GSTIN (D-036)                                                                       | L2                                              | R1                                |
    | Licence ka type, import registration (D-127, D-128)                                                                   | L2                                              | R1                                |
    | Product page ki declarations (net quantity, MRP, mfg aur expiry, maker ya importer, country of origin, customer care) | L2 (inke bina listing live nahi)                | R1                                |
    | Claims ke saboot (D-100)                                                                                              | L2; saboot ki expiry ki yaad L3                 | SPF R1; baaki R2                  |
    | Reviews jaise user content: report aur chhupana                                                                       | L2; register L3                                 | R1; register R2                   |
    | Grievance Officer aur shikayatein                                                                                     | L3                                              | R2 (page R1)                      |
    | Privacy aur data ke haq                                                                                               | L2                                              | R1 kuch, R2 baaki                 |
    | Dark patterns se bachav                                                                                               | L2 (UX aur code ke niyam)                       | R1                                |
    | E-way bill (warehouse aur hub ka trip, D-027)                                                                         | L1 (trip pe dummy number)                       | R2                                |
    | Plastic EPR (D-045)                                                                                                   | L1 (registration); packaging ka data L3 baad me | R1 field                          |
    | Gig delivery partners ka registration                                                                                 | L1                                              | R2                                |
    | Site ke registrations (Shops & Establishments, jalne wale maal ke liye fire NOC)                                      | L1 (field aur expiry ki yaad)                   | R2                                |
    | Telemedicine (D-025)                                                                                                  | L1                                              | R2                                |

  - **(c) Sab L3.**
- **Salah:** **(b)**. Jo paise, tax aur customer ki suraksha se juda hai wo gehra; baaki sirf field, taaki asli business pe jaane pe jagah ho.
- **Trade-off:**
  - (a) me design asli nahi rehta (D-026 ke khilaaf).
  - (b) me har area ka level yaad rakhna (COMPLIANCE.md me).
  - (c) ek insaan ke liye bahut bada kaam.
- **Kanooni detail jaanchi nahi** (R-004): table ki har row. Ye sirf "system kya banaye" ki baat hai; kanoon kya maangta hai, ye kanooni jaanch batayegi.
- **Owner ka jawab (2026-11-19):** **(b)**, area ke hisaab se level (table). Record: [DECISIONS.md](DECISIONS.md) D-134.

### Q-076. Review ka haq: kin order lines pe, kab tak, aur kitni baar?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** delivery ke baad verified purchase review (D-055) ka haq kin order lines pe ho, kitne din tak, aur ek customer ek product pe kitne review likh sake?
- **Kyun zaroori:**
  - Lauta hua item, RTO (D-108) ya cancel (D-110) line, Pro daam wali line (D-065) aur ek product ke kai orders: inse review ka data model aur rating ki ginti banti hai.
  - Review pe variant dikhana (D-076 niyam 5) bhi order line se hi aata hai.
- **Vikalp:**
  - **(a) Har line, har baar:** har delivered order line pe ek review; ek product ke kai orders = kai reviews; window delivery se misaal 180 din.
  - **(b) Ek customer, ek product, ek review:**
    1. Haq kisi bhi delivered line se, lauta hua item bhi (return ke baad bhi raay de sake). Cancel aur RTO line pe nahi.
    2. Pro daam wali line (D-065) pe bhi review.
    3. Review pe us line ka variant aur "Verified purchase" ka nishaan. Dobara kharid pe naya review nahi: purana review edit ho (variant nayi line ka chun sake), aur "kai baar kharida" ka nishaan.
    4. Window delivery se misaal 365 din.
    5. Customer kabhi bhi edit ya delete kare; edit dobara moderation se; har version ka record.
  - **(c) Har line pe review, rating me aakhri:** har order pe naya review dikhe, par rating me har customer ka sirf aakhri review gina jaaye.
- **Salah:** **(b)**, R1 se. Ek insaan ki ek awaaz: baar-baar kharidne wala rating ko jhuka nahi sakta, aur dobara kharid pe customer apni raay taaza kar sakta hai. Lautaye item pe review rokna negative raay dabane jaisa lagta.
- **Trade-off:**
  - (a) me zyada kharidne wale ka asar zyada.
  - (b) me edit ka itihaas rakhna, aur lautaye item ke negative reviews aayenge (jo sach hain).
  - (c) me do tarah ki ginti samjhana mushkil.
- **Kanooni detail jaanchi nahi** (R-004): verified review aur negative review na dabane ke niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, ek customer, ek product, ek review (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-135.

### Q-077. Review ki moderation: kab jaanch aur kaun?

- **Status:** `Tay`. Topic: B8 (moderation), B2 (roles).
- **Sawal:** review live hone se pehle staff jaanche, ya pehle live ho aur baad me jaanch ho; aur ye kaam kis staff role ke paas ho?
- **Kyun zaroori:**
  - Reviews R1 me hain (D-039) aur staff ka saara kaam ek insaan karta hai (D-009). Har review haath se jaanchna bhaari hai.
  - Par gaali, kisi ka phone ya address, ya nakli review live rehna jokhim hai.
  - Roles ki list (D-017) me role aur uska app (D-010) chahiye.
- **Vikalp:**
  - **(a) Sab pehle jaanch:** har review staff ke "approve" ke baad live; faisla misaal 2 kaam ke din me.
  - **(b) Mila-jula:**
    1. Sirf star rating (bina text) turant live.
    2. Text wala review apne aap ki jaanch se guzre (gaali ke shabdon ki list; phone, email ya link jaisa pattern; lambai): paas to turant live, atka to staff ki queue.
    3. Photo wala review hamesha queue me.
    4. Report hua review live rahe jab tak faisla na ho; sirf personal data ya intimate content ki report pe faisle tak chhupe, aur aisi report queue me sabse pehle.
    5. Queue ka faisla misaal 2 kaam ke din me.
    6. Har chhupana aur wapas dikhana wajah ke saath, audit me, aur wapas ho sake.
    7. Role "Review Moderator": poore desh ki ek team (D-084 jaisa), Admin app me.
  - **(c) Sab turant live:** jaanch sirf report hone pe.
- **Salah:** **(b)**, R1 se. Zyadatar reviews bina staff ke live, aur jokhim wale (photo, atke, report hue) hi staff tak. Ek insaan ka bojh kam rehta hai.
- **Trade-off:**
  - (a) me ek insaan pe bojh aur customer ka intezaar.
  - (b) me shabdon ki list aur jaanch ka kaam, aur kuch galat review thodi der live.
  - (c) me galat content der tak live.
- **Kanooni detail jaanchi nahi** (R-004): reviews jaise user content pe platform ki zimmedari aur hatane ke samay.
- **Owner ka jawab (2026-11-19):** **(b)**, mila-jula moderation, Review Moderator role ke saath (7 niyam). Record: [DECISIONS.md](DECISIONS.md) D-136.

### Q-078. Skin type, concern aur active ingredient ka data kis roop me?

- **Status:** `Tay`. Topic: B9 (search), B3 (catalog). Group G9.
- **Sawal:** product pe "kis skin type ke liye", "kis concern ke liye" aur active ingredient ka % jaisi jaankari kis roop me aaye, taaki filter aur search usse chal sakein?
- **Kyun zaroori:**
  - Skincare aur haircare me customer "oily skin", "acne-prone skin", "pigmentation", "dandruff", "10% niacinamide" se dhoondhta hai.
  - Variants (D-076), shade (D-085), ingredients (D-099) aur claims (D-100) me ye fields nahi. Baad me saari listings dobara bharna mehnga.
  - Concern ke shabd drug ke daawe tak ja sakte hain ("acne-prone skin ke liye" se "acne ka ilaaj"; D-128).
- **Vikalp:**
  - **(a) Claims ki list me hi:** "oily skin ke liye", "acne-prone skin ke liye" jaise claims D-100 ki tay list me jud jaayein; filter claims se.
  - **(b) Alag fields, platform ki list se:**
    1. Category ke hisaab se fields (D-076 jaisa): skin type (kai chune ja sakein), concern, hair type.
    2. Seller platform ki list se chune; ye jokhim wale fields me (D-098 niyam 1), badlav pe jaanch.
    3. Concern ki list me sirf cosmetic shabd ("acne-prone skin", "dull skin"); "treat", "cure" jaise shabd list me nahi.
    4. Active ingredient ka % alag field, sirf tab jab pack pe chhapa ho; staff label ki photo (D-099 niyam 1) se milaye.
    5. Filters inhi fields se.
  - **(c) R1 me kuch nahi.**
- **Salah:** **(b)**, R1 me chhota jod. Skin type aur concern lagbhag har skincare product pe hote hain; claims ki list saboot wale daawon ke liye hai, unme milane se list bhaari aur filters ulajhte hain.
- **Trade-off:**
  - (a) me claims ki list lambi, aur saboot ke niyam (D-100) inpe bhi lagne ka sawal.
  - (b) me seller aur staff ka thoda aur kaam.
  - (c) me R1 ka filter kamzor, aur baad me sab listings dobara.
- **Kanooni detail jaanchi nahi** (R-004): cosmetic aur drug ke daawe ke shabd.
- **Owner ka jawab (2026-11-19):** **(b)**, alag fields, platform ki list se (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-137.

### Q-079. R1 me kaunse filters aur sort?

- **Status:** `Tay`. Topic: B9 (search). Group G9.
- **Sawal:** R1 ke basic search aur filter ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1) me kaunse filters aur kaunse sort hon?
- **Kyun zaroori:**
  - R1 me basic search aur filter tay hai, par list nahi.
  - Har filter ka data catalog me pehle din se chahiye (D-085, D-099, D-100, D-127, aur Q-078 ka data).
- **Vikalp:**
  - **(a) Kam:** category, brand, daam ki range, shade family, free-from. Sort: relevance, daam (kam se zyada, zyada se kam), naya.
  - **(b) Poore:** (a) + skin type aur concern (Q-078), claims (D-100), rating, discount %, country of origin (D-127), size. Sort me rating aur discount bhi.
  - **(c) (b) + Pro daam se sort,** Pro buyer ke liye (D-065).
- **Salah:** **(b)**, R1 se. Data R1 me ban hi raha hai; filter usi ka seedha fayda hai. Pro daam ka sort baad me.
- **Trade-off:**
  - (a) me data hote hue bhi filter nahi.
  - (b) me filter ki screen aur search index ka kaam.
  - (c) me har dekhne wale ke liye alag daam ka sort.
- **Kanooni detail jaanchi nahi** (R-004): imported products ke liye country of origin ka filter zaroori hai ya nahi.
- **Owner ka jawab (2026-11-19):** **(b)**, poore filters aur sort. Record: [DECISIONS.md](DECISIONS.md) D-138.

### Q-080. Search aur listing me products kis kram me aayein?

- **Status:** `Tay`. Topic: B9 (search).
- **Sawal:** search aur category page pe products kis kram me aayein, aur kya apne brand ya paid "sponsored" ko upar jagah mil sake?
- **Kyun zaroori:**
  - Kram se bikri tay hoti hai.
  - Apna brand platform ka hi hai (D-031: koi shortcut nahi); use upar rakhna doosre sellers ke saath anyay hai.
  - Ranking ki technique Architect ka kaam hai; yahan sirf niti.
- **Vikalp:**
  - **(a) Sirf relevance:** shabd ka mel, phir naya.
  - **(b) Relevance + gun, bina seller ke boost:**
    1. Relevance ke baad: rating (kam se kam misaal 5 reviews pe), pichhle 30 din ki bikri, stock me hona.
    2. Out-of-stock (agar dikhein) sabse neeche.
    3. Apne brand ko koi boost nahi; code me kisi seller ke hisaab se boost ka raasta hi nahi.
    4. Sponsored sirf R2 ke baad, hamesha "Sponsored" label ke saath, aur ginti ki seema (misaal har 10 me 2 tak).
    5. Kram ke mukhya gun customer ke liye ek page pe likhe.
  - **(c) (b) + apne brand ko boost.**
- **Salah:** **(b)**: R1 me sponsored ke bina; sponsored R2 ke baad. Customer ko kaam ka kram, aur sab sellers ke saath ek niyam.
- **Trade-off:**
  - (a) me achhe aur bikne wale products neeche reh sakte.
  - (b) me rating aur bikri ki ginti ka kaam.
  - (c) me sellers ka bharosa aur kanooni jokhim.
- **Kanooni detail jaanchi nahi** (R-004): kram ke gun batana, apne brand ko aage rakhna, sponsored ka label.
- **Owner ka jawab (2026-11-19):** **(b)**, relevance + gun, bina seller ke boost (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-139.

### Q-081. Sellers aur staff ko kin baaton ka email jaaye?

- **Status:** `Tay`. Topic: B11 (notifications). Group G10.
- **Sawal:** din ke 300 emails ki seema me sellers aur staff ko kin baaton ka email jaaye, aur baaki khabar kaise?
- **Kyun zaroori:**
  - D-126 sirf customer ke order emails ka hai.
  - Sellers ko bhi bahut khabrein jaati hain: listing ka "ye badlo" (D-098), receiving ka farak (D-096), expiry ke alert (D-062, D-124), udhaar ka alert aur payment link (D-071, D-103), payout (D-081), recall (D-129), staff invite aur password reset. Sab usi 300 me (D-028).
- **Vikalp:**
  - **(a) Har khabar ka email.**
  - **(b) Sirf zaroori, aur din ka ek saar:**
    1. Account aur security (invite, password reset, sign-in code): OTP wali line me.
    2. Paisa (payout statement, udhaar ka alert aur payment link, fee ka invoice): paise wali line me.
    3. Jinpe seller ka kaam ruke ya tay samay me jawab chahiye (receiving ka farak, listing "ye badlo", recall, batch rokna): din ka ek saar wala email (misaal subah 9 baje), har khabar alag nahi.
    4. Baaki (listing manzoor, stock ki ginti, reviews) sirf in-app aur push.
    5. Staff ko sirf account aur security ke emails; kaam ki khabar app ki queue me.
  - **(c) Seller khud chune** kaunse emails chahiye.
- **Salah:** **(b)**, R1 se. Ek seller ko din me 1 se 2 emails, aur zaroori baat chhootti nahi.
- **Trade-off:**
  - (a) me sellers badhte hi seema khatam.
  - (b) me saar wale email ka kaam, aur khabar thodi der se.
  - (c) me settings ka kaam aur zyada emails ka jokhim.
- **Owner ka jawab (2026-11-19):** **(b)**, sirf zaroori, aur din ka ek saar (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-140.

### Q-082. Order ke alawa customer ki khabrein kis raaste se?

- **Status:** `Tay`. Topic: B11 (notifications). Group G10.
- **Sawal:** order ke alawa customer ki khabrein (area khulne ki khabar, review likhne ki yaad, offers aur sale, points ki expiry, cart me chhoda item) kis raaste se aur kis consent se jaayein?
- **Kyun zaroori:**
  - Waitlist R1 me hai (D-046). Area khulte hi waitlist ke sab logon ko email jaaye aur log 300 se zyada hon, to us din ki seema khatam aur OTP bhi ruk sakta.
  - Marketing ke liye consent chahiye.
  - Cart ki yaad zyada ho to pareshan karne wali (dark pattern jaisi) ban sakti.
- **Vikalp:**
  - **(a) Sab email se.**
  - **(b) Muft raaste pehle, email seemit:**
    1. Offers aur marketing sirf in-app aur push, sirf alag opt-in se (sign-up pe pehle se tick nahi), kabhi bhi band.
    2. Review ki yaad, points ki expiry aur cart ki yaad: in-app aur push; cart ki yaad ek baar (misaal 24 ghante baad), opt-in se.
    3. Area khulne ki khabar: in-app aur push; email sirf unhe jinke paas push nahi, "baaki" line ki din ki chhat (Q-083) ke andar, baaki agle dinon me.
    4. Har khabar me "ye kyun mila" aur band karne ka raasta.
    5. Ek customer ko hafte me misaal 3 marketing push tak.
  - **(c) Koi marketing khabar nahi.**
- **Salah:** **(b)**: area khulne ki khabar R1 me, baaki R2 se. OTP kabhi nahi rukta, aur khabrein consent ke andar.
- **Trade-off:**
  - (a) me bade din pe OTP ruk sakta, aur consent ka jokhim.
  - (b) me push band wale customer tak kam pahunch, aur area khulne ki khabar kuch logon ko der se.
  - (c) me growth ka raasta band.
- **Kanooni detail jaanchi nahi** (R-004): marketing khabron ki consent aur band karne ke niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, muft raaste pehle, email seemit (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-141.

### Q-083. Emails ki har line ki din ki chhat ho ya nahi?

- **Status:** `Tay`. Topic: B11 (notifications). Group G10.
- **Sawal:** din ke 300 emails me har line (OTP, paisa, baaki; D-126 niyam 4) ki apni din ki chhat ho, taaki OTP ke liye hamesha jagah bache?
- **Kyun zaroori:**
  - D-126 niyam 4 ka kram sirf tab kaam karta hai jab emails ek saath khade hon. Subah waitlist ki khabar (D-046) ya bade recall (D-131: har customer ko email) me 300 nikal gaye, to shaam ke OTP ke liye jagah nahi bachti, chahe OTP line me sabse pehle ho.
  - Har OTP sirf email se jaata hai, to OTP ruka matlab sign-in ruka.
- **Vikalp:**
  - **(a) Koi chhat nahi:** sirf D-126 ka kram.
  - **(b) Har line ki chhat, OTP ke liye pakki jagah:**
    1. Din ke 300 me se misaal 60 sirf OTP ke liye; baaki lines milake 240 tak.
    2. "Baaki" line misaal 120 tak; paise ke emails aur D-131 wali khabar bachi jagah me.
    3. OTP apni 60 ke baad bhi koi bhi bachi jagah le sake.
    4. Chhat paar ho to wo email agle din ki line me; in-app aur push usi din.
    5. Bade burst (area khulna, recall) apne aap kai dinon me bant-te hain, chhat ke andar.
    6. Din ka 80% (misaal 240) hone pe Master aur Head of Operations ko in-app chetavni.
  - **(c) Sirf OTP ki pakki jagah:** misaal 60 OTP ke liye; baaki lines me alag chhat nahi.
- **Salah:** **(b)**, R1 se. OTP kabhi nahi rukta, aur paise ke emails "baaki" ke burst me nahi dabte.
- **Trade-off:**
  - (a) me bade din pe OTP aur sign-in ruk sakta.
  - (b) me bade recall ke emails kuch dinon me bant-te (in-app aur push usi din), aur chhat ki ginti ka kaam.
  - (c) me "baaki" ka burst paise ke emails ko agle din dhakel sakta.
- **Kanooni detail jaanchi nahi** (R-004): recall pe customer ko suchna dene ke samay ke niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, har line ki chhat, OTP ke liye pakki jagah (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-142.

### Q-084. Seller ko kaunsi reports milein, aur customer ki kitni jaankari dikhe?

- **Status:** `Tay`. Topic: B12 (reporting), B6 (settlement). Group G11.
- **Sawal:** seller app me seller ko apni bikri ki kaunsi reports milein, aur customer ki kitni jaankari dikhe?
- **Kyun zaroori:**
  - Fulfilment platform karta hai (D-014), to seller ko customer ke address ya phone ki zaroorat nahi.
  - Par invoice seller ke naam se banta hai (D-030), aur brands demand ka data maangte hain (kis shehar me bikta).
  - Seller ka hisaab R1 me hai (D-055).
- **Vikalp:**
  - **(a) Sab:** naam, phone, address samet.
  - **(b) Kaam ki reports, customer ki pehchaan ke bina:**
    1. Orders aur lines (variant, batch, daam, "discount kisne diya", D-101), returns wajah ke saath (D-079) aur jaanch ka nateeja (D-112), stock batch ke hisaab se umar aur expiry (D-062, D-066), settlement statement (D-081), reviews ka saar.
    2. Customer ki pehchaan: sirf order number, shehar ya district, aur pincode; naam, phone, email, address nahi.
    3. Invoice ki copy me sirf wo jo invoice pe zaroori hai.
    4. Customer ki koi list nahi; seller customer se seedha sampark nahi kar sakta.
  - **(c) Sirf jod:** order ke level ki jaankari bhi nahi.
- **Salah:** **(b)**, R1 se (reviews ka saar R2 se). Brand ko kaam ka data, aur customer ka personal data kam haathon me.
- **Trade-off:**
  - (a) me personal data bahut haathon me, aur customer se bahar sampark ka jokhim.
  - (b) me invoice ki copy ke niyam ki jaanch.
  - (c) me brand apne returns aur stock samajh nahi pata.
- **Kanooni detail jaanchi nahi** (R-004): seller ko customer ka data dena, aur invoice pe customer ki zaroori jaankari.
- **Owner ka jawab (2026-11-19):** **(b)**, kaam ki reports, customer ki pehchaan ke bina (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-143.

### Q-085. Kaun apna data file (CSV) me nikaal sake?

- **Status:** `Tay`. Topic: B12 (reporting). Group G11.
- **Sawal:** kaun apna data file (CSV) me nikaal sake, aur kis roop me?
- **Kyun zaroori:**
  - Seller apne orders aur settlement apne accounting me daalte hain, aur finance ko books chahiye.
  - Par har export personal data bahar jaane ka raasta hai.
- **Vikalp:**
  - **(a) Koi export nahi:** sirf screen pe.
  - **(b) Seemit export:**
    1. Seller: apne orders, settlement aur stock ka CSV, utni hi jaankari jitni seller ki reports me (Q-084); customer ki pehchaan nahi.
    2. Finance staff: ledger aur tax registers (R2; accounting software ka format baad me).
    3. Baaki staff: sirf apne kaam ki list, personal data chhupa ke.
    4. Har export audit me; ek export me misaal 50,000 rows tak, zyada pe saaf mana (aadhi kati file nahi).
  - **(c) Sab ko sab.**
- **Salah:** **(b)**: seller ka settlement CSV R1 me, baaki R2 se.
- **Trade-off:**
  - (a) me seller aur finance ka haath ka kaam.
  - (b) me export ke niyam aur audit.
  - (c) me data ke leak ka bada raasta.
- **Owner ka jawab (2026-11-19):** **(b)**, seemit export (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-144.

### Q-086. Demo aur dummy ka nishaan kahan dikhe?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** kin jagahon pe "demo" ya "dummy" ka nishaan dikhe?
- **Kyun zaroori:**
  - D-026: registrations aur kanooni details dummy, data ya config me.
  - Asli jaise dikhne wale invoice (GSTIN ke saath), licence number aur officers ke naam bahar galat istemaal ho sakte (nakli invoice). Dummy number kisi asli company ke number se mil sakta hai.
  - Owner ke accounts ke reviews asli customer ke reviews jaise dikhte hain, khaas kar apne brand (D-031) pe.
- **Vikalp:**
  - **(a) Kahin nahi.**
  - **(b) Har jagah jahan dhokha ho sake:**
    1. Har app ke upar patli patti: "Demo store: koi asli bikri, payment ya delivery nahi."
    2. Invoice, credit note aur payout statement ke PDF pe "SPECIMEN / DEMO: not a tax document" watermark.
    3. Har dummy registration number (GSTIN, licence, import registration, EPR) ke saath "DUMMY" badge, jahan bhi dikhe.
    4. Grievance Officer jaise officers ke liye sirf role ka naam aur `example` domain ka email; kisi insaan ka banawati naam nahi.
    5. Dummy numbers aise ki kisi asli company ke number se na milein.
    6. Demo ke reviews pe "Demo review" ka nishaan.
    7. Saare dummy values ek jagah (data ya config) ki list me (D-026).
  - **(c) Sirf site ki patti.**
- **Salah:** **(b)**, R1 se. Koi bhi page ya file bahar jaaye to bhi asli na lage.
- **Trade-off:**
  - (a) me nakli invoice aur dhokhe ka jokhim.
  - (b) me har PDF aur number ke saath kaam.
  - (c) me download hui file asli lagti.
- **Kanooni detail jaanchi nahi** (R-004): demo site pe dummy registration numbers aur invoice jaise documents.
- **Owner ka jawab (2026-11-19):** **(b)**, har jagah jahan dhokha ho sake (7 niyam). Record: [DECISIONS.md](DECISIONS.md) D-145.

### Q-087. Review me kya chhupaya ja sake, aur kya kabhi nahi?

- **Status:** `Tay`. Topic: B8 (moderation).
- **Sawal:** moderation ke niyam kya hon: kis wajah se review chhupaya ja sake, aur kis wajah se kabhi nahi?
- **Kyun zaroori:**
  - Negative review chhupana customer ke saath dhokha hai; galat content rakhna bhi jokhim hai.
  - Cosmetics ke teen khaas maamle: review me skin reaction ki baat (D-130); ilaaj jaisa daawa ("is cream se meri acne theek ho gayi", jo product ko dawa jaisa dikhata hai, D-043, D-128); aur delivery ya packaging ki shikayat (delivery hamari hai, D-014, par rating brand ki girti hai).
- **Vikalp:**
  - **(a) Tay list, negative raay kabhi wajah nahi:**
    1. Chhupane ki wajahein sirf: gaali, nafrat ya dhamki; kisi ka personal data (phone, email, address, order number); spam, link ya doosre product ya site ka prachaar; product se bilkul alag baat; nakli ya khel wala review; intimate ya kisi aur ki photo; kanooni order.
    2. Kabhi wajah nahi: kam rating, kadwi raay, brand ki aalochna, "mujhe reaction hua".
    3. Skin reaction wala review rahe, aur customer ko support ka raasta dikhe (D-130).
    4. Ilaaj jaise daawe wale review rahein; saare reviews ke upar ek tay note: "Reviews customers ki apni raay hain, ilaaj ka daawa nahi."
    5. Delivery ya packaging ki shikayat review me rahe (customer ka asli anubhav).
    6. Customer ko chhupane ki wajah dikhe; wo badal ke dobara bhej sake; ek appeal, jiska faisla doosra moderator kare (D-084 niyam 3 jaisa).
  - **(b) (a), par delivery ki shikayat bahar:** delivery ya packaging ki shikayat wale review product ki rating se bahar, aur customer ko delivery feedback me bheja jaaye.
  - **(c) Staff ki samajh:** koi tay list nahi.
- **Salah:** **(a)**, R1 se. Ek jaisa faisla, aur negative raay ki suraksha saaf. Delivery ki shikayat se brand ki rating thodi girti dikhegi, par review ko hatana ya doosri jagah bhejna customer ki raay se chhed jaisa hai.
- **Trade-off:**
  - (a) me brand ki rating pe hamari delivery ka asar.
  - (b) me customer ka review uski marzi ke bina doosri jagah.
  - (c) me har moderator ka alag faisla.
- **Kanooni detail jaanchi nahi** (R-004): negative review chhupane ke niyam, review me ilaaj ke daawe, aur user content hatane ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, tay list, negative raay kabhi wajah nahi (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-146.

### Q-088. Return ya daawa reject ho to customer appeal kar sake ya nahi?

- **Status:** `Tay`. Topic: B11 (disputes), B7 (returns).
- **Sawal:** R1 me Support Agent ne return ya daawa reject kiya (D-105), to customer dobara jaanch (appeal) maang sake ya nahi?
- **Kyun zaroori:**
  - R1 me reject ke faisle hain (D-105 niyam 1), par uske baad ka raasta nahi.
  - D-084 ka niyam (jisne reject kiya wo appeal tay nahi karta) sirf seller aur listing ke liye hai.
  - Owner kai accounts se kaam karta hai (D-017), to "doosra insaan" ka matlab doosra role aur account.
- **Vikalp:**
  - **(a) R1 me appeal nahi:** reject aakhri, wajah ke saath.
  - **(b) Ek appeal:** reject ke misaal 7 din me, naye saboot ke saath; faisla Support Lead role kare (wo account jisne reject nahi kiya); faisla misaal 3 kaam ke din me; uske baad aakhri.
  - **(c) Kitni bhi appeals.**
- **Salah:** **(b)**, R1 me chhota jod. Galat reject ka sudhaar, aur bojh seemit. R1 me Support Lead role chalu karna chhota kaam hai (D-054).
- **Trade-off:**
  - (a) me galat reject ka koi raasta nahi.
  - (b) me R1 me ek aur role.
  - (c) me ek hi maamla baar-baar.
- **Owner ka jawab (2026-11-19):** **(b)**, ek appeal, Support Lead ke faisle se. Record: [DECISIONS.md](DECISIONS.md) D-147.

### Q-089. "Parcel nahi mila" ke daawe ki samay-seema kitni?

- **Status:** `Tay`. Topic: B11 (disputes), B1 (delivery).
- **Sawal:** "parcel nahi mila" ke daawe (D-072) ki samay-seema kitni ho, aur kab se gini jaaye?
- **Kyun zaroori:**
  - D-072 niyam 3 me samay sirf misaal (48 ghante) hai, aur number support ki charcha ko diya gaya tha. R1 me daawa hai (D-105).
  - Code se pakki delivery pe daawa maana nahi jaata (D-072). To samay asal me un deliveries ke liye hai jahan code nahi mila (photo aur location, D-072 niyam 2): wahan kisi aur ne parcel liya ho sakta hai, aur customer ko der se pata chalta hai.
- **Vikalp:**
  - **(a) Sab pe 48 ghante,** "delivered" scan se.
  - **(b) Saboot ke hisaab se:** code se delivered pe 48 ghante (daawa darj hota hai, par D-072 ke niyam se maana nahi jaata); sirf photo aur location wali delivery pe misaal 7 din; dono "delivered" scan se.
  - **(c) Sab pe 7 din.**
- **Salah:** **(b)**, R1 se. Jahan saboot kamzor hai wahan customer ko poora samay, aur code wali delivery pe lambe samay ka koi fayda nahi.
- **Trade-off:**
  - (a) me ghar se bahar gaya customer chhoot sakta.
  - (b) me do samay-seemaayein.
  - (c) me code wali delivery pe bhi lamba khula maamla.
- **Owner ka jawab (2026-11-19):** **(b)**, saboot ke hisaab se samay-seema. Record: [DECISIONS.md](DECISIONS.md) D-148.

### Q-090. R1 me owner ko kaunse aankde dikhein?

- **Status:** `Tay`. Topic: B12 (analytics).
- **Sawal:** R1 me owner ko (Master aur Head of Operations ke accounts pe) kaunse aankde dikhein?
- **Kyun zaroori:**
  - R1 ka lakshya poora flow parkhna hai (D-055); bina aankdon ke pata nahi chalta flow kahan tootta hai.
  - Har aankde ka data R1 ke events me pehle din se chahiye; baad me jodna mushkil.
- **Vikalp:**
  - **(a) Kuch nahi:** sirf orders ki list.
  - **(b) Chhota set** (din, hafta, mahina):
    1. Orders, GMV (MRP aur diya hua daam dono), average order value.
    2. Cancel % (wajah se), RTO % (D-108), pehli koshish me delivery %, vaade pe delivery % (D-117).
    3. Return % (wajah aur category se, D-079), refund ka samay (D-111), daawon ki ginti (D-072).
    4. Stock: bikne layak, ruka hua aur near-expiry ki rakam (D-062, D-089); storage fee wala maal (D-066).
    5. Waitlist ki ginti district se (D-046); zero result wali searches.
  - **(c) (b) + target aur alert:** har aankde ka target, tootne pe in-app alert.
- **Salah:** **(b)** R1 me; (c) ka target aur alert R2 se.
- **Trade-off:**
  - (a) me flow ki kamzori chhupi rehti hai.
  - (b) me events aur roz ke jod ka kaam.
  - (c) me targets ki setting aur alerts ka kaam.
- **Owner ka jawab (2026-11-19):** **(b)**, chhota set; target aur alert R2 se. Record: [DECISIONS.md](DECISIONS.md) D-149.

### Q-091. Legal pages me kya likha ho?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** Terms, Privacy, Return, Shipping, Grievance aur Seller agreement jaise pages me kya likha ho?
- **Kyun zaroori:**
  - Sign-up pe customer inhe maanta hai (consent ka record, version ke saath), aur seller agreement seller ke judne pe.
  - Return, refund, cancel aur delivery fee ke niyam ab tay hain (D-079, D-080, D-107, D-108, D-110, D-111, D-114), to pages unse mel khane chahiye.
- **Vikalp:**
  - **(a) Placeholder:** "ye demo text hai", koi niyam nahi.
  - **(b) Tay faislon se asli jaisa draft:**
    1. Claude tay faislon se pages likhe.
    2. Har page pe "DUMMY: lawyer se jaancha nahi" badge aur version.
    3. Terms ya Privacy ka bada badlav ho to agle sign-in pe naya consent.
    4. Return aur Shipping pages ke number policy ki settings se aayein (ek baat ek jagah).
  - **(c) Kisi template site se copy.**
- **Salah:** **(b)**, R1 se (sign-up ka consent R1 me). Customer ko site ke asli niyam dikhte hain, aur design asli rehta hai (D-026).
- **Trade-off:**
  - (a) me consent ka koi matlab nahi, aur niyam kahin likhe nahi.
  - (b) me pages likhne aur version rakhne ka kaam.
  - (c) me copyright aur galat niyam ka jokhim.
- **Kanooni detail jaanchi nahi** (R-004): in pages ke zaroori hisse.
- **Owner ka jawab (2026-11-19):** **(b)**, tay faislon se asli jaisa draft (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-150.

### Q-092. Customer apne data ke kaunse haq app me khud chala sake?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** customer apne data ke kaunse haq app me khud chala sake, aur kab se?
- **Kyun zaroori:**
  - Live site pe asli personal data hai (owner aur testers ka): profile sudhaarna, marketing ki consent band karna, account delete karna, apna data download karna.
  - Kuch records kanoon se rakhne padte hain (invoice, ledger, tax), to delete pe unme se pehchaan hatani padti hai.
- **Vikalp:**
  - **(a) Koi self-service nahi:** sab support se (R2).
  - **(b) Zaroori R1 me, baaki R2:**
    1. R1: profile sudhaar; marketing consent band; account delete (chalte orders, returns aur refunds ke baad; misaal 7 din ka wapas lene ka samay; invoice aur ledger me naam, pata aur email hata ke ek code).
    2. R2: poore data ka download (file, app se; email attachment nahi), consent ka itihaas, data request ka ticket aur tay samay.
  - **(c) Sab R1 me.**
- **Salah:** **(b)**. Asli data pe zaroori haq pehle din se, aur bada kaam support desk ke saath.
- **Trade-off:**
  - (a) me R1 me asli data pe koi haq nahi.
  - (b) me delete ke saath pehchaan hatane ka kaam R1 me.
  - (c) me R1 bhaari.
- **Kanooni detail jaanchi nahi** (R-004): data ke haq, jawab ka samay, aur records rakhne ka samay.
- **Owner ka jawab (2026-11-19):** **(b)**, zaroori haq R1 me, baaki R2 se. Record: [DECISIONS.md](DECISIONS.md) D-151.

### Q-093. Search me kuch na mile to kya ho, aur synonyms kaun sambhale?

- **Status:** `Tay`. Topic: B9 (search).
- **Sawal:** search me kuch na mile to customer ko kya dikhe, aur ek cheez ke kai naam (synonyms) ki list aur na mile shabdon ki report kaun sambhale?
- **Kyun zaroori:**
  - Beauty me ek cheez ke kai naam aur spelling aam hain (sunscreen aur sunblock, moisturiser aur moisturizer, eyeliner aur kohl).
  - Zero result pe customer chala jaata hai, aur na mile shabd batate hain ki kaunsa brand ya product laana chahiye.
- **Vikalp:**
  - **(a) Saada:** "kuch nahi mila" aur categories ki list.
  - **(b) Madad aur report:**
    1. Spelling ki galti pe "kya aapka matlab ..." ka sujhaav, milte-julte products, popular categories.
    2. Synonyms ki list staff setting se, bina deploy (D-037 ki soch).
    3. Zero result wale shabd har hafte ki report me.
    4. R1 me ye kaam catalog ki jaanch wali team (D-084, Admin app) kare; Growth Studio (D-010) bane to wahan.
    5. Customer "ye brand ya product chahiye" ki request de sake (sign-in se): R2.
  - **(c) (b) + apne aap seekhne wale synonyms.**
- **Salah:** **(b)**: niyam 1 se 4 R1 me, niyam 5 R2 se. Kam kaam me customer rukta hai, aur demand ka data milta hai.
- **Trade-off:**
  - (a) me customer khota.
  - (b) me synonyms ki list ka haath ka kaam.
  - (c) me technique ka bojh aur galat synonyms ka jokhim.
- **Owner ka jawab (2026-11-19):** **(b)**, madad aur report (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-152.

### Q-094. Stock khatam product dikhe ya chhupe?

- **Status:** `Tay`. Topic: B9 (search), B11 (notifications).
- **Sawal:** stock khatam variant ya product search aur listing me dikhe ya chhupe, aur customer "stock aane pe batao" chun sake ya nahi?
- **Kyun zaroori:**
  - Maal ek warehouse (D-014) me hai, to stock khatam matlab har jagah khatam.
  - Chhupane se customer wapas nahi aata; dikhane se kram aur khabar ka sawal uthta hai.
  - D-046 sirf area ka waitlist hai, stock ka nahi. Khabar ka raasta 300 emails (D-028) me.
- **Vikalp:**
  - **(a) Chhupe:** stock khatam product search aur listing me nahi.
  - **(b) Dikhe, khabar ke saath:**
    1. "Out of stock" ke saath dikhe, kram me neeche.
    2. Product page pe "stock aane pe batao" (sign-in se).
    3. Khabar sirf in-app aur browser push se, email nahi.
    4. Request misaal 90 din me khatam.
    5. Seller ko "kitne log ruke hain" ki ginti.
  - **(c) Dikhe, bina khabar.**
- **Salah:** **(b)**: dikhana R1 me, khabar R2 se. Customer ka intent nahi khota, seller ko maal bhejne ka signal milta hai, aur email ka bojh nahi.
- **Trade-off:**
  - (a) me customer aur demand ka signal dono khote.
  - (b) me khabar ka kaam.
  - (c) me customer ko baar-baar dekhna padta.
- **Owner ka jawab (2026-11-19):** **(b)**, dikhe, khabar ke saath (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-153.

### Q-095. Customer ko "Bestseller" ya "kam stock" jaise aankde dikhein ya nahi?

- **Status:** `Tay`. Topic: B12 (analytics), B9 (listing).
- **Sawal:** product page aur listing pe "Bestseller", "is hafte 100+ ne kharida", "sirf 3 bache" jaise aankde dikhein ya nahi?
- **Kyun zaroori:**
  - Ye bikri badhate hain, par galat ya bana hua aankda jhoothi jaldi (dark pattern) hai.
  - Apne brand (D-031) pe bhi wahi niyam.
- **Vikalp:**
  - **(a) Koi aisa aankda nahi.**
  - **(b) Sirf sach, tay niyam se:**
    1. "Bestseller": category me pichhle 30 din ki bikri ke top 10 me (misaal).
    2. "Kam stock": sirf jab bikne layak stock misaal 5 se kam ho, asli ginti ke saath.
    3. "X ne kharida" nahi (chhoti ginti pe gumraah karta hai).
    4. Countdown timer sirf jab offer ka asli khatam hone ka samay ho (offers R2 se).
    5. Har niyam ek policy page pe.
  - **(c) Marketing ki marzi se.**
- **Salah:** **(b)**: "Bestseller" aur "kam stock" R1 me, countdown R2 se. Sach aankde customer ke kaam ke hain, aur niyam se bana aankda jhooth nahi ban sakta.
- **Trade-off:**
  - (a) me sach aankdon ka fayda bhi nahi.
  - (b) me niyam ki ginti aur policy page ka kaam.
  - (c) me dark pattern ka seedha jokhim.
- **Kanooni detail jaanchi nahi** (R-004): jhoothi jaldi aur kam stock dikhane ke niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, sirf sach aankde, tay niyam se (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-154.

### Q-096. Review me customer photo jod sake ya nahi?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** review me customer photo jod sake ya nahi, aur kab se?
- **Kyun zaroori:**
  - Skin pe lagaye shade ki asli photo cosmetics me sabse kaam ki jaankari hai, aur khareedne se pehle shade ka darr kam karti hai.
  - Par photo me chehra, ghar, address label ya twacha ki bimari aa sakti hai; har photo jaanchni padegi.
  - Photo upload ka raasta R1 me daawe ke liye pehle se ban raha hai (D-106).
- **Vikalp:**
  - **(a) R2 se:** R1 me sirf text aur star; photo R2 me, har photo staff ki jaanch ke baad.
  - **(b) R1 se, har photo jaanch ke baad:** ek review me zyada se zyada misaal 3 photos; har photo staff ki jaanch ke baad live; chehra dikhe to customer ka "ye meri photo hai aur dikhane ki ijazat hai" tick zaroori; address label, doosre insaan ya intimate photo pe reject; video nahi.
  - **(c) Photo aur video R1 se.**
- **Salah:** **(b)**, R1 me chhota jod. Upload ka kaam R1 me pehle se hai, har photo jaanch se guzarti hai to jokhim kam, aur R1 me do sellers ke saath photos kam hongi. Video nahi: jagah, data aur jaanch ka bojh.
- **Trade-off:**
  - (a) me R1 ke reviews kam kaam ke.
  - (b) me har photo ek insaan ki queue me.
  - (c) me video ki jagah aur jaanch ₹0 (D-028) pe bhaari.
- **Kanooni detail jaanchi nahi** (R-004): customer ki photo (chehra) rakhne aur dikhane ki consent.
- **Owner ka jawab (2026-11-19):** **(b)**, R1 se, har photo jaanch ke baad. Record: [DECISIONS.md](DECISIONS.md) D-155.

### Q-097. Nakli review pakda jaaye to kya karwai ho?

- **Status:** `Tay`. Topic: B8 (moderation), B14 (abuse).
- **Sawal:** nakli review ya rating ke saath khel (brand ke log khud order karke review, paid reviews, ek insaan ke kai accounts) pakda jaaye to kis pe kya karwai ho?
- **Kyun zaroori:**
  - Verified purchase se bhi khel ho sakta hai: brand khud kam daam ke orders karke review likhe. Apna brand (D-031) bhi isi niyam me.
  - Ek insaan ke kai email (`+` alias, D-017) se kai accounts banana aasaan hai.
- **Vikalp:**
  - **(a) Sirf review hatao.**
  - **(b) Seedhi karwai:**
    1. Review hatao, wajah ke record ke saath.
    2. Customer: pehli baar chetavni; dobara to review likhna band (misaal 6 mahine); staff wajah ke saath khol sake.
    3. Seller: brand ke staff ya brand ke kahe pe review sabit ho to chetavni; dobara to us brand ki listings rokna, aur aage account band, Trust & Safety ke faisle se (D-047).
    4. Kisi product ke bahut reviews hatein to uski rating dobara gini jaaye, aur seller ko wajah dikhe.
    5. Seller app ke users (brand ka staff) apne brand ke product pe review nahi likh sakte (system ki rok).
  - **(c) Account turant band.**
- **Salah:** **(b)**: niyam 1 aur 5 R1 me, baaki R2 se (Trust & Safety ke saath). Saza galti ke hisaab se, galat pakde gaye ke liye raasta khula, aur brand ke apne staff pe system ki rok.
- **Trade-off:**
  - (a) me khel karne wale pe koi rok nahi.
  - (b) me record, seedhi aur appeal ka kaam.
  - (c) me galat faisle ka bada jokhim.
- **Kanooni detail jaanchi nahi** (R-004): nakli reviews pe platform ki zimmedari.
- **Owner ka jawab (2026-11-19):** **(b)**, seedhi karwai (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-156.

### Q-098. Customer ke behaviour ka data lein ya nahi?

- **Status:** `Tay`. Topic: B12 (analytics).
- **Sawal:** customer site pe kya dekhta, khojta aur cart me daalta hai, iska data lein ya nahi, aur kya ye bahar ki kisi analytics service ko jaaye?
- **Kyun zaroori:**
  - Funnel (dekha, cart, order) ke bina pata nahi chalta customer kahan rukta hai.
  - Par bahar ki service ko data jaana matlab cookie aur consent ka kaam aur privacy ka jokhim; apne database me rakhna Atlas ki 0.5 GB (R-006) ki jagah khaata hai.
- **Vikalp:**
  - **(a) Sirf business events:** server ke events (order, cancel, return, search ke shabdon ki ginti); koi page-level tracking nahi.
  - **(b) (a) + apna halka page data:** bina personal pehchaan ke din ki ginti (kis product ka page kitni baar khula, kitne cart me gaye); kachcha data misaal 30 din, phir sirf din ka jod; bahar koi service nahi.
  - **(c) Bahar ki free analytics service,** cookie consent ke saath.
- **Salah:** **(b)**: R1 me sirf (a) ke business events, page ka halka data R2 se. Funnel ka moota roop milta hai, data bahar nahi jaata, aur jagah seemit rehti hai.
- **Trade-off:**
  - (a) me funnel nahi.
  - (b) me apna halka tracking aur jod ka kaam.
  - (c) me consent ka banner, data bahar, aur page pe bahar ki script.
- **Kanooni detail jaanchi nahi** (R-004): tracking aur cookies ki consent.
- **Owner ka jawab (2026-11-19):** **(b)**, R1 me business events, halka page data R2 se. Record: [DECISIONS.md](DECISIONS.md) D-157.

### Q-099. Muft mile product ya inaam wale review ka niyam kya ho?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** jis customer ko product muft mila (brand ka sample ya gift, creator ko brand ka bheja product), ya jise review ke badle kuch mile, uske review ka niyam kya ho?
- **Kyun zaroori:**
  - Muft ya inaam wale reviews rating ko upar jhukate hain, aur chhupa inaam customer ke saath dhokha hai.
  - Samples aur gifts (D-121) R2 me aate hain, creators ka kaam Creator app (D-010) me hai, aur loyalty me "review pe points" aam tareeka hai.
- **Vikalp:**
  - **(a) Koi inaam nahi:** ₹0 wali line (sample ya gift, D-121) pe review ka haq nahi; review ke badle koi points, coupon ya inaam nahi (na platform, na brand); brand customer se review ke liye seedha sampark nahi kar sakta.
  - **(b) Label ke saath:**
    1. ₹0 wali line ya brand ke bheje product pe review ho sake, "Muft mila product" label ke saath.
    2. Inaam sirf review likhne pe, rating dekh ke kabhi nahi; label "Inaam mila".
    3. Label wale reviews rating me nahi gine jaate, alag dikhte hain.
    4. Brand khud inaam nahi de sakta, sirf platform ke program se.
  - **(c) Inaam, bina label.**
- **Salah:** **(a)**: niyam R1 se (R1 me ₹0 line nahi aati, par rok code me). Sabse saaf aur sabse zyada bharosa. Baad me review ke badle inaam chahiye ho to (b) ka label wala raasta khula hai.
- **Trade-off:**
  - (a) me reviews kam aate hain.
  - (b) me label, alag ginti aur inaam ke niyam.
  - (c) me bharosa aur kanoon dono ka jokhim.
- **Kanooni detail jaanchi nahi** (R-004): inaam ya muft product wale review aur endorsement ke label ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, koi inaam nahi. Record: [DECISIONS.md](DECISIONS.md) D-158.

### Q-100. Allergen ki chetavni sabke liye ek jaisi ho ya customer ke hisaab se?

- **Status:** `Tay`. Topic: B3 (catalog), B9 (search).
- **Sawal:** D-099 ki allergen ki chetavni sab customers ko ek jaisi ho (product me jaane-maane allergens), ya customer ki apni allergy ke hisaab se?
- **Kyun zaroori:**
  - D-099 ki chetavni R1 me hai, par ye saaf nahi ki kis tarah ki.
  - Customer ke hisaab se chetavni ke liye uski allergy ka data chahiye, jo sehat ke paas ka data hai (consent aur suraksha, Security Architect ke saath, B14). R1 me ye data kahin tay nahi.
- **Vikalp:**
  - **(a) Hamesha sabke liye ek jaisi:** product page pe jaane-maane allergens (jaise fragrance ke allergens) ki chetavni, structured list (D-099 niyam 2) se; customer ka koi data nahi.
  - **(b) Customer ke hisaab se, R1 se:** customer profile me apni allergy ke ingredients chune (consent ke saath); un ingredients wale product pe use chetavni.
  - **(c) R1 me sabke liye ek jaisi; customer ke hisaab se baad me,** jab customer ki allergy ka data aur uski consent tay ho.
- **Salah:** **(c)**. R1 me koi sehat ka data nahi chahiye, chetavni har customer ko dikhti hai, aur personal chetavni ka raasta khula rehta hai.
- **Trade-off:**
  - (a) me customer ko apni allergy ke hisaab se madad kabhi nahi.
  - (b) me R1 me sehat ke data ka kaam aur consent.
  - (c) me personal chetavni ka intezaar.
- **Kanooni detail jaanchi nahi** (R-004): allergens dikhane ke niyam, aur sehat ke data ki consent.
- **Owner ka jawab (2026-11-19):** **(c)**, R1 me sabke liye ek jaisi, customer ke hisaab se baad me. Record: [DECISIONS.md](DECISIONS.md) D-159.

### Q-101. Brand review ka jawab de sake ya nahi?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** brand (seller) kisi review ka public jawab de sake ya nahi, aur kisi review ko galat maane to kya kar sake?
- **Kyun zaroori:**
  - Brand ka jawab ("is shade ke liye ye try karein", "batch dekh rahe hain") customer ka bharosa badhata hai.
  - Par brand reviewer pe review hatane ka dabaav daal sakta hai, ya apne khilaaf review hatwane ki koshish kar sakta hai. Apna brand (D-031) bhi isi niyam me.
- **Vikalp:**
  - **(a) Jawab nahi:** seller sirf apne products ke reviews dekhe aur report kare.
  - **(b) Ek public jawab, niyam ke saath:**
    1. Har review pe ek jawab (edit ho sake), reviews wale moderation niyam (D-136, D-146) se.
    2. Seller ko reviewer ka sirf chhota naam dikhe, koi contact detail kabhi nahi (D-143).
    3. Seller report kare (wajah ke saath), faisla moderator ka; seller review hata ya badal nahi sakta.
    4. Jawab me coupon, offer ya bahar sampark ka raasta nahi.
  - **(c) Jawab bina moderation.**
- **Salah:** **(b)**: reviews dekhna R1 me (seller app), jawab aur report R2 se. Brand ki baat aur customer ki suraksha dono.
- **Trade-off:**
  - (a) me brand ki baat customer tak nahi pahunchti.
  - (b) me jawab bhi moderation ki queue me.
  - (c) me brand ka jawab bina jaanch live.
- **Owner ka jawab (2026-11-19):** **(b)**, ek public jawab, niyam ke saath (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-160.

### Q-102. Support ticket kaun bana sake, kis raaste se, aur kin categories me?

- **Status:** `Tay`. Topic: B11 (support). Group G12.
- **Sawal:** support ticket kaun bana sake, kis raaste se, aur kin categories me?
- **Kyun zaroori:**
  - Tickets R2 me hain (D-105 niyam 3). Domain nahi (D-028), to support ke email pe aaya sawal apne aap ticket nahi ban sakta; live chat bhi nahi (D-025).
  - Har category ka sahi team tak pahunchna aur order se judna jaanch ka samay bachata hai.
- **Vikalp:**
  - **(a) Sirf signed-in customer,** app ke form se, order se juda.
  - **(b) Kai log, tay categories:**
    1. Signed-in customer aur seller apne app se (order, parcel ya line chun ke); bina sign-in "Contact us" form (email zaroori; jab tak D-133 ki allowlist hai, sirf allowlist ke emails se); delivery partner Delivery app se apne maamle (kamaai, kaat).
    2. Categories platform ki list se, har ek ka tay raasta: order ki haalat; cancel, return, refund; parcel nahi mila (D-072); toota ya galat item (D-106); payment kata par order nahi; account aur sign-in; product ya shade ka sawal (Beauty Advisor, D-025); skin reaction (D-130); review ya content ki shikayat; privacy ya data ki request (D-151); delivery partner ka vyavhaar; seller ke maamle.
    3. Ticket ki baat-cheet in-app; jawab aane pe push; push band ho to email sirf tab jab customer ka jawab chahiye (D-131 jaisa), emails ki chhat (D-142) ke andar.
    4. Band hone pe ek sawal ka chhota survey (in-app).
  - **(c) (b) + live chat.**
- **Salah:** **(b)**, R2 se. Sab paksh ek hi desk pe, aur email ki seema pe bojh nahi.
- **Trade-off:**
  - (a) me seller, partner aur bina sign-in wale ke liye raasta nahi.
  - (b) me categories aur raaston ki setting.
  - (c) me ek insaan ko screen pe baithe rehna padta, aur server so jaata hai (D-028).
- **Owner ka jawab (2026-11-19):** **(b)**, kai log, tay categories (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-161.

### Q-103. Ticket ka SLA aur support ke kaam ke ghante kya hon?

- **Status:** `Tay`. Topic: B11 (support). Group G12.
- **Sawal:** har category (Q-102) ke ticket ka pehla jawab aur hal kitne samay me ho, aur support ke kaam ke ghante kya hon?
- **Kyun zaroori:**
  - Ek insaan (D-009) 24 ghante support nahi de sakta; SLA kaam ke ghanton me gina jaaye to vaada sach rehta hai.
  - Paise wale maamle aur skin reaction jaldi chahiye.
- **Vikalp:**
  - **(a) Ek SLA sab pe:** pehla jawab 24 kaam ke ghante, hal 3 kaam ke din.
  - **(b) Category ke hisaab se:**
    1. Paisa (kata par order nahi, refund nahi aaya) aur skin reaction: pehla jawab 4 kaam ke ghante, hal 1 kaam ka din (misaal).
    2. Baaki: 24 kaam ke ghante aur 3 kaam ke din; Beauty Advisor ka sawal 1 kaam ka din (misaal).
    3. Kaam ke ghante misaal Monday se Saturday 10:00 se 18:00 IST; chhuttiyan setting me (D-117 jaisa).
    4. Customer ke jawab ke intezaar me timer ruke; misaal 7 din jawab na aaye to ticket band (dobara khul sake).
    5. SLA tootne pe Support Lead ko in-app alert.
  - **(c) Koi SLA nahi.**
- **Salah:** **(b)**, R2 se. Zaroori maamle pehle, aur ek insaan ke liye sach vaada.
- **Trade-off:**
  - (a) me paise wala maamla bhi dheema.
  - (b) me timers aur calendar ka kaam.
  - (c) me customer ko koi umeed nahi.
- **Owner ka jawab (2026-11-19):** **(b)**, category ke hisaab se SLA (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-162.

### Q-104. Support ke faisle se santusht na ho to aage ka raasta, aur Grievance Officer?

- **Status:** `Tay`. Topic: B11 (support), B13 (compliance).
- **Sawal:** customer support ke faisle se santusht na ho to aage ka raasta kya ho, aur Grievance Officer ka kaam kaise chale?
- **Kyun zaroori:**
  - E-commerce ke consumer niyam grievance officer, shikayat ki receipt aur tay samay me hal maang sakte hain; reviews jaise user content ki shikayat ke alag samay ho sakte hain.
  - D-134 me Grievance Officer aur shikayatein L3 hain: page R1 me, raasta R2 me. Officer ki jaankari dummy hai (D-145 niyam 4).
- **Vikalp:**
  - **(a) Alag raasta nahi:** sab ek hi queue me.
  - **(b) Seedhi aur register:**
    1. Support Agent, phir Support Lead (appeal, D-147), phir Grievance Officer.
    2. "Grievance" ka alag form (bina sign-in bhi), ticket number turant.
    3. Receipt aur hal ke timers (misaal 48 ghante aur 30 din); review ya content ki shikayat ka chhota timer (misaal 24 ghante me receipt).
    4. Grievance register: har shikayat, faisla aur samay; mahine ki report Head of Operations ko (D-044).
    5. Grievance Officer ka role alag account pe (D-017).
  - **(c) (b), bina register.**
- **Salah:** **(b)**: site pe Grievance Officer ka saada page R1 se (D-134), poora raasta R2 se.
- **Trade-off:**
  - (a) me gambhir shikayat aam queue me dab jaati hai.
  - (b) me register aur timers ka kaam.
  - (c) me shikayaton ka record nahi.
- **Kanooni detail jaanchi nahi** (R-004): grievance officer, receipt aur hal ke samay, aur user content ki shikayat ke samay.
- **Owner ka jawab (2026-11-19):** **(b)**, seedhi aur register (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-163.

### Q-105. Seller ya delivery partner platform ke faisle se asehmat ho to?

- **Status:** `Tay`. Topic: B11 (disputes), B6 (settlement).
- **Sawal:** seller ya delivery partner platform ke kisi faisle (receiving ka farak, return pe "brand ki galti", bharpai, kaat, payout) se asehmat ho to raasta kya ho?
- **Kyun zaroori:**
  - D-096 (receiving ka farak), D-112 (brand ki galti ka kharcha seller ka), D-063 (bharpai), D-068 aur D-103 (partner ki kaat, "unki baat sun ke") aur D-081 (payout): har jagah faisla platform ka, par asehmati ka raasta tay nahi.
  - D-084 niyam 3 sirf listing ke liye hai.
- **Vikalp:**
  - **(a) Ticket:** seller ya partner ticket bheje, staff dekhe, koi tay samay nahi.
  - **(b) "Dispute" ek alag kaam:**
    1. Faisle ke misaal 7 din (seller) ya 3 din (partner) me, saboot ke saath.
    2. Faisla us team ka senior kare jo pehle faisle me nahi tha (D-084 niyam 3 jaisa).
    3. Faisla misaal 5 kaam ke din me.
    4. Dispute chalte us rakam pe rok (payout ki hold, ya kaat ruki).
    5. Har dispute ka record; seller ke payout statement me dispute ki line.
  - **(c) Sirf Finance tay kare.**
- **Salah:** **(b)**, R2 se. Saaf samay, nishpaksh faisla, aur jhagde ki rakam ka hisaab saaf.
- **Trade-off:**
  - (a) me maamle latakte hain.
  - (b) me dispute ka naya kaam aur rakam ki hold.
  - (c) me operations ke maamle Finance ke paas.
- **Owner ka jawab (2026-11-19):** **(b)**, dispute ek alag kaam (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-164.

### Q-106. Customer apni beauty profile save kar sake ya nahi?

- **Status:** `Tay`. Topic: B9 (personalisation), B14 (privacy). Group G13.
- **Sawal:** customer apni beauty profile (skin type, depth aur undertone, concerns, aur jinse allergy hai wo ingredients) save kar sake ya nahi, aur uska istemaal kahan ho?
- **Kyun zaroori:**
  - Shade finder, sujhaav aur "meri skin ke liye" filter isi pe tikte hain.
  - D-159 me customer ki apni allergy ke hisaab se chetavni baad ke liye rakhi gayi, jab allergy ka data aur consent tay ho; ye sawal wahi tay karta hai.
  - Allergy aur skin concerns sehat ke paas ka data hain.
- **Vikalp:**
  - **(a) Profile nahi:** chetavni sabke liye ek jaisi hi (D-159).
  - **(b) Optional profile, allergens samet:**
    1. Fields: skin type, depth aur undertone (D-085 ki list), concerns (D-137 ki list), allergy wale ingredients (ingredient master list, D-132, se chune).
    2. Istemaal: product page aur cart pe personal allergen chetavni, search me "meri skin ke liye" ka switch, shade finder.
    3. Chetavni ke saath hamesha "pack ki list se mila ke dekhein" (master list se milan galat ho sakta hai).
    4. Alag consent ("is jaankari se mujhe salah do"); customer kabhi bhi badle ya mitaye.
    5. Seller ko kabhi nahi; staff sirf tab jab customer khud support me bataye.
  - **(c) (b), bina allergens.**
- **Salah:** **(b)**, R2 se. Cosmetics me personal allergen chetavni sabse bada suraksha fayda hai.
- **Trade-off:**
  - (a) me personal suraksha nahi.
  - (b) me sehat ke paas ka data, consent, aur kam log hi dekhein.
  - (c) me suraksha wala hissa chhoot jaata hai.
- **Kanooni detail jaanchi nahi** (R-004): sehat ke paas ke data ki consent aur rakhna.
- **Owner ka jawab (2026-11-19):** **(b)**, optional profile, allergens samet (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-165.

### Q-107. Product sujhaav (recommendations) kis tarah ke hon?

- **Status:** `Tay`. Topic: B9 (recommendations). Group G13.
- **Sawal:** product sujhaav kis tarah ke hon, aur customer ki kharid ya profile (Q-106) ka istemaal ho ya nahi?
- **Kyun zaroori:**
  - "Is ke saath" aur routine (cleanser, serum, moisturiser, sunscreen) cosmetics me bikri badhate hain.
  - Personal data se sujhaav ke liye consent chahiye.
  - Apne brand (D-031) ko sujhaav me aage rakhna wahi anyay ka sawal hai jo search me (D-139).
- **Vikalp:**
  - **(a) Sirf product data se:** "milte-julte" (category, concern, daam), "isi brand ke aur"; koi personal data nahi.
  - **(b) (a) + kharid aur profile se:**
    1. Sab customers ki kharid ke jod se "saath me kharide gaye" (kisi ek customer ki baat nahi).
    2. Staff ki banayi routine templates se "routine poora karo".
    3. Sign-in customer ko uski profile aur pichhli kharid se, sirf consent ho to.
    4. Kram ki wahi niti jo search me: kisi seller ko boost nahi (D-139 niyam 3).
  - **(c) Bahar ki recommendation service.**
- **Salah:** **(b)**, R2 se. Kaam ke sujhaav, consent ke andar, aur sab sellers ke saath ek niyam.
- **Trade-off:**
  - (a) me personal madad nahi.
  - (b) me routine templates ka staff kaam aur consent ka hisaab.
  - (c) ₹0 me nahi, aur data bahar.
- **Kanooni detail jaanchi nahi** (R-004): personal data se sujhaav ki consent, aur apne brand ke prachaar me customer data.
- **Owner ka jawab (2026-11-19):** **(b)**, product data + kharid aur profile se (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-166.

### Q-108. Review ke saath reviewer apni skin ki jaankari bata sake?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** review ke saath customer apni skin type, depth aur undertone, aur umar ka group (sab optional) bata sake, aur product page pe reviews inse filter ho sakein?
- **Kyun zaroori:**
  - Cosmetics me "meri jaisi skin wale ko kaisa laga" sabse aam sawal hai. Review pe variant (shade) pehle se tay hai (D-076 niyam 5), par oily ya sensitive skin, ya undertone ka filter nahi.
  - Ye personal data hai; skin ki bimari (acne, eczema) sehat ke paas ka data hai. D-038 me sirf 18+ ki ghoshna hai, umar ka group naya data hoga.
- **Vikalp:**
  - **(a) Sirf variant:** review pe variant dikhe aur usi ka filter.
  - **(b) Optional fields, platform ki list se:** skin type (oily, dry, combination, normal, sensitive), depth aur undertone (D-085 ki list), umar ka group (misaal 18 se 24, 25 se 34, 35 se 44, 45+); review pe dikhe aur inse filter; skin ki bimari ka koi field nahi.
  - **(c) (b) + concerns** (acne, pigmentation jaise) bhi.
- **Salah:** **(b)**, R2 se (R1 me sirf variant). Sabse kaam ka filter, aur sehat wala data bahar.
- **Trade-off:**
  - (a) me shade ke alawa koi madad nahi.
  - (b) me thoda aur personal data aur uski consent.
  - (c) me sehat ke paas ka data public review pe.
- **Kanooni detail jaanchi nahi** (R-004): review ke saath dikhne wala personal data.
- **Owner ka jawab (2026-11-19):** **(b)**, optional fields, platform ki list se. Record: [DECISIONS.md](DECISIONS.md) D-167.

### Q-109. Shade finder kis tareeke se shade sujhaye?

- **Status:** `Tay`. Topic: B9 (shade finder).
- **Sawal:** shade finder (R2, D-085) kis tareeke se shade sujhaye?
- **Kyun zaroori:**
  - Foundation aur concealer me galat shade sabse aam pareshani hai, aur khula product man badla pe nahi lautta (D-079).
  - D-085 ka data (depth, undertone, shade family) isi ke liye hai.
- **Vikalp:**
  - **(a) Sawal-jawab:** depth, undertone (aasaan pehchaan: nas ka rang, sone ya chandi ka gehna kis pe achha lagta), finish aur coverage ki pasand; D-085 ke data se har brand ke milte shades.
  - **(b) (a) + "jo shade abhi lagate ho":** customer platform pe listed kisi bhi brand ka apna abhi ka product aur shade chune; usi ki depth aur undertone se doosre brands ke milte shades. Data sirf listed products ka.
  - **(c) Camera se skin tone padhna.**
- **Salah:** **(b)**, R2 se. Customer ka asli anubhav (jo shade use pehle se jachta hai) sabse achha aadhaar hai. (c) abhi nahi: roshni aur camera ke hisaab se galat nateeje, aur chehre ki photo ka jokhim.
- **Trade-off:**
  - (a) me customer ki apni pehchaan galat ho sakti hai.
  - (b) me brands ke beech mel sirf D-085 ke moote data se.
  - (c) me galat nateeje aur privacy ka jokhim.
- **Owner ka jawab (2026-11-19):** **(b)**, sawal-jawab + abhi ka shade. Record: [DECISIONS.md](DECISIONS.md) D-168.

### Q-110. Virtual try-on kis roop me ho?

- **Status:** `Tay`. Topic: B9 (try-on).
- **Sawal:** virtual try-on kis roop me ho, kin products pe, aur customer ki photo ya video ka kya ho?
- **Kyun zaroori:**
  - Try-on R2 se hai (D-055), aur camera sirf apni site ke liye (SR-001). ₹0 (D-028) me paid try-on services nahi.
  - Lip aur eye ka try-on browser me ho sakta hai; foundation ka sahi try-on roshni ki wajah se mushkil hai.
  - Chehra personal data hai.
- **Vikalp:**
  - **(a) Try-on nahi:** uski jagah har shade ki alag skin tones pe photos (D-085 niyam 4).
  - **(b) Browser me, device pe hi:**
    1. Camera live (ya ek photo jo device se bahar na jaaye).
    2. Sirf lipstick, lip gloss, blush, eyeshadow aur eyeliner; baaki baad me.
    3. Rang D-085 ke hex se; screen pe note "rang asli se alag dikh sakta hai".
    4. Koi photo ya video server pe nahi jaata, save nahi hota.
    5. Pehli baar camera se pehle saaf consent.
    6. Shade ke rang (hex) ki jaanch ek staff role kare (misaal "Shade Specialist", D-085 niyam 5 ke saath).
  - **(c) (b) + foundation, aur photo server pe.**
- **Salah:** **(b)**, R2 se. ₹0 me ho sakta hai, chehre ka data device se bahar nahi jaata, aur sabse zyada fayde wali categories me hai.
- **Trade-off:**
  - (a) me try-on ka fayda nahi.
  - (b) me shade ke hex ki sahi jaanch zaroori, aur purane phones pe dheema.
  - (c) me galat nateeje aur chehre ka data server pe.
- **Kanooni detail jaanchi nahi** (R-004): chehre ki photo ya video ki consent.
- **Owner ka jawab (2026-11-19):** **(b)**, browser me, device pe hi (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-169.

### Q-111. Product pe public sawal-jawab (Q&A) ho ya nahi?

- **Status:** `Tay`. Topic: B8 (UGC).
- **Sawal:** product page pe customer public sawal pooch sake ("kya ye oily skin pe chalega?"), aur jawab kaun de?
- **Kyun zaroori:**
  - Kharidne se pehle ka sawal aam hai. Beauty Advisor ka message thread (D-025) private hai: ek customer ka sawal, ek ka jawab.
  - Public Q&A ka ek jawab sabke kaam aata hai, par moderation ka bojh aur sehat ki galat salah ka jokhim hai.
- **Vikalp:**
  - **(a) Public Q&A nahi:** sawal Beauty Advisor ke thread (D-025) se.
  - **(b) Public Q&A:** sawal sign-in se; jawab brand (seller) aur us product ke verified buyers de sakein; brand ke jawab pe "Brand" label; har sawal aur jawab reviews wale moderation niyam (D-136, D-146) se; ilaaj ya dawa jaise sawal pe tay jawab "Skin & Hair Expert se salah lein" (D-025).
  - **(c) Sirf brand jawab de.**
- **Salah:** **(b)**, R2 se. Ek jawab bahut logon ke kaam aata hai, aur Advisor pe bojh kam hota hai.
- **Trade-off:**
  - (a) me har customer ko alag poochhna padta.
  - (b) me moderation ka aur kaam.
  - (c) me brand ke jawab ki der aur ek-tarfa jaankari.
- **Owner ka jawab (2026-11-19):** **(b)**, public Q&A. Record: [DECISIONS.md](DECISIONS.md) D-170.

### Q-112. Brand formula badle to purane reviews ka kya ho?

- **Status:** `Tay`. Topic: B8 (reviews), B3 (catalog).
- **Sawal:** brand usi product ka formula badle (ingredients badle, D-098 ki jaanch ke baad), to purane reviews ka kya ho?
- **Kyun zaroori:**
  - Cosmetics me formula badalna aam hai (paraben hatana, fragrance badalna). Purane formula ke reviews (jaise kisi ingredient se reaction) naye formula pe galat tasveer dete hain.
  - D-076 niyam 4 variants ke farak ke liye hai; samay ke saath formula badalne ka niyam nahi.
- **Vikalp:**
  - **(a) Kuch nahi:** reviews waise hi.
  - **(b) Purane formula ka label:** listing ki jaanch (D-098) me staff ingredients ke bade badlav ko "formula badla" mark kare; us tareekh se pehle ke reviews pe "pehle ke formula pe" label; rating do roop me dikhe (misaal "naya formula: 4.2 (12)", "kul: 4.0 (340)").
  - **(c) Naya product:** formula badle to naya product, reviews zero se.
- **Salah:** **(b)**, R2 se; R1 me har review pe us waqt ka listing version save ho (data). Purani jaankari khoti nahi, aur naya customer naye formula ki asli tasveer dekhta hai.
- **Trade-off:**
  - (a) me galat tasveer.
  - (b) me "bada badlav" kya hai, ye staff ki samajh (misaal: naya ya hata hua ingredient upar ke 10 me).
  - (c) me brand ke saalon ke reviews khatam.
- **Owner ka jawab (2026-11-19):** **(b)**, purane formula ka label. Record: [DECISIONS.md](DECISIONS.md) D-171.

### Q-113. Consultation muft ho ya paid, aur kitni baar?

- **Status:** `Tay`. Topic: B11 (support).
- **Sawal:** Beauty Advisor aur Skin & Hair Expert ki consultation (D-025) muft ho ya paid, aur ek customer kitni le sake?
- **Kyun zaroori:**
  - D-025 me flow tay hai (request, time aur link, consult, resolve; cancel aur no-show), par daam aur seema nahi.
  - Paid ho to payment, no-show pe refund aur seva ke invoice ka kaam judta hai. Expert ke notes sehat ka data hain (D-025).
- **Vikalp:**
  - **(a) Muft, seema ke saath:** ek customer mahine me misaal 2 booking; 2 baar no-show to 30 din booking band; Advisor ka message thread muft (din me misaal 5 sawal).
  - **(b) Advisor muft, Expert paid:** misaal ₹299 (Razorpay test mode); 24 ghante pehle cancel pe poora refund, no-show pe nahi; seva ka invoice platform ka.
  - **(c) Dono muft, bina seema.**
- **Salah:** **(a)**, R2 se. Payment aur seva ke invoice ka naya kaam nahi, aur seema se bojh seemit.
- **Trade-off:**
  - (a) me Expert ke samay ki keemat nahi.
  - (b) me payment, refund aur invoice ka kaam.
  - (c) me ek insaan ke samay pe koi rok nahi.
- **Kanooni detail jaanchi nahi** (R-004): dermatologist jaise expert ki online consultation ke niyam (D-025 ki dummy row), aur seva pe GST.
- **Owner ka jawab (2026-11-19):** **(a)**, muft, seema ke saath. Record: [DECISIONS.md](DECISIONS.md) D-172.

### Q-114. Customer loyalty program ho ya nahi, aur kis roop me?

- **Status:** `Tay`. Topic: B10 (loyalty). Group G14.
- **Sawal:** customer loyalty program ho ya nahi, aur ho to kis roop me?
- **Kyun zaroori:**
  - Beauty me dobara kharid business ki jaan hai.
  - Par diye hue points platform pe rakam ki zimmedari (liability) hain, aur maal brands ka hai (D-060). R2 se (D-055).
- **Vikalp:**
  - **(a) Loyalty nahi:** sirf offers aur coupons (D-101).
  - **(b) Points:** har delivered order pe points (misaal har ₹100 pe 1 point, 1 point = ₹1 ki chhoot); points sirf platform pe kharch, cash ya bank me nahi badalte, transfer nahi; program ek staff role sambhale (misaal "Loyalty Manager", Growth Studio me).
  - **(c) Tiers + points:** saal ki kharid se tier (misaal Silver, Gold); tier pe zyada points, muft delivery (D-107) ya sale me pehle pahunch.
- **Salah:** **(b)**, R2 se; tiers baad me (data me jagah rahe).
- **Trade-off:**
  - (a) me dobara kharid ka koi khaas karan nahi.
  - (b) me points ka khaata aur liability.
  - (c) me tiers ke niyam, aur delivery fee ka hisaab.
- **Kanooni detail jaanchi nahi** (R-004): points prepaid instrument bante hain ya nahi, aur points pe GST.
- **Owner ka jawab (2026-11-19):** **(b)**, points; tiers baad me. Record: [DECISIONS.md](DECISIONS.md) D-173.

### Q-115. Points kis rakam pe milein, kab pakke hon, kab expire hon?

- **Status:** `Tay`. Topic: B10 (loyalty). Group G14.
- **Sawal:** Q-114 me points chune jaayein to points kis rakam pe milein, kab pakke hon, kab expire hon, aur kaise kharch hon?
- **Kyun zaroori:**
  - Return aur cancel (D-110, D-114) pe points wapas hone chahiye; seller ka paisa bhi return window ke baad payable hota hai (D-081).
  - Expiry ke bina liability badhti rehti hai. Pro daam pe coupon nahi (D-102), to points ka bhi sawal.
- **Vikalp:**
  - **(a) Saada:** delivery pe pakke, expiry nahi, poore order pe kharch.
  - **(b) Niyam ke saath:**
    1. Aadhaar: customer ne jo paisa diya, delivery fee aur Pro daam wali lines ke bina.
    2. Points "pending" jab tak return window (D-080) na nikle; phir pakke. Return ya cancel pe us line ke pending points hatein.
    3. Expiry misaal 12 mahine (har point apni tareekh se); expiry se 30 din pehle in-app aur push se yaad.
    4. Kharch: ek order pe zyada se zyada misaal 20% rakam tak; ek coupon (D-102) ke saath chal sake.
    5. Points se kharida item return ho to points wapas (agar expire nahi hue); paise wala hissa original raaste (D-111).
    6. Review ke badle points nahi (D-158).
  - **(c) Points se poora order.**
- **Salah:** **(b)**, R2 se. Liability seemit, khel ke raaste band, aur hisaab return ke niyam se mel khata hai.
- **Trade-off:**
  - (a) me liability behisaab aur return pe khel.
  - (b) me pending aur expiry ka hisaab.
  - (c) me poora order "muft", platform ka kharcha bada.
- **Kanooni detail jaanchi nahi** (R-004): points ki expiry aur suchna ke niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, niyam ke saath (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-174.

### Q-116. Points ki chhoot ka paisa kaun de?

- **Status:** `Tay`. Topic: B10 (loyalty), B6 (settlement). Group G14.
- **Sawal:** points se mili chhoot ka paisa kaun de: platform, brand, ya dono?
- **Kyun zaroori:**
  - D-101 me offers ka niyam hai; points bhi chhoot hain.
  - Platform de to seller ko poora daam milta hai (D-101 niyam 1 jaisa) aur liability platform ki. Brand chahe to apne product pe zyada points dekar bikri badha sake.
- **Vikalp:**
  - **(a) Sirf platform:** har points chhoot platform ka discount; seller ko poora daam; finance me points ki liability ka khaata.
  - **(b) Platform + brand ke bonus points:** base points platform ke; brand apne products pe bonus points de sake (brand ka kharcha, budget ke saath, D-101 niyam 2 jaisa).
  - **(c) Brand ka % har order pe.**
- **Salah:** **(a)** shuru me, **(b)** baad me; R2 se. Seller ka hisaab saaf rehta hai.
- **Trade-off:**
  - (a) me saara kharcha platform ka.
  - (b) me brand ke budget ka hisaab.
  - (c) me sellers pe bina poochhe kharcha.
- **Kanooni detail jaanchi nahi** (R-004): points ki chhoot ka invoice aur GST pe asar.
- **Owner ka jawab (2026-11-19):** **(a)**, shuru me sirf platform; brand ke bonus points baad me. Record: [DECISIONS.md](DECISIONS.md) D-175.

### Q-117. "Dost ko bulao" (referral) ka program ho ya nahi?

- **Status:** `Tay`. Topic: B10 (loyalty), B14 (abuse). Group G14.
- **Sawal:** "dost ko bulao" (referral) ka program ho ya nahi?
- **Kyun zaroori:**
  - Naye customer laane ka sasta raasta hai, par fraud ka bhi.
  - Ek insaan ke kai email (jaise `+` alias, jo D-017 me jaan-boojh ke normalise nahi hota) se khud ko refer karna aasaan hai.
- **Vikalp:**
  - **(a) Referral nahi.**
  - **(b) Referral, rok ke saath:**
    1. Dono ko inaam (Q-114 me points chune jaayein to points, warna coupon), sirf jab naye customer ka pehla order deliver ho aur return window (D-080) paar ho.
    2. Ek customer ke saal me misaal 10 referrals tak.
    3. Ek hi address, device ya payment wale referral pe inaam nahi.
  - **(c) Sirf bulaane wale ko inaam.**
- **Salah:** **(b)**, R2 ke baad, fraud ke niyam ke saath.
- **Trade-off:**
  - (a) me growth ka ek raasta kam.
  - (b) me fraud ki jaanch ka kaam.
  - (c) me naye customer ko koi khaas karan nahi.
- **Owner ka jawab (2026-11-19):** **(b)**, referral, rok ke saath (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-176.

### Q-118. Store credit ho ya nahi?

- **Status:** `Tay`. Topic: B10 (store credit).
- **Sawal:** store credit (platform pe kharch hone wala balance) ho ya nahi, aur kis kaam ke liye?
- **Kyun zaroori:**
  - D-111 me refund hamesha original raaste, to store credit refund ka raasta nahi.
  - Phir bhi goodwill (der ya galat item ki takleef) me "₹100 ka credit" support ka aam tareeka hai. Balance paise jaisa dikhe to prepaid ka sawal uthta hai.
- **Vikalp:**
  - **(a) Store credit nahi:** goodwill sirf ek customer ke liye ek baar ke coupon (platform ka offer, D-101) se.
  - **(b) Promo credit:**
    1. Sirf platform de (goodwill ya promotion); customer paisa daal ke kabhi nahi khareedta.
    2. Cash ya bank me nahi badalta, transfer nahi; expiry misaal 90 din.
    3. Kabhi refund ka raasta nahi (D-111).
    4. Support role ki rakam seema (misaal ₹200 ek maamle me).
  - **(c) Wallet:** customer paisa daal ke balance rakhe.
- **Salah:** **(a)**, R2 se. Naya balance aur khaata nahi chahiye; coupon ka raasta R2 me ban hi raha hai.
- **Trade-off:**
  - (a) me goodwill coupon ke saath customer ka us order pe doosra coupon nahi chalta (D-102).
  - (b) me naya balance, khaata aur expiry.
  - (c) me prepaid ke niyam ka seedha jokhim.
- **Kanooni detail jaanchi nahi** (R-004): promo credit ya wallet ka prepaid instrument ke niyam me aana.
- **Owner ka jawab (2026-11-19):** **(a)**, store credit nahi. Record: [DECISIONS.md](DECISIONS.md) D-177.

### Q-119. Rozana khatam hone wale products ki "dobara kharid" kis roop me?

- **Status:** `Tay`. Topic: B10 (subscriptions).
- **Sawal:** rozana khatam hone wale products (face wash, shampoo, sunscreen) ke liye "dobara kharid" ki suvidha kis roop me ho?
- **Kyun zaroori:**
  - Consumables ka chakkar tay hota hai, aur ye dobara kharid ka sabse aasaan mauka hai.
  - Subscription me har baar naya batch (D-064 ka MRP, D-067 ki expiry), daam badal sakta hai (D-061, D-087), stock na ho sakta hai, aur recurring payment ke niyam lagte hain. Delivery pe UPI (D-034) subscription me nahi chalta.
- **Vikalp:**
  - **(a) Sirf "dobara order" button:** pichhle order se cart.
  - **(b) (a) + yaad:**
    1. Size aur category se andaaza (misaal 100 ml face wash lagbhag 60 din; staff setting).
    2. Customer chahe to yaad chalu kare; yaad in-app aur push se, email nahi (D-141).
    3. Ek tap pe cart me, us din ke daam aur expiry ke saath; koi pehle se payment nahi.
  - **(c) Subscription:** har X din pe apne aap order aur payment (recurring mandate); daam badle to pehle khabar aur customer ki haan; stock na ho to wo baar skip; "subscribe karo, bachao" ki chhoot (D-101).
- **Salah:** **(b)** R2 se; **(c)** baad me, kanooni aur payment ki jaanch ke baad.
- **Trade-off:**
  - (a) me customer ko khud yaad rakhna padta.
  - (b) me andaaze ki setting.
  - (c) me mandate, daam ki haan aur stock ke niyam ka bada kaam.
- **Kanooni detail jaanchi nahi** (R-004): recurring payment mandate ke RBI niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, dobara order + yaad; subscription baad me. Record: [DECISIONS.md](DECISIONS.md) D-178.

### Q-120. Gift cards ho ya nahi, aur kab?

- **Status:** `Tay`. Topic: B10 (gift cards).
- **Sawal:** gift card (koi customer doosre ko platform pe kharch ke liye rakam de) ho ya nahi, aur kab?
- **Kyun zaroori:**
  - Tyohar aur gifting me beauty gift cards aam hain.
  - Par gift card me customer ka paisa pehle aata hai (D-093), bina kharch ka balance platform ki liability hai, expiry ke niyam lagte hain, aur platform pe doosre sellers ka maal bhi bikta hai, isliye prepaid ke niyam alag ho sakte hain.
  - Gift card ka code email se jaata hai (300 ki seema, D-028, D-142).
- **Vikalp:**
  - **(a) Gift cards nahi.**
  - **(b) Design abhi, banana kanooni jaanch ke baad:** data aur finance ke khaate design me; banana tab jab kanooni jaanch (R-004) ho jaaye. Niyam (misaal): tay rakam (₹500, ₹1,000, ₹2,000); code paane wale ke email pe; thoda-thoda kharch; balance dikhe; cash me nahi; gift card se kharida item return ho to rakam gift card me wapas (D-111 ka "original raasta"); khareeda gift card sirf bina istemaal ke cancel.
  - **(c) R2 me test mode me, dummy kanooni details ke saath (D-026).**
- **Salah:** **(b)**: R2 ke baad, kanooni jaanch pe. Design asli rahe, par paise jaisi cheez kanoon dekhe bina na bane.
- **Trade-off:**
  - (a) me gifting ka raasta nahi.
  - (b) me feature der se.
  - (c) me galat design ka jokhim jo baad me badalna pade.
- **Kanooni detail jaanchi nahi** (R-004): prepaid instrument (closed ya semi-closed) ke niyam, gift card ki kam se kam muddat aur KYC, gift voucher pe GST, aur bina kharch ke balance ka hisaab. Is sawal ka jawab kanooni jaanch ke baad badal sakta hai.
- **Owner ka jawab (2026-11-19):** **(b)**, design abhi, banana kanooni jaanch ke baad. Record: [DECISIONS.md](DECISIONS.md) D-179.

### Q-121. Customer app me ek sign-in kitne din chale?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** customer app me ek baar sign-in kitne din tak chale, phir dobara sign-in?
- **Kyun zaroori:**
  - Guest cart nahi (D-020), to cart aur wishlist ke liye sign-in chahiye. Har naya sign-in email code (D-021) se hai, jo emails ki din ki chhat (D-142) khaata hai.
  - Lamba session chori ho jaaye to lamba chalta hai, aur shared phone ya laptop pe agla insaan account me hota hai.
- **Vikalp:**
  - **(a)** Har istemaal pe 30 din aage badhe, zyada se zyada 90 din; phir dobara sign-in.
  - **(b)** Har istemaal pe 7 din aage, zyada se zyada 30 din.
  - **(c)** Har istemaal pe 90 din aage, zyada se zyada 1 saal.
- **Salah:** **(a)**, saath me account ki security badalne pe dobara pehchaan, aur "My devices" se kisi bhi session ko band karne ka raasta. Isse lambe session ka jokhim kam rehta hai.
- **Trade-off:**
  - (a) me chori hua session 90 din tak chal sakta hai, jab tak customer use band na kare.
  - (b) me har hafte sign-in: zyada codes, zyada rukawat.
  - (c) sabse aasaan, par chori ka asar sabse lamba.
- **Owner ka jawab (2026-11-19):** **(a)**, har istemaal pe 30 din aage, zyada se zyada 90 din. Record: [DECISIONS.md](DECISIONS.md) D-180.

### Q-122. Staff aur seller apps me sign-in kitni der chale?

- **Status:** `Tay`. Topic: B14 (security), B2 (apps).
- **Sawal:** staff ke 7 apps (Admin, Super Admin, Master, Support Desk, Finance, Logistics Ops, Growth Studio), Seller app aur Creator app me session kitni der chale, aur bina kaam ke kitni der me band ho?
- **Kyun zaroori:**
  - Staff ke accounts sabse taaqatwar hain; khula chhoda laptop ya chori hua session bada nuksaan kar sakta hai.
  - Owner ke ~80 accounts (D-017) pe roz sign-in ka bojh isi number se tay hota hai.
- **Vikalp:**
  - **(a) Ek kaam ka din:** staff apps 12 ghante, 30 minute bina kaam pe band; Seller har istemaal pe 7 din aage, zyada se zyada 30 din; Creator (R2) 30 din aage, zyada se zyada 90 din.
  - **(b) Kada:** staff apps 8 ghante, 15 minute bina kaam pe band; Seller 1 din aage, zyada se zyada 7 din; Creator 7 din aage, zyada se zyada 30 din.
  - **(c) Dheela:** staff apps 24 ghante, 2 ghante bina kaam pe band; Seller aur Creator 30 din aage, zyada se zyada 90 din.
- **Salah:** **(a)**: staff ke liye ek kaam ka din, seller ke liye hafte me ek sign-in, Creator customer jaisa. (b) owner ke accounts ke saath bahut bhaari hai.
- **Trade-off:**
  - (a) me staff ka chori hua session ek din tak chal sakta hai.
  - (b) zyada surakshit, par bahut sign-in.
  - (c) aasaan, par chori ka asar lamba.
- **Owner ka jawab (2026-11-19):** **(a)**, ek kaam ka din (staff 12 ghante, seller hafte me ek sign-in). Record: [DECISIONS.md](DECISIONS.md) D-181.

### Q-123. Baar-baar galat password ya code pe rok kaisi ho?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** baar-baar galat password ya code daalne pe account kaise roka jaaye?
- **Kyun zaroori:**
  - Rok na ho to password ka andaaza lagta rehta hai.
  - Par poore account ki rok ho to koi bhi jaan-boojh ke galat password daal ke owner ke staff accounts band kar sakta hai.
- **Vikalp:**
  - **(a) IP aur account mila ke:**
    1. Ek IP se 15 minute me 10 galat koshish: us IP se us account pe 1 ghante ki rok.
    2. Saare IPs mila ke 15 minute me 50 galat: poore account pe 15 minute ki rok.
    3. Rok ke dauraan "password bhool gaye" chalta rahe, aur rok ke dauraan ki koshishein gini na jaayein.
  - **(b) Sirf account:** 15 minute me 10 galat koshish pe poora account 1 ghante band, har IP se.
  - **(c) Account pe rok nahi:** sirf IP ki rate limit aur leak hue passwords ki jaanch.
- **Salah:** **(a)**. Hamlavar ka andaaza rukta hai, aur asli user doosri jagah se sign-in kar sakta hai. Numbers misaal hain.
- **Trade-off:**
  - (a) me do ginti ka kaam; bahut IPs wala hamlavar 15 minute ki poori rok tak pahunch sakta hai.
  - (b) seedha, par rok khud hamle ka hathiyar ban jaati hai.
  - (c) me andaaze pe kam rok.
- **Owner ka jawab (2026-11-19):** **(a)**, rok IP aur account mila ke. Record: [DECISIONS.md](DECISIONS.md) D-182.

### Q-124. Delivery app me sign-in kaise ho, aur kya session ek phone se bandha ho?

- **Status:** `Tay`. Topic: B14 (security), B1 (delivery).
- **Sawal:** delivery partner Delivery app me kaise sign-in kare, aur kya session ek manzoor phone se bandha ho?
- **Kyun zaroori:**
  - Partner ka phone hi kaam ka auzaar hai, app offline bhi chalta hai (D-042), aur phone pe customers ke naam, address aur phone hote hain.
  - Partners gig partners hain (D-033): har shift pe authenticator ka bojh kaam rokta hai.
- **Vikalp:**
  - **(a) Manzoor phone:** email aur password; partner ka ek manzoor phone (Hub Manager manzoor kare; naya phone = nayi manzoori); session usi phone pe misaal 14 din; authenticator optional; Hub Manager kabhi bhi session band kar sake.
  - **(b) Har shift authenticator:** email, password aur authenticator, misaal har 12 ghante.
  - **(c) Bina bandish:** email aur password, session 30 din, phone ki koi bandish nahi.
- **Salah:** **(a)**. Offline ke saath chalta hai, phone khone pe Hub Manager turant band kar sakta hai, aur partner pe roz ka bojh nahi.
- **Trade-off:**
  - (a) me Hub Manager ka kaam (naya phone manzoor karna); phone ki pehchaan browser me rakhi key se hoti hai, to browser ka data saaf hone pe dobara manzoori.
  - (b) zyada surakshit, par authenticator usi phone pe ho to phone chori = dono gaye.
  - (c) aasaan, par chori ka asar lamba.
- **Owner ka jawab (2026-11-19):** **(a)**, manzoor phone ke saath sign-in. Record: [DECISIONS.md](DECISIONS.md) D-183.

### Q-125. Seller app me authenticator kin users pe zaroori ho?

- **Status:** `Tay`. Topic: B14 (security), B2 (roles).
- **Sawal:** seller ke kaunse users ke liye authenticator zaroori ho?
- **Kyun zaroori:** D-017 me misaal Account Owner aur Seller Finance hai. Par daam badalna (₹1,999 ki jagah ₹199), maal bhejna aur seller ke staff jodna bhi bade asar wale kaam hain; inka account chori ho to seller ka seedha nuksaan.
- **Vikalp:**
  - **(a) Jokhim ke hisaab se:** Account Owner, Finance, aur jis bhi user ko daam, payout ya bank, seller ke staff, ya maal bhejne ka haq ho; sirf listing content ya reports wale users bina authenticator.
  - **(b)** Sirf Account Owner aur Finance.
  - **(c)** Saare seller users.
- **Salah:** **(a)**: jahan nuksaan ho sakta hai wahan doosra factor, aur content likhne walon pe bojh nahi.
- **Trade-off:**
  - (a) me seller ke kai users pe authenticator.
  - (b) me daam aur maal bhejna bina doosre factor ke.
  - (c) sabse surakshit, par chhote brand ke content wale bhi authenticator chalayein.
- **Owner ka jawab (2026-11-19):** **(a)**, authenticator jokhim ke hisaab se. Record: [DECISIONS.md](DECISIONS.md) D-184.

### Q-126. Kin kaamon se pehle dobara authenticator maanga jaaye?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** sign-in ke baad bhi kin kaamon se theek pehle dobara authenticator code maanga jaaye?
- **Kyun zaroori:** khula chhoda session ya chori hui cookie se sabse bade kaam na ho sakein. Par har kaam pe code maangna kaam rok deta hai.
- **Vikalp:**
  - **(a) Tay list, misaal 5 minute ki khidki:** role ya grant dena aur hatana; authenticator reset; allowlist badalna (D-133); area ke switches aur live karna; fees, policy ke numbers, HSN table, blocklist aur emails ki chhat badalna; payout "paid"; seema se upar refund ya daawe ki manzoori; data export; seller ka bank badalna; kill switches. Authenticator band karna aur naye recovery codes banana har baar apna alag code maangein.
  - **(b)** Staff ke har likhne wale kaam pe.
  - **(c)** Sirf Master ke kaamon pe.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me naye kaam aane pe list badhani padegi.
  - (b) me staff ka kaam bahut dheema.
  - (c) me Finance aur Admin ke bade kaam bina dobara code ke.
- **Owner ka jawab (2026-11-19):** **(a)**, bade kaamon ki tay list pe dobara code. Record: [DECISIONS.md](DECISIONS.md) D-185.

### Q-127. Kai apps me sign-in: har app alag, ya ek jagah sign-in se sab apps?

- **Status:** `Tay`. Topic: B14 (security), B2 (apps).
- **Sawal:** jis insaan ke roles kai apps me hon, wo har app me alag sign-in kare, ya ek jagah sign-in karke sab apps khulein?
- **Kyun zaroori:** 11 apps alag hosts pe hain (D-010, D-048, domain nahi D-028), aur cookies har host ki alag hoti hain.
- **Vikalp:**
  - **(a) Har app alag:** har app ka apna sign-in aur apni cookies; password manager se aasaan.
  - **(b) Ek central sign-in app:** baaki apps redirect se ek baar ka code le ke apna session banayein.
  - **(c)** Abhi (a), aur asli business pe (b), jab asli staff ke roles kai apps me hon.
- **Salah:** **(a)**. Owner ke har role ka alag account hai (D-017), to zyadatar ek account ek hi app me jaata hai. Central sign-in se owner ka bojh kam nahi hota, aur redirect aur code se hamle ke naye raaste khulte hain.
- **Trade-off:**
  - (a) me asli business pe kai roles wale staff ko kai sign-in.
  - (b) me ek jagah chori = saare apps, aur banane ka kaam bada.
  - (c) me baad me badlav ka kaam.
- **Owner ka jawab (2026-11-19):** **(a)**, har app ka apna sign-in. Record: [DECISIONS.md](DECISIONS.md) D-186.

### Q-128. Sign-in, sign-up aur password reset ke code wale emails ki seema kya ho?

- **Status:** `Tay`. Topic: B14 (security), B11 (notifications).
- **Sawal:** bina sign-in maange jaane wale code ke emails (sign-in, sign-up, password reset) kitne bheje ja sakein?
- **Kyun zaroori:**
  - Code maangna bina sign-in ke hota hai, aur din ke 300 emails me OTP ki 60 pakki jagah hai (D-142).
  - Seema na ho to koi bhi codes maang-maang ke din ki jagah kha sakta hai, ya kisi ke inbox pe emails ki baadh la sakta hai. Allowlist (D-133) abhi isse bachati hai, par asli business pe allowlist band hogi.
- **Vikalp:**
  - **(a)** Ek email ko ghante me 5 code (ek IP se unme 3 tak); saare emails mila ke ghante me 30; sign-up ke codes din me 20. Allowlist band karte waqt numbers dobara dekhna.
  - **(b) Kada:** ek email ko ghante me 3, sab mila ke 15, sign-up din me 10.
  - **(c) Dheela:** ek email ko ghante me 10, sab mila ke 60, sign-up din me 60.
- **Salah:** **(a)**: sign-up ki baadh me bhi password reset, invite aur security codes ke liye jagah bachti hai.
- **Trade-off:**
  - (a) me bhaari ghante me asli user ko "thodi der baad koshish karein" ka sandesh.
  - (b) aur kada.
  - (c) me ek ghante me OTP ki poori din ki jagah khatam ho sakti hai.
- **Owner ka jawab (2026-11-19):** **(a)**, code wale emails ki salah wali seema. Record: [DECISIONS.md](DECISIONS.md) D-187.

### Q-129. Support Agent kitni rakam tak refund ya daawa khud manzoor kare?

- **Status:** `Tay`. Topic: B14 (security), B11 (support), B6 (refunds).
- **Sawal:** Support Agent ek maamle me aur din me kitni rakam tak refund ya daawa khud manzoor kare, aur kab doosre account ki haan chahiye?
- **Kyun zaroori:**
  - Zyadatar refund niyam se apne aap shuru hote hain (D-111), par daawe ka faisla aur fail hue refund ka staff wala raasta insaan karta hai (D-105, D-111).
  - Chori hua account ya mili-bhagat yahin nuksaan karti hai.
- **Vikalp:**
  - **(a) Seema:** Support Agent ek maamle me misaal ₹2,000 tak aur din me kul misaal ₹10,000 tak; usse upar Support Lead (doosra account). Fail hue refund ka staff wala raasta hamesha Support Lead aur Finance ki manzoori se.
  - **(b) Koi seema nahi:** sirf audit.
  - **(c)** Har insaani faisle pe doosre account ki haan.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me bade maamle thodi der se.
  - (b) me ek account se bada nuksaan.
  - (c) me har chhote maamle pe do accounts (owner ke do accounts) ka bojh.
- **Owner ka jawab (2026-11-19):** **(a)**, Support Agent ki seema, upar Support Lead. Record: [DECISIONS.md](DECISIONS.md) D-188.

### Q-130. Seller ka payout "paid" mark karne ke liye ek account kaafi ho ya do?

- **Status:** `Tay`. Topic: B14 (security), B6 (settlement).
- **Sawal:** seller ke payout ko "paid" mark karne ke liye ek account kaafi ho, ya do?
- **Kyun zaroori:**
  - R1 me payout haath se "paid" mark hota hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1); asli business pe yahi asli bank transfer banega.
  - Ek hi account payout bana bhi sake aur mark bhi kare, to chori hua account seller ka paisa "paid" dikha sakta hai.
- **Vikalp:**
  - **(a) Do haath:** Finance role payout batch banaye; Master ka doosra account (D-047) manzoor kare; ek account dono kaam nahi kar sakta.
  - **(b)** Finance role akela bana ke mark kare.
  - **(c)** Sirf Master mark kare.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me har hafte do accounts se kaam (owner ke liye do sign-in).
  - (b) me ek account ka jokhim.
  - (c) me Master ke paas roz ke kaam ka haq aa jaata hai, jo D-047 ki soch ke khilaaf hai.
- **Owner ka jawab (2026-11-19):** **(a)**, do haath: Finance banaye, Master manzoor kare. Record: [DECISIONS.md](DECISIONS.md) D-189.

### Q-131. Seller apna bank khaata badle to naye khaate pe payout kab?

- **Status:** `Tay`. Topic: B14 (security), B6 (settlement).
- **Sawal:** seller apna bank ya payout ka khaata badle to naye khaate pe payout turant ho, ya kuch rok ke baad?
- **Kyun zaroori:** sellers ka paisa platform ke paas rehta hai (D-093). Seller ka account chori karke bank badalna aur agla payout apne khaate me lena sabse seedha nuksaan hai.
- **Vikalp:**
  - **(a) Rok ke saath:** bank badalne pe dobara authenticator code, purane email aur in-app pe khabar, aur naye khaate pe misaal 72 ghante tak payout nahi; us dauraan Account Owner "ye maine nahi kiya" daba ke badlav rok sake.
  - **(b) Staff ki jaanch:** naye khaate pe pehla payout Seller Ops ki jaanch ke baad.
  - **(c) Koi rok nahi:** sirf khabar.
- **Salah:** **(a)**; asli business pe (b) bhi saath me.
- **Trade-off:**
  - (a) me bank badalne ke baad payout 3 din der se.
  - (b) me staff ka kaam.
  - (c) me chori ka seedha raasta.
- **Owner ka jawab (2026-11-19):** **(a)**, rok ke saath; asli business pe staff ki jaanch bhi. Record: [DECISIONS.md](DECISIONS.md) D-190.

### Q-132. Delivery ke saboot (photo aur location) kitne din rakhein, aur kaun dekhe?

- **Status:** `Tay`. Topic: B14 (security, privacy), B1 (delivery).
- **Sawal:** delivery ke waqt li gayi photo aur partner ki location (D-072) kitne din rakhein, aur kaun dekh sake?
- **Kyun zaroori:**
  - Photo me ghar ka darwaza ya koi insaan aa sakta hai, aur location se customer ka ghar pata chalta hai.
  - Saboot daawe (D-148), partner ke dispute (D-164, R2) aur chargeback (D-095, R2) ke liye bhi chahiye.
- **Vikalp:**
  - **(a)** Delivered se misaal 180 din, ya khula daawa, dispute ya chargeback band hone tak (jo baad me ho). Dekhe: daawe pe Support Agent aur Support Lead, aur apne hub ka Hub Manager; partner submit ke baad nahi; customer apni delivery ki photo dekh sake.
  - **(b)** 30 din (daawe ki seema ke baad delete).
  - **(c)** 1 saal.
- **Salah:** **(a)**. Chargeback ki asli samay-seema payment gateway ke niyam se pakki karni hai.
- **Trade-off:**
  - (a) me storage aur delete ka kaam.
  - (b) me baad ka chargeback ya dispute bina saboot.
  - (c) me zyada data zyada der.
- **Kanooni detail jaanchi nahi** (R-004): photo aur location jaise personal data rakhne ka samay.
- **Owner ka jawab (2026-11-19):** **(a)**, misaal 180 din ya maamla band hone tak, kam haathon me. Record: [DECISIONS.md](DECISIONS.md) D-191.

### Q-133. Daawe, return pickup aur pack ki photos aur video kitne din rakhein?

- **Status:** `Tay`. Topic: B14 (security, privacy), B7 (returns).
- **Sawal:** customer ke daawe ki photos aur video (D-106), return pickup ki photo (D-113) aur warehouse pe pack ki photo (D-106) kitne din rakhein, aur kaun dekhe?
- **Kyun zaroori:** inme ghar, chehra ya personal cheezein aa sakti hain; par baad ke jhagde aur seller ke dispute ke liye saboot chahiye.
- **Vikalp:**
  - **(a) Alag samay:** daawe ki photos maamla band hone ke misaal 180 din baad delete, video misaal 90 din; pack ki photo delivered ke misaal 90 din, ya daawa ho to daawe ke saath. Dekhe: us maamle ka Support staff aur warehouse ka jaanch wala staff.
  - **(b)** Sab 90 din.
  - **(c)** Sab 1 saal.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me alag-alag samay ka kaam.
  - (b) me lamba jhagda bina saboot.
  - (c) me zyada storage aur zyada personal data.
- **Kanooni detail jaanchi nahi** (R-004): customer ki photo aur video rakhne ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, alag-alag samay, sirf us maamle ka staff. Record: [DECISIONS.md](DECISIONS.md) D-192.

### Q-134. Seller aur Beauty Pro ke dastavez kitne din rakhein, aur kaun dekhe?

- **Status:** `Tay`. Topic: B14 (security, privacy), B3 (seller).
- **Sawal:** seller ke KYC dastavez (PAN, GSTIN ka certificate, brand authorisation), claims ke saboot (D-100) aur Beauty Pro ke dastavez (D-069) kitne din rakhein, aur kaun dekhe?
- **Kyun zaroori:** ye pehchaan ke dastavez hain; leak ho to pehchaan ki chori. Par jaanch, dobara jaanch aur jhagde ke liye chahiye.
- **Vikalp:**
  - **(a) Kaam tak, phir tay samay:**
    1. Reject hui application ke dastavez 30 din baad delete; sirf faisla aur wajah rahe.
    2. Manzoor seller ke dastavez account chalne tak, aur band hone ke misaal 3 saal baad (kanooni jaanch ke baad number badal sakta hai).
    3. Claims ke saboot unki expiry ke misaal 1 saal baad; Pro ke dastavez darje ki muddat ke misaal 1 saal baad.
    4. Dekhe: sirf jaanch wali team (Seller Ops, catalog ki jaanch, Pro ki jaanch) aur Trust & Safety; seller apne dastavez.
  - **(b)** Sab hamesha.
  - **(c)** Jaanch ke baad turant delete; sirf nateeja, chhupa number aur file ka hash rahe.
- **Salah:** **(a)**. Seller ke liye R1 se, Beauty Pro ke liye R2 se (D-055).
- **Trade-off:**
  - (a) me samay ki settings aur delete ka kaam.
  - (b) me leak ka bada bhandaar.
  - (c) me jhagde ya dobara jaanch pe dastavez nahi.
- **Kanooni detail jaanchi nahi** (R-004): KYC aur tax ke records kitne din rakhne zaroori hain.
- **Owner ka jawab (2026-11-19):** **(a)**, kaam tak, phir tay samay. Record: [DECISIONS.md](DECISIONS.md) D-193.

### Q-135. Audit log, sign-in events aur delete hue account ke records kitne din rakhein?

- **Status:** `Tay`. Topic: B14 (security), B12 (reporting).
- **Sawal:** audit log, sign-in aur security events, aur delete hue account ke bina pehchaan records kitne din rakhein?
- **Kyun zaroori:**
  - Audit hi batata hai kisne kya kiya; jaldi mita to jaanch nahi ho sakti.
  - Par audit ke cluster me bhi jagah 0.5 GB hi hai (R-006), aur IP aur browser ki jaankari bhi personal data hai. D-151 ne records ka samay yahin chhoda hai.
- **Vikalp:**
  - **(a) Alag samay:** audit log misaal 2 saal (paise ke kaamon ka audit kanooni jaanch ke baad lamba ho sakta hai); sign-in aur security events misaal 1 saal; delete hue account ke bina pehchaan records (invoice, ledger) kanooni samay tak; backups me purana data backup ki umar tak.
  - **(b)** Audit aur sign-in events sab 400 din.
  - **(c)** Audit hamesha.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me do alag samay.
  - (b) me saal bhar baad ki jaanch me kami.
  - (c) me jagah aur personal data badhte rehte hain.
- **Kanooni detail jaanchi nahi** (R-004): logs rakhne ka samay (CERT-In ke niyam), aur tax records ka samay.
- **Owner ka jawab (2026-11-19):** **(a)**, audit misaal 2 saal, sign-in events 1 saal. Record: [DECISIONS.md](DECISIONS.md) D-194.

### Q-136. Browser push aur emails me order ki kitni jaankari ho?

- **Status:** `Tay`. Topic: B14 (security, privacy), B11 (notifications).
- **Sawal:** browser push aur emails me order ki kitni jaankari likhi jaaye?
- **Kyun zaroori:**
  - Push lock screen pe koi bhi dekh sakta hai, aur beauty aur personal care ke kuch products niji hote hain.
  - Delivery code (D-072) saboot hai; wo kahin aur leak na ho.
- **Vikalp:**
  - **(a)** Push me sirf order number aur haalat (misaal "Order 1234: out for delivery"); product ka naam, rakam, address aur delivery code push me kabhi nahi. Email me order ki detail (D-126), par poora address sirf invoice me.
  - **(b)** Push me product ka naam bhi.
  - **(c)** Push aur email me poori detail.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me detail ke liye customer ko app kholna padta hai.
  - (b) me niji product lock screen pe.
  - (c) me sabse zyada leak.
- **Owner ka jawab (2026-11-19):** **(a)**, push me sirf order number aur haalat. Record: [DECISIONS.md](DECISIONS.md) D-195.

### Q-137. Backup ki files laptop pe encrypted rahein?

- **Status:** `Tay`. Topic: B14 (security), B15 (backup).
- **Sawal:** backup command (D-013) ki files laptop pe encrypted rahein?
- **Kyun zaroori:** backup me saara data hai (customers, sellers, paisa). D-013 ke 4 pehre git se bachate hain, par laptop chori, malware ya Desktop ke cloud sync se nahi.
- **Vikalp:**
  - **(a) Encrypted:** backup command apni files ek key se encrypt kare (key password manager me, repo me kabhi nahi); restore command key maange; laptop pe misaal sirf aakhri 3 backups, purane apne aap delete.
  - **(b) Bina encryption:** sirf laptop ka disk encryption aur D-013 ke 4 pehre.
  - **(c)** (a), aur ek encrypted copy alag device pe (jaise pen drive).
- **Salah:** **(a)**; (c) agar owner chahe, kyunki laptop kharab ho to backup bhi jaata hai.
- **Trade-off:**
  - (a) aur (c) me key kho jaaye to backup bekaar.
  - (b) me laptop pe khula data.
- **Owner ka jawab (2026-11-19):** **(a)**, backup files encrypted. Record: [DECISIONS.md](DECISIONS.md) D-196.

### Q-138. Secrets (passwords aur keys) kab badle jaayein?

- **Status:** `Tay`. Topic: B14 (security), B15 (operations).
- **Sawal:** secrets (databases ke passwords, payment gateway ki keys, apps se backend ka secret, email ki key, sign-in providers ke secrets, encryption keys) kab badle jaayein?
- **Kyun zaroori:** leak hua secret badalna hi ilaaj hai; par ek insaan ke liye ~20 secrets (11 Vercel projects samet) baar-baar badalna galti ka mauka bhi hai.
- **Vikalp:**
  - **(a)** Shak ya incident pe turant, tay kram se; baaki saal me ek baar sab; token sign karne wali keys apne aap (misaal har 30 din); asli business pe kisi staff ke jaane pe turant.
  - **(b)** Har 90 din sab.
  - **(c)** Sirf incident pe.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me secret saal bhar purana reh sakta hai.
  - (b) me bahut kaam aur galti ka mauka.
  - (c) me chupchaap leak kabhi theek nahi hota.
- **Owner ka jawab (2026-11-19):** **(a)**, shak pe turant, baaki saal me ek baar. Record: [DECISIONS.md](DECISIONS.md) D-197.

### Q-139. Personal data ka leak ho to users ko kab aur kaise bataya jaaye?

- **Status:** `Tay`. Topic: B14 (security, incident response).
- **Sawal:** personal data ka leak pakka ho to users ko kab aur kaise bataya jaaye?
- **Kyun zaroori:** registrations dummy hain, par system me asli personal data (owner aur testers ka) hai, aur design asli business jaisa (D-026).
- **Vikalp:**
  - **(a)** Leak pakka hone pe asar wale users ko email aur in-app, misaal 72 ghante ke andar: kya hua, kaunsa data, unhe kya karna hai; site pe ek patti; aur jo sarkari report kanooni jaanch bataye.
  - **(b)** Sirf gambhir leak (password, paisa, dastavez) pe khabar.
  - **(c)** Koi khabar nahi (demo hai).
- **Salah:** **(a)**; R1 me iska likha hua kram (runbook).
- **Trade-off:**
  - (a) me emails ki chhat (D-142) me jagah chahiye.
  - (b) me chhota leak chhup jaata hai.
  - (c) asli business ke liye galat aadat.
- **Kanooni detail jaanchi nahi** (R-004): data leak pe users aur sarkari sanstha ko suchna ka samay aur tareeka.
- **Owner ka jawab (2026-11-19):** **(a)**, users ko email aur in-app, R1 me likha hua kram. Record: [DECISIONS.md](DECISIONS.md) D-198.

### Q-140. Staff accounts pe password ke saath doosra factor kaunsa ho?

- **Status:** `Tay`. Topic: B14 (security). Group G15.
- **Sawal:** staff accounts (staff ke 7 apps) pe password ke saath doosra factor kaunsa ho?
- **Kyun zaroori:**
  - Owner ke ~80 accounts (D-017) me se zyadatar pe doosra factor lagega.
  - Domain nahi (D-028), to milte-julte naam ka nakli sign-in page banana aasaan hai. Authenticator ka code nakli page pe bhi daala ja sakta hai; passkey sirf asli site pe chalti hai.
- **Vikalp:**
  - **(a)** R1 me authenticator app (6 digit code) har staff account pe; passkey R2 me ek aur raasta.
  - **(b)** R1 se passkey (phone ya laptop ka fingerprint ya PIN, ya password manager) pehla raasta, authenticator backup.
  - **(c)** Hamesha sirf authenticator.
- **Salah:** **(a)**: R1 me kaam kam, R2 me passkey. Asli business pe Master aur Finance pe passkey zaroori karna owner tab tay kare.
- **Trade-off:**
  - (a) me authenticator app me 50 se zyada entries, aur phishing ka jokhim. Authenticator ke secrets usi password manager me hon jisme passwords, to dono factor ek jaise ho jaate hain.
  - (b) phishing se bachav, par har app ka alag host hai (D-048), to har account ki passkey uske app ke host pe banti hai: banane ka kaam zyada.
  - (c) me phishing ka jokhim hamesha.
- **Owner ka jawab (2026-11-19):** **(a)**, R1 me authenticator, passkey R2 me. Record: [DECISIONS.md](DECISIONS.md) D-199.

### Q-141. Staff ka authenticator kho jaaye to account kaise wapas mile?

- **Status:** `Tay`. Topic: B14 (security). Group G15.
- **Sawal:** staff ka (aur Master ka) authenticator kho jaaye to reset ka raasta kya ho?
- **Kyun zaroori:**
  - Owner akela hai; phone kho jaaye to bahut se accounts ek saath band ho jaate hain.
  - Reset ka raasta hi account par kabze ka sabse aasaan raasta hota hai.
- **Vikalp:**
  - **(a) Recovery codes, phir Master, phir laptop:**
    1. Pehle recovery codes (10, har code ek baar).
    2. Staff account ka reset Master account kare: dobara authenticator code, audit, us account ke saare sessions band, aur user ko email.
    3. Master ka apna reset sirf recovery codes se; wo bhi na hon to owner ke laptop se ek "break-glass" command jo seedha database pe reset kare aur audit me likhe.
  - **(b)** Ek alag security role kisi ka bhi reset kare, Master ka bhi.
  - **(c)** Email code se reset.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me recovery codes sambhalne padte hain, aur break-glass command ke liye production database ki pahunch laptop pe chahiye (backup command ke liye pehle se, D-013).
  - (b) me ek role ke paas sabki chaabi.
  - (c) me inbox hi authenticator ban jaata hai: doosre factor ka matlab khatam.
- **Owner ka jawab (2026-11-19):** **(a)**, recovery codes, phir Master, phir laptop. Record: [DECISIONS.md](DECISIONS.md) D-200.

### Q-142. Staff ko customer ka naam, email, phone aur address kitna dikhe?

- **Status:** `Tay`. Topic: B14 (privacy), B2 (roles). Group G16.
- **Sawal:** Support, warehouse, hub aur delivery partner ko customer ka naam, email, phone aur address kitna dikhe?
- **Kyun zaroori:** sellers ke liye D-143 tay hai, par staff ke liye nahi. Staff ki lists se customers ka data bahar jaana sabse aasaan raasta hai.
- **Vikalp:**
  - **(a) Lists me chhupa:**
    1. Lists me naam ka pehla hissa aur shehar, aadha email, phone ke aakhri 4 ank.
    2. Poori jaankari sirf maamla kholne pe, wajah chun ke; har baar dekhna audit me.
    3. Delivery partner ko sirf apne active parcel ka naam, address aur phone; delivered ke misaal 24 ghante baad chhupa.
    4. Warehouse aur hub ko sirf order number aur label.
  - **(b)** Support ko hamesha poori; baaki ko chhupi.
  - **(c)** Jise kaam ho use poori.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me support ko ek click zyada, aur audit ka kaam.
  - (b) me support ki list se poora data bahar ja sakta hai.
  - (c) sabse aasaan, par sabse zyada leak.
- **Kanooni detail jaanchi nahi** (R-004): staff ke paas personal data ki pahunch ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, lists me chhupa, poori sirf maamla kholne pe. Record: [DECISIONS.md](DECISIONS.md) D-201.

### Q-143. Support customer ka account usi ki nazar se dekh sake?

- **Status:** `Tay`. Topic: B14 (privacy), B11 (support). Group G16.
- **Sawal:** support staff customer ka account usi ki nazar se dekh sake, ya uske naam se kaam kar sake?
- **Kyun zaroori:** shikayat samajhne ke liye ye aasaan lagta hai, par isse staff ke haq aur chhupi jaankari (Q-142) dono ka bypass ho jaata hai.
- **Vikalp:**
  - **(a) Kabhi nahi:** support ki apni screens (order, return aur refund ki haalat) jo customer jaisa dikhayein.
  - **(b) Sirf dekhna:** "customer ki nazar" mode, wajah ke saath, audit me, aur customer ko khabar.
  - **(c)** Customer ban ke poora kaam.
- **Salah:** **(a)**, Support Desk ke R1 wale patle hisse (D-105) me.
- **Trade-off:**
  - (a) me support ki screens banane ka kaam.
  - (b) me sirf dekhne me bhi poora data.
  - (c) sabse bada jokhim.
- **Owner ka jawab (2026-11-19):** **(a)**, kabhi nahi, support ki apni screens. Record: [DECISIONS.md](DECISIONS.md) D-202.

### Q-144. Ek insaan ke kai accounts per-customer seemaayein reset na karein, iske liye kya gina jaaye?

- **Status:** `Tay`. Topic: B14 (abuse), B5 (checkout). Group G17.
- **Sawal:** per-customer seemaayein (naye customer ke pehle order ki delivery pe UPI ki seema D-109, baar-baar return D-116, reviews D-156, referral D-176) ek insaan ke kai accounts se reset na hon, iske liye kya gina jaaye?
- **Kyun zaroori:** email ka `+` alias alag account maana jaata hai (D-017; owner ke accounts isi pe hain). Isse ek insaan naye alias se naya account bana ke har per-customer seema dobara shuru kar sakta hai.
- **Vikalp:**
  - **(a) Account alag, seemaon ke liye jod:**
    1. Account alag hi rahein (D-017).
    2. Seemaon ki ginti me ek "jod" bhi: wahi address (ek roop me karke), wahi payment ki pehchaan (gateway de to), aur wahi browser ki device cookie.
    3. Email ka bina `+` wala roop sirf ek ishara, faisla nahi.
    4. Jod pe apne aap rok sirf tay seemaon (jaise D-109) pe; baaki staff ki review queue me.
  - **(b) Email ka ek roop:** seemaon ki ginti ke liye email ka bina `+` (aur Gmail me bina dots) wala roop ek insaan; account phir bhi alag.
  - **(c) Koi jod nahi:** har account alag.
- **Salah:** **(a)**: R1 me D-109 wala jod, baaki seemaon ke saath R2 se.
- **Trade-off:**
  - (a) me jod ka kaam, aur jod ka data bhi personal data hai. Owner ke apne customer aliases ek hi address pe hon to unki "pehle order" wali seema saath lagegi: testing me dhyaan.
  - (b) me owner ke saare customer aliases ek insaan gine jaayenge.
  - (c) me har per-customer seema bekaar.
- **Kanooni detail jaanchi nahi** (R-004): device ki pehchaan aur accounts ka jod rakhne ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, account alag, seemaon ke liye jod. Record: [DECISIONS.md](DECISIONS.md) D-203.

### Q-145. Ek customer ke ek waqt me kitne delivery-pe-UPI orders khule ho sakein?

- **Status:** `Tay`. Topic: B14 (abuse), B5 (checkout). Group G17.
- **Sawal:** ek customer ke ek waqt me kitne aise orders khule ho sakte hain jinka payment delivery pe hai?
- **Kyun zaroori:** delivery pe UPI wale order me stock delivery tak ruka rehta hai (D-118). Bina payment kai orders se stock roka ja sakta hai; D-109 sirf rakam aur mana karne ki ginti dekhta hai.
- **Vikalp:**
  - **(a)** Ek customer ke (Q-144 ke "ek customer" ke hisaab se) ek waqt me misaal 2 khule orders, aur unki kul rakam D-109 ki seema tak.
  - **(b)** Ek waqt me 1 khula order.
  - **(c)** Koi alag seema nahi.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me kabhi asli customer ka teesra order prepaid hi.
  - (b) aur kada.
  - (c) me stock rokne ka raasta khula.
- **Owner ka jawab (2026-11-19):** **(a)**, ek waqt me misaal 2 khule orders. Record: [DECISIONS.md](DECISIONS.md) D-204.

### Q-146. Support goodwill coupon kitni rakam tak aur kitni baar de sake?

- **Status:** `Tay`. Topic: B14 (security), B11 (support), B4 (promotions).
- **Sawal:** support goodwill ka coupon (D-177, R2 se) kitni rakam tak aur ek customer ko kitni baar de sake?
- **Kyun zaroori:** coupon paise jaisa hai; bina seema ke chori hua account ya mili-bhagat yahin nuksaan karti hai. Refund aur daawe ki seema D-188 me tay hai; coupon ki nahi.
- **Vikalp:**
  - **(a) Seedhi ke saath seema (numbers misaal):** Support Agent ek coupon ₹200 tak, ek customer ko saal me 2 tak; Support Lead ₹1,000 tak; usse upar Head of Operations (D-044); platform ka mahine ka kul goodwill budget ₹10,000.
  - **(b) Koi seema nahi:** sirf audit.
  - **(c)** Sirf Support Lead de.
- **Salah:** **(a)**, D-188 jaisa dhaancha.
- **Trade-off:**
  - (a) me seema aur budget ki settings ka kaam.
  - (b) me bada nuksaan ho sakta hai.
  - (c) me chhote goodwill pe bhi Support Lead.
- **Owner ka jawab (2026-11-19):** **(a)**, seedhi ke saath seema aur mahine ka budget. Record: [DECISIONS.md](DECISIONS.md) D-205.

### Q-147. Bina sign-in wale forms pe bots aur spam kaise rokein?

- **Status:** `Tay`. Topic: B14 (abuse), B11 (support).
- **Sawal:** "Contact us" (D-161) aur grievance (D-163) jaise bina sign-in wale forms pe bots aur spam kaise roke jaayein?
- **Kyun zaroori:**
  - Har form email kha sakta hai (D-142).
  - Form me koi bhi kisi aur ka (allowlist wala) email likh sakta hai.
- **Vikalp:**
  - **(a) Bina CAPTCHA:** pehle form me diye email pe code se pakka karna, ek chhupa "honeypot" field, aur IP aur email pe rate limit.
  - **(b) CAPTCHA:** ek free CAPTCHA service; bahar ki script sirf in forms pe.
  - **(c)** Dono.
- **Salah:** **(a)** jab tak allowlist (D-133) hai; asli business pe dobara dekhna. R2 se (grievance ka page R1 me sirf jaankari, D-163).
- **Trade-off:**
  - (a) me code ka email budget lagta hai.
  - (b) me bahar ki script aur visitors ka data bahar jaata hai (D-157 ki soch se alag).
  - (c) me dono ka kaam.
- **Owner ka jawab (2026-11-19):** **(a)**, bina CAPTCHA: email code, honeypot aur rate limit. Record: [DECISIONS.md](DECISIONS.md) D-206.

### Q-148. Sehat se jude data ko kaun dekh sake?

- **Status:** `Tay`. Topic: B14 (privacy), B11 (consultation). Group G18.
- **Sawal:** consultation notes (D-025), skin reaction ka case (D-130) aur allergy wali beauty profile (D-165) kaun dekh sake?
- **Kyun zaroori:** ye sehat ke paas ka data hai: privacy ka sabse gambhir hissa. Consultation notes "sirf zaroori roles" dekhein, par kaunse, ye tay nahi.
- **Vikalp:**
  - **(a) Maamle ke hisaab se:**
    1. Consultation notes: sirf wo Skin & Hair Expert jisne consult kiya ya jise maamla diya gaya; Support Lead sirf maamla khulne pe, wajah ke saath, audit me; customer apne notes dekhe.
    2. Skin reaction case: Support Lead aur Skin & Hair Expert; brand ko sirf batch aur bina pehchaan ka saar (D-130).
    3. Allergy profile: sirf customer (D-165); staff tabhi jab customer khud support me bataye.
  - **(b)** Saare Experts aur saare Support roles.
  - **(c)** Sirf Expert; Support kabhi nahi.
- **Salah:** **(a)**. R2 se (D-055).
- **Trade-off:**
  - (a) me maamle ke hisaab se pahunch ka kaam.
  - (b) me bahut haathon me sehat ka data.
  - (c) me customer ki shikayat pe Support kuch dekh nahi sakta.
- **Kanooni detail jaanchi nahi** (R-004): sehat ke data ki consent aur pahunch ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, maamle ke hisaab se pahunch. Record: [DECISIONS.md](DECISIONS.md) D-207.

### Q-149. Sehat se jude data kitne din rakhein?

- **Status:** `Tay`. Topic: B14 (privacy), B11 (consultation). Group G18.
- **Sawal:** consultation notes, skin reaction ke case aur allergy profile kitne din rakhein?
- **Kyun zaroori:** jitna lamba, utna bada jokhim; par batch ki dikkat aur recall (D-129) ka itihaas bhi chahiye.
- **Vikalp:**
  - **(a) Alag samay (numbers misaal):** consultation notes aakhri consult ke 2 saal baad delete; skin reaction case band hone ke 3 saal baad (batch aur recall ka itihaas); allergy profile jab tak customer na mitaye, aur account delete pe turant.
  - **(b)** Sab 1 saal.
  - **(c)** Sab account delete tak.
- **Salah:** **(a)**. R2 se.
- **Trade-off:**
  - (a) me alag-alag samay ka kaam.
  - (b) me batch ka itihaas kho sakta hai.
  - (c) me bina zaroorat lamba data.
- **Kanooni detail jaanchi nahi** (R-004): cosmetics ke side-effect ke records aur sehat ke data rakhne ka samay.
- **Owner ka jawab (2026-11-19):** **(a)**, alag-alag samay. Record: [DECISIONS.md](DECISIONS.md) D-208.

### Q-150. Security report ke niyam, threats aur risks naye docs me kis tareeke se aayein?

- **Status:** `Tay`. Topic: B14 (security), B16 (docs).
- **Sawal:** Security Architect ki report me 86 prastaavit niyam, 89 threats, 14 risks aur tay faislon pe 26 dhyaan ke points hain. Ye [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md), [security/THREAT_MODEL.md](security/THREAT_MODEL.md) aur [RISKS.md](RISKS.md) me, owner ki haan se, kis tareeke se aayein?
- **Kyun zaroori:**
  - Naye docs me cheez sirf owner ki haan se aati hai; par 86 niyam ek-ek karke poochhna bahut lamba hai.
  - Kai niyam ab D-180 se D-208 se badalte ya judte hain; report ke numbers (misaal) faislon se milaane hain.
  - Architecture, database, DevOps aur QA ke kaam ko security ka ek tay aadhaar chahiye; QA ke tests inhi niyamon se bante hain.
- **Vikalp:**
  - **(a) Area ke hisaab se batches:**
    1. Claude har area (edge aur hosting, sign-in, sessions, authorization aur sellers ki deewar, checkout aur paisa, files aur personal data, data stores aur services, export, audit, logs aur DevOps, R2 ke hisse) ke niyam tay faislon se mila ke SR-002 se aage, us area ke threats aur risks ke saath, ek sawal me rakhe.
    2. Owner har batch pe haan ya badlav de; haan ke baad hi docs me.
    3. Tay faislon pe dhyaan ke points apne area ke batch me; jo pehle se kisi faisle me sambhal gaye, unka sirf hawala.
    4. Report ki "sirf jaanch" wali technical cheezein Claude khud saboot ke saath jaanche ([RISKS.md](RISKS.md) §2 jaisa); kanooni wali kanooni jaanch (R-004) ke liye.
  - **(b) Ek badi batch:** saare niyam, threats aur risks ek saath; owner ek baar me haan ya badlav.
  - **(c) Ek-ek karke:** har niyam ek alag sawal.
  - **(d) Pehle se haan:** Claude tay faislon se mila ke sab seedha docs me likhe; owner baad me padh ke badlav bataye.
- **Salah:** **(a)**: lagbhag 9 batches, har ek itni chhoti ki padhi ja sake, aur har niyam faislon se mila hua.
- **Trade-off:**
  - (a) me lagbhag 9 baar ka kaam.
  - (b) me bahut lambi list: padhna mushkil, galti chhoot sakti hai.
  - (c) bahut lamba.
  - (d) tez, par owner ki haan pehle na hone se galat niyam docs me aa sakta hai, aur padhne ka bojh baad me.
- **Owner ka jawab (2026-11-19):** **(a)**, area ke hisaab se batches. Record: [DECISIONS.md](DECISIONS.md) D-209.

### Q-151. Security batch 1: edge aur hosting ke niyam, threats aur risks maanein?

- **Status:** `Tay`. Topic: B14 (security), B15 (hosting).
- **Sawal:** apps se backend tak ka raasta (Vercel apps, Render ka gateway), headers, cache, resource ki seemaayein, rate limits, kill switches aur install hone wale apps ke neeche ke niyam, threats aur risks naye security docs me aayein?
- **Kyun zaroori:**
  - Saare apps `/api/*` ko Render ke gateway pe bhejte hain (D-052), aur backend ka URL public hai. Saara backend ek 512 MB process me hai (D-049, D-056), aur domain nahi (D-028). Har request ka pehla pehra yahi hai.
  - Sign-in ki rok (D-182), codes ki seema (D-187) aur dobara code (D-185) asli client IP, rate limit aur kill switch pe hi tikte hain.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-002, backend ka seedha raasta band:** gateway `/api/*` ki request tabhi maane jab usme app ke raaste se juda secret header ho (constant-time milaan; badalte waqt purani aur nayi dono values chalein); bina header 403. Sirf tay routes (payment webhook, health, jagane wala) bina secret ke, apni jaanch ke saath (jaise webhook signature). Saare 11 apps ki rewrite aur headers ki config ek hi template se. Kahan se: ASVS Configuration. Test: bina ya galat header 403; webhook bina signature 401; har app ke host se 200; ek test har app ki config jaanche.
  2. **SR-003, asli client IP ek helper se:** forwarded headers sirf tab maane jab secret header sahi ho, warna connection ka IP; IPv6 /64 ke hisaab se gina jaaye. Rate limits, sessions aur audit sab isi helper se. Kahan se: ASVS Business Logic, Logging. Test: jhootha `X-Forwarded-For` bhejne se IP na badle.
  3. **SR-004, personal jawab cache nahi:** har signed-in ya personal jawab pe `Cache-Control: private, no-store`. Public cache sirf tay public GET routes pe, aur unpe kabhi `Set-Cookie` nahi. Personal hisse (Pro daam, wishlist ka nishaan) alag private endpoint se. Kahan se: ASVS Data Protection. Test: har non-public route ka header (contract test); public route pe cookie bhejne se jawab na badle.
  4. **SR-005, security headers har app ke har route pe:** CSP (`default-src 'self'`, scripts sirf apni aur hash ya nonce se, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` (private media wale pages pe `no-referrer`), HSTS, aur `Permissions-Policy` jo SR-001 ki cheezon ke alawa sab band rakhe. Kahan se: ASVS Configuration. Test: E2E me har app ke headers; page iframe me na khule; inline script na chale.
  5. **SR-006, bahar ki script nahi:** kisi page pe bahar ki koi script nahi; sirf payment wale page pe payment gateway ki checkout script, aur sirf usi page ki CSP me uska host. Kahan se: ASVS Configuration, Malicious Code. Test: checkout ke alawa har page ki CSP me gateway ka host nahi.
  6. **SR-007, resource ki seemaayein:** JSON body 100 KB (files seedha storage pe, backend se nahi); list ka page 100 tak; har MongoDB query pe 2 second ki time limit aur PostgreSQL pe statement timeout; search ka text 100 characters; password hash ek waqt me 2, baaki line me (line bhari to 503); request 30 second. Health aur jagane wale endpoints na version batayein, na database tak jaayein. Kahan se: ASVS Business Logic, API. Test: bada body 413; dheemi query time-out; 20 sign-in ek saath pe memory theek; health ka jawab sirf "ok".
  7. **SR-008, rate limits IP aur account dono pe:** sign-in, codes, payment shuru, review, report aur daawa "fail-closed" (Redis na mile to 503); padhne wale routes "fail-open" (process ki apni chhoti seema ke saath); 429 pe `Retry-After` aur saaf sandesh. Seemaayein (misaal): password se sign-in ek IP se 10 minute me 20 (account ki rok D-182); code maangna D-187 aur ek IP se 10 minute me 5; ek code pe 5 koshish; bina payment "place order" ek account ghante me 5; review din me 5, report din me 10; daawa ya return din me 3; uploads din me 30 files ya 100 MB; bina sign-in search ek IP minute me 60; baaki likhne wale kaam ek account minute me 60; delivery code ek parcel pe 5 galat; export ghante me 5. Kahan se: ASVS Business Logic. Test: har seema ke ek upar 429; Redis band pe sign-in 503, product page 200.
  8. **SR-009, kill switches bina deploy:** naye sign-up band; customer sign-in band; checkout band; uploads band; payouts pe rok; "sab sessions band". Har switch sirf Master ka, dobara code (D-185) ke saath, audit me, aur app me saaf sandesh. Kahan se: ASVS Architecture. Test: har switch se flow band; "sab sessions band" ke baad har session 401.
  9. **SR-010, install hone wale apps ka cache:** har install hone wale app (D-042) ka service worker `/api/*` ko kabhi cache na kare aur `index.html` se jawab na de; signed-in pages aur API ke jawab cache me nahi; sirf Delivery app ka offline hissa tay data rakhe; sign-out pe app ke caches aur offline data saaf. Kahan se: ASVS Data Protection. Test: service worker ke baad `/api` network se; sign-out ke baad Cache Storage aur IndexedDB khaali.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Edge aur hosting" ka hissa):
  1. Backend ka public URL seedha bula ke app ka raasta aur headers chhodna, ya jhootha client IP bhejna (Spoofing, Tampering): SR-002, SR-003.
  2. Galat client IP: sab users ek IP pe gine jaayein, rate limit sab ko roke, audit me galat IP (DoS, Repudiation): SR-003, SR-008.
  3. CDN kisi signed-in ya personal jawab (Pro daam, cart, address) ko cache karke doosre user ko de de (Information disclosure): SR-004.
  4. Headers ke bina XSS ka bada asar, ya sign-in aur bade buttons iframe me (clickjacking) (Tampering, Elevation): SR-005.
  5. Payment page pe bahar ki script badle to payment ke details chhin sakte hain (Information disclosure, Tampering): SR-006.
  6. Ek process me saara backend: bada body, mehnga search, password hash ki baadh ya bada export se sab gire (DoS): SR-007, SR-008, SR-009.
  7. Service worker `/api/*` ya personal pages cache kare (Information disclosure, DoS): SR-010.
- **Risks** ([RISKS.md](RISKS.md) me, tag `Security`; haan ka matlab owner ne `Maana`):
  1. **R-015:** koi alag WAF ya DDoS ki suraksha nahi; ek process gire to sab band (R-002, R-007 se juda). Kam karne ka tareeka: SR-007, SR-008, SR-009, aur providers ki apni suraksha.
  2. **R-016:** payment page pe gateway ki bahar ki script; uski suraksha hamare haath me nahi. Kam karne ka tareeka: SR-006.
- **Tathya ki jaanch (Claude, owner ka faisla nahi; §2):** Vercel ke rewrite se backend tak secret header kaise jude, aur Vercel aur Render asli client IP kis header me dete hain. SR-002 aur SR-003 ka tareeka isi pe tika hai.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-015 aur R-016 `Maana`.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me kuch numbers baad me asli naap ke baad badlenge (settings me hain, to bina deploy).
  - (b) me har badlav ki ek line.
  - (c) me aage ka design bina edge ke pehre ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-015 aur R-016 `Maana`. Record: [DECISIONS.md](DECISIONS.md) D-210.

### Q-152. Security batch 2: sign-in ke niyam, threats aur risks maanein?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** customer, staff, seller aur delivery partner ke sign-in (password, email code, social, authenticator, recovery, invites, allowlist) ke neeche ke niyam, threats aur risks naye security docs me aayein?
- **Kyun zaroori:**
  - Sign-in ke faisle tay hain (D-021, D-133, D-182 se D-187, D-199, D-200); ye niyam unhe jaanchne layak roop dete hain. D-021 ka "authenticator laga ho to email code ke baad bhi" yahin pakka hota hai (SR-015).
  - Domain nahi (D-028), to nakli sign-in page sabse aasaan hamla hai.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-011, staff ka doosra factor:** staff ke 7 apps me har sign-in pe authenticator code (D-199); ek code ek hi baar chale, aur chhoti samay-khidki (misaal ek step aage ya peeche). Kahan se: ASVS Authentication. Test: bina code sign-in mana; wahi code dobara mana; galat codes pe rate limit.
  2. **SR-012, apps ke asli pate aur emails ke links:** har app ka ek tay URL ek jagah likha ho (operations ke doc aur Master app me). Staff ke emails me sign-in ka koi link nahi, sirf "app kholein". Customer aur seller ke emails me link sirf apne app ke host pe; email provider ki link tracking band. Kahan se: ASVS Authentication. Test: templates ka test: links sirf apne hosts pe; staff templates me link nahi.
  3. **SR-013, password:** kam se kam 12, zyada se zyada 128 characters, koi "ek capital, ek number" jaisa niyam nahi. Leak hue passwords ki jaanch ek free k-anonymity wali API se; API na mile to password maan lo par account pe nishaan, aur agle sign-in pe dobara jaanch. Hash argon2id se (misaal m=19 MiB, t=2, p=1). Kahan se: ASVS Authentication. Test: 11 characters mana; leak wala password mana; API band pe nishaan aur agle sign-in pe jaanch.
  4. **SR-014, rok aur alert:** galat password ya code pe rok D-182 ke hisaab se. Ek IP se kai accounts pe fail, ya ek account pe kai IPs se fail, to owner ko security alert. Kahan se: ASVS Authentication. Test: seema ke upar rok; doosre IP se sahi password chale; alert bane.
  5. **SR-015, customer ka email code:** 6 ank, cryptographically secure random se; sirf hash rakha jaaye; misaal 10 minute; ek code pe 5 koshish; 3 baar dobara bhejna; ek baar istemaal; us sign-in koshish aur us app se bandha. Account pe authenticator ho to code ke baad bhi authenticator (D-021). Email code se sign-in sirf customer app me. Email me maangne ka samay aur browser, aur "ye code kisi ko mat batao". Kahan se: ASVS Authentication. Test: 6th galat koshish pe code band; 11 minute baad mana; doosre browser me mana; authenticator wale account pe code ke baad bhi authenticator; staff apps me ye raasta hi nahi.
  6. **SR-016, security badlav pe dobara pehchaan:** password badalna, email badalna, authenticator band karna, naye recovery codes, account delete: inse pehle dobara pehchaan (password ya code, aur authenticator ho to wo bhi). Email badle to naye email pe code aur purane pe khabar. Password reset ke baad baaki saare sessions band. Kahan se: ASVS Authentication, Session Management. Test: bina dobara pehchaan badlav mana; purane email pe khabar; reset ke baad doosra device 401.
  7. **SR-017, social sign-in (Google, LinkedIn, GitHub, D-021):** `state` aur PKCE (S256); jahan provider OIDC de wahan `nonce`; har app ka exact redirect URI; sirf provider ka verified email maana jaaye (GitHub jaise provider pe verified email uski API se). Maujooda account se jodna tabhi jab email allowlist pe ho aur provider use verified kahe; warna pehle maujooda tareeke se sign-in. Band account pe social sign-in bhi band. Aakhri sign-in tareeka hatana mana. Kahan se: ASVS Authentication, Session Management. Test: badla `state` aur bina PKCE mana; unverified email pe jod nahi; allowlist ke bahar sign-up nahi.
  8. **SR-018, allowlist ek hi jaanch se (D-133):** identity me ek hi function, har raaste pe: password sign-up aur sign-in, social ka pehla sign-in, email code, invite accept, seller, partner aur creator sign-up, waitlist, bina sign-in forms. Allowlist se email hate to uske saare sessions band. Allowlist badalna sirf Master, dobara code (D-185) ke saath, audit me. Kahan se: ASVS Access Control. Test: har raaste ka test allowlist ke bahar wale email se; hatane ke baad agli call 401.
  9. **SR-019, kaunsa email registered hai, pata na chale:** sign-in, sign-up, password reset aur code maangne ka jawab registered aur anjaan email pe ek jaisa, aur kam se kam ek tay samay (misaal 400 ms) ke baad. Anjaan email pe koi email nahi. D-133 ka "demo store" sandesh sirf allowlist ke bahar walon ko. Kahan se: ASVS Authentication. Test: do emails pe jawab ka body aur samay milao.
  10. **SR-020, code wale emails ki seema (D-187):** D-142 ki OTP line ke andar; seema pe app turant saaf sandesh de (code chupchaap na ruke); sign-up ke codes ki seema khatam ho to bhi password reset aur security ke codes jaayein. Kahan se: ASVS Business Logic. Test: seema ke upar sandesh; sign-up ki seema ke baad bhi reset ka code jaaye.
  11. **SR-021, sign-in ke baad redirect:** `next` jaisa parameter sirf apne app ka relative path ho (`/` se shuru, `//` ya `\` se nahi; normalise karke dobara jaancha); warna home page. Kahan se: ASVS Validation. Test: `//evil.example`, `/\evil.example` aur encoded dot-segments sab home pe.
  12. **SR-022, recovery codes aur reset (D-200):** authenticator lagate waqt 10 recovery codes (hash, har code ek baar). Reset ya naye codes pe us account ke saare sessions band, security email, aur owner ko alert. Kahan se: ASVS Authentication. Test: recovery code dobara mana; reset ke baad sessions 401; D-200 ke bahar wala role reset kare to 403.
  13. **SR-023, Delivery app (D-183):** offline me sirf us shift ke assigned parcels ka kam se kam data (naam, address, phone, kaam). Delivered ya cancel hote hi us parcel ka data phone se hate; shift khatam ya sign-out pe sab saaf. Hub Manager ek click se partner ka session band kare. Kahan se: ASVS Data Protection, Session Management. Test: delivered ke baad IndexedDB me parcel nahi; Hub Manager ke band karne ke baad agla sync 401.
  14. **SR-024, seller ke andar haq (D-184):** seller ke andar alag permissions: daam, listing content, maal bhejna, stock dekhna, payout aur bank, seller ke staff manage karna. Seller staff ke roles sirf Account Owner de. Kahan se: ASVS Access Control. Test: listing wale user se daam badlana 403; bina authenticator ke bank badlana mana.
  15. **SR-025, invites aur pehla account:** invite ek baar ka, misaal 72 ghante, us email aur us app se bandha, allowlist ke andar; sirf appoint karne ke haq wala bheje; staff ko accept pe authenticator lagana zaroori. Koi default account ya password nahi; pehla Master sirf owner ke machine se ek baar ki command se, audit me. Kahan se: ASVS Authentication, Access Control. Test: invite dobara, expiry ke baad ya doosre email se: sab mana; naye install me bina command koi staff sign-in nahi.
  16. **SR-026, bade kaamon pe dobara code (D-185):** D-185 ki list ke har kaam pe misaal 5 minute ke andar ka authenticator code; authenticator band karna aur naye recovery codes har baar apna alag code maangein. Kahan se: ASVS Authentication, Access Control. Test: list ke har kaam pe bina code 403; khidki ke baad dobara code.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Sign-in" ka hissa):
  1. Milte-julte naam ka nakli sign-in page: staff ka password aur authenticator code, ya customer ka code (Spoofing): SR-011, SR-012; R-017.
  2. Leak hue passwords se credential stuffing aur password spraying (Spoofing): SR-013, SR-014, SR-008.
  3. Email code ka andaaza ya ek code ka dobara istemaal (Spoofing): SR-015.
  4. Code ka phishing ("code bata do"), ya customer ka inbox hi hamlavar ke paas (Spoofing): SR-015, SR-016; R-018.
  5. Social sign-in se kabza: bina verified email ka jod, login CSRF, redirect URI se khel (Spoofing, Elevation): SR-017.
  6. Allowlist ka koi ek raasta khula reh jaaye (Elevation): SR-018.
  7. Sign-up, sign-in ya reset ke jawab ya samay se pata chale kaunsa email registered hai (Information disclosure): SR-019.
  8. Code wale emails ki baadh: OTP ki din ki jagah khatam, ya kisi ke inbox pe emails ki baadh (DoS): SR-020, SR-008.
  9. Sign-in ke baad bahar ki site pe redirect (Spoofing): SR-021.
  10. Authenticator reset ya recovery ke raaste se kabza, ya owner phone khone pe bahar (Spoofing, DoS): SR-022.
  11. Jaan-boojh ke galat password se owner ke staff accounts band karna (DoS): SR-014.
  12. Delivery partner ka phone kho jaaye: chalta session aur offline data (Information disclosure, Spoofing): SR-023, SR-010.
  13. Seller ka bina authenticator wala user daam, maal ya payout badle (Tampering, Elevation): SR-024, SR-026.
  14. Invite link kisi aur ke haath, default account, ya pehla Master banane ka khula raasta (Spoofing, Elevation): SR-025.
  15. Khula chhoda session ya chori hui cookie se bade kaam (Elevation): SR-026.
- **Risks** ([RISKS.md](RISKS.md) me, tag `Security`; haan ka matlab owner ne `Maana`):
  1. **R-017:** domain nahi (D-028): milte-julte naam ke nakli sign-in pages aur hamare naam se nakli emails; staff aur customer pehchaan nahi paate. Kam karne ka tareeka: SR-011, SR-012, R2 me passkey (D-199), aur emails me "hum kabhi password ya code nahi maangte".
  2. **R-018:** customer ka account utna hi surakshit jitna uska email inbox (email code, D-021). Kam karne ka tareeka: SR-015, SR-016, aur optional authenticator.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-017 aur R-018 `Maana`.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me sign-in ke kaam ka hissa bada (invites, recovery, social ke niyam), par sab R1 ke tay faislon ke andar.
  - (b) me har badlav ki ek line.
  - (c) me sign-in ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-017 aur R-018 `Maana`. Record: [DECISIONS.md](DECISIONS.md) D-211.

### Q-153. Security batch 3: sessions aur tokens ke niyam, threats aur risk ka jod maanein?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** sign-in ke baad ke session (cookies, tokens, unki umar, band karna, CSRF, signing keys) ke neeche ke niyam, threats aur R-010 me jod naye docs me aayein?
- **Kyun zaroori:**
  - Sessions ki umar tay hai (D-180, D-181), aur har app ki apni cookies (D-186). Ye niyam batate hain ki session kaise bane, badle aur band ho.
  - Apps `*.vercel.app` jaise saajhe hosts pe hain (D-048, domain nahi), to cookies sirf apne host ki honi chahiye.
  - Redis restart pe data jaata hai (R-010); band hua session phir chal na pade.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-027, cookies:** session ki cookies sirf apne host ki (koi `Domain` attribute nahi), `HttpOnly`, `Secure`. Access cookie `__Host-` prefix aur `SameSite=Lax` ke saath. Refresh cookie `__Secure-` prefix, `SameSite=Strict`, aur sirf sign-in wale API path pe (`__Host-` me path `/` hi ho sakta hai, isliye refresh pe `__Secure-`). Koi token ya user ka data browser storage me nahi; wahan sirf theme jaisi pasand. Kahan se: ASVS Session Management. Test: Set-Cookie ke flags; localStorage aur sessionStorage me user ka data nahi.
  2. **SR-028, token ki umar aur badalna:** access token chhota (misaal 10 minute). Refresh token har istemaal pe badle; ek "family" ke saath purane token ka dobara istemaal pakda jaaye: aisa ho to poori family band aur security email. Usi device aur network se pichhla token misaal 60 second ke andar aaye to use khoya jawab maana jaaye, chori nahi. Sessions ki umar aur bina kaam ke band hona D-180 aur D-181 ke hisaab se. "My devices" me har session dikhe aur band ho sake. Kahan se: ASVS Session Management. Test: purana token doosre device se: family band; khidki me usi device se: chori nahi; umar aur bina kaam wale band hone ke tests.
  3. **SR-029, session ka sach database me:** session aur uske band hone ka record database me; Redis sirf tez cache. Redis khaali ho to gateway database se jaanche. Sign-out, role khatam aur allowlist se hatna agli request pe asar kare. Kahan se: ASVS Session Management. Test: Redis khaali karne ke baad band session 401; role khatam ke baad agli call 403.
  4. **SR-030, CSRF:** badalne wale har route pe `Origin` (ya `Host`) ki allowlist, ek custom header jo sirf apna app bhejta hai, aur SameSite. Jo routes browser khud kholta hai (social sign-in ka start aur callback) unki alag list: sirf GET, bina doosre asar ke. Kahan se: ASVS Access Control, Session Management. Test: doosre origin se POST 403; custom header ke bina 403.
  5. **SR-031, tokens ka signature:** tokens asymmetric signature se (misaal ES256), algorithm pakka; `iss`, `aud` (= app), `exp`, `nbf` jaanche jaayein, taaki ek app ka token doosre app pe na chale. Signing keys apne aap badlein (D-197, misaal 30 din) aur private key encrypted rahe. Keys na mil payein to 503, 401 nahi. Kahan se: ASVS Session Management, Cryptography. Test: `alg:none`, HS256 key ka khel, galat `aud`, expired: sab 401; key ki dikkat pe 503.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Sessions aur tokens" ka hissa):
  1. XSS ya malware se session token ki chori; lamba session chori ke baad bhi chale (Spoofing, Information disclosure): SR-027, SR-028, SR-005.
  2. Refresh token ki copy chupchaap chale; ya ulta, khoya jawab "chori" maan ke sahi user baar-baar bahar ho (Spoofing, DoS): SR-028.
  3. Redis restart pe band sessions ke nishaan ud jaayein aur purana session phir chale (Elevation): SR-029.
  4. Cookie wale sessions pe CSRF (doosri site se badalne wali request) (Tampering): SR-030.
  5. Token jaali banana (algorithm ka khel), signing key ka leak, ya ek app ka token doosre app pe chalna (Spoofing, Elevation): SR-031.
  6. Allowlist se hata tester, ya role khatam hua staff, chalte session se kaam karta rahe (Elevation): SR-018, SR-029.
- **Risk me jod** ([RISKS.md](RISKS.md)): R-010 (Key Value ka data restart pe jaata hai) ke "Kam karne ka tareeka" me: sessions aur unke band hone ka sach database me (SR-029); rate limits ki ginti restart ke baad thodi der shuru se, ye maana. Status `Khula` hi rahe.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-010 me jod.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me har request pe session ki jaanch Redis se, aur Redis khaali ho to database se: thoda dheema us waqt.
  - (b) me har badlav ki ek line.
  - (c) me sessions ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-010 me jod. Record: [DECISIONS.md](DECISIONS.md) D-212.

### Q-154. Security batch 4: authorization aur sellers ki deewar ke niyam aur threats maanein?

- **Status:** `Tay`. Topic: B14 (security), B2 (roles).
- **Sawal:** kaun kya dekh aur badal sake (default deny, customer aur seller ka apna data, staff ka area, roles aur grants, kaam ka bantwara, staff ko customer ki jaankari) ke neeche ke niyam aur threats naye security docs me aayein?
- **Kyun zaroori:**
  - Kisi aur ki id daal ke uska order ya invoice dekhna (BOLA) e-commerce ka sabse aam hamla hai.
  - Ek platform pe kai sellers hain; seller A ko seller B ka data kabhi na dikhe. Sellers ke liye D-143, D-144, aur staff ke liye D-201, D-202 tay hain.
  - Kaam ke bantwara ke faisle (D-084, D-146, D-147, D-188, D-189) code me pakke pehre chahte hain.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me):
  1. **SR-032, default deny:** jo route "public" mark nahi, wo bina session 401. Har handler me `authorize(actor, permission, resource)`, ek bina I/O ka pure function (mutation tests ke saath). Permission na ho to 403; cheez scope ke bahar ho to 404. Har route aur har actor ka matrix test contracts se bane; gateway ka route manifest bhi contracts se, aur jo route contract me nahi wo gateway se pahunch hi nahi sakta. Kahan se: ASVS Access Control. Test: matrix test CI me; bina permission ka naya route test me fail.
  2. **SR-033, customer ka data sirf uska:** customer ki har cheez (order, parcel, invoice, address, return, daawa, review, media) ki query repository level pe owner ke filter ke saath; id kitni bhi lambi ho, uspe bharosa nahi. Kahan se: ASVS Access Control. Test: har resource type pe doosre customer ki id: 404.
  3. **SR-034, sellers ke beech deewar:** seller ka har data `sellerId` ke filter ke saath repository level pe; reports, exports aur media sirf apne (D-143, D-144). Jahan staff ka scope ho (jaise hub ya area), wahan bhi isi tarah filter. Kahan se: ASVS Access Control. Test: seller B ki har id pe seller A ko 404; export me sirf apne rows.
  4. **SR-035, app aur area ki seema:** route manifest me har route ke allowed apps aur permissions; customer ke token se staff ka route 403 (token ka `aud`, SR-031). Delivery partner sirf apne assigned parcels; staff apne area (hub, warehouse, sub-district, district, state; D-015) tak. Kahan se: ASVS Access Control. Test: customer token se admin route; partner se doosre ka parcel; hub staff se doosra hub: 403 ya 404.
  5. **SR-036, strict schema aur audience ka jawab:** har request ka schema strict: anjaane fields pe 400; role, status, daam, seller id jaise fields client se kabhi nahi. Har audience ka apna jawab: seller ke jawab me customer ke naam, phone, email aur address ke fields hi nahi (D-143). Kahan se: ASVS Validation, API. Test: extra field pe 400; seller ke jawab ke schema me customer ki personal jaankari nahi.
  6. **SR-037, roles aur grants:** kuch permissions kabhi sub-role me nahi (grants dena, authenticator reset, allowlist, payout manzoori, kill switches); koi role khud ko appoint nahi kar sakta; har grant ka scope aur umar; Master ke paas koi "decide" permission nahi (D-047); role aur grant ka har badlav dobara code (D-185) aur audit ke saath. Kahan se: ASVS Access Control. Test: aisi permission wala sub-role mana; khud ko appoint mana; Master se listing manzoor 403.
  7. **SR-038, kaam ka bantwara:** pure checks: appeal tay karne wala account reject karne wala nahi (D-084, D-146, D-147); seema se upar refund (D-188), payout (D-189), fees aur policy publish me banane aur manzoor karne wale alag accounts; apne brand (D-031) ka staff apni listing manzoor nahi; brand ka staff apne product pe review nahi (D-156). Kahan se: ASVS Business Logic, Access Control. Test: har niyam ka unit aur API test: wahi account 403.
  8. **SR-039, staff ko customer ki jaankari (D-201, D-202):** list API me chhupi jaankari; poori sirf maamla kholne pe wajah ke saath, aur har "poori dekhi" audit me; delivery partner ko sirf apne active parcel ki, delivered ke baad chhupi; "customer ki nazar se" ka koi raasta nahi. Kahan se: ASVS Data Protection. Test: list API me chhupa; poori dekhne pe audit entry; partner ko delivered ke baad chhupi.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Authorization aur sellers ki deewar" ka hissa):
  1. Customer id badal ke doosre ka order, invoice, address, return ya daawe ki photo dekhe ya badle (BOLA) (Information disclosure, Tampering): SR-032, SR-033.
  2. Seller A, seller B ke orders, stock, settlement, listings ya dastavez dekhe ya badle; ya report aur export me scope ke bahar ka data (Information disclosure, Tampering): SR-034.
  3. Customer ya seller ke token se staff ke routes; partner doosre hub ya doosre partner ke parcels (Elevation): SR-032, SR-035.
  4. Request me zyada fields (role, daam, status, "approved", seller id), ya seller ke jawab me customer ka phone (Tampering, Information disclosure): SR-036.
  5. Roles se upar chadhna: khatarnak permission wala sub-role, khud ko appoint karna, grant ke scope se bahar (Elevation): SR-037.
  6. Kaam ka bantwara toote: wahi account appeal tay kare, refund banaye aur manzoor kare, ya apni listing manzoor kare (Elevation, Repudiation): SR-038.
  7. Staff zaroorat se zyada customer ki jaankari dekhe ya list bana ke le jaaye (Information disclosure): SR-039.
- **Risks:** is batch me naya risk nahi.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo niyam badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me har route pe matrix test aur repository ke filter ka kaam; par BOLA aur sellers ki deewar ka pehra pehle din se.
  - (b) me har badlav ki ek line.
  - (c) me authorization ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-213.

### Q-155. Security batch 5: catalog, checkout aur paise ke niyam, threats aur risks maanein?

- **Status:** `Tay`. Topic: B14 (security), B5 (checkout), B6 (payments).
- **Sawal:** seller aur user ka content, listing ke versions, daam, settings, checkout, stock, payment aur webhooks, delivery pe UPI, paise wale staff faisle, seller ka bank aur ledger ke neeche ke niyam, threats aur risks naye security docs me aayein?
- **Kyun zaroori:**
  - Client se daam ya fee badal ke bhejna, nakli payment webhook, aur wahi event do baar aana: e-commerce me paise ka seedha nuksaan yahin se hota hai.
  - Daam (D-061, D-087), quantity (D-091), stock (D-118), delivery pe UPI (D-109, D-204), refund (D-111), seema (D-188, D-189, D-205) aur bank badlav (D-190) ke faisle tay hain; ye niyam unhe code ke pehre dete hain.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-040, content me script nahi:** user aur seller ka content (review, brand ka jawab, Q&A, description, ingredients ka text, naam) text ki tarah rakha jaaye aur customer aur staff dono apps me escape karke dikhe. Rich text sirf chhoti allowlist (bold, list), server pe sanitize. Links band ya `rel="nofollow ugc noopener"`. Phone, email aur link ke pattern D-136 ki jaanch me. Kahan se: ASVS Validation. Test: XSS payloads ki list har field me; customer aur Admin app me kuch na chale.
  2. **SR-041, listing ke versions (D-098):** listing ka har jokhim wala badlav ek naya version, ek hi raaste se. Staff ki manzoori ek version id pe; beech me naya badlav aaya to wo manzoori naya version live nahi karti. Live version badla nahi ja sakta. Kahan se: ASVS Business Logic. Test: jaanch ke beech badlav: purani manzoori naya version live na kare.
  3. **SR-042, daam ke niyam server pe (D-061, D-087):** daam 0 se zyada, batch ke MRP se upar nahi, bade badlav pe dobara confirm. Pro daam sirf jaanche hue Pro (D-069) ke session pe aur private endpoint se (SR-004). Kahan se: ASVS Business Logic. Test: MRP se upar mana; bina confirm bada badlav mana; bina sign-in jawab me Pro daam nahi.
  4. **SR-043, settings aur imports:** allowlist, switches, fees, policy ke numbers, HSN table, blocklist, emails ki chhat, search ke synonyms, location data: har ek ki apni permission; paise aur security wali settings pe dobara code (D-185); har badlav audit me purani aur nayi value aur wajah ke saath; import pehle "dry run" aur schema ki jaanch; blocklist sirf senior catalog role (D-132). Kahan se: ASVS Access Control, Logging. Test: bina haq 403; audit me pehle aur baad; galat import file ka koi asar nahi.
  5. **SR-044, checkout ka hisaab server pe:** client sirf variant id aur quantity bheje. Daam, batch ka MRP, discount, delivery fee, tax, quantity ki seema (D-091) aur serviceability (D-016 niyam 9) server order banate waqt nikale. Customer ka dekha total aur server ka total na mile to order nahi; naya total dikhao. Kahan se: ASVS Business Logic. Test: request me daam ya fee bhejne ka koi asar nahi; unserved pincode pe order mana.
  6. **SR-045, stock aur dobara click:** stock ki reservation atomic (conditional update ya transaction). "Place order" pe idempotency key: wahi body pe wahi jawab, alag body pe 422, chalte hue pe 409. Kahan se: ASVS Business Logic. Test: aakhri unit pe 50 order ek saath: ek hi safal; dobara click: ek hi order.
  7. **SR-046, stock rokne ki seema:** ek customer ke khule delivery-pe-UPI orders D-204 ke hisaab se; bina payment "place order" ki seema (SR-008); quantity ki seema D-091. Kahan se: ASVS Business Logic. Test: seema ke upar order mana, saaf sandesh ke saath.
  8. **SR-047, paise ka hisaab:** paisa hamesha integer paise me; baantne ka ek function jiska bacha paisa tay niyam se jaaye. Har refund line ke hisaab se (D-110, D-114), aur kabhi "liya gaya paisa minus pehle ke refund" se zyada nahi. Kahan se: ASVS Business Logic. Test: random carts pe property tests: refunds ka jod payment se kabhi zyada nahi.
  9. **SR-048, payment pakka sirf server se:** payment gateway ka order server banaye (exact rakam aur currency, apne order se juda). Order tabhi "paid" jab server signature jaanche ya webhook aaye aur rakam, currency aur order id milein. Browser ka "success" sirf screen ke liye. Kahan se: ASVS Business Logic. Test: nakli success callback pe order unpaid; kam rakam ka payment juda nahi.
  10. **SR-049, webhooks:** signature raw body pe, constant-time milaan. Har event id ek hi baar (inbox table), taaki dobara aaye to dobara asar nahi. Ulte kram me aaye events sambhale. Der se aaya payment D-118 ke hisaab se apne aap refund, ek hi baar. Kahan se: ASVS API, Business Logic. Test: wahi event 3 baar: ek asar; badli body: 401; ulta kram: sahi aakhri haalat.
  11. **SR-050, delivery pe UPI (D-109):** QR sirf system banaye, us parcel ki exact rakam ka, server se partner ke app me. "Paid" sirf gateway ke webhook se. Customer ke app me usi waqt "payment mila" dikhe. Partner ke app me "paid" mark karne ka koi raasta nahi. Delivery code payment ke baad hi. Kahan se: ASVS Business Logic. Test: partner ke liye "paid" ka koi API nahi; webhook ke bina code daalna band.
  12. **SR-051, paise wale staff faisle:** refund aur daawe (D-188), payout (D-189), goodwill coupon (D-205, R2): role ke hisaab se rakam ki seema, din ki kul seema, seema se upar doosre account ki manzoori; har ek audit me; refund hamesha original raaste (D-111). Kahan se: ASVS Business Logic, Access Control. Test: seema se upar Support Agent ka faisla pending; banane aur manzoor karne wala ek account: mana.
  13. **SR-052, seller ka bank (D-190):** bank ya payout details ka badlav dobara code ke saath; purane email aur in-app pe khabar; naye khaate pe rok ke dauraan payout batch me nahi; details encrypted, screen pe sirf aakhri 4 ank. Kahan se: ASVS Business Logic, Data Protection. Test: bina code mana; khabar jaaye; rok ke dauraan payout batch me nahi.
  14. **SR-053, ledger:** ledger sirf jodta hai (app ke database user ko update aur delete ka haq nahi); har entry double entry se balance; sudhaar sirf ulti entry se, wajah ke saath; payment gateway ki report se milaan (R1 me basic, roz ya hafte); farak pe alert. Kahan se: ASVS Business Logic, Logging. Test: app ke user se UPDATE mana; milaan ka test.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Catalog, checkout aur paisa" ka hissa):
  1. Seller ke content ya review me stored XSS, jo customer app ya staff ke app me chale (Tampering, Elevation): SR-040, SR-005.
  2. Jokhim wala field doosre raaste se badal ke jaanch se bachna, ya jaanch ke beech version badalna (Tampering): SR-041.
  3. Daam MRP se upar, 0, ya bada badlav bina confirm; Pro daam sab ko dikhna (Tampering, Information disclosure): SR-042, SR-004.
  4. Settings (allowlist, switches, fees, HSN, blocklist, emails ki chhat) kam haq ya chori ke account se badalna (Tampering, Elevation): SR-043, SR-026.
  5. Client se daam, discount, delivery fee, quantity ya pincode badal ke bhejna; Pro daam bina Pro darje (Tampering): SR-044, SR-042.
  6. Stock ki race: ek saath orders se zyada bikna; reservation aur payment ke beech (Tampering): SR-045.
  7. Delivery-pe-UPI ya bina payment ke orders se stock rokna (DoS): SR-046.
  8. Aadhe cancel ya return pe refund ki galat ginti se zyada paisa wapas (Tampering): SR-047.
  9. Nakli webhook ya sirf browser ke "success" se order pakka, ya kam rakam ka payment jodna (Spoofing, Tampering): SR-048, SR-049.
  10. Wahi webhook do baar ya purana dobara: do refund ya do ledger entry (Tampering): SR-049.
  11. Delivery pe partner apna QR dikhaye ya khud "paid" kare; customer purana screenshot dikhaye (Spoofing, Tampering): SR-050.
  12. Chori hua staff account refund seema se upar ya baar-baar chalaye (Elevation, Tampering): SR-051, SR-038.
  13. Seller account chori karke bank badal ke agla payout apne khaate me (Tampering, Spoofing): SR-052, SR-026.
  14. Ledger me seedha badlav, ya finance aur gateway ka milaan na hona (Tampering, Repudiation): SR-053.
- **Risks:** is batch me naya risk nahi (payment page ki script R-016 me pehle se).
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me).
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me checkout aur finance ke kaam me tests ka hissa bada (race, property tests, webhook ke tests); par paise ka seedha nuksaan yahin rukta hai.
  - (b) me har badlav ki ek line.
  - (c) me checkout aur finance ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-214.

### Q-156. Security batch 6: delivery, daawe aur reviews ke niyam, threats aur risk maanein?

- **Status:** `Tay`. Topic: B14 (security), B1 (delivery), B7 (returns), B8 (reviews).
- **Sawal:** delivery code, delivery aur pickup ka saboot, partner ki location, trips aur scans, fraud ke signals, reviews aur reports ke neeche ke niyam, threats aur risk naye docs me aayein?
- **Kyun zaroori:**
  - "Parcel nahi mila" ka faisla saboot se hota hai (D-072, D-148), to saboot jaali na ho sake.
  - Jhoothe daawe, nakli reviews aur jhoothi reports se paise aur bharose ka nuksaan hota hai (D-116, D-135, D-136, D-156).
  - Delivery code confirmation email me jaata hai (D-126), to wo sirf sahi waqt aur sahi partner pe chale.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-054, delivery code:** har parcel ka cryptographically secure random se 6 ank ka code. Partner ke app ko code kabhi nahi milta; milaan server pe. Ek parcel pe 5 galat koshish ke baad code daalna band (Hub Manager khole, audit me). Code tabhi chale jab parcel "out for delivery" ho aur usi partner ko assigned ho. Code push (D-195), logs aur aankdon me kabhi nahi. Kahan se: ASVS Business Logic. Test: 6th koshish mana; doosre partner se mana; logs me code nahi.
  2. **SR-055, delivery aur pickup ka saboot:** photo app ke camera se (file input pe `capture`; browser me gallery ko poori tarah rokna pakka nahi, ye seema maani); server ka samay; location aur uski accuracy; address ke pin se doori (misaal 300 m se zyada to nishaan); photo ka hash (wahi photo dobara aaye to nishaan). Kahan se: ASVS Business Logic. Test: purani photo ka hash dobara: nishaan; door ki location: nishaan.
  3. **SR-056, partner ki location:** location sirf events pe (delivered, koshish fail, pickup); lagatar tracking nahi. Kitne din aur kaun dekhe, D-191 ke hisaab se. Kahan se: ASVS Data Protection. Test: delivery ke beech location ki koi call nahi; delete job ka test.
  4. **SR-057, trips aur scans:** har scan pe kaun, kis device se aur kab; manifest aur seal number (D-027); hub pe ginti ka farak apne aap nishaan aur audit me. Kahan se: ASVS Logging. Test: kam bag pe nishaan; har scan ka actor.
  5. **SR-058, fraud ke signals ka record R1 se:** customer ke daawe, photo hash ka dobara aana, partner ke daawon ka hissa, delivery pe UPI pe mana (D-072 niyam 4, D-116). Support ki screen pe nishaan; apne aap rok sirf tay faislon se (D-109, D-203; D-116 R2 me). Kahan se: ASVS Business Logic. Test: signals ka record aur nishaan dikhe.
  6. **SR-059, reviews:** review sirf delivered line se (D-135); ek account din me 5 (SR-008). Seller app ke users (wahi user ya wahi email) apne brand pe review nahi likh sakte (D-156). Kai accounts ke signals D-203 ke hisaab se (R2 se). Kahan se: ASVS Business Logic. Test: bina delivered line review 403; seller ke user ka review 403.
  7. **SR-060, reports:** report sirf signed-in, ek account din me 10 (SR-008). "Personal data" ya "intimate" wali report (D-136 niyam 4) queue me sabse upar, aur misaal 24 ghante me faisla na ho to alert. Jhoothi reports ki ginti rakhi jaaye; baar-baar jhoothi report wale ki report queue me neeche. Seller ki report (R2) kabhi apne aap review nahi chhupati. Kahan se: ASVS Business Logic. Test: seema ke upar report mana; 24 ghante ka alert; jhoothi report ki ginti.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Delivery, daawe aur reviews" ka hissa):
  1. Partner delivery code ka andaaza lagaye, ya code kisi aur raaste (push, logs) leak ho (Spoofing): SR-054.
  2. Nakli saboot: gallery ki purani photo, ya GPS badal ke "delivered" (Spoofing, Repudiation): SR-055.
  3. Delivery ki photo aur location ka galat istemaal ya zyada der rakhna; partner ki lagatar tracking (Information disclosure): SR-056, D-191.
  4. Trip ka manifest ya scan badal ke warehouse, hub ya raaste me maal gayab (Tampering, Repudiation): SR-057.
  5. Return pickup pe doosra batch ya nakli maal, partner ki mili-bhagat ke saath (Tampering): SR-055, SR-058.
  6. Jhoothe daawe: internet ki photo, ek photo kai daawon me, baar-baar "parcel nahi mila" (Spoofing, Repudiation): SR-058, SR-055.
  7. Support Agent aur customer ki mili-bhagat (jaan-pehchaan wale ka refund ya daawa manzoor) (Elevation): SR-051, SR-038.
  8. Kai accounts se nakli reviews, ya brand ka staff apne product pe review (Spoofing): SR-059, D-203.
  9. "Personal data" ki jhoothi report se negative review faisle tak chhupwana (DoS, Tampering): SR-060.
- **Risk** ([RISKS.md](RISKS.md) me, tag `Security`): **R-019:** delivery partner ke phone pe offline customer data (naam, address, phone); phone kho jaaye. Kam karne ka tareeka: kam se kam data aur delivered pe hatana (SR-023), cache ke niyam (SR-010), manzoor phone aur Hub Manager se band (D-183). Status `Khula` (bachav ke saath).
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-019 `Khula`.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me Delivery app aur support me saboot aur signals ka kaam; browser me gallery ki photo poori tarah nahi rukti, isliye hash aur location ke nishaan.
  - (b) me har badlav ki ek line.
  - (c) me delivery aur daawon ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-019 `Khula`. Record: [DECISIONS.md](DECISIONS.md) D-215.

### Q-157. Security batch 7: files aur personal data ke niyam, threats aur risk maanein?

- **Status:** `Tay`. Topic: B14 (security, privacy).
- **Sawal:** uploads, private media, field encryption, kam data lena, data ke samay ka delete job, account delete aur sehat ke data (R2) ke neeche ke niyam, threats aur risk naye docs me aayein?
- **Kyun zaroori:**
  - Saara backend ek process me hai (D-049): ek bura file (jaise image parser ka bug) poore backend tak pahunch sakta hai.
  - KYC, daawe ki photos aur delivery ki photo jaise private media ka URL leak ho to pehchaan aur ghar ka pata bahar.
  - Data ke samay (D-191 se D-194, D-208) aur account delete (D-151) tay hain; unhe chalane wala job aur encryption ke niyam chahiye.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-061, uploads:** file ka type uske andar ke bytes se jaancha jaaye (images JPEG, PNG, WebP; dastavez PDF sirf jahan zaroori; video sirf daawe me, D-106). Size (misaal): image 5 MB, PDF 10 MB, video 30 MB. SVG, HTML aur baaki types kabhi nahi. Har image dobara encode ho aur EXIF (location samet) hate. File ka naam kabhi istemaal nahi. Upload seedha storage pe, chhote signed URL se (misaal 10 minute, exact type aur size). Account ki din ki seema (SR-008). Kahan se: ASVS Files and Resources. Test: SVG aur `.png` naam wala HTML mana; EXIF wali photo ka live roop bina EXIF; bada file mana.
  2. **SR-062, private media:** KYC, Pro ke dastavez, claims ke saboot, daawe aur pickup ki photos, aur delivery ki photo alag private jagah me; sirf authorization ke baad chhota signed URL (misaal 5 minute); PDF `Content-Disposition: attachment` ke saath; app ke origin se kabhi nahi. Har file ka record (maalik, maqsad, public ya private); data me provider ka URL nahi, sirf file ka id. Kahan se: ASVS Files and Resources, Data Protection. Test: private URL 6 minute baad mana; bina haq signed URL nahi banta.
  3. **SR-063, field encryption:** AES-256-GCM, record aur field ka context saath me (associated data), key id ke saath taaki key badal sake: seller ka PAN, bank account, authenticator ke secrets, partner ke ID numbers, aur R2 me consultation notes aur sehat ke fields. Dhoondhne ke liye HMAC blind index; dikhane ke liye chhupi copy. Recovery codes aur baaki codes sirf hash. Kahan se: ASVS Cryptography, Data Protection. Test: database me plaintext nahi (pattern test); ek record ka encrypted value doosre record me copy karke nahi khulta.
  4. **SR-064, kam data lena:** Aadhaar ka number nahi lena (kisi KYC me zaroori ho to chhupa); customer ka UPI ID nahi rakhna; proprietor ka GSTIN personal data maana jaaye (andar PAN hai); delivery partner aur transporter ke driver ka sirf kaam ka data. Kahan se: ASVS Data Protection. Test: schema me aise fields nahi (review checklist).
  5. **SR-065, data ke samay ka job:** har data class ke samay (D-191 se D-194, D-208) ka roz ka job: delete ya pehchaan hatana; job ka log (kitne hate) bina data ke; backups me purana data backup ki umar tak (D-196). Kahan se: ASVS Data Protection. Test: samay se purana record nahi bachta; job ka test.
  6. **SR-066, account delete (D-151):** pehle dobara pehchaan (SR-016); email aur in-app khabar; misaal 7 din me wapas le sake. Ek event se har service apni copy hataye ya pehchaan hataye (invoice aur ledger me naam, pata aur email ki jagah code). Sessions, push subscriptions aur waitlist bhi. Kahan se: ASVS Data Protection. Test: delete ke baad har service me naam aur email nahi; invoice me code.
  7. **SR-067, sehat ka data (R2 se):** alag consent (D-165); encrypted (SR-063); sirf D-207 ke roles dekhein, har dekhna audit me; D-208 ka samay; seller ko kabhi nahi (D-165); business events aur aankdon (D-157) me kabhi nahi. Kahan se: ASVS Data Protection. Test: bina consent field save nahi; galat role 403; events me ye fields nahi.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Files aur personal data" ka hissa):
  1. Bura file: SVG ya HTML se XSS, ek file jo do type ki ho, bahut bada file, ya image parser ke bug se process pe kabza (Tampering, Elevation, DoS): SR-061.
  2. Private media ka URL andaaze se, public jagah se, lambe signed URL se ya Referer se leak (Information disclosure): SR-062, SR-005.
  3. Uploads ki baadh se free storage khatam (DoS): SR-061, SR-008.
  4. Review ki photo me EXIF ki location, ya review text me phone ya email (Information disclosure): SR-061, SR-040.
  5. Database ya backup leak hone pe PAN, bank account aur authenticator ke secrets khule (Information disclosure): SR-063, D-196.
  6. Zaroorat se zyada data lena ya zyada der rakhna (Information disclosure): SR-064, SR-065.
  7. Account delete ke baad bhi kisi service me naam aur email bacha (Information disclosure): SR-066.
  8. Sehat ka data galat haathon me ya aankdon me (R2) (Information disclosure): SR-067.
- **Risk** ([RISKS.md](RISKS.md) me, tag `Security`; haan ka matlab owner ne `Maana`): **R-020:** uploads ki malware jaanch nahi (₹0, 512 MB me antivirus nahi chal sakta). Kam karne ka tareeka: sirf tay types, bytes se jaanch aur images ka dobara encode (SR-061); PDF attachment ke roop me, app ke origin se nahi (SR-062).
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-020 `Maana`.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me images ka dobara encode aur encryption ka kaam (CPU aur memory, R-007), par bura file aur leak ka asar chhota.
  - (b) me har badlav ki ek line.
  - (c) me uploads aur data ka design bina pakke niyam ke.
- **Kanooni detail jaanchi nahi** (R-004): KYC me Aadhaar ya doosre ID ke niyam, aur personal data ke delete ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-020 `Maana`. Record: [DECISIONS.md](DECISIONS.md) D-216.

### Q-158. Security batch 8: data stores, services aur khabron ke niyam, threats aur risks maanein?

- **Status:** `Tay`. Topic: B14 (security), B15 (technical).
- **Sawal:** databases ke users, injection, Redis, ek process me services ki deewar, server ke bahar ke calls, emails aur browser push ke neeche ke niyam, threats aur risks naye docs me aayein?
- **Kyun zaroori:**
  - Har service ka apna database aur user hai (D-011, D-050), par Render pe saari services ek process me chalti hain (D-049, D-056): process ki koi deewar nahi, to deewar code me chahiye.
  - Free tier pe databases ka network sabke liye khula ho sakta hai; tab suraksha sirf password aur TLS pe.
  - Emails aur push me naam aur address jaate hain (D-126, D-195), aur push subscription ka URL browser deta hai.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal):
  1. **SR-068, database users:** har service ka database user sirf apne database pe (D-050): MongoDB me apne database pe `readWrite`; finance me app role sirf data ke kaam (DML), migration ka role alag. TLS zaroori. Har password random (misaal 32 se zyada characters). Provider network allowlist de to wahi. Laptop, tests aur CI kabhi production databases se nahi judte; sirf backup command (D-013) aur break-glass command (D-200). Kahan se: ASVS Architecture, Communication, Configuration. Test: service A ke user se B ka database mana; bina TLS connection mana.
  2. **SR-069, injection:** MongoDB filters sirf typed builders se; user input me `$` ya `.` se shuru keys mana; finance me sirf parameterized queries; search text ka regex escape aur lambai ki seema (SR-007). Kahan se: ASVS Validation. Test: `{"$ne": null}` jaise inputs pe 400; SQL injection strings ka asar nahi.
  3. **SR-070, Redis:** sirf internal URL se (D-051), provider de to password ke saath; har service ka key prefix; cache me sirf wo jo database se dobara ban sake; queue ke job ka payload worker me schema se jaancha jaaye. Kahan se: ASVS Architecture, Validation. Test: galat job payload reject; Redis khaali karne ke baad cache sahi bane.
  4. **SR-071, ek process me bhi service ki deewar:** services ek doosre ka database client ya andar ka code import nahi karti (lint aur dependency rule); andar ki calls bhi typed facade aur actor ke context se authorize; har service sirf apne config namespace ke secrets padhe (lint); events schema se jaanche jaayein aur bhejne wali service ke naam ke saath; split mode me andar ki calls signed. Image aur PDF ka kaam jahan ho sake provider pe, ya chhoti aur taaza libraries se. Kahan se: ASVS Architecture, Configuration. Test: lint me doosri service ka import fail; galat service ka event reject.
  5. **SR-072, server ke bahar ke calls:** server sirf tay hosts ko bulaye (payment, email, social sign-in, leak hue passwords ki API, push services ki allowlist). Push subscription ka endpoint sirf `https` aur jaane-maane push hosts. Redirect follow nahi. User ka diya URL kabhi fetch nahi (Meet link bhi nahi). Kahan se: ASVS Files and Resources. Test: anjaan ya andar ke host wali subscription save nahi.
  6. **SR-073, emails:** templates auto-escape; header injection (CRLF) mana; kam se kam personal data (poora address sirf invoice me, D-195); OTP aur codes kabhi logs me nahi; seller ke udhaar wale email (D-071) me payment link ki jagah "Seller app me dekhein" (link ho to sirf seller app ke host ka, SR-012). Kahan se: ASVS Validation, Data Protection. Test: naam me `<script>` aur CRLF wala test; templates ke links ka test.
  7. **SR-074, browser push:** push subscription user aur session se bandhi; sign-out aur account badalne pe us browser ki subscription server se hate. Payload D-195 ki seema me, code ya rakam kabhi nahi. Push ki private key (VAPID) secret. 404 ya 410 pe subscription delete. Kahan se: ASVS Data Protection. Test: sign-out ke baad us browser pe push nahi; payload ka test.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Data stores, services aur khabrein" ka hissa):
  1. Database ke credentials leak aur network sabke liye khula: poora database padhna, badalna ya mitana (Information disclosure, Tampering, DoS): SR-068, R-022.
  2. NoSQL operator injection (`$ne`, `$gt`), finance me SQL injection, ya search me regex se CPU (Tampering, Information disclosure, Elevation): SR-069.
  3. Redis me galat cache (daam, serviceability), nakli queue job, ya rate limits ki ginti mitna (Tampering, DoS): SR-070, SR-029.
  4. Ek process me ek module ki kamzori se doosri services ke database credentials aur data tak pahunch (Elevation, Information disclosure): SR-071, R-021.
  5. Nakli ya badla event; ek service doosri ke naam se event bheje (Spoofing, Tampering): SR-071.
  6. SSRF: nakli push subscription se server andar ke URL ko bulaye (Spoofing, Information disclosure): SR-072.
  7. Email me HTML ya header injection, zyada personal data, ya email provider ke dashboard me codes ki copy (Information disclosure, Tampering): SR-073.
  8. Push galat insaan ko (shared browser pe purane account ki subscription), ya lock screen pe personal baat (Information disclosure): SR-074, D-195.
  9. Seller ko payment link wala email: bina domain ke links pe click karna sikhata hai (Spoofing): SR-073, SR-012.
- **Risks** ([RISKS.md](RISKS.md) me, tag `Security`; haan ka matlab owner ne `Maana`):
  1. **R-021:** Render pe saari services ek process me (D-049, D-056): process ki deewar nahi, to ek module ki kamzori se saari services ke secrets aur data. Kam karne ka tareeka: SR-071, SR-061, kam parsers.
  2. **R-022:** free tier pe databases ka network sabke liye khula ho sakta hai: suraksha sirf password aur TLS pe. Kam karne ka tareeka: SR-068, lambe random passwords, kam haq wale users. Provider ki allowlist ki jaanch ke baad dobara dekhna.
- **Tathya ki jaanch (Claude, owner ka faisla nahi; §2):** Atlas ke free cluster, Neon ke free plan aur Render Key Value me network allowlist ya IP access list milti hai ya nahi, aur Render ki free web service ke bahar jaane wale IPs tay hain ya nahi. R-022 isi pe tika hai.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; R-021 aur R-022 `Maana`.
  - **(b)** Maanein, par owner jo niyam badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me lint aur dependency rules ka kaam (service ki deewar), par ek process me bhi kamzori ka asar chhota.
  - (b) me har badlav ki ek line.
  - (c) me services aur khabron ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-021 aur R-022 `Maana`. Record: [DECISIONS.md](DECISIONS.md) D-217.

### Q-159. Security batch 9: export, audit, logs aur DevOps ke niyam, threats aur risks maanein?

- **Status:** `Tay`. Topic: B14 (security), B15 (operations).
- **Sawal:** export, audit log, logs, owner ko security alerts, secrets, repo ke pehre, providers ke accounts, supply chain, backups aur incident ke kram ke neeche ke niyam, threats aur risks naye docs me aayein?
- **Kyun zaroori:**
  - Ek insaan aur free tier pe hamla der se pakda ja sakta hai; audit, alerts aur ek likha hua kram (D-198) hi bachav hain.
  - Repo public hai: galti se commit hua secret sabke saamne.
  - Owner ka laptop aur providers ke accounts poore system ki chaabi hain.
  - D-144 me ek export me 50,000 rows tak ho sakti hain; bada export bina khabar ke na ho.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-075, export (D-144):** jo cell `=`, `+`, `-`, `@`, tab ya CR se shuru ho, uske aage `'`. Scope wahi jo report ka. Dobara code (D-185). Audit me filters aur rows ki ginti. 50,000 ki seema (D-144), aur misaal 5,000 se zyada rows pe owner ko alert. Download link chhota aur ek baar ka. Kahan se: ASVS Validation, Access Control. Test: `=HYPERLINK(...)` wala naam export me text hi rahe; doosre seller ka row nahi.
  2. **SR-076, audit log:** sirf jodta hai; roz ki hash chain aur uski jaanch ka job (finance ki jaanch hafte me ek, Neon ke ghante dekh ke, R-014); database user ko update aur delete ka haq nahi; mana hue kaam bhi likhe jaayein. Audit me: staff ka har likhne wala kaam, paise ke kaam, settings aur imports, exports, personal data dekhna, security events, seller ke daam ke badlav aur listing versions. Har entry me: account, insaan (owner ke saare accounts ek insaan se jude, D-017, D-047), role, app, session, kaam, cheez, scope, pehle aur baad (chhupa), wajah, nateeja, IP, browser, request id, samay. Samay D-194 ke hisaab se. Kahan se: ASVS Logging. Test: ek entry badli to jaanch fail; mana hua kaam audit me dikhe.
  3. **SR-077, logs:** logs structured. Har request pe: request id, route, status, samay, account id (email nahi), app, client IP (SR-003), browser ka chhota roop, error code. Security events: sign-in safal aur fail (staff ke sab; customer ke sirf fail aur naya device), rok, code maangna aur galat code, refresh ka dobara istemaal, authenticator lagana, hatana aur reset, recovery code, grants aur roles, allowlist, kill switch, webhook signature fail, export, "poori jaankari dekhi", mana hue kaam. Kabhi log nahi: passwords, koi bhi code, tokens, cookies, `Authorization` header, recovery codes, encrypted values, poora email, phone, address, PAN, bank, dastavez, sehat ka data, push ki keys, webhook ki raw body, koi bhi secret. Request aur response body ka log default band; client ko sirf saaf error aur request id, stack trace kabhi nahi. Kahan se: ASVS Logging. Test: log capture test me redaction; 500 pe stack nahi.
  4. **SR-078, owner ko security alerts:** Master app me in-app "security inbox" aur push; sirf gambhir wale email se (OTP ke baad wali line me, din me misaal 5 tak, D-142). Events: refresh ka dobara istemaal, authenticator reset, naya staff grant, allowlist badla, ek IP se bahut fail, webhook signature fail, bada export, kill switch, audit chain toota, milaan ka farak. Server down ke alert UptimeRobot (D-028) ke apne emails se. Roz ka audit verify aur security ka saar usi schedule ke saath jo server jagata hai (D-028). Kahan se: ASVS Logging. Test: har event pe alert bane.
  5. **SR-079, secrets:** secrets sirf providers ke env me (Render, Vercel ka Sensitive env); kabhi repo, client bundle ya logs me nahi. Test aur live keys alag aur naam se pehchaan me aayein. Har secret do values ke saath badal sake (bina downtime). Secrets ki list aur badalne ka kram operations ke doc me (D-197). Kahan se: ASVS Cryptography, Configuration. Test: build me client bundle ki jaanch (secret ke naam); badalne ka abhyaas.
  6. **SR-080, repo ke pehre:** GitHub secret scanning aur push protection chalu; CI me secret scan; `.env` aur backup folder `.gitignore` me aur CI ka pehra (D-013). Kahan se: ASVS Configuration. Test: jaali secret wala commit CI me fail.
  7. **SR-081, providers ke accounts:** GitHub, Vercel, Render, Atlas, Neon, payment gateway, email provider aur social sign-in apps wale account pe MFA (passkey ya authenticator), recovery codes offline; tokens kam haq aur kam umar wale; deploy sirf `release` branch se; branch protection; production dashboards ke liye alag browser profile. Kahan se: ASVS Configuration. Test: operations ki checklist; har account pe MFA.
  8. **SR-082, supply chain:** lockfile aur `npm ci`; GitHub Actions SHA pe pinned; fork PRs ko secrets nahi, aur `pull_request_target` me PR ka code checkout nahi; dependency alerts; har naye dependency pe review. Kahan se: ASVS Configuration, Malicious Code. Test: workflow lint: har action SHA pe.
  9. **SR-083, backups (D-013, D-196):** encrypted; key repo me nahi; restore pehle local ya alag test database me, jaanch ke baad hi production me; har restore audit me; kabhi CI artifact ya cloud sync folder me nahi; encrypted fields backup me bhi encrypted (keys backup me nahi). Account delete (D-151) ke baad purane backup se restore ho to delete hua data wapas aata hai: isliye delete hue accounts ke ids ki chhoti list (bina personal data), aur restore ke baad wo deletes dobara. Kahan se: ASVS Data Protection. Test: bina key backup na khule; restore test; restore ke baad delete hua account wapas na aaye.
  10. **SR-084, incident ka kram:** operations ke doc me likha kram (D-198): (1) tayyari: secrets ki list, kill switches (SR-009), recovery codes offline, restore ka abhyaas; (2) pehchaan aur gambhirta (1: paisa, dastavez, staff ya provider account; 2: customer account ya personal data; 3: bug, data nahi gaya); (3) rokna: sahi kill switch, "sab sessions band", tokens band, shak wale secrets kram se (gambhirta 1 pe misaal 1 ghante me, 2 pe 1 din); (4) jaanch: audit, Render logs ki copy turant, git ka itihaas; (5) theek aur wapsi: fix normal flow se, restore pehle local pe; (6) khabar D-198 ke hisaab se; (7) seekh: [LESSONS.md](LESSONS.md) me ek line, naya test, threat model me badlav. Saal me ek baar abhyaas. Kahan se: ASVS Architecture. Test: abhyaas ka record.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Export, audit, logs aur DevOps" ka hissa):
  1. Export se leak: CSV me formula wale cell, scope ke bahar ka data, ya bada export (Information disclosure, Tampering): SR-075.
  2. Staff apne kaam se mukar jaaye; audit log badla ya mitaya jaaye (Repudiation, Tampering): SR-076.
  3. Logs me passwords, codes, tokens, address ya PAN (Information disclosure): SR-077.
  4. Free tier pe alerts kam aur logs thode din: hamla der se pakda jaaye (Repudiation): SR-078, SR-084; R-024.
  5. Public repo me galti se secret commit, ya payment gateway ki key logs ya app ke bundle me (Information disclosure, Spoofing): SR-079, SR-080.
  6. Provider account (GitHub, Vercel, Render, Atlas, Neon, payment, email) pe kabza: code, infra aur data sab (Spoofing, Elevation): SR-081; R-023.
  7. Supply chain: npm package ya GitHub Action me malware; fork PR se CI ke secrets (Tampering, Elevation): SR-082; R-026.
  8. Owner ka laptop chori ya malware: backups, env, browser ke sessions (Information disclosure, Elevation): SR-081, SR-083, D-196; R-023.
  9. Backup files ka leak, ya restore me purana ya badla data, ya delete hua account wapas (Information disclosure, Tampering): SR-083.
  10. Account par kabze ke baad account delete karna; ya delete ke baad bhi data services aur backups me (DoS, Information disclosure): SR-066, SR-016, SR-083.
- **Risks** ([RISKS.md](RISKS.md) me, tag `Security`):
  1. **R-023:** owner ka laptop aur providers ke accounts ek jagah: ek kabza = code, deploy, data aur backups sab. Kam karne ka tareeka: SR-081, SR-083, D-196, production ke liye alag browser profile. `Maana`.
  2. **R-024:** free tier pe logs aur alerts seemit: hamla der se pakda jaaye. Kam karne ka tareeka: SR-076, SR-078, UptimeRobot ke alerts. `Maana`.
  3. **R-025:** security ki jaanch sirf owner aur Claude; bahar ki koi jaanch (pentest) nahi. Kam karne ka tareeka: QA ke security tests, doosra security run, asli business se pehle bahar ki jaanch. `Maana`.
  4. **R-026:** supply chain (npm packages, GitHub Actions). Kam karne ka tareeka: SR-082. `Khula` (bachav ke saath).
  5. **R-027:** public repo: design aur code sabke saamne, aur galti se secret commit ka jokhim. Kam karne ka tareeka: SR-079, SR-080. `Khula` (bachav ke saath).
- **Tathya ki jaanch (Claude, owner ka faisla nahi; §2):** Render ki free web service ke logs kitne din rehte hain, aur public repo pe GitHub secret scanning aur push protection muft chalu hote hain ya nahi.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-023, R-024, R-025 `Maana`, R-026 aur R-027 `Khula`.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me operations ka kaam (secrets ki list, abhyaas, MFA ki checklist) owner pe, par incident me kram pehle se tay.
  - (b) me har badlav ki ek line.
  - (c) me operations aur incident ka design bina pakke niyam ke.
- **Kanooni detail jaanchi nahi** (R-004): logs rakhne aur incident ki report ke niyam (jaise CERT-In), aur privacy page me backups ka zikr.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-023, R-024, R-025 `Maana`, R-026 aur R-027 `Khula`. Record: [DECISIONS.md](DECISIONS.md) D-218.

### Q-160. Security batch 10: R2 ke hisse, aur seller ko invoice ki copy ka niyam maanein?

- **Status:** `Tay`. Topic: B14 (security), B10 (loyalty), B11 (consultation, support).
- **Sawal:** R2 me aane wale points, coupons, gift cards, consultation ka Meet link aur bina sign-in forms ke neeche ke niyam aur threats, aur pehle chhoota ek R1 ka niyam (seller ko invoice ki copy), naye docs me aayein?
- **Kyun zaroori:**
  - Points (D-174), coupons (D-102), referral (D-176) aur gift cards (D-179) paise jaise hain: ek saath do baar kharch ya kai accounts se khel seedha nuksaan hai.
  - Meet link (D-025) ka sirf shuruaat milana dhokha kha sakta hai (`meet.google.com.example.com`).
  - Bina sign-in forms me koi bhi kisi aur ka email likh sakta hai (D-206).
  - Seller ko order number, shehar aur pincode milte hain (D-143), par invoice ki copy me customer ka naam aur address ho sakta hai; ye report ke dhyaan ke points me tha aur kisi batch me nahi aaya.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me):
  1. **SR-085, points, coupons aur gift cards (R2 se):** hisaab finance ke ledger me; har redemption idempotent aur unique constraint se; ek saath kharch ke tests; per-customer seemaayein D-203 ke jod pe. Kahan se: ASVS Business Logic. Test: 10 redemption ek saath: ek hi safal.
  2. **SR-086, Meet link aur Advisor ke links (R2 se):** Meet link ka URL parse karke `https`, host theek `meet.google.com`, aur path ka pattern. Beauty Advisor ke jawab me links sirf apne customer app ke products pe; baaki sirf text. Kahan se: ASVS Validation. Test: `https://meet.google.com.evil.example` aur `https://meet.google.com@evil.example` mana.
  3. **SR-087, bina sign-in forms (D-206, R2 se):** pehle email ka pakka hona code se (OTP line ki seema me), tabhi allowlist ki jaanch aur ticket. Honeypot field; IP aur email pe rate limit. Kahan se: ASVS Business Logic. Test: bina code ticket nahi; seema ke upar mana.
  4. **SR-088, seller ko invoice ki copy (R1):** seller ko invoice ki copy sirf ek-ek karke download, har download audit me; bulk export me kabhi nahi (SR-075). Kahan se: ASVS Data Protection, Access Control. Test: export me invoice ki copy nahi; har download audit me.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "R2 ke hisse" ka hissa, aur invoice wala "Export, audit, logs aur DevOps" me):
  1. Coupon, points ya gift card ek saath do baar kharch; returns se points ka khel; kai accounts se referral (Tampering, Spoofing): SR-085, D-203.
  2. Meet link field me nakli link, ya Advisor thread me bahar ke links (Spoofing): SR-086.
  3. Bina sign-in forms pe spam, emails ki baadh, ya kisi aur ke email ka bahana (DoS, Spoofing): SR-087, SR-020.
  4. Beauty Pro ke nakli dastavez, ya Pro daam ka leak (Spoofing, Information disclosure): SR-062, SR-042.
  5. Seller ke paas invoice ki copiyon se customers ke naam aur address ki list (Information disclosure): SR-088.
- **Risks:** is batch me naya risk nahi.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo niyam badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me seller ko invoice ek-ek karke hi milti hai (bulk nahi).
  - (b) me har badlav ki ek line.
  - (c) me R2 ke design ke liye niyam baad me.
- **Kanooni detail jaanchi nahi** (R-004): invoice ki copy pe customer ka naam aur address zaroori hai ya nahi; points aur gift cards ke prepaid niyam (D-179).
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-219.

## Change log

| Version | Date       | Badlav                                                                                                                                                               |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                                                                    |
| v1.1.1  | 2026-11-18 | §1 aage ke topics (B1 se B16) aur §2 jaanchna baaki bane.                                                                                                            |
| v1.2.1  | 2026-11-18 | §3 Sawal bana; Q-001 (warehouse me rakhe maal ka maalik).                                                                                                            |
| v1.2.2  | 2026-11-18 | Q-001 tay: (a) brand maalik (D-060).                                                                                                                                 |
| v1.2.3  | 2026-11-18 | Q-002 (customer ko dikhne wala price kaun tay kare).                                                                                                                 |
| v1.2.4  | 2026-11-18 | Q-002 tay: (c) brand + platform ke niyam (D-061).                                                                                                                    |
| v1.2.5  | 2026-11-18 | Q-003 (expire hone wala ya na bika maal).                                                                                                                            |
| v1.2.6  | 2026-11-18 | Q-003 tay: (b) brand ka nuksaan + platform ke niyam (D-062).                                                                                                         |
| v1.2.7  | 2026-11-18 | Q-004 (hamare haath se hue nuksaan ki bharpai ka daam).                                                                                                              |
| v1.2.8  | 2026-11-18 | Q-004 tay: (b) bikne wala daam (D-063).                                                                                                                              |
| v1.2.9  | 2026-11-18 | Q-005 (alag batches ka alag MRP).                                                                                                                                    |
| v1.2.10 | 2026-11-18 | Q-005 tay: (b) batch ke hisaab se (D-064).                                                                                                                           |
| v1.2.11 | 2026-11-18 | Q-006 (Beauty Pro buyers ka daam).                                                                                                                                   |
| v1.2.12 | 2026-11-18 | Q-006 tay: (b) Pro daam (D-065); Q-007 (storage fee).                                                                                                                |
| v1.2.13 | 2026-11-18 | Q-007 tay: (c) muft, phir fee (D-066); Q-008 (product page pe expiry).                                                                                               |
| v1.2.14 | 2026-11-18 | Q-008 tay: (b) exact expiry (D-067); Q-009 (nuksaan ki vasooli).                                                                                                     |
| v1.2.15 | 2026-11-18 | Q-009 tay: (b) saboot se vasooli (D-068); Q-010 (Beauty Pro ki jaanch).                                                                                              |
| v1.2.16 | 2026-11-18 | Q-010 tay: (b) saboot + staff (D-069); Q-011 (Pro daam ki quantity seema).                                                                                           |
| v1.2.17 | 2026-11-18 | Q-011 tay: (b) seller tay kare (D-070).                                                                                                                              |
| v1.2.18 | 2026-11-18 | Q-012 (bachi fee) aur Q-013 (parcel nahi mila par "delivered").                                                                                                      |
| v1.2.19 | 2026-11-18 | Q-012 tay: (b) seema ke baad kadam (D-071).                                                                                                                          |
| v1.2.20 | 2026-11-18 | Q-013 tay: (b) saboot se faisla (D-072).                                                                                                                             |
| v1.2.21 | 2026-11-18 | Q-014 (pehle ka kaam kab aur kaise hatega).                                                                                                                          |
| v1.2.22 | 2026-11-18 | Q-014 tay: (b) do kadam me (D-073).                                                                                                                                  |
| v1.2.23 | 2026-11-18 | Q-015 (pehle ke kaam se kya naye me aaye, list kab aur kaise).                                                                                                       |
| v1.2.24 | 2026-11-18 | Q-015 tay: (b) chalti list discovery ke saath (D-074).                                                                                                               |
| v1.2.25 | 2026-11-18 | Q-016 (ek brand ka maal kai sellers bechna chahein).                                                                                                                 |
| v1.2.26 | 2026-11-18 | Q-016 tay: (a) ek brand, ek seller (D-075); Q-017 (variants kin cheezon se).                                                                                         |
| v1.2.27 | 2026-11-18 | Q-017 tay: (b) category ke hisaab se (D-076); Q-018 (kai sellers wala order aur parcel).                                                                             |
| v1.2.28 | 2026-11-18 | Q-018 tay: (c) normal ek parcel (D-077); Q-019 (seller ki fees aur commission ka aadhaar).                                                                           |
| v1.2.29 | 2026-11-18 | Q-019 tay: (b) + (ii) (D-078); Q-020 (return ki wajahein aur "band" ka matlab).                                                                                      |
| v1.2.30 | 2026-11-18 | Q-020 tay: (b) man badla sirf band maal pe (D-079); Q-021 (return ki samay-seema).                                                                                   |
| v1.2.31 | 2026-11-18 | Q-021 tay: (b) wajah ke hisaab se (D-080); Q-022 (seller ka paisa kab payable, payout).                                                                              |
| v1.2.32 | 2026-11-18 | Q-022 tay: (b) samay-seema ke baad, hafte me payout (D-081); Q-023 (expiry ki seemaon ke number).                                                                    |
| v1.2.33 | 2026-11-18 | Q-023 tay: (b) default + category override (D-082); Q-024 (pack pe expiry date na ho to).                                                                            |
| v1.3.1  | 2026-11-18 | Niyam badla (owner): bina dependency wale sawal ek saath; har sawal se "Iske baad" aur agle sawal ke zikr hataye.                                                    |
| v1.3.2  | 2026-11-18 | Q-025 se Q-036 ek saath (kisi khule sawal pe tike nahi).                                                                                                             |
| v1.3.3  | 2026-11-18 | Q-024 se Q-036 tay: owner ne saari salah maani (D-083 se D-095).                                                                                                     |
| v1.3.4  | 2026-11-18 | Q-037 se Q-057: aapas me jude sawal 6 group (G1 se G6) me ek saath (owner ne group ka tareeka chuna); group ka niyam upar.                                           |
| v1.3.5  | 2026-11-18 | Q-037 se Q-057 tay (D-096 se D-116; Q-040 me teeno kadam R1 me); §1 ke "Ab tak" me naye faisle; topic wali line se "ek-ek karke" hataya.                             |
| v1.3.6  | 2026-11-18 | Q-058 se Q-071 khule: Agent 2 ke pehle run ke baaki 10 sawal aur report ke 4 dhyaan points (G7, G8 group).                                                           |
| v1.3.7  | 2026-11-18 | Q-058 se Q-071 tay (D-117 se D-130); §1 ke "Ab tak" me naye faisle; koi sawal khula nahi.                                                                            |
| v1.3.8  | 2026-11-18 | Q-072 (push band customer ko kin khabaron ka email) aur Q-073 (ingredient master list aur blocklist) khule.                                                          |
| v1.3.9  | 2026-11-18 | Q-072 aur Q-073 tay (D-131, D-132); §2 me public ingredient database ki jaanch.                                                                                      |
| v1.3.10 | 2026-11-19 | Q-074 se Q-100 khule: Agent 2 ke doosre run ke R1 wale sawal aur report ke 2 dhyaan points (email lines ki chhat, allergen chetavni); jude sawal G9, G10, G11 me.    |
| v1.3.11 | 2026-11-19 | Q-074 se Q-100 tay (D-133 se D-159; owner ne saari salah maani); §1 ke "Ab tak" me naye faisle.                                                                      |
| v1.3.12 | 2026-11-19 | Q-101 se Q-120 khule: Agent 2 ke doosre run ke R2 wale sawal; jude sawal G12, G13, G14 me.                                                                           |
| v1.3.13 | 2026-11-19 | Q-101 se Q-120 tay (D-160 se D-179; owner ne saari salah maani); §1 ke "Ab tak" me naye faisle; koi sawal khula nahi.                                                |
| v1.3.14 | 2026-11-19 | Q-121 se Q-145 khule: Security Architect ke pehle run ke R1 wale sawal; jude sawal G15, G16, G17 me.                                                                 |
| v1.3.15 | 2026-11-19 | Q-121 se Q-145 tay (D-180 se D-204; owner ne saari salah maani); §1 me B14 ke "Ab tak" me naye faisle.                                                               |
| v1.3.16 | 2026-11-19 | Q-146 se Q-149 khule: Security Architect ke pehle run ke R2 wale sawal; jude sawal G18 me.                                                                           |
| v1.3.17 | 2026-11-19 | Q-146 se Q-149 tay (D-205 se D-208; owner ne saari salah maani); Q-150 khula (security report ke niyam, threats aur risks docs me kaise).                            |
| v1.3.18 | 2026-11-19 | Q-150 tay: (a) area ke hisaab se batches (D-209); Q-151 khula (security batch 1: edge aur hosting); §2 me Vercel aur Render ki jaanch.                               |
| v1.3.19 | 2026-11-19 | Q-151 tay: (a) batch 1 maana (D-210); Q-152 khula (security batch 2: sign-in).                                                                                       |
| v1.3.20 | 2026-11-19 | Q-152 tay: (a) batch 2 maana (D-211); Q-153 khula (security batch 3: sessions aur tokens).                                                                           |
| v1.3.21 | 2026-11-19 | Q-153 tay: (a) batch 3 maana (D-212); Q-154 khula (security batch 4: authorization aur sellers ki deewar).                                                           |
| v1.3.22 | 2026-11-19 | Q-154 tay: (a) batch 4 maana (D-213); Q-155 khula (security batch 5: catalog, checkout aur paisa).                                                                   |
| v1.3.23 | 2026-11-19 | Q-155 tay: (a) batch 5 maana (D-214); Q-156 khula (security batch 6: delivery, daawe aur reviews).                                                                   |
| v1.3.24 | 2026-11-19 | Q-156 tay: (a) batch 6 maana (D-215); Q-157 khula (security batch 7: files aur personal data).                                                                       |
| v1.3.25 | 2026-11-19 | Q-157 tay: (a) batch 7 maana (D-216); Q-158 khula (security batch 8: data stores, services aur khabrein); §2 me databases ke network ki jaanch.                      |
| v1.3.26 | 2026-11-19 | Q-158 tay: (a) batch 8 maana (D-217); Q-159 khula (security batch 9: export, audit, logs aur DevOps); §2 me Render ke logs aur GitHub ki jaanch.                     |
| v1.3.27 | 2026-11-19 | Q-159 tay: (a) batch 9 maana (D-218); Q-160 khula (security batch 10: R2 ke hisse aur seller ko invoice ki copy); §2 me security report ki baaki tathya wali jaanch. |
| v1.3.28 | 2026-11-19 | Q-160 tay: (a) batch 10 maana (D-219); security report ki saari batches poori; koi sawal khula nahi.                                                                 |
