# LESSONS: Beautinique

> **Status:** v1.1.9 (2026-11-27). Sabak aur traps: kya hua, kyun hua, ab kya karte hain. Faisle yahan nahi, [DECISIONS.md](DECISIONS.md) me. Cheezein ek-ek karke judengi.

## Is file me kya aayega

Har sabak: **Kya hua**, **Kyun**, **Ab kya karte hain**, **Kab** (date).

## 1. Git

### Nayi branch ka upstream `prerelease` (2026-11-23)

- **Kya hua:** `01-foundation` ST-8 ka commit (`19be6c2`, lagbhag 30 files) PR ke bina seedha `prerelease` pe push ho gaya. CI green raha, par PR aur uska "kaise jaancha" nahi bana.
- **Kyun:** branch `git switch -c <branch> origin/prerelease` se bani thi. Remote branch se bani nayi branch use apna upstream maan leti hai, to saada `git push` (ya VS Code ka Sync) kaam ko seedha `origin/prerelease` pe bhej deta hai.
- **Ab kya karte hain:** nayi branch hamesha `git switch -c <branch> --no-track origin/prerelease` se (hotfix: `--no-track origin/release`), aur push `/push` se, jo upstream na ho ya kisi aur branch ke naam ka ho to usi naam ki remote branch banata hai ([GIT_SKILLS.md](GIT_SKILLS.md) §4, `.claude/skills/_shared/git-rules.md` §3).

## 2. Secondary laptop

### Ubuntu Server ka install, aur dobara karna pade to (2026-11-25)

- **Kya hua:** secondary (HP 15-ay503TX, Windows 10 ke saath dual boot) pe Ubuntu Server ka install kai baar atka: 24.04.5 legacy GRUB pe "Welcome to GRUB!" pe ruka; bina network ke "configuring apt" pe ghanton; aur baar-baar Enter dabane se screens skip hokar seedha "Installing system" pe chala gaya.
- **Kyun:** purani GRUB legacy/BIOS boot me nahi chali (26.04.1 chali); installer apt ke liye network maangta hai; har screen ek Enter maanti hai, to dobara Enter agli screens ko bina padhe daba deta hai. Aur us disk pe Windows aur owner ka purana data bhi hai, jo galat storage choice se mit sakta tha.
- **Ab kya karte hain:** Ubuntu Server **26.04.1 LTS**. Rufus me **ISO Image mode**, partition scheme **MBR**, target **BIOS (or UEFI-CSM)**, aur "Grub 2.14 vs 2.16, Download required" pe **Yes**. Boot menu me **non-UEFI USB** wali entry chuno (UEFI wali GRUB menu me atak sakti hai); Esc aur F9 tabhi chalte hain jab keyboard laga ho. Install ke waqt **network** (Wi-Fi ya cable) ho. Har screen pe **ek hi baar Enter**. Storage me **kabhi "Use an entire disk" nahi**, sirf **"Custom storage layout"**: sirf partition 3 (302.7 GB, `Ubuntu Disk`, pehle D:) `ext4` aur mount `/`, disk `sda` "Use As Boot Device"; partition 1, 2 aur 4 ko haath nahi (D-463). Koi screen samajh na aaye, ya kisi aur partition pe "format" dikhe, to wahin ruko. Windows GRUB menu me tab dikhta hai jab `os-prober` chalu ho: `update-grub` ke output me "Found Windows 10" dekho. Poora purana kadam-ba-kadam text git me hai.
- **Kab:** 2026-11-25.

### Internal keyboard ki atki key: `unbind` tikta nahi, `i8042.nokbd` chalta hai (2026-11-25)

