# TASK 20: Master app (owner aur governance)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `20-app-master`; charan 1 me dhaancha aur sign-in, baaki apne charan me (D-446). Progress: 0 / 26 points.

## 1. Lakshya

Owner aur governance ka app: system ki sehat aur alerts, allowlist aur kill switches, settings, location ka import aur area ka switch, top roles ke grants, kanooni orders aur policies, payout ki manzoori aur aankde. Koi "decide" permission nahi, approvals ka koi bypass nahi ([PRODUCT.md](../../PRODUCT.md) §3.2, SR-037).

## 2. Scope

**Andar:** `frontend/master` app (SPA, D-290; Vercel ka apna project, D-010): Master, Head of Operations, Nodal Officer, Security Contact, Marketplace Fairness Analyst aur Internal Auditor ke roles ki screens ([PRODUCT.md](../../PRODUCT.md) §3.2).

**Bahar:**

- Screens ke peeche ka kaam aur data: maalik services ke modules (logs, audit, identity, logistics, finance ...). Master sirf unke routes bulata hai.
- Trust & Safety Lead aur Marketing Head ke kaam (Master ke alag accounts, D-047): apne apps aur modules me.
- Break-glass aur backup: laptop ke commands (`27-operations`), app me nahi.

## 3. Functional requirements

1. **Dhaancha aur sign-in:** `frontend-app-shell` aur `frontend-auth-ui` se; staff ka sign-in authenticator ke saath (D-199); app ka naam aur host sign-in pe (DS-5.10); jaagne ka parda (DS-6.9); IdleWarning (DS-6.10).
2. **Ops page** ([OPERATIONS.md](../../OPERATIONS.md) §7 niyam 6): aakhri jaag, aakhri sweep, har roz ke kaam ka aakhri poora din, aakhri backup ki tareekh (haath se darj) aur khule alerts; dead letter dobara chalana sirf permission ke saath (§3 niyam 6).
3. **Ops aur security inbox:** alerts gambhirta ke saath (SR-078); owner ke alerts ki push subscription device se (SR-101, D-401).
4. **Logs aur audit dekhna:** logs sirf owner, `logs.read` aur dobara code ke saath, samay-khidki ya request id se, wajah ke saath (SR-100); audit owner aur Internal Auditor ke liye sirf padhna (SR-076).
5. **Allowlist aur kill switches:** badlav dobara code ke saath aur audit me; hataye gaye email ke sessions band (D-133); kill switch pe us flow ka saaf sandesh (SR-009, DS-6.7); "sab sessions band".
6. **Settings:** maalik services ki settings API se, bina deploy; har badlav dobara code ke saath aur audit me (SR-043, [ARCHITECTURE.md](../../ARCHITECTURE.md) §2.4 niyam 7). Fees, commission aur policies ka badlav ek account kare aur doosra manzoor kare (§11 niyam 6.4).
7. **Location aur area:** location master ka import, pehle dry run aur schema ki jaanch, galat file ka koi asar nahi, audit me ginti (D-022, SR-043); state ka switch aur live (D-015).
8. **Roles aur grants:** top roles ke grants §11 niyam 5 ki table se; naya sub-role bina deploy, par SR-037 wali permissions kisi sub-role me nahi; koi khud ko appoint nahi; authenticator reset (D-200).
9. **Nodal Officer:** policies aur seller agreement ke versions (D-150); sarkari aur court ke orders, aur content chhupane ke tools ek jagah, bina deploy, ghadi aur kaam audit me (D-251, [OPERATIONS.md](../../OPERATIONS.md) §8 niyam 9).
10. **Payout batch ki manzoori:** Finance ka bana batch Master ka doosra account dobara code se manzoor kare; banane wala account manzoor nahi kar sakta (D-189).
11. **Aankde:** owner ke aankde business events se (D-149, D-157), gateway ke composition route se ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.4 niyam 8).

## 4. Niyam

1. Master ke paas koi "decide" permission nahi: listing ki manzoori ya grant dene wala sub-role Master ke account se nahi (SR-037).
2. Har bada kaam D-185 ki list se dobara code (StepUpDialog).
3. Har screen DESIGN §5 ke staff data-dense parivaar ki (DS-5.6): sidebar me sirf permission wale sections.

## 5. Data model aur API

App ka apna data nahi; sab maalik services ke routes se, `frontend-api-client` ke typed client ke saath (CR-27).

## 6. Security

SR-009 (kill switches), SR-037 (Master ki seema), SR-043 (settings aur imports audit me), SR-076, SR-078, SR-100, SR-101; staff app ke saajhe niyam (session 12 ghante, authenticator, SR-005 ke headers).

## 7. Dependencies

- **Tika hai:** `03-frontend-kit`, `08-identity`, `09-gateway`, `04-logs`, `05-audit`, `07-notify`; apne charan me `10-logistics` (location aur area), `14-finance` (payout) aur baaki maalik services ki settings.
- **Owner ke kaam:** Master ka Vercel project ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3); OT-1 (location data) charan 2 ke import se pehle.

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §2.5 `MASTER` (`AC-MASTER-1` se `AC-MASTER-7`), aur apps ke saajhe criteria.
- **Manuals:** har role ka manual `manuals/master/<ROLE_NAME>.md`, us role ke pehle feature ke PR me ([manuals/README.md](../../manuals/README.md), D-440).
- **Testing:** [testing/MASTER.md](../../testing/MASTER.md), har feature ke PR me (DD-13).

## 9. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                                           | Charan | Size   | Halat |
| ----- | --------------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1  | App ka dhaancha, staff ka sign-in, Vercel project, manual aur testing ki shuruaat | 1      | L (4)  | Baaki |
| ST-2  | Ops page, ops aur security inbox, alerts ki device subscription                   | 1      | M (2)  | Baaki |
| ST-3  | Logs aur audit dekhna                                                             | 1      | M (2)  | Baaki |
| ST-4  | Allowlist aur kill switches                                                       | 1      | M (2)  | Baaki |
| ST-5  | Settings ki screen (maalik services ki settings API)                              | 1      | M (2)  | Baaki |
| ST-6  | Location master ka import aur state ka switch aur live                            | 2      | L (4)  | Baaki |
| ST-7  | Roles, sub-roles, grants aur authenticator reset                                  | 3      | L (4)  | Baaki |
| ST-8  | Policies aur seller agreement ke versions                                         | 4      | S (1)  | Baaki |
| ST-9  | Sarkari aur court ke orders, content chhupane ke tools                            | 11     | M (2)  | Baaki |
| ST-10 | Payout batch ki manzoori                                                          | 12     | S (1)  | Baaki |
| ST-11 | Owner ke aankde                                                                   | 13     | M (2)  | Baaki |
|       | **Kul**                                                                           |        | **26** |       |

## Change log

| Version | Date       | Badlav                                                           |
| ------- | ---------- | ---------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 20 ka pehla spec aur 11 subtasks (D-446); code abhi nahi. |
