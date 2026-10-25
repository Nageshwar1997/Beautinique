# @beautinique/shared-contracts

Beautinique ke "contracts": har endpoint, event, permission, error code aur area setting **ek hi baar** yahan zod ke saath declare hota hai (ARCHITECTURE §5). Isi se backend handlers, typed frontend client, gateway ka route manifest aur OpenAPI docs bante hain, isliye teeno kabhi alag nahi hote.

Abhi isme **system** hai (`defineRoute`, `defineEvent` ...); asli endpoints aur events har module ke saath judte jayenge.

## Install

```bash
npm install @beautinique/shared-contracts zod
```

`zod` (v4) `@beautinique/shared-zod` ki peer dependency hai.

## Routes

```ts
import { defineRoute, cursorQuery } from '@beautinique/shared-contracts';
import { number, object, objectIdZod } from '@beautinique/shared-zod';

export const getProduct = defineRoute({
  id: 'catalog.products.get',
  method: 'GET',
  path: '/catalog/products/:productId',
  summary: 'One product',
  apps: ['customer', 'seller'],
  access: { type: 'public' }, // ya { type: 'signed-in' }, ya { type: 'permission', permission: 'catalog.product.view' }
  rateLimit: 'public',
  idempotency: false, // true = client ko Idempotency-Key bhejna hoga (GET pe nahi)
  stepUp: false, // true = haal hi ka MFA (sirf permission routes)
  owner: 'core',
  input: { params: object({ productId: objectIdZod }), query: cursorQuery },
  output: productSchema,
});
```

`defineRoute` galat declaration pe turant error deta hai:

- id/path ka format galat;
- path ke `:params` aur `input.params` alag;
- GET/DELETE pe body;
- GET pe idempotency;
- bina permission ke step-up;
- anjaan app, owner ya rate-limit class.

Types route se hi aate hain:

- `RouteRequest<typeof getProduct>`: client kya bhejta hai;
- `RouteInput<...>`: validate hone ke baad handler ko kya milta hai;
- `RouteOutput<...>`: response ka `data`.

| Helper                    | Kaam                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `routeTable(routes)`      | Saare routes; duplicate id ya same method + path shape (`/a/:id` vs `/a/:slug`) pe error |
| `gatewayManifest(routes)` | Gateway ke liye plain JSON: app, access, rate limit, idempotency, step-up, owner         |
| `toOpenApi(routes, info)` | OpenAPI 3.1 document (zod 4 ka JSON Schema), Beautinique details `x-bq` me               |
| `buildPath`, `matchPath`  | `/products/:id` bharna (encode ke saath) aur padhna                                      |

**Rate-limit classes** (ARCHITECTURE me naam tay nahi the; ye shuruaati set hai): `public`, `read`, `write`, `search`, `auth`, `otp`, `partner-api`, `webhook`. Har class ka budget gateway config me rahega. `auth` aur `otp` Redis down hone pe fail-closed hain.

## Events

```ts
export const sellerApproved = defineEvent({
  type: 'sellers.org.approved', // <context>.<aggregate>.<pastTense>
  version: 1,
  producer: 'core',
  description: 'A seller organisation was approved',
  data: object({ sellerOrgId: objectIdZod }),
});

sellerApproved.envelope.parse(message); // poora envelope: eventId (UUIDv7), type, version, occurredAt, producer, aggregate, actor, correlationId, causationId, scope, data
```

`data` me breaking change ka matlab naya version hai, jo purane ke saath declare hota hai. `eventCatalogue(events)` type + version se dhoondhta hai, `latest(type)` deta hai, aur duplicate ya versions me gap (1, 3) pe error deta hai.

## Permissions

```ts
definePermission({
  key: 'network.area.go_live.request', // <module>.<resource>.<action>
  description: 'Ask to open an area',
  scopeTypes: ['state', 'district'],
  risk: 'high',
  mfa: true,
  secondSignature: true, // maker-checker: sirf high risk pe
});
```

`permissionCatalogue([...])` duplicate keys pakadta hai. Scope types aur containment `SCOPE_TYPES`, `LOCATION_SCOPES` me hain; matching `shared-authz` karta hai.

