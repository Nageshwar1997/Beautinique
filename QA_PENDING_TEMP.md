# QA audit: bacha kaam (TEMP tracking)

> **Temp file, sirf owner ki tracking ke liye.** Owner ke kehne pe (2026-11-09) abhi git me rehti hai; status update har item ke commit me. Kisi aur doc, file ya memory me iska zikr nahi. Saare items **Done** hote hi ye file repo se delete.
>
> **Last update:** 2026-11-12 (hissa 0, 1 aur 2 poore; Done: 1–9, 15a, 15, 16, 14, 10; batch chal raha; agla 11 DR-002). **Faisla:** owner ne neeche ki har salah maan li (2026-11-09). Asli docs (report §9 "Owner ka jawab", ARCHITECTURE/RULES/README, MEMORY decision, HANDOFF, TASKS, change logs) har item ke commit me update honge, is file ka naam liye bina.

## Kitna bacha

| Hissa                     | Items  | Done   | Bacha | Claude ka andaaza (8 ghante = 1 din) |
| ------------------------- | ------ | ------ | ----- | ------------------------------------ |
| 0. Release aur shuruaat   | 4      | 4      | 0     | Ho gaya                              |
| 1. Abuse aur limits       | 4      | 4      | 0     | Ho gaya                              |
| 2. Permissions, step-up   | 5      | 5      | 0     | Ho gaya                              |
| 3. Chhote backend         | 2      | 1      | 1     | ~0.5 din                             |
| 4. Apps                   | 7      | 4      | 3     | ~1.1 din                             |
| 5. CI                     | 1      | 0      | 1     | ~0.4 din                             |
| 6. Aakhri kadam           | 4      | 0      | 4     | ~1.5 ghante                          |
| **Kul (Claude)**          | **27** | **18** | **9** | **~3 din**                           |
| Owner ke haath ke (O1–O4) | 4      | 0      | 4     | owner ka time                        |

**Status:** `Pending` (shuru nahi), `Chal raha`, `Done`, `Ruka` (kisi ka intezaar). Har item Done hone pe upar ki table bhi.

## Har item pe niyam (asli docs me jo likha hai, wahi)

- Branch `feat/qa-audit` (`prerelease` se), har item ka apna commit, sab ke baad ek PR → `prerelease`. Commit, push, PR sirf owner ke kehne pe; push se pehle gitleaks.
- Pehle code me jaancho ki baat abhi bhi sach hai; phir failing test (purane code pe fail dikhao), phir fix.
- Definition of Done: lint, typecheck, poora `npm test`, format:check. UI ho to customer/admin E2E + browser (light/dark/360). Security/permission/kernel ki badli lines pe mutation (RULES §6, `infra:mutation:up`/`down`). Frontend pe mutation nahi.
- Docs usi commit me: report §9 me "Owner ka jawab" (2026-11-09, Claude ki salah) + kya bana; jis doc ka niyam badla (ARCHITECTURE §7.1 wagairah) + version + change log; MEMORY decision (aur sabak ho to); HANDOFF §4.

## Order (isi kram me)

### 0. Release aur shuruaat

