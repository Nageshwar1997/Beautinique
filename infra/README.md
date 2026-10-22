# infra — laptop ka local infra (Docker)

> **Status:** v1.3 (2026-10-22). Docker Lesson 2 (TASKS T0.8). Docker sirf laptop ke liye hai; live server (Render) Docker nahi chalata, wahan Atlas, Render Key Value aur Brevo hain (ARCHITECTURE §11, §12).

## Kya chalta hai

| Service   | Image (exact version)     | Laptop pe                                  | Live pe iski jagah |
| --------- | ------------------------- | ------------------------------------------ | ------------------ |
| `mongo`   | `mongo:8.0.34`            | `127.0.0.1:27017`, replica set `rs0`       | Atlas M0 (8.0)     |
| `valkey`  | `valkey/valkey:8.1.10`    | `127.0.0.1:6379`, Render free jaisi limits | Render Key Value   |
| `mailpit` | `axllent/mailpit:v1.31.6` | Inbox <http://localhost:8025>, SMTP `1025` | Brevo (HTTPS API)  |

Saare ports sirf `127.0.0.1` pe khulte hain: Wi-Fi pe baitha koi aur in bina password wali services tak nahi pahunch sakta.

Mongo test commands (`--setParameter enableTestCommands=1`) ke saath chalta hai. Isse tests `failCommand` fail point se Mongo ko jaan-boojh ke fail ya dheema karwate hain (jaise commit ka "result pata nahi" error) aur dekhte hain ki retry sahi hai. Ye sirf laptop, CI aur release build pe hai; Atlas pe ye kabhi nahi hota. `ci.yml` aur `release.yml` bhi tests se pehle isi file ke `mongo` aur `valkey` chalate hain; naya backend package kisi aur service pe test kare to use dono workflows ke us step me jodo.

Abhi idle pe teeno milake ~250 MB RAM lete hain (Mongo ~234 MB, cache 256 MB pe band). Docker Desktop ko is laptop pe ~2.8 GB mili hai.

## Commands (repo root se)

| Command               | Kaam                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `npm run infra:up`    | Teeno start, aur tab tak rukta hai jab tak teeno "healthy" na ho jayein (pehli baar ~20 s) |
| `npm run infra:down`  | Containers hatate hain. Mongo ka data volume me bacha rehta hai                            |
| `npm run infra:reset` | Containers + Mongo ka data volume, dono mitate hain (Mongo bilkul khaali). Soch ke chalao  |
| `npm run infra:logs`  | Teeno ke logs live (Ctrl+C se band)                                                        |

Pehle Docker Desktop kholo. `failed to connect to the docker API` error ka matlab hai Docker Desktop band hai.

## Apps kaise judengi

| Kya             | Value                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Mongo           | `mongodb://localhost:27017/<db>?replicaSet=rs0` (db: `bq_identity`, `bq_payments`, `bq_notify`, `bq_core`, `bq_audit`)  |
| Valkey          | `redis://localhost:6379`                                                                                                |
| Mailpit (API)   | `POST http://localhost:8025/api/v1/send` (JSON). notify ka local adapter isse bhejega, jaise live pe Brevo ka HTTPS API |
| Mailpit (inbox) | <http://localhost:8025>: email OTP aur saari emails yahin dikhti hain                                                   |

Ye values deployables ke `.env` me jaayengi (`IDENTITY__MONGO_URI` ...), jab wo database use karna shuru karenge (TASKS T1.2).

## Lesson 2 ke notes

