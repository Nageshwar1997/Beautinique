# RULES: Beautinique

> **Status:** v1.2.11 (2026-11-26). Kaam ke niyam. Saare sections: §1 (Definition of Done), §2 (Git aur release gate), §3 (Code), §4 (Testing), §5 se §7 (security, docs, AI); D-381 se D-387, D-397, D-398, D-429, D-430, D-459, D-464. Cheezein ek-ek karke, owner ki haan ke baad judti hain.

## Is file me kya aayega

1. Definition of Done.
2. Git aur release.
3. Code: sabke liye, backend, frontend.
4. Testing.
5. Security aur privacy.
6. Docs.
7. AI ke saath kaam.

Section ke number isi list ke kram se; jo section abhi khaali hai, wo likha nahi gaya. Niyamon ke id: code `CR-<n>`, testing `RT-<n>`, Definition of Done `DD-<n>`, release gate `RG-<n>`. "Misaal" wale numbers settings ya code me badal sakte hain. Tools ke naam (Vitest, Playwright, StrykerJS, axe, fast-check) prastaav hain; jahan tool ya provider ki jaanch baaki hai, wahan "jaanchna baaki" likha hai.

## Tab tak

Hamesha laagu niyam root [CLAUDE.md](../CLAUDE.md) me hain. Unhe laagu karne wale ESLint rules aur CI checks naye code ke saath banenge.

## 1. Definition of Done (D-387)

Ek subtask tab "ho gaya" jab:

1. **DD-1:** uske har acceptance criterion ([ACCEPTANCE.md](ACCEPTANCE.md)) ka kam se kam ek automated test, test ke naam me criterion ka id; mana hone wale raaste bhi (RT-20).
2. **DD-2:** badle routes, events aur facades ke contract tests update; naya route route × actor matrix me (RT-35).
3. **DD-3:** jis flow ko chhua, uski E2E spec update aur green.
4. **DD-4:** CI ka `check` green; koi naya `.skip` bina issue ke nahi; koi naya flaky nahi.
5. **DD-5:** kernel packages aur paisa, stock aur permissions ke code me area ki coverage seema neeche nahi (D-371).
6. **DD-6:** code mutation ki jagahon me hai to badli lines ka mutation job green, koi bina wajah ka bacha mutant nahi (D-372, RT-22).
7. **DD-7:** jin security niyamon (SR) ko chhua, unke tests; logs me koi secret ya personal data nahi; koi secret repo me nahi.
8. **DD-8:** chhui screens pe axe me serious ya critical 0, keyboard se poora kaam, aur 320 px pe horizontal scroll nahi.
9. **DD-9:** data ke badlav pe expand aur contract ka niyam, aur release step ka test.
10. **DD-10:** bundle budget aur database operations ka budget nahi toota; nayi query index se.
11. **DD-11:** `TASK.md` me status, tests ki links aur change log ki line; "verified" sirf haath ke record ya live smoke ke saath (D-377).
12. **DD-12:** PR ke description me "kaise jaancha" (RT-42).
13. **DD-13:** jis role ka feature bana ya badla, uska manual ([manuals/](manuals/README.md)) (kai apps ka saajha feature ho to [manuals/COMMON.md](manuals/COMMON.md) me, apps ki list ke saath) aur us app ki testing file ([testing/](testing/COMMON.md)) usi PR me; owner ka koi naya bahar ka kaam (jaise env key) [OWNER_TASKS.md](OWNER_TASKS.md) me (D-440).

## 2. Git aur release

Branch aur release ka flow root [CLAUDE.md](../CLAUDE.md) aur [OPERATIONS.md](OPERATIONS.md) §2 aur §3 me.

### 2.1 R1 ka release gate (D-387)

R1 tab release ho jab saari sharten poori hon ([OPERATIONS.md](OPERATIONS.md) §3 ke release kram ke andar):

| #     | Shart                                                                                                                                                                                                       | Saboot                              |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| RG-1  | FL-1 se FL-20 aur "poora R1" spec green, compiled JS aur bundle mode pe, laptop pe                                                                                                                          | E2E ka report                       |
| RG-2  | Requirement ki ginti: SECURITY_REQUIREMENTS ke `Release` column me R1 wale har SR (aur `R1; R2 me` wale ka R1 hissa), flow, acceptance criterion aur R1 wale CL row ka test ya likha record; kami 0 (RT-24) | Ginti ki script ka report           |
| RG-3  | Paise ke invariants: property aur concurrency tests green; "poora R1" ke data pe milaan me farak 0                                                                                                          | Test report, milaan ka nateeja      |
| RG-4  | Kernel packages ka pehla poora mutation run ho chuka (D-372); bache mutants ki wajah likhi; score seema ke upar                                                                                             | Mutation report                     |
| RG-5  | Security: `guard` green; high ya critical dependency alert nahi; passive DAST me high nahi; headers ke tests green                                                                                          | CI aur scan ka report               |
| RG-6  | Accessibility: axe me serious ya critical 0; DS-8.1 ki haath ki checklist mukhya flows pe, D-376 ke screen readers pe                                                                                       | Checklist ka record                 |
| RG-7  | Performance: 512 MB ka naap (aam RSS 400 MB se neeche, koi OOM nahi); server ke p95 targets; 5 pages ke page targets; bundle budget                                                                         | OPERATIONS §10 ki table, report     |
| RG-8  | Design target ka load test (D-379), aur baad me data ki sachchai                                                                                                                                            | Load test ka report                 |
| RG-9  | Backup liya; restore ka pehla abhyaas ho chuka                                                                                                                                                              | OPERATIONS §6 ki abhyaas wali table |
| RG-10 | Migration ke tests aur ek release peeche rollback ka abhyaas green                                                                                                                                          | Test report                         |
| RG-11 | Providers ke asli test mode se milaan (payment, email, social sign-in, media) ek baar (RT-14)                                                                                                               | Haath ka record                     |
| RG-12 | Asli phone pe checks (D-375): Android pe Delivery aur Customer, iPhone pe Customer; iPhone na mila to release note me khula                                                                                 | Haath ka record                     |
| RG-13 | Koi khula P0 ya P1 bug nahi; P2 release note me (D-378)                                                                                                                                                     | Bugs ki list                        |
| RG-14 | Deploy ke baad live smoke check pass ([OPERATIONS.md](OPERATIONS.md) §3 niyam 9, smoke order D-380); iske baad hi "R1 live pe verified"                                                                     | Smoke ka record                     |

## 3. Code (D-429)

Tools D-001 ke; folder aur naam D-002 ke. Jahan niyam ke saath lint ya CI ka pehra likha hai, wo pehra niyam ke saath hi banta hai, aur ek "galat" misaal wala test jo pehre ke bina fail ho (RT-43 jaisa).

### 3.1 Sabke liye

