import { ApiError, isApiError, useApiClient } from '@beautinique/frontend-api-client';
import { Button, toast } from '@beautinique/frontend-components';
import {
  CodeField,
  Form,
  PasswordField,
  SubmitButton,
  TextField,
  useZodForm,
} from '@beautinique/frontend-forms';
import { loginRecovery, loginTotp, passwordLogin } from '@beautinique/shared-contracts';
import { plural } from '@beautinique/shared-utils';
import { type ReactNode, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import { signInStateOf } from './code-pages';
import { TextLink } from './layout';
import { AUTH_PATHS, authHref, NEXT_PARAM, safeNext } from './next';
import { useSession } from './session';

/** At or below this many recovery codes left, a sign-in with one says to get new ones. */
export const FEW_RECOVERY_CODES = 3;

type Step =
  { kind: 'password'; notice?: ReactNode } | { kind: 'totp' | 'recovery'; loginId: string };

export interface SignInFormProps {
  /** The email to start with (after setting a password, or "you already have an account"). */
  email?: string;
  /** A note above the form: "Your password is set ...". */
  notice?: ReactNode;
}

/**
 * Sign-in, every app (ARCHITECTURE §7.1): email and password, then the authenticator code where
 * the account has one (or one of its recovery codes). Signed in, the person goes on to `next`.
 * A wrong email, a wrong password and a locked account get the same answer.
 */
export function SignInForm(props: SignInFormProps) {
  // what another auth page handed over (the email, why), unless given
  const handed = signInStateOf(useLocation().state);
  const email = props.email ?? handed.email ?? '';
  const [step, setStep] = useState<Step>({
    kind: 'password',
    notice: props.notice ?? handed.notice,
  });
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
        email={email}
        notice={step.notice}
        forgotHref={authHref(AUTH_PATHS.forgotPassword, next)}
        onStep={async (answer) => {
          if (answer.next === 'signed-in') await finish();
          else if (answer.next === 'totp' && answer.loginId !== undefined) {
            setStep({ kind: 'totp', loginId: answer.loginId });
          } else {
            throw new ApiError({
              code: 'AUTHENTICATOR_SETUP_NEEDED',
              message: 'This account needs an authenticator app before it can sign in here.',
              status: 400,
            });
          }
        }}
      />
    );
  }
  const back = () => {
    setStep({ kind: 'password' });
  };
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
  onStep: (answer: { next: string; loginId?: string | undefined }) => Promise<void>;
}) {
  const client = useApiClient();
  const form = useZodForm(passwordLogin.input.body, { defaultValues: { email, password: '' } });
  return (
    <Form
      form={form}
      className="space-y-4"
      onSubmit={async (body) => {
        await onStep(await client.call(passwordLogin, { body }));
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
