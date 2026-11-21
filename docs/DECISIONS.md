# DECISIONS: Beautinique

> **Status:** v1.14.34 (2026-11-22). Har faisla ek jagah. Sirf wahi "Tay" jo owner ne khud kaha; Claude ki salah faisla nahi. Cheezein ek-ek karke judti hain.

## 0. Kaise likhein

- **§1 Ek nazar me:** har faisla ek line me (Id, faisla, tag, kab).
- **§2 Record:** har faisle ke liye: **Faisla**, **Wajah**, **Chhode vikalp**, **Kab dobara khulega**, **Kisne, kab**, **Nishaan** (`Owner` / `Salah maani` / `Salah nahi maani`), aur zaroorat ho to **Asar (Claude)**.
- **Tag:** `Business`, `Architecture`, `Security` ya `Process`.
- Faisla badle to purani line mitti nahi: nayi line "badla" ke saath judti hai.
- **"Kanooni detail jaanchi nahi":** lawyer se jaancha nahi (R-004). Public source se milaan, jaise-jaise aaye, [COMPLIANCE.md](COMPLIANCE.md) me (D-220).
- **Number:** D-001, D-002 ... kram se. Ek baar diya number kabhi badalta nahi aur dobara use nahi hota.

## 1. Ek nazar me

| Id    | Faisla                                                                                                                                                                                                                                                                                  | Tag          | Kab        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- |
| D-001 | Tech stack tay; finance service ka database PostgreSQL, baaki saari services MongoDB pe.                                                                                                                                                                                                | Architecture | 2026-11-17 |
| D-002 | Ek monorepo, tay folder dhaancha; tools aur conventions RULES me.                                                                                                                                                                                                                       | Architecture | 2026-11-17 |
| D-003 | Docs aur code naye sire se; pehle ka kaam sirf seekhne ka reference, naye me uska zikr ya link nahi.                                                                                                                                                                                    | Process      | 2026-11-17 |
| D-004 | Abhi sirf discovery; plan, task files aur code owner ke agla stage kholne pe.                                                                                                                                                                                                           | Process      | 2026-11-17 |
| D-005 | Agents ek ke baad ek; 5-hour limit ~80% pe naya agent nahi.                                                                                                                                                                                                                             | Process      | 2026-11-17 |
| D-006 | Docs kai files me: PROJECT_PLAN, har module ka folder `tasks/NN-<module>/`, FLOWS; dhaancha docs index me.                                                                                                                                                                              | Process      | 2026-11-17 |
| D-007 | Security Architect zaroori, alag role; security ki do files, faisle aur risks tag ke saath.                                                                                                                                                                                             | Security     | 2026-11-17 |
| D-008 | Design aur task files poore ecosystem ki pehle din; banana releases me (R1 = patla par poora order flow); koi feature kata nahi.                                                                                                                                                        | Process      | 2026-11-17 |
| D-009 | Capacity: ek insaan, 2 Claude accounts, 30 ghante/hafta, koi deadline nahi.                                                                                                                                                                                                             | Process      | 2026-11-17 |
| D-010 | 11 alag apps, har role parivaar ka ek; screens module ke saath judti hain.                                                                                                                                                                                                              | Architecture | 2026-11-17 |
| D-011 | Sabki alag services, har service ka apna database aur apna cluster; seema transaction se.                                                                                                                                                                                               | Architecture | 2026-11-17 |
| D-012 | Design aur code asli users maan ke (production-grade), halaanki live system sirf owner chalata hai.                                                                                                                                                                                     | Architecture | 2026-11-17 |
| D-013 | Backup: ek command se saare databases ka data download aur restore command; files repo ke folder me par git se bahar (4 pehre).                                                                                                                                                         | Architecture | 2026-11-17 |
| D-014 | Fulfilment: maal sirf apne warehouse me, delivery sirf apne partners; carrier port; seller khud nahi bhejta; pehle din 1 warehouse + 1 hub.                                                                                                                                             | Business     | 2026-11-17 |
| D-015 | Location: India > State > District > Sub-District; har level ka switch; switch aur live alag; sharten sirf live karte waqt.                                                                                                                                                             | Business     | 2026-11-17 |
| D-016 | Pincode → theek ek hub (primary sub-district se), 10 cases ke niyam ke saath.                                                                                                                                                                                                           | Business     | 2026-11-17 |
| D-017 | Roles ki poori list design me, har role apne module ke saath chalu; ginti fix nahi; owner ke har role ka alag account.                                                                                                                                                                  | Business     | 2026-11-17 |
| D-018 | Faislon ka record is file ke format me; badalne pe "badla" line; sawal-jawab files me sirf aakhri faisla.                                                                                                                                                                               | Process      | 2026-11-17 |
| D-019 | Docs chhote, har baat ek jagah, "bana hai" sirf code ya test ki link se; CI me docs ke paths ka check.                                                                                                                                                                                  | Process      | 2026-11-17 |
| D-020 | Guest cart aur guest wishlist nahi; bina sign-in sirf dekhna, search, reviews padhna, pincode check.                                                                                                                                                                                    | Business     | 2026-11-17 |
| D-021 | Customer ke sign-in ke teen raaste: password, social (Google, LinkedIn, GitHub), email code.                                                                                                                                                                                            | Security     | 2026-11-17 |
| D-022 | Location ka kaam sirf utna jitna D-015 ko chahiye; pehle location, phir products; staff ki list data me (sirf Master badle).                                                                                                                                                            | Business     | 2026-11-17 |
| D-023 | Package CLI ka kaam wahi (create, publish, republish, verify, update-deps); naya kaam publish ke plan pe; teen chhote niyam.                                                                                                                                                            | Process      | 2026-11-17 |
| D-024 | `main` branch hategi; flow `prerelease` → `release`; GitHub default branch `release`.                                                                                                                                                                                                   | Process      | 2026-11-17 |
| D-025 | Skin & Hair Expert aur Beauty Advisor asli staff roles; video ke liye Google Meet ka dummy link; Beauty Advisor ka message thread (live chat nahi).                                                                                                                                     | Business     | 2026-11-17 |
| D-026 | Lakshya: portfolio project, par aisa bane ki kal asli business ban sake; design asli jaisa, registrations aur kanooni details dummy.                                                                                                                                                    | Business     | 2026-11-17 |
| D-027 | Warehouse aur hub ke beech maal kiraye ke transporter se; har trip ka record aur transporter ka bill finance me.                                                                                                                                                                        | Business     | 2026-11-17 |
| D-028 | Kharcha ₹0, domain nahi; server baar-baar jagaya jayega; production-grade = code + chalne ki quality, ₹0 me jitni ho sake.                                                                                                                                                              | Business     | 2026-11-17 |
| D-029 | Sirf beauty aur personal care; koi aur category nahi.                                                                                                                                                                                                                                   | Business     | 2026-11-17 |
| D-030 | Business model: apna brand + doosre beauty brands seller ban ke, sab ek hi storefront pe.                                                                                                                                                                                               | Business     | 2026-11-17 |
| D-031 | Apna brand ek alag (dummy) company ke naam se, seller app ke "house brand" seller account se; koi shortcut nahi.                                                                                                                                                                        | Business     | 2026-11-17 |
| D-032 | Sirf brand owners aur authorised distributors bech sakte hain; baaki Beauty Pro Buyer ban ke kharidte hain.                                                                                                                                                                             | Business     | 2026-11-17 |
| D-033 | Delivery partners gig partners, apni gaadi ke saath.                                                                                                                                                                                                                                    | Business     | 2026-11-17 |
| D-034 | Payments: prepaid online (Razorpay) ya delivery pe UPI QR; cash bilkul nahi.                                                                                                                                                                                                            | Business     | 2026-11-17 |
| D-035 | Launch phases me: Pune district → Maharashtra ke baaki districts → baaki states; poora India dekh sake, order sirf served pincodes se.                                                                                                                                                  | Business     | 2026-11-17 |
| D-036 | Sellers poore India se; jis state ke warehouse me maal, us state ka GSTIN zaroori; onboarding me guide aur checklist.                                                                                                                                                                   | Business     | 2026-11-17 |
| D-037 | Naya district ya state kholna sirf setting aur operations ka kaam: na code change, na deploy.                                                                                                                                                                                           | Architecture | 2026-11-17 |
| D-038 | Customers sirf 18+; sign-up pe age declaration.                                                                                                                                                                                                                                         | Business     | 2026-11-17 |
| D-039 | Ratings aur reviews R1 me.                                                                                                                                                                                                                                                              | Business     | 2026-11-17 |
| D-040 | Foreign investment ka koi plan nahi.                                                                                                                                                                                                                                                    | Business     | 2026-11-17 |
| D-041 | Sirf India, prices INR me; har order ka GST-compliant invoice.                                                                                                                                                                                                                          | Business     | 2026-11-17 |
| D-042 | Saare apps fully responsive web; Delivery mobile-first PWA (offline); baaki apps phone pe install ho sakein; native apps nahi.                                                                                                                                                          | Architecture | 2026-11-17 |
| D-043 | Drug-classified items kabhi nahi; isliye drug licence ya pharmacist ki zaroorat nahi.                                                                                                                                                                                                   | Business     | 2026-11-17 |
| D-044 | Head of Operations: Support, Logistics aur Seller Ops ke upar.                                                                                                                                                                                                                          | Business     | 2026-11-17 |
| D-045 | Plastic EPR laagu (Beautinique micro ya small enterprise nahi maana; registration dummy).                                                                                                                                                                                               | Business     | 2026-11-17 |
| D-046 | Notify-me waitlist rahega; usse agla area kholne ka suggestion, par kholne ka koi fixed order nahi.                                                                                                                                                                                     | Business     | 2026-11-17 |
| D-047 | Master ke doosre roles (Trust & Safety Lead, Marketing Head) usi insaan ke alag staff account pe.                                                                                                                                                                                       | Security     | 2026-11-17 |
| D-048 | Hosting ₹0: backend Render free, apps Vercel Hobby, MongoDB Atlas M0 (har service ka apna), Redis Render Key Value free.                                                                                                                                                                | Architecture | 2026-11-17 |
| D-049 | Render pe bundle mode (saari backend services ek web service me); laptop pe Docker split mode.                                                                                                                                                                                          | Architecture | 2026-11-17 |
| D-050 | Har service ka apna database aur DB user; service ke andar modules ki collections module ke prefix ke saath.                                                                                                                                                                            | Architecture | 2026-11-17 |
| D-051 | Redis: laptop pe local Valkey, production me Render Key Value sirf internal URL se; laptop, tests aur CI kabhi production Redis se nahi.                                                                                                                                                | Architecture | 2026-11-17 |
| D-052 | Har Vercel app `/api/*` ko gateway pe rewrite karti hai (same-origin).                                                                                                                                                                                                                  | Architecture | 2026-11-17 |
| D-053 | Performance targets sirf tab laagu jab server jaaga ho.                                                                                                                                                                                                                                 | Architecture | 2026-11-17 |
| D-054 | Roles ka timing: design me saare roles, poore launch tak sab system me; banate waqt har role apne module ke saath chalu.                                                                                                                                                                | Business     | 2026-11-17 |
| D-055 | R1 ka scope: ek patla par poora order flow (2 sellers, 1 warehouse + 1 hub, test mode payments, simple return, review, seller ka hisaab); detail PROJECT_PLAN §1 me.                                                                                                                    | Business     | 2026-11-17 |
| D-056 | Render pe sirf ek free web service (saara backend) aur ek free Key Value; koi doosri web service nahi, preview bhi nahi.                                                                                                                                                                | Architecture | 2026-11-18 |
| D-057 | Finance ka PostgreSQL Neon ke free plan pe (expire nahi hota, pause nahi hota).                                                                                                                                                                                                         | Architecture | 2026-11-18 |
| D-058 | Saari hosting Singapore region me: Render ki web service, finance ka Neon project aur saare Atlas clusters (AWS Singapore).                                                                                                                                                             | Architecture | 2026-11-18 |
| D-059 | Pehle ke system me diye gaye roles ki jaanch nahi; naya system naye sire se (D-003).                                                                                                                                                                                                    | Process      | 2026-11-18 |
| D-060 | Warehouse me rakhe maal ka maalik bikne tak brand (seller); hum rakhte, pack karte aur pahunchate hain, aur fees lete hain.                                                                                                                                                             | Business     | 2026-11-18 |
| D-061 | Selling price brand (seller) tay karta hai, platform ke 4 niyam ke saath (MRP ki seema, itihaas, bade badlav pe confirm, platform daam nahi badalta).                                                                                                                                   | Business     | 2026-11-18 |
| D-062 | Expire hone wala, expire hua ya na bika maal: nuksaan brand ka; platform ke 6 niyam (receiving ki seema, bikri band, alert, brand ka chunaav, wapsi, record).                                                                                                                           | Business     | 2026-11-18 |
| D-063 | Hamare haath se hue nuksaan ki bharpai: jitna brand ko bikne pe milta (selling price, 30 din ka sabse kam, commission aur fees ghata ke), 5 niyam ke saath.                                                                                                                             | Business     | 2026-11-18 |
| D-064 | Alag batches ka alag MRP: site pe agle bhejne wale batch ka MRP, order usi batch se reserve; seller ka ek daam har bikne layak batch ke MRP ke andar (5 niyam).                                                                                                                         | Business     | 2026-11-18 |
| D-065 | Seller chahe to alag Pro daam rakhe, sirf jaanche hue Beauty Pro buyers ko dikhe; normal daam se zyada nahi; Pro buyer ko GSTIN wala invoice.                                                                                                                                           | Business     | 2026-11-18 |
| D-066 | Na bike maal pe storage fee: har batch receiving ke baad tay din muft, phir har mahine fee (4 niyam); expiry se bikri band batch pe ye fee nahi.                                                                                                                                        | Business     | 2026-11-18 |
| D-067 | Customer ko agle bhejne wale batch ki exact expiry (mahina aur saal) product page, cart, checkout, order aur invoice pe dikhti hai.                                                                                                                                                     | Business     | 2026-11-18 |
| D-068 | Transporter ya delivery partner se nuksaan ki vasooli sirf saboot ke saath: transporter ke bill se; delivery partner se jaanch ke baad, seema ke andar, unki baat sun ke.                                                                                                               | Business     | 2026-11-18 |
| D-069 | Beauty Pro banne ke liye ek saboot (GSTIN, business registration ya freelancer certificate) aur staff ki jaanch; darja tay muddat ke liye, staff hata sake.                                                                                                                             | Business     | 2026-11-18 |
| D-070 | Pro daam ki quantity seema seller chahe to rakhe (har order, har mahine, har Pro buyer); seema se upar normal daam; staff ko mahine ka report.                                                                                                                                          | Business     | 2026-11-18 |
| D-071 | Seller pe bachi fee (udhaar) agle payouts se kat-ti hai; seema paar ho to alert aur payment link, phir listings rokna, aakhir me account band (5 niyam).                                                                                                                                | Business     | 2026-11-18 |
| D-072 | "Parcel nahi mila" ka jhagda saboot se: delivery pe code (customer ke app aur email me), code na mile to photo aur location; daawe ka faisla saboot se (4 niyam).                                                                                                                       | Business     | 2026-11-18 |
| D-073 | Pehle ka kaam do kadam me hatega: git tag ke baad, purane docs discovery khatam hone pe, purana code naya root setup banne ke saath; dono baar owner ki haan se.                                                                                                                        | Process      | 2026-11-18 |
| D-074 | Pehle ke kaam se lene layak cheezon ki chalti list discovery ke saath: har agent ki report me hissa, kasauti, owner ki haan, discovery ke aakhir me jaanch (5 niyam).                                                                                                                   | Process      | 2026-11-18 |
| D-075 | Ek brand ka poore platform pe ek hi seller (brand khud ya uska ek authorised distributor); brand ko pehla haq; barcode se duplicate check (5 niyam).                                                                                                                                    | Business     | 2026-11-18 |
| D-076 | Variants category ke hisaab se platform tay kare (zyada se zyada 2 per product); formula badalne wala farak alag product; reviews product pe, variant ke saath (6 niyam).                                                                                                               | Business     | 2026-11-18 |
| D-077 | Kai sellers wala order: normal ek parcel (andar har seller ka invoice), majboori me alag; seller ke hisse aur parcel alag; code har parcel ka (5 niyam).                                                                                                                                | Business     | 2026-11-18 |
| D-078 | Seller ki fees: category ka % commission (GST ke bina wali rakam pe) + har unit pe tay fulfilment fee + pehle tay fees; aage ki fees shuru me ₹0 (5 niyam).                                                                                                                             | Business     | 2026-11-18 |
| D-079 | Return: hamari ya brand ki galti ki saari wajahein; "man badla" sirf band maal pe (factory seal salamat); seal na aane wale product pe man badla return nahi (5 niyam).                                                                                                                 | Business     | 2026-11-18 |
| D-080 | Return ki samay-seema wajah ke hisaab se: dikhne wali galti 48 ghante, baaki wajahein 7 din (dono misaal); uske baad batch ki dikkat recall ke raaste (5 niyam).                                                                                                                        | Business     | 2026-11-18 |
| D-081 | Seller ka paisa return ki samay-seema ke baad payable; hafte me ek payout; pehle udhaar aur fees katein, bharpai jude; kam se kam payout rakam (5 niyam).                                                                                                                               | Business     | 2026-11-18 |
| D-082 | Expiry ki seemaayein: ek default (misaal 6 mahine receiving pe, 3 mahine pe bikri band) + category ka override setting se; brand ka jawab sab pe ek (4 niyam).                                                                                                                          | Business     | 2026-11-18 |
| D-083 | Expiry pack ki chhapi date se, ya mfg date + chhapi shelf life se; sirf PAO wala maal receiving pe wapas; PAO alag field (4 niyam).                                                                                                                                                     | Business     | 2026-11-18 |
| D-084 | Seller aur listing ki jaanch poore desh ki ek-ek team kare; jisne reject kiya wo appeal tay nahi karta (3 niyam).                                                                                                                                                                       | Business     | 2026-11-18 |
| D-085 | Shade pe naam, swatch photo aur hex zaroori; complexion products pe undertone aur depth, lip aur eye pe shade family (5 niyam).                                                                                                                                                         | Business     | 2026-11-18 |
| D-086 | HSN aur GST rate platform ki tareekh wali table se; seller allowed HSN chune, staff jaanche; rate badle to alert (5 niyam).                                                                                                                                                             | Business     | 2026-11-18 |
| D-087 | Daam ke bade badlav pe dobara confirm: neeche 30% ya upar 50% se zyada, ya MRP ke 20% se kam (misaal); Pro daam pe bhi (3 niyam).                                                                                                                                                       | Business     | 2026-11-18 |
| D-088 | Brand ka pack kiya kit normal product (R1); usi seller ka combo R2 se; alag sellers ka combo nahi (5 niyam).                                                                                                                                                                            | Business     | 2026-11-18 |
| D-089 | Kam expiry wale batch pe apne aap "short expiry" label; brand chahe to clearance section; R2 se (4 niyam).                                                                                                                                                                              | Business     | 2026-11-18 |
| D-090 | Pick pe maal toota ya kam: barabar batch ho to badal do, warna customer se poochho, jawab na aaye to line cancel aur refund (4 niyam).                                                                                                                                                  | Business     | 2026-11-18 |
| D-091 | Normal customer ki quantity seema: platform ki default (misaal 10 per variant per order), seller usse kam rakh sake.                                                                                                                                                                    | Business     | 2026-11-18 |
| D-092 | Normal customer bhi GSTIN daal ke business invoice le sake (format check, Pro daam nahi); R2 se.                                                                                                                                                                                        | Business     | 2026-11-18 |
| D-093 | Customer ka saara paisa platform ke ek payment gateway account me; har seller ka hisaab finance me; baad me raasta badle to hisaab wahi.                                                                                                                                                | Business     | 2026-11-18 |
| D-094 | Fees ki shuruaati rakam (dummy): sab categories pe ek commission (misaal 10%), fulfilment ₹25, storage 90 din muft phir fee, disposal ₹10 (misaal).                                                                                                                                     | Business     | 2026-11-18 |
| D-095 | Chargeback ka nuksaan wajah ke hisaab se: product ki galti seller ki, delivery ya fraud platform ka; saboot mazboot ho to platform lade; R2 se (3 niyam).                                                                                                                               | Business     | 2026-11-18 |
| D-096 | Brand maal shipment ki pehle se suchna ke saath bheje; receiving pe farak photo ke saath seller ko; "accept" scan se zimmedari aur storage fee shuru (5 niyam).                                                                                                                         | Business     | 2026-11-18 |
| D-097 | Variant pe brand ka barcode ho to wahi, na ho to receiving pe platform ka label; warehouse me ek bin me ek variant ka ek hi batch (2 niyam).                                                                                                                                            | Business     | 2026-11-18 |
| D-098 | Listing content seller likhe; jokhim wale fields pe har badlav ki jaanch, baaki turant live aur spot check; staff khud field nahi badalta (4 niyam).                                                                                                                                    | Business     | 2026-11-18 |
| D-099 | Ingredients: text + label photo, poori list page pe; text se INCI structured list, staff jaanche; free-from filters aur allergen ki chetavni; teeno R1 me (owner).                                                                                                                      | Business     | 2026-11-18 |
| D-100 | Claims sirf platform ki tay list se; SPF/PA, organic, cruelty-free, dermatologically tested pe saboot, baaki ghoshna; R1 me saboot sirf SPF (5 niyam).                                                                                                                                  | Business     | 2026-11-18 |
| D-101 | Offer ka paisa brand, platform ya dono (hissa % aur budget); R2 ki shuruaat brand ya platform ke offer se; R1 ki order line me "discount, kisne diya" ke khane (4 niyam).                                                                                                               | Business     | 2026-11-18 |
| D-102 | Offers ka mel (R2): ek order pe ek coupon; sale daam + coupon chale; Pro daam pe coupon nahi; har offer ki setting baad me.                                                                                                                                                             | Business     | 2026-11-18 |
| D-103 | Seller udhaar: ₹5,000 ya 60 din pe alert, 30 din baad naya maal aur listings band, 90 din baad account band; partner ki kaat ₹500 ek maamle me, mahine me ₹1,500 ya kamaai ka 10% (misaal) (5 niyam).                                                                                   | Business     | 2026-11-18 |
| D-104 | Partner ki kamaai har kaam pe (misaal delivered ₹30, return pickup ₹25, fail koshish ₹10), hafte me payout; R2 se, R1 me sirf kaam ka record (3 niyam).                                                                                                                                 | Business     | 2026-11-18 |
| D-105 | R1 me Support Desk app ka patla hissa: Support Agent role return, daawe aur refund ka faisla kare; poore saboot wala return apne aap manzoor; R1 me jod (4 niyam).                                                                                                                      | Business     | 2026-11-18 |
| D-106 | Toote, galat ya kam item ke daawe me photo zaroori (item, batch label, damage; kam item pe parcel aur packing); video optional; warehouse pe pack ki photo (4 niyam).                                                                                                                   | Business     | 2026-11-18 |
| D-107 | Delivery fee seema ke neeche (misaal ₹499 se kam pe ₹49, area setting, 0 bhi); order pe ek hi fee; "₹X se upar muft" pehle se dikhe; koi platform ya packing fee nahi (4 niyam).                                                                                                        | Business     | 2026-11-18 |
| D-108 | Delivery fail: do koshish (misaal), har fail pe wajah aur khabar; hub pe zyada se zyada 3 din, phir RTO; saaf mana pe seedha RTO; prepaid refund RTO ke hub scan pe (6 niyam).                                                                                                          | Business     | 2026-11-18 |
| D-109 | Delivery pe UPI: order ki seema (misaal ₹3,000; naye customer ke pehle order pe ₹1,500); 2 baar mana pe band, staff khol sake; payment fail pe 10 minute; code payment ke baad (4 niyam).                                                                                               | Business     | 2026-11-18 |
| D-110 | Customer pack hone se pehle poora order ya ek-ek item ya quantity cancel kar sake; cancel fee nahi; baad me delivery fee nahi; prepaid refund turant (4 niyam).                                                                                                                         | Business     | 2026-11-18 |
| D-111 | Refund hamesha original raaste; cancel pe turant, RTO pe hub scan pe, return pe warehouse jaanch ke baad; fail ho to staff ka raasta; halat in-app aur email me (4 niyam).                                                                                                              | Business     | 2026-11-18 |
| D-112 | Lauta maal wajah ke hisaab se: band aur bikne layak to wapas stock; transit ka nuksaan aur galat pick hamara; brand ki galti ka kharcha seller ka; return pickup se receiving tak hamari zimmedari (7 niyam).                                                                           | Business     | 2026-11-18 |
| D-113 | Return pickup pe partner item ki photo le, label ka batch order ke batch se milaye, man badla me seal dekhe; mel na khaye to pickup nahi (3 niyam).                                                                                                                                     | Business     | 2026-11-18 |
| D-114 | Return ka kharcha: hamari ya brand ki galti pe muft aur delivery fee wapas; man badla pe refund se return fee (misaal ₹49), delivery fee wapas nahi (2 niyam).                                                                                                                          | Business     | 2026-11-18 |
| D-115 | Return refund R1 me warehouse jaanch ke baad; R2 se chhoti rakam (misaal ₹1,000 tak) pe pickup jaanch paas ho to pickup scan pe (3 niyam).                                                                                                                                              | Business     | 2026-11-18 |
| D-116 | Baar-baar return ya daawa: seema (misaal 90 din me 5, ya delivered ka 40%) paar to man badla return, delivery pe UPI aur pickup pe refund band; staff khol sake; R2 se (4 niyam).                                                                                                       | Business     | 2026-11-18 |
| D-117 | Delivery ka vaada tareekh se, cut-off ke saath (misaal 2 baje tak order to kal); roz ek trip; Sunday aur chhuttiyan area setting me; vaada toote to "der" aur khabar (4 niyam).                                                                                                         | Business     | 2026-11-18 |
| D-118 | Stock "place order" pe ruke, online payment ke liye 15 minute (misaal); der se payment pe stock ho to order, warna apne aap refund; cart me stock nahi rukta (4 niyam).                                                                                                                 | Business     | 2026-11-18 |
| D-119 | Order ke baad: R1 me koi badlav nahi (item cancel aur naya order); R2 se pack se pehle address badle, agar usi hub aur state ka ho; item jodna nahi.                                                                                                                                    | Business     | 2026-11-18 |
| D-120 | Discount: kata hua MRP + daam + "% off"; % hamesha neeche round, batch ke MRP ke saath badle; sale label pe 30 din ka sabse kam daam (R2) (3 niyam).                                                                                                                                    | Business     | 2026-11-18 |
| D-121 | Free samples aur gifts sirf brand ke (stock brand ka, invoice pe ₹0 line, batch aur expiry); return pe gift lautana zaroori nahi; R2 se (4 niyam).                                                                                                                                      | Business     | 2026-11-18 |
| D-122 | Return pe refund, ya hamari ya brand ki galti pe wahi variant dobara (ek trip me naya do, purana lo); exchange nahi; R1 me sirf refund (3 niyam).                                                                                                                                       | Business     | 2026-11-18 |
| D-123 | Shuruaati staff list: hub me 1 Hub Manager, 1 Hub Operations, 2 Delivery Partners; warehouse me 1 Warehouse Manager, 1 Receiving, 1 Pick-Pack, 1 Returns QC.                                                                                                                            | Business     | 2026-11-18 |
| D-124 | Agla bhejne wala batch = bikne layak batches me sabse pehle expire hone wala; ruka batch ginti me nahi, uska alert seller ko (3 niyam; D-064 me jod).                                                                                                                                   | Business     | 2026-11-18 |
| D-125 | D-063 ki bharpai me sirf normal daam ka itihaas; Pro daam ginti me nahi (D-063 me jod).                                                                                                                                                                                                 | Business     | 2026-11-18 |
| D-126 | Har order pe sirf zaroori emails: confirmation (delivery code ke saath), invoice, refund; baaki haalat in-app aur push, push band ho to delivery fail ka email; line: OTP, paisa, baaki (5 niyam).                                                                                      | Business     | 2026-11-18 |
| D-127 | Imported cosmetics bik sakein: importer, country of origin aur import registration (dummy) zaroori, staff jaanche; fields R1 se (2 niyam).                                                                                                                                              | Business     | 2026-11-18 |
| D-128 | Listing pe licence ka type zaroori; drug aur AYUSH drug wale product list nahi; ingredients ki blocklist; cosmetic licence wale herbal products bik sakein (4 niyam; D-043 me jod).                                                                                                     | Business     | 2026-11-18 |
| D-129 | Batch recall: bikri band, quarantine, customers ko khabar aur refund, kharcha brand ka; platform bhi jaanch tak batch rok sake; R2 se, data R1 se (6 niyam).                                                                                                                            | Business     | 2026-11-18 |
| D-130 | Skin reaction: case record (consent ke saath photo), brand ko khabar, goodwill refund seema tak, Skin & Hair Expert ki salah; ek batch pe 3 (misaal) shikayatein to bikri ruke; R2 se (7 niyam).                                                                                        | Business     | 2026-11-18 |
| D-131 | Push band customer ko bhi email: jis khabar pe jawab chahiye aur jawab na aane pe order badalta hai (D-090); recall ki khabar har customer ko email se bhi; D-126 me jod (3 niyam).                                                                                                     | Business     | 2026-11-18 |
| D-132 | Ingredient master list R1 me badhti list (anjaana naam staff jode), public database ka import license jaanch ke baad; blocklist sirf senior catalog role badle, wajah ke saath (4 niyam).                                                                                               | Business     | 2026-11-18 |
| D-133 | Live site pe dekhna sab ke liye; sign-up, sign-in aur order sirf allowlist ke emails se (setting se, bina deploy); asli business pe allowlist band (6 niyam).                                                                                                                           | Business     | 2026-11-19 |
| D-134 | Kanooni area ke hisaab se system ki gehrai: L1 field, L2 workflow ki rok, L3 register aur report; har area ka level aur release ek table me.                                                                                                                                            | Business     | 2026-11-19 |
| D-135 | Review: ek customer, ek product, ek review; lauta item bhi, cancel aur RTO nahi; dobara kharid pe edit; window misaal 365 din (5 niyam).                                                                                                                                                | Business     | 2026-11-19 |
| D-136 | Review moderation mila-jula: star turant, text apne aap ki jaanch se, photo aur atke review staff ki queue me; Review Moderator role (7 niyam).                                                                                                                                         | Business     | 2026-11-19 |
| D-137 | Skin type, concern, hair type aur active % alag catalog fields, platform ki list se; concern me sirf cosmetic shabd; R1 me jod (5 niyam).                                                                                                                                               | Business     | 2026-11-19 |
| D-138 | R1 ke filters: category, brand, daam, shade family, free-from, skin type, concern, claims, rating, discount, country of origin, size; sort me rating aur discount bhi.                                                                                                                  | Business     | 2026-11-19 |
| D-139 | Search ka kram: relevance, phir rating, bikri aur stock; kisi seller (apna brand bhi) ka boost nahi; sponsored R2 ke baad, label aur seema ke saath (5 niyam).                                                                                                                          | Business     | 2026-11-19 |
| D-140 | Sellers aur staff ko sirf zaroori emails: account aur paisa apni line me, kaam rokne wali khabrein din ke ek saar me, baaki in-app aur push (5 niyam).                                                                                                                                  | Business     | 2026-11-19 |
| D-141 | Order ke alawa khabrein in-app aur push se, marketing sirf opt-in se; area khulne ka email sirf push band walon ko, "baaki" ki chhat ke andar (5 niyam).                                                                                                                                | Business     | 2026-11-19 |
| D-142 | Emails ki har line ki din ki chhat: misaal 60 OTP ke liye pakke, baaki lines 240 tak, "baaki" 120 tak; chhat paar to agle din; 80% pe chetavni (6 niyam).                                                                                                                               | Business     | 2026-11-19 |
| D-143 | Seller ki reports kaam ki, par customer ki pehchaan ke bina (sirf order number, shehar, pincode); seller customer se seedha sampark nahi (4 niyam).                                                                                                                                     | Business     | 2026-11-19 |
| D-144 | Data export seemit: seller ka CSV uski reports jitna, finance ke registers R2 se, staff ki list me personal data chhupa; har export audit me (4 niyam).                                                                                                                                 | Security     | 2026-11-19 |
| D-145 | Demo aur dummy ka nishaan har jagah jahan dhokha ho sake: site ki patti, PDF pe SPECIMEN, dummy numbers pe badge, demo reviews (7 niyam).                                                                                                                                               | Business     | 2026-11-19 |
| D-146 | Review chhupane ki tay list; negative raay, reaction, ilaaj ka daawa aur delivery ki shikayat kabhi wajah nahi; appeal doosra moderator tay kare (6 niyam).                                                                                                                             | Business     | 2026-11-19 |
| D-147 | Return ya daawa reject pe customer ki ek appeal (misaal 7 din me); faisla Support Lead role kare, jisne reject nahi kiya; R1 me jod.                                                                                                                                                    | Business     | 2026-11-19 |
| D-148 | "Parcel nahi mila" ka daawa: code se delivered pe 48 ghante, sirf photo aur location wali delivery pe 7 din (misaal), "delivered" scan se (D-072 me jod).                                                                                                                               | Business     | 2026-11-19 |
| D-149 | R1 me owner ko aankdon ka chhota set (orders, cancel, RTO, delivery, returns, refund, stock, waitlist, zero result); target aur alert R2 se.                                                                                                                                            | Business     | 2026-11-19 |
| D-150 | Legal pages tay faislon se asli jaisa draft, DUMMY badge aur version ke saath; bade badlav pe naya consent; number policy ki settings se (4 niyam).                                                                                                                                     | Business     | 2026-11-19 |
| D-151 | Data ke haq: R1 me profile sudhaar, marketing consent band aur account delete (records me pehchaan hata ke); data download aur request R2 se.                                                                                                                                           | Security     | 2026-11-19 |
| D-152 | Zero result pe sujhaav aur milte-julte products; synonyms staff setting se; zero result ki hafte ki report; product ki request R2 se (5 niyam).                                                                                                                                         | Business     | 2026-11-19 |
| D-153 | Stock khatam product "Out of stock" ke saath kram me neeche dikhe; "stock aane pe batao" in-app aur push se, R2 se (5 niyam).                                                                                                                                                           | Business     | 2026-11-19 |
| D-154 | Customer ko sirf sach aankde: "Bestseller" aur "kam stock" tay niyam se R1 me; "X ne kharida" nahi; countdown sirf asli offer pe (5 niyam).                                                                                                                                             | Business     | 2026-11-19 |
| D-155 | Review me photo R1 se: misaal 3 tak, har photo staff ki jaanch ke baad, chehre pe ijazat ka tick, video nahi; R1 me jod.                                                                                                                                                                | Business     | 2026-11-19 |
| D-156 | Nakli review pe seedhi karwai (customer aur seller); brand ka staff apne product pe review nahi likh sakta; niyam 1 aur 5 R1 me (5 niyam).                                                                                                                                              | Business     | 2026-11-19 |
| D-157 | Customer ke behaviour ka data: R1 me sirf server ke business events; bina pehchaan ka halka page data R2 se; bahar koi analytics service nahi.                                                                                                                                          | Business     | 2026-11-19 |
| D-158 | Muft mile product ya inaam wala review nahi: ₹0 line pe review ka haq nahi, review ke badle koi inaam nahi; niyam R1 se code me.                                                                                                                                                        | Business     | 2026-11-19 |
| D-159 | Allergen ki chetavni R1 me sabke liye ek jaisi (jaane-maane allergens); customer ki apni allergy ke hisaab se baad me (D-099 me jod).                                                                                                                                                   | Business     | 2026-11-19 |
| D-160 | Brand har review pe ek public jawab de sake, moderation ke saath; reviewer ka contact kabhi nahi; review hata nahi sakta; reviews dekhna R1, jawab R2 se (4 niyam).                                                                                                                     | Business     | 2026-11-19 |
| D-161 | Support tickets: customer, seller, delivery partner aur bina sign-in form; platform ki tay categories; baat-cheet in-app; R2 se (4 niyam).                                                                                                                                              | Business     | 2026-11-19 |
| D-162 | Ticket ka SLA category ke hisaab se (paisa aur skin reaction pehle), kaam ke ghanton me; jawab ke intezaar me timer ruke; R2 se (5 niyam).                                                                                                                                              | Business     | 2026-11-19 |
| D-163 | Shikayat ki seedhi: Support Agent, Support Lead, Grievance Officer; alag grievance form, timers aur register; page R1, raasta R2 (5 niyam).                                                                                                                                             | Business     | 2026-11-19 |
| D-164 | Seller ya delivery partner ka dispute alag kaam: tay din me saboot, naya senior faisla kare, rakam pe rok, record; R2 se (5 niyam).                                                                                                                                                     | Business     | 2026-11-19 |
| D-165 | Optional beauty profile, allergy wale ingredients samet, alag consent se; personal allergen chetavni; seller ko kabhi nahi; R2 se (5 niyam; D-159 me jod).                                                                                                                              | Business     | 2026-11-19 |
| D-166 | Sujhaav product data, sab ki kharid ke jod, staff ki routines aur (consent se) customer ki profile se; kisi seller ka boost nahi; R2 se (4 niyam).                                                                                                                                      | Business     | 2026-11-19 |
| D-167 | Review ke saath optional skin type, depth, undertone aur umar ka group, inse filter; skin ki bimari ka field nahi; R2 se.                                                                                                                                                               | Business     | 2026-11-19 |
| D-168 | Shade finder: depth, undertone aur pasand ke sawal + customer ka abhi ka shade; camera se skin tone nahi; R2 se.                                                                                                                                                                        | Business     | 2026-11-19 |
| D-169 | Virtual try-on browser me, device pe hi, sirf lip, blush aur eye products; koi photo server pe nahi; pehle consent; R2 se (6 niyam).                                                                                                                                                    | Business     | 2026-11-19 |
| D-170 | Product pe public Q&A: brand aur verified buyers jawab dein, moderation ke saath; ilaaj ke sawal pe Expert ki salah; R2 se.                                                                                                                                                             | Business     | 2026-11-19 |
| D-171 | Formula badle to purane reviews pe label aur rating do roop me (R2 se); R1 me har review pe us waqt ka listing version.                                                                                                                                                                 | Business     | 2026-11-19 |
| D-172 | Consultation muft, seema ke saath (misaal mahine me 2 booking, no-show pe rok, Advisor ke din me 5 sawal); R2 se.                                                                                                                                                                       | Business     | 2026-11-19 |
| D-173 | Loyalty points (misaal ₹100 pe 1 point, 1 point = ₹1), sirf platform pe kharch, cash ya transfer nahi; tiers baad me; R2 se.                                                                                                                                                            | Business     | 2026-11-19 |
| D-174 | Points ke niyam: diye paise pe, return window ke baad pakke, misaal 12 mahine me expire, order ka misaal 20% tak; review pe points nahi (6 niyam).                                                                                                                                      | Business     | 2026-11-19 |
| D-175 | Points ki chhoot ka paisa shuru me sirf platform ka; brand ke bonus points baad me.                                                                                                                                                                                                     | Business     | 2026-11-19 |
| D-176 | Referral rok ke saath: dono ko inaam pehle order ke return window ke baad, saal me seema, ek address, device ya payment pe nahi; R2 ke baad (3 niyam).                                                                                                                                  | Business     | 2026-11-19 |
| D-177 | Store credit nahi; goodwill sirf ek customer ke ek baar ke coupon se.                                                                                                                                                                                                                   | Business     | 2026-11-19 |
| D-178 | Dobara kharid: "dobara order" aur in-app ya push yaad R2 se, bina pehle ke payment; subscription baad me, kanooni aur payment jaanch ke baad.                                                                                                                                           | Business     | 2026-11-19 |
| D-179 | Gift cards ka design abhi, banana kanooni jaanch (R-004) ke baad; tay rakam, paane wale ke email pe, cash nahi.                                                                                                                                                                         | Business     | 2026-11-19 |
| D-180 | Customer app ka sign-in har istemaal pe 30 din aage, zyada se zyada 90 din; security badlav pe dobara pehchaan; "My devices" se session band.                                                                                                                                           | Security     | 2026-11-19 |
| D-181 | Staff apps ka session 12 ghante (30 minute bina kaam pe band); Seller 7 din aage, max 30 din; Creator 30 din aage, max 90 din.                                                                                                                                                          | Security     | 2026-11-19 |
| D-182 | Galat password ya code pe rok IP aur account mila ke (misaal 10 galat pe us IP ki 1 ghante rok, sab IPs ke 50 pe account 15 minute); reset chalta rahe.                                                                                                                                 | Security     | 2026-11-19 |
| D-183 | Delivery app: email aur password, Hub Manager ka manzoor ek phone, session usi phone pe misaal 14 din; Hub Manager session band kar sake.                                                                                                                                               | Security     | 2026-11-19 |
| D-184 | Seller app me authenticator jokhim ke hisaab se: Account Owner, Finance, aur daam, payout, bank, staff ya maal bhejne ke haq wale users.                                                                                                                                                | Security     | 2026-11-19 |
| D-185 | Bade kaamon ki tay list pe dobara authenticator code (misaal 5 minute ki khidki); authenticator band aur naye recovery codes pe har baar code.                                                                                                                                          | Security     | 2026-11-19 |
| D-186 | Har app ka apna sign-in aur apni cookies; central sign-in nahi.                                                                                                                                                                                                                         | Security     | 2026-11-19 |
| D-187 | Code wale emails ki seema: ek email ko ghante me 5 (ek IP se 3), sab mila ke ghante me 30, sign-up din me 20 (misaal); allowlist band karte waqt dobara.                                                                                                                                | Security     | 2026-11-19 |
| D-188 | Support Agent ki manzoori ki seema (misaal ₹2,000 ek maamla, ₹10,000 din); upar Support Lead; fail refund ka staff raasta Support Lead + Finance.                                                                                                                                       | Security     | 2026-11-19 |
| D-189 | Payout "paid" do haath se: Finance batch banaye, Master ka doosra account manzoor kare; ek account dono kaam nahi.                                                                                                                                                                      | Security     | 2026-11-19 |
| D-190 | Seller ka bank badle to dobara code, khabar, aur naye khaate pe misaal 72 ghante payout nahi; Account Owner rok sake; asli business pe staff jaanch bhi.                                                                                                                                | Security     | 2026-11-19 |
| D-191 | Delivery ki photo aur location misaal 180 din ya khule maamle band hone tak; sirf maamle ka Support, apne hub ka Hub Manager aur customer dekhe.                                                                                                                                        | Security     | 2026-11-19 |
| D-192 | Daawe ki photos maamla band hone ke misaal 180 din, video 90 din, pack ki photo delivered ke 90 din (daawa ho to uske saath); sirf us maamle ka staff dekhe.                                                                                                                            | Security     | 2026-11-19 |
| D-193 | Seller aur Beauty Pro ke dastavez: reject pe 30 din, manzoor seller ke account band hone ke misaal 3 saal tak; sirf jaanch wali team aur Trust & Safety dekhe.                                                                                                                          | Security     | 2026-11-19 |
| D-194 | Audit log misaal 2 saal, sign-in aur security events 1 saal, delete account ke bina pehchaan records kanooni samay tak.                                                                                                                                                                 | Security     | 2026-11-19 |
| D-195 | Push me sirf order number aur haalat; product, rakam, address aur delivery code push me kabhi nahi; poora address sirf invoice me.                                                                                                                                                      | Security     | 2026-11-19 |
| D-196 | Backup files ek key se encrypted (key password manager me); restore key maange; laptop pe aakhri 3 backups (misaal).                                                                                                                                                                    | Security     | 2026-11-19 |
| D-197 | Secrets shak ya incident pe turant, baaki saal me ek baar; token sign karne wali keys apne aap (misaal 30 din); staff ke jaane pe turant.                                                                                                                                               | Security     | 2026-11-19 |
| D-198 | Data leak pakka ho to asar wale users ko email aur in-app (misaal 72 ghante me), site pe patti; R1 me likha hua kram.                                                                                                                                                                   | Security     | 2026-11-19 |
| D-199 | Staff ka doosra factor R1 me authenticator app; passkey R2 me ek aur raasta; asli business pe Master aur Finance pe passkey owner tab tay kare.                                                                                                                                         | Security     | 2026-11-19 |
| D-200 | Authenticator kho jaaye: pehle recovery codes, phir Master se reset (code, audit, sessions band, email); Master ka reset recovery codes ya laptop ka break-glass command.                                                                                                               | Security     | 2026-11-19 |
| D-201 | Staff ki lists me customer ki jaankari chhupi; poori sirf maamla kholne pe wajah ke saath, audit me; partner ko sirf active parcel ki.                                                                                                                                                  | Security     | 2026-11-19 |
| D-202 | Support customer ki nazar se ya uske naam se kabhi nahi; support ki apni screens.                                                                                                                                                                                                       | Security     | 2026-11-19 |
| D-203 | `+` alias wale accounts alag, par per-customer seemaon ke liye address, payment aur device ka jod gina jaaye; R1 me D-109 wala jod.                                                                                                                                                     | Security     | 2026-11-19 |
| D-204 | Ek customer (D-203 ke jod ke saath) ke ek waqt me misaal 2 khule delivery-pe-UPI orders, kul rakam D-109 ki seema tak.                                                                                                                                                                  | Security     | 2026-11-19 |
| D-205 | Goodwill coupon ki seedhi: Support Agent misaal ₹200 tak (ek customer ko saal me 2), Support Lead ₹1,000 tak, upar Head of Operations; mahine ka kul budget; R2 se.                                                                                                                     | Security     | 2026-11-19 |
| D-206 | Bina sign-in forms pe CAPTCHA nahi: email pe code se pakka, chhupa honeypot field, IP aur email pe rate limit; asli business pe dobara; R2 se.                                                                                                                                          | Security     | 2026-11-19 |
| D-207 | Sehat ka data maamle ke hisaab se: notes sirf us maamle ka Skin & Hair Expert (Support Lead wajah ke saath), skin reaction case Support Lead + Expert, allergy profile sirf customer; R2 se.                                                                                            | Security     | 2026-11-19 |
| D-208 | Sehat ke data ka samay: notes aakhri consult ke misaal 2 saal, skin reaction case band hone ke 3 saal, allergy profile customer ke mitane ya account delete tak; R2 se.                                                                                                                 | Security     | 2026-11-19 |
| D-209 | Security report ke niyam, threats aur risks area ke hisaab se lagbhag 9 batches me; har batch faislon se mila ke ek sawal me, owner ki haan ke baad hi docs me (4 niyam).                                                                                                               | Process      | 2026-11-19 |
| D-210 | Security batch 1 (edge aur hosting) maana: niyam SR-002 se SR-010, 7 threats, risks R-015 aur R-016 `Maana`; numbers misaal, settings me.                                                                                                                                               | Security     | 2026-11-19 |
| D-211 | Security batch 2 (sign-in) maana: niyam SR-011 se SR-026, 15 threats, risks R-017 aur R-018 `Maana`; D-021 ka email code ke baad authenticator pakka.                                                                                                                                   | Security     | 2026-11-19 |
| D-212 | Security batch 3 (sessions aur tokens) maana: niyam SR-027 se SR-031, 6 threats, R-010 me sessions ka sach database me; numbers misaal, settings me.                                                                                                                                    | Security     | 2026-11-19 |
| D-213 | Security batch 4 (authorization aur sellers ki deewar) maana: niyam SR-032 se SR-039 aur 7 threats; naya risk nahi.                                                                                                                                                                     | Security     | 2026-11-19 |
| D-214 | Security batch 5 (catalog, checkout aur paisa) maana: niyam SR-040 se SR-053 aur 14 threats; naya risk nahi; numbers misaal, settings me.                                                                                                                                               | Security     | 2026-11-19 |
| D-215 | Security batch 6 (delivery, daawe aur reviews) maana: niyam SR-054 se SR-060, 9 threats, risk R-019 bachav ke saath `Khula`; numbers misaal, settings me.                                                                                                                               | Security     | 2026-11-19 |
| D-216 | Security batch 7 (files aur personal data) maana: niyam SR-061 se SR-067, 8 threats, risk R-020 `Maana`; numbers misaal, settings me.                                                                                                                                                   | Security     | 2026-11-19 |
| D-217 | Security batch 8 (data stores, services aur khabrein) maana: niyam SR-068 se SR-074, 9 threats, risks R-021 aur R-022 `Maana`.                                                                                                                                                          | Security     | 2026-11-19 |
| D-218 | Security batch 9 (export, audit, logs aur DevOps) maana: niyam SR-075 se SR-084, 10 threats; R-023 se R-025 `Maana`, R-026 aur R-027 `Khula`; numbers misaal, settings me.                                                                                                              | Security     | 2026-11-19 |
| D-219 | Security batch 10 maana: R2 ke niyam SR-085 se SR-087 aur R1 ka SR-088 (seller ko invoice ki copy ek-ek karke, bulk export me nahi); 5 threats. Security report ki saari batches poori.                                                                                                 | Security     | 2026-11-19 |
| D-220 | Kanooni jaanch ke nateeje: pehle tay faislon pe asar ke sawal, phir baaki nateeje COMPLIANCE me 4 area batches (CL-001 se); "jaanchi nahi" lines waisi hi, §0 me ek line.                                                                                                               | Process      | 2026-11-19 |
| D-221 | Return ki muddatein invoice, order page aur policy page pe likhi; kharab, nakli aur galat item ya shade pe 30 din (misaal); 48 ghante sirf saboot ka niyam; D-080 badla.                                                                                                                | Business     | 2026-11-19 |
| D-222 | "Der se pahuncha" return ki wajah: door pe mana to poora refund, baad me 7 din (misaal) bina kharche; force majeure ka staff flag; kharcha platform ka; D-117 badla.                                                                                                                    | Business     | 2026-11-19 |
| D-223 | "Pichhle 30 din ka sabse kam daam" R1 se har discount (kata MRP ya "% off") ke saath; D-120 badla.                                                                                                                                                                                      | Business     | 2026-11-19 |
| D-224 | Test ya asar wale claims (dermatologically tested, clinically proven, non-comedogenic, hypoallergenic, SPF, PA) R1 se saboot ke saath hi; D-100 badla.                                                                                                                                  | Business     | 2026-11-19 |
| D-225 | Account delete pe jaari invoice aur credit note ki asli copy alag tax archive me 72 mahine (misaal), sirf finance dekhe; baaki jagah pehchaan hatti hai; D-151 badla.                                                                                                                   | Security     | 2026-11-19 |
| D-226 | Invoice pe customer ka naam aur pata rakam se: ₹50,000 se kam pe state (aur shehar ya pincode), ₹50,000 ya zyada pe naam aur pata, seller ki copy me bhi; D-143 me jod.                                                                                                                 | Business     | 2026-11-19 |
| D-227 | Seller ke tax wale dastavez (GSTIN certificate, TCS statements, invoices) 72 mahine (misaal), baaki KYC 3 saal; D-193 badla.                                                                                                                                                            | Security     | 2026-11-19 |
| D-228 | Brand ke kit pe kit ki cheezon ka sabse zyada GST rate default; combo (R2) ka tax CA ki salah ke baad; D-088 badla.                                                                                                                                                                     | Business     | 2026-11-19 |
| D-229 | Bina shart ka sample tax invoice ke bahar ("free sample, not for sale"); kharid ki shart wala gift R2 me bhi CA ki salah tak nahi; D-121 badla.                                                                                                                                         | Business     | 2026-11-19 |
| D-230 | Platform ka barcode label sirf pack ki khaali jagah ya bahar ke polybag pe, kabhi likhawat pe nahi; receiving pe photo.                                                                                                                                                                 | Business     | 2026-11-19 |
| D-231 | Tax ghatne pe batch pe "revised MRP" saboot ke saath; site ka MRP, daam ki seema, "% off" aur invoice usi se.                                                                                                                                                                           | Business     | 2026-11-19 |
| D-232 | Batch pe expiry ka roop ("Use before" ya "Expiry"); system ka aakhri din usi se, seemaayein usi se.                                                                                                                                                                                     | Business     | 2026-11-19 |
| D-233 | Apne brand aur uski dummy company ka naam platform ke naam se alag.                                                                                                                                                                                                                     | Business     | 2026-11-19 |
| D-234 | Chhote pack ya soap pe batch na ho to platform ka batch id; daawe aur pickup me pack ki photo.                                                                                                                                                                                          | Business     | 2026-11-19 |
| D-235 | Chhote pack ke label pe ingredients na hon to carton ki photo ya brand ki specification se milaan.                                                                                                                                                                                      | Business     | 2026-11-19 |
| D-236 | 10 g ya 10 ml tak ke packs tabhi list hon jab pack pe MRP chhapa ho.                                                                                                                                                                                                                    | Business     | 2026-11-19 |
| D-237 | Grievance Officer aur nodal person apne staff ke roles; unki jaankari dummy nahi; D-145 niyam 4 badla.                                                                                                                                                                                  | Business     | 2026-11-19 |
| D-238 | Product page pe seller ka block (naam, pata, customer care, seller ka grievance officer), iske bina seller live nahi; seller pe shikayat bhi platform ki seedhi me; receipt me shikayat ka text.                                                                                        | Business     | 2026-11-19 |
| D-239 | Tax ke chhote sudhaar: HSN + description ki row, invoice pack ya dispatch pe, delivery fee aur TDS ka pal CA se, doosre state ke GSTIN pe chetavni, e-invoice aur TCS registration ke fields.                                                                                           | Business     | 2026-11-19 |
| D-240 | Listing aur pages ke chhote sudhaar: country of origin ka sort, blocklist me "cosmetic me mana", seller ka undertaking, Payments aur "Kram kaise" pages, recall emails pehle, dark patterns ka saal ka audit.                                                                           | Business     | 2026-11-19 |
| D-241 | Jahan kaam apna role karta hai, wahan dummy naam nahi: staff role banta hai aur jaankari usi account se; dummy sirf registrations aur bahar ki companies ke liye.                                                                                                                       | Business     | 2026-11-19 |
| D-242 | Naam: storefront "Beautinique", platform company "Beautinique Pvt Ltd", apne brand ki seller company "Beautinique Brands Pvt Ltd", brand "Beautinique" (dummy companies); D-233 badla.                                                                                                  | Business     | 2026-11-19 |
| D-243 | Apna brand "Unibelle", seller company "Unibelle Cosmetics Pvt Ltd" (dummy); platform "Beautinique" hi; naam platform se alag, to D-233 phir laagu; D-242 badla.                                                                                                                         | Business     | 2026-11-19 |
| D-244 | COMPLIANCE batch 1 maana: tax (GST, TCS, TDS) ki 24 rows, CL-001 se CL-024, source aur tareekh ke saath.                                                                                                                                                                                | Business     | 2026-11-19 |
| D-245 | COMPLIANCE batch 2 maana: Legal Metrology ki 14 rows, CL-025 se CL-038, source aur tareekh ke saath.                                                                                                                                                                                    | Business     | 2026-11-19 |
| D-246 | COMPLIANCE batch 3 maana: cosmetics kanoon ki 20 rows, CL-039 se CL-058, source aur tareekh ke saath.                                                                                                                                                                                   | Business     | 2026-11-19 |
| D-247 | COMPLIANCE batch 4 maana: e-commerce aur consumer kanoon ki 29 rows, CL-059 se CL-087; kanooni jaanch ka pehla run docs me poora.                                                                                                                                                       | Business     | 2026-11-19 |
| D-248 | Data leak pe teen ghadiyaan: CERT-In ko 6 ghante, Board ko bina der aur 72 ghante me poori report, users ko pakka hote hi bina der; D-198 badla.                                                                                                                                        | Security     | 2026-11-20 |
| D-249 | Gift card sirf RBI-authorised PPI issuer ke zariye, checkout pe payment ka tareeka; validity kam se kam 1 saal, expiry dikhe; R2 ke baad; D-179 badla.                                                                                                                                  | Business     | 2026-11-20 |
| D-250 | Kanooni rok: delete ya samay pe data app se turant hate, band encrypted store me 180 din ya 1 saal, phir erase; photos aur video ka sirf record; logs apne store me 180 din, 2027 se 1 saal.                                                                                            | Security     | 2026-11-20 |
| D-251 | Content ki shikayat ke naye samay: receipt 24 ghante, nagnata wali report pe turant chhupna aur 2 ghante, baaki 36 ghante, hal 7 din, sarkari order 3 ghante; D-136, D-163 badla.                                                                                                       | Business     | 2026-11-20 |
| D-252 | Skin & Hair Expert ki seva beauty aur skincare salah, medical consultation nahi: nidaan ya dawa nahi, "medical consultation nahi" ki line, ilaaj pe "doctor se milein".                                                                                                                 | Business     | 2026-11-20 |
| D-253 | Personal data ke sawalon ka sampark Grievance Officer; CERT-In ka Point of Contact naya "Security Contact" role, owner ke paas.                                                                                                                                                         | Security     | 2026-11-20 |
| D-254 | Delivery partners: Social Security Code ke aggregator kaam, payouts pe TDS, partner ka data notice aur location sirf delivery ke pal pe.                                                                                                                                                | Business     | 2026-11-20 |
| D-255 | Personal data ke 8 chhote sudhaar: alag Data notice, Privacy aur Terms ke hisse, nomination aur data kin ke saath, kai accounts ka maqsad, 18+ ka record, Aadhaar ki copy nahi, processors ki list.                                                                                     | Security     | 2026-11-20 |
| D-256 | Seller, warehouse aur payment ke 7 chhote sudhaar: seller ka EPR number, DMR ke mana shabd, payment data ki jagah, sellers ka paisa liability, "paisa kata, order nahi bana", nasht karna, D-134 ki nayi rows.                                                                          | Business     | 2026-11-20 |
| D-257 | Do naye AI agents, Lawyer aur CA, COMPLIANCE ki batches ke baad aur Architect se pehle (pehle Lawyer, phir CA); agents ka poora kram 12 kadam; hobby project, koi licensed lawyer ya CA nahi: yahi AI agents project ke lawyer aur CA, unki raay hi lawyer aur CA ki raay; R-004 Maana. | Process      | 2026-11-20 |
| D-258 | COMPLIANCE batch 5 maana: personal data ki 17 rows, CL-088 se CL-104.                                                                                                                                                                                                                   | Business     | 2026-11-20 |
| D-259 | COMPLIANCE batch 6 maana: IT Rules, CERT-In aur payments ki 7 rows, CL-105 se CL-111.                                                                                                                                                                                                   | Business     | 2026-11-20 |
| D-260 | COMPLIANCE batch 7 maana: gig partners, warehouse aur environment ki 9 rows, CL-112 se CL-120.                                                                                                                                                                                          | Business     | 2026-11-20 |
| D-261 | COMPLIANCE batch 8 maana: sehat, AYUSH, IP aur contracts ki 8 rows, CL-121 se CL-128, aur "Nazar" ka hissa; kanooni jaanch ke dono run docs me poore.                                                                                                                                   | Business     | 2026-11-20 |
| D-262 | Delivery aur daawon ki photos aur video lagbhag 13 May 2027 se kanooni rok me: capture se 1 saal band encrypted store me, app se apne samay pe hi hatein; D-250 niyam 4 badla.                                                                                                          | Security     | 2026-11-20 |
| D-263 | Drugs and Magic Remedies Act ki Schedule wale ilaaj ke daawe wale reviews chhupte hain ("kanoon ke khilaaf daawa"); baaki ilaaj jaise anubhav note ke saath; D-146 niyam 4 badla.                                                                                                       | Business     | 2026-11-20 |
| D-264 | Legal pages ka badge hamesha "DUMMY: kisi licensed lawyer ne nahi dekha"; AI Lawyer ka nishaan sirf docs me; D-150 niyam 2 badla.                                                                                                                                                       | Business     | 2026-11-20 |
| D-265 | Skin & Hair Expert aur Beauty Advisor ke liye beauty ya cosmetology ka certificate zaroori, staff jaanche, profile pe dikhe (dummy).                                                                                                                                                    | Business     | 2026-11-20 |
| D-266 | Delivery partner offer bina saza chhod sake, availability khud chune, koi fixed shift nahi, doosre platforms pe kaam ki rok nahi.                                                                                                                                                       | Business     | 2026-11-20 |
| D-267 | Delivery ke istemaal ka insurance abhi partner ki zimmedari (licence, RC, insurance ka saboot aur expiry, dummy); asli business pe platform ka group accident cover bhi.                                                                                                                | Business     | 2026-11-20 |
| D-268 | Jhagde ka aakhri raasta: sellers ke liye pehle mediation, phir ek arbitrator ka arbitration; partners ke liye court (shahar dummy).                                                                                                                                                     | Business     | 2026-11-20 |
| D-269 | Sellers ka paisa alag "seller settlement" khaate me, payout usi se; design me abhi se (test mode me dummy).                                                                                                                                                                             | Business     | 2026-11-20 |
| D-270 | Seller agreement me platform ki zimmedari ki chhat: pichhle 12 mahine me us seller se mili fees; D-063 ki bharpai, dhokha aur kanooni zimmedari bahar.                                                                                                                                  | Business     | 2026-11-20 |
| D-271 | Lawyer (AI) ki report ke 8 chhote sudhaar: related brand ka label, appliances ka E-waste EPR, Unibelle sirf apne seller account se, sellers ki list, collection agent, returns me storage check, gift card ki yaad, FDI ki nazar.                                                       | Business     | 2026-11-20 |
| D-272 | COMPLIANCE ki 18 rows pe Lawyer (AI) ka nishaan: 4 jaancha, 11 aadha jaancha, 3 hisse nahi; har row me raay ki ek line.                                                                                                                                                                 | Process      | 2026-11-20 |
| D-273 | Lawyer (AI) ka documents ka dhaancha COMPLIANCE ke naye §14 me: har document ke clauses ki table, ek batch me owner ki haan se.                                                                                                                                                         | Process      | 2026-11-20 |
| D-274 | COMPLIANCE batch 9 maana: 6 documents ka dhaancha (108 clauses) §14 me, D-262 se D-272 ke saath; Lawyer (AI) ki report docs me poori.                                                                                                                                                   | Business     | 2026-11-20 |
| D-275 | Fulfilment fee fees invoice pe do lines me: handling 18%, delivery 5% bina ITC; jod wahi.                                                                                                                                                                                               | Business     | 2026-11-20 |
| D-276 | D-063 ki bharpai GST ke bina wali value pe, fees ghata ke; seller ke statement me ek net line, fees ka alag invoice nahi.                                                                                                                                                               | Business     | 2026-11-20 |
| D-277 | Return pe fees wajah ke hisaab se: hamari galti aur der se delivery pe dono wapas, brand ki galti pe koi nahi, man badla to sirf commission.                                                                                                                                            | Business     | 2026-11-20 |
| D-278 | Combo aur shart wala gift: har cheez apne daam aur rate pe, chhoot anupaat me, agar har cheez alag se bhi bikti ho; warna mixed supply.                                                                                                                                                 | Business     | 2026-11-20 |
| D-279 | GSTIN wale orders pe platform ke offers aur points nahi; sirf brand ke offers.                                                                                                                                                                                                          | Business     | 2026-11-20 |
| D-280 | CA (AI) ke 9 jod tay faislon me: delivery fee, sellers aur partners ka TDS, replacement, records ka samay, books ka backup, chargeback, settlement khaata, doosre state ka stock.                                                                                                       | Business     | 2026-11-20 |
| D-281 | COMPLIANCE pe CA (AI) ke nishaan (8 jaancha, 22 aadha, 2 nahi), 20 rows me badlav, nayi rows CL-129 se CL-136, Nazar aur documents ke tax hisse.                                                                                                                                        | Business     | 2026-11-20 |
| D-282 | CA (AI) ke finance ke accounting niyam (ledger, documents, numbering, rounding, statements, milaan) ARCHITECTURE §1 me.                                                                                                                                                                 | Architecture | 2026-11-20 |
| D-283 | Design ka scale target madhyam: 1 lakh customers, 1,000 orders/din (sale ke din 5 guna), 500 sellers, 50,000 variants, 100 staff, 50 delivery partners; sirf code aur tests ke liye.                                                                                                    | Architecture | 2026-11-20 |
| D-284 | Photos, dastavez aur video managed media service pe (misaal Cloudinary free), shart ke saath (private URL, EXIF, rok); shart fail ho to public images wahan aur private files object storage pe.                                                                                        | Architecture | 2026-11-20 |
| D-285 | 180 din ke request logs alag chhoti logs service me, apne Atlas cluster me gzip chunks.                                                                                                                                                                                                 | Architecture | 2026-11-20 |
| D-286 | Errors ka apna chhota intezaam: logs me fingerprint, apps ki errors rate-limited route pe, Master ke ops inbox me khabar aur roz ka saar; bahar ki error service nahi.                                                                                                                  | Architecture | 2026-11-20 |
| D-287 | Emails Brevo ke free plan se, HTTPS API pe.                                                                                                                                                                                                                                             | Architecture | 2026-11-20 |
| D-288 | Payment, return aur refund ke events finance me har 15 minute ke batch se (sirf jab pending); pack pe invoice turant.                                                                                                                                                                   | Architecture | 2026-11-20 |
| D-289 | Invoice ke email me sirf saar (number, tareekh, seller aur GSTIN, rakam) aur app me download ki baat; PDF aur link nahi.                                                                                                                                                                | Architecture | 2026-11-20 |
| D-290 | R1 me saare apps SPA; server-side rendering nahi, asli business ke waqt dobara.                                                                                                                                                                                                         | Architecture | 2026-11-20 |
| D-291 | ARCHITECTURE batch 1: gateway aur 11 data wali services, har data ka ek maalik, copy sirf events se, turant jawab wale kaam sirf tay sync list se (ARCHITECTURE §2).                                                                                                                    | Architecture | 2026-11-20 |
| D-292 | ARCHITECTURE batch 2: outbox se seedhi delivery, inbox se dedupe, aggregate ka kram, retry aur dead letter, envelope, outbox se audit (ARCHITECTURE §3).                                                                                                                                | Architecture | 2026-11-20 |
| D-293 | ARCHITECTURE batch 3: samay wale kaam DB me, ticker aur lease, BullMQ sirf kaam chalane ko, finance ka batch, turant wale kaam job nahi, R1 ki jobs (ARCHITECTURE §4).                                                                                                                  | Architecture | 2026-11-20 |
| D-294 | ARCHITECTURE batch 4: REST aur ek contract, versioning, app ka version, Delivery sync, polling, error ka roop, idempotency, retries, `/wake` (ARCHITECTURE §5).                                                                                                                         | Architecture | 2026-11-20 |
| D-295 | ARCHITECTURE batch 5: Atlas Search catalog ke cluster pe, kram aur synonyms, CDN pe sirf public cache, personal jawab cache nahi, Redis me data nahi (ARCHITECTURE §6).                                                                                                                 | Architecture | 2026-11-20 |
| D-296 | ARCHITECTURE batch 6: upload seedha provider pe, media me har file ka record, private file ka chhota URL, retention, PDF aur export (ARCHITECTURE §7).                                                                                                                                  | Architecture | 2026-11-20 |
| D-297 | ARCHITECTURE batch 7: structured logs, 180 din ke logs, audit ke compressed chunks, ops snapshot, health aur ready, alerts (ARCHITECTURE §8).                                                                                                                                           | Architecture | 2026-11-20 |
| D-298 | ARCHITECTURE batch 8: ₹0 ki seema, ek order ka data, memory budget, performance targets, memory ke pehre aur R1 se pehle 512 MB pe naap (ARCHITECTURE §9).                                                                                                                              | Architecture | 2026-11-20 |
| D-299 | Architect ke 8 naye risks R-028 se R-035 (R-030 Maana, baaki bachav ke saath khula); R-002, R-007, R-010, R-014, R-024 me jod.                                                                                                                                                          | Architecture | 2026-11-20 |
| D-300 | Area band karne ka kram: pehle checkout pe rok ka event, phir band; parcel banate waqt logistics band area ka order roke, cancel aur refund.                                                                                                                                            | Architecture | 2026-11-20 |
| D-301 | Code wali delivery sirf online; offline me list, scans aur photo line me; network na ho to partner intezaar kare ya Hub Manager se baat kare.                                                                                                                                           | Business     | 2026-11-20 |
| D-302 | Order confirmation ka email paise ki line me (D-126 niyam 4).                                                                                                                                                                                                                           | Business     | 2026-11-20 |
| D-303 | Media provider ki files ka backup nahi; product images seller se dobara; OPERATIONS me ek line.                                                                                                                                                                                         | Architecture | 2026-11-20 |
| D-304 | Har app parivaar (customer, seller, partner, Creator, staff) ka alag account; email wahi ho sakta hai, unique (email, parivaar).                                                                                                                                                        | Architecture | 2026-11-21 |
| D-305 | Account delete pe review ke star aur text rahein, naam "Deleted customer", "Verified purchase" rahe; photos hatein.                                                                                                                                                                     | Business     | 2026-11-21 |
| D-306 | Band order ki poori detail misaal 13 mahine live, phir mahine ka compressed archive; list me saar, invoice hamesha finance se.                                                                                                                                                          | Architecture | 2026-11-21 |
| D-307 | Jin cheezon ka samay tay nahi tha unke rakhne ke samay (inbox, emails ka record, cart, wishlist, waitlist, sessions, daam ka itihaas, zero result, fraud signals, aankde), settings me.                                                                                                 | Architecture | 2026-11-21 |
| D-308 | Order number 10 ank ka random jaisa, aakhri ank check digit (jaise `4827-1930-56`).                                                                                                                                                                                                     | Business     | 2026-11-21 |
| D-309 | Finance ke band FY ka data encrypted, hash se band export file me private storage pe; Neon me closing balances, documents ki list aur hash.                                                                                                                                             | Architecture | 2026-11-21 |
| D-310 | Data batch 1: ids, numbers, integer paise, UTC aur `istDay`, seller code 3 characters (ARCHITECTURE §10.1).                                                                                                                                                                             | Architecture | 2026-11-21 |
| D-311 | Data batch 2: transaction helper, versions, conditional updates, unique indexes, copies ka `srcVersion`, platform collections (ARCHITECTURE §10.2).                                                                                                                                     | Architecture | 2026-11-21 |
| D-312 | Data batch 3: retention classes, erase aur rok ki copy, field encryption, codes ka hash, delivery code encrypted, tax archive, delete pe har service (ARCHITECTURE §10.3).                                                                                                              | Architecture | 2026-11-21 |
| D-313 | Data batch 4: release step, expand aur contract, migrations, validators, cursor lists, seeds aur backup ka roop (ARCHITECTURE §10.4).                                                                                                                                                   | Architecture | 2026-11-21 |
| D-314 | Data batch 5: order ka dhaancha, batch ke level pe stock, place order ek transaction, FEFO, pack ke teen kadam, recall ki list (ARCHITECTURE §10.5).                                                                                                                                    | Architecture | 2026-11-21 |
| D-315 | Data batch 6: finance ka PostgreSQL: schemas, journal ka barabar hona, sirf insert, bina gap number, tax archive, Neon ko na jagaana (ARCHITECTURE §10.6).                                                                                                                              | Architecture | 2026-11-21 |
| D-316 | Data batch 7: identity, notify, payments, catalog, logistics aur support ke data niyam (ARCHITECTURE §10.7).                                                                                                                                                                            | Architecture | 2026-11-21 |
| D-317 | Data batch 8: audit ke chunks aur sirf insert user, media aur logs, band records ka archive, jagah ka naap (ARCHITECTURE §10.8).                                                                                                                                                        | Architecture | 2026-11-21 |
| D-318 | Database Architect ke 7 naye risks R-036 se R-042, sab bachav ke saath khula.                                                                                                                                                                                                           | Architecture | 2026-11-21 |
| D-319 | Data ke 5 sudhaar: logistics → commerce address resolver, finance ko delivered ka event, `commerce.parcel.packVoided`, SR-063 me delivery code ka apvaad, §9 me Neon ki jagah.                                                                                                          | Architecture | 2026-11-21 |
| D-320 | Account delete ke baad bhi seller ₹50,000 se upar ke invoice ki copy finance ke tax archive se ek-ek karke le sake, har download audit me.                                                                                                                                              | Business     | 2026-11-21 |
| D-321 | Kanooni rok (D-250) me retention class `tech` ke chhote technical records nahi aate.                                                                                                                                                                                                    | Security     | 2026-11-21 |
| D-322 | Pinger live server ko ghante me ek baar, 09:00 se 22:00 IST jagaaye; raat ko server soya, raat ke samay wale kaam subah.                                                                                                                                                                | Architecture | 2026-11-21 |
| D-323 | Databases ka backup har release se pehle aur hafte me ek baar; aakhri backup 8 din se purana ho to hafte ki jaanch me laal nishaan.                                                                                                                                                     | Architecture | 2026-11-21 |
| D-324 | Ops inbox din ke tay samay pe; gambhirta 1 ka browser push raat me bhi, gambhirta 2 aur 3 subah.                                                                                                                                                                                        | Security     | 2026-11-21 |
| D-325 | Abhi koi package npm pe publish nahi: har package `private: true`, CI me pehra; R1 ke baad owner dobara dekhe.                                                                                                                                                                          | Process      | 2026-11-21 |
| D-326 | OPERATIONS batch 1 (environments aur laptop ka setup) maana: 10 niyam [OPERATIONS.md](OPERATIONS.md) §1 me.                                                                                                                                                                             | Architecture | 2026-11-21 |
| D-327 | OPERATIONS batch 2 (CI aur branch ke pehre) maana: 12 niyam [OPERATIONS.md](OPERATIONS.md) §2 me.                                                                                                                                                                                       | Process      | 2026-11-21 |
| D-328 | OPERATIONS batch 3 (release, deploy, migrations aur rollback) maana: 12 niyam [OPERATIONS.md](OPERATIONS.md) §3 me.                                                                                                                                                                     | Process      | 2026-11-21 |
| D-329 | OPERATIONS batch 4 (secrets aur config) maana: 10 niyam [OPERATIONS.md](OPERATIONS.md) §4 me.                                                                                                                                                                                           | Security     | 2026-11-21 |
| D-330 | OPERATIONS batch 5 (soya server, jagana aur samay wale kaam) maana: 12 niyam [OPERATIONS.md](OPERATIONS.md) §5 me.                                                                                                                                                                      | Architecture | 2026-11-21 |
| D-331 | OPERATIONS batch 6 (backup aur restore) maana: 12 niyam [OPERATIONS.md](OPERATIONS.md) §6 me.                                                                                                                                                                                           | Architecture | 2026-11-21 |
| D-332 | OPERATIONS batch 7 (monitoring, health aur alerts) maana: 9 niyam [OPERATIONS.md](OPERATIONS.md) §7 me.                                                                                                                                                                                 | Architecture | 2026-11-21 |
| D-333 | OPERATIONS batch 8 (incident ke runbooks) maana: 12 niyam [OPERATIONS.md](OPERATIONS.md) §8 me.                                                                                                                                                                                         | Security     | 2026-11-21 |
| D-334 | OPERATIONS batch 9 (capacity aur free tier ki nigrani) maana: 7 niyam [OPERATIONS.md](OPERATIONS.md) §9 me.                                                                                                                                                                             | Architecture | 2026-11-21 |
| D-335 | OPERATIONS batch 10 (512 MB pe memory ka naap) maana: 7 niyam [OPERATIONS.md](OPERATIONS.md) §10 me.                                                                                                                                                                                    | Architecture | 2026-11-21 |
| D-336 | OPERATIONS batch 11 (dependencies aur packages ka publish) maana: 8 niyam [OPERATIONS.md](OPERATIONS.md) §11 me.                                                                                                                                                                        | Security     | 2026-11-21 |
| D-337 | DevOps / SRE ke 12 naye risks R-043 se R-054, sab bachav ke saath khula.                                                                                                                                                                                                                | Architecture | 2026-11-21 |
| D-338 | Operations ke 6 sudhaar: release step ka samay, UptimeRobot ka samay, CI ka secret scan asli pehra, seekh fix ke baad, default branch se pehle schedule, 10 Atlas projects.                                                                                                             | Architecture | 2026-11-21 |
| D-339 | Stack me jod: frontend me state management ke liye Zustand; backend ka logger pino, saath me pino-pretty.                                                                                                                                                                               | Architecture | 2026-11-21 |
| D-340 | Brand ke rang: garam rose, gehra plum, champagne gold accent aur garam neutrals; hover aur pressed roop hamesha gehre.                                                                                                                                                                  | Architecture | 2026-11-21 |
| D-341 | Fonts: Plus Jakarta Sans (body aur UI) aur Fraunces (Customer app ki headings), self-hosted; daam me `tabular-nums`; staff apps me sirf sans.                                                                                                                                           | Architecture | 2026-11-21 |
| D-342 | R1 se saare apps me light aur dark theme; default system ki setting, har app me toggle; print, PDF aur labels hamesha light.                                                                                                                                                            | Architecture | 2026-11-21 |
| D-343 | Customer app ki neeche ki bar: Home, Categories, Orders, Cart, Account; search aur wishlist header me; Orders me delivery code sabse upar.                                                                                                                                              | Business     | 2026-11-21 |
| D-344 | Search ke sujhaav categories, brands aur concerns ki public list se browser me hi; products ka search Enter pe.                                                                                                                                                                         | Architecture | 2026-11-21 |
| D-345 | Checkout do screens me: "Checkout" pe poora order aur "Place order", phir online payment ke liye alag "Payment" screen.                                                                                                                                                                 | Business     | 2026-11-21 |
| D-346 | Browser push ki ijazat pehle order ke baad apne card se; "Not now" ke baad misaal 30 din card nahi; Account me hamesha.                                                                                                                                                                 | Business     | 2026-11-21 |
| D-347 | Address do raaston se (owner): form, aur Ola Maps ka search jo form aur lat/lng apne aap bhare; map pe pin aur "Use my current location" bhi; free seema kaafi maani.                                                                                                                   | Business     | 2026-11-21 |
| D-348 | R1 ka Customer Home sirf data se bane hisson se (pincode card, categories, Bestseller, naye, top rated); koi banner nahi.                                                                                                                                                               | Business     | 2026-11-21 |
| D-349 | Server jaagne ka parda sirf jaagne tak, tab tak app band; jaagne ke baad app use hote tak har misaal 10 minute background ping, bina loading (owner).                                                                                                                                   | Architecture | 2026-11-21 |
| D-350 | Icons icones.js.org se copy karke apna package (owner); mukhya set Solar, phir Lucide, phir baaki; ek saajha Credits page, har package ka credit component; copy ki script aur test.                                                                                                    | Architecture | 2026-11-21 |
| D-351 | Location na mile to bhi photo wali delivery "No location" nishaan ke saath, partner pe mahine ki seema (misaal 3); seema ke baad band.                                                                                                                                                  | Business     | 2026-11-21 |
| D-352 | DESIGN batch 1 (design ke siddhaant) maana: [DESIGN.md](DESIGN.md) §1.                                                                                                                                                                                                                  | Architecture | 2026-11-21 |
| D-353 | DESIGN batch 2 (rang ke tokens aur light theme) maana: [DESIGN.md](DESIGN.md) §2.                                                                                                                                                                                                       | Architecture | 2026-11-21 |
| D-354 | DESIGN batch 3 (dark theme aur high contrast) maana: [DESIGN.md](DESIGN.md) §3.                                                                                                                                                                                                         | Architecture | 2026-11-21 |
| D-355 | DESIGN batch 4 (typography, spacing, radius, shadow, layers aur motion) maana: [DESIGN.md](DESIGN.md) §4.                                                                                                                                                                               | Architecture | 2026-11-21 |
| D-356 | DESIGN batch 5 (breakpoints, layout aur app parivaar) maana: [DESIGN.md](DESIGN.md) §5.                                                                                                                                                                                                 | Architecture | 2026-11-21 |
| D-357 | DESIGN batch 6 (components aur screen ki halatein) maana: [DESIGN.md](DESIGN.md) §6.                                                                                                                                                                                                    | Architecture | 2026-11-21 |
| D-358 | DESIGN batch 7 (icons, logo, images aur media) maana: [DESIGN.md](DESIGN.md) §7.                                                                                                                                                                                                        | Architecture | 2026-11-21 |
| D-359 | DESIGN batch 8 (accessibility (WCAG 2.2 AA)) maana: [DESIGN.md](DESIGN.md) §8.                                                                                                                                                                                                          | Architecture | 2026-11-21 |
| D-360 | DESIGN batch 9 (kanooni aur bharose ki jaankari UI me kahan) maana: [DESIGN.md](DESIGN.md) §9.                                                                                                                                                                                          | Architecture | 2026-11-21 |
| D-361 | DESIGN batch 10 (security aur performance ke UI niyam) maana: [DESIGN.md](DESIGN.md) §10.                                                                                                                                                                                               | Architecture | 2026-11-21 |
| D-362 | FLOWS batch 1 (account aur sign-in) maana: [FLOWS.md](FLOWS.md) §1.                                                                                                                                                                                                                     | Architecture | 2026-11-21 |
| D-363 | FLOWS batch 2 (browse se order aur payment) maana: [FLOWS.md](FLOWS.md) §2.                                                                                                                                                                                                             | Architecture | 2026-11-21 |
| D-364 | FLOWS batch 3 (order se delivery) maana: [FLOWS.md](FLOWS.md) §3.                                                                                                                                                                                                                       | Architecture | 2026-11-21 |
| D-365 | FLOWS batch 4 (cancel, return, daawa aur refund) maana: [FLOWS.md](FLOWS.md) §4.                                                                                                                                                                                                        | Architecture | 2026-11-21 |
| D-366 | FLOWS batch 5 (seller: onboarding, listing, maal aur payout) maana: [FLOWS.md](FLOWS.md) §5.                                                                                                                                                                                            | Architecture | 2026-11-21 |
| D-367 | FLOWS batch 6 (reviews) maana: [FLOWS.md](FLOWS.md) §6.                                                                                                                                                                                                                                 | Architecture | 2026-11-21 |
| D-368 | UX ke 9 naye risks (R-055 se R-063) bachav ke saath khule: jaagne ka parda, rose ka contrast, visual tests ka bojh, polling, lamba product page, idle logout, offline data, iPhone push, warehouse ka network.                                                                          | Architecture | 2026-11-21 |
| D-369 | Seller ka payable man badle wali return muddat (misaal 7 din) ke baad; kharab maal ki lambi muddat me baad ki return D-071 ke udhaar se.                                                                                                                                                | Business     | 2026-11-21 |
| D-370 | UX ke chhote sudhaar: D-072 me jod (location na mile to D-351; R1 me sirf refund, D-122) aur SR-055 me jod (pin D-347 se, "No pin").                                                                                                                                                    | Architecture | 2026-11-21 |
| D-371 | Coverage ka gate: kernel packages aur paisa, stock aur permissions ke code me seema se neeche PR rukta hai; baaki areas me sirf report aur release se pehle jaanch.                                                                                                                     | Process      | 2026-11-21 |
| D-372 | Mutation testing: CI me PR pe alag job sirf badli lines pe (kernel aur paisa, stock, permissions); bina wajah ka bacha mutant PR roke; kernel ka pehla poora run laptop pe copy me.                                                                                                     | Process      | 2026-11-21 |
| D-373 | Flaky tests: sirf E2E pe ek retry, pass pe bhi "flaky" aur issue; paisa, stock, permissions, idempotency aur events ke tests pe kabhi retry nahi.                                                                                                                                       | Process      | 2026-11-21 |
| D-374 | Nightly me WebKit pe Customer app ke 6 mukhya flows; PR pe E2E Chromium pe hi.                                                                                                                                                                                                          | Process      | 2026-11-21 |
| D-375 | Asli phone: har release se pehle Android pe Delivery app ka ek din aur Customer checkout; R1 se pehle ek baar iPhone pe checkout, install aur push.                                                                                                                                     | Process      | 2026-11-21 |
| D-376 | Screen reader: har release NVDA (desktop apps) aur TalkBack (Customer, Delivery); R1 se pehle ek baar VoiceOver pe Customer app.                                                                                                                                                        | Process      | 2026-11-21 |
| D-377 | Khoj wala testing: har release pe owner misaal 2 ghante; R1 se pehle allowlist ke 1-2 testers; har haath ke check ka record, "verified" usi se.                                                                                                                                         | Process      | 2026-11-21 |
| D-378 | Bug ki gambhirta P0 se P3; khula P0 ya P1 release roke, P2 release note me.                                                                                                                                                                                                             | Process      | 2026-11-21 |
| D-379 | Load test R1 se pehle ek baar, phir sirf load wale raaste badalne ya nayi service pe.                                                                                                                                                                                                   | Process      | 2026-11-21 |
| D-380 | Live smoke order: pack se pehle cancel, "smoke" nishaan se bikri, Bestseller, search aur aankdon se bahar; finance aur audit me kuch nahi mitta.                                                                                                                                        | Process      | 2026-11-21 |
| D-381 | QA batch 1 (testing ke siddhaant, levels, kab kya chalta hai, RT-1 se RT-8) maana: [RULES.md](RULES.md) §4.1.                                                                                                                                                                           | Process      | 2026-11-21 |
| D-382 | QA batch 2 (test data, fakes aur ghadi, RT-9 se RT-16) maana: [RULES.md](RULES.md) §4.2.                                                                                                                                                                                                | Process      | 2026-11-21 |
| D-383 | QA batch 3 (paisa, stock aur permissions ke tests, RT-17 se RT-20) maana: [RULES.md](RULES.md) §4.3.                                                                                                                                                                                    | Process      | 2026-11-21 |
| D-384 | QA batch 4 (mutation, kernel packages ki list, coverage, flaky aur ginti, RT-21 se RT-26) maana: [RULES.md](RULES.md) §4.4.                                                                                                                                                             | Process      | 2026-11-21 |
| D-385 | QA batch 5 (E2E, accessibility, visual aur performance, RT-27 se RT-33) maana: [RULES.md](RULES.md) §4.5; D-342 ke Asar me sudhaar.                                                                                                                                                     | Process      | 2026-11-21 |
| D-386 | QA batch 6 (security, migrations, backup, COMPLIANCE checks aur bugs, RT-34 se RT-42) maana: [RULES.md](RULES.md) §4.6.                                                                                                                                                                 | Process      | 2026-11-21 |
| D-387 | QA batch 7 (Definition of Done DD-1 se DD-12, R1 release gate RG-1 se RG-14) maana: [RULES.md](RULES.md) §1 aur §2.1.                                                                                                                                                                   | Process      | 2026-11-21 |
| D-388 | Acceptance criteria naye doc [ACCEPTANCE.md](ACCEPTANCE.md) me hamesha ke liye; planning me `TASK.md` uske hisse ki link de, copy nahi.                                                                                                                                                 | Process      | 2026-11-21 |
| D-389 | QA batch 8 (PLATFORM, GATEWAY, AUDIT, LOGS ke 32 criteria) maana: [ACCEPTANCE.md](ACCEPTANCE.md) §1.1, §1.2, §1.11, §1.13.                                                                                                                                                              | Process      | 2026-11-21 |
| D-390 | QA batch 9 (IDENTITY, NOTIFY, MEDIA ke 27 criteria) maana: [ACCEPTANCE.md](ACCEPTANCE.md) §1.3, §1.4, §1.12.                                                                                                                                                                            | Process      | 2026-11-21 |
| D-391 | QA batch 10 (CATALOG, COMMERCE ke 24 criteria) maana: [ACCEPTANCE.md](ACCEPTANCE.md) §1.6, §1.7.                                                                                                                                                                                        | Process      | 2026-11-21 |
| D-392 | QA batch 11 (PAYMENTS, FINANCE ke 22 criteria) maana: [ACCEPTANCE.md](ACCEPTANCE.md) §1.5, §1.9.                                                                                                                                                                                        | Process      | 2026-11-21 |
| D-393 | QA batch 12 (LOGISTICS, SUPPORT ke 20 criteria) maana: [ACCEPTANCE.md](ACCEPTANCE.md) §1.8, §1.10.                                                                                                                                                                                      | Process      | 2026-11-21 |
| D-394 | QA batch 13 (Customer, Seller, Delivery apps ke 26 criteria) maana: [ACCEPTANCE.md](ACCEPTANCE.md) §2.1, §2.2, §2.9.                                                                                                                                                                    | Process      | 2026-11-21 |
| D-395 | QA batch 14 (6 staff apps ke 33 criteria) maana: [ACCEPTANCE.md](ACCEPTANCE.md) §2.3 se §2.8.                                                                                                                                                                                           | Process      | 2026-11-21 |
| D-396 | QA ke 12 naye risks (R-065 se R-076) bachav ke saath khule: fakes, containers ka farak, lamba CI, flaky, samay, laptop pe bojh, screenshots, personal data, ek tester, ek haath, smoke ka kharcha, replica set.                                                                         | Operations   | 2026-11-21 |
| D-397 | QA ke 5 chhote sudhaar: p95 ka pass live jaisi CPU seema pe (RT-31), SR-019 ka naap laptop pe, flow ka DB budget `TASK.md` me (RT-19), OPERATIONS me WebKit aur smoke order, DS-8.1 me screen readers.                                                                                  | Process      | 2026-11-21 |
| D-398 | QA ke 5 lene layak niyam [RULES.md](RULES.md) §4.7 me (RT-43 se RT-47): scan ki chhoot likhi wajah se, ids ka pehra, CI config ka test, release ka test report, 4 regression tests.                                                                                                     | Process      | 2026-11-21 |
| D-399 | Kanooni rok aur band FY ki file: server pe sirf band karne wali (public) chaabi; kholne wali chaabi password manager aur ek offline copy me, kholna sirf laptop se.                                                                                                                     | Security     | 2026-11-21 |
| D-400 | Audit aur logs ke clusters ka dhaancha sirf laptop ke release command se; boot pe sirf fingerprint ki jaanch aur alert; audit chain ka hash bahar.                                                                                                                                      | Security     | 2026-11-21 |
| D-401 | Owner ke alerts ki push subscription device ke saath (session se nahi); khatam hone pe gambhir email, aur roz ek test push.                                                                                                                                                             | Security     | 2026-11-21 |
| D-402 | Request logs sirf owner Master app me padhe (`logs.read`, dobara code, wajah, har padhna audit me); bulk export nahi.                                                                                                                                                                   | Security     | 2026-11-21 |
| D-403 | Security bug ka private record GitHub ki private security advisory me, agar public repo pe muft chale; warna alag private repo.                                                                                                                                                         | Security     | 2026-11-21 |
| D-404 | Record wale security niyamon ka saboot OPERATIONS ke naye hisse "Security ke record" me (sirf `Pass`/`Baaki`); detail private record me.                                                                                                                                                | Security     | 2026-11-21 |
| D-405 | Testers ki allowlist entry sirf exact email se mel khaye, `+` alias se nahi.                                                                                                                                                                                                            | Security     | 2026-11-21 |
| D-406 | Render host pe rejected requests aur `/wake` pings: aam din har line, ek IP ki seema (misaal 100/minute) ke upar sirf ginti.                                                                                                                                                            | Security     | 2026-11-21 |
| D-407 | Payment screen ek alag HTML document; gateway ki script aur uski CSP sirf wahan; checkout ka roop (D-345) waisa hi.                                                                                                                                                                     | Security     | 2026-11-21 |
| D-408 | Security review batch 1 (edge aur hosting) maana: SR-089, SR-090, SR-105 naye; SR-005, SR-006 badle; §1.1 me 4 threats; RULES, OPERATIONS, ARCHITECTURE, DESIGN, FLOWS, ACCEPTANCE aur RISKS me badlav. | Security | 2026-11-21 |
| D-409 | Security review batch 2 (sign-in aur sessions) maana: SR-092 se SR-095 naye; SR-012, SR-020 badle; §1.2 aur §1.3 me 5 threats; ARCHITECTURE, DESIGN aur ACCEPTANCE me badlav. | Security | 2026-11-22 |
| D-410 | Security review batch 3 (authorization aur paisa) maana: SR-032, SR-033, SR-043, SR-059, SR-075 badle; §1.4 aur §1.5 me 5 threats; RT-35 aur ARCHITECTURE §7 niyam 8 me badlav. | Security | 2026-11-22 |
| D-411 | Security review batch 4 (delivery, reviews aur content ki ghadiyaan) maana: SR-060 aur SR-078 badle; §1.6 me 3 threats; OPERATIONS §7 niyam 3 me gambhirta ki list. | Security | 2026-11-22 |
| D-412 | Security review batch 5 (files, media, map aur band data) maana: SR-091, SR-096, SR-097 naye; SR-006, SR-062, SR-065, SR-066 badle; §1.7 me 5 aur §1.10 me 1 threat; OPERATIONS, ARCHITECTURE, DESIGN aur RULES me badlav. | Security | 2026-11-22 |
| D-413 | Security review batch 6 (logs, audit, errors aur alerts) maana: SR-098 se SR-101 naye; SR-005, SR-072, SR-074 badle; §1.8 me 7 threats; ARCHITECTURE, OPERATIONS aur ACCEPTANCE me badlav. | Security | 2026-11-22 |
| D-414 | Security review batch 7 (DevOps, testing aur security bugs) maana: SR-102 se SR-104 naye; SR-081, SR-084 badle; §1.9 me 6 threats; RULES (RT-48), OPERATIONS (§12), COMPLIANCE aur RISKS me badlav. | Security | 2026-11-22 |
| D-415 | Security review batch 8: 7 naye risks R-077 se R-083 (tag Security), bachav ke saath Khula. | Security | 2026-11-22 |
| D-416 | Security review batch 9: SECURITY_REQUIREMENTS me Release column, Kahan se ASVS 5.0.0 ke chapter, OWASP Top 10:2025 aur API Top 10 2023 ka naksha; RULES RG-2 Release column se. | Security | 2026-11-22 |
| D-417 | Security review ke baaki hisse: OPEN_QUESTIONS §2 me 11 nayi jaanch aur 4 rows zyada zaroori, 2 lene layak cheezein, aur dhyaan ke 17 points ka hisaab. | Security | 2026-11-22 |

## 2. Record

### D-001. Tech stack

- **Faisla:**
  - **Backend:** Node.js 24, TypeScript (strict, sirf ESM), Express; validation zod se; HTTP calls axios se; logger pino, saath me pino-pretty (D-339).
  - **Data:** MongoDB (native driver) saari services ke liye, **siwaye finance service ke, jiska database PostgreSQL hoga**. Redis-compatible store (Valkey) aur BullMQ background kaam aur queues ke liye.
  - **Frontend:** React, React Router, TanStack Query, react-hook-form, react-aria-components; state management Zustand se (D-339); build Vite se, styling Tailwind CSS se.
  - **Tooling:** npm workspaces ka monorepo, Turborepo, tsdown (packages ka build), Vitest aur Testing Library, Playwright (E2E), ESLint, Prettier, GitHub Actions (CI).
  - **Finance ke niyam:** har niyam ki saaf list (unique index, conditional update, ya code + raat ki jaanch se pakka), aur har niyam ka test, ek saath chalne wale requests ke tests samet.
- **Wajah:** stack owner ne shuru me hi tay kiya. Finance ke liye PostgreSQL Claude ki daleel se aaya: finance ka poora scope (ledger, settlement, TCS / TDS, GST registers) rahe to uske niyam aur reports relational database me zyada mazboot rehte hain. Owner ne yahi chuna.
- **Chhode vikalp:** naya stack; finance bhi MongoDB pe; finance ka scope chhota karna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (stack); Salah maani (finance ke liye PostgreSQL).
- **Asar (Claude):** finance service ke liye transaction, events, release steps aur idempotency ka PostgreSQL wala roop banana hoga; laptop ka Docker infra, CI aur backup me PostgreSQL judega; provider Neon ka free plan (D-057).

### D-002. Repo aur folders ka dhaancha

- **Faisla:** ek monorepo (npm workspaces). Folders:
  - `packages/<shared|frontend|backend>/<name>`: saajhe packages, naam `@beautinique/<category>-<name>`.
  - `frontend/<app>`: har app ka apna folder.
  - `backend/<service>`: har service ka apna folder.
  - `infra/` (laptop ka Docker infra), `scripts/` (repo ke tools), `configs/` (lint aur TypeScript ke saajhe config), `docs/`.
  - Tools aur kaam ke conventions tay hain; unki poori list [RULES.md](RULES.md) me ek-ek karke aayegi.
- **Wajah:** owner ne shuru me hi tay kiya.
- **Chhode vikalp:** koi charcha nahi hui.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-003. Sab naye sire se

- **Faisla:** docs aur code dono naye sire se banenge. Pehle bana kaam sirf seekhne ka reference hai: usme jo theek tha wo owner ki haan se naye me aata hai, aur jo sawal uthane layak tha wo discovery me uthaya jaata hai. Naye docs aur naye code me pehle ke kaam ka koi zikr ya link nahi, kyunki wo aage hat jayega.
- **Wajah:** owner: pehle ka kaam apne asli naam se pada rahe to owner aur Claude dono ke liye confusion hota; aur har cheez firse banani hai.
- **Chhode vikalp:** bana hua code rakh ke uske upar banana (Claude ki salah); naya code shuru hone tak pehle ka code apne naam se rehne dena (Claude ki salah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (reference); Salah nahi maani (code naye sire se, aur abhi se naam badalna).
- **Asar (Claude):** naya root setup (`package.json`, lint, CI) aur naya code implementation stage me banenge. Tab tak koi npm command nahi chalta, aur pull request pe CI fail hoga.

### D-004. Abhi sirf discovery

- **Faisla:** abhi sirf discovery: sawal-jawab. Plan, task files aur code tab tak nahi jab tak owner agla stage na khole.
- **Wajah:** owner: jaldbaazi nahi; khoob sawal-jawab karke har cheez achhe se tay karni hai.
- **Chhode vikalp:** pehle repo dekh ke seedha poora plan banana.
- **Kab dobara khulega:** jab owner agla stage khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-005. Agents ek ke baad ek

- **Faisla:** agents ek ke baad ek, kabhi saath nahi; agla tabhi jab pichhla poora ho jaye. 5-hour limit ~80% pe ho to naya agent nahi; jo chal raha ho use poora hone do.
- **Wajah:** owner ki 5 ghante ki usage seema; jaldi ke liye kaam ki quality nahi girni chahiye.
- **Chhode vikalp:** kai agents saath (parallel) chalana.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-006. Docs aur tasks ka dhaancha

- **Faisla:** tasks ek file me nahi.
  - Ek main plan file: [PROJECT_PLAN.md](PROJECT_PLAN.md).
  - Har bade module ka apna folder `tasks/NN-<module>/` (jaise auth, product management, audit log, order management): usme `TASK.md` (module ka spec aur subtasks ki list), aur bade kaam ke liye `subtasks/` ([tasks/README.md](tasks/README.md)).
  - Jo flows kai modules me chalte hain, wo [FLOWS.md](FLOWS.md) me.
  - Faisle ek file me tag ke saath (ye file), risks ek file me ([RISKS.md](RISKS.md)). Docs ki poori list [README.md](README.md) me.
- **Wajah:** owner: ek badi file ki jagah alag files, taaki har flow ki baat alag aur saaf rahe.
- **Chhode vikalp:** sab tasks ek file me; business aur architecture faislon ki alag files.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (kai files); Salah maani (exact dhaancha).

### D-007. Security Architect

- **Faisla:** Security Architect ek zaroori, alag role hai, jo baaki roles ke kamzor faislon ko challenge karta hai. Har bade module aur har bade architecture faisle se pehle security review (STRIDE, OWASP ASVS, OWASP Top 10, OWASP API Security Top 10). Security ki do files: [security/THREAT_MODEL.md](security/THREAT_MODEL.md) aur [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md); security ke faisle is file me (tag `Security`), security ke risks [RISKS.md](RISKS.md) me (tag `Security`).
- **Wajah:** owner: security baad ki soch nahi, shuru se har faisle me.
- **Chhode vikalp:** security ki chaar alag files.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (role); Salah maani (do files aur tags).

### D-008. Releases me banana

- **Faisla:** design aur task files poore ecosystem ki pehle din. Banana releases me: R1 = ek patla par poora order flow. Koi feature kata nahi. R1 me exactly kya aayega, ye alag se tay hoga.
- **Wajah:** owner ne Claude ki salah maani.
- **Chhode vikalp:** sirf patla flow aur baaki kaatna (scope chhota hota); sab ek saath launch pe (bahut der tak kuch chalta nahi dikhta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.
- **Asar:** root `CLAUDE.md` ka production-grade niyam isi ke saath likha hai.

### D-009. Capacity

- **Faisla:** kaam karne wala ek hi insaan (owner), 2 Claude accounts se baari-baari (usage limit ki wajah se). Din me 5 ghante, hafte me 6 din (30 ghante), 2026-11-17 se. Koi deadline nahi.
- **Wajah:** owner ki batayi haalat.
- **Chhode vikalp:** koi nahi (ye haalat hai, chunaav nahi).
- **Kab dobara khulega:** jab haalat badle.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-010. 11 alag apps

- **Faisla:** har role parivaar ka alag app; 11 apps: Customer, Seller, Admin, Super Admin, Master, Support Desk, Finance, Logistics Ops, Delivery, Growth Studio, Creator. Jaise-jaise module bane, uski screens apne app me judti jayengi.
- **Wajah:** owner: alag rakhne se kai projects bante hain.
- **Chhode vikalp:** internal apps ko 4 se 5 apps me milana (Claude ki salah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah nahi maani.
- **Aage:** ek insaan ke kai roles hon to kai jagah sign-in ka bojh: security review me.

### D-011. Alag services, alag clusters

- **Faisla:** sabki alag services, har service ka apna database aur apna cluster. MongoDB wali har service ka alag Atlas cluster (alag Atlas project, alag DB user); finance PostgreSQL pe (D-001), alag DB user ke saath. Kam storage wale modules ek service me reh sakte hain. Seema: jo ek saath pakka hona chahiye wo ek service me; services ke beech data sirf events se. Pehla draft (module design me pakka hoga): identity, notify, payments, catalog, commerce, logistics, finance, support, audit.
- **Wajah:** owner: Atlas ka free (M0) cluster 512 MB deta hai, jo poore project ke liye kaafi nahi hoga; aur security bhi zaroori wajah hai.
- **Chhode vikalp:** ek service me modules (modular monolith); kuch hi services alag (Claude ki salah); ek environment ka ek hi cluster, har service ka sirf alag database (owner ne 2026-11-17 ko saaf chhoda: har service ka apna cluster).
- **Kab dobara khulega:** Atlas free tier ka niyam (ek project me ek free cluster) ya ek 512 MB process 9 services na sambhal sake (Claude; dono ki jaanch baaki).
- **Kisne, kab:** owner, 2026-11-17; seema Claude ki salah, owner ne maani. **Nishaan:** Salah nahi maani (services), Salah maani (seema).
- **Note (Claude):** alag cluster aur alag DB user se data ki security abhi se milti hai; process ki security tab milegi jab services alag servers pe chalein. Design aisa rahe ki wo kadam baad me bina rewrite ke ho.
- **Asar (Claude):** naya service banane wala generator har service me uska apna MongoDB URI jode, aur finance ke liye PostgreSQL ka option de (D-001). Jod (2026-11-20, D-291): "data sirf events se" ka matlab: data ki copy sirf events se aur doosri service ka database koi nahi padhta; jo kaam usi pal jawab maangte hain wo sirf [ARCHITECTURE.md](ARCHITECTURE.md) §2.3 ki tay sync list se. Services ki list §2.4 me (media aur logs judi).

### D-012. Asli users maan ke design

- **Faisla:** live system sirf owner chalayega, par design aur code ye maan ke ki asli users use kar rahe hain: concurrency, abuse aur scale ki soch, aur unke tests.
- **Wajah:** owner: code sirf owner ke liye nahi likhna, ekdum production-grade banana hai.
- **Chhode vikalp:** "sirf ek user hai" maan ke load aur abuse ki chinta chhodna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.
- **Kahan laagu nahi:** sirf chhote operations ke faisle (jaise backup ke waqt system khaali hai, emails ki ginti).

### D-013. Backup command

- **Faisla:** ek command, jo production me jaane se pehle owner chalayega, aur saare databases ka data download kare.
  - MongoDB clusters: Extended JSON (har collection ki ek file, ek line me ek document).
  - Finance ka PostgreSQL (D-001) bhi isi command me; uska format technical charcha me tay hoga.
  - Restore command bhi, jo ek baar local pe jaanchi jaye.
  - Files isi repo ke ek folder me, git se bahar. 4 pehre: `.gitignore`; CI ka pehra jo us folder ki koi file git me dikhe to fail kare; Prettier, ESLint aur tests se bahar; Claude us folder ko `.env` ki tarah kabhi na khole.
- **Wajah:** owner: production me jaane se pehle ek command chala ke saare clusters ka data JSON me mil jaye; files repo me rahein par GitHub pe na jayein.
- **Chhode vikalp:** repo ke bahar ka folder (Claude ki salah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (command, jagah); Salah maani (format, restore, pehre).

### D-014. Fulfilment model

- **Faisla:** har brand ka saara maal sirf apne warehouse (Chakan) me; customer tak sirf apne delivery partners, koi courier nahi.
  - Raasta: brand → warehouse → hub → delivery partner → customer.
  - Ilaake ke bahar delivery unavailable.
  - Delivery ka code ek carrier port ke peeche; aaj uske peeche sirf apni fleet.
  - Seller khud nahi bhejta. Brand maal warehouse bhejta hai; batch aur expiry ki jaanch ek hi jagah: warehouse me receiving pe.
  - Return pickup bhi apne delivery partners karte hain.
  - Pehle din 1 warehouse + **sirf 1 hub** (warehouse wale sub-district me, warehouse ke paas); delivery usi sub-district ke saare pincodes tak; baaki hubs baad me ek click se.
- **Wajah:** owner: pehle din poora district nahi, ek-ek hub se shuru.
- **Chhode vikalp:** pehle din poora district (21 hubs); pehle din 2 hub (warehouse wala aur ek alag sub-district ka); seller khud bheje.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner; Salah maani (carrier port).

### D-015. Location, switches aur live

- **Faisla:**
  - **Seedhi:** India > State > District > Sub-District. District me ek main warehouse; har sub-district me theek ek hub (alag record, sub-district se juda). Hub sirf parcel aage badhata hai, stock nahi. Warehouse se seedha customer ko kuch nahi; main city me bhi warehouse ke paas hub.
  - **Switch ka haq:** Master = State, Super Admin = District, Admin = Sub-District; Admin hub live karta hai. Upar wala role neeche ka switch chala sakta hai, audit ke saath.
  - **Switch aur live alag:** switch = kisi ne ON dabaya; live = apna switch ON + upar wala level live. Live kahin save nahi hota. Upar OFF to neeche sab OFF.
  - **Sharten sirf live karte waqt:** hub = staff ki list poori; district = warehouse + hub tayyar; state = kam se kam ek district. Live ke baad kami pe sirf chetavni (D-022), apne aap band nahi.
  - **OFF:** naye order turant band; jab tak orders ya returns raaste me hain, wo poore hote hain. Aakhri district OFF ho aur kuch pending na ho to state bhi OFF. Order user ke district ke warehouse se.
- **Wajah:** owner: hub tabhi live jab uska poora staff ready ho; state tab tak live nahi jab tak uska koi district live na ho.
- **Chhode vikalp:** live ki haalat store karna; sharat tootte hi apne aap band (D-022).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (seedhi, haq, sharten); Salah maani (switch aur live alag, sharten sirf live karte waqt, hub alag record).

### D-016. Pincode ke niyam

- **Faisla:**
  1. **Buniyadi niyam:** delivery ka faisla naam ya seedhi se nahi, **pincode → theek ek hub** ki mapping se. Har pincode ka ek primary sub-district (data se aaye, Admin badal sake).
  2. Pincode number poore India me ek hi ilaake ka hota hai; asli case ye hai ki ek pincode ka ilaaka do sub-districts, do districts ya kabhi do states me phaila ho.
  3. **Do sub-districts ya districts me phaila:** primary sub-district ka hub aur us district ka warehouse serve kare; address me likha district alag ho to bhi order na ruke.
  4. **Do states me phaila:** data me nishaan; customer state chune; chuna hua state live ho tabhi order; GST usi state ke hisaab se.
  5. **Ek jaise naam:** hamesha id aur sarkari code se, naam se kabhi nahi; screen pe "Sub-District, District, State" saath dikhe.
  6. **Source data me ek pincode ki kai lines:** import pe ek pincode = ek record, unique.
  7. **Naam ya seema badle:** code wahi, naam ka itihaas rahe; purane orders me address waisa hi jaisa order ke waqt tha.
  8. **Bina mapping wala pincode:** unavailable, aur Admin ko "bina mapping wale pincodes" ki list.
  9. **Jaanch kab:** serviceability ki jaanch order banate waqt usi transaction me, sirf cart dikhate waqt nahi.
  10. **Pending me returns bhi:** return pickup aur refund poore hone tak jagah poori OFF na ho.
- **Wajah:** owner ne cases poochhe aur niyam Claude pe chhode.
- **Chhode vikalp:** naam se mapping; ek pincode ke kai hub.
- **Kab dobara khulega:** asli location data dekh ke (kitne pincodes phaile hain), ya owner khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-017. Roles

- **Faisla:** roles ki poori list design me; system me har role tab chalu jab uska module bane, usi badlav me uski permissions. Ginti fix nahi (abhi ki soch ~80), zaroorat pe badh sakti hai; Master bina deploy ke sub-role jod sakta hai.
  - **Owner ke accounts:** har role ka alag account, 2 base emails ke `+` alias se: ek authenticator wale 7 apps ke roles ke liye, ek baaki (Customer, Seller, Delivery, Creator) ke liye. Bantwara sirf suvidha, niyam nahi: jahan zaroori ho authenticator lagega (jaise Seller Account Owner, Seller Finance).
  - **`+` alias:** normalise nahi hoga; email validation pe code comment ki kyun, aur ki owner ke accounts isi pe tike hain.
- **Jod (owner, 2026-11-19, D-237, D-241):** Nodal Officer ka role judta hai (Grievance Officer pehle se, D-163). Jahan kisi kaam ke liye insaan ki jaankari chahiye aur wo kaam apna hai, uska role banta hai, dummy naam nahi (D-241).
- **Wajah:** owner: jinko authenticator ki zaroorat nahi, unhe har login pe authenticator na chalana pade; roles 80 hi honge, ye fix nahi.
- **Chhode vikalp:** saare roles abhi system me; roles kam karna (12 se 15).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani (roles); Owner (accounts, alias).
- **Jod (owner, 2026-11-20, D-253):** naya staff role "Security Contact" (CERT-In ka Point of Contact), owner ke paas.

### D-018. Faislon ki process

- **Faisla:** har bada faisla is file ke format me (§0). Is file me purana faisla mitta nahi, "badla" line judti hai. Sawal-jawab ki files (jaise [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md)) me sirf aakhri faisla.
- **Wajah:** owner ne Claude ki salah maani: faisle soch-samajh ke, saboot aur vikalpon ke saath.
- **Chhode vikalp:** faisle bina wajah aur vikalp ke likhna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-019. Docs ka tareeka

- **Faisla:** docs chhote aur faislon ke record ke saath; har baat sirf ek jagah, baaki jagah link; "bana hai" sirf code ya test ki link se; ek index file ([README.md](README.md)). CI me ek check jo docs me likhe file paths repo me hon ye dekhe.
- **Wajah:** owner ne Claude ki salah maani: bade docs code se alag ho jaate hain aur ek baat kai jagah likhi hoti hai.
- **Chhode vikalp:** bade docs hi update karte rehna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-020. Guest cart nahi

- **Faisla:** cart aur wishlist ke liye sign-in zaroori.
  - Bina sign-in: products aur product page, search aur filter, reviews padhna, pincode pe delivery check.
  - Sign-in zaroori: cart, wishlist, checkout aur payment, review likhna, orders aur account.
- **Wajah:** owner: storage aur kaam kam karne ke liye.
- **Chhode vikalp:** server pe anonymous cart (Claude ki salah).
- **Kab dobara khulega:** sirf owner khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah nahi maani (guest cart); Salah maani (bina sign-in ki list).

### D-021. Customer sign-in

- **Faisla:** customer app me teen raaste, customer khud chune: password, social (Google, LinkedIn, GitHub), aur email code. Email code se sign-in sirf customer app me; authenticator laga ho to email code ke baad bhi maanga jaye (security review me pakka).
- **Wajah:** owner ne Claude ki salah maani: consumer storefront pe lamba password rukawat hai.
- **Chhode vikalp:** sirf password + social; sirf email code + social.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-022. Location ka kaam kitna aur kis order me

- **Faisla:**
  - Poore India ka location data import; shak wale pincodes ki jaanch sirf live hone wale district ki.
  - D-015 ke switches aur live; teen sharten code ke niyam (generic checklist engine baad me).
  - Area settings sirf checkout aur delivery promise ki keys (sub-district level samet).
  - Network: 1 warehouse, hub, pincode → hub, delivery promise.
  - **Order:** pehle location, phir products. Expand karna (naya hub, warehouse, district, switch, staff, live, sarkari data) app ya import se, code se nahi.
  - **Staff ki list:** kaunse roles kitne, data me, app ke ek page pe, sab hubs ke liye ek; sirf Master badle, audit ke saath.
  - **Staff kam ho jaye to:** Master ko save se pehle dikhe kitne live hubs pe asar; hub chalta rahe, "Delivery Partner 1/2" jaisa nishaan, Admin aur Super Admin ko in-app + email; faisla Admin ka (staff bhare ya hub OFF); OFF hua hub dobara tabhi live jab list poori. District aur state pe bhi yahi.
- **Wajah:** owner ne Claude ki salah maani: ek warehouse aur kuch hubs ke liye poore engine se pehle utna hi jitna zaroori.
- **Chhode vikalp:** sirf pincode → hub table; location ka bada poora engine pehle; staff kam hote hi turant band; purane hubs pe naya niyam na lagana.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-023. Package CLI

- **Faisla:** packages ka CLI wahi kaam karega: create, publish, republish, verify, update-deps. Is pe naya kaam tabhi jab packages publish karne ka plan bane. Teen niyam:
  1. Release ke baad ka sandesh `release` branch ka naam bataye.
  2. Packages ke docs me back-merge `release` → `prerelease` likha ho.
  3. Docs me likha ho ki CLI ke tests (`test:scripts`) ke liye local infra chalu chahiye.
- **Wajah:** owner ne Claude ki salah maani: publish ka plan na ho to CLI pe aur nivesh nahi.
- **Chhode vikalp:** CLI hatana; CLI ko aage badhana.
- **Kab dobara khulega:** jab packages publish karne ka plan bane.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.

### D-024. Branches

- **Faisla:** `main` branch hategi. Flow: feature branch → `prerelease` (development) → `release` (production); back-merge `release` → `prerelease` waise hi. GitHub default branch `release`.
- **Kram:** pehle saari jagah `main` ka zikr badle (CI, git skills, `CLAUDE.md`), phir default branch, aakhir me delete; sirf implementation me, owner ke kehne pe. Tab tak `CLAUDE.md` ka git flow hi laagu.
- **Jod (D-338, 2026-11-21):** default branch badalne se pehle scheduled workflows (jaise server jagane wala, D-322) nayi default branch pe hon; GitHub ka schedule sirf default branch pe chalta hai.
- **Wajah:** owner: `main` branch delete karni hai; ek insaan ke liye teen lambi branches bhaari.
- **Chhode vikalp:** teeno branches rakhna; sirf `main` + feature branches.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-025. Consultation aur Beauty Advisor

- **Faisla:**
  - Skin & Hair Expert aur Beauty Advisor asli staff roles (Support Desk, Support Lead ke neeche).
  - Apna video system nahi: customer ko Google Meet ka dummy link. Link staff daale (sirf `https://meet.google.com/...`); system nakli link nahi banata; demo me DUMMY nishaan. Link email aur in-app se.
  - Flow: request → time tay aur link bheja → consult hua → resolve (cancel aur no-show bhi); har badlav audit me; customer ko haalat dikhe. Dono roles ka ek hi flow.
  - Skin & Hair Expert ke notes health data hain: sirf expert aur zaroori support roles dekhein, pehle customer ki consent (security review me pakka).
  - [COMPLIANCE.md](COMPLIANCE.md) me telemedicine ki ek dummy row.
  - Beauty Advisor ka chat live nahi, message thread: customer sawal bheje, advisor shade aur product links ke saath jawab de.
- **Wajah:** owner: ye ek poora plan hoga; telecommunication ki jhanjhat nahi chahiye.
- **Chhode vikalp:** apna video system; live chat; roles hatana.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (roles, Meet link); Salah maani (flow ke niyam, message thread).
- **Jod (owner, 2026-11-20, D-252):** Skin & Hair Expert ki consultation beauty aur skincare salah hai, medical consultation nahi: nidaan ya dawa nahi; booking, Meet ke email aur notes pe "Ye medical consultation nahi hai"; ilaaj ya dawa ke sawal pe "doctor se milein"; profile pe "doctor" ya "dermatologist" jaise shabd nahi.

### D-026. Project ka lakshya

- **Faisla:** portfolio aur practice project, par aisa bane ki kal asli business ban sake. Design asli jaisa (data model, compliance ke fields, security); registrations aur kanooni details dummy; scope ka paimana "poora order flow chalta dikhe".
- **Wajah:** owner ne vikalp (b) chuna. Owner pehle hi project ko practice hobby project keh chuke the; (b) usme ye jodta hai ki design asli business jaisa rahe, taaki aage jaana pade to code dobara na likhna pade.
- **Chhode vikalp:** sirf seekhna aur portfolio; asli business launch.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah maani.
- **Asar (Claude):** D-012 (asli users maan ke code) isi ke saath chalta hai. Asli business pe jaana = operations, kanooni registration aur paid plans ka kaam, code rewrite nahi. Iske liye dummy kanooni details (GSTIN, licence numbers, contacts) data ya config me rahen, code me nahi.
- **Jod (owner, 2026-11-19, D-241):** dummy sirf registrations, licence numbers aur bahar ki (dummy) companies ki jaankari; jis kaam ka role apna hai (jaise Grievance Officer, nodal person, customer care), uski jaankari dummy nahi, role wale staff account se.

### D-027. Stock transport (warehouse aur hub ke beech)

- **Faisla:** warehouse aur hub ke beech maal (dono taraf, returns samet) **kiraye ke transporter** se. Driver ka system me account ya role nahi. Har trip ka record: transporter, gaadi number, driver ka naam aur phone (sirf contact ke liye), seal number, manifest (kaunse bags aur parcels), warehouse pe dispatch scan aur hub pe receive scan (kis staff ne kiya). Transporter ka bill finance me kharche ki entry, trip records se mila ke. Brands apna maal bhejne aur wapas le jaane ke liye apna transport ya courier le sakte hain.
- **Wajah:** owner ne do vikalp diye (apna local staff jiska system me record nahi, ya kiraye ka), saath me kaha ki kharche ka bill banega, aur chunna Claude pe chhoda. Claude ne kiraye ka chuna: (1) bina record ke maal gum ya toot jaaye to zimmedari kisi pe nahi banti, jo D-012 ke khilaaf hai; (2) bill kiraye wale ke saath seedha baithta hai, apne staff ka kharcha salary hota hai; (3) naya role ya app nahi chahiye.
- **Chhode vikalp:** apna local staff, bina record ke.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17 (chunna Claude pe chhoda). **Nishaan:** Salah maani.
- **Aage (Claude):** e-way bill ki zaroorat aur seema jaanchi nahi (compliance ki charcha me).

### D-028. ₹0 aur domain nahi

- **Faisla:** kharcha ₹0, domain nahi.
  - Soye server pe pehle customer ka ~1 minute intezaar chalega.
  - Server GitHub Actions, cron-job aur UptimeRobot se din me baar-baar jagaya jayega, aur apps khule hon tab har kuch minute me.
  - Din ke 300 emails kaafi.
  - Free tier ki seemaon ki handling banti rahegi.
  - Production-grade = code ki quality + chalne ki quality, ₹0 me jitni ho sake (D-012).
- **Wajah:** owner: hobby project hai, to din ke 300 emails kaafi hain; domain nahi chahiye.
- **Chhode vikalp:** kam se kam ek domain (Claude ki salah); mahine ka budget.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Salah nahi maani.
- **Jokhim (owner ne maana):** domain ke bina emails spam me ja sakte hain, aur har OTP email se hi jaata hai.

### D-029. Product category

- **Faisla:** sirf beauty aur personal care. Koi aur category nahi aayegi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** doosri categories.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-030. Business model

- **Faisla:** Beautinique apne brand ke products bechega, aur doosre beauty brands seller ban ke bechenge. Sab kuch ek hi storefront pe. Har product ka ek seller, aur customer invoice us seller ke GSTIN se.
- **Jod (owner, 2026-11-19, D-243):** "Beautinique" storefront aur platform ka naam hai, product brand nahi. Apne products ka brand "Unibelle" hai, jo seller company "Unibelle Cosmetics Pvt Ltd" (D-031) bechti hai.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** sirf apna maal (1P inventory); sirf doosre brands (pure marketplace).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-031. Apna brand

- **Faisla:** apna brand ek **alag (dummy) company ke naam se** seller banega. Wo seller app me ek "house brand" seller account se chalega, jise Own-Brand Manager sambhalega. Iske products bhi baaki brands ki tarah hi check honge. Koi shortcut nahi, Master ke liye bhi nahi.
- **Jod (owner, 2026-11-19, D-233, D-241):** brand aur dummy company ka naam platform ke naam se alag (D-233). Company dummy hai, par use chalane wale apne roles (jaise Own-Brand Manager) asli staff roles hain (D-241).
- **Badla (owner, 2026-11-19, D-243):** seller company "Unibelle Cosmetics Pvt Ltd", brand "Unibelle"; platform company "Beautinique Pvt Ltd".
- **Wajah:** owner ne alag company chuni (2026-11-17). Claude ki daleel: platform company khud seller ho to har jagah special case banta (khud pe TCS nahi, settlement ki jagah andar ka transfer, apne brand ko aage dikhane ke sawal); alag company ke saath apna brand bhi baaki sellers jaisa ek hi raasta.
- **Chhode vikalp:** platform company khud apne brand ki seller.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (house brand account, koi shortcut nahi); Salah maani (alag company).

### D-032. Kaun bech sakta hai

- **Faisla:** sirf brand owners aur authorised distributors. Clinic, salon, spa, freelancer, home-based aur individual bech nahi sakte; wo Beauty Pro Buyer ban ke kharid sakte hain.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** koi bhi seller ban sake.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-033. Delivery partners

- **Faisla:** delivery partners gig partners honge (payroll employee nahi), aur apni gaadi chalayenge.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** payroll employees; company ki gaadiyan.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-034. Payments

- **Faisla:** prepaid online (Razorpay), ya delivery ke waqt UPI QR. Cash bilkul nahi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** cash on delivery.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-035. Launch coverage

- **Faisla:** launch phases me:
  1. Pune district, Maharashtra.
  2. Maharashtra ke baaki districts, ek-ek karke.
  3. Phir baaki states isi tarah: pehle sabse bada district, phir baaki.
  - Poore India ke customers products dekh sakte hain, par order sirf served pincodes se hoga.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** pehle din poora India.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-036. Sellers ki location

- **Faisla:** poore India ke brands jud sakte hain, kyunki unka stock hamare warehouse me aata hai. Shart: jis state ke warehouse me unka stock rahega, us state ka GST registration unke paas hona chahiye; Pune launch ke liye Maharashtra GSTIN. Jinke paas nahi, wo registration lenge, aur seller onboarding me iski step-by-step guide aur checklist milegi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** sirf usi state ke sellers jahan warehouse hai.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.
- **Asar (Claude):** naya state khulne pe (D-015) us state ke warehouse me sirf unhi brands ka maal jaa sakta hai jinke paas us state ka GSTIN ho; yaani ek product kisi state me mile aur kisi me nahi. Ye data aur jaanch ka niyam hai; registrations dummy.

### D-037. Expansion sirf configuration se

- **Faisla:** naya district ya state jodna ekdum simple: sirf admin setting aur operations ka kaam (warehouse ya hub, delivery partners, GST registration). Na code change, na deploy.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** har naye area ke liye code ya deploy.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-038. Customers ki umar

- **Faisla:** launch pe sirf 18+ customers. Sign-up pe age declaration lenge.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** umar ki koi shart nahi.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.
- **Jod (owner, 2026-11-20, D-255):** 18+ ki ghoshna ka tick consent record me; bachcha pata chale to account band aur data erase.

### D-039. Reviews

- **Faisla:** ratings aur reviews pehli release (R1, D-008) me honge.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** reviews baad ki release me.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-040. Foreign investment

- **Faisla:** foreign investment ka koi plan nahi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** foreign investment lena.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-041. Market aur tax

- **Faisla:** sirf India, prices INR me. Har order ka GST-compliant invoice.
- **Jod (owner, 2026-11-19, D-239):** invoice pack ya dispatch ke scan pe; pack se pehle cancel pe invoice nahi; baad me credit note.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** India ke bahar bechna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-042. Platform type

- **Faisla:** fully responsive web apps (mobile, tablet, desktop). Delivery app mobile-first PWA: phone pe install ho sake aur kamzor network me bhi chale. Baaki saare apps bhi phone pe app ki tarah install ho sakein (home screen icon, browser bar ke bina); offline sirf Delivery. Native mobile apps scope me nahi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** native mobile apps.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-043. Drug items

- **Faisla:** drug-classified items kabhi nahi bechenge (jaise minoxidil, medicated creams). Isliye drug licence ya pharmacist ki zaroorat nahi.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** drug licence ke saath aise items bechna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.
- **Jod (owner, 2026-11-18, D-128):** listing pe licence ka type zaroori; drug aur AYUSH drug type wale product list nahi hote, aur ingredients ki blocklist se rok.

### D-044. Head of Operations

- **Faisla:** Support, Logistics aur Seller Ops ke upar ek Head of Operations hoga (Master app me).
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** teeno seedhe Master ko report karein.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-045. Plastic EPR

- **Faisla:** maan ke chalenge ki Beautinique micro ya small enterprise nahi hai, isliye plastic EPR laagu (dummy registration).
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** micro ya small enterprise maan ke EPR chhodna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.
- **Jod (owner, 2026-11-20, D-256):** seller onboarding pe seller ka plastic EPR number, ya micro/small enterprise hone ki ghoshna; packaging ka master (shreni I se IV, wazan) aur har dispatch ka record; saal ka return (dummy).

### D-046. Notify-me waitlist

- **Faisla:** jis pincode pe delivery nahi, wahan ka customer notify-me waitlist me jud sakta hai. Waitlist se agla district ya state kholne ka suggestion milta hai, par kholne ka koi fixed order nahi: D-015 ke haq wala level use kabhi bhi khol sakta hai (Master kisi bhi district ya state ko seedha bhi). Kholne ki sharten D-015 wali hi.
- **Wajah:** owner ne rakha (2026-11-17).
- **Chhode vikalp:** waitlist nahi.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-047. Master ke doosre roles

- **Faisla:** Master ke doosre launch roles (Trust & Safety Lead, Marketing Head) ek alag staff account pe, usi insaan ke liye.
- **Wajah:** Master ke paas kisi kaam ka faisla lene ka haq nahi (seller, listing, appeal, ban appeal, risk rules), wo sirf doosra signature deta hai. Trust & Safety Lead ban appeals tay karta aur risk rules approve karta hai, isliye ye kaam alag account pe. Audit me owner aur operator alag dikhte hain.
- **Chhode vikalp:** Master ke account pe hi ye roles.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-048. Hosting (₹0)

- **Faisla:** kharcha ₹0 (D-028):
  - Backend: Render ki free web service.
  - Apps: Vercel Hobby.
  - MongoDB: Atlas M0, har MongoDB service ka apna cluster (D-011).
  - Redis: Render Key Value free (D-051).
  - Finance ka PostgreSQL (D-001): Neon ka free plan (D-057, 2026-11-18).
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** paid plans.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-049. Render pe bundle mode

- **Faisla:** Render pe bundle mode: saari backend services ek free web service me chalti hain. Laptop pe Docker split mode (har service alag).
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** har service ki alag web service (₹0 me nahi hota).
- **Kab dobara khulega:** owner khud khole, ya ek 512 MB process saari services na sambhal sake (D-011).
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-050. Database aur collections

- **Faisla:** har service ka apna database aur apna DB user (D-011). Ek service ke andar kai modules hon to unki collections module ke prefix ke saath.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** saari services ka ek database.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-051. Redis

- **Faisla:** development me local Redis (Docker Valkey, Render jaisi limits ke saath). Production me Render Key Value (Redis-compatible; free: 25 MB, 50 connections, disk pe save nahi). Sab `REDIS_URL` setting se. Production Redis sirf internal URL se (bahar se band); laptop, tests aur CI kabhi production Redis se nahi judte.
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** paid Redis.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-052. Apps se backend tak

- **Faisla:** har Vercel app `/api/*` ko Render pe chal rahe gateway pe rewrite karti hai, taaki app aur API ek hi origin pe dikhein (domain nahi, D-028).
- **Wajah:** owner ka faisla, 2026-11-17 ko dobara dekh ke waise hi rakha.
- **Chhode vikalp:** browser seedha backend ko bulaye (alag origin).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-053. Performance targets

- **Faisla:** performance targets sirf tab laagu jab server jaaga ho.
- **Wajah:** free tier me CPU aur RAM kam hai, aur soya server pehli request pe der se uthta hai (D-028).
- **Chhode vikalp:** har haal me targets.
- **Kab dobara khulega:** jab paid hosting aaye, ya owner khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner.

### D-054. Roles ka timing

- **Faisla:** design me saare roles. Poore launch tak saare roles system me honge; koi role "baad me" ke liye nahi chhoda. Banate waqt har role apne module ke saath chalu hota hai, usi badlav me uski permissions (D-017). Shuru me ek insaan kai roles sambhal sakta hai (har role ka alag account, D-017).
- **Wajah:** owner ne 2026-11-17 ko pakka kiya ki "saare roles launch tak" aur "har role apne module ke saath" dono ek saath sahi hain.
- **Chhode vikalp:** saare roles abhi, module ke bina, system me; kuch roles launch ke baad.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-17. **Nishaan:** Owner (saare roles launch tak); Salah maani (dono ka mel).

### D-055. R1 ka scope

- **Faisla:** R1 = pehla poora order: area khulna → seller → product → maal warehouse me → order → payment → delivery → return aur refund → review → seller ka hisaab. Andar aur bahar ki poori list [PROJECT_PLAN.md](PROJECT_PLAN.md) §1 me (ek hi jagah). Saar: 2 sellers (apna brand aur ek dummy brand), 1 warehouse + 1 hub, Razorpay test mode aur UPI QR, simple return, verified review, finance me seller ka hisaab aur haath se payout. Promotions, loyalty, try-on, support desk aur baaki R2 aur aage.
- **Wajah:** owner ne R1 ka scope Claude pe chhoda. Claude ki daleel: R1 me marketplace ka har zaroori hissa ek baar shuru se aakhir tak chalna chahiye, khaas kar do sellers se ek order ke do invoice aur seller ka hisaab; warna business model (D-030, D-031) parkha hi nahi jaata. Baaki features bina iske bhi baad me jud sakte hain.
- **Chhode vikalp:** sirf apna brand (ek seller); seller ka hisaab R2 me; promotions R1 me.
- **Kab dobara khulega:** domain charcha (agent 2) ke baad (Claude), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-17 (chunna Claude pe chhoda; owner ne list dekh ke pakki ki). **Nishaan:** Salah maani.
- **Jod (owner, 2026-11-18, D-099, D-105):** R1 me do cheezein judin: ingredients ki structured list, free-from filters aur allergen ki chetavni (D-099); aur Support Desk app ka patla hissa, Support Agent role ke saath (D-105). [PROJECT_PLAN.md](PROJECT_PLAN.md) §1 me bhi.
- **Jod (owner, 2026-11-19, D-137, D-147, D-155):** R1 me teen chhote jod: skin type, concern aur active % ke catalog fields (D-137); customer ki appeal ke liye Support Lead role (D-147); review me photo (D-155). D-133 se D-159 ke baaki R1 wale niyam R1 ke apne hisson me. [PROJECT_PLAN.md](PROJECT_PLAN.md) §1 me bhi.
- **Jod (owner, 2026-11-19, D-222 se D-225):** kanooni jaanch se R1 me chaar jod: "der se pahuncha" return (D-222), har discount ke saath pichhle 30 din ka sabse kam daam (D-223), test wale claims ka saboot (D-224), aur invoices ka tax archive (D-225).
- **Jod (owner, 2026-11-20, D-250, D-253):** R1 me kanooni rok ki class aur apne store me kam se kam 180 din ke request logs aur security events (D-250), aur Security Contact role (D-253).

### D-056. Render pe sirf ek web service

- **Faisla:** Render pe sirf do cheezein: ek free web service, jisme saara backend bundle mode me chalta hai (D-049), aur ek free Key Value (D-051). Koi doosri web service nahi, preview ya test ke liye bhi nahi.
- **Wajah:** owner (2026-11-18): koi doosri service nahi aayegi. Isse 750 free ghante sirf ek service me jaate hain, aur wo 24 ghante jaagi rahe to bhi mahine me fit (R-008).
- **Chhode vikalp:** har service ya preview ki alag free web service.
- **Kab dobara khulega:** owner khud khole, ya paid hosting aaye.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Owner.

### D-057. Finance ka PostgreSQL: Neon

- **Faisla:** finance service ka PostgreSQL (D-001) Neon ke free plan pe, ek Neon project me.
- **Wajah:** Neon ka free plan expire nahi hota, aur kaam na ho to bhi project na pause hota na delete; soya compute agli query pe khud jaagta hai. Owner (2026-11-18): use kam hoga (project banate waqt, aur baad me kabhi-kabhi interviews me dikhane ke liye), isliye mahine ke 100 CU-ghante kaafi.
- **Chhode vikalp:** Render ka free PostgreSQL (30 din me expire); Supabase (7 din bina kaam ke pause, haath se kholna); Aiven (idle pe band); finance bhi MongoDB pe.
- **Kab dobara khulega:** Neon ke free niyam badlein, use badhe, ya owner khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** code asli users maan ke banega (D-012), isliye design me finance database se sirf kaam aane pe baat ho; server jagane ke ping aur health check finance database tak na pahunchein; compute ka size 0.25 CU pe roka jaye. Ye niyam finance ki technical charcha me pakke honge. Neon ka Singapore region (`aws-ap-southeast-1`) hai (jaancha 2026-11-18); project usi me banana, kyunki region baad me nahi badalta, aur backend bhi Render ke Singapore region me (R-012).

### D-058. Hosting ka region: Singapore

- **Faisla:** Render ki web service (D-056), finance ka Neon project (D-057) aur MongoDB ke saare Atlas clusters (D-011) AWS Singapore region me banenge.
- **Wajah:** Render me India ka region nahi; Singapore sabse paas hai. Database server ke paas hona chahiye, user ke paas nahi, kyunki database se sirf server baat karta hai; teeno ek region me to har query tez. Render, Neon aur Atlas teeno me Singapore jaancha (RISKS §2.4). Owner ne Singapore chuna (2026-11-18).
- **Chhode vikalp:** Atlas Mumbai me (server se door, har query Singapore se Mumbai aur wapas); Render ka koi aur region.
- **Kab dobara khulega:** Render ya kisi provider me India ka region aaye, ya owner khole. Teeno ka region banne ke baad nahi badalta, isliye badalna = naya banana aur data le jaana.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** apps Vercel pe hain (D-048); customer app ke server-side hisse ka Vercel region (backend ke paas Singapore, ya users ke paas) technical charcha me tay hoga. Jod (2026-11-20): R1 me server-side rendering nahi (D-290), to R1 me region ka sawal nahi.
- **Jod (owner, 2026-11-20, D-256):** card aur UPI ka data sirf gateway ke paas, hamare paas sirf ids, rakam aur status; gateway se likhit pakka ki payment data India me rehta hai; asli business se pehle region dobara dekhne ki yaad COMPLIANCE me. Faisla waisa hi.

### D-059. Pehle diye gaye roles ki jaanch nahi

- **Faisla:** pehle ke system me jo roles diye ja chuke the, unki jaanch nahi hogi.
- **Wajah:** Claude ki salah: naya system naye sire se banega (D-003), isliye pehle diye gaye roles ka uspe koi asar nahi; naye system me har role apne module ke saath chalu hoga (D-017, D-054). Owner ne maani.
- **Chhode vikalp:** roles chalu karne se pehle, pehle ke system me diye gaye roles dekhna.
- **Kab dobara khulega:** pehle ke system se koi data naye system me laana tay ho, ya owner khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.

### D-060. Warehouse me rakhe maal ka maalik

- **Faisla:** brands ka jo maal hamare warehouse me rakha hai (D-014), bikne tak uska maalik wahi brand (seller) hai. Beautinique maal nahi khareedta: hum sirf rakhte, pack karte aur customer tak pahunchate hain, aur iske liye fees lete hain. Apna brand bhi isi tarah, kyunki wo alag company ka seller hai (D-031).
- **Wajah:** Claude ki salah, owner ne maani: customer ka invoice seller ke GSTIN se banta hai (D-030), aur jo maal ka maalik nahi wo uska invoice nahi kaat sakta; warehouse wale state ka GSTIN brand ke paas hone ki shart (D-036) bhi isi pe tiki hai. Har cheez ka ek hi raasta: har batch pe uske seller ka record, har bikri ka invoice usi seller ka.
- **Chhode vikalp:** Beautinique maal khareed le (customer invoice Beautinique ka, D-030 se takrav); dono tarah (kuch brands ka maal hamara, kuch ka unka).
- **Kab dobara khulega:** Beautinique khud maal khareed ke bechna chahe, ya owner khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** stock ke har batch pe uske seller ka record; seller ko apne maal ki ginti dikhe; warehouse me hamare haath se hua nuksaan (toot-foot, chori, galat dispatch) hamari zimmedari; bharpai ka daam D-063 me. Kanooni detail jaanchi nahi (R-004).

### D-061. Selling price kaun tay kare

- **Faisla:** customer ko dikhne wala selling price brand (seller) tay karta hai. Platform ye 4 niyam laagu karta hai:
  1. Daam 0 se zyada, aur pack pe chhape MRP (saare tax samet) se zyada nahi.
  2. Har badlav ka itihaas: kisne, kab, purana daam, naya daam.
  3. Ek baar me bada badlav (jaise 50% se zyada upar ya neeche) pe seller se dobara confirm, taaki ₹1,999 ki jagah ₹199 jaisi galti pakdi jaye.
  4. Platform seller ka daam kabhi nahi badalta; platform ka diya discount (R2, D-055) alag dikhta hai.
- **Jod (owner, 2026-11-19, D-231, D-236):** batch pe revised MRP ho to niyam 1 ki seema usi se (D-231); 10 g ya 10 ml tak ke packs tabhi list jab pack pe MRP chhapa ho (D-236).
- **Wajah:** Claude ki salah, owner ne maani: maal aur invoice dono brand ke (D-060, D-030), isliye daam bhi bechne wale ka; niyam 1 se 3 customer aur seller dono ko galti se bachate hain.
- **Chhode vikalp:** brand poori tarah azaad (sirf MRP ki seema, koi itihaas ya confirm nahi); Beautinique daam tay kare (invoice brand ka par daam hamara).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** bade badlav ka asli number pricing ki charcha (B4) me tay hoga. Alag batches ka MRP D-064 me, aur Beauty Pro buyers ka daam D-065 me. Kanooni detail jaanchi nahi (R-004).

### D-062. Expire hone wala ya na bika maal

- **Faisla:** warehouse me brand ka jo maal expire hone wala hai, expire ho gaya, ya nahi bik raha, uska nuksaan brand ka hai. Platform ye 6 niyam laagu karta hai:
  1. **Receiving pe:** batch ki bachi expiry ek kam se kam seema se kam ho to maal wapas.
  2. **Bikri band:** bachi expiry ek seema se kam hote hi wo batch bikna band, taaki customer ko kam se kam itni expiry mile. Pick me sabse pehle expire hone wala batch pehle jaata hai.
  3. **Khabar:** brand ko bikri band hone se pehle alert, aur band hone pe dobara.
  4. **Brand ka chunaav:** bikri band hone ke baad brand tay din me chune: maal apne kharche pe wapas le jaaye, ya hum nasht karein aur disposal fee lein. Tay din me jawab na aaye to hum nasht karte hain aur fee lagti hai.
  5. **Na bika maal (expire nahi):** brand kabhi bhi apne kharche pe wapas maang sakta hai.
  6. **Record:** har wapsi aur har disposal ka record (batch, ginti, tareekh, kisne kiya); disposal kanoon ke hisaab se (dummy, D-026).
- **Jod (owner, 2026-11-19, D-232):** seemaayein batch ke expiry ke roop ("Use before" ya "Expiry") se bane aakhri din se.
- **Wajah:** Claude ki salah, owner ne maani: maal brand ka (D-060), isliye nuksaan bhi; niyam warehouse ko saaf aur customer ko surakshit rakhte hain. Brand chahe to bikri band hone se pehle khud daam ghata sakta hai (D-061 ke niyam ke andar).
- **Chhode vikalp:** brand khud sambhale, platform ke koi niyam nahi (sirf report); nuksaan baant lena (platform kuch hissa uthaye ya khareed le).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** teeno numbers (receiving ki seema, bikri band ki seema, brand ke jawab ke din; misaal 6 mahine, 3 mahine, 15 din) B3 ki charcha me tay honge, category ke hisaab se alag ho sakte hain. Disposal fee aur wapsi ka kharcha seller ke hisaab (B6) me. Storage fee D-066 me, product page pe expiry D-067 me, aur teeno numbers D-082 me. Kanooni detail jaanchi nahi (R-004): label pe expiry ke niyam aur cosmetics nasht karne ke niyam.
- **Jod (owner, 2026-11-20, D-256):** nasht sirf authorised handler se; certificate of destruction batch ke record me; jalne wala maal alag.

### D-063. Hamare haath se hue nuksaan ki bharpai

- **Faisla:** brand ka maal hamari zimmedari me toot jaaye, kho jaaye ya chori ho, to brand ko utni bharpai milti hai jitna use bikne pe milta. Zimmedari receiving pe maal accept hone se customer ko delivery (ya brand ko wapsi) tak: warehouse, warehouse aur hub ke beech ka safar, hub aur delivery partner. Receiving se pehle ka nuksaan aur expiry ka nuksaan (D-062) brand ka. Niyam:
  1. **Daam:** nuksaan ke din ka selling price aur pichhle 30 din ka sabse kam selling price (D-061 ke itihaas se), dono me jo kam ho; usme se hamara commission aur fees ghata ke.
  2. **Record:** har nuksaan ka record: kab, kahan (warehouse, safar, hub, delivery), kisne pakda, batch, ginti; seller ko apne panel me dikhe.
  3. **Bharpai:** seller ke hisaab me credit, record banne ke baad agle payout me. Toota maal nasht, D-062 ke record ke saath.
  4. **Baad me mil gaya:** gum hua maal baad me mile aur bikne layak ho, to bharpai wapas kat-ti hai aur maal phir stock me.
  5. **Seller ka daawa:** seller ki ginti hamari ginti se na mile to wo support se daawa kar sakta hai (B11).
- **Wajah:** Claude ki salah, owner ne maani: brand ki haalat waisi hi jaisi bikne pe hoti; zaroori data pehle se hai (D-061); 30 din ke sabse kam daam se nuksaan se theek pehle daam badha ke zyada bharpai lena kaam nahi karta.
- **Chhode vikalp:** MRP pe (brand ko bikne se bhi zyada, hamara nuksaan bada); brand ka bataya cost (jaanchna mushkil, har batch pe ek aur field).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** 30 din ki khidki aur payout ka cycle settlement ki charcha (B6) me pakke honge. Transporter ya delivery partner se vasooli D-068 me, aur payout ka cycle D-081 me. Kanooni detail jaanchi nahi (R-004): bharpai pe GST, aur kho gaye maal ka brand ke tax me hisaab.
- **Jod (owner, 2026-11-18, D-112):** return pickup ke scan se warehouse ki receiving tak bhi maal hamari zimmedari hai.
- **Jod (owner, 2026-11-18, D-125):** niyam 1 ka "selling price" sirf normal daam ka itihaas hai; Pro daam (D-065) ginti me nahi.
- **Jod (D-276, 2026-11-20):** niyam 1 ka "bikne wala daam" GST ke bina wali value hai, commission aur fees ghata ke; bharpai seller ke statement me ek net line, uspe fees ka alag invoice nahi.

### D-064. Alag batches ka alag MRP

- **Faisla:** ek product ke alag batches ke pack pe alag MRP ho, to site pe usi batch ka MRP dikhta hai jo agla bhejna hai (D-062 ka kram: sabse pehle expire hone wala pehle), aur order usi batch se reserve hota hai. Niyam:
  1. Seller ka ek hi daam (D-061), jo kisi bhi bikne layak batch ke MRP se zyada nahi ho sakta.
  2. Naya batch aaye aur uska MRP seller ke daam se kam ho, to wo batch tab tak nahi bikta jab tak seller daam na ghataye; seller ko alert. Platform daam khud nahi badalta (D-061 niyam 4).
  3. Customer ne jo MRP dekha, wahi batch jaata hai.
  4. Ek line ki quantity do batches me bate aur MRP alag ho, to checkout pe line do hisson me dikhti hai, har hissa apne MRP ke saath (daam wahi).
  5. Invoice me har line ka batch aur MRP.
- **Jod (owner, 2026-11-19, D-231, D-234):** batch ka revised MRP (D-231); chhote pack ya soap pe batch na ho to platform ka batch id (D-234).
- **Wajah:** Claude ki salah, owner ne maani: site pe dikha MRP aur customer ke haath me aaya pack hamesha same, jo online pe pack ki jaankari dikhane ke kanoon ki maang hai; batch ka record (D-062) pehle se ban raha hai, to reservation ko batch tak le jaana chhota kaam hai.
- **Chhode vikalp:** ek MRP, saare batches me sabse kam wala (site aur pack ka MRP kabhi alag); har MRP ki alag listing (customer ke liye confusing, search aur reviews do jagah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** stock aur reservation batch ke level pe; batch badalte hi site ka MRP badalta hai; cart aur checkout me line ka batch-wise hissa (B5). Kanooni detail jaanchi nahi (R-004): online pe pack ki jaankari dikhane ke niyam.
- **Jod (owner, 2026-11-18, D-124):** "agla bhejne wala batch" = bikne layak batches me sabse pehle expire hone wala; niyam 2 me ruka batch ginti me nahi.

### D-065. Beauty Pro buyers ka daam

- **Faisla:** seller chahe to kisi product pe ek alag Pro daam rakh sakta hai, jo sirf jaanche hue (verified) Beauty Pro buyers (D-032) ko dikhta hai. Niyam:
  1. Pro daam normal daam se zyada nahi, aur D-061 ke saare niyam (MRP ki seema, itihaas, bade badlav pe confirm) is pe bhi.
  2. D-064 ka batch wala MRP niyam is pe bhi.
  3. Seller Pro daam na rakhe to Pro buyer ko normal daam.
  4. Pro buyer ko uske GSTIN wala invoice, taaki wo tax credit le sake.
- **Wajah:** Claude ki salah, owner ne maani: daam bechne wale ka hi rehta hai (D-061), platform pe koi kharcha nahi, aur seller apne trade price ke hisaab se khud tay karta hai.
- **Chhode vikalp:** sabke liye ek daam (farak sirf GSTIN wala invoice); platform ka tay % Pro discount (platform ka kharcha, har brand pe ek jaisa).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** Beauty Pro ke kaam R2 se (D-055), par catalog aur cart ka design pehle din se do daam sambhale: product page aur cart me daam kharidaar ke hisaab se. Kam daam pe khareed ke aage bechne ka khatra: Pro buyer ki jaanch D-069 me, aur quantity ki seema D-070 me. Kanooni detail jaanchi nahi (R-004): kharidaar ke hisaab se alag daam ke niyam.

### D-066. Na bike maal pe storage fee

- **Faisla:** brand ka jo maal (expire nahi hua) warehouse me pada hai, uska har batch receiving ke baad tay din tak muft rehta hai (misaal 90 din). Uske baad har mahine storage fee lagti hai, jo jitna purana maal utni zyada ho sakti hai. Niyam:
  1. Fee shuru hone se pehle brand ko alert, taaki wo chahe to maal wapas le jaaye (D-062 niyam 5).
  2. D-062 me expiry ki wajah se bikri band hue batch pe ye fee nahi; us pe D-062 ke niyam.
  3. Fee seller ke hisaab me kat-ti hai (B6), har batch ke hisaab ke saath.
  4. Muft din aur fee ki rakam settlement ki charcha (B6) me tay.
- **Wajah:** Claude ki salah, owner ne maani: theek se bikne wale maal pe koi kharcha nahi, aur dead stock pe wajah banti hai ki brand utna hi bheje jitna bikta hai.
- **Chhode vikalp:** koi storage fee nahi (warehouse dead stock se bhar sakta hai, kharcha hamara); pehle din se har maal pe har mahine fee (chhote brands ke liye bhaari).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** har batch ki umar (receiving ki tareekh se) ka hisaab aur mahine ki fee ka calculation. Bachi fee (udhaar) D-071 me.

### D-067. Product page pe expiry

- **Faisla:** customer ko kharidne se pehle us batch ki expiry (mahina aur saal, jaise pack pe hota hai) dikhti hai jo use bheja jayega: product page, cart aur checkout pe. Niyam:
  1. D-064 ki tarah: agla batch badle to dikhi expiry bhi badalti hai.
  2. Ek line do batches me bate to har hissa apni expiry ke saath (D-064 niyam 4 jaisa).
  3. Order ki detail aur invoice me har line ka batch aur expiry.
- **Wajah:** Claude ki salah, owner ne maani: customer ko wahi dikhe jo use milega; D-064 ke saath data wahi, sirf ek aur field.
- **Chhode vikalp:** exact expiry nahi, sirf "kam se kam X mahine" ka vaada (D-062 ki seema); dono (product page pe vaada, cart aur order me exact).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** jis batch ki expiry kareeb ho (bikri band ki seema ke upar par kam), use customer chhod sakte hain; wo dheere bikega aur brand ke liye D-062 ki wapsi ya disposal badh sakti hai. Brand chahe to aise batch pe daam ghata sakta hai (D-061). Kanooni detail jaanchi nahi (R-004): online pe expiry dikhane ke niyam.

### D-068. Transporter ya delivery partner se nuksaan ki vasooli

- **Faisla:** jo nuksaan transporter (D-027) ya delivery partner (D-033) ke paas hua, aur jiski bharpai hum brand ko dete hain (D-063), uski vasooli sirf saboot ke saath hoti hai. Niyam:
  1. **Transporter:** seal toota ho, ya hub pe manifest se kam maal mile, to nuksaan transporter ke bill se kat-ta hai (contract ka niyam).
  2. **Delivery partner:** kaat sirf jaanch ke baad, jab saboot ho ki galti unki hai (jaise parcel unhe scan karke diya gaya, aur na delivery ka saboot, na wapsi). Ek baar me aur mahine me kaat ki seema. Partner ko apna paksh rakhne ka mauka, aur faisla staff ka, apne aap nahi.
  3. Baar-baar aisa ho to kaat badhane ki jagah partner ka account rokna (staff ke faisle se).
  4. Har maamle ka record: kya hua, saboot, faisla, kisne kiya.
- **Wajah:** Claude ki salah, owner ne maani: transporter ek business hai aur saboot pehle se hai (D-027 ka trip record); delivery partner gig partner hain, isliye sakhti sirf saboot pe, seema ke andar, aur unki baat sun ke.
- **Chhode vikalp:** koi vasooli nahi (nuksaan aur dhokha dono hamare sir); hamesha poori vasooli (galat kaat ka khatra, partners chhod sakte hain).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** kaat ki seema (ek baar aur mahine me) D-103 me, aur partner ki kamaai D-104 me; jaanch ka tareeka logistics (B1) ki charcha me. Transporter ke contract me ye niyam. "Parcel nahi mila" ka jhagda D-072 me. Kanooni detail jaanchi nahi (R-004): gig partners ki kamaai se kaat ke niyam.

### D-069. Beauty Pro buyer ki jaanch

- **Faisla:** koi customer Beauty Pro (D-032; jise Pro daam dikhta hai, D-065) tab banta hai jab wo ek saboot de aur staff use jaanch ke manzoor kare. Niyam:
  1. **Saboot (koi ek):** GSTIN, ya business ka registration (jaise Udyam, dukaan ka licence), ya freelancer ke liye beauty course ka certificate. Sab dummy (D-026).
  2. **GSTIN alag:** GSTIN ho to GSTIN wala invoice (D-065 niyam 4); na ho to Pro daam milta hai par normal invoice.
  3. **Muddat:** Pro darja ek tay muddat (misaal 1 saal) ke liye; phir dobara saboot.
  4. **Staff hata sake:** galat istemaal (jaise bahut zyada maal le ke aage bechna) pe staff Pro darja hata sakta hai, wajah ke record ke saath.
  5. **Dastavez private:** saboot sirf jaanch karne wale staff ko dikhta hai, kisi public link se nahi.
- **Wajah:** Claude ki salah, owner ne maani: D-032 ke saare professional (GSTIN ke bina wale freelancer aur home-based bhi) aa sakte hain, aur jaanch staff ke haath me rehti hai, to Pro daam ka galat istemaal kam hota hai.
- **Chhode vikalp:** sirf GSTIN (freelancer aur home-based bahar; kisi bhi business ka GSTIN chal jaata); koi jaanch nahi (Pro daam sabke liye khul jaata, D-065 ka matlab khatam).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** jaanch kaunsa staff role karega, wo roles ki list (D-017) me; muddat ka asli number Beauty Pro ki charcha me. Dastavez kaise rakhein aur kaun dekhe, ye Security Architect ke saath (B14). Beauty Pro ke kaam R2 se (D-055). Kanooni detail jaanchi nahi (R-004): dastavez rakhne aur personal data ke niyam.

### D-070. Pro daam ki quantity seema

- **Faisla:** seller chahe to kisi product pe Pro daam (D-065) ki seema rakh sakta hai: ek order me, aur mahine me, har Pro buyer ke liye. Niyam:
  1. Seema seller ki marzi: na rakhe to koi seema nahi.
  2. Seema se upar ki quantity normal daam pe milti hai (rokte nahi). Cart me line do hisson me dikhti hai: Pro daam wala hissa aur normal daam wala (D-064 ke batch wale hisson jaisa).
  3. Staff ko report: har Pro buyer ka mahine ka total, product ke hisaab se, taaki D-069 niyam 4 ke liye saboot rahe.
- **Wajah:** Claude ki salah, owner ne maani: seller apne product aur trade ki zaroorat jaanta hai, aur seema se upar rok ki jagah normal daam se kharidaar ka kaam bhi nahi rukta.
- **Chhode vikalp:** koi seema nahi (aage bechna tab pakda jaata jab nuksaan ho chuka); platform ki ek seema saare products pe (kahin bahut kam, kahin bahut zyada).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** cart me ek line ke hisse do wajah se ban sakte hain (batch, D-064, aur Pro ya normal daam); dono saath sambhalne ka design cart ki charcha (B5) me. Beauty Pro ke kaam R2 se (D-055).

### D-071. Seller pe bachi fee (udhaar)

- **Faisla:** kisi seller ki fees (commission, storage fee D-066, disposal fee D-062, wapsi ka kharcha) uski bikri se zyada hon, to bachi fee seller pe udhaar ki tarah aage chalti hai. Niyam:
  1. Udhaar agle payout se pehle kat-ta hai.
  2. Udhaar tay rakam ya tay din (misaal ₹5,000 ya 60 din) se zyada ho to seller ko alert, aur payment link se chukane ka mauka (test mode, D-026).
  3. Phir bhi na chukaye to notice ke baad naya maal bhejna band aur seller ki listings ruk jaati hain.
  4. Lambe samay tak na chukaye to account band, aur maal brand ke kharche pe wapas (D-062 jaisa); wapsi ka kharcha bhi udhaar me.
  5. Har kadam ka record aur seller ko notice.
- **Wajah:** Claude ki salah, owner ne maani: chhote brand pe pehle din se bojh nahi (deposit nahi), aur udhaar ek seema se aage nahi badhta.
- **Chhode vikalp:** udhaar bas aage chale, aur kuch nahi (udhaar badhta reh sakta); security deposit (judne me rukawat, deposit ka paisa sambhalna).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** rakam, din aur "lambe samay" ke number D-103 me. Seller ke hisaab me minus balance ka design finance me. Kanooni detail jaanchi nahi (R-004): seller pe udhaar ki vasooli ke niyam.

### D-072. "Parcel nahi mila" par "delivered"

- **Faisla:** delivery ke waqt saboot banta hai, aur customer ke "parcel nahi mila" ke daawe ka faisla usi saboot se hota hai. Niyam:
  1. **Delivery code:** har order ka ek code customer ke app aur email me. Delivery pe partner wo code Delivery app me daalta hai; sahi code = delivery pakki.
  2. **Code na mile** (customer ghar pe nahi, koi aur le raha): parcel ki photo aur delivery ke waqt partner ki location ka record.
  3. **Daawa:** customer tay samay me (misaal 48 ghante) daawa kare. Code se delivered: daawa nahi maana jaata. Sirf photo aur location: staff jaanch karta hai. Koi saboot nahi: customer ko refund ya dobara maal, aur D-068 ke hisaab se partner ki jaanch.
  4. **Record:** baar-baar daawa karne wale customer aur baar-baar aise maamle wale partner, dono ka record aur staff ko report.
- **Wajah:** Claude ki salah, owner ne maani: saboot delivery ke waqt hi ban jaata hai, to jhagde me faisla andaaze se nahi, saboot se hota hai, aur D-068 ki vasooli bhi saboot pe tik paati hai.
- **Chhode vikalp:** partner ka "delivered" hi sach (faisla andaaze pe); customer hamesha sahi (daawa aate hi refund; jhooth bol ke refund aasaan).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** Delivery app me code daalne, photo aur location ka kadam (R1 ka delivery saboot, [PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Photo aur location personal data hain: kitne din rakhein aur kaun dekhe, Security Architect ke saath (B14). Daawe ka samay D-148 me. Kanooni detail jaanchi nahi (R-004): photo aur location jaise personal data rakhne ke niyam. Jod (2026-11-20, D-301): "network nahi" is faisle ka "code na mile" wala raasta nahi; code wali delivery sirf online.
- **Jod (owner, 2026-11-18, D-077):** order alag parcels me jaaye to delivery code har parcel ka apna hota hai; tab niyam 1 ka "order ka code" parcel ka code hai.
- **Jod (owner, 2026-11-18, D-126):** niyam 1 ka email order confirmation ka email hi hai; delivery code usi me jaata hai.
- **Jod (owner, 2026-11-19, D-148):** niyam 3 ka samay: code se delivered pe 48 ghante, sirf photo aur location wali delivery pe misaal 7 din, dono "delivered" scan se.
- **Jod (owner, 2026-11-20, D-254):** partner ki location sirf "delivered" aur "fail" ke pal pe, lagatar tracking nahi; partner ke liye Delivery app me data notice aur consent.
- **Jod (owner, 2026-11-21, D-370):** niyam 2 me location na mile to D-351 ka apvaad; niyam 3 ka "refund ya dobara maal" R1 me sirf refund (D-122).

### D-073. Pehle ka kaam kab aur kaise hatega

- **Faisla:** pehle ka kaam (purana code aur purane docs, D-003) do kadam me hatega:
  1. Hatane se pehle ek git tag, taaki pura purana kaam ek command se mil sake.
  2. Purane docs: discovery khatam hone pe (Agent 2 aur Security Architect ke baad, planning stage shuru hone se pehle).
  3. Purana code: naya root setup (`package.json`, lint, CI) banne ke saath, implementation stage ka pehla kaam.
  4. Dono baar hatana owner ki haan se (destructive kaam), aur naye docs me iska koi zikr nahi (D-003).
- **Wajah:** Claude ki salah, owner ne maani: har hissa tab hatta hai jab uski zaroorat khatam hoti hai. Purane docs discovery tak agents ke kaam aate hain, aur purana code naye root setup tak hi rukawat hai; tag se kuch khota nahi.
- **Chhode vikalp:** abhi sab hatao (agents ko purana analysis git history se nikaalna padta); kabhi na hatao (confusion aur bhaari repo, D-003 ke khilaaf).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** pehle ke kaam se kya naye me aaye, wo D-074 me.

### D-074. Pehle ke kaam se kya naye me aaye

- **Faisla:** pehle ke kaam se lene layak cheezon ki ek chalti list discovery ke saath banti hai. Niyam:
  1. **Shuruaat:** repo analysis (pehla agent) ki shuruaati list.
  2. **Har agent (2 se 10):** apni report me ek hissa: apne area me pehle ke kaam se kya lene layak, kyun, aur naye docs me kahan jayega.
  3. **Kasauti:** cheez kisi pakki zaroorat ko hal kare, kisi tay faisle se na takraye, aur naye doc me naye vakya me likhi ja sake.
  4. **Owner ki haan:** har cheez apne area ke sawalon ke saath, ek-ek karke. Haan ho to sahi naye doc me naye vakya me (zaroorat ho to naya D-xxx), bina pehle ke kaam ke zikr ke (D-003); design tokens jaise values bhi poori naye doc me. Naya code naye doc se banta hai, pehle ke code se copy nahi.
  5. **Aakhri jaanch:** discovery ke aakhir me, purane docs hatne se pehle (D-073 niyam 2), Claude dekhe ki list ki har cheez ya to naye doc me hai ya chhodi gayi; kuch bacha ho to owner se.
- **Wajah:** Claude ki salah, owner ne maani: har cheez tab parkhi jaati hai jab uska area tay ho raha ho (jaise transactions database ke saath, tokens design ke saath), alag agent ka kharcha nahi, aur aakhri jaanch se kuch chhootta nahi.
- **Chhode vikalp:** koi list nahi (kya dekha aur kya chhoda, iska record nahi); alag agent abhi, poori list ek baar me (ek aur agent run, aur architecture aur database ke faislon se pehle parakh); planning stage me ek baar (tab tak purane docs hat chuke hote, cheezein der se aur git tag se aatin).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** Agent 2 se 10 ke prompt me "pehle ke kaam se lene layak" ka hissa zaroori. Lene layak cheezon ki list naye docs me nahi rehti (D-003): wo agents ki reports ke saath rehti hai, aur naye docs me sirf maani hui cheez naye roop me aati hai. Kanooni detail jaanchi nahi (R-004): pehle ke kaam ka koi bahar ka asset (font, icon, image) naye me aaye to uska license.

### D-075. Ek brand, ek seller

- **Faisla:** poore platform pe ek brand ka ek hi seller hota hai, aur brand ko pehla haq hai. Niyam:
  1. Ek brand ka ek hi seller: brand khud, ya brand ka ek authorised distributor (D-032).
  2. Distributor ke liye brand ka authorisation letter (dummy, D-026) aur staff ki jaanch.
  3. Brand khud aana chahe aur distributor pehle se ho: distributor ko notice, aur tay din (misaal 30 din) baad brand seller ban jaata hai. Product page aur reviews wahi rehte hain, sirf seller badalta hai. Distributor ka bacha maal uske kharche pe wapas (D-062 niyam 5 jaisa).
  4. Jaanch pe barcode se duplicate check: wahi barcode kisi aur seller ke paas ho to nayi listing rukti hai.
  5. Apna brand (D-031) bhi isi niyam me.
- **Wajah:** Claude ki salah, owner ne maani: brand ki authorisation ek hi baar jaanchni padti hai, brand ka saara maal aur reviews ek seller ke paas rehte hain, aur "kis seller ka kaunsa maal" ka jhagda nahi hota. Pehla haq brand ko, kyunki maal aur naam brand ka hai.
- **Chhode vikalp:** ek product ka ek seller, jo pehle aaye (ek brand ke products alag sellers me bat jaate, brand ka control kam); har product ka seller brand tay kare (staff ka kaam zyada, aur brand platform pe na ho to kaun tay kare, ye saaf nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** seller onboarding me brand authorisation ki jaanch ka kadam (staff role ki list, D-017, me). Product ka seller badalne ka flow chahiye, jisme product page aur reviews na toote. Notice ke din ka asli number seller ki charcha me. Naya state khulne pe (D-037) kisi brand ka wahan ka distributor alag ho to wo nahi aa sakta; tab ye niyam D-030 ke saath dobara dekhna padega. Kanooni detail jaanchi nahi (R-004): brand authorisation aur trademark ke niyam.

### D-076. Variants kin cheezon se

- **Faisla:** ek product ke variants kin cheezon se banenge, ye category ke hisaab se platform tay karta hai. Niyam:
  1. Har category ki variant wali cheezein platform tay kare (misaal: makeup me shade aur size; skincare me size; fragrance me size; hair colour me shade; bath & body me scent aur size).
  2. Seller sirf us category ki di hui cheezein chune; ek product pe zyada se zyada 2.
  3. Nayi cheez staff setting se jode, bina code change ya deploy.
  4. Jo farak formula badalta hai (jaise matte ya dewy finish, SPF 30 ya SPF 50, EDT ya EDP) wo alag product hai, variant nahi.
  5. Rating aur reviews product pe (saare variants ke saath), par har review pe uska variant (jaise shade) dikhe.
  6. "Pack of 2" jaisa variant nahi: wo bundle (promotions ki charcha, B4) ya brand ka alag product.
- **Wajah:** Claude ki salah, owner ne maani: har category ke products sahi dhang se fit hote hain, filters aur search ek jaise naam se chalte hain, aur formula ka farak alag product banne se ingredients aur claims sahi product pe rehte hain.
- **Chhode vikalp:** do tay cheezein (shade aur size) sab products pe (bath & body aur tools jaise products fit nahi hote); seller apni marzi ki cheezein banaye (filters aur search bigadte, staff ki jaanch mushkil).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** har variant ka apna MRP, batch, stock aur expiry (D-064, D-067). Category ki variant list kaunsa staff role sambhale, wo roles ki list (D-017) me; categories ki shuruaati list catalog ki charcha me. Reviews pe variant dikhana reviews ki charcha (B8) me; bundles promotions ke saath R2 se (D-055).

### D-077. Kai sellers wala order aur parcel

- **Faisla:** ek order me kai sellers ka maal ho to normal ek parcel jaata hai, aur alag parcel sirf majboori me. Niyam:
  1. Customer ko ek order number. Order ke andar do alag cheezein: seller ke hisse (invoice ke liye) aur parcel (delivery ke liye); dono ek doosre se bandhe nahi.
  2. Normal: poora order ek parcel me, andar har seller ka invoice.
  3. Alag parcel sirf majboori me: size ya wazan ki seema (misaal 5 kg) paar ho, ya koi item baaki ke saath tayyar na ho, taaki baaki maal na ruke.
  4. Har parcel ka apna delivery code (D-072 me jod).
  5. Customer ko order page pe dikhe: kitne parcel, aur kaunsa item kis parcel me.
- **Wajah:** Claude ki salah, owner ne maani: customer ko aam taur pe ek hi delivery milti hai, delivery ka kharcha kam rehta hai, aur bhaari ya adhoora order bhi sambhal jaata hai. Invoice aur parcel alag rakhne se ek ki wajah se doosra nahi badalna padta.
- **Chhode vikalp:** hamesha ek parcel (bhaari order nahi samata, ek item ruke to poora order rukta); har seller ka alag parcel (delivery ka kharcha aur partners ka kaam badhta, customer ko kai baar ghar pe rehna).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** saara maal ek warehouse me (D-014), isliye kai sellers ka maal ek saath pack hota hai. Wazan aur size ki asli seema delivery ki charcha (B1) me, delivery partner ki gaadi ke hisaab se. Wapsi aur return parcel ke hisaab se (B1, B7). Order, seller ke hisse aur parcel ka data model Database Architect ke saath. Kanooni detail jaanchi nahi (R-004): ek parcel me kai sellers ke invoices bhejne ke niyam.

### D-078. Seller ki fees aur commission ka aadhaar

- **Faisla:** seller se commission aur fulfilment fee li jaati hai, aur commission GST ke bina wali rakam (taxable value) pe lagta hai. Niyam:
  1. Category ke hisaab se % commission, item ki taxable value (GST ke bina) pe.
  2. Har unit pe tay fulfilment fee (misaal ₹25): rakhne, pack aur delivery ka kharcha.
  3. Saath me storage fee (D-066), disposal fee (D-062) aur wapsi ka kharcha, jaise pehle tay.
  4. Aage ki fees (jaise labelling ya return handling) ka dhaancha bane, par shuru me ₹0.
  5. Platform ki fees pe platform ka GST alag line me.
- **Wajah:** Claude ki salah, owner ne maani: fulfilment fee asli kaam ka kharcha dikhati hai (sasta product bhi utna hi pack hota hai), aur GST ke bina aadhaar seller ke liye seedha hai: GST rate badle to commission nahi badalta.
- **Chhode vikalp:** sirf commission (sasta product platform ke liye nuksaan ka); shuru se aur fees, jaise labelling, return handling aur suchna se farak pe penalty (chhote brand pe shuru me bojh); commission GST samet daam pe (GST pe bhi commission, aur rate badle to commission bhi badle).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** fees ki rakam (dummy) abhi tay nahi. Seller ke hisaab (finance, D-001) me har fee ki alag line, aur D-063 ki bharpai aur D-071 ke udhaar me yahi fees. Kanooni detail jaanchi nahi (R-004): commission aur fees pe GST, platform ka seller ko fees ka invoice.
- **Jod (D-275, D-277, 2026-11-20):** fulfilment fee fees invoice pe do lines me: handling 18%, delivery 5% bina ITC (D-275). Return pe fees wajah ke hisaab se wapas (D-277).

### D-079. Return ki wajahein aur "band" maal

- **Faisla:** hamari ya brand ki galti pe return hota hai, aur "man badla" sirf band maal pe. Niyam:
  1. Galti wali wajahein: transit me toota ya leak, pighla, galat item ya galat shade ya size, item kam, dikhayi gayi se pehle ki expiry (D-067), kharab (jaise pump nahi chalta), ya nakli hone ka shak (staff jaanch).
  2. "Band" = factory seal ya shrink wrap salamat, aur maal istemaal nahi hua.
  3. Listing pe seller batata hai ki product pe aisa seal aata hai ya nahi; staff listing ki jaanch me ise dekhta hai.
  4. Jis product pe seal aata hi nahi, us pe "man badla" return nahi (hygiene); galti wali wajahein phir bhi chalti hain.
  5. Khula maal jisme koi galti nahi: return nahi. Skin reaction ki shikayat ka raasta alag sawal hai.
- **Jod (owner, 2026-11-19, D-222):** "der se pahuncha" bhi return ki wajah hai.
- **Wajah:** Claude ki salah, owner ne maani: R1 ka "band ya kharab" isi ka saaf roop hai, aur listing ka seal wala field ek hi baar me hygiene ka sawal hal karta hai.
- **Chhode vikalp:** sirf galti pe return, man badla bilkul nahi (customer ke liye kadi); kuch khula maal bhi wapas, jaise "shade guarantee" (khula maal nasht, nuksaan bada, galat istemaal aasaan).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 ka return niyam ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1) ab isi se. Listing me "seal aata hai ya nahi" ka field (catalog). Pickup aur warehouse pe seal ki jaanch, aur lauta maal kahan jaaye, abhi tay nahi. "Nakli ka shak" ki jaanch kaunsa staff role kare, wo roles ki list (D-017) me. Kanooni detail jaanchi nahi (R-004): return policy dikhane ke niyam, aur khule cosmetics pe "no return" ki shartein.

### D-080. Return ki samay-seema

- **Faisla:** return ki samay-seema wajah (D-079) ke hisaab se alag hai. Niyam:
  1. Dikhne wali galti (toota, leak, pighla, item kam, galat item ya shade ya size): delivery ke 48 ghante tak (misaal), D-072 ke daawe jaisa.
  2. Kharab maal (jaise pump nahi chalta) aur dikhayi gayi se pehle ki expiry: 7 din tak (misaal).
  3. Man badla (sirf band maal, D-079): 7 din tak (misaal).
  4. Nakli hone ka shak: 7 din tak (misaal), staff ki jaanch ke saath.
  5. Samay-seema ke baad kisi batch me dikkat nikle to recall ka raasta (D-129).
- **Wajah:** Claude ki salah, owner ne maani: dikhne wali galti jaldi pakdi jaati hai, to saboot sach rehta hai; baaki wajahon me customer ko poora mauka milta hai, aur seller ka paisa bahut der nahi rukta.
- **Chhode vikalp:** sab wajahon pe ek hi samay, 7 din (transit ki galti ka daawa der se, saboot kamzor); sab pe 15 din (seller ka paisa der tak ruka, saboot kamzor).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Badla (owner, 2026-11-19, D-221):** muddatein invoice, order page aur policy page pe likhi; kharab maal, nakli ka shak aur galat item, shade ya size pe 30 din (misaal); niyam 1 ke 48 ghante sirf saboot ka niyam, baad ka daawa zyada jaanch ke saath.
- **Asar (Claude):** samay product page aur order page pe saaf dikhe (UX). Asli number abhi misaal hain; settings se badal sakein. Seller ka payable isi pe tika (D-081). Kanooni detail jaanchi nahi (R-004): return ki kam se kam samay-seema ke niyam (agar koi ho), aur kharab maal pe customer ke haq.

### D-081. Seller ka paisa kab payable, aur payout

- **Faisla:** bikri ka paisa seller ke liye return ki samay-seema ke baad payable hota hai, aur payout hafte me ek baar. Niyam:
  1. Ek line tab payable hoti hai jab uski sabse lambi return samay-seema (D-080, misaal 7 din) khatam ho aur us pe koi return khula na ho.
  2. Payout hafte me ek baar (misaal har Monday), pichhle hafte tak jo payable hua.
  3. Payout me se pehle udhaar (D-071) aur fees (D-078) kat-ti hain, aur bharpai (D-063) judti hai.
  4. Kam se kam payout rakam (misaal ₹100); usse kam ho to agle hafte me judti hai.
  5. Seller ko har line ki halat dikhe: kab payable hogi, aur kis payout me gayi.
- **Jod (owner, 2026-11-19, D-239):** income-tax TDS seller ke ledger me pehle credit pe (ya payment pe, jo pehle), payable ke din nahi; return pe ulat CA se.
- **Jod (owner, 2026-11-21, D-369):** niyam 1 ki muddat man badle wali return muddat (D-221 niyam 4, misaal 7 din); kharab maal ki lambi muddat me payable ke baad aayi return D-071 ke udhaar ke raaste.
- **Wajah:** Claude ki salah, owner ne maani: return ka khatra khatam hone ke baad hi paisa jaata hai, to returns se udhaar kam banta hai, aur hafte ka payout chhote brand ke liye bahut lamba intezaar nahi.
- **Chhode vikalp:** delivery ke din se payable (har return pe udhaar ka khatra); mahine me do baar payout (chhote brand ke liye lamba intezaar).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** finance (D-001) me har line ki halat: payable hone ka intezaar, payable, paid. R1 me payout haath se "paid" mark hota hai (D-055). Din aur rakam abhi misaal hain; settings se badal sakein. Payable ke baad koi daawa ya bharpai ulti pade to wo D-071 ke udhaar ke raaste. D-063 ka payout cycle ab yahi. Kanooni detail jaanchi nahi (R-004): marketplace pe seller ko payment ki samay-seema ke niyam (agar koi ho), aur payout pe GST TCS aur income-tax TDS kaatne ka samay.
- **Jod (D-280, 2026-11-20):** sellers ka TDS GST ke bina rakam pe, pehle credit (invoice) ke pal; return pe usi seller ki usi financial year ki agli bikri me adjust, saal badle to nahi; replacement pe nahi.

### D-082. Expiry ki seemaon ke number

- **Faisla:** D-062 ki expiry wali seemaayein ek default se chalti hain, aur category ke hisaab se badal sakti hain. Niyam:
  1. Default: receiving pe kam se kam 6 mahine bachi, aur bikri band jab 3 mahine se kam (misaal).
  2. Category ka override setting se, bina code change ya deploy (misaal: sunscreen aur actives jaise vitamin C serum 9 / 4 mahine; chhoti shelf life wale natural products 4 / 2 mahine).
  3. Brand ke jawab ke din sab pe ek (misaal 15 din).
  4. R1 me sirf default bhi chal sakta hai, par override ki setting pehle din se.
- **Jod (owner, 2026-11-19, D-232):** mahine expiry ke roop se bane aakhri din se gine jaate hain.
- **Wajah:** Claude ki salah, owner ne maani: samajhna aasaan hai, aur categories ka farak sambhal jaata hai.
- **Chhode vikalp:** sab pe ek seema (chhoti shelf life wale products ke liye kadi); shelf life ke % se (har batch pe kul shelf life chahiye, jo pack pe hamesha saaf nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** receiving ki jaanch (D-014) aur bikri band (D-062) inhi settings se. Customer ko kam se kam bikri band ki seema jitni expiry milti hai, aur product page pe exact expiry (D-067). Setting kaunsa staff role badle, wo roles ki list (D-017) me. Number abhi misaal hain. Kanooni detail jaanchi nahi (R-004): expiry ke kareeb ya expired cosmetics bechne ke niyam.

### D-083. Pack pe expiry date na ho to

- **Faisla:** batch ki expiry hamesha pack ki chhapi jaankari se aati hai. Niyam:
  1. Pack pe expiry ho to wahi.
  2. Expiry na ho par mfg date aur shelf life (mahine) chhapi ho, to system expiry nikale (mfg date + shelf life); staff receiving pe pack se jaanche.
  3. Sirf PAO wala (na expiry, na shelf life): receiving pe wapas.
  4. PAO ek alag field: product page pe customer ki jaankari ke liye, par expiry ka badal nahi.
- **Wajah:** Claude ki salah, owner ne maani: expiry andaaze se nahi, pack ki chhapi jaankari se aati hai, aur sahi products (mfg date + shelf life wale) bahar nahi hote.
- **Chhode vikalp:** sirf chhapi expiry (kuch sahi products bhi bahar); sirf PAO bhi chale, expiry andaaze se (andaaze ki expiry customer ko "exact" dikhti, D-067 ke khilaaf).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** receiving (D-014) pe batch ke fields: expiry, ya mfg date + shelf life, aur PAO. Nikali hui expiry pe bhi D-062, D-064, D-067 aur D-082 waise hi laagu. Kanooni detail jaanchi nahi (R-004): label pe expiry ya "use before" date ke niyam.

### D-084. Seller aur listing ki jaanch ka daayra

- **Faisla:** seller ki manzoori aur listing ki jaanch poore desh ki team karti hai, state ke hisaab se nahi. Niyam:
  1. Seller Ops (D-044) ki ek team saare sellers manzoor kare; har naye warehouse state ke GSTIN ki jaanch usi queue me alag kaam.
  2. Listing ki jaanch bhi ek team, kaam category ke hisaab se bata hua.
  3. Appeal: jisne reject kiya, wo us appeal ka faisla nahi karta.
- **Wajah:** Claude ki salah, owner ne maani: abhi ek hi warehouse state hai, aur ek product ek hi baar jaanchna chahiye, chahe wo kitne bhi states me bike.
- **Chhode vikalp:** seller state ke hisaab se aur listing poore desh ki (ek seller ko alag-alag log jaanchte); dono state ke hisaab se (ek product kai baar jaanchna).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** staff permissions ka daayra poora desh, category ke hisaab se queue; roles ki list (D-017) me. States badhne pe team pe bojh badhega; tab ye faisla dobara dekh sakte hain.

### D-085. Shade ki jaankari

- **Faisla:** shade wale variant (D-076) pe seller ko ye jaankari deni hoti hai. Niyam:
  1. Har shade pe naam + swatch photo + hex colour.
  2. Complexion products (foundation, concealer, compact, tinted moisturiser) pe undertone (warm, cool, neutral, olive) aur depth (misaal 6 star: fair, light, medium, tan, deep, very deep) bhi zaroori.
  3. Lip aur eye products pe shade family (jaise nude, pink, red, berry, brown).
  4. Finish, coverage aur alag skin tones pe photo optional.
  5. Staff jaanch me swatch aur hex ka mel moota-moota dekhe.
- **Wajah:** Claude ki salah, owner ne maani: filter aur aage ka shade finder sahi data pe chalte hain, aur chhote brand pe bojh bahut zyada nahi.
- **Chhode vikalp:** sirf naam aur swatch photo (filter aur shade finder kamzor); finish, coverage aur skin tones ki photo bhi zaroori (chhote brands ke liye rukawat).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** fields R1 me; shade finder aur try-on R2 se (D-055). Shade family ka filter R1 ke basic filter me.

### D-086. HSN aur GST rate

- **Faisla:** HSN aur GST rate platform ki ek tareekh wali table se aate hain. Niyam:
  1. Table me har HSN ka rate tareekh ke saath (kis din se kaunsa rate).
  2. Seller category ke allowed HSN me se chune; rate table se aaye; staff jaanche.
  3. Rate badle to table me nayi line nayi tareekh se; us din se naye invoices naye rate pe.
  4. Rate badalne pe sellers ko alert ki apna daam dekh lein (daam platform nahi badalta, D-061).
  5. Sahi HSN ki zimmedari seller ki, kyunki supplier wahi hai (D-030).
- **Jod (owner, 2026-11-19, D-239):** table ki row = HSN + description ki shart + rate + tareekh; seller row chune.
- **Wajah:** Claude ki salah, owner ne maani: typo se galat tax nahi lagta, rate badalne ka hisaab ek hi jagah rehta hai, aur zimmedari seller pe rehti hai.
- **Chhode vikalp:** seller dono bhare (typo se galat tax aur invoice); platform category se HSN khud lagaye (alag HSN wala product atak jaata).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** rate se GST ke bina wali rakam nikalti hai, jis pe commission (D-078). Table kaunsa staff role sambhale, wo roles ki list (D-017) me. Kanooni detail jaanchi nahi (R-004): cosmetics ke HSN aur rates, aur rate badalne pe MRP aur purane stock ke niyam.

### D-087. Daam ke bade badlav ki seema

- **Faisla:** D-061 niyam 3 ka "bada badlav" ye hai. Niyam:
  1. Daam neeche 30% se zyada, ya upar 50% se zyada badle (misaal), to seller se dobara confirm.
  2. Naya daam MRP ke 20% (misaal) se kam ho to hamesha confirm, chahe pichhla daam kuch bhi ho.
  3. Pro daam (D-065) pe bhi yahi niyam.
- **Wajah:** Claude ki salah, owner ne maani: neeche ki galti zyada nuksaan wali hai, aur MRP wala check tab bhi pakadta hai jab pichhla daam bhi galat tha.
- **Chhode vikalp:** 50% dono taraf (neeche ki galti der se pakdi jaati); sirf alag-alag seema, MRP check ke bina.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** number abhi misaal hain; settings se badal sakein. Sach me bahut saste product pe seller ko har baar confirm karna padega.

### D-088. Kits aur combos

- **Faisla:** kits aur combos is roop me bikte hain. Niyam:
  1. Brand ka pack kiya kit R1 se hi, normal product ki tarah: ek barcode, ek MRP. Kit ki expiry = sabse pehle expire hone wali cheez ki; kit ki cheezon ki list product page pe.
  2. Combo: "A + B saath me ₹X", sirf ek hi seller ke products ka.
  3. Combo me stock har cheez se ghatta hai; combo ka daam cheezon me baanta jaata hai, aur invoice me har cheez ki line apne batch aur expiry ke saath.
  4. Combo poora lautta hai; ek cheez kharab nikle to sirf usi ka badla ya refund.
  5. Combo R2 se (promotions ke saath, D-055).
- **Badla (owner, 2026-11-19, D-228):** niyam 3 ka "daam baantna" combo pe abhi laagu nahi; combo ka tax CA ki salah ke baad. Brand ke kit pe kit ki cheezon ka sabse zyada rate default.
- **Wajah:** Claude ki salah, owner ne maani: brand ka kit R1 me bina naye kaam ke chal jaata hai, aur combo ek seller tak rehne se ek daam do invoices me nahi baantna padta.
- **Chhode vikalp:** sirf brand ka kit (combo ke liye seller ko naya barcode banana padta); alag sellers ke products ka combo (ek daam do invoices pe, aur return pe jhagda).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** D-076 niyam 6 ka "bundle" yahi combo hai. Combo ke return ke niyam returns ke baaki sawalon ke saath. Kanooni detail jaanchi nahi (R-004): kai cheezon ke set pe GST (mixed ya composite supply).

### D-089. Kam expiry wale batch ka label

- **Faisla:** jis batch ki expiry kareeb hai, us pe customer ko saaf label dikhta hai. Niyam:
  1. Bachi expiry ek seema (misaal 6 mahine) se kam ho to apne aap "short expiry" label.
  2. Brand chahe to apne ghataye daam ke saath use "clearance" section me daale.
  3. Ek waqt me ek hi batch dikhta hai (D-064), to label tabhi aata hai jab wahi batch agla bhejne wala ho.
  4. R2 se (promotions ke saath, D-055).
- **Wajah:** Claude ki salah, owner ne maani: customer ko saaf pata rehta hai, brand ko maal nikaalne ka raasta milta hai, aur daam phir bhi brand ka hi rehta hai (D-061 niyam 4).
- **Chhode vikalp:** kuch nahi, brand khud daam ghataye (nuksaan aur disposal zyada); platform apne aap discount de (D-061 niyam 4 se takrav).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** label ki seema D-082 ki bikri band wali seema se upar honi chahiye; dono settings me.

### D-090. Pick pe reserved maal toota ya kam

- **Faisla:** order ke baad reserved unit toota ya kam nikle to ye hota hai. Niyam:
  1. Usi variant ka doosra batch ho jiska MRP wahi ho aur expiry dikhayi gayi se barabar ya baad ki, to bina pooche badal do.
  2. Warna customer se poochho (in-app, email aur browser push), jawab ke liye tay samay (misaal 12 ghante).
  3. Jawab na aaye to wo line cancel aur refund.
  4. Toote maal ki bharpai seller ko D-063 se apne aap.
- **Wajah:** Claude ki salah, owner ne maani: customer ka order bina zaroorat nahi toot-ta, aur jo use dikha tha (MRP D-064, expiry D-067) usse kam kabhi nahi milta.
- **Chhode vikalp:** seedha line cancel (order bina zaroorat toot-ta); hamesha poochho (har baar der).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** pick ke waqt "badlo ya poochho" ka kadam warehouse app me. Refund ka raasta aur samay D-111 me.
- **Jod (owner, 2026-11-18, D-131):** niyam 2 ka email D-126 ke andar: browser push band ho to sawal email se bhi jaata hai.

### D-091. Normal customer ki quantity seema

- **Faisla:** normal customer (Beauty Pro nahi) ek order me ek variant ki platform ki default seema tak le sakta hai (misaal 10); seller chahe to apne product pe usse kam rakhe.
- **Wajah:** Claude ki salah, owner ne maani: har product pe ek seema rehti hai, aur seller apne product ke hisaab se use kam kar sakta hai.
- **Chhode vikalp:** koi seema nahi (ek order se stock khatam ho sakta); seller tay kare, default koi nahi (zyada products pe seema nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 me ek saral check cart aur checkout pe. Bade kharidaar ke liye Beauty Pro (D-069, D-070) ka raasta.

### D-092. Bina Pro bane GSTIN wala invoice

- **Faisla:** normal customer bhi checkout pe apna GSTIN daal ke business invoice le sakta hai: GSTIN ka format check aur naam; Pro daam nahi; har seller ka invoice customer ke GSTIN ke saath. R2 se (Beauty Pro ke kaam bhi R2, D-055).
- **Jod (owner, 2026-11-19, D-239):** checkout pe GSTIN ke state code ka milaan aur chetavni ki doosre state ke GSTIN pe tax credit shayad na mile.
- **Wajah:** Claude ki salah, owner ne maani: business customer bina Pro bane sahi invoice le paata hai, aur format check se galat GSTIN ka jokhim kam rehta hai.
- **Chhode vikalp:** sirf Pro buyer ko (business customers bahar); staff ki jaanch ke baad (staff ka kaam aur der).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** invoice me customer ka GSTIN ek optional field; R1 ke invoice ka dhaancha ise pehle din se sambhale. Kanooni detail jaanchi nahi (R-004): B2B invoice aur us pe tax credit ke niyam.

### D-093. Customer ka paisa kis khaate me

- **Faisla:** customer ka saara payment (prepaid aur delivery pe UPI, D-034) platform ke ek payment gateway (Razorpay) account me aata hai. Finance me har seller ka hisaab, aur payout platform karta hai (R1 me haath se "paid", D-055). Design aisa ki baad me payment pe hi baantne (seller ke linked account) pe jaana pade to sirf payout ka tareeka badle, hisaab nahi.
- **Wajah:** Claude ki salah, owner ne maani: R1 ke liye saral, aur baad me raasta badalna pade to hisaab wahi rehta hai.
- **Chhode vikalp:** payment pe hi har seller ke linked account me baantna (linked accounts ka setup aur har seller ke bank ki jaanch); har seller ka apna gateway (ek checkout me sambhav nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** platform ke paas sellers ka paisa rehta hai (zimmedari); finance ke ledger aur milaan ka design Database Architect ke saath. Kanooni detail jaanchi nahi (R-004): marketplace ke liye payment aggregator aur sellers ka paisa rakhne ke niyam.
- **Jod (owner, 2026-11-20, D-256):** ledger me sellers ka paisa liability ki tarah alag dikhe; seller agreement me payout ke din.

### D-094. Fees ki shuruaati rakam (dummy)

- **Faisla:** fees ki shuruaati rakam (dummy, baad me setting se badle):
  1. Commission ka dhaancha category ka (D-078), par shuru me sab categories pe ek rakam (misaal 10%).
  2. Fulfilment fee ₹25 per unit (misaal).
  3. Storage: receiving ke 90 din muft, phir ₹2 per unit per mahina, 180 din ke baad ₹4 (misaal).
  4. Disposal fee ₹10 per unit (misaal); wapsi ka kharcha asli.
  5. Storage fee per unit; volume ke hisaab se baad me.
- **Wajah:** Claude ki salah, owner ne maani: R1 me setup saral, aur category ki alag rakam baad me bina code change ke.
- **Chhode vikalp:** shuru se category ke hisaab se alag commission (R1 me zyada setup); owner apni rakam de (owner ka samay).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** D-066 ke muft din aur fee, aur D-062 ki disposal fee ab yahi. Saari rakam settings me.

### D-095. Chargeback ka nuksaan

- **Faisla:** customer chargeback jeete to nuksaan wajah ke hisaab se. Niyam:
  1. Product ki shikayat (galat ya kharab maal, brand ki galti): seller.
  2. Delivery ya fraud ka maamla: platform.
  3. Delivery ka saboot mazboot ho (D-072 ka code), to platform dispute lade.
- **Wajah:** Claude ki salah, owner ne maani: nuksaan usi pe jiski galti, aur delivery ke saboot se jhoothe dispute ka mukabla ho sakta hai.
- **Chhode vikalp:** hamesha platform (galti brand ki ho tab bhi nuksaan platform ka); hamesha seller (galti delivery ki ho tab seller ke saath anyay).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se, kyunki test mode me chargebacks nahi aate (D-055). Seller ka hissa D-071 ke udhaar ke raaste.
- **Jod (D-280, 2026-11-20):** seller ki galti wale chargeback pe seller ka credit note; platform wale (fraud, delivery) pe credit note nahi, nuksaan platform ka kharcha; gateway ki kati rakam usi din Operating khaate se top-up.

### D-096. Maal aane ki pehle se suchna aur receiving

- **Faisla:** brand maal bhejne se pehle seller app me shipment ki suchna banata hai: variant, batch, expiry (ya mfg date + shelf life, D-083), har batch ka MRP aur ginti. Niyam:
  1. Receiving pe maal ka suchna se milan. Farak (kam, zyada, galat batch, toota aaya) seller ko photo ke saath report; seller tay din (misaal 7) me aitraaz kar sake.
  2. Jo maal accept nahi hua (toota aaya, ya expiry receiving ki seema se kam, D-082), wo brand ke kharche pe wapas, ya brand kahe to nasht aur fee (D-062 jaisa).
  3. Bina suchna aaya maal alag rakha jaata hai (hold), aur seller ko alert; tay din me suchna na bane to maal wapas.
  4. "Accept" = ginti aur jaanch poori hone pe staff ka accept scan. Hamari zimmedari (D-063) aur storage fee ki ghadi (D-066) isi pal se.
  5. Suchna me har batch ka MRP pehle se hota hai, to D-064 niyam 2 ka alert maal pahunchne se pehle hi seller ko mil jaata hai.
- **Wajah:** Claude ki salah, owner ne maani: farak pe jhagda nahi hota (dono ke paas ek hi suchna), aur har zimmedari ka shuruaati pal ek hi hai.
- **Chhode vikalp:** bina suchna (staff ki ginti hi record; farak pe jhagda); suchna + aane ka slot (warehouse ki capacity ke hisaab se booking; abhi scheduling ka bojh).
- **Kab dobara khulega:** sellers badhein aur slot chahiye ho, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 ke "maal warehouse me" ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1) me seller app ka shipment form aur Warehouse app me suchna se milan. Aitraaz aur hold ke din settings me.
- **Jod (D-280, 2026-11-20):** doosre state se aaye stock ke liye ASN me seller ka IGST invoice ya delivery challan aur e-way bill ka number; receiving pe ye document.

### D-097. Barcode ya platform ka label

- **Faisla:** variant pe brand ka barcode (EAN) ho to wahi chalta hai; barcode na ho to bhi product list ho sakta hai. Niyam:
  1. Barcode na ho to receiving pe har unit pe platform ka barcode label lagta hai (labelling fee, D-078 niyam 4; shuru me ₹0).
  2. Warehouse me ek bin me ek variant ka ek hi batch, taaki scan karke pick pe wahi batch jaaye jiska MRP aur expiry customer ne dekhi (D-064, D-067).
- **Jod (owner, 2026-11-19, D-230):** label sirf pack ki khaali jagah ya bahar ke polybag pe, kabhi likhawat pe nahi; receiving pe photo.
- **Wajah:** Claude ki salah, owner ne maani: ek warehouse aur kam sellers ke saath "ek bin, ek batch" sasta hai, aur bina barcode wale chhote brands bhi aa paate hain.
- **Chhode vikalp:** barcode zaroori (chhote brands ke liye rukawat); har unit pe platform ka label, variant aur batch ke saath (sabse pakka, par har unit pe mehnat).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** duplicate listing ki jaanch (D-075 niyam 4) barcode wale products pe barcode se, aur bina barcode wale pe staff ki jaanch se. Warehouse app me bin pe doosra batch rakhne se pehle scan pe rok.

### D-098. Listing ka content aur badlav ki jaanch

- **Faisla:** listing ka content (naam, description, images, ingredients, claims, declarations, net quantity) seller likhta hai. Niyam:
  1. Ingredients, claims, declarations, net quantity, category, images aur shade swatch ke har badlav pe dobara jaanch; jaanch tak purana version live.
  2. Baaki (description ke shabd, istemaal ka tareeka) turant live, baad me staff ka spot check.
  3. Staff khud koi field nahi badalta; sirf "ye badlo" wajah ke saath bhejta hai.
  4. Har version ka record: kisne, kab, kya badla.
- **Jod (owner, 2026-11-19, D-240):** seller agreement me content sahi hone ka undertaking, aur har listing submit pe checkbox, pehle se tick nahi.
- **Wajah:** Claude ki salah, owner ne maani: jokhim wale fields hamesha jaanch se guzarte hain, aur chhote badlav pe staff ka bojh nahi banta.
- **Chhode vikalp:** har badlav pe jaanch (staff pe bojh, seller ka intezaar); platform ki content team (content aur galti ki zimmedari hamari).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** jaanch D-084 ki team karti hai. Kanooni detail jaanchi nahi (R-004): listing ke galat claim ya jaankari ki zimmedari (seller ya platform).

### D-099. Ingredients aur allergens

- **Faisla:** ingredients aur allergens is tarah, aur teeno kadam R1 me. Niyam:
  1. Seller pack jaisi poori ingredients list text me de, aur pack ke label ki photo zaroori; staff photo se milaye. Product page pe poori list, chhupi hui nahi.
  2. Text se platform ki ingredient master list (INCI naam) ke hisaab se structured list semi-auto bane; staff jaanche.
  3. Structured list se free-from filters (jaise paraben-free, fragrance-free) aur allergen ki chetavni.
- **Jod (owner, 2026-11-19, D-235):** chhote pack ke label pe ingredients na hon to carton ki photo ya brand ki specification se milaan.
- **Wajah:** Claude ki salah (pehle text aur photo, structured list aur filters baad me) owner ne maani, aur kaha ki teeno kadam R1 me hon. Label ki photo se ingredients, declarations aur batch ka format ek saath jaanch hota hai, aur structured list se filters aur chetavni pehle din se data pe chalte hain.
- **Chhode vikalp:** sirf text + label photo (filters nahi); sirf structured list, seller har ingredient chune; structured list aur filters R2 me.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani; R1 me teeno kadam owner ka faisla.
- **Asar (Claude):** R1 ke catalog me INCI master list, text se milan aur filters ka kaam judta hai (D-055 me jod, [PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Master list ka shuruaati data aur staff role D-132 me. Kanooni detail jaanchi nahi (R-004): label aur online page pe ingredients aur allergens dikhane ke niyam.
- **Jod (owner, 2026-11-19, D-159):** niyam 3 ki allergen chetavni R1 me sab customers ko ek jaisi (product ke jaane-maane allergens); customer ki apni allergy ke hisaab se chetavni baad me.

### D-100. Product claims

- **Faisla:** claims ("vegan", "cruelty-free", "SPF 50 PA++++" jaise) platform ki tay list se. Niyam:
  1. Claims sirf platform ki tay list se; filters bhi sirf isi list se.
  2. SPF aur PA pe test report, organic pe certificate, cruelty-free pe certification, dermatologically tested pe test report (sab dummy, D-026); baaki claims seller ki khud ki ghoshna.
  3. Staff saboot jaanche; saboot ki expiry ho to reminder.
  4. Description ke free text me claim jaise shabd staff ki jaanch me.
  5. R1 me tay list + ghoshna, aur saboot sirf SPF ke liye; baaki saboot R2 se.
- **Wajah:** Claude ki salah, owner ne maani: filters sach pe chalte hain, aur sehat se jude claim (SPF) pe R1 se hi saboot.
- **Chhode vikalp:** free text, koi jaanch nahi (galat claims); tay list, par koi saboot nahi (sach ki jaanch nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** "paraben-free" jaisa claim D-099 ke ingredients se bane free-from filter se takraye (claim hai, par list me paraben), to staff ki jaanch me pakda jaaye. Saboot ke dastavez rakhne ki zimmedari Security Architect ke saath (B14). Kanooni detail jaanchi nahi (R-004): cosmetics claims aur galat vigyapan ke niyam.
- **Badla (owner, 2026-11-19, D-224):** niyam 5 badla: test ya asar wale claims (dermatologically tested, clinically proven, non-comedogenic, hypoallergenic, SPF aur PA) R1 se hi saboot ke saath; ghoshna wale claims jaise the.

### D-101. Offers ka paisa kaun de

- **Faisla:** offers aur coupons (R2, D-055) brand ke, platform ke, ya dono ke baante hue ho sakte hain. Niyam:
  1. Har offer pe brand aur platform ka hissa (%) tay. Platform ke hisse me seller ko poora daam milta hai, farak platform deta hai.
  2. Har offer ka budget; budget khatam hote hi offer apne aap band.
  3. R2 ki shuruaat brand ke aur platform ke offer se; baanta hua offer uske baad.
  4. R1 ki order line me "discount, kisne diya" ke khane, chahe khaali rahein.
- **Wajah:** Claude ki salah, owner ne maani: brand aur platform dono apne offer chala sakte hain, aur hisaab har line pe saaf rehta hai.
- **Chhode vikalp:** sirf brand (platform apni marzi ka offer nahi chala sakta); brand ya platform, baanta hua nahi.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** platform ka discount alag dikhta hai (D-061 niyam 4); invoice, commission (D-078) aur bharpai (D-063) ka hisaab niyam 4 ke khanon se. Kanooni detail jaanchi nahi (R-004): discount pe GST (bikri se pehle ya baad ka), aur platform ke diye discount ka invoice pe asar.

### D-102. Offers ka mel

- **Faisla:** R2 ke offers (D-055) me default: ek order pe ek coupon; sale daam + coupon chal sakta hai; Pro daam (D-065) pe coupon nahi. Har offer pe "kis ke saath chale" ki setting baad me.
- **Wajah:** Claude ki salah, owner ne maani: offers ka kharcha behisaab nahi badhta, aur Pro daam pe coupon na hone se aage bechne ka lalach kam rehta hai.
- **Chhode vikalp:** koi mel nahi, sirf sabse achha ek fayda (sale ke dino me coupon bekaar); shuru se har offer pe setting (staff ko har offer pe sochna).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.

### D-103. Udhaar aur kaat ki seemaayein

- **Faisla:** D-071 ke udhaar aur D-068 ki kaat ke numbers. Niyam:
  1. Seller ka udhaar ₹5,000 ya 60 din paar: alert + payment link.
  2. Uske 30 din baad (notice ke saath): naya maal aur listings band.
  3. Uske 90 din baad: account band.
  4. Delivery partner se kaat: ek maamle me zyada se zyada ₹500, mahine me ₹1,500 ya mahine ki kamaai ka 10%, jo kam ho.
  5. Saare number misaal; setting se badal sakein.
- **Wajah:** Claude ki salah, owner ne maani: chhote brand pe shuru me bojh nahi, aur udhaar ek seema se aage nahi badhta.
- **Chhode vikalp:** kadi (₹2,000 ya 30 din, phir 15 din, phir 45 din; chhote brand ke liye bhaari); narm (₹10,000 ya 90 din, phir 60 din, phir 180 din; udhaar bada hota jaata).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** D-071 ka "lambe samay" ab niyam 2 aur 3. Partner ki kamaai D-104 me. Kanooni detail jaanchi nahi (R-004): gig partner ki kamaai se kaat ke niyam.

### D-104. Delivery partner ki kamaai

- **Faisla:** gig delivery partner (D-033) ki kamaai har kaam pe. Niyam:
  1. Har delivered parcel pe tay rakam (misaal ₹30), har return pickup pe (misaal ₹25), aur fail koshish pe kam (misaal ₹10).
  2. Hafte me ek payout.
  3. R2 se; R1 me sirf record: kaunsa parcel kis partner ne, taaki baad me hisaab ban sake.
- **Wajah:** Claude ki salah, owner ne maani: saral hisaab, aur gig partners (D-033) ke saath mel.
- **Chhode vikalp:** har kaam + doori ka extra (doori ka hisaab; hubs ka ilaaka bade tab); ghante (shift) ke hisaab se (payroll jaisa, D-033 ke khilaaf).
- **Kab dobara khulega:** hubs ka ilaaka bada ho aur door ke pincode pe partner ka nuksaan dikhe, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** D-068 ki kaat isi kamaai se, D-103 ki seema ke andar. Partners ka payout finance me. Kanooni detail jaanchi nahi (R-004): gig partners ke niyam, unke payout pe TDS, aur aggregator ka contribution.
- **Jod (owner, 2026-11-20, D-254):** Social Security Code ke aggregator kaam: har partner pe portal ka number (dummy), roz ke kaam ka export (DUMMY), saal ke kaam ke din ki ginti, contribution ki provision (dar setting me, shuru hone ki tareekh notify hone tak band); payouts pe TDS (PAN encrypted, saal ka jod, seema paar pe kaat, statement me TDS).

### D-105. R1 me customer ke maamle

- **Faisla:** R1 me return ki manzoori, "parcel nahi mila" ka daawa (D-072) aur refund ki manzoori Support Desk app ke ek patle hisse me. Niyam:
  1. Ek role (misaal "Support Agent") sirf order dekhe, return manzoor ya reject kare, daawe ka faisla kare, aur refund shuru kare.
  2. Return request apne aap manzoor, jab wajah aur saboot poore hon; aakhri faisla warehouse ki jaanch pe.
  3. Tickets, SLA aur baaki support desk R2 me.
  4. R1 ke scope me ye chhota jod, owner ki haan se (D-055 me jod).
- **Wajah:** Claude ki salah, owner ne maani: kaam shuru se sahi app me hota hai (D-010), R2 me usi app me tickets judte hain, aur apne aap manzoori se staff ka kaam kam rehta hai.
- **Chhode vikalp:** Logistics Ops app me hub manager hi ye kaam karein (kaam galat app me, baad me hatana); kam se kam staff, daawe me sirf "bina code" wale maamle hub manager dekhe (galat daawe pe rok kam).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** Support Agent role R1 me chalu (D-017, D-054); [PROJECT_PLAN.md](PROJECT_PLAN.md) §1 me jod.
- **Jod (owner, 2026-11-19, D-147):** niyam 1 ke reject ke baad customer ek appeal kar sakta hai; faisla Support Lead role karta hai (jisne reject nahi kiya), jo R1 me chalu hai.

### D-106. Daawe ka saboot

- **Faisla:** toota, galat ya kam item ke daawe (D-079) me customer se photo zaroori. Niyam:
  1. Item ki, label pe batch number ki, aur damage ki photo.
  2. "Item kam" pe parcel aur packing ki photo.
  3. Unboxing video optional; staff maang sake.
  4. Hamari taraf ka saboot: warehouse pe pack ki photo.
- **Jod (owner, 2026-11-19, D-234):** jis pack pe batch nahi hota, us pe batch ki jagah pack aur label ki photo.
- **Wajah:** Claude ki salah, owner ne maani: saboot ka ek aasaan kadam, aur hamari pack ki photo se dono taraf ka saboot rehta hai.
- **Chhode vikalp:** koi saboot nahi (jhooth aasaan); ek rakam (misaal ₹1,500) se upar unboxing video zaroori (video sabko nahi aata, aur privacy ka sawal).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** customer ki photo aur video kitne din rakhein aur kaun dekhe, Security Architect ke saath (B14). Kanooni detail jaanchi nahi (R-004): customer ki photo aur video (ghar ya chehra aa sakta hai) rakhne ke niyam.

### D-107. Customer se delivery fee

- **Faisla:** order ki rakam ek seema se kam ho to delivery fee. Niyam:
  1. Seema se kam pe tay fee (misaal ₹499 se kam pe ₹49), area setting se; 0 bhi rakhi ja sake.
  2. Kai sellers ya kai parcel wale order (D-077) pe bhi ek hi fee, order pe.
  3. Product page aur cart pe pehle se "₹X se upar muft delivery" dikhe.
  4. Koi "platform fee" ya "packing fee" nahi.
- **Jod (owner, 2026-11-19, D-239):** fee ka SAC aur GST rate CA se tay; rate table me tareekh ke saath.
- **Wajah:** Claude ki salah, owner ne maani: asli jaisa (D-026), aur cancel, RTO aur return ke niyam isi pe saaf bante hain; seema 0 rakh ke muft bhi chala sakte hain.
- **Chhode vikalp:** hamesha muft (kharcha poora hamara, niyam baad me jodne padte); doori ya wazan ke hisaab se (customer ke liye samajhna mushkil).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** delivery platform ki seva hai, to fee ka invoice platform ka ho sakta hai (seller ke invoice se alag). Kanooni detail jaanchi nahi (R-004): delivery fee pe GST aur kiska invoice.
- **Jod (D-280, 2026-11-20):** delivery fee ka platform ka apna B2C invoice, SAC 996813, 1 Nov 2026 se 5% bina ITC; delivery ke kharchon ka ITC ulatna; prepaid order pe fee ka invoice payment capture ke pal.

### D-108. Delivery na ho paaye (RTO)

- **Faisla:** delivery fail ho to do koshish (misaal), phir parcel wapas warehouse (RTO). Niyam:
  1. Har fail pe wajah (ghar band, address galat, customer ne mana kiya), aur customer ko in-app, email aur browser push se khabar, agla din chunne ka option.
  2. Parcel hub pe zyada se zyada 3 din (misaal), phir RTO.
  3. Customer ne saaf mana kiya to doosri koshish nahi, seedha RTO.
  4. Prepaid ka poora refund RTO ka hub pe scan hote hi shuru (parcel tab bhi hamari zimmedari me, D-063).
  5. RTO maal warehouse me receiving jaisi jaanch ke baad stock me.
  6. Customer ki galti wale RTO pe delivery fee (D-107) wapas nahi.
- **Wajah:** Claude ki salah, owner ne maani: customer ko doosra mauka milta hai, aur refund warehouse pahunchne tak nahi rukta, kyunki parcel hamari zimmedari me hai.
- **Chhode vikalp:** ek koshish (chhoti galti pe order khatam); teen koshish, customer kabhi bhi din badle (kharcha aur hub ka bojh zyada).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** RTO ki jaanch D-096 jaisi. Refund ka raasta D-111 me. Hub pe parcel rakhne ki jagah aur din ki ginti Logistics Ops app me.
- **Jod (owner, 2026-11-18, D-126):** niyam 1 ki khabar in-app aur browser push se; email sirf tab jab customer ne browser push band rakha ho.

### D-109. Delivery pe UPI ke niyam

- **Faisla:** delivery pe UPI QR (D-034) seema ke saath. Niyam:
  1. Order ki zyada se zyada rakam (misaal ₹3,000); naye customer ke pehle order pe kam (misaal ₹1,500); area setting se on ya off.
  2. Jo customer aise order pe 2 baar (misaal) mana kare ya payment na kare, uske liye delivery pe UPI band; staff wajah ke saath khol sake.
  3. Door pe payment fail ho (network) to partner 10 minute (misaal) tak QR dobara dikhaye, phir "koshish fail" (D-108).
  4. Delivery code (D-072) payment ke baad hi.
- **Wajah:** Claude ki salah, owner ne maani: naye customer ko bhi raasta milta hai, aur mana karne ka nuksaan ek seema me rehta hai.
- **Chhode vikalp:** sab customers, koi seema nahi (mana karne ka nuksaan); sirf purane customers (naye customer ke liye rukawat).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.

### D-110. Customer cancel

- **Faisla:** customer pack hone se pehle poora order, ya ek-ek item ya quantity, cancel kar sakta hai. Niyam:
  1. Pack ke baad cancel nahi, sirf door pe mana (RTO, D-108).
  2. Koi cancel fee nahi.
  3. Cancel ke baad order muft delivery ki seema (D-107) se neeche aaye, to bhi baad me delivery fee nahi lagti.
  4. Prepaid ka refund turant; delivery pe UPI wale order me paisa liya hi nahi.
- **Wajah:** Claude ki salah, owner ne maani: customer ko poora order nahi todna padta, aur niyam saral aur saaf rehte hain.
- **Chhode vikalp:** sirf poora order, pack se pehle (customer ko poora order todna padta); ek-ek item, warehouse se nikalne tak (pack hua parcel kholna, galti ka mauka).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** refund aur stock wapas line ke hisaab se.

### D-111. Refund ka raasta aur samay

- **Faisla:** refund hamesha usi raaste jisse paisa aaya. Niyam:
  1. Razorpay refund; delivery pe UPI QR wala payment bhi usi raaste.
  2. Shuru hone ka samay: cancel pe turant (D-110), RTO pe hub scan pe (D-108), return pe warehouse jaanch ke baad (D-115).
  3. Refund fail ho (jaise account band) to staff ka haath ka raasta, aur customer ko khabar.
  4. Customer ko refund ki halat in-app aur email me dikhe.
- **Wajah:** Claude ki salah, owner ne maani: customer ka paisa usi raaste wapas jaata hai jisse aaya, aur bank details rakhne ka jokhim nahi.
- **Chhode vikalp:** original ya bank account (bank details jaisa sensitive data rakhna); default store credit (customer ka paisa platform pe atka; gift card aur store credit R2 me, D-055).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** saara paisa platform ke ek gateway account me (D-093), to refund bhi wahin se. Kanooni detail jaanchi nahi (R-004): refund ka samay (RBI ke niyam) aur store credit ke niyam.
- **Jod (owner, 2026-11-20, D-256):** "paisa kata, order nahi bana" ki screen aur email (bank ka samay, jaise UPI pe T+5); der se "captured" aaye to apne aap refund, sirf ek baar.

### D-112. Lauta maal kahan jaaye, aur nuksaan kiska

- **Faisla:** warehouse ki jaanch ke baad lauta maal wajah ke hisaab se jaata hai. Niyam:
  1. Band, seal salamat (D-079), batch wahi jo bheja tha, aur expiry bikri band ki seema (D-082) se upar: wapas bikne layak stock, usi batch me.
  2. Transit me toota ya leak (hamari zimmedari): nasht (D-062 ka record), brand ko D-063 se bharpai, customer ko refund.
  3. Galat item bheja (hamari pick ki galti): hamari zimmedari; lauta item jaanch ke baad stock me.
  4. Brand ki galti (defect, galat batch label, nakli ka shak sahi nikla): refund ka paisa aur wapsi ka kharcha seller ke hisaab se; maal brand ko wapas, ya brand ke kharche pe nasht (D-062 jaisa).
  5. Customer ki baat jaanch me galat nikle (khula maal "band" bata ke, ya batch alag): refund nahi; maal customer ko wapas (misaal ek baar hamare kharche pe).
  6. Return pickup ke scan se warehouse receiving tak maal hamari zimmedari (D-063 me jod).
  7. Seller ke panel me har return ka nateeja aur wajah; seller ko aitraaz ka raasta.
- **Wajah:** Claude ki salah, owner ne maani: har maamle me nuksaan usi ka jiski galti, band maal bekaar nasht nahi hota, aur return ke raaste me bhi zimmedari saaf rehti hai.
- **Chhode vikalp:** kabhi dobara stock nahi, har lauta maal brand ko ya nasht (brand ka nuksaan bada); dobara stock sirf brand ki haan se (brand ke jawab tak maal ruka).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 ki warehouse jaanch ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1) ka nateeja inhi saat raaston me se ek. Kanooni detail jaanchi nahi (R-004): lautaye band cosmetics ko dobara bechne ke niyam.

### D-113. Return pickup pe jaanch

- **Faisla:** return pickup ke waqt delivery partner jaanch karta hai. Niyam:
  1. Item ki photo le, aur label pe batch number ko order wale batch (D-064) se milaye.
  2. "Man badla" wale return me seal dekhe (D-079).
  3. Mel na khaye to pickup na le (wajah + photo), aur customer ko in-app, email aur browser push se khabar.
- **Jod (owner, 2026-11-19, D-234):** jis pack pe batch nahi hota, us pe platform ke batch id aur pack ki photo se milaan.
- **Wajah:** Claude ki salah, owner ne maani: galat maal warehouse tak nahi aata, aur Delivery app me photo ka kadam pehle se hai (D-072).
- **Chhode vikalp:** door pe kuch nahi, sab warehouse me (galat maal warehouse tak, aur ek aur trip); partner hi refund manzoor kare (partner pe paise ka faisla).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.

### D-114. Return ka kharcha

- **Faisla:** return pickup ka kharcha galti ke hisaab se. Niyam:
  1. Hamari ya brand ki galti: return muft, aur delivery fee (D-107) bhi wapas.
  2. Man badla: refund me se return fee kat-ti hai (misaal ₹49), aur delivery fee wapas nahi.
- **Wajah:** Claude ki salah, owner ne maani: galti wale customer ka koi kharcha nahi, aur man badla wale return ka galat istemaal kam hota hai.
- **Chhode vikalp:** hamesha muft (kharcha hamara, galat istemaal); man badla ka kharcha seller pe (galti seller ki nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** brand ki galti wale return me delivery fee aur wapsi ka kharcha seller ke hisaab se (D-112 niyam 4).

### D-115. Return ka refund kab

- **Faisla:** R1 me return ka refund warehouse jaanch ke baad ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1). R2 se chhoti rakam pe pickup pe hi. Niyam:
  1. Misaal ₹1,000 tak, aur pickup ki jaanch (D-113) paas ho, to pickup scan pe refund; baaki warehouse jaanch ke baad.
  2. Baar-baar galat return karne wale customer (D-116) ko ye suvidha nahi.
  3. R2 se; R1 me hamesha warehouse jaanch ke baad.
- **Wajah:** Claude ki salah, owner ne maani: zyadatar customers ka paisa jaldi wapas aata hai, aur jokhim chhoti rakam tak simit rehta hai.
- **Chhode vikalp:** hamesha warehouse jaanch ke baad (customer ka intezaar); request pe turant (fraud aasaan).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.

### D-116. Baar-baar return ya daawa

- **Faisla:** jo customer seema se zyada return ya daawe kare, uski kuch suvidhayein band. Niyam:
  1. Seema misaal: 90 din me 5 returns, ya delivered orders ka 40% se zyada.
  2. Seema paar: man badla wala return band, delivery pe UPI band (D-109), aur pickup pe refund (D-115) band.
  3. Staff wajah ke saath khol sake; customer ko wajah dikhe.
  4. R2 se; record R1 se.
- **Wajah:** Claude ki salah, owner ne maani: nuksaan rukta hai, aur galti se pakde gaye sahi customer ke liye staff ka raasta khula rehta hai.
- **Chhode vikalp:** sirf record aur staff ko report (nuksaan chalta rehta); account band (bahut kada, galat faisle ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** D-072 niyam 4 ka record bhi isi record me judta hai.

### D-117. Delivery ka vaada aur cut-off

- **Faisla:** customer ko delivery ka vaada tareekh me dikhta hai (product page ke pincode check, cart aur checkout pe), warehouse ke cut-off ke saath. Niyam:
  1. "Aaj 2 baje (misaal) tak order to kal delivery."
  2. Warehouse se hub ka roz ek trip (misaal shaam 4 baje, D-027).
  3. Sunday aur chhuttiyan area setting me.
  4. Vaada toote to order pe "der" ki haalat aur customer ko khabar (D-126); R1 me koi muavza nahi.
- **Wajah:** Claude ki salah, owner ne maani: ek warehouse aur ek hub ke saath tareekh ka vaada sach rakha ja sakta hai, aur customer ko range se zyada bharosa milta hai.
- **Chhode vikalp:** din ki range, jaise "2 se 4 din" (kam bharosa); time slot (har hub ki capacity ka hisaab, ek insaan ke liye bhaari).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** cut-off, trip aur chhuttiyon ki settings area ke saath (D-022). Delivery fail ke niyam D-108 me.
- **Badla (owner, 2026-11-19, D-222):** niyam 4 me jod: vaada toote to customer ko return ya refund ka haq (door pe mana to poora refund; baad me 7 din, misaal, bina kharche); force majeure ka staff flag.

### D-118. Stock kab ruke aur payment ka samay

- **Faisla:** stock "place order" pe rukta hai, aur online payment ke liye 15 minute (misaal). Niyam:
  1. Prepaid me itne samay me payment.
  2. Der se payment aaye aur stock ho to order pakka; warna apne aap poora refund (original raaste, D-111) aur customer ko khabar.
  3. Cart me stock nahi rukta; cart sirf "kam stock" dikhata hai, aur checkout pe dobara jaanch.
  4. Delivery pe UPI wale order (D-034) me stock order pe ruka rehta hai, kyunki payment delivery pe hai.
- **Wajah:** Claude ki salah, owner ne maani: stock sirf asli kharidari pe rukta hai, aur der se aaye payment ka paisa apne aap wapas jaata hai.
- **Chhode vikalp:** cart me daalte hi rokna (stock bina kharidari ke ruka); 30 minute (stock zyada der ruka).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** reservation batch ke level pe (D-064). UPI app me der karne wale customer ko kabhi refund ka intezaar.

### D-119. Order ke baad badlav

- **Faisla:** R1 me order ke baad koi badlav nahi: quantity ghatani ho to item cancel (D-110), aur kuch jodna ho to naya order. R2 se customer pack hone se pehle address badal sakta hai, agar naya pincode usi hub aur usi state ka ho. Item jodna nahi.
- **Wajah:** Claude ki salah, owner ne maani: address badalna aam zaroorat hai, aur shart se hub (D-016) aur invoice ka state nahi badalte.
- **Chhode vikalp:** kabhi koi badlav nahi (customer ke liye kam suvidha); item jodna bhi (invoice aur reservation dobara).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.

### D-120. Discount kaise dikhe

- **Faisla:** product page, cart aur checkout pe kata hua MRP, daam aur "% off" (MRP se). Niyam:
  1. % hamesha neeche round ho, kabhi badha ke nahi.
  2. Batch badle aur MRP badle (D-064) to % bhi badle.
  3. "Sale" ya "deal" jaisa label lage tab "pichhle 30 din ka sabse kam daam" bhi dikhe (D-061 ka itihaas); ye hissa sale labels ke saath R2 se.
- **Wajah:** Claude ki salah, owner ne maani: customer ko sach dikhta hai, aur "sale" ka daawa itihaas se jaancha ja sakta hai.
- **Chhode vikalp:** sirf kata MRP + daam + % ("sale" ka sach nahi dikhta); sirf MRP aur daam (customer ko farak khud nikalna).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** platform ka discount alag dikhta hai (D-061 niyam 4, D-101). Kanooni detail jaanchi nahi (R-004): discount aur "pehle ka daam" dikhane ke niyam.
- **Badla (owner, 2026-11-19, D-223):** niyam 3 badla: "pichhle 30 din ka sabse kam daam" R1 se, har kate MRP ya "% off" ke saath, sirf "sale" label pe nahi.

### D-121. Free samples aur gifts

- **Faisla:** R2 se (D-055), sirf brand ke samples aur gifts. Niyam:
  1. Brand apne products ke saath apne samples de; stock brand ka.
  2. Invoice pe ₹0 ki line, "not for sale" nishaan.
  3. Samples pe bhi batch aur expiry (D-062).
  4. Return pe gift lautana zaroori nahi; jis offer se gift mila uski shart return ke baad toote, to bhi gift ka paisa nahi kat-ta.
- **Badla (owner, 2026-11-19, D-229):** niyam 2 badla: bina shart ka sample tax invoice ke bahar ("free sample, not for sale"); kharid ki shart wala gift CA ki salah tak nahi.
- **Wajah:** Claude ki salah, owner ne maani: beauty ka aam tareeka milta hai, kharcha brand ka rehta hai, aur return ke niyam saral rehte hain.
- **Chhode vikalp:** samples nahi (beauty ka aam tareeka chhoot-ta); platform ke gifts aur customer ke chune samples (platform ka kharcha aur gifts ka stock).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** Kanooni detail jaanchi nahi (R-004): free maal pe GST aur sample ke label ke niyam.

### D-122. Return pe refund ya replacement

- **Faisla:** return pe refund (D-111), ya hamari ya brand ki galti me wahi variant dobara. Exchange (doosra shade ya size) nahi: customer refund le ke naya order kare. Niyam:
  1. Replacement sirf hamari ya brand ki galti wale maamlon me, stock ho to.
  2. Naya parcel aur purana pickup ek hi trip me.
  3. R1 me sirf refund; replacement R2 se.
- **Wajah:** Claude ki salah, owner ne maani: galti wale customer ko do kadam nahi lene padte, aur exchange ki jagah refund + naya order se hisaab saaf rehta hai.
- **Chhode vikalp:** hamesha sirf refund (customer ke do kadam); exchange bhi (invoice, credit note aur daam ka farak).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** Kanooni detail jaanchi nahi (R-004): replacement pe invoice aur credit note ke niyam.
- **Jod (D-280, 2026-11-20):** replacement bina keemat ka, delivery challan ke saath.

### D-123. Hub aur warehouse ki shuruaati staff list

- **Faisla:** D-015 ki shart "staff ki list poori" ke liye shuruaati list:
  1. Hub: 1 Hub Manager, 1 Hub Operations (scan aur sort), 2 Delivery Partners.
  2. Warehouse: 1 Warehouse Manager, 1 Receiving, 1 Pick-Pack, 1 Returns QC.
- **Wajah:** Claude ki salah, owner ne maani: owner ke alag accounts (D-017) se list poori ho jaati hai, aur ek insaan kai roles rakh sakta hai (D-054). Asli launch pe zyada (jaise har kaam ke 2) sirf setting badal ke (D-022).
- **Chhode vikalp:** backup ke saath, har kaam ke 2 aur hub me 5 Delivery Partners (R1 ke liye zyada accounts); bahut kam, 1 Hub Manager + 1 Delivery Partner ("list poori" ka matlab kamzor).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** ek role ka account band ho to list adhoori ho jaati hai. Support Agent (D-105) is list me nahi, kyunki wo hub ya warehouse ka role nahi.

### D-124. Agla bhejne wala batch

- **Faisla:** D-064 ka "agla bhejne wala batch" = bikne layak batches me sabse pehle expire hone wala (D-062 ka kram). Niyam:
  1. Ruka batch (D-064 niyam 2, ya kisi aur wajah se hold) ginti me nahi; site pe agle bikne layak batch ka MRP aur expiry.
  2. Ruka batch bikri band ki seema (D-082) ke paas aaye to seller ko alert (D-062 niyam 3 jaisa), saath me "daam ghatao to ye batch bikega".
  3. Ye spashtikaran D-064 me jod ke roop me.
- **Wajah:** Claude ki salah, owner ne maani: product bikta rehta hai, customer ko wahi dikhta hai jo jaayega, aur ruke batch ka jokhim seller ko pehle se pata hota hai.
- **Chhode vikalp:** hamesha sabse pehle expire hone wala, chahe ruka ho (poora product ruk jaata); koi jod nahi (code me dono matlab ban sakte).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.

### D-125. Bharpai ka daam aur Pro daam

- **Faisla:** D-063 niyam 1 ki bharpai me "selling price" sirf normal daam ka itihaas hai; Pro daam (D-065) ginti me nahi (D-063 me jod).
- **Wajah:** Claude ki salah, owner ne maani: hisaab saral rehta hai, aur brand ko utna milta hai jitna normal bikri pe milta.
- **Chhode vikalp:** unit jis order ke liye reserved tha usi ka daam (sabse sahi, par do raaste); Pro aur normal dono itihaas me (bharpai bina wajah kam).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** Pro order ke reserved unit pe brand ko thoda zyada milta hai.

### D-126. Har order pe sirf zaroori emails

- **Faisla:** din ke 300 emails ki seema (D-028, R-013) me har order pe sirf zaroori emails. Niyam:
  1. Order confirmation, aur usi me delivery code (D-072).
  2. Invoice aur refund ka email (paise ka record).
  3. Baaki haalat (dispatch, der, delivery fail, delivered) in-app aur browser push se. Customer ne browser push band rakha ho to inme se sirf delivery fail ka email.
  4. Din ki seema ke paas emails ki line: pehle OTP, phir paise ke emails, phir baaki.
  5. D-108 aur doosre faislon me "email se khabar" isi niyam ke andar.
- **Wajah:** Claude ki salah, owner ne maani: OTP kabhi nahi rukta, paise ka record email me rehta hai, aur baaki khabar muft raaston se jaati hai.
- **Chhode vikalp:** har haalat pe email (bhaari din pe emails ruk sakte); customer khud chune (settings ka kaam, aur zyada emails ka jokhim).
- **Kab dobara khulega:** emails ki seema badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** D-072 aur D-108 me jod. Browser push band rakhne wale customer ko kam khabar milti hai. Push band wale customer ko D-090 ke sawal aur recall (D-129) ka email D-131 me. Kai parcels wale order (D-077, D-072 ka jod) me har parcel ka code confirmation email me tabhi jaa sakta hai jab parcels order ke waqt tay hon; ye order ke design me. Jod (2026-11-20, D-302): order confirmation niyam 4 ki paise wali line me.
- **Jod (owner, 2026-11-18, D-131):** niyam 3 me: push band ho to jawab maangne wali khabar (jaise D-090) ka email, aur recall ki khabar (D-129) har customer ko email se bhi; dono emails ki line me OTP ke baad, paise ke emails ke saath.
- **Jod (owner, 2026-11-19, D-142):** niyam 4 ki har line ki apni din ki chhat; OTP ke liye misaal 60 emails hamesha pakke.

### D-127. Imported cosmetics

- **Faisla:** videshi brands ke products (India me importer ya distributor ke through) bik sakte hain. Niyam:
  1. Listing pe importer ka naam-pata, country of origin aur import registration number (dummy, D-026) zaroori; staff jaanche.
  2. Fields R1 se; bikri jab aisa seller aaye. R1 ke dono sellers India ke.
- **Wajah:** Claude ki salah, owner ne maani: market ka bada hissa andar aata hai, aur fields pehle din se hone se baad me data nahi badalna padta.
- **Chhode vikalp:** sirf India me bane products (market ka bada hissa bahar); imported sirf brand ki apni Indian company se (distributors, D-032, ke saath mel kam).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** licence ka type D-128 me. Kanooni detail jaanchi nahi (R-004): imported cosmetics ka registration aur label ke niyam.

### D-128. Drug aur AYUSH drug products ki rok

- **Faisla:** drug items kabhi nahi (D-043), aur ye listing pe hi pakka hota hai. Niyam:
  1. Listing pe licence ka type zaroori: cosmetic manufacturing, cosmetic import registration (D-127), drug, ya AYUSH drug; number dummy (D-026).
  2. Drug aur AYUSH drug type wale product list hi nahi hote.
  3. Ingredients ki blocklist (jaise ketoconazole, benzoyl peroxide, adapalene, hydroquinone, minoxidil): D-099 ki structured list me aisa ingredient mile to listing ruk ke staff ke paas.
  4. Herbal ya Ayurvedic naam wale products jo cosmetic licence pe bane hain, bik sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: D-043 listing pe hi pakka hota hai, aur cosmetic licence wale herbal products bahar nahi hote.
- **Chhode vikalp:** sirf seller ki ghoshna aur staff ka andaaza (galti se drug bik sakta); herbal ya Ayurvedic naam wale saare products bahar (bada hissa bahar, jabki wo cosmetic hain).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** blocklist D-099 ki structured list pe chalti hai, jo R1 me hai. Blocklist ka shuruaati data aur staff role D-132 me. Kanooni detail jaanchi nahi (R-004): cosmetic aur drug (AYUSH samet) ki seema, aur kaunse ingredients cosmetic me mana hain.

### D-129. Batch recall

- **Faisla:** brand ya regulator kisi batch ko wapas bulaye (recall), to poora recall hota hai, aur platform khud bhi jaanch tak batch rok sakta hai. Niyam:
  1. Bikri band, aur warehouse me batch alag (quarantine).
  2. Us batch ke customers ko khabar; customer chahe to refund (pickup se wapsi, ya bina wapsi).
  3. Saara kharcha (refund, pickup, nasht) brand ka, seller ke hisaab se; kam pade to D-071 ka udhaar.
  4. Recall brand (seller app se) ya staff shuru kare; har recall ka record (batch, kitne customers, kitne lautaye).
  5. Platform khud bhi batch rok sake (jaise D-130 ki shikayatein) jab tak jaanch ho; rokne ki wajah ka record.
  6. Data R1 se (har order line ka batch, D-064, D-067); recall ka flow R2 se.
- **Wajah:** Claude ki salah, owner ne maani: customer ki sehat pehle, platform jaanch tak batch rok sakta hai, aur kharcha usi ka jiska maal.
- **Chhode vikalp:** sirf bikri band, customers ko kuch nahi (sehat ka jokhim); recall, par platform ka apna rok nahi (shikayaton pe jaanch tak rokne ka raasta nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** D-080 niyam 5 ka recall ka raasta yahi. Platform ke rokne pe brand se jhagda ho sakta hai, isliye wajah ka record. Kanooni detail jaanchi nahi (R-004): cosmetics recall ki zimmedari aur regulator ko suchna.
- **Jod (owner, 2026-11-18, D-131):** niyam 2 ki khabar har customer ko email se bhi jaati hai, push ho ya na ho.

### D-130. Skin reaction ki shikayat

- **Faisla:** customer kahe khula product lagane se reaction (allergy) hua, to case record aur batch pe nazar. Niyam:
  1. Case record: product, batch, kya hua, aur photo (customer ki consent ke saath).
  2. Brand ko khabar.
  3. Staff ke faisle se bina wapsi refund (goodwill, ek seema tak).
  4. Skin & Hair Expert (D-025) se salah ka offer.
  5. Ek batch pe tay ginti (misaal 3) shikayatein hon to batch ki bikri ruke aur staff jaanch kare (D-129).
  6. Batch me dikkat sabit ho to refund ka kharcha brand ka; warna platform ka goodwill, seema ke saath.
  7. R2 se, support desk ke saath (D-055); R1 ke Support Desk hisse (D-105) me nahi.
- **Wajah:** Claude ki salah, owner ne maani: customer ka bharosa bana rehta hai, aur batch ki dikkat chhupti nahi.
- **Chhode vikalp:** normal shikayat, koi refund nahi (bharosa toot-ta, batch ki dikkat chhupti); case record, par batch pe nazar nahi (kai shikayaton pe bhi batch chalta rehta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** ek galat shikayat se bhi batch ruk sakta hai, isliye staff ki jaanch. Sehat ka data kitne din rakhein aur kaun dekhe, Security Architect ke saath (B14). Kanooni detail jaanchi nahi (R-004): cosmetics ke side-effect (adverse event) ki report ke niyam, aur sehat ke data ki consent.

### D-131. Push band ho to kin khabaron ka email

- **Faisla:** browser push band rakhne wale customer ko bhi do tarah ki khabar email se jaati hai (D-126 niyam 3 me jod). Niyam:
  1. Jis khabar pe customer ka jawab chahiye, aur jawab na aane pe order badalta hai (abhi D-090), push band ho to uska email.
  2. Recall ki khabar (D-129) har customer ko email se bhi, push ho ya na ho.
  3. Emails ki line (D-126 niyam 4) me inki jagah OTP ke baad, paise ke emails ke saath.
- **Wajah:** Claude ki salah, owner ne maani: customer ka item bina jaane cancel nahi hota, sehat ki khabar har customer tak pahunchti hai, aur emails bahut kam badhte hain.
- **Chhode vikalp:** sirf D-090 ka sawal (recall ki khabar push band customer tak nahi pahunchti); koi jod nahi (push band customer ka item chupchaap cancel ho sakta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** D-090, D-126 aur D-129 me jod. Kanooni detail jaanchi nahi (R-004): recall pe customer ko suchna dene ke niyam.

### D-132. Ingredient master list aur blocklist ka data aur role

- **Faisla:** D-099 ki INCI master list aur D-128 ki blocklist R1 me badhti list se shuru hoti hain, aur blocklist ka badlav ek senior role ke haath me. Niyam:
  1. Master list R1 ke products ke ingredients se shuru. Seller ke text me anjaana naam staff ki jaanch me "naya ingredient" ban ke aata hai, aur staff use jodta hai. Blocklist ek chhoti tay list se shuru (D-128 ke naam, misaal).
  2. Public database (jaise EU ka CosIng) ka import tab, jab Claude uska license aur format jaanch le aur products badhein.
  3. Master list me naya naam catalog ki jaanch wali team (D-084) jodti hai.
  4. Blocklist sirf ek senior catalog role badle, wajah ke saath; har badlav audit log me.
- **Jod (owner, 2026-11-19, D-240):** blocklist ke do hisse: drug ingredients aur "cosmetic me mana" ingredients (IS 4707 Part 2 ki list); har entry pe source.
- **Wajah:** Claude ki salah, owner ne maani: R1 ke 2 sellers ke kam products ke liye badhti list kaafi hai, aur blocklist pe jokhim zyada hai (galat naam hata to drug bik sakta, galat juda to sahi products ruk jaate), isliye uska badlav senior role ke haath me.
- **Chhode vikalp:** badhti list, aur blocklist bhi aam jaanch team badle (zyada jokhim wala badlav aam haath me); shuru se public database ka import aur alag data role (R1 me import, safai aur license ka kaam).
- **Kab dobara khulega:** products badhein aur import ka license jaancha jaaye, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-18. **Nishaan:** Salah maani.
- **Asar (Claude):** shuru me staff ko naye naam haath se jodne padte hain. Senior catalog role ka naam roles ki list (D-017) me. License ki jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 me. Kanooni detail jaanchi nahi (R-004): kaunse ingredients cosmetic me mana hain, aur public database ke data ka license.

### D-133. Live site pe anjaan log

- **Faisla:** live site pe dekhna sab ke liye, par account sirf allowlist ke emails se. Niyam:
  1. Dekhna, search, reviews padhna aur pincode check (D-020) sab ke liye.
  2. Sign-up aur sign-in (teeno raaste, D-021) sirf allowlist ke emails se: owner ke base emails aur unke `+` alias, aur jinhe owner jode (testers).
  3. Allowlist ek setting me, bina deploy.
  4. Baaki ko saaf sandesh: "Ye demo store hai."
  5. Seller, delivery partner aur Creator ke sign-up bhi isi niyam se; waitlist (D-046) me judna bhi account se, to wo bhi allowlist tak.
  6. Asli business pe jaane pe (D-026) allowlist ek setting se band.
- **Wajah:** Claude ki salah, owner ne maani: code waisa hi production-grade rehta hai (D-012), par anjaan logon ka data aur emails ka bojh nahi aata, aur koi dhokha nahi khaata.
- **Chhode vikalp:** sab ke liye khula, demo ki patti ke saath (anjaan ka data, emails ka bojh, dhokhe ka jokhim); sign-up khula aur checkout sirf allowlist (anjaan ka data aur sign-up codes phir bhi).
- **Kab dobara khulega:** asli business pe jaate waqt (D-026), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** allowlist aur "demo store" ka sandesh R1 ke sign-up me ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Portfolio dekhne wala sign-up nahi kar sakta, jab tak owner use allowlist me na jode. Bina sign-in codes ki ginti ki seema Security Architect ke saath (B14). Kanooni detail jaanchi nahi (R-004): test mode me bikri dikhane wali site, aur anjaan logon ka personal data.

### D-134. Har kanooni area me system ki gehrai

- **Faisla:** har kanooni area me system utna banta hai jitna is table me. **L1** = field, dummy value aur dikhana. **L2** = L1 + workflow me rok ya jaanch (iske bina aage nahi). **L3** = L2 + register, report, export aur yaad (filing jaisa nateeja; asli filing nahi).

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

- **Jod (owner, 2026-11-19, D-237 se D-240):** naye rows: Grievance Officer aur nodal person ki asli staff jaankari page pe (D-237); seller ka block L2, iske bina seller live nahi (D-238); e-invoice ka field L1 aur har warehouse state me TCS registration L1 (D-239); dark patterns ka saal ka self-audit aur certificate ka record L3 jaisa, 2027 se pehle (D-240).
- **Wajah:** Claude ki salah, owner ne maani: jo paise, tax aur customer ki suraksha se juda hai wo gehra, baaki sirf field, taaki asli business pe jaane pe jagah ho, aur ek insaan (D-009) ka kaam seemit rahe.
- **Chhode vikalp:** sab L1 (design asli nahi rehta, D-026 ke khilaaf); sab L3 (ek insaan ke liye bahut bada kaam).
- **Kab dobara khulega:** kanooni jaanch (R-004) kisi area me zyada maange, ya owner khud khole.
- **Jod (owner, 2026-11-19, D-224):** claims ke saboot me test wale claims (sirf SPF nahi) R1 se.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** [COMPLIANCE.md](COMPLIANCE.md) ki har row ka "System me kya chahiye" khana is level se bharega. Kanooni detail jaanchi nahi (R-004): table ki har row; ye sirf "system kya banaye" ki baat hai, kanoon kya maangta hai ye kanooni jaanch batayegi.
- **Jod (owner, 2026-11-20, D-253, D-254, D-256):** naye rows: CERT-In ka Point of Contact (D-253); Gig workers (D-254); seller ka EPR number, Fire Safety (provisional, final, renewal aur saal ka certificate), Shops and Establishments aur e-way bill ka number (D-256); sab dummy.

### D-135. Review ka haq

- **Faisla:** ek customer, ek product, ek review. Niyam:
  1. Haq kisi bhi delivered line se, lauta hua item bhi (return ke baad bhi raay de sake). Cancel (D-110) aur RTO (D-108) line pe nahi.
  2. Pro daam wali line (D-065) pe bhi review.
  3. Review pe us line ka variant (D-076 niyam 5) aur "Verified purchase" ka nishaan. Dobara kharid pe naya review nahi: purana review edit ho (variant nayi line ka chun sake), aur "kai baar kharida" ka nishaan.
  4. Window delivery se misaal 365 din.
  5. Customer kabhi bhi edit ya delete kare; edit dobara moderation se (D-136); har version ka record.
- **Wajah:** Claude ki salah, owner ne maani: ek insaan ki ek awaaz, to baar-baar kharidne wala rating ko jhuka nahi sakta, aur dobara kharid pe customer apni raay taaza kar sakta hai. Lautaye item pe review rokna negative raay dabane jaisa lagta.
- **Chhode vikalp:** har line, har baar (zyada kharidne wale ka asar zyada); har line pe review par rating me sirf aakhri (do tarah ki ginti samjhana mushkil).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 ke review ka data model customer + product se bandha, har version ke saath. Lautaye item ke negative reviews aayenge (jo sach hain). Kanooni detail jaanchi nahi (R-004): verified review aur negative review na dabane ke niyam.

### D-136. Review ki moderation

- **Faisla:** review ki moderation mila-jula. Niyam:
  1. Sirf star rating (bina text) turant live.
  2. Text wala review apne aap ki jaanch se guzre (gaali ke shabdon ki list; phone, email ya link jaisa pattern; lambai): paas to turant live, atka to staff ki queue.
  3. Photo wala review hamesha queue me (D-155).
  4. Report hua review live rahe jab tak faisla na ho; sirf personal data ya intimate content ki report pe faisle tak chhupe, aur aisi report queue me sabse pehle.
  5. Queue ka faisla misaal 2 kaam ke din me.
  6. Har chhupana aur wapas dikhana wajah ke saath, audit me, aur wapas ho sake.
  7. Role "Review Moderator": poore desh ki ek team (D-084 jaisa), Admin app me.
- **Wajah:** Claude ki salah, owner ne maani: zyadatar reviews bina staff ke live, aur jokhim wale (photo, atke, report hue) hi staff tak, to ek insaan (D-009) ka bojh kam rehta hai.
- **Chhode vikalp:** sab pehle jaanch (ek insaan pe bojh aur customer ka intezaar); sab turant live, jaanch sirf report pe (galat content der tak live).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** Review Moderator role roles ki list (D-017) me, R1 me chalu (D-054). Shabdon ki list aur apne aap ki jaanch ka kaam; kuch galat review thodi der live reh sakte hain. Chhupane ke niyam D-146 me. Kanooni detail jaanchi nahi (R-004): reviews jaise user content pe platform ki zimmedari aur hatane ke samay.
- **Badla (owner, 2026-11-20, D-251):** niyam 5 ki jagah naye samay: nagnata ya kisi aur ban ke dikhane wale content ki report pe content turant apne aap chhupe aur faisla 2 ghante me; baaki content ki report pe faisla 36 ghante me.

### D-137. Skin type, concern aur active ingredient ka data

- **Faisla:** skin type, concern aur active ingredient ka % alag catalog fields me, platform ki list se. Niyam:
  1. Category ke hisaab se fields (D-076 jaisa): skin type (kai chune ja sakein), concern, hair type.
  2. Seller platform ki list se chune; ye jokhim wale fields me (D-098 niyam 1), badlav pe jaanch.
  3. Concern ki list me sirf cosmetic shabd ("acne-prone skin", "dull skin"); "treat", "cure" jaise shabd list me nahi.
  4. Active ingredient ka % alag field, sirf tab jab pack pe chhapa ho; staff label ki photo (D-099 niyam 1) se milaye.
  5. Filters inhi fields se (D-138).
- **Wajah:** Claude ki salah, owner ne maani: skin type aur concern lagbhag har skincare product pe hote hain; claims ki list (D-100) saboot wale daawon ke liye hai, unme milane se list bhaari aur filters ulajhte.
- **Chhode vikalp:** claims ki list me hi jodna (list lambi, saboot ke niyam ka sawal); R1 me kuch nahi (filter kamzor, baad me sab listings dobara).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 ke catalog me chhota jod (D-055 me jod, [PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Seller aur staff ka thoda aur kaam; skin type, concern aur hair type ki shuruaati list catalog team (D-084) sambhale. Kanooni detail jaanchi nahi (R-004): cosmetic aur drug ke daawe ke shabd.

### D-138. R1 ke filters aur sort

- **Faisla:** R1 ke basic search aur filter me ye filters: category, brand, daam ki range, shade family (D-085), free-from (D-099), skin type aur concern (D-137), claims (D-100), rating, discount %, country of origin (D-127), size. Sort: relevance, daam (kam se zyada, zyada se kam), naya, rating, discount.
- **Jod (owner, 2026-11-19, D-240):** sort me bhi country of origin, aur search me country ka naam.
- **Wajah:** Claude ki salah, owner ne maani: data R1 me ban hi raha hai, aur filter usi ka seedha fayda hai.
- **Chhode vikalp:** kam filters (data hote hue bhi filter nahi); Pro daam se sort bhi (har dekhne wale ke liye alag daam ka sort; baad me).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** filter ki screen aur search index ka kaam (Architect). Pro daam ka sort baad me. Kanooni detail jaanchi nahi (R-004): imported products ke liye country of origin ka filter zaroori hai ya nahi.

### D-139. Search aur listing ka kram

- **Faisla:** relevance aur gun se kram, kisi seller ka boost nahi. Niyam:
  1. Relevance ke baad: rating (kam se kam misaal 5 reviews pe), pichhle 30 din ki bikri, stock me hona.
  2. Out-of-stock sabse neeche (D-153).
  3. Apne brand (D-031) ko koi boost nahi; code me kisi seller ke hisaab se boost ka raasta hi nahi.
  4. Sponsored sirf R2 ke baad, hamesha "Sponsored" label ke saath, aur ginti ki seema (misaal har 10 me 2 tak).
  5. Kram ke mukhya gun customer ke liye ek page pe likhe.
- **Wajah:** Claude ki salah, owner ne maani: customer ko kaam ka kram, aur sab sellers ke saath ek niyam.
- **Chhode vikalp:** sirf relevance (achhe aur bikne wale products neeche reh sakte); apne brand ko boost (sellers ka bharosa aur kanooni jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** rating aur bikri ki ginti ka kaam; ranking ki technique Architect ke saath. Kanooni detail jaanchi nahi (R-004): kram ke gun batana, apne brand ko aage rakhna, sponsored ka label.

### D-140. Sellers aur staff ke emails

- **Faisla:** din ke 300 emails (D-028) me sellers aur staff ko sirf zaroori emails. Niyam:
  1. Account aur security (invite, password reset, sign-in code): OTP wali line me.
  2. Paisa (payout statement, udhaar ka alert aur payment link, fee ka invoice): paise wali line me.
  3. Jinpe seller ka kaam ruke ya tay samay me jawab chahiye (receiving ka farak, listing "ye badlo", recall, batch rokna): din ka ek saar wala email (misaal subah 9 baje), har khabar alag nahi.
  4. Baaki (listing manzoor, stock ki ginti, reviews) sirf in-app aur push.
  5. Staff ko sirf account aur security ke emails; kaam ki khabar app ki queue me.
- **Wajah:** Claude ki salah, owner ne maani: ek seller ko din me 1 se 2 emails, aur zaroori baat chhootti nahi.
- **Chhode vikalp:** har khabar ka email (sellers badhte hi seema khatam); seller khud chune (settings ka kaam aur zyada emails ka jokhim).
- **Kab dobara khulega:** emails ki seema badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** saar wale email ka kaam, aur khabar thodi der se. Line ki chhat D-142 me.

### D-141. Order ke alawa customer ki khabrein

- **Faisla:** order ke alawa khabrein muft raaston se, email seemit. Niyam:
  1. Offers aur marketing sirf in-app aur push, sirf alag opt-in se (sign-up pe pehle se tick nahi), kabhi bhi band.
  2. Review ki yaad, points ki expiry aur cart ki yaad: in-app aur push; cart ki yaad ek baar (misaal 24 ghante baad), opt-in se.
  3. Area khulne ki khabar (D-046): in-app aur push; email sirf unhe jinke paas push nahi, "baaki" line ki din ki chhat (D-142) ke andar, baaki agle dinon me.
  4. Har khabar me "ye kyun mila" aur band karne ka raasta.
  5. Ek customer ko hafte me misaal 3 marketing push tak.
- **Wajah:** Claude ki salah, owner ne maani: OTP kabhi nahi rukta, aur khabrein consent ke andar.
- **Chhode vikalp:** sab email se (bade din pe OTP ruk sakta, consent ka jokhim); koi marketing khabar nahi (growth ka raasta band).
- **Kab dobara khulega:** emails ki seema badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** area khulne ki khabar R1 me; baaki R2 se. Push band wale customer tak kam pahunch, aur area khulne ki khabar kuch logon ko der se. Kanooni detail jaanchi nahi (R-004): marketing khabron ki consent aur band karne ke niyam.

### D-142. Emails ki har line ki din ki chhat

- **Faisla:** din ke 300 emails me har line (D-126 niyam 4) ki apni din ki chhat. Niyam:
  1. Din ke 300 me se misaal 60 sirf OTP ke liye; baaki lines milake 240 tak.
  2. "Baaki" line misaal 120 tak; paise ke emails aur D-131 wali khabar bachi jagah me.
  3. OTP apni 60 ke baad bhi koi bhi bachi jagah le sake.
  4. Chhat paar ho to wo email agle din ki line me; in-app aur push usi din.
  5. Bade burst (area khulna, recall) apne aap kai dinon me bant-te hain, chhat ke andar.
  6. Din ka 80% (misaal 240) hone pe Master aur Head of Operations ko in-app chetavni.
- **Jod (owner, 2026-11-19, D-240):** recall ki email line OTP ke baad sabse pehle, paise ke emails se bhi pehle.
- **Wajah:** Claude ki salah, owner ne maani: OTP kabhi nahi rukta, aur paise ke emails "baaki" ke burst me nahi dabte. Sirf line ka kram kaafi nahi, kyunki subah ka burst shaam ke OTP ki jagah kha sakta hai.
- **Chhode vikalp:** koi chhat nahi, sirf D-126 ka kram (bade din pe OTP aur sign-in ruk sakta); sirf OTP ki pakki jagah ("baaki" ka burst paise ke emails ko agle din dhakel sakta).
- **Kab dobara khulega:** emails ki seema badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-126 me jod. Number misaal hain; asli number Architect aur DevOps ke saath. Bade recall ke emails kuch dinon me bant sakte hain (in-app aur push usi din). Kanooni detail jaanchi nahi (R-004): recall pe customer ko suchna dene ke samay ke niyam.
- **Jod (owner, 2026-11-20, D-248):** data leak ke emails OTP aur recall ke saath sabse aage; chhat paar ho to in-app aur push usi din.

### D-143. Seller ki reports aur customer ki jaankari

- **Faisla:** seller ko kaam ki reports milti hain, par customer ki pehchaan ke bina. Niyam:
  1. Orders aur lines (variant, batch, daam, "discount kisne diya", D-101), returns wajah ke saath (D-079) aur jaanch ka nateeja (D-112), stock batch ke hisaab se umar aur expiry (D-062, D-066), settlement statement (D-081), reviews ka saar.
  2. Customer ki pehchaan: sirf order number, shehar ya district, aur pincode; naam, phone, email, address nahi.
  3. Invoice ki copy me sirf wo jo invoice pe zaroori hai.
  4. Customer ki koi list nahi; seller customer se seedha sampark nahi kar sakta.
- **Wajah:** Claude ki salah, owner ne maani: fulfilment platform karta hai (D-014), to brand ko kaam ka data milta hai aur customer ka personal data kam haathon me rehta hai.
- **Chhode vikalp:** sab, naam, phone aur address samet (personal data bahut haathon me); sirf jod (brand apne returns aur stock samajh nahi pata).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 me seller app ki reports (reviews ka saar R2 se). Invoice ki copy ke niyam ki jaanch. Kanooni detail jaanchi nahi (R-004): seller ko customer ka data dena, aur invoice pe customer ki zaroori jaankari.
- **Jod (owner, 2026-11-19, D-226):** niyam 3 ka saaf roop: ₹50,000 ya zyada ke invoice pe customer ka naam aur pata, aur seller ki copy me bhi; kam ke invoice pe state (aur shehar ya pincode).

### D-144. Data export

- **Faisla:** data export seemit. Niyam:
  1. Seller: apne orders, settlement aur stock ka CSV, utni hi jaankari jitni seller ki reports me (D-143); customer ki pehchaan nahi.
  2. Finance staff: ledger aur tax registers (R2 se; accounting software ka format baad me).
  3. Baaki staff: sirf apne kaam ki list, personal data chhupa ke.
  4. Har export audit me; ek export me misaal 50,000 rows tak, zyada pe saaf mana (aadhi kati file nahi).
- **Wajah:** Claude ki salah, owner ne maani: seller aur finance ka kaam chalta hai, aur data ke leak ka raasta seemit rehta hai.
- **Chhode vikalp:** koi export nahi (seller aur finance ka haath ka kaam); sab ko sab (data ke leak ka bada raasta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** seller ka settlement CSV R1 me; baaki R2 se. Export ki suraksha (file me formula jaise cell, scope) Security Architect ke saath (B14).

### D-145. Demo aur dummy ka nishaan

- **Faisla:** har jagah jahan dhokha ho sake, demo ya dummy ka nishaan. Niyam:
  1. Har app ke upar patli patti: "Demo store: koi asli bikri, payment ya delivery nahi."
  2. Invoice, credit note aur payout statement ke PDF pe "SPECIMEN / DEMO: not a tax document" watermark.
  3. Har dummy registration number (GSTIN, licence, import registration, EPR) ke saath "DUMMY" badge, jahan bhi dikhe.
  4. Grievance Officer jaise officers ke liye sirf role ka naam aur `example` domain ka email; kisi insaan ka banawati naam nahi.
  5. Dummy numbers aise ki kisi asli company ke number se na milein.
  6. Demo ke reviews pe "Demo review" ka nishaan.
  7. Saare dummy values ek jagah (data ya config) ki list me (D-026).
- **Badla (owner, 2026-11-19, D-237, D-241):** niyam 4 badla: Grievance Officer aur nodal person apne staff ke roles hain; unki jaankari dummy nahi, role wale staff account se. Aam niyam: jahan kaam apna role karta hai, wahan dummy naam nahi (D-241).
- **Wajah:** Claude ki salah, owner ne maani: koi bhi page ya file bahar jaaye to bhi asli na lage.
- **Chhode vikalp:** kahin nahi (nakli invoice aur dhokhe ka jokhim); sirf site ki patti (download hui file asli lagti).
- **Kab dobara khulega:** asli business pe jaate waqt (D-026), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se; har PDF aur number ke saath kaam. Owner ke accounts ke reviews (D-017, D-039) niyam 6 se demo dikhte hain. Kanooni detail jaanchi nahi (R-004): demo site pe dummy registration numbers aur invoice jaise documents.

### D-146. Review chhupane ke niyam

- **Faisla:** review chhupane ki tay list, aur negative raay kabhi wajah nahi. Niyam:
  1. Chhupane ki wajahein sirf: gaali, nafrat ya dhamki; kisi ka personal data (phone, email, address, order number); spam, link ya doosre product ya site ka prachaar; product se bilkul alag baat; nakli ya khel wala review; intimate ya kisi aur ki photo; kanooni order.
  2. Kabhi wajah nahi: kam rating, kadwi raay, brand ki aalochna, "mujhe reaction hua".
  3. Skin reaction wala review rahe, aur customer ko support ka raasta dikhe (D-130).
  4. Ilaaj jaise daawe wale review rahein; saare reviews ke upar ek tay note: "Reviews customers ki apni raay hain, ilaaj ka daawa nahi."
  5. Delivery ya packaging ki shikayat review me rahe (customer ka asli anubhav).
  6. Customer ko chhupane ki wajah dikhe; wo badal ke dobara bhej sake; ek appeal, jiska faisla doosra moderator kare (D-084 niyam 3 jaisa).
- **Wajah:** Claude ki salah, owner ne maani: ek jaisa faisla, aur negative raay ki suraksha saaf. Review ko hatana ya doosri jagah bhejna customer ki raay se chhed jaisa hai.
- **Chhode vikalp:** delivery ki shikayat wale review rating se bahar (customer ka review uski marzi ke bina doosri jagah); staff ki samajh, koi tay list nahi (har moderator ka alag faisla).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Brand ki rating pe hamari delivery ka asar dikhega. Appeal ke liye doosra moderator account (D-017). Kanooni detail jaanchi nahi (R-004): negative review chhupane ke niyam, review me ilaaj ke daawe, aur user content hatane ke niyam.
- **Badla (owner, 2026-11-20, D-263):** niyam 4 badla: Drugs and Magic Remedies Act ki Schedule wale ilaaj ke daawe wale reviews chhupte hain (wajah "kanoon ke khilaaf daawa"); baaki ilaaj jaise anubhav note ke saath.

### D-147. Return ya daawa reject pe customer ki appeal

- **Faisla:** R1 me Support Agent ke reject (D-105) ke baad customer ek appeal kar sakta hai: reject ke misaal 7 din me, naye saboot ke saath. Faisla Support Lead role kare (wo account jisne reject nahi kiya), misaal 3 kaam ke din me; uske baad faisla aakhri.
- **Wajah:** Claude ki salah, owner ne maani: galat reject ka sudhaar hota hai, aur bojh seemit rehta hai.
- **Chhode vikalp:** R1 me appeal nahi (galat reject ka koi raasta nahi); kitni bhi appeals (ek hi maamla baar-baar).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 me chhota jod: Support Lead role R1 me chalu (D-017, D-054); D-105 me jod, [PROJECT_PLAN.md](PROJECT_PLAN.md) §1.

### D-148. "Parcel nahi mila" ke daawe ki samay-seema

- **Faisla:** "parcel nahi mila" ke daawe (D-072) ki samay-seema saboot ke hisaab se: code se delivered pe 48 ghante (daawa darj hota hai, par D-072 ke niyam se maana nahi jaata); sirf photo aur location wali delivery pe misaal 7 din. Dono "delivered" scan se gine jaate hain.
- **Wajah:** Claude ki salah, owner ne maani: jahan saboot kamzor hai wahan customer ko poora samay, aur code wali delivery pe lambe samay ka koi fayda nahi.
- **Chhode vikalp:** sab pe 48 ghante (ghar se bahar gaya customer chhoot sakta); sab pe 7 din (code wali delivery pe bhi lamba khula maamla).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-072 niyam 3 ka number yahan; D-072 me jod. R1 me (D-105).

### D-149. R1 ke aankde

- **Faisla:** R1 me owner ko (Master aur Head of Operations ke accounts pe) din, hafte aur mahine ke ye aankde:
  1. Orders, GMV (MRP aur diya hua daam dono), average order value.
  2. Cancel % (wajah se), RTO % (D-108), pehli koshish me delivery %, vaade pe delivery % (D-117).
  3. Return % (wajah aur category se, D-079), refund ka samay (D-111), daawon ki ginti (D-072).
  4. Stock: bikne layak, ruka hua aur near-expiry ki rakam (D-062, D-089); storage fee wala maal (D-066).
  5. Waitlist ki ginti district se (D-046); zero result wali searches (D-152).
- **Wajah:** Claude ki salah, owner ne maani: R1 ka lakshya poora flow parkhna hai (D-055), aur bina aankdon ke pata nahi chalta flow kahan tootta.
- **Chhode vikalp:** kuch nahi, sirf orders ki list (flow ki kamzori chhupi); target aur alert bhi R1 me (targets aur alerts ka kaam; R2 me).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** har aankde ka data R1 ke events me pehle din se (D-157); roz ke jod ka kaam, sote server (R-002) ke saath Architect. Target aur alert R2 se.

### D-150. Legal pages ka content

- **Faisla:** Terms, Privacy, Return, Shipping, Grievance aur Seller agreement jaise pages tay faislon se asli jaisa draft. Niyam:
  1. Claude tay faislon se pages likhe.
  2. Har page pe "DUMMY: lawyer se jaancha nahi" badge aur version.
  3. Terms ya Privacy ka bada badlav ho to agle sign-in pe naya consent.
  4. Return aur Shipping pages ke number policy ki settings se aayein (ek baat ek jagah).
- **Jod (owner, 2026-11-19, D-240):** "Payments" aur "Kram kaise" pages bhi.
- **Wajah:** Claude ki salah, owner ne maani: customer ko site ke asli niyam dikhte hain, aur design asli rehta hai (D-026).
- **Chhode vikalp:** placeholder (consent ka koi matlab nahi, niyam kahin likhe nahi); kisi template site se copy (copyright aur galat niyam ka jokhim).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 me (sign-up ka consent version ke saath). Pages likhne aur version rakhne ka kaam. Kanooni detail jaanchi nahi (R-004): in pages ke zaroori hisse.
- **Jod (owner, 2026-11-20, D-255):** sign-up pe alag "Data notice" (har maqsad, data, consent wapas lene ka link, haq, Board ke paas shikayat); Privacy page pe data ka desh, processors ki shreniyan aur rakhne ka samay; Terms me mana content ki list, har 3 mahine ki in-app suchna, aur shikayat ke jawab me Grievance Appellate Committee ka raasta.
- **Badla (owner, 2026-11-20, D-264):** niyam 2 badla: badge hamesha "DUMMY: kisi licensed lawyer ne nahi dekha"; AI Lawyer ka nishaan sirf docs me.

### D-151. Customer ke data ke haq

- **Faisla:** zaroori haq R1 me, baaki R2 se. Niyam:
  1. R1: profile sudhaar; marketing consent band; account delete (chalte orders, returns aur refunds ke baad; misaal 7 din ka wapas lene ka samay; invoice aur ledger me naam, pata aur email hata ke ek code).
  2. R2: poore data ka download (file, app se; email attachment nahi), consent ka itihaas, data request ka ticket aur tay samay.
- **Wajah:** Claude ki salah, owner ne maani: asli personal data (owner aur testers ka) pe zaroori haq pehle din se, aur bada kaam support desk ke saath.
- **Chhode vikalp:** koi self-service nahi, sab support se (R1 me koi haq nahi); sab R1 me (R1 bhaari).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** delete ke saath pehchaan hatane ka kaam R1 me; records kitne din rakhein, Security Architect ke saath (B14). Kanooni detail jaanchi nahi (R-004): data ke haq, jawab ka samay, aur records rakhne ka samay.
- **Badla (owner, 2026-11-19, D-225):** niyam 1 badla: jaari invoice aur credit note nahi badalte; unki asli copy alag tax archive me 72 mahine (misaal), sirf finance dekhe; app ki baaki jagah se pehchaan hatti hai.
- **Jod (owner, 2026-11-20, D-250, D-255):** delete pe data app se turant hat-ta hai, phir kanooni rok ke niyam se (D-250); R2 ke data haq me nomination ka form aur record, aur data ke saar me kin ke saath data baanta (D-255).

### D-152. Zero result aur synonyms

- **Faisla:** search me kuch na mile to madad, aur shabdon ki report. Niyam:
  1. Spelling ki galti pe "kya aapka matlab ..." ka sujhaav, milte-julte products, popular categories.
  2. Synonyms ki list staff setting se, bina deploy (D-037 ki soch).
  3. Zero result wale shabd har hafte ki report me.
  4. R1 me ye kaam catalog ki jaanch wali team (D-084, Admin app) kare; Growth Studio (D-010) bane to wahan.
  5. Customer "ye brand ya product chahiye" ki request de sake (sign-in se): R2 se.
- **Wajah:** Claude ki salah, owner ne maani: kam kaam me customer rukta hai, aur demand ka data milta hai.
- **Chhode vikalp:** saada "kuch nahi mila" (customer khota); apne aap seekhne wale synonyms (technique ka bojh aur galat synonyms ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** niyam 1 se 4 R1 me. Synonyms ki list ka haath ka kaam.

### D-153. Stock khatam product

- **Faisla:** stock khatam product dikhe, khabar ke saath. Niyam:
  1. "Out of stock" ke saath dikhe, kram me neeche (D-139).
  2. Product page pe "stock aane pe batao" (sign-in se).
  3. Khabar sirf in-app aur browser push se, email nahi.
  4. Request misaal 90 din me khatam.
  5. Seller ko "kitne log ruke hain" ki ginti.
- **Wajah:** Claude ki salah, owner ne maani: customer ka intent nahi khota, seller ko maal bhejne ka signal milta hai, aur email ka bojh nahi.
- **Chhode vikalp:** chhupe (customer aur demand ka signal dono khote); dikhe par bina khabar (customer ko baar-baar dekhna padta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** dikhana R1 me; "stock aane pe batao" ki khabar R2 se.

### D-154. Customer ko dikhne wale aankde

- **Faisla:** customer ko sirf sach aankde, tay niyam se. Niyam:
  1. "Bestseller": category me pichhle 30 din ki bikri ke top 10 me (misaal).
  2. "Kam stock": sirf jab bikne layak stock misaal 5 se kam ho, asli ginti ke saath.
  3. "X ne kharida" nahi (chhoti ginti pe gumraah karta hai).
  4. Countdown timer sirf jab offer ka asli khatam hone ka samay ho (offers R2 se).
  5. Har niyam ek policy page pe.
- **Wajah:** Claude ki salah, owner ne maani: sach aankde customer ke kaam ke hain, aur niyam se bana aankda jhooth nahi ban sakta. Apne brand (D-031) pe bhi wahi niyam.
- **Chhode vikalp:** koi aisa aankda nahi (sach aankdon ka fayda bhi nahi); marketing ki marzi se (dark pattern ka seedha jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** "Bestseller" aur "kam stock" R1 me; countdown R2 se. Kanooni detail jaanchi nahi (R-004): jhoothi jaldi aur kam stock dikhane ke niyam.

### D-155. Review me customer ki photo

- **Faisla:** review me photo R1 se, har photo jaanch ke baad: ek review me zyada se zyada misaal 3 photos; har photo staff ki jaanch (D-136) ke baad live; chehra dikhe to customer ka "ye meri photo hai aur dikhane ki ijazat hai" tick zaroori; address label, doosre insaan ya intimate photo pe reject; video nahi.
- **Wajah:** Claude ki salah, owner ne maani: photo upload ka kaam R1 me daawe ke liye pehle se hai (D-106), har photo jaanch se guzarti hai to jokhim kam, aur R1 me do sellers ke saath photos kam hongi. Video nahi: jagah, data aur jaanch ka bojh.
- **Chhode vikalp:** photo R2 se (R1 ke reviews kam kaam ke); photo aur video R1 se (video ki jagah aur jaanch ₹0, D-028, pe bhaari).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 me chhota jod (D-055 me jod, [PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Har photo ek insaan ki queue me. Photos database me nahi (R-006); media ki jagah Architect ke saath. Kanooni detail jaanchi nahi (R-004): customer ki photo (chehra) rakhne aur dikhane ki consent.

### D-156. Nakli review pe karwai

- **Faisla:** nakli review ya rating ke saath khel pakda jaaye to seedhi karwai. Niyam:
  1. Review hatao, wajah ke record ke saath.
  2. Customer: pehli baar chetavni; dobara to review likhna band (misaal 6 mahine); staff wajah ke saath khol sake.
  3. Seller: brand ke staff ya brand ke kahe pe review sabit ho to chetavni; dobara to us brand ki listings rokna, aur aage account band, Trust & Safety ke faisle se (D-047).
  4. Kisi product ke bahut reviews hatein to uski rating dobara gini jaaye, aur seller ko wajah dikhe.
  5. Seller app ke users (brand ka staff) apne brand ke product pe review nahi likh sakte (system ki rok).
- **Wajah:** Claude ki salah, owner ne maani: saza galti ke hisaab se, galat pakde gaye ke liye raasta khula, aur brand ke apne staff pe system ki rok. Apna brand (D-031) bhi isi niyam me.
- **Chhode vikalp:** sirf review hatao (khel karne wale pe koi rok nahi); account turant band (galat faisle ka bada jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** niyam 1 aur 5 R1 me; baaki R2 se, Trust & Safety ke saath. `+` alias (D-017) se kai accounts ki pehchaan address, device aur payment ke jod se, Security Architect ke saath (B14). Kanooni detail jaanchi nahi (R-004): nakli reviews pe platform ki zimmedari.

### D-157. Customer ke behaviour ka data

- **Faisla:** R1 me sirf server ke business events (order, cancel, return, search ke shabdon ki ginti); koi page-level tracking nahi. R2 se bina personal pehchaan ka halka page data: din ki ginti (kis product ka page kitni baar khula, kitne cart me gaye); kachcha data misaal 30 din, phir sirf din ka jod. Bahar koi analytics service nahi.
- **Wajah:** Claude ki salah, owner ne maani: funnel ka moota roop milta hai, data bahar nahi jaata, aur Atlas ki 0.5 GB (R-006) me jagah seemit rehti hai.
- **Chhode vikalp:** sirf business events, hamesha (funnel nahi); bahar ki free analytics service, cookie consent ke saath (consent ka banner, data bahar, page pe bahar ki script).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 ke aankde (D-149) inhi events se. Apna halka tracking aur jod ka kaam R2 me. Kanooni detail jaanchi nahi (R-004): tracking aur cookies ki consent.

### D-158. Muft mile product ya inaam wale review

- **Faisla:** koi inaam nahi: ₹0 wali line (sample ya gift, D-121) pe review ka haq nahi; review ke badle koi points, coupon ya inaam nahi (na platform, na brand); brand customer se review ke liye seedha sampark nahi kar sakta.
- **Wajah:** Claude ki salah, owner ne maani: sabse saaf aur sabse zyada bharosa. Baad me review ke badle inaam chahiye ho to label wala raasta khula hai.
- **Chhode vikalp:** label ke saath ("Muft mila product", "Inaam mila"; label, alag ginti aur inaam ke niyam ka kaam); inaam bina label (bharosa aur kanoon dono ka jokhim).
- **Kab dobara khulega:** loyalty ki charcha (B10) me review ke points chahiye hon, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** niyam R1 se code me (R1 me ₹0 line nahi aati, par rok code me). Reviews kam aa sakte hain. Kanooni detail jaanchi nahi (R-004): inaam ya muft product wale review aur endorsement ke label ke niyam.

### D-159. Allergen ki chetavni ka roop

- **Faisla:** D-099 ki allergen ki chetavni R1 me sab customers ko ek jaisi: product page pe jaane-maane allergens (jaise fragrance ke allergens) ki chetavni, structured list (D-099 niyam 2) se; customer ka koi data nahi. Customer ki apni allergy ke hisaab se chetavni baad me, jab customer ki allergy ka data aur uski consent tay ho.
- **Wajah:** Claude ki salah, owner ne maani: R1 me koi sehat ka data nahi chahiye, chetavni har customer ko dikhti hai, aur personal chetavni ka raasta khula rehta hai.
- **Chhode vikalp:** hamesha sabke liye ek jaisi (customer ko apni allergy ke hisaab se madad kabhi nahi); customer ke hisaab se R1 se (R1 me sehat ke data ka kaam aur consent).
- **Kab dobara khulega:** customer ki allergy ka data tay hone pe, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-099 me jod. Allergy ka data sehat ke paas ka data hai: consent aur suraksha Security Architect ke saath (B14). Kanooni detail jaanchi nahi (R-004): allergens dikhane ke niyam, aur sehat ke data ki consent.
- **Jod (owner, 2026-11-19, D-165):** customer ki apni allergy ke hisaab se chetavni beauty profile (D-165) se, R2 se.

### D-160. Brand ka review pe jawab

- **Faisla:** brand (seller) har review pe ek public jawab de sakta hai, niyam ke saath. Niyam:
  1. Har review pe ek jawab (edit ho sake), reviews wale moderation niyam (D-136, D-146) se.
  2. Seller ko reviewer ka sirf chhota naam dikhe, koi contact detail kabhi nahi (D-143).
  3. Seller report kare (wajah ke saath), faisla moderator ka; seller review hata ya badal nahi sakta.
  4. Jawab me coupon, offer ya bahar sampark ka raasta nahi.
- **Wajah:** Claude ki salah, owner ne maani: brand ki baat customer tak pahunchti hai aur customer ki suraksha bhi rehti hai. Apna brand (D-031) bhi isi niyam me.
- **Chhode vikalp:** jawab nahi, sirf dekhna aur report (brand ki baat nahi pahunchti); jawab bina moderation (bina jaanch live).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** apne products ke reviews dekhna R1 me (seller app); jawab aur report R2 se. Jawab bhi moderation ki queue me.

### D-161. Support tickets ke raaste aur categories

- **Faisla:** support tickets kai log bana sakte hain, platform ki tay categories me. Niyam:
  1. Signed-in customer aur seller apne app se (order, parcel ya line chun ke); bina sign-in "Contact us" form (email zaroori; jab tak D-133 ki allowlist hai, sirf allowlist ke emails se); delivery partner Delivery app se apne maamle (kamaai, kaat).
  2. Categories platform ki list se, har ek ka tay raasta: order ki haalat; cancel, return, refund; parcel nahi mila (D-072); toota ya galat item (D-106); payment kata par order nahi; account aur sign-in; product ya shade ka sawal (Beauty Advisor, D-025); skin reaction (D-130); review ya content ki shikayat; privacy ya data ki request (D-151); delivery partner ka vyavhaar; seller ke maamle.
  3. Ticket ki baat-cheet in-app; jawab aane pe push; push band ho to email sirf tab jab customer ka jawab chahiye (D-131 jaisa), emails ki chhat (D-142) ke andar.
  4. Band hone pe ek sawal ka chhota survey (in-app).
- **Wajah:** Claude ki salah, owner ne maani: sab paksh ek hi desk pe, aur email ki seema pe bojh nahi.
- **Chhode vikalp:** sirf signed-in customer (seller, partner aur bina sign-in wale ke liye raasta nahi); live chat bhi (ek insaan ko screen pe baithe rehna, aur server so jaata, D-028).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se (D-105 niyam 3). Categories aur raaston ki setting ka kaam. SLA D-162 me.

### D-162. Ticket ka SLA aur kaam ke ghante

- **Faisla:** ticket ka SLA category (D-161) ke hisaab se, kaam ke ghanton me. Niyam:
  1. Paisa (kata par order nahi, refund nahi aaya) aur skin reaction: pehla jawab 4 kaam ke ghante, hal 1 kaam ka din (misaal).
  2. Baaki: 24 kaam ke ghante aur 3 kaam ke din; Beauty Advisor ka sawal 1 kaam ka din (misaal).
  3. Kaam ke ghante misaal Monday se Saturday 10:00 se 18:00 IST; chhuttiyan setting me (D-117 jaisa).
  4. Customer ke jawab ke intezaar me timer ruke; misaal 7 din jawab na aaye to ticket band (dobara khul sake).
  5. SLA tootne pe Support Lead ko in-app alert.
- **Wajah:** Claude ki salah, owner ne maani: zaroori maamle pehle, aur ek insaan (D-009) ke liye sach vaada.
- **Chhode vikalp:** ek SLA sab pe (paise wala maamla bhi dheema); koi SLA nahi (customer ko koi umeed nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se. Timers aur kaam ke ghanton ke calendar ka kaam; sote server (R-002) pe timers late ho sakte hain (Architect).

### D-163. Shikayat ki seedhi aur Grievance Officer

- **Faisla:** support ke faisle ke baad shikayat ki seedhi aur grievance register. Niyam:
  1. Support Agent, phir Support Lead (appeal, D-147), phir Grievance Officer.
  2. "Grievance" ka alag form (bina sign-in bhi), ticket number turant.
  3. Receipt aur hal ke timers (misaal 48 ghante aur 30 din); review ya content ki shikayat ka chhota timer (misaal 24 ghante me receipt).
  4. Grievance register: har shikayat, faisla aur samay; mahine ki report Head of Operations ko (D-044).
  5. Grievance Officer ka role alag account pe (D-017).
- **Badla (owner, 2026-11-19, D-237, D-238):** Grievance Officer ki jaankari dummy nahi, role wale staff account se (D-237). Seller ke products ki shikayat bhi isi seedhi me, seller ticket pe jawab de; receipt me shikayat ka poora text (D-238).
- **Wajah:** Claude ki salah, owner ne maani: gambhir shikayat aam queue me nahi dabti, aur har shikayat ka record rehta hai.
- **Chhode vikalp:** alag raasta nahi, sab ek queue me (gambhir shikayat dab jaati); seedhi bina register (shikayaton ka record nahi).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** site pe Grievance Officer ka saada page R1 se (D-134, officer ki jaankari dummy D-145 niyam 4 se); poora raasta R2 se. Register aur timers ka kaam. Kanooni detail jaanchi nahi (R-004): grievance officer, receipt aur hal ke samay, aur user content ki shikayat ke samay.
- **Badla (owner, 2026-11-20, D-251):** niyam 3 me: content ki shikayat ka hal 7 din me (receipt 24 ghante, jaisa tha); court ya sarkari order ka alag raasta 3 ghante, Master ko alert; baaki shikayat ke timers jaise the.

### D-164. Seller aur delivery partner ke dispute

- **Faisla:** seller ya delivery partner platform ke faisle (receiving ka farak D-096, "brand ki galti" D-112, bharpai D-063, kaat D-068 aur D-103, payout D-081) se asehmat ho to "dispute" ek alag kaam. Niyam:
  1. Faisle ke misaal 7 din (seller) ya 3 din (partner) me, saboot ke saath.
  2. Faisla us team ka senior kare jo pehle faisle me nahi tha (D-084 niyam 3 jaisa).
  3. Faisla misaal 5 kaam ke din me.
  4. Dispute chalte us rakam pe rok (payout ki hold, ya kaat ruki).
  5. Har dispute ka record; seller ke payout statement me dispute ki line.
- **Wajah:** Claude ki salah, owner ne maani: saaf samay, nishpaksh faisla, aur jhagde ki rakam ka hisaab saaf.
- **Chhode vikalp:** sirf ticket, koi tay samay nahi (maamle latakte); sirf Finance tay kare (operations ke maamle Finance ke paas).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se. Dispute ka naya kaam, aur finance me rakam ki hold.

### D-165. Customer ki beauty profile

- **Faisla:** customer optional beauty profile save kar sakta hai, allergens samet. Niyam:
  1. Fields: skin type, depth aur undertone (D-085 ki list), concerns (D-137 ki list), allergy wale ingredients (ingredient master list, D-132, se chune).
  2. Istemaal: product page aur cart pe personal allergen chetavni, search me "meri skin ke liye" ka switch, shade finder (D-168).
  3. Chetavni ke saath hamesha "pack ki list se mila ke dekhein" (master list se milan galat ho sakta hai).
  4. Alag consent ("is jaankari se mujhe salah do"); customer kabhi bhi badle ya mitaye.
  5. Seller ko kabhi nahi; staff sirf tab jab customer khud support me bataye.
- **Wajah:** Claude ki salah, owner ne maani: cosmetics me personal allergen chetavni sabse bada suraksha fayda hai.
- **Chhode vikalp:** profile nahi, chetavni sabke liye ek jaisi hi (personal suraksha nahi); profile bina allergens (suraksha wala hissa chhoot-ta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se; D-159 me jod. Allergy aur skin concerns sehat ke paas ka data: consent, kaun dekhe aur kitne din, Security Architect ke saath (B14). Kanooni detail jaanchi nahi (R-004): sehat ke paas ke data ki consent aur rakhna.

### D-166. Product sujhaav

- **Faisla:** sujhaav product data aur (consent se) customer ki kharid aur profile se. Niyam:
  1. Sab customers ki kharid ke jod se "saath me kharide gaye" (kisi ek customer ki baat nahi).
  2. Staff ki banayi routine templates se "routine poora karo".
  3. Sign-in customer ko uski profile (D-165) aur pichhli kharid se, sirf consent ho to.
  4. Kram ki wahi niti jo search me: kisi seller ko boost nahi (D-139 niyam 3).
- **Wajah:** Claude ki salah, owner ne maani: kaam ke sujhaav, consent ke andar, aur sab sellers ke saath ek niyam.
- **Chhode vikalp:** sirf product data se (personal madad nahi); bahar ki recommendation service (₹0 me nahi, data bahar).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se. Routine templates ka staff kaam aur consent ka hisaab. Kanooni detail jaanchi nahi (R-004): personal data se sujhaav ki consent, aur apne brand ke prachaar me customer data.

### D-167. Reviewer ki skin jaankari

- **Faisla:** review ke saath customer optional fields bata sakta hai, platform ki list se: skin type (oily, dry, combination, normal, sensitive), depth aur undertone (D-085 ki list), umar ka group (misaal 18 se 24, 25 se 34, 35 se 44, 45+). Ye review pe dikhte hain aur inse reviews filter hote hain. Skin ki bimari ka koi field nahi.
- **Wajah:** Claude ki salah, owner ne maani: "meri jaisi skin wale ko kaisa laga" ka sabse kaam ka filter, aur sehat wala data bahar.
- **Chhode vikalp:** sirf variant (shade ke alawa koi madad nahi); concerns bhi (sehat ke paas ka data public review pe).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se (R1 me sirf variant, D-076 niyam 5). Thoda aur personal data aur uski consent. Kanooni detail jaanchi nahi (R-004): review ke saath dikhne wala personal data.

### D-168. Shade finder

- **Faisla:** shade finder (D-085) do tareekon se shade sujhata hai: depth, undertone (aasaan pehchaan: nas ka rang, sone ya chandi ka gehna kis pe achha lagta), finish aur coverage ki pasand ke sawal; aur "jo shade abhi lagate ho": customer platform pe listed kisi brand ka apna abhi ka product aur shade chune, usi ki depth aur undertone se doosre brands ke milte shades. Data sirf listed products ka.
- **Wajah:** Claude ki salah, owner ne maani: customer ka asli anubhav (jo shade use pehle se jachta hai) sabse achha aadhaar hai.
- **Chhode vikalp:** sirf sawal-jawab (customer ki apni pehchaan galat ho sakti); camera se skin tone padhna (roshni aur camera se galat nateeje, aur chehre ki photo ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se. Brands ke beech mel sirf D-085 ke moote data se.

### D-169. Virtual try-on

- **Faisla:** virtual try-on browser me, device pe hi. Niyam:
  1. Camera live (ya ek photo jo device se bahar na jaaye).
  2. Sirf lipstick, lip gloss, blush, eyeshadow aur eyeliner; baaki baad me.
  3. Rang D-085 ke hex se; screen pe note "rang asli se alag dikh sakta hai".
  4. Koi photo ya video server pe nahi jaata, save nahi hota.
  5. Pehli baar camera se pehle saaf consent.
  6. Shade ke rang (hex) ki jaanch ek staff role kare (misaal "Shade Specialist", D-085 niyam 5 ke saath).
- **Wajah:** Claude ki salah, owner ne maani: ₹0 (D-028) me ho sakta hai, chehre ka data device se bahar nahi jaata, aur sabse zyada fayde wali categories me hai.
- **Chhode vikalp:** try-on nahi, alag skin tones pe photos (try-on ka fayda nahi); foundation bhi aur photo server pe (galat nateeje aur chehre ka data server pe).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se (D-055). Camera ka niyam SR-001. Purane phones pe dheema ho sakta; browser me chehre ki pehchaan ki free library ka license aur speed Architect ke saath. Shade Specialist role roles ki list (D-017) me. Kanooni detail jaanchi nahi (R-004): chehre ki photo ya video ki consent.

### D-170. Product pe public Q&A

- **Faisla:** product page pe public sawal-jawab: sawal sign-in se; jawab brand (seller) aur us product ke verified buyers de sakein; brand ke jawab pe "Brand" label; har sawal aur jawab reviews wale moderation niyam (D-136, D-146) se; ilaaj ya dawa jaise sawal pe tay jawab "Skin & Hair Expert se salah lein" (D-025).
- **Wajah:** Claude ki salah, owner ne maani: ek jawab bahut logon ke kaam aata hai, aur Beauty Advisor pe bojh kam hota hai.
- **Chhode vikalp:** public Q&A nahi, sirf Advisor ka thread (har customer ko alag poochhna); sirf brand jawab de (der aur ek-tarfa jaankari).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se. Moderation ka aur kaam.

### D-171. Formula badle to purane reviews

- **Faisla:** listing ki jaanch (D-098) me staff ingredients ke bade badlav ko "formula badla" mark kare; us tareekh se pehle ke reviews pe "pehle ke formula pe" label; rating do roop me dikhe (misaal "naya formula: 4.2 (12)", "kul: 4.0 (340)"). Ye R2 se; R1 me har review pe us waqt ka listing version save hota hai (data).
- **Wajah:** Claude ki salah, owner ne maani: purani jaankari khoti nahi, aur naya customer naye formula ki asli tasveer dekhta hai.
- **Chhode vikalp:** kuch nahi (galat tasveer); naya product, reviews zero se (brand ke saalon ke reviews khatam).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 ke review data me listing version ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1). "Bada badlav" kya hai, ye staff ki samajh (misaal: naya ya hata hua ingredient upar ke 10 me).

### D-172. Consultation ka daam aur seema

- **Faisla:** Beauty Advisor aur Skin & Hair Expert ki consultation (D-025) muft, seema ke saath: ek customer mahine me misaal 2 booking; 2 baar no-show to 30 din booking band; Advisor ka message thread muft (din me misaal 5 sawal).
- **Wajah:** Claude ki salah, owner ne maani: payment aur seva ke invoice ka naya kaam nahi, aur seema se ek insaan ka bojh seemit.
- **Chhode vikalp:** Advisor muft aur Expert paid (payment, refund aur invoice ka kaam); dono muft bina seema (samay pe koi rok nahi).
- **Kab dobara khulega:** asli business pe jaate waqt, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se. Expert ke samay ki keemat nahi. Kanooni detail jaanchi nahi (R-004): dermatologist jaise expert ki online consultation ke niyam (D-025 ki dummy row), aur seva pe GST.

### D-173. Loyalty program

- **Faisla:** loyalty points: har delivered order pe points (misaal har ₹100 pe 1 point, 1 point = ₹1 ki chhoot); points sirf platform pe kharch, cash ya bank me nahi badalte, transfer nahi; program ek staff role sambhale (misaal "Loyalty Manager", Growth Studio me). Tiers baad me, data me jagah rahe.
- **Wajah:** Claude ki salah, owner ne maani: beauty me dobara kharid ka karan banta hai, aur tiers ke niyam aur delivery fee ka hisaab baad tak tal jaata hai.
- **Chhode vikalp:** loyalty nahi, sirf offers (dobara kharid ka khaas karan nahi); tiers + points abhi (tiers ke niyam aur delivery fee, D-107, ka hisaab).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se (D-055). Points ka khaata aur liability finance me. Loyalty Manager role roles ki list (D-017) me. Kanooni detail jaanchi nahi (R-004): points prepaid instrument bante hain ya nahi, aur points pe GST.

### D-174. Points ke niyam

- **Faisla:** points (D-173) ke niyam:
  1. Aadhaar: customer ne jo paisa diya, delivery fee aur Pro daam wali lines ke bina.
  2. Points "pending" jab tak return window (D-080) na nikle; phir pakke. Return ya cancel pe us line ke pending points hatein.
  3. Expiry misaal 12 mahine (har point apni tareekh se); expiry se 30 din pehle in-app aur push se yaad.
  4. Kharch: ek order pe zyada se zyada misaal 20% rakam tak; ek coupon (D-102) ke saath chal sake.
  5. Points se kharida item return ho to points wapas (agar expire nahi hue); paise wala hissa original raaste (D-111).
  6. Review ke badle points nahi (D-158).
- **Wajah:** Claude ki salah, owner ne maani: liability seemit, khel ke raaste band, aur hisaab return ke niyam se mel khata hai.
- **Chhode vikalp:** saada, delivery pe pakke aur expiry nahi (liability behisaab, return pe khel); points se poora order (platform ka kharcha bada).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se. Pending aur expiry ka hisaab finance me. Kanooni detail jaanchi nahi (R-004): points ki expiry aur suchna ke niyam.

### D-175. Points ki chhoot ka paisa

- **Faisla:** points se mili chhoot shuru me sirf platform ka discount: seller ko poora daam (D-101 niyam 1 jaisa), aur finance me points ki liability ka khaata. Baad me brand apne products pe bonus points de sake (brand ka kharcha, budget ke saath, D-101 niyam 2 jaisa).
- **Wajah:** Claude ki salah, owner ne maani: seller ka hisaab saaf rehta hai.
- **Chhode vikalp:** brand ka % har order pe (sellers pe bina poochhe kharcha).
- **Kab dobara khulega:** brand ke bonus points shuru karte waqt, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se. Shuru me saara kharcha platform ka. Kanooni detail jaanchi nahi (R-004): points ki chhoot ka invoice aur GST pe asar.

### D-176. Referral

- **Faisla:** "dost ko bulao" (referral) rok ke saath. Niyam:
  1. Dono ko points (D-173) ka inaam, sirf jab naye customer ka pehla order deliver ho aur return window (D-080) paar ho.
  2. Ek customer ke saal me misaal 10 referrals tak.
  3. Ek hi address, device ya payment wale referral pe inaam nahi.
- **Wajah:** Claude ki salah, owner ne maani: naye customer laane ka sasta raasta, aur fraud ke raaste band.
- **Chhode vikalp:** referral nahi (growth ka ek raasta kam); sirf bulaane wale ko inaam (naye customer ko khaas karan nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 ke baad. `+` alias (D-017) se kai accounts ki pehchaan address, device aur payment ke jod se, Security Architect ke saath (B14).

### D-177. Store credit

- **Faisla:** store credit nahi. Goodwill sirf ek customer ke liye ek baar ke coupon (platform ka offer, D-101) se.
- **Wajah:** Claude ki salah, owner ne maani: naya balance aur khaata nahi chahiye, aur coupon ka raasta R2 me ban hi raha hai. Refund pehle se original raaste hai (D-111).
- **Chhode vikalp:** promo credit (naya balance, khaata aur expiry); wallet (prepaid ke niyam ka seedha jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se. Goodwill coupon ke saath customer ka us order pe doosra coupon nahi chalta (D-102). Support role ki goodwill ki rakam seema Security Architect ke saath (B14).

### D-178. Dobara kharid

- **Faisla:** rozana khatam hone wale products ke liye "dobara order" button aur yaad. Niyam:
  1. Size aur category se andaaza (misaal 100 ml face wash lagbhag 60 din; staff setting).
  2. Customer chahe to yaad chalu kare; yaad in-app aur push se, email nahi (D-141).
  3. Ek tap pe cart me, us din ke daam aur expiry ke saath; koi pehle se payment nahi.
- **Wajah:** Claude ki salah, owner ne maani: dobara kharid ka aasaan raasta, bina mandate aur subscription ke bade kaam ke.
- **Chhode vikalp:** sirf "dobara order" button (customer ko khud yaad rakhna); subscription abhi (mandate, daam ki haan aur stock ke niyam ka bada kaam).
- **Kab dobara khulega:** subscription baad me, kanooni aur payment ki jaanch ke baad.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se; subscription baad me. Kanooni detail jaanchi nahi (R-004): recurring payment mandate ke RBI niyam.

### D-179. Gift cards

- **Faisla:** gift cards ka design abhi, banana kanooni jaanch (R-004) ke baad. Design ke niyam (misaal): tay rakam (₹500, ₹1,000, ₹2,000); code paane wale ke email pe; thoda-thoda kharch; balance dikhe; cash me nahi; gift card se kharida item return ho to rakam gift card me wapas (D-111 ka "original raasta"); khareeda gift card sirf bina istemaal ke cancel.
- **Wajah:** Claude ki salah, owner ne maani: design asli rahe, par paise jaisi cheez kanoon dekhe bina na bane.
- **Chhode vikalp:** gift cards nahi (gifting ka raasta nahi); R2 me test mode me dummy kanooni details ke saath (galat design ka jokhim).
- **Kab dobara khulega:** kanooni jaanch ke baad.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** data aur finance ke khaate design me; banana R2 ke baad. Gift card ka email D-142 ki chhat me. Kanooni detail jaanchi nahi (R-004): prepaid instrument (closed ya semi-closed) ke niyam, gift card ki kam se kam muddat aur KYC, gift voucher pe GST, aur bina kharch ke balance ka hisaab; jawab kanooni jaanch ke baad badal sakta hai.
- **Badla (owner, 2026-11-20, D-249):** gift card sirf RBI-authorised PPI issuer ke zariye, checkout pe payment ke ek tareeke ki tarah; validity kam se kam 1 saal, expiry issue pe dikhe; banana R2 ke baad.

### D-180. Customer app ke sign-in ki umar

- **Faisla:** customer app ka sign-in har istemaal pe 30 din aage badhta hai, zyada se zyada 90 din; phir dobara sign-in. Saath me account ki security badalne pe dobara pehchaan, aur "My devices" se customer kisi bhi session ko band kar sake.
- **Wajah:** Claude ki salah, owner ne maani: guest cart nahi (D-020) aur har sign-in email code (D-021) se hai jo emails ki chhat (D-142) khaata hai; dobara pehchaan aur "My devices" lambe session ka jokhim kam karte hain.
- **Chhode vikalp:** 7 din aage, max 30 din (har hafte sign-in, zyada codes); 90 din aage, max 1 saal (chori ka asar sabse lamba).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Chori hua session 90 din tak chal sakta hai jab tak customer band na kare.

### D-181. Staff, seller aur creator apps ke session

- **Faisla:** staff ke 7 apps (Admin, Super Admin, Master, Support Desk, Finance, Logistics Ops, Growth Studio) me session 12 ghante, aur 30 minute bina kaam pe band. Seller app me har istemaal pe 7 din aage, zyada se zyada 30 din. Creator app (R2) me 30 din aage, zyada se zyada 90 din.
- **Wajah:** Claude ki salah, owner ne maani: staff ke liye ek kaam ka din, seller ke liye hafte me ek sign-in, Creator customer jaisa; owner ke ~80 accounts (D-017) pe isse kada bojh bhaari padta.
- **Chhode vikalp:** kada (staff 8 ghante aur 15 minute, seller 1 din aage, max 7 din); dheela (staff 24 ghante aur 2 ghante, seller aur creator 90 din tak).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se (Creator R2). Numbers settings me rahein.

### D-182. Galat password ya code pe rok

- **Faisla:** baar-baar galat password ya code pe rok IP aur account mila ke. Niyam (numbers misaal):
  1. Ek IP se 15 minute me 10 galat koshish: us IP se us account pe 1 ghante ki rok.
  2. Saare IPs mila ke 15 minute me 50 galat: poore account pe 15 minute ki rok.
  3. Rok ke dauraan "password bhool gaye" chalta rahe, aur rok ke dauraan ki koshishein gini na jaayein.
- **Wajah:** Claude ki salah, owner ne maani: andaaza rukta hai, aur koi galat password daal ke asli user (jaise owner ke staff accounts) ko band nahi kar sakta.
- **Chhode vikalp:** sirf account pe rok (rok khud hamle ka hathiyar); account pe koi rok nahi (andaaze pe kam rok).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Bahut IPs wala hamlavar 15 minute ki poori rok tak pahunch sakta hai; ginti Redis me ho to restart pe thodi der shuru se (R-010).

### D-183. Delivery app ka sign-in aur phone

- **Faisla:** delivery partner email aur password se sign-in kare. Partner ka ek manzoor phone (Hub Manager manzoor kare; naya phone = nayi manzoori); session usi phone pe misaal 14 din; authenticator optional; Hub Manager kabhi bhi session band kar sake.
- **Wajah:** Claude ki salah, owner ne maani: offline app (D-042) ke saath chalta hai, phone khone pe Hub Manager turant band kar sakta hai, aur gig partner (D-033) pe roz ka bojh nahi.
- **Chhode vikalp:** har shift authenticator (phone chori = dono factor gaye); bina bandish 30 din ka session (chori ka asar lamba).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Phone ki pehchaan browser me rakhi key se; browser ka data saaf hone pe dobara manzoori. Hub Manager ke kaam me naya phone manzoor karna.

### D-184. Seller app me authenticator kin users pe

- **Faisla:** seller app me authenticator jokhim ke hisaab se zaroori: Account Owner, Finance, aur jis bhi user ko daam, payout ya bank, seller ke staff, ya maal bhejne ka haq ho. Sirf listing content ya reports wale users bina authenticator.
- **Wajah:** Claude ki salah, owner ne maani: jahan seller ka seedha nuksaan ho sakta hai wahan doosra factor, aur content likhne walon pe bojh nahi.
- **Chhode vikalp:** sirf Account Owner aur Finance (daam aur maal bina doosre factor); saare seller users (chhote brand pe bojh).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. D-017 ki misaal (Account Owner, Seller Finance) isse badi list me aati hai. Kisi user ko naya haq milte hi authenticator zaroori ho jaaye.

### D-185. Bade kaamon pe dobara authenticator code

- **Faisla:** sign-in ke baad bhi in kaamon se theek pehle dobara authenticator code (misaal 5 minute ki khidki): role ya grant dena aur hatana; authenticator reset; allowlist badalna (D-133); area ke switches aur live karna; fees, policy ke numbers, HSN table, blocklist aur emails ki chhat badalna; payout "paid"; seema se upar refund ya daawe ki manzoori; data export; seller ka bank badalna; kill switches. Authenticator band karna aur naye recovery codes banana har baar apna alag code maangein.
- **Wajah:** Claude ki salah, owner ne maani: khula chhoda session ya chori hui cookie se sabse bade kaam na hon, aur roz ka kaam na ruke.
- **Chhode vikalp:** staff ke har likhne wale kaam pe (kaam bahut dheema); sirf Master ke kaamon pe (Finance aur Admin ke bade kaam bina code).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Naye bade kaam aane pe list badhani hogi; list ek jagah (code me ek list) rahe.

### D-186. Har app ka apna sign-in

- **Faisla:** har app ka apna sign-in aur apni cookies; ek central sign-in app nahi.
- **Wajah:** Claude ki salah, owner ne maani: owner ke har role ka alag account hai (D-017), to zyadatar ek account ek hi app me jaata hai; central sign-in se bojh kam nahi hota, aur redirect aur code se hamle ke naye raaste khulte.
- **Chhode vikalp:** ek central sign-in app (ek jagah chori = saare apps, banane ka kaam bada); abhi alag aur asli business pe central (baad me badlav ka kaam).
- **Kab dobara khulega:** owner khud khole, jaise asli business pe kai apps wale staff aayen.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. 11 apps alag hosts pe (D-048), to cookies har host ki alag. Password manager se sign-in aasaan.

### D-187. Code wale emails ki seema

- **Faisla:** bina sign-in maange jaane wale code ke emails (sign-in, sign-up, password reset) ki seema (numbers misaal): ek email ko ghante me 5 code (ek IP se unme 3 tak); saare emails mila ke ghante me 30; sign-up ke codes din me 20. Allowlist (D-133) band karte waqt numbers dobara dekhe jaayein.
- **Wajah:** Claude ki salah, owner ne maani: codes maang-maang ke din ki OTP ki jagah (D-142) koi kha na sake, aur sign-up ki baadh me bhi password reset, invite aur security codes ke liye jagah bache.
- **Chhode vikalp:** kada (ek email 3, sab 15, sign-up 10); dheela (ek email 10, sab 60, sign-up 60; ek ghante me OTP ki din ki jagah khatam ho sakti).
- **Kab dobara khulega:** allowlist band karte waqt (asli business).
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Bhaari ghante me asli user ko "thodi der baad koshish karein" ka sandesh. Numbers settings me.

### D-188. Support Agent ki manzoori ki seema

- **Faisla:** Support Agent ek maamle me misaal ₹2,000 tak aur din me kul misaal ₹10,000 tak refund ya daawa khud manzoor kare; usse upar Support Lead (doosra account). Fail hue refund ka staff wala raasta (D-111) hamesha Support Lead aur Finance ki manzoori se.
- **Wajah:** Claude ki salah, owner ne maani: chori hua account ya mili-bhagat ek account se bada nuksaan na kar sake, aur chhote maamle ek hi account se chalein.
- **Chhode vikalp:** koi seema nahi, sirf audit (ek account se bada nuksaan); har insaani faisle pe doosre account ki haan (har chhote maamle pe do accounts ka bojh).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se (Support Desk ka patla hissa, D-105). Bade maamle thodi der se. Goodwill coupon ki seema isi dhaanche pe alag sawal.

### D-189. Payout "paid" do haath se

- **Faisla:** Finance role payout batch banaye, aur Master ka doosra account (D-047) use manzoor kare; ek hi account batch banana aur "paid" mark karna, dono kaam nahi kar sakta.
- **Wajah:** Claude ki salah, owner ne maani: chori hua ek account seller ka paisa "paid" nahi dikha sakta, aur Master ke paas roz ke kaam ka haq nahi aata.
- **Chhode vikalp:** Finance role akela (ek account ka jokhim); sirf Master (D-047 ki soch ke khilaaf).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se (R1 me payout haath se "paid", [PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Owner ke liye har hafte do accounts se kaam. Dono kadam audit me.

### D-190. Seller ka bank khaata badle to

- **Faisla:** seller apna bank ya payout ka khaata badle to dobara authenticator code, purane email aur in-app pe khabar, aur naye khaate pe misaal 72 ghante tak payout nahi; us dauraan Account Owner "ye maine nahi kiya" daba ke badlav rok sake. Asli business pe naye khaate ka pehla payout Seller Ops ki jaanch ke baad bhi.
- **Wajah:** Claude ki salah, owner ne maani: sellers ka paisa platform ke paas rehta hai (D-093); account chori karke bank badalna sabse seedha nuksaan hai, aur rok usse bachati hai.
- **Chhode vikalp:** sirf staff ki jaanch, abhi se (staff ka kaam); koi rok nahi, sirf khabar (chori ka seedha raasta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 me design; bank badalne ke baad payout 3 din der se. Staff ki jaanch wala hissa asli business pe.

### D-191. Delivery ke saboot ka samay aur pahunch

- **Faisla:** delivery ki photo aur partner ki location (D-072) delivered se misaal 180 din tak, ya khula daawa, dispute ya chargeback band hone tak (jo baad me ho). Dekhe: daawe pe Support Agent aur Support Lead, aur apne hub ka Hub Manager; partner submit ke baad nahi; customer apni delivery ki photo dekh sake.
- **Wajah:** Claude ki salah, owner ne maani: saboot daawe (D-148), partner ke dispute (D-164) aur chargeback (D-095) tak bachta hai, aur ghar ki photo aur location kam haathon me.
- **Chhode vikalp:** 30 din (baad ka dispute ya chargeback bina saboot); 1 saal (zyada data zyada der).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se; samay ke baad apne aap delete. Chargeback ki asli samay-seema payment gateway ke niyam se pakki karni hai (tathya ki jaanch). Kanooni detail jaanchi nahi (R-004): photo aur location jaise personal data rakhne ka samay.
- **Jod (owner, 2026-11-20, D-250):** samay ke baad photo aur location mitti hain; kanooni rok me sirf unka record (kab, kisne, kis maamle me, hash).

### D-192. Daawe, pickup aur pack ki photos ka samay

- **Faisla:** customer ke daawe ki photos (D-106) aur return pickup ki photo (D-113) maamla band hone ke misaal 180 din baad delete; video misaal 90 din; warehouse pe pack ki photo delivered ke misaal 90 din, ya daawa ho to daawe ke saath. Dekhe: us maamle ka Support staff aur warehouse ka jaanch wala staff.
- **Wajah:** Claude ki salah, owner ne maani: jhagde ke liye saboot bachta hai, aur ghar ya chehre wali photos bina zaroorat lambi nahi rehti.
- **Chhode vikalp:** sab 90 din (lamba jhagda bina saboot); sab 1 saal (zyada storage aur personal data).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se; alag-alag samay ka delete job. Kanooni detail jaanchi nahi (R-004): customer ki photo aur video rakhne ke niyam.
- **Jod (owner, 2026-11-20, D-250):** photos aur video apne samay pe mitein; kanooni rok me sirf unka record (kab, kisne, kis maamle me, hash).

### D-193. Seller aur Beauty Pro ke dastavez

- **Faisla:** pehchaan ke dastavez ka samay aur pahunch. Niyam (numbers misaal):
  1. Reject hui application ke dastavez 30 din baad delete; sirf faisla aur wajah rahe.
  2. Manzoor seller ke KYC dastavez (PAN, GSTIN ka certificate, brand authorisation) account chalne tak, aur band hone ke 3 saal baad delete (kanooni jaanch ke baad number badal sakta hai).
  3. Claims ke saboot (D-100) unki expiry ke 1 saal baad; Beauty Pro ke dastavez (D-069) darje ki muddat ke 1 saal baad.
  4. Dekhe: sirf jaanch wali team (Seller Ops, catalog ki jaanch, Pro ki jaanch) aur Trust & Safety; seller apne dastavez.
- **Wajah:** Claude ki salah, owner ne maani: jaanch, dobara jaanch aur jhagde ke liye dastavez rehte hain, par leak ka bada bhandaar nahi banta.
- **Chhode vikalp:** sab hamesha (leak ka bada bhandaar); jaanch ke baad turant delete (jhagde ya dobara jaanch pe dastavez nahi).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** seller ke liye R1 se, Beauty Pro ke liye R2 se (D-055). Kanooni detail jaanchi nahi (R-004): KYC aur tax ke records kitne din rakhne zaroori hain.
- **Badla (owner, 2026-11-19, D-227):** niyam 2 badla: tax records wale dastavez (GSTIN certificate, TCS ke statements, invoices) 72 mahine (misaal); baaki KYC 3 saal.

### D-194. Audit log aur records ka samay

- **Faisla:** audit log misaal 2 saal (paise ke kaamon ka audit kanooni jaanch ke baad lamba ho sakta hai); sign-in aur security events misaal 1 saal; delete hue account ke bina pehchaan records (invoice, ledger) kanooni samay tak; backups me purana data backup ki umar tak.
- **Wajah:** Claude ki salah, owner ne maani: jaanch ke liye audit bachta hai, par jagah (R-006) aur IP jaisa personal data bina hadd nahi badhta. D-151 ne records ka samay yahin chhoda tha.
- **Chhode vikalp:** sab 400 din (saal bhar baad ki jaanch me kami); audit hamesha (jagah aur personal data badhte rehte).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Audit ke cluster ki 0.5 GB jagah (R-006) ka hisaab architecture me. Kanooni detail jaanchi nahi (R-004): logs rakhne ka samay (CERT-In ke niyam) aur tax records ka samay.
- **Jod (owner, 2026-11-20, D-250):** request logs aur security events apne store me kam se kam 180 din, aur 13 May 2027 (lagbhag) se 1 saal; delete hue data ki kanooni rok D-250 ke niyam se.

### D-195. Push aur email me kitni jaankari

- **Faisla:** browser push me sirf order number aur haalat (misaal "Order 1234: out for delivery"); product ka naam, rakam, address aur delivery code push me kabhi nahi. Email me order ki detail (D-126), par poora address sirf invoice me.
- **Wajah:** Claude ki salah, owner ne maani: push lock screen pe koi bhi dekh sakta hai, kuch beauty aur personal care products niji hote hain, aur delivery code (D-072) saboot hai.
- **Chhode vikalp:** push me product ka naam bhi (niji product lock screen pe); push aur email me poori detail (sabse zyada leak).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Detail ke liye customer ko app kholna padta hai.

### D-196. Backup files encrypted

- **Faisla:** backup command (D-013) apni files ek key se encrypt kare; key password manager me, repo me kabhi nahi; restore command key maange; laptop pe misaal sirf aakhri 3 backups, purane apne aap delete.
- **Wajah:** Claude ki salah, owner ne maani: backup me saara data hai, aur D-013 ke 4 pehre git se bachate hain, laptop chori, malware ya Desktop ke cloud sync se nahi.
- **Chhode vikalp:** bina encryption, sirf disk encryption (laptop pe khula data); encrypted copy alag device pe bhi (owner ne abhi nahi chuni).
- **Kab dobara khulega:** owner khud khole (jaise alag device pe copy chahiye ho).
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se, backup command ke saath. Key kho jaaye to backup bekaar: key ka bachav password manager ke saath. Laptop kharab ho to backup bhi jaata hai.

### D-197. Secrets badalne ka samay

- **Faisla:** secrets (databases ke passwords, payment gateway ki keys, apps se backend ka secret, email ki key, sign-in providers ke secrets, encryption keys) shak ya incident pe turant, tay kram se; baaki saal me ek baar sab; token sign karne wali keys apne aap (misaal har 30 din); asli business pe kisi staff ke jaane pe turant.
- **Wajah:** Claude ki salah, owner ne maani: leak hua secret badalna hi ilaaj hai, par ek insaan ke liye ~20 secrets baar-baar badalna galti ka mauka bhi hai.
- **Chhode vikalp:** har 90 din sab (bahut kaam aur galti ka mauka); sirf incident pe (chupchaap leak kabhi theek nahi hota).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Secrets ki list aur badalne ka kram operations ke doc me (DevOps ke saath). Keys apne aap badlein to purani key thodi der tak jaanch ke liye chalti rahe.

### D-198. Data leak pe users ko khabar

- **Faisla:** personal data ka leak pakka ho to asar wale users ko email aur in-app, misaal 72 ghante ke andar: kya hua, kaunsa data, unhe kya karna hai; site pe ek patti; aur jo sarkari report kanooni jaanch bataye. R1 me iska likha hua kram (runbook).
- **Wajah:** Claude ki salah, owner ne maani: registrations dummy hain par system me asli personal data (owner aur testers ka) hai, aur design asli business jaisa (D-026).
- **Chhode vikalp:** sirf gambhir leak pe khabar (chhota leak chhup jaata); koi khabar nahi (asli business ke liye galat aadat).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se (runbook operations ke doc me). Emails ki chhat (D-142) me jagah chahiye. Kanooni detail jaanchi nahi (R-004): data leak pe users aur sarkari sanstha ko suchna ka samay aur tareeka.
- **Badla (owner, 2026-11-20, D-248):** "72 ghante" ki jagah teen ghadiyaan: users ko leak pakka hote hi bina der; Data Protection Board ko bina der aur 72 ghante me poori report; CERT-In ko 6 ghante me.

### D-199. Staff ka doosra factor

- **Faisla:** R1 me har staff account (staff ke 7 apps) pe password ke saath authenticator app (6 digit code); passkey R2 me ek aur raasta. Asli business pe Master aur Finance pe passkey zaroori karna owner tab tay kare.
- **Wajah:** Claude ki salah, owner ne maani: R1 me kaam kam; domain nahi (D-028) to nakli sign-in page ka jokhim hai, jisse passkey R2 me bachati hai.
- **Chhode vikalp:** R1 se passkey pehla raasta (har app ke alag host pe passkey banane ka kaam zyada); hamesha sirf authenticator (phishing ka jokhim hamesha).
- **Kab dobara khulega:** asli business pe (Master aur Finance pe passkey), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Authenticator app me 50 se zyada entries. Authenticator ke secrets aur passwords ek hi password manager me hon to dono factor ek jaise ho jaate hain: owner ke liye saavdhani.

### D-200. Authenticator kho jaaye to

- **Faisla:** staff ka authenticator kho jaaye to reset ka raasta:
  1. Pehle recovery codes (10, har code ek baar).
  2. Staff account ka reset Master account kare: dobara authenticator code, audit, us account ke saare sessions band, aur user ko email.
  3. Master ka apna reset sirf recovery codes se; wo bhi na hon to owner ke laptop se ek "break-glass" command jo seedha database pe reset kare aur audit me likhe.
- **Wajah:** Claude ki salah, owner ne maani: owner ka phone kho jaaye to bhi accounts wapas milte hain, aur reset ka raasta kabze ka aasaan raasta nahi banta.
- **Chhode vikalp:** ek alag security role sabka reset kare (ek role ke paas sabki chaabi); email code se reset (inbox hi authenticator ban jaata).
- **Kab dobara khulega:** passkey aane pe (D-199), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Recovery codes offline sambhalne hain. Break-glass command ke liye production database ki pahunch laptop pe chahiye (backup command ke liye pehle se, D-013).

### D-201. Staff ko customer ki jaankari

- **Faisla:** staff ko customer ki jaankari kam se kam. Niyam:
  1. Lists me naam ka pehla hissa aur shehar, aadha email, phone ke aakhri 4 ank.
  2. Poori jaankari sirf maamla kholne pe, wajah chun ke; har baar dekhna audit me.
  3. Delivery partner ko sirf apne active parcel ka naam, address aur phone; delivered ke misaal 24 ghante baad chhupa.
  4. Warehouse aur hub ko sirf order number aur label.
- **Wajah:** Claude ki salah, owner ne maani: staff ki lists se customers ka data bahar jaana sabse aasaan raasta hai; sellers ke liye D-143 pehle se tay tha.
- **Chhode vikalp:** support ko hamesha poori (list se poora data bahar ja sakta); jise kaam ho use poori (sabse zyada leak).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Support ko ek click zyada aur audit ka kaam. Kanooni detail jaanchi nahi (R-004): staff ke paas personal data ki pahunch ke niyam.

### D-202. Support customer ban ke nahi

- **Faisla:** support staff customer ka account usi ki nazar se nahi dekhta, aur uske naam se kaam nahi karta; support ki apni screens (order, return aur refund ki haalat) customer jaisa dikhati hain.
- **Wajah:** Claude ki salah, owner ne maani: "customer ki nazar" se staff ke haq aur chhupi jaankari (D-201) dono ka bypass ho jaata.
- **Chhode vikalp:** sirf dekhne wala mode, audit aur khabar ke saath (sirf dekhne me bhi poora data); customer ban ke poora kaam (sabse bada jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 me Support Desk ke patle hisse (D-105) me support ki screens.

### D-203. Ek insaan ke kai accounts aur per-customer seemaayein

- **Faisla:** email ke `+` alias wale accounts alag hi rehte hain (D-017), par per-customer seemaon (D-109, D-116, D-156, D-176) ke liye ek jod bhi gina jaata hai. Niyam:
  1. Jod: wahi address (ek roop me karke), wahi payment ki pehchaan (gateway de to), aur wahi browser ki device cookie.
  2. Email ka bina `+` wala roop sirf ek ishara, faisla nahi.
  3. Jod pe apne aap rok sirf tay seemaon (jaise D-109) pe; baaki staff ki review queue me.
- **Wajah:** Claude ki salah, owner ne maani: naye alias se naya account bana ke koi per-customer seema dobara shuru na kar sake, aur owner ke alag accounts (D-017) bhi bane rahein.
- **Chhode vikalp:** email ka ek roop hi ek insaan (owner ke saare customer aliases ek gine jaate); koi jod nahi (har per-customer seema bekaar).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 me D-109 wala jod; baaki seemaon ke saath R2 se. Jod ka data bhi personal data hai. Owner ke apne customer aliases ek hi address pe hon to "pehle order" wali seema saath lagegi: testing me dhyaan. Kanooni detail jaanchi nahi (R-004): device ki pehchaan aur accounts ka jod rakhne ke niyam.
- **Jod (owner, 2026-11-20, D-255):** notice aur Terms me "per-customer seemaayein aur galat istemaal ki rok" ek maqsad ki tarah; device cookie sirf isi kaam ke liye.

### D-204. Khule delivery-pe-UPI orders ki seema

- **Faisla:** ek customer (D-203 ke jod ke saath) ke ek waqt me misaal 2 khule delivery-pe-UPI orders, aur unki kul rakam D-109 ki seema tak.
- **Wajah:** Claude ki salah, owner ne maani: delivery pe UPI me stock delivery tak ruka rehta hai (D-118), to bina payment kai orders se stock roka na ja sake; D-109 sirf rakam aur mana karne ki ginti dekhta tha.
- **Chhode vikalp:** ek waqt me 1 khula order (aur kada); koi alag seema nahi (stock rokne ka raasta khula).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Kabhi asli customer ka teesra order prepaid hi hoga.

### D-205. Goodwill coupon ki seema

- **Faisla:** support ke goodwill coupon (D-177) ki seedhi (numbers misaal): Support Agent ek coupon ₹200 tak, ek customer ko saal me 2 tak; Support Lead ₹1,000 tak; usse upar Head of Operations (D-044); platform ka mahine ka kul goodwill budget ₹10,000.
- **Wajah:** Claude ki salah, owner ne maani: coupon paise jaisa hai, to chori hua account ya mili-bhagat bina seema nuksaan na kare; dhaancha refund ki seema (D-188) jaisa.
- **Chhode vikalp:** koi seema nahi, sirf audit (bada nuksaan ho sakta); sirf Support Lead de (chhote goodwill pe bhi Lead).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se (D-177). Seema aur budget settings me; har coupon audit me.

### D-206. Bina sign-in forms pe bots ki rok

- **Faisla:** "Contact us" (D-161) aur grievance (D-163) jaise bina sign-in wale forms pe CAPTCHA nahi. Rok: pehle form me diye email pe code se pakka karna, ek chhupa "honeypot" field, aur IP aur email pe rate limit. Asli business pe (allowlist band hone pe, D-133) dobara dekhna.
- **Wajah:** Claude ki salah, owner ne maani: allowlist ke rehte itna kaafi hai, aur bahar ki CAPTCHA script se visitors ka data bahar nahi jaata (D-157 ki soch).
- **Chhode vikalp:** free CAPTCHA service (bahar ki script aur data); dono saath (dono ka kaam).
- **Kab dobara khulega:** allowlist band karte waqt (asli business).
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se (grievance ka page R1 me sirf jaankari, D-163). Code ka email D-142 ki chhat me.

### D-207. Sehat ke data ki pahunch

- **Faisla:** sehat se jude data ki pahunch maamle ke hisaab se. Niyam:
  1. Consultation notes (D-025): sirf wo Skin & Hair Expert jisne consult kiya ya jise maamla diya gaya; Support Lead sirf maamla khulne pe, wajah ke saath, audit me; customer apne notes dekhe.
  2. Skin reaction case (D-130): Support Lead aur Skin & Hair Expert; brand ko sirf batch aur bina pehchaan ka saar.
  3. Allergy wali beauty profile (D-165): sirf customer; staff tabhi jab customer khud support me bataye.
- **Wajah:** Claude ki salah, owner ne maani: ye privacy ka sabse gambhir data hai, to kam se kam haath, par customer ki shikayat pe Support kuch dekh sake.
- **Chhode vikalp:** saare Experts aur Support roles (bahut haathon me data); sirf Expert, Support kabhi nahi (shikayat pe Support andha).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se (D-055). D-025 ke "zaroori support roles" ab saaf. Kanooni detail jaanchi nahi (R-004): sehat ke data ki consent aur pahunch ke niyam.

### D-208. Sehat ke data ka samay

- **Faisla:** consultation notes aakhri consult ke misaal 2 saal baad delete; skin reaction case band hone ke misaal 3 saal baad (batch aur recall ka itihaas, D-129); allergy profile jab tak customer na mitaye, aur account delete pe turant.
- **Wajah:** Claude ki salah, owner ne maani: data bina zaroorat lamba nahi rehta, par batch ki dikkat aur recall ka itihaas bachta hai.
- **Chhode vikalp:** sab 1 saal (batch ka itihaas kho sakta); sab account delete tak (bina zaroorat lamba).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R2 se; alag-alag samay ka delete job. Kanooni detail jaanchi nahi (R-004): cosmetics ke side-effect ke records aur sehat ke data rakhne ka samay.
- **Jod (owner, 2026-11-20, D-250):** delete pe data app se turant hat-ta hai, phir kanooni rok ke niyam se.

### D-209. Security report docs me kaise aaye

- **Faisla:** Security Architect ki report ke niyam, threats aur risks area ke hisaab se batches me aate hain. Niyam:
  1. Claude har area (edge aur hosting, sign-in, sessions, authorization aur sellers ki deewar, checkout aur paisa, files aur personal data, data stores aur services, export, audit, logs aur DevOps, R2 ke hisse) ke niyam tay faislon se mila ke SR-002 se aage, us area ke threats aur risks ke saath, ek sawal me rakhe.
  2. Owner har batch pe haan ya badlav de; haan ke baad hi [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md), [security/THREAT_MODEL.md](security/THREAT_MODEL.md) aur [RISKS.md](RISKS.md) me.
  3. Tay faislon pe dhyaan ke points apne area ke batch me; jo pehle se kisi faisle me sambhal gaye, unka sirf hawala.
  4. Report ki "sirf jaanch" wali technical cheezein Claude khud saboot ke saath jaanche ([RISKS.md](RISKS.md) §2 jaisa); kanooni wali kanooni jaanch (R-004) ke liye.
- **Wajah:** Claude ki salah, owner ne maani: har batch itni chhoti ki padhi ja sake, aur har niyam faislon se mila hua rahe.
- **Chhode vikalp:** ek badi batch (padhna mushkil, galti chhoot sakti); har niyam alag sawal (bahut lamba); pehle se haan aur seedha docs me (galat niyam docs me aa sakta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** lagbhag 9 batches. Report ke IDs (threats, niyam, risks) naye docs me nahi jaate; har cheez naye number (SR-xxx, R-xxx) aur naye vakya me.

### D-210. Security batch 1: edge aur hosting

- **Faisla:** edge aur hosting ke niyam SR-002 se SR-010 ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)), unke 7 threats ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.1), aur risks R-015 (alag WAF ya DDoS ki suraksha nahi) aur R-016 (payment page ki bahar ki script) `Maana` ([RISKS.md](RISKS.md)). Niyamon ke numbers misaal hain aur settings me rahenge.
- **Wajah:** Claude ki salah, owner ne maani: har request ka pehla pehra (backend ka seedha raasta band, asli client IP, cache, headers, seemaayein, rate limits, kill switches) pehle din se.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (aage ka design bina edge ke pehre ke).
- **Kab dobara khulega:** asli naap ke baad numbers (settings se, bina deploy), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. SR-002 aur SR-003 ka tareeka Vercel aur Render ke headers ki jaanch pe tika hai ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2).

### D-211. Security batch 2: sign-in

- **Faisla:** sign-in ke niyam SR-011 se SR-026 ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)), unke 15 threats ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.2), aur risks R-017 (domain ke bina nakli sign-in pages) aur R-018 (customer ka account inbox jitna surakshit) `Maana` ([RISKS.md](RISKS.md)). D-021 ka "authenticator laga ho to email code ke baad bhi" ab pakka (SR-015). Numbers misaal hain aur settings me rahenge.
- **Wajah:** Claude ki salah, owner ne maani: sign-in ke tay faisle (D-021, D-133, D-182 se D-187, D-199, D-200) jaanchne layak niyamon me, aur domain ke bina nakli page ke jokhim ke saath.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (sign-in ka design bina pakke niyam ke).
- **Kab dobara khulega:** passkey aane pe (D-199), asli naap ke baad numbers, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Leak hue passwords ki free API ka chunaav aur social providers ke verified email ki jaanch technical charcha me.

### D-212. Security batch 3: sessions aur tokens

- **Faisla:** sessions aur tokens ke niyam SR-027 se SR-031 ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)), unke 6 threats ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.3), aur [RISKS.md](RISKS.md) ke R-010 me jod: sessions aur unke band hone ka sach database me, aur rate limits ki ginti restart ke baad thodi der shuru se, ye maana. Numbers misaal hain aur settings me rahenge.
- **Wajah:** Claude ki salah, owner ne maani: session ki umar (D-180, D-181) aur har app ki apni cookies (D-186) ke tay faisle jaanchne layak niyamon me; band hua session Redis restart ke baad bhi band rahe.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (sessions ka design bina pakke niyam ke).
- **Kab dobara khulega:** asli naap ke baad numbers, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Refresh cookie `__Secure-` prefix ke saath sign-in wale path pe, kyunki `__Host-` me path `/` hi ho sakta hai.

### D-213. Security batch 4: authorization aur sellers ki deewar

- **Faisla:** authorization aur sellers ki deewar ke niyam SR-032 se SR-039 ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)) aur unke 7 threats ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.4). Is batch me naya risk nahi.
- **Wajah:** Claude ki salah, owner ne maani: BOLA aur sellers ke beech ka pehra pehle din se, aur kaam ke bantwara ke tay faisle (D-084, D-146, D-147, D-188, D-189) code ke pakke checks me.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (authorization ka design bina pakke niyam ke).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Har route aur actor ka matrix test contracts se (SR-032); QA ke test plan me.

### D-214. Security batch 5: catalog, checkout aur paisa

- **Faisla:** catalog, checkout aur paise ke niyam SR-040 se SR-053 ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)) aur unke 14 threats ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.5). Is batch me naya risk nahi. Numbers misaal hain aur settings me rahenge.
- **Wajah:** Claude ki salah, owner ne maani: daam, stock, payment, refund, seema aur bank badlav ke tay faisle (D-061, D-087, D-091, D-109, D-111, D-118, D-188 se D-190, D-204, D-205) code ke pakke pehron me, kyunki paise ka seedha nuksaan yahin hota hai.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (checkout aur finance ka design bina pakke niyam ke).
- **Kab dobara khulega:** asli naap ke baad numbers, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se (goodwill R2). Checkout ka hisaab kai services ke data se banta hai (D-016 niyam 9); services ke beech ka tareeka architecture me.

### D-215. Security batch 6: delivery, daawe aur reviews

- **Faisla:** delivery, daawe aur reviews ke niyam SR-054 se SR-060 ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)), unke 9 threats ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.6), aur risk R-019 (delivery partner ke phone pe offline data) bachav ke saath `Khula` ([RISKS.md](RISKS.md)). Numbers misaal hain aur settings me rahenge.
- **Wajah:** Claude ki salah, owner ne maani: "parcel nahi mila" ka faisla saboot se hota hai (D-072, D-148), to saboot jaali na ho sake; jhoothe daawe, nakli reviews aur jhoothi reports ke tay faislon (D-116, D-135, D-136, D-156) ko code ke pehre.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (delivery aur daawon ka design bina pakke niyam ke).
- **Kab dobara khulega:** asli naap ke baad numbers, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se (kai accounts ke review signals R2). Browser me gallery ki photo poori tarah nahi rukti; ye seema maani, hash aur location ke nishaan se kam. Delivery code confirmation email me hai (D-126), par sirf "out for delivery" aur usi partner pe chalta hai (SR-054).

### D-216. Security batch 7: files aur personal data

- **Faisla:** files aur personal data ke niyam SR-061 se SR-067 ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)), unke 8 threats ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.7), aur risk R-020 (uploads ki malware jaanch nahi) `Maana` ([RISKS.md](RISKS.md)). Numbers misaal hain aur settings me rahenge.
- **Wajah:** Claude ki salah, owner ne maani: ek bura file ek process wale backend (D-049) tak na pahunche, private media leak na ho, aur data ke samay (D-191 se D-194, D-208) aur account delete (D-151) ke faisle chalane wale niyam hon.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (uploads aur data ka design bina pakke niyam ke).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, asli naap ke baad numbers, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se (sehat ka data R2). Images ka dobara encode aur encryption CPU aur memory lete hain (R-007). Kanooni detail jaanchi nahi (R-004): KYC me Aadhaar ya doosre ID ke niyam, aur personal data ke delete ke niyam.
- **Jod (owner, 2026-11-20, D-255):** upload form pe "Aadhaar ki copy mat bhejein"; galti se aayi copy reject aur turant delete.

### D-217. Security batch 8: data stores, services aur khabrein

- **Faisla:** data stores, services aur khabron ke niyam SR-068 se SR-074 ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)), unke 9 threats ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.8), aur risks R-021 (ek process me saari services) aur R-022 (databases ka network khula ho sakta) `Maana` ([RISKS.md](RISKS.md)).
- **Wajah:** Claude ki salah, owner ne maani: har service ka apna database aur user (D-011, D-050) code ke pehre se bhi alag rahe, kyunki Render pe process ki deewar nahi (D-049, D-056); emails aur push me kam se kam jaankari (D-195).
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (services aur khabron ka design bina pakke niyam ke).
- **Kab dobara khulega:** providers ki network allowlist ki jaanch ke baad (R-022), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Service ki deewar ke lint aur dependency rules architecture aur QA ke saath. Break-glass command (D-200) bhi production database tak judne wala ek tay raasta hai.

### D-218. Security batch 9: export, audit, logs aur DevOps

- **Faisla:** export, audit, logs aur DevOps ke niyam SR-075 se SR-084 ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)), unke 10 threats ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.9), aur risks ([RISKS.md](RISKS.md)): R-023 (laptop aur providers ke accounts), R-024 (seemit logs aur alerts) aur R-025 (bahar ki jaanch nahi) `Maana`; R-026 (supply chain) aur R-027 (public repo) bachav ke saath `Khula`. D-144 ke export pe 5,000 rows se upar owner ko alert. Numbers misaal hain aur settings me rahenge.
- **Wajah:** Claude ki salah, owner ne maani: ek insaan aur free tier pe hamla der se pakda ja sakta hai, to audit, alerts aur likha hua kram (D-198) pehle se; repo public hai aur owner ka laptop aur providers ke accounts poore system ki chaabi hain.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (operations aur incident ka design bina pakke niyam ke).
- **Kab dobara khulega:** asli business se pehle (bahar ki jaanch, R-025), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Secrets ki list, badalne ka kram aur incident ka kram operations ke doc me (DevOps ke saath). Kanooni detail jaanchi nahi (R-004): logs rakhne aur incident ki report ke niyam (jaise CERT-In), aur privacy page me backups ka zikr.

### D-219. Security batch 10: R2 ke hisse aur invoice ki copy

- **Faisla:** R2 ke niyam SR-085 (points, coupons aur gift cards), SR-086 (Meet link aur Advisor ke links) aur SR-087 (bina sign-in forms), aur R1 ka SR-088: seller ko invoice ki copy sirf ek-ek karke download, har download audit me, bulk export me kabhi nahi ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)); unke 5 threats ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.9 aur §1.10). Is batch ke saath Security Architect ke pehle run ki saari batches (D-210 se D-219) poori.
- **Wajah:** Claude ki salah, owner ne maani: paise jaise R2 ke hisse (D-102, D-174, D-176, D-179) aur Meet link (D-025) ke pehre design me pehle se; invoice ki copy wala dhyaan point (D-143) kisi batch me nahi aaya tha.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (R2 ke niyam baad me).
- **Kab dobara khulega:** kanooni jaanch (R-004) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** SR-088 R1 se, baaki R2 se. Doosra security run architecture ke baad ke faislon ka review karega, aur OWASP ke naye versions se milaan bhi. Kanooni detail jaanchi nahi (R-004): invoice ki copy pe customer ka naam aur address zaroori hai ya nahi; points aur gift cards ke prepaid niyam.

### D-220. Kanooni jaanch ke nateeje docs me kaise aayein

- **Faisla:** kanooni jaanch (R-004) ke pehle run ke nateeje is tareeke se aate hain. Niyam:
  1. **Asar ke sawal:** tay faislon pe asar ke points owner ke sawal ban ke aate hain, vikalp aur salah ke saath, discovery ke niyam se: jo kisi khule sawal pe tike nahi wo ek saath, jude hue ek group me. Jawab se naya D-xxx, aur jahan faisla badle wahan "badla" line (D-018).
  2. **Area batches:** baaki nateeje [COMPLIANCE.md](COMPLIANCE.md) me 4 batches me (tax; Legal Metrology; cosmetics kanoon; e-commerce aur consumer kanoon). Har batch ek sawal (maano, badlav ke saath maano, ya roko), D-209 jaisa. Har row naya number (CL-001 se) aur naye vakya me, COMPLIANCE ke format me, saath me source aur uski tareekh.
  3. **Aadha jaancha:** ye points isi status ke saath COMPLIANCE me aate hain. Jab primary source khule, Claude khud jaanch ke status badle.
  4. **DECISIONS ki "jaanchi nahi" lines** jaisi hain waisi rehti hain, kyunki lawyer se ab bhi nahi jaancha (R-004); §0 me ek line ki public source se milaan COMPLIANCE me hai.
  5. Report ke IDs naye docs me nahi jaate; har cheez naye number aur naye vakya me.
- **Wajah:** Claude ki salah, owner ne maani: pehle faisle saaf hote hain, phir COMPLIANCE unhi faislon ke hisaab se likha jaata hai, to dobara badalna nahi padta; har batch itni chhoti ki padhi ja sake.
- **Chhode vikalp:** ek badi batch (padhna mushkil, faisle aur COMPLIANCE ulajh sakte); pehle se haan aur seedha COMPLIANCE me (galat ya adhoori kanooni baat docs me aa sakti).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** sawal me "15 asar ke points" likha tha; report me asal me 29 hain (Claude ki ginti ki galti; tareeka wahi). Sabse zyada jokhim wale pehle aate hain. Kanooni detail jaanchi nahi (R-004): koi nateeja lawyer se nahi jaancha.
- **Badla (owner, 2026-11-20, D-257):** niyam 4: "jaanchi nahi" lines tab tak jaisi hain jab tak Lawyer ya CA agent (D-257) us point ko na dekhe; dekhne aur owner ki haan ke baad "Lawyer ne jaancha" ya "CA ne jaancha".

### D-221. Return ki muddatein aur kanoon

- **Faisla:** return ki muddatein likhi hoti hain, aur kharab maal pe lambi. Niyam:
  1. Har muddat invoice, order page aur return policy page pe likhi ho.
  2. Kharab maal, nakli ka shak, aur galat item, shade ya size: 30 din (misaal) tak return.
  3. Dikhne wali galti (toota, leak, pighla, item kam): 48 ghante saboot ka niyam. 48 ghante ke andar daawa photo se seedha; baad ka daawa bhi liya jaata hai, par staff ki zyada jaanch ke saath, seedha mana nahi.
  4. Man badla: 7 din (misaal), jaisa D-080 me.
  5. Muddat ke baad bhi support ka raasta: jaanch, seedha mana nahi; batch ki dikkat pe recall (D-129).
- **Wajah:** Claude ki salah, owner ne maani: kanoon ka 30 din ka default aur E-commerce rules ka rule 6(3) dono sambhal jaate hain, aur 48 ghante ka niyam saboot ke liye bana rehta hai.
- **Chhode vikalp:** sirf muddatein likh do, numbers waise hi (rule 6(3) aur kam din ka jokhim); sab wajahon pe 30 din (man badle pe bhi; hygiene aur seller ke paise pe bojh).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-080 niyam 1, 2 aur 4 badle. Seller ke payout (D-081) pe 30 din ka asar finance ki charcha me. Kanooni detail jaanchi nahi (R-004): rule 6(3) aur Consumer Protection Act s.2(47)(viii) public source se mile, lawyer se nahi.

### D-222. Der se delivery pe return

- **Faisla:** "der se pahuncha" return ki ek wajah hai. Niyam:
  1. "Der" = dikhaye vaade ki tareekh (D-117) ke baad.
  2. Door pe lene se mana: poora refund, delivery fee samet.
  3. Lene ke baad: 7 din (misaal) me return, customer pe return ka koi kharcha nahi; band maal ki shart (D-079) wahi.
  4. Force majeure (baadh, band, hadtaal): staff flag lagaye, wajah ke saath; customer ko wajah dikhe, tab ye haq nahi.
  5. Der ka kharcha (wapsi, fee) platform ka, seller ka nahi.
- **Wajah:** Claude ki salah, owner ne maani: kanoon ka haq poora milta hai, aur kharcha usi pe jiski der hai (delivery hamari, D-014).
- **Chhode vikalp:** sirf door pe mana (lene ke baad raasta nahi); jaisa hai, sirf khabar (rule 6(3) se takrav ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-117 niyam 4 badla, D-079 ki wajahon me jod. R1 me (D-055 me jod). Kanooni detail jaanchi nahi (R-004): rule 6(3) public source se mila, lawyer se nahi.

### D-223. Pichhle 30 din ka sabse kam daam

- **Faisla:** jahan bhi kata MRP ya "% off" dikhe, saath me "pichhle 30 din ka sabse kam daam", R1 se. Itihaas 30 din se kam ho (naya product) to jitne din ka hai, utne din ka likh ke.
- **Wajah:** Claude ki salah, owner ne maani: data D-061 me hai, ek hi display ka niyam banta hai, aur 2027 ke niyam se pehle badlav ka kaam nahi bachta.
- **Chhode vikalp:** jaisa hai, 2027 se pehle badlav (design aur tests dobara); "% off" hatao (customer ko bachat nahi dikhti).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-120 niyam 3 badla: ab R1 se aur har discount pe, sirf "sale" label pe nahi. R1 me (D-055 me jod). Kanooni detail jaanchi nahi (R-004): E-commerce rules ka 2026 ka badlav sirf secondary source se mila; kata MRP "price reduction" ka daawa hai ya nahi, pakka nahi.

### D-224. Test wale claims ka saboot

- **Faisla:** claims do hisson me. Niyam:
  1. Ghoshna wale (jaise vegan, fragrance-free): seller ki ghoshna, jaisa D-100 me.
  2. Test wale (dermatologically tested, clinically proven, non-comedogenic, hypoallergenic, SPF aur PA): R1 se hi saboot (test report, dummy, D-026) ke saath; bina saboot wo claim chuna nahi ja sakta.
  3. Saboot ki jaanch SPF wale raaste se (D-100 niyam 3).
- **Wajah:** Claude ki salah, owner ne maani: SPF ka saboot wala raasta R1 me ban hi raha hai, aur galat daawa filters tak nahi pahunchta.
- **Chhode vikalp:** test wale claims R1 me list se bahar (kam claims aur filters); jaisa hai (unfair trade practice ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-100 niyam 5 badla. R1 me (D-055 me jod). Kanooni detail jaanchi nahi (R-004): Consumer Protection Act s.2(47)(i)(g) public source se mila, lawyer se nahi.

### D-225. Account delete aur tax archive

- **Faisla:** account delete pe jaari invoice nahi badalta. Niyam:
  1. Jaari invoice aur credit note ki asli copy (naam aur pata samet) ek alag, kam pahunch wale tax archive me, 72 mahine (misaal) tak, aur koi jhagda chale to uske khatam hone tak, bina badlav.
  2. Archive sirf finance ka role dekhe, har dekhna audit me.
  3. App ki baaki jagah (profile, orders ki list, reports, ledger ke views) se pehchaan hat jaati hai.
  4. Samay poora hone pe archive se bhi delete.
- **Wajah:** Claude ki salah, owner ne maani: tax record nahi badalta, aur personal data sirf ek band jagah pe, tay samay tak.
- **Chhode vikalp:** chhote invoice pe naam hi na chhaapo (do tarah ka niyam, archive phir bhi chahiye); invoice me bhi naam aur pata hata do (tax record badalne ka jokhim).
- **Kab dobara khulega:** personal data ki kanooni jaanch (doosra run) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-151 niyam 1 badla. R1 me (D-055 me jod). Archive ki pahunch aur audit security docs me. Kanooni detail jaanchi nahi (R-004): CGST Act s.36 aur rule 46 public source se mile (kuch hissa secondary); personal data wala hissa doosre run me.
- **Jod (D-280, 2026-11-20):** records ke samay ki do classes: platform ke apne books 8 financial years, sellers ke tax documents 72 mahine (misaal).

### D-226. Invoice pe customer ka naam aur pata

- **Faisla:** invoice pe customer ki jaankari rakam ke hisaab se. Niyam:
  1. ₹50,000 se kam: invoice pe customer ka state (aur shehar ya pincode); naam aur pata sirf customer chahe to.
  2. ₹50,000 ya zyada: naam aur pata invoice pe, aur seller ki copy me bhi.
  3. Seller ki copy ka niyam (SR-088: ek-ek karke download, audit) waisa hi.
- **Wajah:** Claude ki salah, owner ne maani: kanoon jitna maangta hai utna hi, aur D-143 ka "kam personal data" bana rehta hai.
- **Chhode vikalp:** har invoice pe naam aur pata (personal data zyada haathon me); R1 me ₹50,000 se kam ki cart seema (bade orders ruk sakte).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-143 niyam 3 ka saaf roop. Kanooni detail jaanchi nahi (R-004): CGST rules ka rule 46 public source se mila, lawyer se nahi.

### D-227. Seller ke tax wale dastavez

- **Faisla:** seller ke dastavez ka samay unke kism se: tax records ka hissa (GSTIN certificate, TCS ke statements, invoices) 72 mahine (misaal); baaki KYC (PAN ki copy, brand authorisation) 3 saal, jaisa D-193 me. Pakka number personal data ki kanooni jaanch (doosra run) ke baad.
- **Wajah:** Claude ki salah, owner ne maani: tax ke dastavez kanoon jitna rehte hain, baaki jaldi hatte hain.
- **Chhode vikalp:** sab 72 mahine (zyada personal data zyada der tak); sab 3 saal (tax records jaldi hatne ka jokhim).
- **Kab dobara khulega:** personal data ki kanooni jaanch (doosra run) ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-193 niyam 2 badla. Kanooni detail jaanchi nahi (R-004): CGST Act s.36 public source se mila, lawyer se nahi.
- **Jod (D-280, 2026-11-20):** records ke samay ki do classes: platform ke apne books 8 financial years, sellers ke tax documents 72 mahine (misaal).

### D-228. Kit aur combo pe GST

- **Faisla:** kit aur combo pe GST is tarah. Niyam:
  1. Brand ka kit (R1): listing pe kit ki cheezon ke rates me se sabse zyada wala default; seller badle to wajah ke saath, staff jaanche.
  2. Combo (R2): shuru hone se pehle CA se tay ho ki ek daam = mixed supply (sabse zyada rate), ya har cheez ka daam alag dikha ke alag supplies. Tab tak D-088 niyam 3 ka "daam baantna" sirf design me, laagu nahi.
- **Wajah:** Claude ki salah, owner ne maani: R1 ka kit kanoon ke saath seedha chalta hai, aur combo R2 me hai, to CA ki salah ke liye samay hai.
- **Chhode vikalp:** combo me har cheez ka daam alag (ek daam wala combo nahi); jaisa hai (galat tax ka jokhim).
- **Kab dobara khulega:** CA ki salah aane pe, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-088 niyam 3 badla. Kanooni detail jaanchi nahi (R-004): CGST Act s.8(b) public source se mila; CA aur lawyer se nahi.
- **Jod (D-278, 2026-11-20):** combo aur shart wale gift ka tareeka tay: har cheez apne daam aur rate pe, agar alag se bhi bikti ho (D-278).

### D-229. Free sample aur shart wala gift

- **Faisla:** do tarah. Niyam:
  1. Bina shart ka sample (brand ki marzi se, kisi kharid ki shart ke bina): tax invoice ke bahar, packing slip pe "free sample, not for sale".
  2. Shart wala gift ("X kharido to Y free"): R2 me bhi tab tak nahi jab tak CA se invoice ka tareeka tay na ho.
- **Wajah:** Claude ki salah, owner ne maani: sample ka aam tareeka chalta rehta hai, aur shart wala gift tabhi jab tax ka tareeka pakka ho.
- **Chhode vikalp:** shart wala gift bhi, daam ka hissa baant ke, bina CA ke (galat ho sakta); jaisa hai, ₹0 ki line (galat invoice ka jokhim).
- **Kab dobara khulega:** CA ki salah aane pe, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-121 niyam 2 badla. Kanooni detail jaanchi nahi (R-004): CBIC circular 92/11/2019 sirf secondary source se.
- **Jod (D-278, 2026-11-20):** shart wale gift ka invoice D-278 ke niyam se.

### D-230. Platform ka barcode label kahan

- **Faisla:** platform ka barcode label (D-097) pack ki khaali jagah pe, ya pack ke bahar ke polybag ya sleeve pe; khaali jagah na ho to polybag. Niyam:
  1. Kabhi batch, expiry, MRP, ingredients ya kisi bhi likhawat ke upar nahi.
  2. Receiving pe label lagne ke baad photo; Warehouse app me jaanch ka kadam.
- **Wajah:** Claude ki salah, owner ne maani: pack ki koi likhawat nahi dhakti, aur photo se saboot rehta hai.
- **Chhode vikalp:** hamesha polybag (kharcha aur plastic); sirf bin pe label (unit ka scan nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-097 me jod. Kanooni detail jaanchi nahi (R-004): Cosmetics Rules rule 35 public source se mila, lawyer se nahi.

### D-231. Tax ghatne pe revised MRP

- **Faisla:** batch pe "revised MRP" ka field. Niyam:
  1. Batch pe optional "revised MRP (tax badlav)", saboot ke saath (manufacturer ki suchna ya naya sticker); staff jaanche.
  2. Revised MRP ho to site ka MRP, daam ki seema (D-061 niyam 1), "% off" (D-120), pichhle 30 din ka daam (D-223) aur invoice usi se.
  3. Seller ka daam revised MRP se upar ho to us batch ki bikri ruke aur seller ko alert (D-064 niyam 2 jaisa).
- **Wajah:** Claude ki salah, owner ne maani: ek field se kanoon ka niyam sambhal jaata hai, aur daam ke baaki niyam usi pe chalte hain.
- **Chhode vikalp:** naya batch maan ke dobara receiving (stock ki ginti me ulajh); jaisa hai (naye MRP se zyada daam ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-061 aur D-064 me jod. Kanooni detail jaanchi nahi (R-004): Legal Metrology (Packaged Commodities) Rules rule 18(3) public source se mila; 2025 ki MRP sticker wali chhoot sirf secondary source se.

### D-232. "Use before" aur "expiry" ka din

- **Faisla:** batch pe expiry ka roop. Niyam:
  1. Receiving pe batch pe roop: "Use before" ya "Expiry", pack jaisa.
  2. System ka "aakhri din" usi se: use before = mahine ka pehla din; expiry = mahine ka aakhri din.
  3. Seemaayein (D-062, D-082) isi aakhri din se gini jaati hain.
  4. Customer ko pack jaisa text dikhta hai (D-067).
- **Wajah:** Claude ki salah, owner ne maani: har pack ka sahi din, aur customer ko wahi jo pack pe hai.
- **Chhode vikalp:** hamesha mahine ka pehla din ("expiry" wale packs ki bikri ek mahina pehle band); jaisa hai (ek mahine ka galat hisaab).
- **Kab dobara khulega:** kanooni jaanch primary source se kuch aur bataye, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-062 aur D-082 me jod. Kanooni detail jaanchi nahi (R-004): Cosmetics Rules ka 2025 ka badlav sirf secondary source se.

### D-233. Apne brand ka naam

- **Faisla:** apne brand aur uski dummy company (D-031) ka naam "Beautinique" se nahi milta.
- **Wajah:** Claude ki salah, owner ne maani: apna brand pehle se alag company hai, aur alag naam se 2027 ke "platform ke naam jaisa seller" wale niyam ka alag consent ka kaam nahi bachta; D-166 jaisa hai waisa.
- **Chhode vikalp:** naam platform jaisa, aur sujhaav me alag opt-in (ek aur consent); jaisa hai (2027 se takrav ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-031 me jod. Dummy company aur brand ka naam D-145 niyam 7 ki dummy list me. Kanooni detail jaanchi nahi (R-004): E-commerce rules ka 2026 ka badlav (rule 5(6)) sirf secondary source se.
- **Jod (owner, 2026-11-19, D-243):** naam: brand "Unibelle", seller company "Unibelle Cosmetics Pvt Ltd"; platform se alag, to ye faisla laagu.

### D-234. Chhote packs pe batch na ho to

- **Faisla:** platform ka batch id. Niyam:
  1. Listing pe "pack pe batch nahi" sirf do maamlon me (10 g ya 25 ml tak ka pack, ya soap); staff jaanche.
  2. Receiving pe platform ka batch id: receiving lot + banne ka mahina ya expiry.
  3. Daawe (D-106) aur pickup (D-113) me batch ki photo ki jagah pack aur label ki photo.
- **Wajah:** Claude ki salah, owner ne maani: minis aur soap jaise products bhi aa paate hain, aur batch ka record platform ke id se bana rehta hai.
- **Chhode vikalp:** batch zaroori (minis, samples aur soap bahar); jaisa hai (daawe aur pickup atak jaate).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-064, D-106 aur D-113 me jod. Kanooni detail jaanchi nahi (R-004): Cosmetics Rules rule 34(2)(a) public source se mila, lawyer se nahi.

### D-235. Chhote packs ke label pe ingredients na hon to

- **Faisla:** label pe ingredients na hon (60 ml ya 30 g tak ke packs) to bahar ke carton ki photo, ya brand ki product specification (dummy, D-026); staff usi se milata hai. Product page pe poori list waise hi.
- **Wajah:** Claude ki salah, owner ne maani: ingredients ka saboot bana rehta hai, aur chhote packs bhi aa paate hain.
- **Chhode vikalp:** sirf seller ki ghoshna (galat allergen chetavni ka jokhim); label photo zaroori (chhote packs bahar).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-099 me jod. Kanooni detail jaanchi nahi (R-004): Cosmetics Rules rule 34(7) public source se mila, lawyer se nahi.

### D-236. Bahut chhote packs aur MRP

- **Faisla:** 10 g ya 10 ml tak ke packs tabhi list hote hain jab pack pe MRP chhapa ho; baaki daam ke niyam jaise hain.
- **Wajah:** Claude ki salah, owner ne maani: ek saral niyam, aur MRP wale minis aa paate hain.
- **Chhode vikalp:** "reference price" ka field (MRP ke bina daam ki seema kamzor); R1 me aise sab packs bahar.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-061 me jod. Kanooni detail jaanchi nahi (R-004): Legal Metrology ki chhote packs wali chhoot public source se mili, lawyer se nahi.

### D-237. Grievance Officer aur nodal person

- **Faisla:** Grievance Officer aur nodal person apne staff ke roles hain, sarkari log nahi. Unki jaankari (naam, designation, contact) dummy nahi hoti; wo us staff ki asli jaankari hai jiske paas role hai.
- **Wajah:** owner: ye dono apne staff ke roles hain; pehle inhe sarkari log samjha tha, isliye dummy kaha tha.
- **Chhode vikalp:** Claude ki salah: demo me "Dummy Grievance Officer" jaisa naam, "DUMMY" badge ke saath; sirf role ka naam; insaan jaisa banawati naam.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah nahi maani.
- **Asar (Claude):** D-145 niyam 4 badla; D-163 ki "officer ki jaankari dummy" wali baat bhi badli. Roles ki list (D-017) me Grievance Officer (D-163 niyam 5) ke saath Nodal Officer judta hai, alag account pe. Page pe naam, designation aur contact role wale staff account se aate hain, to role kisi aur ko diya jaaye to page apne aap badle. Abhi saare staff accounts owner ke hain (D-017), to live site pe owner ki di hui jaankari public dikhegi. Repo me koi asli naam nahi (public repo niyam): ye sirf database me. Kanooni detail jaanchi nahi (R-004): E-commerce rules rule 4(1) aur 4(4) public source se mile, lawyer se nahi.
- **Jod (owner, 2026-11-20, D-253):** Grievance Officer hi personal data ke sawalon ka sampark (DPDP Rules ka rule 9): contact website pe, aur data ke haq ke har jawab me.

### D-238. Seller ki jaankari aur seller pe shikayat

- **Faisla:** seller ka block aur ek hi shikayat ki seedhi. Niyam:
  1. Product page pe "Sold by" ke saath seller ka business naam, pata, customer care contact aur seller ka grievance officer. Dummy seller pe dummy jaankari ("DUMMY" badge); jahan kaam apna role karta hai, wahan dummy nahi (D-241). Ye L2: iske bina seller live nahi.
  2. Seller ke products ki shikayat bhi platform ki usi seedhi (D-163) me; seller ko ticket dikhe aur wo jawab de, timers wahi.
  3. Receipt (email aur in-app) me shikayat ka poora text.
- **Wajah:** Claude ki salah, owner ne maani: customer ko pata rehta hai ki maal kisne becha, aur har shikayat ek hi jagah, ek hi timers se.
- **Chhode vikalp:** sirf seller ka naam aur pata, seller ka grievance officer nahi (kanoon ka seller wala hissa adhoora); jaisa hai.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-134 me naya row aur D-163 me jod. Seller ka grievance officer seller ki apni jaankari hai. R1 ka doosra brand dummy hai, to uska dummy. Apna brand dummy company hai par use apne roles chalate hain (Own-Brand Manager, D-031), to Claude ki samajh me D-241 se uske grievance officer ka bhi apna staff role banta hai; owner chahe to badle. Kanooni detail jaanchi nahi (R-004): rules 5(3)(a), 6(4), 6(5) public source se mile; receipt me copy wala niyam sirf secondary source se.

### D-239. Tax ke chhote sudhaar

- **Faisla:** ye sudhaar maane gaye:
  1. **HSN aur rate (D-086):** table ki row = HSN + description ki shart + rate + tareekh; seller row chune, staff jaanche.
  2. **Invoice kab (D-041):** invoice pack ya dispatch ke scan pe; pack se pehle cancel ho to invoice nahi; baad me cancel ya return pe credit note.
  3. **Delivery fee ka GST (D-107):** fee ka SAC aur rate CA se tay; rate table me tareekh ke saath.
  4. **TDS ka pal (D-081):** income-tax TDS seller ke ledger me pehle credit pe (ya payment pe, jo pehle ho); return pe ulat ka niyam CA se.
  5. **Doosre state ka GSTIN (D-092, R2):** checkout pe state code ka milaan aur saaf chetavni ki tax credit shayad na mile.
  6. **D-134 me do rows:** e-invoice ka field (L1) aur har warehouse state me TCS registration ka field (L1).
- **Wajah:** Claude ki salah, owner ne maani: kanooni jaanch ke chhote nateeje tay faislon me seedhe jud jaate hain.
- **Chhode vikalp:** badlav ke saath maanna; abhi rokna (galat tax ke jokhim bache rehte).
- **Kab dobara khulega:** CA ki salah aane pe, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-041, D-081, D-086, D-092, D-107 aur D-134 me jod. Kanooni detail jaanchi nahi (R-004): HSN aur s.31 public source se mile; credit note, delivery fee ka naya niyam, TDS, B2B tax credit aur e-invoice ki seema sirf secondary source se.

### D-240. Listing, pages aur compliance ke chhote sudhaar

- **Faisla:** ye sudhaar maane gaye:
  1. **Country of origin (D-138):** filter ke saath sort me bhi, aur search me country ka naam.
  2. **Blocklist (D-132):** do hisse: drug ingredients (D-128) aur "cosmetic me mana" ingredients (IS 4707 Part 2 ki list); har entry pe source.
  3. **Seller ka undertaking (D-098):** seller agreement me content sahi hone ka undertaking, aur har listing submit pe checkbox, pehle se tick nahi.
  4. **Legal pages (D-150):** "Payments" (payment ke tareeke, fees, charge-back) aur "Kram kaise" (search aur sujhaav ke mukhya gun, saral shabdon me) pages bhi.
  5. **Recall ke emails (D-142):** recall ki email line OTP ke baad sabse pehle, paise ke emails se bhi pehle; chhat paar ho to in-app aur push usi din.
  6. **Dark patterns (D-134):** saal ka self-audit aur certificate ka record (audit ki checklist aur dummy certificate) L3 jaisa, 2027 se pehle.
- **Wajah:** Claude ki salah, owner ne maani: kanooni jaanch ke chhote nateeje tay faislon me seedhe jud jaate hain.
- **Chhode vikalp:** badlav ke saath maanna; abhi rokna (kanoon ke chhote hisse adhoore).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** D-098, D-132, D-134, D-138, D-142 aur D-150 me jod. Kanooni detail jaanchi nahi (R-004): Legal Metrology rule 6(10A), Cosmetics Rules rule 39, E-commerce rules 5(2) aur 5(3) public source se mile (IS ki list khud nahi khuli); dark patterns ka saal ka audit sirf secondary source se; recall emails ka kram Claude ki salah hai, kanoon ki seema nahi.

### D-241. Apne roles ki jaankari dummy nahi

- **Faisla:** jahan bhi docs me dummy naam ki baat hai, aur wahan wo kaam apna role karta hai, wahan jaankari dummy nahi hoti: us kaam ka staff role banta hai, aur jaankari us role wale staff account se aati hai. Dummy sirf registrations, licence numbers aur bahar ki (dummy) companies ki jaankari ke liye (D-026).
- **Wajah:** owner: apne roles ke log apne staff hain; unke liye dummy naam nahi, unke roles banenge.
- **Chhode vikalp:** apne roles ke liye bhi dummy naam (D-145 niyam 4 ka pehla roop).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Owner.
- **Asar (Claude):** ab tak ki jagahein: Grievance Officer aur nodal person (D-237, D-145 niyam 4), D-163, platform ka customer care contact (D-026 me jod), aur apne brand ke seller wale officers (D-238, Claude ki samajh). Jab bhi kisi naye kaam ke liye kisi insaan ki jaankari chahiye, pehle dekha jaata hai ki wo kaam apna role karta hai ya bahar ki company. Live site pe ye jaankari public dikhti hai; abhi saare staff accounts owner ke hain (D-017). Repo me koi asli naam nahi (public repo niyam): ye sirf database me.

### D-242. Platform, apne brand aur companies ke naam

- **Faisla:** naam is tarah (dono companies dummy, D-026). Niyam:
  1. Storefront (website aur apps): "Beautinique".
  2. Platform company (storefront chalane wali): "Beautinique Pvt Ltd".
  3. Apne brand ki seller company (D-031): "Beautinique Brands Pvt Ltd".
  4. Brand (pack pe naam): "Beautinique".
  5. Dono companies ke poore naam alag; product page pe "Sold by" me seller company ka naam.
- **Wajah:** owner ka faisla (2026-11-19): apne brand ke liye aise hi karna hai.
- **Chhode vikalp:** apne brand aur uski dummy company ka naam platform se alag (D-233, Claude ki salah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Owner.
- **Asar (Claude):** D-233 badla, D-031 me badla. Seller company alag hi hai, to D-031 ke niyam (TCS, TDS, settlement, catalog ki jaanch) waise hi. Naam platform jaisa hone se 2027 ke "platform ke naam jaisa seller" wale niyam (rule 5(6)) ka customer data ka sawal uthta (D-243 ke baad laagu nahi). Kanooni detail jaanchi nahi (R-004): do companies ke milte-julte naam ke niyam, trademark, aur rule 5(6) (sirf secondary source se).
- **Badla (owner, 2026-11-19, D-243):** niyam 3 aur 4 badle: apni seller company "Unibelle Cosmetics Pvt Ltd" aur brand "Unibelle". Storefront aur platform company (niyam 1, 2) waise hi.

### D-243. Apne brand ka naam: Unibelle

- **Faisla:** apna brand "Unibelle", aur uski seller company (D-031) "Unibelle Cosmetics Pvt Ltd" (dummy). Storefront "Beautinique" aur platform company "Beautinique Pvt Ltd" jaise D-242 me.
- **Wajah:** owner: Beautinique ka matlab "Beauty + Unique" hai; apne brand ka matlab wahi chahiye, par naam alag. Unibelle = uni (unique) + belle (beauty). Claude ne naam sujhaye aur Unibelle ki salah di, owner ne maani. Naam me "Beautinique" ka koi hissa nahi, to 2027 ke rule 5(6) ka alag consent nahi chahiye (D-233 jaisa).
- **Chhode vikalp:** brand aur seller company ka naam platform jaisa (D-242; ek aur consent ka kaam); doosre sujhaye naam (Solabelle, Onelle, Unaura).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Owner (matlab aur naam alag); Salah maani (Unibelle).
- **Asar (Claude):** D-242 badla, D-233 phir laagu, D-031 me badla. Apne brand ke liye customer data ke alag consent ka sawal laagu nahi. Naam D-145 niyam 7 ki dummy list me. Kanooni detail jaanchi nahi (R-004): "Unibelle" pehle se kisi ka trademark (class 3) ya brand hai ya nahi, ye nahi jaancha; asli business se pehle trademark search zaroori.

### D-244. COMPLIANCE batch 1: tax

- **Faisla:** kanooni jaanch ke tax hisse ki 24 rows (CL-001 se CL-024: GST rates, invoice aur credit note, e-invoice, discount, samples, kit, platform ki fees aur delivery fee ka invoice, GST TCS, income-tax TDS, apna brand, seller ka registration, nasht maal, B2B invoice, tax records, gift voucher, consultation, demo ke documents) jaisi prastaavit thi waisi [COMPLIANCE.md](COMPLIANCE.md) me, source ke link aur tareekh ke saath.
- **Wajah:** Claude ki salah, owner ne maani: finance aur catalog ke design ko tax ka ek tay aadhaar milta hai, aur jahan faisla badalna tha wo pehle hi tay ho gaya (D-221 se D-241).
- **Chhode vikalp:** badlav ke saath maanna; batch rokna (finance ka tax aadhaar baad me).
- **Kab dobara khulega:** CA ki salah, kanooni jaanch ka primary source, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** CA ke liye khule sawal (replacement, platform ka discount, points, delivery fee, TDS ki baaki shartein, nasht maal pe GST, paid consultation) design me option ki tarah rehte hain. Kanooni detail jaanchi nahi (R-004): har row ka status COMPLIANCE me; CA aur lawyer se nahi.

### D-245. COMPLIANCE batch 2: Legal Metrology

- **Faisla:** kanooni jaanch ke Legal Metrology hisse ki 14 rows (CL-025 se CL-038: MRP, online declarations, unit sale price, country of origin, manufacturer se importer tak ke naam, customer care, batch ka aur revised MRP, mfg date aur expiry, net quantity, samples, kit, chhote packs, veg ya non-veg dot, Pro buyers aur MRP) jaisi prastaavit thi waisi [COMPLIANCE.md](COMPLIANCE.md) me, source ke link aur tareekh ke saath.
- **Wajah:** Claude ki salah, owner ne maani: listing ke zaroori fields aur MRP ke niyam ek tay aadhaar pe.
- **Chhode vikalp:** badlav ke saath maanna; batch rokna (listing ke fields ka aadhaar baad me).
- **Kab dobara khulega:** kanooni jaanch ka primary source, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** catalog me nayi cheezein: product page pe "Pack ki jaankari" ka hissa; manufacturer, packer, marketer aur importer ke alag fields; galat declaration ki report pe staff listing ko jaanch tak rok sake (wajah ke record ke saath); system se nikla unit sale price; "pack pe dot" ka field aur "vegan" claim se takrav ki jaanch; "not for retail sale" wale packs list nahi hote. Kanooni detail jaanchi nahi (R-004): rules ka text doosri site pe rakhi copy se; 2025 ki MRP sticker wali chhoot sirf secondary source se.

### D-246. COMPLIANCE batch 3: cosmetics kanoon

- **Faisla:** kanooni jaanch ke cosmetics kanoon (Drugs and Cosmetics Act 1940, Cosmetics Rules 2020) wale hisse ki 20 rows (CL-039 se CL-058: label ke fields, expiry ki jaankari, use before aur expiry ka din, batch, ingredients aur allergens, imported cosmetics, licence, cosmetic aur drug ki seema, AYUSH, mana ingredients, animal testing, recall, skin reaction, lautaye maal ki dobara bikri, expired maal, bechne ka licence, label na badalna, khaas products, samples, reviews ke daawe) jaisi prastaavit thi waisi [COMPLIANCE.md](COMPLIANCE.md) me, source ke link aur tareekh ke saath.
- **Wajah:** Claude ki salah, owner ne maani: listing ki jaanch, batch aur expiry, recall aur returns ka ek tay kanooni aadhaar.
- **Chhode vikalp:** badlav ke saath maanna; batch rokna (listing aur returns ke niyamon ka aadhaar baad me).
- **Kab dobara khulega:** kanooni jaanch ka primary source (jaise 2025 ka gazette), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** nayi cheezein: listing ki jaanch me label ki checklist (category ke hisaab se, hair dye aur fluoride toothpaste jaise khaas products samet); imported listing pe RC number, RC holder aur retention ki agli tareekh ki yaad; imported batch pe 6 mahine ki expiry ki chetavni; "mana shabdon" ki list (senior role ke haath me, description, seller ke content aur brand ke jawab pe bhi); AYUSH label pe drug type; claim ka naam "certified cruelty-free (certifier)"; recall pe "regulator ko suchna" ka field; skin reaction ka case brand ko bina customer ki pehchaan ke; returns me storage ki jaanch; expired batch ki pick aur dispatch pe rok; allergen chetavni ke saath "pack ki list dekhein" ki line. Kanooni detail jaanchi nahi (R-004): Cosmetics Rules ka sarkari text 2020 ka; 2025 ka badlav sirf secondary source se; IS 4707 ki list aur AYUSH ke niyam nahi khule.
- **Jod (owner, 2026-11-20, D-256):** "mana shabdon" me Drugs and Magic Remedies Act ki Schedule ka alag hissa, har shabd ke saath Schedule ka number; seller content, description, Creator aur sponsored content sab pe.

### D-247. COMPLIANCE batch 4: e-commerce aur consumer kanoon

- **Faisla:** kanooni jaanch ke e-commerce aur consumer kanoon wale hisse ki 29 rows (CL-059 se CL-087: platform aur seller ki jaankari, return aur refund, grievance, daam aur bhed, kram aur sponsored, platform ke naam jaisa seller, product liability, seller ka undertaking, dark patterns, consent, discount, claims, endorsement, reviews, cancel, demo store, legal pages, points ki expiry, recall, der se delivery, invoice pe seller ka naam, ullanghan wale sellers, bundled fee, imported maal) jaisi prastaavit thi waisi [COMPLIANCE.md](COMPLIANCE.md) me, source ke link aur tareekh ke saath. Isse kanooni jaanch ke pehle run ke saare nateeje docs me aa gaye (D-220).
- **Wajah:** Claude ki salah, owner ne maani: pages, product page, checkout, shikayat aur reviews ke niyam ek tay kanooni aadhaar pe.
- **Chhode vikalp:** badlav ke saath maanna; batch rokna (pehla run adhoora).
- **Kab dobara khulega:** kanooni jaanch ka primary source (jaise 2026 ka gazette), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-19. **Nishaan:** Salah maani.
- **Asar (Claude):** nayi cheezein: About ya Contact page (company dummy; customer care, grievance officer aur nodal person apne roles, D-241); National Consumer Helpline ka field; product page pe return ki line aur return ka kharcha; refund ka tay vaada order page pe; Pro ki shartein aur "suvidha band" ke niyam public pages pe; kram ke gun mahatva ke kram me, seller agreement me "koi differentiated treatment nahi"; warehouse ke likhit niyam (storage, pehle expire wala pehle, quarantine, returns ki jaanch); "kam stock" ka log; Creator ke content pe hataya na ja sakne wala "Ad / Sponsored / Collab" label (R2); invoice pe seller ka naam sabse upar; listing hatane ki wajahon me trademark, copyright ya IT Act ka code; imported pe "authenticity guarantee" ki ghoshna. Points ki expiry ka kanoon doosre run me. Kanooni detail jaanchi nahi (R-004): E-commerce Rules aur Consumer Protection Act ke text doosri sites ki copies se; 2026 ka badlav aur guidelines sirf secondary source se.
### D-248. Data leak pe khabar ke samay

- **Faisla:** data leak pe teen alag ghadiyaan runbook me. Niyam:
  1. CERT-In: incident pata chalne ke 6 ghante me report (dummy, D-026).
  2. Data Protection Board: bina der shuruaati suchna, aur 72 ghante me poori report.
  3. Users: leak pakka hote hi, bina der, email aur in-app. Email me: kya hua, kab, kya asar, humne kya kiya, unhe kya karna hai, aur sampark.
  4. Leak ke emails din ki chhat (D-142) me OTP aur recall ke saath sabse aage; chhat paar ho to in-app aur push usi din.
- **Wajah:** Claude ki salah, owner ne maani: kanoon users ke liye "bina der" kehta hai, koi tay ghanta nahi; teeno ghadiyaan alag likhne se runbook me koi chhootta nahi.
- **Chhode vikalp:** users ke liye tay 24 ghante (kuch maamlon me kanoon se lamba); 72 ghante jaisa, sirf CERT-In ki line jod ke (users ki khabar me der ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-198 badla, D-142 me jod. Runbook me "leak pakka" kab maana jaaye, ye saaf likhna (operations ka doc). Kanooni detail jaanchi nahi (R-004): DPDP Rules ka rule 7 aur CERT-In ke directions public source se mile, lawyer se nahi.

### D-249. Gift card ka raasta

- **Faisla:** gift card sirf kisi RBI-authorised PPI issuer ke zariye. Niyam:
  1. Gift card issuer (jaise payment gateway ya gift card company) ka product ho, aur checkout pe payment ke ek tareeke ki tarah chale.
  2. D-179 ke design niyam (tay rakam, paane wale ke email pe code, thoda-thoda kharch, balance dikhe, cash me nahi) issuer ke niyamon ke andar.
  3. Validity kam se kam 1 saal, expiry issue pe dikhe, rakam ki seema issuer ke niyam se.
  4. Banana R2 ke baad, test mode me (D-026).
- **Wajah:** Claude ki salah, owner ne maani: design asli kanoon ke hisaab se rehta hai, gift card ka paisa hamare khaate me nahi rukta, aur KYC aur RBI ka bojh issuer pe.
- **Chhode vikalp:** gift card rokna (feature rukta); apna gift card sirf test mode me (kanoon ke khilaaf design, asli business ke liye dobara banana).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-179 badla. Test mode me aisa issuer milta hai ya nahi, tathya ki jaanch ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2). Kanooni detail jaanchi nahi (R-004): gift card ka niyam RBI ke FAQ se mila; Master Direction ka abhi ka version nahi khula, aur marketplace pe lagna vyakhya ka sawal.

### D-250. Kanooni rok aur logs ka samay

- **Faisla:** personal data aur logs ke liye "kanooni rok" ki class. Niyam:
  1. Account delete ya data ka samay poora hone pe data app se turant hat jaaye; kisi staff screen pe na dikhe.
  2. Phir ek band, encrypted store me rahe: 13 May 2027 (lagbhag) tak registration data account band hone ke 180 din, uske baad sab data 1 saal. Sirf kanooni maang pe khule; har pahunch audit me.
  3. Samay ke baad apne aap erase.
  4. Photos aur video apne samay pe mitein (D-191, D-192); rok me sirf unka record: kab, kisne, kis maamle me, file ka hash.
  5. Request logs aur security events apne store me kam se kam 180 din abhi se, aur 13 May 2027 (lagbhag) se 1 saal.
- **Wajah:** Claude ki salah, owner ne maani: jaanch ke liye zaroori baat (kaun, kab, kya) record se mil jaati hai, aur ghar ki photos aur videos saal bhar rakhna privacy ka bada jokhim aur free tier pe jagah ka bojh (R-006). Lawyer files maange to poori file wala raasta aasaan.
- **Chhode vikalp:** photos aur video bhi poori file ke saath rok me (privacy jokhim aur jagah); abhi sirf logs, baaki 2027 se pehle (tab design badalna).
- **Kab dobara khulega:** lawyer ki raay (R-004), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-151, D-191, D-192, D-194 aur D-208 me jod; D-055 me R1 jod, kyunki account delete aur logs R1 me hain. Rok ka store aur uski jagah (R-006) architecture me; tax archive (D-225) ke saath ek hi tareeka ho sakta hai. Kanooni detail jaanchi nahi (R-004): DPDP Rules ke rule 8(3) ka text primary se mila; laagu hone ki tareekh aur hamare data pe lagna aadha jaancha; IT Rules ka rule 3(1)(h) aur CERT-In ke 180 din public source se mile.
- **Badla (owner, 2026-11-20, D-262):** niyam 4 badla: lagbhag 13 May 2027 se photos aur video bhi rok me: app se apne samay pe hatein, file band encrypted store me capture se 1 saal, phir erase.

### D-251. Content ki shikayat ke samay

- **Faisla:** reviews, photos aur sawal-jawab jaise content ki shikayat ke naye samay, calendar ghanton me. Niyam:
  1. Shikayat ki receipt 24 ghante me.
  2. Nagnata ya kisi aur ban ke dikhane wale content ki report pe content turant apne aap chhupe (D-136 niyam 4 jaisa), faisla 2 ghante me.
  3. Baaki content ki report pe faisla 36 ghante me.
  4. Content ki shikayat (grievance) ka hal 7 din me.
  5. Court ya sarkari order ka alag raasta: 3 ghante, Master ko alert.
- **Wajah:** Claude ki salah, owner ne maani: chhote samay maanne me kanooni jokhim nahi, chahe secondary source galat nikle; ulta hua to ullanghan. Akele owner ke liye 2 ghante bhaari hain, isliye content apne aap chhupta hai.
- **Chhode vikalp:** primary source (gazette) khulne tak purane samay (secondary sahi nikla to takrav); sirf shikayat ka hal 7 din, baaki jaisa.
- **Kab dobara khulega:** IT Rules ke 2026 ke badlav ka primary source khule, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-136 niyam 5 aur D-163 niyam 3 badle; baaki (consumer) shikayat ke timers D-163 jaise. Alert aur queue ke timers support aur reviews ke design me. Kanooni detail jaanchi nahi (R-004): 2026 ke saare samay sirf secondary source se; gazette nahi khula.

### D-252. Skin & Hair Expert ki seva

- **Faisla:** Skin & Hair Expert (D-025) ki consultation beauty aur skincare salah hai, medical consultation nahi. Niyam:
  1. Koi nidaan ya dawa nahi.
  2. Booking, Meet ke email aur notes pe "Ye medical consultation nahi hai" ki line.
  3. Ilaaj ya dawa ke sawal pe "doctor se milein".
  4. Profile pe "doctor" ya "dermatologist" jaise shabd nahi; role ka naam jaisa hai.
- **Wajah:** Claude ki salah, owner ne maani: doctor ki seva me licence, records aur zimmedari ka bada bojh hai, aur dummy registration pe doctor ki seva dikhana gumraah kar sakta hai. Sahi product aur routine ki salah isi se poori hoti hai.
- **Chhode vikalp:** doctor (RMP) ki seva, Telemedicine guidelines ke saath (registration ki jaanch, records, dawa ke niyam).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-025 me jod. Skin reaction (D-130) me Expert ki salah bhi isi seema me; gambhir reaction pe doctor. Expert ke notes phir bhi sehat ka data (D-207, D-208). Kanooni detail jaanchi nahi (R-004): Telemedicine Practice Guidelines 2020 ka saar dekha, mool PDF nahi khula.

### D-253. Privacy aur CERT-In ka sampark

- **Faisla:** personal data ke sawalon ka sampark (DPDP Rules ka rule 9) Grievance Officer ka role (D-237) hai; uska contact website pe aur data ke haq ke har jawab me. CERT-In ka Point of Contact ek naya "Security Contact" staff role hai, owner ke paas; uski jaankari us role ke account se (D-241).
- **Wajah:** Claude ki salah, owner ne maani: customer ke liye shikayat aur privacy ka ek hi darwaza; CERT-In ka kaam technical hai, to security ke alerts usi role ke paas.
- **Chhode vikalp:** do naye roles, Privacy Contact aur Security Contact (zyada accounts, D-017); ek naya role dono ke liye (customer ke do darwaze).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-017, D-237 aur D-134 me jod; D-055 me R1 jod (runbook R1 me hai, D-198). Significant Data Fiduciary na hon to Data Protection Officer zaroori nahi. Kanooni detail jaanchi nahi (R-004): rule 9 aur CERT-In ka Point of Contact public source se mile.

### D-254. Delivery partners ke kanooni sudhaar

- **Faisla:** delivery partners ke teen sudhaar:
  1. **Social Security Code:** hum aggregator ki do shreniyon me ("Logistic services" aur "e-Market place"). D-134 ki table me "Gig workers" ki row; har partner pe portal ka number (dummy); roz ke kaam ka export (DUMMY); saal ke kaam ke din ki ginti; contribution ki provision ka hisaab, dar setting me, shuru hone ki tareekh notify hone tak band.
  2. **Payouts pe TDS:** partner ka PAN (encrypted), saal ka jod, seema paar hone pe kaat ka niyam settings me (CA se pakka), payout statement me TDS.
  3. **Partner ka data:** Delivery app me partner ke liye data notice aur consent; location sirf "delivered" aur "fail" ke pal pe; lagatar tracking nahi, aur kabhi chahiye to alag consent.
- **Wajah:** Claude ki salah, owner ne maani: partners ke kanooni kaam ek jagah tay, aur Delivery app aur payouts ka design inhi pe.
- **Chhode vikalp:** badlav ke saath maanna; rokna (partners ke kanooni kaam adhoore).
- **Kab dobara khulega:** Social Security Code ki tareekh aur Rules notify hon, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-072, D-104 aur D-134 me jod. Kanooni detail jaanchi nahi (R-004): Code ka text primary se mila; laagu hone ki tareekh, Rules 2026, state ke niyam aur TDS sirf secondary source se; CA se nahi.
- **Jod (D-280, 2026-11-20):** partner payouts pe TDS ki sahi entry (1% ya 2%), saal ki seema paar hone pe poore saal ka catch-up, TDS kaat se pehle ki kamaai pe; nuksaan ki vasooli pe GST nahi.

### D-255. Personal data ke chhote sudhaar

- **Faisla:** personal data ke aath sudhaar:
  1. **Data notice:** sign-up pe alag "Data notice" (Privacy page se alag): har maqsad, kaunsa data, consent wapas lene ka link, data ke haq, aur Board ke paas shikayat ka raasta.
  2. **Privacy page:** data kis desh me rehta hai (Singapore, D-058), processors ki shreniyan, aur data rakhne ka samay.
  3. **Terms:** mana content ki list (IT Rules ka rule 3(1)(b)); har 3 mahine in-app suchna ki niyam todne pe kya hota hai; shikayat ke jawab me Grievance Appellate Committee ka raasta.
  4. **Data ke haq (R2):** nomination ka form aur record; data ke saar me kin ke saath data baanta: sellers (order ke hisaab se) aur processors ki shreniyan.
  5. **Kai accounts (D-203):** notice aur Terms me "per-customer seemaayein aur galat istemaal ki rok" ek maqsad ki tarah; device cookie sirf isi kaam ke liye.
  6. **Umar (D-038):** 18+ ki ghoshna ka tick consent record me; bachcha pata chale to account band aur data erase.
  7. **Aadhaar:** upload form pe "Aadhaar ki copy mat bhejein"; galti se aayi copy reject aur turant delete.
  8. **Processors:** operations ke doc me processors ki list: kaun, kaunsa data, region, data terms ki link, delete ka tareeka; har ek ke saath contract.
- **Wajah:** Claude ki salah, owner ne maani: DPDP ke chhote hisse pages, sign-up aur operations ke doc me ek saath poore.
- **Chhode vikalp:** badlav ke saath maanna; rokna (DPDP ke chhote hisse adhoore).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-038, D-150, D-151, D-203 aur D-216 me jod. Kanooni detail jaanchi nahi (R-004): DPDP Act aur Rules (rule 3, s.11, s.14, s.8(2)) aur Aadhaar Regulations public source se mile; IT Rules ke 2026 ke hisse, kai accounts ka maqsad aur umar ki ghoshna aadha jaancha.

### D-256. Seller, warehouse aur payment ke chhote sudhaar

- **Faisla:** seller, warehouse aur payment ke saat sudhaar:
  1. **Plastic EPR:** seller onboarding pe seller ka plastic EPR number, ya micro/small enterprise hone ki ghoshna; packaging ka master (shreni I se IV, wazan) aur har dispatch ka record; saal ka return (dummy).
  2. **Mana shabd:** Drugs and Magic Remedies Act ki Schedule ki haalatein "mana shabdon" me alag hissa, har shabd ke saath Schedule ka number; seller content, description, Creator aur sponsored content sab pe.
  3. **Payment data ki jagah:** card aur UPI ka data sirf gateway ke paas; hamare paas sirf ids, rakam aur status; gateway se likhit pakka ki payment data India me rehta hai; asli business se pehle region dobara dekhne ki yaad COMPLIANCE me. D-058 waisa hi.
  4. **Sellers ka paisa:** ledger me sellers ka paisa liability ki tarah alag dikhe; seller agreement me payout ke din.
  5. **"Paisa kata, order nahi bana":** us haalat ki screen aur email (bank ka samay, jaise UPI pe T+5); der se "captured" aaye to apne aap refund, sirf ek baar.
  6. **Nasht karna:** expired ya toota maal sirf authorised handler se nasht; certificate of destruction batch ke record me; jalne wala maal alag.
  7. **D-134 ki table me rows:** Fire Safety (provisional, final, renewal aur saal ka certificate), Shops and Establishments (seema state ke hisaab se), aur e-way bill ka number (sab dummy).
- **Wajah:** Claude ki salah, owner ne maani: seller onboarding, catalog, finance aur warehouse ke chhote kanooni hisse ek saath poore.
- **Chhode vikalp:** badlav ke saath maanna; rokna (kanoon ke chhote hisse adhoore).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-045, D-058, D-062, D-093, D-111, D-134 aur D-246 me jod. Sellers ka paisa aur payment data ki jagah lawyer se pakka karne ki baat COMPLIANCE me. Kanooni detail jaanchi nahi (R-004): EPR guidelines, Drugs and Magic Remedies Act aur RBI ka TAT circular public source se mile; payment data ki jagah, sellers ka paisa, nasht karna, Fire Safety, Shops and Establishments aur e-way bill aadha jaancha.
- **Jod (D-280, 2026-11-20):** asli business se pehle region dobara dekhte waqt company ke electronic books ka roz backup India ke server pe aur audit trail bhi; dummy books pe abhi asar nahi.

### D-257. Lawyer aur CA ke agents, aur agents ka poora kram

- **Faisla:** discovery ke agents me do naye AI agents judte hain: **Lawyer** (kanooni raay) aur **CA** (tax aur accounts). Ye hobby project hai, isliye koi bahar ka (licensed) lawyer ya CA nahi aayega: yahi AI agents project ke lawyer aur CA hain, aur unki raay hi project ke lawyer aur CA ki raay maani jaati hai. Agents ka poora kram:
  1. Repository Analyst: poora.
  2. Business Analyst + cosmetics domain expert (do run): poora.
  3. Security Architect, pehla run: poora.
  4. Kanooni jaanch (do run): poora; uski COMPLIANCE ki batches chal rahi hain.
  5. **Lawyer agent (naya):** COMPLIANCE ki saari batches ke baad. Kaam: DECISIONS aur COMPLIANCE ke "lawyer se pakka" aur vyakhya wale points pe raay; platform aur seller ki zimmedari (marketplace ka dhaancha, sellers ka paisa, gift card ka issuer); Terms, Privacy aur seller agreement ka dhaancha.
  6. **CA agent (naya):** Lawyer ke baad. Kaam: "CA se tay" wale tax points (discount, points, replacement, delivery fee ka SAC aur rate, sellers aur partners ka TDS, kho gaye maal ka tax); ledger aur invoice ke accounting niyam; GST, TCS aur TDS ke statements ka dhaancha.
  7. Principal Software Architect.
  8. Database Architect.
  9. DevOps / SRE Architect.
  10. UX / Product Architect.
  11. QA Architect.
  12. Security Architect, doosra run (5 se 11 ke faislon ka security review).
  - Har agent D-005 ke hisaab se ek ke baad ek; report main session khud jaanchta hai, aur cheezein owner ki haan se docs me aati hain (D-220 jaisa); har report me "pehle ke kaam se lene layak" ka hissa (D-074). Lawyer aur CA ki raay bhi report hai, saboot nahi.
  - Jo point Lawyer agent ne dekha aur owner ki haan se docs me aaya, uske saath "Lawyer ne jaancha (tareekh)"; CA ke point pe "CA ne jaancha (tareekh)". Jab tak wo point na dekhein, "lawyer (ya CA) se nahi jaancha" wali lines waisi rehti hain.
- **Wajah:** owner ne Lawyer aur CA agents jode, kram Claude pe chhoda, aur kaha ki hobby project me yahi AI agents asli lawyer aur CA ki jagah hain. Kram pe Claude ki daleel: dono agents business ke kanooni aur tax niyam pakke karte hain, jin pe architecture (services aur events) aur finance ka data model (ledger, invoice, tax) tike hain, isliye design ke agents (7 se 11) se pehle. Lawyer pehle, kyunki platform aur seller ka kanooni dhaancha (kaun bechne wala, sellers ka paisa, gift card) tax ke ilaaj ka aadhaar hai; CA usi dhaanche pe tax tay karta hai. Security ka doosra run sabse aakhir me, taaki saare design faislon ko dekhe.
- **Chhode vikalp:** kram me (Claude ne): Lawyer aur CA sabse aakhir me, planning se pehle (design ke baad kanoon ya tax ka niyam badle to design dobara); CA Database Architect ke baad (ledger ka design tax ke tay niyamon ke bina banta). Owner ne: asli business se pehle licensed lawyer aur CA ki jaanch (Claude ki salah); AI ki raay alag naam se likhna aur "lawyer se nahi jaancha" hamesha rakhna.
- **Kab dobara khulega:** owner khud khole (jaise project asli business bane).
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Owner (do naye agents, aur AI hi project ke lawyer aur CA); kram Claude ne chuna, owner ke kehne pe; Salah nahi maani (licensed lawyer aur CA ki jaanch).
- **Asar (Claude):** agents ab kul 14 run: 6 poore, 8 baaki. Pichhle runs ne ek 5-hour window ka lagbhag 30% se 41% liya (R-003), to baaki 8 run lagbhag 8 windows, dono accounts me baant ke. D-220 niyam 4 badla. R-004 Maana; Lawyer aur CA agents ke nateeje docs me aane pe band. [COMPLIANCE.md](COMPLIANCE.md) ke shuru me paribhasha: "Lawyer" aur "CA" = project ke AI agents, koi licensed lawyer ya CA nahi, taaki public repo padhne wala ise galat na samjhe. Sab registrations aur kanooni details dummy hi rehte hain (D-026); AI ki raay me galti ho sakti hai, isliye har point pe source aur uska status bharose ka aadhaar hai.

### D-258. COMPLIANCE batch 5: personal data

- **Faisla:** kanooni jaanch ke personal data wale hisse ki 17 rows (CL-088 se CL-104: abhi ka kanoon aur DPDP kab se, notice aur consent, sehat ka data, data ke haq, privacy ka sampark, data ka samay aur kanooni rok, data leak ki suchna, Aadhaar, staff ki pahunch, device aur accounts ka jod, seller aur reviews ke saath data, demo site, privacy page, marketing consent, bachche aur 18+, Significant Data Fiduciary, data processors) jaisi prastaavit thi waisi [COMPLIANCE.md](COMPLIANCE.md) §5 me, source ke link aur tareekh ke saath.
- **Wajah:** Claude ki salah, owner ne maani: sign-up, account, support, logs aur backups ka design ek tay kanooni aadhaar pe; jahan faisla badalna tha wo pehle hi tay ho gaya (D-248 se D-256).
- **Chhode vikalp:** badlav ke saath maanna; batch rokna (personal data ka kanooni aadhaar baad me).
- **Kab dobara khulega:** Lawyer agent ki raay (D-257), DPDP ke laagu hone ki tareekh pakki ho, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** nayi cheezein: har consent ka record (notice ka version, samay, raasta, waapsi) aur baad me Consent Manager se judne layak data model; review form pe "ye jaankari sabko dikhegi"; "poori jaankari dekhi" wale audit ki mahine me ek review; Significant Data Fiduciary ki notification pe nazar. Vyakhya ke sawal (CL-093, CL-097, CL-102) Lawyer agent ke liye (D-257). Kanooni detail jaanchi nahi (R-004): DPDP Rules ka text doosri site ki copy se; Act ki tareekhein sirf secondary source se.

### D-259. COMPLIANCE batch 6: IT Rules, CERT-In aur payments

- **Faisla:** kanooni jaanch ke IT Rules, CERT-In aur payments wale hisse ki 7 rows (CL-105 se CL-111: user content ke niyam aur shikayat ke samay, CERT-In, data ki jagah, payment aggregator aur sellers ka paisa, failed transaction aur refund aur chargeback, gift card aur points aur store credit, e-mandate) jaisi prastaavit thi waisi [COMPLIANCE.md](COMPLIANCE.md) §6, §7 aur §8 me, source ke link aur tareekh ke saath.
- **Wajah:** Claude ki salah, owner ne maani: reviews ki moderation, logs, incident, checkout aur finance ka design ek tay kanooni aadhaar pe; jahan faisla badalna tha wo pehle hi tay ho gaya (D-248 se D-256).
- **Chhode vikalp:** badlav ke saath maanna; batch rokna (logs, incident aur payments ka kanooni aadhaar baad me).
- **Kab dobara khulega:** Lawyer agent ki raay (D-257), IT Rules ke 2026 ke badlav ka primary source khule, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** nayi cheezein: hataya content 180 din tak rakha jaaye aur wapas ho sake; sarkari maang pe 72 ghante; systems ki ghadi traceable NTP se aur saare timestamps UTC; CERT-In ka Point of Contact sirf asli business pe register. Vyakhya ke sawal (CL-107, CL-108, CL-110) Lawyer agent ke liye (D-257). Kanooni detail jaanchi nahi (R-004): IT Rules ke 2026 ke samay sirf secondary source se; RBI ke niyamon ka marketplace aur merchant pe lagna vyakhya ka sawal.

### D-260. COMPLIANCE batch 7: gig partners, warehouse aur environment

- **Faisla:** kanooni jaanch ke gig delivery partners, warehouse, transport aur environment wale hisse ki 9 rows (CL-112 se CL-120: Social Security Code me aggregator, partner payouts pe TDS, partner ka data, fire safety aur jalne wala maal, Shops and Establishments, e-way bill, plastic EPR, expired ya toote maal ko nasht karna, e-waste) jaisi prastaavit thi waisi [COMPLIANCE.md](COMPLIANCE.md) §9 aur §10 me, source ke link aur tareekh ke saath.
- **Wajah:** Claude ki salah, owner ne maani: Delivery app, partner payouts, warehouse, trips aur seller onboarding ka design ek tay kanooni aadhaar pe; jahan faisla badalna tha wo pehle hi tay ho gaya (D-254, D-256).
- **Chhode vikalp:** badlav ke saath maanna; batch rokna (in hisson ka kanooni aadhaar baad me).
- **Kab dobara khulega:** Lawyer ya CA agent ki raay (D-257), Social Security Code ki tareekh aur Rules notify hon, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** nayi cheezein: partner ki kamaai se kaat ka likhit kaaran aur appeal; gig niyamon ki har state ki row; catalog me "flammable" aur "electrical appliance" ke flags; warehouse me jalne wale maal ka alag rack aur delivery bag me unki ginti ki seema; e-way bill ki seema paar hone pe number ke bina dispatch nahi; EPR number ya micro/small ki ghoshna ke bina seller live nahi. TDS aur e-way bill CA agent ke liye (D-257). Kanooni detail jaanchi nahi (R-004): kai rows sirf secondary source se (Rules 2026, Maharashtra ke bills, e-way bill, SWM Rules); e-waste ka source nahi khula.

### D-261. COMPLIANCE batch 8: sehat, AYUSH, IP aur contracts

- **Faisla:** kanooni jaanch ke sehat, AYUSH, IP aur contracts wale hisse ki 8 rows (CL-121 se CL-128: online consultation, AYUSH drug ki pehchaan, Drugs and Magic Remedies Act, trademark aur asli maal, data aur assets ka license, seller ka udhaar, apne brand ka trademark, electronic contract) jaisi prastaavit thi waisi [COMPLIANCE.md](COMPLIANCE.md) §11 aur §12 me, source ke link aur tareekh ke saath. Saath me teen chhote badlav: CL-081 (points ki expiry) ka kanoon wala hissa bhara; naya §13 "Nazar" (jin cheezon ke badalne pe rows dobara dekhni hain); aur file ke hisson ki list poori. Isse kanooni jaanch ke dono run ke saare nateeje docs me aa gaye (D-220).
- **Wajah:** Claude ki salah, owner ne maani: consultation, catalog ki jaanch, seller agreement, Terms aur assets ka design ek tay kanooni aadhaar pe; jahan faisla badalna tha wo pehle hi tay ho gaya (D-248 se D-256).
- **Chhode vikalp:** badlav ke saath maanna; batch rokna (doosra run docs me adhoora).
- **Kab dobara khulega:** Lawyer agent ki raay (D-257), "Nazar" ki koi cheez badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** nayi cheezein: AYUSH drug ke ishare pe listing reject; seller agreement me asli maal aur photos ke haq ki ghoshna aur brand owner ke liye IP shikayat ki category; assets ki license list; Terms aur seller agreement ke versions badle na ja sakein. "Jaancha nahi" wali rows (CL-120, CL-126, CL-127) aur vyakhya ke sawal Lawyer agent ke liye (D-257); apne brand ka trademark search owner kare, ya owner ki haan se. Agla kaam D-257 ke kram me Lawyer agent. Kanooni detail jaanchi nahi (R-004): Telemedicine guidelines sirf saar se; Drugs and Cosmetics Rules ka text 2016 tak; Trade Marks Act aur IT Act ke text doosri site se.

### D-262. Photos aur video ki kanooni rok

- **Faisla:** lagbhag 13 May 2027 se delivery aur daawon ki photos aur video bhi kanooni rok (D-250) me. Niyam:
  1. App aur staff screens se apne samay pe hi hatein (D-191, D-192 waise hi).
  2. File encrypted band store me capture ke din se 1 saal; sirf kanooni maang pe khule, har pahunch audit me.
  3. Samay ke baad apne aap erase.
- **Wajah:** Claude ki salah, owner ne maani: Lawyer (AI) ki raay me DPDP Rules ka rule 8(3) personal data bhi (sirf logs nahi) 1 saal maangta hai; kanoon ki tareekh se laagu, aur staff ko dikhne ka samay waisa hi chhota.
- **Chhode vikalp:** D-250 jaisa sirf record (2027 se kanoon se takrav ka jokhim); abhi se 1 saal (bina zaroorat jagah ka bojh).
- **Kab dobara khulega:** DPDP Rules ki tareekh ya text badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-250 niyam 4 badla. 2027 se media ki jagah ka hisaab architecture me (R-006). Lawyer ne jaancha (2026-11-20): rule 8(3) ka text saaf; hamari photos aur video pe lagna Sambhav.

### D-263. Kanoon ke khilaaf ilaaj ke daawe wale reviews

- **Faisla:** Drugs and Magic Remedies Act ki Schedule ki haalaton (jaise leucoderma, motapa, breast ki banawat, lambai, yaun kshamata) ke ilaaj ka daawa karne wale reviews chhupte hain. Niyam:
  1. Wajah "kanoon ke khilaaf daawa", D-146 niyam 1 ki list me nayi wajah.
  2. Customer badal ke dobara bhej sake (D-146 niyam 6).
  3. Baaki ilaaj jaise anubhav note ke saath rahein (D-146 niyam 4).
  4. Aise review kabhi "top" ya prachaar me nahi.
- **Wajah:** Claude ki salah, owner ne maani: sirf kanoon wala hissa chhupta hai; kadwi ya imaandaar raay nahi dabti (D-146 niyam 2).
- **Chhode vikalp:** D-146 jaisa, sab note ke saath (kanooni jokhim); har ilaaj jaisa daawa chhupana (bahut reviews chhupte, reviews dabane ka shak).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-146 niyam 4 badla. D-256 niyam 2 ke mana shabd ab review ki apne aap ki jaanch (D-136) me bhi. Lawyer ne jaancha (2026-11-20): DMR Act s.3 aur IT Rules ka rule 3(1)(b); Sambhav.

### D-264. Legal pages ka badge

- **Faisla:** legal pages ka badge hamesha "DUMMY: kisi licensed lawyer ne nahi dekha". AI Lawyer ka "Lawyer ne jaancha" sirf docs me (COMPLIANCE jaisa), public site pe nahi.
- **Wajah:** Claude ki salah, owner ne maani: site padhne wala "lawyer" ko licensed lawyer samjhega; ye badge saaf hai aur gumraah nahi karta (CPA s.2(28)).
- **Chhode vikalp:** "DUMMY: AI Lawyer ne dekha, licensed lawyer ne nahi" (phir bhi "dekha gaya" jaisa bharosa); D-150 jaisa aur AI ke baad badge hatana (gumraah karne ka jokhim).
- **Kab dobara khulega:** owner khud khole (jaise project asli business bane).
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-150 niyam 2 badla. Lawyer ne jaancha (2026-11-20).

### D-265. Expert aur Advisor ki qualification

- **Faisla:** Skin & Hair Expert aur Beauty Advisor (D-025, D-252) ke liye beauty ya cosmetology ka certificate zaroori. Staff jaanche, aur profile pe dikhe (dummy, D-026).
- **Wajah:** Claude ki salah, owner ne maani: "Expert" kehna ek daawa hai, jo is shart se sach aur jaanchne layak banta hai; kaam bas ek field aur ek jaanch ka.
- **Chhode vikalp:** koi shart nahi, sirf "medical nahi" ki line ("Expert" shabd kamzor); saath me saal ki training ka record (akele owner pe bojh).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** staff profile me qualification ka field aur jaanch ka kadam (D-025, D-252 me jod). Lawyer ne jaancha (2026-11-20): beauty salah ke liye koi kanooni qualification nahi mili; NMC Act ka hissa sirf secondary source se.

### D-266. Delivery partner ki azaadi

- **Faisla:** delivery partner kaam ki offer bina saza chhod sake, aur doosre platforms pe bhi kaam kar sake. Niyam:
  1. Delivery app me "offer maano ya chhodo"; chhodne pe saza nahi, sirf baar-baar maan ke chhodne pe; chhodne ki ginti sirf jaankari ke liye.
  2. Availability partner khud chune; koi fixed shift ya attendance nahi.
  3. Doosre platforms pe kaam ki rok nahi.
- **Wajah:** Claude ki salah, owner ne maani: Lawyer (AI) ki raay me contractor ka rishta (D-033) sabse zyada isi pe tika hai; ye D-068 aur D-104 ke saath mel khaata hai.
- **Chhode vikalp:** offer chhodne ki azaadi par kaam ke ghanton me exclusivity (control ka ishara); tay shifts aur exclusivity (employment ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-033 me jod. Din ki planning kam pakki; hub ki planning partners ki di hui availability se. Lawyer ne jaancha (2026-11-20): kasauti tathyon pe tiki hai (Anishchit).

### D-267. Delivery partner ki gaadi aur insurance

- **Faisla:** delivery ke istemaal ka insurance abhi partner ki zimmedari: valid licence, RC aur aisa insurance jo delivery ka istemaal cover kare; onboarding pe number aur expiry (dummy); expiry pe kaam band. Asli business pe platform ka group accident cover bhi.
- **Wajah:** Claude ki salah, owner ne maani: abhi ₹0 (D-028), aur asli business pe partner ki suraksha aur bharosa.
- **Chhode vikalp:** sirf partner ki zimmedari hamesha (partner pe poora bojh); sirf cycle ya kam speed wale electric vahan (door ke pincodes me dheema).
- **Kab dobara khulega:** asli business se pehle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-033 me jod; partner onboarding me teen dastavez aur expiry ki yaad. Lawyer ne jaancha (2026-11-20): vahan ke niyam sirf secondary source se (Anishchit).

### D-268. Jhagde ka aakhri raasta

- **Faisla:** platform ke andar ka dispute (D-164) na sulje to: sellers ke liye pehle mediation, phir ek arbitrator ka arbitration, seat `[CITY: DUMMY]`; partners ke liye `[CITY: DUMMY]` ke court.
- **Wajah:** Claude ki salah, owner ne maani: sellers ke bade jhagde mediation me jaldi sulajhte hain; partners ke chhote daawon pe arbitration ka kharcha bhaari hai.
- **Chhode vikalp:** dono ke liye court (dheema); dono ke liye mediation aur arbitration (chhote daawon pe kharcha).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** seller agreement aur partner agreement me alag clause; D-164 me jod. Lawyer ne jaancha (2026-11-20).

### D-269. Sellers ke paise ka alag khaata

- **Faisla:** gateway ka settlement alag "seller settlement" bank account me, aur sellers ka payout usi se. Design me ye khaata abhi se (test mode me dummy).
- **Wajah:** Claude ki salah, owner ne maani: Lawyer (AI) ki raay me platform payment aggregator ka merchant hai, aur ledger ki liability (D-256 niyam 4) sirf hisaab hai; alag khaate se roz ka milaan saaf, aur asli business pe design nahi badalta.
- **Chhode vikalp:** ek hi current account (sellers ki suraksha kam); saath me "sellers ke liye rakha paisa" ka clause (platform pe kanooni bandish).
- **Kab dobara khulega:** asli business se pehle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-093 aur D-256 me jod; finance me ek aur khaata aur roz ka milaan (CA agent ke liye, D-257). Lawyer ne jaancha (2026-11-20): RBI ka text ye seedhe nahi kehta (Sambhav).
- **Jod (D-280, 2026-11-20):** gateway fees aur platform offer ka top-up Operating khaate se; platform ke kharche kabhi Settlement khaate se nahi; roz ka milaan.

### D-270. Seller agreement me zimmedari ki chhat

- **Faisla:** seller ke saamne platform ki zimmedari ki chhat: pichhle 12 mahine me us seller se mili fees jitni. D-063 ki bharpai, dhokha aur kanooni zimmedari is chhat ke bahar. Customer ke kanooni haq pe koi chhat nahi.
- **Wajah:** Claude ki salah, owner ne maani: santulit: seller ki bharpai bachi rehti hai, aur platform ka jokhim uski kamaai se juda rehta hai.
- **Chhode vikalp:** koi chhat nahi (platform pe bada jokhim); ek tay rakam (chhote aur bade sellers pe barabar nahi baithti).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** seller agreement ka clause. Lawyer ne jaancha (2026-11-20).

### D-271. Lawyer (AI) ki report ke chhote sudhaar

- **Faisla:** Lawyer (AI) ki report ke aath chhote sudhaar:
  1. **Related brand ka label:** Skin & Hair Expert ya Beauty Advisor Unibelle ya kisi related seller ka product sujhaye, to uske saath tay label "related brand"; kisi brand ki taraf jhukav nahi (D-139 jaisa).
  2. **Appliances ka E-waste EPR:** hair dryer, electric shaver jaise "electrical appliance" category pe seller ka E-waste EPR number (dummy), iske bina listing nahi; aisi listing se pehle BIS ke niyam jaanchne hain.
  3. **Apna brand:** Own-Brand Manager Unibelle ka har kaam sirf Unibelle ke seller account se, seller ke haq ke saath; platform ke haq se Unibelle ka content nahi badalta, aur doosre sellers ka data nahi dekhta.
  4. **Sellers ki list:** gateway ke liye sellers ki list aur KYC ka export (dummy); gateway ki marketplace shartein asli business se pehle tathya ki tarah jaanchni hain.
  5. **Collection agent:** seller agreement me platform seller ka "limited payment collection agent"; fees, kaat aur udhaar (D-071) ka set-off saaf likha.
  6. **Returns me storage check:** storage shart wale maal (jaise sunscreen, perfume) pe customer ke paas rehne ka check; shak ho to wapas bikne wala stock nahi.
  7. **Gift card ki yaad:** platform pe balance aur expiry dikhe; issuer chahe to expiry se 45 din pehle ki yaad hamari in-app aur email se (D-142 ki chhat me).
  8. **FDI ki nazar:** COMPLIANCE §13 me row: foreign investment (D-040) khule to FDI ki e-commerce shartein (Unibelle me platform ya uski group company ki equity, sab sellers ko barabar fees, platform ke discount D-101, auditor ki saal ki report); seller record me "platform ya group ki equity %" ka field (dummy).
- **Wajah:** Claude ki salah, owner ne maani: catalog, consultation, finance, returns aur seller agreement ke chhote kanooni hisse ek saath poore.
- **Chhode vikalp:** badlav ke saath maanna; rokna (kanoon ke chhote hisse adhoore).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-025, D-031, D-040, D-071, D-081, D-093, D-112, D-128, D-249 aur D-252 me jod. Lawyer ne jaancha (2026-11-20): E-waste aur gift card ki yaad Pakka; Unibelle ka "group company" hona Anishchit; baaki Sambhav.

### D-272. COMPLIANCE pe Lawyer (AI) ke nishaan

- **Faisla:** Lawyer (AI) ki 18 rows ki raay [COMPLIANCE.md](COMPLIANCE.md) me:
  1. **Lawyer ne jaancha (2026-11-20), 4 rows:** CL-068, CL-093, CL-108, CL-120.
  2. **Lawyer ne aadha jaancha (2026-11-20), 11 rows,** baaki hissa row me: CL-052, CL-058, CL-081, CL-097, CL-102, CL-107, CL-110, CL-112, CL-121, CL-124, CL-126.
  3. **Lawyer ne nahi jaancha, 3 hisse:** CL-127 (trademark search owner kare), CL-021 ka income-tax hissa (CA agent ke liye), CL-048 ki IS ki list.
  4. Har row me Lawyer ki ek line ki raay; D-262 se D-271 se badli rows ka "System me kya chahiye" un faislon ke hisaab se; "Is file me kya aayega" me "Lawyer ne aadha jaancha" ka matlab; §13 me FDI ki row (D-271).
- **Wajah:** Claude ki salah, owner ne maani: har row me saaf dikhta hai kya pakka hua aur kya baaki, aur CA agent ko apna hissa milta hai.
- **Chhode vikalp:** sirf 4 "jaancha" rows pe nishaan ("aadha" wali raay docs me nahi aati); rokna (Lawyer ka kaam docs me adhoora).
- **Kab dobara khulega:** CA agent ki raay, "Nazar" ki koi cheez badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** COMPLIANCE ki 18 rows aur §13 me badlav. CL-021 aur CL-126 ke tax hisse CA agent (D-257) ke liye.

### D-273. Documents ka dhaancha kahan

- **Faisla:** Lawyer (AI) ka 6 documents ka dhaancha (customer Terms of Use, Privacy Notice, Seller Agreement, Delivery Partner Agreement, Return aur Refund page, Grievance page) [COMPLIANCE.md](COMPLIANCE.md) ke naye §14 "Documents ka dhaancha" me aata hai: har document ke clauses ki ek table (clause, maqsad, D-xxx ya CL-xxx), ek batch me owner ki haan se. Sirf clauses, poore drafts nahi.
- **Wajah:** Claude ki salah, owner ne maani: kanooni cheezein ek jagah, naye doc aur index ka kaam nahi, aur agents ki reports hatne (D-073) se pehle dhaancha naye docs me.
- **Chhode vikalp:** naya doc `docs/LEGAL_DOCS.md` (ek aur doc aur index); abhi nahi, pages likhte waqt (dhaancha khone ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** COMPLIANCE me §14; D-150 ke pages isi dhaanche se likhe jayenge.

### D-274. COMPLIANCE batch 9: documents ka dhaancha

- **Faisla:** Lawyer (AI) ka 6 documents ka dhaancha (customer Terms of Use 25, Privacy Notice 16, Seller Agreement 26, Delivery Partner Agreement 15, Return aur Refund page 14, Grievance page 12 clauses) jaisa prastaavit tha waisa [COMPLIANCE.md](COMPLIANCE.md) §14 me, D-262 se D-272 ke faislon ke saath: badge D-264, jhagde ka raasta D-268, zimmedari ki chhat D-270, insurance D-267, partner ki azaadi D-266, seller settlement khaata D-269, aur D-263, D-265, D-271 ke jod. Isse Lawyer (AI) ki report ke saare nateeje docs me aa gaye (D-220, D-257).
- **Wajah:** Claude ki salah, owner ne maani: saare tay faisle ek dhaanche me, aur legal pages (D-150) isi se likhe jaate hain.
- **Chhode vikalp:** badlav ke saath maanna; rokna (dhaancha sirf agent ki report me, jo discovery ke baad hat jaati hai, D-073).
- **Kab dobara khulega:** CA agent ki raay, koi tay faisla badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-150 ke pages aur seller, partner agreements isi se. Tax ke clauses (Seller Agreement 10 aur 13, Partner Agreement 9) CA agent (D-257) ke liye. Agla kaam D-257 ke kram me CA (AI). Lawyer ne jaancha (2026-11-20): dhaancha; poore drafts nahi.

### D-275. Fulfilment fee ke do hisse

- **Faisla:** seller ki fulfilment fee (D-078 niyam 2) fees invoice pe do lines me: "handling (pick aur pack)" 18% GST, aur "delivery" 5% bina ITC. Dono per unit, jod wahi (misaal ₹25).
- **Wajah:** Claude ki salah (CA ki raay), owner ne maani: har hissa apne sahi rate pe, aur jhagde ka jokhim kam.
- **Chhode vikalp:** ek line 18% (delivery ka hissa galat rate pe); ek line 5% bina ITC (warehouse aur packing ka ITC bhi rukta).
- **Kab dobara khulega:** GST ka rate badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-078 me jod; rate table (D-086) me do rows; delivery ke kharchon ka ITC ulatna finance me. CA ne jaancha (2026-11-20): delivery seva 5% bina ITC, 1 Nov 2026 se; notification ki copy doosri site se padhi.

### D-276. Nuksaan ki bharpai ka aadhaar

- **Faisla:** D-063 ki bharpai GST ke bina wali value pe, commission aur fees ghata ke. Bharpai seller ke statement me ek net line; uspe fees ka alag invoice nahi.
- **Wajah:** Claude ki salah (CA ki raay), owner ne maani: "bikne jitna" ke sabse kareeb, aur GST samet bharpai seller ko bikri se zyada deti.
- **Chhode vikalp:** GST samet daam (18% wale item pe bikri se lagbhag 18% zyada); GST ke bina value aur ITC ulatne ka andaaza (andaaze aur jaanch ka kaam).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-063 me jod. Seller ka apna ITC ulatna uska nuksaan rehta hai. CA ne aadha jaancha (2026-11-20): bharpai pe GST, TCS aur TDS nahi; baaki hissa COMPLIANCE ki CA batch me.

### D-277. Return pe platform ki fees

- **Faisla:** lauti line pe platform ki fees return ki wajah (D-079) ke hisaab se, D-112 jaisa. Niyam:
  1. Hamari galti, aur hamari delivery ki der: commission aur fulfilment fee dono wapas.
  2. Brand ki galti (jaise kharab ya nakli maal): koi fee wapas nahi.
  3. Customer ka man badla: commission wapas, fulfilment fee nahi (kaam ho chuka).
  4. Wapas hui fees pe platform ka credit note.
- **Wajah:** Claude ki salah, owner ne maani: nuksaan usi pe jiski galti, aur wajah pehle se record hoti hai. CA ki salah me der se delivery "man badla" ke saath thi; Claude ne use hamari galti me rakha, kyunki delivery hamari apni hai.
- **Chhode vikalp:** sirf commission wapas (hamari galti pe bhi seller fulfilment deta); dono hamesha wapas (platform ka kharcha zyada); koi wapas nahi (bina bikri ke commission).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-078 me jod; seller ka statement aur fees ke credit note isi niyam se.

### D-278. Combo aur shart wale gift ka invoice

- **Faisla:** combo aur shart wale gift ("X kharido to Y free") me har cheez apne daam pe, combo ki chhoot har line pe anupaat me, aur har line apne GST rate pe. Shart: har cheez site pe alag se bhi bikti ho, aur invoice pe har line ka daam aur chhoot dikhe. Jo cheez alag se nahi bikti, us combo pe ek daam ka mixed supply (sabse zyada rate). Brand ka ek barcode wala kit (D-088, D-228) pehle jaisa.
- **Wajah:** Claude ki salah (CA ki raay), owner ne maani: kam tax, aur D-088 ke return niyam (ek cheez ka refund) se mel.
- **Chhode vikalp:** hamesha ek daam = mixed supply (kam rate wali cheez pe zyada tax).
- **Kab dobara khulega:** tax vibhag ka koi saaf niyam aaye, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-228 aur D-229 ka bacha hissa tay; promotions R2 se (D-055). CA ne aadha jaancha (2026-11-20): "ek daam" ka tark tax vibhag uthaye to farak ka jokhim.

### D-279. GSTIN wale orders pe platform ke offers

- **Faisla:** GSTIN wale (business) orders pe platform ke offers aur points nahi lagte; sirf brand ke offers.
- **Wajah:** Claude ki salah (CA ki raay), owner ne maani: platform ka hissa seller ki value me judta hai, to business customer ke ITC pe jhagde ka jokhim nahi rehta.
- **Chhode vikalp:** offers sab ko, invoice pe "Platform offer" ki saaf line ke saath (ITC pe jhagde ka jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** checkout me GSTIN daalte hi platform ke offers aur points hatein, aur customer ko ye saaf dikhe. CA ne aadha jaancha (2026-11-20).

### D-280. CA (AI) ke jod tay faislon me

- **Faisla:** CA (AI) ki report ke 9 jod maane; koi faisla palat-ta nahi:
  1. **Delivery fee (D-107):** platform ka apna B2C invoice, SAC 996813, 1 Nov 2026 se 5% bina ITC; delivery ke kharchon ka ITC ulatna; prepaid order pe fee ka invoice payment capture ke pal.
  2. **Sellers ka TDS (D-081):** GST ke bina rakam pe, pehle credit (invoice) ke pal; return pe usi seller ki usi financial year ki agli bikri me adjust, saal badle to nahi; replacement pe nahi.
  3. **Replacement (D-122):** bina keemat ka, delivery challan ke saath.
  4. **Records ka samay (D-225, D-227):** platform ke apne books 8 financial years; sellers ke tax documents 72 mahine (misaal).
  5. **Books ka backup (D-256):** asli business se pehle region dobara dekhte waqt company ke electronic books ka roz backup India ke server pe aur audit trail bhi.
  6. **Chargeback (D-095):** seller ki galti pe seller ka credit note; platform wale (fraud, delivery) pe credit note nahi, nuksaan platform ka kharcha; gateway ki kati rakam usi din Operating khaate se top-up.
  7. **Seller settlement khaata (D-269):** gateway fees aur platform offer ka top-up Operating khaate se; platform ke kharche kabhi Settlement khaate se nahi; roz ka milaan.
  8. **Doosre state se stock (D-096):** ASN me seller ka IGST invoice ya delivery challan aur e-way bill ka number; receiving pe ye document.
  9. **Partners ka TDS (D-254):** sahi entry (1% ya 2%), saal ki seema paar hone pe poore saal ka catch-up, TDS kaat se pehle ki kamaai pe; nuksaan ki vasooli pe GST nahi.
- **Wajah:** Claude ki salah (CA ki raay), owner ne maani: tay faislon ke tax aur accounting ke bache hisse poore hote hain.
- **Chhode vikalp:** owner ke badlav ke saath maanna; rokna (tax ke chhote hisse adhoore).
- **Kab dobara khulega:** tax ka koi niyam badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** har jod uske faisle ke record me ek line. CA ne jaancha (2026-11-20): 1 (capture ka pal aadha) aur 7; baaki CA ne aadha jaancha (naye Income-tax Act ke section aur forms, Companies Act ke niyam kuch secondary source se). COMPLIANCE ki rows (CA ke nishaan, badlav, nayi rows CL-129 se) agli CA batch me.

### D-281. COMPLIANCE pe CA (AI) ke nishaan aur badlav

- **Faisla:** CA (AI) ki raay [COMPLIANCE.md](COMPLIANCE.md) me:
  1. **CA ne jaancha (2026-11-20), 8 rows:** CL-003, CL-010, CL-012, CL-013, CL-019, CL-022, CL-023, CL-024.
  2. **CA ne aadha jaancha (2026-11-20), 22 rows,** baaki hissa row me: CL-001, CL-002, CL-004 se CL-009, CL-011, CL-014 se CL-018, CL-020, CL-021, CL-108, CL-109, CL-110, CL-113, CL-117, CL-126.
  3. **CA ne nahi jaancha, 2 rows:** CL-112 (contribution ka "turnover"), CL-128 (stamp duty).
  4. 20 rows me badlav D-275 se D-280 ke hisaab se; §1.1 me nayi rows CL-129 se CL-136; §13 me 4 Nazar rows; §14 me Seller Agreement clause 10 aur 13 aur Partner Agreement clause 9 ke tax hisse; §1.0 me sources T11 se T27.
- **Wajah:** Claude ki salah, owner ne maani: tax rows me saaf dikhta hai kya pakka hua aur kya baaki, aur tay faisle rows tak pahunchte hain.
- **Chhode vikalp:** sirf nishaan (rows tay faislon se peeche); rokna (CA ka kaam adhoora).
- **Kab dobara khulega:** koi tax niyam ya "Nazar" ki cheez badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** COMPLIANCE ki tax rows ab Lawyer (D-272) aur CA dono ke nishaan ke saath. CA ke ledger, invoice aur statements ke niyam abhi docs me nahi.

### D-282. Finance ke accounting niyam ARCHITECTURE me

- **Faisla:** CA (AI) ke platform ke books ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §1 me: bunyadi niyam (double-entry, integer paise, append-only, ek ghatna ek entry, sub-ledgers, IST ka tax din, mahine ka close, records ka samay), chart of accounts, ghatnaon ki entries, ek misaal, seller settlement khaate ke niyam, kaun kya document jaari kare, numbering (bina gap), rounding, invoice pe kya, statements aur returns, aur 12 milaan (M1 se M12).
- **Wajah:** Claude ki salah, owner ne maani: ye poore system ke finance ka dhaancha hai, aur aage ke architecture aur database ke agents isi file pe kaam karte hain.
- **Chhode vikalp:** COMPLIANCE me naya hissa (kanoon ki rows ka matrix, ledger fit nahi); planning tak report me rakhna (naye docs ke bahar, report hatne ka jokhim).
- **Kab dobara khulega:** Database Architect ka data model, koi tax niyam badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** niyam D-275 se D-281 ke saath milaaye gaye (fulfilment fee ke do khaate aur misaal me do hisse; fees ka credit note D-277 se; bharpai D-276 se). CA ki report ka saara kaam ab docs me. CA ne jaancha (2026-11-20): dhaancha aur entries; form numbers aur kuch due dates sirf secondary source se (COMPLIANCE CL-136).

### D-283. Design ka scale target

- **Faisla:** code, indexes, pagination, data ka archive aur load tests is scale ke liye banenge: 1 lakh customers, 1,000 orders/din (sale ke din 5 guna), 500 sellers, 50,000 variants, 100 staff, 50 delivery partners. Ye sirf code aur tests ka target hai; ₹0 hosting ki asli seema isse kam hai (D-028).
- **Wajah:** Claude ki salah, owner ne maani: asli marketplace ki shuruaat jaisa; MongoDB aur PostgreSQL ke ek-ek server pe fit, to sharding ya alag search cluster jaisa bojh nahi, aur laptop pe Docker me load test ho sakta hai.
- **Chhode vikalp:** chhota (10,000 customers, 100 orders/din; bade din pe kya toote, pata nahi chalta); bada (10 lakh customers, 10,000 orders/din; sharding aur alag search, ek insaan ki capacity D-009 pe bahut bhaari).
- **Kab dobara khulega:** asli business shuru ho, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** har list me pagination, har query ka index, data ka archive, aur 5 guna peak ka load test (QA Architect ke saath). Database Architect isi scale pe indexes aur archive tay karega.

### D-284. Photos, dastavez aur video ki jagah

- **Faisla:** product images, review aur daawe ki photos, delivery ka saboot, KYC dastavez, PDFs, exports aur video ek managed media service pe (misaal Cloudinary ka free plan): upload seedha provider pe, dobara encode aur EXIF hatana provider pe, public images CDN se, private files chhote samay wale URL se. Shart: free plan pe private file ka samay wala URL chale, rakhi hui copy me EXIF na rahe, aur file type aur size ki rok lage. Shart ki jaanch fail ho to public aur review images media service pe, aur private dastavez, kanooni rok wali files aur logs ki files S3 jaise object storage pe (misaal Backblaze B2 ya Cloudflare R2 ka free hissa).
- **Wajah:** Claude ki salah, owner ne maani: ek processor aur ek account, aur server pe image ka koi kaam nahi, to 512 MB (R-007) aur kam CPU pe bojh nahi; SR-061 aur SR-062 provider pe poore.
- **Chhode vikalp:** sirf object storage (dobara encode server pe, CPU aur memory ka bojh, upload Render ki bandwidth me).
- **Kab dobara khulega:** shart ki jaanch ka nateeja ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2), free credits khatam hone lagein, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** provider naya data processor hai (CL-104) aur data ki jagah privacy page pe (CL-107); data India ke bahar ho to uska asar Lawyer se nahi jaancha. Provider ki chaabi sirf ek jagah (SR-071); files ka registry aur retention ARCHITECTURE ki media batch me. Database me provider ka URL nahi, sirf file ka record (SR-062).

### D-285. Request logs ki jagah

- **Faisla:** CERT-In ke 180 din ke request logs (aur 2027 se 1 saal; D-250 niyam 5, CL-106) ek alag chhoti "logs" service me, apne Atlas cluster (alag Atlas project aur DB user, D-011 jaisa) me gzip chunks ke roop me (misaal har minute ek document).
- **Wajah:** Claude ki salah, owner ne maani: ₹0, naya processor nahi, audit se alag (logs me IP jaisa personal data, audit ki chain alag), aur incident ya jhagde me samay ke hisaab se seedhi query. 0.5 GB me andazan 180 din ke liye lagbhag 60,000 requests/din.
- **Chhode vikalp:** audit ke cluster me (audit aur logs ek doosre ki jagah khaate); media provider ki private files me roz ki gzip files (query mushkil, credits aur bandwidth me ginti).
- **Kab dobara khulega:** logs 0.5 GB ke paas pahunchein, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** services ki list me "logs" judti hai (D-011 ke pehle draft ke 9 ke alawa); poori list ARCHITECTURE ki services wali batch me. Render ke apne logs kitne din rehte hain, ye jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 me pehle se.

### D-286. Errors ka pata

- **Faisla:** server aur 11 apps ki errors ka apna chhota intezaam: server ki errors logs (D-285) me fingerprint ke saath; apps ki errors ek rate-limited route pe (bina personal data, size ki seema ke saath); Master app ke ops inbox me nayi error pe khabar aur roz ka saar. Bahar ki error service nahi.
- **Wajah:** Claude ki salah, owner ne maani: D-157 aur SR-006 ki soch se mel (data bahar nahi, page pe bahar ka kuch nahi), naya account nahi, aur logs ka store pehle se ban raha hai.
- **Chhode vikalp:** bahar ki error service ka free plan (data bahar, ek aur processor, saajha quota); sirf logs (toota flow kai din chhupa reh sakta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** grouping ki suvidha kam; fingerprint ka tareeka aur ops inbox ki khabar ARCHITECTURE ki observability batch me. Alerts ka chalna DevOps / SRE ke saath (R-024).

### D-287. Email provider

- **Faisla:** OTP aur baaki saare emails Brevo ke free plan se, HTTPS API pe (Render ke docs ke hisaab se free service pe SMTP ports band hain, 2026-11-20).
- **Wajah:** Claude ki salah, owner ne maani: D-028 ka din ke 300 aur D-142 ki chhat isi number pe bani hain.
- **Chhode vikalp:** Mailjet free (din ki seema kam, D-142 ke numbers badalte); owner ke Gmail account ka API (personal account ka jokhim, seema saaf nahi).
- **Kab dobara khulega:** bina domain bhejna na chale ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** provider data processor hai (CL-104). Spam ka jokhim waisa hi (R-005). Bheje emails ki copy aur link tracking wali jaanch §2 me pehle se.

### D-288. Finance me events kitni der me

- **Faisla:** payment, return aur refund ke events finance ke database (Neon) me har 15 minute (misaal) ke batch se pahunchte hain, sirf jab kuch pending ho. Pack pe invoice har haal me turant (sync) jaari hota hai.
- **Wajah:** Claude ki salah, owner ne maani: Neon ke free plan ke mahine ke 100 CU-ghante (R-014) me andazan 30 se 45 CU-ghante; har event pe turant likhne se lagbhag 90, aur mahine ke beech finance (aur pack pe invoice) band hone ka jokhim.
- **Chhode vikalp:** turant, har event pe (seema ke bahut paas); har ghante ka batch (seller ka statement ghante bhar purana).
- **Kab dobara khulega:** CU-ghante ki asli naap, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** seller aur Finance app me nayi bikri 15 minute tak der se dikhti hai. Neon ke ghante khatam hon to pack aur dispatch bhi rukte hain (pack pe invoice finance me): ye R-014 me jodne ka prastaav ARCHITECTURE ki risks wali batch ke saath.

### D-289. Invoice ka email

- **Faisla:** customer ko invoice ke email (D-126 niyam 2) me sirf invoice ka saar: invoice number, tareekh, seller ka naam aur GSTIN, aur rakam, saath me "Customer app me Orders me download karein". Email me PDF aur link nahi.
- **Wajah:** Claude ki salah, owner ne maani: record (number, tareekh, rakam) email me rehta hai, personal data provider ke paas kam (D-226), server pe PDF ka CPU aur bandwidth ka bojh nahi, aur emails me link pe click ki aadat nahi banti (R-017, SR-073 ki soch).
- **Chhode vikalp:** PDF attach (CPU, bandwidth aur privacy ka bojh); saar ke saath customer app ka link (emails me link, R-017).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** asli invoice parcel ke andar (D-077) aur app me download. Kanooni detail jaanchi nahi: customer ko invoice ki copy kis roop me deni hai (CL-003, CL-020), Lawyer (ya CA) se nahi jaancha.

### D-290. Server-side rendering nahi (R1)

- **Faisla:** R1 me saare 11 apps saade SPA; customer app ke product aur category pages bhi server pe render nahi hote. Server-side rendering asli business ke waqt dobara dekhi jayegi.
- **Wajah:** Claude ki salah, owner ne maani: search engine ki koi tay zaroorat nahi; sabse kam hisse, aur ₹0 me sabse surakshit.
- **Chhode vikalp:** public pages SSR se, Vercel functions pe (functions ki limits, logs aur secrets ki ek aur jagah, CSP ka kaam); build pe static pages (catalog ka har badlav deploy maangta, D-037 ki soch se ulta).
- **Kab dobara khulega:** asli business shuru ho, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-058 ka server-side hisse ke region wala sawal R1 me band (D-058 me jod). Search engines me kam dikhna aur pehla page thoda der se.

### D-291. ARCHITECTURE batch 1: services aur data ki seema

- **Faisla:** services aur data ki seema [ARCHITECTURE.md](ARCHITECTURE.md) §2 me: gateway (bina database) aur 11 data wali services (identity, notify, payments, catalog, commerce, logistics, finance, support, audit, media, logs), har data ka ek maalik (§2.2), sync calls ki tay list (§2.3) aur 11 niyam (§2.4). Numbers misaal hain aur settings me.
- **Wajah:** Claude ki salah, owner ne maani: har data ka ek maalik; copy sirf events se, aur jo kaam usi pal jawab maangte hain wo sirf ek chhoti tay list se; stock aur order ek transaction me.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (Database Architect bina seema ke).
- **Kab dobara khulega:** module design ya Database Architect ka data model, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-011 ka "data sirf events se" ab saaf (D-011 me jod). Commerce me logistics aur catalog ki copy kuch second peeche reh sakti hai; area band karne ke turant baad ka asar operations ke kram me. Services ka asli data model Database Architect ke saath.

### D-292. ARCHITECTURE batch 2: events aur messaging

- **Faisla:** events ke 11 niyam [ARCHITECTURE.md](ARCHITECTURE.md) §3 me: outbox usi transaction me, har producer ka dispatcher har subscriber ko seedha deliver kare, inbox (`processed_events`) se dedupe, ek aggregate ke events kram se, retry aur dead letter, envelope, event me secrets kabhi nahi, versioning, aur staff ke kaam ka audit outbox se.
- **Wajah:** Claude ki salah, owner ne maani: event ka sach outbox me, to Redis ke restart se event nahi khota (R-010), Redis ki chhoti memory events se nahi bharti, aur ek order ke events kram se pahunchte hain.
- **Chhode vikalp:** outbox se BullMQ queue (ek aur hop, kram nahi); MongoDB change streams (finance pe nahi chalte, free cluster pe seemit); process ki memory ka event emitter (crash pe event gayab); bahar ka message broker (naya processor).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.

### D-293. ARCHITECTURE batch 3: background jobs aur samay

- **Faisla:** jobs ke 9 niyam aur R1 ki jobs ki table [ARCHITECTURE.md](ARCHITECTURE.md) §4 me: har samay wala kaam maalik service ke DB me due date ke saath, ticker aur lease, BullMQ sirf kaam chalane ke liye, queues ki seema, IST ka din, chhoote din ka catch-up, finance ka 15 minute ka batch (D-288), aur chhote kanooni ya suraksha samay wale kaam usi request me.
- **Wajah:** Claude ki salah, owner ne maani: soya server (R-002) aur khaali Redis (R-010) ke baad bhi kaam late hota hai, khota nahi; aur D-248 aur D-251 ke chhote samay soye server pe job ke bharose nahi rehte.
- **Chhode vikalp:** BullMQ ke delayed jobs aur schedulers ko sach maanna (Redis restart pe gayab); alag cron service (D-056: doosri web service nahi); GitHub Actions se business jobs (D-028 me sirf jagana).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** Atlas ka free cluster lambe samay bina connection ke ruk sakta hai, aur Render Key Value ki seema: dono jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 me.

### D-294. ARCHITECTURE batch 4: API aur apps se baat

- **Faisla:** API ke 15 niyam [ARCHITECTURE.md](ARCHITECTURE.md) §5 me: REST aur ek contract (validation, manifest, typed client), ek screen ek ya do calls, cursor pagination, v1 me sirf jodna, app ka version aur 426, Delivery app ka batch sync (delivery code ka milaan sirf online), polling aur push (WebSocket nahi), error ka ek roop aur status codes, idempotency ke routes, retries aur timeouts, apps ka raasta, `/wake`, aur R1 me SPA (D-290).
- **Wajah:** Claude ki salah, owner ne maani: 11 apps ek backend se ek hi contract pe; India se Singapore ki der (R-012) me kam calls; khula connection server ko sone nahi deta (R-008).
- **Chhode vikalp:** GraphQL (koi tay zaroorat nahi, permissions har field pe mehnge); tRPC (REST manifest aur public cache ke saath fit kam); WebSocket ya SSE (R-008); RFC 9457 problem details (apna domain chahiye, D-028).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** `/wake` seedha Render pe jaata hai, to SR-005 ki CSP me iska apvaad chahiye: Security Architect ke doosre run me. Delivery code ka milaan sirf online hai, to bina network ke darwaze pe kya ho, ye UX aur Security ke saath.

### D-295. ARCHITECTURE batch 5: search aur caching

- **Faisla:** search aur cache ke 11 niyam [ARCHITECTURE.md](ARCHITECTURE.md) §6 me: catalog ke cluster pe Atlas Search ek `search_documents` read model pe, free cluster pe 3 indexes, D-139 ka kram, synonyms bina deploy, zero result ki ginti bina user id, laptop aur CI ke liye text index ka adapter, CDN pe sirf "public cacheable" routes, personal jawab `private, no-store`, polling pe ETag, aur Redis me koi data cache nahi.
- **Wajah:** Claude ki salah, owner ne maani: D-138 ke filters aur D-139 ka kram ek index se, ₹0 aur data bahar nahi (D-157 ki soch); Render ki mahine ki bandwidth aur kam CPU public browsing CDN se bachte hain.
- **Chhode vikalp:** sirf MongoDB text index (na fuzzy, na synonyms ki setting); process ki memory me search index (R-007); bahar ki search service (naya processor, data bahar); Redis me catalog ka cache (chhoti memory, restart pe khaali).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** free cluster pe fuzzy, autocomplete aur synonyms ki seema, aur Vercel ka cache vyavhaar: jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 me.

### D-296. ARCHITECTURE batch 6: media aur files

- **Faisla:** files ke 9 niyam [ARCHITECTURE.md](ARCHITECTURE.md) §7 me: upload maalik service ki ijazat se seedha provider pe (D-284), har file ka record media me, dobara encode aur EXIF hatana provider pe, private file ka chhota URL, har maqsad ka retention aur D-262 ki band jagah, ek file ek maalik, PDF ek halki library se (headless browser nahi), export stream se, aur roz aur hafte ka cleanup.
- **Wajah:** Claude ki salah, owner ne maani: backend ke raaste file kabhi nahi, to memory (R-007) aur bandwidth dono bachte hain; SR-061 aur SR-062 ek jagah poore.
- **Chhode vikalp:** files MongoDB me (har cluster 0.5 GB, R-006); files backend ke raaste (memory, bandwidth); har service ki apni registry (provider ki chaabi har jagah, SR-071).
- **Kab dobara khulega:** D-284 ki shart ki jaanch ka nateeja, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** jaari document ka PDF tax archive ki "asli copy" maana jaaye ya nahi: Lawyer (ya CA) se nahi jaancha (CL-021). Media provider ki files ka backup nahi: OPERATIONS me DevOps / SRE ke saath.
- **Jod (owner, 2026-11-21):** §7 me niyam 10: file badalne pe nayi file nayi `assetId` (naya URL) ke saath judti hai, purani turant `deleting` me jaati hai aur roz ka job use mitata hai; jis purani file ki kisi record ko zaroorat ho, wo apne retention tak rehti hai. Koi file bina record ke hamesha nahi rehti. Provider mitayi files ko trash ya backup me kitne din rakhta hai, ye jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 ki media wali row me.

### D-297. ARCHITECTURE batch 7: observability

- **Faisla:** logs aur alerts ke 10 niyam [ARCHITECTURE.md](ARCHITECTURE.md) §8 me: structured JSON logs aur request id, logs service me 180 din (2027 se 1 saal) ke gzip chunks, kya kabhi log nahi, audit ke purane din compressed chunks me usi chain ke saath, errors ka apna intezaam (D-286), ops snapshot, `/health` aur `/ready`, alerts ke misaal thresholds, hafte ka haath se dekhna, aur server ki ghadi.
- **Wajah:** Claude ki salah, owner ne maani: free tier pe logs aur alerts seemit (R-024); CERT-In ke logs (CL-106) aur audit ke 2 saal (D-194) Atlas ke 0.5 GB me tabhi fit hote hain jab dabaaye jaayein.
- **Chhode vikalp:** Prometheus, Grafana ya tracing backend (₹0 pe koi host nahi, D-056); sampled request logs (CERT-In saare logs maangta hai, CL-106); Render ke apne logs pe bharosa (umar pakki nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** alerts ka asli chalna aur thresholds DevOps / SRE ke saath (OPERATIONS).

### D-298. ARCHITECTURE batch 8: scale aur capacity

- **Faisla:** capacity ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §9 me: ₹0 pe chalne ki seema ki table, ek order ka data, memory budget (aam lagbhag 200 MB, sabse zyada lagbhag 345 MB), performance targets (D-053), aur 8 niyam: D-283 ka design target, memory ke pehre (400 MB pe alert, 450 MB pe heavy kaam ruke), har cluster ki jagah ka naap, R1 se pehle Docker me 512 MB pe naap, aur hafte ka bandwidth, ghante aur CU-ghante ka dekhna.
- **Wajah:** Claude ki salah, owner ne maani: design target aur ₹0 ki asli seema alag aur saaf likhi; D-049 dobara kholne ka gate bhi saaf.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (capacity ke number baaki).
- **Kab dobara khulega:** asli naap ke baad numbers (settings se), aam RSS 400 MB se upar ya hafte me ek se zyada OOM restart (D-049), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** Render ki mahine ki 5 GB bandwidth khatam ho aur payment method na ho to free services mahine ke ant tak band: ye risk R-029 (D-299). Render free instance ka CPU jaanchna baaki ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2).

### D-299. Architect ke risks

- **Faisla:** 8 naye risks [RISKS.md](RISKS.md) me: R-028 (Neon band to pack aur dispatch ruke), R-029 (Render ki 5 GB bandwidth), R-030 (kam CPU), R-031 (Atlas ke 0.5 GB me audit pehle bhare), R-032 (Atlas Search ki free seema), R-033 (Atlas cluster ka ruk jaana), R-034 (apps ka purana version), R-035 (media ke free credits). R-030 `Maana`, baaki bachav ke saath `Khula`. R-002, R-007, R-010, R-014 aur R-024 me jod.
- **Wajah:** Claude ki salah, owner ne maani: kam CPU ₹0 ka hi hissa hai (D-028 ki tarah jaan ke maana); baaki ka bachav ARCHITECTURE §2 se §9 me likha hai, par khatra bacha hai.
- **Chhode vikalp:** sab `Khula` (R-030 hamesha khula dikhta, jabki ₹0 pe hal nahi); risks rokna (₹0 ke khatre chhupe rehte).
- **Kab dobara khulega:** asli naap, provider ki seema badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.

### D-300. Area band karne ka kram

- **Faisla:** area band karne ka kram do kadam me: pehle checkout pe us area ki rok ka event, phir area band. Parcel banate waqt logistics band area wale order ko rokta hai, aur wo order cancel aur refund (D-111).
- **Wajah:** Claude ki salah, owner ne maani: serviceability ki jaanch commerce ki copy pe hoti hai (D-016 niyam 9, D-291), jo kuch second peeche reh sakti hai; is kram se der ka asar sirf ek-do order, aur wo bhi parcel se pehle pakda jaata hai. Sync calls ki list chhoti rehti hai.
- **Chhode vikalp:** band karte waqt commerce ko sync call (sync graph bada); kuch nahi, staff haath se cancel kare (order chhoot sakta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** area band karne ka flow operations me (D-015, D-037); customer ko cancel ki khabar D-111 ke raaste se.

### D-301. Bina network ke delivery code

- **Faisla:** code wali delivery sirf online hoti hai: code ka milaan server pe (SR-054, D-294). Offline me delivery ki list, scans aur photo line me rehte hain. Darwaze pe network na ho to partner thoda intezaar kare ya Hub Manager se baat kare; "network nahi" D-072 ka "code na mile" wala raasta nahi hai.
- **Wajah:** Claude ki salah, owner ne maani: code ka saboot pakka rehta hai (D-072, D-068), aur SR-054 nahi toot-ta.
- **Chhode vikalp:** network na ho to photo aur location ka raasta ("network nahi" bol ke code se bachna aasaan); code ka hash partner ke phone pe (SR-054 ke khilaaf, code chori ho sakta).
- **Kab dobara khulega:** kamzor network se deliveries me der ka asli naap, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** Delivery app me "network nahi" ki saaf screen aur Hub Manager se baat ka raasta (UX ke saath); D-072 me jod.

### D-302. Order confirmation ki email line

- **Faisla:** din ki seema ke paas emails ki line (D-126 niyam 4) me order confirmation (jisme delivery code hai) paise ki line me jaata hai.
- **Wajah:** Claude ki salah, owner ne maani: confirmation order ka record hai aur usme delivery code hai; OTP ki pakki jagah nahi ghat-ti.
- **Chhode vikalp:** baaki ki line (bhaari din pe confirmation agle din tak); OTP ki line (OTP ruk sakte, sign-in rukta).
- **Kab dobara khulega:** emails ki seema badle, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** D-126 me jod. Bhaari din pe paise ki line me invoice aur refund ke emails ke saath jagah baant-ni (D-142).

### D-303. Media provider ki files ka backup

- **Faisla:** media provider (D-284) ki files ka backup nahi. Product images seller se dobara li jaati hain; daawe aur saboot ki files apne samay pe waise bhi mitti hain. Ye baat OPERATIONS me ek line me (DevOps / SRE ke saath). Databases ka backup D-013 ke hisaab se waise hi.
- **Wajah:** Claude ki salah, owner ne maani: ₹0 pe sabse saral; product images seller ke paas hain; aur owner ke laptop pe personal data ki copy nahi badhti (D-196, R-023).
- **Chhode vikalp:** hafte ka backup laptop pe (bandwidth R-029, laptop pe personal data); do providers me copy (dugna kaam, ek aur processor).
- **Kab dobara khulega:** provider pe koi file kho jaaye, asli business shuru ho, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-20. **Nishaan:** Salah maani.
- **Asar (Claude):** provider pe file kho jaaye to daawe ya kanooni rok (D-262) wali photo ka saboot nahi bachta. Kanooni rok wali files ki ek hi copy kaafi hai ya nahi: Lawyer se nahi jaancha.

### D-304. Har app parivaar ka alag account

- **Faisla:** ek insaan ek hi email se kai parivaaron me ho sakta hai, par har parivaar (customer, seller, delivery partner, Creator, staff) ka alag account: unique (email, parivaar); password, authenticator aur sessions alag; customer ka delete seller, partner ya Creator ke account ko nahi chhoota. Staff ke accounts pehle se alag (D-017).
- **Wajah:** Claude ki salah, owner ne maani: customer ka email code wala sign-in (D-021) aur seller ke paise ke kaam (D-184) ek credential pe nahi rehte, aur customer ka delete (D-151) seller ka business account nahi le jaata.
- **Chhode vikalp:** ek email, ek account (grants se sab kaam; customer ka delete business account bhi le jaata); ek email sirf ek parivaar me (asli sellers pe bojh).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** ek insaan ke do passwords ho sakte hain. Brand ke staff ka apne product pe review roko (D-156) email ke mel se (SR-059). Har app ka apna sign-in (D-186) isi se mel khaata hai.

### D-305. Account delete pe reviews

- **Faisla:** customer account delete kare to uske chhape reviews ke star aur text rehte hain; naam ki jagah "Deleted customer", aur "Verified purchase" ka nishaan rehta hai; review ki photos hat-ti hain.
- **Wajah:** Claude ki salah, owner ne maani: rating sach rehti hai (D-139, D-154), aur chehre wali photo (D-155) account ke saath chali jaati hai.
- **Chhode vikalp:** review poora hatana (brand ki rating achanak badalti); sab rakhna, sirf naam hatana (chehre wali photo bina account ke rehti).
- **Kab dobara khulega:** Lawyer ki raay, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** text me customer ne khud apni pehchaan likhi ho to wo rehti hai; report ya staff se hat sakti hai. Kanooni detail jaanchi nahi: erase ka haq aur maqsad poora hone pe erase (CL-091, CL-093) reviews pe kaise laagu, Lawyer se nahi jaancha.

### D-306. Purane orders ka archive

- **Faisla:** band order (delivered, return ki khidki aur khule maamle khatam) ki poori detail misaal 13 mahine live rehti hai; uske baad mahine ke compressed archive me. Orders ki list me saar (number, tareekh, rakam, items ke naam); detail kholne pe archive se (misaal 1 se 2 second); invoice hamesha finance se. Design R1 me (`closedAt`, `archivedAt`, ek chhota `order_index`); archive ka job tab chalu jab commerce ki jagah 50% pahunche.
- **Wajah:** Claude ki salah, owner ne maani: ₹0 pe 100 orders/din pe commerce ka 0.5 GB lagbhag 1.7 saal me bharta hai ([ARCHITECTURE.md](ARCHITECTURE.md) §9); archive se purana order review (D-135), return (D-221), recall (D-129) aur support ke kaam ka rehta hai.
- **Chhode vikalp:** har order hamesha live (₹0 pe lagbhag 1.7 saal me ruk); 13 mahine ke baad sirf saar aur invoice (support aur R2 ka "dobara order" D-178 kamzor).
- **Kab dobara khulega:** asli naap, paid plan, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-307. Baaki cheezon ke rakhne ke samay

- **Faisla:** jin cheezon ka samay pehle tay nahi tha, unke samay (misaal, sab settings me): in-app inbox ki khabar 180 din; bheje emails ka record (bina code) 90 din; cart bina chhue 90 din; wishlist account tak, 200 items tak; waitlist (D-046) area khulne ki khabar ke 30 din baad, warna 1 saal; band sessions ka record 30 din; daam ka itihaas (D-061) 400 din live, purana audit me 2 saal (SR-076); zero result ke shabd (D-152) 90 din; fraud ke signals (SR-058) 2 saal; owner ke aankde (D-149) 3 saal.
- **Wajah:** Claude ki salah, owner ne maani: har cheez ka samay uske kaam jitna; D-191 se D-194 aur D-250 ki classes ke bahar ki cheezon ke TTL indexes aur jagah isi se.
- **Chhode vikalp:** personal data wali sab cheezein 1 saal (jagah zyada); sab 90 din (waitlist aur fraud ke pattern kho jaate).
- **Kab dobara khulega:** asli naap, Lawyer ki raay, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** TTL indexes pehle din se. Lagbhag 13 May 2027 se kanooni rok (D-250) in cheezon pe bhi laagu ho sakti hai: uski seema Lawyer se nahi jaanchi.

### D-308. Order number ka roop

- **Faisla:** customer ko dikhne wala order number 10 ank ka random jaisa number, aakhri ank check digit (jaise `4827-1930-56`); unique index, takrav pe dobara number. Return aur daawe ke numbers wahi roop, apne prefix ke saath.
- **Wajah:** Claude ki salah, owner ne maani: din ya kul orders ki ginti bahar nahi dikhti, aur galat type kiya number check digit se pakda jaata hai.
- **Chhode vikalp:** tareekh aur din ki ginti (din ki bikri ka andaza bahar); lagataar ginti (kul orders saaf dikhte).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** invoice ka number alag hai (ARCHITECTURE §1.7, bina gap); order number push (D-195), emails aur seller ki report (D-143) me jaata hai.

### D-309. Finance ke band financial years

- **Faisla:** jis FY ka annual return aur sudhaar ki khidki band ho gayi, uske journals, documents aur lines ek encrypted, hash se band export file (har FY ek) me private file storage (D-284) pe jaate hain. Neon me us FY ke closing balances, documents ki list (number, tareekh, rakam, hash) aur file ka hash rehta hai. Purani detail ke liye file ko ek alag database me restore. File backup command (D-013) me bhi. Design ab (`fy` column, documents ki list, hash); kaam pehla FY band hone ke baad.
- **Wajah:** Claude ki salah, owner ne maani: books 8 FY (ARCHITECTURE §1.1, CL-131) aur tax documents 72 mahine (CL-021) rakhne hain, par ₹0 pe 100 orders/din pe Neon lagbhag 1.4 se 2.8 saal me bharta hai.
- **Chhode vikalp:** sab Neon me (bharne pe paid plan, warna finance aur pack ruke, R-028); band FY ki lines mahine ke saar me milana (books ki detail badalti, CL-131 ke khilaaf).
- **Kab dobara khulega:** Neon ki asli jagah ki jaanch ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2), CA ki raay, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** purane saal ki detail turant nahi (restore chahiye), aur ek file ki suraksha. Kanooni detail jaanchi nahi: export file books ka "electronic roop" maani jaaye ya nahi, aur asli business pe India me roz ka backup (CL-131), CA (aur Lawyer) se nahi jaancha.

### D-310. Data batch 1: ids, numbers, paisa aur samay

- **Faisla:** ids, numbers, paisa aur samay ke 10 niyam aur numbers ki table [ARCHITECTURE.md](ARCHITECTURE.md) §10.1 me: ObjectId aur naam wale `_id`, finance ke `bigint` keys, client ke UUIDv7 ka sirf hash, rakam integer paise (BSON `long`, PostgreSQL `bigint`), rates basis points, UTC timestamps aur `istDay`, bahar ke numbers `counters` se, aur seller ka code 3 characters (§1.7 ki misaal badli). Numbers misaal, settings me.
- **Wajah:** Claude ki salah, owner ne maani: rakam aur rounding ki galti jad se band (§1.8), aur ids aur numbers ka ek roop saari services me.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (data ka bunyadi roop baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-311. Data batch 2: transactions, concurrency aur platform collections

- **Faisla:** 13 niyam aur har service ki platform collections ki table [ARCHITECTURE.md](ARCHITECTURE.md) §10.2 me: transaction helper, ek transaction me badlav aur outbox, `version` aur 409, purani halat filter me, "ek hi" wali cheezon ke unique indexes, counters pe conditional `$inc`, copies ka `srcVersion`, dispatcher ke niyam, band subscriber pe koshish ki ginti nahi, aur PostgreSQL ke locks aur retries.
- **Wajah:** Claude ki salah, owner ne maani: do scans, do staff ya dobara aaya event ek kaam do baar nahi karta; finance ka database band ho to events dead letter me nahi jaate (R-028).
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (concurrency ke niyam baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-312. Data batch 3: personal data, retention aur kanooni rok

- **Faisla:** 11 niyam aur delete ki table [ARCHITECTURE.md](ARCHITECTURE.md) §10.3 me: har collection ki retention class (CI ka pehra), business cheezein sirf `archived`, erase = field hatana ya delete, rok ki copy `sealed_records` me alag key se, field encryption aur blind index (SR-063), codes sirf hash, delivery code encrypted (customer ko dikhana zaroori), PAN aur bank finance me, naam aur pata sirf tax archive me, aur account delete pe har service ka kaam.
- **Wajah:** Claude ki salah, owner ne maani: delete (D-151, SR-066), kanooni rok (D-250, D-262) aur tax archive (D-225) ek doosre ko tode bina saath chalte hain.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (delete aur rok ka tareeka baaki).
- **Kab dobara khulega:** Security Architect ka doosra run, Lawyer ki raay, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** SR-063 me "baaki codes sirf hash" se delivery code ka apvaad: Security Architect ke doosre run me pakka. Reviews pe delete D-305 se.

### D-313. Data batch 4: migrations, release steps, seeds aur M0 ki aadatein

- **Faisla:** 10 niyam [ARCHITECTURE.md](ARCHITECTURE.md) §10.4 me: lease ke peeche release step aur fingerprint, index ka naam aur roop, expand aur contract do releases me, idempotent data migrations, alag release user, finance ki numbered SQL migrations (Neon ke pehle kaam pe), zaroori fields pe validators, cursor wali lists aur collection scan ka pehra, seeds (demo me koi asli personal data nahi), aur backup ka roop.
- **Wajah:** Claude ki salah, owner ne maani: deploy ke waqt do instance aur M0 ke 100 ops/second me badlav bina downtime ke aur dobara chalne layak.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (migrations ka tareeka baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** backup ka asli chalna DevOps / SRE ke saath (D-013).

### D-314. Data batch 5: commerce ke orders, stock aur reservation

- **Faisla:** 14 niyam [ARCHITECTURE.md](ARCHITECTURE.md) §10.5 me: order ka ek document, batch ke level pe stock (`stock_batches`, `stock_balances`, `stock_bins`, `stock_movements`), place order ek transaction me, FEFO, dikha hua batch hi, prepaid reservation ka timer, der se payment pe usi MRP aur expiry ka batch ya ek refund, pack ke teen kadam (`packSeq`), cancel sirf pack se pehle, raat ki stock jaanch, storage fee ki ghadi, recall ki list, aur band orders ka archive (D-306).
- **Wajah:** Claude ki salah, owner ne maani: stock kabhi minus nahi (SR-045), customer ko dikhe batch ka MRP aur expiry hi milte hain (D-064, D-067), aur pack pe invoice dobara nahi banta.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (commerce ka data baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-315. Data batch 6: finance ka PostgreSQL

- **Faisla:** 15 niyam aur tables ki list [ARCHITECTURE.md](ARCHITECTURE.md) §10.6 me: 7 schemas, journal ka barabar hona (deferred trigger), ek ghatna ek journal, books pe sirf insert, band mahina, bina gap number (series row ka lock), cancel aur credit note, pack ki idempotency, tax archive, payout ke do haath (D-189), TDS aur TCS, `sys` tables aur roz ka purge, dispatcher aur ticker sirf jaage finance pe, aur `pg` ke saath query builder (ORM nahi).
- **Wajah:** Claude ki salah, owner ne maani: books ke niyam (§1) database ke constraints se pakke, aur Neon ke CU-ghante bachte hain (R-014).
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (finance ka data baaki).
- **Kab dobara khulega:** CA ki raay, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-316. Data batch 7: baaki services ke data niyam

- **Faisla:** 10 niyam [ARCHITECTURE.md](ARCHITECTURE.md) §10.7 me: identity (unique email aur parivaar D-304, credentials alag, refresh token, codes ki koshishein, delete ka timer), notify (chhat ka counter, OTP DB me nahi), payments (webhook ka event id, refund ki seema, ek parcel ek QR), catalog (ek brand ek seller, barcode unique, listing versions, daam ka itihaas, ek review), logistics (address save nahi, code ka milaan, location sirf kuch pal) aur support (daawe ki khidki, rakam ki seema, appeal).
- **Wajah:** Claude ki salah, owner ne maani: har service ke "ek hi" wale niyam aur personal data ki jagah data ke level pe pakke.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (baaki services ke niyam baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** logistics ko naam, address aur phone maalik se chahiye; ye raasta (sync list ya offline data) tay faislon pe dhyaan ke points ke saath aage.

### D-317. Data batch 8: audit, media, logs aur jagah

- **Faisla:** 7 niyam aur clusters ki table [ARCHITECTURE.md](ARCHITECTURE.md) §10.8 me: audit ka sirf insert aur find wala user, din ki chain aur gzip chunks, chunk ki umar setting, media ka record aur rok, logs ke chunks ka TTL, band records ka mahine ka archive (likho, hash jaancho, phir delete), aur har collection ka roz ka naap aur alert.
- **Wajah:** Claude ki salah, owner ne maani: Atlas ke 0.5 GB me audit sabse pehle bharta hai (R-031); design target (D-283) aur ₹0 ki seema alag aur saaf likhi.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (jagah ka plan baaki).
- **Kab dobara khulega:** asli naap, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** audit ka sirf insert user M0 pe custom roles milne pe tika hai: jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 me.


### D-318. Database Architect ke risks

- **Faisla:** 7 naye risks [RISKS.md](RISKS.md) me: R-036 (Neon ki jagah me books ke 8 FY nahi samaate), R-037 (sale ke din hot documents pe takraav), R-038 (copies peeche ya galat), R-039 (field encryption ki key), R-040 (nayi collection bina retention class ke), R-041 (ek release me jodna aur hatana), R-042 (audit ka chunk job ruke). Sab bachav ke saath `Khula`.
- **Wajah:** Claude ki salah, owner ne maani: har ek ka bachav [ARCHITECTURE.md](ARCHITECTURE.md) §10 me likha hai, par ₹0 aur ek insaan ke kaam me khatra bacha hai.
- **Chhode vikalp:** kuch `Maana` (owner ne koi nahi chuna); risks rokna (khatre chhupe rehte).
- **Kab dobara khulega:** asli naap, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-319. Data ke 5 sudhaar

- **Faisla:** (1) [ARCHITECTURE.md](ARCHITECTURE.md) §2.3 me sync call logistics → commerce: assign aur Delivery sync ke waqt parcel ka naam, address aur phone (resolver), logistics me copy nahi. (2) §2.2 me finance `commerce.orderLine.delivered` aur `commerce.parcel.packVoided` bhi leta hai. (3) Pack adhoora rahe ya dobara ho to commerce `commerce.parcel.packVoided` (parcel, seller, `packSeq`) bhejta hai; finance dispatch se pehle us invoice ko cancel karta hai (§10.5 niyam 9). (4) [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) SR-063 me: delivery code encrypted, kyunki customer ko dikhana zaroori hai; milaan server pe; baaki codes sirf hash. (5) §9 ki ₹0 table me Neon ki jagah ki line.
- **Wajah:** Claude ki salah, owner ne maani: inke bina partner ko darwaze ka pata nahi milta, seller ka payable (D-081) aur delivery fee ka invoice (§1.6) delivered ke pal pe nahi bante, aur pack dobara hone pe galat invoice reh jaata.
- **Chhode vikalp:** kuch hi sudhaar (owner ne sab maane); rokna (kamiyaan bani rehti).
- **Kab dobara khulega:** Security Architect ka doosra run, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** sync calls ki list me ek call aur commerce ka ek naya event. Delivery code ka apvaad pehle D-312 ke asar me tha; ab SR-063 me likha.

### D-320. Delete ke baad seller ki invoice copy

- **Faisla:** customer ka account delete hone ke baad bhi seller apne invoice ki copy (₹50,000 ya zyada pe customer ke naam aur pata ke saath, D-226) ek-ek karke finance ke tax archive se download kar sakta hai, finance ke raaste, har download audit me ([ARCHITECTURE.md](ARCHITECTURE.md) §10.3 niyam 12).
- **Wajah:** Claude ki salah, owner ne maani: seller ka 72 mahine ka record (CL-021) poora rehta hai, aur naam aur pata sirf ek band jagah se, audit ke saath, nikalta hai.
- **Chhode vikalp:** copy sirf jaari hote waqt (seller copy kho de to wapas nahi); delete pe sellers ko suchna (har delete ki baat bahar).
- **Kab dobara khulega:** Lawyer ya CA ki raay, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** SR-088 (seller ko invoice ki copy) ke saath tax archive ka ek padhne ka raasta. Kanooni detail jaanchi nahi: delete ke baad seller ko customer ka naam aur pata dena (CL-020, CL-021), Lawyer (ya CA) se nahi jaancha.

### D-321. Kanooni rok aur technical records

- **Faisla:** lagbhag 13 May 2027 se "sab data 1 saal" ki rok (D-250 niyam 2) me retention class `tech` ke records (OTP ke hash, idempotency ke jawab, sessions, outbox, inbox) nahi aate; unka personal data (IP, samay) request logs me pehle se 1 saal rehta hai (D-285) ([ARCHITECTURE.md](ARCHITECTURE.md) §10.3 niyam 4).
- **Wajah:** Claude ki salah, owner ne maani: in records ki ginti bahut zyada hai, aur har deletion pe rok ki copy har cluster ki jagah kha jaati (R-031).
- **Chhode vikalp:** sab rok me (jagah bhaari); sirf personal data wale technical records rok me (har collection pe alag faisla).
- **Kab dobara khulega:** Lawyer ki raay, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** Kanooni detail jaanchi nahi: `tech` class ko rok se bahar rakhna D-250 ki seema me aata hai ya nahi (CL-093), Lawyer se nahi jaancha.

### D-322. Server ko jagaane ka samay

- **Faisla:** bahar ka pinger live server ko ghante me ek baar, 09:00 se 22:00 IST (din me 14 baar) jagaata hai. Raat ko server soya rehta hai; jo kaam user karta hai wo server ko waise bhi jagata hai, aur raat ke samay wale kaam jaagte hi sweep se pakde jaate hain ([ARCHITECTURE.md](ARCHITECTURE.md) §4 niyam 1).
- **Wajah:** Claude ki salah, owner ne maani: bina user ke sirf roz ke kaam aur saar bachte hain, unke liye ghante ki jaag kaafi hai, aur Render ke mahine ke 750 ghante (R-008) me sabse zyada jagah bachti hai (lagbhag 115 ghante, upar se asli use).
- **Chhode vikalp:** din me lagataar jaaga, 09:00 se 23:00 IST (lagbhag 435 ghante, provider ki policy ka jokhim zyada); 24 ghante jaaga (750 me lagbhag koi jagah nahi, ek galti pe mahine ke baaki din band).
- **Kab dobara khulega:** asli business ke waqt (paid hosting), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** [ARCHITECTURE.md](ARCHITECTURE.md) §9 ka "raat ko server soya" isi niyam se mel khaata hai; D-056 ki "24 ghante bhi fit" wali line sirf ghanton ka hisaab hai, server 24 ghante jagaaya nahi jaata. Pinger ka tool aur uski kamiyaan (misaal GitHub ka schedule late ya chhoot sakta hai aur sirf default branch pe chalta hai) OPERATIONS ki batch me. Din me samay wale kaam zyada se zyada lagbhag 1 ghanta late. R1 me pehle live deploy se.
- **Jod (owner, 2026-11-21, D-349):** app use ho raha ho to app ki background ping (misaal har 10 minute) bhi server ko jaaga rakhti hai, raat ko bhi.

### D-323. Databases ke backup ki ginti

- **Faisla:** backup command (D-013) har release se pehle aur hafte me ek baar (misaal Sunday) chalta hai. Aakhri backup 8 din se purana ho to hafte ki jaanch me laal nishaan. Ye sirf databases ka hai; media provider ki files ka backup nahi (D-303).
- **Wajah:** Claude ki salah, owner ne maani: Atlas ke free cluster pe provider ka backup nahi, aur Neon free me sirf 6 ghante tak ka restore aur ek snapshot hai, to backup ki ginti hi data kho jaane ki seema hai; R1 me asli data kam hai, aur hafte ka ek kaam owner ke hafte ke 30 ghante (D-009) me fit hai. Provider ke tathya DevOps / SRE agent ne 2026-11-21 ko jaanche; main session ne source dobara nahi khola.
- **Chhode vikalp:** sirf har release se pehle (mahine bhar ka data jokhim); har release se pehle aur roz (owner ka roz samay, laptop pe roz badalti personal data ki copy, providers ke transfer ka zyada hissa).
- **Kab dobara khulega:** asli business ke waqt, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** data jokhim lagbhag 7 din. Backup ka niyam aur restore ka abhyaas OPERATIONS ki batch me. Laptop pe backup ki copies ka jokhim R-023 me. Kanooni detail jaanchi nahi: asli business pe company ke books ka India me backup (CL-131) kitni baar zaroori, Lawyer ya CA se nahi jaancha.

### D-324. Alerts dekhne ka samay

- **Faisla:** owner ops inbox din ke tay samay pe dekhta hai (misaal 09:00, 14:00, 20:00 IST). Gambhirta 1 (paisa, dastavez, staff ya provider account, data leak ka shak, sarkari order) ka browser push owner ke browser pe raat me bhi aata hai; gambhirta 2 aur 3 subah dekhe jaate hain.
- **Wajah:** Claude ki salah, owner ne maani: kai ghadiyaan chhoti hain (CERT-In ko 6 ghante, D-248; sarkari order pe 3 ghante aur nagnata wali report pe 2 ghante, D-251), aur raat ko server soya rehta hai (D-322), to gambhirta 1 ke alerts raat me kam aayenge, par jo aayein wo chhootein nahi.
- **Chhode vikalp:** sirf din me (raat ki ghatna pe kanooni ghadi chhoot sakti hai); har alert pe 24 ghante push (har chhote alert pe neend aur thakaan).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** incident ka kram (SR-084) aur owner ko alerts (SR-078) is samay ke saath OPERATIONS ke runbook me. Gambhirta ki list SR-084 wali hi. CERT-In ki 6 ghante ki ghadi incident pata chalne se ginti hai (D-248). Kanooni detail jaanchi nahi: 2 ya 3 ghante wali ghadiyaan ek insaan ke system pe kaise poori hon, Lawyer se nahi jaancha.

### D-325. Packages ka npm pe publish

- **Faisla:** abhi koi package npm pe publish nahi hota. Har package `private: true` rehta hai, aur CI iska pehra deta hai. R1 ke baad owner dobara dekhe.
- **Wajah:** Claude ki salah, owner ne maani: publish har package ke version, changelog aur supply chain (R-026) ka bojh laata hai, jo R1 ke order flow me madad nahi karta.
- **Chhode vikalp:** R1 ke baad chune hue packages public npm pe, trusted publishing aur provenance ke saath (R1 ke baad versions aur supply chain ka kaam); har package har release pe publish (sabse zyada bojh aur jokhim).
- **Kab dobara khulega:** R1 ke baad, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** D-023 ke packages CLI pe naya kaam tab tak nahi. CI me `private: true` ka check OPERATIONS ki batch me. npm pe publish, `npm login/logout` aur `npm trust` hamesha sirf owner ke kehne pe.

### D-326. OPERATIONS batch 1: environments aur laptop ka setup

- **Faisla:** 10 niyam [OPERATIONS.md](OPERATIONS.md) §1 me: teen jagah (laptop, CI, live), koi staging nahi, laptop ka infra aur version ka mel, sirf zaroori containers, `.env.example` ke teen hisse, ek command ka setup. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: laptop aur live ka farak (version, Redis ki memory) bugs chhupata hai, aur laptop, tests aur CI kabhi live data ko na chhooein.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (laptop ka setup baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-327. OPERATIONS batch 2: CI aur branch ke pehre

- **Faisla:** 12 niyam [OPERATIONS.md](OPERATIONS.md) §2 me: ek `check` job, `guard` (secret scan, branch flow, `npm audit`), static checks, asli containers pe tests aur repo ke pehre, supply chain, CI me koi production secret nahi, rulesets. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: Render aur Vercel sirf green `check` pe deploy karein, aur public repo me secrets aur supply chain ka pehra ho (SR-082).
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (deploy aur branches ka pehra baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-328. OPERATIONS batch 3: release, deploy, migrations aur rollback

- **Faisla:** 12 niyam [OPERATIONS.md](OPERATIONS.md) §3 me: release ka kram, Render aur Vercel ki settings, SIGTERM pe band hona, release step, expand aur contract, sirf ek release peeche rollback, smoke check, hotfix, release ka note. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: Render sirf pichhle 2 deploys tak wapas ja sakta hai, aur expand aur contract ke bina rollback data tod sakta hai.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (release ka kram baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-329. OPERATIONS batch 4: secrets aur config

- **Faisla:** 10 niyam [OPERATIONS.md](OPERATIONS.md) §4 me: secrets ki table (value kabhi nahi), kaunsa secret kahan, test aur live keys alag, config ka schema, do values ke saath badlav, kab badalna, providers pe MFA, settings DB me. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: repo public hai; secret kahan rahe, kaise badle aur test ya live key ka farak pehle se tay ho.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (secrets ka kram baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-330. OPERATIONS batch 5: soya server, jagana aur samay wale kaam

- **Faisla:** 12 niyam [OPERATIONS.md](OPERATIONS.md) §5 me: jagane ke raaste, pinger sirf `/wake` ya `/health`, jagane ki khidki (D-322), do call aur UptimeRobot ka samay, jaag pe sweep, cold start 90 second, ghanton ka hisaab, Key Value khaali hone pe, lamba break aur Atlas resume. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: free server 15 minute me so jaata hai; D-322 ka niyam lagu karna hai, aur GitHub ke schedule ki kamiyaan sambhalni hain.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (jagane ka kram baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-331. OPERATIONS batch 6: backup aur restore

- **Faisla:** 12 niyam [OPERATIONS.md](OPERATIONS.md) §6 me: backup me kya aur kya nahi, providers ke backup pe bharosa nahi, kab (D-323), kahan, manifest, transfer ki seema, pehle laptop pe restore, production restore ka kram, har 3 mahine abhyaas, RPO aur RTO. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: free tier pe providers ka backup nahi milta, aur restore ke abhyaas ke bina backup pe bharosa nahi.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (backup ka bharosa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-332. OPERATIONS batch 7: monitoring, health aur alerts

- **Faisla:** 9 niyam [OPERATIONS.md](OPERATIONS.md) §7 me: `/health`, `/ready` aur `/wake`, alerts ke teen raaste, gambhirta ke teen level, alerts ki ginti ki seema, bahar ke free alerts, ops page, logs ki umar, "dead man" check. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: soye server pe hamare apne alerts nahi bante, isliye bahar ke free alerts bhi chahiye.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (alerts ka dhaancha baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-333. OPERATIONS batch 8: incident ke runbooks

- **Faisla:** 12 niyam [OPERATIONS.md](OPERATIONS.md) §8 me: ek dhaancha, jawab ka samay (D-324), data leak (D-248), secret leak, provider account pe kabza, laptop kho jaaye, OOM, free tier khatam, sarkari order, chhote kram, seekh aur saal ka abhyaas. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: kanooni ghadiyaan chhoti hain (D-248, D-251), aur sab ek hi insaan sambhalta hai.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (incident ka kram baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** Kanooni detail jaanchi nahi: data leak me "pakka" ki paribhasha aur users ko khabar ka samay, Lawyer se nahi jaancha.

### D-334. OPERATIONS batch 9: capacity aur free tier ki nigrani

- **Faisla:** 7 niyam [OPERATIONS.md](OPERATIONS.md) §9 me: hafte ki jaanch, numbers ki table git ke bahar, 70% pe kaam, ₹0 ki table har 6 mahine dobara, ek hi Render service, Vercel ke deploys, repo personal account me. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: free sharten bina khabar badal sakti hain, aur 70% pe pehle se kaam ho to service band nahi hoti.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (nigrani baaki).
- **Kab dobara khulega:** har 6 mahine ki jaanch (§9 niyam 4) me providers ki sharten badlein, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-335. OPERATIONS batch 10: 512 MB pe memory ka naap

- **Faisla:** 7 niyam [OPERATIONS.md](OPERATIONS.md) §10 me: Docker me 512 MB aur kam CPU pe naap, chaar halat, kya naapna, nateeja aur D-049 kab khule, dobara naap, live se milaan, script sirf laptop pe. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: R-007: bundle mode 512 MB me chalega ya nahi, ye R1 se pehle naap se pata chalna chahiye.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (memory ka jokhim bina naap ke).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-336. OPERATIONS batch 11: dependencies aur packages ka publish

- **Faisla:** 8 niyam [OPERATIONS.md](OPERATIONS.md) §11 me: mahine ke dependency PRs, naye dependency ka review, Node ka version pinned, Atlas ka version, merge owner kare, `private: true` ka pehra (D-325), publish ka plan bane to uske niyam, fake registry. Numbers misaal, settings me ya code ke saath pakke.
- **Wajah:** Claude ki salah, owner ne maani: supply chain ka jokhim (R-026) aur D-325 ka pehra CI me chahiye.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (dependencies ka kram baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-337. DevOps / SRE ke risks

- **Faisla:** 12 naye risks [RISKS.md](RISKS.md) me: R-043 (GitHub ka schedule late ya band), R-044 (Render keep-alive ki policy), R-045 (rollback sirf do deploys tak), R-046 (providers ka backup nahi, apna sirf laptop pe), R-047 (Neon ka transfer), R-048 (logs ki chhoti umar), R-049 (cold start aur 120 second), R-050 (alerts ek insaan pe), R-051 (secrets ka haath se badlav), R-052 (free sharten badalna), R-053 (Atlas ka version), R-054 (public repo me kamzori ki detail). Sab bachav ke saath `Khula`.
- **Wajah:** Claude ki salah, owner ne maani: har ek ka bachav [OPERATIONS.md](OPERATIONS.md) me likha hai, par ₹0 aur ek insaan ke kaam me khatra bacha hai.
- **Chhode vikalp:** kuch `Maana` (owner ne koi nahi chuna); risks rokna (khatre chhupe rehte).
- **Kab dobara khulega:** asli naap ya providers ki sharten badlein, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** Kanooni detail jaanchi nahi: R-050 me kanooni ghadiyaan chhootne ka asar, Lawyer se nahi jaancha.

### D-338. Operations ke 6 sudhaar

- **Faisla:** 6 chhote sudhaar: (1) [ARCHITECTURE.md](ARCHITECTURE.md) §10.4 niyam 1 me schema wala hissa listen se pehle aur lambi data migration background me; (2) SR-078 me UptimeRobot ka check jaage server pe; (3) SR-080 me CI ka secret scan asli pehra, aur repo ke push protection ki jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 me; (4) SR-084 me LESSONS ki line fix live hone ke baad hi; (5) D-024 me jod: default branch badalne se pehle scheduled workflows nayi default branch pe; (6) [RISKS.md](RISKS.md) §2.1 me 10 Atlas projects ki ginti.
- **Wajah:** Claude ki salah, owner ne maani: ye chhoti baatein chhoot jaayein to deploy ka health check fail, jhoothe alerts, ya chupchaap band jagana ho sakta hai.
- **Chhode vikalp:** kuch sudhaar (owner ne koi nahi chuna); koi sudhaar nahi (kamiyaan bachi rehti).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-339. Stack me jod: Zustand aur pino

- **Faisla:** D-001 ke stack me do cheezein judti hain:
  1. **Frontend:** state management ke liye Zustand.
  2. **Backend:** logger pino, aur uske saath pino-pretty.
- **Wajah:** owner ka faisla (2026-11-21).
- **Chhode vikalp:** koi vikalp nahi rakha gaya; owner ne seedha chuna.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Owner.
- **Asar (Claude):**
  - Server se aaya data TanStack Query me hi rehta hai (D-001; [ARCHITECTURE.md](ARCHITECTURE.md) me har app ka typed client TanStack Query ke saath). Zustand browser ki apni state ke liye (jaise khule panels, filters ka draft). Zustand ka `persist` (browser storage) bhi SR-027 ke andar: token ya user ka data nahi, sirf theme jaisi pasand.
  - D-297 ([ARCHITECTURE.md](ARCHITECTURE.md) §8) ke structured JSON logs pino se. pino-pretty sirf local development me logs padhne ke liye (dev dependency); CI aur production ke logs JSON hi rehte hain, taaki D-297 na toote.

### D-340. Brand ke rang

- **Faisla:** saare apps ke brand rang garam rose, gehra plum aur champagne gold accent ke saath, garam neutrals (ivory se ink). Misaal: rose `rgb(214, 51, 108)`, plum `rgb(92, 26, 70)`, gold `rgb(196, 154, 82)`, ivory `rgb(253, 248, 245)`, ink `rgb(28, 22, 25)`. Button ke hover aur pressed roop hamesha gehre, kabhi halke nahi (rose pe safed text 4.62:1, AA ke paas).
- **Wajah:** Claude ki salah, owner ne maani: beauty category me garam rose aur plum pehchaan banate hain, garam neutrals skin tones ki photos ke saath kam takraate hain, aur poori scale ke contrast pehle se gine ja sakte hain.
- **Chhode vikalp:** neutral premium (pehchaan kam); halka pastel (contrast ka kaam aur galti ka mauka zyada).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** poori scale (50 se 950) aur har jodi ka contrast [DESIGN.md](DESIGN.md) ki batch me aayega. Contrast ratios UX / Product Architect agent ne WCAG ke formula se gine, kisi audit tool se nahi: CI ka contrast check hi pakka saboot hoga.

### D-341. Fonts

- **Faisla:** body aur UI ke liye Plus Jakarta Sans, Customer app ki headings ke liye Fraunces; dono variable fonts, OFL license, self-hosted (apne app ke saath Vercel se, bahar ka font CDN nahi). Sirf Latin subset jisme ₹ (U+20B9) ho, woff2 me; `font-display: swap` aur sirf ek preload. Daam aur tables hamesha body font me `tabular-nums` ke saath. Staff apps me sirf sans.
- **Wajah:** Claude ki salah, owner ne maani: Customer app ko brand ka roop, staff apps halke, aur ₹ aur ank har device pe ek jaise.
- **Chhode vikalp:** ek hi sans font saare apps me (roop saada); system font stack (₹ aur ank har device pe alag).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** Customer app ki pehli load pe lagbhag 70 KB zyada (misaal). Fonts ka license CL-125 ki list me. Kanooni detail: Lawyer ya CA se nahi jaancha.

### D-342. Dark theme

- **Faisla:** R1 se saare apps me light aur dark theme. Default system ki setting; har app me toggle (Light, Dark, System); pasand sirf browser storage me (SR-027). Print, PDF aur labels hamesha light.
- **Wajah:** Claude ki salah, owner ne maani: tokens ek baar bante hain; staff raat me aur partners dhoop me kaam karte hain, dono ko apni pasand chahiye.
- **Chhode vikalp:** R1 me sirf light, toggle R2 me (R2 me har screen dobara dekhna); Customer app sirf light (ek app ka alag niyam).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** har screen ka contrast aur accessibility test (axe) dono themes me; screenshot (visual) tests sirf mukhya screens pe (R-057, [RULES.md](RULES.md) RT-29, D-385).

### D-343. Customer app ki neeche ki bar

- **Faisla:** phone pe Customer app ki neeche ki bar me 5 tabs: Home, Categories, Orders, Cart, Account. Search har list aur Home ke header me hamesha khula; wishlist header ke dil (heart) ke icon se. Orders me delivery code (D-072) ka card sabse upar.
- **Wajah:** Claude ki salah, owner ne maani: door pe delivery code ek tap me khulta hai, aur search header me pehle se hai.
- **Chhode vikalp:** Search ka tab aur Orders Account ke andar (delivery code do tap door); neeche bar nahi, hamburger menu (har cheez ek tap aur door).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-344. Search ke sujhaav

- **Faisla:** search box ke sujhaav categories, brands aur concerns ki chhoti public list se aate hain: list ek public GET se, CDN pe cache (misaal 10 minute, SR-004 ki public cache list me), aur filter browser me hi. Products ka search Enter ya search button pe.
- **Wajah:** Claude ki salah, owner ne maani: ek customer ki ek call, sujhaav turant, aur ₹0 ke server pe har akshar ka bhaar nahi ([ARCHITECTURE.md](ARCHITECTURE.md) §9).
- **Chhode vikalp:** sujhaav nahi (dhoondhna dheema); har akshar pe server se product sujhaav (free tier pe bhaar aur der).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** product ke naam ka sujhaav nahi; zero result pe sujhaav D-152 se. SR-004 ki public cache list me ye route judna hai (Security Architect ka doosra run).

### D-345. Checkout ke kadam

- **Faisla:** cart se order do screens me:
  1. **Checkout:** address, delivery ki tareekh ka vaada, payment ka tareeka, har item ka batch ka MRP aur expiry, poora breakup, aur "Place order".
  2. **Payment:** sirf online payment pe, jahan gateway khulta hai; delivery pe UPI ho to "Place order" ke baad seedha order ki screen.
- **Wajah:** Claude ki salah, owner ne maani: ek nazar me poora order, aur gateway ki script sirf Payment route pe (SR-006).
- **Chhode vikalp:** chaar kadam ka wizard (kadam aur server calls zyada); ek hi screen jisme gateway bhi khule (bina payment wale kaam bhi gateway ki script ke saath).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** "Place order" pe hi stock rukta hai (D-118), to 15 minute ka timer Payment screen pe. Order se pehle ki jaankari D-067, D-107 aur CL-071 ke hisaab se Checkout pe.

### D-346. Browser push ki ijazat

- **Faisla:** Customer app browser notifications ki ijazat pehle order ke baad maangta hai: order ki screen pe apna card ("Get delivery updates on this device?" jaisa), "Turn on" aur "Not now" barabar ke buttons ke saath; "Turn on" pe hi browser ka prompt. "Not now" ke baad misaal 30 din tak card nahi. Account → Notifications me hamesha.
- **Wajah:** Claude ki salah, owner ne maani: wajah saaf ho to log zyada haan kehte hain aur browser ka "Block" kam hota hai; "Not now" ke baad bhi raasta khula rehta hai.
- **Chhode vikalp:** sign-up ke turant baad prompt ("Block" zyada); kabhi apne aap nahi (push wale kam, emails zyada).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** pehle order se pehle push nahi: area khulne ki khabar (D-141) unhe email se hi. Emails ki din ki chhat (D-142) pe asar QA aur DevOps ki ginti me.

### D-347. Address: form aur Ola Maps

- **Faisla:** customer address do raaston se de sakta hai, dono ek hi screen pe. Niyam:
  1. **Form:** address ke saare fields customer khud likh sakta hai, bina map ke.
  2. **Ola Maps se search:** map pe search (Ola ka autocomplete) se jagah chune to form ke fields apne aap bhar jaate hain, aur us jagah ka lat/lng (pin) bhi saath me save hota hai. Ghar ya flat number jaise hisse customer khud jode; bhare hue fields customer badal sakta hai.
  3. **Pin khud chunna:** map pe pin khiska ke ya tap karke sahi jagah chune; pin badalne pe lat/lng naya, aur form ke khaali fields usi jagah se bhar jaate hain (customer ke khud likhe fields nahi mitte).
  4. **"Use my current location":** browser ki location ek hi baar, accuracy ke saath; usse pin lagta hai aur form ke khaali fields bhar jaate hain.
  5. Pin "Remove pin" se hataya ja sake. Sirf form se diya address bina pin ke bhi chalta hai; tab SR-055 ka doori ka check "No pin" nishaan ke saath chhoot jaata hai.
  6. Map sirf address jodne ya badalne ki screen pe aur Delivery app me stop ki detail pe (pin ke saath). Delivery me raasta phone ke apne maps app ki link ("Open in maps") se; Ola ka routing R1 me nahi.
  7. API key sirf apne apps ke domains pe whitelist; server ko Ola chahiye to OAuth client credentials, key browser se bahar.
  8. **Limit:** Ola ki free seema (har API lagbhag 100,000 calls mahina) hamare istemaal ke liye kaafi maani gayi; alag ginti ya nigrani nahi. Credit nahi daalte (D-028). Ola na chale to form wala raasta chalta rehta hai.
  9. Map pe "Ola Maps" attribution (openstreetmap.org/copyright ki link ke saath) hamesha dikhe, aur jis app me map hai uske Credits page (D-350) pe Ola Maps ka credit component bhi; Ola ke End User Terms aur Privacy Policy ki link Privacy page aur address form pe.
- **Wajah:** owner ne khud chuna (2026-11-21): Ola Maps bhi aur form bhi; map se search pe form apne aap bhare, pin aur "Use my current location" bhi. Sahi pin se partner sahi ghar tak, aur India ke adhoore address me madad. Niyam 3, 5, 6, 7 aur 9 ki detail Claude ki salah, owner ne maani.
- **Chhode vikalp:** sirf "Use my current location", koi map nahi (Claude ki pehli salah); sirf map, bina form; OpenStreetMap ke free tiles; R1 me pin nahi.
- **Kab dobara khulega:** Ola ki sharten badlein, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Owner (form aur Ola Maps dono, autofill, pin, current location, limit); Salah maani (baaki detail).
- **Asar (Claude):** Ola (ANI Technologies Pvt. Ltd.) naya processor: address ka text, pin aur browser ki requests; D-255 niyam 8 ki processors list me. CSP (SR-005) me Ola ke hosts sirf in screens pe: Security Architect ka doosra run. Tathya [RISKS.md](RISKS.md) §2.6, risk R-064, aur baaki jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2. Ola ki terms me geocoding ke coordinates rakhne ka saaf niyam nahi mila: customer ka pakka kiya address aur pin hamara data, Ola ka content (jaise autocomplete ke results ki list) nahi rakhte. Kanooni detail: address aur location personal data, Lawyer se nahi jaancha.

### D-348. R1 ka Customer Home

- **Faisla:** jab tak Growth Studio (R2) nahi, Customer app ka Home sirf data se bane hisson se: pincode ka card (area live hai ya nahi, D-046), categories, "Bestseller" (D-154 ke niyam se), naye products aur top rated. Koi banner nahi.
- **Wajah:** Claude ki salah, owner ne maani: koi naya role ya upload ka raasta nahi, aur har hissa niyam se bana to bhed ka sawal nahi (D-139).
- **Chhode vikalp:** 1 se 3 static banners Master ki setting se (setting, upload aur maalik role); R1 me chhota banner editor (R1 ka scope badhta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-349. Server jaagne ka parda aur background ping

- **Faisla:** server ka parda sirf jaagne tak, aur jaagne ke baad app use hote tak server ko jaaga rakhta hai. Niyam:
  1. **Pehli jaag:** app khulte hi `/wake` ([ARCHITECTURE.md](ARCHITECTURE.md) §5 niyam 14); jawab tak wahi saada parda: pehle misaal 1.5 second sirf page ka rang aur patli progress bar, phir logo, ek line "Starting up. This can take up to a minute on our free server." aur andaaze wali progress bar; misaal 150 second baad "Try again". Customer app me demo ki patti bhi.
  2. **Tab tak app band:** jab tak server na jaage, app ka koi hissa nahi khulta: koi screen nahi, koi API call nahi.
  3. **Background ping:** jaagne ke baad app, jab tak use ho raha ho, har misaal 10 minute `/wake` ko ping karta hai (Render 15 minute bina traffic ke sota hai). Ping pe koi loading screen ya nishaan nahi.
  4. **"Use ho raha" ka matlab:** tab dikh raha ho aur user ne pichhle misaal 30 minute me kuch kiya ho (click, type, scroll). Tab chhupa ho ya bina kaam ke, to ping ruki; wapas aane pe turant ek ping.
  5. **Beech me so gaya:** ping fail ho ya server so gaya ho (rewrite 502 ya 504), to agle kaam pe wahi parda dobara aur app tab tak ruka ([OPERATIONS.md](OPERATIONS.md) §5 niyam 8).
  6. **Band karne ka switch:** ping ka interval aur on/off server ki setting se (Master), taaki Render ki keep-alive pe chetavni aaye to ye bhi band ho sake ([OPERATIONS.md](OPERATIONS.md) §5 niyam 11).
  7. **Delivery app ka offline (D-042):** network na ho to offline data wala kaam chalta hai; network ho par server soya ho to parda.
- **Wajah:** owner ne khud chuna (2026-11-21): pehli jaag pe saaf parda, jaagne tak app band, aur use ke dauraan server jaaga rahe taaki beech me 1 minute ka intezaar na aaye. Niyam 4 se 7 Claude ki salah, owner ne maani.
- **Chhode vikalp:** sirf parda, bina ping (15 minute khaali pe beech me phir parda); bundle me rakhi static jaankari (do jagah ki jaankari ka mel bigad sakta); bundle ki images ka lookbook (bundle bhaari).
- **Kab dobara khulega:** Render ki sharten badlein ya keep-alive pe chetavni aaye, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Owner (niyam 1 se 3); Salah maani (niyam 4 se 7).
- **Asar (Claude):** app ki ping se server asli use ke dauraan jaaga rehta hai, raat ko bhi agar koi app use kare; ghante D-322 ke hisaab me "upar se asli use" me aate hain, aur [OPERATIONS.md](OPERATIONS.md) §5 niyam 9 ka 525 ghante ka alert. Har khule tab se 10 minute me ek call, [ARCHITECTURE.md](ARCHITECTURE.md) §9 ki seema pe na ke barabar. R-044 me app ki ping bhi keep-alive maani ja sakti hai; niyam 6 se band.

### D-350. Icons: icones.js.org se apna package

- **Faisla:** icons ka source icones.js.org (Iconify ke open sets). Hamara apna icons package, jisme sirf istemaal hone wale icons copy hote hain (development me ek baar); runtime pe Iconify ki library ya API nahi. Niyam:
  1. **Sets ka kram:** mukhya set Solar (CC BY 4.0, linear style), taaki roop ek jaisa rahe; Solar me icon na ho to Lucide (ISC); dono me na ho to baaki sets, stroke ka wazan kareeb rakh ke.
  2. **Credits page:** har app me ek "Credits" page, sab apps me ek hi saajha page. Har package apna credit component deta hai (icons ka credits file se: har set ka naam, author, license aur link; aage charts, Ola Maps jaise doosre packages ke bhi). Har app apne page pe sirf un cheezon ke components jodta hai jo wo use karta hai. Link har app ke footer ya account menu me. Sirf khule licenses: CC BY 4.0, MIT, ISC, Apache-2.0 aur CC0; GPL, non-commercial (NC) ya bina license wale sets nahi.
  3. **Sign-in ke brand logos** (Google, LinkedIn, GitHub) CC0 sets se, sirf us sign-in ka naam batane ke liye; marks unki companies ke trademark rehte hain.
  4. **Package ka dhaancha:** har icon ki apni file, ek base component (`size`, `label`, `currentColor`), aur package bina side effects ke, taaki app me sirf wahi icons bundle hon jo wo use kare.
  5. **Naya icon jodne ka kram:** pehle set ka credit (credits file aur licenses file), phir set ka data (Iconify se, sirf development me), phir script se component. Script SVG ko code me badalti hai aur aisa kuch bhi mana karti hai jo code chala sake ya bahar jaaye (`<script>`, `<foreignObject>`, `on*` handlers, `style`, bahar ke links). Test har icon ka source, credit aur license ki line jaanchta hai.
  6. Beauty ke khaas icons (jaise lipstick, swatch, dropper) aur logo apne banaye, usi grid pe.
  7. Har set ka license CL-125 ki list me.
- **Wajah:** owner ne khud chuna (2026-11-21): icons icones.js.org se copy karke apna package, copy ki script aur test ke saath (niyam 4, 5). Sets ka kram aur ek saajha Credits page jisme har package ka apna credit component (niyam 1, 2) bhi owner ne khud chuna. Niyam 3, 6 aur 7 aur licenses ki seema Claude ki salah, owner ne maani.
- **Chhode vikalp:** runtime pe Iconify ki library ya API (bahar ki call, PWA offline me nahi); mukhya set Lucide (Claude ki pehli salah, credit page ki zaroorat nahi); Phosphor (weights ka chunaav har jagah).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Owner (source aur apna package, script aur test, sets ka kram, saajha Credits page aur credit components); Salah maani (niyam 3, 6, 7, licenses ki seema).
- **Asar (Claude):** [DESIGN.md](DESIGN.md) DS-7.1 isi se. Kanooni detail: icons aur brand marks ke license aur trademark, Lawyer ya CA se nahi jaancha.

### D-351. Location na mile to photo wali delivery

- **Faisla:** code na mile aur partner ke phone se location na mile, to bhi photo wali delivery ho sakti hai. Niyam:
  1. Delivery pe "No location" ka nishaan, aur aisi har delivery Support ki jaanch ki list me.
  2. Aisi delivery pe daawa aaye to D-072 niyam 3 ka "koi saboot nahi" jaisa maana jaata hai.
  3. Har partner ke liye mahine me tay seema (misaal 3); seema ke baad location ke bina photo wali delivery band: app "Turn on location" ka raasta dikhaye, na ho sake to "attempt fail" (D-108) ya Hub Manager se baat (D-301 jaisa).
- **Wajah:** Claude ki salah, owner ne maani: GPS kabhi-kabhi fail hota hai aur har baar parcel ka RTO (Return to Origin, [GLOSSARY.md](GLOSSARY.md)) customer ke liye nuksaan (saamaan nahi mila) aur hamare liye kharcha (wapas laana, jaanch, dobara stock); seema se galat istemaal ruka rehta hai aur D-072 niyam 4 ka record bhi banta hai.
- **Chhode vikalp:** location ke bina band (RTO aur fail koshishein badhti); bina seema ke ijazat (saboot kamzor, daawe pe nuksaan platform ka).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** D-072 niyam 2 me ye apvaad. Seema ka asli number aur setting ka maalik role operations ke saath.

### D-352. DESIGN batch 1: design ke siddhaant

- **Faisla:** 9 niyam (bharosa pehle, ek design system, kaam ke hisaab se device, server ka sach, koi dark pattern nahi, saaf halat, sabke liye, halka aur tez, demo saaf) [DESIGN.md](DESIGN.md) §1 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: har screen ka faisla inhi siddhaanton se, aur dark patterns ki rok (CL-070 se CL-073) design me hi.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (design ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-353. DESIGN batch 2: rang ke tokens aur light theme

- **Faisla:** 10 niyam (sirf apne tokens, 11 step ki palette, light ke semantic tokens ratios ke saath, text sirf text wale tokens me, hover gehra, ulti patti, rang akela matlab nahi, order status ke tone, charts, CI me contrast ki jaanch) [DESIGN.md](DESIGN.md) §2 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: D-340 ke rang ko asli tokens aur har jodi ke contrast me badalna, taaki koi screen AA se neeche na jaaye.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (design ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-354. DESIGN batch 3: dark theme aur high contrast

- **Faisla:** 7 niyam (theme ka chunaav, dark ke semantic tokens, dark me hover halka, dark me charts, images aur swatches kabhi invert nahi, high contrast 7:1, print hamesha light) [DESIGN.md](DESIGN.md) §3 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: D-342 ki dark theme ke tokens aur high contrast (Delivery ka Sunlight mode) ek saath tay hon.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (design ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-355. DESIGN batch 4: typography, spacing, radius, shadow, layers aur motion

- **Faisla:** 12 niyam (D-341 ke fonts, size scale, weights, ank, paisa aur tareekh en-IN me, order number aur codes, spacing, radius, shadows, layers, motion, reduced motion) [DESIGN.md](DESIGN.md) §4 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: saare apps ek hi scale pe, aur paisa, tareekh aur codes har jagah ek roop me.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (design ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-356. DESIGN batch 5: breakpoints, layout aur app parivaar

- **Faisla:** 10 niyam (breakpoints, shell ke size, media ratios, Customer app, partner dashboards, staff data-dense apps, Logistics Ops, Delivery PWA, app ki pehchaan, sign-in pe app ka host) [DESIGN.md](DESIGN.md) §5 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: 11 apps ke layout kaam ke hisaab se, aur nakli sign-in page pehchanna aasaan (R-017).
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (design ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-357. DESIGN batch 6: components aur screen ki halatein

- **Faisla:** 14 niyam (react-aria-components ki neev, bunyadi aur commerce components, loading, khaali halat, error ka map, rukawat ke sandesh, offline, jaagne ka parda, idle warning, forms, pakka karne wale dialog, optimistic UI ki seema, gol kone ke dibbe me scroll) [DESIGN.md](DESIGN.md) §6 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: har error aur halat ka ek roop har app me, ARCHITECTURE §5 aur SR-009 ke saath.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (design ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-358. DESIGN batch 7: icons, logo, images aur media

- **Faisla:** 9 niyam (apna icons package, icon ki accessibility, logo, product images, alt text data se, shade, private media, camera, video) [DESIGN.md](DESIGN.md) §7 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: images ka wazan aur private media ki suraksha (D-296, SR-005) design ka hissa bane.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (design ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-359. DESIGN batch 8: accessibility (WCAG 2.2 AA)

- **Faisla:** 12 niyam (lakshya aur automated jaanch, contrast, focus, keyboard, touch targets, dragging ka vikalp, screen reader, forms, kai kadam wale forms, madad ek jagah, zoom aur reflow, charts ki table) [DESIGN.md](DESIGN.md) §8 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: asli users me har tarah ke log; CAPTCHA nahi (D-206) to sign-in bhi sabke liye khula rahe.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (design ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-360. DESIGN batch 9: kanooni aur bharose ki jaankari UI me kahan

- **Faisla:** 27 rows (MRP aur daam, expiry, batch badla, pack ki jaankari, ingredients aur allergen, claims, seller, return, delivery fee aur vaada, Bestseller, stock, kram, demo aur DUMMY, legal pages, grievance, sign-up ke consent, consent wapas, push, review photo, payment fail, cancel, account delete, partner ka notice, seller agreement, R2 ki medical line) [DESIGN.md](DESIGN.md) §9 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: har tay jaankari ki UI me ek pakki jagah, taaki koi zaroori baat chhoot na jaaye. Kya dikhe wo apne faisle me tay hai; yahan sirf kahan.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (design ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-361. DESIGN batch 10: security aur performance ke UI niyam

- **Faisla:** 11 niyam (browser ki ijazatein, StepUpDialog, sign-in ke jawab, password, staff ki lists me chhupi jaankari, push aur emails ka text, user ka content, PWA cache, bundle ke budget, page ke targets, kam calls) [DESIGN.md](DESIGN.md) §10 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: security niyamon (SR-001 se SR-054) ka UI wala hissa aur ₹0 hosting pe tez pages (D-053).
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (design ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-362. FLOWS batch 1: account aur sign-in

- **Faisla:** 5 flows (FL-1 se FL-5: customer ka sign-up, customer ka sign-in, staff ka sign-in aur bada kaam, delivery partner ka sign-in, customer ka account delete) [FLOWS.md](FLOWS.md) §1 me. Misaal wale numbers settings me.
- **Wajah:** Claude ki salah, owner ne maani: sign-in ke saare raaste aur unke fail hone ke tareeke ek jagah, security niyamon (SR-011 se SR-026) ke saath.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (flows ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-363. FLOWS batch 2: browse se order aur payment

- **Faisla:** 3 flows (FL-6 se FL-8: area, pincode aur waitlist; cart se prepaid order; delivery pe UPI wala order) [FLOWS.md](FLOWS.md) §2 me. Misaal wale numbers settings me.
- **Wajah:** Claude ki salah, owner ne maani: order ka paisa aur stock kai modules se guzarta hai; har kadam aur har fail ka raasta tay ho, taaki paisa kata par order nahi bana jaisi halat sambhli rahe.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (flows ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-364. FLOWS batch 3: order se delivery

- **Faisla:** 2 flows (FL-9 pack se delivery tak, FL-10 delivery fail aur RTO) [FLOWS.md](FLOWS.md) §3 me. Misaal wale numbers settings me.
- **Wajah:** Claude ki salah, owner ne maani: pick, pack, hub, partner aur door ka saboot ek kram me, D-072 aur D-351 ke saath.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (flows ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-365. FLOWS batch 4: cancel, return, daawa aur refund

- **Faisla:** 4 flows (FL-11 se FL-14: cancel, return se refund, parcel nahi mila ka daawa, appeal) [FLOWS.md](FLOWS.md) §4 me. Misaal wale numbers settings me.
- **Wajah:** Claude ki salah, owner ne maani: customer ke paise wapas aane ke saare raaste aur unki seemaayein ek jagah.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (flows ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-366. FLOWS batch 5: seller: onboarding, listing, maal aur payout

- **Faisla:** 4 flows (FL-15 se FL-18: seller onboarding, listing se live, maal warehouse me, payout) [FLOWS.md](FLOWS.md) §5 me. Misaal wale numbers settings me.
- **Wajah:** Claude ki salah, owner ne maani: seller ke judne se paisa milne tak ka poora raasta, jaanch aur manzoori ke saath.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (flows ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-367. FLOWS batch 6: reviews

- **Faisla:** 2 flows (FL-19 review likhna, FL-20 review ki report) [FLOWS.md](FLOWS.md) §6 me. Misaal wale numbers settings me.
- **Wajah:** Claude ki salah, owner ne maani: reviews ka haq, moderation aur report ke samay ek jagah.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (flows ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-368. UX / Product Architect ke risks

- **Faisla:** 9 naye risks [RISKS.md](RISKS.md) me: R-055 (server jaagne ka parda), R-056 (rose button ka contrast AA ke paas), R-057 (visual tests ka bojh), R-058 (polling ka bhaar), R-059 (lamba product page), R-060 (idle logout me form khona), R-061 (Delivery ka offline data mitna), R-062 (iPhone pe push), R-063 (warehouse ka network ruka to scan band). Sab bachav ke saath `Khula`.
- **Wajah:** Claude ki salah, owner ne maani: har ek ka bachav [DESIGN.md](DESIGN.md) ya docs me likha hai, par ₹0 aur ek insaan ke kaam me khatra bacha hai.
- **Chhode vikalp:** kuch `Maana` (owner ne koi nahi chuna); risks rokna (khatre chhupe rehte).
- **Kab dobara khulega:** asli naap ya jaanch ke nateeje aayein, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-369. Seller ka payable aur lambi return muddat

- **Faisla:** D-081 niyam 1 ki "sabse lambi return samay-seema" ka matlab man badle wali muddat (D-221 niyam 4, misaal 7 din). Us muddat ke baad line payable hoti hai (agar koi return khula na ho). Kharab maal, nakli ka shak ya galat item ki lambi muddat (D-221 niyam 2, misaal 30 din) me payable ke baad aayi return ka paisa seller pe D-071 ke udhaar ke raaste.
- **Wajah:** Claude ki salah, owner ne maani: aisi returns kam hoti hain, brand ka paisa 30 din nahi rukta, aur payable ke baad ulti ka raasta D-081 ke asar me pehle se D-071 ka udhaar hai, jiski seemaayein (D-071, D-103) khatra rokti hain.
- **Chhode vikalp:** 30 din (sabse lambi muddat) tak har line rokna (chhote brand ka paisa lamba ruka); 7 din ke baad payable par har line ka ek hissa (misaal 10%) 30 din tak rokna (hisaab ka naya bojh).
- **Kab dobara khulega:** asli business pe ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** D-081 me jod; [FLOWS.md](FLOWS.md) FL-18 step 1 me ye muddat. Hamari galti wali return ka nuksaan seller pe nahi (D-063). Kanooni detail: Lawyer ya CA se nahi jaancha.

### D-370. UX ke chhote sudhaar

- **Faisla:** 2 jod: (1) D-072 me: niyam 2 me location na mile to D-351 ka apvaad, aur niyam 3 ka "refund ya dobara maal" R1 me sirf refund (D-122). (2) SR-055 me: address ka pin D-347 se; pin na ho to doori ka check "No pin" nishaan ke saath; location na mile to D-351.
- **Wajah:** Claude ki salah, owner ne maani: inke bina D-072 aur SR-055 padhne wala R1 me galat samajh sakta hai.
- **Chhode vikalp:** koi jod nahi (niyam aapas me bina link ke rehte).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-371. Coverage ka gate

- **Faisla:** kernel packages (saajhe bunyadi packages, jaise paisa aur tax ka hisaab, authorization ke checks, transactions, outbox, idempotency) aur paisa, stock aur permissions ke code me coverage ki seema se neeche PR merge nahi hota. Baaki areas me PR pe sirf report, aur release se pehle jaanch. Seema ke number testing ke niyamon ke saath tay honge (misaal: kernel 90% branch, paisa, stock aur permissions 85% branch, baaki 70% lines).
- **Wajah:** Claude ki salah, owner ne maani: jahan galti sabse mehngi wahan pakka pehra, aur ek insaan ke kaam me (D-009) baaki jagah rukawat nahi.
- **Chhode vikalp:** har area me PR rokna (UI ke chhote badlav pe bhi bina zaroorat tests); kahin na rokna (coverage chupke girta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** kernel packages ki poori list naye docs me abhi nahi; wo testing ke niyamon ki batch me aayegi. Coverage sirf batata hai ki line chali; test ki asli taakat mutation testing (D-372) se jaanchi jaati hai.

### D-372. Mutation testing ka gate

- **Faisla:** CI me PR pe ek alag job: sirf badli lines, sirf kernel packages aur paisa, stock aur permissions ke code me. Bacha mutant (jise kisi test ne na pakda) PR ka check laal karta hai, jab tak uski wajah package ke saath likhi na ho (jaise "equivalent": badla code bhi wahi kaam karta hai). Kernel packages ka pehla poora run laptop pe background me, copy me, asli files me nahi (CLAUDE.md). Baaki apps aur modules me mutation nahi.
- **Wajah:** Claude ki salah, owner ne maani: pehra apne aap chalta hai aur bhoolne ka mauka nahi; CI ka checkout asli files se alag copy hai.
- **Chhode vikalp:** sirf laptop pe, kaam ke "done" ka hissa (bojh aur bhoolne ka mauka); sirf release se pehle (kamzor test der se pakde jaate).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** tool aur badli lines nikaalne ka tareeka testing ke niyamon ki batch me. Is job se CI ke minutes badhte hain; CI ki seema ki jaanch baaki.

### D-373. Flaky tests

- **Faisla:** sirf E2E (browser) tests pe ek retry. Retry se pass ho tab bhi summary me "flaky" dikhta hai aur uska issue banta hai. Unit aur integration tests, aur paisa, stock, permissions, idempotency aur events ke tests pe kabhi retry nahi; unka flaky hona bug maana jaata hai.
- **Wajah:** Claude ki salah, owner ne maani: browser ki chhoti hichki se kaam nahi rukta, aur jahan race asli galti ho sakti hai wahan koi chhoot nahi.
- **Chhode vikalp:** koi retry nahi (chhoti hichki pe kaam rukta); har test pe 2 retry (race aur timing ke bug chhupte).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-374. Doosre browsers pe E2E

- **Faisla:** nightly me WebKit (Safari ka engine) pe Customer app ke mukhya flows: sign-up (FL-1), sign-in (FL-2), prepaid order (FL-7), cancel (FL-11), return se refund (FL-12) aur review (FL-19). PR pe E2E Chromium pe hi ([OPERATIONS.md](OPERATIONS.md) §2 niyam 6). Firefox pe E2E nahi.
- **Wajah:** Claude ki salah, owner ne maani: iPhone wale customers ka raasta har raat jaancha jaata hai, nightly chhota rehta hai, aur staff apps desktop Chromium pe hi chalte hain.
- **Chhode vikalp:** nightly me WebKit aur Firefox, saare flows (nightly lamba); sirf release se pehle laptop pe WebKit (dikkat der se); sirf Chromium (Safari ki dikkat live pe).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** Linux ka WebKit asli iPhone ka Safari nahi; asli iPhone ki jaanch D-375 me.

### D-375. Asli phone pe testing

- **Faisla:**
  1. Har release se pehle owner ke Android phone pe: Delivery app ke ek din ka kaam (pack se delivery FL-9, delivery fail aur RTO FL-10, return pickup) aur Customer app ka checkout.
  2. R1 se pehle ek baar iPhone (apna ya udhaar) pe: Customer app ka checkout, home screen pe install aur push.
  3. iPhone na mile to R-062 khula rehta hai, aur ye R1 ke release note me likha jaata hai.
  4. Har round ka record D-377 jaisa.
- **Wajah:** Claude ki salah, owner ne maani: camera, location, offline data (R-061), dhoop me padhna aur payment ke baad app me wapsi asli phone pe hi pakke hote hain, aur iPhone pe push aur install ek baar dekhe bina R-062 khula rehta.
- **Chhode vikalp:** sirf R1 se pehle ek baar Android pe (baad ke releases ki phone wali dikkat live pe); asli phone nahi.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** har release pe lagbhag ek ghanta. Phone pe camera aur location ke liye page secure context (HTTPS) pe chahiye; laptop ka app phone pe kaise khule, ye testing ke niyamon ki batch me (jaanch baaki).

### D-376. Screen reader ki jaanch

- **Faisla:** har release se pehle [DESIGN.md](DESIGN.md) DS-8.1 ki screen reader checklist NVDA (Windows laptop pe) pe desktop apps me, aur TalkBack (Android) pe Customer aur Delivery apps me. R1 se pehle ek baar VoiceOver (iPhone) pe Customer app, D-375 ke iPhone wale round me. iPhone na mile to VoiceOver wala hissa bhi R1 ke release note me khula likha jaata hai.
- **Wajah:** Claude ki salah, owner ne maani: customers aur delivery partners phone pe hain, aur iPhone ka round pehle se tay hai.
- **Chhode vikalp:** sirf NVDA aur TalkBack (iPhone pe padhne ki dikkat chhoot-ti); sirf NVDA (phone ki dikkatein chhoot-ti).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** DS-8.1 me screen readers ke naam jode gaye (D-397).

### D-377. Khoj wala (haath ka) testing

- **Faisla:**
  1. Har release pe owner misaal 2 ghante, badle flows pe chhote round (ek flow, ek lakshya, misaal 30 minute).
  2. R1 se pehle allowlist (D-133) ke 1 ya 2 bharose ke testers ka ek round.
  3. Har haath ke check ka chhota record: kya, kis device aur browser pe, kisne, kab, nateeja.
  4. "Verified" sirf isi record ya live smoke check se likha jaata hai (CLAUDE.md ka imaandari niyam); sirf test pass hona "verified" nahi.
- **Wajah:** Claude ki salah, owner ne maani: har release pe chhota aur seemit samay, aur R1 se pehle nayi aankhon se ek round, kyunki banane wala apni galtiyan kam dekhta hai.
- **Chhode vikalp:** sirf R1 se pehle ek bada round (baad ke badlav bina khoj ke); koi khoj wala testing nahi.
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** record kahan rahe, ye testing ke niyamon ki batch me. Testers ke emails live pe personal data hain, privacy ke niyamon ([COMPLIANCE.md](COMPLIANCE.md) §5) ke andar. Kanooni detail: Lawyer ya CA se nahi jaancha.

### D-378. Bug ki gambhirta aur release

- **Faisla:** bug ki gambhirta ka paimana: **P0** paisa galat, data leak, security bypass ya data khona; **P1** koi flow ruka aur doosra raasta nahi; **P2** flow doosre raaste se chalta hai, ya paise ke bina koi galat jaankari; **P3** sirf dikhawat. Khula P0 ya P1 release rokta hai; P2 release note me likh ke release chalta hai.
- **Wajah:** Claude ki salah, owner ne maani: paisa, data aur koi bhi ruka hua flow live nahi jaata, aur chhoti galti release nahi rokti.
- **Chhode vikalp:** sirf P0 roke (toota flow live); P0, P1 aur P2 sab rokein (chhoti galtiyon pe release der se).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 ke release gate ki baaki sharten testing ke niyamon ki batch me.

### D-379. Load test kitni baar

- **Faisla:** design ke target ([ARCHITECTURE.md](ARCHITECTURE.md) §9, D-283) pe load test R1 se pehle ek baar. Phir sirf us release me jo order place, pack, delivery scan ya payout ka raasta badle, ya nayi service jode.
- **Wajah:** Claude ki salah, owner ne maani: bina badlav ke dobara chalane se kuch naya nahi milta, aur load wale raaste badalte hi test dobara.
- **Chhode vikalp:** har release se pehle (har baar ghante); sirf R1 se pehle (baad ke badlav ka asar anjaana).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** laptop ke containers live ki free tier seemaayein (jaise Atlas M0 ki operations ki seema) poori nahi dikhate, to load test akela saboot nahi; har flow ke database operations ki ginti ka budget testing ke niyamon ki batch me.

### D-380. Live smoke order

- **Faisla:** release ke baad live smoke check ([OPERATIONS.md](OPERATIONS.md) §3 niyam 9) ka test-mode order:
  1. Payment ke baad, pack se pehle, turant cancel.
  2. Order pe "smoke" ka nishaan, jo use bikri, Bestseller (D-154), search ke kram (D-139) aur owner ke aankdon (D-149) ki ginti se bahar rakhta hai.
  3. Nishaan sirf setting se tay ek allowlist account ke orders pe lagta hai; koi customer khud nahi laga sakta.
  4. Finance ki entries aur audit me order waisa hi rehta hai: kuch mitta nahi, sirf ginti aur aankdon se bahar.
- **Wajah:** Claude ki salah, owner ne maani: har release pe ek jhootha order customer ko dikhne wale aankde na bigaade, aur paise ka record poora rahe.
- **Chhode vikalp:** turant cancel par baaki orders jaisa gina jaaye (aankdon me thoda jhooth); poora delivery tak chalana (har release pe ghante).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** smoke order ke emails D-028 ki din ki chhat me gine jaate hain. OPERATIONS §3 niyam 9 me iska link jod diya (D-397). Nishaan ka field data ke niyamon ([ARCHITECTURE.md](ARCHITECTURE.md) §10.5) ke saath.

### D-381. QA batch 1: siddhaant, levels aur kab kya chalta hai

- **Faisla:** testing ke 6 siddhaant, test levels aur "kab kya chalta hai" ki tables, ₹0 CI me fit ke 5 niyam, contract tests ke 3 niyam aur RT-1 se RT-8 [RULES.md](RULES.md) §4.1 me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: har PR pe kya chalta hai pehle code se tay rahe, aur galti PR pe hi pakdi jaaye.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (testing ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-382. QA batch 2: test data, fakes aur ghadi

- **Faisla:** test data aur seeds ke 6 niyam, bahar ki 9 services ke fakes ki table, ghadi ke 5 niyam aur RT-9 se RT-16 [RULES.md](RULES.md) §4.2 me.
- **Wajah:** Claude ki salah, owner ne maani: repo public hai, aur tests kabhi asli provider, asli paisa, asli inbox ya asli npm registry tak nahi pahunchne chahiye.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (testing ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-383. QA batch 3: paisa, stock aur permissions ke tests

- **Faisla:** integration ki gehrai ke 5 niyam aur RT-17 se RT-20 [RULES.md](RULES.md) §4.3 me.
- **Wajah:** Claude ki salah, owner ne maani: paisa, stock aur permissions ki galti sabse mehngi hai, asli users ek saath aate hain, aur free cluster ki operations ki seema container me nahi dikhti.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (testing ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-384. QA batch 4: mutation, coverage, flaky aur ginti

- **Faisla:** RT-21 se RT-26 [RULES.md](RULES.md) §4.4 me, kernel packages ki list ke saath; D-371, D-372 aur D-373 inhi niyamon se laagu.
- **Wajah:** Claude ki salah, owner ne maani: kernel packages ki list, seema ke number aur ginti ke tareeke ke bina D-371 se D-373 adhoore the.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (D-371 se D-373 adhoore).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** mutation tool (StrykerJS) ki line ranges aur sandbox ki baatein jaanchna baaki.

### D-385. QA batch 5: E2E, accessibility, visual aur performance

- **Faisla:** 20 flows ki E2E table aur "poora R1" spec, accessibility aur visual ke 5 niyam, performance ki table, haath ki jaanch aur RT-27 se RT-33 [RULES.md](RULES.md) §4.5 me. D-342 ke "Asar" me sudhaar: screenshot tests sirf mukhya screens pe (R-057), aur har screen ka contrast aur accessibility axe se dono themes me.
- **Wajah:** Claude ki salah, owner ne maani: flows hi product hain, aur WCAG 2.2 AA aur performance ke targets ka pakka saboot yahi tests hain.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (testing ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** server ke p95 ki CPU seema (RT-31) pehle naap ke saath likhi jayegi.

### D-386. QA batch 6: security, migrations, backup aur bugs

- **Faisla:** SR niyamon ke tests ki table, migration aur rollback ke 6 niyam, backup ke 3 niyam, COMPLIANCE rows ke automated checks ki table aur RT-34 se RT-42 [RULES.md](RULES.md) §4.6 me.
- **Wajah:** Claude ki salah, owner ne maani: bahar ki security jaanch nahi hai to tests hi pehra hain, aur deploy, migration aur restore ki galti sabse mushkil ghadi me dikhti hai.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (testing ka ye hissa baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** RT-39 (security bug ki detail private) RULES ke "Security aur privacy" section me bhi aayega jab wo bane. COMPLIANCE ke checks sirf "system me hai ya nahi" jaanchte hain, kanooni raay nahi.

### D-387. QA batch 7: Definition of Done aur R1 ka release gate

- **Faisla:** Definition of Done ke 12 hisse (DD-1 se DD-12) [RULES.md](RULES.md) §1 me, aur R1 ke release gate ki 14 sharten (RG-1 se RG-14) RULES §2.1 me.
- **Wajah:** Claude ki salah, owner ne maani: "ho gaya" aur "release ho sakta hai" dono ka saaf paimana chahiye, warna D-019 ka "bana hai" aur CLAUDE.md ka "verified" andaaze pe rehte.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna ("done" aur release ka paimana baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** planning stage me `TASK.md` ka template DD-1 se DD-12 se banega ([tasks/README.md](tasks/README.md)).

### D-388. Acceptance criteria ki jagah

- **Faisla:** R1 ke acceptance criteria naye doc [ACCEPTANCE.md](ACCEPTANCE.md) me hamesha ke liye. Planning stage me har module ki `TASK.md` apne hisse ki link deti hai, criteria copy nahi karti. Id `AC-<MODULE>-<n>` kabhi nahi badalta.
- **Wajah:** Claude ki salah, owner ne maani: `TASK.md` abhi nahi ban sakti (D-004), har baat ek jagah rahe, aur requirement ki ginti ki script ([RULES.md](RULES.md) RT-24) ek hi file padhe.
- **Chhode vikalp:** ACCEPTANCE.md sirf planning tak, phir criteria `TASK.md` me (184 criteria ka move aur links badalna); PROJECT_PLAN me ek hissa (PROJECT_PLAN bhaari).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** [README.md](README.md) me nayi file ki line; [tasks/README.md](tasks/README.md) me `TASK.md` ka "acceptance criteria" ab ACCEPTANCE ki link; RULES RT-24 me ACCEPTANCE.

### D-389. QA batch 8: PLATFORM, GATEWAY, AUDIT aur LOGS ke criteria

- **Faisla:** 32 criteria [ACCEPTANCE.md](ACCEPTANCE.md) §1.1 (PLATFORM), §1.2 (GATEWAY), §1.11 (AUDIT) aur §1.13 (LOGS) me. Misaal wale numbers settings ya code me badal sakte hain.
- **Wajah:** Claude ki salah, owner ne maani: baaki saari services inhi saajhe hisson pe tiki hain.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (in modules ka "done" ka paimana baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-390. QA batch 9: IDENTITY, NOTIFY aur MEDIA ke criteria

- **Faisla:** 27 criteria [ACCEPTANCE.md](ACCEPTANCE.md) §1.3 (IDENTITY), §1.4 (NOTIFY) aur §1.12 (MEDIA) me.
- **Wajah:** Claude ki salah, owner ne maani: sign-in, khabrein aur files personal data aur security ke sabse bade darwaze hain.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (in modules ka "done" ka paimana baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-391. QA batch 10: CATALOG aur COMMERCE ke criteria

- **Faisla:** 24 criteria [ACCEPTANCE.md](ACCEPTANCE.md) §1.6 (CATALOG) aur §1.7 (COMMERCE) me.
- **Wajah:** Claude ki salah, owner ne maani: stock aur daam ki galti seedhe customer aur seller ke paise pe padti hai.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (in modules ka "done" ka paimana baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** AC-CATALOG-10 ke tests dono search adapters pe ([ARCHITECTURE.md](ARCHITECTURE.md) §6 niyam 7); Atlas Search wala hissa laptop aur CI pe tabhi jab MongoDB ka local Atlas image chale (jaanchna baaki).

### D-392. QA batch 11: PAYMENTS aur FINANCE ke criteria

- **Faisla:** 22 criteria [ACCEPTANCE.md](ACCEPTANCE.md) §1.5 (PAYMENTS) aur §1.9 (FINANCE) me.
- **Wajah:** Claude ki salah, owner ne maani: paise ki har galti P0 hai (D-378), aur books ke niyam (D-282) tests se hi pakke hote hain.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (paise ke modules ka "done" ka paimana baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-393. QA batch 12: LOGISTICS aur SUPPORT ke criteria

- **Faisla:** 20 criteria [ACCEPTANCE.md](ACCEPTANCE.md) §1.8 (LOGISTICS) aur §1.10 (SUPPORT) me.
- **Wajah:** Claude ki salah, owner ne maani: delivery aur daawe dono taraf ke dhokhe ka raasta hain (D-072), aur inka saboot inhi niyamon se banta hai.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (in modules ka "done" ka paimana baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-394. QA batch 13: Customer, Seller aur Delivery apps ke criteria

- **Faisla:** 26 criteria [ACCEPTANCE.md](ACCEPTANCE.md) §2.1 (Customer), §2.2 (Seller) aur §2.9 (Delivery) me.
- **Wajah:** Claude ki salah, owner ne maani: ye teen apps bahar ke users ke hain, aur unka bharosa inhi screens pe banta hai.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (in apps ka "done" ka paimana baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** Delivery app ke offline, camera aur location wale criteria ka pakka saboot asli phone pe (D-375).

### D-395. QA batch 14: staff apps ke criteria

- **Faisla:** 33 criteria [ACCEPTANCE.md](ACCEPTANCE.md) §2.3 se §2.8 (Admin, Super Admin, Master, Support Desk, Finance, Logistics Ops) me.
- **Wajah:** Claude ki salah, owner ne maani: staff ke haath me paisa, manzoori aur personal data hain, aur "do haath" aur audit ke niyam inhi screens pe dikhte hain.
- **Chhode vikalp:** badlav ke saath maanna (owner ne koi badlav nahi diya); batch rokna (staff apps ka "done" ka paimana baaki).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-396. QA Architect ke risks

- **Faisla:** 12 naye risks [RISKS.md](RISKS.md) me: R-065 (fakes asli providers se alag), R-066 (containers aur free clusters ka farak), R-067 (lamba CI), R-068 (E2E me timing se flaky), R-069 (samay wale niyamon me galti), R-070 (laptop pe mutation aur load ka bojh), R-071 (screenshots ki baseline), R-072 (fixtures ya artifacts me personal data), R-073 (ek hi insaan tester), R-074 (code aur test ek hi haath se), R-075 (smoke check ka free tier pe kharcha), R-076 (single-member replica set). Sab bachav ke saath `Khula`.
- **Wajah:** Claude ki salah, owner ne maani: har ek ka bachav [RULES.md](RULES.md) §4 ya D-371 se D-380 me likha hai, par tests green hone ke baad bhi khatra bacha hai.
- **Chhode vikalp:** kuch `Maana` (owner ne koi nahi chuna); risks rokna (khatre chhupe rehte).
- **Kab dobara khulega:** asli naap ya jaanch ke nateeje aayein, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-397. QA ke chhote sudhaar

- **Faisla:** 5 sudhaar:
  1. [RULES.md](RULES.md) RT-31: server ke p95 ka pass ya fail [OPERATIONS.md](OPERATIONS.md) §10 niyam 1 ki live jaisi CPU seema (misaal `--cpus=0.1`) pe; 0.5 wala naap sirf tulna ke liye.
  2. RULES §4.6 me SR-019 ka niyam: CI me sirf body ki barabari aur kam se kam samay; samay ke farak ka naap laptop pe kai baar, ek seema ke saath (misaal).
  3. RULES RT-19: har flow ke database operations ka budget us module ki planning (`TASK.md`) me tay.
  4. OPERATIONS §2 niyam 6 me nightly WebKit (D-374) aur RULES ki link; §3 niyam 9 me smoke order (D-380).
  5. [DESIGN.md](DESIGN.md) DS-8.1 me screen readers ke naam (D-376).
- **Wajah:** Claude ki salah, owner ne maani: CPU seema ke bina p95 ka "pass" tay nahi tha, samay ka chhota farak CI me pakka nahi naapa ja sakta, aur D-374, D-376 aur D-380 ke niyam unhi docs me dikhne chahiye jinhe log padhte hain.
- **Chhode vikalp:** kuch hi sudhaar (owner ne koi nahi chuna); koi sudhaar nahi (niyam aapas me bina link ke).
- **Kab dobara khulega:** owner khud khole, ya 0.1 CPU ke pehle naap ke baad.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** 0.1 CPU pe password hashing aur PDF jaise kaam p95 targets se upar ja sakte hain; pehle naap ke baad [ARCHITECTURE.md](ARCHITECTURE.md) §9 ke targets dobara dekhne padenge.

### D-398. QA ke lene layak niyam

- **Faisla:** pehle ke kaam se lene layak (D-074) 5 testing niyam [RULES.md](RULES.md) ke naye §4.7 me: RT-43 (collection scan ki chhoot sirf likhi wajah se), RT-44 (ids ka pehra), RT-45 (CI ki config ka apna test), RT-46 (release ka test report), RT-47 (4 regression tests: Valkey ruka par juda, API calls pe timeout, 5xx raw text me nahi, E2E ki safai backend band hone ke baad bhi).
- **Wajah:** Claude ki salah, owner ne maani: ye pehre aur galtiyan pehle asli me kaam aaye ya ho chuke hain; QA ki baaki lene layak cheezein RULES §4.1 se §4.6 aur ACCEPTANCE me pehle hi aa chuki hain.
- **Chhode vikalp:** kuch hi niyam (owner ne koi nahi chuna); koi nahi (jani-pehchani galtiyan dobara aa sakti).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.

### D-399. Kanooni rok aur band FY ki file ki chaabi

- **Faisla:** kanooni rok me rakha data (D-250), rok wali photos aur video (D-262) aur band FY ki export file (D-309) ke liye server pe sirf band karne wali (public) chaabi. Kholne wali (private) chaabi password manager me aur ek doosri offline copy me; kholna sirf owner ke laptop ke break-glass command se.
- **Wajah:** Claude ki salah, owner ne maani: ye data roz kabhi nahi khulta, to server ko kholne ki zaroorat nahi; server ki chaabiyon ke leak pe bhi band data band rehta hai.
- **Chhode vikalp:** abhi jaisa, har service ki `hold` key live env me (server ke ek leak pe sab khula); sirf band FY ki file ke liye offline chaabi (beech ka raasta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** [ARCHITECTURE.md](ARCHITECTURE.md) §10.3 niyam 4 aur D-309 ka roop, aur security niyam, security ki batches me badlenge. Chaabi kho jaaye to band data aur purane FY ki books hamesha ke liye band: do offline copies aur saal me ek baar kholne ka abhyaas zaroori (risk security ki risks wali batch me). Kanooni detail: Lawyer (AI) ne nahi jaancha: kanooni maang pe data dene ka samay, aur laptop wala raasta us samay me chalega ya nahi.

### D-400. Audit aur logs ke dhaanche ka badlav

- **Faisla:** audit aur logs ke clusters me indexes, TTL aur validators ka badlav sirf owner ke laptop ke release command se, alag credentials se. Boot pe in dono me sirf dhaanche ke fingerprint ki jaanch: na mile to alert, badlav nahi. Baaki services ka release step boot pe hi (ARCHITECTURE §10.4). Saath me audit chain ka hash bahar bhi likha jaata hai.
- **Wajah:** Claude ki salah, owner ne maani: live env me release user ke rehte audit ya logs ka TTL chhota karke sab mitaya ja sakta hai, "sirf insert" wale user (D-317) ke bawajood; audit aur logs ka dhaancha kam badalta hai, to haath ka kadam kabhi-kabhi hi.
- **Chhode vikalp:** abhi jaisa, boot pe release user live env me aur sirf hash bahar (mitana pakda jaata, rukta nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** [ARCHITECTURE.md](ARCHITECTURE.md) §10.4 niyam 5, OPERATIONS ka release ka kram aur security niyam security ki batches me badlenge. Audit ya logs ke dhaanche wale release me owner ka ek haath ka kadam; bhoolne pe alert aane tak purana dhaancha.

### D-401. Raat ke alerts ki push subscription

- **Faisla:** Master app me owner ke alerts ki browser push subscription device ke saath, session ke saath nahi. Wo tab tak rehti hai jab tak owner "is device pe alerts band" na kare, device na hataye ya account band na ho. Payload me koi detail nahi. Subscription khatam ho to gambhir email, aur roz ek test push. Baaki khabron ki subscription SR-074 jaisi, session ke saath.
- **Wajah:** Claude ki salah, owner ne maani: gambhirta 1 ke alerts raat me bhi push se aate hain (D-324), aur session ke saath bandhi subscription 12 ghante (D-181) ke baad chupchaap band ho jaati.
- **Chhode vikalp:** session ke saath (raat ke alert ka bharosa nahi).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** SR-074 me apvaad aur OPERATIONS ke alerts security ki batches me. Band session wale device pe bhi "alert hai" ki khabar (bina detail) dikhti hai; device chori ho to devices ki list se hatana padta hai.

### D-402. Request logs kaun padhe

- **Faisla:** logs service ke request logs sirf owner Master app me padhe: `logs.read` permission, dobara code aur wajah ke saath, samay-khidki ya request id se khoj, har padhna audit me. Bulk export nahi.
- **Wajah:** Claude ki salah, owner ne maani: incident me tez jaanch, aur har padhne ka record; logs me har user ka IP aur kaam ka samay hai, to padhna kam se kam logon tak.
- **Chhode vikalp:** sirf laptop ka command (har jaanch dheemi); owner ke saath Support Lead bhi apne maamle ke request id se (zyada log, zyada jokhim).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** `logs.read` permission roles ki list me sirf owner ke paas; Master app me ek screen. Kanooni detail: Lawyer (AI) ne nahi jaancha: logs me IP ka personal data hona, aur CERT-In ya kanooni maang pe logs dene ka samay.

### D-403. Security bug ka private record

- **Faisla:** security bug aur scan ki findings ki detail, fix live hone tak, GitHub ki private security advisory (draft) me, agar public repo pe ye muft chale. Na chale to ek alag private GitHub repo me. Issue, PR ya commit me detail kabhi nahi ([RULES.md](RULES.md) RT-39).
- **Wajah:** Claude ki salah, owner ne maani: advisory code ke paas hai aur sirf admin ko dikhti hai; alag private repo muft aur saaf raasta hai.
- **Chhode vikalp:** password manager ke secure notes (dhoondhna mushkil); laptop ki git-ignored file (laptop kho jaaye to record gaya, doosre account se nahi dikhta).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** kaunsa raasta chalega, ye [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 ki "GitHub ki private security advisory" wali jaanch pe tika (muft hai ya nahi, aur private fork me CI chalti hai ya nahi). R-054 ka bachav security ki risks wali batch me.

### D-404. Record wale security niyamon ka saboot

- **Faisla:** jin security niyamon ka saboot test nahi, record hai (jaise providers pe MFA, live headers, restore ka abhyaas), unki table [OPERATIONS.md](OPERATIONS.md) ke naye hisse "Security ke record" me: public table me sirf `Pass` ya `Baaki`, tareekh aur release. Kami ki detail sirf private record (D-403) me. Release ke test report me us table ki link.
- **Wajah:** Claude ki salah, owner ne maani: release gate ([RULES.md](RULES.md) RG-2) aur niyamon ki ginti ki script record ko tabhi gin sakti hai jab wo repo me ek tay jagah ho.
- **Chhode vikalp:** har release ke test report (PR ke description) me (script ko PR padhne padte); laptop ki git-ignored file (doosra account aur CI nahi dekh paate).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** OPERATIONS ka naya hissa aur table ke columns security ki batches ke saath. Public ko dikhta hai ki kaunse check hue, detail nahi.

### D-405. Testers ki allowlist aur `+` alias

- **Faisla:** testers ki allowlist entry (D-133) sirf usi exact email se mel khaye, `+` alias se nahi. Tester ko doosra account chahiye to owner doosra email jode. Owner ke apne emails pe alias pehle jaisa chalta hai.
- **Wajah:** Claude ki salah, owner ne maani: alias chale to ek tester kai customer accounts bana sakta, aur uske inbox pe aliases se codes ki baadh ho sakti.
- **Chhode vikalp:** alias bhi (baadh ka raasta); har entry pe owner chune (ek aur setting).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** email ko milaane ka niyam (alias aur normalization) security niyam me security ki batches me. Tester ke har naye account ke liye owner ka chhota kaam.

### D-406. Kam jaankari wale requests ki log line

- **Faisla:** Render ke host pe aaye rejected requests (bina secret ke `/api`, jinka jawab 403) aur `/wake` ki pings: aam din har request ki log line. Ek IP se seema (misaal 100 requests/minute) ke upar sirf ginti: pehla aur aakhri samay, ginti aur route.
- **Wajah:** Claude ki salah, owner ne maani: Render ka host sabke liye khula hai, aur sasti requests ki baadh logs ki 0.5 GB jagah kha sakti hai; aam din poora record bhi rehta hai.
- **Chhode vikalp:** hamesha har request ki line (baadh pe logs ki jagah khatam); in dono qism ki hamesha sirf ginti (sabse kam detail).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** asli seema ka number aur bandwidth ka bachav security ki batches me. Baadh ke dauraan har request alag nahi dikhti. Kanooni detail: Lawyer (AI) ne nahi jaancha: CERT-In ke logs ke niyam me ginti wala record chalta hai ya har request ki line chahiye.

### D-407. Payment screen ka alag document

- **Faisla:** Customer app me Payment screen ek alag HTML document. Payment gateway ki checkout script aur uske hosts wali CSP sirf us document me; baaki app (SPA, D-290) me gateway ki koi script nahi. Checkout ka roop (D-345) waisa hi; Payment pe sirf order ka id jaata hai.
- **Wajah:** Claude ki salah, owner ne maani: browser ki CSP poore document ki hoti hai, route ki nahi, to SPA me SR-006 tabhi poora hota hai jab Payment alag document ho; bahar ki script (R-016) sirf ek chhote document tak.
- **Chhode vikalp:** gateway ka hosted payment page (customer app se bahar, test mode me raasta jaanchna baaki); poore Customer app ki CSP me gateway ke hosts (bahar ki script ka asar poore app pe).
- **Kab dobara khulega:** owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** SR-006, [DESIGN.md](DESIGN.md) DS-10.9 aur [ACCEPTANCE.md](ACCEPTANCE.md) AC-CUSTOMER-6 me badlav security ki batches me. Payment pe aate-jaate ek poora page load.

### D-408. Security review batch 1: edge aur hosting

- **Faisla:** Security Architect ke doosre run ke edge aur hosting wale hisse docs me:
  1. Naye niyam SR-089 (`/wake` ka chhota apvaad), SR-090 (Payment ka alag HTML document, D-407) aur SR-105 (Render ke public host pe sabse chhota jawab, bandwidth ki raftaar pe alert, baadh me sirf ginti, D-406) ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)).
  2. SR-005 aur SR-006 me badlav (CSP har document ki apni, `connect-src` me sirf `/wake`, inline script sirf hash se, live headers ki jaanch; gateway ki script sirf Payment ke document pe).
  3. [security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.1 me 4 naye threats aur DAST ki line.
  4. [RULES.md](RULES.md) RT-14 aur RT-36, [OPERATIONS.md](OPERATIONS.md) §3 niyam 9, [ARCHITECTURE.md](ARCHITECTURE.md) §5 niyam 14 aur 15, [DESIGN.md](DESIGN.md) DS-10.9, [FLOWS.md](FLOWS.md) FL-7, [ACCEPTANCE.md](ACCEPTANCE.md) AC-CUSTOMER-6 aur naya AC-GATEWAY-10 (kul 185), aur [RISKS.md](RISKS.md) R-016 ka bachav.
- **Wajah:** Claude ki salah, owner ne maani: SPA me CSP poore document ki hoti hai, `/wake` aur Render ka host sabke liye khule hain, aur laptop ke tests Vercel ki asli config nahi chalate.
- **Chhode vikalp:** kuch hi hisse (owner ne koi nahi chuna); koi nahi (payment ki script ka asar poore app pe, aur Render host pe baadh ka raasta khula).
- **Kab dobara khulega:** asli naap ke baad numbers (settings se, bina deploy), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-21. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Numbers (`/wake` ki seema, raftaar ka 3 guna, 100 requests/minute) misaal hain. CSP ki violation reports ka route, `security.txt`, map ki key aur record ki table aage ki security batches me.

### D-409. Security review batch 2: sign-in aur sessions

- **Faisla:** Security Architect ke doosre run ke sign-in aur sessions wale hisse docs me:
  1. Naye niyam SR-092 (email ka ek roop `emailNorm`, allowlist ki `exact` ya `aliases` entry, testers hamesha `exact` (D-405), aur codes ki seema mailbox key pe bhi), SR-093 (seemaon ka jod sirf HMAC ke roop me; R1 me D-109 ka jod), SR-094 (background requests session ka kaam nahi) aur SR-095 (apps ke stores aur query cache ke niyam) ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)).
  2. SR-012 (har email me app ka naam) aur SR-020 (mailbox key ki seema) me badlav.
  3. [security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.2 me 3 aur §1.3 me 2 naye threats.
  4. [ARCHITECTURE.md](ARCHITECTURE.md) §5 niyam 7 aur §10.7 niyam 1, [DESIGN.md](DESIGN.md) DS-6.10, aur [ACCEPTANCE.md](ACCEPTANCE.md) naya AC-IDENTITY-13 (kul 186).
- **Wajah:** Claude ki salah, owner ne maani: allowlist hi R1 ka darwaza hai aur uska milaan pakka chahiye; aliases se ek inbox pe codes ki baadh rukni chahiye; aur polling ko "kaam" ginne se staff ka bina kaam ka niyam (D-181) kabhi laagu nahi hota.
- **Chhode vikalp:** kuch hi hisse (owner ne koi nahi chuna); koi nahi (allowlist ka dhila milaan aur staff ka tab kabhi band nahi).
- **Kab dobara khulega:** asli naap ke baad numbers (settings se, bina deploy), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-22. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se; SR-093 ka baaki hissa R2 ki seemaon ke saath. Mailbox key ki din ki seema (misaal 3) aur device cookie ki umar (misaal 1 saal) misaal hain. SR-059 ka "wahi email" mailbox key ke saath authorization wali batch me.

### D-410. Security review batch 3: authorization aur paisa

- **Faisla:** Security Architect ke doosre run ke authorization aur paisa wale hisse docs me:
  1. [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me badlav: SR-032 (matrix ke aayam: route, role, app `aud` aur scope), SR-033 (bahar dikhne wale number bhi id jaise; secure random; "nahi hai" aur "aapka nahi" dono 404), SR-043 (bank statement aur settlement report ke imports), SR-059 (`emailNorm` aur mailbox key), SR-075 (export ki file pehle download ke baad ya misaal 24 ghante me mite; PAN aur bank ke columns sirf zaroori exports aur roles me).
  2. [security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.4 me 3 aur §1.5 me 2 naye threats.
  3. [RULES.md](RULES.md) RT-35 aur [ARCHITECTURE.md](ARCHITECTURE.md) §7 niyam 8 me badlav.
- **Wajah:** Claude ki salah, owner ne maani: staff ke scope aur partner ke assignment ka bug sirf doosre customer ki id wale test se nahi pakda jaata; settlement ka milaan sellers ke paise ka pehra hai; aur PAN wali export file jitni der rahe, jokhim utna.
- **Chhode vikalp:** kuch hi hisse (owner ne koi nahi chuna); koi nahi (scope ke bug aur PAN wali files ka khula raasta).
- **Kab dobara khulega:** asli naap ke baad numbers (settings se, bina deploy), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-22. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se; SR-059 ka D-203 wala hissa R2. Export ki file ka 24 ghante misaal hai. Is batch me koi naya SR nahi.

### D-411. Security review batch 4: delivery, reviews aur content ki ghadiyaan

- **Faisla:** Security Architect ke doosre run ke delivery, reviews aur content ki ghadiyon wale hisse docs me:
  1. [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me badlav: SR-060 (D-251 ki ghadiyaan: nagnata wali report pe turant chhupna, 2 ghante me faisla aur gambhirta 1 ka alert raat me bhi; baaki 36 ghante; jis account ki misaal 3 reports jhoothi niklein uski aisi reports apne aap content nahi chhupatin, sirf queue me upar) aur SR-078 (har event ki gambhirta 1, 2 ya 3).
  2. [security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.6 me 3 naye threats.
  3. [OPERATIONS.md](OPERATIONS.md) §7 niyam 3 me gambhirta ki poori list.
- **Wajah:** Claude ki salah, owner ne maani: SR-060 D-251 ke naye samay se peeche tha, raat ki nagnata wali report gambhirta 1 me na hoti to subah tak padi rehti, aur apne aap chhupne wale niyam ka jhoothi reports se galat istemaal rokna zaroori.
- **Chhode vikalp:** kuch hi hisse (owner ne koi nahi chuna); koi nahi (kanooni ghadi chhootne ka jokhim, jhoothi report ka khula raasta).
- **Kab dobara khulega:** asli naap ke baad numbers (settings se, bina deploy), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-22. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. "3 jhoothi reports" misaal hai. Email provider wala threat [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 ki email provider wali jaanch se juda; uska risk security ki risks wali batch me. Kanooni detail: Lawyer (AI) ne nahi jaancha: jhoothi report karne wale ki report pe content apne aap na chhupana D-251 niyam 2 ke saath chalega ya nahi.

### D-412. Security review batch 5: files, media, map aur band data

- **Faisla:** Security Architect ke doosre run ke files, media, map aur band data wale hisse docs me:
  1. Naye niyam SR-091 (map ka SDK bundle me, Ola ke hosts aur key ki whitelist, Ola ko koi personal pehchaan nahi), SR-096 (media provider pe signed upload aur tay params) aur SR-097 (band data public key se band, private key offline, D-399) ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)).
  2. SR-006, SR-062, SR-065 aur SR-066 me badlav.
  3. [security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.7 me 5 aur §1.10 me 1 naya threat.
  4. [OPERATIONS.md](OPERATIONS.md) §4 niyam 2 aur 3, §6 niyam 10; [ARCHITECTURE.md](ARCHITECTURE.md) §10.3 niyam 4, §10.3 ki commerce row, §10.6 niyam 15; [DESIGN.md](DESIGN.md) DS-7.10; [RULES.md](RULES.md) RT-14.
- **Wajah:** Claude ki salah, owner ne maani: media provider pe KYC aur daawon ki files hain, band data ki chaabi offline rakhna D-399 me tay hua, aur delete ka vaada archive tak poora hona chahiye.
- **Chhode vikalp:** kuch hi hisse (owner ne koi nahi chuna); koi nahi (band data ek leak se khulta, media ki galat setting ka raasta khula).
- **Kab dobara khulega:** asli naap ke baad numbers (settings se, bina deploy), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-22. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se; SR-062 me certificates R2, band FY ki file pehla FY band hone pe. Private key kho jaaye to band data aur purane FY ki books hamesha ke liye band; iska risk security ki risks wali batch me. Ola Maps ki key aur whitelist ka record D-404 ki table me.

### D-413. Security review batch 6: logs, audit, errors aur alerts

- **Faisla:** Security Architect ke doosre run ke logs, audit, errors aur alerts wale hisse docs me:
  1. Naye niyam SR-098 (saajha logger aur redaction), SR-099 (apps ki errors ka route), SR-100 (audit aur logs ki suraksha, D-400 aur D-402 ke saath) aur SR-101 (owner ke alerts ki push device ke saath, D-401) ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)).
  2. SR-005, SR-072 aur SR-074 me badlav.
  3. [security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.8 me 7 naye threats.
  4. [ARCHITECTURE.md](ARCHITECTURE.md) §8 niyam 3 aur 5, §10.4 niyam 5, §10.8 niyam 1 aur 5; [OPERATIONS.md](OPERATIONS.md) §7 niyam 9; [ACCEPTANCE.md](ACCEPTANCE.md) AC-LOGS-3 aur naya AC-MASTER-7 (kul 187).
- **Wajah:** Claude ki salah, owner ne maani: audit staff ke kaam ka saboot hai aur use mitane ya bharne ka raasta band hona chahiye; errors ka route bahar se likha ja sakta hai aur Master me dikhta hai; aur logger ka default roop keys aur emails likh sakta hai.
- **Chhode vikalp:** kuch hi hisse (owner ne koi nahi chuna); koi nahi (audit ka mitna, Master me XSS, logs me secrets).
- **Kab dobara khulega:** asli naap ke baad numbers (settings se, bina deploy), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-22. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. Errors ke route ki seemaayein (4 KB, 10, 20) aur message ke 300 akshar misaal hain. Audit ya logs ke dhaanche wale release me owner ka haath ka kadam (D-400); iska risk security ki risks wali batch me.

### D-414. Security review batch 7: DevOps, testing aur security bugs

- **Faisla:** Security Architect ke doosre run ke DevOps, testing aur security bugs wale hisse docs me:
  1. Naye niyam SR-102 (production me test ka koi hissa nahi), SR-103 (security bug ka raasta: `security.txt`, private record D-403, kill switch, ek baithak ka hotfix) aur SR-104 (icons ka package allowlist se) ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)).
  2. SR-081 aur SR-084 me badlav.
  3. [security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.9 me 6 naye threats aur bachav ki lines.
  4. [RULES.md](RULES.md) §4.1, §4.6 ki table, RT-39 aur naya RT-48; [OPERATIONS.md](OPERATIONS.md) §3 niyam 9 aur 10, aur naya §12 "Security ke record" (D-404); [COMPLIANCE.md](COMPLIANCE.md) §14.6 row 12; [RISKS.md](RISKS.md) R-054.
- **Wajah:** Claude ki salah, owner ne maani: repo public hai, to security fix aur findings ki detail live hone tak private rehni chahiye; test ka raasta live me paise aur sign-in dono tod deta; aur record ki ek tay jagah ke bina release gate use gin nahi sakta.
- **Chhode vikalp:** kuch hi hisse (owner ne koi nahi chuna); koi nahi (test ka raasta live me, fix se pehle kamzori public).
- **Kab dobara khulega:** asli naap ke baad numbers (settings se, bina deploy), ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-22. **Nishaan:** Salah maani.
- **Asar (Claude):** R1 se. `security.txt` ka `Expires` (misaal 1 saal) misaal hai. Record ki table [OPERATIONS.md](OPERATIONS.md) §12 me abhi khaali; pehli entries R1 ki tayyari me.

### D-415. Security review batch 8: 7 naye risks

- **Faisla:** 7 naye risks [RISKS.md](RISKS.md) me (tag `Security`): R-077 (Render ke public host pe baadh), R-078 (band data ki offline chaabi kho jaana), R-079 (email provider ke paas codes), R-080 (audit aur logs ke dhaanche ka badlav), R-081 (raat ke alerts ka raasta band), R-082 (map ki browser key), R-083 (bahar se likhne wale raaston ki baadh). Saare bachav ke saath `Khula`.
- **Wajah:** Claude ki salah, owner ne maani: har ek ka bachav security ke niyamon aur D-399 se D-406 me likha hai, par ₹0 aur akele owner ke saath khatra bacha hai.
- **Chhode vikalp:** kuch hi risks (owner ne koi nahi chuna); koi nahi (khatre kahin likhe nahi rehte).
- **Kab dobara khulega:** risks ki ek-ek jaanch pe, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-22. **Nishaan:** Salah maani.
- **Asar (Claude):** R-001 se R-076 `Maana` hain; ye 7 owner ki ek-ek jaanch tak `Khula`. Sambhavna ke andaze Claude ke hain.

### D-416. Security review batch 9: SR doc ka dhaancha aur OWASP ke versions

- **Faisla:** [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) ka naya dhaancha:
  1. Har niyam ke saath `Release` column (`R1`, `R2`, ya `R1; R2 me: ...`).
  2. Saare 105 niyamon ka "Kahan se" ASVS 5.0.0 ke chapter ke naam pe.
  3. Naya §2: OWASP Top 10:2025 aur OWASP API Security Top 10 2023 ka naksha.
  4. [RULES.md](RULES.md) RG-2 ki ginti `Release` column se.
- **Wajah:** Claude ki salah, owner ne maani: release gate ki ginti ko R1 ke niyam saaf pehchanne chahiye, aur mapping OWASP ke abhi ke versions pe honi chahiye.
- **Chhode vikalp:** kuch hi hisse (owner ne koi nahi chuna); koi nahi (ginti ki script R1 ke niyam nahi pehchanti, mapping purane versions pe).
- **Kab dobara khulega:** OWASP ka naya version aaye, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-22. **Nishaan:** Salah maani.
- **Asar (Claude):** versions owasp.org pe 2026-11-21 ko jaanche (Security Architect ke doosre run me). ASVS 5.0.0 ka naksha sirf chapter ke naam se; requirement IDs aur levels (L1 se L3) nahi jaanche, aage ki security review me. Security Architect ke doosre run ke saare 9 sawal aur 9 batches ab docs me.

### D-417. Security review ke baaki hisse

- **Faisla:** Security Architect ke doosre run ke bache hisse docs me:
  1. [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 me 11 nayi jaanch (CSP me path, Render pe 403 aur jaagna, media provider, Ola ki key aur SDK, GitHub advisory ka fork aur artifacts, logger aur MongoDB ki errors, Web Push ki umar, Vercel ke headers, Zustand ka devtools, `security.txt`, Razorpay ka hosted page), aur 4 maujooda rows "ab zyada zaroori" (laptop ka Desktop folder: sync mile to backups ka folder Desktop ke bahar; email provider; Atlas M0 ka custom role; Razorpay ki sthir pehchaan).
  2. Lene layak (D-074): SR-002 ke test me Vercel ki routing library se config ki jaanch; §2 ki Vercel secret header wali row me `transforms` ka ishara.
  3. Tay faislon pe dhyaan ke 17 points ka hisaab: 15 D-399 se D-416 ke niyamon me, D-322 wala R-077 me, backups ke folder wala §2 ki row me.
- **Wajah:** Claude ki salah, owner ne maani: kai naye niyam tathyon pe tike hain jo jaanche nahi gaye, aur backups ka folder sync me ho to band data bahar ja sakta hai.
- **Chhode vikalp:** kuch hi hisse (owner ne koi nahi chuna); koi nahi (tathya bina jaanche).
- **Kab dobara khulega:** jaanch ke nateeje aane pe, ya owner khud khole.
- **Kisne, kab:** owner, 2026-11-22. **Nishaan:** Salah maani.
- **Asar (Claude):** Security Architect ke doosre run ka saara kaam ab docs me. Ye sab jaanch Claude ki hai (owner ka faisla nahi), R1 se pehle; laptop ki jaanch owner ke saath.

## Change log

| Version  | Date       | Badlav                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0   | 2026-11-17 | Khaali file bani.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| v1.1.1   | 2026-11-17 | §0 likhne ka tareeka, §1 aur §2 bane; pehla faisla D-001 (tech stack, finance ke liye PostgreSQL).                                                                                                                                                                                                                                                                                                                                                                                          |
| v1.1.2   | 2026-11-17 | Sudhaar (owner ne pakda): D-001 me PostgreSQL ka nishaan "Salah maani"; ye Claude ki hi daleel thi. Faisla nahi badla.                                                                                                                                                                                                                                                                                                                                                                      |
| v1.2.1   | 2026-11-17 | D-002 se D-011 aaye (repo, sab naye sire se, discovery, agents, docs ka dhaancha, Security Architect, releases, capacity, 11 apps, services).                                                                                                                                                                                                                                                                                                                                               |
| v1.2.2   | 2026-11-17 | D-011: owner ne pakka kiya ki har service ka apna cluster; "ek environment ka ek cluster" chhoda.                                                                                                                                                                                                                                                                                                                                                                                           |
| v1.3.1   | 2026-11-17 | D-012 se D-027 aaye (asli users, backup, fulfilment, location, pincode, roles, faislon aur docs ka tareeka, guest cart, customer sign-in, location ka kaam, package CLI, branches, consultation, lakshya, stock transport).                                                                                                                                                                                                                                                                 |
| v1.3.2   | 2026-11-17 | D-028 aaya (₹0 aur domain nahi).                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| v1.4.1   | 2026-11-17 | D-029 se D-053 aaye: product, business model, apna brand (alag company), sellers, payments, launch, customers, reviews, platform, compliance, waitlist, Master ke roles, hosting, Redis, performance. D-014 me jod: receiving pe batch aur expiry, return pickup, pehle din sirf 1 hub.                                                                                                                                                                                                     |
| v1.4.2   | 2026-11-17 | D-054 aaya (roles ka timing: dono baatein ek saath).                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| v1.4.3   | 2026-11-17 | D-011 me asar: generator har service ka apna MongoDB URI aur finance ke liye PostgreSQL option de.                                                                                                                                                                                                                                                                                                                                                                                          |
| v1.4.4   | 2026-11-17 | D-055 aaya (R1 ka scope; detail PROJECT_PLAN §1).                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| v1.4.5   | 2026-11-17 | D-055: owner ne R1 ki list dekh ke pakki ki.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| v1.4.6   | 2026-11-18 | D-056 aaya (Render pe sirf ek web service aur ek Key Value).                                                                                                                                                                                                                                                                                                                                                                                                                                |
| v1.4.7   | 2026-11-18 | D-057 aaya (finance ka PostgreSQL Neon pe); D-001 aur D-048 me provider likha.                                                                                                                                                                                                                                                                                                                                                                                                              |
| v1.4.8   | 2026-11-18 | D-057: Neon ka Singapore region jaancha; project usi me.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| v1.4.9   | 2026-11-18 | D-058 aaya (saari hosting Singapore region me).                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| v1.4.10  | 2026-11-18 | D-059 aaya (pehle diye gaye roles ki jaanch nahi).                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| v1.4.11  | 2026-11-18 | D-060 aaya (warehouse me rakhe maal ka maalik brand; Q-001).                                                                                                                                                                                                                                                                                                                                                                                                                                |
| v1.4.12  | 2026-11-18 | D-061 aaya (selling price brand tay kare, platform ke 4 niyam; Q-002).                                                                                                                                                                                                                                                                                                                                                                                                                      |
| v1.4.13  | 2026-11-18 | D-062 aaya (expire hone wala ya na bika maal: nuksaan brand ka, platform ke 6 niyam; Q-003).                                                                                                                                                                                                                                                                                                                                                                                                |
| v1.4.14  | 2026-11-18 | D-063 aaya (hamare haath se hue nuksaan ki bharpai: bikne wala daam; Q-004).                                                                                                                                                                                                                                                                                                                                                                                                                |
| v1.4.15  | 2026-11-18 | D-064 aaya (alag batches ka alag MRP: batch ke hisaab se; Q-005).                                                                                                                                                                                                                                                                                                                                                                                                                           |
| v1.4.16  | 2026-11-18 | D-065 aaya (Beauty Pro buyers ka alag Pro daam, seller chahe to; Q-006).                                                                                                                                                                                                                                                                                                                                                                                                                    |
| v1.4.17  | 2026-11-18 | D-066 aaya (na bike maal pe storage fee: kuch din muft, phir fee; Q-007).                                                                                                                                                                                                                                                                                                                                                                                                                   |
| v1.4.18  | 2026-11-18 | D-067 aaya (product page pe agle batch ki exact expiry; Q-008).                                                                                                                                                                                                                                                                                                                                                                                                                             |
| v1.4.19  | 2026-11-18 | D-068 aaya (nuksaan ki vasooli sirf saboot ke saath; Q-009).                                                                                                                                                                                                                                                                                                                                                                                                                                |
| v1.4.20  | 2026-11-18 | D-069 aaya (Beauty Pro buyer: saboot + staff ki jaanch; Q-010).                                                                                                                                                                                                                                                                                                                                                                                                                             |
| v1.4.21  | 2026-11-18 | D-070 aaya (Pro daam ki quantity seema seller tay kare; Q-011).                                                                                                                                                                                                                                                                                                                                                                                                                             |
| v1.4.22  | 2026-11-18 | D-071 aaya (seller pe bachi fee: seema ke baad kadam; Q-012).                                                                                                                                                                                                                                                                                                                                                                                                                               |
| v1.4.23  | 2026-11-18 | D-072 aaya ("parcel nahi mila" ka jhagda saboot se; Q-013).                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| v1.4.24  | 2026-11-18 | D-073 aaya (pehle ka kaam do kadam me hatega; Q-014).                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| v1.4.25  | 2026-11-18 | D-074 aaya (pehle ke kaam se lene layak cheezon ki chalti list; Q-015).                                                                                                                                                                                                                                                                                                                                                                                                                     |
| v1.4.26  | 2026-11-18 | D-075 aaya (ek brand ka ek seller, brand ko pehla haq; Q-016).                                                                                                                                                                                                                                                                                                                                                                                                                              |
| v1.4.27  | 2026-11-18 | D-076 aaya (variants category ke hisaab se, platform tay kare; Q-017).                                                                                                                                                                                                                                                                                                                                                                                                                      |
| v1.4.28  | 2026-11-18 | D-077 aaya (kai sellers wala order: normal ek parcel, majboori me alag; Q-018); D-072 me jod (code har parcel ka).                                                                                                                                                                                                                                                                                                                                                                          |
| v1.4.29  | 2026-11-18 | D-078 aaya (seller ki fees: commission GST ke bina + fulfilment fee; Q-019).                                                                                                                                                                                                                                                                                                                                                                                                                |
| v1.4.30  | 2026-11-18 | D-079 aaya (return ki wajahein; man badla sirf band maal pe; Q-020).                                                                                                                                                                                                                                                                                                                                                                                                                        |
| v1.4.31  | 2026-11-18 | D-080 aaya (return ki samay-seema wajah ke hisaab se; Q-021).                                                                                                                                                                                                                                                                                                                                                                                                                               |
| v1.4.32  | 2026-11-18 | D-081 aaya (seller ka paisa return ki samay-seema ke baad payable, hafte me payout; Q-022).                                                                                                                                                                                                                                                                                                                                                                                                 |
| v1.4.33  | 2026-11-18 | D-082 aaya (expiry ki seemaayein: default + category ka override; Q-023).                                                                                                                                                                                                                                                                                                                                                                                                                   |
| v1.4.34  | 2026-11-18 | "Asar" se agle sawalon ke zikr hataye (owner); jo sawal tay ho chuka, wahan us faisle ka number. Koi faisla nahi badla.                                                                                                                                                                                                                                                                                                                                                                     |
| v1.5.1   | 2026-11-18 | D-083 se D-095 aaye (Q-024 se Q-036 ek saath; owner ne saare sawalon pe salah maani).                                                                                                                                                                                                                                                                                                                                                                                                       |
| v1.6.1   | 2026-11-18 | D-096 se D-116 aaye (Q-037 se Q-057, 6 group; owner ne salah maani, Q-040 me teeno kadam R1 me); D-055 aur D-063 me jod.                                                                                                                                                                                                                                                                                                                                                                    |
| v1.6.2   | 2026-11-18 | D-068, D-071 aur D-090 ke "Asar" me naye faislon ke number; koi faisla nahi badla.                                                                                                                                                                                                                                                                                                                                                                                                          |
| v1.7.1   | 2026-11-18 | D-117 se D-130 aaye (Q-058 se Q-071; owner ne saare sawalon pe salah maani); D-043, D-063, D-064, D-072 aur D-108 me jod; D-080 niyam 5 me D-129 ka number.                                                                                                                                                                                                                                                                                                                                 |
| v1.7.2   | 2026-11-18 | D-131 aur D-132 aaye (Q-072, Q-073; owner ne salah maani); D-090, D-126 aur D-129 me jod; D-099, D-126 aur D-128 ke "Asar" me naye number.                                                                                                                                                                                                                                                                                                                                                  |
| v1.8.1   | 2026-11-19 | D-133 se D-159 aaye (Q-074 se Q-100; owner ne saare sawalon pe salah maani); D-055, D-072, D-099, D-105 aur D-126 me jod; D-072 ke "Asar" me naya number.                                                                                                                                                                                                                                                                                                                                   |
| v1.9.1   | 2026-11-19 | D-160 se D-179 aaye (Q-101 se Q-120; owner ne saare sawalon pe salah maani); D-159 me jod.                                                                                                                                                                                                                                                                                                                                                                                                  |
| v1.10.1  | 2026-11-19 | D-180 se D-204 aaye (Q-121 se Q-145, Security Architect ke R1 sawal; owner ne saare sawalon pe salah maani).                                                                                                                                                                                                                                                                                                                                                                                |
| v1.10.2  | 2026-11-19 | D-205 se D-208 aaye (Q-146 se Q-149, Security Architect ke R2 sawal; owner ne saare sawalon pe salah maani).                                                                                                                                                                                                                                                                                                                                                                                |
| v1.10.3  | 2026-11-19 | D-209 aaya (security report area ke hisaab se batches me; Q-150).                                                                                                                                                                                                                                                                                                                                                                                                                           |
| v1.10.4  | 2026-11-19 | D-210 aaya (security batch 1: edge aur hosting maana; Q-151).                                                                                                                                                                                                                                                                                                                                                                                                                               |
| v1.10.5  | 2026-11-19 | D-211 aaya (security batch 2: sign-in maana; Q-152).                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| v1.10.6  | 2026-11-19 | D-212 aaya (security batch 3: sessions aur tokens maana; Q-153).                                                                                                                                                                                                                                                                                                                                                                                                                            |
| v1.10.7  | 2026-11-19 | D-213 aaya (security batch 4: authorization aur sellers ki deewar maana; Q-154).                                                                                                                                                                                                                                                                                                                                                                                                            |
| v1.10.8  | 2026-11-19 | D-214 aaya (security batch 5: catalog, checkout aur paisa maana; Q-155).                                                                                                                                                                                                                                                                                                                                                                                                                    |
| v1.10.9  | 2026-11-19 | D-215 aaya (security batch 6: delivery, daawe aur reviews maana; Q-156).                                                                                                                                                                                                                                                                                                                                                                                                                    |
| v1.10.10 | 2026-11-19 | D-216 aaya (security batch 7: files aur personal data maana; Q-157).                                                                                                                                                                                                                                                                                                                                                                                                                        |
| v1.10.11 | 2026-11-19 | D-217 aaya (security batch 8: data stores, services aur khabrein maana; Q-158).                                                                                                                                                                                                                                                                                                                                                                                                             |
| v1.10.12 | 2026-11-19 | D-218 aaya (security batch 9: export, audit, logs aur DevOps maana; Q-159).                                                                                                                                                                                                                                                                                                                                                                                                                 |
| v1.10.13 | 2026-11-19 | D-219 aaya (security batch 10: R2 ke hisse aur seller ko invoice ki copy maana; Q-160); security report ki saari batches poori.                                                                                                                                                                                                                                                                                                                                                             |
| v1.10.14 | 2026-11-19 | D-220 aaya (kanooni jaanch ke nateeje: pehle asar ke sawal, phir COMPLIANCE ki 4 batches; Q-161); §0 me "jaanchi nahi" ki line.                                                                                                                                                                                                                                                                                                                                                             |
| v1.10.15 | 2026-11-19 | D-221 se D-227 aaye (kanooni asar: return ki muddat, der se delivery, 30 din ka daam, test claims, tax archive, invoice pe naam, seller ke tax dastavez; Q-162 se Q-168); D-079, D-080, D-100, D-117, D-120, D-143, D-151, D-193 me badla ya jod; D-055 me R1 jod.                                                                                                                                                                                                                          |
| v1.10.16 | 2026-11-19 | D-134 me jod: test wale claims ka saboot R1 se (D-224).                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| v1.10.17 | 2026-11-19 | D-228 se D-241 aaye (kanooni asar ke baaki 22 points, Q-169 se Q-181; D-237 aur D-241 owner ke apne jawab: Grievance Officer, nodal person aur apne roles ki jaankari dummy nahi); 26 purane faislon me badla ya jod.                                                                                                                                                                                                                                                                       |
| v1.10.18 | 2026-11-19 | D-242 aaya (platform, apne brand aur companies ke naam; owner); D-233 aur D-031 me badla.                                                                                                                                                                                                                                                                                                                                                                                                   |
| v1.10.19 | 2026-11-19 | D-243 aaya (apna brand "Unibelle", seller company "Unibelle Cosmetics Pvt Ltd"); D-242, D-233 aur D-031 me badla.                                                                                                                                                                                                                                                                                                                                                                           |
| v1.10.20 | 2026-11-19 | D-030 me jod (D-243): "Beautinique" storefront aur platform ka naam, product brand "Unibelle".                                                                                                                                                                                                                                                                                                                                                                                              |
| v1.10.21 | 2026-11-19 | D-244 aaya (COMPLIANCE batch 1: tax ki 24 rows maani; Q-182).                                                                                                                                                                                                                                                                                                                                                                                                                               |
| v1.10.22 | 2026-11-19 | D-242 aur D-243 ke Asar se hataye gaye consent wale sawal ka number hataya (owner); faisle waise hi.                                                                                                                                                                                                                                                                                                                                                                                        |
| v1.10.23 | 2026-11-19 | Owner ke kehne pe D-031 aur D-233 se D-242 wali "badla" line (naam platform jaisa) hatayi; D-233 me D-243 ka naam "jod" ki tarah.                                                                                                                                                                                                                                                                                                                                                           |
| v1.10.24 | 2026-11-19 | D-245 aaya (COMPLIANCE batch 2: Legal Metrology ki 14 rows maani; Q-183).                                                                                                                                                                                                                                                                                                                                                                                                                   |
| v1.10.25 | 2026-11-19 | D-246 aaya (COMPLIANCE batch 3: cosmetics kanoon ki 20 rows maani; Q-184).                                                                                                                                                                                                                                                                                                                                                                                                                  |
| v1.10.26 | 2026-11-19 | D-247 aaya (COMPLIANCE batch 4: e-commerce aur consumer kanoon ki 29 rows maani; Q-185); kanooni jaanch ka pehla run docs me poora.                                                                                                                                                                                                                                                                                                                                                         |
| v1.10.27 | 2026-11-20 | D-248 se D-256 aaye (kanooni jaanch ke doosre run ka asar: data leak ke samay, gift card, kanooni rok aur logs, content ki shikayat ke samay, Skin & Hair Expert, privacy aur CERT-In ka sampark, delivery partners, personal data aur seller ke chhote sudhaar; Q-186 se Q-194); D-136, D-163, D-179, D-198 badle; D-017, D-025, D-038, D-045, D-055, D-058, D-062, D-072, D-093, D-104, D-111, D-134, D-142, D-150, D-151, D-191, D-192, D-194, D-203, D-208, D-216, D-237, D-246 me jod. |
| v1.10.28 | 2026-11-20 | D-257 aaya (do naye AI agents, Lawyer aur CA, aur agents ka poora kram; hobby project me yahi project ke lawyer aur CA, koi licensed nahi; owner ne kram Claude pe chhoda); D-220 badla.                                                                                                                                                                                                                                                                                                    |
| v1.10.29 | 2026-11-20 | D-258 aaya (COMPLIANCE batch 5: personal data ki 17 rows maani, CL-088 se CL-104; Q-195).                                                                                                                                                                                                                                                                                                                                                                                                   |
| v1.10.30 | 2026-11-20 | D-259 aaya (COMPLIANCE batch 6: IT Rules, CERT-In aur payments ki 7 rows maani, CL-105 se CL-111; Q-196).                                                                                                                                                                                                                                                                                                                                                                                   |
| v1.10.31 | 2026-11-20 | D-260 aaya (COMPLIANCE batch 7: gig partners, warehouse aur environment ki 9 rows maani, CL-112 se CL-120; Q-197).                                                                                                                                                                                                                                                                                                                                                                          |
| v1.10.32 | 2026-11-20 | D-261 aaya (COMPLIANCE batch 8: sehat, AYUSH, IP aur contracts ki 8 rows, "Nazar" aur CL-081; Q-198); kanooni jaanch ke dono run docs me poore.                                                                                                                                                                                                                                                                                                                                             |
| v1.10.33 | 2026-11-20 | D-262 se D-271 aaye (Lawyer (AI) ki report ke asar aur sawal; Q-199 se Q-208); D-146, D-150 aur D-250 me "Badla" line.                                                                                                                                                                                                                                                                                                                                                                      |
| v1.10.34 | 2026-11-20 | D-272 aaya (COMPLIANCE ki 18 rows pe Lawyer (AI) ka nishaan; Q-209).                                                                                                                                                                                                                                                                                                                                                                                                                        |
| v1.10.35 | 2026-11-20 | D-273 aaya (documents ka dhaancha COMPLIANCE §14 me; Q-210).                                                                                                                                                                                                                                                                                                                                                                                                                                |
| v1.10.36 | 2026-11-20 | D-274 aaya (COMPLIANCE batch 9: documents ka dhaancha, §14; Q-211); Lawyer (AI) ki report docs me poori.                                                                                                                                                                                                                                                                                                                                                                                    |
| v1.11.1  | 2026-11-20 | D-275 se D-280 aaye (CA (AI) ki report ke sawal aur jod; Q-212 se Q-217). D-063, D-078, D-081, D-095, D-096, D-107, D-122, D-225, D-227, D-228, D-229, D-254, D-256, D-269 me jod.                                                                                                                                                                                                                                                                                                          |
| v1.11.2  | 2026-11-20 | D-281 aaya (COMPLIANCE pe CA (AI) ke nishaan aur badlav; Q-218).                                                                                                                                                                                                                                                                                                                                                                                                                            |
| v1.11.3  | 2026-11-20 | D-282 aaya (finance ke accounting niyam ARCHITECTURE §1 me; Q-219).                                                                                                                                                                                                                                                                                                                                                                                                                         |
| v1.12.1  | 2026-11-20 | D-283 se D-290 aaye (Principal Software Architect ke 8 sawal: scale target, media, logs, errors, email provider, finance ka batch, invoice ka email, SPA; Q-220 se Q-227). D-058 me jod.                                                                                                                                                                                                                                                                                                    |
| v1.13.1  | 2026-11-20 | D-291 se D-298 aaye (ARCHITECTURE ki 8 batches, §2 se §9; Q-228 se Q-235). D-011 me jod.                                                                                                                                                                                                                                                                                                                                                                                                    |
| v1.13.2  | 2026-11-20 | D-299 se D-303 aaye (Architect ke risks, area band karne ka kram, bina network ke delivery code, confirmation email ki line, media ka backup; Q-236 se Q-240). D-072, D-126 aur D-298 me jod.                                                                                                                                                                                                                                                                                               |
| v1.13.3  | 2026-11-21 | D-296 me jod (owner): file badalne pe purani file ka niyam, ARCHITECTURE §7 niyam 10.                                                                                                                                                                                                                                                                                                                                                                                                       |
| v1.14.1  | 2026-11-21 | D-304 se D-309 aaye (Database Architect ke 6 sawal: har parivaar ka alag account, delete pe reviews, purane orders ka archive, rakhne ke samay, order number, finance ke band FY; Q-241 se Q-246).                                                                                                                                                                                                                                                                                          |
| v1.14.2  | 2026-11-21 | D-310 se D-317 aaye (ARCHITECTURE §10 data ki 8 batches; Q-247 se Q-254).                                                                                                                                                                                                                                                                                                                                                                                                                   |
| v1.14.3  | 2026-11-21 | D-318 se D-321 aaye (Database Architect ke risks, data ke 5 sudhaar, delete ke baad seller ki invoice copy, rok aur technical records; Q-255 se Q-258).                                                                                                                                                                                                                                                                                                                                     |
| v1.14.4  | 2026-11-21 | D-322 se D-325 aaye (server jagaane ka samay, backup kitni baar, alerts dekhne ka samay, npm publish nahi; Q-259 se Q-262).                                                                                                                                                                                                                                                                                                                                                                 |
| v1.14.5  | 2026-11-21 | D-326 se D-336 aaye (OPERATIONS ki 11 batches; Q-263 se Q-273). D-324 ke asar me D-248 ki ghadi saaf ki.                                                                                                                                                                                                                                                                                                                                                                                    |
| v1.14.6  | 2026-11-21 | D-337 aur D-338 aaye (DevOps ke 12 risks, operations ke 6 sudhaar; Q-274, Q-275); D-024 me jod (D-338).                                                                                                                                                                                                                                                                                                                                                                                     |
| v1.14.7  | 2026-11-21 | D-339 aaya (stack me Zustand, pino aur pino-pretty; owner); D-001 me jod.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| v1.14.8  | 2026-11-21 | D-340 se D-351 aaye (UX: rang, fonts, dark theme, navigation, search ke sujhaav, checkout, push ki ijazat, address ka pin, R1 Home, jaagne ka parda, icons, location ke bina photo delivery; Q-276 se Q-287).                                                                                                                                                                                                                                                                               |
| v1.14.9  | 2026-11-21 | D-352 se D-361 aaye (DESIGN ki 10 batches, 121 niyam; Q-288 se Q-297).                                                                                                                                                                                                                                                                                                                                                                                                                      |
| v1.14.10 | 2026-11-21 | D-362 se D-367 aaye (FLOWS ki 6 batches, 20 flows; Q-298 se Q-303).                                                                                                                                                                                                                                                                                                                                                                                                                         |
| v1.14.11 | 2026-11-21 | D-368 se D-370 aaye (UX ke 9 risks, seller ka payable aur lambi return muddat, UX ke chhote sudhaar; Q-304 se Q-306); D-081 aur D-072 me jod.                                                                                                                                                                                                                                                                                                                                               |
| v1.14.12 | 2026-11-21 | D-347 badla: owner ne Ola Maps chuna (address ka pin Ola ke autocomplete aur map se, 5 niyam; Q-283).                                                                                                                                                                                                                                                                                                                                                                                       |
| v1.14.13 | 2026-11-21 | D-347 me owner ka jod: form aur Ola Maps dono, map ke search se form aur lat/lng apne aap, pin aur "Use my current location"; limit ki nigrani nahi (9 niyam).                                                                                                                                                                                                                                                                                                                              |
| v1.14.14 | 2026-11-21 | D-349 badla (owner): parda sirf jaagne tak, tab tak app band, phir app use hote tak background ping (7 niyam); D-322 me jod.                                                                                                                                                                                                                                                                                                                                                                |
| v1.14.15 | 2026-11-21 | D-350 badla (owner): icons icones.js.org se copy karke apna package, mukhya set Lucide (7 niyam).                                                                                                                                                                                                                                                                                                                                                                                           |
| v1.14.16 | 2026-11-21 | D-350 me owner ka jod: mukhya set Solar, doosra Lucide, phir baaki; har app me Icon credits page.                                                                                                                                                                                                                                                                                                                                                                                           |
| v1.14.17 | 2026-11-21 | D-350 (owner): icons ka alag page nahi, sab apps me ek saajha Credits page, har package ka apna credit component; D-347 niyam 9 me Ola Maps ka credit.                                                                                                                                                                                                                                                                                                                                      |
| v1.14.18 | 2026-11-21 | D-351 ki wajah me RTO ka matlab saaf kiya (GLOSSARY ki link).                                                                                                                                                                                                                                                                                                                                                                                                                               |
| v1.14.19 | 2026-11-21 | D-371 se D-380 aaye (QA Architect ke 10 sawal: coverage aur mutation ke gate, flaky tests, WebKit, asli phone, screen reader, khoj wala testing, bug ki gambhirta, load test, smoke order; Q-307 se Q-316).                                                                                                                                                                                                                                                                                 |
| v1.14.20 | 2026-11-21 | D-381 se D-387 aaye (QA ki 7 batches RULES me; Q-317 se Q-323); D-342 ke Asar me sudhaar (screenshot sirf mukhya screens, axe har screen).                                                                                                                                                                                                                                                                                                                                                  |
| v1.14.21 | 2026-11-21 | D-388 se D-395 aaye (acceptance criteria ki jagah ACCEPTANCE.md, aur QA ke criteria ki 7 batches; Q-324 se Q-331).                                                                                                                                                                                                                                                                                                                                                                          |
| v1.14.22 | 2026-11-21 | D-396 aaya (QA ke 12 risks R-065 se R-076; Q-332).                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| v1.14.23 | 2026-11-21 | D-397 aur D-398 aaye (QA ke 5 sudhaar aur 5 lene layak niyam; Q-333, Q-334); D-376 aur D-380 ke Asar me "jod diya".                                                                                                                                                                                                                                                                                                                                                                         |
| v1.14.24 | 2026-11-21 | D-399 se D-407 aaye (Security Architect ke doosre run ke 9 sawal; Q-335 se Q-343).                                                                                                                                                                                                                                                                                                                                                                                                          |
| v1.14.25 | 2026-11-21 | D-408 aaya (security review batch 1: edge aur hosting; Q-344). |
| v1.14.26 | 2026-11-22 | D-409 aaya (security review batch 2: sign-in aur sessions; Q-345). |
| v1.14.27 | 2026-11-22 | D-410 aaya (security review batch 3: authorization aur paisa; Q-346). |
| v1.14.28 | 2026-11-22 | D-411 aaya (security review batch 4: delivery, reviews aur content ki ghadiyaan; Q-347). |
| v1.14.29 | 2026-11-22 | D-412 aaya (security review batch 5: files, media, map aur band data; Q-348). |
| v1.14.30 | 2026-11-22 | D-413 aaya (security review batch 6: logs, audit, errors aur alerts; Q-349). |
| v1.14.31 | 2026-11-22 | D-414 aaya (security review batch 7: DevOps, testing aur security bugs; Q-350). |
| v1.14.32 | 2026-11-22 | D-415 aaya (security review batch 8: 7 naye risks; Q-351). |
| v1.14.33 | 2026-11-22 | D-416 aaya (security review batch 9: SR doc ka dhaancha aur OWASP ke versions; Q-352). |
| v1.14.34 | 2026-11-22 | D-417 aaya (security review ke baaki hisse; Q-353). |
