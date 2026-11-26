import { serializeError } from './serialize-error.ts';

/** Deeper than this a log is cut, so a long chain of objects cannot fill the stack or the log. */
export const MAX_DEPTH = 8;
/** More items than this in a list are left out, with one note of how many. */
export const MAX_ITEMS = 100;
/** What the value of a secret key is written as: the key stays, so a log says that it was there, and the value is gone. */
export const REDACTED = '[redacted]';

// Keys whose value a log never shows, with the case, `-`, `_` and spaces taken out of them (docs/security/
// SECURITY_REQUIREMENTS.md SR-077, SR-098). `code` is here as it is: the code that a person is
// sent by email. The code of an error is kept by the error serializer.
const SENSITIVE_KEYS: ReadonlySet<string> = new Set([
  'authorization',
  'proxyauthorization',
  'cookie',
  'setcookie',
  'code',
  'otp',
  'otpcode',
  'authcode',
  'emailcode',
  'verificationcode',
  'recoverycode',
  'recoverycodes',
  'codehash',
  'otphash',
  'tokenhash',
  'recoverycodehash',
  'deliverycode',
  'pan',
  'pannumber',
  'bankaccount',
  'bankaccountnumber',
  'accountnumber',
  'email',
  'phone',
  'mobile',
  'mobilenumber',
  'address',
  'addressline',
  'addressline1',
  'addressline2',
  'fulladdress',
]);

// A key that has one of these in it is a secret too: `newPassword`, `passwordHash`,
// `client_secret`. And one that ends in one of these: `refreshToken`, `x-api-key`,
// `x-razorpay-signature`. Only exact words for `code` and the like, since `statusCode` is a number
// that a log needs.
const SENSITIVE_PARTS: readonly string[] = ['password', 'secret'];
const SENSITIVE_ENDINGS: readonly string[] = ['token', 'apikey', 'signature'];

function normalize(key: string): string {
  return key.toLowerCase().replaceAll(/[-_\s]/g, '');
}

/** The test of a key: the names of the service's own secret headers are given, already normalized. */
export function isSensitiveKey(key: string, extra: ReadonlySet<string>): boolean {
  const name = normalize(key);
  return (
    SENSITIVE_KEYS.has(name) ||
    extra.has(name) ||
    SENSITIVE_PARTS.some((part) => name.includes(part)) ||
    SENSITIVE_ENDINGS.some((ending) => name.endsWith(ending))
  );
}

/** The names of secret keys that a service adds, in the form that `isSensitiveKey` compares. */
export function normalizedKeys(keys: readonly string[]): ReadonlySet<string> {
  return new Set(keys.map(normalize));
}

function isPlainRecord(value: object): boolean {
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}

function walk(
  value: unknown,
  extra: ReadonlySet<string>,
  depth: number,
  path: WeakSet<object>,
): unknown {
  if (typeof value !== 'object' || value === null) return value;
  if (value instanceof Error) return serializeError(value);
  if (value instanceof Date) return value;
  // Bytes are never written out: what they are is not known.
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    return `<binary ${String(value.byteLength)} bytes>`;
  }
  // An object that says how it is written (an id, a decimal) is left to say it.
  if (!isPlainRecord(value) && typeof (value as { toJSON?: unknown }).toJSON === 'function') {
    return value;
  }
  if (depth >= MAX_DEPTH) return '<too deep>';
  if (path.has(value)) return '<circular>';

  path.add(value);
  try {
    if (Array.isArray(value)) {
      const items = (value as unknown[])
        .slice(0, MAX_ITEMS)
        .map((item) => walk(item, extra, depth + 1, path));
      if (value.length > MAX_ITEMS) items.push(`<${String(value.length - MAX_ITEMS)} more items>`);
      return items;
    }
    const copy: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      copy[key] = isSensitiveKey(key, extra) ? REDACTED : walk(item, extra, depth + 1, path);
    }
    return copy;
  } finally {
    // Only the objects above this one are "in progress": the same object twice side by side is fine.
    path.delete(value);
  }
}

/**
 * A copy of what a log is given, with the value of every key that is a secret or personal data
 * written as `[redacted]` at every depth (docs/security/SECURITY_REQUIREMENTS.md SR-098, D-465): the
 * key stays and the value is gone, whatever it was (a text, a number, a whole object). The errors
 * in it are serialized, bytes are written as their size, and the depth and the lists are cut. The
 * value that was given is never changed. One pass over the value, so the work is the size of what is logged
 * and no more (docs/RULES.md CR-40).
 */
export function redactFields(value: unknown, extra: ReadonlySet<string> = new Set()): unknown {
  return walk(value, extra, 0, new WeakSet());
}
