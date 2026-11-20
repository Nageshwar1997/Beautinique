# CA REVIEW: Beautinique

> **Status:** v1.0.0 (2026-11-20). CA (AI) ki raay (D-257): tax points, ledger aur invoice ke niyam, statements.

## 0. Kaise padhein

- **Kaun:** project ka CA (AI) agent (D-257). Ye raay project ke CA ki raay hai, par AI ki hai: koi licensed CA nahi, aur galti ho sakti hai. Isliye har point pe source aur uska darja (primary ya secondary) likha hai, aur jahan pakka nahi wahan saaf "pakka nahi" likha hai.
- **Kya dekha:** `docs/DECISIONS.md`, `docs/OPEN_QUESTIONS.md` aur `docs/COMPLIANCE.md` me "CA se tay", "CA se", "CA ka kaam", "CA agent", "CA ke liye", "CA se pakka" ke saare hits (Grep, 2026-11-20); COMPLIANCE §0, §1 (CL-001 se CL-024) aur tax ya accounting wali baaki rows; DECISIONS ke judi records (D-030, D-031, D-055, D-060 se D-063, D-071, D-078, D-081, D-086, D-088, D-092 se D-095, D-101, D-104, D-107, D-108, D-110 se D-114, D-121, D-122, D-134, D-145, D-172 se D-179, D-221 se D-274); `docs/PROJECT_PLAN.md` §1 (R1). Sirf reference ke liye (purana, sach nahi): `docs-old/discovery/LEGAL_REVIEW.md` §2 aur `docs-old/discovery/LAWYER_REVIEW.md` §6 "CA ke liye".
- **Tay faisle nahi chhede:** jahan kisi tay faisle se takrav ya kami dikhi, wo §6 "Faislon pe asar" me wajah aur prastaav ke saath hai. Business ke chunaav §8 me owner ke sawal hain.
- **Dummy (D-026):** saare GSTIN, PAN, TAN, TCS registration, challan, IRN aur e-way bill numbers dummy; payments test mode. Niyam asli kanoon ke hisaab se, jaise asli users hon.
- **Mapping ka status (§1):** `CA ki raay pakki` = raay saaf, aur kanoon ka text (Act, notification ya circular) khol ke ya seedhe niyam se tiki. `Aadha` = raay di, par kuch hissa sirf secondary source pe, ya kuch baaki (row me likha). `Nahi ho saka` = raay nahi di (source nahi khula, ya vishay CA ke bahar).
- **COMPLIANCE ke nishaan (§7(a)):** D-272 jaise: `CA ne jaancha` / `CA ne aadha jaancha` (kya baaki) / `CA ne nahi jaancha` (kyun). Ye nishaan owner ki haan ke baad hi COMPLIANCE me jaate hain (D-257).
- **Sources ke niyam:** sarkari site (cbic-gst.gov.in, gstcouncil.gov.in, gst.gov.in, incometaxindia.gov.in, egazette.gov.in, mca.gov.in) pehle. TLS ya 403 pe certificate check kabhi nahi toda: doosri official copy li, ya point "Aadha" rakha. egazette.gov.in aur mahagst.gov.in ka TLS fail hua; incometaxindia.gov.in ne 403 diya. Search me project ka naam ya koi personal data nahi daala.
- **Naye badlav jin pe nazar (2026):** GST 2.0 ke rates (22 Sep 2025 se); delivery seva ka naya rate aur s.9(5) (1 Nov 2026 se); Finance Act 2026 ke CGST s.15(3)(b) aur s.34(1) ke badlav (1 Nov 2026 se); Income-tax Act 2025 aur Income-tax Rules 2026 (1 Apr 2026 se), naye section aur form numbers.

## 1. Mapping

Grep ke har hit ka CA point. "Kahan se" me line ka saar; ek point ke kai hits ek row me.

| Id     | Kahan se                                                                                                             | Point                                                                     | Status           |
| ------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------- |
| CA-001 | COMPLIANCE CL-007; OPEN_QUESTIONS (CL-007 ki line); D-101 niyam 1 aur 4; D-061 niyam 4; D-244 Asar                   | Discount: brand ka aur platform ka; invoice, GST, TCS aur TDS pe asar     | Aadha            |
| CA-002 | COMPLIANCE CL-008; OPEN_QUESTIONS (CL-008 ki line); D-173, D-174, D-175; D-244 Asar                                  | Points ki chhoot ka GST aur points ki liability ki accounting             | Aadha            |
| CA-003 | COMPLIANCE CL-006; OPEN_QUESTIONS (CL-006 ki line); D-122; D-244 Asar                                                | Replacement: credit note + naya invoice, ya bina keemat ka replacement    | Aadha            |
| CA-004 | COMPLIANCE CL-012; OPEN_QUESTIONS (D-107, CL-012 ki lines); D-107 jod; D-239 niyam 3; DECISIONS index D-239          | Delivery fee ka SAC, rate, kiska invoice                                  | CA ki raay pakki |
| CA-005 | COMPLIANCE CL-014; OPEN_QUESTIONS (D-081, CL-014 ki lines); D-081 jod; D-239 niyam 4; D-244 Asar                     | Sellers pe income-tax TDS: GST shaamil ya nahi, return pe ulat, bina PAN  | Aadha            |
| CA-006 | COMPLIANCE CL-113; OPEN_QUESTIONS (D-104, CL-113 ki lines); D-254 niyam 2 aur Asar; D-260 Asar                       | Delivery partners ke payouts pe TDS                                       | Aadha            |
| CA-007 | COMPLIANCE CL-017; OPEN_QUESTIONS (CL-017 ki line); D-063 Asar; D-062; LAWYER_REVIEW §6.3                            | Kho gaye, toote ya nasht maal ka tax aur D-063 ki bharpai                 | Aadha            |
| CA-008 | COMPLIANCE CL-021; OPEN_QUESTIONS (D-272 ki line); D-272 niyam 3 aur Asar                                            | CL-021 ka income-tax hissa: records ka samay                              | Aadha            |
| CA-009 | COMPLIANCE CL-126; D-272 Asar; D-071; LAWYER_REVIEW §6.8                                                             | Seller ke udhaar ka tax hissa                                             | Aadha            |
| CA-010 | COMPLIANCE CL-010; OPEN_QUESTIONS (D-228 ki line); D-228 niyam 2; D-088 badla                                        | Kit aur combo: mixed ya composite supply                                  | CA ki raay pakki |
| CA-011 | OPEN_QUESTIONS (D-229 ki line); D-229 niyam 2; D-121 badla; COMPLIANCE CL-009                                        | Shart wala gift ("X kharido to Y free") ka invoice                        | Aadha            |
| CA-012 | COMPLIANCE CL-023; OPEN_QUESTIONS (CL-023 ki line)                                                                   | Paid consultation ka SAC aur rate                                         | CA ki raay pakki |
| CA-013 | COMPLIANCE CL-117; OPEN_QUESTIONS (CL-117 ki line); D-256 niyam 7; D-260 Asar                                        | E-way bill: seema, kai invoices, consolidated                             | Aadha            |
| CA-014 | D-269 Asar ("finance me ek aur khaata aur roz ka milaan, CA agent ke liye"); D-093; D-256 niyam 4; COMPLIANCE CL-108 | Alag seller settlement khaata aur roz ka milaan                           | CA ki raay pakki |
| CA-015 | D-274 Asar (Seller Agreement clause 10 aur 13, Partner Agreement clause 9)                                           | Documents ke tax clauses                                                  | CA ki raay pakki |
| CA-016 | LAWYER_REVIEW §6.1                                                                                                   | "Limited payment collection agent" aur CGST Schedule I ka principal-agent | Aadha            |
| CA-017 | LAWYER_REVIEW §6.2; COMPLIANCE CL-015                                                                                | Set-off ke baad bhi TCS aur TDS gross pe; Unibelle pe bhi                 | CA ki raay pakki |
| CA-018 | LAWYER_REVIEW §6.4; D-068; D-103                                                                                     | Partner ki kamaai se nuksaan ki kaat pe GST aur TDS                       | Aadha            |
| CA-019 | COMPLIANCE CL-022; D-179, D-249; LAWYER_REVIEW §6.6                                                                  | Gift card ka GST aur accounting                                           | CA ki raay pakki |
| CA-020 | LAWYER_REVIEW §6.8                                                                                                   | MSMED ka 45 din aur income-tax ka uska niyam                              | Aadha            |
| CA-021 | LAWYER_REVIEW §6.9; COMPLIANCE CL-128                                                                                | Seller aur partner agreement pe stamp duty                                | Nahi ho saka     |
| CA-022 | COMPLIANCE CL-024; LAWYER_REVIEW §6.11                                                                               | Demo ke SPECIMEN documents                                                | CA ki raay pakki |
| CA-023 | LAWYER_REVIEW §6.12; D-254 niyam 1; COMPLIANCE CL-112                                                                | Social security contribution ka "turnover" aur provision                  | Nahi ho saka     |
| CA-024 | D-257 niyam 6 ("ledger aur invoice ke accounting niyam")                                                             | Ledger, chart of accounts, entries, invoice aur notes ke niyam            | CA ki raay pakki |
| CA-025 | D-257 niyam 6 ("GST, TCS aur TDS ke statements ka dhaancha"); D-134 (L3)                                             | Returns, statements aur reconciliation ka dhaancha                        | Aadha            |
| CA-026 | Naya (CA): D-114 niyam 2, D-108 niyam 6, D-110 niyam 3, D-222 niyam 2                                                | Return fee aur delivery fee ki wapsi ke tax documents                     | Aadha            |
| CA-027 | Naya (CA): COMPLIANCE CL-001 (Nil rate wale items)                                                                   | Nil rate ka maal: bill of supply                                          | Aadha            |
| CA-028 | Naya (CA): D-078 (fees), Circular 20/2023 ka daayra                                                                  | Hamari fees pe seller ka apna TDS                                         | Nahi ho saka     |
| CA-029 | Naya (CA): D-001 (finance ke niyam), D-057, D-058                                                                    | Company ke books: 8 saal, audit trail, India me roz ka backup             | Aadha            |
| CA-030 | Naya (CA): D-036, D-096                                                                                              | Doosre state se seller ka stock transfer: invoice aur e-way bill          | Aadha            |
| CA-031 | Naya (CA): COMPLIANCE CL-011 ("har payout ya mahine")                                                                | Fees ke invoice ka samay                                                  | Aadha            |
| CA-032 | Naya (CA): D-107, D-110                                                                                              | Prepaid order pe delivery fee ka time of supply                           | Aadha            |
| CA-033 | Naya (CA): D-027 (transporter ka bill), PROJECT_PLAN §1 (R2)                                                         | Transporter ke bill pe GTA ya RCM                                         | Nahi ho saka     |

**Ginti:** 33 points. `CA ki raay pakki` 9; `Aadha` 20; `Nahi ho saka` 4.

Grep ke wo hits jo point nahi, sirf hawala hain: COMPLIANCE line 8 aur status line (paribhasha, "CA ne abhi kuch nahi"); DECISIONS D-220 niyam 4 ka badla (D-257 se nishaan ka niyam); D-257 Wajah aur Asar (kram); D-258 se D-261 ke "Kab dobara khulega"; OPEN_QUESTIONS ki R-004 wali line ("Lawyer aur CA se nahi jaancha") aur D-272 ki salah ki line. Inka kaam §7 ke nishaanon se poora hota hai.

## 2. Tax points

### 2.0 Naye sources (sab 2026-11-20 ko khole ya dhoondhe)

COMPLIANCE ke [T1] se [T10] (§1.0), [G1], [G3], [G5] (§9.0) aur [W5] (§10.0) bhi istemaal hue. Naye:

- **[K1]** Notification 06/2026-Central Tax (Rate), 27 Oct 2026, G.S.R. 936(E), 1 Nov 2026 se; Notification 11/2017-CT(Rate) ki serial 12 (heading 9968) ka item (iii) badla. Gazette ka text ek doosri site ki copy se padha: <https://a2ztaxcorp.net/wp-content/uploads/2026/10/N.-No.-06-2026-CT-UT-IG-Rate.pdf> (egazette.gov.in ka TLS fail). Primary document, secondary host.
- **[K2]** Notification 09/2026-Central Tax (Rate), 27 Oct 2026, G.S.R. 945(E), s.9(5) me "delivery services, other than postal and courier services" (jab supplier registration ke liye bound na ho), 1 Nov 2026 se: <https://a2ztaxcorp.net/e-commerce-operators-made-liable-under-section-95-for-delivery-services-other-than-postal-and-courier-services-supplied-through-them-by-persons-not-liable-for-registration-replacing-the-earli/>. Secondary (saar).
- **[K3]** 57th GST Council (8 Oct 2026) ki delivery seva wali salah: <https://www.taxscan.in/gst/gst-council-recommends-5-gst-without-itc-on-delivery-services-through-e-commerce-platforms>. Secondary.
- **[K4]** Circular 195/07/2023-GST (17 Jul 2023), warranty me bina keemat replacement: <https://gstcouncil.gov.in/sites/default/files/2024-06/circular-cgst-195.pdf>. Primary.
- **[K5]** Circular 243/37/2024-GST (= [T5]), para 6 (breakage) aur para 6.3 me Circular 178/10/2022-GST (3 Aug 2022) ka siddhaant: supply ke liye kuch karne ya na karne ka saaf ya nihit agreement chahiye. Primary.
- **[K6]** Circular 251/08/2025-GST (12 Sep 2025), post-sale discounts; manufacturer aur end customer ke beech tay daam ke liye dealer ko di chhoot dealer ki supply ki value me (inducement). EY ka saar: <https://www.ey.com/en_in/technical/alerts-hub/2025/09/cbic-clarifies-treatment-of-post-sale-and-secondary-discount-under-gst> (mahagst.gov.in ki copy ka TLS fail). Secondary.
- **[K7]** Finance Act 2026 ss.153 se 155: CGST s.15(3)(b) (pehle ka agreement aur invoice se jod hata; credit note aur recipient ka ITC ulatna shart), s.34(1) me post-sale discount, s.54; Notification 03/2026-Central Tax (26 Oct 2026) se 1 Nov 2026: <https://www.lkslaw.com/insights/updates/indirect-tax-update/cgst-act-2017-amendments-by-sections-153-to-155-of-the-finance-act-2026-effective-from-1-november-2026>. Secondary.
- **[K8]** CBDT Circular 20/2023 (28 Dec 2023), s.194-O ki guidelines: GST alag dikhe aur kaat credit pe ho to GST bahar; return pe agli bikri (usi seller, usi saal) me adjust; ECO ka discount gross amount kam nahi karta; seller ne jo invoice nahi kiya wo gross me nahi. BDO ka saar: <https://www.bdo.in/en-gb/insights/alerts-updates/cbdt-issues-additional-guidelines-on-tds-by-e-commerce-operators-under-section-194-o-of-the-it-act>. Secondary (incometaxindia.gov.in 403).
- **[K9]** Income-tax Rules 2026 (G.S.R. 198(E), 20 Mar 2026, 1 Apr 2026 se); "Form No. 140 (Earlier Form No. 26Q)" aur "Form No. 131 (Earlier Form No. 16A)": incometaxindia.gov.in ke search result titles. Primary site, text nahi khula (403).
- **[K10]** BCAS ki presentation (Apr 2026), Income-tax Act 2025 vs 1961 ka TDS: s.393(1) Table Sl. No. 6(i) contractor (1% / 2%; ₹30,000 / ₹1,00,000), Sl. No. 8(v) e-commerce (0.1%; ₹5 lakh); s.397(2) PAN; jama agle mahine ki 7 (Rule 218), quarterly Form 140, TCS Form 143; correction statement ki muddat 2 saal (s.397(3)(f)): <https://bcasonline.org/wp-content/uploads/2026/04/Convergence-Divergence-Provisions-Procedures-of-TDS-and-TCS-Changes-in-Income-Tax-Act-2025-vs-Income-Tax-Act-1961.pdf>. Secondary (professional body).
- **[K11]** NACIN ka "Electronic Way Bill in GST" guide (gstcouncil.gov.in, 2019): consignment value har invoice ya challan ka (tax samet); ek gaadi me kai consignments ho to sirf ₹50,000 se upar wale pe e-way bill; consolidated e-way bill; non-motorised conveyance chhoot; rule 138E me e-commerce operator bhi e-way bill banane walon me: <https://www.gstcouncil.gov.in/sites/default/files/2024-02/electronic-way-bill-050819.pdf>. Primary, purana.
- **[K12]** GSTR-1 Table 14 (ECO ke through supplies, supplier bharta hai) aur Table 15 (s.9(5), ECO bharta hai), Notification 26/2022-CT: <https://tutorial.gst.gov.in/contextualhelp/Einv/SUPECO_14.htm>. Primary (search result).
- **[K13]** Circular 57/31/2018-GST (principal-agent, Schedule I para 3): kasauti ye ki aage ki supply ka invoice agent apne naam se kaatta hai ya nahi: <https://cbic-gst.gov.in/pdf/Circular_57-31_Principal_Agent.pdf>. Primary site, search ka saar.
- **[K14]** Companies Act 2013 s.128(5): books of account kam se kam pichhle 8 financial years tak: <http://ebook.mca.gov.in/Actpagedisplay.aspx?PAGENAME=17511>. Primary site, search ka saar.
- **[K15]** Companies (Accounts) Rules 2014 rule 3(1) (audit trail, band na ho sake; 1 Apr 2023 se) aur rule 3(5) (electronic books ka backup India ke server pe roz; 5 Aug 2022 ka badlav): <https://www.scconline.com/blog/post/2022/08/16/record-keeping-requirements-modified-vide-companies-accounts-fourth-amendment-rules-2022>. Secondary.
- **[K16]** Maharashtra me intra-state e-way bill ki seema ₹1,00,000: search ke nateeje (mahagst.gov.in ka TLS fail). Secondary.
- **[K17]** GSTR-3B me GSTR-1 se aayi liability ka lock (GSTN advisories 2025): search ke nateeje. Secondary.

