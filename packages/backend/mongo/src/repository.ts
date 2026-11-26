import { conflict, validationFailed } from '@beautinique/backend-server-kit';
import {
  BSON,
  ObjectId,
  type ClientSession,
  type Collection,
  type Document,
  type Filter,
  type InferIdType,
  type UpdateFilter,
  type WithId,
} from 'mongodb';
import { date, instanceof as isInstance, number, string, tuple, union } from 'zod';

import { mongoCall, QUERY_MAX_TIME_MS } from './errors.ts';

/** The most items one page of a list has (docs/ARCHITECTURE.md §10.4 rule 8). */
export const PAGE_LIMIT_MAX = 100;

/** A document of an aggregate that changes: it has a `version` (§10.2 rule 5). */
export interface Versioned extends Document {
  version: number;
}

export interface WriteOptions {
  session?: ClientSession;
}

// The time of a query on the server: `maxTimeMS` (§10.2 rule 3), and inside a transaction the
// transaction's own deadline.
function timeOf(session: ClientSession | undefined): {
  session?: ClientSession;
  maxTimeMS?: number;
} {
  if (session === undefined) return { maxTimeMS: QUERY_MAX_TIME_MS };
  return session.inTransaction() ? { session } : { session, maxTimeMS: QUERY_MAX_TIME_MS };
}

// The update with the version one up; an update that sets the version itself is refused.
function withNextVersion(update: Document): Document {
  if (Array.isArray(update)) {
    throw new RangeError(
      'An update of a versioned document is an update document, not a pipeline.',
    );
  }
  for (const [operator, fields] of Object.entries(update)) {
    if (!operator.startsWith('$')) {
      throw new RangeError(`An update takes only operators such as $set; ${operator} is not one.`);
    }
    if (typeof fields === 'object' && fields !== null && 'version' in fields) {
      throw new RangeError('An update must not change version: it goes up by one by itself.');
    }
  }
  const inc = (update['$inc'] ?? {}) as Document;
  return { ...update, $inc: { ...inc, version: 1 } };
}

/**
 * Changes one document that is still at `version`, and with `where` still in that state (the old
 * state in the filter, §10.2 rule 6): its version goes up by one. If it is not (changed by another,
 * or gone), nothing changes and it is a 409 (`CONFLICT`). Gives the document as it is after.
 */
export async function updateVersioned<T extends Versioned>(
  collection: Collection<T>,
  target: { id: InferIdType<T>; version: number; where?: Filter<T> },
  update: UpdateFilter<T>,
  { session }: WriteOptions = {},
): Promise<WithId<T>> {
  const filter = { ...target.where, _id: target.id, version: target.version } as Filter<T>;
  const after = await mongoCall(
    () =>
      collection.findOneAndUpdate(filter, withNextVersion(update) as UpdateFilter<T>, {
        returnDocument: 'after',
        ...timeOf(session),
      }),
    session,
  );
  if (after === null) throw conflict();
  return after;
}

/**
 * Changes one document that matches `filter`, a state or a limit in it (a conditional `$inc` on a
 * counter, §10.2 rules 6 and 8). Gives the document as it is after, or `null` when none matched:
 * the caller says what that means.
 */
export async function updateIf<T extends Document>(
  collection: Collection<T>,
  filter: Filter<T>,
  update: UpdateFilter<T>,
  { session }: WriteOptions = {},
): Promise<WithId<T> | null> {
  return mongoCall(
    () =>
      collection.findOneAndUpdate(filter, update, { returnDocument: 'after', ...timeOf(session) }),
    session,
  );
}

export interface PageRequest<T extends Document> {
  filter: Filter<T>;
  /**
   * The field the list is in the order of, with `_id` after it for the same value. Every document
   * has it, and an index is `{ [by]: direction, _id: direction }` (or `_id` alone).
   */
  by: string;
  direction: 1 | -1;
  /** 1 to 100. */
  limit: number;
  /** The `next` of the page before; the list's first page without it. */
  after?: string;
  projection?: Document;
  session?: ClientSession;
}

export interface Page<T> {
  items: WithId<T>[];
  /** The cursor of the next page, or `null` on the last one. */
  next: string | null;
}

type Position = string | number | Date | ObjectId;

// A cursor is [the field, its value, the `_id`] in canonical Extended JSON, as base64url: a value
// keeps its type (a date stays a date), and a cursor of another list is not taken for this one.
const cursorSchema = tuple(
  [
    string('after.by must be the name of the field the list is in the order of.'),
    union(
      [string(), number(), date(), isInstance(ObjectId)],
      'after.value must be a text, a number, a date or an id.',
    ),
    union(
      [string(), number(), isInstance(ObjectId)],
      'after.id must be a text, a number or an id.',
    ),
  ],
  'after must be the cursor of a list.',
);

const badCursor = () =>
  validationFailed([{ path: 'query.after', message: 'after is not a cursor of this list.' }]);

function readCursor(text: string, by: string): [Position, Position] {
  let parsed: unknown;
  try {
    parsed = BSON.EJSON.parse(Buffer.from(text, 'base64url').toString('utf8'), { relaxed: true });
  } catch {
    throw badCursor();
  }
  const read = cursorSchema.safeParse(parsed);
  if (!read.success || read.data[0] !== by) throw badCursor();
  return [read.data[1], read.data[2]];
}

function valueAt(document: Document, path: string): unknown {
  let value: unknown = document;
  for (const part of path.split('.')) {
    if (typeof value !== 'object' || value === null) return undefined;
    value = (value as Document)[part];
  }
  return value;
}

function writeCursor(document: Document, by: string): string {
  const value = valueAt(document, by);
  if (value === undefined || value === null) {
    throw new RangeError(`Every document of a list in the order of ${by} must have ${by}.`);
  }
  const text = BSON.EJSON.stringify([by, value, document['_id']], { relaxed: false });
  return Buffer.from(text, 'utf8').toString('base64url');
}

/**
 * One page of a list, by a cursor and never `skip` (§10.4 rule 8): what a page reads does not grow
 * with how far into the list it is. A cursor that is not of this list is a 400 at `query.after`.
 */
export async function findPage<T extends Document>(
  collection: Collection<T>,
  request: PageRequest<T>,
): Promise<Page<T>> {
  const { by, direction, limit, after, projection, session } = request;
  if (!Number.isInteger(limit) || limit < 1 || limit > PAGE_LIMIT_MAX) {
    throw new RangeError(`limit must be a whole number from 1 to ${String(PAGE_LIMIT_MAX)}.`);
  }
  const beyond = direction === 1 ? '$gt' : '$lt';
  let filter: Document = request.filter;
  if (after !== undefined) {
    const [value, id] = readCursor(after, by);
    const position =
      by === '_id'
        ? { _id: { [beyond]: id } }
        : { $or: [{ [by]: { [beyond]: value } }, { [by]: value, _id: { [beyond]: id } }] };
    filter = { $and: [request.filter, position] };
  }
  const sort: Document = by === '_id' ? { _id: direction } : { [by]: direction, _id: direction };
  const found = await mongoCall(
    () =>
      collection
        .find(filter as Filter<T>, {
          sort,
          limit: limit + 1,
          ...(projection === undefined ? {} : { projection }),
          ...timeOf(session),
        })
        .toArray(),
    session,
  );
  const items = found.slice(0, limit);
  const last = items.at(-1);
  return {
    items,
    next: found.length > limit && last !== undefined ? writeCursor(last, by) : null,
  };
}
