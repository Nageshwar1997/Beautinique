import { randomBytes } from 'node:crypto';

import type { Clock } from '@beautinique/shared-clock';

import { MediaError } from '../errors.ts';
import { FILE_TYPES } from '../file-type.ts';
import { MAX_UPLOAD_BYTES, PRIVATE_URL_TTL_SECONDS, UPLOAD_URL_TTL_SECONDS } from '../limits.ts';
import type { Bucket, ObjectStorage, StoredObject } from '../ports.ts';
import { later } from '../utils/later.ts';
import { pageOf } from '../utils/page.ts';
import { sameSignature, sign } from '../utils/signing.ts';

export interface FakeObjectStorageOptions {
  clock: Clock;
  /** The `hold` bucket's default retention (its Object Lock), in milliseconds. */
  holdRetentionMs: number;
}

/** What a presigned GET gives the browser. */
export interface FetchedObject {
  body: Uint8Array;
  headers: Readonly<Record<string, string>>;
}

/** The fake object storage, with the steps a test plays for the browser. */
export interface FakeObjectStorage extends ObjectStorage {
  /** The client's step: sends a file to a presigned PUT URL with these headers, as a browser. */
  put(
    url: string,
    upload: { headers: Readonly<Record<string, string>>; body: Uint8Array },
  ): Promise<void>;
  /** The browser's step: opens a presigned GET URL. */
  get(url: string): Promise<FetchedObject>;
  /** The next call that reaches the storage fails, as when it is down. */
  failNext(): void;
}

const BASE_URL = 'https://storage.example.test';
const BUCKETS: ReadonlySet<string> = new Set<Bucket>(['private', 'hold']);
const KEY = /^[A-Za-z0-9][A-Za-z0-9/_.-]{0,511}$/;
const FAMILY_BY_CONTENT_TYPE = new Map(
  Object.values(FILE_TYPES).map(({ contentType, family }) => [contentType, family]),
);

interface Kept extends StoredObject {
  body: Uint8Array;
}

function checkPlace(bucket: string, key: string): void {
  if (!BUCKETS.has(bucket)) throw new RangeError('bucket must be "private" or "hold".');
  if (
    !KEY.test(key) ||
    key.split('/').some((part) => part === '' || part === '..' || part === '.')
  ) {
    throw new RangeError(
      'key must be letters, digits, "/", "_", "." or "-", without empty or dot parts.',
    );
  }
}

function checkSeconds(seconds: number, most: number): void {
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > most) {
    throw new RangeError(`expiresInSeconds must be a whole number from 1 to ${String(most)}.`);
  }
}

function familyOf(contentType: string): 'image' | 'pdf' | 'video' {
  const family = FAMILY_BY_CONTENT_TYPE.get(contentType);
  if (family === undefined) {
    throw new RangeError(
      `contentType must be one of ${[...FAMILY_BY_CONTENT_TYPE.keys()].join(', ')}.`,
    );
  }
  return family;
}

/**
 * An S3 like object storage in memory that behaves as its docs say (docs/RULES.md RT-14; the
 * package README lists each behaviour and its source): a presigned PUT signs the exact
 * `Content-Type` and size, a presigned URL stops at its time, the storage keeps the bytes as they
 * came (it never checks their type: the media service does, SR-062), and the `hold` bucket's
 * Object Lock refuses to remove or replace a file before its retention ends.
 */
