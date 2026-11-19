# COMPLIANCE: Beautinique

> **Status:** v1.1.2 (2026-11-19). Kanooni matrix. System me sab poori tarah banta hai, par registrations aur bahar ki companies ki details dummy hain (D-026); apne roles ki jaankari asli (D-241). Kisi lawyer ya CA se jaancha nahi (R-004). Cheezein ek-ek karke, owner ki haan se, judti hain (D-220).

## Is file me kya aayega

- Har row (CL-xxx): **Kanoon ya niyam**, **Kis pe laagu**, **Kis module me**, **System me kya chahiye**, **Dummy kya hai**, **Jaancha ya nahi** (source aur tareekh ke saath).
- **Jaancha** = public source khol ke milaaya (tareekh ke saath). **Aadha jaancha** = sirf secondary source, ya sarkari text ki purani copy. **Jaancha nahi** = source nahi khula. Lawyer ya CA se kuch nahi jaancha (R-004).
- Rows area ke hisaab se batches me aati hain (D-220): §1 tax; aage Legal Metrology, cosmetics kanoon, aur e-commerce aur consumer kanoon. Personal data, payments, gig workers jaise areas kanooni jaanch ke doosre run ke baad.
- **Number:** CL-001 se kram se. Ek baar diya number kabhi badalta nahi aur dobara use nahi hota.
- Jahan row kisi faisle se judi hai, wahan D-xxx ka hawala; faisle ka itihaas sirf [DECISIONS.md](DECISIONS.md) me.

## 1. Tax: GST, TCS, TDS (D-244)

### 1.0 Sources (sab 2026-11-19 ko khole)

- **[T1]** GST Council ki 56th meeting ki press release (PIB, 3 Sep 2025): <https://gstcouncil.gov.in/sites/default/files/2025-09/press_release_press_information_bureau.pdf>. Primary.
- **[T2]** CBIC ka GST Ready Reckoner, CGST rates on goods as on 22.09.2025 (Notification 9/2025-Central Tax (Rate), 17 Sep 2025). CBIC ka document, par copy ek doosri site pe khuli: <https://a2ztaxcorp.net/wp-content/uploads/2025/09/CBIC-GST-Ready-Reckoner-indicating-updated-Central-Goods-and-Services-Tax-CGST-rates-on-goods.pdf>. Primary document, secondary host.
- **[T3]** CGST Act 2017, CBIC ka consolidated text as on 31.08.2021: <https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf>. Primary, par 2021 tak; baad ke badlav isme nahi.
- **[T4]** Notification 15/2024-Central Tax (10 Jul 2024), TCS rate: <https://gstcouncil.gov.in/sites/default/files/2024-09/central-tax-15-2024-11072024.pdf>. Primary.
- **[T5]** Circular 243/37/2024-GST (31 Dec 2024), vouchers: <https://gstcouncil.gov.in/sites/default/files/2025-01/circular-no-243-2024.pdf>. Primary.
- **[T6]** GST Council ka flyer "Tax Invoice, Credit and Debit Notes" (rule 46 ka saar): <https://www.gstcouncil.gov.in/sites/default/files/e-version-gst-flyers/Tax_Invoice_and_other_new.pdf>. Primary, par purana.
- **[T7]** Circular 92/11/2019-GST (7 Mar 2019), sales promotion; text ek doosri site pe: <https://taxguru.in/?p=675598>. Secondary.
- **[T8]** E-commerce operator ka TDS, Income-tax Act 2025 s.393(1) (10 Nov 2026 ka lekh): <https://blog.tdsman.com/2026/11/tds-on-e-commerce-transactions-section-3931-194o/>. Secondary.
- **[T9]** Notification 01/2026-Central Tax (Rate) ka saar: <https://taxguru.in/goods-and-service-tax/cbic-revises-gst-rate-notification-under-finance-act-2026.html>. Secondary.
- **[T10]** Search ke nateeje (sirf ishaara): e-invoice ki seema (Notification 10/2023-Central Tax), s.34(2) ki 30 November ki seema (Finance Act 2022), delivery services pe s.9(5) (Notifications 17/2025, 06/2026, 09/2026-Central Tax (Rate)). Primary text nahi khula. Secondary.

