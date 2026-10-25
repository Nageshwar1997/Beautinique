# @beautinique/backend-server-mongo

Beautinique ke har backend deployable ka MongoDB hissa: ek pooled client (majority writes, primary reads, retryable reads/writes), `/ready` ke liye ping, aur `withTransaction()` jo commit ke **baad** hi value lautata hai. Purane code ka bug yahi tha: API commit se pehle jawab de deta tha, aur `Promise.all` wali transaction kabhi kabhi random fail hoti thi. Ye package dono ko rokta hai.

## Install

```bash
npm install @beautinique/backend-server-mongo @beautinique/backend-server-kit
```

`@beautinique/backend-server-kit` peer dependency hai: service aur ye package dono ek hi server-kit dekhen, warna `TransactionTimeoutError` ka 503 (`instanceof AppError`) toot jaata.

MongoDB driver (`mongodb` 7.x) isi package ke saath aata hai aur yahin se export hota hai: services `ObjectId`, `Collection`, `MongoServerError` ... yahin se import karti hain, `mongodb` se seedha nahi. Isse poore repo me driver ka ek hi version rehta hai.

## Ek service, poori

```ts
import { AppError, createApp, createLogger, startServer } from '@beautinique/backend-server-kit';
import { connectMongo, ObjectId, withTransaction } from '@beautinique/backend-server-mongo';

const logger = createLogger({ name: 'core' });
const mongo = await connectMongo({
  uri: config.mongoUri, // CORE__MONGO_URI
  dbName: 'bq_core',
  appName: 'core',
  logger,
});

const app = createApp({
  logger,
  ready: { mongo: mongo.ready },
  routes: (router) => {
    router.post('/v1/orders', async (req, res) => {
      const order = await withTransaction(mongo, async (session) => {
        const id = new ObjectId();
        const orders = mongo.db.collection('orders');
        await orders.insertOne({ _id: id, status: 'placed' }, { session });
        // ek ke baad ek, har query me { session }
        await mongo.db
          .collection('outbox')
          .insertOne({ type: 'commerce.order.placed', id }, { session });
        return { id: id.toHexString() };
      });
      res.status(201).json({ data: order }); // yahan tak aaye to data save ho chuka hai
    });
  },
});

await startServer(app, { port: config.port, logger, onStop: [() => mongo.close()] });
```

## API

