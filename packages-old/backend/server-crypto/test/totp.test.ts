import { describe, expect, it } from 'vitest';

import {
  CryptoError,
  decodeBase32,
  encodeBase32,
  hotp,
  newTotpSecret,
  totpCode,
  totpStep,
  totpUri,
  verifyTotp,
} from '../src/index';

// The secrets of the RFC test vectors, as ASCII bytes
const SHA1_SEED = Buffer.from('12345678901234567890');
const SHA256_SEED = Buffer.from('12345678901234567890123456789012');
const SHA512_SEED = Buffer.from('1234567890123456789012345678901234567890123456789012345678901234');

describe('hotp', () => {
  it('matches the RFC 4226 Appendix D values', () => {
    const expected = [
      '755224',
      '287082',
      '359152',
      '969429',
      '338314',
      '254676',
      '287922',
      '162583',
      '399871',
      '520489',
    ];
    expect(expected.map((_, counter) => hotp(SHA1_SEED, counter))).toEqual(expected);
  });

  it('refuses a counter that is not a whole number of 0 or more, and an empty secret', () => {
    for (const counter of [-1, 1.5, Number.NaN]) {
      expect(() => hotp(SHA1_SEED, counter)).toThrow('The counter must be a whole number');
    }
    expect(() => hotp(Buffer.alloc(0), 0)).toThrow('The secret is empty');
  });

  it('uses all 8 bytes of the counter (RFC 4226 §5.2), not only the low 32 bits', () => {
    expect(hotp(SHA1_SEED, 2 ** 32 + 1)).not.toBe(hotp(SHA1_SEED, 1));
  });
});

describe('totpCode', () => {
  // RFC 6238 Appendix B: 8 digits, 30 seconds, the three hashes
  const vectors: [number, string, string, string][] = [
    [59, '94287082', '46119246', '90693936'],
    [1_111_111_109, '07081804', '68084774', '25091201'],
    [1_111_111_111, '14050471', '67062674', '99943326'],
    [1_234_567_890, '89005924', '91819424', '93441116'],
    [2_000_000_000, '69279037', '90698825', '38618901'],
    [20_000_000_000, '65353130', '77737706', '47863826'],
  ];

  it('matches the RFC 6238 Appendix B values for SHA-1, SHA-256 and SHA-512', () => {
    for (const [seconds, sha1, sha256, sha512] of vectors) {
      const at = seconds * 1000;
      expect(totpCode(SHA1_SEED, at, { digits: 8 }), `${String(seconds)} sha1`).toBe(sha1);
      expect(totpCode(SHA256_SEED, at, { digits: 8, algorithm: 'sha256' })).toBe(sha256);
      expect(totpCode(SHA512_SEED, at, { digits: 8, algorithm: 'sha512' })).toBe(sha512);
    }
  });

  it('gives 6 digits from a base32 secret by default, the same as from its bytes', () => {
    const secret = encodeBase32(SHA1_SEED);
    expect(secret).toBe('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
    expect(totpCode(secret, 59_000)).toBe('287082');
    expect(totpCode(secret.toLowerCase(), 59_000)).toBe('287082');
  });

  it('steps every 30 seconds by default, or by the period given', () => {
    expect([totpStep(0), totpStep(29_999), totpStep(30_000)]).toEqual([0, 0, 1]);
    expect(totpStep(59_000, { periodSeconds: 60 })).toBe(0);
  });

  it('refuses digits outside 6 to 10 and a period that is not whole seconds', () => {
    for (const digits of [5, 11, 6.5]) {
      expect(() => totpCode(SHA1_SEED, 0, { digits })).toThrow('digits must be 6 to 10');
    }
    for (const periodSeconds of [0, 1.5]) {
      expect(() => totpCode(SHA1_SEED, 0, { periodSeconds })).toThrow('periodSeconds');
    }
  });
});

describe('verifyTotp', () => {
  const secret = newTotpSecret();
  const now = 1_700_000_000_000;
  const step = totpStep(now);

  it('gives the step of a right code, the one before and the one after too', () => {
    expect(verifyTotp(secret, totpCode(secret, now), { now })).toBe(step);
    expect(verifyTotp(secret, totpCode(secret, now - 30_000), { now })).toBe(step - 1);
    expect(verifyTotp(secret, totpCode(secret, now + 30_000), { now })).toBe(step + 1);
  });

  it('refuses a code two steps away, or with window 0 one step away', () => {
    expect(verifyTotp(secret, totpCode(secret, now - 60_000), { now })).toBeNull();
    expect(verifyTotp(secret, totpCode(secret, now + 60_000), { now })).toBeNull();
    expect(verifyTotp(secret, totpCode(secret, now - 30_000), { now, window: 0 })).toBeNull();
    expect(verifyTotp(secret, totpCode(secret, now - 60_000), { now, window: 2 })).toBe(step - 2);
  });

  it('refuses wrong, short, long and odd codes without throwing', () => {
    const right = totpCode(secret, now);
    const wrong = String((Number(right) + 1) % 1_000_000).padStart(6, '0');
    for (const code of [wrong, right.slice(0, 5), `${right}0`, '', 'ééééé€', `${right} `]) {
      expect(verifyTotp(secret, code, { now }), JSON.stringify(code)).toBeNull();
    }
  });

  it('uses the current time when none is given', () => {
    expect(verifyTotp(secret, totpCode(secret, Date.now()))).not.toBeNull();
  });

  it('refuses a window below 0 or above 10', () => {
    for (const window of [-1, 11, 0.5]) {
      expect(() => verifyTotp(secret, '000000', { now, window })).toThrow('window must be 0 to 10');
    }
  });
});

describe('secrets and base32', () => {
  it('makes a new 160-bit secret each time, 32 base32 characters', () => {
    const one = newTotpSecret();
    expect(one).toMatch(/^[A-Z2-7]{32}$/);
    expect(decodeBase32(one)).toHaveLength(20);
    expect(newTotpSecret()).not.toBe(one);
  });

  it('round-trips any bytes, and reads spaces, hyphens, padding and lower case', () => {
    for (let length = 0; length <= 12; length += 1) {
      const bytes = Buffer.from(Array.from({ length }, (_, i) => (i * 37 + 11) % 256));
      expect(decodeBase32(encodeBase32(bytes))).toEqual(bytes);
    }
    // RFC 4648 §10
    expect(encodeBase32(Buffer.from('foobar'))).toBe('MZXW6YTBOI');
    expect(decodeBase32('mzxw 6ytb-oi======').toString()).toBe('foobar');
  });

  it('refuses a character that is not base32', () => {
    expect(() => decodeBase32('MZXW1')).toThrow(CryptoError);
  });
});

describe('totpUri', () => {
  it('gives the otpauth link authenticator apps read, with the issuer and email encoded', () => {
    const uri = totpUri({
      secret: 'gezd gnbv gy3t qojq gezd gnbv gy3t qojq',
      issuer: 'Beautinique Admin',
      account: 'riya+staff@example.com',
    });
    expect(uri).toBe(
      'otpauth://totp/Beautinique%20Admin:riya%2Bstaff%40example.com?secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ&issuer=Beautinique+Admin&algorithm=SHA1&digits=6&period=30',
    );
  });
});
