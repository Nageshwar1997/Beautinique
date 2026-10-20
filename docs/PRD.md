# PRD — BQ

> **Status:** v1.4 (2026-10-20), **approved**. §6 ke flows ki technical detail aur §7 ke performance numbers ARCHITECTURE.md me aayenge.

## 1. Product overview

Beautinique (BQ) ek Indian e-commerce platform hai jo sirf **beauty aur personal care** products bechta hai. Customer products dekhte hain, virtual try-on karte hain aur ek hi storefront se kharidte hain. Is storefront pe do tarah ke products honge:

- **Beautinique ke apne brand** ke products
- **Doosre beauty brands** ke products, jo brand owners ya unke authorised distributors bechenge

**Saara stock Beautinique ke warehouse me rahega.** **Delivery sirf Beautinique ke apne delivery partners karenge.** Har main role ka **apna alag app** hoga. Total 11 apps hain, aur **saare launch pe hi banenge** (§4).

**Launch Pune district (Maharashtra) se hoga.** Uske baad platform district-by-district aur state-by-state badhega. Naya district ya state kholna sirf ek setting ka kaam hona chahiye, code change nahi (§7.2).

**Project ka type:** ye ek **education aur portfolio project** hai. Beautinique ek dummy brand hai aur bechne ke liye nahi hai. Phir bhi ise bilkul **asli production-grade product** ki tarah banaya jayega. Kanooni aur government wali cheezein system me poori tarah banengi, par unki details dummy hongi aur asli registration ya verification nahi hoga (§7.1).

## 2. Decisions ab tak

| Area                   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                 | Kab tay hua |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| Product category       | **Sirf beauty aur personal care.** Koi aur category nahi aayegi.                                                                                                                                                                                                                                                                                                                                                         | 2026-10-18  |
| Business model         | **Beautinique + doosre brand sellers.** Beautinique apne brand ke products bechega. Doosre beauty brands seller ban ke bechenge. Sab kuch ek hi storefront pe.                                                                                                                                                                                                                                                           | 2026-10-18  |
| Apna brand             | Seller app me ek **"house brand" seller account** ke through chalega, aur Own-Brand Manager ise sambhalega. Iske products bhi baaki brands ki tarah hi check honge. Koi shortcut nahi hoga, Master ke liye bhi nahi.                                                                                                                                                                                                     | 2026-10-18  |
| Kaun bech sakta hai    | **Sirf brand owners aur authorised distributors.** Clinic, salon, spa, freelancer, home-based aur individual bech nahi sakte. Wo **Beauty Pro Buyer** ban ke kharid sakte hain (§3).                                                                                                                                                                                                                                     | 2026-10-18  |
| Stock                  | **Saare brands ka stock Beautinique ke warehouse me rahega.** Brand stock bhejega, aur batch aur expiry ek hi jagah check hogi: receiving pe.                                                                                                                                                                                                                                                                            | 2026-10-18  |
| Delivery               | **Sirf Beautinique.** Hamare delivery partners hub se customer tak delivery karenge aur return pickup karenge. Customer orders ke liye koi third-party courier nahi.                                                                                                                                                                                                                                                     | 2026-10-18  |
| Delivery partners      | **Gig partners** honge (payroll employee nahi), aur **apni gaadi** chalayenge.                                                                                                                                                                                                                                                                                                                                           | 2026-10-18  |
| Payments               | **Prepaid online** (Razorpay), ya delivery ke waqt **UPI QR**. **Cash bilkul nahi.**                                                                                                                                                                                                                                                                                                                                     | 2026-10-18  |
| Launch coverage        | **Phases me:** 1) **Pune district, Maharashtra.** 2) Maharashtra ke baaki districts, ek-ek karke. 3) Phir baaki states isi tarah: pehle sabse bada district, phir baaki. Poore India ke customers products dekh sakte hain, par order sirf served pincodes se hoga.                                                                                                                                                      | 2026-10-18  |
| Sellers ki location    | **Poore India ke brands jud sakte hain**, kyunki unka stock hamare warehouse me aata hai. **Shart:** jis state ke warehouse me unka stock rahega, us state ka GST registration unke paas hona chahiye. Pune launch ke liye iska matlab hai **Maharashtra GSTIN**. Jinke paas nahi hai, wo Maharashtra me registration lenge, aur Beautinique seller onboarding me iski **step-by-step guide aur checklist** dega (§7.1). | 2026-10-18  |
| Expansion design       | **Naya district ya state jodna ekdum simple hona chahiye:** sirf admin setting aur operations ka kaam (warehouse ya hub, delivery partners, GST registration). Na code change, na deploy (§7.2).                                                                                                                                                                                                                         | 2026-10-18  |
| Customers              | Launch pe **sirf 18+**. Sign-up pe age declaration lenge.                                                                                                                                                                                                                                                                                                                                                                | 2026-10-18  |
| Reviews                | Ratings aur reviews **pehli release me** honge.                                                                                                                                                                                                                                                                                                                                                                          | 2026-10-18  |
| Foreign investment     | **Koi plan nahi.** Apna brand isi company me rahega.                                                                                                                                                                                                                                                                                                                                                                     | 2026-10-18  |
| Apps                   | **11 apps, har main role ka ek.** Super Admin ka bhi alag app hoga. Chhote kaam app ke andar **sub-roles** (permissions) honge.                                                                                                                                                                                                                                                                                          | 2026-10-18  |
| Roles ka timing        | **Saare roles launch se hi system me honge.** Kuch bhi "baad me" ke liye nahi chhoda gaya. Shuru me ek insaan kai roles sambhal sakta hai.                                                                                                                                                                                                                                                                               | 2026-10-18  |
| Docs ki language       | Saari planning `.md` files **Hinglish** me likhi jayengi.                                                                                                                                                                                                                                                                                                                                                                | 2026-10-18  |
| Project ka type        | **Education + portfolio project**, dummy brand, bechne ke liye nahi. Lekin banana **asli production-grade** tareeke se hai. Kanooni cheezein dummy data ke saath system me banengi (§7.1).                                                                                                                                                                                                                               | 2026-10-18  |
| Market aur tax         | **Sirf India, prices INR me.** Har order ka **GST-compliant invoice**.                                                                                                                                                                                                                                                                                                                                                   | 2026-10-18  |
| App language           | **Sirf English** (INR aur dates `en-IN` me).                                                                                                                                                                                                                                                                                                                                                                             | 2026-10-20  |
| OTP aur messages       | **Mobile pe koi message nahi:** na SMS, na WhatsApp (na login OTP, na delivery OTP, na order updates). Har OTP sirf email se (Brevo); notifications in-app, email aur browser push se. Phone number sirf contact ke liye hai (rider ya support call kar sake: masked call ya `tel:` link); kabhi verify nahi hota aur us pe koi message nahi jata. **Frozen.** | 2026-10-20  |
| Platform type          | **Fully responsive web apps** (mobile, tablet, desktop). Delivery app mobile-first PWA hoga, jo phone pe install ho sake aur kamzor network me bhi chale. Native mobile apps abhi scope me nahi.                                                                                                                                                                                                                         | 2026-10-18  |
| Pune pehle din         | **Poora Pune district:** Pune shehar, Pimpri-Chinchwad aur saare gaon wale talukas. Phir bhi kisi bhi area ko kabhi bhi on/off karne ka switch rahega (§7.2).                                                                                                                                                                                                                                                            | 2026-10-18  |
| Agla district ya state | Notify-me waitlist se suggestion milega, **lekin Master kisi bhi district ya state ko seedha bhi khol sakta hai**. Koi fixed order nahi. **Shart:** us area ki **team ready honi chahiye**; go-live checklist poori hue bina wo live nahi hoga (§7.2).                                                                                                                                                                   | 2026-10-18  |
| Pune network           | **Warehouse: Chakan MIDC.** 8 city hubs aur har taluka me 1 hub, total 21 hubs (dummy, §7.5).                                                                                                                                                                                                                                                                                                                            | 2026-10-18  |
| Stock transport        | Warehouse aur hubs ke beech bulk stock **kiraye ke trucks** le ja sakte hain. Customer parcels sirf hamare delivery partners le jayenge. Brands stock bhejne aur returned stock wapas le jaane ke liye apna transport ya courier use kar sakte hain.                                                                                                                                                                     | 2026-10-18  |
| Drug items             | **Drug-classified items kabhi nahi bechenge** (jaise minoxidil, medicated creams). Isliye drug licence ya pharmacist ki zaroorat nahi.                                                                                                                                                                                                                                                                                   | 2026-10-18  |
| Head of Operations     | **Haan.** Support, Logistics aur Seller Ops ke upar ek Head of Operations hoga (§3.2, Master app).                                                                                                                                                                                                                                                                                                                       | 2026-10-18  |
| Plastic EPR            | Maan ke chalenge ki Beautinique micro ya small enterprise **nahi** hai, isliye EPR lagu (dummy registration).                                                                                                                                                                                                                                                                                                            | 2026-10-18  |

## 3. Users aur roles

### 3.1 Roles kaise kaam karte hain

- **Main role:** iska apna alag app hota hai (§4).
- **Sub-role:** kisi app ke andar permissions ka ek set. Ek insaan kai sub-roles le sakta hai.
- **Sab launch pe:** har role pehle din se system me hoga. Jahan likha hai "shuru me X sambhalega", wahan role system me hai, bas shuru me X wo kaam karega. Baad me us kaam ke liye alag insaan aa jayega.
- **Scope:** har permission batati hai ki wo kahan lagu hogi: self, brand, state, category, city, warehouse, hub ya global.