### CL-001. GST rates: beauty aur personal care

- **Kanoon ya niyam:** 22 Sep 2025 se (Notification 9/2025-CT(Rate)): 5% (talcum aur face powder, hair oil, shampoo, toothpaste, shaving cream aur aftershave, toilet soap bar); 18% (perfume, baaki make-up aur skincare, baaki hair products, deodorant, face wash aur body wash); Nil (kajal, kumkum, bindi, sindur, alta). Ek hi HSN heading me alag rate ho sakte hain (3304 me talcum 5%, make-up 18%; 3401 me soap bar 5%, face wash 18%).
- **Kis pe laagu:** har seller ki har listing.
- **Kis module me:** catalog, finance (rate table).
- **System me kya chahiye:** rate table ki row = HSN + description ki shart + rate + kis din se (D-086, D-239); seller row chune, staff jaanche. Kit pe CL-010.
- **Dummy kya hai:** kuch nahi; rates asli (public data). Table me notification ka hawala.
- **Jaancha ya nahi:** Jaancha (2026-11-19): 5% ki list [T1] se; 18% aur Nil [T2] se; 2026 ke badlav ne Chapter 33 nahi chheda [T9, secondary].

### CL-002. Rate badalne ka pal

- **Kanoon ya niyam:** CGST Act s.14: rate badalne ke aas-paas supply ka samay supply, invoice aur payment me se pehle wale se.
- **Kis pe laagu:** rate badalne ke din ke aas-paas ke orders.
- **Kis module me:** finance, orders (invoice).
- **System me kya chahiye:** invoice banne ke pal (dispatch, CL-003) ka rate; rate ghatne pe seller ko alert (D-086 niyam 4).
- **Dummy kya hai:** test me ek rate badlav ki tareekh.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.14 [T3, 2021 copy]; anti-profiteering (s.171) ki abhi ki haalat nahi khuli.

### CL-003. Invoice ka samay aur number

- **Kanoon ya niyam:** CGST Act s.31(1)(a): maal ke nikalne se pehle ya us waqt tax invoice. Rule 46: lagataar number, financial year me unique (16 characters tak); supplier ka naam, pata, GSTIN; HSN, value, rate, tax; registered recipient ka naam, pata, GSTIN.
- **Kis pe laagu:** har seller ka har order.
- **Kis module me:** orders (invoice), warehouse (dispatch scan).
- **System me kya chahiye:** invoice pack ya dispatch ke scan pe (D-239); pack se pehle cancel pe invoice nahi; har seller GSTIN aur financial year ki apni series; cancel hua number bhi record me.
- **Dummy kya hai:** seller ka dummy GSTIN; PDF pe "SPECIMEN" (D-145).
- **Jaancha ya nahi:** Jaancha (2026-11-19): s.31 [T3]; rule 46 [T6, purana flyer].

### CL-004. E-invoice

- **Kanoon ya niyam:** rule 48(4) (Notification 10/2023-CT, 1 Aug 2023 se): kisi bhi saal ₹5 crore se zyada turnover wale registered person ke B2B invoice pe e-invoice (IRN aur signed QR).
- **Kis pe laagu:** aisa seller, B2B (GSTIN wale) invoice.
- **Kis module me:** seller onboarding, orders (invoice).
- **System me kya chahiye:** seller profile me "e-invoice laagu" ka field (D-239); aise seller ke B2B invoice pe IRN aur QR ke fields.
- **Dummy kya hai:** dummy me IRP nahi; "DUMMY IRN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): sirf [T10].

### CL-005. Return pe credit note

