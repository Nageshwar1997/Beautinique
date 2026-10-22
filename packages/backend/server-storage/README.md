# @beautinique/backend-server-storage

Beautinique ki saari files (product images, seller documents, POD, invoices) ek hi interface `StoragePort` ke peeche (ARCHITECTURE §6.7, RULES §4.10). Aaj ka provider Cloudinary hoga, kal S3 + CloudFront: adapter badalne se data nahi badalta. Is package me interface, uske types, ek in-memory adapter aur wo contract tests hain jo **har adapter ko pass karne hain**.

## Install

```bash
npm install @beautinique/backend-server-storage zod
```

## Niyam

- **Database me sirf `assetId`**, provider ka URL kabhi nahi. URL hamesha `getUrl` se banta hai.
- **Ek file, ek owner.** Wahi image doosre record ko chahiye to `copy` se naya asset banta hai; ek record ka delete doosre ki image nahi todta.
- **Key ek hi format ka:** `<visibility>/<purpose>/<assetId>` (`public/product.image/<uuidv7>`), `assetKey()` se. Key se hi pata chalta hai ki file public hai ya private, aur provider badalne par key wahi rehti hai.
- Upload browser se seedha provider ko jaata hai (signed ticket); server file ko apne se nahi guzaarta.

## `StoragePort`

| Method                               | Kaam                                                                                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `createUpload(input)`                | Signed ticket (`url`, `fields`/`headers`, `expiresAt`): ek file, tay type aur size limit ke saath. Default 15 minute.                            |
| `getUrl({ key, width? })`            | Public: hamesha wahi URL (CDN cache). Private: short-lived signed URL (default 5 minute). Provider ko call nahi karta, sync hai.                 |
| `stat(key)`                          | Size, type, upload time; file nahi hai (abhi upload nahi hui) to `undefined`. `USED` karne se pehle ye dekho.                                    |
| `delete(key)`                        | File hatata hai. Jo pehle se nahi hai wo bhi theek: delete job retry hota hai.                                                                   |
| `copy({ from, assetId, ... })`       | Doosre asset ke liye nayi, alag file. Source nahi mili to `NOT_FOUND`; naya asset pehle se file rakhta hai to `ALREADY_EXISTS` (overwrite nahi). |
| `list({ prefix?, cursor?, limit? })` | Key ke order me pages (max 500), weekly reconcile job ke liye.                                                                                   |

`stat` aur `list` ARCHITECTURE §6.7 ke chaar naam wale methods ke upar jude hain: `stat` ke bina `USED` mark karte waqt pata nahi chalta ki file sach me upload hui; `list` ke bina reconcile job provider ki list nahi padh sakta.

Galat input (UUIDv7 nahi, purpose `product.image` jaisa nahi, size 0, typo wala field ...) `StorageError` `INVALID_INPUT` deta hai, aur promise wale methods me wo rejected promise hota hai, call pe throw nahi.

## Use

```ts
import { assetKey, createMemoryStorage } from '@beautinique/backend-server-storage';
import { uuidv7 } from '@beautinique/shared-utils';

const storage = createMemoryStorage(); // production me Cloudinary adapter, `storage.provider` config se

const assetId = uuidv7();
const ticket = await storage.createUpload({
  assetId,
  purpose: 'product.image',
  visibility: 'public',
  contentType: 'image/webp',
  maxBytes: 2_000_000,
});
// ticket.key registry (`media_assets`) me jaati hai; browser ticket se seedha upload karta hai

await storage.stat(ticket.key); // upload ke baad { size, contentType, uploadedAt }
storage.getUrl({ key: ticket.key, width: 640 });

const copy = await storage.copy({
  from: ticket.key,
  assetId: uuidv7(),
  purpose: 'banner.image',
  visibility: 'public',
});
```

## Asset ki zindagi

`UNUSED` (upload hua, kisi record ne use nahi kiya) → `USED` (record use kar raha hai) → `DELETING` (record ne chhoda, provider se delete queue me) → `DELETED`. Kisi ne na uthaya hua `UNUSED` upload daily clean-up me seedha `DELETING`. `DELETING` se wapas kuch nahi. `canMoveAsset(from, to)` / `assertAssetMove(from, to)` registry ke liye ye niyam dete hain; registry (`media_assets`) khud media module ka hissa hai, is package ka nahi.

## Naya adapter (Cloudinary, S3)

1. `StoragePort` lagao. Input hamesha `parseInput(createUploadInputZod, input, 'createUpload')` jaise schemas se check karo (sab adapters ek jaise refuse karein), key `assetKey()` se banao, provider ki galti `StorageError('PROVIDER_ERROR', ...)` me lapeto.
2. Contract tests apne adapter pe chalao:

```ts
import { storageContract } from '@beautinique/backend-server-storage/testing';

storageContract('cloudinary', () => ({
  storage: createCloudinaryStorage(testConfig),
  // browser ka kaam: ticket se body bhejo; provider mana kare to StorageError('UPLOAD_REFUSED')
  upload: (ticket, body, contentType) => uploadWithTicket(ticket, body, contentType),
}));
```

Har test apna alag purpose (`contract_<random>`) leta hai aur apni banai files hata deta hai, isliye shared bucket par bhi chalta hai. `TINY_PNG` asli 1x1 PNG hai, kyunki Cloudinary andar dekhta hai ki file kya hai. Test ke liye `vitest` chahiye (optional peer dependency).

## In-memory adapter

`createMemoryStorage({ baseUrl?, now?, secret? })`: files memory me, signed ticket aur private URL asli HMAC se, `now` ghadi tests me aage badhti hai. Extra: `upload(ticket, body, contentType)` (browser ka kaam: ticket ka signature, ant, type aur size dekhta hai) aur `isUrlValid(url)` (CDN ka kaam: signature aur expiry). Tests aur bina provider ke chalne ke liye; production me nahi.

## License

MIT © Nageshwar Pawar
