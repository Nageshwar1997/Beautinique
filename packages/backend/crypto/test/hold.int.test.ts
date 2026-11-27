import { createOutbox, OUTBOX_COLLECTION, outboxCollection } from '@beautinique/backend-events';
import {
  defineCollection,
  defineCollections,
  leasesCollection,
  releaseSchema,
  withTransaction,
} from '@beautinique/backend-mongo';
import { createFakeClock } from '@beautinique/shared-clock';
import { defineEvent } from '@beautinique/shared-contracts';
import { BSON, ObjectId, type Db, type MongoClient } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { string } from 'zod';

import { createBlindIndex } from '../src/blind-index.ts';
import { generateSealingKeyPair, openSealed, parseOpeningKey } from '../src/break-glass.ts';
import { createFieldCipher } from '../src/field-cipher.ts';
import { createHold, SEALED_RECORDS_COLLECTION, sealedRecordsCollection } from '../src/mongo.ts';
import { createSealer, parseSealingKey } from '../src/sealing.ts';
import { keyringOf } from './utils/keys.ts';
import { connectTest, integrationRuns, testDatabase } from './utils/mongo.ts';

const runs = await integrationRuns('hold.int.test.ts');

const NOW = new Date('2026-11-27T06:00:00.000Z');
const ERASE_AT = new Date('2027-05-26T06:00:00.000Z');

const users = defineCollection({
  name: 'users',
  retention: 'account',
  indexes: [{ name: 'panIndex', key: { panIndex: 1 } }],
  expiry: { never: 'A test collection.' },
  accountDelete: { none: 'A test collection.' },
});

const userErased = defineEvent({
  type: 'identity.user.erased',
  version: 1,
  description: 'A user was erased.',
  data: { userId: string('userId is required.') },
});

// Personal data as it looks in the product: none of it may be in the database in the clear.
const PAN = 'ABCPE1234F';
const NAME = 'Asha Verma';
const PHONE = '+919876543210';
// Looked for as they are: a short pattern could turn up by chance in random base64url.
const PLAINTEXT = [PAN, NAME, PHONE.slice(3)];

