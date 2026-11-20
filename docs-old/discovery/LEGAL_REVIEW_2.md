# LEGAL REVIEW: Beautinique (R-004, run 2)

> **Status:** v1.0.0 (2026-11-20). Kanooni jaanch (R-004), run 2: personal data, IT Act, CERT-In, RBI, gig workers, warehouse aur transport, AYUSH, IP aur baaki. Lawyer se jaancha nahi.

## 0. Kaise padhein

- Ye Agent 4 (India Legal and Regulatory Checker) ki report hai, doosra run. **Ye legal advice nahi hai**, aur Claude lawyer nahi hai.
- **"Jaancha"** ka matlab sirf itna: point ko ek public source se milaaya jo is run me sach me khola gaya (URL aur tareekh ke saath). Lawyer ne kuch bhi verify nahi kiya; R-004 har point pe khula rehta hai.
- **Status values:**
  - `Jaancha`: primary source (sarkari site, gazette, RBI, CERT-In, UIDAI jaisa) khol ke milaaya. Jahan sarkari document ka poora text (gazette number ke saath) kisi aur site pe khula, use "primary document, secondary host" likha hai aur `Jaancha` gina hai.
  - `Aadha jaancha`: source khola par poora point nahi mila; ya sirf secondary source (law firm, news) mila; ya kanoon ko hamare maamle pe lagana vyakhya (interpretation) ka sawal hai.
  - `Jaancha nahi`: source khul nahi paaya ya is run me samay nahi bacha.
- Har source ke saath **primary** ya **secondary** likha hai. Sab sources 2026-11-20 ko khole.
- Kai sarkari sites is run me fetch nahi huin: meity.gov.in aur digitalindia.gov.in (403), indiacode.nic.in (403), egazette.gov.in (TLS certificate ki galti). Certificate ya block ko bypass nahi kiya; doosri sarkari ya secondary copy li.
- Kanoon badalte rehte hain (DPDP ke niyam 2025 me aaye aur 2027 tak kram se laagu ho rahe hain; RBI ki directions 2025 me nayi bani). Har baat "jitna padha, us din tak" ki hai. Haal me badle hisson pe **(naya)** ka nishaan.
- Tay faisle (D-001 se D-247) yahan dobara nahi khulte. Kanoon se takrav ya kami dikhe to sirf §10 me, wajah aur prastaavit sudhaar ke saath; faisla owner ka.
- Sab registrations, numbers aur payments dummy / test mode (D-026). Har point pe "Dummy me kya" batata hai ki ise dummy values se kaise dikhayein. **Kisi bhi drill ya demo me asli sarkari sanstha (CERT-In, Data Protection Board, RBI, labour portal) ko nakli report kabhi nahi bheji jaati.**
- Ye report purane kaam ke paths le sakti hai (ye naya doc nahi). §11 ka prastaav naye docs ke liye hai, isliye usme purane kaam ka zikr nahi.
- Pehle run ke areas (tax, Legal Metrology, cosmetics kanoon, e-commerce aur consumer kanoon) yahan dobara nahi jaanche; jahan run 2 ka point unse judta hai, wahan sirf CL-xxx ka hawala.

## 1. Mapping

**Kahan se ke chhote roop:** D-xxx = [DECISIONS.md](../../docs/DECISIONS.md) ka record (OPEN_QUESTIONS me wahi baat dobara hai to alag nahi gini); BDA = BUSINESS_DOMAIN_ANALYSIS.md; BDA2 = BUSINESS_DOMAIN_ANALYSIS_2.md; Sec = SECURITY_ANALYSIS.md; SR = security/SECURITY_REQUIREMENTS.md; "scope" = is run ke kaam me naam se diya gaya vishay. Sab points R-004 ke andar.

**Ginti:** kul **41** points: pehle run ki mapping ke **33** (L-100 se L-132, wahi ids) aur **8 naye** (L-133 se L-140).

| Area | Vishay                               | Jaancha | Aadha jaancha | Jaancha nahi | Kul |
| ---- | ------------------------------------ | ------- | ------------- | ------------ | --- |
| E    | Personal data                        | 12      | 5             | 0            | 17  |
| F    | IT Act aur intermediary niyam        | 0       | 1             | 0            | 1   |
| G    | CERT-In aur data ki jagah            | 1       | 1             | 0            | 2   |
| H    | RBI aur payments                     | 2       | 2             | 0            | 4   |
| I    | Gig delivery partners                | 1       | 2             | 0            | 3   |
| J    | Warehouse, transport aur environment | 1       | 4             | 1            | 6   |
| K    | Health aur AYUSH                     | 1       | 2             | 0            | 3   |
| L    | IP, contracts aur baaki              | 0       | 3             | 2            | 5   |
|      | **Kul**                              | **18**  | **20**        | **3**        | 41  |

**"Kanooni detail jaanchi nahi" ki jaanch:** DECISIONS me ye shabd ab 114 lines me (pehle run ke waqt 86), OPEN_QUESTIONS me 88. Naye lines D-220 se D-247 ki hain (D-241 chhod ke); unme se run 2 wale hisse: D-225 aur D-227 (L-103), D-226 (L-108), D-237 (L-134), D-242 aur D-243 (L-133, naya), D-246 (L-125, L-127), D-247 (L-109, L-114, L-126). Baaki naye lines pehle run ke areas (tax, Legal Metrology, cosmetics, e-commerce) ki hain, jo pehle run me ho chuke. OPEN_QUESTIONS ke Q-170 se Q-185 inhi faislon ke sawal hain; alag koi naya kanooni point nahi mila. Scope ke vishay jo kisi faisle me nahi the, naye points bane: bachche (L-135), SDF (L-136), s.43A aur SPDI (L-137), processors (L-138), e-waste (L-139), click-wrap (L-140).

| Id    | Kahan se                                                                                             | Point                                                       | Area | Status        |
| ----- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---- | ------------- |
| L-100 | D-069; D-072; D-106; D-133; D-141; D-155; D-157; D-169; D-191; D-192; BDA2 §7.3 #8, #14; Sec §11 #19 | Personal data ki consent aur notice (Consent Manager samet) | E    | Jaancha       |
| L-101 | D-025; D-130; D-159; D-165; D-207; D-208; SR-067                                                     | Sehat ke paas ka data                                       | E    | Jaancha       |
| L-102 | D-151; BDA2 §7.3 #15                                                                                 | Data ke haq aur jawab ka samay                              | E    | Jaancha       |
| L-103 | D-193; D-194; D-216; D-218; D-225; D-227; Sec §11 #20                                                | Data rakhne aur delete ka samay, backups                    | E    | Aadha jaancha |
| L-104 | D-198; Sec §11 #17                                                                                   | Data leak pe users aur Board ko suchna                      | E    | Jaancha       |
| L-105 | D-216; SR-064; Sec §11 #21                                                                           | KYC me Aadhaar                                              | E    | Jaancha       |
| L-106 | D-201                                                                                                | Staff ki personal data tak pahunch                          | E    | Jaancha       |
| L-107 | D-203; D-156; D-176; Sec §11 #23                                                                     | Device ki pehchaan, accounts ka jod                         | E    | Aadha jaancha |
| L-108 | D-143; D-166; D-167; D-226                                                                           | Seller ko data, review ke saath data, sujhaav               | E    | Jaancha       |
| L-109 | D-136; D-146; D-163; D-247; BDA2 §7.3 #3                                                             | User content, takedown, IT Rules                            | F    | Aadha jaancha |
| L-110 | D-194; D-218; Sec §11 #18                                                                            | CERT-In: logs, incident report, clock                       | G    | Jaancha       |
| L-111 | D-058; Sec §11 #22; BDA2 §7.3 #19                                                                    | Data ki jagah (payment, personal, logs), Singapore hosting  | G    | Aadha jaancha |
| L-112 | D-093; D-081; BDA §8.2 #12                                                                           | Payment aggregator, sellers ka paisa, settlement            | H    | Aadha jaancha |
| L-113 | D-111; D-191; BDA §8.2 #12                                                                           | Failed transaction aur refund ka TAT, chargeback            | H    | Jaancha       |
| L-114 | D-173; D-174; D-177; D-179; D-219; D-247; BDA2 §7.3 #9                                               | Points, promo credit, wallet, gift cards: PPI (L-092 samet) | H    | Aadha jaancha |
| L-115 | D-178; BDA2 §7.3 #10                                                                                 | Recurring payment mandate                                   | H    | Jaancha       |
| L-116 | D-033; D-068; D-103; D-104; D-134                                                                    | Gig partners: Social Security Code, contribution, state     | I    | Aadha jaancha |
| L-117 | D-104                                                                                                | Partner payouts pe TDS                                      | I    | Aadha jaancha |
| L-118 | D-072; D-191; Sec §11 #24                                                                            | Partner ki location aur photo                               | I    | Jaancha       |
| L-119 | BDA §8.2 #14; D-134                                                                                  | Jalne wala maal: rakhna, le jaana, fire NOC                 | J    | Aadha jaancha |
| L-120 | D-134                                                                                                | Shops & Establishments                                      | J    | Aadha jaancha |
| L-121 | D-027; D-077; D-134; BDA2 §7.3 #17                                                                   | E-way bill                                                  | J    | Aadha jaancha |
| L-122 | D-045; D-134; BDA2 §7.3 #18                                                                          | Plastic EPR ka data                                         | J    | Jaancha       |
| L-123 | D-062; D-063                                                                                         | Cosmetics nasht karne ke niyam                              | J    | Aadha jaancha |
| L-124 | D-025; D-172; D-134; BDA2 §7.3 #11                                                                   | Online dermatologist consultation                           | K    | Aadha jaancha |
| L-125 | D-128; D-246                                                                                         | AYUSH licence ki detail                                     | K    | Aadha jaancha |
| L-126 | D-075; D-247                                                                                         | Brand authorisation, trademark, nakli maal                  | L    | Aadha jaancha |
| L-127 | D-074; D-132; D-246                                                                                  | Assets, CosIng aur BIS text ka license                      | L    | Aadha jaancha |
| L-128 | D-071                                                                                                | Seller pe udhaar ki vasooli                                 | L    | Jaancha nahi  |
| L-129 | D-133                                                                                                | Demo site pe anjaan logon ka data                           | E    | Jaancha       |
| L-130 | D-137; D-146                                                                                         | Drugs and Magic Remedies Act (ilaaj ke daawe)               | K    | Jaancha       |
| L-131 | D-150; D-218                                                                                         | Privacy policy aur user agreement                           | E    | Jaancha       |
| L-132 | D-141; BDA2 §7.3 #14                                                                                 | Marketing khabron ki consent aur band karna                 | E    | Jaancha       |
| L-133 | D-242; D-243 (naya)                                                                                  | "Unibelle" ka trademark aur company ka naam                 | L    | Jaancha nahi  |
| L-134 | D-163; D-237; D-241 (naya)                                                                           | Sampark wala insaan (DPDP rule 9) aur grievance ka mel      | E    | Jaancha       |
| L-135 | D-038; scope (naya)                                                                                  | Bachchon ka data aur 18+ ki ghoshna                         | E    | Aadha jaancha |
| L-136 | scope; D-058 (naya)                                                                                  | Significant Data Fiduciary                                  | E    | Aadha jaancha |
| L-137 | scope; D-165; SR-013; SR-063 (naya)                                                                  | IT Act s.43A aur SPDI Rules, DPDP ke aane tak               | E    | Aadha jaancha |
| L-138 | scope; D-011; D-056; D-057; D-058 (naya)                                                             | Data Processors ke saath contract                           | E    | Jaancha       |
| L-139 | scope; D-029 (naya)                                                                                  | E-waste                                                     | J    | Jaancha nahi  |
| L-140 | scope; D-038; D-150 (naya)                                                                           | Click-wrap aur electronic contract                          | L    | Aadha jaancha |

## 2. E: Personal data (DPDP Act 2023, DPDP Rules 2025, IT Act s.43A)

**Is area ke sources (sab 2026-11-20 ko khole):**

- **[S-E1]** Digital Personal Data Protection Act 2023 (Act 22 of 2023), Gazette of India Extraordinary Part II Sec. 1, No. 25, 11 Aug 2023; gazette ki copy TRAI ki site pe: <https://www.trai.gov.in/sites/default/files/2024-09/DPDT_11082024.pdf>. Primary (sarkari site pe gazette ki copy).
- **[S-E2]** Digital Personal Data Protection Rules 2025, G.S.R. 846(E), 13 Nov 2025, gazette ka text: <https://dpdpa.com/DPDP_Rules_2025_English_only.pdf>. Primary document, secondary host (meity.gov.in ne 403 diya).
- **[S-E3]** PIB ka explainer "DPDP Rules, 2025 Notified" (17 Nov 2025): <https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf>. Primary (sarkari saar).
- **[S-E4]** Act ke laagu hone ki tareekhein, G.S.R. 843(E), 13 Nov 2025, ka saar: <https://www.teamleaseregtech.com/updates/article/49364/meity-issued-a-notification-regarding-the-commencement-of-the-dpdp-act/>. Secondary (gazette nahi khula).
- **[S-E5]** Feb 2026 ka prastaav (samay-seema 18 se 12 mahine, rule 8(3) jaldi): <https://ssrana.in/articles/meity-plans-to-cut-short-dpdp-compliance-timeline-and-notify-cross-border-restrictions-for-sdfs/>. Secondary; sirf prastaav, notify hone ka saboot is run me nahi mila.
- **[S-E6]** DPDP Removal of Difficulties Order 2026 (5 Oct 2026; s.9(1) aur s.10(2)(c)(ii) me shabdon ka sudhaar): <https://www.scconline.com/blog/post/2026/10/15/dpdp-removal-of-difficulties-order-2026/>. Secondary. **(naya)**
- **[S-E7]** IT (Reasonable security practices and procedures and sensitive personal data or information) Rules 2011, G.S.R. 313(E), 11 Apr 2011, WIPO Lex ki copy: <https://www.wipo.int/wipolex/edocs/lexdocs/laws/en/in/in098en.pdf>. Primary document, secondary host.
- **[S-E8]** Aadhaar (Sharing of Information) Regulations 2016, "Updated as on 21.08.2025", uidai.gov.in: <https://www.uidai.gov.in/images/The_Aadhaar_Sharing_of_information_regulation_2016.pdf>. Primary.

**Kab se laagu (sabse zaroori baat):** DPDP Rules ke rule 1, 2, 17 se 21 13 Nov 2025 se; rule 4 (Consent Manager) ek saal baad, yaani 13 Nov 2026 se (abhi laagu); rule 3, 5 se 16, 22, 23 (notice, security, breach, retention, rights, bachche) 18 mahine baad, yaani lagbhag 13 May 2027 se [S-E2, rule 1]. Act ke s.3 se s.17 (asli zimmedariyan) aur s.44(2) (IT Act s.43A ka hatna) bhi 18 mahine baad [S-E4, secondary]. Feb 2026 me in samay-seemaon ko chhota karne ka prastaav aaya tha [S-E5]; notify hua ya nahi, is run me nahi mila. Tab tak IT Act s.43A aur SPDI Rules 2011 laagu (L-137). Design abhi se DPDP ke hisaab se.

**Jurmana (Schedule, [S-E1]; [S-E3]):** security safeguards me chook pe ₹250 crore tak; breach ki suchna na dena aur bachchon wali zimmedari me chook pe ₹200 crore tak; baaki pe ₹50 crore tak.

### L-100. Personal data ki consent aur notice (Consent Manager samet)

- **Kya jaanchna tha:** photos, location, dastavez, marketing, tracking jaise kaamon ke liye consent aur notice kaisa ho; Consent Manager zaroori hai ya nahi.
- **Kanoon kya kehta hai:** consent free, specific, informed, unconditional aur saaf affirmative action se; sirf utna data jitna us maqsad ke liye zaroori (s.6(1)). Consent maangne se pehle ya saath me notice: kaunsa data, kis maqsad se, haq kaise chalein, Board ko shikayat kaise (s.5(1)). Rule 3: notice baaki jaankari se alag samajh aaye; data ki **itemised** list; har maqsad aur us se judi seva ka khaas vivaran; consent waapas lene, haq chalane aur Board ko shikayat ka link ya raasta. Consent waapas lena utna hi aasaan jitna dena (s.6(4)); waapas lene pe processing (processors samet) band, jab tak koi kanoon na maange (s.6(6)). Jhagde me notice aur consent ka saboot Data Fiduciary ko dena hai (s.6(10)). Consent ke bina bhi processing ho sakti hai jab customer ne kisi khaas maqsad ke liye data khud diya aur mana nahi kiya (s.7(a), "legitimate use"), aur kanoon ke paalan ya court order ke liye (s.7(c) se (e)). **Consent Manager** customer ki marzi ka raasta hai (s.6(7) se (9), rule 4, First Schedule): Board me registered; Data Fiduciary ke liye unse judna zaroori nahi likha.
- **Source:** [S-E1] s.5, 6, 7; [S-E2] rule 3, 4 aur First Schedule.
- **Hamare faisle se mel:** D-141 (marketing alag opt-in), D-155 (chehre wali photo pe tick), D-169 (try-on se pehle consent), D-157 (R1 me page tracking nahi) mel khaate hain. Kami: sign-up pe ek alag, itemised notice ka kram kahin likha nahi (D-150 me sirf Privacy page aur consent version). Order, delivery, return aur invoice ka data s.7(a) se chal sakta hai, par notice me bhi likhna behtar.
- **Prastaav:** (1) "Data notice" Privacy page se alag ek chhota page/modal: har maqsad ki line (order aur delivery, delivery ka saboot, daawe ki photos, reviews, Pro aur seller KYC, marketing, try-on, beauty profile, fraud ki rok) aur uska data; (2) har consent ka record: kis notice version pe, kab, kis raaste se, aur waapsi; (3) har consent ka "band karo" utni hi clicks me; (4) Consent Manager se judna R1 me nahi, par consent record ka data model aisa ki baad me jud sake.
- **Dummy me kya:** notice ka text asli jaisa, upar "DUMMY: lawyer se jaancha nahi" badge (D-150); Board ka link sirf jaankari ka.
- **Status:** Jaancha.

### L-101. Sehat ke paas ka data (allergy, skin reaction, beauty profile, expert ke notes)

- **Kya jaanchna tha:** allergy, skin reaction, beauty profile aur consultation notes pe koi khaas niyam.
- **Kanoon kya kehta hai:** DPDP Act me "sensitive" data ki alag shreni nahi; sab personal data pe ek hi niyam, aur security pe rule 6 (encryption, masking, access control, logs). Abhi laagu SPDI Rules 2011 me "physical, physiological and mental health condition" aur "medical records and history" sensitive personal data hain (rule 3); inhe lene se pehle likhit (letter, fax ya email jaisa electronic) consent, maqsad batana, aur zaroorat tak hi rakhna (rule 5).
- **Source:** [S-E7] rule 3, 5; [S-E2] rule 6.
- **Hamare faisle se mel:** D-165 (alag consent), D-207 (pahunch), D-208 (samay), SR-063 aur SR-067 (encryption, audit) mel khaate hain. D-025 me expert ke notes se pehle consent pehle se tay.
- **Prastaav:** consultation, skin reaction case aur beauty profile ke consent ka alag record (L-100 ke saath); in fields ko kabhi marketing ya sujhaav (D-166) me istemaal na karna jab tak alag consent na ho.
- **Dummy me kya:** dummy profiles; asli sehat ki jaankari demo me na daalne ki chetavni form pe.
- **Status:** Jaancha.

### L-102. Data ke haq aur jawab ka samay

