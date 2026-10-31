import { defineRoute } from '@beautinique/shared-contracts';
import { array, date, number, object, string } from '@beautinique/shared-zod';

/** The app's host in tests: axios makes a Request, which needs a whole URL outside a browser. */
export const BASE_URL = 'https://customer.beautinique.example/api/v1';
export const USER_ID = '01920000-0000-7000-8000-000000000001';
export const SESSION_ID = '01920000-0000-7000-8000-000000000002';
export const EMAIL = 'asha@beautinique.example';
const EXPIRES_AT = '2026-12-01T00:00:00.000Z';

/** A write that wants an Idempotency-Key and a recent step-up, like the payment and grant routes. */
export const placeOrder = defineRoute({
  id: 'test.orders.place',
  method: 'POST',
  path: '/test/orders',
  summary: 'Place a test order',
  apps: ['customer'],
  access: { type: 'permission', permission: 'test.order.place' },
  rateLimit: 'write',
  idempotency: true,
  stepUp: true,
  owner: 'core',
  input: { body: object({ item: string() }) },
  output: object({ orderId: string() }),
});

/** A read with path parameters and a query of lists, numbers and dates. */
export const searchProducts = defineRoute({
  id: 'test.products.search',
  method: 'GET',
  path: '/test/brands/:brand/products',
  summary: 'Search a brand’s test products',
  apps: ['customer'],
  access: { type: 'public' },
  rateLimit: 'read',
  idempotency: false,
  stepUp: false,
  owner: 'core',
  input: {
    params: object({ brand: string() }),
    query: object({ tag: array(string()), page: number(), from: date() }),
  },
  output: object({ items: array(string()) }),
});

export interface SentRequest {
  method: string;
  path: string;
  search: string;
  headers: Headers;
  body: unknown;
}

type Answer = () => Response | Promise<Response>;

export interface FakeGateway {
  fetch: (input: URL | Request | string, init?: RequestInit) => Promise<Response>;
  requests: SentRequest[];
  /** The browser's cookies: a working access token, a session behind the refresh cookie. */
  state: { access: boolean; session: boolean; steppedUp: boolean };
  /** Answers the next refreshes instead of the session rules, in order. */
  refreshAnswers: Answer[];
  /** Answers the next other requests instead of the rules, in order. */
  answers: Answer[];
  paths(): string[];
}

export const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const failure = (status: number, code: string, message = `${code} message`): Response =>
  json(status, { error: { code, message, requestId: 'req-1' } });

const me = {
  user: {
    userId: USER_ID,
    email: EMAIL,
    ageDeclaredAt: null,
    signUpApp: 'customer',
    providers: ['password'],
    authenticator: true,
  },
  session: { sessionId: SESSION_ID, app: 'customer', expiresAt: EXPIRES_AT },
};

/** The gateway and identity as the browser sees them, cookies included. */
export function fakeGateway(initial: Partial<FakeGateway['state']> = {}): FakeGateway {
  const gateway: FakeGateway = {
    requests: [],
    state: { access: false, session: true, steppedUp: true, ...initial },
    refreshAnswers: [],
    answers: [],
    paths: () => gateway.requests.map((request) => `${request.method} ${request.path}`),
    fetch: async (input, init) => {
      // axios's fetch adapter hands over a Request
      const request = new Request(input, init);
      if (request.signal.aborted) throw new DOMException('The call was aborted', 'AbortError');
      const url = new URL(request.url);
      const { method } = request;
      const text = await request.text();
      const body: unknown = text === '' ? undefined : JSON.parse(text);
      gateway.requests.push({
        method,
        path: url.pathname,
        search: url.search,
        headers: request.headers,
        body,
      });
      const { state } = gateway;
      if (method === 'POST' && url.pathname === '/api/v1/auth/refresh') {
        const answer = gateway.refreshAnswers.shift();
        if (answer) return answer();
        if (!state.session) return failure(401, 'SESSION_EXPIRED');
        state.access = true;
        return json(200, {
          data: {
            user: { userId: USER_ID, email: EMAIL },
            sessionId: SESSION_ID,
            expiresAt: EXPIRES_AT,
          },
        });
      }
      const answer = gateway.answers.shift();
      if (answer) return answer();
      if (method === 'GET' && url.pathname.startsWith('/api/v1/test/brands/')) {
        return json(200, { data: { items: ['lipstick'] } });
      }
      if (method === 'GET' && url.pathname === '/api/v1/iam/me') {
        if (!state.access) return failure(401, 'UNAUTHENTICATED');
        return json(200, { data: me });
      }
      if (method === 'POST' && url.pathname === '/api/v1/test/orders') {
        if (!state.access) return failure(401, 'UNAUTHENTICATED');
        if (!state.steppedUp) return failure(401, 'STEP_UP_REQUIRED');
        return json(201, { data: { orderId: 'order-1' } });
      }
      return failure(404, 'NOT_FOUND');
    },
  };
  return gateway;
}

/** A promise and the functions that settle it, for answers that come when the test says so. */
export function deferred<Value>() {
  let resolve: (value: Value) => void = () => undefined;
  const promise = new Promise<Value>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}
