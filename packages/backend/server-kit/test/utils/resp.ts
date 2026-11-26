import { connect, type Socket } from 'node:net';

// A small client of the Redis protocol (RESP2), for the tests that need the real Valkey: it speaks
// to the container with `EVAL` and a few commands, with no package for it. It gives `eval` in the
// shape of `ioredis` (`eval(script, numberOfKeys, ...args)`), which is what the counter of the kit
// needs of a client.

type Reply = number | string | null | Reply[];

// One reply from the start of the buffer, and where it ends; `undefined` while it is not all here.
function parse(buffer: Buffer, from: number): { reply: Reply; end: number } | undefined {
  const lineEnd = buffer.indexOf('\r\n', from);
  if (lineEnd === -1) return undefined;
  const kind = String.fromCharCode(buffer[from] as number);
  const line = buffer.toString('utf8', from + 1, lineEnd);
  const next = lineEnd + 2;

  if (kind === '+') return { reply: line, end: next };
  if (kind === '-') throw new Error(`Valkey: ${line}`);
  if (kind === ':') return { reply: Number(line), end: next };
  if (kind === '$') {
    const length = Number(line);
    if (length === -1) return { reply: null, end: next };
    if (buffer.length < next + length + 2) return undefined;
    return { reply: buffer.toString('utf8', next, next + length), end: next + length + 2 };
  }
  if (kind === '*') {
    const count = Number(line);
    const items: Reply[] = [];
    let at = next;
    for (let index = 0; index < count; index += 1) {
      const item = parse(buffer, at);
      if (item === undefined) return undefined;
      items.push(item.reply);
      at = item.end;
    }
    return { reply: items, end: at };
  }
  throw new Error(`Valkey: a reply of kind ${kind} is not known`);
}

export interface RespClient {
  eval(script: string, numberOfKeys: number, ...args: (string | number)[]): Promise<unknown>;
  command(...args: (string | number)[]): Promise<unknown>;
  close(): void;
}

/** Whether something answers on the port. */
export function reachable(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect(port, host);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      resolve(false);
    });
  });
}

export function connectResp(port: number, host = '127.0.0.1'): Promise<RespClient> {
  return new Promise((resolve, reject) => {
    const socket: Socket = connect(port, host);
    let buffer: Buffer = Buffer.alloc(0);
    let waiting: { resolve(reply: unknown): void; reject(error: Error): void } | undefined;
    let closed: Error | undefined;

    const settle = () => {
      const done = waiting;
      if (done === undefined) return;
      try {
        const parsed = parse(buffer, 0);
        if (parsed === undefined) return;
        buffer = buffer.subarray(parsed.end);
        waiting = undefined;
        done.resolve(parsed.reply);
      } catch (error) {
        waiting = undefined;
        buffer = Buffer.alloc(0);
        done.reject(error as Error);
      }
    };
    socket.on('data', (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);
      settle();
    });
    const fail = (error?: Error) => {
      closed = error ?? new Error('The connection to Valkey is closed.');
      waiting?.reject(closed);
      waiting = undefined;
    };
    socket.on('error', fail);
    socket.on('close', () => {
      fail();
    });
    socket.once('error', reject);

    const command = (...args: (string | number)[]): Promise<unknown> => {
      if (closed !== undefined) return Promise.reject(closed);
      const parts = args.map((arg) => Buffer.from(String(arg)));
      const request = Buffer.concat([
        Buffer.from(`*${String(parts.length)}\r\n`),
        ...parts.flatMap((part) => [
          Buffer.from(`$${String(part.length)}\r\n`),
          part,
          Buffer.from('\r\n'),
        ]),
      ]);
      return new Promise((done, failed) => {
        waiting = { resolve: done, reject: failed };
        socket.write(request);
      });
    };

    socket.once('connect', () => {
      resolve({
        command,
        eval: (script, numberOfKeys, ...args) => command('EVAL', script, numberOfKeys, ...args),
        close: () => {
          socket.destroy();
        },
      });
    });
  });
}