### 3.2 Har app ke roles

#### 1. Customer (external)

| Role                | Kaam                                                                                                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Customer** (main) | Products dekhta hai, virtual try-on karta hai, kharidta hai, order track karta hai, return ya exchange karta hai aur review likhta hai. Email OTP se login karta hai (Google bhi), aur uski beauty aur shade profile hoti hai. Sirf 18+.                     |
| Beauty Pro Buyer    | Verified beauty professional: salon, spa, makeup artist, beautician, clinic, freelancer, home-based ya individual professional. Inhe pro prices aur pro pack sizes milte hain. GSTIN ho to GST invoice bhi. State Admin inhe approve karta hai. |

#### 2. Seller (external, plus Beautinique ki own-brand team)

| Role                            | Kaam                                                                                                                                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Seller Account Owner** (main) | Brand ke seller account ka maalik. KYC, verified brands aur unke rights ka proof (trademark ya brand authorisation), seller agreement, team logins, bank account aur payouts. Jis state ke warehouse me stock rahega, us state ka GSTIN bhi deta hai. |
| Seller Grievance Officer        | Har bahar ke seller ke liye kanoon se zaroori. Support se aayi product complaints: 48 ghante me acknowledge, 1 mahine me solve. Owner khud bhi ye ban sakta hai. Apne brand ki complaints Beautinique ka platform Grievance Officer dekhega.          |
| **Own-Brand Manager**           | House-brand account ka owner. Apna brand chalata hai: catalog, shade ranges, MRP aur selling price, launches aur restock plan. Apni listings khud approve nahi kar sakta.                                                                             |
| Own-Brand QA & Batch Release    | Apne brand ke label artwork pe sign-off, manufacturer ka licence file me rakhna, har batch ko bechne ke liye release karna, aur apne brand ke recall tasks. Plastic packaging EPR me Legal ki madad karta hai.                                        |
| Seller Dispatch & Inventory     | Beautinique warehouse ko stock bhejta hai: shipment notice (batch aur expiry ke saath), inbound slot booking aur receiving ke disputes. Shuru me owner khud karega.                                                                                   |
| Seller Catalog Manager          | Listings banata aur badalta hai: shades, sizes, ingredients, MRP, try-on category. Har change QC me jayega. Shuru me owner khud karega.                                                                                                               |
| Seller Finance                  | Settlements, commission invoices aur TCS/TDS statements sirf dekh sakta hai. Payout dispute raise kar sakta hai, bank details nahi badal sakta.                                                                                                       |
| Seller Compliance & Quality     | Licences, registrations aur label artwork upload aur renew karta hai, aur brand ke recall tasks karta hai.                                                                                                                                            |
| Seller Marketing & Promotions   | Brand store page, brand ke apne coupons (MRP se upar kabhi nahi), review replies aur product Q&A. Shuru me owner khud karega.                                                                                                                         |
| Seller API Integration          | API keys, taaki bade brand ka ERP ya order system stock aur orders sync kar sake.                                                                                                                                                                     |

#### 3. Admin (internal: state-wise marketplace operations)

| Role                                     | Kaam                                                                                                                                                                                                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **State Admin** (main)                   | Apne assigned states ke sellers approve karta hai. GSTIN (warehouse wale state ka bhi), PAN, bank account, address aur brand rights check karta hai, distributor authorisation bhi. Pro Buyer applications bhi yahi approve karta hai. Product approval ab Catalog QC karega. |
| Catalog QC & Listing Approver            | Har listing category-wise check karta hai: sirf beauty, sahi category, asli images, price MRP ke barabar ya kam, product page pe saare zaroori declarations, aur koi drug jaisa claim nahi.                                                                                   |
| Cosmetics Regulatory & Product Safety    | Cosmetics ka import registration ya manufacturing licence aur labels check karta hai, aur drug items ko bahar rakhta hai. Har recall aur har skin-reaction case ka owner. Shuru me external consultant ho sakta hai. Legal & Compliance Officer ko report karta hai.          |
| Try-on & Shade Specialist                | Indian skin tones ke hisaab se shade data aur try-on settings approve karta hai. Returns me jo shades galat nikle, unhe theek karta hai.                                                                                                                                      |
| Seller Integrity & Brand Protection      | Distributor authorisation ki chain check karta hai. Nakli products aur IP complaints, test buys aur takedowns sambhalta hai. Sellers ko warning ya suspension deta hai.                                                                                                       |
| Seller Operations Lead                   | Onboarding aur QC team chalata hai: queues, SLAs aur suspension appeals. Shuru me Head of Operations sambhalega.                                                                                                                                                              |
| Category Manager                         | Ek beauty category ka owner: assortment, brand mix, category tree aur attributes, aur category KPIs. Category banana aur badalna isi ka kaam hai.                                                                                                                             |
| Brand Partnerships / Key Account Manager | Naye brands laata hai aur unse relationship sambhalta hai. Doosre state ke brands ko Maharashtra (ya warehouse wale state) ke GST registration ki guide aur checklist me madad karta hai. Approve karne ka koi right nahi.                                                    |
| Catalog Content Executive                | Brands ki taraf se listings behtar banata hai. Har edit QC me jata hai.                                                                                                                                                                                                       |
| Fraud & Risk Analyst                     | Return aur coupon abuse, payment fraud aur chargebacks, fake orders aur fake reviews. Automated rules ke saath kaam karta hai.                                                                                                                                                |
| Trust & Safety Lead                      | Risk rules approve karta hai, customer ban appeals decide karta hai, aur fraud analysts ko manage karta hai. Shuru me Master sambhalega.                                                                                                                                      |

#### 4. Super Admin (internal: national oversight)

| Role                   | Kaam                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Super Admin** (main) | National backup aur appeals. Jin states me admin available nahi hai, wahan ke seller applications SLA ke baad uthata hai. State Admin ya Catalog QC ke rejection ke khilaaf appeals decide karta hai, aur hamesha reject karne wale se alag insaan hota hai. Poore India ke brand documents approve karta hai aur global takedowns chalata hai. States assign nahi kar sakta, admins nahi bana sakta. |
| Review & UGC Moderator | Reviews, Q&A aur customer photos moderate karta hai, chahe review positive ho ya negative. Incentivised reviews pe label lagata hai. Content hide karta hai, jo reversible aur logged hota hai. Intimate ya impersonation content IT Rules ki time limit ke andar hatata hai (§7.1). Shuru me Super Admin sambhalega.                                                                                 |

#### 5. Master (internal: owner aur governance)

| Role                                           | Kaam                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Master** (main)                              | Owner. 1–2 seats, MFA zaroori. Super Admins, Admins aur har internal app ka head banata hai, aur states assign karta hai. Fees, commission, bade payouts, bade coupons aur policies pe second signature deta hai. Emergency switches iske paas hain (onboarding rokna, kisi area me orders rokna, account freeze karna), aur ye saare apps ka ek audit log padhta hai. **Master seller ya product approval bypass nahi kar sakta, aur sirf Master app me login karta hai** (§3.6). |
| Head of Operations                             | Support, Logistics aur Seller Ops teeno ka head. Teeno ke KPIs aur SLAs ka dashboard, bade escalations, aur Support Lead, Logistics Head aur Seller Operations Lead ki reporting. Master ko report karta hai.                                                                                                                                                                                                                                                                      |
| Legal & Compliance Officer (Nodal Person)      | Policies, seller agreement, court aur government orders, takedowns, yearly dark-pattern self-audit, aur plastic packaging EPR. Shuru me owner aur ek external lawyer sambhalenge.                                                                                                                                                                                                                                                                                                  |
| Marketplace Fairness & Price-Integrity Analyst | Check karta hai ki sponsored slots pe label ho, discount ke saath sahi prior price dikhe, aur apne brand ko baaki brands se alag treatment na mile. Shuru me Legal officer sambhalega.                                                                                                                                                                                                                                                                                             |
| Data Protection Officer (DPDP contact)         | Privacy notices aur consent (try-on camera ka bhi), data export aur erasure, aur breach reporting.                                                                                                                                                                                                                                                                                                                                                                                 |
| Security Officer (CERT-In contact)             | Har internal user ke liye MFA, access reviews, CERT-In ko incident report, clock sync aur logs (§7.1). Shuru me lead developer sambhalega.                                                                                                                                                                                                                                                                                                                                         |
| Internal Auditor                               | Approvals, refunds aur payouts ka read-only audit karta hai, aur board ko report karta hai.                                                                                                                                                                                                                                                                                                                                                                                        |

#### 6. Support Desk (internal)