### CA-001. Discount: brand ka aur platform ka

- **Sawal:** brand ka discount aur platform ka discount (D-101, R2) invoice pe kaise, aur GST, TCS aur TDS kis rakam pe.
- **CA ki raay:**
  1. **Brand ka discount** (supply se pehle, invoice pe): s.15(3)(a) se value me nahi judta. Seller ke invoice pe line ka daam, "discount (brand)" ki line, taxable value ghati hui. TCS aur TDS ghati value pe.
  2. **Platform ka discount** (D-101 niyam 1: seller ko poora daam, farak platform deta hai): ye seller ki supply ka **teesre paksh se aaya consideration** hai (s.2(31): consideration recipient ya kisi aur se). Seller ki taxable value **poora daam** rehti hai; seller apne invoice pe GST poore daam pe deta hai. Invoice pe: line ka daam aur taxable value poore daam pe, neeche "Platform offer (Beautinique ne diya): ₹X" aur "Aapne diya: ₹Y". Ye "discount" ki line nahi hai jo value ghataye.
  3. **TCS** (s.52 net value) aur **TDS** (s.393, gross amount) dono poore daam pe; [K8] ke hisaab se ECO ka discount gross amount kam nahi karta.
  4. **Platform ki taraf:** platform ka hissa platform ka marketing kharcha; is pe GST nahi (ye seller se koi seva nahi), aur ITC ka sawal nahi.
  5. **Baanta hua offer:** dono niyam apne-apne hisse pe.
  6. **Baad ka discount** (supply ke baad): 1 Nov 2026 se s.15(3)(b) me pehle ke agreement ki shart nahi; credit note (s.34) aur registered recipient ka ITC ulatna zaroori [K7]. B2C me ITC nahi, to sirf credit note.
- **Source:** CGST s.2(31), s.15(1), s.15(2)(e), s.15(3) [T3, 2021 copy]; [K6] (secondary); [K7] (secondary); [K8] (secondary).
- **Hamare faisle se mel:** D-101 niyam 1 aur 4, D-061 niyam 4 aur D-175 **fit**. COMPLIANCE CL-007 ka "platform ke discount ka ilaaj CA se" ab tay ho sakta hai.
- **Prastaav:** order line pe teen rakam: `list_price`, `brand_discount`, `platform_funded`; invoice ki taxable value = list price − brand discount. GSTIN wale (B2B) orders pe platform offer chale ya nahi: §8 Q5.
- **Dummy me kya:** R2 ke test offers; invoice "SPECIMEN" pe "Platform offer" ki line.

### CA-002. Points ki chhoot aur liability

- **Sawal:** loyalty points (D-173 se D-175) ka GST aur accounting.
- **CA ki raay:**
  1. Points dena (muft, kharid ke saath) khud supply nahi; is pe GST nahi.
  2. Points se chhoot platform ka kharcha (D-175) = CA-001 ka platform discount: seller ki value poora daam, TCS aur TDS poore daam pe.
  3. Expire hue points: koi supply nahi, GST nahi ([K5] ke breakage wale tark jaisa).
  4. **Accounting:** points "pakke" hone pe (D-174 niyam 2) platform ke books me provision: points × ₹1 × andaaza ki kitne kharch honge; kharcha "loyalty (marketing)". Kharch hone pe provision se seller ko jaane wala hissa; expire pe provision ulta. Pending points pe provision nahi, sirf ginti. Small private company pe Accounting Standards (AS 29 jaisa provision) laagu, Ind AS nahi (Ind AS ki seema ka text nahi khola).
  5. Income-tax me provision ki deduction (ICDS jaisa niyam naye Act me): nahi jaancha.
- **Source:** CGST s.7, s.2(31) [T3]; [K5]; [K6], [K8] (secondary).
- **Hamare faisle se mel:** D-173 se D-175 **fit**.
- **Prastaav:** finance me `loyalty_points_liability` khaata; har mahine andaaze ka review; points ka paisa kabhi seller ke payable me tab tak nahi jab tak order invoice na ho.
- **Dummy me kya:** R2 ke test points.

### CA-003. Replacement

- **Sawal:** galti wale maamle me wahi variant dobara (D-122, R2): credit note + naya invoice, ya bina keemat ka replacement.
- **CA ki raay:** **bina keemat ka replacement.** Circular 195/07/2023 kehta hai ki warranty me bina alag consideration ke replacement pe aage GST nahi, aur ITC ulatna nahi; replacement ki keemat asli bikri ke daam me maani gayi. Hamara replacement (kharab maal, transit me toota, galat item) bhi bina extra paise ka hai, to wahi tark. Document: replacement maal ke saath delivery challan (rule 55), "Replacement, no consideration", asli invoice number aur tareekh ke saath. Asli invoice waisa hi; lauta unit return ki tarah nahi (credit note nahi), D-112 ke raaste (nasht, ya galat item stock me). TCS aur TDS pe koi naya hisaab nahi ([K8]: return ke baad replacement ho to TDS ka adjustment nahi).
- **Kab credit note + naya invoice:** sirf jab replacement me daam badle (jaise doosra batch alag MRP pe), ya replacement na ho paaye aur refund ho.
- **Source:** [K4] (primary); rule 55 ka text nahi khola; [K8] (secondary).
- **Hamare faisle se mel:** D-122 **fit**. CL-006 ka "tareeka CA se" tay.
- **Prastaav:** seller GSTIN ki delivery challan ki apni series (§4); replacement ki line pe asli invoice line ka reference; galat item (hamari pick ki galti) me wo unit kabhi invoice hi nahi hua, to uski wapsi sirf stock movement.
- **Dummy me kya:** challan "SPECIMEN".

### CA-004. Delivery fee: SAC, rate aur kiska invoice

- **Sawal:** customer se delivery fee (D-107) ka SAC, rate aur supplier.
- **CA ki raay:**
  1. **Supplier platform hai** (Beautinique Pvt Ltd): delivery platform ki apni seva hai; fee platform ke GSTIN se, seller ke invoice se alag, order pe ek B2C invoice. Fee seller ke invoice me jaati to maal ki value me judti (s.15(2)(c)) aur kai sellers me baantni padti.
  2. **Rate 1 Nov 2026 se:** Notification 06/2026-CT(Rate) ne heading 9968 ka item (iii) badla: "delivery services" (postal aur courier ke alawa) jo (a) ECO ke through aise supplier dein jo registration ke liye bound nahi, ya (b) **aise maal ke liye hon jo ECO ke through supply hua**, us pe 2.5% CGST + 2.5% SGST (kul 5%), shart: delivery seva me lage inputs ka ITC nahi liya. Hamari fee limb (b) me aati hai: maal sellers ka, hamare platform (ECO) ke through bika. Is entry me koi doosra (ITC wala) rate ka vikalp nahi dikha, to 5% bina ITC hi.
  3. **SAC:** 996813 (local delivery services); rate table me row "9968 (iii)(b), 5%, ITC nahi, 01.11.2026 se", aur pichhli row (18%) 31.10.2026 tak.
  4. **s.9(5) nahi:** hamare gig partners seva platform ko dete hain (partner agreement, D-266), customer ko "ECO ke through" nahi; customer ka contract platform se. Isliye Notification 09/2026 ki s.9(5) wali entry hum pe partner ki taraf se nahi lagti; platform khud supplier hai aur forward charge pe 5% deta hai. Dono raaston me tax ki rakam ek hi, to jokhim kam.
  5. **ITC ki rok:** delivery me lage inputs (hub ka kiraya, delivery bags, partners ke device, hub staff ki sevaon pe GST) ka ITC nahi; saajhe kharchon me hissa ulatna (Explanation (iv) aur rules 42, 43 jaisa). CL-132 (naya).
- **Source:** [K1] (text padha; primary document, secondary host); [K2], [K3] (secondary); s.15(2)(c) [T3].
- **Hamare faisle se mel:** D-107 Asar aur CL-012 **fit**. D-239 niyam 3 ka "SAC aur rate CA se" tay. **Naya asar:** platform ki fulfilment fee me bhi delivery ka hissa hai (D-078 niyam 2): §6 aur §8 Q1.
- **Prastaav:** delivery fee GST samet (jaise ₹49) dikhe; invoice pe taxable value, CGST, SGST. Rate table me tareekh wali do rows. Kab invoice: CA-032.
- **Dummy me kya:** invoice "SPECIMEN"; platform ka dummy GSTIN.

### CA-005. Sellers pe income-tax TDS

- **Sawal:** e-commerce TDS (Income-tax Act 2025 s.393(1), pehle s.194-O) me GST shaamil ya nahi, return pe ulat, bina PAN ki rate, aur kab kaatna.
- **CA ki raay:**
  1. **Section aur rate:** s.393(1) Table Sl. No. 8(v), 0.1% "gross amount of sales or services"; individual ya HUF seller ki saal ki bikri ₹5 lakh tak aur PAN ya Aadhaar diya ho to nahi [K10], [T8]. Hamare dono R1 sellers company hain, to chhoot nahi.
  2. **Kab:** seller ke khaate me credit ya payment, jo pehle. Hamare ledger me seller ka pehla credit invoice ke pal (dispatch) pe (§3), to TDS bhi tab.
  3. **GST:** invoice pe GST alag dikhe aur kaat credit pe ho, to GST ke bina wali rakam pe [K8]. Hum credit pe kaatenge, to taxable value pe.
  4. **Kis rakam pe:** platform offer aur points ka hissa milaa ke poore daam pe (ECO ka discount gross kam nahi karta); brand ka discount ghata ke; platform ki apni delivery fee (seller ka invoice nahi) gross me nahi [K8].
  5. **Return pe ulat:** jis bikri pe TDS kat chuka, wo lauti, to wo TDS usi seller ki **agli** bikri ke TDS me usi financial year me adjust [K8]. Saal badal gaya ya agli bikri nahi hui, to adjust nahi; seller apne return me credit le. Replacement pe adjust nahi.
  6. **Bina PAN:** s.397(2) me uchi rate [K10]; asli rate primary se nahi mili. Setting me rakhein, dummy me bina PAN ka seller onboard hi nahi hota (D-036).
  7. Pichhle Act ke circulars (jaise 20/2023) naye Act me laagu rehte hain ya CBDT ne naya diya: pakka nahi.
- **Source:** [K8], [K10], [T8] (sab secondary); [K9].
- **Hamare faisle se mel:** D-081 jod aur D-239 niyam 4 **fit**; "return pe ulat CA se" ab niyam 5.
- **Prastaav:** finance me `tds_ecom` ki har kaat ka record: seller, invoice line, credit ki tareekh, rakam; return pe "adjust karne layak" balance seller-wise aur saal-wise; din ke ant me ek seller ki saari kaat ek row ban sakti hai (statement ke liye). Rate, seema aur section ka reference tareekh wali setting me.
- **Dummy me kya:** dummy PAN aur TAN; koi challan nahi; report "SPECIMEN".

### CA-006. Delivery partners ke payouts pe TDS

- **Sawal:** partner payouts (D-104, D-254) pe kaunsa TDS, kitna, kab.
- **CA ki raay:**
  1. Partner platform ke contractor hain (maal ki dhulai ka kaam), to contractor wala TDS: s.393(1) Table Sl. No. 6(i): individual ya HUF 1%, baaki 2%; seema: ek payment ₹30,000 se zyada, ya saal ka jod ₹1,00,000 se zyada [K10], [G5]. Ye e-commerce TDS (CA-005) nahi: partner hamare through kisi ko bech nahi raha.
  2. **Kab:** kamaai partner ke khaate me credit (har kaam ke baad) ya payment, jo pehle.
  3. **Seema ka niyam:** saal ka jod ₹1,00,000 paar karte hi us saal ki **poori** rakam pe TDS banta hai; pichhla bina kaata hissa usi payout se. System saal ka jod rakhe aur seema paar hone wale credit pe "catch-up" kaate.
  4. **Bina PAN:** s.397(2) ki uchi rate [K10]; D-254 me PAN zaroori, to normal raasta PAN wala.
  5. **Goods carriage wali chhoot** (purane s.194C(6) jaisi, 10 se kam goods carriage aur PAN ki ghoshna): do-pahiya pe lagna vyakhya ka sawal; naye Act me jagah nahi jaanchi. Default kaat; ghoshna ka field baad me.
  6. GST: partners aam taur pe registration ki seema se neeche; unki seva platform ko, to s.9(5) nahi (CA-004).
- **Source:** [K10], [G5] (secondary).
- **Hamare faisle se mel:** D-104 aur D-254 niyam 2 **fit**; "seema paar pe kaat ka niyam (CA se pakka)" ab niyam 3.
- **Prastaav:** partner payout statement me har hafte: kamaai, kaat (D-068), TDS, net; saal ka jod aur seema tak kitna baaki.
- **Dummy me kya:** dummy PAN; koi challan nahi.