## Area settings

```ts
const promise = defineAreaSetting({
  key: 'delivery.promise_days',
  description: 'Days from order to delivery shown to customers',
  schema: number().int().min(1).max(15),
  defaultValue: 4, // schema se valid hona chahiye
});

resolveAreaSetting(promise, values, { stateId: '27', districtId: '519', pincode: '411001' });
// { value, level }: pincode → district → state → global → default, sabse specific jeet-ta hai
```

## HTTP basics

- `ERROR_CODES`: common error codes aur unka HTTP status (`VALIDATION_FAILED` 400, `STEP_UP_REQUIRED` 401, `IDEMPOTENCY_KEY_REUSED` 422, `RATE_LIMITED` 429 ...). Modules apne codes isi `UPPER_SNAKE_CASE` me jodte hain (`errorCode`).
- `errorBody`: har error response `{ error: { code, message, details?, requestId } }`.
- `successBody(schema)`: har success response `{ data }`.
- `cursorQuery` (`cursor`, `limit` 1–100, default 20) aur `cursorPage(item)` (`items`, `nextCursor`).
- `APPS` (11 apps), `DEPLOYABLES` (5), `HEADERS` (`X-BQ-App`, `Idempotency-Key`, `X-Request-Id`).

## Typed client

```ts
import { createClient, queryKey, ApiError, getPing } from '@beautinique/shared-contracts';

const client = createClient({ baseUrl: gatewayUrl, app: 'admin', getToken: () => token });
const ping = await client.call(getPing, { params: { pingId } }); // return type route ke output se
```

- `call(route, { params, query, body }, { signal, idempotencyKey })`: path ban-ta hai (encode ke saath), query me `null`/`undefined` chhoot jaate hain aur arrays repeat hote hain, `X-BQ-App` + Bearer token jaata hai, aur `idempotency: true` routes pe `Idempotency-Key` apne aap (retry pe wahi key do: `idempotencyKey`). Request tab hi zaroori hai jab route me input ho.
- Galti pe `ApiError` (`code`, `status`, `requestId`, `details`): server ka error body, ya body hamari na ho to `BAD_REQUEST`/`INTERNAL`; server na mile to `NETWORK_ERROR` (status 0); `data` na ho ya route ke output se na mile to `INVALID_RESPONSE` (`validateResponses: false` se band). Abort jaisa ka waisa dobara phenka jaata hai.
- TanStack Query keys: `queryKey(route, { params, query })` = `[module, route.id, { params, query }]` (body kabhi nahi); `queryKeyPrefix('platform')` ya `queryKeyPrefix('platform', 'platform.ping.get')` invalidate ke liye.

## Catalogue aur codegen

Platform ka poora catalogue `src/catalogue/` me hai (`routes`, `events`, `permissions`); har module apni list wahan jodta hai. Abhi Milestone 1 ka sample hai: route `platform.ping.record` (POST, signed-in, idempotent, har app) jo `platform.ping.recorded` event usi transaction me likhta hai, route `platform.ping.get` (permission `platform.ping.read`).

```bash
npm run build --workspace @beautinique/shared-contracts
npm run generate --workspace @beautinique/shared-contracts   # generated/ likhta hai
npm run check --workspace @beautinique/shared-contracts      # generated/ purana ho to fail (CI)
```

`generated/` me 4 files (commit hoti hain, test unhe catalogue se milata hai): `openapi.json` (OpenAPI 3.1), `gateway-manifest.json` (gateway ko har route ka app/access/rate-limit/idempotency/step-up/owner), `events.json` (har event version ka JSON Schema) aur `permissions.json`. Ek hi input se hamesha ek hi bytes. Code se: `import { generateFiles, writeGenerated, staleGenerated } from '@beautinique/shared-contracts/codegen'` (sirf Node).

## Aage

Event schema ka backward-compatibility check (CI) aur OpenAPI diff ARCHITECTURE §13 ke CI kaam me aayenge.

## License

MIT © Nageshwar Pawar
