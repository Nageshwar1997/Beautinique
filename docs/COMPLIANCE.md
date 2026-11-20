# COMPLIANCE: Beautinique

> **Status:** v1.1.4 (2026-11-19). Kanooni matrix. System me sab poori tarah banta hai, par registrations aur bahar ki companies ki details dummy hain (D-026); apne roles ki jaankari asli (D-241). Kisi lawyer ya CA se jaancha nahi (R-004). Cheezein ek-ek karke, owner ki haan se, judti hain (D-220).

## Is file me kya aayega

- Har row (CL-xxx): **Kanoon ya niyam**, **Kis pe laagu**, **Kis module me**, **System me kya chahiye**, **Dummy kya hai**, **Jaancha ya nahi** (source aur tareekh ke saath).
- **Jaancha** = public source khol ke milaaya (tareekh ke saath). **Aadha jaancha** = sirf secondary source, ya sarkari text ki purani copy. **Jaancha nahi** = source nahi khula. Lawyer ya CA se kuch nahi jaancha (R-004).
- Rows area ke hisaab se batches me aati hain (D-220): §1 tax, §2 Legal Metrology, §3 cosmetics kanoon, §4 e-commerce aur consumer kanoon. Personal data, payments, gig workers jaise areas kanooni jaanch ke doosre run ke baad.
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

## 3. Cosmetics kanoon (D-246)

### 3.0 Sources (sab 2026-11-19 ko khole)

- **[K1]** Cosmetics Rules 2020 (G.S.R. 763(E), 15 Dec 2020), CDSCO: <https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2022/cos_rules/Cosmetics%20Rules%202020.pdf>. Primary, par mool 2020 ka text; baad ke badlav isme nahi.
- **[K2]** CDSCO: "Frequently Asked Questions on Registration and Import of Cosmetics into India" (isme Drugs and Cosmetics Act 1940 ki s.3(aaa) ka text): <https://www.cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/cosmetics/Frequently-Asked-Questions-FAQcosmeticia.pdf>. Primary (sarkari FAQ; khud kanoon nahi).
- **[K3]** Cosmetics (Amendment) Rules 2025 (G.S.R. 513(E), 29 Jul 2025), sirf saar: <https://www.indialaw.in/blog/regulatory/cosmetics-rules-2025-new-norms-for-labels-licensing/>, <https://www.mondaq.com/india/healthcare/1662676/cosmetics-amendment-rules-2025-enhancing-labelling-licensing-and-oversight>. Secondary.
- **[K4]** Consumer Protection Act 2019, 13 Oct 2023 tak ke badlav ke saath, ek law firm ki rakhi consolidated copy: <https://www.khaitanco.com/sites/default/files/2026-03/Consumer%20Protection%20Act%2C%202019.pdf>. Primary text, secondary host.

### CL-039. Label ke zaroori fields

- **Kanoon ya niyam:** rule 33, 34: naam; manufacturer ka naam aur pata; batch number; manufacturing licence (M.L.) number, ya imported pe registration (RC) number aur importer; net contents; expiry ki jaankari; ingredients; khatre wale products pe chetavni. Indian cosmetic sirf licensed manufacturer ka bana aur sahi label wala hi bik sakta hai.
- **Kis pe laagu:** har cosmetic listing.
- **Kis module me:** catalog (listing ki jaanch).
- **System me kya chahiye:** label ki photo se in fields ki checklist, category ke hisaab se (CL-056 ke khaas products samet) (D-099, D-128).
- **Dummy kya hai:** dummy label images asli jaise dhaanche ke; numbers "DUMMY" (D-145).
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1].

### CL-040. Expiry ki jaankari zaroori

- **Kanoon ya niyam:** rule 34(1)(c): "use before" ya "date of expiry" (mahina aur saal), "use by", ya mfg date + "XX mahine tak"; sirf PAO kaafi nahi. Rule 3(w): use before = wo tareekh jab tak cosmetic, likhe storage me, apne gun rakhta hai. Rule 18(2): imported cosmetic ki use before import ki tareekh se kam se kam 6 mahine baad.
- **Kis pe laagu:** har batch.
- **Kis module me:** warehouse (receiving), catalog.
- **System me kya chahiye:** D-083; receiving pe expiry ka roop (D-232); imported batch pe 6 mahine ki seema ki chetavni staff ko (brand ki zimmedari).
- **Dummy kya hai:** dummy batches me teeno roop.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1], [K2].

### CL-041. "Use before" aur "expiry" ka din

