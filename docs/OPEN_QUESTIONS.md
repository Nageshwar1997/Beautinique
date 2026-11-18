# OPEN QUESTIONS: Beautinique

> **Status:** v1.3.4 (2026-11-18). Khule sawal, aage ke topics aur jaanchna baaki. Cheezein ek-ek karke judengi.

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

- **Status:** `Khula`. Topic: B1 (warehouse), B3 (batch). **Group G1** (Q-037, Q-038): saath jawab dein.
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

### Q-038. Har variant pe brand ka barcode zaroori ho, ya platform apna label lagaye?

- **Status:** `Khula`. Topic: B3 (catalog), B1 (warehouse). **Group G1** (Q-037, Q-038): saath jawab dein.
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

### Q-039. Listing ka content kaun likhe, aur badlav pe dobara jaanch kab ho?

- **Status:** `Khula`. Topic: B3 (catalog). **Group G2** (Q-039, Q-040, Q-041): saath jawab dein.
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

### Q-040. Ingredients aur allergens kis roop me lein aur dikhayein?

- **Status:** `Khula`. Topic: B3 (catalog). **Group G2** (Q-039, Q-040, Q-041): saath jawab dein.
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

### Q-041. Product claims (vegan, SPF jaise) seller kaise kare, aur platform kya jaanche?

- **Status:** `Khula`. Topic: B3 (catalog). **Group G2** (Q-039, Q-040, Q-041): saath jawab dein.
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

### Q-042. Offers aur coupons ka paisa kaun de: brand, platform ya dono?

- **Status:** `Khula`. Topic: B4 (promotions). **Group G3** (Q-042, Q-043): saath jawab dein.
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

### Q-043. Ek item pe kai offers ek saath lag sakein?

- **Status:** `Khula`. Topic: B4 (promotions). **Group G3** (Q-042, Q-043): saath jawab dein.
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

### Q-044. Seller ke udhaar aur delivery partner se kaat ki seemaon ke number kya hon?

- **Status:** `Khula`. Topic: B6 (settlement). **Group G4** (Q-044, Q-045): saath jawab dein.
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

### Q-045. Delivery partner ki kamaai kaise bane?

- **Status:** `Khula`. Topic: B6 (settlement), B1 (delivery). **Group G4** (Q-044, Q-045): saath jawab dein.
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

### Q-046. R1 me return, daawe aur refund ki manzoori kaun sa staff kare?

- **Status:** `Khula`. Topic: B2 (roles), B11 (support). **Group G5** (Q-046, Q-047): saath jawab dein.
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

### Q-047. Toote, galat ya kam item ke daawe me customer se kya saboot lein?

- **Status:** `Khula`. Topic: B7 (returns). **Group G5** (Q-046, Q-047): saath jawab dein.
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

### Q-048. Customer se delivery fee lein ya nahi?

- **Status:** `Khula`. Topic: B4 (pricing), B5 (checkout). **Group G6** (Q-048 se Q-057): delivery, cancel, refund aur return ke sawal ek doosre pe tike hain; saath jawab dein.
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

### Q-049. Delivery na ho paaye to kitni koshish, aur phir kya (RTO)?

- **Status:** `Khula`. Topic: B1 (delivery). **Group G6** (Q-048 se Q-057): saath jawab dein.
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

### Q-050. Delivery pe UPI kise mile, kitni rakam tak, aur mana karne pe kya?

- **Status:** `Khula`. Topic: B5 (checkout), B6 (payments). **Group G6** (Q-048 se Q-057): saath jawab dein.
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

### Q-051. Customer order kab tak cancel kar sake, aur poora ya ek-ek item?

- **Status:** `Khula`. Topic: B5 (order). **Group G6** (Q-048 se Q-057): saath jawab dein.
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

### Q-052. Refund kis raaste jaaye, aur kab shuru ho?

- **Status:** `Khula`. Topic: B6 (payments). **Group G6** (Q-048 se Q-057): saath jawab dein.
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

### Q-053. Lauta maal kahan jaaye, aur nuksaan kiska?

- **Status:** `Khula`. Topic: B7 (returns). **Group G6** (Q-048 se Q-057): saath jawab dein.
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

### Q-054. Return pickup ke waqt delivery partner kya jaanche?

- **Status:** `Khula`. Topic: B7 (returns), B1 (delivery). **Group G6** (Q-048 se Q-057): saath jawab dein.
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

### Q-055. Return pickup ka kharcha customer se kate ya nahi?

- **Status:** `Khula`. Topic: B7 (returns). **Group G6** (Q-048 se Q-057): saath jawab dein.
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

### Q-056. Return ka refund kab ho: warehouse jaanch ke baad, ya kuch maamlon me pickup pe hi?

- **Status:** `Khula`. Topic: B7 (returns), B6 (payments). **Group G6** (Q-048 se Q-057): saath jawab dein.
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

### Q-057. Baar-baar return ya daawa karne wale customer pe kya ho?

- **Status:** `Khula`. Topic: B7 (returns), B11 (disputes). **Group G6** (Q-048 se Q-057): saath jawab dein.
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

## Change log