- **Kya hua:** secondary ke laptop keyboard ki ek key atki thi: console pe har key ke aage `^[` (Esc ya Alt jaisa) aata tha, external keyboard se bhi, aur login nahi ho raha tha. `echo -n serio0 | sudo tee /sys/bus/serio/drivers/atkbd/unbind` se keyboard hata, par thodi der baad `atkbd` dobara lag gaya.
- **Kyun:** andaza (pakka nahi): atki key lagataar data bhejti hai, aur kernel bina driver wale keyboard port pe data dekhkar driver dobara laga deta hai. `atkbd` ke `bind_mode` ko `manual` karne ka tareeka bataya gaya tha, par uska nateeja dekha nahi. GRUB ke menu ke waqt kernel hota hi nahi, isliye wahan wo key phir bhi dikhti hai.
- **Ab kya karte hain:** `/etc/default/grub` me `GRUB_CMDLINE_LINUX="i8042.nokbd"`, phir `sudo update-grub` aur reboot: internal keyboard ka port banta hi nahi, aur USB keyboard (`usbhid`) chalta rehta hai. Jaanch: `cat /proc/cmdline` me `i8042.nokbd`, aur `grep -c 'AT Translated Set 2 keyboard' /proc/bus/input/devices` me `0`. Console pe type hi na ho paye to GRUB ke menu me Ubuntu wali entry pe `e`, `linux` wali line ke aakhir me `i8042.nokbd` jodo aur `Ctrl+X` (sirf us boot ke liye; maine ye is laptop pe test nahi dekha). Pakka ilaaj hardware: keyboard ka cable hatana ya keyboard badalna.
- **Kab:** 2026-11-25.

## 3. SSH aur terminal

### Git Bash me ssh passphrase maangta hai (2026-11-25)

- **Kya hua:** VS Code ke Git Bash terminal me `npm run infra:status` Docker ke check pe atka aur "Git for Windows" ka dialog "Enter passphrase for key '/c/Users/<aap>/.ssh/id_ed25519'" aaya, jabki Windows ke ssh-agent me key thi (service `Running`, `Automatic`).
- **Kyun:** Git Bash me PATH me Git ka apna `ssh` (`C:\Program Files\Git\usr\bin\ssh.exe`) Windows ke `ssh.exe` se pehle aata hai. Wo Windows ke agent ko nahi dekhta, to key ke liye passphrase maangta hai; background tunnel ke liye wo dialog kaam bhi nahi karta. Docker context aur `infra:up` ka tunnel dono `ssh` PATH se lete hain. BatchMode me Windows ka `ssh.exe` seedha `bq-infra` likh ke aaya, Git ka `Permission denied (publickey)`.
- **Ab kya karte hain:** code me theek kiya: `scripts/foundation/src/ssh.ts` Windows par docker aur tunnel ke har child process me Windows ka OpenSSH PATH me sabse pehle rakhta hai, to `npm run infra:*` aur `dev-data:*` kisi bhi terminal se chalte hain. Haath se type kiye `ssh` aur `docker` ke liye `C:\Users\<aap>\.bash_profile` me `export PATH="/c/Windows/System32/OpenSSH:$PATH"` (aur `~/.bashrc` load karne ki line), optional. Dialog aaye to **Cancel**, passphrase wahan nahi ([OPERATIONS.md](OPERATIONS.md) §1 niyam 16 (3)).
- **Kab:** 2026-11-25.

### Windows me child process ke env me PATH ka naam (2026-11-25)

- **Kya hua:** koi failure nahi dekha; `ssh.ts` likhte waqt pakda gaya. Windows ke `process.env` me PATH ka naam `Path` hota hai.
- **Kyun:** Windows ka environment case-insensitive hai, par `{ ...process.env }` ki copy ek saada JavaScript object hai, jisme keys case-sensitive hain. Copy me `PATH` set karne se ya `env.PATH` padhne se `Path` chhoot jaata hai, aur child ko do PATH ya galat PATH milta hai.
- **Ab kya karte hain:** key ko bina case ka khayal kiye dhundo (`keyOf`), usi naam se likho, aur sirf tab `Path` banao jab koi PATH ho hi nahi. `scripts/foundation/test/ssh.test.ts` me `Path`, `PATH` aur `pAtH` ke test hain.
- **Kab:** 2026-11-25.

### PowerShell me `npm run <script> -- --flag` ka `--` kho jaata hai (2026-11-25)

