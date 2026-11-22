# FLOWS: Beautinique

> **Status:** v1.1.6 (2026-11-22). Poore flows jo kai modules me chalte hain (jaise order se delivery, return se refund): §1 se §6, 20 flows. Cheezein ek-ek karke, owner ki haan ke baad judti hain.

## Is file me kya aayega

Har flow ke liye:

- Naam aur kaun shuru karta hai.
- Steps, aur har step kis module me (us module ke `TASK.md` ki link).
- Kuch fail ho to kya hota hai.

Module apna kaam apni `TASK.md` me likhta hai; yahan sirf ye ki flow modules ke beech kaise chalta hai.

Har flow ka id `FL-<n>`. Har step ke saath module (`identity`, `notify`, `payments`, `catalog`, `commerce`, `logistics`, `finance`, `support`, `audit`, `media`; [ARCHITECTURE.md](ARCHITECTURE.md) §2) aur app; module ki `TASK.md` ki link tab judegi jab task files banen. Har staff ka likhne wala kaam `audit` me jaata hai (SR-076); har flow me ye dobara nahi likha. "Khabar" ka matlab in-app + browser push; email sirf jahan faisla kehta hai (D-126, D-131, D-140, D-141). "Misaal" wale numbers settings me.

## 1. Account aur sign-in

**FL-1. Customer ka sign-up.** Shuru: customer (Customer app).

1. Email, password (ya social, ya email code) aur 18+ ki ghoshna; Data notice alag screen pe, consent se pehle; Terms aur Privacy; marketing opt-in alag aur khaali (identity; D-038, D-255, CL-072, CL-089).
2. Allowlist ki jaanch, har raaste pe ek hi function se (identity; D-133, SR-018).
3. Email pe code; jawab registered aur anjaan email pe ek jaisa (identity, notify; SR-015, SR-019).
4. Code sahi: account bana, har consent ka record (notice ka version, samay, raasta) (identity; CL-089).

**Fail ho to:** allowlist ke bahar: "demo store" ka sandesh (SR-019); code ki seema: saaf sandesh (SR-020); galat code 5 baar: naya code maango (SR-015); leak hua password: "This password has appeared in a data breach" (SR-013); social provider ka email verified nahi: maujooda tareeke se sign-in pehle (SR-017).

**FL-2. Customer ka sign-in.** Shuru: customer (Customer app).

1. Teen raaste: password, social (Google, LinkedIn, GitHub), ya email code (identity; D-021).
2. Account pe authenticator laga ho to uske baad authenticator ka code bhi (identity; D-021, SR-015).
3. Session 30 din aage, zyada se zyada 90 din; "My devices" me har session (identity; D-180).

**Fail ho to:** galat password ya code pe rok (D-182), rok ke dauraan bhi reset chalta (SR-014); server soya ho to pehle jaagne ka parda ([DESIGN.md](DESIGN.md) DS-6.9); naya device: security event (SR-077).

**FL-3. Staff ka sign-in aur bada kaam.** Shuru: staff (7 staff apps).

1. Invite se account (ek baar ka, misaal 72 ghante), accept pe authenticator lagana aur 10 recovery codes (identity; SR-022, SR-025).
2. Har sign-in pe password + authenticator (identity; SR-011). Session 12 ghante, 30 minute bina kaam pe band, 2 minute pehle chetavni (identity; D-181, DS-6.10).
3. D-185 ki list ke kaam pe StepUpDialog, misaal 5 minute ki khidki (identity; SR-026).

**Fail ho to:** authenticator kho gaya: recovery code, phir Master se reset (D-200); Master ka reset recovery codes ya laptop ka break-glass command (D-200).

**FL-4. Delivery partner ka sign-in.** Shuru: partner (Delivery app).

1. Email aur password; pehli baar Data notice aur location ka consent (identity; D-183, D-254).
2. Phone ko Hub Manager manzoor kare (Logistics Ops app); session usi phone pe, misaal 14 din (identity; D-183).

**Fail ho to:** doosra phone: phir manzoori; phone kho gaya: Hub Manager ek click se session band kare (SR-023).

**FL-5. Customer ka account delete.** Shuru: customer (Customer app, Account → Privacy).

1. Dobara pehchaan (identity; SR-016); screen pe kya hatega aur kya rahega (tax archive, review "Deleted customer"), aur "Also delete my reviews" ka vikalp, pehle se tick nahi (D-225, D-305, D-438).
2. Email aur in-app khabar; misaal 7 din me wapas le sakta hai (identity, notify; SR-066).
3. 7 din baad ek event se har service apni copy hataye ya pehchaan hataye; sessions, push subscriptions, waitlist bhi (saari services; SR-066, D-250).

