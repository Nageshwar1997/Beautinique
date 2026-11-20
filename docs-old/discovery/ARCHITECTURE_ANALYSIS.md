# ARCHITECTURE ANALYSIS: Beautinique (B15)

> **Status:** v1.0.0 (2026-11-20). Principal Software Architect: technical discovery (B15).

## 0. Kaise padhein

- Ye ek **report** hai, faisla nahi. Main session har daawa [DECISIONS.md](../../docs/DECISIONS.md) se milaa ke jaanchega; owner ki haan ke baad hi cheezein naye docs me jaayengi (zyadatar `docs/ARCHITECTURE.md`, kuch `docs/RISKS.md` aur `docs/OPEN_QUESTIONS.md` §2).
- **IDs (sirf is report ke):** `A-1`... owner ke sawal (§3); `AB-1`... ARCHITECTURE.md ke batches aur unke niyam `AB-1.1`... (§4); `PR-1`... prastaavit risks (§5); `F-1`... sirf jaanch (§6); `LL-1`... lene layak (§7). Tay faisle `D-xxx`, security niyam `SR-xxx`, kanooni rows `CL-xxx`, risks `R-xxx`.
- **"misaal"** = number sirf udaharan; asli number settings ya naap se. Memory aur speed ke saare number andaaze hain, code banne pe naap ke pakke honge (R-007).
- **Release:** R1 aur R2 [PROJECT_PLAN.md](../../docs/PROJECT_PLAN.md) §1 (D-055) ke hisaab se. Jahan kuch nahi likha, wo R1.
- **Owner ka niyam:** har pattern ke saath wo zaroorat (D, SR, CL ya R) likhi hai jise wo hal karta hai. Jo pattern kisi tay zaroorat se nahi juda, wo "chhode vikalp" me hai.
- **Naye docs ke liye vakya:** §4 ke niyam aur §3 ke sawal aise likhe hain ki seedhe naye docs me ja sakein: unme pehle ke kaam ka koi zikr nahi. Pehle ke kaam ke paths sirf §0, §7, §9 aur kuch "sirf jaanch" me.
- **Kya padha:** root `CLAUDE.md`; DECISIONS §1 (D-001 se D-282 poora) aur Architecture tag ke records, saath me D-016, D-028, D-037, D-042, D-048 se D-058, D-074, D-118, D-126, D-133, D-138, D-139, D-142, D-149, D-152, D-157, D-180, D-182, D-191, D-192, D-194, D-196 se D-198, D-225, D-250, D-257, D-262, D-269, D-282 ke records aur "Asar (Claude)" ki saari lines jo Architect, services, events, search, media, logs ya scale kehti hain; `docs/ARCHITECTURE.md` (§1); `docs/PROJECT_PLAN.md` §1; `docs/RISKS.md` (poora); `docs/security/SECURITY_REQUIREMENTS.md` (SR-001 se SR-088); `docs/security/THREAT_MODEL.md` (§1.1, §1.7 se §1.10); `docs/COMPLIANCE.md` ki rows CL-003, CL-004, CL-021, CL-093, CL-094, CL-104 se CL-107, CL-109, CL-131; `docs/OPEN_QUESTIONS.md` §1 aur §2; `docs/HANDOFF.md`; RULES, OPERATIONS, FLOWS, PRODUCT, GLOSSARY, DESIGN (sab khaali, sirf dhaancha). Pichhle agents ke "aage ke agents" wale hisse: `BUSINESS_DOMAIN_ANALYSIS.md` §10.2 aur §11, `BUSINESS_DOMAIN_ANALYSIS_2.md` §9.3 aur §10, `SECURITY_ANALYSIS.md` §1.3 se §1.5, §7.2, §9, §10; `LEGAL_REVIEW_2.md` (L-103, L-110), `CA_REVIEW.md` (CA-029); `LEGAL_REVIEW.md` aur `LAWYER_REVIEW.md` me Architect ke liye alag hissa nahi mila (grep se). Reference (sach nahi): `REPOSITORY_ANALYSIS.md` §4, §5, §6 Q3, §8; `docs-old/ARCHITECTURE.md` §5, §6.1 se §6.8, §10, §11.1, §11.2, §14; purane code me sirf `packages-old/backend/server-kit/src/errors.ts` aur `packages-old/backend/server-queue/src/outbox.ts` jhaank ke.
- **Jaanch (2026-11-20, providers ke docs se):** Render free, Render outbound bandwidth, Atlas free cluster limits, Atlas Search ke free cluster limits, Cloudinary free FAQ. Nateeje §6 me; baaki "nahi jaancha".
- **Kya nahi kiya:** koi code nahi chalaya, koi live service nahi chhui; `.env`, `.env.*` aur `All-ENVs` nahi khole; koi git command nahi.

## 1. Ab tak tay (technical)

| Area                        | Kya tay hai                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Faisla                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Stack                       | Node.js 24, TypeScript strict ESM, Express, zod, axios; MongoDB native driver; finance PostgreSQL; Valkey aur BullMQ background kaam aur queues ke liye; React SPA (Vite, React Router, TanStack Query)                                                                                                                                                                                                                                                              | D-001                               |
| Repo                        | Ek monorepo: `packages/`, `frontend/<app>`, `backend/<service>`, `infra/`, `scripts/`, `configs/`                                                                                                                                                                                                                                                                                                                                                                    | D-002                               |
| Apps                        | 11 alag apps; sab responsive web; Delivery mobile-first PWA offline ke saath; baaki install ho sakein                                                                                                                                                                                                                                                                                                                                                                | D-010, D-042                        |
| Services                    | Alag services, har ek ka apna database, apna cluster, apna DB user; seema transaction se; services ke beech data events se; pehla draft: identity, notify, payments, catalog, commerce, logistics, finance, support, audit                                                                                                                                                                                                                                           | D-011, D-050                        |
| Hosting                     | Render free (ek web service, bundle mode), Vercel Hobby, Atlas M0 har service ka, Render Key Value free, Neon free; sab Singapore; laptop pe Docker split mode                                                                                                                                                                                                                                                                                                       | D-048, D-049, D-056 se D-058        |
| Redis                       | Laptop pe Valkey (Render jaisi limits), production me sirf internal URL; 25 MB, 50 connections, disk pe save nahi                                                                                                                                                                                                                                                                                                                                                    | D-051, R-010                        |
| Apps se backend             | Har app `/api/*` ko gateway pe rewrite (same-origin); secret header; asli IP ek helper se                                                                                                                                                                                                                                                                                                                                                                            | D-052, SR-002, SR-003               |
| Neend                       | ₹0, domain nahi; server soya to ~1 minute; din me baar-baar jagana; performance targets sirf jaage server pe                                                                                                                                                                                                                                                                                                                                                         | D-028, D-053, R-002, R-008          |
| Expansion                   | Naya area sirf setting se, na code na deploy                                                                                                                                                                                                                                                                                                                                                                                                                         | D-037                               |
| Backup                      | Ek command se saare databases, encrypted, restore command                                                                                                                                                                                                                                                                                                                                                                                                            | D-013, D-196                        |
| Emails                      | 300 din me; lines aur har line ki chhat; zaroori emails hi                                                                                                                                                                                                                                                                                                                                                                                                           | D-126, D-140 se D-142               |
| Analytics                   | R1 me sirf server ke business events; bahar koi analytics service nahi                                                                                                                                                                                                                                                                                                                                                                                               | D-149, D-157                        |
| Finance                     | Ledger, documents, numbering (bina gap, counter row lock), rounding, statements, milaan M1 se M12                                                                                                                                                                                                                                                                                                                                                                    | D-282 (ARCHITECTURE §1)             |
| Data ka samay               | Delivery, daawe, audit, logs, kanooni rok, tax archive ke samay                                                                                                                                                                                                                                                                                                                                                                                                      | D-191 se D-194, D-225, D-250, D-262 |
| Security jo dhaancha bandhe | Gateway pe default deny aur route manifest contracts se (SR-032); resource limits (SR-007); rate limits fail-closed ya fail-open (SR-008); kill switches settings me (SR-009); Redis sirf cache, sach DB me (SR-029, SR-070); ek process me service ki deewar (SR-071); bahar sirf tay hosts (SR-072); uploads seedha storage pe aur dobara encode (SR-061, SR-062); logs ke niyam (SR-077); audit append-only aur hash chain (SR-076); idempotency (SR-045, SR-049) | D-210 se D-219                      |
| Kanoon jo dhaancha bandhe   | CERT-In: logs 180 din, ghadi NTP se traceable, saare timestamps UTC (CL-106); payment data ka kam se kam hissa (CL-107); invoice dispatch se pehle (CL-003); books ka audit trail (CL-131)                                                                                                                                                                                                                                                                           | D-248, D-250, D-259, D-281          |

**Abhi khula (B15):** services ki pakki list aur data ka maalik, events, background jobs, search, media ki jagah (D-155 asar), caching, API aur error format, observability, scale targets, 512 MB me memory (R-007), customer app ka server-side hissa (D-058 asar).

## 2. Prastaavit architecture

### 2.1 Ek nazar me

```text
 Browser: 11 apps (Vercel Hobby, har app ka apna *.vercel.app)
   |  /api/*  same-origin rewrite + secret header (D-052, SR-002)
   |  /wake   seedha Render pe, sirf jagane ke liye (D-028)
   v
 Render free web service, Singapore, 512 MB, ek process (bundle mode, D-049)
 +--------------------------------------------------------------------------+
 | gateway (koi DB nahi): session, rate limit, CSRF, route manifest          |
 |    | in-process facade call (laptop ke split mode me signed HTTP)          |
 |    v                                                                       |
 | identity  notify  payments  catalog  commerce  logistics                   |
 | finance   support audit     media    logs                                  |
 |    | har service ka outbox usi DB transaction me                           |
 |    v                                                                       |
 | outbox dispatcher -> subscriber ke handler (inbox se dedupe)               |
 | ticker (har minute) -> DB ki due dates -> BullMQ jobs (email, PDF, export)  |
 +--------------------------------------------------------------------------+
    | Atlas M0 (har service ka apna project aur cluster, Singapore)
    |   identity | notify | payments | catalog (+ Search) | commerce
    |   logistics | support | audit | media | logs
    | Neon free: finance (PostgreSQL, sirf kaam aane pe)
    | Render Key Value: BullMQ, rate limits, session marks (sach nahi)
    v
 Bahar: Razorpay (webhook seedha Render pe), email provider (HTTPS API),
        browser push services (VAPID), media provider, wake pingers (D-028)
```

**Order ka mukhya safar (events):**

```text
commerce.order.placed -> (prepaid) payments.payment.captured -> commerce.order.confirmed
  -> logistics.parcel.planned (delivery code bane) -> notify: confirmation email (D-126)
pack scan (commerce) --sync--> finance.issueInvoices (number usi transaction me, ARCHITECTURE §1.7)
  -> commerce.parcel.packed -> logistics: trip, hub, partner
  -> logistics.parcel.delivered -> commerce.orderLine.delivered -> catalog: review ka haq (D-135)
  -> finance: return window ke baad payable (D-081) -> hafte ka payout (D-189)
return: commerce.return.requested -> support.return.decided -> logistics.pickup.completed
  -> commerce.return.inspected -> finance.creditNote.issued + commerce.refund.requested
  -> payments.refund.succeeded -> finance, notify
```

### 2.2 Services aur data ka maalik

**Prastaav:** gateway ke saath 11 data wali services. D-011 ke pehle draft ke 9 waise hi; do nayi: **media** (files ka registry aur provider ki chaabi ek jagah) aur **logs** (180 din ke request logs, A-3 ke jawab pe tika).

