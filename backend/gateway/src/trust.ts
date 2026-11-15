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

/** The headers Vercel sets with the client's address, in the order they are trusted. */
export const VERCEL_IP_HEADERS = [
  'x-vercel-forwarded-for',
  'x-real-ip',
  'x-forwarded-for',
] as const;

/** The first address of a list (`client, proxy, ...`), when it is an IP. */
const firstIp = (value: string | undefined): string | undefined => {
  const first = value?.split(',')[0]?.trim();
  return first !== undefined && first !== '' && isIP(unmapped(first)) !== 0 ? first : undefined;
};

/**
 * Where the client's IP came from: one of Vercel's headers, or the socket (which on Render is the
 * platform's own proxy, 127.0.0.1: every client looked the same, LIVE-007).
 */
export type ClientIpSource = (typeof VERCEL_IP_HEADERS)[number] | 'socket';

/**
 * The client's IP and where it came from (ARCHITECTURE §7.2), the one source for rate limits, OTP
 * IP limits and audit. Behind Vercel the socket is Render's proxy (127.0.0.1 live), so only
 * Vercel's headers say who it is, and only on a request that carried the right origin secret
 * (`fromVercel`), else anyone could pick their own IP: Vercel's own x-vercel-forwarded-for first,
 * then x-real-ip, then the first address of x-forwarded-for, which Vercel sets to the client and
 * Render's proxy only adds to after it (LIVE-007: x-real-ip never arrived live). Otherwise the
 * socket address.
 */
export function clientIpOf(
  req: Request,
  fromVercel: boolean,
): { ip: string; source: ClientIpSource } {
  if (fromVercel) {
    for (const header of VERCEL_IP_HEADERS) {
      const ip = firstIp(req.get(header));
      if (ip !== undefined) return { ip: unmapped(ip), source: header };
    }
  }
  return { ip: unmapped(req.socket.remoteAddress ?? '0.0.0.0'), source: 'socket' };
}

/** The client's IP alone (clientIpOf). */
export const clientIp = (req: Request, fromVercel: boolean): string =>
  clientIpOf(req, fromVercel).ip;
