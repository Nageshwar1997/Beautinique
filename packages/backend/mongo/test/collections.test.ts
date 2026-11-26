import { assert, constantFrom, double, integer, oneof, property } from 'fast-check';
import { BSON, Long, ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';

import {
  defineCollection,
  defineCollections,
  RETENTION_CLASSES,
  retentionProblems,
  type CollectionSpec,
} from '../src/collections.ts';
import { idempotencyCollection } from '../src/idempotency.ts';
import { leasesCollection } from '../src/lease.ts';
import { migrationsCollection } from '../src/release.ts';
import { canonicalJson } from '../src/utils/canonical.ts';

const orders: CollectionSpec = {
  name: 'orders',
  retention: 'book',
  schema: {
    bsonType: 'object',
    required: ['version'],
    properties: { version: { bsonType: 'int' } },
  },
  indexes: [
    { name: 'customer_placed', key: { customerId: 1, placedAt: -1 } },
    { name: 'number_unique', key: { number: 1 }, unique: true },
  ],
  expiry: { job: 'commerce.orders.archive' },
  accountDelete: { run: () => Promise.resolve() },
};

describe('the retention registry (AC-PLATFORM-11, docs/ARCHITECTURE.md §10.3 rule 1)', () => {
  it('AC-PLATFORM-11: a collection with its class, expiry, delete handler, schema and indexes is taken', () => {
    expect(defineCollection(orders)).toBe(orders);
    expect(RETENTION_CLASSES).toEqual(['tech', 'case', 'account', 'book', 'tax', 'ref', 'agg']);
    for (const platform of [idempotencyCollection, leasesCollection, migrationsCollection]) {
      expect(defineCollection(platform)).toBe(platform);
    }
    expect(idempotencyCollection.retention).toBe('tech');
  });

  it('AC-PLATFORM-11: a collection without a retention class or a delete handler is refused', () => {
    const without = (change: Partial<Record<keyof CollectionSpec, unknown>>) => () =>
      defineCollection({ ...orders, ...change } as CollectionSpec);

    expect(without({ retention: undefined })).toThrow(
      'The collection orders needs a retention class: tech, case, account, book, tax, ref, agg.',
    );
    expect(without({ retention: 'forever' })).toThrow('needs a retention class');
    expect(without({ accountDelete: undefined })).toThrow(
      'The collection orders needs its account delete handler: run, or none and why.',
    );
    expect(without({ accountDelete: { none: ' ' } })).toThrow('account delete handler');
    expect(without({ accountDelete: { run: 'not a function' } })).toThrow('account delete handler');
    expect(without({ expiry: undefined })).toThrow(
      'The collection orders needs its expiry: a TTL index, the job that removes its records, or never and why.',
    );
    expect(without({ expiry: { never: '' } })).toThrow('needs its expiry');
    expect(without({ expiry: { job: '' } })).toThrow('needs its expiry');
    expect(without({ expiry: { ttlIndex: 'customer_placed' } })).toThrow(
      'The collection orders expires by customer_placed, which is not one of its TTL indexes.',
    );
    expect(without({ expiry: { ttlIndex: 'missing' } })).toThrow('not one of its TTL indexes');
  });

  it('CR-12: a name, an index or a schema that is wrong is refused at once', () => {
    const bad = (change: Partial<Record<keyof CollectionSpec, unknown>>) => () =>
      defineCollection({ ...orders, ...change } as CollectionSpec);

    for (const name of ['Orders', 'system.views', '1orders', '', 'a'.repeat(65), 7]) {
      expect(bad({ name }), String(name)).toThrow('A collection name is small letters');
    }
    expect(bad({ schema: 'object' })).toThrow('must be a $jsonSchema object');
    expect(bad({ schema: null })).toThrow('must be a $jsonSchema object');
    expect(bad({ indexes: [{ name: 'Bad', key: { a: 1 } }] })).toThrow(
      'The index orders.Bad: its name is letters, digits and _, starting with a small letter.',
    );
    expect(
      bad({
        indexes: [
          { name: 'a', key: { a: 1 } },
          { name: 'a', key: { b: 1 } },
        ],
      }),
    ).toThrow('The index orders.a is given twice.');
    expect(bad({ indexes: [{ name: 'a', key: {} }] })).toThrow('The index orders.a has no field.');
    expect(bad({ indexes: [{ name: 'a', key: { a: 'text' } }] })).toThrow(
      'The index orders.a: the field a must be 1 or -1.',
    );
    expect(bad({ indexes: [{ name: 'a', key: { a: 1 }, expireAfterSeconds: -1 }] })).toThrow(
      'expireAfterSeconds must be a whole number of 0 or more.',
    );
    expect(bad({ indexes: [{ name: 'a', key: { a: 1 }, expireAfterSeconds: 1.5 }] })).toThrow(
      'expireAfterSeconds must be a whole number',
    );
    expect(bad({ indexes: [{ name: 'a', key: { a: 1, b: 1 }, expireAfterSeconds: 60 }] })).toThrow(
      'The index orders.a: a TTL index has one field.',
    );
  });

  it('AC-PLATFORM-11: a service names each collection once', () => {
    expect(() => defineCollections('commerce', [orders, orders])).toThrow(
      'The collection orders is given twice.',
    );
    expect(() => defineCollections('Commerce', [orders])).toThrow('service must be small letters');
    const collections = defineCollections('commerce', [orders, idempotencyCollection]);
    expect([...collections.specs.keys()]).toEqual(['orders', 'idempotency_keys']);
    expect(collections.service).toBe('commerce');
  });

  it('AC-PLATFORM-11: the guard names each collection in the database that the registry does not have', () => {
    const collections = defineCollections('commerce', [orders, idempotencyCollection]);

    expect(retentionProblems(collections, ['orders', 'idempotency_keys', 'system.views'])).toEqual(
      [],
    );
    expect(retentionProblems(collections, ['carts', 'orders', 'audit_tmp', 'carts'])).toEqual([
      'The collection audit_tmp of commerce is not in the retention registry: give it a retention class, its expiry and its account delete handler.',
      'The collection carts of commerce is not in the retention registry: give it a retention class, its expiry and its account delete handler.',
    ]);
  });

  it('CR-40: a registry of 10^4 collections, and the guard over 10^5 names, in one pass', () => {
    const specs = Array.from({ length: 10_000 }, (_, index) => ({
      ...orders,
      name: `c${String(index)}`,
    }));
    const collections = defineCollections('commerce', specs);
    const server = Array.from({ length: 90_000 }, (_, index) => `system.c${String(index)}`);
    const names = [...specs.map((spec) => spec.name), ...server, 'stray'];

    expect(names.length).toBeGreaterThan(100_000);
    expect(retentionProblems(collections, names)).toHaveLength(1);
    expect(collections.fingerprint).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('the fingerprint of a plan (docs/ARCHITECTURE.md §10.4 rule 1)', () => {
  const fingerprint = (specs: CollectionSpec[]) => defineCollections('commerce', specs).fingerprint;
  const other: CollectionSpec = { ...orders, name: 'carts' };

  it('AC-PLATFORM-11: the same plan in another order is the same fingerprint', () => {
    const indexesTurned = { ...orders, indexes: [...orders.indexes].reverse() };
    const schemaTurned = {
      ...orders,
      schema: {
        properties: { version: { bsonType: 'int' } },
        required: ['version'],
        bsonType: 'object',
      },
    };

    expect(fingerprint([orders, other])).toBe(fingerprint([other, orders]));
    expect(fingerprint([indexesTurned])).toBe(fingerprint([orders]));
    expect(fingerprint([schemaTurned])).toBe(fingerprint([orders]));
    // What the release step does not make is not in it.
    expect(fingerprint([{ ...orders, expiry: { never: 'kept' }, retention: 'ref' }])).toBe(
      fingerprint([orders]),
    );
  });

  it('AC-PLATFORM-11: a change to a schema, an index or the order of its fields is another fingerprint', () => {
    const base = fingerprint([orders]);
    const changes: CollectionSpec[] = [
      {
        name: orders.name,
        retention: orders.retention,
        indexes: orders.indexes,
        expiry: orders.expiry,
        accountDelete: orders.accountDelete,
      },
      { ...orders, schema: { bsonType: 'object' } },
      { ...orders, indexes: [{ name: 'customer_placed', key: { placedAt: -1, customerId: 1 } }] },
      { ...orders, indexes: [{ name: 'customer_placed', key: { customerId: 1, placedAt: 1 } }] },
      { ...orders, indexes: [{ ...orders.indexes[1], name: 'number_unique', key: { number: 1 } }] },
      { ...orders, indexes: [...orders.indexes, { name: 'paid', key: { paid: 1 }, sparse: true }] },
      {
        ...orders,
        indexes: [{ name: 'open', key: { status: 1 }, partialFilterExpression: { open: true } }],
      },
      { ...orders, name: 'orders2' },
    ];
    const seen = new Set([base]);
    for (const change of changes) seen.add(fingerprint([change]));
    expect(seen.size).toBe(changes.length + 1);
  });
});

describe('canonicalJson', () => {
  it('AC-PLATFORM-11: keys in order, lists as they are, and BSON values as their canonical Extended JSON', () => {
    const id = new ObjectId('6745a1b2c3d4e5f601234567');

    expect(canonicalJson({ b: 'x', a: ['b', 'a'], c: undefined, d: null, e: true })).toBe(
      '{"a":["b","a"],"b":"x","d":null,"e":true}',
    );
    expect(canonicalJson(undefined)).toBe('null');
    expect(canonicalJson([undefined])).toBe('[null]');
    // A number keeps its BSON type: 1 is an int, 1.5 a double.
    expect(canonicalJson([1, 1.5])).toBe('[{"$numberInt":"1"},{"$numberDouble":"1.5"}]');
    expect(canonicalJson(Object.assign(Object.create(null) as object, { z: 'a', y: 'b' }))).toBe(
      '{"y":"b","z":"a"}',
    );
    expect(canonicalJson({ id })).toBe('{"id":{"$oid":"6745a1b2c3d4e5f601234567"}}');
    expect(canonicalJson(id)).not.toBe(canonicalJson(id.toHexString()));
    expect(canonicalJson(Long.fromNumber(5))).not.toBe(canonicalJson(5));
    expect(canonicalJson(new Date(0))).toBe('{"$date":{"$numberLong":"0"}}');
  });

  it('AC-PLATFORM-11: a number is written as canonical Extended JSON writes it (property)', () => {
    const edges = constantFrom(
      -0,
      2 ** 31 - 1,
      2 ** 31,
      -(2 ** 31),
      -(2 ** 31) - 1,
      2 ** 53,
      2 ** 63,
      1e21,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    );
    assert(
      property(oneof(integer(), double(), edges), (value) => {
        expect(canonicalJson(value)).toBe(BSON.EJSON.stringify(value, { relaxed: false }));
      }),
    );
  });

  it('CR-40: a value nested 10^5 deep is written without overflowing the stack', () => {
    let deep: unknown = 1;
    for (let level = 0; level < 100_000; level += 1) deep = level % 2 === 0 ? [deep] : { a: deep };

    const text = canonicalJson(deep);
    expect(text.startsWith('{"a":[{"a":')).toBe(true);
    expect(text.length).toBeGreaterThan(400_000);
  });
});
