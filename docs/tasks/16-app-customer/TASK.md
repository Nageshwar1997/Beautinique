# TASK 16: Customer app (storefront)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `16-app-customer`; charan 2 se shuru, har screen apne charan me (D-446). Progress: 0 / 35 points.

## 1. Lakshya

Customer ka poora safar: pincode se pata chale ki delivery hoti hai ya nahi, products dhoondhna aur samajhna, sign-in, cart, checkout aur payment, order ki halat aur delivery code, return aur refund, aur review. Phone pehle, bharosa pehle, koi dark pattern nahi (DS-1.1, DS-1.3, DS-1.5).

## 2. Scope

**Andar:** `frontend/customer` app (SPA, D-290; Payment screen alag HTML document, SR-090; Vercel ka apna project, D-010): Customers aur Beauty Pro Buyers ([PRODUCT.md](../../PRODUCT.md) §4). Layout DS-5.4: phone pe neeche 5 tabs (Home, Categories, Orders, Cart, Account).

**Bahar:**

- Har screen ke peeche ka data aur niyam: maalik services ke modules (logistics, catalog, commerce, payments, identity, support, notify).
- Components: `03-frontend-kit` (commerce components apni pehli screen ke charan me, CR-25).
- Beauty Pro Buyers ke khaas kaam aur R2 ke features (try-on, recommendations, coupons, points): R2.

## 3. Functional requirements

1. **Dhaancha:** app-shell, jaagne ka parda (AC-CUSTOMER-1), har route pe security headers aur CSP, browser storage me user ka data nahi, service worker `/api/*` cache na kare (AC-CUSTOMER-9), demo ki patti jo band nahi hoti aur DUMMY ke nishaan (AC-CUSTOMER-8, DS-9.14, DS-9.15).
2. **Pincode (charan 2):** pincode ki jaanch; unserved pe "unavailable" aur notify-me waitlist; do states wale pincode pe state chunna (D-016, D-046).
3. **Browse aur search (charan 5):** Home, categories, list, search, filters aur sort (D-138, D-139), zero result pe madad (D-152), stock khatam product neeche (D-153), "How results are ranked" ki link (DS-9.13). Padhna bina sign-in (D-020).
4. **Product page (charan 5):** PriceBlock (MRP, daam, "% off", 30 din ka sabse kam daam; AC-CUSTOMER-3), agle batch ki expiry, shades, pack ki jaankari, ingredients aur allergen ki chetavni, claims, seller ka block aur return ki line add-to-cart ke paas (AC-CUSTOMER-4), aur pincode ke baad delivery ka vaada aur fee (DESIGN §9).
5. **Legal pages (charan 5):** Terms, Privacy, Data notice, Returns, Shipping, Payments, How results are ranked, Grievance, About/Contact; DUMMY badge, version aur tareekh (DS-9.16, DS-9.17, D-150).
6. **Account (charan 7):** sign-up (18+, consents, koi tick pehle se nahi; AC-CUSTOMER-5, DS-9.18), sign-in ke teen raaste (D-021), My devices, profile, consent wapas lena (DS-9.19), account delete (DS-9.24).
7. **Cart, wishlist aur address (charan 7):** cart aur wishlist sign-in ke saath (D-020); agla batch badle to line pe "Updated" (AC-CUSTOMER-2); address form aur Ola Maps (D-347, D-423, DS-7.10).
8. **Checkout aur payment (charan 8):** delivery fee alag line aur "₹X se upar muft" pehle se (AC-CUSTOMER-5); Payment alag HTML document (AC-CUSTOMER-6, SR-090); delivery pe UPI ka vikalp seema ke saath (D-109); pehle order ke baad push ka card (AC-CUSTOMER-10, D-346); "paisa kata, order nahi bana" (DS-9.22).
9. **Orders (charan 8 aur 9):** list aur detail; cancel order jitna aasaan, pack hone tak har item ke saath (DS-9.23, D-110); out for delivery pe DeliveryCodeCard sabse upar, push me code kabhi nahi (AC-CUSTOMER-7); vaada toote to "Delayed" (DS-9.10).
10. **Return, daawa aur refund (charan 10):** return ki maang, "parcel nahi mila" ka daawa, appeal, aur refund ki halat.
11. **Review (charan 11):** delivery ke baad verified purchase review, photo ke saath chehre ki ijazat ka tick (DS-9.21, D-135, D-155), aur review ki report.