| Role                                   | Kaam                                                                                                                                                                                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Customer Support Agent (L1)** (main) | Order ke sawaal, dispatch se pehle cancellation, policy ke hisaab se returns aur exchanges, aur ek cap ke andar chhote refunds aur goodwill coupons.                                                                                                     |
| Grievance Officer                      | Kanoon se zaroori. Naam aur contact storefront pe publish hoga. Consumer complaints: ticket number ke saath 48 ghante me acknowledge, 1 mahine me solve. User content ki complaints IT Rules ki time limit me (§7.1). Grievance register bhi rakhta hai. |
| Production Support Engineer (L3)       | System faults theek karta hai, jaise paisa kat gaya par order nahi bana, ya order atak gaya. Sirf audited repair actions se. Shuru me lead developer sambhalega.                                                                                         |
| Customer Support Specialist (L2)       | Bade refunds, replacements, account recovery, aur skin-reaction cases log karna. Shuru me L1 agents hi karenge.                                                                                                                                          |
| Support Lead                           | Queues, SLAs, refund caps, playbooks, aur returns aur exchange policy ki settings (Legal ke sign-off ke saath). Shuru me Head of Operations aur Grievance Officer sambhalenge.                                                                           |
| Seller Support Agent                   | Seller tickets: onboarding, rejections, inbound stock, settlements. Kuch approve nahi kar sakta.                                                                                                                                                         |
| BPO Supervisor                         | Sirf apne outsourced vendor ke agents manage karta hai.                                                                                                                                                                                                  |
| Beauty Advisor                         | Kharidne se pehle customers ko chat ya video pe shade aur routine chunne me madad karta hai.                                                                                                                                                             |
| Skin & Hair Expert                     | Registered dermatologist ya trichologist, teleconsultation ke liye.                                                                                                                                                                                      |

#### 7. Finance (internal)

| Role                             | Kaam                                                                                                                                                                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Finance Manager** (main)       | Har paise ka flow. Commission aur customer fees set karta hai (Master ke second signature ke saath). Payouts aur cap se bade refunds approve karta hai, reconciliation aur books sambhalta hai, aur apne brand ki sales ko commission income se alag rakhta hai. HR aur payroll ki labour registrations bhi (§7.1). |
| Tax & Statutory Compliance       | GST TCS aur GSTR-8, bahar ke sellers ki gross sales pe TDS, delivery partners ke payouts pe TDS, apne brand ke GST returns, e-invoicing, e-way bills, gig-worker aggregator contribution aur state welfare fees. Aksar external CA hota hai.                                                                        |
| Procurement & Accounts Payable   | Apne brand ke manufacturers aur packaging vendors ko purchase orders bhejta hai. PO, receipt aur invoice match karta hai, phir approval ke baad payment karta hai. Shuru me Finance Manager sambhalega.                                                                                                             |
| Payouts Executive                | Sellers, delivery partners aur creators ke payouts banata hai. Shuru me Finance Manager sambhalega (bade batch pe Master ka second signature).                                                                                                                                                                      |
| Payments & Refund Reconciliation | Roz payments, orders aur Razorpay settlements match karta hai (UPI on delivery bhi), refunds track karta hai aur chargebacks sambhalta hai. Shuru me Finance Manager sambhalega.                                                                                                                                    |

#### 8. Logistics Ops (internal)

| Role                                     | Kaam                                                                                                                                                                                                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supply Chain & Logistics Head** (main) | Warehouses aur hubs ka owner. Delivery promise, order allocation, payment-on-delivery ke rules, aur Warehouse aur Hub Managers ki appointment. Shuru me owner khud sambhal sakta hai.                                                                                  |
| Network & Serviceability Planner         | State, district aur pincode master sambhalta hai: kya served hai, kaunsa hub hai, kitne din me delivery hogi. Ola Maps pe zones banata hai. **App se naye districts aur pincodes chalu karta hai** (§7.2). Notify-me waitlist dekh ke agla district suggest karta hai. |
| Warehouse Manager                        | Ek warehouse chalata hai: staff, perfume, aerosol aur nail polish jaisi cheezon ke liye safe storage, dispatch SLA, aur site ke licences.                                                                                                                              |
| Inbound & GRN Executive                  | Apne brand aur baaki brands ka stock receive karta hai. Batch, manufacturing date aur expiry record karta hai, aur kharab lots ko quarantine me daalta hai.                                                                                                            |
| Inventory Controller                     | Stock counting, expiry-first picking, near-expiry stock block karna, recall tasks, aur kaunsa stock kis brand ka hai ye track karna.                                                                                                                                   |
| Fulfilment Associate (Picker/Packer)     | Scan-to-pick, taaki galat shade pick hi na ho. Order pe batch record karta hai, leak-proof packing karta hai, aur invoice aur label print karta hai.                                                                                                                   |
| Hub Manager                              | Ek delivery hub chalata hai: riders, routes, reattempts aur returns to origin.                                                                                                                                                                                         |
| Hub Operations Executive                 | Parcels ko rider bags me sort karta hai aur har handover scan karta hai.                                                                                                                                                                                               |
| Returns QC Inspector                     | Har return Beautinique site pe grade karta hai: seal, shade, expiry, batch match. Phir refund release ya hold karta hai.                                                                                                                                               |
| Rider Onboarding & Compliance            | Rider KYC, driving licence, apni gaadi ka RC aur insurance (expiry reminders ke saath), police verification, training aur gig-worker registration. Shuru me Hub Manager sambhalega.                                                                                    |
| Delivery Partner Support & Grievance     | Rider tickets, deactivation appeals aur accidents. Jin states ke gig-worker kanoon grievance process maangte hain, wahan wo process chalata hai. Shuru me Hub Manager sambhalega.                                                                                      |
| Line-haul & Stock Transfer               | Warehouse aur hubs ke beech bulk stock le jaata hai, stock-transfer documents aur e-way bills ke saath. Shuru me Logistics Head sambhalega.                                                                                                                            |
| Demand & Inventory Planner               | SKU aur shade ke hisaab se forecast karta hai, aur reorder points set karta hai.                                                                                                                                                                                       |
| Returns-to-Vendor & Liquidation          | Na bikne wala stock brands ko wapas bhejta hai, near-expiry stock bechta hai, aur expired stock destroy karta hai. Shuru me Warehouse Manager sambhalega.                                                                                                              |
| City Logistics Manager                   | Ek shehar ke saare hubs dekhta hai.                                                                                                                                                                                                                                    |
| Logistics Control Tower                  | Atke hue orders aur parcels pe nazar rakhta hai, aur delivery disputes decide karta hai. Shuru me Hub Manager sambhalega.                                                                                                                                              |
| Loss Prevention                          | Chori, fake deliveries aur badle hue returns. Shuru me Hub aur Warehouse Managers sambhalenge.                                                                                                                                                                         |
| Regional Logistics Head                  | Kai states ko dekhta hai. Shuru me Logistics Head sambhalega.                                                                                                                                                                                                          |

#### 9. Delivery (internal, phone app)

| Role                        | Kaam                                                                                                                                                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Delivery Partner** (main) | Gig partner, apni gaadi pe. Hub se customer tak OTP ke saath delivery karta hai, photo aur geo-tag proof ke saath. Payment on delivery sirf UPI QR se. Return pickup karta hai (doorstep pe seal, shade aur batch check ke saath), exchange ek hi trip me, aur app me SOS button. |
| Rider Team Lead             | Senior rider jo lagbhag 15–25 riders ki squad dekhta hai.                                                                                                                                                                                                                         |

#### 10. Growth Studio (internal)

| Role                                     | Kaam                                                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Marketing Head** (main)                | Growth budgets, marketing calendar aur ad compliance (ASCI). Shuru me Master sambhalega.                                           |
| Storefront Merchandiser                  | Banners, collections aur search synonyms. Prices, MRP ya coupons nahi badal sakta.                                                 |
| Promotions & Coupon Manager              | Coupons aur offers, budget caps ke saath. Cap se upar ke liye Marketing Head ya Master ki approval chahiye. Koi fake urgency nahi. |
| CRM & Lifecycle Manager                  | Welcome, abandoned-cart, back-in-stock aur win-back journeys, hamesha consent ke andar.                                            |
| Loyalty & Rewards Manager                | Points, tiers, referrals aur gift cards.                                                                                           |
| Content Editor                           | Beauty magazine, tutorials aur SEO pages.                                                                                          |
| Creator & Affiliate Partnerships Manager | Creators approve karta hai, commission set karta hai, aur disclosure labels check karta hai.                                       |
| Pro & B2B Programme Manager              | Pro Buyer ke rules, pro prices, bulk orders aur corporate gifting.                                                                 |
| Retail Media Manager                     | Sponsored ads.                                                                                                                     |
| City Growth Manager                      | Ek shehar ka growth ka kaam.                                                                                                       |

#### 11. Creator (external)

| Role                            | Kaam                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Creator / Influencer** (main) | Personal storefront, looks, tutorials, tracked links aur codes. Commission return window ke baad milta hai. |
| Affiliate Partner               | Sirf links aur codes (publishers aur coupon sites).                                                         |
| Creator Agency Manager          | Apne creators ki taraf se kaam karta hai, har creator ki consent ke saath.                                  |

### 3.3 Kaun kisko report karta hai

