// Tests of the secret scan (AC-FOUNDATION-5): a commit with a secret fails the scan, and the secret
// never reaches the log. CI's guard job runs them with its pinned gitleaks before the real scan:
// GITLEAKS=<path to gitleaks> node --test .github/scripts/secret-scan.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const GITLEAKS = process.env.GITLEAKS ?? 'gitleaks';
const CONFIG = fileURLToPath(new URL('../../.gitleaks.toml', import.meta.url));

const repos = [];
after(() => {
  for (const repo of repos) rmSync(repo, { recursive: true, force: true });
});

// A throwaway repository with one commit of `content`. The identity is the commit's own, given on
// the command line, so no git config anywhere changes.
function repoWith(content) {
  const repo = mkdtempSync(join(tmpdir(), 'bq-secret-scan-'));
  repos.push(repo);
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: repo, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  };
  git('init', '--quiet');
  writeFileSync(join(repo, 'config.ts'), content);
  git('add', 'config.ts');
  git(
    '-c',
    'user.name=Scan Test',
    '-c',
    'user.email=scan-test@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'test',
  );
  return repo;
}

function scan(repo) {
  const result = spawnSync(
    GITLEAKS,
    ['git', '--config', CONFIG, '--redact', '--verbose', '--no-banner', '--exit-code', '1', repo],
    { encoding: 'utf8' },
  );
  assert.notEqual(result.error?.code, 'ENOENT', `gitleaks not found at ${GITLEAKS}`);
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

describe('secret scan (.gitleaks.toml)', () => {
  it('AC-FOUNDATION-5: a committed connection URL with a password fails, and the password stays out of the log', () => {
    // Made at run time, so the repository's own scan never sees a secret in this file.
    const password = randomBytes(18).toString('base64url');
    const repo = repoWith(
      `export const uri = 'mongodb://app:${password}@cluster0.example.net/shop';\n`,
    );
    const { status, output } = scan(repo);
    assert.equal(status, 1, output);
    assert.match(output, /url-with-password/);
    assert.ok(!output.includes(password), 'the secret must be redacted in the log');
  });

  it('a placeholder password is not a secret', () => {
    const repo = repoWith(
      "export const uri = 'mongodb://app:<password>@cluster0.example.net/shop';\n",
    );
    const { status, output } = scan(repo);
    assert.equal(status, 0, output);
  });
});
