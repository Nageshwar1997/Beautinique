import { describe, expect, expectTypeOf, it } from 'vitest';
import { array, boolean, strictObject, string, unknown } from 'zod';

import {
  ApiError,
  buildRequest,
  createClient,
  defineRoute,
  IDEMPOTENCY_HEADER,
  type ClientRequest,
  type ClientResponse,
} from '../src/index.ts';
import {
  approvePayoutBatch,
  catalogHome,
  getOrder,
  myOrders,
  orderRead,
  placeOrder,
} from './utils/sample-contracts.ts';

const validOrder = { addressId: 'a1', items: [{ variantId: 'v1', quantity: 2 }] };

const search = defineRoute({
  id: 'catalog.product.search',
  method: 'GET',
  path: '/api/v1/catalog/products',
  summary: 'Search products',
  apps: ['customer'],
  permission: 'public',
  rateLimit: 'search-public',
  query: {
    q: string('q must be text.').optional(),
    tags: array(string('A tag must be text.'), 'tags must be a list.').optional(),
    inStock: boolean('inStock must be true or false.').optional(),
  },
  response: strictObject(
    { ids: array(string('An id must be text.'), 'ids must be a list.') },
    'The answer has ids only.',
  ),
});

describe('buildRequest', () => {
  it('AC-PLATFORM-15: writes the path parts into the URL, encoded', () => {
    expect(buildRequest(getOrder, { params: { orderId: '66f0' } })).toEqual({
      method: 'GET',
      url: '/api/v1/commerce/orders/66f0',
      headers: {},
    });
    expect(buildRequest(getOrder, { params: { orderId: 'a/b c?d' } }).url).toBe(
      '/api/v1/commerce/orders/a%2Fb%20c%3Fd',
    );
  });

  it('AC-PLATFORM-15: writes the query in the order of its keys, and leaves out what is missing', () => {
    expect(buildRequest(myOrders, { query: { limit: 5, cursor: 'c1' } }).url).toBe(
      '/api/v1/commerce/orders/mine?cursor=c1&limit=5',
    );
    expect(buildRequest(myOrders, { query: {} }).url).toBe('/api/v1/commerce/orders/mine');
    expect(buildRequest(myOrders).url).toBe('/api/v1/commerce/orders/mine');
    expect(buildRequest(catalogHome).url).toBe('/api/v1/catalog/home');
  });

  it('AC-PLATFORM-15: writes a list as a repeated key, and a text, a boolean and a number as they are', () => {
    expect(
      buildRequest(search, { query: { q: 'lip stick', tags: ['a&b', 'c'], inStock: true } }).url,
    ).toBe('/api/v1/catalog/products?inStock=true&q=lip%20stick&tags=a%26b&tags=c');
  });

  it('AC-PLATFORM-15: writes the body as JSON, with its header', () => {
    const request = buildRequest(placeOrder, { body: validOrder }, { idempotencyKey: 'k1' });

    expect(request).toEqual({
      method: 'POST',
      url: '/api/v1/commerce/orders',
      headers: { [IDEMPOTENCY_HEADER]: 'k1', 'Content-Type': 'application/json' },
      body: JSON.stringify(validOrder),
    });
    expect(IDEMPOTENCY_HEADER).toBe('Idempotency-Key');
  });

  it('SR-045: a route that needs an idempotency key is not sent without one', () => {
    expect(() => buildRequest(placeOrder, { body: validOrder })).toThrow(
      'needs an idempotency key',
    );
    expect(() => buildRequest(placeOrder, { body: validOrder }, { idempotencyKey: '' })).toThrow(
      'needs an idempotency key',
    );
    expect(
      buildRequest(getOrder, { params: { orderId: '1' } }, { idempotencyKey: 'k' }).headers,
    ).toEqual({});
  });

  it('SR-036: an input that the contract does not take stops here', () => {
    const idempotencyKey = 'k1';
    expect(() => buildRequest(getOrder, { params: {} })).toThrow();
    expect(() => buildRequest(getOrder, { params: { orderId: '1', extra: 'x' } })).toThrow();
    expect(() => buildRequest(getOrder)).toThrow();
    expect(() =>
      buildRequest(placeOrder, { body: { ...validOrder, role: 'admin' } }, { idempotencyKey }),
    ).toThrow();
    expect(() =>
      buildRequest(
        placeOrder,
        { body: { addressId: 'a', items: [{ variantId: 'v', quantity: 0 }] } },
        { idempotencyKey },
      ),
    ).toThrow();
    expect(() => buildRequest(placeOrder, {}, { idempotencyKey })).toThrow();
    expect(() => buildRequest(myOrders, { query: { limit: 1000 } })).toThrow();
  });

  it('AC-PLATFORM-15: a query value that is not text, a number, a boolean or a date is refused', () => {
    const odd = defineRoute({
      id: 'catalog.product.filter',
      method: 'GET',
      path: '/api/v1/catalog/filter',
      summary: 'Filter',
      apps: ['customer'],
      permission: 'public',
      rateLimit: 'read',
      query: { when: unknown(), filter: unknown() },
      response: strictObject(
        { ok: boolean('ok must be true or false.') },
        'The answer has ok only.',
      ),
    });

    expect(
      buildRequest(odd, { query: { when: new Date('2026-11-26T09:00:00.000Z'), filter: null } })
        .url,
    ).toBe('/api/v1/catalog/filter?when=2026-11-26T09%3A00%3A00.000Z');
    expect(() => buildRequest(odd, { query: { when: 1, filter: { a: 1 } } })).toThrow(
      'query is text',
    );
  });
});

