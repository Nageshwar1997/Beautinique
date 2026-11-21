# DEVOPS_ANALYSIS: Beautinique

> **Status:** v1.0.0 (2026-11-21). DevOps / SRE Architect (D-257 ka kram, ek run).

## 0. Kaise padhein

- Ye ek **report** hai, naya doc nahi. Isme koi faisla nahi: main session jaanch ke, owner ki haan se, cheezein `docs/OPERATIONS.md` aur `docs/RISKS.md` me laata hai.
- §1 me jo pehle se tay hai. §2 me sirf owner ke asli chunaav (O-1 se O-4). §3 me OPERATIONS ke liye 11 batches, har batch ke niyam aise likhe hain ki seedhe naye doc me ja sakein (purane kaam ka koi zikr nahi). §4 risks, §5 tathya ki jaanch (URL aur tareekh ke saath), §6 pehle ke kaam se lene layak, §7 tay faislon pe dhyaan, §8 aage ke agents.
- "misaal" wale numbers settings me rehte hain aur naap ke badal sakte hain.
- Tathya jo is run me provider ke docs se jaanche, unke saath "(jaancha 2026-11-21)"; jo nahi jaanche, unke saath "jaanchna baaki".

## 1. Ab tak tay

| Vishay                                                                                                                                                                         | Kahan tay                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Stack, CI GitHub Actions, Node 24, npm workspaces, Turborepo, Playwright                                                                                                       | D-001, D-002                                                  |
| Hosting ₹0: Render free web service (bundle mode), Vercel Hobby (11 apps), Atlas M0 (har service ka apna cluster aur project), Render Key Value free, Neon free; sab Singapore | D-028, D-048, D-049, D-050, D-051, D-056, D-057, D-058, D-011 |
| Render pe sirf ek web service aur ek Key Value; koi preview ya test service nahi                                                                                               | D-056                                                         |
| Laptop pe Docker split mode, live pe bundle mode                                                                                                                               | D-049; ARCHITECTURE §2.4 niyam 10                             |
| Server jagana: GitHub Actions, cron-job aur UptimeRobot se; app khulte hi `/wake`                                                                                              | D-028; ARCHITECTURE §5 niyam 14                               |
| Samay wale kaam DB timers, ticker aur lease; soya server jaagte hi catch-up; chhote kanooni kaam usi request me                                                                | D-293; ARCHITECTURE §4                                        |
| `/health`, `/ready`, `/wake`; finance (Neon) tak koi ping nahi                                                                                                                 | D-057, D-297; ARCHITECTURE §4 niyam 7, §8 niyam 7             |
| Logs, errors aur alerts: apna logs service, fingerprint, ops inbox, push, email sirf gambhir; UptimeRobot server down ke liye; thresholds misaal                               | D-285, D-286, D-297; ARCHITECTURE §8; SR-077, SR-078          |
| Capacity: ₹0 ki seema ki table, memory budget, 400/450 MB ke pehre, R1 se pehle 512 MB pe naap, hafte ka haath se dekhna                                                       | D-298; ARCHITECTURE §9                                        |
| Release step boot pe lease ke peeche, expand aur contract do releases me, finance ki SQL migrations, seeds, backup ka roop                                                     | D-313; ARCHITECTURE §10.4                                     |
| Jagah ka roz ka naap, archive, audit chunks                                                                                                                                    | D-317; ARCHITECTURE §10.8                                     |
| Backup command, restore command, git ke bahar folder, 4 pehre; encrypted, key password manager me, laptop pe aakhri 3                                                          | D-013, D-196; SR-083                                          |
| Media files ka backup nahi                                                                                                                                                     | D-303                                                         |
| Band FY ki encrypted export file, backup command me bhi                                                                                                                        | D-309                                                         |
| Secrets: shak pe turant, saal me ek baar, signing keys apne aap; sirf providers ke env me; do values se badlav                                                                 | D-197; SR-079                                                 |
| Repo ke pehre, providers pe MFA, deploy sirf `release` se, supply chain                                                                                                        | SR-080, SR-081, SR-082                                        |
| Incident ka 7 kadam ka kram aur saal me ek abhyaas; data leak ki teen ghadiyaan                                                                                                | SR-084, D-198, D-248                                          |
| Kill switches settings me, sirf Master                                                                                                                                         | SR-009                                                        |
| Break-glass command laptop se                                                                                                                                                  | D-200                                                         |
| Git flow, commit/push sirf owner ke kehne pe, koi AI attribution nahi, npm publish sirf owner, fake registry, mutation testing copy me, sirf zaroori containers                | CLAUDE.md; D-024 (`main` hatna, abhi laagu nahi)              |
| Package CLI ka kaam aur teen niyam                                                                                                                                             | D-023                                                         |
| Allowlist live pe (bina deploy)                                                                                                                                                | D-133                                                         |

## 2. Owner ke sawal

Chaaron sawal kisi khule sawal pe nahi tike: **chaaron ek saath poochhe ja sakte hain**. Koi juda group nahi.

### O-1. Server ko din me kab aur kitna jagaana

- **Sawal:** bahar ke pinger live server ko din me kis khidki me aur kitni baar jagaayein?
- **Kyun zaroori:** D-028 kehta hai "din me baar-baar", par khidki aur interval tay nahi. Isi se tay hota hai ki koi app na khule tab roz ke kaam, sellers ka din ka saar, audit verify aur alerts kab chalte hain, aur Render ke 750 free ghante (jaancha 2026-11-21) me kitni jagah bachti hai. Docs me ek taraf "raat ko server soya" (ARCHITECTURE §9) aur doosri taraf "24 ghante jaagi rahe to bhi fit" (D-056) likha hai.
- **Vikalp:**
  - **(a) Ghante me ek baar, 09:00 se 22:00 IST (14 jaag).** Har jaag ~16 minute (15 minute khaali pe neend). Lagbhag 115 ghante/mahina + asli use. Din me timers zyada se zyada ~1 ghanta late, raat me ~11 ghante.
  - **(b) Din me lagataar jaaga, 09:00 se 23:00 IST** (har 10 minute ping). Lagbhag 435 ghante/mahina. Din me timers ~1 minute late.
  - **(c) 24 ghante jaaga.** Lagbhag 744 ghante/mahina, 750 me jagah lagbhag nahi; ghante khatam to mahine ke baaki din saara backend band (jaancha 2026-11-21).
- **Salah:** (a). Jo kaam user karta hai wo server ko waise bhi jagata hai, aur jaagte hi sweep pichhla kaam pakad leta hai (ARCHITECTURE §4 niyam 1); bina user ke sirf roz ke kaam aur saar bachte hain, jinke liye ghante ki jaag kaafi hai. Keep-alive pe Render ka koi likhit niyam nahi mila, to lagataar jaagaye rakhna sabse kam dikhna chahiye.
- **Trade-off:** (a) me raat ke timers aur din me ~1 ghante tak ki der; (b) me ghanton ki jagah aadhi aur policy ka jokhim zyada; (c) me ek galti (doosri service, lamba deploy) pe poora mahina band.
- **R1 ya baad me:** R1 (pehle live deploy se).
- **Kis par tika:** D-028, D-053, D-056, D-293.

### O-2. Databases ka backup kitni baar

- **Sawal:** backup command (D-013) release se pehle ke alawa kitni baar chale?
- **Kyun zaroori:** Atlas ke free cluster pe provider ka backup nahi milta (sirf private preview; jaancha 2026-11-21), aur Neon free me sirf 6 ghante ka instant restore (jaancha 2026-11-21). Isliye aakhri backup ke baad ka data kisi galti ya provider ki ghatna pe kho sakta hai: backup ki ginti hi data kho jaane ki seema (RPO) hai.
- **Vikalp:**
  - **(a) Sirf har release se pehle.** Release mahine me ek ho to mahine bhar ka data jokhim me.
  - **(b) Har release se pehle aur hafte me ek baar** (misaal Sunday). Aakhri backup 8 din se purana ho to hafte ki jaanch me laal nishaan. Data jokhim ~7 din.
  - **(c) Har release se pehle aur roz.** Data jokhim ~1 din; owner ka roz ~10 minute, laptop pe personal data ki copy roz badalti, Atlas ke 7 din ke 10 GB aur Neon ke mahine ke 5 GB transfer (jaancha 2026-11-21) me zyada hissa.
