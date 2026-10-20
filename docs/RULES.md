# RULES — BQ

> **Status:** v1.1 (2026-10-20). Ye niyam Beautinique ke har code, doc aur deploy pe lagu hain. [PRD.md](PRD.md) batata hai **kya** banana hai, [ARCHITECTURE.md](ARCHITECTURE.md) batata hai **kaise**, aur ye file batati hai ki **kin niyamon ke saath**. Koi rule todna ho to pehle is file me badlav aur change log entry.

## 1. Kaam karne ke niyam

1. **Production-grade, hamesha.** Ye education project hai, par har cheez asli launch jaisi banegi: tests, accessibility, security, docs. "Sirf demo hai" koi bahana nahi.
2. **Kuch bhi "baad me" nahi.** PRD ke saare roles aur features launch ke plan me hain. Koi cheez rokni ho to owner se poochho, chupke se "later" mat likho.
3. **Business decision owner ka hai.** Jahan PRD ya ARCHITECTURE chup hai, wahan apne aap faisla mat lo; recommendation ke saath owner se poochho, aur jawab doc me likho.
4. **Har decision likha jayega.** Decision → sahi doc (PRD, ARCHITECTURE, RULES, DESIGN) + us doc ke change log me ek line.
5. **"Done" ki definition:**
   - Code + unit tests + zaroori integration ya E2E test.
   - Accessibility check (axe) aur 360 / 768 / 1280 px pe responsive.
   - Docs (README ya doc section) update.
   - CI green.
   - **Asli user wala action karke check kiya** (§6.4).
6. **Imaandari:** jo check nahi kiya, use "verified" mat kaho. Test fail ho to output ke saath batao.

## 2. Git aur release

1. **Branches:** feature branch → PR → **`prerelease`** (laptop pe Docker) → **`release`** (Render + Vercel). `release` pe seedha push nahi.
2. **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Ek commit me ek hi baat.
3. **PR:** chhota rakho, description me kya aur kyun, aur kaise test kiya. CI green hue bina merge nahi.
4. **Public repo:** koi secret, `.env`, token, test password, DB dump ya asli personal data kabhi commit nahi. Sirf `.env.example`. Gitleaks har PR pe chalega.
5. **Dependencies:** Renovate ke weekly PRs `prerelease` pe; major version upgrade alag PR me.

## 3. Code: sabke liye

1. **TypeScript strict.** `any` nahi; `unknown` + zod parse.
2. **Bahar se aane wala har data zod se validate** (API input, env, webhooks, files, events).
3. **Config sirf config module se.** `process.env` config module ke bahar nahi padhna (ESLint rule).
4. **Kuch bhi hard-coded nahi jo data hai:** states, districts, pincodes, warehouses, hubs, roles, permissions, rates (GST, TCS, TDS, fees), legal limits. Ye data ya settings me rehte hain (no-hardcoded-geo lint).
5. **Role ke naam se comparison nahi** (`role === 'MASTER'` jaisa). Hamesha permission + scope se check.
6. **Naming:** files `kebab-case`, React components `PascalCase`, functions aur variables `camelCase`, constants `UPPER_SNAKE_CASE`, events `<context>.<aggregate>.<pastTense>`, permissions `<module>.<resource>.<action>`.
7. **Formatting:** Prettier + ESLint, CI me check. Comments sirf "kyun" ke liye, "kya" ke liye nahi.

## 4. Backend

1. **Contracts-first:** har endpoint aur event pehle `packages/contracts` me, phir handler. Bina contract ke route nahi.
2. **Module boundaries:** Core ke modules sirf ek doosre ke `index.ts` facade se baat karte hain. Doosre module ke models ya collections chhoona mana hai (dependency-cruiser).
3. **Transactions:** state change `withTransaction()` me; **reply commit ke baad hi**. Outbox aur audit row usi transaction me.
4. **Side effects sirf outbox events se** (email, doosre module ka kaam, cache invalidation). Transaction ke andar bahar ki API call nahi.
5. **Idempotency:** paisa, stock, order, delivery wale har write pe `Idempotency-Key`. Consumers `processed_events` se duplicate rokte hain.
6. **Authorization:** har handler `authorize(ctx, permission, scope)` ya `scopeFilter()` use karega. Koi bypass nahi, Master ke liye bhi nahi. Separation of duties ke rules (maker ≠ checker, rejecter ≠ appeal decider) code me aur tests me.
7. **Paisa:** hamesha integer **paise**; GST rates basis points me. Float kabhi nahi. Selling price ≤ MRP, server pe dobara check.
8. **Price:** ek base price sabke liye; farak sirf label wale tareekon se (Pro price, coupon, loyalty). Client ka bheja price kabhi nahi maanna (ARCHITECTURE §6.8).
9. **Stock:** sirf `inventory_movements` ledger se; balance conditional update se (oversell nahi).
10. **Files:** sirf `StoragePort` se. Database me sirf `assetId`, provider ka URL kabhi nahi. Upload `UNUSED` se shuru, use pe `USED` (ARCHITECTURE §6.7).
11. **Timers:** BullMQ job schedulers + due dates MongoDB me. `setInterval` nahi (sirf Redis watchdog exception).
12. **Redis:** har cache key pe TTL. Free mode me har deployable ki ek queue. Redis kisi cheez ka source of truth nahi.
13. **Atlas M0:** har sort ke liye index, `$where`/map-reduce nahi, `.watch(` sirf relay module me, bade exports cursor + batches me.
14. **Migrations:** forward-only, idempotent, expand/contract; boot pe chalti hain.
15. **Errors:** `AppError` + common response envelope; error codes contracts me; user ko message error code se (English text ek jagah).
16. **Cache headers:** login wale aur personal responses `private, no-store`; `s-maxage` sirf `cache: 'public'` contracts pe, aur unpe cookies upstream nahi jaati.

