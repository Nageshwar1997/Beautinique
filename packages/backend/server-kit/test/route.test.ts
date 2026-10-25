import { Writable } from 'node:stream';

import { APPS, defineRoute } from '@beautinique/shared-contracts';
import { coerce, int, number, object, string } from '@beautinique/shared-zod';
import { Router } from 'express';
import { afterEach, describe, expect, it } from 'vitest';

import {
  AppError,
  createApp,
  createLogger,
  mountRoute,
  type RunningServer,
  startServer,
} from '../src/index';

const base = {
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'read',
  idempotency: false,
  stepUp: false,
  owner: 'core',
} as const;

const getItem = defineRoute({
  ...base,
  id: 'demo.items.get',
  method: 'GET',
  path: '/demo/items/:itemId',
  summary: 'Read one item',
  input: {
    params: object({ itemId: string().min(3) }),
    query: object({ limit: coerce.number().pipe(int().min(1).max(10)).default(5) }),
  },
  output: object({ itemId: string(), limit: number() }),
});

const createItem = defineRoute({
  ...base,
  id: 'demo.items.create',
  method: 'POST',
  path: '/demo/items',
  summary: 'Create an item',
  rateLimit: 'write',
  idempotency: true,
  input: { body: object({ name: string().min(1) }) },
  output: object({ name: string() }),
});

const ping = defineRoute({
  ...base,
  id: 'demo.ping.get',
  method: 'GET',
  path: '/demo/ping',
  summary: 'No input at all',
  input: {},
  output: object({ ok: string() }),
});

const lines: Record<string, unknown>[] = [];
const logger = createLogger({
  name: 'test',
  level: 'debug',
  destination: new Writable({
    write(chunk: Buffer, _encoding, done) {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        lines.push(JSON.parse(line) as Record<string, unknown>);
      }
      done();
    },
  }),
});

const servers: RunningServer[] = [];
afterEach(async () => {
  lines.length = 0;
  await Promise.all(servers.splice(0).map((s) => s.stop()));
});

async function serve(mount: (router: Router) => void) {
  const router = Router();
  mount(router);
  const app = createApp({ logger, routes: (app) => app.use(router) });
  const server = await startServer(app, {
    port: 0,
    host: '127.0.0.1',
    logger,
    handleSignals: false,
  });
  servers.push(server);
  return server.url;
}

describe('mountRoute', () => {
  it('answers { data } with the route output, and only the fields the contract names', async () => {
    const url = await serve((router) => {
      mountRoute(
        router,
        getItem,
        ({ params, query }) =>
          ({
            itemId: params.itemId,
            limit: query.limit,
            secret: 'not in the contract',
          }) as never,
      );
    });
    const response = await fetch(`${url}/demo/items/abc?limit=3`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { itemId: 'abc', limit: 3 } });
  });

  it('gives the handler checked input: coerced query values and their defaults', async () => {
    const seen: unknown[] = [];
    const url = await serve((router) => {
      mountRoute(router, getItem, (input) => {
        seen.push(input);
        return { itemId: input.params.itemId, limit: input.query.limit };
      });
    });
    await fetch(`${url}/demo/items/abc`);
    await fetch(`${url}/demo/items/abc?limit=10`);
    expect(seen).toEqual([
      { params: { itemId: 'abc' }, query: { limit: 5 }, body: undefined },
      { params: { itemId: 'abc' }, query: { limit: 10 }, body: undefined },
    ]);
  });

  it('refuses a wrong request with VALIDATION_FAILED and the fields, and never calls the handler', async () => {
    let calls = 0;
    const url = await serve((router) => {
      mountRoute(router, getItem, () => {
        calls += 1;
        return { itemId: 'x', limit: 1 };
      });
      mountRoute(router, createItem, () => {
        calls += 1;
        return { name: 'x' };
      });
    });
    const badParams = await fetch(`${url}/demo/items/ab`);
    expect(badParams.status).toBe(400);
    expect(await badParams.json()).toMatchObject({
      error: { code: 'VALIDATION_FAILED', details: [{ path: ['itemId'] }] },
    });
    const badQuery = await fetch(`${url}/demo/items/abc?limit=99`);
    expect(await badQuery.json()).toMatchObject({
      error: { code: 'VALIDATION_FAILED', details: [{ path: ['limit'] }] },
    });
    const badBody = await fetch(`${url}/demo/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    expect(badBody.status).toBe(400);
    expect(await badBody.json()).toMatchObject({
      error: { code: 'VALIDATION_FAILED', details: [{ path: ['name'] }] },
    });
    const noBody = await fetch(`${url}/demo/items`, { method: 'POST' });
    expect(noBody.status).toBe(400);
    expect(calls).toBe(0);
  });

  it('answers with the status asked for, and 200 otherwise', async () => {
    const url = await serve((router) => {
      mountRoute(router, createItem, ({ body }) => ({ name: body.name }), { status: 201 });
      mountRoute(router, ping, () => ({ ok: 'yes' }));
    });
    const created = await fetch(`${url}/demo/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'lipstick' }),
    });
    expect(created.status).toBe(201);
    expect(await created.json()).toEqual({ data: { name: 'lipstick' } });
    const plain = await fetch(`${url}/demo/ping`);
    expect(plain.status).toBe(200);
  });

  it('gives a route without input no params, query or body', async () => {
    const seen: unknown[] = [];
    const url = await serve((router) => {
      mountRoute(router, ping, (input) => {
        seen.push(input);
        return Promise.resolve({ ok: 'yes' });
      });
    });
    expect(await (await fetch(`${url}/demo/ping`)).json()).toEqual({ data: { ok: 'yes' } });
    expect(seen).toEqual([{ params: undefined, query: undefined, body: undefined }]);
  });

  it('hands the handler the request id of the response header', async () => {
    let seen = '';
    const url = await serve((router) => {
      mountRoute(router, ping, (_input, { requestId }) => {
        seen = requestId;
        return { ok: 'yes' };
      });
    });
    const response = await fetch(`${url}/demo/ping`, { headers: { 'X-Request-Id': 'req-77' } });
    expect(response.headers.get('X-Request-Id')).toBe(seen);
    expect(seen).not.toBe('');
  });

  it('turns an output that breaks the contract into INTERNAL, logs it and shows nothing of it', async () => {
    const url = await serve((router) => {
      mountRoute(router, getItem, () => ({ itemId: 42, limit: 'many' }) as never);
    });
    const response = await fetch(`${url}/demo/items/abc`);
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(JSON.parse(text)).toMatchObject({ error: { code: 'INTERNAL' } });
    expect(text).not.toContain('42');
    expect(text).not.toContain('many');
    expect(text).not.toContain('contract');
    const logged = lines.find((l) => l.msg === 'request failed');
    expect(JSON.stringify(logged)).toContain(
      'demo.items.get returned data that breaks its contract',
    );
  });

  it('keeps the status of an AppError thrown by the handler, sync or async', async () => {
    const url = await serve((router) => {
      mountRoute(router, getItem, () => Promise.reject(new AppError('NOT_FOUND', 'No such item')));
      mountRoute(router, createItem, () => {
        throw new AppError('CONFLICT', 'Already there');
      });
    });
    const missing = await fetch(`${url}/demo/items/abc`);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toMatchObject({
      error: { code: 'NOT_FOUND', message: 'No such item' },
    });
    const clash = await fetch(`${url}/demo/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'x' }),
    });
    expect(clash.status).toBe(409);
  });
});
