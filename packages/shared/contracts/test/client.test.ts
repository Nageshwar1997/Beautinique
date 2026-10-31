import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import { object, string } from '@beautinique/shared-zod';
import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  ApiError,
  createClient,
  defineRoute,
  getPing,
  type NetworkEvent,
  queryKey,
  queryKeyPrefix,
  recordPing,
  refreshSession,
} from '../src';

const id = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';
const ping = { pingId: id, note: 'hello', recordedAt: '2026-10-22T10:00:00.000Z' };

interface Seen {
  url: string;
  method: string;
  headers: Headers;
  body: string;
}

/** A fetch for axios's fetch adapter, which hands it a whole Request. */
function stub(respond: () => Response) {
  const seen: Seen[] = [];
  const fetchStub: typeof fetch = async (input, init) => {
    const request = new Request(input, init);
    seen.push({
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: await request.text(),
    });
    return respond();
  };
  return { seen, fetchStub };
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

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
    expect(seen[0]?.method).toBe('POST');
    expect(seen[0]?.body).toBe('{"note":"hello"}');
    expect(seen[0]?.headers.get('Accept')).toBe('application/json');
    expect(seen[0]?.headers.get('X-BQ-App')).toBe('admin');
    expect(seen[0]?.headers.get('Authorization')).toBe('Bearer tok');
    expect(seen[0]?.headers.get('Content-Type')).toBe('application/json');
    expect(seen[0]?.headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('keeps a given idempotency key, makes a new one otherwise, and skips it on reads', async () => {
    const { seen, fetchStub } = stub(() => json({ data: ping }));
    const client = createClient({ baseUrl: 'https://x.test', app: 'admin', fetch: fetchStub });
    await client.call(recordPing, { body: { note: 'a' } }, { idempotencyKey: 'key-1' });
    await client.call(recordPing, { body: { note: 'a' } });
    await client.call(getPing, { params: { pingId: id } });
    expect(seen[0]?.headers.get('Idempotency-Key')).toBe('key-1');
    expect(seen[1]?.headers.get('Idempotency-Key')).toBeTruthy();
    expect(seen[1]?.headers.get('Idempotency-Key')).not.toBe('key-1');
    expect(seen[2]?.headers.get('Idempotency-Key')).toBeNull();
    expect(seen[2]?.headers.get('Authorization')).toBeNull();
    expect(seen[2]?.headers.get('Content-Type')).toBeNull();
    expect(seen[2]?.body).toBe('');
    expect(seen[2]?.url).toBe(`https://x.test/platform/pings/${id}`);
  });

  it('sends a POST without input with no body and no Content-Type (not as a form)', async () => {
    const { seen, fetchStub } = stub(() => json({ data: {} }));
    const client = createClient({
      baseUrl: 'https://x.test',
      app: 'customer',
      fetch: fetchStub,
      validateResponses: false,
    });
    await client.call(refreshSession);
    expect(seen[0]?.method).toBe('POST');
    expect(seen[0]?.body).toBe('');
    expect(seen[0]?.headers.get('Content-Type')).toBeNull();
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
    const redirect = await make(302)
      .call(getPing, { params: { pingId: id } })
      .catch((e: unknown) => e);
    expect(redirect).toMatchObject({ code: 'BAD_REQUEST', status: 302 });
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

  it('tells onNetwork whether the server answered, and nothing about an abort', async () => {
    const events: NetworkEvent[] = [];
    const answers = [
      () => Promise.resolve(json({ data: ping })),
      () =>
        Promise.resolve(json({ error: { code: 'NOT_FOUND', message: 'x', requestId: 'r' } }, 404)),
      () => Promise.reject(new TypeError('fetch failed')),
    ];
    const client = createClient({
      baseUrl: 'https://x.test',
      app: 'admin',
      fetch: () => answers.shift()?.() ?? Promise.reject(new Error('no answer')),
      onNetwork: (event) => events.push(event),
    });
    const call = (signal?: AbortSignal) =>
      client.call(getPing, { params: { pingId: id } }, { signal }).catch(() => undefined);
    await call();
    await call();
    await call();
    const controller = new AbortController();
    controller.abort();
    await call(controller.signal);
    expect(events).toEqual(['answered', 'answered', 'unanswered']);
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

  it('talks to a real server with axios’s own adapter (Node http) when no fetch is given', async () => {
    const seen: { method?: string; url?: string; type?: string; app?: string; body: string }[] = [];
    const server = createServer((request, response) => {
      let body = '';
      request.on('data', (chunk: Buffer) => (body += chunk.toString()));
      request.on('end', () => {
        seen.push({
          method: request.method,
          url: request.url,
          type: request.headers['content-type'],
          app: request.headers['x-bq-app'] as string | undefined,
          body,
        });
        response.writeHead(201, { 'Content-Type': 'application/json', 'X-Request-Id': 'req-n' });
        response.end(JSON.stringify({ data: ping }));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const { port } = server.address() as AddressInfo;
      const client = createClient({
        baseUrl: `http://127.0.0.1:${String(port)}/api/v1`,
        app: 'customer',
      });
      await expect(client.call(recordPing, { body: { note: 'hello' } })).resolves.toEqual(ping);
      await client.call(refreshSession).catch((error: unknown) => {
        expect(error).toMatchObject({ code: 'INVALID_RESPONSE' });
      });
      expect(seen).toEqual([
        {
          method: 'POST',
          url: '/api/v1/platform/pings',
          type: 'application/json',
          app: 'customer',
          body: '{"note":"hello"}',
        },
        { method: 'POST', url: '/api/v1/auth/refresh', type: undefined, app: 'customer', body: '' },
      ]);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
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