## 5. Frontend

1. **Pehle packages dekho:** `@beautinique/frontend-components`, hooks, stores, styles aur naye shared packages (app-shell, data-table, auth-ui, authz, maps). Wahan hai to haath se UI mat likho.
2. **Components props se chalein, app se jude na hon.** App-specific cheez prop ya config se aaye.
3. **Naya hook ya component:** pehle app me banao, **asli browser me prove karo**, phir package me le jao.
4. **Icons:** sirf `icons` package ke apne components (`IconCart`, ...). Naya icon chahiye to seedha package me jodo, usi PR me jisme wo use ho raha hai (Iconify se SVG copy + license note). Monorepo me npm workspaces local package link karta hai, isliye wo turant saare apps me milta hai; app me alag icons file nahi. App me inline SVG ya Iconify import nahi.
5. **Accessibility (WCAG 2.1 AA):** keyboard se chalne layak, labels, colour contrast, dikhne wala focus. `outline-hidden` jaisi class lagao to apna focus ring zaroor do.
6. **Responsive:** har screen 360, 768 aur 1280 px pe; light aur dark dono theme.
7. **Text aur formats:** apps sirf English me. INR, numbers aur dates `Intl` (`en-IN`) se, haath se format nahi.
8. **API:** sirf generated `api-client` aur contracts ke query keys; seedha `axios`/`fetch` nahi.
9. **User data browser storage me nahi.** App `GET /api/v1/iam/me` se shuru hoti hai. `localStorage` sirf UI preferences (jaise theme) ke liye.
10. **Permissions UI:** `<Can>` / `usePermission`; nav permission se filter. Backend phir bhi check karta hai.

## 6. Testing

1. **Har change ke saath tests.** Unit (Vitest), integration (Mongo replica set + Valkey), E2E (Playwright + axe).
2. **Mutation tests** zaroori: paisa, stock reservation, authz, go-live, checkout.
3. **Refusal paths bhi test hon:** galat permission, galat scope, go-live ka har missing item, duplicate Idempotency-Key.
4. **"Verified" tabhi** jab asli user wala action kiya ho (browser me click, API ka asli flow). Sirf DB me entry ya build pass hona verify nahi hai.
5. **Fake adapters** se tests: Razorpay, Ola, Cloudinary, Brevo. Real keys ke bina sab test chalein.
6. **Test data dummy:** fictional naam, `@beautinique.example` emails, Razorpay test mode.

## 7. Security aur privacy

1. Internal apps pe MFA; sensitive actions pe step-up.
2. PII (PAN, bank, DL/RC, TOTP secrets, consult notes) encrypted; logs me OTP, password, token, cookie, PAN, account number kabhi nahi (redaction list).
3. DPDP: consent har purpose ka alag (`marketing.own_brand` bhi); export aur erasure ka flow; legal records pseudonymise hote hain, mitte nahi.
4. **Dummy legal:** har dummy registration, filing ya adapter pe `isDummy` flag aur UI pe DUMMY badge. Kabhi asli filing jaisa mat dikhao.
5. Secrets sirf Render aur Vercel env (Sensitive) me; rotate karne ka tareeka ARCHITECTURE §7.2 me.

## 8. Docs

1. Saari planning `.md` files **Hinglish** me. Code identifiers, laws aur product names English me.
2. Har doc ke top pe status (version + date) aur neeche change log.
3. Har package me README + playground.
4. Naye docs zaroorat pe `Beautinique/docs` me jod sakte hain; platform-wise docs `docs/backend`, `docs/frontend` aur `docs/packages` me (jaise `infra/ola-maps.md`, ADRs).

## 9. AI assistant ke saath kaam

1. Assistant **kam se kam tokens** use kare: targeted edits, zaroorat ke hisaab se padhna, bade multi-agent workflows sirf zaroori ho to aur pehle bata ke.
2. Destructive kaam (delete, force push, data hatana) se pehle owner se poochho.
3. Commit ya push sirf owner ke kehne pe.
4. Mutation testing (code me jaan-boojh ke galti daal ke dekhna ki tests pakadte hain) app files me seedha nahi, ek copy me, kyunki owner ka dev server file badalte hi reload hota hai.
5. Har claim (pricing, limits, kanoon) official source se check karke likhna, aur jo verify nahi hua wo saaf likhna.

## Change log

| Version | Date | Badlav |
|---|---|---|
| v1.0 | 2026-10-19 | Pehla version: kaam, git, code, backend, frontend, testing, security, docs aur AI assistant ke niyam. |
| v1.1 | 2026-10-20 | Apps sirf English; INR aur dates `en-IN`. |
| v1.2 | 2026-10-20 | Icons rule: `workspace:*` ki jagah npm workspaces ka local link. |
