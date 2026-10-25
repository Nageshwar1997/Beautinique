import { object, string } from '@beautinique/shared-zod';
import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  ApiError,
  createClient,
  defineRoute,
  getPing,
  queryKey,
  queryKeyPrefix,
  recordPing,
} from '../src';

const id = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';
const ping = { pingId: id, note: 'hello', recordedAt: '2026-10-22T10:00:00.000Z' };

interface Seen {
  url: string;
  init: RequestInit;
}

function stub(respond: () => Response) {
  const seen: Seen[] = [];
  const fetchStub = ((url: string, init: RequestInit) => {
    seen.push({ url, init });
    return Promise.resolve(respond());
  }) as unknown as typeof fetch;
  return { seen, fetchStub };
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

const headersOf = (seen: Seen | undefined) => (seen?.init.headers ?? {}) as Record<string, string>;

const listRoute = defineRoute({
  id: 'catalog.products.list',
  method: 'GET',
  path: '/catalog/products',
  summary: 'List products',
  apps: ['customer'],
  access: { type: 'public' },
  rateLimit: 'read',
  idempotency: false,
  stepUp: false,
  owner: 'core',
  input: { query: object({ search: string().optional() }) },
  output: object({ ok: string() }),
});

describe('client call', () => {
  it('sends method, path, headers, token and body, and returns validated data', async () => {
    const { seen, fetchStub } = stub(() => json({ data: ping }));
    const client = createClient({
      baseUrl: 'https://api.example.test/',
      app: 'admin',
      fetch: fetchStub,
      getToken: () => 'tok',
    });
    expect(await client.call(recordPing, { body: { note: 'hello' } })).toEqual(ping);
    expect(seen[0]?.url).toBe('https://api.example.test/platform/pings');
    expect(seen[0]?.init.method).toBe('POST');
    expect(seen[0]?.init.body).toBe('{"note":"hello"}');
    expect(headersOf(seen[0])).toMatchObject({
      Accept: 'application/json',
      'X-BQ-App': 'admin',
      Authorization: 'Bearer tok',
      'Content-Type': 'application/json',
    });
    expect(headersOf(seen[0])['Idempotency-Key']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('keeps a given idempotency key, makes a new one otherwise, and skips it on reads', async () => {
    const { seen, fetchStub } = stub(() => json({ data: ping }));
    const client = createClient({ baseUrl: 'https://x.test', app: 'admin', fetch: fetchStub });
    await client.call(recordPing, { body: { note: 'a' } }, { idempotencyKey: 'key-1' });
    await client.call(recordPing, { body: { note: 'a' } });
    await client.call(getPing, { params: { pingId: id } });
    expect(headersOf(seen[0])['Idempotency-Key']).toBe('key-1');
    expect(headersOf(seen[1])['Idempotency-Key']).toBeTruthy();
    expect(headersOf(seen[1])['Idempotency-Key']).not.toBe('key-1');
    expect(headersOf(seen[2])['Idempotency-Key']).toBeUndefined();
    expect(headersOf(seen[2]).Authorization).toBeUndefined();
    expect(headersOf(seen[2])['Content-Type']).toBeUndefined();
    expect(seen[2]?.init.body).toBeUndefined();
    expect(seen[2]?.url).toBe(`https://x.test/platform/pings/${id}`);
  });

  it('builds the query string: encoded, arrays repeat, empty values skipped', async () => {
    const { seen, fetchStub } = stub(() => json({ data: { ok: 'y' } }));
    const client = createClient({ baseUrl: 'https://x.test', app: 'customer', fetch: fetchStub });
    await client.call(listRoute, { query: { search: 'a b&c' } });
    await client.call(listRoute, { query: {} });
    await client.call(listRoute, {
      query: {
        search: undefined,
        tag: ['x', 'y', null],
        at: new Date('2026-01-01T00:00:00Z'),
      } as never,
    });
    expect(seen[0]?.url).toBe('https://x.test/catalog/products?search=a+b%26c');
    expect(seen[1]?.url).toBe('https://x.test/catalog/products');
    expect(seen[2]?.url).toBe(
      'https://x.test/catalog/products?tag=x&tag=y&at=2026-01-01T00%3A00%3A00.000Z',
    );
  });

  it('turns an error body into an ApiError with code, status, request id and details', async () => {
    const body = {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Bad input',
        details: [{ path: ['note'], message: 'Too short' }],
        requestId: 'req-1',
      },
    };
    const client = createClient({
      baseUrl: 'https://x.test',
      app: 'admin',
      fetch: stub(() => json(body, 400)).fetchStub,
    });
    const error = await client.call(recordPing, { body: { note: 'x' } }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      name: 'ApiError',
      code: 'VALIDATION_FAILED',
      status: 400,
      requestId: 'req-1',
      message: 'Bad input',
      details: [{ path: ['note'], message: 'Too short' }],
    });
  });

  it('still gives an ApiError for a body that is not ours, using the request id header', async () => {
    const make = (status: number) =>
      createClient({
        baseUrl: 'https://x.test',
        app: 'admin',
        fetch: stub(() => new Response('<html>', { status, headers: { 'X-Request-Id': 'req-9' } }))
          .fetchStub,
      });
    const bad = await make(404)
      .call(getPing, { params: { pingId: id } })
      .catch((e: unknown) => e);
    expect(bad).toMatchObject({ code: 'BAD_REQUEST', status: 404, requestId: 'req-9' });
    const down = await make(502)
      .call(getPing, { params: { pingId: id } })
      .catch((e: unknown) => e);
    expect(down).toMatchObject({ code: 'INTERNAL', status: 502 });
    expect((down as ApiError).details).toEqual([]);
  });

  it('reports an unreachable server as NETWORK_ERROR, but rethrows an abort as it is', async () => {
    const failing = (() =>
      Promise.reject(new TypeError('fetch failed'))) as unknown as typeof fetch;
    const client = createClient({ baseUrl: 'https://x.test', app: 'admin', fetch: failing });
    await expect(client.call(getPing, { params: { pingId: id } })).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    });
    const controller = new AbortController();
    controller.abort();
    const aborting = (() =>
      Promise.reject(new DOMException('Aborted', 'AbortError'))) as unknown as typeof fetch;
    const abortable = createClient({ baseUrl: 'https://x.test', app: 'admin', fetch: aborting });
    await expect(
      abortable.call(getPing, { params: { pingId: id } }, { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('refuses a success response without data or with data that does not match the route', async () => {
    const run = (response: () => Response, validateResponses?: boolean) =>
      createClient({
        baseUrl: 'https://x.test',
        app: 'admin',
        fetch: stub(response).fetchStub,
        validateResponses,
      }).call(getPing, { params: { pingId: id } });
    const withId = (body: unknown) => () => json(body, 200, { 'X-Request-Id': 'req-2' });
    await expect(run(withId({}))).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      message: 'The server sent a response without data',
      requestId: 'req-2',
    });
    await expect(run(() => new Response('not json'))).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
    await expect(run(withId({ data: { pingId: 'nope' } }))).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      message: 'The response does not match platform.ping.get',
    });
    await expect(run(withId({ data: { pingId: 'nope' } }), false)).resolves.toEqual({
      pingId: 'nope',
    });
  });

  it('is typed from the route: the request and the returned data', () => {
    const client = createClient({ baseUrl: 'https://x.test', app: 'admin' });
    expectTypeOf(client.call<typeof recordPing>)
      .parameter(1)
      .toEqualTypeOf<{
        body: { note: string };
      }>();
    expectTypeOf(client.call<typeof getPing>).returns.resolves.toEqualTypeOf<{
      pingId: string;
      note: string;
      recordedAt: string;
    }>();
  });
});

describe('query keys', () => {
  it('start with the module and route id, hold params and query but never the body', () => {
    expect(queryKey(getPing, { params: { pingId: id } })).toEqual([
      'platform',
      'platform.ping.get',
      { params: { pingId: id }, query: null },
    ]);
    expect(queryKey(listRoute)).toEqual([
      'catalog',
      'catalog.products.list',
      { params: null, query: null },
    ]);
    expect(queryKey(recordPing, { body: { note: 'x' } } as never)[2]).toEqual({
      params: null,
      query: null,
    });
  });

  it('prefixes match a module or one route', () => {
    expect(queryKeyPrefix('platform')).toEqual(['platform']);
    expect(queryKeyPrefix('platform', 'platform.ping.get')).toEqual([
      'platform',
      'platform.ping.get',
    ]);
  });
});
