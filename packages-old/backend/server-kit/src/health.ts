import { Router } from 'express';

/** A dependency check for /ready (Mongo, Redis, outbox lag ...): true when healthy. */
export type ReadyCheck = () => boolean | Promise<boolean>;

/**
 * GET /health: the process and event loop are alive; nothing else is checked, so a slow database
 * never makes Render restart the service (ARCHITECTURE §11.1).
 * GET /ready: every check passes (200) or not (503), with each check's result.
 */
export function healthRoutes(checks: Readonly<Record<string, ReadyCheck>> = {}): Router {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  router.get('/ready', async (_req, res) => {
    const results = Object.fromEntries(
      await Promise.all(
        Object.entries(checks).map(async ([name, check]) => {
          try {
            return [name, (await check()) ? 'ok' : 'failing'] as const;
          } catch {
            return [name, 'failing'] as const;
          }
        }),
      ),
    );
    const ready = Object.values(results).every((result) => result === 'ok');
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready', checks: results });
  });
  return router;
}