```
Founders / Board (platform ke bahar)
├── Internal Auditor (Master app, read-only)
└── Master
    ├── Governance: Legal & Compliance Officer → Fairness Analyst, DPO,
    │               Cosmetics Regulatory (Legal hire hone tak Master ko; dotted: Own-Brand QA, Seller Compliance)
    │               Security Officer
    ├── Engineering lead (login nahi) → Production Support Engineer (L3)
    ├── Head of Operations → Seller Operations Lead (Admin), Support Lead (Support Desk), Logistics Head (Logistics Ops)
    ├── Super Admin → Review & UGC Moderator
    │     (Admin app se escalations aur appeals leta hai)
    ├── Admin: Seller Operations Lead (Head of Operations ko report karta hai)
    │            → State Admins, Catalog QC, Try-on & Shade, Catalog Content, Brand Protection
    │          Category Managers, Brand Partnerships
    │          Trust & Safety Lead (shuru me Master) → Fraud & Risk
    ├── Support Desk: Grievance Officer
    │                 Support Lead → L1, L2, Seller Support, BPO Supervisor, Beauty Advisor, Skin & Hair Expert
    ├── Finance: Finance Manager → Tax, Procurement, Payouts, Reconciliation
    ├── Logistics Ops: Logistics Head → Network Planner, Demand Planner, Control Tower, Loss Prevention,
    │                                   Line-haul, Returns-to-Vendor, Delivery Partner Support
    │                    → Regional Logistics Heads
    │                        → Warehouse Managers → GRN, Inventory, Pickers/Packers, Returns QC
    │                        → City Managers → Hub Managers → Hub Ops, Rider Onboarding
    │                                            → Rider Team Leads → Delivery Partners
    ├── Growth Studio: Marketing Head (shuru me Master) → Merchandiser, Promotions, CRM, Loyalty, Content,
    │                  Pro & B2B, Retail Media, City Growth, Creator & Affiliate Manager → Creators
    └── Seller app (house brand): Own-Brand Manager → Own-Brand QA, own-brand staff

External accounts: Seller Account Owners (State Admin approve karta hai; unke staff: Seller Grievance Officer, Dispatch & Inventory, Catalog, Finance, Compliance, Marketing, API Integration), Customers (Beauty Pro Buyers bhi), Creators, Affiliate Partners aur Creator Agency Managers.
```

### 3.4 Kaam jinke liye platform login nahi chahiye

HR aur payroll, statutory auditor, company secretary, external lawyer, developers (sirf L3 support login hoga), data analyst (masked data pe BI tool use karega), social media, performance marketing, photo aur swatch studio, apne brand ki R&D team, warehouse ke loaders aur guards, aur fire safety officer.

### 3.5 §2 ke decisions ki wajah se jo roles nahi chahiye

| Role                                   | Kyun nahi chahiye                                                          |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Hub Cash Officer                       | Cash nahi lenge.                                                           |
| Fleet Manager                          | Delivery partners apni gaadi chalayenge.                                   |
| Parent / Guardian                      | Sirf 18+ customers. Agar kabhi teen accounts allow hue to dobara sochenge. |
| Brands se first-mile pickup            | Saara stock Beautinique warehouse me rahega.                               |
| Third-party courier ya delivery agency | Customer delivery sirf Beautinique karega.                                 |

### 3.6 Aaj ke code me kya badlega

| Aaj               | Badlav                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `USER`            | **Customer** banega: email OTP login, beauty aur shade profile, 18+ age declaration.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `SELLER`          | Aaj ek seller ka sirf ek login hai (`Seller.user` unique hai). Iski jagah **seller organisation** banegi, jisme owner aur staff ke alag logins honge. Aaj `businessDetails.gstin` me ek hi GSTIN aata hai. Ab har us state ka GSTIN hoga jahan stock rakha hai. Brands verified records banenge, aur listings unhi me se chunengi. Aaj ka free-text `Product.brand` hat jayega.                                                                                                                                                                                                                                                                                                                         |
| `SELLER_TYPES`    | Aaj ki 15 values ki list me teen alag cheezein mili hui hain: kaun bech sakta hai (Brand, Wholesale Distributor), business ka legal form (Sole Proprietorship, Partnership, LLP, Private Limited Company, Public Limited Company), aur buyer-type ya vague types (Clinic, Salon, Spa, Freelance Seller, Home-based Seller, Individual, Retail Store, Small Business). Ise do hisson me todna hai: **eligibility** (brand owner, ya brand ki authorisation wala distributor) aur **legal form**. Clinic, Salon, Spa, Freelance Seller, Home-based Seller aur Individual Pro Buyer path pe jayenge. Retail Store aur Small Business hat jayenge; wo tabhi bech sakte hain jab authorised distributor hon. |
| `ADMIN`           | **State Admin** banega (assigned states ke sellers ka KYC aur approval). Product approval Catalog QC ke paas jayega. Category banana, badalna aur hatana (aaj ADMIN aur MASTER karte hain) Category Manager ke paas jayega. Contact-us inbox (aaj ADMIN aur MASTER dekhte hain) Support Desk me jayega.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `SUPER_ADMIN`     | Aaj Admin app me checkbox laga ke login karta hai. Ab **iska apna Super Admin app** hoga.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `MASTER`          | **Jo rahega:** states assign karna, aur Admins aur Super Admins ko banana, suspend karna aur demote karna. **Jo hatega:** seller aur product approval ka full override (`authorizeSellerOwnership` / `authorizeProductOwnership` ka bypass), aur login-role bypass jisse Master kisi bhi app me login kar leta hai. Approvals, apne brand ki listings bhi, State Admin, Catalog QC aur Super Admin appeals se hi jayengi. **Jo judega:** har app head banana, second signatures, emergency switches, aur saare apps ka ek audit log.                                                                                                                                                                    |
| Seller onboarding | Aaj seller ka onboarding wizard Customer app (BQ-Client) ke profile me "become-seller" page pe hai. Ab ye **Seller app** me jayega. Customer app me sirf "Sell on Beautinique" ka link rahega.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Naya              | §3.2 ke baaki saare roles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## 4. Platforms

| #   | App           | Main role                     | Users                     | Status                       |
| --- | ------------- | ----------------------------- | ------------------------- | ---------------------------- |
| 1   | Customer      | Customer                      | External                  | Hai (aaj ka repo: BQ-Client) |
| 2   | Seller        | Seller Account Owner          | External + own-brand team | Hai (BQ-Seller)              |
| 3   | Admin         | State Admin                   | Internal                  | Hai (BQ-Admin)               |
| 4   | Super Admin   | Super Admin                   | Internal                  | **Naya** (BQ-Admin se alag)  |
| 5   | Master        | Master                        | Internal                  | Hai (BQ-Master)              |
| 6   | Support Desk  | Customer Support Agent        | Internal                  | **Naya**                     |
| 7   | Finance       | Finance Manager               | Internal                  | **Naya**                     |
| 8   | Logistics Ops | Supply Chain & Logistics Head | Internal                  | **Naya**                     |
| 9   | Delivery      | Delivery Partner              | Internal (phone)          | **Naya**                     |
| 10  | Growth Studio | Marketing Head                | Internal                  | **Naya**                     |
| 11  | Creator       | Creator / Influencer          | External                  | **Naya**                     |

Notes:

- **Saare 11 apps launch pe banenge:** 4 pehle se hain, 7 naye banenge.
- **Review screens** (seller applications, listing review, appeals aur takedowns) ek shared package module honge. Wo Admin aur Super Admin dono apps me lagenge, taaki Super Admin app me ye screens dobara na likhni padein.
- Har app ek hi common login aur permissions system use karega, taaki naye sub-roles sirf data se ban sakein.
- Saare apps **fully responsive** hain aur English me chalenge (§7.4).

## 5. Features

Saare features **launch pe** honge. Pehle wo features jo saare apps me common hain, phir har app ke apne.

### 5.0 Saare apps me common

- **Login aur security:** customers aur delivery partners ke liye email OTP (mobile pe OTP kabhi nahi); internal staff ke liye email, password aur MFA; apne devices ke sessions dekhna aur logout karna.
- **Roles aur permissions:** ek common RBAC system, scope ke saath (self, brand, state, category, city, warehouse, hub, global). Naye sub-roles sirf data se ban sakein.
- **Audit log:** har zaroori action ka record (kisne, kab, kya, kahan se). Saare apps ka ek hi log.
- **Notifications:** in-app, email (Brevo) aur browser push. User har channel ki consent khud set kare. SMS aur WhatsApp channel nahi hain, aur OTP sirf email se.
- **Theme:** light aur dark.
- **Fully responsive** aur accessible (keyboard, screen reader, colour contrast).
- **Online/offline status**, error pages, loading states, aur Sentry error tracking.
- **Search, filters, sort, pagination** aur CSV export, jahan bhi list hai.
- **Help aur support** ka link har app me.

### 5.1 Customer app

