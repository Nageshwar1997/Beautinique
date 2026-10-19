# TASKS — BQ

> **Status:** v1.1 (2026-10-20). Poore project ki task list, [ARCHITECTURE.md](ARCHITECTURE.md) §16 ke phases ke hisaab se. Har task "done" tabhi jab [RULES.md](RULES.md) §1.5 ki Definition of Done poori ho.

**Kaise use karein:**
- `[ ]` baaki, `[~]` chal raha hai, `[x]` done.
- Task ID: `T<phase>.<number>`.
- Har phase ke end me ek **milestone** hai. Milestone poora hue bina agla phase shuru nahi.
- Naya task aaye to sahi phase me jodo, aur bada badlav change log me likho.

**Abhi ka focus:** docs poore karna, phir Phase 0.

## A. Owner ke kaam (sirf aap kar sakte ho)

- [ ] A.1 Terminal me `gh auth login -h github.com` (GitHub CLI ka token expire ho gaya hai).
- [ ] A.2 Ola Maps ke 4 accounts banana aur har app ke domain ke hisaab se browser keys dena (ARCHITECTURE §10). Multiple accounts ke terms ek baar padhna.
- [ ] A.3 Render workspace: sirf ek free web service (`bq-live`), aur Singapore me ek free Key Value.
- [ ] A.4 Atlas: project `bq-live`, M0 cluster AWS Singapore, har deployable ka alag DB user.
- [ ] A.5 Cloudinary, Sentry (free), Razorpay (test keys), Google OAuth client (har app ka redirect).
- [ ] A.6 Brevo: authorised IPs ki rok hatana, ya Render Singapore ke IPs jodna.
- [ ] A.7 Cloudflare R2 free tier: card maangta hai ya nahi, check karna (nahi to logs archive Cloudinary private files me).
- [ ] A.8 UptimeRobot aur cron-job.org free accounts (keep-alive aur alerts ke liye).
- [ ] A.9 Vercel: apps ready hone pe 11 projects (production branch `release`).

## B. Docs

- [x] B.1 PRD.md v1.0 (approved)
- [x] B.2 ARCHITECTURE.md v1.1
- [x] B.3 RULES.md v1.0
- [x] B.4 DESIGN.md v1.0
- [x] B.5 TASKS.md v1.0
- [x] B.6 MEMORY.md v1.0
- [ ] B.7 Docs commit aur push (owner ke kehne pe)

## Phase 0. Monorepo + CI (1–2 hafte)

- [ ] T0.1 `BQ-Packages` → `Beautinique/packages/` (git subtree, history ke saath).
- [ ] T0.2 4 apps → `frontend/` (customer, seller, admin, master).
- [ ] T0.3 Gateway aur services → `backend/` (port sources ki tarah).
- [ ] T0.4 Media-service ka nested `.git` aur `.kilo` worktree hatana.
- [ ] T0.5 npm workspaces + Turborepo; root scripts.
- [ ] T0.6 `ci.yml`: lint, typecheck, test, build (affected), gitleaks, npm audit.
- [ ] T0.7 Branches `prerelease` aur `release`, branch protection, required checks.
- [ ] T0.8 `infra/docker-compose.yml` ka `infra` profile: Mongo replica set, Valkey (Render jaisi limits), Mailpit. **Docker Lesson 2.**
- [ ] T0.9 Har deployable ka `.env.example` aur zod env schema.

**Milestone 0:** CI green, ~2,600 package tests chal rahe hain, `infra:up` se local infra chalta hai.

## Phase 1. Server kit + contracts (1–2 hafte)

- [ ] T1.1 `server-kit`: AppError, response envelope, logger (redaction), Express app factory, bootstrap/shutdown.
- [ ] T1.2 `server-mongo`: `withTransaction()` (reply commit ke baad) + regression test.
- [ ] T1.3 `server-queue`: outbox relay (`poll` aur `changestream`), inbox dedupe, job schedulers, `bq:epoch` watchdog aur Redis wipe recovery.
- [ ] T1.4 `server-crypto`: AES-GCM field encryption, HMAC blind index.
- [ ] T1.5 `contracts`: routes, events, permissions, error codes, area-setting keys; OpenAPI, typed client aur gateway metadata ka codegen.
- [ ] T1.6 `authz` matcher (scopes, containment) + `StoragePort` interface.
- [ ] T1.7 Unit aur mutation tests.

**Milestone 1:** ek sample endpoint aur event contract se bana, outbox → BullMQ → inbox ka test pass, Redis wipe drill pass.

## Phase 2. Gateway (1 hafta)

