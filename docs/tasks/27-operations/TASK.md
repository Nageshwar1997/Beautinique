# TASK 27: operations (deploy, jagana, backup aur release)

> **Status:** v1.0.3 (2026-11-23). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `27-operations`; charan 1 me pehla deploy, baaki charan 2 aur 13 me (D-446). Progress: 0 / 20 points.

## 1. Lakshya

System ko ₹0 pe live chalana aur bachana: Render aur Vercel pe deploy, soye server ko jagana, backup aur restore, memory ka naap, hafte ki jaanch, incident ke runbooks aur R1 ka release gate ([OPERATIONS.md](../../OPERATIONS.md) §3 se §12).

## 2. Scope

**Andar:** Render ki web service aur Vercel ke projects ka setup aur template; jagane ke raaste; secrets ki table; live smoke check; backup, restore aur break-glass ke laptop commands; 512 MB ka naap; hafte ki jaanch; runbooks; release gate.

**Bahar:**

- CI aur branch ke pehre: `01-foundation`.
- `/health`, `/ready`, ops snapshot aur alerts: `04-logs`. Ops page aur alerts ki screen: `20-app-master`.
- Graceful shutdown ka code: `09-gateway`.
- Providers ke accounts banana, keys daalna aur dashboard ki settings: owner ke kaam ([OWNER_TASKS.md](../../OWNER_TASKS.md)).

## 3. Functional requirements

### 3.1 Pehla deploy (charan 1)

1. **Render** ([OPERATIONS.md](../../OPERATIONS.md) §3 niyam 2): ek free web service, Singapore; auto-deploy "After CI checks pass"; build filter sirf backend aur saajhe packages ke paths aur lockfile; health check `/health`; start seedha `node`, flags `--max-old-space-size` misaal 256 aur `UV_THREADPOOL_SIZE` misaal 2. Koi doosri web service nahi (D-056).
2. **Vercel** (§3 niyam 3): har app ka apna project ek hi template se: `/api/*` ka gateway pe rewrite aur apps ke raaste ka secret header (SR-002, D-052), headers aur CSP (SR-005), CSP ke `connect-src` me Render ka sirf exact `/wake` URL (SR-089); production branch `release`, preview band, deploy `check` ka intezaar kare. Pehla app Master.
3. **Secrets ki table** (§4 niyam 1): naam, kaam, kahan rehta hai, kaun padhta hai, aakhri badlav, badalne ka kram; value kabhi nahi. Har nayi env key PR ke note me aur [OWNER_TASKS.md](../../OWNER_TASKS.md) me (D-430, D-441).
4. **Live smoke check** (§3 niyam 9): `/health`, `/ready`, allowlist ke account se sign-in, headers aur CSP live pe, bina secret `/api` pe 403; nateeja §12 ki table me. Order wala hissa apne charan me judta hai.

### 3.2 Jagana (§5)

1. cron-job.org: har jagane ke samay do jobs, :00 pe jagana aur :03 pe jaanchna (D-424); UptimeRobot ka check misaal :10 pe.
2. GitHub ka `wake` workflow (pehle se hai) sirf backup ke roop me, IST ki khidki ki jaanch ke saath.
3. Jagane ki khidki ghante me ek baar, 09:00 se 22:00 IST (D-322); app ki background ping ka interval aur on/off Master ki setting se (D-349).
4. Atlas ka free cluster 30 din bina connection ke ruke to resume ka kram (§5 niyam 12).

### 3.3 Backup aur restore (§6)

1. Laptop ka backup command: har Atlas cluster Extended JSON me (har collection ek file), aur finance aane pe Neon ka `pg_dump`; encrypted; repo ke andar git se bahar wale folder me, chaar pehron ke saath (D-013); laptop pe aakhri 3.
2. Har backup ka manifest: samay (UTC), git commit, har collection ki ginti aur hash, schema ka fingerprint, encrypted file ka hash; keys backup me kabhi nahi.
3. Laptop ka IP Atlas ki list me sirf backup ya release command ke waqt; kaam ke baad hatna (D-421). Credentials alag aur kam haq wale, `.env.production` se nahi (§6 niyam 12).
4. Restore pehle laptop pe: ginti aur hash, audit chain ka verify, finance ka journal barabar, aur ek smoke; phir hi production; production restore ka kram §6 niyam 9 se.

### 3.4 Naap aur nigrani

1. 512 MB ka naap Docker me, bundle mode, Render jaise flags aur kam CPU (misaal `--cpus=0.1`); chaar halat, har naap 3 baar; nateeja §10 ki table me; script `scripts/` me, sirf laptop pe (§10).
2. Hafte ki jaanch (misaal Sunday, 15 minute): providers ke number ek git-ignored table me, 70% pe owner ka kaam; alerts ka "dead man" check (§7 niyam 9, §9).

### 3.5 Incident aur release (charan 13)

