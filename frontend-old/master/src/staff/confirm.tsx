import { Button, Dialog } from '@beautinique/frontend-components';
import type { ReactNode } from 'react';

export interface ConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** What happens, in plain words */
  children: ReactNode;
  /** The button that does it */
  action: string;
  onConfirm: () => void;
  busy?: boolean;
}

/** "Are you sure?" before a change that takes something away (an alertdialog, the action in red). */
export function Confirm({
  open,
  onOpenChange,
  title,
  children,
  action,
  onConfirm,
  busy = false,
}: ConfirmProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      role="alertdialog"
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            tone="neutral"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button tone="error" loading={busy} onClick={onConfirm}>
            {action}
          </Button>
        </>
      }
    >
      <div className="text-foreground-muted space-y-2 text-sm">{children}</div>
    </Dialog>
  );
}
