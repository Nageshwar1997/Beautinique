// Deliberate bugs for `npm run mutate -- --package backend-server-mongo` (RULES §6): each one
// must make a test fail, unless `survives` says why it cannot. Keep this list in step with src/:
// the runner refuses a list whose `from` text no longer occurs exactly once.

import type { Mutation } from '../../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  {
    file: 'guard',
    name: 'no overlap flag',
    change: [['if (watch.inFlight > 0) watch.parallel = true;', '']],
  },
  {
    file: 'guard',
    name: 'never finishes',
    change: [['watch.inFlight -= 1;', '']],
  },
  {
    file: 'guard',
    name: 'key ignored',
    change: [
      [
        'const watch = key === undefined ? undefined : this.watches.get(key);',
        'const watch = [...this.watches.values()][0];',
      ],
    ],
  },
  {
    file: 'guard',
    name: 'watch keeps old state',
    change: [
      [
        'this.watches.set(key, { inFlight: 0, parallel: false, failedCode: undefined, settled: false });',
        'if (!this.watches.has(key)) this.watches.set(key, { inFlight: 0, parallel: false, failedCode: undefined, settled: false });',
      ],
    ],
    survives: 'equivalent: release always deletes',
  },
  {
    file: 'guard',
    name: 'release keeps watch',
    change: [['this.watches.delete(key);\n    return', 'return']],
  },
  {
    file: 'guard',
    name: 'in-flight query not counted',
    change: [['watch.parallel || watch.inFlight > 0', 'watch.parallel']],
  },
  {
    file: 'guard',
    name: 'writeErrors ignored',
    change: [['finished(event, failureCode(writeErrors?.[0]));', 'finished(event);']],
  },
  {
    file: 'guard',
    name: 'command failures ignored',
    change: [['finished(event, failureCode(event.failure));', 'finished(event);']],
  },
  {
    file: 'guard',
    name: 'last failure wins',
    change: [
      ['watch.failedCode ??= failedCode;', 'watch.failedCode = failedCode ?? watch.failedCode;'],
    ],
    survives:
      'equivalent: after the first failure MongoDB answers every later query with NoSuchTransaction, which is retryable and never recorded',
  },
  {
    file: 'transaction',
    name: 'no snapshot',
    change: [["readConcern: { level: 'snapshot' },", '']],
  },
  {
    file: 'transaction',
    name: 'no txn write concern',
    change: [["writeConcern: { w: 'majority' },", '']],
    survives: 'equivalent: client default is majority',
  },
  {
    file: 'transaction',
    name: 'no pause',
    change: [
      ['return new Promise((resolve) => setTimeout(resolve, ms));', 'return Promise.resolve();'],
    ],
  },
  {
    file: 'transaction',
    name: 'pause ignores deadline',
    change: [['Math.max(0, Math.min(wait, msLeft))', 'wait']],
  },
  {
    file: 'transaction',
    name: 'pause fixed 200',
    change: [['Math.min(10 * 2 ** (attempt - 1), 200)', '200']],
  },
  {
    file: 'transaction',
    name: 'pause no jitter',
    change: [['(0.5 + random() / 2)', '1']],
  },
  {
    file: 'transaction',
    name: 'pause no cap',
    change: [['Math.min(10 * 2 ** (attempt - 1), 200)', '10 * 2 ** (attempt - 1)']],
  },
  {
    file: 'transaction',
    name: 'pause from deadline, not now',
    change: [['backoffMs(attempt, deadline - Date.now())', 'backoffMs(attempt, deadline)']],
    survives: 'timing only',
  },
  {
    file: 'transaction',
    name: 'unknown commit not retried',
    change: [
      [
        'if (Date.now() >= deadline) throw new TransactionTimeoutError(attempt, error);\n        await pause(retry, deadline);\n        continue;',
        'throw error;',
      ],
    ],
  },
  {
    file: 'transaction',
    name: 'unknown commit retried forever',
    change: [
      [
        'if (Date.now() >= deadline) throw new TransactionTimeoutError(attempt, error);\n        await pause(retry',
        'await pause(retry',
      ],
    ],
  },
  {
    file: 'transaction',
    name: 'unknown commit no pause',
    change: [['await pause(retry, deadline);\n        continue;', 'continue;']],
  },
  {
    file: 'transaction',
    name: 'transient commit not retried',
    change: [
      ["if (hasLabel(error, 'TransientTransactionError')) return { transient: error };", ''],
    ],
  },
  {
    file: 'transaction',
    name: 'other commit errors retried',
    change: [
      [
        'return { transient: error };\n      throw error;',
        'return { transient: error };\n      return { transient: error };',
      ],
    ],
  },
  {
    file: 'transaction',
    name: 'transient commit past deadline rethrown raw',
    change: [
      ['throw new TransactionTimeoutError(attempt, result.transient);', 'throw result.transient;'],
    ],
  },
  {
    file: 'transaction',
    name: 'transient commit retried forever',
    change: [
      [
        'if (Date.now() >= deadline) throw new TransactionTimeoutError(attempt, result.transient);',
        '',
      ],
    ],
  },
  {
    file: 'transaction',
    name: 'parallel error not raised on throw',
    change: [['if (seen.parallel) throw new ParallelTransactionError({ cause: error });', '']],
  },
  {
    file: 'transaction',
    name: 'parallel success not caught',
    change: [
      [
        'if (mongo.guard.settle(key).parallel) {',
        'if (mongo.guard.settle(key).parallel && false) {',
      ],
    ],
  },
  {
    file: 'transaction',
    name: 'swallowed ignored when work throws',
    change: [['const caught = swallowed(seen, error);\n    if (caught) throw caught;', '']],
  },
  {
    file: 'transaction',
    name: 'swallowed ignored at commit',
    change: [
      ['const caught = swallowed(seen, result.transient);\n  if (caught) throw caught;', ''],
    ],
  },
  {
    file: 'transaction',
    name: 'any failure counts as swallowed',
    change: [
      ['codeOf(error) !== NO_SUCH_TRANSACTION) return undefined;', 'false) return undefined;'],
    ],
  },
  {
    file: 'guard',
    name: 'retryable failures recorded',
    change: [
      [
        'if (failure instanceof MongoError && RETRY_LABELS.some((label) => failure.hasErrorLabel(label)))\n    return undefined;',
        '',
      ],
    ],
  },
  {
    file: 'guard',
    name: 'late queries after work ignored',
    change: [
      [
        'if (END_COMMANDS.has(event.commandName)) return;\n        watch.parallel = true;',
        'return;',
      ],
    ],
  },
  {
    file: 'guard',
    name: 'settle stops watching',
    change: [
      [
        'if (watch) watch.settled = true;\n    return this.seen(watch);',
        'this.watches.delete(key);\n    return this.seen(watch);',
      ],
    ],
  },
  {
    file: 'transaction',
    name: 'no event-loop turn before settle (defence in depth)',
    change: [['await new Promise<void>((resolve) => setImmediate(resolve));', '']],
  },
  {
    file: 'transaction',
    name: 'late query at commit ignored',
    change: [
      ['if (seen.parallel) throw new ParallelTransactionError({ cause: result.transient });', ''],
    ],
  },
  {
    file: 'transaction',
    name: 'orphans never killed',
    change: [['await killOrphans(mongo, orphans);\n      const session', 'const session']],
  },
  {
    file: 'transaction',
    name: 'orphans never recorded',
    change: [['if (dirty && lsid) orphans.push(lsid);', '']],
  },
  {
    file: 'transaction',
    name: 'transient not retried',
    change: [["if (!hasLabel(error, 'TransientTransactionError')) throw error;", 'throw error;']],
  },
  {
    file: 'transaction',
    name: 'every error retried',
    change: [["if (!hasLabel(error, 'TransientTransactionError')) throw error;", '']],
  },
  {
    file: 'transaction',
    name: 'no deadline on work retry',
    change: [
      [
        'if (Date.now() >= deadline) throw new TransactionTimeoutError(attempt, error);\n    return',
        'return',
      ],
    ],
  },
  {
    file: 'transaction',
    name: 'one session for every attempt, aborted between (the first review bug, as it was)',
    change: [
      [
        '    for (let attempt = 1; ; attempt += 1) {\n      await killOrphans(mongo, orphans);\n      const session = mongo.client.startSession();',
        '    const session = mongo.client.startSession();\n    for (let attempt = 1; ; attempt += 1) {\n      await killOrphans(mongo, orphans);',
      ],
      [
        'await session.endSession().catch(() => undefined);',
        'await session.abortTransaction().catch(() => undefined);',
      ],
    ],
  },
  {
    file: 'transaction',
    name: 'session not ended',
    change: [
      [
        'await session.endSession().catch(() => undefined);',
        'await session.abortTransaction().catch(() => undefined);',
      ],
    ],
  },
  {
    file: 'transaction',
    name: 'no retry log',
    change: [["'transaction committed after retrying'", "'committed'"]],
  },
  {
    file: 'transaction',
    name: 'default timeout 0',
    change: [['{ timeoutMs = 10_000 }', '{ timeoutMs = 0 }']],
  },
  {
    file: 'connect',
    name: 'any server accepted',
    change: [
      ["if (typeof hello.setName !== 'string' && hello.msg !== 'isdbgrid') {", 'if (false) {'],
    ],
  },
  {
    file: 'connect',
    name: 'mongos refused',
    change: [["&& hello.msg !== 'isdbgrid'", '']],
  },
  {
    file: 'connect',
    name: 'pool 100',
    change: [['maxPoolSize = 5,', 'maxPoolSize = 100,']],
  },
  {
    file: 'connect',
    name: 'w 1',
    change: [
      [
        "writeConcern: { w: 'majority' },\n    readPreference",
        'writeConcern: { w: 1 },\n    readPreference',
      ],
    ],
  },
  {
    file: 'connect',
    name: 'undefined stored',
    change: [['ignoreUndefined: true,', '']],
  },
  {
    file: 'connect',
    name: 'no monitoring',
    change: [['monitorCommands: true,', '']],
  },
  {
    file: 'connect',
    name: 'raw connect error',
    change: [
      [
        'throw new Error(\n      `MongoDB did not answer',
        'throw error;\n    throw new Error(\n      `MongoDB did not answer',
      ],
    ],
  },
  {
    file: 'connect',
    name: 'client kept open on bad server',
    change: [['await client.close();\n    throw error;', 'throw error;']],
    survives: 'checked by hand',
  },
  {
    file: 'connect',
    name: 'no connect log',
    change: [["'mongo connected',", "'mongo up',"]],
  },
  {
    file: 'connect',
    name: 'ready always true',
    change: [['return false;', 'return true;']],
  },
  {
    file: 'connect',
    name: 'ready no timeout',
    change: [['{ ping: 1 }, { timeoutMS: 2000 }', '{ ping: 1 }']],
  },
  {
    file: 'connect',
    name: 'close does not close',
    change: [['await client.close();\n      logger', 'logger']],
  },

  // syncIndexes (2026-10-27)
  {
    file: 'indexes',
    name: 'one index listed twice',
    change: [['if (list.some((other) => other.name === spec.name)) {', 'if (false) {']],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'spec dropped from its collection',
    change: [['    list.push(spec);\n', '']],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'missing index not made',
    change: [['if (!existing) missing.push(spec);', 'if (!existing) void spec;']],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'changed shape accepted',
    change: [['else if (!sameShape(existing, spec)) {', 'else if (false) {']],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'shape: keys not compared',
    change: [
      ['isDeepStrictEqual(Object.entries(found.key), Object.entries(spec.key)) &&', 'true &&'],
    ],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'shape: key order not compared',
    change: [
      [
        'isDeepStrictEqual(Object.entries(found.key), Object.entries(spec.key)) &&',
        'isDeepStrictEqual(found.key, spec.key) &&',
      ],
    ],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'shape: unique not compared',
    change: [['Boolean(found.unique) === Boolean(spec.unique) &&', 'true &&']],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'shape: sparse not compared',
    change: [['Boolean(found.sparse) === Boolean(spec.sparse) &&', 'true &&']],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'shape: TTL not compared',
    change: [['found.expireAfterSeconds === spec.expireAfterSeconds &&', 'true &&']],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'shape: partial filter not compared',
    change: [
      ['isDeepStrictEqual(found.partialFilterExpression, spec.partialFilterExpression)', 'true'],
    ],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: '_id_ called extra',
    change: [["if (name !== '_id_' && !wanted", 'if (!wanted']],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'extra indexes not reported',
    change: [['        extra.push(`${collection}.${name}`);\n', '']],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'new collection is an error',
    change: [
      [
        'if (error instanceof MongoServerError && error.code === NAMESPACE_NOT_FOUND) return [];',
        '',
      ],
    ],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'every listing error means a new collection',
    change: [
      [
        'if (error instanceof MongoServerError && error.code === NAMESPACE_NOT_FOUND) return [];',
        'return [];',
      ],
    ],
    survives:
      'listIndexes fails only for a missing collection or a lost connection, and a lost connection fails the createIndex right after',
  },
  {
    file: 'indexes',
    name: 'conflict not named',
    change: [
      [
        'if (error instanceof MongoServerError && CONFLICT_CODES.has(Number(error.code))) {',
        'if (false) {',
      ],
    ],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'every error called a conflict',
    change: [
      [
        'if (error instanceof MongoServerError && CONFLICT_CODES.has(Number(error.code))) {',
        'if (error instanceof MongoServerError) {',
      ],
    ],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'same-keys conflict code dropped',
    change: [
      ['const CONFLICT_CODES = new Set([85, 86]);', 'const CONFLICT_CODES = new Set([86]);'],
    ],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'same-name conflict code dropped',
    change: [
      ['const CONFLICT_CODES = new Set([85, 86]);', 'const CONFLICT_CODES = new Set([85]);'],
    ],
    survives:
      'race guard: a name taken with other keys is found before createIndex; 86 only comes when another instance makes it in between',
  },
  {
    file: 'indexes',
    name: 'options not passed on',
    change: [['{ ...options, name }', '{ name }']],
    tests: 'syncIndexes',
  },
  {
    file: 'indexes',
    name: 'made index not reported',
    change: [['    created.push(`${collection}.${name}`);\n', '']],
    tests: 'syncIndexes',
  },
];

export default mutations;
