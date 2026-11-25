import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { containsSecret, packedPathProblems } from '../src/pack.ts';
import { staticProblems, verify } from '../src/verify.ts';
import { discoverPackages } from '../src/workspace.ts';
import {
  addPackage,
  fakeExec,
  fixtureRepo,
  recordingLogger,
  writeText,
} from './utils/fixture-repo.ts';

const rulesOf = (root: string) => staticProblems(root).map((problem) => problem.rule);

function edit(dir: string, change: (manifest: Record<string, unknown>) => void): void {
  const path = join(dir, 'package.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  change(manifest);
  writeFileSync(path, JSON.stringify(manifest, null, 2));
}

describe('package rules', () => {
  it('a package made by the template breaks no rule', () => {
    const root = fixtureRepo({
      'shared/money': [],
      'frontend/button': ['@beautinique/shared-money'],
    });
    expect(staticProblems(root)).toEqual([]);
  });

  it('AC-PACKAGES-2: a README without a "Visibility" section fails with CR-36', () => {
    const root = fixtureRepo();
    const dir = addPackage(root, 'shared', 'money');
    writeText(dir, 'README.md', '# money\n\n## Install\n');
    expect(staticProblems(root)).toEqual([
      expect.objectContaining({ package: '@beautinique/shared-money', rule: 'CR-36' }),
    ]);
  });

  it('AC-PACKAGES-2: "private": true fails with CR-36', () => {
    const root = fixtureRepo();
    edit(addPackage(root, 'shared', 'money'), (m) => {
      m.private = true;
    });
    expect(rulesOf(root)).toEqual(['CR-36']);
  });

  it('AC-PACKAGES-2: a frontend package without a Tailwind import, or without a playground, fails', () => {
    const root = fixtureRepo();
    const dir = addPackage(root, 'frontend', 'button');
    writeText(dir, 'playground/styles.css', 'body {}\n');
    expect(rulesOf(root)).toEqual(['CR-33']);
    rmSync(join(dir, 'playground'), { recursive: true });
    expect(rulesOf(root)).toContain('CR-34');
  });

  it('AC-PACKAGES-2: a playground must import the tailwind.css of the frontend packages it shows (CR-33)', () => {
    const root = fixtureRepo({ 'frontend/button': [] });
    const dir = addPackage(root, 'frontend', 'form', ['@beautinique/frontend-button']);
    expect(staticProblems(root)).toEqual([
      expect.objectContaining({
        rule: 'CR-33',
        message: expect.stringContaining('frontend-button/tailwind.css') as string,
      }),
    ]);
    writeText(
      dir,
      'playground/styles.css',
      "@import 'tailwindcss';\n@import '@beautinique/frontend-button/tailwind.css';\n@source '../src';\n",
    );
    expect(staticProblems(root)).toEqual([]);
  });

  it('AC-PACKAGES-2: a peer dependency with another range in devDependencies fails with CR-35', () => {
    const root = fixtureRepo();
    edit(addPackage(root, 'frontend', 'button'), (m) => {
      (m.devDependencies as Record<string, string>).react = '^18.0.0';
    });
    expect(rulesOf(root)).toEqual(['CR-35']);
  });

  it('a wrong publishConfig, repository, files entry or exports fails', () => {
    const root = fixtureRepo();
    edit(addPackage(root, 'shared', 'money'), (m) => {
      m.publishConfig = { access: 'restricted' };
      m.repository = { type: 'git', url: 'x', directory: 'elsewhere' };
      m.files = ['dist', 'src'];
      m.exports = { '.': './dist/index.mjs' };
    });
    expect(rulesOf(root)).toEqual(['files', 'exports', 'publishConfig', 'repository']);
  });
});

describe('what goes into the tarball', () => {
  const firstPackage = (root: string) => {
    const [pkg] = discoverPackages(root);
    if (!pkg) throw new Error('no package');
    return pkg;
  };

  it('AC-PACKAGES-3: only the files allowlist passes', () => {
    const root = fixtureRepo({ 'shared/money': [] });
    const ok = ['package.json', 'README.md', 'CHANGELOG.md', 'LICENSE', 'dist/index.mjs'];
    expect(packedPathProblems(firstPackage(root), ok)).toEqual([]);
    expect(packedPathProblems(firstPackage(root), ['src/index.ts'])).toEqual([
      expect.objectContaining({
        rule: 'DD-7',
        message: expect.stringContaining('allowlist') as string,
      }),
    ]);
  });

  it('AC-PACKAGES-3: a test file or a secret-looking file in dist fails', () => {
    const root = fixtureRepo({ 'shared/money': [] });
    const problems = packedPathProblems(firstPackage(root), [
      'dist/index.test.js',
      'dist/server.pem',
      'dist/.env',
    ]);
    expect(problems.map((p) => p.message)).toEqual([
      'dist/index.test.js is a test file',
      'dist/server.pem looks like a secret',
      'dist/.env looks like a secret',
    ]);
  });

  it('AC-PACKAGES-3: a secret inside a packed file fails', () => {
    const root = fixtureRepo();
    const dir = addPackage(root, 'shared', 'money');
    writeText(dir, 'dist/index.mjs', `const key = "AKIA${'A'.repeat(16)}";\n`);
    expect(packedPathProblems(firstPackage(root), ['dist/index.mjs'])).toEqual([
      expect.objectContaining({ message: 'dist/index.mjs contains a secret' }),
    ]);
  });

  // Made at run time, so the secret scan of this repository never sees a secret-shaped literal.
  const password = 'x'.repeat(12);
  const projectSecrets: [label: string, text: string][] = [
    ['MongoDB URL', `${['mongodb+srv://bq', password].join(':')}@cluster0.example.net/app`],
    ['Valkey URL', `${['rediss://default', password].join(':')}@red-x.example.com:6379`],
    ['Postgres URL', `${['postgresql://bq', password].join(':')}@db.example.com/finance`],
    ['Cloudinary URL', `${['cloudinary://123456789012345', password].join(':')}@bq`],
    ['Razorpay key', ['rzp', 'live', 'A'.repeat(14)].join('_')],
    ['npm auth token', ['//registry.npmjs.org/:_auth', 'Token=', 'b'.repeat(36)].join('')],
  ];

  it.each(projectSecrets)(
    'AC-PACKAGES-3: a %s inside a packed file fails (QA-PKG-002)',
    (_label, text) => {
      expect(containsSecret(`export const v = ${JSON.stringify(text)};\n`)).toBe(true);
    },
  );

  it('AC-PACKAGES-3: placeholders in a connection URL or an npm token line are not secrets', () => {
    for (const secret of ['<password>', '${MONGO_PASSWORD}', '{{password}}', '****']) {
      expect(containsSecret(`${['mongodb://bq', secret].join(':')}@localhost:27017/app`)).toBe(
        false,
      );
    }
    for (const value of [
      '${NPM_TOKEN}',
      '"${NPM_TOKEN}"',
      '<your-token>',
      '<your npm token>',
      "'****'",
      '""',
    ]) {
      const tokenLine = ['//registry.npmjs.org/:_auth', 'Token=', value].join('');
      expect(containsSecret(tokenLine), value).toBe(false);
    }
    // A quoted real value is still a secret.
    const quoted = ['//registry.npmjs.org/:_auth', 'Token="', 'b'.repeat(36), '"'].join('');
    expect(containsSecret(quoted)).toBe(true);
    expect(containsSecret('see mongodb://localhost:27017/app')).toBe(false);
  });

  it('AC-PACKAGES-3: an .npmrc in dist looks like a secret', () => {
    const root = fixtureRepo({ 'shared/money': [] });
    expect(packedPathProblems(firstPackage(root), ['dist/.npmrc']).map((p) => p.message)).toEqual([
      'dist/.npmrc looks like a secret',
    ]);
  });

  it('AC-PACKAGES-3: an .env file in the package folder fails even if it is not packed', () => {
    const root = fixtureRepo();
    const dir = addPackage(root, 'shared', 'money');
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeText(dir, 'src/.env.local', 'X=1\n');
    writeText(dir, '.env.example', 'X=\n');
    expect(packedPathProblems(firstPackage(root), ['package.json']).map((p) => p.message)).toEqual([
      'src/.env.local is an env file inside the package',
    ]);
  });
});

describe('verify', () => {
  it('runs build, typecheck, lint and tests through Turborepo, checks the tarball and passes', () => {
    const root = fixtureRepo({ 'shared/money': [] });
    const { exec, calls } = fakeExec(root);
    const { log, out } = recordingLogger();
    expect(verify({ root, names: [], log, exec })).toBe(0);
    expect(calls[0]).toMatchObject({
      command: 'turbo',
      args: ['run', 'build', 'typecheck', 'lint', 'test', '--filter=./packages/*/*'],
    });
    expect(calls[1]).toMatchObject({
      command: 'npm',
      args: expect.arrayContaining(['pack', '--dry-run']) as string[],
    });
    expect(out.at(-1)).toContain('Verified 1 package(s): @beautinique/shared-money');
  });

  it('lists every problem with its rule and fails', () => {
    const root = fixtureRepo();
    const dir = addPackage(root, 'shared', 'money');
    edit(dir, (m) => {
      m.private = true;
    });
    writeText(dir, 'README.md', '# money\n');
    const { exec } = fakeExec(root);
    const { log } = recordingLogger();
    expect(() => verify({ root, names: [], log, exec })).toThrow(
      expect.objectContaining({
        code: 'VERIFY_FAILED',
        message: expect.stringMatching(/\[CR-36\].*\n.*\[CR-36\]/s) as string,
      }),
    );
  });

  it('fails when an exports target is missing after the build', () => {
    const root = fixtureRepo({ 'shared/money': [] });
    const { exec } = fakeExec(root, (call) =>
      call.command === 'turbo' ? { status: 0 } : undefined,
    );
    const { log } = recordingLogger();
    expect(() => verify({ root, names: [], log, exec })).toThrow(/does not exist after the build/);
  });

  it('stops when the build, typecheck, lint or tests fail', () => {
    const root = fixtureRepo({ 'shared/money': [] });
    const { exec } = fakeExec(root, (call) =>
      call.command === 'turbo' ? { status: 3 } : undefined,
    );
    const { log } = recordingLogger();
    expect(() => verify({ root, names: [], log, exec })).toThrow(
      expect.objectContaining({ code: 'VERIFY_CHECKS_FAILED' }),
    );
  });

  it('says so when there is nothing to verify', () => {
    const root = fixtureRepo();
    const { log, out } = recordingLogger();
    expect(verify({ root, names: [], log, exec: fakeExec(root).exec })).toBe(0);
    expect(out).toEqual(['No packages to verify yet.']);
  });
});
