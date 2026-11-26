import { describe, expect, it } from 'vitest';

import { buildRouteManifest, createRouteMatcher, type ManifestEntry } from '../src/index.ts';
import { allSampleRoutes } from './utils/sample-contracts.ts';

// An entry that is only a place in the manifest: the matcher looks at the method and the path.
function entry(id: string, method: ManifestEntry['method'], path: string): ManifestEntry {
  return {
    id,
    service: 'commerce',
    method,
    path,
    apps: ['customer'],
    permission: null,
    stepUp: false,
    rateLimit: 'read',
    failClosed: false,
    idempotency: 'none',
    cacheMaxAgeSeconds: null,
  };
}

const match = createRouteMatcher(buildRouteManifest(allSampleRoutes));

describe('createRouteMatcher', () => {
  it('SR-032: finds the route of a real path, with the right method', () => {
    expect(match('GET', '/api/v1/commerce/orders/66f0')?.id).toBe('commerce.order.get');
    expect(match('POST', '/api/v1/commerce/orders')?.id).toBe('commerce.order.place');
    expect(match('GET', '/api/v1/catalog/home')?.id).toBe('catalog.home.get');
    expect(match('POST', '/api/v1/finance/payout-batches/b1/approve')?.id).toBe(
      'finance.payout_batch.approve',
    );
  });

  it('SR-032: gives the entry of the manifest itself, not a copy', () => {
    const entries = buildRouteManifest(allSampleRoutes);
    const found = createRouteMatcher(entries)('GET', '/api/v1/catalog/home');

    expect(found).toBe(entries.find((one) => one.id === 'catalog.home.get'));
  });

  it('SR-032: a path that is written wins over a :name part', () => {
    expect(match('GET', '/api/v1/commerce/orders/mine')?.id).toBe('commerce.order.mine');
  });

  it('SR-032: what is not in the contracts cannot be reached', () => {
    expect(match('DELETE', '/api/v1/commerce/orders/66f0')).toBeUndefined();
    expect(match('GET', '/api/v1/commerce/carts')).toBeUndefined();
    expect(match('GET', '/api/v1/commerce/orders/66f0/lines')).toBeUndefined();
    expect(match('GET', '/api/v1/commerce/orders/')).toBeUndefined();
    expect(match('GET', '/api/v1/commerce')).toBeUndefined();
    expect(match('GET', 'api/v1/commerce/orders/66f0')).toBeUndefined();
    expect(match('GET', '')).toBeUndefined();
    expect(createRouteMatcher([])('GET', '/api/v1/commerce/orders/66f0')).toBeUndefined();
  });

  it('SR-032: the method is part of the place, and it is not guessed from the path', () => {
    expect(match('get', '/api/v1/commerce/orders/66f0')).toBeUndefined();
    expect(match('toString', '/api/v1/commerce/orders/66f0')).toBeUndefined();
  });

  it('SR-032: a part like __proto__ or constructor is only a part', () => {
    expect(match('GET', '/api/v1/commerce/orders/__proto__')?.id).toBe('commerce.order.get');
    expect(match('GET', '/api/v1/commerce/orders/constructor')?.id).toBe('commerce.order.get');
    expect(match('GET', '/api/v1/__proto__/orders/66f0')).toBeUndefined();
    expect(match('GET', '/__proto__')).toBeUndefined();
  });

  it('SR-032: a written part wins at the first place where two routes differ, and the :name is the way back', () => {
    const matcher = createRouteMatcher([
      entry('a.by_id', 'GET', '/api/v1/commerce/orders/:orderId'),
      entry('a.mine', 'GET', '/api/v1/commerce/orders/mine'),
      entry('a.lines', 'GET', '/api/v1/commerce/orders/:orderId/lines'),
      entry('a.line', 'GET', '/api/v1/commerce/orders/:orderId/lines/:lineId'),
      entry('a.mine_export', 'GET', '/api/v1/commerce/orders/mine/export'),
      entry('b.left', 'GET', '/api/v1/commerce/carts/open/:cartId'),
      entry('b.right', 'GET', '/api/v1/commerce/carts/:cartId/open'),
    ]);

    // `mine` is written, and has `export` and nothing else.
    expect(matcher('GET', '/api/v1/commerce/orders/mine')?.id).toBe('a.mine');
    expect(matcher('GET', '/api/v1/commerce/orders/mine/export')?.id).toBe('a.mine_export');
    // `mine` has no `lines`, so the way back is the :orderId.
    expect(matcher('GET', '/api/v1/commerce/orders/mine/lines')?.id).toBe('a.lines');
    expect(matcher('GET', '/api/v1/commerce/orders/mine/lines/7')?.id).toBe('a.line');
    expect(matcher('GET', '/api/v1/commerce/orders/66f0')?.id).toBe('a.by_id');
    expect(matcher('GET', '/api/v1/commerce/orders/66f0/lines')?.id).toBe('a.lines');
    expect(matcher('GET', '/api/v1/commerce/orders/mine/export/2')).toBeUndefined();
    // Two routes that both fit: the one that is written at the left wins.
    expect(matcher('GET', '/api/v1/commerce/carts/open/open')?.id).toBe('b.left');
    expect(matcher('GET', '/api/v1/commerce/carts/c1/open')?.id).toBe('b.right');
  });

  it('CR-12: a :name is never an empty part', () => {
    expect(match('GET', '/api/v1/commerce/orders//')).toBeUndefined();
    expect(match('POST', '/api/v1/finance/payout-batches//approve')).toBeUndefined();
  });

  it('CR-12: refuses two routes of one method at one place, whatever the :name', () => {
    expect(() =>
      createRouteMatcher([
        entry('a.one', 'GET', '/api/v1/commerce/orders/:orderId'),
        entry('a.two', 'GET', '/api/v1/commerce/orders/:id'),
      ]),
    ).toThrow('Two routes are at GET /api/v1/commerce/orders/:.');
    expect(() =>
      createRouteMatcher([
        entry('a.one', 'GET', '/api/v1/commerce/orders'),
        entry('a.two', 'GET', '/api/v1/commerce/orders'),
      ]),
    ).toThrow('Two routes are at GET /api/v1/commerce/orders.');
  });

  it('CR-12: the same place with another method is another route', () => {
    const matcher = createRouteMatcher([
      entry('a.get', 'GET', '/api/v1/commerce/orders/:orderId'),
      entry('a.delete', 'DELETE', '/api/v1/commerce/orders/:orderId'),
    ]);

    expect(matcher('GET', '/api/v1/commerce/orders/1')?.id).toBe('a.get');
    expect(matcher('DELETE', '/api/v1/commerce/orders/1')?.id).toBe('a.delete');
    expect(matcher('PATCH', '/api/v1/commerce/orders/1')).toBeUndefined();
  });

  it('SR-007, CR-40: a very long path is turned away without a deep walk', () => {
    const parts = 100_000;

    expect(match('GET', `/api/v1/commerce/orders/${'a/'.repeat(parts)}`)).toBeUndefined();
    expect(match('GET', `/${'/'.repeat(parts)}`)).toBeUndefined();
    expect(match('GET', `/api/v1/commerce/orders/${'a'.repeat(parts)}`)?.id).toBe(
      'commerce.order.get',
    );
  });
});

