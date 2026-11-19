# LEGAL REVIEW: Beautinique (R-004, run 1)

> **Status:** v1.0.0 (2026-11-19). Kanooni jaanch (R-004), run 1: tax, Legal Metrology, cosmetics kanoon, e-commerce aur consumer kanoon. Lawyer se jaancha nahi.

## 0. Kaise padhein

- Ye Agent 4 (India Legal and Regulatory Checker) ki report hai, pehla run. **Ye legal advice nahi hai**, aur Claude lawyer nahi hai.
- **"Jaancha"** ka matlab sirf itna: point ko ek public source se milaaya jo is run me sach me khola gaya (URL aur date ke saath). Lawyer ne kuch bhi verify nahi kiya; R-004 har point pe khula rehta hai.
- **Status values:**
  - `Jaancha`: primary source (sarkari site, gazette, CBIC, CDSCO, indiacode jaisa) khol ke milaaya.
  - `Aadha jaancha`: source khola, par poora point nahi mila; ya sirf secondary source (law firm, news) mila; ya section ya number pe pakka nahi.
  - `Jaancha nahi`: run 1 ka point, par source khul nahi paaya ya samay nahi bacha.
  - `Run 2`: is run ke daayre ke bahar; sirf mapping, research nahi.
- Source ke saath **primary** ya **secondary** likha hai. Secondary sirf primary dhoondhne ke liye; jahan sirf secondary pe tika hai wahan `Aadha jaancha`.
- Kai sarkari sites (cbic.gov.in, taxinformation.cbic.gov.in, incometaxindia.gov.in, indiacode.nic.in) is run me fetch nahi huin (TLS certificate ki galti ya 403). Jahan sarkari document ka **poora, hu-ba-hu text** (gazette number, footnotes ke saath) kisi aur site pe mila, use "primary document, secondary host" likha hai aur `Jaancha` gina hai; jahan sirf kisi ka saar mila, wahan `Aadha jaancha`.
- Kanoon badalte rehte hain (jaise 2025 ke GST rate ke badlav). Har baat "jitna padha, us din tak" ki hai.
- Tay faisle (D-001 se D-219) yahan dobara nahi khulte. Kanoon se takrav ya kami dikhe to sirf §6 me, wajah aur prastaavit sudhaar ke saath; faisla owner ka.
- Sab registrations, numbers aur payments dummy / test mode (D-026). Har point pe "Dummy me kya" batata hai ki ise dummy values se kaise dikhayein.
- Ye report purane kaam ke paths le sakti hai (ye naya doc nahi). §7 ka prastaav naye docs ke liye hai, isliye usme purane kaam ka zikr nahi.

## 1. Poori mapping

**Kahan se ke chhote roop:** D-xxx = [DECISIONS.md](../../docs/DECISIONS.md) ka record (OPEN_QUESTIONS me wahi baat dobara hai to alag nahi gini); BDA = BUSINESS_DOMAIN_ANALYSIS.md; BDA2 = BUSINESS_DOMAIN_ANALYSIS_2.md; Sec = SECURITY_ANALYSIS.md; SR = security/SECURITY_REQUIREMENTS.md. Sab points R-004 ke andar.

**Ginti:** kul **120** points: run 1 me **87** (A 24, B 14, C 20, D 29), run 2 me **33**.

| Area | Jaancha | Aadha jaancha | Jaancha nahi | Kul |
| ---- | ------- | ------------- | ------------ | --- |
| A    | 7       | 17            | 0            | 24  |
| B    | 13      | 1             | 0            | 14  |
| C    | 14      | 6             | 0            | 20  |
| D    | 18      | 10            | 1            | 29  |

DECISIONS ke 86 "Kanooni detail jaanchi nahi" aur OPEN_QUESTIONS ki ek alag line (promo credit ya wallet, D-177) sab neeche kisi na kisi point me hain; kai lines ek point me judi hain, aur kuch points naye hain (jaise L-041, L-042, L-053, L-066, L-094).

| Id    | Kahan se                                                                                             | Point                                                           | Area            | Run | Status        |
| ----- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------- | --- | ------------- |
| L-001 | D-086; D-134; BDA §8.2 #3                                                                            | Cosmetics aur personal care ke HSN aur GST rates (2025 ke baad) | A               | 1   | Jaancha       |
| L-002 | D-086; BDA §11 #7                                                                                    | Rate badle to daam, MRP aur purana stock                        | A               | 1   | Aadha jaancha |
| L-003 | D-041; D-030; D-134; BDA §8.2 #5                                                                     | Invoice kab bane, kya likha ho, number ka kram                  | A               | 1   | Jaancha       |
| L-004 | BDA §8.2 #5; D-092                                                                                   | E-invoicing ki seema                                            | A               | 1   | Aadha jaancha |
| L-005 | D-134; D-111; D-112                                                                                  | Return pe credit note                                           | A               | 1   | Aadha jaancha |
| L-006 | D-122                                                                                                | Replacement pe invoice aur credit note                          | A               | 1   | Aadha jaancha |
| L-007 | D-101; D-061; BDA §8.2 #7                                                                            | Discount pe GST (brand aur platform ka)                         | A               | 1   | Aadha jaancha |
| L-008 | D-173; D-175                                                                                         | Points ki chhoot ka invoice aur GST                             | A               | 1   | Aadha jaancha |
| L-009 | D-121; BDA §8.2 #7                                                                                   | Free samples aur gifts pe GST                                   | A               | 1   | Aadha jaancha |
| L-010 | D-088; BDA §8.2 #7                                                                                   | Kits aur combos: mixed ya composite supply                      | A               | 1   | Jaancha       |
| L-011 | D-078; D-094; BDA §8.2 #6                                                                            | Commission aur fees pe GST, fees ka invoice                     | A               | 1   | Aadha jaancha |
| L-012 | D-107; BDA §8.2 #6                                                                                   | Delivery fee pe GST aur kiska invoice                           | A               | 1   | Aadha jaancha |
| L-013 | D-081; D-134; PROJECT_PLAN R1 #11; BDA §8.2 #4                                                       | GST TCS (s.52)                                                  | A               | 1   | Jaancha       |
| L-014 | D-081; D-134; PROJECT_PLAN R1 #11; BDA §8.2 #4                                                       | Income-tax TDS (s.393, pehle 194-O)                             | A               | 1   | Aadha jaancha |
| L-015 | D-031; BDA §11 #10; BDA2 §9.2                                                                        | House brand baaki sellers jaisa (TCS, TDS)                      | A               | 1   | Jaancha       |
| L-016 | D-036; D-060                                                                                         | Seller ka GST registration warehouse wale state me              | A               | 1   | Aadha jaancha |
| L-017 | D-063; D-062                                                                                         | Kho gaye ya nasht maal ki bharpai aur tax                       | A               | 1   | Aadha jaancha |
| L-018 | D-092; D-065; D-069                                                                                  | B2B invoice (GSTIN) aur tax credit                              | A               | 1   | Aadha jaancha |
| L-019 | D-077                                                                                                | Ek parcel me kai sellers ke invoices                            | A               | 1   | Aadha jaancha |
| L-020 | D-143; D-219; SR-088; Sec §11 #25; BDA2 §7.3 #12                                                     | Invoice pe customer ka naam aur pata                            | A               | 1   | Aadha jaancha |
| L-021 | D-151; D-193; D-194; SR-066; Sec §11 #20; BDA2 §7.3 #15                                              | Tax records kitne din                                           | A               | 1   | Jaancha       |
| L-022 | D-179; BDA2 §7.3 #9                                                                                  | Gift cards (vouchers) pe GST                                    | A               | 1   | Jaancha       |
| L-023 | D-172; BDA2 §7.3 #11                                                                                 | Consultation seva pe GST                                        | A               | 1   | Aadha jaancha |
| L-024 | D-145; D-133; BDA2 §7.3 #16                                                                          | Demo site pe dummy GSTIN aur specimen invoices                  | A               | 1   | Aadha jaancha |
| L-030 | D-061; D-064                                                                                         | MRP taxes samet, MRP se upar bikri nahi                         | B               | 1   | Jaancha       |
| L-031 | D-064; D-098; D-134; BDA §8.2 #2                                                                     | E-commerce page ki zaroori declarations (rule 6(10))            | B               | 1   | Jaancha       |
| L-032 | BDA §8.2 #2                                                                                          | Unit sale price                                                 | B               | 1   | Jaancha       |
| L-033 | D-127; D-138; BDA §8.2 #2; BDA2 §7.3 #6                                                              | Country of origin aur uska filter                               | B               | 1   | Jaancha       |
| L-034 | D-127; D-134; D-031                                                                                  | Manufacturer, packer, importer, marketer                        | B               | 1   | Jaancha       |
| L-035 | D-134                                                                                                | Customer care ki jaankari                                       | B               | 1   | Jaancha       |
| L-036 | D-064; D-086; D-061                                                                                  | Batch-wise MRP aur tax badalne pe revised MRP                   | B               | 1   | Jaancha       |
| L-037 | D-067; D-083                                                                                         | Online mfg date aur expiry (LM hissa)                           | B               | 1   | Jaancha       |
| L-038 | D-098; D-134                                                                                         | Net quantity                                                    | B               | 1   | Jaancha       |
| L-039 | D-121                                                                                                | Free samples ke pack                                            | B               | 1   | Aadha jaancha |
| L-040 | D-088                                                                                                | Kits aur combination packs                                      | B               | 1   | Jaancha       |
| L-041 | D-061; D-134 (naya)                                                                                  | 10 g / 10 ml tak ke chhote packs                                | B               | 1   | Jaancha       |
| L-042 | D-100 (naya)                                                                                         | Veg / non-veg ka dot                                            | B               | 1   | Jaancha       |
| L-043 | D-065                                                                                                | Pro buyers aur MRP                                              | B               | 1   | Jaancha       |
| L-050 | D-083; D-099; D-127; BDA §8.2 #1                                                                     | Cosmetic ke label pe kya zaroori                                | C               | 1   | Jaancha       |
| L-051 | D-062; D-083; BDA §8.2 #1                                                                            | Expiry zaroori hai ya nahi; PAO                                 | C               | 1   | Jaancha       |
| L-052 | D-062; D-067; D-082 (naya)                                                                           | "Use before" aur "expiry" ka din (2025)                         | C               | 1   | Aadha jaancha |
| L-053 | D-064; D-097; D-106; D-113 (naya)                                                                    | Batch number kab nahi hota                                      | C               | 1   | Jaancha       |
| L-054 | D-099; D-159                                                                                         | Ingredients (label, online) aur allergens                       | C               | 1   | Jaancha       |
| L-055 | D-127                                                                                                | Imported cosmetics ka registration                              | C               | 1   | Jaancha       |
| L-056 | D-128                                                                                                | Licence ka type, M.L. number                                    | C               | 1   | Jaancha       |
| L-057 | D-043; D-128; D-137; BDA §8.2 #11; BDA2 §7.3 #7                                                      | Cosmetic aur drug ki seema, claims ke shabd                     | C               | 1   | Jaancha       |
| L-058 | D-128; BDA §8.2 #11; BDA §11 #4                                                                      | Ayurvedic aur AYUSH beauty products ki seema                    | C               | 1   | Aadha jaancha |
| L-059 | D-128; D-132                                                                                         | Cosmetic me mana ingredients (blocklist)                        | C               | 1   | Jaancha       |
| L-060 | D-100; D-127                                                                                         | Animals pe testing                                              | C               | 1   | Jaancha       |
| L-061 | D-129; D-131; D-142; BDA §8.2 #10                                                                    | Recall ki zimmedari aur regulator ko suchna                     | C               | 1   | Jaancha       |
| L-062 | D-130; D-208; BDA §8.2 #10                                                                           | Skin reaction (adverse event) ki report                         | C               | 1   | Jaancha       |
| L-063 | D-112; BDA §8.2 #9                                                                                   | Lautaye band cosmetics dobara bechna                            | C               | 1   | Aadha jaancha |
| L-064 | D-082; D-062                                                                                         | Expiry ke kareeb ya expired bechna                              | C               | 1   | Aadha jaancha |
| L-065 | D-014; D-060; D-043 (naya)                                                                           | Cosmetics bechne ka licence                                     | C               | 1   | Jaancha       |
| L-066 | D-097 (naya)                                                                                         | Label na badalna, platform ka barcode sticker                   | C               | 1   | Jaancha       |
| L-067 | D-076 (naya)                                                                                         | Hair dye, fluoride toothpaste, khatre wale products             | C               | 1   | Jaancha       |
| L-068 | D-121                                                                                                | Free samples ka label                                           | C               | 1   | Aadha jaancha |
| L-069 | D-146; D-160                                                                                         | Reviews me ilaaj jaise daawe                                    | C               | 1   | Aadha jaancha |
| L-070 | D-150; D-145; D-134                                                                                  | Platform ki jaankari aur nodal person                           | D               | 1   | Jaancha       |
| L-071 | D-134; D-036; D-075; BDA2 §7.3 #4                                                                    | Seller ki jaankari product page pe, seller ka grievance officer | D               | 1   | Jaancha       |
| L-072 | D-079; D-114; D-150; BDA §8.2 #8                                                                     | Return policy dikhana, khule cosmetics pe "no return"           | D               | 1   | Jaancha       |
| L-073 | D-080; D-079                                                                                         | Kharab maal pe haq aur return ki samay-seema                    | D               | 1   | Jaancha       |
| L-074 | D-111; D-115; BDA §8.2 #12                                                                           | Refund ka samay (consumer kanoon wala hissa)                    | D               | 1   | Jaancha       |
| L-075 | D-163; D-134; D-145; BDA2 §7.3 #4                                                                    | Grievance Officer, receipt aur hal ka samay                     | D               | 1   | Jaancha       |
| L-076 | D-065; D-061; D-109; D-116                                                                           | Daam ka khel aur customers ke beech bhed                        | D               | 1   | Jaancha       |
| L-077 | D-139; BDA2 §7.3 #5                                                                                  | Kram, apna brand, sponsored, search                             | D               | 1   | Jaancha       |
| L-078 | D-166; D-031                                                                                         | Customer data aur platform ke naam wala brand (2027)            | D               | 1   | Aadha jaancha |
| L-079 | D-098; D-060; D-062; D-112                                                                           | Product liability: marketplace aur seller                       | D               | 1   | Jaancha       |
| L-080 | D-098                                                                                                | Seller ka content sahi hone ka undertaking                      | D               | 1   | Jaancha       |
| L-081 | D-154; BDA2 §7.3 #13                                                                                 | Jhoothi jaldi, kam stock, countdown                             | D               | 1   | Aadha jaancha |
| L-082 | D-107; D-114; D-121                                                                                  | Drip pricing aur basket sneaking                                | D               | 1   | Aadha jaancha |
| L-083 | D-141; D-150; D-155                                                                                  | Saaf consent, pre-ticked nahi                                   | D               | 1   | Jaancha       |
| L-084 | D-134                                                                                                | Dark patterns ka saal ka self-audit (2027)                      | D               | 1   | Aadha jaancha |
| L-085 | D-120; BDA §8.2 #13                                                                                  | Discount aur "pehle ka daam"                                    | D               | 1   | Aadha jaancha |
| L-086 | D-100; D-137                                                                                         | Product claims aur misleading ads                               | D               | 1   | Jaancha       |
| L-087 | D-158; BDA2 §7.3 #2                                                                                  | Endorsement aur inaam wale reviews                              | D               | 1   | Aadha jaancha |
| L-088 | D-135; D-146; D-156; BDA2 §7.3 #1                                                                    | Nakli reviews, verified review, negative na dabana              | D               | 1   | Aadha jaancha |
| L-089 | D-110                                                                                                | Cancel pe charge                                                | D               | 1   | Jaancha       |
| L-090 | D-133; D-145; BDA2 §7.3 #16                                                                          | Demo store                                                      | D               | 1   | Aadha jaancha |
| L-091 | D-150                                                                                                | Legal pages ke zaroori hisse (E-commerce wala)                  | D               | 1   | Jaancha       |
| L-092 | D-174                                                                                                | Points ki expiry aur suchna                                     | D               | 1   | Jaancha nahi  |
| L-093 | D-131; D-142                                                                                         | Recall pe customers ko suchna                                   | D               | 1   | Jaancha       |
| L-094 | D-117 (naya)                                                                                         | Der se delivery pe customer ka haq                              | D               | 1   | Jaancha       |
| L-095 | D-030; D-041 (naya)                                                                                  | Invoice pe seller ka naam (2027)                                | D               | 1   | Aadha jaancha |
| L-096 | D-075; D-156 (naya)                                                                                  | Baar-baar ullanghan wale sellers ka record                      | D               | 1   | Jaancha       |
| L-097 | D-107; D-173 (naya)                                                                                  | Asambandhit sevaon ki bundled fee (2027)                        | D               | 1   | Aadha jaancha |
| L-098 | D-127                                                                                                | Imported maal: importer aur authenticity ki guarantee           | D               | 1   | Jaancha       |
| L-100 | D-069; D-072; D-106; D-133; D-141; D-155; D-157; D-169; D-191; D-192; BDA2 §7.3 #8, #14; Sec §11 #19 | Personal data ki consent aur notice                             | DPDP            | 2   | Run 2         |
| L-101 | D-025; D-130; D-159; D-165; D-207; D-208; SR-067                                                     | Sehat ke paas ka data                                           | DPDP            | 2   | Run 2         |
| L-102 | D-151; BDA2 §7.3 #15                                                                                 | Data ke haq aur jawab ka samay                                  | DPDP            | 2   | Run 2         |
| L-103 | D-193; D-194; D-216; D-218; Sec §11 #20                                                              | Data rakhne aur delete ka samay, backups                        | DPDP            | 2   | Run 2         |
| L-104 | D-198; Sec §11 #17                                                                                   | Data leak pe suchna                                             | DPDP / CERT-In  | 2   | Run 2         |
| L-105 | D-216; SR-064; Sec §11 #21                                                                           | KYC me Aadhaar                                                  | DPDP / Aadhaar  | 2   | Run 2         |
| L-106 | D-201                                                                                                | Staff ki personal data tak pahunch                              | DPDP            | 2   | Run 2         |
| L-107 | D-203; D-156; D-176; Sec §11 #23                                                                     | Device ki pehchaan, accounts ka jod                             | DPDP            | 2   | Run 2         |
| L-108 | D-143; D-166; D-167                                                                                  | Seller ko data, review ke saath data, sujhaav                   | DPDP            | 2   | Run 2         |
| L-109 | D-136; D-146; D-163; BDA2 §7.3 #3                                                                    | User content, takedown, IT Rules                                | IT Act          | 2   | Run 2         |
| L-110 | D-194; D-218; Sec §11 #18                                                                            | CERT-In: logs aur incident report                               | CERT-In         | 2   | Run 2         |
| L-111 | D-058; Sec §11 #22; BDA2 §7.3 #19                                                                    | Payment data India me, Singapore hosting                        | RBI / data      | 2   | Run 2         |
| L-112 | D-093; D-081; BDA §8.2 #12                                                                           | Payment aggregator, sellers ka paisa, settlement                | RBI             | 2   | Run 2         |
| L-113 | D-111; BDA §8.2 #12                                                                                  | Refund ka TAT (RBI)                                             | RBI             | 2   | Run 2         |
| L-114 | D-173; D-174; D-177 (OPEN_QUESTIONS); D-179; D-219; BDA2 §7.3 #9                                     | Points, promo credit, wallet, gift cards: PPI                   | RBI             | 2   | Run 2         |
| L-115 | D-178; BDA2 §7.3 #10                                                                                 | Recurring payment mandate                                       | RBI             | 2   | Run 2         |
| L-116 | D-033; D-068; D-103; D-104; D-134                                                                    | Gig partners: Social Security Code, kaat, state niyam           | Gig             | 2   | Run 2         |
| L-117 | D-104                                                                                                | Partner payouts pe TDS                                          | Gig / tax       | 2   | Run 2         |
| L-118 | D-072; D-191; Sec §11 #24                                                                            | Partner ki location aur photo                                   | Gig / DPDP      | 2   | Run 2         |
| L-119 | BDA §8.2 #14; D-134                                                                                  | Jalne wala maal: storage, transport, fire NOC                   | Warehouse       | 2   | Run 2         |
| L-120 | D-134                                                                                                | Shops & Establishments                                          | Warehouse       | 2   | Run 2         |
| L-121 | D-027; D-077; D-134; BDA2 §7.3 #17                                                                   | E-way bill                                                      | GST (transport) | 2   | Run 2         |
| L-122 | D-045; D-134; BDA2 §7.3 #18                                                                          | Plastic EPR ka data                                             | Environment     | 2   | Run 2         |
| L-123 | D-062; D-063                                                                                         | Cosmetics nasht karne ke niyam                                  | Environment     | 2   | Run 2         |
| L-124 | D-025; D-172; D-134; BDA2 §7.3 #11                                                                   | Online dermatologist consultation                               | Health          | 2   | Run 2         |
| L-125 | D-128                                                                                                | AYUSH licence ki detail                                         | AYUSH           | 2   | Run 2         |
| L-126 | D-075                                                                                                | Brand authorisation, trademark, nakli maal                      | IP              | 2   | Run 2         |
| L-127 | D-074; D-132                                                                                         | Assets, CosIng aur BIS text ka license                          | IP              | 2   | Run 2         |
| L-128 | D-071                                                                                                | Seller pe udhaar ki vasooli                                     | Contract        | 2   | Run 2         |
| L-129 | D-133                                                                                                | Demo site pe anjaan logon ka data                               | DPDP            | 2   | Run 2         |
| L-130 | D-137; D-146                                                                                         | Drugs and Magic Remedies Act (ilaaj ke daawe)                   | Health          | 2   | Run 2         |
| L-131 | D-150; D-218                                                                                         | Privacy policy aur user agreement                               | DPDP / IT Act   | 2   | Run 2         |
| L-132 | D-141; BDA2 §7.3 #14                                                                                 | Marketing khabron ki consent aur band karna                     | DPDP            | 2   | Run 2         |

BDA §8.2 #15 (Razorpay test mode ke tathya) aur #16 (emails ki ginti), BDA2 §7.3 #20 se #24 (tathya) aur Security §11 #1 se #16 (tathya) kanooni nahi, isliye is mapping me nahi.

