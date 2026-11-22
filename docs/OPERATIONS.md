# OPERATIONS: Beautinique

> **Status:** v1.1.11 (2026-11-22). System chalane ka manual. Cheezein ek-ek karke judengi.

## Is file me kya aayega

- Environments (laptop, live) aur kahan kya chalta hai.
- Deploy aur release steps.
- Backup aur restore.
- Server jagana.
- Env settings: sirf naam aur kaam, value kabhi nahi.
- Monitoring, alerts aur incident ke waqt kya karna hai.

## Kaise padhein

DevOps / SRE Architect ki raay se (D-257 ka kram), owner ki haan ke baad (D-326 se D-336). "Misaal" wale numbers settings me ya code ke saath pakke honge. "Jaancha 2026-11-21" wale tathya DevOps / SRE agent ne providers ke docs se jaanche; main session ne source dobara nahi khole, aur providers ki free sharten badal sakti hain (§9 niyam 4).

## 1. Environments aur laptop ka setup (D-326)

1. Teen jagah hain: **laptop** (development, split mode: har service alag process), **CI** (GitHub Actions, laptop wale hi containers) aur **live** (Render ki ek free web service me bundle mode, Render Key Value, har service ka Atlas cluster, finance ka Neon, aur 11 apps ke Vercel projects). Koi staging ya preview environment nahi; release ki poori jaanch laptop pe hoti hai.
2. Laptop ka infra `infra/` ki ek compose file me: MongoDB replica set (transactions ke liye), search ke tests ke liye MongoDB ka local Atlas container (D-422), Valkey, PostgreSQL, finance tests ke liye PgBouncer (transaction mode, D-425) aur ek local email inbox. Har image exact version pe pinned. Ports sirf `127.0.0.1` pe.
3. Laptop ke version live se milte hain: MongoDB wahi major jo Atlas ke free cluster pe (abhi 8.0), patch version tak pin, 8.0.30 ya upar (Linux kernel 6.19 se 7.0.13 pe purane 8.0 crash karte ya band hote hain; laptop ka WSL kernel abhi 6.18.58, D-425), PostgreSQL wahi major jo Neon project me, aur Valkey me Render jaisi chhoti memory seema (25 MB) aur policy `noeviction` (BullMQ ki shart, D-425).
4. Sirf us kaam ke containers chalu jo abhi chahiye (compose profiles). **Misaal:** backend tests pe `mongo` aur `valkey`; search ke tests pe `atlas-local` bhi (kam se kam 2 GB khaali RAM); finance ka kaam ho to `postgres` bhi; email dekhna ho to `mail` bhi. Kaam khatam to `infra:down`.
5. Mutation testing ke liye alag containers alag ports pe, aur asli files ki copy me; development wale containers aur files kabhi nahi.
6. Laptop pe har service ka alag database aur alag DB user (live jaisa), ek hi local MongoDB server me.
7. Laptop, tests aur CI kabhi live databases ya live Redis se nahi judte. Live databases tak laptop ki pahunch sirf teen commands ko: backup, restore ka abhyaas aur break-glass, apne alag credentials se.
8. Laptop pe asli provider keys ki zaroorat nahi: email local inbox me, payment, push, media aur social sign-in ke fake adapters. Kisi provider ka asli test-mode kaam karna ho tabhi uski test key, sirf us din.
9. Har deployable ki `.env.example` git me, teen hisson me: **LOCAL** (laptop ki public values), **OPTIONAL** (default wali settings, commented), **PRODUCTION** (sirf naam aur `<...>` jaisi dummy value). Laptop ki `.env` me sirf LOCAL hissa. CI ka test pakka kare ki har service ke config schema ki har key `.env.example` me hai, aur `.env.example` me koi anjaan key nahi.
10. Naye laptop ka setup ek command se: Node aur npm ke version ki jaanch, `npm ci`, `.env` banana (LOCAL hisse se), `infra:up`, seed. **Misaal:** `npm run setup`. Commands ki asli list code ke saath yahan judegi.

## 2. CI aur branch ke pehre (D-327)

