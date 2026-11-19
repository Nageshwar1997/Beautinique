# BUSINESS DOMAIN ANALYSIS: Beautinique (B8 se B13)

> **Status:** v1.0.0 (2026-11-19). Agent 2 run 2: B8 se B13.

## 0. Kaise padhein

- Ye Agent 2 (Business Analyst + cosmetics domain expert) ki report hai, doosra run: topics B8 se B13 ([OPEN_QUESTIONS.md](../../docs/OPEN_QUESTIONS.md) §1). Pehla run (B1 se B7) [BUSINESS_DOMAIN_ANALYSIS.md](BUSINESS_DOMAIN_ANALYSIS.md) me hai.
- **Ye faisla nahi hai.** Har sawal sirf prastaav hai; main session jaanch ke owner se poochhega. "Salah" Claude ki raay hai, faisla nahi.
- Tay faisle (D-001 se D-132, Q-001 se Q-073) dobara sawal nahi bane. Unme jokhim ya kami dikhi to sirf §10 me.
- Sawalon ke ID `B8-1` jaise (topic + kram); Q number main session dega. Sawal ka text aur vikalp apne aap me poore hain: unme doosre prastaavit sawal ka zikr nahi. Jod sirf **Kis par tika** me, aur §7 me batches.
- Har topic section: **Ab tak tay**, **Domain gaps**, **Proposed sawal** (sabse rokne wala pehle), **Pehle ke kaam se lene layak** (D-074 niyam 2).
- Saare numbers **misaal** hain jab tak owner na kahe. Koi kanooni baat jaanchi nahi: har jagah "Kanooni detail jaanchi nahi (R-004)".
- R1 ya baad me: D-055 aur [PROJECT_PLAN.md](../../docs/PROJECT_PLAN.md) §1 ke hisaab se. Jo R1 me naya jod maange, wo saaf likha hai.
- Ye report purane kaam ke paths le sakti hai (ye naya doc nahi). §8 ke prastaav naye docs ke liye hain, isliye unme purane kaam ka zikr nahi.

## 1. B8: Reviews, ratings, UGC aur moderation

### 1.1 Ab tak tay

D-039 (ratings aur reviews R1 me), D-020 (padhna bina sign-in, likhna sign-in se), D-055 aur [PROJECT_PLAN.md](../../docs/PROJECT_PLAN.md) §1 #10 (delivery ke baad verified purchase review), D-076 niyam 5 (rating product pe saare variants ke saath, har review pe uska variant), D-031 (apna brand bhi baaki sellers jaisa, koi shortcut nahi), D-047 (Trust & Safety Lead alag account pe), D-084 niyam 3 (jisne reject kiya wo appeal tay nahi karta; seller aur listing ke liye), D-098 niyam 3 (staff seller ka content khud nahi badalta), D-121 (samples aur gifts R2 se, invoice pe ₹0 line), D-130 (skin reaction ka case R2 se).

### 1.2 Domain gaps

- **Haq ke kinare:** verified purchase tay hai, par lauta hua item, RTO (D-108), cancel (D-110), Pro daam wali line (D-065), ek product ke kai orders aur review ka window tay nahi. Isi se review ka data model banta hai (order line se bandha ya customer + product se).
- **Moderation:** pehle jaanch ya baad me, kaun sa role, kya hata sakte aur kya kabhi nahi. Negative review dabana bharose aur kanoon dono ka jokhim (Kanooni detail jaanchi nahi (R-004)). Cosmetics ke khaas maamle: review me skin reaction ka zikr (D-130 se jod), "acne theek ho gayi" jaise ilaaj ke daawe (D-043 aur D-128 ki soch), delivery ki shikayat product review me (delivery hamari hai, D-014).
- **Photo reviews:** skin pe lagaye shade ki asli photo cosmetics me sabse kaam ki jaankari; par photo me chehra, ghar ya address label aa sakta. Photos database me nahi (R-006).
- **Incentive:** brand ke samples (D-121), creators ko brand ka bheja maal (Creator app, D-010), aur aage loyalty me "review pe points".
- **Seller ka jawab:** brand ka public jawab bharosa badhata, par brand customer pe review hatane ka dabaav bhi daal sakta.
- **Reviewer ki jaankari:** "meri jaisi skin wale ko kaisa laga" (skin type, undertone, umar ka group) cosmetics ka sabse aam sawal; shade (D-076) ke alawa koi filter tay nahi.
- **Q&A:** public sawal-jawab aur Beauty Advisor ka private thread (D-025) alag cheezein.
- **Nakli review:** brand ke log khud order karke review, ek insaan ke kai accounts (`+` alias, D-017), aur demo me owner ke apne customer accounts ke reviews (§10 point 4).
- **Formula badalna:** brand usi product ka formula badle (D-098 ki jaanch), to purane reviews nayi tasveer bigaad sakte.
- **Review ki yaad:** kab aur kis raaste (300 emails, D-126); B11 ke non-order khabron ke sawal me.
- **Rating dikhana:** kitne reviews pe rating dikhe, star ka bantwara, "helpful" vote: UX aur Architect (§9).

### 1.3 Proposed sawal

#### B8-1. Review ka haq: kin lines pe, kab tak, kitni baar

- **Sawal:** verified purchase review me review ka haq kin order lines pe ho, kitne din tak, aur ek customer ek product pe kitne review likh sake?
- **Kyun zaroori:** R1 me delivery ke baad verified review tay hai (D-055), par kinare tay nahi. Lauta hua item, RTO ya cancel line, Pro daam wali line aur ek product ke kai orders: inse review ka data model aur rating ki ginti banti hai. Review pe variant dikhana (D-076 niyam 5) bhi order line se hi aata hai.
- **Vikalp:**
  - **(a) Har line, har baar:** har delivered order line pe ek review; ek product ke kai orders = kai reviews; window delivery se 180 din (misaal).
  - **(b) Ek customer, ek product, ek review:**
    1. Haq kisi bhi delivered line se, lauta hua item bhi (return ke baad bhi raay de sake). Cancel aur RTO line pe nahi.
    2. Pro daam wali line (D-065) pe bhi review.
    3. Review pe us line ka variant. Dobara kharid pe naya review nahi: purana review edit ho (variant nayi line ka chun sake), aur "kai baar kharida" ka nishaan.
    4. Window delivery se 365 din (misaal).
    5. Customer kabhi bhi edit ya delete kare; edit dobara moderation se; har version ka record.
  - **(c) Har line pe review, rating me aakhri:** har order pe naya review dikhe, par rating me har customer ka sirf aakhri review gine.
- **Salah:** **(b)**. Ek insaan ki ek awaaz: baar-baar kharidne wala rating ko jhuka nahi sakta, aur dobara kharid pe customer apni raay taaza kar sakta hai. Lauta hua item pe review rokna negative raay dabane jaisa lagta.
- **Trade-off:** (a) me zyada kharidne wale ka asar zyada; (b) me edit ka itihaas rakhna, aur lautaye item ke negative reviews aayenge (jo sach hain); (c) me do tarah ki ginti samjhana mushkil.
- **Kanooni detail jaanchi nahi (R-004):** verified review aur negative review na dabane ke niyam.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-055, D-065, D-076, D-108, D-110. Koi khula sawal nahi.

#### B8-2. Moderation ka tareeka: kab jaanch aur kaun

- **Sawal:** review live hone se pehle staff jaanche, ya pehle live ho aur baad me jaanch ho; aur ye kaam kis staff role ke paas ho?
- **Kyun zaroori:** R1 me reviews hain (D-039) aur staff ek hi insaan (D-009). Har review haath se jaanchna bhaari hai, par gaali, kisi ka phone ya address, ya nakli review live rehna jokhim hai. Roles ki list (D-017) me role aur uska app (D-010) chahiye.
- **Vikalp:**
  - **(a) Sab pehle jaanch:** har review staff ke "approve" ke baad live; faisla misaal 2 kaam ke din me.
  - **(b) Mila-jula:**
    1. Sirf star rating (bina text) turant live.
    2. Text wala review apne aap ki jaanch se guzre (gaali ke shabdon ki list, phone, email ya link jaisa pattern, lambai): paas to turant live, atka to staff ki queue.
    3. Photo wala review hamesha queue me.
    4. Report hua review live rahe jab tak faisla na ho; sirf personal data ya intimate content ki report pe faisle tak chhupe.
    5. Queue ka faisla misaal 2 kaam ke din me.
    6. Har chhupana aur wapas dikhana wajah ke saath, audit me, aur wapas ho sake.
    7. Role "Review Moderator": poore desh ki ek team (D-084 jaisa), Admin app me.
  - **(c) Sab turant live:** jaanch sirf report hone pe.
- **Salah:** **(b)**. Zyadatar reviews bina staff ke live, aur jokhim wale (photo, atke, report hue) hi staff tak. Ek insaan ka bojh kam rehta hai.
- **Trade-off:** (a) me ek insaan pe bojh aur customer ka intezaar; (b) me shabdon ki list aur jaanch ka kaam, aur kuch galat review thodi der live; (c) me galat content der tak live.
- **Kanooni detail jaanchi nahi (R-004):** reviews jaise user content pe platform ki zimmedari aur hatane ke samay.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-009, D-010, D-017, D-084. Koi khula sawal nahi.

#### B8-3. Review me kya chhupaya ja sake, kya kabhi nahi

- **Sawal:** moderation ke niyam kya hon: kis wajah se review chhupaya ja sake, aur kis wajah se kabhi nahi?
- **Kyun zaroori:** negative review chhupana customer ke saath dhokha hai; galat content rakhna bhi jokhim hai. Cosmetics me teen khaas maamle: review me skin reaction ki baat (D-130), ilaaj jaisa daawa ("is cream se meri acne theek ho gayi", jo product ko dawa jaisa dikhata, D-043, D-128), aur delivery ya packaging ki shikayat (delivery hamari, D-014; rating brand ki girti).
- **Vikalp:**
  - **(a) Tay list, negative kabhi wajah nahi:**
    1. Chhupane ki wajahein sirf: gaali, nafrat ya dhamki; kisi ka personal data (phone, email, address, order number); spam, link ya doosre product ya site ka prachaar; product se bilkul alag baat; nakli ya khel wala review; intimate ya kisi aur ki photo; kanooni order.
    2. Kabhi wajah nahi: kam rating, kadwi raay, brand ki aalochna, "mujhe reaction hua".
    3. Skin reaction wala review rahe, aur customer ko support ka raasta dikhe (D-130).
    4. Ilaaj jaise daawe wale review rahein; saare reviews ke upar ek tay note: "Reviews customers ki apni raay hain, ilaaj ka daawa nahi."
    5. Delivery ya packaging ki shikayat review me rahe (customer ka asli anubhav).
    6. Customer ko chhupane ki wajah dikhe; wo badal ke dobara bhej sake; ek appeal, faisla doosra moderator kare (D-084 niyam 3 jaisa).
  - **(b) (a), par delivery ki shikayat bahar:** delivery ya packaging ki shikayat wale review product ki rating se bahar, aur customer ko delivery feedback me bheja jaaye.
  - **(c) Staff ki samajh:** koi tay list nahi.
- **Salah:** **(a)**. Ek jaisa faisla, aur negative raay ki suraksha saaf. Delivery ki shikayat se brand ki rating thodi girti dikhegi, par review ko "shift" karna customer ki raay se chhed jaisa hai.
- **Trade-off:** (a) me brand ki rating pe hamari delivery ka asar; (b) me customer ka review uski marzi ke bina dusri jagah; (c) me har moderator ka alag faisla.
- **Kanooni detail jaanchi nahi (R-004):** negative review chhupane ke niyam, review me ilaaj ke daawe, user content hatane ke niyam.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-014, D-043, D-084, D-128, D-130. Koi khula sawal nahi.

#### B8-4. Review me customer ki photo

- **Sawal:** review me customer photo jod sake ya nahi, aur kab se?
- **Kyun zaroori:** skin pe lagaye shade ki asli photo cosmetics me sabse kaam ki jaankari hai, aur khareedne se pehle shade ka darr kam karti. Par photo me chehra, ghar, address label ya twacha ki bimari aa sakti hai; har photo jaanchni padegi. Photo upload ka raasta R1 me daawe ke liye pehle se ban raha hai (D-106).
- **Vikalp:**
  - **(a) R2 se:** R1 me sirf text aur star; photo R2 me, har photo staff jaanch ke baad.
  - **(b) R1 se, har photo jaanch ke baad:** ek review me zyada se zyada 3 photos (misaal); har photo staff ki jaanch ke baad live; chehra dikhe to customer ka "ye meri photo hai aur dikhane ki ijazat hai" tick zaroori; address label, doosre insaan ya intimate photo pe reject; video nahi.
  - **(c) Photo aur video R1 se.**
- **Salah:** **(b)**. Upload ka kaam R1 me pehle se hai, har photo jaanch se guzarti hai to jokhim kam, aur R1 me do sellers ke saath photo kam hongi. Video nahi: jagah, data aur jaanch ka bojh.
- **Trade-off:** (a) me R1 ke reviews kam kaam ke; (b) me har photo ek insaan ki queue me; (c) me video ki jagah aur jaanch ₹0 (D-028) pe bhaari.
- **Kanooni detail jaanchi nahi (R-004):** customer ki photo (chehra) rakhne aur dikhane ki consent.
- **R1 ya baad me:** (b) me R1 me chhota jod (owner ki haan se).
- **Kis par tika:** D-028, D-106. Koi khula sawal nahi.

#### B8-5. Muft mila product aur review ke badle inaam

- **Sawal:** jis customer ko product muft mila (brand ka sample ya gift, creator ko brand ka bheja product) ya jise review ke badle kuch mile, uske review ka niyam kya ho?
- **Kyun zaroori:** muft ya inaam wale reviews rating ko upar jhukate hain, aur chhupa inaam customer ke saath dhokha hai. Samples aur gifts (D-121) R2 me aate hain, creators ka kaam Creator app (D-010) me, aur aage loyalty me "review pe points" aam tareeka hai.
- **Vikalp:**
  - **(a) Koi inaam nahi:** ₹0 wali line (sample ya gift, D-121) pe review ka haq nahi; review ke badle koi points, coupon ya inaam nahi (na platform, na brand); brand customer se review ke liye seedha sampark nahi kar sakta.
  - **(b) Label ke saath:**
    1. ₹0 wali line ya brand ke bheje product pe review ho sake, "Muft mila product" label ke saath.
    2. Inaam sirf review likhne pe, rating dekh ke kabhi nahi; label "Inaam mila".
    3. Label wale reviews rating me nahi gine jaate, alag dikhte hain.
    4. Brand khud inaam nahi de sakta, sirf platform ke program se.
  - **(c) Inaam, bina label.**
- **Salah:** **(a)**. Sabse saaf aur sabse zyada bharosa. Baad me loyalty me review ke points chahiye hon to (b) ka label wala raasta khula hai.
- **Trade-off:** (a) me reviews kam aate; (b) me label, alag ginti aur inaam ke niyam; (c) me bharosa aur kanoon dono ka jokhim.
- **Kanooni detail jaanchi nahi (R-004):** inaam ya muft product wale review aur endorsement ke label ke niyam.
- **R1 ya baad me:** niyam R1 se (R1 me ₹0 line nahi aati, par rok code me); (b) chuna to label ka kaam R2 se.
- **Kis par tika:** D-010, D-121. Koi khula sawal nahi.

#### B8-6. Seller ka jawab aur seller ki shikayat

- **Sawal:** brand (seller) kisi review ka public jawab de sake ya nahi, aur kisi review ko galat maane to kya kar sake?
- **Kyun zaroori:** brand ka jawab ("is shade ke liye ye try karein", "batch dekh rahe hain") customer ka bharosa badhata hai. Par brand reviewer pe review hatane ka dabaav daal sakta, ya apne khilaaf review hatwane ki koshish kar sakta. Apna brand (D-031) bhi isi niyam me.
- **Vikalp:**
  - **(a) Jawab nahi:** seller sirf apne products ke reviews dekhe aur report kare.
  - **(b) Ek public jawab, niyam ke saath:**
    1. Har review pe ek jawab (edit ho sake), reviews wale moderation niyam se.
    2. Seller ko reviewer ka sirf chhota naam dikhe, koi contact detail kabhi nahi.
    3. Seller report kare (wajah ke saath), faisla moderator ka; seller review hata ya badal nahi sakta.
    4. Jawab me coupon, offer ya bahar sampark ka raasta nahi.
  - **(c) Jawab bina moderation.**
- **Salah:** **(b)**. Brand ki baat aur customer ki suraksha dono.
- **Trade-off:** (a) me brand ki baat nahi pahunchti; (b) me jawab bhi moderation ki queue me; (c) me brand ka jawab bina jaanch live.
- **R1 ya baad me:** reviews dekhna R1 me (seller app); jawab aur report R2 se.
- **Kis par tika:** D-031. Koi khula sawal nahi.

#### B8-7. Reviewer ki skin jaankari aur "meri jaisi skin" filter

