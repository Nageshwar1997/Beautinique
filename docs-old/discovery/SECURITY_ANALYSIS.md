# SECURITY ANALYSIS: Beautinique (B14)

> **Status:** v1.0.0 (2026-11-19). Agent 3 (Security Architect) pehla run: B14.

## 0. Kaise padhein

- Ye ek **report** hai, faisla nahi. Main session har daawa [DECISIONS.md](../../docs/DECISIONS.md) se milaa ke jaanchega, phir owner ki haan se ek-ek cheez naye docs me jayegi (`docs/security/SECURITY_REQUIREMENTS.md`, `docs/security/THREAT_MODEL.md`, `docs/RISKS.md`, `docs/OPEN_QUESTIONS.md`).
- **IDs (sirf is report ke):** `T-01`... threats (§2); `P-SR-01`... proposed security requirements (§4; asli `SR-xxx` number main session dega); `S-1`... owner ke sawal (§5); `PR-1`... proposed risks (§6). Tay faisle `D-xxx`, tay sawal `Q-xxx`, maujooda risks `R-xxx`.
- **"misaal"** = number sirf udaharan hai; asli number owner ya settings se.
- **L / M / H** = Low / Medium / High (likelihood aur impact).
- **Release:** R1 aur R2 [PROJECT_PLAN.md](../../docs/PROJECT_PLAN.md) §1 (D-055) ke hisaab se. "R1" = R1 ke flow me banana zaroori; "R2" = jab wo feature bane, risk saath likha hai.
- **OWASP ke version:** OWASP Top 10 **2021** (A01 se A10), OWASP API Security Top 10 **2023** (API1 se API10), OWASP ASVS **4.0.3** ke chapter aur section (jaise V3.4 cookie-based session management). ASVS ka naya version (5.0) aur Top 10 ka naya version aaye hain, par unke IDs is report me **jaanche nahi**; isliye unke number kahin nahi likhe. Jahan section number pe pakka nahi, wahan sirf chapter ka naam aur "ID jaancha nahi".
- **Kanoon:** koi kanooni baat pakki nahi likhi. Har jagah "Kanooni detail jaanchi nahi (R-004)".
- **Naye docs ke liye vakya:** §4 ke requirements aur §5 ke sawal aise likhe hain ki seedhe naye docs me ja sakein: unme pehle ke kaam ka koi zikr nahi. Pehle ke kaam ke paths sirf §0, §8 aur §10 ke kuch sabak me hain.
- **Kya padha:** root `CLAUDE.md`; DECISIONS §1 (D-001 se D-179) aur security se jude §2 records; `docs/OPEN_QUESTIONS.md` §1, §2 aur jahan "Security Architect" ya "B14" aaya; `docs/PROJECT_PLAN.md` §1; `docs/RISKS.md`; `docs/HANDOFF.md`; `docs/security/` ki dono files. Reference (sach nahi): `docs-old/QA_AUDIT_REPORT.md` (§4 ke security bugs, §5, §7a, §9), `docs-old/discovery/REPOSITORY_ANALYSIS.md` §5, Q11, Q13; `docs-old/discovery/BUSINESS_DOMAIN_ANALYSIS.md` §10.1; `docs-old/discovery/BUSINESS_DOMAIN_ANALYSIS_2.md` §9.1 aur §10 (us file me Security Architect ke notes §9.1 me hain, §10.1 me nahi); `docs-old/ARCHITECTURE.md` §6.5, §6.7, §7; purane code ki teen files sirf jhaank ke (`backend-old/gateway/src/trust.ts`, `packages-old/backend/server-crypto/src/fields.ts`, `backend-old/identity/src/code-budget.ts`).
- **Kya nahi kiya:** koi scanner, network tool ya live service ki jaanch nahi; `.env`, `.env.*` aur `All-ENVs` nahi khole; repo me secrets ki talaash nahi ki (koi secret raaste me nahi dikha).

### 0.1 Aage bheje gaye items (sab yahan sambhale)

| #   | Item                                                                                                                                                                                                  | Source                                     | Is report me kahan                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 1   | Kai apps me sign-in ka bojh (ek insaan ke kai roles)                                                                                                                                                  | D-010, OPEN_QUESTIONS B14                  | S-9; §10 point 3                                                                                  |
| 2   | Owner ke ~80 accounts pe authenticator ka bojh                                                                                                                                                        | D-017, OPEN_QUESTIONS B14                  | S-5, S-8; P-SR-10, P-SR-21; §10 point 4                                                           |
| 3   | Customer ke email code sign-in ke niyam; "authenticator laga ho to email code ke baad bhi" pakka karna                                                                                                | D-021, OPEN_QUESTIONS B14                  | P-SR-14, P-SR-15; T-10, T-11; §10 point 5                                                         |
| 4   | Consultation notes ki pahunch aur consent ("security review me pakka")                                                                                                                                | D-025, OPEN_QUESTIONS B14                  | S-22, S-23; P-SR-66; T-86                                                                         |
| 5   | Alag services ki process security (bundle mode me ek process)                                                                                                                                         | D-011 note, D-049, OPEN_QUESTIONS B14      | P-SR-70; T-66, T-67; §10 point 2; PR-2                                                            |
| 6   | Beauty Pro ke dastavez kaise rakhein, kaun dekhe                                                                                                                                                      | D-069 niyam 5, OPEN_QUESTIONS (Q-010)      | S-21; P-SR-60, P-SR-61; T-89                                                                      |
| 7   | Delivery ki photo aur location: kitne din, kaun dekhe                                                                                                                                                 | D-072, OPEN_QUESTIONS (Q-013)              | S-19; P-SR-52, P-SR-53; T-51, T-52                                                                |
| 8   | Claims ke saboot (SPF report jaise) ke dastavez rakhne ki zimmedari                                                                                                                                   | D-100                                      | S-21; P-SR-61                                                                                     |
| 9   | Customer ki daawe wali photo aur video: kitne din, kaun dekhe                                                                                                                                         | D-106                                      | S-20; P-SR-60, P-SR-61                                                                            |
| 10  | Skin reaction ka sehat data: kitne din, kaun dekhe                                                                                                                                                    | D-130                                      | S-22, S-23; P-SR-66                                                                               |
| 11  | Bina sign-in codes ki ginti ki seema                                                                                                                                                                  | D-133                                      | S-10; P-SR-19; T-15                                                                               |
| 12  | Export ki suraksha (formula wale cell, scope)                                                                                                                                                         | D-144                                      | P-SR-74; T-75                                                                                     |
| 13  | Account delete ke baad records kitne din                                                                                                                                                              | D-151                                      | S-24; P-SR-64, P-SR-65; T-84                                                                      |
| 14  | `+` alias se ek insaan ke kai accounts (nakli review, referral, pehle order ki seema, baar-baar return)                                                                                               | D-017, D-156, D-176, HANDOFF, BA2 §10 pt 2 | S-16, S-17; P-SR-56; T-57; §10 point 1                                                            |
| 15  | Allergy aur skin concerns (sehat ke paas ka data): consent aur suraksha                                                                                                                               | D-159, D-165                               | S-22, S-23; P-SR-66                                                                               |
| 16  | Support role ki goodwill coupon ki rakam seema                                                                                                                                                        | D-177                                      | S-15; P-SR-50                                                                                     |
| 17  | Try-on aur camera (SR-001)                                                                                                                                                                            | D-169, SR-001                              | P-SR-04, P-SR-05 (SR-001 waisa hi rahe)                                                           |
| 18  | Payments, refunds, settlement me security (B6 me "Security" ka hissa)                                                                                                                                 | OPEN_QUESTIONS B6                          | §2.8, §2.15; P-SR-46 se P-SR-50, P-SR-58, P-SR-59                                                 |
| 19  | Media ki jagah (photos database me nahi)                                                                                                                                                              | D-155                                      | P-SR-60, P-SR-61; §9 (Architect)                                                                  |
| 20  | Blocklist sirf senior catalog role, har badlav audit me                                                                                                                                               | D-132                                      | P-SR-42                                                                                           |
| 21  | Agent 2 run 1 ke notes: webhooks, refund aur goodwill ki seema, daam ka audit, media ka samay, private dastavez, fraud ke signals, bank details, appeal ka bantwara                                   | BA1 §10.1                                  | P-SR-48, P-SR-50, P-SR-41, S-19 se S-21, P-SR-55, P-SR-58, P-SR-37                                |
| 22  | Agent 2 run 2 ke notes: nakli review signals, photo uploads, UGC me script, profile consent, email budget DoS, allowlist har raaste, export, balances, maker-checker, retention list, delete ka event | BA2 §9.1                                   | §2.10 se §2.12; P-SR-17, P-SR-19, P-SR-39, P-SR-56, P-SR-60, P-SR-64 se P-SR-66, P-SR-74, P-SR-84 |

## 1. System ka naksha (security ki nazar se)

### 1.1 Assets aur data ki classes

| Class | Kya                                                                                                                                                                                                                                                                                                                                                  | Kahan (faisle se)                                    | Nuksaan agar leak ya badle                       |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| C1    | **Public:** catalog, daam, MRP, batch ki expiry (D-067), public reviews aur review photos (manzoori ke baad), legal pages                                                                                                                                                                                                                            | catalog, reviews; Vercel CDN cache                   | Integrity: galat daam ya content customer tak    |
| C2    | **Personal (customer):** naam, email, phone (sirf contact), addresses, pincode, orders ka itihaas, wishlist, consent, IP aur browser, push subscriptions, in-app inbox                                                                                                                                                                               | identity, commerce, notify                           | Privacy; phishing; kanooni (R-004)               |
| C3    | **Sensitive personal:** seller KYC aur PAN, seller ka bank account, brand authorisation letters, Beauty Pro ke dastavez (D-069), delivery ki photo aur location (D-072), daawe ki photo aur video (D-106), return pickup ki photo (D-113), review me chehre wali photo (D-155)                                                                       | identity ya seller ka module, media store, logistics | Pehchaan ki chori, ghar ka pata, gharelu tasveer |
| C4    | **Sehat ke paas ka data (R2):** skin reaction case (D-130), consultation notes (D-025), allergy aur skin concerns wali beauty profile (D-165)                                                                                                                                                                                                        | support, customer profile                            | Sabse gambhir privacy nuksaan; consent ka sawal  |
| C5    | **Financial:** payments, refunds, seller ledger, payable aur payout (D-081), udhaar (D-071), invoices aur credit notes, TCS aur TDS                                                                                                                                                                                                                  | payments, finance (PostgreSQL, Neon)                 | Paisa ka nuksaan; hisaab galat                   |
| C6    | **Secrets:** password hashes, authenticator secrets, recovery codes, session tokens, token signing keys, field encryption keys, DB credentials, gateway keys aur webhook secret, Vercel se Render ka secret, push (VAPID) private key, email API key, OAuth client secrets, provider accounts (GitHub, Vercel, Render, Atlas, Neon, Razorpay, email) | Render aur Vercel env, DBs, owner ka laptop          | Poora system haath se nikalna                    |
| C7    | **Integrity wali settings:** allowlist (D-133), area switches aur live (D-015), fees (D-094), policy numbers (D-150), HSN aur GST table (D-086), ingredient blocklist (D-132), emails ki chhat (D-142), roles aur grants (D-017), staff list (D-022)                                                                                                 | settings ya config data                              | Ek badlav se poore platform ka vyavhaar badle    |
| C8    | **Audit aur logs:** staff ke kaam, security events, exports                                                                                                                                                                                                                                                                                          | audit service, Render logs                           | Repudiation; detection khatam                    |

**Note:** GSTIN ke beech ke 10 characters PAN hote hain, isliye proprietor (ek insaan ke business) ka GSTIN bhi personal data maano (C3 ke paas). Customer ka UPI ID payment gateway se aa sakta hai; use rakhne ki zaroorat nahi (D-111 refund original raaste).

### 1.2 Actors

- **Anonymous visitor:** portfolio dekhne wala ya koi bhi; dekhna, search, reviews padhna, pincode check (D-020, D-133).
- **Customer (allowlist pe, D-133):** owner ke `+` alias accounts aur testers. Asli business pe allowlist band.
- **Beauty Pro buyer (R2):** jaancha hua customer (D-069).
- **Seller users:** Account Owner, Finance, aur seller ke doosre users (catalog, daam, maal bhejna); apna brand bhi ek seller (D-031).
- **Delivery partner:** gig partner, apna phone (D-033, D-042).
- **Transporter ka driver:** system me account nahi (D-027); sirf record.
- **Staff roles:** Support Agent, Support Lead (D-105, D-147), Review Moderator (D-136), Seller Ops aur catalog ki jaanch (D-084), warehouse aur hub ke roles (D-123), Finance, Admin, Super Admin, Head of Operations (D-044), Master, Trust & Safety Lead aur Marketing Head (D-047), senior catalog role (D-132), Grievance Officer (D-163), Skin & Hair Expert aur Beauty Advisor (D-025), aage Loyalty Manager, Shade Specialist.
- **Owner:** ek insaan, har role ka alag account (~80, D-017), 2 base emails ke `+` alias.
- **Bahar ke systems:** Razorpay (D-034), email provider (abhi tay nahi; 300 emails/din, D-028), OAuth providers (Google, LinkedIn, GitHub; D-021), browser push services, Vercel, Render, Atlas, Neon, GitHub Actions, cron-job aur UptimeRobot (D-028).
- **Hamlavar (maan ke):** bahar ka opportunistic attacker; credential stuffing wala; dhokhebaaz customer (jhoothe daawe, kai accounts); bura seller (doosre seller ka data, nakli reviews); mila hua staff ya delivery partner; phishing wala (domain nahi, D-028); supply chain (npm, GitHub Actions); owner ke laptop ya provider account pe hamla.

### 1.3 Apps aur services

- **11 apps (D-010), sab Vercel Hobby pe alag `*.vercel.app` host (D-048):** Customer, Seller, Admin, Super Admin, Master, Support Desk, Finance, Logistics Ops, Delivery (PWA, offline, D-042), Growth Studio, Creator. Baaki bhi phone pe install ho sakte hain (D-042), yaani har app ka service worker ho sakta hai.
- **Mapping (maana gaya, faisla chup):** warehouse aur hub ke roles Logistics Ops me; Seller Ops aur catalog ki jaanch Admin me (Review Moderator Admin me, D-136); Head of Operations Master me (D-044); Support Agent, Support Lead, Expert aur Advisor Support Desk me; Finance roles Finance app me; Loyalty Manager Growth Studio me (D-173).
- **Har app `/api/*` ko Render ke gateway pe rewrite karti hai (D-052):** browser ke liye API same-origin.
- **Backend:** ek Render free web service me saari services bundle mode me (D-049, D-056); laptop pe split mode. Pehla draft (D-011): identity, notify, payments, catalog, commerce, logistics, finance, support, audit; saath me gateway.
- **Data:** har MongoDB service ka apna Atlas M0 cluster, apna project aur DB user (D-011, D-050); finance PostgreSQL Neon pe (D-057); sab Singapore (D-058). Redis: Render Key Value, sirf internal URL, disk pe save nahi (D-051, R-010).
- **Media:** photos aur dastavez database me nahi (D-155); jagah Architect ke saath (tay nahi). Is report me maana gaya: bahar ka object storage, signed URLs ke saath.
- **Email:** provider tay nahi; din ki chhat aur lines D-126, D-140, D-142.

### 1.4 Trust boundaries

| Id   | Seema                                       | Kya paar karta hai                                       | Abhi ka pehra (faisla) aur kami                                                           |
| ---- | ------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| TB1  | Browser ↔ Vercel app                        | Har request, cookies, uploads ke signed URLs             | TLS Vercel ka; same-origin `/api` (D-052). Kami: domain nahi, lookalike host (D-028)      |
| TB2  | Vercel ↔ Render gateway (public internet)   | `/api/*` rewrite                                         | Render ka URL public hai; bina pehre koi bhi seedha bula sakta hai                        |
| TB3  | Gateway ↔ services                          | Actor ki pehchaan, permissions                           | Bundle mode me ek process (D-049): koi process seema nahi; split mode (laptop) me network |
| TB4  | Services ↔ Atlas aur Neon (public internet) | Saara data                                               | Alag cluster aur DB user (D-011). Kami: free tier pe network allowlist ka pata nahi (§11) |
| TB5  | Services ↔ Redis (Render ke andar)          | Sessions ke nishaan, rate limits, queues                 | Sirf internal URL (D-051). Kami: restart pe data gayab (R-010)                            |
| TB6  | Services → bahar ke APIs                    | Payments, email, OAuth, push, breached-password check    | Kami: push subscription ka URL browser deta hai (SSRF ka raasta)                          |
| TB7  | Razorpay → webhook                          | Payment aur refund ki haalat                             | Signature ki jaanch zaroori                                                               |
| TB8  | Delivery PWA ↔ partner ka phone storage     | Offline me addresses, phone, kaam ki list                | Phone kho sakta hai (D-042 offline)                                                       |
| TB9  | Owner ka laptop ↔ production                | Backup command (D-013), dashboards, env, Claude sessions | Laptop pe sab kuch: ek chori = sab                                                        |
| TB10 | GitHub (public repo) aur CI ↔ production    | Code, deploy, jagane ke pings (D-028)                    | Public repo; fork PRs; actions ki supply chain                                            |
| TB11 | Media store ↔ browser                       | Product images (public), dastavez aur saboot (private)   | Public aur private ka farak, URL ki umar                                                  |

### 1.5 Mukhya data flows

1. **F1 Sign-up aur sign-in:** customer ke teen raaste (password, social, email code; D-021), har raaste pe allowlist (D-133); staff aur seller password + authenticator (D-017); delivery (S-4). Session cookies har app ke host pe.
2. **F2 Browse aur search:** anonymous, public cache; Pro daam alag aur private (D-065).
3. **F3 Prepaid order:** cart → "place order" (stock ruke, D-118) → Razorpay → signature aur webhook → order pakka → confirmation email (delivery code ke saath, D-126) → invoice har seller ke GSTIN se.
4. **F4 Delivery pe UPI (D-109):** partner ke app pe QR → gateway → webhook → tabhi delivery code (D-109 niyam 4).
5. **F5 Fulfilment:** pick aur pack (pack ki photo, D-106 niyam 4) → trip record (D-027) → hub receive → partner → delivery (code, ya photo + location; D-072).
6. **F6 Cancel, RTO, return:** pickup pe photo aur batch milaan (D-113) → warehouse jaanch → refund original raaste (D-111).
7. **F7 Daawe:** "parcel nahi mila" (D-072, D-148), toota ya galat (D-106) → Support Agent → appeal Support Lead (D-147).
8. **F8 Reviews:** delivered line → review + photo → apne aap ki jaanch ya queue (D-136) → public; report (D-136 niyam 4).
9. **F9 Seller:** onboarding + KYC dastavez → Seller Ops; listing → jaanch (D-098) → live; daam badlav (D-061, D-087); maal ki suchna aur receiving (D-096).
10. **F10 Finance:** order events → seller ledger → payable (D-081) → payout "paid" haath se (R1) → statement aur CSV (D-143, D-144).
11. **F11 Khabrein:** emails ki lines aur chhat (D-126, D-140, D-142), push, in-app.
12. **F12 Staff admin:** roles aur grants, settings (allowlist, switches, fees, blocklist), exports, audit dekhna.
13. **F13 Backup:** owner ke laptop se command production databases padhti hai (D-013).
14. **F14 Deploy:** GitHub → Vercel (11 projects) aur Render.

## 2. STRIDE threat model

Khane: **Id**, **Threat**, **STRIDE** (S Spoofing, T Tampering, R Repudiation, I Information disclosure, D Denial of service, E Elevation of privilege), **Asset**, **L** (likelihood), **I** (impact), **Pehle se kaunsa faisla bachata**, **Bachav** (§4 ke IDs; owner sawal §5), **Kab**.

### 2.1 Edge aur hosting

| Id   | Threat                                                                                                                                                      | STRIDE | Asset              | L   | I   | Pehle se                       | Bachav                      | Kab             |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------ | --- | --- | ------------------------------ | --------------------------- | --------------- |
| T-01 | Hamlavar Render ka public URL seedha bulaye aur Vercel wala raasta (app ki pehchaan, headers) chhod de, ya client IP ka header khud bana ke bheje           | S, T   | API, rate limits   | H   | M   | D-052 (same-origin)            | P-SR-01, P-SR-02            | R1              |
| T-02 | Galat client IP: sab users ek hi IP pe gine jaayein, to rate limit ek ki galti pe sab ko roke, aur audit me galat IP                                        | D, R   | Rate limits, audit | M   | M   | -                              | P-SR-02, P-SR-07            | R1              |
| T-03 | Vercel ka CDN kisi signed-in ya personal response ko cache kare aur doosre user ko de de (Pro daam, cart, address)                                          | I      | C2, C5             | M   | H   | -                              | P-SR-03                     | R1              |
| T-04 | Security headers ke bina XSS ka asar bada, ya sign-in aur "authenticator band karo" jaise buttons iframe me (clickjacking)                                  | T, E   | Sessions           | M   | H   | SR-001 (sirf camera, location) | P-SR-04                     | R1              |
| T-05 | Checkout page pe payment gateway ki bahar ki script; agar wo ya koi aur bahar ki script badle to customer ke payment ke details chhin sakte (skimming)      | I, T   | Payment            | L   | H   | D-157 (bahar analytics nahi)   | P-SR-05                     | R1              |
| T-06 | Ek 512 MB process me saari services (D-049): bada body, mehnga search, password hash ki baadh, bada export ya PDF se sab kuch gire                          | D      | Poora system       | M   | H   | R-007, R-002                   | P-SR-06, P-SR-07, P-SR-08   | R1              |
| T-07 | Domain nahi (D-028): koi bhi milta-julta `*.vercel.app` naam bana ke nakli sign-in page; staff ka password aur authenticator code ya customer ka code le le | S      | Accounts           | M   | H   | -                              | P-SR-10, P-SR-11; S-5; PR-1 | R1 (passkey R2) |
| T-08 | Install hone wale apps ka service worker `/api/*` ya personal pages cache kare, ya `/api` ko `index.html` se jawab de                                       | I, D   | C2                 | M   | M   | -                              | P-SR-09                     | R1              |

