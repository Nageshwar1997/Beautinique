import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { parseUpdateDepsFlags } from '../lib/args.ts';
import {
  type DependencyEntry,
  inLevel,
  levelOf,
  pickVersion,
  plainBase,
  planUpdates,
} from '../lib/dependencies.ts';
import type { RegistryPackage, VersionDetails } from '../lib/registry.ts';
import { lockMismatches, updateDepsCommand } from '../lib/update-deps.ts';
import type { BumpType } from '../lib/versions.ts';
import { makeRepo, privatePackage, publicPackage, testContext } from './helpers.ts';

const repos: { cleanup: () => void }[] = [];
const repo = (...args: Parameters<typeof makeRepo>) => {
  const r = makeRepo(...args);
  repos.push(r);
  return r;
};
afterEach(() => {
  repos.splice(0).forEach((r) => {
    r.cleanup();
  });
});

/** A registry document: versions in order, latest = last unless given, optional per-version details. */
const pkg = (
  versions: string[],
  options: { latest?: string; details?: Record<string, VersionDetails> } = {},
): RegistryPackage => ({
  versions,
  distTags: { latest: options.latest ?? versions.at(-1) ?? '' },
  ...(options.details ? { details: options.details } : {}),
});

const entry = (
  name: string,
  range: string,
  where = '.',
  field: DependencyEntry['field'] = 'devDependencies',
): DependencyEntry => ({ where, file: `${where}/package.json`, field, name, range });

const plan = (
  entries: DependencyEntry[],
  registry: Record<string, RegistryPackage | null>,
  level: BumpType = 'major',
  internal: string[] = [],
) =>
  planUpdates({
    entries,
    internal: new Set(internal),
    registry: new Map(Object.entries(registry)),
    level,
    node: '24.11.0',
  });

const summary = (p: ReturnType<typeof plan>) =>
  p.changes.map((c) => `${c.entry.where} ${c.entry.field} ${c.entry.name} ${c.range}`);

describe('levels', () => {
  it('patch = what ~ and ^ allow, minor = what ^ allows, major = anything', () => {
    expect(inLevel('1.2.3', '1.2.9', 'patch')).toBe(true);
    expect(inLevel('1.2.3', '1.3.0', 'patch')).toBe(false);
    expect(inLevel('1.2.3', '1.9.0', 'minor')).toBe(true);
    expect(inLevel('1.2.3', '2.0.0', 'minor')).toBe(false);
    expect(inLevel('1.2.3', '9.0.0', 'major')).toBe(true);
    // 0.x: a minor step may break, so it needs major
    expect(inLevel('0.3.1', '0.3.9', 'patch')).toBe(true);
    expect(inLevel('0.3.1', '0.4.0', 'minor')).toBe(false);
    expect(inLevel('0.0.3', '0.0.4', 'patch')).toBe(false);
    // a prerelease base moves to its own release
    expect(inLevel('2.0.0-beta.1', '2.0.0', 'patch')).toBe(true);
  });

  it('names the smallest level of a change', () => {
    expect(levelOf('1.2.3', '1.2.4')).toBe('patch');
    expect(levelOf('1.2.3', '1.3.0')).toBe('minor');
    expect(levelOf('1.2.3', '2.0.0')).toBe('major');
    expect(levelOf('0.3.1', '0.4.0')).toBe('major');
  });

  it('reads the start version of plain ranges only', () => {
    expect(plainBase('^1.2.3')).toBe('1.2.3');
    expect(plainBase('~6.0.3')).toBe('6.0.3');
    expect(plainBase('1.2.3')).toBe('1.2.3');
    expect(plainBase('^2.0.0-beta.1')).toBe('2.0.0-beta.1');
    for (const odd of ['>=1 <3', '^1 || ^2', '*', 'latest', 'workspace:*', 'npm:a@^1', '^01.2.3']) {
      expect(plainBase(odd)).toBeNull();
    }
  });
});

