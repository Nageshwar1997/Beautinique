import type { Logger, ReadyCheck } from '@beautinique/backend-server-kit';
import { Redis } from 'ioredis';

export interface ConnectRedisOptions {
  /** From the deployable's config (REDIS_URL). Never logged: it can hold a password. */
  url: string;
  /** Shown in `CLIENT LIST` on the server: the deployable's name. */
  name: string;
  logger: Logger;
  /** How long to wait for Redis at start (default 5 s). */
  connectTimeoutMs?: number;
  /**
   * The plan's connection limit (default 50: Render's free Key Value, which the local Valkey copies).
   * At 80% of it the start log warns, because a deploy runs the old and new instance together.
   */
  connectionLimit?: number;
}

export interface RedisConnection {
  /** The deployable's one shared command client (BullMQ queues reuse it; workers open their own). */
  client: Redis;
  /** For /ready: true when Redis answers a PING within 2 seconds. */
  ready: ReadyCheck;
  /** For startServer's onStop: closes the connection. Safe to call twice. */
  close(): Promise<void>;
}

/** The fields of `INFO memory` and `INFO clients` that matter on Render's free Key Value. */
export interface RedisLimits {
  maxmemoryBytes: number;
  policy: string;
  connectedClients: number;
}

/** Reads `key:value` lines of an INFO reply. */
export function parseRedisInfo(info: string): RedisLimits {
  const fields = new Map<string, string>();
  for (const line of info.split(/\r?\n/)) {
    const at = line.indexOf(':');
    if (at > 0) fields.set(line.slice(0, at), line.slice(at + 1).trim());
  }
  return {
    maxmemoryBytes: Number(fields.get('maxmemory') ?? 0),
    policy: fields.get('maxmemory_policy') ?? 'unknown',
    connectedClients: Number(fields.get('connected_clients') ?? 0),
  };
}

/**
 * BullMQ needs `noeviction`: with any other policy a full Redis silently drops jobs (ARCHITECTURE
 * §6.6). Render Key Value and the local Valkey both run with it.
 */
export function assertNoEviction(limits: RedisLimits): void {
  if (limits.policy !== 'noeviction') {
    throw new Error(
      `Redis must use maxmemory-policy noeviction (it uses "${limits.policy}"): any other policy ` +
        'silently drops queued jobs when memory is full. Locally run `npm run infra:up`; on Render ' +
        'set the Key Value eviction policy to noeviction.',
    );
  }
}

/**
 * The deployable's shared Redis client. Commands fail fast while Redis is away (OTP and rate limits
 * then answer 503 instead of hanging), and the client keeps reconnecting, because Render's free Key
 * Value restarts empty now and then. Checks the eviction policy at start and logs memory and
 * connection numbers, never the URL.
 */
export async function connectRedis({
  url,
  name,
  logger,
  connectTimeoutMs = 5000,
  connectionLimit = 50,
}: ConnectRedisOptions): Promise<RedisConnection> {
  const client = new Redis(url, {
    lazyConnect: true,
    connectionName: name,
    connectTimeout: connectTimeoutMs,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });
  // without a listener every reconnect error is an unhandled 'error' event; one line per 10 s is enough
  let lastErrorLog = 0;
  client.on('error', (error: Error) => {
    if (Date.now() - lastErrorLog < 10_000) return;
    lastErrorLog = Date.now();
    logger.warn({ err: { name: error.name, message: error.message } }, 'redis error');
  });
  try {
    await client.connect();
  } catch (error) {
    client.disconnect();
    // ioredis names the host; ours says what to do (and never prints the URL)
    throw new Error(
      `Redis did not answer within ${String(connectTimeoutMs)} ms. Locally run \`npm run infra:up\`; ` +
        'live, check REDIS_URL.',
      { cause: error },
    );
  }
  try {
    const limits = parseRedisInfo(
      `${await client.info('memory')}\n${await client.info('clients')}`,
    );
    assertNoEviction(limits);
    logger.info(
      {
        maxmemoryMb: Math.round(limits.maxmemoryBytes / 1024 / 1024),
        policy: limits.policy,
        connectedClients: limits.connectedClients,
      },
      'redis connected',
    );
    if (limits.connectedClients >= connectionLimit * 0.8) {
      logger.warn(
        { connectedClients: limits.connectedClients, connectionLimit },
        'redis is near its connection limit',
      );
    }
  } catch (error) {
    client.disconnect();
    throw error;
  }
  let closed = false;
  return {
    client,
    ready: async () => {
      let timer: NodeJS.Timeout | undefined;
      const timeout = new Promise<false>((resolve) => {
        timer = setTimeout(() => {
          resolve(false);
        }, 2000);
      });
      try {
        return await Promise.race([client.ping().then(() => true), timeout]);
      } catch {
        return false;
      } finally {
        clearTimeout(timer);
      }
    },
    close: async () => {
      if (closed) return;
      closed = true;
      try {
        await client.quit();
      } catch {
        client.disconnect();
      }
      logger.info('redis closed');
    },
  };
}
