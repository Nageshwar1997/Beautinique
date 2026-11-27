# @beautinique/backend-events

The events and timed work of a service: the outbox, the inbox, the dispatcher, timers, the ticker and the job queues.

## Install

```sh
npm install @beautinique/backend-events @beautinique/backend-logger @beautinique/backend-mongo @beautinique/backend-server-kit @beautinique/shared-clock @beautinique/shared-contracts bullmq ioredis mongodb zod
```

## Usage

```ts
import {
  createDispatcher,
  createInbox,
  createOutbox,
  createTicker,
  eventsCollections,
  inProcessDelivery,
  onEvent,
  onTimer,
  scheduleTimer,
} from '@beautinique/backend-events';
import { defineCollections, leasesCollection, withTransaction } from '@beautinique/backend-mongo';

// The producer: the change and its event in one transaction, then a nudge after the commit.
const outbox = createOutbox({
  service: 'commerce',
  subscriptions: { 'commerce.order.placed': ['payments', 'notify'] },
  clock,
});
await withTransaction(
  client,
  async (session) => {
    await placeOrder(db, session, order);
    await outbox.append(db, session, orderPlaced, {
      aggregate: { type: 'order', id: order.id, version: 1 },
      actor: { type: 'account', id: accountId },
      correlationId: requestId,
      causationId: requestId,
      data: { orderId: order.id },
    });
    await scheduleTimer(
      db,
      { kind: 'commerce.reservation.expire', ref: order.id, dueAt: in15Minutes },
      { session },
    );
  },
  { clock },
);
dispatcher.nudge();

// The subscriber: its effect and its `processed_events` record in one transaction.
const paymentsInbox = createInbox({
  subscriber: 'payments',
  client: paymentsClient,
  db: paymentsDb,
  clock,
  logger,
  alert,
  handlers: [
    onEvent(orderPlaced, (event, { db, session }) => openPayment(db, session, event.data)),
  ],
});

// A bundle: the dispatcher calls the inbox in the process (a split uses signedHttpDelivery).
const dispatcher = createDispatcher({
  db,
  clock,
  owner: instanceId,
  subscriptions: outbox.subscriptions,
  transport: inProcessDelivery([paymentsInbox, notifyInbox]),
  logger,
});
dispatcher.start();

const ticker = createTicker({
  client,
  db,
  clock,
  owner: instanceId,
  service: 'commerce',
  handlers: [onTimer('commerce.reservation.expire', expireReservation)],
  queues: commerceJobs,
  logger,
  alert,
});
ticker.start();

// The release step makes the platform collections with the service's own.
const collections = defineCollections('commerce', [
  ...eventsCollections,
  leasesCollection,
  ...ownCollections,
]);
```

## API

### Outbox (the producer)

- `createOutbox({ service, subscriptions, clock })`: `append(db, session, contract, event)` writes an event in the transaction of its change (docs/ARCHITECTURE.md §3 rule 1): outside a transaction it is refused, and so is an event of another producer, one that does not match its contract (the message names the fields, never the values) or one bigger than 16 KB. It fills in `eventId` (an ObjectId as 24 hex), `type`, `version`, `occurredAt` (the injected clock) and `producer`, and writes one pending delivery for each subscriber of the type. The envelope is kept as JSON text, what each subscriber gets byte for byte. The subscriptions are checked at boot: each type of the service, each subscriber `<service>` or `<service>.<name>`, none twice.
- `retryDeadDelivery(db, { eventId, subscriber, now })`: tries a dead delivery again (from the Master app, with its permission): pending at once with its count from 0, and the later events of its aggregate that it held up for that subscriber are due at once too.
- `outboxCollection`: `outbox` (class `tech`): an event and the delivery of each subscriber (`status`, `attempts`, `nextAttemptAt`), `pendingCount`, the soonest `nextAttemptAt`, and `doneAt`, which the TTL index takes 7 days after (`OUTBOX_DONE_TTL_SECONDS`).

### Dispatcher

- `createDispatcher({ db, clock, owner, subscriptions, transport, logger, pollMs?, batchSize? })` (§3 rules 2 to 6, §10.2 rules 10 and 11): behind the `dispatcher` lease (`DISPATCHER_LEASE_MS` 30 seconds, renewed in a long pass; a pass that lost it stops), each pass takes up to `DISPATCH_BATCH_SIZE` (100) events with a due pending delivery, the soonest first, and gives each to its subscriber, the events of one aggregate in order (its version, then the order of the writes). A subscriber that fails holds up only its own later events of that aggregate; other aggregates and other subscribers go on. A failure is tried again after `RETRY_DELAYS_MS` (1, 5, 15, 30, 60, 90 and 150 minutes: 8 tries, `MAX_ATTEMPTS`, in about 6 hours), and then the delivery is dead. A subscriber that is down (its database, its process) is tried again after `UNAVAILABLE_RETRY_MS` (1 minute) and the count does not go up. A delivery held up by a dead one is looked at again every `BLOCKED_RECHECK_MS` (1 hour) until that one is dealt with. Every write of a try is on the state it read, so two instances in a lease's handover never write over each other (the inbox takes a repeat once).
- `pass()` (one pass), `nudge()` (a pass soon, after a commit, §3 rule 3), `start()` (a pass at once, then on each nudge and every `DISPATCH_POLL_MS`, 5 seconds) and `stop()` (waits for its pass and gives the lease up). Boot fails when a subscriber of the subscriptions has no way in through the transport.

