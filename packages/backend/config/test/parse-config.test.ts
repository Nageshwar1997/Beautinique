import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { string } from 'zod';

import { ConfigError, defineConfig, parseConfig } from '../src/index.ts';
import { GOOD_VALUES, paymentsConfig, problemsOf, valuesWith } from './utils/sample-config.ts';

const KEYS = Object.keys(GOOD_VALUES);

describe('parseConfig: a right config', () => {
  it('AC-PLATFORM-12: gives every key with the output of its schema', () => {
    const config = parseConfig(paymentsConfig, GOOD_VALUES, 'file');

    expect(config).toEqual({
      PAYMENTS_MONGODB_URI: 'mongodb://127.0.0.1:27017/payments',
      PAYMENTS_PORT: 4010,
      PAYMENTS_MODE: 'test',
      PAYMENTS_KEY_ID: 'key_test_abcdef',
      PAYMENTS_TOKEN_SECRET: 'a-long-fake-secret-0123456789',
      PAYMENTS_STRICT: true,
    });
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('AC-PLATFORM-12: the types come from the schemas, without a cast', () => {
    const config = parseConfig(paymentsConfig, GOOD_VALUES, 'file');

    expectTypeOf(config.PAYMENTS_PORT).toEqualTypeOf<number>();
    expectTypeOf(config.PAYMENTS_MODE).toEqualTypeOf<'test' | 'live'>();
    expectTypeOf(config.PAYMENTS_STRICT).toEqualTypeOf<boolean>();
    expectTypeOf(config.PAYMENTS_MONGODB_URI).toEqualTypeOf<string>();
  });

  it('SR-071: keys of other services and of the platform in the same env are left alone', () => {
    const platform = {
      ...GOOD_VALUES,
      IDENTITY_MONGODB_URI: 'mongodb://127.0.0.1:27017/identity',
      PAYMENTS: 'not in the namespace',
      PATH: 'C:\\somewhere',
      NODE_ENV: 'production',
      PORT: '10000',
    };

    expect(parseConfig(paymentsConfig, platform, 'platform').PAYMENTS_PORT).toBe(4010);
  });

  it('AC-PLATFORM-12: the values it was given are not changed', () => {
    const values = { ...GOOD_VALUES };
    parseConfig(paymentsConfig, values, 'file');

    expect(values).toEqual(GOOD_VALUES);
  });
});

describe('parseConfig: a key that is missing or empty', () => {
  it('AC-PLATFORM-12: stops, and names the key and never a value', () => {
    for (const key of KEYS) {
      const error = (() => {
        try {
          parseConfig(paymentsConfig, valuesWith({ [key]: undefined }), 'file');
        } catch (thrown) {
          return thrown as ConfigError;
        }
        throw new Error('did not throw');
      })();

      expect(error).toBeInstanceOf(ConfigError);
      expect(error.service).toBe('payments');
      expect(error.problems).toEqual([{ key, kind: 'missing', message: `${key} is missing` }]);
      for (const value of Object.values(GOOD_VALUES)) expect(error.message).not.toContain(value);
      expect(error.message).toContain(`${key} is missing`);
    }
  });

  it('AC-PLATFORM-12: a key that is empty or only spaces is refused', () => {
    for (const value of ['', ' ', '   ', '\t']) {
      expect(
        problemsOf(() => parseConfig(paymentsConfig, valuesWith({ PAYMENTS_PORT: value }), 'file')),
      ).toEqual([{ key: 'PAYMENTS_PORT', kind: 'empty', message: 'PAYMENTS_PORT is empty' }]);
    }
  });

  it('AC-PLATFORM-12: every problem is listed at once, in the order of the keys', () => {
    const problems = problemsOf(() => parseConfig(paymentsConfig, {}, 'file'));

    expect(problems.map((problem) => problem.key)).toEqual(KEYS);
    expect(new Set(problems.map((problem) => problem.kind))).toEqual(new Set(['missing']));
  });

  it("CR-3: no default and no optional key: a schema's own .default() or .optional() is never used", () => {
    const config = defineConfig({
      service: 'media',
      keys: {
        MEDIA_REGION: string('MEDIA_REGION is required.').default('eu'),
        MEDIA_PREFIX: string('MEDIA_PREFIX is required.').optional(),
      },
    });

    expect(
      problemsOf(() => parseConfig(config, {}, 'file')).map((problem) => problem.kind),
    ).toEqual(['missing', 'missing']);
    expect(
      problemsOf(() => parseConfig(config, { MEDIA_REGION: '', MEDIA_PREFIX: ' ' }, 'file')).map(
        (problem) => problem.kind,
      ),
    ).toEqual(['empty', 'empty']);
  });
});

describe('parseConfig: a value that is not valid', () => {
  it('AC-PLATFORM-12: names the key and says what is wrong, and never repeats the value', () => {
    const badPort = 'not-a-port-1234';
    const shortSecret = 'too-short';
    const problems = problemsOf(() =>
      parseConfig(
        paymentsConfig,
        valuesWith({ PAYMENTS_PORT: badPort, PAYMENTS_TOKEN_SECRET: shortSecret }),
        'file',
      ),
    );

    expect(problems.map((problem) => [problem.key, problem.kind])).toEqual([
      ['PAYMENTS_PORT', 'invalid'],
      ['PAYMENTS_TOKEN_SECRET', 'invalid'],
    ]);
    expect(problems[0]?.message).toBe('PAYMENTS_PORT must be a number.');
    expect(problems[1]?.message).toBe('PAYMENTS_TOKEN_SECRET must be at least 16 characters.');
    for (const problem of problems) {
      expect(problem.message).not.toContain(badPort);
      expect(problem.message).not.toContain(shortSecret);
    }
  });

  it('AC-PLATFORM-12: a message of a schema that quotes the value has the value taken out', () => {
    const secret = 'sk-live-0123456789abcdef';
    const config = defineConfig({
      service: 'media',
      keys: {
        MEDIA_KEY: string('MEDIA_KEY is required.').refine(() => false, {
          error: (issue) => `the key ${String(issue.input)} is not accepted`,
        }),
      },
    });

    const [problem] = problemsOf(() => parseConfig(config, { MEDIA_KEY: secret }, 'file'));

    expect(problem?.message).toBe('MEDIA_KEY is not valid: the key <value> is not accepted');
  });

  it('AC-PLATFORM-12: a short value is not taken out, so a message about `true` or a port stays whole', () => {
    const config = defineConfig({
      service: 'media',
      keys: {
        MEDIA_FLAG: string('MEDIA_FLAG is required.').refine(() => false, {
          error: (issue) => `${String(issue.input)} is not accepted`,
        }),
      },
    });

    const [problem] = problemsOf(() => parseConfig(config, { MEDIA_FLAG: 'maybe' }, 'file'));

    expect(problem?.message).toBe('MEDIA_FLAG is not valid: maybe is not accepted');
  });

  it('AC-PLATFORM-12: a message that does not name the key gets the key put in front of it', () => {
    const config = defineConfig({
      service: 'media',
      keys: {
        MEDIA_NAME: string('A name is required.')
          .min(5, 'MEDIA_NAME must be at least 5 characters.')
          .regex(/^[a-z]+$/, 'Only small letters.'),
      },
    });

    const [problem] = problemsOf(() => parseConfig(config, { MEDIA_NAME: '1' }, 'file'));

    expect(problem?.message).toBe(
      'MEDIA_NAME is not valid: MEDIA_NAME must be at least 5 characters.; Only small letters.',
    );
  });

  it('AC-PLATFORM-12: several reasons of one key are all given', () => {
    const config = defineConfig({
      service: 'media',
      keys: {
        MEDIA_NAME: string('MEDIA_NAME is required.')
          .min(5, 'MEDIA_NAME must be at least 5 characters.')
          .regex(/^[a-z]+$/, 'MEDIA_NAME must be small letters.'),
      },
    });

    const [problem] = problemsOf(() => parseConfig(config, { MEDIA_NAME: '1' }, 'file'));

    expect(problem?.message).toBe(
      'MEDIA_NAME must be at least 5 characters. MEDIA_NAME must be small letters.',
    );
  });
});

describe('parseConfig: a key that the config does not have', () => {
  it('AC-PLATFORM-12: an env file with a key that is not in the config is refused, sorted by name', () => {
    const problems = problemsOf(() =>
      parseConfig(
        paymentsConfig,
        { ...GOOD_VALUES, PAYMENTS_MONGO_URI: 'typo-value-0123456789', ZZZ: 'z', AAA: 'a' },
        'file',
      ),
    );

    expect(problems).toEqual([
      { key: 'AAA', kind: 'unknown', message: 'AAA is not a key of the payments config' },
      {
        key: 'PAYMENTS_MONGO_URI',
        kind: 'unknown',
        message: 'PAYMENTS_MONGO_URI is not a key of the payments config',
      },
      { key: 'ZZZ', kind: 'unknown', message: 'ZZZ is not a key of the payments config' },
    ]);
  });

  it('SR-071: in the platform env only a key of the namespace can be unknown, which catches a typo', () => {
    const problems = problemsOf(() =>
      parseConfig(
        paymentsConfig,
        { ...GOOD_VALUES, PAYMENTS_MONGODB_UR: 'x', OTHER_KEY: 'y', PATH: 'z' },
        'platform',
      ),
    );

    expect(problems.map((problem) => [problem.key, problem.kind])).toEqual([
      ['PAYMENTS_MONGODB_UR', 'unknown'],
    ]);
  });

  it('AC-PLATFORM-12: a key that is undefined is not a key', () => {
    const values = { ...GOOD_VALUES, PAYMENTS_GHOST: undefined };

    expect(parseConfig(paymentsConfig, values, 'file').PAYMENTS_PORT).toBe(4010);
  });

  it('AC-PLATFORM-12: a key that is missing and one that is unknown are both told', () => {
    const problems = problemsOf(() =>
      parseConfig(paymentsConfig, valuesWith({ PAYMENTS_PORT: undefined, EXTRA: '1' }), 'file'),
    );

    expect(problems.map((problem) => [problem.key, problem.kind])).toEqual([
      ['PAYMENTS_PORT', 'missing'],
      ['EXTRA', 'unknown'],
    ]);
  });

  it('AC-PLATFORM-12: a name like constructor or __proto__ is just an unknown key', () => {
    const values = JSON.parse(`{"__proto__": "x", "constructor": "y"}`) as Record<string, string>;

    expect(
      problemsOf(() => parseConfig(paymentsConfig, { ...GOOD_VALUES, ...values }, 'file')).map(
        (problem) => problem.key,
      ),
    ).toEqual(['__proto__', 'constructor']);
  });
});

describe('parseConfig: the rules', () => {
  it('AC-PLATFORM-12: test mode with a live key stops the process, by the name of the keys and not the value', () => {
    const liveKey = 'key_live_secretvalue99';
    const problems = problemsOf(() =>
      parseConfig(paymentsConfig, valuesWith({ PAYMENTS_KEY_ID: liveKey }), 'file'),
    );

    expect(problems).toEqual([
      {
        key: 'PAYMENTS_KEY_ID',
        kind: 'rule',
        message: 'PAYMENTS_KEY_ID is not a test key, while PAYMENTS_MODE is test',
      },
    ]);
    expect(JSON.stringify(problems)).not.toContain(liveKey);
  });

  it('AC-PLATFORM-12: live mode with a test key stops it too, and live mode with a live key starts', () => {
    expect(
      problemsOf(() =>
        parseConfig(paymentsConfig, valuesWith({ PAYMENTS_MODE: 'live' }), 'file'),
      )[0]?.message,
    ).toBe('PAYMENTS_KEY_ID is not a live key, while PAYMENTS_MODE is live');
    expect(
      parseConfig(
        paymentsConfig,
        valuesWith({ PAYMENTS_MODE: 'live', PAYMENTS_KEY_ID: 'key_live_abcdef' }),
        'file',
      ).PAYMENTS_MODE,
    ).toBe('live');
  });

  it('AC-PLATFORM-12: a rule runs on a config whose keys are all fine, and not before', () => {
    const rule = vi.fn(() => []);
    const config = defineConfig({
      service: 'media',
      keys: {
        MEDIA_BUCKET: string('MEDIA_BUCKET is required.'),
        MEDIA_REGION: string('MEDIA_REGION is required.'),
      },
      rules: [rule],
    });

    expect(() => parseConfig(config, { MEDIA_BUCKET: 'b' }, 'file')).toThrow(ConfigError);
    expect(() => parseConfig(config, { MEDIA_BUCKET: 'b', MEDIA_REGION: '' }, 'file')).toThrow(
      ConfigError,
    );
    expect(rule).not.toHaveBeenCalled();

    parseConfig(config, { MEDIA_BUCKET: 'b', MEDIA_REGION: 'eu' }, 'file');
    expect(rule).toHaveBeenCalledOnce();
    expect(rule).toHaveBeenCalledWith({ MEDIA_BUCKET: 'b', MEDIA_REGION: 'eu' });
  });

  it('AC-PLATFORM-12: a rule still runs when the only other problem is an unknown key, and both are told', () => {
    const problems = problemsOf(() =>
      parseConfig(
        paymentsConfig,
        valuesWith({ PAYMENTS_KEY_ID: 'key_live_abcdef', EXTRA: '1' }),
        'file',
      ),
    );

    expect(problems.map((problem) => problem.kind)).toEqual(['unknown', 'rule']);
  });

  it('AC-PLATFORM-12: the message of a rule has long values taken out', () => {
    const secret = 'a-long-fake-secret-0123456789';
    const config = defineConfig({
      service: 'media',
      keys: { MEDIA_SECRET: string('MEDIA_SECRET is required.') },
      rules: [(found) => [{ key: 'MEDIA_SECRET', message: `${found.MEDIA_SECRET} is no good` }]],
    });

    const [problem] = problemsOf(() => parseConfig(config, { MEDIA_SECRET: secret }, 'file'));

    expect(problem).toEqual({ key: 'MEDIA_SECRET', kind: 'rule', message: '<value> is no good' });
  });
});
