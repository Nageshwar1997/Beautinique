import { describe, expect, it } from 'vitest';

import { parseArguments } from '../src/args.ts';
import { CliError } from '../src/cli-error.ts';
import { main } from '../src/cli.ts';
import { confirm } from '../src/confirm.ts';
import { exec, shellLine } from '../src/exec.ts';
import { createLogger } from '../src/logger.ts';
import { fakeExec, fixtureRepo, recordingLogger } from './utils/fixture-repo.ts';

const noAsk = () => Promise.resolve('');

describe('parseArguments', () => {
  it('reads the command, the package names and the flags', () => {
    expect(parseArguments(['build', 'shared-money', '--dry-run'])).toMatchObject({
      command: 'build',
      names: ['shared-money'],
      dryRun: true,
      help: false,
    });
  });

  it('refuses a flag it does not know, with a hint', () => {
    expect(() => parseArguments(['build', '--force'])).toThrow(CliError);
  });
});

describe('shell commands (QA-Q-9)', () => {
  it('quotes an argument with spaces and passes plain ones as they are', () => {
    expect(shellLine('npm', ['run', 'a b', '--filter=@beautinique/shared-x...'])).toBe(
      'npm run "a b" --filter=@beautinique/shared-x...',
    );
  });

  it('refuses a quote, a % or a line break, which cmd.exe would act on', () => {
    for (const arg of ['a"b', '%PATH%', 'a\nb', 'a\rb']) {
      expect(() => shellLine('npm', ['view', arg])).toThrow(
        expect.objectContaining({ code: 'EXEC_UNSAFE_ARGUMENT' }),
      );
    }
    expect(() => exec('npm', ['view', '%PATH%'], { cwd: '.' })).toThrow(/a shell would act on/);
  });
});

describe('confirm', () => {
  it('accepts only a clear yes', async () => {
    expect(await confirm(() => Promise.resolve(' Haan '), 'Go?')).toBe(true);
    expect(await confirm(() => Promise.resolve('yes'), 'Go?')).toBe(true);
    expect(await confirm(() => Promise.resolve('maybe'), 'Go?')).toBe(false);
    expect(await confirm(noAsk, 'Go?')).toBe(false);
  });
});

describe('createLogger', () => {
  it('writes an error with its code and what to do next, other errors with a stack', () => {
    const { log, err } = recordingLogger();
    log.error(new CliError('SOME_CODE', 'It broke.', 'Fix it.'));
    log.error('plain');
    expect(err).toEqual(['error [SOME_CODE]: It broke.', '  next: Fix it.', 'error: plain']);
  });

  it('sends warnings to the error stream', () => {
    const lines: string[] = [];
    createLogger(
      () => undefined,
      (line) => lines.push(line),
    ).warn('careful');
    expect(lines).toEqual(['warning: careful']);
  });
});

describe('main', () => {
  const run = async (
    argv: string[],
    root = fixtureRepo({ 'shared/ids': [], 'shared/money': ['@beautinique/shared-ids'] }),
    status = 0,
  ) => {
    const logger = recordingLogger();
    const { exec, calls } = fakeExec(root, (call) =>
      call.command === 'turbo' ? { status } : undefined,
    );
    const code = await main(argv, {
      root,
      log: logger.log,
      ask: noAsk,
      exec,
      registry: 'http://127.0.0.1:1',
      env: {},
      now: () => new Date('2026-11-23T00:00:00Z'),
    });
    return { code, calls, ...logger };
  };

  it('shows the usage with exit code 0 for --help, 1 for no command', async () => {
    expect((await run(['--help'])).code).toBe(0);
    const bare = await run([]);
    expect(bare.code).toBe(1);
    expect(bare.out.join('\n')).toContain('build');
  });

  it('exits non-zero with a code and hint for an unknown command', async () => {
    const { code, err } = await run(['frobnicate']);
    expect(code).toBe(1);
    expect(err[0]).toContain('COMMAND_UNKNOWN');
    expect(err[1]).toContain('build');
  });

  it('prints the build order and builds nothing on --dry-run', async () => {
    const { code, out, calls } = await run(['build', '--dry-run']);
    expect(code).toBe(0);
    expect(out[0]).toBe('Build order: @beautinique/shared-ids, @beautinique/shared-money');
    expect(calls).toEqual([]);
  });

  it('builds everything through Turborepo, or only the named package and what it needs', async () => {
    const all = await run(['build']);
    const one = await run(['build', 'shared-money']);
    expect(all.calls.map((call) => call.args)).toEqual([
      ['run', 'build', '--filter=./packages/*/*'],
    ]);
    expect(one.calls.map((call) => call.args)).toEqual([
      ['run', 'build', '--filter=@beautinique/shared-money...'],
    ]);
  });

  it('reports BUILD_FAILED when Turborepo fails', async () => {
    const { code, err } = await run(['build'], undefined, 2);
    expect(code).toBe(1);
    expect(err[0]).toContain('BUILD_FAILED');
  });

  it('AC-PACKAGES-4: a circle stops the build before Turborepo runs, naming the packages', async () => {
    const root = fixtureRepo({
      'shared/a': ['@beautinique/shared-b'],
      'shared/b': ['@beautinique/shared-a'],
    });
    const { code, err, calls } = await run(['build'], root);
    expect(code).toBe(1);
    expect(err[0]).toContain('PACKAGES_CYCLE');
    expect(err[0]).toContain(
      '@beautinique/shared-a -> @beautinique/shared-b -> @beautinique/shared-a',
    );
    expect(calls).toEqual([]);
  });

  it('says so when there are no packages yet', async () => {
    const { code, out } = await run(['build'], fixtureRepo());
    expect(code).toBe(0);
    expect(out).toEqual(['No packages to build yet.']);
  });
});
