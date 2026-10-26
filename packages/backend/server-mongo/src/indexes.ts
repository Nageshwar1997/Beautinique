import { isDeepStrictEqual } from 'node:util';

import { type Document, type IndexDescriptionInfo, MongoServerError } from 'mongodb';

import type { Mongo } from './connect';

/**
 * One index a collection must have (ARCHITECTURE §11.1). An index never changes under its name: a
 * new shape gets a new name (expand), and a migration drops the old one once no running code needs
 * it (contract). Text search is Atlas Search, not a MongoDB text index.
 */
export interface IndexSpec {
  collection: string;
  /** The index name in MongoDB; unique per collection. */
  name: string;
  /** Fields in order: 1 or -1, or '2dsphere' / 'hashed'. */
  key: Readonly<Record<string, 1 | -1 | '2dsphere' | 'hashed'>>;
  unique?: boolean;
  sparse?: boolean;
  /** A TTL index: documents go this many seconds after the date in the (single) key field. */
  expireAfterSeconds?: number;
  partialFilterExpression?: Document;
}

/** What syncIndexes did: `collection.name` of each index it made, and of each it found but was not asked for. */
export interface IndexSyncReport {
  created: string[];
  extra: string[];
}

/**
 * An index of that name exists with another shape, or one with these keys exists under another name.
 * syncIndexes never changes or drops an index by itself: the old shape may still serve the running
 * release. Give the new shape a new name, and drop the old one in a later migration.
 */
export class IndexConflictError extends Error {
  readonly collection: string;
  readonly index: string;

  constructor(
    collection: string,
    index: string,
    reason: string,
    options: { cause?: unknown } = {},
  ) {
    super(
      `Index ${collection}.${index}: ${reason}. An index never changes under its name: give the new ` +
        'shape a new name, and drop the old one with a migration once no running code needs it.',
      options,
    );
    this.name = 'IndexConflictError';
    this.collection = collection;
    this.index = index;
  }
}

// MongoDB's codes for "same name, other options" and "same keys, other name" (createIndexes)
const CONFLICT_CODES = new Set([85, 86]);
// the collection does not exist yet (listIndexes, under indexes())
const NAMESPACE_NOT_FOUND = 26;

/** True when the index MongoDB has is the one the spec asks for. */
function sameShape(found: IndexDescriptionInfo, spec: IndexSpec): boolean {
  return (
    isDeepStrictEqual(Object.entries(found.key), Object.entries(spec.key)) &&
    Boolean(found.unique) === Boolean(spec.unique) &&
    Boolean(found.sparse) === Boolean(spec.sparse) &&
    found.expireAfterSeconds === spec.expireAfterSeconds &&
    isDeepStrictEqual(found.partialFilterExpression, spec.partialFilterExpression)
  );
}

async function indexesOf(mongo: Mongo, collection: string): Promise<IndexDescriptionInfo[]> {
  try {
    return await mongo.db.collection(collection).indexes();
  } catch (error) {
    if (error instanceof MongoServerError && error.code === NAMESPACE_NOT_FOUND) return [];
    throw error;
  }
}

/**
 * Makes every index in `specs` that is missing, one after another (safe to repeat, and to run on two
 * instances at once). An index with a spec's name but another shape is an IndexConflictError, before
 * anything is made. Indexes nobody asked for stay, and are reported as `extra`.
 */
export async function syncIndexes(
  mongo: Mongo,
  specs: readonly IndexSpec[],
): Promise<IndexSyncReport> {
  const byCollection = new Map<string, IndexSpec[]>();
  for (const spec of specs) {
    const list = byCollection.get(spec.collection) ?? [];
    if (list.some((other) => other.name === spec.name)) {
      throw new Error(`Index ${spec.collection}.${spec.name} is listed twice.`);
    }
    list.push(spec);
    byCollection.set(spec.collection, list);
  }

  const missing: IndexSpec[] = [];
  const extra: string[] = [];
  for (const [collection, wanted] of byCollection) {
    const found = await indexesOf(mongo, collection);
    for (const spec of wanted) {
      const existing = found.find((index) => index.name === spec.name);
      if (!existing) missing.push(spec);
      else if (!sameShape(existing, spec)) {
        throw new IndexConflictError(collection, spec.name, 'it exists with another shape');
      }
    }
    for (const index of found) {
      const name = String(index.name);
      if (name !== '_id_' && !wanted.some((spec) => spec.name === name)) {
        extra.push(`${collection}.${name}`);
      }
    }
  }

  const created: string[] = [];
  for (const spec of missing) {
    const { collection, name, key, ...options } = spec;
    try {
      await mongo.db.collection(collection).createIndex({ ...key }, { ...options, name });
    } catch (error) {
      if (error instanceof MongoServerError && CONFLICT_CODES.has(Number(error.code))) {
        throw new IndexConflictError(
          collection,
          name,
          'an index with these keys exists under another name',
          { cause: error },
        );
      }
      throw error;
    }
    created.push(`${collection}.${name}`);
  }
  return { created, extra };
}
