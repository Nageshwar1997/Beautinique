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

/**
 * The request that holds a key: what it asked for, and when its lease ends. A request is the one
 * that holds the key only while the record has both; once its lease is out another request may take
 * the key, and from then on what the first one does to the record changes nothing.
 */
export interface IdempotencyClaim {
  fingerprint: string;
  leaseUntil: Date;
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
   * Starts the request (the record is then the claim's), unless the id is in use and in force:
   * - the same id with another fingerprint: `key-reused`;
   * - the same id and fingerprint, ended: `replay` of what it answered;
   * - the same id and fingerprint, not ended: `in-progress`.
   * A record whose time is out (an ended one after 48 hours, a begun one after its lease) is as if
   * it were not there.
   */
  begin(id: IdempotencyId, claim: IdempotencyClaim, now: Date): Promise<BeginResult>;
  /**
   * Keeps the answer, until `expiresAt`, if the record is still the claim's and not ended. A
   * request whose lease ran out and whose key another request took leaves that request's record
   * as it is.
   */
  complete(
    id: IdempotencyId,
    claim: IdempotencyClaim,
    response: StoredResponse,
    expiresAt: Date,
  ): Promise<void>;
  /**
   * Forgets a request that ended in a 5xx, so that the same key can try again; only if the record
   * is still the claim's and not ended.
   */
  release(id: IdempotencyId, claim: IdempotencyClaim): Promise<void>;
}

interface MemoryRecord {
  fingerprint: string;
  leaseUntil: number;
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
  // The record, if it is the claim's and has not ended.
  const heldBy = (id: IdempotencyId, claim: IdempotencyClaim): MemoryRecord | undefined => {
    const found = records.get(keyOf(id));
    return found?.response === undefined &&
      found?.fingerprint === claim.fingerprint &&
      found.leaseUntil === claim.leaseUntil.getTime()
      ? found
      : undefined;
  };

  return {
    begin(id, { fingerprint, leaseUntil }, now) {
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
      const lease = leaseUntil.getTime();
      records.set(key, { fingerprint, leaseUntil: lease, until: lease, response: undefined });
      return Promise.resolve({ kind: 'started' });
    },
    complete(id, claim, response, expiresAt) {
      const found = heldBy(id, claim);
      if (found !== undefined) {
        found.until = expiresAt.getTime();
        found.response = response;
      }
      return Promise.resolve();
    },
    release(id, claim) {
      if (heldBy(id, claim) !== undefined) records.delete(keyOf(id));
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