1. CI GitHub Actions pe; public repo pe standard runners muft (jaancha 2026-11-21). Jobs ek saath chalti hain, aur sirf aakhri `check` job baaki sabka nateeja jodti hai. Branch ke rules aur deploy sirf `check` ko dekhte hain, isliye uska naam nahi badalta.
2. Koi job `needs` se doosri ka intezaar nahi karti (sirf `check`): Render "After CI checks pass" tab deploy karta hai jab commit ke saare dikhte checks pass hon, aur ek bhi check na dikhe to deploy nahi karta (jaancha 2026-11-21).
3. Har run pe `guard`: poori git history ka secret scan (scanner ka binary version aur checksum se pinned, finding ka secret log me chhupa), branch flow ki jaanch (`prerelease` me feature branches, `release` me sirf `prerelease` ya `hotfix/*`, `main` me sirf `release`; sab isi repo ki branches se, fork se nahi), aur `npm audit` (high aur critical pe laal).
4. Branch flow ki jaanch galti se bachati hai, hamle se nahi: PR apna workflow khud badal sakta hai. Asli taala branch ke rulesets aur merge ka haq hai.
5. Static: Prettier, ESLint (service ki deewar aur config namespace ke lint, SR-071), typecheck, build. Docs badle to docs ke paths ka check (D-019).
6. Tests asli MongoDB replica set, Valkey aur PostgreSQL containers pe; E2E Playwright Chromium pe, aur nightly me WebKit pe Customer app ke mukhya flows (D-374). Testing ke poore niyam [RULES.md](RULES.md) §4 me. Saath me repo ke pehre: backup folder ki koi file git me na ho (D-013), koi `.env` file git me na ho, har collection ki retention class (R-040), har repository query ka `explain` aur collection scan ka pehra, services ke beech dependency rule, aur migrations ka test (naya code purane data pe, purana code naye data pe; R-041).
7. Supply chain: har action commit SHA pe pinned; workflow ka default `permissions: {}`, har job ko sirf zaroori haq; fork PRs ko koi secret nahi; `pull_request_target` nahi; `npm ci` lockfile se (SR-082).
8. CI me koi production secret ya deploy key nahi. Render aur Vercel apne Git integration se deploy karte hain, sirf `release` se (SR-081). Packages ke tests kabhi asli npm registry ko nahi chhoote (fake registry).
9. E2E fail ho to traces ek artifact me, chhoti umar (misaal 7 din), bina personal data; backup files kabhi artifact nahi (SR-083).
10. Rulesets: `release` aur `main` pe seedha push, force push aur delete band, `check` zaroori; `prerelease` pe force push aur delete band (chhote fix ka seedha push CLAUDE.md ke niyam se).
11. `release` aur `main` pe `push` trigger rehta hai, kyunki Render aur Vercel merge commit ke checks dekhte hain.
12. **Baad me:** jab ek poora run misaal 15 minute se upar jaaye, tab PR pe sirf badle hisson ke tests, aur jo git tree pehle poora pass ho chuka uska nishaan (artifact) dekh ke dobara poora run nahi. Tab tak har run poora.

## 3. Release, deploy, migrations aur rollback (D-328)

