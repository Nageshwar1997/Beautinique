# @beautinique/backend-config

Typed config of one service: every key required and in the service's own namespace, read from its own env file or the platform env, refused at boot by key name and never by value.

## Install

```sh
npm install @beautinique/backend-config zod
```

`zod` (version 4) is a peer dependency, because the schemas of the keys are part of your own types.

## Usage

A service tells its keys once, in its own config module, and loads them once at boot. That module is the only place that passes `process.env`.

```ts
import { coerce, enum as enumOf, string } from 'zod';
import { defineConfig, keyModeRule, loadConfig } from '@beautinique/backend-config';

export const paymentsConfig = defineConfig({
  service: 'payments',
  keys: {
    PAYMENTS_PORT: coerce
      .number('PAYMENTS_PORT must be a number.')
      .int('PAYMENTS_PORT must be a whole number.')
      .min(1, 'PAYMENTS_PORT must be at least 1.'),
    PAYMENTS_MODE: enumOf(['test', 'live'], 'PAYMENTS_MODE must be test or live.'),
    PAYMENTS_KEY_ID: string('PAYMENTS_KEY_ID is required.'),
  },
  // While the mode is test, a live key stops the process, and the other way round.
  rules: [
    keyModeRule({
      mode: 'PAYMENTS_MODE',
      key: 'PAYMENTS_KEY_ID',
      prefixes: { test: 'key_test_', live: 'key_live_' },
    }),
  ],
});

const config = loadConfig(paymentsConfig, { env: process.env, directory: import.meta.dirname });
config.PAYMENTS_PORT; // a number
```

Where the values come from, by `NODE_ENV` (no default: a process that does not say where it runs does not start):

- `development` reads `.env.development` and `test` reads `.env.test`, in the folder of the service, and nothing else: not the env of the process. A test run without `.env.test` does not start.
- `production` reads the env of the platform, and never opens a file (`.env.production` lives outside the repository).

## What stops the process

A `ConfigError` lists every problem at once, so one boot shows everything to fix. It names the key and never the value:

| Problem     | Message                                                                      |
| ----------- | ---------------------------------------------------------------------------- |
| missing     | `PAYMENTS_PORT is missing`                                                   |
| empty       | `PAYMENTS_PORT is empty` (also when only spaces)                             |
| invalid     | the message of the schema, like `PAYMENTS_PORT must be a whole number.`      |
| unknown     | `PAYMENTS_PORTT is not a key of the payments config` (a typo, or an old key) |
| a rule      | `PAYMENTS_KEY_ID is not a test key, while PAYMENTS_MODE is test`             |
| no file     | `.env.test is missing in <folder>: npm run setup makes it from .env.example` |
| no NODE_ENV | `NODE_ENV is missing, or is not development, test or production`             |

- Every key is required. A key that is missing or empty is refused before its schema is asked, so a schema's own `.default()` or `.optional()` is never used (D-441). An empty value never becomes `0` through `coerce.number()`.
- A message of a schema should say the key, as above. One that does not has the key put in front of it.
- A value that a schema or a rule quotes in its message (8 characters or more) is taken out of it, as `<value>`.
- In an env file, every key must be one of the service's. In the platform env, which also holds the keys of the other services and of the platform, only the keys in this service's namespace (`PAYMENTS_`) are looked at, so a typo in the namespace is caught and the other keys are left alone (SR-071).

## API

- `defineConfig({ service, keys, rules })`: the config of a service. `service` is in small letters, and every key starts with its namespace (`payments` gives `PAYMENTS_`), in capitals, digits and `_`.
- `loadConfig(definition, { env, directory })`: the typed config for the environment of the process, as above. The types come from the schemas, without a cast.
- `parseConfig(definition, values, scope)`: the check itself, for values you already have. `scope` is `'file'` (every key is this service's) or `'platform'` (only the namespace is looked at).
- `parseEnvFile(text)`: the text of an env file as `{ values, problems }`. Only `KEY=value` lines, comments and empty lines: no `export`, no inline comment, no `${...}`, and a key twice is a problem. A problem names its line number and never repeats the line.
- `environmentOf(env)`: `development`, `test` or `production` from `NODE_ENV`, or `undefined`.
- `keyModeRule({ mode, key, prefixes })`: a rule for a key that carries its mode, like a payment key that is a test key or a live key.
- `envExampleProblems(definition, text)`: what is wrong in the `.env.example` of the service, as lines of text, empty when it is right. It has three parts, `# [DEVELOPMENT]`, `# [TEST]` and `# [PRODUCTION]`, and each must have every key of the config, once, and no key that the config does not have. Use it in a test (RT-57).
- `ConfigError`: has `service` and `problems` (`{ key, kind, message }`).

## Visibility

Public is fine. The package holds no key, no secret and no service's list of keys: those are in the services, and only their names are in their own `.env.example`. How a config is checked helps nobody attack the product. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