1. **CR-1:** TypeScript strict, sirf ESM. `any` nahi; bahar se aaya data `unknown` hai jab tak zod se parse na ho.
2. **CR-2:** bahar se aane wala har data zod se jaancha jaaye: API input, env, webhooks, events (RT-6), queue ke jobs, files ki jaankari, aur providers ke jawab.
3. **CR-3:** config sirf us service ke config module se; `process.env` uske bahar nahi padha jaata (lint). Har service sirf apne namespace ke secrets (SR-071). Har environment ki har key required aur apni env file se; code me koi default ya optional key nahi ([OPERATIONS.md](OPERATIONS.md) §1 niyam 9, D-441).
4. **CR-4:** jo data hai wo code me nahi likha jaata: states, districts, sub-districts, pincodes, hubs, warehouses, roles, rates (GST, TCS, TDS, fees) aur kanooni seemaayein; ye data ya settings me (D-037). Lint `src/` me state ke naam aur pincode jaisi 6 ank ki string rokta hai (tests aur fixtures chhod ke). _Wajah:_ naya area bina code change ke khule.
5. **CR-5:** role ke naam se koi faisla nahi (jaise `role === "MASTER"`); faisla hamesha permission aur scope se ([ARCHITECTURE.md](ARCHITECTURE.md) §11). Lint role ki keys ki tulna rokta hai. _Wajah:_ sub-role bina deploy judte hain (D-017), aur bypass ka raasta na bane.
6. **CR-6:** naam: files `kebab-case`; React components `PascalCase`; functions aur variables `camelCase`; constants `UPPER_SNAKE_CASE`; events `<service>.<cheez>.<past tense>` (jaise `logistics.area.changed`); permissions `<service>.<resource>.<action>`.
7. **CR-7:** paisa hamesha integer paise me, rates basis points me; float kabhi nahi ([ARCHITECTURE.md](ARCHITECTURE.md) §10.1). Ids ka niyam bhi wahi.
8. **CR-8:** id kabhi secret nahi: andaaza lag sakta hai, to har cheez permission aur scope se khulti hai. Bina sign-in wale link ke liye alag random token (jaise D-418 ka QR).
9. **CR-9:** HTTP calls axios se (D-001). Chhoot sirf jahan stream chahiye (jaise gateway ka proxy), wajah ke comment ke saath.
10. **CR-10:** comments sirf "kyun" ke liye, "kya" ke liye nahi. Formatting Prettier aur ESLint se, CI me jaanch.
11. **CR-11:** commits Conventional Commits me (`type(scope): description`), ek commit me ek baat; koi AI attribution nahi ([CLAUDE.md](../CLAUDE.md)). Poora tareeka [GIT_SKILLS.md](GIT_SKILLS.md) me.
12. **CR-37:** aam helper (file padhna, paths, env, format; jo kisi module ke niyam ya data nahi jaanta) jo code aur tests, ya kai modules use karte hain, ek alag `utils/` folder me (misaal `src/utils/`), aur sab wahin se import karte hain. Jo aam helper sirf tests ke beech saajha ho, wo `test/utils/` me. Module ka apna logic `utils/` me nahi jaata (CR-38) (owner, D-459).
13. **CR-38:** module ka apna logic, type aur constant usi module me, aur wahin se export; test module ki exported cheez seedha import kar sakta hai, par andar ki (bina export wali) cheez nahi. Module bada ho to uska ek hissa apni file me (misaal `configs/vitest/coverage.ts`). Jo helper, type ya constant sirf ek file ke andar kaam aata hai, wo usi file me bina export (D-459).
14. **CR-39:** `types/` aur `constants/` folder sirf un types aur constants ke liye jo kai modules me saajhe hain, module ya vishay ke naam ki file me; sirf tests ke beech saajha constant `test/constants/` me. zod se bane types (`z.infer`) hamesha apne schema ke saath (D-459).
15. **CR-40:** jahan code data pe kaam karta hai (dhoondhna, milana, dedupe, group, sort, queue, path ya range ka milan), wahan sahi data structure aur algorithm (owner, D-464):
    1. "Hai ya nahi" aur milan `Set` aur `Map` se, ek baar banake; loop ke andar `includes`, `find` ya `indexOf` se nahi.
    2. Do lists ka milan ya group ek pass me `Map` se. Loop ke andar loop (O(n²)) sirf jab dono sire chhote aur seema wale hon, aur seema likhi ho (comment ya schema ka `.max()`).
    3. Sort ek baar aur sirf zaroorat pe; sirf sabse bada, sabse chhota ya top-k chahiye to poora sort nahi. Comparator poora: barabar pe doosra kaam, taaki nateeja har baar wahi.
    4. Queue me loop ke andar `shift()` nahi (har baar sab khisakta hai). Path, prefix aur range ke milan ke liye uska sahi tareeka (trie, sorted array pe binary search); jo har request pe chalta hai, uska lookup boot pe ek baar bane.
    5. Jahan tareeke ka chunav saaf nahi dikhta, wahan ek line comment: kaun sa tareeka, aur uska O(). Bahar se aane wale input ki seema pehle (SR-007), phir kaam.
    6. Jo function bade input pe chalta hai, uska ek bade input (misaal 10^5 items) ka test, bina time ki shart ke (RT-25): hang ya O(n²) test ke apne timeout se pakda jaata hai. Kernel packages me zaroor.
    _Wajah:_ live system chhota hai (512 MB, free tier), par code asli users maan ke likha jaata hai; ek chhupa O(n²) tab dikhta hai jab data badh chuka ho.
16. **CR-41:** zod ka har schema aur har check message ke saath, jisme field ya key ka naam ho (owner, 2026-11-26): `string('email is required.')`, `.min(1, 'email is required.')`, `.regex(re, 'email must be a valid email address.')`, `enum(['test', 'live'], 'mode must be test or live.')`, `strictObject({ ... }, 'The body takes only a, b.')`. Message ke aakhir me period. Named imports (`import { string } from 'zod'`), `z.` nahi. Message seedha schema me likha dikhe; koi helper jo use chhupaye nahi. Jahan field chhodna ho wahan `.optional()`, `null` ho sakta ho to `.nullable()`. Tests ke schemas par bhi yehi. _Wajah:_ error akela padhne par bata de ki kaunsi field galat hai, bina schema kholne ke.

### 3.2 Backend

1. **CR-12:** contracts pehle: har route, event, permission aur error code pehle contracts me, phir handler ([ARCHITECTURE.md](ARCHITECTURE.md) §5 niyam 1). Bina contract ka route nahi banta.
2. **CR-13:** service ki deewar SR-071 se: doosri service ka database ya andar ka code import nahi, sirf facade aur events (lint).
3. **CR-14:** transaction ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §10.2 se: andar queries ek ke baad ek (kabhi `Promise.all` nahi), bahar ki koi call nahi, jawab commit ke baad.
4. **CR-15:** doosri service ka kaam aur bahar ke side effects (email, push) sirf outbox ke events se ([ARCHITECTURE.md](ARCHITECTURE.md) §3).
5. **CR-16:** paise, stock, order aur delivery ke har likhne wale route pe idempotency key ([ARCHITECTURE.md](ARCHITECTURE.md) §5 niyam 10).
6. **CR-17:** har handler `authorize` se (SR-032); koi bypass nahi, Master ke liye bhi nahi.
7. **CR-18:** errors ek hi roop me ([ARCHITECTURE.md](ARCHITECTURE.md) §5 niyam 8); user ka sandesh error code se, sandesh ka text ek jagah.
8. **CR-19:** samay wale kaam ki due date database me aur kaam queue se ([ARCHITECTURE.md](ARCHITECTURE.md) §4); `setInterval` se business ka kaam nahi. "Abhi" sirf injected clock se (RT-13).
9. **CR-20:** har query aur har sort index se ([ARCHITECTURE.md](ARCHITECTURE.md) §10.4 niyam 8); jaan-boojh ke poora padhna sirf wajah ke comment ke saath (RT-43).
10. **CR-21:** files sirf media service ke port se; business data me sirf `assetId` ([ARCHITECTURE.md](ARCHITECTURE.md) §7).
11. **CR-22:** logs me OTP, password, token, cookie, PAN, bank number aur poora address kabhi nahi (SR-077, SR-098); redaction ka test.
12. **CR-23:** async kaam ke dono sire jaanchein: job queue me jaana aur consumer ka asli kaam (jaise email sach me bana). _Wajah:_ queue me jaata job kabhi chala hi nahi, ye sirf producer ke test se nahi dikhta.

### 3.3 Frontend

1. **CR-24:** pehle saajhe packages ([ARCHITECTURE.md](ARCHITECTURE.md) §12); wahan jo hai wo app me dobara nahi banta.
2. **CR-25:** components props aur config se chalein, kisi ek app se jude nahi. Naya hook ya component pehle app me asli browser me saabit, phir package me.
3. **CR-26:** icons sirf apne icons package se ([DESIGN.md](DESIGN.md) §7); app me inline SVG ya bahar ki icon library ka import nahi.
4. **CR-27:** API sirf saajhe typed client aur uski query keys se; app me seedha axios ya `fetch` nahi.
5. **CR-28:** user ka data aur tokens browser storage me nahi (SR-027); `localStorage` sirf UI ki pasand (jaise theme) ke liye.
6. **CR-29:** permission ke hisaab se nav aur buttons, par faisla server pe ([ARCHITECTURE.md](ARCHITECTURE.md) §11 niyam 7).
7. **CR-30:** paisa, numbers aur dates `Intl` (`en-IN`) se, haath se format nahi.
8. **CR-31:** jo attribute component khud bhi lagata hai (`id`, `aria-describedby`, `className`, event handlers), wo bahar ke props ke saath milaya jaaye, chupke se overwrite nahi; iska test. _Wajah:_ TypeScript aise overwrite ko nahi pakadta.
9. **CR-32:** focus ring kabhi bina apne focus style ke nahi hatta ([DESIGN.md](DESIGN.md) §8).
10. **CR-33:** har package ki Tailwind CSS har us app aur playground me import ho jo uske components dikhata hai. _Wajah:_ Tailwind `node_modules` scan nahi karta, to bina import ke classes chupke se gayab.