- **Kanoon ya niyam:** 2025 ke badlav se rule 3(w): "use before" ek mahine ka ho to us mahine ka pehla din, "date of expiry" us mahine ka aakhri din.
- **Kis pe laagu:** har batch.
- **Kis module me:** warehouse, catalog, finance (expiry ki seemaayein).
- **System me kya chahiye:** D-232.
- **Dummy kya hai:** test me dono roop.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): sirf [K3].

### CL-042. Batch number kab nahi hota

- **Kanoon ya niyam:** rule 34(2)(a): 10 g ya 25 ml tak ke cosmetic pe batch number zaroori nahi; soap pe batch ki jagah banne ka mahina aur saal.
- **Kis pe laagu:** chhote packs aur soap.
- **Kis module me:** warehouse, returns, delivery (pickup).
- **System me kya chahiye:** D-234.
- **Dummy kya hai:** test me ek soap aur ek mini.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1].

### CL-043. Ingredients aur allergens

- **Kanoon ya niyam:** rule 34(7): "INGREDIENTS" ke baad 1% se zyada wale wazan ya volume ke ghatte kram me, phir baaki kisi bhi kram me; 60 ml ya 30 g tak ke packs pe label pe zaroori nahi. Online ka alag niyam nahi mila; allergen ka koi niyam nahi mila.
- **Kis pe laagu:** har cosmetic listing.
- **Kis module me:** catalog, product page.
- **System me kya chahiye:** D-099, D-159 (kanoon se zyada), D-235; allergen chetavni ke saath line: "ye platform ki list se hai; pack ki ingredients list dekhein".
- **Dummy kya hai:** dummy ingredients.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1].

### CL-044. Imported cosmetics

- **Kanoon ya niyam:** rule 12: CDSCO (Central Licensing Authority) ke registration ke bina import nahi (Form COS-1). Rule 14: registration tab tak valid jab tak har 5 saal se pehle retention fee bhari jaaye. Rule 18: apne desh me mana product, hexachlorophene wala, ya 12 Nov 2014 ke baad animals pe test hua import nahi. Rule 34(5), 34(9): label pe RC number aur RC holder ka naam-pata; India wala label bonded warehouse me sticker se lag sakta hai.
- **Kis pe laagu:** imported products.
- **Kis module me:** catalog, seller onboarding.
- **System me kya chahiye:** D-127; imported listing pe RC number, RC holder ka naam, product RC me listed hone ki seller ki ghoshna, aur retention ki agli tareekh ki staff ko yaad; label ki photo pe "RC No." ki jaanch.
- **Dummy kya hai:** dummy RC number "DUMMY".
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1], [K2].

### CL-045. Licence ka type aur M.L. number

- **Kanoon ya niyam:** rules 23 se 30: Indian cosmetics licence ya loan licence pe bante hain (State Licensing Authority). Rule 34(2)(b): label pe M.L. number. Rule 26(f): batch ke records batch ki expiry ke 3 saal baad tak licensee ke paas.
- **Kis pe laagu:** Indian cosmetics; apna brand "Unibelle" contract manufacturer se banwaye to us manufacturer ka M.L. number.
- **Kis module me:** catalog, seller onboarding.
- **System me kya chahiye:** D-128; licence ka type "cosmetic manufacturing licence ya loan licence"; M.L. number label ki photo se staff jaanche.
- **Dummy kya hai:** dummy M.L. number.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1].

### CL-046. Cosmetic aur drug ki seema, aur claims ke shabd

- **Kanoon ya niyam:** Act s.3(aaa): cosmetic = shareer pe lagane ki cheez saaf karne, sundar banane, aakarshan badhane ya roop badalne ke liye. Drug claim wala product cosmetic nahi, aur cosmetic ki tarah register nahi ho sakta. Rule 36: koi cosmetic jhootha ya gumraah karne wala daawa nahi kar sakta.
- **Kis pe laagu:** har listing ka naam, description, claims aur concern; seller ka content.
- **Kis module me:** catalog (listing ki jaanch), reviews (brand ka jawab).
- **System me kya chahiye:** D-043, D-128, D-137; "mana shabdon" ki list (jaise treat, cure, heal, bimari se bachav) jo description ke free text (D-100 niyam 4) me bhi staff ki queue me bheje; list ka badlav sirf senior role, wajah ke saath, D-132 jaisa.
- **Dummy kya hai:** test listing me ek mana shabd.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K2], rule 36 [K1].

### CL-047. Ayurvedic aur AYUSH beauty products

