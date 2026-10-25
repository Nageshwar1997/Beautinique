import { uuidv7 } from '@beautinique/shared-utils';
import { describe, expect, it } from 'vitest';

import { assetKey, createMemoryStorage, StorageError } from '../src/index';
import { TINY_PNG } from '../src/testing';

const start = new Date('2026-10-22T10:00:00.000Z');

/** A memory storage with a clock the test moves. */
function setup() {
  const clock = { at: start.getTime() };
  const storage = createMemoryStorage({
    now: () => new Date(clock.at),
    secret: 'test-secret',
    baseUrl: 'https://cdn.beautinique.example/',
  });
  return { storage, clock };
}

const request = (extra: object = {}) => ({
  assetId: uuidv7(),
  purpose: 'product.image',
  visibility: 'public' as const,
  contentType: 'image/png',
  maxBytes: 1000,
  ...extra,
});

describe('upload tickets', () => {
  it('say which call and which field was wrong', async () => {
    const { storage } = setup();
    await expect(storage.createUpload(request({ maxBytes: 0 }))).rejects.toThrow(
      /^createUpload: maxBytes: /,
    );
    await expect(storage.stat('nope')).rejects.toThrow(/^stat: Key looks like/);
  });

  it('last 15 minutes by default and the time asked otherwise', async () => {
    const { storage } = setup();
    const normal = await storage.createUpload(request());
    expect(normal.expiresAt).toBe('2026-10-22T10:15:00.000Z');
    const short = await storage.createUpload(request({ expiresInSeconds: 60 }));
    expect(short.expiresAt).toBe('2026-10-22T10:01:00.000Z');
  });

  it('carry the rules of the upload: type, size, key and an end time, signed', async () => {
    const { storage } = setup();
    const ticket = await storage.createUpload(request());
    expect(ticket).toMatchObject({
      provider: 'memory',
      method: 'POST',
      url: 'https://cdn.beautinique.example/upload',
      headers: {},
    });
    expect(ticket.fields).toMatchObject({
      key: ticket.key,
      contentType: 'image/png',
      maxBytes: '1000',
      expiresAt: ticket.expiresAt,
    });
    expect(ticket.fields.signature).toMatch(/^[0-9a-f]{64}$/);
  });

  it('stop working when they expire, and a file that is too late is not kept', async () => {
    const { storage, clock } = setup();
    const ticket = await storage.createUpload(request({ expiresInSeconds: 60 }));
    clock.at += 59_999;
    await storage.upload(ticket, TINY_PNG, 'image/png');
    expect(await storage.stat(ticket.key)).toBeDefined();
    await storage.delete(ticket.key);

    clock.at += 1;
    await expect(storage.upload(ticket, TINY_PNG, 'image/png')).rejects.toThrow(
      new StorageError('UPLOAD_REFUSED', 'The upload ticket has expired'),
    );
    expect(await storage.stat(ticket.key)).toBeUndefined();
  });

  it('are refused when changed: another size, type, key or end time, or no signature', async () => {
    const { storage } = setup();
    const ticket = await storage.createUpload(request({ maxBytes: 10 }));
    const other = await storage.createUpload(request());
    const forged = [
      { ...ticket.fields, maxBytes: '100000' },
      { ...ticket.fields, contentType: 'image/jpeg' },
      { ...ticket.fields, key: other.key },
      { ...ticket.fields, expiresAt: '2030-01-01T00:00:00.000Z' },
      { ...ticket.fields, signature: 'a'.repeat(64) },
      { ...ticket.fields, signature: 'short' },
    ];
    for (const fields of forged) {
      await expect(storage.upload({ ...ticket, fields }, TINY_PNG, 'image/png')).rejects.toThrow(
        new StorageError('UPLOAD_REFUSED', 'The upload ticket is not valid'),
      );
    }
    await expect(storage.upload(ticket, TINY_PNG, 'image/png')).rejects.toThrow(
      'The file is over 10 bytes',
    );
    await expect(storage.upload(ticket, TINY_PNG.slice(0, 8), 'image/jpeg')).rejects.toThrow(
      'Only image/png may be uploaded',
    );
    for (const name of ['key', 'contentType', 'maxBytes', 'expiresAt', 'signature']) {
      const { [name]: _gone, ...fields } = ticket.fields;
      await expect(storage.upload({ ...ticket, fields }, TINY_PNG, 'image/png')).rejects.toThrow(
        new StorageError('UPLOAD_REFUSED', 'The upload ticket is incomplete'),
      );
    }
  });

  it('accept a file of exactly the size limit', async () => {
    const { storage } = setup();
    const ticket = await storage.createUpload(request({ maxBytes: TINY_PNG.byteLength }));
    await storage.upload(ticket, TINY_PNG, 'image/png');
    expect(await storage.stat(ticket.key)).toMatchObject({ size: TINY_PNG.byteLength });
  });
});

