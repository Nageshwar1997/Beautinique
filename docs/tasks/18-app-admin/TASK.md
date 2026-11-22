# TASK 18: Admin app (marketplace ki teams aur sub-district)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `18-app-admin`; charan 2 me dhaancha aur area ki screens (D-451), baaki apne charan me (D-446). Progress: 0 / 22 points.

## 1. Lakshya

Marketplace chalane wali andar ki teams aur sub-district ke Admins ka app: hub ka switch aur pincode ki jaanch, sellers aur listings ki manzoori, category aur search ke niyam, aur reviews ki moderation, sab "jisne reject kiya wo appeal tay nahi karta" jaise niyamon ke saath ([PRODUCT.md](../../PRODUCT.md) §3.2, D-084).

## 2. Scope

**Andar:** `frontend/admin` app (SPA, D-290; Vercel ka apna project, D-010): Admin, Seller Ops Executive aur Lead, Listing Reviewer, Senior Catalog Reviewer, Category Manager, Review Moderator, Cosmetics Regulatory & Product Safety, Brand Protection, Brand Partnerships, Fraud & Risk Analyst aur Trust & Safety Lead ke R1 wale kaam ki screens ([PRODUCT.md](../../PRODUCT.md) §3.2).

**Bahar:**

- Screens ke peeche ka data aur niyam: `10-logistics` (switch aur pincode), `11-catalog` (sellers, listings, categories, reviews), `15-support` aur baaki maalik services.
- R2 ke roles: Beauty Pro Verifier aur Shade Specialist, aur recall aur skin reaction (D-129, D-130); R2 ki planning me.

## 3. Functional requirements

1. **Dhaancha aur sign-in (charan 2):** `frontend-app-shell` aur `frontend-auth-ui` se; staff ka sign-in authenticator ke saath; DESIGN ka staff data-dense parivaar (DS-5.6); IdleWarning aur PermissionDenied (AC-ADMIN-6).
2. **Sub-district aur hub (charan 2):** hub ka switch aur live, staff ki list ki sharten ke saath (D-015, D-022); pincode ka primary sub-district badalna aur bina mapping wale pincodes ki list (D-016 niyam 1); har badlav sirf haq wala kare, audit me purani aur nayi value aur wajah, asar bina deploy (AC-ADMIN-5).
3. **Staff ki lists (charan 3):** customer ki jaankari chhupi, "Show details" pe wajah, phir dikhe aur audit me (AC-ADMIN-4, D-201, DS-10.5); hub ka staff kam ho to Admin ka faisla, staff bhare ya hub OFF (D-022).
4. **Seller Ops (charan 4):** sellers ki manzoori, har warehouse state ke GSTIN ki jaanch, seller ke dastavez dekhna (D-193); reject ki appeal Seller Ops Lead tay kare, reject karne wala account nahi (AC-ADMIN-2, D-084).
5. **Category Manager (charan 5):** category tree, har category ke variants aur attributes, HSN ki allowed list, aur search ke synonyms (D-076, D-086, D-152).
6. **Listing ki jaanch (charan 5):** listing aur INCI list ki jaanch category ke hisaab se; sirf jaancha hua version manzoor, beech me naya version aaye to "This changed" (AC-ADMIN-1, SR-041); live ke baad jokhim wale badlav dobara jaanch me (D-098, D-099); Senior Catalog Reviewer ki ingredient master list aur blocklist, wajah ke saath (D-132), aur reject ki appeal.
7. **Brand aur safety (charan 5):** Brand Protection ki brand authorisation ki chain aur takedown (D-032); licence ke type ke niyam (D-128).
8. **Fraud & Risk (charan 10):** return, daawe aur payment ke galat istemaal ke signals dekhna (SR-058).
9. **Review Moderator (charan 11):** reviews, photos aur reports ki queue; nagnata aur personal data wali reports sabse upar, har cheez ki ghadi, "Next item" aur ginti (AC-ADMIN-3, D-136, D-251); chhupana aur wapas dikhana wajah ke saath.

## 4. Niyam

1. Unibelle ka staff (Own-Brand Manager samet) platform ki jaanch ka koi kaam nahi karta: listing ki jaanch, review ki moderation (D-031, D-271; [ARCHITECTURE.md](../../ARCHITECTURE.md) §11 niyam 6.6).
2. Jisne reject kiya, wo us appeal ka faisla nahi karta (§11 niyam 6.1).
3. Admin ka scope apna sub-district; marketplace ki teams `national` scope pe (§11 niyam 4).

## 5. Data model aur API

App ka apna data nahi; sab maalik services ke routes se, `frontend-api-client` ke typed client ke saath (CR-27).

## 6. Security

SR-035 (scope), SR-039 (chhupi jaankari), SR-041 (version pe manzoori), SR-043 (settings aur tables ke badlav audit me), SR-058 (fraud signals), SR-060 (moderation), SR-076 (audit); staff app ke saajhe niyam (session 12 ghante, authenticator, SR-005 ke headers).

## 7. Dependencies

- **Tika hai:** `03-frontend-kit`, `08-identity`, `09-gateway`, `10-logistics`; apne charan me `11-catalog`, `15-support`.
- **Owner ke kaam:** Admin ka Vercel project ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §2.3 `ADMIN` (`AC-ADMIN-1` se `AC-ADMIN-6`), aur apps ke saajhe criteria.
- **Manuals:** `manuals/admin/<ROLE_NAME>.md`, us role ke pehle feature ke PR me ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/ADMIN.md](../../testing/ADMIN.md), har feature ke PR me (DD-13).

## 9. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446, D-451). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                           | Charan | Size   | Halat |
| ---- | --------------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1 | App ka dhaancha, staff ka sign-in, Vercel project, manual aur testing ki shuruaat | 2      | L (4)  | Baaki |
| ST-2 | Hub ka switch aur live, pincode ka primary sub-district aur bina mapping ki list  | 2      | M (2)  | Baaki |
| ST-3 | Staff ki lists, chhupi jaankari aur staff kam hone pe faisla                      | 3      | M (2)  | Baaki |
| ST-4 | Seller Ops: manzoori, GSTIN, dastavez aur appeal                                  | 4      | L (4)  | Baaki |
| ST-5 | Category Manager: category tree, attributes, HSN aur synonyms                     | 5      | M (2)  | Baaki |
| ST-6 | Listing ki jaanch, ingredients ki list, blocklist aur appeal                      | 5      | L (4)  | Baaki |
| ST-7 | Brand Protection aur licence ke niyam                                             | 5      | S (1)  | Baaki |
| ST-8 | Fraud & Risk ke signals                                                           | 10     | S (1)  | Baaki |
| ST-9 | Review ki moderation                                                              | 11     | M (2)  | Baaki |
|      | **Kul**                                                                           |        | **22** |       |

## Change log

| Version | Date       | Badlav                                                                 |
| ------- | ---------- | ---------------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 18 ka pehla spec aur 9 subtasks (D-446, D-451); code abhi nahi. |
