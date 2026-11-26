import { createRequire } from 'node:module';
import { Writable } from 'node:stream';

import { pino } from 'pino';
import type { PrettyOptions } from 'pino-pretty';

import { maskSensitiveText } from './mask-text.ts';
import { normalizedKeys, redactFields } from './redact.ts';
import { serializeError } from './serialize-error.ts';

export const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

/** A log call: a message, or the fields of the log and then a message. */
export interface LogFn {
  (message: string): void;
  (fields: Record<string, unknown>, message?: string): void;
}

/** What a service logs with. It has no way to add a transport or to change how a log is written. */
export interface Logger {
  trace: LogFn;
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  fatal: LogFn;
  /** A logger whose every log has these fields too, with the secrets of them taken out like any other. */
  child(fields: Record<string, unknown>): Logger;
}

export interface LoggerOptions {
  /** The service that writes the logs, in small letters: `identity`. It is in every log. */
  service: string;
  /** No default: a service says how much it logs. */
  level: LogLevel;
  /** Where the lines go. Stdout when it is not given. */
  destination?: { write(line: string): void };
  /** Names of keys, besides the ones every log keeps the value of out, that this service never logs: its own secret headers. */
  secretKeys?: readonly string[];
  /**
   * Lines that a person reads, with colours and the time of the laptop, in place of JSON (D-339):
   * for development only. It needs `pino-pretty` in the service's own development dependencies,
   * and is refused unless `NODE_ENV` is `development`, so a production or a CI process cannot have
   * it (SR-098). It is a stream in this process, not a transport, and the clean-up of what is
   * logged is done before it, so a pretty line shows no more than a JSON line.
   */
  pretty?: boolean;
}

/** The most of a log message that is kept. Messages are short; what is long goes in the fields. */
export const LOG_MESSAGE_MAX = 2000;

const OPTION_NAMES: ReadonlySet<string> = new Set([
  'service',
  'level',
  'destination',
  'secretKeys',
  'pretty',
]);
const SERVICE_FORMAT = /^[a-z][a-z0-9-]*$/;
const REQUEST_ID_FORMAT = /^[\x21-\x7E]{1,128}$/;

function checkOptions(options: LoggerOptions): void {
  // A `transport`, a `prettyPrint` or any other option of pino is not an option here: in production
  // the logs are JSON on stdout and nothing else (docs/security/SECURITY_REQUIREMENTS.md SR-098).
  const unknown = Object.keys(options).filter((name) => !OPTION_NAMES.has(name));
  if (unknown.length > 0) {
    throw new RangeError(`The logger has no option ${unknown.join(', ')}.`);
  }
  if (!SERVICE_FORMAT.test(options.service)) {
    throw new RangeError(`The service ${options.service} is in small letters, digits and -.`);
  }
  if (!LOG_LEVELS.includes(options.level)) {
    throw new RangeError(`The level ${options.level} is not one of ${LOG_LEVELS.join(', ')}.`);
  }
}

// `pino-pretty` is the service's own development dependency (an optional peer of this package), so
// it is looked for only when `pretty` is asked, and a production install need not have it.
const require = createRequire(import.meta.url);

function prettyStream(destination: LoggerOptions['destination']): { write(line: string): void } {
  if (process.env['NODE_ENV'] !== 'development') {
    throw new RangeError(
      'The logger writes pretty lines only when NODE_ENV is development; otherwise it writes JSON on stdout (SR-098).',
    );
  }
  let build: (options: PrettyOptions) => { write(line: string): void };
  try {
    build = require('pino-pretty') as typeof build;
  } catch {
    throw new RangeError(
      'The logger needs pino-pretty for pretty lines: add it to the development dependencies of the service.',
    );
  }
  // pino-pretty writes to a stream of Node; a destination that only has `write` is put in one.
  const sink =
    destination === undefined
      ? undefined
      : new Writable({
          write(chunk: Buffer | string, _encoding, done) {
            destination.write(chunk.toString());
            done();
          },
        });
  return build({
    colorize: true,
    ignore: 'pid,hostname',
    translateTime: 'SYS:HH:MM:ss.l',
    sync: true,
    ...(sink === undefined ? {} : { destination: sink }),
  });
}

type Method = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

function wrap(instance: pino.Logger, secrets: ReadonlySet<string>): Logger {
  const method =
    (level: Method): LogFn =>
    (first: string | Record<string, unknown>, message?: string) => {
      if (typeof first === 'string') instance[level](first);
      else instance[level](first, message);
    };
  return Object.freeze({
    trace: method('trace'),
    debug: method('debug'),
    info: method('info'),
    warn: method('warn'),
    error: method('error'),
    fatal: method('fatal'),
    // The fields of a child are written by pino once, when the child is made, and not through the
    // `formatters.log` of every log: they are cleaned here.
    child: (fields: Record<string, unknown>) =>
      wrap(instance.child(redactFields(fields, secrets) as Record<string, unknown>), secrets),
  });
}

/**
 * The logger of a service: one JSON line per log on stdout, with the service, the level as a word
 * and the time in UTC (docs/ARCHITECTURE.md §8, D-297); with `pretty`, in development only, lines
 * for a person to read. Whatever is logged goes through the same clean-up first (docs/RULES.md
 * CR-22, SR-077, SR-098): the value of every key of a secret or personal data is written as
 * `[redacted]` at every depth, the key staying, an error is written as its type, code, short message and stack, and a
 * message has its emails, tokens, PAN, GSTIN and phone numbers masked.
 */
export function createLogger(options: LoggerOptions): Logger {
  checkOptions(options);
  const secrets = normalizedKeys(options.secretKeys ?? []);
  const instance = pino(
    {
      level: options.level,
      base: { service: options.service },
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => ({ level: label }),
        log: (fields) => redactFields(fields, secrets) as Record<string, unknown>,
      },
      serializers: { err: serializeError },
      hooks: {
        logMethod(args, logMethod) {
          const masked = args.map((arg) =>
            typeof arg === 'string' ? maskSensitiveText(arg, LOG_MESSAGE_MAX) : arg,
          ) as typeof args;
          logMethod.apply(this, masked);
        },
      },
    },
    options.pretty === true ? prettyStream(options.destination) : options.destination,
  );
  return wrap(instance, secrets);
}

/**
 * The logger of one request: every log of it has the request id (docs/security/
 * SECURITY_REQUIREMENTS.md SR-077). The id is printable characters with no space, at most 128, so
 * it cannot be used to write a line of its own into a log.
 */
export function forRequest(logger: Logger, requestId: string): Logger {
  if (!REQUEST_ID_FORMAT.test(requestId)) {
    throw new RangeError('A request id is 1 to 128 printable characters with no space.');
  }
  return logger.child({ requestId });
}
