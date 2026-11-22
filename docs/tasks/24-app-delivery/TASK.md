# TASK 24: Delivery app (delivery partners ka PWA)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `24-app-delivery`; charan 9 se shuru (D-446). Progress: 0 / 15 points.

## 1. Lakshya

Delivery partner ka ek haath se chalne wala phone app: aaj ke kaam ki list, offline me bhi scans aur photo, darwaze pe code ya photo ka saboot, UPI ka QR, fail ki wajah aur return pickup. Code aur rakam ka sach hamesha server pe (D-042, D-301, SR-054).

## 2. Scope

**Andar:** `frontend/delivery` app (mobile-first PWA, offline; Vercel ka apna project, D-010): Delivery Partner ke kaam ([PRODUCT.md](../../PRODUCT.md) §3.2). Desktop pe beech me phone jitni chaudai (DS-5.8).

**Bahar:**

- Assignment, attempts, codes, RTO aur pickup ka data: `10-logistics`. QR: `12-payments`.
- Partner ki kamaai aur payout (D-104), aur Rider Team Lead ke kaam: R2 ya "module ke saath".

## 3. Functional requirements

1. **Dhaancha aur sign-in:** email aur password, Hub Manager ka manzoor ek phone, session usi phone pe misaal 14 din; Hub Manager band kare to agla sync 401 (D-183, AC-DELIVERY-7). Pehle sign-in pe partner ka data notice aur location ka consent (DS-9.25, D-254).
2. **Dikhawat:** neeche ki action bar me main kaam, upar online ya offline aur "N waiting to sync" ki patti; Sunlight mode default chalu, touch targets 48 px (DS-5.8, AC-DELIVERY-8); app purana ho to UpdateBanner, aur purane version ke line me ruke kaam bhi sync me maane jaayein (AC-DELIVERY-9).
3. **Offline line:** list, scans aur photo IndexedDB me rukein aur network aate hi ek baar sync (AC-DELIVERY-1, [ARCHITECTURE.md](../../ARCHITECTURE.md) §5 niyam 6); delivered ya cancel parcel ka data turant hate, shift khatam ya sign-out pe sab saaf (AC-DELIVERY-6, SR-010, SR-023).
4. **Code wali delivery:** sirf online; offline me button band, wajah ke saath (AC-DELIVERY-2); 5 galat pe code daalna band jab tak Hub Manager na khole; app ke data me code kabhi nahi (AC-DELIVERY-3, SR-054).
5. **Photo wali delivery:** pehli photo ya location se pehle app ki samjhane wali screen, phir browser ka prompt; mana ho to wapas chalu karne ka tareeka aur "No location" ka raasta; file input pe `capture` (AC-DELIVERY-5, SR-055, D-351).
6. **Stop ki detail:** address, aur pin wala chhota map (DS-7.10, SR-091).
7. **Delivery pe UPI:** server ka QR exact rakam ka (test mode me Payment page ka link); "Payment received" sirf webhook ke baad; "paid" ka koi button nahi; fail pe misaal 10 minute tak QR, phir "attempt fail" (AC-DELIVERY-4, SR-050).
8. **Fail:** wajah aur usi pal location; doosri koshish aur RTO ka raasta logistics ke niyam se (D-108).
9. **Return pickup (charan 10):** batch label na mile ya seal toota ho to pickup nahi aur wajah chuni jaaye; item ki photo zaroori (AC-DELIVERY-10, D-113).

## 4. Niyam

1. Partner sirf apne assigned parcels dekhe; delivered parcel ki jaankari chhupi (SR-035, SR-039).
2. Location sirf delivered, fail aur pickup ke pal (SR-056).
3. Service worker `/api/*` aur private media kabhi cache nahi karta (DS-10.8).

## 5. Data model aur API

Server pe app ka apna data nahi; sab `10-logistics` aur `12-payments` ke routes se, `frontend-api-client` ke typed client ke saath (CR-27). Phone pe sirf offline line ka data, SR-023 ke hisaab se.

## 6. Security

SR-010 aur SR-023 (offline data), SR-050 (UPI ka QR), SR-054 (code), SR-055 aur SR-056 (photo aur location), SR-091 (map); app ke saajhe niyam (SR-005 ke headers).

## 7. Dependencies

- **Tika hai:** `03-frontend-kit` (`frontend-pwa`, `frontend-maps`), `08-identity`, `09-gateway`, `10-logistics`, `12-payments`, `06-media`.
- **Owner ke kaam:** Delivery ka Vercel project; asli Android phone pe jaanch (D-375, RG-12) ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §2.9 `DELIVERY` (`AC-DELIVERY-1` se `AC-DELIVERY-10`), aur apps ke saajhe criteria.
- **Manuals:** `manuals/delivery/DELIVERY_PARTNER.md`, pehle feature ke PR me ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/DELIVERY.md](../../testing/DELIVERY.md), har feature ke PR me (DD-13).

## 9. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                                  | Charan | Size   | Halat |
| ---- | ---------------------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1 | App ka dhaancha, sign-in, data notice, Sunlight mode, Vercel project, manual aur testing | 9      | L (4)  | Baaki |
| ST-2 | Offline line aur sync                                                                    | 9      | L (4)  | Baaki |
| ST-3 | Stop ki detail, code wali aur photo wali delivery                                        | 9      | M (2)  | Baaki |
| ST-4 | Delivery pe UPI ka QR                                                                    | 9      | M (2)  | Baaki |
| ST-5 | Fail ki wajah aur doosri koshish                                                         | 9      | S (1)  | Baaki |
| ST-6 | Return pickup                                                                            | 10     | M (2)  | Baaki |
|      | **Kul**                                                                                  |        | **15** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 24 ka pehla spec aur 6 subtasks (D-446); code abhi nahi. |