**Fail ho to:** khula order, return ya refund ho to delete ruka, wajah ke saath (D-151 niyam 1: delete chalte orders, returns aur refunds ke baad); kisi service ka handler fail: retry aur dead letter (ARCHITECTURE §3), owner ke inbox me.

## 2. Browse se order aur payment

**FL-6. Area, pincode aur waitlist.** Shuru: customer (Customer app) ya staff (Admin, Super Admin, Master).

1. Customer pincode daale; pincode se theek ek hub (logistics; D-016). Live ho to delivery ka vaada (D-117), na ho to "unavailable" aur notify-me waitlist (logistics; D-046).
2. Staff switch: Admin hub, Super Admin district, Master state; live tabhi jab sharten poori (logistics; D-015).
3. Area live hone pe waitlist walon ko khabar; email sirf push band walon ko, "baaki" ki chhat me (notify; D-141).

**Fail ho to:** area band ho raha ho: pehle checkout pe rok ka event, phir band; parcel banate waqt band area ka order ruke, cancel aur refund (commerce, logistics; D-300).

**FL-7. Cart se prepaid order.** Shuru: customer (Customer app).

1. Cart (sirf sign-in ke saath, D-020); cart me stock nahi rukta, sirf "kam stock" (commerce; D-118 niyam 3).
2. Checkout: address (pincode serviceable), delivery ka vaada, payment ka tareeka, har line ka batch ka MRP aur expiry, poora breakup alag lines me (commerce, catalog; D-067, D-107, D-345).
3. "Place order": client sirf variant aur quantity bheje; server daam, MRP, fee, tax, seema aur serviceability nikale; ek transaction me order aur batch ke level pe stock ka reservation (FEFO), idempotency key ke saath (commerce; SR-044, SR-045, ARCHITECTURE §10.5).
4. Payment screen (alag HTML document, poore page ka load; SR-090): server gateway ka order exact rakam se banaye; 15 minute (misaal) ka timer (payments; SR-048, D-118).
5. "Paid" sirf signature ki jaanch ya webhook se; browser ka "success" sirf screen ke liye (payments; SR-048).
6. Order pakka: confirmation email delivery code ke saath (paise ki line), in-app khabar; push ki ijazat ka card (D-346) (notify; D-126, D-302).
7. Finance ko events har 15 minute ke batch me (finance; D-288).

**Fail ho to:** server ka total dikhe total se alag: order nahi, naya total dikhao (SR-044); stock nahi: us line pe "Out of stock" aur baaki ke saath aage badhne ka raasta ([DESIGN.md](DESIGN.md) DS-6.6, 409/422); payment fail: Payment screen pe "Try again" (idempotent retry, ARCHITECTURE §5 niyam 10) ya doosra tareeka; 15 minute baad payment aaye aur stock ho to order pakka, warna apne aap poora refund aur khabar (D-118); paisa kata par order nahi bana: D-256 ki screen aur email, der se "captured" pe apne aap refund, sirf ek baar (D-111 jod); soya server pe webhook der se: gateway ki dobara koshish aur roz ka milaan (ARCHITECTURE §5 niyam 14); checkout ka kill switch: PausedBanner, cart bacha (SR-009).

**FL-8. Delivery pe UPI wala order.** Shuru: customer (Customer app).

1. Tareeka tabhi dikhe jab area me on ho, rakam seema me (misaal ₹3,000; naye customer ke pehle order pe ₹1,500) aur ek waqt me khule aise orders misaal 2 se kam (commerce; D-109, D-204, D-203).
2. "Place order" pe stock ruka rehta hai, payment delivery pe (commerce; D-118 niyam 4).
3. Confirmation email delivery code ke saath; code door pe payment ke baad hi chalta hai (notify, logistics; D-109 niyam 4).

**Fail ho to:** customer 2 baar (misaal) mana kare ya payment na kare: uske liye ye tareeka band, staff wajah ke saath khol sake (D-109 niyam 2); tareeka na dikhne ki wajah checkout pe ek line me ("Pay on delivery is not available for this order").

## 3. Order se delivery

**FL-9. Pack se delivery tak.** Shuru: system (order pakka hone pe).