- **Sawal:** review ke saath customer apni skin type, depth aur undertone, aur umar ka group (sab optional) bata sake, aur product page pe reviews inse filter ho sakein?
- **Kyun zaroori:** cosmetics me "meri jaisi skin wale ko kaisa laga" sabse aam sawal hai. Variant (shade) review pe pehle se tay hai (D-076 niyam 5), par oily ya sensitive skin, ya undertone ka filter nahi. Ye personal data hai; skin ki bimari (acne, eczema) sehat ke paas ka data hai. D-038 me sirf 18+ ki ghoshna hai, umar ka group naya data.
- **Vikalp:**
  - **(a) Sirf variant:** review pe variant dikhe aur usi ka filter.
  - **(b) Optional fields, platform ki list se:** skin type (oily, dry, combination, normal, sensitive), depth aur undertone (D-085 ki list), umar ka group (misaal 18 se 24, 25 se 34, 35 se 44, 45+); review pe dikhe aur inse filter; skin ki bimari ka koi field nahi; customer ne apni jaankari pehle se save ki ho to wahan se pehle se bhara.
  - **(c) (b) + concerns** (acne, pigmentation jaise) bhi.
- **Salah:** **(b)**. Sabse kaam ka filter, aur sehat wala data bahar.
- **Trade-off:** (a) me shade ke alawa koi madad nahi; (b) me thoda aur personal data aur uski consent; (c) me sehat ke paas ka data public review pe.
- **Kanooni detail jaanchi nahi (R-004):** review ke saath dikhne wala personal data.
- **R1 ya baad me:** R2 (R1 me sirf variant).
- **Kis par tika:** D-038, D-076, D-085. Koi khula sawal nahi.

#### B8-8. Product pe sawal-jawab (Q&A)

- **Sawal:** product page pe customer public sawal pooch sake ("kya ye oily skin pe chalega?"), aur jawab kaun de?
- **Kyun zaroori:** kharidne se pehle ka sawal aam hai. Beauty Advisor ka message thread (D-025) private hai: ek customer ka sawal, ek ka jawab. Public Q&A ka ek jawab sabke kaam aata hai, par moderation ka bojh aur sehat ki galat salah ka jokhim.
- **Vikalp:**
  - **(a) Public Q&A nahi:** sawal Beauty Advisor ke thread (D-025) se.
  - **(b) Public Q&A:** sawal sign-in se; jawab brand (seller) aur us product ke verified buyers de sakein; brand ke jawab pe "Brand" label; har sawal aur jawab reviews wale moderation niyam se; ilaaj ya dawa jaise sawal pe tay jawab "Skin & Hair Expert se salah lein" (D-025).
  - **(c) Sirf brand jawab de.**
- **Salah:** **(b)**, R2 me. Ek jawab bahut logon ke kaam aata, aur Advisor pe bojh kam hota.
- **Trade-off:** (a) me har customer ko alag poochhna padta; (b) me moderation ka aur kaam; (c) me brand ke jawab ki der aur ek-tarfa jaankari.
- **R1 ya baad me:** R2.
- **Kis par tika:** D-025. Koi khula sawal nahi.

#### B8-9. Nakli review pakda jaaye to karwai

- **Sawal:** nakli review ya rating ke saath khel (brand ke log khud order karke review, paid reviews, ek insaan ke kai accounts) pakda jaaye to kis pe kya karwai ho?
- **Kyun zaroori:** verified purchase se bhi khel ho sakta: brand khud kam daam ke orders karke review likhe. Apna brand (D-031) bhi isi niyam me. Ek insaan ke kai email (`+` alias, D-017) se kai accounts aasaan hain.
- **Vikalp:**
  - **(a) Sirf review hatao.**
  - **(b) Seedhi karwai:**
    1. Review hatao, wajah ke record ke saath.
    2. Customer: pehli baar chetavni; dobara to review likhna band (misaal 6 mahine); staff wajah ke saath khol sake.
    3. Seller: brand ke staff ya brand ke kahe pe review sabit ho to chetavni; dobara to us brand ki listings rokna, aur aage account band, Trust & Safety ke faisle se (D-047).
    4. Kisi product ke bahut reviews hatein to uski rating dobara gini jaaye, aur seller ko wajah dikhe.
    5. Seller app ke users (brand ka staff) apne brand ke product pe review nahi likh sakte (system rok).
  - **(c) Account turant band.**
- **Salah:** **(b)**. Saza galti ke hisaab se, galat pakde gaye ke liye raasta khula, aur brand ke apne staff pe system ki rok.
- **Trade-off:** (a) me khel karne wale ko koi rok nahi; (b) me record, seedhi aur appeal ka kaam; (c) me galat faisle ka bada jokhim.
- **Kanooni detail jaanchi nahi (R-004):** nakli reviews pe platform ki zimmedari.
- **R1 ya baad me:** niyam 1 aur 5 R1 me; baaki R2 se (Trust & Safety ke saath).
- **Kis par tika:** D-017, D-031, D-047. Koi khula sawal nahi.

#### B8-10. Formula badle to purane reviews

- **Sawal:** brand usi product ka formula badle (ingredients badle, D-098 ki jaanch ke baad), to purane reviews ka kya ho?
- **Kyun zaroori:** cosmetics me formula badalna aam hai (paraben hatana, fragrance badalna). Purane formula ke reviews (jaise kisi ingredient se reaction) naye formula pe galat tasveer dete. D-076 niyam 4 variants ke farak ke liye hai; samay ke saath formula badalne ka niyam nahi.
- **Vikalp:**
  - **(a) Kuch nahi:** reviews waise hi.
  - **(b) Purane formula ka label:** listing jaanch (D-098) me staff ingredients ke bade badlav ko "formula badla" mark kare; us tareekh se pehle ke reviews pe "pehle ke formula pe" label; rating do roop me dikhe (misaal "naya formula: 4.2 (12)", "kul: 4.0 (340)").
  - **(c) Naya product:** formula badle to naya product, reviews zero se.
- **Salah:** **(b)**. Purani jaankari khoti nahi, aur naya customer naye formula ki asli tasveer dekhta.
- **Trade-off:** (a) me galat tasveer; (b) me "bada badlav" kya hai, ye staff ki samajh (misaal: naya ya hata hua ingredient upar ki 10 me); (c) me brand ke saalon ke reviews khatam.
- **R1 ya baad me:** R2; R1 me har review pe us waqt ka listing version save ho (data).
- **Kis par tika:** D-076, D-098. Koi khula sawal nahi.

### 1.4 Pehle ke kaam se lene layak

| Kya                                                                                   | Kahan (purana path)                                                                        | Kyun achha                                   | Kasauti check                                                                                   | Naye docs me kahan                 |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------- |
| Review sirf delivered order pe; moderation queue; chhupana wapas ho sake aur audit me | `docs-old/ARCHITECTURE.md` §15 (16); `docs-old/PRD.md` §3.2 (Review & UGC Moderator), §5.4 | R1 review ka seedha flow                     | Zaroorat: haan (D-039, D-055). Takrav: nahi. Naya vakya: haan                                   | reviews ki TASK.md; FLOWS (review) |
| Review card pe "verified purchase" aur inaam wala label                               | `docs-old/DESIGN.md` (RatingStars + ReviewCard; labels)                                    | Bharose ke nishaan UI me ek jagah            | Zaroorat: haan (B8-1; label B8-5 pe tika). Takrav: nahi. Naya vakya: haan                       | DESIGN.md (components)             |
| Intimate ya kisi aur ki photo wali shikayat ka tez raasta                             | `docs-old/PRD.md` §5.4                                                                     | Photo reviews (B8-4) ka sabse gambhir jokhim | Zaroorat: haan, agar B8-4 me photo. Takrav: nahi. Samay-seema kanooni (R-004). Naya vakya: haan | reviews ki TASK.md                 |
| Nakli reviews fraud analyst ke kaam me                                                | `docs-old/PRD.md` §3.2 (Fraud & Risk Analyst)                                              | B8-9 ki karwai ka role                       | Zaroorat: haan. Takrav: nahi (D-047 ke Trust & Safety Lead ke neeche). Naya vakya: haan         | roles ki list (D-017)              |

**Na lein:** review ka state ke hisaab se routing ("sabse kam load wala scope holder, phir backup, phir SLA ke baad Super Admin pool", `docs-old/ARCHITECTURE.md` §4 review module) — D-084 (poore desh ki ek team) se takrav. Q&A aur seller replies R1 me ek saath (`docs-old/ARCHITECTURE.md` §4 ugc module) — R1 patla (D-055); B8-6 aur B8-8 R2.

## 2. B9: Search, recommendations aur virtual try-on

### 2.1 Ab tak tay

D-020 (search aur filter bina sign-in), D-055 aur [PROJECT_PLAN.md](../../docs/PROJECT_PLAN.md) §1 #4 (R1 me basic search aur filter), D-085 (shade family ka filter R1 me; shade finder aur try-on R2 se), D-099 (free-from filters aur allergen ki chetavni R1 me), D-100 (filters sirf claims ki tay list se), D-076 (category ke hisaab se variant ki cheezein), D-127 (country of origin ka field), D-031 (apna brand bina shortcut), D-035 (poora India dekh sake, order sirf served pincodes se), D-065 (Pro daam sirf jaanche Pro buyers ko), D-067 (agle batch ki expiry dikhti), D-089 (short expiry label R2 se), SR-001 (camera sirf apni site ke liye).

### 2.2 Domain gaps

- **Skin type, concern aur actives ka data nahi:** skincare aur haircare me customer "oily skin", "acne-prone skin", "pigmentation", "dandruff", "10% niacinamide" se dhoondhta hai. Na catalog me field tay, na filter. Concern ke shabd cosmetic se drug ke daawe tak ja sakte ("acne-prone skin ke liye" bana "acne ka ilaaj"; D-128). Kanooni detail jaanchi nahi (R-004).
- **R1 ke filters aur sort ki list** tay nahi.
- **Kram (ranking) ki niti:** apna brand (D-031) platform ka hi hai; use upar rakhna doosre sellers ke saath anyay. Out-of-stock, sponsored. Kanooni detail jaanchi nahi (R-004): kram ke gun batana aur sponsored ka label.
- **Ek cheez ke kai naam aur spelling:** sunscreen aur sunblock, moisturiser aur moisturizer, eyeliner aur kohl; zero result pe customer chala jaata hai, aur na mile shabd demand ka signal hain.
- **Stock khatam:** ek warehouse (D-014) me khatam = har jagah khatam; "stock aane pe batao" ka raasta tay nahi (D-046 sirf area ka waitlist).
- **Beauty profile:** skin type, tone, concerns aur allergy wale ingredients; D-099 ki allergen chetavni personal ho sakti hai (§10 point 3). Sehat ke paas ka data.
- **Shade finder:** khula product galat shade pe lautta nahi (man badla sirf band maal pe, D-079), isliye shade finder ka business fayda bada. Tareeka tay nahi.
- **Try-on:** ₹0 (D-028) me paid try-on services nahi; chehre ka data.
- **Recommendations:** routine (cleanser se sunscreen tak), "saath me kharide gaye", personal data se sujhaav aur uski consent.
- **Pro buyer ko search me Pro daam (D-065), aur cache:** technical (§9).

### 2.3 Proposed sawal

#### B9-1. Skin type, concern aur actives ka data

- **Sawal:** product pe "kis skin type ke liye", "kis concern ke liye" aur active ingredient ka % jaisi jaankari kis roop me aaye, taaki filter aur search usse chal sakein?
- **Kyun zaroori:** skincare aur haircare me ye khoj ka mukhya raasta hai, par variants (D-076), shade (D-085), ingredients (D-099) aur claims (D-100) me ye fields nahi. R1 me basic filter hai; baad me saari listings dobara bharna mehnga. Concern ke shabd drug ke daawe tak ja sakte (D-128).
- **Vikalp:**
  - **(a) Claims ki list me hi:** "oily skin ke liye", "acne-prone skin ke liye" jaise claims D-100 ki tay list me jud jaayein; filter claims se.
  - **(b) Alag fields, platform ki list se:**
    1. Category ke hisaab se fields (D-076 jaisa): skin type (kai chune ja sakein), concern, hair type.
    2. Seller platform ki list se chune; ye jokhim wale fields me (D-098 niyam 1), badlav pe jaanch.
    3. Concern ki list me sirf cosmetic shabd ("acne-prone skin", "dull skin"); "treat", "cure" jaise shabd list me nahi.
    4. Active ingredient ka % alag field, sirf tab jab pack pe chhapa ho; staff label ki photo (D-099 niyam 1) se milaye.
    5. Filters inhi se.
  - **(c) R1 me kuch nahi.**
- **Salah:** **(b)**. Skin type aur concern lagbhag har skincare product pe hote hain; claims ki list saboot wale daawon ke liye hai, unme milane se list bhaari aur filters ulajhte.
- **Trade-off:** (a) me claims ki list lambi aur saboot ke niyam (D-100) inpe bhi lagne ka sawal; (b) me seller aur staff ka thoda aur kaam; (c) me R1 ka filter kamzor aur baad me sab listings dobara.
- **Kanooni detail jaanchi nahi (R-004):** cosmetic aur drug ke daawe ke shabd.
- **R1 ya baad me:** R1 (catalog ke fields; owner ki haan se R1 me chhota jod).
- **Kis par tika:** D-076, D-098, D-099, D-100, D-128. Koi khula sawal nahi.

#### B9-2. R1 me kaunse filters aur sort

- **Sawal:** R1 ke basic search aur filter me kaunse filters aur kaunse sort hon?
- **Kyun zaroori:** [PROJECT_PLAN.md](../../docs/PROJECT_PLAN.md) §1 #4 me basic search aur filter hai, par list nahi. Har filter ka data catalog me pehle din se chahiye (D-085, D-099, D-100, D-127).
- **Vikalp:**
  - **(a) Kam:** category, brand, daam ki range, shade family, free-from; sort: relevance, daam (kam se zyada, zyada se kam), naya.
  - **(b) Poore:** (a) + skin type aur concern, claims (D-100), rating, discount %, country of origin (D-127), size; sort me rating aur discount bhi.
  - **(c) (b) + Pro daam se sort** Pro buyer ke liye (D-065).
- **Salah:** **(b)**. Data R1 me ban hi raha hai; filter usi ka seedha fayda hai. Pro daam ka sort baad me.
- **Trade-off:** (a) me data hote hue bhi filter nahi; (b) me filter ki screen aur search index ka kaam; (c) me har dekhne wale ke liye alag daam ka sort.
- **Kanooni detail jaanchi nahi (R-004):** imported products ke liye country of origin ka filter zaroori hai ya nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** B9-1 (skin type aur concern ka data); D-085, D-099, D-100, D-127.

#### B9-3. Search aur listing me kram ki niti

- **Sawal:** search aur category page pe products kis kram me aayein, aur kya apne brand ya paid "sponsored" ko upar jagah mil sake?
- **Kyun zaroori:** kram se bikri tay hoti hai. Apna brand platform ka hi hai (D-031: koi shortcut nahi); use upar rakhna doosre sellers ke saath anyay hai. Ranking ki technique Architect ka kaam hai; yahan sirf niti.
- **Vikalp:**
  - **(a) Sirf relevance:** shabd ka mel, phir naya.
  - **(b) Relevance + gun, bina seller ke boost:**
    1. Relevance ke baad: rating (kam se kam misaal 5 reviews pe), pichhle 30 din ki bikri, stock me hona.
    2. Out-of-stock (agar dikhein) sabse neeche.
    3. Apne brand ko koi boost nahi; code me kisi seller ke hisaab se boost ka raasta hi nahi.
    4. Sponsored sirf R2 ke baad, hamesha "Sponsored" label, aur ginti ki seema (misaal har 10 me 2 tak).
    5. Kram ke mukhya gun customer ke liye ek page pe likhe.
  - **(c) (b) + apne brand ko boost.**
- **Salah:** **(b)**. Customer ko kaam ka kram, aur sab sellers ke saath ek niyam.
- **Trade-off:** (a) me achhe aur bikne wale products neeche reh sakte; (b) me rating aur bikri ki ginti ka kaam; (c) me sellers ka bharosa aur kanooni jokhim.
- **Kanooni detail jaanchi nahi (R-004):** kram ke gun batana, apne brand ko aage rakhna, sponsored ka label.
- **R1 ya baad me:** R1 (sponsored ke bina); sponsored R2 ke baad.
- **Kis par tika:** D-031. Koi khula sawal nahi.

#### B9-4. Zero result aur search ke shabd kaun sambhale

- **Sawal:** search me kuch na mile to customer ko kya dikhe, aur ek cheez ke kai naam (synonyms) ki list aur na mile shabdon ki report kaun sambhale?
- **Kyun zaroori:** beauty me ek cheez ke kai naam aur spelling (sunscreen aur sunblock, moisturiser aur moisturizer, eyeliner aur kohl) aam hain. Zero result pe customer chala jaata hai. Na mile shabd batate hain kaunsa brand ya product laana chahiye.
- **Vikalp:**
  - **(a) Saada:** "kuch nahi mila" aur categories ki list.
  - **(b) Madad aur report:**
    1. Spelling ki galti pe "kya aapka matlab ..." ka sujhaav, milte-julte products, popular categories.
    2. Synonyms ki list staff setting se, bina deploy (D-037 ki soch).
    3. Zero result wale shabd har hafte ki report me.
    4. R1 me ye kaam catalog ki jaanch wali team (D-084, Admin app) kare; Growth Studio (D-010) bane to wahan.
    5. Customer "ye brand ya product chahiye" ki request de sake (sign-in se) — R2.
  - **(c) (b) + apne aap seekhne wale synonyms.**
