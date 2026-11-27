# @beautinique/backend-crypto

Field encryption, blind indexes, code hashes and the sealed copy of held data, for a service. Everything is `node:crypto`: no other dependency.

## Install

```sh
npm install @beautinique/backend-crypto
```

`zod` is a peer dependency (the config schemas). The `./mongo` entry also needs `mongodb`, `@beautinique/backend-mongo` and `@beautinique/shared-clock`; a service without MongoDB does not install them.

## Usage

The keys are never in this package: each service gives its own, from its own config namespace.

```ts
import { defineConfig, loadConfig } from '@beautinique/backend-config';
import {
  createBlindIndex,
  createCodeHasher,
  createFieldCipher,
  createSealer,
  keyringSchema,
  noPrivateKeysRule,
  sealingKeySchema,
} from '@beautinique/backend-crypto';

export const catalogConfig = defineConfig({
  service: 'catalog',
  keys: {
    CATALOG_FIELD_KEYS: keyringSchema('CATALOG_FIELD_KEYS'),
    CATALOG_BLIND_KEYS: keyringSchema('CATALOG_BLIND_KEYS'),
    CATALOG_HOLD_KEY: sealingKeySchema('CATALOG_HOLD_KEY'),
  },
  // A private key anywhere in the live config stops the boot (SR-097).
  rules: [noPrivateKeysRule()],
});

const config = loadConfig(catalogConfig, { env: process.env, directory: import.meta.dirname });
const fields = createFieldCipher({ service: 'catalog', keys: config.CATALOG_FIELD_KEYS });
const blind = createBlindIndex({ service: 'catalog', keys: config.CATALOG_BLIND_KEYS });

// A seller's PAN: encrypted for its record and field, and a blind index to find it by.
const place = { collection: 'seller_profiles', field: 'kyc.pan', recordId: sellerId };
const stored = {
  'kyc.pan': fields.encrypt('ABCPE1234F', place),
  'kyc.panIndex': blind.indexOf('ABCPE1234F', place),
};
fields.decrypt(stored['kyc.pan'], place); // 'ABCPE1234F'
// Looking for a PAN: every key's index, so a record not yet moved to a new key is found too.
const filter = { 'kyc.panIndex': { $in: blind.lookupValues('ABCPE1234F', place) } };

// In identity, an OTP: only its hash is kept, bound to its challenge.
const codes = createCodeHasher({ service: 'identity', keys: identityConfig.IDENTITY_BLIND_KEYS });
const hash = codes.hash(code, { purpose: 'otp', ref: challengeId });
codes.verify(typed, hash, { purpose: 'otp', ref: challengeId }); // true or false, never an error
```

### Keys in the config

| Key                    | Value                                                       | Kind                                      |
| ---------------------- | ----------------------------------------------------------- | ----------------------------------------- |
| `<SERVICE>_FIELD_KEYS` | `k2:<32 bytes>,k1:<32 bytes>`, base64url, the current first | Field encryption                          |
| `<SERVICE>_BLIND_KEYS` | the same form, other keys                                   | Blind indexes and code hashes             |
| `<SERVICE>_HOLD_KEY`   | `h1:<public key>`, X25519 SPKI DER in base64url             | Sealing held copies (only the public key) |

A new symmetric key is `newKeyText('k2')`; a sealing key pair is `generateSealingKeyPair('h1')` of the break-glass entry, on the owner's laptop. A keyring takes up to 16 keys; ids are small letters and digits, up to 16. A message about a key names the config key and the key id, never a key.

### A new key, and the daily re-encrypt

Put the new key first in the keyring: new values are made with it, and the old key still opens the values it made. The service's daily job (`dailyJob` of `@beautinique/backend-events`) then moves a small batch at a time, by `_id`, only while the keyring has an old key:

```ts
const [prefix] = fields.stalePrefixes; // 'v1.k1.'
const batch = await users
  .find({ _id: { $gt: lastId }, pan: { $regex: `^${prefix.replaceAll('.', '\\.')}` } })
  .sort({ _id: 1 })
  .limit(500)
  .toArray();
for (const user of batch) {
  const place = { collection: 'users', field: 'pan', recordId: user._id.toHexString() };
  await users.updateOne(
    { _id: user._id, pan: user.pan },
    { $set: { pan: fields.rotate(user.pan, place) } },
  );
}
```

When nothing is left, the old key comes out of the config. Blind indexes are made again from the value the same way (`isCurrent`, `stalePrefixes`). A code hash cannot be made again (the code is not kept): a code hashed with an old key keeps working while that key is in the keyring, so a blind key stays until its recovery codes are used or replaced.

### Held copies (MongoDB)

An erase takes the fields out of the record, and writes their sealed copy and its event in the same transaction (AC-PLATFORM-11):

