import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, test } from 'vitest';

import {
  closeTunnel,
  processName,
  isListening,
  isRemoteEndpoint,
  openTunnel,
  portsTakenMessage,
  publishedPorts,
  takenPorts,
  TUNNEL_HOST,
  tunnelArgs,
  tunnelLeftOpenNotice,
} from '../src/remote-infra.ts';

const servers: Server[] = [];
const folders: string[] = [];

afterEach(() => {
  for (const server of servers.splice(0)) server.close();
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

// A real listener on a free port of 127.0.0.1, like a container's published port.
function listen(): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer();
    servers.push(server);
    server.listen(0, '127.0.0.1', () => {
      resolve((server.address() as { port: number }).port);
    });
  });
}

// Stops the listener of `port`, which `listen` started last, and waits until it is really closed.
async function stopListening(): Promise<void> {
  const server = servers.pop();
  if (!server) return;
  await new Promise((resolve) => server.close(resolve));
}

function stateFile(): string {
  const folder = mkdtempSync(join(tmpdir(), 'bq-tunnel-'));
  folders.push(folder);
  return join(folder, 'tunnel.json');
}

describe('AC-FOUNDATION-12: the secondary laptop is a remote Docker context', () => {
  test('an ssh:// endpoint is remote; the local Docker and an empty endpoint are not', () => {
    assert.equal(isRemoteEndpoint('ssh://bq@bq-infra'), true);
    assert.equal(isRemoteEndpoint('npipe:////./pipe/docker_engine'), false);
    assert.equal(isRemoteEndpoint('unix:///var/run/docker.sock'), false);
    assert.equal(isRemoteEndpoint('tcp://192.168.1.20:2375'), false);
    assert.equal(isRemoteEndpoint(''), false);
  });

  test('every published port of the started profiles is read once, and sorted', () => {
    assert.deepEqual(
      publishedPorts({
        services: {
          mongo: { ports: [{ host_ip: '127.0.0.1', published: '27017', target: 27017 }] },
          valkey: { ports: [{ host_ip: '127.0.0.1', published: '6379', target: 6379 }] },
          again: { ports: [{ host_ip: '127.0.0.1', published: '6379', target: 6379 }] },
          mail: {},
        },
      }),
      [6379, 27017],
    );
    // A wrong example: a port that is not published adds nothing, and nothing is made up.
    assert.deepEqual(publishedPorts({ services: { mail: { ports: [{ target: 25 }] } } }), []);
    assert.deepEqual(publishedPorts({}), []);
  });

  test('the tunnel forwards each port from 127.0.0.1 to the secondary 127.0.0.1, under its own ssh alias', () => {
    const args = tunnelArgs([6379, 27017]);
    assert.deepEqual(args.slice(-5), [
      '-L',
      '127.0.0.1:6379:127.0.0.1:6379',
      '-L',
      '127.0.0.1:27017:127.0.0.1:27017',
      TUNNEL_HOST,
    ]);
    assert.equal(TUNNEL_HOST, 'bq-infra-tunnel');
    // It never asks for a passphrase nobody can see, and fails if a forward cannot be bound.
    assert.ok(args.includes('BatchMode=yes'));
    assert.ok(args.includes('ExitOnForwardFailure=yes'));
    // A wrong example: no forward listens on a network address, and Docker's own alias is not used.
    assert.ok(args.every((arg) => !/^0\.0\.0\.0|^\*:/.test(arg)));
    assert.ok(!args.includes('bq-infra'));
  });

  test("AC-FOUNDATION-12: a down on this laptop's own Docker leaves the secondary's tunnel open and says so", () => {
    const notice = tunnelLeftOpenNotice({ pid: 4242, ports: [27017] }, true) ?? '';
    assert.match(notice, /tunnel to the secondary laptop \(process 4242\) is still open/);
    assert.match(notice, /npm run infra:use -- secondary, then npm run infra:down/);
    // Wrong examples: no tunnel remembered, or a remembered one that no longer answers, says nothing.
    assert.equal(tunnelLeftOpenNotice(undefined, false), undefined);
    assert.equal(tunnelLeftOpenNotice({ pid: 4242, ports: [27017] }, false), undefined);
  });

  test('a port already taken on this laptop is found, and the error says what to do', async () => {
    const port = await listen();
    assert.equal(await isListening(port), true);
    assert.deepEqual(await takenPorts([port]), [port]);

    const message = portsTakenMessage([port], undefined);
    assert.match(message, new RegExp(`Port ${String(port)} on 127.0.0.1 is already taken`));
    assert.match(message, /Docker on this laptop/);
    assert.match(
      portsTakenMessage([port], { pid: 4242, ports: [port] }),
      /tunnel is still open \(process 4242\)/,
    );
  });

  test('a free port is not reported as taken (wrong example for the check)', async () => {
    const port = await listen();
    await stopListening();
    assert.deepEqual(await takenPorts([port]), []);
  });

  test('opening a tunnel over a taken port fails before any ssh starts and leaves no state', async () => {
    const port = await listen();
    const file = stateFile();
    await assert.rejects(openTunnel([port], file), /already taken/);
    assert.equal(existsSync(file), false);
  });

  test('closing a tunnel whose ports no longer answer removes the state and kills nothing', async () => {
    const port = await listen();
    await stopListening();
    const file = stateFile();
    // This very process id stands for a reused one: it must survive.
    writeFileSync(file, JSON.stringify({ pid: process.pid, ports: [port] }));
    assert.equal(await closeTunnel(file), false);
    assert.equal(existsSync(file), false);
    assert.equal(await closeTunnel(file), false);
  });

  test('a process id that is no longer ssh is never killed, even while its ports answer (QA-Q-6)', async () => {
    const port = await listen();
    const file = stateFile();
    // This very process stands for a reused id, and the listener for another program on the ports.
    writeFileSync(file, JSON.stringify({ pid: process.pid, ports: [port] }));
    assert.equal(await closeTunnel(file), false);
    assert.equal(existsSync(file), false);
  });

  test('the name of a running process is read from the system', () => {
    assert.equal(processName(process.pid), 'node');
    assert.equal(processName(2 ** 22 + 12345), '');
  });

  test('closing a live tunnel stops its process and removes the state', async () => {
    const port = await listen();
    const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
      stdio: 'ignore',
    });
    const exited = new Promise((resolve) => child.once('exit', resolve));
    const file = stateFile();
    writeFileSync(file, JSON.stringify({ pid: child.pid, ports: [port] }));
    // The stand-in is node, not ssh: tell closeTunnel it is the tunnel.
    assert.equal(await closeTunnel(file, () => 'ssh'), true);
    await exited;
    assert.equal(existsSync(file), false);
  });
});