- **Salah:** (b). R1 me asli data kam hai (owner aur testers), aur hafte ka kaam ek insaan ke 30 ghante (D-009) me fit hai.
- **Trade-off:** zyada baar = kam data jokhim, par owner ka samay aur laptop pe data ki zyada copies (R-023).
- **Kanooni detail:** asli business pe books ka India me roz ka backup (CL-131, D-309 ka asar) ki baat: Lawyer ya CA (AI) se nahi jaancha.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-013, D-196, D-309.

### O-3. Alerts pe owner ka jawab kab tak

- **Sawal:** gambhir alerts pe owner kab tak jawab dega, khaas kar raat me?
- **Kyun zaroori:** kai kanooni ghadiyaan chhoti hain: CERT-In ko 6 ghante (D-248), sarkari order pe content 3 ghante aur nagnata wali report 2 ghante (D-251). Ek hi insaan sab chalata hai; system alert bhej sakta hai, kaam insaan ko karna hai. Runbook me likhna hoga ki alert kab dekha jaayega.
- **Vikalp:**
  - **(a) Sirf din me:** ops inbox din me tay samay pe (misaal 09:00, 14:00, 20:00 IST); raat ke alerts subah.
  - **(b) Din ke tay samay + gambhirta 1 pe 24 ghante:** gambhirta 1 (paisa, dastavez, staff ya provider account, data leak ka shak, sarkari order) ka browser push owner ke phone ke browser pe raat me bhi; gambhirta 2 aur 3 subah.
  - **(c) Har alert pe 24 ghante push.**
- **Salah:** (b). Raat ko server soya hai, to gambhirta 1 ke alerts tabhi bante hain jab koi request aaye: raat me aise alerts kam aayenge, par jo aayein wo chhoote nahi.
- **Trade-off:** neend aur thakaan bamuqabla kanooni ghadiyaan aur nuksaan ka chhota samay.
- **Kanooni detail:** CERT-In ki 6 ghante ki ghadi raat me kaise ginti hai, aur 2 ya 3 ghante wali ghadiyaan ek insaan ke system pe kaise poori hon: Lawyer ya CA (AI) se nahi jaancha.
- **R1 ya baad me:** R1.
- **Kis par tika:** D-248, D-251, SR-078, SR-084.

### O-4. Packages npm pe publish karne ka plan

- **Sawal:** `packages/` ke saajhe packages kabhi public npm pe publish honge, aur kab?
- **Kyun zaroori:** D-023 kehta hai CLI pe naya kaam tabhi jab publish ka plan bane. Plan hone ya na hone se R1 ke CI, release workflow, versions aur changelog ka kaam badalta hai.
- **Vikalp:**
  - **(a) Abhi koi publish nahi:** har package `private: true`, CI pakka kare; packages sirf repo ke andar.
  - **(b) R1 ke baad chune hue saajhe packages** (misaal utils, India ke zod helpers, UI components) public npm pe: trusted publishing aur provenance ke saath, har publish owner ke haath se.
  - **(c) Har package har release pe publish.**
- **Salah:** (a) ab, aur R1 ke baad dobara dekhna. Publish har package ke version, changelog aur supply chain (R-026) ka bojh laata hai, jo R1 ke order flow me madad nahi karta.
- **Trade-off:** portfolio me dikhne wale packages bamuqabla capacity (D-009) aur supply chain ka jokhim.
- **R1 ya baad me:** baad me (R1 me sirf `private: true` ka pehra).
- **Kis par tika:** D-023, D-026.

## 3. OPERATIONS.md ke liye batches

Har batch ke niyam seedhe naye doc me ja sakte hain. Jahan niyam kisi O-x ke jawab pe tika hai, wahan batch ke neeche likha hai.

### Batch 1. Environments aur laptop ka setup

**Kis par:** D-001, D-002, D-049, D-051, D-056, CLAUDE.md. **R1.**

1. Teen jagah hain: **laptop** (development, split mode: har service alag process), **CI** (GitHub Actions, laptop wale hi containers) aur **live** (Render ki ek free web service me bundle mode, Render Key Value, har service ka Atlas cluster, finance ka Neon, aur 11 apps ke Vercel projects). Koi staging ya preview environment nahi; release ki poori jaanch laptop pe hoti hai.
2. Laptop ka infra `infra/` ki ek compose file me: MongoDB replica set (transactions ke liye), Valkey, PostgreSQL aur ek local email inbox. Har image exact version pe pinned. Ports sirf `127.0.0.1` pe.
3. Laptop ke version live se milte hain: MongoDB wahi major jo Atlas ke free cluster pe (abhi 8.0), PostgreSQL wahi major jo Neon project me, Valkey me Render jaisi chhoti memory seema aur wahi eviction policy.
4. Sirf us kaam ke containers chalu jo abhi chahiye (compose profiles). **Misaal:** backend tests pe `mongo` aur `valkey`; finance ka kaam ho to `postgres` bhi; email dekhna ho to `mail` bhi. Kaam khatam to `infra:down`.
5. Mutation testing ke liye alag containers alag ports pe, aur asli files ki copy me; development wale containers aur files kabhi nahi.
6. Laptop pe har service ka alag database aur alag DB user (live jaisa), ek hi local MongoDB server me.
7. Laptop, tests aur CI kabhi live databases ya live Redis se nahi judte. Live databases tak laptop ki pahunch sirf teen commands ko: backup, restore ka abhyaas aur break-glass, apne alag credentials se.
8. Laptop pe asli provider keys ki zaroorat nahi: email local inbox me, payment, push, media aur social sign-in ke fake adapters. Kisi provider ka asli test-mode kaam karna ho tabhi uski test key, sirf us din.
9. Har deployable ki `.env.example` git me, teen hisson me: **LOCAL** (laptop ki public values), **OPTIONAL** (default wali settings, commented), **PRODUCTION** (sirf naam aur `<...>` jaisi dummy value). Laptop ki `.env` me sirf LOCAL hissa. CI ka test pakka kare ki har service ke config schema ki har key `.env.example` me hai aur `.env.example` me koi anjaan key nahi.
10. Naye laptop ka setup ek command se: Node aur npm ka version jaanch, `npm ci`, `.env` banana (LOCAL hisse se), `infra:up`, seed. **Misaal:** `npm run setup`. Commands ki asli list code ke saath yahan judegi.

### Batch 2. CI aur branch ke pehre

**Kis par:** D-001, D-013, D-019, CLAUDE.md git flow, SR-080, SR-082, R-040, R-041; ARCHITECTURE §10.4 niyam 8. **R1** (niyam 9 baad me).

