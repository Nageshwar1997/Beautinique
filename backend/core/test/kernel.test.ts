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
import { defineRoute, HEADERS } from '@beautinique/shared-contracts';
import { boolean, number, object } from '@beautinique/shared-zod';
import { Router } from 'express';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  ACCESS_COPIES,
  type AccessCopy,
  accessOf,
  authorize,
  type CallerAccess,
  IDEMPOTENCY,
  mountCoreRoute,
  PINGS,
  REPLAYED_HEADER,
  ROLE_COPIES,
  type RoleCopy,
  scopeFilter,
} from '../src/modules/platform/index.ts';
import {
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
