import { randomBytes } from 'node:crypto';

import { uuidv7 } from '@beautinique/shared-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { StorageError } from './errors';
import { MAX_EXPIRY_SECONDS, MAX_LIST_LIMIT, MAX_UPLOAD_BYTES } from './inputs';
import { assetKey, type Visibility } from './keys';
import type { StoragePort, UploadTicket } from './types';

/** A real 1x1 PNG: providers that look inside what they store (Cloudinary does) accept it. */
export const TINY_PNG = new Uint8Array(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  ),
);

/** An adapter, plus the browser's side of its upload (an HTTP request to a real provider). */
export interface StorageHarness {
  storage: StoragePort;
  /** Sends `body` with the ticket the way a browser would; a refusal is a `StorageError` `UPLOAD_REFUSED`. */
  upload(ticket: UploadTicket, body: Uint8Array, contentType: string): Promise<void>;
}

const codeOfError = (error: unknown): string =>
  error instanceof StorageError ? error.code : `not a StorageError: ${String(error)}`;

/** The error code of a call. A promise-returning method must reject, never throw at the call. */
async function codeOf(run: () => unknown, sync = false): Promise<string | undefined> {
  let pending: unknown;
  try {
    pending = run();
  } catch (error) {
    return sync ? codeOfError(error) : `threw instead of rejecting: ${codeOfError(error)}`;
  }
  try {
    await pending;
  } catch (error) {
    return codeOfError(error);
  }
  return undefined;
}

/**
 * The tests every `StoragePort` adapter must pass: the in-memory one runs them in this package, and
 * the Cloudinary (or S3) adapter runs the same ones against its provider. Each test uses its own
 * purpose, so a shared bucket is fine, and removes the files it made.
 *
 *   storageContract('cloudinary', () => ({ storage, upload }));
 */