| Export                                                                                  | Kaam                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `connectMongo({ uri, dbName, appName, logger, maxPoolSize, serverSelectionTimeoutMS })` | Ek client per deployable. `maxPoolSize` default 5 (Atlas M0 poore cluster ke liye 500 connection deta hai, ARCHITECTURE §6.1). Writes `majority`, reads primary se, `ignoreUndefined` (undefined field save nahi hota, null nahi banta). Start pe `hello` se check: replica set nahi to error. Mongo na mile to saaf error (`npm run infra:up` / Atlas network access), URI kabhi log ya error me nahi                                                                                                                                                                                                                                                                                                                                                                                         |
| `Mongo`                                                                                 | `{ client, db, logger, ready, close, guard }`. `ready()` 2 s me ping ka jawab aaye to `true` (createApp ke `ready` me do). `close()` pool band karta hai (startServer ke `onStop` me do)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `withTransaction(mongo, work, { timeoutMs })`                                           | `work(session)` ko transaction me chalao aur value **commit ke baad** lautao. Reads ek snapshot dekhte hain, writes majority ka intezaar. Transient error (do writer ek document pe, failover) pe chhota ruk ke (10–200 ms, jitter) `work` dobara; commit ka result pata na ho to sirf commit dobara. `timeoutMs` (default 10 s) ke baad `TransactionTimeoutError`. Baaki error waisa hi aage, rollback ke saath. Har attempt ka apna session, jo agle attempt se pehle band hota hai: fail hue attempt ki koi bachi query (bhula `await`, `Promise.all` ki late branch) fail hoti hai, transaction ke bahar ya agle attempt me save nahi hoti. Network error ke baad driver jo session phenk deta hai, uska khula transaction server pe kill hota hai, taaki wo rows ko ek minute tak na roke |
| `ParallelTransactionError`                                                              | Ek transaction ki queries ek saath MongoDB tak pahunchin (`Promise.all`), ya `work` khatam hone pe koi query abhi chal rahi thi ya uske baad shuru hui (bhula `await`; commit tak dekha jaata hai). MongoDB transaction me parallel queries support nahi karta: kabhi chalti hain, kabhi random fail. Transaction abort, kuch save nahi, client ko 500 `INTERNAL` (code ka bug). Runtime check sirf wahi dekhta hai jo saath me wire pe ho (pool busy ho to `Promise.all` bhi ek ke baad ek ja sakti hai); pakka check ESLint hai: `withTransaction(...)` ke andar `Promise.all/allSettled/any/race` mana                                                                                                                                                                                      |
| `TransactionAbortedError`                                                               | `work` ke andar query fail hui, `work` ne error pakad ke aage kaam kiya, par MongoDB transaction pehle hi cancel kar chuka tha: kuch save nahi. 10 s retry aur 503 ki jagah turant ye error (500, code ka bug), `mongoCode` me pehli fail query ka code (11000 = duplicate key). Sirf aisi failure pe jise retry nahi badalta (duplicate key, validation, galat query); pakdi gayi write conflict jaisi transient failure pe retry hi hota hai                                                                                                                                                                                                                                                                                                                                                 |
| `TransactionTimeoutError`                                                               | `AppError` `SERVICE_UNAVAILABLE` (503, "This is busy right now. Please try again in a moment."), `attempts` ke saath. Asli Mongo error `cause` me                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `assertReplicaSet(hello)`                                                               | `hello` command ka jawab replica set (ya mongos) nahi to error. `connectMongo` khud bulata hai                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `mongodb` ke saare exports                                                              | `ObjectId`, `Collection`, `ClientSession`, `MongoServerError` ... driver ka poora API                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Niyam

- Transaction ke andar har query me `{ session }` do, aur queries ek ke baad ek `await` karo. `Promise.all` ESLint rokta hai (andar bulaye helper me ESLint nahi dekhta: wahan bhi mat karo).
- Transaction ke andar query ka error pakad ke aage mat badho: MongoDB transaction cancel kar chuka hota hai (`TransactionAbortedError`). "Naya ho to daalo" (inbox dedupe, idempotency key) ke liye `updateOne({ _id }, { $setOnInsert: {...} }, { upsert: true, session })` aur `upsertedCount` dekho, ya pehle padho.
- Outbox aur audit rows usi transaction me likho jisme data badla (ARCHITECTURE §6.2); jawab sirf `withTransaction` ki lautayi value se do.
- `work` dobara chal sakta hai: andar sirf DB ka kaam rakho. Email bhejna, Cloudinary/Razorpay call, ya bahar ka koi side effect transaction ke andar mat karo (wo outbox se hota hai).
- Har deployable apne `dbName` (bq_identity, bq_payments, bq_notify, bq_core) ke alawa kisi DB ko nahi chhoota.

## Tests

Tests asli MongoDB replica set pe chalte hain (mock nahi): pehle `npm run infra:up`, ya `MONGO_TEST_URI` do. Har run apna `bq_test_<id>` DB banata aur aakhir me mita deta hai.

Commit fail hona, "result pata nahi" aur dheema `/ready` asli Mongo ke `failCommand` fail point se parakhe jaate hain, isliye Mongo ko `enableTestCommands=1` chahiye (`infra` ka Mongo aur CI wala, dono me hai; Atlas me nahi, wahan ye tests nahi chalte). Fail point poore server ka ek hai: ek Mongo pe ek waqt me ek hi test run chalao. `npm run verify` aur `npm run publish` bhi package ke tests chalate hain, isliye unse pehle bhi `npm run infra:up` (CI aur `release.yml` khud Mongo chalate hain).

```bash
npm run infra:up
npm test --workspace @beautinique/backend-server-mongo
```

## License

MIT © Nageshwar Pawar