function transportOf(response: ClientResponse) {
  const sent: ClientRequest[] = [];
  const transport = (request: ClientRequest) => {
    sent.push(request);
    return Promise.resolve(response);
  };
  return { sent, transport };
}

describe('createClient', () => {
  const order = { orderId: 'o1', status: 'placed' };

  it('AC-PLATFORM-15: one function per route, which sends the request and gives the checked answer', async () => {
    const { sent, transport } = transportOf({ status: 200, body: order });
    const client = createClient({ getOrder, myOrders }, transport);

    await expect(client.getOrder({ params: { orderId: 'o1' } })).resolves.toEqual(order);
    expect(sent).toEqual([{ method: 'GET', url: '/api/v1/commerce/orders/o1', headers: {} }]);
  });

  it('AC-PLATFORM-15: the idempotency key goes with the options', async () => {
    const { sent, transport } = transportOf({ status: 201, body: order });
    const client = createClient({ placeOrder }, transport);

    await client.placeOrder({ body: validOrder }, { idempotencyKey: 'k9' });
    expect(sent[0]?.headers[IDEMPOTENCY_HEADER]).toBe('k9');
    await expect(client.placeOrder({ body: validOrder })).rejects.toThrow(
      'needs an idempotency key',
    );
  });

  it('AC-PLATFORM-15: a 204 gives nothing', async () => {
    const { transport } = transportOf({ status: 204, body: undefined });
    const client = createClient({ approvePayoutBatch }, transport);

    await expect(
      client.approvePayoutBatch(
        { params: { batchId: 'b1' }, body: { confirm: true } },
        { idempotencyKey: 'k' },
      ),
    ).resolves.toBeUndefined();
  });

  it('CR-18: an error answer becomes an ApiError with the code, the status and the request id', async () => {
    const { transport } = transportOf({
      status: 409,
      body: {
        error: {
          code: 'COMMERCE_STOCK_UNAVAILABLE',
          message: 'Out of stock.',
          details: { variantId: 'v1' },
          requestId: 'req_7',
        },
      },
    });
    const client = createClient({ placeOrder }, transport);

    const error = await client
      .placeOrder({ body: validOrder }, { idempotencyKey: 'k' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'COMMERCE_STOCK_UNAVAILABLE',
      message: 'Out of stock.',
      details: { variantId: 'v1' },
      requestId: 'req_7',
    });
  });

  it('CR-18: an error answer that is not in the one shape is an INTERNAL ApiError, with nothing of the body', async () => {
    const { transport } = transportOf({ status: 502, body: '<html>Bad gateway</html>' });
    const client = createClient({ getOrder }, transport);

    const error = await client.getOrder({ params: { orderId: 'o1' } }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 502,
      code: 'INTERNAL',
      requestId: undefined,
      details: undefined,
    });
    expect((error as ApiError).message).not.toContain('html');
  });

  it('CR-12: a success that is not what the contract says is refused', async () => {
    const { transport } = transportOf({ status: 200, body: { orderId: 'o1' } });
    const client = createClient({ getOrder }, transport);

    await expect(client.getOrder({ params: { orderId: 'o1' } })).rejects.toThrow();
  });

  it('AC-PLATFORM-15: a wrong input never reaches the transport', async () => {
    const { sent, transport } = transportOf({ status: 200, body: order });
    const client = createClient({ getOrder }, transport);

    await expect(client.getOrder({ params: {} } as never)).rejects.toThrow();
    expect(sent).toEqual([]);
  });

  it('AC-PLATFORM-15: the client is made once and cannot be changed', () => {
    const client = createClient({ getOrder }, () => Promise.resolve({ status: 200, body: order }));

    expect(Object.isFrozen(client)).toBe(true);
    expect(Object.keys(client)).toEqual(['getOrder']);
  });
});