### CA-007. Kho gaya, toota ya nasht maal, aur D-063 ki bharpai

- **Sawal:** hamari custody me nuksaan pe seller ko bharpai (D-063) pe GST, TCS, TDS; seller ka ITC.
- **CA ki raay:**
  1. **Bharpai supply nahi:** seller ne nuksaan sehne ka koi agreement paise ke badle nahi kiya; bharpai hamari custody ki zimmedari ka nateeja hai. [K5] ke siddhaant se ye consideration nahi, GST nahi. TCS (koi supply nahi) aur TDS (bikri nahi, contract kaam nahi) bhi nahi.
  2. **Maal ki bikri nahi:** D-063 niyam 4 (baad me mile to bharpai wapas) se saaf hai ki maal ka maalikana hamare paas nahi aata.
  3. **Seller ka ITC:** kho gaye, chori, nasht maal pe ITC nahi (s.17(5)(h)); seller apna ITC ulate. Isliye mahine ki report (batch ke saath) zaroori, jaisa CL-017.
  4. **Dispatch ke baad nuksaan:** invoice ban chuka tha, customer ko maal nahi mila aur refund hua: seller ka credit note (value nahi mili), phir maal "kho gaya" (s.17(5)(h)) aur D-063 ki bharpai.
  5. **Bharpai ki ek line:** D-063 niyam 1 me "commission aur fees ghata ke" sirf rakam nikalne ka tareeka hai. Statement me bharpai ek net rakam ho; is pe fees ka invoice nahi (warna lagega ki bina bikri ke commission liya).
  6. **Kis daam pe:** D-063 ka "selling price" GST samet hai; bikri pe seller ko GST ke bina wali value hi bachti hai. Bharpai GST ke bina wali value pe ho ya GST samet: owner ka chunaav (§8 Q2).
  7. Income-tax: seller ke liye bharpai business ki aamdani; platform ke liye kharcha.
- **Source:** [K5] (primary); s.17(5)(h) [T3]; Circular 178/10/2022 khud nahi khola.
- **Hamare faisle se mel:** D-063, D-062 aur CL-017 **fit**; ek line aur daam ka aadhaar §6.
- **Prastaav:** khaata `compensation_to_sellers`; transporter ya partner se vasooli (D-068) `recoveries` me, is pe bhi GST nahi (wahi siddhaant).
- **Dummy me kya:** test me ek kho gaya batch; report "SPECIMEN".

### CA-008. CL-021 ka income-tax hissa: records ka samay

- **Sawal:** income-tax ke liye records kitne din.
- **CA ki raay:** company ke liye sabse lamba niyam Companies Act s.128(5): books of account aur vouchers kam se kam pichhle 8 financial years tak [K14]. Income-tax me company ke books ke samay ka koi alag chhota niyam nahi mila (purane Rule 6F jaisa niyam professions ke liye tha); assessment khulne ki muddat bhi isi ke andar aati hai (naye Act ka section nahi jaancha). GST me s.36: annual return ki due date se 72 mahine. Platform ke apne books (ledger, fees aur delivery fee ke invoices, TCS aur TDS ke records): **8 financial years** (FY khatam hone ke baad); sellers ke invoices ki copy (seller ke records, hum ECO ki tarah rakhte hain): kam se kam GST ke 72 mahine.
- **Source:** [K14] (primary site, saar); s.36 [T3]; income-tax ka text nahi khula.
- **Hamare faisle se mel:** D-225 aur D-227 ka "72 mahine (misaal)" sellers ke invoices ke liye **fit**; platform ke apne books ke liye kam: §6.
- **Prastaav:** retention ki do classes setting me: `platform_books` = 8 FY, `seller_tax_docs` = 72 mahine (annual return ki due date se); jhagda chale to uske khatam hone tak (D-225).
- **Dummy me kya:** setting asli; data dummy.

### CA-009. Seller ke udhaar ka tax hissa

- **Sawal:** D-071 ke udhaar (fees bikri se zyada) me GST aur income-tax.
- **CA ki raay:**
  1. Fees ka tax invoice tay samay pe banta hai (CA-031), chahe paisa kate ya na kate; platform ka GST invoice pe deya hai, vasooli pe nahi.
  2. Udhaar kabhi na mile: GST me bad debt ki koi chhoot ya credit note nahi (s.34 me ye wajah nahi). Books me write-off; income-tax me bad debt ki deduction (naye Act me section nahi jaancha).
  3. Seller ki taraf: jis fees invoice ka paisa seller 180 din me na de, us pe seller ka ITC ulatta hai (s.16(2) ka proviso). Set-off bhi payment hai. Isliye udhaar wale invoices pe seller ko yaad (150 din pe) madadgar.
  4. Payment link se aayi rakam: operating khaate me (ye platform ka paisa hai), seller settlement khaate me nahi.
- **Source:** s.16(2), s.34 [T3, 2021 copy]; baaki CA ki samajh.
- **Hamare faisle se mel:** D-071, D-103 aur CL-126 **fit**.
- **Prastaav:** seller ledger me fees ka receivable alag (minus balance); "180 din" ki yaad seller statement me.
- **Dummy me kya:** test mode ka payment link.

### CA-010. Kit aur combo

- **Sawal:** D-228 niyam 2: combo ek daam = mixed supply, ya alag supplies.
- **CA ki raay:**
  1. **Kit (R1):** alag bik sakne wali cheezein ek daam ke ek pack me = mixed supply (s.2(74)); poore kit pe sabse zyada rate (s.8(b)). D-228 niyam 1 ka default theek. Composite (s.2(30)) sirf tab jab cheezein swabhavik roop se saath hon aur ek principal ho (jaise gift box me packing); tab principal ka rate.
  2. **Combo (R2):** "A + B saath me ₹X" agar invoice pe ek hi daam ho, to mixed supply, sab pe sabse zyada rate. Agar har cheez apne alag daam pe site pe bikti ho, invoice pe har line apne daam aur rate pe, aur combo ki chhoot har line pe anupaat me "discount" ki tarah (supply se pehle, s.15(3)(a)), to alag supplies maanne ka mazboot tark hai. Doosre raaste me kuch jokhim hai (vibhag "ek daam" kahe). Farak sirf tab jab cheezon ke rates alag hon (jaise 5% shampoo + 18% conditioner). Chunaav owner ka: §8 Q4.
- **Source:** CGST s.2(30), s.2(74), s.8, s.15(3)(a) [T3] (primary, 2021 copy).
- **Hamare faisle se mel:** D-228 aur D-088 **fit**.
- **Prastaav:** combo ki chhoot ko line-wise baantne ke liye "largest remainder" se paise ka bantwara (§9); return pe line ki apni value.
- **Dummy me kya:** test me ek 5% + 18% ka kit, invoice pe 18%.

### CA-011. Shart wala gift

- **Sawal:** D-229 niyam 2: "X kharido to Y free" ka invoice.
- **CA ki raay:** Circular 92/11/2019 ke hisaab se shart wala "free" muft nahi: ek daam me do cheezein, aur ITC milta hai. To invoice pe dono cheezein, aur daam dono me baanta jaaye; ye combo (CA-010) jaisa hi: (a) ek daam = mixed supply (sabse zyada rate), ya (b) dono lines apne-apne daam pe aur kul chhoot dono me anupaat me, har line apne rate pe. Y ki line pe poori chhoot (value ₹0) **nahi**: wo phir "muft" jaisa dikhta hai aur s.17(5)(h) ka sawal uthata hai. Niyam combo wala hi (§8 Q4). D-121 niyam 4 (return pe gift ka paisa nahi kat-ta) me X lautne pe credit note X ki line aur Y ki baanti hui value dono pe (Y ki value baad me ghati, s.34).
- **Source:** [T7] (secondary); s.17(5)(h), s.8 [T3].
- **Hamare faisle se mel:** D-229 **fit** (R2 tak rok).
- **Prastaav:** shart wala gift combo ke engine se; alag raasta nahi.
- **Dummy me kya:** R2 ke test offers.

### CA-012. Paid consultation

- **Sawal:** consultation paid ho to SAC aur rate.
- **CA ki raay:** abhi muft (D-172): koi consideration nahi, GST nahi (s.7). Paid ho to tab SAC aur rate tay karna; beauty salah "beauty services" (56th Council ne kuch beauty sevaon ko 5% bina ITC kiya [T1]) me aayegi ya "other professional services" me, ye us waqt ki seva ke roop pe tika. Abhi koi kaam nahi.
- **Source:** s.7 [T3]; [T1].
- **Hamare faisle se mel:** D-172 aur CL-023 **fit**.
- **Prastaav:** kuch nahi; paid hone pe naya point.
- **Dummy me kya:** kuch nahi.

### CA-013. E-way bill

- **Sawal:** warehouse se hub ke trip (D-027) pe e-way bill ki seema, kai invoices aur consolidated e-way bill.
- **CA ki raay:**
  1. Seema **har consignment** (har invoice ya delivery challan) ki value pe, tax samet; gaadi ke kul maal pe nahi. Ek gaadi me kai invoices hon to sirf seema se upar wale invoices pe e-way bill zaroori; un sab ka ek consolidated e-way bill (EWB-02) transporter bana sakta hai [K11].
  2. Inter-state ₹50,000 (rule 138). Maharashtra ke andar ₹1,00,000 [K16, secondary]. Hamara trip ek hi sub-district me (D-014), to intra-state seema.
  3. Kaun banaye: Part A supplier (seller) ka; rule 138E me e-commerce operator bhi e-way bill banane walon me hai, to platform seller ki taraf se bana sakta hai (seller agreement me haq) [K11]. Part B me gaadi number (D-027 ke trip record se).
  4. Hub se customer tak partner ka safar: invoice aam taur pe seema se neeche; cycle jaisi non-motorised gaadi pe chhoot [K11].
  5. Returns aur RTO ka safar bhi movement hai; seema se upar ho to delivery challan ya credit note ke saath e-way bill.
- **Source:** [K11] (primary, purana); [K16] (secondary); [W5].
- **Hamare faisle se mel:** CL-117 aur D-256 niyam 7 **fit**; "seema paar ho to number ke bina dispatch nahi" theek, par seema har invoice pe, trip ke jod pe nahi.
- **Prastaav:** trip ke manifest me har invoice ki value (tax samet) aur state ki seema setting me; seema paar invoice pe EWB number ke bina trip dispatch nahi; trip pe consolidated number. Seller agreement me platform ko seller ki taraf se e-way bill banane ka haq.
- **Dummy me kya:** numbers "DUMMY"; portal pe kuch nahi.

### CA-014. Alag seller settlement khaata aur roz ka milaan

- **Sawal:** D-269 ke alag "seller settlement" bank khaate ka hisaab aur roz ka milaan.
- **CA ki raay:** khaata accounting me platform ka hi bank account hai (platform ke naam), par us me rakha paisa zyadatar doosron ka (sellers ka payable, customers ke advance, refunds). Niyam: (1) gateway ka saara settlement isi me aata hai; (2) is se sirf sellers ka payout, customers ke refund (agar gateway na kaate), aur platform ka **kamaya hua** hissa operating khaate me "sweep"; (3) platform ke kharche (partners ke payout, transporter, gateway fees, taxes) operating khaate se; (4) gateway fees settlement me se kat-ti hai, to utni rakam usi din operating khaate se wapas daali jaaye ("top-up"), taaki sellers ka paisa platform ke kharche me na jaaye; (5) roz ki jaanch: settlement bank balance ≥ (sellers ka payable + customers ke advance + refunds payable + jama hone wala TCS aur TDS jo abhi sweep nahi hua). Detail §3 aur §5.
- **Source:** CA ki samajh (accounting design; RBI ka hissa Lawyer ne dekha, CL-108).
- **Hamare faisle se mel:** D-093, D-256 niyam 4, D-269 **fit**.
- **Prastaav:** §3.2 ka invariant aur §5.3 ka roz ka milaan.
- **Dummy me kya:** dono khaate dummy; bank statement test data.

### CA-015. Documents ke tax clauses

- **Sawal:** Seller Agreement clause 10 (fees) aur 13 (tax), Partner Agreement clause 9 (kamaai aur payout) ke tax hisse (D-274).
- **CA ki raay:** clauses me ye baatein:
  - **Seller clause 10 (fees):** fees GST ke bina, GST alag (D-078 niyam 5); marketplace sevaayein "continuous supply" ki tarah, har payout cycle ka ek tax invoice (CA-031); fees ka invoice seller ke warehouse state wale GSTIN pe (ITC ke liye); fulfilment me delivery ka hissa aur uska rate (§8 Q1); return pe fees ka niyam (§8 Q3).
  - **Seller clause 13 (tax):** invoice seller ka, platform seller ki taraf se banata hai, seller sahi HSN aur rate ka zimmedar (D-086 niyam 5); platform ECO ki tarah TCS (s.52) aur TDS (s.393) kaatega, set-off se pehle poori rakam pe; mahine ka TCS statement aur quarterly TDS certificate (Form 131); seller apne GSTR-1 me Table 14 me ECO wali supplies dikhaye, aur mismatch pe tay din (setting) me jawab; platform offer ka hissa seller ki supply ka consideration (CA-001), seller us pe GST de; bharpai (D-063) pe GST nahi, aur lost units pe seller apna ITC ulate (CA-007); platform seller ki taraf se e-way bill bana sakta hai (CA-013); seller ke GST registration me warehouse "additional place of business" (CL-016).
  - **Partner clause 9:** har kaam ki rakam, hafte ka payout, contractor TDS (s.393(1) Sl. No. 6(i)) aur seema ka niyam (CA-006), Form 131, PAN na ho to uchi rate; kaat (D-068) se TDS ka aadhaar nahi ghatta (CA-018); partner registration ki seema paar kare to platform ko bataye.
- **Source:** upar ke points ke sources.
- **Hamare faisle se mel:** D-274 **fit**.
- **Prastaav:** COMPLIANCE §14.3 clause 10 aur 13, §14.4 clause 9 me ye lines (§7(b)).
- **Dummy me kya:** documents ka badge D-264 waisa hi.

### CA-016. "Limited payment collection agent" aur CGST Schedule I

- **Sawal:** platform seller ka "limited payment collection agent" (D-271) hai; kya isse CGST Schedule I para 3 (principal se agent ko maal = supply) lagta hai.
- **CA ki raay:** nahi. Circular 57/31/2018 ki kasauti: aage ki supply ka invoice agent apne naam se kaatta hai ya nahi [K13]. Hamara invoice seller ke naam aur GSTIN se (D-030), maal ka maalik seller (D-060); platform sirf paisa leta hai. To platform Schedule I wala agent nahi, aur seller se platform ko maal ki koi "supply" nahi. Platform ECO ki tarah s.52 ka TCS kaatta hai (s.52 ECO ko "agent nahi" maanta hai).
- **Source:** [K13] (primary site, saar); s.52 [T3].
- **Hamare faisle se mel:** D-030, D-060, D-271 **fit**.
- **Prastaav:** seller agreement me saaf: platform maal nahi khareedta, apne naam se nahi bechta, sirf seller ki taraf se paisa leta hai.
- **Dummy me kya:** kuch nahi.