```ts
import { createHold, sealedRecordsCollection } from '@beautinique/backend-crypto/mongo';

const sealer = createSealer({ service: 'identity', key: config.IDENTITY_HOLD_KEY });
const hold = createHold({ sealer, collections, clock }); // collections has sealedRecordsCollection

await withTransaction(
  client,
  async (session) => {
    await users.updateOne({ _id }, { $unset: { name: '', phone: '' } }, { session });
    await hold.hold(db, session, {
      collection: 'users',
      recordId: _id.toHexString(),
      accountId: _id,
      fields: { name, phone },
      eraseAt, // from the hold setting: 180 days now (D-250)
    });
    await outbox.append(db, session, userErased, event);
  },
  { clock },
);
```

Only the break-glass command on the owner's laptop opens a copy, with the private key that is never on a server:

```ts
import { openSealed, parseOpeningKey } from '@beautinique/backend-crypto/break-glass';

openSealed(record.sealed, parseOpeningKey(privateKeyText), {
  service: 'identity',
  collection: 'users',
  recordId,
});
```

## API

Main entry (every service):

- `createFieldCipher({ service, keys })`: `encrypt(plaintext, place)` gives `v1.<keyId>.<iv>.<ciphertext>.<tag>` (AES-256-GCM, a new 96-bit IV each time, base64url); `decrypt(value, place)`; `isCurrent(value)`; `rotate(value, place)`; `stalePrefixes`. The associated data is `<service>.<collection>.<field>:<recordId>`, so a value copied to another record, field, collection or service does not open (SR-063). The service and the collection have no `.`, the field may (`kyc.pan`) but has no `:`, the record id has neither: two places never have the same associated data. A plaintext is a string of up to 64 KB (`MAX_FIELD_BYTES`).
- `createBlindIndex({ service, keys })`: `indexOf(value, place)` gives `b1.<keyId>.<HMAC-SHA256>` over the field's place and the value, so one value in two fields has two unrelated indexes; `lookupValues(value, place)` (every key's, the current first); `isCurrent(index)`; `stalePrefixes`. Give the value in its one normal form.
- `createCodeHasher({ service, keys })` with the `blind` keyring: `hash(code, { purpose, ref })` gives `c1.<keyId>.<HMAC-SHA256>`, bound to what the code is for; `verify(typed, hash, place)` compares in constant time and is `false` for anything wrong in what was typed; `isCurrent(hash)`.
- `hashToken(token)`: the SHA-256 of a random token of 22 to 1,024 characters (an invite link's), in base64url, to store and look up by.
- `randomToken(bytes = 32)` and `randomDigits(count)`: from the system's secure source, never `Math.random`.
- `createSealer({ service, key })`: `seal(fields, { collection, recordId })` gives `s1.<keyId>.<ephemeral key>.<iv>.<ciphertext>.<tag>`: a new X25519 key for each copy, HKDF-SHA256, AES-256-GCM, the record as associated data (D-469). Up to 1 MB of JSON (`MAX_HELD_BYTES`). It cannot open what it seals.
- `parseKeyring(text, name)`, `keyringSchema(name)`, `Keyring`, `newKeyText(id)`; `parseSealingKey(text, name)`, `sealingKeySchema(name)`, `SealingKey`: the config values. A keyring or a sealing key shows only its name and ids when logged or turned into JSON. A private key given as the sealing key is refused.
- `noPrivateKeysRule()`: a `@beautinique/backend-config` rule; any text key that holds a private key (PEM, or DER in base64 or base64url) stops the boot. `holdsPrivateKey(text)` is its check.
- `CryptoError`: a stored value that does not open (changed, of another place, or of a key the config no longer has). Its message names the place and the key id, never the value. Wrong input to a function is a `RangeError`.

`./mongo` entry:

- `sealedRecordsCollection`: `sealed_records`, retention class `case`, a TTL index on `eraseAt`, indexes to find the copies of a record or an account, and kept after an account delete (it is the legal hold). Its validator takes `sealed` only in its sealed form.
- `createHold({ sealer, collections, clock })`: `hold(db, session, { collection, recordId, accountId?, fields, eraseAt })` writes the copy in the given transaction (outside one it is refused) and gives its id. A record of a `tech` collection is not held (D-321), nor one of a collection the registry does not have.

`./break-glass` entry (the owner's laptop only):

- `generateSealingKeyPair(id)`: `{ publicKey, privateKey }` as config texts; the private key goes only in the password manager and the offline copy (D-399).
- `parseOpeningKey(text)` and `openSealed(sealed, key, { service, collection, recordId })`: the fields of a held copy, or a `CryptoError`.

## Visibility

Public is fine. AES-256-GCM, HMAC-SHA256, X25519 and HKDF are open standards, and how a value is bound to its place is the usual way to do it; the safety is in the keys, which are never in this package: each service gives its own from its config, and the private key that opens held copies is never on a server. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
