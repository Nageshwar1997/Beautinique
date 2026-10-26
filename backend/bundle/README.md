# bundle

Runs every deployable in one Node process (bundle mode, the Render live server). Live server (Render `bq-live`) aur laptop pe jaldi edit-reload ke liye (ARCHITECTURE §3, §11.1, §12).

## Kaise chalta hai

1. Har deployable ka config pehle padha jata hai, aur uski `<NAME>__*` keys env se hata di jati hain.
2. Gateway ke peeche wale deployables `127.0.0.1` ke khaali ports pe chalte hain (bahar se pahunch nahi).
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

Dev aur start dono `src/instrument.ts` (build me `dist/instrument.js`) ko `node --import` se pehle load karte hain: Sentry Express aur drivers se pehle, poore process me ek baar (`SENTRY_DSN` khaali = band).

## Settings

`.env.example` ko `.env` me copy karo (commit kabhi nahi). Har deployable ki keys (`backend/<name>/.env.example`) bhi isi `.env` me daalo, kyunki bundle ek hi process hai.

## Render (`bq-live`)

| Setting           | Value                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root Directory    | khaali (repo root)                                                                                                                                         |
| Build Command     | `npm install --prefix .npm12 --no-audit --no-fund npm@12.2.0 && .npm12/node_modules/.bin/npm ci && .npm12/node_modules/.bin/npm run build -- --for bundle` |
| Start Command     | `cd backend/bundle && node --enable-source-maps --max-old-space-size=300 --import ./dist/instrument.js dist/start.js`                                      |
| Health Check Path | `/health`                                                                                                                                                  |
| Branch            | `release`, Auto-Deploy "After CI checks pass"                                                                                                              |
| Env               | `.env.example` ki keys, live values ke saath ([HANDOFF](../../docs/HANDOFF.md) §4); `NODE_VERSION=24`, `UV_THREADPOOL_SIZE=2`; `PORT` aur `NODE_ENV` nahi  |

- **npm 12 `.npm12` me:** root `devEngines` npm 12 maangta hai, aur Render ka npm 11 is repo me `npm ci` ya `npm run` pe `EBADDEVENGINES` deta hai. Global install nahi ho sakta (Render pe `/usr/lib/node_modules` read-only, `EROFS`), isliye npm 12 repo ke andar ek folder me.
- **Start bina npm ke:** `package.json` ki `start` script jaisa hi command, seedha `node`: Render ka npm 11 `npm run` chala hi nahi sakta, 512 MB me npm ka ~40–50 MB bachta hai, aur SIGTERM seedha app ko milta hai (graceful stop). `start` script badlo to ye command bhi.
- `NODE_ENV=production` mat daalo: build me devDependencies (tsdown waghera) nahi aati.

Boot ke release steps (lease lock, migrations, index sync) TASKS T2.5 me jodne hain.
