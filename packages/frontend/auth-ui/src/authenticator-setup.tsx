import { errorMessage, isApiError, queryKey, useApiClient } from '@beautinique/frontend-api-client';
import { Button, Spinner, toast } from '@beautinique/frontend-components';
import {
  CodeField,
  Form,
  PasswordField,
  SubmitButton,
  useZodForm,
} from '@beautinique/frontend-forms';
import { useCopyToClipboard } from '@beautinique/frontend-hooks';
import {
  confirmAuthenticator,
  enrollAuthenticator,
  getMe,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import { useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { TEXT_LINK, TextLink } from './layout';
import { ACCOUNT_PATHS, AUTH_PATHS, authHref } from './next';
import { RecoveryCodes } from './recovery-codes';
import { useSession } from './session';

type Enrolled = RouteOutput<typeof enrollAuthenticator>;

type Step =
  | { kind: 'starting'; notice?: string }
  | { kind: 'failed'; error: unknown }
  | ({ kind: 'scan' | 'confirm'; notice?: string } & Enrolled)
  | { kind: 'codes'; codes: string[] };

/** `JBSWY3DPEHPK3PXP` → `JBSW Y3DP EHPK 3PXP`: easier to read off the screen and type. */
export function groupSecret(secret: string): string {
  return secret.replace(/(.{4})(?=.)/g, '$1 ');
}

export interface AuthenticatorSetupProps {
  /** After the recovery codes were saved: back to the security page, say. */
  onDone: () => void;
  /** Where "Cancel" goes. @default ACCOUNT_PATHS.security */
  backHref?: string;
}

/**
 * Sets up the authenticator from the account (ARCHITECTURE §9.2), or replaces it (a new phone;
 * the API asks a step-up first): 1. scan the QR code (drawn here, no outside site), or open the
 * link on this phone, or type the key; 2. the first code and the password; 3. the recovery codes,
 * shown once. The set-up waits 10 minutes; an expired one starts again with a new key.
 */
export function AuthenticatorSetup({
  onDone,
  backHref = ACCOUNT_PATHS.security,
}: AuthenticatorSetupProps) {
  const client = useApiClient();
  const { state } = useSession();
  const [step, setStep] = useState<Step>({ kind: 'starting' });

  const start = useCallback(
    async (notice?: string) => {
      setStep({ kind: 'starting', ...(notice === undefined ? {} : { notice }) });
      try {
        const enrolled = await client.call(enrollAuthenticator);
        setStep({ kind: 'scan', ...enrolled, ...(notice === undefined ? {} : { notice }) });
      } catch (error) {
        setStep({ kind: 'failed', error });
      }
    },
    [client],
  );

  // once per page (a second enroll would replace the first key, StrictMode runs effects twice)
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void start();
  }, [start]);

  const email = state.status === 'signed-in' ? state.user.email : '';
  // an authenticator already: this set-up replaces it (/iam/me is read again only once saved)
  const replacing = state.status === 'signed-in' && state.user.authenticator;
  const cancel = (
    <TextLink to={backHref} className="text-sm">
      Cancel
    </TextLink>
  );

  switch (step.kind) {
    case 'starting':
      return (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner label="Getting a new key" />
        </div>
      );
    case 'failed':
      return (
        <Failed error={step.error} email={email} onRetry={() => void start()} cancel={cancel} />
      );
    case 'scan':
      return (
        <StepFrame number={1} title="Add Beautinique to your authenticator app">
          {step.notice !== undefined && <Notice>{step.notice}</Notice>}
          <Scan secret={step.secret} uri={step.uri} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            {cancel}
            <Button
              onClick={() => {
                setStep({ ...step, kind: 'confirm' });
              }}
            >
              Next
            </Button>
          </div>
        </StepFrame>
      );
    case 'confirm':
      return (
        <StepFrame number={2} title="Enter the code from the app">
          <Confirm
            replacing={replacing}
            onBack={() => {
              setStep({ ...step, kind: 'scan' });
            }}
            onRestart={(notice) => void start(notice)}
            onConfirmed={(codes) => {
              setStep({ kind: 'codes', codes });
            }}
          />
        </StepFrame>
      );
    case 'codes':
      return (
        <StepFrame number={3} title="Save your recovery codes">
          <RecoveryCodes codes={step.codes} email={email} onDone={onDone} />
        </StepFrame>
      );
  }
}