- **Kya jaanchna tha:** customer ke haq kaun se, aur kitne din me jawab.
- **Kanoon kya kehta hai:** haq: (a) apne data ka **saar**, processing ka saar, aur un **doosre Data Fiduciaries aur Data Processors ki pehchaan** jinke saath data baanta gaya (s.11(1)); (b) sudhaar, poora karna, update aur erasure, jab tak kanoon ya maqsad ke liye rakhna zaroori na ho (s.12); (c) shikayat ka aasaan raasta (s.13); (d) maut ya asamarthata pe haq chalane ke liye kisi ko **nominate** karna (s.14). Rule 14: haq maangne ka raasta aur pehchaan ke liye kya chahiye, website ya app pe saaf dikhe; shikayat ka jawab **90 din** se zyada nahi. Customer ko Board jaane se pehle Data Fiduciary ki shikayat ka raasta poora karna hota hai (s.13(3)).
- **Source:** [S-E1] s.11 se 14; [S-E2] rule 14.
- **Hamare faisle se mel:** D-151: R1 me sudhaar, marketing band, account delete; R2 me data download, consent ka itihaas, request ka ticket. Kami: nomination ka haq kisi faisle me nahi; "kis-kis ke saath data gaya" ki list (s.11(1)(b)) D-151 ke download me likhi nahi; 90 din ki bahari seema tay nahi (D-163 ke grievance timers 48 ghante aur 30 din hain, jo isse kam hain, to theek).
- **Prastaav:** privacy page pe "apne haq" ka hissa: raasta, pehchaan ke liye sirf sign-in, jawab ka samay (D-163 ke hisaab se 30 din, kanoon ki 90 din ki seema ke andar); data ke saar me "kis ke saath baanta" (sellers ke naam order ke hisaab se, aur processors ki shreniyan: hosting, email, payment, push); nomination ka form (R2) aur uska record.
- **Dummy me kya:** dummy customer pe poora flow; asli insaan ka nominee demo me nahi.
- **Status:** Jaancha.

### L-103. Data rakhne aur delete ka samay, backups

- **Kya jaanchna tha:** kitne din rakhein, kab delete, account delete ke baad kya bache, backups ka kya.
- **Kanoon kya kehta hai:** consent waapas lene pe ya jab maqsad poora maana jaaye, data erase; processor se bhi erase karwana; par jo kisi kanoon ke liye rakhna zaroori ho wo bachta hai (s.8(7)). Rule 8(1) aur Third Schedule: 3 saal ki inactivity pe delete sirf un e-commerce entities pe jinke India me **2 crore ya zyada** registered users hain, aur delete se 48 ghante pehle suchna (rule 8(2)). **Rule 8(3) (naya, 13 May 2027 se):** har Data Fiduciary har processing ka personal data, us se juda traffic data aur processing ke logs **kam se kam 1 saal** (processing ki tareekh se) rakhe, Seventh Schedule ke maqsadon (State ki maang) ke liye; phir erase, jab tak koi aur kanoon lamba na maange. Rule ki apni misaal: e-commerce platform order ki details, personal data aur processing ke logs (order, payment, delivery events) transaction se kam se kam 1 saal rakhe, **chahe customer account delete kar de**; cloud processor se bhi utna rakhwana. Rule 6(1)(e): security ke liye logs aur personal data 1 saal.
- **Source:** [S-E1] s.8(7), 8(8); [S-E2] rule 6(1)(e), 8 aur Third aur Seventh Schedule. GST ke 72 mahine CL-021 me (pehle run me).
- **Hamare faisle se mel:** D-194 (sign-in aur security events 1 saal, audit 2 saal) aur D-225 (tax archive) mel khaate hain. **Takrav ka jokhim:** D-151 / SR-066 (account delete pe 7 din baad pehchaan hatana), D-192 (video aur pack photo 90 din), D-191 aur D-192 ke 180 din (1 saal se kam), D-208 (allergy profile account delete pe turant). Rule 8(3) ki seedhi padhai me order, payment aur delivery ka personal data aur logs 1 saal tak bachne chahiye. Ye sawal vyakhya ka hai (kya har photo bhi "such personal data" hai), isliye lawyer se pakka karna.
- **Prastaav:** ek "1 saal ki kanooni rok" (legal hold) ki class: account delete ya samay poora hone pe data app se turant hat jaaye (kisi staff ya feature ko na dikhe), par ek band, encrypted store me processing ki tareekh se 1 saal tak rahe, sirf kanooni maang pe khule (har kholna audit me), phir apne aap erase. Photos aur video pe owner chune: (a) 1 saal tak isi store me, ya (b) sirf unke events aur hash rakhein aur lawyer se pakka karein. Kam users pe 3 saal ki inactivity laagu nahi, par ek "purana account" setting (misaal 3 saal, 48 ghante pehle email) achhi aadat hai. Backups: rule 8(3) ka 1 saal backup ki umar se alag; SR-083 ki "restore ke baad deletes dobara" waali list legal hold ke saath mel khaye.
- **Dummy me kya:** samay settings me; demo me chhote samay (misaal din ki jagah minute) sirf test environment me, production me kanooni samay.
- **Status:** Aadha jaancha (kanoon ka text primary se jaancha; rule 8(3) ka hamare photos aur profile pe lagna vyakhya ka sawal).

### L-104. Data leak pe users aur Board ko suchna

- **Kya jaanchna tha:** leak pe users aur sarkari sanstha ko kab aur kaise batana hai.
- **Kanoon kya kehta hai:** rule 7(1): breach ka pata chalte hi, **bina der** (without delay), har asar wale customer ko uske account ya registered sampark se: kya hua (prakriti, kitna, kab), us pe kya asar ho sakta hai, humne kya kiya, wo khud kya kare, aur jawab dene wale insaan ka business contact. Rule 7(2): Board ko (a) **bina der** shuruaati vivaran (prakriti, kitna, kab, kahan, asar), aur (b) **72 ghante** me (ya Board ki di lambi muddat) poori report: kaaran, kya kiya, kisne kiya (agar pata), dobara na ho uske kadam, aur users ko di gayi suchna ki report. Alag se CERT-In ko 6 ghante me (L-110).
- **Source:** [S-E2] rule 7; [S-E1] s.8(6); CERT-In [S-G1] direction (ii).
- **Hamare faisle se mel:** D-198 "users ko misaal 72 ghante ke andar" likhta hai. **Takrav:** users ke liye kanoon "bina der" kehta hai; 72 ghante Board ki poori report ki seema hai. D-198 ki "jo sarkari report kanooni jaanch bataye" ab saaf: Board (bina der + 72 ghante) aur CERT-In (6 ghante).
- **Prastaav:** incident runbook (SR-084) me teen ghadiyaan: CERT-In 6 ghante (pata chalne se), Board ko shuruaati suchna bina der aur poori report 72 ghante, users ko bina der (pakka hote hi; 72 ghante sirf bahari seema nahi). User email aur in-app ka template rule 7(1) ke paanch hisson ke saath; "jawab dene wala insaan" L-134 wala contact. Emails ki din ki chhat (D-142) me breach emails sabse upar.
- **Dummy me kya:** saal ka abhyaas (SR-084) nakli event se; Board ya CERT-In ko kabhi nakli report nahi, sirf "yahan bhejte" ka record.
- **Status:** Jaancha.

### L-105. KYC me Aadhaar

- **Kya jaanchna tha:** seller, Beauty Pro ya delivery partner ki KYC me Aadhaar lena chahiye ya nahi, aur kaise.
- **Kanoon kya kehta hai:** Aadhaar number public me chhapna, dikhana ya post karna mana (reg. 6(1)); jiske paas Aadhaar number ho wo uski suraksha aur gopniyata rakhe (6(2)); kisi database ko public karna ho to number redact (6(3)); internet pe number sirf encrypted roop me (6(4)); maqsad se zyada der nahi rakhna (6(5), 2025 me juda). UIDAI ke FAQ me "masked Aadhaar" me pehle 8 ank chhupe hote hain (sirf jaankari). Hamare kisi kaam (seller, Pro, partner) ke liye Aadhaar zaroori nahi mila; PAN aur GSTIN se KYC chalti hai.
- **Source:** [S-E8] reg. 6 (sub-reg. (5) 22.08.2025 se).
- **Hamare faisle se mel:** SR-064 ("Aadhaar ka number nahi lena; zaroori ho to chhupa") mel khaata hai.
- **Prastaav:** upload ke form pe saaf line "Aadhaar ki copy mat bhejein"; galti se aayi Aadhaar copy staff reject kare aur file turant delete; delivery partner ki pehchaan ke liye bhi Aadhaar ki jagah doosra ID ya sirf masked copy (L-118 ke saath).
- **Dummy me kya:** koi Aadhaar nahi, dummy bhi nahi (12 ank ka nakli number bhi asli ho sakta hai).
- **Status:** Jaancha.

### L-106. Staff ki personal data tak pahunch

- **Kya jaanchna tha:** staff ko customer ka data kitna dikhe, aur kya record ho.
- **Kanoon kya kehta hai:** rule 6(1): computer resources tak pahunch pe control; data ki pahunch pe logs, monitoring aur review taaki bina haq ki pahunch pakdi ja sake; encryption, masking ya token; aur sahi technical aur organisational kadam. SPDI rule 8 me documented security program (ISO/IEC 27001 ek misaal).
- **Source:** [S-E2] rule 6; [S-E7] rule 8.
- **Hamare faisle se mel:** D-201 (kam se kam jaankari, poori sirf wajah ke saath, audit), SR-076, SR-077 mel khaate hain.
- **Prastaav:** "poori jaankari dekhi" ke audit ki mahine ki review (Head of Operations ya Trust & Safety) ka ek kaam; ye rule 6(1)(c) ka "review" hissa hai.
- **Dummy me kya:** kuch nahi; niyam asli.
- **Status:** Jaancha.

### L-107. Device ki pehchaan aur accounts ka jod

- **Kya jaanchna tha:** device cookie, address aur payment ki pehchaan se accounts jodna (seemaon aur fraud ke liye) bina consent chal sakta hai ya nahi.
- **Kanoon kya kehta hai:** DPDP me "legitimate interest" jaisa koi aam aadhaar nahi; consent ya s.7 ke tay maamle hi. Fraud ki rok ke liye processing ka koi alag aam aadhaar Act me nahi mila (s.17(1)(c) sirf kanoon todne ki rok, jaanch ya prosecution ke liye kuch hisson se chhoot deta hai). India me cookies pe alag kanoon nahi mila.
- **Source:** [S-E1] s.6, 7, 17(1).
- **Hamare faisle se mel:** D-203, D-176, D-156 me jod tay hai. Kami: ye maqsad notice me nahi likha.
- **Prastaav:** L-100 ke notice me ek line: "per-customer seemaayein aur galat istemaal ki rok ke liye device cookie, address aur payment ki pehchaan ka milaan"; Terms me bhi. Device cookie sirf isi kaam ke liye, kabhi marketing ke liye nahi.
- **Dummy me kya:** kuch nahi.
- **Status:** Aadha jaancha (s.17(1)(c) aur s.7 ka is pe lagna vyakhya ka sawal).

### L-108. Seller ko customer ka data, review ke saath data, sujhaav

- **Kya jaanchna tha:** seller ko kitna data dena theek, reviewer ki skin jaankari aur sujhaav ka data.
- **Kanoon kya kehta hai:** jo data kisi doosre Data Fiduciary (yahan seller) ko diya jaaye, uska poora aur sahi hona hamari zimmedari (s.8(3)(b)); customer ko "kis ke saath baanta" batana (s.11(1)(b)); sirf maqsad jitna data (s.6(1)).
- **Source:** [S-E1] s.6(1), 8(3), 11(1)(b).
- **Hamare faisle se mel:** D-143 (pehchaan ke bina reports; ₹50,000+ invoice pe naam-pata, D-226), D-165 (profile seller ko kabhi nahi), D-166 (sujhaav consent se), D-167 (reviewer ke optional fields, umar ka group) mel khaate hain. Review pe dikhne wale skin fields public hote hain, to unka consent review likhte waqt saaf ho.
- **Prastaav:** review form pe line "ye jaankari review ke saath sabko dikhegi"; seller ko invoice ki copy L-102 ke "kis ke saath baanta" me.
- **Dummy me kya:** dummy reviews.
- **Status:** Jaancha.

### L-129. Demo site pe anjaan logon ka data

- **Kya jaanchna tha:** allowlist wale demo pe bhi DPDP laagu hai ya nahi.
- **Kanoon kya kehta hai:** Act India me digital personal data ki har processing pe laagu (s.3); demo ya test ke liye koi chhoot nahi mili. Startups jaise kuch Data Fiduciaries ko s.5, s.8(3), s.8(7), s.10 aur s.11 se chhoot dene ki shakti sarkar ke paas hai (s.17(3)); Dec 2025 ki ek sarkari press release ise "simplified compliance framework" kehti hai (search me mili, page 403), par is run me koi asli chhoot ki notification nahi mili.
- **Source:** [S-E1] s.3, 17(3).
- **Hamare faisle se mel:** D-133 (sirf allowlist emails se account; baaki sirf dekh sakein) data ko kam rakhta hai, mel khaata hai. Testers ka data bhi personal data hai.
- **Prastaav:** testers ke liye bhi wahi notice aur haq; "Ye demo store hai" ke page pe likha ho ki allowlist ke bahar koi data nahi liya jaata.
- **Dummy me kya:** testers ke `+` alias emails asli inbox hain, to unka data asli maana jaaye.
- **Status:** Jaancha.

### L-131. Privacy policy aur user agreement ke zaroori hisse

- **Kya jaanchna tha:** privacy page aur Terms me kanoon kya maangta hai, aur backups ka zikr.
- **Kanoon kya kehta hai:** abhi SPDI rule 4: privacy policy website pe, jisme data ke prakar, maqsad, kise diya jaata hai, aur security ke kadam. DPDP rule 3 ka notice alag (L-100). Rule 9 aur rule 14: sampark wala insaan aur haq ka raasta saaf dikhe (L-134, L-102). Intermediary niyam (L-109) me user agreement me mana content ki list.
- **Source:** [S-E7] rule 4; [S-E2] rule 3, 9, 14.
- **Hamare faisle se mel:** D-150 (Terms, Privacy aur baaki pages, version, bade badlav pe naya consent) mel khaata hai; kami: privacy page me processors ki shreniyan, data ki jagah (Singapore, L-111), 1 saal ki kanooni rok (L-103), aur backups ki umar ka zikr tay nahi.
- **Prastaav:** Privacy page ke hisse: kaunsa data, kyun, kab tak (D-191 se D-194, D-208, L-103), kis ke saath (sellers, processors ki shreniyan), kahan (India ke bahar, Singapore, L-111), security ka saar, haq aur unka raasta, sampark wala insaan, Board ko shikayat, backups me purana data backup ki umar tak.
- **Dummy me kya:** page pe "DUMMY: lawyer se jaancha nahi" (D-150).
- **Status:** Jaancha.

### L-132. Marketing khabron ki consent aur band karna

- **Kya jaanchna tha:** marketing in-app aur push ke liye kaunsi consent, aur band karna.
- **Kanoon kya kehta hai:** consent alag aur saaf (s.6(1)); waapsi utni hi aasaan (s.6(4)). Hamare raaste (in-app, push, email) pe India me alag marketing kanoon nahi mila; phone pe marketing hamare raaston me hai hi nahi.
- **Source:** [S-E1] s.6.
- **Hamare faisle se mel:** D-141 (alag opt-in, pehle se tick nahi, har khabar me band karne ka raasta) mel khaata hai.
- **Prastaav:** opt-in aur opt-out dono consent record (L-100) me; push ki browser permission aur marketing consent do alag cheezein (push permission ho par marketing consent na ho to sirf order ki khabrein).
- **Dummy me kya:** kuch nahi.
- **Status:** Jaancha.

### L-134. Sampark wala insaan (rule 9) aur grievance ka mel (naya point)

- **Kya jaanchna tha:** D-237 aur D-241 ke baad asli roles ki jaankari public; DPDP me kaunsa contact chahiye.
- **Kanoon kya kehta hai:** har Data Fiduciary website ya app pe saaf dikhaye, aur haq ki har request ke jawab me likhe: Data Protection Officer (sirf SDF pe zaroori) ya aisa insaan jo processing ke sawalon ka jawab de sake, uska business contact (s.8(9), rule 9). Grievance ka asardaar tareeka (s.8(10)); jawab 90 din ke andar (rule 14(3)).
- **Source:** [S-E1] s.8(9), 8(10), 10(2)(a); [S-E2] rule 9, 14.
- **Hamare faisle se mel:** D-163 (Grievance Officer, timers), D-237 aur D-241 (asli role ki jaankari) mel khaate hain; kami: privacy ke sawalon ka contact kisi role pe tay nahi.
- **Prastaav:** owner chune: Grievance Officer hi privacy contact bhi (ek role, kam kaam), ya alag "Privacy contact" role. Jo bhi ho, privacy page pe aur haq ke har jawab (email aur in-app) me apne aap uska contact.
- **Dummy me kya:** D-241 ke hisaab se role wale staff account ki asli jaankari; repo me koi naam nahi.
- **Status:** Jaancha.

### L-135. Bachchon ka data aur 18+ ki ghoshna (naya point)

- **Kya jaanchna tha:** D-038 (sirf 18+, sign-up pe age declaration) DPDP ke bachchon wale niyam se mel khaata hai ya nahi.
- **Kanoon kya kehta hai:** 18 saal se kam = child (s.2(f)). Child ka data process karne se pehle parent ki verifiable consent (s.9(1), rule 10); bachchon ki tracking, behavioural monitoring aur unpe targeted ads mana (s.9(3)). Fourth Schedule Part B #6: ye pakka karne ke liye ki user child nahi hai, utni processing ki chhoot. Kanoon kisi tay tareeke (jaise ID se umar ki jaanch) ko har user pe zaroori nahi kehta; sirf ghoshna kaafi hai ya nahi, ye saaf nahi likha.
- **Source:** [S-E1] s.2(f), 9; [S-E2] rule 10 aur Fourth Schedule Part B.
- **Hamare faisle se mel:** D-038 mel khaata hai (hum bachchon ka data lete hi nahi). Jokhim: ghoshna jhoothi ho to bhi hum child ka data process kar rahe honge.
- **Prastaav:** sign-up pe umar ki ghoshna ka tick (pehle se tick nahi) aur consent record me; Terms me "sirf 18+"; agar support ya review se pata chale ki user child hai, to account band aur data erase (L-103 ki kanooni rok ke saath); kabhi bhi umar ke hisaab se ads nahi. Lawyer se pakka: kya sirf ghoshna kaafi hai.
- **Dummy me kya:** kuch nahi.
- **Status:** Aadha jaancha (ghoshna kaafi hai ya nahi, vyakhya).

### L-136. Significant Data Fiduciary (naya point)

- **Kya jaanchna tha:** kya hum SDF ban sakte hain, aur tab kya.
- **Kanoon kya kehta hai:** SDF sirf sarkar ki notification se banta hai (data ki matra aur sensitivity, adhikaron pe jokhim jaise gun, s.10(1)). SDF pe: India me rehne wala DPO, independent data auditor, har 12 mahine DPIA aur audit, Board ko report, algorithms ki jaanch, aur sarkar ki batayi shreni ka data India ke bahar nahi (s.10(2); rule 13). Is run me koi SDF list ya shreni notify hui nahi mili; Feb 2026 ke prastaav me SDF ke niyam jaldi laane ki baat thi [S-E5].
- **Source:** [S-E1] s.10; [S-E2] rule 13; [S-E5] secondary.
- **Hamare faisle se mel:** koi faisla nahi; abhi laagu nahi.
- **Prastaav:** kuch banana nahi; COMPLIANCE ke "nazar" me ek line: SDF ki notification aaye to Singapore hosting (D-058) aur DPO dobara dekhna.
- **Dummy me kya:** kuch nahi.
- **Status:** Aadha jaancha (kanoon primary se; koi notification na hona sirf search se).

