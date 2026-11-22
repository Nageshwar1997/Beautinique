# PRODUCT: Beautinique

> **Status:** v1.1.3 (2026-11-22). Kya bana rahe hain aur kyun. Har baat ka faisla [DECISIONS.md](DECISIONS.md) me hai; yahan saar aur faislon ki links. Cheezein ek-ek karke, owner ki haan ke baad judti hain.

## Is file me kya aayega

- Product ek nazar me.
- Business model: kaun bechta hai, maal ka maalik kaun, paisa kaise chalta hai.
- Users aur roles: har app ke roles aur unka kaam.
- Apps: kaunsa app kis ke liye.
- Launch aur expansion: kahan se shuru, aage kaise badhega.
- Scope: kya banega, kya nahi.
- Har hisse ke faislon ki links ([DECISIONS.md](DECISIONS.md)).

## 1. Product ek nazar me

- Beautinique ek Indian online storefront hai, sirf beauty aur personal care ke liye (D-029). Drug wale items kabhi nahi (D-043).
- Ek hi storefront pe apna brand "Unibelle" aur doosre beauty brands bikte hain (D-030). Unibelle ek alag (dummy) company "Unibelle Cosmetics Pvt Ltd" ke seller account se bikta hai, baaki sellers jaise hi niyamon se (D-031, D-243). "Beautinique" platform ka naam hai, product brand nahi; platform company "Beautinique Pvt Ltd" (D-243).
- Bech sirf brand owners aur authorised distributors sakte hain (D-032).
- Lakshya: portfolio project, par aisa bane ki kal asli business ban sake. Design asli jaisa; registrations aur kanooni details dummy (D-026). Design aur code asli users maan ke (D-012). Kharcha ₹0 (D-028).
- Poore ecosystem ka design pehle din; banana releases me, koi feature kata nahi (D-008). R1 ek patla par poora order flow hai (D-055); detail [PROJECT_PLAN.md](PROJECT_PLAN.md) §1.

## 2. Business model

| Hissa              | Niyam                                                                                                                                         | Faisla              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Maal ka maalik     | Bikne tak brand (seller). Platform maal rakhta, pack karta aur pahunchata hai, aur fees leta hai.                                             | D-060               |
| Maal kahan         | Sirf apne warehouse me. Seller khud customer ko nahi bhejta.                                                                                  | D-014               |
| Delivery           | Sirf apne delivery partners: gig partners, apni gaadi pe. Warehouse aur hub ke beech kiraye ka transporter.                                   | D-014, D-033, D-027 |
| Daam               | Selling price seller tay kare, MRP aur platform ke niyamon ke andar. Beauty Pro buyers ka alag daam R2 me.                                    | D-061, D-065        |
| Payment            | Prepaid online (Razorpay) ya delivery pe UPI QR; cash bilkul nahi. Saare payments test mode me.                                               | D-034, D-026        |
| Platform ki kamaai | Category ka commission, har unit ki fulfilment fee aur pehle se tay fees.                                                                     | D-078               |
| Seller ka paisa    | Return ki muddat ke baad payable, hafte me ek payout; pehle udhaar aur fees katein.                                                           | D-081, D-071        |
| Invoice aur tax    | Sirf India aur INR; har order ka GST-compliant invoice, har seller ke GSTIN se. Accounting ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §1 me. | D-041, D-092        |
| Sellers kahan se   | Poore India se; jis state ke warehouse me maal, us state ka GSTIN zaroori.                                                                    | D-036               |
| Foreign investment | Koi plan nahi.                                                                                                                                | D-040               |

## 3. Users aur roles

### 3.1 Roles kaise kaam karte hain

1. Har role parivaar ka apna app (D-010). App ke andar roles hote hain; har role permissions ka ek set.
2. Design me saare roles; har role apne module ke saath chalu hota hai, usi badlav me uski permissions (D-017, D-054). R1 me sirf R1 ke flows ke roles chalu ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
3. Ek insaan kai roles le sakta hai, par har role ka alag account (D-017). Neeche "shuru me X" ka matlab: role system me hai, bas shuru me wo kaam X wala account karta hai.
4. Master bina deploy ke naya sub-role bana sakta hai (D-017); kuch permissions kabhi sub-role me nahi jaatin (SR-037).
5. Jahan kaam apna role karta hai, wahan jaankari dummy nahi, us role ke staff account se (D-241).
6. Permissions, scope, kaun kise appoint kare aur kaam ka bantwara (separation of duties): [ARCHITECTURE.md](ARCHITECTURE.md) §11.
7. "Kab chalu" column: **R1** = R1 ke flows me chahiye; **R2** = faisle me R2 likha; **Module ke saath** = jab uska module bane (D-017).