- **Kanoon ya niyam:** Act me Ayurvedic, Siddha aur Unani drugs alag category (drug); product ka darja licence aur daawe se, naam se nahi.
- **Kis pe laagu:** herbal ya Ayurvedic naam wale products.
- **Kis module me:** catalog.
- **System me kya chahiye:** D-128; label pe "Ayurvedic medicine" ya AYUSH licence number dikhe to staff use drug type maane, chahe seller ne cosmetic chuna ho.
- **Dummy kya hai:** test me ek herbal cosmetic aur ek AYUSH drug label (reject).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [K2]; AYUSH licence ke niyam nahi khule.

### CL-048. Cosmetic me mana ingredients

- **Kanoon ya niyam:** rule 39: IS 4707 Part 2 Annex A ke raw materials cosmetic me nahi; rang sirf IS 4707 Part 1, Part 2 aur Tenth Schedule wale, heavy metals ki seema ke saath; hexachlorophene mana (soap me 1% tak, chetavni ke saath); mercury ki seema; rang ke liye lead aur arsenic compounds mana.
- **Kis pe laagu:** har cosmetic listing.
- **Kis module me:** catalog (blocklist).
- **System me kya chahiye:** D-240 (blocklist ke do hisse, har entry pe source).
- **Dummy kya hai:** blocklist ki shuruaati list "source baaki" ke nishaan ke saath.
- **Jaancha ya nahi:** Jaancha (2026-11-19): rule 39 [K1]. IS 4707 Part 2 ki list: Jaancha nahi.

### CL-049. Animals pe testing

- **Kanoon ya niyam:** rule 39(7): cosmetics ki testing ke liye animal ka istemaal mana. Rule 18(4): 12 Nov 2014 ke baad animals pe test hua cosmetic import nahi.
- **Kis pe laagu:** "cruelty-free" claim (D-100).
- **Kis module me:** catalog (claims aur filters).
- **System me kya chahiye:** claim ka naam "certified cruelty-free (certifier ka naam)", sirf certificate ke saath; filter ka naam bhi yahi, kyunki India me har cosmetic ki animal testing pehle se mana hai.
- **Dummy kya hai:** dummy certificate.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1], [K2].

### CL-050. Recall

- **Kanoon ya niyam:** rule 65: manufacturer ya authorised agent ko lage ki cosmetic sehat ke liye khatarnak ho sakta hai to turant recall shuru kare, wajah bataye aur licensing authority ko suchna de. Rule 47: inspector ke "stock mat becho" order ke baad bikri mana. Consumer Protection Act s.20: CCPA recall aur paisa wapas dilane ka order de sakti hai. Customer ko suchna ka tay samay nahi mila.
- **Kis pe laagu:** brand ya regulator ka recall.
- **Kis module me:** catalog, warehouse, seller app, khabrein.
- **System me kya chahiye:** D-129, D-131, D-240 (recall emails pehle); seller app me recall pe "regulator ko suchna di: haan ya nahi, tareekh, reference" ka field.
- **Dummy kya hai:** dummy recall aur dummy reference number.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1], s.20 [K4].

### CL-051. Skin reaction ki report

- **Kanoon ya niyam:** marketplace pe adverse event report ka saaf niyam nahi mila; manufacturer ya authorised agent ko unsafe hone ki wajah lage to authority ko suchna (rule 65(2)).
- **Kis pe laagu:** skin reaction ki shikayat (D-130).
- **Kis module me:** support, seller app.
- **System me kya chahiye:** brand ko case ki khabar bina customer ki pehchaan ke (product, batch, kya hua, ginti), aur brand ka jawab ("authority ko bataya: haan ya nahi") case me.
- **Dummy kya hai:** dummy cases.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1] (niyam ka na hona bhi padh ke dekha).

### CL-052. Lautaye band cosmetics dobara bechna

- **Kanoon ya niyam:** saaf rok nahi mili. Laagu: label ki jaankari badalna mana (rule 35); use before likhe storage ke hisaab se (rule 3(w)); maintain ya inspect me laparwahi pe product seller zimmedar (Consumer Protection Act s.86).
- **Kis pe laagu:** lautaya band maal (D-112).
- **Kis module me:** returns, warehouse.
- **System me kya chahiye:** returns ki jaanch me ek aur check: label pe storage ki shart wala product (jaise sunscreen, perfume) aur parcel kitne din customer ke paas raha; shak ho to stock me nahi, brand ko. Har dobara stock hue unit ka record (D-112).
- **Dummy kya hai:** test returns.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [K1], s.86 [K4]; rok na milna lawyer se pakka karna.

### CL-053. Expired cosmetics

