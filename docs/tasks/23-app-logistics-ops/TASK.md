# TASK 23: Logistics Ops app (warehouse, hub aur logistics ki team)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `23-app-logistics-ops`; charan 6 se shuru (D-446). Progress: 0 / 21 points.

## 1. Lakshya

Warehouse aur hub ke haath ke kaam ka app, scan pehle: maal lena, pick aur pack, trips, hub pe sort, partners sambhalna aur lauta maal jaanchna. Har scan ka nateeja saaf, aur wahi scan dobara pe koi doosra asar nahi (DS-5.7).

## 2. Scope

**Andar:** `frontend/logistics-ops` app (SPA, D-290; Vercel ka apna project, D-010): Logistics Head, Warehouse Manager, Receiving Executive, Pick-Pack Associate, Returns QC Inspector, Inventory Controller, Hub Manager aur Hub Operations Executive ke R1 wale kaam ([PRODUCT.md](../../PRODUCT.md) §3.2). Tablet aur haath ke scanner dono pe; map R1 me nahi.

**Bahar:**

- Screens ke peeche ka data aur niyam: `13-commerce` (stock, receiving, pick, pack, return ki jaanch) aur `10-logistics` (warehouses, hubs, area settings, trips, partners, RTO).
- "Module ke saath" wale roles (Network Planner, Line-haul & Stock Transfer, Returns-to-Vendor, Rider Onboarding & Compliance, Delivery Partner Support, Logistics Control Tower, Loss Prevention, District aur Regional Logistics): shuru me upar wale role ke paas; apni screens jab unka kaam bade.

## 3. Functional requirements

1. **Dhaancha aur scan (charan 6):** staff ka sign-in authenticator ke saath; scan ki screen pe input hamesha focus me, bade buttons (48 px), har scan ka nateeja bade shabd, rang aur icon me ("Accepted", "Wrong bin", "Already scanned"), awaaz aur vibration jahan browser de (AC-LOGISTICSOPS-1, DS-5.7).
2. **Receiving (charan 6):** ASN dekhna, batch aur expiry ki jaanch, barcode na ho to platform ka label sirf khaali jagah pe aur uski photo, farak photo ke saath seller ko, aur "accept" scan (AC-LOGISTICSOPS-2, D-096, D-097, D-230).
3. **Logistics Head (charan 6):** warehouses aur hubs, area settings (delivery fee, cut-off, chhuttiyan, delivery pe UPI ki seema), aur Warehouse aur Hub Managers ki appointment (D-107, D-117, D-109).
4. **Inventory Controller (charan 6):** ginti aur bikri band ki seema (D-062).
5. **Pick aur pack (charan 9):** galat bin scan mana, pack ki photo zaroori, pack ke beech network ruke to dobara chalane pe ek hi invoice; invoice aur label (AC-LOGISTICSOPS-3, D-077, D-106).
6. **Trips (charan 9):** Warehouse Manager warehouse se hub ki trip banata hai: transporter, manifest aur seal (D-027).
7. **Hub (charan 9):** hub pe receive me manifest aur seal ka milaan aur kam bag ka nishaan (AC-LOGISTICSOPS-4, SR-057); sort; Hub Manager partners ka invite, naye phone ki manzoori aur ek click se session band karna (AC-LOGISTICSOPS-5, D-183); code ki 6th koshish kholna; ruke parcels ki list, misaal 3 din wale laal, aur RTO (AC-LOGISTICSOPS-6, D-108).
8. **Returns QC (charan 10):** lauta maal jaanchna, nateeja wajah ke hisaab se darj, refund chhodna ya rokna (AC-LOGISTICSOPS-6, D-112, D-115).

## 4. Niyam

1. Har staff sirf apne warehouse ya hub ki cheezein dekhe; baaki pe 404 (SR-035).
2. Scan aur pack ke routes idempotency key ke saath (CR-16, [ARCHITECTURE.md](../../ARCHITECTURE.md) §5 niyam 10).
3. Lists me customer ki jaankari chhupi (SR-039, DS-10.5).

## 5. Data model aur API

App ka apna data nahi; sab maalik services ke routes se, `frontend-api-client` ke typed client ke saath (CR-27).

## 6. Security

SR-023 (partner ka phone), SR-035 (scope), SR-039 (chhupi jaankari), SR-057 (trip ke scans), SR-076 (audit); staff app ke saajhe niyam (session 12 ghante, authenticator, SR-005 ke headers).

## 7. Dependencies

- **Tika hai:** `03-frontend-kit`, `08-identity`, `09-gateway`, `10-logistics`, `13-commerce`, `06-media`.
- **Owner ke kaam:** Logistics Ops ka Vercel project ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §2.8 `LOGISTICS OPS` (`AC-LOGISTICSOPS-1` se `AC-LOGISTICSOPS-6`), aur apps ke saajhe criteria.
- **Manuals:** `manuals/logistics-ops/<ROLE_NAME>.md`, us role ke pehle feature ke PR me ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/LOGISTICS_OPS.md](../../testing/LOGISTICS_OPS.md), har feature ke PR me (DD-13).

## 9. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                               | Charan | Size   | Halat |
| ---- | ------------------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1 | App ka dhaancha, staff ka sign-in, scan ki screen, Vercel project, manual aur testing | 6      | L (4)  | Baaki |
| ST-2 | Receiving: batch, expiry, label, farak aur "accept" scan                              | 6      | M (2)  | Baaki |
| ST-3 | Logistics Head: warehouses, hubs, area settings aur managers                          | 6      | M (2)  | Baaki |
| ST-4 | Inventory Controller: ginti aur bikri band ki seema                                   | 6      | S (1)  | Baaki |
| ST-5 | Pick aur pack                                                                         | 9      | L (4)  | Baaki |
| ST-6 | Trips: transporter, manifest aur seal                                                 | 9      | M (2)  | Baaki |
| ST-7 | Hub: receive, sort, partners, code ki 6th koshish, ruke parcels aur RTO               | 9      | L (4)  | Baaki |
| ST-8 | Returns QC                                                                            | 10     | M (2)  | Baaki |
|      | **Kul**                                                                               |        | **21** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 23 ka pehla spec aur 8 subtasks (D-446); code abhi nahi. |
