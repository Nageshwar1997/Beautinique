# BUSINESS DOMAIN ANALYSIS: Beautinique (B1 se B7)

> **Status:** v1.0.0 (2026-11-18). Agent 2 run 1: B1 se B7.

## 0. Kaise padhein

- Ye Agent 2 (Business Analyst + cosmetics domain expert) ki report hai, pehla run: topics B1 se B7 ([OPEN_QUESTIONS.md](../../docs/OPEN_QUESTIONS.md) §1). B8 se B13 doosre run me.
- **Ye faisla nahi hai.** Har sawal sirf prastaav hai; main session jaanch ke owner se ek-ek karke poochhega. "Salah" Claude ki raay hai, faisla nahi.
- Tay faisle (D-001 se D-074, Q-001 se Q-015) dobara sawal nahi bane. Unme jokhim ya kami dikhi to sirf §11 me.
- Sawalon ke ID `B3-1` jaise (topic + kram); Q number main session dega. Har sawal akela jawab diya ja sake, isliye "Kis par tika" me sirf wo likha jo pehle tay ho to achha.
- Har topic section: **Ab tak tay**, **Domain gaps**, **Proposed sawal** (sabse rokne wala pehle), **Pehle ke kaam se lene layak** (D-074 niyam 2).
- Saare numbers **misaal** hain jab tak owner na kahe. Koi kanooni baat jaanchi nahi: har jagah "Kanooni detail jaanchi nahi (R-004)".
- §8 me saare sawalon ka ek kram, aur sirf jaanch wali cheezein alag. §9 me PRODUCT, FLOWS, GLOSSARY ke prastaav. §10 aage ke agents ke liye. §11 tay faislon pe dhyaan.
- Ye report purane kaam ke paths le sakti hai (ye naya doc nahi). §9 ke prastaav naye docs ke liye hain, isliye unme purane kaam ka zikr nahi.

## 1. B1: Fulfilment aur logistics

### 1.1 Ab tak tay

D-014 (sirf apna warehouse aur apne delivery partners, carrier port, return pickup bhi apne partners, 1 warehouse + 1 hub), D-015 (seedhi, switch aur live), D-016 (pincode → ek hub, 10 niyam), D-022 (area settings me delivery promise ki keys, staff ki list data me), D-027 (warehouse aur hub ke beech kiraye ka transporter, trip record), D-033 (gig partners), D-035 (Pune se launch), D-046 (waitlist), D-063 (hamari zimmedari receiving se delivery tak), D-068 (vasooli saboot se), D-072 (delivery code, photo aur location). R1: 1 warehouse + 1 hub (D-055).

### 1.2 Domain gaps

- **Delivery promise ka roop:** D-022 me keys hain, par vaada kis roop me (din ki range, tareekh, slot) aur warehouse ka cut-off tay nahi.
- **Delivery na ho paaye:** kitni koshish, hub pe parcel kitne din, customer ke mana karne pe kya, aur RTO (wapas warehouse) pe refund kab.
- **Brand ka maal aana (inbound):** pehle se suchna (ASN) zaroori ya nahi, aur receiving pe ginti, batch ya MRP ka farak nikle to kya. D-063 ki zimmedari "accept" se shuru hoti hai, par accept ka matlab saaf nahi.
- **Live hone ki staff list:** D-015 ki "staff ki list poori" ke liye shuru me kaunse roles kitne ([OPEN_QUESTIONS.md](../../docs/OPEN_QUESTIONS.md) §1 B1 me khula).
- **Cosmetics ki packing aur rakhna (operations, owner ka faisla nahi):** liquid ko leak-proof bag me, kaanch ki perfume bottle ko cushioning, garmi me pighalne wale products (lipstick, balm) ka dhyaan (Pune ki garmi me do-pahiya delivery), aur jalne wale products (perfume, nail polish, nail polish remover, aerosol) ka warehouse me alag rakhna. Ye SOP me jaayega (§10).
- **Chhutti aur Sunday:** delivery ke din aur cut-off area setting me (B1-1 ke saath).

### 1.3 Proposed sawal

#### B1-1. Delivery ka vaada aur cut-off

- **Sawal:** customer ko delivery ka vaada kis roop me dikhe (product page ke pincode check, cart aur checkout pe), aur warehouse ka roz ka cut-off kya ho?
- **Kyun zaroori:** pincode check bina sign-in bhi hota hai (D-020), aur wahan delivery ka vaada dikhta hai. D-022 me keys hain par model nahi. Transporter ke trips (D-027) ka samay isi vaade se banta hai. Galat vaada sabse aam complaint hai.
- **Vikalp:**
  - **(a) Din ki range:** "2 se 4 din me", har sub-district ke liye ek setting.
  - **(b) Tareekh, cut-off ke saath:** "aaj 2 baje (misaal) tak order to kal delivery"; warehouse se hub ka roz ek trip (misaal shaam 4 baje); Sunday aur chhuttiyan area setting me; vaada toote to order pe "der" ki haalat aur customer ko in-app, email aur browser push se khabar.
  - **(c) Time slot:** customer delivery ka slot chune; har hub ki capacity ka hisaab chahiye.
- **Salah:** **(b)**, slot nahi. Ek warehouse aur ek hub ke saath tareekh ka vaada sach rakha ja sakta hai, aur customer ko range se zyada bharosa milta hai. Vaada toote to R1 me koi muavza nahi, sirf saaf khabar.
- **Trade-off:** (a) sabse saral par kam bharosa; (b) me cut-off, chhuttiyon aur trip ke samay ki settings; (c) me capacity engine, ek insaan ke liye bhaari.
- **R1 ya baad me:** R1 (pincode check aur checkout R1 me).
- **Kis par tika:** D-022, D-027; B1-2.

#### B1-2. Delivery na ho paaye (failed attempt) aur RTO

- **Sawal:** customer na mile, address na mile, ya customer parcel lene se mana kare, to kitni baar koshish ho, aur phir kya?
- **Kyun zaroori:** R1 me delivery hai. Prepaid order pe refund ka samay, delivery pe UPI wale order (D-034) pe stock wapas, aur har koshish ka kharcha isi se tay hota hai. D-072 ka code na mile wala niyam "delivered" ke liye hai, "nahi hua" ke liye nahi.
- **Vikalp:**
  - **(a) Ek koshish:** fail hote hi RTO; prepaid ka refund.
  - **(b) Do koshish (misaal):** har fail pe wajah (ghar band, address galat, customer ne mana kiya) aur customer ko in-app, email aur browser push se khabar, agla din chunne ka option; parcel hub pe zyada se zyada 3 din (misaal); phir RTO. Customer ne saaf mana kiya to doosri koshish nahi, seedha RTO. Prepaid ka poora refund RTO ka hub pe scan hote hi shuru (parcel tab bhi hamari zimmedari me hai, D-063). RTO maal warehouse me receiving jaisi jaanch ke baad stock me.
  - **(c) Teen koshish,** aur customer kabhi bhi agla din badal sake.
- **Salah:** **(b)**. Refund ko warehouse pahunchne tak rokne ki zaroorat nahi: parcel hamare paas hai, nuksaan ho to D-063 laagu. Baar-baar mana karne wale customer ka record B5-2 (delivery pe UPI band karna) me kaam aata hai. Delivery fee (agar B4-3 me lage) customer ki galti wale RTO pe wapas nahi.
- **Trade-off:** (a) me customer ko doosra mauka nahi, chhoti galti pe order khatam; (b) me hub pe parcel rakhne ki jagah aur din ki ginti; (c) me kharcha aur hub ka bojh zyada.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-034, D-063, D-072; B4-3, B5-2.

#### B1-3. Brand ka maal warehouse aana: pehle se suchna (ASN) aur farak

- **Sawal:** brand maal bheje to pehle seller app me shipment ki suchna (variant, batch, mfg date, expiry, har batch ka MRP, ginti) zaroori ho? Aur receiving pe ginti ya batch me farak nikle to kya?
- **Kyun zaroori:** batch aur expiry ki jaanch receiving pe hoti hai (D-014), receiving ki expiry seema (D-062 niyam 1), batch ka MRP aur daam ka mel (D-064 niyam 2), hamari zimmedari "accept" se shuru (D-063), aur storage fee ki ghadi receiving ki tareekh se (D-066). In sabke liye accept kya hai, ye saaf hona chahiye.
- **Vikalp:**
  - **(a) Bina suchna:** maal aaye, staff jo gine wahi record, seller ko report.
  - **(b) Suchna zaroori:** receiving pe suchna se milan. Farak (kam, zyada, galat batch, toota aaya) seller ko photo ke saath report; seller tay din (misaal 7) me aitraaz kar sake. Jo maal accept nahi hua (toota aaya, expiry seema se kam) wo brand ke kharche pe wapas, ya brand kahe to nasht aur fee (D-062 jaisa). Bina suchna aaya maal alag rakha jaata hai (hold), seller ko alert; tay din me suchna na bane to wapas. Accept = receiving pe ginti aur jaanch poori hokar staff ka "accept" scan; zimmedari aur storage fee ki ghadi isi pal se.
  - **(c) Suchna + aane ka slot:** warehouse ki capacity ke hisaab se brand slot book kare.