### 3.4 Packages

1. **CR-34:** naam aur folder D-002 se; sirf ESM; build tsdown se (D-001); har package me README, aur frontend package me playground.
2. **CR-35:** bahar ki library peer dependency ho to devDependencies me bilkul wahi range; jis library ke types package ki public types me aate hain, wo peer dependency ho.
3. **CR-36:** saare packages public npm pe, kisi pe `private: true` nahi; har package ke README me "Visibility" ka hissa: security ke hisaab se asal me private hona chahiye ya public, aur kyun (D-445). Publish ke niyam [OPERATIONS.md](OPERATIONS.md) §11 me.

## 4. Testing

### 4.1 Siddhaant, levels aur kab kya chalta hai (D-381)

**Siddhaant:**

1. **Niyam se test, code se nahi:** har test kisi likhe niyam (D, SR, CL, FL, DS ya acceptance criterion) ko jaanchta hai, aur test ke naam me us niyam ka id hota hai. Isse "test wahi jaanch raha jo code karta hai" wala jaal kam hota hai.
2. **Invariant pehle, flow baad me:** paisa, stock, permissions, idempotency aur events ke invariants neeche ke levels (unit, integration) pe poori gehrai se; E2E sirf ye dikhata hai ki flow judta hai.
3. **Asli database, nakli duniya:** databases hamesha asli engine (MongoDB replica set, PostgreSQL, Valkey) ke containers; bahar ki har service ka fake. Tests ka koi request internet tak nahi jaata.
4. **Ghadi hamare haath me:** jis code ko "abhi" chahiye wo injected clock se leta hai, taaki 15 minute, 7 din, 1 April aur raat ki neend tests me seconds me chalein.
5. **Live jaisa bundle:** release ki E2E compiled JS aur bundle mode pe, wahi start command aur flags ke saath jo live pe; split mode facade aur events ke contract tests me dono transport pe jaancha jaata hai.
6. **Imaandari:** "tests pass" aur "verified" alag shabd hain (D-377).

**Test levels:**

| Level                      | Kya pakadta hai                                                                                                                                               | Tool (prastaav)                                                                                          | Kahan chalta hai                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Unit                       | Pure logic: paisa aur tax, authorize, seemaon ke counters, FEFO ka chunaav, check digit, `next` ki safai, CSV escape                                          | Vitest; property tests ke liye fast-check                                                                | Har PR                                                  |
| Component                  | UI component ka vyavhaar, keyboard, focus, error ki halat                                                                                                     | Vitest + Testing Library; accessibility asli browser me (RT-27)                                          | Har PR                                                  |
| Integration (service)      | Repository, transaction, conditional update, unique index, validator, outbox aur inbox, timers, rate limits, sessions, PostgreSQL ke triggers aur constraints | Vitest, asli containers; har test worker ka alag database                                                | Har PR                                                  |
| Contract                   | Routes, events (schema aur versions), facade calls dono transport pe                                                                                          | Vitest + contracts package ke fixtures                                                                   | Har PR                                                  |
| End-to-end (browser)       | FL-1 se FL-20 ke poore flows kai apps ke saath, security headers, service worker, jaagne ka parda                                                             | Playwright; backend bundle mode, built apps, fakes                                                       | Har PR Chromium pe; nightly WebKit (D-374)              |
| Accessibility              | WCAG 2.2 AA ke automated hisse; contrast tokens pe                                                                                                            | axe-core (Playwright ke andar, `wcag22aa` tag chalu, D-425); DS-2.10 ki script                           | Har PR; haath ki checklist release pe (D-376)           |
| Visual                     | Mukhya screens ka bigadna (misaal 30 screens, R-057)                                                                                                          | Playwright screenshots, sirf Linux container me                                                          | Har PR (mukhya), poora set nightly                      |
| Performance                | Bundle budget; page targets; server ke p95; design target pe load; 512 MB ka naap; ek flow me database operations ki ginti                                    | Build ka size check; Lighthouse (har page 5 baar, median; DS-10.10); load tool; OPERATIONS §10 ki script | §4.5 dekhein                                            |
| Security                   | SR niyamon ke tests, IDOR matrix, XSS aur injection ki suchi, JWT ke hamle, headers, redaction, supply chain                                                  | Upar ke levels ke andar + passive DAST                                                                   | Har PR; DAST nightly                                    |
| Migration aur release step | Naya code purane data pe aur ulta; release step dobara chalne pe kuch nahi; lease; expand aur contract                                                        | Vitest + containers + "pichhle release" ka data                                                          | Har PR                                                  |
| Backup aur restore         | Backup tool ka round trip containers pe; asli abhyaas laptop pe                                                                                               | Vitest + containers; OPERATIONS §6 ka abhyaas                                                            | Har PR (tool); har 3 mahine (abhyaas)                   |
| Mutation                   | Tests ki taakat, sirf teen jagah (RT-21)                                                                                                                      | StrykerJS + Vitest runner, copy me                                                                       | CI me PR pe badli lines; pehla poora run laptop (D-372) |
| Manual                     | Haath ki accessibility checklist, asli phone, provider ka test mode, khoj wala testing                                                                        | Checklist aur record                                                                                     | Release se pehle (D-375 se D-377)                       |

**Kab kya chalta hai:**

| Kab                                        | Kya                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Har PR aur `prerelease`, `release` pe push | `guard` aur static checks; unit, component, integration, contract, migration aur backup-tool tests; Chromium pe saare 20 flows ki E2E (har app ek job); axe; mukhya screens ke screenshots; contrast script; bundle budget; collection scan aur `explain` ka pehra; retention class ka pehra; mutation job (D-372); requirement ki ginti sirf report me |
| Nightly (sirf koshish)                     | WebKit pe Customer app ke mukhya flows (D-374; service worker aur push ke tests Chromium aur asli phone pe, D-425); poora screenshot set; passive DAST; E2E 3 baar (flaky pakadna); lambi ghadi wale scenarios (raat ki neend, mahine ka close). Release ka koi gate nightly pe nahi tika (RT-8)                                                        |
| Release se pehle (laptop)                  | OPERATIONS §3 niyam 1 ka poora E2E aur 512 MB naap; load test (D-379); 5 pages ke page targets; haath ki accessibility checklist (D-376); asli phone (D-375); khoj wala testing (D-377); providers ke test mode se milaan (RT-14); passive DAST (RT-36), kyunki RG-5 isi ka nateeja dekhta hai; backup; requirement ki ginti me 0 kami                  |
| Release ke baad (live)                     | OPERATIONS §3 niyam 9 ka smoke check, smoke order D-380 ke niyam se; uske baad hi "verified"                                                                                                                                                                                                                                                            |
| Har 3 mahine                               | Restore ka abhyaas, 512 MB ka dobara naap                                                                                                                                                                                                                                                                                                               |

**₹0 aur free CI me fit:**

1. Public repo pe GitHub ke standard runners muft ([OPERATIONS.md](OPERATIONS.md) §2 niyam 1). Jobs services ke group aur apps ke hisaab se bante hain, aur har job ka `timeout-minutes` tay.
2. Containers CI me wahi jo laptop pe (OPERATIONS §1 niyam 2 aur 3), images exact version pe pinned.
3. Live databases, live Redis aur asli providers CI me kabhi nahi (D-051, OPERATIONS §1 niyam 7). Unke khaas vyavhaar (free cluster ki seemaayein, Atlas Search ke operators, Neon ka pooler) tests me poore nahi dikhte; ye seema RT-19 aur §4.5 ke load test me sambhali jaati hai.
4. Playwright ke browsers aur container images cache se; E2E apps dev server pe nahi, build ki static copy pe.
5. E2E fail ho to traces chhoti umar ke artifact me, bina personal data (OPERATIONS §2 niyam 9).

**Contract tests:**

