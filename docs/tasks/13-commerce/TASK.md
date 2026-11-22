# TASK 13: commerce (stock, cart, order, pack, cancel aur return)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `13-commerce`; charan 6 se shuru (D-446). Progress: 0 / 30 points.

## 1. Lakshya

Order ka dil: batch ke level pe sachcha stock, customer ko jo MRP aur expiry dikhi wahi batch, aakhri unit pe bhi ek hi order, pack pe sahi invoice, aasaan cancel aur niyam se return. Stock, reservation aur order ek hi transaction me (D-118, SR-045; [ARCHITECTURE.md](../../ARCHITECTURE.md) §10.5).

## 2. Scope

**Andar:** commerce service (`backend/commerce`): cart, wishlist, addresses, orders, seller ke hisse, lines aur snapshots, reservations, stock (batch, bin, balance, movements), inbound shipment aur receiving (D-096), pick aur pack, cancel, return requests, refund ka hisaab (SR-047), customer ki seemaayein (D-091, D-109, D-204) ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

**Bahar:**

- Payment, refund ka asli bhejna aur UPI ka QR: `12-payments`. Invoice aur credit note: `14-finance` (pack pe sync call).
- Delivery, trips aur pickup: `10-logistics`. Return aur daawe ka faisla: `15-support`.
- Screens: Customer, Seller aur Logistics Ops apps ke modules.
- Coupons, points, combos aur short expiry (R2).

## 3. Functional requirements

### 3.1 Stock aur maal aana (charan 6)

1. Stock batch ke level pe: `stock_batches` (pehchaan, expiry, MRP, halat), `stock_balances` (`onHand`, `reserved`, `available`), `stock_bins` (ek bin ek batch) aur `stock_movements` (sirf jodna) (§10.5 niyam 2).
2. Brand maal shipment ki pehle se suchna (ASN) ke saath bheje; ASN ke bina, expiry seema se kam, ya sirf PAO wala maal mana ya wapas; farak photo ke saath seller ko; "accept" scan se zimmedari, stock aur storage ki ghadi shuru (D-096, D-082, D-083, D-097, D-066, AC-COMMERCE-12).
3. Roz: expiry ki seema paar batch `stopped` aur near-expiry alert (D-062, D-082, D-124); raat: `reserved` = khule reservations, `onHand` = bins + raaste me, farak pe alert (§10.5 niyam 11).
4. `commerce.stock.changed` aur `commerce.nextBatch.changed`, jinse catalog stock ki halat aur agle batch ka MRP aur expiry dikhata hai.

### 3.2 Cart, wishlist aur address (charan 7)

1. Cart aur wishlist sign-in ke saath (D-020); guest cart nahi.
2. Daam ki copy `catalog.price.changed` se aur area ki copy `logistics.area.changed` se (§2.4 niyam 3 aur 4); cart me agla batch badle to line pe "Updated", purana aur naya (DS-9.3).
3. Addresses, map ke pin samet (D-347); account delete pe addresses, cart, wishlist aur link keys delete (§10.3 ki table).

### 3.3 Place order aur payment (charan 8)

1. Ek transaction me: serviceability (`copy_area`), daam (`copy_listing`), quantity aur customer ki seemaayein, FEFO se batches, har hisse pe `available >= q` ki shart ke saath reservation, order aur outbox; koi hissa na mile to poora ulta aur 409 (§10.5 niyam 3, AC-COMMERCE-1, AC-COMMERCE-2).
2. FEFO: bikne layak me sabse pehle expire hone wala; daam se kam MRP wala batch ruka; customer ko jo MRP aur expiry dikhi wahi batch, farak ho to order nahi aur naya total (§10.5 niyam 4 aur 5, AC-COMMERCE-4).
3. Client ka daam, fee ya tax nazarandaaz; total server ka (SR-044, AC-COMMERCE-3); place order idempotency key ke saath (SR-045).
4. Seemaayein: ek variant ki quantity, delivery pe UPI ki rakam aur khule UPI orders; `+` alias wale accounts address, device ya payment ke jod se ek gine jaayein; counter ek conditional `$inc` se (D-091, D-109, D-203, D-204, SR-046, AC-COMMERCE-6).
5. Unserved pincode pe mana; area band hone pe pehle checkout pe rok (D-016, D-300, AC-COMMERCE-7).
6. Prepaid: payments se gateway order (sync), captured pe `commerce.order.confirmed`; misaal 15 minute me payment nahi to reservation wapas aur `paymentExpired`, ek transaction me (D-118, AC-COMMERCE-5); der se aaya payment: dobara FEFO, na mile to ek hi refund (`late:<paymentId>`, §10.5 niyam 7).
7. Delivery fee ek hi, order pe (D-107).

