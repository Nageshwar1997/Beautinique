import type { AddressInfo } from 'node:net';
import { connect } from 'node:net';
import type { Server } from 'node:http';

import { createFakeClock } from '@beautinique/shared-clock';
import {
  ApiError,
  createClient,
  type ClientRequest,
  type ClientResponse,
} from '@beautinique/shared-contracts';
import express from 'express';
import { strictObject, string } from 'zod';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { Actor } from '../src/actor.ts';
import { AppError, notFound } from '../src/errors.ts';
import { createServerKit, JSON_BODY_LIMIT_BYTES } from '../src/express.ts';
import { createFacadeClient, defineFacade, signedHttpTransport } from '../src/facade.ts';
import { createMemoryIdempotencyStore } from '../src/idempotency.ts';
import { createVerifier, type SigningKey } from '../src/signing.ts';
import {
  actorOf,
  closeOrder,
  getOrder,
  grant,
  homePage,
  listOrders,
  NOW,
  orderPlace,
  orderRead,
  placeOrder,
} from './utils/fixtures.ts';

const accounts: Record<string, Actor> = {
  'token-1': actorOf([grant(orderRead), grant(orderPlace)]),
  'token-2': actorOf([grant(orderRead), grant(orderPlace)], { accountId: 'acc-2' }),
};

const logger = { error: vi.fn() };
const seenQueries: unknown[] = [];
const closed: string[] = [];
const placed: string[] = [];

const kit = createServerKit({
  clock: createFakeClock(NOW),
  logger,
  idempotency: createMemoryIdempotencyStore(),
  actorOf: (request) => {
    const token = request.get('authorization');
    if (token === 'explode') throw new Error('the session store is out of reach');
    return token === undefined ? undefined : accounts[token];
  },
});

const commerceRoutes = [
  kit.route(getOrder, (ctx) => {
    ctx.authorize({ ownerId: ctx.params.orderId.startsWith('acc-2') ? 'acc-2' : 'acc-1' });
    return Promise.resolve({ orderId: ctx.params.orderId, status: 'open' });
  }),
  kit.route(listOrders, (ctx) => {
    seenQueries.push(ctx.query);
    return Promise.resolve({ items: [] });
  }),
  kit.route(placeOrder, (ctx) => {
    if (ctx.body.quantity > 5) {
      return Promise.reject(
        new AppError({
          status: 409,
          code: 'COMMERCE_STOCK_UNAVAILABLE',
          message: 'There is not enough stock.',
        }),
      );
    }
    placed.push(ctx.body.addressId);
    return Promise.resolve({ orderId: `order-${String(placed.length)}`, status: 'placed' });
  }),
  kit.route(closeOrder, (ctx) => {
    closed.push(ctx.params.orderId);
    return Promise.resolve();
  }),
];

// The facade of commerce, served in split mode.
const key: SigningKey = { id: 'k1', secret: 'a-test-secret-of-the-test-only' };
const commerceFacade = defineFacade('commerce', {
  getOrder: {
    input: strictObject(
      { orderId: string('orderId is required.') },
      'The input takes orderId only.',
    ),
    output: strictObject({ status: string('status is required.') }, 'The answer has status only.'),
  },
});

let server: Server;
let base = '';