describe('pickVersion', () => {
  const info = pkg(
    ['1.2.3', '1.2.4', '1.2.5', '1.3.0', '1.4.0-beta.1', '2.0.0', '2.1.0', '3.0.0'],
    {
      latest: '2.1.0',
      details: { '1.2.5': { deprecated: 'broken' }, '2.1.0': { engines: { node: '>=99' } } },
    },
  );

  it('takes the newest version the level allows, skipping deprecated and prereleases', () => {
    expect(pickVersion(info, '1.2.3', 'patch')).toBe('1.2.4');
    expect(pickVersion(info, '1.2.3', 'minor')).toBe('1.3.0');
    expect(pickVersion(info, '1.2.3', 'major')).toBe('2.1.0');
  });

  it('never goes above the latest tag, nor to a version that needs another Node.js', () => {
    expect(pickVersion(info, '1.2.3', 'major', { node: '24.11.0' })).toBe('2.0.0');
    expect(pickVersion(info, '2.0.0', 'major', { node: '24.11.0' })).toBeNull();
    expect(pickVersion(info, '1.2.3', 'major', { node: '99.0.0' })).toBe('2.1.0');
  });

  it('honours max and accept, and never returns the base or older', () => {
    expect(pickVersion(info, '1.2.3', 'major', { max: '1.9.9' })).toBe('1.3.0');
    expect(pickVersion(info, '1.2.3', 'major', { accept: (v) => v.startsWith('1.2.') })).toBe(
      '1.2.4',
    );
    expect(pickVersion(info, '2.1.0', 'major')).toBeNull();
  });

  it('moves a prerelease along its own line or to its release', () => {
    const pre = pkg(['2.0.0-beta.1', '2.0.0-beta.2', '2.0.1-beta.0'], { latest: '2.0.0-beta.2' });
    expect(pickVersion(pre, '2.0.0-beta.1', 'major')).toBe('2.0.0-beta.2');
    const released = pkg(['2.0.0-beta.1', '2.0.0', '2.0.1-beta.0']);
    expect(pickVersion(released, '2.0.0-beta.1', 'patch')).toBe('2.0.0');
  });

  it('keeps 0.x minors for --level major', () => {
    const zero = pkg(['0.3.1', '0.3.9', '0.4.0']);
    expect(pickVersion(zero, '0.3.1', 'minor')).toBe('0.3.9');
    expect(pickVersion(zero, '0.3.1', 'major')).toBe('0.4.0');
  });
});

