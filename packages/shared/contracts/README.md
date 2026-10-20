# @beautinique/shared-contracts

Private package (sirf monorepo). Beautinique ke "contracts": har endpoint, event, permission, error code aur area setting **ek hi baar** yahan zod ke saath declare hota hai (ARCHITECTURE §5). Isi se backend handlers, typed frontend client, gateway ka route manifest aur OpenAPI docs bante hain, isliye teeno kabhi alag nahi hote.

Abhi isme **system** hai (`defineRoute`, `defineEvent` ...); asli endpoints aur events har module ke saath judte jayenge.

## Routes

```ts
import { defineRoute, cursorQuery } from '@beautinique/shared-contracts';
import { objectId } from '@beautinique/shared-zod';

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
  input: { params: z.object({ productId: objectId }), query: cursorQuery },
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
  data: z.object({ sellerOrgId: objectId }),
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
  schema: z.number().int().min(1).max(15),
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

## Aage

Event schema ka backward-compatibility check (CI) aur OpenAPI diff ARCHITECTURE §13 ke CI kaam me aayenge.

## License

MIT © Nageshwar Pawar
