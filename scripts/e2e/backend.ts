// The whole backend for the apps' Playwright E2E (ARCHITECTURE §9.2): gateway, identity, notify and
// core in one process (backend/bundle), on the laptop's or CI's Docker MongoDB, Valkey and Mailpit
// (`npm run infra:up`), with databases and keys of its own made for this run, so a run never touches
// a dev server's data. Started by each app's playwright.config.ts as its web server:
//   node --conditions=beautinique-source scripts/e2e/backend.ts
// Settings from the config (BQ_E2E_*): the port, the origin secret, the run id and the app's host;
// and for social sign-in (the customer app) the stand-in providers' port and the app's origin.
import { randomBytes } from 'node:crypto';

import { startBundle } from '../../backend/bundle/src/bundle.ts';
import { startFakeOAuth } from './fake-oauth.ts';
import { markRunning, unmarkRunning } from './runs.ts';

const need = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === '')
    throw new Error(`${key} is missing (playwright.config.ts sets it)`);
  return value;
};

const runId = need('BQ_E2E_RUN');
const port = Number(need('BQ_E2E_GATEWAY_PORT'));
const otpKeys = `e1:${randomBytes(32).toString('base64')}`;
const mongo = 'mongodb://localhost:27017/?replicaSet=rs0';
// a Redis database of its own (the bundle test has 5, dev servers 0)
const redis = 'redis://localhost:6379/6';

const env: Record<string, string> = {
  ...Object.fromEntries(
    ['GATEWAY', 'IDENTITY', 'NOTIFY', 'CORE'].map((name) => [`${name}__LOG_LEVEL`, 'warn']),
  ),
  CORE__MONGO_URI: mongo,
  CORE__MONGO_DB_NAME: `bq_e2e_${runId}_core`,
  CORE__REDIS_URL: redis,
  IDENTITY__MONGO_URI: mongo,
  IDENTITY__MONGO_DB_NAME: `bq_e2e_${runId}_identity`,
  IDENTITY__REDIS_URL: redis,
  IDENTITY__FIELD_KEYS: `k1:${randomBytes(32).toString('base64')}`,
  IDENTITY__BLIND_INDEX_KEY: `b1:${randomBytes(32).toString('base64')}`,
  IDENTITY__OTP_EVENT_KEYS: otpKeys,
  // nothing listens there: the breached-password check is away and lets passwords through
  // (fail-open), and the run never reaches the internet
  IDENTITY__HIBP_URL: 'http://127.0.0.1:9',
  // every test asks codes from one IP, and some for one email more than once
  IDENTITY__OTP_EMAIL_LIMIT_PER_HOUR: '100',
  // every project and worker signs in: far more than a live minute's 30 hashes (QA DR-004)
  IDENTITY__LOGIN_HASHES_PER_MINUTE: '1000',
  NOTIFY__MONGO_URI: mongo,
  NOTIFY__MONGO_DB_NAME: `bq_e2e_${runId}_notify`,
  NOTIFY__REDIS_URL: redis,
  NOTIFY__EMAIL_TRANSPORT: 'mailpit',
  NOTIFY__EMAIL_FROM: 'no-reply@beautinique.example',
  NOTIFY__OTP_EVENT_KEYS: otpKeys,
  GATEWAY__REDIS_URL: redis,
  GATEWAY__ORIGIN_SECRETS: need('BQ_E2E_ORIGIN_SECRET'),
  GATEWAY__APP_HOSTS: need('BQ_E2E_APP_HOSTS'),
  // one browser from one IP plays many people: the real budgets would stop the run
  GATEWAY__RATE_LIMITS: 'otp=1000/1m,auth=1000/1m,read=1000/1m,write=1000/1m',
  // a busy laptop or CI runner hashes passwords slowly: no 503 for a slow sign-in
  GATEWAY__UPSTREAM_TIMEOUT_MS: '90000',
};

// social sign-in: Google, LinkedIn and GitHub stand-ins on this machine (scripts/e2e/fake-oauth.ts),
// never the real ones; the specs queue who signs in next at <its url>/fake/next
const oauthPort = process.env.BQ_E2E_OAUTH_PORT;
const fake =
  oauthPort === undefined || oauthPort === ''
    ? null
    : await startFakeOAuth({ port: Number(oauthPort) });
if (fake) {
  Object.assign(env, {
    IDENTITY__OAUTH_PROVIDERS_URL: fake.url,
    IDENTITY__OAUTH_REDIRECT_ORIGIN: need('BQ_E2E_APP_ORIGIN'),
    // made per run: no secret-looking literal in the repo (gitleaks)
    ...Object.fromEntries(
      ['GOOGLE', 'LINKEDIN', 'GITHUB'].flatMap((provider) => [
        [`IDENTITY__${provider}_CLIENT_ID`, `e2e-${provider.toLowerCase()}`],
        [`IDENTITY__${provider}_CLIENT_SECRET`, randomBytes(24).toString('base64url')],
      ]),
    ),
  });
}

const bundle = await startBundle({ port, env });
// the teardown stops this process before it drops the run's databases (scripts/e2e/runs.ts)
markRunning(runId);
console.log(`e2e backend on http://localhost:${String(bundle.port)} (run ${runId})`);
const stop = () => {
  Promise.all([bundle.stop(), fake?.stop()]).then(
    () => {
      unmarkRunning(runId);
      process.exit(0);
    },
    (error: unknown) => {
      console.error('e2e backend did not stop cleanly', error);
      process.exit(1);
    },
  );
};
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
