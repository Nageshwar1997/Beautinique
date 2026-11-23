import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { CliError } from '../src/cli-error.ts';
import { buildOrder, discoverPackages, resolvePackage } from '../src/workspace.ts';
import { fixtureRepo } from './utils/fixture-repo.ts';

function failure(run: () => unknown): CliError {
  try {
    run();
  } catch (error) {
    return error as CliError;
  }
  throw new Error('Expected a failure.');
}

const names = (list: { name: string }[]) => list.map((pkg) => pkg.name);

describe('discoverPackages', () => {
  it('finds packages in every category with only their own packages as internal deps', () => {
    const root = fixtureRepo({
      'shared/money': ['@beautinique/shared-ids', 'zod'],
      'shared/ids': [],
      'frontend/ui': ['@beautinique/shared-money'],
    });
    const found = discoverPackages(root);
    expect(names(found)).toEqual([
      '@beautinique/frontend-ui',
      '@beautinique/shared-ids',
      '@beautinique/shared-money',
    ]);
    expect(found.find((pkg) => pkg.name.endsWith('shared-money'))?.internalDeps).toEqual([
      '@beautinique/shared-ids',
    ]);
  });

  it('returns nothing before the first package exists', () => {
    expect(discoverPackages(fixtureRepo({}))).toEqual([]);
  });

  it('stops on a package.json that is not JSON', () => {
    const root = fixtureRepo({});
    const dir = join(root, 'packages', 'shared', 'broken');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'package.json'), '{ nope');
    expect(() => discoverPackages(root)).toThrow(
      expect.objectContaining({ code: 'PACKAGE_JSON_UNREADABLE' }),
    );
  });

  it('stops on a package outside the @beautinique scope', () => {
    const root = fixtureRepo({});
    const dir = join(root, 'packages', 'shared', 'odd');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'odd' }));
    expect(() => discoverPackages(root)).toThrow(
      expect.objectContaining({ code: 'PACKAGE_NAME_INVALID' }),
    );
  });
});

describe('resolvePackage', () => {
  const all = discoverPackages(fixtureRepo({ 'shared/money': [] }));

  it('takes the full name or the short one', () => {
    expect(resolvePackage(all, '@beautinique/shared-money').name).toBe('@beautinique/shared-money');
    expect(resolvePackage(all, 'shared-money').name).toBe('@beautinique/shared-money');
  });

  it('names the packages that do exist when the name is wrong', () => {
    const error = failure(() => resolvePackage(all, 'shared-nope'));
    expect(error.code).toBe('PACKAGE_UNKNOWN');
    expect(error.hint).toContain('@beautinique/shared-money');
  });
});

describe('buildOrder', () => {
  it('AC-PACKAGES-4: builds the packages a package needs before it', () => {
    const all = discoverPackages(
      fixtureRepo({
        'frontend/ui': ['@beautinique/shared-money'],
        'shared/money': ['@beautinique/shared-ids'],
        'shared/ids': [],
      }),
    );
    expect(names(buildOrder(all))).toEqual([
      '@beautinique/shared-ids',
      '@beautinique/shared-money',
      '@beautinique/frontend-ui',
    ]);
  });

  it('builds a chosen package with what it needs and nothing else', () => {
    const all = discoverPackages(
      fixtureRepo({
        'shared/money': ['@beautinique/shared-ids'],
        'shared/ids': [],
        'shared/x': [],
      }),
    );
    const money = resolvePackage(all, 'shared-money');
    expect(names(buildOrder(all, [money]))).toEqual([
      '@beautinique/shared-ids',
      '@beautinique/shared-money',
    ]);
  });

  it('AC-PACKAGES-4: stops on a circle and names the packages in it', () => {
    const all = discoverPackages(
      fixtureRepo({
        'shared/a': ['@beautinique/shared-b'],
        'shared/b': ['@beautinique/shared-c'],
        'shared/c': ['@beautinique/shared-a'],
      }),
    );
    expect(() => buildOrder(all)).toThrow(
      /@beautinique\/shared-a -> @beautinique\/shared-b -> @beautinique\/shared-c -> @beautinique\/shared-a/,
    );
  });
});