### CA-017. Set-off ke baad bhi TCS aur TDS gross pe; Unibelle

- **Sawal:** fees, udhaar aur bharpai ka set-off TCS aur TDS ka aadhaar badalta hai kya; Unibelle pe bhi?
- **CA ki raay:** nahi badalta. TCS seller ki supplies ki net value pe (taxable supplies minus usi mahine ki returns), TDS bikri ki gross amount pe; set-off sirf payout ka hisaab hai. Unibelle alag company aur alag GSTIN (D-031): baaki sellers jaisa TCS, TDS aur fees invoice. Platform aur Unibelle related persons ho sakte hain (s.15); fees ka rate card wahi ho, aur rule 28 ke doosre proviso ke hisaab se jab recipient ko poora ITC milta ho to invoice ki value hi open market value maani jaati hai (rule 28 ka text nahi khola). Companies Act ka related party ka niyam (s.188) aur accounts me disclosure (AS 18): asli business pe.
- **Source:** s.52, s.15 [T3]; [K8], [T8].
- **Hamare faisle se mel:** D-031, CL-015 **fit**.
- **Prastaav:** seller record pe "related party" (pehle se) ke saath related party transactions ki saal ki list (finance report).
- **Dummy me kya:** dummy company.

### CA-018. Partner ki kamaai se nuksaan ki kaat

- **Sawal:** D-068 aur D-103 ki kaat pe GST aur TDS ka asar.
- **CA ki raay:** kaat nuksaan ki vasooli hai, partner ki seva ka daam ghatana nahi. To TDS poori kamaai (credit) pe, kaat se pehle; kaat alag line. Vasooli pe GST nahi ([K5] ka siddhaant: nuksaan sehne ka koi agreement nahi). Transporter ke bill se kaat (D-068 niyam 1) bhi vasooli; transporter ke bill ka GST poore bill pe (agar laage).
- **Source:** [K5] (primary); CA ki samajh.
- **Hamare faisle se mel:** D-068, D-103 **fit**.
- **Prastaav:** payout statement: kamaai, TDS, kaat (wajah aur case id), net.
- **Dummy me kya:** dummy partners.

### CA-019. Gift card ka GST aur accounting

- **Sawal:** gift card (D-179, D-249, R2) ka GST aur hisaab.
- **CA ki raay:** voucher ka len-den na maal ki supply na seva ki; GST us maal pe jis ke liye istemaal hua; bina istemaal ke balance (breakage) pe GST nahi [K5]. D-249 ke baad gift card RBI-authorised issuer bechta hai, platform nahi: to platform ke books me gift card ki liability nahi aati; checkout pe gift card sirf payment ka tareeka, aur issuer se "receivable" (gateway jaisa). Issuer platform ko koi commission de, ya platform issuer ke card bech ke commission le, to wo commission seva hai (GST).
- **Source:** [K5] (primary).
- **Hamare faisle se mel:** D-249 **fit**; CL-022 ka "gift card ki bikri liability ki entry" D-249 ke baad purana: §6 aur §7(b).
- **Prastaav:** finance me `receivable_gift_card_issuer`; redemption pe order ka normal invoice, payment method "gift card".
- **Dummy me kya:** test mode, koi asli issuer nahi.

### CA-020. MSMED ka 45 din aur income-tax

- **Sawal:** MSMED Act ka 45 din ka niyam aur purane Act ka s.43B(h) jaisa niyam sellers ke payout ya fees pe.
- **CA ki raay:** sellers ka payout platform ka kharcha nahi (paisa seller ka, D-060, D-093), to s.43B(h) jaisa niyam is pe nahi. Ye niyam platform ke **apne kharidne** pe hai: micro ya small enterprise se seva ya maal (jaise transporter, packaging) ka bill 45 din (ya agreement ke 15 ya 45 din) me na chuke to us saal ki deduction nahi (purana Act). Naye Act me iska section nahi jaancha.
- **Source:** CA ki samajh; text nahi khola.
- **Hamare faisle se mel:** CL-126 ki Lawyer line **fit**.
- **Prastaav:** vendor record pe "MSME (Udyam) hai?" aur bill ki due date; der pe finance ko alert.
- **Dummy me kya:** dummy vendors.

### CA-021. Stamp duty

- **Sawal:** seller aur partner agreement pe Maharashtra stamp duty aur e-stamp.
- **CA ki raay:** nahi di. Maharashtra Stamp Act ka text nahi khola; ye Lawyer aur CA dono ka saajha point hai, aur dummy me koi stamp nahi. Asli business se pehle.
- **Source:** nahi.
- **Hamare faisle se mel:** CL-128, §14.3 clause 26 ("stamp duty ya e-sign asli business pe") **fit**.
- **Prastaav:** §13 Nazar me rakhna.
- **Dummy me kya:** kuch nahi.

### CA-022. Demo ke SPECIMEN documents

- **Sawal:** demo ke invoices s.122 (bina supply ke invoice) se bahar rehte hain kya.
- **CA ki raay:** haan, jab: har PDF pe "SPECIMEN / DEMO: not a tax document" (D-145), GSTIN ka check digit jaan-boojh ke galat (asli GSTIN kabhi na bane), aur koi bhi number kabhi GST portal, IRP ya e-way bill portal pe na jaaye. Ye "invoice" kisi se paisa ya tax credit nahi dilwata.
- **Source:** s.122 [T3, 2021 copy].
- **Hamare faisle se mel:** D-145, CL-024 **fit**.
- **Prastaav:** finance me "demo mode" ka flag jisme koi bhi export portal ke format me na bane bina "SPECIMEN" ke.
- **Dummy me kya:** yahi.

### CA-023. Social security contribution

- **Sawal:** aggregator ke contribution ka "turnover" aur provision (D-254).
- **CA ki raay:** nahi di. Code me contribution "annual turnover" ka 1% se 2% (workers ko diye paise ke 5% tak), dar notify hona baaki; marketplace ke liye turnover platform ki aamdani (commission, fees, delivery fee) hai ya sellers ki bikri bhi, ye Rules ya notification pe tika, aur wo text nahi khula. Accounting me itna: notify hone pe provision (`social_security_contribution`), kharcha "delivery cost".
- **Source:** [G1] (Code), [G3] (secondary).
- **Hamare faisle se mel:** D-254 niyam 1 **fit**.
- **Prastaav:** provision ka khaata design me; dar aur aadhaar setting me.
- **Dummy me kya:** dar band (D-254).

### CA-024. Ledger aur invoice ke accounting niyam

- **Sawal:** finance ke ledger, chart of accounts, entries aur invoice ke niyam (D-257 niyam 6).
- **CA ki raay:** §3 aur §4 me poora prastaav.
- **Source:** upar ke points; Companies Act aur Rules [K14], [K15].
- **Hamare faisle se mel:** D-001 ("har niyam ki saaf list"), D-093, D-134 **fit**.
- **Prastaav:** §3, §4.
- **Dummy me kya:** §3.

### CA-025. Returns, statements aur reconciliation

- **Sawal:** GST, TCS aur TDS ke statements aur returns ka dhaancha.
- **CA ki raay:** §5 me poora dhaancha. Form numbers (Form 140, Form 131) aur GSTR-3B ka lock sirf secondary ya search ke titles se; filing nahi, sirf L3 jaisa export (D-134).
- **Source:** [K9], [K10], [K12], [K17].
- **Hamare faisle se mel:** D-134 (L3, R2 register aur export) **fit**.
- **Prastaav:** §5.
- **Dummy me kya:** saare exports "SPECIMEN".

### CA-026. Return fee aur delivery fee ki wapsi

- **Sawal:** "man badla" return pe refund se kati return fee (D-114 niyam 2, misaal ₹49), aur delivery fee ki wapsi (D-108 niyam 6, D-110 niyam 3, D-114 niyam 1, D-222 niyam 2) ke tax documents.
- **CA ki raay:**
  1. Return fee platform ki customer ko seva (return pickup), seller ki nahi: platform ka B2C tax invoice. Ye seva bhi ECO ke through bike maal ke liye delivery jaisi hai, to [K1] ki entry (5%, bina ITC) me lagti hai; par "return pickup" ka "delivery services" me aana pakka nahi (Aadha). Rate table me alag row.
  2. Refund = seller ka credit note (lauti line ki value) − platform ki return fee. Ye do alag documents, ek refund.
  3. Delivery fee wapas (galti wala return, der se delivery, customer ka saaf mana, ya pack se pehle poora cancel): platform ka credit note apne delivery fee invoice pe.
- **Source:** [K1]; s.34 [T3].
- **Hamare faisle se mel:** D-114, D-108, D-110, D-222 **fit**; naya row CL-129.
- **Prastaav:** refund ki gaanth: har refund ke andar documents ki list (seller credit note, platform credit note, platform return fee invoice).
- **Dummy me kya:** "SPECIMEN".

### CA-027. Nil rate ka maal: bill of supply

- **Sawal:** CL-001 ke Nil items (kajal, kumkum, bindi, sindur, alta) ka document.
- **CA ki raay:** Nil ya exempt maal pe tax invoice nahi, "bill of supply" (s.31(3)(c)); ek order me taxable aur Nil dono hon to ek "invoice-cum-bill of supply" (rule 46A). Seller ke series niyam waise hi. TCS ki net value "taxable supplies" ki hai, to Nil maal TCS ke aadhaar se bahar; TDS (gross bikri) me andar.
- **Source:** s.31(3)(c) [T3]; rule 46A ka text nahi khola; s.52 [T3].
- **Hamare faisle se mel:** CL-001 aur D-086 **fit**; naya row CL-130.
- **Prastaav:** rate table ki Nil row pe document ka type apne aap.
- **Dummy me kya:** test me ek kajal wala order.

### CA-028. Hamari fees pe seller ka apna TDS

- **Sawal:** seller hamari commission aur fees ka "credit" apne books me karta hai; kya use us pe TDS (purane s.194H ya s.194J jaisa) kaatna hai.
- **CA ki raay:** nahi di. [K8] kehta hai ki jis rakam pe s.194-O laga, us pe doosra TDS nahi; par wo **seller ke invoice** ki rakam ki baat hai, seller ki di hui fees ki nahi. Naye Act me iska saaf jawab nahi mila. Design me jagah: fees invoice pe seller TDS kaate to "TDS receivable (seller se)" aur Form 131 ka milaan.
- **Source:** [K8] (secondary).
- **Hamare faisle se mel:** kisi faisle se takrav nahi.
- **Prastaav:** naya row CL-134; asli business se pehle pakka karna.
- **Dummy me kya:** field khaali.

### CA-029. Company ke books: 8 saal, audit trail, India me roz ka backup

- **Sawal:** finance service hi company ka accounting system hoga; Companies Act ke kya niyam lagte hain.
- **CA ki raay:** (1) books 8 financial years (CA-008); (2) accounting software me audit trail (har badlav ka edit log, tareekh ke saath, band na ho sake), 1 Apr 2023 se (rule 3(1)); (3) electronic books ka backup India ke server pe **roz** (rule 3(5), 2022 ka badlav); (4) books India me har waqt dekhne layak; bahar ke server pe hon to saal ka intimation [K15]. Hamara finance database Singapore me hai (D-057, D-058): asli business pe roz ka India backup chahiye.
- **Source:** [K14] (primary site, saar); [K15] (secondary).
- **Hamare faisle se mel:** D-001 ke finance niyam (audit) **fit**; D-058 ke saath asli business pe takrav: §6.
- **Prastaav:** journal sirf jodne wala (append-only), sudhaar sirf ulti entry se; naya row CL-131; §13 Nazar me row.
- **Dummy me kya:** abhi kuch nahi (dummy books); asli business se pehle backup.

### CA-030. Doosre state se seller ka stock transfer

- **Sawal:** seller ka maal doosre state (jaise factory) se hamare Maharashtra warehouse me aaye (D-036).
- **CA ki raay:** seller ke do states ke GSTIN "distinct persons" hain; ek se doosre ko maal bina paise ke bhi supply hai (Schedule I para 2), to seller ka tax invoice (IGST), aur seema se upar e-way bill. Ye seller ka kaam hai, par maal hamare warehouse me aata hai, to receiving pe document hona chahiye. Maharashtra ke andar ki apni jagah se aaye to delivery challan.
- **Source:** Schedule I [T3]; [K11].
- **Hamare faisle se mel:** D-036, D-096 **fit**; naya row CL-133.
- **Prastaav:** maal aane ki suchna (ASN, D-096) me seller ke invoice ya challan ka number, tareekh, value aur e-way bill number (seema paar ho to); receiving pe staff mila ke dekhe.
- **Dummy me kya:** dummy numbers.

### CA-031. Fees ke invoice ka samay

- **Sawal:** platform ki fees ka tax invoice "har payout ya mahine" (CL-011): kab.
- **CA ki raay:** seva ka invoice aam taur pe seva ke 30 din me (rule 47). Hamari commission har bikri pe banti hai, aur payable 30 din tak (D-221) ruk sakta hai, to "payable hone pe invoice" kabhi 30 din se der kar sakta hai. Behtar: seller agreement me marketplace sevaayein "continuous supply of services" (s.31(5)) ki tarah, aur har payout cycle (hafte) ka ek tax invoice us cycle ki fees ka (us hafte dispatch hui lines ki commission aur fulfilment; storage (mahine ki, D-066) aur disposal jis cycle me lagi). Udhaar wale seller pe bhi invoice usi cycle me, chahe payout na ho.
- **Source:** s.31(5) [T3, 2021 copy]; rule 47 ka text nahi khola.
- **Hamare faisle se mel:** D-078, D-081, CL-011 **fit**; "har payout ya mahine" ki jagah "har payout cycle" (§7(b)).
- **Prastaav:** fees invoice ka number aur payout statement ka number alag; statement pe fees invoice ka hawala.
- **Dummy me kya:** "SPECIMEN".

### CA-032. Prepaid order pe delivery fee ka time of supply

- **Sawal:** delivery fee checkout pe (prepaid) mil jaati hai, delivery baad me; invoice kab.
- **CA ki raay:** maal ke advance pe GST nahi (Notification 66/2017-CT ki chhoot, text nahi khola), to seller ka invoice dispatch pe theek. Par delivery fee **seva** hai: seva ka paisa pehle mile to time of supply paisa milne ka din (s.13). To prepaid order pe delivery fee ka platform ka tax invoice payment capture pe hi ban jaaye (receipt voucher ka alag kaam nahi); delivery pe UPI wale order pe delivery ke pal pe. Cancel ya RTO pe credit note (CA-026).
- **Source:** s.13, s.31 [T3, 2021 copy].
- **Hamare faisle se mel:** D-107, D-110, D-239 niyam 2 (wo maal ka invoice hai) **fit**.
- **Prastaav:** order ke paise ki entry me delivery fee ka hissa alag line, usi pal platform ki income aur GST.
- **Dummy me kya:** "SPECIMEN".

### CA-033. Transporter ke bill pe GTA ya RCM