1. Release ka kram: (1) `prerelease` pe laptop pe poora E2E aur bundle mode ka chhota naap 512 MB pe; (2) backup (§6); (3) PR `prerelease` → `release`, `check` green; (4) Render aur Vercel apne aap deploy; (5) live pe smoke check (niyam 9); (6) release safal to PR `release` → `main` (jab tak `main` hai, D-024); (7) `release` pe koi commit bana to back-merge `release` → `prerelease`.
2. Render ki settings: auto-deploy "After CI checks pass", build filter sirf backend aur saajhe packages ke paths aur lockfile pe, region Singapore, health check path `/health`, start command seedha `node` (npm ke through nahi: memory bachti hai aur Render ka SIGTERM seedha app ko milta hai), flags `--max-old-space-size` misaal 256 aur `UV_THREADPOOL_SIZE` misaal 2.
3. Vercel: har app ka apna project, production branch `release`, preview deployments band, "kuch nahi badla to deploy chhodo" wali setting chalu, aur deploy `check` ka intezaar kare. Hobby pe din ke 100 deploys aur ek waqt me ek build (jaancha 2026-11-21): ek release me 11 apps ek-ek karke build hote hain.
4. Deploy ke waqt purana instance traffic leta rehta hai; naya uthne pe traffic badalta hai, purane ko 60 second baad SIGTERM, aur default 30 second baad SIGKILL (jaancha 2026-11-21). Isliye SIGTERM pe: naye requests band, chalte requests poore, ticker aur dispatcher ki lease chhodna, queue workers band, DB clients band, sab misaal 25 second me.
5. Release step ([ARCHITECTURE.md](ARCHITECTURE.md) §10.4 niyam 1) ka schema wala hissa (collections, validators, indexes) listen se pehle; lambi data migration listen ke baad background me lease ke saath, taaki naya instance health check aur cold start ki seema me uthe.
6. Expand aur contract: contract wala release tabhi jab expand wala release live pe misaal 7 din chal chuka ho aur rollback ki zaroorat na dikhi ho. Release ke note me "contract baaki" ki list.
7. Rollback sirf ek release peeche: Render pichhle do deploys tak hi wapas ja sakta hai (jaancha 2026-11-21), aur expand aur contract ki wajah se sirf pichhla release naye data ke saath surakshit hai. Usse peeche kabhi nahi; aage ka fix (roll-forward).
8. Rollback ka kram: (1) Render pe pichhla deploy wapas (dashboard ka rollback auto-deploy band kar deta hai; (3) ka revert merge hone ke baad auto-deploy wapas chalu, D-425); (2) jis app me gadbad, uska Vercel pe pichhla production deploy wapas; (3) git me revert normal flow se; (4) galat likha data ek naye idempotent migration se theek, restore sirf jab data kho gaya ho. Finance ki SQL migrations sirf aage: unka rollback bhi naya migration.
9. Live smoke check (misaal 10 minute): `/health` aur `/ready`, ek public product page, allowlist ke ek account se sign-in, ek test-mode order shuru se payment tak (phir pack se pehle cancel aur "smoke" ka nishaan, D-380), aur ops inbox me nayi errors. Saath me security ki live jaanch: har app ke headers aur CSP live pe (SR-005); Render ke host pe bina secret `/api` pe 403 (SR-002); jhootha `X-Forwarded-For` ka asar nahi (SR-003); ek personal route do alag sessions se, CDN se cache nahi (SR-004); har app ka `security.txt` (SR-103). Nateeja §12 ki table me (D-404). Kuch fail ho to niyam 8.
10. Hotfix: `release` se `hotfix/<naam>` → PR `release`; phir back-merge `release` → `prerelease`. Security fix bhi isi raaste se, ek hi baithak me, saade naam aur text ke saath (SR-103).
11. Har app ka kam se kam version setting me ([ARCHITECTURE.md](ARCHITECTURE.md) §5 niyam 5): API me tootne wala badlav aaye to pehle naya version path, phir apps, aur aakhir me kam se kam version badhana.
12. Har release ka chhota note PR ke description me: kya badla, migrations, "contract baaki", rollback surakshit hai ya nahi. Tag aur release notes sirf owner ke kehne pe; kahin koi AI attribution nahi.

## 4. Secrets aur config (D-329)

1. Yahan secrets ki ek table banegi: naam, kaam, kahan rehta hai, kaun si service padhti hai, aakhri badlav ki tareekh, badalne ka kram. Value kabhi nahi.
2. Secrets ki list (misaal, code ke saath pakki): har Atlas cluster ka app user, release user aur read-only backup user; Neon ke app, migration aur backup roles; Redis ka internal URL; apps se gateway ka secret header; token sign karne wali keys; field encryption ki keys; payment gateway ki key aur webhook secret; email provider ki API key; push ki private key; teen social sign-in apps ke secrets; media provider ki key; backup encryption key; break-glass ka credential; logs cluster ke users; band data ki public key (secret nahi, par list me; D-399); map ki browser key (public, apps ke exact hosts ki whitelist ke saath, SR-091) aur server ka map client (agar ho).
3. Kahan: backend ke secrets Render ke env me; apps ke liye sirf wo jo build ya rewrite ko chahiye, Vercel ke Sensitive env me; app ke bundle me kabhi koi secret nahi. Backup ki key, recovery codes aur band data ki private key (D-399, SR-097) sirf password manager me, aur band data ki private key ki ek doosri offline copy bhi; kisi provider ke env me nahi.
4. Test aur live keys naam se alag pehchaan me. Jab tak payments test mode me hain, boot pe jaanch: payment key test wali na ho to process shuru hi na ho.
5. Har service ka config zod schema se, apne namespace me; boot pe koi key kam ya anjaan ho to process key ke naam ke saath (value ke bina) ruk jaaye.
6. Badlav do values ke saath, bina downtime: (1) nayi value "agli" ki tarah jodo, deploy; (2) provider ya bhejne wale ko nayi pe badlo; (3) purani hatao, deploy. **Misaal:** apps ka secret header: gateway dono values maane, phir Vercel me nayi, phir gateway se purani hate.
7. Render me env badalne ke baad naya deploy zaroori; sirf restart naya env nahi uthata (jaancha 2026-11-21).
8. Kab: shak ya incident pe turant (gambhirta 1 pe misaal 1 ghante me, 2 pe 1 din); baaki saal me ek baar, tay mahine me (misaal April), ops inbox me yaad ke saath; signing keys apne aap.
9. Providers ke accounts pe MFA, recovery codes offline, tokens kam haq aur kam umar ke, production dashboards ek alag browser profile me.
10. Settings (thresholds, allowlist, kill switches, emails ki chhat) maalik service ke DB me aur Master app se badalti hain, bina deploy; env me sirf boot ka config aur secrets.
11. Nayi env key Render ya Vercel me tabhi daali jaaye jab code use padhta ho, kyunki niyam 5 anjaan key pe boot rok deta hai; PR ke note me nayi keys ke naam aur value kahan se aayegi, aur dashboard me daalna owner ka kaam (D-430).

