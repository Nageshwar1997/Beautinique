# TASK 11: catalog (sellers, products, daam, search aur reviews)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `11-catalog`; charan 4 se shuru (D-446). Progress: 0 / 27 points.

## 1. Lakshya

Sirf brand owner ya uske authorised distributor bechein (D-032), har product ki sachchi aur poori jaankari ho, daam niyam se badle, search bina kisi boost ke sahi kram de, aur reviews sirf asli kharidaar likhein ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2, §6).

## 2. Scope

**Andar:** catalog service (`backend/catalog`): sellers (KYC ke refs, GSTIN, seller ka block), brands, categories, products aur variants, listing versions, daam aur itihaas, HSN ki table, ingredients aur blocklist, claims aur saboot, search ka read model aur synonyms, reviews aur moderation.

**Bahar:**

- Stock, batch aur expiry: `13-commerce` (catalog unke events se copy rakhta hai).
- Files: `06-media`; catalog me sirf `assetId`.
- Seller ka bank aur hisaab: `14-finance`.
- Screens: Seller, Admin aur Customer apps ke modules.
- Beauty Pro buyers ka kaam, Q&A, brand ka jawab aur formula ka label: R2 (D-160, D-167, D-170, D-171 ka R2 hissa).

## 3. Functional requirements

### 3.1 Sellers (charan 4)

1. Ek brand ka poore platform pe ek hi seller, brand ko pehla haq; barcode se duplicate ki jaanch; do sellers ek saath wahi brand ya barcode daalein to sirf ek safal (D-075, AC-CATALOG-1).
2. Jis state ke warehouse me maal, us state ka GSTIN zaroori, onboarding me guide aur checklist (D-036); KYC dummy, dastavez sirf `assetId` (D-026, D-193).
3. Seller ka block (naam, pata, customer care, seller ka grievance officer) ke bina seller live nahi (D-238, AC-CATALOG-8).
4. Staff ki manzoori ke baad hi seller live; jisne reject kiya wo appeal tay nahi karta (D-084, SR-038); har badlav pe `catalog.seller.statusChanged`, jisse identity seller ka grant deti hai.
5. Apna brand (Unibelle) sirf apne seller account se, koi shortcut nahi (D-031, D-271).

### 3.2 Catalog (charan 5)

1. Category tree aur har category ke variants aur attributes; ek product pe zyada se zyada 2 variant axis (D-076); shade pe naam, swatch photo aur hex (D-085, AC-CATALOG-3).
2. Skin type, concern, hair type aur active % platform ki list se (D-137); HSN ki allowed list aur rate, rate badle to alert (D-086).
3. Listing ka content seller likhe; jokhim wale fields ke har badlav ki jaanch, baaki turant live aur spot check; live version badla nahi ja sakta, manzoori version id pe (D-098, SR-041, AC-CATALOG-2).
4. Submit tabhi jab licence ka type, imported ke fields, pack ki jaankari, allowed HSN aur chhote pack ka MRP sab ho (AC-CATALOG-6, D-127, D-128).
5. Ingredients: text aur label photo, INCI ki structured list staff ki jaanch ke baad, free-from filters aur allergen ki chetavni (D-099); blocklist ka ingredient ho to submit hi nahi; blocklist sirf Senior Catalog Reviewer badle, wajah ke saath (D-132, AC-CATALOG-7).
6. Claims sirf tay list se; test wale claim (SPF jaise) saboot ki file ke bina nahi (D-100, D-224, AC-CATALOG-9).

### 3.3 Daam (charan 5)

1. Selling price seller tay karta hai, platform ke niyamon ke saath: 0 nahi, batch ke MRP se upar nahi, bada badlav dobara confirm se; har badlav itihaas ke saath ek transaction me (D-061, D-087, AC-CATALOG-4).
2. Har kate MRP ya "% off" ke saath pichhle 30 din ka sabse kam daam, pehle se gina; "% off" neeche round (D-223).
3. Pro daam bina sign-in, normal customer ya search ke jawab me kabhi nahi (SR-042, AC-CATALOG-5).
4. `catalog.price.changed` aur `catalog.taxRate.changed`, jinse commerce apni copy rakhta hai.

### 3.4 Search (charan 5)

1. `search_documents` read model, catalog aur commerce ke events se; Atlas Search ka index code me, release step se ([ARCHITECTURE.md](../../ARCHITECTURE.md) §6 niyam 1 aur 2).
2. Filters aur sort (D-138); kram: text, phir rating (misaal 5 reviews se), phir 30 din ki bikri aur stock; stock khatam sabse neeche; kisi seller ke boost ka field hi nahi (D-139, D-153, AC-CATALOG-10).
3. "Bestseller" aur "kam stock" sirf niyam se, sirf sach aankde (D-154); synonyms aur zero result ki madad (D-152); search ka text 100 characters tak (SR-007).
4. Public cache sirf category tree, brand page, product ka content aur availability pe (§6 niyam 8); search ka jawab kabhi cache nahi.

### 3.5 Reviews (charan 11)

1. Haq sirf delivered line se: ek customer, ek product, ek review; cancel, RTO aur ₹0 line pe nahi; dobara kharid pe purana edit (D-135, AC-CATALOG-11).
2. Star turant, text apne aap ki jaanch, photo queue me (D-136, D-155); nakli review ke niyam (D-156) aur koi inaam nahi (D-158); har review pe us waqt ka listing version (D-171).
3. Rating ka jod review ke transaction me, aur raat ki jaanch (§10.7 niyam 6).
4. Reports: nagnata wali report pe review turant chhupe, ghadi ke saath; chhupana sirf tay list se; appeal doosra moderator tay kare (D-146, D-251, AC-CATALOG-12).
5. Seller apne products ke reviews dekhe, reviewer ka contact kahin nahi (D-160).

