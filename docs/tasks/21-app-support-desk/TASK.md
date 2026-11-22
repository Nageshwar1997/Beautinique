# TASK 21: Support Desk app (support, grievance aur salah ki team)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `21-app-support-desk`; charan 3 me dhaancha, R1 ka patla hissa charan 10 me (D-446, D-105). Progress: 0 / 15 points.

## 1. Lakshya

R1 me Support Desk ka patla hissa (D-105): return, daawe aur refund ke faisle seema ke andar, appeal ka alag faisla karne wala, aur grievance ka register. Support customer ki nazar se ya uske naam se kabhi kaam nahi karta (D-202).

## 2. Scope

**Andar:** `frontend/support-desk` app (SPA, D-290; Vercel ka apna project, D-010): Support Agent, Support Lead, Grievance Officer aur Production Support Engineer ke R1 wale kaam ([PRODUCT.md](../../PRODUCT.md) §3.2).

**Bahar:**

- Maamle, faisle, seemaayein aur grievance register ka data: `15-support`. Refund: `12-payments` aur `14-finance`.
- R2: tickets, SLA aur disputes (D-161 se D-164), Seller Support Agent, BPO Supervisor, Beauty Advisor aur Skin & Hair Expert.

## 3. Functional requirements

1. **Dhaancha aur sign-in (charan 3):** staff ka sign-in authenticator ke saath; DESIGN ka staff data-dense parivaar (DS-5.6), queue wali screens me "Next item" aur ginti.
2. **Queue (charan 10):** apne aap manzoor aur pending maamle alag; Support Agent ki seema (misaal ₹2,000 ek maamla, ₹10,000 din) se upar wala maamla Support Lead ki queue me (AC-SUPPORTDESK-1, D-188).
3. **Faisle (charan 10):** return aur "parcel nahi mila" ke daawe ka faisla, saboot ki photo ya video chhote signed URL se, `no-referrer`, cache nahi (AC-SUPPORTDESK-3, SR-062); refund ka faisla ConfirmDialog me rakam aur asar ke saath, double click pe bhi ek faisla (AC-SUPPORTDESK-4).
4. **Appeal (charan 10):** customer ki ek appeal (misaal 7 din me); faisla Support Lead kare, jisne reject kiya wo nahi; usse khule to faisle ke buttons band aur wajah likhi (AC-SUPPORTDESK-2, D-147). Fail refund ka staff raasta Support Lead aur Finance ke saath (D-188).
5. **Grievance Officer (charan 10):** shikayat ki seedhi ka teesra kadam, grievance register, aur personal data ke sawalon ka sampark (D-163, D-237, D-253).
6. **Production Support Engineer (charan 8):** "paisa kata, order nahi bana" aur atke order jaisi system ki galti sirf audit wale marammat ke kaamon se (SR-076).

## 4. Niyam

1. Customer ke naam se ya uski nazar se koi kaam nahi, sirf support ki apni screens (AC-SUPPORTDESK-5, D-202).
2. Staff ki rakam ki seema ek counter pe, kaam ke transaction me ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2 niyam 8).
3. Lists me customer ki jaankari chhupi, "Show details" wajah ke saath (DS-10.5, SR-039).

## 5. Data model aur API

App ka apna data nahi; sab maalik services ke routes se, `frontend-api-client` ke typed client ke saath (CR-27).

## 6. Security

SR-039 (chhupi jaankari), SR-051 (refund aur faisle ki seema), SR-058 (fraud ke signals), SR-062 (private media), SR-076 (audit); staff app ke saajhe niyam (session 12 ghante, authenticator, SR-005 ke headers).

## 7. Dependencies

- **Tika hai:** `03-frontend-kit`, `08-identity`, `09-gateway`; charan 10 me `15-support`, `13-commerce`, `12-payments`, `06-media`.
- **Owner ke kaam:** Support Desk ka Vercel project ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §2.6 `SUPPORT DESK` (`AC-SUPPORTDESK-1` se `AC-SUPPORTDESK-5`), aur apps ke saajhe criteria.
- **Manuals:** `manuals/support-desk/<ROLE_NAME>.md`, us role ke pehle feature ke PR me ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/SUPPORT_DESK.md](../../testing/SUPPORT_DESK.md), har feature ke PR me (DD-13).

## 9. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                           | Charan | Size   | Halat |
| ---- | --------------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1 | App ka dhaancha, staff ka sign-in, Vercel project, manual aur testing ki shuruaat | 3      | L (4)  | Baaki |
| ST-2 | Production Support Engineer ke marammat ke kaam                                   | 8      | S (1)  | Baaki |
| ST-3 | Maamlon ki queue aur seema                                                        | 10     | M (2)  | Baaki |
| ST-4 | Return, daawe aur refund ke faisle                                                | 10     | L (4)  | Baaki |
| ST-5 | Appeal aur fail refund ka staff raasta                                            | 10     | M (2)  | Baaki |
| ST-6 | Grievance Officer aur grievance register                                          | 10     | M (2)  | Baaki |
|      | **Kul**                                                                           |        | **15** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 21 ka pehla spec aur 6 subtasks (D-446); code abhi nahi. |