- **Kanoon ya niyam:** "expiry ke baad mat becho" jaisa seedha vakya rules me nahi mila; par use before ke baad product standard ke gun na rakhne ka jokhim (rule 3(w)). Act ki s.18 primary se nahi khuli.
- **Kis pe laagu:** har batch.
- **Kis module me:** warehouse (pick, dispatch), checkout (reservation).
- **System me kya chahiye:** D-062, D-082; expired batch kabhi reserve ya dispatch nahi; pick aur dispatch scan pe bhi expiry ki jaanch (D-232 ke aakhri din se).
- **Dummy kya hai:** test me ek expired batch, dispatch pe rok.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [K1].

### CL-054. Bechne ka licence

- **Kanoon ya niyam:** Cosmetics Rules me licence sirf banane (aur loan licence) aur import registration ke liye; bechne ya rakhne ka alag licence nahi; bechne ki shart rule 33.
- **Kis pe laagu:** platform aur warehouse.
- **Kis module me:** kuch nahi.
- **System me kya chahiye:** kuch nahi (D-014, D-043, D-060). Warehouse ke baaki registrations kanooni jaanch ke doosre run me.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1].

### CL-055. Label na badalna

- **Kanoon ya niyam:** rule 35: manufacturer ke container, label ya wrapper ki likhawat badalna, mitana ya bigaadna mana.
- **Kis pe laagu:** platform ka barcode label (D-097), warehouse.
- **Kis module me:** warehouse (receiving).
- **System me kya chahiye:** D-230.
- **Dummy kya hai:** test me photo.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1].

### CL-056. Khaas products

- **Kanoon ya niyam:** rule 37: dyes wale hair dye ke label ke khaas niyam; rule 38: fluoride wale toothpaste ke khaas niyam, expiry tube aur carton dono pe; rule 34(4): khatre wale cosmetics pe istemaal ka tareeka aur chetavni.
- **Kis pe laagu:** hair dye, fluoride toothpaste aur khatre wale products.
- **Kis module me:** catalog (listing ki jaanch), product page.
- **System me kya chahiye:** in categories ki listing checklist me unke khaas fields; chetavni ka text label ki photo se, product page pe bhi.
- **Dummy kya hai:** dummy hair dye listing.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [K1].

### CL-057. Samples ka label

- **Kanoon ya niyam:** samples ki alag chhoot nahi mili; sample bhi cosmetic hai, to rule 34, chhote packs ki chhooton ke saath. Twelfth Schedule ki chhooten nahi padhi.
- **Kis pe laagu:** brand ke samples (R2, D-121).
- **Kis module me:** catalog, warehouse.
- **System me kya chahiye:** sample bhi label ki photo se jaanch, chhote pack ki chhooton ke saath (D-234, D-235).
- **Dummy kya hai:** R2 ke test samples.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [K1].

### CL-058. Reviews aur seller ke content me ilaaj jaise daawe

- **Kanoon ya niyam:** rule 36 aur drug claim ka niyam product ke daawe (manufacturer ya seller) ki baat karte hain; customer ki raay pe saaf niyam nahi mila.
- **Kis pe laagu:** reviews (D-146), brand ka jawab (D-160), seller ka content.
- **Kis module me:** reviews, catalog.
- **System me kya chahiye:** brand ka jawab aur seller ka content CL-046 ki "mana shabdon" ki list se moderation me; customer ki raay D-146 niyam 4 jaisi.
- **Dummy kya hai:** demo reviews pe "Demo review" (D-145).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [K1], [K2]; objectionable advertisements ka alag kanoon nahi khola.

## 4. E-commerce aur consumer kanoon (D-247)

### 4.0 Sources (sab 2026-11-19 ko khole)

- **[E1]** Consumer Protection (E-Commerce) Rules 2020 (G.S.R. 462(E), 23 Jul 2020), gazette ka text, PRS India ki rakhi copy: <https://prsindia.org/files/bills_acts/bills_parliament/2021/Consumer%20Protection%20(E-Commerce)%20Rules,%202020.pdf>. Primary document, secondary host; mool 2020 ka text.
- **[E2]** Consumer Protection Act 2019: wahi copy jo [K4].
- **[E3]** Consumer Protection (E-Commerce) (Amendment) Rules 2026 (G.S.R. 789(E), 9 Sep 2026; laagu 1 Jan 2027), saar: <https://www.taxheal.com/?p=140665>. Secondary; gazette nahi khula, aur kai naye sub-rules ka number source me nahi.
- **[E4]** Guidelines for Prevention and Regulation of Dark Patterns 2023 (CCPA, 30 Nov 2023), text doosri site pe: <https://taxguru.in/?p=896142>. Secondary.
- **[E5]** Guidelines for Prevention of Misleading Advertisements and Endorsements 2022 (CCPA, 9 Jun 2022): sirf search ke nateejon ka saar. Secondary.