/** One numbered step of a set-up (also the sign-in that sets up the authenticator). */
export function StepFrame({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`setup-step-${String(number)}`} className="space-y-5">
      <div>
        <p className="text-foreground-muted text-sm">Step {number} of 3</p>
        <h2 id={`setup-step-${String(number)}`} className="font-display text-xl font-medium">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="bg-info-subtle text-info-subtle-foreground rounded-lg px-4 py-3 text-sm"
    >
      {children}
    </p>
  );
}

/** The QR code, the link for this phone and the key to type: the first step of a set-up. */
export function Scan({ secret, uri }: Enrolled) {
  const { copy, copied } = useCopyToClipboard();
  return (
    <div className="space-y-5">
      <p className="text-sm">
        Scan this QR code with an authenticator app (any app that makes 6-digit codes).
      </p>
      {/* dark on white in every theme: an inverted QR code is not read by every app */}
      <div className="flex justify-center sm:justify-start">
        <div className="rounded-xl border border-black/10 bg-white p-2">
          <QRCodeSVG
            value={uri}
            size={176}
            level="M"
            marginSize={4}
            bgColor="#ffffff"
            fgColor="#000000"
            role="img"
            aria-label="QR code to add Beautinique to your authenticator app"
          />
        </div>
      </div>
      <p className="text-sm">
        On this phone?{' '}
        <a href={uri} className={TEXT_LINK}>
          Open in your authenticator app
        </a>
      </p>
      <div className="space-y-2">
        <p className="text-sm">Can’t scan it? Type this key in the app instead:</p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="bg-surface-muted rounded-lg px-3 py-2 font-mono text-base tracking-wide break-all">
            {groupSecret(secret)}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void copy(secret).then((ok) => {
                if (!ok) {
                  toast({
                    tone: 'warning',
                    title: 'Copy did not work here.',
                    description: 'Select the key and copy it by hand.',
                  });
                }
              });
            }}
          >
            {copied ? 'Copied' : 'Copy key'}
          </Button>
        </div>
        <p role="status" className="sr-only">
          {copied ? 'Key copied.' : ''}
        </p>
      </div>
    </div>
  );
}

function Confirm({
  replacing,
  onBack,
  onRestart,
  onConfirmed,
}: {
  replacing: boolean;
  onBack: () => void;
  onRestart: (notice: string) => void;
  onConfirmed: (codes: string[]) => void;
}) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const form = useZodForm(confirmAuthenticator.input.body, {
    defaultValues: { code: '', password: '' },
  });
  return (
    <Form
      form={form}
      className="space-y-4"
      errorFields={{ TOTP_INVALID: 'code', PASSWORD_INVALID: 'password' }}
      onSubmit={async (body) => {
        let codes: string[];
        try {
          ({ recoveryCodes: codes } = await client.call(confirmAuthenticator, { body }));
        } catch (error) {
          // the key is gone (10 minutes, too many tries, or another tab saved one): a new one
          if (
            isApiError(error, 'AUTHENTICATOR_SETUP_EXPIRED') ||
            isApiError(error, 'AUTHENTICATOR_EXISTS')
          ) {
            onRestart(error.message);
            return;
          }
          throw error;
        }
        // the security page shows the authenticator on, with 10 codes
        void queryClient.invalidateQueries({ queryKey: queryKey(getMe) });
        onConfirmed(codes);
      }}
    >
      <p className="text-sm">
        Enter the 6-digit code the app shows for Beautinique, and your password to confirm.
      </p>
      <CodeField control={form.control} name="code" label="Authenticator code" autoFocus />
      <PasswordField
        control={form.control}
        name="password"
        label="Your password"
        autoComplete="current-password"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" tone="neutral" onClick={onBack}>
          Back
        </Button>
        <SubmitButton>{replacing ? 'Replace authenticator' : 'Turn on'}</SubmitButton>
      </div>
    </Form>
  );
}

function Failed({
  error,
  email,
  onRetry,
  cancel,
}: {
  error: unknown;
  email: string;
  onRetry: () => void;
  cancel: ReactNode;
}) {
  if (isApiError(error, 'PASSWORD_REQUIRED')) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm">
          {error.message}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {cancel}
          <TextLink
            to={authHref(AUTH_PATHS.forgotPassword, ACCOUNT_PATHS.authenticator)}
            state={{ email }}
          >
            Set a password
          </TextLink>
        </div>
      </div>
    );
  }
  const message = isApiError(error, 'STEP_UP_REQUIRED')
    ? 'To set up a new phone, first confirm it’s you with your current authenticator code or a recovery code.'
    : errorMessage(error);
  return (
    <div className="space-y-4">
      <p role="alert" className="text-sm">
        {message}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {cancel}
        <Button onClick={onRetry}>Try again</Button>
      </div>
    </div>
  );
}