1. **Routes:** har route ka contract ek jagah ([ARCHITECTURE.md](ARCHITECTURE.md) §5). Tests: gateway ka manifest contracts ke barabar (contract ke bahar ka route pahunch se bahar); har route × har actor ka matrix contracts se bana (RT-35); har non-public route pe `private, no-store`; har jawab apne output schema se milta hai, aur seller ke jawab ke schema me customer ki personal jaankari ke fields hi nahi; idempotency wale routes ki list contract aur test me ek.
2. **Events:** har event type ka schema aur har version ki fixture contracts package me (RT-6).
3. **Facade calls:** har facade ka ek saajha contract test suite, jo bundle mode ke in-process aur split mode ke signed HTTP dono pe chale (RT-5).

**Niyam:**

1. **RT-1:** har PR pe CI me unit, component, integration, contract, migration aur backup-tool ke tests, aur Chromium pe saare flows ki E2E; koi level "baad me" nahi. _Wajah:_ ek hi insaan kaam karta hai, galti PR pe hi pakdi jaaye.
2. **RT-2:** integration aur E2E sirf asli engines ke containers pe: MongoDB ka single-member replica set (test commands chalu; patch version tak pin, 8.0.30 ya upar, D-425), search ke tests MongoDB ke local Atlas container pe (D-422), PostgreSQL wahi major jo live pe (finance tests me PgBouncer transaction mode ke saath, D-425), Valkey live jaisi memory seema aur `noeviction` ke saath. In-memory database ya nakli repository wala test "integration" nahi kehlata. _Wajah:_ transactions, indexes, validators aur triggers sirf asli engine me sach bolte hain.
3. **RT-3:** har test worker ka apna database aur apna Valkey key prefix; koi test kisi doosre test ke data ya kram pe nahi tika. _Wajah:_ tests ek saath chalein aur har baar ek jaisa nateeja dein.
4. **RT-4:** release wali E2E compiled JS aur bundle mode pe, wahi start command aur flags jo live pe; apps build ki static copy se. _Wajah:_ live jaisa hi jaancha jaaye.
5. **RT-5:** har facade (sync call) ka ek contract test suite, jo in-process aur signed HTTP dono transport pe chale. _Wajah:_ laptop split mode me aur live bundle mode me, dono ek jaise chalein.
6. **RT-6:** har event type ka schema aur har version ki fixture contracts me; producer ka test forbidden fields (OTP, delivery code, password, token, bank, PAN, poora address) aur size ki seema jaanche; consumer ka test pichhla version bhi chalaye, wahi event dobara pe koi asar nahi, aur ulte kram me aaye events pe sahi aakhri halat. _Wajah:_ deploy ke waqt outbox me purane events hote hain.
7. **RT-7:** har flow (`FL-x`) ki ek E2E spec, jo "Fail ho to" ke kam se kam do raaste bhi chalaye; saath me ek "poora R1" spec jo area khulne se seller ke payout tak jaaye. _Wajah:_ flows hi product hain, aur modules ke beech ki galti wahi dikhti hai.
8. **RT-8:** nightly sirf extra jaanch hai; koi release gate nightly ke nateeje pe nahi tika. _Wajah:_ scheduled run late ho sakta hai, chhoot sakta hai ya band ho sakta hai.

### 4.2 Data, fakes aur ghadi (D-382)

**Test data aur seeds:**

1. **Kabhi asli personal data nahi:** naam banawati, emails sirf reserved domains (`example.com`, `.example`, `.test`) pe, phone sirf format ke liye, dastavez aur photos banawati. Allowlist ke asli emails repo me kabhi nahi; wo live pe setting me hi.
2. **Factories, fixtures nahi:** har service ki factory jo tay ids aur seed se data banaye; ek test sirf wahi banata hai jo use chahiye.
3. **Reference data** (chart of accounts, series, HSN table, roles, ingredients, settings) tests me bhi usi release step se jo live pe chalta hai, taaki test aur live ka reference data ek ho.
4. **Location ka chhota fixture:** Maharashtra → Pune → kuch sub-districts aur pincodes, saath me D-016 ke kathin cases (ek pincode do sub-districts, do districts aur do states me; ek jaise naam; source me ek pincode ki kai lines). Poore India ka import sirf ek bade generated file se performance test me.
5. **Do sellers** jaise R1 me (D-055): apna brand Unibelle ka seller aur ek dummy brand, dono ke dummy GSTIN (D-145).
6. **Demo seed** (live ke liye) alag: sirf reference aur catalog, koi customer account nahi. Test seed kabhi live pe nahi chalta (RT-11).

**Bahar ki services ke fakes:**

| Bahar ki service                          | Fake kya karta hai                                                                                                                                                                                                                                                         | Kis niyam ke tests ke liye            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Payment gateway                           | Gateway order (rakam aur currency jaanch), checkout ka nateeja (success, fail, user ne chhoda), signature, webhooks (sahi aur galat signature, dobara, ulta kram, der se, kabhi nahi), refund (safal, fail), UPI QR ki exact rakam, settlement report, chargeback ka event | D-111, D-118, payment ke SR niyam     |
| Email                                     | Local inbox container (laptop aur CI); API ka fake jo 429 aur 5xx bhi de sake, aur har bheje email ko test ke liye rakhe                                                                                                                                                   | D-126, D-140, D-142                   |
| Browser push                              | Push service ka fake: payload rakhe, 404 aur 410 de sake; sirf allowlist wale hosts                                                                                                                                                                                        | D-195                                 |
| Social sign-in (Google, LinkedIn, GitHub) | Teeno ke authorize, token aur user API; `state`, PKCE, `nonce` aur exact redirect URI ki jaanch asli jaisi; verified ya unverified email; cancel                                                                                                                           | D-021                                 |
| Media provider                            | Signed upload URL (type, size, samay), private file ka chhota URL aur expiry, EXIF hatane ka nateeja, type ki rok, list API, delete                                                                                                                                        | [ARCHITECTURE.md](ARCHITECTURE.md) §7 |
| Leak hue passwords ki range API           | k-anonymity range ka jawab; band ya 5xx                                                                                                                                                                                                                                    | Sign-in ke SR niyam                   |
| Maps (Ola Maps)                           | Search, reverse aur pin ke jawab; load na ho to sirf form                                                                                                                                                                                                                  | D-347                                 |
| npm registry                              | Chhota local registry: asli npm CLI publish kare, `whoami` aur package documents de; publish fail aur session khatam jaise haalat                                                                                                                                          | D-023, D-325                          |
| Edge (Vercel ka rewrite)                  | Test proxy: `/api/*` ko gateway pe bheje, secret header aur forwarded IP jode (har test ka apna IP), aur 502 ya 504 bhi de sake                                                                                                                                            | Edge ke SR niyam                      |

Har fake ka apna chhota test, aur har fake ka vyavhaar provider ke docs ke saath likha (fake ka "contract").

**Ghadi aur samay:**

1. Business code `Date.now()` ya `new Date()` seedha nahi bulata; ek `Clock` port (UTC ka abhi, aur IST ka din) inject hota hai (RT-13).
2. Unit tests me fake clock; integration me clock aage badhao aur ticker ka ek "tick" haath se chalao (koi asli intezaar nahi).
3. E2E me ghadi ka koi route app me nahi: E2E ka harness us run ke database me timer ka samay peeche karta hai aur sweep chalata hai, ya process ko fake clock ke saath chalata hai (RT-11).
4. Zaroori samay wale scenarios (misaal): 15 minute ka reservation (D-118), payment fail aur delivery pe UPI ki seemaayein (D-109), hub pe 3 din (D-108), return ki khidkiyan (D-221), daawe ki khidkiyan (D-148), payable (D-081, D-369), hafte ka payout, mahine ka TCS aur close, 1 April pe nayi series, raat 11:30 PM IST ka invoice usi din ka, session ki umar aur idle (D-180, D-181), invite, step-up, signed URL, idempotency ki umar, delete ke 7 din.
5. **Raat ki neend:** server raat ko soya (D-322). Test: process lambe samay band, phir boot; due timers pakde jaayein (der se, par khoye nahi), aur roz ke kaam har chhoota din kram se banayein. Tests "der se, par khoya nahi" jaanchte hain, "samay pe" nahi.

**Niyam:**

