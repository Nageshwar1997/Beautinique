# PROJECT PLAN: Beautinique

> **Status:** v1.1.1 (2026-11-17). Project ki kendriya file. Cheezein ek-ek karke, owner ki haan ke baad judti hain.

## 0. Is file me kya aayega

- Project ek nazar me (lakshya, ek paragraph).
- Modules ki list: har module ki ek line aur uske `tasks/<nn-module>/TASK.md` ki link.
- Modules ki dependencies: kaunsa module kis pe tika hai.
- Releases (R1, R2 ...): kis release me kya (§1).
- Progress % aur uska hisaab.
- Zaroori faislon ki links ([DECISIONS.md](DECISIONS.md)); faisle yahan dobara nahi likhe jaate.

## 1. Releases

Design poore ecosystem ka, banana releases me; koi feature kata nahi (D-008). Jo R1 me nahi, wo R2 aur aage aata hai.

### R1: pehla poora order (D-055)

**Lakshya:** ek customer ka order shuru se aakhir tak, asli jaisa chale: area khulna → seller → product → maal warehouse me → order → payment → delivery → return aur refund → review → seller ka hisaab. Har hissa chhote roop me, par poora chalta hua.

**Andar:**

1. **Area:** poore India ka location data import; Maharashtra → Pune → warehouse wala sub-district live, 1 warehouse + 1 hub (D-014, D-015, D-016, D-022). Unserved pincode pe "unavailable" aur notify-me waitlist me judna (D-046).
2. **Staff aur roles:** sirf in flows ke roles chalu (D-017, D-054), owner ke alag accounts ke saath; staff ke kaam audit log me.
3. **Sellers:** 2 sellers: apna brand (alag dummy company, D-031) aur ek dummy brand. Onboarding dummy KYC aur Maharashtra GSTIN ke saath (D-036); staff ki approval.
4. **Catalog:** seller products daale (shade aur size jaise variants, MRP, price, HSN aur GST rate, images); staff ki jaanch ke baad live. Customer ke liye list, product page, basic search aur filter.
5. **Maal warehouse me:** seller maal bheje; receiving pe batch aur expiry ki jaanch (D-014); stock dikhe.
6. **Customer:** sign-up sirf 18+ (D-038), sign-in ke teen raaste (D-021); pincode check; cart aur wishlist sign-in ke saath (D-020); address.
7. **Checkout aur payment:** Razorpay test mode (prepaid) aur delivery pe UPI QR (D-034); stock reservation; ek order me dono sellers ke items ho sakein, invoice har seller ke GSTIN se (D-030, D-041).
8. **Fulfilment:** warehouse me pick aur pack; hub tak trip ka record (D-027); hub pe receive; delivery partner ko assign; Delivery app (PWA, D-042) se delivery aur proof. Order ka status customer ko in-app aur email se.
9. **Return aur refund:** customer return maange (abhi simple niyam: sirf band ya kharab maal; cosmetics ke poore niyam domain charcha ke baad), delivery partner pickup kare (D-014), warehouse me jaanch, refund (Razorpay test mode).
10. **Review:** delivery ke baad verified purchase review (D-039).
11. **Paisa:** finance service (PostgreSQL, D-001) me har seller ka hisaab: order value, commission, GST TCS, income-tax TDS. Payout haath se "paid" mark hota hai, asli bank transfer nahi.
12. **Chalana:** backup command (D-013) aur free tier ki zaroori handling (D-028).

**Bahar (R2 aur aage):**

- Promotions, coupons aur bundles; loyalty, gift cards aur store credit; subscriptions.
- Virtual try-on, recommendations; Beauty Advisor aur consultation (D-025).
- Support desk, tickets aur disputes.
- Growth Studio aur Creator ke kaam; Beauty Pro buyers ke kaam.
- Zyada sellers, zyada hubs, naye districts aur states (setting se, D-037).
- Transporter ke bill ki finance entry aur finance ki poori reports.

**Note:** har module ki detail (screens, fields, niyam) domain charcha ke baad us module ki `TASK.md` me aayegi. Usme R1 ke liye kuch aur zaroori nikla to R1 owner ki haan se badlega.

## Change log

| Version | Date       | Badlav                                 |
| ------- | ---------- | -------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                      |
| v1.1.1  | 2026-11-17 | §1 Releases bana; R1 ka scope (D-055). |
