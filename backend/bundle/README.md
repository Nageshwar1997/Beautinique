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

## Settings

`.env.example` ko `.env` me copy karo (commit kabhi nahi). Har deployable ki keys (`backend/<name>/.env.example`) bhi isi `.env` me daalo, kyunki bundle ek hi process hai.

Boot ke release steps (lease lock, migrations, index sync) TASKS T2.5 me jodne hain.
