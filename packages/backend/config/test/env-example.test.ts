import { describe, expect, it } from 'vitest';

import { envExampleProblems, EXAMPLE_SECTIONS } from '../src/index.ts';
import { GOOD_VALUES, paymentsConfig } from './utils/sample-config.ts';

const KEYS = Object.keys(GOOD_VALUES);
const placeholders = Object.fromEntries(KEYS.map((key) => [key, '<...>']));

function lines(values: Readonly<Record<string, string>>): string {
  return Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

// The `.env.example` of the payments service: three parts, each with every key.
function example(parts: Partial<Record<(typeof EXAMPLE_SECTIONS)[number], string>> = {}): string {
  const text = {
    DEVELOPMENT: lines({ ...GOOD_VALUES, PAYMENTS_TOKEN_SECRET: '<...>' }),
    TEST: lines(GOOD_VALUES),
    PRODUCTION: lines(placeholders),
    ...parts,
  };
  return [
    '# The keys of the payments service.',
    ...EXAMPLE_SECTIONS.flatMap((section) => [`# [${section}]`, text[section], '']),
  ].join('\n');
}

describe('envExampleProblems', () => {
  it('RT-57: a .env.example with every key in each of its three parts has no problem', () => {
    expect(envExampleProblems(paymentsConfig, example())).toEqual([]);
  });

  it('RT-57: reads Windows line breaks, a byte order mark and a marker with spaces', () => {
    const bom = String.fromCharCode(0xfeff);
    const text = `${bom}${example().replaceAll('# [TEST]', '#   [TEST]').replaceAll('\n', '\r\n')}`;

    expect(envExampleProblems(paymentsConfig, text)).toEqual([]);
  });

  it('RT-57: a key of the config that a part lacks is told, by part and key', () => {
    const without = lines({ ...GOOD_VALUES, PAYMENTS_TOKEN_SECRET: undefined as never });
    const problems = envExampleProblems(
      paymentsConfig,
      example({ TEST: without.replace('PAYMENTS_TOKEN_SECRET=undefined', '') }),
    );

    expect(problems).toEqual(['[TEST] lacks PAYMENTS_TOKEN_SECRET']);
  });

  it('RT-57: every part is looked at, and every missing key is told', () => {
    const problems = envExampleProblems(
      paymentsConfig,
      example({ DEVELOPMENT: 'PAYMENTS_PORT=1', PRODUCTION: '' }),
    );

    expect(problems).toHaveLength(11);
    expect(problems.filter((problem) => problem.startsWith('[DEVELOPMENT] lacks'))).toHaveLength(5);
    expect(problems.filter((problem) => problem.startsWith('[PRODUCTION] lacks'))).toHaveLength(6);
  });

  it('RT-57: a key that the config does not have is told, and never its value', () => {
    const secret = 'supersecretvalue123';
    const problems = envExampleProblems(
      paymentsConfig,
      example({ PRODUCTION: `${lines(placeholders)}\nPAYMENTS_OLD_KEY=${secret}\nOTHER=1` }),
    );

    expect(problems).toEqual([
      '[PRODUCTION] has PAYMENTS_OLD_KEY, which is not a key of the payments config',
      '[PRODUCTION] has OTHER, which is not a key of the payments config',
    ]);
    expect(problems.join('\n')).not.toContain(secret);
  });

  it('RT-57: a key twice in a part, and a line that is not KEY=value, are told by line number', () => {
    const problems = envExampleProblems(
      paymentsConfig,
      example({ TEST: `${lines(GOOD_VALUES)}\nPAYMENTS_PORT=5\nlower=value` }),
    );

    expect(problems).toHaveLength(2);
    expect(problems[0]).toMatch(/^\[TEST\] line \d+: PAYMENTS_PORT appears twice$/);
    expect(problems[1]).toMatch(/^\[TEST\] line \d+: not a KEY=value line/);
    const [first, second] = problems.map((problem) => Number(/line (\d+)/.exec(problem)?.[1]));
    expect(second).toBe((first ?? 0) + 1);
  });

  it('RT-57: a part that is missing, or comes twice, is told', () => {
    const noProduction = example().split('# [PRODUCTION]')[0] ?? '';

    expect(envExampleProblems(paymentsConfig, noProduction)).toEqual([
      'the [PRODUCTION] part is missing',
    ]);
    expect(envExampleProblems(paymentsConfig, '')).toEqual([
      'the [DEVELOPMENT] part is missing',
      'the [TEST] part is missing',
      'the [PRODUCTION] part is missing',
    ]);
    const twice = `${example()}\n# [TEST]\n${lines(GOOD_VALUES)}\n`;
    expect(envExampleProblems(paymentsConfig, twice)).toEqual([
      expect.stringMatching(/^line \d+: the \[TEST\] part appears twice$/),
    ]);
  });

  it('RT-57: a key before the first part is told', () => {
    const problems = envExampleProblems(paymentsConfig, `PAYMENTS_PORT=1\nbad line\n${example()}`);

    expect(problems).toEqual([
      'line 2: not a KEY=value line (keys are UPPER_SNAKE_CASE)',
      'a key comes before the first part',
    ]);
  });

  it('RT-57: comments and empty lines before the first part, and in the parts, are fine', () => {
    const text = `# a note\n\n${example({ TEST: `# a note\n\n${lines(GOOD_VALUES)}\n\n# another` })}`;

    expect(envExampleProblems(paymentsConfig, text)).toEqual([]);
  });
});