- **Kanoon ya niyam:** CGST Act s.34: invoice ke baad maal lautaye ya value kam ho to supplier credit note deta hai; financial year ke baad 30 November (ya annual return) tak declare.
- **Kis pe laagu:** har return aur RTO.
- **Kis module me:** orders, finance.
- **System me kya chahiye:** seller ke GSTIN se, asli invoice number aur tareekh ke saath, apni series; 30 November ki seema ke baad wala maamla aaye to credit note nahi aur finance ko alert.
- **Dummy kya hai:** PDF pe "SPECIMEN" (D-145).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.34 [T3, 2021 copy me "September"]; 30 November aur 2025 ka badlav [T10].

### CL-006. Replacement (R2)

- **Kanoon ya niyam:** bina extra paise ke replacement pe GST ka tareeka: credit note + naya invoice, ya bina keemat ka replacement purane invoice ke reference ke saath.
- **Kis pe laagu:** R2 ka replacement (D-122).
- **Kis module me:** orders, finance.
- **System me kya chahiye:** tareeka CA se; data model dono sambhale.
- **Dummy kya hai:** test documents "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.34 [T3]; replacement wala CBIC circular nahi khula.

### CL-007. Discount

- **Kanoon ya niyam:** CGST Act s.15(3): supply se pehle ya us waqt invoice pe diya discount value me nahi judta; baad ka discount shart ke saath. Price se judi subsidy supplier ki value me judti hai (s.15(2)(e)).
- **Kis pe laagu:** brand ka discount (R1); platform ka discount (R2).
- **Kis module me:** orders (invoice), finance.
- **System me kya chahiye:** brand ka discount invoice pe line; platform ke discount ka ilaaj CA se; data me "customer ne diya" aur "platform ne diya" alag (D-101).
- **Dummy kya hai:** R2 ke test offers.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.15 [T3]; 56th Council ki salah [T1]; [T7].

### CL-008. Points ki chhoot (R2)

- **Kanoon ya niyam:** muft mile points khud supply nahi lagte; points se chhoot platform deta hai to CL-007 jaisa sawal.
- **Kis pe laagu:** R2 ke loyalty points (D-173, D-175).
- **Kis module me:** finance.
- **System me kya chahiye:** CL-007 ke saath CA se ek niyam; points ki liability ka khaata GST se alag.
- **Dummy kya hai:** R2 ke test points.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [T3], [T5] (sirf milta-julta tark).

### CL-009. Free samples

- **Kanoon ya niyam:** Circular 92/11/2019: bina consideration ke sample supply nahi, aur uske inputs pe ITC nahi (s.17(5)(h)); kharid ki shart wala "free" ek daam ki supply ho sakta hai.
- **Kis pe laagu:** brand ke samples aur gifts (R2, D-121).
- **Kis module me:** orders, warehouse, seller reports.
- **System me kya chahiye:** D-229; brand ko bheje gaye samples ki report (apna ITC ulatne ke liye).
- **Dummy kya hai:** R2 ke test samples.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): circular [T7, secondary]; s.17(5)(h) [T3].

### CL-010. Kit aur combo

- **Kanoon ya niyam:** CGST Act s.2(30), s.8(a): composite supply pe principal ka rate. s.2(74), s.8(b): mixed supply (alag bik sakne wali cheezein ek daam pe) pe sabse zyada rate.
- **Kis pe laagu:** brand ka kit (R1), combo (R2).
- **Kis module me:** catalog, orders (invoice).
- **System me kya chahiye:** D-228.
- **Dummy kya hai:** test me ek 5% + 18% ka kit, invoice pe 18%.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [T3]; kit aur combo pe laagu karna CA ka kaam.

### CL-011. Platform ki fees ka invoice

- **Kanoon ya niyam:** platform ki fees (commission, fulfilment, storage, disposal) seller ko taxable seva; seva ka tax invoice (s.31(2)). Related persons ke beech seva ki value ke alag niyam (s.15).
- **Kis pe laagu:** har seller, apna brand bhi.
- **Kis module me:** finance.
- **System me kya chahiye:** platform ke GSTIN se seller ko fees ka tax invoice (har payout ya mahine), har fee ki line, SAC aur rate table se; payout statement alag document; apne brand pe bhi wahi rate card.
- **Dummy kya hai:** platform ka dummy GSTIN; invoice "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.15, s.31(2) [T3]; [T1]; seva ka rate aur invoice ka samay (rule 47) primary se nahi.