### L-137. IT Act s.43A aur SPDI Rules 2011, DPDP ke aane tak (naya point)

- **Kya jaanchna tha:** DPDP ke poori tarah laagu hone tak kaunsa kanoon.
- **Kanoon kya kehta hai:** DPDP s.44(2)(a) IT Act ka s.43A hataata hai, aur ye hissa 18 mahine baad laagu [S-E4, secondary]. Tab tak s.43A (body corporate sensitive data me laparwahi kare to muavza) aur SPDI Rules: sensitive data (password, bank/card jaisi financial jaankari, sehat, biometric, waghera; rule 3) pe likhit consent (rule 5(1)), privacy policy (rule 4), Grievance Officer ka naam aur contact website pe aur ek mahine me hal (rule 5(9)), bahar dene se pehle permission (rule 6), transfer (India ke andar ya bahar) sirf wahan jahan suraksha ka wahi star ho (rule 7), aur documented security program (rule 8).
- **Source:** [S-E1] s.44(2); [S-E7] rules 3 se 8; [S-E4] secondary.
- **Hamare faisle se mel:** passwords ka hash (SR-013), PAN aur bank ka encryption (SR-063), sehat ka alag consent (D-165) mel khaate hain. Grievance ka 30 din (D-163) rule 5(9) ke ek mahine ke andar.
- **Prastaav:** sign-up ke consent me sensitive data (password, payment ki jaankari jo gateway rakhta hai, R2 me sehat) ka saaf zikr; security program ka ek chhota likha doc (SR ke niyam hi, ek jagah).
- **Dummy me kya:** kuch nahi.
- **Status:** Aadha jaancha (s.44(2) ki tareekh secondary).

### L-138. Data Processors (hosting, email, payment, push) ke saath contract (naya point)

- **Kya jaanchna tha:** Render, Vercel, Atlas, Neon, email provider, payment gateway jaise providers ke saath kya chahiye.
- **Kanoon kya kehta hai:** processor sirf "valid contract" ke tahat (s.8(2)); processor ki processing ki zimmedari bhi Data Fiduciary ki (s.8(1)); contract me security safeguards (rule 6(1)(f)); consent waapsi ya erasure pe processor se bhi band ya erase karwana (s.6(6), s.8(7)(b)); 1 saal ki rok processor pe bhi (rule 8(3) ki misaal 2).
- **Source:** [S-E1] s.8(1), 8(2), 8(7)(b); [S-E2] rule 6(1)(f), 8(3).
- **Hamare faisle se mel:** kisi faisle me processors ki list ya unke data terms ka record nahi. Free plans pe providers ki apni standard terms aur data processing addendum hi milte hain.
- **Prastaav:** operations doc me processors ki ek list: kaun, kya data, kis region me, unke data processing terms ka link aur tareekh, data delete ka tareeka; naya provider jodne se pehle ye row. Privacy page me shreniyan (L-131).
- **Dummy me kya:** list asli providers ki (ye dummy nahi).
- **Status:** Jaancha.

**Area E me design pe ek aur baat:** DPDP ki zyadatar zimmedariyan 13 May 2027 se, par R1 ka design abhi bane to ye sab shuru se data model me rahein (consent record, legal hold, processors ki list); baad me jodna mehenga.

## 3. F: IT Act aur intermediary niyam

**Is area ke sources (sab 2026-11-20 ko khole):**

