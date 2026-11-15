// T4.1 PR B, the platform kernel: authorize() and scopeFilter() over core's copy of identity's
// grants (T3.5), and idempotency keys on core's routes, against the local MongoDB replica set and
// Valkey (`npm run infra:up`).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  AppError,
  createApp,
  createLogger,
  LOOPBACK_HOST,
  type Passport,
  startServer,
} from '@beautinique/backend-server-kit';
import { ObjectId } from '@beautinique/backend-server-mongo';
import { csvFileZod, defineRoute, HEADERS } from '@beautinique/shared-contracts';
import { boolean, number, object, string } from '@beautinique/shared-zod';
import { Router } from 'express';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  ACCESS_COPIES,
  type AccessCopy,
  accessOf,
  authorize,
  type CallerAccess,
  csvCell,
  csvText,
  IDEMPOTENCY,
  mountCoreDownload,
  mountCoreRoute,
  PINGS,
  REPLAYED_HEADER,
  ROLE_COPIES,
  type RoleCopy,
  scopeFilter,
} from '../src/modules/platform/index.ts';
import {
  captureLogger,
  type Inspector,
  inspector,
  isolation,
  type RunningCore,
  start,
  testConfig,
} from './support.ts';

const { dbName, prefix, epochKey } = isolation();
let look: Inspector;
let core: RunningCore;

beforeAll(async () => {
  look = await inspector(dbName);
  core = await start(testConfig(dbName), {
    port: 0,
    host: LOOPBACK_HOST,
    handleSignals: false,
    runtime: { queuePrefix: prefix, epochKey, consume: false },
  });
});
afterEach(async () => {
  for (const name of [ROLE_COPIES, ACCESS_COPIES, IDEMPOTENCY, PINGS]) {
    await look.mongo.db.collection(name).deleteMany({});
  }
});
afterAll(async () => {
  await core.stop();
  await look.cleanUp(prefix, epochKey);
});

const roles = () => look.mongo.db.collection<RoleCopy>(ROLE_COPIES);
const copies = () => look.mongo.db.collection<AccessCopy>(ACCESS_COPIES);

/** A role in core's copy, with these permission keys. */
async function role(key: string, permissions: string[], retired = false): Promise<ObjectId> {
  const _id = new ObjectId();
  await roles().insertOne({
    _id,
    key,
    app: key.split('.')[0] as RoleCopy['app'],
    permissions,
    scopeTypes: ['global', 'state', 'self'],
    mfaRequired: false,
    retired,
    changedAt: new Date(),
  });
  return _id;
}

type GrantInput = {
  roleId: ObjectId;
  app?: string;
  scope: AccessCopy['grants'][number]['scope'];
} & Partial<Pick<AccessCopy['grants'][number], 'validFrom' | 'validTo'>>;

/** An account's grants in core's copy, at this authz version. */
async function holds(userId: ObjectId, authzVersion: number, grants: GrantInput[]): Promise<void> {
  await copies().replaceOne(
    { _id: userId },
    {
      authzVersion,
      grants: grants.map((grant) => ({
        grantId: new ObjectId(),
        roleId: grant.roleId,
        app: (grant.app ?? 'admin') as AccessCopy['grants'][number]['app'],
        scope: grant.scope,
        validFrom: grant.validFrom ?? null,
        validTo: grant.validTo ?? null,
      })),
      copiedAt: new Date(),
    },
    { upsert: true },
  );
}

const passportOf = (
  userId: ObjectId,
  authzVersion = 1,
  app: Passport['app'] = 'admin',
): Passport => ({
  userId: userId.toHexString(),
  sessionId: new ObjectId().toHexString(),
  app,
  methods: ['password', 'totp'],
  authzVersion,
});

const fast = { retries: 3, retryMs: 20 };
const access = (userId: ObjectId, authzVersion = 1, app: Passport['app'] = 'admin') =>
  accessOf(core.runtime.mongo, passportOf(userId, authzVersion, app), fast);
const codeOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (error) {
    return error instanceof AppError ? error.code : 'not an AppError';
  }
  return 'allowed';
};