- **Salah:** **(b)**. Kam kaam me customer rukta hai, aur demand ka data milta hai.
- **Trade-off:** (a) me customer khota; (b) me synonyms ki list ka haath ka kaam; (c) me technique ka bojh aur galat synonyms ka jokhim.
- **R1 ya baad me:** niyam 1 se 4 R1; niyam 5 R2.
- **Kis par tika:** D-010, D-037, D-084. Koi khula sawal nahi.

#### B9-5. Stock khatam product aur "stock aane pe batao"

- **Sawal:** stock khatam variant ya product search aur listing me dikhe ya chhupe, aur customer "stock aane pe batao" chun sake ya nahi?
- **Kyun zaroori:** maal ek warehouse (D-014) me hai, to stock khatam = har jagah khatam. Chhupane se customer wapas nahi aata; dikhane se kram (search) aur khabar ka sawal. D-046 sirf area ka waitlist hai, stock ka nahi. Khabar ka raasta 300 emails (D-028) me.
- **Vikalp:**
  - **(a) Chhupe:** stock khatam product search aur listing me nahi.
  - **(b) Dikhe, khabar ke saath:**
    1. "Out of stock" ke saath dikhe, kram me neeche.
    2. Product page pe "stock aane pe batao" (sign-in se).
    3. Khabar sirf in-app aur browser push se, email nahi.
    4. Request misaal 90 din me khatam.
    5. Seller ko "kitne log ruke hain" ki ginti.
  - **(c) Dikhe, bina khabar.**
- **Salah:** **(b)**. Customer ka intent nahi khota, aur seller ko maal bhejne ka signal milta hai; email ka bojh nahi.
- **Trade-off:** (a) me customer aur demand ka signal dono khote; (b) me khabar ka kaam; (c) me customer ko baar-baar dekhna padta.
- **R1 ya baad me:** dikhana R1; khabar R2.
- **Kis par tika:** D-014, D-028, D-046. Koi khula sawal nahi.

#### B9-6. Customer ki beauty profile

- **Sawal:** customer apni beauty profile (skin type, depth aur undertone, concerns, aur jinse allergy hai wo ingredients) save kar sake ya nahi, aur uska istemaal kahan ho?
- **Kyun zaroori:** shade finder, sujhaav aur "meri skin ke liye" filter isi pe tikte hain. D-099 me allergen ki chetavni hai; customer apne allergens bataye to product page pe personal chetavni ("is product me X hai, jisse aapko allergy hai") ban sakti hai. Par allergy aur skin concerns sehat ke paas ka data hain.
- **Vikalp:**
  - **(a) Profile nahi:** chetavni sabke liye ek jaisi (D-099).
  - **(b) Optional profile, allergens samet:**
    1. Fields: skin type, depth aur undertone (D-085 ki list), concerns, allergy wale ingredients (ingredient master list D-132 se chune).
    2. Istemaal: product page aur cart pe personal allergen chetavni, search me "meri skin ke liye" ka switch, shade finder.
    3. Chetavni ke saath hamesha "pack ki list se mila ke dekhein" (master list se milan galat ho sakta).
    4. Alag consent ("is jaankari se mujhe salah do"); customer kabhi bhi badle ya mitaye.
    5. Seller ko kabhi nahi; staff sirf tab jab customer khud support me bataye.
  - **(c) (b), bina allergens.**
- **Salah:** **(b)**. Cosmetics me personal allergen chetavni sabse bada suraksha fayda hai.
- **Trade-off:** (a) me personal suraksha nahi; (b) me sehat ke paas ka data, consent aur kam log dekhein; (c) me suraksha wala hissa chhoot-ta.
- **Kanooni detail jaanchi nahi (R-004):** sehat ke paas ke data ki consent aur rakhna.
- **R1 ya baad me:** R2 (R1 me D-099 ki chetavni sabke liye ek jaisi).
- **Kis par tika:** D-085, D-099, D-132. Koi khula sawal nahi.

#### B9-7. Shade finder ka tareeka

- **Sawal:** shade finder (R2, D-085) kis tareeke se shade sujhaye?
- **Kyun zaroori:** foundation aur concealer me galat shade sabse aam pareshani hai, aur khula product man badla pe nahi lautta (D-079). D-085 ka data (depth, undertone, shade family) isi ke liye hai.
- **Vikalp:**
  - **(a) Sawal-jawab:** depth, undertone (aasaan pehchaan: nas ka rang, sone ya chandi ka gehna kis pe achha lagta), finish aur coverage ki pasand; D-085 ke data se har brand ke milte shades.
  - **(b) (a) + "jo shade abhi lagate ho":** customer platform pe listed kisi bhi brand ka apna abhi ka product aur shade chune; usi ki depth aur undertone se doosre brands ke milte shades. Data sirf listed products ka.
  - **(c) Camera se skin tone padhna.**
- **Salah:** **(b)**. Customer ka asli anubhav (jo shade use pehle se jachta hai) sabse achha aadhaar hai. (c) abhi nahi: roshni aur camera ke hisaab se galat nateeje, aur chehre ki photo ka jokhim.
- **Trade-off:** (a) me customer ki apni pehchaan galat ho sakti; (b) me brands ke beech mel sirf D-085 ke moote data se; (c) me galat nateeje aur privacy.
- **R1 ya baad me:** R2.
- **Kis par tika:** D-079, D-085. Koi khula sawal nahi.

#### B9-8. Virtual try-on ka roop

- **Sawal:** virtual try-on kis roop me ho, kin products pe, aur customer ki photo ya video ka kya ho?
- **Kyun zaroori:** try-on R2 se (D-055), aur camera sirf apni site ke liye (SR-001). ₹0 (D-028) me paid try-on services nahi. Lip aur eye ka try-on browser me ho sakta hai; foundation ka sahi try-on roshni ki wajah se mushkil. Chehra personal data hai.
- **Vikalp:**
  - **(a) Try-on nahi:** uski jagah har shade ki alag skin tones pe photos (D-085 niyam 4).
  - **(b) Browser me, device pe hi:**
    1. Camera live (ya ek photo jo device se bahar na jaaye).
    2. Sirf lipstick, lip gloss, blush, eyeshadow aur eyeliner; baaki baad me.
    3. Rang D-085 ke hex se; screen pe note "rang asli se alag dikh sakta hai".
    4. Koi photo ya video server pe nahi jaata, save nahi hota.
    5. Pehli baar camera se pehle saaf consent.
  - **(c) (b) + foundation, aur photo server pe.**
- **Salah:** **(b)**. ₹0 me ho sakta hai, chehre ka data device se bahar nahi jaata, aur sabse zyada fayde wali categories me hai.
- **Trade-off:** (a) me try-on ka fayda nahi; (b) me shade ke hex ki sahi jaanch zaroori (D-085 niyam 5), aur purane phones pe dheema; (c) me galat nateeje aur chehre ka data server pe.
- **Kanooni detail jaanchi nahi (R-004):** chehre ki photo ya video ki consent.
- **R1 ya baad me:** R2.
- **Kis par tika:** D-028, D-085, SR-001. Koi khula sawal nahi.

#### B9-9. Sujhaav (recommendations) ke roop

- **Sawal:** product sujhaav kis tarah ke hon, aur customer ki kharid ya profile ka istemaal ho ya nahi?
- **Kyun zaroori:** "is ke saath" aur routine (cleanser, serum, moisturiser, sunscreen) cosmetics me bikri badhate hain. Personal data se sujhaav ke liye consent chahiye; apne brand (D-031) ko sujhaav me aage rakhna wahi anyay ka sawal.
- **Vikalp:**
  - **(a) Sirf product data se:** "milte-julte" (category, concern, daam), "isi brand ke aur"; koi personal data nahi.
  - **(b) (a) + kharid aur profile se:**
    1. Sab customers ki kharid ke jod se "saath me kharide gaye" (kisi ek customer ki baat nahi).
    2. Staff ki banayi routine templates se "routine poora karo".
    3. Sign-in customer ko uski profile aur pichhli kharid se, sirf consent ho to.
    4. Kram ki wahi niti jo search me: kisi seller ko boost nahi.
  - **(c) Bahar ki recommendation service.**
- **Salah:** **(b)**. Kaam ke sujhaav, consent ke andar, aur sab sellers ke saath ek niyam.
- **Trade-off:** (a) me personal madad nahi; (b) me routine templates ka staff kaam aur consent ka hisaab; (c) me ₹0 me nahi aur data bahar.
- **Kanooni detail jaanchi nahi (R-004):** personal data se sujhaav ki consent, aur apne brand ke prachaar me customer data.
- **R1 ya baad me:** R2.
- **Kis par tika:** B9-3 (kram ki niti), B9-6 (profile); D-031.

### 2.4 Pehle ke kaam se lene layak

| Kya                                                                      | Kahan (purana path)                                                                      | Kyun achha                                                            | Kasauti check                                                                                       | Naye docs me kahan                         |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Synonyms aur banners staff setting se (Storefront Merchandiser)          | `docs-old/PRD.md` §3.2 (Growth Studio), §5.10; `docs-old/ARCHITECTURE.md` §4 (discovery) | Bina deploy synonyms (D-037 ki soch)                                  | Zaroorat: haan (B9-4). Takrav: Growth Studio R2 me (D-055), to R1 me catalog team. Naya vakya: haan | search ki TASK.md; roles ki list           |
| Kram ke mukhya gun ka page aur sponsored pe label                        | `docs-old/PRD.md` §5.1 (policy pages); `docs-old/ARCHITECTURE.md` §4 (discovery)         | B9-3 ki niti                                                          | Zaroorat: haan. Takrav: nahi. Kanooni (R-004). Naya vakya: haan                                     | search ki TASK.md; PRODUCT                 |
| Personal dynamic pricing aur daam pe A/B test kabhi nahi                 | `docs-old/ARCHITECTURE.md` §6.8                                                          | Dark pattern se bachav; D-061 (daam seller ka, platform nahi badalta) | Zaroorat: haan. Takrav: nahi. Naya vakya: haan                                                      | PRODUCT (daam); sujhaav ki TASK.md         |
| Shade data aur try-on rang ki jaanch ka role (Try-on & Shade Specialist) | `docs-old/PRD.md` §3.2 (Admin), §5.3                                                     | D-085 niyam 5 ki jaanch aur try-on ke rang                            | Zaroorat: haan (B9-8). Takrav: nahi. Naya vakya: haan                                               | roles ki list; catalog ki TASK.md          |
| Apne brand ke prachaar ke liye customer ki alag consent                  | `docs-old/ARCHITECTURE.md` §6.5 ("Apne brand ke liye alag consent")                      | D-031 ke saath sab sellers ko ek niyam                                | Zaroorat: kanooni jaanch pe tika (R-004). Takrav: nahi. Naya vakya: haan                            | B9-9 ke saath; COMPLIANCE (jaanch ke baad) |

**Na lein:** map zones ke hisaab se search (bahar ki map service; D-016 ka pincode → hub kaafi). Try-on bahar ki paid service — D-028 (₹0). Live shopping (Creator app) — is topic ki zaroorat nahi.

## 3. B10: Loyalty, gift cards, store credit aur subscriptions

### 3.1 Ab tak tay

Sab R2 se (D-055). Gift cards aur store credit ka faisla isi charcha me, aur RBI ke prepaid (PPI) niyam lag sakte hain, jaancha nahi ([OPEN_QUESTIONS.md](../../docs/OPEN_QUESTIONS.md) §1 B10, owner 2026-11-17). D-111 (refund hamesha original raaste; default store credit chhoda gaya vikalp), D-101 (offer ka paisa brand, platform ya dono), D-102 (ek order pe ek coupon; Pro daam pe coupon nahi), D-093 (saara paisa platform ke ek gateway khaate me), D-078 (commission GST ke bina wali rakam pe), D-065 (Pro daam), D-080 aur D-081 (return window ke baad payable), D-110 aur D-114 (cancel aur return), D-107 (delivery fee), D-034 (prepaid ya delivery pe UPI), D-038 (sirf umar ki ghoshna, janam tareekh nahi).

### 3.2 Domain gaps

- **Loyalty ka roop aur liability:** diye par na kharche points platform pe rakam ki zimmedari hain (finance me khaata); expiry ke bina ye badhti rehti. Return aur cancel pe points ka wapas hona, Pro daam pe points, coupon ke saath mel (D-102).
- **Kharcha kaun de:** maal brand ka (D-060); points ki chhoot ka paisa D-101 jaisa tay hona chahiye.
- **Store credit:** D-111 ke baad refund ka raasta nahi; bachta hai sirf goodwill ya promotion ka roop. Paisa jaisa dikhe to prepaid ka sawal. Kanooni detail jaanchi nahi (R-004).
- **Gift cards:** customer ka paisa pehle aata (D-093), bina kharch ka balance liability, expiry ke niyam, aur gift card ka code email se (300 ki seema). Kanooni detail jaanchi nahi (R-004).
- **Dobara kharid:** face wash, shampoo, sunscreen jaise consumables. Subscription me har baar naya batch (D-064 ka MRP, D-067 ki expiry), daam badle (D-061, D-087), stock na ho, aur recurring payment ke niyam. Delivery pe UPI (D-034) subscription me nahi chalta.
- **Referral:** naye customer laane ka sasta raasta, par `+` alias (D-017, jaan-boojh ke normalise nahi) se khud ko refer karna aasaan.
- **Janamdin ka offer:** janam tareekh ka data chahiye; D-038 me sirf umar ki ghoshna.
- **Tiers aur muft delivery:** D-107 ki delivery fee se mel.

### 3.3 Proposed sawal

#### B10-1. Loyalty program ho, aur kis roop me

- **Sawal:** customer loyalty program ho ya nahi, aur ho to kis roop me?
- **Kyun zaroori:** beauty me dobara kharid business ki jaan hai. Par loyalty ke diye hue points platform pe rakam ki zimmedari (liability) hain, aur maal brands ka hai (D-060). R2 se (D-055).
- **Vikalp:**
  - **(a) Loyalty nahi:** sirf offers aur coupons (D-101).
  - **(b) Points:** har delivered order pe points (misaal har ₹100 pe 1 point, 1 point = ₹1 ki chhoot); points sirf platform pe kharch, cash ya bank me nahi badalte, transfer nahi.
  - **(c) Tiers + points:** saal ki kharid se tier (misaal Silver, Gold); tier pe zyada points, muft delivery (D-107) ya sale me pehle pahunch.
- **Salah:** **(b)**, R2 me; tiers baad me (data me jagah rahe).
- **Trade-off:** (a) me dobara kharid ka koi khaas karan nahi; (b) me points ka khaata aur liability; (c) me tiers ke niyam, aur delivery fee ka hisaab.
- **Kanooni detail jaanchi nahi (R-004):** points prepaid instrument bante hain ya nahi, aur points pe GST.
- **R1 ya baad me:** R2.
- **Kis par tika:** D-055, D-060, D-101, D-107. Koi khula sawal nahi.

#### B10-2. Points ke niyam

- **Sawal:** points kis rakam pe milein, kab pakke hon, kab expire hon, aur kaise kharch hon?
- **Kyun zaroori:** return aur cancel (D-110, D-114) pe points wapas hone chahiye; seller ka paisa bhi return window ke baad payable hota (D-081). Expiry ke bina liability badhti rehti. Pro daam pe coupon nahi (D-102), to points ka bhi sawal.
- **Vikalp:**
  - **(a) Saada:** delivery pe pakke, expiry nahi, poore order pe kharch.
  - **(b) Niyam ke saath:**
    1. Aadhaar: customer ne jo paisa diya, delivery fee aur Pro daam wali lines ke bina.
    2. Points "pending" jab tak return window (D-080) na nikle; phir pakke. Return ya cancel pe us line ke pending points hatein.
    3. Expiry misaal 12 mahine (har point apni tareekh se); expiry se 30 din pehle in-app aur push se yaad.
    4. Kharch: ek order pe zyada se zyada misaal 20% rakam tak; ek coupon (D-102) ke saath chal sake.
    5. Points se kharida item return ho to points wapas (agar expire nahi hue); paisa wala hissa original raaste (D-111).
  - **(c) Points se poora order.**
- **Salah:** **(b)**. Liability seemit, khel ke raaste band, aur hisaab return ke niyam se mel khata.
- **Trade-off:** (a) me liability behisaab aur return pe khel; (b) me pending aur expiry ka hisaab; (c) me poora order "muft", platform ka kharcha bada.
- **Kanooni detail jaanchi nahi (R-004):** points ki expiry aur suchna ke niyam.
- **R1 ya baad me:** R2.
- **Kis par tika:** B10-1; D-065, D-080, D-081, D-102, D-110, D-111, D-114.

#### B10-3. Points ki chhoot ka paisa kaun de

- **Sawal:** points se mili chhoot ka paisa kaun de: platform, brand, ya dono?
- **Kyun zaroori:** D-101 me offers ka niyam hai; points bhi chhoot hain. Platform de to seller ko poora daam milta (D-101 niyam 1 jaisa) aur liability platform ki. Brand chahe to apne product pe zyada points dekar bikri badha sake.
- **Vikalp:**
  - **(a) Sirf platform:** har points chhoot platform ka discount; seller ko poora daam; finance me points ki liability ka khaata.
  - **(b) Platform + brand ke bonus points:** base points platform ke; brand apne products pe bonus points de sake (brand ka kharcha, budget ke saath, D-101 niyam 2 jaisa).
  - **(c) Brand ka % har order pe.**
