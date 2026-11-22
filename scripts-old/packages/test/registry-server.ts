import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

/**
 * A tiny npm registry for end-to-end tests: the real npm CLI publishes to it, `npm whoami` asks it,
 * and the package CLI reads package documents from it. Only what those calls need is implemented.
 */
export interface FakeRegistry {
  url: string;
  token: string;
  /** name -> version -> manifest */
  versions: Map<string, Map<string, Record<string, unknown>>>;
  distTags: Map<string, Record<string, string>>;
  /** names whose next publish answers 500 */
  failPublish: Set<string>;
  /** whoami answers that succeed before it answers 401 (a session running out mid-release) */
  whoamiLimit: number;
  /** "name@version" in the order npm published them */
  published: string[];
  close(): Promise<void>;
}

const json = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });

export async function startRegistry(): Promise<FakeRegistry> {
  const token = 'test-token';
  const state: Omit<FakeRegistry, 'url' | 'close'> = {
    token,
    versions: new Map(),
    distTags: new Map(),
    failPublish: new Set(),
    whoamiLimit: Infinity,
    published: [],
  };
  const authorized = (req: IncomingMessage) => req.headers.authorization === `Bearer ${token}`;

  const server = createServer((req, res) => {
    void (async () => {
      const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname.slice(1));
      if (req.method === 'GET' && path === '-/whoami') {
        if (authorized(req) && state.whoamiLimit > 0) {
          state.whoamiLimit -= 1;
          json(res, 200, { username: 'beautinique' });
        } else {
          json(res, 401, { error: 'Unauthorized' });
        }
        return;
      }
      if (req.method === 'GET') {
        const versions = state.versions.get(path);
        if (!versions) {
          json(res, 404, { error: 'Not found' });
          return;
        }
        json(res, 200, {
          name: path,
          versions: Object.fromEntries(versions),
          'dist-tags': state.distTags.get(path) ?? {},
        });
        return;
      }
      if (req.method === 'PUT') {
        if (!authorized(req)) {
          json(res, 401, { error: 'You must be logged in to publish packages.' });
          return;
        }
        const body = JSON.parse(await readBody(req)) as {
          name: string;
          versions?: Record<string, Record<string, unknown>>;
          'dist-tags'?: Record<string, string>;
        };
        if (state.failPublish.has(body.name)) {
          json(res, 500, { error: 'Internal server error (test)' });
          return;
        }
        const versions =
          state.versions.get(body.name) ?? new Map<string, Record<string, unknown>>();
        for (const [version, manifest] of Object.entries(body.versions ?? {})) {
          if (versions.has(version)) {
            json(res, 403, {
              error: `You cannot publish over the previously published versions: ${version}.`,
            });
            return;
          }
          versions.set(version, manifest);
          state.published.push(`${body.name}@${version}`);
        }
        state.versions.set(body.name, versions);
        state.distTags.set(body.name, { ...state.distTags.get(body.name), ...body['dist-tags'] });
        json(res, 200, { ok: true });
        return;
      }
      json(res, 404, { error: 'Not found' });
    })();
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  // the same object the server reads, so tests can change whoamiLimit too
  return Object.assign(state, {
    url: `http://127.0.0.1:${String(port)}/`,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      }),
  });
}
