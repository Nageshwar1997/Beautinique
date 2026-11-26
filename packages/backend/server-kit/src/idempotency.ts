import { createHash } from 'node:crypto';

/** A record is kept this long (docs/ARCHITECTURE.md §5 rule 10: about 48 hours). */
export const IDEMPOTENCY_TTL_MS = 48 * 60 * 60 * 1000;

/**
 * A request that has begun and not ended holds its key this long. A request is stopped after 30
 * seconds (SR-007), so when a process dies in the middle the key frees itself, and the retry is
 * not turned away for 48 hours with a 409.
 */
export const IDEMPOTENCY_LEASE_MS = 60 * 1000;

/** Who asked, for which route, with which key (docs/ARCHITECTURE.md §5 rule 10: key + route + caller). */
export interface IdempotencyId {
  caller: string;
  routeId: string;
  key: string;
}

/** What a request answered, kept to be answered again. Only what is JSON. */
export interface StoredResponse {
  status: number;
  body: unknown;
}

export type BeginResult =
  | { kind: 'started' }
  | { kind: 'in-progress' }
  | { kind: 'key-reused' }
  | { kind: 'replay'; response: StoredResponse };

/**
 * Where the records are kept. The live one is the owner service's database (the `idempotency_keys`
 * collection of `backend-mongo`); the kit has one in memory for tests and for a laptop. Whatever
 * keeps them must do `begin` as one atomic step (a unique index, not a read and then a write):
 * two requests with one key at the same moment must not both start.
 */
export interface IdempotencyStore {
  /**
   * Starts the request, unless the id is in use and in force:
   * - the same id with another `fingerprint`: `key-reused`;
   * - the same id and `fingerprint`, ended: `replay` of what it answered;
   * - the same id and `fingerprint`, not ended: `in-progress`.
   * A record whose time is out (an ended one after 48 hours, a begun one after its lease) is as if
   * it were not there.
   */
  begin(id: IdempotencyId, fingerprint: string, now: Date, leaseUntil: Date): Promise<BeginResult>;
  /** Keeps the answer, until `expiresAt`. */
  complete(id: IdempotencyId, response: StoredResponse, expiresAt: Date): Promise<void>;
  /** Forgets a request that ended in a 5xx, so that the same key can try again. */
  release(id: IdempotencyId): Promise<void>;
}

interface MemoryRecord {
  fingerprint: string;
  until: number;
  response: StoredResponse | undefined;
}

/**
 * The records in the memory of the process: for tests and for a laptop. It forgets nothing before
 * its time and has no limit, so it is not for a service that is live.
 */
export function createMemoryIdempotencyStore(): IdempotencyStore {
  const records = new Map<string, MemoryRecord>();
  const keyOf = (id: IdempotencyId): string => JSON.stringify([id.caller, id.routeId, id.key]);

  return {
    begin(id, fingerprint, now, leaseUntil) {
      const key = keyOf(id);
      const found = records.get(key);
      if (found !== undefined && found.until > now.getTime()) {
        if (found.fingerprint !== fingerprint) return Promise.resolve({ kind: 'key-reused' });
        return Promise.resolve(
          found.response === undefined
            ? { kind: 'in-progress' }
            : { kind: 'replay', response: found.response },
        );
      }
      records.set(key, { fingerprint, until: leaseUntil.getTime(), response: undefined });
      return Promise.resolve({ kind: 'started' });
    },
    complete(id, response, expiresAt) {
      const found = records.get(keyOf(id));
      if (found !== undefined) {
        found.until = expiresAt.getTime();
        found.response = response;
      }
      return Promise.resolve();
    },
    release(id) {
      records.delete(keyOf(id));
      return Promise.resolve();
    },
  };
}

// The same value always gives the same text: the keys of an object in order, a date as ISO. So the
// same request, written in another order, has the same fingerprint.
function canonicalJson(value: unknown): string {
  if (value === undefined) return 'null';
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${(value as unknown[]).map(canonicalJson).join(',')}]`;
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([name, item]) => `${JSON.stringify(name)}:${canonicalJson(item)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

/** The fingerprint of a request: what it asked for (the path, the query and the body, already checked), as a hash. */
export function fingerprintOf(parts: { params: unknown; query: unknown; body: unknown }): string {
  return createHash('sha256').update(canonicalJson(parts)).digest('hex');
}
