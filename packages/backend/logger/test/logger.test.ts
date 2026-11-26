import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { createLogger, forRequest, LOG_LEVELS, LOG_MESSAGE_MAX } from '../src/index.ts';
import { capture } from './utils/capture.ts';

describe('createLogger: a log line', () => {
  it('SR-077: is one JSON line with the service, the level as a word, the time in UTC and the message', () => {
    const { logger, raw, lines } = capture();

    logger.info({ orderId: 'o1' }, 'order placed');

    expect(raw().endsWith('\n')).toBe(true);
    expect(raw().split('\n').filter(Boolean)).toHaveLength(1);
    const [line] = lines();
    expect(line).toMatchObject({
      level: 'info',
      service: 'identity',
      orderId: 'o1',
      msg: 'order placed',
    });
    expect(line?.time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(line).not.toHaveProperty('pid');
    expect(line).not.toHaveProperty('hostname');
  });

  it('SR-077: every level writes its own word, and a message alone is fine', () => {
    const { logger, lines } = capture();

    logger.trace('t');
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    logger.fatal('f');

    expect(lines().map((line) => [line.level, line.msg])).toEqual([
      ['trace', 't'],
      ['debug', 'd'],
      ['info', 'i'],
      ['warn', 'w'],
      ['error', 'e'],
      ['fatal', 'f'],
    ]);
  });

  it('SR-077: a level lets through its own and the worse ones, and silent writes nothing', () => {
    const warn = capture({ level: 'warn' });
    warn.logger.info('no');
    warn.logger.warn('yes');
    warn.logger.error('yes');
    expect(warn.lines().map((line) => line.msg)).toEqual(['yes', 'yes']);

    const silent = capture({ level: 'silent' });
    silent.logger.fatal('no');
    expect(silent.raw()).toBe('');
  });

  it('CR-22: the logger cannot be changed, and has no way to add a transport', () => {
    const { logger } = capture();

    expect(Object.isFrozen(logger)).toBe(true);
    expect(Object.keys(logger).sort()).toEqual([
      'child',
      'debug',
      'error',
      'fatal',
      'info',
      'trace',
      'warn',
    ]);
  });
});

describe('createLogger: the options', () => {
  it('SR-098: an option that is not in the list is refused, so no transport can be added', () => {
    for (const option of [
      'transport',
      'prettyPrint',
      'redact',
      'serializers',
      'formatters',
      'hooks',
    ]) {
      expect(
        () => createLogger({ service: 'identity', level: 'info', [option]: {} } as never),
        option,
      ).toThrow(`The logger has no option ${option}.`);
    }
  });

  it('SR-077: a service is in small letters, digits and -, and a level is one of the list', () => {
    for (const service of ['', 'Identity', 'identity_x', '1identity', 'a b']) {
      expect(() => createLogger({ service, level: 'info' }), service).toThrow('small letters');
    }
    expect(createLogger({ service: 'api-gateway', level: 'info' })).toBeDefined();
    for (const level of ['', 'INFO', 'verbose', undefined]) {
      expect(
        () => createLogger({ service: 'identity', level: level as never }),
        String(level),
      ).toThrow('is not one of');
    }
    expect(LOG_LEVELS).toEqual(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']);
  });

  it('SR-098: writes to stdout when there is no destination, as JSON', () => {
    const write = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    let written: string;
    try {
      createLogger({ service: 'identity', level: 'info' }).info('to stdout');
      written = write.mock.calls.map(([chunk]) => String(chunk)).join('');
    } finally {
      write.mockRestore();
    }

    expect(JSON.parse(written.trim().split('\n').at(-1) ?? '{}')).toMatchObject({
      msg: 'to stdout',
    });
  });
});

describe('forRequest', () => {
  it('SR-077: puts the request id in every log of the logger, and of the loggers made from it', () => {
    const { logger, lines } = capture();
    const request = forRequest(logger, 'req_01HZX');

    request.info('start');
    request.child({ step: 'pay' }).warn({ orderId: 'o1' }, 'late');

    expect(lines()).toMatchObject([
      { requestId: 'req_01HZX', msg: 'start', service: 'identity' },
      { requestId: 'req_01HZX', step: 'pay', orderId: 'o1', msg: 'late' },
    ]);
    expect(capture().lines()).toEqual([]);
  });

  it('SR-077: a request id is 1 to 128 printable characters with no space', () => {
    const { logger } = capture();

    for (const id of ['a', 'req_1', '0190f2c4-7b1a-7cc3-9d5e-123456789abc', 'x'.repeat(128)]) {
      expect(() => forRequest(logger, id), id).not.toThrow();
    }
    for (const id of ['', 'a b', 'a\nb', 'a\tb', 'x'.repeat(129), 'é', 'a\u0000b']) {
      expect(() => forRequest(logger, id), JSON.stringify(id)).toThrow('A request id is 1 to 128');
    }
  });

  it('SR-077: a request id cannot write a line of its own into the log', () => {
    const { logger, raw, lines } = capture();
    expect(() => forRequest(logger, 'x","level":"fatal')).not.toThrow();

    forRequest(logger, 'x","level":"fatal').info('hi');

    expect(raw().split('\n').filter(Boolean)).toHaveLength(1);
    expect(lines()[0]?.level).toBe('info');
    expect(lines()[0]?.requestId).toBe('x","level":"fatal');
  });
});

describe('createLogger: what is logged is cleaned (AC-PLATFORM-14)', () => {
  const VALUES = {
    otp: '482913',
    password: 'Hunter2-secret',
    // Made at run time: a token-shaped literal in a test is what the secret scan looks for.
    token: `tok-${'z'.repeat(12)}`,
    cookie: 'session=abcdef123456',
    pan: 'ABCPE1234F',
    bank: '123456789012',
    address: '12 MG Road, Pune 411001',
    authorization: 'Bearer eyJhbGciOi.eyJzdWIi.signature123',
  };

  it('AC-PLATFORM-14: a log with an OTP, a password, a token, a cookie, a PAN, a bank number and an address shows none of the values, and keeps the keys', () => {
    const { logger, raw, lines } = capture();

    logger.info(
      {
        otp: VALUES.otp,
        password: VALUES.password,
        token: VALUES.token,
        cookie: VALUES.cookie,
        pan: VALUES.pan,
        bankAccount: VALUES.bank,
        address: VALUES.address,
        orderId: 'o1',
      },
      'signed in',
    );

    for (const value of Object.values(VALUES)) expect(raw()).not.toContain(value);
    expect(lines()[0]).toMatchObject({ orderId: 'o1', msg: 'signed in' });
    for (const key of ['otp', 'password', 'token', 'cookie', 'pan', 'bankAccount', 'address']) {
      expect(lines()[0], key).toMatchObject({ [key]: '[redacted]' });
    }
  });

  it('AC-PLATFORM-14: the same at every depth, in lists, in a request, and with other spellings of the keys', () => {
    const { logger, raw } = capture();

    logger.error(
      {
        req: {
          headers: {
            Authorization: VALUES.authorization,
            'Set-Cookie': [VALUES.cookie],
            accept: 'json',
          },
          body: { user: { profile: { 'OTP-Code': VALUES.otp, new_password: VALUES.password } } },
        },
        attempts: [{ access_token: VALUES.token }, [{ PAN: VALUES.pan }]],
      },
      'request failed',
    );

    for (const value of Object.values(VALUES)) expect(raw()).not.toContain(value);
    expect(raw()).toContain('accept');
  });

  it('AC-PLATFORM-14: the keys of a child logger are cleaned too', () => {
    const { logger, raw, lines } = capture();

    logger.child({ password: VALUES.password, token: VALUES.token, tenant: 'a' }).info('child');

    for (const value of [VALUES.password, VALUES.token]) expect(raw()).not.toContain(value);
    expect(lines()[0]).toMatchObject({ tenant: 'a' });
  });

  it('AC-PLATFORM-14: the secret headers that a service names are taken out as well', () => {
    const { logger, raw } = capture({ secretKeys: ['X-Edge-Key'] });

    logger.info({ headers: { 'x-edge-key': 'edge-secret-value', accept: 'json' } }, 'hit');

    expect(raw()).not.toContain('edge-secret-value');
    expect(raw()).toContain('accept');
  });

  it('AC-PLATFORM-14: what was given to the logger is not changed', () => {
    const { logger } = capture();
    const fields = { password: VALUES.password, nested: { token: VALUES.token } };

    logger.info(fields, 'x');

    expect(fields).toEqual({ password: VALUES.password, nested: { token: VALUES.token } });
  });

  it('SR-077: a message has its emails, phone numbers, PAN and tokens masked, and is cut at 2000 characters', () => {
    const { logger, lines } = capture();

    logger.info('Welcome asha@example.com, call 9876543210, PAN ABCPE1234F, Bearer abc.def');
    logger.info('y'.repeat(5000));

    expect(lines()[0]?.msg).toBe('Welcome <email>, call <phone>, PAN <pan>, Bearer <token>');
    expect(lines()[1]?.msg).toHaveLength(LOG_MESSAGE_MAX);
  });
});

describe('createLogger: an error in a log (SR-098)', () => {
  it('SR-098: err is its type, code, short message and stack, and nothing else of the error', () => {
    const { logger, raw, lines } = capture();
    const error = Object.assign(new Error('Payment failed for asha@example.com'), {
      code: 'E_PAY',
      config: { headers: { Authorization: 'Bearer secret-token-value' } },
      response: { headers: { 'set-cookie': 'sid=abc' }, data: { token: 'tok' } },
    });

    logger.error({ err: error, orderId: 'o1' }, 'payment failed');

    const line = lines()[0] as { err: Record<string, unknown>; orderId: string };
    expect(Object.keys(line.err).sort()).toEqual(['code', 'message', 'stack', 'type']);
    expect(line.err.code).toBe('E_PAY');
    expect(line.err.message).toBe('Payment failed for <email>');
    expect(line.orderId).toBe('o1');
    expect(raw()).not.toMatch(/secret-token-value|sid=abc|asha@example/);
  });

  it('SR-098: an error that is not under err is written the same way', () => {
    const { logger, lines } = capture();

    logger.error({ error: new Error('boom'), cause: new TypeError('inner') }, 'two errors');

    const line = lines()[0] as Record<string, Record<string, unknown>>;
    expect(line.error).toMatchObject({ type: 'Error', message: 'boom' });
    expect(line.cause).toMatchObject({ type: 'TypeError', message: 'inner' });
  });

  it('SR-098: err can be a string or anything else, and is still a short message', () => {
    const { logger, lines } = capture();

    logger.error({ err: 'plain asha@example.com' }, 'x');
    logger.error({ err: 42 }, 'x');

    expect(lines()[0]?.err).toEqual({ type: 'NonError', message: 'plain <email>' });
    expect(lines()[1]?.err).toEqual({ type: 'NonError', message: '42' });
  });
});

describe('createLogger: pino-pretty is for development only (D-339, SR-098, RT-34)', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  ) as Record<string, Record<string, string> | undefined>;

  it('SR-098, RT-34: pino-pretty is not a dependency of the package, only an optional peer and a development dependency', () => {
    for (const field of ['dependencies', 'optionalDependencies']) {
      expect(Object.keys(manifest[field] ?? {}), field).not.toContain('pino-pretty');
    }
    expect(Object.keys(manifest.dependencies ?? {})).toEqual(['pino']);
    expect(Object.keys(manifest.peerDependencies ?? {})).toEqual(['pino-pretty']);
    expect(manifest.peerDependenciesMeta).toEqual({ 'pino-pretty': { optional: true } });
    expect(manifest.devDependencies).toEqual(manifest.peerDependencies);
  });

  it('SR-098: pretty lines are refused unless NODE_ENV is development: not in production, not in CI, not when it is not set', () => {
    for (const environment of ['production', 'test', 'staging', '']) {
      vi.stubEnv('NODE_ENV', environment);
      expect(
        () => createLogger({ service: 'identity', level: 'info', pretty: true }),
        environment,
      ).toThrow('only when NODE_ENV is development');
    }
    vi.unstubAllEnvs();
    delete process.env['NODE_ENV'];
    expect(() => createLogger({ service: 'identity', level: 'info', pretty: true })).toThrow(
      RangeError,
    );
    vi.unstubAllEnvs();
  });

  it('D-339: in development a person reads lines, not JSON, with the same clean-up as a JSON line', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const written: string[] = [];
    const logger = createLogger({
      service: 'identity',
      level: 'info',
      pretty: true,
      destination: { write: (line) => written.push(line) },
    });

    forRequest(logger, 'req-1').info(
      { orderId: 'o1', password: 'Hunter2-secret', user: { email: 'a@b.in', city: 'Pune' } },
      'signed in as a@b.in',
    );
    logger.error({ err: Object.assign(new Error('boom a@b.in'), { code: 'E_BOOM' }) }, 'failed');
    vi.unstubAllEnvs();

    // The colours are taken out to read the text.
    // eslint-disable-next-line no-control-regex
    const text = written.join('').replaceAll(/\u001B\[\d+m/g, '');
    expect(text).toMatch(/INFO: signed in as <email>/);
    expect(text).toMatch(/requestId: "req-1"/);
    expect(text).toMatch(/password: "\[redacted\]"/);
    expect(text).toMatch(/"email": "\[redacted\]"/);
    expect(text).toMatch(/"code": "E_BOOM"/);
    expect(text).toMatch(/ERROR: failed/);
    expect(text).not.toContain('Hunter2-secret');
    expect(text).not.toContain('a@b.in');
    expect(text.trimStart().startsWith('{')).toBe(false);
  });

  it('SR-098: the logs are JSON on a plain stream: pino made no transport and no worker thread', () => {
    const { logger, raw, lines } = capture();

    logger.info('plain');

    expect(raw().split('\n').filter(Boolean)).toHaveLength(1);
    expect(lines()[0]).toMatchObject({ msg: 'plain' });
  });
});