- **Salah:** **(b)**; slot (c) tab jab sellers badhein. Suchna me har batch ka MRP pehle se aane se D-064 niyam 2 ka alert maal pahunchne se pehle hi seller ko mil jaata hai.
- **Trade-off:** (a) me farak pe jhagda (kiski ginti sahi); (b) me seller ka ek extra form; (c) me scheduling ka kaam.
- **R1 ya baad me:** R1 (maal warehouse me, R1 #5).
- **Kis par tika:** D-014, D-062, D-063, D-064, D-066; B3-9, B3-10.

#### B1-4. Hub aur warehouse live hone ki shuruaati staff list

- **Sawal:** D-015 ki shart "staff ki list poori" ke liye shuru me kaunse roles kitne hon?
- **Kyun zaroori:** list data me hai aur Master badalta hai (D-022), par shuruaati list chahiye; R1 me hub live karna isi pe tika hai.
- **Vikalp:**
  - **(a) Kam se kam:** hub: 1 Hub Manager, 1 Hub Operations (scan aur sort), 2 Delivery Partners. Warehouse (district live ke liye): 1 Warehouse Manager, 1 Receiving, 1 Pick-Pack, 1 Returns QC.
  - **(b) Backup ke saath:** har kaam ke 2, hub me 5 Delivery Partners.
  - **(c) Bahut kam:** 1 Hub Manager + 1 Delivery Partner.
- **Salah:** **(a)**. Owner ke alag accounts (D-017) se poori ho jaati hai, aur ek insaan kai roles rakh sakta hai (D-054). Asli launch pe (b) sirf setting badal ke.
- **Trade-off:** (a) me ek role ka account band ho to hub chetavni pe (D-022); (b) me R1 ke liye zyada accounts; (c) me "list poori" ka matlab hi kamzor.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-015, D-017, D-022, D-054; B2-2.

### 1.4 Pehle ke kaam se lene layak

| Kya                                                                                                                                                      | Kahan (purana path)                                                                 | Kyun achha                                                                                                                  | Kasauti check                                                                                                                                                                                    | Naye docs me kahan                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Area setting ka resolver: default ek jagah, neeche wala level upar wale ko override kare, sabse specific jeete; har key ka description aur valid default | `packages-old/shared/contracts/src/area-settings.ts`; `docs-old/ARCHITECTURE.md` §8 | Delivery promise, cut-off, chhuttiyan, koshishon ki ginti, delivery pe UPI ki seema: sab ek tareeke se, bina deploy (D-037) | Zaroorat: haan (D-022). Takrav: purana resolver pincode → district → state → global tha, sub-district level nahi; naye me D-015 ki seedhi (sub-district samet) ke saath likhna. Naya vakya: haan | location module ki TASK.md; GLOSSARY ("Area setting") |
| Tay koshishon ke baad RTO                                                                                                                                | `docs-old/ARCHITECTURE.md` §15 (13)                                                 | B1-2 ka seedha roop                                                                                                         | Zaroorat: haan; takrav nahi; naya vakya: haan                                                                                                                                                    | FLOWS (delivery)                                      |
| Warehouse pe pack ki photo                                                                                                                               | `docs-old/ARCHITECTURE.md` §15 (12); `docs-old/PRD.md` §5.8                         | "Parcel me item kam tha" ke daawe me hamara saboot (B7-3)                                                                   | Zaroorat: haan; D-072 jaisa saboot; naya vakya: haan                                                                                                                                             | FLOWS (pick aur pack); logistics TASK                 |
| Receiving pe gadbad wala maal alag (quarantine)                                                                                                          | `docs-old/ARCHITECTURE.md` §15 (10)                                                 | Jaanch tak maal bikne layak stock se alag (D-062 niyam 1)                                                                   | Zaroorat: haan; takrav nahi; naya vakya: haan                                                                                                                                                    | inventory TASK; GLOSSARY                              |
| Scan karke pick (galat shade na jaaye)                                                                                                                   | `docs-old/PRD.md` §3.2 (Fulfilment Associate)                                       | Cosmetics me galat shade sabse aam galti                                                                                    | Zaroorat: haan; B3-10 pe tika; naya vakya: haan                                                                                                                                                  | logistics TASK                                        |

**Na lein:** pehle din poora Pune district (21 hubs) — D-014 se takrav. Customer ko masked call — D-028 (₹0) aur telephony provider chahiye. Near-expiry maal platform khud beche (liquidation) — D-060 aur D-062 se takrav. Map ke zones (third-party maps) — koi faisla nahi, aur pincode → hub (D-016) kaafi.

## 2. B2: Apps aur roles

### 2.1 Ab tak tay

D-010 (11 apps), D-017 (roles ki poori list, owner ke alag accounts), D-025 (Skin & Hair Expert, Beauty Advisor), D-031 (house brand account), D-044 (Head of Operations), D-047, D-054 (har role apne module ke saath), D-059. Support desk R2 se (D-055).

### 2.2 Domain gaps

- **Seller aur catalog ki jaanch ka daayra:** D-015 ke area roles (Master = State, Super Admin = District, Admin = Sub-District) location ke switches ke liye hain. Seller ki manzoori aur product listing ki jaanch (R1 #3, #4) kis daayre ke staff ki, tay nahi.
- **R1 me customer ke maamle:** return ki manzoori, D-072 ka "parcel nahi mila" daawa aur refund R1 me hain, par support desk R2 se. Ye kaam kaun kare, tay nahi (§11 bhi dekho).
- **Maker-checker** (paisa aur fees wale kaam do accounts se) security ka design hai: §10.

### 2.3 Proposed sawal

#### B2-1. Seller aur catalog ki jaanch ka daayra

- **Sawal:** seller ki manzoori (dummy KYC, D-036 ka GSTIN) aur product listing ki jaanch kis daayre ka staff kare: poore desh ki ek team, ya state ke hisaab se?
- **Kyun zaroori:** catalog poore India me dikhta hai (D-035) aur seller ka state uske warehouse wale GSTIN se (D-036). Isi se permissions ka scope, kaam ki queue aur appeal ka niyam banta hai.
- **Vikalp:**
  - **(a) Dono national:** Seller Ops (D-044) ki ek national team seller manzoor kare; har naye warehouse state ke GSTIN ki jaanch usi queue me alag item. Catalog ki jaanch ek national team, category ke hisaab se kaam bata hua.
  - **(b) Seller state-wise, catalog national:** seller ki manzoori warehouse state ke staff ke paas, catalog national.
  - **(c) Dono state-wise.**
- **Salah:** **(a)**. Abhi ek hi warehouse state hai, aur product ek hi baar jaanchna chahiye chahe wo kitne states me bike. Appeal ka niyam: jisne reject kiya, wo appeal tay nahi karta.
- **Trade-off:** (a) me states badhne pe ek team pe bojh; (b) me seller ka ek state ka staff aur doosre state ka GSTIN alag log jaanchenge; (c) me ek product kai baar jaanchna padta.
- **R1 ya baad me:** R1 (seller aur catalog ki staff approval R1 me).
- **Kis par tika:** D-015, D-036, D-044.

#### B2-2. R1 me customer ke maamle kaun sambhale

- **Sawal:** R1 me return ki manzoori, "parcel nahi mila" ka daawa (D-072) aur refund ki manzoori kaunsa staff role kare, aur kis app me, jabki support desk R2 se hai?
- **Kyun zaroori:** R1 me return aur refund hai (D-055), D-072 me staff jaanch hai. Bina role ke R1 ka order flow aadha.
- **Vikalp:**
  - **(a) Support Desk app ka patla hissa R1 me:** ek role (misaal "Support Agent") sirf order dekhe, return manzoor ya reject kare, daawe ka faisla kare, refund shuru kare. Tickets, SLA aur macros R2 me.
  - **(b) Logistics Ops app me:** Returns QC aur Hub Manager hi ye kaam karein.
  - **(c) Kam se kam staff:** return request apne aap manzoor jab wajah aur photo (B7-3) poore hon; aakhri faisla warehouse jaanch (B7-4) pe; daawe me sirf "bina code" wale maamle Hub Manager dekhe.
- **Salah:** **(a)**, saath me (c) ka "apne aap manzoor" niyam. Kaam shuru se sahi app me (D-010), aur R2 me usi app me tickets judte hain. Staff (owner) ka kaam kam.
- **Trade-off:** (a) me R1 me ek app ka chhota hissa badhta hai; (b) me kaam galat app me, baad me hatana; (c) akela ho to galat daawe pe rok kam.
- **R1 ya baad me:** R1 (ye R1 ke scope me chhota jod hai; PROJECT_PLAN §1 ka note: R1 owner ki haan se badalta hai).
- **Kis par tika:** D-055, D-072; B7-1, B7-3.

### 2.4 Pehle ke kaam se lene layak

| Kya                                                           | Kahan (purana path)                                                   | Kyun achha                                      | Kasauti check                                        | Naye docs me kahan                             |
| ------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| Jisne reject kiya wo appeal tay nahi karta (kaam ka bantwara) | `docs-old/PRD.md` §5.4; `packages-old/shared/authz/src/separation.ts` | Koi apne hi faisle ka jaj nahi                  | Zaroorat: haan (B2-1); takrav nahi; naya vakya: haan | SECURITY_REQUIREMENTS; seller aur catalog TASK |
| Reject ki tay wajahon ki list                                 | `docs-old/ARCHITECTURE.md` §15 (7)                                    | Seller ko ek jaisi saaf wajah; reject ki report | Zaroorat: haan (B3-3); takrav nahi; naya vakya: haan | catalog TASK                                   |

**Na lein:** purani roles ki list (~79 roles) jyon ki tyon — D-059 aur D-003; naye roles naye design se. "State Admin" — D-015 me Admin sub-district level ka hai.

## 3. B3: Catalog

### 3.1 Ab tak tay

D-029 (sirf beauty aur personal care), D-043 (drug items kabhi nahi), D-030 (har product ka ek seller), D-060 (har batch pe seller ka record), D-061 (daam seller ka), D-062 (expiry ke 6 niyam; teen numbers B3 me baaki), D-064 (batch ka MRP), D-065 (catalog do daam sambhale), D-067 (agle batch ki expiry dikhe). R1 catalog: shade aur size jaise variants, MRP, daam, HSN aur GST rate, images; staff ki jaanch ke baad live (PROJECT_PLAN §1 #4).

### 3.2 Domain gaps

- **Product aur variant:** kin cheezon se variant bane (shade, size, scent), kaunsi cheez alag product (formula badle: matte vs dewy, SPF 30 vs SPF 50); reviews product pe ya variant pe.
- **Ek product, kai sellers:** D-030 "ek seller" kehta hai, par brand aur uska distributor (D-032) dono wahi product bechna chahein to niyam nahi.
- **Shade:** naam, swatch photo, hex, undertone (warm, cool, neutral, olive), depth (fair se deep), finish, coverage. Shade finder aur try-on (R2) isi data pe tikte hain.
- **Size aur net quantity:** ml ya g, travel ya mini size, refill pack; prati unit daam dikhana (kanooni, jaanch list §8.2).
- **Ingredients (INCI) aur allergens:** poori list pack jaisi; fragrance allergens (jaise limonene, linalool), nut oils; "free-from" filters.
- **Claims:** vegan, cruelty-free, paraben-free, dermatologically tested, organic, non-comedogenic, sunscreen ka SPF aur PA. Galat SPF sehat ka jokhim.
- **Expiry ke roop:** expiry date, ya sirf mfg date + "X mahine me use karein", ya sirf PAO nishaan (khulne ke baad 12M jaisa). D-062, D-064, D-067 batch ki expiry pe tike hain.
- **Batch ki pehchaan:** EAN batch nahi batata; batch-wise pick (D-064 niyam 3) ka tareeka chahiye.
- **HSN aur GST rate:** kaun tay kare, rate badle to.
- **Barcode:** chhote brands ke paas aksar EAN nahi.
- **Licence ki jaankari:** cosmetic manufacturing licence ya import registration (dummy); drug-classified ki pehchaan (D-043; §11 me Ayurvedic products ka dhyaan).
- **Content ka maalik:** seller likhe ya platform; har badlav pe dobara jaanch; staff khud badle ya nahi.
- **Category aur attributes:** category tree, skin type, concern, hair type, finish, fragrance family: filters (B9, run 2) ke liye.
- **Tamper-evident seal:** product pe factory seal ya shrink wrap aata hai ya nahi: B7-1 ke return niyam ke liye catalog field.
- **Jalne wale products:** perfume, nail polish, aerosol: warehouse me rakhne ke liye nishaan (operations).
- **Imported products:** importer ki details, country of origin.
- **Recall:** batch wapas bulana; hamare paas har order line ka batch hai (D-064, D-067).
- **Archive:** jis product ka order hua wo delete nahi.

### 3.3 Proposed sawal

#### B3-1. Ek hi product do sellers bechna chahein to

- **Sawal:** D-030 me har product ka ek seller hai. Agar ek brand ka wahi product (same EAN) brand khud bhi bechna chahe aur uska authorised distributor bhi (D-032), ya do distributors, to kaun bechega?
- **Kyun zaroori:** ye product ki pehchaan aur seller onboarding ki neev hai. Ek product ki do listings se search, reviews aur stock bat jaate hain, aur "brand authorisation" ki jaanch ka niyam isi se banta hai.
- **Vikalp:**
  - **(a) Ek brand, ek seller:** poore platform pe ek brand ka ek hi seller (brand khud ya uska ek authorised distributor). Brand ko pehla haq: brand khud aaye to distributor ki listings notice ke baad hat-ti hain; distributor ka bacha stock bik jaane ya wapas jaane tak (D-062 niyam 5 jaisa). Distributor ke liye brand ka authorisation letter (dummy) zaroori.
  - **(b) Ek product, ek seller:** har EAN ka ek seller, jo pehle manzoor hua; doosra seller wahi EAN nahi daal sakta, chahe brand ke baaki products kisi aur ke paas hon.
  - **(c) Ek product page, kai sellers:** ek page pe kai sellers ke offers. Ye D-030 ("har product ka ek seller") se takrata hai.
- **Salah:** **(a)**. Brand ki authorisation ek baar jaanchni padti hai, brand ke saare reviews ek jagah, aur "kis seller ka kaunsa maal" ka jhagda nahi. Apna brand (D-031) bhi isi niyam me.
- **Trade-off:** (a) me distributor chhod de to brand ke products naye seller tak band; (b) me ek brand ke products alag sellers me bat sakte hain (customer confuse, brand ka control kam); (c) business model badalta hai.
- **Kanooni detail jaanchi nahi (R-004):** brand authorisation aur trademark ki jaanch.
- **R1 ya baad me:** niyam aur onboarding ki jaanch R1 se (R1 me 2 alag brands, takrav nahi hoga, par design pehle din se).
- **Kis par tika:** D-030, D-032, D-036; B3-10 (EAN se duplicate jaanch).

#### B3-2. Variant kin cheezon se bane

- **Sawal:** ek product ke variants kin "axes" se banen (shade, size, scent ...), aur ye kaun tay kare?
- **Kyun zaroori:** R1 me "shade aur size jaise variants" hain. Har variant ka apna MRP, batch, stock, expiry (D-064, D-067) aur barcode hota hai; reviews, search aur filters bhi isi pe. Galat dhaancha baad me badalna mehenga (data badalna padta).
- **Vikalp:**
  - **(a) Do tay axes, sab pe:** shade aur size.
  - **(b) Category ke hisaab se platform ki axes:** makeup = shade (+ size); skincare = size; fragrance = size; hair colour = shade; bath & body = scent + size; tools = colour ya type. Seller sirf us category ki di hui axes chune (ek product pe zyada se zyada 2); nayi axis staff jode, bina deploy.
  - **(c) Seller apni marzi ki axes.**
- **Salah:** **(b)**, in niyam ke saath: jo cheez formula badalti hai (matte vs dewy finish, SPF 30 vs SPF 50, EDT vs EDP) wo alag product, variant nahi, kyunki ingredients aur claims alag hain. Rating aur reviews product pe (saare variants ke), par har review pe variant (shade) dikhe. "Pack of 2" variant nahi: bundle (B4-6) ya brand ka alag product.
- **Trade-off:** (a) saral, par bath & body aur hair jaise products fit nahi; (b) me category ka ek template sambhalna; (c) me filters aur search bigadte, aur jaanch mushkil.
- **R1 ya baad me:** R1 (data ka dhaancha).
- **Kis par tika:** D-064, D-067; B3-4, B4-6; B8 (reviews, run 2).

#### B3-3. Product content ka maalik aur badlav ki jaanch

- **Sawal:** listing ka content (naam, description, images, ingredients, claims, declarations, net quantity) kaun likhe, staff kya kar sake, aur seller ke har badlav pe dobara jaanch ho ya nahi?
- **Kyun zaroori:** R1 me listing staff ki jaanch ke baad live hoti hai. D-061 me platform daam nahi badalta; content pe bhi aisa hi saaf niyam chahiye. Galat ingredients ya claim allergy wale customer ke liye jokhim hai.
- **Vikalp:**
  - **(a) Har badlav pe jaanch:** seller likhe, staff sirf manzoor ya reject kare (tay wajah ke saath). Har badlav naya version; jaanch tak purana version live.
  - **(b) Sirf jokhim wale fields pe jaanch:** ingredients, claims, declarations, net quantity, category, images aur shade swatch pe dobara jaanch (purana version tab tak live). Baaki (description ke shabd, how to use) turant live, baad me staff ka spot check.
  - **(c) Platform ki content team:** seller sirf data de, platform content likhe aur sudhaare.
- **Salah:** **(b)**. R1 me staff owner hi hai, to har chhote badlav pe jaanch bojh banti; jokhim wale fields hamesha jaanch se. Staff khud koi field nahi badalta (D-061 niyam 4 jaisa), sirf "ye badlo" wajah ke saath bhejta hai. Har version ka record: kisne, kab, kya badla.
- **Trade-off:** (a) sabse surakshit par staff pe bojh aur seller ka intezaar; (b) me fields ki do list sambhalni; (c) content hamara ho jaata hai aur galti ki zimmedari bhi.
- **Kanooni detail jaanchi nahi (R-004):** listing ke galat claim ya jaankari ki zimmedari (seller ya platform).
- **R1 ya baad me:** R1.
- **Kis par tika:** D-061; B2-1, B3-5, B3-6.

#### B3-4. Shade ki jaankari kitni zaroori

- **Sawal:** shade wale variant ke saath seller ko kya dena zaroori ho: sirf naam aur swatch photo, ya hex colour, undertone aur depth bhi?
- **Kyun zaroori:** online cosmetics me galat shade return ki sabse badi wajah hai. Shade family ka filter (R1 basic filter), aur R2 ka shade finder aur try-on (D-055) isi data pe tikte hain. Hazaron shades pe ye data baad me bharna mushkil.
- **Vikalp:**
  - **(a) Kam:** shade naam + swatch photo.
  - **(b) Beech ka:** naam + swatch photo + hex, har shade pe. Complexion products (foundation, concealer, compact, tinted moisturiser) pe undertone (warm, cool, neutral, olive) aur depth (misaal 6 star: fair, light, medium, tan, deep, very deep) bhi zaroori. Lip aur eye products pe shade family (nude, pink, red, berry, brown ...).
  - **(c) Poora:** (b) + finish, coverage aur har shade ki alag skin tones pe photo zaroori.
- **Salah:** **(b)**; (c) ke fields optional. Staff jaanch me swatch aur hex ka mel moota-moota dekhe.
- **Trade-off:** (a) me filter aur shade finder kamzor; (b) me seller ka thoda zyada kaam; (c) chhote brands ke liye rukawat.
- **R1 ya baad me:** fields R1 me; shade finder R2.
- **Kis par tika:** B3-2; B7-1 (galat shade); B9 (run 2).

#### B3-5. Ingredients (INCI) aur allergens ka roop

- **Sawal:** ingredients kis roop me lein aur dikhayein?
- **Kyun zaroori:** allergy wale customer ke liye ye sabse zaroori jaankari hai. "Free-from" filters (paraben-free, fragrance-free) aur allergen ki chetavni isi data se banti hai.
- **Vikalp:**
  - **(a) Text + label photo:** seller pack jaisi poori ingredients list text me de, aur pack ke peeche (label) ki photo zaroori; staff photo se milaye.
  - **(b) Structured list:** platform ki ingredient master (INCI naam) se seller har ingredient chune.
  - **(c) Dono, kram se:** R1 me (a); R2 me text se structured list semi-auto bane aur staff check kare; uske baad free-from filters aur allergen chetavni.
- **Salah:** **(c)**. Label ki photo ek saath teen cheezein jaanchne deti hai: ingredients, declarations aur batch ka format. Product page pe ingredients poori list ke roop me, chhupa hua nahi.
- **Trade-off:** (b) R1 me bhaari (master data ek insaan ke liye bada kaam); (a) akela filters nahi deta; (c) me R2 me ek baar data badalna.
- **Kanooni detail jaanchi nahi (R-004):** label aur online page pe ingredients aur allergens dikhane ke niyam.
- **R1 ya baad me:** text + photo R1; structured list R2.
- **Kis par tika:** B3-3, B3-6; B9 (filters, run 2).

#### B3-6. Product claims ka niyam

- **Sawal:** "vegan", "cruelty-free", "paraben-free", "dermatologically tested", "organic", "non-comedogenic", "SPF 50 PA++++" jaise claims seller kaise kare, aur platform kya jaanche?
- **Kyun zaroori:** customer claims dekh ke kharidta aur filter karta hai. Galat claim se customer ko nuksaan (sunscreen ka SPF galat ho to sehat) aur platform pe bharosa kam.
- **Vikalp:**
  - **(a) Free text,** koi jaanch nahi.
  - **(b) Platform ki tay claim list:** seller tick kare (khud ki ghoshna), koi saboot nahi.
  - **(c) Tay list + kuch pe saboot:** SPF aur PA pe test report, organic pe certificate, cruelty-free pe certification, dermatologically tested pe test report (sab dummy, D-026); baaki claims khud ki ghoshna. Staff saboot jaanche; saboot ki expiry ho to reminder. Description ke free text me claim jaise shabd staff ki jaanch me.
- **Salah:** **(c)**. Filters sirf tay list se, free text se nahi.
- **Trade-off:** (a) me galat claims; (b) me list hai par sach ki jaanch nahi; (c) me seller aur staff ka kaam, aur dastavez rakhne ki zimmedari (Security).
- **Kanooni detail jaanchi nahi (R-004):** cosmetics claims aur galat vigyapan ke niyam.
- **R1 ya baad me:** tay list + ghoshna R1; saboot wala hissa R1 me sirf SPF ke liye, baaki R2.
- **Kis par tika:** B3-3, B3-5.

#### B3-7. HSN aur GST rate kaun tay kare

- **Sawal:** har product ka HSN code aur GST rate seller bhare, ya platform tay kare?
- **Kyun zaroori:** R1 catalog me HSN aur GST rate hain. Invoice seller ke GSTIN se banta hai (D-030), yaani supplier seller hai. MRP aur daam tax samet hain (D-061), to rate se hi taxable value nikalti hai. Sarkar rate badalti hai (tareekh se).
- **Vikalp:**
  - **(a) Seller dono bhare,** staff check kare.
  - **(b) Platform ki HSN → rate table:** tareekh ke saath (kis din se kaunsa rate). Seller category ke allowed HSN me se chune; rate table se aaye; staff check kare.
  - **(c) Platform category se HSN khud lagaye;** seller na badal sake.
- **Salah:** **(b)**. Rate badle to table me nayi line nayi tareekh se; us din se naye invoices naye rate pe; sellers ko alert ki apna daam dekh lein (daam platform nahi badalta, D-061). Zimmedari seller ki rehti hai, kyunki wo supplier hai.
- **Trade-off:** (a) me typo se galat tax aur invoice; (b) me ek table sambhalni; (c) me jis product ka HSN category se alag ho wo atak jaata.
- **Kanooni detail jaanchi nahi (R-004):** cosmetics ke HSN aur rates, aur rate badalne pe MRP aur purane stock ke niyam.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-030, D-041, D-061; B6-1.

#### B3-8. Expiry ki teen seemaayein (D-062 ke numbers)

- **Sawal:** D-062 ki teen values kya hon: receiving pe kam se kam bachi expiry, bikri band ki seema, aur bikri band ke baad brand ke jawab ke din? Aur sab products pe ek jaisi ya category ke hisaab se?
- **Kyun zaroori:** D-062 ne ye numbers B3 pe chhode. R1 ki receiving (D-014) aur product page ki expiry (D-067) inhi pe chalti hai. Customer ke paas product khatam karne ka samay hona chahiye (serum 2 se 3 mahine me, foundation 6 se 12 mahine me khatam hota hai).
- **Vikalp:**
  - **(a) Sab pe ek:** receiving pe kam se kam 6 mahine bachi (misaal), bikri band jab 3 mahine se kam (misaal), brand ka jawab 15 din (misaal).
  - **(b) Ek default + category ka override:** setting se, bina deploy. Misaal: default 6 / 3 mahine; sunscreen aur actives (vitamin C serum) 9 / 4 mahine; chhoti shelf life wale natural products ke liye kam (misaal 4 / 2 mahine). Brand ka jawab 15 din sab pe.
  - **(c) Shelf life ke % se:** receiving pe kul shelf life ka kam se kam 50% bacha (misaal), bikri band jab 15% se kam (misaal), saath me kam se kam 3 mahine.
- **Salah:** **(b)**. Samajhna aasaan, aur category ka farak sambhalta hai. R1 me sirf default bhi chal jaata hai; override ki setting pehle din se.
- **Trade-off:** (a) me chhoti shelf life wale products (12 mahine) ke liye 6 mahine kadi seema; (b) me category ki values sambhalni; (c) me har batch pe kul shelf life (mfg se expiry) chahiye, jo hamesha saaf nahi.
- **Kanooni detail jaanchi nahi (R-004):** expiry ke kareeb ya expired cosmetics bechne ke niyam.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-062, D-066, D-067; B3-9.

#### B3-9. Pack pe expiry date na ho to

- **Sawal:** kuch packs pe expiry date nahi hoti: sirf mfg date + "mfg se X mahine me use karein", ya sirf PAO nishaan (khulne ke baad 12M). Aise maal ka kya ho?
- **Kyun zaroori:** D-062, D-064, D-067 sab batch ki expiry pe tike hain. Expiry na ho to bikri band, "sabse pehle expire wala pehle", aur product page ki expiry teeno toot-te hain.
- **Vikalp:**
  - **(a) Sirf chhapi expiry:** jis pe expiry (ya use-before) date nahi, wo receiving pe wapas.
  - **(b) Expiry ya mfg + shelf life:** expiry na ho par mfg date aur shelf life (mahine) chhapi ho, to system expiry nikale; staff pack se jaanche. Sirf PAO wala (na expiry, na shelf life) accept nahi.
  - **(c) Sirf PAO bhi chale:** expiry = mfg + 30 mahine (misaal) maan ke.
- **Salah:** **(b)**. PAO alag field ho (product page pe customer ki jaankari ke liye), par wo expiry ka badal nahi.
- **Trade-off:** (a) me kuch sahi products bhi bahar; (b) me staff ko pack padhna; (c) me andaaze ki expiry customer ko "exact" dikhegi (D-067 ke khilaaf).
- **Kanooni detail jaanchi nahi (R-004):** label pe expiry ya use-before date ke niyam.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-062, D-064, D-067; B1-3.

#### B3-10. Har variant pe barcode

- **Sawal:** har variant pe brand ka barcode (EAN) zaroori ho, ya platform apna label lagaye?
- **Kyun zaroori:** warehouse me scan karke pick karne se galat shade ya size nahi jaata. B3-1 me duplicate ki jaanch EAN se hoti hai. Chhote brands ke paas aksar EAN nahi. Aur EAN batch nahi batata, jabki D-064 me exact batch jaana chahiye.
- **Vikalp:**
  - **(a) EAN zaroori:** bina EAN product list nahi.
  - **(b) EAN ho to wahi, na ho to platform ka label:** receiving pe har unit pe platform ka barcode label (labelling fee, B6-1). Batch ke liye warehouse me ek bin me ek variant ka ek hi batch.
  - **(c) Har unit pe platform ka label** (EAN ho ya na ho), jisme variant aur batch dono; batch-wise pick scan se pakka.
- **Salah:** **(b)**. Ek warehouse aur kam sellers ke saath "ek bin, ek batch" sasta hai; (c) har unit pe mehnat maangta hai.
- **Trade-off:** (a) chhote brands ke liye rukawat; (b) me labelling ka kaam aur bin ka anushaasan; (c) me sabse pakka par sabse mehnat.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-064; B1-3, B3-1, B6-1.

#### B3-11. Imported cosmetics

- **Sawal:** videshi brands ke products (India me importer ya distributor ke through) platform pe bik sakein?
- **Kyun zaroori:** D-032 authorised distributors ko bechne deta hai, aur bahut se beauty brands imported hain. Listing pe importer ki details, country of origin aur import registration ke fields isi pe.
- **Vikalp:**
  - **(a) Sirf India me bane products.**
  - **(b) Imported bhi:** listing pe importer ka naam-pata, country of origin aur import registration number (dummy) zaroori; staff jaanche.
  - **(c) Imported sirf brand ki apni Indian company se.**
- **Salah:** **(b)**; fields pehle din se. R1 ke dono dummy sellers India ke rakhe ja sakte hain.
- **Trade-off:** (a) me bada hissa market ka bahar; (b) me kuch fields aur jaanch zyada; (c) distributors (D-032) ke saath mel kam.
- **Kanooni detail jaanchi nahi (R-004):** imported cosmetics ka registration aur label ke niyam; country of origin ka filter zaroori hai ya nahi.
- **R1 ya baad me:** fields R1 me; bikri jab aisa seller aaye.
- **Kis par tika:** D-032; B3-3.

#### B3-12. Batch recall

- **Sawal:** brand ya regulator kisi batch ko wapas bulaye (recall), to platform kya kare, aur customer ko kya mile?
- **Kyun zaroori:** cosmetics ka batch kharab nikal sakta hai (contamination, galat formula). Hamare paas har order line ka batch hai (D-064, D-067), to kis customer ko kaunsa batch gaya, pata hai. Bina niyam ke jokhim bhi hai aur kharche ka jhagda bhi.
- **Vikalp:**
  - **(a) Sirf bikri band;** customers ko kuch nahi.
  - **(b) Poora recall:** bikri band + warehouse me batch alag (quarantine) + us batch ke customers ko in-app aur email se khabar; customer chahe to refund (pickup se wapsi, ya bina wapsi). Saara kharcha (refund, pickup, nasht) brand ka, seller ke hisaab se (kam pade to D-071 ka udhaar).
  - **(c) (b) + platform ka rok:** platform khud bhi batch rok sake (customer shikayatein, B7-9) jab tak jaanch ho.
- **Salah:** **(c)**. Recall brand (seller app se) ya staff shuru kare; har recall ka record (batch, kitne customers, kitne lautaye).
- **Trade-off:** (a) customer ki sehat ka jokhim; (b) me ek poora flow; (c) me platform ke rokne pe brand se jhagda ho sakta, isliye wajah ka record.
- **Kanooni detail jaanchi nahi (R-004):** cosmetics recall ki zimmedari aur regulator ko suchna.
- **R1 ya baad me:** data R1 me pehle se (har line ka batch); recall ka flow R2.
- **Kis par tika:** D-062, D-064, D-071; B7-9.

### 3.4 Pehle ke kaam se lene layak

| Kya                                                                                                                                 | Kahan (purana path)                            | Kyun achha                                                  | Kasauti check                                         | Naye docs me kahan          |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- | --------------------------- |
| Jis product ka kabhi order hua wo delete nahi, archive (storefront se hate, par order aur return ke liye details aur images rahein) | `docs-old/PRD.md` §5.2                         | Invoice aur order (D-067) me product ki jaankari bachi rahe | Zaroorat: haan; takrav nahi; naya vakya: haan         | catalog TASK; PRODUCT       |
| Listing ke versions: naya version → jaanch → live, purana tab tak live                                                              | `docs-old/ARCHITECTURE.md` §15 (8)             | B3-3 ka seedha roop                                         | Zaroorat: haan; takrav nahi; naya vakya: haan         | catalog TASK; FLOWS         |
| Jaanch pe EAN se duplicate check                                                                                                    | `docs-old/PRD.md` §5.3                         | B3-1                                                        | Zaroorat: haan; takrav nahi; naya vakya: haan         | catalog TASK                |
| Drug items ki blocklist (ingredients aur keywords)                                                                                  | `docs-old/ARCHITECTURE.md` §4 (catalog module) | D-043 ko listing pe laagu karne ka tareeka                  | Zaroorat: haan; takrav nahi; naya vakya: haan         | catalog TASK; COMPLIANCE    |
| Top categories: Skin, Makeup, Hair, Fragrance, Bath & Body, Men's Grooming                                                          | `docs-old/PRD.md` §5.1                         | Shuruaati category tree                                     | Zaroorat: haan; D-029 ke andar; owner ki haan chahiye | PRODUCT                     |
| Filters ki list (brand, price, shade, skin type, concern, finish, ingredients, vegan/cruelty-free, rating, country of origin)       | `docs-old/PRD.md` §5.1                         | B3-4, B3-6 ka data kahan kaam aata hai, ye dikhati          | Zaroorat: haan; B9 (run 2) ke saath; naya vakya: haan | search TASK                 |
| Product page ki declarations ki checklist                                                                                           | `docs-old/PRD.md` §7.1                         | Kanooni agent (R-004) ke liye shuruaati list                | Sach nahi maana; sirf jaanch ka input                 | COMPLIANCE (jaanch ke baad) |

**Na lein:** apne brand ka alag "batch release" raasta — D-031 (house brand baaki sellers jaisa, koi shortcut nahi). Try-on aur shade ki jaanch R1 me — D-055 (try-on R2). Purane role naam jyon ke tyon — D-059.

## 4. B4: Pricing, promotions, bundles aur kits

### 4.1 Ab tak tay

D-061 (daam seller ka, 4 niyam; bade badlav ka number B4 me baaki), D-064 (batch ka MRP, line ke hisse), D-065 (Pro daam), D-070 (Pro daam ki seema), D-041 (INR). Promotions, coupons aur bundles R2 se (D-055).

### 4.2 Domain gaps

- D-061 niyam 3 ka asli number.
- MRP aur daam kaise dikhe: kata hua MRP, % off, "pichhle 30 din ka sabse kam" daam; batch badalne (D-064) pe % bhi badalta.
- Customer ki fees: delivery fee, muft delivery ki seema; koi chhupi fee nahi.
- Discount ka paisa kaun de (brand, platform, dono): invoice, commission aur D-063 ki bharpai pe asar.
- Offers ka mel: sale + coupon, do coupons, Pro daam + coupon.
- Kits: brand ka pack kiya kit (ek EAN) vs platform pe banaya combo; har component ka apna batch aur expiry; kit ki expiry = sabse pehle expire hone wale component ki.
- Free samples aur gifts (beauty me bahut aam): stock brand ka, ₹0 line, return pe kya.
- Kam expiry wale batch ki sale (bikri band se pehle).
- Daam pehle se tay karna (sale ka shuru aur khatam samay): R2, promotions ke saath.
- Daam paise me ya sirf poore rupaye me; prati unit daam (₹/100 ml) dikhana (jaanch list §8.2).

### 4.3 Proposed sawal

#### B4-1. Daam ke bade badlav ki seema (D-061 niyam 3 ka number)

- **Sawal:** seller ka daam ek baar me kitna badle to dobara confirm maanga jaye?
- **Kyun zaroori:** D-061 ne number B4 pe chhoda (misaal 50%). Neeche ki galti (₹1,999 ki jagah ₹199) me stock minton me bik jaata hai.
- **Vikalp:**
  - **(a) 50% dono taraf.**
  - **(b) Asymmetric:** neeche 30% se zyada, ya upar 50% se zyada.
  - **(c) (b) + MRP ka check:** naya daam MRP ke 20% (misaal) se kam ho to hamesha confirm, chahe pichhla daam kuch bhi ho.
- **Salah:** **(c)**. Neeche ki galti zyada nuksaan wali hai; MRP wala check tab bhi pakadta hai jab pichhla daam bhi galat tha. Pro daam (D-065) pe bhi wahi niyam.
- **Trade-off:** (a) sabse saral; (b) me neeche ki galti jaldi pakdi jaati; (c) me ek aur check, par sach me sasta product (MRP ka bahut chhota hissa) pe seller ko har baar confirm.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-061, D-065.

#### B4-2. Discount kaise dikhe

- **Sawal:** product page, cart aur checkout pe MRP aur daam ka farak kaise dikhe?
- **Kyun zaroori:** R1 me product page pe MRP (batch ka, D-064) aur daam dono hain. Galat ya badha-chadha discount customer ko gumraah karta hai.
- **Vikalp:**
  - **(a) Kata hua MRP + daam + "% off" (MRP se),** hamesha.
  - **(b) (a) + 30 din ka sabse kam:** jab "sale" ya "deal" jaisa label lage, tab "pichhle 30 din ka sabse kam daam" bhi dikhe (D-061 ka itihaas pehle se hai).
  - **(c) Sirf MRP aur daam,** koi % nahi.
- **Salah:** **(b)**. % hamesha neeche round ho (kabhi badha ke nahi). Batch badle aur MRP badle to % bhi badle.
- **Trade-off:** (a) aam tareeka par "sale" ka sach nahi dikhata; (b) me ek aur hisaab; (c) me customer ko farak khud nikalna padta.
- **Kanooni detail jaanchi nahi (R-004):** discount aur "pehle ka daam" dikhane ke niyam.
- **R1 ya baad me:** (a) R1; 30 din wala hissa jab sale labels aayein (R2).
- **Kis par tika:** D-061, D-064; B4-4.

#### B4-3. Customer se delivery fee

- **Sawal:** customer se delivery fee lein ya nahi; lein to kitni, aur kaise dikhe?
- **Kyun zaroori:** checkout ka total, invoice (delivery platform ki seva hai, to shayad platform ka alag invoice), partial cancel (B5-3), RTO (B1-2) aur return (B7-7) ke niyam isi pe tike hain.
- **Vikalp:**
  - **(a) Hamesha muft.**
  - **(b) Seema ke neeche fee:** order ki rakam ek seema se kam ho to fixed fee (misaal ₹499 se kam pe ₹49), area setting se. Kai sellers wale order pe ek hi fee (order pe, seller pe nahi). Product page aur cart pe pehle se "₹X se upar muft delivery" dikhe. Koi "platform fee" ya "packing fee" nahi.
  - **(c) Doori ya wazan ke hisaab se.**
- **Salah:** **(b)**, value setting se (0 bhi rakhi ja sake). Asli jaisa (D-026), aur cancel, RTO aur return ke niyam isi pe saaf bante hain. Owner R1 halka chahe to R1 me (a) aur (b) R2.
- **Trade-off:** (a) saral, par kharcha poora hamara aur niyam baad me jodne padte; (b) me platform ka invoice aur fee ke niyam; (c) customer ke liye samajhna mushkil.
- **Kanooni detail jaanchi nahi (R-004):** delivery fee pe GST aur kiska invoice.
- **R1 ya baad me:** owner tay kare; salah R1.
- **Kis par tika:** D-022, D-041; B1-2, B5-1, B5-3, B6-1, B7-7.

#### B4-4. Discount ka paisa kaun de

- **Sawal:** R2 ke offers aur coupons ka paisa kaun deta hai: brand, platform, ya dono?
- **Kyun zaroori:** invoice ka daam, commission kis rakam pe (B6-1), D-063 ki bharpai ka daam, aur D-061 niyam 4 (platform ka discount alag dikhe) isi pe. R1 ke order line me iske khane pehle se chahiye, chahe khaali rahein.
- **Vikalp:**
  - **(a) Sirf brand:** seller ka coupon ya ghataya daam; invoice discount ke baad ke daam pe; commission usi pe.
  - **(b) Brand ya platform:** platform ke coupon me seller ko poora daam milta hai, farak platform deta hai.
  - **(c) (b) + baanta hua:** har offer pe brand aur platform ka % tay; offer ka budget aur budget khatam hote hi offer apne aap band.
- **Salah:** **(c)** ka design; R2 ki shuruaat (a) aur (b) se.
- **Trade-off:** (a) saral par platform apni marzi ka offer nahi chala sakta; (b) me platform ka kharcha aur hisaab; (c) me har offer ka split aur budget.
- **Kanooni detail jaanchi nahi (R-004):** discount pe GST (bikri se pehle ya baad ka), aur platform ke diye discount ka invoice pe asar.
- **R1 ya baad me:** R2; par R1 order line me "discount, kisne diya" ke khane.
- **Kis par tika:** D-061, D-063; B4-5, B6-1.

#### B4-5. Offers ka mel (stacking)

- **Sawal:** ek item pe kai fayde ek saath lag sakte hain? (sale daam + coupon, do coupons, Pro daam + coupon)
- **Kyun zaroori:** bina niyam ke offers ka kharcha behisaab badh sakta hai, aur Pro daam (D-065) ke saath coupon aage bechne ka lalach badhata hai.
- **Vikalp:**
  - **(a) Saaf default:** ek order pe ek coupon; sale daam + coupon chale; Pro daam pe coupon nahi.
  - **(b) Koi mel nahi:** sirf sabse achha ek fayda.
  - **(c) Har offer pe setting:** "kis ke saath chale".
- **Salah:** **(a)** default; (c) ka raasta baad me.
- **Trade-off:** (a) me kuch customers ko kam fayda; (b) sale ke dino me coupon bekaar; (c) staff ke liye har offer pe soch.
- **R1 ya baad me:** R2.
- **Kis par tika:** D-065, D-070; B4-4.

#### B4-6. Bundles aur kits

- **Sawal:** kits aur combos kis roop me bikein?
- **Kyun zaroori:** cosmetics me gift sets aur routine kits (cleanser + toner + moisturiser) aam hain. Har component ka apna batch aur expiry (D-064, D-067), aur GST rate alag ho sakta hai.
- **Vikalp:**
  - **(a) Sirf brand ka pack kiya kit:** ek EAN, ek MRP, normal product jaisa. Kit ki expiry = sabse pehle expire hone wale component ki; components ki list page pe.
  - **(b) (a) + usi seller ka combo:** "A + B saath me ₹X"; stock components se ghatta; combo ka daam components me baanta jaata (invoice me har component ki line apne batch aur expiry ke saath).
  - **(c) (b) + alag sellers ke products ka combo.**
- **Salah:** **(b)**; (c) nahi (ek daam do invoices pe baantna, aur return pe jhagda). Combo poora lautta hai; ek component kharab nikle to sirf usi ka badla ya refund (B7).
- **Trade-off:** (a) seller ko naya EAN banana padta; (b) me daam baantne aur stock ka hisaab; (c) bahut bhaari.
- **Kanooni detail jaanchi nahi (R-004):** kai cheezon ke set pe GST (mixed ya composite supply).
- **R1 ya baad me:** (a) R1 se apne aap (normal product); (b) R2.
- **Kis par tika:** D-064, D-067; B3-2; B7-1.

#### B4-7. Free samples aur gifts

- **Sawal:** free samples (sachet, mini) aur "₹X ki kharidari pe gift" kaise chalein?
- **Kyun zaroori:** beauty me samples se bikri badhti hai, par maal brand ka hai (D-060). Stock, invoice aur return sab pe asar.
- **Vikalp:**
  - **(a) Nahi.**
  - **(b) Sirf brand ke:** brand apne products ke saath apne samples de; stock brand ka; invoice pe ₹0 ki line; "not for sale" nishaan; samples pe bhi batch aur expiry (D-062).
  - **(c) (b) + platform ke gifts:** platform ka diya gift, aur customer har order pe samples chune (misaal 2).
- **Salah:** **(b)**. Return pe gift lautana zaroori nahi (saral), par jis offer se gift mila uski shart toote to bhi gift ka paisa nahi kat-ta.
- **Trade-off:** (a) beauty ka aam tareeka chhoot-ta; (b) me ₹0 lines aur sample ka stock; (c) me platform ka kharcha aur gifts ka stock.
- **Kanooni detail jaanchi nahi (R-004):** free maal pe GST aur sample ke label ke niyam.
- **R1 ya baad me:** R2.
- **Kis par tika:** D-060, D-062; B4-4, B7-7.

#### B4-8. Kam expiry wale batch ki sale

- **Sawal:** bikri band (D-062) se pehle jis batch ki expiry kareeb hai (misaal 3 se 6 mahine), uske liye "short expiry" label ya alag section ho?
- **Kyun zaroori:** D-067 ke saath customer kareeb expiry wala batch chhod deta hai, aur brand ka nuksaan (D-062 ki wapsi ya nasht) badhta hai. Daam platform nahi badalta (D-061 niyam 4).
- **Vikalp:**
  - **(a) Kuch nahi:** brand khud daam ghataye.
  - **(b) Label + section:** bachi expiry ek seema (misaal 6 mahine) se kam ho to apne aap "short expiry" label; brand chahe to apne ghataye daam ke saath "clearance" section me daale.
  - **(c) Platform apne aap discount de:** D-061 niyam 4 se takrata hai.
- **Salah:** **(b)**. D-064 ki wajah se ek waqt me ek hi batch dikhta hai, to label tabhi aata hai jab wahi batch agla bhejne wala ho.
- **Trade-off:** (a) me nuksaan brand ka aur disposal zyada; (b) me label ka niyam aur ek section; (c) tay faisle se takrav.
- **R1 ya baad me:** R2.
- **Kis par tika:** D-061, D-062, D-064, D-067.

### 4.4 Pehle ke kaam se lene layak

| Kya                                                                                                                                                                                                                                | Kahan (purana path)                      | Kyun achha                                                                     | Kasauti check                                                      | Naye docs me kahan                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------ |
| Paise ke niyam: har rakam integer paise, rates basis points; tax samet daam se taxable value aur tax (dono ka jod hamesha barabar); % discount neeche round; rakam ko lines me baantna jisme har hissa poore paise aur jod barabar | `packages-old/shared/utils/src/money.ts` | MRP tax samet (D-061); partial cancel, combo aur refund me paise ki galti nahi | Zaroorat: haan; takrav nahi; naya code naye doc se (D-074 niyam 4) | RULES (paise ke niyam); ARCHITECTURE |
| Daam dikhane ka niyam: sabke liye ek base daam; farak sirf label wale tareekon se (Pro daam ka label, coupon alag line, delivery fee pehle se); profile ya device se chhupa alag daam nahi; daam pe A/B test nahi                  | `docs-old/ARCHITECTURE.md` §6.8          | D-061 niyam 4 aur D-065 se mel; dark pattern se bachav                         | Zaroorat: haan; takrav nahi; naya vakya: haan                      | PRODUCT (pricing)                    |
| Checkout pe server daam dobara nikale; client ka bheja daam kabhi nahi; har order line pe daam ka breakdown snapshot                                                                                                               | `docs-old/ARCHITECTURE.md` §6.8          | Daam ka saboot (D-063 ke 30 din, audit)                                        | Zaroorat: haan; takrav nahi; naya vakya: haan                      | ARCHITECTURE; commerce TASK          |
| Offers: funding split, budget ki seema, budget khatam pe apne aap band                                                                                                                                                             | `docs-old/PRD.md` §5.10                  | B4-4 ka (c)                                                                    | Zaroorat: R2; takrav nahi; naya vakya: haan                        | promotions TASK                      |

**Na lein:** cart me free samples aur gifts R1 me — D-055 (promotions R2).

## 5. B5: Cart, checkout aur order model

### 5.1 Ab tak tay

D-020 (cart aur wishlist sign-in se), D-030 aur D-041 (ek order me kai sellers, har seller ka GSTIN invoice), D-034 (prepaid Razorpay ya delivery pe UPI QR, cash nahi), D-016 niyam 9 (serviceability order ke transaction me), D-015 (area OFF: naye order band, raaste wale poore), D-064 (batch se reserve, line batch ke hisson me), D-065 aur D-070 (Pro daam ke hisse), D-067 (cart aur checkout pe expiry), D-072 (delivery code). R1 #7.

### 5.2 Domain gaps

- Order ka dhaancha: customer ka order → seller ka hissa (invoice) → parcel (delivery). Delivery code (D-072) order pe ya parcel pe.
- Stock kab ruke, online payment ke liye kitna samay, der se aaye payment ka kya.
- Delivery pe UPI ke niyam (rakam ki seema, kise mile, mana karne pe kya): pay-on-delivery ka jaana-maana jokhim.
- Cancel: poora ya ek-ek item, kab tak; cancel se muft delivery ki seema toote to.
- Pick pe reserved unit toota ya kam nikle (D-064 niyam 3, D-067).
- Normal customer ki quantity seema (Pro ke liye D-070).
- Order ke baad address ya quantity badalna.
- Bina Pro bane GSTIN wala invoice (corporate gifting).
- Cart me rakhe item ka daam, MRP ya expiry badle (batch badalne se): customer ko checkout pe saaf dikhe (UX, §10).
- Invoice kab banta hai (pack pe ya delivery pe): kanooni jaanch (§8.2).

### 5.3 Proposed sawal

#### B5-1. Kai sellers wala order: dhaancha aur parcel

- **Sawal:** ek order me do sellers ke items hon (D-030), to customer ko ek parcel mile ya har seller ka alag?
- **Kyun zaroori:** invoice har seller ka hai (D-041), to order ke andar "seller ka hissa" banta hi hai. Parcel kitne, isse delivery ka kharcha, delivery code (D-072), RTO (B1-2) aur return tay hote hain.
- **Vikalp:**
  - **(a) Ek order, ek parcel:** andar har seller ka alag invoice; ek delivery code.
  - **(b) Har seller ka alag parcel:** alag code, alag tracking.
  - **(c) Normal ek parcel, majboori me alag:** size ya wazan ki seema, ya koi item der se, to hi alag parcel; har parcel ka apna code.
- **Salah:** **(c)**. Customer ko ek order number. Andar do alag cheezein: "seller ke hisse" (invoice ke liye) aur "parcel" (delivery ke liye), jo ek doosre se bandhe nahi. Delivery code parcel pe.
- **Trade-off:** (a) sabse sasta par bade order me ek parcel bhaari; (b) me delivery do guna aur customer ko do baar ghar pe rehna; (c) me dhaancha thoda zyada, par asli haalat sambhalta.
- **Kanooni detail jaanchi nahi (R-004):** ek parcel me kai sellers ke invoices.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-030, D-041, D-072; B1-2.

#### B5-2. Delivery pe UPI ke niyam

- **Sawal:** delivery pe UPI QR (D-034) kise mile, kitni rakam tak ke order pe, aur customer payment se mana kare to?
- **Kyun zaroori:** bina advance paise ke order me customer mana kare to delivery aur wapsi ka kharcha hamara, aur stock itne din ruka rehta hai. R1 me ye raasta hai.
- **Vikalp:**
  - **(a) Sab customers,** koi seema nahi.
  - **(b) Seema ke saath:** order ki zyada se zyada rakam (misaal ₹3,000); naye customer ke pehle order pe kam (misaal ₹1,500); area setting se on/off. Jo customer aise order pe 2 baar (misaal) mana kare ya payment na kare, uske liye delivery pe UPI band (staff khol sake, wajah ke saath).
  - **(c) Sirf purane customers:** kam se kam ek prepaid order delivered ho chuka ho.
- **Salah:** **(b)**. Door pe payment fail ho (network) to partner 10 minute (misaal) tak QR dobara dikhaye, phir "koshish fail" (B1-2). Delivery code (D-072) payment ke baad hi.
- **Trade-off:** (a) me mana karne ka nuksaan; (b) me kuch customers ko prepaid karna padta; (c) naye customer ke liye rukawat.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-034, D-072; B1-2, B6-3.

#### B5-3. Customer cancel: kab tak aur kitna

- **Sawal:** customer order kab tak cancel kar sake, aur poora hi ya ek-ek item bhi?
- **Kyun zaroori:** refund (B6-6), stock wapas, aur delivery fee (B4-3) ke niyam isi pe. Partial cancel ke baad order muft delivery ki seema se neeche aaye to bhi niyam chahiye.
- **Vikalp:**
  - **(a) Sirf poora order, pack hone se pehle.**
  - **(b) Ek-ek item ya quantity, pack hone se pehle;** pack ke baad cancel nahi, sirf door pe mana (RTO, B1-2).
  - **(c) Ek-ek item, warehouse se nikalne tak.**
- **Salah:** **(b)**. Koi cancel fee nahi; cancel ke baad order seema se neeche aaye to bhi baad me delivery fee nahi lagti (saral, customer ke liye saaf). Prepaid ka refund turant; delivery pe UPI wale order me paisa liya hi nahi.
- **Trade-off:** (a) customer ko poora order todna padta; (b) me line ke hisaab se refund aur stock; (c) me pack hua parcel kholna (galti ka mauka).
- **R1 ya baad me:** R1 (kam se kam (a); salah (b)).
- **Kis par tika:** B4-3, B5-1, B6-6.

#### B5-4. Pick pe reserved maal toota ya kam nikle

- **Sawal:** order ke baad warehouse me reserved batch ka unit toota nikle ya ginti kam ho, to customer ka kya?
- **Kyun zaroori:** D-064 niyam 3 (jo MRP dekha wahi batch) aur D-067 (jo expiry dekhi) ka vaada hai; nuksaan D-063 me hamara.
- **Vikalp:**
  - **(a) Line cancel,** refund aur customer ko khabar.
  - **(b) Badalna jab barabar ho:** usi variant ka doosra batch jiska MRP wahi ho aur expiry dikhayi gayi se barabar ya baad ki, to bina pooche badal do. Warna customer se poochho (in-app, email, browser push; misaal 12 ghante), jawab na aaye to line cancel aur refund.
  - **(c) Hamesha poochho.**
- **Salah:** **(b)**. Toota maal ki bharpai seller ko D-063 se apne aap.
- **Trade-off:** (a) me customer ka order bina zaroorat toot-ta; (b) me ek "poochho" ka kadam; (c) me har baar der.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-063, D-064, D-067.

#### B5-5. Stock kab ruke aur payment ke liye kitna samay

- **Sawal:** stock kab roka jaye, aur online payment ke liye customer ko kitna samay mile?
- **Kyun zaroori:** D-064 me order batch se reserve hota hai. Bina samay-seema ke adhure payments stock ko rok ke rakhte hain; der se aaye payment pe customer ka paisa atak sakta hai.
- **Vikalp:**
  - **(a) Cart me daalte hi rokna.**
  - **(b) "Place order" pe rokna, 15 minute (misaal):** prepaid me itne me payment; der se payment aaye aur stock ho to order pakka, warna apne aap poora refund aur customer ko khabar.
  - **(c) (b) par 30 minute.**
- **Salah:** **(b)**. Cart me stock nahi rukta; cart sirf "kam stock" dikhata hai aur checkout pe dobara jaanch (D-016 niyam 9 jaisa).
- **Trade-off:** (a) me stock bina kharidari ke ruka; (b) me UPI app me der karne wale ko kabhi refund ka intezaar; (c) me stock zyada der ruka.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-016, D-064; B6-6.

#### B5-6. Normal customer kitna le sake

- **Sawal:** normal customer (Pro nahi) ek order me ek variant ki kitni quantity le sake?
- **Kyun zaroori:** sasta khareed ke aage bechna, aur ek customer ka poora stock le jaana. Pro ke liye D-070 hai, normal ke liye nahi.
- **Vikalp:**
  - **(a) Koi seema nahi.**
  - **(b) Platform ka default:** misaal 10 per variant per order; seller usse kam rakh sake.
  - **(c) Seller tay kare,** default koi nahi.
- **Salah:** **(b)**.
- **Trade-off:** (a) me ek order se stock khatam; (b) me thoda bada kharidaar Pro (D-069) ki taraf jaata; (c) me zyada products pe koi seema nahi.
- **R1 ya baad me:** R1 (ek saral check).
- **Kis par tika:** D-070.

#### B5-7. Order ke baad badlav

- **Sawal:** order ke baad customer address ya quantity badal sake, ya item jod sake?
- **Kyun zaroori:** pincode → hub (D-016), GST ka state, aur invoice order pe tike hain; badlav se ye sab dobara.
- **Vikalp:**
  - **(a) Koi badlav nahi:** sirf cancel (B5-3) aur naya order.
  - **(b) Address badle:** pack se pehle, agar naya pincode usi hub pe aur usi state me ho.
  - **(c) (b) + item jodna.**
- **Salah:** **(a)** R1 me, **(b)** R2 me; (c) nahi.
- **Trade-off:** (a) customer ke liye kam suvidha; (b) me hub aur state ki jaanch; (c) invoice aur reservation dobara.
- **R1 ya baad me:** (a) R1, (b) R2.
- **Kis par tika:** D-016; B5-3.

#### B5-8. Bina Pro bane GSTIN wala invoice

- **Sawal:** koi normal customer (Pro nahi) checkout pe apna GSTIN daal ke business invoice le sake?
- **Kyun zaroori:** D-065 aur D-069 me Pro buyer ko GSTIN invoice milta hai. Companies gifting ke liye bhi kharidti hain, aur wo Pro daam nahi, sirf sahi invoice chahti hain.
- **Vikalp:**
  - **(a) Nahi,** sirf Pro ko.
  - **(b) Haan:** GSTIN ka format check aur naam; Pro daam nahi; invoice har seller ka GSTIN ke saath.
  - **(c) Haan, staff ki jaanch ke baad.**
- **Salah:** **(b)**.
- **Trade-off:** (a) business customers bahar; (b) me galat GSTIN ka jokhim (format check se kam); (c) me staff ka kaam aur der.
- **Kanooni detail jaanchi nahi (R-004):** B2B invoice aur us pe tax credit ke niyam.
- **R1 ya baad me:** R2 (Beauty Pro ke kaam bhi R2).
- **Kis par tika:** D-065, D-069.

### 5.4 Pehle ke kaam se lene layak

| Kya                                                                                            | Kahan (purana path)                    | Kyun achha                       | Kasauti check                                                                                               | Naye docs me kahan   |
| ---------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------- |
| Order ki haalaton ki list aur order ke events ka append-only itihaas                           | `docs-old/ARCHITECTURE.md` §6.4        | Haalat aur itihaas saaf          | Zaroorat: haan; takrav nahi, par naye me seller ke hisse aur parcel ke level pe dobara likhna (B5-1, D-064) | FLOWS; commerce TASK |
| Oversell ki rok: stock shart ke saath ghate (available ≥ qty), aur ek saath kai orders ka test | `docs-old/ARCHITECTURE.md` §6.4        | D-064 ka batch reserve sach rahe | Zaroorat: haan; takrav nahi; naya vakya: haan                                                               | ARCHITECTURE; QA     |
| Reservation ka samay aur der se payment pe apne aap refund                                     | `docs-old/ARCHITECTURE.md` §15 (1)     | B5-5                             | Zaroorat: haan; takrav nahi; naya vakya: haan                                                               | FLOWS                |
| Delivery pe UPI: area setting + rakam ki seema; QR delivery ki list bante waqt                 | `docs-old/ARCHITECTURE.md` §15 (2), §8 | B5-2                             | Zaroorat: haan; takrav nahi; naya vakya: haan                                                               | FLOWS; payments TASK |
| Dispatch se pehle cancel                                                                       | `docs-old/PRD.md` §5.1                 | B5-3                             | Zaroorat: haan; takrav nahi; naya vakya: haan                                                               | FLOWS                |

**Na lein:** guest cart — D-020. Store credit aur gift card se milke payment — B10 (run 2), abhi faisla nahi. Delivery slot — koi faisla nahi, aur B1-1 ki salah slot nahi. Delivery partner ki live location R1 me — koi faisla nahi, aur D-028 me baar-baar poochhne ka bojh.

## 6. B6: Payments, refunds, settlement aur ledger

### 6.1 Ab tak tay

D-001 aur D-057 (finance PostgreSQL, Neon), D-034, D-055 (R1: order value, commission, GST TCS, income-tax TDS; payout haath se "paid"), D-031 (house brand alag company, baaki sellers jaisa), D-060 (fees), D-062 (disposal fee, wapsi ka kharcha), D-063 (bharpai agle payout me; 30 din ki khidki aur payout cycle B6 me), D-066 (muft din aur fee B6 me), D-068 (kaat ki seema B1/B6 me), D-071 (udhaar ki rakam aur din B6 me).

### 6.2 Domain gaps

- Seller se kaunsi fees, aur commission kis rakam pe (GST samet ya bina).
- Seller ka paisa kab "payable" (delivery pe ya return window ke baad), payout kitni baar.
- Customer ka paisa kis khaate me aata hai, seller tak kaise.
- Saari fees ki rakam (dummy), aur D-066, D-062, D-071, D-068 ke numbers.
- Refund ka raasta (hamesha original?), samay, fail ho to.
- Chargeback ka nuksaan kiska.
- Delivery partner ki kamaai ka tareeka.
- Platform ke apne invoices (seller ko commission ka, customer ko delivery fee ka): kanooni jaanch (§8.2).
- TCS aur TDS ki abhi ki rates: sirf jaanch (§8.2), owner ka faisla nahi.

### 6.3 Proposed sawal

#### B6-1. Seller se kaunsi fees, aur commission kis rakam pe

- **Sawal:** platform seller se kaunsi fees le, aur commission item ke daam (GST samet) pe lage ya taxable value (GST ke bina) pe?
- **Kyun zaroori:** R1 me seller ka hisaab hai. D-060 me "fees lete hain", D-063 me bharpai "commission aur fees ghata ke", aur D-071 ka udhaar: sab fees ki list pe tike hain.
- **Vikalp:**
  - **(a) Sirf commission:** % (category ke hisaab se); rakhna, pack aur delivery usi me. Storage (D-066) aur disposal (D-062) alag.
  - **(b) Commission + fulfilment fee:** % commission + har unit (ya har seller ke hisse) pe fixed fulfilment fee (misaal ₹25) + storage + disposal + wapsi ka kharcha.
  - **(c) (b) + aur fees:** labelling fee (B3-10), return handling fee (B7-7), suchna (ASN) se farak pe penalty.
  - Commission ka aadhaar: **(i)** item ka daam GST samet, ya **(ii)** taxable value (GST ke bina).
- **Salah:** **(b)** + aadhaar **(ii)**. Fulfilment fee asli kaam ka kharcha dikhati hai (sasta product bhi utna hi pack hota hai), aur GST ke bina aadhaar seller ke liye seedha aur GST rate badalne pe commission nahi badalta. (c) ki fees ka dhaancha ho, par shuru me 0. Platform ki fees pe platform ka GST alag line.
- **Trade-off:** (a) sabse saral par sasta product nuksaan wala; (b) me do tarah ki fees; (c) chhote brand ke liye ulajhan.
- **Kanooni detail jaanchi nahi (R-004):** commission aur fees pe GST, aur platform ka seller ko invoice.
- **R1 ya baad me:** dhaancha R1; rakam B6-4.
- **Kis par tika:** D-060, D-062, D-063, D-066, D-071; B3-10, B4-4, B7-7.

#### B6-2. Seller ka paisa kab payable, aur payout kitni baar

- **Sawal:** bikri ka paisa seller ke liye kab "payable" ho, aur payout kitni baar?
- **Kyun zaroori:** delivery ke baad return aate hain. Paisa pehle de diya to return pe udhaar (D-071) banta hai. D-063 ki bharpai aur D-066 ki fee bhi isi cycle me.
- **Vikalp:**
  - **(a) Delivery ke din se payable,** weekly payout; baad ke returns agle payouts se kat-te.
  - **(b) Return window (B7-2) khatam hone ke baad payable,** weekly payout (misaal har Monday, pichhle hafte tak jo payable hua).
  - **(c) (b) par mahine me do baar.**
- **Salah:** **(b)**. Kam se kam payout rakam (misaal ₹100) se kam ho to agle cycle me. Seller ko har line ki haalat dikhe (kab payable hogi).
- **Trade-off:** (a) seller ko paisa jaldi par udhaar ka khatra; (b) me paisa 1 se 2 hafte der se; (c) chhote brand ke liye lamba intezaar.
- **R1 ya baad me:** R1 (payout haath se "paid", D-055).
- **Kis par tika:** D-063, D-066, D-071; B7-2.

#### B6-3. Customer ka paisa kis khaate me, aur seller tak kaise

- **Sawal:** customer ka payment (prepaid aur delivery pe UPI, dono) kis khaate me aaye, aur sellers tak kaise pahunche?
- **Kyun zaroori:** isse ledger ka dhaancha, reconciliation aur payout ka tareeka tay hota hai.
- **Vikalp:**
  - **(a) Platform ka ek gateway account:** sab paisa platform ke Razorpay account me; finance me har seller ka hisaab; payout platform kare (R1 me haath se "paid").
  - **(b) Split at payment:** payment pakka hote hi seller ke linked account me transfer, return window tak rok ke (hold).
  - **(c) Har seller ka apna gateway:** ek checkout me sambhav nahi.
- **Salah:** **(a)** R1 me (D-055); design aisa ki (b) baad me sirf payout ka tareeka badle, hisaab nahi.
- **Trade-off:** (a) me platform ke paas sellers ka paisa (zimmedari); (b) me gateway ki linked accounts ki setup aur har seller ka bank verification; (c) customer ke liye do payment.
- **Kanooni detail jaanchi nahi (R-004):** marketplace ke liye payment aggregator aur sellers ka paisa rakhne ke niyam.
- **R1 ya baad me:** (a) R1.
- **Kis par tika:** D-034, D-055.

#### B6-4. Fees ki shuruaati rakam (dummy)

- **Sawal:** B6-1 ki fees ki shuruaati rakam kya ho (dummy business ke liye, baad me setting se badle)?
- **Kyun zaroori:** D-062, D-066 ki rakam B6 pe chhodi gayi; R1 ke seller hisaab me numbers chahiye.
- **Vikalp:**
  - **(a) Category-wise:** commission makeup 15%, skincare 12%, hair 10%, fragrance 8% (misaal); fulfilment ₹25 per unit; storage: receiving ke 90 din muft (D-066 ki misaal), phir ₹2 per unit per mahina, 180 din ke baad ₹4; disposal ₹10 per unit; wapsi ka kharcha asli.
  - **(b) Ek flat commission:** 10% sab pe (misaal), baaki (a) jaisa.
  - **(c) Owner apni values de.**
- **Salah:** **(b)** R1 me (saral); category-wise baad me setting se. Storage fee per unit (cosmetics chhote hain); per volume baad me.
- **Trade-off:** (a) asli jaisa par R1 me zyada setup; (b) saral; (c) owner ka samay.
- **R1 ya baad me:** R1.
- **Kis par tika:** B6-1; D-062, D-066.

#### B6-5. Udhaar aur kaat ki seemaayein

- **Sawal:** D-071 ke udhaar ki seema (rakam, din, "lambe samay") aur D-068 me delivery partner se kaat ki seema kya ho?
- **Kyun zaroori:** dono faislon ne numbers B6 pe chhode.
- **Vikalp:**
  - **(a) Beech ka:** udhaar ₹5,000 ya 60 din (D-071 ki misaal) paar → alert + payment link; 30 din aur (notice ke baad) → naya maal aur listings band; 90 din aur → account band. Delivery partner: ek maamle me zyada se zyada ₹500, mahine me ₹1,500, ya mahine ki kamaai ka 10%, jo kam ho (misaal).
  - **(b) Kadi:** ₹2,000 ya 30 din; 15 din; 45 din.
  - **(c) Narm:** ₹10,000 ya 90 din; 60 din; 180 din.
- **Salah:** **(a)**.
- **Trade-off:** (b) chhote brand ke liye bhaari; (c) me udhaar bada hota.
- **Kanooni detail jaanchi nahi (R-004):** gig partner ki kamaai se kaat ke niyam (D-068 me pehle se likha).
- **R1 ya baad me:** udhaar ki seema R1 (seller hisaab); partner ki kaat R2 (partner ka payout R2).
- **Kis par tika:** D-068, D-071; B6-8.

#### B6-6. Refund ka raasta aur samay

- **Sawal:** refund kis raaste jaaye, aur kab shuru ho?
- **Kyun zaroori:** R1 me Razorpay test mode me refund hai. Delivery pe UPI wale order ka refund bhi chahiye (return pe).
- **Vikalp:**
  - **(a) Hamesha original raaste:** Razorpay refund; delivery pe UPI QR wala payment bhi usi raaste. Shuru hone ka samay: cancel pe turant, RTO pe hub scan pe (B1-2), return pe B7-8 ke hisaab se.
  - **(b) Original ya bank account:** customer chahe to bank account me (bank details lena padta, sensitive data).
  - **(c) Default store credit:** B10 (run 2) ka sawal; prepaid instruments ke niyam ka jokhim.
- **Salah:** **(a)**. Refund fail ho (account band) to staff ka haath ka raasta aur customer ko khabar. Customer ko refund ki haalat in-app aur email me dikhe.
- **Trade-off:** (a) me kuch maamle haath se; (b) me bank details ki suraksha; (c) customer ka paisa platform pe atka.
- **Kanooni detail jaanchi nahi (R-004):** refund ka samay (RBI ke niyam) aur store credit ke niyam.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-034; B1-2, B5-3, B7-8.

#### B6-7. Chargeback ka nuksaan kiska

- **Sawal:** customer bank se payment ka dispute (chargeback) jeete to nuksaan kiska: platform ka ya seller ka?
- **Kyun zaroori:** asli payments me chargebacks aate hain; bina niyam ke har maamla jhagda.
- **Vikalp:**
  - **(a) Hamesha platform.**
  - **(b) Hamesha seller.**
  - **(c) Wajah ke hisaab se:** product ki shikayat (galat ya kharab, brand ki galti) → seller; delivery ya fraud ka maamla → platform; delivery ka saboot mazboot ho (D-072 ka code) to platform dispute lade.
- **Salah:** **(c)**.
- **Trade-off:** (a) platform ka nuksaan; (b) seller ke saath anyay jab galti delivery ki; (c) me har maamle ki jaanch.
- **R1 ya baad me:** R2 (test mode me chargebacks nahi).
- **Kis par tika:** D-063, D-072.

#### B6-8. Delivery partner ki kamaai

- **Sawal:** gig delivery partner (D-033) ki kamaai kaise bane?
- **Kyun zaroori:** D-068 ki kaat isi kamaai se hoti hai; partners ka payout finance me.
- **Vikalp:**
  - **(a) Per kaam:** har delivered parcel pe fixed (misaal ₹30), har return pickup pe (misaal ₹25), fail koshish pe kam (misaal ₹10); weekly payout.
  - **(b) (a) + doori:** km ke hisaab se extra.
  - **(c) Ghante ke hisaab se (shift):** gig model se kam mel.
- **Salah:** **(a)**; (b) baad me jab hubs ka ilaaka bada ho.
- **Trade-off:** (a) saral par door ke pincode pe partner ka nuksaan; (b) me doori ka hisaab; (c) payroll jaisa (D-033 ke khilaaf jaata).
- **Kanooni detail jaanchi nahi (R-004):** gig partners ke niyam, unke payout pe TDS, aur aggregator ka contribution.
- **R1 ya baad me:** R2 (R1 me sirf record: kaunsa parcel kis partner ne, taaki baad me hisaab ban sake).
- **Kis par tika:** D-033, D-068; B6-5.

### 6.4 Pehle ke kaam se lene layak

| Kya                                                                                                                | Kahan (purana path)                                     | Kyun achha                                         | Kasauti check                                                                                                                     | Naye docs me kahan                   |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Double-entry journal: entry kabhi nahi badalti, galti sirf ulti entry se; balances ki roz jaanch; accounts data me | `docs-old/ARCHITECTURE.md` §6.3                         | Seller ke hisaab ka saboot; D-071 ka minus balance | Zaroorat: haan; takrav: purani accounts list ka "apne brand ki bikri alag" hissa D-031 se takrata, wo nahi lena; naya vakya: haan | ARCHITECTURE (finance); finance TASK |
| Har GSTIN aur har financial year ka bina gap invoice number, packing ke saath                                      | `docs-old/ARCHITECTURE.md` §6.3                         | D-041                                              | Zaroorat: haan; takrav nahi; kanooni detail jaanchi nahi (R-004)                                                                  | commerce aur finance TASK            |
| Settlement: order value − commission − fees − TCS − TDS ± returns aur claims                                       | `docs-old/ARCHITECTURE.md` §6.3; `docs-old/PRD.md` §5.7 | D-055 ka seller hisaab                             | Zaroorat: haan; naye me D-063 bharpai, D-062 aur D-066 fees, D-071 udhaar jodna; naya vakya: haan                                 | PRODUCT (seller hisaab); FLOWS       |
| Payout banane wala aur manzoor karne wala alag; badi rakam pe doosra signature                                     | `docs-old/ARCHITECTURE.md` §15 (4)                      | Galat payout ki rok                                | Zaroorat: haan (R1 ke haath se "paid" me bhi); takrav nahi                                                                        | SECURITY_REQUIREMENTS; finance TASK  |
| Reconciliation: payments ↔ orders ↔ gateway ke settlements                                                         | `docs-old/PRD.md` §5.7                                  | Paisa gum na ho                                    | Zaroorat: R2 (finance ki poori reports R2, D-055)                                                                                 | finance TASK                         |
| Idempotency: wahi key aur body pe wahi jawab, alag body pe error                                                   | `docs-old/discovery/REPOSITORY_ANALYSIS.md` §5 (7)      | Webhook aur refund do baar na chalein              | Zaroorat: haan; technical                                                                                                         | ARCHITECTURE                         |

**Na lein:** "apne brand ki bikri pe TCS nahi", "house brand ka supplier Beautinique", "payout ki jagah margin view", "apne brand ke liye platform ka purchase order" — D-031 aur D-060 se takrav (house brand alag company, baaki sellers jaisa). TCS aur TDS ki purani rates sach nahi maani: sirf jaanch (§8.2).

## 7. B7: Returns aur replacement

### 7.1 Ab tak tay

R1 me simple niyam: sirf band ya kharab maal; delivery partner pickup kare, warehouse me jaanch, refund (PROJECT_PLAN §1 #9, D-055). Return pickup apne partners (D-014). Pending returns tak jagah OFF nahi (D-016 niyam 10). Hamari zimmedari aur bharpai (D-063), toota maal nasht D-062 ke record ke saath. Vasooli (D-068). Delivery ka saboot (D-072).

### 7.2 Domain gaps

- **Hygiene:** khula cosmetic dobara nahi bik sakta. "Band" ka matlab saaf chahiye: factory seal ya shrink wrap salamat. Jin products pe seal aata hi nahi (kai compacts, kuch lip balms), unke liye niyam.
- **Wajahein:** transit me toota ya leak, pighla, galat item ya galat shade, item kam, expiry dikhayi gayi se pehle ki, kharab (pump nahi chalta), nakli hone ka shak, man badla, skin reaction.
- **Samay-seema** wajah ke hisaab se; **saboot** (photo, unboxing video).
- **Lauta maal kahan:** dobara stock, brand ko, ya nasht; nuksaan kiska (D-063 ya brand).
- **Refund, wahi item dobara, ya doosra shade.**
- **Pickup pe jaanch:** batch ka mel (D-064 se har line ka batch pata hai) swap fraud (purana ya nakli maal lautana) ka sabse sasta rok.
- **Return ka kharcha;** delivery fee ka kya.
- **Refund kab** (R1 me warehouse jaanch ke baad tay; aage?).
- **Skin reaction:** khula maal, par sehat ka maamla; ek batch pe kai shikayatein = recall ka ishaara (B3-12).
- **Baar-baar return** karne wale customer.
- **Combo aur gift** ke saath return (B4-6, B4-7); Pro buyer ke returns (B2B maal): sawal run 2 me ya Beauty Pro ki charcha me.
- **Return ke raaste me maal kho jaaye** (pickup ke baad): D-063 ki zimmedari me saaf nahi (§11).

### 7.3 Proposed sawal

#### B7-1. Return ki wajahein aur "band" ka matlab

- **Sawal:** kin wajahon pe return maana jaye, aur kya "man badla" (khula nahi) bhi chale?
- **Kyun zaroori:** R1 ka niyam "band ya kharab" hai, par "band" ka matlab aur poori list tay nahi. Isi se return ka kharcha (B7-7), lauta maal kahan (B7-4) aur catalog ka ek field (product pe seal aata hai ya nahi) banta hai.
- **Vikalp:**
  - **(a) Sirf hamari ya brand ki galti:** transit me toota ya leak, pighla, galat item ya galat shade ya size, item kam, expiry dikhayi gayi se pehle ki, kharab (defect), nakli hone ka shak (staff jaanch). "Man badla" bilkul nahi.
  - **(b) (a) + man badla, sirf band maal pe:** "band" = factory seal ya shrink wrap salamat aur istemaal nahi. Listing pe seller batata hai ki product pe tamper-evident seal aata hai ya nahi (B3-3). Jis product pe seal aata hi nahi, us pe man badla return nahi (hygiene).
  - **(c) (b) + kuch khula maal bhi:** jaise foundation ka shade galat laga, thoda istemaal ("shade guarantee").
- **Salah:** **(b)**. R1 ka "band ya kharab" isi ka roop hai, aur seal wala field ek baar me hygiene ka sawal hal karta hai. Khula aur kharab nahi = return nahi; skin reaction ka alag raasta (B7-9).
- **Trade-off:** (a) customer ke liye kadi; (b) me seal ki jaanch (B7-6, B7-4); (c) me khula maal nasht, nuksaan bada aur galat istemaal aasaan.
- **Kanooni detail jaanchi nahi (R-004):** return policy dikhane ke niyam, aur khule cosmetics pe "no return" ki shartein.
- **R1 ya baad me:** R1 (seal wala field aur wajahon ki list R1 me).
- **Kis par tika:** D-055; B3-3.

#### B7-2. Return ki samay-seema

- **Sawal:** delivery ke kitne din tak return maanga ja sake?
- **Kyun zaroori:** seller ka paisa return window ke baad payable (B6-2 ki salah); transit damage ka daawa jitna jaldi, saboot utna sach.
- **Vikalp:**
  - **(a) Sab wajahon pe 7 din.**
  - **(b) Wajah ke hisaab se:** toota, leak, item kam, galat item: 48 ghante (misaal); kharab (defect): 7 din; man badla (band maal): 7 din (misaal).
  - **(c) Sab pe 15 din.**
- **Salah:** **(b)**. Window ke baad bhi batch me dikkat nikle to recall (B3-12) ka raasta.
- **Trade-off:** (a) saral par transit damage der se aata; (b) me teen ginti; (c) me seller ka paisa der tak ruka.
- **Kanooni detail jaanchi nahi (R-004):** return ki kam se kam samay-seema ke niyam (agar koi ho).
- **R1 ya baad me:** R1.
- **Kis par tika:** B7-1; B6-2.

#### B7-3. Daawe ka saboot

- **Sawal:** toota, galat ya kam item ke daawe me customer se kya saboot lein?
- **Kyun zaroori:** cosmetics me "galat shade aaya" ya "khali box aaya" jaise daawe aam hain. Bina saboot ke faisla andaaze pe; D-072 ki tarah saboot se faisla.
- **Vikalp:**
  - **(a) Koi saboot nahi.**
  - **(b) Photo zaroori:** item, label pe batch number aur damage ki photo; "item kam" pe parcel aur packing ki photo.
  - **(c) (b) + unboxing video:** ek rakam (misaal ₹1,500) se upar video zaroori.
- **Salah:** **(b)**; video optional (staff maang sake). Hamari taraf ka saboot: warehouse pe pack ki photo (§1.4).
- **Trade-off:** (a) jhooth aasaan; (b) customer ka ek kadam; (c) video banana sab ko nahi aata, aur video ki privacy.
- **Kanooni detail jaanchi nahi (R-004):** customer ki photo aur video (ghar, chehra aa sakta) rakhne ke niyam.
- **R1 ya baad me:** R1 (photo upload).
- **Kis par tika:** D-072; B2-2, B7-1.

#### B7-4. Lauta maal kahan jaaye, aur nuksaan kiska

- **Sawal:** warehouse jaanch ke baad lauta maal kahan jaaye (dobara stock, brand ko, nasht), aur kharcha ya nuksaan kiska?
- **Kyun zaroori:** maal brand ka hai (D-060); hamari galti ka nuksaan D-063 me hamara; band maal dobara bike to brand ka fayda. R1 ki warehouse jaanch ka nateeja isi se.
- **Vikalp:**
  - **(a) Kabhi dobara stock nahi:** har lauta maal brand ko wapas ya nasht.
  - **(b) Matrix:**
    1. Band, seal salamat, batch wahi jo bheja tha, expiry bikri band ki seema se upar → wapas bikne layak stock, usi batch me.
    2. Transit me toota ya leak (hamari zimmedari) → nasht (D-062 ka record), brand ko D-063 bharpai, customer ko refund.
    3. Galat item bheja (hamari pick ki galti) → hamari zimmedari; lauta item jaanch ke baad stock me.
    4. Brand ki galti (defect, galat batch label, nakli ka shak sahi nikla) → refund ka paisa seller ke hisaab se, saath me wapsi ka kharcha; maal brand ko wapas ya nasht brand ke kharche pe (D-062 jaisa).
    5. Customer ki baat jaanch me galat (khula maal "band" bata ke, batch alag) → refund nahi; maal customer ko wapas (ek baar hamare kharche pe, misaal).
  - **(c) (b) par dobara stock sirf brand ki haan se.**
- **Salah:** **(b)**. Seller ke panel me har return ka nateeja aur wajah; seller ko aitraaz ka raasta (D-063 niyam 5 jaisa).
- **Trade-off:** (a) brand ka nuksaan bada, aur galat ho to hamare saath jhagda; (b) me jaanch ka anushaasan; (c) me brand ke jawab tak maal ruka.
- **Kanooni detail jaanchi nahi (R-004):** lautaye band cosmetics ko dobara bechne ke niyam.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-060, D-062, D-063; B7-1, B7-6.

#### B7-5. Badle me kya: refund, wahi item, ya doosra shade

- **Sawal:** return pe customer ko kya mile: sirf refund, wahi item dobara (replacement), ya doosra shade ya size (exchange)?
- **Kyun zaroori:** toote ya galat item pe customer aksar wahi item chahta hai. Exchange cosmetics me shade ke liye maanga jaata hai, par D-064 ka batch MRP aur daam ka farak ise ulajhata hai.
- **Vikalp:**
  - **(a) Sirf refund.**
  - **(b) Refund ya wahi variant dobara:** sirf hamari ya brand ki galti wale maamlon me, stock ho to; naya parcel aur purana pickup ek hi trip me.
  - **(c) (b) + exchange:** band maal pe usi product ka doosra shade ya size, daam ka farak le ya de.
- **Salah:** **(b)** R2 me; R1 me **(a)** (D-055 ka simple return). (c) nahi: customer refund le ke naya order kare, wahi kaam saaf.
- **Trade-off:** (a) customer ke liye do kadam; (b) me replacement ka stock aur ek trip me do kaam; (c) me invoice, credit note aur daam ka farak.
- **Kanooni detail jaanchi nahi (R-004):** replacement pe invoice aur credit note ke niyam.
- **R1 ya baad me:** (a) R1, (b) R2.
- **Kis par tika:** B5-1, B6-6, B7-1.

#### B7-6. Pickup pe jaanch

- **Sawal:** return pickup ke waqt delivery partner kya jaanche?
- **Kyun zaroori:** sabse sasta fraud rok yahi hai: hamare paas har line ka batch hai (D-064), to galat ya purana maal lautane wala door pe hi pakda jaata.
- **Vikalp:**
  - **(a) Kuch nahi,** sab warehouse me.
  - **(b) Photo + batch + seal:** partner item ki photo le, label pe batch number order wale batch se milaye, aur man badla wale maamle me seal dekhe. Mel na khaye to pickup na le (wajah + photo), customer ko in-app, email aur browser push se khabar.
  - **(c) (b) + partner hi refund manzoor kare** (B7-8).
- **Salah:** **(b)**. Delivery app me photo ka kadam pehle se hai (D-072).
- **Trade-off:** (a) galat maal warehouse tak aata, ek aur trip ka kharcha; (b) partner ka ek do minute aur; (c) partner pe paise ka faisla (jokhim).
- **R1 ya baad me:** (b) R1.
- **Kis par tika:** D-064, D-072; B7-4, B7-8.

#### B7-7. Return ka kharcha

- **Sawal:** return pickup ka kharcha customer se kate ya nahi?
- **Kyun zaroori:** man badla wale return (B7-1) me galti kisi ki nahi; muft ho to galat istemaal, mehenga ho to customer naraz.
- **Vikalp:**
  - **(a) Hamesha muft.**
  - **(b) Galti ke hisaab se:** hamari ya brand ki galti → muft, aur delivery fee bhi wapas (B4-3); man badla → refund me se return fee (misaal ₹49), delivery fee wapas nahi.
  - **(c) Man badla ka kharcha seller pe.**
- **Salah:** **(b)**.
- **Trade-off:** (a) kharcha hamara aur galat istemaal; (b) me ek fee ka niyam; (c) seller ke saath anyay (uski galti nahi).
- **R1 ya baad me:** R1, agar R1 me man badla wale returns hain (B7-1).
- **Kis par tika:** B4-3, B6-1, B7-1.

#### B7-8. Refund kab (R1 ke baad)

- **Sawal:** R1 me refund warehouse jaanch ke baad hai (D-055). Aage bhi aisa hi rahe, ya kuch maamlon me pickup pe hi?
- **Kyun zaroori:** warehouse jaanch me 3 se 5 din (misaal) lagte hain; customer ka paisa itne din atka rehta hai.
- **Vikalp:**
  - **(a) Hamesha warehouse jaanch ke baad.**
  - **(b) Chhoti rakam pe pickup pe:** misaal ₹1,000 tak, aur pickup ki jaanch (B7-6) paas ho, to pickup scan pe refund; baaki warehouse ke baad. Baar-baar galat return karne wale (B7-10) ko ye suvidha nahi.
  - **(c) Request pe turant.**
- **Salah:** **(b)** R2 me.
- **Trade-off:** (a) customer ka intezaar; (b) me thoda jokhim (pickup ke baad maal galat nikle); (c) fraud aasaan.
- **R1 ya baad me:** R1 me (a) pehle se tay; ye sawal R2 ke liye.
- **Kis par tika:** D-063; B7-6, B7-10.

#### B7-9. Skin reaction (allergy) ki shikayat

- **Sawal:** customer kahe product lagane se reaction hua (khula maal), to platform kya kare?
- **Kyun zaroori:** ye cosmetics ka khaas jokhim hai. Khula maal B7-1 me returnable nahi, par customer ki sehat ka maamla hai, aur ek batch pe kai shikayatein batch me dikkat ka ishaara hain (B3-12).
- **Vikalp:**
  - **(a) Normal shikayat:** koi refund nahi; brand ko khabar.
  - **(b) Case record:** product, batch, kya hua, photo (customer ki consent ke saath); brand ko khabar; staff ke faisle se bina wapsi refund (goodwill, ek seema tak); Skin & Hair Expert (D-025) se salah ka offer.
  - **(c) (b) + batch pe nazar:** ek batch pe tay ginti (misaal 3) shikayatein → batch ki bikri ruke aur staff jaanch kare (B3-12).
- **Salah:** **(c)**. Refund ka kharcha brand ka jab batch me dikkat sabit ho; warna platform ka goodwill (seema ke saath).
- **Trade-off:** (a) customer ka bharosa toot-ta aur batch ki dikkat chhup jaati; (b) me sehat ka data (Security); (c) me ek galat shikayat se bhi batch ruk sakta, isliye staff jaanch.
- **Kanooni detail jaanchi nahi (R-004):** cosmetics ke side-effect (adverse event) ki report ke niyam; sehat ke data ki consent.
- **R1 ya baad me:** R2 (support desk R2 se).
- **Kis par tika:** D-025; B2-2, B3-12.

#### B7-10. Baar-baar return ya daawa karne wale customer

- **Sawal:** jo customer bahut return ya daawe kare, us pe kya ho?
- **Kyun zaroori:** D-072 niyam 4 me sirf record aur report hai; return ke liye bhi niyam chahiye, warna pickup ka kharcha aur nuksaan badhta.
- **Vikalp:**
  - **(a) Sirf record** aur staff ko report.
  - **(b) Seema ke baad suvidhayein band:** misaal 90 din me 5 returns, ya delivered ka 40% se zyada → man badla wala return band, delivery pe UPI band (B5-2), pickup pe refund (B7-8) band. Staff khol sake; customer ko wajah dikhe.
  - **(c) Account band.**
- **Salah:** **(b)**.
- **Trade-off:** (a) nuksaan chalta rehta; (b) me ek seema aur kuch sahi customer bhi pakde ja sakte (isliye staff khol sake); (c) bahut kada, galat faisle ka jokhim.
- **R1 ya baad me:** R2 (record R1 se).
- **Kis par tika:** D-072; B5-2, B7-8.

### 7.4 Pehle ke kaam se lene layak

| Kya                                                                      | Kahan (purana path)                           | Kyun achha             | Kasauti check                                                                                                          | Naye docs me kahan              |
| ------------------------------------------------------------------------ | --------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Return ki wajahon ki list: leak, pighla, galat shade, toota, item kam    | `docs-old/PRD.md` §5.1                        | B7-1 ka shuruaati roop | Zaroorat: haan; "near-expiry" wajah naye me "expiry dikhayi gayi se pehle ki" banegi (D-067 ke baad); naya vakya: haan | returns TASK                    |
| Return ki jaanch: seal, shade, expiry, batch ka mel → refund ya rok      | `docs-old/PRD.md` §3.2 (Returns QC Inspector) | B7-4                   | Zaroorat: haan; takrav nahi; naya vakya: haan                                                                          | returns TASK; FLOWS             |
| Pickup pe seal, shade aur batch ki jaanch                                | `docs-old/PRD.md` §5.9                        | B7-6                   | Zaroorat: haan; takrav nahi; naya vakya: haan                                                                          | FLOWS; delivery TASK            |
| Replacement ek hi trip me (naya do, purana lo)                           | `docs-old/PRD.md` §5.9                        | B7-5 (R2)              | Zaroorat: R2; takrav nahi; naya vakya: haan                                                                            | FLOWS                           |
| Skin reaction ya recall ka ek case record, aur us pe alag logon ke tasks | `docs-old/ARCHITECTURE.md` §15 (15)           | B7-9, B3-12            | Zaroorat: R2; takrav nahi; naya vakya: haan                                                                            | FLOWS; catalog aur support TASK |

**Na lein:** lauta ya near-expiry maal platform khud beche (liquidation) — D-060 aur D-062 se takrav. Return ki "near-expiry" wajah jyon ki tyon — D-067 ke baad customer expiry dekh ke kharidta hai, to matlab badla.

## 8. Poora kram

### 8.1 Saare proposed sawal, sabse rokne wala pehle

Kram ka aadhaar: jis sawal pe zyada doosre sawal aur R1 ka design tike, wo pehle. R2 wale aakhir me.

| #   | Id    | Sawal (chhota)                                 | R1 ya baad me          |
| --- | ----- | ---------------------------------------------- | ---------------------- |
| 1   | B3-1  | Ek hi product do sellers bechna chahein to     | R1                     |
| 2   | B3-2  | Variant kin cheezon se bane                    | R1                     |
| 3   | B5-1  | Kai sellers wala order: dhaancha aur parcel    | R1                     |
| 4   | B6-1  | Seller se kaunsi fees, commission kis rakam pe | R1                     |
| 5   | B7-1  | Return ki wajahein aur "band" ka matlab        | R1                     |
| 6   | B7-2  | Return ki samay-seema                          | R1                     |
| 7   | B6-2  | Seller ka paisa kab payable, payout kitni baar | R1                     |
| 8   | B3-8  | Expiry ki teen seemaayein (D-062 ke numbers)   | R1                     |
| 9   | B3-9  | Pack pe expiry date na ho to                   | R1                     |
| 10  | B1-3  | Brand ka maal aana: ASN aur farak              | R1                     |
| 11  | B3-10 | Har variant pe barcode                         | R1                     |
| 12  | B3-7  | HSN aur GST rate kaun tay kare                 | R1                     |
| 13  | B3-3  | Content ka maalik aur badlav ki jaanch         | R1                     |
| 14  | B2-1  | Seller aur catalog ki jaanch ka daayra         | R1                     |
| 15  | B2-2  | R1 me customer ke maamle kaun sambhale         | R1                     |
| 16  | B5-5  | Stock kab ruke, payment ke liye kitna samay    | R1                     |
| 17  | B5-2  | Delivery pe UPI ke niyam                       | R1                     |
| 18  | B4-3  | Customer se delivery fee                       | R1 (owner tay kare)    |
| 19  | B5-3  | Customer cancel: kab tak aur kitna             | R1                     |
| 20  | B1-1  | Delivery ka vaada aur cut-off                  | R1                     |
| 21  | B1-2  | Delivery na ho paaye aur RTO                   | R1                     |
| 22  | B5-4  | Pick pe reserved maal toota ya kam             | R1                     |
| 23  | B7-4  | Lauta maal kahan, nuksaan kiska                | R1                     |
| 24  | B7-6  | Pickup pe jaanch                               | R1                     |
| 25  | B7-3  | Daawe ka saboot                                | R1                     |
| 26  | B7-7  | Return ka kharcha                              | R1                     |
| 27  | B6-6  | Refund ka raasta aur samay                     | R1                     |
| 28  | B6-3  | Customer ka paisa kis khaate me                | R1                     |
| 29  | B6-4  | Fees ki shuruaati rakam (dummy)                | R1                     |
| 30  | B6-5  | Udhaar aur kaat ki seemaayein                  | R1 (udhaar), R2 (kaat) |
| 31  | B4-1  | Daam ke bade badlav ki seema                   | R1                     |
| 32  | B4-2  | Discount kaise dikhe                           | R1 (+R2 hissa)         |
| 33  | B3-4  | Shade ki jaankari                              | R1                     |
| 34  | B3-5  | Ingredients aur allergens                      | R1 (+R2 hissa)         |
| 35  | B3-6  | Product claims                                 | R1 (+R2 hissa)         |
| 36  | B1-4  | Hub aur warehouse ki staff list                | R1                     |
| 37  | B5-6  | Normal customer ki quantity seema              | R1                     |
| 38  | B5-7  | Order ke baad badlav                           | R1 (a), R2 (b)         |
| 39  | B3-11 | Imported cosmetics                             | Fields R1              |
| 40  | B3-12 | Batch recall                                   | R2 (data R1)           |
| 41  | B4-4  | Discount ka paisa kaun de                      | R2 (khane R1)          |
| 42  | B4-6  | Bundles aur kits                               | R2 (brand kit R1)      |
| 43  | B4-5  | Offers ka mel                                  | R2                     |
| 44  | B4-7  | Free samples aur gifts                         | R2                     |
| 45  | B4-8  | Kam expiry wale batch ki sale                  | R2                     |
| 46  | B5-8  | Bina Pro bane GSTIN invoice                    | R2                     |
| 47  | B7-5  | Refund, wahi item, ya doosra shade             | R1 (a), R2 (b)         |
| 48  | B7-8  | Refund kab (R1 ke baad)                        | R2                     |
| 49  | B7-9  | Skin reaction ki shikayat                      | R2                     |
| 50  | B7-10 | Baar-baar return karne wale                    | R2                     |
| 51  | B6-7  | Chargeback ka nuksaan                          | R2                     |
| 52  | B6-8  | Delivery partner ki kamaai                     | R2                     |

**Ginti:** B1: 4, B2: 2, B3: 12, B4: 8, B5: 8, B6: 8, B7: 10. Kul 52.

### 8.2 Sirf jaanch (owner ka faisla nahi)

Ye sab kanooni ya tathya ki jaanch hai; kanooni wali saari "Kanooni detail jaanchi nahi (R-004)" aur kanooni agent ke liye.

1. Cosmetics ke label ke zaroori fields (batch, mfg date, expiry ya use-before, ingredients, licence ya import registration number, manufacturer ya importer) aur kya har cosmetic pe expiry zaroori hai (B3-9). (R-004)
2. Online product page pe pack ki kaunsi jaankari zaroori (net quantity, MRP, prati unit daam, country of origin, customer care), aur imported products ke liye country of origin ka filter. (R-004)
3. 2025 ke badlav ke baad cosmetics aur personal care ke HSN codes aur GST rates (B3-7). (R-004)
4. E-commerce operator ke GST TCS aur income-tax TDS ki abhi ki rates aur shartein (R1 seller hisaab); house brand (alag company, D-031) pe bhi wahi. (R-004)
5. Invoice kab banna chahiye (pack, dispatch ya delivery pe), aur e-invoicing ki seema. (R-004)
6. Platform ke apne invoices: commission aur fees ka seller ko invoice (har order ya mahine ka), delivery fee ka customer ko invoice (B4-3, B6-1). (R-004)
7. Discount (brand ya platform ka), free samples aur gifts, aur kits pe GST (B4-4, B4-6, B4-7). (R-004)
8. Return policy dikhane ke niyam, aur khule cosmetics pe "no return" ki shart (B7-1). (R-004)
9. Lautaye band cosmetics ko dobara bechne ki ijazat (B7-4). (R-004)
10. Cosmetics recall aur side-effect (adverse event) ki report ke niyam (B3-12, B7-9). (R-004)
11. Ayurvedic ya herbal beauty products ka darja: cosmetic ya AYUSH drug licence (D-043 se asar, §11). (R-004)
12. Marketplace ka customers ka paisa rakh ke sellers ko dena: payment aggregator ke niyam (B6-3); refund ka samay (B6-6). (R-004)
13. "Pehle ka daam" aur discount dikhane ke niyam (B4-2). (R-004)
14. Perfume, nail polish, aerosol jaise jalne wale products ko warehouse me rakhne aur do-pahiya pe le jaane ke niyam. (R-004)
15. Razorpay test mode me: UPI QR payment ka refund, dynamic QR, aur linked accounts me hold wale transfers chalte hain ya nahi (B5-2, B6-3, B6-6). Tathya, docs se.
16. Email ki ginti: har order pe kitne emails (confirmation, delivery code, dispatch, delivery, invoice, refund) aur din ke 300 (D-028, R-013) me kitne orders fit. Andar ka hisaab.

## 9. PRODUCT, FLOWS aur GLOSSARY ke liye prastaav

**Ye sirf prastaav hain.** Naye docs me kuch bhi owner ki haan ke baad, ek-ek karke (D-019, D-074). Neeche ke vakya apne aap me poore hain.

### 9.1 PRODUCT.md (B1 se B7 ke hisse) ki rooprekha

1. **Fulfilment:** maal sirf apne warehouse me, delivery sirf apne partners; raasta brand → warehouse → hub → delivery partner → customer; delivery ka vaada aur cut-off; koshish aur RTO (D-014, D-016, D-027, D-033; B1-1, B1-2).
2. **Maal ka aana aur rakhna:** shipment ki suchna, receiving aur accept, batch aur expiry ki jaanch, storage fee (D-014, D-062, D-066; B1-3, B3-8, B3-9).
3. **Catalog:** product, variant, batch; ek brand ka ek seller; content ka maalik aur jaanch; shade, ingredients, claims; HSN aur GST; barcode (D-030, D-043; B3-1 se B3-12).
4. **Daam:** MRP (tax samet, batch ka), seller ka daam, Pro daam, discount kaise dikhe, customer ki fees (D-061, D-064, D-065, D-070; B4).
5. **Order:** order, seller ka hissa, parcel, invoice; stock ka rukna; cancel; delivery pe UPI (D-020, D-030, D-034, D-041; B5).
6. **Paisa:** payment, refund, seller ka hisaab (fees, bharpai, udhaar), payout (D-055, D-063, D-071; B6).
7. **Return aur replacement:** wajahein, "band" ka matlab, samay-seema, saboot, lauta maal kahan, kharcha (B7).
8. **R1 me kya, baad me kya:** har hisse ki ek line, PROJECT_PLAN §1 ki link (ek baat ek jagah, D-019).

### 9.2 FLOWS.md ke flows ki list

1. Seller ka judna aur manzoori (warehouse state ke GSTIN ke saath).
2. Listing banana → jaanch → live; listing badalna → (jokhim wale fields pe) dobara jaanch.
3. Daam badalna (bade badlav pe confirm, itihaas).
4. Brand ka maal aana: suchna → receiving → jaanch → accept ya hold ya wapas → stock.
5. Batch ki zindagi: bikne layak → bikri band → brand ka chunaav → wapsi ya nasht; storage fee ki ginti.
6. Cart → checkout → stock rukna → prepaid payment → order pakka (der se payment pe refund).
7. Delivery pe UPI wala order.
8. Pick aur pack → har seller ka invoice → warehouse se hub ka trip → hub pe receive → delivery partner → delivery (code, ya photo aur location).
9. Delivery na ho paaye → doosri koshish → RTO → refund.
10. Customer ka cancel (poora ya ek item) → refund.
11. Pick pe maal toota ya kam → batch badalna ya customer se poochhna → cancel aur refund.
12. Return: request (wajah + photo) → manzoori → pickup (jaanch) → warehouse jaanch → refund aur lauta maal kahan.
13. Replacement (R2).
14. "Parcel nahi mila" ka daawa.
15. Hamari zimmedari me nuksaan → seller ko bharpai → transporter ya partner se vasooli.
16. Seller ka hisaab → payable → payout (haath se "paid") → udhaar.
17. Batch recall (R2).
18. Skin reaction ka case (R2).

### 9.3 GLOSSARY.md ke shabd

Pehchaan ke naam (backticks me) sirf prastaav hain; asli naam design me.

| Shabd                           | Matlab                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| Product                         | Ek cheez jaise customer use jaanta hai (ek naam, ek formula); iske neeche variants.    |
| Variant (SKU, `Variant`)        | Product ka ek roop (jaise ek shade ka ek size); apna barcode, MRP, stock aur batches.  |
| Shade                           | Rang wale product ka ek rang; naam, swatch photo aur hex ke saath.                     |
| Undertone                       | Twacha ka andar ka rang-jhukaav: warm, cool, neutral ya olive; complexion products pe. |
| Batch (lot)                     | Ek saath bana maal; apna batch number, mfg date, expiry aur MRP.                       |
| MRP                             | Pack pe chhapa zyada se zyada daam, saare tax samet; batch ke hisaab se.               |
| Selling price (daam)            | Jo customer deta hai; seller tay karta hai, MRP se zyada nahi.                         |
| Pro daam                        | Seller ka alag daam, sirf jaanche hue Beauty Pro buyers ke liye.                       |
| Agla batch                      | Sabse pehle expire hone wala bikne layak batch; site pe usi ka MRP aur expiry.         |
| Bikri band                      | Expiry ki seema se kam bachi ho to batch ka bikna band hona.                           |
| PAO                             | Khulne ke baad kitne mahine istemaal karein (jaise 12M); expiry ka badal nahi.         |
| INCI list                       | Product ke ingredients ki poori list, pack jaisi.                                      |
| Tamper-evident seal             | Factory seal ya shrink wrap jo khulne pe toot-ta hai; "band maal" ki pehchaan.         |
| Shipment ki suchna (ASN)        | Maal bhejne se pehle seller ki di jaankari: variant, batch, expiry, MRP, ginti.        |
| Receiving                       | Warehouse me maal ginna aur jaanchna; "accept" se hamari zimmedari shuru.              |
| Quarantine (hold)               | Jaanch tak maal bikne layak stock se alag.                                             |
| Warehouse                       | District ka mukhya godaam, jahan saara maal rehta hai.                                 |
| Hub                             | Sub-district ka parcel kendra; stock nahi rakhta, parcel aage badhata hai.             |
| Trip                            | Warehouse aur hub ke beech transporter ki ek yatra, manifest aur seal ke saath.        |
| Delivery code                   | Har parcel ka code jo delivery pe partner daalta hai; sahi code = delivery pakki.      |
| RTO                             | Delivery na ho paane pe parcel ka warehouse wapas aana.                                |
| Order                           | Customer ki ek kharidari, ek order number.                                             |
| Seller ka hissa (`SellerOrder`) | Order me ek seller ke items; har hisse ka apna invoice.                                |
| Parcel                          | Ek physical dabba jo deliver hota hai; ek parcel me kai sellers ke hisse ho sakte.     |
| Line ka hissa                   | Ek order line ka bhaag jo alag batch ya alag daam (Pro ya normal) ki wajah se bana.    |
| Reservation                     | Order pe stock ka ek batch se ruk jaana, payment ya cancel tak.                        |
| Delivery pe UPI                 | Delivery ke waqt partner ke dikhaye QR se UPI payment; cash nahi.                      |
| Commission                      | Bikri pe platform ka %, seller ke hisaab se katta.                                     |
| Fulfilment fee                  | Rakhne, pack karne aur bhejne ki fixed fee.                                            |
| Storage fee                     | Muft din ke baad na bike maal pe mahine ki fee.                                        |
| Disposal fee                    | Maal nasht karne ki fee.                                                               |
| Bharpai                         | Hamari zimmedari me hue nuksaan pe seller ko diya credit.                              |
| Vasooli                         | Transporter ya delivery partner se nuksaan ki rakam, saboot ke saath.                  |
| Udhaar                          | Seller pe bachi fees jo bikri se zyada hui; agle payouts se katti.                     |
| Payable                         | Seller ki wo rakam jo ab payout me jaa sakti hai.                                      |
| Payout                          | Seller ko paisa bhejna.                                                                |
| Return window                   | Delivery ke baad return maangne ke din, wajah ke hisaab se.                            |
| Recall                          | Kisi batch ko bikri se hata ke customers se wapas bulana.                              |
| House brand                     | Beautinique ka apna brand, ek alag company ke seller account se.                       |
| Beauty Pro                      | Jaancha hua professional kharidaar jise Pro daam dikhta hai.                           |
| HSN                             | Product ka tax code, jisse GST rate tay hota hai.                                      |

## 10. Aage ke agents ke liye

### 10.1 Security Architect

- Payment ke webhooks: signature ki jaanch, ek event do baar na chale (idempotency), aur der se aaye payment pe apne aap refund ka sahi hona.
- Refund aur goodwill (B7-9) pe har role ki rakam ki seema; badi rakam aur payout pe banane wala aur manzoor karne wala alag (owner ke do accounts se bhi).
- Daam ka har badlav audit me (D-061); seller ki team me kaun daam badal sake.
- Customer ki return photos aur video (ghar, chehra aa sakta), delivery ki photo aur location (D-072), skin reaction ka sehat data (B7-9, consent): kitne din rakhein, kaun dekhe.
- Claims ke saboot (B3-6), Pro ke dastavez (D-069), brand authorisation letter (B3-1): private storage, sirf jaanch wale staff ko.
- Fraud ke signals: delivery pe UPI pe mana (B5-2), baar-baar return (B7-10), pickup pe batch ka mel na khaana (B7-6), "parcel nahi mila" daawe (D-072).
- Seller ke bank details (payout) aur customer ka UPI ID: sensitive data.
- Appeal me kaam ka bantwara (B2-1).
- Koi bhi OTP ya khabar sirf email, in-app aur browser push se; phone number sirf contact.

### 10.2 Principal Software Architect

- Order ka dhaancha: order → seller ka hissa (invoice) → parcel (delivery) → line → line ke hisse (batch, D-064; Pro ya normal, D-070). Hisse aur parcel ek doosre se bandhe nahi (B5-1).
- D-011 ki seema: stock ka rukna aur order banna "ek saath pakka" hona chahiye. Ya dono ek service me, ya saga ka design (stock rukna, order, payment, aur fail pe wapas). D-016 niyam 9 (serviceability usi transaction me) alag logistics service ke saath tabhi jab commerce ke paas pincode → hub ki copy events se ho.
- Area setting ka resolver D-015 ki seedhi (sub-district samet) ke saath; delivery promise, cut-off, chhuttiyan, delivery pe UPI ki seema, expiry seemaayein (category ke override ke saath, B3-8).
- Catalog ka public data cache ho sake, par Pro daam (D-065) aur "agla batch" (D-064, D-067) badalte rehte hain: cache aur sahi jaankari ka mel.
- Invoice ka bina gap number har GSTIN aur financial year ka; ek parcel me kai invoices.
- Finance (PostgreSQL) ko orders, refunds, bharpai, fees ke events; seller hisaab ka minus balance (D-071).
- Polling se status (D-028): order aur delivery ki haalat ke liye in-app aur browser push.
- Carrier port (D-014): RTO, koshish aur pickup ke events us port ke peeche bhi.

### 10.3 Database Architect

- Stock batch ke level pe: append-only movements + balances; reservation batch pe; "ek bin, ek batch" (B3-10).
- Daam ka itihaas (D-061) se "pichhle 30 din ka sabse kam" (D-063, B4-2) ki tez query.
- Har batch ki receiving tareekh se umar (D-066); lauta band maal usi batch me aaye (B7-4) to umar kis tareekh se, ye tay karna.
- Har order line ke hisse pe batch: recall (B3-12) aur skin reaction (B7-9) ke liye "is batch ke customers" ki query.
- Listing ke versions (B3-3) ka data badhta hai; Atlas M0 ke 0.5 GB (R-006) me images aur dastavez database me nahi.
- Ledger PostgreSQL me double-entry; seller, partner, fees, TCS, TDS, refunds ke accounts data me.
- HSN → rate table tareekh ke saath (B3-7); order line pe us din ka rate snapshot.

### 10.4 UX

- Line ke hisse saaf: batch ke hisaab se alag MRP aur expiry (D-064, D-067), aur Pro ya normal daam (D-070); ek line me chaar hisse tak ho sakte.
- Cart me rakhe item ka MRP, daam ya expiry checkout tak badle to saaf suchna, chupke se nahi.
- Delivery fee aur muft delivery ki seema product page aur cart pe pehle se; koi chhupi fee ya pehle se tick kiya box nahi.
- Return request: wajah → saboot → samay-seema saaf; "is product pe man badla return nahi (seal nahi aata)" product page pe pehle se.
- Delivery code (D-072) customer ke order page pe aasaani se.
- Seller ke liye: daam ke bade badlav ka confirm (B4-1), D-064 niyam 2 ka alert, return ke nateeje aur wajah.
- Shade swatches undertone aur depth ke saath; ingredients ki poori list padhne layak.

### 10.5 QA

- Oversell: ek batch ke kam units pe ek saath kai orders.
- Batch badalna cart aur checkout ke beech (MRP aur expiry badle); line ka do batches me batna.
- Der se payment (reservation ke baad); do baar aaya webhook.
- Partial cancel aur partial return me refund ka paise tak sahi baantna (delivery fee, R2 coupons).
- Ek parcel me do sellers ke invoices; invoice number ek saath kai packing pe bhi bina gap.
- Area OFF jab orders aur returns raaste me (D-015, D-016 niyam 10); do states me phaila pincode (D-016).
- Seemaon ke kinaare: storage fee din 90 aur 91; bikri band ki seema ka din; return window ka aakhri ghanta.
- D-063 ka 30 din ka sabse kam daam; udhaar ka agle payout se katna (D-071).
- Mutation testing sirf paisa, stock aur permissions ki badli lines me (CLAUDE.md).

## 11. Tay faislon pe dhyaan

Ye faisle dobara khole nahi ja rahe; sirf jokhim ya kami, wajah ke saath. Kuch badalna ho to owner ki haan se "badla" line (D-018).

1. **D-064 aur warehouse me exact batch pick:** EAN batch nahi batata, to scan karke pick (B3-10) se ye pakka nahi hota ki wahi batch gaya jiska MRP aur expiry customer ne dekhi. Warehouse me "ek bin, ek batch" ya har unit pe batch wala label chahiye. Saath me "agla bhejne wala batch" ka matlab saaf ho: sabse pehle expire hone wala **bikne layak** batch (D-064 niyam 2 me ruka batch chhoot jaata hai, to us batch pe "pehle expire wala pehle" toot-ta hai aur wo brand ke nuksaan, D-062, ki taraf jaata hai).
2. **D-063 ki zimmedari me customer ka return:** zimmedari "receiving se customer ko delivery (ya brand ko wapsi) tak" likhi hai. Return pickup ke baad, warehouse pahunchne se pehle maal kho jaaye ya toot jaaye, to ye saaf nahi. Salah: pickup scan se warehouse ki receiving tak bhi hamari zimmedari; customer ko refund pickup ke saboot pe, aur seller ko D-063 ke daam pe bharpai. Ek line ka spashtikaran chahiye.
3. **D-055 (R1) me support desk R2 se, par R1 me staff ke faisle hain:** return ki manzoori aur D-072 ke daawe staff jaanch maangte hain. B2-2 isi ke liye; R1 ka scope owner ki haan se thoda badal sakta hai.
4. **D-043 aur herbal products:** India me bahut se herbal ya Ayurvedic beauty products cosmetic nahi, Ayurvedic drug licence pe bante hain; D-043 ke hisaab se wo bahar ho sakte hain. Kuch aam "skin care" bhi drug hain (jaise ketoconazole wala anti-dandruff shampoo, benzoyl peroxide ya adapalene wali acne cream, hydroquinone, minoxidil). Listing pe licence ka type (cosmetic, import registration, drug ya AYUSH) lena aur drug wale type ko rokna, saath me ingredients ki blocklist. Kanooni detail jaanchi nahi (R-004).
5. **D-016 niyam 9 aur D-011:** serviceability ki jaanch "order banate waqt usi transaction me" alag services aur alag databases ke saath seedhe sambhav nahi. Commerce ke paas pincode → hub ki copy (events se) chahiye. Architect (§10.2).
6. **D-072 aur D-028 (300 emails/din, R-013):** har order pe kai emails (confirmation, delivery code, dispatch, delivery, invoice, refund). Har order pe 5 emails ho to din me ~60 orders me seema khatam. Salah: delivery code order confirmation ke email me hi, baaki haalat in-app aur browser push se; emails sirf zaroori.
7. **D-061 niyam 4 aur GST rate ka badlav:** daam tax samet hai aur platform daam nahi badalta. Sarkar rate ghataye to daam wahi rehne se seller ka taxable hissa badhta hai; kanoon customer ko fayda dene ki maang kar sakta hai (jaanchi nahi, R-004). Platform ka kaam: rate badalne pe seller ko alert aur "daam dekho" ka kadam (B3-7).
8. **D-063 niyam 1 ka "selling price":** Pro daam (D-065) bhi selling price hai. Bharpai ka hisaab normal daam ke itihaas se ho, Pro daam se nahi: ye ek line me saaf likhna achha.
9. **D-064 niyam 4, D-067 niyam 2 aur D-070 niyam 2 ek saath:** ek line batch aur Pro/normal dono wajah se 4 hisson tak bat sakti hai. Data aur invoice sambhal lete hain, par customer ke liye cart ulajh sakta hai (UX, §10.4). D-070 ke asar me ye pehle se likha hai; sirf yaad dilana.
10. **Purane docs ka house brand wala niyam:** purane docs me "apne brand ki bikri pe TCS nahi" aur "house brand ka supplier Beautinique" hai. D-031 (alag company) ke baad house brand pe bhi baaki sellers jaise TCS aur TDS lagne chahiye (jaanchi nahi, R-004). Naye docs me purana niyam na aaye.

## Change log

| Version | Date       | Badlav                                                                                                                       |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-18 | Pehla version: B1 se B7 ki domain report (Agent 2, run 1), 52 proposed sawal, lene layak cheezein aur tay faislon pe dhyaan. |
