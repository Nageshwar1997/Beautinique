# @beautinique/shared-utils

Beautinique ke chhote, bina dependency wale helpers: paise me money (INR formatting, GST, discount, bina galti ka bantwara), India time me dates, masking, slug aur UUIDv7. Browser aur Node dono me chalte hain.

## Install

```bash
npm install @beautinique/shared-utils
```

## Money (hamesha integer paise, rates basis points me)

```ts
import {
  formatINR,
  rupeesToPaise,
  taxFromInclusive,
  discountPercent,
  allocate,
} from '@beautinique/shared-utils';

formatINR(129_900); // '₹1,299'
formatINR(129_950); // '₹1,299.50'
formatINR(10_000_000); // '₹1,00,000'
rupeesToPaise('₹1,299.50'); // 129950
taxFromInclusive(129_900, 1800); // { taxable: 110085, tax: 19815 }  (18% GST, MRP ke andar)
discountPercent(159_900, 129_900); // 18  (18.76%, kabhi upar round nahi)
allocate(1000, [1, 1, 1]); // [334, 333, 333]
```

| Function                          | Kaam                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `formatINR(paise, { showPaise })` | ₹ aur Indian grouping. `showPaise`: `auto` (default, paise ho tabhi), `always`, `never` (poore rupaye, half up)          |
| `rupeesToPaise(value)`            | `'₹1,299.50'`, `19.99` → paise, float ki galti ke bina. 2 se zyada decimal ya galat text pe error (chupke se round nahi) |
| `paiseToRupees(paise)`            | Number (charts, inputs); dikhane ke liye `formatINR`                                                                     |
| `applyRate(paise, bps)`           | Rate lagao (18% = 1800), nearest paisa, half away from zero                                                              |
| `taxFromInclusive(gross, bps)`    | Tax-inclusive price ko taxable + tax me todo; dono ka jod hamesha gross                                                  |
| `discountPercent(mrp, selling)`   | MRP se discount, poore percent me, **neeche round** (consumer rules: discount badha-chadha ke nahi)                      |
| `allocate(total, weights)`        | Paise ko weights ke hisaab se baanto (coupon order lines pe); jod hamesha `total`, bacha paisa sabse bade remainder ko   |

Saara hisaab BigInt me hota hai, isliye bade amounts pe overflow nahi. Galat input (decimal paise, NaN, negative rate) pe `RangeError`.

## Dates (store UTC, dikhao India time)

```ts
formatDate('2026-10-20T07:56:26Z'); // '20 Oct 2026'
formatTime('2026-10-20T07:56:26Z'); // '1:26 pm'
formatDateTime(date); // '20 Oct 2026, 1:26 pm'
istDateKey('2026-10-19T20:00:00Z'); // '2026-10-20'  (India me agla din: cut-off, holidays, daily limits)
```

`Date`, ISO string ya ms chalte hain; galat date pe `RangeError`. Doosra zone chahiye to `{ timeZone }`. `IST` = `'Asia/Kolkata'`.

## Text

| Function                       | Example                                                 |
| ------------------------------ | ------------------------------------------------------- |
| `formatNumber(n)`              | `123456` → `1,23,456`                                   |
| `plural(count, word, plural?)` | `plural(2341, 'rating')` → `2,341 ratings`              |
| `slugify(text)`                | `Rosé Glow & Vitamin C` → `rose-glow-and-vitamin-c`     |
| `maskPhone(phone)`             | `9876543210` → `98******10` (logs, "OTP sent to")       |
| `maskEmail(email)`             | `priya.sharma@example.com` → `pr**********@example.com` |
| `initials(name)`               | `Priya Sharma` → `PS`                                   |
| `truncate(text, max)`          | `…` ke saath, emoji ko beech se nahi todta              |

## Ids aur assertions

- `uuidv7()`: time-ordered UUID (RFC 9562), events aur Delivery app ke offline actions ke liye. Ek process ke ids banne ke order me sort hote hain, ek hi millisecond me ya clock peeche jaye tab bhi. `uuidv7Time(id)` banne ka time deta hai.
- `invariant(condition, message)`: false pe error, aur TypeScript type narrow karta hai.
- `assertNever(value)`: exhaustive `switch` ke liye; case chhoota to compile error.

## License

MIT © Nageshwar Pawar