1. **RT-9:** tests, fixtures aur seeds me kabhi asli personal data nahi: emails sirf reserved domains pe, naam aur dastavez banawati; allowlist ke asli emails repo me kabhi nahi. _Wajah:_ repo public hai.
2. **RT-10:** E2E ke traces, screenshots aur logs me sirf fake data; artifacts chhoti umar ke; backup files kabhi artifact nahi. _Wajah:_ public repo ke artifacts koi bhi dekh sakta hai.
3. **RT-11:** production bundle me koi test route, test switch, fake adapter ya test seed nahi. Boot pe jaanch: production config me fake adapter ya test seed mile to process na uthe. E2E ka harness halat seedha us run ke database me badalta hai, app ke kisi route se nahi. _Wajah:_ test ka raasta hamle ka raasta na bane.
4. **RT-12:** tests ka koi network request loopback ke bahar nahi jaata; test setup bahar ke connections band karta hai, aur har bahar ki service ka fake hota hai. _Wajah:_ galti se asli provider, asli paisa ya asli inbox tak na pahunchein.
5. **RT-13:** business code "abhi" sirf injected clock se leta hai; `Date.now()` aur bina argument ka `new Date()` lint se mana (clock package aur tests ko chhod ke); tests me asli `sleep` nahi. _Wajah:_ samay wale niyam seconds me aur pakke jaanchein.
6. **RT-14:** har fake ka vyavhaar provider ke docs ke saath likha ho. R1 se pehle aur jab bhi kisi provider ka integration badle, laptop pe ek baar provider ke asli test mode se milaan (payment, email, social sign-in, media, aur edge: Vercel ka rewrite, secret header, forwarded IP aur CDN cache, aur map ki key ki whitelist), test key sirf us din (OPERATIONS §1 niyam 8). Razorpay ke webhooks laptop tak `zrok` se (Razorpay `ngrok` aur `loca.lt` ko block karta hai), ya fake se (D-425). _Wajah:_ fake aur asli ka farak tests ko jhootha green kar deta hai.
7. **RT-15:** packages ke tests me npm registry hamesha local fake; test process me registry ki setting jabran fake pe, aur asli registry ka koi request test ko fail kare (CLAUDE.md). _Wajah:_ koi test kabhi asli registry ko na chhoe.
8. **RT-16:** E2E ka edge proxy live ke rewrite jaisa: secret header aur har test ka alag forwarded IP. Rate limits aur seemaayein asli settings ke saath jaanchi jaati hain; tests seemaayein badal ke nahi, apna IP aur apna account le ke alag rehte hain. _Wajah:_ niyam usi roop me jaanche jaayein jo live pe chalta hai.

### 4.3 Paisa, stock aur permissions (D-383)

**Integration ki gehrai:**

1. **MongoDB:** test container me test commands chalu, taaki commit fail karwa ke transaction helper ka retry jaancha ja sake (transient error pe poora kaam dobara; commit ka nateeja anjaana ho to sirf commit dobara). Validators galat document (jaise rakam `double`) mana karein. Har repository query ka `explain` index se. TTL aur indexes ki definitions test me jaanchi jaayein; TTL ke asli mitne ka intezaar nahi (MongoDB ka TTL apne chakkar pe chalta hai).
2. **PostgreSQL:** journal barabar ka deferred trigger, insert-only triggers, band mahine ka trigger, CHECK constraints (jaise `approved_by <> created_by`), serialization aur deadlock pe dobara koshish, statement timeout ([ARCHITECTURE.md](ARCHITECTURE.md) §10.6).
3. **Valkey:** memory seema aur eviction live jaisi; Valkey khaali hone ke baad sessions ka sach database se; Valkey na mile to fail-closed routes 503 aur padhna chalta rahe.
4. **Ek saath chalne wale requests:** paise, stock aur "ek hi" wali cheezon ke har niyam ka test N requests ek saath bhej ke (RT-17).
5. **Database operations ki ginti:** har mukhya flow ke operations gine jaate hain, kyunki container me free cluster ki operations ki seema nahi hoti (RT-19).

**Niyam:**

1. **RT-17:** paise, stock aur har "ek hi" wali cheez ka test ek saath N requests (misaal 50) se: unique index, conditional update aur transaction ka asli takraav. _Wajah:_ asli users ek saath aate hain; ek user wala test race nahi pakadta.
2. **RT-18:** paise ke har function pe property tests (random carts, rates, refunds, chhoot): jod barabar, refund captured se kabhi zyada nahi, float kahin nahi. _Wajah:_ haath ki misaalein kinaare ke cases chhod deti hain.
3. **RT-19:** har mukhya flow (place order, pack, delivery, return, payout) ke database operations gine jaayein aur tay budget se upar test fail; har flow ka budget us module ki planning (`TASK.md`) me tay hota hai; har repository query ka `explain` index se. _Wajah:_ free cluster ki operations ki seema container me nahi dikhti.
4. **RT-20:** har mana hone wale raaste ka apna test: galat permission (403), scope ke bahar (404), wahi idempotency key alag body (422), seema ke upar, galat halat (409). Sirf "happy path" wala badlav adhoora maana jaaye. _Wajah:_ hamle aur galtiyan inhi raaston se aati hain.

### 4.4 Mutation, coverage, flaky aur ginti (D-384)

1. **RT-21:** mutation testing sirf teen jagah (CLAUDE.md): (a) kernel packages: pehli baar poora run laptop pe background me, phir sirf badli lines; (b) paisa, stock aur permissions ke code me sirf badli lines; (c) baaki apps aur modules me mutation nahi. Mutation hamesha asli files ki copy me aur alag containers pe (OPERATIONS §1 niyam 5); PR pe CI ka alag job (D-372). _Wajah:_ taakat wahan jahan galti mehngi, aur owner ka kaam na ruke.
   - **Kernel packages:** paisa aur tax ka hisaab, authorize aur kaam ke bantwara ke pure checks, transaction helper, outbox aur inbox, timers aur lease, idempotency, field encryption aur blind index, release step, contracts se route manifest, audit ki hash chain, rate limit ka counter, config schema.
   - **Paisa, stock, permissions ka code:** finance ki saari posting aur numbering, refund ka hisaab, place order aur reservation, FEFO, pack, cancel, seemaon ke counters (D-091, D-109, D-188, D-204), grants aur scope, step-up ki list.
   - **Tool (prastaav):** StrykerJS, Vitest runner ke saath. Copy (sandbox) repo ke bahar ya aisi jagah jo dev server aur watchers nahi dekhte. Badli lines ek chhoti script `git diff` se nikaal ke deti hai. Line ranges aur sandbox ki baatein jaanchna baaki.
2. **RT-22:** bacha mutant ya to naye test se mare, ya package ke saath "equivalent" ki likhi wajah ho; bina wajah ka bacha mutant job ko fail karta hai. _Wajah:_ mutation score ka matlab bana rahe.
3. **RT-23:** coverage ki seema area ke hisaab se: kernel packages misaal 90% branch, paisa, stock aur permissions misaal 85% branch, baaki misaal 70% lines. Pehle do areas me seema se neeche PR rukta hai; baaki me sirf report aur release se pehle jaanch (D-371). Coverage Vitest ke v8 coverage se. _Wajah:_ poore repo ka ek number kamzor jagah chhupa deta hai.
4. **RT-24:** har test ke naam me uske niyam ka id (`SR-045`, `FL-7`, `CL-003`, acceptance criterion ka id). Ek script tests se ids nikaal ke R1 ki list (SECURITY_REQUIREMENTS, FLOWS, [ACCEPTANCE.md](ACCEPTANCE.md) ke criteria, COMPLIANCE ke R1 rows) se milaati hai: PR pe report, release pe kami 0. _Wajah:_ "bana hai" sirf test ki link se kaha jaaye, aur chhoota niyam dikhe.
5. **RT-25:** flaky ka matlab: wahi commit, wahi test, kabhi pass kabhi fail. Sirf E2E tests pe ek retry; retry se pass hua test summary me "flaky" dikhe aur uska issue bane. Paise, stock, permissions, idempotency aur events ke tests pe retry nahi aur kabhi quarantine nahi; unka flaky hona bug hai (D-373). Asli `sleep` mana; intezaar sirf halat pe. _Wajah:_ race asli ho sakta hai, aur chupka green bharosa todta hai.
6. **RT-26:** `.only` CI me mana; `.skip` sirf issue ki link aur tareekh ke saath. _Wajah:_ chhupa adhoora test sabse mehnga hota hai.

### 4.5 E2E, accessibility, visual aur performance (D-385)

**Flows se E2E:** har flow ki ek spec, `FL-x` naam ke saath (RT-7).

