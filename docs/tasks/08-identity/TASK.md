# TASK 08: identity (accounts, sign-in, sessions, roles aur grants)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `08-identity`; charan 1 se shuru (D-446). Progress: 0 / 32 points.

## 1. Lakshya

Har app parivaar ka apna account (D-304), har app ka apna sign-in aur cookies (D-186), staff pe authenticator, sessions jo chori pakad lein, aur roles aur grants jo scope ke saath kaam ka haq tay karein ([ARCHITECTURE.md](../../ARCHITECTURE.md) §11).

## 2. Scope

**Andar:** identity service (`backend/identity`): accounts aur insaan ka jod, allowlist, credentials, authenticator aur recovery codes, sessions, devices, signing keys, roles, grants aur scope, invites, consents aur 18+ ka record, account delete.

**Bahar:**

- Har request pe session ki jaanch aur rate limit: `09-gateway` (identity ka facade bulata hai).
- Codes ke emails bhejna: `07-notify`.
- Sign-in ki screens: `03-frontend-kit` ka `frontend-auth-ui` aur apps ke modules.
- Kaun kis role ko appoint kare uski screens: `20-app-master` aur baaki staff apps.

## 3. Functional requirements

### 3.1 Accounts aur allowlist

1. Har app parivaar (customer, seller, partner, Creator, staff) ka alag account; email wahi ho sakta hai, unique `(emailNorm, family)` (D-304, SR-092).
2. `emailNorm`: aage-peeche ki jagah hatao, lowercase, domain IDNA se ASCII; `+` aur dots waise hi (SR-092).
3. Owner ke har role ka alag account, sab ek insaan se jude (D-017, D-047).
4. Live site pe sign-up, sign-in aur order sirf allowlist ke emails se, setting se, bina deploy (D-133). Entry ka type `exact` ya `aliases`; `aliases` sirf owner ke base emails pe, testers ki entry hamesha `exact` (SR-092, D-405). Allowlist se email hate to uske saare sessions band.
5. Allowlist ke bahar har raasta (password, social, email code, invite, seller aur partner sign-up, waitlist) pe account nahi aur "demo store" ka sandesh (SR-018).

### 3.2 Password aur rok

1. 12 se 128 akshar, koi "capital aur number" niyam nahi; leak hue passwords ki range API se jaanch; API band ho to password maana jaaye, nishaan ke saath, aur agle sign-in pe dobara jaanch (SR-013).
2. Galat koshish pe rok IP aur account mila ke: misaal ek IP se 10 galat pe us IP ki 1 ghante rok, sab IPs se 50 pe account 15 minute; rok me bhi reset chale; owner ko alert (D-182, SR-014).
3. Registered aur anjaan email pe ek jaisa jawab, kam se kam tay samay ke baad (SR-019).
4. Code wale emails ki seema: ek email ko ghante me 5 (ek IP se 3), sab mila ke ghante me 30, sign-up din me 20 (misaal) (D-187, SR-020).

### 3.3 Sessions aur tokens

1. Cookies sirf apne host ki: access `__Host-`, `SameSite=Lax`; refresh `__Secure-`, `SameSite=Strict`, sirf sign-in wale API path pe (SR-027).
2. Access token chhota (misaal 10 minute); refresh har istemaal pe badle; purane token ka dobara istemaal pakda jaaye to poori family band aur security email; usi device se misaal 60 second ke andar chori nahi maana jaata (SR-028).
3. Token ka `aud` app; `alg` ki pakki list; signing keys badalna (misaal 30 din); keys na milein to 503 (SR-031, D-197).
4. Umar app parivaar se: Customer 30 din aage, max 90 (D-180); staff 12 ghante, 30 minute bina kaam pe band (D-181); Seller 7 din aage, max 30; Creator 30 din aage, max 90; Delivery usi phone pe misaal 14 din (D-183).
5. Gateway ke liye session aur revoke ki jaanch ka facade (SR-029); background ke calls "aakhri kaam" nahi badhate (SR-094).

