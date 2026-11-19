# PROJECT PLAN: Beautinique

> **Status:** v1.1.5 (2026-11-19). Project ki kendriya file. Cheezein ek-ek karke, owner ki haan ke baad judti hain.

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

1. **Area:** poore India ka location data import; Maharashtra → Pune → warehouse wala sub-district live, 1 warehouse + 1 hub (D-014, D-015, D-016, D-022). Unserved pincode pe "unavailable" aur notify-me waitlist me judna (D-046). Area khulne ki khabar in-app aur push se (D-141).
2. **Staff aur roles:** sirf in flows ke roles chalu (D-017, D-054), owner ke alag accounts ke saath; staff ke kaam audit log me. Return, daawe aur refund ki manzoori ke liye Support Desk app ka patla hissa, Support Agent role ke saath (D-105); customer ki appeal ke liye Support Lead (D-147). Reviews ke liye Review Moderator (D-136).
3. **Sellers:** 2 sellers: apna brand (alag dummy company, D-031) aur ek dummy brand. Onboarding dummy KYC aur Maharashtra GSTIN ke saath (D-036); staff ki approval.
4. **Catalog:** seller products daale (shade aur size jaise variants, MRP, price, HSN aur GST rate, images); staff ki jaanch ke baad live. Customer ke liye list, product page, basic search aur filter. Ingredients text + label photo se, INCI structured list, free-from filters aur allergen ki chetavni (D-099, D-159). Skin type, concern aur active % ke fields (D-137); filters, sort aur kram (D-138, D-139); zero result pe madad (D-152); stock khatam product neeche dikhe (D-153); sirf sach aankde (D-154). Test wale claims saboot ke saath hi (D-224); har kate MRP ya "% off" ke saath pichhle 30 din ka sabse kam daam (D-223).
5. **Maal warehouse me:** seller maal bheje; receiving pe batch aur expiry ki jaanch (D-014); stock dikhe.
6. **Customer:** sign-up sirf 18+ (D-038), sign-in ke teen raaste (D-021); pincode check; cart aur wishlist sign-in ke saath (D-020); address. Live site pe account sirf allowlist se (D-133); legal pages aur sign-up ka consent (D-150); profile sudhaar, marketing consent band aur account delete (D-151); delete pe jaari invoice alag tax archive me (D-225).
7. **Checkout aur payment:** Razorpay test mode (prepaid) aur delivery pe UPI QR (D-034); stock reservation; ek order me dono sellers ke items ho sakein, invoice har seller ke GSTIN se (D-030, D-041).
8. **Fulfilment:** warehouse me pick aur pack; hub tak trip ka record (D-027); hub pe receive; delivery partner ko assign; Delivery app (PWA, D-042) se delivery aur proof. Order ka status customer ko in-app aur email se.
9. **Return aur refund:** customer return maange (abhi simple niyam: sirf band ya kharab maal; cosmetics ke poore niyam domain charcha ke baad), delivery partner pickup kare (D-014), warehouse me jaanch, refund (Razorpay test mode). Muddatein invoice aur pages pe likhi (D-221); "der se pahuncha" bhi return ki wajah (D-222).
10. **Review:** delivery ke baad verified purchase review (D-039): ek customer, ek product, ek review (D-135); moderation (D-136, D-146); photo ke saath (D-155); nakli review ke niyam 1 aur 5 (D-156); inaam nahi (D-158). Har review pe us waqt ka listing version (D-171); seller apne products ke reviews seller app me dekhe (D-160).
11. **Paisa:** finance service (PostgreSQL, D-001) me har seller ka hisaab: order value, commission, GST TCS, income-tax TDS. Payout haath se "paid" mark hota hai, asli bank transfer nahi. Seller ki reports aur settlement CSV (D-143, D-144).
12. **Chalana:** backup command (D-013) aur free tier ki zaroori handling (D-028); emails ki line aur chhat (D-140, D-142); owner ke aankde (D-149) business events se (D-157); demo aur dummy ka nishaan (D-145); kanooni areas ki gehrai (D-134).

**Bahar (R2 aur aage):**

- Promotions, coupons aur bundles; loyalty points aur referral (D-173 se D-176); dobara kharid ki yaad (D-178). Store credit nahi (D-177); gift cards aur subscriptions kanooni jaanch ke baad (D-178, D-179).
- Virtual try-on, shade finder, beauty profile aur recommendations (D-165, D-166, D-168, D-169); Beauty Advisor aur consultation (D-025, D-172).
- Support desk ke tickets, SLA, grievance aur disputes (D-161 se D-164; R1 me sirf patla hissa, D-105).
- Reviews ke R2 hisse: brand ka jawab, reviewer ki skin jaankari, Q&A, formula badla label (D-160, D-167, D-170, D-171).
- Growth Studio aur Creator ke kaam; Beauty Pro buyers ke kaam.
- Zyada sellers, zyada hubs, naye districts aur states (setting se, D-037).
- Transporter ke bill ki finance entry aur finance ki poori reports.

**Note:** har module ki detail (screens, fields, niyam) domain charcha ke baad us module ki `TASK.md` me aayegi. Usme R1 ke liye kuch aur zaroori nikla to R1 owner ki haan se badlega.

## Change log

| Version | Date       | Badlav                                                                                                                                                                           |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                                                                                |
| v1.1.1  | 2026-11-17 | §1 Releases bana; R1 ka scope (D-055).                                                                                                                                           |
| v1.1.2  | 2026-11-18 | R1 me jod (owner): ingredients ki structured list aur filters (D-099), Support Desk ka patla hissa (D-105).                                                                      |
| v1.1.3  | 2026-11-19 | R1 me jod (owner): skin type aur concern ke fields (D-137), Support Lead appeal (D-147), review photo (D-155); R1 hisson me D-133 se D-159 ke niyam.                             |
| v1.1.4  | 2026-11-19 | R1 review me listing version aur seller ka reviews dekhna (D-160, D-171); "Bahar" me R2 ke naye faisle (D-160 se D-179).                                                         |
| v1.1.5  | 2026-11-19 | R1 me kanooni jaanch se jod (owner): test claims ka saboot (D-224), 30 din ka daam (D-223), tax archive (D-225), der se delivery ka return (D-222); return ki muddatein (D-221). |
