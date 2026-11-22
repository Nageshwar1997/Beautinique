# TASK 10: logistics (location, area, hub aur delivery)

> **Status:** v1.0.1 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `10-logistics`; charan 2 se shuru (D-446). Progress: 0 / 29 points.

## 1. Lakshya

Poore India ka location master, pincode se theek ek hub, area ke switches aur live, aur apne warehouse se apne partners tak delivery: trips, assignment, code ya photo ke saath delivery, fail aur RTO, aur return pickup (D-014, D-015, D-016, D-022).

## 2. Scope

**Andar:** logistics service (`backend/logistics`): location master, pincode → hub, hubs aur warehouses ki jagah, area ke switches aur live, area settings, waitlist, trips, partners, assignment, delivery attempts, delivery codes, saboot ke refs, RTO, return pickups, carrier port ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

**Bahar:**

- Stock, receiving, pick aur pack: `13-commerce`.
- Delivery pe UPI ka QR aur payment: `12-payments` (logistics facade se bulata hai).
- Photos ki file: `06-media`; logistics me sirf `assetId`.
- Screens: Super Admin, Admin, Master, Logistics Ops, Delivery aur Customer apps ke modules.
- Partner ki kamaai aur payout: R2 (D-104); R1 me sirf kaam ka record.

## 3. Functional requirements

### 3.1 Location master (charan 2)

1. Poore India ka ek saath: states, districts, sub-districts aur pincode → sub-district ki mapping; villages aur municipal bodies ki LGD files sirf laptop pe mapping nikaalne ke kaam aati hain, DB me kabhi nahi (D-022 ka jod).
2. Import Master app se (`20-app-master`): pehle dry run aur schema ki jaanch, galat file ka koi asar nahi, ek pincode ek record, audit me ginti (AC-MASTER-4, SR-043).
3. Shak wale pincodes (jaise shehri pincode jinka sub-district sirf municipal body ke level pe milta hai, [RISKS.md](../../RISKS.md) §2) ki jaanch sirf live hone wale district me; primary sub-district Admin badalta hai (D-016 niyam 1, D-022).

### 3.2 Pincode → hub (D-016)

1. Har pincode theek ek hub se, primary sub-district ke hub se, D-016 ke niyamon ke saath.
2. Do states wale pincode pe customer state chune, aur wo state live ho tabhi order (AC-LOGISTICS-1).
3. Bina mapping wale pincodes ki list Admin ke liye.

### 3.3 Hubs, warehouses, switches aur live (D-015, D-022)

1. Seedhi India > State > District > Sub-District; district me ek main warehouse, har sub-district me theek ek hub (alag record).
2. Switch ka haq: Master state, Super Admin district, Admin sub-district aur hub; upar wala role neeche ka switch chala sakta hai, audit ke saath.
3. Live = apna switch ON + upar wala level live; live kahin save nahi hota. Sharten sirf live karte waqt: hub = staff ki list poori (D-123); district = warehouse + hub taiyaar; state = kam se kam ek live district.
4. Staff ki list data me, sab hubs ke liye ek; kam ho jaaye to chetavni, hub chalta rahe, faisla Admin ka (D-022).
5. Naya sub-district ya district kholna sirf setting se, bina code aur deploy (D-037).
6. Har badlav pe `logistics.area.changed`, taaki commerce ki copy se order ke waqt serviceability jaanchi jaaye (§2.4 niyam 3).
7. Area band karne ka kram: pehle checkout pe rok ka event, phir band; parcel banate waqt band area ka order ruke, cancel aur refund (D-300).

### 3.4 Area settings

Delivery fee aur muft ki seema (D-107), cut-off, Sunday aur chhuttiyan (D-117), aur delivery pe UPI ki seema (D-109), area ke level pe; inse delivery ke vaade ki tareekh (AC-LOGISTICS-12).

### 3.5 Waitlist (D-046, D-141)

Unserved pincode pe "unavailable" aur notify-me waitlist; area khulne pe khabar in-app aur push se, push band walon ko email; waitlist se agle area ka sujhaav, par kholne ka koi tay kram nahi.

### 3.6 Trips aur hub (charan 9)

Warehouse se hub tak kiraye ke transporter ki har trip ka record, manifest aur seal number; hub pe receive scan me ginti kam ho to nishaan aur audit; har scan me kaun, kis device se aur kab (D-027, SR-057).

### 3.7 Delivery (charan 9)

1. Parcel me sirf pincode; naam, address aur phone commerce ke resolver se, logistics me save nahi ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.7 niyam 8).
2. Partner ka grant `logistics.partner.activated` se; assignment Hub Manager karta hai.
3. Delivery app ka sync batch (misaal 50 kaam): har kaam ka client ka UUIDv7 id idempotency key, alag nateeja, `deviceAt` aur `serverAt`; code wali delivery offline me nahi (§5 niyam 6, D-301).
4. Code ka milaan sirf online, conditional update se (`outForDelivery`, usi partner, 5 se kam galat koshish); partner ke app ko code kabhi nahi (SR-054).
5. Code ke bina photo wali delivery pe photo, hash aur location ki jaanch (SR-055); location sirf delivered, fail aur pickup ke pal (SR-056).
6. Delivery pe UPI: payments se exact rakam ka QR; payment fail pe misaal 10 minute, phir "attempt fail" (D-109, SR-050).
7. Fail: wajah aur location ke saath; do koshish (misaal), hub pe misaal 3 din, phir RTO; saaf mana pe seedha RTO; RTO ke hub scan pe prepaid refund ka event ek hi baar (D-108).
8. Vaada toote to "Delayed" aur khabar (D-117, D-222).
9. Carrier port: bahar ke courier ka dhaancha (D-014), R1 me apne partners hi.