### 3.4 Staff ka doosra factor

1. Staff apps me har sign-in pe authenticator code (TOTP); wahi code dobara nahi (D-199, SR-011).
2. Recovery codes sirf hash, ek baar (SR-022).
3. Step-up: D-185 ki tay list ke kaam pe taaza code, misaal 5 minute ki khidki (SR-026).
4. Authenticator kho jaaye: pehle recovery codes, phir Master se reset (code, audit, saare sessions band, email, owner ko alert); Master ka reset recovery codes ya laptop ka break-glass command (D-200).

### 3.5 Roles, grants aur scope ([ARCHITECTURE.md](../../ARCHITECTURE.md) §11)

1. Role permissions ka set, data me; shuru ke roles release step ke seed se; Master bina deploy naya sub-role bana sake, par SR-037 wali permissions kisi sub-role me nahi.
2. Grant = account + role + scope + shuru aur khatam ki tareekh + kisne diya; har badlav dobara code ke saath aur audit me.
3. Scope ke type `self`, `seller`, `state`, `district`, `subDistrict`, `hub`, `warehouse`, `national`, `global`; kaun kise appoint kare §11 niyam 5 ki table se; koi khud ko ya barabar wale ko appoint nahi (SR-037).
4. Kaam ka bantwara (§11 niyam 6) ke niyam jo identity pe tike hain.

### 3.6 Invites

Staff aur partners sirf invite se: ek baar, misaal 72 ghante, usi email se; token sirf hash (SR-025).

### 3.7 Seller aur partner parivaar

1. Seller sign-up allowlist se (SR-018); seller ka staff sirf Account Owner de; authenticator jokhim ke hisaab se (D-184, SR-024); seller ka grant `catalog.seller.statusChanged` se.
2. Delivery partner: email aur password, Hub Manager ka manzoor ek phone, session usi phone pe; Hub Manager session band kar sake (D-183); partner ka grant `logistics.partner.activated` se.

### 3.8 Customer

1. Sign-up sirf 18+, aur har consent ka record (notice ka version, samay, raasta), sirf jodne wala; marketing opt-in alag aur khaali shuru (D-038, D-150, D-255).
2. Sign-in ke teen raaste: password, email code (ek baar, 5 koshish, 10 minute, usi browser me; SR-015) aur social (Google, LinkedIn, GitHub; `state`, PKCE, `nonce`, verified email; aakhri tareeka hatana mana; SR-017) (D-021).
3. "My devices" se session band; security badlav pe dobara pehchaan (D-180).
4. Profile sudhaar, marketing consent band, aur account delete: dobara pehchaan, 7 din me wapsi, phir `identity.account.erased` (D-151, SR-066).

## 4. Niyam

1. Codes, recovery codes aur invite tokens sirf hash ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.3 niyam 7).
2. Code ek baar aur 5 koshish tak, ek conditional update se; delete ka 7 din ka timer, wapsi pe cancel (§10.7 niyam 2).
3. Refresh token `<sessionId>.<random>`, session me abhi aur pichhla hash; consents sirf jodna (§10.7 niyam 1).
4. Master ke paas koi "decide" permission nahi (§11 niyam 6.5).

## 5. Data model

| Collection        | Kaam                                                  | Retention class  | Samay                               |
| ----------------- | ----------------------------------------------------- | ---------------- | ----------------------------------- |
| `accounts`        | Account (parivaar, `emailNorm`, halat), insaan ka jod | `account`        | Delete pe tombstone                 |
| `allowlist`       | `exact` aur `aliases` entries                         | `ref`            | Hamesha                             |
| `credentials`     | Password hash, social links                           | `account`        | Delete pe                           |
| `authenticators`  | TOTP ka secret (encrypted), recovery codes ka hash    | `account`        | Delete pe                           |
| `sessions`        | Session, refresh ka abhi aur pichhla hash, device     | `tech`           | Umar khatam pe TTL                  |
| `devices`         | Customer ke devices, partner ka manzoor phone         | `account`        | Delete pe                           |
| `codes`           | Email codes ka hash, koshish ki ginti                 | `tech`           | 10 minute ke baad TTL               |
| `signing_keys`    | Token ki keys, umar ke saath                          | `tech`           | Badalne ke baad apne samay pe       |
| `roles`, `grants` | Permissions ke set; account + role + scope + samay    | `ref`, `account` | Grant khatam ke baad audit ke samay |
| `invites`         | Invite token ka hash, email, role, khatam ka samay    | `tech`           | 72 ghante ke baad TTL               |
| `consents`        | Consent aur 18+ ka record, sirf jodna                 | `account`        | Rok ke niyam se                     |

