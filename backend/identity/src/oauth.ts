import { randomBytes } from 'node:crypto';

import { AppError, type Passport } from '@beautinique/backend-server-kit';
import { type ClientSession, withTransaction } from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import type { SIGN_IN_METHOD_CHANGES } from '@beautinique/shared-contracts';
import {
  type AppId,
  consentProblems,
  OAUTH_RESULT_PARAM,
  OAUTH_SIGN_UP_PATH,
  OAUTH_SIGN_UP_SECONDS,
  OAUTH_STATE_SECONDS,
  OAUTH_TOTP_FRAGMENT,
  type OAuthResult,
  safeNextPath,
  signInMethodChanged,
  SOCIAL_PROVIDERS,
  type SocialProvider,
  STEP_UP_SECONDS,
} from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';

import {
  AUTH_PROVIDERS,
  type AuthProvider,
  bySubject,
  CREDENTIALS,
  type Credentials,
} from './credentials.ts';
import { lastSignInMethod, oauthSignUpExpired, recentSignInRequired } from './errors.ts';
import { clearFailures, isLocked } from './lockout.ts';
import { inRedis, type LoginDeps, startLogin } from './login.ts';
import {
  authorizeUrl,
  pkcePair,
  ProviderFailure,
  signedInAt,
  usesPkce,
} from './oauth-providers.ts';
import { giveSignUpGrant, signInAccess } from './rbac/grants.ts';
import {
  type Client,
  deviceName,
  type IssuedSession,
  type Session,
  sessionExpired,
  SESSIONS,
} from './sessions.ts';
import { accountWithCode, type User, USERS } from './users.ts';

/**
 * Social sign-in (TASKS T3.1 PR 4, ARCHITECTURE §7.1): Google, LinkedIn and GitHub in the customer
 * app. A trip to the provider is kept in Redis under a random `state` that also sits in an
 * HttpOnly cookie of the browser that began it, so a callback from another browser (login CSRF)
 * or a second use goes nowhere. Accounts are matched by the provider's own id once linked, and
 * linked by email only when the provider says the email is verified.
 */
export type SocialDeps = LoginDeps;

const tripKey = (state: string): string => `bq:id:oauth:${state}`;
const signUpKey = (ticket: string): string => `bq:id:oauth-signup:${ticket}`;

/** A trip to the provider, in Redis for OAUTH_STATE_SECONDS. */
interface Trip {
  provider: SocialProvider;
  app: AppId;
  next: string;
  /** The PKCE verifier; '' for LinkedIn (no PKCE on its web flow) */
  verifier: string;
}

/** An account a provider makes or brings to the app, waiting for its consent (OAUTH_SIGN_UP_SECONDS). */
interface SignUp {
  provider: SocialProvider;
  subject: string;
  email: string;
  app: AppId;
  next: string;
}

/** What a page the browser opened answers: where it goes, and the cookies that change. */
export interface PageAnswer {
  location: string;
  /** The trip's state cookie: a new one, or cleared */
  state?: string | null;
  /** The waiting sign-up's cookie: a new one, or cleared */
  signUp?: string | null;
  /** Signed in: the session's cookies */
  session?: IssuedSession;
}

/** The sign-in page with a reason (OAUTH_RESULTS); the trip's cookie goes. */
export const backToSignIn = (result: OAuthResult): PageAnswer => ({
  location: `/sign-in?${OAUTH_RESULT_PARAM}=${result}`,
  state: null,
});

const randomToken = (): string => randomBytes(32).toString('base64url');

/** The providers this app shows, and the origin they work from. */
export function socialProviders(deps: SocialDeps): {
  providers: SocialProvider[];
  origin: string | null;
} {
  const providers = SOCIAL_PROVIDERS.filter((p) => deps.social.clients[p] !== undefined);
  return { providers, origin: providers.length > 0 ? deps.social.origin : null };
}

