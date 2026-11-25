import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, test } from 'vitest';

import { sshCommand, sshEnv, windowsOpenSsh } from '../src/ssh.ts';

const OPENSSH_DIR = 'C:\\Windows\\System32\\OpenSSH';
const OPENSSH_EXE = `${OPENSSH_DIR}\\ssh.exe`;
const GIT_BIN = 'C:\\Program Files\\Git\\usr\\bin';
const SYSTEM32 = 'C:\\Windows\\system32';

// The "does this file exist" check of a laptop with, or without, the Windows OpenSSH client.
const installed = (path: string): boolean => path === OPENSSH_EXE;
const missing = (): boolean => false;

// What Git Bash hands to npm on Windows: Git's ssh comes before the system folders.
const gitBashPath = [GIT_BIN, SYSTEM32, OPENSSH_DIR, 'C:\\Windows'].join(';');

describe('AC-FOUNDATION-12: docker and the SSH tunnel use Windows OpenSSH on Windows', () => {
  test('on Windows, Windows OpenSSH goes first in PATH, once, and the rest keeps its order', () => {
    const env = { Path: gitBashPath, SystemRoot: 'C:\\Windows' };
    const result = sshEnv(env, 'win32', installed);
    assert.equal(result.Path, [OPENSSH_DIR, GIT_BIN, SYSTEM32, 'C:\\Windows'].join(';'));
    assert.equal(result.Path.split(';').filter((entry) => entry === OPENSSH_DIR).length, 1);
  });

  test('the PATH key keeps the spelling it has: a plain copy of the Windows env has Path, not PATH', () => {
    const expected = `${OPENSSH_DIR};${GIT_BIN}`;
    for (const key of ['Path', 'PATH', 'pAtH']) {
      const result = sshEnv({ [key]: GIT_BIN, SystemRoot: 'C:\\Windows' }, 'win32', installed);
      assert.deepEqual(Object.keys(result).sort(), [key, 'SystemRoot'].sort(), key);
      assert.equal(result[key], expected, key);
    }
  });

  test('the env it was given is never changed, and every other variable is kept', () => {
    const env = { Path: GIT_BIN, SystemRoot: 'C:\\Windows', HOME: 'x' };
    const result = sshEnv(env, 'win32', installed);
    assert.notEqual(result, env);
    assert.deepEqual(env, { Path: GIT_BIN, SystemRoot: 'C:\\Windows', HOME: 'x' });
    assert.equal(result.HOME, 'x');
    assert.equal(result.SystemRoot, 'C:\\Windows');
  });

  test('OpenSSH already first (in any spelling) leaves the env as it is', () => {
    for (const first of [
      OPENSSH_DIR,
      `${OPENSSH_DIR}\\`,
      OPENSSH_DIR.toLowerCase(),
      `"${OPENSSH_DIR}"`,
    ]) {
      const env = { Path: `${first};${GIT_BIN}`, SystemRoot: 'C:\\Windows' };
      assert.equal(sshEnv(env, 'win32', installed), env, first);
    }
  });

  test('OpenSSH first and again later is added once, not twice', () => {
    const env = {
      Path: `${OPENSSH_DIR};${GIT_BIN};${OPENSSH_DIR.toLowerCase()}\\`,
      SystemRoot: 'C:\\Windows',
    };
    assert.equal(sshEnv(env, 'win32', installed).Path, `${OPENSSH_DIR};${GIT_BIN}`);
  });

  test('without a PATH at all, the Windows spelling Path is made', () => {
    const result = sshEnv({ SystemRoot: 'C:\\Windows' }, 'win32', installed);
    assert.equal(result.Path, OPENSSH_DIR);
    assert.equal(result.PATH, undefined);
  });

  test('SystemRoot is found in any case, and windir stands in for it', () => {
    assert.equal(
      sshEnv({ Path: GIT_BIN, SYSTEMROOT: 'C:\\Windows' }, 'win32', installed).Path,
      `${OPENSSH_DIR};${GIT_BIN}`,
    );
    assert.equal(
      sshEnv({ Path: GIT_BIN, windir: 'C:\\Windows' }, 'win32', installed).Path,
      `${OPENSSH_DIR};${GIT_BIN}`,
    );
  });

  test('Windows without the OpenSSH client, or without SystemRoot, leaves the env as it is', () => {
    const env = { Path: gitBashPath, SystemRoot: 'C:\\Windows' };
    assert.equal(sshEnv(env, 'win32', missing), env);
    const bare = { Path: gitBashPath };
    assert.equal(sshEnv(bare, 'win32', installed), bare);
  });

  test('on Linux and macOS the env is never changed, even where a file by that path exists', () => {
    const env = { PATH: '/usr/bin:/bin', SystemRoot: 'C:\\Windows' };
    for (const platform of ['linux', 'darwin'] as const) {
      assert.equal(
        sshEnv(env, platform, () => true),
        env,
        platform,
      );
    }
  });

  test('windowsOpenSsh names the client by its Windows paths, whichever platform the code runs on', () => {
    assert.deepEqual(windowsOpenSsh({ SystemRoot: 'C:\\Windows' }, 'win32', installed), {
      dir: OPENSSH_DIR,
      exe: OPENSSH_EXE,
    });
    assert.equal(windowsOpenSsh({ SystemRoot: 'C:\\Windows' }, 'win32', missing), undefined);
    assert.equal(windowsOpenSsh({ SystemRoot: 'C:\\Windows' }, 'linux', installed), undefined);
  });

  test('the tunnel runs Windows ssh.exe by its full path when it exists, else plain ssh', () => {
    const env = { Path: GIT_BIN, SystemRoot: 'C:\\Windows' };
    assert.equal(sshCommand(env, 'win32', installed), OPENSSH_EXE);
    assert.equal(sshCommand(env, 'win32', missing), 'ssh');
    assert.equal(sshCommand({ Path: GIT_BIN }, 'win32', installed), 'ssh');
    assert.equal(sshCommand({ PATH: '/usr/bin' }, 'linux', installed), 'ssh');
    assert.equal(sshCommand({ PATH: '/usr/bin' }, 'darwin', installed), 'ssh');
  });

  // The real thing, where it can run: a child process started with this env finds Windows' ssh first,
  // even from a plain copy of process.env (whose PATH key is case-sensitive) with Git's ssh before it.
  test.runIf(process.platform === 'win32' && windowsOpenSsh() !== undefined)(
    'a real child process finds Windows ssh.exe before any other ssh on PATH',
    () => {
      const real = windowsOpenSsh();
      const copy = { ...process.env };
      const key = Object.keys(copy).find((name) => name.toLowerCase() === 'path') ?? 'Path';
      copy[key] = `${GIT_BIN};${copy[key] ?? ''}`;
      const found = spawnSync('where', ['ssh'], { encoding: 'utf8', env: sshEnv(copy) });
      assert.equal(found.status, 0);
      assert.equal(found.stdout.split(/\r?\n/)[0]?.toLowerCase(), real?.exe.toLowerCase());
    },
  );
});