### 3.4 Cancel (charan 8)

Pack se pehle poora, ek item ya quantity cancel; koi fee nahi, prepaid refund turant; pack ke baad 409; pack aur cancel ek saath pe sirf ek jeete; refund ka jod kabhi captured se zyada nahi (D-110, AC-COMMERCE-9, §10.5 niyam 10).

### 3.5 Pick aur pack (charan 9)

1. Pick bin ke hisaab se; maal toota ya kam ho to barabar batch (wahi variant, wahi MRP, expiry kam se kam utni), warna customer se sawal, timer tak jawab na aaye to line cancel aur refund (D-090, AC-COMMERCE-10).
2. Pack teen kadam me: parcel `packing` aur `packSeq + 1`; finance ko invoice ki sync call `(parcel, seller, packSeq)` ki key se; phir `packed`, invoice ke numbers, stock movements aur event ek transaction me; har kadam dobara chalne layak; adhoora ya dobara pack pe `commerce.parcel.packVoided` (D-319, AC-COMMERCE-8).
3. Finance band ho to pack ruka, order khota nahi.
4. Dispatch pe batch ke customers ki chhoti list (`stock_batch_sales`), expiry + 12 mahine tak, recall ke liye (D-129).
5. Parcel ka naam, address aur phone logistics ke resolver ko (sync, §2.3).

### 3.6 Return (charan 10)

1. Muddat wajah ke hisaab se (misaal 30 din galti, 7 din man badla), saboot (photos); man badla sirf seal wale maal pe (D-079, D-106, D-221, AC-COMMERCE-11).
2. Faisla `support.return.decided` se; pickup `logistics.pickup.completed` se; jaanch ke baad band aur bikne layak maal usi batch me, storage ki ghadi nahi badalti (D-112, §10.5 niyam 12).
3. Man badla pe refund se return fee (misaal ₹49), hamari ya brand ki galti pe nahi (D-114); refund kab (D-115); `commerce.return.inspected` aur `commerce.refund.requested`.

### 3.7 Mahine aur roz ke kaam (charan 12)

Storage fee (D-066), bikri ka roz ka jod `commerce.sales.rolledUp` (D-139, D-149), aur band orders ka archive, `order_index` ke saar ke saath (D-306, §10.5 niyam 14).

## 4. Niyam

1. Transaction ke andar queries ek ke baad ek, bahar ki koi call nahi (CR-14); sync calls sirf §2.3 ki list wali.
2. Paisa, stock aur order ke har likhne wale route pe idempotency key (CR-16).
3. Ye kernel jaisa paise aur stock ka code hai: badli lines pe mutation aur 85% branch coverage (RT-21, RT-23); concurrency ke tests pe retry nahi (RT-25).

## 5. Data model

