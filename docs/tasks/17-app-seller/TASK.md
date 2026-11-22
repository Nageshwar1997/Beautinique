# TASK 17: Seller app (sellers ki team aur Unibelle)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `17-app-seller`; charan 4 se shuru (D-446). Progress: 0 / 25 points.

## 1. Lakshya

Seller ki team ka app: onboarding aur dastavez, apna staff, listings aur daam, maal bhejna, orders aur reviews dekhna, aur apna hisaab aur payouts, sab bina customer ki pehchaan ke (D-143) aur jokhim wale kaam authenticator ke saath (D-184).

## 2. Scope

**Andar:** `frontend/seller` app (SPA, D-290; Vercel ka apna project, D-010): Seller Account Owner, Seller Grievance Officer, Catalog Manager, Dispatch & Inventory, Finance, Compliance & Quality, aur Unibelle ka Own-Brand Manager ([PRODUCT.md](../../PRODUCT.md) §3.2). Layout DS-5.5 (partner dashboard: Home pe "kya karna baaki" ki checklist).

**Bahar:**

- Screens ke peeche ka data aur niyam: `11-catalog`, `13-commerce`, `14-finance`, `08-identity`.
- R2: Seller Marketing (store page, offers, reviews ka jawab, Q&A), aur Seller API Integration aur Own-Brand QA & Batch Release ke kaam jab unke module aayein.

## 3. Functional requirements

1. **Dhaancha aur sign-in (charan 4):** seller sign-up allowlist se (SR-018); authenticator Account Owner, Finance, aur daam, payout, bank, staff ya maal bhejne ke haq wale users pe (D-184).
2. **Onboarding (charan 4):** brand ka saboot (D-032), dummy KYC aur dastavez (D-026, D-193), jis state ke warehouse me maal us state ka GSTIN ki guide aur checklist (D-036), seller agreement aur undertaking ka accept, version ke saath (DS-9.26), seller ka block aur grievance officer (D-238). Staff ki manzoori ki halat aur reject ki wajah.
3. **Seller ka staff (charan 4):** roles sirf Account Owner de (AC-SELLER-1, SR-024); Unibelle ka Own-Brand Manager sirf seller ke haq se, apni listing khud manzoor nahi karta (D-031, D-271).
4. **Listings (charan 5):** products aur variants likhna aur badalna; jokhim wale badlav jaanch me (D-098); daam ka bada badlav dobara confirm ke saath, MRP se upar ki galti field ke paas, bhara data saaf nahi (AC-SELLER-4, D-087).
5. **Compliance & Quality (charan 5):** licence ka type, claims ke saboot aur label ki jaankari (D-128, D-224).
6. **Maal bhejna (charan 6):** shipment ki pehle se suchna (ASN), maal bhejna, receiving ke farak ka jawab photo ke saath (D-096).
7. **Orders (charan 8):** apne orders aur unki halat, sirf order number, shehar aur pincode; customer se seedha sampark nahi (D-143).
8. **Reviews (charan 11):** apne products ke reviews padhna, reviewer ka contact kahin nahi, R1 me jawab ka raasta nahi (AC-SELLER-6, D-160).
9. **Finance (charan 12):** statements, har bikri ki line kab payable aur kis payout me (AC-SELLER-5, D-081); reports aur CSV sirf apne rows, customer ke fields hi nahi, formula wale cells ka bachav (AC-SELLER-3, D-143, D-144, SR-075); bank badalna dobara code ke saath, khabar aur sirf aakhri 4 ank (AC-SELLER-2, D-190, SR-052).

## 4. Niyam

1. Seller ki har query seller ke filter ke saath; doosre seller ka data kabhi nahi (SR-034).
2. Seller Finance bank details nahi badal sakta ([PRODUCT.md](../../PRODUCT.md) §3.2).
3. Session 7 din aage, max 30 din (D-181).

## 5. Data model aur API

App ka apna data nahi; sab maalik services ke routes se, `frontend-api-client` ke typed client ke saath (CR-27).

## 6. Security

SR-018 (allowlist), SR-024 (seller ke roles), SR-034 (seller ki deewar), SR-052 (bank), SR-075 (exports), SR-088 (seller ka data); saajhe niyam (authenticator, SR-005 ke headers).

## 7. Dependencies

- **Tika hai:** `03-frontend-kit`, `08-identity`, `09-gateway`, `11-catalog`, `06-media`; apne charan me `13-commerce` aur `14-finance`.
- **Owner ke kaam:** Seller ka Vercel project ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §2.2 `SELLER` (`AC-SELLER-1` se `AC-SELLER-6`), aur apps ke saajhe criteria.
- **Manuals:** `manuals/seller/<ROLE_NAME>.md`, us role ke pehle feature ke PR me ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/SELLER.md](../../testing/SELLER.md), har feature ke PR me (DD-13).

## 9. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                  | Charan | Size   | Halat |
| ---- | ------------------------------------------------------------------------ | ------ | ------ | ----- |
| ST-1 | App ka dhaancha, sign-up aur sign-in, Vercel project, manual aur testing | 4      | L (4)  | Baaki |
| ST-2 | Onboarding: brand ka saboot, KYC, GSTIN, agreement aur seller ka block   | 4      | L (4)  | Baaki |
| ST-3 | Seller ka staff aur Own-Brand Manager                                    | 4      | M (2)  | Baaki |
| ST-4 | Listings, variants aur daam                                              | 5      | L (4)  | Baaki |
| ST-5 | Compliance & Quality: licence, claims ke saboot aur label                | 5      | M (2)  | Baaki |
| ST-6 | Maal bhejna aur receiving ke farak                                       | 6      | M (2)  | Baaki |
| ST-7 | Orders, bina customer ki pehchaan                                        | 8      | M (2)  | Baaki |
| ST-8 | Reviews dekhna                                                           | 11     | S (1)  | Baaki |
| ST-9 | Finance: statements, payouts, CSV aur bank                               | 12     | L (4)  | Baaki |
|      | **Kul**                                                                  |        | **25** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 17 ka pehla spec aur 9 subtasks (D-446); code abhi nahi. |
