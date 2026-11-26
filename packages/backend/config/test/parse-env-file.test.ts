import { describe, expect, it } from 'vitest';

import { parseEnvFile } from '../src/index.ts';

describe('parseEnvFile', () => {
  it('AC-PLATFORM-12: reads KEY=value lines, and skips comments and empty lines', () => {
    const { values, problems } = parseEnvFile(
      ['# a comment', '', 'APP_ONE=1', '   # an indented comment', 'APP_TWO=two words', '   '].join(
        '\n',
      ),
    );

    expect(values).toEqual({ APP_ONE: '1', APP_TWO: 'two words' });
    expect(problems).toEqual([]);
  });

  it('AC-PLATFORM-12: keeps everything after the first = as the value', () => {
    expect(parseEnvFile('APP_URL=mongodb://u:p@host/db?a=b&c=d').values).toEqual({
      APP_URL: 'mongodb://u:p@host/db?a=b&c=d',
    });
    expect(parseEnvFile('APP_EMPTY=').values).toEqual({ APP_EMPTY: '' });
    expect(parseEnvFile('APP_HASH=a#b').values).toEqual({ APP_HASH: 'a#b' });
  });

  it('AC-PLATFORM-12: takes off one pair of quotes, and trims the rest', () => {
    const { values } = parseEnvFile(
      [
        'APP_A="two words"',
        "APP_B='single'",
        'APP_C=  spaced  ',
        'APP_D=""',
        `APP_E="it's"`,
        `APP_F="open`,
        `APP_G="mixed'`,
        'APP_H="',
      ].join('\n'),
    );

    expect(values).toEqual({
      APP_A: 'two words',
      APP_B: 'single',
      APP_C: 'spaced',
      APP_D: '',
      APP_E: "it's",
      APP_F: '"open',
      APP_G: `"mixed'`,
      APP_H: '"',
    });
  });

  it('AC-PLATFORM-12: reads Windows line breaks and a byte order mark', () => {
    const { values, problems } = parseEnvFile('﻿APP_ONE=1\r\nAPP_TWO=2\r\n');

    expect(values).toEqual({ APP_ONE: '1', APP_TWO: '2' });
    expect(problems).toEqual([]);
  });

  it('AC-PLATFORM-12: refuses what is not a KEY=value line, by line number and never with the line', () => {
    const secret = 'supersecretvalue123';
    const { values, problems } = parseEnvFile(
      [
        'APP_OK=1',
        `lower=${secret}`,
        ` APP_INDENT=${secret}`,
        `export APP_EXPORT=${secret}`,
        `APP_NO_EQUALS ${secret}`,
        `1APP=${secret}`,
        `APP-DASH=${secret}`,
      ].join('\n'),
    );

    expect(values).toEqual({ APP_OK: '1' });
    expect(problems).toEqual([
      'line 2: not a KEY=value line (keys are UPPER_SNAKE_CASE)',
      'line 3: not a KEY=value line (keys are UPPER_SNAKE_CASE)',
      'line 4: not a KEY=value line (keys are UPPER_SNAKE_CASE)',
      'line 5: not a KEY=value line (keys are UPPER_SNAKE_CASE)',
      'line 6: not a KEY=value line (keys are UPPER_SNAKE_CASE)',
      'line 7: not a KEY=value line (keys are UPPER_SNAKE_CASE)',
    ]);
    expect(problems.join('\n')).not.toContain(secret);
  });

  it('AC-PLATFORM-12: a key twice is a problem, and the first value is kept', () => {
    const { values, problems } = parseEnvFile('APP_ONE=1\nAPP_TWO=2\nAPP_ONE=3\n');

    expect(values).toEqual({ APP_ONE: '1', APP_TWO: '2' });
    expect(problems).toEqual(['line 3: APP_ONE appears twice']);
  });

  it('RT-57: counts lines from firstLine when the text is a part of a bigger file', () => {
    const { problems } = parseEnvFile('bad line\nAPP_ONE=1\nAPP_ONE=2', 40);

    expect(problems).toEqual([
      'line 40: not a KEY=value line (keys are UPPER_SNAKE_CASE)',
      'line 42: APP_ONE appears twice',
    ]);
  });

  it('AC-PLATFORM-12: an empty file has no values and no problems', () => {
    expect(parseEnvFile('')).toEqual({ values: {}, problems: [] });
    expect(parseEnvFile('\n\n# only a comment\n')).toEqual({ values: {}, problems: [] });
  });
});