### 3.2 Har app ke roles

**1. Customer (bahar ke users)**

| Role                | Kaam                                                                                                  | Kab chalu | Faisla              |
| ------------------- | ----------------------------------------------------------------------------------------------------- | --------- | ------------------- |
| **Customer** (main) | Products dekhna, kharidna, order, cancel, return, daawa aur review. Sirf 18+; sign-in ke teen raaste. | R1        | D-038, D-021, D-020 |
| Beauty Pro Buyer    | Jaancha hua beauty professional (ek saboot se); Pro daam aur GSTIN wala invoice.                      | R2        | D-065, D-069        |

**2. Seller (bahar ke sellers, aur Unibelle ki team)**

| Role                            | Kaam                                                                                                                                                      | Kab chalu       | Faisla              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------- |
| **Seller Account Owner** (main) | Seller account ka maalik: brand ka saboot, dastavez (dummy KYC), agreement, apne staff ke logins, bank aur payouts. Authenticator zaroori.                | R1              | D-032, D-184, D-190 |
| Seller Grievance Officer        | Seller ke block me grievance officer; seller ke products ki shikayat pe platform ki seedhi ke ticket pe jawab. Account Owner khud bhi ho sakta.           | R1              | D-238, D-163        |
| Seller Catalog Manager          | Listings aur variants likhna aur badalna; jokhim wale badlav jaanch me jaate hain.                                                                        | R1              | D-098, D-076        |
| Seller Dispatch & Inventory     | Maal bhejne ki pehle se suchna, maal bhejna, receiving ke farak ka jawab. Authenticator zaroori.                                                          | R1              | D-096, D-184        |
| Seller Finance                  | Statements, payouts ki halat aur CSV dekhna; bank details nahi badal sakta. Authenticator zaroori.                                                        | R1              | D-143, D-144, D-184 |
| Seller Compliance & Quality     | Licence ka type, claims ke saboot, label ki jaankari aur recall ke kaam.                                                                                  | Module ke saath | D-128, D-224, D-129 |
| Seller Marketing                | Brand ka store page, brand ke offers, reviews ka jawab aur product Q&A.                                                                                   | R2              | D-101, D-160, D-170 |
| Seller API Integration          | Bade seller ke apne system ke liye API keys (stock aur orders ka sync).                                                                                   | Module ke saath | D-017               |
| **Own-Brand Manager**           | Unibelle ka seller account chalata hai, sirf seller ke haq se; apni listing khud manzoor nahi karta, platform ke haq se Unibelle ka content nahi badalta. | R1              | D-031, D-271        |
| Own-Brand QA & Batch Release    | Unibelle ke label, manufacturer ka licence, har batch ki release aur Unibelle ke recall.                                                                  | Module ke saath | D-031, D-129        |

**3. Admin (andar ki team: marketplace ka kaam aur sub-district)**

| Role                                  | Kaam                                                                                                                          | Kab chalu                                     | Faisla              |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------- |
| **Admin** (main)                      | Ek sub-district: hub ka switch aur live, pincode ka primary sub-district, aur bina mapping wale pincodes ki list.             | R1                                            | D-015, D-016        |
| Seller Ops Executive                  | Poore desh ki ek team: sellers ki manzoori, har warehouse state ke GSTIN ki jaanch, aur seller ke dastavez dekhna.            | R1                                            | D-084, D-193        |
| Seller Ops Lead                       | Seller Ops ki queue aur SLA; seller ke reject ki appeal ka faisla (jisne reject kiya wo nahi).                                | R1; shuru me Head of Operations               | D-044, D-084        |
| Listing Reviewer                      | Poore desh ki team, kaam category ke hisaab se: listing aur INCI list ki jaanch, live ke baad jokhim wale badlav.             | R1                                            | D-084, D-098, D-099 |
| Senior Catalog Reviewer               | Ingredient master list aur blocklist (wajah ke saath), aur listing ke reject ki appeal ka faisla (jisne reject kiya wo nahi). | R1                                            | D-132, D-084        |
| Category Manager                      | Category tree, har category ke variants aur attributes, HSN ki allowed list, aur search ke synonyms.                          | R1                                            | D-076, D-086, D-152 |
| Review Moderator                      | Poore desh ki team: reviews, photos aur reports ki queue, chhupana aur wapas dikhana wajah ke saath.                          | R1                                            | D-136, D-251        |
| Beauty Pro Verifier                   | Beauty Pro ke saboot ki jaanch aur darja dena ya hatana.                                                                      | R2                                            | D-069, D-193        |
| Cosmetics Regulatory & Product Safety | Licence ke type ke niyam, batch recall aur skin reaction ke case.                                                             | Module ke saath (recall aur skin reaction R2) | D-128, D-129, D-130 |
| Shade Specialist                      | Shade finder aur try-on ka shade data.                                                                                        | R2                                            | D-168, D-169        |
| Brand Protection                      | Brand authorisation ki chain, nakli maal aur IP ki shikayat, takedown.                                                        | Module ke saath                               | D-032               |
| Brand Partnerships                    | Naye brands laana, doosre state ke sellers ko GSTIN ki guide; manzoori ka haq nahi.                                           | Module ke saath                               | D-036               |
| Fraud & Risk Analyst                  | Return, daawe, coupon aur payment ka galat istemaal, aur nakli review ke signals.                                             | Module ke saath                               | D-156, SR-058       |
| Trust & Safety Lead                   | Risk ke niyam, customer ban ki appeal, nakli review pe karwai; jaanch ke dastavez dekh sake. Shuru me Master ka alag account. | Module ke saath                               | D-047, D-156, D-193 |

