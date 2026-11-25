import { describe, expect, it } from 'vitest';
import { string, strictObject, undefined as nothing } from 'zod';

import { defineRoute, pathParamNames } from '../src/index.ts';
import {
  approvePayoutBatch,
  catalogHome,
  getOrder,
  orderRead,
  placeOrder,
} from './utils/sample-contracts.ts';

// A right route to start from; each test changes one thing and expects the refusal.
const base = {
  id: 'commerce.order.get',
  method: 'GET',
  path: '/api/v1/commerce/orders/:orderId',
  summary: 'Read an order',
  apps: ['customer'],
  permission: orderRead,
  rateLimit: 'read',
  params: { orderId: string() },
  response: strictObject({ orderId: string() }),
};

function refused(change: Record<string, unknown>): string {
  try {
    defineRoute({ ...base, ...change } as never);
  } catch (error) {
    return error instanceof RangeError ? error.message : 'not a RangeError';
  }
  return 'accepted';
}

describe('defineRoute: what a route is', () => {
  it('CR-12: keeps the whole contract in one place, with the service taken from the id', () => {
    expect(getOrder).toMatchObject({
      id: 'commerce.order.get',
      service: 'commerce',
      method: 'GET',
      path: '/api/v1/commerce/orders/:orderId',
      apps: ['customer', 'seller'],
      rateLimit: 'read',
      idempotency: 'none',
      status: 200,
      stepUp: false,
      cache: undefined,
      errors: {},
    });
    expect(getOrder.permission).toBe(orderRead);
    expect(getOrder.body).toBeUndefined();
    expect(Object.isFrozen(getOrder)).toBe(true);
  });

  it("SR-032: the step-up is the permission's, and a public route has none", () => {
    expect(approvePayoutBatch.stepUp).toBe(true);
    expect(placeOrder.stepUp).toBe(false);
    expect(catalogHome.stepUp).toBe(false);
    expect(catalogHome.permission).toBe('public');
  });

  it('SR-036: an unknown field in the params, the query or the body is refused', () => {
    expect(
      placeOrder.body.safeParse({ addressId: 'a', items: [{ variantId: 'v', quantity: 1 }] })
        .success,
    ).toBe(true);
    const withRole = { addressId: 'a', items: [{ variantId: 'v', quantity: 1 }], role: 'admin' };
    expect(placeOrder.body.safeParse(withRole).success).toBe(false);
    expect(getOrder.params.safeParse({ orderId: '1', extra: 1 }).success).toBe(false);
  });

  it('CR-12: a 204 route takes a response that has no body', () => {
    expect(approvePayoutBatch.status).toBe(204);
    expect(approvePayoutBatch.response.safeParse(undefined).success).toBe(true);
  });

  it('CR-12: a public GET can have a cache', () => {
    expect(catalogHome.cache).toEqual({ maxAgeSeconds: 60 });
  });
});

describe('defineRoute: what it refuses', () => {
  it('CR-12: an id or a path that does not follow the form, or a path of another service', () => {
    expect(refused({ id: 'order.get' })).toContain('<service>.<resource>.<action>');
    expect(refused({ id: 'shop.order.get' })).toContain('<service>.<resource>.<action>');
    expect(refused({ path: '/orders/:orderId' })).toContain('not /api/v1/commerce/');
    expect(refused({ path: '/api/v1/commerce/Orders/:orderId' })).toContain('lowercase');
    expect(refused({ path: '/api/v1/catalog/orders/:orderId' })).toContain('not /api/v1/commerce/');
    expect(refused({ path: '/api/v1/commerce' })).toContain('not /api/v1/commerce/');
  });

  it('CR-12: the :name parts of the path and the params must be the same', () => {
    expect(refused({ params: undefined })).toContain('(orderId) and the params ()');
    expect(refused({ params: { orderId: string(), extra: string() } })).toContain(
      '(orderId) and the params (extra, orderId)',
    );
    expect(refused({ params: { id: string() } })).toContain('(orderId) and the params (id)');
  });

  it('CR-12: an app named twice', () => {
    expect(refused({ apps: ['customer', 'customer'] })).toContain('names an app twice');
  });

  it('SR-045, CR-12: a GET with a body or with an idempotency key', () => {
    expect(refused({ body: { note: string() } })).toContain('GET with a body');
    expect(refused({ idempotency: 'required' })).toContain('GET with an idempotency key');
    expect(refused({ idempotency: 'none' })).toBe('accepted');
  });

  it('CR-12: a cache only on a public GET, for a whole number of seconds from 1', () => {
    expect(refused({ cache: { maxAgeSeconds: 60 } })).toContain('only a public GET');
    const publicGet = {
      id: 'catalog.home.get',
      path: '/api/v1/catalog/home',
      permission: 'public',
      params: undefined,
    };
    expect(refused({ ...publicGet, cache: { maxAgeSeconds: 60 } })).toBe('accepted');
    expect(refused({ ...publicGet, cache: { maxAgeSeconds: 0 } })).toContain('from 1');
    expect(refused({ ...publicGet, cache: { maxAgeSeconds: 1.5 } })).toContain('from 1');
    expect(refused({ ...publicGet, method: 'POST', cache: { maxAgeSeconds: 60 } })).toContain(
      'only a public GET',
    );
  });

  it('CR-12: a 204 whose response needs a body', () => {
    expect(refused({ status: 204 })).toContain('answers 204');
    expect(refused({ status: 204, response: nothing() })).toBe('accepted');
  });
});

describe('pathParamNames', () => {
  it('CR-12: gives the :name parts in order', () => {
    expect(pathParamNames('/api/v1/commerce/orders/:orderId/lines/:lineId')).toEqual([
      'orderId',
      'lineId',
    ]);
    expect(pathParamNames('/api/v1/commerce/orders')).toEqual([]);
  });
});
