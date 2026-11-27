import { createFakeClock } from '@beautinique/shared-clock';
import { describe, expect, it } from 'vitest';

import { MAX_UPLOAD_BYTES, MediaError, type PresignPutRequest } from '../src/index.ts';
import { createFakeObjectStorage } from '../src/testing.ts';
import { bytesOf, sampleFile } from './utils/files.ts';

const START = new Date('2026-11-27T10:00:00.000Z');
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

function setup() {
  const clock = createFakeClock(START);
  const storage = createFakeObjectStorage({ clock, holdRetentionMs: 365 * DAY });
  const put = (change: Partial<PresignPutRequest> = {}): PresignPutRequest => ({
    bucket: 'private',
    key: 'kyc/a1b2c3d4e5f6.jpg',
    contentType: 'image/jpeg',
    bytes: 64,
    expiresInSeconds: 600,
    ...change,
  });
  return { clock, storage, put };
}

async function kindOf(work: Promise<unknown>): Promise<string> {
  const error: unknown = await work.then(
    () => null,
    (thrown: unknown) => thrown,
  );
  expect(error).toBeInstanceOf(MediaError);
  return (error as MediaError).kind;
}

describe('the fake object storage: a presigned PUT (SR-062)', () => {
  it('takes the file with the exact type and size it was signed for, and keeps its bytes', async () => {
    const { storage, put } = setup();
    const signed = await storage.presignPut(put());
    expect(signed.headers).toEqual({ 'content-type': 'image/jpeg', 'content-length': '64' });
    expect(signed.expiresAt).toEqual(new Date(START.getTime() + 10 * MINUTE));
    const file = sampleFile('jpeg', 64);
    await storage.put(signed.url, { headers: signed.headers, body: file });
    expect(await storage.head('private', 'kyc/a1b2c3d4e5f6.jpg')).toEqual({
      bucket: 'private',
      key: 'kyc/a1b2c3d4e5f6.jpg',
      bytes: 64,
      contentType: 'image/jpeg',
      createdAt: START,
      retainUntil: null,
    });
    expect(await storage.read('private', 'kyc/a1b2c3d4e5f6.jpg')).toEqual(file);
  });

  it('SR-062: another type, another size or a changed URL does not match the signature', async () => {
    const { storage, put } = setup();
    const signed = await storage.presignPut(put());
    const file = sampleFile('jpeg', 64);
    const pdf = { ...signed.headers, 'content-type': 'application/pdf' };
    expect(await kindOf(storage.put(signed.url, { headers: pdf, body: file }))).toBe(
      'bad_signature',
    );
    const bigger = sampleFile('jpeg', 65);
    const sized = { ...signed.headers, 'content-length': '65' };
    expect(await kindOf(storage.put(signed.url, { headers: sized, body: bigger }))).toBe(
      'bad_signature',
    );
    // The header says 64, the body is 65 bytes.
    expect(await kindOf(storage.put(signed.url, { headers: signed.headers, body: bigger }))).toBe(
      'bad_signature',
    );
    const elsewhere = signed.url.replace('/kyc/', '/claims/');
    expect(await kindOf(storage.put(elsewhere, { headers: signed.headers, body: file }))).toBe(
      'bad_signature',
    );
  });

  it('SR-062: the storage keeps the bytes as they came; the media service checks the type after', async () => {
    const { storage, put } = setup();
    const signed = await storage.presignPut(put());
    const html = new Uint8Array(64);
    html.set(bytesOf('<html>'));
    await storage.put(signed.url, { headers: signed.headers, body: html });
    expect(await storage.read('private', 'kyc/a1b2c3d4e5f6.jpg')).toEqual(html);
  });

  it('the presigned PUT stops at its time', async () => {
    const { clock, storage, put } = setup();
    const signed = await storage.presignPut(put({ expiresInSeconds: 60 }));
    clock.advance(MINUTE + 1);
    const body = sampleFile('jpeg', 64);
    expect(await kindOf(storage.put(signed.url, { headers: signed.headers, body }))).toBe(
      'expired',
    );
  });

  it('signs nothing outside the rules: bucket, key, type, size and time', async () => {
    const { storage, put } = setup();
    const refused = [
      put({ bucket: 'public' as 'private' }),
      put({ key: '../etc/passwd' }),
      put({ key: 'kyc//a.jpg' }),
      put({ key: '/kyc/a.jpg' }),
      put({ contentType: 'image/svg+xml' }),
      put({ contentType: 'text/html' }),
      put({ bytes: MAX_UPLOAD_BYTES.image + 1 }),
      put({ bytes: 0 }),
      put({ expiresInSeconds: 601 }),
      put({ expiresInSeconds: 0 }),
    ];
    for (const bad of refused) {
      await expect(storage.presignPut(bad)).rejects.toThrow(RangeError);
    }
    // Each family has its own limit: a 30 MB video and a 10 MB PDF are fine.
    await expect(
      storage.presignPut(put({ contentType: 'video/mp4', bytes: MAX_UPLOAD_BYTES.video })),
    ).resolves.toMatchObject({ headers: { 'content-type': 'video/mp4' } });
    await expect(
      storage.presignPut(put({ contentType: 'application/pdf', bytes: MAX_UPLOAD_BYTES.pdf + 1 })),
    ).rejects.toThrow(RangeError);
  });
});