describe('the types of the client', () => {
  const client = createClient({ getOrder, myOrders, placeOrder, catalogHome, search }, () =>
    Promise.resolve({ status: 200, body: undefined }),
  );

  it('AC-PLATFORM-15: take the input and give the answer as the contract says, without a cast', () => {
    expectTypeOf(client.getOrder).toBeCallableWith({ params: { orderId: '1' } });
    expectTypeOf(client.placeOrder).toBeCallableWith({ body: validOrder }, { idempotencyKey: 'k' });
    expectTypeOf(client.getOrder).returns.resolves.toEqualTypeOf<{
      orderId: string;
      status: string;
    }>();
    expectTypeOf(client.catalogHome).returns.resolves.toEqualTypeOf<{ banners: string[] }>();
    expectTypeOf(client.search).returns.resolves.toEqualTypeOf<{ ids: string[] }>();
  });

  it('AC-PLATFORM-15: a route with no part, or whose parts may all be left out, is called without an input', () => {
    expectTypeOf(client.catalogHome).toBeCallableWith();
    expectTypeOf(client.myOrders).toBeCallableWith();
    expectTypeOf(client.myOrders).toBeCallableWith({ query: { limit: 5 } });
    expectTypeOf(client.search).toBeCallableWith();
    expectTypeOf(client.search).toBeCallableWith({ query: { tags: ['a'], inStock: true } });
  });

  it('SR-036: a call that the contract does not allow does not compile', () => {
    // @ts-expect-error getOrder needs its params
    expect(() => client.getOrder()).toBeDefined();
    // @ts-expect-error a part that the route does not have
    expect(() => client.getOrder({ params: { orderId: '1' }, body: {} })).toBeDefined();
    // @ts-expect-error orderId is text
    expect(() => client.getOrder({ params: { orderId: 1 } })).toBeDefined();
    // @ts-expect-error the route has no such field
    expect(() => client.placeOrder({ body: { ...validOrder, role: 'admin' } })).toBeDefined();
    // @ts-expect-error placeOrder needs its body
    expect(() => client.placeOrder()).toBeDefined();
    // @ts-expect-error a query field that the route does not have
    expect(() => client.myOrders({ query: { page: 2 } })).toBeDefined();
    expect(orderRead.name).toBe('commerce.order.read');
  });
});