export function storageContract(
  name: string,
  create: () => StorageHarness | Promise<StorageHarness>,
): void {
  describe(`${name}: StoragePort contract`, () => {
    let harness: StorageHarness;
    let purpose: string;
    let made: string[];

    beforeEach(async () => {
      harness = await create();
      purpose = `contract_${randomBytes(4).toString('hex')}`;
      made = [];
    });

    afterEach(async () => {
      await Promise.all(made.map((key) => harness.storage.delete(key)));
    });

    const ticketFor = async (
      options: { visibility?: Visibility; maxBytes?: number; purpose?: string } = {},
    ): Promise<UploadTicket> => {
      const ticket = await harness.storage.createUpload({
        assetId: uuidv7(),
        purpose: options.purpose ?? purpose,
        visibility: options.visibility ?? 'public',
        contentType: 'image/png',
        maxBytes: options.maxBytes ?? 100_000,
      });
      made.push(ticket.key);
      return ticket;
    };

    const put = async (options: { visibility?: Visibility; purpose?: string } = {}) => {
      const ticket = await ticketFor(options);
      await harness.upload(ticket, TINY_PNG, 'image/png');
      return ticket;
    };

    it('issues a signed ticket for the asset, valid for the time asked', async () => {
      const assetId = uuidv7();
      const ticket = await harness.storage.createUpload({
        assetId,
        purpose,
        visibility: 'private',
        contentType: 'image/png',
        maxBytes: 5000,
        expiresInSeconds: 60,
      });
      expect(ticket.provider).toBe(harness.storage.provider);
      expect(ticket.assetId).toBe(assetId);
      expect(ticket.key).toBe(assetKey(assetId, purpose, 'private'));
      expect(['POST', 'PUT']).toContain(ticket.method);
      expect(() => new URL(ticket.url)).not.toThrow();
      const expiresAt = Date.parse(ticket.expiresAt);
      expect(expiresAt).toBeGreaterThan(Date.now());
      expect(expiresAt).toBeLessThanOrEqual(Date.now() + 65_000);
    });

    it('gives the same key for the same asset, and another for public and private', async () => {
      const input = {
        assetId: uuidv7(),
        purpose,
        visibility: 'public',
        contentType: 'image/png',
        maxBytes: 5000,
      } as const;
      const first = await harness.storage.createUpload(input);
      const again = await harness.storage.createUpload(input);
      const hidden = await harness.storage.createUpload({ ...input, visibility: 'private' });
      expect(again.key).toBe(first.key);
      expect(hidden.key).not.toBe(first.key);
    });

    it('has no file until it is uploaded, then reports its size and type', async () => {
      const ticket = await ticketFor();
      expect(await harness.storage.stat(ticket.key)).toBeUndefined();
      await harness.upload(ticket, TINY_PNG, 'image/png');
      const file = await harness.storage.stat(ticket.key);
      expect(file).toMatchObject({
        key: ticket.key,
        size: TINY_PNG.byteLength,
        contentType: 'image/png',
      });
      expect(Math.abs(Date.parse(file?.uploadedAt ?? '') - Date.now())).toBeLessThan(5 * 60_000);
    });

    it('refuses a file over the size limit or of another type, and keeps nothing', async () => {
      const small = await ticketFor({ maxBytes: TINY_PNG.byteLength - 1 });
      expect(await codeOf(() => harness.upload(small, TINY_PNG, 'image/png'))).toBe(
        'UPLOAD_REFUSED',
      );
      expect(await harness.storage.stat(small.key)).toBeUndefined();

      const png = await ticketFor();
      expect(await codeOf(() => harness.upload(png, TINY_PNG, 'image/jpeg'))).toBe(
        'UPLOAD_REFUSED',
      );
      expect(await harness.storage.stat(png.key)).toBeUndefined();
    });

    it('gives a stable public URL, and another for each size', () => {
      const key = assetKey(uuidv7(), purpose, 'public');
      const { storage } = harness;
      const url = storage.getUrl({ key });
      expect(() => new URL(url)).not.toThrow();
      expect(storage.getUrl({ key })).toBe(url);
      expect(storage.getUrl({ key, width: 200 })).not.toBe(url);
      expect(storage.getUrl({ key, width: 200 })).not.toBe(storage.getUrl({ key, width: 400 }));
    });

    it('signs private URLs for a limited time', () => {
      const key = assetKey(uuidv7(), purpose, 'private');
      const { storage } = harness;
      expect(storage.getUrl({ key, expiresInSeconds: 60 })).not.toBe(
        storage.getUrl({ key, expiresInSeconds: 3600 }),
      );
    });

    it('removes a file; removing it again, or one that never was, is fine', async () => {
      const { storage } = harness;
      const ticket = await put();
      await storage.delete(ticket.key);
      expect(await storage.stat(ticket.key)).toBeUndefined();
      await expect(storage.delete(ticket.key)).resolves.toBeUndefined();
      await expect(storage.delete(assetKey(uuidv7(), purpose, 'public'))).resolves.toBeUndefined();
    });

    it('copies a file to another asset, and each file lives on without the other', async () => {
      const { storage } = harness;
      const source = await put({ visibility: 'private' });
      const assetId = uuidv7();
      const copy = await storage.copy({
        from: source.key,
        assetId,
        purpose,
        visibility: 'private',
      });
      made.push(copy.key);
      expect(copy.key).toBe(assetKey(assetId, purpose, 'private'));
      expect(copy.key).not.toBe(source.key);
      expect(copy).toMatchObject({ size: TINY_PNG.byteLength, contentType: 'image/png' });
      expect(await storage.stat(copy.key)).toMatchObject({ key: copy.key, size: copy.size });

      await storage.delete(source.key);
      expect(await storage.stat(source.key)).toBeUndefined();
      expect(await storage.stat(copy.key)).toBeDefined();

      const again = await storage.copy({
        from: copy.key,
        assetId: uuidv7(),
        purpose,
        visibility: 'private',
      });
      made.push(again.key);
      await storage.delete(copy.key);
      expect(await storage.stat(again.key)).toBeDefined();
    });

    it('can give the copy another purpose and visibility', async () => {
      const { storage } = harness;
      const source = await put({ visibility: 'private' });
      const assetId = uuidv7();
      const copy = await storage.copy({
        from: source.key,
        assetId,
        purpose: `${purpose}_banner`,
        visibility: 'public',
      });
      made.push(copy.key);
      expect(copy.key).toBe(assetKey(assetId, `${purpose}_banner`, 'public'));
      expect(await storage.stat(source.key)).toBeDefined();
    });

    it('refuses to copy a file that is not there', async () => {
      const missing = assetKey(uuidv7(), purpose, 'public');
      expect(
        await codeOf(() =>
          harness.storage.copy({ from: missing, assetId: uuidv7(), purpose, visibility: 'public' }),
        ),
      ).toBe('NOT_FOUND');
    });

    it('never overwrites an asset that already has a file', async () => {
      const { storage } = harness;
      const source = await put();
      const other = await put();
      const parsed = other.key.split('/');
      expect(
        await codeOf(() =>
          storage.copy({
            from: source.key,
            assetId: parsed[2] ?? '',
            purpose,
            visibility: 'public',
          }),
        ),
      ).toBe('ALREADY_EXISTS');
      expect(await storage.stat(other.key)).toBeDefined();
    });

    it('lists files under a prefix in key order, with their details', async () => {
      const { storage } = harness;
      const tickets = [await put(), await put(), await put()];
      await put({ visibility: 'private' });
      const page = await storage.list({ prefix: `public/${purpose}/` });
      expect(page.files.map((file) => file.key)).toEqual(tickets.map((t) => t.key).toSorted());
      expect(page.files[0]).toMatchObject({ size: TINY_PNG.byteLength, contentType: 'image/png' });
      expect(page.nextCursor).toBeUndefined();
    });

    it('pages through everything exactly once', async () => {
      const { storage } = harness;
      const tickets = [await put(), await put(), await put(), await put(), await put()];
      const seen: string[] = [];
      const sizes: number[] = [];
      let cursor: string | undefined;
      do {
        const page = await storage.list({
          prefix: `public/${purpose}/`,
          limit: 2,
          ...(cursor === undefined ? {} : { cursor }),
        });
        sizes.push(page.files.length);
        seen.push(...page.files.map((file) => file.key));
        cursor = page.nextCursor;
      } while (cursor !== undefined);
      expect(sizes).toEqual([2, 2, 1]);
      expect(seen).toEqual(tickets.map((t) => t.key).toSorted());
    });

    it('lists nothing for a prefix without files', async () => {
      expect(await harness.storage.list({ prefix: `public/${purpose}/` })).toEqual({ files: [] });
    });

    it('refuses wrong input with INVALID_INPUT, before it asks the provider', async () => {
      const { storage } = harness;
      const good = {
        assetId: uuidv7(),
        purpose,
        visibility: 'public',
        contentType: 'image/png',
        maxBytes: 1000,
      } as const;
      const key = assetKey(uuidv7(), purpose, 'public');
      const wrong: [string, () => unknown][] = [
        ['asset id that is not a UUIDv7', () => storage.createUpload({ ...good, assetId: 'abc' })],
        [
          'purpose over 64 characters',
          () => storage.createUpload({ ...good, purpose: 'a'.repeat(65) }),
        ],
        [
          'purpose with capitals',
          () => storage.createUpload({ ...good, purpose: 'Product.Image' }),
        ],
        [
          'unknown visibility',
          () => storage.createUpload({ ...good, visibility: 'secret' as never }),
        ],
        [
          'content type with parameters',
          () => storage.createUpload({ ...good, contentType: 'image/png; charset=x' }),
        ],
        ['no size limit', () => storage.createUpload({ ...good, maxBytes: 0 })],
        [
          'size limit over the maximum',
          () => storage.createUpload({ ...good, maxBytes: MAX_UPLOAD_BYTES + 1 }),
        ],
        [
          'ticket that lasts longer than a week',
          () => storage.createUpload({ ...good, expiresInSeconds: MAX_EXPIRY_SECONDS + 1 }),
        ],
        [
          'field nobody knows (a typo)',
          () => storage.createUpload({ ...good, maxByte: 1 } as never),
        ],
        ['stat: odd key', () => storage.stat('public/x')],
        ['delete: odd key', () => storage.delete('public/x')],
        [
          'copy: odd source',
          () => storage.copy({ from: 'x', assetId: uuidv7(), purpose, visibility: 'public' }),
        ],
        [
          'copy: asset id that is not a UUIDv7',
          () => storage.copy({ from: key, assetId: 'abc', purpose, visibility: 'public' }),
        ],
        ['list: limit 0', () => storage.list({ limit: 0 })],
        ['list: limit over the maximum', () => storage.list({ limit: MAX_LIST_LIMIT + 1 })],
      ];
      for (const [what, run] of wrong) {
        expect(await codeOf(run), what).toBe('INVALID_INPUT');
      }
      // getUrl builds a string, so it throws at the call
      const wrongUrls: [string, () => unknown][] = [
        ['getUrl: path trick as key', () => storage.getUrl({ key: '../etc/passwd' })],
        ['getUrl: width 0', () => storage.getUrl({ key, width: 0 })],
      ];
      for (const [what, run] of wrongUrls) {
        expect(await codeOf(run, true), what).toBe('INVALID_INPUT');
      }
    });
  });
}