/** GET /auth/oauth/:provider/start: remember the trip, then to the provider. */
export async function startTrip(
  deps: SocialDeps,
  { app, provider, next }: { app: AppId; provider: SocialProvider; next: string | undefined },
): Promise<PageAnswer> {
  const client = deps.social.clients[provider];
  if (!client || deps.social.origin === null) return backToSignIn('failed');
  const state = randomToken();
  const pkce = usesPkce(provider) ? pkcePair() : null;
  const trip: Trip = { provider, app, next: safeNextPath(next), verifier: pkce?.verifier ?? '' };
  await inRedis(() =>
    deps.redis
      .multi()
      .hset(tripKey(state), { ...trip })
      .expire(tripKey(state), OAUTH_STATE_SECONDS)
      .exec(),
  );
  return {
    location: authorizeUrl(deps.social, provider, {
      clientId: client.clientId,
      state,
      challenge: pkce?.challenge ?? null,
    }),
    state,
  };
}

/** Reads and ends a Redis hash at once: a trip or a sign-up works once. */
async function takeOnce(deps: SocialDeps, key: string): Promise<Record<string, string>> {
  const done = await inRedis(() => deps.redis.multi().hgetall(key).del(key).exec());
  const [read] = done ?? [];
  return (read?.[1] as Record<string, string> | undefined) ?? {};
}

const providers = (deps: SocialDeps) => deps.mongo.db.collection<AuthProvider>(AUTH_PROVIDERS);

/** The security email of a provider linked to (or taken off) an account, in the change's transaction. */
function methodChanged(
  deps: SocialDeps,
  session: ClientSession,
  {
    user,
    provider,
    change,
    app,
    client,
    requestId,
    at,
  }: {
    user: { _id: string; email: string };
    provider: SocialProvider;
    change: (typeof SIGN_IN_METHOD_CHANGES)[number];
    app: AppId;
    client: Client;
    requestId: string;
    at: Date;
  },
) {
  return writeEvent(deps.mongo, session, signInMethodChanged, {
    aggregate: { type: 'user', id: user._id },
    actor: { type: 'user', id: user._id },
    correlationId: requestId,
    data: {
      userId: user._id,
      email: user.email,
      provider,
      change,
      app,
      device: deviceName(client.userAgent).slice(0, 120),
      changedAt: at.toISOString(),
    },
  });
}

/**
 * Links the provider's account to ours (its id, once), with the account's security email. Null when
 * the account already has another account of this provider, or this one belongs to someone else.
 */
async function link(
  deps: SocialDeps,
  session: ClientSession,
  { user, provider, subject, app, client, requestId, now }: LinkInput,
): Promise<'linked' | 'there' | null> {
  const mine = await providers(deps).findOne({ userId: user._id, provider }, { session });
  if (mine) return mine.subject === subject ? 'there' : null;
  const theirs = await providers(deps).findOne(bySubject(provider, subject), { session });
  if (theirs) return null;
  await providers(deps).insertOne(
    { _id: uuidv7(), userId: user._id, provider, subject, linkedAt: now, lastUsedAt: now },
    { session },
  );
  await methodChanged(deps, session, {
    user,
    provider,
    change: 'linked',
    app,
    client,
    requestId,
    at: now,
  });
  return 'linked';
}

interface LinkInput {
  user: { _id: string; email: string };
  provider: SocialProvider;
  subject: string;
  app: AppId;
  client: Client;
  requestId: string;
  now: Date;
}

/**
 * An account the provider proved: the authenticator step when it has one (every app asks), else
 * signed in. The wrong-try count starts again only after a whole sign-in.
 */
