import { describe, expect, it } from 'vitest';

import {
  grantState,
  nextIndianDay,
  scopeText,
  startOfIndianDay,
  validityText,
} from '../src/staff/labels';

describe('Staff labels', () => {
  const now = Date.parse('2026-11-14T06:00:00.000Z');

  it('says where a grant stands now', () => {
    const grant = { active: true, validFrom: null, validTo: null };
    expect(grantState(grant, now)).toBe('active');
    expect(grantState({ ...grant, active: false }, now)).toBe('ended');
    expect(grantState({ ...grant, validFrom: '2026-11-20T00:00:00.000Z' }, now)).toBe('scheduled');
    expect(grantState({ ...grant, validTo: '2026-11-14T06:00:00.000Z' }, now)).toBe('lapsed');
    expect(grantState({ ...grant, validTo: '2026-11-15T00:00:00.000Z' }, now)).toBe('active');
  });

  it('works in India days: an end is never today, the start of a day is 00:00 IST', () => {
    expect(nextIndianDay('2026-11-14')).toBe('2026-11-15');
    expect(nextIndianDay('2026-12-31')).toBe('2027-01-01');
    expect(startOfIndianDay('2026-11-15')).toBe('2026-11-14T18:30:00.000Z');
  });

  it('says scopes and validity in words', () => {
    expect(scopeText({ type: 'global', ids: [] })).toBe('Everywhere');
    expect(scopeText({ type: 'state', ids: ['MH', 'DL'] })).toBe('Maharashtra, Delhi');
    expect(scopeText({ type: 'hub', ids: ['a', 'b'] })).toBe('Hubs: 2');
    expect(validityText(null, null)).toBe('No end');
    expect(validityText(null, '2026-11-20T00:00:00.000Z')).toBe('Until 20 Nov 2026');
  });
});
