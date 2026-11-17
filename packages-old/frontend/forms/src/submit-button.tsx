import { Button, type ButtonProps } from '@beautinique/frontend-components';
import { useOnlineStatus } from '@beautinique/frontend-hooks';
import { type ReactNode, useId } from 'react';
import { useFormState } from 'react-hook-form';

/** A text button (a submit button says what it does); type and busy state are the form's. */
export type SubmitButtonProps = Omit<
  Extract<ButtonProps, { children: ReactNode }>,
  'type' | 'loading'
>;

/**
 * The form's submit button: busy (spinner, no second press) while the submit runs, and a note under
 * it while the device is offline. It stays pressable then: the connection may be back by the
 * time it is pressed, and a disabled button would not say why.
 */
export function SubmitButton({ children, variant = 'primary', ...button }: SubmitButtonProps) {
  const { isSubmitting } = useFormState();
  const { status } = useOnlineStatus();
  const noteId = useId();
  const offline = status !== 'online';
  return (
    <div className="flex flex-col gap-1.5">
      <Button
        {...button}
        variant={variant}
        type="submit"
        loading={isSubmitting}
        aria-describedby={offline ? noteId : undefined}
      >
        {children}
      </Button>
      <p id={noteId} role="status" className="text-foreground-muted text-sm empty:hidden">
        {offline ? 'You are offline. This will work once you are back online.' : ''}
      </p>
    </div>
  );
}