1. Runbooks ek dhaanche me: data leak (CERT-In 6 ghante, D-248), secret leak, provider account pe kabza, laptop ka kho jaana, OOM, free tier khatam, sarkari order, Redis ya cluster ki gadbad (§8).
2. Restore ka abhyaas (pehla R1 se pehle), break-glass command, aur saal me ek baar band record aur band FY ki file kholne ka abhyaas (§6 niyam 10, SR-097).
3. R1 ka release gate: RG-1 se RG-14 ka report ([RULES.md](../../RULES.md) §2.1), poora live smoke, aur §12 ki security records ki table.

## 4. Niyam

1. Har release se pehle backup (har contract wale release se pehle zaroor), aur hafte me ek (D-323).
2. Laptop, tests aur CI kabhi live databases se nahi judte; live tak laptop ki pahunch sirf backup, restore ke abhyaas aur break-glass ko (§1 niyam 7).
3. Render ki keep-alive pe chetavni aaye to bahar ke pinger turant band (§5 niyam 11).
4. Tag aur release notes sirf owner ke kehne pe; kahin koi AI attribution nahi (§3 niyam 12, CLAUDE.md).
5. **Backup, restore ka abhyaas aur break-glass ke tools remote Docker context pe chalne se mana karte hain** (owner, 2026-11-23; D-462). Live data sirf primary laptop pe ([OPERATIONS.md](../../OPERATIONS.md) §1 niyam 11): tool shuru me current Docker context ka endpoint dekhta hai (`ssh://` se shuru ho to remote), `DOCKER_HOST` bhi, aur remote hone pe kuch kiye bina saaf sandesh ke saath ruk jata hai. Test: remote context pe har tool ruke, local pe na ruke (galat misaal ke saath); restore ke abhyaas ke containers apne compose project aur volumes me, development ke `beautinique` project se alag.

## 5. Data model aur API

Koi database ya HTTP API nahi. Is module ki files: Vercel ka template, Render ki settings ka record, `scripts/` ke backup, restore, break-glass aur naap ke commands, aur [OPERATIONS.md](../../OPERATIONS.md) ki tables.

## 6. Security

SR-002, SR-005 aur SR-089 (apps ka template), SR-081 (providers pe MFA, deploy sirf `release` se), SR-083 (backup kabhi artifact nahi), SR-084 (incident ki gambhirta), SR-097 (band records), SR-103 (`security.txt` aur security fix ka raasta).

## 7. Dependencies

- **Tika hai:** `01-foundation`, `09-gateway`, `04-logs`.
- **Is pe tike:** har charan ka live deploy.
- **Owner ke kaam:** Render, Vercel, Atlas, cron-job.org aur UptimeRobot ke accounts; har deployable ki `.env.production`; OT-2 (disk encryption) ho gaya ([OWNER_TASKS.md](../../OWNER_TASKS.md)).

## 8. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.17 `OPERATIONS` (`AC-OPERATIONS-1` se `AC-OPERATIONS-6`, D-450). Har criterion ka test ya likha record ([RULES.md](../../RULES.md) DD-1, RT-34).
- **Manuals aur testing:** chalane ka manual [OPERATIONS.md](../../OPERATIONS.md) hi hai; Master ke ops page ka manual `20-app-master` ke saath.

## 9. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                               | Charan | Size   | Halat |
| ----- | --------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1  | Render ki web service aur pehla deploy                                | 1      | M (2)  | Baaki |
| ST-2  | Vercel ke projects ka template (rewrite, secret header, headers, CSP) | 1      | M (2)  | Baaki |
| ST-3  | Jagane ke raaste aur Atlas resume ka kram                             | 1      | S (1)  | Baaki |
| ST-4  | Secrets ki table aur env keys ka kram                                 | 1      | S (1)  | Baaki |
| ST-5  | Live smoke check (charan 1 ka hissa)                                  | 1      | S (1)  | Baaki |
| ST-6  | 512 MB ka naap: script aur table                                      | 1      | M (2)  | Baaki |
| ST-7  | Hafte ki jaanch ki table aur alerts ka "dead man" check               | 1      | S (1)  | Baaki |
| ST-8  | Backup command, manifest aur laptop pe restore                        | 2      | L (4)  | Baaki |
| ST-9  | Incident ke runbooks                                                  | 13     | M (2)  | Baaki |
| ST-10 | Restore ka abhyaas, break-glass aur band records ka abhyaas           | 13     | M (2)  | Baaki |
| ST-11 | R1 ka release gate aur poora live smoke                               | 13     | M (2)  | Baaki |
|       | **Kul**                                                               |        | **20** |       |

## Change log

| Version          | Date       | Badlav                                                                                       |
| ---------------- | ---------- | -------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.1 | 2026-11-22 | Module 27 ka pehla spec, 11 subtasks (D-446) aur criteria ki link (D-450); code abhi nahi.   |
| v1.0.2 se v1.0.3 | 2026-11-23 | OT-2 ho gaya (owner); remote Docker context pe backup, restore aur break-glass mana (D-462). |
