# COMPLIANCE: Beautinique

> **Status:** v1.2.8 (2026-11-23). Kanooni matrix. System me sab poori tarah banta hai, par registrations aur bahar ki companies ki details dummy hain (D-026); apne roles ki jaankari asli (D-241). Project ke Lawyer aur CA AI agents hain (D-257); Lawyer ne 18 rows dekhin (D-272), CA ne 32 rows dekhin aur 8 nayi rows di (D-281). Cheezein ek-ek karke, owner ki haan se, judti hain (D-220).

## Is file me kya aayega

- Har row (CL-xxx): **Kanoon ya niyam**, **Kis pe laagu**, **Kis module me**, **System me kya chahiye**, **Dummy kya hai**, **Jaancha ya nahi** (source aur tareekh ke saath).
- **Jaancha** = public source khol ke milaaya (tareekh ke saath). **Aadha jaancha** = sirf secondary source, ya sarkari text ki purani copy. **Jaancha nahi** = source nahi khula. **Lawyer ne jaancha** / **CA ne jaancha** = project ke Lawyer ya CA agent ne dekha, aur owner ki haan se docs me aaya (D-257). Is project me Lawyer aur CA AI agents hain, koi licensed lawyer ya CA nahi (D-257). **Lawyer ne aadha jaancha** = Lawyer ne dekha, par row ka kuch hissa baaki (row me likha). Lawyer ne 18 rows dekhin (D-272); CA ne 32 rows dekhin (D-281). **CA ne aadha jaancha** = CA ne dekha, par row ka kuch hissa baaki (row me likha).
- Rows area ke hisaab se batches me aati hain (D-220): §1 tax (CA ke naye points §1.1 me, CL-129 se), §2 Legal Metrology, §3 cosmetics kanoon, §4 e-commerce aur consumer kanoon, §5 personal data, §6 IT Act aur intermediary niyam, §7 CERT-In aur data ki jagah, §8 payments, §9 gig delivery partners, §10 warehouse, transport aur environment, §11 sehat aur AYUSH, §12 IP aur contracts. §13 "Nazar": cheezein jin ke badalne pe rows dobara dekhni hain. §14 documents ka dhaancha: 6 documents ke clauses (D-274).
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
- **[T11]** Notification 06/2026-Central Tax (Rate), 27 Oct 2026, G.S.R. 936(E), 1 Nov 2026 se: Notification 11/2017-CT(Rate) ki serial 12 (heading 9968) ka item (iii) badla. Gazette ka text ek doosri site ki copy se padha (2026-11-20): <https://a2ztaxcorp.net/wp-content/uploads/2026/10/N.-No.-06-2026-CT-UT-IG-Rate.pdf>. Primary document, secondary host.
- **[T12]** Notification 09/2026-Central Tax (Rate), 27 Oct 2026, G.S.R. 945(E): s.9(5) me "delivery services, other than postal and courier services" (jab supplier registration ke liye bound na ho), 1 Nov 2026 se: <https://a2ztaxcorp.net/e-commerce-operators-made-liable-under-section-95-for-delivery-services-other-than-postal-and-courier-services-supplied-through-them-by-persons-not-liable-for-registration-replacing-the-earli/>. Secondary (saar).
- **[T13]** 57th GST Council (8 Oct 2026) ki delivery seva wali salah: <https://www.taxscan.in/gst/gst-council-recommends-5-gst-without-itc-on-delivery-services-through-e-commerce-platforms>. Secondary.
- **[T14]** Circular 195/07/2023-GST (17 Jul 2023), warranty me bina keemat replacement: <https://gstcouncil.gov.in/sites/default/files/2024-06/circular-cgst-195.pdf>. Primary.
- **[T15]** Circular 243/37/2024-GST ([T5]) ka para 6 (breakage) aur para 6.3 me Circular 178/10/2022-GST (3 Aug 2022) ka siddhaant: supply ke liye kuch karne ya na karne ka saaf ya nihit agreement chahiye. Primary.
- **[T16]** Circular 251/08/2025-GST (12 Sep 2025), post-sale discounts; saar: <https://www.ey.com/en_in/technical/alerts-hub/2025/09/cbic-clarifies-treatment-of-post-sale-and-secondary-discount-under-gst>. Secondary.
- **[T17]** Finance Act 2026 ss.153 se 155 (CGST s.15(3)(b), s.34(1), s.54), Notification 03/2026-Central Tax se 1 Nov 2026: <https://www.lkslaw.com/insights/updates/indirect-tax-update/cgst-act-2017-amendments-by-sections-153-to-155-of-the-finance-act-2026-effective-from-1-november-2026>. Secondary.
- **[T18]** CBDT Circular 20/2023 (28 Dec 2023), e-commerce TDS ki guidelines (GST alag dikhe to bahar; return pe agli bikri me adjust; operator ka discount gross kam nahi karta); saar: <https://www.bdo.in/en-gb/insights/alerts-updates/cbdt-issues-additional-guidelines-on-tds-by-e-commerce-operators-under-section-194-o-of-the-it-act>. Secondary.
- **[T19]** Income-tax Rules 2026 (G.S.R. 198(E), 20 Mar 2026, 1 Apr 2026 se); "Form No. 140 (Earlier Form No. 26Q)" aur "Form No. 131 (Earlier Form No. 16A)": sarkari site ke search result titles. Text nahi khula.
- **[T20]** Income-tax Act 2025 ke TDS aur TCS ke badlav (s.393(1) Table: contractor aur e-commerce; s.397; jama ki tareekh; Form 140, Form 143; correction ki muddat), professional body ki presentation (Apr 2026): <https://bcasonline.org/wp-content/uploads/2026/04/Convergence-Divergence-Provisions-Procedures-of-TDS-and-TCS-Changes-in-Income-Tax-Act-2025-vs-Income-Tax-Act-1961.pdf>. Secondary.
- **[T21]** NACIN ka "Electronic Way Bill in GST" guide (2019): consignment value har invoice ya challan ki; consolidated e-way bill; rule 138E me e-commerce operator bhi: <https://www.gstcouncil.gov.in/sites/default/files/2024-02/electronic-way-bill-050819.pdf>. Primary, purana.
- **[T22]** GSTR-1 Table 14 aur 15 (ECO ke through supplies), Notification 26/2022-CT: <https://tutorial.gst.gov.in/contextualhelp/Einv/SUPECO_14.htm>. Primary (search result).
- **[T23]** Circular 57/31/2018-GST (principal-agent, Schedule I para 3): <https://cbic-gst.gov.in/pdf/Circular_57-31_Principal_Agent.pdf>. Primary site, search ka saar.
- **[T24]** Companies Act 2013 s.128(5) (books 8 financial years): <http://ebook.mca.gov.in/Actpagedisplay.aspx?PAGENAME=17511>. Primary site, search ka saar.
- **[T25]** Companies (Accounts) Rules 2014 rule 3(1) (audit trail) aur rule 3(5) (India me roz ka backup): <https://www.scconline.com/blog/post/2022/08/16/record-keeping-requirements-modified-vide-companies-accounts-fourth-amendment-rules-2022>. Secondary.
- **[T26]** Maharashtra me intra-state e-way bill ki seema ₹1,00,000: search ke nateeje. Secondary.
- **[T27]** GSTR-3B me GSTR-1 se aayi liability ka lock (GSTN advisories 2025): search ke nateeje. Secondary.

### CL-001. GST rates: beauty aur personal care

- **Kanoon ya niyam:** 22 Sep 2025 se (Notification 9/2025-CT(Rate)): 5% (talcum aur face powder, hair oil, shampoo, toothpaste, shaving cream aur aftershave, toilet soap bar); 18% (perfume, baaki make-up aur skincare, baaki hair products, deodorant, face wash aur body wash); Nil (kajal, kumkum, bindi, sindur, alta). Ek hi HSN heading me alag rate ho sakte hain (3304 me talcum 5%, make-up 18%; 3401 me soap bar 5%, face wash 18%).
- **Kis pe laagu:** har seller ki har listing.
- **Kis module me:** catalog, finance (rate table).
- **System me kya chahiye:** rate table ki row = HSN + description ki shart + rate + kis din se (D-086, D-239); seller row chune, staff jaanche. Kit pe CL-010.
- **Dummy kya hai:** kuch nahi; rates asli (public data). Table me notification ka hawala.
- **Jaancha ya nahi:** Jaancha (2026-11-19): 5% ki list [T1] se; 18% aur Nil [T2] se; 2026 ke badlav ne Chapter 33 nahi chheda [T9, secondary]. **CA ne aadha jaancha (2026-11-20):** HSN + description ki row aur rates ka dhaancha theek. Baaki: rates ke sources CA ne dobara nahi khole; Nil maal pe bill of supply (CL-130).

### CL-002. Rate badalne ka pal

- **Kanoon ya niyam:** CGST Act s.14: rate badalne ke aas-paas supply ka samay supply, invoice aur payment me se pehle wale se.
- **Kis pe laagu:** rate badalne ke din ke aas-paas ke orders.
- **Kis module me:** finance, orders (invoice).
- **System me kya chahiye:** invoice banne ke pal (dispatch, CL-003) ka rate; rate ghatne pe seller ko alert (D-086 niyam 4).
- **Dummy kya hai:** test me ek rate badlav ki tareekh.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.14 [T3, 2021 copy]; anti-profiteering (s.171) ki abhi ki haalat nahi khuli. **CA ne aadha jaancha (2026-11-20):** invoice dispatch pe aur maal ke advance pe GST nahi, to naya rate naye invoice se theek. Baaki: s.171 (anti-profiteering) ki abhi ki haalat.

### CL-003. Invoice ka samay aur number

- **Kanoon ya niyam:** CGST Act s.31(1)(a): maal ke nikalne se pehle ya us waqt tax invoice. Rule 46: lagataar number, financial year me unique (16 characters tak); supplier ka naam, pata, GSTIN; HSN, value, rate, tax; registered recipient ka naam, pata, GSTIN.
- **Kis pe laagu:** har seller ka har order.
- **Kis module me:** orders (invoice), warehouse (dispatch scan).
- **System me kya chahiye:** invoice pack ya dispatch ke scan pe (D-239); pack se pehle cancel pe invoice nahi; har seller GSTIN aur financial year ki apni series; cancel hua number bhi record me.
- **Dummy kya hai:** seller ka dummy GSTIN; PDF pe "SPECIMEN" (D-145).
- **Jaancha ya nahi:** Jaancha (2026-11-19): s.31 [T3]; rule 46 [T6, purana flyer]. **CA ne jaancha (2026-11-20):** dispatch pe invoice, GSTIN aur financial year ki series, cancel ka record theek; bina gap ka number database ke lock se.

### CL-004. E-invoice

- **Kanoon ya niyam:** rule 48(4) (Notification 10/2023-CT, 1 Aug 2023 se): kisi bhi saal ₹5 crore se zyada turnover wale registered person ke B2B invoice pe e-invoice (IRN aur signed QR).
- **Kis pe laagu:** aisa seller, B2B (GSTIN wale) invoice.
- **Kis module me:** seller onboarding, orders (invoice).
- **System me kya chahiye:** seller profile me "e-invoice laagu" ka field (D-239); aise seller ke B2B invoice pe IRN aur QR ke fields.
- **Dummy kya hai:** dummy me IRP nahi; "DUMMY IRN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): sirf [T10]. **CA ne aadha jaancha (2026-11-20):** field aur dummy IRN theek. Baaki: ₹5 crore ki seema sirf secondary.

### CL-005. Return pe credit note

- **Kanoon ya niyam:** CGST Act s.34: invoice ke baad maal lautaye ya value kam ho to supplier credit note deta hai; financial year ke baad 30 November (ya annual return) tak declare. Jod (D-281): 1 Nov 2026 se s.34(1) me s.15(3)(b) wali baad ki chhoot bhi (Finance Act 2026; registered recipient ka ITC ulatna shart) [T17].
- **Kis pe laagu:** har return aur RTO.
- **Kis module me:** orders, finance.
- **System me kya chahiye:** seller ke GSTIN se, asli invoice number aur tareekh ke saath, apni series; 30 November ki seema ke baad wala maamla aaye to credit note nahi aur finance ko alert.
- **Dummy kya hai:** PDF pe "SPECIMEN" (D-145).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.34 [T3, 2021 copy me "September"]; 30 November aur 2025 ka badlav [T10]. **CA ne aadha jaancha (2026-11-20):** seller ke GSTIN se, asli invoice ke hawale ke saath theek. Baaki: 30 November ki seema aur 1 Nov 2026 ka s.34(1) ka badlav sirf secondary [T17].

### CL-006. Replacement (R2)

- **Kanoon ya niyam:** bina extra paise ke replacement pe GST ka tareeka: credit note + naya invoice, ya bina keemat ka replacement purane invoice ke reference ke saath.
- **Kis pe laagu:** R2 ka replacement (D-122).
- **Kis module me:** orders, finance.
- **System me kya chahiye:** bina keemat replacement: seller ka delivery challan, asli invoice ke hawale ke saath [T14] (D-280); daam badle ya replacement na ho to credit note (aur zaroorat pe naya invoice); data model dono sambhale.
- **Dummy kya hai:** test documents "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.34 [T3]; replacement wala CBIC circular nahi khula. **CA ne aadha jaancha (2026-11-20):** bina keemat replacement aur delivery challan [T14] (D-280). Baaki: rule 55 ka text.

### CL-007. Discount

- **Kanoon ya niyam:** CGST Act s.15(3): supply se pehle ya us waqt invoice pe diya discount value me nahi judta; baad ka discount shart ke saath. Price se judi subsidy supplier ki value me judti hai (s.15(2)(e)).
- **Kis pe laagu:** brand ka discount (R1); platform ka discount (R2).
- **Kis module me:** orders (invoice), finance.
- **System me kya chahiye:** line pe teen rakam (list price, brand ki chhoot, platform ka hissa; D-101); brand ki chhoot invoice pe value ghatati; platform ka hissa "Platform offer" ki line, aur seller ki taxable value, TCS aur TDS poore daam pe; GSTIN wale orders pe platform offer nahi (D-279).
- **Dummy kya hai:** R2 ke test offers.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.15 [T3]; 56th Council ki salah [T1]; [T7]. **CA ne aadha jaancha (2026-11-20):** brand ki chhoot value ghatati; platform ka hissa seller ki value me (teesre paksh ka consideration). Baaki: Circular 251/08/2025 aur CBDT Circular 20/2023 sirf secondary [T16, T18].