describe('planUpdates', () => {
  it('updates every package.json in its range style and leaves ours, odd ranges and unknowns alone', () => {
    const p = plan(
      [
        entry('eslint', '^10.0.0'),
        entry('vite', '^8.3.5'),
        entry('react', '~19.0.0', 'frontend/admin', 'dependencies'),
        entry('zod', '4.1.0', 'packages/shared/zod', 'dependencies'),
        entry('vite', '^8.3.4', 'packages/frontend/styles'),
        entry('vite', '^8.3.4', 'packages/frontend/styles', 'peerDependencies'),
        entry('@beautinique/shared-utils', '^1.0.0', 'frontend/admin', 'dependencies'),
        entry('odd', '>=1 <3', 'frontend/admin'),
        entry('ghost', '^1.0.0'),
      ],
      {
        eslint: pkg(['10.0.0', '10.5.0']),
        vite: pkg(['8.3.4', '8.3.5', '8.4.0']),
        react: pkg(['19.0.0', '19.0.4', '19.1.0']),
        zod: pkg(['4.1.0', '4.2.0']),
        ghost: null,
      },
      'major',
      ['@beautinique/shared-utils'],
    );
    expect(summary(p)).toEqual([
      '. devDependencies eslint ^10.5.0',
      'frontend/admin dependencies react ~19.1.0',
      '. devDependencies vite ^8.4.0',
      'packages/frontend/styles devDependencies vite ^8.4.0',
      'packages/frontend/styles peerDependencies vite ^8.4.0',
      'packages/shared/zod dependencies zod 4.2.0',
    ]);
    expect(p.changes.find((c) => c.entry.name === 'react')?.kind).toBe('minor');
    expect(p.notes).toEqual([
      'odd ">=1 <3" (frontend/admin): not a plain version range, left alone',
      'ghost: not on the npm registry, left alone',
    ]);
  });

  it('never touches a held dependency, and says when the hold can go', () => {
    const entries = [entry('typescript', '~6.0.3'), entry('typescript-eslint', '^8.0.0')];
    const typescript = pkg(['6.0.3', '6.0.4', '7.0.0']);
    const blocked = plan(entries, {
      typescript,
      'typescript-eslint': pkg(['8.0.0'], {
        details: { '8.0.0': { peerDependencies: { typescript: '>=4.8.4 <6.1.0' } } },
      }),
    });
    expect(blocked.changes).toEqual([]);
    expect(blocked.notes).toEqual([
      'typescript: held (typescript-eslint does not support a newer TypeScript yet); 7.0.0 is out, but typescript-eslint 8.0.0 wants >=4.8.4 <6.1.0',
    ]);

    const free = plan(entries, {
      typescript,
      'typescript-eslint': pkg(['8.0.0', '9.0.0'], {
        details: { '9.0.0': { peerDependencies: { typescript: '>=4.8.4 <8' } } },
      }),
    });
    expect(summary(free)).toEqual(['. devDependencies typescript-eslint ^9.0.0']);
    expect(free.notes[0]).toContain(
      '7.0.0 is out and every package that has it as a peer accepts it',
    );
  });

  it('holds a peer back when a dependent does not accept its new major yet', () => {
    const p = plan([entry('eslint', '^10.0.0'), entry('typescript-eslint', '^8.0.0')], {
      eslint: pkg(['10.0.0', '10.5.0', '11.0.0']),
      'typescript-eslint': pkg(['8.0.0', '8.1.0'], {
        details: {
          '8.0.0': { peerDependencies: { eslint: '^9.0.0 || ^10.0.0' } },
          '8.1.0': { peerDependencies: { eslint: '^9.0.0 || ^10.0.0' } },
        },
      }),
    });
    expect(summary(p)).toEqual([
      '. devDependencies eslint ^10.5.0',
      '. devDependencies typescript-eslint ^8.1.0',
    ]);
    expect(p.notes).toEqual([
      'eslint: 11.0.0 is out, staying at 10.5.0 (typescript-eslint 8.1.0 wants eslint ^9.0.0 || ^10.0.0)',
    ]);
  });

  it('holds a dependent back when its new version wants a peer that cannot move', () => {
    const p = plan([entry('typescript', '~6.0.3'), entry('tsdown', '^0.20.0')], {
      typescript: pkg(['6.0.3', '7.0.0']),
      tsdown: pkg(['0.20.0', '0.21.0', '0.22.0'], {
        details: {
          '0.20.0': { peerDependencies: { typescript: '^6.0.0' } },
          '0.21.0': { peerDependencies: { typescript: '^6.0.0' } },
          '0.22.0': { peerDependencies: { typescript: '^7.0.0' } },
        },
      }),
    });
    expect(summary(p)).toEqual(['. devDependencies tsdown ^0.21.0']);
    expect(p.notes).toContain(
      'tsdown: 0.22.0 is out, staying at 0.21.0 (0.22.0 wants typescript ^7.0.0, and typescript stays at 6.0.3)',
    );
  });

  it('still updates when the conflict is already in the repo', () => {
    const p = plan([entry('react', '^19.0.0'), entry('old-plugin', '^1.0.0')], {
      react: pkg(['19.0.0']),
      'old-plugin': pkg(['1.0.0', '1.1.0'], {
        details: {
          '1.0.0': { peerDependencies: { react: '^18.0.0' } },
          '1.1.0': { peerDependencies: { react: '^18.0.0' } },
        },
      }),
    });
    expect(summary(p)).toEqual(['. devDependencies old-plugin ^1.1.0']);
  });

  it('stays inside the level and lists what is outside it', () => {
    const registry = { eslint: pkg(['10.0.0', '10.0.1', '10.5.0', '11.0.0']) };
    expect(summary(plan([entry('eslint', '^10.0.0')], registry, 'patch'))).toEqual([
      '. devDependencies eslint ^10.0.1',
    ]);
    const minor = plan([entry('eslint', '^10.0.0')], registry, 'minor');
    expect(summary(minor)).toEqual(['. devDependencies eslint ^10.5.0']);
    expect(minor.outsideLevel).toEqual(['eslint 11.0.0']);
    expect(plan([entry('eslint', '^10.0.0')], registry, 'major').outsideLevel).toEqual([]);
  });

  it('moves a package.json that starts lower within its own level', () => {
    const p = plan(
      [entry('lodash', '^4.17.0'), entry('lodash', '^3.10.0', 'frontend/admin')],
      { lodash: pkg(['3.10.0', '3.10.1', '4.17.0', '4.17.21']) },
      'minor',
    );
    expect(summary(p)).toEqual([
      '. devDependencies lodash ^4.17.21',
      'frontend/admin devDependencies lodash ^3.10.1',
    ]);
  });

  it('starts from the installed version, so it never downgrades', () => {
    const react = pkg(['19.0.0', '19.0.6', '19.3.1', '19.3.2', '19.4.0']);
    const installed = (version: string) => ({ ...entry('react', '^19.0.0'), installed: version });
    const patch = plan([installed('19.3.1')], { react }, 'patch');
    expect(summary(patch)).toEqual(['. devDependencies react ^19.3.2']);
    expect(patch.changes[0]).toMatchObject({ from: '19.3.1', to: '19.3.2', kind: 'patch' });
    // nothing newer than what is installed: the range only catches up (never ^19.0.6, a downgrade)
    const caughtUp = plan([installed('19.4.0')], { react }, 'patch');
    expect(summary(caughtUp)).toEqual(['. devDependencies react ^19.4.0']);
    expect(caughtUp.changes[0]?.kind).toBe('range');
    // a range that already says what is installed: nothing to do
    expect(
      plan([{ ...installed('19.4.0'), range: '^19.4.0' }], { react }, 'patch').changes,
    ).toEqual([]);
    // an installed version outside the range (a stale lockfile) does not count
    expect(summary(plan([installed('18.0.0')], { react }, 'patch'))).toEqual([
      '. devDependencies react ^19.0.6',
    ]);
  });
});