| Flow                             | Apps (browser contexts)                                  | Fakes aur ghadi                              | Mukhya jaanch                                                                                                                          |
| -------------------------------- | -------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| FL-1 Sign-up                     | Customer                                                 | Email inbox, leak API                        | Allowlist ke bahar "demo store"; ek jaisa jawab; consent ka record version ke saath; 18+                                               |
| FL-2 Sign-in                     | Customer                                                 | Social fake, email inbox                     | Teen raaste; rok aur reset; "My devices"                                                                                               |
| FL-3 Staff sign-in aur bada kaam | Master, Admin                                            | Authenticator ka code generator              | Invite, recovery codes, har sign-in pe code, step-up, idle warning                                                                     |
| FL-4 Partner sign-in             | Delivery, Logistics Ops                                  | Ghadi                                        | Phone ki manzoori, doosra phone, Hub Manager se session band                                                                           |
| FL-5 Account delete              | Customer, Master (dekhne ko)                             | Ghadi (7 din)                                | Wapsi ki khidki; 7 din baad har service me pehchaan gayab; invoice aur review D-305 jaisa                                              |
| FL-6 Area, pincode, waitlist     | Customer, Admin, Super Admin, Master                     | Push fake                                    | Pincode → ek hub; switch aur live alag; waitlist ki khabar; area band hone ka kram (D-300)                                             |
| FL-7 Prepaid order               | Customer                                                 | Payment fake (sab haalat), ghadi (15 minute) | Server ka total; idempotent place order; sirf webhook ya signature se paid; der se payment; "paisa kata, order nahi bana"; kill switch |
| FL-8 Delivery pe UPI             | Customer                                                 | Payment fake                                 | Seemaayein (D-109, D-204); tareeka na dikhne ki wajah                                                                                  |
| FL-9 Pack se delivery            | Logistics Ops, Delivery, Customer                        | Payment fake (QR), media fake, geolocation   | Pack ke kadam aur invoice; trip; code ka milaan; photo wali delivery; offline line; finance band to pack ruka                          |
| FL-10 Delivery fail aur RTO      | Delivery, Logistics Ops, Customer                        | Ghadi (3 din)                                | Do koshish; RTO; hub scan pe refund; fail refund ka staff raasta                                                                       |
| FL-11 Cancel                     | Customer, Logistics Ops                                  | Payment fake                                 | Item aur quantity; refund rakam; pack aur cancel ek saath pe server jeete                                                              |
| FL-12 Return se refund           | Customer, Delivery, Logistics Ops, Support Desk, Finance | Media fake, ghadi                            | Muddat wajah se; manzoori; seema; pickup pe batch aur seal; jaanch ke baad refund; return fee; seller ka statement                     |
| FL-13 "Parcel nahi mila"         | Customer, Support Desk                                   | Ghadi (D-148 ki khidkiyan)                   | Code wali delivery pe daawa nahi; photo wali pe khidki; signals                                                                        |
| FL-14 Appeal                     | Customer, Support Desk                                   |                                              | Ek appeal; faisla doosra account                                                                                                       |
| FL-15 Seller onboarding          | Seller, Admin                                            | Media fake                                   | Ek brand ek seller; bina manzoori live nahi; bank pe step-up; appeal alag insaan                                                       |
| FL-16 Listing se live            | Seller, Admin, Customer                                  | Media fake                                   | Version pe manzoori; blocklist pe submit nahi; claims ka saboot; jokhim wale field pe dobara jaanch                                    |
| FL-17 Maal warehouse me          | Seller, Logistics Ops                                    | Media fake                                   | ASN; expiry seema; barcode label; accept scan se stock aur storage ki ghadi                                                            |
| FL-18 Payout                     | Finance, Master, Seller                                  | Ghadi (return khidki, hafta)                 | Payable ki muddat; set-off; do haath; naya bank; statement aur CSV                                                                     |
| FL-19 Review likhna              | Customer, Admin                                          | Media fake                                   | Haq; moderation; listing version                                                                                                       |
| FL-20 Review ki report           | Customer, Admin                                          | Ghadi                                        | Seema; gambhir report pe turant chhupna; doosra moderator appeal tay kare                                                              |

Ek "poora R1" spec bhi: area khulne se seller ke payout tak, saare apps ek ke baad ek ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1 ka lakshya), aur aakhir me finance ke milaan me koi farak nahi.

**Accessibility aur visual:**

1. Axe asli browser me: components ki playground pages pe Playwright se, aur E2E ki har screen pe (RT-27).
2. Har E2E screen light aur dark dono me axe (D-342); high contrast Delivery ki screens (DS-5.8) aur sign-in, checkout pe.
3. Har mukhya screen 320, 360, 768 aur 1280 px pe (DS-5.1): 320 pe horizontal scroll nahi, focus sticky header ya neeche ki bar ke neeche na chhupe (DS-8.3).
4. Screenshot tests sirf mukhya screens pe (misaal 30, R-057), sirf Linux container me, animations band, fonts self-hosted (D-341). Baaki screens ka contrast aur accessibility axe se dono themes me.
5. Haath ki checklist (DS-8.1) har release se pehle, D-376 ke screen readers pe.

**Performance:**

| Kya                           | Kahan aur kab                           | Seema                                                                                                      |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Bundle ka size                | CI, har PR                              | DS-10.9                                                                                                    |
| Page ke targets               | Laptop, release se pehle, 5 pages       | DS-10.10                                                                                                   |
| Server ke p95 (D-053)         | Laptop, Docker 512 MB, release se pehle | [ARCHITECTURE.md](ARCHITECTURE.md) §9 ke targets, RT-31 ki CPU seema pe                                    |
| Design target ka load (D-283) | Laptop, D-379 ke hisaab se              | ARCHITECTURE §9 ka design target; aakhri unit pe takraav; 409 aur 503 ka hissa; baad me data ki sahi halat |
| 512 MB ka naap                | [OPERATIONS.md](OPERATIONS.md) §10      | Aam RSS 400 MB se neeche, koi OOM nahi                                                                     |
| Database operations ki ginti  | CI, har PR (integration)                | Har flow ka budget (RT-19)                                                                                 |

**Haath ki jaanch:** asli phone (D-375), screen reader (D-376), khoj wala testing aur har haath ke check ka record (D-377), providers ke test mode se milaan (RT-14).

**Niyam:**

1. **RT-27:** accessibility ki automated jaanch asli browser me (components ki playground pages aur E2E ki har screen), light aur dark dono me; serious ya critical ek bhi nahi. _Wajah:_ jsdom rang aur contrast nahi ginta.
2. **RT-28:** har mukhya screen 320, 360, 768 aur 1280 px pe; 320 pe horizontal scroll ka test aur focus ka header ya neeche ki bar ke neeche na chhupna. _Wajah:_ reflow aur focus WCAG ke niyam hain, aankh se chhoot jaate hain.
3. **RT-29:** screenshot tests sirf mukhya screens pe, sirf Linux container me, animations band; baseline sirf ek tay command se badle aur PR me dikhe. _Wajah:_ operating system ke font ka farak jhoothe fail deta hai, aur baseline chupke se na badle.
4. **RT-30:** har haath ke check ka record (kya, kis device aur browser pe, kisne, kab, nateeja); bina record "verified" nahi likha jaata (D-377). _Wajah:_ imaandari ka niyam.
5. **RT-31:** server ke p95 targets Docker me 512 MB aur [OPERATIONS.md](OPERATIONS.md) §10 niyam 1 ki live jaisi CPU seema (misaal `--cpus=0.1`) pe naape jaayein; pass ya fail usi seema pe, 0.5 wala naap sirf tulna ke liye; har naap 3 baar, nateeja tareekh aur commit ke saath. _Wajah:_ naap dohraya ja sake; CPU seema ke bina nateeja kai guna alag ho sakta hai; targets sirf jaage server pe (D-053).
6. **RT-32:** design target ka load test laptop pe (D-379); nateeja sirf samay nahi, baad me data ki sachchai bhi: stock minus nahi, reservations aur movements milte hain, outbox me atka event nahi, journal barabar. Laptop ka load test live ki free tier seemaayein poori nahi dikhata, isliye saath me RT-19. _Wajah:_ load me hi race aur takraav dikhte hain.
7. **RT-33:** E2E me elements role aur label se dhoondhe jaayein (jaise button ka naam); CSS class ya test id tabhi jab koi aur raasta na ho. _Wajah:_ test accessibility ka bhi pehra ban jaata hai.

### 4.6 Security, migrations, backup aur bugs (D-386)

