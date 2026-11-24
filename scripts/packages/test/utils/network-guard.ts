import net from 'node:net';

// The network guard of the CLI's tests (OPERATIONS §11 rule 8, AC-PACKAGES-12): a test process
// cannot open a connection to anything but this machine, so no test can reach the real npm
// registry by mistake. Child processes (the real `npm`) are kept off it by being handed the fake
// registry's address only.
const LOOPBACK = new Set(['127.0.0.1', '::1', 'localhost']);

export const blockedAttempts: string[] = [];

export function installNetworkGuard(): void {
  // Called back with the socket as `this` below, so the unbound reference is intended.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const original = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function guarded(this: net.Socket, ...args: unknown[]) {
    const first = args[0];
    const host = (first as { host?: unknown } | null)?.host;
    if (typeof host === 'string' && !LOOPBACK.has(host)) {
      blockedAttempts.push(host);
      throw new Error(`Network guard: a test tried to connect to ${host}`);
    }
    return Reflect.apply(original, this, args) as net.Socket;
  };
}
