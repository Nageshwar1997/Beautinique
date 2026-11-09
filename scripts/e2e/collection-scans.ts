// RULES §4.13: every query reads an index. A deployable's tests watch their own database with
// MongoDB's profiler, which then records only the operations that read a whole collection
// (planSummary COLLSCAN), and fail when the deployable made one (QA-ID-002). A read that needs every
// document on purpose (the role catalog, a migration over every account) says so where it is
// made, with the query's comment `full read: <why>`; the watch lets those through.
import type { Mongo } from '@beautinique/backend-server-mongo';

type Db = Mongo['db'];

/** How a query says it reads every document on purpose: `{ comment: 'full read: <why>' }`. */
export const FULL_READ = 'full read:';

interface ProfileEntry {
  op: string;
  ns: string;
  appName?: string;
  command?: Record<string, unknown>;
}

/** Turns the watch on. Call it before the deployable starts: its release steps query too. */
export async function watchCollectionScans(db: Db): Promise<void> {
  await db.command({ profile: 1, filter: { planSummary: 'COLLSCAN' } });
}

/** A query's shape: its fields and operators, every value a `?` (one line per shape, no test data). */
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.length === 0 ? [] : [shape(value[0])];
  if (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shape(inner)]));
  }
  return '?';
}

/** What a scan read: the filter of a find, update or delete, or the first stage of a pipeline. */
function what(command: Record<string, unknown> = {}): unknown {
  const pipeline = command.pipeline;
  return shape(
    command.filter ?? command.q ?? command.query ?? (Array.isArray(pipeline) ? pipeline[0] : null),
  );
}

/**
 * Every collection scan the watched database saw from `appNames` (the deployable's own MongoDB
 * clients: a test's look-ups on a connection of its own do not count), one line per shape. A query
 * marked `full read:` is not one.
 */
export async function collectionScans(db: Db, appNames: readonly string[]): Promise<string[]> {
  const entries = await db
    .collection<ProfileEntry>('system.profile')
    .find({ appName: { $in: [...appNames] }, op: { $ne: 'getmore' } })
    .toArray();
  const marked = (entry: ProfileEntry) => {
    const comment = entry.command?.comment;
    return typeof comment === 'string' && comment.startsWith(FULL_READ);
  };
  const lines = entries.flatMap((entry) => {
    const collection = entry.ns.slice(entry.ns.indexOf('.') + 1);
    // system.profile is the watch's own record
    if (marked(entry) || collection.startsWith('system.')) return [];
    return [`${entry.op} ${collection} ${JSON.stringify(what(entry.command))}`];
  });
  return [...new Set(lines)].toSorted();
}

/** Throws with every collection scan the deployable made. Call it before the database is dropped. */
export async function expectNoCollectionScans(db: Db, appNames: readonly string[]): Promise<void> {
  const scans = await collectionScans(db, appNames);
  if (scans.length > 0) {
    throw new Error(
      `${appNames.join(', ')} read a whole collection, without an index (RULES §4.13):\n` +
        scans.map((scan) => `  ${scan}`).join('\n'),
    );
  }
}
