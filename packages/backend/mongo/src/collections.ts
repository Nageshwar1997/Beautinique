import { createHash } from 'node:crypto';

import type { ClientSession, Db, Document, ObjectId } from 'mongodb';

import { canonicalJson } from './utils/canonical.ts';

/**
 * How long a collection's records are kept, and why (docs/ARCHITECTURE.md §10.3 rule 1): `tech`
 * (short technical records: OTP hashes, idempotency, sessions, outbox, inbox), `case` (a case and
 * its evidence), `account` (while the account is there), `book` (the books), `tax` (tax records),
 * `ref` (reference data and settings), `agg` (counts and stats).
 */
export const RETENTION_CLASSES = ['tech', 'case', 'account', 'book', 'tax', 'ref', 'agg'] as const;
export type RetentionClass = (typeof RETENTION_CLASSES)[number];

export interface IndexSpec {
  /** The name says the shape: a new shape is a new name (§10.4 rule 2). */
  name: string;
  /** The fields in order, each `1` or `-1`. */
  key: Readonly<Record<string, 1 | -1>>;
  unique?: boolean;
  sparse?: boolean;
  partialFilterExpression?: Document;
  /** A TTL index: one field (a date), removed this long after it. */
  expireAfterSeconds?: number;
}

/** How a record goes at the end of its time: a TTL index, a job that removes it, or never (and why). */
export type Expiry = { ttlIndex: string } | { job: string } | { never: string };

/**
 * What an account's delete does to the collection (§10.3 rule 10): `run` it in the delete's
 * transaction, or `none` (and why: no personal data, or kept by law).
 */
export type AccountDelete =
  | {
      run: (input: { db: Db; session: ClientSession; accountId: ObjectId }) => Promise<void>;
    }
  | { none: string };

export interface CollectionSpec {
  /** Small letters, digits and `_`, starting with a letter: `idempotency_keys`. */
  name: string;
  retention: RetentionClass;
  /** The `$jsonSchema` of only the fields that must be right: ids, amounts, `status`, `version` (§10.4 rule 7). */
  schema?: Document;
  indexes: readonly IndexSpec[];
  expiry: Expiry;
  accountDelete: AccountDelete;
}

/** The collections of one service's database: what the release step makes, and the retention registry. */
export interface Collections {
  service: string;
  /** By name. */
  specs: ReadonlyMap<string, CollectionSpec>;
  /** A hash of every collection's name, schema and indexes: the same plan, the same fingerprint. */
  fingerprint: string;
}

const NAME = /^[a-z][a-z0-9_]{0,63}$/;
// An index is named by its fields: `customerId_placedAt`.
const INDEX_NAME = /^[a-z][A-Za-z0-9_]{0,127}$/;
const RETENTION = new Set<string>(RETENTION_CLASSES);

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

function checkIndex(collection: string, index: IndexSpec, seen: Set<string>): void {
  const where = `The index ${collection}.${index.name}`;
  if (!INDEX_NAME.test(index.name)) {
    throw new RangeError(
      `${where}: its name is letters, digits and _, starting with a small letter.`,
    );
  }
  if (seen.has(index.name)) throw new RangeError(`${where} is given twice.`);
  seen.add(index.name);
  // Checked as what it is at run time: a caller in plain JavaScript may give anything.
  const fields = Object.entries(index.key as Record<string, unknown>);
  if (fields.length === 0) throw new RangeError(`${where} has no field.`);
  for (const [field, direction] of fields) {
    if (direction !== 1 && direction !== -1) {
      throw new RangeError(`${where}: the field ${field} must be 1 or -1.`);
    }
  }
  if (index.expireAfterSeconds !== undefined) {
    if (!Number.isInteger(index.expireAfterSeconds) || index.expireAfterSeconds < 0) {
      throw new RangeError(`${where}: expireAfterSeconds must be a whole number of 0 or more.`);
    }
    if (fields.length !== 1) throw new RangeError(`${where}: a TTL index has one field.`);
  }
}

/**
 * One collection: its retention class, what goes at its end and on an account's delete, its schema
 * and its indexes. Anything missing or wrong is a `RangeError` at once (docs/ARCHITECTURE.md §10.3
 * rule 1: no collection without a class or a delete handler).
 */