- **[S-F1]** IT (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021 (G.S.R. 139(E), 25 Feb 2021), 28 Oct 2022 aur 6 Apr 2023 ke badlav samet, "version from 6 April 2023": <https://indiankanoon.org/doc/111130067/>. Consolidated text, secondary host (meity.gov.in ne 403 diya).
- **[S-F2]** IT (Intermediary Guidelines and Digital Media Ethics Code) Amendment Rules 2026 (notify 10 Feb 2026, laagu 20 Feb 2026) ka saar, Khaitan & Co ERGO (16 Feb 2026): <https://khaitanco.com/sites/default/files/2026-02/ERGO%20-%20IT%20Rules%20Amendment%20-%2016%20February%202026.pdf>. Secondary; gazette ka text aur G.S.R. number nahi khula. **(naya)**
- **[S-F3]** Usi amendment pe Chambers ka lekh: <https://chambers.com/articles/government-notifies-information-technology-amendment-rules-2026>. Secondary.
- **[S-F4]** Consumer Protection (E-Commerce) Rules 2020 rule 5(1) (marketplace s.79 ki chhoot tabhi le jab IT Act s.79(2), (3) aur intermediary niyam maane): pehle run ka wahi source (PRS ki copy), COMPLIANCE ke [E1].

### L-109. Reviews jaise user content: platform ki zimmedari, shikayat aur hatane ka samay

- **Kya jaanchna tha:** reviews, review photos aur seller ke content pe intermediary ki zimmedari, shikayat ki receipt aur hatane ke samay.
- **Kanoon kya kehta hai:** marketplace teesre ke content (reviews) ke liye IT Act s.79 ki chhoot tabhi le sakta hai jab intermediary niyam maane [S-F4]. Niyam (6 Apr 2023 tak ka text [S-F1], aur 20 Feb 2026 ke badlav [S-F2, S-F3]):
  - 3(1)(a): rules, privacy policy aur user agreement saaf publish.
  - 3(1)(b): user agreement users ko batata hai ki kya host nahi karna (doosre ka content bina haq, ashleel ya privacy todne wala, bachchon ke liye haanikarak, IP ka ullanghan, jaan-boojh ke galat jaankari, kisi aur ban ke, desh ki suraksha, malicious code, aur kisi bhi kanoon ke khilaaf), aur platform khud bhi koshish kare.
  - 3(1)(c): users ko niyam todne ke nateeje batana: pehle saal me ek baar, **2026 se har 3 mahine** [S-F2, secondary].
  - 3(1)(d): court order ya sarkar ki reasoned intimation pe hatana: pehle 36 ghante, **2026 se 3 ghante** [S-F2, S-F3, secondary].
  - 3(1)(g): hataya content aur uske records **180 din** sambhaal ke.
  - 3(1)(h): user ka registration data account band hone ke **180 din** baad tak.
  - 3(1)(j): sarkari agency ki maang pe jaankari 72 ghante me.
  - 3(1)(l): cyber incidents CERT-In ko (L-110).
  - 3(2)(a): Grievance Officer ka naam aur contact; shikayat ki receipt 24 ghante me; hal pehle 15 din, **2026 se 7 din**; 3(1)(b) wale content (sub-clauses (i), (iv), (xi) chhod ke) ko hatane ki shikayat pe pehle 72 ghante, **2026 se 36 ghante** [secondary].
  - 3(2)(b): nagnata, yaun content, kisi aur ban ke ya morphed photo ki shikayat pe pehle 24 ghante, **2026 se 2 ghante** [secondary].
  - 3A: Grievance Officer ke faisle (ya samay pe hal na hone) ke khilaaf Grievance Appellate Committee me 30 din me appeal.
  - 2026 ke badlav me "synthetically generated information" (asli jaisa dikhne wala banaya ya badla audio/video/image) ke niyam bhi aaye; ye un platforms pe jo aisa content banane ya phailane dete hain [S-F2].
- **Source:** [S-F1] rules 3, 3A; [S-F2], [S-F3] (2026 ke samay, secondary); [S-F4].
- **Hamare faisle se mel:** D-136 (moderation), D-146 (chhupane ki wajahein), D-155 (photo jaanch), D-163 (shikayat ki seedhi) ka dhaancha mel khaata hai; D-247 ne listing hatane ki wajahon me trademark, copyright aur IT Act ka code joda. **Takrav ya kami:** (1) D-136 niyam 5 "queue ka faisla misaal 2 kaam ke din" 3(1)(b) wali shikayat ke 36 ghante se lamba ho sakta hai (weekend); (2) D-163 ka hal 30 din (consumer shikayat ke liye theek) content ki shikayat pe 7 din se zyada; (3) court ya sarkari order pe 3 ghante ka kram kisi faisle me nahi, aur owner akela chalata hai; (4) har 3 mahine ki user advisory kahin nahi; (5) 3(1)(h) ke 180 din D-151 ke 7 din wale delete se takraate hain (L-103 ki kanooni rok me jode); (6) D-146 ki list 3(1)(b) ki saari shreniyan naam se nahi kehti (bachchon ke liye haanikarak, kisi aur ban ke, IP, malicious code).
- **Prastaav:** (1) content ki shikayat ke timers: receipt 24 ghante, nagnata/kisi aur ban ke wali report pe **turant apne aap chhupna** (2 ghante ke andar), baaki 3(1)(b) shreniyon pe faisla 36 ghante (calendar, kaam ke din nahi), aam content grievance 7 din; (2) "kanooni order" ka alag raasta: Master ko turant alert (security inbox aur push), review ya listing ek click me chhupe, 3 ghante ka timer, aur order ki copy audit me; (3) har 3 mahine in-app (aur email) pe Terms ke nateejon ki chhoti suchna, marketing nahi; (4) Terms me 3(1)(b) ki poori list, aur D-146 ki wajahon ka us list se milaan; (5) grievance ke jawab me Grievance Appellate Committee ka raasta; (6) hataya content 180 din sambhaal ke (D-136 niyam 6 ka "wapas ho sake" yahi deta hai). Virtual try-on (D-169) kuch publish ya save nahi karta, to synthetic content ke niyam abhi lagte nahi dikhte; agar kabhi try-on ki photo save ya share ho, to label ka niyam dobara dekhna.
- **Dummy me kya:** dummy reviews aur dummy shikayatein; asli order ka demo nahi. Grievance Officer ki jaankari role se (D-241).
- **Status:** Aadha jaancha (2026 ke saare samay secondary; gazette nahi khula).

## 4. G: CERT-In aur data ki jagah

**Is area ke sources (sab 2026-11-20 ko khole):**

- **[S-G1]** CERT-In Directions under s.70B(6) IT Act, No. 20(3)/2022-CERT-In, 28 Apr 2022 (60 din baad laagu): <https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf>. Primary.
- **[S-G2]** CERT-In FAQs on Cyber Security Directions (May 2022): <https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf>. Primary.
- **[S-G3]** RBI, Storage of Payment System Data, FAQs (26 Jun 2019; circular DPSS.CO.OD No. 2785/06.08.005/2017-18, 6 Apr 2018): <https://www.rbi.org.in/Scripts/FAQView.aspx?Id=130>. Primary.
- **[S-G4]** RBI Master Direction on Regulation of Payment Aggregators (15 Sep 2025, RBI/DPSS/2025-26/141; "Updated as on November 11, 2026"): <https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12896>. Primary. **(naya)**
- DPDP: [S-E1] s.16, [S-E2] rule 13(4), 15 (area E).

### L-110. CERT-In: logs, incident report aur ghadi ka milaan

- **Kya jaanchna tha:** logs kitne din, kahan, incident report kitne ghante me, aur clock sync.
- **Kanoon kya kehta hai:** directions "service providers, intermediaries, data centres, body corporate" sab pe; body corporate me har company [S-G2 Q25]. (i) Saare ICT systems ki ghadi NIC ya NPL ke NTP server (ya unse traceable) se; kai deshon me faile infrastructure wale doosra sahi time source le sakte hain par wo NIC/NPL se alag na ho; cloud pe cloud ki apni time service chal sakti hai [S-G2 Q42]. (ii) Annexure I ke incidents (jaise unauthorised access, website defacement, malicious code, e-commerce application pe hamla, data breach, data leak, social media account pe kabza, cloud pe hamla) **6 ghante** me CERT-In ko (email, phone, fax), pata chalne ya bataye jaane se. (iii) CERT-In se baat ke liye ek **Point of Contact** (Annexure II ke format me bhejna). (iv) saare ICT systems ke logs chalu, **180 din** ka rolling, "Indian jurisdiction" me; incident ke saath ya maangne pe dena. FAQ Q35: logs India ke bahar bhi rakhe ja sakte hain agar CERT-In ko "reasonable time" me de sakein; Q36: India me seva dene wala financial transactions ke logs aur records Indian jurisdiction me rakhe. Logs ki misaalein: firewall, web/database server, application, SSH, VPN logs; safal aur asafal dono events [S-G2 Q37].
- **Source:** [S-G1] directions (i) se (iv), Annexure I; [S-G2] Q7, Q25, Q35 se Q37, Q42.
- **Hamare faisle se mel:** D-194 (sign-in aur security events 1 saal, audit 2 saal) 180 din se zyada, mel khaata hai. **Kami:** (1) Render ke free plan pe app logs kitne din rehte hain, pakka nahi (security analysis me tathya ki jaanch baaki); agar platform ke logs 180 din se kam hain to SR-077 ke request logs apni jagah 180 din chahiye; (2) 6 ghante ki report D-198 aur SR-084 me nahi; (3) CERT-In ka Point of Contact kisi role pe nahi; (4) clock sync ka niyam kahin likha nahi (hosted services ki apni time service chalegi, par apne laptop ke backup aur scripts ke timestamps UTC aur sync wale hon).
- **Prastaav:** (1) "CERT-In logs" ki class: request logs (SR-077) aur security events kam se kam 180 din apne store me (Atlas ka audit cluster ya alag), jagah ke hisaab se R-006 me ginti; (2) runbook me 6 ghante ki ghadi sabse pehle (L-104 ki teen ghadiyon me); (3) Point of Contact = owner ka security role (D-241 jaisa), Annexure II ka form asli business pe bharna; (4) saare timestamps UTC me, hosted platforms ki time service par bharosa likha ho.
- **Dummy me kya:** CERT-In ko koi test report nahi; abhyaas me sirf form bharne tak. Point of Contact asli business pe hi register.
- **Status:** Jaancha.

### L-111. Data ki jagah: payment data, personal data aur logs, aur Singapore hosting

- **Kya jaanchna tha:** D-058 (saari hosting AWS Singapore) payment data ke RBI niyam, DPDP ke cross-border niyam aur CERT-In ke logs se mel khaati hai ya nahi.
- **Kanoon kya kehta hai:**
  - **RBI:** payment system data sirf India me store; bahar processing ho to 1 business day ya 24 ghante (jo pehle) me wapas India aur bahar se delete. Ye niyam RBI se authorised payment system providers (aur unke engage kiye service providers, payment gateways, vendors) pe hai; "payment data" me customer ka naam, mobile, email, PAN, account details, credentials aur transaction data [S-G3]. FAQ merchants ka seedha naam nahi leta. PA Direction me merchant (marketplace bhi merchant hai, para 4(f)) ke server pe card credentials store nahi (Annexure 1, para 2.1) aur PA ko 2018 ke storage niyam maanne hain (para 9(c)) [S-G4].
  - **DPDP:** personal data India ke bahar bhej sakte hain; sarkar notification se kisi desh ko rok sakti hai (s.16(1)) aur zyada sakht sectoral kanoon (jaise RBI) pehle (s.16(2)). Rule 15: bahar bhejne pe sarkar ke "general ya special order" ki shartein (videshi State ko data dene ke baare me). Sirf SDF pe sarkar ki batayi shreni ka data India me hi (rule 13(4)). Is run me koi roka hua desh ya order nahi mila.
  - **SPDI (abhi):** transfer sirf wahan jahan suraksha ka wahi star ho (rule 7) [S-E7].
  - **CERT-In:** logs "Indian jurisdiction" me, par FAQ ke hisaab se bahar bhi agar samay pe de sakein (L-110).
- **Source:** [S-G3]; [S-G4] para 4(f), 9(c), Annexure 1 para 2.1; [S-E1] s.16; [S-E2] rule 13(4), 15; [S-E7] rule 7; [S-G2] Q35, Q36.
- **Hamare faisle se mel:** DPDP aur SPDI ke hisaab se Singapore hosting abhi chal sakti hai (koi rok nahi), aur hum card ya UPI ki jaankari nahi rakhte (SR-064), to card ka niyam mel khaata hai. **Jokhim:** (1) RBI ka storage niyam merchant pe seedha laagu hai ya nahi, saaf nahi; hamare database me order ke payment ka data (gateway ka payment id, rakam, samay, customer ka naam aur email) Singapore me hai; (2) CERT-In FAQ Q36 "financial transactions ke records Indian jurisdiction me" kehta hai; (3) agar kabhi SDF bane ya Singapore pe rok aaye, to region baad me nahi badalta (R-012).
- **Prastaav:** (1) payment ka kam se kam data: gateway ke ids, rakam, status, samay; koi card, UPI ID ya bank detail nahi (SR-064 pehle se); (2) payment gateway se likhit pakka karna ki merchant pe storage niyam ki kya shart hai (asli business se pehle); (3) asli business pe jaane se pehle region ka faisla dobara dekhne ki ek line COMPLIANCE ke "nazar" me (D-058 nahi khol rahe; sirf yaad); (4) privacy page pe "data India ke bahar (Singapore) rakha jaata hai" (L-131).
- **Dummy me kya:** Razorpay test mode; asli payment data nahi.
- **Status:** Aadha jaancha (RBI niyam ka merchant pe lagna vyakhya ka sawal; baaki primary se jaancha).

## 5. H: RBI aur payments

**Is area ke sources (sab 2026-11-20 ko khole):**

- **[S-H1]** RBI Master Direction on Regulation of Payment Aggregators (wahi [S-G4]). Primary.
- **[S-H2]** RBI circular "Harmonisation of Turn Around Time (TAT) and customer compensation for failed transactions using authorised Payment Systems", RBI/2019-20/67, DPSS.CO.PD No.629/02.01.014/2019-20, 20 Sep 2019 (15 Oct 2019 se): <https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=11693>. Primary.
- **[S-H3]** RBI FAQs on Prepaid Payment Instruments ("Updated as on November 22, 2022"; Master Directions on PPIs, 27 Aug 2021 ka hawala): <https://www.rbi.org.in/Scripts/FAQView.aspx?Id=126>. Primary; Master Direction ka abhi ka version is run me nahi khola.
- **[S-H4]** RBI "Digital Payments – E-mandate Framework, 2026", RBI/DPSS/2026-27/396, 21 Apr 2026 (turant laagu): <https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13374>. Primary. **(naya)**

### L-112. Marketplace ke liye payment aggregator, sellers ka paisa aur settlement

- **Kya jaanchna tha:** platform ke ek gateway account me sabka paisa aana aur phir sellers ko payout (D-093) RBI ke hisaab se theek hai ya nahi.
- **Kanoon kya kehta hai:** PA Direction me "marketplace" ek e-commerce entity hai jo buyers aur sellers ke beech platform deti hai (para 4(e)); "merchant" me marketplace bhi shaamil (para 4(f)). PA khud marketplace ka business nahi kar sakta (para 10(b)), aur PA ye dekhe ki uska marketplace merchant sirf apne onboarded sellers ke liye paisa le (para 13(f)). PA customer ka paisa escrow me rakhta hai; merchant ko settlement PA aur merchant ke agreement ke samay se, jo saaf likha ho (Table 1). Cash on delivery escrow se nahi chalta (para 18(b)). Non-bank PA ko RBI ki authorisation chahiye (para 5, 6). Text ye seedha nahi kehta ki apne PA ke zariye paisa lene wale marketplace ko khud authorisation chahiye ya nahi; definitions se lagta hai ki marketplace PA ka merchant hai.
- **Source:** [S-H1] para 4(e), 4(f), 5, 6, 10(b), 13(f), 18(b), Table 1.
- **Hamare faisle se mel:** D-093 (Razorpay ka ek account, jiski PA authorisation is run me nahi jaanchi; finance me har seller ka hisaab; payout platform kare) aur D-081 (return window ke baad payable, hafte me payout) mel khaate dikhte hain: hum PA ke merchant hain, aur seller ko kab dena hai ye seller agreement ki baat hai, RBI ki nahi. D-034 (cash nahi) se COD wala sawal hi nahi.
- **Prastaav:** (1) seller agreement me payout ke din aur shartein saaf (D-081 ke hisaab se), aur seller ko statement; (2) apne bank account me sellers ka paisa "sellers ka" alag dikhe (finance ledger me liability), apne kharche me na mile; (3) Razorpay ka marketplace / linked account wala raasta (D-093 ka baad ka vikalp) asli business pe pehle dekhna, kyunki usme paisa seedha seller tak jaata hai; (4) lawyer se pakka: kya marketplace ko PA authorisation ke bina sellers ka paisa apne account me rakhna theek hai.
- **Dummy me kya:** Razorpay test mode (D-055); payout haath se "paid".
- **Status:** Aadha jaancha (marketplace ka khud PA na hona text ki padhai se, seedha likha nahi).

### L-113. Failed transaction aur refund ka TAT (RBI), aur chargeback

- **Kya jaanchna tha:** RBI ke TAT niyam hamare refund (D-111) pe lagte hain ya nahi; chargeback ka kya.
- **Kanoon kya kehta hai:** TAT circular **failed** transactions ke liye hai (customer ka paisa kata par merchant ko pakki suchna nahi gayi): card PoS aur UPI merchant payment pe T+5 din me apne aap reversal, phir ₹100 roz ka muavza; PPI (on-us) pe T+1; IMPS pe T+1. T = transaction ka calendar din. Ye banks aur payment system operators pe hai; merchant ke shuru kiye return refund ka TAT is circular me nahi. PA Direction: refund usi raaste jisse paisa aaya, jab tak customer apne doosre account me na maange (para 10(f)); refund escrow se (para 18(h)); PA ka dispute framework chargeback, reason codes aur refund ke samay ke saath (para 8(a)); customer ke chargeback haq bane rehte hain (para 18(h)). Card ke "card not present" wale row ka samay is run ke extraction me saaf nahi padha.
- **Source:** [S-H2] annex; [S-H1] para 8(a), 10(f), 18(h). Refund ka consumer kanoon wala samay CL-063 me (pehle run me).
- **Hamare faisle se mel:** D-111 (refund usi raaste, fail ho to staff ka raasta, customer ko halat) mel khaata hai. Failed transaction (paisa kata, order nahi bana) ka kram kisi faisle me saaf nahi: gateway "captured" na ho to order na bane aur customer ko batana ki bank T+5 tak paisa lautayega. Chargeback ke saboot ka samay D-191 me "chargeback band hone tak".
- **Prastaav:** (1) checkout me "paisa kata par order nahi bana" ki screen aur email: bank ki TAT ki jaankari, order dobara na banane ki salah; (2) gateway webhook se late "captured" aaye aur order na ho to apne aap refund (idempotent); (3) chargeback ki suchna gateway se aaye to finance me case, saboot (delivery code, photo, D-072) jodne ka kram; chargeback ki asli samay-seema gateway ke terms se (tathya).
- **Dummy me kya:** test mode me failed payment ka scenario.
- **Status:** Jaancha (circular aur PA Direction primary; card-not-present row ka number nahi padha).

### L-114. Points, promo credit, wallet aur gift cards: PPI (L-092 samet)

- **Kya jaanchna tha:** loyalty points (D-173, D-174), store credit nahi (D-177), gift cards (D-179) RBI ke prepaid niyam me aate hain ya nahi; points ki expiry ki suchna.
- **Kanoon kya kehta hai:** PPI wo instrument jisme rakhe gaye value se saamaan aur sevaayein khareedi jaati hain [S-H3 Q2]. **Closed system PPI** (sirf usi entity ka saamaan ya seva, cash nahi) ko RBI authorisation nahi chahiye, **par wo teesre ke saamaan ya seva ke liye istemaal nahi ho sakta** (Q7). Marketplace pe gift card se doosre sellers ka maal kharidna teesre ke liye payment hai, to wo closed system nahi rehta; aisa PPI authorised issuer hi de sakta hai (Claude ki padhai; FAQ seedha marketplace ka naam nahi leta). Gift PPI: ek card zyada se zyada ₹10,000, reload nahi, cash-out nahi (sirf holder ki marzi se source account me wapas), holder ke kehne pe revalidate (Q25). PPI ki validity kam se kam 1 saal last loading se, aur expiry issue ke waqt batana (Q39). Loyalty points ya cashback PPI hain ya nahi, FAQ me nahi.
- **Source:** [S-H3] Q2, Q7, Q25, Q39. Gift voucher ka GST CL-022 me (pehle run me).
- **Hamare faisle se mel:** D-177 (store credit aur wallet nahi) PPI ka jokhim hi hata deta hai: mel. D-173 (points sirf kharid pe milein, cash nahi, transfer nahi) points ko "chhoot" banata hai, khareedi hui value nahi: PPI se bahar dikhta hai, par pakka nahi. **D-179 (gift cards) me jokhim:** platform ka gift card jisse kisi bhi seller ka maal kharida jaaye, closed system nahi; khud issue karne ke liye RBI authorisation chahiye hogi (jo hamare paas nahi), aur ₹500/₹1,000/₹2,000 ₹10,000 se kam hain to us seema me hai.
- **Prastaav:** (1) gift card sirf kisi RBI-authorised PPI issuer ke zariye (unka product, hamara checkout), ya R2 me na banayein; khud ka gift card nahi; validity kam se kam 1 saal aur expiry issue pe dikhe; (2) points: kabhi paise se khareede na ja sakein, cash ya transfer nahi, aur Terms me "points chhoot hain, paisa nahi" (D-173 jaisa); (3) points ki expiry (D-174: 12 mahine, 30 din pehle yaad) Terms aur points page pe saaf; ye kanoon ka tay number nahi, consumer kanoon (saaf jaankari) ka maamla; (4) goodwill coupon (D-177) bhi kabhi paise me nahi.
- **Dummy me kya:** gift card ka design aur test-mode flow; koi asli issuer nahi.
- **Status:** Aadha jaancha (gift card pe niyam primary FAQ se; marketplace pe lagna aur points ka darja vyakhya; Master Direction ka abhi ka version nahi khola).

### L-115. Recurring payment mandate

- **Kya jaanchna tha:** "dobara kharid" (D-178) me mandate ke niyam lagte hain ya nahi.
- **Kanoon kya kehta hai:** E-mandate Framework 2026 cards, PPI aur UPI ke recurring transactions pe: ₹15,000 tak bina AFA (kuch shreniyon pe ₹1,00,000), debit se kam se kam 24 ghante pehle issuer ki suchna, customer kabhi bhi mandate badle ya waapas le. Merchant pe seedhi zimmedari nahi; acquirer dekhe ki merchant niyam maane.
- **Source:** [S-H4].
- **Hamare faisle se mel:** D-178 niyam 3 ("koi pehle se payment nahi", har baar customer khud order kare) me mandate hai hi nahi: mel. Niyam abhi laagu nahi.
- **Prastaav:** kuch nahi; agar kabhi subscription aaye to ye framework dekhna.
- **Dummy me kya:** kuch nahi.
- **Status:** Jaancha.

## 6. I: Gig delivery partners

**Is area ke sources (sab 2026-11-20 ko khole):**

- **[S-I1]** Code on Social Security 2020 (No. 36 of 2020), Gazette of India Extraordinary, 29 Sep 2020, PRS ki copy: <https://prsindia.org/files/bills_acts/acts_parliament/2020/Code%20On%20Social%20Security,%202020.pdf>. Primary document, secondary host; mool 2020 ka text.
- **[S-I2]** PIB ka saar "Code on Social Security, 2020: Towards Universal and Inclusive Social Protection" (22 Nov 2025): <https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251122702601.pdf>. Primary (sarkari saar).
- **[S-I3]** Code ke laagu hone ki tareekh 21 Nov 2025 aur Social Security (Central) Rules 2026 ka hawala (search ke nateeje aur Chambers ka lekh): <https://chambers.com/articles/epf-compliance-in-the-gig-economy-is-indias-new-social-security-framework-enough>. Secondary.
- **[S-I4]** Social Security (Central) Rules 2026, G.S.R. 344(E), 8 May 2026, PRS ka saar: <https://prsindia.org/billtrack/the-social-security-central-rules-2026>. Secondary (gazette <https://egazette.gov.in/WriteReadData/2026/272366.pdf> TLS ki galti se nahi khula). **(naya)**
- **[S-I5]** Maharashtra Gig and Platform Workers Rights and Protection Bill 2026 (L.A. Bill No. XXVI of 2026, 3 Jul 2026) ka saar: <https://teamleaseregtech.com/updates/article/57603/maharashtra-gig-and-platform-workers-rights-and-protection-bill-2026/>. Secondary; bill pass hua ya nahi, nahi mila. **(naya)**
- **[S-I6]** Income-tax Act 2025 s.393(1) me contractor ka TDS (purana s.194C): search ke nateeje (India Briefing, TaxTMI waghera). Secondary; incometaxindia.gov.in ne 403 diya.
- labour.gov.in aur pib.gov.in ke press pages ne 403 diya.

### L-116. Gig partners: Social Security Code, aggregator ka contribution aur registration, state ke niyam, kamaai se kaat

- **Kya jaanchna tha:** gig delivery partners (D-033) ke liye aggregator ki zimmedariyan, contribution, registration, state kanoon, aur kamaai se kaat (D-068, D-103).
- **Kanoon kya kehta hai:** "aggregator" = buyer ya user ko seller ya seva dene wale se jodne wala digital intermediary ya marketplace (s.2(2)); "gig worker" = paramparik employer-employee rishte ke bahar kaam karke kamaane wala (s.2(35)); "platform worker" (s.2(60), (61)). Seventh Schedule ki shreniyon me **"Logistic services"** aur **"e-Market place (marketplace aur inventory dono model)"** dono hain, to hamara platform aggregator ki shreni me aata dikhta hai. Gig aur platform workers 16+ ho to registration (self-declaration, Aadhaar ke saath) (s.113). Sarkar ki schemes; unme aggregators ki bhoomika (s.114(1), (2)). **Contribution:** aggregator ke saal ke turnover ka 1% se 2% (sarkar notify kare), par gig aur platform workers ko diye paise ke **5% se zyada nahi**; turnover me tax nahi gina jaata; contribution kab se, sarkar notify karegi (s.114(4), (5)). Code 21 Nov 2025 se laagu [S-I3, secondary]; Central Rules 2026 (8 May 2026): workers portal pe khud register; aggregator rules laagu hone ke 45 din me saare maujooda workers ki details portal pe, aur naye workers ki real-time ya roz; scheme ke liye pichhle saal ek aggregator ke saath kam se kam 90 din (kai ke saath 120 din) [S-I4, secondary]. Contribution shuru hone ki notification is run me nahi mili. **Maharashtra:** 3 Jul 2026 ka ek bill (welfare board, aggregators ka contribution, shikayat ka raasta) [S-I5]; pass hua ya nahi, aur kaat, termination ya payment ke niyam kya hain, nahi mila. Doosre rajyon (Karnataka, Rajasthan) ke kanoon wahan kaam shuru karne pe hi.
- **Source:** [S-I1] s.2(2), 2(35), 2(60), 2(61), 113, 114 aur Seventh Schedule; [S-I2]; [S-I3]; [S-I4]; [S-I5].
- **Hamare faisle se mel:** D-033 (gig partners, apni gaadi) aur D-104 (har kaam pe rakam, hafte me payout) kanoon ke dhaanche me baithte hain. **Kami:** (1) workers ki details portal pe dene ka kaam (45 din, phir roz) kisi faisle ya D-134 ki row me nahi; (2) contribution ka hisaab (turnover ka 1-2%, partner payouts ke 5% ki chhat) finance me nahi; (3) har partner ke din ginne ka record (90 / 120 din) chahiye; D-104 niyam 3 ka "R1 me kaunsa parcel kis partner ne" isi ka aadhaar hai. Kamaai se kaat (D-068, D-103) pe central Code me koi seedhi rok nahi mili; Maharashtra ka bill aaye to dobara dekhna.
- **Prastaav:** (1) D-134 ki table me "Gig workers (Social Security Code)" row: partner ka portal wala number (UAN jaisa) ka field, roz ke engagement ka export (portal ke format pe, API baad me), aur saal ke engagement din ki ginti; (2) finance me contribution ki provision ka hisaab (dummy rate, setting me), jab tak sarkar shuru ki tareekh notify na kare; (3) kaat (D-068) ke har maamle ka likhit kaaran aur partner ko dikhe, aur partner ka appeal (Maharashtra ke kanoon ke liye pehle se tayyar); (4) state ke kanoon ki ek row har state ke liye (D-037 expansion ke saath).
- **Dummy me kya:** partners dummy; portal ka export sirf file, kisi asli portal pe kabhi upload nahi; portal number "DUMMY".
- **Status:** Aadha jaancha (Code ka text primary; laagu hone ki tareekh, Rules aur Maharashtra bill secondary).

### L-117. Partner ke payouts pe income-tax TDS

- **Kya jaanchna tha:** delivery partner ko diye payouts pe TDS.
- **Kanoon kya kehta hai:** secondary sources ke hisaab se 1 Apr 2026 se contractor ke payment ka TDS Income-tax Act 2025 s.393(1) ki table (pehle s.194C) me: individual ya HUF pe 1%, baaki pe 2%; ek payment ₹30,000 ya saal me ₹1,00,000 se upar pe (threshold sirf ek guide me mila); PAN na ho to zyada rate. Delivery jaisa maal le jaane ka kaam "work" me aata hai ya nahi, primary text se nahi jaancha.
- **Source:** [S-I6] secondary.
- **Hamare faisle se mel:** D-104 (har kaam pe rakam, hafte me payout) se saal ka jod ₹1,00,000 paar kar sakta hai; TDS ka kaam kisi faisle me nahi.
- **Prastaav:** partner onboarding me PAN (encrypted, SR-063); finance me partner ka saal ka jod aur seema paar hote hi kaat ka niyam (rate aur seema settings me, CA se pakka); partner ko payout statement me TDS ki line. CA se pakka: s.393 ka sahi item aur threshold.
- **Dummy me kya:** dummy PAN; TDS ka sirf hisaab, koi asli challan nahi.
- **Status:** Aadha jaancha.

### L-118. Partner ki location aur photo

- **Kya jaanchna tha:** delivery ke waqt partner ki location aur parcel ki photo (D-072) ke niyam.
- **Kanoon kya kehta hai:** partner bhi Data Principal hai; DPDP ke consent aur notice (s.5, 6) partner pe bhi. "Employment" wala legitimate use (s.7(i)) employee ke liye hai; gig partner employee nahi (D-033), to consent aur notice ka raasta saaf. Kanoon ke kehne pe sarkar ko jaankari dena (jaise Social Security portal) s.7(d) me aata dikhta hai. Security aur logs rule 6; samay L-103.
- **Source:** [S-E1] s.5, 6, 7; [S-E2] rule 6, 8; [S-I4].
- **Hamare faisle se mel:** D-072 (code na mile to photo aur location), D-191 (180 din, kaun dekhe), D-201 niyam 3 (partner ko customer ki jaankari sirf active parcel tak), SR-061 (photo ka EXIF hatna) mel khaate hain. Kami: partner ke liye alag notice aur consent ka kram likha nahi; location sirf delivery ke pal ki ho ya poore raaste ki, saaf nahi.
- **Prastaav:** Delivery app me partner ke liye notice: location sirf "delivered" aur "fail" ke pal pe (lagatar tracking nahi), photo sirf parcel ki (chehra nahi), kitne din (D-191), kaun dekhe; Social Security portal ke liye details dena bhi notice me. Lagatar location kabhi chahiye ho to alag consent.
- **Dummy me kya:** dummy partners, test locations.
- **Status:** Jaancha (s.7(i) employee ki baat karta hai, aur Code ki paribhasha gig worker ko employer-employee rishte ke bahar rakhti hai).

## 7. J: Warehouse, transport aur environment

**Is area ke sources (sab 2026-11-20 ko khole):**

- **[S-J1]** Maharashtra Fire Prevention and Life Safety Measures (Amendment) Act 2023 (Mah. Act No. XXIV of 2023), Maharashtra Government Gazette me chhapa text, mahafireservice.gov.in: <https://mahafireservice.gov.in/directorate/fire-act/2023/English.pdf>. Primary. Mool Act ka s.3(3) (saal me do baar certificate) sirf search ke saar se: secondary.
- **[S-J2]** Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) (Amendment) Bill 2025 (L.A. Bill No. LXXXIX of 2025, 8 Dec 2025 ko pesh; Ordinance VIII of 2025, 1 Oct 2025 ki jagah), Gazette me chhapa text, PRS ki copy: <https://prsindia.org/files/bills_acts/bills_states/maharashtra/2025/Bill89of2025MH.pdf>. Primary document, secondary host; bill pass hua ya nahi, nahi mila. **(naya)**
- **[S-J3]** Plastic Waste Management (Amendment) Rules 2022, G.S.R. 133(E), 16 Feb 2022 (Schedule II: EPR guidelines), TNPCB ki copy: <https://tnpcb.gov.in/owems/pdf/regulations/4th%20Amendment%20(EPR%20guidelines)%20Feb%202022.pdf>. Primary (sarkari site pe gazette).
- **[S-J4]** Plastic Waste Management (Amendment) Rules 2024, G.S.R. 201(E), 14 Mar 2024, TNPCB ki copy: <https://tnpcb.gov.in/owems/pdf/regulations/Plastic_Waste_Management_Amendment_Rules_2024.pdf>. Primary.
- **[S-J5]** E-way bill ki seema aur kai invoices ka niyam: search ke nateeje (Mondaq, ClearTax, Zoho). Secondary; ewaybillgst.gov.in aur CBIC nahi khule.
- **[S-J6]** Solid Waste Management Rules 2026 (27 Jan 2026 notify, 1 Apr 2026 se): search ke nateeje (PIB ke hawale wali khabrein). Secondary. **(naya)**
- **[S-J7]** Gas Cylinders Rules 2016 me "gas cylinder" ki paribhasha (500 ml se bade dhaatu ke container): search ka saar. Secondary; peso.gov.in ne TLS certificate ki galti di.

### L-119. Jalne wala maal (perfume, nail polish, aerosol): rakhna, le jaana, fire NOC

