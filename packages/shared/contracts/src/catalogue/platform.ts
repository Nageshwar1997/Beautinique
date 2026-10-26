import { isoDateTimeZod, object, string, uuidv7Zod } from '@beautinique/shared-zod';

import { defineEvent } from '../events';
import { definePermission } from '../permissions';
import { APPS } from '../platform';
import { defineRoute } from '../routes';

/** Milestone 1 sample: record a ping, and the `platform.ping.recorded` event goes out with it. */
const noteZod = string().min(1).max(200);
const pingData = object({
  pingId: uuidv7Zod,
  note: noteZod,
  recordedAt: isoDateTimeZod,
});

export const pingRecorded = defineEvent({
  type: 'platform.ping.recorded',
  version: 1,
  producer: 'core',
  description: 'A ping was recorded (Milestone 1 sample: outbox, queue and inbox end to end)',
  data: pingData,
});

export const pingRead = definePermission({
  key: 'platform.ping.read',
  description: 'Read recorded pings',
  scopeTypes: ['global'],
  risk: 'low',
  mfa: false,
  secondSignature: false,
});

/**
 * Public so the live demo works before login exists (owner, 2026-10-25): the `write` rate limit per
 * IP holds it back, and core deletes pings after 7 days.
 */
export const recordPing = defineRoute({
  id: 'platform.ping.record',
  method: 'POST',
  path: '/platform/pings',
  summary: 'Record a ping (writes the platform.ping.recorded event in the same transaction)',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'write',
  idempotency: true,
  stepUp: false,
  owner: 'core',
  input: { body: object({ note: noteZod }) },
  output: pingData,
});

/**
 * Wakes the live server (ARCHITECTURE §11.1): the free Render service sleeps after 15 idle minutes,
 * and every app calls this when it opens, behind its wake-up screen. Core owns it, so an answer means
 * the gateway and a deployable both run; it touches no database. Never CDN-cached: a cached answer
 * would wake nothing.
 */
export const wake = defineRoute({
  id: 'platform.server.wake',
  method: 'GET',
  path: '/platform/wake',
  summary: 'Wake the live server; answers once the gateway and core are up',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'public',
  idempotency: false,
  stepUp: false,
  owner: 'core',
  input: {},
  output: object({ awakeAt: isoDateTimeZod }),
});

export const getPing = defineRoute({
  id: 'platform.ping.get',
  method: 'GET',
  path: '/platform/pings/:pingId',
  summary: 'Read one recorded ping',
  apps: ['admin', 'superadmin', 'master'],
  access: { type: 'permission', permission: pingRead.key },
  rateLimit: 'read',
  idempotency: false,
  stepUp: false,
  owner: 'core',
  input: { params: object({ pingId: uuidv7Zod }) },
  output: pingData,
});
