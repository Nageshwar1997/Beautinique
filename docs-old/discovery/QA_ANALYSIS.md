# QA_ANALYSIS: Beautinique

> **Status:** v1.0.0 (2026-11-21). QA Architect (D-257).

## 0. Kaise padhein

- Ye ek **report** hai, naya doc nahi. Isme koi faisla nahi: main session ise jaanche, phir cheezein owner ki haan se, batch-batch karke, naye docs me laaye (testing ke niyam `docs/RULES.md` me, acceptance criteria module ki `TASK.md` me jab task files banein, risks `docs/RISKS.md` me).
- **Ids sirf is report ke:** `QA-Q1`... owner ke sawal (§5); `TR-1`... testing ke prastaavit niyam (§3); `AC-<MODULE>-1`... acceptance criteria (§2); `QR-1`... prastaavit risks (§7); `SJ-1`... sirf jaanch (§8); `LL-1`... lene layak (§9); `DH-1`... tay faislon pe dhyaan (§10). Tay faisle `D-xxx`, security niyam `SR-xxx`, kanooni rows `CL-xxx`, flows `FL-x`, design niyam `DS-x.y`, risks `R-xxx` apne asli number se.
- §1 se §4 ka har prastaavit vakya aisa likha hai ki seedha naye doc me ja sake (pehle ke kaam ka koi zikr nahi). Sirf §9 me purane paths ka naam hai.
- "Misaal" wale numbers settings me ya code ke saath pakke honge. Tools ke baare me jo baat is run me jaanchi nahi gayi, wo §8 (sirf jaanch) me hai, aur us pe tika prastaav "jaanch ke baad" likha hai.
- Maine koi test, install ya build nahi chalaya; sirf padhne wale commands (grep, ls, partial read) se naye docs aur purane kaam ki files padhi. Koi git command nahi.

**Testing se jude jo pehle se tay hain (dobara nahi chhede):**

| Vishay                                                                                                                                                   | Kahan tay                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Tools: Vitest aur Testing Library, Playwright (E2E), ESLint, Prettier, GitHub Actions; finance ke har niyam ka test, ek saath chalne wale requests samet | D-001                                    |
| Asli users maan ke concurrency, abuse aur scale ke tests                                                                                                 | D-012                                    |
| "Bana hai" sirf code ya test ki link se; CI me docs ke paths ka check                                                                                    | D-019                                    |
| Design target (1 lakh customers, 1,000 orders/din, sale pe 5 guna) sirf code aur tests ke liye; 5 guna peak ka load test laptop pe                       | D-283, ARCHITECTURE §9 niyam 1           |
| Teen jagah: laptop, CI, live; koi staging ya preview nahi; laptop, tests aur CI kabhi live databases ya live Redis se nahi                               | D-051, D-326 (OPERATIONS §1 niyam 1, 7)  |
| Laptop pe fakes: email local inbox, payment, push, media aur social sign-in ke fake adapters                                                             | OPERATIONS §1 niyam 8                    |
| Mutation ke liye alag containers alag ports pe, asli files ki copy me                                                                                    | OPERATIONS §1 niyam 5, CLAUDE.md         |
| CI: ek `check` job, `guard`, static, asli MongoDB replica set, Valkey aur PostgreSQL containers pe tests, E2E Playwright Chromium pe, repo ke pehre      | D-327 (OPERATIONS §2)                    |
| Migrations ka test (naya code purane data pe, purana code naye data pe)                                                                                  | OPERATIONS §2 niyam 6                    |
| Har run poora, jab tak ek run misaal 15 minute se upar na jaaye                                                                                          | OPERATIONS §2 niyam 12                   |
| Release se pehle laptop pe poora E2E aur 512 MB ka chhota naap; live smoke check                                                                         | OPERATIONS §3 niyam 1, 9                 |
| 512 MB pe memory ka naap Docker me, chaar halat, har naap 3 baar                                                                                         | D-335 (OPERATIONS §10)                   |
| Restore ka abhyaas har 3 mahine aur pehla R1 se pehle                                                                                                    | OPERATIONS §6 niyam 10                   |
| Packages ke tests kabhi asli npm registry ko nahi chhoote (fake registry); koi publish nahi                                                              | D-325, OPERATIONS §11 niyam 6, 8         |
| WCAG 2.2 AA; component tests aur E2E me automated accessibility (axe jaisa), serious ya critical ek bhi nahi; release se pehle haath ki checklist        | D-359 (DS-8.1)                           |
| Contrast ki jaanch CI me har semantic jodi pe; bundle ke budget CI me; Lighthouse ke page targets laptop pe                                              | DS-2.10, DS-10.9, DS-10.10               |
| Screens 320, 360, 768 aur 1280 pe test                                                                                                                   | DS-5.1                                   |
| Screenshot tests sirf mukhya screens (misaal 30) pe                                                                                                      | R-057 (D-368)                            |
| Har SR niyam ke saath "Test kaise"                                                                                                                       | SECURITY_REQUIREMENTS §0, D-209 se D-219 |
| Authorize pure function, mutation tests ke saath; route aur actor ka matrix test contracts se                                                            | SR-032                                   |
| Paise ka hisaab ek saajhe package se, mutation tests ke saath; refunds ka jod payment se kabhi zyada nahi, property tests                                | ARCHITECTURE §10.1 niyam 6, SR-047       |
| Laptop aur CI pe Atlas Search ki jagah MongoDB text index ka adapter                                                                                     | ARCHITECTURE §6 niyam 7                  |

## 1. Test strategy

### 1.1 Siddhaant

1. **Niyam se test, code se nahi:** har test kisi likhe niyam (D, SR, CL, FL, DS ya AC) ko jaanchta hai, aur test ke naam me us niyam ka id hota hai. Isse "test wahi jaanch raha jo code karta hai" wala jaal (QR-10) kam hota hai.
2. **Invariant pehle, flow baad me:** paisa, stock, permissions, idempotency aur events ke invariants neeche ke levels (unit, integration) pe poori gehrai se; E2E sirf ye dikhata hai ki flow judta hai.
3. **Asli database, nakli duniya:** databases hamesha asli engine (MongoDB replica set, PostgreSQL, Valkey) ke containers; bahar ki har service (payment, email, push, social sign-in, media, leak hue passwords ki API, maps) ka fake. Tests ka koi bhi request internet tak nahi jaata.
4. **Ghadi hamare haath me:** jis code ko "abhi" chahiye wo ek injected clock se leta hai, taaki 15 minute, 7 din, 1 April aur raat ki neend tests me seconds me chalein.
5. **Live jaisa bundle:** release ki E2E compiled JS aur bundle mode pe chalti hai, wahi start command aur flags ke saath jo live pe; split mode facade aur events ke contract tests me dono transport pe jaancha jaata hai.
6. **Imaandari:** "tests pass" aur "verified" alag shabd hain. Verified sirf asli user wale kaam ke baad (kisne, kab, kahan), jaise live smoke check.

### 1.2 Test levels

| Level                      | Kya pakadta hai                                                                                                                                           | Tool (prastaav)                                                                    | Kahan chalta hai                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| Unit                       | Pure logic: paisa aur tax (§1.8 ARCHITECTURE), authorize, seemaon ke counters ka hisaab, FEFO ka chunaav, check digit, `next` ki safai, CSV escape        | Vitest; property tests ke liye fast-check                                          | Har PR                                  |
| Component                  | UI component ka vyavhaar, keyboard, focus, error ki halat                                                                                                 | Vitest + Testing Library; accessibility asli browser me (TR-27)                    | Har PR                                  |
| Integration (service)      | Repository, transaction, conditional update, unique index, validator, outbox/inbox, timers, rate limits, sessions, PostgreSQL ke triggers aur constraints | Vitest, asli containers; har test worker ka alag database                          | Har PR                                  |
| Contract                   | Routes (contracts se), events (schema aur versions), facade calls (§2.3 ki sync list) dono transport pe                                                   | Vitest + contracts package ke fixtures                                             | Har PR                                  |
| End-to-end (browser)       | FL-1 se FL-20 ke poore flows kai apps ke saath, security headers, service worker, wake ka parda                                                           | Playwright, Chromium; backend bundle mode, built apps, fakes                       | Har PR (Chromium); baaki browsers QA-Q4 |
| Accessibility              | WCAG 2.2 AA ke automated hisse; contrast tokens pe                                                                                                        | axe-core (Playwright ke andar); DS-2.10 ka contrast script                         | Har PR; haath ki checklist release pe   |
| Visual                     | Mukhya screens ka bigadna (misaal 30 screens)                                                                                                             | Playwright screenshots, Linux container me hi                                      | Har PR (sirf mukhya), poora nightly     |
| Performance                | Bundle budget; page targets; server ke p95; design target pe load; 512 MB ka naap; ek flow me DB operations ki ginti                                      | Build ka size check; Lighthouse; k6 ya autocannon (SJ-7); OPERATIONS §10 ka script | §1.12 dekhein                           |
| Security                   | SR-xxx ke "Test kaise", IDOR matrix, XSS aur injection ki suchi, JWT ke hamle, headers, redaction, supply chain                                           | Upar ke levels ke andar + passive DAST (ZAP baseline, SJ-13)                       | Har PR; DAST nightly                    |
| Migration aur release step | Naya code purane data pe aur ulta; release step dobara chalne pe kuch nahi; lease; expand aur contract                                                    | Vitest + containers + fixtures ka "pichhla release" data                           | Har PR                                  |
| Backup aur restore         | Backup tool ka round trip containers pe; asli abhyaas laptop pe                                                                                           | Vitest + containers; OPERATIONS §6 ka abhyaas                                      | Har PR (tool); har 3 mahine (abhyaas)   |
| Mutation                   | Tests ki taakat sirf teen jagah (TR-21)                                                                                                                   | StrykerJS + Vitest runner (SJ-5 ke baad), copy me                                  | Laptop ya CI, QA-Q2 ke hisaab se        |
| Manual                     | Haath ki accessibility checklist (DS-8.1), asli phone, provider ka test mode, khoj wala testing                                                           | Checklist files                                                                    | Release se pehle (QA-Q5, QA-Q7)         |

### 1.3 Kab kya chalta hai

| Kab                                                | Kya                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Har PR aur `prerelease`, `release`, `main` pe push | Tay `guard` aur static; unit, component, integration, contract, migration aur backup-tool tests; Chromium pe saare 20 flows ki E2E (har app ek job), axe, mukhya screens ke screenshots, contrast script, bundle budget, collection scan aur `explain` ka pehra, retention class ka pehra, requirement ki ginti (TR-24) sirf report me |
| Nightly (sirf koshish, R-043)                      | WebKit aur Firefox (QA-Q4 ke hisaab se), poore screenshot set, passive DAST, E2E 3 baar (flaky pakadna), lambi ghadi wale scenarios (raat ki neend, mahine ka close). Scheduled run default branch se chalta hai par `prerelease` ka code checkout karta hai (SJ-15). Release ka koi gate nightly pe nahi tika                         |
| Release se pehle (laptop)                          | OPERATIONS §3 niyam 1 ka poora E2E aur 512 MB naap; design target ka load test (QA-Q9); Lighthouse 5 pages; haath ki accessibility checklist; asli phone (QA-Q5); provider ke test mode se milaan (TR-14); backup; requirement ki ginti me 0 kami (gate)                                                                               |
| Release ke baad (live)                             | OPERATIONS §3 niyam 9 ka smoke check, allowlist ke account se; uske baad hi HANDOFF me "verified"; smoke order ka kya, QA-Q10                                                                                                                                                                                                          |
| Har 3 mahine                                       | Restore ka abhyaas (tay), 512 MB ka dobara naap (tay)                                                                                                                                                                                                                                                                                  |

### 1.4 ₹0 aur free CI me fit

1. Public repo pe GitHub ke standard runners muft (OPERATIONS §2 niyam 1). Seema minutes ki nahi, ek saath chalne wali jobs aur har job ke samay ki hai (SJ-1); isliye jobs services ke group aur apps ke hisaab se baante, aur har job ka `timeout-minutes` tay.
2. Containers CI me wahi jo laptop pe (OPERATIONS §1 niyam 2, 3): MongoDB 8.0 ka single-member replica set, PostgreSQL wahi major jo Neon pe, Valkey me Render jaisi memory seema, local email inbox. Images exact version pe pinned.
3. Atlas, Neon, Render Key Value, Razorpay, Brevo, media provider: CI me kabhi nahi (D-051, OPERATIONS §1 niyam 7). Unke khaas vyavhaar (M0 ki seemaayein, Atlas Search ke operators, Neon ka pooler) ka gap §10 DH-1 aur §8 me.
4. Har test worker ka apna database aur Valkey ka apna key prefix (ARCHITECTURE §10.4 niyam 9), taaki tests ek saath chalein aur rate limits ek doosre ko na rokein.
5. Playwright ka browser aur container images cache se; E2E apps dev server pe nahi, build ki static copy pe (memory aur samay kam, live jaisa).
6. E2E fail ho to traces 7 din, bina personal data (OPERATIONS §2 niyam 9); screenshots aur traces me sirf fake data hota hai, isliye public artifact surakshit (TR-10).

### 1.5 Test data aur seeds

1. **Kabhi asli personal data nahi:** naam banawati, emails sirf reserved domains (`example.com`, `.example`, `.test`) pe, phone sirf format ke liye (kisi ko kuch nahi jaata), dastavez aur photos banawati. Allowlist ke asli emails repo me kabhi nahi; wo live pe setting me hi.
2. **Factories, fixtures nahi:** har service ki factory jo tay ObjectIds aur seed se data banaye; ek test sirf wahi banata hai jo use chahiye.
3. **Reference data** (chart of accounts, series, HSN table, roles, ingredients, settings) tests me bhi usi release step se (ARCHITECTURE §10.4 niyam 9), taaki test aur live ka reference data ek ho.
4. **Location ka chhota fixture:** Maharashtra → Pune → kuch sub-districts aur pincodes, saath me D-016 ke kathin case (ek pincode do sub-districts, do districts aur do states me; ek jaise naam; source me ek pincode ki kai lines). Poore India ka import sirf ek bade generated file se performance test me.
5. **Do sellers** jaise R1 me (D-055): apna brand Unibelle ka seller aur ek dummy brand; dono Maharashtra GSTIN (dummy, D-145) ke saath. Dummy numbers ki ek jagah list (D-145 niyam 7) tests bhi padhte hain.
6. **Demo seed** (live ke liye) alag: sirf reference aur catalog, `demo: true`, koi customer account nahi (ARCHITECTURE §10.4 niyam 9). Test seed kabhi live pe nahi chalta; boot pe jaanch (TR-11).

### 1.6 Bahar ki services ke fakes

| Bahar ki service                          | Fake kya karta hai                                                                                                                                                                                                                                                                                  | Kis niyam ke tests ke liye                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Payment gateway (Razorpay jaisa)          | Gateway order (rakam aur currency jaanch), checkout ka nateeja (success, fail, user ne chhoda), signature, webhooks (sahi aur galat signature, dobara, ulta kram, der se, kabhi nahi), refund (safal, fail, provider ki idempotency), UPI QR ki exact rakam, settlement report, chargeback ka event | SR-048 se SR-050, D-111, D-118, M1 milaan     |
| Email (Brevo jaisa)                       | Local inbox container (laptop aur CI); API ka fake jo 429 aur 5xx bhi de sake, aur har bheje email ko test ke liye rakhe                                                                                                                                                                            | D-126, D-140, D-142, SR-012, SR-073           |
| Browser push                              | Push service ka fake: payload rakhe, 404 aur 410 de sake; sirf allowlist wale hosts                                                                                                                                                                                                                 | D-195, SR-072, SR-074                         |
| Social sign-in (Google, LinkedIn, GitHub) | Teeno ke authorize, token aur user API; `state`, PKCE, `nonce` aur exact redirect URI ki jaanch asli jaisi; "agla insaan" ki line; verified ya unverified email; cancel                                                                                                                             | D-021, SR-017                                 |
| Media provider                            | Signed upload URL (type, size, samay), private file ka chhota URL aur expiry, EXIF hatane ka nateeja, type ki rok, list API (hafte ka milaan), delete                                                                                                                                               | SR-061, SR-062, ARCHITECTURE §7               |
| Leak hue passwords ki range API           | k-anonymity range ka jawab; band ya 5xx (nishaan wala raasta)                                                                                                                                                                                                                                       | SR-013                                        |
| Maps (Ola Maps)                           | Search, reverse aur pin ke jawab; load na ho to sirf form                                                                                                                                                                                                                                           | D-347, DS-7.10                                |
| npm registry                              | Chhota local registry: asli npm CLI publish kare, `whoami` aur package documents de; publish fail aur session khatam jaise haalat                                                                                                                                                                   | D-023, D-325, OPERATIONS §11 niyam 8          |
| Edge (Vercel ka rewrite)                  | Test proxy: `/api/*` ko gateway pe bheje, secret header aur forwarded IP jode (har test ka apna IP de sake), aur 502 ya 504 bhi de sake                                                                                                                                                             | SR-002, SR-003, DS-6.9, OPERATIONS §5 niyam 8 |

Har fake ka apna chhota test, aur har fake ka vyavhaar provider ke docs ke saath likha (fake ka "contract"). Provider ka asli test mode sirf release se pehle ke milaan me (TR-14), test key sirf us din (OPERATIONS §1 niyam 8).

### 1.7 Ghadi aur samay