### CL-059. Platform ki jaankari aur nodal person

- **Kanoon ya niyam:** rule 4(1): e-commerce entity company ho aur India me rehne wala nodal person rakhe. Rule 4(2): legal naam, headquarters aur branches ka pata, website ka naam, customer care aur grievance officer ke contact platform pe. Rule 4(6): imported maal pe importer ka naam. National Consumer Helpline ke saath judna: 2020 me "best effort", 2027 se zaroori.
- **Kis pe laagu:** platform company (Beautinique Pvt Ltd).
- **Kis module me:** legal pages, staff roles.
- **System me kya chahiye:** About ya Contact page pe rule 4(2) ki saari jaankari; nodal person aur grievance officer apne staff roles (D-237); National Consumer Helpline ka field.
- **Dummy kya hai:** company ka naam, pata aur registrations dummy; customer care, grievance officer aur nodal person ki jaankari asli, role wale staff account se (D-241).
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1]; 2027 wala hissa [E3, secondary].

### CL-060. Seller ki jaankari aur seller ka grievance officer

- **Kanoon ya niyam:** rule 5(3)(a): kharid se pehle seller ka business naam, registered hai ya nahi, pata, customer care number, rating; kharid ke baad likhit request pe poora pata, website, email. Rule 6(4): seller ka platform ke saath likhit contract, apna grievance officer (48 ghante me receipt, ek mahine me hal), aur legal naam, pata, GSTIN, PAN platform ko. Rule 6(5): seller total daam ka breakup, expiry date, country of origin, grievance officer, importer, return ki shartein aur kharcha, delivery aur warranty de. 2027 se GSTIN ya MSME number jaisa sarkari number bhi.
- **Kis pe laagu:** har seller.
- **Kis module me:** seller onboarding, product page.
- **System me kya chahiye:** D-238; seller profile me legal naam, pata, customer care, grievance officer, GSTIN (aur MSME number agar ho), website; seller agreement likhit contract, version ke saath (D-150).
- **Dummy kya hai:** bahar ke dummy seller ki dummy jaankari ("DUMMY"); apne brand pe jahan apna role, wahan asli (D-241).
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1]; 2027 wala hissa [E3].

### CL-061. Return policy dikhana

- **Kanoon ya niyam:** rule 5(3)(c): return, refund, exchange, warranty, delivery, payment ke tareeke aur grievance ki jaankari saaf; 2027 se best-before ya use-before bhi. Rule 6(5)(g): return ki shartein aur return shipping ka kharcha. "Man badla" return kanoon me zaroori nahi mila.
- **Kis pe laagu:** har listing aur return policy page.
- **Kis module me:** product page, legal pages.
- **System me kya chahiye:** product page pe return ki line ("seal aata hai: man badla 7 din" ya "seal nahi: sirf galti pe") aur return ka kharcha; numbers settings se (D-079, D-114, D-150 niyam 4, D-221).
- **Dummy kya hai:** settings ke misaal wale number.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1]; 2027 wala hissa [E3].

### CL-062. Kharab maal pe haq aur muddat

- **Kanoon ya niyam:** rule 6(3): kharab, nakli ya "jaisa dikhaya waisa nahi" maal pe seller return ya refund se mana nahi kar sakta, koi muddat nahi likhi. Act s.2(47)(viii): bill pe likhi muddat, warna 30 din. Shikayat ki muddat 2 saal (s.69).
- **Kis pe laagu:** har order.
- **Kis module me:** returns, invoice, legal pages.
- **System me kya chahiye:** D-221.
- **Dummy kya hai:** settings ke number.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1], [E2].

### CL-063. Refund ka samay

- **Kanoon ya niyam:** rule 4(10): maane gaye refund ka paisa RBI ya authority ke tay samay me, ya "reasonable period" me. Kharab maal ka refund bill ki muddat ya 30 din me (Act s.2(47)(viii)).
- **Kis pe laagu:** har refund.
- **Kis module me:** returns, finance, order page.
- **System me kya chahiye:** return ke refund ka tay vaada ("pickup se X kaam ke din me", setting), order page pe (D-111, D-115). RBI ke samay ke niyam kanooni jaanch ke doosre run me.
- **Dummy kya hai:** test mode refunds.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1], [E2].

### CL-064. Grievance officer, receipt aur hal

