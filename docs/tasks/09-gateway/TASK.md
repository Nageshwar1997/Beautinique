# TASK 09: gateway (ek darwaza: session, seemaayein aur routing)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `09-gateway`, charan 1 (D-446). Progress: 0 / 13 points.

## 1. Lakshya

Backend ka ek hi darwaza: apps ke raaste ka secret, session ki jaanch, CSRF, rate limits, contract se bani routing aur errors ka ek roop, aur saari services ko ek process me jodna (bundle mode, D-049) ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2).

## 2. Scope

**Andar:** gateway (`backend/gateway`, koi database nahi); composition root (bundle aur split mode); edge ke pehre; route manifest se routing; rate limits; `/wake`; request logs ki line.

**Bahar:**

- Session aur revoke ka sach: `08-identity` (gateway uska facade bulata hai).
- `/health` aur `/ready`: `04-logs`.
- Apps ki Vercel rewrite aur headers ka saajha template, aur deploy: `27-operations`.
- Payment webhook ki jaanch (signature): `12-payments`; gateway sirf use tay routes ki list me rakhta hai.

## 3. Functional requirements

### 3.1 Composition root

1. **Bundle mode** (live, Render): saari services ek Express app me; gateway ke middleware ke baad seedha maalik service ka router, localhost HTTP hop nahi ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.4 niyam 10).
2. **Split mode** (laptop): har service alag process; gateway HTTP se aage bhejta hai aur andar ki calls signed (SR-071). Dono me ek hi facade, sirf transport alag.
3. Resolver jaise interfaces ki implementation yahin judti hai; sync calls ka graph bina chakkar ke, CI me jaancha (§2.4 niyam 9).
4. SIGTERM pe: naye requests band, chalte poore, ticker aur dispatcher ki lease chhodna, queue workers aur DB clients band, sab misaal 25 second me ([OPERATIONS.md](../../OPERATIONS.md) §3 niyam 4).

### 3.2 Edge ke pehre

1. `/api/*` sirf apps ke raaste ke secret header ke saath; constant-time milaan; badalte waqt purani aur nayi dono values; bina header 403. Tay routes (payment webhook, `/health`, `/wake`) bina secret, apni jaanch ke saath (SR-002).
2. Asli client IP ek helper se: forwarded headers sirf sahi secret ke saath, warna connection ka IP; IPv6 /64 ke hisaab se (SR-003).
3. `/wake`: sirf `GET`, `204` bina body aur cookie, koi database ya service nahi, redirect nahi; CORS sirf apne apps ke exact origins, bina credentials (SR-089).
4. Render ke public host pe tay routes ke bahar har jawab sabse chhota (SR-105).
5. JSON body misaal 100 KB, request misaal 30 second; health aur `/wake` na version batayein, na database tak jaayein (SR-007).
6. Production config me fake adapter, test seed, test switch ya ghadi badalne ka hook mile to boot pe ruk jaaye (SR-102).

### 3.3 Routing aur session

1. Route manifest `shared-contracts` se; jo route contract me nahi wo pahunch se bahar; "public" na ho to bina session 401 (SR-032).
2. Har route ke allowed apps aur token ka `aud`; customer ke token se staff ka route 403 (SR-035).
3. Request ka schema strict, anjaane fields pe 400 (SR-036).
4. Session ki jaanch identity ke facade se; Redis sirf tez cache, khaali ho to database se; sign-out, role khatam aur allowlist se hatna agli request pe asar kare (SR-029).
5. CSRF: badalne wale har route pe `Origin` ki allowlist, custom header aur SameSite; social sign-in ke start aur callback ki alag list, sirf GET (SR-030).
6. `X-App-Version` app ke kam se kam version se purana ho to 426; Delivery ka sync route pichhla version bhi maane ([ARCHITECTURE.md](../../ARCHITECTURE.md) §5 niyam 5).
7. Personal jawab pe `Cache-Control: private, no-store`; public cache sirf tay public GET routes pe, bina `Set-Cookie` (SR-004).
8. Errors ka ek roop aur request id: jawab, logs, facade calls, events (`correlationId`) aur audit me wahi id; 500 pe stack nahi (§5 niyam 8, SR-077).

### 3.4 Rate limits (SR-008)

IP aur account dono pe; seemaayein settings se. Sign-in, codes, payment shuru, review, report aur daawa fail-closed (Redis na mile to 503); padhne wale routes fail-open, process ki apni chhoti seema ke saath; 429 pe `Retry-After` aur saaf sandesh. Counter `02-platform` ke `backend-server-kit` se.

### 3.5 Logs ki line

Har request ki line `04-logs` ko, SR-077 ke fields ke saath; background ke calls (`X-Activity: background`) ka nishaan, taaki session ka "aakhri kaam" na badle (SR-094).

## 4. Niyam

1. Gateway ka koi database nahi; settings aur sach maalik services me ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).
2. Doosri service ka database koi nahi padhta; sirf facade aur events (SR-071, CR-13).
3. Finance kisi tez padhne wale raaste me nahi bulaya jaata (§2.4 niyam 9, R-014).

## 5. Data model

Koi database nahi. Redis (Render Key Value) me sirf rate limit ke counters aur session ke nishaan, jo sach nahi ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.1).

## 6. API

Gateway ke apne routes: `/wake`. Baaki saare routes maalik services ke, contracts se ([tasks/README.md](../README.md)). Events: na bhejta, na leta (§2.2).

## 7. Security

SR-002, SR-003, SR-004, SR-007, SR-008, SR-029, SR-030, SR-032, SR-035, SR-036, SR-071, SR-089, SR-094, SR-102, SR-105. Route manifest aur rate limit ka counter kernel ke hisse hain: mutation (RT-21).

## 8. Dependencies

- **Tika hai:** `02-platform`, `04-logs`, `08-identity`.
- **Is pe tike:** saare apps aur services ke routes; `27-operations` ka pehla deploy.
- **Owner ke kaam:** Render ki web service aur Key Value, pehle live deploy se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.2 `GATEWAY` (`AC-GATEWAY-1` se `AC-GATEWAY-10`).
- **Manuals aur testing:** gateway kisi role ka feature nahi, isliye laagu nahi.

## 10. Subtasks

Saare charan 1 me ([PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5, D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                  | Charan | Size   | Halat |
| ---- | ------------------------------------------------------------------------ | ------ | ------ | ----- |
| ST-1 | Composition root: bundle aur split mode, resolvers, SIGTERM              | 1      | L (4)  | Baaki |
| ST-2 | Edge ke pehre: secret header, asli IP, `/wake`, chhota jawab, seemaayein | 1      | M (2)  | Baaki |
| ST-3 | Route manifest se routing, session, CSRF, app version, cache aur errors  | 1      | L (4)  | Baaki |
| ST-4 | Rate limits: fail-closed aur fail-open                                   | 1      | M (2)  | Baaki |
| ST-5 | Request logs ki line aur background ke calls                             | 1      | S (1)  | Baaki |
|      | **Kul**                                                                  |        | **13** |       |

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 09 ka pehla spec aur 5 subtasks (D-446); code abhi nahi. |
