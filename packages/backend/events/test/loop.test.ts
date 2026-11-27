import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { startLoop } from '../src/utils/loop.ts';

// The loop of the dispatcher and the ticker, on fake timers: no real waiting (docs/RULES.md RT-25).
describe('the loop of the dispatcher and the ticker (docs/ARCHITECTURE.md §3 rule 3, §4 rule 1)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('AC-PLATFORM-6: the first run after its wait, then every period', async () => {
    const run = vi.fn(() => Promise.resolve());
    const loop = startLoop({ run, everyMs: 1_000, firstInMs: 500, onError: vi.fn() });

    await vi.advanceTimersByTimeAsync(499);
    expect(run).toHaveBeenCalledTimes(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(run).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(run).toHaveBeenCalledTimes(2);
    await loop.stop();
  });

  it('AC-PLATFORM-6: a nudge runs at once, and one during a run runs once more right after it', async () => {
    let finish: () => void = () => undefined;
    const run = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const loop = startLoop({ run, everyMs: 60_000, firstInMs: 60_000, onError: vi.fn() });

    loop.nudge();
    await vi.advanceTimersByTimeAsync(0);
    expect(run).toHaveBeenCalledTimes(1);
    // Two nudges while it runs: never two runs at once, one more after it.
    loop.nudge();
    loop.nudge();
    await vi.advanceTimersByTimeAsync(0);
    expect(run).toHaveBeenCalledTimes(1);
    finish();
    await vi.advanceTimersByTimeAsync(0);
    expect(run).toHaveBeenCalledTimes(2);
    finish();
    await vi.advanceTimersByTimeAsync(0);
    expect(run).toHaveBeenCalledTimes(2);
    await loop.stop();
  });

  it('AC-PLATFORM-6: an error of a run is told, and the loop goes on', async () => {
    const onError = vi.fn();
    const run = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue(undefined);
    const loop = startLoop({ run, everyMs: 100, firstInMs: 0, onError });

    await vi.advanceTimersByTimeAsync(0);
    expect(onError).toHaveBeenCalledWith(new Error('down'));
    await vi.advanceTimersByTimeAsync(100);
    expect(run).toHaveBeenCalledTimes(2);
    await loop.stop();
  });

  it('AC-PLATFORM-6: stop waits for the run going on, and nothing runs after it', async () => {
    let finish: () => void = () => undefined;
    let ended = false;
    const run = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = () => {
            ended = true;
            resolve();
          };
        }),
    );
    const loop = startLoop({ run, everyMs: 10, firstInMs: 0, onError: vi.fn() });
    await vi.advanceTimersByTimeAsync(0);

    const stopped = loop.stop();
    loop.nudge();
    finish();
    await stopped;
    expect(ended).toBe(true);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(run).toHaveBeenCalledTimes(1);
  });
});
