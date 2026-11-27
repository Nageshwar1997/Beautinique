export interface Loop {
  /** Runs soon: at once if it is waiting, or once more right after the run that is going on. */
  nudge(): void;
  /** Stops it: no run starts after this, and the one going on is waited for. */
  stop(): Promise<void>;
}

export interface LoopOptions {
  run: () => Promise<unknown>;
  /** The wait after each run. */
  everyMs: number;
  /** The wait before the first run. */
  firstInMs: number;
  /** An error of a run; the loop goes on. */
  onError: (thrown: unknown) => void;
}

/**
 * A loop of one run at a time: never two at once, the next after `everyMs`, or sooner on a nudge.
 * Its timers do not keep the process up, so a process with nothing else to do may end.
 */
export function startLoop({ run, everyMs, firstInMs, onError }: LoopOptions): Loop {
  let timer: NodeJS.Timeout | undefined;
  let running: Promise<void> | undefined;
  let again = false;
  let stopped = false;

  const schedule = (ms: number): void => {
    clearTimeout(timer);
    timer = setTimeout(go, ms);
    timer.unref();
  };

  // A timer is set only while no run goes on (a nudge during a run asks for one after it), so
  // two runs never meet.
  function go(): void {
    if (stopped) return;
    running = run()
      .then(
        () => undefined,
        (thrown: unknown) => {
          onError(thrown);
        },
      )
      .finally(() => {
        running = undefined;
        if (stopped) return;
        const soon = again;
        again = false;
        schedule(soon ? 0 : everyMs);
      });
  }

  schedule(firstInMs);
  return {
    nudge() {
      if (stopped) return;
      if (running !== undefined) again = true;
      else schedule(0);
    },
    async stop() {
      stopped = true;
      clearTimeout(timer);
      await running;
    },
  };
}