1. CI GitHub Actions pe; public repo pe standard runners muft (jaancha 2026-11-21). Jobs ek saath chalti hain, aur sirf aakhri `check` job baaki sabka nateeja jodti hai. Branch ke rules aur deploy sirf `check` ko dekhte hain, isliye uska naam nahi badalta.
2. Koi job `needs` se doosri ka intezaar nahi karti (sirf `check`): Render "After CI checks pass" tab deploy karta hai jab commit ke saare dikhte checks pass hon, aur ek bhi check na dikhe to deploy nahi karta (jaancha 2026-11-21).
3. Har run pe `guard`: poori git history ka secret scan (scanner ka binary version aur checksum se pinned, finding ka secret log me chhupa), branch flow ki jaanch (`prerelease` me feature branches, `release` me sirf `prerelease` ya `hotfix/*`, `main` me sirf `release`; sab isi repo ki branches se, fork se nahi), aur `npm audit` (high aur critical pe laal).
4. Branch flow ki jaanch galti se bachati hai, hamle se nahi: PR apna workflow khud badal sakta hai. Asli taala branch ke rulesets aur merge ka haq hai.
5. Static: Prettier, ESLint (service ki deewar aur config namespace ke lint, SR-071), typecheck, build. Docs badle to docs ke paths ka check (D-019).
6. Tests asli MongoDB replica set, Valkey aur PostgreSQL containers pe; E2E Playwright Chromium pe. Saath me repo ke pehre: backup folder ki koi file git me na ho (D-013), koi `.env` file git me na ho, har collection ki retention class (R-040), har repository query ka `explain` aur collection scan ka pehra, services ke beech dependency rule, aur migrations ka test (naya code purane data pe, purana code naye data pe; R-041).
7. Supply chain: har action commit SHA pe pinned; workflow ka default `permissions: {}`, har job ko sirf zaroori haq; fork PRs ko koi secret nahi; `pull_request_target` nahi; `npm ci` lockfile se (SR-082).
8. CI me koi production secret ya deploy key nahi. Render aur Vercel apne Git integration se deploy karte hain, sirf `release` se (SR-081). Packages ke tests kabhi asli npm registry ko nahi chhoote (fake registry).
9. E2E fail ho to traces ek artifact me, chhoti umar (misaal 7 din), bina personal data; backup files kabhi artifact nahi (SR-083).
10. Rulesets: `release` aur `main` pe seedha push, force push aur delete band, `check` zaroori; `prerelease` pe force push aur delete band (chhote fix ka seedha push CLAUDE.md ke niyam se).
11. `release` aur `main` pe `push` trigger rehta hai, kyunki Render aur Vercel merge commit ke checks dekhte hain.
12. **Baad me:** jab ek poora run misaal 15 minute se upar jaaye, tab PR pe sirf badle hisson ke tests, aur jo git tree pehle poora pass ho chuka uska nishaan (artifact) dekh ke dobara poora run nahi. Tab tak har run poora.

### Batch 3. Release, deploy, migrations aur rollback

**Kis par:** D-024, D-049, D-056, D-294, D-313, R-041; ARCHITECTURE §4 niyam 4, §5 niyam 4 aur 5, §10.4. **R1.**

1. Release ka kram: (1) `prerelease` pe laptop pe poora E2E aur bundle mode ka chhota naap 512 MB pe; (2) backup (Batch 6); (3) PR `prerelease` → `release`, `check` green; (4) Render aur Vercel apne aap deploy; (5) live pe smoke check (niyam 9); (6) release safal to PR `release` → `main` (jab tak `main` hai); (7) `release` pe koi commit bana to back-merge `release` → `prerelease`.
2. Render ki settings: auto-deploy "After CI checks pass", build filter sirf backend aur saajhe packages ke paths aur lockfile pe, region Singapore, health check path `/health`, start command seedha `node` (npm ke through nahi: memory bachti hai aur Render ka SIGTERM seedha app ko milta hai), flags `--max-old-space-size` misaal 256 aur `UV_THREADPOOL_SIZE` misaal 2.
3. Vercel: har app ka apna project, production branch `release`, preview deployments band, "kuch nahi badla to deploy chhodo" wali setting chalu, aur deploy `check` ka intezaar kare. Hobby pe din ke 100 deploys aur ek waqt me ek build (jaancha 2026-11-21): ek release me 11 apps ek-ek karke build hote hain.
4. Deploy ke waqt purana instance traffic leta rehta hai; naya uthne pe traffic badalta hai, purane ko 60 second baad SIGTERM, aur default 30 second baad SIGKILL (jaancha 2026-11-21). Isliye SIGTERM pe: naye requests band, chalte requests poore, ticker aur dispatcher ki lease chhodna, queue workers band, DB clients band, sab misaal 25 second me.
5. Release step (ARCHITECTURE §10.4 niyam 1) ka schema wala hissa (collections, validators, indexes) listen se pehle; lambi data migration listen ke baad background me lease ke saath, taaki naya instance health check aur cold start ki seema me uthe.
6. Expand aur contract: contract wala release tabhi jab expand wala release live pe misaal 7 din chal chuka aur koi rollback ki zaroorat nahi dikhi. Release ke note me "contract baaki" ki list.
7. Rollback sirf ek release peeche: Render pichhle do deploys tak hi wapas ja sakta hai (jaancha 2026-11-21), aur expand aur contract ki wajah se sirf pichhla release naye data ke saath surakshit hai. Usse peeche kabhi nahi; aage ka fix (roll-forward).
8. Rollback ka kram: (1) Render pe pichhla deploy wapas; (2) jis app me gadbad, uska Vercel pe pichhla production deploy wapas; (3) git me revert normal flow se; (4) galat likha data ek naye idempotent migration se theek, restore sirf jab data kho gaya ho. Finance ki SQL migrations sirf aage: unka rollback bhi naya migration.
9. Live smoke check (misaal 10 minute): `/health` aur `/ready`, ek public product page, allowlist ke ek account se sign-in, ek test-mode order shuru se payment tak, aur ops inbox me nayi errors. Kuch fail to niyam 8.
10. Hotfix: `release` se `hotfix/<naam>` → PR `release`; phir back-merge `release` → `prerelease`.
11. Har app ka kam se kam version setting me (ARCHITECTURE §5 niyam 5): API me tootne wala badlav aaye to pehle naya version path, phir apps, aur aakhir me kam se kam version badhana.
12. Har release ka chhota note PR ke description me: kya badla, migrations, "contract baaki", rollback surakshit hai ya nahi. Tag aur release notes sirf owner ke kehne pe; kahin koi AI attribution nahi.

### Batch 4. Secrets aur config

**Kis par:** D-196, D-197, D-200, D-026, SR-002, SR-079, SR-081, R-039. **R1.**

1. OPERATIONS me secrets ki ek table: naam, kaam, kahan rehta hai, kaun si service padhti hai, aakhri badlav ki tareekh, badalne ka kram. Value kabhi nahi.
2. Secrets ki list (misaal, code ke saath pakki): har Atlas cluster ka app user, release user aur read-only backup user; Neon ke app, migration aur backup roles; Redis ka internal URL; apps se gateway ka secret header; token sign karne wali keys; field encryption ki keys; payment gateway ki key aur webhook secret; email provider ki API key; push ki private key; teen social sign-in apps ke secrets; media provider ki key; backup encryption key; break-glass ka credential.
3. Kahan: backend ke secrets Render ke env me; apps ke liye sirf wo jo build ya rewrite ko chahiye, Vercel ke Sensitive env me; app ke bundle me kabhi koi secret nahi. Backup ki key aur recovery codes sirf password manager me, kisi provider ke env me nahi.
4. Test aur live keys naam se alag pehchaan me. Jab tak payments test mode me hain, boot pe jaanch: payment key test wali na ho to process shuru hi na ho.
5. Har service ka config zod schema se, apne namespace me; boot pe koi key kam ya anjaan ho to process key ke naam ke saath (value ke bina) ruk jaaye.
6. Badlav do values ke saath, bina downtime: (1) nayi value "agli" ki tarah jodo, deploy; (2) provider ya bhejne wale ko nayi pe badlo; (3) purani hatao, deploy. **Misaal:** apps ka secret header: gateway dono values maane, phir Vercel me nayi, phir gateway se purani hate.
7. Render me env badalne ke baad naya deploy zaroori; sirf restart naya env nahi uthata (jaancha 2026-11-21).
8. Kab: shak ya incident pe turant (gambhirta 1 pe misaal 1 ghante me, 2 pe 1 din); baaki saal me ek baar, tay mahine me (misaal April), ops inbox me yaad ke saath; signing keys apne aap.
9. Providers ke accounts pe MFA, recovery codes offline, tokens kam haq aur kam umar ke, production dashboards ek alag browser profile me.
10. Settings (thresholds, allowlist, kill switches, emails ki chhat) maalik service ke DB me aur Master app se badalti hain, bina deploy; env me sirf boot ka config aur secrets.

### Batch 5. Soya server, jagana aur samay wale kaam

**Kis par:** D-028, D-053, D-056, D-057, D-293, D-294, R-002, R-008, R-010, R-033; ARCHITECTURE §4, §5 niyam 14. Niyam 4 aur 9 **O-1** pe tike. **R1.**