1. Business code `Date.now()` ya `new Date()` seedha nahi bulata; ek `Clock` port (UTC ka abhi, aur `istDay`) inject hota hai. Lint isse pakde (TR-13).
2. Unit tests me fake clock; integration me clock aage badhao aur ticker ka ek "tick" haath se chalao (koi asli intezaar nahi).
3. E2E me ghadi ka koi route app me nahi hota: E2E ka harness us run ke database me timer ka `dueAt` peeche karta hai aur sweep chalata hai, ya process ko fake clock ke saath chalata hai. Production bundle me koi test route ya test switch nahi (TR-11).
4. Zaroori samay wale scenarios: 15 minute ka reservation (D-118), payment fail pe 10 minute (D-109), hub pe 3 din (D-108), return ki khidkiyan 48 ghante, 7 din, 30 din (D-221, D-148), payable (D-081, D-369), hafte ka payout, mahine ka TCS aur close, 1 April pe nayi series (§1.7 niyam 5), raat 11:30 PM IST ka invoice usi din ka (§1.1 niyam 6), session ki umar aur 30 minute idle (D-180, D-181), invite 72 ghante, step-up 5 minute, signed URL 5 aur 10 minute, idempotency 48 ghante, delete ke 7 din.
5. **Raat ki neend:** server 22:00 se 09:00 IST soya (D-322). Test: process 11 ghante band, phir boot; due timers pakde jaayein (late, par khoye nahi; ARCHITECTURE §4 niyam 1), aur roz ke kaam har chhoota din kram se banayein (§4 niyam 6).

### 1.8 Contract tests

1. **Routes:** har route ka contract ek jagah (ARCHITECTURE §5 niyam 1). Tests: (a) gateway ka manifest = contracts (contract ke bahar ka route pahunch se bahar, SR-032); (b) har route × har actor ka matrix contracts se bana (SR-032, SR-035); (c) har non-public route pe `private, no-store` (SR-004); (d) har jawab apne output schema se milta hai, aur seller ke jawab ke schema me customer ki personal jaankari ke fields hi nahi (SR-036); (e) idempotency wale routes (§5 niyam 10) ki list contract me aur test me ek.
2. **Events:** har event type ka zod schema aur har version ki fixture contracts package me. Producer test: bheja event schema se mile, size 16 KB tak, aur me forbidden fields na hon (§3 niyam 8: OTP, delivery code, password, token, bank, PAN, poora address). Consumer test: abhi ka aur pichhla version dono samjhe (§3 niyam 9); wahi event dobara pe koi asar nahi; ek aggregate ke events ulte kram me aayein to sahi aakhri halat.
3. **Facade calls** (§2.3 ki list): har facade ka ek saajha contract test suite, jo bundle mode ke in-process aur split mode ke signed HTTP dono pe chale. Sync calls ka graph bina chakkar ka (tay CI check, §2.4 niyam 9).

### 1.9 Integration ki gehrai

1. **MongoDB:** test container me test commands chalu, taaki failpoint se commit fail karwa ke transaction helper ka retry jaancha ja sake (transient error pe poora kaam dobara; commit ka nateeja anjaana ho to sirf commit dobara; 10 second ke baad 503; ARCHITECTURE §10.2 niyam 1). Validators galat document (jaise rakam `double`) mana karein (§10.4 niyam 7). Har repository query ka `explain` index se (tay pehra). TTL aur indexes ki definitions test me jaanchi jaayein, TTL ke asli mitne ka intezaar nahi (DH-9).
2. **PostgreSQL:** `journal_balanced` deferred trigger, insert-only triggers, band mahine ka trigger, CHECK constraints (`doc_no` ka roop, `approved_by <> created_by`, `char(24)` hex), `40001` aur `40P01` pe dobara koshish, statement timeout (ARCHITECTURE §10.6).
3. **Valkey:** memory seema aur eviction live jaisi; Valkey khaali karne ke baad sessions ke band hone ka sach DB se (SR-029); Valkey na mile to fail-closed routes 503 aur padhna chalta (SR-008); job ka payload schema se (SR-070).
4. **Ek saath chalne wale requests:** paise, stock aur "ek hi" wali cheezon ke har niyam ka test N requests ek saath bhej ke (D-001 ka finance niyam, D-012).
5. **DB operations ki ginti:** har mukhya flow (place order, pack, delivery scan) me database operations gine jaayein aur ek budget se upar jaane pe test fail (DH-5), kyunki container me M0 ki 100 ops/second ki seema nahi hoti.

### 1.10 End-to-end: flows se tests

Har flow ki ek E2E spec, `FL-x` naam ke saath; har spec "Fail ho to" wale hisse ke kam se kam do raaste bhi chalaati hai.

| Flow                             | Apps (browser contexts)                                  | Fakes aur ghadi                              | Mukhya jaanch                                                                                                                          |
| -------------------------------- | -------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| FL-1 Sign-up                     | Customer                                                 | Email inbox, leak API                        | Allowlist ke bahar "demo store"; ek jaisa jawab; consent ka record version ke saath; 18+                                               |
| FL-2 Sign-in                     | Customer                                                 | Social fake, email inbox                     | Teen raaste; authenticator ke saath; rok aur reset; "My devices"                                                                       |
| FL-3 Staff sign-in aur bada kaam | Master, Admin                                            | Authenticator ka code generator              | Invite, recovery codes, har sign-in pe code, StepUpDialog, idle warning                                                                |
| FL-4 Partner sign-in             | Delivery, Logistics Ops                                  | Ghadi (14 din)                               | Phone ki manzoori, doosra phone, Hub Manager se session band                                                                           |
| FL-5 Account delete              | Customer, Master (dekhne ko)                             | Ghadi (7 din)                                | Wapsi ki khidki; 7 din baad har service me pehchaan gayab; invoice aur review D-305 jaisa                                              |
| FL-6 Area, pincode, waitlist     | Customer, Admin, Super Admin, Master                     | Push fake                                    | Pincode → ek hub; switch aur live alag; waitlist ki khabar; area band hone ka kram (D-300)                                             |
| FL-7 Prepaid order               | Customer                                                 | Payment fake (sab haalat), ghadi (15 minute) | Server ka total; idempotent place order; sirf webhook ya signature se paid; der se payment; "paisa kata, order nahi bana"; kill switch |
| FL-8 Delivery pe UPI             | Customer                                                 | Payment fake                                 | Seema (pehla order, kul rakam, 2 khule); tareeka na dikhne ki wajah                                                                    |
| FL-9 Pack se delivery            | Logistics Ops, Delivery, Customer                        | Payment fake (QR), media fake, geolocation   | Pack ke teen kadam aur invoice; trip; code ka milaan; photo wali delivery; offline line; finance band to pack ruka                     |
| FL-10 Delivery fail aur RTO      | Delivery, Logistics Ops, Customer                        | Ghadi (3 din)                                | Do koshish; RTO; hub scan pe refund; fail refund ka staff raasta                                                                       |
| FL-11 Cancel                     | Customer, Logistics Ops                                  | Payment fake                                 | Item aur quantity; refund rakam; pack aur cancel ek saath pe server jeete                                                              |
| FL-12 Return se refund           | Customer, Delivery, Logistics Ops, Support Desk, Finance | Media fake, ghadi                            | Muddat wajah se; auto manzoori; seema; pickup pe batch aur seal; jaanch ke baad refund; return fee; seller ka statement                |
| FL-13 "Parcel nahi mila"         | Customer, Support Desk                                   | Ghadi (48 ghante, 7 din)                     | Code wali delivery pe daawa nahi; photo wali pe khidki; signals                                                                        |
| FL-14 Appeal                     | Customer, Support Desk                                   |                                              | Ek appeal; faisla doosra account                                                                                                       |
| FL-15 Seller onboarding          | Seller, Admin                                            | Media fake                                   | Ek brand ek seller; seller block ke bina live nahi; bank pe step-up; appeal alag insaan                                                |
| FL-16 Listing se live            | Seller, Admin, Customer                                  | Media fake                                   | Version pe manzoori; blocklist pe submit nahi; claims ka saboot; jokhim wale field pe dobara jaanch                                    |
| FL-17 Maal warehouse me          | Seller, Logistics Ops                                    | Media fake                                   | ASN; expiry seema; barcode label; accept scan se stock aur storage ki ghadi                                                            |
| FL-18 Payout                     | Finance, Master, Seller                                  | Ghadi (return khidki, hafta)                 | Payable ki muddat; set-off; do haath; naya bank 72 ghante; statement aur CSV                                                           |
| FL-19 Review likhna              | Customer, Admin                                          | Media fake                                   | Haq; ₹0 line pe nahi; moderation; listing version                                                                                      |
| FL-20 Review ki report           | Customer, Admin                                          | Ghadi (24 ghante, 2 ghante)                  | Seema; nagnata wali report pe turant chhupna; doosra moderator appeal tay kare                                                         |

Ek "poora R1" spec bhi: area khulna se seller ka payout tak, saare apps ek ke baad ek (PROJECT_PLAN §1 ka lakshya), aur aakhir me finance ke milaan M1 se M5 me koi farak nahi.

### 1.11 Accessibility aur visual

1. Axe asli browser me chale: components ki playground pages pe Playwright se, aur E2E ki har screen pe. jsdom me rang aur contrast nahi gine jaate, isliye component ka accessibility test jsdom pe kaafi nahi (TR-27).
2. Har E2E screen light aur dark dono me axe (D-342); high contrast sirf Delivery ki screens (Sunlight mode default, DS-5.8) aur sign-in, checkout pe.
3. Har mukhya screen 320, 360, 768 aur 1280 pe (DS-5.1): 320 pe horizontal scroll nahi (`scrollWidth` ki jaanch), focus sticky header ya neeche ki bar ke neeche na chhupe (DS-8.3).
4. Screenshot tests sirf mukhya screens pe (R-057), sirf Linux container me (Windows aur Linux ke fonts ka farak, SJ-6), animations band, fonts self-hosted (D-341). Baseline sirf ek tay command se badle, PR me dikhe.
5. Haath ki checklist (DS-8.1) har release se pehle; kis screen reader pe, QA-Q6.

### 1.12 Performance

| Kya                                    | Kahan aur kab                           | Seema (tay ya misaal)                                                                                             |
| -------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Bundle ka size                         | CI, har PR                              | DS-10.9 (Customer JS 170 KB, staff aur partner 250 KB, CSS 30 KB)                                                 |
| Page ke targets                        | Laptop, release se pehle, 5 pages       | DS-10.10 (LCP 2.5 s, CLS 0.1, INP 200 ms)                                                                         |
| Server ke p95 (D-053, jaage server pe) | Laptop, Docker 512 MB, release se pehle | ARCHITECTURE §9 ke targets; kis CPU seema pe naapna, DH-4                                                         |
| Design target ka load (D-283)          | Laptop, QA-Q9 ke hisaab se              | 1,000 orders/din ka 5 guna peak; aakhri unit pe takraav (R-037); 409 aur 503 ka hissa; data ki sahi halat baad me |
| 512 MB ka naap                         | Tay (OPERATIONS §10)                    | Aam RSS 400 MB se neeche, koi OOM nahi                                                                            |
| DB operations ki ginti                 | CI, har PR (integration)                | Har flow ka budget (TR-19)                                                                                        |

Load test ke baad sirf samay nahi, data bhi jaancha jaata hai: stock kabhi minus nahi, har order ka reservation aur movement mile, outbox me koi atka event nahi, finance ke journal barabar.

### 1.13 Security tests

| SR ka hissa                                    | Kaun sa level                                                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| SR-001 se SR-010 (edge aur hosting)            | Gateway ke integration tests; har app ke headers, CSP aur service worker E2E me                       |
| SR-011 se SR-031 (sign-in, sessions, tokens)   | Identity ke integration tests (ghadi ke saath); FL-1 se FL-4 E2E; JWT ke hamle unit me                |
| SR-032 se SR-039 (authorization)               | Contracts se bana route × actor matrix; har resource pe doosre customer aur seller ki id se 404       |
| SR-040 se SR-053 (catalog, checkout, paisa)    | XSS aur injection ki suchi har text field pe; concurrency aur property tests; finance ke triggers     |
| SR-054 se SR-060 (delivery, daawe, reviews)    | Logistics aur catalog ke integration; FL-9, FL-13, FL-19, FL-20                                       |
| SR-061 se SR-067 (files, personal data)        | Media fake ke saath upload ke polyglot files; plaintext pattern ki jaanch; delete ke baad har service |
| SR-068 se SR-074 (data stores, khabrein)       | Service A ke DB user se B ka database mana (containers me alag users); SSRF allowlist; push           |
| SR-075 se SR-084 (export, audit, logs, DevOps) | CSV injection; audit chain ki chhed-chhaad; logs ki redaction; secret scan aur workflow lint (tay)    |
| SR-088                                         | Seller export me invoice ki copy nahi; har download audit me                                          |

Kuch niyam ka saboot test nahi, record hai: SR-064 (schema ki review checklist), SR-081 (providers pe MFA ki checklist), SR-084 (abhyaas ka record). Release gate me inka record dekha jaata hai (§4.2).

### 1.14 Migration, release step aur rollback

1. Release step dobara chalne pe kuch nahi badalta (fingerprint); do instances ek saath boot karein to lease ke peeche sirf ek chale (ARCHITECTURE §10.4 niyam 1, OPERATIONS §3 niyam 4).
2. Schema wala hissa listen se pehle aur lambi data migration listen ke baad (OPERATIONS §3 niyam 5): test me lambi migration ke chalte hue `/health` 200 aur naye requests chalte rahein.
3. Expand aur contract: ek PR me ek hi field ya index ka jodna aur hatana dono ho to CI laal (R-041); "contract baaki" ki list release note me.
4. Tay test (naya code purane data pe, purana code naye data pe) ke liye har release ki ek chhoti "pichhle release ka data" fixture, factories se banti hai.
5. Finance ki SQL migrations: checksum badla to fail; sirf aage; advisory lock ke peeche ek hi chale (Neon ke pooler pe lock, SJ-10).
6. Rollback ka abhyaas: release N ke data pe release N-1 ka code (OPERATIONS §3 niyam 7) chale aur smoke spec pass ho.

### 1.15 Backup aur restore

1. Backup tool ka round trip CI me containers pe: seeded data → encrypted backup → doosre container me restore → har collection ki ginti aur hash, audit chain ka verify, finance ke journal barabar, aur delete hue accounts ki list se deletes dobara (SR-083, OPERATIONS §6 niyam 8, 9). Bina key backup na khule.
2. Backup me koi key nahi, encrypted fields encrypted hi (OPERATIONS §6 niyam 5): backup file me plaintext ka pattern test.
3. Asli abhyaas laptop pe har 3 mahine aur R1 se pehle (tay); nateeja OPERATIONS ki abhyaas wali table me.

### 1.16 COMPLIANCE rows ke automated checks

Test sirf ye jaanchta hai ki row ka "System me kya chahiye" system me hai; kanooni sahi-galat ki raay test nahi deta.

| Row                            | Automated check                                                                                         | AC                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------- |
| CL-003, CL-131                 | Bina gap number, FY aur GSTIN ki series, cancel ka record; books sirf jodte                             | AC-FINANCE-1, -2, -3         |
| CL-005, CL-129                 | Credit note asli invoice aur line ke hawale ke saath; return fee aur delivery fee ki wapsi ke documents | AC-FINANCE-6, -7             |
| CL-019, CL-084                 | Ek parcel me har seller ka alag invoice; seller ka naam sabse upar                                      | AC-FINANCE-5                 |
| CL-020                         | ₹50,000 se kam pe sirf state; upar naam aur pata                                                        | AC-FINANCE-11                |
| CL-025, CL-031, CL-074         | MRP taxes samet, batch ka MRP aur revised MRP, kata MRP ke saath 30 din ka sabse kam daam               | AC-CATALOG-4, AC-CUSTOMER-3  |
| CL-026, CL-029, CL-030, CL-036 | Product details ke zaroori fields ke bina listing submit nahi; 10 g ya 10 ml tak MRP chhapa ho          | AC-CATALOG-6                 |
| CL-032, CL-041                 | Agle batch ki expiry "Use before" ya "Expiry" ke roop me har jagah                                      | AC-COMMERCE-4, AC-CUSTOMER-3 |
| CL-043, CL-048                 | Ingredients poore; blocklist wala ingredient submit nahi                                                | AC-CATALOG-7                 |
| CL-060, CL-061                 | Seller ka block ke bina live nahi; return ki line product page, order aur invoice pe                    | AC-CATALOG-8, AC-CUSTOMER-4  |
| CL-066                         | Kram me kisi seller ka boost nahi; "How results are ranked" ki link                                     | AC-CATALOG-10                |
| CL-070 se CL-073, CL-078       | Koi pehle se tick nahi; delivery fee alag line; cancel fee nahi                                         | AC-CUSTOMER-5, AC-COMMERCE-9 |
| CL-079, CL-080                 | Demo ki patti har app pe; legal pages pe badge, version aur tareekh; PDF pe SPECIMEN                    | AC-CUSTOMER-8, AC-FINANCE-12 |
| CL-089, CL-101, CL-102         | Har consent ka record notice ke version ke saath; marketing alag aur khaali; 18+ ka record              | AC-IDENTITY-11               |
| CL-093, CL-106                 | Retention class har collection pe; kanooni rok; logs 180 din aur UTC                                    | AC-PLATFORM-11, AC-LOGS-2    |
| CL-105                         | Content ki shikayat ke samay (D-251)                                                                    | AC-CATALOG-12                |
| CL-109                         | "Paisa kata, order nahi bana" aur der se captured pe ek hi refund                                       | AC-PAYMENTS-4                |

### 1.17 Flaky tests

1. Flaky ka matlab: wahi commit, wahi test, kabhi pass kabhi fail. Har flaky ka ek issue aur owner ko dikhna.
2. Paisa, stock, permissions, idempotency aur events ke tests kabhi quarantine nahi: unka flaky hona bug maana jaata hai (race asli ho sakta hai).
3. Baaki pe retry ki chhoot hai ya nahi, ye QA-Q3. Jo bhi jawab ho, retry se pass hua test summary me "flaky" ke roop me dikhe, chupke se green nahi.
4. Asli intezaar (`sleep`) tests me mana; intezaar sirf halat pe (Playwright ke auto-wait, ya event ke aane tak).