### CL-012. Customer se delivery fee

- **Kanoon ya niyam:** local delivery (SAC 996813) pe GST; 1 Nov 2026 se delivery seva pe naya niyam (5% bina ITC, e-commerce operator ki s.9(5) zimmedari).
- **Kis pe laagu:** delivery fee wale orders (D-107).
- **Kis module me:** orders, finance.
- **System me kya chahiye:** fee ka platform ka alag B2C invoice (order pe ek); SAC aur rate CA se, rate table me tareekh ke saath (D-239).
- **Dummy kya hai:** invoice "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [T1]; naya badlav sirf [T10].

### CL-013. GST TCS

- **Kanoon ya niyam:** CGST Act s.52: e-commerce operator doosre suppliers ki net value pe TCS le; 0.25% CGST + 0.25% SGST (10 Jul 2024 se), IGST 0.5%. Net value = mahine ki taxable supplies minus usi mahine lautayi supplies. Jama aur mahine ka statement agle mahine ke 10 din me; saal ka statement 31 December tak. Operator aur us ke through bechne wale seller ka registration zaroori (s.24).
- **Kis pe laagu:** platform, har seller (apna brand bhi).
- **Kis module me:** finance.
- **System me kya chahiye:** har seller, har mahine net value aur TCS; payout me us mahine ki kaat; rate tareekh wali setting me; har warehouse state me TCS registration ka field (D-239); register aur export R2 (D-134).
- **Dummy kya hai:** platform ka dummy TCS registration ("DUMMY"); report "SPECIMEN".
- **Jaancha ya nahi:** Jaancha (2026-11-19): [T4]; s.24, s.52 [T3]; IGST rate secondary.

### CL-014. Income-tax TDS

- **Kanoon ya niyam:** Income-tax Act 2025 s.393(1) (pehle s.194-O): e-commerce operator gross bikri pe 0.1% TDS, seller ke khaate me credit ya payment, jo pehle ho; individual ya HUF seller ki saal ki bikri ₹5 lakh tak (PAN ya Aadhaar ke saath) ho to nahi.
- **Kis pe laagu:** platform, har seller.
- **Kis module me:** finance.
- **System me kya chahiye:** TDS ledger ke pehle credit pe (D-239); GST shaamil ho ya nahi, return pe ulat aur bina PAN ki rate CA se; rate setting me.
- **Dummy kya hai:** dummy PAN; report "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): sirf [T8].

### CL-015. Apna brand

- **Kanoon ya niyam:** alag company doosra supplier hai, to TCS (s.52) aur TDS laagu; dono companies related persons ho sakti hain (s.15).
- **Kis pe laagu:** apna brand "Unibelle" aur uski seller company (D-031, D-243).
- **Kis module me:** finance, seller onboarding.
- **System me kya chahiye:** koi alag raasta nahi: TCS, TDS aur fees invoice baaki sellers jaise; seller record pe "related party" ka field.
- **Dummy kya hai:** dummy company, dummy GSTIN aur PAN.
- **Jaancha ya nahi:** Jaancha (2026-11-19): TCS [T3]; TDS [T8, secondary].

### CL-016. Seller ka GST registration

- **Kanoon ya niyam:** CGST Act s.24(ix): e-commerce operator ke through bechne wale supplier ka registration zaroori; teesre paksh ka warehouse seller ke registration me "additional place of business" ki tarah.
- **Kis pe laagu:** har seller.
- **Kis module me:** seller onboarding.
- **System me kya chahiye:** onboarding me saboot ki warehouse ka pata seller ke registration me juda hai; staff jaanch (D-036, D-134 L2).
- **Dummy kya hai:** dummy GSTIN ke certificate ki dummy image.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.24 [T3]; "additional place of business" ka niyam nahi khula.

