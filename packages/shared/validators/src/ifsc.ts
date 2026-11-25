import { z } from 'zod';

// 4 letters for the bank, a zero (kept for later use), and 6 letters or digits for the branch.
const IFSC_FORMAT = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** An IFSC code, trimmed and in capitals. Only the format is checked, not that the branch exists. */
export const ifscSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(IFSC_FORMAT, 'Enter a valid IFSC code.');
