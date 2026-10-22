# @beautinique/backend-server-queue

Beautinique ke har backend deployable ka events wala hissa (ARCHITECTURE §5.2, §6.6): ek shared Redis connection, transactional **outbox** (event usi transaction me likha jaata hai jisme data badla), aur **relay** jo outbox ke events BullMQ queues me bhejta hai. Relay `poll` (Atlas free) ya `changestream` (laptop, paid) mode me chalta hai, aur MongoDB lease lock ke peeche: deploy ke waqt do instance hon to bhi ek hi relay karta hai.

Doosri taraf **consumer** hai: wo apni queue se event leta hai, contract se check karta hai, aur handler ka kaam aur "ye event ho gaya" ka nishaan ek hi transaction me apne DB me likhta hai. Isse dobara aaya event dobara asar nahi karta. Fail hone pe retry hota hai, aur aakhri try ke baad event `platform_dead_letters` me jaata hai.

Abhi part 1 aur 2 bane hain (TASKS T1.3). Job schedulers, `bq:epoch` watchdog aur Redis wipe recovery part 3 me isi package me aayenge.

## Install

```bash
npm install @beautinique/backend-server-queue @beautinique/backend-server-kit @beautinique/backend-server-mongo @beautinique/shared-contracts
```

server-kit, server-mongo aur shared-contracts peer dependencies hain: service aur ye package dono unki ek hi copy dekhen. `bullmq` aur `ioredis` isi package ke saath aate hain.

## Redis: laptop aur production

| Jagah       | Redis                                                        | Limits                                                 |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| Laptop / CI | Docker Valkey (`npm run infra:up`), `redis://localhost:6379` | 25 MB, `noeviction`, 50 connections (production jaisa) |
| Production  | Render Key Value free, sirf internal URL (bahar se band)     | 25 MB, `noeviction`, 50 connections, restart pe khaali |

Code sirf URL leta hai, isliye dono jagah wahi chalta hai. Production Redis laptop ya tests se kabhi nahi judta: tests keys mitate hain aur policy badal ke dekhte hain. Start pe check hota hai ki policy `noeviction` hai (BullMQ ke liye zaroori), aur memory aur connections log hote hain (URL kabhi nahi). Plan ki connection limit `connectionLimit` me do (default 50); uske 80% pe warning.

## Ek service, poori

```ts
import { connectMongo, withTransaction } from '@beautinique/backend-server-mongo';
import {
  connectRedis,
  ensureOutboxIndexes,
  startRelay,
  writeEvent,
} from '@beautinique/backend-server-queue';

const redis = await connectRedis({ url: config.redisUrl, name: 'core', logger });
await ensureOutboxIndexes(mongo);
const relay = startRelay({
  mongo,
  redis: redis.client,
  logger,
  mode: config.outboxRelay, // 'poll' live (Atlas free), 'changestream' laptop
  subscribers: { 'commerce.order.placed': ['notify.emails', 'identity.grants'] },
});

// route ke andar: event usi transaction me jisme order bana
const order = await withTransaction(mongo, async (session) => {
  await mongo.db
    .collection('commerce_orders')
    .insertOne({ _id: id, status: 'placed' }, { session });
  await writeEvent(mongo, session, orderPlaced, {
    aggregate: { type: 'order', id },
    actor: { type: 'user', id: userId },
    correlationId: requestId,
    data: { orderId: id, total },
  });
  return { id };
});

// createApp({ ready: { mongo: mongo.ready, redis: redis.ready, outbox: relay.ready } })
// startServer(app, { onStop: [() => relay.stop(), () => redis.close(), () => mongo.close()] })
```

Consumer (jaise Notify), apne hi DB (`bq_notify`) ke saath:

```ts
import { ensureConsumerIndexes, startConsumer, subscribe } from '@beautinique/backend-server-queue';

await ensureConsumerIndexes(mongo);
const orderEmail = subscribe('notify.emails', orderPlaced, async (event, session) => {
  // sirf DB ka kaam: ye dobara chal sakta hai
  await mongo.db
    .collection('notify_deliveries')
    .insertOne({ _id: event.eventId, orderId: event.data.orderId, status: 'queued' }, { session });
});
const consumer = startConsumer({
  mongo,
  redis: redis.client,
  logger,
  queue: 'q.notify',
  subscriptions: [orderEmail],
});
// createApp({ ready: { ..., events: consumer.ready } }); onStop: [() => consumer.stop(), ...]
```

## API

