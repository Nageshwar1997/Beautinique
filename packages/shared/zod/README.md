# @beautinique/shared-zod

Beautinique ke Zod validators: Indian mobile, PIN code, GSTIN (asli check digit ke saath), PAN, IFSC, UPI, paise me money, aur baaki common fields. Frontend forms, backend aur `shared-contracts` sab yahi use karte hain, isliye ek field har jagah ek hi tarah validate hota hai aur ek hi message deta hai.

## Install

```bash
npm install @beautinique/shared-zod zod
```

`zod` (v4) peer dependency hai: app aur saare packages ek hi zod use karte hain.

## Use

```ts
import * as z from 'zod';
import { gstin, mobileNumber, paise, pincode } from '@beautinique/shared-zod';

const sellerForm = z.object({ phone: mobileNumber, gstin, pincode, minOrder: paise });

sellerForm.parse({
  phone: '+91 98765 43210',
  gstin: '27aapfu0939f1zv',
  pincode: '411001',
  minOrder: 49_900,
});
// { phone: '9876543210', gstin: '27AAPFU0939F1ZV', pincode: '411001', minOrder: 49900 }
```

Messages English me hain aur seedha user ko dikhaye ja sakte hain (`Enter a valid GSTIN`).

## API

### India

| Export              | Kya check karta hai                                                                    | Output                   |
| ------------------- | -------------------------------------------------------------------------------------- | ------------------------ |
| `mobileNumber`      | Indian mobile, 6/7/8/9 se shuru. `+91`, `91`, `0`, spaces, `-`, `()` sab chalte hain   | 10 digits (`9876543210`) |
| `pincode`           | 6 digits, 0 se shuru nahi                                                              | waisa hi                 |
| `pan`               | 5 letters + 4 digits + 1 letter; 4th letter holder type (P, C, F, H, A, B, G, J, L, T) | upper case               |
| `gstin`             | State code (01–38, 97, 99) + PAN + entity + `Z` + **check digit sahi hona chahiye**    | upper case               |
| `gstinCheckDigit()` | 14 characters ka check digit nikalta hai (seed data ya tests ke liye)                  | ek character             |
| `ifsc`              | 4 letters + `0` + 6 letters/digits                                                     | upper case               |
| `bankAccountNumber` | 9–18 digits                                                                            | waisa hi                 |
| `upiId`             | `name@handle`                                                                          | lower case               |

GSTIN ka check digit typing ki galti pakadta hai: koi bhi ek character badlo to GSTIN fail hota hai. Ye sirf format hai; GSTIN asli me registered hai ya nahi, wo GST portal batata hai (project me dummy data).

### Pehchaan

| Export       | Niyam                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `email`      | Trim + lower case, max 254                                                                               |
| `otp`        | 6 digits (SMS OTP aur authenticator app dono)                                                            |
| `password`   | NIST SP 800-63B: 8–128 characters, koi bhi character, "ek capital ek number" jaisa niyam nahi, trim nahi |
| `personName` | Kisi bhi script ke letters, space, `.`, `'`, `-`; letter se shuru; extra spaces ek; 1–100                |

Leaked passwords ki list se check server karta hai, ye package nahi.

### Common

| Export                   | Niyam                                                   |
| ------------------------ | ------------------------------------------------------- |
| `paise`                  | Integer paise, 0 ya zyada (₹1 = 100). Har amount isi me |
| `signedPaise`            | Integer paise, minus bhi (ledger, refund, adjustment)   |
| `basisPoints`            | 0–10000 (1% = 100): GST rate, commission, discount      |
| `objectId`               | MongoDB id, 24 hex, lower case                          |
| `uuid`, `uuidv7`         | UUID; v7 events aur offline actions ke liye             |
| `slug`                   | `rose-glow-serum` jaisa                                 |
| `hexColor`               | `#RRGGBB` (shade swatch), upper case                    |
| `httpsUrl`               | Sirf `https://` (http, `javascript:` waghaira mana)     |
| `isoDateTime`, `isoDate` | `2026-10-20T07:56:26.899Z` (UTC), `2026-10-20`          |

Sab `ZodType` hain, to `.optional()`, `.nullable()`, `.array()` waghaira lagaye ja sakte hain.

## License

MIT © Nageshwar Pawar