describe('URLs', () => {
  const publicKey = assetKey(uuidv7(), 'product.image', 'public');
  const privateKey = assetKey(uuidv7(), 'seller.kyc_document', 'private');

  it('are base URL + key for public files, with the width when asked', () => {
    const { storage } = setup();
    expect(storage.getUrl({ key: publicKey })).toBe(`https://cdn.beautinique.example/${publicKey}`);
    expect(storage.getUrl({ key: publicKey, width: 320 })).toBe(
      `https://cdn.beautinique.example/${publicKey}?w=320`,
    );
    expect(storage.getUrl({ key: publicKey, expiresInSeconds: 5 })).not.toContain('expires');
  });

  it('are signed for private files, for 5 minutes by default', () => {
    const { storage, clock } = setup();
    const url = new URL(storage.getUrl({ key: privateKey }));
    expect(url.pathname).toBe(`/${privateKey}`);
    expect(url.searchParams.get('expires')).toBe(String(start.getTime() / 1000 + 300));
    expect(url.searchParams.get('sig')).toMatch(/^[0-9a-f]{64}$/);
    expect(url.searchParams.has('w')).toBe(false);
    // the clock's milliseconds are dropped, never rounded up
    clock.at += 999;
    expect(new URL(storage.getUrl({ key: privateKey })).searchParams.get('expires')).toBe(
      String(start.getTime() / 1000 + 300),
    );
    clock.at = start.getTime();
    const wide = new URL(storage.getUrl({ key: privateKey, width: 100, expiresInSeconds: 60 }));
    expect(wide.searchParams.get('w')).toBe('100');
    expect(wide.searchParams.get('expires')).toBe(String(start.getTime() / 1000 + 60));
  });

  it('a private URL works until it expires, and not when changed', () => {
    const { storage, clock } = setup();
    const url = storage.getUrl({ key: privateKey, width: 100, expiresInSeconds: 60 });
    expect(storage.isUrlValid(url)).toBe(true);
    clock.at += 59_000;
    expect(storage.isUrlValid(url)).toBe(true);
    clock.at += 1_000;
    expect(storage.isUrlValid(url)).toBe(false);

    clock.at = start.getTime();
    const changed = [
      url.replace('w=100', 'w=200'),
      url.replace(privateKey, assetKey(uuidv7(), 'seller.kyc_document', 'private')),
      url.replace(/expires=\d+/, 'expires=9999999999'),
      url.replace(/sig=[0-9a-f]+/, 'sig=00'),
      url.replace(/&sig=[0-9a-f]+/, ''),
      url.replace(/expires=\d+&/, ''),
      url.replace(/expires=\d+/, 'expires=soon'),
    ];
    for (const bad of changed) expect(storage.isUrlValid(bad), bad).toBe(false);
  });

  it('a public URL is valid, anything that is not a key is not', () => {
    const { storage } = setup();
    expect(storage.isUrlValid(storage.getUrl({ key: publicKey }))).toBe(true);
    expect(storage.isUrlValid('https://cdn.beautinique.example/other/file.png')).toBe(false);
  });

  it('differ between storages with another secret', () => {
    const { storage } = setup();
    const other = createMemoryStorage({
      now: () => start,
      secret: 'another',
      baseUrl: 'https://cdn.beautinique.example/',
    });
    expect(other.isUrlValid(storage.getUrl({ key: privateKey }))).toBe(false);
  });
});

describe('listing', () => {
  it('has a full page without a cursor when nothing is left, and 100 per page by default', async () => {
    const { storage } = setup();
    for (let i = 0; i < 3; i += 1) {
      const ticket = await storage.createUpload(request());
      await storage.upload(ticket, TINY_PNG, 'image/png');
    }
    const exact = await storage.list({ limit: 3 });
    expect(exact.files).toHaveLength(3);
    expect(exact.nextCursor).toBeUndefined();
    const part = await storage.list({ limit: 2 });
    expect(part.nextCursor).toBe(part.files[1]?.key);
    expect(await storage.list()).toHaveProperty('files.length', 3);
    expect(await storage.list({ cursor: exact.files[2]?.key })).toEqual({ files: [] });
  });

  it('shows the upload time from the clock', async () => {
    const { storage, clock } = setup();
    const ticket = await storage.createUpload(request());
    clock.at += 5_000;
    await storage.upload(ticket, TINY_PNG, 'image/png');
    const [file] = (await storage.list()).files;
    expect(file?.uploadedAt).toBe('2026-10-22T10:00:05.000Z');
    clock.at += 5_000;
    const copy = await storage.copy({
      from: ticket.key,
      assetId: uuidv7(),
      purpose: 'product.image',
      visibility: 'public',
    });
    expect(copy.uploadedAt).toBe('2026-10-22T10:00:10.000Z');
  });
});

describe('listing order and size', () => {
  it('goes by key, whatever order the files came in, and only under the prefix', async () => {
    const { storage } = setup();
    const early = uuidv7(1_700_000_000_000);
    const late = uuidv7(1_800_000_000_000);
    for (const [assetId, visibility] of [
      [late, 'public'],
      [early, 'public'],
      [uuidv7(), 'private'],
    ] as const) {
      const ticket = await storage.createUpload(request({ assetId, visibility }));
      await storage.upload(ticket, TINY_PNG, 'image/png');
    }
    const keys = (await storage.list({ prefix: 'public/' })).files.map((file) => file.key);
    expect(keys).toEqual([
      assetKey(early, 'product.image', 'public'),
      assetKey(late, 'product.image', 'public'),
    ]);
    expect(await storage.list({ prefix: 'private/seller.' })).toEqual({ files: [] });
  });

  it('gives 100 files per page unless asked for fewer', async () => {
    const { storage } = setup();
    for (let i = 0; i < 101; i += 1) {
      const ticket = await storage.createUpload(request());
      await storage.upload(ticket, TINY_PNG, 'image/png');
    }
    const first = await storage.list();
    expect(first.files).toHaveLength(100);
    expect(first.nextCursor).toBe(first.files[99]?.key);
    expect(await storage.list({ cursor: first.nextCursor })).toHaveProperty('files.length', 1);
  });
});
