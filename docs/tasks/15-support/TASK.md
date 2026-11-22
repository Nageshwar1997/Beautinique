# TASK 15: support (return aur daawe ke faisle, appeals aur grievance)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `15-support`; R1 ka patla hissa charan 10 me (D-446, D-105). Progress: 0 / 13 points.

## 1. Lakshya

Return aur daawon ke faisle niyam se aur seema ke andar: poore saboot wala return apne aap manzoor, baaki staff ki queue me, appeal ka faisla doosra insaan kare, aur fraud ke signals dikhein (D-105, D-147, D-188).

## 2. Scope

**Andar:** support service (`backend/support`): daawe (D-072, D-106), return aur daawe ke faisle (D-105), appeals (D-147), staff ki rakam ki seema (D-188), fraud ke signals (SR-058), grievance register (D-163) ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

**Bahar:**

- Return ki maang, jaanch aur refund ka hisaab: `13-commerce`. Refund ka bhejna: `12-payments`.
- Screens: `21-app-support-desk` aur `16-app-customer`.
- R2: tickets, SLA, disputes aur skin reaction (D-161 se D-164, D-130).

## 3. Functional requirements

1. **Maamle:** return aur daawe ke maamle, order, parcel aur return ke events se context ke saath.
2. **Return ka faisla:** wajah aur saboot poore hon to apne aap manzoor, warna queue me (D-105, AC-SUPPORT-1); `support.return.decided`.
3. **Staff ki seema:** Support Agent ek maamla misaal ₹2,000 aur din ka jod ₹10,000 tak; upar wala faisla Support Lead ke liye pending; counter kaam ke transaction me, ek saath ki manzooriyon me bhi (D-188, SR-051, AC-SUPPORT-2).
4. **"Parcel nahi mila":** code se delivered pe daawa misaal 48 ghante me darj ho par maana na jaaye, aur grievance ka raasta dikhe; sirf photo wali delivery pe misaal 7 din aur staff ki jaanch; koi saboot na ho to refund (R1 me dobara maal nahi) aur partner ki jaanch ka record (D-072, D-122, D-148, AC-SUPPORT-4).
5. **Toote, galat ya kam item:** zaroori photos ke bina submit nahi, video optional; saboot sirf us maamle ka staff dekhe (D-106, D-192, AC-SUPPORT-5); `support.claim.decided`.
6. **Appeal:** reject hue return ya daawe pe misaal 7 din me ek hi appeal; faisla Support Lead ka, jisne reject kiya wo kare to 403 (D-147, SR-038, AC-SUPPORT-3); `support.appeal.decided`.
7. **Fraud ke signals:** daawe, photo hash ka dobara aana, partner ke daawon ka hissa aur UPI pe mana; apne aap rok sirf D-109 aur D-203 ke niyam se (SR-058, AC-SUPPORT-7).
8. **Grievance register:** shikayat ki seedhi aur register (D-163), seller pe shikayat bhi platform ki seedhi me (D-238).

## 4. Niyam

1. Daawe ki khidki, staff ki rakam ki seema aur appeal ka alag faisla karne wala, teeno transaction me ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.7 niyam 10).
2. Faisle ke routes idempotency key ke saath; do baar submit pe ek hi faisla aur ek hi refund request (AC-SUPPORT-8).
3. Staff ki list me naam aur phone chhupe; "customer ki nazar se" ka koi route contract me nahi (D-201, D-202, SR-039, AC-SUPPORT-6).
4. Account delete pe case ke text se pehchaan hate, saboot apne samay pe (§10.3 ki table).

## 5. Data model

| Collection     | Kaam                                              | Retention class | Samay             |
| -------------- | ------------------------------------------------- | --------------- | ----------------- |
| `cases`        | Return aur daawe ke maamle, saboot ke refs, halat | `case`          | D-192 ke samay    |
| `decisions`    | Faisle, kisne, rakam, wajah                       | `case`          | Setting se        |
| `appeals`      | Appeal aur alag faisla karne wala                 | `case`          | Setting se        |
| `staff_limits` | Staff ki rakam ki din ki ginti                    | `tech`          | Setting se        |
| `risk_signals` | Fraud ke signals                                  | `case`          | Setting se        |
| `grievances`   | Grievance register                                | `case`          | Kanooni samay tak |

Saath me platform collections ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2). Fields aur indexes code ke saath is file me judte hain.

## 6. API

Routes contracts me ([tasks/README.md](../README.md)): maamlon ki queue, faisle, appeals, daawe, grievance. Bhejta hai: `support.claim.decided`, `support.return.decided`, `support.appeal.decided`. Leta hai: order, parcel aur return ke events ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

## 7. Security

SR-038 (reject aur appeal alag), SR-039 (chhupi jaankari), SR-051 (refund aur faisle ki seema), SR-058 (fraud ke signals), SR-062 (saboot), SR-087 (bina sign-in forms, R2).

## 8. Dependencies

- **Tika hai:** `02-platform`, `06-media`, `13-commerce`.
- **Is pe tike:** `13-commerce` (return ka faisla), `10-logistics` (pickup), `21-app-support-desk`, `16-app-customer`.
- **Owner ke kaam:** support ka Atlas cluster pehle live deploy se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.10 `SUPPORT` (`AC-SUPPORT-1` se `AC-SUPPORT-8`).
- **Manuals aur testing:** jis app me screen judti hai, uske manual aur testing file usi app ke module me (D-440).

## 10. Subtasks

Saare charan 10 me ([PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5, D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                   | Charan | Size   | Halat |
| ---- | --------------------------------------------------------- | ------ | ------ | ----- |
| ST-1 | Service ka dhaancha, maamle aur staff ki rakam ki seema   | 10     | M (2)  | Baaki |
| ST-2 | Return ke faisle: apne aap manzoor aur queue              | 10     | M (2)  | Baaki |
| ST-3 | Daawe: "parcel nahi mila" ki khidkiyan, photos aur saboot | 10     | L (4)  | Baaki |
| ST-4 | Appeals                                                   | 10     | S (1)  | Baaki |
| ST-5 | Fraud ke signals aur chhupi jaankari                      | 10     | M (2)  | Baaki |
| ST-6 | Grievance register                                        | 10     | M (2)  | Baaki |
|      | **Kul**                                                   |        | **13** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 15 ka pehla spec aur 6 subtasks (D-446); code abhi nahi. |
