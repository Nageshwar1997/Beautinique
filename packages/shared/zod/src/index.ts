/**
 * The whole of zod (`string`, `object`, `enum`, `ZodType` ...) plus Beautinique's schemas. Apps and
 * packages import zod only from here, by name, so the repo has one zod and one import path:
 *   import { gstinZod, mobileNumberZod, object, string } from '@beautinique/shared-zod';
 * Beautinique's own schemas end in `Zod`, so they never clash with zod's names. `enum` is a reserved
 * word: import it as `enum as zodEnum`.
 */
export {
  basisPointsZod,
  hexColorZod,
  httpsUrlZod,
  isoDateTimeZod,
  isoDateZod,
  objectIdZod,
  paiseZod,
  signedPaiseZod,
  slugZod,
  uuidv7Zod,
  uuidZod,
} from './common';
export { emailZod, otpZod, passwordZod, personNameZod } from './identity';
export {
  bankAccountNumberZod,
  gstinCheckDigit,
  gstinZod,
  ifscZod,
  mobileNumberZod,
  panZod,
  pincodeZod,
  upiIdZod,
} from './india';
export * from 'zod';