### 1.18 Coverage aur requirement ki ginti

1. **Line coverage** Vitest ke v8 coverage se, area ke hisaab se alag seema (prastaav: kernel packages 90% branch, paisa, stock aur permissions ke modules 85% branch, baaki 70% lines). Gate kitna sakht, QA-Q1.
2. **Requirement ki ginti** line coverage se zyada kaam ki: ek script tests ke naamon se ids (`SR-045`, `FL-7`, `AC-COMMERCE-3`, `CL-003`) nikaale aur R1 ki list (SECURITY_REQUIREMENTS, FLOWS, TASK.md ke ACs, COMPLIANCE ke R1 rows) se milaaye. PR pe sirf report; release gate pe R1 ki koi kami 0 (TR-24).

### 1.19 Mutation testing (CLAUDE.md ke hisaab se)

1. **Sirf teen jagah:** (a) kernel packages: pehli baar poora run background me, phir sirf badli lines; (b) paisa, stock aur permissions ke code me sirf badli lines; (c) baaki apps aur modules me mutation nahi.
2. **Kernel packages ki prastaavit list** (TR-21): paisa aur tax ka package (ARCHITECTURE §10.1 niyam 6), authorize aur kaam ke bantwara ke pure checks (SR-032, SR-038), transaction helper, outbox aur inbox, timers aur lease, idempotency, field encryption aur blind index, release step, contracts se route manifest, audit ki hash chain, rate limit ka counter, aur config schema.
3. **Paisa, stock, permissions** ka matlab: finance ki saari posting aur numbering, refund ka hisaab, place order aur reservation, FEFO, pack, cancel, seemaon ke counters (D-091, D-109, D-188, D-204), grants aur scope, step-up ki list.
4. **Tool (prastaav, SJ-5 ke baad):** StrykerJS Vitest runner ke saath. Stryker apne sandbox me copy banata hai, asli files nahi chhoota; sandbox repo ke bahar (OS ke temp folder) ya aisi jagah jo dev server aur watchers nahi dekhte. Badli lines ke liye ek chhota script `git diff` se files aur line ranges nikaal ke Stryker ko deta hai; Stryker ka incremental mode purane nateeje dobara use karta hai.
5. **Containers:** mutation ke backend tests alag containers alag ports pe (tay, OPERATIONS §1 niyam 5), kabhi development wale nahi.
6. **Bacha mutant:** ya naya test, ya package ke saath likhi wajah ("equivalent: ..."); bina wajah ka bacha mutant = run fail. Gate kitna sakht aur kahan chale (laptop ya CI), QA-Q2.
7. **Vikalp jo nahi chuna:** haath se likhi mutation lists (har package me tay galtiyan). Tez aur sateek, par galtiyan wahi jo likhne wale ko soojhein, aur code badalne pe lists purani padti hain.

### 1.20 Haath ka testing aur "verified"

1. Haath ki teen cheezein: DS-8.1 ki accessibility checklist (tay), asli phone pe Delivery aur Customer (QA-Q5), aur flows pe khoj wala testing (QA-Q7).
2. Har haath ke check ka chhota record: kya, kis device aur browser pe, kisne, kab, nateeja. Isi record se HANDOFF ya release note me "verified" likha ja sakta hai.
3. Provider ke asli test mode se milaan (TR-14) bhi haath ka kaam hai, kyunki usme social sign-in ke asli pages aur payment ke asli test pages aate hain.

## 2. Acceptance criteria (R1)

**Roop:** har criterion ek line me **Given / When / Then**, saath me uska faisla, SR ya flow. Ye module ki `TASK.md` ke "acceptance criteria" hisse ke liye hain (docs/tasks/README.md); har criterion ka kam se kam ek automated test, jiske naam me criterion ka id ho (TR-24). Numbers "misaal" hain, settings se.

**R1 ke apps:** Customer, Seller, Admin, Super Admin, Master, Support Desk, Finance, Logistics Ops, Delivery (PROJECT_PLAN §1). Growth Studio aur Creator R2 (§2.24).

### 2.1 PLATFORM (saajhe packages)

1. **AC-PLATFORM-1** (D-311; ARCHITECTURE §10.2 niyam 1): **Given** commit pe transient error (failpoint se), **When** kaam chale, **Then** poora kaam ek baar dobara chale aur asar sirf ek; commit ka nateeja anjaana ho to sirf commit dobara; kul misaal 10 second ke baad 503.
2. **AC-PLATFORM-2** (D-292; §3 niyam 1): **Given** producer ka badlav aur uska event, **When** transaction rollback ho, **Then** na badlav bache na outbox me event; HTTP jawab sirf commit ke baad.
3. **AC-PLATFORM-3** (D-292; §3 niyam 4): **Given** wahi event ek subscriber ko 3 baar mile, **When** handler chale, **Then** asar ek hi baar aur `processed_events` me ek hi row.
4. **AC-PLATFORM-4** (§3 niyam 5; §10.2 niyam 10): **Given** ek order ke do events aur pehle ka handler fail, **When** dispatcher chale, **Then** doosra event us subscriber ko tab tak nahi jaata jab tak pehla na ho jaaye, aur baaki orders ke events chalte rahein.
5. **AC-PLATFORM-5** (§3 niyam 6; §10.2 niyam 11): **Given** handler ki apni galti, **When** misaal 8 koshish poori hon, **Then** dead letter aur ops alert; **Given** subscriber ka database band (jaise finance ruka), **Then** koshish ki ginti nahi badhti.
6. **AC-PLATFORM-6** (D-293, D-322; §4 niyam 1, 4, 6): **Given** do instances ek saath (deploy), **When** ticker chale, **Then** har due timer ek hi baar; **Given** process 11 ghante band, **When** boot ho, **Then** saare due timers pakde jaayein aur roz ke kaam har chhoota din kram se banayein.
7. **AC-PLATFORM-7** (R-010; §4 niyam 2): **Given** Valkey khaali ho gaya, **When** ticker chale, **Then** "pending par queue me nahi" wale kaam dobara queue me aayein aur koi kaam do baar na chale (job id = record id).
8. **AC-PLATFORM-8** (SR-045; §5 niyam 10): **Given** idempotency key wala route, **When** wahi key wahi body ke saath aaye, **Then** pehla jawab; alag body pe 422; pehla abhi chal raha ho to 409; 5xx yaad nahi rakha jaata; record misaal 48 ghante.
9. **AC-PLATFORM-9** (SR-047; ARCHITECTURE §1.8, §10.1 niyam 5): **Given** random daam, rates aur quantity (property test), **When** tax nikle, **Then** taxable + CGST + SGST = daam bilkul, ₹49 pe 5% = ₹46.66 + ₹1.17 + ₹1.17, chhoot ka bantwara jod me barabar, aur kahin float nahi.
10. **AC-PLATFORM-10** (SR-063; §10.3 niyam 5): **Given** record A ka encrypted field, **When** use record B ya doosre field me copy karke kholein, **Then** khulna fail; database me plaintext ka pattern kahin nahi.
11. **AC-PLATFORM-11** (R-040, D-250, D-321; §10.3 niyam 1, 3, 4): **Given** nayi collection bina retention class ya delete handler ke, **When** CI chale, **Then** fail; **Given** personal data ka erase, **Then** field hatna, rok ki copy aur event ek transaction me, aur `tech` class ke records rok me nahi.
12. **AC-PLATFORM-12** (D-329; OPERATIONS §1 niyam 9, §4 niyam 4, 5): **Given** config me anjaan ya kam key, **When** boot ho, **Then** process key ke naam ke saath (value ke bina) ruke; payments test mode me hon aur key live wali ho to process na uthe; har config key `.env.example` me aur `.env.example` me koi anjaan key nahi.

### 2.2 GATEWAY

1. **AC-GATEWAY-1** (SR-002): **Given** `/api/*` request, **When** secret header na ho ya galat ho, **Then** 403; webhook bina signature 401; `/health` aur `/wake` bina secret chalein; secret badalte waqt purani aur nayi dono values maani jaayein.
2. **AC-GATEWAY-2** (SR-003): **Given** jhootha `X-Forwarded-For` bina secret header ke, **When** request aaye, **Then** connection ka IP hi gina jaaye; IPv6 ek /64 ke andar ek gina jaaye.
3. **AC-GATEWAY-3** (SR-008): **Given** har seema, **When** seema se ek upar request ho, **Then** 429 aur `Retry-After`; **Given** Valkey band, **Then** sign-in, codes, payment shuru, review, report aur daawa 503, aur product page 200.
4. **AC-GATEWAY-4** (SR-029): **Given** session band kiya gaya aur phir Valkey khaali, **When** agli request aaye, **Then** 401 (sach database se); role khatam hone ke baad agli call 403.
5. **AC-GATEWAY-5** (SR-030): **Given** badalne wala route, **When** doosre origin se ya custom header ke bina POST aaye, **Then** 403; social sign-in ke start aur callback sirf GET aur bina doosre asar ke.
6. **AC-GATEWAY-6** (SR-032, SR-035): **Given** contract ke bahar ka path, **When** bulaya jaaye, **Then** pahunch se bahar; "public" na ho to bina session 401; Customer app ke token se staff ka route 403.
7. **AC-GATEWAY-7** (SR-007): **Given** JSON body misaal 100 KB se bada, **When** aaye, **Then** 413; request misaal 30 second pe kat-ti hai; `/health` ka jawab sirf "ok", na version na database.
8. **AC-GATEWAY-8** (D-294; §5 niyam 5): **Given** `X-App-Version` app ke kam se kam version se purana, **When** request aaye, **Then** 426; Delivery ka sync route pichhla version bhi maane.
9. **AC-GATEWAY-9** (SR-077; §5 niyam 8, §8 niyam 1): **Given** koi bhi error, **When** jawab jaaye, **Then** ek hi roop `{"error": {"code", "message", "details", "requestId"}}`, 500 pe stack nahi, aur wahi request id logs, facade calls, events (`correlationId`) aur audit me.

### 2.3 IDENTITY

1. **AC-IDENTITY-1** (D-133, SR-018): **Given** allowlist ke bahar ka email, **When** koi bhi raasta try ho (password sign-up aur sign-in, social ka pehla sign-in, email code, invite accept, seller aur partner sign-up, waitlist), **Then** account nahi aur "demo store" ka sandesh; allowlist se email hate to uske saare sessions band aur agli call 401.
2. **AC-IDENTITY-2** (SR-019): **Given** ek registered aur ek anjaan email, **When** sign-in, sign-up, reset ya code maangein, **Then** jawab ka body ek jaisa aur kam se kam tay samay (misaal 400 ms) ke baad; anjaan email pe koi email nahi.
3. **AC-IDENTITY-3** (SR-015; §10.7 niyam 2): **Given** customer ka email code, **When** 6th galat koshish, 11 minute baad, ya doosre browser se daala jaaye, **Then** mana; ek code ek hi baar; do sahi submit ek saath pe sirf ek session.
4. **AC-IDENTITY-4** (D-182, SR-014): **Given** ek IP se 10 galat koshish, **When** agli koshish, **Then** us IP ki 1 ghante rok, par doosre IP se sahi password chale; sab IPs se 50 galat pe account 15 minute ruke; rok me bhi password reset chale; owner ko alert.
5. **AC-IDENTITY-5** (SR-013): **Given** naya password, **When** 11 akshar, 129 akshar ya leak hua ho, **Then** mana; 12 aur 128 chalein; leak ki API band ho to password maana jaaye, account pe nishaan, aur agle sign-in pe dobara jaanch.
6. **AC-IDENTITY-6** (SR-028, D-180, D-181, D-183): **Given** refresh token badal chuka, **When** purana token doosre device se aaye, **Then** poori family band aur security email; usi device se misaal 60 second ke andar aaye to chori nahi maana jaata; session ki umar aur bina kaam ka band hona har app parivaar ke niyam se (ghadi ke saath test).
7. **AC-IDENTITY-7** (SR-031, D-186): **Given** `alg:none`, HS256 ka khel, doosre app ka `aud` ya expired token, **When** kisi app pe aaye, **Then** 401; signing keys na milein to 503, 401 nahi.
8. **AC-IDENTITY-8** (D-021, SR-017): **Given** social sign-in, **When** `state` badla ho, PKCE na ho, ya provider ka email verified na ho, **Then** sign-in ya maujooda account se jod nahi; band account pe social sign-in bhi band; aakhri sign-in tareeka hatana mana.
9. **AC-IDENTITY-9** (D-199, D-185, SR-011, SR-026): **Given** staff app, **When** bina authenticator code ya wahi code dobara se sign-in ho, **Then** mana; D-185 ki list ka kaam bina taaza code ke 403, aur misaal 5 minute ki khidki ke baad naya code.
10. **AC-IDENTITY-10** (SR-022, SR-025, D-200): **Given** invite, **When** dobara, misaal 72 ghante ke baad, ya doosre email se use ho, **Then** mana; recovery code ek hi baar; authenticator reset pe saare sessions band, security email aur owner ko alert; D-200 ke bahar ka role reset kare to 403.
11. **AC-IDENTITY-11** (D-038, D-255, CL-089, CL-101, CL-102): **Given** sign-up, **When** account bane, **Then** har consent ka record (notice ka version, samay, raasta) sirf jodne wala, marketing opt-in alag aur khaali shuru, aur 18+ ki ghoshna ka record.
12. **AC-IDENTITY-12** (D-151, D-304, SR-016, SR-066): **Given** account delete, **When** dobara pehchaan ke baad maanga jaaye, **Then** misaal 7 din me wapsi ho sake, aur 7 din baad `identity.account.erased` har service ke handler (ARCHITECTURE §10.3 ki table) tak pahunche; wahi email doosre app parivaar me alag account ho sake.

### 2.4 NOTIFY

1. **AC-NOTIFY-1** (D-126, D-289, D-302): **Given** ek seedha prepaid order jo delivered ho aur phir return ke baad refund ho, **When** poora safar chale, **Then** customer ko emails sirf confirmation (delivery code ke saath, paise ki line), invoice (sirf saar, PDF aur link nahi) aur refund; baaki halat in-app aur push.
2. **AC-NOTIFY-2** (D-131): **Given** customer ka push band, **When** delivery fail ho ya pick pe kami ka sawal aaye, **Then** email bhi jaaye.
3. **AC-NOTIFY-3** (D-142; §10.7 niyam 3): **Given** "baaki" line ki din ki chhat bhar chuki, **When** OTP maanga jaaye, **Then** OTP jaaye (misaal 60 pakke); chhat paar wale emails agle din ki line me; 80% pe chetavni; ek saath bheje emails pe counter chhat se upar na jaaye.
4. **AC-NOTIFY-4** (SR-015; §2.3, §10.7 niyam 3): **Given** identity se code ka email, **When** bheja jaaye, **Then** code notify ke database, outbox aur logs me kahin nahi.
5. **AC-NOTIFY-5** (SR-012, SR-073): **Given** har template, **When** bane, **Then** links sirf apne app ke host pe, staff ke emails me koi link nahi, naam me `<script>` escape ho, aur CRLF se header na jude.
6. **AC-NOTIFY-6** (D-195, SR-072, SR-074): **Given** push, **When** bheja jaaye, **Then** payload me sirf order number aur halat; sign-out pe us browser ki subscription hate; 404 ya 410 pe subscription delete; anjaan host wali subscription save nahi.
7. **AC-NOTIFY-7** (D-140): **Given** seller aur staff ki kaam rokne wali khabrein, **When** din chale, **Then** din ka ek saar (misaal 09:00 IST ke baad pehli jaag pe), aur account aur paise ki emails turant.
8. **AC-NOTIFY-8** (§5 niyam 12; §10.7 niyam 3): **Given** email provider 429 ya 5xx de, **When** job chale, **Then** dobara koshish sirf queue se (request ke andar nahi), aur job id = record id ki wajah se ek email ke do record nahi bante.

### 2.5 PAYMENTS

1. **AC-PAYMENTS-1** (SR-048): **Given** checkout, **When** payment shuru ho, **Then** gateway ka order server banaye exact rakam aur currency ke saath; sirf browser ka "success" aane pe order unpaid rahe.
2. **AC-PAYMENTS-2** (SR-049; §10.7 niyam 4): **Given** webhook, **When** body badli ho, **Then** 401; **When** wahi event id 3 baar aaye, **Then** ek hi asar (event id `_id` pe, asar ke transaction me).
3. **AC-PAYMENTS-3** (SR-049; §10.7 niyam 4): **Given** events ulte kram me (jaise "failed" "captured" ke baad), **When** sab pahunchein, **Then** aakhri halat sahi aur halat sirf aage badhe.
4. **AC-PAYMENTS-4** (D-118, D-256, CL-109; §10.5 niyam 7): **Given** reservation khatam hone ke baad payment captured, **When** usi MRP aur kam se kam utni expiry ka stock ho, **Then** order pakka; warna theek ek refund (`late:<paymentId>`), webhook dobara aaye to bhi; "paisa kata, order nahi bana" ki screen aur email.
5. **AC-PAYMENTS-5** (SR-048): **Given** captured rakam order se kam ya currency alag, **When** webhook aaye, **Then** payment order se na jude aur alert bane.
6. **AC-PAYMENTS-6** (SR-047, D-111; §10.7 niyam 4): **Given** ek order pe cancel, return aur appeal ke refund ek saath, **When** sab chalein, **Then** refunds ka jod captured se kabhi zyada nahi, aur ek refund request ka ek hi refund.
7. **AC-PAYMENTS-7** (D-111, D-188): **Given** refund fail (jaise khaata band), **When** nateeja aaye, **Then** customer ko khabar aur staff ka raasta sirf Support Lead aur Finance ki manzoori se.
8. **AC-PAYMENTS-8** (SR-050, D-109): **Given** delivery pe UPI, **When** QR maanga jaaye, **Then** QR server se, us parcel ki exact rakam ka, ek parcel pe ek hi khula QR; "paid" sirf webhook se, partner ke liye "paid" ka koi API nahi.
9. **AC-PAYMENTS-9** (SR-008; §5 niyam 12): **Given** provider misaal 10 second tak jawab na de, **When** payment shuru ho, **Then** request jaldi saaf error ke saath lautaye, request ke andar retry nahi; Valkey band ho to payment shuru 503.
10. **AC-PAYMENTS-10** (D-093, D-269; ARCHITECTURE §1.11 M1): **Given** gateway ki settlement report, **When** roz ka milaan chale, **Then** har payment id ki rakam aur halat ledger se mile, aur farak suspense me jaaye aur alert bane.

