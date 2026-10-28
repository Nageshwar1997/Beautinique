import { generateSigningKey, signJwt } from '@beautinique/backend-server-crypto';
import { HEADERS, PASSPORT_ISSUER } from '@beautinique/shared-contracts';
import type { Request } from 'express';
import { describe, expect, it } from 'vitest';

import {
  AppError,
  cookieOf,
  jwksCache,
  passportSigner,
  passportVerifier,
  tokenKeyId,
} from '../src/index';

const passport = {
  userId: '0199f3a2-7c41-7b2e-9d10-4f6a2b8c1e01',
  sessionId: '0199f3a2-7c41-7b2e-9d10-4f6a2b8c1e02',
  app: 'seller' as const,
  methods: ['password', 'totp'],
  authzVersion: 3,
};
const requestWith = (token?: string) =>
  ({
    get: (name: string) => (name === HEADERS.passport ? token : undefined),
  }) as unknown as Request;

describe('cookieOf', () => {
  it('reads one cookie by its exact name, decoded, and nothing without a header', () => {
    const header = 'theme=dark; __Host-bq_seller_at=a%2Eb; __Host-bq_seller_at_x=other';
    expect(cookieOf(header, '__Host-bq_seller_at')).toBe('a.b');
    expect(cookieOf(header, 'bq_seller_at')).toBeUndefined();
    expect(cookieOf(undefined, 'theme')).toBeUndefined();
    expect(cookieOf('a=%E0%A4', 'a')).toBe('%E0%A4');
  });
});

describe('tokenKeyId', () => {
  it('reads the kid of a token header, and gives up on anything else', () => {
    const key = generateSigningKey();
    const token = signJwt(
      { iss: 'x', sub: 'y', aud: 'z', iat: 1, exp: 2 },
      { kid: key.kid, privateKey: key.privateKeyPem },
    );
    expect(tokenKeyId(token)).toBe(key.kid);
    for (const bad of ['', 'not-base64!.x.y', `${Buffer.from('[]').toString('base64url')}.x.y`]) {
      expect(tokenKeyId(bad), bad).toBeUndefined();
    }
  });
});

describe('jwksCache', () => {
  it('reads once, again after 10 minutes, and early for an unknown key at most every 30 s', async () => {
    let clock = 0;
    let loads = 0;
    let served = [generateSigningKey().publicJwk];
    const cache = jwksCache({
      load: () => {
        loads += 1;
        return Promise.resolve({ keys: served });
      },
      now: () => clock,
    });
    const first = served[0]?.kid ?? '';
    expect([...(await cache.keysFor(first)).keys()]).toEqual([first]);
    await cache.keysFor(first);
    expect(loads).toBe(1);
    // a key it does not know: read again, but not more than once per 30 s
    const rotated = generateSigningKey().publicJwk;
    served = [rotated, ...served];
    expect((await cache.keysFor(rotated.kid)).has(rotated.kid)).toBe(false);
    expect(loads).toBe(1);
    clock = 30_000;
    expect((await cache.keysFor(rotated.kid)).has(rotated.kid)).toBe(true);
    expect(loads).toBe(2);
    await cache.keysFor('made-up');
    expect(loads).toBe(2);
    clock = 30_000 + 10 * 60_000;
    await cache.keysFor(first);
    expect(loads).toBe(3);
  });

  it('keeps the keys it had when a read fails, and skips a bad entry', async () => {
    let clock = 0;
    let fail = false;
    const good = generateSigningKey().publicJwk;
    const cache = jwksCache({
      load: () =>
        fail
          ? Promise.reject(new Error('down'))
          : Promise.resolve({ keys: [{ kid: 'bad' }, good] }),
      now: () => clock,
    });
    expect([...(await cache.keysFor(good.kid)).keys()]).toEqual([good.kid]);
    fail = true;
    clock = 11 * 60_000;
    await expect(cache.keysFor(good.kid)).rejects.toThrow('down');
    clock = 11 * 60_000 + 1000;
    // within the refetch wait it keeps what it had
    expect((await cache.keysFor(good.kid)).has(good.kid)).toBe(true);
  });
});

describe('passports', () => {
  const signer = passportSigner();
  const keys = jwksCache({ load: () => Promise.resolve({ keys: signer.jwks }) });
  const verify = passportVerifier({ keys, audience: 'bq:identity' });

  it('carry who signed in, for one owner, 60 seconds', async () => {
    const token = signer.sign(passport, 'bq:identity');
    expect(await verify(requestWith(token))).toEqual(passport);
    const claims = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString()) as {
      iss: string;
      exp: number;
      iat: number;
    };
    expect(claims.iss).toBe(PASSPORT_ISSUER);
    expect(claims.exp - claims.iat).toBe(60);
  });

  it('refuse none, another owner’s, an old one and one from another key with 401', async () => {
    const other = passportSigner();
    const late = passportSigner(generateSigningKey(), () => Date.now() - 120_000);
    const lateVerify = passportVerifier({
      keys: jwksCache({ load: () => Promise.resolve({ keys: late.jwks }) }),
      audience: 'bq:identity',
    });
    for (const [check, token] of [
      [verify, undefined],
      [verify, signer.sign(passport, 'bq:core')],
      [verify, other.sign(passport, 'bq:identity')],
      [lateVerify, late.sign(passport, 'bq:identity')],
    ] as const) {
      const error = await check(requestWith(token)).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('UNAUTHENTICATED');
    }
  });

  it('answer 503 when the gateway’s keys cannot be read', async () => {
    const down = passportVerifier({
      keys: jwksCache({ load: () => Promise.reject(new Error('down')) }),
      audience: 'bq:identity',
    });
    const error = await down(requestWith(signer.sign(passport, 'bq:identity'))).catch(
      (e: unknown) => e,
    );
    expect((error as AppError).code).toBe('SERVICE_UNAVAILABLE');
  });
});
