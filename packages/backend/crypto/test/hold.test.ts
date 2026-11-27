import { defineCollection, defineCollections } from '@beautinique/backend-mongo';
import { createFakeClock } from '@beautinique/shared-clock';
import { ObjectId, type ClientSession, type Db, type Document } from 'mongodb';
import { describe, expect, it } from 'vitest';

import { generateSealingKeyPair, openSealed, parseOpeningKey } from '../src/break-glass.ts';
import { createHold, SEALED_RECORDS_COLLECTION, sealedRecordsCollection } from '../src/mongo.ts';
import { createSealer, parseSealingKey } from '../src/sealing.ts';

const NOW = new Date('2026-11-27T06:00:00.000Z');
const ERASE_AT = new Date('2027-05-26T06:00:00.000Z');
const clock = createFakeClock(NOW);
const pair = generateSealingKeyPair('h1');
const sealer = createSealer({
  service: 'identity',
  key: parseSealingKey(pair.publicKey, 'IDENTITY_HOLD_KEY'),
});

const testCollection = (name: string, retention: 'account' | 'tech') =>
  defineCollection({
    name,
    retention,
    indexes: [],
    expiry: { never: 'A test collection.' },
    accountDelete: { none: 'A test collection.' },
  });

const collections = defineCollections('identity', [
  sealedRecordsCollection,
  testCollection('users', 'account'),
  testCollection('otp_codes', 'tech'),
]);

/** A database and a session in memory: what was inserted, and whether it is in a transaction. */
function inMemory(inTransaction = true) {
  const inserted: { collection: string; doc: Document; session: unknown }[] = [];
  const session = { inTransaction: () => inTransaction } as unknown as ClientSession;
  const db = {
    collection: (collection: string) => ({
      insertOne: (doc: Document, options: { session: unknown }) => {
        inserted.push({ collection, doc, session: options.session });
        return Promise.resolve({ insertedId: new ObjectId() });
      },
    }),
  } as unknown as Db;
  return { db, session, inserted };
}

const fields = { name: 'Asha Verma', phone: '+919876543210' };
const input = {
  collection: 'users',
  recordId: '6747a1b2c3d4e5f601234567',
  fields,
  eraseAt: ERASE_AT,
};

describe('held copies in sealed_records (docs/ARCHITECTURE.md §10.3 rule 4, SR-097)', () => {
  const hold = createHold({ sealer, collections, clock });

  it('AC-PLATFORM-11: the copy is written in the given transaction, sealed, with only ids in the clear', async () => {
    const { db, session, inserted } = inMemory();
    const accountId = new ObjectId();

    const id = await hold.hold(db, session, { ...input, accountId });

    expect(id).toBeInstanceOf(ObjectId);
    expect(inserted).toHaveLength(1);
    const [{ collection, doc, session: used }] = inserted as [(typeof inserted)[number]];
    expect(collection).toBe(SEALED_RECORDS_COLLECTION);
    expect(used).toBe(session);
    expect(doc).toEqual({
      collection: 'users',
      recordId: input.recordId,
      accountId,
      keyId: 'h1',
      sealed: expect.stringMatching(/^s1\.h1\./) as string,
      sealedAt: NOW,
      eraseAt: ERASE_AT,
    });
    expect(JSON.stringify(doc)).not.toContain('Asha');
    expect(JSON.stringify(doc)).not.toContain('9876543210');
    expect(
      openSealed(doc['sealed'] as string, parseOpeningKey(pair.privateKey), {
        service: 'identity',
        collection: 'users',
        recordId: input.recordId,
      }),
    ).toEqual(fields);
  });

  it('a copy without an account has no accountId field', async () => {
    const { db, session, inserted } = inMemory();
    await hold.hold(db, session, input);
    expect(Object.keys(inserted[0]?.doc ?? {})).not.toContain('accountId');
  });

  it('AC-PLATFORM-11: outside a transaction the copy is refused, and nothing is written', async () => {
    const { db, session, inserted } = inMemory(false);
    await expect(hold.hold(db, session, input)).rejects.toThrow(
      new RangeError(
        'The held copy of identity.users must be written in the transaction of its erase.',
      ),
    );
    expect(inserted).toHaveLength(0);
  });

  it('AC-PLATFORM-11: a record of a tech collection is not held (D-321), nor one of no known collection', async () => {
    const { db, session, inserted } = inMemory();
    await expect(hold.hold(db, session, { ...input, collection: 'otp_codes' })).rejects.toThrow(
      new RangeError('identity.otp_codes is of the tech class: its records are not held (D-321).'),
    );
    for (const collection of ['devices', SEALED_RECORDS_COLLECTION]) {
      await expect(hold.hold(db, session, { ...input, collection })).rejects.toThrow(
        new RangeError(`identity.${collection} is not a collection of identity that is held.`),
      );
    }
    expect(inserted).toHaveLength(0);
  });

  it('the eraseAt must be a date after now', async () => {
    const { db, session } = inMemory();
    for (const eraseAt of [NOW, new Date('2026-01-01'), new Date('nope'), '2027-05-26']) {
      await expect(hold.hold(db, session, { ...input, eraseAt: eraseAt as Date })).rejects.toThrow(
        new RangeError('The eraseAt of the held copy of identity.users must be a date after now.'),
      );
    }
  });

  it('the sealer and the collections must be of one service', () => {
    const other = createSealer({
      service: 'commerce',
      key: parseSealingKey(pair.publicKey, 'COMMERCE_HOLD_KEY'),
    });
    expect(() => createHold({ sealer: other, collections, clock })).toThrow(
      new RangeError('The sealer is of commerce, and the collections of identity.'),
    );
  });

  it('AC-PLATFORM-11: sealed_records is in the registry: class case, gone at eraseAt by TTL, kept after an account delete', () => {
    expect(sealedRecordsCollection.name).toBe('sealed_records');
    expect(sealedRecordsCollection.retention).toBe('case');
    expect(sealedRecordsCollection.expiry).toEqual({ ttlIndex: 'eraseAt_ttl' });
    expect(sealedRecordsCollection.indexes).toContainEqual({
      name: 'eraseAt_ttl',
      key: { eraseAt: 1 },
      expireAfterSeconds: 0,
    });
    expect('none' in sealedRecordsCollection.accountDelete).toBe(true);
  });
});