- **Kya hua:** primary laptop ke PowerShell me `npm run packages:create -- --category shared --name clock ...` chalane pe `npm error code EUNKNOWNCONFIG`, "Unknown cli flag: --category", aur pehle "`shared` is being parsed as a normal command line argument" ki chetavni aayi. Wahi command `npm.cmd run packages:create -- --category ...` se chali.
- **Kyun:** PowerShell me `npm` asal me `npm.ps1` script hai, aur PowerShell script ko diye arguments me pehla `--` khud kha leta hai. npm ko `--` milta hi nahi, to uske aage ke flags npm ke apne flags maane jaate hain. Git Bash me `npm` seedha chalta hai, wahan ye nahi hota.
- **Ab kya karte hain:** PowerShell me flags wali command `npm.cmd run <script> -- ...` se; Git Bash me jaise hai waise. README ki commands waise hi rehti hain (wo shell-neutral likhi hain).
- **Kab:** 2026-11-25.

## 4. CI aur secret scan

### Secret scan poori history dekhta hai, nakli value ko bhi (2026-11-26)

- **Kya hua:** ST-4 ke PR #112 me `guard` job (gitleaks) fail hua, "leaks found: 2", aur `check` job uske saath. Dono findings tests ke nakli literals the: `token: 'tok-...'` (logger ka redaction test) aur `const secret = 'sk-live-...'` (config ka test jo dekhta hai ki message me value nahi aati). Wahi value jo test isliye banata hai ki wo kahin dikhe nahi.
- **Kyun:** gitleaks ka `generic-api-key` rule naam (`token`, `secret`, `key`) ke saath bandha ek lamba, alag-alag akshar wala literal dekhta hai, aur CI scan har us commit pe chalta hai jo tested commit se pahunch me hai (`--log-opts="--full-history HEAD"`), sirf aakhri files pe nahi. Isliye baad ke commit me value badalne se pehle commit ka finding nahi jaata. Guard ke jo steps scan ke baad hain (branch flow, audit) fail ke baad chalte hi nahi, to ek finding unhe bhi chhupa deta hai.
- **Ab kya karte hain:** (1) push se pehle wahi scan locally, jo CI chalata hai: `npm run secrets:scan` (gitleaks 8.30.1, `.gitleaks.toml` ke saath, poori history); sirf commit ke baad, kyunki scan commits dekhta hai. (2) Test me token ya key jaisi value literal nahi, run time pe bane, jaise `'tok-'.concat('z'.repeat(12))`. (3) Finding commit me aa chuki ho to force push ke bina uska fingerprint reason ke saath `.gitleaksignore` me (commit:file:rule:line, kabhi poora path nahi); wahi purani entries ka tareeka hai. Force push sirf owner ki haan se.
- **Kab:** 2026-11-26.

## 5. Server aur tests

### Router ka `express.json()` har request ka body padh leta hai (2026-11-26)

- **Kya hua:** `kit.router` me `router.use(express.json())` tha; usi app me facade ka `/internal/...` route signature ke liye body ke asli bytes chahta hai (`express.raw`), par body pehle hi padh liya gaya tha, to har signed call 401 hui.
- **Kyun:** `router.use` us router ke saath mount hui har request pe chalta hai, sirf us router ke routes pe nahi; body ek hi baar padhi jaati hai.
- **Ab kya karte hain:** body parser sirf us route pe jiske contract me `body` hai (`router.post(path, parser, handler)`), router pe `use` nahi. Test: ek hi app me JSON route aur raw-body route saath chalein.
- **Kab:** 2026-11-26 (ST-5).

### Error body me `details: undefined` JSON me gayab, aur client use "INTERNAL" padhta hai (2026-11-26)

- **Kya hua:** server ne `{ error: { ..., details: undefined } }` bheja; JSON me `details` key hi nahi hoti, aur contracts ka `errorBodySchema` (`details: unknown()`) zod 4 me missing key ko refuse karta hai, to `ApiError` ka code `INTERNAL` ho gaya aur asli code (`NOT_FOUND`) kho gaya.
- **Ab kya karte hain:** `errorBody` me `details` hamesha (`null` jab kuch nahi). Error body ka test sirf object pe nahi, `JSON.parse(JSON.stringify(body))` pe bhi `errorBodySchema` se; aur server ka jawab client ke saath asli HTTP pe (`express.test.ts`).
- **Kab:** 2026-11-26 (ST-5).