### CL-008. Points ki chhoot (R2)

- **Kanoon ya niyam:** muft mile points khud supply nahi lagte; points se chhoot platform deta hai to CL-007 jaisa sawal.
- **Kis pe laagu:** R2 ke loyalty points (D-173, D-175).
- **Kis module me:** finance.
- **System me kya chahiye:** chhoot CL-007 jaisi; pakke points pe provision (khaata `loyalty_points_liability`), expire pe ulta; GST se alag; GSTIN wale orders pe points nahi (D-279).
- **Dummy kya hai:** R2 ke test points.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [T3], [T5] (sirf milta-julta tark). **CA ne aadha jaancha (2026-11-20):** chhoot CL-007 jaisi; pakke points ka provision. Baaki: income-tax me provision ki deduction.

### CL-009. Free samples

- **Kanoon ya niyam:** Circular 92/11/2019: bina consideration ke sample supply nahi, aur uske inputs pe ITC nahi (s.17(5)(h)); kharid ki shart wala "free" ek daam ki supply ho sakta hai.
- **Kis pe laagu:** brand ke samples aur gifts (R2, D-121).
- **Kis module me:** orders, warehouse, seller reports.
- **System me kya chahiye:** D-229; brand ko bheje gaye samples ki report (apna ITC ulatne ke liye).
- **Dummy kya hai:** R2 ke test samples.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): circular [T7, secondary]; s.17(5)(h) [T3]. **CA ne aadha jaancha (2026-11-20):** bina shart sample bahar aur ITC ulatne ki report theek. Baaki: Circular 92/11/2019 sirf secondary.

### CL-010. Kit aur combo

- **Kanoon ya niyam:** CGST Act s.2(30), s.8(a): composite supply pe principal ka rate. s.2(74), s.8(b): mixed supply (alag bik sakne wali cheezein ek daam pe) pe sabse zyada rate.
- **Kis pe laagu:** brand ka kit (R1), combo (R2).
- **Kis module me:** catalog, orders (invoice).
- **System me kya chahiye:** D-228.
- **Dummy kya hai:** test me ek 5% + 18% ka kit, invoice pe 18%.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [T3]; kit aur combo pe laagu karna CA ka kaam. **CA ne jaancha (2026-11-20):** kit mixed supply, sabse zyada rate (s.2(74), s.8(b)); combo ka tareeka D-278.

### CL-011. Platform ki fees ka invoice

- **Kanoon ya niyam:** platform ki fees (commission, fulfilment, storage, disposal) seller ko taxable seva; seva ka tax invoice (s.31(2)). Related persons ke beech seva ki value ke alag niyam (s.15).
- **Kis pe laagu:** har seller, apna brand bhi.
- **Kis module me:** finance.
- **System me kya chahiye:** platform ke GSTIN se har payout cycle ka fees tax invoice (seller agreement me continuous supply), seller ke warehouse state wale GSTIN pe; har fee ki line, SAC aur rate table se; fulfilment fee do lines me (D-275); return pe fees D-277 se, credit note ke saath; payout statement alag document; apne brand pe bhi wahi rate card.
- **Dummy kya hai:** platform ka dummy GSTIN; invoice "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.15, s.31(2) [T3]; [T1]; seva ka rate aur invoice ka samay (rule 47) primary se nahi. **CA ne aadha jaancha (2026-11-20):** har payout cycle ka fees invoice (continuous supply); fulfilment fee ke do hisse (D-275). Baaki: fees ka 18% aur rule 47 primary se nahi.

### CL-012. Customer se delivery fee

- **Kanoon ya niyam:** local delivery (SAC 996813). 1 Nov 2026 se heading 9968 item (iii)(b): e-commerce operator ke zariye bike maal ki delivery seva 5% (2.5% CGST + 2.5% SGST), delivery me lage inputs ka ITC nahi [T11]; s.9(5) sirf tab jab registration ke liye bound na hone wala supplier operator ke zariye de [T12].
- **Kis pe laagu:** delivery fee wale orders (D-107).
- **Kis module me:** orders, finance.
- **System me kya chahiye:** fee ka platform ka alag B2C invoice (order pe ek), SAC 996813; rate table me 31.10.2026 tak 18% aur 01.11.2026 se 5% bina ITC (D-239); prepaid pe invoice payment capture pe, delivery pe UPI me delivery pe (D-280); delivery inputs ka ITC ulatna (CL-132).
- **Dummy kya hai:** invoice "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [T1]; naya badlav sirf [T10]. **CA ne jaancha (2026-11-20):** platform ka B2C invoice, SAC 996813, 1 Nov 2026 se 5% bina ITC [T11] (notification ki copy doosri site pe).

### CL-013. GST TCS

- **Kanoon ya niyam:** CGST Act s.52: e-commerce operator doosre suppliers ki net value pe TCS le; 0.25% CGST + 0.25% SGST (10 Jul 2024 se), IGST 0.5%. Net value = mahine ki taxable supplies minus usi mahine lautayi supplies. Jama aur mahine ka statement agle mahine ke 10 din me; saal ka statement 31 December tak. Operator aur us ke through bechne wale seller ka registration zaroori (s.24).
- **Kis pe laagu:** platform, har seller (apna brand bhi).
- **Kis module me:** finance.
- **System me kya chahiye:** har seller, har mahine net value aur TCS; payout me us mahine ki kaat; rate tareekh wali setting me; har warehouse state me TCS registration ka field (D-239); register aur export R2 (D-134). Jod (D-281): net value me platform offer aur points ka hissa; Nil maal bahar.
- **Dummy kya hai:** platform ka dummy TCS registration ("DUMMY"); report "SPECIMEN".
- **Jaancha ya nahi:** Jaancha (2026-11-19): [T4]; s.24, s.52 [T3]; IGST rate secondary. **CA ne jaancha (2026-11-20):** net value aur mahine ka TCS theek; platform offer ka hissa net value me; Nil maal bahar.

### CL-014. Income-tax TDS

- **Kanoon ya niyam:** Income-tax Act 2025 s.393(1) (pehle s.194-O): e-commerce operator gross bikri pe 0.1% TDS, seller ke khaate me credit ya payment, jo pehle ho; individual ya HUF seller ki saal ki bikri ₹5 lakh tak (PAN ya Aadhaar ke saath) ho to nahi.
- **Kis pe laagu:** platform, har seller.
- **Kis module me:** finance.
- **System me kya chahiye:** TDS seller ke pehle credit (invoice ka pal) pe (D-239), invoice pe alag dikhe GST ke bina; platform offer ka hissa milaa ke; return pe agli bikri (usi seller, usi financial year) ke TDS me adjust, saal badle ya replacement ho to nahi (D-280); section, rate aur bina PAN ki rate tareekh wali setting me; quarterly TDS statement aur certificate (Form 140, Form 131) [T19].
- **Dummy kya hai:** dummy PAN; report "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): sirf [T8]. **CA ne aadha jaancha (2026-11-20):** credit pe, GST ke bina, return pe agli bikri me adjust (D-280). Baaki: s.393 aur CBDT Circular 20/2023 sirf secondary [T18, T20]; bina PAN ki rate.

### CL-015. Apna brand

- **Kanoon ya niyam:** alag company doosra supplier hai, to TCS (s.52) aur TDS laagu; dono companies related persons ho sakti hain (s.15).
- **Kis pe laagu:** apna brand "Unibelle" aur uski seller company (D-031, D-243).
- **Kis module me:** finance, seller onboarding.
- **System me kya chahiye:** koi alag raasta nahi: TCS, TDS aur fees invoice baaki sellers jaise; seller record pe "related party" ka field. Jod (D-281): related party ki saal ki list (finance report).
- **Dummy kya hai:** dummy company, dummy GSTIN aur PAN.
- **Jaancha ya nahi:** Jaancha (2026-11-19): TCS [T3]; TDS [T8, secondary]. **CA ne aadha jaancha (2026-11-20):** koi alag raasta nahi, theek. Baaki: rule 28 ka proviso aur Companies Act s.188 text se nahi.

### CL-016. Seller ka GST registration

- **Kanoon ya niyam:** CGST Act s.24(ix): e-commerce operator ke through bechne wale supplier ka registration zaroori; teesre paksh ka warehouse seller ke registration me "additional place of business" ki tarah.
- **Kis pe laagu:** har seller.
- **Kis module me:** seller onboarding.
- **System me kya chahiye:** onboarding me saboot ki warehouse ka pata seller ke registration me juda hai; staff jaanch (D-036, D-134 L2). Jod (D-281): doosre state se aaye stock pe seller ka invoice aur e-way bill (CL-133).
- **Dummy kya hai:** dummy GSTIN ke certificate ki dummy image.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.24 [T3]; "additional place of business" ka niyam nahi khula. **CA ne aadha jaancha (2026-11-20):** registration ki jaanch theek; doosre state se stock pe seller ka IGST invoice (CL-133). Baaki: "additional place of business" ka niyam.

### CL-017. Kho gaya ya nasht maal

- **Kanoon ya niyam:** kho gaye, chori, nasht ya write-off maal pe ITC nahi (s.17(5)(h)); bharpai pe GST tabhi jab kuch karne ya na karne ka agreement ho.
- **Kis pe laagu:** warehouse me hamare haath ka nuksaan (D-063), disposal (D-062).
- **Kis module me:** finance, warehouse, seller reports.
- **System me kya chahiye:** seller ko har mahine aise units ki report batch ke saath; bharpai payout me ek net "compensation" line, GST ke bina value pe, fees ghata ke (D-276), us pe GST, TCS aur TDS nahi; dispatch ke baad nuksaan pe pehle seller ka credit note.
- **Dummy kya hai:** test me ek kho gaya batch; report "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.17(5)(h) [T3]; [T5]; bharpai wala circular nahi khula. **CA ne aadha jaancha (2026-11-20):** bharpai pe GST, TCS, TDS nahi; ek net line; seller apna ITC ulate (D-276). Baaki: Circular 178/10/2022 sirf Circular 243 ke hawale se [T15].

### CL-018. B2B invoice aur tax credit

- **Kanoon ya niyam:** registered recipient ke invoice pe naam, pata, GSTIN (rule 46); recipient ka credit invoice aur supplier ke return pe tika (s.16); delivery ke state ka tax.
- **Kis pe laagu:** GSTIN wale orders (D-065, D-092).
- **Kis module me:** checkout, orders (invoice).
- **System me kya chahiye:** invoice pe GSTIN, naam aur pata; doosre state ke GSTIN pe chetavni (D-239).
- **Dummy kya hai:** dummy GSTIN (CL-024).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [T6], s.16 [T3]; IGST s.10 nahi khola. **CA ne aadha jaancha (2026-11-20):** GSTIN aur chetavni theek. Baaki: IGST s.10.

### CL-019. Ek parcel me kai sellers ke invoices

- **Kanoon ya niyam:** har supplier apna invoice deta hai (s.31); ek parcel me kai suppliers ke maal pe GST me rok nahi mili.
- **Kis pe laagu:** kai sellers wala order (D-077).
- **Kis module me:** warehouse (packing), orders.
- **System me kya chahiye:** parcel ke saath har seller ke invoice ki copy (print ya QR), parcel label pe kis invoice ke items. Jod (D-281): e-way bill har invoice ki value pe (CL-117).
- **Dummy kya hai:** test ka ek do-seller parcel.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.31 [T3]; raste ka document (e-way bill) doosre run me. **CA ne jaancha (2026-11-20):** har seller ka invoice parcel me; e-way bill har invoice ki value pe (CL-117).

### CL-020. Invoice pe customer ka naam aur pata

- **Kanoon ya niyam:** rule 46(e): unregistered customer ke ₹50,000 ya zyada ke invoice pe naam, pata, delivery ka pata aur state.
- **Kis pe laagu:** B2C invoices.
- **Kis module me:** orders (invoice), seller ki invoice copy.
- **System me kya chahiye:** D-226.
- **Dummy kya hai:** test me ek ₹50,000 se upar ka order.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [T6]; ₹50,000 se kam wala hissa [T10]. **CA ne aadha jaancha (2026-11-20):** ₹50,000 ka niyam theek. Baaki: ₹50,000 se kam wala hissa secondary.

### CL-021. Tax records ka samay

- **Kanoon ya niyam:** CGST Act s.36: records us saal ke annual return ki due date se 72 mahine; appeal, revision ya jaanch chale to us maamle ke records faisle ke 1 saal baad tak, ya 72 mahine, jo baad me.
- **Kis pe laagu:** invoices, credit notes, ledger, seller ke tax dastavez.
- **Kis module me:** finance, seller onboarding, account delete.
- **System me kya chahiye:** D-225, D-227; retention ki do classes: platform ke books 8 financial years (Companies Act s.128(5)), sellers ke tax documents 72 mahine (s.36) (D-280); jhagde tak rok; retention ki setting.
- **Dummy kya hai:** setting asli; data dummy.
- **Jaancha ya nahi:** Jaancha (2026-11-19): s.36 [T3]. Income-tax ke records ka samay: Jaancha nahi. **Lawyer ne nahi jaancha:** income-tax records ka hissa CA agent ke liye. **CA ne aadha jaancha (2026-11-20):** GST ke records 72 mahine; platform ke books Companies Act ke 8 financial years [T24] (D-280). Baaki: income-tax ka koi alag niyam nahi mila, naye Act ka text nahi khola.

### CL-022. Gift voucher (R2)