1. Warehouse me pick (FEFO batch, bin scan) aur pack, teen kadam me; pack ki photo; kai sellers ka maal normal ek parcel me, har seller ka invoice andar (commerce, Logistics Ops app; D-077, D-106, ARCHITECTURE §10.5). Pack pe invoice turant (finance; D-288); invoice ka email saar ke saath (notify; D-289).
2. Warehouse se hub ka trip: manifest aur seal number; hub pe receive scan, ginti ka farak apne aap nishaan (logistics; D-027, SR-057).
3. Hub Manager ya Hub Operations partner ko assign kare; partner ke phone pe us shift ke parcels ka kam data (logistics; SR-023).
4. "Out for delivery": customer ko khabar; order page pe DeliveryCodeCard sabse upar (notify, commerce; D-195, D-343).
5. Door pe: delivery pe UPI ho to server QR banaye exact rakam ka (test mode me hamare Payment page ka link, live me Razorpay ka QR; D-418); "paid" sirf webhook se, customer ke app me "Payment received", partner ke app me "paid" karne ka koi button nahi (payments; SR-050).
6. Code wali delivery (online hi): partner customer ka 6 ank ka code daale; milaan server pe; usi pal partner ki location (logistics; D-072, D-254, D-301, SR-054).
7. Code na mile (customer ghar pe nahi, koi aur le raha): parcel ki photo app ke camera se aur location; server ka samay, accuracy, address ke pin se doori ka nishaan, photo ka hash (logistics, media; D-072 niyam 2, SR-055; D-347, D-351).
8. "Delivered": khabar; daawe ki khidki shuru (code se 48 ghante, photo wali pe misaal 7 din) (commerce, notify; D-148); finance ko delivered ka event (D-319).

**Fail ho to:** pick pe maal toota ya kam: barabar batch ho to badlo, warna customer se poochho (khabar; push band ho to email, D-131), jawab na aaye to line cancel aur refund (D-090); Neon band ya finance ruka: pack ruka, checkout ka kill switch (OPERATIONS §8 niyam 8); code 5 baar galat: code daalna band, Hub Manager khole (SR-054); network nahi: code wali delivery nahi, partner intezaar kare ya Hub Manager se baat (D-301); door pe UPI network se fail: 10 minute (misaal) tak QR dobara, phir "attempt fail" (D-109 niyam 3).

**FL-10. Delivery fail aur RTO.** Shuru: partner (Delivery app).

1. Fail ki wajah (ghar band, address galat, customer ne mana kiya) aur usi pal location (logistics; D-108, D-254).
2. Customer ko khabar aur agla din chunne ka option; push band ho to email (notify; D-108 niyam 1, D-126).
3. Do koshish (misaal); hub pe zyada se zyada 3 din (misaal); phir RTO; saaf mana pe seedha RTO (logistics; D-108).
4. RTO ka hub scan: prepaid ka poora refund shuru (payments; D-108 niyam 4, D-111). Customer ki galti wale RTO pe delivery fee wapas nahi (D-108 niyam 6).
5. Warehouse me receiving jaisi jaanch, phir stock (commerce; D-108 niyam 5).

**Fail ho to:** refund fail (jaise khaata band): staff ka haath ka raasta (Support Lead + Finance, D-188) aur customer ko khabar (D-111 niyam 3); hub pe 3 din ki ginti Logistics Ops ki list me laal.

## 4. Cancel, return, daawa aur refund

**FL-11. Cancel.** Shuru: customer (Customer app, order detail).

1. Pack se pehle poora order, item ya quantity; ConfirmDialog me refund ki rakam (commerce; D-110).
2. Stock wapas, line ke hisaab se; koi cancel fee nahi; baad me delivery fee nahi lagti (commerce; D-110).
3. Prepaid ka refund turant original raaste; halat in-app aur email (payments, notify; D-111).

**Fail ho to:** pack ho chuka: "Cancel" ki jagah "Packed: you can refuse at the door" (D-110 niyam 1); pack aur cancel ek saath: server ki halat jeetti hai, 409 pe taaza halat ([DESIGN.md](DESIGN.md) DS-6.6).

**FL-12. Return se refund.** Shuru: customer (Customer app, order detail; R1 me D-055 ka simple roop).