- **Kya jaanchna tha:** warehouse aur hub me jalne wale cosmetics rakhne aur do-pahiya pe le jaane ke niyam; fire NOC.
- **Kanoon kya kehta hai:** Maharashtra Fire Act me imaaraton ki shreniyan Schedule I me; **storage buildings** "(H)" shreni hain, aur "Industrial Building" me storage aur hazardous occupancies shaamil [S-J1]. 2023 ke badlav se Provisional Fire Safety Approval (plan ke waqt), Final Fire Safety Approval (occupancy se pehle) aur Renewal ka dhaancha; kuch imaaraton pe automated continuous monitoring [S-J1]. Mool Act ke s.3(3) me owner ya occupier licensed agency ka certificate saal me do baar (January aur July) deta hai [secondary]. Aerosol: Gas Cylinders Rules ki "gas cylinder" paribhasha 500 ml se bade dhaatu ke container ki hai, to aam deodorant jaise chhote cans us paribhasha ke bahar dikhte hain [S-J7, secondary]. Perfume (alcohol) aur nail polish (solvents) Petroleum Rules ki "petroleum" paribhasha me aate hain ya nahi, aur do-pahiya pe le jaane ke (Motor Vehicles ke dangerous goods) niyam, is run me primary se nahi jaanche.
- **Source:** [S-J1]; [S-J7] secondary.
- **Hamare faisle se mel:** D-134 ki table me fire NOC ki row; D-014 (ek warehouse) aur D-027 (transporter). Kami: warehouse me jalne wale maal ka alag hissa (segregation), ginti ki seema aur delivery bag me ginti ki seema kisi faisle me nahi.
- **Prastaav:** (1) warehouse aur hub ke record me: Fire Safety Approval (provisional, final, renewal) ki tareekh aur saal me do baar wala certificate (January, July) ki yaad; (2) catalog me "jalne wala" (flammable) ka flag (perfume, nail polish, remover, aerosol, alcohol wale toner); warehouse me inka alag rack; ek delivery bag me inki ginti ki seema (setting); (3) lawyer ya fire consultant se pakka: Petroleum Rules aur dangerous goods transport ke niyam hamare maal pe lagte hain ya nahi.
- **Dummy me kya:** approvals aur certificates ki tareekhein "DUMMY"; flag asli data jaisa.
- **Status:** Aadha jaancha.

### L-120. Warehouse aur hub ka Shops and Establishments registration

- **Kya jaanchna tha:** Maharashtra me warehouse (Chakan) aur hub ka registration.
- **Kanoon kya kehta hai:** Maharashtra S&E Act 2017 me registration (s.6) aur chhote establishments ki intimation (s.7) workers ki ginti pe tike hain. 1 Oct 2025 ke Ordinance (aur uski jagah 8 Dec 2025 ko pesh bill) ne seema **10 se 20** workers ki: 20 ya zyada pe registration (s.6), kam pe intimation (s.7); s.1(3) ki laagu hone ki seema bhi 20 [S-J2]. Bill pass hua ya Ordinance laagu hai, is run me pakka nahi hua (secondary search ke hisaab se 2025 me badlav hua).
- **Source:** [S-J2] (primary document, secondary host).
- **Hamare faisle se mel:** D-134 ki S&E row mel khaati hai; workers ki ginti kisi faisle me nahi.
- **Prastaav:** warehouse aur hub ke record me workers ki ginti aur us hisaab se "registration" ya "intimation" ka field, number aur tareekh; seema setting me (10 ya 20), lawyer se pakka.
- **Dummy me kya:** registration number "DUMMY".
- **Status:** Aadha jaancha.

### L-121. E-way bill (warehouse se hub, kai sellers ka parcel)

- **Kya jaanchna tha:** warehouse aur hub ke beech aur kai sellers wale parcel pe e-way bill.
- **Kanoon kya kehta hai:** secondary sources: inter-state pe ₹50,000 se zyada ki consignment pe e-way bill; Maharashtra me intra-state ki seema ₹1,00,000 (state notification number nahi mila); ek e-way bill ek invoice ka; ek gaadi me kai consignments ke liye consolidated e-way bill (Form GST EWB-02). Kai chhote invoices ek gaadi me hon to kul rakam gini jaaye ya har invoice alag, sources me mat-bhed.
- **Source:** [S-J5] secondary. GST ka baaki hissa pehle run me (CL-001 se CL-024).
- **Hamare faisle se mel:** D-027 (har trip ka manifest, transporter, gaadi number) e-way bill ke liye zaroori data deta hai: mel. D-077 (ek parcel me kai sellers ke invoices) me har invoice alag hai.
- **Prastaav:** manifest me har invoice ki rakam aur kul; invoice ₹50,000 / ₹1,00,000 (setting) paar kare to e-way bill number ka field aur bina uske dispatch pe rok; consolidated e-way bill ka field trip pe. CA se pakka: Maharashtra ki seema aur kai chhote invoices wala niyam.
- **Dummy me kya:** e-way bill number "DUMMY"; portal pe kuch nahi.
- **Status:** Aadha jaancha.

### L-122. Plastic EPR ka packaging data

- **Kya jaanchna tha:** plastic EPR (D-045) me kaunsa data rakhna hai.
- **Kanoon kya kehta hai:** EPR guidelines me obligated entities: producer, importer, aur **"Brand Owners including online platforms/marketplaces and supermarkets/retail chains"**, micro aur small enterprises ko chhod ke (clause 4(iii)). Plastic packaging ki chaar shreniyan: I rigid; II flexible (single ya multilayer plastic, sheets, carry bags, sachet, pouch); III multilayered (plastic + doosra material); IV compostable sheets aur carry bags (clause 5.1). Saare obligated entities CPCB ke centralised portal pe register (6.1); bina registration business nahi (6.2); aur **registered entity kisi unregistered entity se len-den nahi karegi** (6.3); har state ki alag registration jahan units hon (6.5); registration me PAN, GST, CIN aur authorised person ki pehchaan (6.6); targets aur saal ka return (7). 2024 ke badlav ne producer, importer, manufacturer ki paribhasha badli [S-J4].
- **Source:** [S-J3] clauses 4, 5.1, 6, 7; [S-J4].
- **Hamare faisle se mel:** D-045 (hum MSE nahi, EPR laagu, dummy registration) kanoon ke clause 4(iii) se mel khaata hai. **Kami:** (1) clause 6.3: sellers (jo khud brand owner ya importer hain aur MSE nahi) ka EPR registration seller onboarding me nahi maanga jaata; (2) apni packaging (shipping box, polybag, tape, bubble wrap) ka shreni ke hisaab se wazan aur saal ka hisaab kisi faisle me nahi.
- **Prastaav:** (1) seller onboarding me "EPR registration number (plastic)" ya "MSE hai" ki ghoshna (Udyam ke saath), aur bina iske live nahi (D-134 me L2); (2) packaging material ki master list (shreni I se IV, har unit ka wazan) aur har dispatch pe istemaal ka record, mahine aur saal ka jod; (3) saal ke return ka report finance ya operations me.
- **Dummy me kya:** EPR registration "DUMMY"; wazan ke number misaal.
- **Status:** Jaancha.

### L-123. Expired ya toote cosmetics nasht karna

- **Kya jaanchna tha:** expired ya toote maal (D-062, D-063) ko nasht karne ke niyam.
- **Kanoon kya kehta hai:** Solid Waste Management Rules 2026 (1 Apr 2026 se, 2016 ke rules ki jagah) me source pe chaar hisson me alag karna: geela, sookha, sanitary aur "special care" waste; expired dawaiyan special care me; bulk waste generator (20,000 sq m se bada area ya roz 100 kg se zyada waste) pe alag zimmedariyan [S-J6, secondary]. Expired cosmetics ka naam kisi source me nahi mila. Cosmetics Rules me nasht karne ka niyam pehle run me nahi mila (CL-053).
- **Source:** [S-J6] secondary.
- **Hamare faisle se mel:** D-062 (brand ko wapas ya disposal fee ke saath nasht) mel khaata hai; nasht karne ka tareeka aur saboot tay nahi.
- **Prastaav:** nasht sirf authorised waste handler se, "certificate of destruction" ki copy batch ke record me; jalne wale aur aerosol alag; nasht ka record (batch, ginti, tareekh, handler) recall aur audit ke liye; lawyer se pakka: cosmetics special care waste hain ya hazardous.
- **Dummy me kya:** handler "DUMMY", certificate ka specimen.
- **Status:** Aadha jaancha.

### L-139. E-waste (naya point)

- **Kya jaanchna tha:** agar kabhi beauty appliances (hair dryer, trimmer jaise) bikein to e-waste ke niyam.
- **Kanoon kya kehta hai:** E-Waste (Management) Rules 2022 me EPR "producer" (brand ya importer) pe hai; marketplace pe kya, aur kaunse appliances Schedule I me hain, is run me primary se nahi padha (sirf 8 Mar 2024 ka chhota badlav, G.S.R. 164(E), khula).
- **Source:** jaancha nahi.
- **Hamare faisle se mel:** D-029 (sirf beauty aur personal care) appliances ko na mana karta hai na saaf shaamil karta hai.
- **Prastaav:** catalog ki category me "electrical appliance" ka flag; aisa product aane se pehle seller ka e-waste EPR registration aur ye point dobara jaanchna.
- **Dummy me kya:** kuch nahi.
- **Status:** Jaancha nahi.

## 8. K: Health aur AYUSH

**Is area ke sources (sab 2026-11-20 ko khole):**

- **[S-K1]** Drugs and Magic Remedies (Objectionable Advertisements) Act 1954, 1963 ke badlav samet, Tripura High Court ki site pe: <https://thc.nic.in/Central%20Governmental%20Acts/Drugs%20and%20Magic%20Remedies%20(Objectionable%20Advertisement)%20Act,%201954.pdf>. Primary (sarkari site).
- **[S-K2]** Feb 2020 ka draft DMR (Amendment) Bill (Schedule badhana; jaise "premature ageing", "premature greying of hair", "fairness of skin"): search ke nateeje (SCC Online, Mondaq). Secondary; sirf draft, pass hone ka saboot nahi.
- **[S-K3]** Telemedicine Practice Guidelines (2020) ka saar, NRCeS (C-DAC, MoHFW ka standards kendra): <https://nrces.in/standards/telemedicine-practice-guidelines>. Saar (secondary jaisa); mool PDF (MoHFW) 504 se nahi khula.
- **[S-K4]** Drugs and Cosmetics Act 1940 aur Rules 1945 (CDSCO, "as amended up to 31 December 2016"): <https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/acts_rules/2016DrugsandCosmeticsAct1940Rules1945.pdf>. Primary, par 2016 tak ka.
- **[S-K5]** Rule 170 (ASU drugs ke vigyapan) ka hatna (1 Jul 2024 ki notification), Supreme Court ka stay (27 Aug 2024) aur stay hatna (11 Aug 2025): LiveLaw aur Bar & Bench ki khabrein. Secondary. **(naya)**

### L-124. Dermatologist jaise expert ki online consultation

- **Kya jaanchna tha:** Skin & Hair Expert ki Google Meet consultation (D-025, D-172) pe telemedicine ke niyam.
- **Kanoon kya kehta hai:** Telemedicine Practice Guidelines sirf **Registered Medical Practitioner (RMP)** ke liye hain (State ya Indian Medical Register me darj). RMP apna naam, qualification aur registration number bataye; prescription aur electronic sanchaar pe registration number. Patient anjaan nahi: naam, umar, pata jaisi pehchaan; patient khud shuru kare to consent implied, warna saaf consent record me. Dawaiyan sirf tay lists (O, A, B) se; Schedule X aur NDPS wali mana. Record (call, chat, video ke logs, prescription) rakhna. **Technology platform:** listed RMP ka registration jaanche, naam, qualification, registration number aur contact dikhaye, shikayat ka raasta de; AI patient ko counsel ya prescribe nahi kar sakta. Niyam todne wala platform blacklist ho sakta hai [S-K3]. 2022 me naye version ka draft aaya tha; final hua ya nahi, nahi mila.
- **Source:** [S-K3] (saar); [S-E1] s.6 ki misaal telemedicine app ki hi hai (sirf zaroori data).
- **Hamare faisle se mel:** D-025 (expert ek staff role, Meet link, notes sehat ka data, consent pehle) aur D-172 (muft, seema) dhaanche me theek. **Kami:** (1) "Skin & Hair Expert" RMP (dermatologist) hai ya beauty expert, tay nahi; agar RMP nahi, to wo medical salah, nidaan ya dawa nahi de sakta; (2) RMP ho to platform pe registration ki jaanch aur display, pehchaan, aur prescription ke niyam kisi faisle me nahi.
- **Prastaav:** owner chune: (a) expert = beauty aur skincare salah (bina nidaan, bina dawa), page pe saaf "ye medical consultation nahi"; ya (b) expert = RMP, to role pe registration number ka field, staff jaanch, profile pe dikhana, notes me patient ki pehchaan, "dawa ki salah sirf RMP aur lists ke hisaab se", aur record ka samay (D-208). Dono me koi AI jawab nahi.
- **Dummy me kya:** expert ka registration number "DUMMY"; consultation sirf dummy customers ke saath.
- **Status:** Aadha jaancha (guidelines ka saar, mool PDF nahi khula).

### L-125. AYUSH drug licence ki detail

- **Kya jaanchna tha:** Ayurvedic, Siddha, Unani (ASU) drugs ke licence aur label ki pehchaan, taaki D-128 ki rok sahi chale.
- **Kanoon kya kehta hai:** ASU drugs banane ka licence Drugs Rules Part XVI me (rule 153 se 157; licence Form 25-D) [S-K4]. Rule 161(3): ASU drug ke label pe naam, net content, manufacturer, **"Mfg. Lic. No." / "M.L."**, batch number, mfg date, aur **"Ayurvedic medicine" / "Siddha medicine" / "Unani medicine"** ke shabd; bahar lagane wali pe "FOR EXTERNAL USE ONLY"; patent ya proprietary ASU drug pe saare ingredients (rule 161(1)). Act s.33EEB aur 33EEC banane aur bechne pe niyam dete hain. Rule 170 (ASU vigyapan ke liye state ki manzoori) 1 Jul 2024 ki notification se hataya gaya; Supreme Court ne us pe stay lagaya, phir 11 Aug 2025 ko stay hata diya [S-K5, secondary]. DMR Act ASU drugs pe bhi laagu (L-130).
- **Source:** [S-K4] rules 153 se 157, 161; Act s.33EEB, 33EEC (2016 tak ka text); [S-K5] secondary.
- **Hamare faisle se mel:** D-128 (drug aur AYUSH drug listing pe nahi) aur D-246 (AYUSH label pe drug type) mel khaate hain.
- **Prastaav:** listing ki label checklist me rok ke ishare: label pe "Ayurvedic/Siddha/Unani medicine", "Ayurvedic Proprietary Medicine", Form 25-D wala M.L. number, ya "Physician's sample" dikhe to listing reject (cosmetic nahi). "Herbal cosmetic" jo cosmetic licence pe bane, wo cosmetic hi (pehle run ka CL-047).
- **Dummy me kya:** test listing jisme AYUSH label ho, rok dikhane ke liye.
- **Status:** Aadha jaancha (Rules ka text 2016 tak; rule 170 ki halat secondary).

### L-130. Ilaaj jaise daawe aur Drugs and Magic Remedies Act

- **Kya jaanchna tha:** listings, seller ke content aur reviews me ilaaj jaise daawe (D-137, D-146) DMR Act me kahan tak jaate hain.
- **Kanoon kya kehta hai:** "drug" me insaan ke andar ya bahar istemaal ki dawa, bimari ke ilaaj ya rok ka padarth, aur (khaana chhod ke) sharir ki banawat ya kaam pe asar dalne wali cheez (s.2(b)). Koi bhi vigyapan me "hissa lena" (chhapna samet, s.2(d)) jo kisi drug ko in kaamon ke liye sujhaye, mana (s.3): garbh girana ya rokna, yaun kshamata, mahwari ki gadbad, aur Schedule ki bimariyan. Schedule me beauty se jude: **"Forms and structure of the female bust"**, **"Leucoderma"**, **"Obesity"**, **"Stature of persons"**, aur "Lupus" [S-K1]. Drug ke baare me jhootha ya gumraah karne wala vigyapan mana (s.4). 2020 ke draft me "premature ageing", "premature greying of hair", "fairness of skin" jaise naam jodne ka prastaav tha, par pass hone ka saboot nahi [S-K2].
- **Source:** [S-K1] s.2, 3, 4, 5 aur Schedule; [S-K2] secondary.
- **Hamare faisle se mel:** D-137 (claims ki list), D-246 ("mana shabdon" ki list), D-146 niyam 4 (reviews ke daawe rahein, upar note) mel khaate hain. Kami: "mana shabd" list me DMR Schedule ke beauty wale shabd (bust/breast badhana, motapa ghatana / fat burn, lambai badhana, safed daag) pakke nahi; listing ka text "vigyapan" hai, aur platform us ke chhapne me "hissa" le sakta hai.
- **Prastaav:** "mana shabdon" ki list me DMR ka ek alag hissa (source: DMR Schedule ka S. No.): bust ya breast badhana ya kasna, motapa ya fat ghatana ka ilaaj, lambai badhana, leucoderma ya safed daag ka ilaaj, yaun kshamata, mahwari; ye seller ke content, description, Creator content aur sponsored me bhi. Reviews me aise daawe D-146 ke note ke saath rahein (review platform ka vigyapan nahi), par sponsored ya "featured" me kabhi nahi.
- **Dummy me kya:** test listing jo rok dikhaye.
- **Status:** Jaancha (Act aur Schedule primary; 2020 ka draft secondary).

## 9. L: IP, contracts aur baaki

**Is area ke sources (sab 2026-11-20 ko khole):**

- **[S-L1]** Trade Marks Act 1999 s.30(3), Indian Kanoon pe: <https://indiankanoon.org/doc/1928889/>. Statute ka text, secondary host (ipindia.gov.in ka Act PDF 404 aaya).
- **[S-L2]** IT Act 2000 s.10A (electronic tareeke se bana contract): search ke nateeje (Indian Kanoon, lawx.in waghera). Secondary.
- **[S-L3]** Commission Decision 2011/833/EU (EU documents ka reuse), EUR-Lex: <https://eur-lex.europa.eu/eli/dec/2011/833/oj/eng>. Page ka text fetch me nahi aaya; sirf search ke saar se. Secondary.
- Consumer Protection (E-Commerce) Rules 2020 aur IT Rules: [S-F4], [S-F1].

### L-126. Brand authorisation, trademark aur nakli maal

- **Kya jaanchna tha:** brand authorisation (D-075) kanoon maangta hai ya nahi, aur trademark aur nakli maal pe platform ki zimmedari.
- **Kanoon kya kehta hai:** kisi kanoon me "brand ka authorisation letter" ki seedhi shart nahi mili. Trade Marks Act s.30(3): jo registered mark wala maal **jaayaz tareeke se kharida** gaya, use aage bechna sirf is wajah se infringement nahi ki proprietor ne use bazaar me daala tha [S-L1]. Yaani asli maal ka distributor bhi bech sakta hai; par nakli ya badla hua maal infringement aur doosre kanoonon (Cosmetics Rules ka "spurious", CPA) me aata hai. Intermediary niyam me user agreement IP todne wala content mana kare (rule 3(1)(b)(iv)) [S-F1]; seller ka content sahi hone ka undertaking (E-commerce rule 5(2), CL-069).
- **Source:** [S-L1]; [S-F1]; pehle run ka CL-069 aur CL-087.
- **Hamare faisle se mel:** D-075 (ek brand ek seller, distributor ke liye authorisation letter, barcode se duplicate ki jaanch) kanoon se zyada sakht, aur nakli maal ka jokhim kam karta hai: mel. D-247 ne listing hatane ki wajahon me trademark aur copyright joda: mel.
- **Prastaav:** (1) seller agreement me: maal asli hai aur jaayaz tareeke se mila, trademark aur product photos ke istemaal ka haq hai, aur nakli nikla to listing band aur kharcha seller ka; (2) brand owner ke liye "IP shikayat" ka raasta (Grievance ke andar ek category), saboot ke saath; (3) photos aur description brand ke hon to seller unke istemaal ka haq ghoshit kare.
- **Dummy me kya:** authorisation letter dummy (D-075).
- **Status:** Aadha jaancha.

### L-127. Bahar ke assets, CosIng aur BIS ke text ka license