| Service   | Data ka maalik (saar)                                                                                                                                                                                                                                                                                                                                                       | Bhejta hai (mukhya events)                                                                                                                                                                                                                                               | Leta hai (mukhya events)                                                                                                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| gateway   | Kuch nahi (koi DB nahi)                                                                                                                                                                                                                                                                                                                                                     | Kuch nahi                                                                                                                                                                                                                                                                | Kuch nahi; identity se session ki jaanch (SR-029)                                                                                                                                                   |
| identity  | Accounts, insaan ka jod (D-017, SR-076), credentials, authenticator, recovery codes, sessions, devices (D-183), roles, grants, invites, allowlist (D-133), consents aur 18+ ka record (D-150, D-255), signing keys                                                                                                                                                          | `identity.account.created`, `.changed`, `.erased`; `identity.grant.changed`; `identity.consent.recorded`                                                                                                                                                                 | `catalog.seller.statusChanged` (seller grant), `logistics.partner.activated` (partner grant)                                                                                                        |
| notify    | Templates, in-app inbox, push subscriptions, email ki line aur din ki ginti (D-142), digest (D-140), bheje emails ka record (bina code ke)                                                                                                                                                                                                                                  | `notify.emailCap.reached` (andar ka alert)                                                                                                                                                                                                                               | Har woh event jispe khabar jaati hai (order, invoice, refund, delivery, recall, area khulna); `identity.account.erased`                                                                             |
| payments  | Gateway orders, payments, webhook inbox (event id), refunds, delivery pe UPI QR, chargebacks, settlement reports                                                                                                                                                                                                                                                            | `payments.payment.captured`, `.failed`; `payments.refund.succeeded`, `.failed`; `payments.settlement.reported`; `payments.chargeback.opened`                                                                                                                             | `commerce.refund.requested`                                                                                                                                                                         |
| catalog   | Sellers (KYC refs, GSTIN, EPR, seller ka block D-238), brands, products, variants, listing versions (D-098, SR-041), daam aur itihaas (D-061, D-223), HSN table (D-086), ingredients aur blocklist (D-132), claims aur saboot (D-224), reviews aur moderation (D-135, D-136), search read model, synonyms (D-152)                                                           | `catalog.seller.statusChanged`, `catalog.listing.published`, `catalog.price.changed`, `catalog.taxRate.changed`, `catalog.review.published`, `.hidden`                                                                                                                   | `commerce.stock.changed`, `commerce.nextBatch.changed`, `commerce.orderLine.delivered`, `commerce.sales.rolledUp`, `finance.seller.duesStage`                                                       |
| commerce  | Cart, wishlist, addresses, orders, seller ke hisse, lines aur snapshots, reservations, stock (batch, bin, balance, movements), inbound shipment aur receiving (D-096), pick aur pack, cancel, return requests, refund ka hisaab (SR-047), customer ki seemaayein (D-091, D-109, D-204)                                                                                      | `commerce.order.placed`, `.confirmed`; `commerce.orderLine.cancelled`, `.delivered`; `commerce.parcel.packed`; `commerce.stock.changed`; `commerce.nextBatch.changed`; `commerce.return.requested`, `.inspected`; `commerce.refund.requested`; `commerce.sales.rolledUp` | `payments.payment.*`, `logistics.parcel.*`, `logistics.pickup.completed`, `logistics.area.changed` (copy), `catalog.listing.published` aur `catalog.price.changed` (copy), `support.return.decided` |
| logistics | Location master (India se Sub-District aur pincode, D-015, D-016), areas, switches aur live, pincode se hub, area settings (delivery fee D-107, cut-off D-117, UPI seema D-109), hubs, warehouses ki jagah, trips (D-027), partners, assignment, delivery attempts, delivery codes (encrypted), saboot ke refs, return pickups, RTO, waitlist (D-046), carrier port (D-014) | `logistics.area.changed`; `logistics.parcel.planned`, `.dispatched`, `.atHub`, `.outForDelivery`, `.delivered`, `.attemptFailed`, `.rtoReceived`; `logistics.pickup.completed`; `logistics.partner.activated`                                                            | `commerce.order.confirmed`, `commerce.parcel.packed`, `support.return.decided`, `payments.payment.captured` (delivery pe UPI, SR-050)                                                               |
| finance   | ARCHITECTURE §1 ka sab: journal, sub-ledgers, documents aur numbering, payables, payouts, statements, TCS aur TDS, milaan, tax archive (D-225), seller ke bank details (SR-052), partner ki kamaai (R2)                                                                                                                                                                     | `finance.invoice.issued`, `finance.creditNote.issued`, `finance.payout.paid`, `finance.seller.duesStage` (D-103), `finance.reconciliation.mismatch`                                                                                                                      | `payments.payment.captured`, `payments.settlement.reported`, `payments.refund.*`, `payments.chargeback.*`, `commerce.return.inspected`, `commerce.orderLine.cancelled`                              |
| support   | Daawe (D-072, D-106), return aur daawe ke faisle (D-105), appeals (D-147), staff ki rakam seema (D-188), fraud signals (SR-058), grievance register (D-163); R2: tickets, SLA, skin reaction                                                                                                                                                                                | `support.claim.decided`, `support.return.decided`, `support.appeal.decided`                                                                                                                                                                                              | Order, parcel aur return ke events (maamle ka context)                                                                                                                                              |
| audit     | Audit entries hash chain ke saath (SR-076), security events (D-194)                                                                                                                                                                                                                                                                                                         | Kuch nahi                                                                                                                                                                                                                                                                | Har service ka `*.audit.recorded`                                                                                                                                                                   |
| media     | Har file ka record (maalik service, maalik record, maqsad, public ya private, size, halat, samay; SR-062); provider ki chaabi sirf yahan                                                                                                                                                                                                                                    | `media.asset.ready`, `media.asset.rejected`                                                                                                                                                                                                                              | Retention ke liye maalik services ke "maamla band" events, ya unki facade call                                                                                                                      |
| logs      | Request logs ke compressed chunks (D-250 niyam 5, CL-106)                                                                                                                                                                                                                                                                                                                   | Kuch nahi                                                                                                                                                                                                                                                                | Kuch nahi; gateway seedha likhta hai                                                                                                                                                                |

**Kyun is tarah:**

- **Stock aur order ek service me (commerce):** SR-045 ka atomic reservation aur D-118 ka "place order pe stock ruke" ek transaction maangte hain; D-011 ki seema "jo ek saath pakka ho wo ek service me".
- **Serviceability ki copy commerce me:** D-016 niyam 9 jaanch "order banate waqt usi transaction me" maangta hai. Pincode se hub aur area live ki copy commerce ke DB me `logistics.area.changed` se; transaction usi copy pe (pichhle agent ka item, BA §11 point 5).
- **Daam ki copy commerce me:** SR-044 server pe daam nikalna maangta hai; catalog ka daam event se commerce ki copy me. Customer ka dekha aur server ka total na mile to naya total (SR-044 pehle se).
- **Invoice finance me, pack pe sync:** ARCHITECTURE §1.7 niyam 3 number ko document ke usi PostgreSQL transaction me counter row ke lock se deta hai; isliye invoice jaari karna finance ka kaam, aur pack scan pe ek sync call (CL-003: maal nikalne se pehle invoice; D-077: invoice parcel ke andar).
- **Reviews catalog me:** review product pe (D-076), rating ka jod search ke kram me (D-139); haq commerce ke "delivered line" event se (D-135, SR-059).
- **Media alag service:** SR-062 ek registry aur "data me provider ka URL nahi" maangta hai; SR-071 kehta hai har service sirf apne config namespace ke secrets padhe, to provider ki chaabi ek hi service me. Retention (D-191, D-192, D-193, D-262) aur cleanup ek jagah.
- **Settings har service ki apni:** D-037, SR-009, SR-043; koi alag settings service nahi. Master app har maalik service ki settings API bulata hai.
- **Aankde (D-149) maalik service me:** har service apne roz ke jod khud banaye; Master app ka dashboard gateway ke ek composition route se. Alag "insights" service nahi.

**Chhode vikalp:** ek service me sab (modular monolith; D-011 me owner ne chhoda); seller onboarding ki alag service (data kam, catalog ke saath live hone ka niyam D-238); notify me customers ke email ki copy (recipient bhejte waqt identity se, kam personal data, SR-064, SR-066); alag insights service (ek aur cluster, D-149 ka kaam maalik service kar leti hai); media registry har service me alag (provider ki chaabi har jagah, SR-071 se takrav).

### 2.3 Services ke beech seedhi (sync) baat

D-011 ka "data sirf events se" yahan aise padha gaya: **kisi service ka data doosri service me sirf events se aata hai** (copy ya read model), aur kisi doosri service ka DB kabhi nahi padha jaata (D-050, SR-068). Par kuch kaam me user usi pal jawab ka intezaar karta hai; unke liye typed facade call (SR-071 pehle se ye maanta hai). Ye padhna §10 point 1 me.

| Kaun bulata                                    | Kise                | Kya                                                             | Kyun sync                                                   |
| ---------------------------------------------- | ------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| gateway                                        | identity            | Session aur revoke ki jaanch (Redis khaali ho to DB, SR-029)    | Har request                                                 |
| identity                                       | notify              | OTP aur codes ka email turant (D-142 OTP line)                  | Code DB ya outbox me saada roop me nahi rakh sakte (SR-015) |
| commerce                                       | payments            | Gateway order banana (SR-048)                                   | Checkout pe customer ruka hai                               |
| commerce                                       | finance             | Pack pe invoices jaari karna, idempotent (parcel + seller)      | Invoice parcel me (D-077, CL-003)                           |
| logistics                                      | payments            | Delivery pe UPI ka QR, exact rakam (SR-050)                     | Partner darwaze pe                                          |
| notify                                         | identity, logistics | Bhejte waqt recipient ka email, aur delivery code (resolver)    | Personal data aur code ki copy notify me nahi               |
| catalog, commerce, logistics, support, finance | media               | Upload ka signed URL, file ki halat, private file ka chhota URL | User upload ya download kar raha hai                        |

**Niyam:** sync calls ka graph bina chakkar (cycle) ke; resolver jaise interfaces maangne wali service me, implementation jodne ki jagah (composition root) pe, taaki package import me chakkar na bane. Finance ko kisi tez padhne wale raaste (product page, cart) me nahi bulaya jaata (R-014).

### 2.4 Events aur messaging

**Prastaav: outbox se seedhi delivery.**

1. Producer apna badlav aur event **ek hi DB transaction** me apne outbox me likhta hai (MongoDB me collection, finance me table). HTTP jawab commit ke baad (D-011, SR-071).
2. Har producer ka **dispatcher** outbox se event uthata hai aur har subscriber ko alag deliver karta hai: bundle mode me in-process handler call, split mode me signed HTTP (SR-071). Har subscriber ki delivery ka haal (`pending`, attempts, `nextAttemptAt`) outbox me hi.
3. Commit ke turant baad process ke andar ek "nudge" dispatcher ko jagata hai (deri misaal 100 ms se kam); fallback poll misaal har 5 second (M0 pe har cluster ~0.2 ops/second, R-006).
4. Consumer apna asar aur `processed_events` (event id + subscriber, unique) **ek transaction** me likhta hai: delivery kam se kam ek baar, asar theek ek baar.
5. **Kram:** ek subscriber ke liye ek aggregate (jaise ek order) ke events kram se; ek fail ho to usi aggregate ke agle ruke, baaki chalte rahein. Isse order ki zindagi ke events ulte kram me nahi pahunchte (SR-049 ka andar wala roop).
6. **Retry:** exponential backoff, misaal 8 koshish ~6 ghante me; phir consumer ke DB me dead letter, aur owner ko ops alert. Master app se dobara chalana (permission ke saath).
7. **Envelope:** `eventId`, `type` (`<service>.<aggregate>.<pastTense>`), `version`, `occurredAt` (UTC, server), `producer`, `aggregate {type, id, version}`, `actor`, `correlationId`, `causationId`, `data`. Zod se jaanch; galat producer ka event reject (SR-071). Size misaal 16 KB tak; event me sirf ids aur zaroori halat.
8. **Event me kabhi nahi:** OTP, delivery code, password, token, bank ya PAN, poora address (SR-015, SR-054, SR-063, SR-077). Jise chahiye wo maalik se facade se le.
9. **Versioning:** naya field jodna theek; tootne wala badlav = naya `version`, aur consumer kam se kam pichhla version bhi samjhe, kyunki deploy ke waqt outbox me purane events baaki ho sakte hain.
10. **Audit outbox se:** staff ka har likhne wala kaam aur mana hua kaam usi transaction me `audit.recorded` event likhta hai, jo audit service me hash chain me judta hai (SR-076). Isse "badlav hua par audit nahi" namumkin; mana hue kaam (bina badlav) ka bhi event.
11. Outbox ke delivered events misaal 7 din baad TTL se hatein; `processed_events` misaal 14 din (sabse lambi retry window se zyada).

**Kyun:** Redis kabhi sach nahi (R-010, SR-070), to event ka sach outbox me. Seedhi delivery me Redis ke restart se event nahi khota, 25 MB Redis (D-051) events se nahi bharta, aur aggregate ke hisaab se kram milta hai.

**Chhode vikalp:** outbox se BullMQ queue aur phir consumer (ek aur hop, Redis ki memory aur restart pe dobara bhejne ka kaam, aggregate ka kram nahi); MongoDB change streams (har stream ek connection, M0 pe filter ki seema, finance pe nahi chalta); in-memory event emitter (crash pe event gayab); bahar ka message broker (₹0 me koi tay nahi, aur ek aur processor, CL-104).

### 2.5 Background jobs aur samay

**Prastaav:**

1. **Sach DB me:** har samay wala kaam maalik service ke `timers` me (`dueAt`, `kind`, `ref`, halat). Process me ek **ticker** (misaal har 60 second) DB lease ke saath due timers uthata hai. Boot ke misaal 30 second baad ek baar poora sweep (cold start pe CPU ke saath takrav kam). Soya server (R-002) jaagte hi pichhla kaam pakad leta hai; kaam late hota hai, khota nahi.
2. **BullMQ sirf kaam chalane ke liye (D-001):** email bhejna, PDF, export, import, media processing. Kaam ka record DB me; BullMQ job id wahi record id (dohra nahi). Redis khaali ho to ticker "pending par queue me nahi" wale records dobara daale (R-010).
3. **Queues (misaal):** har service ki ek halki queue (concurrency 2) aur poore process ki ek `heavy` queue (PDF, export, import, media; concurrency 1, R-007). Redis connections ek instance pe misaal 20 tak (50 me, deploy overlap ke saath, D-051).
4. **Lease:** deploy ke waqt purana aur naya instance saath chalte hain; dispatcher, ticker aur har schedule DB lease ke peeche, aur har handler dobara chalne pe surakshit.
5. **Din ka matlab:** emails ki din ki chhat (D-142), aankde (D-149) aur "roz" ke kaam IST ke calendar din se; timestamps UTC me (CL-106, ARCHITECTURE §1.1 niyam 6).
6. **Chhoote din ka catch-up:** har roz ka kaam "aakhri poora din" yaad rakhe aur jaagne pe har chhoota din kram se banaye (D-149 ka asar).
7. **Finance (Neon) pe kaam sirf zaroorat pe:** health aur wake finance tak nahi (D-057); finance ke events batch me (A-6 ke jawab se, misaal har 15 minute, sirf jab kuch pending ho); roz ke milaan ek batch me. Sirf pack pe invoice aur Finance app ka istemaal turant.
8. **Turant wale kaam job nahi:** jis kaam ka kanooni ya suraksha samay chhota hai (D-251 ki nagnata wali report pe turant chhupna aur alert, D-248 ka leak), wo usi request me hota hai jo use shuru karti hai, kyunki tab server jaaga hai.

**Mukhya jobs (R1):**

