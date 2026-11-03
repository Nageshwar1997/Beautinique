import { ApiError, errorMessage, isApiError, useApiClient } from '@beautinique/frontend-api-client';
import { Button, Spinner, toast } from '@beautinique/frontend-components';
import {
  CodeField,
  Form,
  PasswordField,
  SubmitButton,
  TextField,
  useZodForm,
} from '@beautinique/frontend-forms';
import {
  confirmTotpEnroll,
  loginRecovery,
  loginTotp,
  passwordLogin,
  type RouteOutput,
  startTotpEnroll,
} from '@beautinique/shared-contracts';
import { plural } from '@beautinique/shared-utils';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import { Scan, StepFrame } from './authenticator-setup';
import { signInStateOf } from './code-pages';
import { TextLink } from './layout';
import { AUTH_PATHS, authHref, NEXT_PARAM, safeNext } from './next';
import { RecoveryCodes } from './recovery-codes';
import { useSession } from './session';

/** At or below this many recovery codes left, a sign-in with one says to get new ones. */
export const FEW_RECOVERY_CODES = 3;

type Step =
  | { kind: 'password'; notice?: ReactNode }
  | { kind: 'totp' | 'recovery'; loginId: string }
  | { kind: 'enroll'; loginId: string; email: string };

/** The sign-in answer has no loginId for its next step: the API broke its contract. */
const brokenAnswer = () =>
  new ApiError({
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong on our side. Please try again.',
    status: 500,
  });

export interface SignInFormProps {
  /** The email to start with (after setting a password, or "you already have an account"). */
  email?: string;
  /** A note above the form: "Your password is set ...". */
  notice?: ReactNode;
}

/**
 * Sign-in, every app (ARCHITECTURE §7.1): email and password, then the authenticator code where
 * the account has one (or one of its recovery codes). An app that needs an authenticator (the
 * internal apps) has an account without one set it up here first: the QR code, the first code,
 * the recovery codes. Signed in, the person goes on to `next`. A wrong email, a wrong password
 * and a locked account get the same answer.
 */
