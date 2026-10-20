// Publish job of the Release workflow: publishes the tarballs the build job packed, in the order of
// release.json (dependencies first), with npm trusted publishing (npm adds provenance itself).
//
// Dependency-free on purpose: this job holds the OIDC identity, so it installs nothing and runs no
// package code. A version that is already on npm is skipped, so a failed run can simply be re-run.
//
// Usage: node .github/scripts/publish-tarballs.mjs <dir>
// The registry is npm_config_registry when set (tests), else https://registry.npmjs.org/.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const SCOPE = '@beautinique/';
const NAME = /^@beautinique\/[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const VERSION = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const TAG = /^[a-z][a-z0-9-]*$/;
const FILE = /^[A-Za-z0-9._-]+\.tgz$/;

const registry = (process.env.npm_config_registry || 'https://registry.npmjs.org/').replace(
  /\/?$/,
  '/',
);

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

/** npm's JS entry next to this Node.js, so npm runs without a shell. */
function npmCli() {
  const nodeDir = dirname(process.execPath);
  const found = [
    join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    join(nodeDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ].find((c) => existsSync(c));
  if (!found) {
    fail('Could not find the npm CLI next to this Node.js.');
  }
  return found;
}

function readEntries(dir) {
  const file = join(dir, 'release.json');
  if (!existsSync(file)) {
    fail(`${file} is missing; the build job packs it.`);
  }
  const entries = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(entries) || entries.length === 0) {
    fail('release.json lists no packages.');
  }
  for (const e of entries) {
    const ok =
      e &&
      typeof e.name === 'string' &&
      NAME.test(e.name) &&
      typeof e.version === 'string' &&
      VERSION.test(e.version) &&
      typeof e.tag === 'string' &&
      TAG.test(e.tag) &&
      typeof e.file === 'string' &&
      FILE.test(e.file);
    if (!ok) {
      fail(`release.json has an invalid entry: ${JSON.stringify(e)}`);
    }
    if (!existsSync(join(dir, e.file))) {
      fail(`${e.file} is missing from ${dir}.`);
    }
  }
  return entries;
}

/** true when the version is on the registry (fresh read, no cache). */
async function isPublished(name, version) {
  const url = `${registry}${SCOPE.replace('/', '%2f')}${name.slice(SCOPE.length)}`;
  for (let attempt = 1; ; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/vnd.npm.install-v1+json', 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(15_000),
      });
      if (res.status === 404) {
        return false;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const doc = await res.json();
      return Boolean(doc.versions && doc.versions[version]);
    } catch (error) {
      if (attempt === 3) {
        fail(`Could not read ${name} from the registry: ${error.message}`);
      }
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }
}

const dir = process.argv[2];
if (!dir) {
  fail('Usage: node .github/scripts/publish-tarballs.mjs <dir>');
}
const root = resolve(dir);
const entries = readEntries(root);
const cli = npmCli();
let published = 0;

for (const { name, version, tag, file } of entries) {
  if (await isPublished(name, version)) {
    console.log(`${name}@${version} is already on npm; skipped.`);
    continue;
  }
  console.log(`Publishing ${name}@${version} (${tag})`);
  const res = spawnSync(
    process.execPath,
    [cli, 'publish', join(root, file), '--access', 'public', '--tag', tag, '--registry', registry],
    { stdio: 'inherit' },
  );
  if (res.status !== 0) {
    // A re-run may race an earlier attempt that did get through.
    if (await isPublished(name, version)) {
      console.log(`${name}@${version} is on npm after all; continuing.`);
      continue;
    }
    fail(
      `npm publish failed for ${name}@${version}; nothing after it was published. Re-run the workflow.`,
    );
  }
  published += 1;
}

console.log(`Done: ${published} published, ${entries.length - published} already on npm.`);
