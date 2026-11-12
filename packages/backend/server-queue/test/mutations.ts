// Deliberate bugs for `npm run mutate -- --package backend-server-queue` (RULES §6): each one
// must make a test fail, unless `survives` says why it cannot. Keep this list in step with src/:
// the runner refuses a list whose `from` text no longer occurs exactly once.

import type { Mutation } from '../../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  {
    file: 'redis',
    name: 'policy not checked',
    change: [['assertNoEviction(limits);', '']],
  },
  {
    file: 'redis',
    name: 'any policy accepted',
    change: [["if (limits.policy !== 'noeviction') {", 'if (false) {']],
  },
  {
    file: 'redis',
    name: 'connection warning never',
    change: [['if (limits.connectedClients >= connectionLimit * 0.8) {', 'if (false) {']],
  },
  {
    file: 'redis',
    name: 'raw connect error',
    change: [
      [
        'throw new Error(\n      `Redis did not answer',
        'throw error;\n    throw new Error(\n      `Redis did not answer',
      ],
    ],
  },
  {
    file: 'redis',
    name: 'no command timeout (QA-GW-001)',
    change: [['    commandTimeout: commandTimeoutMs,\n', '']],
    tests: 'fails a command',
  },
  {
    file: 'redis',
    name: 'a command waits 5 s on a stalled Redis',
    change: [['  commandTimeoutMs = 1000,', '  commandTimeoutMs = 5000,']],
    tests: 'fails a command',
  },
  {
    file: 'redis',
    name: 'ready always true',
    change: [['return false;\n      } finally', 'return true;\n      } finally']],
  },
  {
    file: 'redis',
    name: 'ready without timeout',
    change: [
      ['Promise.race([client.ping().then(() => true), timeout])', 'client.ping().then(() => true)'],
    ],
  },
  {
    file: 'redis',
    name: 'close twice not guarded',
    change: [['if (closed) return;', '']],
  },
  {
    file: 'redis',
    name: 'errors not logged',
    change: [["client.on('error', (error: Error) => {", "client.on('end', (error: Error) => {"]],
  },
  {
    file: 'outbox',
    name: 'outside a transaction allowed',
    change: [['if (!session.inTransaction()) {', 'if (false) {']],
  },
  {
    file: 'outbox',
    name: 'envelope not checked',
    change: [['definition.envelope.parse({', '(<T>(x: T) => x)({']],
  },
  {
    file: 'outbox',
    name: 'written as relayed',
    change: [["status: 'pending',", "status: 'relayed',"]],
  },
  {
    file: 'outbox',
    name: 'written outside the session',
    change: [['    { session },\n  );\n  return envelope;', '    {},\n  );\n  return envelope;']],
  },
  {
    file: 'outbox',
    name: 'causation left undefined',
    change: [['causationId: input.causationId ?? null,', 'causationId: input.causationId,']],
  },
  {
    file: 'outbox',
    name: 'kept 1 hour',
    change: [['expireAfterSeconds: OUTBOX_KEEP_SECONDS', 'expireAfterSeconds: 3600']],
  },
  {
    file: 'outbox',
    name: 'no pending index',
    change: [
      ["{ collection: OUTBOX, name: 'status_createdAt', key: { status: 1, createdAt: 1 } },", ''],
    ],
  },
  {
    file: 'lock',
    name: 'anyone takes the lease',
    change: [
      [
        "const ours = { $or: [{ $eq: ['$owner', owner] }, { $lt: ['$expiresAt', '$$NOW'] }] };",
        'const ours = true;',
      ],
    ],
  },
  {
    file: 'lock',
    name: 'lease never expires',
    change: [
      [
        "{ $or: [{ $eq: ['$owner', owner] }, { $lt: ['$expiresAt', '$$NOW'] }] }",
        "{ $or: [{ $eq: ['$owner', owner] }] }",
      ],
    ],
  },
  {
    file: 'lock',
    name: 'always holds',
    change: [['return lease?.owner === owner;', 'return true;']],
  },
  {
    file: 'lock',
    name: 'race error thrown',
    change: [['if (error instanceof MongoServerError && error.code === 11000) return false;', '']],
    survives: 'MongoDB retries a colliding upsert on _id itself; the catch is only a fallback',
  },
  {
    file: 'lock',
    name: 'anyone releases',
    change: [['deleteOne({ name, owner })', 'deleteOne({ name })']],
  },
  {
    file: 'relay',
    name: 'subscribers not checked',
    change: [['checkSubscribers(subscribers);', '']],
  },
  {
    file: 'relay',
    name: 'duplicate subscriber allowed',
    change: [['if (new Set(list).size !== list.length) {', 'if (false) {']],
  },
  {
    file: 'relay',
    name: 'queue errors unhandled',
    change: [["  queue.on('error', onError);\n", '']],
    survives: 'equivalent: BullMQ emits only to listeners',
  },
  {
    file: 'relay',
    name: 'newest first',
    change: [['.sort({ createdAt: 1, _id: 1 })', '.sort({ createdAt: -1 })']],
  },
  {
    file: 'relay',
    name: 'relays without the lease',
    change: [['if (!leader || stopped) return 0;', '']],
    survives: 'equivalent: only called when leading',
  },
  {
    file: 'relay',
    name: 'no job options',
    change: [['          ...RELAY_JOB_OPTIONS,\n          jobId', '          jobId']],
  },
  {
    file: 'relay',
    name: 'no job id',
    change: [['          jobId: jobIdOf(record._id.toHexString(), subscriber),\n', '']],
  },
  {
    file: 'relay',
    name: 'not marked relayed',
    change: [
      [
        "{ $set: { status: 'relayed', relayedAt: new Date(), subscribers: targets.length } },",
        '{ $set: { relayedAt: new Date() } },',
      ],
    ],
  },
  {
    file: 'relay',
    name: 'subscriber count wrong',
    change: [['subscribers: targets.length } },', 'subscribers: 1 } },']],
  },
  {
    file: 'relay',
    name: 'one batch per round',
    change: [['(await relayBatch()) === batchSize', '(await relayBatch()) === -1']],
  },
  {
    file: 'relay',
    name: 'go-again flag ignored',
    change: [['while (runAgain() && leader && !isStopped());', 'while (false);']],
  },
  {
    file: 'relay',
    name: 'stream never opened',
    change: [['if (leader && !stream) openStream();', '']],
  },
  {
    file: 'relay',
    name: 'stream sees every change',
    change: [["[{ $match: { operationType: 'insert' } }]", '[]']],
    survives: 'equivalent: extra rounds only',
  },
  {
    file: 'relay',
    name: 'no round when the lease is won',
    change: [['if (leader) void drain();', '']],
  },
  {
    file: 'relay',
    name: 'timers keep the process alive',
    change: [['timer.unref();', '']],
    survives: 'not testable in-process',
  },
  {
    file: 'relay',
    name: 'stop does not wait',
    change: [['await Promise.all(inFlight);', '']],
  },
  {
    file: 'relay',
    name: 'lease kept on stop',
    change: [['await releaseLease(mongo, RELAY_LEASE, owner).catch(() => undefined);', '']],
  },
  {
    file: 'relay',
    name: 'renewal slower than the lease',
    change: [['Math.max(250, Math.floor(lockTtlMs / 3))', 'lockTtlMs * 2']],
  },
  {
    file: 'relay',
    name: 'lag always 0',
    change: [['Math.max(0, Date.now() - oldest.createdAt.getTime())', '0']],
  },
  {
    file: 'relay',
    name: 'always ready',
    change: [['return (await lag()) < LAG_LIMIT_MS;', 'return true;']],
  },
  {
    file: 'relay',
    name: 'default queue is the subscriber',
    change: [["`q.${subscriber.split('.')[0] ?? ''}`", '`q.${subscriber}`']],
  },
  {
    file: 'outbox',
    name: 'size not checked',
    change: [['if (bytes > EVENT_MAX_BYTES) {', 'if (false) {']],
  },
  {
    file: 'relay',
    name: 'job without the envelope',
    change: [
      [
        'add(subscriber, record.envelope, {',
        'add(subscriber, { eventId: record._id, type: record.type }, {',
      ],
    ],
  },
  {
    file: 'consumer',
    name: 'redelivery not skipped',
    change: [['if (mark.upsertedCount === 0) return false;', '']],
  },
  {
    file: 'consumer',
    name: 'handler not called',
    change: [['await subscription.handle(event, session);', '']],
  },
  {
    file: 'consumer',
    name: 'unknown event retried',
    change: [
      [
        'throw new UnrecoverableError(\n        `No handler for',
        'throw new Error(\n        `No handler for',
      ],
    ],
  },
  {
    file: 'consumer',
    name: 'broken contract retried',
    change: [
      [
        'throw new UnrecoverableError(\n        `Event ${String(data.eventId)} breaks',
        'throw new Error(\n        `Event ${String(data.eventId)} breaks',
      ],
    ],
  },
  {
    file: 'consumer',
    name: 'last try not dead-lettered',
    change: [['const last = attempt >= (job.opts.attempts ?? 1);', 'const last = false;']],
  },
  {
    file: 'consumer',
    name: 'every failure dead-lettered',
    change: [['const last = attempt >= (job.opts.attempts ?? 1);', 'const last = true;']],
  },
  {
    file: 'consumer',
    name: 'parallel bug retried',
    change: [['  error instanceof ParallelTransactionError ||\n', '']],
  },
  {
    file: 'consumer',
    name: 'swallowed error retried',
    change: [
      [
        '  error instanceof ParallelTransactionError ||\n  error instanceof TransactionAbortedError;',
        '  error instanceof ParallelTransactionError;',
      ],
    ],
  },
  {
    file: 'consumer',
    name: 'no dead letter written',
    change: [['await deadLetter(job, error, attempt);', '']],
  },
  {
    file: 'consumer',
    name: 'dead letter never inserted',
    change: [['record, { upsert: true });', 'record, { upsert: false });']],
  },
  {
    file: 'consumer',
    name: 'long errors kept whole',
    change: [['message: message.slice(0, 500)', 'message']],
  },
  {
    file: 'consumer',
    name: 'worker keeps retry limit',
    change: [['    maxRetriesPerRequest: null,\n', '']],
    survives: 'equivalent in tests: reconnect only',
  },
  {
    file: 'consumer',
    name: 'handled mark kept 1 minute',
    change: [['expireAfterSeconds: PROCESSED_KEEP_SECONDS', 'expireAfterSeconds: 60']],
  },
  {
    file: 'consumer',
    name: 'dead letters kept 1 minute',
    change: [['expireAfterSeconds: DEAD_LETTER_KEEP_SECONDS', 'expireAfterSeconds: 60']],
  },
  {
    file: 'consumer',
    name: 'duplicate subscription allowed',
    change: [['if (routes.has(key)) throw', 'if (false) throw']],
  },
  {
    file: 'consumer',
    name: 'subscribe does not check the name',
    change: [['assertSubscriber(subscriber, event.type);', '']],
  },
  {
    file: 'consumer',
    name: 'always ready',
    change: [
      [
        'ready: () => Promise.resolve(!stopped && worker.isRunning()),',
        'ready: () => Promise.resolve(true),',
      ],
    ],
  },
  {
    file: 'consumer',
    name: 'stop leaves the worker running',
    change: [['await worker.close();', '']],
  },
  {
    file: 'consumer',
    name: 'five at a time',
    change: [['concurrency = 1,', 'concurrency = 5,']],
    survives: 'policy, not tested',
  },
  {
    file: 'schedules',
    name: 'stale schedulers kept',
    change: [['if (!wanted.has(existing.key)) await open.removeJobScheduler(existing.key);', '']],
  },
  {
    file: 'schedules',
    name: 'patterns in UTC',
    change: [["tz: schedule.tz ?? 'Asia/Kolkata'", "tz: schedule.tz ?? 'UTC'"]],
  },
  {
    file: 'schedules',
    name: 'every and pattern together allowed',
    change: [
      [
        'if ((schedule.every === undefined) === (schedule.pattern === undefined)) {',
        'if (false) {',
      ],
    ],
  },
  {
    file: 'schedules',
    name: 'trigger takes any task name',
    tests: 'triggered',
    change: [['if (!TASK_NAME.test(task)) throw', 'if (false) throw']],
  },
  {
    file: 'schedules',
    name: 'trigger works after close',
    tests: 'triggered',
    change: [['if (closed) throw new Error(', 'if (false) throw new Error(']],
  },
  {
    file: 'schedules',
    name: 'triggered job names no task',
    tests: 'triggered',
    change: [['await open.add(task, { task },', 'await open.add(task, {},']],
  },
  {
    file: 'schedules',
    name: 'task scheduled twice allowed',
    change: [['if (names.has(schedule.task)) throw', 'if (false) throw']],
  },
  {
    file: 'schedules',
    name: 'every 0 allowed',
    change: [['if (schedule.every !== undefined && !(schedule.every > 0)) {', 'if (false) {']],
  },
  {
    file: 'schedules',
    name: 'gap is every, not twice',
    change: [['return schedule.every * 2;', 'return schedule.every;']],
  },
  {
    file: 'schedules',
    name: 'first sighting not kept',
    change: [
      [
        '{ $setOnInsert: { firstSeenAt: new Date() } },\n        { upsert: true },',
        '{ $set: {} },\n        { upsert: false },',
      ],
    ],
  },
  {
    file: 'schedules',
    name: 'gap ignored',
    change: [['if (!since || now.getTime() - since.getTime() > gapOf(schedule))', 'if (!since)']],
  },
  {
    file: 'schedules',
    name: 'heartbeat silent',
    change: [['if (late.length > 0) logger.error(', 'if (false) logger.error(']],
  },
  {
    file: 'schedules',
    name: 'heartbeat reports itself',
    change: [['schedules.filter((schedule) => schedule.task !== name),', 'schedules,']],
  },
  {
    file: 'consumer',
    name: 'tasks handled as events',
    change: [["if (typeof task === 'string') {", 'if (false) {']],
  },
  {
    file: 'consumer',
    name: 'task twice allowed',
    change: [['if (taskByName.has(task.name)) throw', 'if (false) throw']],
  },
  {
    file: 'consumer',
    name: 'finished run not recorded',
    change: [
      [
        '{ $set: { lastFinishedAt: new Date(), lastError: null } },',
        '{ $set: { lastError: null } },',
      ],
    ],
  },
  {
    file: 'consumer',
    name: 'failed run not recorded',
    change: [
      [
        '{ $set: { lastFailedAt: new Date(), lastError: describe(error) } },',
        '{ $set: { lastFailedAt: new Date() } },',
      ],
    ],
  },
  {
    file: 'recovery',
    name: 'empty Redis gets no epoch',
    change: [["await redis.set(epochKey, uuidv7(), 'NX');", '']],
  },
  {
    file: 'recovery',
    name: 'epoch overwritten',
    change: [
      ["await redis.set(epochKey, uuidv7(), 'NX');", 'await redis.set(epochKey, uuidv7());'],
    ],
    survives: 'race guard, not tested',
  },
  {
    file: 'recovery',
    name: 'recovers on every look',
    change: [['if (known?.value === epoch) return false;', '']],
    survives:
      'equivalent: the look after the lease does the same check; this one only saves a lease round trip',
  },
  {
    file: 'recovery',
    name: 'no lease',
    change: [['if (!(await tryLease(mongo, RECOVERY_LEASE, owner, lockTtlMs))) return false;', '']],
  },
  {
    file: 'recovery',
    name: 'no second look after the lease',
    change: [
      ['if ((await state.findOne({ key: EPOCH_STATE }))?.value === epoch) return false;', ''],
    ],
    survives: 'race guard',
  },
  {
    file: 'recovery',
    name: 'epoch not remembered',
    change: [
      [
        '{ $set: { value: epoch, recoveredAt: new Date() } },',
        '{ $set: { recoveredAt: new Date() } },',
      ],
    ],
  },
  {
    file: 'recovery',
    name: 'lease kept after recovery',
    change: [['await releaseLease(mongo, RECOVERY_LEASE, owner).catch(() => undefined);', '']],
  },
  {
    file: 'recovery',
    name: 'looks overlap',
    change: [['while (running) await running;', '']],
  },
  {
    file: 'recovery',
    name: 'timer keeps the process alive',
    change: [['timer.unref();', '']],
    survives: 'not testable in-process',
  },
  {
    file: 'recovery',
    name: 'redrive goes back 100 days',
    change: [['sinceMs = 48 * 60 * 60 * 1000,', 'sinceMs = 100 * 24 * 60 * 60 * 1000,']],
  },
  {
    file: 'recovery',
    name: 'redrive takes pending events too',
    change: [["          status: 'relayed',\n", '']],
    survives: 'equivalent: same job ids',
  },
  {
    file: 'recovery',
    name: 'redrive under new job ids',
    change: [['            jobId: jobIdOf(record._id.toHexString(), subscriber),\n', '']],
  },
  {
    file: 'recovery',
    name: 'redrive reads the first batch again and again',
    change: [['...(after === undefined ? {} : { _id: { $gt: after } }),', '...{},']],
  },
  {
    file: 'recovery',
    name: 'no wait for queues to drain',
    change: [['await untilDrained([...queues.values()], maxWaiting, drainTimeoutMs);', '']],
  },
  {
    file: 'recovery',
    name: 'drain threshold one higher',
    change: [['(counts[i] ?? 0) >= maxWaiting', '(counts[i] ?? 0) > maxWaiting']],
  },
  {
    file: 'dead-letters',
    name: 'old failed job not removed',
    change: [['await queue.remove(letter.jobId);', '']],
  },
  {
    file: 'dead-letters',
    name: 'dead letter kept after redrive',
    change: [['await deadLetters.deleteOne({ _id: letter._id });', '']],
  },
  {
    file: 'dead-letters',
    name: 'running job redriven anyway',
    change: [['if (await queue.getJob(letter.jobId)) {', 'if (false) {']],
  },
  {
    file: 'dead-letters',
    name: 'ids ignored',
    change: [['ids === undefined ? {} : { jobId: { $in: [...ids] } }', '{}']],
  },
  // every document's _id an ObjectId, names in unique fields (owner, 2026-11-12)
  {
    file: 'outbox',
    name: 'the outbox keeps the event id as a string',
    change: [['      _id: eventId,\n', '      _id: eventId.toHexString() as never,\n']],
    tests: 'writes a checked envelope',
  },
  {
    file: 'consumer',
    name: 'the mark keeps the event id as a string',
    change: [
      [
        '{ eventId: new ObjectId(event.eventId), subscriber: job.name }',
        '{ eventId: event.eventId as never, subscriber: job.name }',
      ],
    ],
    tests: 'marks it handled in the same transaction',
  },
  {
    file: 'consumer',
    name: 'one mark per event for every subscriber',
    change: [
      [
        '{ eventId: new ObjectId(event.eventId), subscriber: job.name }',
        '{ eventId: new ObjectId(event.eventId) }',
      ],
    ],
    tests: 'startConsumer',
  },
  {
    file: 'consumer',
    name: 'marks of one event and subscriber may repeat',
    change: [
      [
        '    key: { eventId: 1, subscriber: 1 },\n    unique: true,\n',
        '    key: { eventId: 1, subscriber: 1 },\n',
      ],
    ],
    tests: 'keeps handled marks',
  },
  {
    file: 'consumer',
    name: 'a dead letter keeps the event id as a string',
    change: [['eventId: parseObjectId(data.eventId) ?? null,', 'eventId: data.eventId as never,']],
    tests: 'dead-letters',
  },
  {
    file: 'consumer',
    name: 'a dead letter of a job is saved twice',
    survives:
      'a job dead-letters twice only after a crash between saving it and failing the job; the unique jobId index keeps one',
    change: [
      [
        'await deadLetters.replaceOne({ jobId: record.jobId }, record, { upsert: true });',
        'await deadLetters.insertOne({ ...record });',
      ],
    ],
    tests: 'dead letter',
  },
  {
    file: 'lock',
    name: 'the lease name is not unique',
    change: [
      [
        "{ collection: LOCKS, name: 'name_unique', key: { name: 1 }, unique: true },",
        "{ collection: LOCKS, name: 'name_unique', key: { name: 1 } },",
      ],
    ],
    tests: 'tryLease',
  },
  {
    file: 'lock',
    name: 'the lease makes no index of its own',
    change: [['  await ensureLockIndex(mongo);\n', '']],
    tests: 'tryLease',
  },
  {
    file: 'schedules',
    name: 'a task run is found by another task',
    change: [
      [
        '    const run = await runs.findOne({ task: schedule.task });',
        '    const run = await runs.findOne({});',
      ],
    ],
    tests: 'late',
  },
];

export default mutations;