describe('parseUpdateDepsFlags', () => {
  it('defaults to major and takes --level, --dry-run and --yes', () => {
    expect(parseUpdateDepsFlags([], {})).toEqual({
      help: false,
      yes: false,
      dryRun: false,
      level: 'major',
    });
    expect(parseUpdateDepsFlags(['--level', 'patch', '--dry-run', '-y'], {})).toMatchObject({
      level: 'patch',
      dryRun: true,
      yes: true,
    });
  });

  it('honours npm --dry-run without --, and refuses anything else', () => {
    expect(parseUpdateDepsFlags([], { npm_config_dry_run: 'true' }).dryRun).toBe(true);
    expect(parseUpdateDepsFlags([], { npm_config_level: 'minor' }).level).toBe('major');
    expect(() => parseUpdateDepsFlags(['--level', 'huge'], {})).toThrow(/--level must be/);
    expect(() => parseUpdateDepsFlags(['minor'], {})).toThrow(/Unexpected argument/);
  });
});

describe('npm run update-deps', () => {
  const REGISTRY = {
    vite: pkg(['8.3.4', '8.3.5', '8.4.0']),
    eslint: pkg(['10.0.0', '10.5.0']),
  };
  const fixture = () => {
    const r = repo([
      publicPackage('frontend', 'styles', '1.0.0', {
        devDependencies: { vite: '^8.3.4' },
        peerDependencies: { vite: '^8.3.4' },
      }),
      privatePackage('frontend/admin', 'admin', {
        dependencies: { '@beautinique/frontend-styles': '^1.0.0' },
        devDependencies: { vite: '^8.3.4', eslint: '^10.0.0' },
      }),
    ]);
    const root = JSON.parse(readFileSync(join(r.root, 'package.json'), 'utf8')) as object;
    r.write(
      'package.json',
      `${JSON.stringify({ ...root, devDependencies: { eslint: '^10.0.0' } }, null, 2)}\n`,
    );
    r.write('package-lock.json', '{"lockfileVersion":3}\n');
    return r;
  };
  const files = [
    'package.json',
    'packages/frontend/styles/package.json',
    'frontend/admin/package.json',
  ];
  const read = (root: string) =>
    Object.fromEntries(
      [...files, 'package-lock.json'].map((f) => [f, readFileSync(join(root, f), 'utf8')]),
    );

  it('dry run: shows the plan, changes nothing, runs no npm', async () => {
    const r = fixture();
    const before = read(r.root);
    const ctx = testContext(r.root, { registry: REGISTRY });
    const result = await updateDepsCommand(ctx, { level: 'major', dryRun: true, node: '24.11.0' });
    expect(result.changes).toHaveLength(5);
    expect(read(r.root)).toEqual(before);
    expect(ctx.calls).toEqual([]);
    expect(ctx.log.text()).toContain('frontend/admin, packages/frontend/styles (+ peer)');
    expect(ctx.log.text()).toContain('Dry run: nothing was changed.');
  });

  it('installs the exact versions first, then writes the ranges back in their own style', async () => {
    const r = fixture();
    const seen: string[] = [];
    const ctx = testContext(r.root, {
      registry: REGISTRY,
      answers: [true],
      respond: (call) => {
        if (call.args[0] === 'install') {
          const styles = readFileSync(
            join(r.root, 'packages/frontend/styles/package.json'),
            'utf8',
          );
          const parsed = JSON.parse(styles) as { devDependencies: Record<string, string> };
          seen.push(parsed.devDependencies.vite ?? '');
        }
        return undefined;
      },
    });
    await updateDepsCommand(ctx, { level: 'major', dryRun: false, node: '24.11.0' });
    expect(seen).toEqual(['8.4.0', '^8.4.0']);
    expect(ctx.prompt.asked).toEqual(['Write these to 3 package.json files and run npm install?']);
    const styles = readFileSync(join(r.root, 'packages/frontend/styles/package.json'), 'utf8');
    expect(styles).toContain('"vite": "^8.4.0"');
    expect(styles.endsWith('}\n')).toBe(true);
    const parsed = JSON.parse(styles) as Record<string, Record<string, string>>;
    expect(parsed.peerDependencies).toEqual(parsed.devDependencies);
    const admin = JSON.parse(
      readFileSync(join(r.root, 'frontend/admin/package.json'), 'utf8'),
    ) as Record<string, Record<string, string>>;
    expect(admin.dependencies).toEqual({ '@beautinique/frontend-styles': '^1.0.0' });
    expect(admin.devDependencies).toEqual({ vite: '^8.4.0', eslint: '^10.5.0' });
    expect(ctx.log.text()).toContain('Updated 2 dependencies in 3 package.json files.');
  });

  it.each([1, 2])('puts every file back when npm install number %i fails', async (failing) => {
    const r = fixture();
    const before = read(r.root);
    let installs = 0;
    const ctx = testContext(r.root, {
      registry: REGISTRY,
      answers: [true],
      respond: (call) => {
        if (call.args[0] !== 'install') return undefined;
        installs += 1;
        writeFileSync(join(r.root, 'package-lock.json'), '{"changed":true}\n');
        return installs === failing ? { code: 1 } : undefined;
      },
    });
    await expect(
      updateDepsCommand(ctx, { level: 'major', dryRun: false, node: '24.11.0' }),
    ).rejects.toMatchObject({ code: 'INSTALL_FAILED' });
    expect(installs).toBe(failing);
    expect(read(r.root)).toEqual(before);
    expect(ctx.log.text()).toContain('is back as it was');
  });

  it('changes nothing on "no", and asks nothing when all is up to date', async () => {
    const r = fixture();
    const before = read(r.root);
    const no = testContext(r.root, { registry: REGISTRY, answers: [false] });
    await expect(
      updateDepsCommand(no, { level: 'major', dryRun: false, node: '24.11.0' }),
    ).rejects.toMatchObject({ code: 'CANCELLED' });
    expect(read(r.root)).toEqual(before);
    expect(no.calls).toEqual([]);

    const current = testContext(r.root, {
      registry: { vite: pkg(['8.3.4']), eslint: pkg(['10.0.0']) },
    });
    await updateDepsCommand(current, { level: 'major', dryRun: false, node: '24.11.0' });
    expect(current.prompt.asked).toEqual([]);
    expect(current.calls).toEqual([]);
    expect(current.log.text()).toContain('Every dependency is up to date for --level major.');
  });
});

