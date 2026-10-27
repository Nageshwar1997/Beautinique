import { describe, expect, it } from 'vitest';

import {
  APPS,
  events,
  getPing,
  isPermissionKey,
  OTP_PURPOSES,
  otpRequested,
  otpSealContext,
  permissions,
  pingRead,
  pingRecorded,
  recordPing,
  routes,
  wake,
} from '../src';

const id = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';
const data = { pingId: id, note: 'hello', recordedAt: '2026-10-22T10:00:00.000Z' };

describe('platform catalogue (Milestone 1 sample)', () => {
  it('has the sample routes, event and permission, all registered', () => {
    expect(routes.map((r) => r.id)).toEqual([
      'platform.ping.record',
      'platform.ping.get',
      'platform.server.wake',
    ]);
    expect(events.latest('platform.ping.recorded')).toBe(pingRecorded);
    expect(permissions.get(pingRead.key)).toBe(pingRead);
    expect(isPermissionKey(pingRead.key)).toBe(true);
  });

  it('record is a public, idempotent write for every app; get needs the read permission', () => {
    expect(recordPing).toMatchObject({
      method: 'POST',
      idempotency: true,
      rateLimit: 'write',
      owner: 'core',
    });
    expect(recordPing.access).toEqual({ type: 'public' });
    // a write is never CDN-cached
    expect('cache' in recordPing).toBe(false);
    expect(recordPing.apps).toEqual(APPS);
    expect(getPing.access).toEqual({ type: 'permission', permission: 'platform.ping.read' });
    expect(getPing.method).toBe('GET');
    // wake is a public GET for every app that core answers, never from the CDN (a cached answer
    // would wake nothing)
    expect(wake).toMatchObject({ method: 'GET', path: '/platform/wake', owner: 'core' });
    expect(wake.access).toEqual({ type: 'public' });
    expect(wake.apps).toEqual(APPS);
    expect('cache' in wake).toBe(false);
    expect(wake.output.safeParse({ awakeAt: '2026-10-26T10:00:00.000Z' }).success).toBe(true);
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

describe('identity catalogue', () => {
  const challengeId = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5c';
  const otp = {
    challengeId,
    email: ' Riya@Beautinique.Example ',
    app: 'customer',
    purpose: 'sign-in',
    sealedCode: 'v1.e1.AAAAAAAAAAAAAAAA.BBBBBBBB.CCCCCCCCCCCCCCCCCCCCCC',
    expiresAt: '2026-10-27T10:10:00.000Z',
  };

  it('registers identity.otp.requested from identity, with a sealed code and a normalised email', () => {
    expect(events.latest('identity.otp.requested')).toBe(otpRequested);
    expect(otpRequested.producer).toBe('identity');
    const parsed = otpRequested.data.parse(otp);
    expect(parsed.email).toBe('riya@beautinique.example');
    expect(OTP_PURPOSES).toEqual(['sign-in', 'sign-up']);
    expect(otpSealContext(challengeId)).toBe(`identity.otp:${challengeId}`);
  });

  it('refuses a plain code, another purpose and an app that does not exist', () => {
    for (const change of [
      { sealedCode: '482913' },
      { sealedCode: 'v2.e1.a.b.c' },
      { sealedCode: `v1.e1.${'a'.repeat(200)}.b.c` },
      { purpose: 'reset' },
      { app: 'shop' },
      { email: 'not-an-email' },
    ]) {
      expect(
        otpRequested.data.safeParse({ ...otp, ...change }).success,
        JSON.stringify(change),
      ).toBe(false);
    }
  });
});