### 2.2 Customer ka sign-in (D-021, D-133)

| Id   | Threat                                                                                                                                 | STRIDE | Asset            | L                       | I   | Pehle se                       | Bachav                    | Kab |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------- | ----------------------- | --- | ------------------------------ | ------------------------- | --- |
| T-09 | Credential stuffing aur password spraying (leak hue passwords se)                                                                      | S      | Customer account | M (allowlist band pe H) | H   | D-133 (allowlist)              | P-SR-12, P-SR-13, P-SR-07 | R1  |
| T-10 | Email code ka andaaza (6 digits) ya ek code ka dobara istemaal                                                                         | S      | Customer account | M                       | H   | -                              | P-SR-14, P-SR-07          | R1  |
| T-11 | Code ka phishing ("code bata do") ya customer ka inbox hi hamlavar ke paas: email code se account = inbox jitna surakshit              | S      | Customer account | M                       | M   | D-021 (authenticator optional) | P-SR-14, P-SR-15; PR-9    | R1  |
| T-12 | Social sign-in se takeover: provider ka bina pakka email kisi maujooda account se jud jaaye; OAuth ka login CSRF; redirect URI se khel | S, E   | Customer account | M                       | H   | -                              | P-SR-16                   | R1  |
| T-13 | Allowlist ka koi ek raasta khula reh jaaye (social ka pehla sign-in, invite, seller ya partner sign-up, waitlist, contact form)        | E      | D-133 ka maqsad  | M                       | M   | D-133                          | P-SR-17                   | R1  |
| T-14 | Account enumeration: sign-up, sign-in, reset ke jawab ya samay se pata chale kaunsa email registered hai                               | I      | C2               | H                       | L   | -                              | P-SR-18                   | R1  |
| T-15 | Code wale emails ki baadh: din ke 300 me OTP ki 60 (D-142) khatam, asli users sign-in na kar sakein; kisi ke inbox pe email bombing    | D      | Sign-in, inbox   | M (allowlist band pe H) | H   | D-142, D-133                   | P-SR-19, P-SR-07; S-10    | R1  |
| T-16 | Sign-in ke baad `next` jaise parameter se bahar ki site pe redirect (phishing)                                                         | S      | Users            | M                       | M   | -                              | P-SR-20                   | R1  |

### 2.3 Staff, seller aur delivery ka sign-in

| Id   | Threat                                                                                                                           | STRIDE | Asset                  | L   | I   | Pehle se                       | Bachav                         | Kab             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------- | --- | --- | ------------------------------ | ------------------------------ | --------------- |
| T-17 | Staff ka password aur authenticator code nakli page se turant aage bhej ke sign-in (authenticator code phishing se nahi bachata) | S, E   | Master, Finance, Admin | M   | H   | D-017 (authenticator)          | P-SR-10, P-SR-11, P-SR-25; S-5 | R1 (passkey R2) |
| T-18 | Authenticator reset ya recovery ke raaste se takeover, ya owner khud phone khone pe bahar                                        | S, D   | Staff accounts         | L   | H   | -                              | P-SR-21, P-SR-77; S-8          | R1              |
| T-19 | Lockout ka hathiyar: hamlavar jaan-boojh ke galat password daal ke owner ke staff accounts band kar de                           | D      | Staff ka kaam          | M   | M   | -                              | P-SR-13; S-3                   | R1              |
| T-20 | Delivery partner ka phone kho jaaye: chalta session aur offline data (addresses, phone numbers)                                  | I, S   | C2, delivery           | M   | M   | D-042 (offline)                | P-SR-22, P-SR-09; S-4          | R1              |
| T-21 | Seller ka bina authenticator wala user daam, maal ya payout ke details badle (account chori ho to bada nuksaan)                  | T, E   | C5, daam               | M   | H   | D-017 (Account Owner, Finance) | P-SR-23, P-SR-25; S-6          | R1              |
| T-22 | Staff ya seller ka invite link kisi aur ke haath; default admin account; pehla Master banane ka koi khula raasta                 | S, E   | Staff accounts         | L   | H   | -                              | P-SR-24                        | R1              |

### 2.4 Sessions aur tokens

| Id   | Threat                                                                                                                  | STRIDE | Asset    | L   | I   | Pehle se | Bachav                                       | Kab |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------ | -------- | --- | --- | -------- | -------------------------------------------- | --- |
| T-23 | XSS ya malware se session token ki chori; lamba session chori ke baad bhi chale                                         | S, I   | Sessions | M   | H   | -        | P-SR-26, P-SR-27, P-SR-04, P-SR-39; S-1, S-2 | R1  |
| T-24 | Refresh token ki copy chupchaap chale; ya ulta, mobile pe khoya jawab "chori" maan ke sahi user ko baar-baar bahar kare | S, D   | Sessions | M   | M   | -        | P-SR-27                                      | R1  |
| T-25 | Redis restart (R-010) pe sign-out ya band hue sessions ke nishaan ud jaayein aur purana session phir chale              | E      | Sessions | M   | H   | R-010    | P-SR-28                                      | R1  |
| T-26 | Cookie wale sessions pe CSRF (doosri site se badalne wali request)                                                      | T      | Account  | M   | M   | -        | P-SR-29                                      | R1  |
| T-27 | Token jaali banana (algorithm ka khel), signing key ka leak, ya ek app ka token doosre app pe chalna                    | S, E   | Sab apps | L   | H   | -        | P-SR-30, P-SR-34                             | R1  |
| T-28 | Allowlist se hata tester, ya role khatam hua staff, apne chalte session se kaam karta rahe                              | E      | Access   | M   | M   | D-133    | P-SR-17, P-SR-28                             | R1  |

### 2.5 Authorization, IDOR/BOLA aur sellers ke beech ki deewar

| Id   | Threat                                                                                                                                                                          | STRIDE | Asset                  | L   | I   | Pehle se            | Bachav                       | Kab |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------- | --- | --- | ------------------- | ---------------------------- | --- |
| T-29 | BOLA: customer id badal ke doosre ka order, invoice, address, return, daawe ki photo dekhe ya badle                                                                             | I, T   | C2, C3                 | H   | H   | -                   | P-SR-31, P-SR-32             | R1  |
| T-30 | Seller A, seller B ke orders, stock, settlement, listings, dastavez dekhe ya badle; ya report aur export me scope ke bahar ka data                                              | I, T   | C2, C5, C3             | M   | H   | D-143, D-144        | P-SR-33, P-SR-74             | R1  |
| T-31 | BFLA: customer ya seller ke token se staff ke routes (refund manzoor, listing manzoor, switch live); partner doosre hub ya doosre partner ke parcels                            | E      | Sab                    | M   | H   | -                   | P-SR-31, P-SR-34             | R1  |
| T-32 | Mass assignment aur zyada data: profile update me role, order me daam ya status, listing me "approved" ya seller id; seller ke API jawab me customer ka phone                   | T, I   | C2, C5                 | M   | H   | D-143               | P-SR-35                      | R1  |
| T-33 | Roles se upar chadhna: Master ka bina deploy sub-role (D-017) khatarnak permissions ke saath; koi role khud ko appoint kare; grant scope se bahar                               | E      | Poora system           | L   | H   | D-047               | P-SR-36                      | R1  |
| T-34 | Kaam ka bantwara toote: jisne reject kiya wahi appeal tay kare (D-084, D-146, D-147); refund banane wala hi manzoor kare; apne brand ka staff apni listing manzoor kare (D-031) | E, R   | Faislon ki nishpakshta | M   | M   | D-084, D-147, D-031 | P-SR-37                      | R1  |
| T-35 | Staff (support, hub, partner) zaroorat se zyada customer ki jaankari dekhe ya list bana ke le jaaye                                                                             | I      | C2                     | M   | M   | D-143, D-144        | P-SR-38, P-SR-74; S-13, S-14 | R1  |

### 2.6 Catalog, seller aur settings

| Id   | Threat                                                                                                                                                       | STRIDE | Asset        | L   | I   | Pehle se                   | Bachav                    | Kab |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------ | --- | --- | -------------------------- | ------------------------- | --- |
| T-36 | Seller ke content (description, ingredients text) ya user content (review) me stored XSS, jo customer app ya staff ke Admin app me chale (staff ka session!) | T, E   | Sessions, C1 | M   | H   | D-136 (link pattern)       | P-SR-39, P-SR-04          | R1  |
| T-37 | Jokhim wala field (ingredients, claims, images) kisi doosre raaste se badal ke jaanch (D-098) se bachna; jaanch ke beech version badalna                     | T      | C1           | M   | M   | D-098                      | P-SR-40                   | R1  |
| T-38 | Daam: MRP se upar, 0, bada badlav bina confirm; Pro daam sab ko dikh jaana                                                                                   | T, I   | C1, C5       | M   | M   | D-061, D-087, D-065        | P-SR-41, P-SR-03          | R1  |
| T-39 | Settings badalna (allowlist, switches, fees, HSN table, blocklist, emails ki chhat, policy numbers, location data import) kam haq ya chori ke account se     | T, E   | C7           | L   | H   | D-015, D-022, D-132, D-133 | P-SR-42, P-SR-25, P-SR-75 | R1  |

### 2.7 Cart, checkout, order aur stock

| Id   | Threat                                                                                                                          | STRIDE | Asset          | L   | I   | Pehle se                           | Bachav           | Kab |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- | --- | --- | ---------------------------------- | ---------------- | --- |
| T-40 | Client se daam, discount, delivery fee, quantity ya pincode badal ke bhejna; Pro daam bina Pro darje; unserved pincode pe order | T      | C5, stock      | H   | H   | D-061, D-065, D-091, D-016 niyam 9 | P-SR-43, P-SR-41 | R1  |
| T-41 | Stock ki race: ek saath orders se zyada bikna; reservation khatam hone aur payment ke beech; pack hone aur cancel ke beech      | T      | Stock, C5      | M   | M   | D-118, D-110                       | P-SR-44          | R1  |
| T-42 | Stock rokna: delivery pe UPI wale orders (stock delivery tak ruka, D-118 niyam 4) ya baar-baar bina payment ke "place order"    | D      | Stock, sellers | M   | M   | D-109, D-091                       | P-SR-45; S-17    | R1  |
| T-43 | Aadha cancel ya return pe refund ki galat ginti (rounding, delivery fee D-110 niyam 3, D-114) se zyada paisa wapas              | T      | C5             | M   | M   | D-110, D-114                       | P-SR-46          | R1  |

### 2.8 Payments aur webhooks

| Id   | Threat                                                                                                              | STRIDE | Asset     | L   | I   | Pehle se                      | Bachav                 | Kab |
| ---- | ------------------------------------------------------------------------------------------------------------------- | ------ | --------- | --- | --- | ----------------------------- | ---------------------- | --- |
| T-44 | Nakli webhook ya sirf browser ke "success" callback se order pakka, bina asli payment ke                            | S, T   | C5, stock | M   | H   | -                             | P-SR-47, P-SR-48       | R1  |
| T-45 | Wahi webhook do baar ya purana dobara: do refund, do ledger entry, ya der se aaye payment ka do baar refund (D-118) | T      | C5        | M   | H   | D-118                         | P-SR-48                | R1  |
| T-46 | Kam rakam ka payment ya doosre order ka payment id kisi order se jodna                                              | T      | C5        | M   | H   | -                             | P-SR-47                | R1  |
| T-47 | Delivery pe UPI: partner apna QR dikhaye, ya khud "paid" mark kare; customer purana screenshot dikhaye              | S, T   | C5        | M   | M   | D-109 niyam 4                 | P-SR-49                | R1  |
| T-48 | Support ya chori ka staff account refund seema se upar ya baar-baar chalaye                                         | E, T   | C5        | M   | H   | D-111 (original raasta)       | P-SR-50, P-SR-37; S-11 | R1  |
| T-49 | Gateway ki keys ya webhook secret leak (public repo, logs, app ka bundle)                                           | I, S   | C6        | M   | H   | CLAUDE.md (public repo niyam) | P-SR-78, P-SR-79       | R1  |

### 2.9 Fulfilment aur delivery

| Id   | Threat                                                                                                           | STRIDE | Asset              | L   | I   | Pehle se     | Bachav                          | Kab |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ------ | ------------------ | --- | --- | ------------ | ------------------------------- | --- |
| T-50 | Partner delivery code ka andaaza lagaye; code partner ko kisi aur raaste dikhe; code push ya logs me leak        | S      | Delivery ka saboot | M   | M   | D-072, D-126 | P-SR-51, P-SR-73                | R1  |
| T-51 | Nakli saboot: gallery ki purani photo, GPS badal ke "delivered"                                                  | S, R   | D-072 ka saboot    | M   | M   | D-072, D-148 | P-SR-52                         | R1  |
| T-52 | Delivery ki photo (ghar, chehra) aur location ka galat istemaal ya zyada der rakhna; partner ki lagatar tracking | I      | C3                 | M   | M   | -            | P-SR-53, P-SR-61, P-SR-64; S-19 | R1  |
| T-53 | Trip ka manifest ya scan badalna (warehouse, hub ya transporter pe maal gayab)                                   | T, R   | Stock, C5          | M   | M   | D-027, D-068 | P-SR-54                         | R1  |
| T-54 | Return pickup pe doosra batch ya nakli maal, partner ki mili-bhagat ke saath                                     | T      | Stock, C5          | M   | M   | D-113        | P-SR-52, P-SR-55                | R1  |

### 2.10 Daawe, returns aur support

| Id   | Threat                                                                                         | STRIDE | Asset | L   | I   | Pehle se            | Bachav                    | Kab |
| ---- | ---------------------------------------------------------------------------------------------- | ------ | ----- | --- | --- | ------------------- | ------------------------- | --- |
| T-55 | Jhoothe daawe: internet ki photo, ek photo kai daawon me, baar-baar "parcel nahi mila"         | S, R   | C5    | H   | M   | D-072, D-106, D-116 | P-SR-55, P-SR-60          | R1  |
| T-56 | Support Agent aur customer ki mili-bhagat (apne jaan-pehchaan wale ka refund ya daawa manzoor) | E      | C5    | L   | M   | D-147               | P-SR-50, P-SR-37, P-SR-75 | R1  |

### 2.11 Reviews aur user content

| Id   | Threat                                                                                                        | STRIDE | Asset             | L   | I   | Pehle se     | Bachav           | Kab             |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------ | ----------------- | --- | --- | ------------ | ---------------- | --------------- |
| T-57 | Kai accounts (`+` alias, D-017) se nakli reviews; brand ka staff apne product pe                              | S      | Rating ka bharosa | H   | M   | D-135, D-156 | P-SR-56; S-16    | R1 (signals R2) |
| T-58 | Report ka hathiyar: "personal data" ki jhoothi report se negative review faisle tak chhupwana (D-136 niyam 4) | D, T   | Reviews           | M   | M   | D-136, D-146 | P-SR-57          | R1              |
| T-59 | Review ki photo me EXIF ki location, chehra, address ka label; review text me phone ya email                  | I      | C2, C3            | M   | M   | D-155, D-146 | P-SR-60, P-SR-39 | R1              |

### 2.12 Uploads aur media

| Id   | Threat                                                                                                                          | STRIDE  | Asset         | L   | I   | Pehle se      | Bachav           | Kab |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------- | --- | --- | ------------- | ---------------- | --- |
| T-60 | Bura file: SVG ya HTML se XSS, polyglot, bahut bada file, image parser ke bug se process pe kabza (bundle me sab services)      | T, E, D | Poora backend | M   | H   | -             | P-SR-60, P-SR-70 | R1  |
| T-61 | Private media (KYC, daawe ki photo, delivery photo) ka URL andaaze se, public bucket se, lambe signed URL se ya Referer se leak | I       | C3            | M   | H   | D-069 niyam 5 | P-SR-61          | R1  |
| T-62 | Uploads ki baadh se free storage khatam                                                                                         | D       | Media         | M   | M   | -             | P-SR-60, P-SR-07 | R1  |

### 2.13 Data stores, Redis aur services

| Id   | Threat                                                                                                                 | STRIDE  | Asset            | L   | I   | Pehle se       | Bachav                 | Kab |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ------- | ---------------- | --- | --- | -------------- | ---------------------- | --- |
| T-63 | Atlas ya Neon ke credentials leak + network sab ke liye khula: poora DB padhna, badalna ya mitana                      | I, T, D | Saara data       | L   | H   | D-011, D-050   | P-SR-67, P-SR-78; PR-3 | R1  |
| T-64 | NoSQL operator injection (`$ne`, `$gt`), finance me SQL injection, search me regex se CPU                              | T, I, E | Data             | M   | H   | -              | P-SR-68                | R1  |
| T-65 | Redis me galat cache (daam, serviceability), nakli queue job, ya rate limits ki ginti ka mit jaana                     | T, D    | C1, C5           | L   | M   | D-051          | P-SR-69, P-SR-28       | R1  |
| T-66 | Bundle mode me ek module ki kamzori se doosri services ke DB credentials aur data tak pahunch (process ki deewar nahi) | E, I    | Saara data       | L   | H   | D-011 note     | P-SR-70; PR-2          | R1  |
| T-67 | Nakli ya badla event; ek service doosri ke naam se event bheje (split mode me network pe)                              | S, T    | Data ki sachai   | L   | M   | D-011 (events) | P-SR-70                | R1  |
| T-68 | SSRF: push subscription ka URL browser deta hai aur server us pe POST karta hai; nakli subscription se andar ke URL    | S, I    | Andar ke systems | M   | M   | -              | P-SR-71                | R1  |

### 2.14 Khabrein (email, push, in-app)

| Id   | Threat                                                                                                                                    | STRIDE | Asset | L   | I   | Pehle se | Bachav           | Kab |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- | --- | --- | -------- | ---------------- | --- |
| T-69 | Email me HTML ya header injection (naam, address se); emails me zyada personal data; email provider ke dashboard me OTP aur codes ki copy | I, T   | C2    | M   | M   | D-126    | P-SR-72          | R1  |
| T-70 | Push galat insaan ko (shared browser pe purane account ki subscription); lock screen pe personal baat                                     | I      | C2    | M   | M   | D-126    | P-SR-73; S-25    | R1  |
| T-71 | Seller ko payment link wala email (D-071) bina domain ke: sellers ko link pe click karna sikhata hai, phishing ka sancha                  | S      | C5    | M   | M   | -        | P-SR-72, P-SR-11 | R1  |

### 2.15 Finance aur payout

| Id   | Threat                                                                         | STRIDE | Asset | L   | I   | Pehle se                 | Bachav                 | Kab         |
| ---- | ------------------------------------------------------------------------------ | ------ | ----- | --- | --- | ------------------------ | ---------------------- | ----------- |
| T-72 | Seller account chori karke bank details badalna aur agla payout apne khaate me | T, S   | C5    | M   | H   | D-093                    | P-SR-58, P-SR-25; S-29 | R1 (design) |
| T-73 | Ek hi account payout batch banaye aur "paid" bhi kare (maker-checker nahi)     | T, R   | C5    | L   | H   | D-047 (doosra signature) | P-SR-50; S-12          | R1          |
| T-74 | Ledger me seedha badlav, ya finance aur gateway ka milaan na hona              | T, R   | C5    | L   | H   | D-001 (finance niyam)    | P-SR-59, P-SR-75       | R1          |

### 2.16 Admin, export, audit aur logs

| Id   | Threat                                                                                             | STRIDE | Asset  | L   | I   | Pehle se             | Bachav                 | Kab |
| ---- | -------------------------------------------------------------------------------------------------- | ------ | ------ | --- | --- | -------------------- | ---------------------- | --- |
| T-75 | Export se leak: CSV me formula wale cell (`=`, `+`, `-`, `@`), scope ke bahar ka data, bada export | I, T   | C2, C5 | M   | M   | D-144                | P-SR-74                | R1  |
| T-76 | Staff apne kaam se mukar jaaye; audit log badla ya mitaya jaaye                                    | R, T   | C8     | M   | M   | D-015, D-022 (audit) | P-SR-75                | R1  |
| T-77 | Logs me passwords, codes, tokens, addresses, PAN                                                   | I      | C2, C6 | M   | H   | -                    | P-SR-76                | R1  |
| T-78 | Free tier pe alerts kam aur logs thode din: hamla der se pakda jaaye                               | R      | Sab    | M   | M   | -                    | P-SR-77, P-SR-83; PR-7 | R1  |