- **Kanoon ya niyam:** Circular 243/37/2024: voucher ka len-den na maal ki supply hai na seva ki; GST us maal ya seva pe jiske liye istemaal hua; bina istemaal wale balance pe GST nahi.
- **Kis pe laagu:** R2 ke gift cards (D-179).
- **Kis module me:** finance, checkout.
- **System me kya chahiye:** gift card issuer bechta hai (D-249): platform ke books me liability nahi; checkout pe payment ka ek tareeka, issuer se receivable; istemaal pe order ka normal invoice, payment ka tareeka "gift card"; issuer ke saath commission ho to us pe GST.
- **Dummy kya hai:** R2 ke test cards.
- **Jaancha ya nahi:** Jaancha (2026-11-19): [T5] (GST). Prepaid (PPI) niyam kanooni jaanch ke doosre run me. **CA ne jaancha (2026-11-20):** Circular 243 primary; D-249 ke baad platform ke books me gift card ki liability nahi, issuer se receivable.

### CL-023. Consultation

- **Kanoon ya niyam:** GST supply ke liye aam taur pe consideration chahiye (s.7); muft seva pe GST ka sawal nahi.
- **Kis pe laagu:** consultation (D-172, muft).
- **Kis module me:** consultation.
- **System me kya chahiye:** abhi kuch nahi; paid ho to SAC aur rate CA se.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.7 [T3]; [T1]. **CA ne jaancha (2026-11-20):** muft seva pe GST nahi; paid ho to tab SAC aur rate.

### CL-024. Demo ke documents

- **Kanoon ya niyam:** CGST Act s.122(1)(ii): bina supply ke invoice jaari karna saza wala kaam.
- **Kis pe laagu:** demo site ke saare invoice, credit note aur statement.
- **Kis module me:** orders, finance, demo ka nishaan.
- **System me kya chahiye:** D-145 ke watermark aur "DUMMY" badge; dummy GSTIN ka check digit jaan-boojh ke galat (asli GSTIN kabhi na bane), PAN wala hissa saaf nakli pattern ka; PDF ke metadata me bhi "SPECIMEN".
- **Dummy kya hai:** yahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): s.122 [T3, 2021 copy]; GSTIN ke check digit ka format nahi jaancha. **CA ne jaancha (2026-11-20):** SPECIMEN, galat check digit aur portal pe kabhi nahi: s.122 ka jokhim bahut kam.

### 1.1 CA (AI) ke naye points (D-281)

### CL-129. Return fee aur delivery fee ki wapsi

- **Kanoon ya niyam:** return fee platform ki customer ko seva hai: tax invoice (s.31); e-commerce operator ke zariye bike maal ki delivery jaisi seva 1 Nov 2026 se 5% bina ITC [T11]; fee ki wapsi pe credit note (s.34).
- **Kis pe laagu:** "man badla" return (D-114), delivery fee ki wapsi (D-108, D-110, D-114, D-222).
- **Kis module me:** returns, finance.
- **System me kya chahiye:** return fee ka platform ka B2C invoice; refund = seller ka credit note minus platform ki return fee; delivery fee wapas ho to platform ka credit note; refund ke saath documents ki list.
- **Dummy kya hai:** documents "SPECIMEN".
- **Jaancha ya nahi:** **CA ne aadha jaancha (2026-11-20):** [T11]; "return pickup" ka "delivery services" me aana pakka nahi.

### CL-130. Nil rate ka maal: bill of supply

- **Kanoon ya niyam:** Nil ya exempt maal pe tax invoice nahi, bill of supply (s.31(3)(c)); taxable aur Nil saath ho to invoice-cum-bill of supply (rule 46A).
- **Kis pe laagu:** kajal, kumkum, bindi, sindur, alta jaise Nil items (CL-001).
- **Kis module me:** orders (invoice), finance.
- **System me kya chahiye:** rate table ki row pe document ka type; seller ki series wahi; TCS ki net value me Nil maal nahi.
- **Dummy kya hai:** test me ek kajal wala order.
- **Jaancha ya nahi:** **CA ne aadha jaancha (2026-11-20):** s.31 [T3]; rule 46A ka text nahi khola.

### CL-131. Company ke books: samay, audit trail, India me backup

- **Kanoon ya niyam:** Companies Act s.128(5): books aur vouchers kam se kam pichhle 8 financial years [T24]; Companies (Accounts) Rules rule 3(1): accounting software me audit trail (edit log, band na ho sake), 1 Apr 2023 se; rule 3(5): electronic books ka backup India ke server pe roz (2022 ka badlav) [T25].
- **Kis pe laagu:** platform company aur Unibelle ki company (jahan unke books hamare system me hon).
- **Kis module me:** finance, architecture (backup).
- **System me kya chahiye:** journal append-only, har badlav ka log; retention 8 financial years (D-280); asli business se pehle India me roz ka backup (D-256, D-280). Band FY ki export files (D-309) bhi India ke backup me; provider India ke bahar ho to Registrar ko provider aur India me books ke incharge ki jaankari; export ki key ki do alag jagah copies (D-436).
- **Dummy kya hai:** dummy books; India ka backup asli business pe.
- **Jaancha ya nahi:** **CA ne aadha jaancha (2026-11-20):** [T24] (sarkari site, search ka saar), [T25] (secondary).

### CL-132. Delivery seva pe ITC ki rok

- **Kanoon ya niyam:** 5% wali delivery seva (heading 9968 item (iii)) ki shart: delivery me lage inputs aur input services ka ITC nahi; saajhe inputs me hissa ulatna [T11].
- **Kis pe laagu:** platform (delivery fee, return fee, fulfilment fee ka delivery hissa; D-275).
- **Kis module me:** finance.
- **System me kya chahiye:** har kharche pe cost centre (delivery, warehouse, saajha); delivery wale ka ITC nahi; saajhe ka mahine me anupaat se ulatna; khaata "ITC not available".
- **Dummy kya hai:** test kharche.
- **Jaancha ya nahi:** **CA ne aadha jaancha (2026-11-20):** [T11]; notification ka Explanation (iv) aur rules 42, 43 ka text nahi khola.

### CL-133. Seller ka inbound maal: invoice, challan, e-way bill

- **Kanoon ya niyam:** seller ke doosre state ke GSTIN se hamare warehouse state ke GSTIN ko maal distinct persons ke beech supply hai (Schedule I para 2): tax invoice (IGST) aur seema se upar e-way bill [T3, T21]; usi state ki jagah se aaye to delivery challan.
- **Kis pe laagu:** har seller ka inbound maal (D-036, D-096).
- **Kis module me:** warehouse (receiving), seller app.
- **System me kya chahiye:** ASN me seller ke invoice ya challan ka number, tareekh, value aur e-way bill number (seema paar ho to); receiving pe staff milaaye (D-280).
- **Dummy kya hai:** dummy numbers.
- **Jaancha ya nahi:** **CA ne aadha jaancha (2026-11-20):** Schedule I [T3]; [T21].

### CL-134. Hamari fees pe seller ka TDS

- **Kanoon ya niyam:** seller hamari commission aur fees apne books me credit karta hai; us pe seller ko TDS kaatna hai ya nahi, naye Income-tax Act me saaf nahi mila; e-commerce TDS wali rakam pe doosra TDS nahi (CBDT Circular 20/2023, purana Act) [T18].
- **Kis pe laagu:** har seller, platform.
- **Kis module me:** finance.
- **System me kya chahiye:** fees invoice pe "seller ne TDS kaata" ka field; platform ke "TDS receivable" aur seller ke certificate (Form 131) ka milaan.
- **Dummy kya hai:** field khaali.
- **Jaancha ya nahi:** **CA ne nahi jaancha:** [T18] (secondary) sirf doosre sawal pe.

### CL-135. Transporter ka bill: GTA aur RCM

- **Kanoon ya niyam:** consignment note dene wala transporter GTA hai (paribhasha 1 Nov 2026 se badli) [T11]; GTA aur gaadi kiraye ki sevaon pe forward ya reverse charge ka niyam aur rate nahi khole.
- **Kis pe laagu:** platform (D-027, R2).
- **Kis module me:** finance.
- **System me kya chahiye:** transporter record pe "GTA / consignment note" aur "forward charge ka option"; RCM ka khaata; ITC ki rok (CL-132) ke saath.
- **Dummy kya hai:** dummy transporter.
- **Jaancha ya nahi:** **CA ne nahi jaancha:** sirf GTA ki paribhasha [T11].

### CL-136. Platform ke tax returns aur statements

- **Kanoon ya niyam:** GST: GSTR-1, GSTR-3B (GSTR-1 se aayi liability badli nahi ja sakti, sudhaar GSTR-1A se) [T27], GSTR-8 (agle mahine ki 10), TCS ka saal ka statement (31 December) (s.52) [T3]; ECO ke through supplies GSTR-1 ke Table 14 me [T22]. Income-tax: TDS jama agle mahine ki 7, quarterly Form 140, certificate Form 131, correction ki muddat 2 saal [T19, T20].
- **Kis pe laagu:** platform.
- **Kis module me:** finance.
- **System me kya chahiye:** har return aur statement ka export (R2, D-134); sellers aur partners ke statements; roz aur mahine ka milaan (gateway, settlement bank khaata, sub-ledgers, GSTR-1, GSTR-8, TDS); due dates aur form numbers setting me, yaad ke saath.
- **Dummy kya hai:** sab exports "SPECIMEN"; koi filing nahi (D-026).
- **Jaancha ya nahi:** **CA ne aadha jaancha (2026-11-20):** s.52 [T3]; [T19] (sirf titles), [T20], [T22], [T27].

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
- **Jaancha ya nahi:** Jaancha (2026-11-19): rule 39 [K1]. IS 4707 Part 2 ki list: Jaancha nahi. **Lawyer ne nahi jaancha:** IS 4707 Part 2 ka text nahi khola; blocklist me sirf hawala; design pe asar nahi.

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
- **System me kya chahiye:** returns ki jaanch me ek aur check: label pe storage ki shart wala product (jaise sunscreen, perfume) aur parcel kitne din customer ke paas raha; shak ho to stock me nahi, brand ko. Har dobara stock hue unit ka record (D-112). Jod (D-271): storage shart wale maal pe customer ke paas rehne ka check.
- **Dummy kya hai:** test returns.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [K1], s.86 [K4]; rok na milna lawyer se pakka karna. **Lawyer ne aadha jaancha (2026-11-20):** lautaye maal ko dobara bechne pe seedhi rok nahi; label na badle aur maal standard ka rahe; storage check (D-271). Baaki: Drugs and Cosmetics Act s.18 ka abhi ka text nahi khola.

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
- **System me kya chahiye:** brand ka jawab aur seller ka content CL-046 ki "mana shabdon" ki list se moderation me; customer ki raay D-146 niyam 4 jaisi. Jod (D-263): Schedule wale ilaaj ke daawe ke reviews chhupte hain.
- **Dummy kya hai:** demo reviews pe "Demo review" (D-145).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-19): [K1], [K2]; objectionable advertisements ka alag kanoon nahi khola. **Lawyer ne aadha jaancha (2026-11-20):** Schedule wale ilaaj ke daawe ka review chhupe (D-263). Baaki: court ka koi faisla nahi dekha (Anishchit).

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
- **Jaancha ya nahi:** Jaancha (2026-11-19): [E2], rule 5(1) [E1]. **Lawyer ne jaancha (2026-11-20):** platform product seller aur product service provider; asli jokhim s.86(d) (bina Indian importer ka brand) aur s.86(e) (storage me laparwahi); brand aur Unibelle product manufacturer.

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

- **Kanoon ya niyam:** RBI ke PPI niyam khareedi hui value pe hain; jo points paise se khareede na jaayein aur cash ya transfer na hon (D-173), wo inke bahar lagte hain (vyakhya, pakka nahi) [R2]. Expiry ka koi tay number kanoon me nahi; saaf jaankari ka niyam consumer kanoon se.
- **Kis pe laagu:** R2 ke loyalty points (D-174).
- **Kis module me:** loyalty.
- **System me kya chahiye:** D-173 aur D-174 ke niyam; points ki expiry ki saaf jaankari.
- **Dummy kya hai:** R2 me.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [R2]; points ka darja vyakhya ka sawal. **Lawyer ne aadha jaancha (2026-11-20):** points paise se na bikein aur cash ya transfer na hon to PPI nahi; niyam ka bura badlav sirf aage ke points pe, notice ke baad. Baaki: padhai Sambhav.

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

## 5. Personal data (D-258)

### 5.0 Sources (sab 2026-11-20 ko khole)

- **[P1]** Digital Personal Data Protection Act 2023 (Act 22 of 2023), Gazette 11 Aug 2023; TRAI ki site pe copy: <https://www.trai.gov.in/sites/default/files/2024-09/DPDT_11082024.pdf>. Primary.
- **[P2]** Digital Personal Data Protection Rules 2025, G.S.R. 846(E), 13 Nov 2025; gazette ka text ek doosri site pe: <https://dpdpa.com/DPDP_Rules_2025_English_only.pdf>. Primary document, secondary host.
- **[P3]** PIB ka saar (17 Nov 2025): <https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf>. Primary.
- **[P4]** Act ke laagu hone ki tareekhein (G.S.R. 843(E), 13 Nov 2025) ka saar: <https://www.teamleaseregtech.com/updates/article/49364/meity-issued-a-notification-regarding-the-commencement-of-the-dpdp-act/>. Secondary.
- **[P5]** IT (Reasonable security practices and procedures and sensitive personal data or information) Rules 2011, G.S.R. 313(E), 11 Apr 2011; WIPO ki site pe copy: <https://www.wipo.int/wipolex/edocs/lexdocs/laws/en/in/in098en.pdf>. Primary document, secondary host.
- **[P6]** Aadhaar (Sharing of Information) Regulations 2016, 21.08.2025 tak ke badlav: <https://www.uidai.gov.in/images/The_Aadhaar_Sharing_of_information_regulation_2016.pdf>. Primary.

### CL-088. Abhi ka kanoon aur DPDP kab se

