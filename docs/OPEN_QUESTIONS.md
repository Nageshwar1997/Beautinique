# OPEN QUESTIONS: Beautinique

> **Status:** v1.2.6 (2026-11-18). Khule sawal, aage ke topics aur jaanchna baaki. Cheezein ek-ek karke judengi.

## Is file me kya aayega

- Har sawal: **Sawal**, **Kyun zaroori**, **Vikalp**, **Salah**, **Trade-off**.
- **Status:** `Khula` (jawab baaki), `Charcha` (baat chal rahi), `Tay` ([DECISIONS.md](DECISIONS.md) me gaya), `Roka` (baad me).
- Owner ka jawab sawal ke neeche: sirf chuna hua vikalp aur DECISIONS ki link. Jawab badle to purani line hata ke nayi.
- Ek waqt me ek sawal; agla tabhi jab owner "next" kahe.

## Numbering

Q-001, Q-002 ... kram se. Topics B1, B2 ... kram se. Ek baar diya number kabhi badalta nahi aur dobara use nahi hota.

## 1. Aage ke topics

Topic sirf sawalon ki grouping hai; sawal phir bhi ek-ek karke aate hain. Har topic ke sawal us topic ki charcha (aur agent, jahan likha hai) ke baad likhe jayenge.

| Topic | Kya                                                                                     | Kaun gehrai me jayega                | Ab tak (2026-11-18)                                                                                                                                                                                                                                                         |
| ----- | --------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1    | Fulfilment aur logistics: apna warehouse aur delivery partners, courier, launch ka area | Domain expert                        | Zyadatar tay: D-014, D-015, D-016, D-022, D-027, D-033. Baaki: hub staff ki list me kya kam hai; pincodes ki jaanch (§2).                                                                                                                                                   |
| B2    | Apps aur roles: kitne apps, launch pe kaunse roles asli                                 | Architect                            | Tay: D-010, D-017, D-044, D-047, D-054.                                                                                                                                                                                                                                     |
| B3    | Catalog: variant, shade, size, ingredients, batch aur expiry, content ka maalik         | Domain expert                        | Tay: sirf beauty aur personal care (D-029), drug items kabhi nahi (D-043).                                                                                                                                                                                                  |
| B4    | Pricing, promotions, bundles aur kits                                                   | Domain expert                        | Promotions, coupons aur bundles R2 se (D-055).                                                                                                                                                                                                                              |
| B5    | Cart, checkout, order model (split, partial cancel aur return, exchange)                | Domain expert + Architect            | Guest cart nahi (D-020); payment ke raaste (D-034); ek order me kai sellers, invoice har seller ke GSTIN se (D-030, D-041).                                                                                                                                                 |
| B6    | Payments, refunds, settlement, ledger                                                   | Domain expert + Architect + Security | Finance ka database PostgreSQL (D-001), Neon pe (D-057). Baaki: finance ke design ke sawal: library, kaunsa data PostgreSQL me, events, backup ka format (R-009).                                                                                                           |
| B7    | Returns aur replacement: cosmetics ke hygiene niyam                                     | Domain expert                        | R1 me simple niyam: sirf band ya kharab maal ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1); poore niyam isi charcha me.                                                                                                                                                           |
| B8    | Reviews, ratings, UGC, moderation                                                       | Domain expert                        | Reviews R1 me (D-039); padhna bina sign-in, likhna sign-in se (D-020).                                                                                                                                                                                                      |
| B9    | Search, recommendations, virtual try-on                                                 | Domain expert + Architect            | Try-on aur recommendations R2 se (D-055); try-on ke saath camera permission (SR-001).                                                                                                                                                                                       |
| B10   | Loyalty, gift cards, store credit, subscriptions                                        | Domain expert                        | R2 se (D-055). Gift cards aur store credit ka faisla isi charcha me (owner, 2026-11-17): RBI ke prepaid (PPI) niyam lag sakte hain, jaancha nahi.                                                                                                                           |
| B11   | Support, disputes, notifications                                                        | Domain expert                        | Consultation flow aur Beauty Advisor ka message thread tay (D-025); support desk R2 se (D-055).                                                                                                                                                                             |
| B12   | Analytics aur reporting                                                                 | Architect                            | Finance ki poori reports R2 se (D-055).                                                                                                                                                                                                                                     |
| B13   | Compliance ki gehrai: kya dummy, kya asli                                               | Domain expert                        | Registrations aur kanooni details dummy (D-026); telemedicine ki dummy row (D-025); kanooni jaanch baad me ek agent se (R-004).                                                                                                                                             |
| B14   | Security: auth, authorization, payments, uploads, abuse, privacy                        | Security Architect                   | Aage bheje: kai apps me sign-in ka bojh (D-010); owner ke ~80 accounts pe authenticator ka bojh (D-017); customer ke email code sign-in ke niyam (D-021); consultation notes ki pahunch aur consent (D-025); alag services ki process security (D-011). Pehla niyam SR-001. |
| B15   | Technical: service boundaries, hosting, observability, backup, scale targets            | Architect                            | Tay: services aur databases (D-011, D-050), backup (D-013), hosting (D-028, D-048, D-049, D-051, D-052, D-056 se D-058), performance targets (D-053). Baaki: observability, scale targets, 512 MB me memory (R-007).                                                        |
| B16   | Docs aur task files ka dhaancha (PROJECT_PLAN, `tasks/NN-<module>/TASK.md`, subtasks)   | Owner ke saath                       | Tay: dhaancha (D-006), tareeka aur CI me docs ke paths ka check (D-019). Baaki: progress % ka niyam ([PROJECT_PLAN.md](PROJECT_PLAN.md) ke saath).                                                                                                                          |

