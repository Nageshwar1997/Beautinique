# @beautinique/backend-mongo

The MongoDB helpers of a service: the transaction helper, the repository base, the money codec, the release step, the retention registry, the query plan guard and the idempotency store.

## Install

```sh
npm install @beautinique/backend-mongo @beautinique/backend-server-kit @beautinique/shared-clock @beautinique/shared-money mongodb zod
```

## Usage

```ts
import {
  createMongoClient,
  createMongoIdempotencyStore,
  defineCollection,
  defineCollections,
  idempotencyCollection,
  leasesCollection,
  migrationsCollection,
  MONEY_BSON_SCHEMA,
  moneyToBson,
  releaseSchema,
  updateVersioned,
  withTransaction,
} from '@beautinique/backend-mongo';

const client = createMongoClient({
  uri: config.COMMERCE_MONGO_URI,
  appName: 'commerce',
  maxPoolSize: 10,
});
const db = client.db('commerce');

const orders = defineCollection({
  name: 'orders',
  retention: 'book',
  schema: {
    bsonType: 'object',
    required: ['total', 'version'],
    properties: { total: MONEY_BSON_SCHEMA },
  },
  indexes: [{ name: 'customerId_placedAt', key: { customerId: 1, placedAt: -1 } }],
  expiry: { job: 'commerce.orders.archive' },
  accountDelete: { run: ({ db, session, accountId }) => removeAddresses(db, session, accountId) },
});
const collections = defineCollections('commerce', [
  orders,
  idempotencyCollection,
  leasesCollection,
  migrationsCollection,
]);

// Before the service listens: the collections, their validators and indexes.
await releaseSchema(db, collections, { clock, owner: instanceId });
const kit = createServerKit({
  clock,
  logger,
  idempotency: createMongoIdempotencyStore(db),
  actorOf,
});

// In a handler: one transaction, tried again on a conflict, a 503 after 10 seconds.
const placed = await withTransaction(
  client,
  async (session) => {
    await db
      .collection('orders')
      .insertOne({ total: moneyToBson(amount), version: 1 }, { session });
    return updateVersioned(
      db.collection('carts'),
      { id: cartId, version, where: { status: 'open' } },
      { $set: { status: 'ordered' } },
      { session },
    );
  },
  { clock },
);
```

## API

### Client and transactions

- `createMongoClient({ uri, appName, maxPoolSize })`: the client of a service's database: majority writes and reads, retryable writes and reads, 5 seconds to find the server (`SERVER_SELECTION_TIMEOUT_MS`), and a field that is `undefined` left out.
- `withTransaction(client, work, { clock, deadlineMs? })` (docs/ARCHITECTURE.md §10.2 rules 1 to 3): a snapshot read and a majority write. A transient error (a write conflict, a new primary) runs the whole work again, after a short random wait; a commit whose result is not known is committed again, and only the commit. After `TRANSACTION_DEADLINE_MS` (10 seconds) it is a 503 (`SERVICE_UNAVAILABLE`, `Retry-After` 5), as is a query that ran out of its time or a database out of reach; a commit that ran out of its own time (`COMMIT_MAX_TIME_MS`, 2 seconds) is a 503 at once, since whether it committed is not known. Any other error is thrown as it is. The work may run more than once: it does nothing outside the database and passes the session to every query.
- `mongoCall(run, session?)`, `isMongoUnavailable`, `isDuplicateKey`: a database that does not answer is a 503, not a 500 (inside a transaction the error stays, so it is tried again).

### Repositories

- `updateVersioned(collection, { id, version, where? }, update, { session? })`: changes one document that is still at `version` and, with `where`, still in that state (§10.2 rules 5 and 6); the version goes up by one by itself (an update that sets it is refused). Otherwise a 409 (`CONFLICT`) and nothing changes.
- `updateIf(collection, filter, update, { session? })`: a change on a condition (a limit with a conditional `$inc`, §10.2 rule 8): the document after, or `null`.
- `findPage(collection, { filter, by, direction, limit, after?, projection?, session? })`: a page of a list by a cursor, never `skip` (§10.4 rule 8): `limit` 1 to 100 (`PAGE_LIMIT_MAX`), in the order of `by` and then `_id`, and `next` (the cursor of the next page, or `null`). A page reads only its own documents however deep it is. A cursor of another list is a 400 at `query.after`.
- Every query has `maxTimeMS` 2 seconds (`QUERY_MAX_TIME_MS`), except inside a transaction, which has its own deadline.