- **Sawal:** kiraye ke transporter (D-027) ke bill pe GST kaun deta hai.
- **CA ki raay:** nahi di. Transporter consignment note de to wo GTA (Notification 06/2026 ne GTA ki paribhasha badli [K1]) aur body corporate recipient pe aam taur pe reverse charge; consignment note na de to "gaadi kiraye pe driver ke saath" ka alag niyam. Dono ke abhi ke rates aur RCM ki list primary se nahi khule. Ye kharcha delivery seva ka input hai, to ITC ki rok (CA-004) bhi lag sakti hai. Transporter ke bill ki finance entry R2 hai (PROJECT_PLAN §1), to R2 se pehle.
- **Source:** [K1] (GTA ki paribhasha); baaki nahi.
- **Hamare faisle se mel:** D-027 **fit**; naya row CL-135.
- **Prastaav:** transporter record pe "GTA / consignment note deta hai", "forward charge ka option liya" ke fields.
- **Dummy me kya:** dummy transporter.

## 3. Ledger aur accounting ke niyam (prastaav)

Ye platform company (Beautinique Pvt Ltd) ke books ka dhaancha hai, jo finance service (PostgreSQL, D-001) me banta hai. Sellers ke apne books (unka GST, unka income-tax) unke hain; hum unke liye documents aur statements banate hain. Database ka asli design Database Architect ke saath (D-257 kram); yahan sirf accounting ke niyam.

### 3.1 Bunyadi niyam

1. **Double-entry:** har ghatna ek journal: lines ka jod debit = jod credit, commit pe database ki jaanch (deferred constraint ya trigger), code pe bharosa nahi.
2. **Rakam:** hamesha integer paise (₹1 = 100), currency INR; rates basis points me (18% = 1800). Float kabhi nahi.
3. **Sirf jodna (append-only):** journal lines pe update ya delete nahi; galti ka sudhaar ulti entry (reversal) aur nayi entry se, dono me asli ka hawala. Ye Companies (Accounts) Rules ka audit trail bhi hai (CA-029).
4. **Ek ghatna, ek entry:** har journal pe source ka unique key (gateway event id, invoice id, credit note id, payout id); unique index se do baar post hona namumkin (gateway ke webhook dobara aayein to bhi).
5. **Sub-ledgers:** har seller (seller + GSTIN), har partner, har order ka apna hisaab; GL ke control khaate (jaise "Seller payable") ka jod sub-ledgers ke jod ke barabar; raat ki jaanch, farak pe alert.
6. **Tax ka din:** timestamps UTC me (D-259), par GST ka mahina aur financial year document ki **India ki tareekh** (IST) se. Raat 11:30 PM IST ka invoice usi din ka.
7. **Mahine ka close:** band mahine me nayi entry nahi; baad ka sudhaar khule mahine me, purane document ke hawale ke saath. GST return ke baad us mahine ke documents nahi badalte.
8. **Har rakam ka document:** seller ko dikhne wali har line kisi document se judi: invoice, credit note, fees invoice, bharpai ka record, kaat ka case, TDS ya TCS ki kaat.
9. **Sellers ka paisa platform ke kharche me nahi** (§3.5).
10. **Tax ke khaate GSTIN-wise:** platform ka normal GSTIN aur har state ka TCS GSTIN alag; CGST, SGST, IGST alag khaate.

### 3.2 Chart of accounts (saar)

| Code | Khaata                                        | Kism      | Kaam                                                                        |
| ---- | --------------------------------------------- | --------- | --------------------------------------------------------------------------- |
| 1100 | Bank: Operating                               | Asset     | Platform ka apna paisa: kharche, taxes, partners ke payout                  |
| 1110 | Bank: Seller Settlement (D-269)               | Asset     | Gateway ka saara settlement; sellers ka payout; refunds                     |
| 1200 | Gateway receivable                            | Asset     | Captured par settle nahi hua (gateway-wise)                                 |
| 1210 | Gift card issuer receivable (R2)              | Asset     | Gift card se aaya payment (D-249)                                           |
| 1300 | Seller fees receivable (sub-ledger)           | Asset     | Fees invoice ki rakam jo abhi set-off ya chukai nahi; udhaar (D-071) isi me |
| 1310 | Partner receivable                            | Asset     | Vasooli jo kamaai se nahi kati                                              |
| 1320 | Chargeback receivable                         | Asset     | Gateway ne kaata, faisla baaki                                              |
| 1400 | Input GST (CGST, SGST, IGST)                  | Asset     | Platform ke kharchon pe ITC                                                 |
| 1420 | TDS receivable                                | Asset     | Doosron ne hamari aamdani pe kaata (jaise bank; CA-028)                     |
| 2100 | Customer advances (order-wise)                | Liability | Order ka paisa mila, seller ka invoice abhi nahi                            |
| 2200 | Seller payable (sub-ledger: pending, due)     | Liability | Invoice hui bikri ka seller ka hissa                                        |
| 2300 | Customer refunds payable                      | Liability | Refund tay, abhi gaya nahi                                                  |
| 2400 | Output GST (platform ki apni supplies)        | Liability | Fees, delivery fee, return fee                                              |
| 2410 | GST TCS payable (state-wise TCS GSTIN)        | Liability | s.52                                                                        |
| 2420 | TDS payable: e-commerce (s.393, Sl. 8(v))     | Liability | Sellers                                                                     |
| 2430 | TDS payable: contractor (s.393, Sl. 6(i))     | Liability | Partners                                                                    |
| 2440 | GST RCM payable                               | Liability | Jahan laage (CA-033)                                                        |
| 2500 | Partner payable (sub-ledger)                  | Liability | Partner ki kamaai                                                           |
| 2600 | Loyalty points liability (R2)                 | Liability | Pakke points ka provision (CA-002)                                          |
| 2700 | Social security contribution provision        | Liability | Notify hone pe (CA-023)                                                     |
| 4100 | Commission income                             | Income    | D-078                                                                       |
| 4110 | Fulfilment fee income                         | Income    | D-078 (delivery ka hissa §8 Q1)                                             |
| 4120 | Storage fee income                            | Income    | D-066                                                                       |
| 4130 | Disposal fee income                           | Income    | D-062                                                                       |
| 4140 | Return-to-seller charges                      | Income    | Wapsi ka kharcha (D-071, D-112)                                             |
| 4200 | Delivery fee income                           | Income    | D-107                                                                       |
| 4210 | Return fee income                             | Income    | D-114 (CA-026)                                                              |
| 5100 | Delivery partner cost                         | Expense   | D-104                                                                       |
| 5110 | Transport cost (transporter)                  | Expense   | D-027 (R2)                                                                  |
| 5200 | Payment gateway fees                          | Expense   | MDR aur uska GST                                                            |
| 5300 | Promotions: platform-funded offers aur points | Expense   | D-101, D-175, D-177                                                         |
| 5400 | Compensation to sellers                       | Expense   | D-063                                                                       |
| 5410 | Recoveries (contra)                           | Expense   | D-068 (partner, transporter)                                                |
| 5500 | Chargeback losses                             | Expense   | D-095 niyam 2                                                               |
| 5600 | Bad debts                                     | Expense   | Udhaar ka write-off (CA-009)                                                |
| 5700 | ITC not available (delivery)                  | Expense   | CA-004 ki rok                                                               |
| 9000 | Reconciliation suspense                       | Control   | Milaan ka farak; mahine ke close pe zero                                    |

### 3.3 Ghatnaon ki entries

| Ghatna                                            | Debit                                                            | Credit                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Payment capture (prepaid)                         | Gateway receivable (poori rakam)                                 | Customer advances (maal ka hissa); Delivery fee income + Output GST (CA-032) |
| Platform offer ya points ka hissa (R2)            | Promotions (offer) ya Points liability (points)                  | Customer advances (us hisse ki rakam)                                        |
| Gateway settlement                                | Bank: Settlement (net); Gateway fees; Input GST                  | Gateway receivable                                                           |
| Top-up (gateway fees, platform offer, points)     | Bank: Settlement                                                 | Bank: Operating                                                              |
| Dispatch: seller ka invoice                       | Customer advances                                                | Seller payable (pending)                                                     |
| E-commerce TDS (seller ke credit pe)              | Seller payable                                                   | TDS payable: e-commerce                                                      |
| Fees invoice (har payout cycle)                   | Seller fees receivable                                           | Commission / Fulfilment / Storage / Disposal income; Output GST              |
| Mahine ka TCS                                     | Seller payable                                                   | GST TCS payable (CGST + SGST, ya IGST)                                       |
| Return ya RTO: seller ka credit note              | Seller payable (ya Seller fees receivable agar payout ho chuka)  | Customer refunds payable                                                     |
| Return fee (man badla)                            | Customer refunds payable                                         | Return fee income; Output GST                                                |
| Delivery fee ki wapsi: platform ka credit note    | Delivery fee income; Output GST                                  | Customer refunds payable                                                     |
| Refund ka jaana                                   | Customer refunds payable                                         | Gateway receivable ya Bank: Settlement                                       |
| Fees ka credit note (agar §8 Q3 me haan)          | Commission income; Output GST                                    | Seller fees receivable                                                       |
| Payout (set-off ke saath)                         | Seller payable (due)                                             | Seller fees receivable (set-off); Bank: Settlement (net)                     |
| Sweep (platform ka kamaya hissa)                  | Bank: Operating                                                  | Bank: Settlement                                                             |
| Udhaar ki chukai (payment link)                   | Bank: Operating                                                  | Seller fees receivable                                                       |
| Udhaar ka write-off                               | Bad debts                                                        | Seller fees receivable (GST ulta nahi)                                       |
| Bharpai (D-063)                                   | Compensation to sellers                                          | Seller payable (ek net line; GST, TCS, TDS nahi)                             |
| Bharpai wapas (maal mil gaya, D-063 niyam 4)      | Seller payable                                                   | Compensation to sellers                                                      |
| Chargeback: gateway ne kaata                      | Chargeback receivable                                            | Bank: Settlement (aur usi din Operating se top-up)                           |
| Chargeback haara: seller ki galti (D-095 niyam 1) | Seller payable ya Seller fees receivable (seller ka credit note) | Chargeback receivable                                                        |
| Chargeback haara: platform (D-095 niyam 2)        | Chargeback losses                                                | Chargeback receivable (seller ki bikri waisi; credit note nahi)              |
| Partner ki kamaai                                 | Delivery partner cost                                            | Partner payable                                                              |
| Partner TDS                                       | Partner payable                                                  | TDS payable: contractor                                                      |
| Partner se vasooli (D-068)                        | Partner payable                                                  | Recoveries                                                                   |
| Partner payout                                    | Partner payable                                                  | Bank: Operating                                                              |
| Points pakke (R2)                                 | Promotions                                                       | Points liability (andaaze ke saath)                                          |
| Points expire                                     | Points liability                                                 | Promotions (ulta)                                                            |
| Gift card se payment (R2)                         | Gift card issuer receivable                                      | Customer advances                                                            |
| Delivery inputs ka ITC ulatna (mahine)            | ITC not available                                                | Input GST                                                                    |
| GST, TCS, TDS jama                                | Output GST, TCS payable, TDS payable                             | Input GST (set-off); Bank: Operating                                         |

### 3.4 Ek misaal (R1 jaisa, rakam misaal)

Seller S (Maharashtra GSTIN) ka item ₹1,180 (18%: taxable ₹1,000.00, CGST ₹90.00, SGST ₹90.00); delivery fee ₹49 (5%: taxable ₹46.66, CGST ₹1.17, SGST ₹1.17); customer prepaid ₹1,229. Gateway fees 2% + GST = ₹29.00 (₹24.58 + ₹4.42). Commission 10% taxable value pe = ₹100.00, fulfilment ₹25.00, un pe 18% GST ₹22.50 (fulfilment ka delivery hissa §8 Q1 pe tika). TDS 0.1% = ₹1.00. TCS 0.5% = ₹5.00.

1. Capture: Dr Gateway receivable 1,229.00 / Cr Customer advances 1,180.00, Delivery fee income 46.66, Output CGST 1.17, Output SGST 1.17.
2. Settlement: Dr Bank: Settlement 1,200.00, Gateway fees 24.58, Input GST 4.42 / Cr Gateway receivable 1,229.00. Top-up: Dr Bank: Settlement 29.00 / Cr Bank: Operating 29.00. Delivery fee ka sweep: Dr Bank: Operating 49.00 / Cr Bank: Settlement 49.00.
3. Dispatch (seller ka invoice): Dr Customer advances 1,180.00 / Cr Seller payable 1,180.00. TDS: Dr Seller payable 1.00 / Cr TDS payable 1.00.
4. Fees invoice: Dr Seller fees receivable 147.50 / Cr Commission 100.00, Fulfilment 25.00, Output CGST 11.25, Output SGST 11.25.
5. Mahine ka TCS: Dr Seller payable 5.00 / Cr TCS payable CGST 2.50, SGST 2.50.
6. Payout: Dr Seller payable 1,174.00 / Cr Seller fees receivable 147.50, Bank: Settlement 1,026.50.
7. Sweep: Dr Bank: Operating 153.50 / Cr Bank: Settlement 153.50 (fees 147.50 + TCS 5.00 + TDS 1.00). Settlement khaata ab is order pe zero.

Return (man badla, payout se pehle): seller ka credit note ₹1,180; return fee ₹49 (5%); refund ₹1,131. TDS ka ₹1.00 S ki agli bikri ke TDS me usi saal adjust; TCS me us mahine ki net value ₹1,000 kam; fees §8 Q3 se.

### 3.5 Seller settlement khaate ke niyam (D-269)

1. **Aata kya hai:** gateway ke saare settlements (aur R2 me gift card issuer ke).
2. **Jaata kya hai:** sellers ke payouts; refunds (agar gateway settlement se na kaate); platform ke kamaye hisse ka sweep.
3. **Platform ka kamaya hissa:** delivery fee aur return fee (platform ki, usi din sweep); fees, TCS aur TDS (seller ke payable se kat-te hain, payout ke din sweep). Fees ka paisa payout ke set-off se pehle sweep nahi, taaki seller ka paisa uski haan se pehle na nikle.
4. **Top-up usi din:** gateway fees, platform offer aur points ka hissa, aur chargeback ki kati rakam (faisle tak) Operating se Settlement me.
5. **Kabhi nahi:** partners ka payout, transporter, salaries, taxes ya koi platform kharcha Settlement se.
6. **Invariant (roz):** Settlement ka bank balance ≥ Seller payable (pending + due) + Customer advances + Customer refunds payable + (TCS + TDS payable jo sweep nahi hua). Kam ho to alert aur payout rukte hain jab tak farak samjha na jaaye.
7. **Byaaj:** khaata current account (bina byaaj) ho, taaki sellers ke paise pe platform ki kamaai ka sawal na uthe; asli business pe bank ke saath tay.
8. **Dummy:** test mode me dono khaate dummy; bank statement test data se (D-055 ka haath ka "paid").

## 4. Invoice aur notes ke niyam

### 4.1 Kaun kya jaari karta hai

