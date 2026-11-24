import { fork } from 'node:child_process';

export { FAKE_TOKEN, FAKE_USER } from './fake-registry-server.ts';

// A small npm registry on 127.0.0.1 for the CLI's tests (OPERATIONS §11 rule 8). The real `npm
// publish` and `npm whoami` talk to it: it checks the token, refuses a version that is already
// there, and can be told to fail publishes (a 5xx, or an expired session). It runs in a child
// process, so it keeps answering while the CLI waits for npm.
export interface FakeRegistry {
  url: string;
  /** Packages already published, as if by an earlier release. */
  seed: (name: string, versions: string[]) => Promise<void>;
  versionsOf: (name: string) => Promise<string[]>;
  /** After `skip` publishes that work, the next `count` answer `status` instead of storing. */
  failPublishes: (count: number, status: number, skip?: number) => Promise<void>;
  /** `METHOD /path` of every request, in order. */
  requests: () => Promise<string[]>;
  clearRequests: () => Promise<void>;
  close: () => Promise<void>;
}

interface Reply {
  id?: number;
  ready?: string;
  result?: unknown;
}

export async function startFakeRegistry(): Promise<FakeRegistry> {
  const child = fork(new URL('./fake-registry-server.ts', import.meta.url), [], { execArgv: [] });
  const waiting = new Map<number, (result: unknown) => void>();
  const url = await new Promise<string>((resolve, reject) => {
    child.on('error', reject);
    child.on('message', (message: Reply) => {
      if (message.ready !== undefined) resolve(message.ready);
      else if (message.id !== undefined) waiting.get(message.id)?.(message.result);
    });
  });

  let next = 0;
  const ask = (message: Record<string, unknown>) =>
    new Promise<unknown>((resolve) => {
      next += 1;
      waiting.set(next, resolve);
      child.send({ ...message, id: next });
    });

  return {
    url,
    seed: async (name, versions) => {
      await ask({ op: 'seed', name, versions });
    },
    versionsOf: async (name) => (await ask({ op: 'versions', name })) as string[],
    failPublishes: async (count, status, skip = 0) => {
      await ask({ op: 'fail', count, status, skip });
    },
    requests: async () => (await ask({ op: 'requests' })) as string[],
    clearRequests: async () => {
      await ask({ op: 'clear' });
    },
    close: async () => {
      const exited = new Promise<void>((resolve) => {
        child.once('exit', () => {
          resolve();
        });
      });
      child.send({ op: 'close', id: 0 });
      await exited;
    },
  };
}