## 4. Niyam

1. Screen sirf wahi dikhaye jo server ne kaha; total, stock aur status server ke (DS-1.4, SR-044).
2. Optimistic UI sirf wishlist, filters aur sort pe (DS-6.13).
3. Camera aur location header se band; location sirf address ke button pe (DS-10.1, SR-001).
4. Bundle ka budget: Customer JS misaal 170 KB (DS-10.9); page ke targets DS-10.10.

## 5. Data model aur API

App ka apna data nahi; sab maalik services ke routes se, `frontend-api-client` ke typed client ke saath (CR-27).

## 6. Security

SR-001 (browser ki ijazatein), SR-005, SR-006 aur SR-090 (headers, bahar ki script, Payment document), SR-010 (PWA cache), SR-021 (`next` sirf apna path), SR-027 aur SR-028 (cookies aur tokens), SR-040 (user ka content sirf text), SR-091 (map).

## 7. Dependencies

- **Tika hai:** `03-frontend-kit`, `07-notify`, `08-identity`, `09-gateway`, `10-logistics`; apne charan me `11-catalog`, `12-payments`, `13-commerce`, `15-support`.
- **Owner ke kaam:** Customer ka Vercel project; Ola Maps ki key (charan 7 se pehle); Razorpay ki test keys (charan 8 se pehle) ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §2.1 `CUSTOMER` (`AC-CUSTOMER-1` se `AC-CUSTOMER-10`), aur apps ke saajhe criteria.
- **Manuals:** `manuals/customer/CUSTOMER.md`, pehle feature ke PR me ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/CUSTOMER.md](../../testing/CUSTOMER.md), har feature ke PR me (DD-13).

## 9. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                                                      | Charan | Size   | Halat |
| ----- | -------------------------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1  | App ka dhaancha, jaagne ka parda, headers, demo ki patti, Vercel project, manual aur testing | 2      | L (4)  | Baaki |
| ST-2  | Pincode ki jaanch, "unavailable" aur notify-me waitlist                                      | 2      | M (2)  | Baaki |
| ST-3  | Home, categories, list, search, filters aur sort                                             | 5      | L (4)  | Baaki |
| ST-4  | Product page                                                                                 | 5      | L (4)  | Baaki |
| ST-5  | Legal pages, footer, Grievance aur About/Contact                                             | 5      | M (2)  | Baaki |
| ST-6  | Sign-up, sign-in, account, devices aur delete                                                | 7      | L (4)  | Baaki |
| ST-7  | Cart, wishlist aur address                                                                   | 7      | L (4)  | Baaki |
| ST-8  | Checkout, Payment document, delivery pe UPI aur push ka card                                 | 8      | L (4)  | Baaki |
| ST-9  | Orders: list, detail aur cancel                                                              | 8      | M (2)  | Baaki |
| ST-10 | Delivery ki halat aur DeliveryCodeCard                                                       | 9      | S (1)  | Baaki |
| ST-11 | Return, daawa, appeal aur refund ki halat                                                    | 10     | M (2)  | Baaki |
| ST-12 | Review likhna aur report                                                                     | 11     | M (2)  | Baaki |
|       | **Kul**                                                                                      |        | **35** |       |

## Change log

| Version | Date       | Badlav                                                           |
| ------- | ---------- | ---------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 16 ka pehla spec aur 12 subtasks (D-446); code abhi nahi. |
