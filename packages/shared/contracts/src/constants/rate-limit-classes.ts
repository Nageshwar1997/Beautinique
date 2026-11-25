// The class of rate limit a route is in. The limits themselves are settings of the gateway; the
// contract only says which class a route belongs to (docs/security/SECURITY_REQUIREMENTS.md SR-008).
// `failClosed` is what happens when the counter (Valkey) is out of reach: sign-in, codes, starting a
// payment, review, report and claim answer 503; the rest go on with the process's own small limit.
export const RATE_LIMIT_CLASSES = {
  read: { failClosed: false },
  write: { failClosed: false },
  'sign-in': { failClosed: true },
  code: { failClosed: true },
  'payment-start': { failClosed: true },
  'place-order': { failClosed: false },
  review: { failClosed: true },
  report: { failClosed: true },
  claim: { failClosed: true },
  upload: { failClosed: false },
  'search-public': { failClosed: false },
  'delivery-code': { failClosed: false },
  export: { failClosed: false },
} as const;

export type RateLimitClass = keyof typeof RATE_LIMIT_CLASSES;