### 2.6 CATALOG

1. **AC-CATALOG-1** (D-075; §10.7 niyam 5): **Given** ek brand pe ek seller, **When** doosra seller wahi brand ya wahi barcode daale (ek saath bhi), **Then** sirf ek safal.
2. **AC-CATALOG-2** (D-098, SR-041): **Given** jaanch me listing ka version, **When** beech me naya badlav aaye, **Then** purani manzoori naya version live nahi karti; live version badla nahi ja sakta; jokhim ke bina wala field turant live aur spot check ki queue me.
3. **AC-CATALOG-3** (D-076, D-085): **Given** category ki variant seema, **When** teesra variant axis, ya bina naam, swatch photo aur hex ka shade aaye, **Then** mana.
4. **AC-CATALOG-4** (D-061, D-087, D-120, D-223, SR-042, CL-025, CL-031, CL-074): **Given** daam ka badlav, **When** daam 0, batch ke MRP se upar, ya bada badlav bina dobara confirm ho, **Then** mana; har badlav itihaas ke saath ek transaction me; har discount ke saath pichhle 30 din ka sabse kam daam aur "% off" neeche round.
5. **AC-CATALOG-5** (D-065, SR-042; §10.7 niyam 7): **Given** Pro daam, **When** bina sign-in, normal customer ya search ka jawab bane, **Then** Pro daam usme kabhi nahi.
6. **AC-CATALOG-6** (D-086, D-127, D-128, D-236, CL-026, CL-029, CL-030, CL-036): **Given** listing submit, **When** licence ka type, imported ke fields, pack ki jaankari, allowed HSN, ya 10 g ya 10 ml tak ke pack pe chhapa MRP na ho, **Then** submit nahi; HSN ka rate badle to alert.
7. **AC-CATALOG-7** (D-099, D-128, D-132, CL-043, CL-048): **Given** ingredients, **When** blocklist ka ingredient ho, **Then** submit hi nahi; INCI list staff ki jaanch ke baad; blocklist sirf senior catalog role badle, wajah ke saath, audit me.
8. **AC-CATALOG-8** (D-238, D-084, SR-038, CL-060): **Given** seller ka block adhoora, **When** listing live karne ki koshish ho, **Then** mana; jisne reject kiya wo appeal tay kare to 403.
9. **AC-CATALOG-9** (D-224): **Given** test wala claim (SPF, PA, dermatologically tested ...), **When** bina saboot ki file ke chuna jaaye, **Then** mana; claims sirf tay list se.
10. **AC-CATALOG-10** (D-139, D-153, D-154, CL-066): **Given** search ka kram, **When** nateeje aayein, **Then** text, phir rating (misaal 5 reviews se), phir 30 din ki bikri aur stock; stock khatam sabse neeche; kisi seller ke boost ka field hi nahi; "Bestseller" aur "kam stock" sirf niyam se; yahi tests dono search adapters pe (DH-1).
11. **AC-CATALOG-11** (D-135, D-156, D-158, SR-059): **Given** review, **When** cancel ya RTO line, ₹0 line, wahi product doosri baar, ya brand ke seller app ka user likhe, **Then** naya review nahi (dobara kharid pe purana edit); lauta item chale; din me misaal 5; rating ka jod review ke transaction me aur raat ki jaanch.
12. **AC-CATALOG-12** (D-136, D-146, D-251, D-263, SR-060, CL-105): **Given** review aur report, **When** star, text aur photo aayein, **Then** star turant, text apne aap ki jaanch, photo queue me; nagnata wali report pe review turant chhupe aur misaal 2 ghante ki ghadi; receipt 24 ghante, baaki 36 ghante, hal 7 din; chhupana sirf tay list se; appeal doosra moderator tay kare.

### 2.7 COMMERCE

1. **AC-COMMERCE-1** (SR-045, D-118): **Given** variant ki aakhri unit, **When** 50 customers ek saath place order karein, **Then** sirf ek order, baaki 409 (`COMMERCE_STOCK_UNAVAILABLE` jaisa code), aur `available` kabhi 0 se neeche nahi.
2. **AC-COMMERCE-2** (D-314; §10.5 niyam 3): **Given** order ki koi line fail (serviceability, seema ya stock), **When** place order ho, **Then** poora ulta: na order, na reservation, na outbox event.
3. **AC-COMMERCE-3** (SR-044): **Given** client daam, fee ya tax bheje, **When** order bane, **Then** wo nazarandaaz; server ka total dikhe total se alag ho to order nahi aur naya total.
4. **AC-COMMERCE-4** (D-064, D-067, D-124, CL-032; §10.5 niyam 4, 5): **Given** customer ko jo MRP aur expiry dikhi, **When** order bane, **Then** usi batch se reservation (FEFO: bikne layak me sabse pehle expire hone wala); beech me agla batch badla to order nahi aur naya total; daam se kam MRP wala batch ruka.
5. **AC-COMMERCE-5** (D-118; §10.5 niyam 6): **Given** prepaid order bina payment ke, **When** misaal 15 minute poore hon, **Then** reservation wapas aur order `paymentExpired`, dono ek transaction me.
6. **AC-COMMERCE-6** (D-091, D-109, D-203, D-204, SR-046): **Given** seemaayein, **When** ek variant ki misaal 10 se zyada quantity, pehle order pe ₹1,500 se upar ya kisi bhi order pe ₹3,000 se upar delivery pe UPI, ya teesra khula UPI order ho, **Then** mana ya tareeka na dikhe; `+` alias wale accounts address, device ya payment ke jod se ek gine jaayein; ek saath requests me bhi counter seema paar na kare.
7. **AC-COMMERCE-7** (D-016, D-300): **Given** unserved pincode, **When** order ho, **Then** mana; area band hone pe pehle checkout pe rok ka event, aur parcel banate waqt band area ke order cancel aur refund.
8. **AC-COMMERCE-8** (D-319; §10.5 niyam 9): **Given** pack ke teen kadam, **When** finance ki call ke baad aur "packed" se pehle process gire, **Then** dobara chalne pe wahi invoice (`packSeq` ki key) aur koi doosra nahi; dobara pack pe `commerce.parcel.packVoided` aur naya `packSeq`; finance band ho to pack ruka, order khota nahi.
9. **AC-COMMERCE-9** (D-110, CL-078): **Given** pack se pehle ka order, **When** poora, ek item ya quantity cancel ho, **Then** koi fee nahi, baad me delivery fee nahi, prepaid refund turant; pack ke baad cancel 409; pack aur cancel ek saath pe sirf ek jeete.
10. **AC-COMMERCE-10** (D-090; §10.5 niyam 8): **Given** pick pe maal toota ya kam, **When** barabar batch (wahi variant, wahi MRP, expiry kam se kam utni) ho, **Then** badal do; warna customer se sawal, aur timer tak jawab na aaye to line cancel aur refund.
11. **AC-COMMERCE-11** (D-079, D-106, D-112, D-114, D-221; §10.5 niyam 12): **Given** return, **When** muddat wajah ke hisaab se (misaal 30 din galti, 7 din man badla) aur saboot (photos) poore hon, **Then** maanga ja sake; man badla sirf seal wale maal pe; jaanch ke baad band aur bikne layak maal usi batch me aur storage ki ghadi nahi badalti; man badla pe refund se return fee (misaal ₹49), hamari ya brand ki galti pe delivery fee bhi wapas.
12. **AC-COMMERCE-12** (D-096, D-082, D-083, D-097, D-066; §10.5 niyam 2, 11): **Given** receiving, **When** ASN ke bina, expiry seema se kam, ya sirf PAO wala maal aaye, **Then** mana ya wapas, farak photo ke saath seller ko; "accept" scan se stock aur storage ki ghadi; stock movements sirf jodte, aur raat ki jaanch `reserved` = khule reservations aur `onHand` = bins + raaste me, farak pe alert.

### 2.8 LOGISTICS

1. **AC-LOGISTICS-1** (D-016): **Given** pincode, **When** hub dhoondha jaaye, **Then** theek ek hub; do states wale pincode pe customer state chune aur wo state live ho tabhi order; import pe ek pincode ek record.
2. **AC-LOGISTICS-2** (D-015, D-037): **Given** level ka switch, **When** live ki sharten adhoori hon, **Then** live nahi; naya sub-district ya district kholna sirf setting se, bina deploy, aur uske baad wahan ka order chale.
3. **AC-LOGISTICS-3** (SR-054; §10.7 niyam 8): **Given** delivery code, **When** parcel "out for delivery" na ho, doosra partner ho, ya 5 galat koshish ho chuki hon, **Then** mana; 6th koshish band jab tak Hub Manager na khole (audit me); partner ke app ko code kabhi nahi; do sahi submit ek saath pe ek hi delivered.
4. **AC-LOGISTICS-4** (D-301): **Given** offline sync me code wali delivery, **When** sync ho, **Then** wo kaam mana; offline line me sirf list, scans aur photo.
5. **AC-LOGISTICS-5** (SR-055, D-347, D-351): **Given** code ke bina photo wali delivery, **When** location address ke pin se misaal 300 m door ho, pin na ho, ya wahi photo hash dobara ho, **Then** nishaan; location na mile to "No location" ke saath, partner pe mahine me misaal 3 tak, phir band.
6. **AC-LOGISTICS-6** (D-294, SR-055; §5 niyam 6): **Given** Delivery ka sync batch (misaal 50 kaam), **When** wahi batch dobara aaye, **Then** koi kaam do baar nahi (client ka UUIDv7 key), har kaam ka alag nateeja, `deviceAt` aur `serverAt` dono save.
7. **AC-LOGISTICS-7** (D-108): **Given** delivery fail, **When** wajah aur usi pal location ke saath darj ho, **Then** do koshish (misaal), hub pe misaal 3 din, phir RTO; saaf mana pe seedha RTO; RTO ke hub scan pe prepaid refund ka event ek hi baar.
8. **AC-LOGISTICS-8** (SR-023, SR-035, SR-039): **Given** partner, **When** doosre partner ka parcel ya delivered parcel ki jaankari maange, **Then** 404 ya chhupi; hub staff doosre hub ki cheez pe 404; Hub Manager partner ka session band kare to agla sync 401.
9. **AC-LOGISTICS-9** (SR-056, D-191, D-254): **Given** delivery ka kaam, **When** partner chal raha ho, **Then** location sirf delivered, fail aur pickup ke pal pe; roz ka job photo aur location apne samay pe mitaye.
10. **AC-LOGISTICS-10** (SR-057, D-027): **Given** trip, **When** hub pe receive scan me ginti kam ho, **Then** apne aap nishaan aur audit; har scan me kaun, kis device se aur kab; manifest aur seal number.
11. **AC-LOGISTICS-11** (D-113): **Given** return pickup, **When** label ka batch order ke batch se na mile ya man badla me seal toota ho, **Then** pickup nahi, wajah ke saath khabar; pickup pe item ki photo.
12. **AC-LOGISTICS-12** (D-117, D-222, D-109): **Given** cut-off, Sunday aur chhuttiyan area setting me, **When** order ho, **Then** sahi vaade ki tareekh; vaada toote to "Delayed" aur khabar; door pe UPI fail ho to misaal 10 minute tak QR, phir "attempt fail".

### 2.9 FINANCE

1. **AC-FINANCE-1** (D-282, D-315; §1.1 niyam 1, §10.6 niyam 2): **Given** journal, **When** debit aur credit ka jod alag ho, sirf ek line ho, ya ek line me debit aur credit dono hon, **Then** commit fail.
2. **AC-FINANCE-2** (SR-053, CL-131; §1.1 niyam 3, 7, §10.6 niyam 4, 5): **Given** app ka database role, **When** books ki table pe UPDATE ya DELETE, ya band mahine me journal ho, **Then** mana; sudhaar sirf ulti entry aur nayi entry se, asli ke hawale ke saath.
3. **AC-FINANCE-3** (CL-003; §1.7, §10.6 niyam 6, 7): **Given** ek series pe 50 invoices ek saath, **When** jaari hon, **Then** numbers lagataar, koi duplicate nahi; rollback hua transaction number nahi khata; 1 April (IST) pe nayi series; `doc_no` 16 characters tak aur sirf A-Z, 0-9, `/`, `-`; cancel alag table me, number kabhi dobara nahi.
4. **AC-FINANCE-4** (§1.1 niyam 4, §10.6 niyam 3): **Given** wahi source (gateway event, invoice, payout) do baar, **When** post ho, **Then** ek hi journal.
5. **AC-FINANCE-5** (D-077, D-239, CL-019, CL-084; §1.9, §10.6 niyam 8): **Given** do sellers ka ek parcel, **When** pack ki call `(parcel, seller, packSeq)` dobara aaye, **Then** har seller ka ek hi invoice; seller ka naam sabse upar aur §1.9 ke saare fields; `packVoided` pe dispatch se pehle invoice cancel.
6. **AC-FINANCE-6** (CL-005; §1.8 niyam 5, §10.6 niyam 7): **Given** return, RTO ya pack ke baad ki kami, **When** credit note bane, **Then** asli invoice aur line ka hawala, quantity asli se zyada nahi, aur rakam asli line se (dobara hisaab nahi).
7. **AC-FINANCE-7** (CL-012, CL-129; §1.6): **Given** delivery fee aur return fee, **When** capture (prepaid), delivery (UPI) ya return ki manzoori ho, **Then** platform ka sahi document usi pal; fee wapas ho to platform ka credit note.
8. **AC-FINANCE-8** (D-275; §1.4): **Given** §1.4 ki misaal, **When** capture se sweep tak chale, **Then** entries bilkul wahi (capture ₹1,229.00, fees invoice ₹146.20, payout ₹1,027.80, sweep ₹152.20) aur settlement khaata us order pe zero.
9. **AC-FINANCE-9** (D-081, D-369, D-071): **Given** seller ki line, **When** man badle wali return muddat (misaal 7 din) poori aur koi return khula na ho, **Then** payable; hafte ke batch me udhaar aur fees katein, bharpai jude; misaal ₹100 se kam agle hafte; ek cycle me seller ka ek payout, sirf `due` lines.
10. **AC-FINANCE-10** (D-189, D-190, SR-052, SR-009): **Given** payout batch, **When** banane wala hi manzoor kare, **Then** mana (CHECK aur 403); naye bank khaate pe misaal 72 ghante payout nahi; payouts ka kill switch chalu ho to batch na chale; manzoori pe step-up.
11. **AC-FINANCE-11** (D-225, D-226, D-320, SR-088, CL-020): **Given** invoice, **When** rakam ₹50,000 se kam ho, **Then** sirf state, shehar aur pincode; ₹50,000 ya upar pe naam aur pata sirf `archive.tax_copies` me; account delete pe documents na badlein; seller copy ek-ek karke le, har download audit me.
12. **AC-FINANCE-12** (D-057, D-145, D-288, SR-053; §1.11): **Given** finance, **When** din chale, **Then** events ka batch misaal 15 minute pe sirf pending hone pe; `/health`, `/ready` aur `/wake` finance tak nahi; M1 me farak suspense me aur alert; M3 toote to payouts rukein; har PDF pe SPECIMEN.

### 2.10 SUPPORT

1. **AC-SUPPORT-1** (D-105): **Given** return ki wajah aur saboot poore, **When** maanga jaaye, **Then** apne aap manzoor; warna queue me.
2. **AC-SUPPORT-2** (D-188, SR-051; §10.7 niyam 10): **Given** Support Agent, **When** ek maamla misaal ₹2,000 se upar ya din ka jod ₹10,000 se upar jaaye (ek saath manzooriyan bhi), **Then** faisla Support Lead ke liye pending; counter kaam ke transaction me.
3. **AC-SUPPORT-3** (D-147, SR-038): **Given** reject hua return ya daawa, **When** customer misaal 7 din me appeal kare, **Then** ek hi appeal; faisla Support Lead ka, aur wahi account kare jisne reject kiya tha to 403.
4. **AC-SUPPORT-4** (D-072, D-122, D-148): **Given** "parcel nahi mila", **When** code se delivered ho, **Then** daawa misaal 48 ghante me darj ho par maana na jaaye aur grievance ka raasta dikhe; sirf photo wali delivery pe misaal 7 din aur staff ki jaanch; koi saboot na ho to refund (R1 me dobara maal nahi) aur partner ki jaanch ka record.
5. **AC-SUPPORT-5** (D-106, D-192): **Given** toote, galat ya kam item ka daawa, **When** zaroori photos na hon, **Then** submit nahi; video optional; saboot sirf us maamle ka staff dekhe.
6. **AC-SUPPORT-6** (D-201, D-202, SR-039): **Given** staff ki list, **When** customer dikhe, **Then** naam aur phone chhupe; poori jaankari sirf wajah ke saath aur audit me; "customer ki nazar se" ka koi route contract me nahi.
7. **AC-SUPPORT-7** (SR-058; D-072 niyam 4): **Given** daawe, photo hash ka dobara aana, partner ke daawon ka hissa aur UPI pe mana, **When** maamla khule, **Then** signals dikhein; apne aap rok sirf D-109 aur D-203 ke niyam se.
8. **AC-SUPPORT-8** (§5 niyam 10): **Given** refund ya daawe ka faisla, **When** do baar submit ho (double click, network retry), **Then** ek hi faisla aur ek hi refund request.

