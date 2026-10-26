# RULES — BQ

> **Status:** v1.13 (2026-10-27). Ye niyam Beautinique ke har code, doc aur deploy pe lagu hain. [PRD.md](PRD.md) batata hai **kya** banana hai, [ARCHITECTURE.md](ARCHITECTURE.md) batata hai **kaise**, aur ye file batati hai ki **kin niyamon ke saath**. Koi rule todna ho to pehle is file me badlav aur change log entry.

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

1. **Branches (owner, 2026-10-25):**
   - **`prerelease` = development.** Har kaam `prerelease` se nayi branch (`feat/<kaam>`, `fix/<kaam>`), PR wapas `prerelease` pe. Laptop pe Docker se integration.
   - **`release` = production** (Render + Vercel, npm packages). Sirf `prerelease` se PR (ya `hotfix/<naam>` se, neeche).
   - **`main` = master: sirf final code.** Release safal hone (deploy + demo check) ke baad hi PR `release` → `main`. `main` pe kabhi seedha kaam ya feature PR nahi.
   - **Back-merge:** `release` pe bane commits (package CLI ka release commit + tags, hotfix) ke baad PR `release` → `prerelease`, taaki development naye versions pe chale.
   - **Hotfix:** production me turant fix chahiye to `release` se `hotfix/<naam>` → PR `release`; phir `release` → `prerelease` aur release safal hone pe `release` → `main`.
   - **`prerelease` pe chhota fix seedha push ho sakta hai (owner, 2026-10-25).** Chhota fix = ek chhoti baat, 1–3 files: typo, doc ki line, galat message ya config value, flaky test, ek-do line ka bug fix. Push se pehle: `git pull --rebase`, phir local `npm run format:check`, `npm run lint`, `npm run typecheck` aur badle package ka test (push ke baad CI `prerelease` pe chalta hai; laal ho to turant theek karo). Force push kabhi nahi. Seedha push **nahi**, branch + PR hi: naya feature, paisa/stock/permissions, kernel packages (`packages/backend/*`, `packages/shared/*`) ka logic, data ya schema badlav, dependency update, CI/workflows ya ruleset.
   - `main` aur `release` pe seedha push nahi, sirf PR. PR pe approval zaroori nahi (owner, 2026-10-25: ruleset me approvals 0); merge sirf jab CI `check` green ho (ruleset me zaroori). CI ka `check` ye flow bhi jaanchta hai: `main` me sirf `release` se, `release` me sirf `prerelease` ya `hotfix/*` se PR. Ek hi apwaad: package release ka commit + tags owner `release` pe push karta hai (package CLI).
2. **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Ek commit me ek hi baat.
3. **PR:** chhota rakho, description me kya aur kyun, aur kaise test kiya. CI green hue bina merge nahi.
4. **Public repo:** koi secret, `.env`, token, test password, DB dump ya asli personal data kabhi commit nahi. Sirf `.env.example`. Gitleaks har PR pe chalega.
   - **Env files (owner, 2026-10-26), har us folder me jahan envs hain** (`backend/<name>`, `frontend/<app>`): `.env.example` git me (laptop ki values + har key ki live value kahan se, secret kabhi nahi); `.env` laptop (dev scripts padhti hain); `.env.production` owner ki private copy un live values ki jo Render/Vercel me daali (live server dashboard se env leta hai; sirf `npm run db:release -- --env live` `backend/bundle/.env.production` padhta hai, `live` type karne ke baad: owner, 2026-10-27). `.gitignore` `.env` aur `.env.*` rokta hai, sirf `.env.example` chhod ke. Claude `.env`/`.env.*` kabhi nahi kholta.
5. **Dependencies:** `npm run update-deps` (ya Renovate/Dependabot) ke PRs `prerelease` pe; major version upgrade alag PR me.

## 3. Code: sabke liye

