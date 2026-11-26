import { AppError } from '@beautinique/backend-server-kit';
import {
  BSON,
  MongoNetworkError,
  ObjectId,
  type ClientSession,
  type Collection,
  type Document,
} from 'mongodb';
import { describe, expect, it, vi } from 'vitest';

import { isDuplicateKey, isMongoUnavailable, mongoCall } from '../src/errors.ts';
import { findPage, PAGE_LIMIT_MAX, updateIf, updateVersioned } from '../src/repository.ts';

// A collection that only records what it is asked, and answers with `found`.
function fakeCollection(found: Document[] = [], after: Document | null = null) {
  const finds: { filter: Document; options: Document }[] = [];
  const updates: { filter: Document; update: Document; options: Document }[] = [];
  const collection = {
    find: (filter: Document, options: Document) => {
      finds.push({ filter, options });
      return { toArray: () => Promise.resolve(found.slice(0, options['limit'] as number)) };
    },
    findOneAndUpdate: (filter: Document, update: Document, options: Document) => {
      updates.push({ filter, update, options });
      return Promise.resolve(after);
    },
  } as unknown as Collection<{ _id: string; version: number } & Document>;
  return { collection, finds, updates };
}

const session = (inTransaction: boolean) =>
  ({ inTransaction: () => inTransaction }) as unknown as ClientSession;
const cursorOf = (value: unknown) =>
  Buffer.from(BSON.EJSON.stringify(value as never, { relaxed: false }), 'utf8').toString(
    'base64url',
  );

describe('updateVersioned and updateIf (docs/ARCHITECTURE.md §10.2 rules 5, 6 and 8)', () => {
  it('SR-045: the update is on the id, the version and the old state, and the version goes up by one', async () => {
    const changed = { _id: 'o1', version: 4, status: 'packed' };
    const { collection, updates } = fakeCollection([], changed);

    const after = await updateVersioned(
      collection,
      { id: 'o1', version: 3, where: { status: 'packing' } },
      { $set: { status: 'packed' }, $inc: { packSeq: 1 } },
    );

    expect(after).toBe(changed);
    expect(updates[0]).toEqual({
      filter: { status: 'packing', _id: 'o1', version: 3 },
      update: { $set: { status: 'packed' }, $inc: { packSeq: 1, version: 1 } },
      options: { returnDocument: 'after', maxTimeMS: 2_000 },
    });
  });

  it('SR-045: a document changed by another, or gone, is a 409 and nothing changes', async () => {
    const { collection } = fakeCollection([], null);

    const thrown = await updateVersioned(
      collection,
      { id: 'o1', version: 3 },
      { $set: { a: 1 } },
    ).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(AppError);
    expect(thrown).toMatchObject({ status: 409, code: 'CONFLICT' });
  });

  it('CR-12: an update that sets the version itself, a pipeline or a field that is not an operator is refused', async () => {
    const { collection, updates } = fakeCollection([], { _id: 'o1', version: 1 });
    const target = { id: 'o1', version: 1 };

    await expect(updateVersioned(collection, target, { $set: { version: 9 } })).rejects.toThrow(
      'An update must not change version: it goes up by one by itself.',
    );
    await expect(updateVersioned(collection, target, { $inc: { version: 2 } })).rejects.toThrow(
      'must not change version',
    );
    await expect(updateVersioned(collection, target, [{ $set: { a: 1 } }])).rejects.toThrow(
      'An update of a versioned document is an update document, not a pipeline.',
    );
    await expect(updateVersioned(collection, target, { status: 'x' })).rejects.toThrow(
      'An update takes only operators such as $set; status is not one.',
    );
    expect(updates).toHaveLength(0);
  });

  it("AC-PLATFORM-1: in a transaction the query has the transaction's time, outside it maxTimeMS", async () => {
    const { collection, updates } = fakeCollection([], { _id: 'c', count: 1 });
    const inside = session(true);
    const outside = session(false);

    await updateIf(
      collection,
      { _id: 'c', count: { $lt: 5 } },
      { $inc: { count: 1 } },
      { session: inside },
    );
    await updateIf(collection, { _id: 'c' }, { $inc: { count: 1 } }, { session: outside });

    expect(updates[0]?.options).toEqual({ returnDocument: 'after', session: inside });
    expect(updates[1]?.options).toEqual({
      returnDocument: 'after',
      session: outside,
      maxTimeMS: 2_000,
    });
  });

  it('SR-045: updateIf gives null when nothing matched, for the caller to say what it means', async () => {
    const { collection } = fakeCollection([], null);

    expect(
      await updateIf(collection, { _id: 'c', count: { $lt: 5 } }, { $inc: { count: 1 } }),
    ).toBeNull();
  });
});

