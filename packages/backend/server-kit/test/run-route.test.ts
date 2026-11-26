import { createFakeClock } from '@beautinique/shared-clock';
import { describe, expect, it, vi } from 'vitest';

import type { Actor } from '../src/actor.ts';
import { AppError, notFound, serviceUnavailable } from '../src/errors.ts';
import {
  createMemoryIdempotencyStore,
  IDEMPOTENCY_TTL_MS,
  type IdempotencyStore,
} from '../src/idempotency.ts';
import { createRouteRunner, type RouteDeps, type RouteRequest } from '../src/run-route.ts';
import {
  actorOf,
  closeOrder,
  getOrder,
  grant,
  homePage,
  hubSwitch,
  listOrders,
  NOW,
  orderPlace,
  orderRead,
  placeOrder,
  signUp,
  switchHub,
} from './utils/fixtures.ts';

const customer = actorOf([grant(orderRead), grant(orderPlace)]);

function setup(overrides: Partial<RouteDeps> = {}) {
  const clock = createFakeClock(NOW);
  const logger = { error: vi.fn() };
  const idempotency = createMemoryIdempotencyStore();
  return { clock, logger, idempotency, deps: { clock, logger, idempotency, ...overrides } };
}

const request = (extra: Partial<RouteRequest> = {}): RouteRequest => ({
  params: {},
  query: {},
  body: undefined,
  headers: {},
  requestId: 'req-1',
  actor: customer,
  ...extra,
});

// `null` is no Idempotency-Key header at all.
const place = (body: unknown, key: string | null = 'key-00001', actor: Actor = customer) =>
  request({
    body,
    actor,
    headers: key === null ? {} : { 'idempotency-key': key },
  });

const order = { addressId: 'a1', quantity: 2 };

