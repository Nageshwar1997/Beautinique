// T4.1 PR C, the audit log (ARCHITECTURE §6.5): each UTC day one hash chain, written in the
// change's transaction, identity's records from its events, the daily chain check and the Master
// viewer's routes, against the local MongoDB replica set and Valkey (`npm run infra:up`).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { LOOPBACK_HOST, type Passport, passportSigner } from '@beautinique/backend-server-kit';
import { ObjectId, withTransaction } from '@beautinique/backend-server-mongo';
import {
  AUDIT_EXPORT_MAX_ROWS,
  auditRecorded,
  createClient,
  exportAuditEntries,
  HEADERS,
  listAuditDays,
  listAuditEntries,
  passportAudience,
} from '@beautinique/shared-contracts';
import { istDateKey } from '@beautinique/shared-utils';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  AUDIT_CHANGE_MAX_CHARS,
  AUDIT_CHECKS,
  AUDIT_ENTRIES,
  AUDIT_HEADS,
  type AuditEntry,
  type ChainHead,
  chainStartOf,
  dayOf,
  IDENTITY_AUDIT,
  type NewAuditEntry,
  subscriptionsOf,
  verifyChains,
  verifyDay,
} from '../src/modules/audit/index.ts';
import { AUDIT_CSV_COLUMNS, indiaTime } from '../src/modules/audit/routes.ts';
import {
  ACCESS_COPIES,
  type AccessCopy,
  ROLE_COPIES,
  type RoleCopy,
  USER_COPIES,
  type UserCopy,
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
const signer = passportSigner();
let look: Inspector;
let core: RunningCore;

beforeAll(async () => {
  look = await inspector(dbName);
  core = await start(testConfig(dbName), {
    port: 0,
    host: LOOPBACK_HOST,
    handleSignals: false,
    runtime: { queuePrefix: prefix, epochKey, consume: false },
    passportJwks: signer.jwks,
  });
});
afterEach(async () => {
  // the test's own handle: core itself may never change an entry
  await look.auditDb.collection(AUDIT_ENTRIES).deleteMany({});
  for (const name of [AUDIT_HEADS, AUDIT_CHECKS, ROLE_COPIES, ACCESS_COPIES, USER_COPIES]) {
    await look.mongo.db.collection(name).deleteMany({});
  }
});
afterAll(async () => {
  await core.stop();
  await look.cleanUp(prefix, epochKey);
});

const entries = () => look.auditDb.collection<AuditEntry>(AUDIT_ENTRIES);
const heads = () => look.mongo.db.collection<ChainHead>(AUDIT_HEADS);
const today = () => dayOf(new Date());
const tomorrow = () => new Date(Date.now() + 24 * 60 * 60_000);
const chainOf = (day: string) =>
  entries()
    .find({ day }, { comment: 'full read: the test reads the chain' })
    .sort({ seq: 1 })
    .toArray();

const system = { userId: null, app: null, sessionId: null, roles: [], system: 'core.test' };
const entry = (more: Partial<NewAuditEntry> = {}): NewAuditEntry => ({
  action: 'platform.ping.read',
  actor: system,
  resource: { type: 'ping', id: new ObjectId() },
  ...more,
});
const write = (more: Partial<NewAuditEntry> = {}) =>
  withTransaction(core.runtime.mongo, (session) => core.runtime.audit.write(session, entry(more)));

describe('the chain of a day', () => {
  it("writes each entry into today's chain, every hash following the one before", async () => {
    await write();
    await write();
    await write();
    const day = today();
    const chain = await chainOf(day);
    expect(chain.map((one) => one.seq)).toEqual([1, 2, 3]);
    expect(chain[0]?.prevHash).toBe(chainStartOf(day));
    expect(chain[1]?.prevHash).toBe(chain[0]?.hash);
    expect(chain[2]?.prevHash).toBe(chain[1]?.hash);
    expect(await heads().findOne({ day })).toMatchObject({ seq: 3, lastHash: chain[2]?.hash });
    expect(await verifyDay(core.runtime.audit, day)).toEqual({
      ok: true,
      entries: 3,
      brokenAtSeq: null,
    });
  });

  it('keeps nothing of a change that failed: no entry, no step in the chain', async () => {
    await expect(
      withTransaction(core.runtime.mongo, async (session) => {
        await core.runtime.audit.write(session, entry());
        throw new Error('the change failed');
      }),
    ).rejects.toThrow('the change failed');
    expect(await entries().countDocuments({})).toBe(0);
    expect(await heads().countDocuments({})).toBe(0);
  });

  it('keeps one line when many write at once', async () => {
    await Promise.all(Array.from({ length: 6 }, () => write()));
    const chain = await chainOf(today());
    expect(chain.map((one) => one.seq)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(await verifyDay(core.runtime.audit, today())).toMatchObject({ ok: true, entries: 6 });
  });

  it('half hides personal data in what changed, and keeps a too big change as its size', async () => {
    await write({
      before: null,
      after: {
        invitee: 'asha@beautinique.example',
        fullName: 'Asha Rao',
        phone: '98765 43210',
        role: 'admin.state_admin',
      },
      ip: '203.0.113.9',
    });
    await write({ after: { notes: 'x'.repeat(AUDIT_CHANGE_MAX_CHARS) } });
    const [masked, big] = await chainOf(today());
    expect(JSON.parse(masked?.after ?? 'null')).toEqual({
      invitee: 'a•••@beautinique.example',
      fullName: '[hidden]',
      phone: '••••••3210',
      role: 'admin.state_admin',
    });
    expect(masked?.before).toBeNull();
    // the IP stays whole, for a security look later
    expect(masked?.ip).toBe('203.0.113.9');
    expect(JSON.parse(big?.after ?? 'null')).toEqual({
      tooLarge: expect.any(Number) as unknown,
    });
  });

  it('keeps every entry inside the limits the viewer reads it with', async () => {
    await write({
      action: 'a'.repeat(150),
      actor: { ...system, roles: ['master.master', 'Not A Role', 'x'.repeat(90)] },
      resource: { type: 't'.repeat(60), id: 'i'.repeat(150) },
      scope: { type: 'state', ids: ['MH', '', 's'.repeat(80)] },
      reason: 'r'.repeat(700),
      ip: '1'.repeat(80),
      userAgent: 'u'.repeat(400),
      requestId: 'q'.repeat(150),
    });
    const [stored] = await chainOf(today());
    expect(stored?.action).toHaveLength(100);
    expect(stored?.actor.roles).toEqual(['master.master']);
    expect(stored?.resource.type).toHaveLength(40);
    expect(stored?.resource.id).toHaveLength(100);
    expect(stored?.scope?.ids.map((id) => String(id).length)).toEqual([2, 64]);
    expect([stored?.reason?.length, stored?.ip?.length, stored?.userAgent?.length]).toEqual([
      500, 64, 300,
    ]);
    expect(stored?.requestId).toHaveLength(100);
  });

  it('finds a changed, a lost and an added entry', async () => {
    for (let n = 0; n < 4; n += 1) await write();
    const day = today();
    const chain = await chainOf(day);
    // changed: a field of the second entry
    await entries().updateOne({ _id: chain[1]?._id }, { $set: { reason: 'edited later' } });
    expect(await verifyDay(core.runtime.audit, day)).toEqual({
      ok: false,
      entries: 4,
      brokenAtSeq: 2,
    });
    await entries().updateOne({ _id: chain[1]?._id }, { $set: { reason: null } });
    expect((await verifyDay(core.runtime.audit, day)).ok).toBe(true);
    // lost: the last entry
    await entries().deleteOne({ _id: chain[3]?._id });
    expect(await verifyDay(core.runtime.audit, day)).toEqual({
      ok: false,
      entries: 3,
      brokenAtSeq: 4,
    });
    // added: one more than the head counts, with a made-up hash
    if (chain[3]) await entries().insertOne(chain[3]);
    await entries().insertOne({ ...chain[3], _id: new ObjectId(), seq: 5 } as AuditEntry);
    expect(await verifyDay(core.runtime.audit, day)).toMatchObject({ ok: false, brokenAtSeq: 5 });
  });

  it('finds a day whose head was lost, and a head whose last hash is another', async () => {
    await write();
    await write();
    const day = today();
    const head = await heads().findOne({ day });
    // the same count with another last hash: the last entry
    await heads().updateOne({ day }, { $set: { lastHash: 'f'.repeat(64) } });
    expect(await verifyDay(core.runtime.audit, day)).toEqual({
      ok: false,
      entries: 2,
      brokenAtSeq: 2,
    });
    // the head gone (core's database): the day is still checked, from its entries, and broken
    await heads().deleteOne({ day });
    const { logger, lines } = captureLogger();
    expect(await verifyChains(core.runtime.audit, logger, tomorrow())).toEqual([
      expect.objectContaining({ day, ok: false, entries: 2, brokenAtSeq: 1 }),
    ]);
    expect(lines).toContainEqual(expect.objectContaining({ msg: 'audit chain broken', day }));
    expect(head?.seq).toBe(2);
  });
});

describe('the daily check', () => {
  it('checks only finished days, records each, and calls a broken one an error', async () => {
    await write();
    await write();
    const { logger, lines } = captureLogger();
    // today is still growing
    expect(await verifyChains(core.runtime.audit, logger)).toEqual([]);
    const checked = await verifyChains(core.runtime.audit, logger, tomorrow());
    expect(checked).toEqual([
      {
        day: today(),
        ok: true,
        entries: 2,
        brokenAtSeq: null,
        checkedAt: expect.any(Date) as unknown,
      },
    ]);
    const stored = look.mongo.db.collection(AUDIT_CHECKS);
    expect(await stored.findOne({ day: today() })).toMatchObject({ ok: true, entries: 2 });
    // a change after the check shows up at the next run
    const [first] = await chainOf(today());
    await entries().updateOne({ _id: first?._id }, { $set: { action: 'iam.grant.give' } });
    await verifyChains(core.runtime.audit, logger, tomorrow());
    expect(await stored.findOne({ day: today() })).toMatchObject({ ok: false, brokenAtSeq: 1 });
    expect(await stored.countDocuments({})).toBe(1);
    expect(lines).toContainEqual(
      expect.objectContaining({ msg: 'audit chain broken', day: today(), brokenAtSeq: 1 }),
    );
    // a week back at most
    const later = new Date(Date.now() + 9 * 24 * 60 * 60_000);
    expect(await verifyChains(core.runtime.audit, logger, later)).toEqual([]);
  });
});

describe("identity's records", () => {
  it('come in from identity.audit.recorded, with their ids as ObjectIds', async () => {
    const [subscription] = subscriptionsOf({ audit: core.runtime.audit }).filter(
      (one) => one.subscriber === IDENTITY_AUDIT,
    );
    const actorId = new ObjectId().toHexString();
    const grantId = new ObjectId().toHexString();
    const event = auditRecorded.envelope.parse({
      eventId: new ObjectId().toHexString(),
      type: auditRecorded.type,
      version: 1,
      occurredAt: '2026-11-15T10:00:00.000Z',
      producer: 'identity',
      aggregate: { type: 'grant', id: grantId },
      actor: { type: 'user', id: actorId },
      correlationId: 'req-1',
      causationId: null,
      scope: null,
      data: {
        action: 'iam.grant.give',
        actor: {
          userId: actorId,
          app: 'master',
          sessionId: new ObjectId().toHexString(),
          roles: ['master.master'],
          system: null,
        },
        resource: { type: 'grant', id: grantId },
        scope: { type: 'state', ids: ['MH'] },
        before: null,
        after: { role: 'admin.state_admin', invitee: 'ravi@beautinique.example' },
        reason: null,
        result: 'success',
        ip: '203.0.113.9',
        userAgent: 'Chrome on Windows',
        requestId: 'req-1',
        at: '2026-11-15T10:00:00.000Z',
      },
    });
    if (!subscription) throw new Error('no identity audit subscription');
    await withTransaction(core.runtime.mongo, (session) => subscription.handle(event, session));
    const [stored] = await chainOf(today());
    expect(stored).toMatchObject({
      source: 'identity',
      action: 'iam.grant.give',
      eventId: new ObjectId(event.eventId),
      actor: { userId: new ObjectId(actorId), app: 'master', roles: ['master.master'] },
      resource: { type: 'grant', id: new ObjectId(grantId) },
      // a state stays its code
      scope: { type: 'state', ids: ['MH'] },
      at: new Date('2026-11-15T10:00:00.000Z'),
      result: 'success',
    });
    // masked again on the way in, whatever the producer did
    expect(JSON.parse(stored?.after ?? 'null')).toMatchObject({
      invitee: 'r•••@beautinique.example',
    });

    // a refused request's scope comes as sent, never checked: kept as text, never a failure
    const refused = auditRecorded.envelope.parse({
      ...event,
      eventId: new ObjectId().toHexString(),
      data: {
        ...event.data,
        result: 'denied',
        resource: { type: 'user', id: 'not-an-id' },
        scope: { type: 'district', ids: ['x'] },
      },
    });
    await withTransaction(core.runtime.mongo, (session) => subscription.handle(refused, session));
    expect((await chainOf(today())).at(-1)).toMatchObject({
      result: 'denied',
      resource: { type: 'user', id: 'not-an-id' },
      scope: { type: 'district', ids: ['x'] },
    });
  });
});

describe('the viewer routes (Master app)', () => {
  const passportOf = (userId: ObjectId): Passport => ({
    userId: userId.toHexString(),
    sessionId: new ObjectId().toHexString(),
    app: 'master',
    methods: ['password', 'totp'],
    authzVersion: 1,
  });
  /** Someone in the Master app with these permissions in core's copy of the grants. */
  async function caller(permissions: string[]): Promise<Passport> {
    const userId = new ObjectId();
    const roleId = new ObjectId();
    await look.mongo.db.collection<RoleCopy>(ROLE_COPIES).insertOne({
      _id: roleId,
      key: 'master.internal_auditor',
      app: 'master',
      permissions,
      scopeTypes: ['global'],
      mfaRequired: false,
      retired: false,
      changedAt: new Date(),
    });
    await look.mongo.db.collection<AccessCopy>(ACCESS_COPIES).insertOne({
      _id: userId,
      authzVersion: 1,
      grants: [
        {
          grantId: new ObjectId(),
          roleId,
          app: 'master',
          scope: { type: 'global', ids: [] },
          validFrom: null,
          validTo: null,
        },
      ],
      copiedAt: new Date(),
    });
    return passportOf(userId);
  }
  const as = (passport: Passport | null) =>
    createClient({
      baseUrl: core.url,
      app: 'master',
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (passport) {
          headers.set(HEADERS.passport, signer.sign(passport, passportAudience('core')));
        }
        return fetch(input, { ...init, headers });
      },
    });

  it('lists the entries newest first, page by page, with filters and the actor half hidden', async () => {
    const auditor = await caller(['iam.app.sign_in', 'audit.entry.read']);
    const asha = new ObjectId();
    await look.mongo.db.collection<UserCopy>(USER_COPIES).insertOne({
      _id: asha,
      email: 'asha@beautinique.example',
      status: 'active',
      createdAt: new Date(),
      changedAt: new Date(),
    });
    const grantId = new ObjectId();
    const byAsha = { ...system, userId: asha, app: 'master' as const, system: null };
    await write({
      action: 'iam.grant.give',
      actor: byAsha,
      resource: { type: 'grant', id: grantId },
      at: new Date('2026-11-14T10:00:00.000Z'),
    });
    await write({ action: 'iam.role.update', resource: { type: 'role', id: 'admin.c_desk' } });
    await write({ action: 'identity.session.reuseDetected', result: 'denied' });
    const client = as(auditor);

    const first = await client.call(listAuditEntries, { query: { limit: 2 } });
    expect(first.items.map((item) => item.action)).toEqual([
      'identity.session.reuseDetected',
      'iam.role.update',
    ]);
    const second = await client.call(listAuditEntries, {
      query: { limit: 2, cursor: first.nextCursor ?? undefined },
    });
    expect(second.items.map((item) => item.action)).toEqual(['iam.grant.give']);
    expect(second.nextCursor).toBeNull();
    expect(second.items[0]).toMatchObject({
      actor: { userId: asha.toHexString(), email: 'a•••@beautinique.example' },
      resource: { type: 'grant', id: grantId.toHexString() },
      at: '2026-11-14T10:00:00.000Z',
      seq: 1,
      day: today(),
    });

    const by = async (query: Record<string, string>) =>
      (await client.call(listAuditEntries, { query: { limit: 20, ...query } })).items.map(
        (item) => item.action,
      );
    expect(await by({ actorId: asha.toHexString() })).toEqual(['iam.grant.give']);
    expect(await by({ action: 'iam.role.update' })).toEqual(['iam.role.update']);
    expect(await by({ result: 'denied' })).toEqual(['identity.session.reuseDetected']);
    expect(await by({ resourceType: 'grant', resourceId: grantId.toHexString() })).toEqual([
      'iam.grant.give',
    ]);
    expect(await by({ resourceType: 'role', resourceId: 'admin.c_desk' })).toEqual([
      'iam.role.update',
    ]);
    expect(await by({ to: '2026-11-14T23:59:59.000Z' })).toEqual(['iam.grant.give']);
    // an id names a thing only with its type
    await expect(
      client.call(listAuditEntries, { query: { resourceId: grantId.toHexString() } }),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    expect(await by({ from: '2026-11-15T00:00:00.000Z' })).not.toContain('iam.grant.give');
  });

  it("shows each day's length and check, within a range of at most the allowed days", async () => {
    const auditor = await caller(['iam.app.sign_in', 'audit.entry.read']);
    await write();
    await write();
    const client = as(auditor);
    const day = today();
    expect(await client.call(listAuditDays, { query: { from: day, to: day } })).toEqual({
      items: [{ day, entries: 2, check: null }],
    });
    await verifyChains(core.runtime.audit, captureLogger().logger, tomorrow());
    expect(await client.call(listAuditDays, { query: { from: day, to: day } })).toMatchObject({
      items: [{ day, entries: 2, check: { ok: true, entries: 2, brokenAtSeq: null } }],
    });
    await expect(
      client.call(listAuditDays, { query: { from: '2026-01-01', to: '2026-12-31' } }),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    await expect(
      client.call(listAuditDays, { query: { from: '2026-11-15', to: '2026-11-01' } }),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
  });

  it('answers 401 without a passport and 403 without the read permission', async () => {
    await expect(as(null).call(listAuditEntries, { query: {} })).rejects.toMatchObject({
      status: 401,
    });
    const other = await caller(['iam.app.sign_in', 'iam.grant.read']);
    await expect(as(other).call(listAuditEntries, { query: {} })).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
    });
    await expect(
      as(other).call(listAuditDays, { query: { from: today(), to: today() } }),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe('the CSV export (T4.1 PR D)', () => {
  const passportOf = (userId: ObjectId): Passport => ({
    userId: userId.toHexString(),
    sessionId: new ObjectId().toHexString(),
    app: 'master',
    methods: ['password', 'totp'],
    authzVersion: 1,
  });
  async function caller(permissions: string[]): Promise<Passport> {
    const userId = new ObjectId();
    const roleId = new ObjectId();
    await look.mongo.db.collection<RoleCopy>(ROLE_COPIES).insertOne({
      _id: roleId,
      key: 'master.internal_auditor',
      app: 'master',
      permissions,
      scopeTypes: ['global'],
      mfaRequired: false,
      retired: false,
      changedAt: new Date(),
    });
    await look.mongo.db.collection<AccessCopy>(ACCESS_COPIES).insertOne({
      _id: userId,
      authzVersion: 1,
      grants: [
        {
          grantId: new ObjectId(),
          roleId,
          app: 'master',
          scope: { type: 'global', ids: [] },
          validFrom: null,
          validTo: null,
        },
      ],
      copiedAt: new Date(),
    });
    return passportOf(userId);
  }
  const as = (passport: Passport | null) =>
    createClient({
      baseUrl: core.url,
      app: 'master',
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (passport) {
          headers.set(HEADERS.passport, signer.sign(passport, passportAudience('core')));
          headers.set(HEADERS.clientIp, '203.0.113.7');
        }
        return fetch(input, { ...init, headers });
      },
    });
  /** The file's lines, its BOM checked and taken off. */
  async function linesOf(blob: Blob): Promise<string[]> {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const text = new TextDecoder().decode(bytes);
    expect(text.endsWith('\r\n')).toBe(true);
    return text.slice(0, -2).split('\r\n');
  }

  it('gives the filtered entries newest first, actors half hidden, formulas kept as text, and logs the export', async () => {
    const auditor = await caller(['iam.app.sign_in', 'audit.entry.export']);
    const asha = new ObjectId();
    await look.mongo.db.collection<UserCopy>(USER_COPIES).insertOne({
      _id: asha,
      email: 'asha@beautinique.example',
      status: 'active',
      createdAt: new Date(),
      changedAt: new Date(),
    });
    const grantId = new ObjectId();
    await write({
      action: 'iam.grants.give',
      actor: { ...system, userId: asha, app: 'master', roles: ['master.master'], system: null },
      resource: { type: 'grant', id: grantId },
      scope: { type: 'state', ids: ['MH'] },
      after: { email: 'ravi@beautinique.example', role: 'admin.state_admin' },
      reason: '=HYPERLINK("https://x.example")',
      at: new Date('2026-11-14T20:00:05.000Z'),
    });
    await write({ action: 'iam.roles.update', resource: { type: 'role', id: 'admin.c_desk' } });
    await write({ action: 'identity.session.reuseDetected', result: 'denied' });

    const file = await as(auditor).download(exportAuditEntries, { query: {} });
    expect(file.fileName).toBe(`beautinique-audit-log-${istDateKey(new Date())}.csv`);
    const [header, ...rows] = await linesOf(file.blob);
    expect(header).toBe(AUDIT_CSV_COLUMNS.map((column) => `"${column.header}"`).join(','));
    expect(rows).toHaveLength(3);
    expect(rows[0]).toContain(
      '"identity.session.reuseDetected","Copied session stopped","denied","System (core.test)"',
    );
    const grant = rows[2] ?? '';
    expect(
      grant.startsWith(
        '"2026-11-15 01:30:05","iam.grants.give","Role given","success","a•••@beautinique.example",',
      ),
    ).toBe(true);
    expect(grant).toContain(
      `"${asha.toHexString()}","master","master.master","grant","${grantId.toHexString()}","state: MH"`,
    );
    // a cell a spreadsheet would run is text, its quotes doubled; what changed is masked
    expect(grant).toContain(`"'=HYPERLINK(""https://x.example"")"`);
    expect(grant).toContain('""email"":""r•••@beautinique.example""');
    expect(grant).toContain(`"core","${today()}",1,"`);

    // by a filter, like the list
    const denied = await as(auditor).download(exportAuditEntries, { query: { result: 'denied' } });
    expect(await linesOf(denied.blob)).toHaveLength(2);

    // each export is an entry of its own: who, from where, which filters and how many rows
    const exports = await entries()
      .find({ action: 'audit.entries.export' })
      .sort({ _id: 1 })
      .toArray();
    expect(exports).toHaveLength(2);
    expect(exports[0]).toMatchObject({
      actor: {
        userId: new ObjectId(auditor.userId),
        app: 'master',
        roles: ['master.internal_auditor'],
      },
      resource: { type: 'audit_log', id: null },
      result: 'success',
      ip: '203.0.113.7',
    });
    expect(JSON.parse(exports[0]?.after ?? '{}')).toEqual({ filters: {}, rows: 3 });
    expect(JSON.parse(exports[1]?.after ?? '{}')).toEqual({
      filters: { result: 'denied' },
      rows: 1,
    });
  });

  it('answers 401 without a passport, 403 with only the read permission, 400 for an id without its type', async () => {
    await expect(as(null).download(exportAuditEntries, { query: {} })).rejects.toMatchObject({
      status: 401,
    });
    const reader = await caller(['iam.app.sign_in', 'audit.entry.read']);
    await expect(as(reader).download(exportAuditEntries, { query: {} })).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
    });
    const auditor = await caller(['iam.app.sign_in', 'audit.entry.export']);
    await expect(
      as(auditor).download(exportAuditEntries, {
        query: { resourceId: new ObjectId().toHexString() },
      }),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    // nothing was exported, so nothing is in the log
    expect(await entries().countDocuments({ action: 'audit.entries.export' })).toBe(0);
  });

  it('refuses more than 50,000 matching entries with a 422, never a cut file, and takes narrower filters', async () => {
    const auditor = await caller(['iam.app.sign_in', 'audit.entry.export']);
    const at = new Date();
    const many = Array.from({ length: AUDIT_EXPORT_MAX_ROWS + 1 }, (_, seq) => ({
      _id: new ObjectId(),
      day: '2000-01-01',
      seq: seq + 1,
      prevHash: '',
      hash: '',
      at,
      source: 'core' as const,
      action: 'test.bulk.write',
      actor: system,
      resource: { type: 'test', id: null },
      scope: null,
      before: null,
      after: null,
      reason: null,
      result: 'success' as const,
      ip: null,
      userAgent: null,
      requestId: null,
      eventId: null,
    }));
    await look.auditDb.collection<AuditEntry>(AUDIT_ENTRIES).insertMany(many, { ordered: false });
    await write({ action: 'iam.roles.update', resource: { type: 'role', id: 'admin.c_desk' } });
    await expect(as(auditor).download(exportAuditEntries, { query: {} })).rejects.toMatchObject({
      status: 422,
      code: 'EXPORT_TOO_LARGE',
      message: 'More than 50,000 entries match. Narrow the dates or filters.',
    });
    expect(await entries().countDocuments({ action: 'audit.entries.export' })).toBe(0);
    const narrow = await as(auditor).download(exportAuditEntries, {
      query: { action: 'iam.roles.update' },
    });
    expect(await linesOf(narrow.blob)).toHaveLength(2);
  }, 60_000);

  it('writes India time to the second, sortable', () => {
    expect(indiaTime(new Date('2026-11-14T20:00:05.000Z'))).toBe('2026-11-15 01:30:05');
    expect(indiaTime(new Date('2026-11-15T18:29:59.000Z'))).toBe('2026-11-15 23:59:59');
  });
});

describe('append only', () => {
  it('has no code in core that changes or removes an audit entry', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (path.endsWith('.ts')) files.push(path);
      }
    };
    walk(join(import.meta.dirname, '..', 'src'));
    const touches = files.flatMap((file) => {
      const text = readFileSync(file, 'utf8');
      // the entries' collection is opened in one place: the store
      const opens = text.includes('collection<AuditEntry>(AUDIT_ENTRIES)') ? [file] : [];
      return opens;
    });
    expect(touches.map((file) => file.replaceAll('\\', '/').split('/src/')[1])).toEqual([
      'modules/audit/store.ts',
    ]);
    const store = readFileSync(
      join(import.meta.dirname, '..', 'src/modules/audit/store.ts'),
      'utf8',
    );
    const used = [...store.matchAll(/\bentries\.(\w+)\(/g)].map((match) => match[1]);
    expect([...new Set(used)].sort()).toEqual(['insertOne']);
  });
});
