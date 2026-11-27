import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createBlindIndex } from '../src/blind-index.ts';
import { createCodeHasher, hashToken } from '../src/codes.ts';
import { newKeyText, parseKeyring } from '../src/keyring.ts';
import { randomDigits, randomToken } from '../src/random.ts';
import { keyringOf } from './utils/keys.ts';

const NAME = 'IDENTITY_BLIND_KEYS';
const otp = { purpose: 'otp', ref: '6747a1b2c3d4e5f601234567' };

describe('code hashes (docs/ARCHITECTURE.md §10.3 rule 7, SR-063, D-469)', () => {
  const keys = keyringOf(NAME, 'k1');
  const codes = createCodeHasher({ service: 'identity', keys });

  it('SR-063: a code is kept as c1.<keyId>.<HMAC>, and only the same code of the same challenge matches', () => {
    const hashed = codes.hash('042917', otp);

    expect(hashed).toMatch(/^c1\.k1\.[A-Za-z0-9_-]{43}$/);
    expect(hashed).not.toContain('042917');
    expect(codes.verify('042917', hashed, otp)).toBe(true);
    expect(codes.verify('042918', hashed, otp)).toBe(false);
    expect(codes.verify('42917', hashed, otp)).toBe(false);
    expect(codes.service).toBe('identity');
  });

  it('SR-063: the hash of one challenge does not open another, nor another purpose or service', () => {
    const hashed = codes.hash('042917', otp);

    expect(codes.verify('042917', hashed, { ...otp, ref: '6747a1b2c3d4e5f601234568' })).toBe(false);
    expect(codes.verify('042917', hashed, { ...otp, purpose: 'recovery_code' })).toBe(false);
    expect(createCodeHasher({ service: 'commerce', keys }).verify('042917', hashed, otp)).toBe(
      false,
    );
  });

  it('SR-063: with the database alone the codes do not come back: the hash needs the key', () => {
    const digest = codes.hash('042917', otp).split('.')[2];
    // The plain SHA-256 of a six-digit code is found by trying a million; this one is not it, and
    // another key gives another hash for the same code and challenge.
    expect(digest).not.toBe(createHash('sha256').update('042917').digest('base64url'));
    const otherKey = createCodeHasher({ service: 'identity', keys: keyringOf(NAME, 'k1') });
    expect(otherKey.hash('042917', otp).split('.')[2]).not.toBe(digest);
  });

  it('SR-063: a code and a blind index of the same text, with the same key, are unrelated', () => {
    const asIndex = createBlindIndex({ service: 'identity', keys }).indexOf('042917', {
      collection: 'otp',
      field: 'code',
    });
    expect(asIndex.split('.')[2]).not.toBe(codes.hash('042917', otp).split('.')[2]);
  });

  it('a changed or foreign hash, or a wrong typed code, is false and never an error', () => {
    const hashed = codes.hash('042917', otp);
    const swapped = `${hashed.slice(0, -2)}${hashed.endsWith('AA') ? 'BA' : 'AA'}`;
    const typed: unknown[] = ['', 42, null, undefined, '\uD800', 'x'.repeat(64 * 1024 + 1)];

    expect(codes.verify('042917', swapped, otp)).toBe(false);
    expect(codes.verify('042917', hashed.replace('c1.', 'b1.'), otp)).toBe(false);
    expect(codes.verify('042917', 'c1.k1.AAAA', otp)).toBe(false);
    expect(codes.verify('042917', 'c1.k1', otp)).toBe(false);
    expect(codes.verify('042917', 'c1.K1.' + 'A'.repeat(43), otp)).toBe(false);
    expect(codes.verify('042917', 42 as unknown as string, otp)).toBe(false);
    for (const code of typed) expect(codes.verify(code, hashed, otp)).toBe(false);
    // A hash of a key that the keyring does not have.
    const other = createCodeHasher({ service: 'identity', keys: keyringOf(NAME, 'k9') });
    expect(codes.verify('042917', other.hash('042917', otp), otp)).toBe(false);
  });

  it('SR-063: after a new key, a code hashed with the old key still matches while that key is in the keyring', () => {
    const k1 = newKeyText('k1');
    const old = createCodeHasher({ service: 'identity', keys: parseKeyring(k1, NAME) }).hash(
      'RC7-QX2M-9KTA',
      { purpose: 'recovery_code', ref: 'acc1' },
    );
    const now = createCodeHasher({
      service: 'identity',
      keys: parseKeyring(`${newKeyText('k2')},${k1}`, NAME),
    });

    expect(now.verify('RC7-QX2M-9KTA', old, { purpose: 'recovery_code', ref: 'acc1' })).toBe(true);
    expect(now.isCurrent(old)).toBe(false);
    expect(
      now.isCurrent(now.hash('RC7-QX2M-9KTA', { purpose: 'recovery_code', ref: 'acc1' })),
    ).toBe(true);
  });

  it('a code to hash must be text, and a place must be right', () => {
    expect(() => codes.hash('', otp)).toThrow(
      new RangeError('The code of identity.otp:6747a1b2c3d4e5f601234567 is empty.'),
    );
    expect(() => codes.hash(7 as unknown as string, otp)).toThrow(RangeError);
    expect(() => codes.hash('1', { purpose: 'OTP', ref: '1' })).toThrow(RangeError);
    expect(() => codes.verify('1', 'c1.k1.x', { purpose: 'otp', ref: '' })).toThrow(RangeError);
  });
});

describe('token hashes', () => {
  it('SR-063: a token is kept as its SHA-256 in base64url, and the hash finds it again', () => {
    const token = randomToken();
    const hashed = hashToken(token);

    expect(hashed).toBe(createHash('sha256').update(token).digest('base64url'));
    expect(hashed).toHaveLength(43);
    expect(hashToken(token)).toBe(hashed);
    expect(hashToken(randomToken())).not.toBe(hashed);
  });

  it('a text too short to be a random token, or too long, is refused', () => {
    const refused = new RangeError(
      'A token is 22 to 1024 characters: 128 random bits or more, like randomToken().',
    );
    expect(() => hashToken('042917')).toThrow(refused);
    expect(() => hashToken('a'.repeat(21))).toThrow(refused);
    expect(() => hashToken('a'.repeat(1025))).toThrow(refused);
    expect(() => hashToken(7 as unknown as string)).toThrow(refused);
    expect(hashToken('a'.repeat(22))).toHaveLength(43);
  });
});

describe('random codes and tokens', () => {
  it('randomToken is 32 random bytes by default, and 16 to 1024 when asked', () => {
    expect(randomToken()).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomToken(16)).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(new Set(Array.from({ length: 1000 }, () => randomToken())).size).toBe(1000);
    for (const bytes of [15, 1025, 1.5, Number.NaN]) {
      expect(() => randomToken(bytes)).toThrow(
        new RangeError('A token is 16 to 1024 random bytes.'),
      );
    }
  });

  it('randomDigits keeps leading zeros, and every digit comes in every place', () => {
    const codes = Array.from({ length: 10_000 }, () => randomDigits(6));
    for (const code of codes) expect(code).toMatch(/^\d{6}$/);
    for (let place = 0; place < 6; place += 1) {
      expect(new Set(codes.map((code) => code[place])).size).toBe(10);
    }
    expect(randomDigits(12)).toMatch(/^\d{12}$/);
    for (const count of [3, 13, 6.5]) {
      expect(() => randomDigits(count)).toThrow(new RangeError('A code is 4 to 12 digits.'));
    }
  });
});