| Document                                       | Jaari karne wala (GSTIN)                   | Kisko            | Kab                                                                                           | Hawala           |
| ---------------------------------------------- | ------------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------- | ---------------- |
| Tax invoice (maal)                             | Seller, platform seller ki taraf se banata | Customer         | Pack ya dispatch scan (D-239)                                                                 | s.31(1), rule 46 |
| Bill of supply / invoice-cum-bill of supply    | Seller                                     | Customer         | Wahi, jab Nil rate maal ho                                                                    | CA-027           |
| Credit note (maal)                             | Seller                                     | Customer         | Return manzoor, RTO hub scan, nuksaan pe refund, chargeback (seller ki galti), baad ki chhoot | s.34, CA-007     |
| Delivery challan (bina keemat replacement, R2) | Seller                                     | Customer         | Replacement ke dispatch pe                                                                    | CA-003           |
| Tax invoice (fees)                             | Platform                                   | Seller (B2B)     | Har payout cycle                                                                              | CA-031           |
| Credit note (fees)                             | Platform                                   | Seller           | Fees ki wapsi (§8 Q3) ya galti                                                                | s.34             |
| Tax invoice (delivery fee)                     | Platform                                   | Customer (B2C)   | Prepaid: capture pe; delivery pe UPI: delivery pe                                             | CA-004, CA-032   |
| Tax invoice (return fee)                       | Platform                                   | Customer (B2C)   | Return ki manzoori pe                                                                         | CA-026           |
| Credit note (delivery fee)                     | Platform                                   | Customer         | Fee ki wapsi pe                                                                               | CA-026           |
| Payout statement (tax document nahi)           | Platform                                   | Seller / partner | Har payout                                                                                    | D-081, D-104     |
| TDS certificate (Form 131)                     | Platform (TAN)                             | Seller / partner | Har quarter (TRACES se)                                                                       | [K9]             |
| TCS ka mahine ka statement (jaankari)          | Platform (TCS GSTIN)                       | Seller           | Har mahine, GSTR-8 ke baad                                                                    | CL-013           |

Unibelle bhi isi table me ek seller hai (D-031). Partners unregistered hain, to un se koi invoice nahi; platform ka payout statement hi record. Gateway aur transporter platform ko apne invoice dete hain.

### 4.2 Numbering

1. **Series:** har jaari karne wale GSTIN, har document type aur har financial year ki apni series. Misaal: seller invoice `S01/2627/000123`, seller credit note `S01C/2627/00045`, seller delivery challan `S01D/2627/0007`; platform fees `PF/2627/000123`, platform delivery fee `PD/2627/000123`, platform credit notes `PFC/...`, `PDC/...`. Seller ka chhota code (S01) platform deta hai.
2. **Format:** zyada se zyada 16 characters; sirf A-Z, 0-9, "/" aur "-"; financial year me unique (rule 46 [T6]; credit note ke liye rule 53, text nahi khola).
3. **Bina gap:** number document banne ke usi database transaction me, series ki counter row ko lock karke (`SELECT ... FOR UPDATE`) diya jaaye; database sequence nahi (rollback pe gap chhodta hai). Number tabhi jab document pakka bane (pack ya dispatch scan); pack se pehle cancel pe number nahi (D-239).
4. **Cancel:** jaari number kabhi delete ya dobara use nahi; "cancelled" mark, wajah ke saath; GSTR-1 ke documents ke saar (Table 13) me ginti. Dispatch ke baad cancel nahi, credit note (D-239).
5. **1 April:** nayi series apne aap; purane saal ka document naye saal me nahi badalta.
6. **Ek se zyada warehouse state (baad me, D-037):** seller ka har state GSTIN alag series.
7. **Reference:** har credit note pe asli invoice ka number aur tareekh; har fees invoice pe payout cycle; har delivery challan pe asli invoice.

### 4.3 Rounding

1. **Line ka hisaab:** daam GST samet (MRP ke niyam). Taxable value = daam × 10000 / (10000 + rate bps), paise tak; CGST aur SGST har ek = taxable value × (rate/2), paise tak, aadha paisa upar. Phir taxable value ko itna sudhaarein ki taxable + CGST + SGST = daam bilkul (±1 paisa ka farak taxable value me jaata hai, tax me nahi). IGST me ek hi tax. Misaal: ₹49 pe 5% = ₹46.66 + ₹1.17 + ₹1.17.
2. **Kai units:** line ka tax line ki kul rakam pe, unit pe nahi (warna paise jud ke farak).
3. **Chhoot ka bantwara:** combo ya baante offer ki chhoot lines me "largest remainder" se, taaki jod bilkul barabar (§9).
4. **Invoice ka round-off:** nahi (daam pehle se poore rupaye); field rahe, value 0.
5. **Return pe:** credit note asli line ki rakam se, dobara hisaab nahi (aadhi quantity pe anupaat, aur aakhri unit pe bacha paisa).
6. **TCS:** seller-wise mahine ki net value pe, paise tak. **TDS:** har credit pe paise tak; din ke ant me seller-wise jod ek row. Jama ki rakam pe portal ke niyam (GST me s.170 ka rupaye tak ka niyam return ke star pe). TDS ki rakam ke rounding ka naya niyam nahi jaancha.

### 4.4 Invoice pe kya (rule 46 ke saath hamare faisle)

Seller ka naam (sabse upar, CL-084), pata, GSTIN; "Sold through Beautinique (e-commerce operator)" aur platform ka GSTIN (CA ki salah, kanoon ka niyam nahi jaancha); invoice number aur tareekh; customer ka state (aur ₹50,000 se upar naam aur pata, D-226); place of supply; har line: description, HSN, batch aur MRP (D-064), quantity, daam, brand ki chhoot, taxable value, rate, CGST/SGST ya IGST; platform offer ki line (CA-001); return ki muddatein (D-221); B2B me customer ka GSTIN (D-092); e-invoice wale seller pe IRN aur QR (CL-004); demo pe "SPECIMEN" (D-145).

## 5. Statements aur reconciliation ka dhaancha

Sab D-134 ke L3 jaisa: register, report, export aur yaad; asli filing nahi (D-026). Har export "SPECIMEN" (D-145). Form numbers aur due dates setting me, kyunki ye badalte hain.

### 5.1 Platform ke returns aur statements

| Kya                                    | Kis GSTIN / TAN          | Kab (abhi ki samajh)                              | Kya jaata hai (hamare data se)                                                                                                        | Source                           |
| -------------------------------------- | ------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| GSTR-1                                 | Platform ka normal GSTIN | Mahine (ya QRMP me quarter)                       | B2B: sellers ko fees invoices; B2C: delivery aur return fee (state-wise); credit notes; HSN/SAC ka saar; documents ka saar (Table 13) | [K12]; rule 59 (text nahi khola) |
| GSTR-3B                                | Wahi                     | Mahine                                            | Output tax (GSTR-1 se aata hai, badla nahi ja sakta; sudhaar GSTR-1A se [K17]); ITC (delivery wala ulta); RCM; net cash               | [K17] (secondary)                |
| GSTR-8 (TCS)                           | Har state ka TCS GSTIN   | Agle mahine ki 10 tak (s.52(4))                   | Seller GSTIN-wise: mahine ki supplies, returns, net value, TCS (CGST, SGST, IGST); pichhle mahinon ke sudhaar                         | s.52 [T3]                        |
| TCS ka saal ka statement               | TCS GSTIN                | 31 December tak (s.52(5)); form ka naam secondary | Saal ka saar                                                                                                                          | s.52 [T3]                        |
| GSTR-9 / 9C                            | Normal GSTIN             | Saal; seema ke hisaab se                          | Saal ka saar aur books se milaan                                                                                                      | Nahi jaancha                     |
| TDS jama                               | TAN                      | Agle mahine ki 7 (March ki 30 April) (Rule 218)   | Seller (Sl. 8(v)) aur partner (Sl. 6(i)) ka TDS alag                                                                                  | [K10] (secondary)                |
| TDS statement (Form 140, pehle 26Q)    | TAN                      | Quarter: 31 Jul, 31 Oct, 31 Jan, 31 May           | Har deductee: PAN, rakam, credit ki tareekh, TDS, section ka code                                                                     | [K9], [K10]                      |
| TDS certificate (Form 131, pehle 16A)  | TAN                      | Statement ki due date ke 15 din me, TRACES se     | Seller aur partner ko                                                                                                                 | [K9] (search)                    |
| Income-tax return, tax audit, accounts | Platform company         | Saal                                              | Books se (8 saal, CA-008); related party ki list (CA-017)                                                                             | Nahi jaancha                     |

### 5.2 Sellers ke liye statements

1. **Payout statement (har hafte):** pichhla balance; is cycle ki bikri (invoice number-wise), returns (credit note-wise), platform offer ka hissa, brand ki chhoot (jaankari), fees (fees invoice ke number ke saath), TCS, TDS (aur adjust hua TDS), bharpai (record id), kaat aur udhaar, payout aur bank ka UTR (dummy). Har line ka document.
2. **Mahine ka settlement saar:** gross invoices, credit notes, net; TCS ki net value aur TCS; TDS; fees aur unka GST (ITC ke liye); bharpai; udhaar.
3. **GSTR-1 ki madad ka export:** seller ke apne GSTR-1 ke liye: B2B invoices, B2C state-wise saar, credit notes, HSN saar, documents ka saar (Table 13), aur Table 14 (ECO ke through supplies, platform ke GSTIN ke saath) [K12]. Seller khud file karta hai; hum sirf data dete hain.
4. **TCS statement (mahine):** jo GSTR-8 me us seller ke liye gaya, taaki seller portal pe credit maan sake aur Table 14 se mila sake; mismatch ki list.
5. **TDS:** mahine ka TDS statement aur quarterly Form 131.
6. **ITC ulatne ki report (mahine):** kho gaye, chori, nasht, toote (D-063, D-062) aur bina shart ke samples (D-229) ke units batch ke saath (CA-007, CL-009).
7. **Fees invoices:** har cycle ka PDF, seller ke warehouse state GSTIN pe.
8. **Udhaar ki yaad:** 150 din se purane bina chukaye fees invoices (seller ka ITC 180 din ka niyam, CA-009).

### 5.3 Partners ke liye

Hafte ka payout statement (har kaam ki rakam, kaat aur wajah, TDS, net, saal ka jod aur TDS ki seema tak kitna baaki); quarterly Form 131.

### 5.4 Reconciliation (milaan)

| #   | Kya milana                                  | Kab             | Kaise                                                                                                                   | Farak pe                                      |
| --- | ------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| M1  | Gateway ↔ ledger                            | Roz             | Har payment id: capture, refund, chargeback ki rakam aur status ledger se; settlement batch = captures − refunds − fees | Suspense (9000) aur finance ka kaam           |
| M2  | Settlement bank ↔ ledger                    | Roz             | Bank ki har line ka matching: settlement batch (UTR), payout, sweep, top-up                                             | Payouts rok                                   |
| M3  | Settlement invariant (§3.5 niyam 6)         | Roz             | Bank balance ≥ sellers ka payable + customer advances + refunds payable + bina sweep TCS/TDS                            | Alert; payouts rok                            |
| M4  | Seller sub-ledger ↔ documents               | Roz             | Seller ka gross = invoices − credit notes + platform offers; fees receivable = fees invoices − set-off − chukai         | Seller ka statement rok                       |
| M5  | GL control ↔ sub-ledgers                    | Raat            | Seller payable, partner payable, customer advances                                                                      | Alert                                         |
| M6  | Platform GSTR-1 ↔ ledger                    | Mahine          | Platform ke invoices aur credit notes ka jod = output GST ke khaate                                                     | Return se pehle sudhaar                       |
| M7  | GSTR-8 ↔ sellers ke invoices ↔ TCS payable  | Mahine          | Seller-wise net value aur TCS; jama challan                                                                             | Sudhaar agle GSTR-8 me                        |
| M8  | Hamara GSTR-8 ↔ seller ka GSTR-1 Table 14   | Mahine          | Seller ka bataya (ya portal ka) data, jahan mile                                                                        | Seller ko notice (tay din)                    |
| M9  | TDS: ledger ↔ challan ↔ Form 140 ↔ Form 131 | Mahine, quarter | Deductee-wise                                                                                                           | Correction statement (2 saal ki muddat [K10]) |
| M10 | Partner payouts ↔ kaam ↔ bank               | Hafte           | Delivery ke records se kamaai                                                                                           | Payout rok                                    |
| M11 | Bharpai ↔ nuksaan ke records                | Mahine          | Har compensation line ka D-063 record                                                                                   | Alert                                         |
| M12 | Stock ↔ invoices                            | Mahine          | Dispatch hui units = invoice lines (replacement challan alag)                                                           | Warehouse aur finance                         |

Mahine ka close tabhi jab M1 se M7 me koi khula farak na ho, ya har farak ka likhit kaaran ho.

## 6. Faislon pe asar

Koi tay faisla CA ne khud nahi badla. Neeche har jagah wajah aur prastaav; jo business ka chunaav hai wo §8 me.

