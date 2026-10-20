# @beautinique/shared-zod

Beautinique ka zod, ek jagah se: **poora zod** (`string`, `object`, `number`, `ZodType` ...) aur Beautinique ke apne schemas: Indian mobile, PIN code, GSTIN (asli check digit ke saath), PAN, IFSC, UPI, paise me money, aur baaki common fields. Frontend forms, backend aur `shared-contracts` sab yahi use karte hain, isliye ek field har jagah ek hi tarah validate hota hai aur ek hi message deta hai.

## Install

```bash
npm install @beautinique/shared-zod zod
```

`zod` (v4) peer dependency hai: app aur saare packages ek hi zod instance use karte hain.

## Use

```ts
import {
  enum as zodEnum,
  gstinZod,
  mobileNumberZod,
  object,
  paiseZod,
  pincodeZod,
  string,
} from '@beautinique/shared-zod';

const sellerForm = object({
  name: string().min(2),
  type: zodEnum(['brand', 'distributor']),
  phone: mobileNumberZod,
  gstin: gstinZod,
  pincode: pincodeZod,
  minOrder: paiseZod,
});

sellerForm.parse({
  name: 'Rose Co',
  type: 'brand',
  phone: '+91 98765 43210',
  gstin: '27aapfu0939f1zv',
  pincode: '411001',
  minOrder: 49_900,
});
// { ..., phone: '9876543210', gstin: '27AAPFU0939F1ZV', ... }
```

**Niyam:**

- zod hamesha **isi package se aur naam se** import hota hai (`import { object, string } ...`), `z.` nahi. Seedha `'zod'` sirf is package ke andar; baaki jagah ESLint rokta hai.
- Hamare schemas ke naam `Zod` pe khatam hote hain (`emailZod`, `gstinZod`), isliye zod ke naamon (`email`, `uuid` ...) se kabhi nahi takraate.
- `enum` JavaScript ka reserved word hai: `import { enum as zodEnum }`. `null`, `undefined`, `void`, `function` jaise naam bhi `as` ke saath aate hain.
- zod ka `z` bhi milta hai (`import { z }`), par Beautinique ke code me named imports hi likhte hain.

Messages English me hain aur seedha user ko dikhaye ja sakte hain (`Enter a valid GSTIN`).

## Schemas

### India

| Export                 | Kya check karta hai                                                                    | Output                   |
| ---------------------- | -------------------------------------------------------------------------------------- | ------------------------ |
| `mobileNumberZod`      | Indian mobile, 6/7/8/9 se shuru. `+91`, `91`, `0`, spaces, `-`, `()` sab chalte hain   | 10 digits (`9876543210`) |
| `pincodeZod`           | 6 digits, 0 se shuru nahi                                                              | waisa hi                 |
| `panZod`               | 5 letters + 4 digits + 1 letter; 4th letter holder type (P, C, F, H, A, B, G, J, L, T) | upper case               |
| `gstinZod`             | State code (01–38, 97, 99) + PAN + entity + `Z` + **check digit sahi hona chahiye**    | upper case               |
| `gstinCheckDigit()`    | Function: 14 characters ka check digit (seed data ya tests ke liye)                    | ek character             |
| `ifscZod`              | 4 letters + `0` + 6 letters/digits                                                     | upper case               |
| `bankAccountNumberZod` | 9–18 digits                                                                            | waisa hi                 |
| `upiIdZod`             | `name@handle`                                                                          | lower case               |

GSTIN ka check digit typing ki galti pakadta hai: koi bhi ek character badlo to GSTIN fail hota hai. Ye sirf format hai; GSTIN asli me registered hai ya nahi, wo GST portal batata hai (project me dummy data).

### Pehchaan

| Export          | Niyam                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| `emailZod`      | Trim + lower case, max 254                                                                               |
| `otpZod`        | 6 digits (SMS OTP aur authenticator app dono)                                                            |
| `passwordZod`   | NIST SP 800-63B: 8–128 characters, koi bhi character, "ek capital ek number" jaisa niyam nahi, trim nahi |
| `personNameZod` | Kisi bhi script ke letters, space, `.`, `'`, `-`; letter se shuru; extra spaces ek; 1–100                |

Leaked passwords ki list se check server karta hai, ye package nahi.

### Common

| Export                         | Niyam                                                   |
| ------------------------------ | ------------------------------------------------------- |
| `paiseZod`                     | Integer paise, 0 ya zyada (₹1 = 100). Har amount isi me |
| `signedPaiseZod`               | Integer paise, minus bhi (ledger, refund, adjustment)   |
| `basisPointsZod`               | 0–10000 (1% = 100): GST rate, commission, discount      |
| `objectIdZod`                  | MongoDB id, 24 hex, lower case                          |
| `uuidZod`, `uuidv7Zod`         | UUID; v7 events aur offline actions ke liye             |
| `slugZod`                      | `rose-glow-serum` jaisa                                 |
| `hexColorZod`                  | `#RRGGBB` (shade swatch), upper case                    |
| `httpsUrlZod`                  | Sirf `https://` (http, `javascript:` waghaira mana)     |
| `isoDateTimeZod`, `isoDateZod` | `2026-10-20T07:56:26.899Z` (UTC), `2026-10-20`          |

Sab zod schemas hain, to `.optional()`, `.nullable()`, `.array()` waghaira lagaye ja sakte hain.

## License

MIT © Nageshwar Pawar
