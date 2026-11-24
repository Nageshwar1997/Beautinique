import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

// The fake npm registry itself. It runs in its own process (fake-registry.ts starts it), because
// the CLI runs npm with spawnSync, which would freeze a server living in the test's own process.
export const FAKE_TOKEN = 'fake-registry-token';
export const FAKE_USER = 'fake-owner';

const packages = new Map<string, Record<string, unknown>>();
let requests: string[] = [];
let failures = { count: 0, status: 500, skip: 0 };

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    request.on('error', reject);
  });
}

function send(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
}

async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const path = decodeURIComponent((request.url ?? '/').split('?')[0] ?? '/').slice(1);
  requests.push(`${request.method ?? 'GET'} /${path}`);
  const authorized = request.headers.authorization === `Bearer ${FAKE_TOKEN}`;

  if (path === '-/whoami') {
    if (authorized) send(response, 200, { username: FAKE_USER });
    else send(response, 401, { error: 'Unauthorized' });
  } else if (request.method === 'GET') {
    const found = packages.get(path);
    if (found) {
      const latest = Object.keys(found).at(-1);
      send(response, 200, { name: path, versions: found, 'dist-tags': { latest } });
    } else {
      send(response, 404, { error: 'Not found' });
    }
  } else if (request.method === 'PUT') {
    if (!authorized) {
      send(response, 401, { error: 'Unauthorized' });
      return;
    }
    const body = JSON.parse(await readBody(request)) as { versions: Record<string, unknown> };
    if (failures.skip > 0) {
      failures.skip -= 1;
    } else if (failures.count > 0) {
      failures.count -= 1;
      send(response, failures.status, { error: 'Injected failure' });
      return;
    }
    const stored = packages.get(path) ?? {};
    const clash = Object.keys(body.versions).some((version) => version in stored);
    if (clash) {
      send(response, 403, { error: 'You cannot publish over the previously published versions' });
      return;
    }
    packages.set(path, { ...stored, ...body.versions });
    send(response, 200, { ok: true });
  } else {
    send(response, 405, { error: 'Method not allowed' });
  }
}

const server = createServer((request, response) => {
  handle(request, response).catch((error: unknown) => {
    send(response, 500, { error: String(error) });
  });
});

interface Message {
  id: number;
  op: 'seed' | 'versions' | 'fail' | 'requests' | 'clear' | 'close';
  name?: string;
  versions?: string[];
  count?: number;
  status?: number;
  skip?: number;
}

// Only when started as a child process by fake-registry.ts; importing this file for its constants
// starts nothing.
if (process.send) {
  process.on('message', (message: Message) => {
    let result: unknown;
    switch (message.op) {
      case 'seed':
        packages.set(
          message.name ?? '',
          Object.fromEntries((message.versions ?? []).map((version) => [version, { version }])),
        );
        break;
      case 'versions':
        result = Object.keys(packages.get(message.name ?? '') ?? {});
        break;
      case 'fail':
        failures = {
          count: message.count ?? 0,
          status: message.status ?? 500,
          skip: message.skip ?? 0,
        };
        break;
      case 'requests':
        result = requests;
        break;
      case 'clear':
        requests = [];
        break;
      case 'close':
        server.closeAllConnections();
        server.close(() => process.exit(0));
        break;
    }
    process.send?.({ id: message.id, result });
  });

  server.listen(0, '127.0.0.1', () => {
    process.send?.({
      ready: `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`,
    });
  });
}