**4. Super Admin (andar ki team: state aur district)**

| Role                   | Kaam                                                                                                                                                                                                                                                                                                      | Kab chalu | Faisla        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------- |
| State Admin            | Ek state: uske districts aur Super Admins ki nigrani aur unki appointment, naye district kholne ki tayyari, state ke kanooni kaam ki checklist (state ka GST aur TCS registration, warehouse ke licence, state ke gig-worker niyam; sab dummy), aur state ki escalations. State ka switch Master ke paas. | R1        | D-426, D-015  |
| **Super Admin** (main) | Ek district: district ka switch aur live, district ke Admins aur hubs ki nigrani.                                                                                                                                                                                                                         | R1        | D-015, SR-035 |

**5. Master (owner aur governance)**

| Role                         | Kaam                                                                                                                                                                                                                            | Kab chalu       | Faisla                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------- |
| **Master** (main)            | Owner. State ka switch aur live; top roles ke grants; location master ka import; payout batch ki manzoori; authenticator reset; kill switches; saare apps ka audit. Koi "decide" permission nahi, approvals ka koi bypass nahi. | R1              | D-015, D-189, D-200, SR-009, SR-037 |
| Head of Operations           | Support, Logistics aur Seller Ops ke upar; grievance register ki mahine ki report.                                                                                                                                              | Module ke saath | D-044, D-163                        |
| Nodal Officer                | Kanoon aur compliance: sarkari aur court ke orders, policies aur seller agreement ke versions. Jaankari asli staff account se.                                                                                                  | R1              | D-237, D-251, D-150                 |
| Security Contact             | CERT-In ka Point of Contact, owner ke paas.                                                                                                                                                                                     | R1              | D-253                               |
| Marketplace Fairness Analyst | Apne brand ko alag treatment na mile, discount ke saath sahi pichhla daam, sponsored pe label.                                                                                                                                  | Module ke saath | D-139, D-223, D-271                 |
| Internal Auditor             | Manzooriyon, refunds aur payouts ka sirf padhne wala audit.                                                                                                                                                                     | Module ke saath | SR-076                              |

**6. Support Desk (andar ki team)**

| Role                        | Kaam                                                                                                                             | Kab chalu       | Faisla              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------- |
| **Support Agent** (main)    | Order dekhna, return manzoor ya reject, "parcel nahi mila" ka daawa, refund shuru; ek maamle aur din ki seema ke andar.          | R1              | D-105, D-188        |
| Support Lead                | Reject ki appeal (jisne reject kiya wo nahi), seema se upar ki manzoori, fail refund ka staff raasta Finance ke saath.           | R1              | D-147, D-188        |
| Grievance Officer           | Shikayat ki seedhi ka teesra kadam, grievance register, aur personal data ke sawalon ka sampark. Jaankari asli staff account se. | R1              | D-163, D-237, D-253 |
| Seller Support Agent        | Sellers ke tickets (onboarding, reject, maal, payout); manzoori ka haq nahi.                                                     | R2              | D-105               |
| Production Support Engineer | System ki galti (paisa kata par order nahi bana, atka order) sirf audit wale marammat ke kaamon se.                              | Module ke saath | D-017, SR-076       |
| BPO Supervisor              | Bahar ke vendor ke agents (sirf unke) sambhalna.                                                                                 | R2              | D-105               |
| Beauty Advisor              | Kharidne se pehle message thread pe shade aur routine ki salah; apne ya related brand ke sujhaav pe label.                       | R2              | D-025, D-271        |
| Skin & Hair Expert          | Beauty aur skincare ki salah (medical nahi), Meet ke dummy link se.                                                              | R2              | D-025, D-252        |

