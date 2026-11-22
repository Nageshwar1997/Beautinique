import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { StorageError } from './errors';
import {
  copyInputZod,
  createUploadInputZod,
  getUrlInputZod,
  listInputZod,
  parseInput,
  parseKeyInput,
} from './inputs';
import { assetKey, parseKey } from './keys';
import type { StoragePort, StoredFile, UploadTicket } from './types';

export interface MemoryStorageOptions {
  /** What URLs start with. Default `https://files.beautinique.example`. */
  baseUrl?: string;
  /** The clock; tests move it to expire tickets and URLs. */
  now?: () => Date;
  /** Signs tickets and private URLs. Default: random per storage. */
  secret?: string;
}

/** A `StoragePort` that keeps files in memory: for tests and for running without a provider. */
export interface MemoryStorage extends StoragePort {
  /** The browser's side of an upload: what the provider does with a ticket and a file. */
  upload(ticket: UploadTicket, body: Uint8Array, contentType: string): Promise<void>;
  /** What the CDN checks: a private URL is signed, not changed and not expired. */
  isUrlValid(url: string): boolean;
}

interface Held {
  body: Uint8Array;
  contentType: string;
  uploadedAt: Date;
}

function sameSignature(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Runs `work` so that a throw becomes a rejected promise, as a real provider call would fail. */
const later = <T>(work: () => T): Promise<T> =>
  new Promise((resolve) => {
    resolve(work());
  });

export function createMemoryStorage(options: MemoryStorageOptions = {}): MemoryStorage {
  const provider = 'memory';
  const baseUrl = (options.baseUrl ?? 'https://files.beautinique.example').replace(/\/+$/, '');
  const now = options.now ?? (() => new Date());
  const secret = options.secret ?? randomBytes(32).toString('hex');
  const files = new Map<string, Held>();

  const sign = (...parts: (string | number)[]): string =>
    createHmac('sha256', secret).update(parts.join('\n')).digest('hex');

  const toStored = (key: string, held: Held): StoredFile => ({
    key,
    size: held.body.byteLength,
    contentType: held.contentType,
    uploadedAt: held.uploadedAt.toISOString(),
  });

  return {
    provider,

    createUpload(raw) {
      return later(() => {
        const input = parseInput(createUploadInputZod, raw, 'createUpload');
        const key = assetKey(input.assetId, input.purpose, input.visibility);
        const expiresAt = new Date(now().getTime() + input.expiresInSeconds * 1000).toISOString();
        const policy = {
          key,
          contentType: input.contentType,
          maxBytes: String(input.maxBytes),
          expiresAt,
        };
        return {
          provider,
          assetId: input.assetId,
          key,
          method: 'POST' as const,
          url: `${baseUrl}/upload`,
          fields: {
            ...policy,
            signature: sign('upload', key, input.contentType, input.maxBytes, expiresAt),
          },
          headers: {},
          expiresAt,
        };
      });
    },

    upload(ticket, body, contentType) {
      return later(() => {
        const { key, contentType: allowed, maxBytes, expiresAt, signature } = ticket.fields;
        if (!key || !allowed || !maxBytes || !expiresAt || !signature) {
          throw new StorageError('UPLOAD_REFUSED', 'The upload ticket is incomplete');
        }
        if (!sameSignature(signature, sign('upload', key, allowed, Number(maxBytes), expiresAt))) {
          throw new StorageError('UPLOAD_REFUSED', 'The upload ticket is not valid');
        }
        if (now().getTime() >= Date.parse(expiresAt)) {
          throw new StorageError('UPLOAD_REFUSED', 'The upload ticket has expired');
        }
        if (contentType !== allowed) {
          throw new StorageError('UPLOAD_REFUSED', `Only ${allowed} may be uploaded`);
        }
        if (body.byteLength > Number(maxBytes)) {
          throw new StorageError('UPLOAD_REFUSED', `The file is over ${maxBytes} bytes`);
        }
        files.set(key, { body: body.slice(), contentType, uploadedAt: now() });
      });
    },

    getUrl(raw) {
      const input = parseInput(getUrlInputZod, raw, 'getUrl');
      const visibility = parseKey(input.key)?.visibility;
      const query = new URLSearchParams();
      if (input.width !== undefined) query.set('w', String(input.width));
      if (visibility === 'private') {
        const expires = Math.floor(now().getTime() / 1000) + input.expiresInSeconds;
        query.set('expires', String(expires));
        query.set('sig', sign('url', input.key, input.width ?? '', expires));
      }
      const text = query.toString();
      return `${baseUrl}/${input.key}${text === '' ? '' : `?${text}`}`;
    },

    isUrlValid(url) {
      const parsed = new URL(url);
      const key = parsed.pathname.slice(1);
      const found = parseKey(key);
      if (!found) return false;
      if (found.visibility === 'public') return true;
      const expires = Number(parsed.searchParams.get('expires'));
      const width = parsed.searchParams.get('w') ?? '';
      return (
        expires > now().getTime() / 1000 &&
        sameSignature(parsed.searchParams.get('sig') ?? '', sign('url', key, width, expires))
      );
    },

    stat(key) {
      return later(() => {
        const held = files.get(parseKeyInput(key, 'stat'));
        return held && toStored(key, held);
      });
    },

    delete(key) {
      return later(() => {
        files.delete(parseKeyInput(key, 'delete'));
      });
    },

    copy(raw) {
      return later(() => {
        const input = parseInput(copyInputZod, raw, 'copy');
        const source = files.get(input.from);
        if (!source) {
          throw new StorageError('NOT_FOUND', 'The file to copy is not there');
        }
        const key = assetKey(input.assetId, input.purpose, input.visibility);
        if (files.has(key)) {
          throw new StorageError(
            'ALREADY_EXISTS',
            'That asset already has a file: a copy never overwrites',
          );
        }
        const held = { ...source, body: source.body.slice(), uploadedAt: now() };
        files.set(key, held);
        return toStored(key, held);
      });
    },

    list(raw = {}) {
      return later(() => {
        const input = parseInput(listInputZod, raw, 'list');
        const keys = [...files.keys()]
          .filter((key) => key.startsWith(input.prefix))
          .filter((key) => input.cursor === undefined || key > input.cursor)
          .toSorted();
        const page = keys.slice(0, input.limit);
        const last = page.at(-1);
        return {
          files: page.flatMap((key) => {
            const held = files.get(key);
            return held ? [toStored(key, held)] : [];
          }),
          ...(keys.length > input.limit && last !== undefined ? { nextCursor: last } : {}),
        };
      });
    },
  };
}