| Export                                                                                                            | Kaam                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `connectRedis({ url, name, logger, connectTimeoutMs, connectionLimit })`                                          | Deployable ka ek shared command client (`client`), `ready()` (2 s me PING) aur `close()`. Redis gayab ho to command jaldi fail (OTP aur rate limits 503 dein, latkein nahi), aur client khud reconnect karta rehta hai (free Redis restart pe khaali hota hai). Start pe `noeviction` check; Redis na mile to saaf error, URL kabhi nahi                                                                                                                                                                                                                                                                                                                                                                                              |
| `parseRedisInfo(info)` / `assertNoEviction(limits)`                                                               | `INFO` ka jawab padhna / `noeviction` na ho to error                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `writeEvent(mongo, session, definition, input)`                                                                   | Event outbox (`platform_outbox`) me, **`withTransaction` ke andar hi** (bahar error). Envelope contract (`defineEvent`) se check hota hai: galat event request ko fail karta hai, consumer ko baad me nahi. `eventId` (UUIDv7), type, version, producer aur time khud bharta hai; envelope lautata hai                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `ensureOutboxIndexes(mongo)`                                                                                      | `{status, createdAt}` index (relay) aur relayed events 72 ghante baad apne aap delete (Redis wipe redrive 48 ghante peeche jaata hai). Dobara chalana safe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `startRelay({ mongo, redis, logger, mode, subscribers, queueOf, prefix, pollMs, sweepMs, lockTtlMs, batchSize })` | Har pending event ke har subscriber ke liye ek BullMQ job: queue `q.<deployable>` (free plan pe har deployable ki ek queue; `queueOf` se badlo), job ka naam = subscriber, data = poora envelope (consumer sirf apna DB padh sakta hai), `jobId = <eventId>@<subscriber>`. Phir event `relayed`. Events likhe gaye order me jaate hain; Redis gayab ho to wahin rukta hai aur agle round me wapas. `poll`: har `pollMs` (1 s); `changestream`: event aate hi, plus har `sweepMs` (5 s) sweep. Sirf lease wala instance relay karta hai. Lautata hai `{ isLeader, lag, ready, stop }`                                                                                                                                                  |
| `jobIdOf(eventId, subscriber)` / `RELAY_JOB_OPTIONS`                                                              | Job id; job options: 6 attempts, exponential backoff (1 s se), done job turant hatao, failed sirf aakhri 20 (Redis chhota hai)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `tryLease(mongo, name, owner, ttlMs)` / `releaseLease(...)`                                                       | `platform_locks` me lease: ek naam, ek waqt me ek owner. Waqt MongoDB ki ghadi (`$$NOW`) se, isliye instances ki ghadiyon ka farak nahi padta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `OUTBOX`, `LOCKS`, `RELAY_LEASE`, `OUTBOX_KEEP_SECONDS`, `EVENT_MAX_BYTES`                                        | Collection aur lease ke naam, outbox ki umr, event ki max size (16 KB: `writeEvent` isse bade event pe error deta hai, kyunki poora event Redis job me jaata hai)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `subscribe(subscriber, definition, handle)`                                                                       | Ek subscriber (`<deployable>.<module>`) ka ek event type + version ka handler; `handle(event, session)` me event contract ke hisaab se typed. Galat naam pe turant error                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `startConsumer({ mongo, redis, logger, queue, subscriptions, prefix, concurrency })`                              | Queue ka worker (default ek waqt me 1 job: Atlas free me ~100 ops/s sabke liye). Har job: subscription dhoondo, envelope contract se check, phir ek transaction me handler + `platform_processed_events` ka nishaan (`$setOnInsert`); nishaan pehle se ho to skip (dobara aaya event). Fail pe job ki backoff se retry (har fail try ka kaam rollback). Aakhri try ke baad, ya turant jab retry kuch nahi badal sakta (anjaan type/version, toota contract, `ParallelTransactionError`, `TransactionAbortedError`), event `platform_dead_letters` me (error ke saath, 500 characters tak) aur `event dead-lettered` error log. Shared client se apne 2 connection kholta hai (BullMQ ka blocking read). Lautata hai `{ ready, stop }` |
| `ensureConsumerIndexes(mongo)`                                                                                    | Handled nishaan 7 din (har redelivery se lamba), dead letters 14 din, phir apne aap delete                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `PROCESSED_EVENTS`, `DEAD_LETTERS`, `PROCESSED_KEEP_SECONDS`, `DEAD_LETTER_KEEP_SECONDS`                          | Consumer ke collections aur unki umr                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## Niyam

- Event hamesha `writeEvent` se, usi `withTransaction` me jisme data badla. Transaction ke bahar koi event nahi: commit nahi hua to event bhi nahi.
- Delivery **at least once** hai: crash ke baad wahi event dobara (same job id) aa sakta hai. Consumer ka nishaan (`platform_processed_events`) dobara asar rokta hai: asar ek hi baar.
- Job me poora envelope jaata hai (owner ka faisla 2026-10-22): har deployable sirf apna DB padhta hai (ARCHITECTURE §6.1). Isliye event me sirf ids aur chhoti baatein, max 16 KB; details apne DB me.
- Handler me sirf apne DB ka kaam, `session` ke saath, queries ek ke baad ek. Email bhejna ya payment call jaisa bahar ka kaam handler me nahi (wo dobara chal sakta hai); uske liye apna outbox/job.
- Dead letters ko insaan dekhta hai: theek karke dobara bhejna (redrive) part 3 ke tools ke saath.
- Change stream (`.watch(`) sirf is package ke relay me: Atlas free poore cluster me sirf 5 deta hai. ESLint baaki jagah rokta hai.
- Har `startRelay` aur `startConsumer` ka `stop()`, aur `connectRedis` ka `close()`, startServer ke `onStop` me.

## Tests

Tests asli MongoDB replica set aur Valkey pe chalte hain (mock nahi): pehle `npm run infra:up`, ya `MONGO_TEST_URI` aur `REDIS_TEST_URL` do. Har run apna DB aur BullMQ key prefix leta hai aur aakhir me dono mita deta hai. Redis outage ek chhote TCP proxy se banta hai (band = Redis restart, freeze = Redis jawab nahi deta).

```bash
npm run infra:up
npm test --workspace @beautinique/backend-server-queue
```

## License

MIT © Nageshwar Pawar