### Money

- `moneyToBson(amount)` and `moneyFromBson(value, field)`: an amount is a BSON `long` of paise; the driver may give it back as a number, a `Long` or a `bigint`, and each is checked to be whole paise in the safe range (the error names the field, never the value). `MONEY_BSON_SCHEMA` is its `$jsonSchema`: a `long` of 0 or more.

### Collections, retention and the release step

- `defineCollection({ name, retention, schema?, indexes, expiry, accountDelete })`: a collection with its retention class (`RETENTION_CLASSES`: `tech`, `case`, `account`, `book`, `tax`, `ref`, `agg`), how its records go (`{ ttlIndex }`, `{ job }` or `{ never: why }`), what an account's delete does to it (`{ run }` in the delete's transaction, or `{ none: why }`), the `$jsonSchema` of the fields that must be right and its indexes. Anything missing or wrong is a `RangeError` at once (§10.3 rule 1).
- `defineCollections(service, specs)`: the collections of a service's database, the platform ones with them (`idempotencyCollection`, `leasesCollection`, `migrationsCollection`), and the `fingerprint` of the plan.
- `retentionProblems(collections, namesInDatabase)`: the CI's guard: each collection in the database that the registry does not have (R-040, AC-PLATFORM-11).
- `releaseSchema(db, collections, { clock, owner, waitMs?, pollMs? })` (§10.4 rule 1): before the service listens, every collection with its validator (strict) and every index, behind the `release` lease; the same fingerprint does nothing (`unchanged`); an instance that finds another making it waits (`waited`), and past `RELEASE_WAIT_MS` its boot stops. It never drops a collection; an index the plan no longer has is dropped; an index whose name is there with another shape stops it, since a new shape is a new name (§10.4 rule 2). Setting a validator needs the release user's `collMod` (§10.4 rule 5).
- `runDataMigrations(db, migrations, { clock, owner, batchSize?, opsPerSecond?, signal? })`: after the service listens, each `DataMigration` (`id`, `batch({ db, after, size })`) not yet done, in order, a batch at a time (`MIGRATION_BATCH_SIZE` 50) and slow enough for the free cluster (`MIGRATION_OPS_PER_SECOND` 100); how far it came is in `migrations`, so a stop (`signal`) goes on from there. One instance runs them (`release-data` lease); the others get `elsewhere`.
- `acquireLease(db, { name, owner, now, ttlMs })` and `releaseLease(db, { name, owner })`: a lease in `leases` that one owner holds at a time; one atomic step on its unique `_id`.

### Query plan guard

- `queryPlanProblems(collection, { name, filter, sort?, projection?, limit? })`: the `explain` of a repository's query on the real database after the release step, and what is wrong with it: a scan of the whole collection (`COLLSCAN`), a sort in memory (`SORT`) or a collection that is not there (docs/OPERATIONS.md §2 rule 6). `planProblems(name, explain)` reads a plan of any depth in one pass.

### Idempotency

- `createMongoIdempotencyStore(db)`: the server kit's `IdempotencyStore` in `idempotency_keys` (class `tech`, TTL 48 hours). The `_id` is the SHA-256 of the caller, the route and the key, never the key (§10.1 rule 4). `begin` is one atomic upsert on that `_id`: of two requests with one key at one moment only one starts. A record whose time is out (its lease, or its 48 hours) is as if it were not there, before the TTL index removes it. `complete` and `release` change the record only while it is the claim's (its fingerprint and lease) and has no answer. The answer's body is kept as JSON text.

## Visibility

Public is fine. These are the general ways of using MongoDB well (transactions tried again, versioned updates, cursor pages, a release step behind a lease, a guard of collection scans) that the MongoDB docs describe to everybody. It holds no connection string, no collection of a service and nothing about how Beautinique sells; the collections and their indexes are in each service's own package. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