- [ ] T2.1 Prefix routing table, app registry (11 apps), Origin aur `x-forwarded-host` → app.
- [ ] T2.2 JWKS verification, per-app cookies, passport token, origin secret, `clientIp()`.
- [ ] T2.3 Redis rate limits (classes), cache headers, helmet, request-id, Sentry.
- [ ] T2.4 `/health` (shallow) aur `/ready` (deep), `/status`.
- [ ] T2.5 `backend/bundle`: paancho deployables ek process me, boot pe release steps.
- [ ] T2.6 Purani cheezein hatana: facades, `METHODS_AND_PATHS`, MASTER bypass, wake-up fan-out, keep-alive workflow.

**Milestone 2:** bundle mode laptop pe chalta hai, gateway sahi deployable tak route karta hai.

## Phase 3. bq-identity (2–3 hafte)

- [ ] T3.1 Users, credentials (argon2id), phone OTP, email + password, TOTP, Google OAuth (PKCE).
- [ ] T3.2 Sessions, refresh rotation + reuse detection, ES256 + JWKS, My Devices.
- [ ] T3.3 Apps, permission catalogue, 79 roles ka seed, scoped grants, invitations, applicant grants.
- [ ] T3.4 API clients (Seller API Integration, Affiliate Partner).
- [ ] T3.5 Events (`identity.user.*`, `identity.grant.changed`) aur grants events ka inbox.
- [ ] T3.6 Purane users ka import (roles mapping, state names → LGD codes); Master ke liye MFA zaroori.

**Milestone 3:** har app ka login (OTP, password + TOTP) laptop pe chalta hai; Master kisi aur app me login nahi kar sakta.

## Phase 4. Core foundations (4–5 hafte)

- [ ] T4.1 Platform kernel: authorize/scopeFilter, area-settings resolver, idempotency, CSV export, audit log.
- [ ] T4.2 Location: LGD + India Post import (laptop se, batches me).
- [ ] T4.3 Network + area settings + serviceability API; Pune seed (Chakan + 21 hubs).
- [ ] T4.4 Expansion: waitlist, suggestions, requests, checklist templates, `goLive`; `open-district-by-config` test.
- [ ] T4.5 Sellers + review engine (purana `resolveStateAdmin`, reassign aur SLA logic data-driven).
- [ ] T4.6 Catalog + pricing + discovery (Atlas Search, 3 indexes). **Docker Lesson 5** (atlas-local).
- [ ] T4.7 Media: Cloudinary adapter, asset registry, lifecycle, unused cleanup, weekly reconcile.
- [ ] T4.8 Support: contact-us (bina TTL).
- [ ] T4.9 Imports: categories, products (`NEEDS_REQC`), sellers (`LEGACY_NEEDS_REKYC`), media.

**Milestone 4:** naya district sirf config se khulta hai (CI), seller apply → approve → listing QC → storefront laptop pe chalta hai.

## Phase 5. Notify + Payments (2 hafte)

- [ ] T5.1 Notify: Brevo HTTPS email, SMS/WhatsApp sandbox, web push, in-app inbox.
- [ ] T5.2 English templates, preferences aur consent, delivery log, OTP fast lane.
- [ ] T5.3 Payments: skeleton, fake driver, `razorpay:simulate` webhook CLI.
- [ ] T5.4 bq-notify ki Dockerfile. **Docker Lesson 3.**

**Milestone 5:** OTP aur order emails Mailpit me aate hain; fake Razorpay webhook se payment event banta hai.

## Phase 6. Frontend foundation (3 hafte, saath-saath)

- [ ] T6.1 Packages: app-shell, auth-ui, authz, api-client, data-table, review-screens, maps, forms, pwa-kit.
- [ ] T6.1a `icons` package: apne icon components; components package ki 12 `*-icons.ts` files ke icons yahan; icon credits (licenses) page.
- [ ] T6.2 Styles package v2: fonts (Plus Jakarta Sans + Fraunces) aur preload plugin, base styles.
- [ ] T6.3 Customer app → React Router 7 framework mode (SSR).
- [ ] T6.4 Onboarding Customer → Seller app; Super Admin checkbox hatana; Admin/Master se AddProduct aur category CRUD hatana.
- [ ] T6.5 7 naye apps template se (superadmin, support, finance, logistics, delivery, growth, creator).
- [ ] T6.6 Har app ka `vercel.json` (routes transform, security headers), Ola Maps key per app.
- [ ] T6.7 `apps` profile: split mode containers. **Docker Lesson 4.**

**Milestone 6:** saare 11 apps laptop pe login karke apna empty dashboard dikhate hain, dono themes me.

## Phase 7. Commerce + payments (4–5 hafte)