- **Kanoon ya niyam:** DPDP Rules ka rule 4 (Consent Manager) 13 Nov 2026 se; rule 3, 5 se 16, 22 aur 23, aur Act ke s.3 se 17 aur s.44(2) (jisse IT Act s.43A hat-ta hai) lagbhag 13 May 2027 se. Tab tak IT Act s.43A aur SPDI Rules: sensitive data (password, financial jaankari, sehat, biometric) pe likhit (electronic) consent (rule 5(1)), privacy policy (rule 4), Grievance Officer aur ek mahine me hal (rule 5(9)), data sirf barabar suraksha wale ko (rule 7), likha hua security program (rule 8).
- **Kis pe laagu:** platform company; apne brand ki company apne data ke liye.
- **Kis module me:** sign-up, privacy, security.
- **System me kya chahiye:** design shuru se DPDP ke hisaab se; sign-up ke consent me sensitive data ka zikr; security ke niyam ek likhe program me (security docs).
- **Dummy kya hai:** kuch nahi; niyam asli.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [P2] rule 1, [P5]; Act ki tareekhein [P4] (secondary).

### CL-089. Notice aur consent

- **Kanoon ya niyam:** s.5, s.6: har maqsad pe saaf consent, sirf zaroori data; consent se pehle notice. Rule 3: notice baaki jaankari se alag, data ki itemised list, maqsad, aur consent wapas lene, haq chalane aur Board ko shikayat ka link. Waapsi utni hi aasaan jitna consent (s.6(4)); consent ka saboot platform pe (s.6(10)). Consent Manager ka raasta (s.6(7) se (9), rule 4).
- **Kis pe laagu:** customers, sellers, delivery partners, testers.
- **Kis module me:** sign-up, account, saare apps.
- **System me kya chahiye:** sign-up pe alag Data notice (D-255); har consent ka record (notice ka version, samay, raasta, waapsi); har consent ka "band karo"; data model baad me Consent Manager se jud sake.
- **Dummy kya hai:** notice ka text "DUMMY: lawyer se jaancha nahi" ke saath.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1], [P2].

### CL-090. Sehat ka data

- **Kanoon ya niyam:** SPDI rule 3: sehat ki haalat aur medical records sensitive data; rule 5: likhit consent. DPDP rule 6: encryption, pahunch pe control aur logs.
- **Kis pe laagu:** consultation notes, skin reaction case, allergy profile (R2).
- **Kis module me:** consultation, customer profile, support.
- **System me kya chahiye:** alag consent (D-165); encryption aur audit (D-207, D-208); marketing ya sujhaav me bina alag consent nahi.
- **Dummy kya hai:** dummy profiles.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P5], [P2].

### CL-091. Data ke haq

- **Kanoon ya niyam:** s.11 (data aur processing ka saar, aur kin Data Fiduciaries aur Processors ke saath baanta), s.12 (sudhaar aur erase), s.13 (shikayat), s.14 (nomination). Rule 14: haq ka raasta saaf; jawab 90 din ke andar.
- **Kis pe laagu:** customers aur baaki Data Principals.
- **Kis module me:** account, support.
- **System me kya chahiye:** D-151 ke haq; data ke saar me sellers aur processors ki shreniyan; nomination R2 (D-255); jawab 90 din ke andar (D-163 ke timers isse chhote).
- **Dummy kya hai:** dummy customers.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1], [P2].

### CL-092. Privacy ka sampark

- **Kanoon ya niyam:** s.8(9), rule 9: Data Protection Officer (sirf Significant Data Fiduciary pe zaroori), ya personal data ke sawalon ka jawab dene wale insaan ka contact website ya app pe, aur haq ke har jawab me. s.8(10): shikayat ka raasta.
- **Kis pe laagu:** platform.
- **Kis module me:** legal pages, support, staff roles.
- **System me kya chahiye:** sampark Grievance Officer (D-253); contact privacy page pe aur haq ke har jawab me apne aap.
- **Dummy kya hai:** role wale staff account ki asli jaankari (D-241); repo me koi naam nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1], [P2].

### CL-093. Data ka samay aur kanooni rok

- **Kanoon ya niyam:** s.8(7): maqsad poora ho ya consent wapas ho to erase, jab tak kanoon na maange; processor se bhi. Rule 8(3) (lagbhag 13 May 2027 se): har processing ka personal data, traffic data aur logs kam se kam 1 saal, account delete ke baad bhi. Rule 6(1)(e): security ke liye logs aur data 1 saal. Rule 8(1) ka 3 saal wala niyam sirf 2 crore se zyada users wale e-commerce pe. Tax records CL-021 me.
- **Kis pe laagu:** platform aur uske processors.
- **Kis module me:** saari services, backups.
- **System me kya chahiye:** har data class ka samay (D-191 se D-194, D-208) aur kanooni rok (D-250): app se turant hatna, band encrypted store, sirf kanooni maang pe khulna (audit ke saath), phir erase; photos aur video lagbhag 13 May 2027 se file ke saath rok me, capture se 1 saal (D-262).
- **Dummy kya hai:** samay settings me.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): text [P2] se; hamari photos aur profile pe lagna vyakhya ka sawal. **Lawyer ne jaancha (2026-11-20):** rule 8(3) ka text personal data pe bhi laagu; photos aur video bhi 1 saal (D-262).

### CL-094. Data leak ki suchna

- **Kanoon ya niyam:** rule 7(1): har asar wale user ko bina der (kya hua, asar, humne kya kiya, wo kya karein, sampark). Rule 7(2): Board ko bina der shuruaati suchna, aur 72 ghante me poori report. CERT-In ko 6 ghante (D-248).
- **Kis pe laagu:** platform.
- **Kis module me:** operations (runbook), notifications.
- **System me kya chahiye:** D-248 ki teen ghadiyaan; user email aur in-app ka template; leak ka register.
- **Dummy kya hai:** saal me ek abhyaas nakli event se; kisi sanstha ko asli ya nakli report nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P2] rule 7.

### CL-095. Aadhaar

- **Kanoon ya niyam:** Aadhaar (Sharing of Information) Regulations ka reg. 6: Aadhaar number public nahi; suraksha; internet pe sirf encrypted; maqsad se zyada der nahi (reg. 6(5), 2025).
- **Kis pe laagu:** seller, Beauty Pro aur partner ke dastavez.
- **Kis module me:** KYC uploads.
- **System me kya chahiye:** Aadhaar nahi lena (SR-064); upload form pe "Aadhaar ki copy mat bhejein"; galti se aayi copy reject aur turant delete (D-255).
- **Dummy kya hai:** koi Aadhaar nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P6].

### CL-096. Staff ki pahunch

- **Kanoon ya niyam:** rule 6(1)(b), (c): personal data tak pahunch pe control, logs, monitoring aur review.
- **Kis pe laagu:** saare staff roles.
- **Kis module me:** saare staff apps, audit.
- **System me kya chahiye:** D-201 aur SR-076; "poori jaankari dekhi" wale audit ki mahine me ek review.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P2].

### CL-097. Device aur accounts ka jod

- **Kanoon ya niyam:** DPDP me consent aur s.7 ke tay maamle hi aadhaar hain; "legitimate interest" nahi. Cookies pe alag kanoon nahi mila.
- **Kis pe laagu:** per-customer seemaayein aur galat istemaal ki rok (D-203).
- **Kis module me:** checkout, referral, reviews.
- **System me kya chahiye:** ye maqsad notice aur Terms me (D-255); device cookie sirf isi kaam ke liye.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [P1]; hamare kaam pe lagna vyakhya ka sawal. **Lawyer ne aadha jaancha (2026-11-20):** device cookie ke liye notice wali consent; order ke data pe s.7(a) Sambhav; D-255 niyam 5 theek. Baaki: s.17 ka text dobara nahi khola.

### CL-098. Seller aur reviews ke saath data

- **Kanoon ya niyam:** s.8(3)(b): doosre Data Fiduciary ko diya data sahi ho; s.11(1)(b): kin ke saath baanta; s.6(1): sirf zaroori data.
- **Kis pe laagu:** seller ki reports, invoices, reviews.
- **Kis module me:** seller app, reviews.
- **System me kya chahiye:** sellers ko sirf zaroori data (D-143, D-226); review form pe "ye jaankari sabko dikhegi".
- **Dummy kya hai:** dummy reviews.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1].

### CL-099. Demo site

- **Kanoon ya niyam:** Act India me digital personal data ki har processing pe laagu hai (s.3); demo ki koi chhoot nahi.
- **Kis pe laagu:** allowlist ke testers.
- **Kis module me:** sign-up.
- **System me kya chahiye:** testers pe bhi wahi notice aur haq (D-133).
- **Dummy kya hai:** testers ka data asli maana jaata hai.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1].

### CL-100. Privacy page

- **Kanoon ya niyam:** SPDI rule 4 (privacy policy); DPDP rule 3, 9 aur 14.
- **Kis pe laagu:** platform.
- **Kis module me:** legal pages.
- **System me kya chahiye:** kaunsa data, kyun, kab tak (kanooni rok samet), kis ke saath (sellers aur processors ki shreniyan), kahan (Singapore, D-058), security ka saar, haq, sampark, Board, aur backups ki umar (D-150, D-255).
- **Dummy kya hai:** "DUMMY: lawyer se jaancha nahi".
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P5], [P2].

### CL-101. Marketing consent

- **Kanoon ya niyam:** s.6(1), s.6(4): alag consent, aur aasaan waapsi.
- **Kis pe laagu:** offers aur marketing ki khabrein.
- **Kis module me:** notifications.
- **System me kya chahiye:** D-141; opt-in aur opt-out ka record; push ki permission aur marketing consent alag.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1].

### CL-102. Bachche aur 18+

- **Kanoon ya niyam:** s.2(f): 18 se kam umar child; s.9: parent ki verifiable consent, aur tracking aur targeted ads mana; rule 10; Fourth Schedule ka Part B (child nahi hai, ye pakka karne ki processing).
- **Kis pe laagu:** sign-up.
- **Kis module me:** account.
- **System me kya chahiye:** 18+ ki ghoshna ka tick, pehle se tick nahi, consent record me (D-038, D-255); bachcha pata chale to account band aur data erase; umar ke hisaab se ads nahi.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [P1], [P2]; sirf ghoshna kaafi hai ya nahi, saaf nahi. **Lawyer ne aadha jaancha (2026-11-20):** sab users ki umar jaanchne ka seedha niyam nahi; ghoshna, record, pata chalne pe band aur erase theek padhai. Baaki: jhoothi ghoshna ka jokhim.

### CL-103. Significant Data Fiduciary

- **Kanoon ya niyam:** s.10, rule 13: sirf sarkar ki notification se; tab India me DPO, independent auditor, saal ka impact assessment aur audit, aur kuch data India me hi.
- **Kis pe laagu:** abhi nahi.
- **Kis module me:** koi nahi.
- **System me kya chahiye:** kuch nahi; notification aaye to dobara dekhna.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [P1], [P2]; notification na hona sirf search se.

### CL-104. Data processors

- **Kanoon ya niyam:** s.8(1), s.8(2): processor sirf valid contract se, aur zimmedari hamari; rule 6(1)(f): contract me security ki shart; s.8(7)(b): processor se bhi erase.
- **Kis pe laagu:** hosting, database, email, payment aur push providers.
- **Kis module me:** operations.
- **System me kya chahiye:** processors ki list (kaun, kaunsa data, region, data terms ki link aur tareekh, delete ka tareeka) (D-255); naya provider is list ke bina nahi.
- **Dummy kya hai:** list asli providers ki.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1], [P2].

## 6. IT Act aur intermediary niyam (D-259)

### 6.0 Sources (sab 2026-11-20 ko khole)

