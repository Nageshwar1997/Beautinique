import { createFakeClock } from '@beautinique/shared-clock';
import { describe, expect, it } from 'vitest';

import { MAX_UPLOAD_BYTES, MediaError, type SignUploadRequest } from '../src/index.ts';
import { createFakeMediaProvider } from '../src/testing.ts';
import { bytesOf, sampleFile } from './utils/files.ts';

const START = new Date('2026-11-27T10:00:00.000Z');
const MINUTE = 60_000;

function setup() {
  const clock = createFakeClock(START);
  const provider = createFakeMediaProvider({ clock, transformations: ['card', 'zoom'] });
  const request = (change: Partial<SignUploadRequest> = {}): SignUploadRequest => ({
    publicId: 'p7Qm2xKc9LwT4nB8vR1s',
    folder: 'products',
    types: ['jpeg', 'webp'],
    expiresAt: new Date(START.getTime() + 10 * MINUTE),
    ...change,
  });
  return { clock, provider, request };
}

async function kindOf(work: Promise<unknown>): Promise<string> {
  const error: unknown = await work.then(
    () => null,
    (thrown: unknown) => thrown,
  );
  expect(error).toBeInstanceOf(MediaError);
  return (error as MediaError).kind;
}

describe('the fake media provider: a signed upload (SR-096, SR-061)', () => {
  it('takes the file the server signed for: its public id, folder, type and size', async () => {
    const { provider, request } = setup();
    const signed = await provider.signUpload(request());
    expect(signed.fields).toMatchObject({
      public_id: 'p7Qm2xKc9LwT4nB8vR1s',
      folder: 'products',
      overwrite: 'false',
      resource_type: 'image',
    });
    const asset = await provider.upload(signed.fields, sampleFile('jpeg', 900));
    expect(asset).toEqual({
      publicId: 'p7Qm2xKc9LwT4nB8vR1s',
      folder: 'products',
      type: 'jpeg',
      bytes: 900,
      createdAt: START,
    });
    expect(await provider.getAsset('p7Qm2xKc9LwT4nB8vR1s')).toEqual(asset);
    expect(await provider.getAsset('someOtherPublicId0')).toBeNull();
  });

  it('SR-096: an unsigned upload, or one with another folder or public id, is refused', async () => {
    const { provider, request } = setup();
    const { fields } = await provider.signUpload(request());
    const file = sampleFile('jpeg');
    const unsigned = Object.fromEntries(
      Object.entries(fields).filter(([name]) => name !== 'signature'),
    );
    expect(await kindOf(provider.upload(unsigned, file))).toBe('bad_signature');
    expect(await kindOf(provider.upload({ ...fields, folder: 'reviews' }, file))).toBe(
      'bad_signature',
    );
    expect(await kindOf(provider.upload({ ...fields, public_id: 'mine' }, file))).toBe(
      'bad_signature',
    );
    expect(await kindOf(provider.upload({ ...fields, overwrite: 'true' }, file))).toBe(
      'bad_signature',
    );
    // A field the server did not sign, such as a transformation of the client's own.
    expect(await kindOf(provider.upload({ ...fields, transformation: 'e_blur' }, file))).toBe(
      'bad_signature',
    );
  });

  it('SR-096: a second upload with the same signature does not overwrite the first', async () => {
    const { provider, request } = setup();
    const { fields } = await provider.signUpload(request());
    const first = await provider.upload(fields, sampleFile('jpeg', 100));
    const again = await provider.upload(fields, sampleFile('webp', 200));
    expect(again).toEqual(first);
    expect(await provider.getAsset(first.publicId)).toMatchObject({ type: 'jpeg', bytes: 100 });
  });

  it('SR-061: a type the upload does not allow, an HTML file named ".png" and SVG are refused', async () => {
    const { provider, request } = setup();
    const { fields } = await provider.signUpload(request());
    expect(await kindOf(provider.upload(fields, sampleFile('png')))).toBe('rejected_type');
    expect(await kindOf(provider.upload(fields, bytesOf('<html><body>x</body></html>')))).toBe(
      'rejected_type',
    );
    expect(await kindOf(provider.upload(fields, bytesOf('<svg></svg>')))).toBe('rejected_type');
  });

  it('D-471: takes a file of any size, as the provider does; the asset tells the media service its size', async () => {
    const { provider, request } = setup();
    const { fields } = await provider.signUpload(request());
    const big = MAX_UPLOAD_BYTES.image + 1;
    await provider.upload(fields, sampleFile('jpeg', big));
    // What the media service reads after the upload, to refuse a file that is too large (SR-061).
    expect(await provider.getAsset('p7Qm2xKc9LwT4nB8vR1s')).toMatchObject({ bytes: big });
  });

  it('SR-061: the signature stops at its time (10 minutes at most), through its timestamp', async () => {
    const { clock, provider, request } = setup();
    const { fields } = await provider.signUpload(request());
    // The provider's rule: one hour from `timestamp`, so the timestamp is 50 minutes before now.
    expect(Number(fields['timestamp']) * 1000).toBe(START.getTime() - 50 * MINUTE);
    clock.advance(10 * MINUTE);
    await expect(provider.upload(fields, sampleFile('jpeg'))).resolves.toMatchObject({
      type: 'jpeg',
    });
    const second = await provider.signUpload(
      request({
        publicId: 'q8Rn3yLd0MxU5oC9wS2t',
        expiresAt: new Date(START.getTime() + 20 * MINUTE),
      }),
    );
    clock.advance(10 * MINUTE + 1);
    expect(await kindOf(provider.upload(second.fields, sampleFile('jpeg')))).toBe('expired');
  });

  it('signs nothing outside the rules: the public id, folder, types and time', async () => {
    const { provider, request } = setup();
    const refused = [
      request({ publicId: 'short' }),
      request({ publicId: 'has/a/slash/in/it/0000' }),
      request({ folder: 'Products' }),
      request({ types: [] }),
      request({ types: ['gif' as 'jpeg'] }),
      request({ expiresAt: new Date(START.getTime() + 10 * MINUTE + 1) }),
      request({ expiresAt: START }),
    ];
    for (const bad of refused) {
      await expect(provider.signUpload(bad)).rejects.toThrow(RangeError);
    }
  });
});