describe('the fake object storage: a presigned GET (SR-062)', () => {
  it('SR-062: gives the file as an attachment, and refuses the URL after 5 minutes', async () => {
    const { clock, storage } = setup();
    await storage.write({
      bucket: 'private',
      key: 'invoices/inv-1.pdf',
      body: sampleFile('pdf'),
      contentType: 'application/pdf',
    });
    const url = await storage.presignGet({
      bucket: 'private',
      key: 'invoices/inv-1.pdf',
      expiresInSeconds: 300,
      disposition: 'attachment',
    });
    const fetched = await storage.get(url);
    expect(fetched.headers).toMatchObject({
      'content-type': 'application/pdf',
      'content-disposition': 'attachment',
    });
    expect(fetched.body).toEqual(sampleFile('pdf'));
    clock.advance(6 * MINUTE);
    expect(await kindOf(storage.get(url))).toBe('expired');
  });

  it('a URL longer than 5 minutes is not signed, and a changed disposition does not match', async () => {
    const { storage } = setup();
    const ask = { bucket: 'private', key: 'a.pdf', disposition: 'attachment' } as const;
    await expect(storage.presignGet({ ...ask, expiresInSeconds: 301 })).rejects.toThrow(RangeError);
    const url = await storage.presignGet({ ...ask, expiresInSeconds: 60 });
    const inline = url.replace(
      'response-content-disposition=attachment',
      'response-content-disposition=inline',
    );
    expect(await kindOf(storage.get(inline))).toBe('bad_signature');
    // Signed, but nothing is there.
    expect(await kindOf(storage.get(url))).toBe('not_found');
  });
});

describe('the fake object storage: the hold bucket (D-456)', () => {
  it('keeps a held file until its retention ends: no remove, no replace, then both work', async () => {
    const { clock, storage } = setup();
    const file = { bucket: 'hold', key: 'claims/c-1.jpg', contentType: 'image/jpeg' } as const;
    await storage.write({ ...file, body: sampleFile('jpeg') });
    expect(await storage.head('hold', 'claims/c-1.jpg')).toMatchObject({
      retainUntil: new Date(START.getTime() + 365 * DAY),
    });
    expect(await kindOf(storage.remove('hold', 'claims/c-1.jpg'))).toBe('retention');
    expect(await kindOf(storage.write({ ...file, body: sampleFile('jpeg', 99) }))).toBe(
      'retention',
    );
    clock.advance(365 * DAY + 1);
    await storage.write({ ...file, body: sampleFile('jpeg', 99) });
    expect(await storage.head('hold', 'claims/c-1.jpg')).toMatchObject({ bytes: 99 });
    clock.advance(365 * DAY + 1);
    await storage.remove('hold', 'claims/c-1.jpg');
    expect(await storage.head('hold', 'claims/c-1.jpg')).toBeNull();
  });

  it('the private bucket has no retention: replace and remove at once', async () => {
    const { storage } = setup();
    const file = { bucket: 'private', key: 'kyc/x.png', contentType: 'image/png' } as const;
    await storage.write({ ...file, body: sampleFile('png') });
    await storage.write({ ...file, body: sampleFile('png', 80) });
    await storage.remove('private', 'kyc/x.png');
    await expect(storage.remove('private', 'kyc/x.png')).resolves.toBeUndefined();
    expect(await kindOf(storage.read('private', 'kyc/x.png'))).toBe('not_found');
  });

  it('needs a retention of 1 ms or more', () => {
    const clock = createFakeClock(START);
    expect(() => createFakeObjectStorage({ clock, holdRetentionMs: 0 })).toThrow(RangeError);
  });
});

describe('the fake object storage: the list and a storage that is down', () => {
  it('lists the files of a bucket under a prefix in key order, a page at a time', async () => {
    const { storage } = setup();
    for (const key of ['kyc/c.jpg', 'kyc/a.jpg', 'claims/b.jpg', 'kyc/b.jpg']) {
      await storage.write({
        bucket: 'private',
        key,
        body: sampleFile('jpeg'),
        contentType: 'image/jpeg',
      });
    }
    await storage.write({
      bucket: 'hold',
      key: 'kyc/z.jpg',
      body: sampleFile('jpeg'),
      contentType: 'image/jpeg',
    });
    const first = await storage.list({ bucket: 'private', prefix: 'kyc/', limit: 2 });
    expect(first.items.map((object) => object.key)).toEqual(['kyc/a.jpg', 'kyc/b.jpg']);
    const second = await storage.list({ bucket: 'private', prefix: 'kyc/', cursor: first.next });
    expect(second).toMatchObject({ items: [{ key: 'kyc/c.jpg' }], next: null });
  });

  it('a write with a type outside the list is refused', async () => {
    const { storage } = setup();
    await expect(
      storage.write({
        bucket: 'private',
        key: 'a.svg',
        body: bytesOf('<svg/>'),
        contentType: 'image/svg+xml',
      }),
    ).rejects.toThrow(RangeError);
  });

  it('a call while the storage is down fails as "unavailable", and the next one works', async () => {
    const { storage, put } = setup();
    const signed = await storage.presignPut(put());
    const calls = [
      () => storage.head('private', 'a.jpg'),
      () => storage.read('private', 'a.jpg'),
      () => storage.remove('private', 'a.jpg'),
      () => storage.list({ bucket: 'private', prefix: '' }),
      () =>
        storage.write({
          bucket: 'private',
          key: 'a.jpg',
          body: sampleFile('jpeg'),
          contentType: 'image/jpeg',
        }),
      () => storage.put(signed.url, { headers: signed.headers, body: sampleFile('jpeg', 64) }),
      () => storage.get(signed.url),
    ];
    for (const call of calls) {
      storage.failNext();
      expect(await kindOf(call())).toBe('unavailable');
    }
    expect(await storage.head('private', 'a.jpg')).toBeNull();
  });
});
