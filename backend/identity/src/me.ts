import type { Passport } from '@beautinique/backend-server-kit';

import { AUTH_PROVIDERS, type AuthProvider, CREDENTIALS, type Credentials } from './credentials.ts';
import type { OtpDeps } from './otp.ts';
import { type Session, sessionExpired, SESSIONS } from './sessions.ts';
import { type User, USERS } from './users.ts';

/**
 * GET /iam/me: who signed in (ARCHITECTURE §7.2), how the account signs in, and this session. A
 * session the gateway let through but that ended a moment ago (or an account that went away)
 * answers like an ended session.
 */
export async function me(deps: OtpDeps, passport: Passport) {
  const db = deps.mongo.db;
  const user = await db.collection<User>(USERS).findOne({ _id: passport.userId });
  const session = await db
    .collection<Session>(SESSIONS)
    .findOne({ _id: passport.sessionId, userId: passport.userId, revokedAt: null });
  if (!user || !session) throw sessionExpired();
  const providers = await db
    .collection<AuthProvider>(AUTH_PROVIDERS)
    .find({ userId: user._id }, { projection: { provider: 1 } })
    .toArray();
  const credentials = await db
    .collection<Credentials>(CREDENTIALS)
    .findOne({ _id: user._id }, { projection: { totp: 1 } });
  return {
    user: {
      userId: user._id,
      email: user.email,
      ageDeclaredAt: user.ageDeclaredAt?.toISOString() ?? null,
      signUpApp: user.signUpApp,
      providers: providers.map((p) => p.provider).toSorted(),
      authenticator: credentials?.totp !== undefined,
    },
    session: {
      sessionId: session._id,
      app: session.app,
      expiresAt: session.expiresAt.toISOString(),
    },
  };
}

/** GET /auth/sessions: My Devices, this session marked. */
export async function myDevices(deps: OtpDeps, passport: Passport) {
  const sessions = await deps.sessions.list(passport.userId);
  return {
    sessions: sessions.map((session) => ({
      sessionId: session._id,
      app: session.app,
      device: session.device,
      ip: session.ip,
      createdAt: session.createdAt.toISOString(),
      lastSeenAt: session.lastSeenAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      current: session._id === passport.sessionId,
    })),
  };
}
