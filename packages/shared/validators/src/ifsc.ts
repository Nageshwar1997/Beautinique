import { string } from 'zod';

// 4 letters for the bank, a zero (kept for later use), and 6 letters or digits for the branch.
const IFSC_FORMAT = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** An IFSC code, trimmed and in capitals. Only the format is checked, not that the branch exists. */
export const ifscSchema = string('IFSC code is required.')
  .trim()
  .min(1, { error: 'IFSC code is required.', abort: true })
  .toUpperCase()
  .regex(IFSC_FORMAT, 'IFSC code must be a valid 11-character IFSC code, like HDFC0001234.');
