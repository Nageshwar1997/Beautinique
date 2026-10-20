import type { RunningServer } from '@beautinique/backend-server-kit';

import { prepareAll } from './deployables.ts';
import type { Env } from './prepare.ts';

export interface Bundle {
  /** the gateway, the only server reachable from outside */
  url: string;
  port: number;
  /** the deployables that run, in start order */
  names: string[];
  /** stops the gateway first, then the others (last started first); safe to call twice */
  stop(): Promise<void>;
}

/**
 * Bundle mode (ARCHITECTURE §3, §11.1): every deployable in this one process. All configs are read
 * before anything starts, and each deployable's keys leave env. The internal deployables listen on
 * free 127.0.0.1 ports, and the gateway, on the public port, gets their URLs.
 */
export async function startBundle({ port, env }: { port: number; env: Env }): Promise<Bundle> {
  const { internal, gateway } = prepareAll(env);
  const running: { name: string; server: RunningServer }[] = [];
  const stopAll = async () => {
    for (const { server } of running.toReversed()) {
      await server.stop();
    }
  };
  let front: RunningServer;
  try {
    for (const deployable of internal) {
      const server = await deployable.start({ port: 0, host: '127.0.0.1', handleSignals: false });
      running.push({ name: deployable.name, server });
    }
    const upstreams = Object.fromEntries(running.map(({ name, server }) => [name, server.url]));
    front = await gateway.start({ port, upstreams, handleSignals: false });
    running.push({ name: gateway.name, server: front });
  } catch (error) {
    await stopAll();
    throw error;
  }
  let stopping: Promise<void> | undefined;
  return {
    url: front.url,
    port: front.port,
    names: running.map(({ name }) => name),
    stop: () => (stopping ??= stopAll()),
  };
}