| Kaam                                                    | Kab                                       | Service                | Zaroorat                   |
| ------------------------------------------------------- | ----------------------------------------- | ---------------------- | -------------------------- |
| Reservation khatam (15 minute misaal)                   | Timer                                     | commerce               | D-118                      |
| Der se aaya payment: stock ho to order, warna refund    | Event pe                                  | commerce, payments     | D-118, SR-049, CL-109      |
| Delivery pe UPI ka payment fail, 10 minute              | Timer                                     | logistics              | D-109                      |
| Customer ka jawab nahi (pick pe kami): line cancel      | Timer                                     | commerce               | D-090                      |
| Hub pe 3 din, phir RTO; doosri koshish                  | Timer                                     | logistics              | D-108                      |
| Vaada toota to "der" aur khabar                         | Timer (cut-off ke hisaab)                 | logistics              | D-117, D-222               |
| Return window band: payable                             | Timer                                     | finance                | D-081, D-221               |
| Hafte ka payout batch (do haath)                        | Hafte                                     | finance                | D-081, D-189               |
| Fees invoice har payout cycle; mahine ka TCS            | Cycle, mahine                             | finance                | ARCHITECTURE §1.3, §1.6    |
| Milaan M1 se M5 roz, M6 se M12 mahine                   | Roz, mahine                               | finance                | ARCHITECTURE §1.11, SR-053 |
| Seller udhaar ke kadam (₹5,000 ya 60 din, 30, 90 din)   | Roz                                       | finance, catalog       | D-071, D-103               |
| Storage fee                                             | Mahine                                    | commerce, finance      | D-066                      |
| Expiry: bikri band aur near-expiry alert                | Roz                                       | commerce               | D-062, D-082, D-124        |
| Pichhle 30 din ka sabse kam daam                        | Daam badalne pe aur roz                   | catalog                | D-223                      |
| "Bestseller" aur "kam stock" ke niyam                   | Roz, stock event pe                       | catalog                | D-154                      |
| Search ke kram ke liye 30 din ki bikri aur rating       | Roz, review event pe                      | commerce, catalog      | D-139                      |
| Aankde: din, hafte, mahine                              | Roz (catch-up ke saath)                   | har maalik service     | D-149                      |
| Zero result ki hafte ki report                          | Hafte                                     | catalog                | D-152                      |
| Emails: din ki line, chhat, agle din ki line, 80% alert | Ticker                                    | notify                 | D-126, D-142               |
| Sellers aur staff ka din ka saar                        | Roz (misaal 09:00 IST ke baad pehli jaag) | notify                 | D-140                      |
| Data ke samay: delete ya pehchaan hatana                | Roz                                       | har service, media     | SR-065, D-191 se D-194     |
| Kanooni rok ka erase                                    | Roz                                       | maalik services, media | D-250, D-262               |
| Account delete ke 7 din baad (wapsi ki khidki)          | Timer                                     | identity, phir event   | SR-066, D-151              |
| Audit chain ka roz ka verify aur security saar          | Roz                                       | audit                  | SR-076, SR-078             |
| Signing keys badalna (misaal 30 din)                    | Timer                                     | identity               | SR-031, D-197              |
| Invite ki expiry (72 ghante)                            | Timer                                     | identity               | SR-025                     |
| Chhode hue uploads aur provider se milaan               | Roz, hafte                                | media                  | SR-061, SR-062             |
| Atlas cluster ko 30 din me kam se kam ek connection     | Har jaag pe (dispatcher se apne aap)      | sab                    | PR-6                       |

**Chhode vikalp:** BullMQ ke delayed jobs aur repeatable schedulers timers ke sach ki tarah (Redis restart pe gayab, R-010; DB ki due date phir bhi chahiye); ek alag cron service (D-056: doosri web service nahi); GitHub Actions se business jobs chalana (wake pings ke alawa kuch nahi; D-028 me sirf jagana).

### 2.6 Search

**Prastaav:** catalog ke apne Atlas cluster pe **Atlas Search**, ek denormalised `search_documents` read model ke upar.

1. Ek document har bikne layak variant group ka: naam, brand, category, shade family (D-085), free-from (D-099), skin type aur concern (D-137), claims (D-100), country of origin aur uska naam (D-127, D-240), size, daam, discount, rating aur reviews ki ginti, 30 din ki bikri, in-stock. Ye catalog aur commerce ke events se banta hai (§2.4).
2. **Ek index storefront ka, ek Admin ke catalog search ka, teesra khaali** (free cluster pe 3 indexes, definition 3 KB tak; §6 F-3). Index ki definition code me, release step se laagu.
3. **Kram (D-139):** text ka score, phir rating (kam se kam 5 reviews pe, misaal), 30 din ki bikri aur stock ka jod; out-of-stock sabse neeche (D-153). Kisi seller ke hisaab se boost ka koi field hi nahi (D-139 niyam 3).
4. **Synonyms (D-152 niyam 2):** synonyms ki collection staff ki setting se; Atlas Search use bina deploy uthata hai (free pe 10,000 documents tak, §6 F-3).
5. **Spelling ki galti:** fuzzy matching, aur "kya aapka matlab" ke liye naam aur brand pe autocomplete (D-152 niyam 1). Free cluster pe in operators ka chalna jaanchna baaki (F-4).
6. **Zero result (D-152, D-157):** normalised shabd ki din ki ginti (bina user id), hafte ki report. Search ke jawab CDN pe cache nahi (§2.8), warna ginti galat.
7. Text 100 characters, regex escape, IP pe rate limit (SR-007, SR-008, SR-069).
8. **Laptop aur CI:** Atlas Search local me nahi milta to ek adapter jo MongoDB text index se chale; ranking ke tests dono pe (QA ke liye).

**Kyun:** D-138 ke filters aur D-139 ka kram dono ek index se; synonyms bina deploy (D-037 ki soch); ₹0; data bahar nahi (D-157 ki soch).

**Chhode vikalp:** sirf MongoDB text index (na fuzzy, na synonyms ki setting, kram kamzor); process ki memory me search index (512 MB me bojh, har cold start pe dobara banana, R-007); bahar ki search service ka free plan (naya processor CL-104, data bahar, seemit searches).

### 2.7 Media (images, uploads, PDFs)

**Prastaav (provider A-2 ke jawab se; dhaancha provider se alag):**

1. **Upload ka raasta:** client maalik service se upload maange (maqsad, type, size); maalik service authorize kare aur media se chhota signed upload URL le (misaal 10 minute, exact type aur size, SR-061); file seedha provider pe; phir client maalik service ko `assetId` de; media file ki asli halat dekhe (provider ka stat) aur `ready` hone pe hi record se jude. Backend ke raaste file kabhi nahi (SR-007 ka 100 KB, R-007, Render ki 5 GB bandwidth §6 F-1).
2. **Har file ka record** media me: maalik service, maalik record, maqsad, public ya private, type, size, hash (SR-055), halat (`uploaded`, `ready`, `attached`, `deleting`, `deleted`, `rejected`), retention ki tareekh. Business data me sirf `assetId` (SR-062).
3. **Type aur dobara encode:** bytes se type (JPEG, PNG, WebP; PDF jahan zaroori; video sirf daawe me), har image ka dobara encode aur EXIF hatana (SR-061). Ye kaam jahan ho sake provider pe (SR-071); server pe karna pade to `heavy` queue, concurrency 1, pixels ki seema (misaal 24 MP), aur memory guard (§2.12).
4. **Private files:** alag private jagah; maalik service authorize kare, phir media chhota URL de (misaal 5 minute); PDF attachment ke roop me; app ke origin se kabhi nahi (SR-062).
5. **Retention:** har maqsad ka samay (D-191, D-192, D-193, D-227); maalik service "maamla band" pe media ko batati hai; roz ka job mitata hai (SR-065). Lagbhag 13 May 2027 se delivery aur daawon ki photos aur video app se hat ke encrypted band jagah me capture se 1 saal (D-262).
6. **Ek file ek maalik:** wahi image doosri jagah chahiye to nayi copy, apne maalik ke saath; ek record ka delete doosre ki file nahi todta.
7. **Jis product ka order hua wo delete nahi, archive:** order, return, invoice aur daawe ko uski images chahiye.
8. **PDFs (invoice, credit note, statements, labels):** ek halki PDF library se, server pe, `heavy` queue ya request me semaphore (ek waqt me 1); headless browser kabhi nahi (R-007). Jaari document ka data badalta nahi; PDF uske data aur template ke version se (template kabhi jagah pe nahi badalta, naya version banta hai). Kya ye tax archive ki "asli copy" maani jaayegi: Lawyer (ya CA) se nahi jaancha (D-225, CL-021).
9. **Exports (D-144, SR-075):** DB cursor se stream, CSV seedha private file me stream, buffer me poora nahi; ek baar ka chhota link.
10. **Cleanup:** 24 ghante se purane `uploaded` (kabhi na jude) aur atke `deleting` roz; provider ki list se hafte ka milaan.

**Chhode vikalp:** files MongoDB me (har cluster 0.5 GB, R-006; D-155 asar); files backend ke raaste (memory, bandwidth, SR-007); har service ki apni registry (provider ki chaabi har jagah, SR-071).

### 2.8 Caching

1. **CDN (Vercel) pe public cache sirf contract me "public cacheable" routes pe (SR-004):** category tree, brand page, product ka content (misaal `s-maxage=300, stale-while-revalidate=600`), aur product ki "availability" (daam, MRP aur expiry agle batch ki D-064 aur D-067, stock ki halat, kam stock ka label; misaal `s-maxage=30`). Unpe kabhi `Set-Cookie` nahi. Vercel ka vyavhaar jaanchna baaki (OPEN_QUESTIONS §2).
2. **Kabhi public cache nahi:** search (D-152 ki ginti), cart, checkout, Pro daam (SR-042), signed-in ka har jawab (`private, no-store`, SR-004).
3. **Daam ki sachchai:** checkout server pe dobara hisaab (SR-044); isliye CDN ka 30 second purana daam sirf dikhne me, kabhi bill me nahi. "Kam stock" aur "Bestseller" sirf tay niyam se aur sirf availability route me (D-154).
4. **Polling routes pe ETag aur `304`** (inbox ka saar, order ki halat): bandwidth bachti hai (§6 F-1).
5. **Process ke andar cache (bundle mode me ek hi process):** sirf kam badalne wali config (settings, HSN table, synonyms, route manifest), LRU, kul misaal 20 MB, maalik ke `settings.changed` event pe saaf.
6. **Redis me sirf:** session ke revoke marks (SR-029), rate limit ki ginti (SR-008), BullMQ. Koi data cache nahi (SR-070, R-010).
7. **Service worker:** SR-010 ke hisaab se; `/api/*` kabhi cache nahi.

**Kyun:** Render ki 5 GB mahine ki outbound bandwidth (§6 F-1) aur 0.1 CPU me public browsing CDN se bachti hai; India se Singapore ki der (R-012) CDN hit pe nahi lagti.

**Chhode vikalp:** Redis me catalog ka cache (25 MB, restart pe khaali); har jawab bina cache (bandwidth aur CPU); CDN purge pe bharosa (Hobby pe purge ka raasta jaancha nahi; chhote TTL kaafi).

### 2.9 API design aur versioning

1. **REST aur JSON**, path `/api/v1/<service>/<resource>`. Har route ek hi jagah contract me (method, path, input aur output ka zod schema, allowed apps, permission, rate limit class, idempotency, step-up D-185, public cache, maalik service). Isi se validation, gateway ka route manifest (SR-032, SR-035), typed client aur query keys.
2. **Ek screen = ek ya do calls:** maalik service apne read model se screen ka jawab de (jaise order page me parcel ki halat aur invoice numbers commerce ki copy se), taaki India se Singapore ki der (R-012) aur bandwidth kam.
3. **Pagination cursor se**, page 100 tak (SR-007); jawab ka size misaal 100 KB tak.
4. **Versioning:** v1 me sirf jodna; tootne wala badlav naye version ke path pe, purana kuch samay saath (misaal 30 din) `Deprecation` aur `Sunset` header ke saath.
5. **App ka version:** har app `X-App-Version` bheje; gateway pe har app ka kam se kam version setting me; purana ho to 426 aur saaf sandesh. Delivery PWA (D-042) ka offline data purane version ka ho sakta hai, isliye sync API pichhla version bhi maane.
6. **Delivery app ka sync:** batch route (misaal 50 kaam tak), har kaam ka client ka UUIDv7 id idempotency key, har kaam ka alag nateeja; device ka samay `deviceAt`, server ka `serverAt` (SR-055); photos alag upload, sync me sirf `assetId`. Delivery code ka milaan sirf online (SR-054; §10 point 4).
7. **Live halat:** in-app ke liye polling (misaal har 60 second, tab dikhe tab) aur browser push (D-126, D-141). Delivery pe UPI ke 10 minute (D-109) me order page misaal har 5 second.
8. **Webhooks:** Razorpay webhook seedha Render ke URL pe (SR-002 ki bina secret wali tay list me, signature ke saath, SR-049); soya server pehli koshish pe der se jaagta hai, to Razorpay ki dobara koshish pe bharosa, aur roz ka milaan M1 chhoota event pakde (F-9).

**Chhode vikalp:** GraphQL (koi tay zaroorat nahi, aur route manifest aur permissions har field pe mehnge); tRPC (contracts ka faayda deta hai par REST manifest aur public cache ke saath fit kam); WebSockets ya SSE (khula connection server ko sone nahi deta, R-008, aur 512 MB me connections; koi tay zaroorat sub-second ki nahi).

### 2.10 Error handling: format, retries, idempotency