### 2.17 DevOps, secrets aur owner

| Id   | Threat                                                                                                         | STRIDE | Asset        | L   | I   | Pehle se            | Bachav                          | Kab |
| ---- | -------------------------------------------------------------------------------------------------------------- | ------ | ------------ | --- | --- | ------------------- | ------------------------------- | --- |
| T-79 | Public repo me galti se secret commit                                                                          | I      | C6           | M   | H   | CLAUDE.md niyam     | P-SR-79, P-SR-78                | R1  |
| T-80 | Provider account (GitHub, Vercel, Render, Atlas, Neon, Razorpay, email) pe takeover: code, infra aur data sab  | S, E   | Poora system | L   | H   | -                   | P-SR-80; PR-4                   | R1  |
| T-81 | Supply chain: npm package ya GitHub Action me malware; fork PR se CI ke secrets                                | T, E   | Code, C6     | M   | H   | CLAUDE.md git flow  | P-SR-81                         | R1  |
| T-82 | Owner ka laptop chori ya malware: backups (D-013), env, browser ke sessions, Claude sessions                   | I, E   | Sab          | L   | H   | D-013 ke 4 pehre    | P-SR-82, P-SR-80; S-26; PR-4    | R1  |
| T-83 | Backup files ka leak, ya restore me purana ya badla data                                                       | I, T   | Saara data   | L   | H   | D-013               | P-SR-82; S-26                   | R1  |
| T-84 | Account delete (D-151) ko takeover ke baad hathiyar banana; ya delete ke baad bhi data services aur backups me | D, I   | C2           | L   | M   | D-151 (7 din wapsi) | P-SR-65, P-SR-15, P-SR-64; S-24 | R1  |

### 2.18 R2 ke hisse

| Id   | Threat                                                                                                                                  | STRIDE | Asset           | L   | I   | Pehle se               | Bachav                       | Kab                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------- | --- | --- | ---------------------- | ---------------------------- | ---------------------- |
| T-85 | Coupon, points ya gift card ek saath do baar kharch; returns se points ka khel; kai accounts se referral                                | T, S   | C5              | H   | M   | D-102, D-174, D-176    | P-SR-84, P-SR-56; S-16       | R2                     |
| T-86 | Sehat ke data (notes, skin reaction, allergy) ka leak, ya bina consent istemaal                                                         | I      | C4              | L   | H   | D-025, D-165           | P-SR-66, P-SR-62; S-22, S-23 | R2                     |
| T-87 | Google Meet ke link field me nakli link (`meet.google.com.example.com` jaisa); Advisor thread me bahar ke links                         | S      | Customers       | L   | M   | D-025 (sirf Meet link) | P-SR-85                      | R2                     |
| T-88 | Bina sign-in forms (contact, grievance) pe spam, emails ki baadh, aur allowlist wale email ka bahana (form me koi bhi email likh sakta) | D, S   | Emails, support | M   | M   | D-161, D-163           | P-SR-86, P-SR-19; S-18       | R2 (grievance page R1) |
| T-89 | Beauty Pro ke nakli dastavez; Pro daam ka leak                                                                                          | S, I   | C3, daam        | M   | M   | D-069                  | P-SR-61, P-SR-41             | R2                     |

**Sabse gambhir 5 (L aur I milake, aur jahan faisla pehle se kuch nahi bachata):** T-29 (BOLA), T-40 (checkout pe client ka daam), T-44 (nakli payment success), T-07 + T-17 (domain ke bina phishing), T-80 + T-82 (provider account ya laptop pe kabza).

## 3. OWASP mapping

### 3.1 OWASP Top 10 (2021)

| Category                                       | Yahan kahan laagu                                                                                                       | Requirements (§4)                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| A01 Broken Access Control                      | Customer ke orders aur media (BOLA), sellers ke beech, staff ka area aur kaam, appeal aur maker-checker, CSRF, redirect | P-SR-17, P-SR-20, P-SR-29, P-SR-31 se P-SR-38, P-SR-61, P-SR-74 |
| A02 Cryptographic Failures                     | Neon aur Atlas tak TLS, PAN aur bank ka encryption, password hash, token signing, backups                               | P-SR-04 (HSTS), P-SR-12, P-SR-30, P-SR-62, P-SR-67, P-SR-82     |
| A03 Injection                                  | NoSQL operators, finance ka SQL, review aur listing me XSS, email header, CSV formula                                   | P-SR-39, P-SR-68, P-SR-72, P-SR-74                              |
| A04 Insecure Design                            | Daam, stock, refund, delivery code, UPI QR, jhoothe daawe, stock rokna, kill switches, ek process ka DoS                | P-SR-06 se P-SR-08, P-SR-41, P-SR-43 se P-SR-59                 |
| A05 Security Misconfiguration                  | Headers, CDN cache, service worker, Redis, DB ka network, health endpoints, Render ka seedha URL                        | P-SR-01, P-SR-03, P-SR-04, P-SR-06, P-SR-09, P-SR-67, P-SR-69   |
| A06 Vulnerable and Outdated Components         | npm packages, image aur PDF libraries (bundle me sab services)                                                          | P-SR-70, P-SR-81                                                |
| A07 Identification and Authentication Failures | Teen sign-in raaste, staff MFA, lockout, codes, sessions, refresh, recovery, invites                                    | P-SR-10 se P-SR-28, P-SR-30                                     |
| A08 Software and Data Integrity Failures       | Webhooks, events, CI aur deploy, actions ki supply chain, public repo                                                   | P-SR-48, P-SR-70, P-SR-79, P-SR-80, P-SR-81                     |
| A09 Security Logging and Monitoring Failures   | Audit, logs ki safai, alerts, incident runbook                                                                          | P-SR-75, P-SR-76, P-SR-77, P-SR-83                              |
| A10 Server-Side Request Forgery                | Push subscription ka endpoint, koi bhi URL fetch                                                                        | P-SR-71                                                         |

### 3.2 OWASP API Security Top 10 (2023)

| Category                                             | Yahan kahan laagu                                                                                                                    | Requirements                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| API1 Broken Object Level Authorization               | Order, parcel, invoice, address, return, review, media ki ids; seller ke listings aur settlement                                     | P-SR-32, P-SR-33                                              |
| API2 Broken Authentication                           | Teeno customer raaste, staff aur seller MFA, delivery ka phone, tokens                                                               | P-SR-10 se P-SR-30                                            |
| API3 Broken Object Property Level Authorization      | Mass assignment (role, status, daam), seller ke jawab me customer ke fields (D-143)                                                  | P-SR-35, P-SR-38                                              |
| API4 Unrestricted Resource Consumption               | 512 MB ka ek process, 300 emails, Atlas ki 0.5 GB aur 100 ops, free storage                                                          | P-SR-06, P-SR-07, P-SR-19, P-SR-60                            |
| API5 Broken Function Level Authorization             | Staff routes customer ya seller token se; Master ke sub-roles                                                                        | P-SR-31, P-SR-34, P-SR-36                                     |
| API6 Unrestricted Access to Sensitive Business Flows | Sign-up codes, place order aur stock, reviews aur reports, daawe, delivery code daalna, forms                                        | P-SR-19, P-SR-43, P-SR-45, P-SR-51, P-SR-56, P-SR-57, P-SR-86 |
| API7 Server Side Request Forgery                     | Push endpoint                                                                                                                        | P-SR-71                                                       |
| API8 Security Misconfiguration                       | Origin ka pehra, cache, headers, CSRF                                                                                                | P-SR-01, P-SR-03, P-SR-04, P-SR-29                            |
| API9 Improper Inventory Management                   | 11 apps, gateway ke routes, laptop ka split mode aur Render ka bundle mode; har route contract me ho, koi chhupa ya debug route nahi | P-SR-31 (contracts se matrix aur manifest), P-SR-06 (health)  |
| API10 Unsafe Consumption of APIs                     | Razorpay ka data, OAuth ka `email_verified`, location aur ingredient data ka import, push service ke jawab                           | P-SR-16, P-SR-42, P-SR-47, P-SR-48, P-SR-71                   |

### 3.3 ASVS level (4.0.3: L1, L2, L3) har app aur service ke liye

ASVS ke hisaab se L1 sabse kam (bahar se jaanchne layak), L2 un apps ke liye jinme sensitive data ho, aur L3 sabse zaroori apps (bade paise, sehat jaisa data) ke liye. Ek insaan ki capacity (D-009) me poora L3 bhaari hai, isliye "L2 + L3 (chapter)" ka matlab: poora L2, aur sirf likhe chapters me L3.

| App ya service                                  | Level                             | Wajah                                                                        |
| ----------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| Customer app                                    | L2                                | Personal data, addresses, payment yahin shuru (card ka data gateway ke paas) |
| Seller app                                      | L2 + L3 (V2, V4)                  | Daam, maal, payout aur bank; doosre seller ka data                           |
| Delivery app (PWA)                              | L2 + L3 (V8.2)                    | Phone pe offline customer data; delivery ka saboot                           |
| Admin, Super Admin, Support Desk, Logistics Ops | L2                                | Staff ke kaam; customer ka data scope ke saath                               |
| Master, Finance                                 | L2 + L3 (V2, V4, V7)              | Grants, switches, payouts aur ledger: sabse bada asar                        |
| Growth Studio, Creator (R2)                     | L2                                | Marketing aur creator ke kaam; points aur coupons ka paisa finance me        |
| identity                                        | L2 + L3 (V2, V3, V6)              | Saare sign-in aur sessions yahin                                             |
| payments, finance                               | L2 + L3 (V11, V7, V6)             | Paise ka hisaab, webhooks, idempotency                                       |
| audit                                           | L2 + L3 (V7.3)                    | Repudiation ka bachav isi pe tika                                            |
| commerce                                        | L2 + L3 (V11)                     | Daam, stock, refund ki ginti                                                 |
| catalog, logistics, notify                      | L2                                | Content, delivery ka saboot, emails                                          |
| support                                         | L2 (R2 me sehat ka data: L3 V8.3) | R1 me patla; R2 me consultation notes aur skin reaction                      |

### 3.4 ASVS 4.0.3 ke chapters aur requirements

| Chapter                                  | Requirements                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| V1 Architecture                          | P-SR-01, P-SR-08, P-SR-67, P-SR-69, P-SR-70, P-SR-83                     |
| V2 Authentication                        | P-SR-10 se P-SR-16, P-SR-18, P-SR-21, P-SR-24, P-SR-25                   |
| V3 Session Management                    | P-SR-15, P-SR-22, P-SR-26 se P-SR-28, P-SR-30                            |
| V4 Access Control                        | P-SR-17, P-SR-23, P-SR-29, P-SR-31 se P-SR-37, P-SR-42                   |
| V5 Validation, Sanitization and Encoding | P-SR-20, P-SR-35, P-SR-39, P-SR-68, P-SR-72, P-SR-74, P-SR-85            |
| V6 Stored Cryptography                   | P-SR-12, P-SR-30, P-SR-62, P-SR-78                                       |
| V7 Error Handling and Logging            | P-SR-54, P-SR-75, P-SR-76, P-SR-77                                       |
| V8 Data Protection                       | P-SR-03, P-SR-09, P-SR-38, P-SR-53, P-SR-61 se P-SR-66, P-SR-73, P-SR-82 |
| V9 Communication                         | P-SR-04 (HSTS), P-SR-67                                                  |
| V10 Malicious Code                       | P-SR-05, P-SR-81                                                         |
| V11 Business Logic                       | P-SR-07, P-SR-19, P-SR-40, P-SR-41, P-SR-43 se P-SR-59, P-SR-84, P-SR-86 |
| V12 Files and Resources                  | P-SR-60, P-SR-61, P-SR-71                                                |
| V13 API and Web Service                  | P-SR-06, P-SR-35, P-SR-48                                                |
| V14 Configuration                        | P-SR-04, P-SR-78 se P-SR-81                                              |

Section number (jaise V3.4) sirf wahan likhe jahan pakka hai; baaki jagah chapter.

## 4. Proposed security requirements

Har requirement naye `SECURITY_REQUIREMENTS.md` ke format (Niyam, Kis module pe, Kahan se, Test kaise) me ja sakti hai. Khane: **Id**, **Requirement** (jaanchne layak vakya), **Kyun** (threats), **ASVS** (4.0.3 chapter ya section), **Kab**, **QA kaise jaanche**. Jahan owner ka sawal (§5) hai, wahan number us jawab se aayega.

### 4.1 Edge, platform aur abuse

