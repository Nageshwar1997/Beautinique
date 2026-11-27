# @beautinique/backend-media

The two ports of the media service, the media provider (public and review images) and the object storage (private files), with in-memory fakes for tests. The real adapters (Cloudinary and Backblaze B2) live in the media service, the only place that holds their keys.

## Install

```sh
npm install @beautinique/backend-media @beautinique/shared-clock
```

## Usage

The media service wires the real adapters; its tests, and the tests of every service that asks it for files, use the fakes from the `testing` entry. A service's `src` never imports that entry, so no fake reaches a production bundle.

```ts
import { createFakeClock } from '@beautinique/shared-clock';
import { detectFileType, MediaError } from '@beautinique/backend-media';
import {
  createFakeMediaProvider,
  createFakeObjectStorage,
} from '@beautinique/backend-media/testing';

const clock = createFakeClock(new Date('2026-11-27T10:00:00.000Z'));
const provider = createFakeMediaProvider({ clock, transformations: ['card', 'zoom'] });
const storage = createFakeObjectStorage({ clock, holdRetentionMs: 365 * 24 * 60 * 60 * 1000 });

// The server signs; the client (here the test) uploads with the signed fields.
const signed = await provider.signUpload({
  publicId: 'p7Qm2xKc9LwT4nB8vR1s',
  folder: 'products',
  types: ['jpeg', 'webp'],
  expiresAt: new Date('2026-11-27T10:10:00.000Z'),
});
const asset = await provider.upload(signed.fields, fileBytes);

// A private file: a presigned PUT with the exact type and size, then the server's own checks.
const put = await storage.presignPut({
  bucket: 'private',
  key: 'kyc/a1b2.jpg',
  contentType: 'image/jpeg',
  bytes: 64,
  expiresInSeconds: 600,
});
await storage.put(put.url, { headers: put.headers, body: fileBytes });
detectFileType(await storage.read('private', 'kyc/a1b2.jpg')); // 'jpeg', or null
```

## How the fakes behave, and where each behaviour comes from

Each fake behaves as its provider's docs say (docs/RULES.md RT-14). Its signatures are its own HMAC-SHA256; only the behaviour is the provider's. What the docs do not say is marked, and the media service checks it against the provider's real test mode.

**Media provider** (Cloudinary):

- A signed upload covers every field but the signature, sorted by name; a changed or added field, or no signature, is refused ([authentication signatures](https://cloudinary.com/documentation/authentication_signatures)).
- A signature works for one hour from its `timestamp`, so a shorter life (10 minutes) is a timestamp from before now (same page).
- `overwrite: false`: an image with the same public id is not replaced; the upload gets the one already there ([upload API](https://cloudinary.com/documentation/image_upload_api_reference)).
- `allowed_formats`: a file of another type is refused (same page).
- No size limit of its own: the upload API has no parameter for one (same page), so the fake takes a file of any size, and the media service reads `getAsset().bytes` after the upload and removes a file that is too large (SR-061, SR-062).
- A notification is signed over its body and `X-Cld-Timestamp`, and trusted for 2 hours ([notification signatures](https://cloudinary.com/documentation/notification_signatures)).
- Only named transformations make a URL. The docs read did not show the setting that blocks the others ("strict transformations"): the media service checks it in the real test mode.

**Object storage** (Backblaze B2, S3 compatible):

- A presigned PUT signs the exact `Content-Type` and size, and a different one is refused. The B2 docs read did not say which headers a presigned PUT signs: the media service checks it in the real test mode, and checks the size and type after every upload anyway (SR-062).
- The storage keeps the bytes as they came; it never checks their type.
- The `hold` bucket (Object Lock): removing or replacing a file before its retention ends fails ([Object Lock](https://www.backblaze.com/docs/cloud-storage-object-lock)).
- A presigned URL stops at its time; this package signs a PUT for 10 minutes at most and a GET for 5.

`failNext()` makes the next call fail as `unavailable`, as when the provider is down.

## API

- `MediaProvider`, `ObjectStorage`: the ports, and their request and result types.
- `detectFileType(bytes)`: `'jpeg' | 'png' | 'webp' | 'pdf' | 'mp4' | 'mov'` from the first bytes, or `null` (SVG and HTML too); `FILE_TYPES` (each type's `Content-Type` and size family), `IMAGE_TYPES`.
- `MAX_UPLOAD_BYTES` (image 5 MB, PDF 10 MB, video 30 MB), `UPLOAD_URL_TTL_SECONDS` (10 minutes), `PRIVATE_URL_TTL_SECONDS` (5 minutes).
- `MediaError` with a `kind`: `not_found`, `expired`, `bad_signature`, `rejected_type`, `retention` or `unavailable`; its message never holds a key, a signature or a signed URL.
- `@beautinique/backend-media/testing`: `createFakeMediaProvider({ clock, transformations })` and `createFakeObjectStorage({ clock, holdRetentionMs })`.

## Visibility

Public is fine. The package holds no key and no provider's address: only the shape of two ports and fakes that sign with a random key of their own. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