### CL-017. Kho gaya ya nasht maal

- **Kanoon ya niyam:** kho gaye, chori, nasht ya write-off maal pe ITC nahi (s.17(5)(h)); bharpai pe GST tabhi jab kuch karne ya na karne ka agreement ho.
- **Kis pe laagu:** warehouse me hamare haath ka nuksaan (D-063), disposal (D-062).
- **Kis module me:** finance, warehouse, seller reports.
- **System me kya chahiye:** seller ko har mahine aise units ki report batch ke saath; bharpai payout me alag "compensation" line, GST ka ilaaj CA se.
- **Dummy kya hai:** test me ek kho gaya batch; report "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.17(5)(h) [T3]; [T5]; bharpai wala circular nahi khula.

### CL-018. B2B invoice aur tax credit

- **Kanoon ya niyam:** registered recipient ke invoice pe naam, pata, GSTIN (rule 46); recipient ka credit invoice aur supplier ke return pe tika (s.16); delivery ke state ka tax.
- **Kis pe laagu:** GSTIN wale orders (D-065, D-092).
- **Kis module me:** checkout, orders (invoice).
- **System me kya chahiye:** invoice pe GSTIN, naam aur pata; doosre state ke GSTIN pe chetavni (D-239).
- **Dummy kya hai:** dummy GSTIN (CL-024).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [T6], s.16 [T3]; IGST s.10 nahi khola.

### CL-019. Ek parcel me kai sellers ke invoices

- **Kanoon ya niyam:** har supplier apna invoice deta hai (s.31); ek parcel me kai suppliers ke maal pe GST me rok nahi mili.
- **Kis pe laagu:** kai sellers wala order (D-077).
- **Kis module me:** warehouse (packing), orders.
- **System me kya chahiye:** parcel ke saath har seller ke invoice ki copy (print ya QR), parcel label pe kis invoice ke items.
- **Dummy kya hai:** test ka ek do-seller parcel.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.31 [T3]; raste ka document (e-way bill) doosre run me.

### CL-020. Invoice pe customer ka naam aur pata

- **Kanoon ya niyam:** rule 46(e): unregistered customer ke ₹50,000 ya zyada ke invoice pe naam, pata, delivery ka pata aur state.
- **Kis pe laagu:** B2C invoices.
- **Kis module me:** orders (invoice), seller ki invoice copy.
- **System me kya chahiye:** D-226.
- **Dummy kya hai:** test me ek ₹50,000 se upar ka order.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [T6]; ₹50,000 se kam wala hissa [T10].

### CL-021. Tax records ka samay

- **Kanoon ya niyam:** CGST Act s.36: records us saal ke annual return ki due date se 72 mahine; appeal, revision ya jaanch chale to us maamle ke records faisle ke 1 saal baad tak, ya 72 mahine, jo baad me.
- **Kis pe laagu:** invoices, credit notes, ledger, seller ke tax dastavez.
- **Kis module me:** finance, seller onboarding, account delete.
- **System me kya chahiye:** D-225, D-227; retention ki setting.
- **Dummy kya hai:** setting asli; data dummy.
- **Jaancha ya nahi:** Jaancha (2026-11-19): s.36 [T3]. Income-tax ke records ka samay: Jaancha nahi.

### CL-022. Gift voucher (R2)

- **Kanoon ya niyam:** Circular 243/37/2024: voucher ka len-den na maal ki supply hai na seva ki; GST us maal ya seva pe jiske liye istemaal hua; bina istemaal wale balance pe GST nahi.
- **Kis pe laagu:** R2 ke gift cards (D-179).
- **Kis module me:** finance, checkout.
- **System me kya chahiye:** gift card ki bikri "liability" ki entry, GST invoice nahi; istemaal pe order ka normal invoice, payment ka tareeka "gift card".
- **Dummy kya hai:** R2 ke test cards.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [T5] (GST). Prepaid (PPI) niyam kanooni jaanch ke doosre run me.

### CL-023. Consultation