const FOUNDATION = fileURLToPath(new URL('../', import.meta.url));

// The text of the call whose opening bracket is at `open`, up to its closing one.
function callText(source: string, open: number): string {
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '(') depth += 1;
    if (source[index] === ')') depth -= 1;
    if (depth === 0) return source.slice(open, index + 1);
  }
  return source.slice(open);
}

// Every call that starts `docker` or `ssh`, as { file, text }.
function dockerAndSshCalls(): { file: string; direct: boolean; text: string }[] {
  const calls: { file: string; direct: boolean; text: string }[] = [];
  const start =
    /\b(?:spawn|spawnSync|execFile|execFileSync)\(\s*(?:'docker'|(['"])ssh\1|sshCommand\(\))/g;
  for (const folder of ['src', 'bin']) {
    for (const name of readdirSync(join(FOUNDATION, folder), {
      recursive: true,
      encoding: 'utf8',
    })) {
      if (!name.endsWith('.ts')) continue;
      const source = readFileSync(join(FOUNDATION, folder, name), 'utf8');
      for (const match of source.matchAll(start)) {
        const open = match.index + match[0].indexOf('(');
        calls.push({
          file: `${folder}/${name.replaceAll('\\', '/')}`,
          direct: /ssh/.test(match[0]) && !match[0].includes('sshCommand'),
          text: callText(source, open),
        });
      }
    }
  }
  return calls;
}

describe('AC-FOUNDATION-12: no docker or ssh child process is started without it', () => {
  test('every docker and ssh child process gets sshEnv, and ssh is started only through sshCommand', () => {
    const calls = dockerAndSshCalls();
    const files = new Set(calls.map((call) => call.file));
    for (const known of [
      'src/dev-data.ts',
      'src/infra.ts',
      'src/machine.ts',
      'src/remote-infra.ts',
    ]) {
      assert.ok(files.has(known), `${known}: its docker calls were not found`);
    }
    for (const call of calls) {
      assert.ok(!call.direct, `${call.file}: start ssh through sshCommand(): ${call.text}`);
      assert.ok(call.text.includes('sshEnv('), `${call.file}: pass env: sshEnv(): ${call.text}`);
    }
  });
});