- **[U1]** IT (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021, 6 Apr 2023 tak ke badlav samet: <https://indiankanoon.org/doc/111130067/>. Consolidated text, secondary host.
- **[U2]** IT Rules ke 2026 ke badlav (20 Feb 2026 se) ka saar: <https://khaitanco.com/sites/default/files/2026-02/ERGO%20-%20IT%20Rules%20Amendment%20-%2016%20February%202026.pdf>. Secondary.
- **[U3]** Usi badlav pe lekh: <https://chambers.com/articles/government-notifies-information-technology-amendment-rules-2026>. Secondary.

### CL-105. User content: niyam aur shikayat ke samay

- **Kanoon ya niyam:** marketplace ko IT Act s.79 ki chhoot tabhi jab wo intermediary niyam maane (E-commerce rules ka rule 5(1), [E1]). IT Rules: rule 3(1)(a) niyam, privacy aur user agreement; 3(1)(b) mana content ki list user agreement me; 3(1)(c) har 3 mahine users ko niyam todne ke nateeje (2026); 3(1)(d) court ya sarkari order pe 3 ghante (2026); 3(1)(g) hataya content 180 din; 3(1)(h) registration data account band hone ke 180 din baad tak; 3(1)(j) sarkari maang pe 72 ghante; 3(2)(a) Grievance Officer, receipt 24 ghante, hal 7 din, aur 3(1)(b) wale content pe 36 ghante (2026); 3(2)(b) nagnata ya kisi aur ban ke dikhane wala content 2 ghante (2026); 3A Grievance Appellate Committee me 30 din me appeal.
- **Kis pe laagu:** reviews, review photos, sawal-jawab, seller ka content, Creator ka content.
- **Kis module me:** reviews, moderation, support, legal pages.
- **System me kya chahiye:** D-251 ke samay (calendar ghante); Terms me 3(1)(b) ki list aur har 3 mahine in-app suchna (D-255); hataya content 180 din tak rakha jaaye aur wapas ho sake (D-136 niyam 6); registration data ka samay (D-250); shikayat ke jawab me appeal ka raasta.
- **Dummy kya hai:** dummy reviews aur shikayatein; Grievance Officer role se (D-241).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [U1]; 2026 ke samay [U2], [U3] (secondary).

## 7. CERT-In aur data ki jagah (D-259)

### 7.0 Sources (sab 2026-11-20 ko khole)

- **[C1]** CERT-In Directions, No. 20(3)/2022-CERT-In, 28 Apr 2022: <https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf>. Primary.
- **[C2]** CERT-In FAQs (May 2022): <https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf>. Primary.
- **[C3]** RBI, Storage of Payment System Data, FAQs (26 Jun 2019): <https://www.rbi.org.in/Scripts/FAQView.aspx?Id=130>. Primary.
- **[C4]** RBI Master Direction on Regulation of Payment Aggregators (15 Sep 2025, 11 Nov 2026 tak ke badlav): <https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12896>. Primary.

### CL-106. CERT-In

- **Kanoon ya niyam:** direction (i): systems ki ghadi NIC ya NPL ke NTP se, ya unse traceable (cloud ki time service chal sakti hai, FAQ Q42); (ii): Annexure I ke incidents (data breach, data leak, unauthorised access, e-commerce app pe hamla samet) 6 ghante me CERT-In ko; (iii): ek Point of Contact; (iv): saare ICT systems ke logs 180 din, Indian jurisdiction me (FAQ Q35: bahar bhi chal sakte hain, agar maang pe samay se diye ja sakein).
- **Kis pe laagu:** platform (body corporate aur intermediary).
- **Kis module me:** operations, logs.
- **System me kya chahiye:** request logs aur security events apne store me 180 din (D-250; security events 1 saal, D-194); runbook me 6 ghante (D-248); Point of Contact = Security Contact role (D-253); saare timestamps UTC.
- **Dummy kya hai:** CERT-In ko koi test report nahi; Point of Contact asli business pe hi register.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [C1], [C2].

### CL-107. Data ki jagah

- **Kanoon ya niyam:** RBI: payment system ka data sirf India me (payment system providers aur unke vendors pe; bahar processing ho to 24 ghante me wapas) [C3]; merchant apne server pe card ki jaankari nahi rakhta ([C4] Annexure 1, para 2.1). DPDP s.16: sarkar kisi desh me data bhejne pe rok laga sakti hai (abhi koi rok nahi mili); rule 15. SPDI rule 7. CERT-In ke logs CL-106 me.
- **Kis pe laagu:** saari hosting (Singapore, D-058).
- **Kis module me:** architecture, finance, privacy page.
- **System me kya chahiye:** payment ka kam se kam data (ids, rakam, status, samay); card ya UPI ki jaankari kabhi hamare paas nahi; gateway se likhit pakka ki payment data India me (D-256); privacy page pe data ki jagah (CL-100); asli business se pehle region dobara dekhna.
- **Dummy kya hai:** test mode.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [C3], [C4], [P1]; RBI niyam ka merchant pe lagna vyakhya ka sawal. **Lawyer ne aadha jaancha (2026-11-20):** RBI ka storage niyam payment system providers pe; hum card ya UPI ka data nahi rakhte; asli business se pehle region dobara (D-058). Baaki: CERT-In FAQ ki line ki vyakhya. **Lawyer (AI) ne jaancha (2026-11-22):** media aur private files India ke bahar jaayaz (DPDP s.16 me koi rok notify nahi); har processor ka likhit DPA; sehat ki photos pe SPDI rules ka rule 7 (lagbhag 13 May 2027 tak); logs ki files CERT-In ko maang pe samay se mil sakein (D-436).

## 8. Payments (D-259)

### 8.0 Sources (sab 2026-11-20 ko khole)

- Payment Aggregators ki Master Direction: [C4].
- **[R1]** RBI circular, Harmonisation of TAT and customer compensation for failed transactions, 20 Sep 2019: <https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=11693>. Primary.
- **[R2]** RBI FAQs on PPIs (22 Nov 2022 tak): <https://www.rbi.org.in/Scripts/FAQView.aspx?Id=126>. Primary.
- **[R3]** RBI Digital Payments – E-mandate Framework 2026 (21 Apr 2026): <https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13374>. Primary.

### CL-108. Payment aggregator aur sellers ka paisa

- **Kanoon ya niyam:** marketplace payment aggregator ka merchant hai (para 4(e), 4(f)); aggregator khud marketplace business nahi karta (10(b)); aggregator dekhe ki marketplace sirf onboarded sellers ke liye paisa le (13(f)); settlement agreement ke samay se (Table 1); refund usi raaste (10(f)) [C4].
- **Kis pe laagu:** platform (Razorpay ka merchant).
- **Kis module me:** payments, finance.
- **System me kya chahiye:** ledger me sellers ka paisa liability ki tarah alag; seller agreement me payout ke din (D-081, D-256); baad me linked account ka raasta (D-093). Jod (D-269, D-271): alag "seller settlement" khaata; seller agreement me "limited payment collection agent". Jod (D-281): Settlement khaate se sirf sellers ka payout, refunds aur platform ke kamaye hisse ka sweep; gateway fees, platform offer aur chargeback ka usi din Operating se top-up; roz ka milaan (D-280).
- **Dummy kya hai:** test mode aur haath se payout (D-055).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [C4]; marketplace ka khud aggregator na hona text ki padhai se, seedha likha nahi. **Lawyer ne jaancha (2026-11-20):** platform gateway ka merchant, khud payment aggregator nahi; payout ka samay contract ka; seller agreement me "limited payment collection agent" (D-271). **CA ne aadha jaancha (2026-11-20):** accounting ka hissa (alag khaata, top-up, sweep, roz ka milaan; D-280) theek. Baaki: RBI ka hissa Lawyer ka.

### CL-109. Failed transaction, refund aur chargeback

- **Kanoon ya niyam:** failed transaction (paisa kata, par merchant ko pakki suchna nahi): card aur UPI ke merchant payment pe T+5 din me reversal, phir bank pe roz ₹100 ka harjana [R1]; refund usi raaste; chargeback ka framework aggregator ka, aur customer ke haq bane rehte hain ([C4] para 8(a), 18(h)).
- **Kis pe laagu:** platform, gateway.
- **Kis module me:** checkout, finance, support.
- **System me kya chahiye:** "paisa kata, order nahi bana" ki screen aur email; der se "captured" aaye to apne aap refund, sirf ek baar (D-256); chargeback ka case aur saboot (D-072, D-191). Jod (D-281): chargeback: seller ki galti pe seller ka credit note; platform wale (fraud, delivery) pe nahi (D-280).
- **Dummy kya hai:** test mode ke scenario.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [C4], [R1]. **CA ne aadha jaancha (2026-11-20):** refund aur chargeback ki entries aur credit note ka niyam (D-280). Baaki: s.34 ki 2021 copy.

### CL-110. Gift card, points aur store credit

- **Kanoon ya niyam:** PPI = rakhi hui value se kharid. Closed system PPI (sirf issuer ka apna maal ya seva, cash nahi) ko RBI ki ijazat nahi chahiye, par wo teesre ke liye payment nahi kar sakta. Gift PPI: ₹10,000 tak, reload nahi, cash-out nahi; validity kam se kam 1 saal, aur expiry issue pe batana [R2].
- **Kis pe laagu:** gift cards (R2), points (R2).
- **Kis module me:** loyalty, checkout, finance.
- **System me kya chahiye:** gift card sirf RBI-authorised PPI issuer ke zariye (D-249); points paise se khareede nahi jaate, cash ya transfer nahi (D-173); store credit aur wallet nahi (D-177). Jod (D-271): balance aur expiry dikhe; expiry se 45 din pehle yaad, issuer chahe to. Jod (D-281): points ka provision (CL-008).
- **Dummy kya hai:** test mode ka design; koi asli issuer nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [R2]; marketplace pe lagna aur points ka darja vyakhya ka sawal. **Lawyer ne aadha jaancha (2026-11-20):** gift card platform khud jaari nahi kar sakta, sirf authorised issuer ke zariye (D-249); expiry ki yaad (D-271). Points CL-081 jaisa. **CA ne aadha jaancha (2026-11-20):** gift card issuer ka, platform pe liability nahi; points ka provision. Baaki: income-tax ka hissa.

### CL-111. E-mandate

- **Kanoon ya niyam:** cards, PPI aur UPI pe recurring payment: ₹15,000 tak bina extra authentication (kuch shreniyon pe ₹1,00,000), 24 ghante pehle issuer ki suchna, aur customer kabhi bhi band kar sake [R3].
- **Kis pe laagu:** abhi kuch nahi (D-178: pehle se payment nahi).
- **Kis module me:** koi nahi.
- **System me kya chahiye:** kuch nahi; subscription kabhi aaye to yahi niyam.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [R3].

## 9. Gig delivery partners (D-260)

### 9.0 Sources (sab 2026-11-20 ko khole)

- **[G1]** Code on Social Security 2020, Gazette 29 Sep 2020; PRS ki site pe copy: <https://prsindia.org/files/bills_acts/acts_parliament/2020/Code%20On%20Social%20Security,%202020.pdf>. Primary document, secondary host.
- **[G2]** PIB ka saar (22 Nov 2025): <https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251122702601.pdf>. Primary.
- **[G3]** Social Security (Central) Rules 2026, G.S.R. 344(E), 8 May 2026; PRS ka saar: <https://prsindia.org/billtrack/the-social-security-central-rules-2026>. Secondary.
- **[G4]** Maharashtra Gig and Platform Workers (Rights and Protection) Bill 2026 ka saar: <https://teamleaseregtech.com/updates/article/57603/maharashtra-gig-and-platform-workers-rights-and-protection-bill-2026/>. Secondary.
- **[G5]** Contractor ke payment pe TDS, Income-tax Act 2025 s.393(1): search ke nateeje. Secondary.

### CL-112. Social Security Code: aggregator

- **Kanoon ya niyam:** aggregator ki paribhasha (s.2(2)); Seventh Schedule me "Logistic services" aur "e-Market place", aur hum dono me; workers ka registration (s.113); schemes (s.114); contribution saal ke turnover ka 1% se 2% (dar notify hona baaki), workers ko diye paise ke 5% se zyada nahi; shuru hone ki tareekh notify hogi (s.114(4), (5)) [G1]. Rules 2026: maujooda workers ki details 45 din me portal pe, naye real-time ya roz; scheme ke liye 90 din (ek aggregator) ya 120 din (kai) [G3]. Maharashtra ka 2026 ka bill [G4].
- **Kis pe laagu:** platform (delivery partners ke liye).
- **Kis module me:** delivery partners, finance.
- **System me kya chahiye:** D-254 ke kaam (partner pe portal ka number, roz ke kaam ka export, saal ke kaam ke din ki ginti, contribution ki provision, dar setting me aur shuru ki tareekh notify hone tak band); partner ki kamaai se kaat ka likhit kaaran aur appeal; har state ki row.
- **Dummy kya hai:** dummy partners; portal pe kabhi upload nahi (D-026).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [G1], [G2]; Rules aur bill [G3], [G4] (secondary). **Lawyer ne aadha jaancha (2026-11-20):** Code ki paribhasha primary se theek. Baaki: Rules 2026 aur state ke bill sirf secondary. **CA ne nahi jaancha:** contribution ka "turnover" Rules pe tika, text nahi khula; sirf provision ka khaata prastaavit.

### CL-113. Partner payouts pe TDS

- **Kanoon ya niyam:** contractor ke payment pe TDS, Income-tax Act 2025 s.393(1) (pehle s.194C): individual ya HUF pe 1%, baaki pe 2%; seema ek payment ₹30,000 ya saal me ₹1,00,000 [G5]. Jod (D-281): saal ki seema paar hone pe us saal ki poori rakam pe TDS; kaat (D-068) se pehle ki kamaai pe; vasooli pe GST nahi [T20].
- **Kis pe laagu:** platform (partner payouts).
- **Kis module me:** finance.
- **System me kya chahiye:** D-254 (partner ka PAN encrypted, saal ka jod, kaat ka niyam settings me, payout statement me TDS).
- **Dummy kya hai:** dummy PAN; koi challan nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [G5] (sirf secondary); CA agent se pakka karna (D-257). **CA ne aadha jaancha (2026-11-20):** 1% ya 2%, ₹30,000 / ₹1,00,000, saal ki seema paar pe poore saal ka catch-up, kaat se pehle ki kamaai pe (D-280). Baaki: sab secondary [T20].

### CL-114. Partner ka data

- **Kanoon ya niyam:** DPDP ka notice aur consent partner pe bhi; employment wala "legitimate use" (s.7(i)) sirf employee ke liye, aur Code gig worker ko employer-employee rishte ke bahar rakhta hai; kanoon ke kehne pe sarkar ko jaankari (s.7(d)) [P1], [G1].
- **Kis pe laagu:** delivery partners.
- **Kis module me:** Delivery app.
- **System me kya chahiye:** D-254 (partner ka notice aur consent; location sirf "delivered" aur "fail" ke pal pe); photo sirf parcel ki; samay D-191 aur D-250.
- **Dummy kya hai:** dummy partners.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1], [G1].

## 10. Warehouse, transport aur environment (D-260)

### 10.0 Sources (sab 2026-11-20 ko khole)

- **[W1]** Maharashtra Fire Prevention and Life Safety Measures (Amendment) Act 2023 (Mah. Act XXIV of 2023): <https://mahafireservice.gov.in/directorate/fire-act/2023/English.pdf>. Primary.
- **[W2]** Maharashtra Shops and Establishments (Amendment) Bill 2025 (L.A. Bill LXXXIX of 2025; Ordinance VIII of 2025, 1 Oct 2025); PRS ki site pe copy: <https://prsindia.org/files/bills_acts/bills_states/maharashtra/2025/Bill89of2025MH.pdf>. Primary document, secondary host.
- **[W3]** Plastic Waste Management (Amendment) Rules 2022, G.S.R. 133(E), 16 Feb 2022 (EPR guidelines): <https://tnpcb.gov.in/owems/pdf/regulations/4th%20Amendment%20(EPR%20guidelines)%20Feb%202022.pdf>. Primary.
- **[W4]** Plastic Waste Management (Amendment) Rules 2024, G.S.R. 201(E), 14 Mar 2024: <https://tnpcb.gov.in/owems/pdf/regulations/Plastic_Waste_Management_Amendment_Rules_2024.pdf>. Primary.
- **[W5]** E-way bill ki seema aur kai invoices: search ke nateeje. Secondary.
- **[W6]** Solid Waste Management Rules 2026 (1 Apr 2026 se): search ke nateeje. Secondary.
- **[W7]** Gas Cylinders Rules 2016 me "gas cylinder" ki paribhasha: search ka saar. Secondary.

### CL-115. Fire safety aur jalne wala maal