export function SignInForm(props: SignInFormProps) {
  // what another auth page handed over (the email, why), unless given
  const location = useLocation();
  const handed = signInStateOf(location.state);
  const email = props.email ?? handed.email ?? '';
  const first = (): Step => ({ kind: 'password', notice: props.notice ?? handed.notice });
  const [step, setStep] = useState<Step>(first);
  // a new visit while the page is open (signed out for being idle, say): start again, with its note
  const [visit, setVisit] = useState(location.key);
  if (visit !== location.key) {
    setVisit(location.key);
    setStep(first());
  }
  const session = useSession();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const next = search.get(NEXT_PARAM);

  const finish = async (recoveryCodesLeft?: number) => {
    await session.signedIn();
    if (recoveryCodesLeft !== undefined && recoveryCodesLeft <= FEW_RECOVERY_CODES) {
      toast({
        tone: 'warning',
        title: `${plural(recoveryCodesLeft, 'recovery code')} left`,
        description: 'Get new recovery codes in your account’s security settings.',
      });
    }
    await navigate(safeNext(next), { replace: true });
  };
  const expired = (error: unknown) => {
    if (!isApiError(error, 'LOGIN_EXPIRED')) return false;
    setStep({ kind: 'password', notice: error.message });
    return true;
  };

  if (step.kind === 'password') {
    return (
      <PasswordStep
        key={location.key}
        email={email}
        notice={step.notice}
        forgotHref={authHref(AUTH_PATHS.forgotPassword, next)}
        onStep={async (answer, typed) => {
          if (answer.next === 'signed-in') {
            await finish();
            return;
          }
          if (answer.loginId === undefined) throw brokenAnswer();
          setStep(
            answer.next === 'totp'
              ? { kind: 'totp', loginId: answer.loginId }
              : { kind: 'enroll', loginId: answer.loginId, email: typed },
          );
        }}
      />
    );
  }
  const back = () => {
    setStep({ kind: 'password' });
  };
  if (step.kind === 'enroll') {
    return (
      <EnrollStep
        loginId={step.loginId}
        email={step.email}
        onExpired={expired}
        onSignedIn={finish}
        onBack={back}
      />
    );
  }
  if (step.kind === 'totp') {
    return (
      <TotpStep
        loginId={step.loginId}
        onExpired={expired}
        onSignedIn={finish}
        onRecovery={() => {
          setStep({ kind: 'recovery', loginId: step.loginId });
        }}
        onBack={back}
      />
    );
  }
  return (
    <RecoveryStep
      loginId={step.loginId}
      onExpired={expired}
      onSignedIn={finish}
      onTotp={() => {
        setStep({ kind: 'totp', loginId: step.loginId });
      }}
      onBack={back}
    />
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

function PasswordStep({
  email,
  notice,
  forgotHref,
  onStep,
}: {
  email: string;
  notice: ReactNode;
  forgotHref: string;
  /** The answer, and the email as typed (the set-up's recovery codes file names it). */
  onStep: (answer: RouteOutput<typeof passwordLogin>, email: string) => Promise<void>;
}) {
  const client = useApiClient();
  const form = useZodForm(passwordLogin.input.body, { defaultValues: { email, password: '' } });
  return (
    <Form
      form={form}
      className="space-y-4"
      onSubmit={async (body) => {
        await onStep(await client.call(passwordLogin, { body }), body.email);
      }}
    >
      {notice !== undefined && <Notice>{notice}</Notice>}
      <TextField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
      />
      <div className="space-y-2">
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          autoComplete="current-password"
        />
        <p className="text-right text-sm">
          <TextLink to={forgotHref}>Forgot password?</TextLink>
        </p>
      </div>
      <SubmitButton fullWidth>Sign in</SubmitButton>
    </Form>
  );
}

interface SecondStepProps {
  loginId: string;
  /** true when it handled a gone sign-in (back to the password, with why) */
  onExpired: (error: unknown) => boolean;
  onSignedIn: (recoveryCodesLeft?: number) => Promise<void>;
  onBack: () => void;
}

function TotpStep({
  loginId,
  onExpired,
  onSignedIn,
  onRecovery,
  onBack,
}: SecondStepProps & { onRecovery: () => void }) {
  const client = useApiClient();
  const form = useZodForm(loginTotp.input.body, { defaultValues: { code: '' } });
  return (
    <div className="space-y-4">
      <p className="text-sm">
        Open your authenticator app and enter the 6-digit code for Beautinique.
      </p>
      <Form
        form={form}
        className="space-y-4"
        errorFields={{ TOTP_INVALID: 'code' }}
        onSubmit={async (body) => {
          try {
            await client.call(loginTotp, { params: { loginId }, body });
          } catch (error) {
            if (onExpired(error)) return;
            throw error;
          }
          await onSignedIn();
        }}
      >
        <CodeField control={form.control} name="code" label="Authenticator code" />
        <SubmitButton fullWidth>Continue</SubmitButton>
      </Form>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Start again
        </Button>
        <Button variant="ghost" size="sm" onClick={onRecovery}>
          Lost your phone? Use a recovery code
        </Button>
      </div>
    </div>
  );
}

function RecoveryStep({
  loginId,
  onExpired,
  onSignedIn,
  onTotp,
  onBack,
}: SecondStepProps & { onTotp: () => void }) {
  const client = useApiClient();
  const form = useZodForm(loginRecovery.input.body, { defaultValues: { code: '' } });
  return (
    <div className="space-y-4">
      <p className="text-sm">
        Enter one of the 10 recovery codes you saved when you set up the authenticator. Each code
        works once.
      </p>
      <Form
        form={form}
        className="space-y-4"
        errorFields={{ RECOVERY_CODE_INVALID: 'code' }}
        onSubmit={async (body) => {
          let left: number;
          try {
            ({ recoveryCodesLeft: left } = await client.call(loginRecovery, {
              params: { loginId },
              body,
            }));
          } catch (error) {
            if (onExpired(error)) return;
            throw error;
          }
          await onSignedIn(left);
        }}
      >
        <TextField
          control={form.control}
          name="code"
          label="Recovery code"
          hint="Like ABCDE-FGH23"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
        <SubmitButton fullWidth>Continue</SubmitButton>
      </Form>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Start again
        </Button>
        <Button variant="ghost" size="sm" onClick={onTotp}>
          Use the authenticator code
        </Button>
      </div>
    </div>
  );
}

type Enrolled = RouteOutput<typeof startTotpEnroll>;

type EnrollView =
  | { kind: 'starting' }
  | { kind: 'failed'; error: unknown }
  | ({ kind: 'scan' | 'confirm' } & Enrolled)
  | { kind: 'codes'; codes: string[] };

/**
 * The sign-in of an account without an authenticator, in an app that needs one (ARCHITECTURE
 * §7.1): 1. scan the QR code (or open the link, or type the key); 2. the first code, which saves
 * it; 3. the recovery codes, shown once, and only then on to the app. The password was checked
 * already, so it is not asked again. The sign-in waits 10 minutes; after that it starts again.
 */
function EnrollStep({
  loginId,
  email,
  onExpired,
  onSignedIn,
  onBack,
}: SecondStepProps & { email: string }) {
  const client = useApiClient();
  const [view, setView] = useState<EnrollView>({ kind: 'starting' });

  const start = useCallback(async () => {
    setView({ kind: 'starting' });
    try {
      setView({ kind: 'scan', ...(await client.call(startTotpEnroll, { params: { loginId } })) });
    } catch (error) {
      if (!onExpired(error)) setView({ kind: 'failed', error });
    }
  }, [client, loginId, onExpired]);

  // once per sign-in (a second call would replace the first key; StrictMode runs effects twice)
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void start();
  }, [start]);

  const startAgain = (
    <Button variant="ghost" size="sm" onClick={onBack}>
      Start again
    </Button>
  );

  switch (view.kind) {
    case 'starting':
      return (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner label="Getting a new key" />
        </div>
      );
    case 'failed':
      return (
        <div className="space-y-4">
          <p role="alert" className="text-sm">
            {errorMessage(view.error)}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {startAgain}
            <Button onClick={() => void start()}>Try again</Button>
          </div>
        </div>
      );
    case 'scan':
      return (
        <div className="space-y-6">
          <Notice>
            This app asks for a code from an authenticator app each time you sign in. Set one up
            now: it takes a minute.
          </Notice>
          <StepFrame number={1} title="Add Beautinique to your authenticator app">
            <Scan secret={view.secret} uri={view.uri} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              {startAgain}
              <Button
                onClick={() => {
                  setView({ ...view, kind: 'confirm' });
                }}
              >
                Next
              </Button>
            </div>
          </StepFrame>
        </div>
      );
    case 'confirm':
      return (
        <StepFrame number={2} title="Enter the code from the app">
          <EnrollConfirm
            loginId={loginId}
            onExpired={onExpired}
            onBack={() => {
              setView({ ...view, kind: 'scan' });
            }}
            onConfirmed={(codes) => {
              setView({ kind: 'codes', codes });
            }}
          />
        </StepFrame>
      );
    case 'codes':
      return (
        <StepFrame number={3} title="Save your recovery codes">
          <RecoveryCodes
            codes={view.codes}
            email={email}
            doneLabel="Continue"
            onDone={() => void onSignedIn()}
          />
        </StepFrame>
      );
  }
}

