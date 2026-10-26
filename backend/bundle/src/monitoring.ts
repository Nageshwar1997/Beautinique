import type { MonitoringOptions } from '@beautinique/backend-server-kit/monitoring';

type Env = Record<string, string | undefined>;

/**
 * The process-wide Sentry settings, not one deployable's: SENTRY_DSN (empty = off), SENTRY_ENVIRONMENT
 * (default `live` on Render, which sets RENDER=true, else `development`) and the commit Render deploys
 * (RENDER_GIT_COMMIT) as the release.
 */
export function monitoringOptions(env: Env): MonitoringOptions {
  // an empty value (as .env.example leaves it) means "not set"
  const named = env.SENTRY_ENVIRONMENT?.trim() ?? '';
  return {
    dsn: env.SENTRY_DSN,
    environment: named !== '' ? named : env.RENDER === 'true' ? 'live' : 'development',
    release: env.RENDER_GIT_COMMIT,
  };
}
