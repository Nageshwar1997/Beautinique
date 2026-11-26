import { afterEach, describe, expect, it } from 'vitest';

import { ENVIRONMENTS, environmentOf, loadConfig, type ConfigError } from '../src/index.ts';
import {
  envFileName,
  envText,
  folderWith,
  GOOD_VALUES,
  paymentsConfig,
  problemsOf,
  removeFolders,
  valuesWith,
} from './utils/sample-config.ts';

afterEach(removeFolders);

const LIVE_VALUES = valuesWith({ PAYMENTS_MODE: 'live', PAYMENTS_KEY_ID: 'key_live_abcdef' });

describe('environmentOf', () => {
  it('CR-3: is the NODE_ENV when it is development, test or production', () => {
    expect(ENVIRONMENTS).toEqual(['development', 'test', 'production']);
    for (const environment of ENVIRONMENTS) {
      expect(environmentOf({ NODE_ENV: environment })).toBe(environment);
    }
  });

  it('CR-3: has no default: anything else, or nothing, is undefined', () => {
    for (const value of [undefined, '', 'prod', 'Production', 'staging', ' test']) {
      expect(environmentOf({ NODE_ENV: value }), String(value)).toBeUndefined();
    }
    expect(environmentOf({})).toBeUndefined();
  });
});

describe('loadConfig: development and test read their own file', () => {
  it('AC-PLATFORM-12: development reads .env.development and gives the typed config', () => {
    const directory = folderWith({ [envFileName('development')]: envText(GOOD_VALUES) });

    const config = loadConfig(paymentsConfig, { env: { NODE_ENV: 'development' }, directory });

    expect(config.PAYMENTS_PORT).toBe(4010);
    expect(config.PAYMENTS_STRICT).toBe(true);
  });

  it('AC-PLATFORM-12: test reads .env.test, and only that', () => {
    const directory = folderWith({
      [envFileName('test')]: envText(valuesWith({ PAYMENTS_PORT: '4020' })),
      [envFileName('development')]: envText(valuesWith({ PAYMENTS_PORT: '4030' })),
    });

    expect(loadConfig(paymentsConfig, { env: { NODE_ENV: 'test' }, directory }).PAYMENTS_PORT).toBe(
      4020,
    );
  });

  it('AC-PLATFORM-12: the env of the process does not change what the file says', () => {
    const directory = folderWith({ [envFileName('development')]: envText(GOOD_VALUES) });
    const env = { NODE_ENV: 'development', PAYMENTS_PORT: '9999', PAYMENTS_GHOST: 'x' };

    expect(loadConfig(paymentsConfig, { env, directory }).PAYMENTS_PORT).toBe(4010);
  });

  it('AC-PLATFORM-12: a test run without .env.test does not start', () => {
    const directory = folderWith({ [envFileName('development')]: envText(GOOD_VALUES) });

    const problems = problemsOf(() =>
      loadConfig(paymentsConfig, { env: { NODE_ENV: 'test' }, directory }),
    );

    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ key: '.env.test', kind: 'file' });
    expect(problems[0]?.message).toContain('.env.test is missing');
    expect(problems[0]?.message).toContain('npm run setup');
  });

  it('AC-PLATFORM-12: a file that cannot be read is told by its name and the reason, not its content', () => {
    // A folder where the file should be: reading it fails with EISDIR.
    const asFolder = folderWith({ [`${envFileName('test')}/inner.txt`]: 'x' });

    const problems = problemsOf(() =>
      loadConfig(paymentsConfig, { env: { NODE_ENV: 'test' }, directory: asFolder }),
    );

    expect(problems[0]?.message).toMatch(
      /^\.env\.test cannot be read in .+ \((EISDIR|EPERM|EACCES)\)$/,
    );
  });

  it('AC-PLATFORM-12: a key missing in the file stops, by the name of the key', () => {
    const directory = folderWith({
      [envFileName('test')]: envText(valuesWith({ PAYMENTS_TOKEN_SECRET: undefined })),
    });

    const error = (() => {
      try {
        loadConfig(paymentsConfig, { env: { NODE_ENV: 'test' }, directory });
      } catch (thrown) {
        return thrown as ConfigError;
      }
      throw new Error('did not throw');
    })();

    expect(error.problems).toEqual([
      {
        key: 'PAYMENTS_TOKEN_SECRET',
        kind: 'missing',
        message: 'PAYMENTS_TOKEN_SECRET is missing',
      },
    ]);
    expect(error.message).not.toContain(GOOD_VALUES.PAYMENTS_MONGODB_URI);
  });

  it('AC-PLATFORM-12: a key that is not in the config, in the file, stops it', () => {
    const directory = folderWith({
      [envFileName('development')]: envText({ ...GOOD_VALUES, PAYMENTS_OLD_KEY: 'x' }),
    });

    const problems = problemsOf(() =>
      loadConfig(paymentsConfig, { env: { NODE_ENV: 'development' }, directory }),
    );

    expect(problems.map((problem) => [problem.key, problem.kind])).toEqual([
      ['PAYMENTS_OLD_KEY', 'unknown'],
    ]);
  });

  it('AC-PLATFORM-12: a line of the file that is not KEY=value stops it, by line, and never with the line', () => {
    const secret = 'supersecretvalue123';
    const directory = folderWith({
      [envFileName('test')]: `${envText(GOOD_VALUES)}lower=${secret}\nPAYMENTS_PORT=1\n`,
    });

    const problems = problemsOf(() =>
      loadConfig(paymentsConfig, { env: { NODE_ENV: 'test' }, directory }),
    );

    expect(problems.map((problem) => problem.message)).toEqual([
      '.env.test line 7: not a KEY=value line (keys are UPPER_SNAKE_CASE)',
      '.env.test line 8: PAYMENTS_PORT appears twice',
    ]);
    expect(JSON.stringify(problems)).not.toContain(secret);
  });

  it('AC-PLATFORM-12: the rule of the key and its mode applies to a file too', () => {
    const directory = folderWith({
      [envFileName('development')]: envText(valuesWith({ PAYMENTS_KEY_ID: 'key_live_abcdef' })),
    });

    const problems = problemsOf(() =>
      loadConfig(paymentsConfig, { env: { NODE_ENV: 'development' }, directory }),
    );

    expect(problems.map((problem) => problem.kind)).toEqual(['rule']);
  });
});

