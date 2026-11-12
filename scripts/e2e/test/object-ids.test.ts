// The ObjectId guard of the deployables' tests (RULES §4.17, owner 2026-11-12). Against the local
// MongoDB (`npm run infra:up`), in a database of its own.
import { randomUUID } from 'node:crypto';

import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo, ObjectId } from '@beautinique/backend-server-mongo';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { expectObjectIds, objectIdProblems } from '../object-ids.ts';

let mongo: Mongo;

beforeAll(async () => {
  mongo = await connectMongo({
    uri: 'mongodb://localhost:27017/?replicaSet=rs0',
    dbName: `bq_test_objectids_${randomUUID().slice(0, 8)}`,
    appName: 'object-ids-test',
    logger: createLogger({ name: 'object-ids-test', level: 'silent' }),
  });
});

afterAll(async () => {
  await mongo.db.dropDatabase();
  await mongo.close();
});

const hex = '65f1a2b3c4d5e6f708192a3b';
const uuid = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';

describe('the ObjectId guard', () => {
  it('passes ObjectIds everywhere, names in their own fields and ids that are not documents', async () => {
    await mongo.db.collection('good_grants').insertOne({
      _id: new ObjectId(),
      userId: new ObjectId(),
      roleId: new ObjectId(),
      permissionIds: [new ObjectId(), new ObjectId()],
      grantedBy: null,
      scope: { type: 'self', ids: [new ObjectId()] },
      key: 'admin.state_admin',
      state: { type: 'state', ids: ['MH'] },
      // a Redis id, a BullMQ job, a migration's name and a provider's own message id
      otp: { challengeId: uuid },
      jobId: `${hex}@notify.emails`,
      migrationId: '20261029-001-sign-up-grants',
      providerId: '<202611120001.abc@smtp-relay.mailin.fr>',
      createdAt: new Date(),
    });
    // an event is a JSON message: its ids are hex
    await mongo.db.collection('platform_outbox').insertOne({
      _id: new ObjectId(),
      envelope: { eventId: hex, aggregate: { type: 'user', id: hex }, data: { userId: hex } },
    });
    await mongo.db.collection('platform_state').insertOne({
      _id: new ObjectId(),
      key: 'redis-epoch',
      value: uuid,
    });
    expect(await objectIdProblems(mongo.db)).toEqual([]);
    await expect(expectObjectIds(mongo.db)).resolves.toBeUndefined();
  });

  it('finds a string _id, a reference as a string and an id written as text, one line each', async () => {
    const bad = mongo.db.collection<Record<string, unknown>>('bad_records');
    await bad.insertMany([
      { _id: 'admin.state_admin' as never, name: 'a name in _id' },
      { _id: uuid as never, userId: new ObjectId() },
      { _id: new ObjectId(), userId: hex, appointedBy: ['admin.master'] },
      { _id: new ObjectId(), scope: { type: 'self', ids: [hex] }, sid: uuid },
      { _id: new ObjectId(), userId: hex },
    ]);
    expect(await objectIdProblems(mongo.db)).toEqual([
      'bad_records._id: not an ObjectId',
      'bad_records.appointedBy: a reference as a string',
      'bad_records.scope.ids: an id written as a string',
      'bad_records.sid: an id written as a string',
      'bad_records.userId: a reference as a string',
    ]);
    await expect(expectObjectIds(mongo.db)).rejects.toThrow(
      /keeps ids that are not ObjectIds \(RULES §4\.17\):\n {2}bad_records\._id: not an ObjectId/,
    );
  });
});
