import { setTimeout as pause } from 'node:timers/promises';

import type { Clock } from '@beautinique/shared-clock';
import type { Db, Document } from 'mongodb';

import {
  defineCollection,
  type Collections,
  type CollectionSpec,
  type IndexSpec,
} from './collections.ts';
import { QUERY_MAX_TIME_MS } from './errors.ts';
import { acquireLease, releaseLease } from './lease.ts';
import { canonicalJson } from './utils/canonical.ts';

/** The platform collection of what the release steps did (docs/ARCHITECTURE.md §10.4 rule 4). */
export const MIGRATIONS_COLLECTION = 'migrations';

/** How long one instance holds the release, renewed between the batches of a data migration. */
export const RELEASE_LEASE_MS = 60_000;

/** How long an instance waits for another's release before its boot stops. */
export const RELEASE_WAIT_MS = 60_000;

/** A data migration's batch, and how fast batches go: the free cluster's 100 ops a second (§10.4 rule 4). */
export const MIGRATION_BATCH_SIZE = 50;
export const MIGRATION_OPS_PER_SECOND = 100;

const SCHEMA = 'schema';
const SCHEMA_LEASE = 'release';
const DATA_LEASE = 'release-data';
const POLL_MS = 500;
const MIGRATION_ID = /^[a-z0-9][a-z0-9-]{0,99}$/;

export interface MigrationRecord {
  /** `schema`, or `data:<id>` for a data migration. */
  _id: string;
  at: Date;
  fingerprint?: string;
  /** The `_id` a data migration has done up to. */
  after?: unknown;
  done?: boolean;
}

/** The collection of what the release steps did, for a service's `defineCollections`. */
export const migrationsCollection = defineCollection({
  name: MIGRATIONS_COLLECTION,
  retention: 'ref',
  schema: {
    bsonType: 'object',
    required: ['_id', 'at'],
    properties: { _id: { bsonType: 'string' }, at: { bsonType: 'date' } },
  },
  indexes: [],
  expiry: { never: 'One record for the schema and one per data migration.' },
  accountDelete: { none: 'No personal data: it names the release steps.' },
});

export interface ReleaseOptions {
  /** "Now" for the lease (docs/RULES.md RT-13). */
  clock: Clock;
  /** This process (an instance id). */
  owner: string;
  /** `RELEASE_WAIT_MS` when not given. */
  waitMs?: number;
  /** How often a waiting instance looks again. */
  pollMs?: number;
}

export interface ReleaseResult {
  /** `ran` made the changes; `unchanged` found the same fingerprint; `waited` saw another instance make them. */
  kind: 'ran' | 'unchanged' | 'waited';
  fingerprint: string;
  /** What it made, for the log: `created orders`, `index orders.status_1 created`. */
  changes: string[];
}

// The shape of an index, the same from the plan or from the database.
function shapeOf(index: Document): string {
  const fields = index as Record<string, unknown>;
  return canonicalJson({
    key: Object.entries(fields['key'] as Record<string, unknown>),
    unique: fields['unique'] === true,
    sparse: fields['sparse'] === true,
    partialFilterExpression: fields['partialFilterExpression'] ?? null,
    expireAfterSeconds: fields['expireAfterSeconds'] ?? null,
  });
}

async function makeIndexes(db: Db, spec: CollectionSpec): Promise<string[]> {
  const changes: string[] = [];
  const collection = db.collection(spec.name);
  const found = new Map<string, Document>();
  const listed = (await collection
    .listIndexes({ maxTimeMS: QUERY_MAX_TIME_MS })
    .toArray()) as Document[];
  for (const index of listed) {
    const name = String((index as Record<string, unknown>)['name']);
    if (name !== '_id_') found.set(name, index);
  }
  for (const index of spec.indexes) {
    const there = found.get(index.name);
    found.delete(index.name);
    if (there !== undefined) {
      if (shapeOf(there) !== shapeOf(index)) {
        throw new Error(
          `The index ${spec.name}.${index.name} has another shape in the database. A new shape is a new name, and the old one goes in the next release (docs/ARCHITECTURE.md §10.4 rule 2).`,
        );
      }
      continue;
    }
    await collection.createIndex({ ...index.key }, optionsOf(index), undefined);
    changes.push(`index ${spec.name}.${index.name} created`);
  }
  // What the plan no longer has: the old shape, a release after its new name came (§10.4 rule 2).
  for (const name of found.keys()) {
    await collection.dropIndex(name);
    changes.push(`index ${spec.name}.${name} dropped`);
  }
  return changes;
}