| Id      | Requirement                                                                                                                                                                                                                                                                                                                                                                                                          | Kyun                               | ASVS                      | Kab | QA kaise jaanche                                                                                                       |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------- | --- | ---------------------------------------------------------------------------------------------------------------------- |
| P-SR-01 | Gateway `/api/*` ki request tabhi maane jab usme app ke Vercel route ka lagaya secret header ho (constant-time milaan; badalte waqt purani aur nayi dono values). Backend ke seedhe URL pe request 403. Sirf ek tay list ke routes (payment webhook, health, jagane wala) bina secret ke, aur unki apni jaanch ho (jaise webhook signature). Secret sirf Vercel ke Sensitive env aur Render env me.                  | T-01                               | V14.5, V1                 | R1  | Bina header, galat header aur badalne ke baad purani value: 403; webhook bina signature: 401; har app ke host se: 200. |
| P-SR-02 | Client IP ek hi helper se: Vercel ke forwarded headers sirf tab jab secret header sahi ho, warna socket ka IP; IPv6 /64 ke hisaab se gina jaaye; header na mile to warning. Rate limits, sessions aur audit sab isi helper se.                                                                                                                                                                                       | T-01, T-02                         | V7, V11 (ID jaancha nahi) | R1  | Jhootha `X-Forwarded-For` bhejne pe IP na badle; bina secret ke header ignore; unit tests.                             |
| P-SR-03 | Har signed-in ya personal jawab pe `Cache-Control: private, no-store`. Public cache sirf contract me likhe public GET routes pe, jinke liye upstream ko cookies forward nahi hoti. Public jawab pe kabhi `Set-Cookie` nahi. Pro daam aur wishlist ka nishaan jaise personal hisse alag private endpoint se.                                                                                                          | T-03, T-38                         | V8.1, V14                 | R1  | Har non-public route ka header (contract test); public route pe cookie bhejne se jawab na badle.                       |
| P-SR-04 | Har app ke har route pe: CSP (`default-src 'self'`, scripts sirf apni aur hash ya nonce se, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` (private media wale pages pe `no-referrer`), HSTS, aur `Permissions-Policy` jo SR-001 wali cheezon ke alawa sab band rakhe.                                     | T-04, T-23, T-36                   | V14.4                     | R1  | Har app ke routes pe headers (E2E); iframe me khulna mana; inline script na chale.                                     |
| P-SR-05 | Kisi page pe bahar ki koi script nahi; sirf payment wale page pe payment gateway ki checkout script, aur sirf usi page ki CSP me uska host.                                                                                                                                                                                                                                                                          | T-05                               | V14.4, V10                | R1  | Checkout ke alawa har page ki CSP me gateway ka host nahi.                                                             |
| P-SR-06 | Resource ki seemaayein (misaal): JSON body 100 KB (files seedha storage pe, backend se nahi); list ka page 100 tak; har MongoDB query pe 2 s ki time limit aur PostgreSQL pe statement timeout; search ka text 100 characters; password hash ek waqt me 2, baaki line me (line bhari to 503); request 30 s. Health aur jagane wale endpoints na version batayein na database (khaas kar finance, R-014) tak jaayein. | T-06                               | V13.1, V11.1              | R1  | Bada body: 413; page ki seema; dheemi query time-out; 20 sign-in ek saath pe memory theek; health ka jawab sirf "ok".  |
| P-SR-07 | Rate limits IP aur account dono pe (misaal table neeche). Sign-in, codes, payment shuru, review, report aur daawa "fail-closed" (Redis na mile to 503); padhne wale routes "fail-open" (process ki apni chhoti seema ke saath). 429 pe `Retry-After` aur saaf sandesh.                                                                                                                                               | T-02, T-06, T-09, T-10, T-15, T-62 | V11.1                     | R1  | Har class ki seema ke ek upar 429; Redis band: sign-in 503, product page 200.                                          |
| P-SR-08 | Kill switches settings me, bina deploy: naye sign-up band; customer sign-in band; checkout band; uploads band; payouts par rok; "sab sessions band" (ek session epoch badha ke). Har switch sirf Master ka, step-up ke saath, audit me, aur app me saaf sandesh.                                                                                                                                                     | T-78 aur har incident              | V1 (ID jaancha nahi)      | R1  | Har switch se flow band; epoch badhne pe har session 401.                                                              |
| P-SR-09 | Har install hone wale app ka service worker `/api/*` ko kabhi cache ya `index.html` se jawab na de; signed-in pages aur API ke jawab cache me nahi; sirf Delivery app ka offline hissa tay data rakhe (P-SR-22). Sign-out pe app ke caches aur offline data saaf.                                                                                                                                                    | T-08, T-20                         | V8.2                      | R1  | SW ke baad `/api` network se; sign-out ke baad Cache Storage aur IndexedDB khaali.                                     |

**Rate limits ki misaal (P-SR-07):**

| Kaam                       | Seema (misaal)                                        |
| -------------------------- | ----------------------------------------------------- |
| Password se sign-in        | ek IP se 10 minute me 20; account pe S-3 ke hisaab se |
| Code maangna               | S-10 ke hisaab se; ek IP se 10 minute me 5            |
| Code daalna                | ek code pe 5 koshish (P-SR-14)                        |
| "Place order" bina payment | ek account ghante me 5 (P-SR-45)                      |
| Review likhna / report     | ek account din me 5 / 10                              |
| Daawa ya return            | ek account din me 3                                   |
| Uploads                    | ek account din me 30 files ya 100 MB                  |
| Search (bina sign-in)      | ek IP minute me 60                                    |
| Baaki likhne wale kaam     | ek account minute me 60                               |
| Delivery code daalna       | ek parcel pe 5 galat (P-SR-51)                        |
| Export                     | ek account ghante me 5                                |

### 4.2 Authentication

| Id      | Requirement                                                                                                                                                                                                                                                                                                                                                  | Kyun                   | ASVS                                 | Kab             | QA kaise jaanche                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-SR-10 | 7 internal apps aur Master me har sign-in pe doosra factor (S-5 ke hisaab se); authenticator ka code ek hi baar chale (dobara wahi code mana), aur ek chhoti samay-khidki ho (misaal ek step aage ya peeche).                                                                                                                                                | T-07, T-17             | V2.8                                 | R1 (passkey R2) | Bina code sign-in mana; wahi code dobara mana; galat codes pe rate limit.                                                                                                   |
| P-SR-11 | Har app ka ek tay URL ek jagah likha ho (operations ki file aur Master app me). Staff ke emails me sign-in ka koi link nahi, sirf "app kholein". Customer aur seller ke emails me link sirf apne app ke host pe. Email provider ka link tracking band.                                                                                                       | T-07, T-17, T-71       | V2 (ID jaancha nahi)                 | R1              | Templates ka test: links sirf allowlist ke hosts pe; staff templates me link nahi.                                                                                          |
| P-SR-12 | Password kam se kam 12 aur zyada se zyada 128 characters, koi composition rule nahi. Leak hue passwords ki jaanch k-anonymity wali free range API se; API na mile to password maan lo par account pe nishaan, aur agle sign-in pe dobara jaanch. Hash argon2id se (misaal m=19 MiB, t=2, p=1).                                                               | T-09                   | V2.1, V2.4                           | R1              | 11 characters mana; leak wala password mana; API band pe nishaan aur agle sign-in pe jaanch.                                                                                |
| P-SR-13 | Galat password ya code pe rok S-3 ke hisaab se. Ek IP se kai accounts pe fail, ya ek account pe kai IPs se fail, to owner ko security alert (P-SR-77).                                                                                                                                                                                                       | T-09, T-19             | V2.2                                 | R1              | Seema ke upar rok; S-3 ke hisaab se doosre IP se sahi password; alert bane.                                                                                                 |
| P-SR-14 | Customer ka email code: CSPRNG se 6 digits, sirf hash rakha, misaal 10 minute, ek code pe 5 koshish, 3 resend, ek baar istemaal, us sign-in koshish aur us app se bandha. Account pe authenticator ho to code ke baad bhi authenticator. Email code se sign-in sirf customer app me. Email me maangne ka samay aur browser, aur "ye code kisi ko mat batao". | T-10, T-11             | V2.8 (email code ka ID jaancha nahi) | R1              | 6th galat koshish pe code band; 11 minute baad mana; doosre browser me mana; authenticator wale account pe code ke baad bhi authenticator; staff apps me ye raasta hi nahi. |
| P-SR-15 | Account ki security ke badlav (password badalna, email badalna, authenticator band, naye recovery codes, account delete) se pehle dobara pehchaan (password ya code, aur authenticator ho to wo bhi). Email badle to naye email pe code aur purane pe khabar. Password reset ke baad baaki saare sessions band.                                              | T-11, T-84             | V2.5, V3.3                           | R1              | Bina dobara pehchaan badlav mana; purane email pe khabar; reset ke baad doosra device 401.                                                                                  |
| P-SR-16 | Social sign-in me `state`, PKCE (S256) aur OIDC `nonce`; har app ka exact redirect URI; sirf provider ka verified email maana jaaye. Maujooda account se jodna tabhi jab email allowlist pe ho aur provider use verified kahe; warna pehle maujooda tareeke se sign-in. Band account pe social sign-in bhi band. Aakhri sign-in tareeka hataana mana.        | T-12                   | V2, V3 (OAuth ka ID jaancha nahi)    | R1              | Badla `state` aur bina PKCE mana; unverified email pe jodna nahi; allowlist ke bahar sign-up nahi.                                                                          |
| P-SR-17 | Allowlist (D-133) ki jaanch identity me ek hi function se, har raaste pe: password sign-up aur sign-in, social ka pehla sign-in, email code, invite accept, seller, partner aur creator sign-up, waitlist, bina sign-in forms. Allowlist se email hate to uske saare sessions band. Allowlist badalna sirf Master, step-up ke saath, audit me.               | T-13, T-28             | V4                                   | R1              | Har raaste ka test allowlist ke bahar wale email se; hataane ke baad agli call 401.                                                                                         |
| P-SR-18 | Sign-in, sign-up, password reset aur code maangne ka jawab registered aur anjaan email pe ek jaisa, aur kam se kam ek tay samay (misaal 400 ms) ke baad. Anjaan email pe koi email nahi. D-133 ka "demo store" sandesh sirf allowlist ke bahar walon ko (ye allowlist batata hai, account nahi).                                                             | T-14                   | V2 (ID jaancha nahi)                 | R1              | Do emails pe jawab ka body aur samay milao.                                                                                                                                 |
| P-SR-19 | Code wale emails ki seemaayein S-10 ke hisaab se, D-142 ki OTP line ke andar: ek email ko ghante me, sab milake ghante me, aur sign-up ke codes din me. Seema pe app turant saaf sandesh de (code chupchaap na ruke). Sign-up ke codes ki seema khatam ho to bhi password reset aur security ke codes jaayein.                                               | T-15, T-88             | V11.1                                | R1              | Seema ke upar sandesh; sign-up ki seema ke baad bhi reset ka code jaaye.                                                                                                    |
| P-SR-20 | Sign-in ke baad ka `next` sirf apne app ka relative path ho (`/` se shuru, `//` ya `\` se nahi; normalise karke dobara jaancha); warna home page.                                                                                                                                                                                                            | T-16                   | V5.1                                 | R1              | `//evil.example`, `/\evil.example`, encoded dot-segments: sab home pe.                                                                                                      |
| P-SR-21 | Authenticator lagate waqt 10 recovery codes (hash, ek-ek baar). Reset ka raasta S-8 ke hisaab se. Reset ya naye codes pe saare sessions band, security email, aur owner ko alert.                                                                                                                                                                            | T-18                   | V2.5, V2.8                           | R1              | Recovery code dobara mana; reset ke baad sessions 401; S-8 ke bahar wala role reset kare to 403.                                                                            |
| P-SR-22 | Delivery app: sign-in aur phone S-4 ke hisaab se. Offline me sirf us shift ke assigned parcels ka kam se kam data (naam, address, phone, kaam). Delivered ya cancel hote hi us parcel ka data phone se hate; shift khatam ya sign-out pe sab saaf. Hub Manager ek click se partner ka session band kare.                                                     | T-20                   | V8.2, V3.3                           | R1              | Delivered ke baad IndexedDB me parcel nahi; Hub Manager ke band karne ke baad agla sync 401.                                                                                |
| P-SR-23 | Seller app me authenticator S-6 ke hisaab se. Seller ke andar alag permissions: daam, listing content, maal bhejna, stock dekhna, payout aur bank, seller ke staff manage karna. Seller staff ke roles sirf Account Owner de.                                                                                                                                | T-21                   | V4.1, V4.2                           | R1              | Listing wale user se daam badlana 403; bina authenticator ke bank badlana mana.                                                                                             |
| P-SR-24 | Invite ek baar ka, misaal 72 ghante, us email aur us app se bandha, allowlist ke andar; sirf appoint ke haq wala bheje; staff ko accept pe authenticator lagana zaroori. Koi default account ya password nahi; pehla Master sirf owner ke machine se ek baar ki command se, audit me.                                                                        | T-22                   | V2, V4                               | R1              | Invite dobara, expiry ke baad, doosre email se: sab mana; naye install me bina command koi staff sign-in nahi.                                                              |
| P-SR-25 | Step-up (thodi der pehle authenticator) S-7 ki list ke kaamon pe; misaal 5 minute ki khidki; authenticator band karna aur naye recovery codes har baar apna alag code maangein.                                                                                                                                                                              | T-17, T-21, T-39, T-72 | V2, V4 (ID jaancha nahi)             | R1              | List ke har kaam pe bina step-up 403; khidki ke baad dobara.                                                                                                                |

### 4.3 Sessions aur tokens

| Id      | Requirement                                                                                                                                                                                                                                                                                                                                                             | Kyun             | ASVS       | Kab | QA kaise jaanche                                                                                |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------- | --- | ----------------------------------------------------------------------------------------------- |
| P-SR-26 | Cookies: `__Host-` prefix, `HttpOnly`, `Secure`; access ke liye `SameSite=Lax`; refresh ke liye `SameSite=Strict` aur sirf auth wale path pe. Koi token ya user ka data browser storage me nahi, sirf theme jaisi pasand.                                                                                                                                               | T-23             | V3.4       | R1  | Set-Cookie ke flags; localStorage aur sessionStorage me user data nahi.                         |
| P-SR-27 | Access token chhota (misaal 10 minute). Refresh har istemaal pe badle; family ke saath reuse pakda jaaye (reuse pe poori family band aur security email). Usi device aur usi network se turant pichhla token misaal 60 s ke andar aaye to use khoya jawab maana jaaye, chori nahi. Sessions ki umar S-1 aur S-2 se. "My devices" me har session dikhe aur band ho sake. | T-23, T-24       | V3.3, V3.5 | R1  | Purana token doosre device se: family band; khidki me usi device se: chori nahi; umar ke tests. |
| P-SR-28 | Session aur uske band hone ka sach database me; Redis sirf tez cache. Redis khaali ho (R-010) to gateway database se jaanche. Sign-out, role khatam aur allowlist se hatna agli request pe asar kare.                                                                                                                                                                   | T-25, T-28, T-65 | V3.3       | R1  | Redis flush ke baad band session 401; role khatam ke baad agli call 403.                        |
| P-SR-29 | Badalne wale har route pe `Origin` (ya `Host`) ki allowlist, ek custom header jo sirf apna app bhejta hai, aur SameSite. Browser khud jo routes kholta hai (OAuth start aur callback) unki alag list: sirf GET, bina doosre asar ke.                                                                                                                                    | T-26             | V4.2       | R1  | Doosre origin se POST 403; header ke bina 403.                                                  |
| P-SR-30 | Tokens asymmetric signature se (misaal ES256), algorithm pakka; `iss`, `aud` (= app), `exp`, `nbf` jaanche jaayein. Signing keys apne aap badlein (misaal 30 din) aur private key encrypted rahe. Keys na mil payein to 503, 401 nahi.                                                                                                                                  | T-27             | V3.5, V6.2 | R1  | `alg:none`, HS256 key confusion, galat `aud`, expired: sab 401; key ki dikkat pe 503.           |

### 4.4 Authorization aur sellers ki deewar

| Id      | Requirement                                                                                                                                                                                                                                                                                                                                                                                                        | Kyun             | ASVS       | Kab | QA kaise jaanche                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ---------- | --- | ------------------------------------------------------------------------------------------------ |
| P-SR-31 | Default deny: jo route "public" mark nahi, wo bina session 401. Har handler me `authorize(actor, permission, resource)`, ek bina I/O ka pure function (mutation tests ke saath). Permission na ho to 403; cheez scope ke bahar ho to 404. Har route aur har actor ka matrix test contracts se bane; gateway ka route manifest bhi contracts se, aur jo route contract me nahi wo gateway se pahunch hi nahi sakta. | T-29, T-31       | V4.1, V4.2 | R1  | Matrix test CI me; bina permission ka naya route test me fail.                                   |
| P-SR-32 | Customer ki har cheez (order, parcel, invoice, address, return, daawa, review, media) ki query repository level pe owner ke filter ke saath; id kitni bhi lambi ho, uspe bharosa nahi.                                                                                                                                                                                                                             | T-29             | V4.2       | R1  | Har resource type pe doosre customer ki id: 404.                                                 |
| P-SR-33 | Seller ka har data `sellerId` ke filter ke saath repository level pe; reports, exports aur media sirf apne. Staff ka scope (category, area) bhi isi tarah filter se.                                                                                                                                                                                                                                               | T-30             | V4.2       | R1  | Seller B ki har id pe seller A ko 404; export me sirf apne rows.                                 |
| P-SR-34 | Token ka `aud` usi app ka; route manifest me har route ke allowed apps aur permissions. Customer ke token se staff route 403. Delivery partner sirf apne assigned parcels; staff apne area (hub, warehouse, sub-district, district, state; D-015) tak.                                                                                                                                                             | T-27, T-31       | V4.1       | R1  | Customer token se admin route; partner se doosre ka parcel; hub staff se doosra hub: 403 ya 404. |
| P-SR-35 | Har request ka schema strict: anjaane fields pe 400; role, status, daam, seller id jaise fields client se kabhi nahi. Har audience ka apna response roop: seller ke roop me customer ke naam, phone, email aur address ke fields hi nahi (D-143).                                                                                                                                                                  | T-32             | V5.1, V13  | R1  | Extra field pe 400; seller ke jawab ke schema me customer PII nahi.                              |
| P-SR-36 | Kuch permissions kabhi sub-role me nahi (grants dena, authenticator reset, allowlist, payout manzoori, kill switches); koi role khud ko appoint nahi kar sakta; grant ka scope aur umar ho; Master ke paas koi "decide" permission nahi (D-047); role aur grant ka har badlav step-up aur audit ke saath.                                                                                                          | T-33             | V4.1       | R1  | Aisi permission wala sub-role mana; khud ko appoint mana; Master se listing manzoor 403.         |
| P-SR-37 | Kaam ke bantwara ke pure checks: appeal tay karne wala account reject karne wala nahi (D-084, D-146, D-147); seema se upar refund, payout, fees aur policy publish me banane aur manzoor karne wale alag accounts; apne brand ke staff apni listing manzoor nahi (D-031); seller app ke users apne brand ke product pe review nahi (D-156 niyam 5).                                                                | T-34, T-48, T-56 | V11.1, V4  | R1  | Har niyam ka unit aur API test: wahi account 403.                                                |
| P-SR-38 | Staff ki screens pe customer ki jaankari S-13 aur S-14 ke hisaab se: list me chhupi (email aadha, phone ke aakhri 4), poori sirf maamla kholne pe wajah ke saath, aur har "poori dekhi" audit me; delivery partner ko sirf apne active parcel ki jaankari.                                                                                                                                                         | T-35             | V8.3       | R1  | List API me masked; poori dekhne pe audit entry; partner ko delivered ke baad chhupi.            |

### 4.5 Catalog, checkout, payments aur paisa

| Id      | Requirement                                                                                                                                                                                                                                                                                                                                                          | Kyun             | ASVS         | Kab              | QA kaise jaanche                                                                       |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ---------------- | -------------------------------------------------------------------------------------- |
| P-SR-39 | User aur seller ka content (review, brand ka jawab, Q&A, description, ingredients ka text, naam) text ki tarah rakha jaaye aur customer aur staff dono apps me escape karke dikhe. Rich text sirf chhoti allowlist (bold, list), server pe sanitize. Links band ya `rel="nofollow ugc noopener"`. Phone, email aur link ke pattern D-136 ki jaanch me.               | T-36, T-59       | V5.2, V5.3   | R1               | XSS payloads ki list har field me; customer aur Admin app me kuch na chale.            |
| P-SR-40 | Listing ka har jokhim wala badlav (D-098 niyam 1) ek naya version, ek hi raaste se. Staff ki manzoori ek version id pe; beech me naya badlav aaya to wo manzoori naya version live nahi karti. Live version badla nahi ja sakta.                                                                                                                                     | T-37             | V11.1        | R1               | Jaanch ke beech badlav: purani manzoori naya version live na kare.                     |
| P-SR-41 | Daam ke niyam server pe (D-061, D-087): 0 se zyada, batch ke MRP se upar nahi, bade badlav pe confirm. Pro daam sirf jaanche hue Pro (D-069) ke session pe aur private endpoint se, kabhi public cache me nahi.                                                                                                                                                      | T-38, T-40, T-89 | V11.1        | R1 (Pro R2)      | MRP se upar mana; bina confirm 40% girawat mana; bina sign-in jawab me Pro daam nahi.  |
| P-SR-42 | Settings aur data import (allowlist, switches, fees, policy numbers, HSN table, blocklist, emails ki chhat, synonyms, location data): har ek ki apni permission; paise aur security wali settings pe step-up; har badlav audit me purani aur nayi value aur wajah ke saath; import pehle "dry run" aur schema ki jaanch; blocklist sirf senior catalog role (D-132). | T-39             | V4, V7       | R1               | Bina haq 403; audit me pehle aur baad; galat import file ka koi asar nahi.             |
| P-SR-43 | Checkout pe client sirf variant id aur quantity bheje. Daam, batch ka MRP, discount, delivery fee, tax, quantity seema (D-091) aur serviceability (D-016 niyam 9) server usi transaction me nikale. Customer ka dekha total aur server ka total na mile to order nahi; naya total dikhao.                                                                            | T-40             | V11.1        | R1               | Request me daam ya fee bhejne ka koi asar nahi; unserved pincode pe order mana.        |
| P-SR-44 | Stock ki reservation atomic (conditional update ya transaction). "Place order" pe idempotency key: wahi body pe wahi jawab, alag body pe 422, chalte hue pe 409. Ek saath chalne wale requests ke tests.                                                                                                                                                             | T-41             | V11.1        | R1               | Aakhri unit pe 50 order ek saath: ek hi safal; dobara click: ek hi order.              |
| P-SR-45 | Stock rokne ki seema: ek customer ke khule delivery-pe-UPI orders S-17 ke hisaab se; ek account ghante me bina payment ke "place order" misaal 5; D-091 ki quantity seema.                                                                                                                                                                                           | T-42             | V11.1        | R1               | Seema ke upar order mana, saaf sandesh ke saath.                                       |
| P-SR-46 | Paisa hamesha integer paise me; baantne ka ek function jiska bacha paisa tay niyam se jaaye. Har refund line ke hisaab se, aur kabhi "liya gaya paisa minus pehle ke refund" se zyada nahi. Property tests.                                                                                                                                                          | T-43             | V11.1        | R1               | Random carts pe refunds ka jod payment se kabhi zyada nahi.                            |
| P-SR-47 | Gateway ka order server banaye (exact rakam aur currency, apne order se juda). Order tabhi paid jab server signature jaanche ya webhook aaye aur rakam, currency aur order id milein. Browser ka "success" sirf screen ke liye.                                                                                                                                      | T-44, T-46       | V11.1        | R1               | Nakli success callback pe order unpaid; kam rakam ka payment juda nahi.                |
| P-SR-48 | Webhook ki signature raw body pe, constant-time milaan. Event id unique (inbox table), taaki dobara aaye to dobara asar nahi. Ulte kram me aaye events sambhale. Der se aaya payment D-118 ke hisaab se apne aap refund, ek hi baar.                                                                                                                                 | T-44, T-45       | V13.1, V11.1 | R1               | Wahi event 3 baar: ek asar; badli body: 401; ulta kram: sahi aakhri haalat.            |
| P-SR-49 | Delivery pe UPI: QR sirf system banaye, us parcel ki exact rakam ka, server se partner ke app me. Paid sirf gateway ke webhook se. Customer ke app me usi waqt "payment mila" dikhe. Partner ke app me "paid" mark karne ka koi raasta nahi. Delivery code payment ke baad hi (D-109 niyam 4).                                                                       | T-47             | V11.1        | R1               | Partner ke liye paid mark ka koi API nahi; webhook ke bina code daalna band.           |
| P-SR-50 | Paise wale haath ke faisle (refund aur daawa S-11, payout S-12, goodwill S-15): role ke hisaab se rakam ki seema, din ki kul seema, aur seema se upar doosre account ki manzoori; har ek audit me; refund hamesha original raaste (D-111).                                                                                                                           | T-48, T-56, T-73 | V11.1, V4    | R1 (goodwill R2) | Seema se upar Agent ka faisla pending; banane aur manzoor karne wala ek account: mana. |
| P-SR-51 | Delivery code: har parcel ka CSPRNG se 6 digit (misaal). Partner ke app ko code kabhi nahi milta; milaan server pe. Ek parcel pe 5 galat koshish ke baad code daalna band (Hub Manager khole, audit me). Code tabhi chale jab parcel "out for delivery" aur usi partner ko assigned ho. Code push, logs aur aankdon me kabhi nahi.                                   | T-50             | V11.1        | R1               | 6th koshish mana; doosre partner se mana; logs me code nahi.                           |
| P-SR-52 | Delivery aur pickup ka saboot: photo app ke camera se (file input pe `capture`; browser me gallery poori tarah rokna pakka nahi, ye seema maani); server ka samay; location aur uski accuracy; address ke pin se doori (misaal 300 m se zyada to nishaan); photo ka hash (wahi photo dobara aaye to nishaan).                                                        | T-51, T-54       | V11.1        | R1               | Purani photo ka hash dobara: nishaan; door ki location: nishaan.                       |
| P-SR-53 | Partner ki location sirf events pe (delivered, koshish fail, pickup); lagatar tracking nahi. Kitne din aur kaun dekhe, S-19 ke hisaab se.                                                                                                                                                                                                                            | T-52             | V8.3         | R1               | Delivery ke beech location ki koi call nahi; retention job ka test.                    |
| P-SR-54 | Trip aur scans: har scan pe actor, device aur samay; manifest aur seal number (D-027); hub pe ginti ka farak apne aap nishaan aur audit me.                                                                                                                                                                                                                          | T-53             | V7           | R1               | Kam bag pe nishaan; har scan ka actor.                                                 |
| P-SR-55 | Fraud ke signals ka record R1 se (D-072 niyam 4, D-116): customer ke daawe, photo hash ka dobara aana, partner ke daawon ka hissa, delivery pe UPI pe mana. Support ki screen pe nishaan; apne aap rok sirf tay faislon se (D-109; D-116 R2 me).                                                                                                                     | T-54, T-55       | V11.1        | R1 (record)      | Signals ka record aur nishaan dikhe.                                                   |
| P-SR-56 | Reviews sirf delivered line se (D-135); ek account din me misaal 5. Seller app ke users ki pehchaan (wahi user ya wahi email) se apne brand pe review band (D-156 niyam 5). Kai accounts ke signals S-16 ke hisaab se.                                                                                                                                               | T-57, T-85       | V11.1        | R1 (signals R2)  | Bina delivered line review 403; seller user ka review 403.                             |
| P-SR-57 | Report sirf signed-in, ek account din me misaal 10. "Personal data" ya "intimate" wali report (D-136 niyam 4) queue me sabse upar, aur misaal 24 ghante me faisla na ho to alert. Jhoothi reports ki ginti rakhi jaaye; baar-baar jhoothi report wale ki report queue me neeche. Seller ki report (R2) kabhi apne aap nahi chhupati.                                 | T-58             | V11.1        | R1               | Seema ke upar report mana; SLA alert; jhoothi report ka counter.                       |
| P-SR-58 | Seller ke bank ya payout details ka badlav step-up ke saath; purane email aur in-app pe khabar; S-29 ke hisaab se naye khaate pe payout ki rok; details encrypted, screen pe sirf aakhri 4.                                                                                                                                                                          | T-72             | V11.1, V8.3  | R1 (design)      | Bina step-up mana; khabar jaaye; rok ke dauraan payout batch me nahi.                  |
| P-SR-59 | Ledger sirf append (app ke DB role ko update aur delete ka haq nahi); har entry balance (double entry) ki jaanch; sudhaar sirf ulti entry se, wajah ke saath; gateway ki report se roz ya hafte ka milaan (R1 me basic); farak pe alert.                                                                                                                             | T-74             | V11.1, V7.3  | R1               | App role se UPDATE mana; milaan ka test.                                               |

### 4.6 Files, media aur data protection

| Id      | Requirement                                                                                                                                                                                                                                                                                                                                                                                    | Kyun             | ASVS                | Kab | QA kaise jaanche                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------- | --- | ------------------------------------------------------------------------------------------- |
| P-SR-60 | Uploads: type magic bytes se (images JPEG, PNG, WebP; dastavez PDF sirf jahan zaroori; video sirf daawe me, D-106). Size misaal: image 5 MB, PDF 10 MB, video 30 MB. SVG, HTML aur baaki types kabhi nahi. Har image dobara encode ho aur EXIF (location samet) hate. File ka naam kabhi istemaal nahi. Signed direct upload (misaal 10 minute, exact type aur size). Account ki din ki seema. | T-59, T-60, T-62 | V12.1, V12.2, V12.3 | R1  | SVG aur `.png` naam wala HTML mana; EXIF wali photo ka live roop bina EXIF; bada file mana. |
| P-SR-61 | Private media (KYC, Pro ke dastavez, claims ke saboot, daawe aur pickup ki photos, delivery ki photo) alag private jagah me; sirf authorization ke baad chhota signed URL (misaal 5 minute); PDF `Content-Disposition: attachment` ke saath; app ke origin se kabhi nahi. Har file ka record (owner, maqsad, public ya private); data me provider ka URL nahi, sirf file ka id.                | T-52, T-61, T-89 | V12.4, V12.5, V8.3  | R1  | Private URL 6 minute baad mana; bina haq signed URL nahi banta.                             |
| P-SR-62 | Field encryption (AES-256-GCM; record aur field ka context associated data me; key id ke saath taaki key badal sake): seller PAN, bank account, authenticator secrets, partner ke ID numbers, aur R2 me consultation notes aur sehat ke fields. Dhoondhne ke liye HMAC blind index; dikhane ke liye masked copy. Recovery codes aur codes sirf hash.                                           | T-63, T-86       | V6.2, V8.3          | R1  | DB me plaintext nahi (pattern test); copy kiya sealed value doosre record me nahi khulta.   |
| P-SR-63 | Kam data: Aadhaar ka number nahi lena (kisi KYC me zaroori ho to masked; Kanooni detail jaanchi nahi (R-004)); customer ka UPI ID nahi rakhna; proprietor ka GSTIN personal data maana jaaye (andar PAN hai); delivery partner aur transporter ke driver ka sirf kaam ka data.                                                                                                                 | T-52, T-63       | V8.3                | R1  | Schema me aise fields nahi (review checklist).                                              |
| P-SR-64 | Har data class ke rakhne ke samay (S-19 se S-24) ka roz ka job: delete ya pehchaan hataana; job ka log (kitne hate) bina data ke; backups me purana data backup ki umar tak (S-26).                                                                                                                                                                                                            | T-52, T-84       | V8.3                | R1  | Samay se purana record nahi bachta; job ka test.                                            |
| P-SR-65 | Account delete (D-151): pehle dobara pehchaan; email aur in-app khabar; 7 din wapsi. Ek event se har service apni copy hataye ya pehchaan hataye (invoice aur ledger me code). Sessions, push subscriptions aur waitlist bhi.                                                                                                                                                                  | T-84             | V8.3                | R1  | Delete ke baad har service me naam aur email nahi; invoice me code.                         |
| P-SR-66 | Sehat ka data (R2): alag consent ka maqsad (D-165 niyam 4); encrypted (P-SR-62); sirf S-22 ke roles dekhein, har dekhna audit me; S-23 ka samay; seller ko kabhi nahi (D-165 niyam 5); business events aur aankdon (D-157) me kabhi nahi.                                                                                                                                                      | T-86             | V8.3                | R2  | Bina consent field save nahi; galat role 403; events me ye fields nahi.                     |

### 4.7 Data stores, services aur khabrein

| Id      | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                             | Kyun             | ASVS          | Kab | QA kaise jaanche                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------- | --- | ------------------------------------------------------------------------ |
| P-SR-67 | Har service ka DB user sirf apne database pe (MongoDB me apne DB pe `readWrite`; finance me app role sirf DML, migration role alag). TLS zaroori. Har password random (misaal 32+ characters). Provider network allowlist de to wahi (§11). Laptop, tests aur CI kabhi production databases se nahi judte, sirf backup command (D-013).                                                                                                                 | T-63             | V1, V9.2, V14 | R1  | Service A ke user se B ka DB mana; bina TLS connection mana.             |
| P-SR-68 | MongoDB filters sirf typed builders se; user input me `$` ya `.` se shuru keys mana; finance me sirf parameterized queries; search text ka regex escape aur lambai ki seema.                                                                                                                                                                                                                                                                            | T-64             | V5.3          | R1  | `{"$ne": null}` jaise inputs pe 400; SQL injection strings ka asar nahi. |
| P-SR-69 | Redis sirf internal URL se (D-051), provider de to password ke saath; har service ka key prefix; cache me sirf wo jo database se dobara ban sake; queue ke job ka payload worker me schema se jaancha jaaye.                                                                                                                                                                                                                                            | T-65             | V1, V5.1      | R1  | Galat job payload reject; Redis flush ke baad cache sahi bane.           |
| P-SR-70 | Bundle mode me bhi service ki deewar: services ek doosre ka DB client ya andar ka code import nahi karti (lint aur dependency rule); andar ki calls bhi typed facade aur actor ke context se authorize; har service sirf apne config namespace ke secrets padhe (lint); events schema se jaanche aur producer ke naam ke saath; split mode me andar ki calls signed. Image aur PDF ka kaam jahan ho sake provider pe, ya chhoti aur taaza libraries se. | T-60, T-66, T-67 | V1, V14.2     | R1  | Lint: doosri service ka import fail; galat producer ka event reject.     |
| P-SR-71 | Server sirf tay hosts ko bulaye (payment, email, OAuth, breached-password API, push services ki allowlist). Push subscription ka endpoint sirf `https` aur jaane-maane push hosts. Redirect follow nahi. User ka diya URL kabhi fetch nahi (Meet link bhi nahi).                                                                                                                                                                                        | T-68             | V12.6         | R1  | Anjaan ya andar ke host wali subscription save nahi.                     |
| P-SR-72 | Email templates auto-escape; header injection (CRLF) mana; kam se kam personal data (poora address sirf invoice me); OTP aur codes kabhi logs me nahi; seller ke udhaar wale email me payment link ki jagah "Seller app me dekhein" (link ho to sirf seller app ke host ka); S-25 ke hisaab se.                                                                                                                                                         | T-69, T-71       | V5.3, V8.3    | R1  | Naam me `<script>` aur CRLF wala test; templates ke links ka test.       |
| P-SR-73 | Push subscription user aur session se bandhi; sign-out aur account badalne pe us browser ki subscription server se hate. Payload S-25 ki seema me, code ya rakam kabhi nahi. VAPID private key secret. 404 ya 410 pe subscription delete.                                                                                                                                                                                                               | T-50, T-70       | V8.2, V8.3    | R1  | Sign-out ke baad us browser pe push nahi; payload ka test.               |

### 4.8 Export, audit, logs aur DevOps

| Id      | Requirement                                                                                                                                                                                                                                                                                                                                                                        | Kyun                   | ASVS                    | Kab | QA kaise jaanche                                                               |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------- | --- | ------------------------------------------------------------------------------ |
| P-SR-74 | Export (D-144): jo cell `=`, `+`, `-`, `@`, tab ya CR se shuru ho, uske aage `'`. Scope wahi jo report ka. Step-up. Audit me filters aur rows ki ginti. 50,000 ki seema (D-144). Download link chhota aur ek baar ka.                                                                                                                                                              | T-30, T-35, T-75       | V5.3, V4                | R1  | `=HYPERLINK(...)` wala naam export me text hi rahe; doosre seller ka row nahi. |
| P-SR-75 | Audit log append-only; roz ki hash chain aur uski jaanch ka job (finance ka audit Neon ke ghante dekh ke, R-014); DB role ko update aur delete ka haq nahi; mana hue kaam bhi likhe jaayein. Fields: account, insaan (owner ke saare accounts ek insaan se jude), role, app, session, kaam, cheez, scope, pehle aur baad (masked), wajah, nateeja, IP, browser, request id, samay. | T-39, T-56, T-74, T-76 | V7.1, V7.3              | R1  | Ek entry badli to jaanch fail; mana hua kaam audit me dikhe.                   |
| P-SR-76 | Logs structured; redaction list (password, code, token, cookie, authorization, sealed fields, address, phone, poora email, PAN, bank, delivery code); request aur response body ka log default band; client ko sirf generic error aur request id, stack trace kabhi nahi.                                                                                                          | T-77                   | V7.1, V7.4              | R1  | Log capture test me redaction; 500 pe stack nahi.                              |
| P-SR-77 | Owner ko security alerts: Master app me in-app aur push; sirf gambhir wale email se (OTP ke baad wali line me, din me misaal 5 tak). Events: refresh reuse, authenticator reset, naya staff grant, allowlist badla, ek IP se bahut fail, webhook signature fail, bada export, kill switch, audit chain toota, milaan ka farak.                                                     | T-18, T-78             | V7 (ID jaancha nahi)    | R1  | Har event pe alert bane.                                                       |
| P-SR-78 | Secrets sirf provider env me (Render, Vercel ka Sensitive env); kabhi repo, client bundle ya logs me nahi. Test aur live keys alag aur naam se pehchaan me aayein. Har secret do values ke saath badal sake (bina downtime). Kis secret ko kaise badalna, operations ki file me (S-27).                                                                                            | T-49, T-63, T-79       | V6.4, V14.1             | R1  | Build me client bundle ki jaanch (secret ke naam); badalne ka abhyaas.         |
| P-SR-79 | Repo ke pehre: GitHub secret scanning aur push protection chalu (§11); CI me secret scan; `.env` aur backup folder `.gitignore` me aur CI ka pehra (D-013).                                                                                                                                                                                                                        | T-49, T-79             | V14.1                   | R1  | Jaali secret wala commit CI me fail.                                           |
| P-SR-80 | Provider accounts (GitHub, Vercel, Render, Atlas, Neon, Razorpay, email provider, OAuth apps wala account) pe MFA (passkey ya authenticator), recovery codes offline; tokens kam haq aur kam umar wale; deploy sirf `release` branch se; branch protection.                                                                                                                        | T-80, T-82             | V14.1 (ID jaancha nahi) | R1  | Operations ki checklist; har account pe MFA.                                   |
| P-SR-81 | Supply chain: lockfile aur `npm ci`; GitHub Actions SHA pe pinned; fork PRs ko secrets nahi, aur `pull_request_target` me PR ka code checkout nahi; dependency alerts; naye dependency pe review.                                                                                                                                                                                  | T-81                   | V14.2                   | R1  | Workflow lint: har action SHA pe.                                              |
| P-SR-82 | Backups (D-013) S-26 ke hisaab se encrypted; key repo me nahi; restore local pe jaancha; kabhi CI artifact ya cloud sync folder me nahi; sealed fields backup me bhi sealed (keys backup me nahi).                                                                                                                                                                                 | T-82, T-83             | V8.1                    | R1  | Bina key backup na khule; restore test.                                        |
| P-SR-83 | Incident runbook operations ki file me (§7.4): kaunse switch, kaunse secrets kis kram se, users ko khabar (S-28); saal me ek baar abhyaas.                                                                                                                                                                                                                                         | T-78                   | V1 (ID jaancha nahi)    | R1  | Abhyaas ka record.                                                             |

### 4.9 R2 ke hisse

| Id      | Requirement                                                                                                                                                                                | Kyun | ASVS  | Kab | QA kaise jaanche                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ----- | --- | --------------------------------------------------------------------------------------- |
| P-SR-84 | Points, coupons aur gift cards ka hisaab finance ledger me; redemption idempotent aur unique constraint se; ek saath kharch ke tests; per-customer seemaayein S-16 ke jod pe.              | T-85 | V11.1 | R2  | 10 redemption ek saath: ek safal.                                                       |
| P-SR-85 | Meet link: URL parse, `https`, host theek `meet.google.com`, path ka pattern. Advisor ke jawab me links sirf apne customer app ke products pe; baaki sirf text.                            | T-87 | V5.1  | R2  | `https://meet.google.com.evil.example` aur `https://meet.google.com@evil.example` mana. |
| P-SR-86 | Bina sign-in forms: pehle email ka pakka hona code se (OTP line ki seema me), tabhi allowlist ki jaanch aur ticket. Honeypot field; IP aur email pe rate limit; CAPTCHA S-18 ke hisaab se. | T-88 | V11.1 | R2  | Bina code ticket nahi; seema ke upar mana.                                              |

## 5. Proposed owner sawal

Sirf wo baatein jo owner ki policy hain; technical controls §4 me. Har sawal ke "Kis par tika" me dependency; aakhir me (§5.30) kaunse sawal ek saath, aur kaunse groups.

### S-1. Customer ka sign-in kitni der chale?

- **Sawal:** customer app me ek baar sign-in kitne din tak chale, phir dobara sign-in?
- **Kyun zaroori:** guest cart nahi (D-020), to har cart aur wishlist pe sign-in chahiye. Har naya sign-in email code (D-021) se ho to emails ki din ki chhat (D-142) khaata hai. Doosri taraf, lamba session chori ho jaaye to bhi lamba chalta hai, aur shared phone ya laptop pe agla insaan account me hota hai.
- **Vikalp:**
  - **(a)** Har istemaal pe 30 din aage badhe, zyada se zyada 90 din; phir dobara sign-in.
  - **(b)** 7 din aage badhe, zyada se zyada 30 din.
  - **(c)** 90 din aage badhe, zyada se zyada 1 saal.
- **Salah:** **(a)**. Saath me account ki security ke badlav pe dobara pehchaan (P-SR-15) aur "My devices" se kisi bhi session ko band karna (P-SR-27), to lambe session ka jokhim kam rehta hai.
- **Trade-off:** (a) me chori hua session 90 din tak chal sakta (jab tak user "My devices" se band na kare); (b) me har hafte sign-in, zyada codes aur zyada rukawat; (c) sabse aasaan, par chori ka asar sabse lamba.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-2. Staff, seller aur creator apps me sign-in kitni der chale?

- **Sawal:** 7 internal apps aur Master, Seller app, aur Creator app me session ki umar aur bina kaam ke band hone ka samay kya ho?
- **Kyun zaroori:** staff ke account sabse taaqatwar hain; khula chhoda laptop ya chori hua session bada nuksaan kar sakta hai. Owner ke ~80 accounts (D-017) pe roz sign-in ka bojh bhi isi number se tay hota hai.
- **Vikalp:**

  | App                     | (a)                            | (b)                           | (c)                           |
  | ----------------------- | ------------------------------ | ----------------------------- | ----------------------------- |
  | 7 internal apps, Master | 12 ghante; 30 minute bina kaam | 8 ghante; 15 minute bina kaam | 24 ghante; 2 ghante bina kaam |
  | Seller                  | 7 din badhe, max 30 din        | 1 din badhe, max 7 din        | 30 din badhe, max 90 din      |
  | Creator (R2)            | 30 din badhe, max 90 din       | 7 din badhe, max 30 din       | 30 din badhe, max 90 din      |

- **Salah:** **(a)**: staff ke liye ek kaam ka din; seller ke liye hafte me ek sign-in; Creator customer jaisa. (b) owner ke accounts ke saath bahut bhaari.
- **Trade-off:** (a) me staff ka chori hua session ek din tak; (b) zyada surakshit par bahut sign-in; (c) aasaan par chori ka asar lamba.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1 (Creator R2).
- **Kis par tika:** kisi pe nahi.

### S-3. Galat password ya code pe rok kaisi ho?

- **Sawal:** baar-baar galat password ya code pe account kaise roka jaaye?
- **Kyun zaroori:** rok na ho to password ka andaaza lagta rehta hai. Par poore account ki rok ho to koi bhi jaan-boojh ke galat password daal ke owner ke staff accounts band kar sakta hai (T-19).
- **Vikalp:**
  - **(a) IP aur account mila ke:** ek IP (IPv6 me /64) se 15 minute me 10 galat → us IP ke liye us account pe 1 ghanta rok; saare IPs milake 15 minute me 50 galat → poore account pe 15 minute. Rok ke dauraan "password bhool gaye" chalta rahe, aur rok ke dauraan ki koshishein gini na jaayein.
  - **(b) Sirf account:** 15 minute me 10 galat → poora account 1 ghanta band, har IP se.
  - **(c) Account pe koi rok nahi:** sirf IP ki rate limit aur leak hue password ki jaanch.
- **Salah:** **(a)**: hamlavar ka andaaza rukta hai, aur owner doosri jagah se sign-in kar sakta hai.
- **Trade-off:** (a) me kaam thoda zyada (do ginti); bahut IPs wala hamlavar (botnet) 15 minute ki rok tak pahunch sakta hai. (b) seedha, par rok ka hathiyar. (c) andaaze pe kam rok.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-4. Delivery app me sign-in aur phone kaise?

- **Sawal:** delivery partner Delivery app me kaise sign-in kare, aur kya session ek manzoor phone se bandha ho?
- **Kyun zaroori:** partner ka phone hi kaam ka auzaar hai, app offline bhi chalta hai (D-042), aur phone pe customers ke naam, address aur phone hote hain. Partners gig partners hain (D-033): roz authenticator ka bojh kaam rokta hai.
- **Vikalp:**
  - **(a)** Email + password; partner ka ek manzoor phone (Hub Manager manzoor kare; naya phone = nayi manzoori); session usi phone pe misaal 14 din; authenticator optional; Hub Manager kabhi bhi session band kar sake.
  - **(b)** Email + password + authenticator har shift (misaal har 12 ghante).
  - **(c)** Email + password, session 30 din, phone ki koi bandish nahi.
- **Salah:** **(a)**: offline ke saath chalta hai, phone khone pe Hub Manager turant band karta hai, aur partner pe roz ka bojh nahi.
- **Trade-off:** (a) me Hub Manager ka kaam (naya phone manzoor karna), aur browser me "phone" ki pehchaan us browser me rakhi key se hoti hai: browser ka data saaf hua to dobara manzoori. (b) zyada surakshit, par authenticator usi phone pe ho to phone chori = dono gaye. (c) aasaan, par chori ka asar lamba.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-5. Staff ka doosra factor kya ho?

- **Sawal:** staff accounts (7 internal apps aur Master) pe password ke saath doosra factor kaunsa ho?
- **Kyun zaroori:** owner ke ~80 accounts (D-017) me se zyadatar pe doosra factor lagega. Domain nahi (D-028), to milte-julte naam ka nakli sign-in page banana aasaan hai; authenticator ka code nakli page pe bhi daala ja sakta hai, jabki passkey sirf asli site pe chalti hai.
- **Vikalp:**
  - **(a)** R1 me authenticator app (6 digit code) har staff account pe; passkey R2 me ek aur raasta.
  - **(b)** R1 se passkey (phone ya laptop ka fingerprint ya PIN, password manager me) pehla raasta, authenticator backup.
  - **(c)** Hamesha sirf authenticator.
- **Salah:** **(a)**: R1 me kaam kam; R2 me passkey; asli business pe Master aur Finance pe passkey zaroori karna owner tab tay kare.
- **Trade-off:** (a) me authenticator app me ~50+ entries, aur phishing ka jokhim; agar authenticator ke secrets usi password manager me hon jisme passwords, to do factor ek jaisa ho jaata hai. (b) phishing se bachav, par har app ka alag host (D-048) hai, to har account ki passkey uske app ke host pe banti hai; banane ka kaam zyada. (c) phishing ka jokhim hamesha.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1 (passkey R2).
- **Kis par tika:** group G-A (S-8 ke saath).

### S-6. Seller app me authenticator kin users pe zaroori?

- **Sawal:** seller ke kaunse users ke liye authenticator zaroori ho?
- **Kyun zaroori:** D-017 me misaal Account Owner aur Seller Finance hai. Par daam ka badlav (₹1,999 ki jagah ₹199), maal bhejna aur seller ke staff jodna bhi bade asar wale kaam hain; inka account chori ho to seller ka seedha nuksaan.
- **Vikalp:**
  - **(a)** Account Owner, Finance, aur jis bhi user ke paas daam, payout ya bank, seller ke staff, ya maal bhejne ka haq ho; sirf listing content ya reports wale users bina authenticator.
  - **(b)** Sirf Account Owner aur Finance.
  - **(c)** Saare seller users.
- **Salah:** **(a)**: jokhim ke hisaab se, aur content likhne wale pe bojh nahi.
- **Trade-off:** (a) me seller ke kai users pe authenticator; (b) me daam aur maal bina doosre factor ke; (c) sabse surakshit par chhote brand ke content wale bhi authenticator chalayein.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-7. Kin kaamon pe dobara authenticator (step-up)?

- **Sawal:** sign-in ke baad bhi kin kaamon se theek pehle dobara authenticator maanga jaaye?
- **Kyun zaroori:** khula chhoda session ya chori ki cookie se sabse bade kaam na ho sakein. Har kaam pe maangna kaam rok deta hai.
- **Vikalp:**
  - **(a) Tay list, 5 minute (misaal) ki khidki:** role ya grant dena aur hatana; authenticator reset; allowlist badalna; area switches aur live; fees, policy numbers, HSN table, blocklist aur emails ki chhat; payout "paid"; refund ya daawe ki manzoori seema se upar; export; seller ka bank badalna; kill switches. Authenticator band karna aur naye recovery codes banana har baar apna alag code maangein.
  - **(b)** Staff ke har likhne wale kaam pe.
  - **(c)** Sirf Master ke kaamon pe.
- **Salah:** **(a)**.
- **Trade-off:** (a) list ko naye kaamon ke saath badhana padega; (b) staff ka kaam bahut dheema; (c) Finance aur Admin ke bade kaam bina step-up.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-8. Authenticator kho jaye to account kaise wapas mile?

- **Sawal:** staff ka (aur Master ka) authenticator kho jaye to reset ka raasta kya ho?
- **Kyun zaroori:** owner akela hai; phone kho jaaye to bahut se accounts ek saath band. Aur reset ka raasta hi takeover ka sabse aasaan raasta hota hai.
- **Vikalp:**
  - **(a)** Pehle recovery codes (10, ek-ek baar). Staff ke account ka reset Master account kare (step-up, audit, saare sessions band, user ko email). Master ka apna: sirf recovery codes; wo bhi na hon to owner ke laptop se ek "break-glass" command jo seedha database pe reset kare aur audit me likhe.
  - **(b)** Ek alag security role kisi ka bhi reset kare, Master ka bhi.
  - **(c)** Email code se reset.
- **Salah:** **(a)**.
- **Trade-off:** (a) me recovery codes sambhalne padte hain, aur break-glass command ke liye production database ke credentials laptop pe (backup command ke liye pehle se, D-013). (b) ek role ke paas sabki chaabi. (c) inbox hi authenticator ban jaata hai: doosre factor ka matlab khatam.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** group G-A (S-5 ke saath; passkey aaye to recovery ka raasta badalta hai).

### S-9. Kai apps me sign-in: har app alag, ya ek central sign-in?

- **Sawal:** jis insaan ke roles kai apps me hon, wo har app me alag sign-in kare, ya ek jagah sign-in karke sab apps khulein?
- **Kyun zaroori:** 11 apps alag hosts pe hain (D-010, D-048, domain nahi), aur cookies har host ki alag. Ek insaan ke kai roles kai apps me hon to har app me sign-in.
- **Vikalp:**
  - **(a)** Har app ka apna sign-in aur apni cookies; password manager se aasaan.
  - **(b)** Ek central sign-in app; baaki apps redirect se ek baar ka code le ke apna session banayein.
  - **(c)** Abhi (a), aur asli business pe (b), jab asli staff ke roles kai apps me hon.
- **Salah:** **(a)**: owner ka har role ka alag account hai (D-017), to zyadatar ek account ek hi app me jaata hai; central sign-in se owner ka bojh kam nahi hota, jabki redirect aur code ke naye hamle ke raaste aate hain.
- **Trade-off:** (a) asli business pe kai roles wale staff ko kai sign-in; (b) ek jagah chori = sab apps, aur banane ka kaam bada; (c) baad me badlaav ka kaam.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-10. Bina sign-in maange jaane wale codes ki seema kya ho?

- **Sawal:** sign-in, sign-up aur password reset ke code wale emails kitne bheje ja sakein?
- **Kyun zaroori:** code maangna bina sign-in ke hota hai, aur din ke 300 emails me OTP ki 60 pakki jagah (D-142) hai. Seema na ho to koi bhi codes maang-maang ke din ki jagah kha sakta hai, ya kisi ke inbox pe emails ki baadh la sakta hai. Allowlist (D-133) abhi isse bachati hai, par asli business pe allowlist band hogi.
- **Vikalp:**
  - **(a)** Ek email ko ghante me 5 code (ek IP se unme 3 tak); saare emails milake ghante me 30; sign-up ke codes din me 20. Allowlist band karte waqt dobara dekhna.
  - **(b)** Ek email 3, sab milake ghante me 15, sign-up din me 10.
  - **(c)** Ek email 10, sab milake ghante me 60, sign-up din me 60.
- **Salah:** **(a)**: sign-up ki baadh ke baad bhi password reset, invite aur security codes ke liye jagah bachti hai.
- **Trade-off:** (a) bhaari ghante me asli user ko "thodi der baad" ka sandesh; (b) aur kada; (c) ek ghante me OTP ki poori jagah khatam ho sakti.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-11. Support ke paise wale faislon ki seema kya ho?

- **Sawal:** Support Agent kitni rakam tak refund ya daawa khud manzoor kare, aur kab doosre account ki haan chahiye?
- **Kyun zaroori:** R1 me zyadatar refund niyam se apne aap shuru hote hain (cancel, RTO, warehouse jaanch; D-111). Par "parcel nahi mila" aur toote item ke daawe ka faisla, aur fail hua refund ka haath ka raasta, insaan karta hai (D-105, D-111 niyam 3). Chori ka account ya mili-bhagat yahin nuksaan karti hai.
- **Vikalp:**
  - **(a)** Support Agent ek maamle me misaal ₹2,000 tak aur din me kul misaal ₹10,000 tak; usse upar Support Lead (doosra account). Haath ka refund raasta hamesha Support Lead + Finance ki manzoori se.
  - **(b)** Koi seema nahi, sirf audit.
  - **(c)** Har insaani faisle pe doosre account ki haan.
- **Salah:** **(a)**.
- **Trade-off:** (a) bade maamle thode der se; (b) ek account se bada nuksaan; (c) har chhote maamle pe do log (owner ke do accounts) ka bojh.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** group G-B (S-15 ke saath).

### S-12. Payout "paid" kaun mark kare?

- **Sawal:** seller ke payout ko "paid" mark karne ke liye ek account kaafi ho, ya do?
- **Kyun zaroori:** R1 me payout haath se "paid" hota hai (D-055, D-081); asli business pe yahi asli bank transfer banega. Ek hi account bana bhi sake aur mark bhi kare, to chori ka account seller ka paisa "paid" dikha sakta hai.
- **Vikalp:**
  - **(a)** Finance role payout batch banaye; Master ka doosra signature (D-047) manzoor kare; ek account dono kaam nahi kar sakta.
  - **(b)** Ek Finance role bana ke khud mark kare.
  - **(c)** Sirf Master mark kare.
- **Salah:** **(a)**.
- **Trade-off:** (a) har hafte do accounts se kaam (owner ke liye do sign-in); (b) ek account ka jokhim; (c) Master ke paas kaam ka haq aa jaata (D-047 ki soch ke khilaaf).
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-13. Staff ko customer ki jaankari kitni dikhe?

- **Sawal:** Support, warehouse, hub aur delivery partner ko customer ka naam, email, phone aur address kitna dikhe?
- **Kyun zaroori:** D-143 sellers ke liye tay hai, par staff ke liye nahi. Staff ki lists se customers ka data bahar jaane ka sabse aasaan raasta hai (T-35).
- **Vikalp:**
  - **(a)** Lists me chhupi (naam ka pehla hissa aur shehar, email aadha, phone ke aakhri 4). Poori sirf maamla kholne pe, wajah chun ke, aur har dekhna audit me. Delivery partner ko sirf apne active parcel ka naam, address aur phone, delivered ke misaal 24 ghante baad chhupi. Warehouse aur hub ko sirf order number aur label.
  - **(b)** Support ko hamesha poori; baaki ko chhupi.
  - **(c)** Jisko kaam ho usko poori.
- **Salah:** **(a)**.
- **Trade-off:** (a) support ko ek click zyada, aur audit ka kaam; (b) support ki list se poora data; (c) sabse aasaan, sabse zyada leak.
- **Kanooni detail:** jaanchi nahi (R-004): staff ke paas personal data ki pahunch ke niyam.
- **R1 ya baad me:** R1.
- **Kis par tika:** group G-C (S-14 ke saath).

### S-14. Support "customer ki nazar se" dekh sake?

- **Sawal:** support staff customer ka account usi ki nazar se dekh sake (ya uske naam se kaam kare)?
- **Kyun zaroori:** customer ki shikayat samajhne ke liye ye aasaan lagta hai, par isse staff ke haq aur S-13 ki chhupi jaankari dono bypass ho jaate hain.
- **Vikalp:**
  - **(a)** Kabhi nahi; support ki apni screens (order, return aur refund ki haalat) jo customer jaisa dikhayein.
  - **(b)** Read-only "customer ki nazar" mode, wajah ke saath, audit me, aur customer ko khabar.
  - **(c)** Poora "customer ban ke" kaam karna.
- **Salah:** **(a)**.
- **Trade-off:** (a) support ki screens banane ka kaam; (b) read-only me bhi poora data; (c) sabse bada jokhim.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1 (Support Desk ka patla hissa).
- **Kis par tika:** group G-C (S-13 ke saath).

### S-15. Goodwill coupon ki seema kya ho?

- **Sawal:** support goodwill ka coupon (D-177) kitni rakam tak aur kitni baar de sake?
- **Kyun zaroori:** coupon paise jaisa hai; bina seema ke chori ka account ya mili-bhagat yahin nuksaan karti hai.
- **Vikalp:**
  - **(a)** Support Agent ek coupon misaal ₹200 tak, ek customer ko saal me 2 tak; Support Lead misaal ₹1,000 tak; usse upar Head of Operations; platform ka mahine ka kul budget (misaal ₹10,000).
  - **(b)** Koi seema nahi, sirf audit.
  - **(c)** Sirf Support Lead de.
- **Salah:** **(a)**.
- **Trade-off:** (a) seema aur budget ki settings ka kaam; (b) bada nuksaan ho sakta; (c) chhote goodwill pe bhi Lead.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R2.
- **Kis par tika:** group G-B (S-11 ki seema ke dhaanche pe).

### S-16. `+` alias se bane kai accounts ko per-customer seemaon me kaise ginein?

- **Sawal:** per-customer seemaayein (naye customer ka pehla order D-109, baar-baar return D-116, reviews D-156, referral D-176) ek insaan ke kai accounts se reset na hon, iske liye kya gina jaaye?
- **Kyun zaroori:** `+` alias normalise nahi hota (D-017; owner ke accounts isi pe hain). Isse ek insaan naye alias se naya account bana ke har per-customer seema dobara shuru kar sakta hai.
- **Vikalp:**
  - **(a)** Account alag hi rahe (D-017). Seemaon ke liye ek "jod" bhi gina jaaye: wahi address (normalise karke), wahi payment ka pehchaan chinh (gateway de to), aur wahi browser ki device cookie. Email ka bina `+` wala roop sirf signal. Jod pe apne aap rok sirf tay seemaon (jaise D-109) pe; baaki staff ki review queue me.
  - **(b)** Seemaon ki ginti ke liye email ka normalised roop (bina `+` ke, aur Gmail me bina dots) ek insaan; account phir bhi alag.
  - **(c)** Koi jod nahi; har account alag.
- **Salah:** **(a)**.
- **Trade-off:** (a) jod ka kaam, aur jod ka data bhi personal data; owner ke apne customer aliases ek hi address pe hon to unki "pehle order" wali seema saath lagegi (testing me dhyaan). (b) owner ke saare customer aliases ek insaan gine jayenge. (c) har per-customer seema bekaar.
- **Kanooni detail:** jaanchi nahi (R-004): device ki pehchaan aur accounts ka jod rakhne ke niyam.
- **R1 ya baad me:** R1 (D-109 wala jod); baaki R2.
- **Kis par tika:** group G-D (S-17 ke saath).

### S-17. Ek customer ke kitne khule delivery-pe-UPI orders ho sakte hain?

- **Sawal:** ek customer ke ek waqt me kitne aise orders khule ho sakte hain jinka payment delivery pe hai?
- **Kyun zaroori:** delivery pe UPI wale order me stock delivery tak ruka rehta hai (D-118 niyam 4). Bina payment kai orders se stock roka ja sakta hai (T-42). D-109 sirf rakam aur mana karne ki ginti dekhta hai.
- **Vikalp:**
  - **(a)** Ek customer (S-16 ke jod ke saath) ke ek waqt me misaal 2 khule orders, aur unki kul rakam D-109 ki seema tak.
  - **(b)** Ek waqt me 1 khula order.
  - **(c)** Koi alag seema nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) kabhi asli customer ka teesra order prepaid hi; (b) aur kada; (c) stock rokne ka raasta khula.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** group G-D (S-16 ka "customer" kaun hai, uspe).

### S-18. Bina sign-in forms pe bot ki rok kaise?

- **Sawal:** "Contact us" (D-161) aur grievance (D-163) jaise bina sign-in forms pe bots aur spam kaise rokein?
- **Kyun zaroori:** har form email kha sakta hai (D-142), aur form me koi bhi allowlist wala email likh sakta hai.
- **Vikalp:**
  - **(a)** CAPTCHA nahi: email pe code se pakka karna, chhupa honeypot field, IP aur email pe rate limit.
  - **(b)** Ek free CAPTCHA service, bahar ki script sirf un forms pe.
  - **(c)** Dono.
- **Salah:** **(a)** jab tak allowlist (D-133) hai; asli business pe dobara dekhna.
- **Trade-off:** (a) code ka email budget lagta hai; (b) bahar ki script aur visitors ka data bahar (D-157 ki soch se alag); (c) dono ka kaam.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R2 (grievance ka page R1 me sirf jaankari).
- **Kis par tika:** kisi pe nahi.

### S-19. Delivery ke saboot (photo aur location) kitne din rakhein, aur kaun dekhe?

- **Sawal:** delivery ke waqt li gayi photo aur partner ki location (D-072) kitne din rakhein, aur kaun dekh sake?
- **Kyun zaroori:** photo me ghar ka darwaza ya koi insaan aa sakta hai, aur location se customer ka ghar pata chalta hai. Saboot daawe (D-148), partner ke dispute (D-164, R2) aur chargeback (D-095, R2) ke liye bhi chahiye.
- **Vikalp:**
  - **(a)** Delivered se misaal 180 din, ya khula daawa, dispute ya chargeback band hone tak (jo baad me); dekhe: Support Agent aur Lead (daawe pe), apne hub ka Hub Manager; partner submit ke baad nahi; customer apni delivery ki photo dekh sake.
  - **(b)** 30 din (daawe ki seema ke baad).
  - **(c)** 1 saal.
- **Salah:** **(a)**; chargeback ki asli samay-seema gateway ke niyam se pakki karni hai (§11).
- **Trade-off:** (a) storage aur kaam; (b) baad ka chargeback ya dispute bina saboot; (c) zyada data zyada der.
- **Kanooni detail:** jaanchi nahi (R-004): photo aur location jaise personal data rakhne ka samay.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-20. Daawe, return pickup aur pack ki photos aur video kitne din?

- **Sawal:** customer ke daawe ki photos aur video (D-106), return pickup ki photo (D-113) aur warehouse pe pack ki photo kitne din rakhein?
- **Kyun zaroori:** inme ghar, chehra ya personal cheezein aa sakti hain; par baad ke jhagde aur seller ke dispute ke liye saboot chahiye.
- **Vikalp:**
  - **(a)** Maamla band hone ke misaal 180 din baad delete; video misaal 90 din; pack ki photo delivered ke misaal 90 din, ya daawa ho to uske saath. Dekhe: us maamle ka Support aur warehouse ka jaanch wala staff.
  - **(b)** Sab 90 din.
  - **(c)** Sab 1 saal.
- **Salah:** **(a)**.
- **Trade-off:** (a) alag samay ka kaam; (b) lamba jhagda bina saboot; (c) zyada storage aur zyada personal data.
- **Kanooni detail:** jaanchi nahi (R-004): customer ki photo aur video rakhne ke niyam.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-21. Seller aur Beauty Pro ke dastavez kitne din, aur kaun dekhe?

- **Sawal:** seller ka KYC (PAN, GSTIN ka certificate, brand authorisation), claims ke saboot (D-100) aur Beauty Pro ke dastavez (D-069) kitne din rakhein, aur kaun dekhe?
- **Kyun zaroori:** ye pehchaan ke dastavez hain; leak ho to pehchaan ki chori. Par jaanch, dobara jaanch aur jhagde ke liye chahiye.
- **Vikalp:**
  - **(a)** Reject hui application ke dastavez 30 din baad delete (sirf faisla aur wajah rahe); manzoor seller ke dastavez account chalne tak, aur band hone ke baad misaal 3 saal (kanooni jaanch ke baad number badle); claims ke saboot unki expiry ke baad misaal 1 saal; Pro ke dastavez darje ki muddat ke baad misaal 1 saal. Dekhe: sirf jaanch wali team (Seller Ops, catalog ki jaanch, Pro ki jaanch) aur Trust & Safety; seller apne.
  - **(b)** Sab hamesha.
  - **(c)** Jaanch ke baad turant delete; sirf nateeja, masked number aur file ka hash rahe.
- **Salah:** **(a)**.
- **Trade-off:** (a) samay ki settings aur delete job; (b) leak ka bada bhandaar; (c) jhagde ya dobara jaanch pe dastavez nahi.
- **Kanooni detail:** jaanchi nahi (R-004): KYC aur tax ke records kitne din rakhne zaroori.
- **R1 ya baad me:** R1 (seller); R2 (Pro).
- **Kis par tika:** kisi pe nahi.

### S-22. Sehat ke data ko kaun dekhe?

- **Sawal:** consultation notes (D-025), skin reaction ka case (D-130) aur allergy wali profile (D-165) kaun dekh sake?
- **Kyun zaroori:** ye sehat ke paas ka data hai: sabse gambhir privacy. D-025 kehta hai "sirf expert aur zaroori support roles", par kaunse, ye tay nahi.
- **Vikalp:**
  - **(a)** Notes: sirf wo Skin & Hair Expert jisne consult kiya ya jise maamla diya gaya; Support Lead sirf maamla khulne pe wajah ke saath (audit me); customer apne notes dekhe. Skin reaction case: Support Lead aur Skin & Hair Expert; brand ko sirf batch aur bina pehchaan ka saar (D-130 niyam 2). Allergy profile: sirf customer (D-165 niyam 5); staff tabhi jab customer khud support me bataye.
  - **(b)** Saare Experts aur saare Support roles.
  - **(c)** Sirf Expert; Support kabhi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) maamle ke hisaab se pahunch ka kaam; (b) bahut haathon me sehat ka data; (c) customer ki shikayat pe Support kuch dekh nahi sakta.
- **Kanooni detail:** jaanchi nahi (R-004): sehat ke data ki consent aur pahunch ke niyam.
- **R1 ya baad me:** R2.
- **Kis par tika:** group G-E (S-23 ke saath).

### S-23. Sehat ka data kitne din rakhein?

- **Sawal:** consultation notes, skin reaction ke case aur allergy profile kitne din rakhein?
- **Kyun zaroori:** jitna lamba, utna bada jokhim; par batch ki dikkat aur recall (D-129) ka itihaas bhi zaroori.
- **Vikalp:**
  - **(a)** Notes aakhri consult ke misaal 2 saal baad delete; skin reaction case band hone ke misaal 3 saal baad (batch aur recall ka itihaas); allergy profile jab tak customer na mitaye, aur account delete pe turant.
  - **(b)** Sab 1 saal.
  - **(c)** Sab account delete tak.
- **Salah:** **(a)**.
- **Trade-off:** (a) alag samay; (b) batch ka itihaas kho sakta; (c) bina zaroorat lamba.
- **Kanooni detail:** jaanchi nahi (R-004): cosmetics ke side-effect ke records aur sehat ke data rakhne ka samay.
- **R1 ya baad me:** R2.
- **Kis par tika:** group G-E (S-22 ke saath).

### S-24. Audit log aur band account ke records kitne din?

- **Sawal:** audit log, sign-in aur security events, aur delete hue account ke bina pehchaan records kitne din rakhein?
- **Kyun zaroori:** audit hi batata hai kisne kya kiya; jaldi mita to jaanch nahi ho sakti. Par audit cluster me bhi 0.5 GB hi hai (R-006), aur IP aur browser bhi personal data hain. D-151 ne records ka samay yahan bheja.
- **Vikalp:**
  - **(a)** Audit log misaal 2 saal (paise ke kaam ka audit kanooni jaanch ke baad lamba ho sakta); sign-in aur security events misaal 1 saal; delete hue account ke bina pehchaan records (invoice, ledger) kanooni samay tak; backups me purana data backup ki umar tak (S-26).
  - **(b)** Audit aur sign-in events sab 400 din.
  - **(c)** Audit hamesha.
- **Salah:** **(a)**.
- **Trade-off:** (a) do alag samay; (b) saal bhar baad ki jaanch me kami; (c) jagah aur personal data badhta rehta.
- **Kanooni detail:** jaanchi nahi (R-004): logs rakhne ka samay (CERT-In ke niyam), aur tax records ka samay.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-25. Push aur email me kitni detail ho?

- **Sawal:** browser push aur emails me order ki kitni jaankari likhi jaaye?
- **Kyun zaroori:** push lock screen pe koi bhi dekh sakta hai; beauty aur personal care ke kuch products niji hote hain; aur delivery code (D-072) saboot hai, wo kahin aur leak na ho.
- **Vikalp:**
  - **(a)** Push me sirf order number aur haalat ("Order 1234: out for delivery"); product ka naam, rakam, address aur code kabhi nahi. Email me order ki detail (D-126), par poora address sirf invoice me.
  - **(b)** Push me product ka naam bhi.
  - **(c)** Push aur email me sab detail.
- **Salah:** **(a)**.
- **Trade-off:** (a) customer ko detail ke liye app kholna padta hai; (b) lock screen pe niji product; (c) sabse zyada leak.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-26. Backup files encrypted hon?

- **Sawal:** backup command (D-013) ki files laptop pe encrypted rahein?
- **Kyun zaroori:** backup me saara data hai (customers, sellers, paisa). D-013 ke 4 pehre git se bachate hain, par laptop chori, malware ya cloud sync se nahi.
- **Vikalp:**
  - **(a)** Backup command output ko ek key se encrypt kare (key password manager me, repo me nahi); restore command key maange; laptop pe misaal sirf aakhri 3 backups, purane apne aap delete.
  - **(b)** Bina encryption; sirf laptop ka disk encryption aur D-013 ke 4 pehre.
  - **(c)** (a) + ek encrypted copy alag device pe (jaise pen drive).
- **Salah:** **(a)**; (c) agar owner chahe (laptop kharab ho to backup bhi gaya).
- **Trade-off:** key kho gayi to backup bekaar; (b) laptop pe khula data.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-27. Secrets kab badlein?

- **Sawal:** secrets (DB passwords, gateway keys, Vercel se backend ka secret, email key, OAuth secrets, encryption keys) kab badle jaayein?
- **Kyun zaroori:** purana secret leak hua ho to badalna hi ilaaj hai; par ek insaan ke liye ~20 secrets (11 Vercel projects samet) baar-baar badalna galti ka mauka bhi hai.
- **Vikalp:**
  - **(a)** Shak ya incident pe turant (tay kram se); baaki saal me ek baar sab; token signing keys apne aap (misaal 30 din); asli business pe kisi ke jaane pe turant.
  - **(b)** Har 90 din sab.
  - **(c)** Sirf incident pe.
- **Salah:** **(a)**.
- **Trade-off:** (a) saal bhar purana secret; (b) bahut kaam aur galti ka mauka; (c) chupchaap leak kabhi theek nahi hota.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### S-28. Data leak pe users ko khabar kaise?

- **Sawal:** personal data ka leak pakka ho to users ko kab aur kaise bataya jaaye?
- **Kyun zaroori:** demo hai, par asli personal data (owner aur testers ka) hai, aur design asli business jaisa (D-026).
- **Vikalp:**
  - **(a)** Leak pakka hone pe asar wale users ko email (security line) aur in-app, misaal 72 ghante ke andar: kya hua, kaunsa data, unhe kya karna hai; site pe patti; aur jo kanooni report kanooni jaanch bataye.
  - **(b)** Sirf gambhir leak (password, paisa, dastavez) pe.
  - **(c)** Koi khabar nahi (demo).
- **Salah:** **(a)**.
- **Trade-off:** (a) emails ki chhat (D-142) me jagah; (b) chhota leak chhup jaata; (c) asli business ke liye galat aadat.
- **Kanooni detail:** jaanchi nahi (R-004): data leak pe users aur sarkari sanstha ko suchna ka samay aur tareeka.
- **R1 ya baad me:** R1 (runbook).
- **Kis par tika:** kisi pe nahi.

### S-29. Seller ka bank badle to naye khaate pe payout kab?

- **Sawal:** seller apna bank ya payout ka khaata badle to naye khaate pe payout turant ho, ya kuch rok ke baad?
- **Kyun zaroori:** sellers ka paisa platform ke paas rehta hai (D-093). Seller ka account chori karke bank badalna aur agla payout apne khaate me, sabse seedha nuksaan hai (T-72).
- **Vikalp:**
  - **(a)** Bank badalne pe step-up, purane email aur in-app pe khabar, aur naye khaate pe misaal 72 ghante tak payout nahi; us dauraan Account Owner "ye maine nahi kiya" daba ke rok sake.
  - **(b)** Naye khaate pe pehla payout staff (Seller Ops) ki jaanch ke baad.
  - **(c)** Koi rok nahi, sirf khabar.
- **Salah:** **(a)**; asli business pe (b) bhi.
- **Trade-off:** (a) bank badalne ke baad payout 3 din der se; (b) staff ka kaam; (c) chori ka seedha raasta.
- **Kanooni detail:** nahi.
- **R1 ya baad me:** R1 (design; R1 me payout haath se "paid").
- **Kis par tika:** kisi pe nahi.

### 5.30 Kaunse sawal ek saath, kaunse group me

- **Kisi khule sawal pe tike nahi (19):** S-1, S-2, S-3, S-4, S-6, S-7, S-9, S-10, S-12, S-18, S-19, S-20, S-21, S-24, S-25, S-26, S-27, S-28, S-29. Inme R1 ke 18 (S-18 R2).
- **Aapas me jude groups (5 groups, 10 sawal):**
  - **G-A:** S-5 (doosra factor) + S-8 (authenticator kho jaye): recovery ka raasta factor pe tika. R1.
  - **G-B:** S-11 (support ke paise ki seema) + S-15 (goodwill coupon, R2): goodwill usi seema ke dhaanche pe.
  - **G-C:** S-13 (staff ko kitni jaankari) + S-14 ("customer ki nazar se"): (b) ya (c) chuna to S-13 ki chhupi jaankari bypass. R1.
  - **G-D:** S-16 (kai accounts ka jod) + S-17 (khule delivery-pe-UPI orders): "ek customer" ki pehchaan S-16 se. R1.
  - **G-E:** S-22 (sehat ke data ki pahunch) + S-23 (kitne din). R2.
- **Salah ka kram:** pehli batch me saare R1 wale bina dependency ke 18 sawal + G-A, G-C, G-D, aur G-B (S-15 ka design abhi, banana R2). Doosri batch me R2 wale: S-18 aur G-E.
- **Ginti:** kul 29 sawal; R1 ke 25, R2 ke 4 (S-15, S-18, S-22, S-23).

## 6. Proposed risks (RISKS.md ke liye, tag `Security`)

| Id    | Risk                                                                                                                                                 | L   | I   | Kam karne ka tareeka                                                                       | Owner ki manzoori chahiye?                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| PR-1  | Domain nahi (D-028): milte-julte `*.vercel.app` naam se nakli sign-in page, aur hamare naam se nakli emails; staff aur customer pehchaan nahi paate. | M   | H   | P-SR-10, P-SR-11; passkey (S-5, R2); emails me "hum kabhi password ya code nahi maangte"   | Haan: R-005 sirf spam ki baat karta hai, phishing ka hissa naya |
| PR-2  | Bundle mode (D-049, D-056) me process ki deewar nahi: ek module ki kamzori (jaise image parser) se saari services ke secrets aur data.               | L   | H   | P-SR-70, P-SR-60, P-SR-81; parsers kam                                                     | Haan                                                            |
| PR-3  | Free tier pe database ka network sab ke liye khula ho sakta hai (§11 items 4 se 6): suraksha sirf password aur TLS pe.                               | L   | H   | P-SR-67, P-SR-78; lambe random passwords, kam haq wale DB users                            | Haan (jaanch ke baad)                                           |
| PR-4  | Owner ka laptop aur provider accounts ek jagah: ek kabza = code, deploy, data aur backups sab.                                                       | L   | H   | P-SR-80, P-SR-82; S-26; production dashboards ke liye alag browser profile                 | Haan                                                            |
| PR-5  | Uploads ki malware jaanch nahi (₹0, 512 MB me antivirus nahi).                                                                                       | M   | M   | P-SR-60 (types, dobara encode), P-SR-61 (PDF attachment ke roop me, app ke origin se nahi) | Haan                                                            |
| PR-6  | Koi alag WAF ya DDoS ki suraksha nahi; ek process gire to sab band (R-002, R-007 se juda).                                                           | M   | M   | P-SR-06, P-SR-07, P-SR-08; providers ki apni suraksha                                      | Haan                                                            |
| PR-7  | Logs aur alerts free tier pe seemit (§11 item 8): hamla der se pakda jaaye.                                                                          | M   | M   | P-SR-75, P-SR-77; UptimeRobot (D-028) ke apne alert emails                                 | Haan                                                            |
| PR-8  | Security ki jaanch sirf owner aur Claude; bahar ki koi jaanch (pentest) nahi.                                                                        | M   | M   | QA ke security tests (§9), doosra security run; asli business se pehle bahar ki jaanch     | Haan                                                            |
| PR-9  | Customer ka account utna hi surakshit jitna uska email inbox (email code, D-021).                                                                    | M   | M   | P-SR-14, P-SR-15; optional authenticator                                                   | Haan (faisla tay; jokhim likhna)                                |
| PR-10 | `+` alias (D-017) se kai accounts: per-customer seemaayein reset.                                                                                    | H   | M   | S-16, P-SR-56                                                                              | S-16 ke jawab ke baad                                           |
| PR-11 | Delivery partner ke phone pe offline customer data; phone kho jaaye.                                                                                 | M   | M   | P-SR-22, P-SR-09; S-4                                                                      | Nahi (bachav ke saath Khula)                                    |
| PR-12 | Supply chain (npm packages, GitHub Actions).                                                                                                         | M   | H   | P-SR-81                                                                                    | Nahi (bachav ke saath Khula)                                    |
| PR-13 | Payment page pe gateway ki bahar ki script; uski suraksha hamare haath me nahi.                                                                      | L   | H   | P-SR-05                                                                                    | Haan                                                            |
| PR-14 | Public repo: design aur code sabke saamne, aur galti se secret commit ka jokhim.                                                                     | M   | H   | P-SR-78, P-SR-79                                                                           | Nahi (bachav ke saath Khula)                                    |

**Maujooda risk me jod:** R-010 (Key Value ka data restart pe gayab) ka security asar bhi likha jaaye: sessions ke band hone ke nishaan aur rate limits ki ginti. Bachav P-SR-28 (sach database me). R-004 me data ka desh (Singapore, D-058) aur logs ke niyam kanooni jaanch ki list me (§9).

## 7. Logging, audit aur incident response

### 7.1 Kya log karein, kya kabhi nahi

- **Har request (app logs):** request id, route, status, samay, actor ka account id (email nahi), app, client IP (P-SR-02 ka helper), browser ka chhota roop, error code.
- **Security events (audit me bhi):** sign-in safal aur fail (staff ke sab; customer ke sirf fail aur naye device), rok lagna, code maangna aur galat code, refresh reuse, authenticator lagana, hatana aur reset, recovery code ka istemaal, grants aur roles ka badlav, allowlist badalna, kill switch, webhook signature fail, export, "poori jaankari dekhi" (P-SR-38), mana hue kaam (403).
- **Kabhi log nahi:** passwords, koi bhi code (sign-in, delivery), tokens, cookies, `Authorization` header, recovery codes, sealed values, poora email (sirf aadha), phone, address, PAN, bank, dastavez ki cheez, sehat ka data, push subscription ki keys, webhook ki raw body (wo inbox table me, logs me nahi), koi bhi secret.

### 7.2 Audit trail

- **Kya audit me:** staff ka har likhne wala kaam, paise ke kaam, settings aur imports, exports, personal data dekhna, security events (§7.1), seller ke daam ke badlav (D-061 niyam 2) aur listing versions (D-098 niyam 4).
- **Kaise:** audit service (D-011) ka apna cluster; append-only; DB role ko update aur delete ka haq nahi; roz ki hash chain aur verify job; job ka register hona khud test se pakka (schedule chalta hai ya nahi). Finance ke paise ka sach ledger me (P-SR-59); audit uske upar ka record.
- **Insaan aur account:** owner ke ~80 accounts ek "insaan" se jude dikhein (D-047 ki wajah: audit me owner aur operator alag), taaki ek account ki galti doosre ke review me aaye.

### 7.3 Alerts (free tier pe)

- **In-app + push:** Master app me "security inbox"; P-SR-77 ke events; owner ke phone pe push (Master app bhi install ho sakti hai, D-042).
- **Email:** sirf gambhir (misaal din me 5 tak), OTP ke baad wali line me (D-142), taaki OTP ki jagah na khaaye.
- **Bahar:** UptimeRobot (D-028) ke down hone ke alerts (unke apne emails, hamari 300 ki ginti me nahi).
- **Roz ka kaam:** GitHub Actions ka schedule pehle se server jagata hai (D-028); usi ke saath roz ka audit verify aur security ka saar. Finance (Neon) ka audit verify hafte me ek (R-014).

### 7.4 Incident response: ek insaan, free tier

| Kadam              | Kya karna                                                                                                                                                                                                                                                        | Kitni der me (misaal)   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 0. Tayyari         | Runbook operations ki file me; secrets ki list aur badalne ke steps (§7.5); kill switches (P-SR-08); recovery codes offline; restore ka abhyaas; providers ke support pages ki list.                                                                             | Pehle se                |
| 1. Pehchaan        | Alert ya ajeeb cheez. Gambhirta: **S1** (paisa, dastavez, staff ya provider account), **S2** (customer account ya personal data), **S3** (bug, data nahi gaya).                                                                                                  | -                       |
| 2. Rokna           | Sahi kill switch (sign-up, checkout, uploads, payouts); zaroorat ho to "sab sessions band"; provider accounts ke password aur MFA dekhna; GitHub, Vercel, Render ke tokens band; shak wale secrets §7.5 ke kram se. Phone se bhi ho sake (Master app + step-up). | S1: 1 ghanta; S2: 1 din |
| 3. Jaanch          | Audit log; Render logs ki copy turant (wo jaldi mitte hain, §11); Atlas aur Neon ke access logs agar milein; git ka itihaas.                                                                                                                                     | -                       |
| 4. Theek aur wapsi | Fix normal flow se (chhota fix `prerelease` pe CLAUDE.md ke niyam se); data badla gaya ho to backup se restore (pehle local pe jaanch); phir switches khole.                                                                                                     | -                       |
| 5. Khabar          | S-28 ke hisaab se users ko; kanooni report jo kanooni jaanch bataye (Kanooni detail jaanchi nahi (R-004)); payment keys gayi hon to gateway ko.                                                                                                                  | S-28                    |
| 6. Seekh           | LESSONS me ek line, naya test, aur threat model me badlav.                                                                                                                                                                                                       | 1 hafta                 |

### 7.5 Secrets ki list aur badalne ka kram

| Kram | Secret                                                                                                   | Kahan                                  | Badalne ka asar                                                      |
| ---- | -------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| 1    | Provider accounts ke password aur MFA (GitHub, Vercel, Render, Atlas, Neon, Razorpay, email, OAuth apps) | Providers ke dashboards                | Koi downtime nahi                                                    |
| 2    | Har service ka DB user (Atlas ke clusters, Neon)                                                         | Atlas, Neon aur Render env             | Service restart                                                      |
| 3    | Vercel se backend ka secret header                                                                       | 11 Vercel projects aur Render env      | Do values ke saath bina downtime (P-SR-01)                           |
| 4    | Payment gateway ki key aur webhook secret                                                                | Gateway dashboard aur Render env       | Webhook secret badalte hi purani signature fail; dono ek saath       |
| 5    | Token signing keys                                                                                       | Database (encrypted), apne aap badalti | Hath se badla to access tokens jaldi khatam; users ko dobara refresh |
| 6    | Field encryption keys                                                                                    | Render env, key id ke saath            | Naye writes nayi key se; purane data ka dobara encrypt job           |
| 7    | Email API key, OAuth client secrets, push (VAPID) keys                                                   | Providers aur Render env               | VAPID badla to saari push subscriptions dobara banengi               |
| 8    | Backup ki key (S-26)                                                                                     | Password manager                       | Sirf naye backups pe                                                 |

### 7.6 Backup aur restore ki suraksha

- Backup encrypted (S-26), key alag; kabhi CI artifact, repo ya cloud sync folder me nahi (P-SR-82).
- Sealed fields backup me bhi sealed; encryption keys backup me nahi.
- Restore pehle local ya alag test database me, jaanch ke baad hi production me; har restore audit me.
- **Delete ka record:** account delete (D-151) ke baad purane backup se restore kiya to delete hua data wapas aa jaata hai. Isliye delete hue accounts ke ids ki ek chhoti list (bina personal data) rakho, aur restore ke baad wo deletes dobara chalao.
- Backups me purana data backup ki umar tak rehta hai: ye privacy page me likha jaaye (Kanooni detail jaanchi nahi (R-004)).

## 8. Pehle ke kaam se lene layak (D-074 niyam 2)

Kasauti ke teen hisse: **Z** = asli zaroorat hal karta hai; **T** = kisi faisle se takrav nahi; **N** = naye doc me naye vakya me likha ja sakta hai. Teeno "haan" ho tabhi lene layak.

| #   | Kya                                                                                                                                           | Kahan (pehle ka path)                                                                      | Kyun achha                                     | Kasauti                                                            | Naye docs me kahan    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------ | --------------------- |
| 1   | Vercel se backend ka secret header, constant-time milaan, badalte waqt do values                                                              | `backend-old/gateway/src/trust.ts`; `docs-old/ARCHITECTURE.md` §7.2 (Origin secret)        | Backend ke seedhe URL ka bachav                | Z haan; T nahi (D-052 ke saath); N haan                            | P-SR-01; ARCHITECTURE |
| 2   | Client IP sirf secret ke saath Vercel ke headers se, ek helper                                                                                | `backend-old/gateway/src/trust.ts`; `docs-old/QA_AUDIT_REPORT.md` §7a LIVE-007             | Rate limits aur audit sahi IP pe               | Z, T, N haan                                                       | P-SR-02; LESSONS      |
| 3   | Session ka model: chhota access token, refresh family aur reuse ki pehchaan, `__Host-` cookies, refresh ka path, browser storage me user nahi | `backend-old/identity/src/sessions.ts`, `cookies.ts`; `docs-old/ARCHITECTURE.md` §7.2      | Chori ka asar seemit                           | Z, T, N haan                                                       | P-SR-26, P-SR-27      |
| 4   | Revocation database me, Redis mitne pe bhi                                                                                                    | `docs-old/QA_AUDIT_REPORT.md` §4 QA-GW-002                                                 | R-010 ke saath zaroori                         | Z, T, N haan                                                       | P-SR-28               |
| 5   | Authorization ke pure functions; scope ke bahar 404, haq na ho to 403; default deny 401                                                       | `packages-old/shared/authz/src/`; `docs-old/discovery/REPOSITORY_ANALYSIS.md` §5 (#4, #13) | Jaanchne layak access control                  | Z, T, N haan                                                       | P-SR-31               |
| 6   | Kaam ke bantwara ke checks (appeal, maker-checker, Master ke paas "decide" nahi, apne brand ki listing nahi)                                  | `packages-old/shared/authz/src/separation.ts`; `docs-old/ARCHITECTURE.md` §7.3             | D-047, D-084, D-147 code me                    | Z, T, N haan                                                       | P-SR-36, P-SR-37      |
| 7   | Koi role khud ko appoint nahi; reviewer ki list me customers nahi                                                                             | `docs-old/QA_AUDIT_REPORT.md` §9 (Q-007, DR-008); `docs-old/ARCHITECTURE.md` §7.3          | Roles se upar chadhne ka raasta band; kam data | Z, T, N haan                                                       | P-SR-36, P-SR-38      |
| 8   | Hash-chained audit, roz ki jaanch, mana hue kaam bhi                                                                                          | `backend-old/core/src/modules/audit/store.ts`, `verify.ts`                                 | Repudiation ka bachav                          | Z, T, N haan                                                       | P-SR-75; §7.2         |
| 9   | Idempotency (key + route + caller; alag body 422, chalte hue 409)                                                                             | `docs-old/discovery/REPOSITORY_ANALYSIS.md` §5 (#7)                                        | Do order, do payment se bachav                 | Z, T, N haan                                                       | P-SR-44               |
| 10  | Outbox aur inbox dedupe                                                                                                                       | `docs-old/discovery/REPOSITORY_ANALYSIS.md` §5 (#3)                                        | Webhooks aur events ka ek hi asar              | Z, T, N haan                                                       | P-SR-48, P-SR-70      |
| 11  | Auth aur codes pe rate limit fail-closed; Redis atke to turant 503                                                                            | `backend-old/gateway/src/rate-limits.ts`; `docs-old/QA_AUDIT_REPORT.md` §4 QA-GW-001       | DoS ke waqt bhi auth surakshit                 | Z, T, N haan                                                       | P-SR-07               |
| 12  | Code emails ka budget: sab IPs ka ghante ka, aur sign-up codes ka din ka; saaf sandesh                                                        | `backend-old/identity/src/code-budget.ts`; `docs-old/QA_AUDIT_REPORT.md` §5 DR-009         | 300 emails ki rakhwali                         | Z haan; T nahi (D-142 ki lines ke andar rakhna); N haan            | P-SR-19; S-10         |
| 13  | Enumeration se bachav: ek jaisa jawab aur kam se kam samay                                                                                    | `docs-old/ARCHITECTURE.md` §7.1 (OTP email ka raasta)                                      | Accounts ka pata nahi chalta                   | Z haan; T nahi (D-133 ka sandesh alag); N haan                     | P-SR-18               |
| 14  | Password ke niyam: 12 se 128, argon2id, leak ki jaanch (na mile to agle sign-in pe dobara); hash ki ginti ki seema                            | `docs-old/ARCHITECTURE.md` §7.1; `docs-old/QA_AUDIT_REPORT.md` §9 DR-002, DR-004           | Stuffing aur 512 MB dono                       | Z, T, N haan                                                       | P-SR-12, P-SR-06      |
| 15  | Rok IP aur account mila ke                                                                                                                    | `docs-old/ARCHITECTURE.md` §7.1; `docs-old/QA_AUDIT_REPORT.md` §9 DR-003                   | Rok hathiyar nahi banti                        | Z haan; T nahi; N haan (owner ka sawal)                            | S-3 vikalp (a)        |
| 16  | Codes outbox me encrypted aur bhejne ke baad hate; logs me kabhi nahi; emails me HTML escape                                                  | `docs-old/ARCHITECTURE.md` §7.1; `docs-old/QA_AUDIT_REPORT.md` §5 (M7)                     | Code ka leak nahi                              | Z, T, N haan                                                       | P-SR-72, P-SR-76      |
| 17  | OAuth: `state` aur browser binding, PKCE S256, sirf verified email se jodna, `next` ki jaanch                                                 | `backend-old/identity/src/oauth.ts`; `docs-old/QA_AUDIT_REPORT.md` §5 (M4), §4 QA-FE-001   | Social se takeover nahi                        | Z haan; T nahi (allowlist ki shart jodni); N haan                  | P-SR-16, P-SR-20      |
| 18  | Field encryption AES-256-GCM, context associated data me, key id, blind index, masked copy                                                    | `packages-old/backend/server-crypto/src/fields.ts`; `docs-old/ARCHITECTURE.md` §6.5        | DB leak pe bhi PAN, bank band                  | Z, T, N haan                                                       | P-SR-62               |
| 19  | Tokens ES256, app ka `aud`, keys 30 din me badlein, keys na milein to 503                                                                     | `docs-old/ARCHITECTURE.md` §7.2; `docs-old/QA_AUDIT_REPORT.md` §4 QA-KRN-001               | Token ka jaal aur jhootha sign-out nahi        | Z, T, N haan                                                       | P-SR-30               |
| 20  | Vercel CDN ke cache ke niyam (personal pe `private, no-store`; public pe `Set-Cookie` nahi)                                                   | `docs-old/ARCHITECTURE.md` §7.2 (Cache)                                                    | Personal data cache se leak nahi               | Z haan; T nahi; N haan (Vercel ka vyavhaar §11 me dobara jaanchna) | P-SR-03               |
| 21  | Sign-out sirf server ki haan pe                                                                                                               | `docs-old/QA_AUDIT_REPORT.md` §4 QA-FE-004                                                 | Jhootha "signed out" nahi                      | Z, T, N haan                                                       | P-SR-27 ka test       |
| 22  | Security headers aur CSP (theme script ka hash)                                                                                               | `docs-old/QA_AUDIT_REPORT.md` §9 Q-011                                                     | Clickjacking aur XSS ka asar kam               | Z, T, N haan                                                       | P-SR-04               |
| 23  | Service worker me `/api` ka denylist                                                                                                          | `docs-old/QA_AUDIT_REPORT.md` §9 Q-013                                                     | API ka jawab `index.html` nahi                 | Z, T, N haan                                                       | P-SR-09               |
| 24  | CI: branch ke naam pe bharosa nahi; actions SHA pe                                                                                            | `docs-old/QA_AUDIT_REPORT.md` §4 QA-CI-001, §9 Q-015                                       | Supply chain aur fork PR                       | Z haan; T nahi (CLAUDE.md ka git flow); N haan                     | P-SR-81; RULES        |
| 25  | Storage port aur file registry (key me public ya private, lifecycle, ek file ek owner, order hue product ka archive)                          | `docs-old/ARCHITECTURE.md` §6.7; `packages-old/backend/server-storage/src/`                | Private media aur safai                        | Z haan; T nahi (provider tay nahi, sirf dhaancha); N haan          | P-SR-61; Architect    |
| 26  | Backups encrypted, CI artifact me kabhi nahi                                                                                                  | `docs-old/ARCHITECTURE.md` §6.5 (Backups)                                                  | Backup ka leak nahi                            | Z haan; T nahi (D-013 ke folder ke saath); N haan                  | P-SR-82; S-26         |
| 27  | Account delete pe records me pehchaan hatana, services me event                                                                               | `docs-old/ARCHITECTURE.md` §6.5 (DPDP erasure)                                             | D-151 ka kaam                                  | Z, T, N haan                                                       | P-SR-65               |
| 28  | Authenticator band karna aur naye recovery codes ka step-up har baar alag                                                                     | `docs-old/ARCHITECTURE.md` §7.1 (Master row); `docs-old/QA_AUDIT_REPORT.md` §9 DR-010      | Step-up ki khidki ka galat istemaal nahi       | Z, T, N haan                                                       | P-SR-25; S-7          |
| 29  | Tests me fake adapters (email, storage, OAuth): asli keys ke bina                                                                             | `docs-old/discovery/REPOSITORY_ANALYSIS.md` §5 (#9)                                        | Tests me secrets nahi                          | Z, T, N haan                                                       | RULES (testing)       |

**Purane audit ke sabak (LESSONS ke liye, naye vakya me):**

- Refresh reuse ki pehchaan ka daayra chhota ho to copy wala token chupchaap chalta rehta hai (QA-ID-001); aur mobile pe khoya jawab "chori" dikh sakta hai (LIVE-009). Dono ke test chahiye.
- Proxy ke peeche har user ka IP ek dikh sakta hai (LIVE-007): rate limits sab pe ek.
- Redis mitne pe band sessions laut aate hain agar sach sirf Redis me ho (QA-GW-002).
- Naye event types purana instance chupchaap "bhej diya" maan leta hai, aur ek schedule kabhi register hi nahi hua (LIVE-006): har event type aur har schedule ka test.
- App "signed out" dikhaye par server ka session zinda (QA-FE-004).
- `next` ke dot-segments se protocol-relative redirect (QA-FE-001).
- Secret badalte waqt kuch requests 403 (Q-006): do values ka niyam zaroori.
- Sign-in ka tareeka hataana bina step-up (DR-006): security ke badlav pe dobara pehchaan.
- `/ready` jaisa khula endpoint har call pe sab services aur Redis bulaye (DR-001): DoS ka guna.

**Na lein (faislon se takrav):**

- Email code ko sign-in se hataana: D-021 ne teen raaste tay kiye.
- Delivery ka code har koshish pe naya: D-126 me code confirmation email me jaata hai.
- "250 emails ke baad sirf OTP aur transactional": D-142 ki lines aur chhat ne jagah li.
- Email aur media ke providers ke naam ko tay maanna: naye docs me provider tay nahi.
- Ek security role jo kisi ka bhi authenticator reset kare (Master ka bhi): S-8 ka vikalp (b), salah nahi.
- Pehle ke roles ka seed: D-059.
- Detail batane wala public status endpoint: P-SR-06 (sirf "ok").
- Audit ka 400 din tay maanna: S-24 owner ka.
- Delivery partner ke phone ki bandish apne aap: S-4 me owner ka vikalp.

## 9. Aage ke agents ke liye

- **Kanooni jaanch (R-004):** sab "jaanchi nahi": data leak pe users aur sarkari sanstha ko suchna ka samay (S-28); CERT-In ke incident report aur logs rakhne ka samay (S-24); sehat, paise aur chehre ki photo jaise sensitive data ki consent (S-22, S-23, D-155); GST aur tax records, aur seller KYC kitne saal (S-21, S-24); Aadhaar number lene pe rok (P-SR-63); payment data India me rakhne ke niyam aur Singapore hosting (D-058); device ki pehchaan aur accounts ka jod (S-16); gig partners ki location aur photo (S-19); invoice ki copy pe customer ka naam aur address (D-143); refund ka samay (D-111); points aur gift cards (D-173, D-179); marketing aur cookies ki consent (D-141, D-157).
- **Principal Software Architect:** gateway pe secret header aur route manifest (P-SR-01, P-SR-31); identity ka model (ek email ek user, grants ke saath?) aur owner ke accounts ka "insaan" se jod (§7.2); bundle mode me service ki deewar (P-SR-70); media ki jagah: private signed URLs, EXIF hatana, free tier (P-SR-60, P-SR-61); email provider chunte waqt OTP ki copy dashboard me, link tracking aur key ke haq (§11); push ke hosts (P-SR-71); kill switches aur settings ka dhaancha (P-SR-08, P-SR-42); Delivery PWA ka offline data (P-SR-22); customer app ke server-side hisse me public cache aur cookies ka farak (D-058 ka asar).
- **Database Architect:** har service ka DB user aur finance me app aur migration ke alag roles (P-SR-67); ledger pe UPDATE aur DELETE ka haq nahi (P-SR-59); idempotency aur webhook inbox ke unique indexes (P-SR-44, P-SR-48); sealed fields aur blind index (P-SR-62); har collection me owner ya `sellerId` aur scope ke indexes (P-SR-32, P-SR-33); retention ke liye TTL sirf un records pe jo kanooni records nahi (S-19 se S-24); delete ka record restore ke liye (§7.6); audit cluster ki 0.5 GB me jagah (S-24).
- **DevOps / SRE:** secrets ki list aur badalne ki runbook (§7.5, S-27); providers pe MFA aur branch protection (P-SR-80); actions SHA pe, secret scanning (P-SR-79, P-SR-81); backup ka encryption aur restore ka abhyaas (S-26); UptimeRobot alerts; Render logs ki umar aur unki copy (§11); DB network allowlist (§11); laptop: disk encryption, Desktop ka cloud sync (§11), production dashboards ke liye alag browser profile.
- **UX:** step-up ka dialog; "demo store" sandesh; "My devices"; personal data dikhane ka "wajah chuno" kadam; delivery code ki rok ka sandesh; uploads pe "address label aur chehra mat dikhao"; emails me "ye code kisi ko mat batao" aur "hum kabhi password nahi maangte"; app ka tay URL dikhana; consent ki screens (D-150, D-165); push ka saada text (S-25); sign-out sirf server ki haan pe.
- **QA:** route aur actor ka matrix; har resource ka BOLA test; sellers ke beech ke tests; user content me XSS ki list; ek saath chalne ke tests (stock, idempotency, webhooks, redemption); webhook replay; Redis band karke rate limits aur revocation; CSV formula; uploads (SVG, polyglot, EXIF); signed URL ki umar; cookie flags aur CSP har route; service worker; delivery code ki rok; allowlist har raaste; enumeration ka samay; refresh reuse (mobile ka khoya jawab samet). Mutation tests sirf permissions aur paise ki lines me (CLAUDE.md): authorization ke pure functions, kaam ka bantwara, paise ki ginti.
- **Doosra security run:** Architect ke service boundaries aur media aur email provider ki jaanch; DB schema me scope filters aur sealed fields; DevOps ke secrets aur CI; UX ke step-up aur masking; QA plan me har P-SR ka test; passkey (S-5) aur DB network (PR-3) dobara; staff apps pe desh ya device ki rok ka vichar (abhi prastaav nahi); Growth Studio aur Creator (R2) ke haq; points aur gift cards (R2) ka ledger; Beauty Advisor ke message thread me links aur attachments.

## 10. Tay faislon pe dhyaan

Ye faisle dobara khole nahi ja rahe; sirf jokhim aur faisle ke andar ka bachav.

1. **D-017 (`+` alias normalise nahi):** ek insaan ke kai accounts se per-customer seemaayein reset (D-109, D-116, D-156, D-176). Bachav: account alag hi rahein, seemaon ke liye address, payment aur device ka jod (S-16, P-SR-56). Owner ke accounts ke liye koi "test account" chhoot nahi (wo khud bypass ka raasta ban jaati).
2. **D-011, D-049, D-056 (alag services, par ek process):** process ki deewar nahi (PR-2). Bachav: lint aur dependency rules se service ki deewar, andar ki calls bhi authorize, config namespace, parsers kam (P-SR-70); design aisa ki split mode me bina rewrite ke andar ki calls signed ho jaayein (D-011 note).
3. **D-010 aur D-048 (11 apps, alag hosts):** 11 Vercel projects me secret header aur headers ki config; ek galat config = ek app ka API khula ya band. Bachav: har app ki config ek template se aur uska test (P-SR-01, P-SR-04); passkey aaye to har host ki alag (S-5). Kai apps me sign-in ka bojh S-9.
4. **D-017 (~80 accounts, authenticator):** owner pe bojh; authenticator ke secrets aur passwords ek hi password manager me ho to do factor ek jaisa. Bachav: S-5, S-8; password manager ka apna mazboot MFA; recovery codes offline.
5. **D-021 (email code se sign-in):** account = inbox (PR-9); code ka phishing. Bachav: P-SR-14 (authenticator laga ho to code ke baad bhi; ye D-021 ka "security review me pakka" hissa), email me "kisi ko mat batao", P-SR-15.
6. **D-028 (domain nahi):** nakli sign-in pages aur nakli emails (PR-1). Bachav: P-SR-11 (staff emails me link nahi, links sirf apne hosts), P-SR-10, passkey R2.
7. **D-051 aur R-010 (Redis disk pe nahi):** band sessions aur rate limits ki ginti udna. Bachav: sach database me (P-SR-28); rate limits restart ke baad thodi der shuru se (maana).
8. **D-052 (rewrite to Render):** backend ka URL public, aur Vercel CDN personal jawab cache kar sakta. Bachav: P-SR-01, P-SR-02, P-SR-03.
9. **D-072 aur D-126 (delivery code confirmation email me, lambi umar):** forward hua email ya shared inbox se code; partner ka andaaza. Bachav: code sirf "out for delivery" aur usi partner pe, 5 koshish (P-SR-51); push me kabhi nahi (S-25).
10. **D-109 (door pe UPI QR):** partner apna QR dikhaye. Bachav: system ka QR, paid sirf webhook se, customer ke app me "payment mila" (P-SR-49).
11. **D-118 niyam 4 (delivery-pe-UPI me stock delivery tak ruka):** bina payment stock rokna. Bachav: S-17, P-SR-45.
12. **D-133 (allowlist setting me, bina deploy):** har raaste pe jaanch zaroori; setting khud badi chaabi. Bachav: P-SR-17 (ek function, har raasta), Master + step-up + audit. "Demo store" sandesh allowlist ka hona batata hai (maana, account ka nahi).
13. **D-136 niyam 4 (personal data ki report pe review chhupe):** jhoothi reports se negative review chhupwana. Bachav: P-SR-57 (signed-in, seema, sabse upar queue, SLA alert, jhoothi report ki ginti).
14. **D-143 (seller ko order number, shehar aur pincode; invoice ki copy):** kam orders wale pincode me customer pehchana ja sakta; invoice ki copy me naam aur address ho sakta (Kanooni detail jaanchi nahi (R-004)). Bachav: invoice ki copy sirf ek-ek download, audit me, bulk export me nahi (P-SR-74).
15. **D-144 (ek export me 50,000 rows):** ek baar me bada leak. Bachav: step-up, audit, aur misaal 5,000 se zyada rows pe owner ko alert (P-SR-74, P-SR-77).
16. **D-013 (backups repo ke folder me):** laptop chori, malware, ya Desktop ka cloud sync (§11). Bachav: S-26, P-SR-82; D-013 ke 4 pehre waise hi.
17. **D-071 (seller ko payment link):** bina domain ke link wale emails phishing ka sancha. Bachav: email me "Seller app me dekhein", link sirf seller app ke host ka (P-SR-72).
18. **D-093 (saara paisa platform ke khaate me):** seller ke bank badal ke payout chori. Bachav: S-29, S-12, P-SR-58.
19. **D-047 aur D-017 (owner ke alag accounts se kaam ka bantwara):** ek hi insaan, to bantwara sirf ek account ki chori se bachata hai, andar ke galat kaam se nahi. Bachav: audit me "insaan" ka jod (§7.2); asli business pe asli alag log.
20. **D-151 (delete, 7 din wapsi):** chori ke baad account delete; aur purane backup se delete hua data wapas. Bachav: delete se pehle dobara pehchaan (P-SR-15), email pe khabar; delete ka record restore ke liye (§7.6).
21. **D-161 ("Contact us" sirf allowlist ke emails se, R2):** form me koi bhi allowlist wala email likh sakta. Bachav: pehle email pe code (P-SR-86).
22. **D-025 (Meet link "sirf `https://meet.google.com/...`", R2):** sirf shuruaat milana dhokha kha sakta (`meet.google.com.example.com`). Bachav: URL parse karke host ka theek milaan (P-SR-85).
23. **D-042 (saare apps install ho sakein):** har app ka service worker. Bachav: P-SR-09.
24. **D-155 (review me chehre wali photo, ijazat ke tick ke saath):** public photo ki copy koi bhi le sakta. Bachav: EXIF hatana (P-SR-60), staff ki jaanch (D-155), customer delete kare to photo bhi hate.
25. **D-058 (Singapore) aur D-026 (kal asli business):** data ka desh kanooni sawal ban sakta (Kanooni detail jaanchi nahi (R-004)); abhi kuch badalna nahi.
26. **Achhe faisle (security ke liye):** D-157 (bahar koi analytics nahi), D-169 (try-on device pe hi), D-111 (refund original raaste, bank details nahi), D-143 (seller ko customer ki pehchaan nahi), D-020 (guest cart nahi, kam anjaan data). Inhe banate waqt CSP aur bahar ki scripts ki rok (P-SR-05) se pakka rakhna.

## 11. Sirf jaanch (owner ka faisla nahi)

| #   | Kya jaanchna                                                                                                                                                                                 | Kyun (kahan kaam aayega) |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1   | `vercel.app` aur `onrender.com` Public Suffix List me hain ya nahi (ek app ki cookie doosre app tak na jaaye)                                                                                | P-SR-26, D-048           |
| 2   | Vercel Hobby pe route ke `transforms` se request header lagana chalta hai aur client ka bheja header overwrite hota hai; `x-vercel-forwarded-for` ka bharosa                                 | P-SR-01, P-SR-02         |
| 3   | Vercel CDN external rewrite pe upstream ke cache headers kaise maanta hai; `Set-Cookie` aur `Cookie` pe cache ka vyavhaar                                                                    | P-SR-03                  |
| 4   | Render free web service ke outbound IPs tay hain ya nahi                                                                                                                                     | PR-3, P-SR-67            |
| 5   | Atlas M0 pe network access list (sab ke liye khula chahiye ya nahi), access ya audit logs milte hain ya nahi, TLS hamesha                                                                    | PR-3, P-SR-67, §7.4      |
| 6   | Neon free pe IP allow, roles, `sslmode` aur point-in-time restore ki khidki                                                                                                                  | PR-3, P-SR-67, P-SR-59   |
| 7   | Render Key Value free: sirf internal, password aur TLS, memory bhar jaane pe kya mitta hai (rate limits ud sakti)                                                                            | P-SR-07, P-SR-69         |
| 8   | Render free pe logs kitne din aur unka stream ya alert                                                                                                                                       | PR-7, §7.4               |
| 9   | Razorpay: webhook signature ka header aur algorithm, event id aur retry, payment signature ki jaanch, test mode me UPI QR (exact rakam ka), refund ki idempotency, chargeback ki samay-seema | P-SR-47 se P-SR-49, S-19 |
| 10  | Email provider (tay nahi): bheje emails ki copy dashboard me kitne din (OTP dikhta hai?), link tracking default, API key ke haq, shared domain pe SPF aur DKIM                               | P-SR-72, P-SR-11, PR-1   |
| 11  | Web Push: push services ke hosts ki list (allowlist ke liye), payload ki seema; iPhone pe sirf install hui site (pehle se jaanch ki list me)                                                 | P-SR-71, P-SR-73         |
| 12  | GitHub free public repo pe secret scanning, push protection, rulesets aur dependency alerts                                                                                                  | P-SR-79, P-SR-81         |
| 13  | LinkedIn aur GitHub sign-in me email "verified" hone ki jaankari milti hai ya nahi                                                                                                           | P-SR-16                  |
| 14  | Browser me file input ke `capture` se gallery kitni rukti hai                                                                                                                                | P-SR-52                  |
| 15  | Leak hue passwords ki free range API ki uplabdhi aur seema                                                                                                                                   | P-SR-12                  |
| 16  | Owner ka laptop: Desktop folder kisi cloud sync (jaise OneDrive) me hai ya nahi (repo Desktop pe hai, aur backups D-013 isi repo me); disk encryption chalu hai ya nahi                      | P-SR-82, S-26, PR-4      |
| 17  | Data leak pe users aur sarkari sanstha ko suchna (R-004)                                                                                                                                     | S-28                     |
| 18  | CERT-In ke incident report ka samay aur logs rakhne ka samay (R-004)                                                                                                                         | S-24, §7.4               |
| 19  | Sehat, paise aur chehre ki photo jaise sensitive data ki consent (R-004)                                                                                                                     | S-22, S-23, D-155        |
| 20  | Tax records aur seller KYC kitne saal (R-004)                                                                                                                                                | S-21, S-24               |
| 21  | Aadhaar number lene ke niyam (R-004)                                                                                                                                                         | P-SR-63                  |
| 22  | Payment data India me rakhne ke niyam aur Singapore hosting (R-004)                                                                                                                          | D-058                    |
| 23  | Device ki pehchaan aur accounts ke jod ki consent (R-004)                                                                                                                                    | S-16                     |
| 24  | Gig delivery partners ki location aur photo ke niyam (R-004)                                                                                                                                 | S-19, P-SR-53            |
| 25  | Invoice ki copy pe customer ka naam aur address zaroori hai ya nahi (R-004)                                                                                                                  | D-143, §10 point 14      |

## Change log

| Version | Date       | Badlav                                                                                                                                                                                        |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-19 | Pehla version: B14 ka pehla security run: 89 threats, 86 proposed requirements, 29 owner sawal (19 bina dependency, 5 groups me 10), 14 proposed risks, lene layak aur tay faislon pe dhyaan. |
