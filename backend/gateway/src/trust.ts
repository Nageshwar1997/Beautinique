import { createHash, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

import type { Request } from 'express';

/** The header each app's Vercel route sets from its ORIGIN_SECRET env (ARCHITECTURE §7.2). */
export const ORIGIN_SECRET_HEADER = 'x-origin-secret';

const digest = (value: string): Buffer => createHash('sha256').update(value).digest();

/**
 * Checks the x-origin-secret header in constant time against every accepted secret (the current
 * one, and the old one during a rotation). Hashing first makes every comparison the same length.
 */
export function originSecretCheck(
  secrets: readonly string[],
): (given: string | undefined) => boolean {
  const accepted = secrets.map(digest);
  return (given) => {
    if (given === undefined) return false;
    const candidate = digest(given);
    let matched = false;
    for (const secret of accepted) {
      // no early exit: the time does not tell which secret matched
      matched = timingSafeEqual(candidate, secret) || matched;
    }
    return matched;
  };
}

/** `::ffff:203.0.113.7` → `203.0.113.7`; other addresses unchanged. */
const unmapped = (ip: string): string => {
  const v4 = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip)?.[1];
  return v4 !== undefined && isIP(v4) === 4 ? v4 : ip;
};

/**
 * The client's IP (ARCHITECTURE §7.2), the one source for rate limits, OTP IP limits and audit.
 * Behind Vercel every request comes from a few Vercel addresses, and Render's proxy adds its own to
 * x-forwarded-for, so neither the socket nor x-forwarded-for (nor Express `trust proxy`) says who
 * it is. Vercel sets x-real-ip; it only counts on a request that carried the right origin secret
 * (`fromVercel`), else anyone could pick their own IP. Otherwise the socket address.
 */
export function clientIp(req: Request, fromVercel: boolean): string {
  const real = req.get('x-real-ip')?.trim();
  if (fromVercel && real !== undefined && isIP(real) !== 0) return unmapped(real);
  return unmapped(req.socket.remoteAddress ?? '0.0.0.0');
}
