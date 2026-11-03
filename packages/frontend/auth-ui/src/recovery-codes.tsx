import { Button, Checkbox, Dialog, toast } from '@beautinique/frontend-components';
import { useCopyToClipboard } from '@beautinique/frontend-hooks';
import { formatDateTime } from '@beautinique/shared-utils';
import { useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router';

/** The file the codes download as. */
export const RECOVERY_CODES_FILE = 'beautinique-recovery-codes.txt';

/** The downloaded file: what the codes are for, whose they are, when they were made, the codes. */
export function recoveryCodesText(codes: readonly string[], email: string, madeAt: Date): string {
  return [
    'Beautinique recovery codes',
    `Account: ${email}`,
    `Made: ${formatDateTime(madeAt)} (India time)`,
    '',
    'Use one of these codes when you do not have your authenticator app: to sign in, or to',
    'confirm a change to your account. Each code works once. Keep them somewhere safe and private.',
    'New codes replace these.',
    '',
    ...codes,
    '',
  ].join('\n');
}

export interface RecoveryCodesProps {
  /** The 10 codes, just made: shown this once. */
  codes: readonly string[];
  /** The account's email, in the downloaded file. */
  email: string;
  /** After "I've saved them" was ticked. */
  onDone: () => void;
  /** @default 'Done' */
  doneLabel?: string;
}

/**
 * New recovery codes, shown once (ARCHITECTURE §9.2): copy them, download them as a .txt, and tick
 * "I've saved them" before going on. Until then, leaving the page asks first (a link, Back, or
 * closing the tab), since the codes cannot be shown again.
 */
export function RecoveryCodes({ codes, email, onDone, doneLabel = 'Done' }: RecoveryCodesProps) {
  const [saved, setSaved] = useState(false);
  const [missing, setMissing] = useState(false);
  const tick = useRef<HTMLInputElement>(null);
  const [madeAt] = useState(() => new Date());
  const { copy, copied } = useCopyToClipboard();
  const blocker = useBlocker(!saved);

  useEffect(() => {
    if (saved) return undefined;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
    };
  }, [saved]);

  const download = () => {
    const blob = new Blob([recoveryCodesText(codes, email, madeAt)], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = RECOVERY_CODES_FILE;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2 text-sm">
        <p>
          If you lose your phone, a recovery code signs you in, or confirms a change, in place of
          the authenticator code. Each code works once.
        </p>
        <p className="font-medium">
          You will not see these codes again. Save them somewhere safe and private, like a password
          manager.
        </p>
      </div>
      <ol
        aria-label="Recovery codes"
        className="border-border bg-surface-muted grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border p-4 font-mono text-sm sm:text-base"
      >
        {codes.map((code) => (
          <li key={code} className="tracking-wide">
            {code}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => {
            void copy(codes.join('\n')).then((ok) => {
              if (!ok) {
                toast({
                  tone: 'warning',
                  title: 'Copy did not work here.',
                  description: 'Download them, or select the codes and copy them by hand.',
                });
              }
            });
          }}
        >
          {copied ? 'Copied' : 'Copy codes'}
        </Button>
        <Button variant="outline" onClick={download}>
          Download .txt
        </Button>
      </div>
      {/* says "Copied" to screen readers too, which the button's new label alone may not */}
      <p role="status" className="sr-only">
        {copied ? 'Recovery codes copied.' : ''}
      </p>
      <Checkbox
        isSelected={saved}
        onChange={(value) => {
          setSaved(value);
          if (value) setMissing(false);
        }}
        inputRef={tick}
        error={missing ? 'Tick this once your codes are saved.' : undefined}
      >
        I’ve saved my recovery codes
      </Checkbox>
      <Button
        onClick={() => {
          if (saved) {
            onDone();
            return;
          }
          setMissing(true);
          tick.current?.focus();
        }}
      >
        {doneLabel}
      </Button>
      <Dialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.();
        }}
        role="alertdialog"
        size="sm"
        title="Leave without saving your codes?"
        description="You will not see these recovery codes again. You can get new ones later, with your authenticator code."
        footer={
          <>
            <Button variant="outline" tone="neutral" onClick={() => blocker.reset?.()}>
              Stay
            </Button>
            <Button tone="error" onClick={() => blocker.proceed?.()}>
              Leave
            </Button>
          </>
        }
      />
    </div>
  );
}
