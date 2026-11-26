# @beautinique/backend-logger

The shared structured logger: JSON on stdout with a request id, an allowlist error serializer, and redaction of secrets and personal data at any depth.

## Install

```sh
npm install @beautinique/backend-logger
```

It is built on [pino](https://github.com/pinojs/pino), which comes with it. There is no `pino-pretty` here and no transport: in production the logs are JSON on stdout and nothing else. To read them on a laptop, pipe them to the `pino-pretty` command.

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

- **Keys.** A key that is a secret or personal data is taken out, key and value, at every depth and in lists, whatever the case or the `-` and `_`: `password` (and any key with it in, like `newPassword` or `passwordHash`), `secret`, a key that ends in `token`, `apikey` or `signature`, `authorization`, `cookie`, `set-cookie`, `code`, `otp`, `deliveryCode`, `recoveryCode`, `pan`, `bankAccount`, `accountNumber`, `email`, `phone`, `mobile` and `address`. `statusCode`, `orderId`, `addressId` and the like stay. A service adds its own, like its secret header, with `secretKeys`.
- **Errors.** An error, under `err` or anywhere else, is written as `type`, `code`, a message of at most 300 characters, and the `stack`. Nothing else of the error object is: not the request config, the headers or the response of a failed call, not the `keyValue` of a database error. A validation error says the names of the fields, never the values, and a duplicate key error says the index, never the value.
- **Text.** In a message, and in the message of an error, emails, phone numbers, PAN, GSTIN, bearer tokens and JWTs are masked as `<email>`, `<phone>`, `<pan>`, `<gstin>` and `<token>`. A log message is cut at 2000 characters: what is long goes in the fields.
- **Bytes** are written as their size (`<binary 12 bytes>`), never as themselves.
- The depth is cut at 8, a list at 100 items, and a loop is written as `<circular>`. The object that was given is never changed.

The logger takes only `service`, `level`, `destination` and `secretKeys`. Any other option, like `transport` or `pretty`, is refused, so a production process cannot have one.

A child logger (`logger.child({ ... })`) cleans its fields the same way.

## API

- `createLogger({ service, level, destination?, secretKeys? })`: the logger. `level` has no default: `trace`, `debug`, `info`, `warn`, `error`, `fatal` or `silent`. `destination` is anything with `write(line)`; stdout when it is not given.
- `forRequest(logger, requestId)`: the logger of one request. The id is 1 to 128 printable characters with no space.
- `serializeError(error)`, `redactFields(value, extraKeys?)`, `maskSensitiveText(text, maxLength)`, `isSensitiveKey(key, extraKeys)`: the parts, for a service that needs one on its own. They are safe to apply twice.

## Visibility

Public is fine. The rules for what a log never shows are general good practice, and showing them helps nobody attack the product. Nothing here is specific to Beautinique. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