- **Kya jaanchna tha:** bahar ke font, icon, image; public ingredient database (CosIng); BIS standards (IS 4707) ka text istemaal karna.
- **Kanoon kya kehta hai:** European Commission ke documents ka reuse Decision 2011/833/EU se chalta hai, jo aam taur pe commercial aur non-commercial reuse ki ijazat deta hai, par teesre ke IP wale hisse aur gumraah karne wala istemaal bahar [S-L3, secondary]; CosIng site ki apni legal notice is run me nahi khuli. BIS standards ke text ka copyright aur unke istemaal ki shartein is run me nahi jaanchi. Fonts aur icons ka license har asset ki apni license file se tay hota hai (koi ek kanoon nahi).
- **Source:** [S-L3] secondary; baaki jaancha nahi.
- **Hamare faisle se mel:** D-074 (pehle ke kaam se kya aaye) aur D-132 (blocklist ka data) me license ki jaanch ki baat pehle se.
- **Prastaav:** (1) har bahar ke asset aur data source ki ek "license list": naam, license, link, attribution ki shart; (2) CosIng se sirf ingredient ke naam aur INCI jaisa tathya, source ke hawale ke saath, aur CosIng ki legal notice padh ke; (3) IS 4707 ki list ka text copy na karein: sirf apni blocklist me har entry ke saath "IS 4707 Part 2 Annex A" ka hawala (D-246), aur standard khareed ke ya lawyer se pakka.
- **Dummy me kya:** kuch nahi.
- **Status:** Aadha jaancha.

### L-128. Seller pe udhaar ki vasooli

- **Kya jaanchna tha:** D-071 (bachi fee udhaar, agle payout se kaat, listings rokna, account band) kanoon me theek hai ya nahi.
- **Kanoon kya kehta hai:** is run me koi khaas kanoon nahi mila jo marketplace ko seller ke udhaar pe rokta ya tareeka batata ho; ye seller agreement (contract) ki baat hai. Payout se kaat (set-off), notice aur jhagde ka raasta contract me likha hona chahiye. Warehouse me rakhe seller ke maal ko udhaar ke badle rokne (lien) ka haq kanoon me kitna hai, nahi jaancha.
- **Source:** jaancha nahi (sirf contract ka aam siddhant).
- **Hamare faisle se mel:** D-071 ke kadam (alert, notice, listings rokna, account band, maal wapas) seller agreement me likhe hon to theek dikhte hain; D-071 maal ko rok ke nahi rakhta, jo kam jokhim wala hai.
- **Prastaav:** seller agreement me: fees aur udhaar ka hisaab, payout se kaat ka haq, notice ke din, listings rokne ki shart, jhagde ka raasta (jaise arbitration ya tay court); maal pe lien chahiye ho to lawyer se.
- **Dummy me kya:** test mode payment link (D-071).
- **Status:** Jaancha nahi.

### L-133. Apne brand ka naam "Unibelle": trademark aur company ka naam (naya point)

- **Kya jaanchna tha:** D-243 ka "Unibelle" (class 3) kisi ka trademark ya milta-julta naam to nahi; "Unibelle Cosmetics Pvt Ltd" aur "Beautinique Pvt Ltd" ke naam.
- **Kanoon kya kehta hai:** jaancha nahi. Is run ke niyam ke hisaab se project se juda koi naam (brand ya company) web search me nahi daala gaya, isliye trademark registry ya company naam ki jaanch nahi hui.
- **Source:** koi nahi.
- **Hamare faisle se mel:** D-243 me pehle se likha hai ki asli business se pehle trademark search zaroori.
- **Prastaav:** owner khud (ya lawyer) IP India ki public trademark search (class 3, aur milte-julte naam, jaise phonetic) aur company naam ki uplabdhta dekhein; asli business se pehle trademark application. Demo me naam dummy hi.
- **Dummy me kya:** dono companies dummy (D-026, D-242).
- **Status:** Jaancha nahi.

### L-140. Click-wrap, Terms aur seller agreement ka electronic contract (naya point)

- **Kya jaanchna tha:** sign-up pe Terms maanna aur seller agreement online maanna kanooni contract hai ya nahi.
- **Kanoon kya kehta hai:** IT Act s.10A: proposal, acceptance aur unka waapas lena electronic roop me ho to contract sirf is wajah se unenforceable nahi [S-L2, secondary]. Contract ke liye dono paksh "competent" (baalig) hon, jo D-038 ki 18+ ghoshna se judta hai. Online seller agreement pe stamp duty lagti hai ya nahi (Maharashtra), is run me nahi jaancha.
- **Source:** [S-L2] secondary.
- **Hamare faisle se mel:** D-150 (pages ka version, bade badlav pe naya consent) aur D-038 (18+) mel khaate hain.
- **Prastaav:** (1) Terms aur seller agreement ka har version immutable, aur kisne, kab, kaunsa version maana ka record (consent record jaisa, L-100); (2) "maanta hoon" ka saaf button ya tick, pehle se tick nahi; (3) seller agreement pe stamp duty aur e-sign ki zaroorat lawyer se (asli business pe).
- **Dummy me kya:** dummy sellers ka "maana" record.
- **Status:** Aadha jaancha.

## 10. Faislon pe asar

Ye faisle dobara nahi khole ja rahe. Har row: kanoon se kahan takrav ya kami dikhi, wajah, aur prastaavit sudhaar. Badlav sirf owner ki haan se, "badla" ya "jod" line ke roop me. Kram: sabse zyada jokhim pehle.

| #   | Faisla                                       | Kya mila                                                                                                                                                                                                                               | Kism                        | Prastaavit sudhaar                                                                                                                                                                                                                  | Point                                    |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | D-198 (aur SR-084)                           | Users ko "misaal 72 ghante ke andar". DPDP rule 7(1): asar wale users ko **bina der**; 72 ghante sirf Board ki poori report ki seema (rule 7(2)(b)); Board ko shuruaati suchna bhi bina der; CERT-In ko 6 ghante.                      | Takrav                      | Runbook me teen ghadiyaan: CERT-In 6 ghante, Board ko bina der + 72 ghante me poori report, users ko pakka hote hi (bina der). User email ke paanch hisse rule 7(1) se; breach emails din ki chhat (D-142) me sabse upar.           | L-104, L-110                             |
| 2   | D-179                                        | Platform ka gift card jisse kisi bhi seller ka maal kharida jaaye, closed system PPI nahi (RBI FAQ: closed system teesre ke liye payment nahi kar sakta). Khud issue karne ke liye RBI authorisation chahiye.                          | Takrav ka jokhim            | Gift card sirf kisi RBI-authorised PPI issuer ke zariye (ya R2 me na banana); validity kam se kam 1 saal aur expiry issue pe dikhe; ₹10,000 ki seema.                                                                               | L-114                                    |
| 3   | D-151 niyam 1, SR-066, D-191, D-192, D-208   | DPDP rule 8(3) (13 May 2027 se): har processing ka personal data, traffic data aur logs kam se kam 1 saal, account delete ke baad bhi (rule ki misaal). IT Rules 3(1)(h): registration data account band hone ke 180 din baad tak.     | Takrav ka jokhim            | "1 saal ki kanooni rok" ki class: app se turant hat jaaye, band encrypted store me 1 saal (sirf kanooni maang pe, audit ke saath), phir apne aap erase. Photos aur video pe owner chune (store me 1 saal, ya sirf events aur hash). | L-103, L-109                             |
| 4   | D-136 niyam 5, D-163 niyam 3                 | IT Rules ke 2026 ke badlav (secondary): content ki shikayat ka hal 7 din; 3(1)(b) wale content pe 36 ghante; nagnata/kisi aur ban ke pe 2 ghante; court ya sarkari order pe 3 ghante. "2 kaam ke din" aur "30 din" inse lambe.         | Takrav (secondary se)       | Content ki shikayat ke alag timers (calendar ghante): 24 ghante receipt, nagnata wali report pe turant apne aap chhupna, 36 ghante faisla, 7 din grievance; "kanooni order" ka 3 ghante wala raasta Master ke alert ke saath.       | L-109                                    |
| 5   | D-194, R-024                                 | CERT-In: saare ICT systems ke logs 180 din ka rolling. Render free plan pe logs kitne din, pakka nahi.                                                                                                                                 | Kami                        | Request logs (SR-077) aur security events apne store me kam se kam 180 din; jagah ki ginti R-006 me.                                                                                                                                | L-110                                    |
| 6   | D-045, D-134                                 | EPR guidelines 6.3: registered brand owner kisi unregistered entity se len-den nahi karega. Sellers (jo brand owner ya importer hain, MSE nahi) ka EPR number nahi liya jaata; apni packaging ka shreni-wise wazan nahi.               | Kami                        | Seller onboarding me EPR (plastic) number ya MSE ki ghoshna; packaging master (shreni I se IV, wazan) aur har dispatch ka record; saal ka return.                                                                                   | L-122                                    |
| 7   | D-033, D-104, D-134                          | Social Security Code me hum aggregator ("Logistic services" aur "e-Market place" dono shreniyan). Rules 2026 (secondary): maujooda partners ki details 45 din me portal pe, naye roz ya real-time; scheme ke liye 90/120 din ki ginti. | Kami                        | D-134 me "Gig workers" row; partner pe portal ka number; roz ke engagement ka export (DUMMY); saal ke din ki ginti; contribution ki provision ka hisaab (dar setting me, shuru ki tareekh notify hone tak).                         | L-116                                    |
| 8   | D-151 niyam 2                                | DPDP s.14: nomination ka haq; s.11(1)(b): data kin doosre Data Fiduciaries aur Processors ke saath baanta, unki pehchaan. Dono D-151 me nahi.                                                                                          | Kami                        | R2 ke data haq me nomination ka form aur record; data ke saar me sellers (order ke hisaab se) aur processors ki shreniyan.                                                                                                          | L-102                                    |
| 9   | D-150                                        | DPDP rule 3: alag, itemised notice (har maqsad, data, waapsi ka link, haq, Board). IT Rules 3(1)(c) (2026, secondary): har 3 mahine users ko niyam todne ke nateeje batana; 3(1)(b) ki list Terms me; Grievance Appellate Committee.   | Kami                        | Sign-up pe "Data notice" (Privacy page se alag); Privacy page me data ki jagah (Singapore), processors, samay, 1 saal ki rok; Terms me 3(1)(b) ki list; har 3 mahine in-app suchna; grievance jawab me appeal ka raasta.            | L-100, L-109, L-131                      |
| 10  | D-025, D-172                                 | Telemedicine guidelines sirf RMP ke liye; platform RMP ka registration jaanche aur dikhaye; AI counsel ya prescribe nahi. "Skin & Hair Expert" RMP hai ya nahi, tay nahi.                                                              | Kami                        | Owner chune: beauty salah (bina nidaan ya dawa, "medical consultation nahi" ki line) ya RMP (registration ka field, jaanch, display, pehchaan, dawa ke niyam).                                                                      | L-124                                    |
| 11  | D-241, D-237                                 | DPDP rule 9: processing ke sawalon ka jawab dene wale insaan ka contact website pe aur haq ke har jawab me. CERT-In: Point of Contact. Dono kisi role pe nahi.                                                                         | Kami                        | Privacy contact = Grievance Officer ya alag role (owner chune); CERT-In Point of Contact = owner ka security role; dono role wale staff account se (D-241).                                                                         | L-134, L-110                             |
| 12  | D-246 ("mana shabd")                         | DMR Act s.3 aur Schedule: bust/breast ki banawat, motapa, lambai, leucoderma, yaun kshamata, mahwari ke ilaaj ke vigyapan mana.                                                                                                        | Kami                        | "Mana shabdon" me DMR ka alag hissa, har shabd ke saath Schedule ka S. No.; seller content, description, Creator aur sponsored me bhi.                                                                                              | L-130                                    |
| 13  | D-203                                        | DPDP me "legitimate interest" nahi; device cookie, address aur payment ki pehchaan ka milaan notice me ek maqsad ki tarah likha nahi.                                                                                                  | Kami                        | Notice aur Terms me "per-customer seemaayein aur galat istemaal ki rok" ka maqsad; cookie sirf isi kaam ke liye.                                                                                                                    | L-107                                    |
| 14  | D-104                                        | Partner payouts pe contractor ka TDS (s.393(1), pehle 194C; secondary): saal ka jod seema paar kare to kaat.                                                                                                                           | Kami                        | Partner ka PAN (encrypted), saal ka jod, kaat ka niyam settings me (CA se pakka), payout statement me TDS.                                                                                                                          | L-117                                    |
| 15  | D-058                                        | RBI ka payment data India me rakhne ka niyam payment system providers aur unke vendors pe; merchant pe seedha lagta hai ya nahi, saaf nahi. CERT-In FAQ Q36: financial transactions ke records Indian jurisdiction me.                 | Jokhim (faisla nahi khulta) | Payment ka kam se kam data (ids, rakam, status); gateway se likhit pakka karna; asli business se pehle region dobara dekhne ki yaad COMPLIANCE ke "nazar" me.                                                                       | L-111                                    |
| 16  | D-134 (table)                                | Rows ya fields kam: Fire Safety Approval (provisional, final, renewal) aur saal me do baar certificate; S&E ki seema (Maharashtra me 2025 se 20 workers); e-way bill ka number; gig workers; seller ka EPR number; CERT-In ka PoC.     | Kami                        | Table me ye rows, warehouse aur hub ke record me fields aur yaad (sab DUMMY numbers).                                                                                                                                               | L-110, L-116, L-119, L-120, L-121, L-122 |
| 17  | D-093                                        | PA Direction me marketplace PA ka merchant hai; apne account me sellers ka paisa rakhne pe RBI text seedha kuch nahi kehta.                                                                                                            | Chhota jokhim               | Ledger me sellers ka paisa liability, alag dikhe; seller agreement me payout ke din; lawyer se pakka; baad me linked account wala raasta.                                                                                           | L-112                                    |
| 18  | D-038                                        | DPDP me child = 18 se kam; sirf ghoshna kaafi hai ya nahi, kanoon me saaf nahi.                                                                                                                                                        | Chhoti kami                 | Umar ki ghoshna ka tick consent record me; child pata chale to account band aur erase; lawyer se pakka.                                                                                                                             | L-135                                    |
| 19  | D-111                                        | RBI TAT: paisa kata par merchant ko pakki suchna nahi (UPI, card PoS T+5). "Paisa kata, order nahi bana" ka kram kisi faisle me nahi.                                                                                                  | Chhoti kami                 | Us haalat ki screen aur email (bank ki TAT), late "captured" pe apne aap refund (idempotent).                                                                                                                                       | L-113                                    |
| 20  | D-072, D-191                                 | Partner bhi Data Principal; uske liye notice aur consent ka kram nahi; location lagatar ya sirf pal ki, saaf nahi.                                                                                                                     | Chhoti kami                 | Delivery app me partner ka notice; location sirf "delivered" aur "fail" ke pal pe; lagatar tracking ke liye alag consent.                                                                                                           | L-118                                    |
| 21  | D-062                                        | Nasht karne ka tareeka aur saboot tay nahi; SWM Rules 2026 me "special care" waste (secondary).                                                                                                                                        | Chhoti kami                 | Sirf authorised handler, certificate of destruction batch ke record me, jalne wale alag.                                                                                                                                            | L-123                                    |
| 22  | SR-064 (D-216)                               | Aadhaar Regulations reg. 6(5) (2025): Aadhaar wala dastavez maqsad se zyada der nahi.                                                                                                                                                  | Chhoti kami                 | Upload form pe "Aadhaar ki copy mat bhejein"; galti se aayi copy reject aur turant delete.                                                                                                                                          | L-105                                    |
| 23  | Koi faisla nahi (D-011, D-056, D-057, D-058) | DPDP s.8(2) aur rule 6(1)(f): processors sirf contract se, security ki shart ke saath.                                                                                                                                                 | Chhoti kami                 | Operations doc me processors ki list (kaun, kya data, region, data terms ka link, delete ka tareeka).                                                                                                                               | L-138                                    |

**Kanoon ka ek hissa jo faisle ko sahi saabit karta hai:** D-177 (store credit aur wallet nahi) aur D-178 (koi pehle se payment nahi) RBI ke PPI aur e-mandate niyamon ko lagne hi nahi dete (L-114, L-115). D-045 ka "hum MSE nahi" EPR ke clause 4(iii) se seedha mel khaata hai (L-122).

## 11. COMPLIANCE.md ke liye prastaav

Sirf prastaav; owner ki haan ke baad hi COMPLIANCE.md me kuch judega (batch ke hisaab se, jaise pehle). Ye hissa apne aap me poora hai (naye doc me kisi purane kaam ka zikr nahi). Naye hisse §5 se §12; source tags naye (P, U, C, R, G, W, H, L) taaki maujooda T, M, K, E se na takraayein.

**Maujooda hisson me chhote badlav (prastaav):**

- "Is file me kya aayega" ki line "Personal data, payments, gig workers jaise areas kanooni jaanch ke doosre run ke baad" ki jagah naye hisson ki list (§5 se §12).
- **CL-081** (points ki expiry): "Kanoon ya niyam" me: RBI ke prepaid niyam khareedi hui value pe hain; jo points paise se khareede na jaayein, cash ya transfer na hon, wo chhoot hain (vyakhya, pakka nahi). Expiry ka tay number kanoon me nahi; saaf jaankari ka niyam consumer kanoon se. "Jaancha ya nahi": Aadha jaancha (2026-11-20): [R3].
- Kab se laagu (tareekhein) me jod: 13 Nov 2026 (DPDP Consent Manager wala rule), lagbhag 13 May 2027 (DPDP ki baaki zimmedariyan), 20 Feb 2026 (IT Rules ke naye samay), 21 Apr 2026 (e-mandate framework), 8 May 2026 (Social Security Central Rules), 1 Apr 2026 (Solid Waste Management Rules 2026).
- "Nazar" me jod: SDF ki notification; DPDP ke samay chhote karne ka prastaav; India ke bahar data pe koi rok (s.16); Maharashtra ka gig workers bill; Shops and Establishments ke 2025 badlav ka pass hona; asli business se pehle hosting region dobara dekhna.

### 5. Personal data

#### 5.0 Sources (sab 2026-11-20 ko khole)

- **[P1]** Digital Personal Data Protection Act 2023 (Act 22 of 2023), Gazette 11 Aug 2023, TRAI ki site pe copy: <https://www.trai.gov.in/sites/default/files/2024-09/DPDT_11082024.pdf>. Primary.
- **[P2]** Digital Personal Data Protection Rules 2025, G.S.R. 846(E), 13 Nov 2025, gazette ka text: <https://dpdpa.com/DPDP_Rules_2025_English_only.pdf>. Primary document, secondary host.
- **[P3]** PIB ka saar (17 Nov 2025): <https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf>. Primary.
- **[P4]** Act ke laagu hone ki tareekhein (G.S.R. 843(E), 13 Nov 2025) ka saar: <https://www.teamleaseregtech.com/updates/article/49364/meity-issued-a-notification-regarding-the-commencement-of-the-dpdp-act/>. Secondary.
- **[P5]** IT (Reasonable security practices and procedures and sensitive personal data or information) Rules 2011, G.S.R. 313(E), 11 Apr 2011: <https://www.wipo.int/wipolex/edocs/lexdocs/laws/en/in/in098en.pdf>. Primary document, secondary host.
- **[P6]** Aadhaar (Sharing of Information) Regulations 2016, updated 21.08.2025: <https://www.uidai.gov.in/images/The_Aadhaar_Sharing_of_information_regulation_2016.pdf>. Primary.

### CL-088. Abhi ka kanoon aur DPDP kab se