**Security tests:**

| SR ka hissa                                    | Kaun sa level                                                                                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| SR-001 se SR-010 (edge aur hosting)            | Gateway ke integration tests; har app ke headers, CSP aur service worker E2E me                                                                 |
| SR-011 se SR-031 (sign-in, sessions, tokens)   | Identity ke integration tests (ghadi ke saath); FL-1 se FL-4 E2E; JWT ke hamle unit me; SR-012 aur SR-020 notify ke template aur seema ke tests |
| SR-032 se SR-039 (authorization)               | Contracts se bana route × actor matrix; har resource pe doosre customer aur seller ki id se 404                                                 |
| SR-040 se SR-053 (catalog, checkout, paisa)    | XSS aur injection ki suchi har text field pe; concurrency aur property tests; finance ke triggers                                               |
| SR-054 se SR-060 (delivery, daawe, reviews)    | Logistics aur catalog ke integration; FL-9, FL-13, FL-19, FL-20                                                                                 |
| SR-061 se SR-067 (files, personal data)        | Media fake ke saath polyglot files ka upload; plaintext pattern ki jaanch; delete ke baad har service                                           |
| SR-068 se SR-074 (data stores, khabrein)       | Ek service ke DB user se doosri ka database mana (containers me alag users); SSRF allowlist; push                                               |
| SR-075 se SR-084 (export, audit, logs, DevOps) | CSV injection; audit chain ki chhed-chhaad; logs ki redaction; secret scan aur workflow lint                                                    |
| SR-088                                         | Seller export me invoice ki copy nahi; har download audit me                                                                                    |
| SR-089 se SR-105 (security review ke niyam)    | Har niyam ke "Test kaise" ke hisaab se ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md))                                 |
| SR-067, SR-085 se SR-087                       | R2: apne feature ke saath                                                                                                                       |

Kuch niyamon ka saboot test nahi, record hai (jaise schema ki review checklist, providers pe MFA ki checklist, abhyaas ka record); release gate me inka record dekha jaata hai (§2.1).

**SR-019 ka ek jaisa jawab:** CI me sirf jawab ke body ki barabari aur kam se kam tay samay jaancha jaata hai; registered aur anjaan email ke samay ka farak CI ke shor me pakka nahi, isliye uska naap laptop pe kai baar (misaal 50 baar), ek seema ke saath (misaal p95 ka farak 50 ms se kam).

**Migration, release step aur rollback:**

1. Release step dobara chalne pe kuch nahi badalta; do instances ek saath boot karein to lease ke peeche sirf ek chale (OPERATIONS §3 niyam 4).
2. Schema wala hissa listen se pehle aur lambi data migration listen ke baad (OPERATIONS §3 niyam 5): test me lambi migration ke chalte hue `/health` 200 aur naye requests chalte rahein.
3. Expand aur contract: ek PR me ek hi field ya index ka jodna aur hatana dono ho to CI laal; "contract baaki" ki list release note me.
4. Naya code purane data pe aur purana code naye data pe: har release ki ek chhoti "pichhle release ka data" fixture, factories se.
5. Finance ki SQL migrations: checksum badla to fail; sirf aage; lock ke peeche ek hi chale, Neon ke seedhe connection pe (ARCHITECTURE §10.4 niyam 6). Finance ke tests PostgreSQL ke saath PgBouncer (transaction mode) ke container pe, taaki pooler ki rok (SQL `PREPARE`, `SET`, session wale locks) tests me dikhe (D-425).
6. Rollback ka abhyaas: release N ke data pe release N-1 ka code (OPERATIONS §3 niyam 7) chale aur smoke spec pass ho.

**Backup aur restore:**

1. Backup tool ka round trip CI me containers pe: seeded data → encrypted backup → doosre container me restore → har collection ki ginti aur hash, audit chain ka verify, finance ke journal barabar, aur delete hue accounts ka dobara delete. Bina key backup na khule.
2. Backup file me koi key nahi, encrypted fields encrypted hi: backup file me plaintext ka pattern test.
3. Asli abhyaas laptop pe har 3 mahine aur R1 se pehle; nateeja [OPERATIONS.md](OPERATIONS.md) §6 ki abhyaas wali table me.

**COMPLIANCE rows ke automated checks:** test sirf ye jaanchta hai ki row ka "System me kya chahiye" system me hai; kanooni sahi-galat ki raay test nahi deta.

| Row                            | Automated check                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| CL-003, CL-131                 | Bina gap number, FY aur GSTIN ki series, cancel ka record; books sirf jodte                             |
| CL-005, CL-129                 | Credit note asli invoice aur line ke hawale ke saath; return fee aur delivery fee ki wapsi ke documents |
| CL-019, CL-084                 | Ek parcel me har seller ka alag invoice; seller ka naam sabse upar                                      |
| CL-020                         | ₹50,000 se kam pe sirf state; upar naam aur pata                                                        |
| CL-025, CL-031, CL-074         | MRP taxes samet, batch ka MRP aur revised MRP, kata MRP ke saath 30 din ka sabse kam daam               |
| CL-026, CL-029, CL-030, CL-036 | Product details ke zaroori fields ke bina listing submit nahi                                           |
| CL-032, CL-041                 | Agle batch ki expiry har jagah                                                                          |
| CL-043, CL-048                 | Ingredients poore; blocklist wala ingredient submit nahi                                                |
| CL-060, CL-061                 | Seller ki manzoori ke bina live nahi; return ki line product page, order aur invoice pe                 |
| CL-066                         | Kram me kisi seller ka boost nahi; "How results are ranked" ki link                                     |
| CL-070 se CL-073, CL-078       | Koi pehle se tick nahi; delivery fee alag line; cancel fee nahi                                         |
| CL-079, CL-080                 | Demo ki patti har app pe; legal pages pe badge, version aur tareekh; PDF pe SPECIMEN                    |
| CL-089, CL-101, CL-102         | Har consent ka record notice ke version ke saath; marketing alag aur khaali; 18+ ka record              |
| CL-093, CL-106                 | Retention class har collection pe; kanooni rok; logs 180 din aur UTC                                    |
| CL-105                         | Content ki shikayat ke samay (D-251)                                                                    |
| CL-109                         | "Paisa kata, order nahi bana" aur der se captured pe ek hi refund                                       |

**Niyam:**

1. **RT-34:** R1 ke har SR niyam ka kam se kam ek automated test, ya jahan test nahi ho sakta wahan likha record. _Wajah:_ bahar ki jaanch (pentest) nahi hai, to yahi pehra hai.
2. **RT-35:** route × actor ka matrix aur doosre customer ya seller ki id wala test contracts se apne aap bane; matrix ke aayam: route, actor ka role, app (`aud`) aur scope (apna, doosre customer, seller, hub, warehouse, area, partner); naya route bina matrix entry ke CI fail kare. _Wajah:_ naya route permission ke bina na nikle.
3. **RT-36:** local bundle pe passive DAST scan nightly aur release se pehle; high finding ka record private jagah me (RT-39); public issue, CI ke log aur artifact me sirf findings ki ginti. Vercel ki asli config release ke baad ki live jaanch se (OPERATIONS §3 niyam 9). _Wajah:_ headers aur config ki galti jo tests ke bahar reh jaaye.
4. **RT-37:** release step, migrations aur rollback ke tests har PR pe (dobara chalna, lease, lambi migration ke beech health, pichhle release ka data); ek PR me ek hi field ya index ka jodna aur hatana dono nahi. _Wajah:_ deploy ke waqt do instances ek saath chalte hain.
5. **RT-38:** backup tool ka round trip test har PR pe containers pe (ginti, hash, audit chain, journal, delete hue accounts ka dobara delete, bina key na khulna). _Wajah:_ restore ka pehla asli istemaal mushkil ghadi me hota hai.
6. **RT-39:** security bug ki detail fix live hone se pehle public issue, PR ya commit message me nahi; uska record private jagah me: D-403 ke hisaab se GitHub ki private security advisory, ya alag private repo. Scan ki findings bhi. Fix ka kram SR-103. _Wajah:_ repo public hai.
7. **RT-40:** har bug ka ek roop: user pe asar wala title, steps, umeed aur asal, saboot ka level (chala ke dekha, ya sirf code padh ke), gambhirta, jude niyam ke ids, aur fix ke saath regression test ki link. _Wajah:_ bug dohraya ja sake aur dobara na aaye.
8. **RT-41:** har bug ki gambhirta D-378 ke paimane (P0 se P3) se; release ka faisla usi se (RG-13). _Wajah:_ release gate ek saaf paimane pe tike.
9. **RT-48:** jis SR ka hissa test se nahi, uska record ek tay table me ([OPERATIONS.md](OPERATIONS.md) §12, D-404): SR, hissa, kya dekha, kaise, nateeja (`Pass` ya `Baaki`), private record ka id, release aur commit, tareekh (IST), role, agli baar. Kami ki detail, screenshots, secrets aur account ki pehchaan public table me kabhi nahi. Requirement ki ginti (RT-24) sirf us release ke `Pass` ko ginti hai. _Wajah:_ record bhi test jitna saaf aur ginne layak ho, par repo public hai.
9. **RT-42:** har PR ke description me "kaise jaancha": kaunse tests chale, kya haath se dekha, aur kya nahi dekha; release note me tests ka saar. _Wajah:_ review aur release ka faisla saboot pe ho.

