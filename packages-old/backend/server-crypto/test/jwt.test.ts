import { createHmac, generateKeyPairSync, type KeyObject } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  generateSigningKey,
  type JwtClaims,
  JwtError,
  publicKeyFromJwk,
  signJwt,
  verifyJwt,
  type VerifyJwtOptions,
} from '../src/index';

const key = generateSigningKey();
const keys = new Map<string, KeyObject>([[key.kid, publicKeyFromJwk(key.publicJwk)]]);
const now = 1_800_000_000_000;
const claims: JwtClaims = {
  iss: 'bq:identity',
  sub: 'user-1',
  aud: 'bq:customer',
  iat: now / 1000,
  exp: now / 1000 + 600,
  sid: 'session-1',
};
const options: VerifyJwtOptions = { keys, audience: 'bq:customer', issuer: 'bq:identity', now };
const token = signJwt(claims, { kid: key.kid, privateKey: key.privateKeyPem });

const reasonOf = (given: string, more: Partial<typeof options> = {}) => {
  try {
    verifyJwt(given, { ...options, ...more });
    return 'accepted';
  } catch (error) {
    if (error instanceof JwtError) return error.reason;
    throw error;
  }
};
const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const [header = '', payload = '', signature = ''] = token.split('.');

describe('ES256 tokens', () => {
  it('sign and verify, with the key id and every claim', () => {
    expect(verifyJwt(token, options)).toEqual(claims);
    expect(JSON.parse(Buffer.from(header, 'base64url').toString())).toEqual({
      alg: 'ES256',
      typ: 'JWT',
      kid: key.kid,
    });
    expect(Buffer.from(signature, 'base64url')).toHaveLength(64);
  });

  it('are JOSE signatures another implementation (WebCrypto) verifies', async () => {
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      key.publicJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    );
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      Buffer.from(signature, 'base64url'),
      Buffer.from(`${header}.${payload}`),
    );
    expect(valid).toBe(true);
  });

  it('refuse a changed payload, another key, and an unknown key id', () => {
    const changed = `${header}.${part({ ...claims, sub: 'user-2' })}.${signature}`;
    expect(reasonOf(changed)).toBe('signature');
    const other = generateSigningKey();
    const forged = signJwt(claims, { kid: key.kid, privateKey: other.privateKeyPem });
    expect(reasonOf(forged)).toBe('signature');
    expect(reasonOf(signJwt(claims, { kid: other.kid, privateKey: other.privateKeyPem }))).toBe(
      'unknown-key',
    );
    expect(reasonOf(`${header}.${payload}.${signature.slice(0, -4)}`)).toBe('signature');
  });

  it('refuse alg none and a public key used as an HMAC secret', () => {
    expect(reasonOf(`${part({ alg: 'none', kid: key.kid })}.${payload}.`)).toBe('algorithm');
    const hsHeader = part({ alg: 'HS256', typ: 'JWT', kid: key.kid });
    const mac = createHmac('sha256', JSON.stringify(key.publicJwk))
      .update(`${hsHeader}.${payload}`)
      .digest('base64url');
    expect(reasonOf(`${hsHeader}.${payload}.${mac}`)).toBe('algorithm');
  });

  it('refuse an expired token and one from the future, past 30 seconds of leeway', () => {
    expect(reasonOf(token, { now: now + 600_000 + 29_000 })).toBe('accepted');
    expect(reasonOf(token, { now: now + 600_000 + 31_000 })).toBe('expired');
    expect(reasonOf(token, { now: now - 29_000 })).toBe('accepted');
    expect(reasonOf(token, { now: now - 31_000 })).toBe('not-yet-valid');
    expect(reasonOf(token, { now: now + 600_000 + 5_000, leewaySeconds: 0 })).toBe('expired');
  });

  it('refuse another audience or issuer', () => {
    expect(reasonOf(token, { audience: 'bq:admin' })).toBe('audience');
    expect(reasonOf(token, { issuer: 'bq:other' })).toBe('issuer');
  });

  it('refuse malformed tokens without throwing anything else', () => {
    for (const bad of [
      '',
      'a.b',
      'a.b.c.d',
      `${header}.${payload}.${signature}=`,
      `${part([1])}.${payload}.${signature}`,
      `${Buffer.from('not json').toString('base64url')}.${payload}.${signature}`,
      `${header}.${payload}.${signature}*`,
    ]) {
      expect(['malformed', 'signature'], JSON.stringify(bad)).toContain(reasonOf(bad));
    }
    const noSub = signJwt(
      { ...claims, sub: 7 as unknown as string },
      {
        kid: key.kid,
        privateKey: key.privateKeyPem,
      },
    );
    expect(reasonOf(noSub)).toBe('malformed');
    const noExp = signJwt(
      { ...claims, exp: undefined as unknown as number },
      {
        kid: key.kid,
        privateKey: key.privateKeyPem,
      },
    );
    expect(reasonOf(noExp)).toBe('expired');
  });
});

describe('signing keys', () => {
  it('are new P-256 keys with their own key id and a public JWK', () => {
    const other = generateSigningKey();
    expect(other.kid).not.toBe(key.kid);
    expect(key.publicJwk).toMatchObject({ kty: 'EC', crv: 'P-256', alg: 'ES256', use: 'sig' });
    expect(key.privateKeyPem).toMatch(/^-----BEGIN PRIVATE KEY-----/);
    expect(JSON.stringify(key.publicJwk)).not.toContain('"d"');
  });

  it('read back only ES256 public keys from a JWKS entry', () => {
    const rsa = generateKeyPairSync('rsa', { modulusLength: 2048 }).publicKey.export({
      format: 'jwk',
    });
    const p384 = generateKeyPairSync('ec', { namedCurve: 'P-384' }).publicKey.export({
      format: 'jwk',
    });
    for (const bad of [rsa, p384, null, {}, { ...key.publicJwk, x: 'AAAA' }]) {
      expect(() => publicKeyFromJwk(bad), JSON.stringify(bad)).toThrow('Not an ES256 public key');
    }
  });
});