### Query me ek hi item ki list text hoti hai, aur test helper ka default `undefined` nigal leta hai (2026-11-26)

- **Kya hua:** client `ids=7` bhejta hai (ek item ki list), Express use text deta hai, aur schema `array` maangta hai: server ne 400 diya; 3 items ke test me ye chhup gaya tha. Aur: test helper `place(body, key = 'k')` ko `undefined` do to default lag jaata hai, to "key ke bina" ka test asal me key ke saath chala.
- **Ab kya karte hain:** server text ko schema ke hisaab se padhta hai (number, boolean, date, list, aur list ke items; `decodeText`). Round-trip test chhote aur ek-item wale input pe bhi. Test helper me "kuch nahi" ke liye `null`, `undefined` nahi.
- **Kab:** 2026-11-26 (ST-5).

### `packages:verify` me kai packages ke int tests ek saath, aur HDD pe majority write 2 second ke paar (2026-11-27)

- **Kya hua:** secondary pe `packages:verify -- backend-crypto` teen baar aur `-- backend-events` ek baar fail hua: kisi dependency ke int test me `MongoWriteConcernError: operation exceeded time limit` (lease ki write), jabki wahi package akela green tha.
- **Kyun:** `--filter=<pkg>...` package ke saath uski dependencies bhi chunta hai, aur turbo unke `test` ek saath chalata hai; har test file apna database, collections aur indexes banati aur hatati hai. Har write `w: majority` aur `maxTimeMS` 2 second pe hai, aur majority (journal) ka intezaar isi samay me ginta hai; HDD pe ek saath ke in kaamon se wo intezaar badhta hai. Pass hone wale parallel run me bhi sabse bada intezaar 1151 ms tha (mongod ka slow-op log), yaani margin chhota aur fail load pe tika.
- **Ab kya karte hain:** `packages:verify` me tests ek package ek waqt me (`turbo run test --concurrency=1`); usi jaanch me sabse bada intezaar 846 ms. Aisi error pe pehle mongod ke slow-op log me `waitForWriteConcernDurationMillis` dekho. Test ke liye `maxTimeMS` badhana ilaaj nahi: live ki seema wahi rehni chahiye.
- **Kab:** 2026-11-27.

## Change log

| Version          | Date       | Badlav                                                                                                                                                                                                                                                                                                                                  |
| ---------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0           | 2026-11-17 | Khaali file bani.                                                                                                                                                                                                                                                                                                                       |
| v1.1.1           | 2026-11-23 | Pehla sabak: nayi branch ka upstream `prerelease` (`--no-track`).                                                                                                                                                                                                                                                                       |
| v1.1.2           | 2026-11-25 | §2: secondary pe Ubuntu Server ke install ke sabak (Rufus, GRUB, network, Enter, partition 3).                                                                                                                                                                                                                                          |
| v1.1.3 se v1.1.6 | 2026-11-25 | §3: Git Bash me ssh passphrase maangta hai; code me theek (`ssh.ts`), `.bash_profile` optional; Windows me child process ke env me PATH ke naam ka sabak. §2: internal keyboard ki atki key, `unbind` tikta nahi, `i8042.nokbd` chalta hai. §3: PowerShell me `npm run <script> -- --flag` ka `--` kho jaata hai, `npm.cmd` chalta hai. |
| v1.1.7 se v1.1.8 | 2026-11-26 | §4: secret scan poori history dekhta hai, nakli value ko bhi; test me token jaisi value run time pe, aur push se pehle `npm run secrets:scan`. §5: server aur tests: router ka `express.json()` har body padhta hai; error body ka `details`; ek item ki list.                                                                          |
| v1.1.9           | 2026-11-27 | §5: `packages:verify` me kai packages ke int tests ek saath HDD pe majority write ko 2 second paar kara dete the; ab tests ek package ek waqt me.                                                                                                                                                                                       |