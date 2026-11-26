import { createFakeClock } from '@beautinique/shared-clock';
import { describe, expect, it } from 'vitest';

import { createVerifier, signCall, SIGNATURE_WINDOW_MS, type SigningKey } from '../src/signing.ts';
import { NOW } from './utils/fixtures.ts';

const key: SigningKey = { id: 'k1', secret: 'a-test-secret-of-the-test-only' };
const body = JSON.stringify({ input: { orderId: 'o1' }, requestId: 'req-1' });

function setup(keys: SigningKey[] = [key]) {
  const clock = createFakeClock(NOW);
  return { clock, verifier: createVerifier(keys, clock) };
}

describe('signed calls between services (SR-071)', () => {
  it('SR-071: a call that is signed right, in time, is accepted', () => {
    const { verifier } = setup();
    const headers = signCall(key, 'commerce.getOrder', body, NOW, 'n1');

    expect(verifier.verify('commerce.getOrder', body, headers)).toEqual({ ok: true });
  });

  it('SR-071: a call that is not signed, or is signed by a key that is not known, is turned away', () => {
    const { verifier } = setup();
    const headers = signCall(key, 'commerce.getOrder', body, NOW, 'n1');

    expect(verifier.verify('commerce.getOrder', body, {})).toEqual({
      ok: false,
      reason: 'unsigned',
    });
    for (const missing of Object.keys(headers)) {
      const partial: Record<string, string | undefined> = { ...headers, [missing]: undefined };
      expect(verifier.verify('commerce.getOrder', body, partial), missing).toEqual({
        ok: false,
        reason: 'unsigned',
      });
    }
    const other = signCall({ id: 'k9', secret: 'x' }, 'commerce.getOrder', body, NOW, 'n2');
    expect(verifier.verify('commerce.getOrder', body, other)).toEqual({
      ok: false,
      reason: 'unknown-key',
    });
  });

  it('SR-071: a body, a call or a key that is not the signed one is a bad signature', () => {
    const { verifier } = setup([key, { id: 'k2', secret: 'another-test-secret' }]);
    const headers = signCall(key, 'commerce.getOrder', body, NOW, 'n1');
    const bad = { ok: false, reason: 'bad-signature' };

    expect(verifier.verify('commerce.getOrder', `${body} `, headers)).toEqual(bad);
    expect(verifier.verify('commerce.cancelOrder', body, headers)).toEqual(bad);
    expect(verifier.verify('commerce.getOrder', body, { ...headers, 'x-bq-key-id': 'k2' })).toEqual(
      bad,
    );
    expect(verifier.verify('commerce.getOrder', body, { ...headers, 'x-bq-nonce': 'n2' })).toEqual(
      bad,
    );
    expect(
      verifier.verify('commerce.getOrder', body, { ...headers, 'x-bq-signature': 'zz' }),
    ).toEqual(bad);
    expect(
      verifier.verify('commerce.getOrder', body, {
        ...headers,
        'x-bq-signature': headers['x-bq-signature'].slice(2),
      }),
    ).toEqual(bad);
  });

  it('SR-071: the time is part of the signature, so it cannot be moved to make an old call new', () => {
    const { verifier, clock } = setup();
    const old = signCall(
      key,
      'commerce.getOrder',
      body,
      new Date(NOW.getTime() - SIGNATURE_WINDOW_MS - 1),
      'n1',
    );

    expect(verifier.verify('commerce.getOrder', body, old)).toEqual({ ok: false, reason: 'stale' });
    expect(
      verifier.verify('commerce.getOrder', body, {
        ...old,
        'x-bq-timestamp': String(clock.now().getTime()),
      }),
    ).toEqual({ ok: false, reason: 'bad-signature' });
  });

  it('SR-071: a call is good for a minute either side of now, and not a moment more', () => {
    const { verifier, clock } = setup();
    const at = (ms: number, nonce: string) =>
      signCall(key, 'commerce.getOrder', body, new Date(NOW.getTime() + ms), nonce);

    expect(verifier.verify('commerce.getOrder', body, at(-SIGNATURE_WINDOW_MS, 'a'))).toEqual({
      ok: true,
    });
    expect(verifier.verify('commerce.getOrder', body, at(SIGNATURE_WINDOW_MS, 'b'))).toEqual({
      ok: true,
    });
    expect(
      verifier.verify('commerce.getOrder', body, at(SIGNATURE_WINDOW_MS + 1, 'c')),
    ).toMatchObject({ reason: 'stale' });
    clock.advance(1);
    expect(verifier.verify('commerce.getOrder', body, at(-SIGNATURE_WINDOW_MS, 'd'))).toMatchObject(
      { reason: 'stale' },
    );
    const garbage = { ...at(0, 'e'), 'x-bq-timestamp': 'not-a-time' };
    expect(verifier.verify('commerce.getOrder', body, garbage)).toMatchObject({ reason: 'stale' });
  });

  it('SR-071: the same call sent twice is turned away the second time', () => {
    const { verifier } = setup();
    const headers = signCall(key, 'commerce.getOrder', body, NOW, 'n1');

    expect(verifier.verify('commerce.getOrder', body, headers)).toEqual({ ok: true });
    expect(verifier.verify('commerce.getOrder', body, headers)).toEqual({
      ok: false,
      reason: 'replayed',
    });
  });

  it('SR-071: a call that is not signed right does not use up a nonce', () => {
    const { verifier } = setup();
    const headers = signCall(key, 'commerce.getOrder', body, NOW, 'n1');

    expect(verifier.verify('commerce.getOrder', `${body} `, headers)).toMatchObject({
      reason: 'bad-signature',
    });
    expect(verifier.verify('commerce.getOrder', body, headers)).toEqual({ ok: true });
  });

  it('SR-071: the keys can be changed one at a time: both are accepted while both are known', () => {
    const next: SigningKey = { id: 'k2', secret: Buffer.from('a-new-secret-for-the-test-only') };
    const { verifier } = setup([key, next]);

    expect(verifier.verify('a.b', body, signCall(key, 'a.b', body, NOW, 'n1'))).toEqual({
      ok: true,
    });
    expect(verifier.verify('a.b', body, signCall(next, 'a.b', body, NOW, 'n2'))).toEqual({
      ok: true,
    });
  });

  it('SR-007, CR-40: the nonces are kept for the window only and are never more than 10,000', () => {
    const { verifier, clock } = setup();
    const send = (nonce: string) =>
      verifier.verify('a.b', body, signCall(key, 'a.b', body, clock.now(), nonce));

    for (let n = 0; n < 10_000; n += 1) expect(send(`n${String(n)}`).ok).toBe(true);
    // Full: the oldest goes, so a new call is accepted, and the newest is still remembered.
    expect(send('fresh').ok).toBe(true);
    expect(send('n9999')).toEqual({ ok: false, reason: 'replayed' });
    // After the window, the old ones are forgotten (swept when the list is full).
    clock.advance(SIGNATURE_WINDOW_MS + 1);
    expect(send('n9999').ok).toBe(true);
  });
});
