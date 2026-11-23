import { describe, expect, it } from 'vitest';

import { parseArguments } from '../src/args.ts';
import { CliError } from '../src/cli-error.ts';
import { main } from '../src/cli.ts';
import { confirm } from '../src/confirm.ts';
import { createLogger } from '../src/logger.ts';
import { fixtureRepo, recordingLogger } from './utils/fixture-repo.ts';

const noAsk = () => Promise.resolve('');

describe('parseArguments', () => {
  it('reads the command, the package names and the flags', () => {
    expect(parseArguments(['build', 'shared-money', '--dry-run'])).toEqual({
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
  const run = (argv: string[], root = fixtureRepo({}), runTurbo?: (args: string[]) => number) => {
    const logger = recordingLogger();
    const code = main(argv, { root, log: logger.log, ask: noAsk, runTurbo });
    return { code, ...logger };
  };

  it('shows the usage with exit code 0 for --help, 1 for no command', () => {
    expect(run(['--help']).code).toBe(0);
    const bare = run([]);
    expect(bare.code).toBe(1);
    expect(bare.out.join('\n')).toContain('build');
  });

  it('exits non-zero with a code and hint for an unknown command', () => {
    const { code, err } = run(['frobnicate']);
    expect(code).toBe(1);
    expect(err[0]).toContain('COMMAND_UNKNOWN');
    expect(err[1]).toContain('build');
  });

  it('prints the build order and builds nothing on --dry-run', () => {
    const root = fixtureRepo({ 'shared/money': ['@beautinique/shared-ids'], 'shared/ids': [] });
    const calls: string[][] = [];
    const { code, out } = run(['build', '--dry-run'], root, (args) => calls.push(args) && 0);
    expect(code).toBe(0);
    expect(out[0]).toBe('Build order: @beautinique/shared-ids, @beautinique/shared-money');
    expect(calls).toEqual([]);
  });

  it('builds everything through Turborepo, or only the named package and what it needs', () => {
    const root = fixtureRepo({ 'shared/money': ['@beautinique/shared-ids'], 'shared/ids': [] });
    const calls: string[][] = [];
    const turbo = (args: string[]) => calls.push(args) && 0;
    run(['build'], root, turbo);
    run(['build', 'shared-money'], root, turbo);
    expect(calls).toEqual([
      ['run', 'build', '--filter=./packages/*/*'],
      ['run', 'build', '--filter=@beautinique/shared-money...'],
    ]);
  });

  it('reports BUILD_FAILED when Turborepo fails', () => {
    const root = fixtureRepo({ 'shared/ids': [] });
    const { code, err } = run(['build'], root, () => 2);
    expect(code).toBe(1);
    expect(err[0]).toContain('BUILD_FAILED');
  });

  it('AC-PACKAGES-4: a circle stops the build before Turborepo runs, naming the packages', () => {
    const root = fixtureRepo({
      'shared/a': ['@beautinique/shared-b'],
      'shared/b': ['@beautinique/shared-a'],
    });
    const calls: string[][] = [];
    const { code, err } = run(['build'], root, (args) => calls.push(args) && 0);
    expect(code).toBe(1);
    expect(err[0]).toContain('PACKAGES_CYCLE');
    expect(err[0]).toContain(
      '@beautinique/shared-a -> @beautinique/shared-b -> @beautinique/shared-a',
    );
    expect(calls).toEqual([]);
  });

  it('says so when there are no packages yet', () => {
    const { code, out } = run(['build']);
    expect(code).toBe(0);
    expect(out).toEqual(['No packages to build yet.']);
  });
});
