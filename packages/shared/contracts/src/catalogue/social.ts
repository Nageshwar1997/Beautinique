import {
  array,
  boolean,
  emailZod,
  enum as zodEnum,
  isoDateTimeZod,
  object,
  string,
  uuidv7Zod,
} from '@beautinique/shared-zod';

import { defineEvent } from '../events';
import { type AppId, APPS } from '../platform';
import { defineRoute, navigationZod } from '../routes';
import { AUTH_PROVIDERS, LOGIN_NEXT, otpConsentZod, signedInZod } from './identity';

/**
 * Social sign-in (TASKS T3.1 PR 4, ARCHITECTURE §7.1): Google, LinkedIn and GitHub, in the
 * customer app only (owner, 2026-10-26). The browser goes to the provider and back itself
 * (navigation routes); identity talks to the provider server to server, and keeps each round trip
 * in Redis, bound to the browser that started it by a cookie.
 */
export const SOCIAL_PROVIDERS = ['google', 'linkedin', 'github'] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

/** The apps with social sign-in. */
export const SOCIAL_APPS = ['customer'] as const satisfies readonly AppId[];

/**
 * Why a social sign-in came back to the sign-in page (`/sign-in?oauth=<result>`), for its message:
 * the person cancelled at the provider; the round trip was too old or began in another browser; the
 * provider did not answer as it should; its email is not a verified one; the account is locked for
 * now (too many wrong tries).
 */
export const OAUTH_RESULTS = [
  'cancelled',
  'expired',
  'failed',
  'email-unverified',
  'locked',
] as const;
export type OAuthResult = (typeof OAUTH_RESULTS)[number];
export const OAUTH_RESULT_PARAM = 'oauth';
/**
 * An account with an authenticator goes on to the sign-in page's authenticator step:
 * `/sign-in#totp=<loginId>` (a fragment, so the id never reaches a server log or a Referer).
 */
export const OAUTH_TOTP_FRAGMENT = 'totp';
/** Where an account made with a provider gives its consent (18+, terms), in the app. */
export const OAUTH_SIGN_UP_PATH = '/sign-up/finish';

/** The round trip's cookies: on the app's host, sent to the OAuth routes only. */
export const OAUTH_COOKIE_PATH = '/api/v1/auth/oauth';
export const oauthStateCookieName = (app: AppId): string => `__Secure-bq_${app}_oauth`;
export const oauthSignUpCookieName = (app: AppId): string => `__Secure-bq_${app}_oauth_signup`;
/** A trip to the provider waits 10 minutes, a new account's consent 15. */
export const OAUTH_STATE_SECONDS = 600;
export const OAUTH_SIGN_UP_SECONDS = 900;

/** A path: one `/` first (`//host` and `/\host` leave the site), no space, backslash or control. */
// eslint-disable-next-line no-control-regex -- control characters are exactly what is refused
const PATH_ONLY = /^\/(?![/\\])[^\s\\\u0000-\u001f\u007f]*$/;

/**
 * A path of the app to come back to (`/account?tab=1#x`), never another site; anything else means
 * the home page (a page the browser opened cannot show a validation error). The answer is the path
 * as a browser goes there, its `.` and `..` segments resolved, and checked again after that:
 * `/..//evil.example` resolves to `//evil.example`, another site (QA-FE-001). The one rule of the
 * server (identity's OAuth `next`) and of the apps' sign-in pages (auth-ui `safeNext`, which allows
 * a longer `next`).
 */
export function safeNextPath(next: string | null | undefined, maxLength = 512): string {
  if (typeof next !== 'string' || next.length > maxLength || !PATH_ONLY.test(next)) return '/';
  const base = 'https://next.invalid';
  let url: URL;
  try {
    url = new URL(next, base);
  } catch {
    return '/';
  }
  if (url.origin !== base) return '/';
  const path = `${url.pathname}${url.search}${url.hash}`;
  return PATH_ONLY.test(path) ? path : '/';
}

const providerParams = object({ provider: zodEnum(SOCIAL_PROVIDERS) });

/**
 * The providers this app shows, and the one origin they work from (the redirect URLs registered
 * with them, IDENTITY__OAUTH_REDIRECT_ORIGIN): a Vercel preview or another host shows none.
 */