describe('findPage: a list by a cursor (docs/ARCHITECTURE.md §10.4 rule 8)', () => {
  const id = (n: number) => new ObjectId(n.toString(16).padStart(24, '0'));
  const docs = [1, 2, 3].map((n) => ({ _id: id(n), placedAt: new Date(Date.UTC(2026, 10, n)) }));

  it('SR-036: a page asks for one more than its limit, and the next cursor is the last one of the page', async () => {
    const { collection, finds } = fakeCollection(docs);

    const page = await findPage(collection, {
      filter: { customerId: 'c1' },
      by: 'placedAt',
      direction: -1,
      limit: 2,
    });

    expect(page.items).toEqual(docs.slice(0, 2));
    expect(finds[0]).toEqual({
      filter: { customerId: 'c1' },
      options: { sort: { placedAt: -1, _id: -1 }, limit: 3, maxTimeMS: 2_000 },
    });
    expect(page.next).toBe(cursorOf(['placedAt', docs[1]?.placedAt, docs[1]?._id]));

    // The next page starts after it, the same date with a later id taken in too.
    await findPage(collection, {
      filter: { customerId: 'c1' },
      by: 'placedAt',
      direction: -1,
      limit: 2,
      after: page.next as string,
      projection: { placedAt: 1 },
    });
    expect(finds[1]).toEqual({
      filter: {
        $and: [
          { customerId: 'c1' },
          {
            $or: [
              { placedAt: { $lt: docs[1]?.placedAt } },
              { placedAt: docs[1]?.placedAt, _id: { $lt: docs[1]?._id } },
            ],
          },
        ],
      },
      options: {
        sort: { placedAt: -1, _id: -1 },
        limit: 3,
        projection: { placedAt: 1 },
        maxTimeMS: 2_000,
      },
    });
  });

  it('SR-036: the last page has no next cursor; a list by _id goes by _id alone', async () => {
    const { collection, finds } = fakeCollection(docs);

    expect(
      (await findPage(collection, { filter: {}, by: '_id', direction: 1, limit: 3 })).next,
    ).toBeNull();
    const first = await findPage(collection, { filter: {}, by: '_id', direction: 1, limit: 1 });
    await findPage(collection, {
      filter: {},
      by: '_id',
      direction: 1,
      limit: 1,
      after: first.next as string,
    });

    expect(finds[1]?.options['sort']).toEqual({ _id: 1 });
    expect(finds[2]?.filter).toEqual({ $and: [{}, { _id: { $gt: docs[0]?._id } }] });
  });

  it('SR-036: a field in a nested document, a number and a text keep their type in the cursor', async () => {
    const nested = [
      { _id: 'a', total: { amount: 1_299 }, name: 'x' },
      { _id: 'b', total: { amount: 1_299 }, name: 'y' },
    ];
    const { collection, finds } = fakeCollection(nested);

    const page = await findPage(collection, {
      filter: {},
      by: 'total.amount',
      direction: 1,
      limit: 1,
    });
    await findPage(collection, {
      filter: {},
      by: 'total.amount',
      direction: 1,
      limit: 1,
      after: page.next as string,
    });

    expect(finds[1]?.filter).toEqual({
      $and: [
        {},
        { $or: [{ 'total.amount': { $gt: 1_299 } }, { 'total.amount': 1_299, _id: { $gt: 'a' } }] },
      ],
    });
  });

  it('SR-036, CR-2: a cursor that is not of this list is a 400 at query.after, with no query run', async () => {
    const { collection, finds } = fakeCollection(docs);
    const request = { filter: {}, by: 'placedAt', direction: 1 as const, limit: 2 };
    const wrong = [
      'not base64 or json',
      Buffer.from('{"not":"json"', 'utf8').toString('base64url'),
      cursorOf({ by: 'placedAt' }),
      cursorOf(['total', 5, 'a']),
      cursorOf(['placedAt', { a: 1 }, 'a']),
      cursorOf(['placedAt', 5, true]),
      cursorOf(['placedAt', 5]),
    ];

    for (const after of wrong) {
      const thrown = await findPage(collection, { ...request, after }).catch(
        (error: unknown) => error,
      );
      expect(thrown, after).toMatchObject({
        status: 400,
        code: 'VALIDATION_FAILED',
        details: {
          issues: [{ path: 'query.after', message: 'after is not a cursor of this list.' }],
        },
      });
    }
    expect(finds).toHaveLength(0);
  });

  it('SR-007: a limit of 1 to 100 only, and a document without the field of the order is refused', async () => {
    const { collection } = fakeCollection([{ _id: 'a' }, { _id: 'b' }]);

    for (const limit of [0, 101, 1.5, Number.NaN]) {
      await expect(
        findPage(collection, { filter: {}, by: '_id', direction: 1, limit }),
      ).rejects.toThrow('limit must be a whole number from 1 to 100.');
    }
    expect(PAGE_LIMIT_MAX).toBe(100);
    await expect(
      findPage(collection, { filter: {}, by: 'placedAt', direction: 1, limit: 1 }),
    ).rejects.toThrow('Every document of a list in the order of placedAt must have placedAt.');
  });
});

describe('the database errors', () => {
  it('AC-PLATFORM-1: a database out of reach is a 503; inside a transaction the error stays for the retry', async () => {
    const down = new MongoNetworkError('connection closed');

    await expect(mongoCall(() => Promise.reject(down))).rejects.toMatchObject({ status: 503 });
    await expect(mongoCall(() => Promise.reject(down), session(true))).rejects.toBe(down);
    await expect(mongoCall(() => Promise.reject(down), session(false))).rejects.toMatchObject({
      status: 503,
    });
    const other = new Error('other');
    await expect(mongoCall(() => Promise.reject(other))).rejects.toBe(other);
    expect(isMongoUnavailable(new Error('x'))).toBe(false);
    expect(isDuplicateKey(new Error('E11000'))).toBe(false);
    expect(await mongoCall(vi.fn().mockResolvedValue(7))).toBe(7);
  });
});
