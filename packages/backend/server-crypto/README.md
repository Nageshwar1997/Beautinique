# @beautinique/backend-server-crypto

Beautinique ke personal data (PAN, bank account, rider DL aur RC, TOTP secrets, consult notes) ki field encryption (ARCHITECTURE §6.5, RULES §7): **AES-256-GCM** se sealed value, dhoondhne ke liye **HMAC blind index**, aur dikhane ke liye **masked copy**. Sirf Node ka `crypto`, koi aur dependency nahi.

## Install

```bash
npm install @beautinique/backend-server-crypto
```

## Keys

Har deployable apni keys apne config se leta hai (kabhi code ya repo me nahi):

| Setting (deployable ka prefix) | Format                    | Kaam                                                                                |
| ------------------------------ | ------------------------- | ----------------------------------------------------------------------------------- |
| `<NAME>__FIELD_KEYS`           | `k2:<base64>,k1:<base64>` | Pehli key se naya seal hota hai; baaki sirf purane values kholne ke liye (rotation) |
| `<NAME>__BLIND_INDEX_KEY`      | `b1:<base64>`             | Blind index ki key; field keys se alag honi chahiye                                 |

Har key 32 random bytes ka base64 hai: `generateKey()` banata hai (`node -e "import('@beautinique/backend-server-crypto').then((m) => console.log(m.generateKey()))"`). Galat config pe start hi fail hota hai, aur error me setting aur key id hota hai, key kabhi nahi.

**Rotation:** nayi key aage jodo (`k2:...,k1:...`) aur deploy karo: naye values `k2` se seal hote hain, purane `k1` se khulte rehte hain. Phir ek job `needsReencrypt` wale values ko khol ke dobara seal kare; sab ho jaye tab `k1` hatao. Blind index key badalna = har row ka index dobara banana, isliye wo sirf zaroorat pe.

## Ek field, poori

```ts
import {
  decryptField,
  loadCryptoKeys,
  sealPii,
  blindIndex,
} from '@beautinique/backend-server-crypto';

const keys = loadCryptoKeys({ fieldKeys: config.fieldKeys, blindIndexKey: config.blindIndexKey });

// save: sealed + searchable + masked
const normalizePan = (raw: string) => raw.replace(/\s/g, '').toUpperCase();
const pan = sealPii(keys, input.pan, {
  field: 'sellers.pan',
  context: `sellers.pan:${sellerId}`,
  normalize: normalizePan,
});
await sellers.updateOne({ _id: sellerId }, { $set: { pan } }, { session }); // { enc, idx, masked }

// dhoondhna (index pe): wahi field aur wahi normalize
await sellers.findOne({ 'pan.idx': blindIndex(keys, 'sellers.pan', normalizePan(query)) });

// kholna (sirf jinhe dekhne ka haq hai, audit ke saath)
const plain = decryptField(keys, seller.pan.enc, `sellers.pan:${sellerId}`);
```

## API

| Export                                                         | Kaam                                                                                                                                                                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loadCryptoKeys({ fieldKeys, blindIndexKey })`                 | Config se keys, start pe ek baar. Galat id/size, do baar wali id, ya index key = field key pe `CryptoError`                                                                                                                      |
| `loadSealingKeys(fieldKeys, setting)`                          | Sirf seal/open wali keys (blind index nahi), jaise do deployables ki ek shared value: identity ke OTP event ka code jo sirf notify khol sakta hai (`<NAME>__OTP_EVENT_KEYS`). Errors me `setting` ka naam                        |
| `generateKey()`                                                | 32 random bytes, base64                                                                                                                                                                                                          |
| `encryptField(keys, plaintext, context)`                       | AES-256-GCM, current key, har baar naya random IV. Format `v1.<keyId>.<iv>.<data>.<tag>` (base64url). `context` (jaise `sellers.bankAccount:<id>`) andar bandha hota hai: value doosre record ya field me copy karke nahi khulti |
| `decryptField(keys, sealed, context)`                          | Wahi key (sealed value me likhi id) aur wahi context se kholna. Galat context, badla hua byte ya galat key: sab ek hi error, bina bataye kaunsa. Hatai hui key ka value saaf bolta hai "key k1 configured nahi"                  |
| `needsReencrypt(keys, sealed)`                                 | Purani key se sealed hai? (rotation job ke liye)                                                                                                                                                                                 |
| `blindIndex(keys, field, normalized)`                          | HMAC-SHA256(field + value), `b1.<base64url>`. Ek field me barabar values ka index barabar (dhoondh sakte ho), do alag fields me alag; value wapas nahi nikalti. Pehle normalize karo, index sirf exact match deta hai            |
| `sealPii(keys, value, { field, context, normalize, visible })` | `{ enc, idx, masked }`: normalize ke baad seal, index aur masked copy                                                                                                                                                            |
| `maskTail(value, visible = 4)`                                 | `XXXXXX1234`; chhota value poora chhupa                                                                                                                                                                                          |
| `CryptoError`                                                  | Is package ka error; message me kabhi key ya data nahi                                                                                                                                                                           |

## Authenticator codes (TOTP)

RFC 6238 (TOTP) aur RFC 4226 (HOTP), dono RFC ke test vectors ke saath. Google/Microsoft Authenticator, Authy waghera QR ke `otpauth://` link se wahi codes phone pe bina internet banate hain; phone pe kuch bheja nahi jaata.

```ts
import { newTotpSecret, totpUri, verifyTotp } from '@beautinique/backend-server-crypto';

const secret = newTotpSecret(); // 160-bit, base32; encryptField se sealed rakho
const uri = totpUri({ secret, issuer: 'Beautinique', account: email }); // QR browser me
const step = verifyTotp(secret, code); // number | null; step save karo, wahi ya purana dobara mat lo
```

| Function                                        | Kaam                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `newTotpSecret()`                               | Naya random secret (20 bytes, base32)                                                    |
| `totpCode(secret, timeMs, options)`             | Us waqt ka code (default 6 digit, 30 s, SHA-1; `digits` 6–10, `algorithm` sha256/sha512) |
| `verifyTotp(secret, code, { now, window = 1 })` | Code kis time step ka hai (±window), ya `null`; har step constant time me compare        |
| `totpStep(timeMs)`, `hotp(secret, counter)`     | RFC ke building blocks                                                                   |
| `totpUri({ secret, issuer, account })`          | `otpauth://totp/...` link                                                                |
| `encodeBase32` / `decodeBase32`                 | RFC 4648 base32 (decode: case, space, hyphen, `=` chalte hain)                           |

## Niyam

- Personal field kabhi plain save nahi: `sealPii` (dhoondhna ho) ya `encryptField` (sirf rakhna ho, jaise TOTP secret).
- `context` me hamesha collection, field aur record id: `<collection>.<field>:<id>`.
- Logs, errors aur API responses me sirf `masked`; `decryptField` sirf us jagah jahan dekhne ka haq ho.
- Keys sirf deployable ke config/secret store me; `.env.example` me sirf naam, value kabhi nahi.

## Tests

Sirf unit tests (Mongo/Redis nahi chahiye): `npm test --workspace @beautinique/backend-server-crypto`.

## License

MIT © Nageshwar Pawar
