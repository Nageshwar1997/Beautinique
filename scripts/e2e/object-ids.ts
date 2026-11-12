// RULES §4.17 (owner, 2026-11-12): every document's _id is an ObjectId, and so is every id that
// points at a document. A deployable's tests end with this look at their own database, like the
// collection-scan watch: an _id that is not an ObjectId, a reference field that holds a string,
// or an id written as a string anywhere else fails the run. The TypeScript of typed collections
// catches most of it; dot paths, pipelines and records written by hand it does not.
import { type Mongo, ObjectId } from '@beautinique/backend-server-mongo';

type Db = Mongo['db'];

/** A field that names a document: `userId`, `roleId`, `permissionIds`, `grantedBy`, `by` ... */
const REFERENCE = /(?:Id|Ids|By)$|^by$/;

/** Fields whose ids do not name a document: Redis and BullMQ ids, migration names, a provider's own. */
const NOT_REFERENCES = new Set(['challengeId', 'loginId', 'jobId', 'migrationId', 'providerId']);

/** Where an id may be a string: event envelopes are JSON messages, and the Redis epoch is Redis's. */
const STRING_IDS_AT = [
  'platform_outbox.envelope',
  'platform_dead_letters.envelope',
  'platform_state.value',
];

// a string that is an ObjectId's hex or a UUID: an id written as text
const LOOKS_LIKE_ID =
  /^(?:[0-9a-f]{24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null &&
  typeof value === 'object' &&
  !(value instanceof ObjectId) &&
  !(value instanceof Date) &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

/** What is wrong in one value at `path` (`collection.field.sub`), its key `key`. */
function walk(value: unknown, path: string, key: string, out: Set<string>): void {
  if (STRING_IDS_AT.some((at) => path === at || path.startsWith(`${at}.`))) return;
  const reference = REFERENCE.test(key) && !NOT_REFERENCES.has(key);
  if (Array.isArray(value)) {
    for (const item of value) walk(item, path, key, out);
    return;
  }
  if (isPlainObject(value)) {
    for (const [inner, child] of Object.entries(value)) walk(child, `${path}.${inner}`, inner, out);
    return;
  }
  if (typeof value === 'string') {
    if (reference) out.add(`${path}: a reference as a string`);
    else if (!NOT_REFERENCES.has(key) && LOOKS_LIKE_ID.test(value)) {
      out.add(`${path}: an id written as a string`);
    }
  }
}

/**
 * Everything in the database that breaks the rule, one line per collection and field (no data
 * in it): `_id` not an ObjectId, a reference (`…Id`, `…Ids`, `…By`) that is a string, an id
 * written as text anywhere else. Reads every document, so only for a test's own database.
 */
export async function objectIdProblems(db: Db): Promise<string[]> {
  const out = new Set<string>();
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  for (const { name } of collections) {
    if (name.startsWith('system.')) continue;
    const documents = await db
      .collection(name)
      .find({}, { comment: 'full read: the ObjectId guard of the tests looks at every document' })
      .toArray();
    for (const document of documents) {
      if (!(document._id instanceof ObjectId)) out.add(`${name}._id: not an ObjectId`);
      for (const [key, value] of Object.entries(document)) {
        if (key !== '_id') walk(value, `${name}.${key}`, key, out);
      }
    }
  }
  return [...out].toSorted();
}

/** Throws with every problem objectIdProblems finds. Call it before the database is dropped. */
export async function expectObjectIds(db: Db): Promise<void> {
  const problems = await objectIdProblems(db);
  if (problems.length > 0) {
    throw new Error(
      `${db.databaseName} keeps ids that are not ObjectIds (RULES §4.17):\n` +
        problems.map((problem) => `  ${problem}`).join('\n'),
    );
  }
}
