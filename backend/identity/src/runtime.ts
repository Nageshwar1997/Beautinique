import {
  loadCryptoKeys,
  loadSealingKeys,
  type PublicJwk,
} from '@beautinique/backend-server-crypto';
import {
  jwksCache,
  jwksFromUrl,
  type Logger,
  passportVerifier,
  type ReadyCheck,
} from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo } from '@beautinique/backend-server-mongo';
import {
  connectRedis,
  type RedisConnection,
  redriveOutbox,
  type Relay,
  startRelay,
  startWipeWatchdog,
  type WipeWatchdog,
} from '@beautinique/backend-server-queue';
import {
  authenticatorReset,
  invitationCreated,
  otpRequested,
  passportAudience,
  sessionReuseDetected,
} from '@beautinique/shared-contracts';

import type { Config } from './config.ts';
import type { OtpDeps } from './otp.ts';
import { hibpBreachCheck } from './password.ts';
import { runReleaseSteps } from './release.ts';
import { sessions } from './sessions.ts';
import { type SigningKeys, signingKeys } from './signing-keys.ts';

/**
 * Who gets identity's events (the relay's list): notify emails the code, and tells a person when
 * a copied refresh token ended their session, tells an invited person how to accept,
 * and tells a person whose authenticator a Security Officer reset (backend/notify).
 */
export const SUBSCRIBERS: Readonly<Record<string, readonly string[]>> = {
  [otpRequested.type]: ['notify.otpEmail'],
  [sessionReuseDetected.type]: ['notify.securityEmail'],
  [invitationCreated.type]: ['notify.invitationEmail'],
  [authenticatorReset.type]: ['notify.authenticatorEmail'],
};

export interface RuntimeOptions {
  logger: Logger;
  /** BullMQ key prefix (default `bull`); a test uses its own so it never meets other keys. */
  queuePrefix?: string;
  /** The Redis key that tells a wipe (default `bq:epoch`). */
  epochKey?: string;
  /** How often the relay looks for new events (default: the relay's own). */
  pollMs?: number;
  /** How often the wipe watchdog looks (default 30 s). */
  watchdogMs?: number;
  /** The gateway's passport keys, in memory (backend/bundle); otherwise read from the config URL */
  passportJwks?: readonly PublicJwk[];
}

/** identity's connections and background work: MongoDB, Redis, the outbox relay, the wipe watchdog. */
export interface Runtime {
  mongo: Mongo;
  redis: RedisConnection;
  relay: Relay;
  watchdog: WipeWatchdog;
  /** What the sign-up and sign-in routes need */
  otp: OtpDeps;
  /** The token keys: the JWKS the gateway reads */
  signing: SigningKeys;
  /** The checks for GET /ready. */
  ready: Readonly<Record<string, ReadyCheck>>;
  /** Stops the relay and watchdog, then closes Redis and MongoDB. Safe to call twice. */
  stop(): Promise<void>;
}

/**
 * Reads identity's keys (wrong ones fail the start), connects to MongoDB, runs the release steps
 * (migrations, indexes), connects to Redis, and starts the outbox relay (sign-in codes go to notify
 * as events) and the watchdog that sends recent events again after a Redis wipe. identity has no
 * queue of its own yet: its first subscription brings the worker (T3.5). If one step fails, the
 * ones before it are closed again and the error goes on.
 */
export async function startRuntime(config: Config, options: RuntimeOptions): Promise<Runtime> {
  const { logger, queuePrefix: prefix, epochKey, pollMs, watchdogMs, passportJwks } = options;
  const keys = loadCryptoKeys({ fieldKeys: config.fieldKeys, blindIndexKey: config.blindIndexKey });
  const otpKeys = loadSealingKeys(config.otpEventKeys, 'IDENTITY__OTP_EVENT_KEYS');
  const closers: (() => Promise<void>)[] = [];
  const stop = async () => {
    for (const close of closers.splice(0).toReversed()) await close();
  };
  try {
    const mongo = await connectMongo({
      uri: config.mongoUri,
      dbName: config.mongoDbName,
      appName: 'identity',
      logger,
    });
    closers.push(() => mongo.close());
    // migrations and indexes before anything uses the database (ARCHITECTURE §11.1)
    await runReleaseSteps(mongo, logger);
    const redis = await connectRedis({ url: config.redisUrl, name: 'identity', logger });
    closers.push(() => redis.close());
    const relay = startRelay({
      mongo,
      redis: redis.client,
      logger,
      mode: config.outboxRelay,
      subscribers: SUBSCRIBERS,
      prefix,
      pollMs,
    });
    closers.push(() => relay.stop());
    const watchdog = startWipeWatchdog({
      mongo,
      redis: redis.client,
      logger,
      intervalMs: watchdogMs,
      epochKey,
      // sign-in codes in Redis are gone with it: people ask again (ARCHITECTURE §6.6)
      recover: async () => {
        await redriveOutbox({
          mongo,
          redis: redis.client,
          logger,
          subscribers: SUBSCRIBERS,
          prefix,
        });
      },
    });
    closers.push(() => watchdog.stop());

    const signing = signingKeys({ mongo, keys });
    return {
      mongo,
      redis,
      relay,
      watchdog,
      signing,
      otp: {
        mongo,
        redis: redis.client,
        keys,
        otpKeys,
        logger,
        emailLimitPerHour: config.otpEmailLimitPerHour,
        legalVersion: config.legalVersion,
        breached: hibpBreachCheck({ url: config.hibpUrl, logger }),
        sessions: sessions({ mongo, redis: redis.client, keys, signing, logger }),
        passport: passportVerifier({
          keys: jwksCache({
            load: passportJwks
              ? () => Promise.resolve({ keys: passportJwks })
              : jwksFromUrl(config.passportJwksUrl),
          }),
          audience: passportAudience('identity'),
        }),
      },
      ready: { mongo: mongo.ready, redis: redis.ready, outbox: relay.ready },
      stop,
    };
  } catch (error) {
    await stop();
    throw error;
  }
}
