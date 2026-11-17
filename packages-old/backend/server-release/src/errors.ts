/**
 * Another instance held the release lease for longer than this boot waits. The boot fails and Render
 * starts it again; a crashed holder's lease runs out on its own (lockTtlMs), so the next try goes on.
 */
export class ReleaseLockTimeoutError extends Error {
  constructor(waitMs: number) {
    super(
      `Another instance held the release lease for more than ${String(waitMs)} ms. If it crashed, ` +
        'its lease runs out on its own and the next start goes on.',
    );
    this.name = 'ReleaseLockTimeoutError';
  }
}

/**
 * This boot lost the release lease while its steps ran (it could not renew it in time, and another
 * instance may have taken it). It stops before the next step, so two instances never go on together.
 */
export class ReleaseLeaseLostError extends Error {
  constructor() {
    super(
      'This instance lost the release lease while its steps ran, so it stopped before the next ' +
        'step. Every step is safe to repeat: the next start goes on where this one stopped.',
    );
    this.name = 'ReleaseLeaseLostError';
  }
}

/** A migration threw. It is not marked as applied, so the next start runs it again. */
export class MigrationFailedError extends Error {
  readonly migration: string;

  constructor(migration: string, options: { cause?: unknown } = {}) {
    super(
      `Migration ${migration} failed, so this release stopped: the running release stays in place. ` +
        'Fix the migration (it must be safe to run again) and deploy again.',
      options,
    );
    this.name = 'MigrationFailedError';
    this.migration = migration;
  }
}
