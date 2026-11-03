/** Joins class names, skipping the empty ones. */
export const cx = (...names: (string | false | null | undefined)[]): string =>
  names.filter(Boolean).join(' ');

/** The 8 tones of the styles package (DESIGN §4): one component, any colour. */
export const TONES = [
  'brand',
  'neutral',
  'secondary',
  'accent',
  'success',
  'warning',
  'error',
  'info',
] as const;
export type Tone = (typeof TONES)[number];

/** Static class names per tone, so Tailwind finds every one of them in the source. */
export const TONE_CLASS: Readonly<Record<Tone, string>> = {
  brand: 'tone-brand',
  neutral: 'tone-neutral',
  secondary: 'tone-secondary',
  accent: 'tone-accent',
  success: 'tone-success',
  warning: 'tone-warning',
  error: 'tone-error',
  info: 'tone-info',
};