export function defineCollection(spec: CollectionSpec): CollectionSpec {
  // Checked as what it is at run time: a caller in plain JavaScript may give anything.
  const given = spec as unknown as Partial<Record<keyof CollectionSpec, unknown>>;
  const { name } = spec;
  if (typeof given.name !== 'string' || !NAME.test(name)) {
    throw new RangeError(
      'A collection name is small letters, digits and _, starting with a letter, up to 64.',
    );
  }
  if (typeof given.retention !== 'string' || !RETENTION.has(given.retention)) {
    throw new RangeError(
      `The collection ${name} needs a retention class: ${RETENTION_CLASSES.join(', ')}.`,
    );
  }
  if (given.schema !== undefined && (typeof given.schema !== 'object' || given.schema === null)) {
    throw new RangeError(`The schema of the collection ${name} must be a $jsonSchema object.`);
  }
  const seen = new Set<string>();
  for (const index of spec.indexes) checkIndex(name, index, seen);

  const { expiry, accountDelete } = spec as Partial<CollectionSpec>;
  if (expiry !== undefined && 'ttlIndex' in expiry) {
    const ttl = spec.indexes.find((index) => index.name === expiry.ttlIndex);
    if (ttl?.expireAfterSeconds === undefined) {
      throw new RangeError(
        `The collection ${name} expires by ${expiry.ttlIndex}, which is not one of its TTL indexes.`,
      );
    }
  } else if (
    expiry === undefined ||
    !(('job' in expiry && isText(expiry.job)) || ('never' in expiry && isText(expiry.never)))
  ) {
    throw new RangeError(
      `The collection ${name} needs its expiry: a TTL index, the job that removes its records, or never and why.`,
    );
  }
  if (
    accountDelete === undefined ||
    !(
      ('run' in accountDelete && typeof accountDelete.run === 'function') ||
      ('none' in accountDelete && isText(accountDelete.none))
    )
  ) {
    throw new RangeError(
      `The collection ${name} needs its account delete handler: run, or none and why.`,
    );
  }
  return spec;
}

// What of a collection the release step makes; the hash of it all is the plan's fingerprint.
export function schemaOf(spec: CollectionSpec): Document {
  return {
    name: spec.name,
    schema: spec.schema ?? null,
    indexes: [...spec.indexes]
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
      .map((index) => ({
        name: index.name,
        // The order of the fields is the index, so it is kept as a list.
        key: Object.entries(index.key),
        unique: index.unique === true,
        sparse: index.sparse === true,
        partialFilterExpression: index.partialFilterExpression ?? null,
        expireAfterSeconds: index.expireAfterSeconds ?? null,
      })),
  };
}

/**
 * The collections of a service's database, the platform ones of the packages with them (as
 * `idempotencyCollection` and `leasesCollection`). Two with one name are refused.
 */
export function defineCollections(service: string, specs: readonly CollectionSpec[]): Collections {
  if (!/^[a-z][a-z0-9-]*$/.test(service)) {
    throw new RangeError('service must be small letters, digits and -, starting with a letter.');
  }
  const byName = new Map<string, CollectionSpec>();
  for (const spec of specs) {
    defineCollection(spec);
    if (byName.has(spec.name)) {
      throw new RangeError(`The collection ${spec.name} is given twice.`);
    }
    byName.set(spec.name, spec);
  }
  const names = [...byName.keys()].sort();
  const plan = names.map((name) => schemaOf(byName.get(name) as CollectionSpec));
  const fingerprint = createHash('sha256').update(canonicalJson(plan)).digest('hex');
  return { service, specs: byName, fingerprint };
}

/**
 * The CI's guard of the registry (§10.3 rule 1, R-040): each collection in the database that the
 * registry does not have, so has no retention class and no delete handler. Run it after the tests
 * of a service, on the database they used. The server's own (`system.*`) are not the service's.
 */
export function retentionProblems(
  collections: Collections,
  inDatabase: readonly string[],
): string[] {
  const problems: string[] = [];
  for (const name of [...new Set(inDatabase)].sort()) {
    if (name.startsWith('system.') || collections.specs.has(name)) continue;
    problems.push(
      `The collection ${name} of ${collections.service} is not in the retention registry: give it a retention class, its expiry and its account delete handler.`,
    );
  }
  return problems;
}