### 4.7 Pehre aur regression (D-398)

1. **RT-43:** collection scan ke pehre me chhoot sirf us query ke saath likhi wajah (comment) se; bina wajah ka scan CI laal kare. _Wajah:_ jaan-boojh ke poora padhna bhi dikhe, chupke se nahi.
2. **RT-44:** integration aur E2E ke aakhir me ids ka pehra: doosri service ke references aur entity `_id` asli ObjectId hon, string nahi ([ARCHITECTURE.md](ARCHITECTURE.md) §10.1 niyam 1 aur 2). _Wajah:_ string id chupke se queries aur joins tod deta hai.
3. **RT-45:** CI ki config ka apna test: har app aur service jiske tests hain, CI ki jobs me ho. _Wajah:_ naya app ya service CI se chhoot na jaaye.
4. **RT-46:** release ka test report: har command ka nateeja aur samay ki chhoti table, release note ke saath (RT-42). _Wajah:_ "kaise jaancha" ka saboot dohraane layak rahe.
5. **RT-47:** in galtiyon ke regression tests: Valkey ruka par connection juda (disconnect nahi) to signed-in route jaldi 503 de, latke nahi; apps ki har API call pe timeout; edge ya proxy ka 5xx user ko raw text me na dikhe, saaf screen pe; E2E ki safai backend band hone ke baad bhi chale. _Wajah:_ ye galtiyan ek baar asli me ho chuki hain.
6. **RT-56:** CI ka pehra: PR me kisi app (`frontend/<app>/`) ya service ke routes ka code badla aur na us app ki testing file badli, na kisi manual, to CI laal; chhoot sirf jab PR ke description me "No manual change: <wajah>" ho (D-440). _Wajah:_ manual aur testing ki files code ke saath chalein, yaad ke bharose nahi.
7. **RT-57:** env files ka test: har service ke config schema ki har key `.env.example` ke us environment ke hisse (DEVELOPMENT, TEST, PRODUCTION) me; koi anjaan key nahi; TEST aur DEVELOPMENT me database, Redis aur providers ke hosts sirf loopback ya fake; aur test runner `.env.test` ke bina shuru hi na ho (D-441). _Wajah:_ koi key chupke se kam ya galat environment ki na ho.

### 4.8 Testing ke jaane-pehchaane jaal (D-429)

1. **RT-49:** kisi library ke callback ka test library ki asli value se likho (jaise "koi error nahi" pe `null` ya `undefined`, jo library sach me bhejti hai). _Wajah:_ galat maani value pe test pass aur app galat.
2. **RT-50:** input ki seemaayein (`maxlength`, `pattern`, paste) user ke jaise events se jaanchi jaayein, aur ek baar asli browser ki E2E me; value seedhi set karne wala event in seemaon ko chhod deta hai.
3. **RT-51:** E2E me har bharne aur dabane se pehle element dikhe aur chalu ho, ye jaancha jaaye. _Wajah:_ dhake ya inert field pe bharna chupchaap kuch nahi karta, aur khaali form submit ho jaata hai.
4. **RT-52:** mobile ki chaudai ki jaanch test ki apni viewport chaudai (misaal 320 ya 360) se ho, page ki `innerWidth` se nahi. _Wajah:_ overflow pe emulation me `innerWidth` bhi badh jaati hai, to side-scroll kabhi pakda nahi jaata.
5. **RT-53:** layout, focus aur blur se judi baatein (button ka khisakna, focus ka kram) sirf asli browser ki E2E me; jsdom me layout nahi hota.
6. **RT-54:** jo test kisi platform ke header ya vyavhaar pe tika ho (jaise forwarded IP), wo pehle deploy pe asli data se ek baar milaya jaaye (RT-14); test khud wahi header bhejte hain, to galti chhup jaati hai.
7. **RT-55:** har test run ke baad uske databases aur keys mitein, aur bache hue test databases ki ginti ka pehra ho. _Wajah:_ atke runs ke bache databases engine ko dheema karke doosre tests ko timeout pe girate hain, jabki code theek hota hai.

## 5. Security aur privacy (D-430)

1. Saare security niyam [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me, threats [security/THREAT_MODEL.md](security/THREAT_MODEL.md) me; har niyam ka test ya record (RT-48, [OPERATIONS.md](OPERATIONS.md) §12).
2. Public repo: koi secret, `.env`, token, password, DB dump ya asli personal data commit nahi; sirf `.env.example` ([CLAUDE.md](../CLAUDE.md)). Secrets kahan rehte hain: [OPERATIONS.md](OPERATIONS.md) §4.
3. Security bug ki detail fix live hone tak sirf private record me (RT-39, D-403).
4. Dummy jaankari pe hamesha demo ka nishaan (D-145); kabhi asli registration ya filing jaisa nahi dikhta.

## 6. Docs (D-430)

1. Docs ke niyam [README.md](README.md) aur root [CLAUDE.md](../CLAUDE.md) me: Hinglish, har file ke top pe status (version aur date), neeche change log, `vX.Y.Z` ka niyam, aur har baat sirf ek jagah (D-019).
2. "Bana hai" sirf code ya test ki link ke saath (D-019).
3. Har package me README (CR-34); code ka koi niyam badle to usi PR me uska doc.
4. Owner ke bahar ke kaam [OWNER_TASKS.md](OWNER_TASKS.md) me, roles ke manuals [manuals/](manuals/README.md) me, aur owner ki haath ki testing [testing/](testing/COMMON.md) me; teeno Claude apne aap update karta hai (DD-13, RT-56, D-440).

## 7. AI ke saath kaam (D-430)

1. Kaam ke niyam root [CLAUDE.md](../CLAUDE.md) me: kam tokens, agents ek waqt me ek, commit aur push sirf owner ke kehne pe, destructive kaam se pehle poochhna, mutation testing copy me, `.env` files kabhi nahi kholna, aur "verified" tabhi jab asli user wala action kiya ho.
2. Har UI badlav asli browser me light, dark aur mobile chaudai pe dekha jaaye, phir hi "ho gaya" (DD-8).
3. Nayi env key Render ya Vercel me tabhi daali jaaye jab code use padhta ho; AI owner ko key ka naam aur value kahan se aayegi bataata hai, khud dashboard me nahi daalta ([OPERATIONS.md](OPERATIONS.md) §4).
4. Har daawa (daam, seemaayein, kanoon) source se jaancha jaaye, tareekh ke saath; jo nahi jaancha wo saaf likha ho.

## Change log

| Version          | Date                     | Badlav                                                                                                                                                            |
| ---------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.2.8 | 2026-11-17 se 2026-11-22 | Definition of Done, release gate, code ke niyam, testing aur security, docs aur AI ke niyam; har badlav ka poora itihaas git me (D-442).                          |
| v1.2.9           | 2026-11-23               | CR-37 se CR-39: aam helpers `utils/` me; module ka apna logic, type aur constant module me; `types/` aur `constants/` sirf kai modules ke saajhe ke liye (D-459). |
| v1.2.10 | 2026-11-26 | CR-40: code me sahi data structure aur algorithm: `Set` aur `Map` se milan, loop ke andar loop sirf seema ke saath, sort ek baar, queue me `shift()` nahi, lookup boot pe ek baar, aur bade input ka test (D-464). |
| v1.2.11 | 2026-11-26 | CR-41: zod ka har schema aur har check message ke saath, field ya key ke naam se (owner). |