1. Render ki free service 15 minute bina traffic ke so jaati hai, uthne me lagbhag 1 minute, aur workspace ko mahine ke 750 ghante (jaancha 2026-11-21). Soi service ghante nahi khaati.
2. Jagane ke raaste: (1) app khulte hi `/wake` seedha Render pe; (2) cron-job.org tay samay pe; (3) UptimeRobot ka monitor; (4) GitHub Actions ka schedule sirf backup ke roop me, kyunki wo bheed me late hota hai, kabhi chhoot jaata hai, sirf default branch pe chalta hai, aur public repo me 60 din koi activity na ho to band ho jaata hai (jaancha 2026-11-21).
3. Pinger sirf `/wake` ya `/health` bulaate hain: DB tak nahi, finance tak kabhi nahi; jawab me version nahi.
4. Jagane ki khidki aur interval owner ka faisla, settings ki tarah OPERATIONS me likha. **Misaal:** har ghante 09:00 se 22:00 IST; raat ko server soya.
5. Pehla pinger cold start se chhote timeout pe kaat deta ho to do call: :00 pe jagana, :03 pe jaanchna. UptimeRobot ka check pehle pinger ke kuch minute baad pade (misaal :10), taaki jaage server ko dekhe aur har ghante jhootha "down" na bane.
6. GitHub ka scheduled workflow `permissions: {}` ke saath, aur andar IST ki khidki ki jaanch: late shuru hua run khidki ke bahar server nahi jagata. Hafte ki jaanch me dekhna ki workflow band to nahi hua.
7. Har jaag pe: boot ke misaal 30 second baad poora sweep, dispatcher har Atlas cluster se judta hai, aur roz ke kaam "aakhri poora din" se chhoote din kram se banate hain. Khidki ka pehla pinger 09:00 IST pe ho, taaki sellers aur staff ka din ka saar subah bane.
8. Cold start ka target 90 second tak. Vercel ka bahar ke rewrite ka timeout 120 second (jaancha 2026-11-21), isliye app pehle `/wake` ka jawab leti hai; beech me server so gaya ho aur rewrite 502 ya 504 de to client dobara wake ka parda dikhata hai.
9. Ghanton ka hisaab: misaal 14 jaag × ~16 minute ≈ 115 ghante/mahina + asli use. 525 ghante (70%) pe owner ka kaam.
10. Render Key Value free restart pe khaali hota hai aur Render use kabhi bhi restart kar sakta hai (jaancha 2026-11-21): ticker "pending par queue me nahi" wale kaam dobara daalta hai.
11. Render ki taraf se keep-alive pe chetavni aaye to bahar ke pinger turant band; system app ke `/wake` aur DB ke timers pe bina code change chalta rahe.
12. Lamba break (misaal 3 hafte se zyada) ho to pinger chalu rahein. Atlas ka free cluster 30 din bina connection ke apne aap ruk jaata hai (jaancha 2026-11-21): resume ka kram har cluster ke project me "Resume", phir `/ready` dekhna.

### Batch 6. Backup aur restore

**Kis par:** D-013, D-196, D-200, D-303, D-309, D-313, SR-083, R-006, R-039; ARCHITECTURE §10.4 niyam 10. Niyam 3 **O-2** pe tika. **R1** (pehla restore ka abhyaas R1 se pehle).

1. Backup me: saare Atlas clusters (Extended JSON, har collection ek file), Neon (`pg_dump` custom format, read-only backup role, usi major version ke container se) aur band FY ki export files. Backup me nahi: media provider ki files (product images seller se dobara li jaati hain; daawe aur saboot ki files apne samay pe waise bhi mitti hain), Redis (cache aur queue, dobara banta hai), aur providers ke logs.
2. Providers ke apne backup pe bharosa nahi: Atlas ke free cluster pe backup nahi milta, aur Neon free me sirf 6 ghante ka instant restore aur ek manual snapshot (jaancha 2026-11-21). Neon ka 6 ghante ka restore sirf "abhi hui galti" ke liye.
3. Kab: har release se pehle, har contract wale release se pehle zaroor, aur owner ke tay kiye samay pe. **Misaal:** hafte me ek baar, Sunday.
4. Kahan: repo ke andar git se bahar wala folder, chaar pehron ke saath; encrypted; laptop pe aakhri 3; kabhi CI artifact ya cloud sync wale folder me nahi.
5. Har backup ke saath ek manifest: samay (UTC), git commit, har collection ki ginti aur hash, schema ka fingerprint, encrypted file ka hash. Encrypted fields backup me bhi encrypted; keys backup me kabhi nahi.
6. Transfer ki seema: Atlas ka har free cluster 7 din me 10 GB bahar, aur Neon ka project mahine me 5 GB public transfer (jaancha 2026-11-21). Backup command har cluster ka size bataye; ek hafte me ek se zyada poora backup na ho jab tak zaroorat na ho.
7. Backup laptop se seedha databases pe chalta hai, Render ko nahi jagata. M0 ke 100 ops/second ki wajah se bade batch aur ruk-ruk ke padhna.
8. Restore pehle laptop ya alag test database me: ginti aur hash ka milaan, audit chain ka verify, finance ke journal ka barabar hona, aur ek E2E smoke. Iske baad hi production me. Har restore audit me.
9. Production restore ka kram: (1) checkout, sign-up aur uploads ke kill switches band; (2) jis cluster ka restore, sirf usi ka; (3) restore ke baad delete hue accounts ki list ke deletes dobara; (4) release step ka fingerprint aur `/ready`; (5) smoke check; (6) switches kholna.
10. Restore ka abhyaas har 3 mahine (misaal) aur har bade schema badlav ke baad: aakhri backup laptop pe restore karke niyam 8 ki jaanch, aur key ka chalna bhi. Nateeja, samay aur tareekh OPERATIONS ki abhyaas wali table me ek line.
11. RPO aur RTO saaf likhe: RPO = aakhri backup tak (6 ghante ke andar ki finance ki galti Neon ke restore se); RTO misaal 1 din.
12. Backup, restore aur break-glass ke credentials laptop pe alag aur kam haq wale; har chalana audit me.

### Batch 7. Monitoring, health aur alerts

**Kis par:** D-028, D-057, D-286, D-297, D-298, SR-078, R-024; ARCHITECTURE §8. Niyam 3 **O-3** pe tika. **R1.**

1. `/health` sirf process aur event loop (Render ka health check); `/ready` Mongo clusters, Redis, dispatcher aur ticker (finance nahi); `/wake` 204. `/ready` kabhi Render ka health check nahi, warna Redis ya Atlas ki chhoti gadbad pe poora backend restart hota.
2. Alerts ke raaste sirf teen: Master app ka ops inbox, browser push, aur gambhir pe email (din me misaal 5 tak).
3. Gambhirta: **1** (turant push + email): audit chain toota, milaan me farak, refresh token ka dobara istemaal, webhook signature ke fail ki baadh, kill switch chala, RSS 450 MB, cluster ya Neon 85%; **2** (push + inbox): RSS 400 MB, 5xx 2% se upar, outbox 60 second se purana, dead letter, Redis 60%, cluster 70%, emails 80%; **3** (roz ka saar). Owner kab dekhega, ye OPERATIONS me likha.
4. Ek hi fingerprint ka alert misaal ek ghante me ek baar; theek hone pe "theek" ki khabar.
5. Hamare apne alerts sirf jaage server pe bante hain. Isliye bahar ke free alerts bhi chalu jo soye server pe chalte hain: UptimeRobot ke down aur up email; har Atlas project me Logical Size (70% aur 85%), Connections aur Network ke alerts email pe (free cluster pe yahi conditions milti hain, jaancha 2026-11-21); Render, Vercel aur Neon ke usage emails jahan milein (jaanchna baaki).
6. Master app ke ops page pe: aakhri jaag, aakhri sweep, har roz ke kaam ka "aakhri poora din", aakhri backup ki tareekh (haath se darj), aur khule alerts.
7. Vercel ke runtime logs Hobby pe sirf 1 ghanta rehte hain (jaancha 2026-11-21) aur Render ke logs ki umar jaanchna baaki: server ki har zaroori baat apne logs service me; incident me Render ke logs ki turant copy.
8. Apps ki errors rate-limited route se ops inbox tak (D-286); server band ho to ye nahi pahunchti, tab UptimeRobot hi saboot hai.
9. Hafte ki jaanch (Batch 9) me alerts ka "dead man" check: ops inbox me pichhle 7 din ka roz ka saar har din aaya ya nahi.

