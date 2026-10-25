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
];

export default mutations;
