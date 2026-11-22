# TASK 05: audit (kaun, kya, kab: sirf jodne wala record)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `05-audit`, charan 1 (D-446). Progress: 0 / 9 points.

## 1. Lakshya

Staff ke har likhne wale kaam, paise ke kaam, personal data dekhne, aur security events ka aisa record jo sirf judta hai, kabhi badalta nahi, aur jiski chhedchhad roz pakdi jaati hai (SR-076, D-194).

## 2. Scope

**Andar:** audit service (`backend/audit`) aur uska apna Atlas cluster; `audit.recorded` events ka hash chain me judna; security events; roz ki chain aur uski jaanch; purane din ke chunks; audit padhne ka raasta.

**Bahar:**

- Har service ka `audit.recorded` event usi transaction me likhna: `02-platform` ka `backend-events` aur har service ka module.
- Alerts ka bhejna: `07-notify`. Audit dekhne ki screen aur owner ka security inbox: `20-app-master`.
- Din ke aakhri hash ki copy rakhna: `04-logs`.

## 3. Functional requirements

1. **Entry:** har `audit.recorded` event se ek entry: account, insaan ka jod (owner ke saare accounts ek insaan se, D-017, D-047), role, app, session, kaam, cheez, scope, pehle aur baad (chhupa), wajah, nateeja, IP, browser, request id aur samay (SR-076). Har entry ka `contentHash`.
2. **Kya audit me:** staff ka har likhne wala kaam, paise ke kaam, settings aur imports, exports, personal data dekhna, security events, seller ke daam ke badlav aur listing versions; mana hue kaam (403) bhi (SR-076).
3. **Badlav hai to audit hai:** badlav aur `audit.recorded` ek hi transaction me; event likhna fail ho to poora badlav ulta ([ARCHITECTURE.md](../../ARCHITECTURE.md) §3 niyam 10).
4. **Security events:** alag record, 1 saal (D-194). Bahut baar aane wale (customer ka galat password, galat code, rate limit ka 429) per IP aur account ek minute ka ek gina hua record (pehla aur aakhri samay, ginti); staff ke kaam aur baaki security events hamesha ek-ek (SR-100 niyam 2).
5. **Roz ki chain:** roz ka job pichhle din se judi din ki chain (`audit_days`) banata hai aur jaanchta hai; din gayab, ginti ghati ya chain tooti to gambhirta 1 ka alert (SR-076, SR-078, SR-100 niyam 1). Finance wali jaanch hafte me ek, Neon ke ghante dekh ke (R-014).
6. **Din ka hash bahar bhi:** har din ki chain ka aakhri hash `04-logs` me aur owner ke roz ke security saar me (SR-100 niyam 1).
7. **Purane din ke chunks:** misaal 30 din se purane din ek gzip chunk (`audit_chunks`) me, hash ke saath; kram: chunk likho, hash jaancho, phir entries ka TTL chunk ki umar se misaal 15 din baad; chunk misaal 7 din peeche ho to alert; chunk ki umar setting se ([ARCHITECTURE.md](../../ARCHITECTURE.md) §8 niyam 4, §10.8 niyam 2 aur 3).
8. **Padhna:** owner aur Internal Auditor apne permission ke saath, filters (samay, account, kaam, cheez, request id) se, cursor pages me; audit padhna bhi audit me.

## 4. Niyam

1. Audit ka app user sirf `insert` aur `find`; update aur delete ka haq nahi (§10.8 niyam 1, SR-076).
2. Audit ke cluster me collections, validators aur TTL ka kaam sirf laptop ke release command se, alag credentials se; boot pe sirf fingerprint ki jaanch aur alert (§10.4 niyam 5, D-400, SR-100).
3. Audit ka samay: audit log misaal 2 saal, sign-in aur security events 1 saal (D-194).
4. Entry me "pehle aur baad" ke personal fields chhupe; poora data kabhi nahi.

## 5. Data model

| Collection        | Kaam                                      | Retention class | Samay                                   |
| ----------------- | ----------------------------------------- | --------------- | --------------------------------------- |
| `audit_entries`   | Taaza entries, `contentHash` ke saath     | `book`          | Chunk ki umar se misaal 15 din baad TTL |
| `audit_days`      | Din ki chain (pichhle din ka hash, ginti) | `book`          | D-194 ka samay                          |
| `audit_chunks`    | Purane din ka gzip chunk, hash ke saath   | `book`          | D-194 ka samay                          |
| `security_events` | Security events aur gine hue records      | `tech`          | 1 saal TTL                              |

Saath me platform collections ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2). Fields aur indexes code ke saath is file me judte hain.

## 6. API

Routes contracts me ([tasks/README.md](../README.md)): audit aur security events ki list (owner, Internal Auditor). Leta hai: har service ka `*.audit.recorded` (§2.2). Bhejta kuch nahi; alerts `07-notify` ke facade se.

## 7. Security

SR-076 (sirf jodna, chain, kya audit me), SR-078 (alerts ki gambhirta), SR-100 (chain ka hash bahar, gine hue events, padhne ki seema), D-400 (release sirf laptop se).

## 8. Dependencies

- **Tika hai:** `02-platform`, `04-logs` (din ka hash), `07-notify` (alerts).
- **Is pe tike:** saari services (audit events bhejti hain), `20-app-master` (audit ki screen aur security inbox).
- **Owner ke kaam:** audit ka Atlas project aur free cluster, pehle live deploy se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.11 `AUDIT` (`AC-AUDIT-1` se `AC-AUDIT-6`).
- **Manuals aur testing:** audit dekhna Master ke manual aur testing file me, usi PR me jisme screen bane (`20-app-master`, D-440, DD-13).

## 10. Subtasks

Saare charan 1 me ([PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5, D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                         | Charan | Size  | Halat |
| ---- | ------------------------------------------------------------------------------- | ------ | ----- | ----- |
| ST-1 | Service ka dhaancha, `insert` aur `find` wala user, `audit.recorded` se entries | 1      | M (2) | Baaki |
| ST-2 | Mana hue kaam aur security events (gine hue records, 1 saal)                    | 1      | M (2) | Baaki |
| ST-3 | Roz ki chain, uski jaanch, alerts aur din ka hash bahar                         | 1      | M (2) | Baaki |
| ST-4 | Purane din ke chunks aur TTL ka kram                                            | 1      | M (2) | Baaki |
| ST-5 | Audit padhne ka API                                                             | 1      | S (1) | Baaki |
|      | **Kul**                                                                         |        | **9** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 05 ka pehla spec aur 5 subtasks (D-446); code abhi nahi. |