- **Kanoon ya niyam:** rule 4(4), 4(5): grievance officer ka naam, contact aur designation platform pe; receipt 48 ghante me, hal ek mahine me. Rule 5(3)(b): har shikayat ka ticket number. Rule 6(4)(b): seller ka bhi grievance officer. 2027 se receipt ke saath shikayat ki recorded copy.
- **Kis pe laagu:** saari shikayatein.
- **Kis module me:** support (grievance), legal pages.
- **System me kya chahiye:** D-163, D-237, D-238.
- **Dummy kya hai:** kuch nahi; officer ki jaankari asli (D-237).
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1]; recorded copy wala hissa [E3].

### CL-065. Daam ka khel aur customers me bhed

- **Kanoon ya niyam:** rule 4(11)(a): bina wajah zyada munafe ke liye daam ka khel mana. Rule 4(11)(b): ek hi class ke customers me bhed, ya manmani classification mana.
- **Kis pe laagu:** Pro daam (D-065), suvidha band karne ke niyam (D-109, D-116).
- **Kis module me:** pricing, checkout, legal pages.
- **System me kya chahiye:** Pro buyers jaanchi hui class (D-069); Pro ki shartein public page pe; "suvidha band" ke niyam policy page pe.
- **Dummy kya hai:** test Pro account.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1].

### CL-066. Kram aur sponsored

- **Kanoon ya niyam:** rule 5(3): kram ke mukhya gun aur unka mahatva saral shabdon me public page pe; 2027 se mahatva ke ghatte kram me. Rule 5(4): sellers ke saath "differentiated treatment" ka varnan. 2027 se search ko gumraah karne ke liye na badalna, aur sponsored ka saaf nishaan. Dark patterns me "disguised advertisement" mana.
- **Kis pe laagu:** search, category, sujhaav.
- **Kis module me:** search, legal pages, seller agreement.
- **System me kya chahiye:** D-139; kram ke page pe gun mahatva ke kram me; seller agreement me "koi differentiated treatment nahi, apna brand bhi isi niyam me"; sponsored (R2) ka label har jagah.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1], [E4]; 2027 wale hisse [E3].

### CL-067. Platform ke naam jaisa seller aur customer data

- **Kanoon ya niyam:** 2027 se rule 5(6): platform ke naam jaise naam wale seller ko bechne ya promote karne me customer ka data sirf express consent se.
- **Kis pe laagu:** apna brand.
- **Kis module me:** sujhaav, marketing.
- **System me kya chahiye:** apne brand ka naam "Unibelle", platform se alag (D-243), to laagu nahi; seller record pe "related party" ka field (CL-015).
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): sirf [E3].

### CL-068. Product liability

- **Kanoon ya niyam:** Act s.2(17), s.2(37): product seller me package, label ya maintain karne wala bhi, aur online marketplace electronic service provider. s.86: manufacturer na ho to bhi product seller zimmedar agar inspect ya maintain me laparwahi ki, ya chetavni aage na di.
- **Kis pe laagu:** platform (maal rakhta, jaanchta, label lagata hai).
- **Kis module me:** warehouse, returns, product page.
- **System me kya chahiye:** warehouse ke niyam likhit (storage ki shart, pehle expire wala pehle, quarantine, returns ki jaanch) aur har kadam ka record; chetavni wale products ki chetavni product page pe (CL-056).
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E2], rule 5(1) [E1].

### CL-069. Seller ka undertaking

- **Kanoon ya niyam:** rule 5(2): sellers se undertaking ki content sahi hai aur maal se mel khata hai. Rule 6(4)(c): seller ke vigyapan maal ki asliyat se mel khaayein.
- **Kis pe laagu:** har seller, har listing.
- **Kis module me:** seller onboarding, catalog.
- **System me kya chahiye:** D-240.
- **Dummy kya hai:** test listing.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1].

### CL-070. Jhoothi jaldi

- **Kanoon ya niyam:** dark patterns me "false urgency": jhoothi kami ya jaldi ka ehsaas (jaise jhootha "kam stock" ya jhootha time-limited sale).
- **Kis pe laagu:** product page, cart, offers.
- **Kis module me:** catalog, promotions.
- **System me kya chahiye:** D-154; "kam stock" ka number aur niyam audit ke liye log me.
- **Dummy kya hai:** test stock.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [E4].

### CL-071. Chhupe charges aur basket sneaking

- **Kanoon ya niyam:** dark patterns me "drip pricing" (daam ke hisse chhupana, aakhri charge me farak) aur "basket sneaking" (bina consent cart me cheez ya paid extra). Rule 6(5)(b): total daam ka breakup, delivery samet.
- **Kis pe laagu:** cart aur checkout.
- **Kis module me:** cart, checkout.
- **System me kya chahiye:** D-107; delivery fee alag line me, order se pehle; server ka total aur dikha total na mile to order nahi (SR-044).
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [E4], rule 6(5)(b) [E1].

