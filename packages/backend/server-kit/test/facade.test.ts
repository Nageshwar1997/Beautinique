import { createFakeClock } from '@beautinique/shared-clock';
import { strictObject, string } from 'zod';
import { describe, expect, it, vi } from 'vitest';

import { grant, actorOf, NOW, orderRead } from './utils/fixtures.ts';
import { AppError, notFound } from '../src/errors.ts';
import {
  answerFacadeCall,
  createFacadeClient,
  createFacadeEndpoint,
  defineFacade,
  facadePath,
  inProcessTransport,
  signedHttpTransport,
  type FacadeImplementation,
  type FacadeTransport,
} from '../src/facade.ts';
import { createVerifier, signCall, type SigningKey } from '../src/signing.ts';

const orderIn = strictObject(
  { orderId: string('orderId is required.') },
  'The input takes orderId only.',
);
const orderOut = strictObject(
  { orderId: string('orderId is required.'), status: string('status is required.') },
  'The answer has orderId and status only.',
);

const commerce = defineFacade('commerce', {
  getOrder: { input: orderIn, output: orderOut },
  ping: {
    input: strictObject({}, 'The input is empty.'),
    output: strictObject({ ok: string('ok is required.') }, 'The answer has ok only.'),
  },
});

const key: SigningKey = { id: 'k1', secret: 'a-test-secret-of-the-test-only' };
const call = { actor: actorOf([grant(orderRead)]), requestId: 'req-1' };

function implementation() {
  const seen: unknown[] = [];
  const implemented: FacadeImplementation<typeof commerce.methods> = {
    getOrder: (input, context) => {
      seen.push(input, context);
      if (input.orderId === 'gone') return Promise.reject(notFound());
      if (input.orderId === 'leaky')
        return Promise.resolve({ orderId: 'leaky', status: 'x', phone: '9876543210' } as never);
      if (input.orderId === 'boom') return Promise.reject(new Error('db password=hunter2'));
      return Promise.resolve({ orderId: input.orderId, status: 'open' });
    },
    ping: () => Promise.resolve({ ok: 'yes' }),
  };
  return { implemented, seen };
}

// The two modes, made the same way: a bundle (a function call) and a split (signed HTTP, sent to
// the endpoint of the service that owns the facade without a network).
function modes() {
  const clock = createFakeClock(NOW);
  const logger = { error: vi.fn() };
  const { implemented, seen } = implementation();
  const endpoint = createFacadeEndpoint(commerce, implemented, {
    verifier: createVerifier([key], clock),
    logger,
  });
  const send = ((url: string, init: RequestInit) => {
    const method = new URL(url).pathname.split('/').pop() as string;
    const headers = Object.fromEntries(
      Object.entries(init.headers as Record<string, string>).map(([name, value]) => [
        name.toLowerCase(),
        value,
      ]),
    );
    return endpoint(method, { headers, body: init.body as string }).then(
      (answer) => new Response(JSON.stringify(answer.body), { status: answer.status }),
    );
  }) as typeof fetch;
  let nonce = 0;
  const split = signedHttpTransport({
    baseUrl: 'http://commerce.internal:4000',
    key,
    clock,
    send,
    nonce: () => `nonce-${String((nonce += 1))}`,
  });
  return {
    clock,
    logger,
    seen,
    endpoint,
    bundle: createFacadeClient(commerce, inProcessTransport(commerce, implemented)),
    split: createFacadeClient(commerce, split),
  };
}

describe('defineFacade', () => {
  it('SR-071: a facade is of a service of the list, and its calls are in camelCase', () => {
    expect(commerce.service).toBe('commerce');
    expect(Object.isFrozen(commerce)).toBe(true);
    expect(() => defineFacade('shop' as never, {})).toThrow(
      'The facade of shop is not of a service of the list.',
    );
    expect(() =>
      defineFacade('commerce', { 'get-order': { input: orderIn, output: orderOut } }),
    ).toThrow('The call get-order of the facade of commerce is not in camelCase.');
    expect(facadePath('commerce', 'getOrder')).toBe('/internal/commerce/getOrder');
  });
});