| #   | Faisla                                                                 | Asar                                                                                                                                                                                                                                                                               | Prastaav                                                                                                   |
| --- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | D-078 niyam 2 (fulfilment fee me delivery)                             | **Takrav ka jokhim.** 1 Nov 2026 se maal ECO ke through bike to us ki delivery seva 5% bina ITC [K1]. Fulfilment fee (rakhna, pack, delivery) ek line me ho to poori fee ka rate tay karna mushkil (composite, principal kaun); delivery ka hissa 5% aur us ke inputs ka ITC nahi. | §8 Q1: fee do lines me (handling 18%, delivery 5%) ya ek line. Tab tak rate table me dono rows tayyar.     |
| 2   | D-107, D-239 niyam 3 (delivery fee)                                    | "SAC aur rate CA se" ka jawab: SAC 996813, 1 Nov 2026 se heading 9968 item (iii)(b), 5% bina ITC. Naya kaam: delivery inputs ka ITC ulatna (CA-004). Fee ka invoice prepaid pe capture ke pal (CA-032).                                                                            | D-107 me jod (owner ki haan se); CL-012 badle (§7(b)); naya CL-132.                                        |
| 3   | D-063 niyam 1 (bharpai ka daam)                                        | Spashtikaran chahiye: "selling price" GST samet hai, par bikri pe seller ko GST ke bina value bachti hai; GST samet bharpai seller ko bikri se zyada deti. Saath me "commission aur fees ghata ke" ka matlab sirf rakam ka hisaab: koi fees invoice nahi, ek net line.             | §8 Q2 (GST ke bina ya samet). Ek net line ka niyam D-063 me jod.                                           |
| 4   | D-081 jod, D-239 niyam 4 (TDS ka pal)                                  | Fit. "Return pe ulat" tay: agli bikri (usi seller, usi saal) me adjust; saal badle to nahi; replacement pe nahi [K8]. Seller ka pehla credit = invoice ka pal.                                                                                                                     | D-081 me jod; CL-014 badle.                                                                                |
| 5   | D-101 niyam 1, D-175, D-177 (platform offer, points, goodwill coupon)  | Fit. Platform ka hissa seller ki supply ka teesre paksh ka consideration: seller ki taxable value, TCS aur TDS poore daam pe; invoice pe "Platform offer" ki alag line (CA-001).                                                                                                   | CL-007 aur CL-008 badlein. GSTIN wale orders pe: §8 Q5.                                                    |
| 6   | D-228 niyam 2, D-229 niyam 2 (combo, shart wala gift)                  | Kit ka default (sabse zyada rate) theek. Combo aur shart wale gift ka tareeka business ka chunaav hai (daam kaise dikhe).                                                                                                                                                          | §8 Q4.                                                                                                     |
| 7   | D-122 (replacement, R2)                                                | "Tareeka CA se" tay: bina keemat ka replacement, delivery challan ke saath (Circular 195/07/2023).                                                                                                                                                                                 | D-122 me jod; CL-006 badle.                                                                                |
| 8   | D-225, D-227 (72 mahine, misaal)                                       | Sellers ke invoices ke liye 72 mahine theek; platform ke **apne** books ke liye Companies Act s.128(5) ke 8 financial years chahiye [K14]. Ye "misaal" number hai, faisla nahi badalta.                                                                                            | Retention ki do classes: `platform_books` 8 FY, `seller_tax_docs` 72 mahine; CL-021 badle.                 |
| 9   | D-057, D-058 (finance database Singapore me)                           | **Asli business pe takrav.** Companies (Accounts) Rules rule 3(5): electronic books ka backup India ke server pe roz; rule 3(1): audit trail [K15]. Dummy books pe abhi asar nahi.                                                                                                 | D-256 ki "asli business se pehle region dobara dekhna" wali yaad me ye jod; §13 Nazar me row; naya CL-131. |
| 10  | D-249, CL-022 (gift card)                                              | CL-022 ka "gift card ki bikri liability ki entry" D-249 se pehle ka hai; ab card issuer bechta hai, platform ke books me liability nahi, sirf issuer se receivable.                                                                                                                | CL-022 ka "System me kya chahiye" badle (§7(b)).                                                           |
| 11  | D-114 niyam 2, D-108, D-110, D-222 (return fee, delivery fee ki wapsi) | Docs me kami: return fee platform ki seva hai, us ka B2C invoice aur GST; delivery fee ki wapsi pe platform ka credit note.                                                                                                                                                        | Naya CL-129.                                                                                               |
| 12  | D-095 (chargeback)                                                     | Fit; jod: seller ki galti wale chargeback pe seller ka credit note; platform wale (fraud, delivery) pe credit note nahi, bikri waisi, nuksaan platform ka kharcha. Gateway ki kati rakam usi din Operating se top-up.                                                              | D-095 me jod; CL-109 badle.                                                                                |
| 13  | D-093, D-269 (seller settlement khaata)                                | Fit; niyam §3.5: gateway fees aur platform offer ka top-up, platform ke kharche kabhi Settlement se nahi, roz ka invariant.                                                                                                                                                        | D-269 me jod; CL-108 badle.                                                                                |
| 14  | D-036, D-096 (sellers ki location, ASN)                                | Kami: doosre state se aaya stock seller ki inter-state supply (IGST invoice, e-way bill); receiving pe document.                                                                                                                                                                   | ASN me seller ke invoice ya challan aur e-way bill ka number; naya CL-133.                                 |
| 15  | D-086 (rate table) aur CL-001 ke Nil items                             | Kami: Nil rate maal pe tax invoice nahi, bill of supply; mixed order pe invoice-cum-bill of supply.                                                                                                                                                                                | Rate table ki row pe "document type"; naya CL-130.                                                         |
| 16  | D-104, D-254 niyam 2, D-068 (partner TDS aur kaat)                     | Fit; "CA se pakka" tay: Sl. No. 6(i), 1% ya 2%, seema paar pe poore saal ka catch-up, TDS kaat se pehle ki kamaai pe, vasooli pe GST nahi.                                                                                                                                         | D-254 me jod; CL-113 badle.                                                                                |
| 17  | CL-011 ("har payout ya mahine")                                        | Mahine ka invoice kuch lines pe rule 47 ke 30 din se der kar sakta hai; payable pe invoice bhi.                                                                                                                                                                                    | Har payout cycle ka invoice, continuous supply ke clause ke saath (CA-031); CL-011 badle.                  |
| 18  | D-071, CL-126 (udhaar)                                                 | Fit; jod: fees ka GST invoice pe deya; write-off pe GST wapas nahi; seller ko 180 din ki yaad.                                                                                                                                                                                     | CL-126 badle.                                                                                              |
| 19  | D-031, CL-015 (Unibelle)                                               | Fit; related party ki saal ki list (Companies Act s.188, accounts ka disclosure) asli business pe.                                                                                                                                                                                 | CL-015 badle.                                                                                              |
| 20  | D-041 jod, D-239 niyam 2 (invoice pack ya dispatch pe)                 | Fit. Maal ke advance pe GST nahi, to dispatch pe invoice theek; sirf delivery fee (seva) pe capture ka pal (CA-032).                                                                                                                                                               | Kuch nahi.                                                                                                 |

## 7. COMPLIANCE.md ke liye prastaav

Sab owner ki haan ke baad hi (D-257). Nishaan ki line har row ke "Jaancha ya nahi" me, D-272 jaisi: "**CA ne jaancha (2026-11-20):** ..." ya "**CA ne aadha jaancha (2026-11-20):** ... Baaki: ..." ya "**CA ne nahi jaancha:** ...".

### 7(a) CA ke nishaan

| CL     | Nishaan             | Ek line ki raay                                                                                                                                      |
| ------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| CL-001 | CA ne aadha jaancha | HSN + description ki row aur rates ka dhaancha theek. Baaki: rates ke sources CA ne dobara nahi khole; Nil maal pe bill of supply (CL-130).          |
| CL-002 | CA ne aadha jaancha | Invoice dispatch pe aur maal ke advance pe GST nahi, to naya rate naye invoice se theek. Baaki: s.171 (anti-profiteering) ki abhi ki haalat.         |
| CL-003 | CA ne jaancha       | Dispatch pe invoice, GSTIN aur FY ki series, cancel ka record theek; bina gap ka number database lock se (§4.2).                                     |
| CL-004 | CA ne aadha jaancha | Field aur dummy IRN theek. Baaki: ₹5 crore ki seema sirf secondary.                                                                                  |
| CL-005 | CA ne aadha jaancha | Seller ke GSTIN se, asli invoice ke hawale ke saath theek. Baaki: 30 November ki seema secondary; 1 Nov 2026 ka s.34(1) badlav secondary [K7].       |
| CL-006 | CA ne aadha jaancha | Bina keemat replacement aur delivery challan (Circular 195/07/2023, primary). Baaki: rule 55 ka text.                                                |
| CL-007 | CA ne aadha jaancha | Brand ki chhoot value ghatati; platform ka hissa seller ki value me (teesre paksh ka consideration). Baaki: Circular 251 aur 20/2023 sirf secondary. |
| CL-008 | CA ne aadha jaancha | Chhoot CL-007 jaisi; pakke points ka provision. Baaki: income-tax me provision ki deduction.                                                         |
| CL-009 | CA ne aadha jaancha | Bina shart sample bahar aur ITC ulatne ki report theek. Baaki: Circular 92/11/2019 sirf secondary.                                                   |
| CL-010 | CA ne jaancha       | Kit mixed supply, sabse zyada rate (s.2(74), s.8(b)); combo ka tareeka owner ka chunaav (§8 Q4).                                                     |
| CL-011 | CA ne aadha jaancha | Har payout cycle ka fees invoice (continuous supply). Baaki: fees ka 18% aur rule 47 primary se nahi; fulfilment ka delivery hissa (§8 Q1).          |
| CL-012 | CA ne jaancha       | Platform ka B2C invoice, SAC 996813, 1 Nov 2026 se 5% bina ITC (Notification 06/2026-CT(Rate); gazette ki copy doosri site pe).                      |
| CL-013 | CA ne jaancha       | Net value aur mahine ka TCS theek; platform offer ka hissa net value me; Nil maal bahar.                                                             |
| CL-014 | CA ne aadha jaancha | Credit pe, GST ke bina, return pe agli bikri me adjust. Baaki: s.393 aur Circular 20/2023 sirf secondary; bina PAN ki rate.                          |
| CL-015 | CA ne aadha jaancha | Koi alag raasta nahi, theek. Baaki: rule 28 ka proviso aur Companies Act s.188 text se nahi.                                                         |
| CL-016 | CA ne aadha jaancha | Registration ki jaanch theek; doosre state se stock pe seller ka IGST invoice (CL-133). Baaki: "additional place of business" ka niyam.              |
| CL-017 | CA ne aadha jaancha | Bharpai pe GST, TCS, TDS nahi; ek net line; seller ITC ulate. Baaki: Circular 178/10/2022 sirf Circular 243 ke hawale se; daam ka aadhaar (§8 Q2).   |
| CL-018 | CA ne aadha jaancha | GSTIN aur chetavni theek. Baaki: IGST s.10.                                                                                                          |
| CL-019 | CA ne jaancha       | Har seller ka invoice parcel me; e-way bill har invoice ki value pe (CL-117).                                                                        |
| CL-020 | CA ne aadha jaancha | ₹50,000 ka niyam theek. Baaki: ₹50,000 se kam wala hissa secondary.                                                                                  |
| CL-021 | CA ne aadha jaancha | GST 72 mahine; platform ke books Companies Act ke 8 FY [K14]. Baaki: income-tax ka koi alag niyam nahi mila, naye Act ka text nahi khola.            |
| CL-022 | CA ne jaancha       | Circular 243 primary; D-249 ke baad platform ke books me gift card ki liability nahi, issuer se receivable.                                          |
| CL-023 | CA ne jaancha       | Muft seva pe GST nahi; paid ho to tab SAC aur rate.                                                                                                  |
| CL-024 | CA ne jaancha       | SPECIMEN, galat check digit aur portal pe kabhi nahi: s.122 ka jokhim bahut kam.                                                                     |
| CL-108 | CA ne aadha jaancha | Accounting ka hissa (alag khaata, top-up, sweep, roz ka invariant, §3.5) theek. Baaki: RBI ka hissa Lawyer ka.                                       |
| CL-109 | CA ne aadha jaancha | Refund aur chargeback ki entries aur credit note ka niyam (§3.3). Baaki: s.34 ki 2021 copy.                                                          |
| CL-110 | CA ne aadha jaancha | Gift card issuer ka, platform pe liability nahi; points ka provision. Baaki: income-tax ka hissa.                                                    |
| CL-112 | CA ne nahi jaancha  | Contribution ka "turnover" Rules pe tika, text nahi khula; sirf provision ka khaata prastaavit.                                                      |
| CL-113 | CA ne aadha jaancha | Sl. No. 6(i), 1% ya 2%, ₹30,000 / ₹1,00,000, seema paar pe poore saal ka catch-up, kaat se pehle ki kamaai pe. Baaki: sab secondary.                 |
| CL-117 | CA ne aadha jaancha | Seema har invoice pe, consolidated e-way bill (NACIN guide, primary par purana). Baaki: Maharashtra ka ₹1 lakh secondary.                            |
| CL-126 | CA ne aadha jaancha | Fees ka GST invoice pe deya, write-off pe wapas nahi, seller ka 180 din. Baaki: naye Act me bad debt ka section.                                     |
| CL-128 | CA ne nahi jaancha  | Stamp duty (Maharashtra) ka text nahi khola; asli business se pehle.                                                                                 |

**Ginti:** 32 rows: `CA ne jaancha` 8; `CA ne aadha jaancha` 22; `CA ne nahi jaancha` 2.

### 7(b) Maujooda rows me badlav

- **CL-005, Kanoon ya niyam:** jod: "1 Nov 2026 se s.34(1) me s.15(3)(b) wali baad ki chhoot bhi (Finance Act 2026; registered recipient ka ITC ulatna shart)".
- **CL-006, System me kya chahiye:** "bina keemat replacement: seller ka delivery challan, asli invoice ke hawale ke saath (Circular 195/07/2023); daam badle ya replacement na ho to credit note (aur zaroorat pe naya invoice); data model dono sambhale".
- **CL-007, System me kya chahiye:** "line pe teen rakam (list price, brand ki chhoot, platform ka hissa); brand ki chhoot invoice pe value ghataati; platform ka hissa 'Platform offer' ki line, seller ki taxable value, TCS aur TDS poore daam pe".
- **CL-008, System me kya chahiye:** "chhoot CL-007 jaisi; pakke points pe provision (`loyalty_points_liability`), expire pe ulta; GST se alag".
- **CL-011, System me kya chahiye:** "platform ke GSTIN se har payout cycle ka fees tax invoice (seller agreement me continuous supply), seller ke warehouse state GSTIN pe; har fee ki line, SAC aur rate table se; fulfilment ka delivery hissa (owner ka faisla); payout statement alag document".
- **CL-012, Kanoon ya niyam:** "1 Nov 2026 se heading 9968 item (iii)(b): ECO ke through bike maal ki delivery seva 5% (2.5% CGST + 2.5% SGST), delivery me lage inputs ka ITC nahi (Notification 06/2026-CT(Rate)); s.9(5) (Notification 09/2026-CT(Rate)) sirf jab registration ke liye bound na hone wala supplier ECO ke through de". **System:** "platform ka alag B2C invoice (order pe ek), SAC 996813; rate table me 31.10.2026 tak 18% aur 01.11.2026 se 5% bina ITC; prepaid pe invoice capture pe, delivery pe UPI me delivery pe; delivery inputs ka ITC ulatna (CL-132)".
- **CL-013, System me kya chahiye:** jod: "net value me platform offer aur points ka hissa; Nil maal bahar".
- **CL-014, System me kya chahiye:** "TDS seller ke pehle credit (invoice ka pal) pe, invoice pe alag dikhe GST ke bina; platform offer ka hissa milaa ke; return pe agli bikri (usi seller, usi FY) ke TDS me adjust, saal badle ya replacement ho to nahi; section 's.393(1) Sl. No. 8(v)', rate aur bina PAN ki rate tareekh wali setting me; Form 140 aur Form 131".
- **CL-015, System me kya chahiye:** jod: "related party ki saal ki list (finance report)".
- **CL-016, System me kya chahiye:** jod: "doosre state se aaye stock pe seller ka invoice aur e-way bill (CL-133)".
- **CL-017, System me kya chahiye:** "seller ko har mahine aise units ki report batch ke saath; bharpai payout me ek net 'compensation' line, us pe GST, TCS aur TDS nahi; dispatch ke baad nuksaan pe pehle seller ka credit note; daam ka aadhaar (owner ka faisla)".
- **CL-019, System me kya chahiye:** jod: "e-way bill har invoice ki value pe (CL-117)".
- **CL-021, System me kya chahiye:** "D-225, D-227; retention ki do classes: platform ke books 8 financial years (Companies Act s.128(5)), sellers ke tax documents 72 mahine (s.36); jhagde tak rok".
- **CL-022, System me kya chahiye:** "gift card issuer bechta hai (D-249): platform ke books me liability nahi; checkout pe payment ka tareeka, issuer se receivable; istemaal pe order ka normal invoice, payment method 'gift card'; issuer ke saath commission ho to us pe GST".
- **CL-108, System me kya chahiye:** jod: "Settlement me se sirf sellers ka payout, refunds aur platform ke kamaye hisse ka sweep; gateway fees, platform offer aur chargeback ka usi din top-up; roz ka invariant".
- **CL-109, System me kya chahiye:** jod: "chargeback: seller ki galti pe seller ka credit note; platform wale (fraud, delivery) pe nahi".
- **CL-110, System me kya chahiye:** jod: "points ka provision (CL-008)".
- **CL-113, Kanoon ya niyam:** jod: "saal ki seema paar hone pe us saal ki poori rakam pe TDS; kaat (D-068) se pehle ki kamaai pe; vasooli pe GST nahi".
- **CL-117, Kanoon ya niyam:** "seema har consignment (invoice ya challan) ki value pe, tax samet, gaadi ke jod pe nahi; inter-state ₹50,000, Maharashtra ke andar ₹1,00,000; seema paar wale invoices ka consolidated e-way bill; rule 138E me e-commerce operator bhi e-way bill bana sakta hai". **System:** "manifest me har invoice ki value; state ki seema setting me; seema paar invoice pe number ke bina dispatch nahi; seller agreement me platform ka e-way bill banane ka haq".
- **CL-126, System me kya chahiye:** jod: "fees ka GST invoice pe deya; write-off pe GST wapas nahi; seller ko 150 din purane bina chukaye invoices ki yaad".
- **§13 Nazar, nayi rows:** (1) "Finance ke books ka India me roz ka backup aur audit trail (Companies (Accounts) Rules rule 3)", asli business se pehle, CL-131; (2) "ECO ke business model se juda s.9(5) ka aage ka badlav (57th Council ki salah)", Finance Bill pe, CL-012; (3) "Income-tax Act 2025 ke liye CBDT ke naye circulars (e-commerce TDS)", aane pe, CL-014; (4) "Stamp duty aur e-stamp", asli business se pehle, CL-128.
- **§14.3 clause 10 aur 13, §14.4 clause 9:** CA-015 ki lines.
- **§1.0 sources:** naye sources (yahan [K1] se [K17]) COMPLIANCE ke apne naye ids se jodne honge (jaise §1.0 me [T11] se aage, aur §9, §10 me jahan row hai); COMPLIANCE me is report ka koi zikr ya link nahi (naye docs ka niyam).
- **File ke upar status aur "Is file me kya aayega":** "CA ne abhi kuch nahi" ki jagah "CA ne 32 rows dekhin (D-xxx)".

