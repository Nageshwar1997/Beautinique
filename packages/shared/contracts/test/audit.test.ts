// T4.1 PR C: the audit log's contracts (ARCHITECTURE §6.5): identity's audit event, the viewer's
// routes, the read permission, and how personal data is half hidden (owner, 2026-11-15).
import { describe, expect, it } from 'vitest';

import {
  AUDIT_DAYS_MAX,
  AUDIT_RETENTION_DAYS,
  auditRead,
  auditRecorded,
  events,
  listAuditDays,
  listAuditEntries,
  maskEmail,
  maskForAudit,
  maskPhone,
  permissions,
  routes,
} from '../src';

const hex = (n: number) => n.toString(16).padStart(24, '0');

const record = {
  action: 'iam.grant.give',
  actor: {
    userId: hex(2),
    app: 'master',
    sessionId: hex(3),
    roles: ['master.master'],
    system: null,
  },
  resource: { type: 'grant', id: hex(4) },
  scope: { type: 'global', ids: [] },
  before: null,
  after: { role: 'admin.state_admin', email: 'n•••@gmail.com' },
  reason: null,
  result: 'success',
  ip: '203.0.113.9',
  userAgent: 'Chrome on Windows',
  requestId: 'req-1',
  at: '2026-11-15T10:00:00.000Z',
};

describe('the audit contracts', () => {
  it("carry identity's audit event, the viewer's two routes and the read permission", () => {
    expect(events.get('identity.audit.recorded', 1)).toBe(auditRecorded);
    expect(auditRecorded.producer).toBe('identity');
    expect(routes.map((route) => route.id)).toEqual(
      expect.arrayContaining(['audit.entries.list', 'audit.days.list']),
    );
    expect(permissions.get('audit.entry.read')).toBe(auditRead);
    expect(auditRead.scopeTypes).toEqual(['global']);
    for (const route of [listAuditEntries, listAuditDays]) {
      // core answers them, in the Master app only, to the read permission
      expect(route).toMatchObject({
        method: 'GET',
        owner: 'core',
        apps: ['master'],
        access: { type: 'permission', permission: 'audit.entry.read' },
        idempotency: false,
      });
    }
    expect(AUDIT_RETENTION_DAYS).toBe(400);
    expect(AUDIT_DAYS_MAX).toBeGreaterThanOrEqual(31);
  });

  it('take an audit record as identity sends it, and refuse a wrong one', () => {
    const data = auditRecorded.data.parse(record);
    expect(data).toEqual(record);
    expect(() => auditRecorded.data.parse({ ...record, result: 'maybe' })).toThrow();
    expect(() =>
      auditRecorded.data.parse({ ...record, actor: { ...record.actor, roles: ['Master'] } }),
    ).toThrow();
    expect(() => auditRecorded.data.parse({ ...record, at: 'yesterday' })).toThrow();
  });

  it('page the entries with filters, and ask for the days of a range', () => {
    expect(
      listAuditEntries.input.query.parse({
        actorId: hex(2),
        action: 'iam.grant.give',
        result: 'denied',
        limit: '50',
      }),
    ).toMatchObject({ actorId: hex(2), result: 'denied', limit: 50 });
    expect(() => listAuditEntries.input.query.parse({ actorId: 'nobody' })).toThrow();
    expect(listAuditDays.input.query.parse({ from: '2026-11-01', to: '2026-11-15' })).toEqual({
      from: '2026-11-01',
      to: '2026-11-15',
    });
    expect(() => listAuditDays.input.query.parse({ from: '1 Nov', to: '2026-11-15' })).toThrow();
  });
});

describe('maskForAudit (owner, 2026-11-15)', () => {
  it('keeps the first letter and the domain of an email, under any key', () => {
    expect(maskEmail('nagesh@gmail.com')).toBe('n•••@gmail.com');
    expect(maskForAudit({ invitee: 'asha@beautinique.example' })).toEqual({
      invitee: 'a•••@beautinique.example',
    });
    // not an email: as it is
    expect(maskEmail('not an email')).toBe('not an email');
  });

  it('keeps the last 4 digits of a phone, and hides a name, an address or a PAN whole', () => {
    expect(maskPhone('+91 98765 43210')).toBe('••••••3210');
    expect(
      maskForAudit({
        mobile: '9876543210',
        fullName: 'Asha Rao',
        address: { line1: '12 MG Road', city: 'Pune' },
        pan: 'ABCDE1234F',
        role: 'admin.state_admin',
        name: 'Seller Finance',
      }),
    ).toEqual({
      mobile: '••••••3210',
      fullName: '[hidden]',
      address: '[hidden]',
      pan: '[hidden]',
      // a role and a role's name are no personal data
      role: 'admin.state_admin',
      name: 'Seller Finance',
    });
  });

  it('goes into arrays and nested objects, keeps other values, and changes nothing the second time', () => {
    const value = {
      emails: ['ravi@beautinique.example', 'meera@beautinique.example'],
      grant: { scope: { type: 'state', ids: ['MH'] }, count: 2, active: true, ends: null },
      phone: '98765 43210',
    };
    const once = maskForAudit(value);
    expect(once).toEqual({
      emails: ['r•••@beautinique.example', 'm•••@beautinique.example'],
      grant: { scope: { type: 'state', ids: ['MH'] }, count: 2, active: true, ends: null },
      phone: '••••••3210',
    });
    expect(maskForAudit(once)).toEqual(once);
    expect(maskForAudit({ fullName: null })).toEqual({ fullName: null });
  });
});
