// The gateway and identity as the auth screens see them: the routes they call, answers a test can
// change, and the hint cookie identity sets and clears (in jsdom, a Set-Cookie of a fetch never
// reaches document.cookie, so the fake writes it).
import { type AppId, sessionHintCookieName } from '@beautinique/shared-contracts';

export const BASE_URL = 'https://bq.example/api/v1';
export const USER_ID = '01920000-0000-7000-8000-000000000001';
export const SESSION_ID = '01920000-0000-7000-8000-000000000002';
export const LOGIN_ID = '01920000-0000-7000-8000-000000000003';
export const CHALLENGE_ID = '01920000-0000-7000-8000-000000000004';
export const EMAIL = 'asha@beautinique.example';
export const PASSWORD = 'pink lipstick on a rainy day';

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

export interface Sent {
  method: string;
  path: string;
  body: unknown;
}

type Handler = (body: unknown) => Response;

export interface FakeIdentity {
  fetch: (input: URL | Request | string, init?: RequestInit) => Promise<Response>;
  sent: Sent[];
  /** `METHOD /path` (after /api/v1) → the answer, replacing the default for every call. */
  on: (route: string, handler: Handler) => void;
  /** Back to the default answer of `METHOD /path`. */
  off: (route: string) => void;
  /** `METHOD /path` of what was sent. */
  paths: () => string[];
  /** Whether a session is there (the access cookie and the refresh cookie). */
  state: { signedIn: boolean };
}

const challenge = (resendAfterMs = 60_000) => ({
  challengeId: CHALLENGE_ID,
  expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  resendAfter: new Date(Date.now() + resendAfterMs).toISOString(),
  resendsLeft: 3,
});

const me = (app: AppId) => ({
  user: {
    userId: USER_ID,
    email: EMAIL,
    ageDeclaredAt: null,
    signUpApp: 'customer',
    providers: ['password'],
    authenticator: false,
    recoveryCodesLeft: null,
  },
  session: { sessionId: SESSION_ID, app, expiresAt: '2026-12-31T00:00:00.000Z' },
});

/** A fake identity for `app`; signed out unless `signedIn`. */
export function fakeIdentity(app: AppId, { signedIn = false } = {}): FakeIdentity {
  const handlers = new Map<string, Handler>();
  const fake: FakeIdentity = {
    sent: [],
    state: { signedIn },
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
      const route = `${request.method} ${path.replace(/\/[0-9a-f-]{36}(?=\/|$)/g, '/:id')}`;
      const handler = handlers.get(route);
      if (handler) return handler(body);
      const signIn = () => {
        fake.state.signedIn = true;
        setHint(app);
      };
      switch (route) {
        case 'GET /iam/me':
          return fake.state.signedIn
            ? json(200, { data: me(app) })
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
        default:
          return failure(404, 'NOT_FOUND', `No fake for ${route}`);
      }
    },
  };
  return fake;
}

/** A sign-in that asks the authenticator code next. */
export const totpNext = () => json(200, { data: { next: 'totp', loginId: LOGIN_ID } });

/** A verify for an email that has an account with a password (sign-up does not change it). */
export const passwordKept = () =>
  json(200, {
    data: { userId: USER_ID, email: EMAIL, outcome: 'password-kept', signedIn: false },
  });

/** A code request whose new code may be asked at once (no wait). */
export const challengeNow = () => json(200, { data: challenge(0) });
