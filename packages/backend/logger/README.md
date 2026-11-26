# @beautinique/backend-logger

The shared structured logger: JSON on stdout with a request id, an allowlist error serializer, and redaction of the values of secrets and personal data at any depth. On a laptop, in development, the lines can be pretty.

## Install

```sh
npm install @beautinique/backend-logger
```

It is built on [pino](https://github.com/pinojs/pino), which comes with it. There is no transport: in production, and in CI, the logs are JSON on stdout and nothing else.

For lines that a person reads while developing, a service adds [pino-pretty](https://github.com/pinojs/pino-pretty) to its own **development** dependencies (it is an optional peer of this package, so a production install does not have it), and asks for `pretty`:

```sh
npm install --save-dev pino-pretty
```

```ts
const logger = createLogger({ service: 'identity', level: 'debug', pretty: true });
```

The logger refuses `pretty` unless `NODE_ENV` is `development`, so a production or a CI process cannot have it (SR-098, D-339). The lines are written by a stream in the same process, not by a transport, and the clean-up below is done before it: a pretty line shows no more than a JSON line.

## Usage

```ts
import { createLogger, forRequest } from '@beautinique/backend-logger';

const logger = createLogger({ service: 'identity', level: 'info' });

logger.info({ orderId: 'o1' }, 'order placed');

// One logger per request: every log of it has the request id.
const request = forRequest(logger, requestId);
request.warn({ route: 'POST /api/v1/identity/sessions', status: 429 }, 'rate limited');

try {
  await payFor(order);
} catch (error) {
  request.error({ err: error }, 'payment failed');
}
```

A line looks like this: `{"level":"info","time":"2026-11-26T09:00:00.000Z","service":"identity","requestId":"req_1","orderId":"o1","msg":"order placed"}`.

## What a log never shows (SR-077, SR-098)

Everything that is logged goes through the same clean-up first:

- **Keys.** The value of a key that is a secret or personal data is written as `"[redacted]"`, whatever it was (a text, a number, a whole object), at every depth and in lists, whatever the case or the `-` and `_`. The key stays, so a log still says that it was there: `password` (and any key with it in, like `newPassword` or `passwordHash`), `secret`, a key that ends in `token`, `apikey` or `signature`, `authorization`, `cookie`, `set-cookie`, `code`, `otp`, `deliveryCode`, `recoveryCode`, `pan`, `bankAccount`, `accountNumber`, `email`, `phone`, `mobile` and `address`. `statusCode`, `orderId`, `addressId` and the like stay. A service adds its own, like its secret header, with `secretKeys`.
- **Errors.** An error, under `err` or anywhere else, is written as `type`, `code`, a message of at most 300 characters, and the `stack`. Nothing else of the error object is: not the request config, the headers or the response of a failed call, not the `keyValue` of a database error. A validation error says the names of the fields, never the values, and a duplicate key error says the index, never the value.
- **Text.** In a message, and in the message of an error, emails, phone numbers, PAN, GSTIN, bearer tokens and JWTs are masked as `<email>`, `<phone>`, `<pan>`, `<gstin>` and `<token>`. A log message is cut at 2000 characters: what is long goes in the fields.
- **Bytes** are written as their size (`<binary 12 bytes>`), never as themselves.
- The depth is cut at 8, a list at 100 items, and a loop is written as `<circular>`. The object that was given is never changed.

The logger takes only `service`, `level`, `destination`, `secretKeys` and `pretty`. Any other option, like `transport`, is refused, so a production process cannot have one.

A child logger (`logger.child({ ... })`) cleans its fields the same way.

## API

- `createLogger({ service, level, destination?, secretKeys?, pretty? })`: the logger. `level` has no default: `trace`, `debug`, `info`, `warn`, `error`, `fatal` or `silent`. `destination` is anything with `write(line)`; stdout when it is not given. `pretty` is for development only (above).
- `forRequest(logger, requestId)`: the logger of one request. The id is 1 to 128 printable characters with no space.
- `serializeError(error)`, `redactFields(value, extraKeys?)` (and `REDACTED`, the mask), `maskSensitiveText(text, maxLength)`, `isSensitiveKey(key, extraKeys)`: the parts, for a service that needs one on its own. They are safe to apply twice.

## Visibility

Public is fine. The rules for what a log never shows are general good practice, and showing them helps nobody attack the product. Nothing here is specific to Beautinique. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