describe('a facade in the two modes (docs/ARCHITECTURE.md §2.4 rule 10, SR-071)', () => {
  it.each(['bundle', 'split'] as const)(
    'SR-071: %s: the call gives what the owner answers, and the owner sees the actor and the request id',
    async (mode) => {
      const { seen, ...all } = modes();

      const answer = await all[mode].getOrder({ orderId: 'o1' }, call);

      expect(answer).toEqual({ orderId: 'o1', status: 'open' });
      expect(seen).toEqual([{ orderId: 'o1' }, call]);
      expect(await all[mode].ping({}, { actor: undefined, requestId: 'req-2' })).toEqual({
        ok: 'yes',
      });
    },
  );

  it.each(['bundle', 'split'] as const)(
    'SR-071: %s: an error of the owner is the same AppError',
    async (mode) => {
      const all = modes();

      const error = await all[mode]
        .getOrder({ orderId: 'gone' }, call)
        .catch((thrown: unknown) => thrown);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
        message: 'This was not found.',
      });
    },
  );

  it.each(['bundle', 'split'] as const)(
    'SR-036: %s: a field that the facade does not name never leaves the owner',
    async (mode) => {
      const all = modes();

      const error = await all[mode]
        .getOrder({ orderId: 'leaky' }, call)
        .catch((thrown: unknown) => thrown);

      expect(error).toMatchObject({ status: 500, code: 'INTERNAL' });
      expect(JSON.stringify(error)).not.toContain('9876543210');
    },
  );

  it.each(['bundle', 'split'] as const)(
    'SR-036: %s: an input that does not fit stops at the caller',
    async (mode) => {
      const all = modes();

      await expect(all[mode].getOrder({ orderId: 1 } as never, call)).rejects.toThrow();
      await expect(
        all[mode].getOrder({ orderId: 'o1', role: 'x' } as never, call),
      ).rejects.toThrow();
    },
  );

  it('SR-077: an unexpected failure of the owner is a 500 that says nothing, and is logged', async () => {
    const all = modes();

    const error = await all.split
      .getOrder({ orderId: 'boom' }, call)
      .catch((thrown: unknown) => thrown);

    expect(error).toMatchObject({ status: 500, code: 'INTERNAL' });
    expect(JSON.stringify(error)).not.toContain('hunter2');
    expect(all.logger.error).toHaveBeenCalledTimes(1);
  });
});

describe('the owner of a facade: answerFacadeCall and the endpoint', () => {
  it('SR-036: the owner checks the input itself, so a caller that did not is still refused', async () => {
    const { implemented } = implementation();

    await expect(
      answerFacadeCall(commerce, implemented, 'getOrder', { orderId: 5 }, call),
    ).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
    });
    await expect(answerFacadeCall(commerce, implemented, 'nope', {}, call)).rejects.toMatchObject({
      status: 404,
    });
    // The name of a call is looked for as its own, never up the chain of objects.
    for (const name of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      await expect(
        answerFacadeCall(commerce, implemented, name, {}, call),
        name,
      ).rejects.toMatchObject({ status: 404 });
    }
  });

  const body = JSON.stringify({ input: { orderId: 'o1' }, actor: call.actor, requestId: 'req-1' });
  const headersFor = (text: string, nonce: string, name = 'commerce.getOrder', signer = key) =>
    Object.fromEntries(Object.entries(signCall(signer, name, text, NOW, nonce)));

  it('SR-071: a call that is not signed, signed by a key that is not known, or changed, is 401 and says no reason', async () => {
    const { endpoint } = modes();
    const wrong = [
      {},
      headersFor(body, 'n1', 'commerce.getOrder', { id: 'k9', secret: 'x' }),
      headersFor(`${body} `, 'n2'),
      headersFor(body, 'n3', 'commerce.ping'),
    ];

    for (const headers of wrong) {
      const answer = await endpoint('getOrder', { headers, body });
      expect(answer.status).toBe(401);
      expect(answer.body).toMatchObject({ error: { code: 'UNAUTHENTICATED' } });
      expect(JSON.stringify(answer.body)).not.toMatch(/key|signature|stale|nonce/i);
    }
  });

  it('SR-071: a call that is sent twice is turned away the second time', async () => {
    const { endpoint } = modes();
    const headers = headersFor(body, 'n1');

    expect((await endpoint('getOrder', { headers, body })).status).toBe(200);
    expect((await endpoint('getOrder', { headers, body })).status).toBe(401);
  });

  it('SR-036: a body that is not JSON, or is not { input, actor, requestId }, is 400', async () => {
    const { endpoint } = modes();
    const send = (text: string, nonce: string) =>
      endpoint('getOrder', { headers: headersFor(text, nonce), body: text });

    expect((await send('{not json', 'a')).status).toBe(400);
    expect((await send('{"input":{}}', 'b')).status).toBe(400);
    expect((await send('{"input":{},"requestId":"r","extra":1}', 'c')).status).toBe(400);
    expect(
      (await send(JSON.stringify({ input: {}, requestId: 'r', actor: { accountId: 'a' } }), 'd'))
        .status,
    ).toBe(400);
    const bad = await send('{"input":{}}', 'e');
    expect(bad.body).toMatchObject({ error: { code: 'VALIDATION_FAILED' } });
  });

  it('SR-071: a call that is signed for a call that the facade does not have is 404', async () => {
    const { endpoint } = modes();
    const text = JSON.stringify({ input: {}, requestId: 'r' });

    const answer = await endpoint('nope', {
      headers: headersFor(text, 'n1', 'commerce.nope'),
      body: text,
    });

    expect(answer.status).toBe(404);
  });

  it('SR-077: the request id of the answer is the one in the header if it is safe, else a new one', async () => {
    const { endpoint } = modes();
    const good = await endpoint('getOrder', {
      headers: { 'x-request-id': 'req-from-gateway' },
      body,
    });
    const bad = await endpoint('getOrder', {
      headers: { 'x-request-id': 'a\nfake log line' },
      body,
    });

    expect(good.body).toMatchObject({ error: { requestId: 'req-from-gateway' } });
    expect((bad.body as { error: { requestId: string } }).error.requestId).toMatch(
      /^[0-9a-f-]{36}$/,
    );
  });
});