**7. Finance (andar ki team)**

| Role                             | Kaam                                                                                     | Kab chalu                                 | Faisla       |
| -------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------- | ------------ |
| **Finance Manager** (main)       | Payout batch banana (manzoori doosre account se), fees ki settings, milaan aur suspense. | R1                                        | D-189, D-078 |
| Tax & Statutory Compliance       | TCS, TDS, GST ke registers aur returns, HSN ke rate ki jaanch.                           | Module ke saath                           | D-086        |
| Payments & Refund Reconciliation | Gateway ke settlements ka roz milaan, refunds aur chargebacks.                           | Module ke saath; shuru me Finance Manager | D-095, D-111 |
| Payouts Executive                | Sellers aur partners ke payouts.                                                         | Module ke saath; shuru me Finance Manager | D-081        |
| Accounts Payable                 | Transporter jaise vendors ke bill.                                                       | R2                                        | D-027        |

**8. Logistics Ops (andar ki team)**

| Role                          | Kaam                                                                                                                                         | Kab chalu                                   | Faisla              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------- |
| **Logistics Head** (main)     | Warehouses aur hubs; area settings (delivery fee, cut-off, chhuttiyan, delivery pe UPI ki seema); Warehouse aur Hub Managers ki appointment. | R1                                          | D-107, D-117, D-109 |
| Network Planner               | Pincode mapping ki jaanch aur waitlist dekh ke agla area sujhaana.                                                                           | Module ke saath                             | D-016, D-046        |
| Warehouse Manager             | Warehouse ka staff aur kaam; R1 me warehouse se hub ke trips bhi.                                                                            | R1                                          | D-123, D-027        |
| Receiving Executive           | Maal lena: batch aur expiry ki jaanch, label, farak ki photo, "accept" scan.                                                                 | R1                                          | D-096, D-083, D-097 |
| Pick-Pack Associate           | Batch ke hisaab se pick, scan, pack, invoice aur label.                                                                                      | R1                                          | D-064, D-077        |
| Returns QC Inspector          | Lauta maal jaanchna; refund chhodna ya rokna.                                                                                                | R1                                          | D-112, D-115        |
| Inventory Controller          | Ginti, bikri band ki seema aur recall ke kaam.                                                                                               | Module ke saath                             | D-062, D-129        |
| Line-haul & Stock Transfer    | Warehouse aur hub ke beech trips, transporter, manifest aur seal.                                                                            | Module ke saath; shuru me Warehouse Manager | D-027               |
| Returns-to-Vendor             | Na bika, expiry ke paas ya expire hua maal brand ke chunaav se wapas ya nasht.                                                               | Module ke saath; shuru me Warehouse Manager | D-062               |
| Hub Manager                   | Hub ka staff aur partners; code ki 6th koshish kholna, partner ka session band karna, RTO.                                                   | R1                                          | D-123, D-108        |
| Hub Operations Executive      | Scan aur sort, trip ka receive scan.                                                                                                         | R1                                          | D-123, D-027        |
| Rider Onboarding & Compliance | Partner ki pehchaan (dummy), licence, gaadi ke kaagaz aur gig ka registration.                                                               | Module ke saath; shuru me Hub Manager       | D-254               |
| Delivery Partner Support      | Partners ki shikayat aur deactivation ki appeal.                                                                                             | Module ke saath; shuru me Hub Manager       | D-254               |
| Logistics Control Tower       | Atke orders aur parcels pe nazar.                                                                                                            | Module ke saath                             | D-117               |
| Loss Prevention               | Chori, nakli delivery aur badle hue return ke signals.                                                                                       | Module ke saath                             | SR-058              |
| District Logistics Manager    | Ek district ke saare hubs.                                                                                                                   | Module ke saath                             | D-015               |
| Regional Logistics Head       | Kai states.                                                                                                                                  | Module ke saath; shuru me Logistics Head    | D-035               |

**9. Delivery (phone ka app)**