export function createFakeObjectStorage({
  clock,
  holdRetentionMs,
}: FakeObjectStorageOptions): FakeObjectStorage {
  if (!Number.isInteger(holdRetentionMs) || holdRetentionMs < 1) {
    throw new RangeError('holdRetentionMs must be a whole number of milliseconds, 1 or more.');
  }
  const secret = randomBytes(32);
  const objects = new Map<string, Kept>();
  let failing = false;

  const reach = <T>(work: () => T): Promise<T> =>
    later(() => {
      if (failing) {
        failing = false;
        throw new MediaError('unavailable', 'The object storage did not answer.');
      }
      return work();
    });

  const placeOf = (bucket: Bucket, key: string) => `${bucket}/${key}`;
  const now = () => clock.now();

  const refuseIfHeld = (kept: Kept | undefined, action: string): void => {
    const until = kept?.retainUntil ?? null;
    if (until !== null && until.getTime() > now().getTime()) {
      throw new MediaError(
        'retention',
        `The held file cannot be ${action} before its retention ends.`,
      );
    }
  };

  const store = (bucket: Bucket, key: string, body: Uint8Array, contentType: string): void => {
    const place = placeOf(bucket, key);
    if (bucket === 'hold') refuseIfHeld(objects.get(place), 'replaced');
    const createdAt = now();
    objects.set(place, {
      bucket,
      key,
      bytes: body.length,
      contentType,
      createdAt,
      retainUntil: bucket === 'hold' ? new Date(createdAt.getTime() + holdRetentionMs) : null,
      body: body.slice(),
    });
  };

  const view = (kept: Kept): StoredObject => ({
    bucket: kept.bucket,
    key: kept.key,
    bytes: kept.bytes,
    contentType: kept.contentType,
    createdAt: kept.createdAt,
    retainUntil: kept.retainUntil,
  });

  // A presigned URL: the place, what the signature covers, its end and the signature.
  const signedUrl = (
    method: string,
    bucket: Bucket,
    key: string,
    covers: string[],
    expires: number,
  ) => {
    const url = new URL(`${BASE_URL}/${bucket}/${key}`);
    url.searchParams.set('X-Expires', String(expires));
    const signature = sign(secret, [method, bucket, key, ...covers, String(expires)].join('\n'));
    url.searchParams.set('X-Signature', signature);
    return url;
  };

  const openUrl = (method: string, url: string, covers: (u: URL) => string[]) => {
    const parsed = new URL(url);
    const [, bucket = '', ...rest] = parsed.pathname.split('/');
    const key = rest.join('/');
    const expires = parsed.searchParams.get('X-Expires') ?? '';
    const expected = sign(secret, [method, bucket, key, ...covers(parsed), expires].join('\n'));
    if (!sameSignature(parsed.searchParams.get('X-Signature') ?? '', expected)) {
      throw new MediaError('bad_signature', 'The request does not match its signature.');
    }
    if (now().getTime() > Number(expires)) {
      throw new MediaError('expired', 'The presigned URL is past its time.');
    }
    return { bucket: bucket as Bucket, key, parsed };
  };

  return {
    presignPut: ({ bucket, key, contentType, bytes, expiresInSeconds }) =>
      later(() => {
        checkPlace(bucket, key);
        const family = familyOf(contentType);
        if (!Number.isInteger(bytes) || bytes < 1 || bytes > MAX_UPLOAD_BYTES[family]) {
          throw new RangeError(`bytes must be from 1 to ${String(MAX_UPLOAD_BYTES[family])}.`);
        }
        checkSeconds(expiresInSeconds, UPLOAD_URL_TTL_SECONDS);
        const expiresAt = new Date(now().getTime() + expiresInSeconds * 1000);
        const covers = [contentType, String(bytes)];
        const url = signedUrl('PUT', bucket, key, covers, expiresAt.getTime());
        const headers = Object.freeze({
          'content-type': contentType,
          'content-length': String(bytes),
        });
        return { url: url.toString(), headers, expiresAt };
      }),

    put: (url, { headers, body }) =>
      reach(() => {
        // The signed headers and the real size, as S3 checks them.
        if (headers['content-length'] !== String(body.length)) {
          throw new MediaError('bad_signature', 'The request does not match its signature.');
        }
        const contentType = headers['content-type'] ?? '';
        const { bucket, key } = openUrl('PUT', url, () => [contentType, String(body.length)]);
        store(bucket, key, body, contentType);
      }),

    presignGet: ({ bucket, key, expiresInSeconds, disposition }) =>
      later(() => {
        checkPlace(bucket, key);
        checkSeconds(expiresInSeconds, PRIVATE_URL_TTL_SECONDS);
        const expires = now().getTime() + expiresInSeconds * 1000;
        const url = signedUrl('GET', bucket, key, [disposition], expires);
        url.searchParams.set('response-content-disposition', disposition);
        return url.toString();
      }),

    get: (url) =>
      reach(() => {
        const { bucket, key, parsed } = openUrl('GET', url, (u) => [
          u.searchParams.get('response-content-disposition') ?? '',
        ]);
        const kept = objects.get(placeOf(bucket, key));
        if (kept === undefined) throw new MediaError('not_found', 'No such file.');
        return {
          body: kept.body.slice(),
          headers: Object.freeze({
            'content-type': kept.contentType,
            'content-length': String(kept.bytes),
            'content-disposition': parsed.searchParams.get('response-content-disposition') ?? '',
          }),
        };
      }),

    head: (bucket, key) =>
      reach(() => {
        checkPlace(bucket, key);
        const kept = objects.get(placeOf(bucket, key));
        return kept === undefined ? null : view(kept);
      }),

    read: (bucket, key) =>
      reach(() => {
        checkPlace(bucket, key);
        const kept = objects.get(placeOf(bucket, key));
        if (kept === undefined) throw new MediaError('not_found', 'No such file.');
        return kept.body.slice();
      }),

    write: ({ bucket, key, body, contentType }) =>
      reach(() => {
        checkPlace(bucket, key);
        familyOf(contentType);
        store(bucket, key, body, contentType);
      }),

    remove: (bucket, key) =>
      reach(() => {
        checkPlace(bucket, key);
        const place = placeOf(bucket, key);
        refuseIfHeld(objects.get(place), 'removed');
        objects.delete(place);
      }),

    list: ({ bucket, prefix, ...page }) =>
      reach(() => {
        const under = [...objects.values()].filter(
          (object) => object.bucket === bucket && object.key.startsWith(prefix),
        );
        const result = pageOf(under, (object) => object.key, page);
        return { items: result.items.map(view), next: result.next };
      }),

    failNext() {
      failing = true;
    },
  };
}
