# OPEN QUESTIONS: Beautinique

> **Status:** v1.2.30 (2026-11-18). Khule sawal, aage ke topics aur jaanchna baaki. Cheezein ek-ek karke judengi.

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
- **Iske baad (alag sawal):** nuksaan transporter (D-027) ya delivery partner ke haath se hua ho to hum unse vasooli karein ya nahi, aur kaise.
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
- **Iske baad (alag sawal):** Beauty Pro buyer ki jaanch (verification) kaise ho; aur Pro buyer pe quantity ki seema ho ya nahi.
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
- **Iske baad (alag sawal):** seller ka payout fee se kam pade (bikri na ho) to bachi fee ka kya ho.
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
- **Iske baad (alag sawal):** customer kahe parcel nahi mila jabki delivery partner ne "delivered" kiya: kaun sahi, kaise tay ho (B11).
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
- **Iske baad (alag sawal):** pehle ke kaam ki kaunsi cheezein (jaise achhe patterns, design ke tokens) naye me laani hain, aur uski list kab aur kaise bane.
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
- **Iske baad:** kram ka koi sawal baaki nahi; agla kaam Agent 2, owner ki haan se.
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
- **Iske baad (kram ka agla sawal):** ek product ke variants kin cheezon se banen (shade, size, scent), aur ye kaun tay kare.
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
- **Iske baad (kram ka agla sawal):** ek order me kai sellers ka maal ho to wo ek parcel me jaaye ya alag-alag, aur order ka dhaancha kya ho.
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
- **Iske baad (kram ka agla sawal):** seller se kaunsi fees li jaayen, aur commission kis rakam pe lage.
- **Owner ka jawab (2026-11-18):** **(c)**, normal ek parcel, majboori me alag (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-077.

### Q-019. Seller se kaunsi fees li jaayen, aur commission kis rakam pe lage?

- **Status:** `Tay`. Topic: B6 (payments aur settlement).
- **Sawal:** platform seller se kaunsi fees le, aur commission item ke daam (GST samet) pe lage ya taxable value (GST ke bina) pe? Yahan sirf fees ki kisme aur aadhaar; rakam (dummy) kram me aage alag sawal hai.
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
- **Iske baad (kram ka agla sawal):** customer kis wajah se return kar sake, aur cosmetics me "band" (sealed) ka matlab kya ho.
- **Owner ka jawab (2026-11-18):** **(b)** aur aadhaar **(ii)**: commission + fulfilment fee, commission GST ke bina wali rakam pe (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-078.

### Q-020. Customer kin wajahon se return kar sake, aur "band" maal ka matlab kya ho?

- **Status:** `Tay`. Topic: B7 (returns).
- **Sawal:** kin wajahon pe return maana jaaye? Kya "man badla" bhi chale, aur chale to kis shart pe? R1 ka niyam "sirf band ya kharab maal" hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), par "band" ka matlab tay nahi.
- **Kyun zaroori:**
  - Khula cosmetic dobara nahi bik sakta (hygiene), to galat niyam se ya to customer ke saath na-insaafi hoti hai, ya khula maal nasht hota hai.
  - R1 ka return flow isi list pe chalta hai, aur aage ke sawal bhi isi pe tikte hain: return ki samay-seema, return ka kharcha, aur lauta maal kahan jaaye.
  - Kuch products pe factory seal aata hi nahi (jaise kai compacts aur lip balms); unke liye niyam alag chahiye.
- **Vikalp:**
  - **(a) Sirf hamari ya brand ki galti:** transit me toota ya leak, pighla, galat item ya galat shade ya size, item kam, dikhayi gayi se pehle ki expiry (D-067), kharab (jaise pump nahi chalta), ya nakli hone ka shak (staff jaanch). "Man badla" bilkul nahi.
  - **(b) (a) + man badla, sirf band maal pe:**
    1. (a) ki saari wajahein.
    2. "Band" = factory seal ya shrink wrap salamat, aur maal istemaal nahi hua.
    3. Listing pe seller batata hai ki product pe aisa seal aata hai ya nahi; staff listing ki jaanch me ise dekhta hai.
    4. Jis product pe seal aata hi nahi, us pe "man badla" return nahi (hygiene); galti wali wajahein phir bhi chalti hain.
    5. Khula maal jisme koi galti nahi: return nahi. Skin reaction ki shikayat ka raasta alag sawal hai (kram me aage).
  - **(c) (b) + kuch khula maal bhi:** jaise foundation ka shade galat laga to thoda istemaal kiya maal bhi wapas ("shade guarantee").
- **Salah:** **(b)**. R1 ka "band ya kharab" isi ka saaf roop hai, aur listing ka seal wala field ek hi baar me hygiene ka sawal hal karta hai.
- **Trade-off:**
  - (a) customer ke liye kadi: jo maal khola hi nahi, wo bhi wapas nahi hota.
  - (b) me pickup aur warehouse pe seal ki jaanch, aur listing me ek naya field.
  - (c) customer ke liye sabse achha, par khula maal nasht hota hai: nuksaan bada, aur galat istemaal aasaan.
- **Kanooni detail jaanchi nahi** (R-004): return policy dikhane ke niyam, aur khule cosmetics pe "no return" ki shartein.
- **Iske baad (kram ka agla sawal):** return kitne din tak ho sake (wajah ke hisaab se samay-seema).
- **Owner ka jawab (2026-11-18):** **(b)**, galti wali saari wajahein, aur "man badla" sirf band maal pe (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-079.

### Q-021. Return kitne din tak maanga ja sake?

- **Status:** `Khula`. Topic: B7 (returns), B6 (settlement).
- **Sawal:** delivery ke kitne din tak customer return maang sake? Sab wajahon pe ek hi samay, ya wajah ke hisaab se alag (D-079 ki wajahein)?
- **Kyun zaroori:**
  - Transit me toota ya item kam ka daawa jitna jaldi aaye, saboot utna sach hota hai; der se aaye daawe me ye pata karna mushkil hai ki nuksaan kahan hua.
  - Seller ka paisa kab payable ho, ye kram ka agla sawal hai, aur return ki samay-seema us pe asar daalti hai: jitni lambi seema, utni der seller ka paisa ruk sakta hai.
  - "Parcel nahi mila" ke daawe ka samay pehle se misaal 48 ghante hai (D-072); baaki wajahon ka samay tay nahi.
- **Vikalp:**
  - **(a) Sab wajahon pe ek hi samay:** 7 din.
  - **(b) Wajah ke hisaab se:**
    1. Dikhne wali galti (toota, leak, pighla, item kam, galat item ya shade ya size): delivery ke 48 ghante tak (misaal), D-072 ke daawe jaisa.
    2. Kharab maal (jaise pump nahi chalta) aur dikhayi gayi se pehle ki expiry: 7 din tak (misaal).
    3. Man badla (sirf band maal, D-079): 7 din tak (misaal).
    4. Nakli hone ka shak: 7 din tak (misaal), staff ki jaanch ke saath.
    5. Samay-seema ke baad kisi batch me dikkat nikle to recall ka raasta (kram me aage alag sawal).
  - **(c) Sab wajahon pe 15 din.**
- **Salah:** **(b)**. Dikhne wali galti jaldi pakdi jaati hai, to saboot sach rehta hai; baaki wajahon me customer ko poora mauka milta hai, aur seller ka paisa bahut der nahi rukta.
- **Trade-off:**
  - (a) saral, par transit ki galti ka daawa 7 din baad tak aa sakta hai, jab saboot kamzor hota hai.
  - (b) me alag-alag samay customer ko samjhane padte hain; product page aur order page pe saaf dikhna chahiye.
  - (c) customer ke liye achha, par seller ka paisa der tak rukta hai aur daawe ka saboot kamzor hota hai.
- **Kanooni detail jaanchi nahi** (R-004): return ki kam se kam samay-seema ke niyam (agar koi ho), aur kharab maal pe customer ke haq.
- **Iske baad (kram ka agla sawal):** seller ka paisa kab payable ho, aur payout kitni baar ho.

## Change log

| Version | Date       | Badlav                                                                     |
| ------- | ---------- | -------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                          |
| v1.1.1  | 2026-11-18 | §1 aage ke topics (B1 se B16) aur §2 jaanchna baaki bane.                  |
| v1.2.1  | 2026-11-18 | §3 Sawal bana; Q-001 (warehouse me rakhe maal ka maalik).                  |
| v1.2.2  | 2026-11-18 | Q-001 tay: (a) brand maalik (D-060).                                       |
| v1.2.3  | 2026-11-18 | Q-002 (customer ko dikhne wala price kaun tay kare).                       |
| v1.2.4  | 2026-11-18 | Q-002 tay: (c) brand + platform ke niyam (D-061).                          |
| v1.2.5  | 2026-11-18 | Q-003 (expire hone wala ya na bika maal).                                  |
| v1.2.6  | 2026-11-18 | Q-003 tay: (b) brand ka nuksaan + platform ke niyam (D-062).               |
| v1.2.7  | 2026-11-18 | Q-004 (hamare haath se hue nuksaan ki bharpai ka daam).                    |
| v1.2.8  | 2026-11-18 | Q-004 tay: (b) bikne wala daam (D-063).                                    |
| v1.2.9  | 2026-11-18 | Q-005 (alag batches ka alag MRP).                                          |
| v1.2.10 | 2026-11-18 | Q-005 tay: (b) batch ke hisaab se (D-064).                                 |
| v1.2.11 | 2026-11-18 | Q-006 (Beauty Pro buyers ka daam).                                         |
| v1.2.12 | 2026-11-18 | Q-006 tay: (b) Pro daam (D-065); Q-007 (storage fee).                      |
| v1.2.13 | 2026-11-18 | Q-007 tay: (c) muft, phir fee (D-066); Q-008 (product page pe expiry).     |
| v1.2.14 | 2026-11-18 | Q-008 tay: (b) exact expiry (D-067); Q-009 (nuksaan ki vasooli).           |
| v1.2.15 | 2026-11-18 | Q-009 tay: (b) saboot se vasooli (D-068); Q-010 (Beauty Pro ki jaanch).    |
| v1.2.16 | 2026-11-18 | Q-010 tay: (b) saboot + staff (D-069); Q-011 (Pro daam ki quantity seema). |
| v1.2.17 | 2026-11-18 | Q-011 tay: (b) seller tay kare (D-070).                                    |
| v1.2.18 | 2026-11-18 | Q-012 (bachi fee) aur Q-013 (parcel nahi mila par "delivered").            |
| v1.2.19 | 2026-11-18 | Q-012 tay: (b) seema ke baad kadam (D-071).                                |
| v1.2.20 | 2026-11-18 | Q-013 tay: (b) saboot se faisla (D-072).                                   |
| v1.2.21 | 2026-11-18 | Q-014 (pehle ka kaam kab aur kaise hatega).                                |
| v1.2.22 | 2026-11-18 | Q-014 tay: (b) do kadam me (D-073).                                        |
| v1.2.23 | 2026-11-18 | Q-015 (pehle ke kaam se kya naye me aaye, list kab aur kaise).             |
| v1.2.24 | 2026-11-18 | Q-015 tay: (b) chalti list discovery ke saath (D-074).                     |
| v1.2.25 | 2026-11-18 | Q-016 (ek brand ka maal kai sellers bechna chahein). |
| v1.2.26 | 2026-11-18 | Q-016 tay: (a) ek brand, ek seller (D-075); Q-017 (variants kin cheezon se). |
| v1.2.27 | 2026-11-18 | Q-017 tay: (b) category ke hisaab se (D-076); Q-018 (kai sellers wala order aur parcel). |
| v1.2.28 | 2026-11-18 | Q-018 tay: (c) normal ek parcel (D-077); Q-019 (seller ki fees aur commission ka aadhaar). |
| v1.2.29 | 2026-11-18 | Q-019 tay: (b) + (ii) (D-078); Q-020 (return ki wajahein aur "band" ka matlab). |
| v1.2.30 | 2026-11-18 | Q-020 tay: (b) man badla sirf band maal pe (D-079); Q-021 (return ki samay-seema). |
