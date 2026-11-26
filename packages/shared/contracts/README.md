# @beautinique/shared-contracts

Routes, events, permissions, error codes and settings keys in one place: the route manifest, the typed client base and the OpenAPI document are made from them.

## Install

```sh
npm install @beautinique/shared-contracts zod
```

`zod` (version 4) is a peer dependency, because the schemas of the contracts are part of your own types.

## Usage

A route is told once. Everything else (the gateway's manifest, the typed client, `openapi.json`) is made from it, so nothing can drift apart.

```ts
import { array, number, strictObject, string } from 'zod';
import {
  buildOpenApi,
  buildRouteManifest,
  createClient,
  definePermission,
  defineRoute,
  openApiJson,
} from '@beautinique/shared-contracts';

const orderPlace = definePermission({
  name: 'commerce.order.place',
  scope: 'self',
  authenticator: false,
  stepUp: false,
  subRoleAllowed: true,
});

export const placeOrder = defineRoute({
  id: 'commerce.order.place',
  method: 'POST',
  path: '/api/v1/commerce/orders',
  summary: 'Place an order',
  apps: ['customer'],
  permission: orderPlace,
  rateLimit: 'place-order',
  idempotency: 'required',
  body: {
    addressId: string('addressId is required.'),
    items: array(
      strictObject(
        {
          variantId: string('variantId is required.'),
          quantity: number('quantity must be a number.')
            .int('quantity must be a whole number.')
            .min(1, 'quantity must be at least 1.'),
        },
        'An item has variantId and quantity only.',
      ),
      'items must be a list.',
    ).min(1, 'items must have at least 1 item.'),
  },
  response: strictObject(
    { orderId: string('orderId is required.') },
    'The answer has orderId only.',
  ),
  status: 201,
});

// The gateway lets through only what is in the manifest.
const manifest = buildRouteManifest([placeOrder]);

// The real spec of the API, made from the same routes.
const openapi = openApiJson(
  buildOpenApi([placeOrder], { title: 'Beautinique API', version: '1.0.0' }),
);

// An app: one function per route, typed from the contract.
const client = createClient({ placeOrder }, send);
const { orderId } = await client.placeOrder({ body }, { idempotencyKey });
```

## API

### Routes

- `defineRoute(route)`: the contract of a route (docs/ARCHITECTURE.md §5 rule 1): `id` (`<service>.<resource>.<action>`), `method`, `path` (`/api/v1/<service>/...`, with `:name` for a changing part), `summary`, `apps`, `permission` (a permission, or `'public'`), `rateLimit`, `idempotency` (`'required'` or `'none'`), `cache` (a public GET only), `params`, `query`, `body`, `response`, `status` (200 if not told) and `errors`.
  - `params`, `query` and `body` are given as the fields of an object, and the package makes them strict objects: a field that the contract does not name is refused (SR-036). The `params` must be exactly the `:name` parts of the path.
  - A route that is not `'public'` asks for a permission, so it is 401 without a session (SR-032). Its step-up is the permission's.
  - It throws a `RangeError` for a route that contradicts itself: an id or path that does not follow the form or is of another service, an app named twice, a GET with a body or an idempotency key, a cache that is not on a public GET, a 204 whose response needs a body.
- `buildRouteManifest(routes)`: what the gateway needs (SR-032, SR-035): per route the id, the apps, the permission name (`null` for a public route), the step-up, the rate limit class and whether it is fail-closed, the idempotency and the cache time. Sorted by path and method. Two routes with one id, or one method and one place in the path (whatever the `:name`), are refused.
- `createRouteMatcher(manifest)`: the lookup of the route of a real request, made once when the service boots (a trie of the path parts, one for each method). It gives `(method, pathname) => ManifestEntry | undefined`, and a request costs the parts of its path, not the number of routes. A written part (`/orders/mine`) wins over a `:name` part (`/orders/:orderId`) at the first place where two routes differ, and the `:name` is the way back when the written one ends without a route. Two routes of one method at one place are refused.
- `uncontractedRoutes(manifest, registered)`: the registered routes that have no contract. There should be none: a route without a contract stops the boot, or the CI (CR-12).
- `buildOpenApi(routes, info)` and `openApiJson(document)`: the OpenAPI 3.1 document (`openapi.json`) with the same routes in the same order, whatever order they were given in. The request is described by the input of the schemas and the answer by their output; the error answers are listed by status, with the codes of the route and the common ones its shape implies.

### The client

- `createClient(routes, transport)`: one function per route, with the input and the answer typed from the contract. `transport` sends a `ClientRequest` and gives back `{ status, body }`; the app gives it (`fetch`, with its timeout, retry and app version header). A part that all of whose fields may be left out can be left out too.
- `buildRequest(route, input, options)`: the request itself, checked with the route's schemas: the path parts are written (and encoded) into the URL, the query is in the order of its keys, the body is JSON, and a route with `idempotency: 'required'` needs `options.idempotencyKey`.
- `ApiError`: what an error answer becomes: `status`, `code`, `message`, `details` and `requestId`. An answer that is not in the one error shape becomes an `ApiError` with the code `INTERNAL`, and nothing of its body.

### Events

- `defineEvent({ type, version, data, description })`: an event (docs/ARCHITECTURE.md §3). The type is `<service>.<aggregate>.<pastTense>` and the service is the producer. `schema` is the envelope for this event: another producer, type or version, or a field of `data` that is not named, is refused (SR-071). A secret, a code or personal data (`otp`, `password`, `token`, `deliveryCode`, `pan`, `address` and the like) cannot be a field of `data`: pass an id instead.
- `eventEnvelopeSchema`: the envelope of every event (`eventId`, `type`, `version`, `occurredAt`, `producer`, `aggregate`, `actor`, `correlationId`, `causationId`, `data`). `EVENT_MAX_BYTES` is 16 KB.

### Permissions, settings and errors

- `definePermission({ name, scope, authenticator, stepUp, subRoleAllowed })`: `<service>.<resource>.<action>`, the scope it applies to, and the flags of docs/ARCHITECTURE.md §11 rule 1. A step-up needs an authenticator.
- `defineSetting({ key, schema, defaultValue, description })`: a settings key (`<service>.<name>`, in camelCase), the shape of its value and a default that passes it.
- `COMMON_ERRORS`, `defineErrors(service, codes)`, `errorBodySchema`: the codes every service uses, the codes of one service (`COMMERCE_STOCK_UNAVAILABLE` for `defineErrors('commerce', { STOCK_UNAVAILABLE: 409 })`, so two services never share a code), and the one error body `{ error: { code, message, details, requestId } }`.
- `SERVICES`, `APPS`, `RATE_LIMIT_CLASSES`, `SCOPE_TYPES`, `HTTP_METHODS`: the lists the names above are taken from.

The routes, events, permissions and settings of each service are told in that service, not here: this package holds the structure and the parts every service shares.

## Visibility

This package should really be private. The contracts of the real services list every route, every permission and every event, which is a map of the whole API, of who may call what, and of how far it is guarded. Private packages are not on npm's free plan (docs/OPERATIONS.md §11 rule 6), so it is published publicly. What is published here is only the structure and the shared parts (the lists of services and apps, the common error codes, the envelope of an event); the real definitions stay in the services and are not published. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