describe('accessOf', () => {
  it("reads the caller's grants in the passport's app, without retired roles or other apps", async () => {
    const userId = new ObjectId();
    const reader = await role('admin.reader', ['iam.app.sign_in', 'iam.grant.read']);
    const gone = await role('admin.gone', ['iam.grant.manage'], true);
    const other = await role('seller.staff', ['iam.role.manage']);
    await holds(userId, 3, [
      { roleId: reader, scope: { type: 'state', ids: ['MH'] } },
      { roleId: gone, scope: { type: 'global', ids: [] } },
      { roleId: other, app: 'seller', scope: { type: 'global', ids: [] } },
    ]);
    const caller = await access(userId, 3);
    expect(caller.grants).toEqual([
      {
        role: 'admin.reader',
        permissions: ['iam.app.sign_in', 'iam.grant.read'],
        scope: { type: 'state', ids: ['MH'] },
        validFrom: null,
        validTo: null,
      },
    ]);
  });

  it('reads an older copy again, and answers 503 when it stays older than the passport', async () => {
    const userId = new ObjectId();
    const reader = await role('admin.reader', ['iam.grant.read']);
    await holds(userId, 2, [{ roleId: reader, scope: { type: 'global', ids: [] } }]);
    await expect(access(userId, 3)).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    // no copy at all yet: the same
    await expect(access(new ObjectId(), 1)).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    // the event lands while it waits: the next read takes it
    const waiting = accessOf(core.runtime.mongo, passportOf(userId, 3), {
      retries: 3,
      retryMs: 200,
    });
    await holds(userId, 3, [{ roleId: reader, scope: { type: 'global', ids: [] } }]);
    expect((await waiting).grants).toHaveLength(1);
  });

  it('takes a copy newer than the passport (a token from before the last change)', async () => {
    const userId = new ObjectId();
    const reader = await role('admin.reader', ['iam.grant.read']);
    await holds(userId, 5, [{ roleId: reader, scope: { type: 'global', ids: [] } }]);
    expect((await access(userId, 4)).grants).toHaveLength(1);
  });
});

describe('authorize', () => {
  async function stateReader(): Promise<CallerAccess> {
    const userId = new ObjectId();
    const reader = await role('admin.reader', ['iam.grant.read', 'iam.role.manage']);
    await holds(userId, 1, [{ roleId: reader, scope: { type: 'state', ids: ['MH'] } }]);
    return access(userId);
  }

  it('allows inside the scope, 404 outside it, 403 without the permission', async () => {
    const caller = await stateReader();
    expect(authorize(caller, 'iam.grant.read', { state: 'MH' }).scope).toEqual({
      type: 'state',
      ids: ['MH'],
    });
    // a resource in another state: as if it were not there (owner, 2026-11-14)
    expect(codeOf(() => authorize(caller, 'iam.grant.read', { state: 'GJ' }))).toBe('NOT_FOUND');
    expect(() =>
      authorize(caller, 'iam.grant.read', { state: 'GJ' }, { notFound: 'Application not found.' }),
    ).toThrow('Application not found.');
    // no grant holds it
    expect(codeOf(() => authorize(caller, 'iam.grant.manage', { state: 'MH' }))).toBe('FORBIDDEN');
    // held, but a state grant cannot use a global-only permission
    expect(codeOf(() => authorize(caller, 'iam.role.manage'))).toBe('FORBIDDEN');
    // the permission alone (a list): allowed
    expect(codeOf(() => authorize(caller, 'iam.grant.read'))).toBe('allowed');
  });

  it('counts a grant only inside its validity', async () => {
    const userId = new ObjectId();
    const reader = await role('admin.reader', ['iam.grant.read']);
    await holds(userId, 1, [
      {
        roleId: reader,
        scope: { type: 'global', ids: [] },
        validTo: new Date(Date.now() - 60_000),
      },
      {
        roleId: reader,
        scope: { type: 'state', ids: ['KA'] },
        validFrom: new Date(Date.now() + 86_400_000),
      },
    ]);
    const caller = await access(userId);
    expect(codeOf(() => authorize(caller, 'iam.grant.read', { state: 'KA' }))).toBe('FORBIDDEN');
  });
});

