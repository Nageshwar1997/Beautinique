interface RandomSource {
  getRandomValues<T extends Uint8Array>(array: T): T;
}

function random(bytes: Uint8Array): Uint8Array {
  const { crypto } = globalThis as unknown as { crypto?: RandomSource };
  if (!crypto) {
    throw new Error('crypto.getRandomValues is not available');
  }
  return crypto.getRandomValues(bytes);
}

let lastMs = -1;
let counter = 0;

/**
 * A UUIDv7 (RFC 9562): 48-bit Unix time in ms, then a 12-bit counter and random bits. Ids from one
 * process sort in creation order, even within the same millisecond or if the clock steps back.
 * Used for event ids and the Delivery app's offline actions. `now` is for tests.
 */
export function uuidv7(now: number = Date.now()): string {
  const bytes = random(new Uint8Array(16));
  let ms = Math.max(0, Math.floor(now));
  if (ms <= lastMs) {
    ms = lastMs;
    counter += 1;
    if (counter > 0xfff) {
      ms += 1;
      counter = 0;
    }
  } else {
    // a random start below the middle leaves room to count up within the millisecond
    counter = (((bytes[6] ?? 0) << 8) | (bytes[7] ?? 0)) & 0x7ff;
  }
  lastMs = ms;

  let time = ms;
  for (let i = 5; i >= 0; i -= 1) {
    bytes[i] = time % 256;
    time = Math.floor(time / 256);
  }
  bytes[6] = 0x70 | (counter >> 8);
  bytes[7] = counter & 0xff;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** The creation time (ms since 1970) inside a UUIDv7. */
export function uuidv7Time(id: string): number {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new RangeError(`Not a UUIDv7: ${id}`);
  }
  return Number.parseInt(id.replace(/-/g, '').slice(0, 12), 16);
}