## 2. A: Tax (GST, TCS, TDS)

**Is area ke sources (sab is run me khole, 2026-11-19):**

- **[S-A1]** GST Council ki 56th meeting ki press release (PIB, 3 Sep 2025), gstcouncil.gov.in: <https://gstcouncil.gov.in/sites/default/files/2025-09/press_release_press_information_bureau.pdf>. Primary.
- **[S-A2]** CBIC ka "GST Ready Reckoner": CGST rates on goods as on 22.09.2025 (Notification No. 09/2025-Central Tax (Rate), 17 Sep 2025). CBIC ka document, par copy ek secondary site pe khuli (cbic.gov.in / taxinformation.cbic.gov.in ka TLS certificate fetch me fail hua): <https://a2ztaxcorp.net/wp-content/uploads/2025/09/CBIC-GST-Ready-Reckoner-indicating-updated-Central-Goods-and-Services-Tax-CGST-rates-on-goods.pdf>. Primary document, secondary host.
- **[S-A3]** CGST Act 2017, CBIC ka consolidated text "as on 31.08.2021": <https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf>. Primary, par **2021 tak ka**; uske baad ke amendments (Finance Act 2022, 2025 aur aage) is copy me nahi.
- **[S-A4]** Notification No. 15/2024-Central Tax (10 Jul 2024), TCS rate, gstcouncil.gov.in: <https://gstcouncil.gov.in/sites/default/files/2024-09/central-tax-15-2024-11072024.pdf>. Primary.
- **[S-A5]** Circular No. 243/37/2024-GST (31 Dec 2024), vouchers, gstcouncil.gov.in: <https://gstcouncil.gov.in/sites/default/files/2025-01/circular-no-243-2024.pdf>. Primary.
- **[S-A6]** GST Council ka flyer "Tax Invoice, Credit and Debit Notes" (rule 46 ka saar; purana flyer): <https://www.gstcouncil.gov.in/sites/default/files/e-version-gst-flyers/Tax_Invoice_and_other_new.pdf>. Primary, par purana.
- **[S-A7]** Circular No. 92/11/2019-GST (7 Mar 2019), sales promotion: taxguru pe chhapa text (CBIC aur Delhi ki copy image ya TLS ki wajah se nahi khuli): <https://taxguru.in/?p=675598>. Secondary.
- **[S-A8]** TDS by e-commerce operator, Income-tax Act 2025 s.393(1): TDSMAN blog (10 Nov 2026): <https://blog.tdsman.com/2026/11/tds-on-e-commerce-transactions-section-3931-194o/>. Secondary (incometaxindia.gov.in ne 403 diya).
- **[S-A9]** Notification 01/2026-Central Tax (Rate) ka saar (taxguru): <https://taxguru.in/goods-and-service-tax/cbic-revises-gst-rate-notification-under-finance-act-2026.html>. Secondary.
- **[S-A10]** Search results (secondary, sirf ishaare ke liye): e-invoice ki seema (Notification 10/2023-Central Tax), s.34(2) ka 30 November (Finance Act 2022), local/delivery services pe s.9(5) (Notification 17/2025 aur 06/2026, 09/2026-Central Tax (Rate)). Inke primary text is run me nahi khule.

### L-001. Cosmetics aur personal care ke HSN aur GST rates (2025 ke badlav ke baad)

- **Kya jaanchna tha:** D-086 ki rate table ke liye beauty aur personal care ke HSN aur rates, 22 Sep 2025 ke badlav ke baad.
- **Kanoon kya kehta hai:** 22 Sep 2025 se (Notification 9/2025-CT(Rate)):
  - **5%** (2.5% CGST + 2.5% SGST): 3304 ka sirf talcum powder aur face powder; 3305 ka hair oil aur shampoo; 3306 toothpaste, tooth powder, dental floss; 3307 ka shaving cream, shaving lotion, aftershave lotion; 3401 toilet soap (bar, cake, moulded); mehendi paste in cones (1404 ya 3305); toothbrush (9603 21 00). Press release ki list me combs aur hair-slides (9615) bhi kam rate wali list me hain.
  - **18%** (9% + 9%): 3303 perfumes aur toilet waters; 3304 baaki saare beauty, make-up aur skincare (sunscreen, manicure aur pedicure samet; kajal, kumkum, bindi, sindur, alta, talcum aur face powder chhod ke); 3305 baaki hair preparations (jaise hair colour, conditioner, serum); 3307 deodorants, bath preparations, depilatories aur baaki (shaving wale teen chhod ke); 3401 ke liquid ya cream wale skin-wash products (face wash, body wash).
  - **Nil:** kajal (kajal pencil sticks nahi), kumkum, bindi, sindur, alta.
  - Ek hi 4-digit heading me alag rate: 3304 me talcum 5% par foundation 18%; 3401 me soap bar 5% par face wash 18%.
  - Notification 01/2026-CT(Rate) (1 May 2026 se) ne sirf Chapter 22 ki entries badli; Chapter 33 aur 3401 nahi (secondary, [S-A9]).
- **Source:** [S-A1] (5% wali list aur 22 Sep 2025 ki tareekh), [S-A2] (Schedule I 2.5%, Schedule II 9%, Nil wali list), [S-A9].
- **Hamare faisle se mel:** D-086 (tareekh wali table, seller allowed HSN me se chune) **fit**. **Kami:** rate sirf HSN code se nahi, HSN + description ki shart se tay hota hai (talcum vs make-up, bar soap vs face wash). Table ki row sirf 4-digit HSN pe ho to galat rate lagega.
- **Prastaav:** D-086 ki table ki row: HSN (8 digit tak) + "description ki shart" (jaise "talcum powder, face powder") + rate + kis din se. Category se allowed rows; seller row chune, staff label aur description se jaanche. Kit pe L-010 dekhein. Invoice pe HSN kitne digit ka (turnover ke hisaab se) is run me jaancha nahi.
- **Dummy me kya:** rates asli (ye public data hai); seller ka chuna HSN dummy listing pe, table me "source: Notification 9/2025-CT(Rate)" ki ek line.
- **Status:** `Jaancha` (5% list primary press release se; 18% aur Nil ki list CBIC ke ready reckoner ki copy se, jo secondary site pe khuli).

### L-002. GST rate badle to daam, MRP aur purana stock

- **Kya jaanchna tha:** D-086 niyam 3 aur 4: rate badalne pe naye invoices aur purane stock ka kya.
- **Kanoon kya kehta hai:** rate badalne ke aas-paas time of supply s.14 se tay hota hai (supply, invoice aur payment me se kaun pehle). Jab maal rate badalne ke baad supply ho aur invoice bhi baad me bane, to naya rate; prepaid order me payment pehle aaya ho aur invoice baad me bana ho, to time of supply invoice ki tareekh. MRP sticker ki chhoot Legal Metrology ka sawal hai (L-036). Anti-profiteering (s.171) ki abhi ki haalat is run me nahi kholi.
- **Source:** [S-A3] s.14 (2021 copy).
- **Hamare faisle se mel:** D-086 niyam 3 ("us din se naye invoices naye rate pe") hamare flow me **fit**, kyunki invoice dispatch pe banta hai (L-003) aur maal tab hi jaata hai. D-061 niyam 4 (platform daam nahi badalta) aur D-086 niyam 4 (seller ko alert) theek hain.
- **Prastaav:** rate ki table me "kis din se" ke saath invoice banne ka pal (dispatch) hi rate chune. Rate ghatne pe seller ko alert me ye line: "rate ghata hai; daam dekhein" (asar customer pe; s.171 ki jaanch run 2 ya CA).
- **Dummy me kya:** test me ek rate badlav ki tareekh daal ke dikhayein ki us din se pehle aur baad ke invoices alag rate pe.
- **Status:** `Aadha jaancha` (s.14 khola; s.171 ki abhi ki haalat nahi).

### L-003. Invoice kab bane, kya likha ho, aur number ka kram

