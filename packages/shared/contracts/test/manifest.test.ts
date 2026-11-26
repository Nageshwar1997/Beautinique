import { describe, expect, it } from 'vitest';
import { string, strictObject } from 'zod';

import { buildRouteManifest, defineRoute, matchRoute, uncontractedRoutes } from '../src/index.ts';
import {
  allSampleRoutes,
  approvePayoutBatch,
  catalogHome,
  getOrder,
  myOrders,
  orderRead,
  placeOrder,
} from './utils/sample-contracts.ts';

const manifest = buildRouteManifest(allSampleRoutes);

describe('buildRouteManifest', () => {
  it('AC-PLATFORM-15, SR-035: gives each route its apps, permission and rate limit class, sorted by path and method', () => {
    expect(manifest.map((entry) => `${entry.method} ${entry.path}`)).toEqual([
      'GET /api/v1/catalog/home',
      'POST /api/v1/commerce/orders',
      'GET /api/v1/commerce/orders/:orderId',
      'GET /api/v1/commerce/orders/mine',
      'POST /api/v1/finance/payout-batches/:batchId/approve',
    ]);
    expect(manifest.find((entry) => entry.id === 'commerce.order.get')).toEqual({
      id: 'commerce.order.get',
      service: 'commerce',
      method: 'GET',
      path: '/api/v1/commerce/orders/:orderId',
      apps: ['customer', 'seller'],
      permission: 'commerce.order.read',
      stepUp: false,
      rateLimit: 'read',
      failClosed: false,
      idempotency: 'none',
      cacheMaxAgeSeconds: null,
    });
  });

  it('SR-032: a public route has no permission, and its cache is kept', () => {
    const home = manifest.find((entry) => entry.id === 'catalog.home.get');
    expect(home).toMatchObject({ permission: null, cacheMaxAgeSeconds: 60 });
  });

  it('SR-008, SR-045: the step-up, the idempotency and fail-closed come from the contract', () => {
    const approve = manifest.find((entry) => entry.id === 'finance.payout_batch.approve');
    expect(approve).toMatchObject({ stepUp: true, idempotency: 'required', failClosed: false });
    const place = manifest.find((entry) => entry.id === 'commerce.order.place');
    expect(place).toMatchObject({ idempotency: 'required', rateLimit: 'place-order' });

    const signIn = defineRoute({
      id: 'identity.session.create',
      method: 'POST',
      path: '/api/v1/identity/sessions',
      summary: 'Sign in',
      apps: ['customer'],
      permission: 'public',
      rateLimit: 'sign-in',
      body: { email: string('email is required.') },
      response: strictObject({ ok: string('ok is required.') }, 'The answer has ok only.'),
    });
    expect(buildRouteManifest([signIn])[0]?.failClosed).toBe(true);
  });

  it('AC-PLATFORM-15: the same routes in any order give the same manifest', () => {
    expect(buildRouteManifest([...allSampleRoutes].reverse())).toEqual(manifest);
  });

  it('AC-PLATFORM-15: is plain JSON', () => {
    expect(JSON.parse(JSON.stringify(manifest))).toEqual(manifest);
  });

  it('CR-12: refuses two routes with one id', () => {
    expect(() => buildRouteManifest([getOrder, getOrder])).toThrow(
      'Two routes have the id commerce.order.get',
    );
  });

  it('CR-12: refuses two routes at one place, whatever the :name', () => {
    const sameOrder = defineRoute({
      id: 'commerce.order.read_again',
      method: 'GET',
      path: '/api/v1/commerce/orders/:id',
      summary: 'Read an order again',
      apps: ['customer'],
      permission: orderRead,
      rateLimit: 'read',
      params: { id: string('id is required.') },
      response: strictObject(
        { orderId: string('orderId is required.') },
        'The answer has orderId only.',
      ),
    });

    expect(() => buildRouteManifest([getOrder, sameOrder])).toThrow(
      'Two routes are at GET /api/v1/commerce/orders/:',
    );
  });

  it('CR-12: the same path with another method is another route', () => {
    expect(buildRouteManifest([placeOrder, myOrders])).toHaveLength(2);
    expect(manifest.filter((entry) => entry.path === '/api/v1/commerce/orders')).toHaveLength(1);
  });
});

describe('matchRoute', () => {
  it('SR-032: finds the route of a real path, with the right method', () => {
    expect(matchRoute(manifest, 'GET', '/api/v1/commerce/orders/66f0')?.id).toBe(
      'commerce.order.get',
    );
    expect(matchRoute(manifest, 'POST', '/api/v1/commerce/orders')?.id).toBe(
      'commerce.order.place',
    );
    expect(matchRoute(manifest, 'GET', '/api/v1/catalog/home')?.id).toBe('catalog.home.get');
    expect(matchRoute(manifest, 'POST', '/api/v1/finance/payout-batches/b1/approve')?.id).toBe(
      'finance.payout_batch.approve',
    );
  });

  it('SR-032: a path that is written wins over a :name part', () => {
    expect(matchRoute(manifest, 'GET', '/api/v1/commerce/orders/mine')?.id).toBe(
      'commerce.order.mine',
    );
  });

  it('SR-032: what is not in the contracts cannot be reached', () => {
    expect(matchRoute(manifest, 'DELETE', '/api/v1/commerce/orders/66f0')).toBeUndefined();
    expect(matchRoute(manifest, 'GET', '/api/v1/commerce/carts')).toBeUndefined();
    expect(matchRoute(manifest, 'GET', '/api/v1/commerce/orders/66f0/lines')).toBeUndefined();
    expect(matchRoute(manifest, 'GET', '/api/v1/commerce/orders/')).toBeUndefined();
    expect(matchRoute(manifest, 'GET', '/api/v1/commerce')).toBeUndefined();
    expect(matchRoute([], 'GET', '/api/v1/commerce/orders/66f0')).toBeUndefined();
  });
});

describe('uncontractedRoutes', () => {
  it('AC-PLATFORM-15, CR-12: lists the registered routes that have no contract', () => {
    const registered = [
      { method: 'GET', path: '/api/v1/commerce/orders/:orderId' },
      { method: 'POST', path: '/api/v1/commerce/orders' },
      { method: 'DELETE', path: '/api/v1/commerce/orders/:orderId' },
      { method: 'GET', path: '/api/v1/commerce/secret' },
    ];

    expect(uncontractedRoutes(manifest, registered)).toEqual([
      { method: 'DELETE', path: '/api/v1/commerce/orders/:orderId' },
      { method: 'GET', path: '/api/v1/commerce/secret' },
    ]);
  });

  it('AC-PLATFORM-15, CR-12: is empty when every route has a contract', () => {
    const registered = manifest.map(({ method, path }) => ({ method, path }));

    expect(uncontractedRoutes(manifest, registered)).toEqual([]);
    expect(uncontractedRoutes(manifest, [])).toEqual([]);
  });
});

describe('the sample routes', () => {
  it('AC-PLATFORM-15: are all in the manifest', () => {
    for (const route of [getOrder, placeOrder, myOrders, catalogHome, approvePayoutBatch]) {
      expect(manifest.some((entry) => entry.id === route.id)).toBe(true);
    }
  });
});
