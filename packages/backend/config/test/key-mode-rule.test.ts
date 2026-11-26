import { describe, expect, it } from 'vitest';

import { keyModeRule } from '../src/index.ts';

const rule = keyModeRule({
  mode: 'APP_MODE',
  key: 'APP_KEY',
  prefixes: { test: 'key_test_', live: 'key_live_' },
});

describe('keyModeRule', () => {
  it('AC-PLATFORM-12: a key of the mode passes, in both modes', () => {
    expect(rule({ APP_MODE: 'test', APP_KEY: 'key_test_abc' })).toEqual([]);
    expect(rule({ APP_MODE: 'live', APP_KEY: 'key_live_abc' })).toEqual([]);
  });

  it('AC-PLATFORM-12: a key of the other mode, or of no mode, is told by key and mode, not by value', () => {
    for (const value of ['key_live_abc', 'abc', '', 'KEY_TEST_abc', ' key_test_abc']) {
      expect(rule({ APP_MODE: 'test', APP_KEY: value }), value).toEqual([
        { key: 'APP_KEY', message: 'APP_KEY is not a test key, while APP_MODE is test' },
      ]);
    }
    expect(rule({ APP_MODE: 'live', APP_KEY: 'key_test_abc' })[0]?.message).toBe(
      'APP_KEY is not a live key, while APP_MODE is live',
    );
  });

  it('AC-PLATFORM-12: a mode that the rule does not know is told on the mode key', () => {
    for (const mode of ['staging', '', 'constructor', undefined, 5]) {
      expect(rule({ APP_MODE: mode, APP_KEY: 'key_test_abc' }), String(mode)).toEqual([
        { key: 'APP_MODE', message: 'APP_MODE is not one of test, live' },
      ]);
    }
  });

  it('AC-PLATFORM-12: a key that is not text is told too', () => {
    expect(rule({ APP_MODE: 'test', APP_KEY: 5 })).toHaveLength(1);
    expect(rule({ APP_MODE: 'test', APP_KEY: undefined })).toHaveLength(1);
  });

  it('AC-PLATFORM-12: a rule needs a prefix for each mode, and none of them empty', () => {
    expect(() => keyModeRule({ mode: 'APP_MODE', key: 'APP_KEY', prefixes: {} })).toThrow(
      'needs a prefix',
    );
    expect(() =>
      keyModeRule({ mode: 'APP_MODE', key: 'APP_KEY', prefixes: { test: 'key_test_', live: '' } }),
    ).toThrow('needs a prefix');
  });
});