### 3.8 Return pickup (charan 10)

Pickup pe batch aur seal ki jaanch; label ka batch order se na mile ya man badla me seal toota ho to pickup nahi, wajah ke saath khabar; item ki photo; `logistics.pickup.completed` (D-113).

## 4. Niyam

1. Photo aur location apne samay pe roz ke job se mitti hain (D-191, §10.7 niyam 9).
2. Partner sirf apne assigned parcels; hub ka staff sirf apne hub ki cheezein; baaki pe 404 (SR-035, SR-039).
3. Delivery code encrypted, milaan server pe ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.3 niyam 7).

## 5. Data model

| Collection                             | Kaam                                               | Retention class | Samay                       |
| -------------------------------------- | -------------------------------------------------- | --------------- | --------------------------- |
| `states`, `districts`, `sub_districts` | Location master, switch ke saath                   | `ref`           | Hamesha                     |
| `pincodes`                             | Pincode → primary sub-district aur hub             | `ref`           | Hamesha                     |
| `hubs`, `warehouses`                   | Jagah, sub-district ya district se jude            | `ref`           | Hamesha (`archived`)        |
| `area_settings`                        | Fee, cut-off, chhuttiyan, UPI ki seema             | `ref`           | Hamesha                     |
| `staff_plans`                          | Har hub ke roles ki list                           | `ref`           | Hamesha                     |
| `waitlist`                             | Pincode aur account, khabar gayi ya nahi           | `account`       | Account delete pe           |
| `trips`                                | Trip, manifest, seal, scans                        | `case`          | Setting se                  |
| `partners`                             | Delivery partner ka record aur halat               | `account`       | Rok ke niyam se             |
| `parcels`                              | Parcel ki halat, pincode, hub, partner, koshishein | `case`          | Archive ke niyam se         |
| `delivery_codes`                       | Code encrypted, galat koshish ki ginti             | `case`          | Delivery ke baad apne samay |
| `pickups`                              | Return pickup ki halat aur saboot ke refs          | `case`          | Setting se                  |

Saath me platform collections ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2). Fields aur indexes code ke saath is file me judte hain.

## 6. API

Routes contracts me ([tasks/README.md](../README.md)): location ka import, pincode ki jaanch (public), switches, area settings, waitlist, trips, assignment, Delivery ka sync, delivery attempt, pickup. Bhejta hai: `logistics.area.changed`; `logistics.parcel.planned`, `.dispatched`, `.atHub`, `.outForDelivery`, `.delivered`, `.attemptFailed`, `.rtoReceived`; `logistics.pickup.completed`; `logistics.partner.activated`. Leta hai: `commerce.order.confirmed`, `commerce.parcel.packed`, `support.return.decided`, `payments.payment.captured` ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2). Sync calls: payments (UPI ka QR), commerce (parcel ka naam, address aur phone) (§2.3).

## 7. Security

SR-023 (Delivery ka offline data), SR-035 aur SR-039 (scope aur chhupi jaankari), SR-050 (UPI ka QR), SR-054 (delivery code), SR-055 (photo wali delivery), SR-056 (location), SR-057 (trip ke scans).

## 8. Dependencies

- **Tika hai:** `02-platform`, `06-media`; charan 9 me `12-payments` (UPI) aur `13-commerce` (parcel ka resolver).
- **Is pe tike:** `13-commerce` (area ki copy), `16-app-customer`, `18-app-admin`, `19-app-super-admin`, `20-app-master`, `23-app-logistics-ops`, `24-app-delivery`.
- **Owner ke kaam:** OT-1 ho gaya (LGD ka data, [OWNER_TASKS.md](../../OWNER_TASKS.md) §2); logistics ka Atlas cluster pehle live deploy se pehle (§3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.8 `LOGISTICS` (`AC-LOGISTICS-1` se `AC-LOGISTICS-13`; 13 waitlist ka, D-452).
- **Manuals aur testing:** jis app me screen judti hai, uske manual aur testing file usi app ke module me (D-440).

## 10. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446): area charan 2 me, delivery charan 9 me, return pickup charan 10 me. Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                                      | Charan | Size   | Halat |
| ----- | ---------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1  | Service ka dhaancha, location master aur uska import                         | 2      | L (4)  | Baaki |
| ST-2  | Pincode → hub, do states wale pincode, bina mapping ki list                  | 2      | M (2)  | Baaki |
| ST-3  | Hubs, warehouses, staff ki list, switches aur live, `logistics.area.changed` | 2      | L (4)  | Baaki |
| ST-4  | Area settings aur vaade ki tareekh                                           | 2      | M (2)  | Baaki |
| ST-5  | Waitlist, area khulne ki khabar aur area band karne ka kram                  | 2      | M (2)  | Baaki |
| ST-6  | Trips aur hub pe receive                                                     | 9      | M (2)  | Baaki |
| ST-7  | Partners, assignment aur Delivery ka sync batch                              | 9      | L (4)  | Baaki |
| ST-8  | Delivery attempt: code, photo, location aur UPI ka QR                        | 9      | L (4)  | Baaki |
| ST-9  | Fail, doosri koshish, RTO aur "Delayed"                                      | 9      | M (2)  | Baaki |
| ST-10 | Photo aur location ke retention jobs, carrier port ka dhaancha               | 9      | S (1)  | Baaki |
| ST-11 | Return pickup                                                                | 10     | M (2)  | Baaki |
|       | **Kul**                                                                      |        | **29** |       |

## Change log

| Version          | Date       | Badlav                                                                                          |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.1 | 2026-11-22 | Module 10 ka pehla spec, 11 subtasks (D-446) aur waitlist ka criterion (D-452); code abhi nahi. |
