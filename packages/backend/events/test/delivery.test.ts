import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { createVerifier, type SigningKey } from '@beautinique/backend-server-kit';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  createInboxEndpoint,
  inboxPath,
  inProcessDelivery,
  signedHttpDelivery,
} from '../src/delivery.ts';
import type { DeliveryRequest, DeliveryStatus, Inbox } from '../src/inbox.ts';
import { clockAt, recordingLogger } from './utils/fixtures.ts';

const KEY: SigningKey = { id: 'k1', secret: 'test-signing-secret-of-the-events' };

function fakeInbox(
  subscriber: string,
  answer: (request: DeliveryRequest) => Promise<DeliveryStatus>,
): Inbox & {
  received: DeliveryRequest[];
} {
  const received: DeliveryRequest[] = [];
  return {
    subscriber,
    takes: new Set(['commerce.order.placed@1']),
    received,
    receive(request) {
      received.push(request);
      return answer(request);
    },
  };
}

const request = (subscriber = 'finance'): DeliveryRequest => ({
  subscriber,
  payload: '{"eventId":"e1","type":"commerce.order.placed","version":1,"producer":"commerce"}',
  attempt: 2,
  maxAttempts: 8,
});

describe('in-process delivery: a bundle (docs/ARCHITECTURE.md §3 rule 2)', () => {
  it("SR-071: gives the try to the subscriber's inbox and brings back its answer", async () => {
    const finance = fakeInbox('finance', () => Promise.resolve('delivered'));
    const transport = inProcessDelivery([finance]);

    expect(await transport.deliver(request())).toBe('delivered');
    expect(finance.received).toEqual([request()]);
    expect([...transport.subscribers]).toEqual(['finance']);
  });

  it('SR-071: a subscriber with no inbox here is a failure, and two inboxes of one subscriber are refused', async () => {
    const transport = inProcessDelivery([fakeInbox('finance', () => Promise.resolve('delivered'))]);
    expect(await transport.deliver(request('notify'))).toBe('failed');
    expect(() =>
      inProcessDelivery([
        fakeInbox('finance', () => Promise.resolve('delivered')),
        fakeInbox('finance', () => Promise.resolve('delivered')),
      ]),
    ).toThrow('The inbox of finance is given twice.');
  });
});