1. **Image aur container.** Image ek tayyar dabba hai (software + setup), ek baar download hota hai. Container us image ka chalta hua roop hai. Container mitao to image bachi rehti hai, aur ek image se kai containers ban sakte hain.
2. **Exact version pin.** `latest` ya `8` likhne se kal chupke se naya version aa sakta hai, aur dono developers ke laptop alag chal sakte hain. Badalna ho to compose file me jaan-boojh ke badlo.
3. **Port mapping** (`'127.0.0.1:27017:27017'` = laptop:container). Container ka apna network hota hai; ye line laptop ke port ko container ke port se jodti hai. `127.0.0.1` lagane se sirf aapka laptop jud sakta hai.
4. **Volume** (`mongo-data:/data/db`). Container ke bahar rakha data. Containers hata ke dobara banao, Mongo ka data bacha rehta hai (`infra:down` → `infra:up`). Valkey ka volume nahi hai, isliye wo har restart pe khaali milta hai, bilkul Render free jaisa.
5. **Healthcheck.** Docker har kuch second ek chhota command chalata hai (Mongo: likhne layak primary hai?, Valkey: `PING` → `PONG`, Mailpit: `readyz`). `infra:up --wait` tab tak rukta hai jab tak teeno healthy na hon.
6. **Replica set kyun** (ek hi member ke saath bhi). Transactions (order aur stock ek saath save, ya dono wapas) aur change streams sirf replica set pe chalte hain. Atlas bhi replica set hai, isliye laptop pe bhi wahi. Healthcheck pehli baar `rs.initiate()` karta hai; uske baad setting volume me bachi rehti hai.
7. **Valkey ki seemaayein** (Render free jaisi). 25 MB memory, `noeviction` (bhar jaye to purana data chupke se nahi mitata, saaf `OOM` error deta hai), 50 connections, disk pe kuch save nahi. Isse free tier ki dikkatein laptop pe hi dikh jaati hain (ARCHITECTURE §6.6).

## Khud try karo

```bash
docker compose -f infra/docker-compose.yml ps
```

```bash
docker compose -f infra/docker-compose.yml exec mongo mongosh --eval "rs.status().members[0].stateStr"
```

```bash
docker compose -f infra/docker-compose.yml exec valkey valkey-cli CONFIG GET maxmemory-policy
```

```bash
docker stats --no-stream
```

```bash
docker volume ls
```

## Jaal (traps)

- **MongoDB 8.0 aur Linux kernel 6.19+:** naye kernel pe `mongo:8.0.x` shuru hi nahi hota ("MongoDB cannot start: Linux kernel versions 6.19 and newer ...", SERVER-121912), kyunki uska tcmalloc kernel ke ek badlav se toot jaata hai. Ubuntu/Azure ke `7.0.0-xx` kernel bhi block hote hain (SERVER-136848). GitHub ke `ubuntu-latest` aur `ubuntu-24.04` dono runners kernel `7.0.0-azure` pe hain (2026-10-22), isliye runner pin karna kaam nahi aaya. **Hal:** compose ke `mongo` service me `GLIBC_TUNABLES=glibc.pthread.rseq=1` (JIRA pe bataya gaya workaround; tcmalloc safe raaste pe chalta hai). Laptop (WSL2 kernel 6.18) pe bhi yahi chalta hai. MongoDB ka asli fix aane pe ye setting hata do. CI ka start step kernel version print karta hai.
- **Port pehle se busy** (`port is already allocated`): laptop pe Windows ki MongoDB service ya koi purana container 27017/6379 pe chal raha hai. Use band karo (`services.msc` me MongoDB, ya `docker ps`).
- **Containers ke andar se Mongo (Lesson 4, split mode):** replica set ka member `localhost:27017` hai, jo laptop se sahi hai par doosre container ke andar nahi. Wahan connection string `mongodb://mongo:27017/<db>?directConnection=true` hogi.
- **`infra:reset` data mitata hai:** seed data dobara daalna padega (`db:seed`, T4.x).
- Docker Desktop band karne se pehle `npm run infra:down` karo; warna agli baar containers ruke hue milte hain (`infra:up` unhe phir chala deta hai).

## Change log

| Version | Date       | Badlav                                                                                           |
| ------- | ---------- | ------------------------------------------------------------------------------------------------ |
| v1.0    | 2026-10-21 | Pehla version: Mongo replica set, Valkey (Render limits), Mailpit; scripts.                      |
| v1.1    | 2026-10-21 | Mongo `enableTestCommands=1` (tests ke fail points); CI aur release bhi yahi mongo chalate hain. |
| v1.2    | 2026-10-21 | CI aur release `valkey` bhi chalate hain (server-queue ke tests).                                |
| v1.3    | 2026-10-22 | Trap: MongoDB 8.0 Linux kernel 6.19+ pe shuru nahi hota (CI pin, laptop 6.18).                   |
