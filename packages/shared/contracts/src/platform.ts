/** The 11 apps (ARCHITECTURE §9.1). Every request names its app in the X-BQ-App header. */
export const APPS = [
  'customer',
  'seller',
  'admin',
  'superadmin',
  'master',
  'support',
  'finance',
  'logistics',
  'delivery',
  'growth',
  'creator',
] as const;
export type AppId = (typeof APPS)[number];

/** The 5 deployables (ARCHITECTURE §2). A route's owner, an event's producer. */
export const DEPLOYABLES = ['gateway', 'identity', 'payments', 'notify', 'core'] as const;
export type Deployable = (typeof DEPLOYABLES)[number];

/**
 * Scope types of a grant (ARCHITECTURE §7.3). Location scopes nest:
 * global ⊇ state ⊇ district ⊇ city ⊇ hub. The others are only covered by themselves and by global.
 */
export const SCOPE_TYPES = [
  'global',
  'state',
  'district',
  'city',
  'hub',
  'warehouse',
  'brand',
  'category',
  'sellerOrg',
  'creatorAgency',
  'self',
] as const;
export type ScopeType = (typeof SCOPE_TYPES)[number];

/** The location chain, widest first. */
export const LOCATION_SCOPES = ['global', 'state', 'district', 'city', 'hub'] as const;
export type LocationScope = (typeof LOCATION_SCOPES)[number];

/**
 * Request headers every client and the gateway agree on. `clientIp` and `passport` are set by the
 * gateway alone (it drops ones sent by a client): who the caller is (OTP IP limits, audit) and
 * who signed in (ARCHITECTURE §7.2).
 */
export const HEADERS = {
  app: 'X-BQ-App',
  idempotencyKey: 'Idempotency-Key',
  requestId: 'X-Request-Id',
  clientIp: 'X-BQ-Client-Ip',
  passport: 'X-BQ-Passport',
} as const;

/**
 * The passport (ARCHITECTURE §7.2): after checking the access token, the gateway sends the owner a
 * 60-second ES256 token of who signed in, for that owner only (`aud`). The gateway makes its key at
 * every start and publishes the public key at PASSPORT_JWKS_PATH; no secret lives in env.
 */
export const PASSPORT_ISSUER = 'bq:gateway';
export const PASSPORT_SECONDS = 60;
export const passportAudience = (owner: Deployable): string => `bq:${owner}`;
export const PASSPORT_JWKS_PATH = '/.well-known/passport-jwks.json';
/** Where identity publishes the public keys of its access tokens, for the gateway. */
export const IDENTITY_JWKS_PATH = '/.well-known/jwks.json';
