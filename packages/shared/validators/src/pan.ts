import { z } from 'zod';

// 5 letters, 4 digits, 1 letter. The 4th letter says who holds it: A (association of persons),
// B (body of individuals), C (company), F (firm), G (government), H (HUF), J (artificial juridical
// person), K (Krish), L (local authority), P (person) or T (trust). A GSTIN holds a PAN in the
// same shape, so the GSTIN checks its middle part against this one.
export const PAN_FORMAT = /^[A-Z]{3}[ABCFGHJKLPT][A-Z][0-9]{4}[A-Z]$/;

/** A PAN, trimmed and in capitals. Only the format is checked, not that the PAN exists. */
export const panSchema = z.string().trim().toUpperCase().regex(PAN_FORMAT, 'Enter a valid PAN.');
