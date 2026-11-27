import { createHmac, timingSafeEqual } from 'node:crypto';

/** HMAC-SHA256 of a text, base64url: how the fakes sign their uploads, URLs and notifications. */
export function sign(secret: Buffer, text: string): string {
  return createHmac('sha256', secret).update(text).digest('base64url');
}

/** Whether a signature matches, in constant time for signatures of one length. */
export function sameSignature(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