- **Kanoon ya niyam:** Maharashtra Fire Act: storage buildings ki shreni; Provisional, Final aur Renewal Fire Safety Approval (2023 ka badlav) [W1]; owner ya occupier licensed agency se saal me do baar (January aur July) certificate de (secondary). Aerosol: "gas cylinder" 500 ml se bada dhaatu ka container [W7], to aam chhote cans is paribhasha ke bahar dikhte hain. Petroleum Rules aur transport ke niyam nahi jaanche.
- **Kis pe laagu:** warehouse aur hubs.
- **Kis module me:** warehouse, catalog, delivery.
- **System me kya chahiye:** warehouse aur hub ke record me approvals aur certificate ki tareekhein aur yaad (D-256); catalog me "flammable" flag; warehouse me alag rack; delivery bag me aise items ki ginti ki seema.
- **Dummy kya hai:** tareekhein aur numbers "DUMMY".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [W1]; baaki secondary ya nahi jaancha.

### CL-116. Shops and Establishments

- **Kanoon ya niyam:** Maharashtra Shops and Establishments Act 2017: workers ki ginti se registration (s.6) ya intimation (s.7); 1 Oct 2025 ke Ordinance aur 2025 ke bill me seema 10 se 20 workers [W2] (bill pass hua ya nahi, pakka nahi).
- **Kis pe laagu:** warehouse, hubs, office.
- **Kis module me:** warehouse aur hub ka record.
- **System me kya chahiye:** workers ki ginti; registration ya intimation ka number aur tareekh; seema setting me (D-256).
- **Dummy kya hai:** number "DUMMY".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [W2].

### CL-117. E-way bill

- **Kanoon ya niyam:** seema har consignment (invoice ya challan) ki value pe, tax samet, gaadi ke jod pe nahi: inter-state ₹50,000, Maharashtra ke andar ₹1,00,000 [W5, T26]; seema paar wale invoices ka consolidated e-way bill; rule 138E me e-commerce operator bhi e-way bill bana sakta hai [T21].
- **Kis pe laagu:** warehouse se hub ke trips.
- **Kis module me:** logistics (trips, D-027).
- **System me kya chahiye:** trip ke manifest me har invoice ki value; state ki seema setting me; seema paar invoice pe number ke bina dispatch nahi; trip pe consolidated number (D-256); seller agreement me platform ka e-way bill banane ka haq.
- **Dummy kya hai:** number "DUMMY".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [W5]; CA agent se pakka karna (D-257). **CA ne aadha jaancha (2026-11-20):** seema har invoice pe, consolidated e-way bill [T21] (primary par purana). Baaki: Maharashtra ka ₹1 lakh secondary [T26].

### CL-118. Plastic EPR

- **Kanoon ya niyam:** obligated entities me online platforms aur marketplaces samet brand owners, micro aur small enterprise chhod ke (clause 4(iii)); packaging ki shreniyan I se IV (5.1); CPCB portal pe registration (6.1); bina registration business nahi (6.2); unregistered entity se len-den nahi (6.3); targets aur saal ka return (7) [W3], [W4].
- **Kis pe laagu:** platform (shipping ki packaging); har seller jo brand owner ya importer hai (apne packs ke liye), apne brand ki company bhi (D-031, D-243).
- **Kis module me:** seller onboarding, warehouse (packing), finance.
- **System me kya chahiye:** D-045 aur D-256 (seller ka EPR number ya micro/small hone ki ghoshna, iske bina seller live nahi; packaging master, shreni aur wazan; har dispatch ka record; saal ka return).
- **Dummy kya hai:** EPR numbers "DUMMY".
- **Jaancha ya nahi:** Jaancha (2026-11-20): [W3], [W4].

### CL-119. Expired ya toote maal ko nasht karna

- **Kanoon ya niyam:** Solid Waste Management Rules 2026: kachra chaar hisson me alag; "special care" waste; bulk waste generator ki alag zimmedari [W6].
- **Kis pe laagu:** warehouse.
- **Kis module me:** warehouse, returns.
- **System me kya chahiye:** D-062 aur D-256 (sirf authorised handler; certificate of destruction batch ke record me; jalne wala maal alag).
- **Dummy kya hai:** handler aur certificate dummy.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [W6].

### CL-120. E-waste

- **Kanoon ya niyam:** source nahi khula (E-Waste (Management) Rules 2022 me EPR producer pe).
- **Kis pe laagu:** sirf agar kabhi beauty appliances (jaise hair dryer) bikein.
- **Kis module me:** catalog.
- **System me kya chahiye:** catalog me "electrical appliance" ka flag; aisa product aane se pehle jaanch. Jod (D-271): "electrical appliance" category pe seller ka E-waste EPR number, iske bina listing nahi.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha nahi. **Lawyer ne jaancha (2026-11-20):** hair dryer aur electric shaver Schedule I me; brand ya importer "producer"; seller ka E-waste EPR number (D-271). BIS ke niyam jaanchne baaki.

## 11. Sehat aur AYUSH (D-261)

### 11.0 Sources (sab 2026-11-20 ko khole)

- **[H1]** Drugs and Magic Remedies (Objectionable Advertisements) Act 1954: <https://thc.nic.in/Central%20Governmental%20Acts/Drugs%20and%20Magic%20Remedies%20(Objectionable%20Advertisement)%20Act,%201954.pdf>. Primary.
- **[H2]** Telemedicine Practice Guidelines (2020) ka saar: <https://nrces.in/standards/telemedicine-practice-guidelines>. Saar; mool PDF nahi khula.
- **[H3]** Drugs and Cosmetics Act 1940 aur Rules 1945 (CDSCO, 31 Dec 2016 tak): <https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/acts_rules/2016DrugsandCosmeticsAct1940Rules1945.pdf>. Primary, par purana.
- **[H4]** Rule 170 ka hatna aur Supreme Court ka stay hatna (11 Aug 2025): khabrein. Secondary.

### CL-121. Online consultation

- **Kanoon ya niyam:** telemedicine sirf registered medical practitioner (RMP) kar sakta hai; naam, qualification aur registration number dikhana; patient ki pehchaan, consent aur record; dawa sirf tay lists se; platform RMP ka registration jaanche aur dikhaye; AI se salah ya dawa nahi [H2].
- **Kis pe laagu:** Skin & Hair Expert ki consultation (R2). Hamari consultation beauty salah hai, medical nahi (D-252), isliye guidelines laagu nahi.
- **Kis module me:** consultation.
- **System me kya chahiye:** D-252 (koi nidaan ya dawa nahi; booking, Meet ke email aur notes pe "Ye medical consultation nahi hai"; ilaaj pe "doctor se milein"; "doctor" ya "dermatologist" jaise shabd nahi). Registration ka koi field nahi. Jod (D-265): Expert aur Advisor ka certificate profile pe.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [H2] (sirf saar). **Lawyer ne aadha jaancha (2026-11-20):** medical nahi to Telemedicine guidelines bahar (D-252); qualification (D-265). Baaki: guidelines ka sirf saar.

### CL-122. AYUSH drug ki pehchaan

- **Kanoon ya niyam:** Ayurvedic, Siddha ya Unani drug banane ka licence Form 25-D pe (rules 153 se 157); label pe "Ayurvedic/Siddha/Unani medicine" aur "Mfg. Lic. No." (rule 161(3)) [H3]. Rule 170 hataya gaya, aur Supreme Court ka stay 11 Aug 2025 ko hata [H4].
- **Kis pe laagu:** har listing; AYUSH drug listing pe nahi (D-128).
- **Kis module me:** catalog ki jaanch.
- **System me kya chahiye:** label checklist me AYUSH drug ke ishare (ye shabd ya aisa licence) pe listing reject.
- **Dummy kya hai:** test listing.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [H3] (text 2016 tak), [H4] (secondary).

### CL-123. Drugs and Magic Remedies Act

- **Kanoon ya niyam:** s.3: drug ke vigyapan me garbh, yaun kshamata, mahwari, aur Schedule ki bimariyon (beauty se jude: breast ki banawat, leucoderma, motapa, lambai) ke ilaaj ka sujhaav mana; s.4: jhootha ya gumraah karne wala drug ka vigyapan mana; aise vigyapan ke chhapne me hissa lena bhi (s.2(d)) [H1].
- **Kis pe laagu:** listings, seller content, Creator content, sponsored content.
- **Kis module me:** catalog, Creator, ads.
- **System me kya chahiye:** D-256 ("mana shabdon" me is Act ka alag hissa, har shabd ke saath Schedule ka number; D-246).
- **Dummy kya hai:** test listing.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [H1].

## 12. IP aur contracts (D-261)

### 12.0 Sources (sab 2026-11-20 ko khole)

- **[L1]** Trade Marks Act 1999, s.30(3): <https://indiankanoon.org/doc/1928889/>. Statute ka text, secondary host.
- **[L2]** IT Act 2000, s.10A: search ke nateeje. Secondary.
- **[L3]** Commission Decision 2011/833/EU (EU documents ka reuse): search ka saar. Secondary.

### CL-124. Trademark aur asli maal

- **Kanoon ya niyam:** jaayaz tareeke se kharide gaye registered mark wale maal ko aage bechna sirf isliye infringement nahi (s.30(3)) [L1]; nakli maal infringement hai, aur doosre kanoonon me bhi; user agreement me IP todne wala content mana (IT Rules 3(1)(b), [U1]).
- **Kis pe laagu:** har seller.
- **Kis module me:** seller onboarding, catalog, support.
- **System me kya chahiye:** brand authorisation (D-075); seller agreement me asli maal aur photos ke haq ki ghoshna; brand owner ke liye IP shikayat ki category.
- **Dummy kya hai:** authorisation letter dummy.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [L1]. **Lawyer ne aadha jaancha (2026-11-20):** Trade Marks Act s.30(3): jaayaz khareeda asli maal bechna theek; D-075 kanoon se sakht. Baaki: text doosri site se.

### CL-125. Data aur assets ka license

- **Kanoon ya niyam:** EU ke documents ka reuse aam taur pe ijazat ke saath, teesre ke IP ko chhod ke [L3]; CosIng ki apni shartein aur BIS standards ki shartein nahi jaanchi.
- **Kis pe laagu:** ingredient master list, blocklist, fonts, icons, images.
- **Kis module me:** catalog data, frontend.
- **System me kya chahiye:** license list (asset, license, link, attribution); IS ki list ka text copy nahi, sirf hawala. Fonts Plus Jakarta Sans aur Fraunces: OFL 1.1, Reserved Font Name nahi, subset me license ki metadata; icons: har set ka poora license notice Credits page pe (D-436).
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [L3]. **Lawyer (AI) ne jaancha (2026-11-22):** fonts aur icons ke licence (D-436).

### CL-126. Seller ka udhaar

- **Kanoon ya niyam:** koi khaas kanoon nahi mila; ye seller agreement (contract) ki baat hai.
- **Kis pe laagu:** har seller.
- **Kis module me:** finance, seller agreement.
- **System me kya chahiye:** D-071; seller agreement me kaat ka haq, notice, listings rokna, aur jhagde ka raasta. Jod (D-281): fees ka GST invoice pe deya; write-off pe GST wapas nahi; seller ko 150 din purane bina chukaye invoices ki yaad.
- **Dummy kya hai:** test mode ka payment link.
- **Jaancha ya nahi:** Jaancha nahi. **Lawyer ne aadha jaancha (2026-11-20):** contract ka maamla; set-off, notice aur listings rokna theek (D-271). Baaki: MSMED aur Contract Act ka text nahi khola; tax hissa CA ke liye. **CA ne aadha jaancha (2026-11-20):** fees ka GST invoice pe deya; write-off pe GST wapas nahi; seller ka 180 din ka ITC niyam. Baaki: naye Income-tax Act me bad debt ka section.

### CL-127. Apne brand ka trademark

- **Kanoon ya niyam:** source nahi khula: trademark aur company naam ki search nahi hui (bahar ki search me project ka naam nahi daala gaya).
- **Kis pe laagu:** apne brand ki company (D-243).
- **Kis module me:** koi nahi.
- **System me kya chahiye:** asli business se pehle trademark search (class 3) aur application, aur company naam ki uplabdhta; search owner kare, ya owner ki haan se.
- **Dummy kya hai:** company dummy (D-026).
- **Jaancha ya nahi:** Jaancha nahi. **Lawyer ne nahi jaancha:** project ka naam search me nahi daala; asli business se pehle class 3 aur 35 ki search owner kare.

### CL-128. Electronic contract (Terms aur seller agreement)

- **Kanoon ya niyam:** IT Act s.10A: electronic tareeke se bana contract sirf isliye unenforceable nahi [L2]; dono paksh baalig hon. Stamp duty nahi jaanchi.
- **Kis pe laagu:** customers (Terms), sellers (seller agreement).
- **Kis module me:** sign-up, seller onboarding, legal pages.
- **System me kya chahiye:** har version badla na ja sake; kisne, kab, kaunsa version maana, iska record; "maanta hoon" bina pehle tick ke (D-150).
- **Dummy kya hai:** dummy sellers ka record.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [L2]. **CA ne nahi jaancha:** stamp duty (Maharashtra) ka text nahi khola; asli business se pehle.

## 13. Nazar (D-261)

Cheezein jin pe nazar rakhni hai; badlav ho to us row ko dobara dekhna.

