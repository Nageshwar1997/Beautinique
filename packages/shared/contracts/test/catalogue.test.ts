import { describe, expect, it } from 'vitest';

import {
  APPS,
  events,
  getPing,
  isPermissionKey,
  permissions,
  pingRead,
  pingRecorded,
  recordPing,
  routes,
} from '../src';

const id = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';
const data = { pingId: id, note: 'hello', recordedAt: '2026-10-22T10:00:00.000Z' };

describe('platform catalogue (Milestone 1 sample)', () => {
  it('has the sample routes, event and permission, all registered', () => {
    expect(routes.map((r) => r.id)).toEqual(['platform.ping.record', 'platform.ping.get']);
    expect(events.latest('platform.ping.recorded')).toBe(pingRecorded);
    expect(permissions.get(pingRead.key)).toBe(pingRead);
    expect(isPermissionKey(pingRead.key)).toBe(true);
  });

  it('record is a signed-in, idempotent write for every app; get needs the read permission', () => {
    expect(recordPing).toMatchObject({
      method: 'POST',
      idempotency: true,
      rateLimit: 'write',
      owner: 'core',
    });
    expect(recordPing.access).toEqual({ type: 'signed-in' });
    expect(recordPing.apps).toEqual(APPS);
    expect(getPing.access).toEqual({ type: 'permission', permission: 'platform.ping.read' });
    expect(getPing.method).toBe('GET');
    for (const route of routes) {
      if (route.access.type === 'permission') {
        expect(permissions.has(route.access.permission)).toBe(true);
      }
    }
  });

  it('the event envelope and the route output share one data shape', () => {
    expect(recordPing.output.parse(data)).toEqual(data);
    const envelope = {
      eventId: id,
      type: 'platform.ping.recorded',
      version: 1,
      occurredAt: data.recordedAt,
      producer: 'core',
      aggregate: { type: 'ping', id },
      actor: { type: 'user', id: 'u1' },
      correlationId: 'c1',
      causationId: null,
      scope: null,
      data,
    };
    expect(pingRecorded.envelope.safeParse(envelope).success).toBe(true);
    expect(
      pingRecorded.envelope.safeParse({ ...envelope, data: { ...data, note: '' } }).success,
    ).toBe(false);
    expect(recordPing.input.body.safeParse({ note: 'x'.repeat(201) }).success).toBe(false);
  });
});
