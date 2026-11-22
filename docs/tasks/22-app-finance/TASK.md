# TASK 22: Finance app (finance ki team)

> **Status:** v1.0.1 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `22-app-finance`; charan 10 me dhaancha aur fail refund ka raasta (D-453), baaki charan 12 me (D-446). Progress: 0 / 12 points.

## 1. Lakshya

Finance ki team ka app: hafte ka payout batch (manzoori doosre account se), milaan ke nateeje aur suspense, fees ki settings, fail refund ka haath ka raasta, aur exports, sab dobara code aur audit ke saath ([PRODUCT.md](../../PRODUCT.md) §3.2, D-189).

## 2. Scope

**Andar:** `frontend/finance` app (SPA, D-290; Vercel ka apna project, D-010): Finance Manager, aur "module ke saath" wale Tax & Statutory Compliance, Payments & Refund Reconciliation aur Payouts Executive (shuru me Finance Manager ke paas) ([PRODUCT.md](../../PRODUCT.md) §3.2).

**Bahar:**

- Books, documents, payouts aur milaan ka data: `14-finance`. Refunds: `12-payments`.
- Payout batch ki manzoori: Master ka doosra account (`20-app-master`, D-189).
- R2: Accounts Payable (transporter ke bill) aur finance ki poori reports.

## 3. Functional requirements

1. **Dhaancha aur sign-in:** staff ka sign-in authenticator ke saath; DESIGN ka staff data-dense parivaar (DS-5.6); finance ka database band ho (CU-ghante khatam) to saaf sandesh aur checkout ke kill switch ki salah (AC-FINANCEAPP-5, R-028).
2. **Fail refund:** haath ka raasta Support Lead aur Finance dono ki manzoori ke bina aage nahi (AC-FINANCEAPP-2, D-188, D-111).
3. **Payout batch:** har seller ki lines, set-off, bharpai aur net dikhe; manzoori ka button usi account ke liye band jisne banaya (AC-FINANCEAPP-1, D-081, D-189); "paid" haath se mark.
4. **Milaan:** M1 se M5 ka farak aur suspense; M3 toote to "payouts ruke" ka banner (AC-FINANCEAPP-3, SR-053).
5. **Fees ki settings:** ek account badle aur doosra manzoor kare ([ARCHITECTURE.md](../../ARCHITECTURE.md) §11 niyam 6.4, D-078).
6. **Exports:** dobara code, misaal 50,000 rows ki seema, chhota ek baar ka link, audit me filters aur ginti (AC-FINANCEAPP-4, D-144, SR-075); TCS, TDS aur GST ke registers dekhna.

## 4. Niyam

1. Payout batch banane wala account use manzoor nahi karta (§11 niyam 6.2).
2. Lists me personal data chhupa (D-144, SR-039).
3. Finance ka app kabhi tez padhne wale raaste me finance ko nahi jagata; app khulne pe hi finance jaagta hai (D-057, R-014).

## 5. Data model aur API

App ka apna data nahi; sab `14-finance` aur `12-payments` ke routes se, `frontend-api-client` ke typed client ke saath (CR-27).

## 6. Security

SR-009 (kill switch), SR-039 (chhupi jaankari), SR-052 (bank), SR-053 (milaan), SR-075 (exports), SR-076 (audit); staff app ke saajhe niyam (session 12 ghante, authenticator, SR-005 ke headers).

## 7. Dependencies

- **Tika hai:** `03-frontend-kit`, `08-identity`, `09-gateway`, `14-finance`, `12-payments`.
- **Owner ke kaam:** Finance ka Vercel project ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §2.7 `FINANCE` (`AC-FINANCEAPP-1` se `AC-FINANCEAPP-5`), aur apps ke saajhe criteria.
- **Manuals:** `manuals/finance/<ROLE_NAME>.md`, us role ke pehle feature ke PR me ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/FINANCE.md](../../testing/FINANCE.md), har feature ke PR me (DD-13).

## 9. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). ST-1 aur ST-2 charan 10 me (D-453), baaki charan 12 me. Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                               | Charan | Size   | Halat |
| ---- | --------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1 | App ka dhaancha, staff ka sign-in, Vercel project, manual aur testing | 10     | L (4)  | Baaki |
| ST-2 | Fail refund ka haath ka raasta                                        | 10     | S (1)  | Baaki |
| ST-3 | Payout batch                                                          | 12     | M (2)  | Baaki |
| ST-4 | Milaan ke nateeje aur suspense                                        | 12     | M (2)  | Baaki |
| ST-5 | Fees ki settings                                                      | 12     | S (1)  | Baaki |
| ST-6 | Exports aur registers                                                 | 12     | M (2)  | Baaki |
|      | **Kul**                                                               |        | **12** |       |

## Change log

| Version          | Date       | Badlav                                                                                      |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.1 | 2026-11-22 | Module 22 ka pehla spec, 6 subtasks (D-446) aur charan 10 ka hissa (D-453); code abhi nahi. |