- **Kanoon ya niyam:** DPDP Rules: rule 4 (Consent Manager) 13 Nov 2026 se; rule 3, 5 se 16, 22, 23 publication ke 18 mahine baad (lagbhag 13 May 2027). Act ke s.3 se 17 aur s.44(2) (IT Act s.43A ka hatna) bhi 18 mahine baad. Tab tak IT Act s.43A aur SPDI Rules: sensitive data (password, financial jaankari, sehat, biometric) pe likhit (electronic) consent (rule 5(1)), privacy policy (rule 4), Grievance Officer aur ek mahine me hal (rule 5(9)), transfer sirf barabar suraksha wale ko (rule 7), documented security program (rule 8).
- **Kis pe laagu:** platform company; apne brand ki company apne data ke liye.
- **Kis module me:** sign-up, privacy, security.
- **System me kya chahiye:** shuru se DPDP ke hisaab se design; sign-up ke consent me sensitive data ka zikr; security ke niyam ek likhe program me.
- **Dummy kya hai:** kuch nahi; niyam asli.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [P2] rule 1, [P5]; Act ki tareekhein [P4, secondary].

### CL-089. Notice aur consent

- **Kanoon ya niyam:** s.5, 6: har maqsad ke liye saaf consent, sirf zaroori data; consent se pehle notice. Rule 3: notice baaki jaankari se alag, data ki itemised list, maqsad aur seva ka vivaran, consent waapas lene, haq chalane aur Board ko shikayat ka link. Waapsi utni hi aasaan (s.6(4)); saboot Data Fiduciary pe (s.6(10)). Khud diye data pe khaas maqsad ke liye legitimate use (s.7(a)). Consent Manager vikalp (s.6(7) se (9), rule 4).
- **Kis pe laagu:** customers, sellers, partners, testers.
- **Kis module me:** sign-up, account, saare apps.
- **System me kya chahiye:** sign-up pe alag "Data notice"; har consent ka record (notice version, samay, raasta, waapsi); har consent ka "band karo"; data model Consent Manager se baad me jud sake.
- **Dummy kya hai:** notice ka text "DUMMY: lawyer se jaancha nahi" ke saath.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1], [P2].

### CL-090. Sehat ka data

- **Kanoon ya niyam:** SPDI rule 3: sehat ki halat aur medical records sensitive; rule 5: likhit consent. DPDP rule 6: encryption, access control, logs.
- **Kis pe laagu:** consultation notes, skin reaction case, allergy profile (R2).
- **Kis module me:** consultation, customer profile, support.
- **System me kya chahiye:** alag consent (D-165), encryption aur audit (D-207, D-208); marketing ya sujhaav me bina alag consent nahi.
- **Dummy kya hai:** dummy profiles.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P5], [P2].

### CL-091. Data ke haq

- **Kanoon ya niyam:** s.11 (data aur processing ka saar, kin Data Fiduciaries aur Processors ke saath baanta), s.12 (sudhaar, erasure), s.13 (shikayat), s.14 (nomination). Rule 14: haq ka raasta saaf, jawab 90 din se zyada nahi.
- **Kis pe laagu:** customers (aur baaki Data Principals).
- **Kis module me:** account, support.
- **System me kya chahiye:** D-151 ke haq; data ke saar me sellers aur processors ki shreniyan; nomination (R2); jawab ka samay 90 din ke andar (D-163 ke timers).
- **Dummy kya hai:** dummy customers.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1], [P2].

### CL-092. Privacy ka sampark wala insaan

- **Kanoon ya niyam:** s.8(9), rule 9: DPO (sirf SDF pe zaroori) ya processing ke sawalon ka jawab dene wale insaan ka business contact website ya app pe, aur haq ke har jawab me. s.8(10): grievance ka raasta.
- **Kis pe laagu:** platform.
- **Kis module me:** legal pages, support, staff roles.
- **System me kya chahiye:** privacy contact ka role (Grievance Officer hi ya alag, D-241); privacy page aur haq ke har jawab me apne aap.
- **Dummy kya hai:** role wale staff account ki asli jaankari (D-241); repo me koi naam nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1], [P2].

### CL-093. Data ka samay aur 1 saal ki kanooni rok

- **Kanoon ya niyam:** s.8(7): maqsad poora ya consent waapas hone pe erase, jab tak kanoon na maange; processor se bhi. Rule 8(3) (13 May 2027 se): har processing ka personal data, traffic data aur logs kam se kam 1 saal, account delete ke baad bhi. Rule 6(1)(e): security ke liye logs aur data 1 saal. Rule 8(1) ka 3 saal wala niyam sirf 2 crore+ users wale e-commerce pe. Tax records CL-021 me.
- **Kis pe laagu:** platform aur uske processors.
- **Kis module me:** saari services, backups.
- **System me kya chahiye:** har data class ka samay (D-191 se D-194, D-208) + "1 saal ki kanooni rok" ki class: app se turant hatna, band encrypted store me 1 saal, sirf kanooni maang pe khulna (audit), phir erase.
- **Dummy kya hai:** samay settings me.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): text [P2] se; photos aur profile pe lagna vyakhya.

### CL-094. Data breach ki suchna

- **Kanoon ya niyam:** rule 7(1): har asar wale user ko bina der (kya hua, asar, humne kya kiya, wo kya kare, sampark). Rule 7(2): Board ko bina der shuruaati suchna aur 72 ghante me poori report. CERT-In ko 6 ghante (CL-106).
- **Kis pe laagu:** platform.
- **Kis module me:** operations (runbook), notifications.
- **System me kya chahiye:** runbook ki teen ghadiyaan; user email aur in-app ka template; breach register.
- **Dummy kya hai:** saal ka abhyaas nakli event se; kisi sanstha ko asli ya nakli report nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P2] rule 7.

### CL-095. Aadhaar

- **Kanoon ya niyam:** Aadhaar (Sharing of Information) Regulations reg. 6: Aadhaar number public nahi; suraksha; internet pe sirf encrypted; maqsad se zyada der nahi (6(5), 2025).
- **Kis pe laagu:** seller, Pro, partner ke dastavez.
- **Kis module me:** KYC uploads.
- **System me kya chahiye:** Aadhaar nahi lena (SR-064); upload form pe saaf line; galti se aayi copy reject aur turant delete.
- **Dummy kya hai:** koi Aadhaar nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P6].

### CL-096. Staff ki pahunch

- **Kanoon ya niyam:** rule 6(1)(b), (c): pahunch pe control, logs, monitoring aur review.
- **Kis pe laagu:** saare staff roles.
- **Kis module me:** saare staff apps, audit.
- **System me kya chahiye:** D-201, SR-076; "poori jaankari dekhi" ke audit ki mahine ki review.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P2].

### CL-097. Device aur accounts ka jod

- **Kanoon ya niyam:** DPDP me consent aur s.7 ke tay maamle hi aadhaar; "legitimate interest" nahi. Cookies pe alag kanoon nahi mila.
- **Kis pe laagu:** per-customer seemaayein aur galat istemaal ki rok.
- **Kis module me:** checkout, referral, reviews.
- **System me kya chahiye:** notice aur Terms me ye maqsad (D-203); device cookie sirf isi kaam ke liye.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [P1]; lagna vyakhya.

### CL-098. Seller aur reviews ke saath data

- **Kanoon ya niyam:** s.8(3)(b): doosre Data Fiduciary ko diya data sahi ho; s.11(1)(b): kis ke saath baanta; s.6(1): sirf zaroori.
- **Kis pe laagu:** seller reports, invoices, reviews.
- **Kis module me:** seller app, reviews.
- **System me kya chahiye:** D-143, D-226; review form pe "ye jaankari sabko dikhegi".
- **Dummy kya hai:** dummy reviews.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1].

### CL-099. Demo site

- **Kanoon ya niyam:** Act India me digital personal data ki har processing pe (s.3); demo ki chhoot nahi.
- **Kis pe laagu:** allowlist ke testers.
- **Kis module me:** sign-up.
- **System me kya chahiye:** testers pe bhi wahi notice aur haq (D-133).
- **Dummy kya hai:** testers ka data asli maana jaata hai.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1].

### CL-100. Privacy page

- **Kanoon ya niyam:** SPDI rule 4 (privacy policy); DPDP rule 3, 9, 14.
- **Kis pe laagu:** platform.
- **Kis module me:** legal pages.
- **System me kya chahiye:** kaunsa data, kyun, kab tak (1 saal ki rok samet), kis ke saath (sellers, processors ki shreniyan), kahan (India ke bahar, Singapore), security ka saar, haq, sampark, Board, backups ki umar (D-150).
- **Dummy kya hai:** "DUMMY: lawyer se jaancha nahi".
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P5], [P2].

### CL-101. Marketing consent

- **Kanoon ya niyam:** s.6(1), 6(4): alag consent, aasaan waapsi.
- **Kis pe laagu:** offers aur marketing (in-app, push).
- **Kis module me:** notifications.
- **System me kya chahiye:** D-141; opt-in aur opt-out consent record me; push permission aur marketing consent alag.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1].

### CL-102. Bachche aur 18+

- **Kanoon ya niyam:** s.2(f): 18 se kam child; s.9: parent ki verifiable consent, tracking aur targeted ads mana; rule 10; Fourth Schedule Part B #6 (child nahi hai, ye pakka karne ki processing).
- **Kis pe laagu:** sign-up.
- **Kis module me:** account.
- **System me kya chahiye:** 18+ ki ghoshna ka tick (pehle se nahi, D-038) consent record me; child pata chale to account band aur erase; umar pe ads nahi.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [P1], [P2]; sirf ghoshna kaafi hai ya nahi, saaf nahi.

### CL-103. Significant Data Fiduciary

- **Kanoon ya niyam:** s.10, rule 13: sirf sarkar ki notification se; tab India me DPO, auditor, saal ka DPIA aur audit, kuch data India me hi.
- **Kis pe laagu:** abhi nahi.
- **Kis module me:** koi nahi.
- **System me kya chahiye:** kuch nahi; "nazar" me.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [P1], [P2]; notification na hona sirf search se.

### CL-104. Data Processors

- **Kanoon ya niyam:** s.8(1), 8(2): processor sirf valid contract se, zimmedari hamari; rule 6(1)(f): contract me security; s.8(7)(b): processor se bhi erase.
- **Kis pe laagu:** hosting, database, email, payment, push providers.
- **Kis module me:** operations.
- **System me kya chahiye:** processors ki list (kaun, kya data, region, data terms ka link aur tareekh, delete ka tareeka); naya provider is row ke bina nahi.
- **Dummy kya hai:** list asli providers ki.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1], [P2].

### 6. IT Act aur intermediary niyam

#### 6.0 Sources (sab 2026-11-20 ko khole)