- [ ] T7.1 Cart, save for later, coupons, free samples aur gifts.
- [ ] T7.2 Checkout transaction (area check, re-price, coupon budget, stock reservation).
- [ ] T7.3 Order state machine aur `order_events`.
- [ ] T7.4 Razorpay test mode, delivery pe UPI QR, late-capture auto-refund.
- [ ] T7.5 Pack transaction me gapless GST invoice; returns aur exchanges.
- [ ] T7.6 Price rules (ARCHITECTURE §6.8) aur Pro price.

**Milestone 7:** prepaid aur UPI-on-delivery order laptop pe end-to-end (fake Razorpay ke saath).

## Phase 8. WMS + logistics + Delivery PWA (5–6 hafte)

- [ ] T8.1 ASN, inbound slots, GRN (batch, expiry), quarantine, putaway.
- [ ] T8.2 Inventory ledger, FEFO, cycle counts, near-expiry block, recall tasks.
- [ ] T8.3 Pick aur pack (scan-to-pick), returns QC, RTV, liquidation.
- [ ] T8.4 Line-haul, hubs, sort, run sheets (Ola routing), attempts (OTP, photo, geo), reattempts, RTO.
- [ ] T8.5 Riders: onboarding, documents, gig registration (dummy), earnings, squads.
- [ ] T8.6 Delivery PWA: offline queue, sync, POD photos, SOS, install.
- [ ] T8.7 Control tower (polling), disputes, loss prevention.

**Milestone 8:** order warehouse se pack hokar rider tak, aur delivery ya return tak, poora chalta hai (offline replay ke saath).

## Phase 9. Finance + support (4–5 hafte)

- [ ] T9.1 Double-entry journal, fees aur commission (maker-checker).
- [ ] T9.2 Settlements, payout batches, Route transfers (test), reconciliation.
- [ ] T9.3 TCS/TDS registers, GSTR-8 export, gig contribution, labour registrations tracker (dummy).
- [ ] T9.4 Procurement (PO–GRN–invoice).
- [ ] T9.5 Support Desk: tickets, SLAs, L1 → L2 → Grievance Officer, grievance register, IT Rules timers.
- [ ] T9.6 Beauty Advisor aur expert consults (Jitsi links), L3 repairs, CSAT.

**Milestone 9:** ek order ka paisa ledger me balance hota hai aur payout banta hai; complaint grievance timer ke saath track hoti hai.

## Phase 10. UGC, growth, creators, governance (5–6 hafte)

- [ ] T10.1 Reviews, Q&A, photo reviews, moderation.
- [ ] T10.2 Growth: merchandising, CMS, CRM journeys, loyalty, gift cards, retail media, Pro & B2B, city growth.
- [ ] T10.3 Creators aur affiliates: storefronts, looks, links, attribution, commissions, live shopping.
- [ ] T10.4 Governance: second signatures, emergency switches, policies, takedowns, CERT-In register, access reviews.
- [ ] T10.5 Privacy: DPDP consents (own-brand bhi), export aur erasure, breach register.
- [ ] T10.6 Risk: fraud rules, blocks, ban appeals, brand protection.

**Milestone 10:** PRD §5 ke saare features laptop pe chalte hain.

## Phase 11. Launch hardening (2 hafte)

- [ ] T11.1 E2E ke 6 flows (Playwright + axe), nightly mutation tests.
- [ ] T11.2 Warm load check aur SLOs.
- [ ] T11.3 Legal pages, dummy contacts (PRD §7.3), seed data.
- [ ] T11.4 `bq-live` deploy (`release` branch), monitors, alerts, log archive.
- [ ] T11.5 Cutover (ARCHITECTURE §16) aur purani Render services hatana.
- [ ] T11.6 `render.yaml` se comparison. **Docker Lesson 6.**

**Milestone 11 (launch):** saare 11 apps live, Pune district served.

## C. Pehle deploy pe verify karna (ARCHITECTURE §18)

- [ ] C.1 Vercel rewrite ke through `Set-Cookie`, `__Host-`/`__Secure-` cookies aur `x-forwarded-host`.
- [ ] C.2 Request body ki max size (files hamesha seedhe Cloudinary).
- [ ] C.3 Cloudinary, Brevo, Sentry aur Ola Maps ki free limits.
- [ ] C.4 atlas-local ki asli RAM (`docker stats`).

## Change log

| Version | Date | Badlav |
|---|---|---|
| v1.0 | 2026-10-19 | Pehla version: owner ke kaam, docs, Phase 0–11 (milestones aur Docker lessons ke saath), aur deploy pe verify list. |
| v1.1 | 2026-10-20 | Apps sirf English: T5.2, T6.1 aur T6.2 badle. |