- **Kanoon ya niyam:** GST supply ke liye aam taur pe consideration chahiye (s.7); muft seva pe GST ka sawal nahi.
- **Kis pe laagu:** consultation (D-172, muft).
- **Kis module me:** consultation.
- **System me kya chahiye:** abhi kuch nahi; paid ho to SAC aur rate CA se.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.7 [T3]; [T1].

### CL-024. Demo ke documents

- **Kanoon ya niyam:** CGST Act s.122(1)(ii): bina supply ke invoice jaari karna saza wala kaam.
- **Kis pe laagu:** demo site ke saare invoice, credit note aur statement.
- **Kis module me:** orders, finance, demo ka nishaan.
- **System me kya chahiye:** D-145 ke watermark aur "DUMMY" badge; dummy GSTIN ka check digit jaan-boojh ke galat (asli GSTIN kabhi na bane), PAN wala hissa saaf nakli pattern ka; PDF ke metadata me bhi "SPECIMEN".
- **Dummy kya hai:** yahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.122 [T3, 2021 copy]; GSTIN ke check digit ka format nahi jaancha.

## 2. Legal Metrology (D-245)

### 2.0 Sources (sab 2026-11-19 ko khole)

- **[M1]** Legal Metrology (Packaged Commodities) Rules 2011, 13 Feb 2026 tak ke badlav ke saath (har badlav ke G.S.R. number ke footnotes), ek law firm ki rakhi consolidated copy: <https://www.khaitanco.com/sites/default/files/2026-03/Legal%20Metrology%20%28Packaged%20Commodities%29%20Rules%202011.pdf>. Primary text, secondary host.
- **[M2]** Legal Metrology (Packaged Commodities) Amendment Rules 2026, G.S.R. 128(E), Gazette of India Extraordinary, 13 Feb 2026, doosri site pe rakhi copy: <https://foxmandal.in/wp-content/uploads/2026/02/Legal-Metrology-Packaged-Commodities-Amendment-Rules-2026.pdf>. Primary document, secondary host.
- **[M3]** GST rate badlav ke baad MRP sticker ki chhoot (Consumer Affairs vibhag ka 9 Sep 2025 ka circular, rule 33 ke tahat, aur 18 Sep 2025 ki narmi), sirf saar: <https://ssrana.in/articles/government-relaxes-lmpc-compliance-after-gst-rate-revisions/>, <https://www.businesstoday.in/amp/latest/economy/story/govt-allows-use-of-old-mrps-till-dec-but-firms-must-pass-on-gst-cuts-493267-2025-09-09>. Secondary.

### CL-025. MRP saare tax samet

- **Kanoon ya niyam:** rule 6(1)(e): har retail package pe MRP saare tax samet, rupees me. Rule 18(2): koi bhi MRP se zyada pe nahi bech sakta. Rule 18(5): retail dealer MRP mita, badal ya chhupa nahi sakta.
- **Kis pe laagu:** har listing aur har order.
- **Kis module me:** catalog, checkout.
- **System me kya chahiye:** server pe daam ≤ MRP ki jaanch (D-061, SR-042); MRP batch ka, pack se.
- **Dummy kya hai:** dummy products ke asli jaise MRP.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1].

### CL-026. Online declarations

- **Kanoon ya niyam:** rule 6(10): e-commerce entity rule 6(1) ki saari declarations (sirf mfg mahina-saal chhod ke) platform pe dikhaye. Declarations ke sahi hone ki zimmedari manufacturer, seller ya importer ki, agar platform jaankari na chune, na badle aur due diligence kare; jaankari milne pe turant na hataye to ye suraksha nahi.
- **Kis pe laagu:** har listing.
- **Kis module me:** catalog, product page.
- **System me kya chahiye:** listing ke zaroori fields: generic naam, net quantity, MRP, manufacturer, packer, marketer, importer aur country of origin (imported), size jahan laagu, kit me har cheez (D-134 L2). Product page pe "Pack ki jaankari" ka hissa. Staff khud field nahi badalta (D-098 niyam 3). Galat declaration ki report pe staff listing ko jaanch tak rok sake, wajah ke record ke saath.
- **Dummy kya hai:** dummy manufacturer ke naam aur pate, "DUMMY" ke saath (D-145).
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1].