- **Salah:** **(a)** shuru me, **(b)** baad me. Seller ka hisaab saaf rehta hai.
- **Trade-off:** (a) me saara kharcha platform ka; (b) me brand ke budget ka hisaab; (c) me sellers pe bina poochhe kharcha.
- **Kanooni detail jaanchi nahi (R-004):** points ki chhoot ka invoice aur GST pe asar.
- **R1 ya baad me:** R2.
- **Kis par tika:** B10-1; D-078, D-101.

#### B10-4. Store credit

- **Sawal:** store credit (platform pe kharch hone wala balance) ho ya nahi, aur kis kaam ke liye?
- **Kyun zaroori:** D-111 me refund hamesha original raaste, to store credit refund ka raasta nahi. Phir bhi goodwill (der ya galat item ki takleef) me "₹100 ka credit" support ka aam tareeka hai. Balance paisa jaisa dikhe to prepaid ka sawal uthta.
- **Vikalp:**
  - **(a) Store credit nahi:** goodwill sirf ek customer ke liye ek baar ke coupon (platform ka offer, D-101) se.
  - **(b) Promo credit:**
    1. Sirf platform de (goodwill ya promotion); customer paisa daal ke kabhi nahi khareedta.
    2. Cash ya bank me nahi badalta, transfer nahi; expiry misaal 90 din.
    3. Kabhi refund ka raasta nahi (D-111).
    4. Support role ki rakam seema (misaal ₹200 ek maamle me).
  - **(c) Wallet:** customer paisa daal ke balance rakhe.
- **Salah:** **(a)**. Naya balance aur khaata nahi chahiye; coupon ka raasta R2 me ban hi raha hai.
- **Trade-off:** (a) me goodwill coupon se customer ka us order pe doosra coupon nahi chalta (D-102); (b) me naya balance, khaata aur expiry; (c) me prepaid ke niyam ka seedha jokhim.
- **Kanooni detail jaanchi nahi (R-004):** promo credit ya wallet ka prepaid instrument ke niyam me aana.
- **R1 ya baad me:** R2.
- **Kis par tika:** D-101, D-102, D-111. Koi khula sawal nahi.

#### B10-5. Gift cards

- **Sawal:** gift card (koi customer doosre ko platform pe kharch ke liye rakam de) ho ya nahi, aur kab?
- **Kyun zaroori:** tyohar aur gifting me beauty gift cards aam hain. Par gift card me customer ka paisa pehle aata hai (D-093), bina kharch ka balance platform ki liability hai, expiry ke niyam lagte, aur platform pe doosre sellers ka maal bhi bikta, isliye prepaid ke niyam alag ho sakte. Gift card ka code email se jaata (300 ki seema, D-028).
- **Vikalp:**
  - **(a) Gift cards nahi.**
  - **(b) Design abhi, banana kanooni jaanch ke baad:** data aur finance ke khaate design me; banana tab jab kanooni jaanch (R-004) ho jaaye. Niyam (misaal): tay rakam (₹500, ₹1,000, ₹2,000); code paane wale ke email pe; thoda-thoda kharch; balance dikhe; cash me nahi; gift card se kharida item return ho to rakam gift card me wapas (D-111 ka "original raasta"); khareeda gift card sirf bina istemaal ke cancel.
  - **(c) R2 me test mode me, dummy kanooni details ke saath (D-026).**
- **Salah:** **(b)**. Design asli rahe, par paise jaisi cheez kanoon dekhe bina na bane.
- **Trade-off:** (a) me gifting ka raasta nahi; (b) me feature der se; (c) me galat design ka jokhim jo baad me badalna pade.
- **Kanooni detail jaanchi nahi (R-004):** prepaid instrument (closed ya semi-closed) ke niyam, gift card ki kam se kam muddat aur KYC, gift voucher pe GST, aur bina kharch ke balance ka hisaab. Is sawal ka jawab kanooni jaanch ke baad badal sakta hai.
- **R1 ya baad me:** R2 ke baad, kanooni jaanch pe.
- **Kis par tika:** D-026, D-028, D-093, D-111; R-004. Koi khula sawal nahi.

#### B10-6. Dobara kharid: yaad ya subscription

- **Sawal:** rozana khatam hone wale products (face wash, shampoo, sunscreen) ke liye "dobara kharid" ki suvidha kis roop me ho?
- **Kyun zaroori:** consumables ka chakkar tay hota hai, aur dobara kharid ka sabse aasaan mauka hai. Subscription me har baar naya batch (D-064 ka MRP, D-067 ki expiry), daam badal sakta (D-061, D-087), stock na ho sakta, aur recurring payment ke niyam lagte. Delivery pe UPI (D-034) subscription me nahi chalta.
- **Vikalp:**
  - **(a) Sirf "dobara order" button:** pichhle order se cart.
  - **(b) (a) + yaad:**
    1. Size aur category se andaaza (misaal 100 ml face wash ~60 din; staff setting).
    2. Customer chahe to yaad chalu kare; yaad in-app aur push se, email nahi.
    3. Ek tap pe cart me, us din ke daam aur expiry ke saath; koi pehle se payment nahi.
  - **(c) Subscription:** har X din pe apne aap order aur payment (recurring mandate); daam badle to pehle khabar aur customer ki haan; stock na ho to wo baar skip; "subscribe karo, bachao" ki chhoot (D-101).
- **Salah:** **(b)** pehle; **(c)** baad me, kanooni aur payment ki jaanch ke baad.
- **Trade-off:** (a) me customer ko khud yaad rakhna; (b) me andaaze ki setting; (c) me mandate, daam ki haan aur stock ke niyam ka bada kaam.
- **Kanooni detail jaanchi nahi (R-004):** recurring payment mandate ke RBI niyam.
- **R1 ya baad me:** (a) aur (b) R2; (c) baad me.
- **Kis par tika:** D-034, D-061, D-064, D-067, D-087, D-101. Koi khula sawal nahi.

#### B10-7. Dost ko bulao (referral)

- **Sawal:** "dost ko bulao" (referral) ka program ho ya nahi?
- **Kyun zaroori:** naye customer laane ka sasta raasta hai, par fraud ka bhi: ek insaan ke kai email (jaise `+` alias, jo D-017 me jaan-boojh ke normalise nahi hota) se khud ko refer karna aasaan.
- **Vikalp:**
  - **(a) Referral nahi.**
  - **(b) Referral, rok ke saath:**
    1. Dono ko inaam (points, ya loyalty na ho to coupon), sirf jab naye customer ka pehla order deliver ho aur return window (D-080) paar ho.
    2. Ek customer ke saal me misaal 10 referrals tak.
    3. Ek hi address, device ya payment wale referral pe inaam nahi.
  - **(c) Sirf bulaane wale ko inaam.**
- **Salah:** **(b)**, R2 ke baad, fraud ke niyam ke saath.
- **Trade-off:** (a) me growth ka ek raasta kam; (b) me fraud ki jaanch ka kaam; (c) me naye customer ko koi khaas karan nahi.
- **R1 ya baad me:** R2 ke baad.
- **Kis par tika:** B10-1 (inaam points me ho ya coupon me); D-017, D-080, D-101.

### 3.4 Pehle ke kaam se lene layak

| Kya                                   | Kahan (purana path)                    | Kyun achha                 | Kasauti check                                                                                            | Naye docs me kahan       |
| ------------------------------------- | -------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------ |
| Dobara kharid ki yaad (replenishment) | `docs-old/PRD.md` §5.10 (CRM journeys) | B10-6 (b) ka roop          | Zaroorat: haan. Takrav: purane me email journeys; naye me sirf in-app aur push (D-126). Naya vakya: haan | B10-6; notify ki TASK.md |
| Loyalty & Rewards Manager role        | `docs-old/PRD.md` §3.2 (Growth Studio) | B10-1 haan ho to uska role | Zaroorat: B10-1 pe tika. Takrav: nahi. Naya vakya: haan                                                  | roles ki list (D-017)    |

**Na lein:** refund me store credit aur kai raaston se payment (`docs-old/discovery/REPOSITORY_ANALYSIS.md` §7: "Refund source vs store credit", "split tender") — D-111 se takrav. Janamdin ke offers (`docs-old/PRD.md` §5.1) — janam tareekh ka data chahiye, D-038 me sirf umar ki ghoshna. Gift cards aur store credit ke purane me koi niyam nahi the (sirf naam), lene layak kuch nahi.

## 4. B11: Support, disputes aur notifications

### 4.1 Ab tak tay

D-025 (Skin & Hair Expert aur Beauty Advisor asli roles, Support Lead ke neeche; consultation ka flow; Advisor ka message thread, live chat nahi; Meet ka dummy link email aur in-app se), D-044 (Head of Operations Support ke upar), D-105 (R1 me Support Desk ka patla hissa, Support Agent role; tickets aur SLA R2), D-072 (daawe ki samay-seema misaal 48 ghante, aur asar me ye B11 ko diya), D-126 aur D-131 (har order pe sirf zaroori emails; emails ki line OTP, paisa, baaki), D-117 niyam 4 (der ki khabar), D-108 (delivery fail ki khabar), D-111 niyam 4 (refund ki halat), D-129 (recall ki khabar), D-130 (skin reaction R2, support desk ke saath), D-095 (chargeback R2), D-047 (Trust & Safety Lead ban appeals), D-084 niyam 3 (seller aur listing ki appeal), D-028 (300 emails, domain nahi), D-021 (email code sirf customer app me). Notifications sirf in-app, email aur browser push (CLAUDE.md).

### 4.2 Domain gaps

- **"Parcel nahi mila" ka samay:** D-072 ne iska number B11 ko diya.
- **R1 me reject ke baad raasta nahi:** D-105 ka Support Agent reject kar sakta, appeal ka niyam sirf sellers ke liye (D-084).
- **Tickets ka model (R2):** kaun banaye, kis raaste se, kin categories me. Domain nahi (D-028), to support ke email pe aaya sawal apne aap ticket nahi ban sakta.
- **SLA aur kaam ke ghante:** ek insaan (D-009) 24 ghante support nahi de sakta.
- **Escalation aur Grievance Officer:** kanoon grievance officer aur shikayat ke tay samay maang sakta hai. Kanooni detail jaanchi nahi (R-004).
- **Seller aur delivery partner ke jhagde:** receiving farak (D-096), "brand ki galti" (D-112), bharpai (D-063), partner ki kaat (D-068, D-103), payout (D-081): faisle platform ke, asehmati ka raasta nahi.
- **Seller aur staff ke emails:** D-126 sirf customer ke order emails ka hai; sellers ko bahut khabrein jaati hain (D-062, D-071, D-081, D-096, D-098, D-124, D-129), sab usi 300 me.
- **Order ke alawa customer ki khabrein:** area khulne ki khabar (D-046, R1), review ki yaad, offers, cart me chhoda item; marketing ki consent; ek saath bahut emails ka jokhim (§10 point 1).
- **Consultation:** muft ya paid, kitni baar, no-show pe kya (D-025 me flow hai, daam aur seema nahi).
- **In-app inbox kitne din rahe:** Security Architect aur Architect (§9).
- **iPhone pe browser push** sirf home screen pe install ki hui site ko (tathya jaanchna, §7.3), to push band jaise customer zyada.

### 4.3 Proposed sawal

#### B11-1. "Parcel nahi mila" ke daawe ki samay-seema

- **Sawal:** "parcel nahi mila" ke daawe (D-072) ki samay-seema kitni ho, aur kab se gini jaaye?
- **Kyun zaroori:** D-072 niyam 3 me samay sirf misaal (48 ghante) hai, aur faisle ke asar me ye support ki charcha ko diya gaya. R1 me daawa hai (D-105). Code se pakki delivery pe daawa maana nahi jaata (D-072), to samay asal me un deliveries ke liye hai jahan code nahi mila (photo aur location, D-072 niyam 2): wahan kisi aur ne parcel liya ho sakta, aur customer ko der se pata chalta.
- **Vikalp:**
  - **(a) Sab pe 48 ghante** "delivered" scan se (D-080 ki dikhne wali galti jaisa).
  - **(b) Saboot ke hisaab se:** code se delivered pe 48 ghante (daawa darj hota, D-072 ke niyam se maana nahi jaata); sirf photo aur location wali delivery pe 7 din (misaal), "delivered" scan se.
  - **(c) Sab pe 7 din.**
- **Salah:** **(b)**. Jahan saboot kamzor hai wahan customer ko poora samay, aur code wali delivery pe lamba samay ka fayda nahi.
- **Trade-off:** (a) me ghar se bahar gaya customer chhoot sakta; (b) me do samay; (c) me code wali delivery pe bhi lamba khula maamla.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-072, D-080, D-105. Koi khula sawal nahi.

#### B11-2. R1 me customer ki appeal

- **Sawal:** Support Agent ne return ya daawa reject kiya, to customer dobara jaanch (appeal) maang sake ya nahi?
- **Kyun zaroori:** R1 me reject ke faisle hain (D-105 niyam 1), par uske baad ka raasta nahi. D-084 ka niyam (jisne reject kiya wo appeal tay nahi karta) sirf seller aur listing ke liye hai. Owner kai accounts se kaam karta hai (D-017), to "doosra insaan" ka matlab doosra role aur account.
- **Vikalp:**
  - **(a) R1 me appeal nahi:** reject aakhri, wajah ke saath.
  - **(b) Ek appeal:** reject ke misaal 7 din me, naye saboot ke saath; faisla Support Lead role kare (wo account jisne reject nahi kiya); faisla misaal 3 kaam ke din me; uske baad aakhri.
  - **(c) Kitni bhi appeals.**
- **Salah:** **(b)**. Galat reject ka sudhaar, aur bojh seemit. R1 me Support Lead role chalu karna chhota jod hai (D-054).
- **Trade-off:** (a) me galat reject ka koi raasta nahi; (b) me R1 me ek aur role; (c) me ek hi maamla baar-baar.
- **R1 ya baad me:** (b) me R1 me chhota jod (owner ki haan se).
- **Kis par tika:** D-017, D-054, D-084, D-105. Koi khula sawal nahi.

#### B11-3. Ticket ke raaste aur categories

- **Sawal:** support ticket kaun bana sake, kis raaste se, aur kin categories me?
- **Kyun zaroori:** tickets R2 me (D-105 niyam 3). Domain nahi (D-028), to support ke email pe aaya sawal apne aap ticket nahi ban sakta. Live chat nahi (D-025 ki soch). Har category ka sahi team tak pahunchna aur order se judna jaanch ka samay bachata.
- **Vikalp:**
  - **(a) Sirf signed-in customer,** app ke form se, order se juda.
  - **(b) Kai log, tay categories:**
    1. Signed-in customer aur seller apne app se (order, parcel ya line chun ke); bina sign-in "Contact us" form (email zaroori); delivery partner Delivery app se apne maamle (kamaai, kaat).
    2. Categories platform ki list se, har ek ka tay raasta: order ki haalat; cancel, return, refund; parcel nahi mila (D-072); toota ya galat item (D-106); payment kata par order nahi; account aur sign-in; product ya shade ka sawal (Beauty Advisor, D-025); skin reaction (D-130); review ya content ki shikayat; privacy ya data ki request; delivery partner ka vyavhaar; seller ke maamle.
    3. Ticket ki baat-cheet in-app; jawab aane pe push; push band ho to email sirf tab jab customer ka jawab chahiye (D-131 jaisa).
    4. Band hone pe ek sawal ka chhota survey (in-app).
  - **(c) (b) + live chat.**
- **Salah:** **(b)**. Sab paksh ek hi desk pe, aur email ki seema pe bojh nahi.
- **Trade-off:** (a) me seller, partner aur bina sign-in wale ke liye raasta nahi; (b) me categories aur raaston ki setting; (c) me ek insaan ko screen pe baithe rehna, aur server so jaata (D-028).
- **R1 ya baad me:** R2.
- **Kis par tika:** D-025, D-028, D-072, D-105, D-106, D-130, D-131. Koi khula sawal nahi.

#### B11-4. SLA aur kaam ke ghante

- **Sawal:** har category ke ticket ka pehla jawab aur hal kitne samay me ho, aur support ke kaam ke ghante kya hon?
- **Kyun zaroori:** ek insaan (D-009) 24 ghante support nahi de sakta; SLA kaam ke ghanton me gina jaaye to vaada sach rehta. Paise wale maamle aur skin reaction jaldi chahiye.
- **Vikalp:**
  - **(a) Ek SLA sab pe:** pehla jawab 24 kaam ke ghante, hal 3 kaam ke din.
  - **(b) Category ke hisaab se:**
    1. Paisa (kata par order nahi, refund nahi aaya) aur skin reaction: pehla jawab 4 kaam ke ghante, hal 1 kaam ka din (misaal).
    2. Baaki: 24 kaam ke ghante aur 3 kaam ke din; Beauty Advisor ka sawal 1 kaam ka din (misaal).
    3. Kaam ke ghante misaal Monday se Saturday 10:00 se 18:00 IST; chhuttiyan setting me (D-117 jaisa).
    4. Customer ke jawab ke intezaar me timer ruke; misaal 7 din jawab na aaye to ticket band (dobara khul sake).
    5. SLA tootne pe Support Lead ko in-app alert.
  - **(c) Koi SLA nahi.**