beforeAll(async () => {
  const app = express();
  app.use(kit.router('commerce', commerceRoutes));
  app.use(
    kit.router('catalog', [kit.route(homePage, () => Promise.resolve({ banners: ['spring'] }))]),
  );
  app.use(
    kit.facadeRouter(
      commerceFacade,
      {
        getOrder: (input) =>
          input.orderId === 'gone'
            ? Promise.reject(notFound())
            : Promise.resolve({ status: 'open' }),
      },
      { verifier: createVerifier([key], createFakeClock(NOW)), logger },
    ),
  );
  app.use((request, response) => {
    kit.notFound(request, response);
  });
  server = await new Promise<Server>((resolve) => {
    const started = app.listen(0, '127.0.0.1', () => {
      resolve(started);
    });
  });
  base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

// `null` is no session at all.
const call = (
  path: string,
  init: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> } = {},
  token: string | null = 'token-1',
) =>
  fetch(`${base}${path}`, {
    ...init,
    headers: { ...(token === null ? {} : { authorization: token }), ...init.headers },
  });

describe('the router of a service (AC-PLATFORM-15, SR-032)', () => {
  it('SR-032: a route answers JSON with the request id, and its own thing is its owner’s', async () => {
    const answer = await call('/api/v1/commerce/orders/o-1', {
      headers: { 'x-request-id': 'req-77' },
    });

    expect(answer.status).toBe(200);
    expect(await answer.json()).toEqual({ orderId: 'o-1', status: 'open' });
    expect(answer.headers.get('x-request-id')).toBe('req-77');
    expect(answer.headers.get('cache-control')).toBe('private, no-store');
    expect(answer.headers.get('content-type')).toMatch(/application\/json/);
  });

  it('SR-033: a thing of another customer is 404, the same body as a thing that is not there', async () => {
    const theirs = await call('/api/v1/commerce/orders/acc-2-order');
    const nowhere = await call('/api/v1/commerce/nowhere');

    expect(theirs.status).toBe(404);
    const body = (await theirs.json()) as { error: { code: string; message: string } };
    const absent = (await nowhere.json()) as { error: { code: string; message: string } };
    expect(body.error).toMatchObject({ code: 'NOT_FOUND', message: absent.error.message });
  });

  it('SR-032: no session is 401 and a session that cannot be checked is 503, not 401 (SR-031)', async () => {
    const none = await call('/api/v1/commerce/orders/o-1', {}, null);
    const broken = await call('/api/v1/commerce/orders/o-1', {}, 'explode');

    expect(none.status).toBe(401);
    expect(broken.status).toBe(503);
    expect(broken.headers.get('retry-after')).toBe('5');
    expect(await broken.json()).toMatchObject({ error: { code: 'SERVICE_UNAVAILABLE' } });
  });

  it('SR-004: a public route needs no session, and is cached for its time', async () => {
    const answer = await call('/api/v1/catalog/home', {}, null);

    expect(answer.status).toBe(200);
    expect(answer.headers.get('cache-control')).toBe('public, max-age=60');
    expect(answer.headers.get('set-cookie')).toBeNull();
  });

  it('CR-12: what no contract names is 404 in the one shape, and a path is exact', async () => {
    for (const path of [
      '/api/v1/commerce/orders/',
      '/API/v1/commerce/orders',
      '/api/v1/commerce/orders/o-1/lines',
      '/api/v1/commerce/carts',
      '/',
    ]) {
      const answer = await call(path);
      expect(answer.status, path).toBe(404);
      expect(await answer.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
    }
    expect((await call('/api/v1/commerce/orders/o-1', { method: 'DELETE' })).status).toBe(404);
  });

  it('SR-077: a request id from outside is kept only when it is safe', async () => {
    const answer = await call('/api/v1/commerce/orders/o-1', {
      headers: { 'x-request-id': 'a b\tc' },
    });

    expect(answer.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('the typed client of the contracts against the kit (AC-PLATFORM-15, SR-036, SR-045)', () => {
  const transport = async (request: ClientRequest): Promise<ClientResponse> => {
    const answer = await fetch(`${base}${request.url}`, {
      method: request.method,
      headers: { authorization: 'token-1', ...request.headers },
      ...(request.body === undefined ? {} : { body: request.body }),
    });
    const text = await answer.text();
    return { status: answer.status, body: text === '' ? undefined : (JSON.parse(text) as unknown) };
  };
  const client = createClient({ getOrder, listOrders, placeOrder, closeOrder }, transport);

  it('SR-036: a number, a boolean, a date and a list of the query come to the handler as they were sent', async () => {
    seenQueries.length = 0;
    const since = new Date('2026-11-26T04:30:00.000Z');

    await client.listOrders({
      query: { limit: 20, open: true, since, ids: [3, 1, 2], cursor: 'c 1&x=y' },
    });

    expect(seenQueries).toEqual([
      { limit: 20, open: true, since, ids: [3, 1, 2], cursor: 'c 1&x=y' },
    ]);
  });

  it('SR-036: a list of one item in the query comes to the handler as a list', async () => {
    seenQueries.length = 0;

    await client.listOrders({ query: { ids: [7] } });

    expect(seenQueries).toEqual([{ ids: [7] }]);
  });

  it('SR-036: a path part with characters that need escaping comes back as it was', async () => {
    await expect(client.getOrder({ params: { orderId: 'o 1/é' } })).resolves.toEqual({
      orderId: 'o 1/é',
      status: 'open',
    });
  });

  it('SR-045: the same idempotency key and body gives the first order, a new key a new one', async () => {
    placed.length = 0;
    const body = { addressId: 'a1', quantity: 2 };

    const first = await client.placeOrder({ body }, { idempotencyKey: 'key-round-1' });
    const again = await client.placeOrder({ body }, { idempotencyKey: 'key-round-1' });
    const other = await client.placeOrder({ body }, { idempotencyKey: 'key-round-2' });

    expect(again).toEqual(first);
    expect(other).not.toEqual(first);
    expect(placed).toHaveLength(2);
  });

  it('SR-045: another body with the key is a 422 that the client reads as an ApiError', async () => {
    await client.placeOrder(
      { body: { addressId: 'a1', quantity: 1 } },
      { idempotencyKey: 'key-round-3' },
    );

    const error = await client
      .placeOrder({ body: { addressId: 'a1', quantity: 2 } }, { idempotencyKey: 'key-round-3' })
      .catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 422, code: 'IDEMPOTENCY_KEY_REUSED' });
  });

  it('CR-18: an error of the route is an ApiError with its code and message, and the request id', async () => {
    const error = (await client
      .placeOrder({ body: { addressId: 'a1', quantity: 9 } }, { idempotencyKey: 'key-round-4' })
      .catch((thrown: unknown) => thrown)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      code: 'COMMERCE_STOCK_UNAVAILABLE',
      message: 'There is not enough stock.',
    });
    expect(error.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('CR-18: a route that answers 204 gives nothing', async () => {
    closed.length = 0;

    await expect(client.closeOrder({ params: { orderId: 'o-9' } })).resolves.toBeUndefined();
    expect(closed).toEqual(['o-9']);
  });
});

describe('the body (SR-007, SR-036)', () => {
  const post = (body: string, type = 'application/json', key = 'key-body-01') =>
    call('/api/v1/commerce/orders', {
      method: 'POST',
      headers: { 'content-type': type, 'idempotency-key': key },
      body,
    });

  it('SR-007: a JSON body over 100 KB is 413', async () => {
    const big = JSON.stringify({ addressId: 'x'.repeat(JSON_BODY_LIMIT_BYTES), quantity: 1 });

    const answer = await post(big);

    expect(answer.status).toBe(413);
    expect(await answer.json()).toMatchObject({ error: { code: 'PAYLOAD_TOO_LARGE' } });
  });

  it('SR-036: a body that is not JSON, or is not sent as JSON, is 400, and says nothing of what it held', async () => {
    const broken = await post('{"addressId": "a1", secret-token-777');
    const plain = await post('{"addressId":"a1","quantity":1}', 'text/plain');
    const array = await post('[1,2,3]');

    for (const answer of [broken, plain, array]) expect(answer.status).toBe(400);
    expect(JSON.stringify(await broken.json())).not.toContain('secret-token-777');
    expect(await plain.json()).toMatchObject({ error: { code: 'VALIDATION_FAILED' } });
  });

  it('SR-036: a body in a charset that is not UTF-8 is 400', async () => {
    const answer = await post(
      '{"addressId":"a1","quantity":1}',
      'application/json; charset=utf-16',
    );

    expect(answer.status).toBe(400);
  });

  it('SR-036: a request that is cut off in the middle of its body does not crash the service', async () => {
    logger.error.mockClear();
    await new Promise<void>((resolve) => {
      const socket = connect(Number(new URL(base).port), '127.0.0.1', () => {
        socket.write(
          'POST /api/v1/commerce/orders HTTP/1.1\r\nHost: x\r\nContent-Type: application/json\r\nContent-Length: 500\r\n\r\n{"a"',
        );
        socket.end();
        resolve();
      });
    });

    await vi.waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ err: expect.anything() as unknown }),
        'A request failed before its route.',
      );
    });
    expect((await call('/api/v1/commerce/orders/o-1')).status).toBe(200);
  });
});

describe('createServerKit: the routes of a service are checked when it boots (CR-12)', () => {
  it('CR-12: a route of another service, two with one id, and two at one place are refused', () => {
    const home = kit.route(homePage, () => Promise.resolve({ banners: [] }));
    const order = kit.route(getOrder, () => Promise.resolve({ orderId: 'x', status: 'y' }));

    expect(() => kit.router('commerce', [home])).toThrow(
      'The route catalog.home.get is of catalog, not of commerce.',
    );
    expect(() => kit.router('commerce', [order, order])).toThrow(
      'Two routes have the id commerce.order.get.',
    );
    const sameOrder = kit.route(
      { ...getOrder, id: 'commerce.order.read_again', path: '/api/v1/commerce/orders/:id' },
      () => Promise.resolve({ orderId: 'x', status: 'y' }),
    );
    expect(() => kit.router('commerce', [order, sameOrder])).toThrow(
      'Two routes are at GET /api/v1/commerce/orders/:.',
    );
  });
});

describe('the facade in split mode, over real HTTP (SR-071)', () => {
  const send = (path: string, init: RequestInit) => fetch(`${base}${path}`, init);
  const clientOf = (secret: string) =>
    createFacadeClient(
      commerceFacade,
      signedHttpTransport({
        baseUrl: base,
        key: { id: 'k1', secret },
        clock: createFakeClock(NOW),
      }),
    );
  const context = { actor: actorOf([grant(orderRead)]), requestId: 'req-1' };

  it('SR-071: a signed call is answered, and an error of the owner is the same AppError', async () => {
    const client = clientOf('a-test-secret-of-the-test-only');

    await expect(client.getOrder({ orderId: 'o1' }, context)).resolves.toEqual({ status: 'open' });
    await expect(client.getOrder({ orderId: 'gone' }, context)).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });

  it('SR-071: a call signed with another secret is 401', async () => {
    await expect(
      clientOf('another-secret').getOrder({ orderId: 'o1' }, context),
    ).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    });
  });

  it('SR-007: a call that is too big, or is not JSON, is turned away before it is read', async () => {
    const big = await send('/internal/commerce/getOrder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input: 'x'.repeat(300 * 1024) }),
    });
    const plain = await send('/internal/commerce/getOrder', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'hello',
    });

    expect(big.status).toBe(413);
    expect(plain.status).toBe(401);
  });
});