describe('createRouteMatcher with a big manifest', () => {
  // CR-40: no time limit here (RT-25). A scan of the whole manifest on every request would be
  // 10^5 x 10^5 steps, which the timeout of the test stops.
  const resources = 50_000;
  // The list route of a resource is a GET for the even ones and a POST for the odd ones.
  const listMethod = (index: number): 'GET' | 'POST' => (index % 2 === 0 ? 'GET' : 'POST');
  const resource = (index: number): string => `r${String(index)}`;
  const manifest = Array.from({ length: resources }, (_, index) => index).flatMap((index) => [
    entry(`${resource(index)}.list`, listMethod(index), `/api/v1/commerce/${resource(index)}`),
    entry(`${resource(index)}.get`, 'GET', `/api/v1/commerce/${resource(index)}/:id`),
  ]);

  it('SR-032, CR-40: finds the route of every one of 10^5 routes, and of 10^5 requests', () => {
    const matcher = createRouteMatcher(manifest);

    // The wrong answers are collected, so that 2 x 10^5 `expect` calls do not slow the test.
    const wrong: string[] = [];
    for (let index = 0; index < resources; index += 1) {
      const name = resource(index);
      if (matcher(listMethod(index), `/api/v1/commerce/${name}`)?.id !== `${name}.list`) {
        wrong.push(`${listMethod(index)} ${name}`);
      }
      if (matcher('GET', `/api/v1/commerce/${name}/66f0`)?.id !== `${name}.get`) {
        wrong.push(`GET ${name}/66f0`);
      }
    }
    expect(wrong).toEqual([]);
    expect(matcher('GET', `/api/v1/commerce/${resource(resources)}`)).toBeUndefined();
    expect(matcher('DELETE', '/api/v1/commerce/r1')).toBeUndefined();
  });
});