| Kya                                                                                                                                                                                   | Kab                                                | Kis row se             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------- |
| DPDP Rules ki tareekhein                                                                                                                                                              | 13 Nov 2026 (Consent Manager), lagbhag 13 May 2027 | CL-088, CL-089, CL-093 |
| Significant Data Fiduciary ki notification                                                                                                                                            | Jab sarkar notify kare                             | CL-103                 |
| India ke bahar data pe koi rok (DPDP s.16)                                                                                                                                            | Jab sarkar notify kare                             | CL-107                 |
| IT Rules ke 2026 ke badlav ka primary text                                                                                                                                            | Gazette khulne pe                                  | CL-105                 |
| 2 aur 3 ghante wali ghadiyon (IT Rules ke 2026 ke badlav) ke liye doosra on-call insaan                                                                                               | Asli business se pehle                             | CL-105, CL-106         |
| Social Security Code ki tareekh aur Maharashtra ka bill                                                                                                                               | Notify ya pass hone pe                             | CL-112                 |
| Maharashtra Shops and Establishments ka bill                                                                                                                                          | Pass hone pe                                       | CL-116                 |
| Hosting ka region aur payment data India me                                                                                                                                           | Asli business se pehle (D-058, D-256)              | CL-107                 |
| Gift card ka issuer (test mode me milta hai ya nahi)                                                                                                                                  | Gift card banne se pehle (D-249)                   | CL-110                 |
| Foreign investment (D-040) khule to FDI ki e-commerce shartein: Unibelle me platform ya group ki equity, sab sellers ko barabar fees, platform ke discount, auditor ki saal ki report | Foreign investment se pehle (D-271)                | CL-124                 |
| Finance ke books ka India me roz ka backup aur audit trail (Companies (Accounts) Rules rule 3)                                                                                        | Asli business se pehle (D-256, D-280)              | CL-131                 |
| E-commerce operator ke business model se juda s.9(5) ka aage ka badlav (GST Council ki salah)                                                                                         | Finance Bill aane pe                               | CL-012                 |
| Income-tax Act 2025 ke liye CBDT ke naye circulars (e-commerce TDS)                                                                                                                   | Aane pe                                            | CL-014                 |
| Stamp duty aur e-stamp                                                                                                                                                                | Asli business se pehle                             | CL-128                 |

## 14. Documents ka dhaancha (D-274)

Project ke Lawyer (AI, D-257) ka dhaancha (D-273), D-262 se D-272 ke faislon ke saath. Sirf clauses aur unka kaam, poora draft nahi. Har document pe: badge "DUMMY: kisi licensed lawyer ne nahi dekha" aur version (D-264), laagu hone ki tareekh, purane versions ki list, aur bade badlav pe naya consent (D-150 niyam 3). Numbers settings se (D-150 niyam 4). Saari suchna email, in-app aur push se (D-126, D-141).

**Placeholders (D-026, D-241):** `[PLATFORM]` = Beautinique Pvt Ltd; `[CIN: DUMMY]`, `[GSTIN: DUMMY]`, `[REG_ADDRESS: DUMMY]`; `[GRIEVANCE_OFFICER]`, `[NODAL_OFFICER]`, `[CUSTOMER_CARE]`, `[SECURITY_CONTACT]` = role wale staff account se asli jaankari (D-237, D-241, D-253); `[SELLER]`, `[SELLER_GSTIN: DUMMY]`; `[PARTNER]`; `[CITY: DUMMY]`; `[SETTING:naam]` = settings ka number (misaal); `[VERSION]`, `[EFFECTIVE_DATE]`; `[DISPUTE_RESOLUTION]` = sellers ke liye pehle mediation, phir ek arbitrator ka arbitration, seat `[CITY: DUMMY]`; partners ke liye `[CITY: DUMMY]` ke court (D-268); `[LIABILITY_CAP]` = pichhle 12 mahine me us seller se mili fees (D-270); `[INSURANCE: DUMMY]` = platform ka group accident cover, asli business pe (D-267).

### 14.1 Customer Terms of Use

| #   | Clause                     | Kaam                                                                                                                                                                                                 | Hawala                                                          |
| --- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | Parties aur maanna         | `[PLATFORM]` ki jaankari; click-wrap, bina pehle tick ke; version aur samay ka record; 18+ ki shart.                                                                                                 | D-150, D-038, CL-072, CL-128                                    |
| 2   | Platform ki bhoomika       | Marketplace: har product "Sold by `[SELLER]`"; platform facilitator aur sellers ka fulfilment service provider; platform maal ka maalik nahi.                                                        | D-030, D-060, D-014                                             |
| 3   | Account aur sign-in        | Teen raaste, sessions, "My devices", account ki suraksha user ki; kai accounts ka jod seemaon ke liye gina jaata hai (maqsad).                                                                       | D-021, D-180, D-203, D-255 niyam 5                              |
| 4   | Demo aur allowlist         | Demo site, sirf allowlist se order, test mode payments, demo ki patti.                                                                                                                               | D-133, D-145, CL-079                                            |
| 5   | Product ki jaankari        | Content seller ka; batch ka MRP, expiry, ingredients, claims; "medical salah nahi".                                                                                                                  | D-064, D-067, D-099, D-224, CL-026                              |
| 6   | Daam aur charges           | MRP saare tax samet; daam seller ka; discount ke saath 30 din ka sabse kam daam; delivery fee pehle se dikhe; koi chhupa charge nahi.                                                                | D-061, D-107, D-223, CL-025, CL-071                             |
| 7   | Order aur contract         | Contract customer aur seller ke beech; "place order" pe stock rukna; stock na ho to apne aap refund.                                                                                                 | D-118, D-030                                                    |
| 8   | Cancel                     | Pack se pehle cancel, koi fee nahi, refund turant.                                                                                                                                                   | D-110, CL-078                                                   |
| 9   | Payment                    | Prepaid ya delivery pe UPI, cash nahi; platform seller ka limited payment collection agent; "paisa kata, order nahi bana"; refund usi raaste.                                                        | D-034, D-093, D-109, D-111, D-256, CL-108, CL-109               |
| 10  | Delivery                   | Vaade ki tareekh, koshishein aur RTO, delivery code aur saboot, der se delivery pe haq.                                                                                                              | D-117, D-108, D-072, D-148, D-222, CL-083                       |
| 11  | Return aur refund          | Return policy page ka hawala; kanooni haq kam nahi.                                                                                                                                                  | D-079, D-221, CL-061, CL-062                                    |
| 12  | Invoice                    | Invoice seller ka, seller ke GSTIN se; business invoice (R2).                                                                                                                                        | D-041, D-092, D-226, CL-084                                     |
| 13  | Reviews aur user content   | Mana content ki list (3(1)(b)); moderation aur chhupane ki wajahein; Schedule wale ilaaj ke daawe ke reviews chhupte; content dikhane ka license; photo me chehre ki ijazat; hataya content 180 din. | D-135, D-136, D-146, D-155, D-251, D-255 niyam 3, D-263, CL-105 |
| 14  | Mana istemaal              | Dhokha, nakli review, bots, galat daawe; baar-baar return ki seema (R2); karwai aur appeal.                                                                                                          | D-116, D-156, D-204                                             |
| 15  | Beauty Pro (alag shartein) | Pro ki jaanch, muddat, Pro daam ki seema; public shartein.                                                                                                                                           | D-065, D-069, D-070, CL-065                                     |
| 16  | Consultation (R2)          | Beauty salah, medical nahi; Expert aur Advisor ka certificate profile pe; related brand ke product pe label; muft aur seema; data alag consent se.                                                   | D-252, D-172, D-165, D-265, D-271                               |
| 17  | Points aur gift cards (R2) | Points chhoot hain, paisa nahi; expiry; gift card issuer ki shartein.                                                                                                                                | D-173, D-174, D-249, D-271, CL-081                              |
| 18  | Suchna                     | Zaroori emails, in-app aur push; marketing sirf opt-in.                                                                                                                                              | D-126, D-141, CL-101                                            |
| 19  | IP                         | Platform ka IP; brands ke trademark unke; IP ki shikayat ka raasta.                                                                                                                                  | CL-124, CL-085                                                  |
| 20  | Zimmedari                  | Platform apni seva (fulfilment, delivery, refund) ka zimmedar; product ki warranty seller ki; kanooni haq kabhi kam nahi; goodwill refund bina zimmedari maane.                                      | CL-068, D-130                                                   |
| 21  | Account band aur delete    | Kab platform rok sakta (wajah aur appeal); customer ka delete aur kanooni rok.                                                                                                                       | D-151, D-250                                                    |
| 22  | Shikayat aur jhagda        | Grievance page; content pe Grievance Appellate Committee; National Consumer Helpline aur consumer commission.                                                                                        | D-163, CL-064, CL-105                                           |
| 23  | Kanoon aur court           | Indian kanoon; `[CITY: DUMMY]` ke court, consumer ke apne forum ke haq ke saath.                                                                                                                     | CL-062                                                          |
| 24  | Badlav                     | Version, pehle suchna, bade badlav pe naya consent.                                                                                                                                                  | D-150 niyam 3                                                   |
| 25  | Company aur sampark        | Legal naam, `[CIN: DUMMY]`, pata, `[CUSTOMER_CARE]`, `[GRIEVANCE_OFFICER]`, `[NODAL_OFFICER]`.                                                                                                       | CL-059, D-237                                                   |

### 14.2 Privacy Notice (DPDP)

Do parat: sign-up pe chhota **Data notice** (alag, itemised) aur poora **Privacy page** (D-255 niyam 1, 2). Delivery partner aur seller ke apne notice (D-254, CL-089).

| #   | Hissa                      | Kaam                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Hawala                                                   |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | Hum kaun                   | Data Fiduciary `[PLATFORM]`; sellers apne order data ke liye alag Data Fiduciary.                                                                                                                                                                                                                                                                                                                                                                                                 | CL-089, CL-098                                           |
| 2   | Data aur maqsad (itemised) | Har maqsad ke saath data ki list: account, order, delivery, payment ids, reviews, support, seemaayein aur fraud ki rok, marketing.                                                                                                                                                                                                                                                                                                                                                | CL-089, D-255, CL-097                                    |
| 3   | Kis kanooni aadhaar pe     | Har maqsad ki consent ya s.7 ka maamla; "legitimate interest" nahi.                                                                                                                                                                                                                                                                                                                                                                                                               | CL-097                                                   |
| 4   | Sehat ka data              | Allergy profile, consultation notes, skin reaction: alag consent, seemit pahunch, samay. Ye data India ke bahar hamare storage provider ke paas reh sakta hai; ye baat consent me (SPDI rules ka rule 7, lagbhag 13 May 2027 tak).                                                                                                                                                                                                                                                | D-165, D-207, D-208, CL-090, D-436                       |
| 5   | Bachche                    | Sirf 18+; ghoshna ka record; bachcha pata chale to band aur erase; umar se ads nahi.                                                                                                                                                                                                                                                                                                                                                                                              | D-038, CL-102                                            |
| 6   | Kis ke saath               | Sellers (sirf order ka zaroori data), delivery partners (sirf active parcel), processors ki shreniyan, kanooni maang. Map (Ola Maps, ANI Technologies): jab customer map pe search kare, pin lagaye ya "Use my current location" dabaye, tab wo text, pin aur IP Ola ke paas jaate hain; is data ka Ola apni Privacy Policy me khud data fiduciary hai, aur use location wale ads aur research ke liye bhi le sakta hai. Map ke bina form se address dena hamesha mumkin (D-437). | D-143, D-201, D-347, D-425, CL-098, CL-104, D-436, D-437 |
| 7   | Data kahan                 | Singapore (D-058); product aur review images Cloudinary (US, D-284); private files (KYC dastavez, daawe aur delivery ki photos, kanooni rok aur logs ki files) Backblaze B2 EU Central (Amsterdam, Netherlands; D-456); har provider ka likhit DPA (D-436); card aur UPI ka data sirf gateway ke paas.                                                                                                                                                        | D-058, D-256, D-420, CL-107                              |
| 8   | Kitne din                  | Har class ka samay; kanooni rok (1 saal); tax archive; logs; backups ki umar. Account delete ke baad reviews bina naam ke rehte hain; delete screen pe customer unhe hata bhi sakta hai.                                                                                                                                                                                                                                                                                          | D-191 se D-194, D-225, D-250, D-262, CL-093, D-438       |
| 9   | Suraksha                   | Encryption, pahunch ka control, audit, staff ki seemit pahunch.                                                                                                                                                                                                                                                                                                                                                                                                                   | D-201, CL-096                                            |
| 10  | Aapke haq                  | Saar, sudhaar, erase, shikayat, nomination (R2); jawab 90 din ke andar.                                                                                                                                                                                                                                                                                                                                                                                                           | D-151, D-255 niyam 4, CL-091                             |
| 11  | Consent wapas              | Har consent ka "band karo", utna hi aasaan; nateeja kya hoga.                                                                                                                                                                                                                                                                                                                                                                                                                     | CL-089, CL-101                                           |
| 12  | Sampark aur shikayat       | `[GRIEVANCE_OFFICER]` (rule 9); Data Protection Board ka raasta; Consent Manager (jab aaye).                                                                                                                                                                                                                                                                                                                                                                                      | D-253, CL-092                                            |
| 13  | Device aur cookies         | Sign-in cookies aur device cookie sirf seemaon ke kaam ke liye; bahar ki analytics nahi.                                                                                                                                                                                                                                                                                                                                                                                          | D-157, D-186, D-255 niyam 5                              |
| 14  | Data leak                  | Asar wale user ko bina der email aur in-app.                                                                                                                                                                                                                                                                                                                                                                                                                                      | D-248, CL-094                                            |
| 15  | Testers                    | Demo ke testers pe bhi wahi notice aur haq.                                                                                                                                                                                                                                                                                                                                                                                                                                       | D-133, CL-099                                            |
| 16  | Badlav aur version         | Version, tareekh, bade badlav pe naya consent.                                                                                                                                                                                                                                                                                                                                                                                                                                    | D-150 niyam 3                                            |

### 14.3 Seller Agreement