1. Wajah chune (D-079); muddat wajah se (misaal 30 din galti pe, 7 din man badla, 48 ghante saboot ka niyam dikhne wali galti pe) (commerce; D-221); man badla sirf seal wale band maal pe (D-079).
2. Toote, galat ya kam item pe photo zaroori (item, batch label, damage; kam item pe parcel aur packing), video optional (media; D-106).
3. Wajah aur saboot poore: apne aap manzoor; warna Support Agent tay kare, apni seema (misaal ₹2,000 ek maamla, ₹10,000 din) tak; upar Support Lead (support, Support Desk app; D-105, D-188).
4. Pickup partner kare: item ki photo, label ka batch order ke batch se milaye, man badla me seal dekhe (logistics, Delivery app; D-113).
5. Warehouse me jaanch (Returns QC, Logistics Ops app), nateeja wajah ke hisaab se stock ya nuksaan (commerce; D-112).
6. Refund jaanch ke baad, original raaste (payments; D-115, D-111): man badla pe return fee (misaal ₹49) kat ke aur delivery fee wapas nahi; hamari ya brand ki galti pe muft aur delivery fee wapas (D-114). R1 me sirf refund (D-122).
7. Seller ke statement me line ka asar; fees wajah ke hisaab se (finance; D-277).

**Fail ho to:** mel na khaye (batch alag, seal toota): pickup nahi, wajah ke saath khabar (D-113); muddat ke baad: support ka raasta, seedha mana nahi (D-221 niyam 5); reject: ek appeal (FL-14); "der se pahuncha": door pe mana to poora refund, baad me 7 din (misaal) bina kharche (D-222).

**FL-13. "Parcel nahi mila" ka daawa.** Shuru: customer (Customer app, order detail).

1. Order detail pe delivery ka saboot dikhe: "Delivered with your code at <samay>" ya "Delivered with photo"; photo sirf customer ko, D-191 ke hisaab se (logistics, media).
2. Code se delivered: daawa nahi maana jaata; screen pe ye saaf, aur grievance ka raasta (D-072 niyam 3, D-163).
3. Sirf photo aur location: misaal 7 din me daawa; Support jaanch kare (support; D-072, D-148).
4. Koi saboot nahi: refund (R1 me dobara maal nahi, D-122), aur partner ki jaanch D-068 ke hisaab se (support, logistics).
5. Baar-baar daawa karne wale aur baar-baar maamle wale partner ka record aur nishaan (support; D-072 niyam 4, SR-058).

**Fail ho to:** khidki ke baad: support ka raasta (D-221 niyam 5 jaisa) ya grievance; reject: FL-14.

**FL-14. Appeal.** Shuru: customer (reject ke baad, misaal 7 din me).

1. Ek appeal, ek baar (support; D-147).
2. Faisla Support Lead kare, jisne reject nahi kiya (support; D-147, D-084 niyam 3 jaisa).
3. Nateeja in-app aur email (refund ho to paise ki line) (notify).

**Fail ho to:** appeal ke baad bhi asehmat: Grievance page aur Grievance Officer (D-163; poora raasta R2).

## 5. Seller: onboarding, listing, maal aur payout

**FL-15. Seller onboarding.** Shuru: seller (Seller app).

1. Sign-up allowlist se (identity; SR-018); Account Owner pe authenticator (identity; D-184).
2. Brand owner ya authorised distributor ka saboot, ek brand ek seller (catalog; D-032, D-075); dastavez (dummy KYC), warehouse state ka GSTIN (D-036); seller ka block (naam, pata, customer care, grievance officer) zaroori (D-238); seller agreement (version) aur undertaking accept (D-150, D-240).
3. Bank details dobara code ke saath, screen pe aakhri 4 ank (finance; SR-052).
4. Seller Ops ki ek team manzoor kare (Admin app; D-084 niyam 1) (jaanch §7).

**Fail ho to:** reject wajah ke saath, seller sudhaare; appeal us insaan se alag (D-084 niyam 3); seller ka block adhoora: seller live nahi (D-238); doosre state ka GSTIN: chetavni (D-239).

**FL-16. Listing se live.** Shuru: seller (Seller app).

1. Product aur variants (category ke hisaab se, zyada se zyada 2) (catalog; D-076); shade ka naam, swatch photo aur hex (D-085); HSN allowed list se (D-086); MRP aur daam ke niyam, bade badlav pe dobara confirm (D-061, D-087); ingredients text + label photo (D-099); claims tay list se, test wale saboot ke saath (D-224); licence ka type (D-128); imported ke fields (D-127); pack ki jaankari (CL-026).
2. Submit: listing ki team (category ke hisaab se) jaanche (Admin app; D-084 niyam 2); INCI list staff jaanche (D-099).
3. Live ke baad jokhim wale fields ka har badlav dobara jaanch, baaki turant live aur spot check; staff khud field nahi badalta (catalog; D-098).
4. Har review pe us waqt ka listing version (catalog; D-171).