export const listSocialProviders = defineRoute({
  id: 'auth.socialProviders.list',
  method: 'GET',
  path: '/auth/oauth/providers',
  summary: 'The social sign-ins this app offers, and the origin they work from',
  apps: SOCIAL_APPS,
  access: { type: 'public' },
  rateLimit: 'public',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: {},
  output: object({
    providers: array(zodEnum(SOCIAL_PROVIDERS)),
    /** `https://beautinique-customer.vercel.app`; null when social sign-in is off */
    origin: string().nullable(),
  }),
});

/**
 * "Continue with Google": a page the browser opens. identity remembers the round trip (Redis, a
 * cookie for this browser, PKCE where the provider has it) and sends the browser to the provider.
 */
export const startSocialSignIn = defineRoute({
  id: 'auth.oauth.start',
  method: 'GET',
  path: '/auth/oauth/:provider/start',
  summary: 'Go to the provider to sign in (a page the browser opens)',
  apps: SOCIAL_APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  navigation: true,
  input: { params: providerParams, query: object({ next: string().max(2048).optional() }) },
  output: navigationZod,
});

/**
 * Where the provider sends the browser back (the redirect URL registered with it). Signed in, the
 * authenticator step, the consent of a new account, or the sign-in page with a reason
 * (OAUTH_RESULTS): never an error page.
 */
export const finishSocialSignIn = defineRoute({
  id: 'auth.oauth.callback',
  method: 'GET',
  path: '/auth/oauth/:provider/callback',
  summary: 'Back from the provider: sign in, or go on (a page the browser opens)',
  apps: SOCIAL_APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  navigation: true,
  input: {
    params: providerParams,
    query: object({
      code: string().max(2048).optional(),
      state: string().max(256).optional(),
      /** `access_denied` when the person cancelled */
      error: string().max(256).optional(),
    }),
  },
  output: navigationZod,
});

/** The new account waiting for its consent: which provider, and its email. */
export const getSocialSignUp = defineRoute({
  id: 'auth.socialSignUp.get',
  method: 'GET',
  path: '/auth/oauth/sign-up',
  summary: 'The account a provider is making, waiting for its consent',
  apps: SOCIAL_APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: {},
  output: object({
    provider: zodEnum(SOCIAL_PROVIDERS),
    email: emailZod,
    expiresAt: isoDateTimeZod,
    /** Where to go once signed in */
    next: string(),
  }),
});

/**
 * The consent (18 or older, terms and privacy) of an account a provider makes or brings to this
 * app: the account, the Customer role and the provider linked, then signed in (or the
 * authenticator step of an account that has one).
 */
export const finishSocialSignUp = defineRoute({
  id: 'auth.socialSignUp.finish',
  method: 'POST',
  path: '/auth/oauth/sign-up',
  summary: 'Give the consent and finish signing up with a provider',
  apps: SOCIAL_APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { body: object({ consent: otpConsentZod }) },
  output: object({
    next: zodEnum(LOGIN_NEXT),
    loginId: uuidv7Zod.optional(),
    user: signedInZod.optional(),
    /** Where to go once signed in */
    nextPath: string(),
  }),
});

/**
 * Takes a provider off the account (Security, Sign-in methods). The last way to sign in never goes
 * (LAST_SIGN_IN_METHOD); the account's email hears of it (signInMethodChanged).
 */
export const removeSignInMethod = defineRoute({
  id: 'auth.signInMethods.remove',
  method: 'DELETE',
  path: '/auth/sign-in-methods/:provider',
  summary: 'Take a social sign-in off the account',
  apps: SOCIAL_APPS,
  access: { type: 'signed-in' },
  rateLimit: 'write',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { params: providerParams },
  output: object({ removed: boolean(), providers: array(zodEnum(AUTH_PROVIDERS)) }),
});

export const SIGN_IN_METHOD_CHANGES = ['linked', 'removed'] as const;

/** A provider was linked to an account or taken off it; notify tells the account (a security email). */
export const signInMethodChanged = defineEvent({
  type: 'identity.signInMethod.changed',
  version: 1,
  producer: 'identity',
  description: 'A social sign-in was linked to an account or taken off it',
  data: object({
    userId: uuidv7Zod,
    email: emailZod,
    provider: zodEnum(SOCIAL_PROVIDERS),
    change: zodEnum(SIGN_IN_METHOD_CHANGES),
    /** The app it happened in */
    app: zodEnum(APPS),
    /** `Chrome on Windows` */
    device: string().max(120),
    changedAt: isoDateTimeZod,
  }),
});
