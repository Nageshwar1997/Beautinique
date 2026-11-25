import net from 'node:net';

// The network guard of the CLI's tests (OPERATIONS §11 rule 8, AC-PACKAGES-12): a test process
// cannot open a connection to anything but this machine, so no test can reach the real npm
// registry by mistake. Child processes (the real `npm`) are kept off it by being handed the fake
// registry's address only.
const LOOPBACK = new Set(['127.0.0.1', '::1', 'localhost']);

export const blockedAttempts: string[] = [];

// The host a `Socket#connect` call goes to, in each of its forms: `connect(options)`,
// `connect(port, host)`, and the normalized `[options, callback]` list that `net.connect()`,
// `net.createConnection()`, `http` and `fetch` pass. No host means localhost; a `path` is a local
// pipe or socket, never the network.
function targetHost(args: unknown[]): string | undefined {
  const first: unknown = Array.isArray(args[0]) ? (args[0] as unknown[])[0] : args[0];
  if (typeof first === 'number' || typeof first === 'string') {
    if (typeof first === 'string' && !/^\d+$/.test(first)) return undefined;
    return typeof args[1] === 'string' ? args[1] : 'localhost';
  }
  if (first && typeof first === 'object') {
    const options = first as { host?: unknown; path?: unknown };
    if (typeof options.path === 'string') return undefined;
    return typeof options.host === 'string' ? options.host : 'localhost';
  }
  return undefined;
}

export function installNetworkGuard(): void {
  // Called back with the socket as `this` below, so the unbound reference is intended.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const original = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function guarded(this: net.Socket, ...args: unknown[]) {
    const host = targetHost(args);
    if (host !== undefined && !LOOPBACK.has(host)) {
      blockedAttempts.push(host);
      throw new Error(`Network guard: a test tried to connect to ${host}`);
    }
    return Reflect.apply(original, this, args) as net.Socket;
  };
}
