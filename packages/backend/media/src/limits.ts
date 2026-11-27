const MB = 1024 * 1024;

/** The largest file a user may upload, by family (docs/security/SECURITY_REQUIREMENTS.md SR-061). */
export const MAX_UPLOAD_BYTES: Readonly<Record<'image' | 'pdf' | 'video', number>> = Object.freeze({
  image: 5 * MB,
  pdf: 10 * MB,
  video: 30 * MB,
});

/** How long a signed upload stays good (docs/ARCHITECTURE.md §7 rule 1, SR-061). */
export const UPLOAD_URL_TTL_SECONDS = 10 * 60;

/** How long a private file's URL stays good (§7 rule 4, SR-062). */
export const PRIVATE_URL_TTL_SECONDS = 5 * 60;