### CL-072. Saaf consent

- **Kanoon ya niyam:** rule 4(9): kharid ki consent sirf saaf aur affirmative action se; pehle se tick box consent nahi. Dark patterns me "trick question" aur "nagging".
- **Kis pe laagu:** har checkbox aur consent.
- **Kis module me:** saare apps (UX), QA.
- **System me kya chahiye:** koi checkbox pehle se tick nahi; "Haan" aur "Nahi" barabar dikhen; QA ka test (D-141, D-150, D-155).
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1], [E4].

### CL-073. Dark patterns ka saal ka audit

- **Kanoon ya niyam:** 2027 se har e-commerce entity Dark Patterns Guidelines maane, saal me self-audit kare aur certificate saaf dikhaye.
- **Kis pe laagu:** platform.
- **Kis module me:** legal pages, admin.
- **System me kya chahiye:** D-240.
- **Dummy kya hai:** certificate "DUMMY: self-audit, lawyer se jaancha nahi".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): sirf [E3].

### CL-074. Discount aur pehle ka daam

- **Kanoon ya niyam:** Act s.2(47)(i)(i): aam daam ke baare me gumraah karna unfair trade practice. 2027 se daam kam karne ke elaan ke saath "prior price" (pichhle 30 din ka sabse kam daam).
- **Kis pe laagu:** har discount display.
- **Kis module me:** product page, cart.
- **System me kya chahiye:** D-223.
- **Dummy kya hai:** test data me daam ka itihaas.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [E2]; 2027 wala hissa [E3].

### CL-075. Claims aur gumraah karne wale vigyapan

- **Kanoon ya niyam:** Act s.2(28): misleading advertisement. s.2(47)(i)(g): asar ya performance ki guarantee jo theek test pe na tiki ho, unfair trade practice; saboot ka bojh daawa karne wale pe. s.21: CCPA ki penalty. 2022 ki guidelines.
- **Kis pe laagu:** claims aur description.
- **Kis module me:** catalog.
- **System me kya chahiye:** D-224.
- **Dummy kya hai:** dummy test reports.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E2]; guidelines [E5, secondary].

### CL-076. Endorsement aur influencers

- **Kanoon ya niyam:** 2022 ki guidelines: endorsement asli aur taaza raay ho; influencer brand ke saath "material connection" saaf bataye.
- **Kis pe laagu:** reviews (D-158), Creator ka content (R2).
- **Kis module me:** reviews, Creator.
- **System me kya chahiye:** inaam wala review nahi (D-158); Creator ke har content pe "Ad / Sponsored / Collab" ka label system se, jo hataya na ja sake.
- **Dummy kya hai:** R2 me.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [E5]; s.21 [E2].

### CL-077. Nakli reviews

- **Kanoon ya niyam:** rule 6(2): seller khud ko customer bata ke review nahi post kar sakta. Rule 4(3): koi unfair trade practice nahi. Online reviews ka BIS standard (IS 19000, voluntary) nahi khola.
- **Kis pe laagu:** reviews.
- **Kis module me:** reviews.
- **System me kya chahiye:** D-146, D-156.
- **Dummy kya hai:** demo reviews (D-145 niyam 6).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [E1]; IS 19000 nahi dekha.

### CL-078. Cancel pe charge

- **Kanoon ya niyam:** rule 4(8): customer pe cancel ka charge tabhi jab platform bhi apne cancel pe waisa charge uthaye.
- **Kis pe laagu:** order cancel.
- **Kis module me:** orders.
- **System me kya chahiye:** D-110 (koi cancel fee nahi).
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1].

### CL-079. Demo store

- **Kanoon ya niyam:** Act s.2(47)(ii): aise daam ka vigyapan jis pe bechne ka iraada hi na ho; dark patterns me "bait and switch". Demo site pe saaf niyam nahi mila.
- **Kis pe laagu:** live demo site.
- **Kis module me:** saare apps.
- **System me kya chahiye:** D-133, D-145; product page aur checkout pe bhi demo ki patti.
- **Dummy kya hai:** yahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [E2], [E4].

### CL-080. Legal pages