| Role                        | Kaam                                                                                                | Kab chalu       | Faisla                     |
| --------------------------- | --------------------------------------------------------------------------------------------------- | --------------- | -------------------------- |
| **Delivery Partner** (main) | Gig partner, apni gaadi pe: delivery code ya photo ka saboot, door pe UPI, return pickup ki jaanch. | R1              | D-033, D-072, D-109, D-113 |
| Rider Team Lead             | Lagbhag 15 se 25 partners ki team.                                                                  | Module ke saath | D-033                      |

**10. Growth Studio (andar ki team)**

| Role                        | Kaam                                                                                | Kab chalu       | Faisla       |
| --------------------------- | ----------------------------------------------------------------------------------- | --------------- | ------------ |
| **Marketing Head** (main)   | Marketing ka calendar, budget aur ads ki shartein. Shuru me Master ka alag account. | R2              | D-047        |
| Storefront Merchandiser     | Banners aur collections; daam, MRP ya coupons nahi badal sakta.                     | Module ke saath | D-139        |
| Promotions & Coupon Manager | Offers aur coupons, budget ki seema ke saath.                                       | R2              | D-101, D-055 |
| Loyalty Manager             | Points aur referral.                                                                | R2              | D-173, D-176 |
| CRM & Lifecycle Manager     | Dobara kharid ki yaad aur doosri khabrein, consent ke andar.                        | R2              | D-178, D-141 |
| Content Editor              | Beauty ke lekh aur tutorials.                                                       | Module ke saath | D-017        |
| Creator & Affiliate Manager | Creators ki manzoori, commission aur disclosure ki jaanch.                          | R2              | D-055        |
| Pro & B2B Programme Manager | Beauty Pro ke niyam aur Pro daam.                                                   | R2              | D-065, D-069 |
| Retail Media Manager        | Sponsored jagah, label aur seema ke saath.                                          | R2              | D-139        |

**11. Creator (bahar ke users)**

| Role                   | Kaam                                                                          | Kab chalu | Faisla |
| ---------------------- | ----------------------------------------------------------------------------- | --------- | ------ |
| **Creator** (main)     | Apna storefront, looks, links aur codes; commission return ki muddat ke baad. | R2        | D-055  |
| Affiliate Partner      | Sirf links aur codes.                                                         | R2        | D-055  |
| Creator Agency Manager | Apne creators ki taraf se kaam, har creator ki consent ke saath.              | R2        | D-055  |

### 3.3 Kaun kisko report karta hai

```
Master (owner)
├── Internal Auditor (sirf padhna)
├── Nodal Officer → Marketplace Fairness Analyst, Cosmetics Regulatory & Product Safety
├── Security Contact
├── Head of Operations
│   ├── Seller Ops Lead (Admin) → Seller Ops Executives
│   ├── Support Lead (Support Desk) → Support Agents, Seller Support, BPO Supervisor, Beauty Advisors, Skin & Hair Experts
│   └── Logistics Head (Logistics Ops) → Network Planner, Control Tower, Loss Prevention, Line-haul, Partner Support
│         → Regional Logistics Heads → District Logistics Managers
│             → Warehouse Managers → Receiving, Pick-Pack, Returns QC, Inventory, Returns-to-Vendor
│             → Hub Managers → Hub Operations, Rider Onboarding, Rider Team Leads → Delivery Partners
├── Grievance Officer (Support Desk)
├── State Admins (har state) → Super Admins (har district) → Admins (har sub-district)
├── Admin app ki poore desh ki teams: Senior Catalog Reviewer → Listing Reviewers; Category Managers;
│   Review Moderators; Brand Protection; Brand Partnerships; Beauty Pro Verifier; Shade Specialist
├── Trust & Safety Lead (shuru me Master ka alag account) → Fraud & Risk Analysts
├── Finance Manager → Tax & Statutory, Reconciliation, Payouts, Accounts Payable
└── Marketing Head (shuru me Master ka alag account) → Growth Studio ke roles → Creators aur Affiliates

Bahar ke accounts: Seller Account Owner → apna seller staff; Own-Brand Manager → Unibelle ki team;
Customers (Beauty Pro Buyers bhi); Creators, Affiliate Partners aur Creator Agency Managers.
```

### 3.4 Kaam jinke liye platform pe login nahi

HR aur payroll, statutory auditor, company secretary, bahar ka lawyer aur CA, developers (system ki galti ke liye sirf Production Support Engineer ka login), data ka vishleshan (sirf chhupe data pe), social media, photo studio, Unibelle ki R&D team, warehouse ke loaders aur guards, aur fire safety officer.

