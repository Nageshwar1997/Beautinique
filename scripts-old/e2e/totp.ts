// An authenticator app for the E2E: the 6-digit code of a base32 secret at a moment (RFC 6238,
// SHA-1, 30 s steps), as the phone shows it.
import { createHmac } from 'node:crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Bytes(secret: string): Buffer {
  let bits = '';
  for (const char of secret.replace(/=+$/, '').toUpperCase()) {
    const value = BASE32.indexOf(char);
    if (value === -1) throw new Error('not a base32 secret');
    bits += value.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let at = 0; at + 8 <= bits.length; at += 8)
    bytes.push(Number.parseInt(bits.slice(at, at + 8), 2));
  return Buffer.from(bytes);
}

/** The code for `secret` at `at` (ms since 1970; now by default). */
export function totpCode(secret: string, at = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)));
  const hmac = createHmac('sha1', base32Bytes(secret)).update(counter).digest();
  const offset = (hmac.at(-1) ?? 0) & 0x0f;
  const value = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(value).padStart(6, '0');
}
