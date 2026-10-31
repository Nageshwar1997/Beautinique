import { describe, expect, it } from 'vitest';

import {
  ACCESS_TOKEN_SECONDS,
  accessCookieName,
  APPS,
  AUTH_PROVIDERS,
  AUTHENTICATOR_CHANGES,
  authenticatorChanged,
  confirmAuthenticator,
  confirmTotpEnroll,
  consentProblems,
  disableAuthenticator,
  endOtherSessions,
  endSession,
  enrollAuthenticator,
  events,
  getMe,
  getPing,
  HEADERS,
  IDENTITY_ERROR_CODES,
  IDENTITY_JWKS_PATH,
  isPermissionKey,
  listSessions,
  loginRecovery,
  loginTotp,
  logout,
  newRecoveryCodes,
  OTP_PURPOSES,
  otpRequested,
  otpSealContext,
  PASSPORT_ISSUER,
  PASSPORT_JWKS_PATH,
  PASSPORT_SECONDS,
  passportAudience,
  passwordLogin,
  permissions,
  pingRead,
  pingRecorded,
  recordPing,
  recoveryCodeZod,
  REFRESH_COOKIE_PATH,
  refreshCookieName,
  refreshSession,
  requestPasswordCode,
  requestSignUpCode,
  resendOtp,
  routes,
  SESSION_POLICIES,
  sessionReuseDetected,
  SIGN_UP_APPS,
  startTotpEnroll,
  stepUp,
  TOKEN_ISSUER,
  tokenAudience,
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
      'auth.session.refresh',
      'auth.session.logout',
      'iam.me.get',
      'auth.sessions.list',
      'auth.sessions.end',
      'auth.sessions.endOthers',
      'auth.authenticator.enroll',
      'auth.authenticator.confirm',
      'auth.authenticator.recoveryCodes',
      'auth.authenticator.disable',
      'iam.roles.list',
      'iam.roles.create',
      'iam.roles.update',
      'iam.grants.list',
      'iam.grants.give',
      'iam.grants.end',
      'iam.invitations.create',
      'iam.invitations.list',
      'iam.invitations.revoke',
      'auth.invitations.code',
      'auth.stepUp.verify',
      'iam.users.resetAuthenticator',
      'iam.users.endSessions',
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
    expect(OTP_PURPOSES).toEqual(['sign-in', 'sign-up', 'password', 'invite']);
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

describe('sessions', () => {
  it('last 30 days (up to 90) in customer and creator, 7 seller, 14 delivery, 12 hours internal', () => {
    const day = 24 * 60 * 60_000;
    expect(SESSION_POLICIES.customer).toEqual({ slidingMs: 30 * day, maxMs: 90 * day });
    expect(SESSION_POLICIES.creator).toEqual(SESSION_POLICIES.customer);
    expect(SESSION_POLICIES.seller).toEqual({ slidingMs: 7 * day, maxMs: 7 * day });
    expect(SESSION_POLICIES.delivery).toEqual({ slidingMs: 14 * day, maxMs: 14 * day });
    for (const app of TOTP_REQUIRED_APPS) {
      expect(SESSION_POLICIES[app], app).toEqual({
        slidingMs: 12 * 60 * 60_000,
        maxMs: 12 * 60 * 60_000,
        idleMs: 30 * 60_000,
      });
    }
    expect(Object.keys(SESSION_POLICIES).toSorted()).toEqual([...APPS].toSorted());
    expect(ACCESS_TOKEN_SECONDS).toBe(600);
  });

  it('keep each app’s cookies on its own host; the refresh cookie only for /api/v1/auth', () => {
    expect(accessCookieName('seller')).toBe('__Host-bq_seller_at');
    expect(refreshCookieName('seller')).toBe('__Secure-bq_seller_rt');
    expect(REFRESH_COOKIE_PATH).toBe('/api/v1/auth');
    expect(tokenAudience('admin')).toBe('bq:admin');
    expect(TOKEN_ISSUER).toBe('bq:identity');
    for (const route of [refreshSession, logout]) {
      expect(route).toMatchObject({ access: { type: 'public' }, rateLimit: 'auth', apps: APPS });
      expect(`/api/v1${route.path}`.startsWith(REFRESH_COOKIE_PATH)).toBe(true);
    }
    expect(events.latest('identity.session.reuseDetected')).toBe(sessionReuseDetected);
  });
});

describe('the signed-in authenticator (ARCHITECTURE §9.2)', () => {
  const all = [enrollAuthenticator, confirmAuthenticator, newRecoveryCodes, disableAuthenticator];

  it('are signed-in identity routes in every app; new codes and turning off need a step-up', () => {
    for (const route of all) {
      expect(route, route.id).toMatchObject({
        access: { type: 'signed-in' },
        owner: 'identity',
        rateLimit: 'auth',
        idempotency: false,
        apps: APPS,
      });
    }
    expect(all.map((route) => route.stepUp)).toEqual([false, false, true, true]);
    expect(disableAuthenticator.method).toBe('DELETE');
    expect(IDENTITY_ERROR_CODES).toMatchObject({
      AUTHENTICATOR_EXISTS: 409,
      AUTHENTICATOR_SETUP_EXPIRED: 400,
      AUTHENTICATOR_REQUIRED_BY_ROLE: 409,
      PASSWORD_REQUIRED: 400,
      PASSWORD_INVALID: 400,
    });
  });

  it('confirm with a six-digit code and the account’s password, for 10 recovery codes', () => {
    const body = confirmAuthenticator.input.body;
    expect(body.safeParse({ code: '482913', password: 'old' }).success).toBe(true);
    expect(body.safeParse({ code: '482913' }).success).toBe(false);
    expect(body.safeParse({ code: '48291', password: 'old' }).success).toBe(false);
    expect(body.safeParse({ code: '482913', password: 'x'.repeat(129) }).success).toBe(false);
    const ten = Array.from({ length: 10 }, () => 'ABCDE-FGH23');
    for (const route of [confirmAuthenticator, newRecoveryCodes]) {
      expect(route.output.safeParse({ recoveryCodes: ten }).success).toBe(true);
      expect(route.output.safeParse({ recoveryCodes: ten.slice(1) }).success).toBe(false);
    }
  });

  it('step up with an authenticator code or a recovery code, never both or neither', () => {
    const body = stepUp.input.body;
    expect(body.safeParse({ code: '482913' }).success).toBe(true);
    expect(body.parse({ recoveryCode: 'abcde-fgh23' })).toEqual({ recoveryCode: 'ABCDE-FGH23' });
    expect(body.safeParse({}).success).toBe(false);
    expect(body.safeParse({ code: '482913', recoveryCode: 'ABCDE-FGH23' }).success).toBe(false);
    expect(body.safeParse({ recoveryCode: '482913' }).success).toBe(false);
    expect(stepUp.access).toEqual({ type: 'signed-in' });
  });

  it('count the recovery codes left in /iam/me (null without an authenticator)', () => {
    const user = getMe.output.shape.user;
    const me = {
      userId: id,
      email: 'a@b.example',
      ageDeclaredAt: null,
      signUpApp: 'customer',
      providers: ['password'],
      authenticator: true,
    };
    expect(user.safeParse({ ...me, recoveryCodesLeft: 3 }).success).toBe(true);
    expect(user.safeParse({ ...me, authenticator: false, recoveryCodesLeft: null }).success).toBe(
      true,
    );
    expect(user.safeParse({ ...me, recoveryCodesLeft: -1 }).success).toBe(false);
    expect(user.safeParse(me).success).toBe(false);
  });

  it('tell the person of every change by a security event with no secret in it', () => {
    expect(events.latest('identity.authenticator.changed')).toBe(authenticatorChanged);
    expect(AUTHENTICATOR_CHANGES).toEqual(['enabled', 'replaced', 'recovery-codes', 'disabled']);
    expect(Object.keys(authenticatorChanged.data.shape).sort()).toEqual([
      'app',
      'change',
      'changedAt',
      'device',
      'email',
      'userId',
    ]);
  });
});

describe('signed-in routes and the passport (T3.2 PR B)', () => {
  it('need a session in every app, and identity answers them', () => {
    for (const route of [getMe, listSessions, endSession, endOtherSessions]) {
      expect(route, route.id).toMatchObject({
        access: { type: 'signed-in' },
        owner: 'identity',
        apps: APPS,
      });
    }
    expect([getMe.rateLimit, listSessions.rateLimit]).toEqual(['read', 'read']);
    expect([endSession.rateLimit, endOtherSessions.rateLimit]).toEqual(['auth', 'auth']);
    expect(AUTH_PROVIDERS).toEqual(['password', 'google', 'linkedin', 'github']);
  });

  it('give each owner its own 60-second passport from the gateway', () => {
    expect(PASSPORT_ISSUER).toBe('bq:gateway');
    expect(PASSPORT_SECONDS).toBe(60);
    expect(passportAudience('identity')).toBe('bq:identity');
    expect(HEADERS.passport).toBe('X-BQ-Passport');
    expect([PASSPORT_JWKS_PATH, IDENTITY_JWKS_PATH]).toEqual([
      '/.well-known/passport-jwks.json',
      '/.well-known/jwks.json',
    ]);
  });
});