describe('lockMismatches', () => {
  it('reports installed versions that differ from the plan, nested ones first', () => {
    const r = repo([]);
    r.write(
      'package-lock.json',
      JSON.stringify({
        packages: {
          'node_modules/vite': { version: '8.4.0' },
          'frontend/admin/node_modules/vite': { version: '8.3.9' },
          'node_modules/eslint': { version: '10.5.0' },
        },
      }),
    );
    const change = (name: string, where: string, to: string) => ({
      entry: entry(name, '^1.0.0', where),
      from: '1.0.0',
      to,
      range: `^${to}`,
      kind: 'major' as const,
    });
    expect(
      lockMismatches(r.root, [
        change('vite', '.', '8.4.0'),
        change('vite', 'frontend/admin', '8.4.0'),
        change('eslint', 'frontend/admin', '10.6.0'),
      ]),
    ).toEqual([
      'vite in frontend/admin: 8.3.9 instead of 8.4.0',
      'eslint in frontend/admin: 10.5.0 instead of 10.6.0',
    ]);
    expect(lockMismatches(repo([]).root, [change('vite', '.', '8.4.0')])).toEqual([]);
    const conflicted = repo([]);
    conflicted.write('package-lock.json', '{\n<<<<<<< HEAD\n');
    expect(() => lockMismatches(conflicted.root, [])).toThrow(
      expect.objectContaining({ code: 'BAD_LOCKFILE' }),
    );
  });
});