1. **TypeScript strict.** `any` nahi; `unknown` + zod parse.
2. **Bahar se aane wala har data zod se validate** (API input, env, webhooks, files, events). zod hamesha `@beautinique/shared-zod` se aur naam se import hota hai (`import { object, string, gstinZod } ...`), `z.` nahi; seedha `zod` sirf us package ke andar (ESLint rokta hai). Hamare schemas ke naam `Zod` pe khatam (`emailZod`); `enum` ko `enum as zodEnum`.
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
14. **Migrations:** forward-only, idempotent, expand/contract; boot pe chalti hain (har deployable ki `src/release.ts`, `@beautinique/backend-server-release`). Id `YYYYMMDD-NNN-words`, list ke aakhir me; chal chuki migration ki id ya `up` kabhi nahi badalti (galti = nayi migration). Lambi backfill migration me nahi, queue task me (boot ke saare steps 60 s). Index uske naam ke neeche kabhi nahi badalta: nayi shakal = naya naam, purana baad me migration se hatao.
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
2. **Mutation tests, 3 hisse (owner ka faisla 2026-10-22; har badlav pe poora run bahut dheema tha):** (a) **Kernel packages** (`backend-server-mongo`, `server-queue`, `server-crypto`, authz/login, paisa/ledger): package pehli baar bante waqt ek poora run, background me, kaam roke bina; baad me badlav ho to sirf **badli lines ke mutations**. (b) **Nazuk logic** (paisa ka hisaab, stock reservation, permissions/authz, go-live, checkout): badli lines ke mutations. (c) **Baaki backend modules aur apps** (CRUD, UI, screens): mutation nahi; tests, lint, types, review aur asli flow/browser check. Speed: har mutation pe sirf us hisse ke tests, aur mutation runs alag Docker Mongo/Valkey pe (normal kaam saath chalta rahe). Bacha mutation (survivor) ya test jodo, ya likho kyun equivalent hai. Tool: `npm run mutate -- --package <category>-<name>` (ya deployable, jaise `--package gateway`: uske security checks) (`scripts/mutation/`): package ki `test/mutations.ts` ki har galti ek temp copy me daal ke tests chalata hai (asli files kabhi nahi badalti), pehle saare anchors check karta hai (purani list turant error), aur bina `survives` wajah ke bacha mutation = exit code 1. Badli lines: `--changed` (uncommitted) ya `--changed --base main` (branch). `--only 3,5`, `--show-fails`. Backend packages ke liye pehle `npm run infra:mutation:up`. Har mutation me `tests: "<naam ka hissa>"` do to sirf wahi tests chalte hain (bahut tez).
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

1. Assistant **kam se kam tokens** use kare: targeted edits, zaroorat ke hisaab se padhna. Review, checks aur research assistant khud kare. Agents sirf extreme zaroorat pe, pehle bata ke, aur **ek ek karke**: ek waqt me ek hi agent (parallel nahi), agla tabhi jab pichhla poora ho jaye (owner, 2026-10-25: parallel review agents ne ek run me ~0.7M tokens liye aur limit pe ruk gaye).
2. Destructive kaam (delete, force push, data hatana) se pehle owner se poochho.
3. Commit ya push sirf owner ke kehne pe.
4. Mutation testing (code me jaan-boojh ke galti daal ke dekhna ki tests pakadte hain) app files me seedha nahi, ek copy me, kyunki owner ka dev server file badalte hi reload hota hai.
5. Har claim (pricing, limits, kanoon) official source se check karke likhna, aur jo verify nahi hua wo saaf likhna.

## Change log

| Version | Date       | Badlav                                                                                                                                                                                                                |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-10-19 | Pehla version: kaam, git, code, backend, frontend, testing, security, docs aur AI assistant ke niyam.                                                                                                                 |
| v1.1    | 2026-10-20 | Apps sirf English; INR aur dates `en-IN`.                                                                                                                                                                             |
| v1.2    | 2026-10-20 | Icons rule: `workspace:*` ki jagah npm workspaces ka local link.                                                                                                                                                      |
| v1.3    | 2026-10-20 | §2: `main` default branch; flow `main` → `prerelease` → `release`; package release ka apwaad aur back-merge; Renovate `main` pe.                                                                                      |
| v1.4    | 2026-10-20 | §3.2: zod sirf shared-zod se, named imports, schemas ke naam `...Zod`.                                                                                                                                                |
| v1.5    | 2026-10-22 | Mutation testing 3 hisse me: kernel packages (pehli baar poora, phir badli lines), nazuk logic (badli lines), baaki nahi.                                                                                             |
| v1.6    | 2026-10-22 | Mutation ka tool `npm run mutate` (scripts/mutation), lists har package ke `test/mutations.ts` me.                                                                                                                    |
| v1.7    | 2026-10-25 | §2: PR pe approval zaroori nahi (ruleset approvals 0), CI `check` green zaroori.                                                                                                                                      |
| v1.8    | 2026-10-25 | §2: naya flow: `prerelease` = development, `release` = production, `main` = sirf final code (release safal hone ke baad); back-merge `release` → `prerelease`, hotfix, CI flow check; dependency PRs `prerelease` pe. |
| v1.9    | 2026-10-25 | §2: `prerelease` pe chhota fix seedha push (kya chhota hai, push se pehle checks, kya kabhi seedha nahi); `main` aur `release` pe sirf PR.                                                                            |
| v1.10   | 2026-10-25 | §6: mutation runner deployable bhi leta hai (`--package gateway`).                                                                                                                                                    |
| v1.11   | 2026-10-25 | §9: agents sirf extreme zaroorat pe, ek ek karke (parallel nahi), owner.                                                                                                                                              |
| v1.12   | 2026-10-26 | §2.4: env files: `.env.example` (git), `.env` (laptop), `.env.production` (owner ki private copy, koi code nahi padhta).                                                                                              |
| v1.13   | 2026-10-27 | §1.14: migrations ke niyam (id, kabhi nahi badalti, 60 s, index ka naam); §2.4: `.env.production` sirf `npm run db:release -- --env live` padhta hai (owner).                                                         |
