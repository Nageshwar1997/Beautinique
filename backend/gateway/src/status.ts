import type { ReadyCheck } from '@beautinique/backend-server-kit';
import { type Deployable, DEPLOYABLES } from '@beautinique/shared-contracts';
import type { RequestHandler } from 'express';

type CheckResult = 'ok' | 'failing';

/** One deployable on GET /status: running and its /ready checks, or not part of this setup. */
export type DeployableStatus =
  { status: CheckResult; checks: Record<string, CheckResult> } | { status: 'not-running' };

export interface StatusBody {
  status: 'ok' | 'degraded';
  deployables: Record<Deployable, DeployableStatus>;
}

/** Check names are echoed from the deployables' /ready; only plain names go out. */
const CHECK_NAME = /^[a-z][a-zA-Z0-9.-]{0,39}$/;

/** A deployable's GET /ready, read with a timeout: its own checks, or failing when it cannot say. */
async function readyOf(origin: string, timeoutMs: number): Promise<DeployableStatus> {
  try {
    const res = await fetch(new URL('/ready', origin), { signal: AbortSignal.timeout(timeoutMs) });
    const body = (await res.json()) as { status?: unknown; checks?: unknown };
    const checks: Record<string, CheckResult> = {};
    if (typeof body.checks === 'object' && body.checks !== null) {
      for (const [name, value] of Object.entries(body.checks)) {
        if (CHECK_NAME.test(name)) checks[name] = value === 'ok' ? 'ok' : 'failing';
      }
    }
    const healthy = res.ok && body.status === 'ready';
    return { status: healthy ? 'ok' : 'failing', checks };
  } catch {
    return { status: 'failing', checks: {} };
  }
}

export interface StatusOptions {
  /** the gateway's own /ready checks (Redis) */
  own: Readonly<Record<string, ReadyCheck>>;
  /** origin of each deployable that runs */
  upstreams: Partial<Record<Deployable, string | undefined>>;
  /** how long one deployable may take to answer (default 3 s) */
  timeoutMs?: number;
  /** one answer serves every request for this long, so /status cannot flood the databases (default 5 s) */
  reuseMs?: number;
}

/**
 * GET /status (ARCHITECTURE §14.4): every deployable's deep /ready in one answer, 200 when all that
 * run are ok, else 503. Public by the owner's decision (2026-10-25): only names and ok/failing, as
 * much as /ready already shows; versions, memory and queue depth come later behind sign-in.
 */
export function statusRoute({
  own,
  upstreams,
  timeoutMs = 3000,
  reuseMs = 5000,
}: StatusOptions): RequestHandler {
  let last: { at: number; body: Promise<StatusBody> } | undefined;

  const collect = async (): Promise<StatusBody> => {
    const gateway = async (): Promise<DeployableStatus> => {
      const checks: Record<string, CheckResult> = {};
      for (const [name, check] of Object.entries(own)) {
        try {
          checks[name] = (await check()) ? 'ok' : 'failing';
        } catch {
          checks[name] = 'failing';
        }
      }
      const healthy = Object.values(checks).every((result) => result === 'ok');
      return { status: healthy ? 'ok' : 'failing', checks };
    };
    const entries = await Promise.all(
      DEPLOYABLES.map(async (name): Promise<[Deployable, DeployableStatus]> => {
        if (name === 'gateway') return [name, await gateway()];
        const origin = upstreams[name];
        return [
          name,
          origin === undefined ? { status: 'not-running' } : await readyOf(origin, timeoutMs),
        ];
      }),
    );
    const deployables = Object.fromEntries(entries) as Record<Deployable, DeployableStatus>;
    const degraded = entries.some(([, value]) => value.status === 'failing');
    return { status: degraded ? 'degraded' : 'ok', deployables };
  };

  return async (_req, res) => {
    const now = Date.now();
    if (last === undefined || now - last.at >= reuseMs) {
      last = { at: now, body: collect() };
    }
    const body = await last.body;
    res.setHeader('Cache-Control', 'no-store');
    res.status(body.status === 'ok' ? 200 : 503).json(body);
  };
}