| Version | Date       | Badlav                                                                                                                     |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                          |
| v1.1.1  | 2026-11-18 | §1 aage ke topics (B1 se B16) aur §2 jaanchna baaki bane.                                                                  |
| v1.2.1  | 2026-11-18 | §3 Sawal bana; Q-001 (warehouse me rakhe maal ka maalik).                                                                  |
| v1.2.2  | 2026-11-18 | Q-001 tay: (a) brand maalik (D-060).                                                                                       |
| v1.2.3  | 2026-11-18 | Q-002 (customer ko dikhne wala price kaun tay kare).                                                                       |
| v1.2.4  | 2026-11-18 | Q-002 tay: (c) brand + platform ke niyam (D-061).                                                                          |
| v1.2.5  | 2026-11-18 | Q-003 (expire hone wala ya na bika maal).                                                                                  |
| v1.2.6  | 2026-11-18 | Q-003 tay: (b) brand ka nuksaan + platform ke niyam (D-062).                                                               |
| v1.2.7  | 2026-11-18 | Q-004 (hamare haath se hue nuksaan ki bharpai ka daam).                                                                    |
| v1.2.8  | 2026-11-18 | Q-004 tay: (b) bikne wala daam (D-063).                                                                                    |
| v1.2.9  | 2026-11-18 | Q-005 (alag batches ka alag MRP).                                                                                          |
| v1.2.10 | 2026-11-18 | Q-005 tay: (b) batch ke hisaab se (D-064).                                                                                 |
| v1.2.11 | 2026-11-18 | Q-006 (Beauty Pro buyers ka daam).                                                                                         |
| v1.2.12 | 2026-11-18 | Q-006 tay: (b) Pro daam (D-065); Q-007 (storage fee).                                                                      |
| v1.2.13 | 2026-11-18 | Q-007 tay: (c) muft, phir fee (D-066); Q-008 (product page pe expiry).                                                     |
| v1.2.14 | 2026-11-18 | Q-008 tay: (b) exact expiry (D-067); Q-009 (nuksaan ki vasooli).                                                           |
| v1.2.15 | 2026-11-18 | Q-009 tay: (b) saboot se vasooli (D-068); Q-010 (Beauty Pro ki jaanch).                                                    |
| v1.2.16 | 2026-11-18 | Q-010 tay: (b) saboot + staff (D-069); Q-011 (Pro daam ki quantity seema).                                                 |
| v1.2.17 | 2026-11-18 | Q-011 tay: (b) seller tay kare (D-070).                                                                                    |
| v1.2.18 | 2026-11-18 | Q-012 (bachi fee) aur Q-013 (parcel nahi mila par "delivered").                                                            |
| v1.2.19 | 2026-11-18 | Q-012 tay: (b) seema ke baad kadam (D-071).                                                                                |
| v1.2.20 | 2026-11-18 | Q-013 tay: (b) saboot se faisla (D-072).                                                                                   |
| v1.2.21 | 2026-11-18 | Q-014 (pehle ka kaam kab aur kaise hatega).                                                                                |
| v1.2.22 | 2026-11-18 | Q-014 tay: (b) do kadam me (D-073).                                                                                        |
| v1.2.23 | 2026-11-18 | Q-015 (pehle ke kaam se kya naye me aaye, list kab aur kaise).                                                             |
| v1.2.24 | 2026-11-18 | Q-015 tay: (b) chalti list discovery ke saath (D-074).                                                                     |
| v1.2.25 | 2026-11-18 | Q-016 (ek brand ka maal kai sellers bechna chahein).                                                                       |
| v1.2.26 | 2026-11-18 | Q-016 tay: (a) ek brand, ek seller (D-075); Q-017 (variants kin cheezon se).                                               |
| v1.2.27 | 2026-11-18 | Q-017 tay: (b) category ke hisaab se (D-076); Q-018 (kai sellers wala order aur parcel).                                   |
| v1.2.28 | 2026-11-18 | Q-018 tay: (c) normal ek parcel (D-077); Q-019 (seller ki fees aur commission ka aadhaar).                                 |
| v1.2.29 | 2026-11-18 | Q-019 tay: (b) + (ii) (D-078); Q-020 (return ki wajahein aur "band" ka matlab).                                            |
| v1.2.30 | 2026-11-18 | Q-020 tay: (b) man badla sirf band maal pe (D-079); Q-021 (return ki samay-seema).                                         |
| v1.2.31 | 2026-11-18 | Q-021 tay: (b) wajah ke hisaab se (D-080); Q-022 (seller ka paisa kab payable, payout).                                    |
| v1.2.32 | 2026-11-18 | Q-022 tay: (b) samay-seema ke baad, hafte me payout (D-081); Q-023 (expiry ki seemaon ke number).                          |
| v1.2.33 | 2026-11-18 | Q-023 tay: (b) default + category override (D-082); Q-024 (pack pe expiry date na ho to).                                  |
| v1.3.1  | 2026-11-18 | Niyam badla (owner): bina dependency wale sawal ek saath; har sawal se "Iske baad" aur agle sawal ke zikr hataye.          |
| v1.3.2  | 2026-11-18 | Q-025 se Q-036 ek saath (kisi khule sawal pe tike nahi).                                                                   |
| v1.3.3  | 2026-11-18 | Q-024 se Q-036 tay: owner ne saari salah maani (D-083 se D-095).                                                           |
| v1.3.4  | 2026-11-18 | Q-037 se Q-057: aapas me jude sawal 6 group (G1 se G6) me ek saath (owner ne group ka tareeka chuna); group ka niyam upar. |