### 2.11 AUDIT

1. **AC-AUDIT-1** (SR-076; §3 niyam 10): **Given** staff ka likhne wala kaam, **When** `audit.recorded` likhna fail ho, **Then** poora badlav ulta: "badlav hua par audit nahi" namumkin.
2. **AC-AUDIT-2** (SR-076): **Given** mana hua kaam (403), **When** ho, **Then** wo bhi audit me.
3. **AC-AUDIT-3** (D-317; §10.8 niyam 1): **Given** audit ka app user, **When** update ya delete kare, **Then** mana (sirf `insert` aur `find`).
4. **AC-AUDIT-4** (SR-076, SR-078): **Given** din ki chain, **When** ek entry badli jaaye, **Then** roz ki jaanch fail aur gambhirta 1 ka alert.
5. **AC-AUDIT-5** (R-042; §10.8 niyam 2, 6): **Given** purane din ka chunk, **When** job chale, **Then** pehle chunk likha, hash jaancha, phir entries mitein; chunk misaal 7 din peeche ho to alert; TTL chunk ki umar ke misaal 15 din baad hi.
6. **AC-AUDIT-6** (SR-076, D-047, D-194): **Given** har entry, **When** likhi jaaye, **Then** account, insaan ka jod, role, app, session, kaam, cheez, scope, pehle aur baad (chhupa), wajah, nateeja, IP, browser, request id aur samay; security events 1 saal.

### 2.12 MEDIA

1. **AC-MEDIA-1** (SR-061): **Given** upload, **When** SVG, `.png` naam wala HTML, ya seema se bada file ho, **Then** mana; signed URL exact type aur size se bandha, misaal 10 minute.
2. **AC-MEDIA-2** (SR-061): **Given** EXIF aur location wali photo, **When** `ready` ho, **Then** rakhe roop me EXIF nahi.
3. **AC-MEDIA-3** (SR-062; §7 niyam 1, 2): **Given** `assetId`, **When** client doosre maalik ka asset jodna chahe ya asset `ready` na ho, **Then** mana.
4. **AC-MEDIA-4** (SR-062, DS-7.7): **Given** private file, **When** authorization ke bina, ya misaal 6 minute purane URL se maangi jaaye, **Then** mana; PDF `attachment` ke saath; app ke origin se kabhi nahi; service worker cache nahi kare.
5. **AC-MEDIA-5** (D-191, D-192, D-193, D-227, D-262; §7 niyam 5): **Given** maqsad ka samay aur maamla band, **When** samay poora ho, **Then** roz ka job file mitaye; rok ka samay setting se.
6. **AC-MEDIA-6** (§7 niyam 9, 10): **Given** bina judi upload misaal 24 ghante se purani, ya file badli gayi, **When** roz ka job chale, **Then** mit jaaye (jis purani file ki record ko zaroorat hai wo apne samay tak); hafte ke milaan me provider ki anjaan file pakdi jaaye.
7. **AC-MEDIA-7** (D-284, SR-071): **Given** codebase, **When** lint chale, **Then** provider ki chaabi sirf media ke namespace me; business data me sirf `assetId`.

### 2.13 LOGS

1. **AC-LOGS-1** (SR-077; §8 niyam 3): **Given** request me password, code, token, cookie, `Authorization`, email, phone, address ya PAN ho, **When** log bane, **Then** inme se kuch nahi; route ka template, raw URL aur query nahi.
2. **AC-LOGS-2** (D-250, D-285, CL-106; §8 niyam 2, 10): **Given** request logs, **When** likhe jaayein, **Then** misaal har 60 second ya 1,000 lines pe ek gzip chunk, samay UTC, aur TTL setting se (abhi 180 din).
3. **AC-LOGS-3** (D-286; §8 niyam 5): **Given** server ki error, **When** ho, **Then** fingerprint ke saath; apps ki errors rate-limited route se, size ki seema aur bina personal data; nayi error ki khabar ops inbox me.
4. **AC-LOGS-4** (D-297; §8 niyam 6, 8): **Given** ops snapshot ke number (RSS, outbox ki umar, dead letters, Redis memory), **When** seema paar hon, **Then** sahi gambhirta ka alert, ek fingerprint ka misaal ek ghante me ek, theek hone pe "theek" ki khabar.
5. **AC-LOGS-5** (D-332; OPERATIONS §7 niyam 1): **Given** Redis ya ek cluster band, **When** Render ka health check `/health` bulaye, **Then** 200 (process zinda); `/ready` me wo band hissa dikhe, aur finance `/ready` me nahi.

### 2.14 CUSTOMER app

1. **AC-CUSTOMER-1** (D-349, DS-6.9): **Given** soya server, **When** app khule, **Then** misaal 1.5 second sirf rang aur progress bar, phir WakeScreen; `/wake` ke jawab se pehle koi API call nahi; misaal 150 second pe "Try again"; beech me rewrite 502 ya 504 de to wahi parda; jaagne ke baad ki ping pe koi nishaan nahi.
2. **AC-CUSTOMER-2** (DS-1.4, DS-9.3, SR-044): **Given** cart me rakhne ke baad agla batch (MRP, daam ya expiry) badla, **When** cart ya checkout khule, **Then** line pe "Updated" purane aur naye ke saath, aur order server ke total pe hi.
3. **AC-CUSTOMER-3** (D-067, D-223, D-232, DS-9.1, DS-9.2): **Given** discount wala product, **When** card, product page, cart aur checkout dikhein, **Then** kata MRP, daam, neeche round "% off", 30 din ka sabse kam daam, aur agle batch ki expiry mahina-saal "Use before" ya "Expiry" ke roop me.
4. **AC-CUSTOMER-4** (D-221, D-238, DS-9.7, DS-9.8, CL-061): **Given** product page aur order detail, **When** khulein, **Then** seller ka block aur return ki line add-to-cart ke paas aur order pe.
5. **AC-CUSTOMER-5** (DS-1.5, DS-9.9, DS-9.18, CL-070 se CL-072): **Given** sign-up aur checkout, **When** dikhein, **Then** koi tick pehle se nahi, marketing alag, delivery fee alag line aur "₹X se upar muft" pehle se, countdown sirf asli offer pe.
6. **AC-CUSTOMER-6** (D-345, SR-006, DS-8.7): **Given** checkout, **When** "Place order" ke baad Payment screen khule, **Then** gateway ki script sirf usi route ki CSP me; payment ka timer sirf 5 aur 1 minute bache pe padha jaaye.
7. **AC-CUSTOMER-7** (D-343, D-195): **Given** out for delivery parcel, **When** Orders khule, **Then** DeliveryCodeCard sabse upar; push me code kabhi nahi.
8. **AC-CUSTOMER-8** (D-145, D-264, DS-9.14, DS-9.16, CL-079, CL-080): **Given** koi bhi page, **When** khule, **Then** demo ki patti jo band nahi hoti; legal pages pe DUMMY badge, version aur tareekh.
9. **AC-CUSTOMER-9** (SR-005, SR-010, SR-021, SR-027, D-359): **Given** har route, **When** khule, **Then** security headers aur CSP; browser storage me user ka data nahi; service worker `/api/*` cache nahi kare aur sign-out pe Cache Storage aur IndexedDB khaali; `next` me `//evil.example` aur encoded dot-segments home pe; axe me serious ya critical 0, light aur dark, 320 se 1280.
10. **AC-CUSTOMER-10** (D-346): **Given** pehla order pakka, **When** confirmation screen aaye, **Then** push ki ijazat ka card; "Not now" ke baad misaal 30 din card nahi; Account me hamesha.

### 2.15 SELLER app

1. **AC-SELLER-1** (D-184, SR-024): **Given** seller ke users, **When** listing wala user daam badle, ya bina authenticator ke bank badla jaaye, **Then** 403 ya mana; seller staff ke roles sirf Account Owner de.
2. **AC-SELLER-2** (D-190, SR-052): **Given** bank badalna, **When** dobara code ke saath ho, **Then** purane email aur in-app pe khabar, screen pe sirf aakhri 4 ank.
3. **AC-SELLER-3** (D-143, D-144, SR-034, SR-036, SR-075, SR-088): **Given** reports aur CSV, **When** bane, **Then** sirf apne rows; customer ka naam, phone, email aur address ke fields hi nahi; `=`, `+`, `-`, `@` se shuru cell ke aage `'`; invoice ki copy export me nahi.
4. **AC-SELLER-4** (D-087, DS-6.11): **Given** daam ka bada badlav, **When** save ho, **Then** dobara confirm ka dialog; MRP se upar ki galti field ke paas, bhara data saaf nahi.
5. **AC-SELLER-5** (D-081, D-369): **Given** bikri ki line, **When** seller dekhe, **Then** kab payable hogi aur kis payout me gayi.
6. **AC-SELLER-6** (D-160): **Given** apne products ke reviews, **When** seller dekhe, **Then** padh sake, reviewer ka contact kahin nahi, aur R1 me jawab ka raasta nahi.

### 2.16 ADMIN app

1. **AC-ADMIN-1** (SR-041, D-084): **Given** listing ki jaanch, **When** staff manzoor kare aur beech me naya version aa chuka ho, **Then** "This changed" aur sirf jaancha hua version manzoor.
2. **AC-ADMIN-2** (D-084): **Given** seller ya listing reject, **When** appeal aaye, **Then** reject karne wala account appeal pe faisla nahi kar sakta.
3. **AC-ADMIN-3** (D-136, D-251, SR-060): **Given** moderation ki queue, **When** khule, **Then** nagnata aur personal data wali reports sabse upar, har cheez ki ghadi dikhe, "Next item" aur ginti.
4. **AC-ADMIN-4** (D-201, SR-039, DS-10.5): **Given** customer ki jaankari wali list, **When** dikhe, **Then** chhupi; "Show details" pe wajah, phir dikhe aur audit me.
5. **AC-ADMIN-5** (D-015, D-152, SR-043): **Given** hub ka switch, synonyms ya HSN table, **When** badle, **Then** sirf haq wala badle, audit me purani aur nayi value aur wajah, aur asar bina deploy.
6. **AC-ADMIN-6** (D-181, DS-5.6, DS-6.10): **Given** staff session, **When** misaal 28 minute bina kaam, **Then** IdleWarning ulti ginti ke saath; 30 pe band aur sign-in ke baad usi page pe; sidebar me na dikhne wale section ka URL seedha khole to PermissionDenied (faisla server ka).

### 2.17 SUPER ADMIN app

1. **AC-SUPERADMIN-1** (D-015, D-037): **Given** district ka switch, **When** live ki sharten poori hon, **Then** live, bina deploy; adhoori hon to kaunsi shart baaki hai wo dikhe.
2. **AC-SUPERADMIN-2** (SR-035): **Given** ek district ka Super Admin, **When** doosre district ki cheez badle, **Then** 404.
3. **AC-SUPERADMIN-3** (D-185, SR-026, DS-10.2): **Given** D-185 ki list ka kaam, **When** kiya jaaye, **Then** StepUpDialog; code sahi to wahi kaam chale, page na badle.
4. **AC-SUPERADMIN-4** (D-300): **Given** area band karna, **When** shuru ho, **Then** pehle checkout pe rok, phir band, aur khule orders pe asar ki saaf jaankari.
5. **AC-SUPERADMIN-5** (SR-039, SR-076): **Given** har likhne wala kaam, **When** ho, **Then** audit me, aur lists me customer ki jaankari chhupi.

### 2.18 MASTER app

1. **AC-MASTER-1** (SR-009, DS-6.7): **Given** kill switch, **When** dobara code ke saath chale, **Then** us flow pe saaf sandesh ka banner (jaise checkout band pe cart bacha); "sab sessions band" ke baad har session 401.
2. **AC-MASTER-2** (D-133, SR-018): **Given** allowlist, **When** badle, **Then** dobara code, audit, aur hataye gaye email ke sessions band.
3. **AC-MASTER-3** (D-189): **Given** Finance ka bana payout batch, **When** Master ka doosra account dobara code se manzoor kare, **Then** chale; banane wala hi account ho to mana.
4. **AC-MASTER-4** (D-022, SR-043): **Given** location data ka import, **When** chale, **Then** pehle "dry run" aur schema ki jaanch; galat file ka koi asar nahi; audit me ginti.
5. **AC-MASTER-5** (D-297; OPERATIONS §7 niyam 6; ARCHITECTURE §3 niyam 6): **Given** ops page, **When** khule, **Then** aakhri jaag, aakhri sweep, har roz ke kaam ka aakhri poora din, aakhri backup ki tareekh aur khule alerts; dead letter dobara chalana sirf permission ke saath.
6. **AC-MASTER-6** (D-047, SR-037): **Given** Master ka account, **When** listing manzoor kare ya aisa sub-role banaye jisme grants dena ya payout manzoori ho, **Then** 403 ya mana; koi role khud ko appoint nahi kar sakta.

### 2.19 SUPPORT DESK app

1. **AC-SUPPORTDESK-1** (D-105, D-188): **Given** maamle ki queue, **When** khule, **Then** apne aap manzoor aur pending alag; seema se upar wala maamla Support Lead ki queue me.
2. **AC-SUPPORTDESK-2** (D-147): **Given** appeal, **When** reject karne wala khole, **Then** faisle ke buttons band aur wajah likhi.
3. **AC-SUPPORTDESK-3** (SR-062, DS-7.7): **Given** saboot ki photo ya video, **When** dekhi jaaye, **Then** chhote signed URL se, `no-referrer`, cache nahi.
4. **AC-SUPPORTDESK-4** (DS-6.12; ARCHITECTURE §5 niyam 10): **Given** refund ka faisla, **When** ConfirmDialog me rakam aur asar ke saath pakka ho, **Then** double click pe bhi ek faisla.
5. **AC-SUPPORTDESK-5** (D-202): **Given** customer ka maamla, **When** staff kaam kare, **Then** customer ke naam se ya uski nazar se koi kaam nahi, sirf support ki apni screens.

### 2.20 FINANCE app

1. **AC-FINANCEAPP-1** (D-081, D-189): **Given** hafte ka batch, **When** Finance banaye, **Then** har seller ki lines, set-off, bharpai aur net dikhe, aur manzoori ka button usi account ke liye band.
2. **AC-FINANCEAPP-2** (D-188, D-111): **Given** fail refund, **When** haath ka raasta chuna jaaye, **Then** Support Lead aur Finance dono ki manzoori ke bina aage nahi.
3. **AC-FINANCEAPP-3** (SR-053; ARCHITECTURE §1.11): **Given** milaan ke nateeje, **When** farak ho, **Then** M1 se M5 ka farak dikhe, aur M3 toote to "payouts ruke" ka banner.
4. **AC-FINANCEAPP-4** (D-144, SR-075): **Given** export, **When** maanga jaaye, **Then** dobara code, misaal 50,000 rows ki seema, chhota ek baar ka link, aur audit me filters aur ginti.
5. **AC-FINANCEAPP-5** (R-028; OPERATIONS §8 niyam 8): **Given** finance ka database band (CU-ghante khatam), **When** app khule, **Then** saaf sandesh, aur checkout ke kill switch ki salah.

### 2.21 LOGISTICS OPS app

1. **AC-LOGISTICSOPS-1** (DS-5.7): **Given** scan screen, **When** scan ho, **Then** input hamesha focus me, nateeja bade shabd + rang + icon ("Accepted", "Wrong bin", "Already scanned"); wahi scan dobara pe koi doosra asar nahi.
2. **AC-LOGISTICSOPS-2** (D-096, D-097, D-230): **Given** receiving, **When** barcode na ho, **Then** platform ka label sirf khaali jagah pe aur uski photo; farak photo ke saath seller ko.
3. **AC-LOGISTICSOPS-3** (D-106, D-314): **Given** pick aur pack, **When** galat bin scan ho, **Then** mana; pack ki photo zaroori; pack ke beech network ruke to dobara chalane pe ek hi invoice.
4. **AC-LOGISTICSOPS-4** (D-027, SR-057): **Given** trip, **When** hub pe receive ho, **Then** manifest aur seal ka milaan aur kam bag ka nishaan.
5. **AC-LOGISTICSOPS-5** (D-183, SR-023): **Given** partner ka naya phone, **When** Hub Manager manzoor kare, **Then** session usi phone pe; Hub Manager ek click se session band kar sake.
6. **AC-LOGISTICSOPS-6** (D-108, D-112): **Given** hub pe ruke parcels aur lauta maal, **When** list khule, **Then** misaal 3 din wale laal; Returns QC ka nateeja wajah ke hisaab se darj.

### 2.22 DELIVERY app

1. **AC-DELIVERY-1** (D-042, DS-5.8; ARCHITECTURE §5 niyam 6): **Given** network nahi, **When** partner list, scans aur photo kare, **Then** line me rukein, upar "N waiting to sync", aur network aate hi ek baar sync.
2. **AC-DELIVERY-2** (D-301): **Given** offline, **When** code wali delivery try ho, **Then** button band, wajah ke saath (intezaar ya Hub Manager).
3. **AC-DELIVERY-3** (SR-054): **Given** code, **When** 5 galat, **Then** code daalna band jab tak Hub Manager na khole; app ke data me code kabhi nahi.
4. **AC-DELIVERY-4** (SR-050, D-109): **Given** delivery pe UPI, **When** QR dikhe, **Then** server ka QR exact rakam ka; "Payment received" sirf webhook ke baad; "paid" ka koi button nahi; fail pe misaal 10 minute tak QR, phir "attempt fail".
5. **AC-DELIVERY-5** (SR-055, D-351, DS-7.8, DS-10.1): **Given** pehli photo ya location, **When** maangi jaaye, **Then** pehle app ki samjhane wali screen, phir browser ka prompt; mana ho to wapas chalu karne ka tareeka aur "No location" ka raasta; file input pe `capture`.
6. **AC-DELIVERY-6** (SR-010, SR-023): **Given** parcel delivered ya cancel, **When** ho, **Then** uska data IndexedDB se hate; shift khatam ya sign-out pe sab saaf.
7. **AC-DELIVERY-7** (D-183): **Given** manzoor phone pe session, **When** misaal 14 din poore hon ya Hub Manager band kare, **Then** agla sync 401.
8. **AC-DELIVERY-8** (DS-3.6, DS-5.8, DS-8.5): **Given** app, **When** khule, **Then** Sunlight mode default chalu (7:1), touch targets 48 px, aur axe me serious ya critical 0.
9. **AC-DELIVERY-9** (R-034; ARCHITECTURE §5 niyam 5): **Given** app ka version kam se kam se purana, **When** API bulaye, **Then** UpdateBanner; purane version me line me ruke kaam sync me phir bhi maane jaayein.
10. **AC-DELIVERY-10** (D-113): **Given** return pickup, **When** batch label na mile ya seal toota ho, **Then** pickup nahi aur wajah chuni jaaye; item ki photo zaroori.

