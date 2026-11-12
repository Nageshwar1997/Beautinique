import { randomBytes } from 'node:crypto';

import { blindIndex, type CryptoKeys, signJwt } from '@beautinique/backend-server-crypto';
import { AppError, type Logger } from '@beautinique/backend-server-kit';
import {
  type IndexSpec,
  type Mongo,
  ObjectId,
  withTransaction,
} from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import {
  ACCESS_TOKEN_SECONDS,
  type AppId,
  type AppPermissions,
  appPermissionsKey,
  IDENTITY_ERROR_CODES,
  refreshTokenParts,
  REVOCATIONS_READY_KEY,
  revokedSessionKey,
  revokedUserKey,
  SESSION_POLICIES,
  sessionReuseDetected,
  STEP_UP_SECONDS,
  type StepUpAction,
  TOKEN_ISSUER,
  tokenAudience,
} from '@beautinique/shared-contracts';
import type { Redis } from 'ioredis';

import { invalidCredentials, signInUnavailable } from './errors.ts';
import { rbacCatalog } from './rbac/catalog.ts';
import { type SignInAccess, signInAccess } from './rbac/grants.ts';
import type { SigningKeys } from './signing-keys.ts';

/** What proved who the person is in a sign-in (the session keeps it: `amr`). */
export type AuthMethod =
  'email-code' | 'password' | 'totp' | 'recovery-code' | 'google' | 'linkedin' | 'github';

/** Who is at the other end: legal and security evidence, shown in My Devices. */
export interface Client {
  ip: string;
  userAgent: string;
}

export interface IssueSessionInput {
  userId: ObjectId;
  email: string;
  app: AppId;
  methods: AuthMethod[];
  client: Client;
}

/** A session's tokens, for the app's cookies (ids as hex, as routes and tokens carry them). */
export interface IssuedSession {
  user: { userId: string; email: string };
  app: AppId;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  /** When the session (and its refresh cookie) ends unless refreshed */
  expiresAt: Date;
}

/** The last step of every sign-in (ARCHITECTURE §7.1): only in an app where the account holds a grant. */
export interface SessionPort {
  issue(input: IssueSessionInput): Promise<IssuedSession>;
}

export const SESSIONS = 'identity_sessions';
/** An ended session stays this long for My Devices and security questions, then goes. */
export const KEEP_ENDED_MS = 30 * 24 * 60 * 60_000;
/** A second refresh with the token just replaced, this soon, is a parallel tab, not a copy. */
export const REFRESH_RACE_MS = 10_000;

export type EndReason =
  | 'logout'
  | 'reuse'
  | 'password-changed'
  | 'signed-out-elsewhere'
  | 'access-ended'
  | 'authenticator-reset'
  | 'security-officer';

/** A sign-in with these counts as a step-up at that moment (ARCHITECTURE §7.1). */
const STEP_UP_METHODS: readonly AuthMethod[] = ['totp', 'recovery-code'];

/** One sign-in's session. Every id in it is an ObjectId (owner, 2026-11-12). */
export interface Session {
  _id: ObjectId;
  userId: ObjectId;
  email: string;
  /** Its app (identity_apps) */
  appId: ObjectId;
  /** `Chrome on Windows` (deviceName) */
  device: string;
  ip: string;
  methods: AuthMethod[];
  /** Keyed hash of the current refresh token; the token itself is never stored */
  refreshHash: string;
  /** The token it replaced, to tell a parallel tab (REFRESH_RACE_MS) from a copied token */
  previousRefreshHash: string | null;
  /**
   * Keyed hash of the family secret in every refresh token of this session: an older token of the
   * family coming back is a copy (QA-ID-001), a made-up one is not. Missing = a session from before
   * families, until its next refresh.
   */
  familyHash?: string;
  rotatedAt: Date | null;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  revokeReason: EndReason | null;
  /** TTL: the record goes this long after the session ended (KEEP_ENDED_MS) */
  purgeAt: Date;
  /**
   * When the session last confirmed with the authenticator (a sign-in with it, or POST
   * /auth/step-up); access tokens carry it as `su`. Missing = never (sessions from before T3.3).
   */
  stepUpAt?: Date | null;
  /**
   * A step-up for one change alone (STEP_UP_ACTIONS, QA DR-010): which, and when. It counts once,
   * within STEP_UP_SECONDS, and never as `stepUpAt`.
   */
  stepUpFor?: { action: StepUpAction; at: Date } | null;
}