1. **Error ka ek roop:** `{"error": {"code": "STOCK_UNAVAILABLE", "message": "...", "details": [...], "requestId": "..."}}`. `code` sthir aur bade aksharon me (common codes ke alawa module ka prefix, jaise `COMMERCE_STOCK_UNAVAILABLE`); `message` user ke liye saada; stack kabhi nahi (SR-077).
2. **Status:** 400 validation (SR-036), 401, 403 (permission), 404 (scope ke bahar, SR-032), 409 (halat ka takrav, ya wahi idempotency key chal rahi, SR-045), 413 (SR-007), 422 (business niyam, ya key alag body ke saath, SR-045), 426 (app purana), 429 `Retry-After` ke saath (SR-008), 503 `Retry-After` ke saath (fail-closed, server ki seema, keys nahi, SR-031).
3. **Idempotency key** in routes pe zaroori: place order (SR-045), payment retry, refund aur daawe ka faisla, payout manzoori, receiving aur scans, delivery attempt aur saboot, offline sync, upload ka jodna, export. Key + route + caller; wahi body pe pehla jawab; 2xx aur 4xx yaad, 5xx nahi; record misaal 48 ghante maalik service ke DB me.
4. **Client ke retries:** GET aur idempotency key wale routes pe hi, network ya 503 pe, backoff aur `Retry-After` ke saath, misaal 2 baar; baaki mutation pe apne aap retry nahi.
5. **Server se provider:** har call pe timeout (misaal payment 10 s, email 10 s, push 5 s); retry sirf job queue se, request ke andar nahi; provider ka idempotency (refund) jahan mile wahan (§6 F-9).
6. **Fail-closed aur fail-open:** SR-008 ke hisaab se; Redis na mile to sign-in, codes, payment shuru, review, report, daawa 503; padhna process ki chhoti seema ke saath chalta rahe.

**Chhode vikalp:** RFC 9457 problem details (`type` ke liye apna URL chahiye, domain nahi, D-028); circuit breaker (ek process, timeouts aur queue retries kaafi; koi tay zaroorat nahi).

### 2.11 Observability

1. **Logs:** structured JSON stdout pe (Render), SR-077 ke fields; route ka template (raw URL aur query nahi, taaki search ke shabd aur ids logs me na jaayein); request id gateway pe bane aur jawab, facade calls, events (`correlationId`), audit aur error me jaaye.
2. **180 din ka apna store (D-250 niyam 5, CL-106):** request logs aur security events. Logs ki lines misaal har 60 second ya 1,000 lines pe gzip ki ek chunk me (ek document = ek chunk), taaki jagah aur ops dono kam (A-3). Security events audit service me 1 saal (D-194).
3. **Kabhi log nahi:** SR-077 ki list, saath me private media ke signed URLs, idempotency keys, event ka poora `data`, search ka text.
4. **Ops snapshot** har 60 second (jaage hue): RSS, heap, event loop ki der, chalte requests, har queue ki gehrai, sabse purane outbox event ki umar, dead letters, Redis ki memory aur connections, DB pool ka intezaar. Roz ka saar logs store me (R-007 ka naap, R-024).
5. **Health:** `/health` sirf process aur event loop (DB nahi, SR-007, D-057); `/ready` Mongo clusters, Redis, dispatcher aur ticker (finance nahi); Render ka health check `/health`.
6. **Alerts** Master ke ops inbox aur push me; email sirf gambhir (SR-078 ki line). Misaal: RSS 400 MB se upar; event loop der 500 ms se upar 1 minute; 5xx 5 minute me 2% se upar; outbox ka sabse purana event 60 s se upar; dead letter 0 se upar; Redis 15 MB (60%) se upar; kisi cluster ki jagah 70% aur 85%; Neon ke CU-ghante mahine ke 70%; email din ka 80% (D-142); audit chain toota aur milaan ka farak (SR-078).
7. **Hafte ka haath ka dekhna** (provider API ke bina): Render ki bandwidth aur ghante, Neon ke CU-ghante, Atlas ki jagah (OPERATIONS ke liye, DevOps).
8. **Errors:** A-4 ke jawab se.
9. **Ghadi (CL-106):** server ka samay provider ki time service se; har record me server ka UTC samay; client ka samay sirf `deviceAt` ke roop me.

**Chhode vikalp:** Prometheus, Grafana ya tracing backend (₹0 pe koi host tay nahi, D-056; snapshot line kaafi); sampled request logs (CERT-In saare logs maangta hai, CL-106); Render ke apne logs pe bharosa (umar jaanchi nahi, §6 F-2).

### 2.12 Scale targets aur free tier ki capacity

**Do alag cheezein:** (1) **design target** jis pe code, indexes aur tests bante hain (D-012, A-1); (2) **₹0 pe asli chalne ki seema**, jo saaf numbers me likhi jaaye (D-028, D-053).

**₹0 pe seema (misaal; naap ke pakka):**

| Seema                     | Number                                                                                                                          | Matlab                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Render CPU                | 0.1 CPU (§6 F-1: is run me dobara nahi jaancha)                                                                                 | Lagbhag 5 requests/second lagataar (misaal); password se sign-in ~2/second (argon2id, SR-013, SR-007) |
| Render RAM                | 512 MB (D-049)                                                                                                                  | Neeche memory budget                                                                                  |
| Render outbound bandwidth | 5 GB/mahina (jaancha 2026-11-20); bina payment method khatam = saari free services mahine ke ant tak band                       | ~170 MB din; ~10 KB ka jawab ho to ~17,000 bina CDN ke jawab din me                                   |
| Render ghante             | 750/mahina (R-008)                                                                                                              | Raat soye                                                                                             |
| Atlas har cluster         | 0.5 GB (bina compression BSON + indexes), 100 ops/second, 10 GB in aur 10 GB out 7 din me, 500 connections (jaancha 2026-11-20) | Neeche per-order hisaab                                                                               |
| Neon                      | 100 CU-ghante/mahina, 0.25 CU (D-057, R-014)                                                                                    | Finance ke batch (A-6)                                                                                |
| Redis                     | 25 MB, 50 connections (D-051)                                                                                                   | §2.5 aur §2.8 ke niyam                                                                                |
| Emails                    | 300/din, OTP ke 60 pakke, "baaki" 120 (D-142)                                                                                   | Lagbhag **100 orders/din** se upar confirmation aur invoice ke emails agle din pe khisakte            |

**Ek order ka data (misaal):** commerce ~6 KB, logistics ~3 KB, finance ~8 KB (journal lines aur documents), notify ~3 KB, payments ~2 KB, aur audit me staff ke scans (SR-076: staff ka har likhne wala kaam) misaal 10 entries × ~1.2 KB = ~12 KB. 0.5 GB ka 80% istemaal karein to: commerce ~65,000 orders, finance (Neon) ~50,000 orders, aur audit (bina compression) sirf ~33,000 orders, yaani 2 saal (D-194) me ~45 orders/din. Isliye audit ke purane din compressed chunks me (AB-7.4): JSON 5 se 8 guna dabta hai, to 2 saal me ~250 orders/din tak.

**Memory budget (R-007, misaal; code banne pe Docker me 512 MB aur 0.1 CPU ki seema pe naap ke pakka):**

| Hissa                                             | Aam (MB) | Sabse zyada (MB)                        | Pehra                                                          |
| ------------------------------------------------- | -------- | --------------------------------------- | -------------------------------------------------------------- |
| Node, V8 aur gateway + 11 services ka code        | 120      | 130                                     | Compiled JS, ek process                                        |
| JS heap ka kaam (requests, process cache ≤ 20 MB) | 60       | 100                                     | `--max-old-space-size` misaal 256                              |
| DB clients (10 Atlas clusters, Neon lazy)         | 15       | 20                                      | Har Atlas client ka pool misaal 3, Neon ka 2                   |
| Redis aur BullMQ clients (≤ 20 connections)       | 5        | 8                                       |                                                                |
| Password hash (argon2id 19 MiB × 2)               | 0        | 40                                      | Ek waqt me 2, baaki line me (SR-007)                           |
| PDF (ek waqt me 1)                                | 0        | 30                                      | `heavy` queue concurrency 1                                    |
| Export aur import (stream)                        | 0        | 15                                      | Cursor + stream, poora buffer nahi                             |
| Image ka dobara encode (sirf agar server pe)      | 0        | 80                                      | Concurrency 1, pixels ki seema                                 |
| **Kul**                                           | **~200** | **~345 (image ke bina) / ~425 (saath)** | Alarm 400 MB RSS; 450 pe heavy queue ruke aur upload jodna 503 |

**Nateeja:** 512 MB me saari services chal sakti hain **agar** images ka dobara encode provider pe ho (A-2); server pe ho to sabse bure pal me jagah ~85 MB bachti hai, jo bahut kam hai. D-049 dobara kholne ka gate: optimizations ke baad bhi aam RSS 400 MB se upar, ya hafte me ek se zyada OOM restart (AB-8.6).

**Performance targets (D-053: sirf jaage server pe, misaal):** CDN hit p95 300 ms; bina CDN padhna p95 800 ms; place order p95 2 s; password sign-in p95 3 s; webhook se order confirm p95 10 s; event delivery p95 5 s; cold start 90 s tak (D-028 ka ~1 minute).

### 2.13 11 apps backend se kaise baat karte hain

1. Har app ka apna Vercel project aur host (D-010, D-048); `/api/*` gateway pe rewrite, ek hi template se (SR-002); app ki pehchaan forwarded host se (Vercel ka header; jaanchna baaki, OPEN_QUESTIONS §2), aur token ka `aud` app (SR-031, SR-035).
2. Bundle mode me gateway aur saari services ek Express app me: gateway ke middleware (session, rate limit, CSRF SR-030, manifest) ke baad seedha maalik service ka router; koi localhost HTTP hop nahi (0.1 CPU). Split mode me gateway HTTP se aage bhejta hai, actor ka context signed (SR-071).
3. Har app ek saajhe typed client se (contracts se bana), TanStack Query ke saath; custom header (SR-030) aur `X-App-Version` (§2.9) client khud lagata hai.
4. **Jaagna (D-028):** app khulte hi app-shell `/wake` ko seedha Render pe bulata hai aur jawab tak "server jaag raha hai" dikhata hai; jawab se pehle koi API call nahi. Soye Render ko Vercel ke rewrite ki request shayad na jagaye (§6 F-5); isliye seedha. CSP me iska apvaad (§10 point 7).
5. **R1 me server-side rendering nahi** (A-8): saare apps SPA; Vercel pe koi function nahi, to D-058 ka "customer app ke server-side hisse ka region" sawal hi nahi rehta.
6. Delivery PWA: offline hissa SR-023 aur SR-010 ke hisaab se; sync §2.9 niyam 6.

## 3. Owner ke sawal

**Kisi khule sawal pe tike nahi (ek saath poochh sakte hain, 7):** A-1, A-2, A-4, A-5, A-6, A-7, A-8.
**Jude group (1 group, 2 sawal):** G-1: A-2 (media ki jagah) + A-3 (logs ki jagah): A-3 ka vikalp (c) A-2 ke provider pe tika.
**Ginti:** 8 sawal; R1 ke 8 (A-1 ka asar poore design pe).

### A-1. Design ka scale target kitna maanein?

- **Sawal:** code, indexes aur load tests kis scale ke liye banein: kitne customers, kitne orders din me, kitne sellers aur variants?
- **Kyun zaroori:** design asli users maan ke (D-012), par "kitne" kahin likha nahi. Isse tay hota hai ki kaun se indexes, archive, pagination aur load tests chahiye. ₹0 pe asli seema alag hai (§2.12: ~100 orders/din emails se, ~5 requests/second CPU se); target sirf code aur tests ke liye hai.
- **Vikalp:**
  - **(a) Chhota:** 10,000 customers, 100 orders/din (sale ke din 3 guna), 50 sellers, 5,000 variants, 20 staff.
  - **(b) Madhyam:** 1 lakh customers, 1,000 orders/din (sale ke din 5 guna), 500 sellers, 50,000 variants, 100 staff, 50 delivery partners.
  - **(c) Bada:** 10 lakh customers, 10,000 orders/din, 5,000 sellers, 5 lakh variants.
- **Salah:** **(b)**. Asli marketplace ki shuruaat jaisa; MongoDB aur PostgreSQL ke ek-ek server pe aaram se fit, to code me sharding ya alag search cluster jaisa bojh nahi; laptop pe Docker me load test ho sakta hai.
- **Trade-off:** (a) me code jaldi par "asli jaisa" kamzor (bade din pe kya toote, pata nahi); (b) me har list ka pagination, har query ka index, data ka archive aur 5 guna peak ka load test; (c) me sharding, alag search aur queue ka dhaancha, ek insaan ke 30 ghante (D-009) pe bahut bhaari.
- **R1 ya baad me:** R1 (poore design pe).
- **Kis par tika:** kisi pe nahi.

### A-2. Photos, dastavez aur video kahan rakhein?

- **Sawal:** product images, review aur daawe ki photos, delivery ka saboot, KYC dastavez, PDFs aur exports kis provider pe hon?
- **Kyun zaroori:** files database me nahi (D-155 asar, R-006). Har image ka dobara encode aur EXIF hatana zaroori (SR-061); ye server pe ho to 512 MB me jagah bahut kam bachti hai (§2.12) aur 0.1 CPU pe ek photo kai second leti hai. Private files ko chhote signed URL chahiye (SR-062). Provider ek naya data processor hai (CL-104) aur data ki jagah privacy page pe (CL-107).
- **Vikalp:**
  - **(a) Managed media service (misaal Cloudinary free):** upload seedha; dobara encode aur EXIF hatana provider pe; public images CDN se; private files chhote URL se; video bhi.
  - **(b) S3 jaisa object storage (misaal Backblaze B2 ya Cloudflare R2 ka free hissa):** upload seedha; dobara encode server pe ek-ek karke; delivery apne signed URL se.
  - **(c) Dono:** public aur review images (a) pe; private dastavez, kanooni rok ki files aur logs ki files (b) pe.