### 2.23 Criteria ki ginti

| Module    | Ginti   | App           | Ginti  |
| --------- | ------- | ------------- | ------ |
| PLATFORM  | 12      | CUSTOMER      | 10     |
| GATEWAY   | 9       | SELLER        | 6      |
| IDENTITY  | 12      | ADMIN         | 6      |
| NOTIFY    | 8       | SUPER ADMIN   | 5      |
| PAYMENTS  | 10      | MASTER        | 6      |
| CATALOG   | 12      | SUPPORT DESK  | 5      |
| COMMERCE  | 12      | FINANCE       | 5      |
| LOGISTICS | 12      | LOGISTICS OPS | 6      |
| FINANCE   | 12      | DELIVERY      | 10     |
| SUPPORT   | 8       |               |        |
| AUDIT     | 6       |               |        |
| MEDIA     | 7       |               |        |
| LOGS      | 5       |               |        |
| **Kul**   | **125** | **Kul**       | **59** |

Kul 184 criteria (R1).

### 2.24 R2 ka chhota khaka

- **Growth Studio aur Creator apps:** R1 ke apps jaise saajhe criteria (wake ka parda, headers, sessions ke D-181 ke Creator niyam, axe, error ka map); kaam ke criteria unke modules ke saath.
- **Coupons, points, gift cards (D-173 se D-176, D-249, SR-085):** 10 redemption ek saath pe ek hi safal; GSTIN wale order pe platform ke offers aur points nahi (D-279); ledger ki entries ARCHITECTURE §1.3 se.
- **Tickets, SLA, grievance, disputes (D-161 se D-164):** SLA ki ghadi kaam ke ghanton me aur jawab ke intezaar me ruke (fake clock ke saath); grievance ke samay (D-251).
- **Sehat ka data aur consultation (D-165, D-207, D-208, D-252, SR-067, SR-086):** bina consent field save nahi; galat role 403; Meet link ke nakli hosts mana; "Not a medical consultation" har screen pe.
- **Recall aur skin reaction (D-129, D-130):** `stock_batch_sales` se customers ki list; ek batch pe misaal 3 shikayaton pe bikri ruke.
- **Reviews ke R2 hisse (D-160, D-167, D-170, D-171):** brand ka jawab moderation se; formula badle to label aur do roop ki rating.
- **Try-on (D-169):** E2E me network ki jaanch ki koi photo upload na ho.
- **Partner ki kamaai aur payout (D-104, D-254):** TDS, kaat ki seema (D-103), payout statement, M10 ka milaan.
- **Baaki:** bina sign-in forms (SR-087), data download (D-151), replacement ka challan (D-122, CL-006), combo (D-088), short expiry (D-089), "Notify me" (D-153), transporter ka bill.

## 3. Testing ke niyam (RULES.md ke "Testing" hisse ke liye)

Har niyam ke saath ek line ki wajah. Niyam aise likhe hain ki seedhe naye doc me ja sakein.

**Levels aur kahan chalte hain**

- **TR-1.** Har PR pe CI me unit, component, integration, contract, migration aur backup-tool ke tests, aur Chromium pe saare flows ki E2E; koi level "baad me" nahi. _Wajah:_ ek hi insaan kaam karta hai, galti PR pe hi pakdi jaaye.
- **TR-2.** Integration aur E2E sirf asli engines ke containers pe: MongoDB ka single-member replica set (test commands chalu), PostgreSQL wahi major jo live pe, Valkey live jaisi memory seema ke saath. In-memory database ya nakli repository wala test "integration" nahi kehlata. _Wajah:_ transactions, indexes, validators aur triggers sirf asli engine me sach bolte hain.
- **TR-3.** Har test worker ka apna database aur apna Valkey key prefix; koi test kisi doosre test ke data ya kram pe nahi tika. _Wajah:_ tests ek saath chalein aur har baar ek jaisa nateeja dein.
- **TR-4.** Release wali E2E compiled JS aur bundle mode pe, wahi start command aur flags jo live pe; apps build ki static copy se chalti hain, dev server se nahi. _Wajah:_ live jaisa hi jaancha jaaye.
- **TR-5.** Har facade (sync call) ka ek contract test suite, jo in-process aur signed HTTP dono transport pe chale. _Wajah:_ laptop split mode me aur live bundle mode me, dono ek jaise chalein.
- **TR-6.** Har event type ka schema aur har version ki fixture contracts me; producer ka test forbidden fields aur size ki seema jaanche; consumer ka test pichhla version bhi chalaye. _Wajah:_ deploy ke waqt outbox me purane events hote hain.
- **TR-7.** Har flow (`FL-x`) ki ek E2E spec, jo "Fail ho to" ke kam se kam do raaste bhi chalaye; saath me ek "poora R1" spec jo area khulne se seller ke payout tak jaaye. _Wajah:_ flows hi product hain, aur modules ke beech ki galti wahi dikhti hai.
- **TR-8.** Nightly sirf extra jaanch hai; koi release gate nightly ke nateeje pe nahi tika. _Wajah:_ scheduled run late ho sakta hai, chhoot sakta hai ya band ho sakta hai.

**Data, fakes aur ghadi**

- **TR-9.** Tests, fixtures aur seeds me kabhi asli personal data nahi: emails sirf reserved domains pe, naam aur dastavez banawati; allowlist ke asli emails repo me kabhi nahi. _Wajah:_ repo public hai.
- **TR-10.** E2E ke traces, screenshots aur logs me sirf fake data; artifacts chhoti umar ke; backup files kabhi artifact nahi. _Wajah:_ public repo ke artifacts koi bhi dekh sakta hai.
- **TR-11.** Production bundle me koi test route, test switch, fake adapter ya test seed nahi. Boot pe jaanch: production config me fake adapter ya test seed mile to process na uthe. E2E ka harness halat seedha us run ke database me badalta hai, app ke kisi route se nahi. _Wajah:_ test ka raasta hamle ka raasta na bane.
- **TR-12.** Tests ka koi network request loopback ke bahar nahi jaata; test setup bahar ke connections band karta hai, aur har bahar ki service ka fake hota hai. _Wajah:_ galti se asli provider, asli paisa ya asli inbox tak na pahunchein.
- **TR-13.** Business code "abhi" sirf injected clock se leta hai; `Date.now()` aur bina argument ka `new Date()` lint se mana (clock package aur tests ko chhod ke); tests me asli `sleep` nahi. _Wajah:_ samay wale niyam (15 minute, 7 din, 1 April, raat ki neend) seconds me aur pakke jaanchein.
- **TR-14.** Har fake ka vyavhaar provider ke docs ke saath likha ho. R1 se pehle aur jab bhi kisi provider ka integration badle, laptop pe ek baar provider ke asli test mode se milaan (payment, email, social sign-in, media), test key sirf us din. _Wajah:_ fake aur asli ka farak tests ko jhootha green kar deta hai.
- **TR-15.** Packages ke tests me npm registry hamesha local fake; test process me registry ki setting jabran fake pe, aur asli registry ka koi request test ko fail kare. _Wajah:_ koi test kabhi asli registry ko na chhoe.
- **TR-16.** E2E ka edge proxy live ke rewrite jaisa: secret header aur har test ka alag forwarded IP. Rate limits aur seemaayein asli settings ke saath jaanchi jaati hain; tests seemaayein badal ke nahi, apna IP aur apna account le ke alag rehte hain. _Wajah:_ niyam usi roop me jaanche jaayein jo live pe chalta hai.

**Paisa, stock aur permissions**

- **TR-17.** Paise, stock aur har "ek hi" wali cheez ka test ek saath N requests (misaal 50) se: unique index, conditional update aur transaction ka asli takraav. _Wajah:_ asli users ek saath aate hain; ek user wala test race nahi pakadta.
- **TR-18.** Paise ke har function pe property tests (random carts, rates, refunds, chhoot): jod barabar, refund captured se kabhi zyada nahi, float kahin nahi. _Wajah:_ haath ki misaalein kinaare ke cases chhod deti hain.
- **TR-19.** Har mukhya flow (place order, pack, delivery, return, payout) ke database operations gine jaayein aur tay budget se upar test fail; har repository query ka `explain` index se. _Wajah:_ free cluster ki operations ki seema container me nahi dikhti.
- **TR-20.** Har mana hone wale raaste ka apna test: galat permission (403), scope ke bahar (404), wahi idempotency key alag body (422), seema ke upar, galat halat (409). Sirf "happy path" wala badlav adhoora maana jaaye. _Wajah:_ hamle aur galtiyan inhi raaston se aati hain.

**Mutation, coverage aur ginti**

- **TR-21.** Mutation testing sirf teen jagah: (a) kernel packages (paisa aur tax, authorize aur kaam ke bantwara ke checks, transaction helper, outbox aur inbox, timers aur lease, idempotency, field encryption, release step, route manifest, audit chain, rate limit ka counter, config schema): pehli baar poora run background me, phir sirf badli lines; (b) paise, stock aur permissions ke code me sirf badli lines; (c) baaki apps aur modules me mutation nahi. Mutation hamesha asli files ki copy me aur alag containers pe. _Wajah:_ taakat wahan jahan galti mehngi, aur owner ka kaam na ruke.
- **TR-22.** Bacha mutant ya to naye test se mare, ya package ke saath "equivalent" ki likhi wajah ho; bina wajah ka bacha mutant run ko fail karta hai. _Wajah:_ mutation score ka matlab bana rahe.
- **TR-23.** Coverage ki seema area ke hisaab se (kernel packages, paisa/stock/permissions, baaki), aur koi PR apne area ki seema neeche na laaye. Gate kitna sakht, owner ke jawab se. _Wajah:_ poore repo ka ek number kamzor jagah chhupa deta hai.
- **TR-24.** Har test ke naam me uske niyam ka id (`SR-045`, `FL-7`, `AC-COMMERCE-3`, `CL-003`). Ek script tests se ids nikaal ke R1 ki list se milaata hai: PR pe report, release pe kami 0. _Wajah:_ "bana hai" sirf test ki link se kaha jaaye, aur chhoota niyam dikhe.
- **TR-25.** Paise, stock, permissions, idempotency aur events ke tests kabhi quarantine nahi; unka flaky hona bug hai. Retry se pass hua test summary me "flaky" dikhe, aur har flaky ka issue bane. _Wajah:_ race asli ho sakta hai, aur chupka green bharosa todta hai.
- **TR-26.** `.only` CI me mana; `.skip` sirf issue ki link aur tareekh ke saath. _Wajah:_ chhupa adhoora test sabse mehnga hota hai.

**E2E, accessibility, visual aur performance**

- **TR-27.** Accessibility ki automated jaanch asli browser me (components ki playground pages aur E2E ki har screen), light aur dark dono me; serious ya critical ek bhi nahi. _Wajah:_ jsdom rang aur contrast nahi ginta.
- **TR-28.** Har mukhya screen 320, 360, 768 aur 1280 pe; 320 pe horizontal scroll ka test aur focus ka header ya neeche ki bar ke neeche na chhupna. _Wajah:_ reflow aur focus WCAG ke niyam hain, aankh se chhoot jaate hain.
- **TR-29.** Screenshot tests sirf mukhya screens pe, sirf Linux container me, animations band; baseline sirf ek tay command se badle aur PR me dikhe. _Wajah:_ operating system ke font ka farak jhoothe fail deta hai, aur baseline chupke se na badle.
- **TR-30.** Har haath ke check ka record (kya, kis device aur browser pe, kisne, kab, nateeja); bina record "verified" nahi likha jaata. _Wajah:_ imaandari ka niyam.
- **TR-31.** Server ke p95 targets Docker me 512 MB aur tay CPU seema pe naape jaayein, har naap 3 baar, nateeja tareekh aur commit ke saath. _Wajah:_ naap dohraya ja sake, aur sirf jaage server pe targets laagu hain.
- **TR-32.** Design target ka load test laptop pe; nateeja sirf samay nahi, baad me data ki sachchai bhi (stock minus nahi, reservations aur movements mile, outbox me atka event nahi, journal barabar). _Wajah:_ load me hi race aur takraav dikhte hain.
- **TR-33.** E2E me elements role aur label se dhoondhe jaayein (jaise button ka naam), CSS class ya test id se tabhi jab koi aur raasta na ho. _Wajah:_ test accessibility ka bhi pehra ban jaata hai.

**Security, migrations, release, backup aur bugs**

- **TR-34.** R1 ke har SR niyam ka kam se kam ek automated test, ya jahan test nahi ho sakta wahan likha record (jaise review checklist, providers pe MFA ki checklist, abhyaas ka record). _Wajah:_ bahar ki jaanch (pentest) nahi hai, to ye hi pehra hai.
- **TR-35.** Route × actor ka matrix aur doosre customer ya seller ki id wala test contracts se apne aap bane; naya route bina matrix entry ke CI fail kare. _Wajah:_ naya route permission ke bina na nikle.
- **TR-36.** Local bundle pe passive DAST scan nightly; high finding ka issue. _Wajah:_ headers aur config ki galti jo tests ke bahar reh jaaye.
- **TR-37.** Release step, migrations aur rollback ke tests har PR pe (dobara chalna, lease, lambi migration ke beech health, pichhle release ka data); ek PR me ek hi field ya index ka jodna aur hatana dono nahi. _Wajah:_ deploy ke waqt do instances ek saath chalte hain.
- **TR-38.** Backup tool ka round trip test har PR pe containers pe (ginti, hash, audit chain, journal, delete hue accounts ka dobara delete, bina key na khulna). _Wajah:_ restore ka pehla asli istemaal mushkil ghadi me hota hai.
- **TR-39.** Security bug ki detail fix live hone se pehle public issue, PR ya commit message me nahi; uska record private jagah me. _Wajah:_ repo public hai.
- **TR-40.** Har bug ka ek roop: user pe asar wala title, steps, umeed aur asal, saboot ka level (chala ke dekha, ya sirf code padh ke), gambhirta, jude niyam ke ids, aur fix ke saath regression test ki link. _Wajah:_ bug dohraya ja sake aur dobara na aaye.
- **TR-41.** Gambhirta: **P0** paisa galat, data leak, security bypass ya data khona; **P1** koi flow bina doosre raaste ke ruka; **P2** flow doosre raaste se chalta hai, ya paise ke bina koi galat jaankari; **P3** dikhawat. _Wajah:_ release gate ek saaf paimane pe tike.
- **TR-42.** Har PR ke description me "kaise jaancha": kaunse tests chale, kya haath se dekha, aur kya nahi dekha; release note me tests ka saar. _Wajah:_ review aur release ka faisla saboot pe ho.

Kul 42 niyam.

## 4. Definition of Done aur R1 ka release gate

### 4.1 Definition of Done (TASK.md ke template ke liye)

Ek subtask tab "ho gaya" jab:

1. Uske har acceptance criterion ka kam se kam ek automated test, test ke naam me criterion ka id; mana hone wale raaste bhi (TR-20).
2. Badle routes, events aur facades ke contract tests update; naya route matrix me (TR-35).
3. Jis flow ko chhua, uski E2E spec update aur green.
4. CI ka `check` green; koi naya `.skip` bina issue ke nahi; koi naya flaky nahi.
5. Area ki coverage seema neeche nahi (TR-23).
6. Agar code mutation ki teen jagah me hai to badli lines ka mutation run, aur koi bina wajah ka bacha mutant nahi (TR-21, TR-22).
7. Jin SR niyamon ko chhua, unke tests; logs me koi secret ya personal data nahi; koi secret repo me nahi.
8. Chhui screens pe axe me serious ya critical 0, keyboard se poora kaam, aur 320 pe horizontal scroll nahi.
9. Data ke badlav pe expand aur contract ka niyam, aur release step ka test.
10. Bundle budget aur DB operations ka budget nahi toota; nayi query index se.
11. `TASK.md` me status, tests ki links aur change log ki line; "verified" sirf asli user wale kaam ke record ke saath (TR-30).
12. PR ke description me "kaise jaancha" (TR-42).

### 4.2 R1 ka release gate

R1 tab release ho jab saari sharten poori hon (OPERATIONS §3 ke release kram ke andar):

