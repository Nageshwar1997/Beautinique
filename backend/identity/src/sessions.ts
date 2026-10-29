import { randomBytes } from 'node:crypto';

import { blindIndex, type CryptoKeys, signJwt } from '@beautinique/backend-server-crypto';
import { AppError, type Logger } from '@beautinique/backend-server-kit';
import { type IndexSpec, type Mongo, withTransaction } from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import {
  ACCESS_TOKEN_SECONDS,
  type AppId,
  IDENTITY_ERROR_CODES,
  revokedSessionKey,
  revokedUserKey,
  SESSION_POLICIES,
  sessionReuseDetected,
  TOKEN_ISSUER,
  tokenAudience,
} from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import type { Redis } from 'ioredis';

import { invalidCredentials, signInUnavailable } from './errors.ts';
import { signInAccess } from './rbac/grants.ts';
import type { SigningKeys } from './signing-keys.ts';

/** What proved who the person is in a sign-in (the session keeps it: `amr`). */
export type AuthMethod = 'email-code' | 'password' | 'totp' | 'recovery-code';

/** Who is at the other end: legal and security evidence, shown in My Devices. */
export interface Client {
  ip: string;
  userAgent: string;
}

export interface IssueSessionInput {
  userId: string;
  email: string;
  app: AppId;
  methods: AuthMethod[];
  client: Client;
}

/** A session's tokens, for the app's cookies. */
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
  'logout' | 'reuse' | 'password-changed' | 'signed-out-elsewhere' | 'access-ended';

export interface Session {
  _id: string;
  userId: string;
  email: string;
  app: AppId;
  /** `Chrome on Windows` (deviceName) */
  device: string;
  ip: string;
  methods: AuthMethod[];
  /** Keyed hash of the current refresh token; the token itself is never stored */
  refreshHash: string;
  /** The token it replaced, to tell a parallel tab (REFRESH_RACE_MS) from a copied token */
  previousRefreshHash: string | null;
  rotatedAt: Date | null;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  revokeReason: EndReason | null;
  /** TTL: the record goes this long after the session ended (KEEP_ENDED_MS) */
  purgeAt: Date;
}

export const indexes: readonly IndexSpec[] = [
  { collection: SESSIONS, name: 'userId_revokedAt', key: { userId: 1, revokedAt: 1 } },
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

/** `<sessionId>.<32 random bytes>`: the session is found by its id, the rest is the secret. */
const newRefreshToken = (sessionId: string): string =>
  `${sessionId}.${randomBytes(32).toString('base64url')}`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Keyed hash of a refresh token: a database copy alone cannot refresh anything. */
const refreshHashOf = (keys: CryptoKeys, token: string): string =>
  blindIndex(keys, 'refresh-token', token);

/** Ends sessions at the gateway at once: an access token lives on 10 minutes otherwise. */
const REVOKE_TTL_MS = (ACCESS_TOKEN_SECONDS + 60) * 1000;

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
  /** Ends every session of an account (a new password). */
  endAll(userId: string, reason: EndReason): Promise<void>;
  /** My Devices: the account's sessions that have not ended, in every app, the newest first. */
  list(userId: string): Promise<Session[]>;
  /** Ends one session of the account; false when it is not the account's or ended already. */
  end(userId: string, sessionId: string): Promise<boolean>;
  /** Ends every session of the account but `keep`; how many ended. */
  endOthers(userId: string, keep: string): Promise<number>;
}