async function signInAs(
  deps: SocialDeps,
  { user, provider, app, next, client }: SignInInput,
): Promise<PageAnswer & { loginId?: string }> {
  await providers(deps).updateOne(
    { userId: user._id, provider },
    { $set: { lastUsedAt: new Date() } },
  );
  const credentials = await deps.mongo.db
    .collection<Credentials>(CREDENTIALS)
    .findOne({ _id: user._id }, { projection: { totp: 1 } });
  if (credentials?.totp) {
    const loginId = await startLogin(deps, {
      userId: user._id,
      email: user.email,
      app,
      stage: 'totp',
      first: provider,
    });
    const query = next === '/' ? '' : `?next=${encodeURIComponent(next)}`;
    return { location: `/sign-in${query}#${OAUTH_TOTP_FRAGMENT}=${loginId}`, state: null, loginId };
  }
  await clearFailures(deps.redis, deps.keys, user.email, { ip: client.ip });
  const session = await deps.sessions.issue({
    userId: user._id,
    email: user.email,
    app,
    methods: [provider],
    client,
  });
  return { location: next, state: null, session };
}

interface SignInInput {
  user: { _id: string; email: string };
  provider: SocialProvider;
  app: AppId;
  next: string;
  client: Client;
}

/**
 * The account waits for its consent (a new one, or one new to this app): to the consent page, with
 * `next` in its address like every auth page's, so whatever moves a signed-in page on goes there.
 */
async function waitForConsent(deps: SocialDeps, waiting: SignUp): Promise<PageAnswer> {
  const ticket = randomToken();
  await inRedis(() =>
    deps.redis
      .multi()
      .hset(signUpKey(ticket), { ...waiting })
      .expire(signUpKey(ticket), OAUTH_SIGN_UP_SECONDS)
      .exec(),
  );
  const query = waiting.next === '/' ? '' : `?next=${encodeURIComponent(waiting.next)}`;
  return { location: `${OAUTH_SIGN_UP_PATH}${query}`, state: null, signUp: ticket };
}

/**
 * GET /auth/oauth/:provider/callback: who the provider says it is, then signed in, the
 * authenticator step, or the consent page; anything wrong goes back to the sign-in page with a
 * reason, never to an error page.
 */
export async function finishTrip(
  deps: SocialDeps,
  input: {
    app: AppId;
    provider: SocialProvider;
    code: string | undefined;
    state: string | undefined;
    error: string | undefined;
    /** The trip's cookie of this browser */
    cookie: string | undefined;
    client: Client;
    requestId: string;
  },
): Promise<PageAnswer> {
  const { app, provider, code, state, cookie, client, requestId } = input;
  // only the browser that began the trip ends it
  const ours = state !== undefined && cookie !== undefined && state === cookie;
  const trip = ours ? ((await takeOnce(deps, tripKey(state))) as Partial<Trip>) : {};
  if (input.error !== undefined) return backToSignIn('cancelled');
  if (code === undefined || trip.provider !== provider || trip.app !== app) {
    return backToSignIn('expired');
  }
  const next = safeNextPath(trip.next);
  let profile;
  try {
    profile = await signedInAt(deps.social, provider, {
      code,
      verifier: trip.verifier === undefined || trip.verifier === '' ? null : trip.verifier,
    });
  } catch (error) {
    if (!(error instanceof ProviderFailure)) throw error;
    deps.logger.warn(
      { provider, step: error.step, status: error.status },
      'social sign-in: the provider did not answer as it should',
    );
    return backToSignIn('failed');
  }
  const users = deps.mongo.db.collection<User>(USERS);
  const linked = await providers(deps).findOne(bySubject(provider, profile.subject));
  let user = linked ? await users.findOne({ _id: linked.userId }) : null;
  if (!linked) {
    // a provider we have not seen for this person: only a verified email finds the account
    if (profile.email === null || !profile.emailVerified) return backToSignIn('email-unverified');
    user = await users.findOne({ email: profile.email });
    if (!user) {
      return waitForConsent(deps, {
        provider,
        subject: profile.subject,
        email: profile.email,
        app,
        next,
      });
    }
  }
  if (!user) return backToSignIn('failed');
  if (await isLocked(deps.redis, deps.keys, user.email, client.ip)) return backToSignIn('locked');
  const access = await signInAccess(deps.mongo, { userId: user._id, app });
  if (!access.allowed) {
    // an account of another app (a seller ...): this app's consent and role first
    return waitForConsent(deps, {
      provider,
      subject: profile.subject,
      email: user.email,
      app,
      next,
    });
  }
  if (!linked) {
    const found = user;
    const now = new Date();
    const done = await withTransaction(deps.mongo, (session) =>
      link(deps, session, {
        user: found,
        provider,
        subject: profile.subject,
        app,
        client,
        requestId,
        now,
      }),
    );
    if (done === null) {
      deps.logger.warn(
        { provider, userId: user._id },
        'social sign-in: the account has another account of this provider',
      );
      return backToSignIn('failed');
    }
  }
  return signInAs(deps, { user, provider, app, next, client });
}