### Delivery

- `inProcessDelivery(inboxes)`: a bundle: the subscriber's inbox, called in the process.
- `signedHttpDelivery({ baseUrls, key, clock, logger, send?, nonce? })`: a split: a call signed like the server kit's facade (SR-071) to `POST /internal/events/<subscriber>` (`inboxPath`), with `DELIVERY_TIMEOUT_MS` (15 seconds). No answer or a 5xx is `unavailable`; a 4xx or an answer it cannot read is `failed`.
- `createInboxEndpoint(inbox, { verifier, logger })`: the HTTP side, in the subscriber's service: the signature first (401 and no reason), then the body (`{ payload, attempt, maxAttempts }` and nothing else), then the inbox. Give it the body as text: the signature is over its exact bytes.

### Inbox (the subscriber)

- `createInbox({ subscriber, client, db, clock, handlers, logger, alert })` with `onEvent(contract, handle)` for each event and version it takes (§3 rule 9: a subscriber that takes two versions has two handlers): `receive(request)` checks the envelope with the event's contract, and runs the handler and writes the `processed_events` record (`<eventId>:<subscriber>`) in one transaction, so however often an event comes, even at once, the effect is once (§3 rule 4). It answers `delivered`, `failed` (the handler's own error, or an event no handler takes), `unavailable` (its database out of reach: not counted, §10.2 rule 11) or, on the last try, `dead`: a dead letter in its own database and an ops alert (`alert`, severity 2). A dead letter that is taken later (tried again) is dealt with in that transaction.
- `processedEventsCollection` (`processed_events`, TTL 14 days, `PROCESSED_EVENTS_TTL_SECONDS`: longer than the outbox's 7 days and the longest retry, §10.2 rule 12) and `deadLettersCollection` (`dead_letters`, TTL 90 days after `resolvedAt`, `DEAD_LETTER_TTL_SECONDS`).

### Timers and the ticker

- `scheduleTimer(db, { kind, ref, dueAt }, { session? })` and `cancelTimer(db, { kind, ref }, { session? })`: a timer in `timers` (§4 rule 1), set in the transaction of the change that needs it. One pending timer of a kind for one ref: set again it moves, with its count from 0.
- `onTimer(kind, run)`: work that runs in the transaction that marks the timer done, so its effect is once however many instances tick. `dailyJob({ kind, at, run })`: a daily job (§4 rule 6), a chain of timers, one for each IST day: the work of a day runs after `at` on the next IST day, and as it is marked done the next day's timer is set. A new job begins with the last whole day; after a long sleep every missed day is built, in order. Its work runs outside a transaction (it may be big) and is safe to run again; a claim (`TIMER_CLAIM_MS`) keeps two instances from running it at once.
- `createTicker({ client, db, clock, owner, service, handlers, queues?, logger, alert, tickMs?, bootDelayMs? })` (§4 rules 1, 2, 4 and 6): behind the `ticker` lease (`TICKER_LEASE_MS` 2 minutes), each tick runs every due timer once, the soonest first, until none is due (in batches of `TIMER_BATCH_SIZE`, for at most `TICK_BUDGET_MS`); a server that slept catches up, late but never lost. A failed timer is tried again like a delivery and, after `MAX_ATTEMPTS`, fails for good with an alert; a database out of reach does not count. Then it puts back on the queues the work that is pending in the database. `start()` ticks first after `BOOT_SWEEP_DELAY_MS` (30 seconds: the boot sweep) and then every `TICK_MS` (60 seconds).
- `timersCollection`: `timers` (class `tech`, TTL 7 days after done, `TIMER_DONE_TTL_SECONDS`).

### Job queues

- `createJobQueues({ connection, prefix, logger, alert })` (§4 rules 2 and 3): BullMQ only runs the work; the record of the work is in the database. `service(service, { db, kinds })` gives a service its jobs: `enqueue(kind, recordId)` (after the commit; once only while the job is there) and `requeuePending()` (the ticker's: the records whose work is pending, put back when Valkey has lost them, R-010). Each service has a light queue (`LIGHT_CONCURRENCY` 2) and the process one `heavy` queue (`HEAVY_QUEUE`, `HEAVY_CONCURRENCY` 1, R-007). A job holds only its record's id; its id is `<kind>.<recordId>` (`jobIdOf`), so one record is one job. A job is tried `JOB_ATTEMPTS` (5) times, waiting `JOB_BACKOFF_MS` (30 seconds) and twice as long each time, then fails for good with an alert.
- `defineJob({ name, queue, pending, run })`: `run` reads the record's state first and does nothing when it is done, and marks it done as it ends, so a job that comes twice works once.
- `createQueueConnection(url, name)`: the one Valkey connection the queues of a process share (`maxRetriesPerRequest: null`, as BullMQ needs); each worker adds one for waiting, so every service of a bundle is 14 connections, within the 20 of §4 rule 3. The rate limit counter has its own connection, which fails at once when Valkey is down.

### Collections

- `eventsCollections`: `outbox`, `processed_events`, `dead_letters` and `timers`, for a service's `defineCollections` with `leasesCollection` of `@beautinique/backend-mongo`.

## Visibility

Public is fine. The outbox, the inbox, ordered delivery per aggregate, retries with backoff, dead letters, timers behind a lease and job queues are the general ways of building reliable services that books and talks describe to everybody. It holds no service's events, no subscription, no key and no address; those are in each service's own package and config. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