- **Salah:** **(a)**, is shart ke saath ki §6 ki jaanch (F-6) paas ho: private file ka samay wala URL free plan pe chale, rakhi hui copy me EXIF na rahe, aur file types aur size ki rok lage. Jaanch fail ho to **(c)**.
- **Trade-off:** (a) me ek processor aur ek account, server pe image ka koi kaam nahi, par free credits (storage, bandwidth aur transformations ek saath) khatam ho sakte hain aur data shayad India ke bahar; (b) me storage zyada muft, par server pe CPU aur memory ka bojh (R-007) aur dobara encode ki photo ka upload Render ki 5 GB me ginta hai; card maang sakta hai (jaancha nahi); (c) me dono ke faayde, par do accounts, do keys aur do processors.
- **R1 ya baad me:** R1 (product images, review photo D-155, delivery saboot D-072, daawe D-106).
- **Kis par tika:** kisi pe nahi. Group G-1.

### A-3. 180 din ke request logs kahan rakhein?

- **Sawal:** CERT-In ke 180 din (aur lagbhag 13 May 2027 se 1 saal) ke request logs (D-250 niyam 5, CL-106) kis store me hon?
- **Kyun zaroori:** Render ke apne logs ki umar pakki nahi (§6 F-2). Owner akela bhi din me hazaaron requests banata hai (apps ki polling, jagane ke pings). Log ki ek line ~350 bytes; bina dabaaye 0.5 GB me 180 din ke liye sirf ~5,000 requests/din. Gzip ke chunks me ek line ~40 bytes.
- **Vikalp:**
  - **(a) Audit ke cluster me** gzip chunks (misaal har minute ek document): naya kuch nahi, par audit ke 2 saal (D-194) aur security events ke saath 0.5 GB baantna; logs ko misaal 150 MB, yaani 1 saal ke liye ~10,000 requests/din.
  - **(b) Alag chhoti "logs" service, apna Atlas cluster**, wahi gzip chunks: 0.5 GB sirf logs ke liye, yaani 180 din ke liye ~60,000 requests/din, 1 saal ke liye ~30,000.
  - **(c) Media provider ki private files** me roz ki gzip files: sabse zyada jagah, par provider ke credits aur Render ki bandwidth (upload) me ginti; incident me file download karke dekhna.
- **Salah:** **(b)**. ₹0, naya processor nahi (Atlas pehle se), audit se alag (logs me IP jaisa personal data, audit ka chain alag), aur jhagde ya incident me samay ke hisaab se seedhi query.
- **Trade-off:** (a) sabse kam kaam, par audit aur logs ek doosre ki jagah khaate; (b) ek aur Atlas project aur DB user (D-011 jaisa), process me ek aur DB client (~1 MB); (c) jagah zyada, par query mushkil aur A-2 ke provider pe nirbhar.
- **R1 ya baad me:** R1 (D-055 me 180 din ke logs R1 ka jod).
- **Kis par tika:** A-2 (sirf vikalp c ke liye). Group G-1.

### A-4. Errors ka pata kaise chale?

- **Sawal:** server aur 11 apps ki errors owner tak kaise pahunchein?
- **Kyun zaroori:** free tier pe logs aur alerts seemit (R-024). Apps ki errors browser me hoti hain; bina intezaam ke wo kabhi nahi dikhtin. Bahar ki service naya processor hai (CL-104), data bahar jaata hai, aur page pe bahar ki script ki rok hai (SR-006).
- **Vikalp:**
  - **(a) Apna chhota intezaam:** server ki errors logs me fingerprint ke saath; apps ki errors ek rate-limited route pe (bina personal data, size ki seema); Master ke ops inbox me nayi error pe khabar aur roz ka saar.
  - **(b) Bahar ki error service ka free plan (misaal Sentry):** stack, source maps, grouping tayyar; scrubbing ka config; CSP me uska host.
  - **(c) Sirf logs:** koi khabar nahi; owner khud logs dekhe.
- **Salah:** **(a)**. D-157 aur SR-006 ki soch se mel (data bahar nahi, page pe bahar ka kuch nahi), naya account nahi, aur logs store (A-3) pehle se ban raha hai.
- **Trade-off:** (a) me thoda apna code aur grouping ki kam suvidha; (b) me tayyar tool, par free quota poore organization ka saajha, data bahar, ek aur processor aur privacy page pe ek aur naam; (c) me koi kaam nahi, par toota flow din tak chhupa reh sakta hai.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### A-5. Emails kis provider se jaayein?

- **Sawal:** OTP aur baaki emails kis email provider ke HTTPS API se jaayein?
- **Kyun zaroori:** din ke 300 emails (D-028) aur domain nahi (R-005) ka niyam provider pe tika. Render free pe SMTP ke ports band (jaancha 2026-11-20, §6 F-1), to sirf HTTPS API. Provider processor hai (CL-104) aur bheje emails ki copy uske dashboard me reh sakti hai (OPEN_QUESTIONS §2).
- **Vikalp:**
  - **(a) Brevo free:** din ke 300, bina domain ek verified sender, HTTPS API.
  - **(b) Mailjet free:** kam din ki seema (misaal 200; jaancha nahi), bina domain sender.
  - **(c) Owner ke Gmail account ka API:** owner ke personal account ke niyam aur seema ka jokhim; account band hua to emails band.
- **Salah:** **(a)**. D-028 ka 300 aur D-142 ki chhat isi number pe bani hain; domain ke bina bhej sakta hai (jaanchna baaki, F-8).
- **Trade-off:** (a) me spam ka jokhim waisa hi (R-005); (b) me din ki chhat kam, D-142 ke numbers badalne padenge; (c) me personal account ka jokhim aur seema saaf nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### A-6. Seller ke hisaab me nayi bikri kitni der me dikhe?

- **Sawal:** payment, return aur refund ke events finance (Neon) me kitni der me pahunchein?
- **Kyun zaroori:** Neon ke 100 CU-ghante mahine me (R-014). Compute har query ke baad misaal 5 minute jaaga rehta hai. Har event pe turant likhein to din ke 12 ghante compute jaaga, yaani ~90 CU-ghante mahine me, aur mahine ke ant me finance band. Pack pe invoice har haal me turant (sync) jaari hota hai.
- **Vikalp:**
  - **(a) Har 15 minute (misaal) ka batch**, sirf jab kuch pending ho: ~30 se 45 CU-ghante mahine me.
  - **(b) Turant (har event pe):** ~90 CU-ghante, seema ke bahut paas.
  - **(c) Har ghante ka batch:** ~10 CU-ghante, par seller ka statement ghante bhar purana.
- **Salah:** **(a)**.
- **Trade-off:** (a) me seller aur Finance app me nayi bikri 15 minute tak der se; (b) sabse taaza, par mahine ke beech finance band hone ka asli jokhim (aur tab pack pe invoice bhi nahi, PR-1); (c) sabse kam kharch, par der zyada.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### A-7. Invoice ke email me PDF attach ho ya nahi?

- **Sawal:** customer ko invoice ke email (D-126 niyam 2) me PDF file jaaye, ya sirf invoice ka saar aur "app me dekhein"?
- **Kyun zaroori:** D-126 ne invoice ka email "paise ka record" maana, par attachment tay nahi. Har PDF server pe banta hai (0.1 CPU, memory), Render ki 5 GB bandwidth me ginta hai (300 emails × ~50 KB = ~15 MB din), aur email provider ke dashboard me copy reh sakti hai (₹50,000 se upar pe naam aur pata, D-226). Asli invoice parcel ke andar hai (D-077).
- **Vikalp:**
  - **(a) PDF attach:** inbox me poora record.
  - **(b) Saar:** invoice number, tareekh, seller ka naam aur GSTIN, rakam; "Customer app me Orders me download karein", bina link.
  - **(c) Saar + customer app ka link** (sirf apne host ka, SR-012).
- **Salah:** **(b)**. Record (number, tareekh, rakam) email me rehta hai, personal data provider ke paas kam, aur link pe click ki aadat nahi banti (R-017, SR-073 ki soch).
- **Trade-off:** (a) customer ke liye sabse aasaan, par CPU, bandwidth aur privacy ka bojh; (b) me PDF ke liye app kholna padta; (c) aasaan par emails me link (R-017).
- **Kanooni detail:** customer ko invoice ki copy ka roop: Lawyer (ya CA) se nahi jaancha (CL-003, CL-020).
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi pe nahi.

### A-8. Customer app ke public pages server pe ban ke aayein?

- **Sawal:** product aur category pages search engines ke liye server pe render hon (SSR), ya R1 me saare apps saade SPA rahein?
- **Kyun zaroori:** D-058 ne "customer app ke server-side hisse ka Vercel region" technical charcha pe chhoda. SSR ke liye Vercel functions, unka region, cache aur ek aur raasta jo backend tak jaata hai; SPA me ye sab nahi. Abhi site pe account sirf allowlist se (D-133), par dekhna sabke liye.
- **Vikalp:**
  - **(a) R1 me sirf SPA:** koi server-side rendering nahi.
  - **(b) Public product aur category pages SSR se**, Vercel functions pe (region Singapore, backend ke paas).
  - **(c) Build pe static pages:** catalog badalne pe dobara build.
- **Salah:** **(a)**. Koi tay zaroorat search engine ki nahi; sabse kam hisse aur ₹0 me sabse surakshit; asli business pe dobara dekhein.
- **Trade-off:** (a) me search engines me kam dikhna aur pehla page thoda der se; (b) me SEO aur tez pehla page, par functions ka kharcha aur limits, ek aur jagah logs aur secrets, aur CSP ka kaam; (c) me catalog ka har badlav deploy maangta (D-037 ki soch se ulta, aur Render ki build minutes).
- **R1 ya baad me:** R1 me (a); (b) asli business ke waqt.
- **Kis par tika:** kisi pe nahi.

## 4. ARCHITECTURE.md ke liye prastaavit batches

8 batches, har ek ek owner haan. Har niyam ek ya do vakya; "misaal" wale number settings me. Kuch niyam owner ke jawab pe tike hain, wahan jawab ka number ya naam bharna hai: AB-1 ka niyam 1 (logs service) A-3 pe; AB-6 ka niyam 3 A-2 pe; AB-7 ke niyam 2 aur 5 A-3 aur A-4 pe; AB-3 ka niyam 7 A-6 pe; AB-4 ka niyam 13 A-8 pe; AB-8 ka niyam 1 A-1 pe.

### AB-1. Services aur data ki seema

1. Backend ki services: gateway (koi database nahi), identity, notify, payments, catalog, commerce, logistics, finance, support, audit, media aur logs. Har data wali service ka apna database, apna DB user aur apna cluster (D-011, D-050); finance PostgreSQL pe (D-001, D-057).
2. Har cheez ka ek maalik service: §2.2 ki table. Doosri service ka database koi nahi padhta; zaroori copy sirf events se (D-011, SR-068).
3. Stock, reservation aur order commerce me ek transaction me (D-118, SR-045). Serviceability ki jaanch order ke transaction me commerce ki apni pincode-hub aur area ki copy pe (D-016 niyam 9).
4. Invoice, credit note aur fees ke documents finance jaari karta hai, number usi PostgreSQL transaction me (§1.7); pack scan pe commerce finance ko idempotent sync call karta hai (parcel aur seller ki key se).
5. Files ka record aur provider ki chaabi sirf media me; baaki data me sirf `assetId` (SR-062, SR-071).
6. Settings aur kill switches maalik service ke paas (SR-009, SR-043); Master app har maalik ki settings API bulata hai.
7. Sync calls sirf §2.3 ki list wali; unka graph bina chakkar ke, aur dependency rule CI me jaanche (SR-071). Finance kisi tez padhne wale raaste me nahi (R-014).
8. Bundle mode me saari services ek Express app me, gateway ke middleware ke baad seedha maalik ka router; split mode me gateway HTTP se aur andar ki calls signed (D-049, SR-071). Dono mode me ek hi facade, sirf transport alag.
9. Har service ka config apne namespace me, aur service sirf apna namespace padhe (SR-071).

### AB-2. Events aur messaging

1. Har badlav ka event usi transaction me producer ke outbox me; jawab commit ke baad (D-011).
2. Har producer ka dispatcher har subscriber ko alag deliver kare: bundle mode me process ke andar, split mode me signed HTTP; delivery ka haal outbox me (SR-071, R-010).
3. Commit ke baad nudge se turant delivery; fallback poll misaal har 5 second.
4. Consumer apna asar aur `processed_events` ek transaction me likhe; delivery kam se kam ek baar, asar ek baar.
5. Ek subscriber ke liye ek aggregate ke events kram se; fail hua event usi aggregate ke agle events rokta hai, baaki nahi.
6. Retry backoff ke saath misaal 8 baar; phir consumer ke DB me dead letter aur ops alert; dobara chalana Master app se, permission ke saath.
7. Envelope: `eventId`, `type` (`<service>.<aggregate>.<pastTense>`), `version`, `occurredAt`, `producer`, `aggregate`, `actor`, `correlationId`, `causationId`, `data`; zod se jaanch; galat producer ka event reject (SR-071).
8. Event me OTP, delivery code, password, token, bank, PAN, poora address ya koi secret kabhi nahi; jise chahiye wo maalik se facade se le (SR-015, SR-054, SR-063, SR-077).
9. Naya field jodna theek; tootne wala badlav naya `version`, aur consumer pichhla version bhi samjhe.
10. Staff ka har likhne wala aur mana hua kaam usi transaction me audit event likhe; audit service use hash chain me jode (SR-076).
11. Delivered outbox events misaal 7 din baad, `processed_events` misaal 14 din baad TTL se hatein.