Saath me platform collections ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2). Fields aur indexes code ke saath is file me judte hain.

## 6. API

Routes contracts me ([tasks/README.md](../README.md)): har app ka sign-up, sign-in, sign-out, refresh, codes, authenticator, recovery codes, step-up, devices, profile, delete; staff ke invites, roles aur grants. Facade: gateway ke liye session ki jaanch (§2.3). Bhejta hai: `identity.account.created`, `.changed`, `.erased`; `identity.grant.changed`; `identity.consent.recorded`. Leta hai: `catalog.seller.statusChanged`, `logistics.partner.activated` ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

## 7. Security

SR-011, SR-013 se SR-019, SR-022, SR-024 se SR-029, SR-031, SR-037, SR-066, SR-092, SR-094. Sabse zyada jokhim wala module: kernel ke hisse (grants aur scope, step-up ki list) pe mutation (RT-21).

## 8. Dependencies

- **Tika hai:** `02-platform`, `07-notify` (codes ke emails), `05-audit`.
- **Is pe tike:** `09-gateway` aur saare apps.
- **Owner ke kaam:** Google, LinkedIn aur GitHub ke sign-in apps, customer ke charan se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.3 `IDENTITY` (`AC-IDENTITY-1` se `AC-IDENTITY-13`).
- **Manuals aur testing:** sign-in, devices aur account ke kaam har app ke manual me; saare apps me ek jaisa ho to ek hi baar [manuals/COMMON.md](../../manuals/COMMON.md) me (D-440), aur testing ki file usi app ke module me.

## 10. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446): staff ka sign-in charan 1 me (Master), roles aur invites charan 3 me, seller charan 4 me, customer charan 7 me, delivery partner charan 9 me. Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                                  | Charan | Size   | Halat |
| ----- | ------------------------------------------------------------------------ | ------ | ------ | ----- |
| ST-1  | Service ka dhaancha, parivaar ke accounts, `emailNorm` aur allowlist     | 1      | M (2)  | Baaki |
| ST-2  | Password, leak ki jaanch, rok, ek jaisa jawab aur codes ki seemaayein    | 1      | L (4)  | Baaki |
| ST-3  | Sessions, cookies, refresh ki family, signing keys aur gateway ka facade | 1      | L (4)  | Baaki |
| ST-4  | Staff ka authenticator, recovery codes, step-up aur reset                | 1      | L (4)  | Baaki |
| ST-5  | Roles, grants aur scope; appoint ke niyam                                | 3      | L (4)  | Baaki |
| ST-6  | Invites                                                                  | 3      | M (2)  | Baaki |
| ST-7  | Seller parivaar: sign-up, seller ka staff, jokhim wala authenticator     | 4      | M (2)  | Baaki |
| ST-8  | Customer ka sign-up: 18+ aur consents                                    | 7      | M (2)  | Baaki |
| ST-9  | Customer sign-in ke teen raaste                                          | 7      | L (4)  | Baaki |
| ST-10 | "My devices", profile aur account delete                                 | 7      | M (2)  | Baaki |
| ST-11 | Delivery partner: phone ki manzoori aur session                          | 9      | M (2)  | Baaki |
|       | **Kul**                                                                  |        | **32** |       |

## Change log

| Version | Date       | Badlav                                                           |
| ------- | ---------- | ---------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 08 ka pehla spec aur 11 subtasks (D-446); code abhi nahi. |