/** GET /auth/oauth/sign-up: the account waiting for its consent. */
export async function waitingSignUp(
  deps: SocialDeps,
  { app, ticket }: { app: AppId; ticket: string | undefined },
): Promise<{ provider: SocialProvider; email: string; expiresAt: string; next: string }> {
  if (ticket === undefined) throw oauthSignUpExpired();
  const key = signUpKey(ticket);
  const [waiting, ttl] = await inRedis(() =>
    Promise.all([deps.redis.hgetall(key) as Promise<Partial<SignUp>>, deps.redis.pttl(key)]),
  );
  if (waiting.provider === undefined || waiting.email === undefined || waiting.app !== app) {
    throw oauthSignUpExpired();
  }
  return {
    provider: waiting.provider,
    email: waiting.email,
    expiresAt: new Date(Date.now() + Math.max(0, ttl)).toISOString(),
    next: safeNextPath(waiting.next),
  };
}

/**
 * POST /auth/oauth/sign-up: the consent of the account a provider makes or brings (ARCHITECTURE
 * §7.1: one account per email), with the app's sign-up role and the provider linked, all in one
 * transaction; then signed in, or the authenticator step of an account that has one.
 */
export async function finishSignUp(
  deps: SocialDeps,
  input: {
    app: AppId;
    ticket: string | undefined;
    consent: { terms: true; adult?: true };
    ip: string;
    client: Client;
    requestId: string;
  },
): Promise<{
  next: 'totp' | 'signed-in';
  loginId?: string;
  user?: { userId: string; email: string };
  session?: IssuedSession;
  nextPath: string;
}> {
  const { app, consent, client, requestId } = input;
  const problems = consentProblems(app, consent);
  if (problems.length > 0) {
    throw new AppError('VALIDATION_FAILED', 'Please check the highlighted fields.', {
      details: problems,
    });
  }
  if (input.ticket === undefined) throw oauthSignUpExpired();
  const waiting = (await takeOnce(deps, signUpKey(input.ticket))) as Partial<SignUp>;
  const { provider, subject, email } = waiting;
  if (
    provider === undefined ||
    !(SOCIAL_PROVIDERS as readonly string[]).includes(provider) ||
    subject === undefined ||
    email === undefined ||
    waiting.app !== app
  ) {
    throw oauthSignUpExpired();
  }
  const nextPath = safeNextPath(waiting.next);
  const now = new Date();
  const made = await withTransaction(deps.mongo, async (session) => {
    const { user, isNewUser } = await accountWithCode(deps.mongo, session, {
      email,
      app,
      consent: { terms: true, adult: consent.adult === true },
      legalVersion: deps.legalVersion,
      ip: input.ip,
      now,
    });
    await giveSignUpGrant(deps.mongo, session, { userId: user._id, app, now });
    if (isNewUser) {
      // the first way it signs in: no security email for a new account
      await providers(deps).insertOne(
        { _id: uuidv7(), userId: user._id, provider, subject, linkedAt: now, lastUsedAt: now },
        { session },
      );
      return { user, linked: 'linked' as const };
    }
    return {
      user,
      linked: await link(deps, session, {
        user,
        provider,
        subject,
        app,
        client,
        requestId,
        now,
      }),
    };
  });
  if (made.linked === null) throw oauthSignUpExpired();
  const answer = await signInAs(deps, { user: made.user, provider, app, next: nextPath, client });
  if (answer.loginId !== undefined) return { next: 'totp', loginId: answer.loginId, nextPath };
  return {
    next: 'signed-in',
    user: { userId: made.user._id, email: made.user.email },
    ...(answer.session ? { session: answer.session } : {}),
    nextPath,
  };
}