- **Kya jaanchna tha:** invoice pack, dispatch ya delivery pe (BDA §8.2 #5), aur D-134 ka "bina gap ka invoice number".
- **Kanoon kya kehta hai:** maal ki supply me, jab maal le jaana ho, tax invoice maal ke **removal (nikalne) se pehle ya us waqt** banta hai (s.31(1)(a)). Invoice pe consecutive serial number, ek ya kai series me, ek financial year me unique; supplier ka naam, pata, GSTIN; HSN, value, rate, tax; recipient registered ho to uska naam, pata aur GSTIN (rule 46, flyer ke hisaab se).
- **Source:** [S-A3] s.31; [S-A6] rule 46 ka saar.
- **Hamare faisle se mel:** D-030, D-041 (har seller ke GSTIN se invoice) **fit**. Invoice supplier (seller) ka hai, platform sirf banata hai; har seller GSTIN ki apni series. D-134 ki "bina gap" wali baat rule 46 ke "consecutive" se mel khati hai.
- **Prastaav:** invoice **warehouse se nikalne se pehle** (pack/dispatch scan pe) bane, order ke waqt nahi aur delivery pe nahi. Pack se pehle cancel (D-110) pe invoice nahi banta. Dispatch ke baad RTO (D-108) ya return pe invoice cancel nahi hota, credit note banta hai (L-005). Series: har seller GSTIN + financial year, max 16 characters, cancel ya void hua number bhi record me rahe (gap na dikhe).
- **Dummy me kya:** dummy GSTIN ke saath asli jaisi series (jaise `DM/2627/000001`), PDF pe D-145 ka "SPECIMEN" watermark.
- **Status:** `Jaancha` (s.31 primary; rule 46 primary flyer se, jo purana hai).

### L-004. E-invoicing ki seema

- **Kya jaanchna tha:** e-invoice (IRN, QR) kab zaroori (BDA §8.2 #5).
- **Kanoon kya kehta hai:** jin registered persons ka aggregate turnover kisi bhi financial year (2017-18 se) me ₹5 crore se zyada raha, unke liye B2B invoices pe e-invoice (Notification 10/2023-Central Tax, 1 Aug 2023 se, rule 48(4)). AATO ₹10 crore ya zyada walon ke liye 30 din se purana invoice IRP pe report nahi hota (1 Apr 2025 se, GSTN advisory). B2C invoices pe IRN nahi; bahut bade turnover pe B2C ka dynamic QR alag niyam (is run me nahi khola).
- **Source:** [S-A10] (secondary search results; notification ka text nahi khula).
- **Hamare faisle se mel:** D-092 aur D-065 niyam 4 (GSTIN wala invoice) se juda. Abhi kisi doc me e-invoice nahi: **kami** (kisi faisle se takrav nahi).
- **Prastaav:** seller profile me "e-invoice laagu" ka field (seller ki ghoshna + staff jaanch). Aise seller ke B2B invoice pe IRN aur signed QR ke fields; dummy me IRP nahi, sirf field aur "DUMMY IRN".
- **Dummy me kya:** dono R1 sellers ke liye field "nahi"; test data me ek seller "haan" pe, invoice pe dummy IRN.
- **Status:** `Aadha jaancha` (sirf secondary).

### L-005. Return pe credit note

- **Kya jaanchna tha:** return aur RTO pe credit note (D-134 ki L3 row, D-111, D-112).
- **Kanoon kya kehta hai:** invoice ke baad maal lautaye ya value kam nikle to **supplier** credit note jaari karta hai (s.34(1)); ek financial year ki supplies ke liye ek ya kai credit notes. Return me declare karne ki aakhri tareekh: financial year ke baad wala **30 November** ya annual return, jo pehle (Finance Act 2022 se, secondary). Finance Act 2025 ne s.34(2) ka proviso badla (secondary me zikr; naya text nahi dekha).
- **Source:** [S-A3] s.34 (2021 copy me abhi "September" likha); [S-A10].
- **Hamare faisle se mel:** D-134 (credit note L3) **fit**. Credit note seller (supplier) ke GSTIN se, platform banata hai.
- **Prastaav:** credit note har seller, har lautaye line pe, asli invoice number aur tareekh ke saath; apni alag series. RTO aur return dono pe. 30 November ki seema ke baad ka return (jaise lambi appeal) aaye to system credit note na banaye aur finance ko alert.
- **Dummy me kya:** credit note PDF pe "SPECIMEN" (D-145).
- **Status:** `Aadha jaancha` (seedha niyam primary; tareekh aur 2025 ka badlav secondary).

### L-006. Replacement pe invoice aur credit note

- **Kya jaanchna tha:** D-122 (R2 ka replacement).
- **Kanoon kya kehta hai:** warranty jaise replacement bina extra paise ke ho to GST ka ek CBIC circular (Circular No. 195/07/2023-GST, jaisa yaad hai) kehta hai ki naya tax nahi; is run me ye circular **nahi khula**. Doosra raasta: return pe credit note (L-005) aur naye maal ka naya invoice.
- **Source:** [S-A3] s.34; circular nahi khula.
- **Hamare faisle se mel:** D-122 R2 me; abhi **kami** (tareeka tay nahi).
- **Prastaav:** R2 ke design se pehle CA se ek tareeka chunna: (a) credit note + naya invoice, ya (b) bina keemat ka replacement, purane invoice ke reference wale document ke saath. Data model dono sambhale.
- **Dummy me kya:** test me dono documents "SPECIMEN".
- **Status:** `Aadha jaancha`.

### L-007. Discount pe GST: brand ka aur platform ka

- **Kya jaanchna tha:** D-101 aur D-061 niyam 4: discount bikri se pehle ya baad, aur platform ke diye discount ka invoice pe asar.
- **Kanoon kya kehta hai:**
  - Supply se pehle ya us waqt diya discount, jo invoice me likha ho, value me nahi judta (s.15(3)(a)).
  - Supply ke baad ka discount: 2021 ke text me shart thi ki agreement pehle se ho aur invoices se juda ho (s.15(3)(b)(i)). 56th Council ne (i) hatane aur discount ko s.34 ke credit note se dene ki salah di [S-A1]; ye kanoon ban gaya ya nahi, is run me nahi dekha.
  - Value me judte hain: "subsidies directly linked to the price", sarkari subsidy chhod ke; ye us supplier ki value me judti hai jise subsidy milti hai (s.15(2)(e)).
  - Circular 92/11/2019: invoice pe likha "buy more save more" discount value se bahar; baad ke discount sirf s.15(3) ki shart pe.
- **Source:** [S-A3] s.15; [S-A1] para 7.1; [S-A7].
- **Hamare faisle se mel:** D-101 niyam 4 (line pe "discount, kisne diya") **fit**, data ke liye. **Kami:** platform ka discount (D-101 niyam 1: seller ko poora daam, farak platform deta hai) seller ki taxable value ghatata hai ya nahi, ye kanoon se pakka nahi hua: platform ka diya hissa s.15(2)(e) jaisa "price se judi subsidy" ya teesre paksh ka consideration maana jaa sakta hai, yaani seller ki value poora daam.
- **Prastaav:** brand ka discount invoice pe "discount" line (value kam). Platform ka discount: R2 se pehle CA se tay ho ki seller ke invoice pe value poora daam ho aur customer ko platform ka discount alag dikhe, ya kuch aur. Tab tak data model me dono rakam (customer ne diya, platform ne diya) alag.
- **Dummy me kya:** R2 me test ke offers; invoice ke "SPECIMEN" pe dono lines.
- **Status:** `Aadha jaancha`.

### L-008. Points ki chhoot ka invoice aur GST

- **Kya jaanchna tha:** D-173 aur D-175 (points pe GST, points ki chhoot ka invoice pe asar).
- **Kanoon kya kehta hai:** points muft milte hain (koi consideration nahi), to points dena khud supply nahi lagta (s.7 ka "consideration" wala dhaancha; seedha niyam nahi mila). Points se mili chhoot platform deta hai (D-175), to L-007 wala sawal: seller ki value poora daam ho sakti hai.
- **Source:** [S-A3] s.15; [S-A5] (vouchers ka tark, sirf milta-julta).
- **Hamare faisle se mel:** D-175 (seller ko poora daam) data me **fit**; GST ka ilaaj L-007 ke saath **kami**.
- **Prastaav:** L-007 ke saath hi CA se ek niyam; points ki liability ka khaata (D-173) GST se alag.
- **Dummy me kya:** R2 ke test points.
- **Status:** `Aadha jaancha`.

### L-009. Free samples aur gifts pe GST

- **Kya jaanchna tha:** D-121 (₹0 ki line, "not for sale").
- **Kanoon kya kehta hai:** Circular 92/11/2019: bina consideration ke diye free samples aur gifts supply nahi (Schedule I wale maamle chhod ke, jaise related persons); unpe lage inputs ka ITC nahi milta (s.17(5)(h): "gift or free samples" pe ITC band). "Buy one get one" free nahi maana jaata: ek daam me do supplies, aur ITC milta hai.
- **Source:** [S-A7] (secondary text); [S-A3] s.17(5)(h), Schedule I.
- **Hamare faisle se mel:** D-121 niyam 2 (₹0 line) **aadha fit**. **Kami:** jo gift kisi kharid ki shart pe mile (jaise "₹999 se upar pe free sample"), wo "buy one get one" jaisa ek daam ki supply maana jaa sakta hai, free nahi; tab ₹0 ki line sahi nahi, daam cheezon me baanta jaata hai.
- **Prastaav:** do tarah: (a) bina shart ka sample: tax invoice me taxable line nahi, alag "free sample, not for sale" ki line ya document; brand ko report ki kitne samples gaye (ITC ulatne ke liye). (b) kharid ki shart wala gift: CA ki salah tak R2 me na chale, ya invoice me us order ki value ka hissa. Sample ke pack ka label L-039 me.
- **Dummy me kya:** R2 me test ke samples.
- **Status:** `Aadha jaancha` (circular sirf secondary se).

### L-010. Kits aur combos: mixed ya composite supply

- **Kya jaanchna tha:** D-088.
- **Kanoon kya kehta hai:** **composite supply** = do ya zyada supplies jo swabhavik roop se saath bundle hon, ek principal (s.2(30)); us pe principal ka rate (s.8(a)). **Mixed supply** = do ya zyada alag supplies ek daam pe, jo composite nahi (s.2(74)); us pe sabse **zyada rate** wali cheez ka rate (s.8(b)). Act ki misaal: alag-alag bik sakne wali cheezon ka package ek daam pe mixed supply hai; alag daam pe bikein to mixed nahi.
- **Source:** [S-A3] s.2(30), s.2(74), s.8.
- **Hamare faisle se mel:** D-088 niyam 1 (brand ka kit = ek product, ek MRP) **fit**, par kit ka rate: shampoo (5%) + conditioner (18%) ka kit mixed supply ho to poora kit 18%. **Takrav ka jokhim:** D-088 niyam 3 (combo ka daam cheezon me baant ke har cheez ki line apne rate pe): agar combo "A + B ₹X" ek daam ka offer hai, to s.8(b) ke hisaab se poora combo sabse zyada rate pe lag sakta hai; har line apne rate pe lagana galat ho sakta hai.
- **Prastaav:** kit ki listing pe HSN aur rate ka chunaav "kit ka rate" (sabse zyada wala, jab tak CA na kahe) ke default se. Combo (R2) pe CA se tay ho: (a) ek daam = mixed supply, sab lines sabse zyada rate pe; ya (b) alag daam dikhakar alag supplies. §6 me.
- **Dummy me kya:** test data me ek 5% + 18% ka kit, invoice pe 18%.
- **Status:** `Jaancha` (Act ka text); kit aur combo pe laagu karna CA ka kaam.

### L-011. Commission aur fees pe GST, aur seller ko fees ka invoice

- **Kya jaanchna tha:** D-078 niyam 5, D-094, BDA §8.2 #6.
- **Kanoon kya kehta hai:** platform ki fees (commission, fulfilment, storage, disposal) platform ki seller ko taxable seva hain; platform ko seva ka tax invoice dena hai (s.31(2): seva ke pehle ya baad, tay samay me). 56th Council ki list me in sevaon ka rate nahi badla [S-A1]; inka rate (aam taur pe 18%) aur seva invoice ka tay samay (rule 47) is run me primary text se nahi dekha. Platform aur house brand related persons hon (s.15 ki Explanation: common control waghera) to unke beech ki seva ki value ke alag niyam (open market value) lagte hain.
- **Source:** [S-A3] s.15 Explanation, s.31(2); [S-A1].
- **Hamare faisle se mel:** D-078 niyam 5 (fees pe platform ka GST alag line me) **fit**. House brand (D-031) pe fees baaki sellers jaisi hon to related-person valuation ka jokhim kam.
- **Prastaav:** platform ka seller ko fees ka tax invoice (platform ke GSTIN se): har payout ya mahine ka ek, har fee ki line, SAC aur rate table se. Payout statement (D-081) aur fees invoice alag documents. House brand pe fees ka wahi rate card (koi special rate nahi), taaki related-person valuation ka sawal na uthe.
- **Dummy me kya:** platform ka dummy GSTIN, fees invoice "SPECIMEN".
- **Status:** `Aadha jaancha` (rate aur samay ki seema primary se nahi).

### L-012. Customer se delivery fee pe GST aur kiska invoice

- **Kya jaanchna tha:** D-107 (platform ka invoice ho sakta hai).
- **Kanoon kya kehta hai:** local delivery SAC 996813 pe 18% (koi badlav nahi), aur 56th Council ne ECO ke through local delivery ko s.9(5) me laane ki salah di jab delivery karne wala registration ke liye bound na ho [S-A1]. Secondary ke hisaab se Notification 17/2025-CT(Rate) ne ye laagu kiya, aur **27 Oct 2026** ki Notifications 06/2026 aur 09/2026-CT(Rate) ne **1 Nov 2026 se** "delivery services" (postal aur courier chhod ke) ko 5% bina ITC aur ECO ki s.9(5) wali zimmedari me daala. Ye bahut naya badlav hai; primary text nahi khula.
- **Source:** [S-A1] (services table); [S-A10] (secondary).
- **Hamare faisle se mel:** D-107 Asar (delivery platform ki seva, fee ka invoice platform ka) **fit**: platform ki apni seva, apne GSTIN se, seller ke invoice se alag. Agar fee seller ke invoice me jaati to wo maal ki value me judti (s.15(2)(c)), aur kai sellers wale order (D-107 niyam 2) me baantni padti.
- **Prastaav:** fee ka platform ka alag B2C invoice (order pe ek). Rate aur s.9(5) ka sawal (hamare gig partners platform ko seva dete hain, customer ko "through ECO" nahi) CA se, 1 Nov 2026 ke badlav ke saath. Rate table (D-086 jaisi) me SAC ki row tareekh ke saath.
- **Dummy me kya:** fee ka invoice "SPECIMEN", rate table se.
- **Status:** `Aadha jaancha` (naya badlav sirf secondary).

### L-013. GST TCS (CGST Act s.52)

- **Kya jaanchna tha:** rate, kis rakam pe, kab, aur kaun si filing (D-081, D-134, PROJECT_PLAN R1 #11, BDA §8.2 #4).
- **Kanoon kya kehta hai:**
  - ECO (agent nahi) un supplies ki **net value** pe TCS collect kare jo doosre suppliers uske through karte hain, jab consideration ECO collect karta hai (s.52(1)).
  - Rate **0.25% CGST + 0.25% SGST** (intra-state), 10 Jul 2024 se (Notification 15/2024-CT ne Notification 52/2018-CT me "half per cent" ko "0.25 per cent" kiya). IGST wala 0.5% (Notification 01/2024-IGST, secondary).
  - Net value = mahine me registered suppliers ki taxable supplies (s.9(5) ki seva chhod ke) **minus** usi mahine lautayi supplies.
  - Jama: mahine ke baad 10 din me (s.52(3)); mahine ka statement 10 din me (s.52(4), GSTR-8); saal ka statement 31 December tak (s.52(5)).
  - ECO ka registration compulsory (s.24(x)); ECO ke through bechne wale supplier ka bhi, bina turnover ki seema ke (s.24(ix)).
- **Source:** [S-A4]; [S-A3] s.24, s.52.
- **Hamare faisle se mel:** R1 ka seller hisaab (TCS) aur D-134 (L3) **fit**. D-081 (payout hafte me, return window ke baad): TCS ka hisaab **mahine ki supplies** pe hota hai, payout pe nahi; ye kami nahi, bas finance me do alag ghadiyan.
- **Prastaav:** finance me har seller, har mahine: invoices ki taxable value minus usi mahine ke credit notes = net value; uska TCS us mahine ka; payout me us mahine ki TCS ki kaat. Rate tareekh wali setting me (aage badal sake). TCS registration har us state me jahan warehouse hai (D-036 ke saath). GSTR-8 jaisa register aur export R2 (D-134).
- **Dummy me kya:** platform ka dummy TCS registration number "DUMMY" badge ke saath; GSTR-8 jaisi report "SPECIMEN".
- **Status:** `Jaancha`.

### L-014. Income-tax TDS (pehle s.194-O; ab Income-tax Act 2025 s.393)

- **Kya jaanchna tha:** rate, shartein, kab kaatna (D-081, R1 #11).
- **Kanoon kya kehta hai (secondary):** 1 Apr 2026 se Income-tax Act 2025 laagu; e-commerce operator ka TDS s.393(1) ki table (Sl. No. 8(v) batayi gayi), pehle s.194-O. Rate **0.1%** "gross amount of sales or services" pe (1 Oct 2024 se; pehle 1%). Kaatna seller ke khaate me **credit ya payment, jo pehle ho**, us pe. Individual ya HUF seller ki saal ki bikri ₹5 lakh tak ho aur PAN ya Aadhaar diya ho to nahi. Return Form 26Q. Table ka serial number sources me alag-alag (8(v) ya 13) mila.
- **Source:** [S-A8] (secondary); incometaxindia.gov.in nahi khula.
- **Hamare faisle se mel:** R1 ka hisaab **fit**. **Dhyan:** "credit" pe kaatna: agar finance delivery pe hi seller ke ledger me bikri ki rakam credit karta hai (payable D-081 baad me), to TDS usi credit pe banta hai, payout pe nahi.
- **Prastaav:** finance me TDS ka pal = seller ke ledger me bikri ka pehla credit. Gross amount me GST shamil ho ya nahi, return pe TDS ka kya, aur bina PAN ki rate: CA se (CBDT ke circular aur naye Act ka text run 2 ki tarah ek baar aur). Rate aur table ka reference setting me.
- **Dummy me kya:** dummy PAN, TDS ki report "SPECIMEN".
- **Status:** `Aadha jaancha` (sirf secondary).

### L-015. House brand alag company: baaki sellers jaisa hi?

- **Kya jaanchna tha:** D-031 ke baad TCS aur TDS house brand pe bhi (BDA §11 #10, BDA2 §9.2).
- **Kanoon kya kehta hai:** s.52 "other suppliers" ki supplies pe TCS maangta hai; alag company (apna GSTIN) doosra supplier hai, to TCS laagu. TDS bhi e-commerce participant (ECO ke through bechne wala resident) pe, company ho ya nahi. Dono companies related persons ho sakti hain (s.15 Explanation: ek doosre ko control kare, ya dono ek teesre ke control me); tab related persons ke beech ki supply ke valuation ke niyam aur Schedule I.
- **Source:** [S-A3] s.15, s.52, Schedule I; [S-A8].
- **Hamare faisle se mel:** D-031 (alag company, koi shortcut nahi) **fit**. "Apne brand pe TCS nahi" wala purana niyam ab laagu nahi.
- **Prastaav:** finance me house brand ke liye koi alag raasta nahi: TCS, TDS, fees invoice sab waise hi. Seller record pe "related party: haan" ka field (E-commerce Rules ke liye bhi, L-078).
- **Dummy me kya:** house brand ki dummy company, dummy GSTIN aur PAN.
- **Status:** `Jaancha` (TCS primary); TDS secondary pe.

### L-016. Seller ka GST registration warehouse wale state me

- **Kya jaanchna tha:** D-036 aur D-060 (warehouse wale state ka GSTIN; maal seller ka).
- **Kanoon kya kehta hai:** ECO ke through bechne wale supplier ko registration lena compulsory (s.24(ix)). Seller ka maal teesre paksh ke warehouse me ho to aam taur pe wo warehouse seller ki "additional place of business" ke roop me registration me judta hai; is run me iska rule aur PRD me likhi CBIC clarification (25 Sep 2025) nahi khuli.
- **Source:** [S-A3] s.24.
- **Hamare faisle se mel:** D-036 **fit**.
- **Prastaav:** seller onboarding ki checklist me "warehouse ka pata aapke GST registration me additional place of business ki tarah juda hai" ka saboot (registration certificate ka hissa); staff jaanch (D-134 L2).
- **Dummy me kya:** dummy GSTIN ke certificate ki dummy image.
- **Status:** `Aadha jaancha`.

### L-017. Kho gaye ya nasht maal ki bharpai aur tax

- **Kya jaanchna tha:** D-063 (bharpai pe GST, brand ke tax me hisaab) aur D-062 (nasht).
- **Kanoon kya kehta hai:** jo maal "lost, stolen, destroyed, written off" ho, ya gift ya free sample me diya jaaye, us pe ITC nahi milta (s.17(5)(h)), yaani brand ko apna ITC ulatna pad sakta hai. Bharpai (compensation) pe GST: Circular 178/10/2022 (liquidated damages aur compensation) ka zikr Circular 243 me hai (supply tabhi jab kuch karne ya na karne ka saaf ya nihit agreement ho); Circular 178 khud is run me nahi khula.
- **Source:** [S-A3] s.17(5)(h); [S-A5] para 6.3.
- **Hamare faisle se mel:** D-063 (bharpai seller ke hisaab me credit) **fit** data me; GST ka ilaaj **kami**.
- **Prastaav:** bharpai ki line payout statement me "compensation (GST ka ilaaj CA se)" ke roop me, fees ki line se alag. Seller ko har mahine "kho gaya, toota, nasht" units ki report batch ke saath, taaki wo apna ITC ulat sake. D-062 ki disposal ka record yahi report bhi.
- **Dummy me kya:** test me ek kho gaya batch, report "SPECIMEN".
- **Status:** `Aadha jaancha`.

### L-018. B2B invoice (GSTIN wala) aur tax credit

- **Kya jaanchna tha:** D-092, D-065 niyam 4, D-069 niyam 2.
- **Kanoon kya kehta hai:** registered recipient ke invoice pe uska naam, pata aur GSTIN (rule 46). Recipient ka ITC invoice aur supplier ke return pe tika hai (s.16). Maal ki supply ka place of supply wahan jahan maal ki movement khatam hoti hai (IGST Act s.10; is run me nahi khola); Maharashtra me delivery to Maharashtra ka CGST + SGST.
- **Source:** [S-A6]; [S-A3] s.16.
- **Hamare faisle se mel:** D-092 (format check aur naam) **fit**. **Kami:** customer ka GSTIN kisi aur state ka ho aur delivery Maharashtra me, to invoice Maharashtra ka CGST + SGST ka banega, jiska credit doosre state ka GSTIN shayad na le paaye. E-invoice wale seller (L-004) pe B2B invoice ka IRN.
- **Prastaav:** checkout pe GSTIN ka state code delivery ke state se na mile to saaf chetavni ("is GSTIN pe credit shayad na mile"); invoice pe GSTIN, naam aur pata. IGST s.10 run 2 me ek baar.
- **Dummy me kya:** dummy GSTIN (L-024 ke niyam se).
- **Status:** `Aadha jaancha`.

### L-019. Ek parcel me kai sellers ke invoices

- **Kya jaanchna tha:** D-077.
- **Kanoon kya kehta hai:** har supplier apna invoice deta hai (s.31); kai suppliers ka maal ek parcel me jaane pe GST me koi rok is run me nahi mili. Raste ke document (e-way bill) ke niyam run 2.
- **Source:** [S-A3] s.31.
- **Hamare faisle se mel:** D-077 niyam 2 (parcel ke andar har seller ka invoice) **fit**.
- **Prastaav:** parcel ke saath har seller invoice ki copy (print ya QR se link), aur parcel label pe kis-kis invoice ke items. E-way bill run 2.
- **Dummy me kya:** test ka ek do-seller parcel.
- **Status:** `Aadha jaancha`.

### L-020. Invoice pe customer ka naam aur pata zaroori hai ya nahi

- **Kya jaanchna tha:** D-143 niyam 3, D-219, SR-088, Security §11 #25.
- **Kanoon kya kehta hai:** unregistered (B2C) customer ke invoice pe naam, pata, delivery ka pata aur state ka naam aur code tab zaroori jab taxable value **₹50,000 ya zyada** ho (rule 46(e)); usse kam pe sirf tab jab customer kahe (secondary). 2022 ke ek badlav ke baad kuch maamlon me recipient ke state ka naam zaroori (secondary). Delivery ka pata place of supply se alag ho to wo bhi (rule 46(n), flyer).
- **Source:** [S-A6] (rule 46(e), (n)); [S-A10] (₹50,000 se kam aur 2022 ka badlav).
- **Hamare faisle se mel:** D-143 niyam 3 ("sirf wo jo invoice pe zaroori") **fit**, par ₹50,000 se upar ke invoice pe naam aur pata zaroori, jo D-143 niyam 2 (seller ko customer ka naam, pata nahi) ke saath tension hai.
- **Prastaav:** invoice pe: ₹50,000 se kam pe customer ka state (aur shehar ya pincode), naam aur pata sirf customer ke kehne pe; ₹50,000 ya zyada pe poora. Seller ki invoice copy (SR-088) me wahi jo invoice pe chhapa. §6 me.
- **Dummy me kya:** test me ek ₹50,000 se upar ka B2C order.
- **Status:** `Aadha jaancha`.

### L-021. Tax records kitne din rakhne hain

- **Kya jaanchna tha:** D-193, D-194, D-151, SR-066, Security §11 #20, BDA2 §7.3 #15.
- **Kanoon kya kehta hai:** GST ke books aur records us saal ke annual return ki due date se **72 mahine** tak rakhne hain; appeal, revision ya jaanch chal rahi ho to us maamle ke records faisle ke 1 saal baad tak, ya 72 mahine, jo baad me (s.36). Income-tax ke records ka samay is run me nahi khola.
- **Source:** [S-A3] s.36.
- **Hamare faisle se mel:** D-194 ("kanooni samay tak") **fit**. **Takrav:** D-151 niyam 1 aur SR-066: account delete pe "invoice aur ledger me naam, pata aur email hata ke ek code". Jaari hua invoice ek tax record hai; ₹50,000 se upar ke B2C aur har B2B invoice pe naam aur pata zaroori hai (L-020), aur record 72 mahine tak waisa hi rakhna hai. D-193 ka "seller KYC band hone ke 3 saal baad" GST ke 72 mahine se chhota ho sakta hai jahan wo dastavez tax record ka hissa hain (jaise GSTIN certificate, TCS ke statements).
- **Prastaav:** jaari invoice aur credit note ki asli copy ek alag, kam pahunch wale "tax archive" me 72 mahine (+ jhagde ka samay) tak bina badlav; app ki baaki jagah (orders, ledger ki views) se naam, pata, email hatayein. Archive ki safai samay poora hone pe. §6 me.
- **Dummy me kya:** retention ki setting (72 mahine) asli; data dummy.
- **Status:** `Jaancha` (GST); income-tax ka samay `Jaancha nahi`.

### L-022. Gift cards (vouchers) pe GST

- **Kya jaanchna tha:** D-179 (gift voucher pe GST, bina kharch ke balance).
- **Kanoon kya kehta hai:** Circular 243/37/2024: voucher ka len-den khud na maal ki supply hai na seva ki, chahe wo RBI ka PPI ho ya nahi; GST us maal ya seva pe jiske liye voucher istemaal hua. Bina istemaal ke voucher (breakage) pe GST nahi. Distributor ka commission seva hai.
- **Source:** [S-A5].
- **Hamare faisle se mel:** D-179 (design abhi, banana kanooni jaanch ke baad) **fit**: GST ka hissa saaf; gift card bechne pe GST invoice nahi, redemption pe seller ka invoice (gift card sirf payment ka tareeka). PPI ka sawal run 2.
- **Prastaav:** finance me gift card ki bikri "liability" ki entry, GST nahi; redemption pe order ka normal invoice, payment method "gift card". Breakage ka hisaab accounting me (run 2 ke PPI niyam ke baad).
- **Dummy me kya:** R2 ke baad test me.
- **Status:** `Jaancha` (GST); PPI `Run 2`.

### L-023. Consultation seva pe GST

- **Kya jaanchna tha:** D-172 (seva pe GST).
- **Kanoon kya kehta hai:** D-172 me consultation muft hai; GST supply ke liye aam taur pe consideration chahiye (s.7), to muft seva pe GST ka sawal nahi uthta. Paid hone pe health care ki chhoot ya beauty seva ka rate (56th Council ne beauty aur physical well-being sevaon ko 18% se 5% bina ITC kiya [S-A1]) alag se dekhna hoga.
- **Source:** [S-A3] s.7; [S-A1].
- **Hamare faisle se mel:** D-172 **fit**.
- **Prastaav:** paid consultation kabhi aaye to CA se SAC aur rate; abhi kuch nahi.
- **Dummy me kya:** kuch nahi.
- **Status:** `Aadha jaancha`.

### L-024. Demo site pe dummy GSTIN aur specimen invoices

- **Kya jaanchna tha:** D-145, D-133 (GST ka hissa).
- **Kanoon kya kehta hai:** bina supply ke invoice jaari karna GST me saza wala kaam hai (s.122(1)(ii): "issues any invoice or bill without supply"). Demo ke documents ko asli invoice jaisa na dikhna, ye isi se juda hai.
- **Source:** [S-A3] s.122.
- **Hamare faisle se mel:** D-145 niyam 2, 3 aur 5 (watermark, DUMMY badge, asli number se mel nahi) **fit** aur zaroori.
- **Prastaav:** dummy GSTIN aise banayein ki GSTIN ka check digit jaan-boojh ke galat ho (asli GSTIN kabhi na ban sake), aur PAN wala hissa bhi saaf nakli pattern ka. PDF ke saath document ke metadata me bhi "SPECIMEN".
- **Dummy me kya:** yahi.
- **Status:** `Aadha jaancha` (s.122 2021 copy se; check digit ka format is run me nahi jaancha).

## 3. B: Legal Metrology

**Is area ke sources (sab is run me khole, 2026-11-19):**

- **[S-B1]** Legal Metrology (Packaged Commodities) Rules, 2011, "As amended upto February 13, 2026" (har badlav ke G.S.R. number ke footnotes ke saath), Khaitan & Co ki consolidated copy: <https://www.khaitanco.com/sites/default/files/2026-03/Legal%20Metrology%20%28Packaged%20Commodities%29%20Rules%202011.pdf>. Primary text, secondary host.
- **[S-B2]** Legal Metrology (Packaged Commodities) Amendment Rules, 2026, G.S.R. 128(E), Gazette of India Extraordinary, 13 Feb 2026 (CG-DL-E-13022026-270123), Fox Mandal ki hosted copy: <https://foxmandal.in/wp-content/uploads/2026/02/Legal-Metrology-Packaged-Commodities-Amendment-Rules-2026.pdf>. Primary document, secondary host. Isme likha hai ki principal rules ka pichhla badlav G.S.R. 881(E), 2 Dec 2025 tha (uska vishay is run me nahi dekha).
- **[S-B3]** GST rate badlav ke baad MRP sticker ki chhoot (DoCA ka 9 Sep 2025 ka circular, rule 33 ke tahat, aur 18 Sep 2025 ki narmi): sirf secondary saar, jaise <https://ssrana.in/articles/government-relaxes-lmpc-compliance-after-gst-rate-revisions/> aur <https://www.businesstoday.in/amp/latest/economy/story/govt-allows-use-of-old-mrps-till-dec-but-firms-must-pass-on-gst-cuts-493267-2025-09-09>. Secondary.

### L-030. MRP saare taxes samet, aur MRP se upar bikri nahi

- **Kya jaanchna tha:** D-061 niyam 1 aur D-064 niyam 1.
- **Kanoon kya kehta hai:** har retail package pe retail sale price "maximum retail price inclusive of all taxes" Indian currency me (rule 6(1)(e)). Koi bhi (retail dealer, manufacturer, packer, importer, wholesale dealer) package ko us retail sale price se zyada pe nahi bech sakta (rule 18(2)). Retail dealer MRP ko mita, badal ya chhupa nahi sakta (rule 18(5)).
- **Source:** [S-B1] rules 6(1)(e), 18(2), 18(5).
- **Hamare faisle se mel:** D-061 niyam 1 (daam 0 se zyada aur MRP se zyada nahi) aur D-064 niyam 1 **fit**.
- **Prastaav:** server pe check (SR-042 pehle se) bana rahe; MRP batch ka, pack se (D-096 ki suchna aur label photo). Tax badalne pe "revised MRP" L-036 me.
- **Dummy me kya:** dummy products ke asli jaise MRP.
- **Status:** `Jaancha`.

### L-031. E-commerce page pe zaroori declarations (rule 6(10))

- **Kya jaanchna tha:** online pe pack ki kaunsi jaankari zaroori (D-064, D-134 ki declarations row, BDA §8.2 #2).
- **Kanoon kya kehta hai:** e-commerce entity ye pakka kare ki rule 6(1) ki saari zaroori declarations, **sirf mfg ka mahina-saal chhod ke**, uske digital platform pe dikhen (rule 6(10)). Rule 6(1) me: manufacturer ka naam aur pata (packer alag ho to dono; imported pe importer); imported pe country of origin; common ya generic naam (ek package me kai products hon to har ek ka naam aur ginti); net quantity; MRP (taxes samet); jahan zaroori, size ya dimensions; jo maal samay ke saath kharab ho uspe "best before / use by" (jab tak kisi aur kanoon me alag niyam na ho). Cosmetics ke mfg date ke liye rule 6(1)(d) khud Drugs and Cosmetics ke niyam pe bhejta hai. Marketplace model me declarations ki **sahi hone ki zimmedari** manufacturer, seller ya importer ki, agar platform sirf intermediary ki tarah kaam kare (jaankari na chune, na badle) aur due diligence kare; agar platform ne galti me saath diya, ya jaankari milne pe turant nahi hataya, to ye suraksha nahi.
- **Source:** [S-B1] rule 6(1), 6(10).
- **Hamare faisle se mel:** D-134 (declarations ke bina listing live nahi) **fit**. D-098 niyam 3 (staff khud koi field nahi badalta, sirf "ye badlo") rule 6(10) ki marketplace wali suraksha ke saath **fit**. "Jaankari milne pe turant hatana" ke liye D-129 niyam 5 (platform batch rok sake) jaisa raasta listing ke liye bhi chahiye.
- **Prastaav:** listing ke zaroori fields: generic naam, net quantity (unit ke saath), MRP, manufacturer naam-pata, packer naam-pata (alag ho to), marketer ya brand owner (label pe ho to), importer naam-pata aur country of origin (imported), size (jahan laagu), kit me har cheez ki list (L-040). Product page pe ek "Pack ki jaankari" ka hissa. Galat declaration ki report pe staff listing ko "jaanch tak rok" sake, wajah ke record ke saath.
- **Dummy me kya:** dummy manufacturer ke naam aur pate `example` jaise, D-145 ke "DUMMY" ke saath.
- **Status:** `Jaancha`.

### L-032. Unit sale price

- **Kya jaanchna tha:** prati unit daam (BDA §8.2 #2).
- **Kanoon kya kehta hai:** har pre-packaged commodity pe unit sale price (rupees me, do decimal tak): 1 kg se kam pe per gram, 1 litre se kam pe per millilitre, zyada pe per kg ya litre, number se bikne wale pe per unit; jahan retail sale price aur unit sale price barabar hon wahan zaroori nahi (rule 6(11), 1 Jan 2024 se). Ye rule 6(1) ka hissa nahi, aur rule 6(10) sirf rule 6(1) ki declarations online maangta hai; to online unit sale price ka saaf niyam is padhaai me nahi mila. Combination aur multi-piece packages pe 2023 ka ek chhoot wala badlav secondary me dikha.
- **Source:** [S-B1] rule 6(10), 6(11).
- **Hamare faisle se mel:** D-134 ki list me unit sale price nahi hai: **kami nahi** (kanoon online nahi maangta, jitna padha), par asli jaisa hone ke liye achha.
- **Prastaav:** product page aur cart pe system se nikla unit sale price (MRP / net quantity, rule 6(11) ki unit me), bina seller ke extra kaam ke. Kits pe nahi.
- **Dummy me kya:** dummy MRP aur quantity se.
- **Status:** `Jaancha` (online ka saaf niyam nahi mila, ye bhi jaancha).

### L-033. Country of origin aur uska filter

- **Kya jaanchna tha:** D-127, D-138; imported products ka country of origin filter zaroori hai ya nahi (BDA §8.2 #2, BDA2 §7.3 #6).
- **Kanoon kya kehta hai:** imported product ke package pe country of origin ya manufacture ya assembly (rule 6(1)(aa)); online bhi (rule 6(10)). **1 July 2026 se** naya rule 6(10A): imported products bechne wali har e-commerce entity apni listings me country of origin ka **searchable aur sortable filter** de.
- **Source:** [S-B2] (G.S.R. 128(E), 13 Feb 2026, laagu 1 Jul 2026); [S-B1].
- **Hamare faisle se mel:** D-127 (listing pe country of origin) aur D-138 (country of origin ka filter R1 me) **fit**. **Kami:** rule "searchable aur sortable" kehta hai; D-138 ke sort me country of origin nahi.
- **Prastaav:** D-138 ke sort me "country of origin" jodna, ya kam se kam listing ko country se kram me dikhane ka raasta; search me country ka naam (jaise "Korea") bhi match ho. Ye naya niyam (2026) hai, isliye COMPLIANCE me tareekh ke saath.
- **Dummy me kya:** test data me ek imported dummy product.
- **Status:** `Jaancha`.

### L-034. Manufacturer, packer, importer aur marketer ki jaankari

- **Kya jaanchna tha:** D-127, D-134 ki "maker ya importer" row.
- **Kanoon kya kehta hai:** rule 6(1)(a): manufacturer ka naam-pata; manufacturer packer na ho to dono; imported pe importer. Label pe brand owner marketer ki tarah ho to violation ke liye wahi "deemed manufacturer" (Explanation II). Label pe bina "manufactured by" ya "packed by" ke kisi company ka naam ho to wo manufacturer maani jaati hai (Explanation I).
- **Source:** [S-B1] rule 6(1)(a) aur Explanations.
- **Hamare faisle se mel:** D-127 **fit**. House brand (D-031) jo contract manufacturer se banwaye, label pe marketer ho to Legal Metrology ki zimmedari house brand company ki: D-031 (alag company) ke saath **fit**.
- **Prastaav:** L-031 ke fields me manufacturer, packer, marketer, importer chaaron alag; staff label photo se milaye.
- **Dummy me kya:** dummy naam.
- **Status:** `Jaancha`.

### L-035. Customer care ki jaankari

- **Kya jaanchna tha:** D-134 ki "customer care" row.
- **Kanoon kya kehta hai:** har package pe us vyakti ya office ka naam, pata, telephone number aur email jahan consumer complaint ho sake (rule 6(2)). Rule 6(10) online ke liye rule 6(1) ki baat karta hai; rule 6(2) uske bahar. E-commerce Rules me seller ka customer care alag se (L-070).
- **Source:** [S-B1] rule 6(2), 6(10).
- **Hamare faisle se mel:** D-134 **fit** (zyada hi).
- **Prastaav:** listing pe label wala customer care (naam, pata, email, phone) ek field; product page pe "Pack ki jaankari" me. Phone sirf contact ke liye dikhe.
- **Dummy me kya:** `example` email aur dummy phone, "DUMMY" ke saath.
- **Status:** `Jaancha`.

### L-036. Batch ke hisaab se alag MRP, aur tax badalne pe revised MRP

- **Kya jaanchna tha:** D-064 aur D-086 (rate badalne pe MRP aur purana stock).
- **Kanoon kya kehta hai:**
  - Manufacturer, packer ya importer ek jaise package pe restrictive ya unfair trade practice se **alag-alag MRP** nahi rakh sakta (rule 18(2-A), Consumer Protection Act 2019 ke s.2(41) aur s.2(47) ka hawala). Yaani alag batches pe alag MRP mana nahi, par jaan-boojh ke ek jaise maal pe do MRP ka khel mana.
  - Pack hone ke baad tax badle: retailer us revised price se zyada nahi le sakta jo manufacturer ne bataya; manufacturer akhbaar aur dealers ko suchna de. Revised price **kam** ho to retailer usse zyada nahi le sakta, pack kisi bhi mahine ka ho (rule 18(3)).
  - MRP ghatane ke liye revised kam MRP ka sticker lag sakta hai, asli MRP dhake bina (rule 6(3) proviso).
  - Sep 2025 ke GST badlav ke baad DoCA ne rule 33 ke tahat bina bike stock pe revised MRP (stamp, sticker ya online printing) 31 Dec 2025 tak ki chhoot di, aur 18 Sep 2025 ko sticker optional kiya (sirf secondary).
- **Source:** [S-B1] rules 6(3), 18(2-A), 18(3), 33; [S-B3] (secondary).
- **Hamare faisle se mel:** D-064 (site pe agla batch ka MRP, wahi batch jaaye) **fit** aur rule 18(2-A) ke saath theek, kyunki alag MRP pack se aata hai, platform nahi banata. **Kami:** D-061 aur D-064 sirf pack ka chhapa MRP maante hain. Tax ghatne pe manufacturer ka bataya **revised lower MRP** purane batches pe bhi laagu hota hai (rule 18(3) ka aakhri proviso), jabki pack pe purana MRP chhapa hai.
- **Prastaav:** batch pe ek optional field "revised MRP (tax badlav)" + manufacturer ki suchna ka saboot; seller bhare, staff jaanche. Ho to daam ki seema (D-061), % off (D-120) aur site ka MRP isi se; customer ko "pack pe MRP ₹X; revised MRP ₹Y" dikhe. D-086 niyam 4 ke rate badlav ke alert me ye field bharne ki yaad.
- **Dummy me kya:** test me rate ghatne ki ek tareekh aur ek batch pe revised MRP.
- **Status:** `Jaancha` (rules); Sep 2025 ki chhoot `Aadha jaancha`.

### L-037. Online mfg date aur expiry (Legal Metrology ka hissa)

- **Kya jaanchna tha:** D-067 aur D-083 (online pe expiry dikhane ke niyam).
- **Kanoon kya kehta hai:** rule 6(10) online declarations se **mfg ka mahina-saal bahar** rakhta hai. Cosmetics ke mfg date ke liye rule 6(1)(d) Drugs and Cosmetics ke niyam pe bhejta hai, aur "best before / use by" ka clause (6(1)(da)) bhi tab laagu nahi jab kisi aur kanoon me niyam ho. Cosmetics ka label C area me (L-050, L-051).
- **Source:** [S-B1] rule 6(1)(d), 6(1)(da), 6(10).
- **Hamare faisle se mel:** D-067 (customer ko bheje jaane wale batch ki expiry dikhe) Legal Metrology se zyada hai: **fit**, koi takrav nahi.
- **Prastaav:** jaisa hai. E-commerce Rules ka hissa L-070 me.
- **Dummy me kya:** dummy batches ki expiry.
- **Status:** `Jaancha`.

### L-038. Net quantity

- **Kya jaanchna tha:** D-098 aur D-134 ki net quantity.
- **Kanoon kya kehta hai:** net quantity standard unit (weight ya measure) me, ya number se (rule 6(1)(c)); rules ki schedule me cosmetics (creams, shampoo waghera) ki ek entry hai jo batati hai ki kis unit me.
- **Source:** [S-B1] rule 6(1)(c), schedule entry 26.
- **Hamare faisle se mel:** D-098 (net quantity jokhim wala field, badlav pe jaanch) **fit**.
- **Prastaav:** net quantity = number + unit (g, ml, ya number) ki tay list se; unit sale price (L-032) isi se.
- **Dummy me kya:** dummy data.
- **Status:** `Jaancha`.

### L-039. Free samples ke pack

- **Kya jaanchna tha:** D-121 (sample ke label ke niyam).
- **Kanoon kya kehta hai:** 10 gram ya 10 ml ya usse kam ke package pe ye rules laagu hi nahi (rule 26(a)). Usse bade sample pe retail package ke saare niyam laagu hote hain ya nahi, "not for sale" sample ka is run me koi saaf rule nahi mila. Cosmetics label ke niyam alag (C).
- **Source:** [S-B1] rule 26(a).
- **Hamare faisle se mel:** D-121 niyam 3 (samples pe batch aur expiry) **fit**; "not for sale" ka nishaan theek hai.
- **Prastaav:** sample listing pe net quantity zaroori; 10 g/ml se bade sample pe bhi L-031 ke fields maango (asaan aur surakshit).
- **Dummy me kya:** R2 me test ke samples.
- **Status:** `Aadha jaancha`.

### L-040. Kits aur combination packs

- **Kya jaanchna tha:** D-088 niyam 1 (kit ki cheezon ki list).
- **Kanoon kya kehta hai:** ek package me ek se zyada products hon to har product ka naam aur ginti ya quantity (rule 6(1)(b)); kai units me bate components ki declaration main package pe (rule 6(5)).
- **Source:** [S-B1] rule 6(1)(b), 6(5).
- **Hamare faisle se mel:** D-088 niyam 1 **fit**.
- **Prastaav:** kit listing me har cheez: naam + net quantity; product page pe dikhe.
- **Dummy me kya:** test ka ek kit.
- **Status:** `Jaancha`.

### L-041. 10 g / 10 ml tak ke chhote packs

- **Kya jaanchna tha:** naya point (minis, chhoti lipstick, kajal); D-061 aur D-134 pe asar.
- **Kanoon kya kehta hai:** 10 g ya 10 ml ya kam ke packages pe Packaged Commodities Rules laagu nahi (rule 26(a)), yaani LM ke hisaab se MRP chhapna zaroori nahi. Cosmetics ke label ke niyam phir bhi (C).
- **Source:** [S-B1] rule 26(a).
- **Hamare faisle se mel:** D-134 (declarations ke bina listing nahi) zyada kada hai: theek. **Chhoti kami:** D-061 niyam 1 aur D-064 maante hain ki pack pe MRP hamesha hai; bina MRP wala chhota pack aaye to daam ki seema kis se.
- **Prastaav:** listing pe "pack pe MRP nahi (10 g/ml tak)" ka option sirf jab net quantity 10 g/ml ya kam ho; tab seller ek "reference MRP" de jo product page pe "MRP" ki jagah "Reference price" ke naam se dikhe, ya aise packs R1 me na lein. Owner ka faisla.
- **Dummy me kya:** abhi zaroorat nahi.
- **Status:** `Jaancha`.

### L-042. Veg / non-veg ka dot (cosmetics aur toiletries)

- **Kya jaanchna tha:** naya point (D-100 ke "vegan" claim se juda).
- **Kanoon kya kehta hai:** soap, shampoo, toothpaste aur doosre cosmetics aur toiletries ke package pe principal display panel ke upar non-vegetarian origin ke liye laal ya bhura dot, vegetarian ke liye hara dot (rule 6(8)). Ye rule 6(1) me nahi, to rule 6(10) se online zaroori nahi (jitna padha).
- **Source:** [S-B1] rule 6(8).
- **Hamare faisle se mel:** kisi faisle me nahi; **kami nahi**, par D-100 ka "vegan" claim aur pack ka dot takra sakte hain (laal dot + "vegan" claim).
- **Prastaav:** listing pe "pack pe dot: hara / laal-bhura" ka field label photo se; staff jaanch me "vegan" claim aur laal dot ka takrav pakde (D-100 Asar jaisa).
- **Dummy me kya:** dummy products pe.
- **Status:** `Jaancha`.

### L-043. Pro buyers aur MRP

- **Kya jaanchna tha:** D-065 (kharidaar ke hisaab se alag daam) ka Legal Metrology hissa.
- **Kanoon kya kehta hai:** "institutional consumer" ki chhoot sirf un packages pe jin pe "not for retail sale" likha ho aur jo seedha manufacturer, importer ya wholesale dealer se khud ke istemaal ke liye kharide jaayein (rule 2(bc), rule 3(c)). Retail packs pe MRP ki seema sab pe.
- **Source:** [S-B1] rule 2(bb), 2(bc), 3(c).
- **Hamare faisle se mel:** D-065 niyam 1 (Pro daam normal daam se zyada nahi, MRP ki seema) **fit**.
- **Prastaav:** Pro kharid bhi retail packs ki hi; "not for retail sale" wale packs R1/R2 me list na hon (warna alag niyam).
- **Dummy me kya:** kuch nahi.
- **Status:** `Jaancha`.

## 4. C: Cosmetics kanoon

**Is area ke sources (sab is run me khole, 2026-11-19):**

- **[S-C1]** Cosmetics Rules, 2020 (G.S.R. 763(E), 15 Dec 2020), CDSCO ki site: <https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2022/cos_rules/Cosmetics%20Rules%202020.pdf>. Primary. Ye **mool 2020 ka text** hai; baad ke badlav (jaise 2025 wala) isme nahi.
- **[S-C2]** CDSCO: "Frequently Asked Questions on Registration and Import of Cosmetics into India": <https://www.cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/cosmetics/Frequently-Asked-Questions-FAQcosmeticia.pdf>. Primary (sarkari FAQ; khud kanoon nahi). Isme Drugs and Cosmetics Act 1940 ke s.3(aaa) (cosmetic ki definition) ka text hai.
- **[S-C3]** Cosmetics (Amendment) Rules, 2025 (G.S.R. 513(E), 29 Jul 2025): sirf secondary saar, jaise <https://www.indialaw.in/blog/regulatory/cosmetics-rules-2025-new-norms-for-labels-licensing/> aur <https://www.mondaq.com/india/healthcare/1662676/cosmetics-amendment-rules-2025-enhancing-labelling-licensing-and-oversight>. Secondary.
- Recall aur product seller ke liye Consumer Protection Act 2019 ([S-D2], §5), aur Legal Metrology ka rule 6(1)(d) ([S-B1]).

### L-050. Cosmetic ke label pe kya zaroori hai

- **Kya jaanchna tha:** label ke zaroori fields (batch, mfg date, expiry ya use-before, ingredients, licence ya import registration number, manufacturer ya importer), BDA §8.2 #1; D-083, D-099, D-127.
- **Kanoon kya kehta hai:** rule 34: inner aur outer dono label pe cosmetic ka naam; manufacturer ka naam aur poora pata (factory apni na ho to asli manufacturer ya "Made in ..."; 30 g / 60 ml tak ke chhote containers pe sirf naam aur pincode ke saath principal place); use-before ya expiry ki jaankari (L-051). Inner ya outer label pe batch number ("B." ya "Batch No." waghera) aur manufacturing licence number ("M.L." waghera; imported me country of origin me zaroori na ho to chhoot). Outer label pe net contents. Khatre wale products pe istemaal ka tareeka, chetavni aur khatarnak ingredients. Imported pe unit pack pe import registration certificate number ("RC") aur importer ka naam-pata. Ingredients ki list (L-054). Ninth Schedule wale products pe BIS standard ka labelling. Ek hi label ho to saari jaankari usi pe. Indian origin ka cosmetic sirf licensed manufacturer ka bana aur in rules se labelled ho to hi bik sakta hai (rule 33).
- **Source:** [S-C1] rules 33, 34.
- **Hamare faisle se mel:** D-083, D-099, D-127, D-128 **fit**. D-099 ki label photo se ye sab ek saath jaancha ja sakta hai.
- **Prastaav:** listing ki jaanch me label photo se in fields ki checklist (naam, manufacturer, batch ya mfg month, M.L. ya RC number, net contents, expiry ki jaankari, ingredients, chetavni). Checklist category ke hisaab se (hair dye, toothpaste: L-067).
- **Dummy me kya:** dummy label images par asli jaisa dhaancha; numbers "DUMMY" (D-145).
- **Status:** `Jaancha`.

### L-051. Kya har cosmetic pe expiry zaroori hai; PAO ka kya

- **Kya jaanchna tha:** D-062, D-083 (label pe expiry ya use-before; PAO).
- **Kanoon kya kehta hai:** rule 34(1)(c) label pe in me se ek maangta hai: "use before" ya "date of expiry" (mahina aur saal), ya "use by", ya "expiry XX months from manufacture" ke saath manufacturing date. Yaani expiry ki jaankari kisi na kisi roop me **zaroori** hai; sirf PAO (khulne ke baad kitne mahine) is list me nahi. "Use before / date of expiry" ka matlab: wo tareekh jab tak cosmetic, label pe likhe storage me, standard ke hisaab se apne gun rakhta hai (rule 3(w)). Imported cosmetic ka use-before import ki tareekh se kam se kam 6 mahine baad ka ho (rule 18(2)).
- **Source:** [S-C1] rules 3(w), 18(2), 34(1)(c); [S-C2] Q.19.
- **Hamare faisle se mel:** D-083 niyam 1 aur 2 (pack ki expiry, ya mfg date + shelf life) aur niyam 3 (sirf PAO wala wapas) **fit**. D-083 niyam 4 (PAO alag field) theek.
- **Prastaav:** receiving pe "expiry ka roop" ka field: use before / expiry date / mfg + XX months. Imported batch pe receiving ke waqt import ki tareekh ke hisaab se check (brand ki zimmedari; staff ke liye chetavni).
- **Dummy me kya:** dummy batches me teeno roop.
- **Status:** `Jaancha`.

### L-052. "Use before" aur "expiry" ka din (2025 ka badlav)

- **Kya jaanchna tha:** naya point; D-062, D-067, D-082 ki ginti pe asar.
- **Kanoon kya kehta hai (secondary):** Cosmetics (Amendment) Rules 2025 (G.S.R. 513(E), 29 Jul 2025) ne rule 3(w) saaf kiya: "use before" ek mahine ka ho to us mahine ka **pehla din**, aur "date of expiry" us mahine ka **aakhri din** maana jaata hai. Rule 34(10) (export label) bhi badla.
- **Source:** [S-C3] (secondary; gazette ka text nahi khula).
- **Hamare faisle se mel:** D-062, D-067, D-082 bachi expiry ginte hain; label pe "Use before 03/2027" aur "Exp 03/2027" me lagbhag ek mahine ka farak. **Kami:** abhi expiry ek hi tarah ki tareekh maani gayi hai.
- **Prastaav:** batch ke expiry field ke saath L-051 ka "roop" aur system ka "aakhri din" (use before = pichhle mahine ka aakhri din; expiry = usi mahine ka aakhri din). Bikri band aur receiving ki seemaayein isi aakhri din se. Product page pe pack jaisa likha (jaise "Use before Mar 2027") hi dikhe.
- **Dummy me kya:** test me dono roop.
- **Status:** `Aadha jaancha`.

### L-053. Batch number kab nahi hota

- **Kya jaanchna tha:** naya point; D-064, D-097, D-106, D-113 batch ko pack se maante hain.
- **Kanoon kya kehta hai:** batch number ka niyam **10 g (solid, semi-solid) ya 25 ml (liquid) tak** ke cosmetic pe laagu nahi; **soap** pe batch number ki jagah manufacture ka mahina aur saal (rule 34(2)(a) ke provisos).
- **Source:** [S-C1] rule 34(2)(a).
- **Hamare faisle se mel:** **kami:** D-064 (batch se reservation), D-106 niyam 1 (customer label pe batch number ki photo de), D-113 niyam 1 (pickup pe batch milana) maante hain ki har pack pe batch hai. Chhote packs aur soaps pe nahi hoga.
- **Prastaav:** receiving pe "pack pe batch nahi" ka option sirf in do maamlon me; tab platform ka batch id (receiving lot + mfg month ya expiry), jo platform ke label ya bin (D-097) se juda. Aise items pe D-106 aur D-113 me batch ki photo ki jagah item aur pack ki photo. §6 me.
- **Dummy me kya:** test me ek soap aur ek mini.
- **Status:** `Jaancha`.

### L-054. Ingredients (label aur online) aur allergens

- **Kya jaanchna tha:** D-099, D-159 (label aur online page pe ingredients aur allergens).
- **Kanoon kya kehta hai:** label pe "INGREDIENTS" ke baad list: 1% se zyada wale wazan ya volume ke ghatte kram me, phir 1% ya kam wale kisi bhi kram me; **60 ml (liquid) ya 30 g (solid, semi-solid) tak** ke packs pe zaroori nahi (rule 34(7)). Online ingredients dikhana Cosmetics Rules me alag se nahi mila; E-commerce Rules "all mandatory notices and information provided by applicable laws" dikhane ko kehte hain (L-071). Cosmetics Rules 2020 ke text me "allergen" ka koi niyam nahi mila.
- **Source:** [S-C1] rule 34(7) (pura text dekha); [S-D1] rule 6(5)(c).
- **Hamare faisle se mel:** D-099 (poori list product page pe) aur D-159 (jaane-maane allergens ki chetavni) kanoon se **zyada**: fit. **Chhoti kami:** chhote packs pe label pe ingredients nahi hote, to D-099 niyam 1 ki "label photo se milao" wahan nahi chalegi.
- **Prastaav:** chhote packs pe ingredients ka saboot: outer carton ki photo ya brand ka product specification (dummy). Allergen chetavni pe ek line: "Ye platform ki list se hai; pack ki ingredients list dekhein."
- **Dummy me kya:** dummy ingredients.
- **Status:** `Jaancha`.

### L-055. Imported cosmetics ka registration

- **Kya jaanchna tha:** D-127 (registration aur label ke niyam).
- **Kanoon kya kehta hai:** koi cosmetic import nahi ho sakta jab tak Central Licensing Authority (CDSCO) ne us product ko register na kiya ho; application online portal pe Form COS-1 me, manufacturer, uske authorised agent, importer ya Indian subsidiary dwara (rule 12). Registration certificate hamesha ke liye valid, agar har 5 saal se pehle retention fee bhari jaaye (rule 14). Import mana: jo product apne desh me bikna mana ho; hexachlorophene wala; 12 Nov 2014 ke baad animals pe test hua (rule 18). Label pe RC number aur RC holder (marketing ke liye) ka naam-pata; India ke liye zaroori label bonded warehouse me sticker se lag sakta hai (rule 34(5), 34(9)).
- **Source:** [S-C1] rules 12, 14, 18, 34(5), 34(9); [S-C2] Q.55.
- **Hamare faisle se mel:** D-127 niyam 1 (importer ka naam-pata, country of origin, import registration number) **fit**.
- **Prastaav:** imported listing pe: RC number, RC holder ka naam (jo importer ya authorised agent ho), product RC me listed hai ki seller ki ghoshna, aur RC ki retention fee ki agli tareekh (staff ki yaad, D-134 L2 ke andar). Label photo pe "RC No." staff jaanche.
- **Dummy me kya:** dummy RC number "DUMMY".
- **Status:** `Jaancha`.

### L-056. Licence ka type aur manufacturing licence number

- **Kya jaanchna tha:** D-128 niyam 1 (licence ka type).
- **Kanoon kya kehta hai:** Indian cosmetics licence ya loan licence pe bante hain (rules 23 se 30, State Licensing Authority); label pe M.L. number (rule 34(2)(b)). Batch ke records licensee rakhta hai, batch ki expiry ke 3 saal baad tak (rule 26(f)).
- **Source:** [S-C1] rules 23, 25, 26(f), 34(2)(b).
- **Hamare faisle se mel:** D-128 niyam 1 **fit**.
- **Prastaav:** licence ke type me "cosmetic manufacturing licence ya loan licence" ek saath; M.L. number label photo se staff jaanche. House brand (D-031) contract manufacturer se banwaye to label pe us manufacturer ka M.L. number.
- **Dummy me kya:** dummy M.L. number.
- **Status:** `Jaancha`.

### L-057. Cosmetic aur drug ki seema, aur claims ke shabd

- **Kya jaanchna tha:** D-043, D-128, D-137 (cosmetic aur drug ke daawe ke shabd), BDA §8.2 #11, BDA2 §7.3 #7.
- **Kanoon kya kehta hai:** Drugs and Cosmetics Act s.3(aaa): cosmetic = shareer pe lagane ki cheez "for cleansing, beautifying, promoting attractiveness, or altering the appearance". CDSCO ka FAQ: label ya literature pe **drug claim** wala product cosmetic ki definition me nahi aata, aur cosmetic ki tarah register nahi ho sakta. Koi cosmetic jhootha ya gumraah karne wala daawa nahi kar sakta (rule 36).
- **Source:** [S-C2] Q.1, Q.54; [S-C1] rule 36.
- **Hamare faisle se mel:** D-137 niyam 3 (sirf cosmetic shabd, "treat" ya "cure" nahi), D-128 (drug type list nahi), D-043 **fit**.
- **Prastaav:** claims aur concern ki list ke saath "mana shabdon" ki list (jaise treat, cure, heal, prevent [bimari], anti-fungal, anti-acne medication) jo description ke free text (D-100 niyam 4) me bhi staff ki queue me bheje. Ye list D-132 ki blocklist jaisi senior role ke haath me.
- **Dummy me kya:** test listing me ek mana shabd.
- **Status:** `Jaancha`.

### L-058. Ayurvedic aur AYUSH beauty products ki seema

- **Kya jaanchna tha:** D-128 niyam 4 (herbal ya Ayurvedic naam wale cosmetic licence ke products).
- **Kanoon kya kehta hai:** Act me Ayurvedic, Siddha, Unani drugs alag category hain (drug), aur cosmetic ki definition sirf "beautifying" waghera ke liye. Yaani product ka darja uske licence aur daawe se tay hota hai, naam se nahi. AYUSH drug licence ke niyam (Drugs Rules 1945 ka alag hissa) is run me nahi khole.
- **Source:** [S-C2] Q.1 (cosmetic ki definition); AYUSH ka text nahi khola.
- **Hamare faisle se mel:** D-128 niyam 2 aur 4 **fit** (licence type se faisla).
- **Prastaav:** label pe "Ayurvedic medicine" ya AYUSH licence number dikhe to staff use drug type maane, chahe seller ne cosmetic chuna ho. AYUSH licence ki detail run 2.
- **Dummy me kya:** test me ek "herbal" cosmetic aur ek AYUSH drug label (reject).
- **Status:** `Aadha jaancha`.

### L-059. Cosmetic me mana ingredients (blocklist ka aadhaar)

- **Kya jaanchna tha:** D-128 niyam 3, D-132 (kaunse ingredients cosmetic me mana).
- **Kanoon kya kehta hai:** har cosmetic Ninth Schedule ke standards ya laagu quality aur safety standards maane; **IS 4707 Part 2 ke Annex A** wale raw materials cosmetic me nahi daale ja sakte; rang (dyes, colours, pigments) sirf IS 4707 Part 1/Part 2 aur Tenth Schedule wale, arsenic, lead aur heavy metals ki seema ke saath; hexachlorophene mana (soap me 1% tak, chetavni ke saath); mercury: aankh ke products me preservative ki tarah 70 ppm tak, baaki me 1 ppm (unintentional); rang ke liye lead aur arsenic compounds mana (rule 39).
- **Source:** [S-C1] rule 39. IS 4707 Part 2 khud is run me nahi khola.
- **Hamare faisle se mel:** D-132 (blocklist chhoti list se shuru) **fit**, par **kami:** blocklist me abhi sirf drug ingredients ke naam (D-128 niyam 3); cosmetic me kanooni taur pe mana ingredients (IS 4707 Part 2 Annex A) ka zikr nahi.
- **Prastaav:** blocklist ke do hisse: (a) drug ingredients (D-128), (b) "cosmetic me mana" (IS 4707 Part 2 Annex A se). Har entry pe source aur tareekh. BIS standard ke text ka license run 2 (L-127).
- **Dummy me kya:** blocklist ki shuruaati dummy list "source baaki" ke nishaan ke saath.
- **Status:** `Jaancha` (rule); standard ki list `Jaancha nahi`.

### L-060. Animals pe testing

- **Kya jaanchna tha:** D-100 ("cruelty-free" claim), D-127 (import).
- **Kanoon kya kehta hai:** koi bhi vyakti cosmetics ki testing ke liye animal ka istemaal nahi kar sakta (rule 39(7)); 12 Nov 2014 ke baad animals pe test hua cosmetic import nahi ho sakta (rule 18(4)); CDSCO FAQ bhi yahi kehta hai.
- **Source:** [S-C1] rules 18(4), 39(7); [S-C2] Q.55.
- **Hamare faisle se mel:** D-100 (cruelty-free pe certification) **fit**. Dhyan: India me bikne wale har cosmetic pe animal testing kanoonan mana hai, to "cruelty-free" ko khaas gun ki tarah dikhana gumraah kar sakta hai (misleading ads ka sawal, L-086).
- **Prastaav:** claim ka naam "certified cruelty-free (certifier ka naam)" aur sirf certificate ke saath; filter ka naam bhi yahi.
- **Dummy me kya:** dummy certificate.
- **Status:** `Jaancha`.

### L-061. Recall ki zimmedari aur regulator ko suchna

- **Kya jaanchna tha:** D-129, D-131, D-142 (recall, regulator ko suchna, customer ko suchna), BDA §8.2 #10.
- **Kanoon kya kehta hai:** manufacturer ya authorised agent ko lage ki bika hua cosmetic istemaal me sehat ke liye khatarnak ho sakta hai, to wo **turant** market se wapas lene ki prakriya shuru kare, wajah bataye, aur State ya Central Licensing Authority ko suchna de; authority ke saath sahyog kare aur kisi ko sahyog se na roke (rule 65). Inspector ke "stock mat becho" order ke baad wo stock bechna mana (rule 47). Central Consumer Protection Authority khatarnak saman ka recall aur kharidaron ko paisa wapas dilane ka order de sakti hai (CPA s.20). Customer ko kitne samay me suchna, iska koi tay samay nahi mila.
- **Source:** [S-C1] rules 47, 65; [S-D2] s.20.
- **Hamare faisle se mel:** D-129 (brand ya regulator ka recall, platform ka apna rok, kharcha brand ka) aur D-131 (recall ki khabar har customer ko email se bhi) **fit**. D-142 (bade burst kai dinon me) se recall ke emails der se pahunch sakte hain: kanooni seema nahi mili, par sehat ka maamla.
- **Prastaav:** recall shuru karte waqt seller app me "regulator ko suchna di: haan/nahi + tareekh + reference" ka field (brand ki zimmedari, platform record rakhe). Recall emails D-142 ki "baaki" line ke bajay paise wali line se upar, OTP ke baad; owner ka faisla (§6).
- **Dummy me kya:** dummy recall, dummy reference number.
- **Status:** `Jaancha`.

### L-062. Skin reaction (adverse event) ki report

- **Kya jaanchna tha:** D-130, D-208 (cosmetics ke side-effect ki report ke niyam, records).
- **Kanoon kya kehta hai:** Cosmetics Rules 2020 me retailer ya marketplace pe adverse event report karne ka koi saaf niyam nahi mila. Manufacturer ya authorised agent ko, unsafe hone ki wajah lage to, authority ko suchna deni hai (rule 65(2)). Import registration ke undertaking me importer ko kisi bhi desh me adverse reaction ki wajah se hui regulatory karwai batani hoti hai (Form COS-1 ka undertaking).
- **Source:** [S-C1] rule 65, Form COS-1 ka undertaking.
- **Hamare faisle se mel:** D-130 niyam 2 (brand ko khabar) aur niyam 5 (kai shikayaton pe batch rok) **fit**. Sehat ke data ke niyam run 2.
- **Prastaav:** brand ko case ki khabar bina customer ki pehchaan ke (product, batch, kya hua, ginti), taaki brand rule 65(2) nibha sake. Brand ka jawab ("authority ko bataya: haan/nahi") case me.
- **Dummy me kya:** dummy cases.
- **Status:** `Jaancha` (niyam ka na hona bhi padh ke dekha).

### L-063. Lautaye band cosmetics ko dobara bechna

- **Kya jaanchna tha:** D-112 niyam 1, BDA §8.2 #9.
- **Kanoon kya kehta hai:** dobara bechne pe koi saaf rok Cosmetics Rules me nahi mili. Jo laagu hai: label ki koi jaankari badalna ya mitana mana (rule 35); use-before ki tareekh label pe likhe storage ke hisaab se hai (rule 3(w)), yaani maal kis haalat me raha ye maayne rakhta hai; product seller ki zimmedari agar usne inspect ya maintain karne me laparwahi ki (CPA s.86(e)).
- **Source:** [S-C1] rules 3(w), 35; [S-D2] s.86.
- **Hamare faisle se mel:** D-112 niyam 1 (seal salamat, wahi batch, expiry seema se upar: wapas stock) **fit**, jab tak storage ki haalat theek ho.
- **Prastaav:** returns QC me ek aur check: "label pe storage ki shart (jaise 25°C se kam) wala product, aur parcel kitne din customer ke paas raha" (jaise sunscreen, perfume); shak ho to stock nahi, brand ko. Har dobara stock hue unit ka record (D-112 niyam 7).
- **Dummy me kya:** test returns.
- **Status:** `Aadha jaancha` (rok na milna lawyer se pakka karna).

### L-064. Expiry ke kareeb ya expired cosmetics bechna

- **Kya jaanchna tha:** D-082, D-062 (expiry ke kareeb ya expired bechne ke niyam).
- **Kanoon kya kehta hai:** "expiry ke baad mat becho" jaisa seedha vakya Cosmetics Rules ke text me nahi mila; par use-before = wo tareekh jab tak product standard ke gun rakhta hai (rule 3(w)), to uske baad product standard ka na hone ka jokhim; Act ke s.18 (misbranded, adulterated ya standard se neeche ka cosmetic bechna mana) is run me primary se nahi khola. Domestic maal pe customer ko kam se kam kitni expiry mile, aisa koi niyam nahi mila; import pe 6 mahine (rule 18(2)) sirf import ke waqt.
- **Source:** [S-C1] rules 3(w), 18(2).
- **Hamare faisle se mel:** D-062 niyam 2 aur D-082 (bikri band ki seema) **fit** aur kanoon se zyada surakshit.
- **Prastaav:** system kabhi expired batch reserve ya dispatch na kare (bikri band ki seema 0 bhi ho to); pick aur dispatch scan pe bhi expiry ka check (L-052 ke aakhri din se).
- **Dummy me kya:** test me ek expired batch, dispatch pe rok.
- **Status:** `Aadha jaancha`.

### L-065. Cosmetics bechne ka licence (warehouse aur platform)

- **Kya jaanchna tha:** D-014, D-060 (naya point).
- **Kanoon kya kehta hai:** Cosmetics Rules me licence sirf manufacture (aur loan licence) aur import registration ke liye hain; bechne ke liye koi alag licence ka chapter nahi; bechne ki shart sirf rule 33 (licensed manufacturer ka bana, sahi label). Drugs ke liye alag sale licence hota hai, isliye D-043.
- **Source:** [S-C1] (rules ka dhaancha; Chapters III se V), rule 33.
- **Hamare faisle se mel:** D-014, D-060, D-043 **fit**.
- **Prastaav:** COMPLIANCE me ek line: "cosmetics ki bikri ya storage ka alag licence nahi (Cosmetics Rules 2020 ke hisaab se)". Warehouse ke baaki registrations run 2.
- **Dummy me kya:** kuch nahi.
- **Status:** `Jaancha`.

### L-066. Label pe kuch na badalna aur platform ka barcode sticker

- **Kya jaanchna tha:** naya point; D-097 niyam 1.
- **Kanoon kya kehta hai:** koi bhi vyakti manufacturer ke container, label ya wrapper ki koi likhawat ya nishaan badal, mita ya bigaad nahi sakta (rule 35). Legal Metrology me bhi rule 6(4) doosri jaankari ke stickers ki ijazat deta hai, par zaroori declarations badalne wale nahi (rule 6(3)).
- **Source:** [S-C1] rule 35; [S-B1] rule 6(3), 6(4).
- **Hamare faisle se mel:** D-097 niyam 1 (bina barcode wale har unit pe platform ka barcode label) **kami:** label kahan lage, ye tay nahi; agar wo batch, expiry, MRP, ingredients ya kisi likhawat ko dhak de to rule 35 ka khatra.
- **Prastaav:** platform ka label sirf khaali jagah pe ya unit ke bahar ke polybag pe, kabhi manufacturer ki likhawat pe nahi; receiving app me "label kahan lagaya" ki photo. §6 me.
- **Dummy me kya:** test me photo.
- **Status:** `Jaancha`.

### L-067. Khaas products: hair dye, fluoride toothpaste, khatre wale products

- **Kya jaanchna tha:** naya point (listing ki jaanch ki checklist).
- **Kanoon kya kehta hai:** dyes wale hair dye ke label ke khaas niyam (rule 37); fluoride wale toothpaste ke khaas niyam, expiry tube aur carton dono pe (rule 38); khatre wale cosmetics pe istemaal ka tareeka aur chetavni (rule 34(4)).
- **Source:** [S-C1] rules 34(4), 37, 38.
- **Hamare faisle se mel:** D-076 (category ke hisaab se cheezein) ke saath **fit**; checklist me abhi nahi.
- **Prastaav:** in categories ki listing checklist me ye fields (chetavni ka text label photo se).
- **Dummy me kya:** dummy hair dye listing.
- **Status:** `Jaancha`.

### L-068. Free samples ka label

- **Kya jaanchna tha:** D-121 (sample ke label ke niyam).
- **Kanoon kya kehta hai:** Cosmetics Rules me samples ke liye alag chhoot is padhaai me nahi mili; sample bhi cosmetic hai, to rule 34 ke niyam (chhote packs ki chhooton ke saath: batch, ingredients, net contents). Twelfth Schedule ki chhooten is run me nahi padhi.
- **Source:** [S-C1] rule 34, rule 64 (Twelfth Schedule ka hawala).
- **Hamare faisle se mel:** D-121 niyam 3 **fit**.
- **Prastaav:** sample bhi listing ki tarah jaanch se (label photo), chhote pack ki chhooton ke saath (L-053, L-054).
- **Dummy me kya:** R2 me.
- **Status:** `Aadha jaancha`.

### L-069. Reviews me ilaaj jaise daawe

- **Kya jaanchna tha:** D-146 niyam 4 (review me ilaaj ke daawe).
- **Kanoon kya kehta hai:** rule 36 aur drug claim wala FAQ product ke daawe (manufacturer ya seller ke) ki baat karte hain; customer ki raay pe koi saaf niyam nahi mila. Drugs and Magic Remedies (Objectionable Advertisements) Act 1954 jaisa kanoon is run me nahi khola (run 2).
- **Source:** [S-C1] rule 36; [S-C2] Q.54.
- **Hamare faisle se mel:** D-146 niyam 4 (review rahe, upar tay note) **fit** jitna dekha.
- **Prastaav:** seller ya brand ka jawab (D-160) aur seller ka content kabhi ilaaj ka daawa na kare: D-160 ke moderation me L-057 ki "mana shabdon" ki list.
- **Dummy me kya:** demo reviews pe pehle se "Demo review" (D-145).
- **Status:** `Aadha jaancha`.

## 5. D: E-commerce aur consumer kanoon

**Is area ke sources (sab is run me khole, 2026-11-19):**

- **[S-D1]** Consumer Protection (E-Commerce) Rules, 2020 (G.S.R. 462(E), 23 Jul 2020), Gazette ka text, PRS India ki hosted copy: <https://prsindia.org/files/bills_acts/bills_parliament/2021/Consumer%20Protection%20(E-Commerce)%20Rules,%202020.pdf>. Primary document, secondary host. **Mool 2020 ka text.**
- **[S-D2]** Consumer Protection Act, 2019, "As amended upto October 13, 2023", Khaitan & Co ki consolidated copy: <https://www.khaitanco.com/sites/default/files/2026-03/Consumer%20Protection%20Act%2C%202019.pdf>. Primary text, secondary host.
- **[S-D3]** Consumer Protection (E-Commerce) (Amendment) Rules, 2026 (G.S.R. 789(E), 9 Sep 2026; **laagu 1 Jan 2027**), taxheal pe chhapa saar: <https://www.taxheal.com/?p=140665>. Secondary (egazette.gov.in fetch me TLS ki galti se nahi khula). Kai inserted sub-rules ka number source me nahi.
- **[S-D4]** Guidelines for Prevention and Regulation of Dark Patterns, 2023 (CCPA, F. No. CCPA-1/1/2023-CCPA-(Reg), 30 Nov 2023), taxguru pe chhapa text: <https://taxguru.in/?p=896142>. Secondary.
- **[S-D5]** Guidelines for Prevention of Misleading Advertisements and Endorsements for Misleading Advertisements, 2022 (CCPA, 9 Jun 2022): sirf search results ka saar (PIB aur DoCA ki pages ke hawale); consumeraffairs.nic.in aur pib.gov.in fetch nahi hue. Secondary.

### L-070. Platform ki apni jaankari aur nodal person

- **Kya jaanchna tha:** D-150 (legal pages), D-145 niyam 4, D-134.
- **Kanoon kya kehta hai:** e-commerce entity company ho (Companies Act) aur India me rehne wala ek **nodal person** (ya alternate senior designated functionary) rakhe jo kanoon ka paalan pakka kare (rule 4(1)). Platform pe saaf dikhe: legal naam; headquarters aur saari branches ka pata; website ka naam; customer care aur grievance officer ke contact (email, landline, mobile) (rule 4(2); 2027 se substituted roop bhi yahi, [S-D3]). Imported maal ho to importer ka naam (rule 4(6)). National Consumer Helpline ke convergence me shaamil hona: 2020 me "best effort", 2027 se zaroori ([S-D3]).
- **Source:** [S-D1] rule 4(1), 4(2), 4(6), 4(7); [S-D3].
- **Hamare faisle se mel:** D-150 (legal pages) **fit**. **Kami:** D-134 ki table me nodal person aur NCH ki row nahi.
- **Prastaav:** "About / Contact" page pe rule 4(2) ki saari jaankari (dummy); nodal person ek role (D-017 me naam), contact `example` domain se. NCH ka ek dummy field.
- **Dummy me kya:** platform ki dummy company, pata, `example` emails, dummy phone, "DUMMY" badge.
- **Status:** `Jaancha` (2020 text); 2027 ke badlav secondary.

### L-071. Seller ki jaankari product page pe, aur seller ka grievance officer

- **Kya jaanchna tha:** D-134, BDA2 §7.3 #4 (seller ka grievance contact product page pe), PRD ki seller wali row.
- **Kanoon kya kehta hai:**
  - Marketplace kharid se pehle seller ki jaankari dikhaye: business ka naam, registered hai ya nahi, pata, customer care number, seller ki rating ya feedback, aur zaroori jaankari; kharid ke baad likhit request pe seller ka poora pata, website, email (rule 5(3)(a)). 2027 se website aur email "jahan ho" bhi ([S-D3]).
  - Seller: platform ke saath pehle se likhit contract; apna grievance officer (48 ghante me receipt, ek mahine me hal); legal naam, pata, website, email, customer care, GSTIN aur PAN platform ko de (rule 6(4)). Seller platform pe dikhane ke liye de: total price aur uska breakup (delivery charges aur tax samet), zaroori notices aur **expiry date** (jahan laagu), country of origin samet details, grievance officer ka naam, number aur designation, importer ki details aur authenticity ki guarantee, return/refund/exchange ki shartein aur return shipping ka kharcha, delivery ki details, warranty (rule 6(5)). 2027 se seller GSTIN ya MSME registration number jaisa sarkari number bhi de (rule 6(5)(j), [S-D3]).
- **Source:** [S-D1] rules 5(3)(a), 6(4), 6(5); [S-D3].
- **Hamare faisle se mel:** D-036, D-075, D-134 (seller KYC aur GSTIN) data ke liye **fit**. **Kami:** product page pe "seller ki jaankari" ka block aur seller ka apna grievance officer kisi faisle me nahi; D-031 (house brand) bhi seller hai, to uska bhi.
- **Prastaav:** seller profile me: legal naam, registered pata, customer care (email + phone), grievance officer (naam, designation, contact), GSTIN (aur MSME number agar ho), website. Product page pe "Sold by" block me ye, aur seller ki rating jab ho. Seller agreement (D-150) likhit contract ka kaam kare, version ke saath.
- **Dummy me kya:** dono R1 sellers ki dummy jaankari, "DUMMY" badge.
- **Status:** `Jaancha`.

### L-072. Return, refund aur exchange ki policy dikhana; khule cosmetics pe "no return"

- **Kya jaanchna tha:** D-079, D-114, D-150 (return policy dikhane ke niyam, khule cosmetics pe "no return" ki shartein).
- **Kanoon kya kehta hai:** marketplace return, refund, exchange, warranty, delivery aur shipment, payment ke tareeke, grievance ki jaankari saaf dikhaye (rule 5(3)(c)); 2027 se best-before ya use-before bhi isi list me ([S-D3]). Seller return ki shartein aur **return shipping ka kharcha** saaf de (rule 6(5)(g)). "Man badla" return dena kanoon me zaroori nahi mila; par defective, deficient, spurious, vigyapan se alag, ya **late** delivered maal pe seller wapas lene aur refund se mana nahi kar sakta (rule 6(3), L-073).
- **Source:** [S-D1] rules 5(3)(c), 6(3), 6(5)(g); [S-D3].
- **Hamare faisle se mel:** D-079 ("man badla" sirf band maal pe, khule maal pe galti ho to return) **fit**. D-114 (man badla pe ₹49 return fee) **fit**, agar ye kharid se pehle dikhe.
- **Prastaav:** product page pe "Return: is product pe [seal aata hai: man badla 7 din / seal nahi: sirf galti pe]" aur return fee; Return page ke number settings se (D-150 niyam 4).
- **Dummy me kya:** settings ke misaal wale number.
- **Status:** `Jaancha`.

### L-073. Kharab maal pe customer ke haq aur return ki samay-seema

- **Kya jaanchna tha:** D-080 (kam se kam samay-seema ka niyam, kharab maal pe haq).
- **Kanoon kya kehta hai:** rule 6(3) me defective, deficient, spurious ya "as advertised" se alag maal pe seller ke mana na karne ki **koi samay-seema nahi** likhi. CPA s.2(47)(viii): bechne ke baad defective maal wapas lene aur paisa lautane se mana karna unfair trade practice hai, agar ye **bill ya receipt me likhi muddat**, aur muddat na likhi ho to **30 din**, ke andar ho. Consumer complaint ki muddat 2 saal (s.69). Kanoon "man badla" ke liye koi kam se kam din nahi deta.
- **Source:** [S-D1] rule 6(3); [S-D2] s.2(47)(viii), s.69.
- **Hamare faisle se mel:** **takrav ka jokhim:** D-080 niyam 1 (dikhne wali galti 48 ghante) aur niyam 2 (kharab maal aur expiry 7 din) ke baad "return nahi" sirf tab tik sakta hai jab ye muddat **invoice pe likhi** ho; warna 30 din ka default. Rule 6(3) to bina muddat ke mana karne se rokta hai. D-080 niyam 5 (baad me recall) sirf batch ki dikkat sambhalta hai, ek customer ka chhupa defect nahi.
- **Prastaav (§6):** (a) muddatein invoice aur order page pe likhi hon; (b) defective, spurious ya "jaisa dikhaya waisa nahi" pe kam se kam 30 din (ya owner ki tay muddat jo invoice pe chhapi ho), uske baad bhi support ka raasta (mana nahi, jaanch); (c) 48 ghante ka niyam saboot ka niyam rahe (der se daawe pe zyada jaanch), haq khatam hone ka nahi.
- **Dummy me kya:** settings me naye number.
- **Status:** `Jaancha`.

### L-074. Refund ka samay

- **Kya jaanchna tha:** D-111, D-115 (refund ka samay).
- **Kanoon kya kehta hai:** maane gaye refund ka paisa RBI ya kisi aur authority ke tay samay me, ya "reasonable period" me (rule 4(10)). Defective maal ka refund bill me likhi muddat ya 30 din me (CPA s.2(47)(viii)). RBI ke TAT ke niyam run 2.
- **Source:** [S-D1] rule 4(10); [S-D2] s.2(47)(viii).
- **Hamare faisle se mel:** D-111 (original raasta, turant shuru) **fit**. D-115 (R1 me warehouse jaanch ke baad) theek, agar jaanch ka samay tay ho.
- **Prastaav:** return ka refund "pickup se X kaam ke din me" ka tay vaada (setting), order page pe dikhe; refund ki haalat (D-111 niyam 4) ke saath. RBI TAT run 2 ke baad number pakka.
- **Dummy me kya:** test mode refunds.
- **Status:** `Jaancha`.

### L-075. Grievance Officer, receipt aur hal ka samay

- **Kya jaanchna tha:** D-163, D-134, D-145 niyam 4.
- **Kanoon kya kehta hai:** grievance ka mechanism shikayaton ki ginti ke hisaab se; grievance officer ka **naam, contact aur designation** platform pe; shikayat ki receipt **48 ghante** me aur hal **ek mahine** me (rule 4(4), 4(5)). 2027 se receipt ke saath shikayat ki **recorded copy** bhi customer ko ([S-D3]). Har shikayat ka ticket number jisse haalat dekhi ja sake (rule 5(3)(b)). Seller ka bhi apna grievance officer (rule 6(4)(b)).
- **Source:** [S-D1] rules 4(4), 4(5), 5(3)(b), 6(4)(b); [S-D3].
- **Hamare faisle se mel:** D-163 niyam 2 aur 3 (ticket number turant, 48 ghante aur 30 din) **fit**. **Kami:** 2027 ki "recorded copy" nahi; seller ke grievance officer ka raasta nahi. **Chhota takrav:** D-145 niyam 4 (officer ka sirf role ka naam, kisi insaan ka banawati naam nahi) aur rule 4(4) (officer ka naam).
- **Prastaav:** grievance receipt ke email aur in-app me shikayat ka poora recorded text (2027 se). Seller grievance: seller ke officer ka contact "Sold by" me, aur platform ki seedhi seller ki shikayat bhi le. Officer ka naam field data me rahe; demo me naam "Dummy Grievance Officer" + "DUMMY" badge (insaan jaisa naam nahi). §6.
- **Dummy me kya:** yahi.
- **Status:** `Jaancha`.

### L-076. Daam ka khel aur customers ke beech bhed (Pro daam samet)

- **Kya jaanchna tha:** D-065 (kharidaar ke hisaab se alag daam), D-061.
- **Kanoon kya kehta hai:** e-commerce entity daam ko is tarah na badle ki bina wajah zyada munafa ho (rule 4(11)(a)); **ek hi class ke consumers me bhed**, ya consumers ki **manmani classification** jo unke haq pe asar daale, mana (rule 4(11)(b)).
- **Source:** [S-D1] rule 4(11).
- **Hamare faisle se mel:** D-065 + D-069 **fit**: Pro buyers ek alag, jaanchi hui class hain (saboot, staff ki manzoori, muddat), manmani nahi. D-109 aur D-116 (delivery pe UPI ya return band) bhi tay niyam, wajah dikhana aur staff ka kholna: **fit**.
- **Prastaav:** Pro ki shartein (D-069) ek public page pe; har "suvidha band" ke niyam (D-109, D-116) policy page pe (D-154 niyam 5 jaisa).
- **Dummy me kya:** test Pro account.
- **Status:** `Jaancha`.

### L-077. Kram (ranking), apna brand, sponsored aur search

- **Kya jaanchna tha:** D-139 (kram ke gun batana, apne brand ko aage rakhna, sponsored ka label), BDA2 §7.3 #5.
- **Kanoon kya kehta hai:** kram tay karne wale mukhya gun aur unka mahatva saral bhasha ke public page pe (rule 5(3) ka aakhri clause, 2027 ke amendment me "5(3)(f)" kaha gaya; 2020 ki hosted copy me clause ka akshar padha nahi gaya); 2027 se gun **mahatva ke ghatte kram** me ([S-D3]). Sellers ke saath terms me kisi bhi "differentiated treatment" ka varnan (rule 5(4)). 2027 se: search results ya index ko gumraah karne ke liye na badalna (rule 4(11)(c)), aur sponsored listings ka saaf aur prominent nishaan (rule 4(12)) ([S-D3]). Dark patterns me "disguised advertisement" mana [S-D4].
- **Source:** [S-D1] rule 5(3), 5(4); [S-D3]; [S-D4] Annexure 1 #9.
- **Hamare faisle se mel:** D-139 niyam 3, 4, 5 **fit**.
- **Prastaav:** kram wale page pe gun mahatva ke kram me (relevance, rating, 30 din ki bikri, stock). Seller agreement me ek line: "koi differentiated treatment nahi; house brand bhi isi niyam me". Sponsored (R2) ka label har jagah (search, category, recommendations).
- **Dummy me kya:** kuch nahi.
- **Status:** `Jaancha` (2020 text); 2027 ke hisse secondary.

### L-078. Customer ka data aur platform ke naam wala brand (2027 se)

- **Kya jaanchna tha:** D-166 (apne brand ke prachaar me customer data), D-031.
- **Kanoon kya kehta hai (secondary):** 1 Jan 2027 se marketplace apne jama kiye data ka istemaal (a) platform ke naam ya brand se milte naam wale kisi seller (related ho ya nahi) ka maal bechne, ya (b) platform se juda dikhne wale seller ko promote karne ke liye, customer ki **express aur affirmative consent** ke bina nahi kar sakta (rule 5(6), [S-D3]).
- **Source:** [S-D3].
- **Hamare faisle se mel:** D-139 niyam 3 (koi boost nahi) **fit**. **Kami:** D-166 (sujhaav) agar house brand ko bhi sujhaav me laata hai aur house brand ka naam platform se milta hai, to bina consent ke ye mana ho sakta hai.
- **Prastaav (§6):** do raaste, owner chune: (a) house brand ka naam platform se alag rakhein; ya (b) personal sujhaav me house brand sirf us customer ko jisne alag opt-in diya (pre-ticked nahi). DPDP ka hissa run 2.
- **Dummy me kya:** consent ka dummy toggle.
- **Status:** `Aadha jaancha`.

### L-079. Galat maal ya nuksaan: marketplace aur seller ki zimmedari (product liability)

- **Kya jaanchna tha:** D-098 (listing ke galat claim ki zimmedari), D-060, D-062, D-112.
- **Kanoon kya kehta hai:** "product seller" me wo bhi jo business me bechne, distribute karne, **package, label, maintain** karne ya product ko bazaar tak pahunchane me shaamil ho; "electronic service provider" me online marketplace shaamil (s.2(17), s.2(37)). Jo product seller manufacturer nahi, wo product liability me tab zimmedar: packaging ya labelling pe kaafi control; product badla; apni alag warranty di; manufacturer ka pata nahi ya uspe kanoon na chale; ya product ko assemble, **inspect ya maintain** karne me laparwahi, ya manufacturer ki chetavni aage na di (s.86). Marketplace IT Act s.79 ki chhoot chahe to uski shartein maane (E-com rule 5(1); run 2).
- **Source:** [S-D2] s.2(17), s.2(37), s.84 se s.87; [S-D1] rule 5(1).
- **Hamare faisle se mel:** D-098 niyam 3 (staff content nahi badalta) **fit**. **Dhyan:** platform maal rakhta (maintain), receiving aur returns pe inspect karta, aur barcode label lagata (D-097); to s.86(e) ki "reasonable care" platform pe bhi aa sakti hai. D-062 (expiry ka niyam), D-063, D-112 is care ka hissa hain.
- **Prastaav:** warehouse ke niyam likhit (storage ki shart, FEFO, quarantine, returns QC), aur har kadam ka record (pehle se banta hai). Chetavni wale products (L-067) ki chetavni product page pe bhi.
- **Dummy me kya:** kuch nahi.
- **Status:** `Jaancha`.

### L-080. Seller ka content sahi hone ka undertaking

- **Kya jaanchna tha:** D-098.
- **Kanoon kya kehta hai:** marketplace sellers se **undertaking** le ki description, images aur content sahi hain aur maal ke roop, prakriti, quality aur kaam se mel khaate hain (rule 5(2)). Seller ke vigyapan maal ki asliyat se mel khaayein (rule 6(4)(c)).
- **Source:** [S-D1] rules 5(2), 6(4)(c).
- **Hamare faisle se mel:** D-098 **fit**, par undertaking ka kadam likha nahi: **chhoti kami**.
- **Prastaav:** seller agreement me undertaking, aur har listing submit pe ek checkbox (pre-ticked nahi) "ye content sahi hai", version ke record ke saath (D-098 niyam 4).
- **Dummy me kya:** test listing.
- **Status:** `Jaancha`.

### L-081. Jhoothi jaldi, "kam stock" aur countdown

- **Kya jaanchna tha:** D-154 (jhoothi jaldi aur kam stock dikhane ke niyam), BDA2 §7.3 #13.
- **Kanoon kya kehta hai:** "false urgency" dark pattern: jhoothi kami ya jaldi ka ehsaas, jaise jhoothi popularity ya stock ko kam bata ke turant kharid pe majboor karna; ek jhootha "time-limited" sale (Annexure 1 #1). 2027 se har e-commerce entity Dark Patterns Guidelines maane, saal me self-audit kare aur certificate dikhaye ([S-D3], L-084).
- **Source:** [S-D4]; [S-D3].
- **Hamare faisle se mel:** D-154 (asli ginti, "X ne kharida" nahi, countdown sirf asli offer pe) **fit**.
- **Prastaav:** jaisa hai; "kam stock" ka number aur niyam audit ke liye log ho.
- **Dummy me kya:** test stock.
- **Status:** `Aadha jaancha` (guidelines ka text secondary se).

### L-082. Chhupe charges (drip pricing) aur basket sneaking

- **Kya jaanchna tha:** D-107 niyam 3 aur 4, D-121, D-114.
- **Kanoon kya kehta hai:** "drip pricing": daam ke hisse chhupana, confirmation ke baad zyada lena, checkout aur aakhri charge me farak (#8). "Basket sneaking": bina consent cart me cheezein ya paid extras jodna; free samples aur pehle se bataye zaroori fees is me nahi (#2). Seller ko total price ka breakup (delivery samet) dena hai (rule 6(5)(b)). 2027 se platform se asambandhit sevaon ki "bundled fee" mana, loyalty programmes chhod ke ([S-D3]).
- **Source:** [S-D4] Annexure 1 #2, #8; [S-D1] rule 6(5)(b); [S-D3].
- **Hamare faisle se mel:** D-107 (pehle se "₹X se upar muft delivery", koi platform ya packing fee nahi), D-121 (samples free) **fit**. D-114 return fee kharid se pehle dikhe (L-072).
- **Prastaav:** cart aur checkout pe delivery fee hamesha alag line me, order ke pehle; server ka total aur dikha total na mile to order nahi (SR-044 pehle se).
- **Dummy me kya:** kuch nahi.
- **Status:** `Aadha jaancha`.

### L-083. Saaf consent, pre-ticked box nahi

- **Kya jaanchna tha:** D-141 niyam 1, D-150 niyam 3, D-155.
- **Kanoon kya kehta hai:** kharid ki consent sirf "explicit and affirmative action" se; pre-ticked checkbox jaise apne aap consent nahi (rule 4(9)). Dark patterns me "trick question" aur "nagging" bhi (#10, #11).
- **Source:** [S-D1] rule 4(9); [S-D4].
- **Hamare faisle se mel:** D-141 niyam 1 (opt-in pehle se tick nahi), D-150, D-155 **fit**.
- **Prastaav:** UX ka ek niyam: koi bhi checkbox pehle se tick nahi; "No" aur "Yes" barabar dikhen. QA ka test.
- **Dummy me kya:** kuch nahi.
- **Status:** `Jaancha`.

### L-084. Dark patterns ka saal ka self-audit aur certificate (2027 se)

- **Kya jaanchna tha:** D-134 ki "Dark patterns se bachav: L2" row.
- **Kanoon kya kehta hai (secondary):** 1 Jan 2027 se har e-commerce entity Dark Patterns Guidelines 2023 maane, **saal me self-audit** kare ki platform dark patterns se mukt hai, aur iska **certificate prominently** dikhaye ([S-D3]).
- **Source:** [S-D3].
- **Hamare faisle se mel:** **kami:** D-134 me dark patterns L2 (UX aur code ke niyam) hai; audit ka record aur certificate (L3 jaisa) nahi.
- **Prastaav:** D-134 ki is row me "saal ka self-audit checklist (Annexure 1 ke 13 points) + record + site pe certificate page" jodna; owner ka faisla (§6).
- **Dummy me kya:** certificate "DUMMY: self-audit, lawyer se jaancha nahi".
- **Status:** `Aadha jaancha`.

### L-085. Discount aur "pehle ka daam"

- **Kya jaanchna tha:** D-120 (discount aur "pehle ka daam" dikhane ke niyam), BDA §8.2 #13.
- **Kanoon kya kehta hai:** CPA s.2(47)(i)(i): product kis daam pe "aam taur pe" bikta hai, is baare me public ko gumraah karna unfair trade practice; daam ka hawala bazaar ke aam daam ka maana jaata hai jab tak saaf na likha ho ki ye isi seller ka daam tha. 2027 se: platform ya seller **daam kam karne ka elaan** kare to ghate daam ke saath **"prior price"** bhi dikhe; "prior price" = elaan se **30 din pehle tak ka sabse kam daam** ([S-D3]).
- **Source:** [S-D2] s.2(47)(i)(i); [S-D3].
- **Hamare faisle se mel:** D-120 niyam 3 ("sale" label pe pichhle 30 din ka sabse kam daam) soch me **fit**, par **takrav ka jokhim**: D-120 me ye sirf "sale/deal" label ke saath aur R2 se; jabki R1 me bhi har jagah kata MRP aur "% off" dikhta hai. Agar kata MRP + "% off" ko "price reduction" maana gaya to 1 Jan 2027 se har aise display ke saath prior price chahiye.
- **Prastaav (§6):** D-061 ka itihaas R1 me hai hi; R1 se hi har discount display ke saath "pichhle 30 din ka sabse kam daam" dikhayein, ya "% off" sirf tab jab ye 30 din ka daam bhi dikhe. Owner ka faisla.
- **Dummy me kya:** test data me daam ka itihaas.
- **Status:** `Aadha jaancha` (2027 ka niyam secondary).

### L-086. Product claims aur gumraah karne wale vigyapan

- **Kya jaanchna tha:** D-100 (cosmetics claims aur galat vigyapan ke niyam), D-137.
- **Kanoon kya kehta hai:** "misleading advertisement": maal ka jhootha varnan, jhoothi guarantee, quantity ya quality pe gumraah karna, ya zaroori baat chhupana (s.2(28)). Unfair trade practice: product ki performance, efficacy ya umar ki aisi guarantee dena jo **"adequate or proper test"** pe tiki na ho; aur test ka daawa karne wale pe **saboot ka bojh** (s.2(47)(i)(g)). CCPA ko misleading ads pe direction aur penalty ke adhikar (s.21). 2022 ki CCPA guidelines non-misleading ad ki shartein, "free" claims aur endorsement ki due diligence batati hain (sirf secondary saar, [S-D5]). Cosmetics me rule 36 (L-057).
- **Source:** [S-D2] s.2(28), s.2(47)(i)(g), s.21; [S-D5].
- **Hamare faisle se mel:** D-100 niyam 1 se 4 **fit**. **Takrav ka jokhim:** D-100 niyam 5 (R1 me saboot sirf SPF pe; baaki claims seller ki ghoshna): "dermatologically tested", "clinically proven", "non-comedogenic", "X din me asar" jaise test ya efficacy wale claims bina saboot ke R1 me live hon, to s.2(47)(i)(g) me saboot ka bojh seller pe aur dikhane wale platform pe sawal.
- **Prastaav (§6):** claims ki list ko do me baantein: (a) ghoshna wale (vegan jaise; ingredients se jaanch), (b) test ya efficacy wale: R1 me saboot ke bina list me hi na aayein, ya saboot R1 se.
- **Dummy me kya:** dummy test reports.
- **Status:** `Jaancha` (Act); 2022 guidelines secondary.

### L-087. Endorsement, inaam wale reviews aur influencers

- **Kya jaanchna tha:** D-158, Creator app (D-010), BDA2 §7.3 #2.
- **Kanoon kya kehta hai (secondary):** 2022 ki CCPA guidelines: endorsement endorser ki asli aur taaza raay ho, aur endorser ki due diligence; DoCA ka "Endorsement Know-hows" (2023) influencers ko brand ke saath "material connection" saaf batane ko kehta hai ([S-D5]). Penalty CCPA s.21 se.
- **Source:** [S-D5]; [S-D2] s.21.
- **Hamare faisle se mel:** D-158 (inaam wala review nahi) **fit** aur sabse surakshit. Creator ke kaam (R2) me disclosure ka niyam abhi nahi.
- **Prastaav:** Creator ke har content pe "Ad / Sponsored / Collab" ka label system se (D-139 ke sponsored label jaisa), hataya na ja sake. Guidelines ka primary text run 2 me ek baar.
- **Dummy me kya:** R2 me.
- **Status:** `Aadha jaancha`.

### L-088. Nakli reviews, verified review, negative review na dabana

- **Kya jaanchna tha:** D-135, D-146, D-156 (verified review, negative na dabana, nakli review pe zimmedari), BDA2 §7.3 #1.
- **Kanoon kya kehta hai:** marketplace ka seller khud ko consumer bata ke review post nahi kar sakta, na maal ki quality ya features galat bata sakta (rule 6(2)); e-commerce entity koi unfair trade practice na apnaye (rule 4(3)). BIS ka online reviews wala standard (IS 19000:2022) aam taur pe voluntary bataya jaata hai; is run me nahi khola. 2027 ke amendment me reviews pe naya niyam nahi dikha ([S-D3]).
- **Source:** [S-D1] rules 4(3), 6(2); [S-D3].
- **Hamare faisle se mel:** D-156 niyam 5 (brand ke staff apne product pe review nahi) aur D-146 niyam 2 (negative raay kabhi wajah nahi) **fit**.
- **Prastaav:** jaisa hai; IS 19000 ka milaan run 2 ya baad me (voluntary).
- **Dummy me kya:** demo reviews (D-145 niyam 6).
- **Status:** `Aadha jaancha` (IS 19000 nahi dekha).

### L-089. Cancel pe charge

- **Kya jaanchna tha:** D-110.
- **Kanoon kya kehta hai:** confirm ke baad cancel karne wale customer pe cancellation charge tabhi jab platform bhi apni taraf se cancel karne pe waisa charge uthaye (rule 4(8)).
- **Source:** [S-D1] rule 4(8).
- **Hamare faisle se mel:** D-110 niyam 2 (koi cancel fee nahi) **fit**.
- **Prastaav:** jaisa hai.
- **Dummy me kya:** kuch nahi.
- **Status:** `Jaancha`.

### L-090. Demo store, jahan kuch asli bikta nahi

- **Kya jaanchna tha:** D-133, D-145 (test mode me bikri dikhane wali site).
- **Kanoon kya kehta hai:** consumer kanoon unfair trade practice ki baat karta hai: aise "bargain price" ka vigyapan jis daam pe maal bechne ka iraada hi na ho (s.2(47)(ii)); "bait and switch" dark pattern [S-D4]. Demo site pe koi saaf niyam nahi mila; jokhim tab jab koi asli customer bhram me kharidne ki koshish kare.
- **Source:** [S-D2] s.2(47)(ii); [S-D4] #7.
- **Hamare faisle se mel:** D-133 (account sirf allowlist, baaki ko "Ye demo store hai") aur D-145 (har jagah DEMO) **fit**: anjaan vyakti kharid hi nahi sakta.
- **Prastaav:** jaisa hai; product page aur checkout pe bhi patti (D-145 niyam 1).
- **Dummy me kya:** yahi.
- **Status:** `Aadha jaancha`.

### L-091. Legal pages ke zaroori hisse (E-commerce wala hissa)

- **Kya jaanchna tha:** D-150 (in pages ke zaroori hisse).
- **Kanoon kya kehta hai:** E-commerce Rules se pages pe aana chahiye: platform ki jaankari aur grievance officer (rule 4(2), 4(4)); return, refund, exchange, warranty, delivery, payment ke tareeke aur unki fees, charge-back, payment provider ka contact (rule 5(3)(c), 5(3)(d)); kram ke gun (rule 5(3)); seller terms me differentiated treatment (rule 5(4)); seller ki jaankari (rule 6(5)). Privacy policy aur user agreement (IT Rules, DPDP) run 2.
- **Source:** [S-D1] rules 4, 5, 6.
- **Hamare faisle se mel:** D-150 (Terms, Privacy, Return, Shipping, Grievance, Seller agreement) **fit**; "Payments" (methods, fees, charge-back, Razorpay ka contact) aur "Ranking" ke pages list me nahi: **chhoti kami**.
- **Prastaav:** D-150 ki list me "Payments" aur "Kram kaise" (D-139 niyam 5) pages jodna, aur "About/Contact" (L-070).
- **Dummy me kya:** har page pe "DUMMY: lawyer se jaancha nahi" (D-150 niyam 2).
- **Status:** `Jaancha`.

### L-092. Points ki expiry aur suchna

- **Kya jaanchna tha:** D-174 niyam 3 (points ki expiry aur suchna ke niyam).
- **Kanoon kya kehta hai:** is run me iske liye koi consumer kanoon ka source nahi khola (unfair contract ki definition aur PPI ke niyam dekhne the).
- **Source:** nahi.
- **Hamare faisle se mel:** pata nahi.
- **Prastaav:** run 2 me PPI (RBI) ke saath dekhein (L-114).
- **Dummy me kya:** R2 me.
- **Status:** `Jaancha nahi`.

### L-093. Recall pe customers ko suchna

- **Kya jaanchna tha:** D-131, D-142 (recall pe customer ko suchna dene ke niyam aur samay).
- **Kanoon kya kehta hai:** CCPA khatarnak ya unsafe maal ka recall aur kharidaron ko paisa wapas dilane ka order de sakti hai (CPA s.20). Customer ko suchna ka tay samay CPA ya Cosmetics Rules (rule 65) me nahi mila.
- **Source:** [S-D2] s.20; [S-C1] rule 65.
- **Hamare faisle se mel:** D-129 niyam 2, D-131 **fit**; D-142 ke burst bantne ka asar L-061 me.
- **Prastaav:** L-061 jaisa.
- **Dummy me kya:** dummy recall.
- **Status:** `Jaancha`.

### L-094. Der se delivery pe customer ka haq

- **Kya jaanchna tha:** naya point; D-117 niyam 4 ("vaada toote to R1 me koi muavza nahi").
- **Kanoon kya kehta hai:** seller maal wapas lene ya refund se mana nahi kar sakta agar maal **"stated delivery schedule" se der** se pahuncha, jab tak der force majeure se na ho (rule 6(3)). Delivery ki jaankari bhi dikhni chahiye (rule 5(3)(c), 6(5)(h)).
- **Source:** [S-D1] rule 6(3).
- **Hamare faisle se mel:** **kami / takrav ka jokhim:** D-117 tareekh ka vaada deta hai; der hone pe D-079 ki return wajahon me "der se aaya" nahi, aur D-117 niyam 4 koi raasta nahi deta. Muavza zaroori nahi, par der wale order pe return aur refund se mana nahi ho sakta.
- **Prastaav (§6):** "der se pahuncha" ek wajah: customer door pe le na le (RTO jaisa, poora refund, delivery fee samet) ya delivery ke baad kuch din me return, bina return fee; force majeure (jaise band, baadh) ka flag staff ke haath me, wajah ke saath.
- **Dummy me kya:** test me ek der wala order.
- **Status:** `Jaancha`.

### L-095. Invoice pe seller ka naam (2027 se)

- **Kya jaanchna tha:** naya point (D-030, D-041 ka invoice).
- **Kanoon kya kehta hai (secondary):** 1 Jan 2027 se invoice pe seller ka naam saaf aur prominent, e-commerce entity ke naam ke **barabar font size** me ([S-D3]).
- **Source:** [S-D3].
- **Hamare faisle se mel:** D-030 (invoice seller ke GSTIN se) **fit**; template ka niyam naya.
- **Prastaav:** invoice template me seller ka naam sabse upar, platform ka naam ("Sold through ...") usse bada nahi.
- **Dummy me kya:** specimen invoice.
- **Status:** `Aadha jaancha`.

### L-096. Baar-baar ullanghan karne wale sellers ka record

- **Kya jaanchna tha:** naya point; D-075, D-156.
- **Kanoon kya kehta hai:** marketplace un sellers ki pehchaan ka record rakhne ki "reasonable efforts" kare jinke maal Copyright Act, Trade Marks Act ya IT Act ke tahat pehle hataye gaye; band karna zaroori nahi (rule 5(5)).
- **Source:** [S-D1] rule 5(5).
- **Hamare faisle se mel:** D-156 (nakli review pe karwai) alag cheez; listing hatane ka record D-098 ke version record me hai, par "kis kanoon se hataya" ki wajah nahi: **chhoti kami**.
- **Prastaav:** listing hatane ki wajahon me "trademark / copyright / IT Act ki shikayat" alag code; seller pe ginti.
- **Dummy me kya:** kuch nahi.
- **Status:** `Jaancha`.

### L-097. Asambandhit sevaon ki bundled fee (2027 se)

- **Kya jaanchna tha:** naya point; D-107 niyam 4, D-173.
- **Kanoon kya kehta hai (secondary):** 2027 se marketplace platform se asambandhit sevaon ki bundled fee nahi le sakta; loyalty ya membership programmes is se bahar ([S-D3]).
- **Source:** [S-D3].
- **Hamare faisle se mel:** D-107 niyam 4 (koi platform ya packing fee nahi), D-173 (points, koi fee nahi) **fit**.
- **Prastaav:** jaisa hai.
- **Dummy me kya:** kuch nahi.
- **Status:** `Aadha jaancha`.

### L-098. Imported maal: importer ki jaankari aur asli hone ki guarantee

- **Kya jaanchna tha:** D-127 ka E-commerce wala hissa.
- **Kanoon kya kehta hai:** imported maal pe importer ka naam aur details (rule 4(6)); seller importer ki details aur imported products ke **authenticity ki guarantee** de (rule 6(5)(f)); 2027 se "full country of origin" Legal Metrology ke hisaab se ([S-D3]).
- **Source:** [S-D1] rules 4(6), 6(5)(f); [S-D3].
- **Hamare faisle se mel:** D-127 **fit**; authenticity ki guarantee ka field **chhoti kami**.
- **Prastaav:** imported listing pe seller ki "authenticity guarantee" ki ghoshna (text + checkbox, pre-ticked nahi), product page pe dikhe; D-075 ki brand authorisation se judi.
- **Dummy me kya:** dummy ghoshna.
- **Status:** `Jaancha`.

## 6. Faislon pe asar

Ye faisle dobara nahi khole ja rahe. Har row: kanoon se kahan takrav ya kami dikhi, wajah, aur prastaavit sudhaar. Badlav owner ki haan se "badla" ya "jod" line ke roop me (D-018). Kram: sabse zyada jokhim pehle.

| #   | Faisla                              | Kya mila                                                                                                                                                                                                                                                              | Kism                       | Prastaavit sudhaar                                                                                                                                                                                                 | Point                             |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| 1   | D-080 (aur D-079)                   | Defective, spurious, "jaisa dikhaya waisa nahi" maal pe E-commerce rule 6(3) koi samay-seema nahi deta; CPA s.2(47)(viii) ke hisaab se bill me likhi muddat, warna 30 din. 48 ghante aur 7 din invoice pe na likhe hon to tikte nahi.                                 | Takrav ka jokhim           | Muddatein invoice aur order page pe; defective aur nakli pe kam se kam 30 din (ya owner ki muddat jo invoice pe chhape); 48 ghante saboot ka niyam, haq khatam hone ka nahi; muddat ke baad bhi support ki jaanch. | L-073                             |
| 2   | D-117 niyam 4 (aur D-079)           | Rule 6(3): tay delivery schedule se der pe seller return ya refund se mana nahi kar sakta (force majeure chhod ke). Return ki wajahon me "der se aaya" nahi.                                                                                                          | Kami / takrav ka jokhim    | "Der se pahuncha" ek wajah: door pe mana (poora refund, delivery fee samet) ya kuch din me return, bina return fee; force majeure ka flag staff ka, wajah ke saath.                                                | L-094                             |
| 3   | D-120 niyam 3 (aur D-089)           | 1 Jan 2027 se har "price reduction" ke saath prior price (30 din ka sabse kam daam) zaroori (secondary). R1 me har jagah kata MRP aur "% off" dikhta hai; prior price sirf R2 ke "sale" label pe.                                                                     | Takrav ka jokhim (2027 se) | R1 se hi har discount display ke saath "pichhle 30 din ka sabse kam daam" (data D-061 me hai), ya "% off" tabhi jab ye bhi dikhe.                                                                                  | L-085                             |
| 4   | D-100 niyam 5                       | CPA s.2(47)(i)(g): performance ya efficacy ka daawa "adequate or proper test" pe na tika ho to unfair trade practice; saboot ka bojh daawa karne wale pe. R1 me sirf SPF ka saboot.                                                                                   | Takrav ka jokhim           | Claims ki list do hisse me: ghoshna wale, aur test/efficacy wale (dermatologically tested, clinically proven, non-comedogenic); doosre wale R1 me saboot ke bina list me na hon.                                   | L-086                             |
| 5   | D-151 niyam 1, SR-066               | Account delete pe "invoice aur ledger me naam, pata, email ki jagah code". CGST s.36: records 72 mahine; rule 46: ₹50,000+ B2C aur B2B invoice pe naam-pata zaroori. Jaari invoice ko badalna tax record ko badalna.                                                  | Takrav                     | Jaari invoice aur credit note ki asli copy ek alag, kam pahunch wale tax archive me 72 mahine (+ jhagda) tak bina badlav; app ki baaki jagah pehchaan hatana; samay poora hone pe archive se bhi.                  | L-021                             |
| 6   | D-193 niyam 2                       | Seller KYC "band hone ke 3 saal baad delete"; jo dastavez GST records ka hissa hain (GSTIN certificate, TCS ke statements) unke liye s.36 ke 72 mahine.                                                                                                               | Kami                       | Retention ki setting dastavez ke kism ke hisaab se: tax wale 72 mahine, baaki 3 saal (run 2 ke KYC aur DPDP niyam ke baad pakka).                                                                                  | L-021                             |
| 7   | D-143 niyam 2, SR-088               | Seller ko customer ka naam-pata nahi; par ₹50,000 ya zyada ke B2C invoice pe naam aur pata zaroori (rule 46(e)), aur seller ki invoice copy me wahi hoga.                                                                                                             | Kami                       | ₹50,000 se kam: invoice pe state (aur shehar/pincode), naam-pata sirf customer ke kehne pe; ₹50,000+ pe poora, aur seller ki copy me bhi (SR-088 ki ek-ek download aur audit ki rok bani rahe).                    | L-020                             |
| 8   | D-088 niyam 3                       | Combo (ek daam) mixed supply ho to s.8(b) se poora combo sabse zyada rate pe; har cheez apne rate pe lagana galat ho sakta hai. Brand kit pe bhi 5% + 18% ka mel ho to 18%.                                                                                           | Takrav ka jokhim           | R2 ke combo se pehle CA se tay: ek daam = mixed supply (sabse zyada rate), ya alag daam dikha ke alag supplies. Kit ki listing ka default rate "sabse zyada wala".                                                 | L-010                             |
| 9   | D-121 niyam 2                       | Circular 92/11/2019: kharid ki shart wala "free" gift asal me ek daam ki supply ho sakta hai; ₹0 ki taxable line sahi nahi.                                                                                                                                           | Kami                       | Bina shart ka sample: tax invoice ke bahar "free sample, not for sale"; shart wala gift CA ki salah tak R2 me nahi.                                                                                                | L-009                             |
| 10  | D-097 niyam 1                       | Cosmetics Rules rule 35: manufacturer ki label likhawat ko badalna, mitana ya dhakna mana. Platform ka barcode label kahan lage, tay nahi.                                                                                                                            | Kami                       | Label sirf khaali jagah ya bahar ke polybag pe; kabhi batch, expiry, MRP, ingredients ya kisi likhawat pe nahi; receiving pe photo.                                                                                | L-066                             |
| 11  | D-064, D-106 niyam 1, D-113 niyam 1 | Rule 34(2)(a): 10 g / 25 ml tak ke packs pe batch number zaroori nahi; soap pe batch ki jagah mfg mahina. Faisle maante hain ki har pack pe batch hai.                                                                                                                | Kami                       | "Pack pe batch nahi" sirf in maamlon me; platform ka batch id (receiving lot + mfg mahina ya expiry); aise items pe daawe aur pickup me batch photo ki jagah pack photo.                                           | L-053                             |
| 12  | D-061 niyam 1, D-064                | Legal Metrology rule 18(3): tax ghatne pe manufacturer ka bataya revised kam MRP purane packs pe bhi laagu. Faisle sirf chhapa MRP maante hain.                                                                                                                       | Kami                       | Batch pe optional "revised MRP (tax badlav)" + saboot; daam ki seema, % off aur site ka MRP isi se.                                                                                                                | L-036                             |
| 13  | D-138                               | Legal Metrology rule 6(10A) (1 Jul 2026 se): country of origin ka filter **searchable aur sortable**. D-138 ke sort me country nahi.                                                                                                                                  | Kami                       | Sort me "country of origin" (ya country ke hisaab se kram); search me country ka naam.                                                                                                                             | L-033                             |
| 14  | D-166 (aur D-031)                   | 2027 se rule 5(6): platform se milte naam wale seller ko bechne ya promote karne me customer ka data sirf express consent se (secondary).                                                                                                                             | Kami (2027 se)             | House brand ka naam platform se alag, ya sujhaav me house brand sirf alag opt-in wale customers ko.                                                                                                                | L-078                             |
| 15  | D-145 niyam 4                       | E-commerce rule 4(4): grievance officer ka **naam**, contact aur designation dikhana. D-145 kisi insaan ka banawati naam nahi rakhta.                                                                                                                                 | Chhota takrav              | Naam ka field data me; demo me naam "Dummy Grievance Officer" + "DUMMY" badge (insaan jaisa naam nahi). Asli business pe asli naam.                                                                                | L-075                             |
| 16  | D-134 (table)                       | Rows ya level kam: nodal person (rule 4(1)); "Sold by" me seller ki jaankari aur seller ka grievance officer (rules 5(3)(a), 6(4), 6(5)); dark patterns ka saal ka self-audit + certificate (2027); NCH; e-invoice ka field; TCS registration har warehouse state me. | Kami                       | Table me ye rows: nodal person L1; seller jaankari L2 (iske bina seller live nahi); dark patterns me self-audit ka record + certificate (L3 jaisa, 2027 se); e-invoice field L1; TCS registration L1.              | L-070, L-071, L-084, L-004, L-013 |
| 17  | D-163 niyam 3                       | 2027 se grievance ki receipt ke saath shikayat ki recorded copy (secondary). Seller ke grievance officer ka raasta nahi.                                                                                                                                              | Kami                       | Receipt (email aur in-app) me shikayat ka poora text; seller ki shikayat bhi isi seedhi me.                                                                                                                        | L-075                             |
| 18  | D-062, D-067, D-082                 | Cosmetics 2025 amendment (secondary): "use before" = mahine ka pehla din, "expiry" = mahine ka aakhri din. Faisle ek hi tarah ki tareekh maante hain.                                                                                                                 | Kami                       | Batch pe expiry ka "roop" aur system ka "aakhri din"; seemaayein usi se; pack jaisa text customer ko.                                                                                                              | L-052                             |
| 19  | D-086                               | Rate sirf HSN se tay nahi: 3304 me talcum 5% par make-up 18%; 3401 me soap bar 5% par face wash 18%.                                                                                                                                                                  | Kami                       | Table ki row = HSN + description ki shart + rate + tareekh; seller row chune, staff jaanche.                                                                                                                       | L-001                             |
| 20  | D-132                               | Blocklist me abhi sirf drug ingredients; Cosmetics Rules rule 39 IS 4707 Part 2 Annex A ke raw materials cosmetic me mana karta hai.                                                                                                                                  | Kami                       | Blocklist ke do hisse: drug ingredients (D-128) aur "cosmetic me mana" (IS 4707 Part 2 Annex A); har entry pe source.                                                                                              | L-059                             |
| 21  | D-142 (recall emails)               | Recall ke emails "burst" ki tarah kai dinon me bant sakte hain; kanooni seema nahi mili, par sehat ka maamla.                                                                                                                                                         | Kami (salah)               | Recall ke emails ki line paise ke emails se upar (OTP ke baad), ya recall pe din ki chhat ka apvaad.                                                                                                               | L-061                             |
| 22  | D-107                               | 1 Nov 2026 se delivery services pe naya GST niyam (5% bina ITC, ECO ki s.9(5) zimmedari; secondary). Hamari delivery fee pe kaunsa niyam, pakka nahi.                                                                                                                 | Kami                       | CA se fee ka SAC aur rate; rate table me tareekh ke saath.                                                                                                                                                         | L-012                             |
| 23  | D-081 (TDS ka pal)                  | Income-tax TDS "credit ya payment jo pehle"; agar ledger me bikri delivery pe credit hoti hai to TDS tab, payable ke din nahi.                                                                                                                                        | Kami (design)              | Finance me TDS ka pal = seller ledger me pehla credit; return pe ulat ka niyam CA se.                                                                                                                              | L-014                             |
| 24  | D-092 (aur D-065 niyam 4)           | GSTIN doosre state ka aur delivery Maharashtra me: invoice Maharashtra ka CGST + SGST, jiska credit wo GSTIN shayad na le paaye.                                                                                                                                      | Kami                       | Checkout pe state code ka milaan aur saaf chetavni.                                                                                                                                                                | L-018                             |
| 25  | D-041 / D-030 (invoice kab)         | Invoice maal nikalne se pehle ya us waqt (s.31). Kisi faisle me pal likha nahi.                                                                                                                                                                                       | Kami                       | Invoice pack/dispatch scan pe; pack se pehle cancel pe invoice nahi; baad me credit note.                                                                                                                          | L-003, L-005                      |
| 26  | D-150                               | E-commerce rule 5(3)(d) aur 5(3): payment ke tareeke, fees aur charge-back ki jaankari, aur kram ke gun ka page; D-150 ki list me nahi.                                                                                                                               | Chhoti kami                | "Payments" aur "Kram kaise" pages D-150 ki list me.                                                                                                                                                                | L-091                             |
| 27  | D-098                               | Rule 5(2): sellers se content sahi hone ka **undertaking**; likha nahi.                                                                                                                                                                                               | Chhoti kami                | Seller agreement me undertaking + har listing submit pe checkbox (pre-ticked nahi).                                                                                                                                | L-080                             |
| 28  | D-099 niyam 1                       | Rule 34(7): 60 ml / 30 g tak ke packs pe label pe ingredients zaroori nahi, to label photo se milaan nahi hoga.                                                                                                                                                       | Chhoti kami                | Chhote packs pe outer carton ki photo ya brand ki specification.                                                                                                                                                   | L-054                             |
| 29  | D-061 niyam 1 (chhote packs)        | 10 g / 10 ml tak ke packs pe Legal Metrology ka MRP zaroori nahi; faisla maanta hai MRP hamesha hai.                                                                                                                                                                  | Chhoti kami                | Owner chune: aise packs R1 me nahi, ya "reference price" ka field.                                                                                                                                                 | L-041                             |

**Purane kaam ka ek niyam jo naye me nahi aana chahiye:** "apne brand ki bikri pe TCS aur TDS nahi". D-031 ke baad house brand alag company hai, to TCS aur TDS dono laagu (L-015).

## 7. COMPLIANCE.md ke liye prastaav

Sirf prastaav; owner ki haan ke baad hi COMPLIANCE.md me kuch judega. Ye hissa apne aap me poora hai (naye doc me kisi purane kaam ka zikr nahi).

**Dhaancha:**

- **§0 Kaise padhein:** "Jaancha" ka matlab (public source se milaaya, lawyer nahi); har row pe source aur tareekh; sab registrations dummy (D-026); level L1, L2, L3 (D-134).
- **§1 Kab se laagu (tareekhein):** 22 Sep 2025 (GST rates), 1 Jul 2026 (country of origin filter), 1 Nov 2026 (delivery services ka GST, pakka karna baaki), 1 Jan 2027 (E-commerce Rules ka 2026 amendment). Har nayi tareekh pe ek line.
- **§2 Matrix:** columns wahi jo file me likhe hain: **Kanoon ya niyam**, **Kis pe laagu**, **Kis module me**, **System me kya chahiye**, **Dummy kya hai**, **Jaancha ya nahi**. Area ke hisaab se 4 hisse (A se D), aur run 2 ke baad baaki.
- **§3 Khule sawal:** jo CA ya lawyer ke bina tay nahi (jaise platform ka discount aur seller ki taxable value, combo ka rate, delivery fee ka naya GST).
- **§4 Nazar:** kanoon badalne pe kaun dekhe aur kab (misaal har release se pehle ek baar).
- **Change log.**

**§2 ki rows (umeedwar):**

| Area | Kanoon ya niyam                                                                                                                                 | Kis pe laagu          | Kis module me                    | System me kya chahiye (level)                                            | Dummy kya hai                   | Jaancha ya nahi          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------- | ------------------------------------------------------------------------ | ------------------------------- | ------------------------ |
| A    | CGST s.31, rule 46: tax invoice kab aur kya likha ho                                                                                            | Har seller            | Orders, finance                  | Dispatch pe invoice, har seller GSTIN ki series, zaroori fields (L3)     | GSTIN, specimen PDF             | Jaancha                  |
| A    | CGST s.34: return pe credit note                                                                                                                | Har seller            | Returns, finance                 | Line-wise credit note, asli invoice ka hawala, tareekh ki seema (L3)     | Specimen PDF                    | Aadha jaancha            |
| A    | GST rates (Notification 9/2025-CT(Rate))                                                                                                        | Har product           | Catalog                          | HSN + description ki shart + rate + tareekh ki table (L2)                | Asli rates                      | Jaancha                  |
| A    | CGST s.8: mixed aur composite supply                                                                                                            | Kits, combos          | Catalog, orders                  | Kit ka rate, combo ka niyam (L2)                                         | Test kit                        | Jaancha (laagu karna CA) |
| A    | CGST s.52: TCS 0.25% + 0.25% (ya 0.5% IGST)                                                                                                     | Platform (ECO)        | Finance                          | Mahine ki net value, kaat, GSTR-8 jaisa register (L3)                    | TCS registration number         | Jaancha                  |
| A    | Income-tax Act 2025 s.393 (pehle 194-O): TDS 0.1%                                                                                               | Platform              | Finance                          | Credit ke pal pe kaat, ₹5 lakh ki chhoot ka niyam, register (L3)         | PAN                             | Aadha jaancha            |
| A    | CGST s.24: ECO aur uske sellers ka registration                                                                                                 | Platform, sellers     | Seller onboarding                | Warehouse state ka GSTIN, additional place of business ka saboot (L2)    | GSTIN certificate               | Aadha jaancha            |
| A    | Platform ki fees ka tax invoice                                                                                                                 | Platform              | Finance                          | Fees invoice, payout statement se alag (L3)                              | Platform GSTIN                  | Aadha jaancha            |
| A    | Delivery fee ka GST (nayi tareekh 1 Nov 2026)                                                                                                   | Platform              | Orders, finance                  | Platform ka alag invoice, rate table me SAC (L2)                         | Specimen PDF                    | Aadha jaancha            |
| A    | Vouchers (Circular 243/37/2024)                                                                                                                 | Gift cards (baad me)  | Finance                          | Bikri pe GST nahi, redemption pe invoice (L1)                            | Test gift card                  | Jaancha                  |
| A    | CGST s.36: records 72 mahine                                                                                                                    | Platform, sellers     | Finance, data                    | Tax archive, delete se alag (L2)                                         | Retention setting               | Jaancha                  |
| A    | E-invoice (₹5 crore)                                                                                                                            | Bade sellers          | Finance                          | Seller pe field, B2B invoice pe IRN (L1)                                 | DUMMY IRN                       | Aadha jaancha            |
| B    | LM (PC) Rules rule 6(1), 6(10): online declarations                                                                                             | Har listing           | Catalog                          | Declarations ke bina listing live nahi (L2)                              | Dummy manufacturer              | Jaancha                  |
| B    | Rule 6(10A): country of origin ka filter (1 Jul 2026)                                                                                           | Imported listings     | Search                           | Searchable aur sortable filter (L2)                                      | Test imported product           | Jaancha                  |
| B    | Rule 6(1)(e), 18(2): MRP taxes samet, upar bikri nahi                                                                                           | Har listing           | Catalog, checkout                | Server check (L2)                                                        | Dummy MRP                       | Jaancha                  |
| B    | Rule 18(3), 6(3): tax badle to revised MRP                                                                                                      | Sellers               | Catalog                          | Batch pe revised MRP field (L2)                                          | Test batch                      | Jaancha                  |
| B    | Rule 6(11): unit sale price                                                                                                                     | Har listing           | Catalog                          | System se nikla (L1)                                                     | Nikla hua                       | Jaancha                  |
| B    | Rule 6(8): veg/non-veg dot                                                                                                                      | Cosmetics, toiletries | Catalog                          | Field, claim se takrav ki jaanch (L1)                                    | Dummy                           | Jaancha                  |
| C    | Cosmetics Rules rule 34: label                                                                                                                  | Har cosmetic          | Catalog, receiving               | Label photo ki checklist (L2)                                            | Dummy label                     | Jaancha                  |
| C    | Rule 34(1)(c), 3(w): expiry ki jaankari zaroori                                                                                                 | Har batch             | Receiving                        | Expiry ka roop aur aakhri din; sirf PAO wapas (L2)                       | Test batches                    | Jaancha                  |
| C    | Rules 12, 14, 18, 34(5): import registration                                                                                                    | Imported cosmetics    | Catalog                          | RC number, RC holder, retention fee ki yaad (L2)                         | DUMMY RC                        | Jaancha                  |
| C    | Rules 33, 34(2)(b): licensed manufacturer, M.L. number                                                                                          | Indian cosmetics      | Catalog                          | Licence ka type aur number (L2)                                          | DUMMY M.L.                      | Jaancha                  |
| C    | Act s.3(aaa), rule 36: drug claim wala product cosmetic nahi                                                                                    | Har listing           | Catalog                          | Drug aur AYUSH drug type rok, mana shabdon ki list (L2)                  | Test listing                    | Jaancha                  |
| C    | Rule 39: mana raw materials (IS 4707 Part 2 Annex A), rang, metals                                                                              | Har listing           | Catalog                          | Blocklist ke do hisse (L2)                                               | Dummy list                      | Jaancha (list nahi)      |
| C    | Rules 18(4), 39(7): animal testing mana                                                                                                         | Har cosmetic          | Catalog                          | "Cruelty-free" claim sirf certificate ke saath (L2)                      | Dummy certificate               | Jaancha                  |
| C    | Rule 65: voluntary recall aur authority ko suchna                                                                                               | Brand (seller)        | Recall                           | Batch rok, customers ko khabar, "authority ko bataya" ka record (L2)     | Dummy reference                 | Jaancha                  |
| C    | Rule 35: label badalna mana                                                                                                                     | Warehouse             | Receiving                        | Platform label ki jagah ka niyam aur photo (L2)                          | Test photo                      | Jaancha                  |
| D    | E-commerce Rules rule 4(1), 4(2): platform ki jaankari, nodal person                                                                            | Platform              | Customer app (pages)             | About/Contact page (L1)                                                  | Dummy company, `example` emails | Jaancha                  |
| D    | Rules 4(4), 4(5), 5(3)(b): grievance officer, 48 ghante, 1 mahina                                                                               | Platform, sellers     | Support desk                     | Ticket number, timers, register (L3)                                     | Dummy Grievance Officer         | Jaancha                  |
| D    | Rules 5(3)(a), 6(4), 6(5): seller ki jaankari                                                                                                   | Har seller            | Seller onboarding, product page  | "Sold by" block, seller grievance officer (L2)                           | Dummy sellers                   | Jaancha                  |
| D    | Rule 6(3), CPA s.2(47)(viii): defective ya late maal pe return aur refund                                                                       | Sellers, platform     | Returns                          | Wajahein (late delivery samet), muddat invoice pe (L2)                   | Settings ke number              | Jaancha                  |
| D    | Rules 4(8), 4(9): cancel charge, pre-ticked consent                                                                                             | Platform              | Checkout, sign-up                | Koi cancel fee nahi; koi pre-ticked box nahi (L2)                        | Kuch nahi                       | Jaancha                  |
| D    | Rule 4(11): daam ka khel aur manmani classification                                                                                             | Platform              | Pricing                          | Pro aur "suvidha band" ke likhit niyam (L2)                              | Test Pro                        | Jaancha                  |
| D    | Rules 5(3), 5(4): kram ke gun, differentiated treatment                                                                                         | Platform              | Search, seller agreement         | Public page, agreement ki line (L1)                                      | Kuch nahi                       | Jaancha                  |
| D    | 2026 amendment (1 Jan 2027): prior price, sponsored, search, invoice pe seller ka naam, data aur platform ka brand, dark patterns ka self-audit | Platform, sellers     | Pricing, search, invoice, growth | Har hissa apni row me jab pakka ho (L2, self-audit L3)                   | DUMMY certificate               | Aadha jaancha            |
| D    | Dark Patterns Guidelines 2023                                                                                                                   | Platform, sellers     | Saare customer screens           | 13 patterns ki UX checklist (L2)                                         | Kuch nahi                       | Aadha jaancha            |
| D    | CPA s.2(28), s.2(47)(i)(g), s.21: misleading ads aur claims ka saboot                                                                           | Sellers, platform     | Catalog, Creator                 | Claims ki do lists, saboot (L2)                                          | Dummy reports                   | Jaancha                  |
| D    | CPA s.86: product seller ki zimmedari                                                                                                           | Platform (warehouse)  | Warehouse, returns               | Storage, FEFO, quarantine aur returns QC ke likhit niyam aur record (L2) | Kuch nahi                       | Jaancha                  |

## 8. Run 2 ke liye

Is run me sirf mapping; inka research nahi hua. "Kahan se" §1 ki table me bhi. Sources sirf ye batane ke liye ki kahan dekhna hai (is run me nahi khole).

### 8.1 Personal data (DPDP Act 2023, DPDP Rules 2025; IT Act s.43A)

- **L-100** Consent aur notice: photos, location, dastavez, marketing, tracking (D-069, D-072, D-106, D-133, D-141, D-155, D-157, D-169, D-191, D-192; BDA2 §7.3 #8, #14; Security §11 #19).
- **L-101** Sehat ke paas ka data: allergy, skin reaction, beauty profile, expert ke notes (D-025, D-130, D-159, D-165, D-207, D-208; SR-067).
- **L-102** Data ke haq aur jawab ka samay (D-151; BDA2 §7.3 #15).
- **L-103** Data rakhne aur delete ka samay, backups (D-193, D-194, D-216, D-218; Security §11 #20). GST ka 72 mahine wala hissa L-021 me ho chuka.
- **L-104** Data leak pe users aur Board ko suchna (D-198; Security §11 #17).
- **L-105** KYC me Aadhaar (D-216; SR-064; Security §11 #21). Aadhaar Act 2016 aur UIDAI ke regulations bhi.
- **L-106** Staff ki personal data tak pahunch (D-201).
- **L-107** Device ki pehchaan aur accounts ka jod (D-203, D-156, D-176; Security §11 #23).
- **L-108** Seller ko customer ka data, review ke saath data, sujhaav me data (D-143, D-166, D-167). L-078 (2027 ka E-commerce niyam) ke saath padhein.
- **L-129** Demo site pe anjaan logon ka data (D-133).
- **L-131** Privacy policy aur user agreement ke zaroori hisse, privacy page me backups (D-150, D-218).
- **L-132** Marketing khabron ki consent aur band karna (D-141; raaste wahi jo D-141 me tay hain).
- **Sources:** meity.gov.in (DPDP Act 2023 aur Digital Personal Data Protection Rules 2025), egazette.gov.in, uidai.gov.in.

### 8.2 IT Act aur intermediary niyam

- **L-109** Reviews jaise user content: platform ki zimmedari, shikayat ki receipt, hatane ke samay (D-136, D-146, D-163; BDA2 §7.3 #3); E-commerce rule 5(1) ki s.79 wali shart.
- **Sources:** IT Act 2000 s.79; Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021 ke saare amendments (meity.gov.in, egazette.gov.in).

### 8.3 CERT-In aur data ki jagah

- **L-110** Logs rakhne ka samay, incident report ka samay, clock sync (D-194, D-218; Security §11 #18).
- **L-111** Payment data India me rakhna aur Singapore hosting (D-058; Security §11 #22; BDA2 §7.3 #19).
- **Sources:** CERT-In Directions 28 Apr 2022 aur FAQs (cert-in.org.in); RBI ka "Storage of Payment System Data" circular (6 Apr 2018) aur FAQs (rbi.org.in).

### 8.4 RBI: payments, refunds, PPI, mandates

- **L-112** Marketplace ke liye payment aggregator, sellers ka paisa rakhna, settlement ka samay (D-093, D-081).
- **L-113** Failed transactions aur refunds ka TAT (D-111).
- **L-114** Points, promo credit, wallet aur gift cards: PPI (closed ya semi-closed), kam se kam muddat, KYC, bina kharch ka balance (D-173, D-174, D-177, D-179, D-219; THREAT_MODEL ka bacha jokhim). L-092 (points ki expiry ki suchna) bhi yahin.
- **L-115** Recurring payment mandate (D-178).
- **Sources:** rbi.org.in: Payment Aggregators ki Master Direction (abhi ka version), TAT for failed transactions circular (20 Sep 2019), Master Directions on Prepaid Payment Instruments (abhi ka version), e-mandate framework.

### 8.5 Gig delivery partners

- **L-116** Code on Social Security 2020 me aggregator ka registration, contribution, partners ka record; state ke gig-worker kanoon; kamaai se kaat (D-033, D-068, D-103, D-104; D-134 row).
- **L-117** Partner ke payouts pe income-tax TDS (D-104).
- **L-118** Partner ki location aur photo (D-072, D-191; Security §11 #24); DPDP ke saath.
- **Sources:** labour.gov.in (Code on Social Security 2020 aur central rules), Maharashtra ke labour department ke niyam, incometaxindia.gov.in (Income-tax Act 2025 s.393 ki table).

### 8.6 Warehouse, transport aur environment

- **L-119** Perfume, aerosol, nail polish jaise jalne wale maal ko rakhna aur do-pahiya pe le jaana; fire NOC (BDA §8.2 #14; D-134 row).
- **L-120** Warehouse aur hub ka Shops & Establishments registration (D-134 row).
- **L-121** Warehouse aur hub ke beech aur kai sellers wale parcel pe e-way bill (D-027, D-077; D-134 row; BDA2 §7.3 #17).
- **L-122** Plastic EPR ka packaging data (D-045; D-134 row; BDA2 §7.3 #18).
- **L-123** Expired ya toote cosmetics ko nasht karna (D-062, D-063).
- **Sources:** peso.gov.in (Petroleum Rules, Gas Cylinder Rules, aerosol), Maharashtra Fire Prevention and Life Safety Measures Act 2006, Maharashtra Shops and Establishments Act 2017, CGST Rules rule 138 aur ewaybillgst.gov.in, cpcb.nic.in (Plastic Waste Management Rules 2016, EPR guidelines, Solid Waste Management Rules 2016).

### 8.7 Health aur AYUSH

- **L-124** Dermatologist jaise expert ki online consultation (D-025, D-172; D-134 row; BDA2 §7.3 #11).
- **L-125** AYUSH drug licence ki detail (D-128; L-058 ki seema ke aage).
- **L-130** Ilaaj jaise daawe aur Drugs and Magic Remedies (Objectionable Advertisements) Act 1954 (D-137, D-146).
- **Sources:** NMC ki Telemedicine Practice Guidelines (nmc.org.in), ayush.gov.in aur Drugs Rules 1945 ka AYUSH hissa (cdsco.gov.in), indiacode.nic.in.

### 8.8 IP, contracts aur baaki

- **L-126** Brand authorisation, trademark aur nakli maal (D-075).
- **L-127** Pehle ke kaam ke bahar ke assets (font, icon, image) ka license, public ingredient database (jaise CosIng) ka license, BIS standards ke text ka istemaal (D-074, D-132; L-059).
- **L-128** Seller pe udhaar ki vasooli (D-071).
- **Sources:** ipindia.gov.in (Trade Marks Act 1999), copyright.gov.in, European Commission ka CosIng page (terms of use), bis.gov.in.

## 9. Pehle ke kaam se lene layak (D-074)

Pehle ke kaam ki kanooni matrix (purane PRD ka §7.1 aur §7.3) sirf input checklist ki tarah dekhi. Har cheez ki teen jaanch: **(1) asli zaroorat** (kanoon ya tay faisla maangta hai), **(2) tay faislon se takrav nahi**, **(3) naye vakya me likhi ja sake** (copy nahi). Jo leni hai wo naye docs me naye shabdon me, bina purane kaam ke zikr ke.

### 9.1 Lene layak

| Cheez                                                                                                                                                   | (1) Zaroorat                      | (2) Takrav nahi                      | (3) Naya likhna           | Is report me               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------ | ------------------------- | -------------------------- |
| Grievance Officer: naam, designation, contact; 48 ghante receipt, 1 mahine me hal                                                                       | Haan (E-com rule 4(4), 4(5))      | D-163 se mel; naam wala hissa §6 #15 | Haan                      | L-075                      |
| 2027 se shikayat ki recorded copy                                                                                                                       | Haan (2026 amendment, secondary)  | Haan                                 | Haan                      | L-075                      |
| Nodal person (India me rehne wala)                                                                                                                      | Haan (rule 4(1))                  | Haan                                 | Haan                      | L-070                      |
| Seller: likhit agreement, apna grievance officer, naam, pata, GSTIN, PAN; listing pe seller ki jaankari                                                 | Haan (rules 5(3)(a), 6(4), 6(5))  | Haan                                 | Haan                      | L-071                      |
| Product page ki declarations (maker/packer/importer, country of origin, generic naam, net quantity, MRP, customer care)                                 | Haan (LM rule 6(1), 6(10))        | D-134 se mel                         | Haan                      | L-031                      |
| Imported products ka searchable aur sortable country of origin filter (1 Jul 2026 se)                                                                   | Haan (rule 6(10A), primary mila)  | D-138 me sort jodna (§6 #13)         | Haan                      | L-033                      |
| Cosmetics: sirf licensed ya import-registered; label poora; expired ya standard se neeche maal nahi                                                     | Haan (Cosmetics Rules 33, 34, 39) | D-043, D-062, D-128 se mel           | Haan                      | L-050, L-064               |
| Reviews: seller ya platform customer ban ke review nahi                                                                                                 | Haan (rule 6(2))                  | D-156 se mel                         | Haan                      | L-088                      |
| Dark patterns se bachav; 2027 se saal ka self-audit aur certificate; ranking ke gun kram me; sponsored ka label; discount ke saath prior price (30 din) | Haan (guidelines; 2026 amendment) | Prior price pe §6 #3; baaki fit      | Haan                      | L-081, L-084, L-085, L-077 |
| TCS 0.25% + 0.25% (ya 0.5% IGST), GSTR-8                                                                                                                | Haan (s.52, Notification 15/2024) | Haan                                 | Haan                      | L-013                      |
| TDS 0.1%, individual/HUF ₹5 lakh tak PAN ke saath chhoot (Income-tax Act 2025 s.393)                                                                    | Haan (secondary)                  | Haan                                 | Haan                      | L-014                      |
| Seller ka us state me GST registration jahan warehouse; warehouse additional place of business                                                          | Haan (s.24; D-036)                | D-036 se mel                         | Haan                      | L-016                      |
| Online reviews ka BIS standard "best practice" ki tarah                                                                                                 | Voluntary                         | Haan                                 | Haan, "voluntary" likh ke | L-088                      |
| Warehouse aur hub ke registrations (Shops & Establishments, fire NOC) ka field aur yaad                                                                 | Run 2 me pakka                    | D-134 row se mel                     | Haan                      | L-119, L-120               |

### 9.2 Nahi lene

| Cheez                                                                                              | Kyun nahi                                                                                                                                    |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| "Apne brand ki bikri pe TCS nahi" aur "apne brand pe TDS nahi"                                     | D-031 (alag company) se takrav; ab TCS aur TDS dono laagu (L-015).                                                                           |
| "Apne brand pe inventory-seller wali duties; uski shikayatein platform ka Grievance Officer dekhe" | D-031 aur D-060: house brand ek marketplace seller hai, apne grievance officer ke saath; platform inventory nahi rakhta (rule 7 laagu nahi). |
| Officers ke dummy insaani naam aur phone (Grievance Officer, DPO waghera ke naam)                  | D-145 niyam 4 se takrav; naam ka field "Dummy Grievance Officer" ke roop me (§6 #15).                                                        |
| Naye roles jaise "Legal & Compliance Officer", "Fairness Analyst", "Tax & Statutory Compliance"    | Roles D-017 aur roles ki charcha ka vishay; kanoon role ka naam nahi maangta (sirf nodal person aur grievance officer).                      |
| "Platform ka har us state me normal GST registration jahan warehouse ya hub ho"                    | Bina jaanch ke; platform ko registration wahan chahiye jahan wo supply karta hai ya TCS collect karta hai. CA se pakka karna (L-013, L-016). |
| "2027 se seller ka Udyam number zaroori"                                                           | 2026 amendment (secondary) "GSTIN ya MSME registration number jaisa koi sarkari number" kehta hai, sirf Udyam nahi (L-071).                  |
| IT Rules ke "Feb 2026" wale samay (7 din, 36 ghante, 2 ghante, 3 ghante)                           | Is run me jaanche nahi; run 2 (L-109). Bina jaanch ke na likhein.                                                                            |
| DPDP ki tareekhein (jaise "13 May 2027 se") aur "logs 1 saal"                                      | Run 2 (L-100 se L-104); bina jaanch ke na likhein.                                                                                           |
| Delivery partners pe 1% TDS, aggregator contribution ke % aur state ke gig niyam                   | Run 2 (L-116, L-117).                                                                                                                        |
| "CBIC clarification, 25 Sep 2025" ka hawala                                                        | Is run me nahi mila ya khula; pakka hone tak na likhein (L-016).                                                                             |

## Change log

| Version | Date       | Badlav                                  |
| ------- | ---------- | --------------------------------------- |
| v1.0.0  | 2026-11-19 | Pehla version: kanooni jaanch ka run 1. |
