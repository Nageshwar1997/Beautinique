// The gateway and identity as the auth screens see them: the routes they call, answers a test can
// change, and the hint cookie identity sets and clears (in jsdom, a Set-Cookie of a fetch never
// reaches document.cookie, so the fake writes it).
import {
  type AppId,
  sessionHintCookieName,
  type StepUpAction,
} from '@beautinique/shared-contracts';

export const BASE_URL = 'https://bq.example/api/v1';
export const USER_ID = '6730a2b40000000000000001';
export const SESSION_ID = '6730a2b40000000000000002';
export const LOGIN_ID = '01920000-0000-7000-8000-000000000003';
export const CHALLENGE_ID = '01920000-0000-7000-8000-000000000004';
export const EMAIL = 'asha@beautinique.example';
export const PASSWORD = 'pink lipstick on a rainy day';
export const OTHER_SESSION_ID = '6730a2b40000000000000005';
export const SECRET = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP';
export const OTP_URI = `otpauth://totp/Beautinique:${encodeURIComponent(EMAIL)}?secret=${SECRET}&issuer=Beautinique`;
/** The authenticator code the fake takes (any other is wrong). */
export const GOOD_CODE = '123456';
export const RECOVERY_CODES = [
  'ABCDE-FGH23',
  'BCDEF-GH234',
  'CDEFG-H2345',
  'DEFGH-23456',
  'EFGH2-34567',
  'FGH23-4567A',
  'GH234-567AB',
  'H2345-67ABC',
  'JKLMN-PQRST',
  'KLMNP-QRSTU',
];

export const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const failure = (
  status: number,
  code: string,
  message = `${code} message`,
  details: { path: string[]; message: string }[] = [],
): Response => json(status, { error: { code, message, requestId: 'req-1', details } });

export const setHint = (app: AppId) => {
  document.cookie = `${sessionHintCookieName(app)}=1; Path=/; Secure`;
};
export const dropHint = (app: AppId) => {
  document.cookie = `${sessionHintCookieName(app)}=; Max-Age=0; Path=/; Secure`;
};
export const hintSet = (app: AppId) => document.cookie.includes(`${sessionHintCookieName(app)}=1`);

export interface FakeState {
  signedIn: boolean;
  authenticator: boolean;
  recoveryCodesLeft: number | null;
  /** The roles that keep the authenticator on (QA DR-011); none unless a test gives some */
  authenticatorRequiredBy: { name: string; app: AppId }[];
  steppedUp: boolean;
  /** A step-up for one change alone (QA DR-010): counts once, for it */
  steppedUpFor: StepUpAction | null;
}

export interface Sent {
  method: string;
  path: string;
  body: unknown;
}

/** An answer, or a promise of one: one held back (a slow server) or rejected (no connection). */
type Handler = (body: unknown) => Response | Promise<Response>;

export interface FakeIdentity {
  fetch: (input: URL | Request | string, init?: RequestInit) => Promise<Response>;
  sent: Sent[];
  /** `METHOD /path` (after /api/v1) → the answer, replacing the default for every call. */
  on: (route: string, handler: Handler) => void;
  /** Back to the default answer of `METHOD /path`. */
  off: (route: string) => void;
  /** `METHOD /path` of what was sent. */
  paths: () => string[];
  /** The session (the access and refresh cookies), the account's authenticator, a fresh step-up. */
  state: FakeState;
}

const challenge = (resendAfterMs = 60_000) => ({
  challengeId: CHALLENGE_ID,
  expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  resendAfter: new Date(Date.now() + resendAfterMs).toISOString(),
  resendsLeft: 3,
});

const me = (app: AppId, state: FakeState) => ({
  user: {
    userId: USER_ID,
    email: EMAIL,
    ageDeclaredAt: null,
    signUpApp: 'customer',
    providers: ['password'],
    authenticator: state.authenticator,
    recoveryCodesLeft: state.recoveryCodesLeft,
    authenticatorRequiredBy: state.authenticator ? state.authenticatorRequiredBy : [],
  },
  session: { sessionId: SESSION_ID, app, expiresAt: '2026-12-31T00:00:00.000Z' },
});

