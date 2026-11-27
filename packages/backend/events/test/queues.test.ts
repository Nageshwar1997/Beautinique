import { describe, expect, it } from 'vitest';

import { defineJob, jobIdOf, type JobKind } from '../src/queues.ts';

const kind = (overrides: Partial<JobKind> = {}): JobKind => ({
  name: 'notify.email.send',
  queue: 'light',
  pending: () => Promise.resolve([]),
  run: () => Promise.resolve(),
  ...overrides,
});

describe('the kinds of job (docs/ARCHITECTURE.md §4 rules 2 and 3)', () => {
  it('AC-PLATFORM-7: a kind is <service>.<thing>.<work> of a service of the list, on the light or the heavy queue', () => {
    expect(defineJob(kind()).name).toBe('notify.email.send');
    expect(defineJob(kind({ name: 'finance.export.build', queue: 'heavy' })).queue).toBe('heavy');
    expect(() => defineJob(kind({ name: 'email.send' }))).toThrow(
      'The job email.send is not <service>.<thing>.<work>, like notify.email.send.',
    );
    expect(() => defineJob(kind({ name: 'shop.email.send' }))).toThrow(RangeError);
    expect(() => defineJob(kind({ queue: 'fast' as 'light' }))).toThrow(
      'The queue of notify.email.send is light or heavy.',
    );
  });

  it('AC-PLATFORM-7: the job id is the kind and the record id, so one record is one job', () => {
    expect(jobIdOf('notify.email.send', '6747a1b2c3d4e5f601234567')).toBe(
      'notify.email.send.6747a1b2c3d4e5f601234567',
    );
    expect(jobIdOf('notify.email.send', '123')).toBe('notify.email.send.123');
    for (const bad of ['', 'a:b', 'a b', 'x'.repeat(129)]) {
      expect(() => jobIdOf('notify.email.send', bad)).toThrow(
        'The record id of a notify.email.send job is 1 to 128 letters, digits, _ and -.',
      );
    }
  });
});
