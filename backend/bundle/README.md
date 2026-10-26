# bundle

Runs every deployable in one Node process (bundle mode, the Render live server). Live server (Render `bq-live`) aur laptop pe jaldi edit-reload ke liye (ARCHITECTURE §3, §11.1, §12).

## Kaise chalta hai

1. Har deployable ka config pehle padha jata hai, aur uski `<NAME>__*` keys env se hata di jati hain.
2. Gateway ke peeche wale deployables ek-ek karke `127.0.0.1` ke khaali ports pe chalte hain (bahar se pahunch nahi). Har ek listen se pehle apne DB me **release steps** chalata hai (migrations, index sync; `@beautinique/backend-server-release`, ARCHITECTURE §11.1), isliye public port (aur Render ka `/health`) tabhi khulta hai jab sabke steps ho chuke.
3. Gateway public port (`PORT`, default 8080) pe chalta hai aur unke URLs leta hai.
4. SIGTERM pe pehle gateway rukta hai, phir baaki (ulte order me).

Kaunse deployables chalenge, ye [src/deployables.ts](src/deployables.ts) me hai. Use haath se mat badlo:
`npm run create -- --type backend` naya deployable banate hi use yahan jod deta hai.

## Commands

| Command                            | Kaam                                                      |
| ---------------------------------- | --------------------------------------------------------- |
| `npm run dev:backend` (repo root)  | Sab deployables, source se, file badalte hi restart       |
| `npm run build --workspace bundle` | `dist/` (deployables ka build `npm run build` deta hai)   |
| `npm run start --workspace bundle` | Production jaisa: compiled JS, `--max-old-space-size=300` |
| `npm run test --workspace bundle`  | Sab deployables ek saath start/stop ka test               |
| `npm run db:release` (repo root)   | Sirf release steps, bina server chalaye (neeche)          |

Dev aur start dono `src/instrument.ts` (build me `dist/instrument.js`) ko `node --import` se pehle load karte hain: Sentry Express aur drivers se pehle, poore process me ek baar (`SENTRY_DSN` khaali = band).

## Release steps (`npm run db:release`)

Har start release steps khud chalata hai; jab DB me yahi release pehle se ho (fingerprint same) to sirf ek document padhta hai. Ye command unhe bina server chalaye chalata hai: seed ya ek-baar wala kaam (migration/step ke roop me), ya haath se hataya index wapas (`--force`).

| Command                                   | Kaam                                                                                                                                                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run db:release`                      | Har DB wale deployable (abhi identity, core) ke steps, laptop ke DB pe (`backend/bundle/.env`)                                                                                                                                                          |
| `npm run db:release -- --deployable core` | Sirf ek                                                                                                                                                                                                                                                 |
| `npm run db:release -- --force`           | Fingerprint same ho tab bhi                                                                                                                                                                                                                             |
| `npm run db:release -- --env live`        | **Live** Atlas pe, `backend/bundle/.env.production` ki values se (sirf owner ke paas). Pehle har deployable ka DB aur host dikhata hai (user/password kabhi nahi), aur `live` type karne pe hi chalta hai. Atlas Network Access me laptop ka IP chahiye |

Gateway ka DB nahi, uske steps nahi. Naya deployable `src/service.ts` se `release(config, { logger, force })` export kare to ye command use apne aap leta hai.

## Settings

`.env.example` ko `.env` me copy karo (commit kabhi nahi). Har deployable ki keys (`backend/<name>/.env.example`) bhi isi `.env` me daalo, kyunki bundle ek hi process hai. Live values Render ke Environment me, aur unki private copy `.env.production` me (sirf `npm run db:release -- --env live` use padhta hai); har key ki live value kahan se, ye `.env.example` me likha hai.

## Render (`bq-live`)

| Setting           | Value                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root Directory    | khaali (repo root)                                                                                                                                        |
| Build Command     | `sh scripts/render/build.sh`                                                                                                                              |
| Start Command     | `sh scripts/render/start.sh`                                                                                                                              |
| Health Check Path | `/health`                                                                                                                                                 |
| Branch            | `release`, Auto-Deploy "After CI checks pass"                                                                                                             |
| Env               | `.env.example` ki keys, live values ke saath ([HANDOFF](../../docs/HANDOFF.md) §4); `NODE_VERSION=24`, `UV_THREADPOOL_SIZE=2`; `PORT` aur `NODE_ENV` nahi |

- **Commands repo me:** asli commands [scripts/render/build.sh](../../scripts/render/build.sh) aur [start.sh](../../scripts/render/start.sh) me hain, dashboard me sirf unka naam. Commands badalna = code ka badlav (`release` pe deploy ke saath); dashboard dobara nahi chhoona. Pehle dashboard me poore commands the: repo me badle, par Render purane hi chalata raha (2026-10-26).
- **npm 12 `.npm12` me:** root `devEngines` npm 12 maangta hai, aur Render ka npm 11 is repo me `npm ci` ya `npm run` pe `EBADDEVENGINES` deta hai. Global install nahi ho sakta (Render pe `/usr/lib/node_modules` read-only, `EROFS`), isliye npm 12 repo ke andar ek folder me.
- **Start bina npm ke:** `package.json` ki `start` script jaisa hi command, seedha `node`: Render ka npm 11 `npm run` chala hi nahi sakta, 512 MB me npm ka ~40–50 MB bachta hai, aur SIGTERM seedha app ko milta hai (graceful stop). `start` script badlo to `start.sh` bhi. `exec` se `node` hi Render ka process ban jaata hai.
- `NODE_ENV=production` mat daalo: build me devDependencies (tsdown waghera) nahi aati.

Boot ke release steps (lease lock, migrations, index sync) TASKS T2.5 me jodne hain.