describe('the fake media provider: delivery, removal and the list', () => {
  it('SR-096: builds a URL only through a named transformation', async () => {
    const { provider, request } = setup();
    const { fields } = await provider.signUpload(request());
    await provider.upload(fields, sampleFile('jpeg'));
    expect(provider.deliveryUrl('p7Qm2xKc9LwT4nB8vR1s', 'card')).toBe(
      'https://media.example.test/image/upload/t_card/products/p7Qm2xKc9LwT4nB8vR1s',
    );
    expect(() => provider.deliveryUrl('p7Qm2xKc9LwT4nB8vR1s', 'w_4000,e_blur')).toThrow(RangeError);
    expect(provider.deliveryUrl('unknownPublicId00', 'zoom')).toBe(
      'https://media.example.test/image/upload/t_zoom/unknownPublicId00',
    );
  });

  it('removes an image, and removing one that is not there is no error', async () => {
    const { provider, request } = setup();
    const { fields } = await provider.signUpload(request());
    await provider.upload(fields, sampleFile('jpeg'));
    await provider.remove('p7Qm2xKc9LwT4nB8vR1s');
    expect(await provider.getAsset('p7Qm2xKc9LwT4nB8vR1s')).toBeNull();
    await expect(provider.remove('p7Qm2xKc9LwT4nB8vR1s')).resolves.toBeUndefined();
  });

  it("lists one folder's images in the order of their public ids, a page at a time", async () => {
    const { provider, request } = setup();
    const ids = ['cccccccccccccccc', 'aaaaaaaaaaaaaaaa', 'bbbbbbbbbbbbbbbb'];
    for (const publicId of ids) {
      const { fields } = await provider.signUpload(request({ publicId }));
      await provider.upload(fields, sampleFile('jpeg'));
    }
    const other = await provider.signUpload(
      request({ publicId: 'zzzzzzzzzzzzzzzz', folder: 'reviews' }),
    );
    await provider.upload(other.fields, sampleFile('jpeg'));

    const first = await provider.list({ folder: 'products', limit: 2 });
    expect(first.items.map((asset) => asset.publicId)).toEqual([
      'aaaaaaaaaaaaaaaa',
      'bbbbbbbbbbbbbbbb',
    ]);
    const second = await provider.list({ folder: 'products', cursor: first.next, limit: 2 });
    expect(second).toMatchObject({ items: [{ publicId: 'cccccccccccccccc' }], next: null });
  });

  it('a call while the provider is down fails as "unavailable", and the next one works', async () => {
    const { provider } = setup();
    provider.failNext();
    expect(await kindOf(provider.getAsset('aaaaaaaaaaaaaaaa'))).toBe('unavailable');
    expect(await provider.getAsset('aaaaaaaaaaaaaaaa')).toBeNull();
    for (const call of [
      () => provider.remove('aaaaaaaaaaaaaaaa'),
      () => provider.list({ folder: 'products' }),
      () => provider.upload({}, sampleFile('jpeg')),
    ]) {
      provider.failNext();
      expect(await kindOf(call())).toBe('unavailable');
    }
  });
});

describe('the fake media provider: notifications (SR-096)', () => {
  it('trusts only its own signed notification, within its window', () => {
    const { clock, provider } = setup();
    const notice = provider.notification('{"public_id":"aaaaaaaaaaaaaaaa"}');
    expect(provider.verifyNotification(notice)).toBe(true);
    expect(provider.verifyNotification({ ...notice, body: '{"public_id":"bbbb"}' })).toBe(false);
    expect(provider.verifyNotification({ ...notice, signature: 'x' })).toBe(false);
    expect(provider.verifyNotification({ ...notice, timestamp: 'soon' })).toBe(false);
    clock.advance(2 * 60 * MINUTE + 1);
    expect(provider.verifyNotification(notice)).toBe(false);
  });

  it('a notification from the future is not trusted', () => {
    const { clock, provider } = setup();
    clock.advance(MINUTE);
    const notice = provider.notification('{}');
    clock.set(START);
    expect(provider.verifyNotification(notice)).toBe(false);
  });
});