| #   | Clause                          | Kaam                                                                                                                                                                                                                                                                                                                                                                                                                                            | Hawala                                                    |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | Parties aur maanna              | `[PLATFORM]` aur `[SELLER]`; likhit electronic contract; version aur maanne ka record.                                                                                                                                                                                                                                                                                                                                                          | CL-060, CL-128                                            |
| 2   | Kaun bech sakta                 | Brand owner ya authorised distributor; ek brand ek seller; brand ka pehla haq.                                                                                                                                                                                                                                                                                                                                                                  | D-032, D-075                                              |
| 3   | Onboarding ke dastavez          | PAN, warehouse wale state ka GSTIN, licence ka type, import registration, plastic aur (appliances pe) E-waste EPR number, brand authorisation, seller ka grievance officer; Aadhaar ki copy nahi.                                                                                                                                                                                                                                               | D-036, D-127, D-256, D-238, D-271, CL-095, CL-118, CL-120 |
| 4   | Marketplace aur barabari        | Platform facilitator; koi differentiated treatment nahi, apna brand bhi isi niyam me; Unibelle ka har kaam sirf uske seller account se; kram ke gun public.                                                                                                                                                                                                                                                                                     | D-139, D-271, CL-066                                      |
| 5   | Listing aur undertaking         | Content seller ka aur sahi; jokhim wale fields ki jaanch; staff content nahi badalta; claims ke saboot; mana shabd.                                                                                                                                                                                                                                                                                                                             | D-098, D-100, D-224, D-256 niyam 2, CL-069                |
| 6   | Daam                            | Daam seller ka, platform ke 4 niyam; bade badlav pe confirm; Pro daam.                                                                                                                                                                                                                                                                                                                                                                          | D-061, D-087, D-065                                       |
| 7   | Fulfilment services             | Inbound ki suchna, receiving, label kahan lage, storage aur pehle expire wala pehle, quarantine, wapsi.                                                                                                                                                                                                                                                                                                                                         | D-014, D-096, D-097, D-124, D-230                         |
| 8   | Maalikana aur jokhim            | Maal bikne tak seller ka; platform bailee; custody me nuksaan ki bharpai ka tareeka.                                                                                                                                                                                                                                                                                                                                                            | D-060, D-063, D-112                                       |
| 9   | Expiry aur na bika maal         | Seemaayein, bikri band, brand ka chunaav, nasht karna (authorised handler).                                                                                                                                                                                                                                                                                                                                                                     | D-062, D-082, D-256 niyam 6                               |
| 10  | Fees                            | Commission, fulfilment, storage, disposal; fees ka tax invoice; badlav pe notice. Fees GST ke bina, GST alag; continuous supply, har payout cycle ka ek tax invoice, seller ke warehouse state wale GSTIN pe; fulfilment fee ke do hisse (D-275); return pe fees (D-277).                                                                                                                                                                       | D-078, D-094, D-066, CL-011, D-275, D-277                 |
| 11  | Payment collection aur payout   | Platform limited payment collection agent; paisa alag "seller settlement" khaate me, payout usi se; payable kab, hafte ka payout, kam se kam rakam, statement.                                                                                                                                                                                                                                                                                  | D-081, D-093, D-256 niyam 4, D-269, D-271                 |
| 12  | Kaat aur udhaar                 | Set-off ka haq; udhaar ka alert, payment link, notice, listings rokna, account band; har kaat ki line aur aapatti.                                                                                                                                                                                                                                                                                                                              | D-071, D-103, D-271, CL-126                               |
| 13  | Tax                             | Seller ka GST invoice; TCS aur TDS ki kaat aur statement. Invoice platform seller ki taraf se banata hai, HSN aur rate seller ki zimmedari; TCS aur TDS set-off se pehle poori rakam pe; mahine ka TCS statement aur quarterly TDS certificate; seller apne GSTR-1 me ECO wali supplies dikhaye; platform offer ka hissa seller ki supply ka consideration; bharpai pe GST nahi (D-276); platform seller ki taraf se e-way bill bana sakta hai. | CL-013, CL-014, D-239, D-276, D-280                       |
| 14  | Returns aur daawe ka kharcha    | Wajah ke hisaab se kharcha; payable ke baad ulta daawa udhaar ke raaste.                                                                                                                                                                                                                                                                                                                                                                        | D-079, D-112, D-114, D-221                                |
| 15  | Chargeback (R2)                 | Wajah ke hisaab se nuksaan.                                                                                                                                                                                                                                                                                                                                                                                                                     | D-095                                                     |
| 16  | Product liability aur indemnity | Seller manufacturer ya product seller ki zimmedari; recall aur regulator ka kharcha; platform ki indemnity sirf apni laparwahi aur custody tak.                                                                                                                                                                                                                                                                                                 | D-129, CL-068                                             |
| 17  | Recall aur skin reaction        | Recall ka kram, kharcha brand ka; skin reaction ki khabar aur goodwill refund ki seema.                                                                                                                                                                                                                                                                                                                                                         | D-129, D-130                                              |
| 18  | Kanooni ghoshnayein             | Licensed manufacturer ka maal, poora label, Legal Metrology ki declarations, koi drug ya AYUSH drug nahi, mana ingredients nahi.                                                                                                                                                                                                                                                                                                                | D-128, D-246, CL-039, CL-026                              |
| 19  | IP aur asliyat                  | Asli aur jaayaz tareeke se mila maal; photos aur trademark ke istemaal ka haq; imported maal ki authenticity guarantee; nakli pe karwai.                                                                                                                                                                                                                                                                                                        | CL-124, CL-087, CL-085                                    |
| 20  | Customer data                   | Sirf order ka zaroori data; customer se seedha sampark nahi; DPDP ki zimmedari.                                                                                                                                                                                                                                                                                                                                                                 | D-143, D-144, CL-098                                      |
| 21  | Reviews aur brand ka jawab      | Brand ka staff review nahi likhta; jawab moderation ke saath, mana shabd nahi.                                                                                                                                                                                                                                                                                                                                                                  | D-156, D-160, CL-077                                      |
| 22  | Seller ka grievance officer     | Product page pe seller ka block; customer ki shikayat platform ki seedhi me bhi.                                                                                                                                                                                                                                                                                                                                                                | D-238, CL-060, CL-064                                     |
| 23  | Rokna aur band karna            | Wajahein, notice, appeal, maal ki wapsi.                                                                                                                                                                                                                                                                                                                                                                                                        | D-084, D-071, D-062                                       |
| 24  | Seller aur platform ka jhagda   | Tay din me saboot, naya senior, rakam pe rok; phir `[DISPUTE_RESOLUTION]`.                                                                                                                                                                                                                                                                                                                                                                      | D-164, D-268                                              |
| 25  | Zimmedari ki chhat              | `[LIABILITY_CAP]`; D-063 ki bharpai, dhokha aur kanooni zimmedari is chhat ke bahar; customer ke kanooni haq pe koi chhat nahi.                                                                                                                                                                                                                                                                                                                 | D-270                                                     |
| 26  | Badlav, muddat, suchna          | Badlav pe pehle notice aur naya version; suchna email aur seller app me; stamp duty ya e-sign asli business pe.                                                                                                                                                                                                                                                                                                                                 | D-150, CL-128                                             |

### 14.4 Delivery Partner Agreement

| #   | Clause                 | Kaam                                                                                                                                                                                                                                                        | Hawala                      |
| --- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | Parties aur maanna     | `[PLATFORM]` aur `[PARTNER]`; electronic contract; version record; 18+.                                                                                                                                                                                     | CL-128                      |
| 2   | Rishta                 | Independent contractor, employee nahi; koi salary, shift ya attendance nahi.                                                                                                                                                                                | D-033, D-266                |
| 3   | Azaadi                 | Offer maanna ya chhodna, chhodne pe saza nahi (sirf baar-baar maan ke chhodne pe); apni availability, koi fixed shift nahi; doosre platforms pe kaam ki rok nahi.                                                                                           | D-266                       |
| 4   | Patrata aur dastavez   | Licence, RC, insurance jo delivery ka istemaal cover kare, PAN; Aadhaar ki copy nahi; expiry pe kaam band.                                                                                                                                                  | D-254, CL-095, D-267        |
| 5   | Gaadi aur kharcha      | Apni gaadi, apna kharcha aur maintenance.                                                                                                                                                                                                                   | D-033                       |
| 6   | App aur device         | Manzoor phone, session, Hub Manager ka band karna.                                                                                                                                                                                                          | D-183                       |
| 7   | Kaam ka tareeka        | Pickup scan, delivery code, photo aur location sirf delivery aur fail ke pal; return pickup ki jaanch; jalne wale maal ki seema.                                                                                                                            | D-072, D-113, D-254, CL-115 |
| 8   | Customer ka data       | Sirf active parcel ki jaankari; kaam ke baad nahi rakhna; koi aur istemaal nahi.                                                                                                                                                                            | D-201, CL-114               |
| 9   | Kamaai aur payout      | Har kaam ki rakam, hafte ka payout, statement, TDS. Contractor TDS (1% ya 2%, saal ki seema paar pe poore saal ka catch-up), PAN na ho to uchi rate; kaat se TDS ka aadhaar nahi ghatta; partner GST registration ki seema paar kare to platform ko bataye. | D-104, D-254, CL-113, D-280 |
| 10  | Nuksaan ki kaat        | Sirf saboot aur jaanch ke baad; partner ka paksh; ek maamla aur mahine ki seema; record aur appeal.                                                                                                                                                         | D-068, D-103, D-164         |
| 11  | Social security        | Portal pe registration, kaam ka data portal ko, aggregator ka contribution.                                                                                                                                                                                 | D-254, CL-112               |
| 12  | Partner ka data        | Data notice aur consent; lagatar tracking nahi.                                                                                                                                                                                                             | D-254, CL-114               |
| 13  | Suraksha aur insurance | Traffic niyam partner ke; delivery ka istemaal cover karne wala insurance partner ka; asli business pe platform ka group accident cover `[INSURANCE: DUMMY]`.                                                                                               | D-267                       |
| 14  | Account rokna aur band | Saaf wajahein, notice, appeal; baar-baar nuksaan pe rok.                                                                                                                                                                                                    | D-068 niyam 3               |
| 15  | Jhagda, badlav, suchna | Dispute ka kram, phir `[DISPUTE_RESOLUTION]`; badlav pe notice; suchna email aur Delivery app me.                                                                                                                                                           | D-164, D-268, D-150         |

### 14.5 Return aur Refund policy page

| #   | Hissa                       | Kaam                                                                                                                                                                                           | Hawala                      |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | Daayra                      | Sab sellers pe ek niyam; product page pe har product ki return line.                                                                                                                           | CL-061, D-150 niyam 4       |
| 2   | Wajahein aur muddat         | Dikhne wali galti `[SETTING:visible_damage_hours]` (saboot ka niyam); kharab, nakli, galat item ya shade `[SETTING:defect_days]`; man badla sirf band maal pe `[SETTING:change_of_mind_days]`. | D-079, D-080, D-221         |
| 3   | Kya return nahi             | Bina seal wale product pe man badla nahi; kharab maal pe haq hamesha.                                                                                                                          | D-079, CL-062               |
| 4   | Der se delivery             | Door pe mana to poora refund; baad me `[SETTING:late_delivery_days]`.                                                                                                                          | D-222, CL-083               |
| 5   | Kaise maangein              | App se, photos ke saath (item, batch label, damage).                                                                                                                                           | D-106                       |
| 6   | Pickup aur jaanch           | Partner ki jaanch, mel na khaye to pickup nahi.                                                                                                                                                | D-113                       |
| 7   | Kharcha                     | Galti hamari ya brand ki: muft; man badla: `[SETTING:return_fee]`.                                                                                                                             | D-114                       |
| 8   | Refund kab aur kaise        | Usi raaste; cancel pe turant, RTO pe hub scan pe, return pe jaanch ke baad `[SETTING:refund_days]`.                                                                                            | D-111, D-115, D-108, CL-063 |
| 9   | Cancel                      | Pack se pehle, koi fee nahi.                                                                                                                                                                   | D-110                       |
| 10  | Paisa kata, order nahi bana | Bank ka samay, apne aap refund.                                                                                                                                                                | D-256 niyam 5, CL-109       |
| 11  | Appeal                      | Reject pe ek appeal `[SETTING:appeal_days]`, faisla Support Lead.                                                                                                                              | D-147                       |
| 12  | Recall aur skin reaction    | Recall pe refund; reaction pe support ka raasta.                                                                                                                                               | D-129, D-130                |
| 13  | Seema (R2)                  | Baar-baar return ki seema, staff khol sake.                                                                                                                                                    | D-116                       |
| 14  | Kanooni haq                 | Policy kanoon ke haq kam nahi karti; shikayat ki muddat.                                                                                                                                       | CL-062                      |

### 14.6 Grievance page

| #   | Hissa                      | Kaam                                                                                                                                | Hawala               |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | Platform ki jaankari       | Legal naam, pata, `[CIN: DUMMY]`, customer care.                                                                                    | CL-059               |
| 2   | Grievance Officer          | Naam, designation, contact (role account se).                                                                                       | D-237, D-241, CL-064 |
| 3   | Nodal officer              | India me rehne wala nodal person (role account se).                                                                                 | D-237, CL-059        |
| 4   | Shikayat kaise             | Alag form, ticket number, shikayat ka text receipt me.                                                                              | D-163, D-238, CL-064 |
| 5   | Samay: consumer shikayat   | Receipt 48 ghante, hal ek mahine.                                                                                                   | D-163, CL-064        |
| 6   | Samay: content ki shikayat | Receipt 24 ghante; nagnata wali report 2 ghante; baaki 36 ghante; hal 7 din.                                                        | D-251, CL-105        |
| 7   | Sarkari ya court order     | Alag raasta, 3 ghante.                                                                                                              | D-251                |
| 8   | Seller pe shikayat         | Seller ka grievance officer product page pe; platform ki seedhi bhi.                                                                | D-238                |
| 9   | Privacy ke sawal           | Wahi officer (rule 9); Data Protection Board ka raasta.                                                                             | D-253, CL-092        |
| 10  | IP ki shikayat             | Brand owner ke liye category, saboot ke saath.                                                                                      | CL-124               |
| 11  | Aage ka raasta             | Grievance Appellate Committee (content); National Consumer Helpline; consumer commission.                                           | CL-105, CL-059       |
| 12  | Security ki report         | `[SECURITY_CONTACT]` (CERT-In ka Point of Contact alag role). Har app pe `/.well-known/security.txt` isi sampark ke saath (SR-103). | D-253, CL-106        |

## Change log

| Version          | Date                     | Badlav                                                                                                                                         |
| ---------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.2.6 | 2026-11-17 se 2026-11-22 | Kanooni matrix CL-001 se CL-136, documents ka dhaancha (§14), aur Lawyer (AI) aur CA (AI) ki raay; har badlav ka poora itihaas git me (D-442). |
| v1.2.7 se v1.2.8 | 2026-11-23               | Data kahan: private files Backblaze B2 EU Central pe (D-456).                                                                                  |
