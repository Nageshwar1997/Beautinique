// Every action a workflow uses is pinned to a full commit SHA, with its version beside it as a
// comment (QA Q-015): a tag that moves cannot change what runs, the release job's `id-token: write`
// included. Dependabot (`.github/dependabot.yml`, github-actions) moves the SHA and the comment
// together when a new version comes, as a PR to the development branch.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const github = join(import.meta.dirname, '../../../.github');
const workflows = readdirSync(join(github, 'workflows'))
  .filter((file) => /\.ya?ml$/.test(file))
  .sort();

/** What each `uses:` of a workflow names, comment included. */
const usesOf = (file: string) =>
  readFileSync(join(github, 'workflows', file), 'utf8')
    .split('\n')
    .map((line) => /^\s*(?:- )?uses:\s*(.+?)\s*$/.exec(line)?.[1])
    .filter((use) => use !== undefined);

describe('the actions the workflows use', () => {
  it('are found in ci.yml and release.yml', () => {
    expect(workflows).toEqual(expect.arrayContaining(['ci.yml', 'release.yml']));
    expect(usesOf('ci.yml').length).toBeGreaterThan(0);
    expect(usesOf('release.yml').length).toBeGreaterThan(0);
  });

  it.each(workflows)('%s: each one at a commit SHA, with its version beside it', (file) => {
    for (const use of usesOf(file)) {
      expect(use, file).toMatch(/^[\w.-]+\/[\w./-]+@[0-9a-f]{40} # v\d+\.\d+\.\d+$/);
    }
  });

  it('are kept up to date by Dependabot, on the development branch', () => {
    const config = readFileSync(join(github, 'dependabot.yml'), 'utf8');
    expect(config).toMatch(/package-ecosystem: github-actions/);
    expect(config).toMatch(/target-branch: prerelease/);
  });
});