export function sessions(deps: SessionDeps): Sessions {
  const { mongo, redis, keys, signing, logger } = deps;
  const now = deps.now ?? Date.now;
  const collection = mongo.db.collection<Session>(SESSIONS);

  async function accessToken(
    session: Pick<Session, '_id' | 'userId' | 'app' | 'methods'>,
    at: number,
    authzVersion: number,
  ) {
    const { kid, privateKey } = await signing.current();
    const iat = Math.floor(at / 1000);
    return signJwt(
      {
        iss: TOKEN_ISSUER,
        sub: session.userId,
        aud: tokenAudience(session.app),
        iat,
        exp: iat + ACCESS_TOKEN_SECONDS,
        sid: session._id,
        amr: session.methods,
        // a grant change raises it, so a token from before is turned back (ARCHITECTURE §7.2)
        av: authzVersion,
      },
      { kid, privateKey },
    );
  }

  /** Marks the session ended, and tells the gateway at once. */
  async function revokeAtGateway(sessionId: string): Promise<void> {
    await inRedis(() => redis.set(revokedSessionKey(sessionId), '1', 'PX', REVOKE_TTL_MS));
  }

  return {
    async issue({ userId, email, app, methods, client }) {
      const at = now();
      // every sign-in ends here, so no way around it: only an app where a grant is (T3.3)
      const access = await signInAccess(mongo, { userId, app, now: new Date(at) });
      if (!access.allowed) throw invalidCredentials();
      const policy = SESSION_POLICIES[app];
      const sessionId = uuidv7();
      const refreshToken = newRefreshToken(sessionId);
      const expiresAt = new Date(at + Math.min(policy.slidingMs, policy.maxMs));
      const session: Session = {
        _id: sessionId,
        userId,
        email,
        app,
        device: deviceName(client.userAgent).slice(0, 120),
        ip: client.ip,
        methods,
        refreshHash: refreshHashOf(keys, refreshToken),
        previousRefreshHash: null,
        rotatedAt: null,
        createdAt: new Date(at),
        lastSeenAt: new Date(at),
        expiresAt,
        revokedAt: null,
        revokeReason: null,
        purgeAt: new Date(expiresAt.getTime() + KEEP_ENDED_MS),
      };
      await collection.insertOne(session);
      logger.info({ userId, app, sessionId, methods }, 'session started');
      return {
        user: { userId, email },
        app,
        sessionId,
        accessToken: await accessToken(session, at, access.authzVersion),
        refreshToken,
        expiresAt,
      };
    },

    async refresh({ app, refreshToken, client }) {
      const sessionId = refreshToken?.split('.')[0] ?? '';
      if (!refreshToken || !UUID.test(sessionId)) throw sessionExpired();
      const at = now();
      const policy = SESSION_POLICIES[app];
      const hash = refreshHashOf(keys, refreshToken);
      const next = newRefreshToken(sessionId);
      const until = new Date(at + policy.slidingMs);
      // atomic: of two requests with the same token, one rotates it
      const rotated = await collection.findOneAndUpdate(
        {
          _id: sessionId,
          app,
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
        return {
          user: { userId: rotated.userId, email: rotated.email },
          app,
          sessionId,
          accessToken: await accessToken(rotated, at, access.authzVersion),
          refreshToken: next,
          expiresAt: rotated.expiresAt,
        };
      }
      const found = await collection.findOne({ _id: sessionId, app });
      if (found?.revokedAt !== null || found.previousRefreshHash !== hash) {
        throw sessionExpired();
      }
      const idle = policy.idleMs !== undefined && at - found.lastSeenAt.getTime() >= policy.idleMs;
      // a session that ran out ends quietly, whatever token comes
      if (found.expiresAt.getTime() <= at || idle) throw sessionExpired();
      if (found.rotatedAt && at - found.rotatedAt.getTime() < REFRESH_RACE_MS) {
        throw refreshInProgress();
      }
      // the token its successor replaced came back: someone has a copy
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
            aggregate: { type: 'session', id: sessionId },
            actor: { type: 'system', id: 'identity.sessions' },
            correlationId: sessionId,
            data: {
              sessionId,
              userId: found.userId,
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
      const sessionId = refreshToken?.split('.')[0] ?? '';
      if (!refreshToken || !UUID.test(sessionId)) return;
      const at = now();
      const ended = await collection.updateOne(
        { _id: sessionId, app, refreshHash: refreshHashOf(keys, refreshToken), revokedAt: null },
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
      await collection.updateMany(
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
      await inRedis(() => redis.set(revokedUserKey(userId), String(at), 'PX', REVOKE_TTL_MS));
      logger.info({ userId, reason }, 'every session of the account ended');
    },

    list(userId) {
      return collection
        .find({ userId, revokedAt: null, expiresAt: { $gt: new Date(now()) } })
        .sort({ lastSeenAt: -1 })
        .toArray();
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
        for (const id of ids) batch.set(revokedSessionKey(id), '1', 'PX', REVOKE_TTL_MS);
        return batch.exec();
      });
      logger.info({ userId, ended: ended.modifiedCount }, 'every other device signed out');
      return ended.modifiedCount;
    },
  };
}