## 5. Soya server, jagana aur samay wale kaam (D-330)

1. Render ki free service 15 minute bina traffic ke so jaati hai, uthne me lagbhag 1 minute, aur workspace ko mahine ke 750 ghante (jaancha 2026-11-21). Soi service ghante nahi khaati.
2. Jagane ke raaste: (1) app khulte hi `/wake` seedha Render pe; (2) cron-job.org tay samay pe; (3) UptimeRobot ka monitor; (4) GitHub Actions ka schedule sirf backup ke roop me, kyunki wo bheed me late hota hai, kabhi chhoot jaata hai, sirf default branch pe chalta hai, aur public repo me 60 din koi activity na ho to band ho jaata hai (jaancha 2026-11-21).
3. Pinger sirf `/wake` ya `/health` bulaate hain: DB tak nahi, finance tak kabhi nahi; jawab me version nahi.
4. Jagane ki khidki (D-322): ghante me ek baar, 09:00 se 22:00 IST (din me 14 baar); raat ko server soya. Ise badalna owner ka faisla hai.
5. cron-job.org 30 second me jawab na mile to fail maanta hai aur lagataar 25 se zyada fail pe job band kar deta hai, to har jagane ke samay do jobs: :00 pe jagana (fail ho sakta hai), :03 pe jaanchna (jaage server pe safal), taaki lagataar fail ki ginti tootti rahe (D-424). UptimeRobot ka check pehle pinger ke kuch minute baad pade (misaal :10), taaki jaage server ko dekhe aur har ghante jhootha "down" na bane.
6. GitHub ka scheduled workflow `permissions: {}` ke saath, aur andar IST ki khidki ki jaanch: late shuru hua run khidki ke bahar server nahi jagata. Hafte ki jaanch (§9) me dekhna ki workflow band to nahi hua.
7. Har jaag pe: boot ke misaal 30 second baad poora sweep, dispatcher har Atlas cluster se judta hai, aur roz ke kaam "aakhri poora din" se chhoote din kram se banate hain. Khidki ka pehla pinger 09:00 IST pe, taaki sellers aur staff ka din ka saar subah bane.
8. Cold start ka target 90 second tak. Vercel ka bahar ke rewrite ka timeout 120 second (jaancha 2026-11-21), isliye app pehle `/wake` ka jawab leti hai; beech me server so gaya ho aur rewrite 502 ya 504 de to client dobara wake ka parda dikhata hai.
9. Ghanton ka hisaab: 14 jaag × ~16 minute ≈ 115 ghante/mahina, upar se asli use. 525 ghante (70%) pe owner ka kaam.
10. Render Key Value free restart pe khaali hota hai, aur Render use kabhi bhi restart kar sakta hai (jaancha 2026-11-21): ticker "pending par queue me nahi" wale kaam dobara daalta hai.
11. Render ki taraf se keep-alive pe chetavni aaye to bahar ke pinger turant band; system app ke `/wake` aur DB ke timers pe bina code change chalta rahe.
12. Lamba break (misaal 3 hafte se zyada) ho to bhi pinger chalu rahein. Atlas ka free cluster 30 din bina connection ke apne aap ruk jaata hai (jaancha 2026-11-21): resume ka kram har cluster ke project me "Resume", phir `/ready` dekhna.
13. App ki background ping (D-349): jaagne ke baad app use hote tak har misaal 10 minute `/wake`; ping ka interval aur on/off Master ki setting se. Render ki keep-alive pe chetavni aaye to (niyam 11) ye bhi band.