describe('createRouteRunner: who may call (SR-032, SR-035)', () => {
  it('SR-032: a route that is not public is 401 without an actor', async () => {
    const { deps } = setup();
    const run = createRouteRunner(listOrders, () => Promise.resolve({ items: [] }), deps);

    const answer = await run(request({ actor: undefined }));

    expect(answer.status).toBe(401);
    expect(answer.body).toMatchObject({ error: { code: 'UNAUTHENTICATED', requestId: 'req-1' } });
  });

  it('SR-035: the token of another app is 403, even with the permission', async () => {
    const { deps } = setup();
    const run = createRouteRunner(listOrders, () => Promise.resolve({ items: [] }), deps);

    const answer = await run(request({ actor: { ...customer, app: 'seller' } }));

    expect(answer.status).toBe(403);
    expect(answer.body).toMatchObject({ error: { code: 'FORBIDDEN' } });
  });

  it('SR-032: no grant of the permission is 403', async () => {
    const { deps } = setup();
    const run = createRouteRunner(listOrders, () => Promise.resolve({ items: [] }), deps);

    expect((await run(request({ actor: actorOf([grant(orderPlace)]) }))).status).toBe(403);
  });

  it('D-185: a step-up route is 403 STEP_UP_REQUIRED until the code is fresh', async () => {
    const { deps, clock } = setup();
    const handler = vi.fn().mockResolvedValue(undefined);
    const run = createRouteRunner(switchHub, handler, deps);
    const staff = (stepUpUntil?: number): Actor =>
      actorOf([grant(hubSwitch, { type: 'hub', id: 'hub-1' })], {
        app: 'logistics-ops',
        authenticator: true,
        ...(stepUpUntil === undefined ? {} : { stepUpUntil }),
      });
    const call = (actor: Actor) => run(request({ params: { hubId: 'hub-1' }, actor }));

    const asked = await call(staff());
    expect(asked.status).toBe(403);
    expect(asked.body).toMatchObject({ error: { code: 'STEP_UP_REQUIRED' } });
    expect(handler).not.toHaveBeenCalled();

    expect((await call(staff(clock.now().getTime() + 1000))).status).toBe(204);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('SR-033: ctx.authorize is 404 for a thing outside the scope, the same as one that is not there', async () => {
    const { deps } = setup();
    const run = createRouteRunner(
      getOrder,
      (ctx) => {
        ctx.authorize({ ownerId: ctx.params.orderId === 'mine' ? 'acc-1' : 'acc-2' });
        return Promise.resolve({ orderId: ctx.params.orderId, status: 'open' });
      },
      deps,
    );

    expect((await run(request({ params: { orderId: 'mine' } }))).status).toBe(200);
    const other = await run(request({ params: { orderId: 'theirs' } }));
    expect(other.status).toBe(404);
    expect(other.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });

  it('SR-033: the handler is given the scopes of the actor, to filter by', async () => {
    const { deps } = setup();
    const seen: unknown[] = [];
    const run = createRouteRunner(
      listOrders,
      (ctx) => {
        seen.push(ctx.scopes, ctx.actor?.accountId, ctx.requestId);
        return Promise.resolve({ items: [] });
      },
      deps,
    );

    await run(request());
    expect(seen).toEqual([[{ type: 'self' }], 'acc-1', 'req-1']);
  });

  it('SR-032: a public route needs no actor, and has nothing to authorize', async () => {
    const { deps, logger } = setup();
    const scopes: unknown[] = [];
    const run = createRouteRunner(
      homePage,
      (ctx) => {
        scopes.push(ctx.scopes);
        return Promise.resolve({ banners: ['a'] });
      },
      deps,
    );
    expect((await run(request({ actor: undefined }))).body).toEqual({ banners: ['a'] });
    expect(scopes).toEqual([[]]);

    const careless = createRouteRunner(
      homePage,
      (ctx) => {
        ctx.authorize({});
        return Promise.resolve({ banners: [] });
      },
      deps,
    );
    expect((await careless(request({ actor: undefined }))).status).toBe(500);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});

describe('createRouteRunner: what comes in (SR-036, SR-007)', () => {
  it('SR-036: the query is read from its text into the types of the contract', async () => {
    const { deps } = setup();
    const seen: unknown[] = [];
    const run = createRouteRunner(
      listOrders,
      (ctx) => {
        seen.push(ctx.query);
        return Promise.resolve({ items: [] });
      },
      deps,
    );

    await run(
      request({
        query: { limit: '20', open: 'false', since: '2026-11-26T00:00:00.000Z', ids: ['1', '2'] },
      }),
    );
    expect(seen).toEqual([
      { limit: 20, open: false, since: new Date('2026-11-26T00:00:00.000Z'), ids: [1, 2] },
    ]);
  });

  it('SR-036: a field that is not named, or does not fit, is 400 with the place of each, all in one answer', async () => {
    const { deps } = setup();
    const handler = vi.fn();
    const run = createRouteRunner(placeOrder, handler, deps);

    const answer = await run(place({ addressId: 'a1', quantity: 'many', role: 'admin' }));

    expect(answer.status).toBe(400);
    expect(answer.body).toMatchObject({
      error: { code: 'VALIDATION_FAILED', requestId: 'req-1' },
    });
    const { issues } = (answer.body as { error: { details: { issues: unknown[] } } }).error.details;
    expect(issues.length).toBeGreaterThan(0);
    expect(handler).not.toHaveBeenCalled();
    expect(JSON.stringify(answer.body)).not.toContain('many');
  });

  it('SR-036: the path, the query and the body are all checked, and their issues come together', async () => {
    const { deps } = setup();
    const run = createRouteRunner(listOrders, vi.fn(), deps);

    const answer = await run(request({ query: { limit: 'x', nope: '1' } }));
    const { issues } = (answer.body as { error: { details: { issues: { path: string }[] } } }).error
      .details;

    expect(answer.status).toBe(400);
    expect(issues.map((issue) => issue.path)).toEqual(['query.limit', 'query']);
    const limit = await run(request({ query: { limit: 'x' } }));
    expect(limit.body).toMatchObject({
      error: { details: { issues: [{ path: 'query.limit', message: 'limit must be a number.' }] } },
    });
  });

  it('SR-007: an answer about a refused request is as long as its first issues, not as the request', async () => {
    const { deps } = setup();
    const run = createRouteRunner(listOrders, vi.fn(), deps);

    const answer = await run(request({ query: { ids: Array.from({ length: 5000 }, () => 'x') } }));
    const { issues } = (answer.body as { error: { details: { issues: unknown[] } } }).error.details;

    expect(issues).toHaveLength(20);
  });
});

describe('createRouteRunner: what goes out (SR-036, SR-077)', () => {
  it('SR-036: a field that the contract does not name never leaves, and the answer is a 500', async () => {
    const { deps, logger } = setup();
    const run = createRouteRunner(
      getOrder,
      (ctx) =>
        Promise.resolve({
          orderId: ctx.params.orderId,
          status: 'open',
          customerPhone: '+919876543210',
        } as never),
      deps,
    );

    const answer = await run(request({ params: { orderId: 'o1' } }));

    expect(answer.status).toBe(500);
    expect(JSON.stringify(answer.body)).not.toContain('9876543210');
    expect(answer.body).toMatchObject({
      error: { code: 'INTERNAL', message: 'Something went wrong.' },
    });
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain('9876543210');
  });

  it('SR-036: the answer is what the schema read, with the status of the contract and the request id', async () => {
    const { deps } = setup();
    const run = createRouteRunner(
      getOrder,
      (ctx) => Promise.resolve({ orderId: ctx.params.orderId, status: 'open' }),
      deps,
    );

    const answer = await run(request({ params: { orderId: 'o1' }, requestId: 'req-77' }));

    expect(answer).toEqual({
      status: 200,
      headers: { 'x-request-id': 'req-77', 'cache-control': 'private, no-store' },
      body: { orderId: 'o1', status: 'open' },
    });
  });

  it('SR-004: only a public route with a cache is cached, and an error is never cached', async () => {
    const { deps } = setup();
    let fail = false;
    const run = createRouteRunner(
      homePage,
      () => (fail ? Promise.reject(notFound()) : Promise.resolve({ banners: [] })),
      deps,
    );

    expect((await run(request({ actor: undefined }))).headers['cache-control']).toBe(
      'public, max-age=60',
    );
    fail = true;
    expect((await run(request({ actor: undefined }))).headers['cache-control']).toBe(
      'private, no-store',
    );
  });

  it('CR-18: a 204 has no body', async () => {
    const { deps } = setup();
    const run = createRouteRunner(closeOrder, () => Promise.resolve(), deps);

    const answer = await run(request({ params: { orderId: 'o1' } }));

    expect(answer.status).toBe(204);
    expect(answer.body).toBeUndefined();
  });
});

describe('createRouteRunner: errors (docs/ARCHITECTURE.md §5 rules 8 and 9)', () => {
  const closed = new AppError({
    status: 422,
    code: 'COMMERCE_ORDER_CLOSED',
    message: 'The order is closed.',
  });

  it('CR-18: an error that the contract lists answers with its own status, code and message', async () => {
    const { deps, logger } = setup();
    const run = createRouteRunner(getOrder, () => Promise.reject(closed), deps);

    const answer = await run(request({ params: { orderId: 'o1' } }));

    expect(answer.status).toBe(422);
    expect(answer.body).toEqual({
      error: {
        code: 'COMMERCE_ORDER_CLOSED',
        message: 'The order is closed.',
        details: null,
        requestId: 'req-1',
      },
    });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('CR-18: a common error may always be thrown', async () => {
    const { deps } = setup();
    const run = createRouteRunner(getOrder, () => Promise.reject(notFound()), deps);

    expect((await run(request({ params: { orderId: 'o1' } }))).status).toBe(404);
  });

  it('CR-18: an error that the contract does not list, or lists with another status, is a 500', async () => {
    const { deps, logger } = setup();
    const unlisted = new AppError({
      status: 409,
      code: 'COMMERCE_STOCK_UNAVAILABLE',
      message: 'No stock.',
    });
    const wrongStatus = new AppError({
      status: 409,
      code: 'COMMERCE_ORDER_CLOSED',
      message: 'Closed.',
    });

    for (const error of [unlisted, wrongStatus]) {
      const run = createRouteRunner(getOrder, () => Promise.reject(error), deps);
      const answer = await run(request({ params: { orderId: 'o1' } }));
      expect(answer.status).toBe(500);
      expect(answer.body).toMatchObject({ error: { code: 'INTERNAL' } });
    }
    expect(logger.error).toHaveBeenCalledTimes(2);
  });

  it('SR-077: what is not an AppError is a 500 that says nothing of itself, and is logged with its request', async () => {
    const { deps, logger } = setup();
    const boom = new Error('E11000 duplicate key { email: "a@b.in" } at db.users');
    const run = createRouteRunner(getOrder, () => Promise.reject(boom), deps);

    const answer = await run(request({ params: { orderId: 'o1' } }));

    expect(answer.status).toBe(500);
    expect(JSON.stringify(answer.body)).not.toContain('E11000');
    expect(JSON.stringify(answer.body)).not.toContain('a@b.in');
    expect(logger.error).toHaveBeenCalledWith(
      { err: boom, routeId: 'commerce.order.get', requestId: 'req-1' },
      'A route failed.',
    );
  });

  it('SR-008: a 503 or a 429 that the handler throws carries Retry-After', async () => {
    const { deps } = setup();
    const run = createRouteRunner(getOrder, () => Promise.reject(serviceUnavailable(9)), deps);

    const answer = await run(request({ params: { orderId: 'o1' } }));

    expect(answer.status).toBe(503);
    expect(answer.headers['retry-after']).toBe('9');
  });
});

describe('createRouteRunner: idempotency (AC-PLATFORM-8, SR-045)', () => {
  const placed = { orderId: 'o1', status: 'placed' };
  const outOfStock = new AppError({
    status: 409,
    code: 'COMMERCE_STOCK_UNAVAILABLE',
    message: 'No stock.',
  });

  it('AC-PLATFORM-8: a route that asks for a key and a caller refuses to boot without a store, or as a public route', () => {
    const { deps } = setup();

    expect(() =>
      createRouteRunner(placeOrder, vi.fn(), { ...deps, idempotency: undefined as never }),
    ).toThrow(
      'The route commerce.order.place asks for an idempotency key, so the kit needs an idempotency store.',
    );
    expect(() => createRouteRunner(signUp, vi.fn(), deps)).toThrow(
      'The route commerce.order.sign_up is public and asks for an idempotency key, which needs a caller.',
    );
  });

  it('AC-PLATFORM-8: no key, or a key that is not 8 to 128 safe characters, is 400, and the handler does not run', async () => {
    const { deps } = setup();
    const handler = vi.fn();
    const run = createRouteRunner(placeOrder, handler, deps);

    for (const key of [null, '', 'short', 'has space in it', 'x'.repeat(129), 'quote"quote']) {
      const answer = await run(place(order, key));
      expect(answer.status, String(key)).toBe(400);
      expect(answer.body).toMatchObject({
        error: { details: { issues: [{ path: 'headers.Idempotency-Key' }] } },
      });
    }
    expect(handler).not.toHaveBeenCalled();
    expect(
      (
        await createRouteRunner(
          placeOrder,
          () => Promise.resolve(placed),
          deps,
        )(place(order, 'a'.repeat(128)))
      ).status,
    ).toBe(201);
  });

  it('AC-PLATFORM-8: the same key and body gives the first answer, and the handler runs once', async () => {
    const { deps } = setup();
    const handler = vi.fn().mockResolvedValue(placed);
    const run = createRouteRunner(placeOrder, handler, deps);

    const first = await run(place(order));
    const second = await run(place({ quantity: 2, addressId: 'a1' }));

    expect(first.status).toBe(201);
    expect(second).toMatchObject({ status: 201, body: placed });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('AC-PLATFORM-8: another body with the same key is 422 and does not run', async () => {
    const { deps } = setup();
    const handler = vi.fn().mockResolvedValue(placed);
    const run = createRouteRunner(placeOrder, handler, deps);
    await run(place(order));

    const answer = await run(place({ addressId: 'a1', quantity: 3 }));

    expect(answer.status).toBe(422);
    expect(answer.body).toMatchObject({ error: { code: 'IDEMPOTENCY_KEY_REUSED' } });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('AC-PLATFORM-8: the same key while the first still runs is 409, and after it ends, its answer', async () => {
    const { deps } = setup();
    let finish: (value: typeof placed) => void = () => undefined;
    const handler = vi.fn(() => new Promise<typeof placed>((resolve) => (finish = resolve)));
    const run = createRouteRunner(placeOrder, handler, deps);

    const first = run(place(order));
    await vi.waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1);
    });
    const during = await run(place(order));
    finish(placed);

    expect(during.status).toBe(409);
    expect(during.body).toMatchObject({ error: { code: 'IDEMPOTENCY_IN_PROGRESS' } });
    expect((await first).status).toBe(201);
    expect(await run(place(order))).toMatchObject({ status: 201, body: placed });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('AC-PLATFORM-8: a 4xx is remembered: the same request gets the same refusal, and does not run again', async () => {
    const { deps } = setup();
    const handler = vi.fn().mockRejectedValue(outOfStock);
    const run = createRouteRunner(placeOrder, handler, deps);

    const first = await run(place(order));
    const second = await run(place(order));

    expect(first.status).toBe(409);
    expect(second).toMatchObject({ status: 409, body: first.body });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('AC-PLATFORM-8: a 5xx is not remembered: the same key can try again', async () => {
    const { deps } = setup();
    const handler = vi
      .fn()
      .mockRejectedValueOnce(new Error('the database went away'))
      .mockResolvedValue(placed);
    const run = createRouteRunner(placeOrder, handler, deps);

    expect((await run(place(order))).status).toBe(500);
    expect((await run(place(order))).status).toBe(201);
    expect((await run(place(order))).status).toBe(201);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('AC-PLATFORM-8: a record is kept about 48 hours', async () => {
    const { deps, clock } = setup();
    const handler = vi.fn().mockResolvedValue(placed);
    const run = createRouteRunner(placeOrder, handler, deps);
    await run(place(order));

    clock.advance(IDEMPOTENCY_TTL_MS - 1);
    expect((await run(place({ ...order, quantity: 3 }))).status).toBe(422);
    clock.advance(1);
    expect((await run(place({ ...order, quantity: 3 }))).status).toBe(201);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('SR-045: the key is of the caller: another account with the same key is another request', async () => {
    const { deps } = setup();
    const handler = vi.fn().mockResolvedValue(placed);
    const run = createRouteRunner(placeOrder, handler, deps);
    const other = { ...customer, accountId: 'acc-2' };

    await run(place(order));
    const answer = await run(place(order, 'key-00001', other));

    expect(answer.status).toBe(201);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('SR-045: a request that is refused for who it is or what it holds does not use the key', async () => {
    const { deps, idempotency } = setup();
    const begin = vi.spyOn(idempotency, 'begin');
    const run = createRouteRunner(placeOrder, vi.fn().mockResolvedValue(placed), deps);

    expect((await run(place(order, 'key-00001', { ...customer, app: 'seller' }))).status).toBe(403);
    expect((await run({ ...place(order), actor: undefined })).status).toBe(401);
    expect((await run(place({ addressId: 'a1' }))).status).toBe(400);
    expect(begin).not.toHaveBeenCalled();
    // And the key still works for the right request.
    expect((await run(place(order))).status).toBe(201);
  });

  it('SR-045: when the store cannot say whether it has run, the request does not run: 503', async () => {
    const { deps, logger } = setup();
    const broken: IdempotencyStore = {
      begin: () => Promise.reject(new Error('mongo is out of reach')),
      complete: () => Promise.resolve(),
      release: () => Promise.resolve(),
    };
    const handler = vi.fn().mockResolvedValue(placed);
    const run = createRouteRunner(placeOrder, handler, { ...deps, idempotency: broken });

    const answer = await run(place(order));

    expect(answer.status).toBe(503);
    expect(answer.headers['retry-after']).toBe('5');
    expect(handler).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('SR-045: when the store cannot keep the answer, the answer is still sent', async () => {
    const { deps, logger } = setup();
    const memory = createMemoryIdempotencyStore();
    const failing: IdempotencyStore = {
      begin: (...args) => memory.begin(...args),
      complete: () => Promise.reject(new Error('mongo is out of reach')),
      release: () => Promise.reject(new Error('mongo is out of reach')),
    };
    const handler = vi.fn().mockResolvedValueOnce(placed).mockRejectedValueOnce(new Error('boom'));
    const run = createRouteRunner(placeOrder, handler, { ...deps, idempotency: failing });

    expect((await run(place(order, 'key-00001'))).status).toBe(201);
    expect((await run(place(order, 'key-00002'))).status).toBe(500);
    expect(logger.error).toHaveBeenCalledTimes(3);
  });
});