- **[U1]** IT (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021, 6 Apr 2023 tak ke badlav samet: <https://indiankanoon.org/doc/111130067/>. Consolidated text, secondary host.
- **[U2]** IT Rules ke 2026 ke badlav (laagu 20 Feb 2026) ka saar: <https://khaitanco.com/sites/default/files/2026-02/ERGO%20-%20IT%20Rules%20Amendment%20-%2016%20February%202026.pdf>. Secondary.
- **[U3]** Usi badlav pe lekh: <https://chambers.com/articles/government-notifies-information-technology-amendment-rules-2026>. Secondary.

### CL-105. User content: niyam aur shikayat ke samay

- **Kanoon ya niyam:** marketplace IT Act s.79 ki chhoot tabhi le jab intermediary niyam maane ([E1] rule 5(1)). Rule 3(1)(a) rules, privacy, user agreement; 3(1)(b) mana content ki list user agreement me; 3(1)(c) har 3 mahine users ko nateeje (2026); 3(1)(d) court ya sarkari order pe 3 ghante (2026); 3(1)(g) hataya content 180 din; 3(1)(h) registration data band hone ke 180 din baad tak; 3(1)(j) sarkari maang pe 72 ghante; 3(2)(a) Grievance Officer, receipt 24 ghante, hal 7 din (2026), 3(1)(b) wale content pe 36 ghante (2026); 3(2)(b) nagnata ya kisi aur ban ke pe 2 ghante (2026); 3A Grievance Appellate Committee me 30 din me appeal.
- **Kis pe laagu:** reviews, review photos, seller ka content, Creator content.
- **Kis module me:** reviews, moderation, support, legal pages.
- **System me kya chahiye:** content shikayat ke alag timers (calendar ghante); nagnata wali report pe turant apne aap chhupna; "kanooni order" ka 3 ghante wala raasta Master ke alert ke saath; har 3 mahine in-app suchna; Terms me 3(1)(b) ki list; hataya content 180 din (D-136 niyam 6); grievance jawab me appeal ka raasta.
- **Dummy kya hai:** dummy reviews aur shikayatein; Grievance Officer role se (D-241).
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [U1]; 2026 ke samay [U2], [U3] (secondary).

### 7. CERT-In aur data ki jagah

#### 7.0 Sources (sab 2026-11-20 ko khole)

- **[C1]** CERT-In Directions, No. 20(3)/2022-CERT-In, 28 Apr 2022: <https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf>. Primary.
- **[C2]** CERT-In FAQs (May 2022): <https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf>. Primary.
- **[C3]** RBI, Storage of Payment System Data, FAQs (26 Jun 2019): <https://www.rbi.org.in/Scripts/FAQView.aspx?Id=130>. Primary.
- **[C4]** RBI Master Direction on Regulation of Payment Aggregators (15 Sep 2025, updated 11 Nov 2026): <https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12896>. Primary.

### CL-106. CERT-In

- **Kanoon ya niyam:** direction (i) ghadi NIC/NPL ya unse traceable NTP se (cloud ki time service chal sakti hai, FAQ Q42); (ii) Annexure I ke incidents (data breach, data leak, unauthorised access, e-commerce application pe hamla samet) 6 ghante me CERT-In ko; (iii) Point of Contact; (iv) saare ICT systems ke logs 180 din, Indian jurisdiction me (FAQ Q35: bahar bhi agar samay pe de sakein).
- **Kis pe laagu:** platform (body corporate aur intermediary).
- **Kis module me:** operations, logs.
- **System me kya chahiye:** request logs aur security events apne store me 180 din (D-194 1 saal); runbook me 6 ghante; PoC ka role; saare timestamps UTC.
- **Dummy kya hai:** CERT-In ko koi test report nahi; PoC asli business pe register.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [C1], [C2].

### CL-107. Data ki jagah

- **Kanoon ya niyam:** RBI: payment system data sirf India me (payment system providers aur unke vendors pe; bahar processing ho to 24 ghante me wapas) [C3]; merchant ke server pe card credentials nahi [C4] Annexure 1 para 2.1. DPDP s.16: sarkar kisi desh pe rok laga sakti hai (abhi koi nahi mili); rule 15. SPDI rule 7. CERT-In logs CL-106.
- **Kis pe laagu:** saari hosting (Singapore, D-058).
- **Kis module me:** architecture, finance, privacy page.
- **System me kya chahiye:** payment ka kam se kam data (ids, rakam, status, samay); card ya UPI ki jaankari kabhi nahi (SR-064); gateway se merchant ki shart likhit me; privacy page pe data ki jagah.
- **Dummy kya hai:** test mode.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [C3], [C4], [P1]; RBI niyam ka merchant pe lagna vyakhya.

### 8. Payments

#### 8.0 Sources (sab 2026-11-20 ko khole)

- **[R1]** RBI PA Master Direction: wahi [C4].
- **[R2]** RBI circular, Harmonisation of TAT and customer compensation for failed transactions, 20 Sep 2019: <https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=11693>. Primary.
- **[R3]** RBI FAQs on PPIs (updated 22 Nov 2022): <https://www.rbi.org.in/Scripts/FAQView.aspx?Id=126>. Primary.
- **[R4]** RBI Digital Payments – E-mandate Framework 2026 (21 Apr 2026): <https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13374>. Primary.

### CL-108. Payment aggregator aur sellers ka paisa

- **Kanoon ya niyam:** marketplace PA ka merchant (para 4(e), 4(f)); PA marketplace business nahi karta (10(b)); PA dekhe ki marketplace sirf onboarded sellers ke liye paisa le (13(f)); settlement agreement ke samay se (Table 1); refund usi raaste (10(f)).
- **Kis pe laagu:** platform (Razorpay ka merchant).
- **Kis module me:** payments, finance.
- **System me kya chahiye:** ledger me sellers ka paisa liability; seller agreement me payout ke din (D-081); baad me linked account ka raasta (D-093).
- **Dummy kya hai:** test mode, haath se payout.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [R1]; marketplace ka PA na hona text ki padhai se.

### CL-109. Failed transaction, refund aur chargeback

- **Kanoon ya niyam:** failed transaction (paisa kata, merchant ko pakki suchna nahi): card PoS aur UPI merchant pe T+5 din me reversal, phir ₹100 roz (banks pe) [R2]; refund usi raaste aur escrow se; chargeback ka framework PA ka, customer ke haq bane rehte hain [R1] para 8(a), 18(h).
- **Kis pe laagu:** platform, gateway.
- **Kis module me:** checkout, finance, support.
- **System me kya chahiye:** "paisa kata, order nahi bana" ki screen aur email; late "captured" pe apne aap refund; chargeback ka case aur saboot (D-072, D-191).
- **Dummy kya hai:** test mode ke scenario.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [R1], [R2].

### CL-110. Gift card, points aur store credit

- **Kanoon ya niyam:** PPI = rakhi value se kharid. Closed system PPI (sirf apna saamaan, cash nahi) ko authorisation nahi chahiye par wo teesre ke liye payment nahi kar sakta. Gift PPI: ₹10,000 tak, reload nahi, cash-out nahi. Validity kam se kam 1 saal, expiry issue pe batana [R3].
- **Kis pe laagu:** gift cards (R2), points (R2).
- **Kis module me:** loyalty, checkout, finance.
- **System me kya chahiye:** gift card sirf RBI-authorised PPI issuer ke zariye; points paise se khareede nahi, cash ya transfer nahi (D-173); store credit aur wallet nahi (D-177).
- **Dummy kya hai:** test-mode design; koi asli issuer nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [R3]; marketplace pe lagna aur points ka darja vyakhya.

### CL-111. E-mandate

- **Kanoon ya niyam:** cards, PPI aur UPI ke recurring: ₹15,000 tak bina AFA (kuch shreniyon pe ₹1,00,000), 24 ghante pehle issuer ki suchna, customer kabhi bhi waapas le [R4].
- **Kis pe laagu:** abhi kuch nahi (D-178 me pehle se payment nahi).
- **Kis module me:** koi nahi.
- **System me kya chahiye:** kuch nahi.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [R4].

### 9. Gig delivery partners

#### 9.0 Sources (sab 2026-11-20 ko khole)

- **[G1]** Code on Social Security 2020, Gazette 29 Sep 2020, PRS ki copy: <https://prsindia.org/files/bills_acts/acts_parliament/2020/Code%20On%20Social%20Security,%202020.pdf>. Primary document, secondary host.
- **[G2]** PIB saar (22 Nov 2025): <https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251122702601.pdf>. Primary.
- **[G3]** Social Security (Central) Rules 2026, G.S.R. 344(E), 8 May 2026, PRS ka saar: <https://prsindia.org/billtrack/the-social-security-central-rules-2026>. Secondary.
- **[G4]** Maharashtra Gig and Platform Workers Rights and Protection Bill 2026 ka saar: <https://teamleaseregtech.com/updates/article/57603/maharashtra-gig-and-platform-workers-rights-and-protection-bill-2026/>. Secondary.
- **[G5]** Contractor ka TDS, Income-tax Act 2025 s.393(1): search ke nateeje. Secondary.

### CL-112. Social Security Code: aggregator

- **Kanoon ya niyam:** aggregator ki paribhasha (s.2(2)); Seventh Schedule me "Logistic services" aur "e-Market place"; workers ka registration (s.113); schemes (s.114); contribution saal ke turnover ka 1% se 2% (notify hona baaki), workers ko diye paise ke 5% se zyada nahi; shuru ki tareekh notify hogi (s.114(4), (5)) [G1]. Rules 2026: maujooda workers ki details 45 din me portal pe, naye real-time ya roz; scheme ke liye 90 din (ek aggregator) ya 120 din (kai) [G3]. Maharashtra ka bill (2026) [G4].
- **Kis pe laagu:** platform (delivery partners ke liye).
- **Kis module me:** delivery partners, finance.
- **System me kya chahiye:** partner pe portal ka number; roz ke engagement ka export; saal ke din ki ginti; contribution ki provision (dar setting me); kaat ka likhit kaaran aur appeal; har state ki row.
- **Dummy kya hai:** dummy partners; portal pe kabhi upload nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [G1], [G2]; Rules aur bill [G3], [G4] (secondary).

### CL-113. Partner payouts pe TDS

- **Kanoon ya niyam:** contractor ke payment pe TDS, Income-tax Act 2025 s.393(1) (pehle 194C): individual/HUF 1%, baaki 2%; seema ek payment ₹30,000 ya saal me ₹1,00,000 (sirf ek source me) [G5].
- **Kis pe laagu:** platform (partner payouts).
- **Kis module me:** finance.
- **System me kya chahiye:** partner ka PAN (encrypted); saal ka jod; kaat ka niyam settings me; payout statement me TDS.
- **Dummy kya hai:** dummy PAN; koi challan nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [G5]; CA se pakka karna.

### CL-114. Partner ka data

- **Kanoon ya niyam:** DPDP ka consent aur notice partner pe bhi; employment wala legitimate use (s.7(i)) employee ke liye; kanoon ke kehne pe sarkar ko jaankari s.7(d) [P1].
- **Kis pe laagu:** delivery partners.
- **Kis module me:** Delivery app.
- **System me kya chahiye:** partner ka notice; location sirf "delivered" aur "fail" ke pal pe; photo sirf parcel ki; samay D-191.
- **Dummy kya hai:** dummy partners.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [P1], [G1].

### 10. Warehouse, transport aur environment

#### 10.0 Sources (sab 2026-11-20 ko khole)

- **[W1]** Maharashtra Fire Prevention and Life Safety Measures (Amendment) Act 2023 (Mah. Act XXIV of 2023): <https://mahafireservice.gov.in/directorate/fire-act/2023/English.pdf>. Primary.
- **[W2]** Maharashtra Shops and Establishments (Amendment) Bill 2025 (L.A. Bill LXXXIX of 2025; Ordinance VIII of 2025, 1 Oct 2025): <https://prsindia.org/files/bills_acts/bills_states/maharashtra/2025/Bill89of2025MH.pdf>. Primary document, secondary host.
- **[W3]** Plastic Waste Management (Amendment) Rules 2022, G.S.R. 133(E), 16 Feb 2022 (EPR guidelines): <https://tnpcb.gov.in/owems/pdf/regulations/4th%20Amendment%20(EPR%20guidelines)%20Feb%202022.pdf>. Primary.
- **[W4]** Plastic Waste Management (Amendment) Rules 2024, G.S.R. 201(E), 14 Mar 2024: <https://tnpcb.gov.in/owems/pdf/regulations/Plastic_Waste_Management_Amendment_Rules_2024.pdf>. Primary.
- **[W5]** E-way bill ki seema aur kai invoices: search ke nateeje. Secondary.
- **[W6]** Solid Waste Management Rules 2026 (1 Apr 2026 se): search ke nateeje. Secondary.
- **[W7]** Gas Cylinders Rules 2016 ki "gas cylinder" paribhasha: search ka saar. Secondary.

### CL-115. Fire safety aur jalne wala maal

- **Kanoon ya niyam:** Maharashtra Fire Act: storage buildings Schedule I ki "(H)" shreni; Provisional, Final aur Renewal Fire Safety Approval (2023) [W1]; owner ya occupier ka licensed agency se saal me do baar (January, July) certificate (secondary). Aerosol: "gas cylinder" 500 ml se bade dhaatu ke container [W7]. Petroleum Rules aur transport ke niyam nahi jaanche.
- **Kis pe laagu:** warehouse aur hubs.
- **Kis module me:** warehouse, catalog, delivery.
- **System me kya chahiye:** site record me approvals aur certificate ki tareekhein aur yaad; catalog me "flammable" flag; alag rack; delivery bag me ginti ki seema.
- **Dummy kya hai:** tareekhein aur numbers "DUMMY".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [W1]; baaki secondary ya nahi jaancha.

### CL-116. Shops and Establishments

- **Kanoon ya niyam:** Maharashtra S&E Act 2017: registration (s.6) ya intimation (s.7) workers ki ginti se; 1 Oct 2025 ke Ordinance aur 8 Dec 2025 ke bill me seema 10 se 20 [W2] (bill pass hua ya nahi, pakka nahi).
- **Kis pe laagu:** warehouse, hubs, office.
- **Kis module me:** warehouse aur hub ka record.
- **System me kya chahiye:** workers ki ginti; registration ya intimation ka number aur tareekh; seema setting me.
- **Dummy kya hai:** number "DUMMY".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [W2].

### CL-117. E-way bill

- **Kanoon ya niyam:** inter-state ₹50,000 se zyada ki consignment; Maharashtra intra-state ₹1,00,000; ek e-way bill ek invoice ka; ek gaadi ke liye consolidated e-way bill [W5].
- **Kis pe laagu:** warehouse se hub ke trips.
- **Kis module me:** logistics (trips, D-027).
- **System me kya chahiye:** manifest me har invoice ki rakam; seema paar pe e-way bill number ke bina dispatch nahi; trip pe consolidated number.
- **Dummy kya hai:** number "DUMMY".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [W5]; CA se pakka.

### CL-118. Plastic EPR

- **Kanoon ya niyam:** obligated entities me "Brand Owners including online platforms/marketplaces", MSE ko chhod ke (4(iii)); packaging ki shreniyan I se IV (5.1); CPCB portal pe registration (6.1), bina registration business nahi (6.2), unregistered entity se len-den nahi (6.3); targets aur saal ka return (7) [W3], [W4].
- **Kis pe laagu:** platform (shipping packaging); har seller jo brand owner ya importer hai (apne packs ke liye).
- **Kis module me:** seller onboarding, warehouse (packing), finance.
- **System me kya chahiye:** seller ka EPR number ya MSE ghoshna (bina iske live nahi); packaging master (shreni, wazan); har dispatch ka istemaal; saal ka return report.
- **Dummy kya hai:** EPR numbers "DUMMY".
- **Jaancha ya nahi:** Jaancha (2026-11-20): [W3], [W4].

### CL-119. Expired ya toote maal ko nasht karna

- **Kanoon ya niyam:** Solid Waste Management Rules 2026: chaar hisson me alag karna, "special care" waste; bulk waste generator ki alag zimmedari [W6].
- **Kis pe laagu:** warehouse.
- **Kis module me:** warehouse, returns.
- **System me kya chahiye:** sirf authorised handler; certificate of destruction batch ke record me; jalne wale alag (D-062).
- **Dummy kya hai:** handler aur certificate dummy.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [W6].

### CL-120. E-waste

- **Kanoon ya niyam:** jaancha nahi (E-Waste (Management) Rules 2022 me EPR producer pe).
- **Kis pe laagu:** agar kabhi beauty appliances bikein.
- **Kis module me:** catalog.
- **System me kya chahiye:** "electrical appliance" ka flag; aisa product aane se pehle jaanch.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Jaancha nahi.

### 11. Health aur AYUSH

#### 11.0 Sources (sab 2026-11-20 ko khole)

- **[H1]** Drugs and Magic Remedies (Objectionable Advertisements) Act 1954: <https://thc.nic.in/Central%20Governmental%20Acts/Drugs%20and%20Magic%20Remedies%20(Objectionable%20Advertisement)%20Act,%201954.pdf>. Primary.
- **[H2]** Telemedicine Practice Guidelines (2020) ka saar: <https://nrces.in/standards/telemedicine-practice-guidelines>. Saar.
- **[H3]** Drugs and Cosmetics Act aur Rules (CDSCO, 31 Dec 2016 tak): <https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/acts_rules/2016DrugsandCosmeticsAct1940Rules1945.pdf>. Primary, purana.
- **[H4]** Rule 170 ka hatna aur Supreme Court ka stay hatna (11 Aug 2025): khabrein. Secondary.

### CL-121. Online consultation

- **Kanoon ya niyam:** telemedicine sirf RMP; RMP ka naam, qualification, registration number; patient ki pehchaan; consent; dawa sirf tay lists se; record; platform RMP ka registration jaanche aur dikhaye; AI counsel ya prescribe nahi [H2].
- **Kis pe laagu:** Skin & Hair Expert ki consultation (R2).
- **Kis module me:** consultation.
- **System me kya chahiye:** owner ke chunaav pe: beauty salah ("medical consultation nahi") ya RMP (registration field, jaanch, display, pehchaan, dawa ke niyam).
- **Dummy kya hai:** registration number "DUMMY".
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [H2].

### CL-122. AYUSH drug ki pehchaan

- **Kanoon ya niyam:** ASU drug banane ka licence Form 25-D (rules 153 se 157); label pe "Ayurvedic/Siddha/Unani medicine" aur "Mfg. Lic. No." (rule 161(3)) [H3]. Rule 170 hataya gaya, Supreme Court ka stay 11 Aug 2025 ko hata [H4].
- **Kis pe laagu:** har listing (AYUSH drug listing pe nahi, D-128).
- **Kis module me:** catalog ki jaanch.
- **System me kya chahiye:** label checklist me AYUSH drug ke ishare pe reject.
- **Dummy kya hai:** test listing.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [H3] (2016 tak), [H4] secondary.

### CL-123. Drugs and Magic Remedies Act

- **Kanoon ya niyam:** s.3: drug ke vigyapan me garbh, yaun kshamata, mahwari, aur Schedule ki bimariyon (beauty se jude: bust ki banawat, leucoderma, motapa, lambai) ke ilaaj ka sujhaav mana; s.4: jhootha ya gumraah karne wala drug vigyapan mana; chhapne me hissa lena bhi (s.2(d)) [H1].
- **Kis pe laagu:** listings, seller content, Creator content, sponsored.
- **Kis module me:** catalog, Creator, ads.
- **System me kya chahiye:** "mana shabdon" me DMR ka alag hissa, har shabd ke saath Schedule ka S. No. (D-246).
- **Dummy kya hai:** test listing.
- **Jaancha ya nahi:** Jaancha (2026-11-20): [H1].

### 12. IP aur contracts

#### 12.0 Sources (sab 2026-11-20 ko khole)

- **[L1]** Trade Marks Act 1999 s.30(3): <https://indiankanoon.org/doc/1928889/>. Statute ka text, secondary host.
- **[L2]** IT Act 2000 s.10A: search ke nateeje. Secondary.
- **[L3]** Commission Decision 2011/833/EU (EU documents ka reuse): search ka saar. Secondary.

### CL-124. Trademark aur asli maal

- **Kanoon ya niyam:** jaayaz tareeke se kharide registered mark wale maal ko aage bechna sirf isliye infringement nahi (s.30(3)) [L1]; nakli maal infringement aur doosre kanoonon me; user agreement me IP todne wala content mana ([U1] 3(1)(b)(iv)).
- **Kis pe laagu:** har seller.
- **Kis module me:** seller onboarding, catalog, support.
- **System me kya chahiye:** D-075; seller agreement me asli maal aur photos ke haq ki ghoshna; brand owner ke liye IP shikayat ki category.
- **Dummy kya hai:** authorisation letter dummy.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [L1].

### CL-125. Data aur assets ka license

- **Kanoon ya niyam:** EU documents ka reuse aam taur pe ijazat ke saath, teesre ke IP ko chhod ke [L3]; CosIng ki apni notice aur BIS standards ki shartein nahi jaanchi.
- **Kis pe laagu:** ingredient master list, blocklist, fonts, icons, images.
- **Kis module me:** catalog data, frontend.
- **System me kya chahiye:** license list (asset, license, link, attribution); IS ki list ka text copy nahi, sirf hawala.
- **Dummy kya hai:** kuch nahi.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [L3].

### CL-126. Seller ka udhaar

- **Kanoon ya niyam:** koi khaas kanoon nahi mila; seller agreement (contract) ki baat.
- **Kis pe laagu:** har seller.
- **Kis module me:** finance, seller agreement.
- **System me kya chahiye:** D-071; agreement me kaat ka haq, notice, listings rokna, jhagde ka raasta.
- **Dummy kya hai:** test mode payment link.
- **Jaancha ya nahi:** Jaancha nahi.

### CL-127. Apne brand ka trademark

- **Kanoon ya niyam:** jaancha nahi (trademark aur company naam ki search nahi hui).
- **Kis pe laagu:** apne brand ki company (D-243).
- **Kis module me:** koi nahi.
- **System me kya chahiye:** asli business se pehle trademark search (class 3) aur application, company naam ki uplabdhta.
- **Dummy kya hai:** company dummy.
- **Jaancha ya nahi:** Jaancha nahi.

### CL-128. Electronic contract (Terms aur seller agreement)

- **Kanoon ya niyam:** IT Act s.10A: electronic tareeke se bana contract sirf is wajah se unenforceable nahi [L2]; dono paksh baalig hon. Stamp duty nahi jaanchi.
- **Kis pe laagu:** customers (Terms), sellers (agreement).
- **Kis module me:** sign-up, seller onboarding, legal pages.
- **System me kya chahiye:** har version immutable; kisne, kab, kaunsa version maana ka record; "maanta hoon" bina pehle tick ke (D-150).
- **Dummy kya hai:** dummy sellers ka record.
- **Jaancha ya nahi:** Aadha jaancha (2026-11-20): [L2].

## 12. Pehle ke kaam se lene layak (D-074)

Pehle ke kaam ki kanooni matrix (purane PRD ka §7.1 aur §7.3, run 2 wale areas) sirf input checklist ki tarah dekhi. Har cheez ki teen jaanch: **(1) asli zaroorat** (kanoon ya tay faisla maangta hai), **(2) tay faislon se takrav nahi**, **(3) naye vakya me likhi ja sake** (copy nahi). Jo leni hai wo naye docs me naye shabdon me, bina purane kaam ke zikr ke.

### 12.1 Lene layak

| Cheez                                                                                                                                  | (1) Zaroorat                                           | (2) Takrav nahi                                                                                   | (3) Naya likhna           | Is report me          |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------- | --------------------- |
| Abhi s.43A aur SPDI (privacy policy, sensitive data pe consent, security practices); DPDP lagbhag 13 May 2027 se                       | Haan (SPDI primary; tareekh rule 1(4) se)              | Haan                                                                                              | Haan                      | L-137, CL-088         |
| DPDP: itemised notice, consent, haq ka jawab 90 din me, Board aur users ko breach, logs aur data 1 saal                                | Haan (primary)                                         | Users ko breach ki suchna "bina der", 72 ghante nahi (§10 #1)                                     | Haan                      | L-100 se L-104        |
| "Launch se pehle hi DPDP ke hisaab se banana"                                                                                          | Salah (kanoon baad me laagu)                           | Haan (D-026 ka "asli jaisa design")                                                               | Haan                      | Area E ka aakhri note |
| CERT-In: Point of Contact, 6 ghante me report, NIC/NPL se ghadi, 180 din ke logs (India me, ya maangne pe samay pe dena)               | Haan (primary)                                         | Haan; logs ka store §10 #5                                                                        | Haan                      | L-110, CL-106         |
| Listings aur reviews ki wajah se intermediary: rules, privacy, user agreement; 24 ghante receipt; 7 din, 36 ghante, 2 ghante, 3 ghante | Haan (2023 tak primary jaisa; 2026 ke samay secondary) | D-136, D-163 ke timers badalne honge (§10 #4)                                                     | Haan, "secondary" likh ke | L-109, CL-105         |
| Gig: portal pe partners ki details (naye real-time ya roz), contribution turnover ka 1-2%, payouts ke 5% ki chhat                      | Haan (contribution primary; portal secondary)          | Haan                                                                                              | Haan                      | L-116, CL-112         |
| Partner payouts pe TDS                                                                                                                 | Haan (secondary)                                       | Haan                                                                                              | Haan, CA se pakka         | L-117, CL-113         |
| Plastic EPR: CPCB portal pe Brand Owner ke roop me registration, saal ke targets                                                       | Haan (clause 4(iii), 6.1; primary)                     | Sirf platform ki shipping packaging ke liye; apne brand ke packs apne brand ki company ke (§12.2) | Haan                      | L-122, CL-118         |
| Warehouse aur hub ka Shops & Establishments; fire approval ka field aur renewal ki yaad                                                | Haan (Maharashtra Act aur 2023 badlav)                 | Seema ab 20 workers (2025 ka badlav, pakka karna)                                                 | Haan                      | L-119, L-120          |
| Area ki settings me state ke gig niyam                                                                                                 | Haan (state kanoon alag-alag)                          | Haan (D-037)                                                                                      | Haan                      | L-116                 |
| Account me 18+ ki ghoshna, data download aur delete                                                                                    | Haan (D-038; DPDP s.11, 12)                            | Haan                                                                                              | Haan                      | L-135, L-102          |
| Consent records, data requests ki queue, breach register                                                                               | Haan (s.6(10), rule 7, 14)                             | Haan                                                                                              | Haan                      | L-100, L-102, L-104   |

### 12.2 Nahi lene

| Cheez                                                                                                     | Kyun nahi                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Officers ke dummy insaani naam aur phone numbers (Nodal, DPO, Security Officer ke)                        | D-241 aur D-145 se takrav (apne roles ki jaankari role wale staff account se, dummy naam nahi); phone sirf sampark ke liye, aur repo me koi naam nahi.         |
| "Data Protection Officer" aur "Security Officer" ko kanooni roop se zaroori pad maanna                    | DPO sirf SDF pe zaroori (s.10(2)(a)); kanoon sirf "sampark wala insaan" (rule 9) aur CERT-In ka Point of Contact maangta hai. Roles D-017 aur D-241 ka vishay. |
| "Apne brand ke packs" ko platform ki EPR registration me ginna                                            | D-031 aur D-243: apna brand alag company hai; uske packs ka EPR uski apni zimmedari (seller ki tarah, L-122).                                                  |
| "Karnataka me payouts pe 1% welfare fee" aur "Rajasthan ka 2023 Act" ko hamare upar laagu maanna          | Is run me nahi jaanche; aur ye sirf un rajyon me kaam karne pe lagte hain. Abhi sirf Maharashtra (bill pending, L-116).                                        |
| Partner "chhod de to exit real time me" portal pe                                                         | Is run me nahi mila (Rules ke saar me naye engagement real-time ya roz; exit ka niyam nahi dikha). Bina jaanch ke na likhein.                                  |
| "10+ workers pe 60 din me OSH Code registration", "ESIC 10+ employees"                                    | Is run me nahi jaanche (OSH Code aur ESIC daayre ke bahar rahe). EPFO ki 20+ ki seema PIB ke saar me mili, par baaki bina jaanch ke na likhein.                |
| Riders ki "police verification" ko kanooni shart maanna                                                   | Koi kanooni shart nahi mili; business ka faisla ho sakta hai, kanoon nahi.                                                                                     |
| Dummy "registration" ya "report" kisi asli sarkari portal (CERT-In, Board, labour portal, CPCB) pe bhejna | D-026 ke khilaaf: sab dummy sirf system ke andar; asli portal pe kuch nahi.                                                                                    |

## Change log

| Version | Date       | Badlav                                  |
| ------- | ---------- | --------------------------------------- |
| v1.0.0  | 2026-11-20 | Pehla version: kanooni jaanch ka run 2. |