### CL-027. Unit sale price

- **Kanoon ya niyam:** rule 6(11) (1 Jan 2024 se): pack pe unit sale price (1 kg ya 1 litre se kam pe per gram ya ml, zyada pe per kg ya litre, ginti wale pe per unit); MRP aur unit sale price barabar hon to nahi. Online ka saaf niyam nahi mila (rule 6(10) sirf rule 6(1) maangta hai).
- **Kis pe laagu:** product page aur cart.
- **Kis module me:** catalog, cart.
- **System me kya chahiye:** system se nikla unit sale price (MRP / net quantity), bina seller ke kaam ke; kits pe nahi.
- **Dummy kya hai:** dummy MRP aur quantity se.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1]; online ka niyam nahi mila, ye bhi jaancha.

### CL-028. Country of origin aur filter

- **Kanoon ya niyam:** rule 6(1)(aa): imported pe country of origin ya manufacture; online bhi (rule 6(10)). Rule 6(10A) (1 Jul 2026 se): imported products bechne wali e-commerce entity country of origin ka searchable aur sortable filter de.
- **Kis pe laagu:** imported products.
- **Kis module me:** catalog, search.
- **System me kya chahiye:** D-127, D-138, D-240.
- **Dummy kya hai:** test data me ek imported dummy product.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M2], [M1].

### CL-029. Manufacturer, packer, marketer, importer

- **Kanoon ya niyam:** rule 6(1)(a): manufacturer ka naam-pata; packer alag ho to dono; imported pe importer. Label pe brand owner marketer ho to wahi "deemed manufacturer"; bina "manufactured by" ya "packed by" ke naam wali company manufacturer maani jaati hai.
- **Kis pe laagu:** har listing; apna brand "Unibelle" contract manufacturer se banwaye to label pe marketer.
- **Kis module me:** catalog.
- **System me kya chahiye:** chaaron ke alag fields; staff label ki photo se milaye.
- **Dummy kya hai:** dummy naam.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1].

### CL-030. Customer care

- **Kanoon ya niyam:** rule 6(2): har package pe complaint ke liye naam, pata, telephone aur email. Online ke liye rule 6(10) rule 6(1) ki baat karta hai; rule 6(2) uske bahar.
- **Kis pe laagu:** har listing.
- **Kis module me:** catalog, product page.
- **System me kya chahiye:** pack wala customer care (naam, pata, email, phone) listing ka field, "Pack ki jaankari" me; phone sirf contact ke liye.
- **Dummy kya hai:** bahar ke dummy brand pe dummy ("DUMMY"); jahan kaam apna role karta hai, wahan asli (D-241).
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1].

### CL-031. Batch ka MRP aur revised MRP

- **Kanoon ya niyam:** rule 18(2-A): ek jaise package pe unfair trade practice se alag-alag MRP mana (alag batches ka alag MRP theek). Rule 18(3): tax ghatne pe manufacturer ka bataya kam MRP purane packs pe bhi. Rule 6(3): kam MRP ka sticker, asli MRP dhake bina. Sep 2025 ke GST badlav ke baad sticker ki chhoot (31 Dec 2025 tak).
- **Kis pe laagu:** har batch.
- **Kis module me:** catalog (batch), checkout, invoice.
- **System me kya chahiye:** D-064, D-231; customer ko "pack pe MRP ₹X; revised MRP ₹Y".
- **Dummy kya hai:** test me rate ghatne ki ek tareekh aur ek batch pe revised MRP.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1]; sticker ki chhoot Aadha jaancha [M3].

### CL-032. Online mfg date aur expiry