## 6. Backup aur restore (D-331)

1. Backup me: saare Atlas clusters (Extended JSON, har collection ek file), Neon (`pg_dump` custom format, read-only backup role, usi major version ke container se) aur band FY ki export files (D-309). Backup me nahi: media provider ki files (D-303: product images seller se dobara; daawe aur saboot ki files apne samay pe waise bhi mitti hain), Redis (cache aur queue, dobara banta hai), aur providers ke logs. Private files (KYC, daawe, saboot, kanooni rok) ka kho jaana personal data breach maana jaata hai (§8 niyam 3); kanooni rok wali files ka bachav object storage ke lock se (D-439).
2. Providers ke apne backup pe bharosa nahi: Atlas ke free cluster pe backup nahi milta, aur Neon free me sirf 6 ghante ka instant restore aur ek manual snapshot (jaancha 2026-11-21). Neon ka 6 ghante ka restore sirf "abhi hui galti" ke liye.
3. Kab (D-323): har release se pehle (har contract wale release se pehle zaroor), aur hafte me ek baar (misaal Sunday). Aakhri backup 8 din se purana ho to hafte ki jaanch (§9) me laal nishaan.
4. Kahan: repo ke andar git se bahar wala folder, chaar pehron ke saath (D-013); encrypted; laptop pe aakhri 3; kabhi CI artifact ya cloud sync wale folder me nahi.
5. Har backup ke saath ek manifest: samay (UTC), git commit, har collection ki ginti aur hash, schema ka fingerprint, encrypted file ka hash. Encrypted fields backup me bhi encrypted; keys backup me kabhi nahi.
6. Transfer ki seema: Atlas ka har free cluster 7 din me 10 GB bahar, aur Neon ka project mahine me 5 GB public transfer (jaancha 2026-11-21). Backup command har cluster ka size bataye; ek hafte me ek se zyada poora backup na ho jab tak zaroorat na ho.
7. Backup laptop se seedha databases pe chalta hai, Render ko nahi jagata. M0 ke 100 ops/second ki wajah se bade batch aur ruk-ruk ke padhna. Atlas ki IP list me laptop ka IP sirf backup ya laptop ke release command ([ARCHITECTURE.md](ARCHITECTURE.md) §10.4 niyam 5) ke waqt judta hai aur kaam ke baad hatta hai; list me baaki sirf Render Singapore ke outbound ranges (D-421).
8. Restore pehle laptop ya alag test database me: ginti aur hash ka milaan, audit chain ka verify, finance ke journal ka barabar hona, aur ek E2E smoke. Iske baad hi production me. Har restore audit me.
9. Production restore ka kram: (1) checkout, sign-up aur uploads ke kill switches band; (2) jis cluster ka restore, sirf usi ka; (3) restore ke baad delete hue accounts ki list ke deletes dobara; (4) release step ka fingerprint aur `/ready`; (5) smoke check; (6) switches kholna.
10. Restore ka abhyaas har 3 mahine (misaal) aur har bade schema badlav ke baad: aakhri backup laptop pe restore karke niyam 8 ki jaanch, aur key ka chalna bhi. Nateeja, samay aur tareekh yahan abhyaas wali table me ek line. Pehla abhyaas R1 se pehle. Saal me ek baar band record aur band FY ki export file kholne ka abhyaas bhi (SR-097).
11. RPO aur RTO: RPO = aakhri backup tak (6 ghante ke andar ki finance ki galti Neon ke restore se); RTO misaal 1 din.
12. Backup, restore aur break-glass ke credentials laptop pe alag aur kam haq wale; har chalana audit me.

## 7. Monitoring, health aur alerts (D-332)