- **Salah:** **(b)**. Zaroori maamle pehle, aur ek insaan ke liye sach vaada.
- **Trade-off:** (a) me paise wala maamla bhi dheema; (b) me timers aur calendar ka kaam; (c) me customer ko koi umeed nahi.
- **R1 ya baad me:** R2.
- **Kis par tika:** B11-3 (categories); D-009, D-117.

#### B11-5. Escalation aur Grievance Officer

- **Sawal:** customer support ke faisle se santusht na ho to aage ka raasta kya ho, aur Grievance Officer ka kaam kaise chale?
- **Kyun zaroori:** e-commerce ke consumer niyam grievance officer, shikayat ki receipt aur tay samay me hal maang sakte hain; reviews jaise user content ki shikayat ke alag samay ho sakte hain. Grievance Officer ki jaankari site pe dummy hogi (D-026). Kanooni detail jaanchi nahi (R-004).
- **Vikalp:**
  - **(a) Alag raasta nahi:** sab ek hi queue me.
  - **(b) Seedhi aur register:**
    1. Support Agent, phir Support Lead (appeal), phir Grievance Officer.
    2. "Grievance" ka alag form (bina sign-in bhi), ticket number turant.
    3. Receipt aur hal ke timers (misaal 48 ghante aur 30 din); review ya content ki shikayat ka chhota timer (misaal 24 ghante receipt).
    4. Grievance register: har shikayat, faisla aur samay; mahine ki report Head of Operations ko (D-044).
    5. Grievance Officer ka role alag account pe (D-017).
  - **(c) (b), bina register.**
- **Salah:** **(b)**; site pe Grievance Officer ki jaankari R1 se (ek saada page, dummy), poora raasta R2 me.
- **Trade-off:** (a) me gambhir shikayat aam queue me dabti; (b) me register aur timers ka kaam; (c) me shikayaton ka record nahi.
- **Kanooni detail jaanchi nahi (R-004):** grievance officer, receipt aur hal ke samay, user content ki shikayat ke samay.
- **R1 ya baad me:** page R1; raasta R2.
- **Kis par tika:** D-017, D-026, D-044. Koi khula sawal nahi.

#### B11-6. Seller aur delivery partner ke jhagde

- **Sawal:** seller ya delivery partner platform ke kisi faisle (receiving ka farak, return pe "brand ki galti", bharpai, kaat, payout) se asehmat ho to raasta kya ho?
- **Kyun zaroori:** D-096 (receiving ka farak photo ke saath), D-112 (brand ki galti ka kharcha seller ka), D-063 (bharpai), D-068 aur D-103 (partner ki kaat, "unki baat sun ke") aur D-081 (payout): har jagah faisla platform ka, par asehmati ka raasta tay nahi. D-084 niyam 3 sirf listing ke liye hai.
- **Vikalp:**
  - **(a) Ticket:** seller ya partner ticket bheje, staff dekhe, koi tay samay nahi.
  - **(b) "Dispute" ek alag kaam:**
    1. Faisle ke misaal 7 din (seller) ya 3 din (partner) me, saboot ke saath.
    2. Faisla us team ka senior kare jo pehle faisle me nahi tha (D-084 niyam 3 jaisa).
    3. Faisla misaal 5 kaam ke din me.
    4. Dispute chalte us rakam pe rok (payout ki hold, ya kaat ruki).
    5. Har dispute ka record; seller ke payout statement me dispute ki line.
  - **(c) Sirf Finance tay kare.**
- **Salah:** **(b)**. Saaf samay, nishpaksh faisla, aur jhagde ki rakam ka hisaab saaf.
- **Trade-off:** (a) me maamle latakte; (b) me dispute ka naya kaam aur rakam ki hold; (c) me operations ke maamle Finance ke paas.
- **R1 ya baad me:** R2.
- **Kis par tika:** D-063, D-068, D-081, D-084, D-096, D-103, D-112. Koi khula sawal nahi.

#### B11-7. Sellers aur staff ko kaunse emails

- **Sawal:** din ke 300 emails ki seema me sellers aur staff ko kin baaton ka email jaaye, aur baaki khabar kaise?
- **Kyun zaroori:** D-126 sirf customer ke order emails ka hai. Sellers ko bhi bahut khabrein jaati hain: listing ka "ye badlo" (D-098), receiving ka farak (D-096), expiry ke alert (D-062, D-124), udhaar ka alert aur payment link (D-071, D-103), payout (D-081), recall (D-129), staff invite aur password reset. Sab usi 300 me (D-028).
- **Vikalp:**
  - **(a) Har khabar ka email.**
  - **(b) Sirf zaroori, aur din ka ek saar:**
    1. Account aur security (invite, password reset, sign-in code): OTP wali line me.
    2. Paisa (payout statement, udhaar ka alert aur payment link, fee ka invoice): paise wali line me.
    3. Jinpe seller ka kaam ruke ya tay samay me jawab chahiye (receiving ka farak, listing "ye badlo", recall, batch rokna): din ka ek saar wala email (misaal subah 9 baje), har khabar alag nahi.
    4. Baaki (listing manzoor, stock ki ginti, reviews) sirf in-app aur push.
    5. Staff ko sirf account aur security ke emails; kaam ki khabar app ki queue me.
  - **(c) Seller khud chune** kaunse emails chahiye.
- **Salah:** **(b)**. Ek seller ko din me 1 se 2 emails, aur zaroori baat chhootti nahi.
- **Trade-off:** (a) me sellers badhte hi seema khatam; (b) me saar wale email ka kaam, aur khabar thodi der se; (c) me settings ka kaam aur zyada emails ka jokhim.
- **R1 ya baad me:** R1 (2 sellers aur staff R1 me).
- **Kis par tika:** D-028, D-126, D-131. Koi khula sawal nahi.

#### B11-8. Order ke alawa customer ki khabrein