### AB-3. Background jobs aur samay

1. Har samay wala kaam maalik service ke DB me due date ke saath; process ka ticker misaal har 60 second lease ke saath uthaye; boot ke misaal 30 second baad poora sweep (R-002, R-010).
2. BullMQ sirf kaam chalane ke liye; kaam ka record DB me, job id record ka id; Redis khaali ho to ticker pending kaam dobara daale (D-001, R-010).
3. Har service ki ek halki queue (concurrency 2) aur process ki ek `heavy` queue (PDF, export, import, media; concurrency 1); Redis connections ek instance pe misaal 20 tak (D-051, R-007).
4. Dispatcher, ticker aur har schedule DB lease ke peeche; har handler dobara chalne pe surakshit (deploy ke waqt do instance).
5. "Din" IST ka calendar din; timestamps UTC (D-142, CL-106).
6. Roz ka kaam aakhri poora din yaad rakhe aur jaagne pe har chhoota din kram se banaye (D-149).
7. Finance ke events misaal har 15 minute ke batch me, sirf jab pending ho; health, wake aur ready finance tak nahi; Neon ka compute 0.25 CU pe ruka (D-057, R-014).
8. Chhote kanooni ya suraksha samay wale kaam (turant chhupna, alert) usi request me jo unhe shuru kare, job me nahi (D-248, D-251).
9. §2.5 ki jobs ki table module design ka shuruaati saar; har naya timer usi table me judta hai.

### AB-4. API aur apps se baat

1. REST aur JSON, path `/api/v1/<service>/<resource>`; har route contract me ek baar (schemas, apps, permission, rate limit, idempotency, step-up, public cache, maalik); isi se validation, gateway manifest aur typed client (SR-032, SR-035, SR-036).
2. Ek screen ke liye ek ya do calls; maalik service apne read model se jawab de (R-012).
3. Pagination cursor se, page 100 tak; jawab misaal 100 KB tak (SR-007).
4. v1 me sirf jodna; tootne wala badlav naye path pe, purana misaal 30 din `Deprecation` aur `Sunset` ke saath.
5. Har app `X-App-Version` bheje; har app ka kam se kam version setting me; purana ho to 426 aur saaf sandesh (D-042).
6. Delivery app ka sync batch route: har kaam ka UUIDv7 id idempotency key, alag nateeja, `deviceAt` aur `serverAt`; photos alag upload (SR-023, SR-055).
7. Live halat polling se (misaal 60 second, tab dikhe tab; delivery pe UPI ke waqt 5 second) aur browser push; khule connection (WebSocket, SSE) nahi (R-008).
8. Error ka roop `{"error": {"code", "message", "details", "requestId"}}`; status codes §2.10 ki list se; stack kabhi nahi (SR-077).
9. Idempotency key §2.10 ki list wale routes pe zaroori; key + route + caller; 2xx aur 4xx yaad, 5xx nahi; record misaal 48 ghante (SR-045).
10. Client sirf GET aur idempotency wale routes ko retry kare, misaal 2 baar, `Retry-After` maan ke.
11. Provider calls pe timeout (misaal payment 10 s, email 10 s, push 5 s); retry sirf job se.
12. App khulte hi app-shell `/wake` seedha backend pe bulaye aur jawab tak koi API call nahi (D-028); Razorpay webhook bhi seedha backend pe (SR-002, SR-049).
13. R1 me saare apps SPA; koi server-side rendering nahi.

### AB-5. Search aur caching

1. Storefront search catalog ke cluster pe Atlas Search se, `search_documents` read model pe, jo catalog aur commerce ke events se bane (D-138).
2. Free cluster pe 3 indexes: storefront, Admin ka catalog search, ek khaali; definition code me, release step se (D-138).
3. Kram: text score, phir rating (kam se kam misaal 5 reviews), 30 din ki bikri, stock; out-of-stock sabse neeche; seller ka koi boost field nahi (D-139, D-153).
4. Synonyms staff ki setting wali collection se, bina deploy; spelling ke liye fuzzy aur autocomplete (D-152).
5. Zero result ke shabd ki din ki ginti bina user id ke; search ka jawab CDN pe cache nahi (D-152, D-157).
6. Search text 100 characters, regex escape, IP pe rate limit (SR-007, SR-008, SR-069).
7. CDN pe public cache sirf "public cacheable" routes pe: product ka content misaal 300 second, availability (daam, agle batch ka MRP aur expiry, stock ki halat) misaal 30 second; kabhi `Set-Cookie` nahi (SR-004).
8. Cart, checkout, Pro daam aur signed-in jawab `private, no-store`; checkout pe daam server pe dobara (SR-004, SR-042, SR-044).
9. Polling routes pe ETag aur `304`.
10. Process ke andar cache sirf kam badalne wali config ka, kul misaal 20 MB, maalik ke event pe saaf; Redis me koi data cache nahi (SR-070, R-010).

### AB-6. Media aur files

1. Upload: maalik service authorize kare, media chhota signed URL de (misaal 10 minute, exact type aur size), file seedha provider pe, phir maalik `assetId` jode; backend ke raaste file kabhi nahi (SR-061, SR-007).
2. Har file ka record media me: maalik service aur record, maqsad, public ya private, type, size, hash, halat, retention ki tareekh (SR-062, SR-055).
3. Type bytes se; har image ka dobara encode aur EXIF hatana, jahan ho sake provider pe; server pe ho to `heavy` queue, concurrency 1, pixels ki seema (SR-061, SR-071, R-007).
4. Private file: maalik authorize kare, media misaal 5 minute ka URL de; PDF attachment ke roop me; app ke origin se kabhi nahi (SR-062).
5. Har maqsad ka samay maalik ke "maamla band" se; roz ka job mitaye; lagbhag 13 May 2027 se delivery aur daawon ki photos aur video encrypted band jagah me capture se 1 saal (D-191, D-192, D-193, D-262).
6. Ek file ek maalik; doosri jagah chahiye to nayi copy. Jis product ka order hua uski images archive ke saath rahein.
7. PDF ek halki library se, ek waqt me 1; headless browser nahi. Jaari document ka PDF uske badle na jaane wale data aur template ke version se; template naye version se hi badalta hai (D-225).
8. Export DB cursor se stream, file private jagah pe, ek baar ka chhota link (D-144, SR-075).
9. Roz: 24 ghante se purane bina jude uploads aur atke deletes saaf; hafte: provider ki list se milaan.

### AB-7. Observability

1. Logs structured JSON; request pe SR-077 ke fields; route ka template, raw URL nahi; request id har jawab, facade call, event, audit aur error me.
2. Request logs aur security events apne store me kam se kam 180 din, lagbhag 13 May 2027 se 1 saal; logs gzip chunks me (misaal har 60 second ya 1,000 lines) (D-250 niyam 5, CL-106).
3. Kabhi log nahi: SR-077 ki list, signed URLs, idempotency keys, event ka `data`, search ka text.
4. Audit ke misaal 30 din se purane din ek compressed, hash se band chunk me, usi chain ke saath; jaanch job chunk pe bhi (SR-076, D-194, R-006).
5. Server ki errors fingerprint ke saath; apps ki errors ek rate-limited route se, bina personal data; nayi error ki khabar Master ke ops inbox me (R-024).
6. Ops snapshot har 60 second: RSS, heap, event loop ki der, queues, outbox ki umar, dead letters, Redis, DB pool; roz ka saar logs store me (R-007).
7. `/health` sirf process; `/ready` Atlas, Redis, dispatcher aur ticker, finance nahi; Render ka health check `/health` (SR-007, D-057).
8. Alerts ops inbox aur push me, email sirf gambhir; misaal thresholds §2.11 niyam 6 (SR-078).
9. Har record me server ka UTC samay provider ki time service se; client ka samay sirf `deviceAt` (CL-106, SR-055).

### AB-8. Scale aur capacity

1. Design target: [A-1 ka jawab]; har list ka pagination, har query ka index, aur sale ke din ke peak ka load test laptop pe.
2. ₹0 pe chalne ki seema §2.12 ki table jaisi saaf likhi rahe; numbers naap ke badlein.
3. Memory budget §2.12 jaisa; `--max-old-space-size` misaal 256; argon2id ek waqt me 2; PDF aur heavy kaam ek waqt me 1; har Atlas client ka pool misaal 3, Neon ka 2.
4. RSS 400 MB pe alert; 450 MB pe heavy queue ruke aur upload jodna 503, jab tak memory neeche na aaye.
5. Har cluster ki jagah ka roz ka naap; 70% pe chetavni, 85% pe owner ko alert; har collection pe TTL ya archive ka niyam module design me (R-006).
6. R1 se pehle Docker me 512 MB aur 0.1 CPU ki seema pe bundle mode ka naap (sign-ins, place order, PDF, 50,000 rows ka export, import ek saath); aam RSS 400 MB se upar, ya live pe hafte me ek se zyada OOM restart ho to D-049 dobara khule.
7. Render ki bandwidth, ghante aur Neon ke CU-ghante har hafte dekhe jaayein; 70% pe owner ka kaam (bandwidth ke liye CDN cache aur polling kam).
8. Har Atlas cluster se kam se kam 30 din me ek connection (dispatcher apne aap karta hai); system lambe samay band rahe to clusters ka resume operations ke kram me.

## 5. Prastaavit risks

| Id   | Risk                                                                                                                                                   | Tag          | Asar                                                                                              | Kam karne ka tareeka                                                                                                                             | Status (prastaav) |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| PR-1 | Finance (Neon) band ho (CU-ghante khatam, R-014) to pack pe invoice jaari nahi hota (CL-003, §1.7), yaani maal dispatch nahi hota.                     | Architecture | Mahine ke ant me orders ruk sakte hain.                                                           | Finance ke events batch me (A-6), health aur wake finance tak nahi (D-057), 70% CU-ghante pe alert; invoice ka sync call idempotent.             | Khula             |
| PR-2 | Render Hobby ki 5 GB mahine ki outbound bandwidth (jaancha 2026-11-20); bina payment method khatam hone pe saari free services mahine ke ant tak band. | Operations   | Poora system kai din band.                                                                        | Public routes CDN cache (AB-5.7), ETag aur 304, jawab 100 KB tak, uploads seedha provider pe, invoice ka PDF email me nahi (A-7), hafte ka naap. | Khula             |
| PR-3 | 0.1 CPU (purani jaanch) pe sign-in hash, PDF aur export ek saath: der badhti hai, aur lagataar ~5 requests/second se upar sambhalna mushkil.           | Architecture | Bade pal me sab dheema; asli users ka load ₹0 pe nahi chal sakta.                                 | Hash ki line (SR-007), heavy concurrency 1, CDN cache, seema saaf likhi (AB-8.2); D-053.                                                         | Maana (prastaav)  |
| PR-4 | Free cluster ki 0.5 GB bina compression ke BSON aur indexes pe (jaancha 2026-11-20); audit sabse pehle bharta hai (~45 orders/din pe 2 saal).          | Architecture | Cluster bhara to us service ke writes fail; audit bhara to staff ke kaam ruk sakte (SR-076).      | Audit ke purane din compressed chunks (AB-7.4), har collection ka TTL ya archive, jagah ka roz ka naap aur alert (AB-8.5).                       | Khula             |
| PR-5 | Atlas Search ke free cluster pe 3 indexes aur 3 KB ki definition (jaancha); fuzzy, autocomplete aur function score ka chalna jaancha nahi.             | Architecture | D-138 ke saare filters aur D-139 ka kram ek index me na aaye to app me extra kaam ya kamzor kram. | Compact definition, ek storefront index; laptop ke text adapter jaisa fallback; jaanch F-3, F-4.                                                 | Khula             |
| PR-6 | Atlas free cluster 30 din tak zero connections pe apne aap pause (jaancha 2026-11-20).                                                                 | Operations   | Lambe break ya Render band hone ke baad service ka cluster ruka; haath se resume.                 | Dispatcher har jaag pe har cluster se judta hai (AB-8.8); operations me resume ka kram.                                                          | Khula             |
| PR-7 | Install hue apps ka purana version (khaas kar Delivery ka offline data) naye API se na mile.                                                           | Architecture | Delivery ke offline kaam sync me fail ya atke.                                                    | `X-App-Version` aur 426, sync API pichhla version bhi maane, service worker ka update (AB-4.5, AB-4.6).                                          | Khula             |
| PR-8 | Media provider ke free credits ya quota khatam (A-2).                                                                                                  | Operations   | Uploads aur images ka dikhna band.                                                                | Images ka size aur dobara encode, retention ke jobs, hafte ka naap, 70% pe alert.                                                                | Khula             |

**Maujooda risks me jod:** R-007 me memory budget aur naap ka gate (§2.12, AB-8.6); R-010 ka event wala hissa outbox se band (AB-2.2): Redis ke restart pe sirf queue ke jobs dobara daalne padte hain; R-024 me apna logs store (A-3) aur error intake (A-4).

## 6. Sirf jaanch