1. `/health` sirf process aur event loop (Render ka health check); `/ready` Mongo clusters, Redis, dispatcher aur ticker (finance nahi); `/wake` 204. `/ready` kabhi Render ka health check nahi, warna Redis ya Atlas ki chhoti gadbad pe poora backend restart hota.
2. Alerts ke raaste sirf teen: Master app ka ops inbox, browser push, aur gambhir pe email (din me misaal 5 tak, SR-078).
3. Gambhirta: **1** (turant push + email): audit chain toota ya din gayab, milaan me farak, refresh token ka dobara istemaal, authenticator reset, naya staff grant, bada export, webhook signature ke fail ki baadh, kill switch chala, nagnata wali report aur court ya sarkari order (D-251), owner ke alerts ki push subscription khatam (D-401), RSS 450 MB, cluster ya Neon 85%; **2** (push + inbox): allowlist badla, ek IP se bahut fail, "poori jaankari dekhi" ki ginti seema se upar, RSS 400 MB, 5xx 2% se upar, outbox 60 second se purana, dead letter, Redis 60%, cluster 70%, emails 80%; **3** (roz ka saar). Owner alerts kab dekhta hai: D-324 (§8 niyam 2).
4. Ek hi fingerprint ka alert misaal ek ghante me ek baar; theek hone pe "theek" ki khabar.
5. Hamare apne alerts sirf jaage server pe bante hain. Isliye bahar ke free alerts bhi chalu, jo soye server pe chalte hain: UptimeRobot ke down aur up email; har Atlas project me Logical Size (70% aur 85%), Connections aur Network ke alerts email pe (free cluster pe yahi conditions milti hain, jaancha 2026-11-21); Render, Vercel aur Neon ke usage emails jahan milein (jaanchna baaki).
6. Master app ke ops page pe: aakhri jaag, aakhri sweep, har roz ke kaam ka "aakhri poora din", aakhri backup ki tareekh (haath se darj), aur khule alerts.
7. Vercel ke runtime logs Hobby pe sirf 1 ghanta rehte hain (jaancha 2026-11-21), aur Render ke logs ki umar jaanchna baaki: server ki har zaroori baat apne logs service me; incident me Render ke logs ki turant copy.
8. Apps ki errors rate-limited route se ops inbox tak (D-286); server band ho to ye nahi pahunchti, tab UptimeRobot hi saboot hai.
9. Hafte ki jaanch (§9) me alerts ka "dead man" check: ops inbox me pichhle 7 din ka roz ka saar har din aaya ya nahi, aur owner ke har device pe roz ka test push aaya ya nahi (SR-101).

## 8. Incident ke runbooks (D-333)

1. Har runbook ek hi dhaanche me: pehchaan, gambhirta, turant rokna, jaanch, theek aur wapsi, khabar, seekh. Gambhirta SR-084 ke teen level.
2. Jawab ka samay (D-324): ops inbox din ke tay samay pe (misaal 09:00, 14:00, 20:00 IST); gambhirta 1 ka browser push raat me bhi, aur alert dekhte hi kaam; gambhirta 2 aur 3 subah. CERT-In ke 6 ghante us alert ke samay se gine jaate hain jisne incident pakda; 6 ghante me jitni jaankari ho utni report, baaki baad me (CERT-In FAQ Q30; D-436).
3. **Data leak** (D-248): CERT-In ko incident pata chalne ke 6 ghante me; Board ko bina der shuruaati suchna aur 72 ghante me poori report; users ko breach ka bharosa hote hi, bina der. Data leak ka matlab DPDP s.2(u) ka personal data breach: personal data ka bina haq istemaal, khulna, badalna, mitna, ya uski pahunch kho jaana jo restore se wapas na aaye. Ghadi tab chalti hai jab kisi alert, log ya report se itna bharosa ho ki breach hua hai; poori jaanch ka intezaar nahi. Board aur users ko pehli suchna tab jitna pata ho utni, baad me update; 72 ghante ki report me users ko di gayi suchna ka record bhi (D-436). Users ke email, in-app sandesh aur site ki patti ke draft pehle se taiyar; leak ke emails din ki chhat me OTP ke saath sabse aage.
4. **Secret leak** (repo, logs ya kahin aur): pehle secret badlo, phir jaanch. Public repo me history saaf karna ilaaj nahi: secret ko leak maan ke hi chalo.
5. **Provider account pe kabza** (GitHub, Render, Vercel, Atlas, Neon, payment gateway, email): sessions aur tokens band, MFA dobara, Render ka auto-deploy band, us account ke saare secrets badlo, audit aur git history dekho.
6. **Laptop kho jaaye ya chori ho:** laptop pe jo bhi pahunch thi (DB credentials, GitHub, password manager ka session) sab badlo; backups encrypted hain, key password manager me.
7. **Server band ya baar-baar restart (OOM):** Render ke events aur logs, RSS ke alerts; heavy queue rok; pichhla release wapas (§3).
8. **Free tier khatam** (Render ke ghante ya bandwidth, Neon ke CU-ghante ya transfer, Atlas ki jagah): kya band hota hai aur kab wapas, ye ek table me; finance band ho to checkout ka kill switch, taaki pack pe ruke orders na badhein; apps saaf sandesh dikhayein.
9. **Sarkari order ya gambhir content report** (D-251): content chhupane ke tools ek jagah, Master app se, bina deploy; ghadi aur kiya gaya kaam audit me.
10. **Redis khaali, Atlas cluster ruka, webhook fail, milaan me farak:** har ek ka chhota kram (apne aap recovery ki jaanch, resume, milaan ki report).
11. Seekh: fix live hone ke baad hi [LESSONS.md](LESSONS.md) me ek line, bina personal data aur bina hamle ke tareeke ki detail (repo public hai); naya test; threat model me badlav.
12. Saal me ek baar abhyaas, ek scenario pe (misaal "secret leak"), aur runbook me jo kami mili wo theek.

