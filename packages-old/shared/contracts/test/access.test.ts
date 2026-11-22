import { describe, expect, it } from 'vitest';

import {
  ACCESS_EVENTS,
  CODE_SCOPE_TYPES,
  events,
  grantsChanged,
  MAX_GRANTS_PER_ACCOUNT,
  roleChanged,
  SCOPE_TYPES,
  userChanged,
} from '../src';

// the outbox's limit for one event (backend-server-queue EVENT_MAX_BYTES); contracts cannot import it
const EVENT_MAX_BYTES = 16 * 1024;
const hex = (n: number) => n.toString(16).padStart(24, '0');

const envelope = (type: string, data: unknown) => ({
  eventId: hex(1),
  type,
  version: 1,
  occurredAt: '2026-11-14T10:00:00.000Z',
  producer: 'identity',
  aggregate: { type: 'user', id: hex(2) },
  actor: { type: 'system', id: 'identity' },
  correlationId: 'req-1',
  causationId: null,
  scope: null,
  data,
});

describe('identity snapshot events (TASKS T3.5)', () => {
  it('are in the platform catalogue, from identity', () => {
    for (const event of ACCESS_EVENTS) {
      expect(events.get(event.type, 1)).toBe(event);
      expect(event.producer).toBe('identity');
    }
  });

  it('carry a role with its permission keys, and an account grants by role id only', () => {
    const role = {
      roleId: hex(3),
      key: 'admin.state_admin',
      app: 'admin',
      permissions: ['iam.app.sign_in', 'iam.grant.read'],
      scopeTypes: ['state'],
      mfaRequired: true,
      retired: false,
      changedAt: '2026-11-14T10:00:00.000Z',
    };
    expect(roleChanged.envelope.parse(envelope(roleChanged.type, role)).data).toEqual(role);
    const grant = {
      grantId: hex(4),
      roleId: hex(3),
      app: 'admin',
      scope: { type: 'state', ids: ['MH'] },
      validFrom: null,
      validTo: '2027-01-01T00:00:00.000Z',
    };
    const data = { userId: hex(2), authzVersion: 3, grants: [grant] };
    expect(grantsChanged.envelope.parse(envelope(grantsChanged.type, data)).data).toEqual(data);
    // a role's permissions never ride in a grant
    expect(
      grantsChanged.envelope.parse(
        envelope(grantsChanged.type, { ...data, grants: [{ ...grant, permissions: ['x.y.z'] }] }),
      ).data.grants[0],
    ).not.toHaveProperty('permissions');
    expect(() =>
      grantsChanged.envelope.parse(envelope(grantsChanged.type, { ...data, authzVersion: -1 })),
    ).toThrow();
  });

  it('keep an account with the most grants it may hold, each on two hubs for a year, under the event limit', () => {
    expect(MAX_GRANTS_PER_ACCOUNT).toBe(50);
    const grants = Array.from({ length: MAX_GRANTS_PER_ACCOUNT }, (_, n) => ({
      grantId: hex(1000 + n),
      roleId: hex(2000 + n),
      app: 'logistics',
      scope: { type: 'hub', ids: [hex(3000 + n), hex(4000 + n)] },
      validFrom: '2026-11-14T10:00:00.000Z',
      validTo: '2027-11-14T10:00:00.000Z',
    }));
    const event = grantsChanged.envelope.parse(
      envelope(grantsChanged.type, { userId: hex(2), authzVersion: 120, grants }),
    );
    expect(Buffer.byteLength(JSON.stringify(event))).toBeLessThan(EVENT_MAX_BYTES);
  });

  it('carry an account with its email, as made at sign-up', () => {
    const data = {
      userId: hex(2),
      email: 'asha@beautinique.example',
      status: 'active',
      createdAt: '2026-11-14T10:00:00.000Z',
      changedAt: '2026-11-14T10:00:00.000Z',
    };
    expect(userChanged.envelope.parse(envelope(userChanged.type, data)).data).toEqual(data);
    expect(() =>
      userChanged.envelope.parse(envelope(userChanged.type, { ...data, email: 'not an email' })),
    ).toThrow();
  });
});

describe('CODE_SCOPE_TYPES', () => {
  it('names the scope types whose ids are codes: everywhere and a state, nothing else', () => {
    expect([...CODE_SCOPE_TYPES].sort()).toEqual(['global', 'state']);
    expect(SCOPE_TYPES.filter((type) => !CODE_SCOPE_TYPES.has(type))).toContain('self');
  });
});
