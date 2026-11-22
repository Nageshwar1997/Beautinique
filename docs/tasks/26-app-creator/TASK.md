# TASK 26: Creator app (creators aur affiliates)

> **Status:** v1.0.0 (2026-11-22). Halat: planning (R2); code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `26-app-creator`, R2 (D-055, D-446). Progress: 0 / 15 points (sirf ecosystem ke % me).

> **R2 ka draft:** ye `TASK.md` R2 ke tay faislon se abhi bani hai; R2 ki planning me iske features, subtasks aur sizes badal sakte hain (owner, 2026-11-22; D-454).

## 1. Lakshya

Bahar ke creators aur affiliates ka app: apna storefront aur looks, links aur codes, aur commission jo return ki muddat ke baad pakka hota hai. Har sujhaav ke saath saaf disclosure ([PRODUCT.md](../../PRODUCT.md) §3.2).

## 2. Scope

**Andar:** `frontend/creator` app (SPA, D-290; Vercel ka apna project, D-010): Creator, Affiliate Partner aur Creator Agency Manager.

**Bahar:**

- Creators, links, codes, attribution aur commission ka data: inka maalik service abhi tay nahi (R2 ki planning me tay).
- Creators ki manzoori aur disclosure ki jaanch: `25-app-growth-studio`. Commission ka payout aur TDS: `14-finance`.

## 3. Functional requirements

1. **Dhaancha aur sign-in:** sign-up allowlist se (D-133); Creator ka session 30 din aage, max 90 din (D-181); D-181 ke Creator niyam (ACCEPTANCE §4).
2. **Storefront aur looks:** apna storefront aur looks, platform ke products se, har jagah disclosure ka saaf label.
3. **Links aur codes:** creator ke links aur codes; click aur order ka jod (attribution), customer ki pehchaan ke bina.
4. **Commission:** return ki muddat ke baad pakka; statement aur payout ki halat.
5. **Affiliate Partner:** sirf links aur codes.
6. **Creator Agency Manager:** apne creators ki taraf se kaam, har creator ki consent ke saath.

## 4. Niyam

1. Creator ko customer ki pehchaan kabhi nahi (D-143 jaisa niyam).
2. Kisi creator ke code se platform ke offer ke niyam nahi badalte (D-102).
3. Disclosure ke bina koi sujhaav nahi.

## 5. Data model aur API

App ka apna data nahi; maalik services ke routes se (R2 ki planning ke baad), `frontend-api-client` ke typed client ke saath (CR-27).

## 6. Security

SR-018 (allowlist), SR-034 jaisa creator ki deewar, SR-075 (exports), SR-085 (codes ki redemption); app ke saajhe niyam.

## 7. Dependencies

- **Tika hai:** `03-frontend-kit`, `08-identity`, `09-gateway`, `11-catalog`, `14-finance`, aur creators ka maalik service (R2 ki planning me tay).
- **Owner ke kaam:** Creator ka Vercel project ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §4 ka R2 ka chhota khaka; poore criteria R2 ki planning me.
- **Manuals:** `manuals/creator/<ROLE_NAME>.md` ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/CREATOR.md](../../testing/CREATOR.md) (DD-13).

## 9. Subtasks

Saare R2 me ([PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5). Sizes R2 ki planning me dobara dekhe jaayenge. Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                  | Charan | Size   | Halat |
| ---- | ------------------------------------------------------------------------ | ------ | ------ | ----- |
| ST-1 | App ka dhaancha, sign-up aur sign-in, Vercel project, manual aur testing | R2     | L (4)  | Baaki |
| ST-2 | Storefront aur looks, disclosure ke saath                                | R2     | L (4)  | Baaki |
| ST-3 | Links, codes aur attribution                                             | R2     | M (2)  | Baaki |
| ST-4 | Commission aur statement                                                 | R2     | M (2)  | Baaki |
| ST-5 | Affiliate Partner                                                        | R2     | S (1)  | Baaki |
| ST-6 | Creator Agency Manager                                                   | R2     | M (2)  | Baaki |
|      | **Kul**                                                                  |        | **15** |       |

## Change log

| Version | Date       | Badlav                                                                                  |
| ------- | ---------- | --------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 26 ka pehla spec aur 6 subtasks (R2, D-446, D-454); R2 ka draft; code abhi nahi. |