function EnrollConfirm({
  loginId,
  onExpired,
  onBack,
  onConfirmed,
}: {
  loginId: string;
  onExpired: (error: unknown) => boolean;
  onBack: () => void;
  onConfirmed: (codes: string[]) => void;
}) {
  const client = useApiClient();
  const form = useZodForm(confirmTotpEnroll.input.body, { defaultValues: { code: '' } });
  return (
    <Form
      form={form}
      className="space-y-4"
      errorFields={{ TOTP_INVALID: 'code' }}
      onSubmit={async (body) => {
        let codes: string[];
        try {
          // signed in from here (the cookies are set), but the codes come first: the session is
          // read again only after "Continue", so the page does not move on before they are saved
          ({ recoveryCodes: codes } = await client.call(confirmTotpEnroll, {
            params: { loginId },
            body,
          }));
        } catch (error) {
          if (onExpired(error)) return;
          throw error;
        }
        onConfirmed(codes);
      }}
    >
      <p className="text-sm">Enter the 6-digit code the app shows for Beautinique.</p>
      <CodeField control={form.control} name="code" label="Authenticator code" autoFocus />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" tone="neutral" onClick={onBack}>
          Back
        </Button>
        <SubmitButton>Turn on</SubmitButton>
      </div>
    </Form>
  );
}
