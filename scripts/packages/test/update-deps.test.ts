import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { updateDeps, type UpdateDepsOptions } from '../src/update-deps.ts';
import { startFakeRegistry, type FakeRegistry } from './utils/fake-registry.ts';
import { addPackage, fakeExec, fixtureRepo, recordingLogger } from './utils/fixture-repo.ts';

let registry: FakeRegistry;
beforeEach(async () => {
  registry = await startFakeRegistry();
  await registry.seed('zod', ['3.0.0', '3.1.0', '3.1.5', '4.0.0']);
  await registry.seed('react', ['19.3.1', '19.4.0']);
});
afterEach(async () => {
  await registry.close();
});

const LOCK = '{ "lock": "before" }\n';

function setup(config: Partial<UpdateDepsOptions> = {}) {
  const root = fixtureRepo();
  writeFileSync(join(root, 'package-lock.json'), LOCK);
  const money = addPackage(root, 'shared', 'money');
  const path = join(money, 'package.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  manifest.dependencies = { zod: '^3.0.0', '@beautinique/shared-ids': '^1.0.0' };
  manifest.devDependencies = { prettier: '>=1.0.0' };
  writeFileSync(path, JSON.stringify(manifest, null, 2));
  addPackage(root, 'shared', 'ids');
  const installed: string[] = [];
  const { exec, calls } = fakeExec(root, (call) => {
    if (
      call.command === 'npm' &&
      call.args[0] === 'install' &&
      !call.args.includes('--package-lock-only')
    ) {
      installed.push(readFileSync(path, 'utf8'));
    }
    return undefined;
  });
  const logger = recordingLogger();
  const answers: string[] = [];
  const options: UpdateDepsOptions = {
    root,
    registry: registry.url,
    names: [],
    level: undefined,
    dryRun: false,
    ask: () => Promise.resolve(answers.shift() ?? 'haan'),
    log: logger.log,
    exec,
    ...config,
  };
  return { root, path, options, calls, installed, answers, ...logger };
}

const manifestOf = (path: string) =>
  JSON.parse(readFileSync(path, 'utf8')) as {
    dependencies: Record<string, string>;
    peerDependencies?: Record<string, string>;
    devDependencies: Record<string, string>;
  };

describe('update-deps', () => {
  it('moves a range to the newest version the level allows, in its own form, and installs', async () => {
    const { path, options, calls, installed } = setup();
    await updateDeps(options);
    expect(manifestOf(path).dependencies.zod).toBe('^3.1.5');
    // The exact version went in first, so npm took that very version; the range form came after.
    expect(
      (JSON.parse(installed[0] ?? '{}') as ReturnType<typeof manifestOf>).dependencies.zod,
    ).toBe('3.1.5');
    expect(calls.map((call) => call.args.join(' '))).toEqual([
      'install --ignore-scripts',
      'install --package-lock-only --ignore-scripts',
    ]);
  });

  it('takes a major step only on --level major, and none at --level patch when there is none', async () => {
    const major = setup({ level: 'major' });
    await updateDeps(major.options);
    expect(manifestOf(major.path).dependencies.zod).toBe('^4.0.0');
    const patch = setup({ level: 'patch' });
    await updateDeps(patch.options);
    expect(manifestOf(patch.path).dependencies.zod).toBe('^3.0.0');
    expect(patch.out.at(-1)).toBe('Nothing to update at the patch level.');
  });

  it('never touches our own packages, and leaves a range of another form alone with a warning', async () => {
    const { path, options, err } = setup();
    await updateDeps(options);
    expect(manifestOf(path).dependencies['@beautinique/shared-ids']).toBe('^1.0.0');
    expect(manifestOf(path).devDependencies.prettier).toBe('>=1.0.0');
    expect(err.join('\n')).toContain('prettier ">=1.0.0" is not an exact, ~ or ^ range');
  });

  it('moves a peer dependency and its identical devDependencies range together (CR-35)', async () => {
    const root = fixtureRepo();
    writeFileSync(join(root, 'package-lock.json'), LOCK);
    const dir = addPackage(root, 'frontend', 'button');
    const { exec } = fakeExec(root);
    const { log } = recordingLogger();
    await updateDeps({
      root,
      registry: registry.url,
      names: [],
      level: undefined,
      dryRun: false,
      ask: () => Promise.resolve('haan'),
      log,
      exec,
    });
    const manifest = manifestOf(join(dir, 'package.json'));
    expect(manifest.peerDependencies?.react).toBe('^19.4.0');
    expect(manifest.devDependencies.react).toBe('^19.4.0');
  });

  it('AC-PACKAGES-11: a failed install puts every package.json and the lockfile back', async () => {
    const { root, path, options } = setup();
    const before = readFileSync(path, 'utf8');
    const { exec } = fakeExec(root, (call) => (call.command === 'npm' ? { status: 1 } : undefined));
    await expect(updateDeps({ ...options, exec })).rejects.toMatchObject({
      code: 'UPDATE_INSTALL_FAILED',
    });
    expect(readFileSync(path, 'utf8')).toBe(before);
    expect(readFileSync(join(root, 'package-lock.json'), 'utf8')).toBe(LOCK);
  });

  it('AC-PACKAGES-11: a run stopped in the middle puts everything back too', async () => {
    const { root, path, options } = setup();
    const before = readFileSync(path, 'utf8');
    writeFileSync(join(root, 'package-lock.json'), LOCK);
    const stopped: UpdateDepsOptions['exec'] = () => {
      writeFileSync(join(root, 'package-lock.json'), 'half written');
      throw new Error('interrupted');
    };
    await expect(updateDeps({ ...options, exec: stopped })).rejects.toThrow('interrupted');
    expect(readFileSync(path, 'utf8')).toBe(before);
    expect(readFileSync(join(root, 'package-lock.json'), 'utf8')).toBe(LOCK);
  });

  it('shows the plan and writes nothing on --dry-run or when the answer is not haan', async () => {
    const dry = setup({ dryRun: true });
    const before = readFileSync(dry.path, 'utf8');
    await updateDeps(dry.options);
    expect(dry.out.join('\n')).toContain('zod ^3.0.0 -> ^3.1.5');
    const declined = setup();
    declined.answers.push('no');
    await updateDeps(declined.options);
    expect(readFileSync(dry.path, 'utf8')).toBe(before);
    expect(manifestOf(declined.path).dependencies.zod).toBe('^3.0.0');
    expect(declined.calls).toEqual([]);
  });

  it('refuses a level that does not exist', async () => {
    const { options } = setup({ level: 'huge' });
    await expect(updateDeps(options)).rejects.toMatchObject({ code: 'UPDATE_LEVEL_INVALID' });
  });
});
