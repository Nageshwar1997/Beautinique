import { getMe, HEADERS } from '@beautinique/shared-contracts';
import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type ApiClient,
  ApiError,
  createApiClient,
  OTHER_TAB_REFRESH_WAIT_MS,
  type SessionChange,
} from '../src/index';
import {
  BASE_URL,
  deferred,
  failure,
  fakeGateway,
  json,
  placeOrder,
  searchProducts,
} from './fake-gateway';

const clients: ApiClient[] = [];
function clientFor(
  gateway: ReturnType<typeof fakeGateway>,
  app: 'customer' | 'admin' = 'customer',
  validateResponses?: boolean,
) {
  const client = createApiClient({
    app,
    baseUrl: BASE_URL,
    fetch: gateway.fetch,
    validateResponses,
  });
  clients.push(client);
  return client;
}

afterEach(() => {
  for (const client of clients.splice(0)) client.dispose();
  vi.restoreAllMocks();
});

describe('requests over axios', () => {
  it('goes to /api/v1 on the app’s own host unless told otherwise', () => {
    const create = vi.spyOn(axios, 'create');
    clients.push(createApiClient({ app: 'admin' }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: '/api/v1',
        headers: { Accept: 'application/json', [HEADERS.app]: 'admin' },
      }),
    );
    // no fetch given: axios's own adapter (XMLHttpRequest in the browser)
    expect(create.mock.calls[0]?.[0]).not.toHaveProperty('adapter');
  });

  it('fills the path, writes the query like the contracts’ client, and sends no body on a GET', async () => {
    const gateway = fakeGateway({ access: true });
    const answer = await clientFor(gateway).call(searchProducts, {
      params: { brand: 'rose & co' },
      query: { tag: ['matte', 'long wear'], page: 2, from: new Date('2026-10-01T00:00:00.000Z') },
    });
    expect(answer.items).toEqual(['lipstick']);
    const [request] = gateway.requests;
    expect(request?.path).toBe('/api/v1/test/brands/rose%20%26%20co/products');
    expect(request?.search).toBe(
      '?tag=matte&tag=long+wear&page=2&from=2026-10-01T00%3A00%3A00.000Z',
    );
    expect(request?.body).toBeUndefined();
  });

  it('turns our error body into an ApiError with its details and request id', async () => {
    const gateway = fakeGateway({ access: true });
    gateway.answers.push(() =>
      json(400, {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Check the form',
          details: [{ path: ['body', 'item'], message: 'Choose an item' }],
          requestId: 'req-42',
        },
      }),
    );
    const error = (await rejection(
      clientFor(gateway).call(placeOrder, { body: { item: '' } }),
    )) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      code: 'VALIDATION_FAILED',
      message: 'Check the form',
      status: 400,
      requestId: 'req-42',
      details: [{ path: ['body', 'item'], message: 'Choose an item' }],
    });
  });

  it('names an answer that is not our error body by its status', async () => {
    const gateway = fakeGateway({ access: true });
    gateway.answers.push(
      () =>
        new Response('<html>Bad gateway</html>', {
          status: 502,
          headers: { 'Content-Type': 'text/html', [HEADERS.requestId]: 'req-502' },
        }),
      () => new Response('nope', { status: 404 }),
    );
    const client = clientFor(gateway);
    expect(await rejection(client.call(getMe))).toMatchObject({
      code: 'INTERNAL',
      status: 502,
      requestId: 'req-502',
    });
    expect(await rejection(client.call(getMe))).toMatchObject({
      code: 'BAD_REQUEST',
      status: 404,
      requestId: null,
    });
  });

  it('refuses an answer without data, or one that breaks the route’s contract', async () => {
    const gateway = fakeGateway({ access: true });
    gateway.answers.push(
      () => json(200, { ok: true }),
      () => json(200, { data: { user: 'not a user' } }),
    );
    const client = clientFor(gateway);
    expect(await rejection(client.call(getMe))).toMatchObject({
      code: 'INVALID_RESPONSE',
      message: 'The server sent a response without data',
    });
    expect(await rejection(client.call(getMe))).toMatchObject({
      code: 'INVALID_RESPONSE',
      message: 'The response does not match iam.me.get',
    });
  });

  it('tells the online status: any answer proves the internet, no answer asks for a check', async () => {
    const gateway = fakeGateway({ access: true });
    const onlineStatus = { confirmOnline: vi.fn(), recheck: vi.fn() };
    const client = createApiClient({
      app: 'customer',
      baseUrl: BASE_URL,
      fetch: gateway.fetch,
      onlineStatus,
    });
    clients.push(client);
    await client.call(getMe);
    gateway.answers.push(() => failure(404, 'NOT_FOUND'));
    await rejection(client.call(getMe));
    expect(onlineStatus.confirmOnline).toHaveBeenCalledTimes(2);
    expect(onlineStatus.recheck).not.toHaveBeenCalled();

    gateway.answers.push(() => Promise.reject(new TypeError('Failed to fetch')));
    expect(await rejection(client.call(getMe))).toMatchObject({ code: 'NETWORK_ERROR' });
    expect(onlineStatus.recheck).toHaveBeenCalledTimes(1);

    // the caller's own abort says nothing about the internet
    const controller = new AbortController();
    controller.abort();
    await rejection(client.call(getMe, undefined, { signal: controller.signal }));
    expect(onlineStatus.recheck).toHaveBeenCalledTimes(1);
    expect(onlineStatus.confirmOnline).toHaveBeenCalledTimes(2);
  });

  it('can skip the output check', async () => {
    const gateway = fakeGateway({ access: true });
    gateway.answers.push(() => json(200, { data: { user: 'not a user' } }));
    const answer: unknown = await clientFor(gateway, 'customer', false).call(getMe);
    expect(answer).toEqual({ user: 'not a user' });
  });
});

