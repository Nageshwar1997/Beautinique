# TASK 07: notify (emails, in-app inbox aur browser push)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `07-notify`; charan 1 se shuru (D-446). Progress: 0 / 15 points.

## 1. Lakshya

Har khabar sahi raaste se: OTP aur zaroori kaam ki emails, baaki in-app aur browser push, sab din ki chhat ke andar aur bina personal data ke faaltu phailaav ke. Mobile pe koi message nahi: na SMS, na WhatsApp (CLAUDE.md).

## 2. Scope

**Andar:** notify service (`backend/notify`); templates; email ki lines aur din ki chhat (D-142); in-app inbox; browser push; sellers aur staff ka din ka saar (D-140); owner ke alerts ka raasta (SR-078, SR-101); har event pe kaun si khabar kis raaste se.

**Bahar:**

- Kaunsa event kab banta hai: maalik service ka module. Notify sirf sunta aur bhejta hai.
- Inbox aur notification ki screens: apps ke modules me; PWA aur push ki subscription ka client hissa `03-frontend-kit` ka `frontend-pwa`.
- Brevo ka account aur key: owner ka kaam ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 3. Functional requirements

### 3.1 Emails (D-287, D-419)

1. Brevo ke free plan se, HTTPS API pe; laptop aur tests me local inbox aur fake ([RULES.md](../../RULES.md) §4.2).
2. **Lines aur chhat (D-142):** OTP ki line (misaal 60 pakke), paise ki line, aur "baaki" line (misaal 120 tak); kul misaal 240. Chhat ek counter document pe conditional `$inc` se; chhat paar wale emails agle din ki line me; 80% pe chetavni ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.7 niyam 3).
3. **OTP:** identity sync facade se bulata hai aur code turant jaata hai; code notify ke database, outbox aur logs me kahin nahi (SR-015, §2.3).
4. **Order ki emails (D-126):** sirf confirmation (delivery code ke saath, paise ki line), invoice (saar, bina PDF aur link) aur refund; push band ho to delivery fail aur pick pe kami ka email bhi (D-131).
5. **Sellers aur staff (D-140):** account aur paise ki emails turant; kaam rokne wali khabrein din ke ek saar me (misaal 09:00 IST ke baad pehli jaag pe); baaki in-app aur push.
6. **Templates:** auto-escape, CRLF se header nahi juda (SR-073); kisi email me sign-in ya action ka link nahi, sirf code aur "app kholein"; har email me app ka naam (SR-012, D-419); poora address sirf invoice me (D-195).
7. Provider 429 ya 5xx de to dobara koshish sirf queue se; job id = record id, to ek email ke do record nahi (§5 niyam 12).
8. Bheje emails ka record, bina code ke; click tracking anonymous, aur uska record (D-419, D-404).

### 3.2 In-app inbox

Har app ke user ka inbox: order, invoice, refund, delivery, recall aur area khulne jaisi khabrein; padha ya nahi; cursor pages.

### 3.3 Browser push

1. Subscription user aur session se bandhi; sign-out aur account badalne pe hat-ti hai; 404 ya 410 pe delete; endpoint sirf `https` aur push services ki allowlist se (SR-072, SR-074).
2. Payload me sirf order number aur halat; product, rakam, address aur delivery code kabhi nahi (D-195).
3. Customer ki ijazat pehle order ke baad apne card se (D-346); area khulne ki khabar in-app aur push se, email sirf push band walon ko, "baaki" ki chhat ke andar (D-141).
4. **Owner ke alerts** (SR-101, D-401): subscription device se bandhi, session se nahi; payload me sirf gambhirta aur "Master app kholein"; subscription na bache to turant gambhir email; roz ek test push.

### 3.4 Khabar ka faisla

Har event ke liye ek hi jagah tay: kaunsa template, kaunsa raasta (inbox, push, email), kaunsi line. Recipient ka email aur delivery code bhejte waqt resolver se (identity, logistics); notify me unki copy nahi (§2.3).

## 4. Niyam

1. Mobile pe koi message nahi: na SMS, na WhatsApp; har OTP sirf email se (CLAUDE.md).
2. OTP ka code kabhi DB, outbox ya log me nahi (SR-015, CR-22).
3. Marketing ki khabar sirf opt-in se, push ki ijazat marketing se alag (D-141, DS-9.20).
4. Account delete pe inbox, push subscriptions, digest aur email jobs delete ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.3 ki table).

## 5. Data model

| Collection           | Kaam                                            | Retention class | Samay                          |
| -------------------- | ----------------------------------------------- | --------------- | ------------------------------ |
| `templates`          | Templates, version ke saath                     | `ref`           | Hamesha                        |
| `inbox`              | In-app khabrein                                 | `account`       | Setting se; account delete pe  |
| `push_subscriptions` | Browser push (user, session ya owner ka device) | `account`       | Sign-out, 404/410 ya delete pe |
| `email_jobs`         | Email ka kaam (job id = record id), bina code   | `tech`          | Setting se                     |
| `email_day_counts`   | Har line ki din ki ginti                        | `tech`          | Setting se                     |
| `digests`            | Sellers aur staff ke din ke saar ki line        | `account`       | Bhejne ke baad                 |

Saath me platform collections ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2). Fields aur indexes code ke saath is file me judte hain.

## 6. API

Facade (sync): identity ka OTP aur codes ka email. Routes contracts me ([tasks/README.md](../README.md)): inbox ki list aur "padha", push subscription jodna aur hatana. Leta hai: har woh event jispe khabar jaati hai, aur `identity.account.erased`. Bhejta hai: `notify.emailCap.reached` (andar ka alert) ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

## 7. Security

SR-012 (emails me link nahi, app ka naam), SR-015 (code kahin save nahi), SR-072 (sirf tay hosts), SR-073 (templates), SR-074 (push), SR-078 aur SR-101 (owner ke alerts), SR-092 (codes wale emails ki seemaayein).

## 8. Dependencies

- **Tika hai:** `02-platform`; recipient aur delivery code ke resolver ke ports (implementation jodne ki jagah pe, §2.4 niyam 9).
- **Is pe tike:** `08-identity` (OTP), `04-logs` aur `05-audit` (alerts), aur saari services ki khabrein.
- **Owner ke kaam:** Brevo ka account aur API key; push ki VAPID key ka secret ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.4 `NOTIFY` (`AC-NOTIFY-1` se `AC-NOTIFY-8`).
- **Manuals aur testing:** khabrein jis app me dikhti hain, uske manual aur testing file usi app ke module me (D-440).

## 10. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Order ki khabrein apne charan me judti hain. Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                     | Charan | Size   | Halat |
| ---- | --------------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1 | Service ka dhaancha, templates, Brevo adapter aur local inbox ka fake       | 1      | M (2)  | Baaki |
| ST-2 | Lines aur din ki chhat, OTP ka facade (code kahin save nahi)                | 1      | M (2)  | Baaki |
| ST-3 | In-app inbox                                                                | 1      | M (2)  | Baaki |
| ST-4 | Owner ke alerts: device wali push, gambhir email aur roz ka test push       | 1      | M (2)  | Baaki |
| ST-5 | Browser push: subscriptions, payload ki seema, area khulne ki khabar        | 2      | M (2)  | Baaki |
| ST-6 | Sellers aur staff ka din ka saar                                            | 4      | S (1)  | Baaki |
| ST-7 | Order ki emails aur khabrein (confirmation, invoice, refund, delivery fail) | 8      | L (4)  | Baaki |
|      | **Kul**                                                                     |        | **15** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 07 ka pehla spec aur 7 subtasks (D-446); code abhi nahi. |
