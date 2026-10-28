import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { CryptoError } from './keys';

/**
 * Authenticator app codes: HOTP (RFC 4226) and TOTP (RFC 6238). Google Authenticator, Microsoft
 * Authenticator, Authy and the rest read the `otpauth://` link from a QR code and make the same
 * codes offline, so nothing is ever sent to the phone.
 */

export type TotpAlgorithm = 'sha1' | 'sha256' | 'sha512';

export interface TotpOptions {
  /** default 6 */
  digits?: number;
  /** default 30 */
  periodSeconds?: number;
  /** default sha1: the one every authenticator app reads */
  algorithm?: TotpAlgorithm;
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
/** 160 bits, the size RFC 4226 recommends for an HMAC-SHA1 secret */
const SECRET_BYTES = 20;

/** Bytes as RFC 4648 base32, upper case, without padding (what authenticator apps take). */
export function encodeBase32(bytes: Uint8Array): string {
  let out = '';
  let bits = 0;
  let value = 0;
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32.charAt((value >>> (bits - 5)) & 31);
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32.charAt((value << (5 - bits)) & 31);
  return out;
}

/** Base32 back to bytes: any case, spaces, hyphens and `=` padding ignored. */
export function decodeBase32(text: string): Buffer {
  const clean = text.replace(/[\s=-]/g, '').toUpperCase();
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index === -1) throw new CryptoError('Not a base32 value');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** A new random secret for one person's authenticator, base32 (32 characters). */
export const newTotpSecret = (): string => encodeBase32(randomBytes(SECRET_BYTES));

function settings({ digits = 6, periodSeconds = 30, algorithm = 'sha1' }: TotpOptions) {
  if (!Number.isInteger(digits) || digits < 6 || digits > 10) {
    throw new CryptoError('digits must be 6 to 10');
  }
  if (!Number.isInteger(periodSeconds) || periodSeconds < 1) {
    throw new CryptoError('periodSeconds must be a whole number of seconds');
  }
  return { digits, periodSeconds, algorithm };
}

const secretBytes = (secret: string | Uint8Array): Buffer => {
  const bytes = typeof secret === 'string' ? decodeBase32(secret) : Buffer.from(secret);
  if (bytes.length === 0) throw new CryptoError('The secret is empty');
  return bytes;
};

/** The HOTP code for a counter (RFC 4226 §5.3, dynamic truncation). */
export function hotp(
  secret: string | Uint8Array,
  counter: number,
  options: TotpOptions = {},
): string {
  const { digits, algorithm } = settings(options);
  if (!Number.isSafeInteger(counter) || counter < 0) {
    throw new CryptoError('The counter must be a whole number, 0 or more');
  }
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const mac = createHmac(algorithm, secretBytes(secret)).update(message).digest();
  const offset = (mac.at(-1) ?? 0) & 15;
  const binary = mac.readUInt32BE(offset) & 0x7f_ff_ff_ff;
  return String(binary % 10 ** digits).padStart(digits, '0');
}

/** The time step a moment falls in (RFC 6238 §4: T = floor(unix seconds / period)). */
export const totpStep = (timeMs: number, options: TotpOptions = {}): number =>
  Math.floor(timeMs / 1000 / settings(options).periodSeconds);

/** The TOTP code at a moment (RFC 6238). */
export const totpCode = (
  secret: string | Uint8Array,
  timeMs: number,
  options: TotpOptions = {},
): string => hotp(secret, totpStep(timeMs, options), options);

export interface VerifyTotpOptions extends TotpOptions {
  /** default Date.now() */
  now?: number;
  /** Steps before and after now that also count, for a phone clock a little off (default 1). */
  window?: number;
}

/**
 * The time step a code belongs to, or null when it fits none in the window. Every step in the
 * window is compared in constant time, so the answer's time says nothing about which one fitted.
 * The caller keeps the step and refuses it (and older ones) next time: a code works once.
 */
export function verifyTotp(
  secret: string | Uint8Array,
  code: string,
  { now = Date.now(), window = 1, ...options }: VerifyTotpOptions = {},
): number | null {
  const { digits } = settings(options);
  if (!Number.isInteger(window) || window < 0 || window > 10) {
    throw new CryptoError('window must be 0 to 10');
  }
  const bytes = secretBytes(secret);
  // latin1: one byte per character, so any input has exactly `digits` bytes to compare
  const given = Buffer.from(code.padEnd(digits, ' ').slice(0, digits), 'latin1');
  const lengthFits = code.length === digits;
  const current = totpStep(now, options);
  let found: number | null = null;
  for (let step = current - window; step <= current + window; step += 1) {
    if (step < 0) continue;
    const fits = timingSafeEqual(Buffer.from(hotp(bytes, step, options)), given);
    if (fits && lengthFits) found = step;
  }
  return found;
}

export interface TotpUriInput extends TotpOptions {
  secret: string;
  /** Who issues it, shown in the app: `Beautinique Admin` */
  issuer: string;
  /** Whose it is, shown in the app: the email */
  account: string;
}

/** The `otpauth://totp/...` link a QR code carries (the Key Uri Format authenticator apps read). */
export function totpUri({ secret, issuer, account, ...options }: TotpUriInput): string {
  const { digits, periodSeconds, algorithm } = settings(options);
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`;
  const query = new URLSearchParams({
    secret: encodeBase32(secretBytes(secret)),
    issuer,
    algorithm: algorithm.toUpperCase(),
    digits: String(digits),
    period: String(periodSeconds),
  });
  return `otpauth://totp/${label}?${query.toString()}`;
}