describe('signedHttpTransport', () => {
  const transport = (response: Response, captured: unknown[] = []): FacadeTransport =>
    signedHttpTransport({
      baseUrl: 'http://commerce.internal:4000',
      key,
      clock: createFakeClock(NOW),
      send: ((url: string, init: RequestInit) => {
        captured.push(url, init);
        return Promise.resolve(response);
      }) as typeof fetch,
    });
  const request = {
    service: 'commerce',
    method: 'getOrder',
    input: { orderId: 'o1' },
    call,
  } as const;

  it('SR-071: posts the envelope to /internal/<service>/<call>, signed, with no actor header', async () => {
    const captured: unknown[] = [];
    await transport(
      new Response(JSON.stringify({ output: { ok: 1 } }), { status: 200 }),
      captured,
    )(request);

    const [url, init] = captured as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe('http://commerce.internal:4000/internal/commerce/getOrder');
    expect(init.method).toBe('POST');
    expect(init.headers['content-type']).toBe('application/json');
    expect(Object.keys(init.headers).sort()).toEqual([
      'content-type',
      'x-bq-key-id',
      'x-bq-nonce',
      'x-bq-signature',
      'x-bq-timestamp',
    ]);
    expect(JSON.parse(init.body as string)).toEqual({
      input: { orderId: 'o1' },
      actor: call.actor,
      requestId: 'req-1',
    });
  });

  it('SR-071: a call with no actor sends none', async () => {
    const captured: unknown[] = [];
    await transport(
      new Response(JSON.stringify({ output: null }), { status: 200 }),
      captured,
    )({
      ...request,
      call: { actor: undefined, requestId: 'req-9' },
    });

    expect(JSON.parse((captured[1] as RequestInit).body as string)).toEqual({
      input: { orderId: 'o1' },
      requestId: 'req-9',
    });
  });

  it('CR-18: an answer that is not an error in the one shape is a 500 that says nothing of it', async () => {
    for (const response of [
      new Response('<html>bad gateway</html>', { status: 502 }),
      new Response(JSON.stringify({ message: 'nope' }), { status: 400 }),
    ]) {
      await expect(transport(response)(request)).rejects.toMatchObject({
        status: 500,
        code: 'INTERNAL',
      });
    }
  });

  it('CR-18: an error in the one shape is the same AppError; a status that is not known is 500', async () => {
    const shape = (status: number) =>
      new Response(
        JSON.stringify({
          error: {
            code: 'COMMERCE_ORDER_CLOSED',
            message: 'Closed.',
            details: { a: 1 },
            requestId: 'r',
          },
        }),
        { status },
      );

    await expect(transport(shape(422))(request)).rejects.toMatchObject({
      status: 422,
      code: 'COMMERCE_ORDER_CLOSED',
      message: 'Closed.',
      details: { a: 1 },
    });
    await expect(transport(shape(418))(request)).rejects.toMatchObject({
      status: 500,
      code: 'COMMERCE_ORDER_CLOSED',
    });
  });
});
