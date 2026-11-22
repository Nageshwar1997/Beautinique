# TASK 19: Super Admin app (state aur district)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `19-app-super-admin`; charan 2 se shuru (D-446). Progress: 0 / 11 points.

## 1. Lakshya

State aur district chalane wali team ka app: district ka switch aur live, district ke hubs aur Admins ki nigrani, area band karne ka surakshit kram, aur state ke level ki tayyari ([PRODUCT.md](../../PRODUCT.md) §3.2, D-015).

## 2. Scope

**Andar:** `frontend/super-admin` app (SPA, D-290; Vercel ka apna project, D-010): State Admin aur Super Admin ke roles ki screens.

**Bahar:**

- Switches, live aur area ka data: `10-logistics`. Grants aur appointments ka data: `08-identity`.
- State ka switch: Master (`20-app-master`). Sub-district aur hub ka switch: Admin (`18-app-admin`); upar wala role neeche ka switch chala sakta hai (D-015).

## 3. Functional requirements

1. **Dhaancha aur sign-in:** `frontend-app-shell` aur `frontend-auth-ui` se; staff ka sign-in authenticator ke saath; DESIGN ka staff data-dense parivaar (DS-5.6).
2. **District ka switch aur live:** sharten poori hon to live, bina deploy; adhoori hon to kaunsi shart baaki hai wo dikhe (AC-SUPERADMIN-1, D-037). Upar wala role neeche ka switch chala sake, audit ke saath (D-015).
3. **Nigrani:** district ke hubs, unki staff ki list ki halat ("Delivery Partner 1/2" jaisa nishaan, D-022) aur Admins.
4. **Area band karna:** pehle checkout pe rok, phir band, aur khule orders pe asar ki saaf jaankari (AC-SUPERADMIN-4, D-300).
5. **State Admin:** state ke districts aur Super Admins ki nigrani, naye district kholne ki tayyari, state ke kanooni kaam ki checklist (sab dummy), aur escalations ([PRODUCT.md](../../PRODUCT.md) §3.2).
6. **Appointments:** State Admin apne state ke Super Admins, aur Super Admin apne district ke Admins appoint kare ([ARCHITECTURE.md](../../ARCHITECTURE.md) §11 niyam 5).
7. **Staff kam ho jaaye:** in-app aur email ki chetavni, aur faisla Admin ka (staff bhare ya hub OFF) (D-022).

## 4. Niyam

1. Ek district ka Super Admin doosre district ki cheez badle to 404 (AC-SUPERADMIN-2, SR-035).
2. D-185 ki list ka kaam StepUpDialog se; code sahi to wahi kaam chale, page na badle (AC-SUPERADMIN-3).
3. Har likhne wala kaam audit me, aur lists me customer ki jaankari chhupi (AC-SUPERADMIN-5, SR-039).

## 5. Data model aur API

App ka apna data nahi; sab maalik services ke routes se, `frontend-api-client` ke typed client ke saath (CR-27).

## 6. Security

SR-026 (step-up), SR-035 (area ka scope), SR-039 (chhupi jaankari), SR-076 (audit); staff app ke saajhe niyam (session 12 ghante, authenticator, SR-005 ke headers).

## 7. Dependencies

- **Tika hai:** `03-frontend-kit`, `08-identity`, `09-gateway`, `10-logistics`.
- **Owner ke kaam:** Super Admin ka Vercel project ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §2.4 `SUPER ADMIN` (`AC-SUPERADMIN-1` se `AC-SUPERADMIN-5`), aur apps ke saajhe criteria.
- **Manuals:** `manuals/super-admin/<ROLE_NAME>.md`, us role ke pehle feature ke PR me ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/SUPER_ADMIN.md](../../testing/SUPER_ADMIN.md), har feature ke PR me (DD-13).

## 9. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                           | Charan | Size   | Halat |
| ---- | --------------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1 | App ka dhaancha, staff ka sign-in, Vercel project, manual aur testing ki shuruaat | 2      | L (4)  | Baaki |
| ST-2 | District ka switch aur live, sharten, hubs aur Admins ki nigrani                  | 2      | M (2)  | Baaki |
| ST-3 | Area band karne ka kram                                                           | 2      | S (1)  | Baaki |
| ST-4 | State Admin: nigrani, naye district ki tayyari aur kanooni checklist              | 2      | M (2)  | Baaki |
| ST-5 | Appointments: Super Admins aur Admins                                             | 3      | S (1)  | Baaki |
| ST-6 | Staff kam hone ki chetavni                                                        | 3      | S (1)  | Baaki |
|      | **Kul**                                                                           |        | **11** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 19 ka pehla spec aur 6 subtasks (D-446); code abhi nahi. |