- **Kanoon ya niyam:** rule 6(10) online declarations se mfg mahina-saal bahar rakhta hai; cosmetics ki mfg date aur expiry Drugs and Cosmetics ke niyam se (rule 6(1)(d), 6(1)(da)).
- **Kis pe laagu:** har listing.
- **Kis module me:** product page.
- **System me kya chahiye:** D-067 (bheje jaane wale batch ki expiry) isse zyada deta hai; cosmetics ka label niyam cosmetics kanoon ke hisse me.
- **Dummy kya hai:** dummy batches ki expiry.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1].

### CL-033. Net quantity

- **Kanoon ya niyam:** rule 6(1)(c): net quantity standard unit (weight ya measure) me, ya ginti se; schedule me cosmetics ki entry.
- **Kis pe laagu:** har listing.
- **Kis module me:** catalog.
- **System me kya chahiye:** number + unit (g, ml ya ginti) ki tay list se; unit sale price isi se; badlav pe jaanch (D-098).
- **Dummy kya hai:** dummy data.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1].

### CL-034. Free samples ke pack

- **Kanoon ya niyam:** rule 26(a): 10 g ya 10 ml tak ke package pe ye rules laagu nahi. Bade "not for sale" sample ka saaf niyam nahi mila.
- **Kis pe laagu:** brand ke samples (R2, D-121, D-229).
- **Kis module me:** catalog, warehouse.
- **System me kya chahiye:** sample listing pe net quantity zaroori; bade sample pe CL-026 ke fields.
- **Dummy kya hai:** R2 ke test samples.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [M1].

### CL-035. Kit

- **Kanoon ya niyam:** rule 6(1)(b): ek package me kai products hon to har ek ka naam aur ginti ya quantity; rule 6(5): kai units ke components ki declaration main package pe.
- **Kis pe laagu:** brand ka kit (D-088).
- **Kis module me:** catalog, product page.
- **System me kya chahiye:** kit listing me har cheez ka naam aur net quantity, product page pe.
- **Dummy kya hai:** test ka ek kit.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1].

### CL-036. 10 g ya 10 ml tak ke packs

- **Kanoon ya niyam:** rule 26(a): 10 g ya 10 ml tak ke packages pe ye rules laagu nahi (MRP chhapna zaroori nahi). Cosmetics ke label ke niyam phir bhi.
- **Kis pe laagu:** minis aur chhote packs.
- **Kis module me:** catalog.
- **System me kya chahiye:** D-236.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1].

### CL-037. Veg ya non-veg dot

- **Kanoon ya niyam:** rule 6(8): soap, shampoo, toothpaste aur doosre cosmetics aur toiletries ke pack pe non-vegetarian origin ke liye laal ya bhura dot, vegetarian ke liye hara dot. Online ka saaf niyam nahi.
- **Kis pe laagu:** cosmetics aur toiletries.
- **Kis module me:** catalog.
- **System me kya chahiye:** listing pe "pack pe dot" ka field label ki photo se; staff "vegan" claim (D-100) aur laal dot ka takrav pakde.
- **Dummy kya hai:** dummy products pe.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1].

### CL-038. Pro buyers aur MRP

- **Kanoon ya niyam:** rule 2(bc), 3(c): "institutional consumer" ki chhoot sirf "not for retail sale" packs pe, jo seedha manufacturer, importer ya wholesale dealer se khud ke istemaal ke liye kharide jaayein. Retail packs pe MRP ki seema sab pe.
- **Kis pe laagu:** Beauty Pro buyers (D-065).
- **Kis module me:** catalog, checkout.
- **System me kya chahiye:** Pro kharid bhi retail packs ki, MRP ki seema sab pe; "not for retail sale" wale packs list nahi hote.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [M1].

## Change log

| Version | Date       | Badlav                                                                |
| ------- | ---------- | --------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                     |
| v1.1.1  | 2026-11-19 | §1 tax: CL-001 se CL-024, sources ke saath (D-244); file ka dhaancha. |
| v1.1.2  | 2026-11-19 | §2 Legal Metrology: CL-025 se CL-038, sources ke saath (D-245).       |