| Collection                                      | Kaam                                         | Retention class | Samay                        |
| ----------------------------------------------- | -------------------------------------------- | --------------- | ---------------------------- |
| `stock_batches`, `stock_balances`, `stock_bins` | Batch, balance aur bins                      | `book`          | Hamesha                      |
| `stock_movements`                               | Har movement, sirf jodna                     | `book`          | Archive ke niyam se          |
| `inbound_shipments`, `receipts`                 | ASN aur receiving, farak ke saboot ke refs   | `book`          | Setting se                   |
| `carts`, `wishlists`, `addresses`               | Customer ka cart, wishlist aur addresses     | `account`       | Account delete pe            |
| `orders`                                        | Lines, batch ke hisse aur snapshots embedded | `book`          | Band hone pe archive (D-306) |
| `seller_parts`, `parcels`                       | Seller ka hissa (invoice) aur parcel         | `book`          | Archive ke niyam se          |
| `reservations`                                  | Khule reservations aur timer                 | `tech`          | Band hone pe                 |
| `returns`, `refund_requests`                    | Return ki maang, jaanch aur refund ka hisaab | `case`          | Setting se                   |
| `limit_counters`, `limits_link_keys`            | Customer ki seemaayein aur jod ki HMAC keys  | `account`       | Setting se                   |
| `stock_batch_sales`                             | Recall ke liye batch ke customers            | `case`          | Expiry + 12 mahine           |
| `copy_area`, `copy_listing`                     | Logistics aur catalog ki copy                | `ref`           | Events se                    |

Saath me platform collections ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2). Fields aur indexes code ke saath is file me judte hain.

## 6. API

Routes contracts me ([tasks/README.md](../README.md)): ASN aur receiving, cart, wishlist, addresses, place order, orders, cancel, pick, pack, return. Bhejta hai: `commerce.order.placed`, `.confirmed`; `commerce.orderLine.cancelled`, `.delivered`; `commerce.parcel.packed`, `.packVoided`; `commerce.stock.changed`; `commerce.nextBatch.changed`; `commerce.return.requested`, `.inspected`; `commerce.refund.requested`; `commerce.sales.rolledUp`. Leta hai: `payments.payment.*`, `logistics.parcel.*`, `logistics.pickup.completed`, `logistics.area.changed`, `catalog.listing.published`, `catalog.price.changed`, `support.return.decided` ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2). Sync calls: payments (gateway order), finance (pack pe invoice) (§2.3).

## 7. Security

SR-044 (server ka total), SR-045 (idempotency aur stock), SR-046 (customer ki seemaayein), SR-047 (paise ka hisaab), SR-093 (jod ki pehchaan HMAC se).

## 8. Dependencies

- **Tika hai:** `02-platform`, `10-logistics` (area ki copy), `11-catalog` (daam ki copy); charan 8 se `12-payments` aur `14-finance`.
- **Is pe tike:** `16-app-customer`, `17-app-seller`, `23-app-logistics-ops`, `10-logistics` (parcel ka resolver), `15-support`.
- **Owner ke kaam:** commerce ka Atlas cluster pehle live deploy se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.7 `COMMERCE` (`AC-COMMERCE-1` se `AC-COMMERCE-12`).
- **Manuals aur testing:** jis app me screen judti hai, uske manual aur testing file usi app ke module me (D-440).

## 10. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                        | Charan | Size   | Halat |
| ----- | -------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1  | Service ka dhaancha aur stock ka data model                    | 6      | M (2)  | Baaki |
| ST-2  | Maal aana: ASN, receiving, expiry ki seema aur "accept" scan   | 6      | L (4)  | Baaki |
| ST-3  | Stock ke roz aur raat ke jobs, stock ke events                 | 6      | M (2)  | Baaki |
| ST-4  | Cart, wishlist, addresses aur catalog aur logistics ki copies  | 7      | M (2)  | Baaki |
| ST-5  | Place order: FEFO, reservation, seemaayein aur server ka total | 8      | L (4)  | Baaki |
| ST-6  | Payment se jod, reservation ka timer aur der se aaya payment   | 8      | L (4)  | Baaki |
| ST-7  | Cancel aur refund ka hisaab                                    | 8      | M (2)  | Baaki |
| ST-8  | Pick aur pack, finance ki invoice call, parcel ke events       | 9      | L (4)  | Baaki |
| ST-9  | Return: maang, jaanch, return fee aur refund ki maang          | 10     | L (4)  | Baaki |
| ST-10 | Storage fee, bikri ka roz ka jod aur band orders ka archive    | 12     | M (2)  | Baaki |
|       | **Kul**                                                        |        | **30** |       |

## Change log

| Version | Date       | Badlav                                                           |
| ------- | ---------- | ---------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 13 ka pehla spec aur 10 subtasks (D-446); code abhi nahi. |
