# TASK 04: logs (request logs, errors aur ops ki nigrani)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `04-logs`, charan 1 (D-446). Progress: 0 / 9 points.

## 1. Lakshya

Request logs kanooni samay tak surakshit rakhna (D-285, D-250, CL-106), server aur apps ki errors pakadna (D-286), aur system ki sehat ka snapshot aur alerts (D-297), sab ₹0 pe aur bina personal data ke.

## 2. Scope

**Andar:** logs service (`backend/logs`) aur uska apna Atlas cluster; request logs ke chunks; errors; ops snapshot aur alerts; `/health` aur `/ready`; logs padhne ka surakshit raasta.

**Bahar:**

- Structured logger aur redaction ka package: `02-platform` ka `backend-logger`.
- Audit aur security events: `05-audit`.
- Alerts ka bhejna (in-app inbox, push, email): `07-notify`. Master ka ops inbox aur logs ki screen: `20-app-master`.
- UptimeRobot aur jagane ke pings: `27-operations`.

## 3. Functional requirements

### 3.1 Request logs

1. Gateway har request ki ek line seedha logs service ko deta hai ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2); line me SR-077 ke fields, route ka template, request id aur UTC samay; raw URL, query aur personal data nahi (§8 niyam 1 aur 3).
2. Lines misaal har 60 second ya 1,000 lines pe ek gzip chunk; ek chunk ek document (§8 niyam 2).
3. Chunk ka TTL setting se: abhi 180 din, lagbhag 13 May 2027 se 365 din (D-250 niyam 5, §10.8 niyam 5).
4. Tay routes ke bahar ki rejected requests aur `/wake` ki pings: aam din har request ki line; ek IP se seema ke upar sirf ginti, pehle aur aakhri samay aur route ke saath (SR-105).

### 3.2 Errors (D-286)

1. Server ki har error fingerprint ke saath; error objects ke log me headers, keys ya email nahi (SR-098).
2. Apps ki errors aur CSP ki reports ek rate-limited route se: strict schema, size misaal 4 KB, IP aur session pe seema, ek page load se misaal 10 tak, naye fingerprint ke group ghante me misaal 20 tak (SR-099).
3. Nayi error ki khabar aur roz ka saar Master ke ops inbox me; text sirf text, koi HTML ya link nahi (SR-099).

### 3.3 Ops snapshot aur alerts (D-297)

1. Har 60 second (jab server jaaga ho): RSS, heap, event loop ki der, chalte requests, har queue ki gehrai, sabse purane outbox event ki umar, dead letters, Redis ki memory aur connections, DB pool ka intezaar, aur ghante ke bheje bytes (SR-105); roz ka saar logs me ([ARCHITECTURE.md](../../ARCHITECTURE.md) §8 niyam 6).
2. Seemaayein (misaal) §8 niyam 8 se; ek fingerprint ka alert misaal ghante me ek, theek hone pe "theek" ki khabar.
3. Alerts ops inbox aur push me; email sirf gambhir pe (SR-078).

### 3.4 `/health` aur `/ready`

`/health` sirf process aur event loop, kisi database tak nahi; `/ready` Mongo clusters, Redis, dispatcher aur ticker, finance nahi (§8 niyam 7, D-057).

### 3.5 Logs padhna (SR-100)

1. Sirf owner, `logs.read` permission aur dobara code (D-185) ke saath; ek samay-khidki ya request id se, wajah ke saath; har padhna audit me.
2. Audit ki har din ki chain ka aakhri hash logs me bhi rehta hai, taaki audit cluster ke bahar ek saboot ho (SR-100 niyam 1).

## 4. Niyam

1. Logs ka DB user sirf `insert` aur `find` (§10.8 niyam 5, D-402). Logs ke cluster me collections, validators aur TTL ka kaam sirf laptop ke release command se, alag credentials se; boot pe sirf fingerprint ki jaanch aur alert (§10.4 niyam 5, D-400).
2. Kabhi log nahi: SR-077 ki list, private media ke signed URLs, idempotency keys, event ka poora `data`, search ka text (§8 niyam 3).
3. Har record me server ka UTC samay; client ka samay sirf `deviceAt` ke roop me (§8 niyam 10).

## 5. Data model

| Collection      | Kaam                                                    | Retention class | Samay                        |
| --------------- | ------------------------------------------------------- | --------------- | ---------------------------- |
| `log_chunks`    | Request logs ke gzip chunks (`startAt`, `endAt`, ginti) | `tech`          | `startAt` pe TTL, setting se |
| `errors`        | Fingerprint, ginti, pehla aur aakhri samay, ek namuna   | `tech`          | Setting se                   |
| `ops_daily`     | Ops snapshot ka roz ka saar                             | `agg`           | Setting se                   |
| `audit_anchors` | Audit ki har din ki chain ka aakhri hash                | `tech`          | Audit ki umar jitna          |

Saath me platform collections ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2). Fields aur indexes code ke saath is file me judte hain.

## 6. API

Routes contracts me ([tasks/README.md](../README.md)): apps ki errors ka route (public, rate-limited), logs padhne ka route (owner, step-up), aur `/health`, `/ready`. Gateway aur audit facade se likhte hain (§2.3).

## 7. Security

SR-077 aur SR-098 (logs me kya nahi), SR-099 (apps ki errors ka route), SR-100 (logs aur audit ki suraksha), SR-105 (Render ke public host pe chhota jawab aur ginti), SR-078 (alerts).

## 8. Dependencies

- **Tika hai:** `02-platform`, aur alerts ke liye `07-notify`.
- **Is pe tike:** `09-gateway` (request logs), `05-audit` (din ka hash), `20-app-master` (ops inbox aur logs ki screen).
- **Owner ke kaam:** logs ka Atlas project aur free cluster, pehle live deploy se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.13 `LOGS` (`AC-LOGS-1` se `AC-LOGS-5`).
- **Manuals aur testing:** owner ke liye ops inbox aur logs padhna Master ke manual aur testing file me, usi PR me jisme screen bane (`20-app-master`, D-440, DD-13).

## 10. Subtasks

Saare charan 1 me ([PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5, D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                               | Charan | Size  | Halat |
| ---- | --------------------------------------------------------------------- | ------ | ----- | ----- |
| ST-1 | Service ka dhaancha aur request logs ke chunks (TTL, SR-105 ki ginti) | 1      | M (2) | Baaki |
| ST-2 | Errors: fingerprint, apps ki errors ka route, ops inbox ki khabar     | 1      | M (2) | Baaki |
| ST-3 | Ops snapshot, alerts ki seemaayein aur "theek" ki khabar              | 1      | M (2) | Baaki |
| ST-4 | `/health` aur `/ready`                                                | 1      | S (1) | Baaki |
| ST-5 | Logs padhne ka surakshit raasta aur audit ke din ka hash              | 1      | M (2) | Baaki |
|      | **Kul**                                                               |        | **9** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 04 ka pehla spec aur 5 subtasks (D-446); code abhi nahi. |
