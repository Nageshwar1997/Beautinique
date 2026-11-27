/**
 * The file types a user may upload (docs/security/SECURITY_REQUIREMENTS.md SR-061): images, PDF,
 * and video (only in a claim, D-106) as MP4 or MOV, the form an iPhone records in (D-471).
 */
export type FileType = 'jpeg' | 'png' | 'webp' | 'pdf' | 'mp4' | 'mov';

/** The image types among them: the only ones the media provider takes (SR-096). */
export type ImageType = Extract<FileType, 'jpeg' | 'png' | 'webp'>;

/** What a file of each type is: its `Content-Type` and the family its size limit belongs to. */
export const FILE_TYPES: Readonly<
  Record<FileType, { contentType: string; family: 'image' | 'pdf' | 'video' }>
> = Object.freeze({
  jpeg: { contentType: 'image/jpeg', family: 'image' },
  png: { contentType: 'image/png', family: 'image' },
  webp: { contentType: 'image/webp', family: 'image' },
  pdf: { contentType: 'application/pdf', family: 'pdf' },
  mp4: { contentType: 'video/mp4', family: 'video' },
  mov: { contentType: 'video/quicktime', family: 'video' },
});

export const IMAGE_TYPES: readonly ImageType[] = Object.freeze(['jpeg', 'png', 'webp']);

// The brands of the `ftyp` box: the ISO base media ones of an MP4 file, and QuickTime's of a MOV.
const MP4_BRANDS = new Set([
  'isom',
  'iso2',
  'iso4',
  'iso5',
  'iso6',
  'mp41',
  'mp42',
  'avc1',
  'M4V ',
]);
const MOV_BRAND = 'qt  ';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function startsWith(bytes: Uint8Array, signature: readonly number[], at = 0): boolean {
  if (bytes.length < at + signature.length) return false;
  return signature.every((byte, i) => bytes[at + i] === byte);
}

function ascii(bytes: Uint8Array, from: number, to: number): string {
  return String.fromCharCode(...bytes.subarray(from, to));
}

/**
 * The type of a file from its first bytes, never from its name or a `Content-Type` the client sent
 * (SR-061): JPEG, PNG, WebP, PDF, MP4 or MOV. Anything else, SVG and HTML too, is `null`.
 */
export function detectFileType(bytes: Uint8Array): FileType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(bytes, PNG_SIGNATURE)) return 'png';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') {
    return 'webp';
  }
  if (bytes.length >= 5 && ascii(bytes, 0, 5) === '%PDF-') return 'pdf';
  if (bytes.length >= 12 && ascii(bytes, 4, 8) === 'ftyp') {
    const brand = ascii(bytes, 8, 12);
    if (MP4_BRANDS.has(brand)) return 'mp4';
    if (brand === MOV_BRAND) return 'mov';
  }
  return null;
}