/** A session with its app's key, as My Devices and tokens need it. */
export type SessionWithApp = Session & { app: AppId };

export const indexes: readonly IndexSpec[] = [
  { collection: SESSIONS, name: 'userId_revokedAt', key: { userId: 1, revokedAt: 1 } },
  // the sessions that ended lately, for the gateway's marks after a Redis wipe (QA-GW-002)
  { collection: SESSIONS, name: 'revokedAt', key: { revokedAt: 1 } },
  { collection: SESSIONS, name: 'purgeAt_ttl', key: { purgeAt: 1 }, expireAfterSeconds: 0 },
];

/** A short name for the browser and system, from the User-Agent. */
export function deviceName(userAgent: string): string {
  const browser = (
    [
      [/Edg(?:e|A|iOS)?\//, 'Edge'],
      [/OPR\/|Opera/, 'Opera'],
      [/SamsungBrowser\//, 'Samsung Internet'],
      [/Firefox\/|FxiOS\//, 'Firefox'],
      [/Chrome\/|CriOS\//, 'Chrome'],
      [/Safari\//, 'Safari'],
    ] as const
  ).find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = (
    [
      [/Android/, 'Android'],
      [/iPhone|iPad|iPod/, 'iOS'],
      [/Windows/, 'Windows'],
      [/Mac OS X|Macintosh/, 'macOS'],
      [/CrOS/, 'ChromeOS'],
      [/Linux/, 'Linux'],
    ] as const
  ).find(([pattern]) => pattern.test(userAgent))?.[1];
  if (browser && system) return `${browser} on ${system}`;
  return browser ?? system ?? 'Unknown device';
}

export const sessionExpired = (): AppError =>
  new AppError('SESSION_EXPIRED', 'Your session has ended. Please sign in again.', {
    status: IDENTITY_ERROR_CODES.SESSION_EXPIRED,
  });

export const refreshInProgress = (): AppError =>
  new AppError('REFRESH_IN_PROGRESS', 'Your session was just refreshed. Please try again.', {
    status: IDENTITY_ERROR_CODES.REFRESH_IN_PROGRESS,
  });

export interface SessionDeps {
  mongo: Mongo;
  redis: Redis;
  keys: CryptoKeys;
  signing: SigningKeys;
  logger: Logger;
  now?: () => number;
}

/**
 * `<sessionId>.<family>.<secret>`: the session is found by its id; the family (16 random bytes) is
 * the same in every token of the session, so any older token of it is known for what it is; the
 * secret (32 random bytes) is new at each refresh. contracts `refreshTokenParts` reads the first two
 * back, here and in the gateway (its `session` rate limit).
 */
const newRefreshToken = (sessionId: ObjectId, family: string): string =>
  `${sessionId.toHexString()}.${family}.${randomBytes(32).toString('base64url')}`;
const newFamily = (): string => randomBytes(16).toString('base64url');

/** Keyed hash of a refresh token: a database copy alone cannot refresh anything. */
const refreshHashOf = (keys: CryptoKeys, token: string): string =>
  blindIndex(keys, 'refresh-token', token);

/** Keyed hash of a session's token family, the same way. */
const familyHashOf = (keys: CryptoKeys, family: string): string =>
  blindIndex(keys, 'refresh-family', family);

/** Ends sessions at the gateway at once: an access token lives on 10 minutes otherwise. */
const REVOKE_TTL_MS = (ACCESS_TOKEN_SECONDS + 60) * 1000;

/**
 * Writes the gateway's ended-session marks again from MongoDB, each for what is left of its access
 * tokens' life, then the ready mark (ARCHITECTURE §6.6, QA-GW-002): at identity's start, and after
 * a Redis wipe took them; until the ready mark is there the gateway answers 503. Every way a
 * session ends (logout, a copied refresh token, a new password, another device) sets its
 * `revokedAt`, and an account's whole end is the end of each of its sessions, so these marks alone
 * stop every token that should stop. Answers how many sessions ended lately.
 */
export async function restoreGatewayMarks(
  mongo: Mongo,
  redis: Redis,
  {
    readyKey = REVOCATIONS_READY_KEY,
    now = Date.now,
  }: { readyKey?: string; now?: () => number } = {},
): Promise<number> {
  const at = now();
  const ended = await mongo.db
    .collection<Session>(SESSIONS)
    .find({ revokedAt: { $gt: new Date(at - REVOKE_TTL_MS) } }, { projection: { revokedAt: 1 } })
    .toArray();
  const batch = redis.multi();
  for (const session of ended) {
    const left = (session.revokedAt?.getTime() ?? at) + REVOKE_TTL_MS - at;
    if (left > 0) batch.set(revokedSessionKey(session._id.toHexString()), '1', 'PX', left);
  }
  // last: the gateway trusts the marks only once all of them are in
  batch.set(readyKey, '1');
  const answers = await batch.exec();
  if (!answers || answers.some(([error]) => error)) {
    throw new Error('Redis did not take the ended-session marks');
  }
  return ended.length;
}

/** Redis away: the gateway could not learn of an ended session, so say so (503). */
async function inRedis<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    throw signInUnavailable(error);
  }
}

export interface Sessions extends SessionPort {
  /** A new pair for a refresh token; the old token stops working. */
  refresh(input: {
    app: AppId;
    refreshToken: string | undefined;
    client: Client;
  }): Promise<IssuedSession>;
  /** Ends the session of a refresh token (nothing when there is none). */
  logout(input: { app: AppId; refreshToken: string | undefined }): Promise<void>;
  /** Ends every session of an account (a new password, a Security Officer); how many ended. */
  endAll(userId: ObjectId, reason: EndReason): Promise<number>;
  /**
   * Step-up (ARCHITECTURE §7.1): the session confirmed with the authenticator now; a new access
   * token carries it. SESSION_EXPIRED when the session ended or its app has no grant left.
   */
  stepUp(input: { userId: ObjectId; sessionId: ObjectId; for?: StepUpAction }): Promise<{
    app: AppId;
    accessToken: string;
    stepUpAt: Date;
  }>;
  /**
   * Takes the session's step-up for this change, if it has one from the last STEP_UP_SECONDS:
   * true once, then it is gone (QA DR-010).
   */
  useStepUp(sessionId: ObjectId, action: StepUpAction): Promise<boolean>;
  /** My Devices: the account's sessions that have not ended, in every app, the newest first. */
  list(userId: ObjectId): Promise<SessionWithApp[]>;
  /** Ends one session of the account; false when it is not the account's or ended already. */
  end(userId: ObjectId, sessionId: ObjectId): Promise<boolean>;
  /** Ends every session of the account but `keep`; how many ended. */
  endOthers(userId: ObjectId, keep: ObjectId): Promise<number>;
}

export function sessions(deps: SessionDeps): Sessions {
  const { mongo, redis, keys, signing, logger } = deps;
  const now = deps.now ?? Date.now;
  const collection = mongo.db.collection<Session>(SESSIONS);

  /**
   * The second a new access token is issued in: never the one every session of the account ended
   * in (a new password a moment ago). The gateway counts tokens of that second as from before the
   * end (whole seconds, revokedUserKey), so one issued then would be turned back at once, its
   * refresh too, and the person found signed out right after signing in. Waits for the next
   * second instead (under one).
   */
  async function issueSecond(userId: ObjectId, at: number): Promise<number> {
    const iat = Math.floor(at / 1000);
    const since = await inRedis(() => redis.get(revokedUserKey(userId.toHexString())));
    if (since === null) return iat;
    const after = Math.floor(Number(since) / 1000) + 1;
    if (iat >= after) return iat;
    const wait = after * 1000 - now();
    if (wait > 0) {
      await new Promise((resolve) => {
        setTimeout(resolve, wait);
      });
    }
    return after;
  }

  async function accessToken(
    session: Pick<Session, '_id' | 'userId' | 'methods' | 'stepUpAt'>,
    app: AppId,
    at: number,
    authzVersion: number,
  ) {
    const stepUpAt = session.stepUpAt ?? null;
    const iat = await issueSecond(session.userId, at);
    const { kid, privateKey } = await signing.current();
    return signJwt(
      {
        iss: TOKEN_ISSUER,
        sub: session.userId.toHexString(),
        aud: tokenAudience(app),
        iat,
        exp: iat + ACCESS_TOKEN_SECONDS,
        sid: session._id.toHexString(),
        amr: session.methods,
        // a grant change raises it, so a token from before is turned back (ARCHITECTURE §7.2)
        av: authzVersion,
        // the gateway lets step-up routes through for STEP_UP_SECONDS after it
        ...(stepUpAt === null ? {} : { su: Math.floor(stepUpAt.getTime() / 1000) }),
      },
      { kid, privateKey },
    );
  }

  /**
   * The gateway's list of what the account may do in the app (contracts appPermissionsKey), for
   * this authz version; written at every sign-in, refresh and step-up, living a little longer
   * than the access token. Redis away: 503, like the revoke keys.
   */
  async function listPermissions(userId: ObjectId, app: AppId, access: SignInAccess) {
    const value: AppPermissions = { v: access.authzVersion, keys: access.permissions };
    await inRedis(() =>
      redis.set(
        appPermissionsKey(userId.toHexString(), app),
        JSON.stringify(value),
        'PX',
        REVOKE_TTL_MS,
      ),
    );
  }

  /** Marks the session ended, and tells the gateway at once. */
  async function revokeAtGateway(sessionId: ObjectId): Promise<void> {
    await inRedis(() =>
      redis.set(revokedSessionKey(sessionId.toHexString()), '1', 'PX', REVOKE_TTL_MS),
    );
  }

  return {
    async issue({ userId, email, app, methods, client }) {
      const at = now();
      // every sign-in ends here, so no way around it: only an app where a grant is (T3.3)
      const access = await signInAccess(mongo, { userId, app, now: new Date(at) });
      if (!access.allowed) throw invalidCredentials();
      const policy = SESSION_POLICIES[app];
      const sessionId = new ObjectId();
      const family = newFamily();
      const refreshToken = newRefreshToken(sessionId, family);
      const expiresAt = new Date(at + Math.min(policy.slidingMs, policy.maxMs));
      const session: Session = {
        _id: sessionId,
        userId,
        email,
        appId: (await rbacCatalog(mongo)).appId(app),
        device: deviceName(client.userAgent).slice(0, 120),
        ip: client.ip,
        methods,
        refreshHash: refreshHashOf(keys, refreshToken),
        previousRefreshHash: null,
        familyHash: familyHashOf(keys, family),
        rotatedAt: null,
        createdAt: new Date(at),
        lastSeenAt: new Date(at),
        expiresAt,
        revokedAt: null,
        revokeReason: null,
        purgeAt: new Date(expiresAt.getTime() + KEEP_ENDED_MS),
        stepUpAt: methods.some((method) => STEP_UP_METHODS.includes(method)) ? new Date(at) : null,
      };
      await collection.insertOne(session);
      await listPermissions(userId, app, access);
      logger.info({ userId, app, sessionId, methods }, 'session started');
      return {
        user: { userId: userId.toHexString(), email },
        app,
        sessionId: sessionId.toHexString(),
        accessToken: await accessToken(session, app, at, access.authzVersion),
        refreshToken,
        expiresAt,
      };
    },

    async refresh({ app, refreshToken, client }) {
      const parts = refreshTokenParts(refreshToken);
      if (!refreshToken || !parts) throw sessionExpired();
      // refreshTokenParts takes only 24 lower-case hex
      const sessionId = new ObjectId(parts.sessionId);
      const appId = (await rbacCatalog(mongo)).appId(app);
      const at = now();
      const policy = SESSION_POLICIES[app];
      const hash = refreshHashOf(keys, refreshToken);
      // a session from before families gets one at this refresh
      const family = parts.family ?? newFamily();
      const next = newRefreshToken(sessionId, family);
      const until = new Date(at + policy.slidingMs);
      // atomic: of two requests with the same token, one rotates it
      const rotated = await collection.findOneAndUpdate(
        {
          _id: sessionId,
          appId,
          refreshHash: hash,
          revokedAt: null,
          expiresAt: { $gt: new Date(at) },
          ...(policy.idleMs === undefined
            ? {}
            : { lastSeenAt: { $gt: new Date(at - policy.idleMs) } }),
        },
        [
          {
            $set: {
              refreshHash: refreshHashOf(keys, next),
              previousRefreshHash: hash,
              familyHash: familyHashOf(keys, family),
              rotatedAt: new Date(at),
              lastSeenAt: new Date(at),
              ip: client.ip,
              expiresAt: { $min: [{ $add: ['$createdAt', policy.maxMs] }, until] },
            },
          },
          { $set: { purgeAt: { $add: ['$expiresAt', KEEP_ENDED_MS] } } },
        ],
        { returnDocument: 'after' },
      );
      if (rotated) {
        // grants are read again at every refresh: the last grant in the app gone = signed out
        const access = await signInAccess(mongo, {
          userId: rotated.userId,
          app,
          now: new Date(at),
        });
        if (!access.allowed) {
          await collection.updateOne(
            { _id: sessionId, revokedAt: null },
            {
              $set: {
                revokedAt: new Date(at),
                revokeReason: 'access-ended',
                purgeAt: new Date(at + KEEP_ENDED_MS),
              },
            },
          );
          await revokeAtGateway(sessionId);
          logger.info({ userId: rotated.userId, app, sessionId }, 'session ended: no grant left');
          throw sessionExpired();
        }
        await listPermissions(rotated.userId, app, access);
        return {
          user: { userId: rotated.userId.toHexString(), email: rotated.email },
          app,
          sessionId: parts.sessionId,
          accessToken: await accessToken(rotated, app, at, access.authzVersion),
          refreshToken: next,
          expiresAt: rotated.expiresAt,
        };
      }
      const found = await collection.findOne({ _id: sessionId, appId });
      if (found?.revokedAt !== null) throw sessionExpired();
      const replaced = found.previousRefreshHash === hash;
      const ofFamily =
        parts.family !== null &&
        found.familyHash !== undefined &&
        found.familyHash === familyHashOf(keys, parts.family);
      // neither the token just replaced nor one of this session's family: made up, nothing ends
      if (!replaced && !ofFamily) throw sessionExpired();
      const idle = policy.idleMs !== undefined && at - found.lastSeenAt.getTime() >= policy.idleMs;
      // a session that ran out ends quietly, whatever token comes
      if (found.expiresAt.getTime() <= at || idle) throw sessionExpired();
      // only the token just replaced can be a parallel tab: a browser is never two behind
      if (replaced && found.rotatedAt && at - found.rotatedAt.getTime() < REFRESH_RACE_MS) {
        throw refreshInProgress();
      }
      // an older token of the session came back: someone has a copy
      const ended = await withTransaction(mongo, async (session) => {
        const result = await collection.updateOne(
          { _id: sessionId, revokedAt: null },
          {
            $set: {
              revokedAt: new Date(at),
              revokeReason: 'reuse',
              purgeAt: new Date(at + KEEP_ENDED_MS),
            },
          },
          { session },
        );
        if (result.modifiedCount === 1) {
          await writeEvent(mongo, session, sessionReuseDetected, {
            aggregate: { type: 'session', id: parts.sessionId },
            actor: { type: 'system', id: 'identity.sessions' },
            correlationId: parts.sessionId,
            data: {
              sessionId: parts.sessionId,
              userId: found.userId.toHexString(),
              email: found.email,
              app,
              device: found.device,
              detectedAt: new Date(at).toISOString(),
            },
          });
        }
        return result.modifiedCount === 1;
      });
      if (ended) {
        await revokeAtGateway(sessionId);
        logger.warn(
          { userId: found.userId, app, sessionId },
          'refresh token used again: session ended',
        );
      }
      throw sessionExpired();
    },

    async logout({ app, refreshToken }) {
      const hex = refreshTokenParts(refreshToken)?.sessionId;
      if (!refreshToken || !hex) return;
      const sessionId = new ObjectId(hex);
      const appId = (await rbacCatalog(mongo)).appId(app);
      const at = now();
      const ended = await collection.updateOne(
        { _id: sessionId, appId, refreshHash: refreshHashOf(keys, refreshToken), revokedAt: null },
        {
          $set: {
            revokedAt: new Date(at),
            revokeReason: 'logout',
            purgeAt: new Date(at + KEEP_ENDED_MS),
          },
        },
      );
      if (ended.modifiedCount === 1) {
        await revokeAtGateway(sessionId);
        logger.info({ app, sessionId }, 'signed out');
      }
    },

    async endAll(userId, reason) {
      const at = now();
      const ended = await collection.updateMany(
        { userId, revokedAt: null },
        {
          $set: {
            revokedAt: new Date(at),
            revokeReason: reason,
            purgeAt: new Date(at + KEEP_ENDED_MS),
          },
        },
      );
      // tokens issued before this moment stop at the gateway
      await inRedis(() =>
        redis.set(revokedUserKey(userId.toHexString()), String(at), 'PX', REVOKE_TTL_MS),
      );
      logger.info(
        { userId, reason, ended: ended.modifiedCount },
        'every session of the account ended',
      );
      return ended.modifiedCount;
    },

    async stepUp({ userId, sessionId, for: action }) {
      const at = now();
      // one change's own step-up leaves `stepUpAt` (and the token's `su`) as they were
      const stepped =
        action === undefined
          ? { stepUpAt: new Date(at) }
          : { stepUpFor: { action, at: new Date(at) } };
      const session = await collection.findOneAndUpdate(
        { _id: sessionId, userId, revokedAt: null, expiresAt: { $gt: new Date(at) } },
        { $set: { ...stepped, lastSeenAt: new Date(at) } },
        { returnDocument: 'after' },
      );
      if (!session) throw sessionExpired();
      const app = (await rbacCatalog(mongo)).appOf(session.appId);
      const access = await signInAccess(mongo, { userId, app, now: new Date(at) });
      if (!access.allowed) throw sessionExpired();
      await listPermissions(userId, app, access);
      logger.info({ userId, app, sessionId, for: action }, 'stepped up');
      return {
        app,
        accessToken: await accessToken(session, app, at, access.authzVersion),
        stepUpAt: new Date(at),
      };
    },

    async useStepUp(sessionId, action) {
      const at = now();
      const used = await collection.updateOne(
        {
          _id: sessionId,
          revokedAt: null,
          'stepUpFor.action': action,
          'stepUpFor.at': { $gt: new Date(at - STEP_UP_SECONDS * 1000) },
        },
        { $set: { stepUpFor: null } },
      );
      return used.modifiedCount === 1;
    },

    async list(userId) {
      const catalog = await rbacCatalog(mongo);
      const found = await collection
        .find({ userId, revokedAt: null, expiresAt: { $gt: new Date(now()) } })
        .sort({ lastSeenAt: -1 })
        .toArray();
      return found.map((session) => ({ ...session, app: catalog.appOf(session.appId) }));
    },

    async end(userId, sessionId) {
      const at = now();
      const ended = await collection.updateOne(
        { _id: sessionId, userId, revokedAt: null },
        {
          $set: {
            revokedAt: new Date(at),
            revokeReason: 'signed-out-elsewhere',
            purgeAt: new Date(at + KEEP_ENDED_MS),
          },
        },
      );
      if (ended.modifiedCount !== 1) return false;
      await revokeAtGateway(sessionId);
      logger.info({ userId, sessionId }, 'a device signed out from My Devices');
      return true;
    },

    async endOthers(userId, keep) {
      const at = now();
      const others = await collection
        .find({ userId, revokedAt: null, _id: { $ne: keep } }, { projection: { _id: 1 } })
        .toArray();
      if (others.length === 0) return 0;
      const ids = others.map((session) => session._id);
      const ended = await collection.updateMany(
        { _id: { $in: ids }, revokedAt: null },
        {
          $set: {
            revokedAt: new Date(at),
            revokeReason: 'signed-out-elsewhere',
            purgeAt: new Date(at + KEEP_ENDED_MS),
          },
        },
      );
      await inRedis(() => {
        const batch = redis.multi();
        for (const id of ids) {
          batch.set(revokedSessionKey(id.toHexString()), '1', 'PX', REVOKE_TTL_MS);
        }
        return batch.exec();
      });
      logger.info({ userId, ended: ended.modifiedCount }, 'every other device signed out');
      return ended.modifiedCount;
    },
  };
}
