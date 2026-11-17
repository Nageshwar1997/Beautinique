import type { ReactNode } from 'react';

import { cx, type Tone, TONE_CLASS } from './cx';

export interface BadgeProps {
  /** The colour, from the styles tones: a state's meaning (`success` active, `neutral` ended ...). @default 'neutral' */
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

/**
 * A short state in a table or a card ("Active", "Pending", "Ended"): a pill in a tone's light
 * colours. Its words say the state; the colour only helps (WCAG 1.4.1), so never a colour alone.
 */
export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cx(
        'bg-tone-subtle text-tone-subtle-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