## 9. Capacity aur free tier ki nigrani (D-334)

1. Hafte ki jaanch (misaal Sunday, 15 minute), providers ke dashboards se: Render (ghante, bandwidth, build minutes, outbound IPs ka Atlas ki IP list se milaan, D-421), Vercel (deploys, usage), har Atlas cluster (jagah, 7 din ka network), Neon (CU-ghante, jagah, public transfer), email provider (din ke emails, bounce), media provider (credits), Redis ki memory (ops snapshot), GitHub (schedule chalu hai, dependency alerts), aakhri backup ki tareekh, UptimeRobot ke incidents.
2. Number ek chhoti table me, git ke bahar (misaal laptop ki git-ignored file); 70% pe owner ka kaam.
3. 70% pe kaam ki misaal: bandwidth pe polling kam aur CDN cache ki jaanch; Render ke ghanton pe jagane ki khidki chhoti; Neon pe batch ka interval; Atlas pe archive aur chunks ki umar.
4. ₹0 ki seema ki table ([ARCHITECTURE.md](ARCHITECTURE.md) §9) har 6 mahine providers ke docs se dobara jaanchi jaaye, tareekh ke saath; providers ki free sharten bina khabar badal sakti hain.
5. Ek hi Render web service aur ek hi Key Value (D-056): koi doosri free web service, test ke liye bhi, kabhi nahi.
6. Vercel pe din ke 100 deploys aur ek waqt me ek build: din me ek ya do release, aur bina badle app ka deploy chhodna.
7. Repo GitHub ke personal account me rahe: Vercel Hobby organization ke repos se nahi judta (jaancha 2026-11-21).

## 10. 512 MB pe memory ka naap (D-335)

1. Naap Docker me: bundle mode, compiled JS, wahi start command aur flags jo Render pe; container ki seema 512 MB memory (swap ke bina) aur kam CPU (misaal `--cpus=0.1`, aur tulna ke liye 0.5).
2. Chaar halat naapni hain: (1) boot ke baad khaali; (2) cold start ka samay; (3) aam load (misaal 5 requests/second, 10 minute); (4) sabse bura pal: 2 password sign-ins, place order ki baadh, ek PDF, aur 50,000 rows ka export aur import ek saath.
3. Har halat me: RSS ka peak aur aam, heap, event loop ki der (p99), p95 samay, aur koi OOM ya 503. Har naap 3 baar.
4. Nateeja yahan naap wali table me: tareekh, commit, number. Aam RSS 400 MB se upar ho to services ko alag karne wala faisla (D-049) dobara khulta hai.
5. Dobara naap: har release jo nayi service ya bhaari dependency jode, aur har 3 mahine.
6. Live pe naap ka milaan: pehle deploy ke baad ops snapshot ka RSS laptop ke naap se milaana; hafte me OOM restarts ki ginti Render ke events se.
7. Naap ka script repo me (`scripts/`), sirf laptop pe chalta hai, live pe kabhi nahi.

## 11. Dependencies aur packages ka publish (D-336)