## 2. Jaanchna baaki

Claude ka kaam: owner ka faisla nahi chahiye, sirf saboot. Nateeja saboot ke saath sahi file me jaata hai (jaise [RISKS.md](RISKS.md) §2).

| Kya                                                                                                                             | Kis faisle se | Kyun                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------- |
| Asli location data me main city ke pincodes kis hub pe, aur kitne pincodes do sub-districts, districts ya states me phaile hain | D-015, D-016  | Pincode → hub mapping; D-016 asli data dekh ke dobara khul sakta hai |

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
- **Iske baad (alag sawal):** warehouse me hamare haath se hue nuksaan ki bharpai kis daam pe hogi.
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
- **Iske baad (alag sawal):** ek hi product ke alag batches ka MRP alag ho to customer ko kaunsa MRP aur daam dikhe (B3); aur kya sab customers ke liye ek hi daam, ya Beauty Pro buyers (D-032) ke liye alag.
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
- **Iske baad (alag sawal):** bahut der se pada na bika maal: lambe samay ki storage fee ho ya nahi (B6); aur customer ko product page pe expiry dikhe ya nahi (B3).
- **Owner ka jawab (2026-11-18):** **(b)**, nuksaan brand ka, platform ke 6 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-062.

## Change log

| Version | Date       | Badlav                                                       |
| ------- | ---------- | ------------------------------------------------------------ |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                            |
| v1.1.1  | 2026-11-18 | §1 aage ke topics (B1 se B16) aur §2 jaanchna baaki bane.    |
| v1.2.1  | 2026-11-18 | §3 Sawal bana; Q-001 (warehouse me rakhe maal ka maalik).    |
| v1.2.2  | 2026-11-18 | Q-001 tay: (a) brand maalik (D-060).                         |
| v1.2.3  | 2026-11-18 | Q-002 (customer ko dikhne wala price kaun tay kare).         |
| v1.2.4  | 2026-11-18 | Q-002 tay: (c) brand + platform ke niyam (D-061).            |
| v1.2.5  | 2026-11-18 | Q-003 (expire hone wala ya na bika maal).                    |
| v1.2.6  | 2026-11-18 | Q-003 tay: (b) brand ka nuksaan + platform ke niyam (D-062). |