function optionsOf(index: IndexSpec): Document {
  return {
    name: index.name,
    ...(index.unique === true ? { unique: true } : {}),
    ...(index.sparse === true ? { sparse: true } : {}),
    ...(index.partialFilterExpression === undefined
      ? {}
      : { partialFilterExpression: index.partialFilterExpression }),
    ...(index.expireAfterSeconds === undefined
      ? {}
      : { expireAfterSeconds: index.expireAfterSeconds }),
  };
}

async function makeSchema(db: Db, collections: Collections): Promise<string[]> {
  const changes: string[] = [];
  const there = new Map<string, Document>();
  for (const info of await db.listCollections({}, { nameOnly: false }).toArray()) {
    there.set(info.name, info);
  }
  for (const name of [...collections.specs.keys()].sort()) {
    const spec = collections.specs.get(name) as CollectionSpec;
    const validator = spec.schema === undefined ? {} : { $jsonSchema: spec.schema };
    const info = there.get(name);
    if (info === undefined) {
      await db.createCollection(name, {
        validator,
        validationLevel: 'strict',
        validationAction: 'error',
      });
      changes.push(`created ${name}`);
    } else {
      if (info['type'] !== 'collection') {
        throw new Error(
          `${name} is in the database, and it is a ${String(info['type'])}, not a collection.`,
        );
      }
      const options = (info['options'] ?? {}) as Document;
      const same =
        canonicalJson(options['validator'] ?? {}) === canonicalJson(validator) &&
        (options['validationLevel'] ?? 'strict') === 'strict' &&
        (options['validationAction'] ?? 'error') === 'error';
      if (!same) {
        // Needs the release user's `collMod`; the app's user has only its data (§10.4 rule 5).
        await db.command({
          collMod: name,
          validator,
          validationLevel: 'strict',
          validationAction: 'error',
        });
        changes.push(`validator of ${name}`);
      }
    }
    changes.push(...(await makeIndexes(db, spec)));
  }
  return changes;
}

/**
 * The schema part of a service's release step, before it listens (docs/ARCHITECTURE.md §10.4 rule
 * 1, docs/OPERATIONS.md §3 rule 5): every collection with its validator and every index, behind the
 * `release` lease. The same fingerprint as last time does nothing. An instance that finds another
 * holding the lease waits for it; past `waitMs` its boot stops with an error.
 *
 * It never drops a collection; an index the plan no longer has is dropped. An index whose name is
 * there with another shape stops it (§10.4 rule 2).
 */
export async function releaseSchema(
  db: Db,
  collections: Collections,
  { clock, owner, waitMs = RELEASE_WAIT_MS, pollMs = POLL_MS }: ReleaseOptions,
): Promise<ReleaseResult> {
  const { fingerprint } = collections;
  const records = db.collection<MigrationRecord>(MIGRATIONS_COLLECTION);
  const done = async (): Promise<boolean> =>
    (await records.findOne({ _id: SCHEMA }, { maxTimeMS: QUERY_MAX_TIME_MS }))?.fingerprint ===
    fingerprint;
  const result = (kind: ReleaseResult['kind'], changes: string[] = []): ReleaseResult => ({
    kind,
    fingerprint,
    changes,
  });

  if (await done()) return result('unchanged');
  const tries = Math.max(1, Math.ceil(waitMs / pollMs));
  for (let attempt = 0; ; attempt += 1) {
    const lease = { name: SCHEMA_LEASE, owner, now: clock.now(), ttlMs: RELEASE_LEASE_MS };
    if (await acquireLease(db, lease)) break;
    if (attempt >= tries) {
      throw new Error(
        `Another instance has held the release lease of ${collections.service} for ${String(waitMs)} ms; this boot stops, and the next one tries again.`,
      );
    }
    await pause(pollMs);
    if (await done()) return result('waited');
  }
  try {
    if (await done()) return result('waited');
    const changes = await makeSchema(db, collections);
    await records.updateOne(
      { _id: SCHEMA },
      { $set: { fingerprint, at: clock.now() } },
      { upsert: true, maxTimeMS: QUERY_MAX_TIME_MS },
    );
    return result('ran', changes);
  } finally {
    await releaseLease(db, { name: SCHEMA_LEASE, owner });
  }
}