describe.skipIf(!runs)('held copies and encrypted fields on the real MongoDB', () => {
  let client: MongoClient;
  let db: Db;
  const clock = createFakeClock(NOW);
  const pair = generateSealingKeyPair('h1');
  const collections = defineCollections('identity', [
    // Only what the erase writes: the laptop's MongoDB is shared by the tests of every package.
    outboxCollection,
    leasesCollection,
    sealedRecordsCollection,
    users,
  ]);
  const sealer = createSealer({
    service: 'identity',
    key: parseSealingKey(pair.publicKey, 'IDENTITY_HOLD_KEY'),
  });
  const hold = createHold({ sealer, collections, clock });
  const outbox = createOutbox({
    service: 'identity',
    subscriptions: { 'identity.user.erased': ['commerce'] },
    clock,
  });
  const cipher = createFieldCipher({
    service: 'identity',
    keys: keyringOf('IDENTITY_FIELD_KEYS', 'k1'),
  });
  const blind = createBlindIndex({
    service: 'identity',
    keys: keyringOf('IDENTITY_BLIND_KEYS', 'k1'),
  });
  const panAt = (recordId: string) => ({ collection: 'users', field: 'pan', recordId });

  /** A user with an encrypted PAN and its blind index, a name and a phone. */
  async function newUser(): Promise<string> {
    const id = new ObjectId();
    const recordId = id.toHexString();
    await db.collection('users').insertOne({
      _id: id,
      status: 'active',
      name: NAME,
      phone: PHONE,
      pan: cipher.encrypt(PAN, panAt(recordId)),
      panIndex: blind.indexOf(PAN, { collection: 'users', field: 'pan' }),
    });
    return recordId;
  }

  /** The erase: the fields go, their sealed copy and the event are written, in one transaction. */
  function erase(recordId: string, fail = false) {
    const _id = ObjectId.createFromHexString(recordId);
    return withTransaction(
      client,
      async (session) => {
        const user = await db.collection('users').findOne({ _id }, { session });
        await db
          .collection('users')
          .updateOne(
            { _id },
            { $unset: { name: '', phone: '' }, $set: { status: 'erased' } },
            { session },
          );
        await hold.hold(db, session, {
          collection: 'users',
          recordId,
          accountId: _id,
          fields: { name: user?.['name'], phone: user?.['phone'] },
          eraseAt: ERASE_AT,
        });
        await outbox.append(db, session, userErased, {
          aggregate: { type: 'user', id: recordId, version: 1 },
          actor: { type: 'system', id: 'test' },
          correlationId: `corr-${recordId}`,
          causationId: `cause-${recordId}`,
          data: { userId: recordId },
        });
        if (fail) throw new TypeError('The erase stopped half way.');
      },
      { clock },
    );
  }

  beforeAll(async () => {
    client = await connectTest('crypto');
    db = testDatabase(client, 'crypto');
    await releaseSchema(db, collections, { clock, owner: 'test' });
  });

  afterAll(async () => {
    await db.dropDatabase();
    await client.close();
  });

  it('AC-PLATFORM-11: an erase takes the fields out, and writes their sealed copy and its event, in one transaction', async () => {
    const recordId = await newUser();

    await erase(recordId);

    const user = await db
      .collection('users')
      .findOne({ _id: ObjectId.createFromHexString(recordId) });
    expect(user).not.toHaveProperty('name');
    expect(user).not.toHaveProperty('phone');
    expect(user?.['status']).toBe('erased');
    const copy = await db
      .collection(SEALED_RECORDS_COLLECTION)
      .findOne({ collection: 'users', recordId });
    expect(copy).toMatchObject({ keyId: 'h1', sealedAt: NOW, eraseAt: ERASE_AT });
    expect(
      openSealed(copy?.['sealed'] as string, parseOpeningKey(pair.privateKey), {
        service: 'identity',
        collection: 'users',
        recordId,
      }),
    ).toEqual({ name: NAME, phone: PHONE });
    expect(
      await db.collection(OUTBOX_COLLECTION).countDocuments({ aggregateKey: `user:${recordId}` }),
    ).toBe(1);
  });

  it('AC-PLATFORM-11: an erase that does not commit leaves the fields, and neither a copy nor an event', async () => {
    const recordId = await newUser();

    await expect(erase(recordId, true)).rejects.toThrow('The erase stopped half way.');

    const user = await db
      .collection('users')
      .findOne({ _id: ObjectId.createFromHexString(recordId) });
    expect(user).toMatchObject({ name: NAME, phone: PHONE, status: 'active' });
    expect(await db.collection(SEALED_RECORDS_COLLECTION).countDocuments({ recordId })).toBe(0);
    expect(
      await db.collection(OUTBOX_COLLECTION).countDocuments({ aggregateKey: `user:${recordId}` }),
    ).toBe(0);
  });

  it('AC-PLATFORM-10: an encrypted value copied to another record in the database does not open, and its index finds it', async () => {
    const a = await newUser();
    const b = await newUser();
    const recordA = await db.collection('users').findOne({ _id: ObjectId.createFromHexString(a) });
    await db
      .collection('users')
      .updateOne({ _id: ObjectId.createFromHexString(b) }, { $set: { pan: recordA?.['pan'] } });
    const recordB = await db.collection('users').findOne({ _id: ObjectId.createFromHexString(b) });

    expect(cipher.decrypt(recordA?.['pan'] as string, panAt(a))).toBe(PAN);
    expect(() => cipher.decrypt(recordB?.['pan'] as string, panAt(b))).toThrow(
      'Could not open identity.users.pan',
    );
    const found = await db.collection('users').countDocuments({
      panIndex: { $in: blind.lookupValues(PAN, { collection: 'users', field: 'pan' }) },
    });
    expect(found).toBeGreaterThanOrEqual(2);
  });

  it('AC-PLATFORM-10: after the erases, no personal data is anywhere in the database in the clear', async () => {
    const erased = await newUser();
    await erase(erased);
    // The users not erased still hold a name and a phone in the clear by design; the PAN is
    // never in the clear, in any collection.
    for (const { name } of await db.listCollections().toArray()) {
      for (const doc of await db.collection(name).find().toArray()) {
        const text = BSON.EJSON.stringify(doc);
        expect(text).not.toContain(PAN);
        if (name !== 'users' || doc['status'] === 'erased') {
          for (const plain of PLAINTEXT) expect(text).not.toContain(plain);
        }
      }
    }
  });

  it('SR-097: the database takes a held copy only in its sealed form, and removes it at its eraseAt', async () => {
    await expect(
      db.collection(SEALED_RECORDS_COLLECTION).insertOne({
        collection: 'users',
        recordId: 'x1',
        keyId: 'h1',
        sealed: `{"name":"${NAME}"}`,
        sealedAt: NOW,
        eraseAt: ERASE_AT,
      }),
    ).rejects.toThrow(/validation/i);
    const indexes = await db.collection(SEALED_RECORDS_COLLECTION).listIndexes().toArray();
    expect(indexes).toContainEqual(
      expect.objectContaining({ name: 'eraseAt_ttl', key: { eraseAt: 1 }, expireAfterSeconds: 0 }),
    );
  });
});