| #   | Shart                                                                                                                                     | Saboot                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| G1  | FL-1 se FL-20 aur "poora R1" spec green, compiled JS aur bundle mode pe, laptop pe                                                        | E2E ka report                       |
| G2  | Requirement ki ginti: R1 ke har SR, flow, AC aur R1 wale CL row ka test ya likha record; kami 0                                           | TR-24 ka script                     |
| G3  | Paise ke invariants: property aur concurrency tests green; "poora R1" ke data pe milaan M1 se M5 me farak 0; settlement invariant theek   | Test report, milaan ka nateeja      |
| G4  | Kernel packages ka pehla poora mutation run ho chuka; bache mutants ki wajah likhi; score seema ke upar                                   | Mutation report                     |
| G5  | Security: `guard` green; high ya critical dependency alert nahi; passive DAST me high nahi; headers ke tests green                        | CI aur scan ka report               |
| G6  | Accessibility: axe me serious ya critical 0; DS-8.1 ki haath ki checklist mukhya flows pe                                                 | Checklist ka record                 |
| G7  | Performance: 512 MB ka naap (aam RSS 400 MB se neeche, koi OOM nahi); server ke p95 targets; 5 pages ke Lighthouse targets; bundle budget | OPERATIONS §10 ki table, report     |
| G8  | Design target ka ek load test, aur baad me data ki sachchai                                                                               | Load test ka report                 |
| G9  | Backup liya; restore ka pehla abhyaas ho chuka                                                                                            | OPERATIONS §6 ki abhyaas wali table |
| G10 | Migration ke tests aur ek release peeche rollback ka abhyaas green                                                                        | Test report                         |
| G11 | Provider ke test mode se milaan (payment, email, social sign-in, media) ek baar                                                           | TR-14 ka record                     |
| G12 | Asli phone pe checks (QA-Q5 ke jawab ke hisaab se)                                                                                        | Haath ka record                     |
| G13 | Khule bugs: QA-Q8 ke jawab wali gambhirta ka koi khula bug nahi                                                                           | Bugs ki list                        |
| G14 | Deploy ke baad live smoke check pass (OPERATIONS §3 niyam 9); iske baad hi HANDOFF me "R1 live pe verified"                               | Smoke ka record                     |

## 5. Owner ke sawal

Sirf process aur business ke chunaav. Tools aur tareeke (Stryker, k6, fast-check, axe, ZAP, containers) prastaav hain, sawal nahi. 10 sawal: 9 kisi khule sawal pe tike nahi (ek saath pooche ja sakte hain), 1 (QA-Q6) QA-Q5 ke jawab pe tika hai. Koi group nahi.

### QA-Q1. Coverage ki seema ka gate kitna sakht ho?

- **Kyun zaroori:** TR-23 ki seema ka matlab tabhi jab uska asar ho; par ek insaan ke kaam me har PR pe sakht gate rukawat bhi ban sakta hai.
- **Vikalp:** (a) seema se neeche PR merge nahi, har area me; (b) kernel packages aur paisa, stock, permissions pe PR roke, baaki areas pe sirf report aur release gate pe dekha jaaye; (c) kahin na roke, sirf report.
- **Salah:** (b).
- **Trade-off:** (a) UI ke chhote badlav pe bhi bina zaroorat tests; (c) coverage dheere-dheere girta hai aur kisi ko pata nahi chalta.
- **Tika:** nahi.

### QA-Q2. Badli lines ka mutation run PR ka `check` roke, ya sirf laptop pe kaam ke "done" ka hissa ho?

- **Kyun zaroori:** CLAUDE.md teen jagah aur copy ka niyam deta hai, par ye nahi ki bacha mutant merge roke ya nahi, aur run kahan ho. CI khud ek copy hai, laptop pe owner ka kaam chalta hai.
- **Vikalp:** (a) CI me PR pe alag job, sirf badli lines (kernel aur paisa, stock, permissions), bina wajah ka bacha mutant `check` laal kare; kernel ka pehla poora run laptop pe background me; (b) laptop pe Definition of Done ka hissa, CI me nahi; (c) sirf release se pehle.
- **Salah:** (a).
- **Trade-off:** (a) un PRs ka samay badhta hai jo in jagahon ko chhoote hain; (b) laptop pe bojh aur bhoolne ka mauka; (c) kamzor test der se pakde jaate, tab tak kai PR us pe tik chuke hote.
- **Tika:** nahi.

### QA-Q3. Flaky test pe retry ki chhoot ho?

- **Kyun zaroori:** browser wale tests kabhi-kabhi bina bug ke fail hote hain; retry na ho to PR rukte hain, retry ho to asli race chhup sakti hai.
- **Vikalp:** (a) koi retry nahi, ek fail = laal; (b) sirf E2E pe ek retry, pass hone pe bhi summary me "flaky" aur issue; unit, integration aur paisa, stock, permissions ke tests pe retry nahi (TR-25); (c) har test pe 2 retry.
- **Salah:** (b).
- **Trade-off:** (a) chhoti hichki pe kaam rukta hai; (c) asli race aur timing ke bug green ke peeche chhupte hain.
- **Tika:** nahi.

### QA-Q4. Chromium ke alawa browsers pe E2E kab chale?

- **Kyun zaroori:** CI ki E2E Chromium pe tay hai; par iPhone ke customers Safari ke engine (WebKit) pe hain, aur push, install aur kuch CSS wahan alag chalte hain.
- **Vikalp:** (a) nightly me WebKit aur Firefox, saare flows; (b) nightly me sirf WebKit, Customer app ke mukhya flows (FL-1, FL-2, FL-7, FL-11, FL-12, FL-19); (c) sirf release se pehle laptop pe WebKit, mukhya flows; (d) sirf Chromium.
- **Salah:** (b).
- **Trade-off:** Linux ka WebKit asli iPhone ka Safari nahi (SJ-4), to (a) aur (b) bhi asli phone ki jagah nahi lete; (a) nightly lamba aur Firefox ka hissa chhota; (d) Safari ki dikkat live pe hi dikhegi.
- **Tika:** nahi.

### QA-Q5. Asli phone pe testing: kaun se phones aur kab?

- **Kyun zaroori:** camera ka `capture`, location, offline data, dhoop me Sunlight mode, UPI app ya bank page ke baad app me wapsi, aur iPhone ka push desktop browser me pakke nahi hote (OPEN_QUESTIONS §2 ki rows, R-061, R-062).
- **Vikalp:** (a) owner ka Android phone, har release se pehle: Delivery app ka ek poora din (FL-9, FL-10, pickup) aur Customer ka checkout; (b) (a) ke saath ek iPhone (apna ya udhaar), sirf R1 se pehle ek baar; (c) sirf R1 se pehle ek baar, Android; (d) asli phone nahi.
- **Salah:** (b).
- **Trade-off:** iPhone ka intezaam; har release pe lagbhag ek ghanta; (d) me Delivery app ki asli dikkat live pe hi dikhegi.
- **Tika:** nahi.

### QA-Q6. Screen reader ki haath ki jaanch kis par ho?

- **Kyun zaroori:** DS-8.1 me release se pehle screen reader ki checklist tay hai, par kaunsa screen reader nahi; har ek ka vyavhaar alag.
- **Vikalp:** (a) NVDA (laptop pe muft) desktop apps pe, aur TalkBack (Android) Customer aur Delivery pe; (b) (a) ke saath VoiceOver (iPhone) Customer pe; (c) sirf NVDA.
- **Salah:** (a), aur QA-Q5 me iPhone mile to (b).
- **Trade-off:** har screen reader seekhne aur chalane ka samay; (c) phone pe padhne ki dikkatein chhoot-ti hain.
- **Tika:** haan, QA-Q5 pe (iPhone hai ya nahi); uske jawab ke baad.

### QA-Q7. Har release pe owner kitna khoj wala (haath ka) testing kare?

- **Kyun zaroori:** automated tests likhe niyam jaanchte hain; anjaani dikkatein (jaise lamba product page, R-059, ya ulajhne wala sandesh) insaan hi dekhta hai, aur owner ke paas hafte ke 30 ghante hain (D-009).
- **Vikalp:** (a) har release pe misaal 2 ghante, badle flows pe chhote "charter" (ek flow, ek lakshya, misaal 30 minute); (b) sirf R1 se pehle ek bada round (misaal 1 din), baad me sirf smoke; (c) (a) ke saath R1 se pehle allowlist ke 1 ya 2 bharose ke testers (D-133) se ek round; (d) koi khoj wala testing nahi.
- **Salah:** (c).
- **Trade-off:** testers ke emails live pe personal data hain (allowlist), aur unke sawalon ka samay; (d) me product ki chhoti par chubhne wali galtiyan reh jaati hain.
- **Tika:** nahi.

### QA-Q8. Kis gambhirta ka khula bug release roke?

- **Kyun zaroori:** release gate (G13) ko saaf paimana chahiye (TR-41 ki gambhirta ke saath).
- **Vikalp:** (a) P0 aur P1 roke; P2 release note me likh ke chale; (b) sirf P0 roke; (c) P0, P1 aur P2 sab roke.
- **Salah:** (a).
- **Trade-off:** (b) koi flow toota hua live; (c) chhoti galtiyon pe release der se.
- **Tika:** nahi (gambhirta ka paimana TR-41 me prastaav hai; wo badle to is jawab ka matlab bhi).

### QA-Q9. Design target ka load test kitni baar ho?

- **Kyun zaroori:** load test laptop ke kuch ghante leta hai (setup, run, baad me data ki jaanch), aur owner ka samay seemit hai.
- **Vikalp:** (a) har release se pehle; (b) R1 se pehle ek baar, phir sirf us release me jo place order, pack, delivery scan ya payout ka raasta badle, ya nayi service jode; (c) sirf R1 se pehle.
- **Salah:** (b).
- **Trade-off:** (a) har release pe ghante; (c) baad ke badlav ka load pe asar anjaana.
- **Tika:** nahi.

### QA-Q10. Release ke live smoke order ka kya ho?

- **Kyun zaroori:** smoke check (OPERATIONS §3 niyam 9) live pe test-mode order payment tak banata hai: stock rukta hai, emails ki din ki chhat se ginti hoti hai, aur "Bestseller", 30 din ki bikri (D-139, D-154) aur owner ke aankde (D-149) badalte hain.
- **Vikalp:** (a) payment ke baad turant cancel (pack se pehle), aur order pe "smoke" ka nishaan jo bikri, Bestseller aur aankdon ki ginti se bahar rakhe; (b) turant cancel, baaki orders jaisa gina jaaye; (c) poora delivery tak chalaya jaaye (owner ke warehouse, hub aur partner ke accounts se).
- **Salah:** (a).
- **Trade-off:** (a) me ek naya nishaan aur uska test; (b) har release pe customer ko dikhne wale aankdon me thoda jhooth; (c) har release pe ghante.
- **Tika:** nahi.

## 6. Batches

Main session in batches ko ek-ek karke owner ke paas le ja sakta hai. Jo batch kisi sawal pe tika hai, wo us sawal ke jawab ke baad.

| Batch | Kya                                                                                 | Ginti       | Naye doc me kahan (prastaav)                                                           | Kis sawal ke baad           |
| ----- | ----------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------- | --------------------------- |
| QB-1  | Levels aur kahan chalte: TR-1 se TR-8, saath me §1.2 aur §1.3 ki tables             | 8 niyam     | RULES "Testing"                                                                        | koi nahi                    |
| QB-2  | Data, fakes aur ghadi: TR-9 se TR-16, saath me §1.5 aur §1.6                        | 8 niyam     | RULES "Testing"                                                                        | koi nahi                    |
| QB-3  | Paisa, stock aur permissions: TR-17 se TR-20                                        | 4 niyam     | RULES "Testing"                                                                        | koi nahi                    |
| QB-4  | Mutation, coverage, flaky aur ginti: TR-21 se TR-26, saath me §1.17 se §1.19        | 6 niyam     | RULES "Testing"                                                                        | QA-Q1, QA-Q2, QA-Q3         |
| QB-5  | E2E, accessibility, visual aur performance: TR-27 se TR-33, saath me §1.10 se §1.12 | 7 niyam     | RULES "Testing"                                                                        | QA-Q4, QA-Q5, QA-Q6, QA-Q9  |
| QB-6  | Security, migrations, backup aur bugs: TR-34 se TR-42, saath me §1.13 se §1.16      | 9 niyam     | RULES "Testing" (TR-39 "Security aur privacy" me bhi)                                  | QA-Q8                       |
| QB-7  | Definition of Done (12) aur R1 ka release gate (G1 se G14)                          | 26 hisse    | DoD: RULES "Definition of Done" aur TASK.md ka template; gate: RULES "Git aur release" | QA-Q5, QA-Q7, QA-Q8, QA-Q10 |
| QB-8  | Criteria: PLATFORM, GATEWAY, AUDIT, LOGS                                            | 32 criteria | Module ki `TASK.md`                                                                    | koi nahi                    |
| QB-9  | Criteria: IDENTITY, NOTIFY, MEDIA                                                   | 27 criteria | Module ki `TASK.md`                                                                    | koi nahi                    |
| QB-10 | Criteria: CATALOG, COMMERCE                                                         | 24 criteria | Module ki `TASK.md`                                                                    | koi nahi                    |
| QB-11 | Criteria: PAYMENTS, FINANCE                                                         | 22 criteria | Module ki `TASK.md`                                                                    | koi nahi                    |
| QB-12 | Criteria: LOGISTICS, SUPPORT                                                        | 20 criteria | Module ki `TASK.md`                                                                    | koi nahi                    |
| QB-13 | Criteria: Customer, Seller aur Delivery apps                                        | 26 criteria | App ki `TASK.md`                                                                       | koi nahi                    |
| QB-14 | Criteria: Admin, Super Admin, Master, Support Desk, Finance aur Logistics Ops apps  | 33 criteria | App ki `TASK.md`                                                                       | koi nahi                    |
| QB-15 | Risks: QR-1 se QR-12                                                                | 12 risks    | RISKS                                                                                  | koi nahi                    |

**Criteria ka samay:** task files abhi nahi banti (D-004). Criteria ki batches (QB-8 se QB-14) owner abhi maan sakta hai aur wo planning stage me `TASK.md` me jaayein, ya batches planning stage tak ruk sakti hain. Ye main session aur owner ka kram hai; niyam ki batches (QB-1 se QB-7) abhi RULES me ja sakti hain.

## 7. Prastaavit risks

| Id    | Risk                                                                                                                                                                 | Tag          | Asar                                                                             | Kam karne ka tareeka                                                                                                                               |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| QR-1  | Fakes asli providers (payment ke webhooks, email, social sign-in, media) se alag vyavhaar karein.                                                                    | Operations   | Tests green, live pe payment ya sign-in fail. Sambhavna madhyam.                 | Fake ka vyavhaar provider ke docs se likha (TR-14); R1 se pehle aur integration badalne pe asli test mode se milaan; roz ka milaan M1 live pe.     |
| QR-2  | Containers aur free clusters ka farak: M0 ke custom roles, transaction ki seemaayein, Atlas Search ke operators, Neon ka pooler containers me nahi jaanche ja sakte. | Architecture | CI green, live pe query, role ya search fail. Sambhavna madhyam.                 | SJ-3 (local Atlas Search), DH-1; live smoke check me search aur ek order; providers ke docs ki jaanch (OPEN_QUESTIONS §2).                         |
| QR-3  | 12 services aur 9 apps ke saath poora CI run lamba (misaal 15 minute se upar) ho jaaye.                                                                              | Operations   | Har PR pe intezaar; jaldi me tests chhodne ka laalach. Sambhavna oonchi.         | Jobs ka bantwara; build ki static copy; badle hisson ke tests ka niyam tay (OPERATIONS §2 niyam 12) jab seema paar ho.                             |
| QR-4  | E2E me timing (wake ka parda, polling, timers) se flaky tests.                                                                                                       | Operations   | Tests pe bharosa toote, asli fail ko "flaky" maan liya jaaye. Sambhavna madhyam. | Injected clock (TR-13), asli `sleep` nahi, halat pe intezaar; TR-25 aur QA-Q3.                                                                     |
| QR-5  | Samay wale niyam (IST ka din, 1 April, 15 minute, raat ki neend ke baad catch-up) me galti, kyunki ghadi har jagah inject nahi hui.                                  | Architecture | Galat din ka invoice, galat series, ruka stock. Sambhavna madhyam.               | Clock ka lint (TR-13); §1.7 ke scenarios ke tests; nightly me lambi ghadi wale scenarios.                                                          |
| QR-6  | Mutation aur load test laptop pe development ke containers ke saath bhaari padein.                                                                                   | Operations   | Owner ka kaam dheema; runs beech me chhode jaayein. Sambhavna madhyam.           | Alag containers alag ports (tay), background run, badli lines tak seemit; QA-Q2 me CI ka vikalp; SJ-18 me laptop ki memory ka naap.                |
| QR-7  | Screenshots ki baseline baar-baar badle (fonts, themes, data), ya public repo me images ka bojh badhe.                                                               | Operations   | Jhoothe fail, aur baseline bina dekhe badal di jaaye. Sambhavna madhyam.         | Sirf mukhya screens, Linux container, animations band, tay data; baseline ka badlav PR me dikhe (TR-29).                                           |
| QR-8  | Asli personal data fixtures, traces ya screenshots me chala jaaye (jaise owner ka asli email kisi seed me).                                                          | Security     | Public repo ya artifact me personal data. Sambhavna kam.                         | TR-9, TR-10; seeds ka pattern scan (asli domains wale emails pe CI laal); allowlist sirf live ki setting me.                                       |
| QR-9  | Ek hi insaan tester: UX aur accessibility me andhe hisse, aur haath ki checklist ki thakaan.                                                                         | Business     | Asli users ki dikkatein chhoot-ti hain. Sambhavna oonchi.                        | QA-Q7 ke testers ka round; DS-8.1 ki checklist chhoti aur tay; khoj ke charters.                                                                   |
| QR-10 | Code aur test ek hi haath (ek hi AI session) se: test code ki naqal kare, niyam ki nahi.                                                                             | Architecture | Galat samjha niyam code aur test dono me, sab green. Sambhavna madhyam.          | Criteria docs se (§2), test ke naam me niyam ka id (TR-24), mutation (TR-21), review me criteria se milaan.                                        |
| QR-11 | Har release ka live smoke check live data aur free tier (emails ki chhat, Neon ke CU-ghante) khaata hai.                                                             | Operations   | Bhaari din pe emails agle din; aankdon me test orders. Sambhavna kam.            | QA-Q10; smoke ek hi order ka; release kam bheed wale samay pe.                                                                                     |
| QR-12 | Single-member replica set container me Atlas ke teen members wala majority write aur write conflicts ka vyavhaar poora nahi dikhta.                                  | Architecture | Hot documents pe takraav (R-037) tests me kam dikhe. Sambhavna madhyam.          | Concurrency tests me jaan-boojh ke takraav (TR-17), transient errors failpoint se; load test (TR-32); live ke 409 aur 503 ka ops snapshot me naap. |