/**
 * A long data change (docs/ARCHITECTURE.md §10.4 rules 3 and 4): idempotent, in `_id` order, a
 * small batch at a time.
 */
export interface DataMigration {
  /** Small letters, digits and `-`, in the order they are to run: `2026-11-orders-ist-day`. */
  id: string;
  /**
   * Does the documents after `after` (`null` for the first batch), in `_id` order, at most `size`:
   * gives the last `_id` it did, or `null` when none was left. Doing a batch twice is no harm.
   */
  batch(input: { db: Db; after: unknown; size: number }): Promise<unknown>;
}

export interface DataMigrationOptions {
  clock: Clock;
  owner: string;
  /** `MIGRATION_BATCH_SIZE` when not given. */
  batchSize?: number;
  /** `MIGRATION_OPS_PER_SECOND` when not given: a batch is one op per document. */
  opsPerSecond?: number;
  /** SIGTERM: it stops after the batch it is on, and the next start goes on from there. */
  signal?: AbortSignal;
}

export type DataMigrationResult =
  | { kind: 'done'; ran: string[] }
  | { kind: 'elsewhere' }
  | { kind: 'stopped'; at: string; ran: string[] };

/**
 * The data part of the release step, after the service listens, in the background (§10.4 rule 1):
 * each migration not yet done, in order, a batch at a time, slow enough for the free cluster;
 * how far it has come is in `migrations`, so a stop goes on from there. Only one instance runs
 * them (the `release-data` lease); the others are told `elsewhere`.
 */
export async function runDataMigrations(
  db: Db,
  migrations: readonly DataMigration[],
  {
    clock,
    owner,
    batchSize = MIGRATION_BATCH_SIZE,
    opsPerSecond = MIGRATION_OPS_PER_SECOND,
    signal,
  }: DataMigrationOptions,
): Promise<DataMigrationResult> {
  const ids = new Set<string>();
  for (const { id } of migrations) {
    if (!MIGRATION_ID.test(id)) {
      throw new RangeError(`The data migration ${id} needs an id of small letters, digits and -.`);
    }
    if (ids.has(id)) throw new RangeError(`The data migration ${id} is given twice.`);
    ids.add(id);
  }
  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new RangeError('batchSize must be a whole number of 1 or more.');
  }
  if (!(opsPerSecond > 0)) throw new RangeError('opsPerSecond must be more than 0.');

  const lease = () => ({ name: DATA_LEASE, owner, now: clock.now(), ttlMs: RELEASE_LEASE_MS });
  if (!(await acquireLease(db, lease()))) return { kind: 'elsewhere' };
  const records = db.collection<MigrationRecord>(MIGRATIONS_COLLECTION);
  const ran: string[] = [];
  const save = (id: string, fields: Partial<MigrationRecord>) =>
    records.updateOne(
      { _id: `data:${id}` },
      { $set: { ...fields, at: clock.now() } },
      { upsert: true, maxTimeMS: QUERY_MAX_TIME_MS },
    );
  try {
    for (const migration of migrations) {
      const id = `data:${migration.id}`;
      const record = await records.findOne({ _id: id }, { maxTimeMS: QUERY_MAX_TIME_MS });
      if (record?.done === true) continue;
      let after: unknown = record?.after ?? null;
      for (;;) {
        // Stopped, or the lease went to another (this process was too slow): it stops here.
        if (signal?.aborted === true || !(await acquireLease(db, lease()))) {
          return { kind: 'stopped', at: migration.id, ran };
        }
        const last = await migration.batch({ db, after, size: batchSize });
        if (last === null || last === undefined) {
          await save(migration.id, { done: true });
          ran.push(migration.id);
          break;
        }
        after = last;
        await save(migration.id, { after });
        try {
          await pause(Math.ceil((batchSize * 1000) / opsPerSecond), undefined, { signal });
        } catch {
          return { kind: 'stopped', at: migration.id, ran };
        }
      }
    }
    return { kind: 'done', ran };
  } finally {
    await releaseLease(db, { name: DATA_LEASE, owner });
  }
}