/** This device and a phone, in two apps. */
const sessions = (app: AppId) => [
  {
    sessionId: SESSION_ID,
    app,
    device: 'Chrome on Windows',
    ip: '203.0.113.7',
    createdAt: '2026-11-01T04:30:00.000Z',
    lastSeenAt: '2026-11-03T06:00:00.000Z',
    expiresAt: '2026-12-01T04:30:00.000Z',
    current: true,
  },
  {
    sessionId: OTHER_SESSION_ID,
    app: 'seller',
    device: 'Safari on iPhone',
    ip: '198.51.100.20',
    createdAt: '2026-10-20T10:00:00.000Z',
    lastSeenAt: '2026-11-02T15:45:00.000Z',
    expiresAt: '2026-11-20T10:00:00.000Z',
    current: false,
  },
];

const stepUpRequired = (action?: StepUpAction) =>
  failure(
    401,
    'STEP_UP_REQUIRED',
    'Please confirm with your authenticator code to continue.',
    action === undefined ? undefined : [{ path: ['for'], message: action }],
  );

/**
 * A fake identity for `app`; signed out unless `signedIn`, with an authenticator when
 * `authenticator` (10 recovery codes left).
 */
export function fakeIdentity(
  app: AppId,
  { signedIn = false, authenticator = false } = {},
): FakeIdentity {
  const handlers = new Map<string, Handler>();
  const fake: FakeIdentity = {
    sent: [],
    state: {
      signedIn,
      authenticator,
      recoveryCodesLeft: authenticator ? 10 : null,
      authenticatorRequiredBy: [],
      steppedUp: false,
      steppedUpFor: null,
    },
    on: (route, handler) => {
      handlers.set(route, handler);
    },
    off: (route) => {
      handlers.delete(route);
    },
    paths: () => fake.sent.map((request) => `${request.method} ${request.path}`),
    fetch: async (input, init) => {
      const request = new Request(input, init);
      const url = new URL(request.url);
      const path = url.pathname.replace(/^\/api\/v1/, '');
      const text = await request.text();
      const body: unknown = text === '' ? undefined : JSON.parse(text);
      fake.sent.push({ method: request.method, path, body });
      // an id in the path: a UUIDv7 (Redis: a sign-in, a challenge) or an ObjectId (a session)
      const route = `${request.method} ${path.replace(/\/(?:[0-9a-f-]{36}|[0-9a-f]{24})(?=\/|$)/g, '/:id')}`;
      const handler = handlers.get(route);
      if (handler) return await handler(body);
      const signIn = () => {
        fake.state.signedIn = true;
        setHint(app);
      };
      switch (route) {
        case 'GET /iam/me':
          return fake.state.signedIn
            ? json(200, { data: me(app, fake.state) })
            : failure(401, 'UNAUTHENTICATED');
        case 'POST /auth/refresh':
          if (!fake.state.signedIn) {
            dropHint(app);
            return failure(401, 'SESSION_EXPIRED', 'Please sign in again.');
          }
          return json(200, {
            data: {
              user: { userId: USER_ID, email: EMAIL },
              sessionId: SESSION_ID,
              expiresAt: '2026-12-31T00:00:00.000Z',
            },
          });
        case 'POST /auth/logout':
          fake.state.signedIn = false;
          dropHint(app);
          return json(200, { data: { signedOut: true } });
        case 'POST /auth/login':
          signIn();
          return json(200, {
            data: { next: 'signed-in', user: { userId: USER_ID, email: EMAIL } },
          });
        case 'POST /auth/login/:id/totp':
          signIn();
          return json(200, { data: { user: { userId: USER_ID, email: EMAIL } } });
        case 'POST /auth/login/:id/recovery':
          signIn();
          return json(200, {
            data: { user: { userId: USER_ID, email: EMAIL }, recoveryCodesLeft: 2 },
          });
        case 'POST /auth/login/:id/totp/enroll':
          return json(200, { data: { secret: SECRET, uri: OTP_URI } });
        case 'POST /auth/login/:id/totp/confirm':
          // the cookies come with the codes, as identity sets them
          signIn();
          fake.state.authenticator = true;
          fake.state.recoveryCodesLeft = 10;
          return json(200, {
            data: { user: { userId: USER_ID, email: EMAIL }, recoveryCodes: RECOVERY_CODES },
          });
        case 'POST /auth/sign-up/code':
        case 'POST /auth/password/code':
        case 'POST /auth/invitations/code':
          return json(200, { data: challenge() });
        case 'POST /auth/otp/:id/resend':
          return json(200, { data: challenge() });
        case 'POST /auth/otp/:id/verify':
          signIn();
          return json(200, {
            data: { userId: USER_ID, email: EMAIL, outcome: 'account-made', signedIn: true },
          });
        case 'GET /auth/sessions':
          return json(200, { data: { sessions: sessions(app) } });
        case 'DELETE /auth/sessions/:id':
          return json(200, { data: { ended: true } });
        case 'POST /auth/sessions/end-others':
          return json(200, { data: { ended: 1 } });
        case 'POST /auth/authenticator/enroll':
          // a new phone: a step-up of its own, used once (as identity, QA DR-010)
          if (fake.state.authenticator) {
            if (fake.state.steppedUpFor !== 'authenticator.replace') {
              return stepUpRequired('authenticator.replace');
            }
            fake.state.steppedUpFor = null;
          }
          return json(200, { data: { secret: SECRET, uri: OTP_URI } });
        case 'POST /auth/authenticator/confirm':
          fake.state.authenticator = true;
          fake.state.recoveryCodesLeft = 10;
          return json(200, { data: { recoveryCodes: RECOVERY_CODES } });
        case 'POST /auth/authenticator/recovery-codes':
          if (!fake.state.steppedUp) return stepUpRequired();
          fake.state.recoveryCodesLeft = 10;
          return json(200, { data: { recoveryCodes: RECOVERY_CODES } });
        case 'DELETE /auth/authenticator':
          if (fake.state.steppedUpFor !== 'authenticator.disable') {
            return stepUpRequired('authenticator.disable');
          }
          fake.state.steppedUpFor = null;
          fake.state.authenticator = false;
          fake.state.recoveryCodesLeft = null;
          return json(200, { data: { disabled: true } });
        case 'POST /auth/step-up': {
          const {
            code,
            recoveryCode,
            for: action,
          } = body as { code?: string; recoveryCode?: string; for?: StepUpAction };
          const stepUpUntil = new Date(Date.now() + 300_000).toISOString();
          const stepped = () => {
            if (action === undefined) fake.state.steppedUp = true;
            else fake.state.steppedUpFor = action;
          };
          if (code !== undefined) {
            if (code !== GOOD_CODE) {
              return failure(400, 'TOTP_INVALID', 'That authenticator code is not right.');
            }
            stepped();
            return json(200, { data: { stepUpUntil, recoveryCodesLeft: null } });
          }
          if (recoveryCode !== RECOVERY_CODES[0]) {
            return failure(400, 'RECOVERY_CODE_INVALID', 'That recovery code is not right.');
          }
          stepped();
          fake.state.recoveryCodesLeft = (fake.state.recoveryCodesLeft ?? 1) - 1;
          return json(200, {
            data: { stepUpUntil, recoveryCodesLeft: fake.state.recoveryCodesLeft },
          });
        }
        default:
          return failure(404, 'NOT_FOUND', `No fake for ${route}`);
      }
    },
  };
  return fake;
}

/** A sign-in that asks the authenticator code next. */
export const totpNext = () => json(200, { data: { next: 'totp', loginId: LOGIN_ID } });

/** A sign-in in an app that needs an authenticator, for an account without one: set it up. */
export const enrollNext = () => json(200, { data: { next: 'totp-enroll', loginId: LOGIN_ID } });

/** A verify for an email that has an account with a password (sign-up does not change it). */
export const passwordKept = () =>
  json(200, {
    data: { userId: USER_ID, email: EMAIL, outcome: 'password-kept', signedIn: false },
  });

/** A code request whose new code may be asked at once (no wait). */
export const challengeNow = () => json(200, { data: challenge(0) });