### Batch 8. Incident ke runbooks

**Kis par:** D-197, D-198, D-200, D-248, D-251, D-253, SR-009, SR-084, R-023, R-027. Niyam 2 **O-3** pe tika. **R1.**

1. Har runbook ek hi dhaanche me: pehchaan, gambhirta, turant rokna, jaanch, theek aur wapsi, khabar, seekh. Gambhirta SR-084 ke teen level.
2. Jawab ka samay: gambhirta 1 pe alert dekhte hi; baaki owner ke tay samay pe.
3. **Data leak:** CERT-In ki 6 ghante ki ghadi "pata chalne" se chalti hai, "pakka hone" se nahi; Board ko bina der aur 72 ghante me poori report; users ko pakka hote hi. "Pakka" tab maana jaaye jab audit ya logs se dikhe ki personal data kisi anadhikrit tak gaya, ya aisa secret leak hua jisse data padha ja sakta tha. Users ke email, in-app sandesh aur site ki patti ke draft pehle se taiyar; leak ke emails din ki chhat me OTP ke saath sabse aage.
4. **Secret leak** (repo, logs ya kahin aur): pehle secret badlo, phir jaanch. Public repo me history saaf karna ilaaj nahi: secret ko leak maan ke hi chalo.
5. **Provider account pe kabza** (GitHub, Render, Vercel, Atlas, Neon, payment gateway, email): sessions aur tokens band, MFA dobara, Render ka auto-deploy band, us account ke saare secrets badlo, audit aur git history dekho.
6. **Laptop kho jaaye ya chori:** laptop pe jo bhi pahunch thi (DB credentials, GitHub, password manager ka session) sab badlo; backups encrypted hain, key password manager me.
7. **Server band ya baar-baar restart (OOM):** Render ke events aur logs, RSS ke alerts; heavy queue rok; pichhla release wapas (Batch 3).
8. **Free tier khatam** (Render ke ghante ya bandwidth, Neon ke CU-ghante ya transfer, Atlas ki jagah): kya band hota hai aur kab wapas, ye table me; finance band ho to checkout ka kill switch, taaki pack pe ruke orders na badhein; apps saaf sandesh dikhayein.
9. **Sarkari order ya gambhir content report:** content chhupane ke tools ek jagah, Master app se, bina deploy; ghadi aur kiya gaya kaam audit me.
10. **Redis khaali, Atlas cluster ruka, webhook fail, milaan me farak:** har ek ka chhota kram (apne aap recovery ki jaanch, resume, milaan ki report).
11. Seekh: fix live hone ke baad hi LESSONS me ek line, bina personal data aur bina hamle ke tareeke ki detail (repo public hai); naya test; threat model me badlav.
12. Saal me ek baar abhyaas, ek scenario pe (misaal "secret leak"), aur runbook me jo kami mili wo theek.

### Batch 9. Capacity aur free tier ki nigrani

**Kis par:** D-028, D-142, D-283, D-298, D-317, R-006, R-008, R-014, R-029, R-035, R-036; ARCHITECTURE §8 niyam 9, §9. **R1.**

1. Hafte ki jaanch (misaal Sunday, 15 minute), providers ke dashboards se: Render (ghante, bandwidth, build minutes), Vercel (deploys, usage), har Atlas cluster (jagah, 7 din ka network), Neon (CU-ghante, jagah, public transfer), email provider (din ke emails, bounce), media provider (credits), Redis ki memory (ops snapshot), GitHub (schedule chalu hai, dependency alerts), aakhri backup ki tareekh, UptimeRobot ke incidents.
2. Number ek chhoti table me, git ke bahar (misaal laptop ki git-ignored file); 70% pe owner ka kaam.
3. 70% pe kaam ki misaal: bandwidth pe polling kam aur CDN cache ki jaanch; Render ke ghanton pe jagane ki khidki chhoti; Neon pe batch ka interval; Atlas pe archive aur chunks ki umar.
4. ₹0 ki seema ki table (ARCHITECTURE §9) har 6 mahine providers ke docs se dobara jaanchi jaaye, tareekh ke saath; providers ki free sharten bina khabar badal sakti hain.
5. Ek hi Render web service aur ek hi Key Value: koi doosri free web service, test ke liye bhi, kabhi nahi.
6. Vercel pe din ke 100 deploys aur ek waqt me ek build: din me ek ya do release, aur bina badle app ka deploy chhodna.
7. Repo GitHub ke personal account me rahe: Vercel Hobby organization ke repos se nahi judta (jaancha 2026-11-21).

### Batch 10. 512 MB pe memory ka naap

**Kis par:** D-049, D-298, R-007, R-030; ARCHITECTURE §9 niyam 3, 4 aur 6. **R1 se pehle.**

1. Naap Docker me: bundle mode, compiled JS, wahi start command aur flags jo Render pe; container ki seema 512 MB memory (swap ke bina) aur kam CPU (misaal `--cpus=0.1`, aur tulna ke liye 0.5).
2. Chaar halat naapni hain: (1) boot ke baad khaali; (2) cold start ka samay; (3) aam load (misaal 5 requests/second, 10 minute); (4) sabse bura pal: 2 password sign-ins, place order ki baadh, ek PDF, aur 50,000 rows ka export aur import ek saath.
3. Har halat me: RSS ka peak aur aam, heap, event loop ki der (p99), p95 samay, aur koi OOM ya 503. Har naap 3 baar.
4. Nateeja OPERATIONS ki naap wali table me: tareekh, commit, number. Aam RSS 400 MB se upar ho to services ko alag karne wala faisla (D-049) dobara khulta hai.
5. Dobara naap: har release jo nayi service ya bhaari dependency jode, aur har 3 mahine.
6. Live pe naap ka milaan: pehle deploy ke baad ops snapshot ka RSS laptop ke naap se milaana; hafte me OOM restarts ki ginti Render ke events se.
7. Naap ka script repo me (`scripts/`), sirf laptop pe chalta hai, live pe kabhi nahi.

### Batch 11. Dependencies aur packages ka publish

**Kis par:** D-001, D-023, SR-082, R-026, CLAUDE.md (npm ke niyam). Niyam 6 aur 7 **O-4** pe tike. **R1** (niyam 7 baad me).

1. Dependency updates mahine me ek baar apne aap PRs se, `prerelease` pe; minor aur patch ek group me, major alag PR me. Security alert (high ya critical) pe turant.
2. Har naya dependency review ke baad: maintainers aur halchal, install scripts, license, size aur memory (512 MB), aur kya Node ya pehle ka koi package wahi kaam karta hai.
3. Node ka version ek jagah pinned (`engines` aur `devEngines`), Render pe wahi version, Docker images exact version pe.
4. Atlas free cluster ka MongoDB version Atlas khud badhata hai aur maintenance ka samay hum nahi chunte (jaancha 2026-11-21): CI usi major ke taaza patch pe chale, aur Atlas ke upgrade ke email ke baad live pe smoke check.
5. Dependency ke PR pe wahi poora CI; merge owner kare, apne aap nahi.
6. Jab tak publish ka plan nahi: har package `private: true`, aur CI pakka kare ki koi package bina iske nahi.
7. Publish ka plan bane to: npm pe publish, `npm login` aur `npm logout` aur `npm trust` sirf owner ke haath; workflow sirf `release` se, haath se chalaya; do jobs: ek bina haq ke build, test aur pack kare, doosri sirf bane tarballs utaar ke trusted publishing (OIDC) aur provenance se publish kare; naya package pehli baar owner laptop se publish kare; release ka sandesh `release` branch ka naam bataye, back-merge `release` → `prerelease` likha ho, aur CLI ke tests ke liye local infra chalu ho (D-023 ke teen niyam).
8. Packages ke tests kabhi asli npm registry ko nahi chhoote; fake registry hi.

