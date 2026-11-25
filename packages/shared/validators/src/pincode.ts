import { string } from 'zod';

// 6 digits, and the first one is never 0 (it is the postal region, 1 to 9).
const PINCODE_FORMAT = /^[1-9][0-9]{5}$/;

/** A pincode, trimmed. Only the format is checked: whether the area exists is the location master's job. */
export const pincodeSchema = string('Pincode is required.')
  .trim()
  .min(1, { error: 'Pincode is required.', abort: true })
  .regex(PINCODE_FORMAT, 'Pincode must be 6 digits and cannot start with 0.');
