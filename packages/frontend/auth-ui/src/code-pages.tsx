import { useApiClient } from '@beautinique/frontend-api-client';
import {
  requestInvitationCode,
  requestPasswordCode,
  requestSignUpCode,
} from '@beautinique/shared-contracts';
import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import { type Challenge, CodeStep, type Verified } from './code-step';
import { EmailStep, type EmailStepValues, type LegalLinks } from './email-step';
import { AUTH_PATHS, authHref, NEXT_PARAM, safeNext } from './next';
import { useSession } from './session';

/** What the sign-in page is handed after an email-code page: the email, and a note why. */
export interface SignInState {
  email: string;
  notice: string;
}

/** The sign-in page's `state` from `location.state`, when another auth page left one. */
export function signInStateOf(state: unknown): Partial<SignInState> {
  if (typeof state !== 'object' || state === null) return {};
  const { email, notice } = state as Record<string, unknown>;
  return {
    ...(typeof email === 'string' ? { email } : {}),
    ...(typeof notice === 'string' ? { notice } : {}),
  };
}

type Step =
  { kind: 'email'; email: string } | { kind: 'code'; email: string; challenge: Challenge };

/**
 * After the code: signed in (a new account) → on to `next`; otherwise to sign-in with the email
 * filled in (in the page's state, never the URL) and a note of what happened. A new password ended
 * every session (`endedSessions`), this browser's too, even when it was signed in.
 */
function useAfterCode({ endedSessions = false } = {}) {
  const session = useSession();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const next = search.get(NEXT_PARAM);
  return async (verified: Verified, notice: string) => {
    if (verified.signedIn) {
      await session.signedIn();
      await navigate(safeNext(next), { replace: true });
      return;
    }
    if (endedSessions && session.state.status !== 'signed-out') session.forget();
    const state: SignInState = { email: verified.email, notice };
    await navigate(authHref(AUTH_PATHS.signIn, next), { replace: true, state });
  };
}

interface CodePageProps {
  legal?: LegalLinks;
}

/**
 * Sign-up, in the sign-up apps (contracts SIGN_UP_APPS): the email and the consent, then the
 * emailed code and a password. A new account is signed in; an email that has an account (the
 * answer tells only after the code proved the email) goes to sign-in.
 */
export function SignUpForm({ legal }: CodePageProps) {
  const client = useApiClient();
  const after = useAfterCode();
  const [step, setStep] = useState<Step>({ kind: 'email', email: '' });
  if (step.kind === 'email') {
    return (
      <EmailStep
        app={client.app}
        email={step.email}
        legal={legal}
        submitLabel="Send code"
        onSubmit={async (body: EmailStepValues) => {
          const challenge = await client.call(requestSignUpCode, { body });
          setStep({ kind: 'code', email: body.email, challenge });
        }}
      />
    );
  }
  return (
    <CodeStep
      email={step.email}
      challenge={step.challenge}
      submitLabel="Create account"
      onBack={() => {
        setStep({ kind: 'email', email: step.email });
      }}
      onVerified={(verified) =>
        after(
          verified,
          verified.outcome === 'password-set'
            ? 'Your password is set. Sign in with it.'
            : 'You already have an account with this email. Sign in with your password.',
        )
      }
    />
  );
}

/**
 * A forgotten (or a first) password, every app: the email, then the code and the new password.
 * Every session of the account ends with it (ARCHITECTURE §7.2), so the person signs in again.
 * An email without an account gets no email, and the same answer.
 */
export function ForgotPasswordForm() {
  const client = useApiClient();
  const after = useAfterCode({ endedSessions: true });
  // a signed-in person's own email (the security page hands it over, never in the URL)
  const handed = signInStateOf(useLocation().state).email ?? '';
  const [step, setStep] = useState<Step>({ kind: 'email', email: handed });
  if (step.kind === 'email') {
    return (
      <EmailStep
        app={client.app}
        email={step.email}
        consent={false}
        submitLabel="Send code"
        hint="We will email you a code to set a new password."
        onSubmit={async ({ email }: EmailStepValues) => {
          const challenge = await client.call(requestPasswordCode, { body: { email } });
          setStep({ kind: 'code', email, challenge });
        }}
      />
    );
  }
  return (
    <CodeStep
      email={step.email}
      challenge={step.challenge}
      submitLabel="Set password"
      passwordHint="Your new password: at least 12 characters. Every device you are signed in on will be signed out."
      onBack={() => {
        setStep({ kind: 'email', email: step.email });
      }}
      onVerified={(verified) =>
        after(
          verified,
          'Your password is set, and every device was signed out. Sign in with your new password.',
        )
      }
    />
  );
}

/**
 * Accepting an invitation (T3.3): the invited email (and the consent in a sign-up app), then the
 * code and a password. An account that has a password keeps it. Then sign-in, with the new role.
 */
export function InvitationForm({ legal }: CodePageProps) {
  const client = useApiClient();
  const after = useAfterCode();
  const [step, setStep] = useState<Step>({ kind: 'email', email: '' });
  if (step.kind === 'email') {
    return (
      <EmailStep
        app={client.app}
        email={step.email}
        legal={legal}
        submitLabel="Send code"
        hint="The email address the invitation was sent to."
        onSubmit={async (body: EmailStepValues) => {
          const challenge = await client.call(requestInvitationCode, { body });
          setStep({ kind: 'code', email: body.email, challenge });
        }}
      />
    );
  }
  return (
    <CodeStep
      email={step.email}
      challenge={step.challenge}
      submitLabel="Accept invitation"
      passwordHint="New to Beautinique? Choose a password of at least 12 characters. Have an account already? Enter its password: it stays as it is."
      onBack={() => {
        setStep({ kind: 'email', email: step.email });
      }}
      onVerified={(verified) => after(verified, 'Invitation accepted. Sign in to start.')}
    />
  );
}