## 4. Prastaavit risks

| Id    | Risk                                                                                                                                                              | Asar                                                                           | Sambhavna | Bachav                                                                                                                                        | Juda                       |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| P-R1  | GitHub ke scheduled runs bheed me late ya chhoot jaate hain, aur public repo me 60 din bina activity ke band (jaancha 2026-11-21).                                | Jis din koi app na khule, roz ke kaam aur alerts der se.                       | Madhyam   | GitHub sirf backup; cron-job.org aur UptimeRobot pehle; IST khidki ki jaanch; hafte ki jaanch me schedule chalu hai ya nahi.                  | R-002                      |
| P-R2  | Render keep-alive ya baar-baar jagane ko apne niyam ke khilaaf maane; docs me iska koi likhit niyam nahi (jaancha 2026-11-21).                                    | Free service band ya account pe rok.                                           | Kam       | Lagataar nahi, sirf tay khidki me jagana; chetavni pe pinger turant band; system bina pinger bhi chalta hai.                                  | R-002, R-008               |
| P-R3  | Render ka rollback sirf pichhle do deploys tak (jaancha 2026-11-21).                                                                                              | Do release peeche ki gadbad pe wapas jaana mumkin nahi.                        | Kam       | Sirf ek release peeche rollback; contract release expand ke kam se kam 7 din baad; aage ka fix.                                               | R-041                      |
| P-R4  | Atlas free pe provider ka backup nahi, Neon me sirf 6 ghante ka restore (jaancha 2026-11-21); apna backup sirf laptop pe (D-196).                                 | Aakhri backup ke baad ka data, ya laptop ke saath backups bhi, kho sakte hain. | Kam       | Tay samay pe backup, restore ka abhyaas, manifest, laptop ka disk encryption (jaanch baaki).                                                  | R-006, R-023               |
| P-R5  | Neon free me project ka 5 GB/mahina public transfer; khatam ho to compute band (jaancha 2026-11-21). Backup ka `pg_dump` bhi isme gin sakta hai (jaanchna baaki). | Finance band, pack aur dispatch ruke.                                          | Kam       | Hafte ki jaanch me transfer, ek hafte me ek se zyada poora dump nahi, finance ke jawab chhote.                                                | R-014, R-028               |
| P-R6  | Vercel Hobby pe runtime logs 1 ghanta (jaancha 2026-11-21), Render ke logs ki umar pata nahi.                                                                     | Incident me apps aur edge ka saboot jaldi gayab.                               | Madhyam   | Server ki baatein apne logs service me; incident me turant copy; apps ki errors route se.                                                     | R-024                      |
| P-R7  | Cold start (~1 minute, target 90 s) aur Vercel ke rewrite ka 120 s timeout (jaancha 2026-11-21) ke beech kam jagah; boot pe release step bhaari ho to timeout.    | Pehla user ya webhook fail, ya deploy ka health check fail.                    | Madhyam   | Pehle `/wake`; release step ka schema hissa hi listen se pehle; client 502/504 pe wake ka parda; webhook ki dobara koshish aur roz ka milaan. | R-002                      |
| P-R8  | Ek insaan pe saare alerts: raat ya chhutti me gambhir alert ka jawab der se.                                                                                      | Kanooni ghadiyaan (6 ghante, 3 ghante, 2 ghante) chhoot sakti hain.            | Madhyam   | Owner ka tay jawab ka samay, gambhirta 1 pe push, kill switches aur apne aap chhupna. Kanooni asar Lawyer se nahi jaancha.                    | R-002, R-024               |
| P-R9  | Lagbhag 20 secrets ka haath se badlav; ek galti se login, payment ya emails band.                                                                                 | Badlav ke waqt outage.                                                         | Madhyam   | Do values ke saath badlav, likha kram, env ke baad naya deploy (jaancha 2026-11-21), badlav ke baad smoke check.                              | R-027                      |
| P-R10 | Providers ki free sharten bina khabar badalti hain (jaise Neon ki jagah ke alag-alag number).                                                                     | Capacity ke hisaab galat, achanak rok.                                         | Madhyam   | Har 6 mahine docs se dobara jaanch; numbers settings me; hafte ki jaanch.                                                                     | R-006, R-008, R-014, R-029 |
| P-R11 | Atlas free cluster ka MongoDB version Atlas khud badhata hai, maintenance ka samay apna nahi (jaancha 2026-11-21).                                                | Hamare release ke bina vyavhaar badal sakta hai.                               | Kam       | CI usi major ke taaza patch pe; upgrade ke email pe smoke check.                                                                              | R-006                      |
| P-R12 | Public repo me fix se pehle kamzori ki detail (PR, commit, LESSONS) dikh jaaye.                                                                                   | Hamlavar ko khuli kamzori ka pata.                                             | Kam       | Security fix ka PR saada; detail aur seekh fix live hone ke baad, bina hamle ke tareeke ke.                                                   | R-027                      |

## 5. Sirf jaanch

### 5.1 Is run me jaanchi (2026-11-21)

| #   | Tathya                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Source                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Render free web service: 15 minute bina inbound traffic ke neend, uthne me lagbhag 1 minute, workspace ko 750 ghante/mahina, soi service ghante nahi khaati; bandwidth aur build pipeline minutes workspace ki shaamil maatra me gine jaate hain (number page pe nahi); payment method na ho to bandwidth paar hone pe saari free services mahine ke ant tak band, aur pipeline minutes paar hone pe naye builds band (purane chalte rehte); ghante khatam to saari free web services agle mahine tak band; "uncommonly high" bahar ka traffic pe rok ho sakti hai; rollback sirf pichhle do deploys tak; Render kabhi bhi restart kar sakta hai; scaling, disk, one-off jobs aur shell nahi. Free Key Value: workspace me ek, disk pe save nahi, restart pe data jaata hai. Page keep-alive, health check aur logs ki umar pe chup. | https://render.com/docs/free                                                                                                                                                              |
| 2   | Render deploy: zero downtime (disk na ho to); naya instance uthne pe traffic badalta hai, purane ko 60 second baad SIGTERM, shutdown delay default 30 second (300 tak); build ya command fail to purana chalta rehta hai; "After CI checks pass" me success, neutral aur skipped pass gine jaate hain, aur ek bhi check na ho to deploy nahi; restart naye env vars nahi uthata.                                                                                                                                                                                                                                                                                                                                                                                                                                                     | https://render.com/docs/deploys                                                                                                                                                           |
| 3   | Render Key Value: internal URL pe default bina auth (auth chalu kar sakte hain); external URL default band, external pe hamesha auth aur TLS; IP allow list. Free ki memory aur connections ke number is page pe nahi.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | https://render.com/docs/key-value                                                                                                                                                         |
| 4   | GitHub `schedule`: bheed me der (har ghante ki shuruaat pe bheed), kabhi job chhoot jaata hai, sabse chhota interval 5 minute, sirf default branch, public repo me 60 din bina activity ke apne aap band.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows                                                                                          |
| 5   | GitHub Actions ke standard runners public repo pe muft.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | https://docs.github.com/en/actions/concepts/billing-and-usage                                                                                                                             |
| 6   | Secret scanning public repos pe apne aap aur muft. "Push protection for users" default chalu (bypass ho sakta hai); repository ka push protection default band aur GitHub Secret Protection maangta hai.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning ; https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection |
| 7   | Vercel Hobby: 200 projects, din ke 100 deployments, ghante ke 100 builds, ek waqt me 1 deployment, ek Git repo se 25 projects, build 45 minute tak, bahar ke rewrite ka timeout 120 second (`ROUTER_EXTERNAL_TARGET_ERROR`), runtime logs 1 ghanta, project pe 5 deploy hooks, function 300 second; Hobby team Git organization ke repo se nahi judti. (Page ki `last_updated` 2026-09-16.)                                                                                                                                                                                                                                                                                                                                                                                                                                          | https://vercel.com/docs/limits                                                                                                                                                            |
| 8   | Neon free: project me 1 GB (sab projects milake 20 GB), project ko 100 CU-ghante/mahina, autoscale 2 CU tak, 5 minute pe compute so jaata hai (free me band nahi kar sakte), instant restore 6 ghante (1 GB badlav ka itihaas), 1 manual snapshot, 100 projects, project me 10 branches, project ka 5 GB public network transfer (khatam to compute band); jagah bhari to writes fail, data delete nahi.                                                                                                                                                                                                                                                                                                                                                                                                                             | https://neon.com/docs/introduction/plans                                                                                                                                                  |
| 9   | Atlas free cluster: backup sirf private preview me; `mongodump` me `--oplog` aur `--dumpDbUsersAndRoles` nahi, `admin` database ka dump nahi; logs download nahi; 30 din zero connections pe apne aap pause, resume ho sakta hai (purane version pe ruka ho to nahi); custom roles ke badlav 30 second tak lete hain; 7 din me 10 GB andar aur 10 GB bahar; 100 ops/second; 500 connections; 0.5 GB; MongoDB 8.0, Atlas khud upgrade karta hai; maintenance window apna nahi; alerts sirf Connections, Logical Size, Network aur Opscounter pe; Performance Advisor nahi.                                                                                                                                                                                                                                                            | https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/                                                                                                                     |
| 10  | UptimeRobot free: 50 monitors, 5 minute ka sabse chhota interval, keyword monitor, "personal and commercial projects" ke liye. Free pe email alert aur request timeout page pe saaf nahi.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | https://uptimerobot.com/pricing/                                                                                                                                                          |

