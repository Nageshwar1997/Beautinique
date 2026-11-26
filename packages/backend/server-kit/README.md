# @beautinique/backend-server-kit

Runs a route from its contract: the checks of what comes in and goes out, the actor and authorize, the error shape, idempotency and the rate limit counter.

## Install

```sh
npm install @beautinique/backend-server-kit @beautinique/shared-contracts @beautinique/shared-clock express zod
```

## Usage

```ts
import { createServerKit, createMemoryIdempotencyStore } from '@beautinique/backend-server-kit';
import express from 'express';

const kit = createServerKit({
  clock,
  logger,
  idempotency, // the store of the service (a database); needed by a route with an idempotency key
  actorOf: (request) => request.res?.locals['actor'], // the gateway has checked the session
});

const app = express();
app.use(
  kit.router('commerce', [
    // A route can only be given with its contract (CR-12): `getOrder` is the result of `defineRoute`.
    kit.route(getOrder, async (ctx) => {
      const order = await orders.find(ctx.params.orderId);
      if (order === undefined) throw notFound();
      ctx.authorize({ ownerId: order.customerId }); // 404 for another customer's order (SR-033)
      return { orderId: order.id, status: order.status };
    }),
  ]),
);
app.use((request, response) => kit.notFound(request, response));
```

## API

### Routes

- `createServerKit({ clock, logger, idempotency?, actorOf })`: the kit of a service. `actorOf(request)` gives the `Actor` that the gateway (or its middleware in a bundle) has checked, or `undefined`; if it throws, the answer is 503, not 401 (SR-031).
- `kit.route(contract, handler)`: a route with its code. The handler is given `ctx` with the `params`, `query` and `body` already checked with the strict schemas of the contract (SR-036), the `actor`, the `requestId`, the `scopes` of the permission, and `authorize(resource)`. It gives what the response schema reads; a field that the contract does not name is a 500 and never leaves.
- `kit.router(service, routes)`: the Express router of a service. A route of another service, or two with one id or at one place, stop the boot. A path is exact (`/orders/` is not `/orders`). A JSON body is read only by a route that has one, up to 100 KB (413 over it, SR-007).
- `kit.notFound`: the last middleware of an app: a 404 in the one error shape.
- `createRouteRunner(contract, handler, deps)`: the same without Express: `(request) => response`. It never throws; every error is an answer.

What a request goes through, in this order: the actor (401), the app of its token (403, SR-035), the permission (403) and a fresh step-up (403 `STEP_UP_REQUIRED`, D-185); the path, the query and the body (400, with the place of each field and never its value); the idempotency key; the handler; the response schema. The path and the query come as text: a field that the schema wants as a number, a boolean, a date or a list is read from its text, as the typed client of the contracts writes it.

### Actor and authorize

- `authorize(actor, permission, resource, now)`: a pure function (SR-032): `{ allowed: true, scopes }` or `{ allowed: false, reason }` with `unauthenticated` (401), `forbidden` (403), `not-found` (404, a resource outside every scope) or `step-up-required` (403). With no resource it gives the scopes in force, to filter a list by (SR-033, SR-034). A grant has an end (SR-037); `global` holds `national`, which holds `state`, `district`, `subDistrict` and `hub`; a warehouse is inside its district.
- `Actor`, `Grant`, `Scope`, `Resource`, `Area` and the schemas `actorSchema`, `grantSchema`, `scopeSchema`: plain JSON, so an actor can be kept (SR-029) and sent in a signed call.

### Errors

- `AppError({ status, code, message, details?, retryAfterSeconds? })` and the common ones: `validationFailed`, `unauthenticated`, `forbidden`, `stepUpRequired`, `notFound`, `payloadTooLarge`, `idempotencyInProgress`, `idempotencyKeyReused`, `rateLimited`, `serviceUnavailable`, `internalError`. A route answers only with the common codes and the ones its contract lists, with the status it lists; any other is a 500 (and is logged). What is thrown that is not an `AppError` is a 500 that says nothing of itself (SR-077).
- `errorBody(error, requestId)`: `{ error: { code, message, details, requestId } }`, with `details` always there (`null` when there is nothing).

### Idempotency

- A route with `idempotency: 'required'` needs the `Idempotency-Key` header (8 to 128 of letters, digits, `-` and `_`). Key + route + caller: the same request gives the first answer; the key with another request is 422 `IDEMPOTENCY_KEY_REUSED`; one that is still running is 409 `IDEMPOTENCY_IN_PROGRESS` (SR-045). The 2xx and 4xx are kept for 48 hours, a 5xx is not. A request that began and never ended frees its key after 60 seconds. When the store cannot say whether a request has run, it does not run: 503.
- `IdempotencyStore` (`begin`, `complete`, `release`): where the records are kept; the live one is the owner service's database. `createMemoryIdempotencyStore()` is for tests and a laptop. A public route cannot ask for a key (it has no caller).

### Rate limit

- `createRateLimiter({ counter, local, fallback })` with `check(class, subject, { limit, windowMs })` and `enforce(...)` (throws 429 or 503, with `Retry-After`). The limits and which key (address or account) are the gateway's (SR-008). When the shared counter is out of reach, the classes that are fail-closed in the contracts (sign-in, codes, starting a payment, review, report, claim) are 503, and the others go on with the small limit of the process (`fallback`).
- `createValkeyCounter(client)`: the counter on Valkey, one script (`HIT_SCRIPT`) that counts and sets the window together; `client` needs only `eval(script, numberOfKeys, ...args)` (as `ioredis` has it). A window is fixed: a caller can have up to twice the limit across the end of one window and the start of the next. `createMemoryCounter(clock)`: the process's own, with at most 10,000 keys.

### Facade (SR-071)

- `defineFacade(service, { call: { input, output } })`, `createFacadeClient(facade, transport)`: one definition, both modes (docs/ARCHITECTURE.md §2.4 rule 10). `inProcessTransport(facade, implementation)` in a bundle; `signedHttpTransport({ baseUrl, key, clock })` in a split. Both pass JSON only, check the input and the output with the schemas, and give the same `AppError` for an error of the owner.
- `kit.facadeRouter(facade, implementation, { verifier })`: `POST /internal/<service>/<call>` in the service that owns the facade. `signCall`, `createVerifier(keys, clock)`: HMAC-SHA256 over the call's name, the time, a nonce and the hash of the body (the actor is in it); constant-time compare, a window of a minute either side, a nonce is used once; keys have ids so they can be changed one at a time. A call that is not signed right is 401 and says no reason.

## Visibility

Private in truth. How `authorize` reads a scope, how the rate limit is counted and which classes fail closed, and how the calls between services are signed, tell an attacker where the walls are. It is published publicly like every package (docs/RULES.md CR-36), and its safety does not rest on the code being hidden but on the keys, which are never in the package.