| #   | Kaam                                                                                                                        | Kaun                        | Mehnat   | Status | Commit / PR                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------- | ------ | ------------------------------------------------------- |
| 0.1 | PR `prerelease` → `release` (PR #60 ke fixes live; QA-ID-001 P1 release tak live pe khula)                                  | Claude PR, owner merge      | 10 min   | Done   | PR #61 merge (2026-11-09, `38efee4`; live `e1bb7b9`)    |
| 0.2 | Release ke baad live jaanch: `bq-live` `/status` ok; customer + admin pe ek-ek GET se security headers; admin header 360 px | Claude (owner ki ijazat se) | 15 min   | Done   | Theek: `/status` ok, headers, admin 360 px (2026-11-09) |
| 0.3 | Gate 1: release ke baad report me fix hue live findings (QA-ID-001 wagairah) ka poora repro, jo ab tak redacted tha         | Claude                      | 1 ghanta | Done   | Report v1.28 (2026-11-09)                               |
| 0.4 | `prerelease` se branch `feat/qa-audit`; HANDOFF §4 item 6 update (PR #60 merge, release PR, agla kaam ye decisions)         | Claude                      | 15 min   | Done   | HANDOFF v1.157 (2026-11-09)                             |

### 1. Abuse aur limits (sabse zaroori)

| #   | ID     | Kya karna (salah, owner ne maani)                                                                                                                                                                                                                          | Mehnat | Status | Commit                     |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | -------------------------- |
| 1   | DR-005 | `/auth/refresh` (aur logout) ki apni rate class: per session / refresh-token family, IP ka bada budget; login/verify `auth` me hi. Ek IP (CGNAT) ke peeche ke users sign-out na hon                                                                        | ½ din  | Done   | DR-005 commit (2026-11-09) |
| 2   | DR-004 | Bina sign-in password hash ka global budget (sab IPs ka), IPv6 ke liye `/48` ka bada bucket (`auth`, `otp`), aur sasta check (lock/grant) pehle, hash baad me                                                                                              | 1 din  | Done   | DR-004 commit (2026-11-12) |
| 3   | DR-003 | Lock account + IP pe (10 galat / 15 min → 1 ghanta us IP ke liye); saare IPs milake bahut zyada galti pe hi account-wide chhota lock; lock ke dauraan tries se lock lamba nahi; password-reset code ka per-IP hissa, taaki koi victim ka reset na kha sake | 1 din  | Done   | DR-003 commit (2026-11-12) |
| 4   | DR-009 | Sign-up code emails ka din ke budget me alag chhota hissa (reset/invitation ke liye bache); `otp` ka global budget + IPv6 coarse bucket; budget khatam pe app me saaf sandesh; budget ke paas warning log                                                  | 1 din  | Done   | DR-009 commit (2026-11-12) |

### 2. Permissions aur step-up

| #   | ID     | Kya karna                                                                                                                                              | Mehnat   | Status | Commit                     |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------ | -------------------------- |
| 5   | Q-007  | Jo custom role khud ko appoint kare (`appointedBy` me apna key), use `roleProblems` refuse kare                                                        | 2 ghante | Done   | Q-007 commit (2026-11-12)  |
| 6   | DR-007 | Security Officer Master ka authenticator reset nahi kar sakta; Master ka reset sirf doosra Master kare                                                 | ½ din    | Done   | DR-007 commit (2026-11-12) |
| 7   | DR-008 | Reviewer roles ki `GET /iam/grants` list me sign-up/self roles (`customer.customer`, applicants) nahi; ek user email se dhoondh sakte (`?email=`)      | ½ din    | Done   | DR-008 commit (2026-11-12) |
| 8   | DR-010 | "Turn off authenticator" aur "Set up on a new phone" pe hamesha naya code (window 0); baaki step-up ka 5 min window wahi, Master ke grants bhi         | ½ din    | Done   | DR-010 commit (2026-11-12) |
| 9   | DR-006 | Social sign-in method hatane se pehle "recent sign-in" (10 min ke andar password ya email code; authenticator wale account pe step-up), auth-ui me bhi | ½ din    | Done   | DR-006 commit (2026-11-12) |

### 3. Chhote backend

| #   | ID     | Kya karna                                                                                                                                             | Mehnat   | Status  | Commit                     |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | -------------------------- |
| 10  | DR-001 | Public `/ready` ka jawab 5 s reuse (`/status` jaisa), taaki flood se har call pe 4 internal calls na hon                                              | 1 ghanta | Done    | DR-001 commit (2026-11-10) |
| 11  | DR-002 | HIBP fail-open rahe; 5xx pe bhi warning; bina jaanch aaye password pe `hibpPending` nishaan, agle sign-in pe dobara jaanch, leak mile to reset maango | ½ din    | Pending |                            |

### 4. Apps

| #   | ID      | Kya karna                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Mehnat   | Status  | Commit                    |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ------------------------- |
| 12  | DR-011  | Jahan app policy ya role authenticator maange, wahan "Turn off" ki jagah saaf hint; dialog ka text app ke hisaab se                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 3 ghante | Pending |                           |
| 13  | Q-010   | Do tabs ka refresh race: 409 ke baad retry 401 de to ek baar aur `refresh()`; test me fake gateway 409 ke baad cookie der se de                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 3 ghante | Pending |                           |
| 14  | Q-009   | Internal apps: page load bhi activity (`post({ type: 'active' })`); browser me admin pe chalana                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 1 ghanta | Done    | Q-009 commit (2026-11-10) |
| 15  | Q-014   | 9 khaali apps me saada "Coming soon" page (app ka naam + ek line) aur sahi manifest description (manifest description 15a me ho gaya); `npm run create:app` template me bhi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 3 ghante | Done    | Q-014 commit (2026-11-10) |
| 15a | INSTALL | Owner ne phone pe pakda (2026-11-09): customer install karne pe app jaisa khulta, baaki apps browser jaise (upar URL bar). **Owner chahta hai saare 11 apps phone pe app ki tarah install hon.** Wajah: sirf customer ka web app manifest hai (`display: standalone`, icons), admin, seller, master wagairah 9 apps me koi manifest nahi, to "install" sirf browser shortcut banata. Har app ka apna manifest (`name` jaise "Beautinique Admin", `short_name`, `display: standalone`, `start_url`/`scope` `/`, theme/background rang, customer jaise icons + maskable), `index.html` me `<link rel="manifest">`, `apple-touch-icon`, `theme-color`; delivery ka (vite-plugin-pwa) manifest bhi jaancho (abhi sirf SVG icon); `npm run create:app` template me bhi; CI test ki har app ka manifest sahi aur uske icons maujood. Q-014 ke saath (wahi apps aur template), alag commit; phone pe jaanch O4 | 3 ghante | Done    | 15a commit (2026-11-09)   |
| 16  | Q-013   | Delivery PWA: `workbox.navigateFallbackDenylist: [/^\/api\//]` + test (report T8.6 kehta, par abhi sasta)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 30 min   | Done    | Q-013 commit (2026-11-10) |
| 17  | Q-008   | DatePicker segment me ek saath kai digits (`insertText`) aayein to ek-ek char me todna, unit test ke saath (asli Android jaanch O2 me)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 3 ghante | Pending |                           |

### 5. CI

| #   | ID    | Kya karna                                                                                                                                                    | Mehnat   | Status  | Commit |
| --- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------- | ------ |
| 18  | Q-015 | `release.yml` aur `ci.yml` ke GitHub actions SHA pe + Dependabot (`github-actions`); `npm run create:app` naye app ka `vercel.json` aur uska test bhi banaye | 3 ghante | Pending |        |

### 6. Aakhri kadam

| #   | Kaam                                                                    | Kaun                   | Mehnat | Status  | Commit / PR |
| --- | ----------------------------------------------------------------------- | ---------------------- | ------ | ------- | ----------- |
| 19  | PR `feat/qa-audit` → `prerelease` (CI green, owner merge)               | Claude PR, owner merge | 30 min | Pending |             |
| 20  | PR `prerelease` → `release`, deploy ke baad live jaanch                 | Claude PR, owner merge | 30 min | Pending |             |
| 21  | Report final: §0 aur §9 me sab ka jawab aur halat, version + change log | Claude                 | 30 min | Pending |             |
| 22  | Ye temp file delete                                                     | Claude                 | 1 min  | Pending |             |

## Owner ke haath ke (kabhi bhi)

| #   | ID      | Kya karna                                                                                                                                                                                                                                                                            | Status  |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| O1  | Q-006   | Render: `bq-live` → Logs me request id `01a1a5fc-f6a8-77c3-9657-37178a022264` (2026-11-04 ~09:50 UTC) aur Events me us waqt ka deploy. Vercel: har project → Settings → Environment Variables me `ORIGIN_SECRET` Production **aur** Preview dono me linked. Jo mile, Claude ko batao | Pending |
| O2  | Q-008   | Ek Android phone (Chrome + Gboard) pe DatePicker me tareekh type karke dekho: segment me ek saath 8 digits aate hain ya ek-ek. Jab koi form DatePicker use kare tab bhi chalega                                                                                                      | Pending |
| O3  | Q-005   | Sirf nazar: CI ya Vercel pe customer build "Prerender ... timeout" pe fail ho to Claude ko batao (tab build me retry)                                                                                                                                                                | Pending |
| O4  | INSTALL | Item 15a ke release deploy ke baad: phone pe har app (pehle admin, phir baaki) install karke dekho ki URL bar ke bina app jaisa khulta hai. Purana shortcut hata ke dobara install karna (purana shortcut browser jaisa hi rahega)                                                   | Pending |

**Sirf jaankari, koi kaam nahi:** PERF-OBS-02 (kuch queries memory me sort; list badi hone pe index), PERF-OBS-01 (`msgpackr-extract` install script), M9 notes (`maskEmail` ek akshar, `slugify` khaali), Mongo outage test (§7 NOT TESTED), §8 ke 39 test ideas.

## Agle chat ke liye prompt

```text
QA audit ke bache faisle (report §9 ke DR-001…DR-011, Q-005…Q-015, aur owner ka item 15a INSTALL) ek-ek karke karo. Poori list, kram, mehnat aur status repo root ki temp file QA_PENDING_TEMP.md me hai. Us file ke niyam: wo abhi git me rehti hai (owner, 2026-11-09) aur uska status update har item ke commit me jaata hai, kisi aur doc, file ya memory me uska zikr nahi, har item ke baad uska status aur upar ki "Kitna bacha" table update, aur sab Done hone pe file repo se delete.

Owner ne us file ki har salah maan li hai (2026-11-09). Ye faisla asli docs me har item ke commit me likho: report §9 "Owner ka jawab" (2026-11-09, Claude ki salah) aur kya bana, jis doc ka niyam badla (ARCHITECTURE/RULES/README) + version + change log, MEMORY decision, HANDOFF §4; TASKS badle to §P bhi. Temp file ka naam kahin nahi.

Shuruaat (file ka hissa 0): git fetch. Release PR (prerelease → release) merge hua ho to: (0.2) live jaanch, har GET se pehle mujhse poochh ke; (0.3) Gate 1 ke mutabik fix hue live findings ka poora repro report me. Phir (0.4) prerelease se branch feat/qa-audit, aur HANDOFF §4 item 6 update (PR #60 merge, release PR, agla kaam ye faisle). Phir item 1 se kram me.

Har item: (a) code me jaancho ki baat abhi bhi sach hai, (b) failing test pehle (purane code pe fail dikhao), (c) fix, (d) Definition of Done: lint, typecheck, poora npm test, format:check; UI ho to customer/admin E2E + browser light/dark/360; security/permission/kernel ki badli lines pe mutation (RULES §6), frontend pe nahi, (e) docs, (f) ek item ek commit. Item me koi nayi baat ya asli business choice nikle to recommendation ke saath mujhse poochho. Commit, push aur PR sirf mere kehne pe; push se pehle naye commits pe gitleaks (`gitleaks git --config .gitleaks.toml --redact --log-opts="origin/feat/qa-audit..HEAD"`; pehli push pe `origin/prerelease..HEAD`).

Security: report me live pe exploit ho sakne wale findings redact hain (Gate 1); unka poora repro sirf chat me, public report aur PR me fix release hone ke baad hi.

Niyam: chat Hinglish me. Production (Render, Vercel, Atlas, Brevo, Sentry, cron-job.org, Better Stack, UptimeRobot) ki settings ya deploy khud mat chhuo; steps mujhe do. Agent sirf zaroorat pe aur ek waqt me ek. Weekly usage ~85% pe naya item mat uthao: kaam commit-ready, HANDOFF §4 saaf, aur temp file ka status sahi. Kaam rokte waqt HANDOFF update karo.

Laptop ke sabak: E2E se pehle `docker ps` (khaali ho to `npm run infra:up`); apps packages ka dist use karte hain, to E2E/playground se pehle `npm run build --workspace @beautinique/<name>`; E2E me "Redis did not answer within 500 ms" flake aaye to usi project me wahi test dobara chalao aur imaandari se batao; E2E ke dauraan dev servers band; backend mutation se pehle `npm run infra:mutation:up`, baad me `infra:mutation:down`; regex/backslash wala code Edit tool se likho; user-event ke label clicks pe bharosa nahi (fireEvent + Chromium E2E); jsdom me layout nahi; browser pane ki 360 emulation React Aria checkbox pe gadbad karti hai; commit se pehle `git status` (files kabhi apne aap staged hoti hain); CLI ko process bana ke chalane wale test ko apni timeout do.
```
