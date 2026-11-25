# @beautinique/shared-validators

India format validators as zod schemas: GSTIN with its check digit, PAN, IFSC, pincode, UPI id, email and phone (format only).

## Install

```sh
npm install @beautinique/shared-validators zod
```

`zod` (version 4) is a peer dependency, because the schemas are part of your own types.

## Usage

Use the schemas as the fields of your own zod objects. A refusal names the field.

```ts
import { object } from 'zod';
import { gstinSchema, ifscSchema, phoneSchema } from '@beautinique/shared-validators';

const sellerPayout = object({
  gstin: gstinSchema,
  ifsc: ifscSchema,
  phone: phoneSchema.optional(),
});

sellerPayout.parse({ gstin: ' 27abcpe1234f1zb', ifsc: 'hdfc0001234', phone: '98765 43210' });
// { gstin: '27ABCPE1234F1ZB', ifsc: 'HDFC0001234', phone: '+919876543210' }

sellerPayout.safeParse({ gstin: '27ABCPE1234F1ZA', ifsc: 'hdfc0001234', phone: '98765 43210' });
// refused: path ['gstin'], "GSTIN check character is wrong, check it for a typo."
```

Every schema trims what a person typed and returns it in one standard form, so the same value is stored one way.

## Messages

A refusal has the field in its `path` and a message that starts with the name of the thing, so it can be shown as it is. Every schema answers in the same two ways, here for `emailSchema`:

| The value is                                            | The message                            |
| ------------------------------------------------------- | -------------------------------------- |
| missing, `null`, empty, only spaces, or not text at all | `Email is required.`                   |
| text, but not a right email address                     | `Email must be a valid email address.` |

The names are `Email`, `GSTIN`, `PAN`, `IFSC code`, `Pincode`, `UPI ID` and `Phone number`. A format message says what is expected, with an example where it helps (`PAN must be a valid 10-character PAN, like ABCPE1234F.`). One mistake gives one message. A message never repeats the value it refused, as a PAN, an email address or a phone number must not reach a log.

## Optional fields

Every schema asks for its value. Where a field may be left out, use zod's own `.optional()`, and `.nullable()` where the value may also be `null` (`.nullish()` for both):

```ts
const contact = object({
  email: emailSchema.optional(), // a string or missing
  phone: phoneSchema.nullable(), // a string or null
});
```

Each one lets through only what it names. `emailSchema.optional()` takes a string or a missing value, and still refuses `null` (`Email is required.`). `phoneSchema.nullable()` takes a string or `null`, but not a missing value. If `null` must not be allowed, add nothing: a schema without `.nullable()` refuses it.

`.optional()` lets only `undefined` through. A form that sends `""` for an input the person left empty gets `Email is required.` back, so such an input is turned into `undefined` before it reaches the schema (that is the form's job, not the schema's).

## API

All of them check the format only. None of them says that a PAN, a bank branch or a mailbox really exists.

- `gstinSchema`: 15 characters in capitals. The state code (01 to 38, 97 or 99), the holder's PAN, the registration number, `Z` and the check character. A wrong check character has its own message, since it is usually one typo.
- `gstinCheckCharacter(body)`: the check character (Luhn mod 36) of the first 14 characters of a GSTIN, to make a valid GSTIN for seed data and tests.
- `panSchema`: `AAAPA1234A`. The 4th letter is the holder type (A, B, C, F, G, H, J, K, L, P or T).
- `ifscSchema`: 4 letters, `0`, then 6 letters or digits, in capitals.
- `pincodeSchema`: 6 digits that do not start with 0.
- `upiIdSchema`: `name@handle`, in small letters.
- `emailSchema`: an address of at most 254 characters, in small letters.
- `phoneSchema`: an Indian mobile number (10 digits that start with 6, 7, 8 or 9). It takes `98765 43210`, `+91 98765-43210`, `919876543210` and `09876543210`, and returns `+919876543210`. A landline or a number of another country is refused.

## Visibility

Public is fine. These are public rules of India's tax, banking and postal systems and a general email check, with nothing specific to Beautinique. Showing how a GSTIN or a UPI id is checked helps nobody attack the product, and every number still has to be verified by its issuer. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