### 3.6 Seller ka udhaar (charan 12)

`finance.seller.duesStage` pe seller ke block ke kadam (D-103).

## 4. Niyam

1. Business ki cheez (product, variant, seller) kabhi delete nahi, `archived` ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.3 niyam 2).
2. Staff khud listing ka field nahi badalta (D-098).
3. Unibelle ka staff platform ki jaanch ka koi kaam nahi karta (§11 niyam 6.6).

## 5. Data model

| Collection                  | Kaam                                            | Retention class | Samay                |
| --------------------------- | ----------------------------------------------- | --------------- | -------------------- |
| `sellers`                   | Seller, GSTIN, KYC ke refs, block, halat        | `book`          | D-193, D-227         |
| `brands`                    | Brand aur uska seller                           | `ref`           | Hamesha (`archived`) |
| `categories`                | Tree, attributes, variant ki seema, HSN ki list | `ref`           | Hamesha              |
| `products`, `variants`      | Product, variants, barcode (unique)             | `ref`           | Hamesha (`archived`) |
| `listing_versions`          | Har version, manzoori ki halat (purane gzip)    | `book`          | Hamesha              |
| `prices`, `price_history`   | Abhi ka daam aur har badlav                     | `book`          | Hamesha              |
| `hsn_rates`                 | HSN aur GST rate                                | `ref`           | Hamesha              |
| `ingredients`, `blocklist`  | Ingredient master aur blocklist, wajah ke saath | `ref`           | Hamesha              |
| `search_documents`          | Search ka read model                            | `ref`           | Events se dobara     |
| `synonyms`                  | Search ke synonyms                              | `ref`           | Hamesha              |
| `reviews`, `review_reports` | Reviews, photos ke refs, reports aur faisle     | `case`          | D-305 ke hisaab      |

Saath me platform collections ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2) aur event ki copies (`copy_<cheez>`). Fields aur indexes code ke saath is file me judte hain.

## 6. API

Routes contracts me ([tasks/README.md](../README.md)): seller onboarding aur manzoori, categories, listings aur versions, daam, ingredients, search (public), product page (public cache), reviews aur reports. Bhejta hai: `catalog.seller.statusChanged`, `catalog.listing.published`, `catalog.price.changed`, `catalog.taxRate.changed`, `catalog.review.published`, `.hidden`. Leta hai: `commerce.stock.changed`, `commerce.nextBatch.changed`, `commerce.orderLine.delivered`, `commerce.sales.rolledUp`, `finance.seller.duesStage` ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

## 7. Security

SR-034 (seller ki deewar), SR-038 (reject aur appeal alag), SR-040 (user ka content sirf text), SR-041 (listing version), SR-042 (Pro daam), SR-059 aur SR-060 (reviews aur moderation), SR-069 (search ka input).

## 8. Dependencies

- **Tika hai:** `02-platform`, `06-media`, `08-identity`; charan 5 se `13-commerce` ke events (stock aur bikri).
- **Is pe tike:** `13-commerce` (daam ki copy), `16-app-customer`, `17-app-seller`, `18-app-admin`.
- **Owner ke kaam:** catalog ka Atlas cluster aur uska Search index, pehle live deploy se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.6 `CATALOG` (`AC-CATALOG-1` se `AC-CATALOG-12`).
- **Manuals aur testing:** jis app me screen judti hai, uske manual aur testing file usi app ke module me (D-440).

## 10. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                                        | Charan | Size   | Halat |
| ----- | ------------------------------------------------------------------------------ | ------ | ------ | ----- |
| ST-1  | Service ka dhaancha aur sellers: ek brand ek seller, GSTIN, block, manzoori    | 4      | L (4)  | Baaki |
| ST-2  | Seller ki appeal aur Unibelle ke niyam                                         | 4      | S (1)  | Baaki |
| ST-3  | Categories, attributes, variants, shades, HSN aur skin ke fields               | 5      | M (2)  | Baaki |
| ST-4  | Products aur listing versions, jokhim wale fields ki jaanch, submit ki sharten | 5      | L (4)  | Baaki |
| ST-5  | Ingredients, INCI list, blocklist, claims aur saboot                           | 5      | M (2)  | Baaki |
| ST-6  | Daam, itihaas, 30 din ka sabse kam daam aur Pro daam ka pehra                  | 5      | M (2)  | Baaki |
| ST-7  | Search: read model, index, filters, kram, synonyms aur zero result             | 5      | L (4)  | Baaki |
| ST-8  | Public cache wale routes                                                       | 5      | S (1)  | Baaki |
| ST-9  | Reviews: haq, likhna, photo, listing version aur rating ka jod                 | 11     | L (4)  | Baaki |
| ST-10 | Moderation, reports aur seller ka reviews dekhna                               | 11     | M (2)  | Baaki |
| ST-11 | Seller ke udhaar pe block ke kadam                                             | 12     | S (1)  | Baaki |
|       | **Kul**                                                                        |        | **27** |       |

## Change log

| Version | Date       | Badlav                                                           |
| ------- | ---------- | ---------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 11 ka pehla spec aur 11 subtasks (D-446); code abhi nahi. |