const rejection = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('expected the call to fail');
};

describe('createApiClient', () => {
  it('calls the gateway on the app’s own host with the app header', async () => {
    const gateway = fakeGateway({ access: true });
    const me = await clientFor(gateway).call(getMe);
    expect(me.user.email).toBe('asha@beautinique.example');
    expect(gateway.paths()).toEqual(['GET /api/v1/iam/me']);
    expect(gateway.requests[0]?.headers.get(HEADERS.app)).toBe('customer');
  });

  it('refreshes an ended access token once and sends the call again', async () => {
    const gateway = fakeGateway({ access: false });
    const me = await clientFor(gateway).call(getMe);
    expect(me.session.app).toBe('customer');
    expect(gateway.paths()).toEqual([
      'GET /api/v1/iam/me',
      'POST /api/v1/auth/refresh',
      'GET /api/v1/iam/me',
    ]);
  });

  it('refreshes once for calls that find the token ended together', async () => {
    const gateway = fakeGateway({ access: false });
    const client = clientFor(gateway);
    const answers = await Promise.all([client.call(getMe), client.call(getMe), client.call(getMe)]);
    expect(answers).toHaveLength(3);
    expect(gateway.paths().filter((path) => path.endsWith('/auth/refresh'))).toHaveLength(1);
  });

  it('holds a call asked for during a refresh until the refresh is done', async () => {
    const gateway = fakeGateway({ access: false });
    const answer = deferred<Response>();
    gateway.refreshAnswers.push(() => answer.promise);
    const client = clientFor(gateway);
    const refreshed = client.refresh();
    const me = client.call(getMe);
    await vi.waitFor(() => {
      expect(gateway.paths()).toEqual(['POST /api/v1/auth/refresh']);
    });
    gateway.state.access = true;
    answer.resolve(
      json(200, {
        data: {
          user: {
            userId: '01920000-0000-7000-8000-000000000001',
            email: 'asha@beautinique.example',
          },
          sessionId: '01920000-0000-7000-8000-000000000002',
          expiresAt: '2026-12-01T00:00:00.000Z',
        },
      }),
    );
    await expect(refreshed).resolves.toBe(true);
    await expect(me).resolves.toMatchObject({ user: { email: 'asha@beautinique.example' } });
    // the held call went out once, with the new cookie: no 401 first
    expect(gateway.paths()).toEqual(['POST /api/v1/auth/refresh', 'GET /api/v1/iam/me']);
  });

  it('says signed out once, and fails the calls, when there is no session any more', async () => {
    const gateway = fakeGateway({ access: false, session: false });
    const client = clientFor(gateway);
    const changes: SessionChange[] = [];
    client.onSessionChange((change) => changes.push(change));
    const errors = await Promise.all([
      rejection(client.call(getMe)),
      rejection(client.call(getMe)),
    ]);
    for (const error of errors) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe('UNAUTHENTICATED');
    }
    expect(changes).toEqual(['signed-out']);
    await expect(client.refresh()).resolves.toBe(false);
  });

  it('does not refresh again when another tab just did (409), and sends the call with its cookie', async () => {
    const gateway = fakeGateway({ access: false });
    gateway.refreshAnswers.push(() => {
      // the other tab's answer set the new cookies, which this tab shares
      gateway.state.access = true;
      return failure(409, 'REFRESH_IN_PROGRESS');
    });
    const started = performance.now();
    const me = await clientFor(gateway).call(getMe);
    expect(me.user.userId).toBe('01920000-0000-7000-8000-000000000001');
    expect(performance.now() - started).toBeGreaterThanOrEqual(OTHER_TAB_REFRESH_WAIT_MS - 5);
    expect(gateway.paths()).toEqual([
      'GET /api/v1/iam/me',
      'POST /api/v1/auth/refresh',
      'GET /api/v1/iam/me',
    ]);
  });

  it('sends a call again only once after a refresh', async () => {
    const gateway = fakeGateway({ access: false });
    gateway.refreshAnswers.push(() =>
      json(200, {
        data: {
          user: {
            userId: '01920000-0000-7000-8000-000000000001',
            email: 'asha@beautinique.example',
          },
          sessionId: '01920000-0000-7000-8000-000000000002',
          expiresAt: '2026-12-01T00:00:00.000Z',
        },
      }),
    );
    const error = await rejection(clientFor(gateway).call(getMe));
    expect((error as ApiError).code).toBe('UNAUTHENTICATED');
    expect(gateway.paths()).toEqual([
      'GET /api/v1/iam/me',
      'POST /api/v1/auth/refresh',
      'GET /api/v1/iam/me',
    ]);
  });

  it('keeps the person signed in when the refresh could not reach the server', async () => {
    const gateway = fakeGateway({ access: false });
    gateway.refreshAnswers.push(() => {
      throw new TypeError('Failed to fetch');
    });
    const client = clientFor(gateway);
    const changes: SessionChange[] = [];
    client.onSessionChange((change) => changes.push(change));
    const error = await rejection(client.call(getMe));
    expect((error as ApiError).code).toBe('NETWORK_ERROR');
    expect(changes).toEqual([]);
  });

  it('gives an aborted call’s abort error back, not a network error', async () => {
    const gateway = fakeGateway({ access: true });
    const controller = new AbortController();
    controller.abort();
    const error = await rejection(
      clientFor(gateway).call(getMe, undefined, { signal: controller.signal }),
    );
    expect((error as Error).name).toBe('AbortError');
  });

  describe('step-up', () => {
    it('asks the step-up handler, then sends the same request again', async () => {
      const gateway = fakeGateway({ access: true, steppedUp: false });
      const client = clientFor(gateway);
      const handler = vi.fn((error: ApiError) => {
        expect(error.code).toBe('STEP_UP_REQUIRED');
        gateway.state.steppedUp = true;
        return Promise.resolve(true);
      });
      client.setStepUpHandler(handler);
      const order = await client.call(placeOrder, { body: { item: 'lipstick' } });
      expect(order.orderId).toBe('order-1');
      expect(handler).toHaveBeenCalledTimes(1);
      const [first, second] = gateway.requests;
      expect(second?.body).toEqual({ item: 'lipstick' });
      expect(second?.headers.get(HEADERS.idempotencyKey)).toBe(
        first?.headers.get(HEADERS.idempotencyKey),
      );
    });

    it('fails with STEP_UP_REQUIRED when the person cancels', async () => {
      const gateway = fakeGateway({ access: true, steppedUp: false });
      const client = clientFor(gateway);
      client.setStepUpHandler(() => Promise.resolve(false));
      const error = await rejection(client.call(placeOrder, { body: { item: 'lipstick' } }));
      expect((error as ApiError).code).toBe('STEP_UP_REQUIRED');
      expect(gateway.requests).toHaveLength(1);
    });

    it('fails with STEP_UP_REQUIRED when the app has no step-up handler', async () => {
      const gateway = fakeGateway({ access: true, steppedUp: false });
      const error = await rejection(clientFor(gateway).call(placeOrder, { body: { item: 'a' } }));
      expect((error as ApiError).code).toBe('STEP_UP_REQUIRED');
    });

    it('opens one step-up for calls that want it together', async () => {
      const gateway = fakeGateway({ access: true, steppedUp: false });
      const client = clientFor(gateway);
      const proved = deferred<boolean>();
      const handler = vi.fn(() => proved.promise);
      client.setStepUpHandler(handler);
      const orders = Promise.all([
        client.call(placeOrder, { body: { item: 'a' } }),
        client.call(placeOrder, { body: { item: 'b' } }),
      ]);
      await vi.waitFor(() => {
        expect(gateway.requests).toHaveLength(2);
      });
      gateway.state.steppedUp = true;
      proved.resolve(true);
      await expect(orders).resolves.toHaveLength(2);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('removes only its own handler', async () => {
      const gateway = fakeGateway({ access: true, steppedUp: false });
      const client = clientFor(gateway);
      const removeOld = client.setStepUpHandler(() => Promise.resolve(false));
      const current = vi.fn(() => {
        gateway.state.steppedUp = true;
        return Promise.resolve(true);
      });
      const removeCurrent = client.setStepUpHandler(current);
      removeOld();
      await client.call(placeOrder, { body: { item: 'a' } });
      expect(current).toHaveBeenCalledTimes(1);
      removeCurrent();
      gateway.state.steppedUp = false;
      const error = await rejection(client.call(placeOrder, { body: { item: 'a' } }));
      expect((error as ApiError).code).toBe('STEP_UP_REQUIRED');
    });
  });

  describe('idempotency keys', () => {
    it('sends one key for every try of a call: the first, after a refresh, after a step-up', async () => {
      const gateway = fakeGateway({ access: false, steppedUp: false });
      const client = clientFor(gateway);
      client.setStepUpHandler(() => {
        gateway.state.steppedUp = true;
        return Promise.resolve(true);
      });
      await client.call(placeOrder, { body: { item: 'lipstick' } });
      const keys = gateway.requests
        .filter((request) => request.path === '/api/v1/test/orders')
        .map((request) => request.headers.get(HEADERS.idempotencyKey));
      expect(keys).toHaveLength(3);
      expect(new Set(keys).size).toBe(1);
      expect(keys[0]).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('uses the key it is given, and a new one for the next call', async () => {
      const gateway = fakeGateway({ access: true });
      const client = clientFor(gateway);
      await client.call(placeOrder, { body: { item: 'a' } }, { idempotencyKey: 'given-key' });
      await client.call(placeOrder, { body: { item: 'a' } });
      await client.call(placeOrder, { body: { item: 'a' } });
      const keys = gateway.requests.map((request) => request.headers.get(HEADERS.idempotencyKey));
      expect(keys[0]).toBe('given-key');
      expect(new Set(keys).size).toBe(3);
    });

    it('sends no key on a route that does not take one', async () => {
      const gateway = fakeGateway({ access: true });
      await clientFor(gateway).call(getMe);
      expect(gateway.requests[0]?.headers.has(HEADERS.idempotencyKey)).toBe(false);
    });
  });

  describe('session changes', () => {
    it('tells this tab’s listeners and the app’s other tabs, not another app’s', async () => {
      const gateway = fakeGateway();
      const thisTab = clientFor(gateway);
      const otherTab = clientFor(gateway);
      const otherApp = clientFor(gateway, 'admin');
      const heard = {
        thisTab: [] as SessionChange[],
        otherTab: [] as SessionChange[],
        otherApp: [] as SessionChange[],
      };
      thisTab.onSessionChange((change) => heard.thisTab.push(change));
      otherTab.onSessionChange((change) => heard.otherTab.push(change));
      otherApp.onSessionChange((change) => heard.otherApp.push(change));

      thisTab.sessionChanged('signed-in');
      expect(heard.thisTab).toEqual(['signed-in']);
      await vi.waitFor(() => {
        expect(heard.otherTab).toEqual(['signed-in']);
      });
      thisTab.sessionChanged('signed-out');
      await vi.waitFor(() => {
        expect(heard.otherTab).toEqual(['signed-in', 'signed-out']);
      });
      expect(heard.thisTab).toEqual(['signed-in', 'signed-out']);
      expect(heard.otherApp).toEqual([]);
    });

    it('stops telling a listener once it is removed', () => {
      const client = clientFor(fakeGateway());
      const listener = vi.fn();
      const remove = client.onSessionChange(listener);
      remove();
      client.sessionChanged('signed-out');
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