## 8. Sirf jaanch

Owner ka faisla nahi chahiye, sirf saboot. Is run me inme se koi web pe nahi jaancha.

| Id    | Kya jaanchna hai                                                                                                                                                                                           | Kis cheez ke liye            |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| SJ-1  | GitHub Actions, public repo: ek saath kitni jobs, runner ka size (CPU aur RAM), job ka sabse lamba samay, cache ki jagah, artifacts ki umar aur jagah                                                      | §1.4, QR-3                   |
| SJ-2  | MongoDB 8.0 ka container naye Linux kernel wale runners pe bina dikkat chalta hai ya nahi (memory allocator wali purani dikkat abhi hai ya nahi)                                                           | TR-2                         |
| SJ-3  | MongoDB ka local Atlas wala container image Atlas Search (fuzzy, autocomplete, synonyms) laptop aur CI pe deta hai ya nahi, kitni memory leta hai, aur M0 ki 3 indexes jaisi seema laga sakte hain ya nahi | DH-1, AC-CATALOG-10          |
| SJ-4  | Playwright ka WebKit (Linux) asli Safari se kitna alag: push, install, service worker, file input ka `capture`                                                                                             | QA-Q4                        |
| SJ-5  | StrykerJS: Vitest runner aur TypeScript (ESM, Node 24) ke saath, `mutate` me line ranges, incremental mode, sandbox repo ke bahar rakhna, aur npm workspaces me ek package ka run                          | §1.19, TR-21                 |
| SJ-6  | Playwright ke screenshots Windows laptop aur Linux CI me alag aate hain ya nahi, aur Playwright ka Linux image laptop pe chalana                                                                           | TR-29                        |
| SJ-7  | Load test ka tool: k6 (container) ya autocannon (npm), aur dono laptop pe 512 MB wale bundle ke saath kaise chalein                                                                                        | TR-32                        |
| SJ-8  | Razorpay test mode: webhook laptop tak kaise aaye (tunnel ke bina ya saath), aur fail refund, der se capture, ulta kram jaise haalat test mode me banaye ja sakte hain ya nahi                             | TR-14, AC-PAYMENTS-3, -4, -7 |
| SJ-9  | Brevo ki transactional API me "bina bheje jaanch" (sandbox) ka tareeka hai ya nahi                                                                                                                         | TR-14                        |
| SJ-10 | Neon ke pooler pe advisory lock (migrations) aur `SELECT ... FOR UPDATE` wali numbering; container wala PostgreSQL inme Neon jaisa hi chalta hai ya nahi                                                   | AC-FINANCE-3, §1.14          |
| SJ-11 | Playwright me geolocation, camera (nakli video stream) aur browser push (service worker ko push bhejna) ka emulation                                                                                       | AC-DELIVERY-5, AC-NOTIFY-6   |
| SJ-12 | Asli phone pe laptop ka app: camera, location aur service worker ko secure context (HTTPS ya localhost) chahiye; Android me USB se port forwarding (phone pe localhost) aur iPhone ke liye local HTTPS     | QA-Q5                        |
| SJ-13 | ZAP baseline ka container, chalne ka samay aur SPA pe jhoothe nateeje                                                                                                                                      | TR-36                        |
| SJ-14 | Vitest ke v8 coverage me area ke hisaab se alag seema (globs) aur badli lines ki coverage ka tareeka                                                                                                       | TR-23, QA-Q1                 |
| SJ-15 | Scheduled workflow default branch se chal ke `prerelease` ka code checkout kare, `permissions: {}` ke saath                                                                                                | TR-8                         |
| SJ-16 | Lighthouse ka mobile preset Windows laptop pe dohraane layak number deta hai ya nahi (CPU throttling)                                                                                                      | DS-10.10                     |
| SJ-17 | Security bug ka private record: public repo me GitHub ki private security advisory muft chalti hai ya nahi                                                                                                 | TR-39                        |
| SJ-18 | Laptop ki memory me ek saath kya chal sakta hai: saare databases, fakes, 9 apps ki static copy, Playwright, aur mutation ke alag containers                                                                | QR-6                         |

OPEN_QUESTIONS §2 me pehle se jaanch ki rows (accessibility tool WCAG 2.2 ke kitne niyam pakadta hai; `capture` aur camera; PWA me payment ke baad wapsi; iPhone push; Atlas M0 ke roles aur transactions; Atlas Search M0 ki seemaayein) yahan dobara nahi likhi; testing unke nateeje pe tiki hai.

## 9. Pehle ke kaam se lene layak (D-074)

Kasauti: (1) kisi pakki zaroorat ko hal kare; (2) kisi tay faisle se na takraye; (3) naye doc me naye vakya me likhi ja sake. Teeno "haan" hon tabhi lene layak.

| Id    | Kya                                                                                                                                                                                                                                                                                                                         | Purana path                                     | Kyun achha                                                                | Kasauti (1 / 2 / 3)                                             | Naye doc me kahan                            |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| LL-1  | Social sign-in ka fake server: teeno providers ke pages aur API, `state`, PKCE aur redirect ki asli jaisi jaanch, "agla insaan" ki line, verified email ka flag                                                                                                                                                             | `scripts-old/e2e/fake-oauth.ts`                 | SR-017 ke saare raaste bina asli provider ke                              | Haan (SR-017) / Haan / Haan                                     | §1.6, TR-12                                  |
| LL-2  | Chhota fake npm registry jisme asli npm CLI publish karta hai, aur fail publish aur session khatam hone jaisi haalat                                                                                                                                                                                                        | `scripts-old/packages/test/registry-server.ts`  | Package CLI ke tests asli registry ke bina                                | Haan (CLAUDE.md, OPERATIONS §11 niyam 8) / Haan / Haan          | §1.6, TR-15                                  |
| LL-3  | Collection scan ka pehra jisme jaan-boojh ke poora padhne wali query apne comment me wajah likhe                                                                                                                                                                                                                            | `scripts-old/e2e/collection-scans.ts`           | Tay pehre (OPERATIONS §2 niyam 6) me ek saaf chhoot ka raasta             | Haan / Haan (ARCHITECTURE §10.4 niyam 8 se takraav nahi) / Haan | TR-19                                        |
| LL-4  | Tests ke aakhir me ObjectId ka pehra: references string ki jagah ObjectId hi hon                                                                                                                                                                                                                                            | `scripts-old/e2e/object-ids.ts`                 | ARCHITECTURE §10.1 niyam 1 aur 2 ka apne aap pehra                        | Haan / Haan / Haan                                              | §1.9 me jod (integration)                    |
| LL-5  | MongoDB container: single-member replica set, test commands chalu (failpoint se commit fail), chhota cache                                                                                                                                                                                                                  | `infra-old/docker-compose.yml`                  | Transaction helper ke retry ke tests (AC-PLATFORM-1) aur laptop ki memory | Haan / Haan (OPERATIONS §1 niyam 2) / Haan                      | TR-2                                         |
| LL-6  | Mutation ke run me: copy OS ke temp folder me, pehle saare anchors ki jaanch, bacha mutant bina likhi wajah ke = fail, aur sirf jude tests chalana                                                                                                                                                                          | `scripts-old/mutation/lib/runner.ts`, `list.ts` | Copy ka niyam aur "wajah likho" ka anushasan                              | Haan (CLAUDE.md) / Haan / Haan                                  | §1.19, TR-22                                 |
| LL-7  | Authenticator ka code banane wala chhota helper E2E ke liye                                                                                                                                                                                                                                                                 | `scripts-old/e2e/totp.ts`                       | Staff ke sign-in ki E2E (FL-3)                                            | Haan / Haan / Haan                                              | §1.10 (FL-3)                                 |
| LL-8  | E2E ki halat app ke route se nahi, run ke database me seedha likhna (jaise baad me leak hua password)                                                                                                                                                                                                                       | `scripts-old/e2e/leaked.ts`                     | Production me koi test route nahi                                         | Haan (SR-032) / Haan / Haan                                     | TR-11, §1.7 niyam 3                          |
| LL-9  | CI ki config ka apna test: har app jiske paas E2E hai, CI ki matrix me ho                                                                                                                                                                                                                                                   | `scripts-old/ci/test/ci-workflow.test.ts`       | Naya app ya service CI se chhoot na jaaye                                 | Haan / Haan / Haan                                              | TR-1 ke saath ek line                        |
| LL-10 | Bug report ka dhaancha: user pe asar wala title, saboot ka level (chala ke dekha ya sirf code padh ke), gambhirta, status ki tay suchi                                                                                                                                                                                      | `docs-old/QA_AUDIT_REPORT.md` §2, §4            | Imaandari ka niyam bug me bhi                                             | Haan / Haan / Haan                                              | TR-40, TR-41                                 |
| LL-11 | Release ke test report me har command ka nateeja aur samay ki chhoti table                                                                                                                                                                                                                                                  | `docs-old/QA_AUDIT_REPORT.md` §2a               | "Kaise jaancha" ka saboot, dohraane layak                                 | Haan / Haan (OPERATIONS §3 niyam 12) / Haan                     | TR-42                                        |
| LL-12 | Purane bugs se regression ke scenarios: Redis ruka par juda (disconnect nahi) to signed-in route jaldi 503; keys ka pehla load fail to 503; purani generation ka refresh token; Valkey khaali ke baad band session; apps ki API calls pe timeout; proxy ka 5xx raw text me na dikhe; E2E ki safai backend band hone ke baad | `docs-old/QA_AUDIT_REPORT.md` §4, §8            | Asli galtiyan jo ek baar ho chuki hain                                    | Haan (SR-028, SR-029, SR-031, DS-6.6) / Haan / Haan             | AC-GATEWAY-4, AC-IDENTITY-6, -7, TR-3 me jod |

**Pehle se naye docs me (dobara lene ki zaroorat nahi):** mutation ke alag containers (OPERATIONS §1 niyam 5); E2E ke traces 7 din (OPERATIONS §2 niyam 9); aakhri `check` job aur bina `needs` (OPERATIONS §2 niyam 1, 2); E2E kai widths pe axe ke saath (DS-5.1, DS-8.1); fake adapters (OPERATIONS §1 niyam 8); har app ki rewrite aur headers ki config ka ek test (SR-002, purana `scripts-old/ci/test/vercel-headers.test.ts`); actions SHA pe pinned ka lint (SR-082, purana `actions-pinned.test.ts`); config schema aur `.env.example` ka milaan (OPERATIONS §1 niyam 9, purana `env-examples.test.ts`).

**Na lene layak:**

- Sirf badle workspaces ke tests ki planning aur build cache (purana `scripts-old/ci/lib/plan.ts`): OPERATIONS §2 niyam 12 ise tab tak rokta hai jab tak run 15 minute se chhota hai.
- Purane E2E ki matrix sirf teen apps pe: R1 me 9 apps ke flows chahiye.
- Haath se likhi mutation lists hi akela tareeka: galtiyan likhne wale ki soch tak seemit (§1.19 niyam 7); sirf "wajah likho" ka anushasan lena.
- Frontend me bahar ki error service: D-286 se takraav.
- Customer app ka prerender aur uske timeout wale tests: D-290 (R1 me sirf SPA) se takraav.
- MongoDB ke kernel wali dikkat ka purana workaround niyam ki tarah: ye tathya hai, sirf SJ-2 me jaanch.

## 10. Tay faislon pe dhyaan

Tay cheezein jo test karna mushkil hain ya aapas me takraati dikhti hain. Inhe sawal nahi banaya; main session dekhe.

1. **DH-1. Search ke kram ke tests "dono pe" kaise?** ARCHITECTURE §6 niyam 7 kehta hai ranking ke tests Atlas Search aur text index adapter dono pe, par wahi niyam kehta hai laptop aur CI pe Atlas Search nahi milta, aur tests kabhi live database se nahi judte (D-051, OPERATIONS §1 niyam 7). Is tarah Atlas wala hissa kahin nahi jaancha ja sakta. Raasta: SJ-3 (local Atlas Search wala image) ho to dono pe; na ho to live smoke check me search ki ek jaanch, aur Atlas ke operators pe likhi seema.
2. **DH-2. "Har screen" bamuqabla "mukhya screens":** D-342 ka "Asar (Claude)" har screen ka visual aur contrast test dono themes me kehta hai, jabki R-057 ka bachav (D-368, owner ki haan) screenshot tests sirf mukhya screens (misaal 30) pe. Contrast tokens ke level pe DS-2.10 se aur screens pe axe se har jagah ho sakta hai; screenshot sirf mukhya pe. Ek line saaf karni chahiye ki "visual" ka matlab kya.
3. **DH-3. SR-019 ka ek jaisa samay:** "kam se kam tay samay (misaal 400 ms)" test ho sakta hai, par registered aur anjaan email ke samay ka barabar hona CI ke shor me pakka nahi. Test sirf body ki barabari aur kam se kam samay jaanche; samay ke farak ka naap laptop pe, kai baar, ek seema ke saath. Saath me OPEN_QUESTIONS §2 ki row (password wala sign-up bhi code se pakka) ka jawab is niyam ki sachchai pe asar karta hai.
4. **DH-4. Server ke p95 kis CPU pe?** D-053 targets sirf jaage server pe kehta hai, aur OPERATIONS §10 niyam 1 CPU ki seema "misaal `--cpus=0.1`, aur tulna ke liye 0.5" deta hai. Dono pe nateeja kai guna alag hoga (argon2id aur PDF). Targets kis seema pe "pass" maane jaayein, ye likha nahi.
5. **DH-5. Container me M0 ki 100 ops/second nahi:** design target ka load test (D-283) laptop pe pass ho sakta hai jabki live pe seema pehle aati. Isliye flow ke DB operations ki ginti (TR-19) hi asli pehra hai; uska budget module design me tay hona chahiye.
6. **DH-6. Live smoke ka order:** OPERATIONS §3 niyam 9 order ko payment tak le jaata hai, par aage kya ho (cancel, aankde, Bestseller), likha nahi. QA-Q10.
7. **DH-7. "Kernel packages" ki paribhasha:** CLAUDE.md mutation ke liye kernel packages kehta hai, par naye docs me unki list kahin nahi (sirf ARCHITECTURE §10.1 niyam 6 aur SR-032 me do naam). TR-21 list prastaav karta hai.
8. **DH-8. FL-5 aur khula order:** "khula order ya return ho to delete ruka (abhi jaanchna baaki)". Jab tak ye tay nahi, AC-IDENTITY-12 ka yeh hissa nahi likha ja sakta.
9. **DH-9. TTL ke tests:** ARCHITECTURE §10.2 niyam 12 TTL ka kram "test me jaancha jaata hai" kehta hai. MongoDB ka TTL monitor apne chakkar pe chalta hai, to asli mitna test me dheema aur flaky; test index ki definitions aur umar ke kram ko jaanche, mitne ka intezaar nahi.
10. **DH-10. Raat ki neend aur chhote samay:** D-322 me server raat ko soya; D-251 ki 2 aur 3 ghante wali ghadiyaan aur SR-060 ka 24 ghante ka alert raat me nahi chal sakte (ARCHITECTURE §4 niyam 8 sirf request ke andar wala hissa bachata hai). Tests "der se, par khoya nahi" jaanch sakte hain, "samay pe" nahi.
11. **DH-11. Owner ke apne accounts aur seemaayein:** D-203 ke jod (address, device, payment) se owner ke `+` alias accounts ek gine jaate hain, to live pe haath ke tests me D-109 ka "pehla order" aur D-204 ke 2 khule UPI orders jaldi lagte hain (D-203 ke Asar me bhi likha). Haath ke tests ka data isi hisaab se.
12. **DH-12. Delivery app sirf desktop Chromium me:** OPERATIONS §2 niyam 6 ki E2E Chromium pe hai; Delivery app ke asli jokhim (camera, location, offline data ka mitna R-061, dhoop) phone pe hain. Isliye QA-Q5 ke bina R1 ka gate (G12) khaali rehta.
13. **DH-13. SR-055 ki maani hui seema:** browser me gallery ko poori tarah rokna pakka nahi; test sirf `capture` attribute jaanch sakta hai. Criterion (AC-DELIVERY-5) isi seema ke saath likha hai.
14. **DH-14. "Verified" aur D-019:** D-019 "bana hai" ke liye test ki link maangta hai, aur CLAUDE.md "verified" ke liye asli user ka kaam. Dono alag shabd rahein: test ki link se "bana hai", haath ke record (TR-30) ya live smoke se "verified".

### 10.1 Security Architect ke doosre run ke liye

- SR-xxx ke "Test kaise" ko TR-34 aur TR-35 ke saath milaana; jin niyamon ka saboot sirf record hai (SR-064, SR-081, SR-084), unke record ka roop.
- TR-11 (production me koi test route nahi) aur DAST (TR-36) ko threat model ke "bachav aur test" me jodna.
- Security bugs ka private record (TR-39, SJ-17) aur R-054 ka milaan.

## Change log

| Version | Date       | Badlav                                                                                                                                                                                                                       |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-21 | Pehla version: test strategy, R1 ke 184 acceptance criteria (13 modules, 9 apps) aur R2 ka khaka, 42 testing niyam, DoD aur R1 ka gate, 10 owner sawal, 15 batches, 12 risks, 18 jaanch, 12 lene layak, 14 dhyaan ke points. |
