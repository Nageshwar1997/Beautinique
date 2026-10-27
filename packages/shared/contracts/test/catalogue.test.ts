import { describe, expect, it } from 'vitest';

import {
  APPS,
  confirmTotpEnroll,
  consentProblems,
  events,
  getPing,
  IDENTITY_ERROR_CODES,
  isPermissionKey,
  loginRecovery,
  loginTotp,
  OTP_PURPOSES,
  otpRequested,
  otpSealContext,
  passwordLogin,
  permissions,
  pingRead,
  pingRecorded,
  recordPing,
  recoveryCodeZod,
  requestPasswordCode,
  requestSignUpCode,
  resendOtp,
  routes,
  SIGN_UP_APPS,
  startTotpEnroll,
  TOTP_REQUIRED_APPS,
  verifyOtp,
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
      'auth.signUp.code',
      'auth.password.code',
      'auth.otp.resend',
      'auth.otp.verify',
      'auth.login.password',
      'auth.login.totp',
      'auth.login.recovery',
      'auth.login.totpEnroll',
      'auth.login.totpConfirm',
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
    expect(OTP_PURPOSES).toEqual(['sign-in', 'sign-up', 'password']);
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

describe('sign-in routes', () => {
  const all = [
    requestSignUpCode,
    requestPasswordCode,
    resendOtp,
    verifyOtp,
    passwordLogin,
    loginTotp,
    loginRecovery,
    startTotpEnroll,
    confirmTotpEnroll,
  ];

  it('are public identity routes; sign-up only in the sign-up apps, the rest in every app', () => {
    for (const route of all) {
      expect(route, route.id).toMatchObject({ owner: 'identity', access: { type: 'public' } });
      expect(route.idempotency).toBe(false);
      expect(route.apps).toEqual(route === requestSignUpCode ? SIGN_UP_APPS : APPS);
    }
    expect(all.map((route) => route.rateLimit)).toEqual([
      'otp',
      'otp',
      'otp',
      'auth',
      'auth',
      'auth',
      'auth',
      'auth',
      'auth',
    ]);
    expect(SIGN_UP_APPS).not.toContain('delivery');
    expect(SIGN_UP_APPS).not.toContain('admin');
    expect(IDENTITY_ERROR_CODES).toMatchObject({
      OTP_INVALID: 400,
      OTP_EMAIL_LIMIT: 429,
      INVALID_CREDENTIALS: 401,
      LOGIN_EXPIRED: 400,
    });
  });

  it('ask the authenticator at every sign-in of the 7 internal apps', () => {
    expect(TOTP_REQUIRED_APPS.toSorted()).toEqual(
      APPS.filter((app) => !['customer', 'seller', 'creator', 'delivery'].includes(app)).toSorted(),
    );
  });

  it('take a normalised email, a six-digit code and a new password of 12 to 128 characters', () => {
    expect(requestSignUpCode.input.body.parse({ email: ' Riya@Beautinique.Example ' }).email).toBe(
      'riya@beautinique.example',
    );
    const password = 'a long enough one';
    expect(verifyOtp.input.body.safeParse({ code: '48291', password }).success).toBe(false);
    expect(verifyOtp.input.body.safeParse({ code: '482913', password }).success).toBe(true);
    expect(verifyOtp.input.body.safeParse({ code: '482913', password: 'short' }).success).toBe(
      false,
    );
    expect(
      requestSignUpCode.input.body.safeParse({ email: 'a@b.example', consent: { terms: false } })
        .success,
    ).toBe(false);
    expect(requestPasswordCode.input.body.safeParse({ email: 'a@b.example' }).success).toBe(true);
  });

  it('sign in with any password the person gives (the rules are for new ones), up to 128', () => {
    const body = passwordLogin.input.body;
    expect(body.safeParse({ email: 'a@b.example', password: 'old' }).success).toBe(true);
    expect(body.safeParse({ email: 'a@b.example', password: '' }).success).toBe(false);
    expect(body.safeParse({ email: 'a@b.example', password: 'x'.repeat(129) }).success).toBe(false);
  });

  it('take a recovery code in any case, with or without the hyphen', () => {
    expect(recoveryCodeZod.parse(' abcde-fgh23 ')).toBe('ABCDE-FGH23');
    expect(recoveryCodeZod.parse('ABCDEFGH23')).toBe('ABCDEFGH23');
    for (const code of ['ABCDE-FGH1', 'ABCD-EFGH23', 'ABCDE--FGH23', '']) {
      expect(recoveryCodeZod.safeParse(code).success, code).toBe(false);
    }
    expect(
      confirmTotpEnroll.output.safeParse({
        user: { userId: '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b', email: 'a@b.example' },
        recoveryCodes: ['ABCDE-FGH23'],
      }).success,
    ).toBe(false);
  });

  it('ask the terms in every sign-up app, and 18 or older in the customer app only', () => {
    expect(consentProblems('customer', undefined).map((p) => p.path.join('.'))).toEqual([
      'consent.terms',
      'consent.adult',
    ]);
    expect(consentProblems('customer', { terms: true }).map((p) => p.path.join('.'))).toEqual([
      'consent.adult',
    ]);
    expect(consentProblems('customer', { terms: true, adult: true })).toEqual([]);
    expect(consentProblems('seller', { terms: true })).toEqual([]);
    expect(consentProblems('creator', undefined)).toHaveLength(1);
    expect(consentProblems('delivery', undefined)).toEqual([]);
    expect(consentProblems('admin', undefined)).toEqual([]);
  });
});