### 3.5 Jo roles nahi chahiye

| Role                                  | Kyun nahi                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Cash officer                          | Cash nahi lete (D-034).                                                                         |
| Fleet Manager                         | Partners apni gaadi chalate hain (D-033).                                                       |
| Parent ya guardian                    | Customers sirf 18+ (D-038).                                                                     |
| Brands se pickup aur bahar ka courier | Seller maal khud warehouse bhejta hai; customer tak delivery sirf apne partners (D-014).        |
| Catalog Content Executive             | Listing ka content seller likhta hai; staff khud field nahi badalta (D-098).                    |
| City ke roles                         | Seedhi me city nahi: India > State > District > Sub-District (D-015).                           |
| Demand ka planner                     | Maal seller ka hai aur dobara bhejna seller ka chunaav (D-060, D-062).                          |
| L2 Support Specialist                 | Seema se upar ke maamle Support Lead ke paas (D-188); authenticator ka reset Master se (D-200). |
| Data Protection Officer               | Significant Data Fiduciary nahi; personal data ka sampark Grievance Officer (D-253).            |

## 4. Apps

11 apps, har role parivaar ka ek (D-010). Saare fully responsive web; Delivery mobile-first PWA (offline); baaki apps phone pe install ho sakein; native apps nahi (D-042). Har app ka apna sign-in aur apni cookies (D-186).

| App           | Kis ke liye                                     | Sign-up                    |
| ------------- | ----------------------------------------------- | -------------------------- |
| Customer      | Customers aur Beauty Pro Buyers                 | Haan (allowlist, D-133)    |
| Seller        | Sellers ki team aur Unibelle ki team            | Haan (allowlist, SR-018)   |
| Admin         | Marketplace ki teams aur sub-district ke Admins | Nahi, sirf staff ka invite |
| Super Admin   | State Admins aur district ke Super Admins       | Nahi, sirf staff ka invite |
| Master        | Owner aur governance                            | Nahi                       |
| Support Desk  | Support, grievance aur salah ki team            | Nahi, sirf staff ka invite |
| Finance       | Finance ki team                                 | Nahi, sirf staff ka invite |
| Logistics Ops | Warehouse, hub aur logistics ki team            | Nahi, sirf staff ka invite |
| Delivery      | Delivery partners                               | Nahi, Hub ka invite        |
| Growth Studio | Marketing aur growth ki team                    | Nahi, sirf staff ka invite |
| Creator       | Creators aur affiliates                         | Haan (R2)                  |

## 5. Launch aur expansion

- **Seedhi:** India > State > District > Sub-District; har sub-district me theek ek hub, district me ek main warehouse (D-015).
- **Pehla area:** Maharashtra → Pune → warehouse wala sub-district; 1 warehouse aur 1 hub (D-014, D-022, D-055).
- **Kram:** Pune district, phir Maharashtra ke baaki districts, phir baaki states. Poora India products dekh sake, order sirf served pincodes se (D-035).
- **Kholna:** naya area sirf setting aur operations ka kaam, na code change, na deploy (D-037). Har level ka switch, aur live tabhi jab sharten poori (D-015).
- **Pincode:** delivery ka faisla pincode se theek ek hub se (D-016). Unserved pincode pe "unavailable" aur notify-me waitlist; usse agla area sujhaav, par kholne ka koi tay kram nahi (D-046).

## 6. Scope

**Banega:** poore ecosystem ka design aur saare 11 apps, releases me (D-008). R1 me kya hai aur kya baad me: [PROJECT_PLAN.md](PROJECT_PLAN.md) §1.

**Nahi banega:**

- Beauty aur personal care ke alawa koi category (D-029); drug wale items (D-043).
- Brand owner ya authorised distributor ke alawa sellers (D-032).
- Cash on delivery; door pe payment sirf UPI se (D-034).
- Bahar ka courier customer ke orders ke liye (D-014).
- 18 saal se kam umar ke customers (D-038).
- Native mobile apps (D-042).
- Mobile pe koi message: na SMS, na WhatsApp; har code sirf email se ([CLAUDE.md](../CLAUDE.md)).
- Asli sarkari registrations aur filings; ye dummy hain (D-026).
- Foreign investment (D-040).

## Change log

| Version          | Date                     | Badlav                                                                                                         |
| ---------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.1.3 | 2026-11-17 se 2026-11-22 | Product, business model, 11 apps ke roles, apps, launch aur scope; har badlav ka poora itihaas git me (D-442). |
