# TASK 12: payments (Razorpay test mode, delivery pe UPI aur refunds)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `12-payments`; charan 8 se shuru (D-446). Progress: 0 / 17 points.

## 1. Lakshya

Paisa sirf sach se: gateway ka order server banaye, "paid" sirf signature wale webhook se, refunds kabhi captured se zyada nahi, aur delivery pe UPI ka QR exact rakam ka. Payments R1 me Razorpay ke test mode me (D-034).

## 2. Scope

**Andar:** payments service (`backend/payments`): gateway orders, payments, webhook inbox (event id), refunds, delivery pe UPI QR, chargebacks, settlement reports ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

**Bahar:**

- Order, reservation aur refund ka hisaab: `13-commerce`. Books aur documents: `14-finance`.
- Checkout aur Payment ki screen: `16-app-customer` (Payment alag HTML document, SR-090). QR ki screen: `24-app-delivery`.
- Cash on delivery nahi; door pe sirf UPI (D-034).

## 3. Functional requirements

1. **Adapter:** Razorpay ka adapter aur tests ka fake ([RULES.md](../../RULES.md) §4.2); payments test mode me hon aur key live wali ho to process uthe hi nahi ([OPERATIONS.md](../../OPERATIONS.md) §4 niyam 4).
2. **Gateway order (charan 8):** commerce sync call se; exact rakam aur currency server tay kare; sirf browser ke "success" pe order unpaid rahe (SR-048, AC-PAYMENTS-1). Provider pe misaal 10 second ka timeout, request ke andar retry nahi; Valkey band ho to payment shuru 503 (AC-PAYMENTS-9).
3. **Webhooks (charan 8):** seedha Render pe, signature ki jaanch, galat pe 401; event id `_id` pe, asar ke transaction me, wahi event dobara pe ek hi asar; halat sirf aage badhe, ulte kram me bhi aakhri halat sahi; captured rakam ya currency order se na mile to judna nahi aur alert (SR-049, AC-PAYMENTS-2, 3, 5).
4. **Der se payment (charan 8):** reservation khatam hone ke baad captured; commerce dobara stock dekhe, na mile to theek ek refund (`late:<paymentId>`), webhook dobara aaye to bhi; "paisa kata, order nahi bana" ki screen aur email (D-118, D-256, AC-PAYMENTS-4).
5. **Refunds (charan 8 aur 10):** `commerce.refund.requested` se; cancel, return aur appeal ke refund ek saath chalein to bhi jod captured se zyada nahi (payment pe conditional `$inc`); ek refund request ka ek refund (SR-047, AC-PAYMENTS-6); refund fail pe customer ko khabar aur staff ka raasta sirf Support Lead aur Finance ki manzoori se (D-111, D-188, AC-PAYMENTS-7).
6. **Delivery pe UPI (charan 9):** logistics sync call se; QR server se, us parcel ki exact rakam ka, ek parcel pe ek hi khula QR; "paid" sirf webhook se, partner ke liye "paid" ka koi API nahi; test mode me QR me Payment page ka link, jiska token doosre parcel pe ya samay ke baad nahi chalta (SR-050, D-109, D-418, AC-PAYMENTS-8).
7. **Chargebacks aur settlement (charan 12):** gateway ki settlement report aur chargebacks; roz ka milaan M1: har payment id ki rakam aur halat ledger se mile, farak suspense me aur alert (D-093, D-269, AC-PAYMENTS-10).

## 4. Niyam

1. Halat sirf aage badhti hai; ek parcel ek khula QR; ek refund request ek refund ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.7 niyam 4).
2. Payment ki pehchaan account delete pe hash ke roop me bhi hat-ti hai (§10.3 ki table).
3. Ye paise ka code hai: badli lines pe mutation aur 85% branch coverage (RT-21, RT-23); retry ya quarantine nahi (RT-25).

## 5. Data model

| Collection                          | Kaam                                                 | Retention class | Samay               |
| ----------------------------------- | ---------------------------------------------------- | --------------- | ------------------- |
| `gateway_orders`                    | Gateway ka order, rakam, currency, commerce ka order | `book`          | Archive ke niyam se |
| `payments`                          | Payment ki halat, captured aur refunded ka jod       | `book`          | Archive ke niyam se |
| `webhook_events`                    | Event id `_id` pe, asar ke transaction me            | `tech`          | Setting se          |
| `refunds`                           | Refund request aur nateeja                           | `book`          | Archive ke niyam se |
| `upi_qrs`                           | Parcel ka khula QR, rakam, token ka hash             | `case`          | Setting se          |
| `chargebacks`, `settlement_reports` | Chargebacks aur settlement ki lines                  | `book`          | Setting se          |

Saath me platform collections ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2). Fields aur indexes code ke saath is file me judte hain.

## 6. API

Routes contracts me ([tasks/README.md](../README.md)): webhook (tay route, bina secret header, signature ke saath), test mode ka Payment page. Facade: commerce (gateway order), logistics (UPI ka QR) (§2.3). Bhejta hai: `payments.payment.captured`, `.failed`; `payments.refund.succeeded`, `.failed`; `payments.settlement.reported`; `payments.chargeback.opened`. Leta hai: `commerce.refund.requested` ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

## 7. Security

SR-008 (payment shuru fail-closed), SR-047 (refund ki seema), SR-048 (gateway order), SR-049 (webhook), SR-050 (UPI ka QR), SR-090 (Payment ka alag document).

## 8. Dependencies

- **Tika hai:** `02-platform`, `13-commerce` (refund ki maang aur order).
- **Is pe tike:** `13-commerce`, `10-logistics` (UPI), `14-finance` (payment ke events), `16-app-customer`, `24-app-delivery`.
- **Owner ke kaam:** Razorpay ki test mode ki keys aur webhook, charan 8 se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.5 `PAYMENTS` (`AC-PAYMENTS-1` se `AC-PAYMENTS-10`).
- **Manuals aur testing:** jis app me screen judti hai, uske manual aur testing file usi app ke module me (D-440).

## 10. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                            | Charan | Size   | Halat |
| ---- | ------------------------------------------------------------------ | ------ | ------ | ----- |
| ST-1 | Service ka dhaancha, Razorpay adapter aur fake, test mode ka pehra | 8      | M (2)  | Baaki |
| ST-2 | Gateway order, checkout ka nateeja aur timeout                     | 8      | M (2)  | Baaki |
| ST-3 | Webhooks: signature, event id, halat aage, mismatch ka alert       | 8      | L (4)  | Baaki |
| ST-4 | Refunds: seema aur ek request ek refund                            | 8      | M (2)  | Baaki |
| ST-5 | Delivery pe UPI ka QR                                              | 9      | L (4)  | Baaki |
| ST-6 | Refund fail ka raasta aur return ke refunds                        | 10     | S (1)  | Baaki |
| ST-7 | Chargebacks, settlement reports aur M1 ka milaan                   | 12     | M (2)  | Baaki |
|      | **Kul**                                                            |        | **17** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 12 ka pehla spec aur 7 subtasks (D-446); code abhi nahi. |