describe('signed HTTP delivery: a split (SR-071)', () => {
  let server: Server;
  let baseUrl: string;
  let answer: (request: DeliveryRequest) => Promise<DeliveryStatus> = () =>
    Promise.resolve('delivered');
  const finance = fakeInbox('finance', (given) => answer(given));
  const clock = clockAt();
  const logger = recordingLogger();
  const endpoint = createInboxEndpoint(finance, { verifier: createVerifier([KEY], clock), logger });
  let raw: ((body: string) => { status: number; body: string }) | undefined;

  beforeAll(async () => {
    server = createServer((incoming, outgoing) => {
      let body = '';
      incoming.setEncoding('utf8');
      incoming.on('data', (chunk: string) => {
        body += chunk;
      });
      incoming.on('end', () => {
        if (raw !== undefined) {
          const forced = raw(body);
          outgoing
            .writeHead(forced.status, { 'content-type': 'application/json' })
            .end(forced.body);
          return;
        }
        if (incoming.url !== inboxPath('finance')) {
          outgoing.writeHead(404).end();
          return;
        }
        const headers = Object.fromEntries(
          Object.entries(incoming.headers).map(([name, value]) => [
            name,
            Array.isArray(value) ? value[0] : value,
          ]),
        );
        void endpoint({ headers, body }).then((result) => {
          outgoing
            .writeHead(result.status, { 'content-type': 'application/json' })
            .end(JSON.stringify(result.body));
        });
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  const transport = (key: SigningKey = KEY) =>
    signedHttpDelivery({ baseUrls: { finance: baseUrl }, key, clock, logger });

  it('SR-071: a signed try reaches the inbox with its payload and count, and its answer comes back', async () => {
    raw = undefined;
    for (const status of ['delivered', 'failed', 'dead', 'unavailable'] as const) {
      answer = () => Promise.resolve(status);
      expect(await transport().deliver(request())).toBe(status);
    }
    expect(finance.received.at(-1)).toEqual(request());
  });

  it('SR-071: a try signed with a key the inbox does not know is turned away (401) and counts as failed', async () => {
    raw = undefined;
    const before = finance.received.length;
    expect(
      await transport({ id: 'k2', secret: 'another-secret-of-the-events' }).deliver(request()),
    ).toBe('failed');
    expect(finance.received).toHaveLength(before);
  });

  it('AC-PLATFORM-5: a 5xx or no answer is "down" (unavailable), not counted; a bad answer is failed', async () => {
    raw = () => ({ status: 503, body: '{}' });
    expect(await transport().deliver(request())).toBe('unavailable');
    raw = () => ({ status: 200, body: '{"status":"maybe"}' });
    expect(await transport().deliver(request())).toBe('failed');
    raw = () => ({ status: 200, body: 'not json' });
    expect(await transport().deliver(request())).toBe('failed');
    raw = undefined;

    const unreachable = signedHttpDelivery({
      baseUrls: { finance: 'http://127.0.0.1:1' },
      key: KEY,
      clock,
      logger,
    });
    expect(await unreachable.deliver(request())).toBe('unavailable');
    expect(await transport().deliver(request('notify'))).toBe('failed');
  });

  it('SR-071: a send that throws is "down"; the subscribers are checked at boot', async () => {
    const send = vi.fn(() => Promise.reject(new TypeError('fetch failed')));
    const failing = signedHttpDelivery({
      baseUrls: { finance: baseUrl },
      key: KEY,
      clock,
      logger,
      send,
    });
    expect(await failing.deliver(request())).toBe('unavailable');
    expect(() =>
      signedHttpDelivery({ baseUrls: { shop: baseUrl }, key: KEY, clock, logger }),
    ).toThrow(RangeError);
  });

  it('SR-036: the endpoint takes only a signed body of { payload, attempt, maxAttempts }', async () => {
    const { signCall } = await import('@beautinique/backend-server-kit');
    const call = (body: string) =>
      endpoint({
        headers: signCall(KEY, 'events.finance', body, clock.now(), crypto.randomUUID()),
        body,
      });

    expect((await call('not json')).status).toBe(400);
    const extra = await call(
      JSON.stringify({ payload: 'x', attempt: 1, maxAttempts: 8, more: true }),
    );
    expect(extra.status).toBe(400);
    const zero = await call(JSON.stringify({ payload: 'x', attempt: 0, maxAttempts: 8 }));
    expect(zero).toMatchObject({ status: 400 });
    expect(JSON.stringify(zero.body)).toContain('body.attempt');
    // Signed for another inbox: turned away.
    const body = JSON.stringify({ payload: 'x', attempt: 1, maxAttempts: 8 });
    const other = await endpoint({
      headers: signCall(KEY, 'events.notify', body, clock.now(), 'n-1'),
      body,
    });
    expect(other.status).toBe(401);
  });

  it('SR-077: an inbox that throws is a 500 that says nothing of it, and it is logged', async () => {
    raw = undefined;
    answer = () => Promise.reject(new TypeError('a bug with secret-value-42'));
    const { signCall } = await import('@beautinique/backend-server-kit');
    const body = JSON.stringify({ payload: 'x', attempt: 1, maxAttempts: 8 });
    const result = await endpoint({
      headers: signCall(KEY, 'events.finance', body, clock.now(), 'n-2'),
      body,
    });

    expect(result.status).toBe(500);
    expect(JSON.stringify(result.body)).not.toContain('secret-value-42');
    expect(logger.lines.at(-1)?.message).toBe('An inbox call failed.');
  });
});