describe('loadConfig: production reads the env of the platform', () => {
  it('AC-PLATFORM-12: reads the keys of its namespace and never opens a file', () => {
    // Nothing at this path: a read would fail. And a .env.production that says something else.
    const missing = loadConfig(paymentsConfig, {
      env: { NODE_ENV: 'production', ...LIVE_VALUES },
      directory: 'C:/this/folder/does/not/exist',
    });
    const withFile = loadConfig(paymentsConfig, {
      env: { NODE_ENV: 'production', ...LIVE_VALUES },
      directory: folderWith({
        [envFileName('production')]: envText(valuesWith({ PAYMENTS_PORT: '1' })),
      }),
    });

    expect(missing.PAYMENTS_PORT).toBe(4010);
    expect(withFile.PAYMENTS_PORT).toBe(4010);
  });

  it('SR-071: leaves the keys of the other services and of the platform alone', () => {
    const env = {
      NODE_ENV: 'production',
      PORT: '10000',
      RENDER: 'true',
      IDENTITY_PORT: '4001',
      ...LIVE_VALUES,
    };

    expect(loadConfig(paymentsConfig, { env, directory: 'unused' }).PAYMENTS_MODE).toBe('live');
  });

  it('AC-PLATFORM-12: a missing or mistyped key of the namespace stops it, by name', () => {
    const env = {
      NODE_ENV: 'production',
      ...valuesWith({
        PAYMENTS_MODE: 'live',
        PAYMENTS_KEY_ID: 'key_live_abcdef',
        PAYMENTS_PORT: undefined,
        PAYMENTS_PORTT: '4010',
      }),
    };

    const problems = problemsOf(() => loadConfig(paymentsConfig, { env, directory: 'unused' }));

    expect(problems.map((problem) => [problem.key, problem.kind])).toEqual([
      ['PAYMENTS_PORT', 'missing'],
      ['PAYMENTS_PORTT', 'unknown'],
    ]);
  });

  it('AC-PLATFORM-12: test mode with a live key stops production too', () => {
    const env = { NODE_ENV: 'production', ...valuesWith({ PAYMENTS_KEY_ID: 'key_live_abcdef' }) };

    const problems = problemsOf(() => loadConfig(paymentsConfig, { env, directory: 'unused' }));

    expect(problems).toEqual([
      {
        key: 'PAYMENTS_KEY_ID',
        kind: 'rule',
        message: 'PAYMENTS_KEY_ID is not a test key, while PAYMENTS_MODE is test',
      },
    ]);
  });
});

describe('loadConfig: no environment', () => {
  it('CR-3: a process that does not say where it runs does not start', () => {
    for (const env of [{}, { NODE_ENV: '' }, { NODE_ENV: 'staging' }, { NODE_ENV: undefined }]) {
      expect(
        problemsOf(() => loadConfig(paymentsConfig, { env, directory: 'unused' })),
        JSON.stringify(env),
      ).toEqual([
        {
          key: 'NODE_ENV',
          kind: 'environment',
          message: 'NODE_ENV is missing, or is not development, test or production',
        },
      ]);
    }
  });
});
