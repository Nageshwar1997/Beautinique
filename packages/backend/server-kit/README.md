# @beautinique/backend-server-kit

Beautinique ke har backend deployable (gateway, identity, payments, notify, core) ki common neev: Express app, request id, contracts format me errors, `/health` aur `/ready`, secrets chhupane wala logger, namespaced config aur graceful shutdown. Har service ye code copy nahi karti, yahin se leti hai.

## Install

```bash
npm install @beautinique/backend-server-kit express
```

`express` (5.x) aur `zod` (`@beautinique/shared-zod` ke through) peer dependencies hain.

## Ek service, poori

```ts
import { coerce, object, string } from '@beautinique/shared-zod';
import {
  AppError,
  createApp,
  createLogger,
  loadConfig,
  startServer,
} from '@beautinique/backend-server-kit';

const config = loadConfig(
  object({ port: coerce.number().int().default(8081), mongoUri: string().min(1) }),
  { prefix: 'IDENTITY' }, // IDENTITY__PORT, IDENTITY__MONGO_URI
);
const logger = createLogger({ name: 'identity' });

const app = createApp({
  logger,
  ready: { mongo: () => db.isConnected() },
  routes: (app) => {
    app.get('/v1/me', (req, res) => {
      throw new AppError('UNAUTHENTICATED', 'Please sign in again.');
    });
  },
});

await startServer(app, { port: config.port, logger, onStop: [() => db.close()] });
```

## API

| Export                                                                           | Kaam                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createApp({ logger, routes, ready, json, bodyLimit })`                          | Express app is order me: `x-powered-by` band, helmet, request id, access log, `/health` + `/ready`, `express.json` (`json: false` pe nahi: gateway body aage stream karta hai), `routes`, 404, error handler. `bodyLimit` default `1mb`                                                                                           |
| `startServer(app, { port, host, logger, onStop, handleSignals, stopTimeoutMs })` | Server chalao. `port: 0` = koi bhi khaali port (tests). `stop()`: naye request band, chalte request poore, phir `onStop` hooks order me; do baar bulao to ek hi baar chalta hai. SIGTERM/SIGINT pe khud stop (`handleSignals: false` pe nahi, bundle khud sambhalta hai). `stopTimeoutMs` (10 s) ke baad bache connection kaat do |
| `loadConfig(schema, { prefix, env, strip })`                                     | `IDENTITY__MONGO_URI` → `{ mongoUri }`, schema se check (numbers ke liye `coerce`). Error me env var ka naam hota hai, value kabhi nahi. Prefix wali anjaan key (typo) bhi error. `strip: true` padhne ke baad apni keys env se hata deta hai (bundle mode)                                                                       |
| `toEnvKey(key)`                                                                  | `mongoUri` → `MONGO_URI`                                                                                                                                                                                                                                                                                                          |
| `ConfigError`                                                                    | `loadConfig` ka error                                                                                                                                                                                                                                                                                                             |
| `AppError(code, message, { status, details, cause })`                            | Client ko dikhne wala error. `ERROR_CODES` (contracts) wale code ka status apne aap; module ka apna code ho to `status` (4xx/5xx) dena zaroori. Message user ko dikhta hai, saadi English                                                                                                                                         |
| `toErrorResponse(error, requestId)`                                              | Kuch bhi thrown → `{ status, body }` (contracts `errorBody`). `AppError` jaisa hai; `ZodError` → 400 `VALIDATION_FAILED` + `details`; badi body → 413; tooti JSON → 400; baaki → 500 `INTERNAL` (asli message kabhi client tak nahi)                                                                                              |
| `errorHandler(logger)` / `notFound()`                                            | Aakhri middleware (5xx stack ke saath log) / bina route wale path pe 404 `NOT_FOUND`                                                                                                                                                                                                                                              |
| `healthRoutes(checks)`                                                           | `GET /health` → `{ status: 'ok' }` (process zinda). `GET /ready` → har check chalao: sab ok to 200 `ready`, warna 503 `not-ready` aur har check ka `ok`/`failing`                                                                                                                                                                 |
| `requestId()` / `requestIdOf(res)`                                               | Caller (gateway) ka `X-Request-Id` lo agar sahi dikhe (8–128, `A-Z a-z 0-9 . _ : -`), warna naya UUIDv7. Response header, har log line aur error body me jaata hai                                                                                                                                                                |
| `accessLog(logger, { quietPaths })`                                              | Har poore request ki ek line: method, path (query nahi, usme personal data ho sakta hai), status, ms, request id. `createApp` `/health` ko chup rakhta hai                                                                                                                                                                        |
| `createLogger({ name, level, destination })`                                     | pino JSON logger: `service` naam, ISO time, `REDACTED_PATHS` pe `[redacted]`                                                                                                                                                                                                                                                      |
| `REDACTED_PATHS`                                                                 | password, otp, token, secret, apiKey, PAN, account number, IFSC, Aadhaar, licence, RC... 3 level tak gehraai me, aur `authorization`, `cookie`, `set-cookie`, `x-origin-secret` headers                                                                                                                                           |

## Contract route: `mountRoute`

Endpoint pehle contract me (`defineRoute`, RULES §4.1), handler baad me:

```ts
import { mountRoute } from '@beautinique/backend-server-kit';
import { recordPing } from '@beautinique/shared-contracts';

mountRoute(
  router,
  recordPing,
  async ({ body }, { requestId }) => {
    // body route ke schema se check ho chuka aur typed hai; params aur query bhi
    return { pingId, note: body.note, recordedAt }; // route.output ka data
  },
  { status: 201 },
);
```

- Path aur method route se aate hain. `params`, `query`, `body` handler se pehle route ke schema se check hote hain; galat request `VALIDATION_FAILED` + field list, handler chalta hi nahi. Jis part ka schema route me nahi, handler ko `undefined` milta hai.
- Jawab `{ data }` me, route ke `output` schema se check hokar: jo field contract me nahi, wo bahar nahi jaata. Output contract todta ho to ye server ka bug hai: `INTERNAL`, log me poori wajah, client ko kuch nahi.
- Handler jo `AppError` phenke wo apne status ke saath jaata hai. Success status default 200, banane wale route `{ status: 201 }` dein.
- Kaun call kar sakta hai (`access`, `apps`, `stepUp`, `rateLimit`) gateway dekhta hai (Phase 2); idempotency key aur `authorize()` platform kernel ke hain (T4.1). Ye sirf HTTP wala hissa karta hai.

## Niyam

- Har deployable isi se app banata hai, apna error/health/logger code nahi likhta. Kuch naya chahiye jo do services me lagega to yahin jodo.
- Logger me request body ya poora user object mat daalo; jo field `REDACTED_PATHS` me nahi aur personal hai, use log hi mat karo.

## License

MIT © Nageshwar Pawar