1. Dependency updates mahine me ek baar apne aap PRs se, `prerelease` pe; minor aur patch ek group me, major alag PR me. Security alert (high ya critical) pe turant.
2. Har naya dependency review ke baad: maintainers aur halchal, install scripts, license, size aur memory (512 MB), aur kya Node ya pehle ka koi package wahi kaam karta hai.
3. Node ka version ek jagah pinned (`engines` aur `devEngines`), Render pe wahi version, Docker images exact version pe.
4. Atlas free cluster ka MongoDB version Atlas khud badhata hai aur maintenance ka samay hum nahi chunte (jaancha 2026-11-21): CI usi major ke taaza patch pe chale, aur Atlas ke upgrade ke email ke baad live pe smoke check.
5. Dependency ke PR pe wahi poora CI; merge owner kare, apne aap nahi.
6. Abhi koi publish nahi (D-325): har package `private: true`, aur CI pakka kare ki koi package bina iske nahi.
7. **Baad me**, publish ka plan bane to: npm pe publish, `npm login` aur `npm logout` aur `npm trust` sirf owner ke haath; workflow sirf `release` se, haath se chalaya; do jobs: ek bina haq ke build, test aur pack kare, doosri sirf bane tarballs utaar ke trusted publishing (OIDC) aur provenance se publish kare; naya package pehli baar owner laptop se publish kare; release ka sandesh `release` branch ka naam bataye, back-merge `release` → `prerelease` likha ho, aur CLI ke tests ke liye local infra chalu ho (D-023 ke teen niyam).
8. Packages ke tests kabhi asli npm registry ko nahi chhoote; fake registry hi.

## 12. Security ke record (D-404)

1. Jin security niyamon ka saboot test nahi, record hai (jaise providers pe MFA, live headers, restore aur band data ka abhyaas, provider ki settings), unka record isi table me (RULES RT-48).
2. Public table me sirf `Pass` ya `Baaki`, tareekh aur release; kami ki detail, screenshots, secrets aur account ki pehchaan sirf private record (D-403) me.
3. Release ke test report (RT-46) me is table ki link; release gate (RG-2) sirf us release ke `Pass` ko ginta hai.
4. Security advisory ke temporary private fork me CI nahi chalta, to security fix ke saare tests laptop pe, merge se pehle; nateeja private record (D-403) me (D-425).

| SR  | Hissa | Kya dekha | Kaise | Nateeja | Private record | Release aur commit | Tareekh (IST) | Role | Agli baar |
| --- | ----- | --------- | ----- | ------- | -------------- | ------------------ | ------------- | ---- | --------- |

## Change log

| Version | Date       | Badlav                                                                                                                                                                                                         |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                                                                                                              |
| v1.1.1  | 2026-11-21 | §1 se §11 aaye (DevOps / SRE ki 11 batches; D-326 se D-336): environments, CI, release aur rollback, secrets, soya server, backup aur restore, alerts, runbooks, capacity, memory ka naap, dependencies.       |
| v1.1.2  | 2026-11-21 | §5 niyam 13: app ki background ping (D-349).                                                                                                                                                                   |
| v1.1.3  | 2026-11-21 | §2 niyam 6 me nightly WebKit (D-374) aur RULES ki link; §3 niyam 9 me smoke order (D-380); D-397.                                                                                                              |
| v1.1.4  | 2026-11-21 | §3 niyam 9 me security ki live jaanch (security review batch 1, D-408).                                                                                                                                        |
| v1.1.5  | 2026-11-22 | §7 niyam 3 me gambhirta ki poori list (security review batch 4, D-411).                                                                                                                                        |
| v1.1.6  | 2026-11-22 | §4 niyam 2 aur 3 me band data aur map ki keys, §6 niyam 10 me saal ka abhyaas (security review batch 5, D-412).                                                                                                |
| v1.1.7  | 2026-11-22 | §7 niyam 9 me roz ka test push (security review batch 6, D-413).                                                                                                                                               |
| v1.1.8  | 2026-11-22 | §3 niyam 9 aur 10, naya §12 Security ke record (security review batch 7, D-414).                                                                                                                               |
| v1.1.9  | 2026-11-22 | §1 local Atlas container, PgBouncer, MongoDB 8.0.30 ka pin aur Valkey `noeviction`; §3 rollback ke baad auto-deploy; §5 do ping (D-424); §6 aur §9 Atlas ki IP list (D-421); §12 niyam 4 private fork (D-425). |
| v1.1.10 | 2026-11-22 | §4 niyam 11: nayi env key tabhi jab code padhe (D-430).                                                                                                                                                        |
| v1.1.11 | 2026-11-22 | §6 niyam 1 private files ka kho jaana breach (D-439); §8 niyam 2 CERT-In ki ghadi aur niyam 3 breach ki paribhasha (D-436).                                                                                    |