| #    | Kya                                                                                                                                                                      | Kyun                        | Haal                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-1  | Render free: CPU, outbound bandwidth, SMTP, shell aur one-off jobs, private network                                                                                      | §2.12, A-5, PR-2, PR-3      | **Jaancha 2026-11-20** ([Render free](https://render.com/docs/free), [outbound bandwidth](https://render.com/docs/outbound-bandwidth)): Hobby me 5 GB/mahina outbound, bina payment method khatam = free services band; service ka khud ka public internet traffic bhi ginta hai; same-region private traffic nahi; SMTP 25, 465, 587 band; shell aur one-off jobs nahi; free service private network se request nahi le sakti. **CPU (0.1) aur RAM is page pe nahi**; 0.1 CPU sirf pehle ki jaanch se.                                   |
| F-2  | Render free ke logs kitne din; deploy ke waqt purana aur naya instance saath (zero-downtime); free pe pre-deploy command                                                 | A-3, AB-3.4                 | Nahi jaancha (docs page pe nahi likha).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| F-3  | Atlas free cluster: storage, ops, transfer, connections, collections, aggregation, pause, Search indexes                                                                 | §2.6, §2.12, PR-4 se PR-6   | **Jaancha 2026-11-20** ([free limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/), [Search compatibility](https://www.mongodb.com/docs/atlas/atlas-search/about/feature-compatibility/)): 0.5 GB bina compression BSON + indexes; 100 ops/second; 10 GB in aur out 7 din; 500 connections; 100 databases, 500 collections; 50 stages, sort memory 32 MB, `allowDiskUse` nahi; 30 din zero connections pe pause; Search: 3 indexes, definition 3 KB, ek synonym mapping, synonyms 10,000 documents, 300 fields. |
| F-4  | Atlas Search free cluster pe fuzzy, autocomplete, facet, sort aur function score                                                                                         | §2.6                        | Aadha: facet aur sort pe tier ki rok nahi likhi (sirf version 7.0+); fuzzy, autocomplete aur function score ka zikr nahi. Operator ke docs se jaanchna.                                                                                                                                                                                                                                                                                                                                                                                   |
| F-5  | Soye Render ko Vercel ke rewrite se aayi request jagati hai ya turant 502 deti hai                                                                                       | §2.13 niyam 4               | Nahi jaancha (pehle ke kaam me ek live jaanch me 502 mila tha; dobara dekhna).                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| F-6  | Cloudinary free: credits aur ek credit kitna, file size ki seema, private ya authenticated file ka samay wala URL, rakhi copy me EXIF, `allowed_formats`, data ka region | A-2                         | Aadha: free plan bina card ke ([FAQ](https://cloudinary.com/documentation/developer_onboarding_faq_free_plan)); credits, size aur private URL ka niyam is page pe nahi.                                                                                                                                                                                                                                                                                                                                                                   |
| F-7  | Backblaze B2 aur Cloudflare R2 ka free hissa: card zaroori ya nahi, presigned upload me exact size aur type ki rok, egress                                               | A-2 (b), (c)                | Nahi jaancha.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| F-8  | Brevo free: din ke 300, bina domain sender, HTTPS API, authorised IPs ki rok (Render ke IPs tay nahi)                                                                    | A-5                         | Nahi jaancha (OPEN_QUESTIONS §2 me email provider ki baaki jaanch pehle se).                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| F-9  | Razorpay: webhook ka timeout aur retry ka kram (soye server pe), refund pe idempotency                                                                                   | §2.9 niyam 8, §2.10 niyam 5 | Nahi jaancha (OPEN_QUESTIONS §2 me pehle se, timeout ka hissa naya).                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| F-10 | Render Key Value free ki maxmemory policy (BullMQ ko `noeviction` chahiye) aur badal sakte hain ya nahi                                                                  | AB-3.2, SR-008              | Nahi jaancha (docs page pe nahi).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| F-11 | Neon free: compute ka 5 minute ka autosuspend badal sakte hain ya nahi, min aur max CU 0.25 pe rukna, storage 0.5 ya 1 GB                                                | A-6, §2.12                  | Nahi jaancha (RISKS §2.3 me 0.5 aur 1 GB ka farak pehle se).                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| F-12 | Vercel Hobby: bahar ke rewrite ka data transfer kis seema me ginta hai, aur forwarded host ka header bharose layak hai ya nahi                                           | §2.13 niyam 1, PR-2         | Nahi jaancha (cache aur secret header ki jaanch OPEN_QUESTIONS §2 me pehle se).                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| F-13 | Render ki machine ki ghadi kis time service se (CL-106 direction (i))                                                                                                    | AB-7.9                      | Nahi jaancha.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| F-14 | Halki PDF library (misaal pdfkit ya pdf-lib) ki memory aur font ke saath size; argon2id ka 0.1 CPU pe samay                                                              | §2.12                       | Nahi jaancha; code ke waqt naap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## 7. Pehle ke kaam se lene layak (D-074)

Kasauti: (1) kisi tay zaroorat ko hal kare, (2) kisi tay faisle se na takraye, (3) naye vakya me likhi ja sake. Teeno "Haan" wali cheezein hi §4 me naye vakya me aayi hain.

| #     | Kya                                                                                                        | Kahan (purana path)                                                                           | Kyun achha                                                                       | Kasauti (1 / 2 / 3)                                                                 | Naye docs me kahan         |
| ----- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| LL-1  | Contracts-first routes: ek declaration se validation, manifest, typed client aur query keys                | `packages-old/shared/contracts/src/routes.ts`, `packages-old/backend/server-kit/src/route.ts` | Route aur permission ka drift namumkin; SR-032 manifest contracts se maangta hai | Haan (SR-032, SR-036) / Haan / Haan                                                 | AB-4.1                     |
| LL-2  | Outbox aur inbox se dedupe, dead letters DB me                                                             | `packages-old/backend/server-queue/src/outbox.ts`, `dead-letters.ts`                          | Event nahi khota, asar ek baar                                                   | Haan (D-011, R-010) / Haan / Haan (delivery ka transport naya: seedha, BullMQ nahi) | AB-2.1 se AB-2.6           |
| LL-3  | Event envelope (type ka naam, version, correlation, causation, 16 KB)                                      | `docs-old/ARCHITECTURE.md` §5.2                                                               | Debug aur jaanch, galat producer ka reject                                       | Haan (SR-071) / Haan / Haan                                                         | AB-2.7                     |
| LL-4  | Dispatcher lease aur "anjaan type ko na chhedo" (deploy overlap ka sabak)                                  | `docs-old/ARCHITECTURE.md` §5.2, `packages-old/backend/server-queue/src/relay.ts`             | Deploy ke waqt do instance hone pe event nahi khota                              | Haan (D-011) / Haan / Haan                                                          | AB-3.4, AB-2.9             |
| LL-5  | Due dates DB me, boot pe sweep, schedules har boot pe dobara                                               | `docs-old/ARCHITECTURE.md` §5.3                                                               | Soye server aur Redis ke restart pe kaam late, khota nahi                        | Haan (R-002, R-010) / Haan / Haan                                                   | AB-3.1, AB-3.2             |
| LL-6  | Idempotency ka vyavhaar (key + route + caller, replay, 422, 409, 5xx yaad nahi)                            | `docs-old/ARCHITECTURE.md` §5.3                                                               | SR-045 ka poora roop                                                             | Haan (SR-045) / Haan / Haan                                                         | AB-4.9                     |
| LL-7  | Error ka roop `{error: {code, message, details, requestId}}` aur code se status                            | `packages-old/backend/server-kit/src/errors.ts`                                               | Ek roop, request id se support                                                   | Haan (SR-077) / Haan / Haan                                                         | AB-4.8                     |
| LL-8  | Files ka registry, halat ka chakkar, cleanup aur provider se milaan, "ek file ek maalik", data me URL nahi | `packages-old/backend/server-storage/src/`, `docs-old/ARCHITECTURE.md` §6.7                   | Provider badle to data nahi badalta; orphan files saaf                           | Haan (SR-062, D-155 asar) / Haan / Haan                                             | AB-6.2, AB-6.6, AB-6.9     |
| LL-9  | Jis product ka order hua wo delete nahi, archive                                                           | `docs-old/ARCHITECTURE.md` §6.7                                                               | Order, return aur invoice ki images bachti hain                                  | Haan (D-077, D-225) / Haan / Haan                                                   | AB-6.6                     |
| LL-10 | Redis ki memory aur connections ka budget (chhote streams, complete pe hatana, kam queues)                 | `docs-old/ARCHITECTURE.md` §6.6                                                               | 25 MB aur 50 connections me fit                                                  | Haan (D-051) / Haan / Haan                                                          | AB-3.3                     |
| LL-11 | `/health` aur `/ready` alag; health DB tak nahi                                                            | `docs-old/ARCHITECTURE.md` §11.1, §14                                                         | Chhoti DB maintenance pe restart nahi; Neon nahi jaagta                          | Haan (SR-007, D-057) / Haan / Haan                                                  | AB-7.7                     |
| LL-12 | App-shell ka jagane ka kram (wake screen, seedha wake route, jawab se pehle koi call nahi)                 | `docs-old/ARCHITECTURE.md` §11.1                                                              | Soye server pe app ke saare calls fail nahi hote                                 | Haan (D-028) / Haan / Haan (F-5 ki jaanch ke saath)                                 | AB-4.12                    |
| LL-13 | Ops snapshot ki log line                                                                                   | `docs-old/ARCHITECTURE.md` §14                                                                | Bina metrics service ke memory aur queues ka naap                                | Haan (R-007, R-024) / Haan / Haan                                                   | AB-7.6                     |
| LL-14 | Ports aur fake adapters (email, storage, payment ka fake aur webhook simulate)                             | `docs-old/ARCHITECTURE.md` §10, `backend-old/notify/src/email/`                               | Laptop, tests aur CI production se kabhi nahi                                    | Haan (D-051, SR-068) / Haan / Haan                                                  | QA aur DevOps ke liye (§8) |
| LL-15 | Architecture ke pehre lint aur dependency rules me                                                         | `configs-old/eslint-config.js`, `.dependency-cruiser.json` (purane root me)                   | Service ki deewar insaan ki yaad pe nahi                                         | Haan (SR-071) / Haan / Haan                                                         | AB-1.7                     |
| LL-16 | Boot pe release steps lease aur fingerprint ke saath                                                       | `packages-old/backend/server-release/src/release.ts`                                          | Free pe shell aur one-off jobs nahi (F-1)                                        | Haan / Haan / Haan                                                                  | Database aur DevOps (§8)   |
| LL-17 | M0 ki aadatein: CI me collections ki ginti, har sort index se, `allowDiskUse` nahi                         | `docs-old/ARCHITECTURE.md` §6.1                                                               | 32 MB sort aur 500 collections ki seema (F-3)                                    | Haan (R-006) / Haan / Haan                                                          | Database aur QA (§8)       |
| LL-18 | Search index ki definition code me, release step se; local fallback                                        | `docs-old/ARCHITECTURE.md` §6.5                                                               | Index aur code ek saath                                                          | Haan (D-138) / Haan / Haan                                                          | AB-5.2                     |
| LL-19 | Bandwidth ki aadatein: gzip, pagination, 100 KB jawab, ETag aur 304                                        | `docs-old/ARCHITECTURE.md` §11.2                                                              | 5 GB mahine ki seema (F-1)                                                       | Haan (PR-2) / Haan / Haan                                                           | AB-4.3, AB-5.9             |
| LL-20 | Heavy kaam ek waqt me ek, hash ki semaphore, chhote pools, heap ki seema                                   | `docs-old/ARCHITECTURE.md` §11.1                                                              | 512 MB me surakshit                                                              | Haan (R-007, SR-007) / Haan / Haan                                                  | AB-8.3                     |

**Nahi lene:**

- Bundle mode me services ke beech localhost HTTP hop aur har request pe naya signed passport token: 0.1 CPU pe mehnga; naya prastaav in-process facade (AB-1.8).
- Identity ke roles aur grants ki copy doosri service me, version ki dobara koshish aur 503, aur ek account pe 50 grants ki chhat sirf event ke size ki wajah se: in-process facade se zaroorat nahi.
- Ek "core" service me kai modules: D-011 ki alag services se takrav.
- Outbox se BullMQ wala event ka raasta aur Redis ke restart pe outbox dobara bhejne ka watchdog: seedhi delivery me zaroorat nahi (§2.4).
- Maps provider aur uske kai accounts ka tareeka: koi tay zaroorat nahi (D-016 pincode se), aur terms ka jokhim.
- Video call ka doosra provider: D-025 me Google Meet ka dummy link tay.
- Rider ki lagataar location: SR-056 mana karta hai.
- Pehle ke retention ke number (audit 400 din, in-app 180 din wagairah): naye samay D-191 se D-194, D-250 se.
- Redis khaali hone pe har signed-in request pe 503 jab tak marks na banein: SR-029 me gateway DB se jaanchta hai.
- Queues ka web dashboard: ek aur khula hissa, koi tay zaroorat nahi; Master app ka ops page kaafi.

## 8. Aage ke agents ke liye

- **Database Architect:** har service ki collections aur indexes; outbox (delivery ke haal ke saath), `processed_events`, `timers`, idempotency, dead letters ke schema, indexes aur TTL (AB-2, AB-3); commerce ki copies (pincode-hub, area settings, daam, listing), catalog ki copies (stock, agla batch, bikri, rating), `search_documents` ka roop (Atlas Search ki 3 KB definition me fit); aggregate ka version field (kram); finance me outbox aur inbox table, invoice ke counter rows (§1.7); tax archive aur kanooni rok ka sealed store (D-225, D-250: encrypted, alag key, har pahunch audit); audit ke compressed din ke chunks aur chain (AB-7.4); logs ke chunks (A-3); har cluster ka jagah ka hisaab (§2.12) aur A-1 ke target pe; ids (ObjectId ya UUIDv7); finance ke liye PostgreSQL driver aur parameterized queries (SR-069; OPEN_QUESTIONS B6 ka "library"); D-013 me PostgreSQL ka backup format; D-203 ka jod (address, device, payment) kis service me aur kaise.
- **DevOps / SRE:** deploy ke overlap me lease (F-2); boot pe release steps (LL-16); D-028 ke jagane ka schedule 750 ghante me (R-008); `/health` aur `/ready`; alerts ka raasta aur thresholds (AB-7.8); Render bandwidth, ghante, Neon CU-ghante aur Atlas jagah ka hafte ka naap (AB-8.7); clusters ka resume (PR-6); laptop pe Docker split mode aur 512 MB / 0.1 CPU wala naap (AB-8.6); har service ka secrets namespace (AB-1.9); 11 Vercel projects ka ek template (SR-002); backup me media registry, logs, sealed store aur audit chunks; media provider ki files backup me nahi (product images dobara upload) ka faisla operations me likhna; CL-131 ka asli business pe India me roz ka backup.
- **UX / Product:** "server jaag raha hai" ki screen (AB-4.12); 429 aur 503 ke `Retry-After` wale sandesh; 426 pe "app update karein"; Delivery app me offline ki halat aur "code ke liye network chahiye" (§10 point 4); finance ke statement pe "15 minute tak der" (A-6); invoice download (A-7); error me request id dikhana (support ke liye); polling aur push ki halat.
- **QA:** contract drift ke tests; outbox aur consumer ke at-least-once tests, aggregate ke kram, dead letter aur dobara chalana; Redis khaali karke jobs aur rate limits; soye server ka simulation (ghadi aage, chhoote din ka catch-up); 512 MB aur 0.1 CPU ka load naap (AB-8.6) A-1 ke target pe; M0 ki seemaayein CI me (collections, index se sort, LL-17); search kram ke tests aur "seller boost nahi" ka test (D-139); cache headers ke contract tests (SR-004); logs redaction (signed URL aur search text samet); sync calls ke graph ka lint.
- **Security Architect (doosra run):** in-process facade aur split mode ke signed calls (AB-1.8); app ki pehchaan forwarded host se ya har app ka alag secret (§2.13 niyam 1, F-12); `/wake` aur CSP ka apvaad (§10 point 7); media provider ki private delivery aur URL ka samay (A-2, F-6); logs store me IP jaisa personal data aur uski pahunch (A-3); apps ki error intake route ka abuse (A-4); notify ka delivery code bhejte waqt resolver se lena (§2.3); sealed store ki keys; events me kam se kam data (AB-2.8); SR-077 me signed URL, idempotency key aur search text jodna (AB-7.3).

## 9. Pichhle agents ke items

| Item                                                                                     | Kahan se                             | Kahan sambhala                                                                        |
| ---------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------- |
| Order ka dhaancha (order, seller ka hissa, parcel, line, line ke hisse)                  | BA §10.2                             | Database Architect ko (§8); parcel aur invoice ka flow §2.1                           |
| Stock aur order "ek saath pakka" (ek service ya saga)                                    | BA §10.2                             | §2.2, AB-1.3 (ek service: commerce)                                                   |
| D-016 niyam 9: serviceability usi transaction me                                         | BA §10.2, BA §11 point 5             | §2.2, AB-1.3 (commerce ki copy); §10 point 2                                          |
| Area setting ka resolver (promise, cut-off, chhuttiyan, UPI seema, expiry ki seemaayein) | BA §10.2                             | §2.2 (logistics maalik, commerce me copy); detail module design me                    |
| Catalog ka public cache aur Pro daam ya agla batch                                       | BA §10.2, BA2 §9.3                   | §2.8, AB-5.7, AB-5.8                                                                  |
| Invoice ka bina gap number, ek parcel me kai invoices                                    | BA §10.2                             | Pehle se tay (D-282, ARCHITECTURE §1.7); sync jaari karna AB-1.4                      |
| Finance ko orders, refunds, bharpai, fees ke events; seller ka minus balance             | BA §10.2                             | §2.2 table, AB-3.7; minus balance pehle se tay (D-071, ARCHITECTURE §1.3)             |
| Polling aur push se halat                                                                | BA §10.2                             | §2.9 niyam 7, AB-4.7                                                                  |
| Carrier port ke peeche RTO, koshish aur pickup ke events                                 | BA §10.2                             | §2.2 (logistics ke events carrier port se alag nahi)                                  |
| Khabar ka ek faisla-bindu, line ki chhat, agle din, seller ka saar                       | BA2 §9.3                             | Pehle se tay (D-126, D-140 se D-142); dhaancha §2.2 notify, §2.5                      |
| Reviews kis service me; rating read model                                                | BA2 §9.3                             | §2.2 (catalog), §2.6                                                                  |
| Search: free cluster ki seemaayein, synonyms, zero result, kram ke gun, Pro daam         | BA2 §9.3 (aur BA2 §7.3 item 21)      | §2.6, AB-5; F-3, F-4                                                                  |
| Try-on browser me, shade ke hex se rang; library ka license aur speed                    | BA2 §9.3, D-169 asar                 | R2: is run me design nahi; try-on wale run ya module design ke liye (UX aur Security) |
| Behaviour data aur aankde, Atlas 0.5 GB, chhoote din ka catch-up                         | BA2 §9.3, D-149 asar                 | §2.2 (maalik service ke rollups), AB-3.6                                              |
| Tickets aur SLA: kaam ke ghante, sote server pe timer                                    | BA2 §9.3, D-162 asar                 | R2; dhaancha AB-3.1 (DB ki due date); calendar module design me                       |
| Points, promo credit aur gift card ka ledger finance me                                  | BA2 §9.3                             | Pehle se tay (ARCHITECTURE §1.2, §1.3; SR-085); R2                                    |
| Allowlist identity ki setting; demo ki patti; invoice pe watermark                       | BA2 §9.3                             | Pehle se tay (D-133, SR-018, D-145); §2.2 identity                                    |
| Data export aur account delete kai services me                                           | BA2 §9.3                             | SR-066 (tay) + AB-2 ka `identity.account.erased`; export R2 (D-151)                   |
| Gateway ka secret header aur route manifest                                              | Security §9                          | Pehle se tay (SR-002, SR-032); AB-4.1                                                 |
| Identity ka model (ek email ek user, grants) aur owner ke accounts ka insaan se jod      | Security §9, §7.2                    | §2.2 identity; detail Database Architect ko (§8); jod SR-076 me tay                   |
| Bundle mode me service ki deewar                                                         | Security §9                          | Pehle se tay (SR-071); AB-1.7 se AB-1.9                                               |
| Media ki jagah: private signed URLs, EXIF, free tier                                     | Security §9, D-155 asar              | §2.7, A-2, AB-6                                                                       |
| Email provider: dashboard me OTP ki copy, link tracking, key ke haq                      | Security §9                          | A-5; jaanch OPEN_QUESTIONS §2 me pehle se, F-8                                        |
| Push ke hosts                                                                            | Security §9                          | Pehle se tay (SR-072, SR-074); jaanch OPEN_QUESTIONS §2                               |
| Kill switches aur settings ka dhaancha                                                   | Security §9                          | Pehle se tay (SR-009, SR-043); AB-1.6                                                 |
| Delivery PWA ka offline data                                                             | Security §9                          | Pehle se tay (SR-023); sync AB-4.6; §10 point 4                                       |
| Customer app ke server-side hisse me public cache aur cookies (D-058 asar)               | Security §9, D-058 asar              | A-8 (SSR nahi), AB-5.7                                                                |
| Finance: transaction, events, release steps, idempotency ka PostgreSQL roop              | D-001 asar, R-009, OPEN_QUESTIONS B6 | §2.4 (finance outbox), AB-1.4, AB-3.7; tables Database Architect ko                   |
| Finance DB sirf kaam pe; health aur ping Neon tak nahi; 0.25 CU                          | D-057 asar                           | AB-3.7, AB-7.7                                                                        |
| Search index ka kaam; ranking ki technique                                               | D-138, D-139 asar                    | §2.6, AB-5.1 se AB-5.6                                                                |
| Emails ke asli number (DevOps ke saath)                                                  | D-142 asar                           | §2.12 (~100 orders/din ki seema); number DevOps ke saath (§8)                         |
| Audit ke cluster ki 0.5 GB                                                               | D-194 asar                           | §2.12, AB-7.4, PR-4                                                                   |
| Kanooni rok ka store aur jagah; tax archive ke saath ek tareeka                          | D-250 asar                           | Sealed store ka niyam Database Architect ko (§8); media wala hissa AB-6.5             |
| 2027 se media ki jagah                                                                   | D-262 asar                           | AB-6.5, PR-8, A-2                                                                     |
| Checkout ka hisaab kai services ke data se                                               | SR-044 ka asar (D-214)               | §2.2 (commerce ki copies), AB-1.3                                                     |
| Images ka dobara encode aur encryption: CPU aur memory                                   | D-216 asar                           | §2.12, A-2, AB-6.3                                                                    |
| Service ki deewar ke lint aur dependency rules                                           | D-217 asar                           | AB-1.7; QA ko (§8)                                                                    |
| CERT-In: ghadi, logs 180 din (L-110)                                                     | LEGAL_REVIEW_2 L-110, CL-106         | AB-7.2, AB-7.9, A-3; F-13                                                             |
| Data ka samay aur backups (L-103)                                                        | LEGAL_REVIEW_2 L-103                 | Pehle se tay (D-250, D-262); backups DevOps ko (§8)                                   |
| Books ka India me roz ka backup (CA-029)                                                 | CA_REVIEW CA-029, CL-131             | Asli business pe; DevOps ko (§8)                                                      |
| 512 MB me memory (R-007), observability, scale targets                                   | OPEN_QUESTIONS B15                   | §2.11, §2.12, A-1, AB-7, AB-8                                                         |

## 10. Tay faislon pe dhyaan

Ye faisle dobara khole nahi ja rahe; sirf jokhim ya kami, wajah aur sabse chhota sudhaar.

1. **D-011 ka "services ke beech data sirf events se":** kuch kaam me user usi pal jawab ka intezaar karta hai (checkout pe payment order, pack pe invoice, darwaze pe UPI QR, OTP, signed URL). SR-071 andar ki calls maanta hai, par D-011 ka shabd saaf nahi. **Sudhaar:** D-011 ke asar me ek line: "data ki copy sirf events se; turant jawab wale commands typed facade se, tay list aur bina chakkar ke graph me".
2. **D-016 niyam 9 aur D-015 (switch aur live):** order ka transaction commerce ki copy pe chalta hai, jo logistics ke badlav se kuch second peeche reh sakti hai. Area band karne ke turant baad ek-do order aa sakte hain. **Sudhaar:** area band karne ka kram: pehle checkout pe us area ki rok ka event, phir band; aur parcel banate waqt logistics band area pe order rok de (cancel aur refund, D-111).
3. **D-057, ARCHITECTURE §1.7 aur R-014:** invoice ka number finance ke PostgreSQL me pack pe; Neon ke ghante khatam to pack aur dispatch ruk jaate hain. R-014 me sirf "finance service band" likha hai. **Sudhaar:** R-014 ke asar me "pack aur dispatch bhi" jodna (PR-1), aur A-6 ka batch.
4. **D-042 (Delivery offline) aur SR-054 (code partner ke phone pe kabhi nahi):** code se delivery ke liye darwaze pe network chahiye; offline me code jaancha nahi ja sakta. D-072 ka photo aur location ka raasta "code na mile" ke liye hai, "network nahi" ke liye nahi. **Sudhaar:** ek line: "code wali delivery sirf online; offline me list, scans aur photo line me; network na ho to partner intezaar kare ya Hub Manager se baat kare". UX aur Security ke liye.
5. **D-028 (raat ko soya server) aur chhote kanooni samay (D-251 ke 2 ghante aur 24 ghante, D-248 ke 6 ghante):** soye server pe timer aur alert nahi chalte. **Sudhaar:** jo kaam turant chahiye (chhupna, owner aur Grievance Officer ko push aur email) wo usi request me jo report laati hai (AB-3.8); R-002 me ek line ki kanooni ghadiyon ke alert raat me der se ho sakte hain. Soye server ka in samay pe kanooni asar: Lawyer (ya CA) se nahi jaancha (CL-105, CL-106).
6. **D-126 ka order confirmation email kis line me:** D-126 niyam 4 aur D-142 ki lines (OTP, paisa, baaki) me confirmation (jisme delivery code hai) ki line tay nahi. Chhat paar ho to wo agle din khisak sakta hai; code customer app me bhi hai (D-072), to delivery nahi rukti. **Sudhaar:** ek line me confirmation ki line tay karna (salah: "paisa" line, kyunki ye order ka record hai).
7. **D-052 (same-origin) aur SR-005 (CSP `default-src 'self'`):** jagane ke liye app ko Render ka host seedha bulana padta hai (F-5), jo CSP ke `connect-src` me nahi. **Sudhaar:** SR-005 me ek apvaad: sirf `/wake` ke liye backend ka host `connect-src` me, bina cookies; Security ke doosre run me pakka.
8. **D-194 (audit 2 saal) aur R-006:** bina compression audit 0.5 GB me ~45 orders/din pe hi 2 saal tak; SR-076 staff ka har likhne wala kaam (warehouse aur hub ke scans samet) audit maangta hai. **Sudhaar:** audit ke purane din compressed chunks me (AB-7.4); faisla nahi badalta.
9. **D-058 ka asar (customer app ke server-side hisse ka region):** A-8 (a) maana jaaye to ye sawal band; ek line "R1 me server-side rendering nahi, isliye region ka sawal nahi".
10. **D-013 (backup "saare databases"):** nayi jagahein (media registry, logs, audit chunks, sealed store) databases me hi hain, par media provider ki files backup me nahi. **Sudhaar:** OPERATIONS me ek line: product images ka backup nahi, wo seller se dobara; daawe aur saboot ki files samay ke saath hi mitti hain. DevOps ke saath.

## Change log

| Version | Date       | Badlav                                                                                                                                                                                                 |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.0.0  | 2026-11-20 | Pehla version: B15 ka technical discovery: services aur data, events, jobs, search, media, caching, API, errors, observability, capacity; 8 owner sawal, 8 batches, 8 risks, 14 jaanch, 20 lene layak. |
