import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

import type { Clock } from '@beautinique/shared-clock';

/** The key that signs the calls between services, and the name it goes by (so keys can be changed one at a time). */
export interface SigningKey {
  id: string;
  secret: Buffer | string;
}

export type SignedHeaders = Record<
  'x-bq-key-id' | 'x-bq-timestamp' | 'x-bq-nonce' | 'x-bq-signature',
  string
>;

/** A call is good this long after it was signed, and this long before (the clocks of two machines differ). */
export const SIGNATURE_WINDOW_MS = 60 * 1000;

/** How many nonces are remembered to turn away a call that is sent twice: each lives for the window. */
const MAX_NONCES = 10_000;

// What is signed: the name of the call, the time, the nonce and the hash of the body, one on each
// line, so no part can be moved into another. The body (with the actor in it) is covered by its
// hash, so a call cannot be changed on the way.
function stringToSign(call: string, timestamp: string, nonce: string, body: string): string {
  const bodyHash = createHash('sha256').update(body).digest('hex');
  return `bq-call-v1\n${call}\n${timestamp}\n${nonce}\n${bodyHash}`;
}

function sign(key: SigningKey, text: string): string {
  return createHmac('sha256', key.secret).update(text).digest('hex');
}

/** Signs a call (`<service>.<method>`) with its body: the headers to send with it. */
export function signCall(
  key: SigningKey,
  call: string,
  body: string,
  now: Date,
  nonce: string,
): SignedHeaders {
  const timestamp = String(now.getTime());
  return {
    'x-bq-key-id': key.id,
    'x-bq-timestamp': timestamp,
    'x-bq-nonce': nonce,
    'x-bq-signature': sign(key, stringToSign(call, timestamp, nonce, body)),
  };
}

export type Verdict =
  | { ok: true }
  | { ok: false; reason: 'unsigned' | 'unknown-key' | 'stale' | 'bad-signature' | 'replayed' };

export interface Verifier {
  verify(
    call: string,
    body: string,
    headers: Readonly<Record<string, string | undefined>>,
  ): Verdict;
}

/**
 * Checks the calls that come from another service (SR-071: in split mode the calls inside are
 * signed). The key is looked up by its id; the signature is compared in constant time; a call that
 * is older or newer than the window, or whose nonce was seen, is turned away. The nonces are kept
 * for the window only, and at most `MAX_NONCES` of them.
 */
export function createVerifier(keys: readonly SigningKey[], clock: Clock): Verifier {
  const byId = new Map(keys.map((key) => [key.id, key]));
  const seen = new Map<string, number>();

  function forget(now: number): void {
    for (const [nonce, at] of seen) {
      if (at + SIGNATURE_WINDOW_MS < now) seen.delete(nonce);
    }
  }

  return {
    verify(call, body, headers) {
      const keyId = headers['x-bq-key-id'];
      const timestamp = headers['x-bq-timestamp'];
      const nonce = headers['x-bq-nonce'];
      const signature = headers['x-bq-signature'];
      if (
        keyId === undefined ||
        timestamp === undefined ||
        nonce === undefined ||
        signature === undefined
      ) {
        return { ok: false, reason: 'unsigned' };
      }
      const key = byId.get(keyId);
      if (key === undefined) return { ok: false, reason: 'unknown-key' };

      const now = clock.now().getTime();
      const sentAt = Number(timestamp);
      if (!Number.isFinite(sentAt) || Math.abs(now - sentAt) > SIGNATURE_WINDOW_MS) {
        return { ok: false, reason: 'stale' };
      }

      const expected = Buffer.from(sign(key, stringToSign(call, timestamp, nonce, body)), 'hex');
      const given = Buffer.from(signature, 'hex');
      if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
        return { ok: false, reason: 'bad-signature' };
      }

      // Only a call that is signed right counts as a nonce, so nobody can fill the list with others'.
      // A nonce counts for the window only: an older one is the same as one never seen.
      const before = seen.get(nonce);
      if (before !== undefined && before + SIGNATURE_WINDOW_MS >= now) {
        return { ok: false, reason: 'replayed' };
      }
      seen.delete(nonce); // out and in again, so that the map keeps the order of the calls
      if (seen.size >= MAX_NONCES) forget(now);
      if (seen.size >= MAX_NONCES) {
        // Full of nonces that are still in their window: the oldest goes (a Map keeps the order).
        const oldest = seen.keys().next();
        if (oldest.done !== true) seen.delete(oldest.value);
      }
      seen.set(nonce, now);
      return { ok: true };
    },
  };
}