**Fail ho to:** reject wajah ke saath field pe; galat declaration ki report pe listing jaanch tak ruki (CL-026); blocklist ka ingredient: submit hi nahi (D-128).

**FL-17. Maal warehouse me.** Shuru: seller (Seller app).

1. Shipment ki pehle se suchna (ASN): variants, batch, expiry, quantity (commerce; D-096).
2. Receiving: batch aur expiry ki jaanch (D-082, D-083), barcode na ho to platform ka label khaali jagah pe (D-097, D-230); farak photo ke saath seller ko (commerce, Logistics Ops app; D-096).
3. "Accept" scan: zimmedari aur storage fee shuru; stock dikhne laga (commerce; D-096, D-066).

**Fail ho to:** expiry seema se kam ya sirf PAO wala maal: wapas (D-083); farak: seller ko photo ke saath; dispute R2 (D-164).

**FL-18. Payout.** Shuru: system (hafte me ek baar, misaal Monday).

1. Line payable jab uski sabse lambi return khidki khatam ho aur koi return khula na ho (finance; D-081 niyam 1, D-369: man badle wali return muddat, misaal 7 din; uske baad aayi kharab maal wali return D-071 ke udhaar se).
2. Finance batch banaye: pehle udhaar aur fees katein, bharpai jude; kam se kam rakam (misaal ₹100) se kam to agle hafte (finance, Finance app; D-081).
3. Master ka doosra account dobara code ke saath manzoor kare; ek account dono kaam nahi (Master app; D-189).
4. R1 me "paid" haath se mark, asli bank transfer nahi (finance; PROJECT_PLAN §1).
5. Seller ko har line ki halat (kab payable, kis payout me), statement aur CSV (Seller app; D-081 niyam 5, D-143, D-144).

**Fail ho to:** bank badla: naye khaate pe misaal 72 ghante payout nahi (D-190); payout pe kill switch ki rok (SR-009); udhaar seema paar: alert aur aage ke kadam (D-071, D-103).

## 6. Reviews

**FL-19. Review likhna.** Shuru: customer (Customer app, delivered order ya product page).

1. Haq: delivered item (lauta item bhi), cancel aur RTO nahi; ek customer, ek product, ek review; misaal 365 din; ₹0 line pe nahi; brand ka staff apne product pe nahi (commerce, catalog; D-135, D-156, D-158).
2. Star, text, misaal 3 photos tak, chehre pe ijazat ka tick (media; D-155).
3. Star turant; text apne aap ki jaanch se; photo aur atka review Review Moderator ki queue me (catalog, Admin app; D-136).
4. Review pe "Verified purchase" aur us waqt ka listing version (catalog; D-171).

**Fail ho to:** chhupane ki tay list ke bahar koi wajah se nahi chhupta (D-146); ilaaj ke kanoon wale daawe "kanoon ke khilaaf daawa" se chhupe (D-263); customer ko halat in-app me.

**FL-20. Review ki report.** Shuru: signed-in user (Customer app).

1. Report ki wajah; ek account din me misaal 10 (catalog; SR-060).
2. Queue: receipt 24 ghante; nagnata wali report pe turant chhupna aur 2 ghante; baaki 36 ghante; hal 7 din (catalog, Admin app; D-251).
3. Appeal doosra moderator tay kare (D-146).

**Fail ho to:** seema ke upar report mana (SR-060); "personal data" wali report 24 ghante me tay na ho to alert (SR-060).

## Change log

| Version | Date       | Badlav                                                                                                                                                                     |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                                                                          |
| v1.1.1  | 2026-11-21 | §1 se §6 aaye: account aur sign-in, browse se order aur payment, order se delivery, cancel, return, daawa aur refund, seller ke flows, reviews (20 flows; D-362 se D-367). |
| v1.1.2  | 2026-11-21 | FL-18 step 1 me payable ki muddat (D-369).                                                                                                                                 |
| v1.1.3  | 2026-11-21 | FL-7 kadam 4: Payment alag document (security review batch 1, D-408).                                                                                                      |
| v1.1.4  | 2026-11-22 | FL-5: khule order wali jaanch D-151 niyam 1 se poori.                                                                                                                      |
| v1.1.5  | 2026-11-22 | FL-9 kadam 5: test mode me QR me Payment page ka link (D-418).                                                                                                             |
| v1.1.6  | 2026-11-22 | FL-5 kadam 1: "Also delete my reviews" ka vikalp (D-438).                                                                                                                  |
