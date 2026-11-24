import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { create, type CreateOptions } from '../src/create.ts';
import { startFakeRegistry, type FakeRegistry } from './utils/fake-registry.ts';
import { fakeExec, fixtureRepo, recordingLogger } from './utils/fixture-repo.ts';

let registry: FakeRegistry;
beforeEach(async () => {
  registry = await startFakeRegistry();
});
afterEach(async () => {
  await registry.close();
});

function setup(overrides: Partial<CreateOptions> = {}, answers: string[] = []) {
  const root = fixtureRepo();
  const { exec, calls } = fakeExec(root);
  const logger = recordingLogger();
  const asked: string[] = [];
  const options: CreateOptions = {
    root,
    registry: registry.url,
    category: 'shared',
    name: 'money',
    description: 'Money in paise',
    dryRun: false,
    ask: (question) => {
      asked.push(question);
      return Promise.resolve(answers.shift() ?? 'haan');
    },
    log: logger.log,
    exec,
    ...overrides,
  };
  return { root, options, calls, asked, ...logger };
}

const read = (root: string, path: string) => readFileSync(join(root, path), 'utf8');
const manifest = (root: string, path: string) =>
  JSON.parse(read(root, `${path}/package.json`)) as Record<string, unknown>;

describe('create', () => {
  it('AC-PACKAGES-1: writes a shared package with ESM, exports, a test, README and CHANGELOG', async () => {
    const { root, options, calls } = setup();
    expect(await create(options)).toBe(0);
    const dir = 'packages/shared/money';
    const pkg = manifest(root, dir);
    expect(pkg).toMatchObject({
      name: '@beautinique/shared-money',
      version: '1.0.0',
      type: 'module',
      files: ['dist', 'README.md', 'CHANGELOG.md', 'LICENSE'],
      engines: { node: '24.22.3' },
      publishConfig: { access: 'public', provenance: true },
      repository: { directory: dir },
    });
    expect(pkg.exports).toMatchObject({
      '.': { types: expect.any(String) as string, import: expect.any(String) as string },
    });
    expect(pkg.private).toBeUndefined();
    expect(read(root, `${dir}/README.md`)).toMatch(/^## Visibility$/m);
    expect(read(root, `${dir}/CHANGELOG.md`)).toContain('@beautinique/shared-money');
    expect(existsSync(join(root, dir, 'test/index.test.ts'))).toBe(true);
    expect(existsSync(join(root, dir, 'tsdown.config.ts'))).toBe(true);
    expect(existsSync(join(root, dir, 'playground'))).toBe(false);
    // Installs the workspace, then verifies the new package.
    expect(calls.map((call) => `${call.command} ${call.args[0] ?? ''}`).slice(0, 2)).toEqual([
      'npm install',
      'turbo run',
    ]);
  });

  it('AC-PACKAGES-1: a frontend package also gets a playground and its tailwind.css', async () => {
    const { root, options } = setup({ category: 'frontend', name: 'button' });
    await create(options);
    const dir = 'packages/frontend/button';
    expect(read(root, `${dir}/tailwind.css`)).toContain("@source './dist'");
    expect(read(root, `${dir}/playground/styles.css`)).toContain("@source '../src'");
    expect(manifest(root, dir).files).toContain('tailwind.css');
    expect(manifest(root, dir).exports).toMatchObject({ './tailwind.css': './tailwind.css' });
  });

  it('AC-PACKAGES-1: writes nothing for a wrong category, a wrong name or an existing folder', async () => {
    const wrongCategory = setup({ category: 'tools' });
    await expect(create(wrongCategory.options)).rejects.toMatchObject({
      code: 'CREATE_CATEGORY_INVALID',
    });
    const wrongName = setup({ name: 'Money_X' });
    await expect(create(wrongName.options)).rejects.toMatchObject({ code: 'CREATE_NAME_INVALID' });
    const existing = setup();
    await create(existing.options);
    await expect(create(existing.options)).rejects.toMatchObject({ code: 'CREATE_FOLDER_EXISTS' });
    expect(wrongCategory.calls).toEqual([]);
    expect(existsSync(join(wrongName.root, 'packages'))).toBe(false);
  });

  it('AC-PACKAGES-1: a name that already has versions on npm starts at the next major', async () => {
    await registry.seed('@beautinique/shared-money', ['1.0.0', '1.4.2']);
    const { root, options, out } = setup();
    await create(options);
    expect(manifest(root, 'packages/shared/money').version).toBe('2.0.0');
    expect(out.join('\n')).toContain('up to 1.4.2');
  });

  it('AC-PACKAGES-1: writes nothing when the registry cannot be reached', async () => {
    const { root, options } = setup({ registry: 'http://127.0.0.1:1' });
    await expect(create(options)).rejects.toMatchObject({ code: 'REGISTRY_UNREACHABLE' });
    expect(existsSync(join(root, 'packages'))).toBe(false);
  });

  it('shows the plan and writes nothing on --dry-run or when the answer is not haan', async () => {
    const dry = setup({ dryRun: true });
    await create(dry.options);
    expect(dry.out[0]).toContain('Create @beautinique/shared-money 1.0.0');
    expect(dry.asked).toEqual([]);
    expect(existsSync(join(dry.root, 'packages'))).toBe(false);

    const declined = setup({}, ['no']);
    await create(declined.options);
    expect(declined.out.at(-1)).toBe('Nothing was written.');
    expect(existsSync(join(declined.root, 'packages'))).toBe(false);
  });

  it('asks for what the flags left out', async () => {
    const { root, options, asked } = setup(
      { category: undefined, name: undefined, description: undefined },
      ['backend', 'events', 'Event types', 'haan'],
    );
    await create(options);
    expect(asked).toHaveLength(4);
    expect(manifest(root, 'packages/backend/events').description).toBe('Event types');
  });

  it('keeps the files and says what to run when the install fails', async () => {
    const root = fixtureRepo();
    const { exec } = fakeExec(root, (call) => (call.command === 'npm' ? { status: 1 } : undefined));
    const { options } = setup({ root, exec });
    await expect(create(options)).rejects.toMatchObject({ code: 'CREATE_INSTALL_FAILED' });
    expect(existsSync(join(root, 'packages/shared/money/package.json'))).toBe(true);
  });
});
