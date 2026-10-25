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

export const recordPing = defineRoute({
  id: 'platform.ping.record',
  method: 'POST',
  path: '/platform/pings',
  summary: 'Record a ping (writes the platform.ping.recorded event in the same transaction)',
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'write',
  idempotency: true,
  stepUp: false,
  owner: 'core',
  input: { body: object({ note: noteZod }) },
  output: pingData,
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