- **Discovery:** home page (banners, collections, offers), categories (Skin, Makeup, Hair, Fragrance, Bath & Body, Men's Grooming), brand pages, creator storefronts, beauty magazine aur tutorials.
- **Search:** autosuggest, synonyms (jaise kajal = kohl), typo tolerance, recent searches.
- **Filters:** brand, price, shade, skin type, concern, finish, ingredients, vegan/cruelty-free, rating, aur country of origin (kanoon ke hisaab se).
- **Product page:** shade aur size variants, swatches, **virtual try-on**, shade finder, INCI ingredients, how to use. Saari legal declarations: MRP, net quantity, manufacturing aur expiry date, country of origin, manufacturer ya importer, customer care. Seller ki details aur grievance officer, ratings, photo reviews aur Q&A, pincode check aur delivery date, notify-me (stock ya area na ho to), related products, share, wishlist.
- **Cart aur checkout:** cart, save for later, coupons, free samples aur gifts, address book (Ola Maps pin aur pincode check), poora price breakdown pehle se (koi hidden charge nahi). Payment Razorpay se (UPI, cards, netbanking, wallets) ya delivery pe UPI QR. Pro Buyer ke liye GSTIN wala invoice.
- **Orders:** live tracking (rider kahan hai), dispatch se pehle cancel, delivery OTP (app aur email me dikhta hai, SMS se nahi), GST invoice download, return ya exchange request photo ke saath (leak, melted, galat shade, near-expiry, damaged, missing), refund status, reorder.
- **Account:** email OTP login, 18+ declaration, profile, beauty aur shade profile, addresses, wishlist, notification preferences, aur apna data download ya delete karna (DPDP).
- **Loyalty aur rewards:** points, tiers, referrals, birthday perks, gift cards aur store credit.
- **Expert help:** Beauty Advisor se chat ya video, aur Skin & Hair Expert ka teleconsultation booking.
- **Pro Buyer:** application, verification status, pro prices, pro pack sizes, aur bulk ya corporate gifting quote request.
- **Support:** help centre, support chat, ticket, Grievance Officer page aur complaint (ticket number ke saath), aur saari policy pages (T&C, privacy, returns, shipping, ranking parameters, sponsored labels).
- **Sell on Beautinique:** Seller app ka link.

### 5.2 Seller app

- **Onboarding:** brand owner ya authorised distributor ka wizard. PAN, warehouse-state GSTIN (Maharashtra GST registration ki step-by-step guide aur checklist ke saath), bank account penny-drop, trademark ya brand authorisation, seller agreement e-sign, Seller Grievance Officer details, Udyam number. Status aur rejection reasons.
- **Team:** staff invite, sub-roles, aur unke actions ka audit.
- **Brands:** verified brand registry, documents aur unke expiry reminders.
- **Catalog:** listing banana aur badalna (shades hex aur swatch ke saath, sizes, INCI, MRP, declarations, try-on category, images), CSV se bulk upload, QC status aur feedback, aur product ke regulatory documents. Jis product ka kabhi order hua, wo delete nahi hota, archive hota hai (storefront se hat jata hai, par order history aur returns ke liye details aur images rehti hain).
- **Stock aur inbound:** Beautinique warehouse me apna stock (SKU, batch, expiry), shipment notice (ASN), inbound slot booking, GRN differences pe dispute, near-expiry alerts, aur returns-to-vendor requests.
- **Orders aur returns:** apne products ke orders (Beautinique fulfil karta hai), returns aur unke QC results.
- **Finance:** settlements, commission invoices, TCS/TDS statements, payout disputes, aur bank account (sirf owner).
- **Marketing:** brand store page, brand-funded coupons, sale events me opt-in, review replies, Q&A answers, sponsored ads.
- **Compliance:** licences aur registrations ka upload aur renewal reminders, recall tasks, aur complaints inbox (48 ghante / 1 mahina ke timers ke saath).
- **Analytics:** sales, return reasons, ratings, stock health.
- **API keys:** ERP ya order system se sync ke liye.
- **House-brand mode (Own-Brand Manager):** restock plan jo Finance me purchase order banta hai, batch release (Own-Brand QA), aur payout ki jagah margin view.

### 5.3 Admin app

- **Seller applications** (state-wise): KYC checks (GSTIN ka state, PAN, penny-drop name match, brand rights, distributor authorisation). Approve, reject (reason library se) ya changes maangna. "My Queue" aur backup admin ka covering badge.
- **Pro Buyer applications.**
- **Catalog QC** (category-wise): checklist, approve, reject, send back, unpublish, duplicate (EAN) check, MRP check.
- **Regulatory:** licence aur registration check, drug items block, batch block, aur recall aur skin-reaction cases.
- **Shade aur try-on review.**
- **Brand protection:** brand registry, IP aur counterfeit complaints, test buys, takedowns, seller warnings aur suspensions, seller health score.
- **Categories aur attributes** (Category Manager).
- **Brand partnerships:** naye brands ki pipeline, invite links, onboarding me madad.
- **Fraud & risk:** rules, flagged orders aur accounts, blocks, payout hold requests.
- **Shared review screens**, jo Super Admin app me bhi lagte hain (§4).

### 5.4 Super Admin app

- **National backlog:** jin states me admin available nahi hai, unke items SLA ke baad yahan aate hain.
- **Appeals:** State Admin ya Catalog QC ke rejection ke khilaaf appeals. Jisne reject kiya tha, wo appeal decide nahi kar sakta.
- **Nationwide brand documents** approve karna.
- **Global takedowns:** court ya government orders, IT Rules ki time limits ke timers ke saath.
- **Review & UGC moderation:** queue, hide/unhide, incentivised labels, aur intimate ya impersonation content ke liye fast lane.
- **Admin performance:** har state ka SLA aur backlog.

### 5.5 Master app

- **Staff:** Super Admins, Admins, Head of Operations aur har app head banana; states assign karna; demote, suspend aur freeze karna.
- **Second signatures:** fees aur commission, bade payouts, cap se upar coupons, policy publishing, naya state kholna.
- **Emergency switches:** onboarding rokna, kisi area me orders rokna, kisi area me UPI on delivery band karna, account freeze karna.
- **Audit log** (saare apps ka) aur **territory map**.
- **Governance:** Legal (policy versions, takedown orders register, dark-pattern self-audit), Fairness (sponsored labels aur prior price ka audit), DPO (consent records, data requests queue, breach register), Security (MFA, access reviews, sessions, CERT-In incident register), Internal Auditor (read-only).
- **Head of Operations dashboard:** Support, Logistics aur Seller Ops ke KPIs aur SLAs, aur bade escalations.
- **Company dashboard:** GMV, orders, customers, sellers, returns.

### 5.6 Support Desk app

- **Ticket inbox:** chat, email aur phone ke tickets, customers aur sellers dono ke. SLA timers, macros aur playbooks.
- **Order actions:** order dekhna, dispatch se pehle cancel, reschedule, return ya exchange shuru karna, invoice dobara bhejna, aur cap ke andar refund aur goodwill coupon (L1 aur L2 ke alag caps).
- **Escalation:** L1 → L2 → Grievance Officer.
- **Grievance register:** ticket number, 48 ghante / 1 mahina ke timers, recorded complaint ki copy, monthly report.
- **Content complaints:** IT Rules wali complaints moderator ko route karna, unke timers ke saath.
- **Contact-us inbox** (Admin app se yahan shift).
- **BPO vendors:** har vendor ke agents aur unki queues.
- **Beauty Advisor console:** chat aur video, look aur cart links.
- **Skin & Hair Expert:** teleconsultation aur notes (restricted).
- **L3 repair actions:** sirf whitelisted aur audited actions.
- **CSAT** aur reports.

### 5.7 Finance app

- **Fees aur commission:** schedules, maker-checker, aur Master ka second signature.
- **Settlement engine:** order value − commission − fees − TCS − TDS ± returns aur claims.
- **Payouts:** batches aur approval, Razorpay Route linked accounts; sellers, delivery partners aur creators ke liye.
- **Reconciliation:** payments ↔ orders ↔ Razorpay settlements ↔ bank (UPI on delivery bhi), refunds tracking, chargebacks.
- **Books:** apne brand ki sales aur commission income alag; Tally ya Zoho Books export.
- **Procurement:** vendors, purchase orders, PO–GRN–invoice matching, vendor payments.
- **Tax:** TCS register aur GSTR-8 export, TDS (sellers, delivery partners, creators) aur certificates, e-invoices, e-way bills, gig aggregator contribution, labour registrations tracker (sab dummy).
- **Reports:** P&L, payouts, tax.

### 5.8 Logistics Ops app

- **Network:** state, district aur pincode master (served switch), warehouses aur hubs ke records, Ola Maps zones, delivery promise, cut-offs, holidays, go-live checklist, naya district ya state kholna (approvals ke saath), notify-me waitlist analytics.
- **Warehouse:** inbound (ASN, slot booking, GRN pe batch aur expiry scan, quarantine), putaway, inventory (cycle counts, FEFO, near-expiry block, stock ownership), pick aur pack (scan-to-pick, pack photo, invoice aur label print), hubs ko dispatch, returns QC grading, returns-to-vendor, liquidation aur destruction, recall tasks.
- **Line-haul:** warehouse se hubs tak stock transfer, e-way bills, trip tracking.
- **Hubs:** sort aur dispatch (bags, run sheets), rider shifts aur capacity, route assignment, reattempts, return to origin, exceptions, exchange trips.
- **Riders:** onboarding (KYC, licence, RC, insurance aur unke expiry reminders, police verification, training), gig registration (dummy), activate/deactivate, rider support aur grievance tickets, earnings.
- **Control tower:** live map, SLA breaches, atke orders, delivery disputes (OTP, geo-tag aur photo evidence ke saath), SOS alerts.
- **Loss prevention** cases, **demand planning** (forecast, reorder points), aur **reports** (on-time, first attempt, RTO, cost per order).

### 5.9 Delivery app (mobile-first PWA)

- Email OTP login (device binding ke saath), shift check-in aur check-out.
- Aaj ki run sheet, Ola Maps navigation, customer ko masked call.
- Delivery: OTP, photo aur geo-tag proof; UPI QR se payment (Razorpay dynamic QR); failed attempt ka reason.
- Return pickup: doorstep pe seal, shade aur batch check; exchange ek hi trip me.
- Hub handover scans.
- Earnings aur payouts; documents aur unke expiry reminders.
- SOS button aur support tickets.
- Kamzor network me bhi kaam karega (offline queue).
- **Rider Team Lead view:** squad ke live trips, atke shipments reassign karna.

### 5.10 Growth Studio app

- **Merchandising:** banners, collections, homepage layout, search synonyms, A/B tests (prices ke nahi).
- **Promotions:** coupon rules, Beautinique aur brand ka funding split, budget caps aur auto-stop, approvals.
- **CRM:** segments, journeys (welcome, abandoned cart, back-in-stock, price drop, win-back, replenishment), frequency caps, sab consent ke andar.
- **Loyalty:** points, tiers, referrals, gift cards, store credit.
- **Content CMS:** beauty magazine aur tutorials (Quill editor), product embeds ke saath.
- **Creators aur affiliates:** approval, commission, campaigns, content approval, disclosure labels, attribution rules, payout approval.
- **Pro & B2B:** pro price list, pro-only SKUs, bulk quotes, corporate gifting.
- **Retail media:** sponsored ads inventory, labels, billing.
- **City growth:** ek shehar ke campaigns.
- **Marketing calendar** aur **KPIs dashboard**.

### 5.11 Creator app

- Apply (social handles, PAN, bank) aur approval status.
- Profile aur storefront, collections aur looks (try-on presets).
- Tutorials upload, product tags ke saath, aur automatic disclosure label.
- Tracked links aur codes.
- Attribution aur earnings (return window ke baad), payouts, TDS certificates, gift log.
- Live shopping.
- **Affiliate Partner portal:** links, product feed, postbacks.
- **Agency Manager view:** apne creators ka kaam, har creator ki consent ke saath.

## 6. Core flows

Har step ka owner neeche hai. Har flow ka technical step-by-step detail (APIs, events, data) ARCHITECTURE.md me hoga.

| Step                          | Owner                                                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browse, try-on, pincode check | Customer app. Pincode data: Network & Serviceability Planner.                                                                                               |
| Seller apply, KYC, approval   | State Admin. Backlog aur appeals: Super Admin.                                                                                                              |
| Listing, QC, regulatory check | Seller Catalog Manager (shuru me Seller Account Owner) → Catalog QC → Cosmetics Regulatory. Shades: Try-on & Shade Specialist.                              |
| Apne brand ki supply          | Own-Brand Manager (plan) → Procurement (PO) → Inbound & GRN (receive) → Own-Brand QA (batch release).                                                       |
| Brands ka stock andar aana    | Seller (shipment notice) → Inbound & GRN (receive, batch aur expiry check).                                                                                 |
| Warehouse se hub tak stock    | Line-haul & Stock Transfer (shuru me Logistics Head). Gaadiyan: open question 4.                                                                            |
| Offers aur customer fees      | Promotions & Coupon Manager. Customer fees: Finance Manager + Master.                                                                                       |
| Pick aur pack                 | Beautinique warehouse me Fulfilment Associate.                                                                                                              |
| Last-mile delivery            | Hub Manager → Delivery Partner (OTP, photo, geo-tag).                                                                                                       |
| Payment on delivery           | Sirf UPI QR. Reconciliation: Payments & Refund Reconciliation (shuru me Finance Manager).                                                                   |
| Failed delivery               | Policy ke hisaab se automatic reattempt. Customer reschedule: L1. Return to origin aur disputes: Logistics Control Tower (shuru me Hub Manager).            |
| Complaints                    | L1 → L2 (shuru me wahi agents) → Grievance Officer. System faults: L3 engineer.                                                                             |
| Returns aur exchanges         | Policy: Support Lead + Legal. Pickup: Delivery Partner. Grading aur refund release: Returns QC Inspector.                                                   |
| Skin reaction ya recall       | Cosmetics Regulatory ek hi case ya recall record ka owner hai. Inventory Controller, Hub Ops, Support aur brand ko apne-apne tasks milte hain.              |
| Reviews                       | Review & UGC Moderator (shuru me Super Admin). Brand replies: Seller Marketing (shuru me Seller Account Owner).                                             |
| Fraud                         | Digital fraud: Fraud & Risk. Physical loss: Loss Prevention (shuru me Hub aur Warehouse Managers).                                                          |
| Seller payout                 | Payouts Executive (shuru me Finance Manager) → Finance Manager approval, bade batch pe Master ka second signature. TCS aur TDS: Tax & Statutory Compliance. |
| Delivery partner ka payment   | Earnings Logistics Ops se, payment Finance karega. Grievances: Delivery Partner Support & Grievance.                                                        |

## 7. Non-functional requirements

Basic product requirements §7.4 me hain. Performance aur uptime ke numbers ARCHITECTURE.md ke saath tay honge.

### 7.1 Launch ke liye kanooni zarooratein (education project: dummy)

Ye project education aur portfolio ke liye hai. Neeche ki saari zarooratein system me **production-grade tareeke se banengi**: screens, workflows, calculations, registers aur reminders. Lekin **asli registrations, filings aur lawyer verification nahi honge**. Saare naam, numbers aur registration details dummy hain (§7.3).

| Zaroorat                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Owner                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Grievance Officer:** naam, designation aur contact storefront pe publish karo. Har consumer complaint ticket number ke saath 48 ghante me acknowledge karo aur 1 mahine me solve karo. 1 Jan 2027 se complainant ko recorded complaint ki copy bhi deni hogi.† (Consumer Protection (E-Commerce) Rules 2020, 2026 amendment ke saath)                                                                                                                                                                                                                                                                                                     | Grievance Officer                                                                                                                      |
| **Nodal person:** India me rehne wala ek nodal person appoint karo jo compliance ka zimmedar ho (E-Commerce Rules 2020, rule 4(1)).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Legal & Compliance Officer                                                                                                             |
| **Bahar ke sellers:** listing se pehle har seller written agreement sign kare, apna grievance officer bataye (48 ghante / 1 mahina), aur legal naam, address, GSTIN aur PAN de. 1 Jan 2027 se Udyam number bhi.† Listings pe seller ka naam, address, customer-care number, grievance officer aur rating dikhao. Sellers ke beech koi bhi alag treatment ho, apne brand ke saath bhi, to wo seller terms me likho (E-Commerce Rules 2020, rules 5–6).                                                                                                                                                                                       | State Admin, Legal & Compliance Officer                                                                                                |
| **Apna brand:** apne brand ki sales pe inventory-seller wali duties lagengi, aur uski complaints Beautinique ka Grievance Officer dekhega. 1 Jan 2027 se platform ne jo shoppers ka data collect kiya hai, use Beautinique ke naam ya brand wale products bechne ya promote karne ke liye unki express aur affirmative consent ke bina use nahi kar sakte† (E-Commerce Rules 2020, rule 7; rule 5(6)(a), 2026 amendment).                                                                                                                                                                                                                   | Legal & Compliance Officer, Fairness Analyst                                                                                           |
| **Cosmetics:** sirf manufacturing licence wale ya CDSCO import registration wale cosmetics bechne hain. Label poora hona chahiye: batch number, manufacturing date, use-before ya expiry date, ingredients, aur licence ya registration number. Expired, not-of-standard-quality, misbranded, adulterated ya spurious cosmetics kabhi stock ya sell nahi karne (Drugs and Cosmetics Act 1940, s.18; Cosmetics Rules 2020).                                                                                                                                                                                                                  | Cosmetics Regulatory, Inbound & GRN, Own-Brand QA                                                                                      |
| **Product page declarations:** har product page pe pack wali saari declarations dikhao: maker, packer ya importer ka naam aur address, country of origin, common name, net quantity, MRP (saare taxes ke saath), unit sale price, customer-care contact, aur use-before ya expiry date. Imported products ke liye searchable aur sortable country-of-origin filter dena hai (1 Jul 2026 se†). MRP se upar kabhi mat becho (Legal Metrology (Packaged Commodities) Rules 2011, rules 6(10) aur 6(10A); E-Commerce Rules 2020, rules 5–7).                                                                                                    | Catalog QC                                                                                                                             |
| **Reviews:** na Beautinique, na koi seller, customer ban ke review post kar sakta hai, aur product quality galat nahi bata sakta (Consumer Protection (E-Commerce) Rules 2020, rules 6–7; Consumer Protection Act 2019). Best practice (abhi voluntary): har rating ke genuine reviews dikhao aur BIS IS 19000:2022 ke hisaab se moderate karo.                                                                                                                                                                                                                                                                                             | Review & UGC Moderator                                                                                                                 |
| **Intermediary (IT Rules):** listings aur reviews ki wajah se Beautinique intermediary bhi hai. Platform rules, privacy policy aur user agreement publish karo. Listings ya reviews ki complaints 24 ghante me acknowledge karo aur IT Rules ki deadline me solve karo. Feb 2026 amendment ke baad ye deadlines hain: 7 din me resolve, takedown request 36 ghante me, intimate ya impersonation content 2 ghante me, court ya government order pe 3 ghante me hatana.† (IT Rules 2021, as amended)                                                                                                                                         | Grievance Officer, Review & UGC Moderator, Legal & Compliance Officer                                                                  |
| **Dark patterns:** false urgency, hidden charges, basket sneaking aur pre-ticked boxes bilkul nahi (CCPA Dark Patterns Guidelines 2023). 1 Jan 2027 se: yearly dark-pattern self-audit aur uska certificate site pe, ranking factors importance ke order me, sponsored listings pe label, aur discount ke saath prior price (pichhle 30 din ka sabse kam price) dikhana.† (E-Commerce Rules 2020, 2026 amendment)                                                                                                                                                                                                                           | Legal & Compliance Officer, Promotions & Coupon Manager, Fairness Analyst                                                              |
| **Privacy:** abhi privacy policy publish karo, sensitive personal data ke liye consent lo aur reasonable security practices rakho (IT Act s.43A, SPDI Rules 2011). 13 May 2027 se† DPDP Act 2023 aur DPDP Rules 2025 lagu honge: itemised notices, consent, 90 din me data-rights requests ka jawab, Data Protection Board aur affected users ko breach report (full report 72 ghante me), aur logs 1 saal tak. **Launch se pehle hi DPDP ke hisaab se banana hai.**                                                                                                                                                                        | Data Protection Officer                                                                                                                |
| **CERT-In:** CERT-In Point of Contact naam karo. Listed cyber incidents notice hone ke 6 ghante me report karo. Saare system clocks NIC/NPL-traceable NTP se sync karo. Saare ICT systems ke logs 180 din tak surakshit rakho, India me ya aise ki CERT-In maange to turant de sakein (CERT-In Directions, 28 Apr 2022).                                                                                                                                                                                                                                                                                                                    | Security Officer                                                                                                                       |
| **GST (Beautinique):** jin states me bahar ke sellers registered hain aur jahan se wo platform pe supply karte hain (hamare model me: Beautinique ke warehouse wale states), un sab me e-commerce operator ke roop me TCS registration lo. Bahar ke sellers ki net taxable sales pe 0.5% TCS collect karo (0.25% CGST + 0.25% SGST, ya 0.5% IGST) aur har mahine GSTR-8 file karo (CGST Act ss.24 aur 52). **Apne brand ki sales pe TCS nahi**, kyunki wo Beautinique ki apni supply hai. Jis state me bhi warehouse ya hub hai, wahan Beautinique ka normal GST registration lo (CGST Act ss.22 aur 25; CBIC clarification, 25 Sep 2025†). | Tax & Statutory Compliance                                                                                                             |
| **GST (brands):** jis state ke Beautinique warehouse me brand ka stock hai, us state me brand ka GST registration hona chahiye. Agar brand us state me pehle se registered hai, to warehouse ko additional place of business ki tarah jode. Agar nahi, to us state me naya GST registration le (CGST Act ss.22 aur 25; CBIC clarification, 25 Sep 2025†).                                                                                                                                                                                                                                                                                   | State Admin (check karega), Seller                                                                                                     |
| **TDS (sellers):** bahar ke sellers ki platform pe hui gross sales pe 0.1% TDS kaato. Apne brand ki sales pe nahi. Individual ya HUF seller jiski saal ki gross sales ₹5 lakh tak hai aur jisne PAN ya Aadhaar diya hai, uspe TDS nahi kaatna (Income-tax Act 2025, s.393(1) Table Sl. 8(v), pehle s.194-O†).                                                                                                                                                                                                                                                                                                                               | Tax & Statutory Compliance                                                                                                             |
| **TDS (delivery partners):** jab ek payment ₹30,000 se zyada ho ya saal ka total ₹1 lakh se zyada ho, tab delivery partner ke payouts pe 1% TDS kaato. Onboarding pe PAN lo (Income-tax Act 2025, s.393(1) Table Sl. 6(i), pehle s.194C†).                                                                                                                                                                                                                                                                                                                                                                                                  | Tax & Statutory Compliance, Rider Onboarding                                                                                           |
| **Gig delivery partners:** government portal pe Beautinique ko aggregator ke roop me register karo, aur har delivery partner ki details upload karo: naye partners real time me ya roz (daily), aur jo chhod de uski exit real time me. Aggregator contribution (turnover ka 1–2%, partner payouts ke 5% tak) notify hone ki date se budget karo (Code on Social Security 2020; Social Security (Central) Rules 2026†). State gig-worker kanoon follow karo (jaise Karnataka me payouts pe 1% welfare fee†, Rajasthan ka 2023 Act). Maharashtra ke state gig-worker niyam ke liye system me ek state setting rahegi (dummy).                | Rider Onboarding (registration), Tax & Statutory Compliance (contribution aur fees), Delivery Partner Support & Grievance (grievances) |
| **Plastic packaging EPR:** Beautinique ko micro ya small enterprise nahi maana gaya hai (§2), isliye CPCB ke EPR portal pe Brand Owner ke roop me register karo (apne brand ke packs aur shipping packaging ke liye) aur yearly EPR targets poore karo (Plastic Waste Management Rules 2016, EPR Guidelines 2022).                                                                                                                                                                                                                                                                                                                          | Legal & Compliance Officer, Own-Brand QA                                                                                               |
| **Warehouses, hubs aur offices:** har site ka state Shops & Establishments registration. 10 ya usse zyada workers hone pe 60 din me OSH Code 2020 registration.† ESIC (10+ employees) aur EPFO (20+ employees) registration (Code on Social Security 2020†). Fire NOC: jahan state ya municipal fire niyam maange (khaaskar perfume, aerosol aur nail polish rakhne wale warehouses), uske liye site record me ek field aur renewal reminder rahega (dummy).                                                                                                                                                                                | Warehouse Manager, Finance Manager                                                                                                     |

† Ye 2025–26 ke naye kanoon, rules, amendments ya clarifications hain (jaise Income-tax Act 2025, Labour Codes, DPDP Rules 2025, Social Security (Central) Rules 2026, E-Commerce aur IT Rules ke 2026 amendments, CBIC clarification). Inhe law-firm summaries aur official links se check kiya gaya hai, Education project me inhe aur verify nahi kiya jayega; asli launch me lawyer se gazette ke against confirm karna padta.

### 7.2 Expansion sirf configuration se (must)

Naya district ya state kholna **admin setting aur operations ka kaam** hona chahiye. Kabhi bhi code change ya deploy nahi.

1. **Location master:** **poore India** ke states → districts → pincodes pehle din se official lists se load honge. Jaise states aur districts ke liye Local Government Directory ke codes, aur pincodes ke liye India Post ki directory. Har district aur pincode ka ek **served** flag hoga, uska hub, delivery promise aur go-live date.
2. **Kuch bhi hard-coded nahi:** code me kisi state, district, pincode, warehouse ya hub ka naam nahi hoga. Pune aur Maharashtra bas data ki pehli rows hain. Automated tests prove karenge ki naya district sirf configuration se khul jata hai.
3. **Warehouses aur hubs data hain:** har warehouse aur hub ek record hoga: address, Ola Maps zone, wo kaunse pincodes serve karta hai, operating hours aur cut-offs. Har warehouse apne state ke GST registration se linked hoga.
4. **Har area ki apni settings:** delivery promise, cut-off times, holiday calendar, UPI on delivery allowed hai ya nahi, aur state ke niyam (GST registration, gig-worker niyam). Ye sab state ya district ki settings hongi, sensible defaults ke saath.
5. **Kaun kya kholega:** Network & Serviceability Planner Logistics Ops app me district ya pincode chalu karega, Logistics Head ki approval ke baad. **Naye state** ke liye **Master ki approval** bhi chahiye. Phir us state ka State Admin assign hoga. State-wise admin assignment pehle se bana hua hai.
6. **Storefront:** pincode check product page aur checkout dono pe hoga. Jo pincode served nahi hai, wahan ke customer products dekh sakte hain aur try-on kar sakte hain, aur unhe **"Notify me"** button dikhega. Ye waitlist district-wise hogi, taaki pata chale ki agla district kaunsa kholna hai.
7. **Sellers pe area ki rok nahi:** kisi bhi state ka brand pehle din se bech sakta hai, kyunki stock hamare warehouse me hai. Bas us warehouse ke state ka GST registration chahiye (§7.1). Seller onboarding me iski step-by-step guide aur checklist milegi.
8. **Expansion checklist (team ready):** Logistics Ops app me har naye district ya state ki go-live checklist hogi. Sabse pehle **team ready** honi chahiye: Hub Manager aur hub staff assigned, kam se kam zaroori delivery partners onboarded aur trained, warehouse ya hub ready, State Admin assigned (naye state ke liye), aur support coverage ready. Saath me GST registration (naye state ke liye) aur state ke niyam set hone chahiye. Checklist poori hue bina district ya state live nahi hoga, chahe Master ne use seedha kholne ka faisla kiya ho.

### 7.3 Kanooni contacts (dummy)

Ye saare naam aur contacts **dummy** hain, sirf education project ke liye. Kisi asli insaan se inka koi sambandh nahi.

| Role                                        | Naam (dummy)    | Email (dummy)                     | Phone (dummy)    |
| ------------------------------------------- | --------------- | --------------------------------- | ---------------- |
| Grievance Officer                           | Sneha Joshi     | grievance@beautinique.example     | +91 20 0000 0101 |
| Nodal Person / Legal & Compliance Officer   | Rohan Deshpande | legal@beautinique.example         | +91 20 0000 0102 |
| Data Protection Officer (DPDP contact)      | Priya Nair      | privacy@beautinique.example       | +91 20 0000 0103 |
| Security Officer (CERT-In Point of Contact) | Amit Kale       | security@beautinique.example      | +91 20 0000 0104 |
| Delivery Partner Support & Grievance        | Sameer Shaikh   | rider-support@beautinique.example | +91 20 0000 0105 |
| Finance Manager                             | Kavita Mehta    | finance@beautinique.example       | +91 20 0000 0106 |
| Supply Chain & Logistics Head               | Vikram Patil    | logistics@beautinique.example     | +91 20 0000 0107 |
| Head of Operations                          | Neha Gokhale    | operations@beautinique.example    | +91 20 0000 0108 |

- **Registered office (dummy):** Beautinique Pvt. Ltd., Office 401, Example Tower, Baner, Pune 411045, Maharashtra.
- **Customer care (dummy):** care@beautinique.example, +91 20 0000 0100.

### 7.4 Basic product requirements

- **Fully responsive:** saare apps mobile, tablet aur desktop pe poori tarah kaam karenge.
- **Language:** sirf English. INR aur dates `en-IN` me.
- **Accessibility:** WCAG 2.1 AA ke hisaab se: keyboard se chalne layak, screen reader labels, sahi colour contrast, aur dikhne wala focus.
- **Delivery app:** mobile-first PWA. Phone pe install ho, aur kamzor network me offline queue ke saath chale.
- **Security:** internal staff ke liye MFA, har role ko sirf zaroori permissions, aur saare apps ka audit log.
- **Performance aur uptime:** numbers ARCHITECTURE.md ke saath tay honge.

### 7.5 Pune launch network (dummy data)

Ye locations dummy planning data hain. Network & Serviceability Planner inhe kabhi bhi app se badal sakta hai (§7.2).

- **Warehouse (Fulfilment Centre):** Chakan MIDC (Khed taluka), Pune–Nashik highway pe. Pimpri-Chinchwad aur Pune shehar dono ke paas.
- **City hubs (8):** Hinjewadi–Wakad, Baner–Aundh, Kothrud–Warje, Shivajinagar–Deccan, Viman Nagar–Kharadi, Hadapsar–Magarpatta, Kondhwa–Katraj, Pimpri–Chinchwad–Nigdi.
- **Taluka hubs (13):** Haveli (Loni Kalbhor), Mulshi (Paud), Maval (Talegaon Dabhade), Khed (Rajgurunagar), Ambegaon (Manchar), Junnar (Narayangaon), Shirur, Daund, Indapur, Baramati, Purandar (Saswad), Bhor, Velhe.
- **Total:** 1 warehouse aur 21 hubs.

## 8. Out of scope

- Beauty aur personal care ke alawa koi bhi category.
- Customer orders aur return pickups ke liye third-party couriers. Ye sirf Beautinique ke delivery partners karenge.
- Cash on delivery. Payment on delivery sirf UPI se.
- Wo sellers jo brand owner ya authorised distributor nahi hain.
- 18 saal se kam umar ke customers (launch pe).
- Served districts ke bahar delivery. Launch pe sirf Pune district, Maharashtra served hai.
- Drug-classified items (jaise minoxidil, medicated creams).
- Native mobile apps (abhi scope me nahi; web apps fully responsive hain).
- Asli government registrations aur filings (education project; sab dummy).

## 9. Assumptions

Saari assumptions confirm ho gayi hain aur ab §2 me decisions ki tarah likhi hain: India aur INR, GST invoices, English apps, Hinglish docs, aur fully responsive web apps.

## 10. Open questions

Abhi koi open question nahi hai. Naye sawaal aaye to yahan likhe jayenge.

## 11. Risks

| Risk                                                     | Kyun zaroori hai                                                                                                                                                                                                                                           |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Expansion code ka project ban jaye**                   | Agar koi location, rule ya hub hard-coded hua, to har naya district development ka kaam ban jayega. Bachaav: §7.2, aur ek test jo sirf configuration se naya district kholta hai.                                                                          |
| **Pune ke bahar ki demand launch pe wapas jayegi**       | Bahar ke customers dekh sakte hain par order nahi kar sakte. Bachaav: notify-me waitlist, Pune me local marketing, aur waitlist se agle districts chunna.                                                                                                  |
| **Doosre states ke brands ko Maharashtra GSTIN chahiye** | Bina iske wo Pune warehouse me stock nahi rakh sakte, aur launch pe brands kam aa sakte hain. Bachaav: seller onboarding me Maharashtra GST registration ki step-by-step guide aur checklist, Brand Partnerships ki madad, aur State Admin ka GSTIN check. |
| **Har naya state apna setup laata hai**                  | Naye state ke warehouse ke liye us state ka GST registration chahiye, aur gig-worker niyam har state me alag hain. Bachaav: §7.2 ki go-live checklist.                                                                                                     |
| **Saare 11 apps aur saare roles launch pe**              | Launch se pehle development ka kaam zyada hoga. Bachaav: shared packages, ek common login aur permissions system, aur shuru me ek insaan kai roles sambhal sakta hai.                                                                                      |
| **Pehle din 21 hubs**                                    | Poore Pune district (gaon wale talukas bhi) ke liye pehle din se 21 hubs aur unke riders chahiye. Bachaav: hubs data hain (§7.2), aur kisi bhi area ko kabhi bhi on/off kar sakte hain.                                                                    |
| **Legal cheezein dummy hain**                            | Asli launch ke liye har registration, filing aur legal text lawyer ke saath verify karna padega. Bachaav: §7.1 me sab dummy mark hai, aur system ke flows asli jaise bane hain.                                                                            |

## Change log

| Version | Date       | Badlav                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1    | 2026-10-18 | Pehla draft: sirf beauty, hybrid business model, hybrid delivery.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| v0.2    | 2026-10-18 | Business model: Beautinique + doosre brand sellers. Delivery sirf Beautinique (courier nahi). Har role ka apna platform.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| v0.3    | 2026-10-18 | Poora role catalogue: 11 apps (Super Admin alag) aur sub-roles. Tay hua: sirf brand owners aur authorised distributors; saara stock Beautinique warehouse me; gig delivery partners apni gaadi pe; prepaid ya UPI on delivery, cash nahi; 18+ only; pehli release me reviews; foreign investment nahi; apna brand house-brand seller account se.                                                                                                                                                                                                                                                         |
| v0.4    | 2026-10-18 | App 1 ka naam **Customer** hai, Client nahi.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| v0.5    | 2026-10-18 | Coverage: pehle din se poora India. §11 Risks joda.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| v0.6    | 2026-10-18 | Coverage phases me: pehle Pune district (Maharashtra), phir Maharashtra ke baaki districts, phir baaki states. §7.2 joda: expansion sirf configuration se.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| v0.7    | 2026-10-18 | Poora PRD **Hinglish** me. **Saare roles aur saare 11 apps launch pe**; growth ya scale me kuch nahi. Verification ke fixes: Pro Buyer me saare buyer types; `SELLER_TYPES` ki 15 values ka plan; Master ka approval bypass aur login bypass hatega; Admin ka category aur contact-inbox ka kaam shift hoga; brands ke liye warehouse-state GSTIN ki shart; IT Rules, dark patterns, rider TDS, plastic EPR aur labour registrations jode gaye; legal table ki galtiyan theek ki gayi. Hierarchy poori ki gayi. Naye open questions 6 aur 9, aur naye risks.                                             |
| v0.8    | 2026-10-18 | Decision: jin brands ke paas warehouse-state (Maharashtra) GSTIN nahi hai, wo registration lenge, aur Beautinique onboarding me guide aur checklist dega (purana open question 6 band). Legal table ke fixes: apne brand ki sales pe TCS nahi; seller TDS me ₹5 lakh wali chhoot; DPDP aur labour rows pe †; fire NOC "lawyer se confirm"; gig uploads "real time ya roz"; rule 5(6)(a) aur poore citations; † footnote saaf. Tax role me seller TDS gross sales pe. Hierarchy ki external line poori.                                                                                                   |
| v0.9    | 2026-10-18 | Project type: education aur portfolio project, lekin production-grade; legal cheezein dummy data ke saath. Assumptions confirm: India aur INR, GST invoices, apps English me, fully responsive. Pune pehle din poora district. Kisi bhi district ya state ko seedha kholne ki suvidha. Chakan warehouse aur 21 hubs (dummy). Stock transport ka suggestion. Drug items kabhi nahi. Head of Operations joda. EPR: MSE nahi. Dummy legal contacts (§7.3), basic requirements (§7.4), Pune network (§7.5). §5 me saare 11 apps ke features ka pehla draft. Seller onboarding Customer app se Seller app me. |
| v1.0    | 2026-10-18 | PRD **approved**. §5 features final. Stock transport aur "Pune pehle din poora district" confirm. Open questions band. Kisi bhi district ya state ko seedha kholne ki shart: team ready (go-live checklist). §6 aur §7 ki technical detail ARCHITECTURE.md me jayegi.                                                                                                                                                                                                                                                                                                                                    |
| v1.1    | 2026-10-20 | Decision: apps **sirf English** me.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| v1.2    | 2026-10-20 | Decision: jis product ka order hua wo archive hota hai, delete nahi (§5 seller catalog). |
| v1.3    | 2026-10-20 | Decision (frozen): OTP sirf email se, mobile pe OTP nahi (login aur delivery dono); phone sirf contact (§2, §3, §5). |
| v1.4    | 2026-10-20 | Decision (frozen): SMS aur WhatsApp channel poore hate; notifications in-app, email, browser push (§2, §5). SMS nahi, isliye TRAI DLT wali legal row bhi hati (§7.1). |
