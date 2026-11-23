# TASK 25: Growth Studio app (marketing aur growth ki team)

> **Status:** v1.0.1 (2026-11-23). Halat: planning (R2); code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `25-app-growth-studio`, R2 (D-055, D-446). Progress: 0 / 23 points (sirf ecosystem ke % me).

> **R2 ka draft:** ye `TASK.md` R2 ke tay faislon se abhi bani hai; R2 ki planning me iske features, subtasks aur sizes badal sakte hain (owner, 2026-11-22; D-454).

## 1. Lakshya

Marketing aur growth ki andar ki team ka app: storefront ke banners aur collections, offers aur coupons budget ke andar, points aur referral, dobara kharid ki yaad consent ke andar, creators ki manzoori, Beauty Pro ke niyam, aur sponsored jagah saaf label ke saath. Koi dark pattern nahi, aur kisi seller ka chhupa boost nahi (DS-1.5, D-139).

## 2. Scope

**Andar:** `frontend/growth-studio` app (SPA, D-290; Vercel ka apna project, D-010): Marketing Head, Storefront Merchandiser, Promotions & Coupon Manager, Loyalty Manager, CRM & Lifecycle Manager, Content Editor, Creator & Affiliate Manager, Pro & B2B Programme Manager aur Retail Media Manager ([PRODUCT.md](../../PRODUCT.md) §3.2).

**Bahar:**

- Offers, coupons, points, referral aur creators ka data: inka maalik service abhi tay nahi (R2 ki planning me tay; D-444 niyam 5).
- Pro daam aur sponsored ka data: `11-catalog`. Khabrein: `07-notify`. Points aur offers ki entries: `14-finance` ([ARCHITECTURE.md](../../ARCHITECTURE.md) §1.3).
- Gift cards: kanooni jaanch aur RBI-authorised PPI issuer ke baad (D-179, D-249; OWNER_TASKS §3). Store credit nahi (D-177). Subscriptions baad me (D-178).

## 3. Functional requirements

1. **Dhaancha aur sign-in:** staff ka sign-in authenticator ke saath; DESIGN ka staff data-dense parivaar (DS-5.6). Marketing Head shuru me Master ka alag account (D-047).
2. **Marketing Head:** marketing ka calendar, budget aur ads ki shartein.
3. **Storefront Merchandiser:** banners aur collections; daam, MRP ya coupons nahi badal sakta.
4. **Offers aur coupons:** offer ka paisa brand, platform ya dono (hissa % aur budget) (D-101); ek order pe ek coupon, sale daam + coupon chale, Pro daam pe coupon nahi (D-102); GSTIN wale orders pe platform ke offers aur points nahi (D-279); budget ki seema; har MRP ke saath 30 din ka sabse kam daam ka niyam waisa hi (D-223).
5. **Loyalty aur referral:** points (misaal ₹100 pe 1 point, 1 point = ₹1), sirf platform pe kharch, return window ke baad pakke, misaal 12 mahine me expire, order ka misaal 20% tak, review pe points nahi (D-173, D-174, D-175); referral rok ke saath, dono ko inaam pehle order ke return window ke baad (D-176).
6. **Dobara kharid ki yaad:** "dobara order" aur in-app ya push ki yaad, consent ke andar, bina pehle ke payment (D-178, D-141).
7. **Creators:** creators ki manzoori, commission aur disclosure ki jaanch (D-055).
8. **Beauty Pro:** Beauty Pro ke niyam aur Pro daam (D-065, D-069).
9. **Retail media:** sponsored jagah, saaf label aur seema ke saath; search ke kram me seller ka boost nahi (D-139).
10. **Content Editor:** beauty ke lekh aur tutorials.

## 4. Niyam

1. Har offer, coupon aur points ka badlav audit me; fees, commission aur policies jaisa ek account badle aur doosra manzoor kare ([ARCHITECTURE.md](../../ARCHITECTURE.md) §11 niyam 6.4).
2. Marketing ki khabar sirf opt-in se (D-141).
3. Customer ki pehchaan wali lists chhupi (SR-039).

## 5. Data model aur API

App ka apna data nahi; maalik services ke routes se (R2 ki planning ke baad), `frontend-api-client` ke typed client ke saath (CR-27).

## 6. Security

SR-085 (coupons, points aur gift cards ki redemption ka race), SR-039, SR-043, SR-076; staff app ke saajhe niyam.

## 7. Dependencies

- **Tika hai:** `03-frontend-kit`, `08-identity`, `09-gateway`, `11-catalog`, `07-notify`, `14-finance`, aur R2 ke features ka maalik service (R2 ki planning me tay).
- **Owner ke kaam:** Growth Studio ka Vercel project; gift card issuer se poochhna (OWNER_TASKS §3) gift cards se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md)).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §4 ka R2 ka chhota khaka (apps ke saajhe criteria; coupons aur points); poore criteria R2 ki planning me.
- **Manuals:** `manuals/growth-studio/<ROLE_NAME>.md` ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/GROWTH_STUDIO.md](../../testing/GROWTH_STUDIO.md) (DD-13).

## 9. Subtasks

Saare R2 me ([PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5). Sizes R2 ki planning me dobara dekhe jaayenge. Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                               | Charan | Size   | Halat |
| ----- | --------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1  | App ka dhaancha, staff ka sign-in, Vercel project, manual aur testing | R2     | L (4)  | Baaki |
| ST-2  | Marketing Head: calendar, budget aur ads ki shartein                  | R2     | M (2)  | Baaki |
| ST-3  | Storefront Merchandiser: banners aur collections                      | R2     | M (2)  | Baaki |
| ST-4  | Offers aur coupons                                                    | R2     | L (4)  | Baaki |
| ST-5  | Loyalty aur referral                                                  | R2     | M (2)  | Baaki |
| ST-6  | Dobara kharid ki yaad                                                 | R2     | M (2)  | Baaki |
| ST-7  | Creators ki manzoori, commission aur disclosure                       | R2     | M (2)  | Baaki |
| ST-8  | Beauty Pro ke niyam aur Pro daam                                      | R2     | M (2)  | Baaki |
| ST-9  | Retail media: sponsored jagah                                         | R2     | M (2)  | Baaki |
| ST-10 | Content Editor: lekh aur tutorials                                    | R2     | S (1)  | Baaki |
|       | **Kul**                                                               |        | **23** |       |

## Change log

| Version | Date       | Badlav                                                                                   |
| ------- | ---------- | ---------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 25 ka pehla spec aur 10 subtasks (R2, D-446, D-454); R2 ka draft; code abhi nahi. |
| v1.0.1  | 2026-11-23 | Gift card ka owner wala kaam OWNER_TASKS §3 me (R2).                                     |
