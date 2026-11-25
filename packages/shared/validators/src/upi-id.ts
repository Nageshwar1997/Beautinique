import { string } from 'zod';

// `name@handle`: a name of letters, digits, dot, dash and underscore (a mobile number is a common
// name), and the handle of the bank or app, which starts with a letter (okaxis, ybl, paytm).
const UPI_ID_FORMAT = /^[a-z0-9._-]{2,256}@[a-z][a-z0-9]{1,63}$/;

/** A UPI id, trimmed and in small letters (UPI ids ignore case). Only the format is checked. */
export const upiIdSchema = string('UPI ID is required.')
  .trim()
  .min(1, { error: 'UPI ID is required.', abort: true })
  .toLowerCase()
  .regex(UPI_ID_FORMAT, 'UPI ID must be a valid UPI ID, like name@bank.');