describe('scopeFilter', () => {
  it('filters to the caller’s scope: everything, a state code, an account as an ObjectId', async () => {
    const everyone = new ObjectId();
    const reader = await role('admin.reader', ['iam.grant.read', 'iam.app.sign_in']);
    await holds(everyone, 1, [{ roleId: reader, scope: { type: 'global', ids: [] } }]);
    expect(scopeFilter(await access(everyone), 'iam.grant.read', { state: 'stateId' })).toEqual({});

    const twoStates = new ObjectId();
    await holds(twoStates, 1, [{ roleId: reader, scope: { type: 'state', ids: ['MH', 'GJ'] } }]);
    expect(scopeFilter(await access(twoStates), 'iam.grant.read', { state: 'stateId' })).toEqual({
      // sorted, as shared-authz gives them
      stateId: { $in: ['GJ', 'MH'] },
    });

    const own = new ObjectId();
    await holds(own, 1, [
      { roleId: reader, scope: { type: 'self', ids: [own] } },
      { roleId: reader, scope: { type: 'state', ids: ['KA'] } },
    ]);
    expect(
      scopeFilter(await access(own), 'iam.app.sign_in', { self: 'userId', state: 'stateId' }),
    ).toEqual({ $or: [{ userId: { $in: [own] } }, { stateId: { $in: ['KA'] } }] });
    // a scope type the collection has no field for reaches nothing
    expect(scopeFilter(await access(own), 'iam.app.sign_in', { sellerOrg: 'sellerOrgId' })).toEqual(
      {
        _id: { $in: [] },
      },
    );
  });

  it('refuses a caller with no active grant of the permission', async () => {
    const userId = new ObjectId();
    const reader = await role('admin.reader', ['iam.grant.read']);
    await holds(userId, 1, [{ roleId: reader, scope: { type: 'global', ids: [] } }]);
    expect(
      codeOf(() => scopeFilter({ passport: passportOf(userId), grants: [] }, 'iam.grant.read', {})),
    ).toBe('FORBIDDEN');
    await expect(
      (async () => scopeFilter(await access(userId), 'iam.grant.manage', {}))(),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    // a grant whose scope type the permission does not allow (global only here): 403 as with
    // authorize, not an empty list
    const inState = new ObjectId();
    const manager = await role('admin.role_manager', ['iam.role.manage']);
    await holds(inState, 1, [{ roleId: manager, scope: { type: 'state', ids: ['MH'] } }]);
    await expect(
      (async () => scopeFilter(await access(inState), 'iam.role.manage', { state: 'stateId' }))(),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

describe('idempotency keys', () => {
  const ping = (key: string | undefined, note: string, ip = '203.0.113.7') =>
    fetch(`${core.url}/platform/pings`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        [HEADERS.clientIp]: ip,
        ...(key === undefined ? {} : { [HEADERS.idempotencyKey]: key }),
      },
      body: JSON.stringify({ note }),
    });
  interface Answer {
    data?: { pingId?: string };
    error?: { code?: string };
  }
  const body = async (answer: Response) => (await answer.json()) as Answer;

  it('gives the first answer to the same request again, and does it once', async () => {
    const key = crypto.randomUUID();
    const first = await ping(key, 'once');
    expect(first.status).toBe(201);
    const again = await ping(key, 'once');
    expect(again.status).toBe(201);
    expect(again.headers.get(REPLAYED_HEADER)).toBe('true');
    expect((await body(again)).data?.pingId).toBe((await body(first)).data?.pingId);
    expect(await look.mongo.db.collection(PINGS).countDocuments({ note: 'once' })).toBe(1);
  });

  it('refuses the key for another request (422), and counts it per client on a public route', async () => {
    const key = crypto.randomUUID();
    expect((await ping(key, 'first')).status).toBe(201);
    const other = await ping(key, 'second');
    expect(other.status).toBe(422);
    expect((await body(other)).error?.code).toBe('IDEMPOTENCY_KEY_REUSED');
    // another client's same key is its own
    expect((await ping(key, 'second', '198.51.100.4')).status).toBe(201);
  });

  it('asks for a key, and keeps a refused request’s answer too (4xx)', async () => {
    const missing = await ping(undefined, 'no key');
    expect(missing.status).toBe(400);
    expect((await body(missing)).error?.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
    const key = crypto.randomUUID();
    const bad = await ping(key, '');
    expect(bad.status).toBe(400);
    const again = await ping(key, '');
    expect(again.status).toBe(400);
    expect(again.headers.get(REPLAYED_HEADER)).toBe('true');
  });

  describe('on a signed-in route', () => {
    // a route only this test mounts: it waits or fails as asked
    const slow = defineRoute({
      id: 'platform.kernel.try',
      method: 'POST',
      path: '/test/kernel',
      summary: 'A test of the idempotency step',
      apps: ['admin'],
      access: { type: 'permission', permission: 'iam.grant.read' },
      rateLimit: 'write',
      idempotency: true,
      stepUp: false,
      owner: 'core',
      input: { body: object({ fail: boolean(), waitMs: number().int().min(0) }) },
      output: object({ runs: number().int() }),
    });
    let runs = 0;
    let release: (() => void) | undefined;
    let server: Awaited<ReturnType<typeof startServer>> | undefined;
    const users = new Map<string, Passport>();

    beforeAll(async () => {
      const logger = createLogger({ name: 'kernel-test', level: 'silent' });
      const router = Router();
      mountCoreRoute(
        router,
        slow,
        async ({ body: input }) => {
          runs += 1;
          if (input.waitMs > 0) await new Promise<void>((resolve) => (release = resolve));
          if (input.fail) throw new Error('a server bug');
          return { runs };
        },
        {
          mongo: core.runtime.mongo,
          passport: (req) => {
            const known = users.get(req.get('x-test-user') ?? '');
            if (!known) throw new AppError('UNAUTHENTICATED', 'Sign in first.');
            return Promise.resolve(known);
          },
          logger,
        },
      );
      const app = createApp({ logger, routes: (mounted) => mounted.use(router) });
      server = await startServer(app, {
        port: 0,
        host: LOOPBACK_HOST,
        handleSignals: false,
        logger,
      });
    });
    afterAll(async () => {
      await server?.stop();
    });

    const call = (user: string, key: string, input: { fail: boolean; waitMs: number }) =>
      fetch(`${server?.url ?? ''}/test/kernel`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-test-user': user,
          [HEADERS.idempotencyKey]: key,
        },
        body: JSON.stringify(input),
      });

    it('answers 409 while the first runs, keeps no 5xx, and counts the key per user', async () => {
      users.set('asha', passportOf(new ObjectId()));
      users.set('ravi', passportOf(new ObjectId()));
      const key = crypto.randomUUID();
      const first = call('asha', key, { fail: false, waitMs: 1 });
      // wait until the first holds the key
      for (let i = 0; i < 100 && release === undefined; i += 1)
        await new Promise((r) => setTimeout(r, 10));
      const busy = await call('asha', key, { fail: false, waitMs: 1 });
      expect(busy.status).toBe(409);
      expect((await body(busy)).error?.code).toBe('IDEMPOTENCY_KEY_IN_USE');
      // another user's same key is their own: it runs at once
      expect((await call('ravi', key, { fail: false, waitMs: 0 })).status).toBe(200);
      release?.();
      expect((await first).status).toBe(200);
      release = undefined;
      const before = runs;
      // a 5xx is not kept: the same request again really runs again
      const failKey = crypto.randomUUID();
      expect((await call('ravi', failKey, { fail: true, waitMs: 0 })).status).toBe(500);
      expect((await call('ravi', failKey, { fail: true, waitMs: 0 })).status).toBe(500);
      expect(runs).toBe(before + 2);
    });

    it('takes over a request whose process died (its lease ran out)', async () => {
      users.set('meera', passportOf(new ObjectId()));
      const key = crypto.randomUUID();
      expect((await call('meera', key, { fail: false, waitMs: 0 })).status).toBe(200);
      // as if it never finished, and its lease is long past
      await look.mongo.db
        .collection(IDEMPOTENCY)
        .updateMany({}, { $set: { state: 'running', response: null, lockedUntil: new Date(0) } });
      const before = runs;
      const taken = await call('meera', key, { fail: false, waitMs: 0 });
      expect(taken.status).toBe(200);
      expect(runs).toBe(before + 1);
    });
  });
});

describe('CSV downloads (T4.1 PR D)', () => {
  it('keeps a cell that starts like a formula as text, quotes text and doubles its quotes', () => {
    for (const start of ['=', '+', '-', '@', '\t', '\r']) {
      expect(csvCell(`${start}1+1`)).toBe(`"'${start}1+1"`);
    }
    expect(csvCell('say "hi", then go\nhome')).toBe('"say ""hi"", then go\nhome"');
    expect(csvCell('a=b')).toBe('"a=b"');
    expect(csvCell(-5)).toBe('-5');
    expect(csvCell(Number.NaN)).toBe('');
    expect(csvCell(null)).toBe('');
    expect(csvCell('')).toBe('""');
  });

  it('writes a BOM and the header first, then the rows in big pieces', async () => {
    async function* rows() {
      for (let i = 0; i < 3000; i += 1) {
        // rows come as a cursor gives them: one at a time, later
        await Promise.resolve();
        yield i;
      }
    }
    const pieces: string[] = [];
    for await (const piece of csvText({
      fileName: 'n.csv',
      columns: [
        { header: 'N', value: (n: number) => n },
        { header: 'Text', value: (n: number) => `row ${String(n)}` },
      ],
      rows: rows(),
    })) {
      pieces.push(piece);
    }
    expect(pieces[0]).toBe('\uFEFF"N","Text"\r\n');
    expect(pieces.length).toBeLessThan(10);
    const lines = pieces.join('').split('\r\n');
    expect(lines).toHaveLength(3002);
    expect(lines[3000]).toBe('2999,"row 2999"');
  });

  describe('a download route', () => {
    const file = defineRoute({
      id: 'platform.kernel.export',
      method: 'GET',
      path: '/test/export',
      summary: 'A test of the download step',
      apps: ['master'],
      access: { type: 'signed-in' },
      rateLimit: 'search',
      idempotency: false,
      stepUp: false,
      owner: 'core',
      download: 'csv',
      input: {
        query: object({
          name: string(),
          breakAt: string().optional(),
          waitAt: string().optional(),
        }),
      },
      output: csvFileZod,
    });
    const { logger, lines } = captureLogger();
    let server: Awaited<ReturnType<typeof startServer>> | undefined;

    beforeAll(async () => {
      const router = Router();
      mountCoreDownload(
        router,
        file,
        ({ query }) => {
          async function* rows() {
            for (let i = 1; i <= 20_000; i += 1) {
              // a slow database: the rows stop coming for a while
              await (String(i) === query.waitAt
                ? new Promise((resolve) => setTimeout(resolve, 3000))
                : Promise.resolve());
              if (String(i) === query.breakAt) throw new Error('the cursor broke');
              yield i;
            }
          }
          return Promise.resolve({
            fileName: query.name,
            columns: [{ header: 'N', value: (n: number) => n }],
            rows: rows(),
          });
        },
        { logger },
      );
      const app = createApp({ logger, routes: (mounted) => mounted.use(router) });
      server = await startServer(app, {
        port: 0,
        host: LOOPBACK_HOST,
        handleSignals: false,
        logger,
      });
    });
    afterAll(async () => {
      await server?.stop();
    });
    const get = (query: string) => fetch(`${server?.url ?? ''}/test/export?${query}`);

    it('sends the file with its name, never to be kept by a cache', async () => {
      const answer = await get('name=numbers.csv');
      expect(answer.status).toBe(200);
      expect(answer.headers.get('content-type')).toBe('text/csv; charset=utf-8');
      expect(answer.headers.get('content-disposition')).toBe('attachment; filename="numbers.csv"');
      expect(answer.headers.get('cache-control')).toBe('private, no-store');
      const text = await answer.text();
      expect(text.split('\r\n')).toHaveLength(20_002);
    });

    it('answers a wrong query as usual, and refuses a file name that is no plain one', async () => {
      expect((await get('')).status).toBe(400);
      expect((await get('name=..%2Fetc.csv')).status).toBe(500);
      expect((await get('name=a.csv%22%0D%0AX-Bad:1')).status).toBe(500);
    });

    it('cuts the file off when its rows break halfway, and says so in the logs', async () => {
      const answer = await get('name=broken.csv&breakAt=15000');
      expect(answer.status).toBe(200);
      await expect(answer.text()).rejects.toThrow();
      expect(lines.some((line) => line.msg === 'export cut off halfway')).toBe(true);
    });

    it('stops quietly when the caller leaves halfway', async () => {
      const controller = new AbortController();
      const answer = await fetch(`${server?.url ?? ''}/test/export?name=slow.csv&waitAt=10`, {
        signal: controller.signal,
      });
      await answer.body?.getReader().read();
      controller.abort();
      await vi.waitFor(() => {
        expect(lines.some((line) => line.msg === 'export stopped: the caller left')).toBe(true);
        // the rows' source closes once its slow read is back
      }, 5000);
      expect(lines.filter((line) => line.msg === 'export cut off halfway')).toHaveLength(1);
    });

    it('is mounted only as a download', () => {
      expect(() => {
        mountCoreRoute(Router(), file as never, () => '' as never, {
          mongo: core.runtime.mongo,
          passport: () => Promise.reject(new Error('no')),
          logger,
        });
      }).toThrow('platform.kernel.export is a download: mount it with mountCoreDownload');
    });
  });
});

describe('the kernel guard', () => {
  it('mounts every core route with mountCoreRoute, so an idempotent one never goes without its step', () => {
    const src = join(import.meta.dirname, '../src');
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) walk(path);
        else if (path.endsWith('.ts')) files.push(path);
      }
    };
    walk(src);
    const direct = files.filter(
      (file) =>
        !file.endsWith(join('platform', 'idempotency.ts')) &&
        /\bmountRoute\(/.test(readFileSync(file, 'utf8')),
    );
    expect(direct).toEqual([]);
  });
});