- **Sawal:** order ke alawa customer ko jaane wali khabrein (area khulne ki khabar, review likhne ki yaad, offers aur sale, points ki expiry, cart me chhoda item) kis raaste se aur kis consent se jaayein?
- **Kyun zaroori:** waitlist R1 me hai (D-046, [PROJECT_PLAN.md](../../docs/PROJECT_PLAN.md) §1 #1). Area khulte hi waitlist ke sab logon ko email jaaye aur log 300 se zyada hon, to us din ki seema khatam aur OTP bhi ruk sakta. Marketing ke liye consent chahiye. Cart ki yaad zyada ho to pareshan karne wali (dark pattern jaisi) ban sakti.
- **Vikalp:**
  - **(a) Sab email se.**
  - **(b) Muft raaste pehle, email seemit:**
    1. Offers aur marketing sirf in-app aur push, sirf alag opt-in se (sign-up pe pehle se tick nahi), kabhi bhi band.
    2. Review ki yaad, points ki expiry aur cart ki yaad: in-app aur push; cart ki yaad ek baar (misaal 24 ghante baad), opt-in se.
    3. Area khulne ki khabar: in-app aur push; email sirf unhe jinke paas push nahi, aur din me "baaki" line ki ek seema tak (misaal 50), baaki agle dinon me.
    4. Har khabar me "ye kyun mila" aur band karne ka raasta.
    5. Ek customer ko hafte me misaal 3 marketing push tak.
  - **(c) Koi marketing khabar nahi.**
- **Salah:** **(b)**. OTP kabhi nahi rukta, aur khabrein consent ke andar.
- **Trade-off:** (a) me bade din pe OTP ruk sakta aur consent ka jokhim; (b) me push band wale customer tak kam pahunch, aur area khulne ki khabar kuch logon ko der se; (c) me growth ka raasta band.
- **Kanooni detail jaanchi nahi (R-004):** marketing khabron ki consent aur band karne ke niyam.
- **R1 ya baad me:** area khulne ki khabar R1; baaki R2.
- **Kis par tika:** D-028, D-046, D-126. Koi khula sawal nahi.

#### B11-9. Consultation ka daam aur seemaayein

- **Sawal:** Beauty Advisor aur Skin & Hair Expert ki consultation (D-025) muft ho ya paid, aur ek customer kitni le sake?
- **Kyun zaroori:** D-025 me flow tay hai (request, time aur link, consult, resolve; cancel aur no-show), par daam aur seema nahi. Paid ho to payment, no-show pe refund aur seva ka invoice ka kaam judta. Expert ke notes sehat ka data hain (D-025).
- **Vikalp:**
  - **(a) Muft, seema ke saath:** ek customer mahine me misaal 2 booking; 2 baar no-show to 30 din booking band; Advisor ka message thread muft (din me misaal 5 sawal).
  - **(b) Advisor muft, Expert paid:** misaal ₹299 (Razorpay test mode); 24 ghante pehle cancel pe poora refund, no-show pe nahi; seva ka invoice platform ka.
  - **(c) Dono muft, bina seema.**
- **Salah:** **(a)**. Payment aur seva ke invoice ka naya kaam nahi, aur seema se bojh seemit.
- **Trade-off:** (a) me Expert ke samay ki keemat nahi; (b) me payment, refund aur invoice ka kaam; (c) me ek insaan ke samay pe koi rok nahi.
- **Kanooni detail jaanchi nahi (R-004):** dermatologist jaise expert ki online consultation ke niyam (D-025 ki dummy row), seva pe GST.
- **R1 ya baad me:** R2.
- **Kis par tika:** D-025, D-034, D-111. Koi khula sawal nahi.

### 4.4 Pehle ke kaam se lene layak

| Kya                                                                                                                                                                                                | Kahan (purana path)                                                                                                                      | Kyun achha                                                           | Kasauti check                                                                                                     | Naye docs me kahan                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Email ki line aur din ka budget: OTP pehle; "baaki" ki alag chhat (300 me 250) taaki aage ke OTP ke liye jagah bache; 80% pe ek warning; baaki agle din; har email ki 5 koshish badhte intezaar se | `backend-old/notify/src/deliveries.ts` (`LANES`, `BUDGET_WARNING`, `reserve`); `backend-old/notify/src/config.ts` (daily 300, other 250) | D-126 niyam 4 ko asli bachav deta hai (§10 point 1)                  | Zaroorat: haan. Takrav: line ke naam D-126 aur D-131 se (OTP; paisa + D-131 wali khabar; baaki). Naya vakya: haan | notify ki TASK.md; OPERATIONS           |
| Bina sign-in codes ki chhat (ghante me 60 code emails, din me 100 sign-up codes)                                                                                                                   | `docs-old/ARCHITECTURE.md` §7.1 (email ka daily budget)                                                                                  | Banawati sign-ups se budget ka bachav                                | Zaroorat: haan (B13-1 ke saath bhi). Takrav: nahi. Naya vakya: haan                                               | identity ki TASK.md; Security Architect |
| Seedhi L1, L2, Grievance Officer; grievance register me ticket number aur timers                                                                                                                   | `docs-old/PRD.md` §5.6; `docs-old/ARCHITECTURE.md` §15 (14)                                                                              | B11-5                                                                | Zaroorat: haan. Takrav: nahi. Timers kanooni (R-004). Naya vakya: haan                                            | support ki TASK.md; FLOWS               |
| Atke maamlon (paisa kata, order nahi bana) ke liye sirf tay aur audit wale "repair" kaam                                                                                                           | `docs-old/PRD.md` §3.2 (Production Support Engineer), §5.6                                                                               | D-118 ke apne aap refund ke baad bhi atka case, bina database chhede | Zaroorat: haan. Takrav: nahi. Naya vakya: haan                                                                    | support ki TASK.md; Security Architect  |
| Har role ki refund aur goodwill ki rakam seema                                                                                                                                                     | `docs-old/PRD.md` §5.6                                                                                                                   | D-130 ki goodwill seema, B10-4                                       | Zaroorat: haan. Takrav: nahi. Naya vakya: haan                                                                    | Security Architect; support ki TASK.md  |
| ₹0 pe live updates polling se                                                                                                                                                                      | `docs-old/ARCHITECTURE.md` §15 (6)                                                                                                       | Advisor thread aur in-app khabar bina hamesha khule connection ke    | Zaroorat: haan. Takrav: nahi. Naya vakya: haan                                                                    | ARCHITECTURE                            |

**Na lein:** phone aur live chat ke tickets aur BPO vendors (`docs-old/PRD.md` §5.6) — D-025 (live chat nahi), D-028 (₹0, domain nahi), aur ek insaan. Area khulne pe sab waitlist ko seedha email (`docs-old/ARCHITECTURE.md` §8, go-live) — 300 ki seema se takrav (B11-8). Delivery ka code har koshish pe naya (`docs-old/ARCHITECTURE.md` §6.5, retention) — D-072 (order ya parcel ka code) se takrav.

## 5. B12: Analytics aur reporting

### 5.1 Ab tak tay

Finance ki poori reports R2 se, R1 me finance me har seller ka hisaab (D-055, [PROJECT_PLAN.md](../../docs/PROJECT_PLAN.md) §1 #11). D-070 (Pro daam ka staff ko mahine ka report), D-072 niyam 4 (baar-baar daawe ka record aur report), D-116 (record R1 se), D-046 (waitlist se agla area kholne ka suggestion), D-062 (expiry ke alert), D-129 (recall ka record), D-081 (payout), D-101 niyam 4 (order line pe "discount, kisne diya"), D-013 (backup), D-053 (performance targets sirf jaage server pe), R-006 (Atlas 0.5 GB aur 10 GB transfer), R-002 (server sota, raat ke timers late).

### 5.2 Domain gaps

- **Customer ke behaviour ka data:** funnel (dekha, cart, order) ke bina conversion samajhna mushkil; par bahar ki analytics service ko data = consent aur privacy, aur apne database me = 0.5 GB (R-006) ka bojh.
- **R1 ke KPIs:** R1 ka lakshya flow parkhna hai (D-055), par kaunse aankde, ye tay nahi.
- **Seller ki reports aur customer data:** fulfilment platform ka (D-014), to seller ko customer ke address ya phone ki zaroorat nahi; par invoice seller ke naam se (D-030). Kanooni detail jaanchi nahi (R-004).
- **Customer ko dikhne wale aankde:** "Bestseller", "sirf 3 bache", "100+ ne kharida": bikri badhate, par galat ho to jhoothi jaldi (dark pattern). Kanooni detail jaanchi nahi (R-004).
- **Export:** seller ka accounting, finance ki books; har export data bahar jaane ka raasta.
- **Roz ki reports sote server pe:** technical (§9, Architect aur DevOps).
- **Search ke aankde (zero result):** B9-4 me.

### 5.3 Proposed sawal

#### B12-1. Customer ke behaviour ka data

- **Sawal:** customer site pe kya dekhta, khojta aur cart me daalta hai, iska data lein ya nahi, aur kya ye bahar ki kisi analytics service ko jaaye?
- **Kyun zaroori:** funnel ke bina pata nahi chalta customer kahan rukta hai. Par bahar ki service ko data jaana = cookie aur consent ka kaam aur privacy ka jokhim; apne database me rakhna Atlas ki 0.5 GB (R-006) ki jagah khaata hai.
- **Vikalp:**
  - **(a) Sirf business events:** server ke events (order, cancel, return, search ke shabdon ki ginti); koi page-level tracking nahi.
  - **(b) (a) + apna halka page data:** bina personal pehchaan ke din ki ginti (kis product ka page kitni baar khula, kitne cart me gaye); kachcha data misaal 30 din, phir sirf din ka jod; bahar koi service nahi.
  - **(c) Bahar ki free analytics service,** cookie consent ke saath.
- **Salah:** **(b)**. Funnel ka moota roop milta hai, data bahar nahi jaata, aur jagah seemit rehti.
- **Trade-off:** (a) me funnel nahi; (b) me apna halka tracking aur jod ka kaam; (c) me consent ka banner, data bahar, aur page pe bahar ki script.
- **Kanooni detail jaanchi nahi (R-004):** tracking aur cookies ki consent.
- **R1 ya baad me:** (a) R1; (b) R2.
- **Kis par tika:** D-028, R-006. Koi khula sawal nahi.

#### B12-2. R1 ke aankde (KPIs)

- **Sawal:** R1 me owner ko (Master aur Head of Operations) kaunse aankde dikhein?
- **Kyun zaroori:** R1 ka lakshya poora flow parkhna hai (D-055); bina aankdon ke pata nahi chalta flow kahan tootta. Har aankde ka data R1 ke events me pehle din se chahiye, baad me jodna mushkil.
- **Vikalp:**
  - **(a) Kuch nahi:** sirf orders ki list.
  - **(b) Chhota set** (din, hafta, mahina):
    1. Orders, GMV (MRP aur diya hua daam dono), average order value.
    2. Cancel % (wajah se), RTO % (D-108), pehli koshish me delivery %, vaade pe delivery % (D-117).
    3. Return % (wajah aur category se, D-079), refund ka samay (D-111), daawon ki ginti (D-072).
    4. Stock: bikne layak, ruka hua aur near-expiry ki rakam (D-062, D-089); storage fee wala maal (D-066).
    5. Waitlist ki ginti district se (D-046); zero result searches.
  - **(c) (b) + target aur alert:** har aankde ka target, tootne pe in-app alert.
- **Salah:** **(b)**; (c) R2 me.
- **Trade-off:** (a) me flow ki kamzori chhupi; (b) me events aur roz ke jod ka kaam; (c) me targets ki setting aur alerts.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-046, D-055, D-062, D-066, D-072, D-079, D-108, D-111, D-117. Koi khula sawal nahi.

#### B12-3. Seller ki reports aur customer ki jaankari

- **Sawal:** seller app me seller ko apni bikri ki kaunsi reports milein, aur customer ki kitni jaankari dikhe?
- **Kyun zaroori:** fulfilment platform karta hai (D-014), to seller ko customer ke address ya phone ki zaroorat nahi. Par invoice seller ke naam se banta hai (D-030), aur brands demand ka data maangte (kis shehar me bikta). Seller ka hisaab R1 me hai (D-055).
- **Vikalp:**
  - **(a) Sab:** naam, phone, address samet.
  - **(b) Kaam ki reports, customer ki pehchaan ke bina:**
    1. Orders aur lines (variant, batch, daam, "discount kisne diya", D-101), returns wajah ke saath (D-079) aur jaanch ka nateeja (D-112), stock batch ke hisaab se umar aur expiry (D-062, D-066), settlement statement (D-081), reviews ka saar.
    2. Customer ki pehchaan: sirf order number, shehar ya district, aur pincode; naam, phone, email, address nahi.
    3. Invoice ki copy me sirf wo jo invoice pe zaroori hai.
    4. Customer ki koi list ya export nahi; seller customer se seedha sampark nahi kar sakta.
  - **(c) Sirf jod:** order ke level ki jaankari bhi nahi.
- **Salah:** **(b)**. Brand ko kaam ka data, aur customer ka personal data kam haathon me.
- **Trade-off:** (a) me personal data bahut haathon me aur customer se bahar sampark ka jokhim; (b) me invoice ki copy ke niyam ki jaanch; (c) me brand apne returns aur stock samajh nahi pata.
- **Kanooni detail jaanchi nahi (R-004):** seller ko customer ka data dena, aur invoice pe customer ki zaroori jaankari.
- **R1 ya baad me:** R1 (reviews ka saar R2).
- **Kis par tika:** D-014, D-030, D-055, D-062, D-066, D-079, D-081, D-101, D-112. Koi khula sawal nahi.

#### B12-4. Customer ko dikhne wale aankde

- **Sawal:** product page aur listing pe "Bestseller", "is hafte 100+ ne kharida", "sirf 3 bache" jaise aankde dikhein ya nahi?
- **Kyun zaroori:** ye bikri badhate hain, par galat ya bana hua aankda jhoothi jaldi hai (dark pattern). Apne brand (D-031) pe bhi wahi niyam.
- **Vikalp:**
  - **(a) Koi aisa aankda nahi.**
  - **(b) Sirf sach, tay niyam se:**
    1. "Bestseller": category me pichhle 30 din ki bikri ke top 10 me (misaal).
    2. "Kam stock": sirf jab bikne layak stock misaal 5 se kam, asli ginti ke saath.
    3. "X ne kharida" nahi (chhoti ginti pe gumraah karta).
    4. Countdown timer sirf jab offer ka asli khatam hone ka samay ho (offers R2).
    5. Har niyam ek policy page pe.
  - **(c) Marketing ki marzi se.**
- **Salah:** **(b)**. Sach aankde customer ke kaam ke hain, aur niyam se bana koi aankda jhooth nahi ban sakta.
- **Trade-off:** (a) me sach aankdon ka fayda bhi nahi; (b) me niyam ki ginti aur page; (c) me dark pattern ka seedha jokhim.
- **Kanooni detail jaanchi nahi (R-004):** jhoothi jaldi aur kam stock dikhane ke niyam.
- **R1 ya baad me:** R1 ("kam stock" aur "Bestseller"); countdown R2.
- **Kis par tika:** D-031. Koi khula sawal nahi.

#### B12-5. Data export

- **Sawal:** kaun apna data file (CSV) me nikaal sake, aur kis roop me?
- **Kyun zaroori:** seller apne orders aur settlement apne accounting me daalte hain, finance ko books chahiye. Par har export personal data bahar jaane ka raasta hai.
- **Vikalp:**
  - **(a) Koi export nahi:** sirf screen pe.
  - **(b) Seemit export:**
    1. Seller: apne orders, settlement aur stock ka CSV, seller ki reports wali jaankari tak (customer ki pehchaan nahi).
    2. Finance staff: ledger aur tax registers (R2; accounting software ka format baad me).
    3. Baaki staff: sirf apne kaam ki list, personal data chhupa ke.
    4. Har export audit me; ek export me misaal 50,000 rows tak.
  - **(c) Sab ko sab.**
- **Salah:** **(b)**.
- **Trade-off:** (a) me seller aur finance ka haath ka kaam; (b) me export ke niyam aur audit; (c) me data ke leak ka bada raasta.
- **R1 ya baad me:** seller ka settlement CSV R1; baaki R2.
- **Kis par tika:** B12-3 (seller ko kya dikhe); D-055.

### 5.4 Pehle ke kaam se lene layak

| Kya                                                                                                                                                                             | Kahan (purana path)                                                                  | Kyun achha              | Kasauti check                                                                                      | Naye docs me kahan                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| CSV export: cursor se stream, formula jaise cell escape, BOM, 50,000 rows ki seema (zyada pe saaf mana, kati file nahi), personal data chhupa, scope ke andar, har export audit | `backend-old/core/src/modules/platform/download.ts`; `docs-old/ARCHITECTURE.md` §6.5 | B12-5 ka surakshit roop | Zaroorat: haan. Takrav: nahi. Naya vakya: haan                                                     | platform ki TASK.md; SECURITY_REQUIREMENTS |
| Roz ke jod (company, Head of Operations, seller, logistics ke aankde)                                                                                                           | `docs-old/ARCHITECTURE.md` §4 (insights)                                             | B12-2                   | Zaroorat: haan. Takrav: nahi; sote server (R-002) pe chhoota din baad me pakadna. Naya vakya: haan | ARCHITECTURE; reports ki TASK.md           |
| Seller ki reports: bikri, return ki wajahein, ratings, stock ki haalat                                                                                                          | `docs-old/PRD.md` §5.2 (Analytics)                                                   | B12-3                   | Zaroorat: haan. Takrav: nahi. Naya vakya: haan                                                     | seller ki TASK.md                          |
| Company aur Head of Operations ka dashboard                                                                                                                                     | `docs-old/PRD.md` §5.5                                                               | B12-2                   | Zaroorat: haan. Takrav: nahi. Naya vakya: haan                                                     | Master app ki TASK.md                      |

**Na lein (abhi zaroorat nahi):** data analyst ke liye alag BI export (`docs-old/ARCHITECTURE.md` §4 insights) — ek insaan, koi analyst role nahi. A/B tests (`docs-old/PRD.md` §5.10) — abhi koi zaroorat nahi, aur daam pe kabhi nahi.

## 6. B13: Compliance ki gehrai: kya dummy, kya asli

### 6.1 Ab tak tay

D-026 (lakshya portfolio, par kal asli business ban sake; design asli, registrations aur kanooni details dummy; dummy values data ya config me, code me nahi), D-012 (asli users maan ke code), D-025 (telemedicine ki dummy row; Meet link pe DUMMY), D-045 (plastic EPR laagu, registration dummy), D-036 (warehouse state ka GSTIN), D-041 (har order ka GST invoice), D-038 (18+ ki ghoshna), D-043 aur D-128 (licence ka type, drug aur AYUSH drug nahi), D-127 (import registration dummy), D-100 (claims ke saboot dummy), D-069 (Pro ke saboot), D-086 (HSN aur GST rate ki table), D-034 aur D-055 (Razorpay test mode), D-027 (e-way bill ki zaroorat compliance ki charcha me), D-058 (hosting Singapore me), R-004 (kanooni jaanch baad me ek agent se).

### 6.2 Domain gaps

- **Live site pe anjaan log:** test mode payments aur nakli delivery ke saath koi anjaan order de to use asli dukaan lagegi; uska personal data hum rakhenge (DPDP); uske sign-up codes 300 emails khaayenge. Kanooni detail jaanchi nahi (R-004).
- **Demo ka nishaan:** asli jaise invoice (GSTIN ke saath) bahar galat istemaal ho sakte; dummy number kisi asli company ke number se mil sakte; owner ke reviews asli customer ke reviews jaise dikhenge (§10 point 4).
- **Har area ki gehrai:** "design asli" ka matlab har kanooni area me alag ho sakta: sirf field, workflow ki rok, ya poora register aur report. [COMPLIANCE.md](../../docs/COMPLIANCE.md) khaali hai; uske "System me kya chahiye" khane ke liye ye chahiye.
- **Legal pages ka content:** sign-up pe consent (versioned) R1 me chahiye; return, refund aur delivery fee ke niyam ab tay hain.
- **DPDP ke haq:** asli personal data (owner aur testers) live pe; data download, account delete, consent wapas. Kuch records kanoon se rakhne (invoice, ledger, tax). Kanooni detail jaanchi nahi (R-004).
- **E-way bill** (D-027 ne yahan bheja), **EPR ka packaging data** (D-045 me sirf registration), **gig partner registration**, **site ke registrations** (Shops & Establishments, jalne wale maal jaise perfume aur nail polish ke liye fire NOC). Kanooni detail jaanchi nahi (R-004).
- **Data kitne din rakhein:** D-072 aur D-130 ne Security Architect ko diya (§9).
- **Hosting region aur data ke niyam:** D-058 (§10 point 5).

### 6.3 Proposed sawal

#### B13-1. Live site pe anjaan log

- **Sawal:** live site (jo sirf owner chalata hai, D-012) pe koi bhi anjaan insaan sign-up karke order de sake, ya sign-up aur order sirf chune hue emails tak ho?
- **Kyun zaroori:** payments test mode me hain (D-055) aur delivery asli nahi hoti. Anjaan insaan order de to use lagega ye asli dukaan hai; uska personal data (address, phone) hum rakhte; aur uske sign-up codes din ke 300 emails (D-028) khaate. Owner ke apne accounts `+` alias se bante hain (D-017).
- **Vikalp:**
  - **(a) Sab ke liye khula,** site pe demo ki patti ke saath.
  - **(b) Dekhna sab ke liye, account sirf allowlist se:**
    1. Dekhna, search, reviews padhna aur pincode check (D-020) sab ke liye.
    2. Sign-up aur sign-in (password, social, email code; D-021) sirf allowlist ke emails se: owner ke base emails aur unke `+` alias, aur owner jinhe jode (testers).
    3. Allowlist ek setting me, bina deploy.
    4. Baaki ko saaf sandesh: "Ye demo store hai."
    5. Seller, delivery aur Creator ke sign-up bhi isi niyam se; waitlist me judna sign-in se.
    6. Asli business pe jaate hi (D-026) allowlist ek setting se band.
  - **(c) Sign-up khula, checkout sirf allowlist ke liye.**
- **Salah:** **(b)**. Code production-grade hi rehta (D-012); anjaan logon ka data aur emails ka bojh nahi aata, aur koi dhokha nahi khaata.
- **Trade-off:** (a) me anjaan ka data, emails ka bojh aur dhokhe ka jokhim; (b) me portfolio dekhne wala sign-up nahi kar sakta (owner chahe to use allowlist me jode); (c) me anjaan ka data aur sign-up codes phir bhi.
- **Kanooni detail jaanchi nahi (R-004):** test mode me bikri dikhane wali site, aur anjaan logon ka personal data.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-012, D-017, D-020, D-021, D-026, D-028. Koi khula sawal nahi.

#### B13-2. Demo aur dummy ka nishaan kahan

- **Sawal:** kin jagahon pe "demo" ya "dummy" ka nishaan dikhe?
- **Kyun zaroori:** D-026: registrations aur kanooni details dummy, data ya config me. Asli jaise dikhne wale invoice (GSTIN ke saath), licence number aur officers ke naam bahar galat istemaal ho sakte (nakli invoice). Dummy number kisi asli company ke number se mil sakta. Owner ke accounts ke reviews asli customer ke reviews jaise dikhte.
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
- **Salah:** **(b)**. Koi bhi page ya file bahar jaaye to bhi asli na lage.
- **Trade-off:** (a) me nakli invoice aur dhokhe ka jokhim; (b) me har PDF aur number ke saath kaam; (c) me download hui file asli lagti.
- **Kanooni detail jaanchi nahi (R-004):** demo site pe dummy registration numbers aur invoice jaise documents.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-025, D-026. Koi khula sawal nahi.

#### B13-3. Har kanooni area me system kitna banaye

- **Sawal:** har kanooni area me system kitna banaye: sirf field, workflow ki rok, ya poora register aur report?
- **Kyun zaroori:** D-026 kehta hai design asli, registrations dummy. Par ek insaan (D-009) har area me poora register nahi bana sakta, aur har area ki zaroorat alag hai. [COMPLIANCE.md](../../docs/COMPLIANCE.md) ka "System me kya chahiye" khana isi se bharega.
- **Teen level:** **L1** = field, dummy value aur dikhana. **L2** = L1 + workflow me rok ya jaanch (iske bina aage nahi). **L3** = L2 + register, report, export aur yaad (filing jaisa nateeja; asli filing nahi).
- **Vikalp:**
  - **(a) Sab L1.**
  - **(b) Area ke hisaab se** (salah wali table):

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
    | Site ke registrations (Shops & Establishments, fire NOC jalne wale maal ke liye)                                      | L1 (field aur expiry ki yaad)                   | R2                                |
    | Telemedicine (D-025)                                                                                                  | L1                                              | R2                                |

  - **(c) Sab L3.**
- **Salah:** **(b)**. Jo paise, tax aur customer ki suraksha se juda hai wo gehra; baaki sirf field, taaki asli business pe jaane pe jagah ho.
- **Trade-off:** (a) me design "asli" nahi rehta (D-026); (b) me har area ka level yaad rakhna (COMPLIANCE.md me); (c) me ek insaan ke liye bahut bada kaam.
- **Kanooni detail jaanchi nahi (R-004):** table ki har row; ye sirf "system kya banaye" ki baat hai, kanoon kya maangta hai ye kanooni jaanch tay karegi.
- **R1 ya baad me:** table ke "Kab" khane ke hisaab se.
- **Kis par tika:** D-009, D-025, D-026, D-027, D-036, D-041, D-045, D-086, D-100, D-127, D-128. Koi khula sawal nahi.

#### B13-4. Legal pages ka content

- **Sawal:** Terms, Privacy, Return, Shipping, Grievance aur Seller agreement jaise pages me kya likha ho?
- **Kyun zaroori:** sign-up pe customer inhe maanta hai (consent ka record, version ke saath), aur seller agreement seller ke judne pe. Return, refund, cancel aur delivery fee ke niyam ab tay hain (D-079, D-080, D-107, D-108, D-110, D-111, D-114), to pages unse mel khane chahiye. Lawyer se jaancha nahi (R-004).
- **Vikalp:**
  - **(a) Placeholder:** "ye demo text hai", koi niyam nahi.
  - **(b) Tay faislon se asli jaisa draft:** Claude tay faislon se pages likhe; har page pe "DUMMY: lawyer se jaancha nahi" badge aur version; Terms ya Privacy ka bada badlav ho to agle sign-in pe naya consent; Return aur Shipping pages ke number policy ki settings se aayein (ek baat ek jagah).
  - **(c) Kisi template site se copy.**
- **Salah:** **(b)**. Customer ko site ke asli niyam dikhte hain, aur design asli rehta (D-026).
- **Trade-off:** (a) me consent ka matlab nahi aur niyam kahin likhe nahi; (b) me pages likhne aur version rakhne ka kaam; (c) me copyright aur galat niyam ka jokhim.
- **Kanooni detail jaanchi nahi (R-004):** in pages ke zaroori hisse.
- **R1 ya baad me:** R1 (sign-up ka consent R1 me).
- **Kis par tika:** D-026, D-079, D-080, D-107, D-108, D-110, D-111, D-114. Koi khula sawal nahi.

#### B13-5. Customer ke data ke haq

- **Sawal:** customer apne data ke kaunse haq app me khud chala sake, aur kab se?
- **Kyun zaroori:** live site pe asli personal data hai (owner aur testers ka). Profile sudhaarna, marketing ki consent band karna, account delete karna, apna data download karna. Kuch records kanoon se rakhne padte (invoice, ledger, tax), to delete pe unme se pehchaan hatani padti. Kanooni detail jaanchi nahi (R-004).
- **Vikalp:**
  - **(a) Koi self-service nahi:** sab support se (R2).
  - **(b) Zaroori R1 me, baaki R2:**
    1. R1: profile sudhaar; marketing consent band; account delete (chalte orders, returns aur refunds ke baad; misaal 7 din ka wapas lene ka samay; invoice aur ledger me naam, pata aur email hata ke ek code).
    2. R2: poore data ka download (file, app se; email attachment nahi), consent ka itihaas, data request ka ticket aur tay samay.
  - **(c) Sab R1 me.**
- **Salah:** **(b)**. Asli data pe zaroori haq pehle din se, aur bada kaam support desk ke saath.
- **Trade-off:** (a) me R1 me asli data pe koi haq nahi; (b) me delete ke saath pehchaan hatane ka kaam R1 me; (c) me R1 bhaari.
- **Kanooni detail jaanchi nahi (R-004):** data ke haq, jawab ka samay, aur records rakhne ka samay.
- **R1 ya baad me:** (b) ke hisaab se.
- **Kis par tika:** D-012, D-041, D-055. Koi khula sawal nahi.

### 6.4 Pehle ke kaam se lene layak

| Kya                                                                           | Kahan (purana path)                                                                                      | Kyun achha                            | Kasauti check                                                                                                                                       | Naye docs me kahan                           |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Dummy legal pages, DUMMY badge aur version; sign-up ka consent usi version se | `frontend-old/customer/app/routes/terms.tsx`; `docs-old/ARCHITECTURE.md` §9 (dummy `/terms`, `/privacy`) | B13-4 ka tareeka                      | Zaroorat: haan. Takrav: nahi. Naya vakya: haan                                                                                                      | identity ki TASK.md; customer app ki TASK.md |
| Dummy integration ka `provider = 'dummy'` aur UI pe DUMMY badge               | `docs-old/ARCHITECTURE.md` §10                                                                           | B13-2                                 | Zaroorat: haan. Takrav: nahi. Naya vakya: haan                                                                                                      | ARCHITECTURE                                 |
| Delete pe kanoon se rakhe records me pehchaan hatana (pseudonymise)           | `docs-old/ARCHITECTURE.md` §6.5 (DPDP erasure)                                                           | B13-5                                 | Zaroorat: haan. Takrav: nahi. Naya vakya: haan                                                                                                      | Security Architect; identity ki TASK.md      |
| Data rakhne ke samay ki shuruaati list                                        | `docs-old/ARCHITECTURE.md` §6.5 (Retention)                                                              | Security Architect ka shuruaati bindu | Zaroorat: haan. Takrav: delivery code ki line (D-072 se alag), baaki nahi. Naya vakya: haan                                                         | Security Architect                           |
| Kanooni matrix ki rows                                                        | `docs-old/PRD.md` §7.1                                                                                   | COMPLIANCE.md ke shuruaati umeedwar   | Zaroorat: haan. Takrav: "apne brand pe TCS aur TDS nahi" wala niyam D-031 se takrata, wo nahi. † wale kanoon jaanche nahi (R-004). Naya vakya: haan | COMPLIANCE.md (kanooni jaanch ke baad)       |

**Na lein:** banawati insaanon ke naam aur phone wale "kanooni contacts" (`docs-old/PRD.md` §7.3) — B13-2 ki salah: sirf role ka naam aur `example` domain ka email. Pune ka 1 warehouse aur 21 hubs wala network (`docs-old/PRD.md` §7.5) — D-014 se takrav.

## 7. Poora kram aur batches

### 7.1 Saare proposed sawal, sabse rokne wala pehle

Kram ka aadhaar: jis sawal pe R1 ka design aur zyada doosre kaam tike, wo pehle. R2 aur baad wale aakhir me. "Batch" §7.2 ka.

| #   | Id    | Sawal (chhota)                              | R1 ya baad me                  | Batch |
| --- | ----- | ------------------------------------------- | ------------------------------ | ----- |
| 1   | B13-1 | Live site pe anjaan log: allowlist ya khula | R1                             | 1a    |
| 2   | B13-3 | Har kanooni area me system kitna banaye     | R1 (row ke hisaab se)          | 1a    |
| 3   | B8-1  | Review ka haq: lines, samay, ginti          | R1                             | 1a    |
| 4   | B8-2  | Moderation: kab jaanch aur kaun             | R1                             | 1a    |
| 5   | B9-1  | Skin type, concern aur actives ka data      | R1 (chhota jod)                | 1a    |
| 6   | B9-3  | Search aur listing me kram ki niti          | R1; sponsored baad me          | 1a    |
| 7   | B11-7 | Sellers aur staff ke emails                 | R1                             | 1a    |
| 8   | B11-8 | Order ke alawa customer ki khabrein         | R1 (area ki khabar); baaki R2  | 1a    |
| 9   | B12-3 | Seller ki reports aur customer ki jaankari  | R1                             | 1a    |
| 10  | B13-2 | Demo aur dummy ka nishaan                   | R1                             | 1a    |
| 11  | B8-3  | Review me kya chhupaya ja sake              | R1                             | 1a    |
| 12  | B11-2 | R1 me customer ki appeal                    | R1 (chhota jod)                | 1a    |
| 13  | B11-1 | "Parcel nahi mila" ki samay-seema           | R1                             | 1a    |
| 14  | B9-2  | R1 ke filters aur sort                      | R1                             | 2     |
| 15  | B12-2 | R1 ke aankde (KPIs)                         | R1                             | 1a    |
| 16  | B13-4 | Legal pages ka content                      | R1                             | 1a    |
| 17  | B13-5 | Customer ke data ke haq                     | R1 kuch, R2 baaki              | 1a    |
| 18  | B9-4  | Zero result aur synonyms                    | R1; request R2                 | 1a    |
| 19  | B9-5  | Stock khatam product aur khabar             | R1 dikhana; khabar R2          | 1a    |
| 20  | B12-4 | Customer ko dikhne wale aankde              | R1                             | 1a    |
| 21  | B8-4  | Review me photo                             | R1 (chhota jod) ya R2          | 1a    |
| 22  | B8-9  | Nakli review pe karwai                      | R1 kuch, R2 baaki              | 1a    |
| 23  | B12-1 | Customer ke behaviour ka data               | R1 events; R2 page data        | 1a    |
| 24  | B8-5  | Muft product aur inaam wale reviews         | R1 niyam                       | 1a    |
| 25  | B12-5 | Data export                                 | R1 seller CSV; baaki R2        | 2     |
| 26  | B8-6  | Seller ka jawab aur shikayat                | R2                             | 1b    |
| 27  | B11-3 | Ticket ke raaste aur categories             | R2                             | 1b    |
| 28  | B11-4 | SLA aur kaam ke ghante                      | R2                             | 2     |
| 29  | B11-5 | Escalation aur Grievance Officer            | Page R1; raasta R2             | 1b    |
| 30  | B11-6 | Seller aur partner ke jhagde                | R2                             | 1b    |
| 31  | B9-6  | Customer ki beauty profile                  | R2                             | 1b    |
| 32  | B8-7  | Reviewer ki skin jaankari                   | R2                             | 1b    |
| 33  | B9-7  | Shade finder                                | R2                             | 1b    |
| 34  | B9-8  | Virtual try-on                              | R2                             | 1b    |
| 35  | B9-9  | Sujhaav (recommendations)                   | R2                             | 2     |
| 36  | B8-8  | Product pe Q&A                              | R2                             | 1b    |
| 37  | B8-10 | Formula badle to reviews                    | R2 (data R1)                   | 1b    |
| 38  | B11-9 | Consultation ka daam aur seema              | R2                             | 1b    |
| 39  | B10-1 | Loyalty program ho ya nahi                  | R2                             | 1b    |
| 40  | B10-2 | Points ke niyam                             | R2                             | 2     |
| 41  | B10-3 | Points ki chhoot ka paisa kaun de           | R2                             | 2     |
| 42  | B10-4 | Store credit                                | R2                             | 1b    |
| 43  | B10-6 | Dobara kharid: yaad ya subscription         | R2; subscription baad me       | 1b    |
| 44  | B10-5 | Gift cards                                  | R2 ke baad (kanooni jaanch pe) | 1b    |
| 45  | B10-7 | Referral                                    | R2 ke baad                     | 2     |

**Ginti:** B8: 10, B9: 9, B10: 7, B11: 9, B12: 5, B13: 5. Kul 45.

### 7.2 Batches

Owner ka niyam: jo sawal kisi khule sawal pe tike nahi, wo ek saath; jo tika ho, wo us sawal ke jawab ke baad.

- **Batch 1 (38 sawal, kisi khule sawal pe tike nahi):** aapas me bhi koi tika nahi, isliye sab ek saath diye ja sakte hain. Bada hai, to main session chahe to do hisson me de (dono ke beech koi dependency nahi, farak sirf zaroorat ka):
  - **1a, R1 wale (23):** B13-1, B13-3, B8-1, B8-2, B9-1, B9-3, B11-7, B11-8, B12-3, B13-2, B8-3, B11-2, B11-1, B12-2, B13-4, B13-5, B9-4, B9-5, B12-4, B8-4, B8-9, B12-1, B8-5.
  - **1b, R2 aur baad wale (15):** B8-6, B11-3, B11-5, B11-6, B9-6, B8-7, B9-7, B9-8, B8-8, B8-10, B11-9, B10-1, B10-4, B10-6, B10-5.
- **Batch 2 (7 sawal, batch 1 ke jawab ke baad):**
  - B9-2 (B9-1 ke baad).
  - B12-5 (B12-3 ke baad).
  - B11-4 (B11-3 ke baad).
  - B9-9 (B9-3 aur B9-6 ke baad).
  - B10-2, B10-3, B10-7 (B10-1 ke baad). B10-1 me "loyalty nahi" chuna gaya to B10-2 aur B10-3 nahi poochhne; B10-7 tab bhi (inaam coupon me).

**Doosra tareeka (OPEN_QUESTIONS ke group wale niyam se):** aapas me jude sawal ek group me saath, aur sab ek hi round me: G1 = B9-1 + B9-2; G2 = B12-3 + B12-5; G3 = B11-3 + B11-4; G4 = B9-3 + B9-6 + B9-9; G5 = B10-1 + B10-2 + B10-3 + B10-7. Baaki 29 sawal akele.

### 7.3 Sirf jaanch (owner ka faisla nahi)

Kanooni wali saari "Kanooni detail jaanchi nahi (R-004)" aur kanooni jaanch ke agent ke liye; tathya wali Claude docs se jaanch sakta hai. Pehle run ki §8.2 wali cheezein yahan dobara nahi.

1. Reviews: platform ya seller ka customer ban ke review, negative review dabana, aur reviews ki moderation ka koi standard (jaise BIS ka online reviews wala standard) zaroori hai ya sirf salah (B8-1, B8-3). (R-004)
2. Inaam ya muft product wale reviews aur endorsement ke label ke niyam (B8-5). (R-004)
3. Reviews jaise user content ke liye intermediary ke niyam: platform rules, shikayat ki receipt aur hatane ke samay (B8-2, B8-3, B11-5). (R-004)
4. Grievance Officer, consumer shikayat ki receipt aur hal ke samay, seller ka grievance contact product page pe (B11-5). (R-004)
5. Kram (ranking) ke mukhya gun batana, apne brand ko aage rakhna, sponsored ka label (B9-3). (R-004)
6. Imported products ke liye country of origin ka filter zaroori hai ya nahi (B9-2). (R-004)
7. Skin type aur concern ke shabd: kahan cosmetic se drug ka daawa ban jaata hai (B9-1). (R-004)
8. Beauty profile (allergy, skin concerns), chehre ki photo (try-on, photo reviews) aur reviewer ki jaankari ki consent (B8-4, B8-7, B9-6, B9-8). (R-004)
9. Loyalty points, promo credit aur gift cards: prepaid instrument ke niyam (closed ya semi-closed, marketplace pe doosre sellers ka maal), kam se kam muddat, KYC, aur GST (B10-1, B10-3, B10-4, B10-5). (R-004)
10. Recurring payment mandate ke niyam, aur Razorpay test mode me subscriptions ya mandates chalte hain ya nahi (B10-6). (R-004 + tathya)
11. Online consultation (dermatologist jaise expert) ke niyam, aur seva pe GST (B11-9). (R-004)
12. Seller ko customer ka data dena, aur B2C invoice pe customer ki zaroori jaankari (B12-3). (R-004)
13. Jhoothi jaldi, "kam stock" aur countdown jaise dark patterns ke niyam (B12-4). (R-004)
14. Tracking, cookies aur marketing khabron ki consent (B11-8, B12-1). (R-004)
15. DPDP: data ke haq, jawab ka samay, delete aur kanoon se rakhe records (tax) ke rakhne ka samay (B13-5). (R-004)
16. Test mode me bikri dikhane wali demo site, dummy registration numbers aur specimen invoices (B13-1, B13-2). (R-004)
17. Warehouse se usi shehar ke hub tak apne stock transfer pe e-way bill (D-027, B13-3). (R-004)
18. Plastic EPR ke liye kaunsa packaging data rakhna padta hai (D-045, B13-3). (R-004)
19. Singapore hosting (D-058) ke saath payment data, logs aur personal data ke desh ke niyam (§10 point 5). (R-004)
20. Tathya: iPhone ke browser me web push sirf home screen pe install ki hui site ko milta hai ya nahi, aur kis version se (B11-8, D-126). Docs se.
21. Tathya: Atlas ke free (M0) cluster pe search indexes ki ginti ki seema, aur autocomplete aur synonyms chalte hain ya nahi (B9-2, B9-4). Docs se.
22. Tathya: Brevo free plan ki din ki seema abhi bhi 300 hai, aur din UTC se gina jaata hai ya kaise (B11-7, B11-8). Docs se.
23. Tathya: browser me device pe chalne wali chehre ki pehchaan (face landmarks) ki free library ka license aur purane phones pe speed (B9-8). Docs se, Architect ke saath.
24. Tathya: review ki photos ke liye free media storage ki seemaayein (B8-4). Docs se, Architect ke saath.

## 8. PRODUCT, FLOWS aur GLOSSARY ke liye prastaav

**Ye sirf prastaav hain.** Naye docs me kuch bhi owner ki haan ke baad, ek-ek karke (D-019, D-074). Neeche ke vakya apne aap me poore hain.

### 8.1 PRODUCT.md (B8 se B13 ke hisse) ki rooprekha

1. **Reviews aur user content:** sirf verified buyer ka review, delivery ke baad; rating product pe, review pe variant; moderation ka tareeka aur niyam (negative raay kabhi chhupane ki wajah nahi); photo; inaam ka niyam; brand ka jawab; nakli review pe karwai (D-039, D-055, D-076; B8-1 se B8-10).
2. **Khoj aur discovery:** search aur filters (skin type, concern, shade family, free-from, claims), kram ki niti (kisi seller ko boost nahi), zero result, stock khatam; beauty profile, shade finder, try-on aur sujhaav R2 se (D-020, D-085, D-099, D-100; B9-1 se B9-9).
3. **Loyalty aur gifting:** points ka roop aur niyam, kharcha kaun de, store credit, gift cards, dobara kharid, referral (D-101, D-111; B10-1 se B10-7).
4. **Support aur khabar:** R1 me return aur daawe ka faisla aur appeal; R2 me tickets, SLA, escalation, Grievance Officer, sellers aur partners ke jhagde; consultation; khabar ke raaste (in-app, browser push, email) aur din ke 300 emails ki line (D-025, D-105, D-126, D-131; B11-1 se B11-9).
5. **Reports aur data:** R1 ke aankde, seller ki reports (customer ki pehchaan ke bina), customer ko dikhne wale aankdon ke niyam, behaviour ka data, export (D-055; B12-1 se B12-5).
6. **Compliance aur demo store:** kya dummy, kya asli; allowlist; demo ka nishaan; har area ka level (L1, L2, L3); legal pages; customer ke data ke haq (D-026; B13-1 se B13-5).

### 8.2 FLOWS.md ke flows ki list

1. Review: delivery → review ki yaad (in-app, push) → likhna (star, text, photo) → apne aap ki jaanch → live ya queue → moderator ka faisla → customer ko wajah → badal ke dobara ya appeal.
2. Review ki report: customer ya seller report → queue → faisla → audit.
3. Brand ka jawab → moderation → live (R2).
4. Formula badla: listing jaanch me "formula badla" → purane reviews pe label → rating do roop me (R2).
5. Search → nateeje (kram ki niti) → zero result → sujhaav aur report me shabd.
6. Stock khatam → "stock aane pe batao" → stock aaya → in-app aur push khabar (R2).
7. Shade finder: sawal-jawab ya "jo shade abhi lagate ho" → milte shades (R2).
8. Try-on: consent → camera (device pe) → shade badalna → band (R2).
9. R1 me customer ki appeal: reject → appeal (naya saboot) → Support Lead ka faisla → aakhri.
10. Ticket: category aur order chunna → raasta → SLA timer (kaam ke ghante) → jawab → band ya escalation → Grievance Officer (R2).
11. Grievance: form → ticket number → receipt ka timer → hal ka timer → register (R2).
12. Seller ya partner ka dispute: faisla → dispute (saboot) → rakam pe rok → senior ka faisla → hisaab me line (R2).
13. Khabar ka raasta: event → in-app hamesha → push (agar chalu) → email sirf niyam se, line aur din ki seema ke andar → zyada ho to agle din.
14. Area khulna → waitlist ki khabar (in-app, push; email din ki seema tak, baaki agle dinon me).
15. Seller ke din ka saar wala email.
16. Consultation booking (D-025 ka flow): request → time aur link → consult → resolve; cancel aur no-show; seema.
17. Loyalty points: order → pending → return window ke baad pakke → kharch → expiry; return pe wapas (R2).
18. Dobara kharid ki yaad → ek tap pe cart (R2).
19. Account delete: request → chalte maamle khatam → wapas lene ka samay → pehchaan hatana (records rehte).
20. Seller ka export: report → CSV → audit.

### 8.3 GLOSSARY.md ke shabd

Pehchaan ke naam (backticks me) sirf prastaav hain; asli naam design me.

| Shabd                          | Matlab                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Verified review                | Us customer ka review jiske order ki line deliver hui; review pe uska variant dikhta hai.       |
| Rating                         | Product ke saare chhupe nahi hue reviews ke stars ka ausat, saare variants ke saath.            |
| Moderation                     | Review ya user content ki jaanch: apne aap ki jaanch, staff ki queue, aur report.               |
| Chhupana (hide)                | Review ko public se hatana, wajah ke saath; wapas ho sakta hai aur audit me rehta hai.          |
| Report                         | Customer ya seller ka kisi review ko galat batana; faisla moderator karta hai.                  |
| Inaam wala review              | Muft product ya inaam ke badle likha review; niyam ke hisaab se rok ya label.                   |
| Brand ka jawab                 | Seller ka kisi review pe ek public jawab, moderation ke saath.                                  |
| Purane formula ka review       | Product ka formula badalne se pehle likha review, label ke saath.                               |
| Q&A                            | Product page pe public sawal aur jawab.                                                         |
| Skin type                      | Twacha ka prakaar: oily, dry, combination, normal ya sensitive.                                 |
| Concern                        | Customer ki khaas zaroorat jiske liye product hai (jaise acne-prone skin), cosmetic shabdon me. |
| Active ingredient %            | Pack pe chhapa kisi khaas ingredient ka % (jaise 10% niacinamide).                              |
| Free-from filter               | Ingredients ki structured list se bana filter, jaise paraben-free.                              |
| Synonym                        | Ek cheez ke kai naam jo search me ek hi maane jaate hain (jaise sunscreen aur sunblock).        |
| Zero result                    | Search jiska koi nateeja nahi; report me jaata hai.                                             |
| Kram (ranking)                 | Search aur listing me products ka order, tay gun se; kisi seller ko boost nahi.                 |
| Sponsored                      | Paise se mili jagah, hamesha label ke saath.                                                    |
| Stock ki khabar                | "Stock aane pe batao": stock aane pe in-app aur push khabar.                                    |
| Beauty profile                 | Customer ki apni optional jaankari: skin type, depth, undertone, concerns, allergy.             |
| Shade finder                   | Customer ki jaankari se milte shades sujhane ka tool.                                           |
| Virtual try-on                 | Camera se chehre pe shade ka rang dikhana, device pe hi.                                        |
| Routine                        | Kram se lagane wale products ka set (jaise cleanser, serum, moisturiser, sunscreen).            |
| Loyalty points                 | Kharid pe mile points jo sirf platform pe chhoot ke roop me kharch hote hain.                   |
| Pending points                 | Return window khatam hone tak ruke points.                                                      |
| Points ki liability            | Diye par na kharche points ki rakam, platform ki zimmedari.                                     |
| Promo credit                   | Platform ka diya balance (goodwill ya promotion); refund ka raasta nahi.                        |
| Gift card                      | Pehle se khareedi rakam jo koi doosra platform pe kharch kare.                                  |
| Dobara kharid ki yaad          | Consumable khatam hone ke andaaze pe in-app aur push yaad.                                      |
| Subscription                   | Tay din pe apne aap order aur payment.                                                          |
| Referral                       | Purane customer ke bulaane se aaya naya customer, inaam ke niyam ke saath.                      |
| Ticket                         | Support ka ek maamla: category, order se jod, baat-cheet aur haalat.                            |
| SLA                            | Pehle jawab aur hal ka tay samay, kaam ke ghanton me.                                           |
| Kaam ke ghante                 | Support ke din aur samay jinme SLA gina jaata hai.                                              |
| Appeal                         | Reject hue faisle pe ek baar dobara jaanch, doosre role se.                                     |
| Escalation                     | Maamla ek level se upar wale ke paas jaana.                                                     |
| Grievance                      | Customer ki aupchaarik shikayat, ticket number aur timers ke saath.                             |
| Grievance Officer              | Shikayaton ka zimmedar role; site pe uski (dummy) jaankari.                                     |
| Grievance register             | Har shikayat, faisle aur samay ka record.                                                       |
| Dispute                        | Seller ya delivery partner ki platform ke faisle se asehmati, saboot ke saath.                  |
| Khabar ka raasta (channel)     | In-app, browser push ya email.                                                                  |
| Email ki line (lane)           | Din ki seema ke andar emails ka kram: OTP, paisa, baaki.                                        |
| Saar wala email (digest)       | Din ki kai khabron ka ek email.                                                                 |
| Opt-in                         | Customer ki alag haan, pehle se tick nahi.                                                      |
| KPI                            | Flow parkhne ka ek tay aankda.                                                                  |
| GMV                            | Ek samay me orders ki kul rakam.                                                                |
| Export                         | Data ka file (CSV) me nikalna, audit ke saath.                                                  |
| Allowlist                      | Wo emails jinse live site pe account ban sakta hai.                                             |
| Demo store                     | Live site jahan asli bikri, payment ya delivery nahi hoti.                                      |
| DUMMY badge                    | Banawati registration number ya kanooni detail ke saath dikhne wala nishaan.                    |
| Specimen watermark             | Invoice jaise PDF pe "asli document nahi" ka nishaan.                                           |
| Compliance level               | Kanooni area me system ki gehrai: L1 field, L2 workflow ki rok, L3 register aur report.         |
| Pehchaan hatana (pseudonymise) | Delete pe kanoon se rakhe record me naam, pata aur email ki jagah ek code.                      |

## 9. Aage ke agents ke liye

### 9.1 Security Architect

- Nakli review aur kai accounts ke signals: ek hi device, address ya payment wale accounts, `+` alias ke jhund (D-017), ek product pe achanak bahut reviews, naye accounts ke turant reviews, seller ke staff ka apne brand pe review (B8-9).
- `+` alias aur per-customer seemaayein: D-109 ka "naye customer ka pehla order" aur D-116 ki return seema naye alias account se reset ho sakti (§10 point 2); rok address, device aur payment pe bhi.
- Photo uploads (reviews, daawe D-106): EXIF aur location hatana, file ka type aur size, malware ki jaanch; review ki photo manzoori ke baad public, daawe ki photo private.
- User content (review, brand ka jawab, Q&A) me script aur link ka bachav.
- Beauty profile, allergy aur skin concerns (B9-6): alag consent purpose; sirf customer dekhe; seller ko kabhi nahi.
- Try-on (B9-8): camera device pe hi, koi upload nahi; SR-001; try-on page pe bahar ki koi script nahi.
- Email budget ek DoS ka raasta: bina sign-in "Contact us", grievance form, waitlist, sign-up codes; rate limit aur bot ki rok (lene layak, B11 table).
- Allowlist (B13-1) har sign-in raaste pe (password, social, email code) aur har app me.
- Export (B12-5): personal data chhupa, step-up, audit, row ki seema, formula injection (lene layak).
- Points, promo credit, gift card (B10): balance paise jaisa; ek saath do baar kharch (concurrency), idempotent redemption, finance (PostgreSQL) me ledger.
- Support: atke maamlon ke "repair" sirf tay aur audit wale; refund aur goodwill ki role-wise seema; maker-checker.
- Data rakhne ke samay ki list (D-072 aur D-130 ne yahan bheja): review aur daawe ki photos, delivery ki photo aur location, skin reaction ke case, consultation notes (D-025), tickets aur grievances, waitlist, in-app inbox, behaviour ka kachcha data (B12-1, misaal 30 din), band accounts. Shuruaati list lene layak (B13 table), delivery code wali line ke bina.
- Account delete (B13-5): services ke beech pehchaan hatane ka event; data download app se, email attachment nahi.

### 9.2 Kanooni jaanch agent

- §7.3 ke items 1 se 19.
- Purane kaam ki kanooni matrix ki rows (B13 table) ko COMPLIANCE.md ke umeedwar ki tarah parakhna; "apne brand pe TCS aur TDS nahi" wala niyam D-031 ke baad laagu nahi lagta (pehle run ka §11 point 10).
- B13-3 ki table ki har row: kanoon kya maangta hai, aur level kam ya zyada hona chahiye ya nahi.
- B10-5 (gift cards) ka jawab is jaanch pe tika hai.

### 9.3 Principal Software Architect

- Khabar ka ek faisla-bindu (notify): har event pe in-app hamesha, push agar chalu, email sirf D-126, D-131, B11-7 aur B11-8 ke niyam se; har line ki din ki chhat (§10 point 1); zyada ho to agle din; seller ke saar wale email ka builder.
- Reviews kis service me (D-011 ka draft): haq order line se (commerce), product catalog me; rating ka jod catalog ke read model me events se.
- Search: Atlas free cluster ki search seemaayein (§7.3 item 21); synonyms staff setting se bina deploy (D-037); zero result ka log; kram ke gun (rating, 30 din ki bikri, stock) events se; Pro daam (D-065) har dekhne wale ke hisaab se, aur cache ka mel.
- Try-on sirf browser me; shade ke hex se rang.
- Behaviour ka data aur aankde: har service ke events se ek insights jagah; Atlas ki 0.5 GB (R-006); sote server (R-002) pe chhoote din ka catch-up.
- Tickets aur SLA: order, parcel aur line se jod; kaam ke ghante aur chhuttiyon ka calendar (D-117 ki settings jaisa); server soya ho to jaagne pe timer ka hisaab, exact cron pe bharosa nahi.
- Points, promo credit aur gift card ka ledger finance (PostgreSQL) me; return window ke baad points pakke hone ka event.
- Allowlist identity ki setting; demo ki patti app-shell me; invoice generator me watermark.
- Data export aur account delete ka kai services me chalna (events).

### 9.4 Database Architect

- Review: product, variant, order line, customer, rating, text, photos, us waqt ka listing version (B8-10), status, moderation ka itihaas, edit ka itihaas; B8-1 (b) ho to (customer, product) pe unique.
- Rating ka jod product aur variant ke hisaab se, aur reviewer ki jaankari (B8-7) ke hisaab se, pehle se gina.
- Search ke shabd aur zero result ki din ki ginti; behaviour ka kachcha data TTL ke saath.
- Khabar: in-app inbox TTL ke saath; email deliveries line aur din ki ginti ke saath; consent aur pasand version ke saath.
- Tickets aur SLA: haalat ka itihaas, timers, calendar; grievance register sirf jodne wala (badalna nahi).
- Points ka ledger double-entry, kamaane ki tareekh ke hisaab se expiry (pehle kamaya, pehle expire).
- Consent records: version, purpose, samay, kahan se.
- Review photos ka sirf metadata database me; images bahar (R-006).

### 9.5 DevOps / SRE

- Emails ki din ki ginti aur 80% pe warning (lene layak); alert owner ko in-app ya push se, email se nahi.
- Jobs: SLA timers, points expiry, dobara kharid ki yaad, seller ka subah ka saar, waitlist ki khabar din-ba-din: sab sote server (D-028) ke saath, jaagne pe catch-up; server jagane ka samay saar wale email ke samay se milana.
- Search index aur synonyms ke badlav ka release step.
- Backup (D-013) me reviews, tickets aur consents bhi; restore ki jaanch.
- Finance database (Neon) ke CU-ghante (R-014): points aur gift card ka ledger finance ko zyada jagayega.
- Push ki VAPID keys secret ki tarah; kabhi commit nahi.

### 9.6 UX

- Review form: star, text, photo (chehre ki ijazat ka tick), reviewer ki optional jaankari; chhote niyam; "Verified purchase" aur "Demo review" ke nishaan; variant dikhe.
- Reviews ki list: shade aur skin type se filter, sort, "helpful" vote, brand ka jawab; chhupe review ki wajah sirf likhne wale ko.
- Search: zero result ka page, "kya aapka matlab", filters, "Out of stock" aur "stock aane pe batao", Pro daam ka dikhna.
- Shade finder ke sawal sirf rang pe tike na hon (accessibility); try-on se pehle camera ki samjhaish; "rang alag dikh sakta" note.
- Khabron ka in-app inbox; push ki ijazat pehli visit pe nahi, kaam ke waqt; marketing opt-in bina pehle tick ke.
- Support: category, phir order ya line, phir saboot; SLA ki umeed dikhe; appeal ka button aur aakhri tareekh; grievance page.
- Demo ki patti aur DUMMY badges; legal pages ka version aur naya consent.
- Account delete: kya rahega aur kyun, wapas lene ka samay.
- Koi pehle se tick box nahi, koi jhoothi jaldi nahi (B12-4).

### 9.7 QA

- Review ka haq: lauta, RTO, cancel, Pro line, dobara kharid, moderation ke baad edit, delete.
- Ek saath kai reviews aur chhupane pe rating ki sahi ginti.
- Moderation: chhupana aur wapas dikhana, audit, appeal doosre account se.
- Email budget: line aur chhat bade din pe (waitlist ke 1,000 log, 500 customers ka recall); OTP kabhi na ruke; din ka badalna; agle din bhejna.
- Seller ka saar wala email: kya aur kab; staff ke security emails.
- SLA timers: kaam ke ghante, chhuttiyan, rukna aur chalna, sota server.
- Search: synonyms, spelling ki galti, zero result ka log, out-of-stock neeche; test jo saabit kare ki kram seller ki pehchaan nahi dekhta.
- Points: pending se pakke, adha return, expiry ka kram, kharch ki seema, ek saath do baar kharch.
- Allowlist: har sign-in raaste pe rok (password, social, email code), waitlist.
- Export: formula injection, row ki seema, chhupa personal data, audit entry.
- Account delete: pehchaan hate invoice sahi rahein; chalte orders pe rok.
- Har PDF pe demo ka watermark.
- Mutation testing sirf paisa, stock aur permissions ki badli lines me (CLAUDE.md); points aur gift card ka paise wala logic isme aata hai.

## 10. Tay faislon pe dhyaan

Ye faisle dobara khole nahi ja rahe; sirf jokhim ya kami, wajah ke saath. Kuch badalna ho to owner ki haan se "badla" line (D-018).

1. **D-126 niyam 4, D-131 aur D-046: line se OTP ki jagah pakki nahi hoti.** Line ka kram sirf ek saath khade emails me kaam karta hai. Subah waitlist ki khabar (D-046) ya bade recall (D-131: har customer ko email) ke 300 emails nikal gaye, to shaam ke OTP ke liye jagah nahi bachti, chahe OTP line me sabse pehle ho. Zaroorat: har line ki din ki chhat (misaal "baaki" 200 tak, paisa aur D-131 wali khabar 250 tak, OTP ke liye hamesha jagah), aur bade burst ko agle dinon me baantna. Purane kaam me yahi tha ("other" ki chhat 250; B11 table). Ek line ka spashtikaran D-126 me, ya Architect ke saath design me.
2. **D-017 ka `+` alias aur per-customer seemaayein.** Alias jaan-boojh ke normalise nahi hota (owner ke accounts ke liye). Isse ek insaan ke kai accounts aasaan: D-109 ka "naye customer ke pehle order" ki seema aur D-116 ki baar-baar return ki seema naye account se reset ho sakti; B8-9 aur B10-7 me bhi. D-017 badalne ki zaroorat nahi; rok address, device aur payment ke jod pe bhi ho (Security Architect, §9.1).
3. **D-099 ki "allergen ki chetavni" saaf nahi:** sabke liye ek jaisi (product me jaane-maane allergens) ya customer ki apni allergy se? Personal ho to R1 me customer ki allergy ka data (sehat ke paas) chahiye, jo R1 me tay nahi. Salah: D-099 ki R1 chetavni sabke liye ek jaisi; personal chetavni B9-6 ke saath R2 me. Ek line ka spashtikaran.
4. **D-039, D-055 aur owner ke apne accounts (D-017): demo ke saare reviews owner ke.** Asli duniya me platform ya seller ka customer ban ke review nakli review ginta (Kanooni detail jaanchi nahi (R-004)). Live site pe bhi koi dekhe to ye asli reviews lagenge, khaas kar apne brand (D-031) pe. Salah: demo ke reviews pe "Demo review" ka nishaan (B13-2 niyam 6).
5. **D-058 (Singapore) aur "kal asli business" (D-026).** Region baad me nahi badalta (R-012). Payment data, logs aur personal data ke desh ke niyam asli business pe India me rakhne ki maang kar sakte hain (Kanooni detail jaanchi nahi (R-004)). Tab ye migration ka kaam banega. Abhi kuch badalna nahi; kanooni jaanch (§7.3 item 19) me pehle dekhna.
6. **D-126 aur iPhone pe push.** Agar iPhone ke browser me push sirf home screen pe install ki hui site ko milta hai (§7.3 item 20), to bahut se customers "push band" jaise rahenge aur unhe dispatch ya der ki khabar sirf in-app milegi. D-126 ke asar me ye jokhim maana gaya hai; sirf iska andaaza: install karne ka sujhaav (D-042) is jokhim ko kam karta hai.

## Change log

| Version | Date       | Badlav                                                                                                                                   |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-19 | Pehla version: B8 se B13 ki domain report (Agent 2, run 2), 45 proposed sawal, 2 batches, lene layak cheezein aur tay faislon pe dhyaan. |