/**
 * DELETE /auth/sign-in-methods/:provider: the provider off the account, with its security email.
 * The last way to sign in stays (LAST_SIGN_IN_METHOD). No step-up: most customers have no
 * authenticator to step up with, and the email tells the owner at once.
 */
/** A sign-in recent enough to take a way in off (owner, 2026-11-09, QA DR-006). */
export const RECENT_SIGN_IN_MS = 10 * 60_000;

/**
 * Taking a way in off needs proof from just now, so a stolen access token (10 minutes) cannot: an
 * account with an authenticator steps up (5 minutes, STEP_UP_REQUIRED, which the app's dialog
 * answers); one without signed in with its password or an email code in the last 10 minutes
 * (RECENT_SIGN_IN_REQUIRED, the app sends it to sign in again). A provider's own sign-in never
 * counts.
 */
async function provenJustNow(
  deps: SocialDeps,
  passport: Passport,
  tx: ClientSession,
): Promise<void> {
  const signedIn = await deps.mongo.db
    .collection<Session>(SESSIONS)
    .findOne(
      { _id: passport.sessionId, userId: passport.userId, revokedAt: null },
      { session: tx },
    );
  if (!signedIn) throw sessionExpired();
  const credentials = await deps.mongo.db
    .collection<Credentials>(CREDENTIALS)
    .findOne({ _id: passport.userId }, { session: tx, projection: { totp: 1 } });
  const now = Date.now();
  if (credentials?.totp) {
    const stepUpAt = signedIn.stepUpAt?.getTime();
    if (stepUpAt === undefined || now - stepUpAt > STEP_UP_SECONDS * 1000) {
      throw new AppError(
        'STEP_UP_REQUIRED',
        'Please confirm with your authenticator code to continue.',
      );
    }
    return;
  }
  const recent = now - signedIn.createdAt.getTime() <= RECENT_SIGN_IN_MS;
  if (!recent || !signedIn.methods.some((m) => m === 'password' || m === 'email-code')) {
    throw recentSignInRequired();
  }
}

export async function removeMethod(
  deps: SocialDeps,
  passport: Passport,
  { provider, client, requestId }: { provider: SocialProvider; client: Client; requestId: string },
): Promise<{ removed: boolean; providers: AuthProvider['provider'][] }> {
  const user = await deps.mongo.db
    .collection<User>(USERS)
    .findOne({ _id: passport.userId }, { projection: { email: 1 } });
  if (!user) throw sessionExpired();
  return withTransaction(deps.mongo, async (session) => {
    const methods = await providers(deps)
      .find({ userId: user._id }, { session, projection: { provider: 1 } })
      .toArray();
    const names = methods.map((m) => m.provider).toSorted();
    if (!names.includes(provider)) return { removed: false, providers: names };
    if (names.length === 1) throw lastSignInMethod();
    await provenJustNow(deps, passport, session);
    await providers(deps).deleteOne({ userId: user._id, provider }, { session });
    await methodChanged(deps, session, {
      user,
      provider,
      change: 'removed',
      app: passport.app,
      client,
      requestId,
      at: new Date(),
    });
    return { removed: true, providers: names.filter((name) => name !== provider) };
  });
}