### 7(c) Nayi rows

#### CL-129. Return fee aur delivery fee ki wapsi

- **Kanoon ya niyam:** return fee platform ki customer ko seva hai: tax invoice (s.31); ECO ke through bike maal ki delivery jaisi seva 1 Nov 2026 se 5% bina ITC (Notification 06/2026-CT(Rate)); fee ki wapsi pe credit note (s.34).
- **Kis pe laagu:** "man badla" return (D-114), delivery fee ki wapsi (D-108, D-110, D-114, D-222).
- **Kis module me:** returns, finance.
- **System me kya chahiye:** return fee ka platform ka B2C invoice; refund = seller ka credit note − platform ki return fee; delivery fee wapas ho to platform ka credit note; refund ke saath documents ki list.
- **Dummy kya hai:** documents "SPECIMEN".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [K1]; "return pickup" ka "delivery services" me aana pakka nahi.

#### CL-130. Nil rate ka maal: bill of supply

- **Kanoon ya niyam:** Nil ya exempt maal pe tax invoice nahi, bill of supply (s.31(3)(c)); taxable aur Nil saath ho to invoice-cum-bill of supply (rule 46A).
- **Kis pe laagu:** kajal, kumkum, bindi, sindur, alta jaise Nil items (CL-001).
- **Kis module me:** orders (invoice), finance.
- **System me kya chahiye:** rate table ki row pe document ka type; seller ki series wahi; TCS ki net value me Nil maal nahi.
- **Dummy kya hai:** test me ek kajal wala order.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): s.31 [T3]; rule 46A ka text nahi khola.

#### CL-131. Company ke books: samay, audit trail, India me backup

- **Kanoon ya niyam:** Companies Act s.128(5): books aur vouchers kam se kam pichhle 8 financial years; Companies (Accounts) Rules rule 3(1): accounting software me audit trail (edit log, band na ho sake), 1 Apr 2023 se; rule 3(5): electronic books ka backup India ke server pe roz (2022 ka badlav).
- **Kis pe laagu:** platform company aur Unibelle ki company (apne books jahan hamara system ho).
- **Kis module me:** finance, architecture (backup).
- **System me kya chahiye:** journal append-only, har badlav ka log; retention 8 FY; asli business se pehle India me roz ka backup (D-058 ki yaad me jod).
- **Dummy kya hai:** dummy books; India backup asli business pe.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [K14] (MCA site, saar), [K15] (secondary).

#### CL-132. Delivery seva pe ITC ki rok

- **Kanoon ya niyam:** 5% wali delivery seva (heading 9968 item (iii)) ki shart: delivery me lage inputs aur input services ka ITC nahi (Notification 06/2026-CT(Rate), Explanation (iv)); saajhe inputs me hissa ulatna.
- **Kis pe laagu:** platform (delivery fee, return fee, fulfilment ka delivery hissa).
- **Kis module me:** finance.
- **System me kya chahiye:** har kharche pe cost centre (delivery, warehouse, saajha); delivery wale ka ITC nahi; saajhe ka mahine me anupaat se ulatna; khaata "ITC not available".
- **Dummy kya hai:** test kharche.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [K1]; Explanation (iv) aur rules 42, 43 ka text nahi khola.

#### CL-133. Seller ka inbound maal: invoice, challan, e-way bill

- **Kanoon ya niyam:** seller ke doosre state ke GSTIN se hamare warehouse state ke GSTIN ko maal distinct persons ke beech supply (Schedule I para 2): tax invoice (IGST) aur seema se upar e-way bill; usi state ki jagah se aaye to delivery challan.
- **Kis pe laagu:** har seller ka inbound (D-036, D-096).
- **Kis module me:** warehouse (receiving), seller app.
- **System me kya chahiye:** ASN me seller ke invoice ya challan ka number, tareekh, value aur e-way bill number (seema paar ho to); receiving pe staff milaaye.
- **Dummy kya hai:** dummy numbers.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): Schedule I [T3]; [K11].

#### CL-134. Hamari fees pe seller ka TDS

- **Kanoon ya niyam:** seller hamari commission aur fees ko apne books me credit karta hai; us pe seller ko TDS kaatna hai ya nahi (purane s.194H ya s.194J jaisa), naye Act me saaf nahi mila; e-commerce TDS wali rakam pe doosra TDS nahi (Circular 20/2023, purana Act).
- **Kis pe laagu:** har seller, platform.
- **Kis module me:** finance.
- **System me kya chahiye:** fees invoice pe "seller ne TDS kaata" ka field; platform ke "TDS receivable" aur seller ke Form 131 ka milaan.
- **Dummy kya hai:** field khaali.
- **Jaancha ya nahi:** Jaancha nahi: [K8] (secondary) sirf doosre sawal pe.

#### CL-135. Transporter ka bill: GTA aur RCM

- **Kanoon ya niyam:** consignment note dene wala transporter GTA hai (paribhasha 1 Nov 2026 se badli, Notification 06/2026-CT(Rate)); GTA aur gaadi kiraye ki sevaon pe forward ya reverse charge ka niyam aur rate nahi khole.
- **Kis pe laagu:** platform (D-027, R2).
- **Kis module me:** finance.
- **System me kya chahiye:** transporter record pe "GTA / consignment note", "forward charge ka option"; RCM ka khaata; ITC ki rok (CL-132) ke saath.
- **Dummy kya hai:** dummy transporter.
- **Jaancha ya nahi:** Jaancha nahi: sirf GTA ki paribhasha [K1].

#### CL-136. Platform ke tax returns aur statements

- **Kanoon ya niyam:** GST: GSTR-1, GSTR-3B (GSTR-1 se aayi liability badli nahi ja sakti, sudhaar GSTR-1A se), GSTR-8 (agle mahine ki 10), TCS ka saal ka statement (31 December); income-tax: TDS jama agle mahine ki 7 (Rule 218, Income-tax Rules 2026), quarterly Form 140, Form 131 certificate, correction ki muddat 2 saal (s.397(3)(f)).
- **Kis pe laagu:** platform.
- **Kis module me:** finance.
- **System me kya chahiye:** har return aur statement ka export (L3, R2; D-134); sellers aur partners ke statements; roz aur mahine ka milaan (gateway, settlement bank, sub-ledgers, GSTR-1, GSTR-8, TDS); due dates aur form numbers setting me, yaad.
- **Dummy kya hai:** sab exports "SPECIMEN"; koi filing nahi (D-026).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): s.52 [T3]; [K9] (titles), [K10], [K12], [K17].

## 8. Owner ke sawal

Sirf business ke chunaav; tax ka tareeka upar tay hai. Ye paanchon ek doosre pe tike nahi, to saath me.

### Q1. Fulfilment fee: ek line ya do hisse

- **Kyun zaroori:** 1 Nov 2026 se ECO ke through bike maal ki delivery seva 5% bina ITC hai [K1]. D-078 ki fulfilment fee me rakhna, pack aur delivery teeno hain; ek line me poori fee ka rate tay karna mushkil, aur delivery ke inputs ka ITC rukta hai.
- **Vikalp:** (a) fee do lines me: "handling (pick aur pack)" 18% aur "delivery" 5% bina ITC, dono per unit, jod wahi (misaal ₹25); (b) ek line, poori fee 18%, delivery ko handling ka hissa maan ke; (c) ek line, poori fee 5% bina ITC, delivery ko mukhya maan ke.
- **Salah:** (a).
- **Trade-off:** (a) rate table me do rows aur seller ke invoice pe do lines, par har hissa apne sahi rate pe aur jhagda kam. (b) saral, par delivery ka hissa galat rate pe hone ka jokhim. (c) saral, par warehouse aur packing ke inputs ka ITC bhi ruk sakta hai, jo platform ka bada kharcha hai.

### Q2. D-063 ki bharpai: GST ke bina value pe ya GST samet

- **Kyun zaroori:** D-063 ka "selling price" GST samet hai. Bikne pe seller ko GST ke bina wali value bachti hai (GST sarkar ko jaata hai); kho gaye maal pe seller ka output GST nahi lagta, to GST samet bharpai seller ko bikri se zyada deti hai.
- **Vikalp:** (a) GST ke bina wali value − fees; (b) GST samet daam − fees; (c) (a) + seller ke ITC ulatne ka andaaza (jaise value ka tay %).
- **Salah:** (a).
- **Trade-off:** (a) "bikne jitna" ke sabse kareeb aur hamara kharcha kam; seller ka apna ITC ulatna (s.17(5)(h)) uska nuksaan rehta hai. (b) seller ke liye achha, par 18% wale item pe bikri se lagbhag 18% zyada. (c) sabse barabar, par andaaza aur us ki jaanch ka kaam.

### Q3. Return pe platform ki fees

- **Kyun zaroori:** D-078 me ye tay nahi ki lauti line pe commission aur fulfilment fee wapas hoti hai ya nahi; fees invoice, credit note aur seller ka statement isi pe tike.
- **Vikalp:** (a) commission wapas, fulfilment fee nahi (kaam ho chuka); (b) dono wapas; (c) koi wapas nahi; (d) wajah ke hisaab se (D-112 jaisa): hamari galti pe dono wapas; brand ki galti pe koi nahi; man badla aur der se delivery pe commission wapas, fulfilment nahi.
- **Salah:** (d).
- **Trade-off:** (d) niyam me teen raaste, par return ki wajah pehle se record hoti hai (D-112) aur nuksaan usi pe jiski galti. (a) saral, par hamari galti pe seller fulfilment ka paisa deta hai. (b) platform ka kharcha zyada. (c) bina bikri ke commission, seller ke liye kadwa.

### Q4. Combo aur shart wala gift ka invoice

- **Kyun zaroori:** D-228 aur D-229 ne ise R2 se pehle CA aur owner pe chhoda. Farak tab padta hai jab cheezon ke rates alag hon (jaise 5% shampoo + 18% conditioner).
- **Vikalp:** (a) ek daam = mixed supply: poore combo pe sabse zyada rate; (b) har cheez apne daam pe (jo alag se bhi site pe bikti ho), combo ki chhoot har line pe anupaat me, har line apne rate pe.
- **Salah:** (b), is shart ke saath ki har cheez alag se bhi bikti ho aur invoice pe har line ka daam aur chhoot dikhe.
- **Trade-off:** (a) saral aur sabse kam jhagda, par kam rate wali cheez pe zyada tax (customer ya brand pe). (b) kam tax aur D-088 ke return niyam (ek cheez ka refund) se mel, par "ek daam" ka tark vibhag uthaye to farak ka jokhim.

### Q5. GSTIN wale orders pe platform ke offers aur points

- **Kyun zaroori:** platform ka hissa seller ki value me judta hai (CA-001), to business customer ke invoice pe poore daam ka GST aata hai, jabki usne kam diya; us ke ITC (s.16(2) ka "recipient ne paisa diya" wala niyam) pe sawal uth sakta hai.
- **Vikalp:** (a) GSTIN wale orders pe platform ke offers aur points nahi, sirf brand ke offers; (b) chalein, invoice pe "Platform offer" ki saaf line ke saath.
- **Salah:** (a).
- **Trade-off:** (a) business customers ko platform ke offers nahi milte. (b) offers sab ko, par business customer ke ITC pe jhagde ka jokhim.

## 9. Pehle ke kaam se lene layak (D-074)

Pehle ke kaam ko sirf input ki tarah dekha: `docs-old/discovery/LEGAL_REVIEW.md` §2, `docs-old/discovery/LAWYER_REVIEW.md` §6, `docs-old/discovery/REPOSITORY_ANALYSIS.md` ki finance wali lines, aur purane `packages-old/shared/utils/src/money.ts` ke exports ke naam (Grep; poora code nahi padha). Kasauti: (1) asli zaroorat, (2) tay faisle se takrav nahi, (3) naye shabdon me likhi ja sake. Naya code naye doc se banega, copy nahi (D-074 niyam 4).

**Lene layak:**

| Cheez                                                                                              | (1) Zaroorat                                              | (2) Takrav nahi         | (3) Naya likhna | Kahan                                               |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- | --------------- | --------------------------------------------------- |
| Paise ka model: integer paise, rates basis points, GST samet daam se taxable value                 | §3.1 niyam 2, §4.3                                        | Haan                    | Haan            | Finance ke data niyam (Database Architect ke saath) |
| Rakam ka bantwara "largest remainder" se (jod bilkul barabar)                                      | §4.3 niyam 3 (combo, baante offers, aadhi return)         | Haan                    | Haan            | Finance aur checkout                                |
| GSTIN aur PAN ka format aur check digit ka validator                                               | D-092 (format check), CL-024 (dummy ka galat check digit) | Haan                    | Haan            | Seller onboarding, checkout, demo                   |
| Audit records ko database role se badalne se rokna                                                 | §3.1 niyam 3, CL-131 (audit trail)                        | Haan (D-001 PostgreSQL) | Haan            | Finance                                             |
| LEGAL_REVIEW L-003 ki series ki misaal aur L-013 ki "do ghadiyan" (TCS mahine pe, payout hafte pe) | §4.2, CA-005, CA-031                                      | Haan                    | Haan            | Pehle se CL-003, CL-013 me                          |

**Nahi lene:**

| Cheez                                                         | Kyun nahi                                                                     |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| MongoDB pe ledger, invoice counter aur transactions ka design | D-001: finance PostgreSQL pe tay.                                             |
| Purane docs ka settlement aur ledger ka flow                  | Sirf shabdon me tha (chart of accounts, period close nahi); naya dhaancha §3. |
| LEGAL_REVIEW L-012 ka "local delivery 18%"                    | 1 Nov 2026 se purana (CA-004).                                                |

## Change log

| Version | Date       | Badlav                                                                                      |
| ------- | ---------- | ------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-20 | Pehla version: CA (AI) ki report (D-257); mapping, tax points, ledger, invoice, statements. |