- **Kanoon ya niyam:** rules 4, 5, 6: platform aur grievance officer ki jaankari; return, refund, exchange, warranty, delivery, payment ke tareeke, fees aur charge-back; kram ke gun; seller terms; seller ki jaankari. Privacy aur user agreement ke niyam doosre run me.
- **Kis pe laagu:** platform.
- **Kis module me:** legal pages.
- **System me kya chahiye:** D-150, D-240, aur About ya Contact (CL-059).
- **Dummy kya hai:** har page pe "DUMMY: lawyer se jaancha nahi" (D-150 niyam 2).
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1].

### CL-081. Points ki expiry aur suchna

- **Kanoon ya niyam:** source nahi khula.
- **Kis pe laagu:** R2 ke loyalty points (D-174).
- **Kis module me:** loyalty.
- **System me kya chahiye:** kanooni jaanch ke doosre run me prepaid niyamon ke saath.
- **Dummy kya hai:** R2 me.
- **Jaancha ya nahi:** Jaancha nahi.

### CL-082. Recall pe customers ko suchna

- **Kanoon ya niyam:** Act s.20: CCPA khatarnak maal ka recall aur paisa wapas dilane ka order de sakti hai. Customer ko suchna ka tay samay nahi mila (Cosmetics Rules rule 65 me bhi nahi).
- **Kis pe laagu:** recall.
- **Kis module me:** khabrein, orders.
- **System me kya chahiye:** D-129, D-131, D-240 (CL-050).
- **Dummy kya hai:** dummy recall.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E2], [K1].

### CL-083. Der se delivery

- **Kanoon ya niyam:** rule 6(3): maal "stated delivery schedule" se der se pahunche to seller return ya refund se mana nahi kar sakta (force majeure chhod ke).
- **Kis pe laagu:** har order.
- **Kis module me:** delivery, returns.
- **System me kya chahiye:** D-222.
- **Dummy kya hai:** test me ek der wala order.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1].

### CL-084. Invoice pe seller ka naam

- **Kanoon ya niyam:** 2027 se invoice pe seller ka naam saaf aur prominent, platform ke naam ke barabar font me.
- **Kis pe laagu:** har invoice.
- **Kis module me:** orders (invoice).
- **System me kya chahiye:** invoice template me seller ka naam sabse upar, platform ka naam usse bada nahi.
- **Dummy kya hai:** specimen invoice.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): sirf [E3].

### CL-085. Baar-baar ullanghan wale sellers

- **Kanoon ya niyam:** rule 5(5): marketplace un sellers ki pehchaan ka record rakhne ki koshish kare jinke maal Copyright Act, Trade Marks Act ya IT Act ke tahat pehle hataye gaye.
- **Kis pe laagu:** listing hatana.
- **Kis module me:** catalog, seller onboarding.
- **System me kya chahiye:** listing hatane ki wajahon me "trademark, copyright ya IT Act ki shikayat" ka alag code, aur seller pe ginti (D-098 ke version record ke saath).
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1].

### CL-086. Asambandhit sevaon ki bundled fee

- **Kanoon ya niyam:** 2027 se platform se asambandhit sevaon ki bundled fee mana; loyalty ya membership is se bahar.
- **Kis pe laagu:** platform ki fees.
- **Kis module me:** checkout, loyalty.
- **System me kya chahiye:** koi platform ya packing fee nahi (D-107 niyam 4); points pe fee nahi (D-173).
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): sirf [E3].

### CL-087. Imported maal: importer aur asli hone ki guarantee

- **Kanoon ya niyam:** rule 4(6): imported maal pe importer ka naam aur details. Rule 6(5)(f): seller importer ki details aur imported products ke asli hone ki guarantee de. 2027 se poora country of origin Legal Metrology ke hisaab se.
- **Kis pe laagu:** imported listings.
- **Kis module me:** catalog, product page.
- **System me kya chahiye:** D-127; imported listing pe seller ki "authenticity guarantee" ki ghoshna (text + checkbox, pehle se tick nahi), product page pe, brand authorisation (D-075) se judi.
- **Dummy kya hai:** dummy ghoshna.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E1]; 2027 wala hissa [E3].

## Change log

| Version | Date       | Badlav                                                                                                            |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                 |
| v1.1.1  | 2026-11-19 | §1 tax: CL-001 se CL-024, sources ke saath (D-244); file ka dhaancha.                                             |
| v1.1.2  | 2026-11-19 | §2 Legal Metrology: CL-025 se CL-038, sources ke saath (D-245).                                                   |
| v1.1.3  | 2026-11-19 | §3 cosmetics kanoon: CL-039 se CL-058, sources ke saath (D-246).                                                  |
| v1.1.4  | 2026-11-19 | §4 e-commerce aur consumer kanoon: CL-059 se CL-087, sources ke saath (D-247); kanooni jaanch ka pehla run poora. |
