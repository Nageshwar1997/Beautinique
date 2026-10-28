import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  type KeyObject,
  randomBytes,
  sign,
  verify,
} from 'node:crypto';

import { CryptoError } from './keys';

/**
 * ES256 JSON Web Tokens (RFC 7515, 7518, 7519) on Node's own crypto: P-256 keys, signatures in the
 * JOSE form (r || s, 64 bytes). Only ES256 is ever signed or accepted, so `alg: none` and a
 * public key used as an HMAC secret cannot get through (ARCHITECTURE §7.2).
 */

/** A public key as JWKS lists it. */
export interface PublicJwk {
  kty: 'EC';
  crv: 'P-256';
  x: string;
  y: string;
  kid: string;
  alg: 'ES256';
  use: 'sig';
}

export interface SigningKey {
  kid: string;
  /** PKCS #8 PEM: seal it before storing (encryptField) */
  privateKeyPem: string;
  publicJwk: PublicJwk;
}

/** A new ES256 key pair with a random key id. */
export function generateSigningKey(): SigningKey {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const kid = randomBytes(12).toString('base64url');
  const jwk = publicKey.export({ format: 'jwk' });
  return {
    kid,
    privateKeyPem: privateKey.export({ format: 'pem', type: 'pkcs8' }),
    publicJwk: {
      kty: 'EC',
      crv: 'P-256',
      x: String(jwk.x),
      y: String(jwk.y),
      kid,
      alg: 'ES256',
      use: 'sig',
    },
  };
}

/** A JWKS entry back to a key Node verifies with; anything but an ES256 P-256 key is refused. */
export function publicKeyFromJwk(jwk: unknown): KeyObject {
  const key = jwk as Partial<PublicJwk> | null;
  if (
    key?.kty !== 'EC' ||
    key.crv !== 'P-256' ||
    typeof key.x !== 'string' ||
    typeof key.y !== 'string'
  ) {
    throw new CryptoError('Not an ES256 public key');
  }
  try {
    return createPublicKey({
      key: { kty: 'EC', crv: 'P-256', x: key.x, y: key.y },
      format: 'jwk',
    });
  } catch (error) {
    throw new CryptoError('Not an ES256 public key', { cause: error });
  }
}

const b64url = (value: string | Buffer): string => Buffer.from(value).toString('base64url');

/** Standard claims every token of ours has (times in seconds since the epoch). */
export interface JwtClaims {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  [claim: string]: unknown;
}

/** Signs `claims` with an ES256 private key (a PEM or a KeyObject) under its key id. */
export function signJwt(
  claims: JwtClaims,
  { kid, privateKey }: { kid: string; privateKey: string | KeyObject },
): string {
  const header = b64url(JSON.stringify({ alg: 'ES256', typ: 'JWT', kid }));
  const payload = b64url(JSON.stringify(claims));
  const signature = sign('sha256', Buffer.from(`${header}.${payload}`), {
    key: typeof privateKey === 'string' ? createPrivateKey(privateKey) : privateKey,
    dsaEncoding: 'ieee-p1363',
  });
  return `${header}.${payload}.${signature.toString('base64url')}`;
}

/** Why a token was refused; the message never repeats the token. */
export class JwtError extends Error {
  constructor(
    readonly reason:
      | 'malformed'
      | 'algorithm'
      | 'unknown-key'
      | 'signature'
      | 'expired'
      | 'not-yet-valid'
      | 'audience'
      | 'issuer',
  ) {
    super(`The token was refused (${reason})`);
    this.name = 'JwtError';
  }
}

export interface VerifyJwtOptions {
  /** Verification keys by key id (from the issuer's JWKS) */
  keys: ReadonlyMap<string, KeyObject>;
  audience: string;
  issuer: string;
  /** default Date.now() */
  now?: number;
  /** Seconds a clock may be off (default 30) */
  leewaySeconds?: number;
}

const BASE64URL = /^[A-Za-z0-9_-]+$/;

function decodePart(part: string): Record<string, unknown> {
  if (!BASE64URL.test(part)) throw new JwtError('malformed');
  try {
    const value: unknown = JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
    if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new JwtError('malformed');
  }
}

/**
 * The claims of a token, after checking all of it: ES256 only, a known key id, the signature, the
 * expiry and issue time (with leeway), the audience and the issuer. A JwtError says which failed.
 */
export function verifyJwt(
  token: string,
  { keys, audience, issuer, now = Date.now(), leewaySeconds = 30 }: VerifyJwtOptions,
): JwtClaims {
  const parts = token.split('.');
  if (parts.length !== 3) throw new JwtError('malformed');
  const [headerPart = '', payloadPart = '', signaturePart = ''] = parts;
  const header = decodePart(headerPart);
  if (header.alg !== 'ES256') throw new JwtError('algorithm');
  const key = typeof header.kid === 'string' ? keys.get(header.kid) : undefined;
  if (!key) throw new JwtError('unknown-key');
  if (!BASE64URL.test(signaturePart)) throw new JwtError('malformed');
  const signature = Buffer.from(signaturePart, 'base64url');
  if (signature.length !== 64) throw new JwtError('signature');
  const signed = verify(
    'sha256',
    Buffer.from(`${headerPart}.${payloadPart}`),
    { key, dsaEncoding: 'ieee-p1363' },
    signature,
  );
  if (!signed) throw new JwtError('signature');
  const claims = decodePart(payloadPart);
  const seconds = now / 1000;
  if (typeof claims.exp !== 'number' || seconds > claims.exp + leewaySeconds) {
    throw new JwtError('expired');
  }
  if (typeof claims.iat !== 'number' || claims.iat > seconds + leewaySeconds) {
    throw new JwtError('not-yet-valid');
  }
  if (claims.aud !== audience) throw new JwtError('audience');
  if (claims.iss !== issuer) throw new JwtError('issuer');
  if (typeof claims.sub !== 'string') throw new JwtError('malformed');
  return claims as JwtClaims;
}
