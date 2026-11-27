import { randomBytes } from 'node:crypto';

import type { Clock } from '@beautinique/shared-clock';

import { MediaError } from '../errors.ts';
import { detectFileType, IMAGE_TYPES, type ImageType } from '../file-type.ts';
import { UPLOAD_URL_TTL_SECONDS } from '../limits.ts';
import type {
  MediaProvider,
  ProviderAsset,
  ProviderNotification,
  SignUploadRequest,
} from '../ports.ts';
import { later } from '../utils/later.ts';
import { pageOf } from '../utils/page.ts';
import { sameSignature, sign } from '../utils/signing.ts';

export interface FakeMediaProviderOptions {
  clock: Clock;
  /** The named transformations the provider allows; it builds no other (SR-096). */
  transformations: readonly string[];
}

/** The fake media provider, with the steps a test plays for the client and the provider. */
export interface FakeMediaProvider extends MediaProvider {
  /** The client's step: posts the file with the signed fields, as a browser would. */
  upload(fields: Readonly<Record<string, string>>, file: Uint8Array): Promise<ProviderAsset>;
  /** A notification signed the way the provider signs one, at the clock's now. */
  notification(body: string): ProviderNotification;
  /** The next call that reaches the provider fails, as when it is down. */
  failNext(): void;
}

const BASE_URL = 'https://media.example.test/image/upload';
// A signed upload works for one hour from its `timestamp`: a shorter life is a timestamp from
// before now.
const SIGNATURE_LIFE_SECONDS = 60 * 60;
// How old a notification may be: the provider's own window.
const NOTIFICATION_WINDOW_MS = 2 * 60 * 60 * 1000;
const PUBLIC_ID = /^[A-Za-z0-9_-]{16,128}$/;
const FOLDER = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const IMAGE_TYPE_SET: ReadonlySet<string> = new Set(IMAGE_TYPES);

// The text a signature covers: every field but the signature, sorted by name.
function signedText(fields: Readonly<Record<string, string>>): string {
  return Object.keys(fields)
    .filter((name) => name !== 'signature')
    .sort()
    .map((name) => `${name}=${fields[name] ?? ''}`)
    .join('&');
}

function checkRequest(request: SignUploadRequest, now: Date): void {
  if (!PUBLIC_ID.test(request.publicId)) {
    throw new RangeError('publicId must be 16 to 128 letters, digits, "_" or "-".');
  }
  if (!FOLDER.test(request.folder)) {
    throw new RangeError('folder must be lowercase letters, digits, "_" or "-".');
  }
  if (request.types.length === 0 || !request.types.every((type) => IMAGE_TYPE_SET.has(type))) {
    throw new RangeError(`types must be some of ${IMAGE_TYPES.join(', ')}.`);
  }
  const ahead = request.expiresAt.getTime() - now.getTime();
  if (!(ahead > 0 && ahead <= UPLOAD_URL_TTL_SECONDS * 1000)) {
    throw new RangeError(`expiresAt must be within ${String(UPLOAD_URL_TTL_SECONDS)} s from now.`);
  }
}

/**
 * A media provider in memory that behaves as the provider's docs say (docs/RULES.md RT-14; the
 * package README lists each behaviour and its source): a signed upload with the server's own
 * public id, folder, types and time, no overwrite, no size limit of its own, named
 * transformations only, and signed notifications. Its signatures are its own HMAC; only the
 * behaviour is the provider's.
 */
export function createFakeMediaProvider({
  clock,
  transformations,
}: FakeMediaProviderOptions): FakeMediaProvider {
  const secret = randomBytes(32);
  const named: ReadonlySet<string> = new Set(transformations);
  const assets = new Map<string, ProviderAsset>();
  let failing = false;

  // A call that reaches the provider: the one `failNext` aimed at fails as a provider down does.
  const reach = <T>(work: () => T): Promise<T> =>
    later(() => {
      if (failing) {
        failing = false;
        throw new MediaError('unavailable', 'The media provider did not answer.');
      }
      return work();
    });

  const upload = (fields: Readonly<Record<string, string>>, file: Uint8Array): ProviderAsset => {
    const signature = fields['signature'];
    if (signature === undefined || !sameSignature(signature, sign(secret, signedText(fields)))) {
      throw new MediaError('bad_signature', 'The upload is not signed, or a signed field changed.');
    }
    const endsAt = (Number(fields['timestamp']) + SIGNATURE_LIFE_SECONDS) * 1000;
    if (!(clock.now().getTime() <= endsAt)) {
      throw new MediaError('expired', 'The signed upload is past its time.');
    }
    const allowed = (fields['allowed_formats'] ?? '').split(',');
    const type = detectFileType(file);
    if (type === null || !allowed.includes(type)) {
      throw new MediaError('rejected_type', `The file is not one of ${allowed.join(', ')}.`);
    }
    // No size limit here, as at the provider: the media service checks `bytes` after the upload.
    const publicId = fields['public_id'] ?? '';
    // `overwrite: false`: an image already there stays as it is, and the upload gets it back.
    const kept = assets.get(publicId);
    if (kept !== undefined) return { ...kept };
    const asset: ProviderAsset = {
      publicId,
      folder: fields['folder'] ?? '',
      type: type as ImageType,
      bytes: file.length,
      createdAt: clock.now(),
    };
    assets.set(publicId, asset);
    return { ...asset };
  };

  return {
    signUpload: (request) =>
      later(() => {
        checkRequest(request, clock.now());
        const fields: Record<string, string> = {
          public_id: request.publicId,
          folder: request.folder,
          allowed_formats: request.types.join(','),
          timestamp: String(
            Math.floor(request.expiresAt.getTime() / 1000) - SIGNATURE_LIFE_SECONDS,
          ),
          overwrite: 'false',
          resource_type: 'image',
          type: 'upload',
        };
        fields['signature'] = sign(secret, signedText(fields));
        return { url: BASE_URL, fields: Object.freeze(fields), expiresAt: request.expiresAt };
      }),

    upload: (fields, file) => reach(() => upload(fields, file)),

    getAsset: (publicId) =>
      reach(() => {
        const asset = assets.get(publicId);
        return asset === undefined ? null : { ...asset };
      }),

    deliveryUrl(publicId, transformation) {
      if (!named.has(transformation)) {
        throw new RangeError(`"${transformation}" is not a named transformation.`);
      }
      const asset = assets.get(publicId);
      const path = asset === undefined ? publicId : `${asset.folder}/${publicId}`;
      return `${BASE_URL}/t_${transformation}/${path}`;
    },

    remove: (publicId) =>
      reach(() => {
        assets.delete(publicId);
      }),

    list: ({ folder, ...page }) =>
      reach(() => {
        const inFolder = [...assets.values()].filter((asset) => asset.folder === folder);
        const result = pageOf(inFolder, (asset) => asset.publicId, page);
        return { items: result.items.map((asset) => ({ ...asset })), next: result.next };
      }),

    verifyNotification({ body, timestamp, signature }) {
      // The timestamp is in seconds, as the provider sends it (`X-Cld-Timestamp`).
      const age = clock.now().getTime() - Number(timestamp) * 1000;
      if (!(age >= 0 && age <= NOTIFICATION_WINDOW_MS)) return false;
      return sameSignature(signature, sign(secret, `${body}${timestamp}`));
    },

    notification(body) {
      const timestamp = String(Math.floor(clock.now().getTime() / 1000));
      return { body, timestamp, signature: sign(secret, `${body}${timestamp}`) };
    },

    failNext() {
      failing = true;
    },
  };
}
