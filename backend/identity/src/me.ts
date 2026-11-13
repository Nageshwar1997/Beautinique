import type { Passport } from '@beautinique/backend-server-kit';
import { toObjectId } from '@beautinique/backend-server-mongo';

import { rolesNeedingAuthenticator } from './authenticator.ts';
import { AUTH_PROVIDERS, type AuthProvider, CREDENTIALS, type Credentials } from './credentials.ts';
import { recoveryCodesLeft } from './login.ts';
import type { OtpDeps } from './otp.ts';
import { rbacCatalog } from './rbac/catalog.ts';
import { appAccess } from './rbac/grants.ts';
import { type Session, sessionExpired, SESSIONS } from './sessions.ts';
import { type User, USERS } from './users.ts';

/**
 * GET /iam/me: who signed in (ARCHITECTURE §7.2), how the account signs in (with the recovery
 * codes left and the roles that keep the authenticator on, ARCHITECTURE §9.2), this session, and
 * what the account may do in its app (the roles held there and their permission keys). A
 * session the gateway let through but that ended a moment ago (or an account that went away)
 * answers like an ended session.
 */
export async function me(deps: OtpDeps, passport: Passport) {
  const db = deps.mongo.db;
  const userId = toObjectId(passport.userId);
  const user = await db.collection<User>(USERS).findOne({ _id: userId });
  const session = await db
    .collection<Session>(SESSIONS)
    .findOne({ _id: toObjectId(passport.sessionId), userId, revokedAt: null });
  if (!user || !session) throw sessionExpired();
  const providers = await db
    .collection<AuthProvider>(AUTH_PROVIDERS)
    .find({ userId: user._id }, { projection: { provider: 1 } })
    .toArray();
  const credentials = await db
    .collection<Credentials>(CREDENTIALS)
    .findOne({ _id: user._id }, { projection: { totp: 1, recoveryCodes: 1 } });
  // only an authenticator that is on can be kept on: no queries for the rest (QA DR-011)
  const requiredBy = credentials?.totp ? await rolesNeedingAuthenticator(deps, user._id) : [];
  const catalog = await rbacCatalog(deps.mongo);
  const app = catalog.appOf(session.appId);
  const access = await appAccess(deps.mongo, { userId: user._id, app });
  return {
    user: {
      userId: user._id.toHexString(),
      email: user.email,
      ageDeclaredAt: user.ageDeclaredAt?.toISOString() ?? null,
      signUpApp: catalog.appOf(user.signUpAppId),
      providers: providers.map((p) => p.provider).toSorted(),
      authenticator: credentials?.totp !== undefined,
      recoveryCodesLeft: credentials?.totp
        ? (recoveryCodesLeft(credentials.recoveryCodes) ?? 0)
        : null,
      authenticatorRequiredBy: requiredBy,
    },
    session: {
      sessionId: session._id.toHexString(),
      app,
      expiresAt: session.expiresAt.toISOString(),
    },
    access,
  };
}

/** GET /auth/sessions: My Devices, this session marked. */
export async function myDevices(deps: OtpDeps, passport: Passport) {
  const sessions = await deps.sessions.list(toObjectId(passport.userId));
  return {
    sessions: sessions.map((session) => ({
      sessionId: session._id.toHexString(),
      app: session.app,
      device: session.device,
      ip: session.ip,
      createdAt: session.createdAt.toISOString(),
      lastSeenAt: session.lastSeenAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      current: session._id.toHexString() === passport.sessionId,
    })),
  };
}
