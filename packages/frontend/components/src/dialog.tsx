import { IconClose } from '@beautinique/frontend-icons';
import type { ReactNode } from 'react';
import { Dialog as AriaDialog, Heading, Modal, ModalOverlay } from 'react-aria-components';

import { Button } from './button';
import { cx } from './cx';

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The heading: the dialog is named by it. */
  title: ReactNode;
  /** A line under the title. */
  description?: ReactNode;
  children?: ReactNode;
  /** The buttons at the bottom (the main action last). */
  footer?: ReactNode;
  /**
   * Escape, a click outside and the close button close it (true by default). False for a step the
   * person must answer: then only the footer's buttons close it.
   */
  dismissable?: boolean;
  /** `alertdialog` for a question that needs an answer before going on ("Delete this?"). */
  role?: 'dialog' | 'alertdialog';
  /** @default 'md' */
  size?: DialogSize;
}

const SIZE: Readonly<Record<DialogSize, string>> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * A modal dialog (React Aria: focus moves in and stays in, Escape, the page behind is hidden
 * from screen readers and does not scroll, focus goes back where it was). It rises from the
 * bottom on a phone and sits in the middle on a wider screen; the styles animations open and close
 * it (none with reduced motion).
 *
 * ```tsx
 * <Dialog open={open} onOpenChange={setOpen} title="Delete this address?" role="alertdialog"
 *   footer={<><Button variant="outline" tone="neutral" onClick={() => setOpen(false)}>Cancel</Button>
 *     <Button tone="error" onClick={remove}>Delete</Button></>} />
 * ```
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  dismissable = true,
  role = 'dialog',
  size = 'md',
}: DialogProps) {
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable={dismissable}
      isKeyboardDismissDisabled={!dismissable}
      className="data-entering:animate-fade-in data-exiting:animate-fade-out fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6"
    >
      <Modal
        className={cx(
          'data-entering:animate-rise-in data-exiting:animate-sink-out sm:data-entering:animate-scale-in sm:data-exiting:animate-scale-out w-full',
          SIZE[size],
        )}
      >
        <AriaDialog
          role={role}
          className="bg-surface text-foreground relative flex max-h-[85dvh] flex-col overflow-y-auto rounded-2xl p-6 shadow-xl outline-hidden"
        >
          {({ close }) => (
            <>
              <Heading slot="title" className="font-display pe-10 text-xl font-medium">
                {title}
              </Heading>
              {description !== undefined && (
                <p className="text-foreground-muted mt-1 text-sm">{description}</p>
              )}
              {children !== undefined && <div className="mt-4">{children}</div>}
              {footer !== undefined && (
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  {footer}
                </div>
              )}
              {dismissable && (
                <Button
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  icon={<IconClose size={18} />}
                  aria-label="Close"
                  onClick={close}
                  className="absolute end-3 top-3"
                />
              )}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