**`docs/OPEN_QUESTIONS.md` §2 me kya jawab mila:**

- "Neon ke free plan me ek project ki jagah (0.5 GB ya 1 GB)": plans page ke hisaab se **1 GB** (#8). "Khule connection pe compute sota hai ya nahi" baaki.
- "Neon ke free plan me roles, `sslmode` aur point-in-time restore ki khidki": restore ki khidki **6 ghante** (#8); roles aur `sslmode` baaki.
- "Atlas ka free cluster bina connection ke kitne din me ruk jaata hai, aur Render free instance ka CPU": **30 din** (#9); CPU baaki.
- "Atlas M0 pe custom roles": page custom roles ke badlav ka samay batata hai, yaani milte hain (#9), par audit ke sirf `insert` aur `find` wale role ka asli test baaki; `readWrite` me `collMod` baaki.
- "Atlas M0: MongoDB ka version ...": **8.0**, aur Atlas khud upgrade karta hai (#9); baaki hisse baaki.
- "Render Key Value ke free plan me password aur TLS": internal pe default bina auth, auth chalu ho sakta hai; external pe auth aur TLS (#3). Internal TLS aur memory bharne pe kya mitta hai, baaki.
- "Render ki free web service ke logs kitne din, aur public repo pe secret scanning aur push protection muft": secret scanning **haan, apne aap**; users ka push protection default chalu, repo ka push protection default band (#6). Logs ki umar baaki.
- "M0 ke 7 din ke 10 GB transfer me backup command": seema pakki (#9); backup ka asli size code ke baad.

### 5.2 Jaanchna baaki

- Render: free instance ka CPU; bandwidth aur build pipeline minutes ke number (pricing page pe number nahi khule); free pe logs kitne din; free pe health check ka vyavhaar aur timeouts; free pe pre-deploy command; rollback ke baad auto-deploy band hota hai ya nahi; Key Value free ki memory, connections aur eviction policy; Render ka usage email.
- cron-job.org: request ka timeout aur free ki sharten.
- UptimeRobot free: email alert aur request timeout.
- Vercel Hobby: bandwidth aur edge requests ki maatra, seema paar hone pe kya hota hai, aur non-commercial ki shart (R-011); rewrite se secret header (OPEN_QUESTIONS §2 me pehle se).
- Neon: `pg_dump` public transfer me ginta hai ya nahi; usage ka email.
- GitHub: public repo pe repo ka push protection muft chalu hota hai ya nahi; artifacts aur cache ki umar.
- Brevo free (OPEN_QUESTIONS §2 me pehle se).

## 6. Pehle ke kaam se lene layak (D-074)

| Kya                                                                                                                                                                         | Kahan (purana path)                                   | Kyun achha                                                                  | Kasauti check                                           | Naye docs me kahan         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------- |
| Scheduled wake workflow me `permissions: {}`, concurrency, curl ka retry aur max time, aur IST khidki ki jaanch taaki late run raat ko na jagaye                            | `.github/workflows/wake.yml`                          | GitHub ke late runs (jaancha) se raat ki neend nahi tootti, koi haq nahi    | Zaroorat: haan (D-028). Takraav: nahi. Naya vakya: haan | OPERATIONS Batch 5 niyam 6 |
| cron-job.org pe do call (:00 jagana, :02 jaanchna) kyunki uska timeout cold start se chhota; UptimeRobot ka check kuch minute baad                                          | `docs-old/ARCHITECTURE.md` §11.1                      | Jhoothe "down" alerts aur pinger ki fail emails nahi                        | Haan / nahi / haan (timeout ka number jaanchna baaki)   | Batch 5 niyam 5            |
| Render start command seedha `node`, npm nahi                                                                                                                                | `scripts-old/render/start.sh`                         | ~40 se 50 MB memory bachti, SIGTERM seedha app ko (graceful stop)           | Haan (R-007) / nahi / haan                              | Batch 3 niyam 2            |
| `UV_THREADPOOL_SIZE` chhota                                                                                                                                                 | `docs-old/ARCHITECTURE.md` §11.1                      | Kam CPU pe argon2 aur zlib ke threads ki bheed kam                          | Haan (R-030) / nahi / haan                              | Batch 3 niyam 2            |
| Secret scanner ka binary checksum se pinned, poori history, finding me secret chhupa                                                                                        | `.github/workflows/ci.yml` (`guard`)                  | Bahar ke action ya token ke bina, public log me secret nahi                 | Haan (SR-080) / nahi / haan                             | Batch 2 niyam 3            |
| Branch flow ki CI jaanch, branch ke naam env se (command me seedhe nahi), "galti se bachata hai, hamle se nahi" ki saaf baat                                                | `.github/workflows/ci.yml`, `docs-old/RULES.md` §2    | Galat PR flow pakda jaata; naam se injection nahi                           | Haan (CLAUDE.md) / nahi / haan                          | Batch 2 niyam 3 aur 4      |
| Ek aakhri `check` job aur baaki jobs me `needs` nahi                                                                                                                        | `.github/workflows/ci.yml`                            | Render ka "After CI checks pass" (jaancha) adhoore checks pe deploy na kare | Haan / nahi / haan                                      | Batch 2 niyam 1 aur 2      |
| Wahi git tree pass hua ho to dobara poora run nahi, aur PR pe sirf badle hisse                                                                                              | `.github/workflows/ci.yml`, `docs-old/RULES.md` §2    | Ek insaan ka CI ka intezaar kam                                             | Haan, par baad me / nahi / haan                         | Batch 2 niyam 12 (baad me) |
| Publish ki do jobs: bina haq ka build, OIDC trusted publishing aur provenance wali publish; naya package pehli baar laptop se                                               | `.github/workflows/release.yml`                       | Publish wali job package ka code nahi chalati; koi npm token kahin nahi     | Haan, agar publish ho (O-4) / nahi / haan               | Batch 11 niyam 7           |
| Dependency PRs `prerelease` pe, mahine me                                                                                                                                   | `.github/dependabot.yml`                              | Git flow se mel, kam shor                                                   | Haan (SR-082) / nahi / haan                             | Batch 11 niyam 1           |
| Local infra: ports sirf `127.0.0.1`, exact images, Render jaisi Valkey seema, local email inbox HTTP API se, mutation ke alag containers, fail points sirf laptop aur CI pe | `infra-old/README.md`, `infra-old/docker-compose.yml` | Live jaisa bartav, Wi-Fi pe khula nahi, retry ke tests                      | Haan / nahi / haan                                      | Batch 1 niyam 2 se 5       |
| `.env.example` ke teen hisse aur config schema se milaan ka CI test                                                                                                         | `docs-old/RULES.md` §2 niyam 4                        | Production ki keys ki list bina value ke; typo boot pe pakda                | Haan (SR-079) / nahi / haan                             | Batch 1 niyam 9            |
| Vercel me previews band, "kuch nahi badla to skip"; Render ka build filter                                                                                                  | `docs-old/ARCHITECTURE.md` §11.4, §11.5               | Hobby ke 100 deploys (jaancha) bachte, bekaar backend builds nahi           | Haan (D-056) / nahi / haan                              | Batch 3 niyam 2 aur 3      |
| E2E fail pe hi traces ka artifact                                                                                                                                           | `.github/workflows/ci.yml`                            | Fail ki jaanch aasaan, jagah kam                                            | Haan / nahi (SR-083 se backup kabhi nahi) / haan        | Batch 2 niyam 9            |
| Render ki chetavni pe pinger turant band, system bina pinger chale                                                                                                          | `docs-old/ARCHITECTURE.md` §11.1                      | Policy ke jokhim ka saaf jawab                                              | Haan (R-008) / nahi / haan                              | Batch 5 niyam 11           |

**Na lein:**

- Bahar ki error service ka SDK aur uska init (D-286: bahar ki error service nahi).
- Teesra pinger (alag status service): ek aur account; D-028 ke teen raaste kaafi.
- Bade imports live server ki jagah laptop ke script se: ARCHITECTURE §10.4 niyam 9 me location master Master app ke import se tay hai.
- Preview deployments ke liye gateway ka host regex aur projects ki list (D-056: preview nahi).
- `--max-old-space-size` 300 aur ek waqt me ek password hash ki chhat: D-298 aur SR-007 ne 256 aur 2 tay kiye.
- CI ka alag build cache job abhi: Batch 2 niyam 12 ke saath baad me hi socha jaaye.
- `main` branch se jude CI ke hisse naye flow me utne hi, jitne D-024 ke laagu hone tak chahiye.

## 7. Tay faislon pe dhyaan

1. **D-028, D-056 aur ARCHITECTURE §9:** ek jagah "24 ghante jaagi rahe to bhi fit", doosri jagah "raat ko server soya". Jagane ki khidki ek jagah saaf likhni chahiye (O-1); 24 ghante jaagne pe 750 me jagah lagbhag nahi, aur deploy ke waqt do instance thode ghante aur khaate hain.
2. **SR-078 (server down ke alert UptimeRobot se) aur D-028 (soya server):** UptimeRobot ka check soye server pe pade to cold start ki wajah se har baar "down" dikh sakta hai, aur asli down alerts shor me kho jaate. Check jaage server pe pade (Batch 5 niyam 5).
3. **D-013 (backup "production me jaane se pehle"):** Atlas free pe provider ka backup nahi aur Neon me sirf 6 ghante (jaancha). Sirf release se pehle ka backup ho to data jokhim release ke beech ka poora samay ban jaata hai (O-2).
4. **D-196 (encrypted copy sirf laptop pe):** owner ne doosra device abhi nahi chuna; laptop kharab ya chori ho aur usi samay kisi cluster me gadbad ho to dono jagah ka data jaata hai. Faisla waisa hi; sirf yaad ki ye jokhim P-R4 me hai.
5. **D-248 (CERT-In 6 ghante):** ghadi "pata chalne" se chalti hai, "pakka hone" se nahi. Runbook me dono ka farak saaf na ho to 6 ghante ki ghadi users wali "pakka" ki ghadi ke saath mil sakti hai. Kanooni detail: Lawyer ya CA (AI) se nahi jaancha.
6. **D-251 (sarkari order 3 ghante, nagnata wali report 2 ghante):** nagnata wali report pe apne aap chhupna request me hota hai, par sarkari order pe insaan ka kaam chahiye; ek insaan aur raat ki neend me 3 ghante pakke nahi (O-3). Kanooni detail: Lawyer ya CA (AI) se nahi jaancha.
7. **ARCHITECTURE §10.4 niyam 1 (release step boot pe, data migrations samet):** lambi data migration listen se pehle chale to naya instance der se uthta hai, aur Vercel ke 120 second (jaancha) aur cold start ke 90 second ke target ke beech jagah kam hai. Schema ka hissa listen se pehle aur data migration background me (Batch 3 niyam 5) se ye niyam toote bina sambhalta hai.
8. **SR-080 ("secret scanning aur push protection chalu"):** public repo pe scanning apne aap hai, par users wala push protection bypass ho sakta hai aur repo wala default band hai (jaancha). Asli pehra CI ka secret scan hi rahe; repo ka push protection muft chalu hota hai ya nahi, jaanchna baaki.
9. **SR-084 niyam 7 (LESSONS me ek line) aur public repo:** seekh fix live hone ke baad hi, bina hamle ke tareeke aur personal data ke (Batch 8 niyam 11); warna khuli kamzori sabke saamne.
10. **D-024 (default branch `release`) aur scheduled workflows:** GitHub schedule sirf default branch pe chalta hai (jaancha). Default branch badalte waqt wake workflow nayi default branch pe pehle se ho, warna jagana chupchaap band. Saath me D-048: repo personal account me hi rahe, Vercel Hobby organization ke repo se nahi judta (jaancha).
11. **RISKS §2.1 aur R-006:** wahan "8 services = 8 projects" likha hai; ab media aur logs judne se 10 Atlas clusters aur projects hain (ARCHITECTURE §2.4, §9). 250 ki seema ke andar, par ginti sudharni hai.

## 8. Aage ke agents ke liye

**UX / Product Architect:**

- Wake ka parda: cold start 90 second tak; misaal 150 second ke baad "Try again"; beech me server so jaaye (502/504) to wahi parda dobara.
- Free tier khatam ho ya Render band ho: apps Vercel pe chalti rehti hain, to saaf sandesh chahiye ki "server abhi band hai", aur finance band ho to checkout ka rukna saaf dikhe.
- Master app ka ops page: aakhri jaag, aakhri sweep, roz ke kaam ka aakhri din, aakhri backup (haath se), khule alerts gambhirta ke saath; hafte ki jaanch ka form baad me.
- Restore ya incident ke waqt kill switches ke sandesh aur site ki patti.

**QA Architect:**

- SIGTERM pe graceful band hona aur do instance ek saath (lease, idempotent handlers); Redis khaali hone ke baad queue ka wapas banna.
- Soye server ka test: samay aage badha ke chhoote din ka catch-up, aur boot ke sweep ka kaam.
- Backup → restore → jaanch ka laptop pe automated test (ginti, hash, audit chain, journal ka barabar hona).
- 512 MB ka naap script (Batch 10) aur uska nateeja table me.
- CI ke pehre: branch flow, backup folder, `.env` files, `.env.example` ka schema se milaan, retention class, collection scan, dependency rule, migrations ke dono taraf ke test, `private: true`.
- Boot ki jaanch: test-mode payment key na ho to process na uthe; anjaan config key pe ruk jaana.
- Alerts ka dedupe aur "theek" ki khabar; fake npm registry wale tests.

**Security Architect (doosra run):**

- `/wake` ka CSP apvaad (pehle se khula).
- Vercel rewrite se secret header ka raasta (OPEN_QUESTIONS §2).
- Atlas, Neon aur Redis ka network: Render ke bahar jaane wale IPs tay nahi to IP access list kaise (OPEN_QUESTIONS §2); Render Key Value ke internal URL pe auth chalu karna (jaancha: default band, chalu ho sakta hai).
- Secrets ki table (Batch 4) ki jaanch, break-glass command ka design, backup ki key ka bachav.
- Data leak me "pata chalna" aur "pakka" ki paribhasha, aur public repo me kamzori ki report kaise aaye (Security Contact, D-253).
- GitHub repo ka push protection aur Secret Protection ki uplabdhi (jaanchna baaki).

## Change log

| Version | Date       | Badlav                                                                                                                 |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-21 | Pehla run: 4 owner ke sawal, 11 batches, 12 prastaavit risks, 10 tathya ki jaanch, 15 lene layak, 11 dhyaan ke points. |
